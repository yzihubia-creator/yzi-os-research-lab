import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  DeterministicFakeMetricoolTransport,
  OfficialMetricoolHttpTransport,
  runMetricoolJobBatch,
  validateGovernedSocialPublication,
} from "../src/lib/yzi-imob/metricool/index.ts";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_TENANT_ID = "22222222-2222-4222-8222-222222222222";
const PUBLICATION_ID = "33333333-3333-4333-8333-333333333333";
const JOB_ID = "44444444-4444-4444-8444-444444444444";
const MEDIA_ID = "55555555-5555-4555-8555-555555555555";
const NOW = new Date("2026-07-28T15:00:00.000Z");
const SCHEDULED_AT = "2026-07-28T17:00:00.000Z";
const ASSET = {
  mediaId: MEDIA_ID,
  url: "https://public.invalid/yzi-metricool-synthetic/image-1.jpg",
  altText: "Fixture sintética YZI-METRICOOL-2B",
  sortOrder: 0,
};

function governedInput(overrides = {}) {
  return {
    tenantId: TENANT_ID,
    propertyTenantId: TENANT_ID,
    revisionTenantId: TENANT_ID,
    connectionTenantId: TENANT_ID,
    revisionStatus: "approved",
    connectionStatus: "active",
    targetNetworks: ["instagram"],
    targetProfileIds: ["ig-yzi-synthetic"],
    allowlistedProfiles: [{ id: "ig-yzi-synthetic", network: "instagram" }],
    format: "single_image",
    caption: "Fixture sintética YZI-METRICOOL-2B",
    assets: [ASSET],
    scheduledAt: SCHEDULED_AT,
    now: NOW,
    ...overrides,
  };
}

test("connection: missing identifiers are rejected before any HTTP request", async () => {
  let calls = 0;
  const transport = new OfficialMetricoolHttpTransport({
    credentials: { userId: "", blogId: "", apiToken: "" },
    fetchImpl: async () => {
      calls += 1;
      return jsonResponse([]);
    },
  });
  const result = await transport.validateConnection();
  assert.equal(result.status, "error");
  assert.equal(result.error.code, "invalid_configuration");
  assert.equal(calls, 0);
});

test("connection: official HTTP status mapping is sanitized", async () => {
  for (const [status, code] of [[401, "token_invalid"], [403, "plan_insufficient"], [429, "rate_limited"]]) {
    const transport = transportWithFetch(async () =>
      jsonResponse({ private: "must-not-leak" }, status, status === 429 ? { "Retry-After": "2" } : {}),
    );
    const result = await transport.validateConnection();
    assert.equal(result.status, "error");
    assert.equal(result.error.code, code);
    assert.equal(JSON.stringify(result).includes("must-not-leak"), false);
  }
});

test("connection: timeout is bounded and retryable", async () => {
  const transport = transportWithFetch(
    (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
      }),
    5,
  );
  const result = await transport.validateConnection();
  assert.equal(result.status, "error");
  assert.equal(result.error.code, "timeout");
  assert.equal(result.error.retryable, true);
});

test("connection: successful validation uses X-Mc-Auth and official identifiers", async () => {
  const requests = [];
  const transport = transportWithFetch(async (url, init) => {
    requests.push({ url: String(url), headers: new Headers(init.headers) });
    return jsonResponse([{
      id: "20001",
      userId: "10001",
      label: "Workspace sintético",
      timezone: "America/Sao_Paulo",
      instagram: "ig-yzi-synthetic",
      facebook: "Facebook sintético",
      facebookPageId: "fb-yzi-synthetic",
    }]);
  });
  const result = await transport.validateConnection();
  assert.equal(result.status, "ok");
  assert.deepEqual(result.value.profiles.map((profile) => profile.network), ["instagram", "facebook"]);
  assert.equal(requests[0].headers.get("X-Mc-Auth"), "synthetic-api-token");
  assert.match(requests[0].url, /userId=10001/);
  assert.match(requests[0].url, /blogId=20001/);
});

test("publishing governance rejects unapproved, cross-tenant and invalid media", () => {
  assert.deepEqual(
    validateGovernedSocialPublication(governedInput({ revisionStatus: "under_review" })),
    { valid: false, code: "approved_revision_required" },
  );
  assert.deepEqual(
    validateGovernedSocialPublication(governedInput({ connectionTenantId: OTHER_TENANT_ID })),
    { valid: false, code: "cross_tenant" },
  );
  assert.deepEqual(
    validateGovernedSocialPublication(
      governedInput({ assets: [{ ...ASSET, url: "http://private.invalid/a.jpg" }] }),
    ),
    { valid: false, code: "invalid_media" },
  );
});

test("publishing governance accepts single image and carousel with future schedule", () => {
  assert.deepEqual(validateGovernedSocialPublication(governedInput()), { valid: true });
  assert.deepEqual(
    validateGovernedSocialPublication(
      governedInput({
        format: "carousel",
        assets: [
          ASSET,
          {
            ...ASSET,
            mediaId: "66666666-6666-4666-8666-666666666666",
            url: "https://public.invalid/yzi-metricool-synthetic/image-2.jpg",
            sortOrder: 1,
          },
        ],
      }),
    ),
    { valid: true },
  );
});

test("fake transport is deterministic and does not duplicate create", async () => {
  const transport = new DeterministicFakeMetricoolTransport();
  const request = {
    networks: ["instagram"],
    text: "Fixture sintética YZI-METRICOOL-2B",
    media: [ASSET],
    scheduledAt: SCHEDULED_AT,
    timezone: "America/Sao_Paulo",
  };
  const first = await transport.createScheduledPost(request);
  const replay = await transport.createScheduledPost(request);
  assert.equal(first.status, "ok");
  assert.deepEqual(replay, first);
  assert.equal(transport.createCallCount, 1);
});

test("HTTP creation is never automatically repeated on 5xx", async () => {
  let calls = 0;
  const transport = transportWithFetch(async (url) => {
    calls += 1;
    return String(url).includes("/actions/normalize/image/url")
      ? jsonResponse({ url: "https://cdn.invalid/synthetic.jpg" })
      : jsonResponse({}, 503);
  });
  const result = await transport.createScheduledPost({
    networks: ["instagram"],
    text: "Fixture sintética YZI-METRICOOL-2B",
    media: [ASSET],
    scheduledAt: "2099-07-28T17:00:00.000Z",
    timezone: "America/Sao_Paulo",
  });
  assert.equal(result.status, "error");
  assert.equal(result.error.code, "provider_unavailable");
  assert.equal(calls, 2);
});

test("runner dispatches, retries eligible failures and persists no false published state", async () => {
  const acceptedStore = memoryStore([job("publish")]);
  const fake = new DeterministicFakeMetricoolTransport();
  const accepted = await runMetricoolJobBatch({
    store: acceptedStore,
    transportFactory: () => fake,
    now: NOW,
  });
  assert.equal(accepted.succeeded, 1);
  assert.equal(acceptedStore.completions[0].outcome, "accepted");

  const failedStore = memoryStore([job("publish", { attemptCount: 1 })]);
  const failingFake = new DeterministicFakeMetricoolTransport();
  failingFake.failNext("provider_unavailable");
  const failed = await runMetricoolJobBatch({
    store: failedStore,
    transportFactory: () => failingFake,
    now: NOW,
  });
  assert.equal(failed.failed, 1);
  assert.equal(failedStore.completions[0].outcome, "failed");
  assert.equal(failedStore.completions[0].retryAt, "2026-07-28T15:05:00.000Z");
});

test("status sync supports published and cancel rejects an already published fake post", async () => {
  const fake = new DeterministicFakeMetricoolTransport();
  const created = await fake.createScheduledPost({
    networks: ["instagram"],
    text: "Fixture sintética YZI-METRICOOL-2B",
    media: [ASSET],
    scheduledAt: SCHEDULED_AT,
    timezone: "America/Sao_Paulo",
  });
  assert.equal(created.status, "ok");
  fake.markPostState(created.value.externalPostId, "published");

  const store = memoryStore([
    job("status_sync", {
      externalPostId: created.value.externalPostId,
      externalNetworkPostIds: created.value.externalNetworkPostIds,
    }),
  ]);
  await runMetricoolJobBatch({ store, transportFactory: () => fake, now: NOW });
  assert.equal(store.completions[0].outcome, "published");

  const cancelled = await fake.cancelScheduledPost(created.value.externalPostId);
  assert.equal(cancelled.status, "error");
  assert.equal(cancelled.error.retryable, false);
});

test("metrics sync keeps provider names, periods, networks and idempotent persistence payload", async () => {
  const scheduledAt = "2026-07-27T16:00:00.000Z";
  const from = "2026-07-26T16:00:00.000Z";
  const to = NOW.toISOString();
  const fake = new DeterministicFakeMetricoolTransport();
  fake.setPostMetrics([
    metric({ scope: "post", providerMetricName: "impressions", normalizedMetricName: "impressions", from, to }),
    metric({ scope: "post", providerMetricName: "interactions", normalizedMetricName: null, from, to }),
  ]);
  fake.setProfileMetrics([
    metric({
      scope: "profile",
      targetProfileId: "ig-yzi-synthetic",
      providerMetricName: "postsInteractions",
      normalizedMetricName: null,
      from,
      to,
    }),
  ]);
  const store = memoryStore([
    job("metrics_sync", {
      scheduledAt,
      externalPostId: "7000",
      externalNetworkPostIds: { instagram: "instagram-7000" },
    }),
  ]);
  await runMetricoolJobBatch({ store, transportFactory: () => fake, now: NOW });
  assert.equal(store.metrics.length, 3);
  assert.equal(store.metrics[1].normalizedMetricName, null);
  assert.equal(store.metrics.every((item) => item.network === "instagram"), true);
  assert.equal(store.metrics.every((item) => item.periodEnd === to), true);
});

test("migration and UI contracts keep secrets server-side and expose honest states", async () => {
  const migration = await readFile(
    new URL("../../supabase/migrations/20260728201241_yzi_imob_metricool_social_mvp_v1.sql", import.meta.url),
    "utf8",
  );
  const connectionUi = await readFile(
    new URL("../src/components/yzi-imob/yzi-imob-connections-workspace.tsx", import.meta.url),
    "utf8",
  );
  const marketingUi = await readFile(
    new URL("../src/components/yzi-imob/yzi-imob-social-publications-workspace.tsx", import.meta.url),
    "utf8",
  );
  assert.match(migration, /vault_secret_id/);
  assert.match(migration, /yzi_imob_metricool_private/);
  assert.match(migration, /session_user <> 'yzi_imob_metricool_runtime'/);
  const publicProjection = migration.slice(
    migration.indexOf("create function public.get_yzi_imob_tenant_connections"),
    migration.indexOf("revoke all on function public.request_yzi_imob_metricool_configuration"),
  );
  assert.doesNotMatch(publicProjection, /api_token|vault_secret|caption|asset_references/);
  assert.match(connectionUi, /Configuração gerenciada/);
  assert.doesNotMatch(connectionUi, /input[^>]+token/i);
  for (const state of ["Aguardando aprovação", "Agendado", "Publicado", "Falhou", "Cancelado"]) {
    assert.match(marketingUi, new RegExp(state));
  }
});

function transportWithFetch(fetchImpl, timeoutMs = 100) {
  return new OfficialMetricoolHttpTransport({
    credentials: {
      userId: "10001",
      blogId: "20001",
      apiToken: "synthetic-api-token",
    },
    fetchImpl,
    timeoutMs,
  });
}

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function job(operation, overrides = {}) {
  return {
    jobId: JOB_ID,
    tenantId: TENANT_ID,
    socialPublicationId: PUBLICATION_ID,
    operation,
    attemptCount: 1,
    maxAttempts: 3,
    credentials: { userId: "10001", blogId: "20001", apiToken: "synthetic-api-token" },
    targetNetworks: ["instagram"],
    targetProfileIds: ["ig-yzi-synthetic"],
    format: "single_image",
    caption: "Fixture sintética YZI-METRICOOL-2B",
    assets: [ASSET],
    scheduledAt: SCHEDULED_AT,
    externalPostId: null,
    externalPostUuid: null,
    externalNetworkPostIds: {},
    ...overrides,
  };
}

function memoryStore(jobs) {
  return {
    jobs,
    completions: [],
    metrics: [],
    async claimJobs(limit) {
      return this.jobs.slice(0, limit);
    },
    async completeJob(input) {
      this.completions.push(input);
    },
    async persistMetrics(_jobId, metrics) {
      this.metrics = [...metrics];
    },
  };
}

function metric({
  scope,
  providerMetricName,
  normalizedMetricName,
  from,
  to,
  targetProfileId = null,
}) {
  return {
    network: "instagram",
    scope,
    targetProfileId,
    providerMetricName,
    normalizedMetricName,
    value: 10,
    periodStart: from,
    periodEnd: to,
    collectedAt: to,
  };
}
