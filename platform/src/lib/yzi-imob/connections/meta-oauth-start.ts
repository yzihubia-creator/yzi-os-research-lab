import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

// These are catalog entry points for the same Meta provider connection. They
// are authorization context, not separate provider identities.
export const META_OAUTH_ENTRY_CATALOG_IDS = ["instagram", "facebook", "meta-ads"] as const;

export type MetaOAuthEntryCatalogId = (typeof META_OAUTH_ENTRY_CATALOG_IDS)[number];

export type StartMetaOAuthInput = {
  tenantId: string;
  catalogId: string;
};

export type StartMetaOAuthSuccess = {
  status: "ok";
  authorizationUrl: string;
  expiresAt: string;
  requestId: string;
};

export type StartMetaOAuthFailure = {
  status: "unauthenticated" | "forbidden" | "invalid" | "configuration_error" | "error";
  message: string;
  requestId?: string;
};

export type StartMetaOAuthResult = StartMetaOAuthSuccess | StartMetaOAuthFailure;

type MetaOAuthConfig = {
  appId: string;
  redirectUri: URL;
  graphApiVersion: string;
  loginConfigId: string;
};

const STATE_TTL_MS = 10 * 60 * 1000;
const OAUTH_STATE_BYTES = 32;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SAFE_MESSAGES: Record<StartMetaOAuthFailure["status"], string> = {
  unauthenticated: "Sessao obrigatoria para iniciar a autorizacao.",
  forbidden: "Somente owner ou admin ativo pode iniciar esta conexao.",
  invalid: "Entrada invalida para iniciar a conexao Meta.",
  configuration_error: "Configuracao Meta ausente ou invalida no servidor.",
  error: "Nao foi possivel iniciar a autorizacao Meta agora.",
};

export function isMetaOAuthEntryCatalogId(catalogId: string): catalogId is MetaOAuthEntryCatalogId {
  return (META_OAUTH_ENTRY_CATALOG_IDS as readonly string[]).includes(catalogId);
}

export function createOAuthState(): string {
  return randomBytes(OAUTH_STATE_BYTES).toString("base64url");
}

export function hashOAuthState(state: string): string {
  return createHash("sha256").update(state, "utf8").digest("hex");
}

export function expiresAtFrom(nowMs = Date.now()): string {
  return new Date(nowMs + STATE_TTL_MS).toISOString();
}

export function buildMetaAuthorizationUrl(config: MetaOAuthConfig, state: string): string {
  const authorizationUrl = new URL(
    `https://www.facebook.com/${config.graphApiVersion}/dialog/oauth`,
  );

  authorizationUrl.searchParams.set("client_id", config.appId);
  authorizationUrl.searchParams.set("redirect_uri", config.redirectUri.toString());
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("config_id", config.loginConfigId);
  authorizationUrl.searchParams.set("override_default_response_type", "true");

  return authorizationUrl.toString();
}

export function readMetaOAuthConfig(env: NodeJS.ProcessEnv = process.env): MetaOAuthConfig | null {
  const appId = env.META_APP_ID?.trim();
  const redirectUriValue = env.META_LOGIN_REDIRECT_URI?.trim();
  const graphApiVersion = env.META_GRAPH_API_VERSION?.trim();
  const loginConfigId = env.META_LOGIN_CONFIG_ID?.trim();

  if (!appId || !redirectUriValue || !graphApiVersion || !loginConfigId) {
    return null;
  }

  if (!/^v\d+\.\d+$/.test(graphApiVersion)) {
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
    redirectUri,
    graphApiVersion,
    loginConfigId,
  };
}

function validateInput(input: StartMetaOAuthInput): MetaOAuthEntryCatalogId | null {
  if (!UUID_RE.test(input.tenantId)) {
    return null;
  }

  if (!isMetaOAuthEntryCatalogId(input.catalogId)) {
    return null;
  }

  return input.catalogId;
}

function normalizeRpcError(error: { code?: string } | null, requestId: string): StartMetaOAuthFailure {
  if (!error) {
    return { status: "error", message: SAFE_MESSAGES.error, requestId };
  }
  if (error.code === "22023" || error.code === "23514" || error.code === "23505") {
    return { status: "invalid", message: SAFE_MESSAGES.invalid, requestId };
  }
  if (error.code === "42501" || error.code === "28000") {
    return { status: "forbidden", message: SAFE_MESSAGES.forbidden, requestId };
  }
  return { status: "error", message: SAFE_MESSAGES.error, requestId };
}

export async function startMetaOAuthAuthorization(
  supabase: SupabaseClient,
  input: StartMetaOAuthInput,
): Promise<StartMetaOAuthResult> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { status: "unauthenticated", message: SAFE_MESSAGES.unauthenticated };
  }

  const catalogId = validateInput(input);
  if (!catalogId) {
    return { status: "invalid", message: SAFE_MESSAGES.invalid };
  }

  const config = readMetaOAuthConfig();
  if (!config) {
    return { status: "configuration_error", message: SAFE_MESSAGES.configuration_error };
  }

  const requestId = randomUUID();
  const state = createOAuthState();
  const stateHash = hashOAuthState(state);
  const expiresAt = expiresAtFrom();

  const { error } = await supabase.rpc("start_yzi_imob_meta_authorization", {
    p_tenant_id: input.tenantId,
    p_catalog_id: catalogId,
    p_state_hash: stateHash,
    p_expires_at: expiresAt,
    p_redirect_origin: config.redirectUri.origin,
    p_request_id: requestId,
  });

  if (error) {
    return normalizeRpcError(error, requestId);
  }

  return {
    status: "ok",
    authorizationUrl: buildMetaAuthorizationUrl(config, state),
    expiresAt,
    requestId,
  };
}
