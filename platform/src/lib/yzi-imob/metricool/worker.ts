import "server-only";

import {
  claimMetricoolValidations,
  completeMetricoolValidation,
  PostgresMetricoolJobStore,
  recoverMetricoolJobs,
} from "./database.ts";
import { runMetricoolJobBatch, type MetricoolTransportFactory } from "./runner.ts";
import { OfficialMetricoolHttpTransport } from "./transport.ts";

export type MetricoolWorkerIterationResult = {
  status: "idle" | "completed" | "configuration_missing" | "error";
  validationsClaimed: number;
  validationsSucceeded: number;
  validationsFailed: number;
  publicationJobsClaimed: number;
  publicationJobsSucceeded: number;
  publicationJobsFailed: number;
};

export async function runMetricoolWorkerIteration(input: {
  validationLimit?: number;
  publicationLimit?: number;
  transportFactory?: MetricoolTransportFactory;
} = {}): Promise<MetricoolWorkerIterationResult> {
  const transportFactory =
    input.transportFactory ??
    ((credentials) => new OfficialMetricoolHttpTransport({ credentials }));
  try {
    await recoverMetricoolJobs();
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
    const claimed = validations.length + publicationResult.claimed;
    return {
      status: claimed ? "completed" : "idle",
      validationsClaimed: validations.length,
      validationsSucceeded,
      validationsFailed,
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
