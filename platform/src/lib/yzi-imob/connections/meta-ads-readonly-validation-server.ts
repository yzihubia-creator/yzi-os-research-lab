import "server-only";

import postgres from "postgres";

import {
  classifyMetaAdsReadonlyPostgresFailure,
  readMetaAdsReadonlyConfig,
  validateMetaAdsReadonlyConnection,
  type MetaAdsReadonlyFailureCode,
  type MetaAdsReadonlyRpcClient,
  type MetaAdsReadonlyRpcError,
  type MetaAdsReadonlyRpcName,
  type MetaAdsReadonlyValidationResult,
} from "./meta-ads-readonly-validation.ts";

const META_ADS_VALIDATION_DATABASE_ROLE = "yzi_meta_ads_validation_runtime";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let validationSql: ReturnType<typeof postgres> | null = null;

function readValidationDatabaseUrl(): string {
  const connectionString = process.env.META_ADS_VALIDATION_DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("Meta Ads validation server configuration is unavailable.");
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("Meta Ads validation server configuration is unavailable.");
  }

  const loginRole = decodeURIComponent(url.username).split(".", 1)[0];
  const sslMode = url.searchParams.get("sslmode");
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    loginRole !== META_ADS_VALIDATION_DATABASE_ROLE ||
    !url.password ||
    !url.hostname ||
    (process.env.NODE_ENV === "production" && sslMode !== "require")
  ) {
    throw new Error("Meta Ads validation server configuration is unavailable.");
  }

  return connectionString;
}

function getValidationSql(): ReturnType<typeof postgres> {
  if (!validationSql) {
    validationSql = postgres(readValidationDatabaseUrl(), {
      max: 1,
      prepare: false,
      connect_timeout: 5,
      idle_timeout: 20,
      max_lifetime: 60 * 10,
    });
  }
  return validationSql;
}

function toRpcError(
  rpcName: MetaAdsReadonlyRpcName,
  error: unknown,
): MetaAdsReadonlyRpcError {
  const unsafeCode =
    error && typeof error === "object" && "code" in error
      ? (error as { code?: unknown }).code
      : undefined;
  const unsafeConstraintName =
    error && typeof error === "object" && "constraint_name" in error
      ? (error as { constraint_name?: unknown }).constraint_name
      : undefined;
  const postgresCode =
    typeof unsafeCode === "string" && /^[A-Z0-9]{5}$/.test(unsafeCode)
      ? unsafeCode
      : undefined;
  const constraintName =
    typeof unsafeConstraintName === "string" &&
    /^[A-Za-z0-9_]{1,128}$/.test(unsafeConstraintName)
      ? unsafeConstraintName
      : undefined;
  return {
    code: postgresCode,
    rpcName,
    ...(postgresCode ? { postgresCode } : {}),
    ...(constraintName ? { constraintName } : {}),
    failureClass: classifyMetaAdsReadonlyPostgresFailure(postgresCode),
    message: "Meta Ads validation database operation failed.",
  };
}

function getMetaAdsReadonlyRpcClient(): MetaAdsReadonlyRpcClient {
  const sql = getValidationSql();
  return {
    async getValidationContext(connectionId) {
      try {
        const data = await sql`
          select connection_id, tenant_id, meta_ads_readonly_secret
          from yzi_meta_ads_private.get_meta_ads_readonly_validation_context(
            ${connectionId}::uuid
          )
        `;
        return { data, error: null };
      } catch (error) {
        return {
          data: null,
          error: toRpcError("get_meta_ads_readonly_validation_context", error),
        };
      }
    },

    async completeValidation(input) {
      try {
        const data = await sql`
          select asset_id, connection_status, validated_at
          from yzi_meta_ads_private.complete_meta_ads_readonly_validation(
            ${input.connectionId}::uuid,
            ${input.debugTokenValid}::boolean,
            ${input.debugAppId}::text,
            ${input.grantedScopes}::text[],
            ${input.externalId}::text,
            ${input.externalAccountId}::text,
            ${input.label}::text,
            ${input.accountStatus}::integer,
            ${input.currency}::text,
            ${input.timezoneName}::text
          )
        `;
        return { data, error: null };
      } catch (error) {
        return {
          data: null,
          error: toRpcError("complete_meta_ads_readonly_validation", error),
        };
      }
    },

    async failValidation(
      connectionId: string,
      failureCode: MetaAdsReadonlyFailureCode,
    ) {
      try {
        await sql`
          select connection_status, failure_code, failed_at
          from yzi_meta_ads_private.fail_meta_ads_readonly_validation(
            ${connectionId}::uuid,
            ${failureCode}::text
          )
        `;
        return { error: null };
      } catch (error) {
        return { error: toRpcError("fail_meta_ads_readonly_validation", error) };
      }
    },
  };
}

export type MetaAdsReadonlyBootstrapResult =
  | {
      status: "ok";
      connectionId: string;
      connectionAction: "created" | "reset_pending_validation" | "unchanged";
      connectionStatus: string;
    }
  | { status: "error"; code: "invalid_input" | "configuration_unavailable" | "bootstrap_failed" };

export async function bootstrapMetaAdsReadonlyConnection(input: {
  tenantId: string;
  vaultSecretId: string;
}): Promise<MetaAdsReadonlyBootstrapResult> {
  if (!UUID_RE.test(input.tenantId) || !UUID_RE.test(input.vaultSecretId)) {
    return { status: "error", code: "invalid_input" };
  }

  try {
    const sql = getValidationSql();
    const data = await sql`
      select connection_id, connection_action, connection_status
      from yzi_meta_ads_private.bootstrap_meta_ads_readonly_connection(
        ${input.tenantId}::uuid,
        ${input.vaultSecretId}::uuid
      )
    `;
    const row = data[0];
    if (
      !row ||
      typeof row.connection_id !== "string" ||
      !UUID_RE.test(row.connection_id) ||
      !["created", "reset_pending_validation", "unchanged"].includes(
        row.connection_action,
      ) ||
      typeof row.connection_status !== "string"
    ) {
      return { status: "error", code: "bootstrap_failed" };
    }
    return {
      status: "ok",
      connectionId: row.connection_id,
      connectionAction: row.connection_action as
        | "created"
        | "reset_pending_validation"
        | "unchanged",
      connectionStatus: row.connection_status,
    };
  } catch {
    return { status: "error", code: "configuration_unavailable" };
  }
}

export async function runMetaAdsReadonlyValidation(
  connectionId: string,
  fetchImpl: typeof fetch = fetch,
  options: { includeLocalDiagnostics?: boolean } = {},
): Promise<MetaAdsReadonlyValidationResult> {
  const config = readMetaAdsReadonlyConfig();
  if (!config) {
    return { status: "error", code: "configuration_unavailable" };
  }
  return validateMetaAdsReadonlyConnection(
    getMetaAdsReadonlyRpcClient(),
    connectionId,
    config,
    fetchImpl,
    undefined,
    options,
  );
}

export async function closeMetaAdsReadonlyValidationServerClient(): Promise<void> {
  const sql = validationSql;
  validationSql = null;
  if (sql) {
    await sql.end({ timeout: 5 });
  }
}
