import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import postgres from "postgres";

import {
  buildCallbackResultUrl,
  exchangeMetaCodeForToken,
  handleMetaOAuthCallback,
  handleMetaOAuthCallbackRequest,
  hashOAuthState,
  isValidOAuthState,
  readMetaOAuthCallbackConfig,
} from "../src/lib/yzi-imob/connections/meta-oauth-callback.ts";

const MIGRATION_SQL = readFileSync(
  new URL(
    "../../supabase/migrations/20260715093713_yzi_imob_meta_oauth_callback_v1.sql",
    import.meta.url,
  ),
  "utf8",
);

const SERVER_CLIENT_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/connections/meta-oauth-callback-server.ts", import.meta.url),
  "utf8",
);
const ROUTE_SOURCE = readFileSync(
  new URL("../src/app/api/oauth/meta/callback/route.ts", import.meta.url),
  "utf8",
);
const ENV_EXAMPLE = readFileSync(new URL("../.env.example", import.meta.url), "utf8");

const META_ENV = {
  META_APP_ID: "1234567890",
  META_APP_SECRET: "test-app-secret",
  META_LOGIN_REDIRECT_URI: "https://app.example.com/api/oauth/meta/callback",
  META_GRAPH_API_VERSION: "v25.0",
};

const RAW_STATE = "A".repeat(43);
const STATE_HASH = hashOAuthState(RAW_STATE);
const AUTHORIZATION_ROW = {
  claim_status: "claimed",
  authorization_id: "11111111-1111-4111-8111-111111111111",
  tenant_id: "22222222-2222-4222-8222-222222222222",
  user_id: "33333333-3333-4333-8333-333333333333",
  catalog_id: "instagram",
  request_id: "44444444-4444-4444-8444-444444444444",
  expires_at: "2026-07-15T12:10:00.000Z",
  processing_lease_expires_at: "2026-07-15T12:02:00.000Z",
};
const TOKEN_SENTINEL = ["yzi", "meta", "oauth", "sentinel", "vault", "only"].join("-");

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": init.contentType ?? "application/json" },
  });
}

function callbackRpcClient(rpc) {
  return {
    consumeAuthorization: (stateHash) =>
      rpc("consume_yzi_imob_meta_authorization", { p_state_hash: stateHash }),
    recordAuthorizationFailure: (input) =>
      rpc("record_yzi_imob_meta_authorization_failure", {
        p_authorization_id: input.authorizationId,
        p_state_hash: input.stateHash,
        p_failure_code: input.failureCode,
        p_graph_api_version: input.graphApiVersion,
      }),
    completeConnection: (input) =>
      rpc("complete_yzi_imob_meta_connection", {
        p_authorization_id: input.authorizationId,
        p_state_hash: input.stateHash,
        p_access_token: input.accessToken,
        p_token_type: input.tokenType,
        p_token_expires_at: input.tokenExpiresAt,
        p_graph_api_version: input.graphApiVersion,
        p_exchanged_for_long_lived: input.exchangedForLongLived,
      }),
  };
}

function mockSupabase({ consumeError = null, completeError = null } = {}) {
  const calls = [];
  return {
    calls,
    client: callbackRpcClient(async (name, args) => {
        calls.push({ name, args });
        if (name === "consume_yzi_imob_meta_authorization") {
          return consumeError
            ? { data: null, error: consumeError }
            : { data: [AUTHORIZATION_ROW], error: null };
        }
        if (name === "complete_yzi_imob_meta_connection") {
          return completeError
            ? { data: null, error: completeError }
            : {
                data: [
                  {
                    connection_id: "55555555-5555-4555-8555-555555555555",
                    connection_action: "created",
                    connection_status: "completed",
                  },
                ],
                error: null,
              };
        }
        if (name === "record_yzi_imob_meta_authorization_failure") {
          return { data: null, error: null };
        }
        return { data: null, error: new Error(`unexpected rpc ${name}`) };
      }),
  };
}

function mockStatefulSupabase({
  completeError = null,
  failCompleteAfterSecret = false,
  existingConnection = null,
  authorizationOverrides = {},
} = {}) {
  const db = {
    authorizations: [{ ...AUTHORIZATION_ROW, status: "pending", ...authorizationOverrides }],
    tenant_connections: existingConnection ? [{ ...existingConnection }] : [],
    connection_authorizations: [],
    connection_audit_events: [],
    provider_metadata: [],
    vaultWrites: [],
    retainedSecrets: existingConnection?.vault_secret_id ? [existingConnection.vault_secret_id] : [],
    orphanCleanups: [],
  };
  const calls = [];

  return {
    db,
    calls,
    client: callbackRpcClient(async (name, args) => {
        calls.push({ name, args });
        const authorization = db.authorizations[0];

        if (name === "consume_yzi_imob_meta_authorization") {
          const nowMs = Date.parse("2026-07-15T12:00:00.000Z");
          if (
            authorization.status === "processing" &&
            Date.parse(authorization.processing_lease_expires_at) <= nowMs
          ) {
            authorization.status = "failed";
            authorization.processing_started_at = null;
            authorization.processing_lease_expires_at = null;
            authorization.failed_at = new Date(nowMs).toISOString();
            authorization.failure_code = "processing_abandoned";
            db.connection_audit_events.push({
              event: "authorization_failed",
              metadata: { failure_code: "processing_abandoned" },
            });
            return { data: [{ claim_status: "processing_abandoned" }], error: null };
          }
          if (
            authorization.status === "pending" &&
            Date.parse(authorization.expires_at) <= nowMs
          ) {
            authorization.status = "failed";
            authorization.failed_at = new Date(nowMs).toISOString();
            authorization.failure_code = "authorization_expired";
            db.connection_audit_events.push({
              event: "authorization_failed",
              metadata: { failure_code: "authorization_expired" },
            });
            return { data: [{ claim_status: "expired" }], error: null };
          }
          if (authorization.status !== "pending") {
            return { data: [{ claim_status: "not_pending" }], error: null };
          }
          authorization.status = "processing";
          db.connection_authorizations.push({ ...authorization });
          db.connection_audit_events.push({
            event: "authorization_callback_received",
            metadata: {
              provider: "meta",
              catalog_id: authorization.catalog_id,
              request_id: authorization.request_id,
              authorization_id: authorization.authorization_id,
            },
          });
          return { data: [authorization], error: null };
        }

        if (name === "record_yzi_imob_meta_authorization_failure") {
          authorization.status =
            args.p_failure_code === "provider_cancelled" ? "cancelled" : "failed";
          db.connection_audit_events.push({
            event:
              args.p_failure_code === "provider_cancelled"
                ? "authorization_cancelled"
                : "authorization_failed",
            metadata: {
              provider: "meta",
              catalog_id: authorization.catalog_id,
              request_id: authorization.request_id,
              authorization_id: authorization.authorization_id,
              failure_code: args.p_failure_code,
              graph_api_version: args.p_graph_api_version,
            },
          });
          return { data: null, error: null };
        }

        if (name === "complete_yzi_imob_meta_connection") {
          if (completeError) {
            return { data: null, error: completeError };
          }

          const newSecretId = "77777777-7777-4777-8777-777777777777";
          db.vaultWrites.push({
            secretId: newSecretId,
            value: args.p_access_token,
          });

          if (failCompleteAfterSecret) {
            db.orphanCleanups.push(newSecretId);
            return { data: null, error: { code: "55000", message: "connection failed" } };
          }

          const metadata = {
            source_catalog_id: authorization.catalog_id,
            graph_api_version: args.p_graph_api_version,
            token_type: args.p_token_type,
            exchanged_for_long_lived: args.p_exchanged_for_long_lived,
            previous_secret_retained: Boolean(existingConnection?.vault_secret_id),
            previous_secret_retire_after: existingConnection?.vault_secret_id
              ? "2026-07-16T12:00:00.000Z"
              : null,
          };
          db.provider_metadata.push(metadata);
          if (db.tenant_connections.length) {
            db.tenant_connections[0] = {
              ...db.tenant_connections[0],
              tenant_id: authorization.tenant_id,
              provider: "meta",
              vault_secret_id: newSecretId,
              previous_vault_secret_id: existingConnection.vault_secret_id,
              previous_vault_secret_retire_after: "2026-07-16T12:00:00.000Z",
              provider_metadata: metadata,
            };
          } else {
            db.tenant_connections.push({
              tenant_id: authorization.tenant_id,
              provider: "meta",
              vault_secret_id: newSecretId,
              provider_metadata: metadata,
            });
          }

          authorization.status = "completed";
          authorization.consumed_at = "2026-07-15T12:00:01.000Z";
          db.connection_audit_events.push({
            event: "authorization_completed",
            metadata: {
              provider: "meta",
              catalog_id: authorization.catalog_id,
              request_id: authorization.request_id,
              authorization_id: authorization.authorization_id,
              graph_api_version: args.p_graph_api_version,
            },
          });

          return {
            data: [
              {
                connection_id: "55555555-5555-4555-8555-555555555555",
                connection_action: existingConnection ? "updated" : "created",
                connection_status: "completed",
              },
            ],
            error: null,
          };
        }

        return { data: null, error: new Error(`unexpected rpc ${name}`) };
      }),
  };
}

function withoutGovernedVaultTokenWrite(calls) {
  return calls.map((call) => {
    if (call.name !== "complete_yzi_imob_meta_connection") {
      return call;
    }
    const args = { ...call.args };
    delete args.p_access_token;
    return { ...call, args };
  });
}

function functionAcl(signatureStart) {
  const marker = `revoke all on function ${signatureStart}`;
  const start = MIGRATION_SQL.lastIndexOf(marker);
  assert.notEqual(start, -1, `missing ACL for ${signatureStart}`);
  const next = MIGRATION_SQL.indexOf("\nrevoke all on function ", start + marker.length);
  return MIGRATION_SQL.slice(start, next === -1 ? MIGRATION_SQL.length : next);
}

for (const [rpcName, signature] of [
  ["consume", "public.consume_yzi_imob_meta_authorization(text)"],
  ["failure", "public.record_yzi_imob_meta_authorization_failure(uuid, text, text, text)"],
  ["complete", "public.complete_yzi_imob_meta_connection("],
]) {
  for (const role of ["anon", "authenticated"]) {
    test(`${role} cannot execute ${rpcName} directly`, () => {
      const acl = functionAcl(signature);
      assert.match(acl, /from public, anon, authenticated, service_role,/i);
      assert.doesNotMatch(acl, new RegExp(`to\\s+[^;]*\\b${role}\\b`, "i"));
    });
  }
}

function requestUrl(params) {
  const url = new URL("https://app.example.com/api/oauth/meta/callback");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
}

function fetchSequence(...responses) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), init });
    const next = responses.shift();
    if (next instanceof Error) {
      throw next;
    }
    return next;
  };
  fetchImpl.calls = calls;
  return fetchImpl;
}

test("callback config is server-only and requires app secret", () => {
  assert.equal(readMetaOAuthCallbackConfig({ ...META_ENV, META_APP_SECRET: "" }), null);
  assert.equal(
    readMetaOAuthCallbackConfig({
      ...META_ENV,
      META_LOGIN_REDIRECT_URI: "https://app.example.com/callback?next=https://evil.example",
    }),
    null,
  );

  const config = readMetaOAuthCallbackConfig(META_ENV);
  assert.equal(config?.appId, META_ENV.META_APP_ID);
  assert.equal(config?.redirectUri.origin, "https://app.example.com");
  assert.equal(config?.graphApiVersion, "v25.0");
});

test("least-privilege callback client is server-only, sessionless, and narrowly exported", () => {
  assert.match(SERVER_CLIENT_SOURCE, /^import "server-only";/);
  assert.match(SERVER_CLIENT_SOURCE, /process\.env\.META_OAUTH_CALLBACK_DATABASE_URL/);
  assert.match(SERVER_CLIENT_SOURCE, /yzi_meta_oauth_callback_runtime_a/);
  assert.match(SERVER_CLIENT_SOURCE, /yzi_meta_oauth_callback_runtime_b/);
  assert.match(SERVER_CLIENT_SOURCE, /prepare:\s*false/);
  assert.match(SERVER_CLIENT_SOURCE, /max:\s*1/);
  assert.match(SERVER_CLIENT_SOURCE, /sslMode !== "require"/);
  assert.doesNotMatch(SERVER_CLIENT_SOURCE, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(SERVER_CLIENT_SOURCE, /createClient\s*\(/);
  assert.doesNotMatch(SERVER_CLIENT_SOURCE, /NEXT_PUBLIC_SUPABASE_(ANON|PUBLISHABLE)_KEY/);
  assert.doesNotMatch(SERVER_CLIENT_SOURCE, /\bcookies\s*\(/);
  assert.doesNotMatch(SERVER_CLIENT_SOURCE, /export\s+(const|let|var)\s+(sql|postgres|client)/i);
  assert.doesNotMatch(SERVER_CLIENT_SOURCE, /\.unsafe\s*\(/);
  assert.doesNotMatch(SERVER_CLIENT_SOURCE, /console\.(log|error|warn|debug)/);
  assert.match(ENV_EXAMPLE, /^META_OAUTH_CALLBACK_DATABASE_URL=$/m);
  assert.doesNotMatch(ENV_EXAMPLE, /^SUPABASE_SERVICE_ROLE_KEY=/m);
  assert.doesNotMatch(ENV_EXAMPLE, /^NEXT_PUBLIC_.*(SERVICE_ROLE|CALLBACK_DATABASE)/m);
});

test("Route Handler uses only the dedicated privileged callback client", () => {
  assert.match(ROUTE_SOURCE, /getMetaOAuthCallbackServerRpcClient/);
  assert.match(ROUTE_SOURCE, /handleMetaOAuthCallbackRequest/);
  assert.doesNotMatch(ROUTE_SOURCE, /createServerSupabaseClient|createServerClient|cookies\s*\(/);
  assert.doesNotMatch(ROUTE_SOURCE, /NEXT_PUBLIC_SUPABASE_(ANON|PUBLISHABLE)_KEY/);
  assert.doesNotMatch(ROUTE_SOURCE, /console\.(log|error|warn|debug)/);
});

test("missing privileged configuration fails closed before consume without leaking the error", async () => {
  const capturedLogs = [];
  const previousError = console.error;
  console.error = (...args) => capturedLogs.push(args);

  try {
    const result = await handleMetaOAuthCallbackRequest(
      requestUrl({ state: RAW_STATE, code: "meta-code" }),
      () => {
        throw new Error(TOKEN_SENTINEL);
      },
      fetchSequence(),
      META_ENV,
    );

    assert.equal(result.status, "internal_error");
    assert.equal(result.redirectUrl.includes(TOKEN_SENTINEL), false);
    assert.equal(JSON.stringify(capturedLogs).includes(TOKEN_SENTINEL), false);
  } finally {
    console.error = previousError;
  }
});

test("state format and hash are strict", () => {
  assert.equal(isValidOAuthState(RAW_STATE), true);
  assert.equal(isValidOAuthState("short"), false);
  assert.match(STATE_HASH, /^[a-f0-9]{64}$/);
});

test("result redirect is internal and contains only sanitized status", () => {
  const redirect = new URL(buildCallbackResultUrl("https://app.example.com", "success"));
  assert.equal(redirect.origin, "https://app.example.com");
  assert.equal(redirect.pathname, "/cockpit/yzi-imob/conexoes");
  assert.equal(redirect.searchParams.get("meta_oauth"), "success");
  assert.equal(redirect.searchParams.has("state"), false);
  assert.equal(redirect.searchParams.has("code"), false);
});

test("valid callback consumes state, exchanges short token for long-lived token, stores only through RPC", async () => {
  const { client, calls } = mockSupabase();
  const fetchImpl = fetchSequence(
    jsonResponse({ access_token: "short-token", token_type: "bearer", expires_in: 3600 }),
    jsonResponse({ access_token: "long-token", token_type: "bearer", expires_in: 5_183_944 }),
  );

  const result = await handleMetaOAuthCallback(
    client,
    requestUrl({ state: RAW_STATE, code: "meta-code" }),
    fetchImpl,
    META_ENV,
  );

  assert.equal(result.status, "success");
  assert.equal(new URL(result.redirectUrl).searchParams.get("meta_oauth"), "success");
  assert.deepEqual(
    calls.map((call) => call.name),
    ["consume_yzi_imob_meta_authorization", "complete_yzi_imob_meta_connection"],
  );
  assert.equal(calls[0].args.p_state_hash, STATE_HASH);
  assert.equal(calls[0].args.p_state_hash.includes(RAW_STATE), false);
  assert.equal(calls[1].args.p_access_token, "long-token");
  assert.equal(calls[1].args.p_exchanged_for_long_lived, true);
  assert.equal(JSON.stringify(calls[1].args).includes("short-token"), false);
  assert.equal(JSON.stringify(calls[1].args).includes("meta-code"), false);
  assert.equal(fetchImpl.calls.length, 2);
  assert.match(fetchImpl.calls[0].url, /^https:\/\/graph\.facebook\.com\/v25\.0\/oauth\/access_token\?/);
  assert.match(fetchImpl.calls[0].url, /client_id=1234567890/);
  assert.match(fetchImpl.calls[0].url, /redirect_uri=https%3A%2F%2Fapp\.example\.com%2Fapi%2Foauth%2Fmeta%2Fcallback/);
  assert.match(fetchImpl.calls[0].url, /client_secret=test-app-secret/);
  assert.match(fetchImpl.calls[0].url, /code=meta-code/);
  assert.match(fetchImpl.calls[1].url, /grant_type=fb_exchange_token/);
  assert.match(fetchImpl.calls[1].url, /fb_exchange_token=short-token/);
});

test("long-lived exchange is always attempted for the server-side web-login token", async () => {
  const config = readMetaOAuthCallbackConfig(META_ENV);
  assert.ok(config);

  const longFetch = fetchSequence(
    jsonResponse({ access_token: "long-enough", token_type: "bearer", expires_in: 5_183_944 }),
    jsonResponse({ access_token: "longer-token", token_type: "bearer", expires_in: 5_183_944 }),
  );
  const longResult = await exchangeMetaCodeForToken(config, "code", longFetch);
  assert.equal(longResult.status, "ok");
  assert.equal(longResult.exchangedForLongLived, true);
  assert.equal(longFetch.calls.length, 2);

  const noExpiryFetch = fetchSequence(
    jsonResponse({ access_token: "no-expiry" }),
    jsonResponse({ access_token: "long-from-no-expiry", token_type: "bearer" }),
  );
  const noExpiryResult = await exchangeMetaCodeForToken(config, "code", noExpiryFetch);
  assert.equal(noExpiryResult.status, "ok");
  assert.equal(noExpiryResult.expiresAt, null);
  assert.equal(noExpiryFetch.calls.length, 2);
});

test("missing or malformed state fails before any database write", async () => {
  for (const state of [null, "short", "bad+state".padEnd(43, "A")]) {
    const { client, calls } = mockSupabase();
    const params = state ? { state, code: "meta-code" } : { code: "meta-code" };
    const result = await handleMetaOAuthCallback(client, requestUrl(params), fetch, META_ENV);
    assert.equal(result.status, "invalid_state");
    assert.equal(calls.length, 0);
  }
});

test("missing env fails before consuming state", async () => {
  const { client, calls } = mockSupabase();
  const result = await handleMetaOAuthCallback(
    client,
    requestUrl({ state: RAW_STATE, code: "meta-code" }),
    fetch,
    { ...META_ENV, META_APP_SECRET: "" },
  );

  assert.equal(result.status, "internal_error");
  assert.equal(calls.length, 0);
});

test("invalid, expired, and consumed states are mapped safely", async () => {
  const cases = [
    [{ code: "22023", message: "invalid_state" }, "invalid_state"],
    [{ code: "22023", message: "authorization_expired" }, "expired"],
    [{ code: "55000", message: "authorization_already_consumed" }, "invalid_state"],
  ];

  for (const [consumeError, expected] of cases) {
    const { client } = mockSupabase({ consumeError });
    const fetchImpl = fetchSequence(
      jsonResponse({ access_token: "short-token", token_type: "bearer", expires_in: 3600 }),
      jsonResponse({ access_token: "long-token", token_type: "bearer", expires_in: 5_183_944 }),
    );
    const result = await handleMetaOAuthCallback(
      client,
      requestUrl({ state: RAW_STATE, code: "meta-code" }),
      fetchImpl,
      META_ENV,
    );
    assert.equal(result.status, expected);
  }
});

test("expired pending authorization remains failed after consume returns", async () => {
  const { client, calls, db } = mockStatefulSupabase({
    authorizationOverrides: {
      expires_at: "2026-07-15T11:59:00.000Z",
    },
  });
  const fetchImpl = fetchSequence(
    jsonResponse({ access_token: "short-token", token_type: "bearer", expires_in: 3600 }),
    jsonResponse({ access_token: "long-token", token_type: "bearer", expires_in: 5_183_944 }),
  );

  const result = await handleMetaOAuthCallback(
    client,
    requestUrl({ state: RAW_STATE, code: "meta-code" }),
    fetchImpl,
    META_ENV,
  );

  assert.equal(result.status, "expired");
  assert.equal(db.authorizations[0].status, "failed");
  assert.equal(db.authorizations[0].failure_code, "authorization_expired");
  assert.equal(db.connection_audit_events.at(-1).metadata.failure_code, "authorization_expired");
  assert.deepEqual(calls.map((call) => call.name), ["consume_yzi_imob_meta_authorization"]);
  assert.equal(fetchImpl.calls.length, 2);
});

test("expired processing lease closes as failed without rollback or code retry", async () => {
  const { client, calls, db } = mockStatefulSupabase({
    authorizationOverrides: {
      status: "processing",
      processing_started_at: "2026-07-15T11:55:00.000Z",
      processing_lease_expires_at: "2026-07-15T11:59:00.000Z",
    },
  });
  const fetchImpl = fetchSequence(
    jsonResponse({ access_token: "short-token", token_type: "bearer", expires_in: 3600 }),
    jsonResponse({ access_token: "long-token", token_type: "bearer", expires_in: 5_183_944 }),
  );

  const result = await handleMetaOAuthCallback(
    client,
    requestUrl({ state: RAW_STATE, code: "meta-code" }),
    fetchImpl,
    META_ENV,
  );

  assert.equal(result.status, "invalid_state");
  assert.equal(db.authorizations[0].status, "failed");
  assert.equal(db.authorizations[0].failure_code, "processing_abandoned");
  assert.equal(db.authorizations[0].processing_lease_expires_at, null);
  assert.equal(db.connection_audit_events.at(-1).metadata.failure_code, "processing_abandoned");
  assert.deepEqual(calls.map((call) => call.name), ["consume_yzi_imob_meta_authorization"]);
  assert.equal(fetchImpl.calls.length, 2);
});

test("official provider cancellation does not claim or mutate authorization state", async () => {
  const { client, calls, db } = mockStatefulSupabase();
  const fetchImpl = fetchSequence();
  const result = await handleMetaOAuthCallback(
    client,
    requestUrl({ state: RAW_STATE, error: "access_denied", error_reason: "user_denied" }),
    fetchImpl,
    META_ENV,
  );

  assert.equal(result.status, "cancelled");
  assert.equal(fetchImpl.calls.length, 0);
  assert.equal(calls.length, 0);
  assert.equal(db.authorizations[0].status, "pending");
});

test("missing code after a valid state does not claim or mutate authorization state", async () => {
  const { client, calls, db } = mockStatefulSupabase();
  const fetchImpl = fetchSequence();
  const result = await handleMetaOAuthCallback(
    client,
    requestUrl({ state: RAW_STATE }),
    fetchImpl,
    META_ENV,
  );

  assert.equal(result.status, "provider_error");
  assert.equal(fetchImpl.calls.length, 0);
  assert.equal(calls.length, 0);
  assert.equal(db.authorizations[0].status, "pending");
});

test("Meta timeout and invalid responses are sanitized and never complete the connection", async () => {
  const timeoutError = new Error("timeout token leaked-token");
  timeoutError.name = "AbortError";
  const invalidCases = [
    [timeoutError, "token_exchange_timeout"],
    [new Response("{}", { status: 500, headers: { "content-type": "application/json" } }), "token_response_invalid"],
    [new Response("not json", { status: 200, headers: { "content-type": "application/json" } }), "token_response_invalid"],
    [jsonResponse({ token_type: "bearer" }), "token_response_invalid"],
    [new Response("{}", { status: 200, headers: { "content-type": "text/html" } }), "token_response_invalid"],
    [jsonResponse({ access_token: "token", unexpected: true }), "token_response_invalid"],
    [
      new Response(JSON.stringify({ access_token: "x".repeat(20_000) }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
      "token_response_invalid",
    ],
  ];

  for (const [response, expectedFailure] of invalidCases) {
    const { client, calls } = mockSupabase();
    const fetchImpl = fetchSequence(response);
    const result = await handleMetaOAuthCallback(
      client,
      requestUrl({ state: RAW_STATE, code: "meta-code" }),
      fetchImpl,
      META_ENV,
    );
    assert.equal(result.status, "provider_error");
    assert.equal(calls.length, 0, expectedFailure);
    assert.equal(JSON.stringify(calls).includes("leaked-token"), false);
  }
});

test("initial token is not stored when the long-lived exchange fails", async () => {
  const { client, calls } = mockSupabase();
  const fetchImpl = fetchSequence(
    jsonResponse({ access_token: "short-token", token_type: "bearer", expires_in: 3600 }),
    jsonResponse({ error: { message: "provider raw" } }, { status: 400 }),
  );

  const result = await handleMetaOAuthCallback(
    client,
    requestUrl({ state: RAW_STATE, code: "meta-code" }),
    fetchImpl,
    META_ENV,
  );

  assert.equal(result.status, "provider_error");
  assert.equal(calls.length, 0);
  assert.equal(JSON.stringify(calls).includes("short-token"), false);
});

test("browser with raw state and arbitrary token input cannot claim, fail, or write Vault", async () => {
  const { client, calls, db } = mockStatefulSupabase();
  const fetchImpl = fetchSequence(
    new Response("{}", { status: 400, headers: { "content-type": "application/json" } }),
  );

  const url = requestUrl({
    state: RAW_STATE,
    code: "browser-controlled-code",
    access_token: TOKEN_SENTINEL,
  });
  const result = await handleMetaOAuthCallback(client, url, fetchImpl, META_ENV);

  assert.equal(result.status, "provider_error");
  assert.equal(db.authorizations[0].status, "pending");
  assert.equal(db.vaultWrites.length, 0);
  assert.equal(db.tenant_connections.length, 0);
  assert.equal(calls.length, 0);
  assert.equal(result.redirectUrl.includes(TOKEN_SENTINEL), false);
});

test("persistence failure does not return success and records a sanitized failure", async () => {
  const { client, calls } = mockSupabase({ completeError: { code: "50000" } });
  const fetchImpl = fetchSequence(
    jsonResponse({ access_token: "long-token", token_type: "bearer", expires_in: 5_183_944 }),
    jsonResponse({ access_token: "longer-token", token_type: "bearer", expires_in: 5_183_944 }),
  );

  const result = await handleMetaOAuthCallback(
    client,
    requestUrl({ state: RAW_STATE, code: "meta-code" }),
    fetchImpl,
    META_ENV,
  );

  assert.equal(result.status, "internal_error");
  assert.equal(calls.at(-1).name, "record_yzi_imob_meta_authorization_failure");
  assert.equal(calls.at(-1).args.p_failure_code, "vault_or_connection_failed");
  assert.equal(result.redirectUrl.includes("authorizationUrl"), false);
});

test("two concurrent callbacks with the same state produce a single claim and rotation", async () => {
  const { client, calls } = mockStatefulSupabase();
  const fetchImpl = fetchSequence(
    jsonResponse({ access_token: "short-token-a", token_type: "bearer", expires_in: 3600 }),
    jsonResponse({ access_token: "short-token-b", token_type: "bearer", expires_in: 3600 }),
    jsonResponse({ access_token: "long-token-a", token_type: "bearer", expires_in: 5_183_944 }),
    jsonResponse({ access_token: "long-token-b", token_type: "bearer", expires_in: 5_183_944 }),
  );

  const [first, second] = await Promise.all([
    handleMetaOAuthCallback(client, requestUrl({ state: RAW_STATE, code: "meta-code" }), fetchImpl, META_ENV),
    handleMetaOAuthCallback(client, requestUrl({ state: RAW_STATE, code: "meta-code" }), fetchImpl, META_ENV),
  ]);

  assert.equal([first.status, second.status].filter((status) => status === "success").length, 1);
  assert.equal(fetchImpl.calls.length, 4);
  assert.equal(
    calls.filter((call) => call.name === "consume_yzi_imob_meta_authorization").length,
    2,
  );
  assert.equal(
    calls.filter((call) => call.name === "complete_yzi_imob_meta_connection").length,
    1,
  );
});

test("replayed callback after completion cannot rotate again", async () => {
  const { client, calls } = mockStatefulSupabase();
  const firstFetch = fetchSequence(
    jsonResponse({ access_token: "short-token", token_type: "bearer", expires_in: 3600 }),
    jsonResponse({ access_token: "long-token", token_type: "bearer", expires_in: 5_183_944 }),
  );
  const replayFetch = fetchSequence();

  const first = await handleMetaOAuthCallback(
    client,
    requestUrl({ state: RAW_STATE, code: "meta-code" }),
    firstFetch,
    META_ENV,
  );
  const replay = await handleMetaOAuthCallback(
    client,
    requestUrl({ state: RAW_STATE, code: "meta-code" }),
    replayFetch,
    META_ENV,
  );

  assert.equal(first.status, "success");
  assert.equal(replay.status, "provider_error");
  assert.equal(replayFetch.calls.length, 1);
  assert.equal(
    calls.filter((call) => call.name === "complete_yzi_imob_meta_connection").length,
    1,
  );
});

test("sentinel token exists only in the governed Vault write boundary", async () => {
  const capturedLogs = [];
  const previousConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    debug: console.debug,
  };
  console.log = console.error = console.warn = console.debug = (...args) => {
    capturedLogs.push(args);
  };

  try {
    const { client, calls, db } = mockStatefulSupabase();
    const fetchImpl = fetchSequence(
      jsonResponse({ access_token: "short-token", token_type: "bearer", expires_in: 3600 }),
      jsonResponse({ access_token: TOKEN_SENTINEL, token_type: "bearer", expires_in: 5_183_944 }),
    );

    const result = await handleMetaOAuthCallback(
      client,
      requestUrl({ state: RAW_STATE, code: "meta-code" }),
      fetchImpl,
      META_ENV,
    );

    assert.equal(result.status, "success");
    assert.equal(db.vaultWrites.length, 1);
    assert.equal(db.vaultWrites[0].value, TOKEN_SENTINEL);
    assert.equal(result.redirectUrl.includes(TOKEN_SENTINEL), false);
    assert.equal(JSON.stringify(withoutGovernedVaultTokenWrite(calls)).includes(TOKEN_SENTINEL), false);
    assert.equal(JSON.stringify(capturedLogs).includes(TOKEN_SENTINEL), false);
    assert.equal(JSON.stringify(db.connection_audit_events).includes(TOKEN_SENTINEL), false);
    assert.equal(JSON.stringify(db.provider_metadata).includes(TOKEN_SENTINEL), false);
    assert.equal(JSON.stringify(db.connection_authorizations).includes(TOKEN_SENTINEL), false);
    assert.equal(JSON.stringify(db.tenant_connections).includes(TOKEN_SENTINEL), false);
  } finally {
    console.log = previousConsole.log;
    console.error = previousConsole.error;
    console.warn = previousConsole.warn;
    console.debug = previousConsole.debug;
  }
});

test("rotation creates a new secret, preserves the previous secret, and cleans orphan on failure", async () => {
  const previousSecretId = "99999999-9999-4999-8999-999999999999";
  const existingConnection = {
    tenant_id: AUTHORIZATION_ROW.tenant_id,
    provider: "meta",
    vault_secret_id: previousSecretId,
    provider_metadata: {},
  };

  const success = mockStatefulSupabase({ existingConnection });
  const successFetch = fetchSequence(
    jsonResponse({ access_token: "short-token", token_type: "bearer", expires_in: 3600 }),
    jsonResponse({ access_token: "new-long-token", token_type: "bearer", expires_in: 5_183_944 }),
  );
  const successResult = await handleMetaOAuthCallback(
    success.client,
    requestUrl({ state: RAW_STATE, code: "meta-code" }),
    successFetch,
    META_ENV,
  );

  assert.equal(successResult.status, "success");
  assert.notEqual(success.db.tenant_connections[0].vault_secret_id, previousSecretId);
  assert.equal(success.db.tenant_connections[0].previous_vault_secret_id, previousSecretId);
  assert.equal(
    success.db.tenant_connections[0].previous_vault_secret_retire_after,
    "2026-07-16T12:00:00.000Z",
  );
  assert.equal(success.db.provider_metadata[0].previous_secret_retained, true);
  assert.equal(JSON.stringify(success.db).includes(previousSecretId), true);

  const failure = mockStatefulSupabase({ existingConnection, failCompleteAfterSecret: true });
  const failureFetch = fetchSequence(
    jsonResponse({ access_token: "short-token", token_type: "bearer", expires_in: 3600 }),
    jsonResponse({ access_token: "new-long-token", token_type: "bearer", expires_in: 5_183_944 }),
  );
  const failureResult = await handleMetaOAuthCallback(
    failure.client,
    requestUrl({ state: RAW_STATE, code: "meta-code" }),
    failureFetch,
    META_ENV,
  );

  assert.equal(failureResult.status, "internal_error");
  assert.equal(failure.db.tenant_connections[0].vault_secret_id, previousSecretId);
  assert.deepEqual(failure.db.orphanCleanups, ["77777777-7777-4777-8777-777777777777"]);
});

test("migration consumes authorization atomically and blocks replay", () => {
  const consumeSql = MIGRATION_SQL.slice(
    MIGRATION_SQL.indexOf("create or replace function public.consume_yzi_imob_meta_authorization"),
    MIGRATION_SQL.indexOf("create or replace function public.record_yzi_imob_meta_authorization_failure"),
  );
  assert.match(MIGRATION_SQL, /create or replace function public\.consume_yzi_imob_meta_authorization/i);
  assert.match(MIGRATION_SQL, /security definer/i);
  assert.match(MIGRATION_SQL, /set search_path to 'pg_catalog', 'public', 'auth'/i);
  assert.match(MIGRATION_SQL, /where ca\.provider = 'meta'[\s\S]+and ca\.state_hash = p_state_hash[\s\S]+for update;/i);
  assert.match(MIGRATION_SQL, /status = 'processing'/i);
  assert.match(MIGRATION_SQL, /processing_lease_expires_at = v_lease_expires_at/i);
  assert.match(MIGRATION_SQL, /and ca\.status = 'pending'/i);
  assert.match(MIGRATION_SQL, /ca\.expires_at > v_claimed_at/i);
  assert.match(MIGRATION_SQL, /tm\.status = 'active'/i);
  assert.match(MIGRATION_SQL, /t\.status = 'active'/i);
  assert.match(MIGRATION_SQL, /tm\.role = any \(array\['owner', 'admin'\]::text\[\]\)/i);
  assert.match(consumeSql, /claim_status := 'claimed'/i);
  assert.match(consumeSql, /claim_status := 'expired'[\s\S]+return next;[\s\S]+return;/i);
  assert.match(consumeSql, /claim_status := 'processing_abandoned'[\s\S]+return next;[\s\S]+return;/i);
  assert.match(consumeSql, /failure_code = 'authorization_expired'/i);
  assert.match(consumeSql, /failure_code = 'processing_abandoned'/i);
  assert.doesNotMatch(consumeSql, /raise exception[^;]+authorization_(expired|processing_abandoned)/i);
  assert.doesNotMatch(MIGRATION_SQL, /set consumed_at[\s\S]{0,120}v_claimed_at/i);
  assert.doesNotMatch(MIGRATION_SQL, /\bexecute\s+(format|immediate|using|\()/i);
});

test("only the dedicated callback executor receives callback RPC EXECUTE by exact signature", () => {
  const consumeAcl = functionAcl("public.consume_yzi_imob_meta_authorization(text)");
  const failureAcl = functionAcl(
    "public.record_yzi_imob_meta_authorization_failure(uuid, text, text, text)",
  );
  const completeAcl = functionAcl("public.complete_yzi_imob_meta_connection(");

  for (const acl of [consumeAcl, failureAcl, completeAcl]) {
    assert.match(acl, /from public, anon, authenticated, service_role,/i);
    assert.match(acl, /to yzi_meta_oauth_callback_executor;/i);
    assert.doesNotMatch(acl, /to\s+(public|anon|authenticated|service_role)\b/i);
  }

  assert.doesNotMatch(MIGRATION_SQL, /grant\s+.*\s+on\s+(table\s+)?vault\./i);
  assert.match(MIGRATION_SQL, /vault\.create_secret/i);
  assert.doesNotMatch(MIGRATION_SQL, /vault\.update_secret/i);
  assert.match(MIGRATION_SQL, /delete from vault\.secrets/i);
});

test("callback database roles have no global, RLS-bypass, table, Vault, Auth, or Storage authority", () => {
  assert.match(MIGRATION_SQL, /create role yzi_meta_oauth_callback_executor[\s\S]+nologin noinherit[\s\S]+nobypassrls;/i);
  assert.match(MIGRATION_SQL, /create role yzi_meta_oauth_callback_runtime_a[\s\S]+login password null inherit[\s\S]+nobypassrls;/i);
  assert.match(MIGRATION_SQL, /create role yzi_meta_oauth_callback_runtime_b[\s\S]+login password null inherit[\s\S]+nobypassrls;/i);
  assert.match(MIGRATION_SQL, /grant yzi_meta_oauth_callback_executor to[\s\S]+yzi_meta_oauth_callback_runtime_a,[\s\S]+yzi_meta_oauth_callback_runtime_b;/i);
  assert.match(MIGRATION_SQL, /revoke all on all tables in schema public, auth, storage, vault from[\s\S]+yzi_meta_oauth_callback_executor/i);
  assert.match(MIGRATION_SQL, /revoke all on all sequences in schema public, auth, storage, vault from[\s\S]+yzi_meta_oauth_callback_executor/i);
  assert.match(MIGRATION_SQL, /revoke all on all functions in schema public, auth, storage, vault from[\s\S]+yzi_meta_oauth_callback_executor/i);
  assert.match(MIGRATION_SQL, /grant usage on schema public to yzi_meta_oauth_callback_executor;/i);
  assert.doesNotMatch(MIGRATION_SQL, /grant\s+.*\s+on\s+(table\s+)?vault\./i);
  assert.doesNotMatch(MIGRATION_SQL, /alter role yzi_meta_oauth_callback_(executor|runtime_[ab])[\s\S]{0,200}\bbypassrls\b(?!;)/i);
  assert.match(MIGRATION_SQL, /callback_role_has_unexpected_table_privilege/i);
  assert.match(MIGRATION_SQL, /callback_role_has_unexpected_function_privilege/i);
  assert.match(MIGRATION_SQL, /has_table_privilege\(v_runtime_role, c\.oid, 'SELECT'\)/i);
  assert.match(MIGRATION_SQL, /has_function_privilege\(v_runtime_role, p\.oid, 'EXECUTE'\)/i);
});

test("SECURITY DEFINER callback RPCs accept only the two dedicated session users", () => {
  for (const marker of [
    "create or replace function public.consume_yzi_imob_meta_authorization",
    "create or replace function public.record_yzi_imob_meta_authorization_failure",
    "create or replace function public.complete_yzi_imob_meta_connection",
  ]) {
    const start = MIGRATION_SQL.indexOf(marker);
    assert.notEqual(start, -1);
    const body = MIGRATION_SQL.slice(start, MIGRATION_SQL.indexOf("$$;", start));
    assert.match(body, /session_user not in \([\s\S]+yzi_meta_oauth_callback_runtime_a[\s\S]+yzi_meta_oauth_callback_runtime_b[\s\S]+callback_executor_required/i);
  }
});

test(
  "provisioned callback credential cannot access tables, Vault, Auth, Storage, or other RPCs",
  { skip: !process.env.META_OAUTH_CALLBACK_DATABASE_URL },
  async () => {
    const sql = postgres(process.env.META_OAUTH_CALLBACK_DATABASE_URL, {
      max: 1,
      prepare: false,
      connect_timeout: 5,
      idle_timeout: 1,
    });

    const expectPrivilegeDenied = async (query) => {
      await assert.rejects(query, (error) => {
        assert.equal(typeof error?.code, "string");
        return error.code === "42501";
      });
    };

    try {
      const [role] = await sql`
        select rolname, rolsuper, rolcreaterole, rolcreatedb, rolreplication, rolbypassrls
        from pg_catalog.pg_roles
        where rolname = current_user
      `;
      assert.match(role.rolname, /^yzi_meta_oauth_callback_runtime_[ab]$/);
      assert.equal(role.rolsuper, false);
      assert.equal(role.rolcreaterole, false);
      assert.equal(role.rolcreatedb, false);
      assert.equal(role.rolreplication, false);
      assert.equal(role.rolbypassrls, false);

      const [rpcAcl] = await sql`
        select
          has_function_privilege(current_user, 'public.consume_yzi_imob_meta_authorization(text)', 'execute') as consume,
          has_function_privilege(current_user, 'public.record_yzi_imob_meta_authorization_failure(uuid,text,text,text)', 'execute') as failure,
          has_function_privilege(current_user, 'public.complete_yzi_imob_meta_connection(uuid,text,text,text,timestamptz,text,boolean)', 'execute') as complete,
          has_function_privilege(current_user, 'public.start_yzi_imob_meta_authorization(uuid,text,text,timestamptz,text,text)', 'execute') as start,
          has_function_privilege(current_user, 'public.get_yzi_imob_tenant_connections(uuid)', 'execute') as connections
      `;
      assert.deepEqual(rpcAcl, {
        consume: true,
        failure: true,
        complete: true,
        start: false,
        connections: false,
      });

      const unexpectedTables = await sql`
        select n.nspname, c.relname
        from pg_catalog.pg_class c
        join pg_catalog.pg_namespace n on n.oid = c.relnamespace
        where n.nspname in ('public', 'auth', 'storage', 'vault')
          and c.relkind in ('r', 'p', 'v', 'm', 'f')
          and has_schema_privilege(current_user, n.oid, 'usage')
          and (
            has_table_privilege(current_user, c.oid, 'select')
            or has_table_privilege(current_user, c.oid, 'insert')
            or has_table_privilege(current_user, c.oid, 'update')
            or has_table_privilege(current_user, c.oid, 'delete')
          )
      `;
      assert.equal(unexpectedTables.length, 0);

      const unexpectedFunctions = await sql`
        select p.oid::regprocedure::text as signature
        from pg_catalog.pg_proc p
        join pg_catalog.pg_namespace n on n.oid = p.pronamespace
        where n.nspname in ('public', 'auth', 'storage', 'vault')
          and has_schema_privilege(current_user, n.oid, 'usage')
          and has_function_privilege(current_user, p.oid, 'execute')
          and p.oid not in (
            'public.consume_yzi_imob_meta_authorization(text)'::regprocedure,
            'public.record_yzi_imob_meta_authorization_failure(uuid,text,text,text)'::regprocedure,
            'public.complete_yzi_imob_meta_connection(uuid,text,text,text,timestamptz,text,boolean)'::regprocedure
          )
      `;
      assert.equal(unexpectedFunctions.length, 0);

      for (const query of [
        sql`select * from public.connection_authorizations limit 1`,
        sql`select * from public.tenant_connections limit 1`,
        sql`select * from public.connection_audit_events limit 1`,
        sql`select * from vault.secrets limit 1`,
        sql`select * from vault.decrypted_secrets limit 1`,
        sql`select * from auth.users limit 1`,
        sql`select * from storage.objects limit 1`,
      ]) {
        await expectPrivilegeDenied(query);
      }

      await expectPrivilegeDenied(sql`insert into public.connection_authorizations default values`);
      await expectPrivilegeDenied(sql`update public.connection_authorizations set status = status`);
      await expectPrivilegeDenied(sql`delete from public.connection_authorizations`);
      await expectPrivilegeDenied(sql`select vault.create_secret('negative-test-sentinel')`);
      await expectPrivilegeDenied(sql`select * from public.get_yzi_imob_tenant_connections(null::uuid)`);
      await expectPrivilegeDenied(sql`
        select * from public.start_yzi_imob_meta_authorization(
          null::uuid, null::text, null::text, null::timestamptz, null::text, null::text
        )
      `);
    } finally {
      await sql.end({ timeout: 1 });
    }
  },
);

test("start remains authenticated-only with internal owner-admin authorization", () => {
  const startAcl = functionAcl("public.start_yzi_imob_meta_authorization(");
  assert.match(startAcl, /from public, anon, authenticated, service_role,/i);
  assert.match(startAcl, /to authenticated;/i);
  assert.doesNotMatch(startAcl, /to\s+(public|anon|service_role)\b/i);
  assert.match(MIGRATION_SQL, /v_user_id uuid := auth\.uid\(\);/i);
  assert.match(MIGRATION_SQL, /tm\.status = 'active'/i);
  assert.match(MIGRATION_SQL, /tm\.role = any \(array\['owner', 'admin'\]::text\[\]\)/i);
  assert.match(MIGRATION_SQL, /t\.status = 'active'/i);
});

test("raw state knowledge gives browser roles no state-changing database capability", () => {
  assert.match(STATE_HASH, /^[a-f0-9]{64}$/);
  for (const signature of [
    "public.consume_yzi_imob_meta_authorization(text)",
    "public.record_yzi_imob_meta_authorization_failure(uuid, text, text, text)",
    "public.complete_yzi_imob_meta_connection(",
  ]) {
    const acl = functionAcl(signature);
    assert.doesNotMatch(acl, /to\s+(anon|authenticated)\b/i);
  }
});

test("migration stores tokens only in Vault and never in tenant connection metadata", () => {
  assert.match(MIGRATION_SQL, /p_access_token/i);
  assert.match(MIGRATION_SQL, /vault\.create_secret\(\s*p_access_token/i);
  assert.doesNotMatch(MIGRATION_SQL, /vault\.update_secret\([\s\S]+p_access_token/i);
  assert.doesNotMatch(MIGRATION_SQL, /provider_metadata[\s\S]{0,500}access_token/i);
  assert.doesNotMatch(MIGRATION_SQL, /provider_metadata[\s\S]{0,500}'token'/i);
  assert.match(MIGRATION_SQL, /vault_secret_id = v_new_secret_id/i);
  assert.match(MIGRATION_SQL, /previous_secret_retained/i);
});

test("complete accepts only governed callback inputs and returns no Vault identifier", () => {
  const completeSql = MIGRATION_SQL.slice(
    MIGRATION_SQL.indexOf("create or replace function public.complete_yzi_imob_meta_connection"),
    MIGRATION_SQL.indexOf("comment on function public.complete_yzi_imob_meta_connection"),
  );
  const signatureAndReturn = completeSql.slice(0, completeSql.indexOf("language plpgsql"));

  assert.match(signatureAndReturn, /p_authorization_id uuid/i);
  assert.match(signatureAndReturn, /p_state_hash text/i);
  assert.match(signatureAndReturn, /p_access_token text/i);
  assert.match(signatureAndReturn, /connection_id uuid/i);
  assert.match(signatureAndReturn, /connection_action text/i);
  assert.match(signatureAndReturn, /connection_status text/i);
  assert.doesNotMatch(signatureAndReturn, /p_(tenant_id|user_id|provider|connection_id|vault_secret_id|event|metadata)/i);
  assert.doesNotMatch(signatureAndReturn, /vault_secret_id uuid/i);
  assert.match(completeSql, /where ca\.id = p_authorization_id[\s\S]+ca\.state_hash = p_state_hash/i);
  assert.match(completeSql, /where tc\.tenant_id = v_authorization\.tenant_id[\s\S]+tc\.provider = 'meta'/i);
});

test("migration creates or updates one Meta connection and creates no assets", () => {
  assert.match(MIGRATION_SQL, /where tc\.tenant_id = v_authorization\.tenant_id[\s\S]+and tc\.provider = 'meta'[\s\S]+and tc\.revoked_at is null[\s\S]+for update;/i);
  assert.match(MIGRATION_SQL, /insert into public\.tenant_connections/i);
  assert.match(MIGRATION_SQL, /status = 'connected'/i);
  assert.match(MIGRATION_SQL, /'connection_created'/i);
  assert.match(MIGRATION_SQL, /'connection_updated'/i);
  assert.match(MIGRATION_SQL, /'secret_rotated'/i);
  assert.match(MIGRATION_SQL, /create_then_swap_reference_temporary_retention/i);
  assert.match(MIGRATION_SQL, /previous_vault_secret_id/i);
  assert.match(MIGRATION_SQL, /previous_vault_secret_retire_after/i);
  assert.match(MIGRATION_SQL, /interval '24 hours'/i);
  assert.match(MIGRATION_SQL, /Previous Vault secret retirement is pending/i);
  assert.match(MIGRATION_SQL, /governed_health_check_then_delete_and_clear_reference/i);
  assert.doesNotMatch(MIGRATION_SQL, /insert into public\.tenant_connection_assets/i);
});

test("audit metadata is allowlisted and contains no state, code, token, raw payload, or secret", () => {
  assert.match(MIGRATION_SQL, /authorization_callback_received/i);
  assert.match(MIGRATION_SQL, /authorization_failed/i);
  assert.match(MIGRATION_SQL, /authorization_cancelled/i);
  assert.match(MIGRATION_SQL, /authorization_completed/i);
  assert.match(MIGRATION_SQL, /'provider', 'meta'/i);
  assert.match(MIGRATION_SQL, /'catalog_id'/i);
  assert.match(MIGRATION_SQL, /'request_id'/i);
  assert.match(MIGRATION_SQL, /'authorization_id'/i);
  assert.match(MIGRATION_SQL, /'graph_api_version'/i);
  assert.doesNotMatch(MIGRATION_SQL, /'state'/i);
  assert.doesNotMatch(MIGRATION_SQL, /'state_hash'/i);
  assert.doesNotMatch(MIGRATION_SQL, /'code'/i);
  assert.doesNotMatch(MIGRATION_SQL, /'access_token'/i);
  assert.doesNotMatch(MIGRATION_SQL, /'payload'/i);
  assert.doesNotMatch(MIGRATION_SQL, /'secret'/i);
  assert.doesNotMatch(MIGRATION_SQL, /vault_secret_id',/i);
});

test("start RPC remains owner-admin governed and records request id on authorization", () => {
  assert.match(MIGRATION_SQL, /v_user_id uuid := auth\.uid\(\);/i);
  assert.match(MIGRATION_SQL, /tm\.status = 'active'/i);
  assert.match(MIGRATION_SQL, /t\.status = 'active'/i);
  assert.match(MIGRATION_SQL, /tm\.role = any \(array\['owner', 'admin'\]::text\[\]\)/i);
  assert.match(MIGRATION_SQL, /not \(p_catalog_id = any \(array\['instagram', 'facebook', 'meta-ads'\]::text\[\]\)\)/i);
  assert.match(MIGRATION_SQL, /request_id\s*\)/i);
  assert.match(MIGRATION_SQL, /p_request_id/i);
});
