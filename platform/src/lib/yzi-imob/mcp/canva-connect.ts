import { MCP_ENDPOINT_CATALOG } from "./catalog.ts";
import type {
  JsonObject,
  McpAuthorizationBroker,
  McpAuthorizationGrant,
  McpAuthorizationPreparation,
  McpInitializeResult,
  McpToolDefinition,
  McpTransport,
} from "./types.ts";
import { McpRuntimeError } from "./types.ts";

type FetchLike = typeof fetch;

/**
 * Canva Connect APIs — contrato oficial observado (canva.dev/docs/connect):
 * - Authorization Code + PKCE S256 obrigatório
 * - client auth no token endpoint via HTTP Basic (client_id:client_secret)
 * - refresh token com rotação: cada refresh token é de uso único
 */
export const CANVA_CONNECT_AUTHORIZATION_ENDPOINT =
  "https://www.canva.com/api/oauth/authorize";
export const CANVA_CONNECT_TOKEN_ENDPOINT =
  "https://api.canva.com/rest/v1/oauth/token";
export const CANVA_CONNECT_API_BASE = "https://api.canva.com/rest/v1";

export function readCanvaConnectClientId(): string {
  const value = process.env.CANVA_CONNECT_CLIENT_ID?.trim();
  if (!value) throw new McpRuntimeError("authorization_invalid", "canva_connect_client_id_missing");
  return value;
}

function readCanvaConnectClientSecret(): string {
  const value = process.env.CANVA_CONNECT_CLIENT_SECRET?.trim();
  if (!value) throw new McpRuntimeError("authorization_invalid", "canva_connect_client_secret_missing");
  return value;
}

function basicAuthorizationHeader(): string {
  const credentials = `${readCanvaConnectClientId()}:${readCanvaConnectClientSecret()}`;
  return `Basic ${Buffer.from(credentials, "utf8").toString("base64")}`;
}

export type CanvaConnectBrokerOptions = {
  fetchImpl?: FetchLike;
  timeoutMs?: number;
};

/**
 * Broker OAuth dedicado às Connect APIs. Não usa DCR/CIMD nem metadata
 * discovery: endpoints e credenciais do app são fixos (Developer Portal).
 * O segredo do cliente nunca entra no Vault; é lido do ambiente por chamada.
 */
export class CanvaConnectOAuthBroker implements McpAuthorizationBroker {
  readonly #fetch: FetchLike;
  readonly #timeoutMs: number;

  constructor(options: CanvaConnectBrokerOptions = {}) {
    this.#fetch = options.fetchImpl ?? fetch;
    this.#timeoutMs = options.timeoutMs ?? 15_000;
  }

  async buildAuthorizationUrl(input: {
    endpoint: string;
    state: string;
    codeChallenge: string;
    callbackUrl: string;
    scopes: readonly string[];
  }): Promise<McpAuthorizationPreparation> {
    assertCanvaEndpointKey(input.endpoint);
    const clientId = readCanvaConnectClientId();
    const authorizationUrl = new URL(CANVA_CONNECT_AUTHORIZATION_ENDPOINT);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("redirect_uri", input.callbackUrl);
    authorizationUrl.searchParams.set("scope", input.scopes.join(" "));
    authorizationUrl.searchParams.set("state", input.state);
    authorizationUrl.searchParams.set("code_challenge", input.codeChallenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");
    return {
      authorizationUrl: authorizationUrl.toString(),
      exchangeContext: { provider: "canva_connect" },
    };
  }

  async exchange(input: {
    endpoint: string;
    code: string;
    codeVerifier: string;
    callbackUrl: string;
    authorizationContext?: JsonObject;
  }): Promise<McpAuthorizationGrant> {
    assertCanvaEndpointKey(input.endpoint);
    return this.#tokenGrant(
      new URLSearchParams({
        grant_type: "authorization_code",
        code: input.code,
        code_verifier: input.codeVerifier,
        redirect_uri: input.callbackUrl,
      }),
    );
  }

  async refresh(material: JsonObject): Promise<McpAuthorizationGrant> {
    const refreshToken = material.refreshToken;
    if (typeof refreshToken !== "string" || !refreshToken) {
      throw new McpRuntimeError("authorization_invalid", "canva_connect_refresh_token_missing");
    }
    return this.#tokenGrant(
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    );
  }

  async #tokenGrant(body: URLSearchParams): Promise<McpAuthorizationGrant> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#timeoutMs);
    let token: JsonObject;
    try {
      const response = await this.#fetch(CANVA_CONNECT_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          authorization: basicAuthorizationHeader(),
          "content-type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
        body,
        redirect: "error",
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new McpRuntimeError("authorization_invalid", `canva_connect_token_http_${response.status}`);
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength > 64_000) {
        throw new McpRuntimeError("response_too_large", "canva_connect_token_response_too_large");
      }
      const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new McpRuntimeError("authorization_invalid", "canva_connect_token_response_invalid");
      }
      token = parsed as JsonObject;
    } finally {
      clearTimeout(timeout);
    }
    const accessToken = token.access_token;
    if (typeof accessToken !== "string" || !accessToken) {
      throw new McpRuntimeError("authorization_invalid", "canva_connect_access_token_missing");
    }
    const expiresIn = typeof token.expires_in === "number" ? token.expires_in : null;
    return {
      material: {
        provider: "canva_connect",
        accessToken,
        // Rotação: o refresh token anterior foi invalidado pelo Canva; só o
        // novo (quando presente) permanece utilizável.
        ...(typeof token.refresh_token === "string" && token.refresh_token
          ? { refreshToken: token.refresh_token }
          : {}),
      },
      grantedScopes:
        typeof token.scope === "string" ? token.scope.split(/\s+/).filter(Boolean) : [],
      expiresAt:
        expiresIn && expiresIn > 0
          ? new Date(Date.now() + expiresIn * 1000).toISOString()
          : null,
    };
  }
}

export type CanvaConnectTransportOptions = {
  authorizationHeader: () => Promise<string | null>;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
};

/**
 * Transport REST mínimo das Connect APIs sob o contrato McpTransport.
 * initialize/health provam o token com a leitura oficial mais simples
 * (GET /rest/v1/users/me — sem scope). Não há tools remotas: capabilities
 * ficam vazias até que operações Connect sejam confirmadas e catalogadas.
 */
export class CanvaConnectTransport implements McpTransport {
  readonly #authorizationHeader: () => Promise<string | null>;
  readonly #fetch: FetchLike;
  readonly #timeoutMs: number;

  constructor(options: CanvaConnectTransportOptions) {
    this.#authorizationHeader = options.authorizationHeader;
    this.#fetch = options.fetchImpl ?? fetch;
    this.#timeoutMs = options.timeoutMs ?? 15_000;
  }

  async initialize(signal?: AbortSignal): Promise<McpInitializeResult> {
    await this.#currentUser(signal);
    return {
      protocolVersion: "canva-connect-rest-v1",
      serverInfo: { name: "canva-connect" },
      capabilities: {},
    };
  }

  async listTools(): Promise<readonly McpToolDefinition[]> {
    return [];
  }

  async callTool(): Promise<JsonObject> {
    throw new McpRuntimeError("operation_not_allowed", "canva_connect_operation_not_catalogued");
  }

  async health(signal?: AbortSignal): Promise<boolean> {
    try {
      await this.#currentUser(signal);
      return true;
    } catch {
      return false;
    }
  }

  async #currentUser(signal?: AbortSignal): Promise<JsonObject> {
    const authorization = await this.#authorizationHeader();
    if (!authorization) {
      throw new McpRuntimeError("authorization_invalid", "canva_connect_authorization_missing");
    }
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    const timeout = setTimeout(abort, this.#timeoutMs);
    try {
      const response = await this.#fetch(`${CANVA_CONNECT_API_BASE}/users/me`, {
        headers: { authorization, accept: "application/json" },
        redirect: "error",
        signal: controller.signal,
      });
      if (response.status === 401 || response.status === 403) {
        throw new McpRuntimeError("authorization_expired", `canva_connect_users_me_http_${response.status}`);
      }
      if (!response.ok) {
        throw new McpRuntimeError("upstream_error", `canva_connect_users_me_http_${response.status}`);
      }
      const parsed: unknown = await response.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new McpRuntimeError("upstream_error", "canva_connect_users_me_invalid");
      }
      return parsed as JsonObject;
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    }
  }
}

function assertCanvaEndpointKey(endpoint: string): void {
  if (endpoint !== MCP_ENDPOINT_CATALOG.canva.endpoint) {
    throw new McpRuntimeError("endpoint_not_allowed", "canva_connect_endpoint_mismatch");
  }
}
