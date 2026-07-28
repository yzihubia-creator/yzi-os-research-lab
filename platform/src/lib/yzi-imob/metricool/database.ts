import "server-only";

import postgres from "postgres";

import type {
  MetricoolCapability,
  MetricoolMetric,
  MetricoolNetwork,
  MetricoolTargetProfile,
  SocialPublicationAsset,
} from "./types.ts";
import type {
  ClaimedMetricoolJob,
  CompleteMetricoolJobInput,
  MetricoolJobOperation,
  MetricoolJobStore,
} from "./runner.ts";

const METRICOOL_RUNTIME_ROLE = "yzi_imob_metricool_runtime";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Sql = ReturnType<typeof postgres>;
type JsonRecord = Record<string, unknown>;
type IdentityRow = { current_user_name: string; session_user_name: string };

export type ClaimedMetricoolValidation = {
  connectionId: string;
  tenantId: string;
  credentials: {
    userId: string;
    blogId: string;
    apiToken: string;
  };
};

export type CompleteMetricoolValidationInput =
  | {
      connectionId: string;
      outcome: "active";
      displayName: string;
      capabilities: readonly MetricoolCapability[];
      profiles: readonly MetricoolTargetProfile[];
    }
  | {
      connectionId: string;
      outcome: "token_invalid" | "plan_insufficient" | "rate_limited" | "failed";
      errorCode: string;
    };

let runtimeSql: Sql | null = null;
let identityVerified = false;

export async function claimMetricoolValidations(
  limit = 2,
): Promise<readonly ClaimedMetricoolValidation[]> {
  const sql = await getVerifiedRuntimeSql();
  const boundedLimit = Math.min(5, Math.max(1, Math.trunc(limit)));
  const rows = await sql.unsafe<JsonRecord[]>(
    "select * from yzi_imob_metricool_private.claim_yzi_imob_metricool_validations($1)",
    [boundedLimit],
  );
  return rows.map(parseClaimedValidation).filter(
    (row): row is ClaimedMetricoolValidation => row !== null,
  );
}

export async function recoverMetricoolJobs(input: {
  processingTimeoutSeconds?: number;
  limit?: number;
} = {}): Promise<number> {
  const sql = await getVerifiedRuntimeSql();
  const timeoutSeconds = Math.min(
    86_400,
    Math.max(60, Math.trunc(input.processingTimeoutSeconds ?? 900)),
  );
  const limit = Math.min(50, Math.max(1, Math.trunc(input.limit ?? 10)));
  const rows = await sql.unsafe<{ recovered_count: number }[]>(
    "select * from yzi_imob_metricool_private.recover_yzi_imob_metricool_jobs($1, $2)",
    [timeoutSeconds, limit],
  );
  return readInteger(rows[0]?.recovered_count) ?? 0;
}

export async function completeMetricoolValidation(
  input: CompleteMetricoolValidationInput,
): Promise<void> {
  const sql = await getVerifiedRuntimeSql();
  const profiles = input.outcome === "active"
    ? input.profiles.map((profile) => ({
        id: profile.id,
        network: profile.network,
        display_name: profile.displayName,
      }))
    : [];
  await sql.unsafe(
    `select * from yzi_imob_metricool_private.complete_yzi_imob_metricool_validation(
      $1, $2, $3, $4::text[], $5::jsonb, $6
    )`,
    [
      input.connectionId,
      input.outcome,
      input.outcome === "active" ? input.displayName : null,
      input.outcome === "active" ? [...input.capabilities] : [],
      JSON.stringify(profiles),
      input.outcome === "active" ? null : sanitizeErrorCode(input.errorCode),
    ],
  );
}

export class PostgresMetricoolJobStore implements MetricoolJobStore {
  async claimJobs(limit: number): Promise<readonly ClaimedMetricoolJob[]> {
    const sql = await getVerifiedRuntimeSql();
    const rows = await sql.unsafe<JsonRecord[]>(
      "select * from yzi_imob_metricool_private.claim_yzi_imob_metricool_jobs($1)",
      [Math.min(10, Math.max(1, Math.trunc(limit)))],
    );
    return rows.map(parseClaimedJob).filter(
      (job): job is ClaimedMetricoolJob => job !== null,
    );
  }

  async completeJob(input: CompleteMetricoolJobInput): Promise<void> {
    const sql = await getVerifiedRuntimeSql();
    await sql.unsafe(
      `select * from yzi_imob_metricool_private.complete_yzi_imob_metricool_job(
        $1, $2, $3, $4, $5::jsonb, $6, $7, $8::timestamptz
      )`,
      [
        input.jobId,
        input.outcome,
        input.externalPostId ?? null,
        input.externalPostUuid ?? null,
        input.externalNetworkPostIds
          ? JSON.stringify(input.externalNetworkPostIds)
          : null,
        input.externalUrl ?? null,
        input.errorCode ? sanitizeErrorCode(input.errorCode) : null,
        input.retryAt ?? null,
      ],
    );
  }

  async persistMetrics(jobId: string, metrics: readonly MetricoolMetric[]): Promise<void> {
    const sql = await getVerifiedRuntimeSql();
    const payload = metrics.map((metric) => ({
      network: metric.network,
      metric_scope: metric.scope,
      target_profile_id: metric.targetProfileId,
      provider_metric_name: metric.providerMetricName,
      normalized_metric_name: metric.normalizedMetricName,
      value: metric.value,
      period_start: metric.periodStart,
      period_end: metric.periodEnd,
    }));
    await sql.unsafe(
      "select * from yzi_imob_metricool_private.persist_yzi_imob_metricool_metrics($1, $2::jsonb)",
      [jobId, JSON.stringify(payload)],
    );
  }
}

export async function closeMetricoolRuntimeDatabase(): Promise<void> {
  const sql = runtimeSql;
  runtimeSql = null;
  identityVerified = false;
  if (sql) await sql.end({ timeout: 5 }).catch(() => {});
}

async function getVerifiedRuntimeSql(): Promise<Sql> {
  if (!runtimeSql) {
    runtimeSql = postgres(readRuntimeDatabaseUrl(), {
      max: 2,
      prepare: false,
      connect_timeout: 5,
      idle_timeout: 20,
      max_lifetime: 60 * 10,
    });
  }

  if (!identityVerified) {
    const sql = runtimeSql;
    try {
      const rows = await sql<IdentityRow[]>`
        select current_user as current_user_name, session_user as session_user_name
      `;
      if (
        rows[0]?.current_user_name !== METRICOOL_RUNTIME_ROLE ||
        rows[0]?.session_user_name !== METRICOOL_RUNTIME_ROLE
      ) {
        throw new Error("metricool_runtime_identity_invalid");
      }
      identityVerified = true;
    } catch {
      runtimeSql = null;
      await sql.end({ timeout: 5 }).catch(() => {});
      throw new Error("metricool_runtime_configuration_unavailable");
    }
  }

  return runtimeSql;
}

function readRuntimeDatabaseUrl(): string {
  const connectionString = process.env.YZI_IMOB_METRICOOL_DATABASE_URL?.trim();
  if (!connectionString) throw new Error("metricool_runtime_configuration_unavailable");

  try {
    const url = new URL(connectionString);
    const loginRole = decodeURIComponent(url.username).split(".", 1)[0];
    const sslMode = url.searchParams.get("sslmode");
    if (
      !["postgres:", "postgresql:"].includes(url.protocol) ||
      loginRole !== METRICOOL_RUNTIME_ROLE ||
      !url.password ||
      !url.hostname ||
      (process.env.NODE_ENV === "production" && sslMode !== "require")
    ) {
      throw new Error("invalid");
    }
  } catch {
    throw new Error("metricool_runtime_configuration_unavailable");
  }
  return connectionString;
}

function parseClaimedValidation(row: JsonRecord): ClaimedMetricoolValidation | null {
  const connectionId = readUuid(row.connection_id);
  const tenantId = readUuid(row.tenant_id);
  const userId = readIdentifier(row.external_user_id);
  const blogId = readIdentifier(row.external_blog_id);
  const apiToken = readSecret(row.api_token);
  return connectionId && tenantId && userId && blogId && apiToken
    ? { connectionId, tenantId, credentials: { userId, blogId, apiToken } }
    : null;
}

function parseClaimedJob(row: JsonRecord): ClaimedMetricoolJob | null {
  const operation = readOperation(row.operation);
  const networks = readNetworks(row.target_networks);
  const profiles = readStringArray(row.target_profile_ids);
  const assets = readAssets(row.asset_references);
  const jobId = readUuid(row.job_id);
  const tenantId = readUuid(row.tenant_id);
  const socialPublicationId = readUuid(row.social_publication_id);
  const userId = readIdentifier(row.external_user_id);
  const blogId = readIdentifier(row.external_blog_id);
  const apiToken = readSecret(row.api_token);
  const scheduledAt = readDate(row.scheduled_at);
  if (
    !jobId ||
    !tenantId ||
    !socialPublicationId ||
    !operation ||
    networks.length < 1 ||
    networks.length !== profiles.length ||
    assets.length < 1 ||
    !userId ||
    !blogId ||
    !apiToken ||
    !scheduledAt
  ) {
    return null;
  }
  return {
    jobId,
    tenantId,
    socialPublicationId,
    operation,
    attemptCount: readInteger(row.attempt_count) ?? 1,
    maxAttempts: readInteger(row.max_attempts) ?? 3,
    credentials: { userId, blogId, apiToken },
    targetNetworks: networks,
    targetProfileIds: profiles,
    format: row.publication_format === "carousel" ? "carousel" : "single_image",
    caption: readCaption(row.caption) ?? "",
    assets,
    scheduledAt,
    externalPostId: readIdentifier(row.external_post_id),
    externalPostUuid: readIdentifier(row.external_post_uuid),
    externalNetworkPostIds: readNetworkPostIds(row.external_network_post_ids),
  };
}

function readAssets(value: unknown): readonly SocialPublicationAsset[] {
  return asArray(value).map(asRecord).flatMap((row) => {
    const mediaId = readUuid(row?.media_id);
    const url = readHttpsUrl(row?.url);
    const sortOrder = readInteger(row?.sort_order);
    if (!mediaId || !url || sortOrder === null) return [];
    return [{
      mediaId,
      url,
      altText: readCaption(row?.alt_text),
      sortOrder,
    }];
  });
}

function readNetworkPostIds(
  value: unknown,
): Readonly<Partial<Record<MetricoolNetwork, string>>> {
  const row = asRecord(value);
  if (!row) return {};
  return {
    ...(readIdentifier(row.instagram) ? { instagram: readIdentifier(row.instagram)! } : {}),
    ...(readIdentifier(row.facebook) ? { facebook: readIdentifier(row.facebook)! } : {}),
  };
}

function readNetworks(value: unknown): readonly MetricoolNetwork[] {
  return readStringArray(value).filter(
    (network): network is MetricoolNetwork =>
      network === "instagram" || network === "facebook",
  );
}

function readOperation(value: unknown): MetricoolJobOperation | null {
  return value === "publish" ||
    value === "status_sync" ||
    value === "cancel" ||
    value === "metrics_sync"
    ? value
    : null;
}

function sanitizeErrorCode(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 80) || "provider_error";
}

function readStringArray(value: unknown): string[] {
  return asArray(value).filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
}

function readCaption(value: unknown): string | null {
  return typeof value === "string" && value.length <= 2200 ? value : null;
}

function readSecret(value: unknown): string | null {
  return typeof value === "string" && value.trim().length >= 8 ? value : null;
}

function readIdentifier(value: unknown): string | null {
  return typeof value === "string" && /^[A-Za-z0-9_.:@/-]{1,160}$/.test(value)
    ? value
    : null;
}

function readUuid(value: unknown): string | null {
  return typeof value === "string" && UUID_RE.test(value) ? value : null;
}

function readDate(value: unknown): string | null {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const timestamp = Date.parse(String(value));
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function readInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function readHttpsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? value : null;
  } catch {
    return null;
  }
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
