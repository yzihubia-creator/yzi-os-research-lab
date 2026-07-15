import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  buildMetaAuthorizationUrl,
  createOAuthState,
  expiresAtFrom,
  hashOAuthState,
  readMetaOAuthConfig,
  startMetaOAuthAuthorization,
} from "../src/lib/yzi-imob/connections/meta-oauth-start.ts";

const VALID_TENANT_ID = "11111111-1111-4111-8111-111111111111";
const MIGRATION_SQL = readFileSync(
  new URL(
    "../../supabase/migrations/20260715005212_yzi_imob_meta_oauth_start_catalog_check_fix_v1.sql",
    import.meta.url,
  ),
  "utf8",
);
const META_ENV = {
  META_APP_ID: "1234567890",
  META_LOGIN_REDIRECT_URI: "https://app.example.com/api/oauth/meta/callback",
  META_GRAPH_API_VERSION: "v25.0",
  META_LOGIN_CONFIG_ID: "9876543210",
};

function withMetaEnv(fn) {
  const previous = {};
  for (const key of Object.keys(META_ENV)) {
    previous[key] = process.env[key];
    process.env[key] = META_ENV[key];
  }

  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const key of Object.keys(META_ENV)) {
        if (previous[key] === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = previous[key];
        }
      }
    });
}

function withoutMetaEnv(fn) {
  const previous = {};
  for (const key of Object.keys(META_ENV)) {
    previous[key] = process.env[key];
    delete process.env[key];
  }

  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const key of Object.keys(META_ENV)) {
        if (previous[key] === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = previous[key];
        }
      }
    });
}

function mockSupabase({ user = true, rpcError = null } = {}) {
  const calls = [];
  return {
    calls,
    client: {
      auth: {
        getUser: async () => ({
          data: { user: user ? { id: "user-1" } : null },
          error: null,
        }),
      },
      rpc: async (name, args) => {
        calls.push({ name, args });
        return { data: null, error: rpcError };
      },
    },
  };
}

test("OAuth state is random and persisted only as a SHA-256 hex hash", () => {
  const first = createOAuthState();
  const second = createOAuthState();

  assert.notEqual(first, second);
  assert.match(first, /^[A-Za-z0-9_-]{43}$/);
  assert.match(hashOAuthState(first), /^[a-f0-9]{64}$/);
});

test("Meta config is server-only, canonical, and rejects unsafe redirect shapes", () => {
  assert.equal(readMetaOAuthConfig({ ...META_ENV, META_LOGIN_REDIRECT_URI: "" }), null);
  assert.equal(
    readMetaOAuthConfig({
      ...META_ENV,
      META_LOGIN_REDIRECT_URI: "https://app.example.com/callback?next=https://evil.example",
    }),
    null,
  );
  assert.equal(
    readMetaOAuthConfig({
      ...META_ENV,
      META_LOGIN_REDIRECT_URI: "http://app.example.com/callback",
    }),
    null,
  );

  const localConfig = readMetaOAuthConfig({
    ...META_ENV,
    META_LOGIN_REDIRECT_URI: "http://localhost:3000/api/oauth/meta/callback",
  });
  assert.equal(localConfig?.redirectUri.origin, "http://localhost:3000");

  const httpsConfig = readMetaOAuthConfig(META_ENV);
  assert.equal(httpsConfig?.graphApiVersion, "v25.0");
});

test("authorization URL uses the official Meta dialog endpoint and Login for Business config_id", () => {
  const config = readMetaOAuthConfig(META_ENV);
  assert.ok(config);

  const url = new URL(buildMetaAuthorizationUrl(config, "raw-state"));

  assert.equal(url.origin, "https://www.facebook.com");
  assert.equal(url.pathname, "/v25.0/dialog/oauth");
  assert.equal(url.searchParams.get("client_id"), META_ENV.META_APP_ID);
  assert.equal(url.searchParams.get("redirect_uri"), META_ENV.META_LOGIN_REDIRECT_URI);
  assert.equal(url.searchParams.get("state"), "raw-state");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("config_id"), META_ENV.META_LOGIN_CONFIG_ID);
  assert.equal(url.searchParams.get("override_default_response_type"), "true");
  assert.equal(url.searchParams.has("scope"), false);
});

test("start denies missing session before any authorization write", async () => {
  const { client, calls } = mockSupabase({ user: false });
  const result = await withMetaEnv(() =>
    startMetaOAuthAuthorization(client, {
      tenantId: VALID_TENANT_ID,
      catalogId: "instagram",
    }),
  );

  assert.equal(result.status, "unauthenticated");
  assert.equal(calls.length, 0);
});

test("start rejects invalid catalog ids before any authorization write", async () => {
  const { client, calls } = mockSupabase();
  const result = await withMetaEnv(() =>
    startMetaOAuthAuthorization(client, {
      tenantId: VALID_TENANT_ID,
      catalogId: "google-ads",
    }),
  );

  assert.equal(result.status, "invalid");
  assert.equal(calls.length, 0);
});

test("start fails safely when Meta env is missing", async () => {
  const { client, calls } = mockSupabase();
  const result = await withoutMetaEnv(() =>
    startMetaOAuthAuthorization(client, {
      tenantId: VALID_TENANT_ID,
      catalogId: "facebook",
    }),
  );

  assert.equal(result.status, "configuration_error");
  assert.equal(calls.length, 0);
});

test("start maps governed RPC authorization failures to a safe forbidden result", async () => {
  const { client, calls } = mockSupabase({ rpcError: { code: "42501" } });
  const result = await withMetaEnv(() =>
    startMetaOAuthAuthorization(client, {
      tenantId: VALID_TENANT_ID,
      catalogId: "meta-ads",
    }),
  );

  assert.equal(result.status, "forbidden");
  assert.equal("authorizationUrl" in result, false);
  assert.equal(calls.length, 1);
});

test("start stores only state_hash and returns only redirect-safe fields", async () => {
  const { client, calls } = mockSupabase();
  const before = Date.now();
  const result = await withMetaEnv(() =>
    startMetaOAuthAuthorization(client, {
      tenantId: VALID_TENANT_ID,
      catalogId: "instagram",
    }),
  );
  const after = Date.now();

  assert.equal(result.status, "ok");
  assert.equal("stateHash" in result, false);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, "start_yzi_imob_meta_authorization");
  assert.equal(calls[0].args.p_tenant_id, VALID_TENANT_ID);
  assert.equal(calls[0].args.p_catalog_id, "instagram");
  assert.match(calls[0].args.p_state_hash, /^[a-f0-9]{64}$/);
  assert.equal(calls[0].args.p_redirect_origin, "https://app.example.com");
  assert.match(calls[0].args.p_request_id, /^[a-f0-9-]{36}$/);

  const authorizationUrl = new URL(result.authorizationUrl);
  const rawState = authorizationUrl.searchParams.get("state");
  assert.ok(rawState);
  assert.equal(hashOAuthState(rawState), calls[0].args.p_state_hash);
  assert.equal(JSON.stringify(calls[0].args).includes(rawState), false);

  const expiresAt = Date.parse(result.expiresAt);
  assert.ok(expiresAt >= before + 9 * 60 * 1000);
  assert.ok(expiresAt <= after + 10 * 60 * 1000 + 1000);
});

test("two consecutive starts produce different URL states and stored hashes", async () => {
  const { client, calls } = mockSupabase();
  const first = await withMetaEnv(() =>
    startMetaOAuthAuthorization(client, {
      tenantId: VALID_TENANT_ID,
      catalogId: "instagram",
    }),
  );
  const second = await withMetaEnv(() =>
    startMetaOAuthAuthorization(client, {
      tenantId: VALID_TENANT_ID,
      catalogId: "instagram",
    }),
  );

  assert.equal(first.status, "ok");
  assert.equal(second.status, "ok");
  const firstState = new URL(first.authorizationUrl).searchParams.get("state");
  const secondState = new URL(second.authorizationUrl).searchParams.get("state");

  assert.ok(firstState);
  assert.ok(secondState);
  assert.notEqual(firstState, secondState);
  assert.notEqual(calls[0].args.p_state_hash, calls[1].args.p_state_hash);
  assert.equal(hashOAuthState(firstState), calls[0].args.p_state_hash);
  assert.equal(hashOAuthState(secondState), calls[1].args.p_state_hash);
});

test("expiration helper is explicitly short-lived", () => {
  assert.equal(expiresAtFrom(1_000), new Date(1_000 + 10 * 60 * 1000).toISOString());
});

test("RPC is a governed authenticated-only write boundary", () => {
  assert.match(MIGRATION_SQL, /security definer/i);
  assert.match(MIGRATION_SQL, /set search_path to 'pg_catalog', 'public', 'auth'/i);
  assert.match(
    MIGRATION_SQL,
    /revoke all on function public\.start_yzi_imob_meta_authorization[\s\S]+from public, anon, authenticated;/i,
  );
  assert.match(
    MIGRATION_SQL,
    /grant execute on function public\.start_yzi_imob_meta_authorization[\s\S]+to authenticated;/i,
  );
  assert.doesNotMatch(MIGRATION_SQL, /\bexecute\s+(format|immediate|using|\()/i);
  assert.match(MIGRATION_SQL, /v_user_id uuid := auth\.uid\(\);/i);
  assert.match(MIGRATION_SQL, /if v_user_id is null/i);
  assert.match(MIGRATION_SQL, /tm\.status = 'active'/i);
  assert.match(MIGRATION_SQL, /t\.status = 'active'/i);
  assert.match(MIGRATION_SQL, /tm\.role = any \(array\['owner', 'admin'\]::text\[\]\)/i);
  assert.doesNotMatch(MIGRATION_SQL, /'operator'|'viewer'/i);
  assert.match(MIGRATION_SQL, /'meta'/i);
  assert.match(MIGRATION_SQL, /'authorization_started'/i);
});

test("RPC audit metadata is allowlisted and contains no OAuth or secret material", () => {
  assert.match(MIGRATION_SQL, /jsonb_build_object\(/i);
  assert.match(MIGRATION_SQL, /'catalog_id', p_catalog_id/i);
  assert.match(MIGRATION_SQL, /'provider', 'meta'/i);
  assert.match(MIGRATION_SQL, /'redirect_origin', p_redirect_origin/i);
  assert.match(MIGRATION_SQL, /'expires_at', p_expires_at/i);
  assert.match(MIGRATION_SQL, /'request_id', p_request_id/i);
  assert.doesNotMatch(MIGRATION_SQL, /'state',|'code',|'token',|'raw',|'payload',|'secret',/i);
  assert.match(MIGRATION_SQL, /p_redirect_origin !~ '\^https\?:\/\/\[\^\/\?#\]\+\$'/i);
});

test("catalog id is an OAuth entry point for one Meta provider, not three providers", () => {
  assert.match(MIGRATION_SQL, /catalog_id is the requested Meta catalog entry point/i);
  assert.match(
    MIGRATION_SQL,
    /not \(p_catalog_id = any \(array\['instagram', 'facebook', 'meta-ads'\]::text\[\]\)\)/i,
  );
  assert.doesNotMatch(MIGRATION_SQL, /p_catalog_id <> any/i);
  assert.match(MIGRATION_SQL, /'provider', 'meta'/i);
});
