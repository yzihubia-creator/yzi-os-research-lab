import assert from "node:assert/strict";
import { test } from "node:test";

const {
  META_ADS_READONLY_ACCOUNT_ID,
  META_ADS_READONLY_APP_ID,
  classifyMetaAdsReadonlyPostgresFailure,
  readMetaAdsReadonlyConfig,
  validateMetaAdsReadonlyConnection,
} = await import("../src/lib/yzi-imob/connections/meta-ads-readonly-validation.ts");

const CONNECTION_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_ID = "22222222-2222-4222-8222-222222222222";
const META_ADS_READONLY_FIXTURE = "meta-ads-readonly-fixture";

function assertSanitized(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function rpcClient(overrides = {}) {
  const calls = [];
  return {
    calls,
    client: {
      async getValidationContext(connectionId) {
        calls.push({ name: "context", connectionId });
        return overrides.context ?? {
          data: [{ connection_id: connectionId, tenant_id: TENANT_ID, meta_ads_readonly_secret: META_ADS_READONLY_FIXTURE }],
          error: null,
        };
      },
      async completeValidation(input) {
        calls.push({ name: "complete", input });
        return overrides.complete ?? {
          data: [{
            asset_id: "33333333-3333-4333-8333-333333333333",
            connection_status: "connected",
            validated_at: "2026-07-16T17:00:00.000Z",
          }],
          error: null,
        };
      },
      async failValidation(connectionId, failureCode) {
        calls.push({ name: "fail", connectionId, failureCode });
        return overrides.fail ?? { error: null };
      },
    },
  };
}

function response(payload) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function fetchSuccess(urls) {
  return async (url, init) => {
    urls.push({ url: String(url), init });
    const pathname = new URL(url).pathname;
    if (pathname.endsWith("/debug_token")) {
      return response({ data: { is_valid: true, app_id: META_ADS_READONLY_APP_ID, type: "SYSTEM_USER" } });
    }
    if (pathname.endsWith("/me/permissions")) {
      return response({ data: [
        { permission: "ads_read", status: "granted" },
        { permission: "business_management", status: "granted" },
      ] });
    }
    return response({
      id: "act_219235883",
      account_id: META_ADS_READONLY_ACCOUNT_ID,
      name: "YZI IMOB",
      account_status: 1,
      currency: "BRL",
      timezone_name: "America/Sao_Paulo",
    });
  };
}

function getHeader(init, name) {
  const headers = init?.headers;
  if (!headers) {
    return null;
  }
  if (headers instanceof Headers) {
    return headers.get(name);
  }
  const normalizedName = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === normalizedName) {
      return String(value);
    }
  }
  return null;
}

test("read-only validation uses exactly the three allowlisted Meta reads", async () => {
  const rpc = rpcClient();
  const requests = [];
  const result = await validateMetaAdsReadonlyConnection(
    rpc.client,
    CONNECTION_ID,
    readMetaAdsReadonlyConfig({
      META_APP_ID: META_ADS_READONLY_APP_ID,
      META_APP_SECRET: "server-only-app-secret",
      META_GRAPH_API_VERSION: "v25.0",
    }),
    fetchSuccess(requests),
  );

  assert.equal(result.status, "ok");
  assert.deepEqual(requests.map((request) => new URL(request.url).pathname), [
    "/v25.0/debug_token",
    "/v25.0/me/permissions",
    "/v25.0/act_219235883",
  ]);
  assert.equal(requests.some((request) => request.init.method !== "GET"), false);
  assert.equal(JSON.stringify(result).includes(META_ADS_READONLY_FIXTURE), false);
  assert.deepEqual(rpc.calls.at(-1).input.grantedScopes, ["ads_read", "business_management"]);
});

test("debug_token request is built with sanitized app access token query params", async () => {
  const metaAdsReadonlyToken = "system-user-token-fixture";
  const appSecret = "app-secret+with/slash&equals=space";
  const rpc = rpcClient({
    context: {
      data: [{
        connection_id: CONNECTION_ID,
        tenant_id: TENANT_ID,
        meta_ads_readonly_secret: metaAdsReadonlyToken,
      }],
      error: null,
    },
  });
  const requests = [];

  const result = await validateMetaAdsReadonlyConnection(
    rpc.client,
    CONNECTION_ID,
    readMetaAdsReadonlyConfig({
      META_APP_ID: META_ADS_READONLY_APP_ID,
      META_APP_SECRET: appSecret,
      META_GRAPH_API_VERSION: "v25.0",
    }),
    fetchSuccess(requests),
  );

  assert.equal(result.status, "ok");
  const debugRequest = requests.find((request) =>
    new URL(request.url).pathname.endsWith("/debug_token")
  );
  assertSanitized(Boolean(debugRequest), "debug_token request was not captured");

  const debugUrl = new URL(debugRequest.url);
  const inputToken = debugUrl.searchParams.get("input_token");
  const appAccessToken = debugUrl.searchParams.get("access_token");
  const tokenParts = appAccessToken?.split("|") ?? [];
  const sanitizedInspection = {
    method: debugRequest.init.method,
    pathname: debugUrl.pathname,
    paramNames: [...debugUrl.searchParams.keys()].sort(),
    appAccessTokenStrategy: "app_id_pipe_app_secret",
    hasInputToken: Boolean(inputToken),
    hasAppAccessTokenSeparator: appAccessToken?.includes("|") ?? false,
    appIdPrefixMatches: tokenParts[0] === META_ADS_READONLY_APP_ID,
  };
  const serializedInspection = JSON.stringify(sanitizedInspection);

  assert.equal(sanitizedInspection.method, "GET");
  assert.equal(sanitizedInspection.pathname, "/v25.0/debug_token");
  assert.deepEqual(sanitizedInspection.paramNames, ["access_token", "input_token"]);
  assertSanitized(inputToken === metaAdsReadonlyToken, "input_token was not the vault token");
  assertSanitized(tokenParts.length === 2, "access_token was not app_id pipe app_secret");
  assertSanitized(tokenParts[0] === META_ADS_READONLY_APP_ID, "access_token app id prefix mismatch");
  assertSanitized(tokenParts[1] === appSecret, "app secret was modified before request construction");
  assertSanitized(appAccessToken !== metaAdsReadonlyToken, "access_token used the system user token");
  assert.equal(getHeader(debugRequest.init, "Authorization"), null);
  assertSanitized(debugRequest.url.includes("access_token=1501572615104757%7C"), "access_token was not URLSearchParams encoded");
  assertSanitized(!serializedInspection.includes(metaAdsReadonlyToken), "sanitized inspection leaked input token");
  assertSanitized(!serializedInspection.includes(appSecret), "sanitized inspection leaked app secret");
});

test("app secret with edge whitespace fails before fetch without leaking secrets", async () => {
  const rpc = rpcClient();
  const requests = [];
  const appSecret = " app-secret-with-edge-whitespace ";
  const config = readMetaAdsReadonlyConfig({
    META_APP_ID: META_ADS_READONLY_APP_ID,
    META_APP_SECRET: appSecret,
    META_GRAPH_API_VERSION: "v25.0",
  });

  const result = await validateMetaAdsReadonlyConnection(
    rpc.client,
    CONNECTION_ID,
    config,
    fetchSuccess(requests),
  );
  const serializedResult = JSON.stringify(result);

  assert.equal(config, null);
  assert.deepEqual(result, { status: "error", code: "configuration_unavailable" });
  assert.equal(requests.length, 0);
  assert.equal(rpc.calls.length, 0);
  assertSanitized(!serializedResult.includes(appSecret), "configuration error leaked app secret");
  assertSanitized(!serializedResult.includes(META_ADS_READONLY_FIXTURE), "configuration error leaked vault token");
});

test("invalid app id never calls Meta or persists a token", async () => {
  const rpc = rpcClient();
  const requests = [];
  const result = await validateMetaAdsReadonlyConnection(
    rpc.client,
    CONNECTION_ID,
    readMetaAdsReadonlyConfig({
      META_APP_ID: "wrong",
      META_APP_SECRET: "server-only-app-secret",
      META_GRAPH_API_VERSION: "v25.0",
    }),
    fetchSuccess(requests),
  );
  assert.deepEqual(result, { status: "error", code: "configuration_unavailable" });
  assert.equal(requests.length, 0);
  assert.equal(rpc.calls.length, 0);
});

test("missing ads_read is persisted as a sanitized failure code", async () => {
  const rpc = rpcClient();
  const requests = [];
  const result = await validateMetaAdsReadonlyConnection(
    rpc.client,
    CONNECTION_ID,
    readMetaAdsReadonlyConfig({
      META_APP_ID: META_ADS_READONLY_APP_ID,
      META_APP_SECRET: "server-only-app-secret",
      META_GRAPH_API_VERSION: "v25.0",
    }),
    async (url, init) => {
      requests.push({ url: String(url), init });
      return new Response(JSON.stringify(new URL(url).pathname.endsWith("debug_token")
        ? { data: { is_valid: true, app_id: META_ADS_READONLY_APP_ID, type: "SYSTEM_USER" } }
        : { data: [{ permission: "ads_read", status: "declined" }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  );
  assert.deepEqual(result, { status: "error", code: "missing_ads_read" });
  assert.equal(rpc.calls.at(-1).failureCode, "missing_ads_read");
});

test("postgres persistence failures are classified without raw database details", () => {
  assert.equal(classifyMetaAdsReadonlyPostgresFailure("42501"), "permission_denied");
  assert.equal(classifyMetaAdsReadonlyPostgresFailure("23505"), "duplicate_asset");
  assert.equal(classifyMetaAdsReadonlyPostgresFailure("23514"), "constraint_violation");
  assert.equal(classifyMetaAdsReadonlyPostgresFailure("22P02"), "enum_mismatch");
  assert.equal(classifyMetaAdsReadonlyPostgresFailure("P0001"), "invalid_argument");
  assert.equal(classifyMetaAdsReadonlyPostgresFailure("XXXXX"), "unknown");
});

test("complete persistence failures return only sanitized local RPC diagnostics", async () => {
  const rpc = rpcClient({
    complete: {
      data: null,
      error: {
        code: "23505",
        message: "raw database message must not leak",
        rpcName: "complete_meta_ads_readonly_validation",
        postgresCode: "23505",
        constraintName: "tenant_connection_assets_active_meta_exclusive_unique",
        failureClass: "duplicate_asset",
      },
    },
  });
  const requests = [];

  const result = await validateMetaAdsReadonlyConnection(
    rpc.client,
    CONNECTION_ID,
    readMetaAdsReadonlyConfig({
      META_APP_ID: META_ADS_READONLY_APP_ID,
      META_APP_SECRET: "server-only-app-secret",
      META_GRAPH_API_VERSION: "v25.0",
    }),
    fetchSuccess(requests),
    8000,
    { includeLocalDiagnostics: true },
  );
  const serialized = JSON.stringify(result);

  assert.deepEqual(result, {
    status: "error",
    code: "persistence_failed",
    diagnostic: {
      rpcName: "complete_meta_ads_readonly_validation",
      postgresCode: "23505",
      constraintName: "tenant_connection_assets_active_meta_exclusive_unique",
      failureClass: "duplicate_asset",
    },
  });
  assert.equal(serialized.includes("raw database message"), false);
  assert.equal(serialized.includes(META_ADS_READONLY_FIXTURE), false);
  assert.equal(serialized.includes("server-only-app-secret"), false);
});

test("fail persistence failures can be diagnosed without exposing provider or SQL details", async () => {
  const rpc = rpcClient({
    fail: {
      error: {
        code: "42501",
        message: "raw permission message must not leak",
        rpcName: "fail_meta_ads_readonly_validation",
        postgresCode: "42501",
        failureClass: "permission_denied",
      },
    },
  });

  const result = await validateMetaAdsReadonlyConnection(
    rpc.client,
    CONNECTION_ID,
    readMetaAdsReadonlyConfig({
      META_APP_ID: META_ADS_READONLY_APP_ID,
      META_APP_SECRET: "server-only-app-secret",
      META_GRAPH_API_VERSION: "v25.0",
    }),
    async (url) => response(new URL(url).pathname.endsWith("debug_token")
      ? { data: { is_valid: true, app_id: META_ADS_READONLY_APP_ID, type: "SYSTEM_USER" } }
      : { data: [{ permission: "ads_read", status: "declined" }] }),
    8000,
    { includeLocalDiagnostics: true },
  );
  const serialized = JSON.stringify(result);

  assert.deepEqual(result, {
    status: "error",
    code: "missing_ads_read",
    diagnostic: {
      rpcName: "fail_meta_ads_readonly_validation",
      postgresCode: "42501",
      failureClass: "permission_denied",
    },
  });
  assert.equal(serialized.includes("raw permission message"), false);
});

test("local diagnostics report sanitized Meta HTTP errors", async () => {
  const rpc = rpcClient();
  const result = await validateMetaAdsReadonlyConnection(
    rpc.client,
    CONNECTION_ID,
    readMetaAdsReadonlyConfig({
      META_APP_ID: META_ADS_READONLY_APP_ID,
      META_APP_SECRET: "server-only-app-secret",
      META_GRAPH_API_VERSION: "V25.0",
    }),
    async () => new Response(JSON.stringify({
      error: {
        message: "must not leak",
        code: 190,
        error_subcode: 463,
      },
    }), {
      status: 400,
      headers: { "content-type": "application/json" },
    }),
    8000,
    { includeLocalDiagnostics: true },
  );

  assert.deepEqual(result, {
    status: "error",
    code: "provider_unavailable",
    diagnostic: {
      stage: "debug_token",
      class: "http_error",
      httpStatus: 400,
      metaErrorCode: 190,
      metaErrorSubcode: 463,
    },
  });
  assert.equal(JSON.stringify(result).includes("must not leak"), false);
});

test("local diagnostics report sanitized network errors", async () => {
  const rpc = rpcClient();
  const result = await validateMetaAdsReadonlyConnection(
    rpc.client,
    CONNECTION_ID,
    readMetaAdsReadonlyConfig({
      META_APP_ID: META_ADS_READONLY_APP_ID,
      META_APP_SECRET: "server-only-app-secret",
      META_GRAPH_API_VERSION: "v25.0",
    }),
    async (url) => {
      if (new URL(url).pathname.endsWith("/debug_token")) {
        return response({ data: { is_valid: true, app_id: META_ADS_READONLY_APP_ID, type: "SYSTEM_USER" } });
      }
      throw new Error("network detail must not leak");
    },
    8000,
    { includeLocalDiagnostics: true },
  );

  assert.deepEqual(result, {
    status: "error",
    code: "provider_unavailable",
    diagnostic: {
      stage: "permissions",
      class: "network_error",
    },
  });
});

test("local diagnostics report sanitized timeouts", async () => {
  const rpc = rpcClient();
  const timeout = new Error("timeout detail must not leak");
  timeout.name = "AbortError";

  const result = await validateMetaAdsReadonlyConnection(
    rpc.client,
    CONNECTION_ID,
    readMetaAdsReadonlyConfig({
      META_APP_ID: META_ADS_READONLY_APP_ID,
      META_APP_SECRET: "server-only-app-secret",
      META_GRAPH_API_VERSION: "v25.0",
    }),
    async () => {
      throw timeout;
    },
    8000,
    { includeLocalDiagnostics: true },
  );

  assert.deepEqual(result, {
    status: "error",
    code: "provider_timeout",
    diagnostic: {
      stage: "debug_token",
      class: "timeout",
    },
  });
});

test("local diagnostics report sanitized invalid JSON", async () => {
  const rpc = rpcClient();
  const result = await validateMetaAdsReadonlyConnection(
    rpc.client,
    CONNECTION_ID,
    readMetaAdsReadonlyConfig({
      META_APP_ID: META_ADS_READONLY_APP_ID,
      META_APP_SECRET: "server-only-app-secret",
      META_GRAPH_API_VERSION: "v25.0",
    }),
    async (url) => {
      const pathname = new URL(url).pathname;
      if (pathname.endsWith("/debug_token")) {
        return response({ data: { is_valid: true, app_id: META_ADS_READONLY_APP_ID, type: "SYSTEM_USER" } });
      }
      if (pathname.endsWith("/me/permissions")) {
        return response({ data: [
          { permission: "ads_read", status: "granted" },
          { permission: "business_management", status: "granted" },
        ] });
      }
      return new Response("{not-json", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
    8000,
    { includeLocalDiagnostics: true },
  );

  assert.deepEqual(result, {
    status: "error",
    code: "provider_response_invalid",
    diagnostic: {
      stage: "ad_account",
      class: "invalid_json",
    },
  });
});
