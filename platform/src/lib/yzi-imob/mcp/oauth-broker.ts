import "server-only";

import { MCP_ENDPOINT_CATALOG } from "./catalog.ts";
import type {
  JsonObject,
  McpAuthorizationBroker,
  McpAuthorizationGrant,
  McpAuthorizationPreparation,
} from "./types.ts";

type FetchLike = typeof fetch;
type Metadata = {
  authorization_endpoint: string;
  token_endpoint: string;
  registration_endpoint: string;
  revocation_endpoint?: string;
  code_challenge_methods_supported?: string[];
};

const ALLOWED_ENDPOINTS = new Set<string>(
  Object.values(MCP_ENDPOINT_CATALOG).map((entry) => entry.endpoint),
);

export class DynamicRegistrationOAuthBroker implements McpAuthorizationBroker {
  readonly #fetch: FetchLike;
  readonly #timeoutMs: number;

  constructor(options: { fetchImpl?: FetchLike; timeoutMs?: number } = {}) {
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
    assertCatalogEndpoint(input.endpoint);
    const metadata = await this.#metadata(input.endpoint);
    if (!metadata.code_challenge_methods_supported?.includes("S256")) {
      throw new Error("oauth_pkce_s256_required");
    }
    const registration = await this.#json(metadata.registration_endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        client_name: "YZI OS",
        redirect_uris: [input.callbackUrl],
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "none",
      }),
    });
    const clientId = requiredString(registration, "client_id");
    const authorizationUrl = new URL(metadata.authorization_endpoint);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("redirect_uri", input.callbackUrl);
    authorizationUrl.searchParams.set("scope", input.scopes.join(" "));
    authorizationUrl.searchParams.set("state", input.state);
    authorizationUrl.searchParams.set("code_challenge", input.codeChallenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");
    authorizationUrl.searchParams.set("resource", input.endpoint);
    return {
      authorizationUrl: authorizationUrl.toString(),
      exchangeContext: {
        clientId,
        ...(typeof registration.client_secret === "string"
          ? { clientSecret: registration.client_secret }
          : {}),
        tokenEndpoint: metadata.token_endpoint,
        ...(metadata.revocation_endpoint
          ? { revocationEndpoint: metadata.revocation_endpoint }
          : {}),
        resource: input.endpoint,
      },
    };
  }

  async exchange(input: {
    endpoint: string;
    code: string;
    codeVerifier: string;
    callbackUrl: string;
    authorizationContext?: JsonObject;
  }): Promise<McpAuthorizationGrant> {
    assertCatalogEndpoint(input.endpoint);
    const context = parseContext(input.authorizationContext, input.endpoint);
    const form = new URLSearchParams({
      grant_type: "authorization_code",
      code: input.code,
      code_verifier: input.codeVerifier,
      redirect_uri: input.callbackUrl,
      client_id: context.clientId,
      resource: input.endpoint,
    });
    if (context.clientSecret) form.set("client_secret", context.clientSecret);
    return this.#tokenGrant(context, form);
  }

  async refresh(material: JsonObject): Promise<McpAuthorizationGrant> {
    const context = parseMaterial(material);
    const refreshToken = requiredString(material, "refreshToken");
    const form = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: context.clientId,
      resource: context.resource,
    });
    if (context.clientSecret) form.set("client_secret", context.clientSecret);
    return this.#tokenGrant(context, form, refreshToken);
  }

  async revoke(material: JsonObject): Promise<void> {
    const context = parseMaterial(material);
    if (!context.revocationEndpoint) return;
    const token =
      typeof material.refreshToken === "string"
        ? material.refreshToken
        : requiredString(material, "accessToken");
    const form = new URLSearchParams({ token, client_id: context.clientId });
    if (context.clientSecret) form.set("client_secret", context.clientSecret);
    const response = await this.#request(context.revocationEndpoint, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!response.ok) throw new Error("oauth_revocation_failed");
  }

  async #metadata(endpoint: string): Promise<Metadata> {
    const origin = new URL(endpoint).origin;
    const raw = await this.#json(`${origin}/.well-known/oauth-authorization-server`);
    const metadata = {
      authorization_endpoint: requiredString(raw, "authorization_endpoint"),
      token_endpoint: requiredString(raw, "token_endpoint"),
      registration_endpoint: requiredString(raw, "registration_endpoint"),
      revocation_endpoint:
        typeof raw.revocation_endpoint === "string" ? raw.revocation_endpoint : undefined,
      code_challenge_methods_supported: Array.isArray(raw.code_challenge_methods_supported)
        ? raw.code_challenge_methods_supported.filter((value): value is string => typeof value === "string")
        : undefined,
    };
    for (const url of [
      metadata.authorization_endpoint,
      metadata.token_endpoint,
      metadata.registration_endpoint,
      metadata.revocation_endpoint,
    ]) {
      if (url) assertHttps(url);
    }
    return metadata;
  }

  async #tokenGrant(
    context: ReturnType<typeof parseContext>,
    body: URLSearchParams,
    previousRefreshToken?: string,
  ): Promise<McpAuthorizationGrant> {
    const token = await this.#json(context.tokenEndpoint, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body,
    });
    const accessToken = requiredString(token, "access_token");
    const refreshToken =
      typeof token.refresh_token === "string" ? token.refresh_token : previousRefreshToken;
    const expiresIn = typeof token.expires_in === "number" ? token.expires_in : null;
    return {
      material: {
        accessToken,
        ...(refreshToken ? { refreshToken } : {}),
        clientId: context.clientId,
        ...(context.clientSecret ? { clientSecret: context.clientSecret } : {}),
        tokenEndpoint: context.tokenEndpoint,
        ...(context.revocationEndpoint ? { revocationEndpoint: context.revocationEndpoint } : {}),
        resource: context.resource,
      },
      grantedScopes:
        typeof token.scope === "string" ? token.scope.split(/\s+/).filter(Boolean) : [],
      expiresAt:
        expiresIn && expiresIn > 0
          ? new Date(Date.now() + expiresIn * 1000).toISOString()
          : null,
    };
  }

  async #json(url: string, init?: RequestInit): Promise<JsonObject> {
    const response = await this.#request(url, init);
    if (!response.ok) throw new Error(`oauth_http_${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > 64_000) throw new Error("oauth_response_too_large");
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("oauth_response_invalid");
    }
    return parsed as JsonObject;
  }

  async #request(url: string, init?: RequestInit): Promise<Response> {
    assertHttps(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#timeoutMs);
    try {
      return await this.#fetch(url, { ...init, redirect: "error", signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }
}

function parseMaterial(material: JsonObject) {
  const resource = requiredString(material, "resource");
  assertCatalogEndpoint(resource);
  return parseContext(material, resource);
}

function parseContext(context: JsonObject | undefined, resource: string) {
  if (!context) throw new Error("oauth_context_missing");
  const parsed = {
    clientId: requiredString(context, "clientId"),
    clientSecret: typeof context.clientSecret === "string" ? context.clientSecret : undefined,
    tokenEndpoint: requiredString(context, "tokenEndpoint"),
    revocationEndpoint:
      typeof context.revocationEndpoint === "string" ? context.revocationEndpoint : undefined,
    resource,
  };
  assertHttps(parsed.tokenEndpoint);
  if (parsed.revocationEndpoint) assertHttps(parsed.revocationEndpoint);
  return parsed;
}

function requiredString(object: JsonObject, key: string): string {
  const value = object[key];
  if (typeof value !== "string" || !value) throw new Error(`oauth_${key}_missing`);
  return value;
}

function assertCatalogEndpoint(endpoint: string): void {
  if (!ALLOWED_ENDPOINTS.has(endpoint)) throw new Error("oauth_endpoint_not_allowed");
}

function assertHttps(url: string): void {
  if (new URL(url).protocol !== "https:") throw new Error("oauth_https_required");
}
