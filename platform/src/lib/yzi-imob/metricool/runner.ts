import "server-only";

import type {
  MetricoolCredentials,
  MetricoolMetric,
  MetricoolNetwork,
  SocialPublicationAsset,
} from "./types.ts";
import type { MetricoolTransport } from "./transport.ts";

export type MetricoolJobOperation = "publish" | "status_sync" | "cancel" | "metrics_sync";

export type ClaimedMetricoolJob = {
  jobId: string;
  tenantId: string;
  socialPublicationId: string;
  operation: MetricoolJobOperation;
  attemptCount: number;
  maxAttempts: number;
  credentials: MetricoolCredentials;
  targetNetworks: readonly MetricoolNetwork[];
  targetProfileIds: readonly string[];
  format: "single_image" | "carousel";
  caption: string;
  assets: readonly SocialPublicationAsset[];
  scheduledAt: string;
  externalPostId: string | null;
  externalPostUuid: string | null;
  externalNetworkPostIds: Readonly<Partial<Record<MetricoolNetwork, string>>>;
};

export type CompleteMetricoolJobInput = {
  jobId: string;
  outcome: "accepted" | "scheduled" | "publishing" | "published" | "cancelled" | "failed";
  externalPostId?: string;
  externalPostUuid?: string | null;
  externalNetworkPostIds?: Readonly<Partial<Record<MetricoolNetwork, string>>>;
  externalUrl?: string | null;
  errorCode?: string;
  retryAt?: string;
};

export type MetricoolJobStore = {
  claimJobs(limit: number): Promise<readonly ClaimedMetricoolJob[]>;
  completeJob(input: CompleteMetricoolJobInput): Promise<void>;
  persistMetrics(jobId: string, metrics: readonly MetricoolMetric[]): Promise<void>;
};

export type MetricoolRunnerResult = {
  status: "idle" | "completed";
  claimed: number;
  succeeded: number;
  failed: number;
};

export type MetricoolTransportFactory = (
  credentials: MetricoolCredentials,
) => MetricoolTransport;

export async function runMetricoolJobBatch(input: {
  store: MetricoolJobStore;
  transportFactory: MetricoolTransportFactory;
  batchSize?: number;
  now?: Date;
}): Promise<MetricoolRunnerResult> {
  const batchSize = clampBatchSize(input.batchSize ?? 5);
  const jobs = await input.store.claimJobs(batchSize);
  if (!jobs.length) {
    return { status: "idle", claimed: 0, succeeded: 0, failed: 0 };
  }

  let succeeded = 0;
  let failed = 0;
  for (const job of jobs) {
    const transport = input.transportFactory(job.credentials);
    const completed = await processJob(job, transport, input.store, input.now ?? new Date());
    if (completed) succeeded += 1;
    else failed += 1;
  }

  return {
    status: "completed",
    claimed: jobs.length,
    succeeded,
    failed,
  };
}

async function processJob(
  job: ClaimedMetricoolJob,
  transport: MetricoolTransport,
  store: MetricoolJobStore,
  now: Date,
): Promise<boolean> {
  try {
    switch (job.operation) {
      case "publish":
        return await publish(job, transport, store, now);
      case "status_sync":
        return await syncStatus(job, transport, store, now);
      case "cancel":
        return await cancel(job, transport, store, now);
      case "metrics_sync":
        return await syncMetrics(job, transport, store, now);
    }
  } catch {
    await store.completeJob({
      jobId: job.jobId,
      outcome: "failed",
      errorCode: "runner_unavailable",
      retryAt: retryAt(job, now),
    });
    return false;
  }
}

async function publish(
  job: ClaimedMetricoolJob,
  transport: MetricoolTransport,
  store: MetricoolJobStore,
  now: Date,
): Promise<boolean> {
  const response = await transport.createScheduledPost({
    networks: job.targetNetworks,
    text: job.caption,
    media: job.assets,
    scheduledAt: job.scheduledAt,
    timezone: "America/Sao_Paulo",
  });
  if (response.status === "error") {
    await completeFailure(job, response.error.code, response.error.retryable, store, now);
    return false;
  }

  await store.completeJob({
    jobId: job.jobId,
    outcome: "accepted",
    externalPostId: response.value.externalPostId,
    externalPostUuid: response.value.externalPostUuid,
    externalNetworkPostIds: response.value.externalNetworkPostIds,
    externalUrl: response.value.publicUrl,
  });
  return true;
}

async function syncStatus(
  job: ClaimedMetricoolJob,
  transport: MetricoolTransport,
  store: MetricoolJobStore,
  now: Date,
): Promise<boolean> {
  if (!job.externalPostId) {
    await completeFailure(job, "external_post_missing", false, store, now);
    return false;
  }
  const response = await transport.getPostStatus(job.externalPostId);
  if (response.status === "error") {
    await completeFailure(job, response.error.code, response.error.retryable, store, now);
    return false;
  }

  if (response.value.state === "error") {
    await completeFailure(job, "provider_post_failed", false, store, now);
    return false;
  }

  const outcome =
    response.value.state === "published"
      ? "published"
      : response.value.state === "publishing"
        ? "publishing"
        : "scheduled";
  await store.completeJob({
    jobId: job.jobId,
    outcome,
    externalPostId: response.value.externalPostId,
    externalPostUuid: response.value.externalPostUuid,
    externalNetworkPostIds: response.value.externalNetworkPostIds,
    externalUrl: response.value.publicUrl,
    retryAt:
      outcome === "scheduled" || outcome === "publishing"
        ? new Date(now.getTime() + 5 * 60 * 1000).toISOString()
        : undefined,
  });
  return true;
}

async function cancel(
  job: ClaimedMetricoolJob,
  transport: MetricoolTransport,
  store: MetricoolJobStore,
  now: Date,
): Promise<boolean> {
  if (job.externalPostId) {
    const response = await transport.cancelScheduledPost(job.externalPostId);
    if (response.status === "error") {
      await completeFailure(job, response.error.code, response.error.retryable, store, now);
      return false;
    }
  }
  await store.completeJob({ jobId: job.jobId, outcome: "cancelled" });
  return true;
}

async function syncMetrics(
  job: ClaimedMetricoolJob,
  transport: MetricoolTransport,
  store: MetricoolJobStore,
  now: Date,
): Promise<boolean> {
  if (!job.externalPostId) {
    await completeFailure(job, "external_post_missing", false, store, now);
    return false;
  }

  const period = {
    from: new Date(Math.min(Date.parse(job.scheduledAt), now.getTime()) - 24 * 60 * 60 * 1000)
      .toISOString(),
    to: now.toISOString(),
    timezone: "America/Sao_Paulo",
  };
  const metrics: MetricoolMetric[] = [];

  for (let index = 0; index < job.targetNetworks.length; index += 1) {
    const network = job.targetNetworks[index];
    const profileId = job.targetProfileIds[index];
    const networkPostId = job.externalNetworkPostIds[network] ?? job.externalPostId;
    const [postResult, profileResult] = await Promise.all([
      transport.getPostMetrics(network, networkPostId, period),
      transport.getProfileMetrics(network, profileId, period),
    ]);
    if (postResult.status === "error") {
      await completeFailure(job, postResult.error.code, postResult.error.retryable, store, now);
      return false;
    }
    if (profileResult.status === "error") {
      await completeFailure(job, profileResult.error.code, profileResult.error.retryable, store, now);
      return false;
    }
    metrics.push(...postResult.value, ...profileResult.value);
  }

  await store.persistMetrics(job.jobId, metrics);
  return true;
}

async function completeFailure(
  job: ClaimedMetricoolJob,
  code: string,
  retryable: boolean,
  store: MetricoolJobStore,
  now: Date,
): Promise<void> {
  await store.completeJob({
    jobId: job.jobId,
    outcome: "failed",
    errorCode: sanitizeErrorCode(code),
    retryAt: retryable ? retryAt(job, now) : undefined,
  });
}

function retryAt(job: ClaimedMetricoolJob, now: Date): string | undefined {
  if (job.attemptCount >= job.maxAttempts) return undefined;
  const delayMinutes = Math.min(60, 2 ** Math.max(0, job.attemptCount - 1) * 5);
  return new Date(now.getTime() + delayMinutes * 60 * 1000).toISOString();
}

function sanitizeErrorCode(value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 80);
  return normalized || "provider_error";
}

function clampBatchSize(value: number): number {
  if (!Number.isInteger(value)) return 5;
  return Math.min(10, Math.max(1, value));
}
