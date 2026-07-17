export const META_ADS_READONLY_APP_ID = "1501572615104757";
export const META_ADS_READONLY_EXTERNAL_ID = "act_219235883";
export const META_ADS_READONLY_ACCOUNT_ID = "219235883";
export const META_ADS_READONLY_CURRENCY = "BRL";
export const META_ADS_READONLY_TIMEZONE = "America/Sao_Paulo";
export const META_ADS_READONLY_SCOPES = [
  "ads_read",
  "business_management",
] as const;

const GRAPH_API_VERSION_RE = /^v\d+\.\d+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_META_RESPONSE_BYTES = 16 * 1024;
const META_TIMEOUT_MS = 8_000;

export const META_ADS_READONLY_FAILURE_CODES = [
  "token_invalid",
  "token_type_mismatch",
  "app_id_mismatch",
  "missing_ads_read",
  "missing_business_management",
  "account_id_mismatch",
  "account_inactive",
  "currency_mismatch",
  "timezone_mismatch",
  "provider_timeout",
  "provider_unavailable",
  "provider_response_invalid",
  "persistence_failed",
] as const;

export type MetaAdsReadonlyFailureCode =
  (typeof META_ADS_READONLY_FAILURE_CODES)[number];

export type MetaAdsReadonlyConfig = {
  appId: typeof META_ADS_READONLY_APP_ID;
  appSecret: string;
  graphApiVersion: string;
};

export type MetaAdsReadonlyRpcError = {
  code?: string;
  message: string;
  rpcName?: MetaAdsReadonlyRpcName;
  postgresCode?: string;
  constraintName?: string;
  failureClass?: MetaAdsReadonlyPersistenceFailureClass;
};

export type MetaAdsReadonlyRpcName =
  | "get_meta_ads_readonly_validation_context"
  | "complete_meta_ads_readonly_validation"
  | "fail_meta_ads_readonly_validation";

export type MetaAdsReadonlyPersistenceFailureClass =
  | "permission_denied"
  | "constraint_violation"
  | "enum_mismatch"
  | "duplicate_asset"
  | "invalid_argument"
  | "transaction_failed"
  | "unknown";

export type MetaAdsReadonlyRpcClient = {
  getValidationContext(connectionId: string): Promise<{
    data: unknown;
    error: MetaAdsReadonlyRpcError | null;
  }>;
  completeValidation(input: {
    connectionId: string;
    debugTokenValid: true;
    debugAppId: typeof META_ADS_READONLY_APP_ID;
    grantedScopes: string[];
    externalId: typeof META_ADS_READONLY_EXTERNAL_ID;
    externalAccountId: typeof META_ADS_READONLY_ACCOUNT_ID;
    label: string;
    accountStatus: 1;
    currency: typeof META_ADS_READONLY_CURRENCY;
    timezoneName: typeof META_ADS_READONLY_TIMEZONE;
  }): Promise<{ data: unknown; error: MetaAdsReadonlyRpcError | null }>;
  failValidation(
    connectionId: string,
    failureCode: MetaAdsReadonlyFailureCode,
  ): Promise<{ error: MetaAdsReadonlyRpcError | null }>;
};

export type MetaAdsReadonlyProviderDiagnostic = {
  stage: "debug_token" | "permissions" | "ad_account";
  class: "network_error" | "timeout" | "http_error" | "invalid_json";
  httpStatus?: number;
  metaErrorCode?: number;
  metaErrorSubcode?: number;
};

export type MetaAdsReadonlyPersistenceDiagnostic = {
  rpcName: MetaAdsReadonlyRpcName;
  postgresCode?: string;
  constraintName?: string;
  failureClass: MetaAdsReadonlyPersistenceFailureClass;
};

export type MetaAdsReadonlyDiagnostic =
  | MetaAdsReadonlyProviderDiagnostic
  | MetaAdsReadonlyPersistenceDiagnostic;

export type MetaAdsReadonlyValidationResult =
  | {
      status: "ok";
      connectionId: string;
      assetId: string;
      connectionStatus: "connected";
      validatedAt: string;
    }
  | {
      status: "error";
      code: MetaAdsReadonlyFailureCode | "configuration_unavailable";
      diagnostic?: MetaAdsReadonlyDiagnostic;
    };

type FetchLike = typeof fetch;

type MetaFetchResult =
  | { status: "ok"; payload: unknown }
  | {
      status: "timeout" | "unavailable" | "invalid";
      diagnostic: Omit<MetaAdsReadonlyProviderDiagnostic, "stage">;
    };

type ValidationContext = {
  connectionId: string;
  tenantId: string;
  metaAdsReadonlySecret: string;
};

type ValidatedAccount = {
  label: string;
};

export function readMetaAdsReadonlyConfig(
  env: NodeJS.ProcessEnv = process.env,
): MetaAdsReadonlyConfig | null {
  const appId = env.META_APP_ID?.trim();
  const appSecret = env.META_APP_SECRET;
  const graphApiVersion = env.META_GRAPH_API_VERSION?.trim().toLowerCase();

  if (
    appId !== META_ADS_READONLY_APP_ID ||
    !appSecret ||
    appSecret.trim() !== appSecret ||
    !graphApiVersion ||
    !GRAPH_API_VERSION_RE.test(graphApiVersion)
  ) {
    return null;
  }

  return {
    appId: META_ADS_READONLY_APP_ID,
    appSecret,
    graphApiVersion,
  };
}

function singleRow(data: unknown): Record<string, unknown> | null {
  const row = Array.isArray(data) ? data[0] : data;
  return row && typeof row === "object" ? (row as Record<string, unknown>) : null;
}

function readValidationContext(data: unknown): ValidationContext | null {
  const row = singleRow(data);
  if (!row) {
    return null;
  }

  const connectionId = row.connection_id;
  const tenantId = row.tenant_id;
  const metaAdsReadonlySecret = row.meta_ads_readonly_secret;
  if (
    typeof connectionId !== "string" ||
    !UUID_RE.test(connectionId) ||
    typeof tenantId !== "string" ||
    !UUID_RE.test(tenantId) ||
    typeof metaAdsReadonlySecret !== "string" ||
    metaAdsReadonlySecret.length === 0
  ) {
    return null;
  }

  return { connectionId, tenantId, metaAdsReadonlySecret };
}

async function readLimitedResponseText(
  response: Response,
  maxBytes: number,
): Promise<string | null> {
  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    return null;
  }

  const body = response.body;
  if (!body) {
    const text = await response.text();
    return new TextEncoder().encode(text).byteLength <= maxBytes ? text : null;
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (value) {
        size += value.byteLength;
        if (size > maxBytes) {
          return null;
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

async function fetchMetaJson(
  url: URL,
  bearerCredential: string | null,
  fetchImpl: FetchLike,
  timeoutMs: number,
): Promise<MetaFetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (bearerCredential) {
    headers.Authorization = `Bearer ${bearerCredential}`;
  }

  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers,
      signal: controller.signal,
      cache: "no-store",
      redirect: "error",
    });

    if (!response.ok) {
      const text = await readLimitedResponseText(response, MAX_META_RESPONSE_BYTES);
      const metaError = readMetaError(text);
      return {
        status: "unavailable",
        diagnostic: {
          class: "http_error",
          httpStatus: response.status,
          ...metaError,
        },
      };
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (
      !contentType.includes("application/json") &&
      !contentType.includes("text/javascript")
    ) {
      return { status: "invalid", diagnostic: { class: "invalid_json" } };
    }

    const text = await readLimitedResponseText(response, MAX_META_RESPONSE_BYTES);
    if (text === null) {
      return { status: "invalid", diagnostic: { class: "invalid_json" } };
    }

    try {
      return { status: "ok", payload: JSON.parse(text) as unknown };
    } catch {
      return { status: "invalid", diagnostic: { class: "invalid_json" } };
    }
  } catch (error) {
    return error instanceof Error && error.name === "AbortError"
      ? { status: "timeout", diagnostic: { class: "timeout" } }
      : { status: "unavailable", diagnostic: { class: "network_error" } };
  } finally {
    clearTimeout(timeout);
  }
}

function readMetaError(text: string | null): Pick<
  MetaAdsReadonlyProviderDiagnostic,
  "metaErrorCode" | "metaErrorSubcode"
> {
  if (text === null) {
    return {};
  }

  try {
    const payload = JSON.parse(text) as unknown;
    const error =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>).error
        : null;
    const record =
      error && typeof error === "object" ? (error as Record<string, unknown>) : null;
    const code = record?.code;
    const subcode = record?.error_subcode;
    return {
      ...(typeof code === "number" && Number.isFinite(code)
        ? { metaErrorCode: code }
        : {}),
      ...(typeof subcode === "number" && Number.isFinite(subcode)
        ? { metaErrorSubcode: subcode }
        : {}),
    };
  } catch {
    return {};
  }
}

export function classifyMetaAdsReadonlyPostgresFailure(
  postgresCode: string | undefined,
): MetaAdsReadonlyPersistenceFailureClass {
  if (postgresCode === "42501") {
    return "permission_denied";
  }
  if (postgresCode === "23505") {
    return "duplicate_asset";
  }
  if (postgresCode === "22P02") {
    return "enum_mismatch";
  }
  if (postgresCode === "P0001") {
    return "invalid_argument";
  }
  if (postgresCode === "25P02" || postgresCode === "40001") {
    return "transaction_failed";
  }
  if (postgresCode?.startsWith("23")) {
    return "constraint_violation";
  }
  return "unknown";
}

function providerFailureCode(
  result: Exclude<MetaFetchResult, { status: "ok" }>,
): MetaAdsReadonlyFailureCode {
  if (result.status === "timeout") {
    return "provider_timeout";
  }
  if (result.status === "unavailable") {
    return "provider_unavailable";
  }
  return "provider_response_invalid";
}

function validateDebugToken(
  payload: unknown,
): { status: "ok" } | { status: "error"; code: MetaAdsReadonlyFailureCode } {
  if (!payload || typeof payload !== "object") {
    return { status: "error", code: "provider_response_invalid" };
  }
  const data = (payload as Record<string, unknown>).data;
  if (!data || typeof data !== "object") {
    return { status: "error", code: "provider_response_invalid" };
  }

  const record = data as Record<string, unknown>;
  if (record.is_valid !== true) {
    return { status: "error", code: "token_invalid" };
  }
  if (String(record.app_id ?? "") !== META_ADS_READONLY_APP_ID) {
    return { status: "error", code: "app_id_mismatch" };
  }
  if (record.type !== "SYSTEM_USER") {
    return { status: "error", code: "token_type_mismatch" };
  }
  return { status: "ok" };
}

function validatePermissions(
  payload: unknown,
): { status: "ok"; grantedScopes: string[] } | {
  status: "error";
  code: MetaAdsReadonlyFailureCode;
} {
  if (!payload || typeof payload !== "object") {
    return { status: "error", code: "provider_response_invalid" };
  }
  const data = (payload as Record<string, unknown>).data;
  if (!Array.isArray(data)) {
    return { status: "error", code: "provider_response_invalid" };
  }

  const granted = new Set<string>();
  for (const item of data) {
    if (!item || typeof item !== "object") {
      return { status: "error", code: "provider_response_invalid" };
    }
    const record = item as Record<string, unknown>;
    if (typeof record.permission !== "string" || typeof record.status !== "string") {
      return { status: "error", code: "provider_response_invalid" };
    }
    if (record.status === "granted") {
      granted.add(record.permission);
    }
  }

  if (!granted.has("ads_read")) {
    return { status: "error", code: "missing_ads_read" };
  }
  if (!granted.has("business_management")) {
    return { status: "error", code: "missing_business_management" };
  }
  return { status: "ok", grantedScopes: [...META_ADS_READONLY_SCOPES] };
}

function validateAccount(
  payload: unknown,
): { status: "ok"; account: ValidatedAccount } | {
  status: "error";
  code: MetaAdsReadonlyFailureCode;
} {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { status: "error", code: "provider_response_invalid" };
  }
  const record = payload as Record<string, unknown>;
  if (
    record.id !== META_ADS_READONLY_EXTERNAL_ID ||
    String(record.account_id ?? "") !== META_ADS_READONLY_ACCOUNT_ID
  ) {
    return { status: "error", code: "account_id_mismatch" };
  }
  if (record.account_status !== 1) {
    return { status: "error", code: "account_inactive" };
  }
  if (record.currency !== META_ADS_READONLY_CURRENCY) {
    return { status: "error", code: "currency_mismatch" };
  }
  if (record.timezone_name !== META_ADS_READONLY_TIMEZONE) {
    return { status: "error", code: "timezone_mismatch" };
  }
  if (
    typeof record.name !== "string" ||
    record.name.trim().length < 1 ||
    record.name.trim().length > 240
  ) {
    return { status: "error", code: "provider_response_invalid" };
  }
  return { status: "ok", account: { label: record.name.trim() } };
}

function readCompletion(data: unknown): {
  assetId: string;
  connectionStatus: "connected";
  validatedAt: string;
} | null {
  const row = singleRow(data);
  if (
    !row ||
    typeof row.asset_id !== "string" ||
    !UUID_RE.test(row.asset_id) ||
    row.connection_status !== "connected" ||
    typeof row.validated_at !== "string" ||
    !Number.isFinite(Date.parse(row.validated_at))
  ) {
    return null;
  }
  return {
    assetId: row.asset_id,
    connectionStatus: "connected",
    validatedAt: row.validated_at,
  };
}

async function recordFailure(
  rpcClient: MetaAdsReadonlyRpcClient,
  connectionId: string,
  code: MetaAdsReadonlyFailureCode,
  diagnostic?: MetaAdsReadonlyDiagnostic,
  options: MetaAdsReadonlyValidationOptions = {},
): Promise<MetaAdsReadonlyValidationResult> {
  let resolvedDiagnostic = diagnostic;
  try {
    const failResult = await rpcClient.failValidation(connectionId, code);
    if (failResult.error && !resolvedDiagnostic) {
      resolvedDiagnostic = rpcDiagnostic(failResult.error, options);
    }
  } catch {
    // The externally visible result stays sanitized even if persistence is unavailable.
  }
  return resolvedDiagnostic
    ? { status: "error", code, diagnostic: resolvedDiagnostic }
    : { status: "error", code };
}

type MetaAdsReadonlyValidationOptions = {
  includeLocalDiagnostics?: boolean;
};

function localDiagnostic(
  stage: MetaAdsReadonlyProviderDiagnostic["stage"],
  result: Exclude<MetaFetchResult, { status: "ok" }>,
  options: MetaAdsReadonlyValidationOptions,
): MetaAdsReadonlyProviderDiagnostic | undefined {
  return options.includeLocalDiagnostics
    ? { stage, ...result.diagnostic }
    : undefined;
}

function rpcDiagnostic(
  error: MetaAdsReadonlyRpcError,
  options: MetaAdsReadonlyValidationOptions,
): MetaAdsReadonlyPersistenceDiagnostic | undefined {
  if (!options.includeLocalDiagnostics || !error.rpcName) {
    return undefined;
  }
  return {
    rpcName: error.rpcName,
    ...(error.postgresCode ? { postgresCode: error.postgresCode } : {}),
    ...(error.constraintName ? { constraintName: error.constraintName } : {}),
    failureClass:
      error.failureClass ??
      classifyMetaAdsReadonlyPostgresFailure(error.postgresCode),
  };
}

export async function validateMetaAdsReadonlyConnection(
  rpcClient: MetaAdsReadonlyRpcClient,
  connectionId: string,
  config: MetaAdsReadonlyConfig | null,
  fetchImpl: FetchLike = fetch,
  timeoutMs = META_TIMEOUT_MS,
  options: MetaAdsReadonlyValidationOptions = {},
): Promise<MetaAdsReadonlyValidationResult> {
  if (!config || !UUID_RE.test(connectionId)) {
    return { status: "error", code: "configuration_unavailable" };
  }

  let metaAdsReadonlySecret = "";
  try {
    const contextResult = await rpcClient.getValidationContext(connectionId);
    const context = contextResult.error ? null : readValidationContext(contextResult.data);
    if (!context || context.connectionId !== connectionId) {
      return recordFailure(
        rpcClient,
        connectionId,
        "persistence_failed",
        contextResult.error
          ? rpcDiagnostic(contextResult.error, options)
          : undefined,
        options,
      );
    }
    metaAdsReadonlySecret = context.metaAdsReadonlySecret;

    const debugUrl = new URL(
      `https://graph.facebook.com/${config.graphApiVersion}/debug_token`,
    );
    debugUrl.searchParams.set("input_token", metaAdsReadonlySecret);
    debugUrl.searchParams.set("access_token", `${config.appId}|${config.appSecret}`);
    const debugResult = await fetchMetaJson(
      debugUrl,
      null,
      fetchImpl,
      timeoutMs,
    );
    if (debugResult.status !== "ok") {
      return recordFailure(
        rpcClient,
        connectionId,
        providerFailureCode(debugResult),
        localDiagnostic("debug_token", debugResult, options),
        options,
      );
    }
    const debugValidation = validateDebugToken(debugResult.payload);
    if (debugValidation.status === "error") {
      return recordFailure(rpcClient, connectionId, debugValidation.code, undefined, options);
    }

    const permissionsUrl = new URL(
      `https://graph.facebook.com/${config.graphApiVersion}/me/permissions`,
    );
    const permissionsResult = await fetchMetaJson(
      permissionsUrl,
      metaAdsReadonlySecret,
      fetchImpl,
      timeoutMs,
    );
    if (permissionsResult.status !== "ok") {
      return recordFailure(
        rpcClient,
        connectionId,
        providerFailureCode(permissionsResult),
        localDiagnostic("permissions", permissionsResult, options),
        options,
      );
    }
    const permissionsValidation = validatePermissions(permissionsResult.payload);
    if (permissionsValidation.status === "error") {
      return recordFailure(
        rpcClient,
        connectionId,
        permissionsValidation.code,
        undefined,
        options,
      );
    }

    const accountUrl = new URL(
      `https://graph.facebook.com/${config.graphApiVersion}/${META_ADS_READONLY_EXTERNAL_ID}`,
    );
    accountUrl.searchParams.set(
      "fields",
      "id,account_id,name,account_status,currency,timezone_name",
    );
    const accountResult = await fetchMetaJson(
      accountUrl,
      metaAdsReadonlySecret,
      fetchImpl,
      timeoutMs,
    );
    if (accountResult.status !== "ok") {
      return recordFailure(
        rpcClient,
        connectionId,
        providerFailureCode(accountResult),
        localDiagnostic("ad_account", accountResult, options),
        options,
      );
    }
    const accountValidation = validateAccount(accountResult.payload);
    if (accountValidation.status === "error") {
      return recordFailure(rpcClient, connectionId, accountValidation.code, undefined, options);
    }

    const completionResult = await rpcClient.completeValidation({
      connectionId,
      debugTokenValid: true,
      debugAppId: META_ADS_READONLY_APP_ID,
      grantedScopes: permissionsValidation.grantedScopes,
      externalId: META_ADS_READONLY_EXTERNAL_ID,
      externalAccountId: META_ADS_READONLY_ACCOUNT_ID,
      label: accountValidation.account.label,
      accountStatus: 1,
      currency: META_ADS_READONLY_CURRENCY,
      timezoneName: META_ADS_READONLY_TIMEZONE,
    });
    const completion = completionResult.error
      ? null
      : readCompletion(completionResult.data);
    if (!completion) {
      return recordFailure(
        rpcClient,
        connectionId,
        "persistence_failed",
        completionResult.error
          ? rpcDiagnostic(completionResult.error, options)
          : {
              rpcName: "complete_meta_ads_readonly_validation",
              failureClass: "unknown",
            },
        options,
      );
    }

    return {
      status: "ok",
      connectionId,
      assetId: completion.assetId,
      connectionStatus: completion.connectionStatus,
      validatedAt: completion.validatedAt,
    };
  } catch {
    return recordFailure(rpcClient, connectionId, "persistence_failed", undefined, options);
  } finally {
    metaAdsReadonlySecret = "";
  }
}
