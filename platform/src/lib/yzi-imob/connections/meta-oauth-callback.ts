import { createHash } from "node:crypto";

export type MetaOAuthCallbackStatus =
  | "success"
  | "cancelled"
  | "expired"
  | "invalid_state"
  | "provider_error"
  | "internal_error";

type MetaOAuthCallbackConfig = {
  appId: string;
  appSecret: string;
  redirectUri: URL;
  graphApiVersion: string;
};

export type MetaOAuthCallbackRpcError = {
  code?: string;
  message?: string;
};

export type MetaOAuthCallbackFailureInput = {
  authorizationId: string;
  stateHash: string;
  failureCode: string;
  graphApiVersion: string | null;
};

export type MetaOAuthCallbackCompleteInput = {
  authorizationId: string;
  stateHash: string;
  accessToken: string;
  tokenType: string | null;
  tokenExpiresAt: string | null;
  graphApiVersion: string;
  exchangedForLongLived: boolean;
};

export type MetaOAuthCallbackRpcClient = {
  consumeAuthorization: (stateHash: string) => Promise<{
    data: unknown;
    error: MetaOAuthCallbackRpcError | null;
  }>;
  recordAuthorizationFailure: (input: MetaOAuthCallbackFailureInput) => Promise<{
    error: MetaOAuthCallbackRpcError | null;
  }>;
  completeConnection: (input: MetaOAuthCallbackCompleteInput) => Promise<{
    error: MetaOAuthCallbackRpcError | null;
  }>;
};

type ConsumeAuthorizationRow = {
  authorization_id: string;
  tenant_id: string;
  user_id: string;
  catalog_id: "instagram" | "facebook" | "meta-ads";
  request_id: string;
  expires_at: string;
  processing_lease_expires_at: string;
};

type MetaTokenResponse = {
  accessToken: string;
  tokenType: string | null;
  expiresInSeconds: number | null;
};

type FetchLike = typeof fetch;

const CALLBACK_RESULT_PATH = "/cockpit/yzi-imob/conexoes";
const FALLBACK_RESULT_ORIGIN = "http://localhost:3000";
const STATE_RE = /^[A-Za-z0-9_-]{43}$/;
const GRAPH_API_VERSION_RE = /^v\d+\.\d+$/;
const MAX_CODE_LENGTH = 4096;
const MAX_META_TOKEN_RESPONSE_BYTES = 16 * 1024;
const META_TIMEOUT_MS = 8_000;

const FAILURE_CODES = {
  completionFailed: "vault_or_connection_failed",
} as const;

export function readMetaOAuthCallbackConfig(
  env: NodeJS.ProcessEnv = process.env,
): MetaOAuthCallbackConfig | null {
  const appId = env.META_APP_ID?.trim();
  const appSecret = env.META_APP_SECRET?.trim();
  const redirectUriValue = env.META_LOGIN_REDIRECT_URI?.trim();
  const graphApiVersion = env.META_GRAPH_API_VERSION?.trim();

  if (!appId || !appSecret || !redirectUriValue || !graphApiVersion) {
    return null;
  }

  if (!GRAPH_API_VERSION_RE.test(graphApiVersion)) {
    return null;
  }

  let redirectUri: URL;
  try {
    redirectUri = new URL(redirectUriValue);
  } catch {
    return null;
  }

  const isLocalHttp =
    redirectUri.protocol === "http:" &&
    (redirectUri.hostname === "localhost" || redirectUri.hostname === "127.0.0.1");
  const isHttps = redirectUri.protocol === "https:";

  if (!isHttps && !isLocalHttp) {
    return null;
  }
  if (redirectUri.username || redirectUri.password || redirectUri.search || redirectUri.hash) {
    return null;
  }

  return {
    appId,
    appSecret,
    redirectUri,
    graphApiVersion,
  };
}

export function hashOAuthState(state: string): string {
  return createHash("sha256").update(state, "utf8").digest("hex");
}

export function isValidOAuthState(state: string | null): state is string {
  return Boolean(state && STATE_RE.test(state));
}

export function buildCallbackResultUrl(
  baseOrigin: string,
  status: MetaOAuthCallbackStatus,
): string {
  const redirectUrl = new URL(CALLBACK_RESULT_PATH, readSafeOrigin(baseOrigin));
  redirectUrl.searchParams.set("meta_oauth", status);
  return redirectUrl.toString();
}

function readSafeOrigin(originValue: string | null | undefined): string {
  if (!originValue) {
    return FALLBACK_RESULT_ORIGIN;
  }

  try {
    const url = new URL(originValue);
    const isLocalHttp =
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    const isHttps = url.protocol === "https:";
    if ((isHttps || isLocalHttp) && !url.username && !url.password) {
      return url.origin;
    }
  } catch {
    return FALLBACK_RESULT_ORIGIN;
  }

  return FALLBACK_RESULT_ORIGIN;
}

function readFallbackResultOrigin(env: NodeJS.ProcessEnv): string {
  const callbackConfig = readMetaOAuthCallbackConfig(env);
  if (callbackConfig) {
    return callbackConfig.redirectUri.origin;
  }

  return readSafeOrigin(env.NEXT_PUBLIC_APP_URL);
}

function hasUnsafeControlCharacters(value: string): boolean {
  return /[\u0000-\u001f\u007f]/.test(value);
}

function isValidOAuthCode(code: string | null): code is string {
  return Boolean(
    code && code.length <= MAX_CODE_LENGTH && !hasUnsafeControlCharacters(code),
  );
}

function callbackStatusForConsumeError(error: { code?: string; message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  if (message.includes("expired")) {
    return "expired" as const;
  }
  if (message.includes("consumed")) {
    return "invalid_state" as const;
  }
  return "invalid_state" as const;
}

function isOfficialCancel(error: string | null, errorReason: string | null): boolean {
  return error === "access_denied" || errorReason === "user_denied";
}

async function consumeAuthorization(
  rpcClient: MetaOAuthCallbackRpcClient,
  stateHash: string,
): Promise<
  | { status: "ok"; authorization: ConsumeAuthorizationRow }
  | { status: "expired" | "invalid_state" | "internal_error" }
> {
  const { data, error } = await rpcClient.consumeAuthorization(stateHash);

  if (error) {
    return { status: callbackStatusForConsumeError(error) };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (row && typeof row === "object") {
    const claimStatus = (row as Record<string, unknown>).claim_status;
    if (claimStatus === "expired") {
      return { status: "expired" };
    }
    if (claimStatus !== "claimed") {
      return { status: "invalid_state" };
    }
  }

  if (
    !row ||
    typeof row.authorization_id !== "string" ||
    typeof row.tenant_id !== "string" ||
    typeof row.user_id !== "string" ||
    typeof row.catalog_id !== "string" ||
    typeof row.request_id !== "string" ||
    typeof row.expires_at !== "string" ||
    typeof row.processing_lease_expires_at !== "string"
  ) {
    return { status: "internal_error" };
  }

  return { status: "ok", authorization: row as ConsumeAuthorizationRow };
}

async function recordAuthorizationFailure(
  rpcClient: MetaOAuthCallbackRpcClient,
  authorizationId: string,
  stateHash: string,
  failureCode: string,
  graphApiVersion: string | null,
): Promise<void> {
  await rpcClient.recordAuthorizationFailure({
    authorizationId,
    stateHash,
    failureCode,
    graphApiVersion,
  });
}

function metaTokenEndpoint(graphApiVersion: string): URL {
  return new URL(`https://graph.facebook.com/${graphApiVersion}/oauth/access_token`);
}

function readExpiresAt(expiresInSeconds: number | null, nowMs = Date.now()): string | null {
  if (!expiresInSeconds) {
    return null;
  }
  return new Date(nowMs + expiresInSeconds * 1000).toISOString();
}

function validateMetaTokenPayload(payload: unknown): MetaTokenResponse | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const allowedKeys = new Set(["access_token", "token_type", "expires_in"]);
  if (Object.keys(record).some((key) => !allowedKeys.has(key))) {
    return null;
  }

  if (typeof record.access_token !== "string" || record.access_token.trim().length === 0) {
    return null;
  }

  const tokenType = typeof record.token_type === "string" ? record.token_type : null;
  const expiresInSeconds =
    typeof record.expires_in === "number" && Number.isFinite(record.expires_in)
      ? record.expires_in
      : null;

  const maxExpiresInSeconds = Math.floor((8640000000000000 - Date.now()) / 1000);
  if (
    expiresInSeconds !== null &&
    (!Number.isInteger(expiresInSeconds) ||
      expiresInSeconds <= 0 ||
      expiresInSeconds > maxExpiresInSeconds)
  ) {
    return null;
  }

  return {
    accessToken: record.access_token,
    tokenType,
    expiresInSeconds,
  };
}

async function fetchMetaToken(
  url: URL,
  fetchImpl: FetchLike,
  timeoutMs = META_TIMEOUT_MS,
): Promise<{ status: "ok"; token: MetaTokenResponse } | { status: "timeout" | "invalid" }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return { status: "invalid" };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (
      !contentType.toLowerCase().includes("application/json") &&
      !contentType.toLowerCase().includes("text/javascript")
    ) {
      return { status: "invalid" };
    }

    const text = await readLimitedResponseText(response, MAX_META_TOKEN_RESPONSE_BYTES);
    if (text === null) {
      return { status: "invalid" };
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      return { status: "invalid" };
    }

    const token = validateMetaTokenPayload(payload);
    if (!token) {
      return { status: "invalid" };
    }

    return { status: "ok", token };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { status: "timeout" };
    }
    return { status: "invalid" };
  } finally {
    clearTimeout(timeout);
  }
}

async function readLimitedResponseText(response: Response, maxBytes: number): Promise<string | null> {
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

  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export async function exchangeMetaCodeForToken(
  config: MetaOAuthCallbackConfig,
  code: string,
  fetchImpl: FetchLike = fetch,
): Promise<
  | { status: "ok"; token: MetaTokenResponse; expiresAt: string | null; exchangedForLongLived: boolean }
  | { status: "timeout" | "invalid" | "long_lived_invalid" }
> {
  const codeExchangeUrl = metaTokenEndpoint(config.graphApiVersion);
  codeExchangeUrl.searchParams.set("client_id", config.appId);
  codeExchangeUrl.searchParams.set("redirect_uri", config.redirectUri.toString());
  codeExchangeUrl.searchParams.set("client_secret", config.appSecret);
  codeExchangeUrl.searchParams.set("code", code);

  const codeExchange = await fetchMetaToken(codeExchangeUrl, fetchImpl);
  if (codeExchange.status !== "ok") {
    return codeExchange;
  }

  const longLivedUrl = metaTokenEndpoint(config.graphApiVersion);
  longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
  longLivedUrl.searchParams.set("client_id", config.appId);
  longLivedUrl.searchParams.set("client_secret", config.appSecret);
  longLivedUrl.searchParams.set("fb_exchange_token", codeExchange.token.accessToken);

  const longLivedExchange = await fetchMetaToken(longLivedUrl, fetchImpl);
  if (longLivedExchange.status !== "ok") {
    return longLivedExchange.status === "timeout"
      ? longLivedExchange
      : { status: "long_lived_invalid" };
  }

  return {
    status: "ok",
    token: longLivedExchange.token,
    expiresAt: readExpiresAt(longLivedExchange.token.expiresInSeconds),
    exchangedForLongLived: true,
  };
}

async function completeConnection(
  rpcClient: MetaOAuthCallbackRpcClient,
  authorization: ConsumeAuthorizationRow,
  stateHash: string,
  token: MetaTokenResponse,
  expiresAt: string | null,
  graphApiVersion: string,
  exchangedForLongLived: boolean,
): Promise<boolean> {
  const { error } = await rpcClient.completeConnection({
    authorizationId: authorization.authorization_id,
    stateHash,
    accessToken: token.accessToken,
    tokenType: token.tokenType,
    tokenExpiresAt: expiresAt,
    graphApiVersion,
    exchangedForLongLived,
  });

  return !error;
}

export async function handleMetaOAuthCallback(
  rpcClient: MetaOAuthCallbackRpcClient,
  requestUrl: URL,
  fetchImpl: FetchLike = fetch,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ redirectUrl: string; status: MetaOAuthCallbackStatus }> {
  const rawState = requestUrl.searchParams.get("state");
  if (!isValidOAuthState(rawState)) {
    return {
      status: "invalid_state",
      redirectUrl: buildCallbackResultUrl(readFallbackResultOrigin(env), "invalid_state"),
    };
  }

  const stateHash = hashOAuthState(rawState);
  const config = readMetaOAuthCallbackConfig(env);
  if (!config) {
    return {
      status: "internal_error",
      redirectUrl: buildCallbackResultUrl(readFallbackResultOrigin(env), "internal_error"),
    };
  }

  const providerError = requestUrl.searchParams.get("error");
  const providerErrorReason = requestUrl.searchParams.get("error_reason");
  if (providerError) {
    const cancelled = isOfficialCancel(providerError, providerErrorReason);
    const status = cancelled ? "cancelled" : "provider_error";
    return {
      status,
      redirectUrl: buildCallbackResultUrl(config.redirectUri.origin, status),
    };
  }

  const code = requestUrl.searchParams.get("code");
  if (!isValidOAuthCode(code)) {
    return {
      status: "provider_error",
      redirectUrl: buildCallbackResultUrl(config.redirectUri.origin, "provider_error"),
    };
  }

  const tokenResult = await exchangeMetaCodeForToken(config, code, fetchImpl);
  if (tokenResult.status !== "ok") {
    return {
      status: "provider_error",
      redirectUrl: buildCallbackResultUrl(config.redirectUri.origin, "provider_error"),
    };
  }

  const consumed = await consumeAuthorization(rpcClient, stateHash);
  if (consumed.status !== "ok") {
    return {
      status: consumed.status,
      redirectUrl: buildCallbackResultUrl(config.redirectUri.origin, consumed.status),
    };
  }

  const { authorization } = consumed;

  const completed = await completeConnection(
    rpcClient,
    authorization,
    stateHash,
    tokenResult.token,
    tokenResult.expiresAt,
    config.graphApiVersion,
    tokenResult.exchangedForLongLived,
  );

  if (!completed) {
    await recordAuthorizationFailure(
      rpcClient,
      authorization.authorization_id,
      stateHash,
      FAILURE_CODES.completionFailed,
      config.graphApiVersion,
    );
    return {
      status: "internal_error",
      redirectUrl: buildCallbackResultUrl(config.redirectUri.origin, "internal_error"),
    };
  }

  return {
    status: "success",
    redirectUrl: buildCallbackResultUrl(config.redirectUri.origin, "success"),
  };
}

export async function handleMetaOAuthCallbackRequest(
  requestUrl: URL,
  createRpcClient: () => MetaOAuthCallbackRpcClient,
  fetchImpl: FetchLike = fetch,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ redirectUrl: string; status: MetaOAuthCallbackStatus }> {
  let rpcClient: MetaOAuthCallbackRpcClient;
  try {
    rpcClient = createRpcClient();
  } catch {
    return {
      status: "internal_error",
      redirectUrl: buildCallbackResultUrl(readFallbackResultOrigin(env), "internal_error"),
    };
  }

  return handleMetaOAuthCallback(rpcClient, requestUrl, fetchImpl, env);
}
