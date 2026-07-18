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

test("valid payload is parsed into the narrow UI contract", () => {
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
        display_name: "raw fallback",
        health_reason: "Verificado",
        [externalAccountIdField]: "full-id-is-not-forwarded",
        scopes: ["raw"],
      },
      [vaultSecretIdField]: "sentinel-id",
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
      assets: [],
    },
  ]);
  assert.equal(JSON.stringify(parsed).includes(vaultSecretIdField), false);
  assert.equal(JSON.stringify(parsed).includes(externalAccountIdField), false);
  assert.equal(JSON.stringify(parsed).includes("scopes"), false);
});

test("malformed payload and empty persisted state keep honest catalog defaults", () => {
  assert.deepEqual(parseTenantConnectionsRpcPayload({ rows: [] }), []);
  assert.deepEqual(parseTenantConnectionsRpcPayload([null, 1, { provider: "unknown" }]), []);

  const merged = buildConnectionsCatalogFromRpcPayload([]);
  assert.equal(byId(merged, "meta").state, "nao-configurado");
  assert.equal(byId(merged, "site").state, "nao-configurado");
});

test("RPC error fallback is represented by empty persisted payload", () => {
  const merged = buildConnectionsCatalogFromRpcPayload(null);
  assert.equal(byId(merged, "meta").state, "nao-configurado");
  assert.equal(byId(merged, "google-analytics").state, "nao-configurado");
});

test("Meta stays a single connection while recognized assets update visual channels", () => {
  const merged = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "partially_connected",
      assets: [
        {
          asset_type: "facebook_page",
          status: "connected",
          metadata: { display_name: "Página Oficial" },
        },
        {
          kind: "instagram_business",
          status: "attention_required",
          health_reason: "Permissão expirada",
        },
        {
          kind: "whatsapp_business_account",
          status: "awaiting_customer",
          next_action: "Selecionar número",
        },
        {
          kind: "whatsapp_phone_number",
          status: "connected",
          display_name: "Telefone principal",
        },
        {
          kind: "unrecognized_asset",
          status: "connected",
          display_name: "Não deve aparecer",
        },
      ],
    },
  ]);

  const meta = byId(merged, "meta");
  assert.equal(meta.state, "aguardando-autorizacao");
  assert.equal(merged.filter((entry) => entry.id === "meta").length, 1);
  assert.equal(channelById(meta, "facebook").state, "conectado");
  assert.equal(channelById(meta, "instagram").state, "requer-atencao");
  assert.equal(channelById(meta, "whatsapp").state, "aguardando-autorizacao");
  assert.equal(JSON.stringify(meta).includes("Não deve aparecer"), false);
});

test("status mapping is closed and unknown statuses cannot promote to connected", () => {
  assert.equal(mapPersistedStatus("connected"), "conectado");
  assert.equal(mapPersistedStatus("partially_connected"), "aguardando-autorizacao");
  assert.equal(mapPersistedStatus("awaiting_customer"), "aguardando-autorizacao");
  assert.equal(mapPersistedStatus("pending_authorization"), "aguardando-autorizacao");
  assert.equal(mapPersistedStatus("provisioning"), "aguardando-autorizacao");
  assert.equal(mapPersistedStatus("attention_required"), "requer-atencao");
  assert.equal(mapPersistedStatus("validation_failed"), "requer-atencao");
  assert.equal(mapPersistedStatus("disabled"), "nao-configurado");
  assert.equal(mapPersistedStatus("surprise_connected"), "nao-configurado");
});

test("sensitive fields and suspicious text are blocked from the UI contract", () => {
  const databaseUrl = ["postgres", "://", "user:pass@db"].join("");
  const parsed = parseTenantConnectionsRpcPayload([
    {
      provider: "meta",
      status: "connected",
      next_action: "token leaked",
      metadata: {
        display_name: databaseUrl,
        health_reason: "secret leaked",
      },
      assets: [
        {
          kind: "meta_ad_account",
          status: "connected",
          next_action: "vault secret",
          metadata: { display_name: "Conta segura", health_reason: "OK" },
          token: "never",
        },
      ],
    },
  ]);

  assert.equal(parsed[0].nextAction, null);
  assert.equal(parsed[0].displayName, null);
  assert.equal(parsed[0].healthReason, null);
  assert.equal(parsed[0].assets[0].displayName, "Conta segura");
  assert.equal(JSON.stringify(parsed).includes("never"), false);
});

test("catalog entries marked as coming soon are preserved", () => {
  const merged = mergeConnectionsCatalogWithPersistedState([
    {
      id: "google-ads",
      state: "conectado",
      lastCheckedAt: null,
      nextAction: null,
      displayName: null,
      healthReason: null,
      assets: [],
    },
  ]);

  assert.equal(byId(merged, "google-ads").state, "em-breve");
});
