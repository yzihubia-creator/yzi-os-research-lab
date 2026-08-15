import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildConnectionsCatalogFromRpcPayload,
  mapPersistedStatus,
  mergeConnectionsCatalogWithPersistedState,
  parseTenantConnectionsRpcPayload,
} from "../src/lib/yzi-imob/connections/persisted-state.ts";

function byId(entries, id) {
  const entry = entries.find((candidate) => candidate.id === id);
  assert.ok(entry, `missing catalog entry ${id}`);
  return entry;
}

function channelById(entry, id) {
  const channel = entry.channels?.find((candidate) => candidate.id === id);
  assert.ok(channel, `missing channel ${id}`);
  return channel;
}

test("RPC payload is narrowed to the public allowlist", () => {
  const vaultSecretIdField = ["vault", "secret", "id"].join("_");
  const externalAccountIdField = ["external", "account", "id"].join("_");
  const parsed = parseTenantConnectionsRpcPayload([
    {
      catalog_id: "site",
      provider: "ignored",
      status: "connected",
      last_checked_at: "2026-07-18T12:00:00.000Z",
      next_action: "Revisar domínio",
      display_name: "Site institucional",
      metadata: {
        health_reason: "Verificado",
        [externalAccountIdField]: "hidden-id",
        scopes: ["raw"],
      },
      [vaultSecretIdField]: "hidden-secret-ref",
    },
  ]);

  assert.deepEqual(parsed, [
    {
      id: "site",
      state: "conectado",
      lastCheckedAt: "2026-07-18T12:00:00.000Z",
      nextAction: "Revisar domínio",
      displayName: "Site institucional",
      healthReason: "Verificado",
      businessVerificationStatus: null,
      assets: [],
      availableNetworks: [],
      capabilityIds: [],
      lastSyncAt: null,
      pendingPublications: 0,
      recentFailures: 0,
      authorizationExpired: false,
      governedAuthorizationValidated: false,
      governedRuntimeValidated: false,
      humanCapabilities: [],
    },
  ]);
  const serialized = JSON.stringify(parsed);
  assert.equal(serialized.includes(vaultSecretIdField), false);
  assert.equal(serialized.includes(externalAccountIdField), false);
  assert.equal(serialized.includes("scopes"), false);
});

test("malformed and empty payloads keep honest defaults", () => {
  assert.deepEqual(parseTenantConnectionsRpcPayload({ rows: [] }), []);
  assert.deepEqual(parseTenantConnectionsRpcPayload([null, 1, { provider: "unknown" }]), []);

  const merged = buildConnectionsCatalogFromRpcPayload([]);
  assert.equal(byId(merged, "meta").state, "nao-configurado");
  assert.equal(byId(merged, "metricool").state, "nao-configurado");
});

test("Meta exposes only WhatsApp and ignores display-only social assets", () => {
  const merged = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [
        { kind: "page", account_label: "Legacy Page" },
        { kind: "instagram", account_label: "legacy.profile" },
        { kind: "ad_account", account_label: "Legacy Ads" },
      ],
    },
  ]);

  const meta = byId(merged, "meta");
  assert.equal(meta.state, "aguardando-autorizacao");
  assert.deepEqual(meta.channels?.map((channel) => channel.id), ["whatsapp"]);
  assert.equal(channelById(meta, "whatsapp").state, "nao-configurado");
  assert.equal(merged.some((entry) => entry.id === "meta-ads"), false);
});

test("WhatsApp phone numbers drive the operational Meta state without leaking ids", () => {
  const merged = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [
        {
          kind: "whatsapp_phone_number",
          account_label: "+1 555-194-9020",
          status: "connected",
          external_account_id: "hidden-phone-id",
          metadata: { verified_name: "Número de teste", token: "never" },
        },
        {
          kind: "whatsapp_phone_number",
          account_label: "+55 83 9872-5431",
          status: "configuring",
          external_account_id: "hidden-official-id",
        },
      ],
    },
  ]);

  const meta = byId(merged, "meta");
  const whatsapp = channelById(meta, "whatsapp");
  assert.equal(meta.state, "parcialmente-conectado");
  assert.equal(whatsapp.state, "parcialmente-conectado");
  assert.equal(whatsapp.relatedAssets?.length, 2);
  assert.equal(JSON.stringify(meta).includes("hidden-phone-id"), false);
  assert.equal(JSON.stringify(meta).includes("hidden-official-id"), false);
  assert.equal(JSON.stringify(meta).includes("never"), false);
});

test("Metricool configuration state and allowlisted capabilities are parsed", () => {
  const merged = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "metricool",
      status: "active",
      external_user_id: "194",
      external_blog_id: "9020",
      display_name: "Workspace administrado",
      validated_at: "2026-07-28T12:00:00.000Z",
      last_sync_at: "2026-07-28T12:30:00.000Z",
      pending_publications: 2,
      recent_failures: 0,
      assets: [
        { network: "instagram", profile_id: "hidden-profile-id" },
        { network: "facebook", profile_id: "hidden-profile-id-2" },
        { network: "unsupported" },
      ],
      capabilities: [
        { capability_id: "social_publish", unlocked: true },
        { capability_id: "social_schedule", unlocked: true },
        { capability_id: "post_metrics", unlocked: true },
        { capability_id: "unknown", unlocked: true },
      ],
    },
  ]);

  const metricool = byId(merged, "metricool");
  assert.equal(metricool.state, "conectado");
  assert.deepEqual(metricool.availableNetworks, ["instagram", "facebook"]);
  assert.equal(metricool.capabilities.every((capability) => capability.unlocked), true);
  assert.equal(metricool.pendingPublications, 2);
  assert.equal(metricool.recentFailures, 0);
  assert.equal(JSON.stringify(metricool).includes("hidden-profile-id"), false);
});

test("Metricool public registry derives governed truth from official persisted evidence", () => {
  const [metricool] = parseTenantConnectionsRpcPayload([
    {
      provider: "metricool",
      status: "active",
      external_user_id: "194",
      external_blog_id: "9020",
      validated_at: "2026-07-28T12:00:00.000Z",
      capabilities: ["social_publish", "social_schedule", "post_metrics"],
      last_error_code: null,
    },
  ]);

  assert.equal(metricool.governedAuthorizationValidated, true);
  assert.equal(metricool.governedRuntimeValidated, true);
  assert.deepEqual(metricool.capabilityIds, [
    "publicar-conteudo",
    "programar-publicacao",
    "ler-metricas",
  ]);
});

test("Metricool active without identity, probe or discovered capabilities is not promoted", () => {
  const [metricool] = parseTenantConnectionsRpcPayload([
    {
      provider: "metricool",
      status: "active",
      capabilities: [],
    },
  ]);

  assert.equal(metricool.governedAuthorizationValidated, false);
  assert.equal(metricool.governedRuntimeValidated, false);
});

test("Metricool plan and token failures map to honest attention states", () => {
  for (const status of ["plan_insufficient", "token_invalid", "rate_limited", "failed"]) {
    const merged = buildConnectionsCatalogFromRpcPayload([{ provider: "metricool", status }]);
    assert.equal(byId(merged, "metricool").state, "requer-atencao");
  }
  assert.equal(
    byId(
      buildConnectionsCatalogFromRpcPayload([{ provider: "metricool", status: "configuration_required" }]),
      "metricool",
    ).state,
    "aguardando-autorizacao",
  );
});

test("status mapping is closed and unknown values never promote a connection", () => {
  assert.equal(mapPersistedStatus("connected"), "conectado");
  assert.equal(mapPersistedStatus("active"), "conectado");
  assert.equal(mapPersistedStatus("validating"), "em-configuracao");
  assert.equal(mapPersistedStatus("configuration_required"), "aguardando-autorizacao");
  assert.equal(mapPersistedStatus("plan_insufficient"), "requer-atencao");
  assert.equal(mapPersistedStatus("disconnected"), "nao-configurado");
  assert.equal(mapPersistedStatus("surprise_connected"), "nao-configurado");
});

test("suspicious text is blocked from the UI contract", () => {
  const databaseUrl = ["postgres", "://", "user:pass@db"].join("");
  const parsed = parseTenantConnectionsRpcPayload([
    {
      provider: "metricool",
      status: "connected",
      next_action: "token leaked",
      metadata: {
        display_name: databaseUrl,
        health_reason: "secret leaked",
      },
    },
  ]);

  assert.equal(parsed[0].nextAction, null);
  assert.equal(parsed[0].displayName, null);
  assert.equal(parsed[0].healthReason, null);
});

test("catalog entries marked as future remain future", () => {
  const merged = mergeConnectionsCatalogWithPersistedState([
    {
      id: "google-ads",
      state: "conectado",
      lastCheckedAt: null,
      nextAction: null,
      displayName: null,
      healthReason: null,
      businessVerificationStatus: null,
      assets: [],
      availableNetworks: [],
      capabilityIds: [],
      lastSyncAt: null,
      pendingPublications: 0,
      recentFailures: 0,
    },
  ]);

  assert.equal(byId(merged, "google-ads").state, "em-breve");
});
