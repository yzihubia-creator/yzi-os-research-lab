import "server-only";

import {
  claimMetricoolValidations,
  claimMetricoolDiscoveries,
  completeMetricoolDiscovery,
  completeMetricoolValidation,
  PostgresMetricoolJobStore,
  recoverMetricoolJobs,
} from "./database.ts";
import {
  DeterministicFakeMetricoolDiscoveryTransport,
  DeterministicFakeMetricoolTransport,
} from "./fake-transport.ts";
import { runMetricoolJobBatch, type MetricoolTransportFactory } from "./runner.ts";
import {
  OfficialMetricoolDiscoveryTransport,
  OfficialMetricoolHttpTransport,
  type MetricoolDiscoveryTransport,
} from "./transport.ts";

export type SocialTransportMode = "fake" | "real";

export type MetricoolWorkerIterationResult = {
  status: "idle" | "completed" | "configuration_missing" | "error";
  validationsClaimed: number;
  validationsSucceeded: number;
  validationsFailed: number;
  discoveriesClaimed: number;
  discoveriesSucceeded: number;
  discoveriesFailed: number;
  publicationJobsClaimed: number;
  publicationJobsSucceeded: number;
  publicationJobsFailed: number;
};

export async function runMetricoolWorkerIteration(input: {
  validationLimit?: number;
  publicationLimit?: number;
  transportFactory?: MetricoolTransportFactory;
  transportMode?: SocialTransportMode;
  allowRealTransport?: boolean;
  discoveryTransportFactory?: (credentials: { apiToken: string }) => MetricoolDiscoveryTransport;
} = {}): Promise<MetricoolWorkerIterationResult> {
  const transportMode = input.transportMode ?? "real";
  if (
    transportMode === "real" &&
    !input.transportFactory &&
    input.allowRealTransport !== true
  ) {
    return {
      status: "configuration_missing",
      validationsClaimed: 0,
      validationsSucceeded: 0,
      validationsFailed: 0,
      discoveriesClaimed: 0,
      discoveriesSucceeded: 0,
      discoveriesFailed: 0,
      publicationJobsClaimed: 0,
      publicationJobsSucceeded: 0,
      publicationJobsFailed: 0,
    };
  }
  const transportFactory =
    input.transportFactory ??
    (transportMode === "real"
      ? ((credentials) => new OfficialMetricoolHttpTransport({ credentials }))
      : (() => new DeterministicFakeMetricoolTransport()));
  try {
    await recoverMetricoolJobs();
    const discoveryTransportFactory = input.discoveryTransportFactory ??
      (transportMode === "real"
        ? ((credentials: { apiToken: string }) =>
            new OfficialMetricoolDiscoveryTransport({ credentials }))
        : (() => new DeterministicFakeMetricoolDiscoveryTransport()));
    const discoveries = await claimMetricoolDiscoveries(input.validationLimit ?? 2);
    let discoveriesSucceeded = 0;
    let discoveriesFailed = 0;
    for (const discovery of discoveries) {
      const response = await discoveryTransportFactory(discovery.credentials).discoverAccounts();
      if (response.status === "ok") {
        await completeMetricoolDiscovery({
          connectionId: discovery.connectionId,
          outcome: "ok",
          accounts: response.value,
        });
        discoveriesSucceeded += 1;
      } else {
        await completeMetricoolDiscovery({
          connectionId: discovery.connectionId,
          outcome: "error",
          errorCode: response.error.code,
        });
        discoveriesFailed += 1;
      }
    }
    const validations = await claimMetricoolValidations(input.validationLimit ?? 2);
    let validationsSucceeded = 0;
    let validationsFailed = 0;

    for (const validation of validations) {
      const transport = transportFactory(validation.credentials);
      const response = await transport.validateConnection();
      if (response.status === "ok") {
        await completeMetricoolValidation({
          connectionId: validation.connectionId,
          outcome: "active",
          displayName: response.value.displayName,
          capabilities: response.value.capabilities,
          profiles: response.value.profiles,
        });
        validationsSucceeded += 1;
      } else {
        await completeMetricoolValidation({
          connectionId: validation.connectionId,
          outcome: mapValidationOutcome(response.error.code),
          errorCode: response.error.code,
        });
        validationsFailed += 1;
      }
    }

    const publicationResult = await runMetricoolJobBatch({
      store: new PostgresMetricoolJobStore(),
      transportFactory,
      batchSize: input.publicationLimit ?? 5,
    });
    const claimed = discoveries.length + validations.length + publicationResult.claimed;
    return {
      status: claimed ? "completed" : "idle",
      validationsClaimed: validations.length,
      validationsSucceeded,
      validationsFailed,
      discoveriesClaimed: discoveries.length,
      discoveriesSucceeded,
      discoveriesFailed,
      publicationJobsClaimed: publicationResult.claimed,
      publicationJobsSucceeded: publicationResult.succeeded,
      publicationJobsFailed: publicationResult.failed,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return {
      status: message === "metricool_runtime_configuration_unavailable"
        ? "configuration_missing"
        : "error",
      validationsClaimed: 0,
      validationsSucceeded: 0,
      validationsFailed: 0,
      discoveriesClaimed: 0,
      discoveriesSucceeded: 0,
      discoveriesFailed: 0,
      publicationJobsClaimed: 0,
      publicationJobsSucceeded: 0,
      publicationJobsFailed: 0,
    };
  }
}

function mapValidationOutcome(
  code: string,
): "token_invalid" | "plan_insufficient" | "rate_limited" | "failed" {
  if (code === "token_invalid" || code === "plan_insufficient" || code === "rate_limited") {
    return code;
  }
  return "failed";
}
