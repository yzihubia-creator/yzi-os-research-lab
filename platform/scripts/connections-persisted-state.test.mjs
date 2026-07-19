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
      businessVerificationStatus: null,
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

test("Meta persisted row is awaiting unless explicitly not configured", () => {
  const provisioning = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "provisioning",
      metadata: { business_verification_status: "Em análise" },
    },
  ]);
  const unknown = buildConnectionsCatalogFromRpcPayload([{ provider: "meta", status: "unknown_status" }]);
  const disabled = buildConnectionsCatalogFromRpcPayload([{ provider: "meta", status: "disabled" }]);
  const notConfigured = buildConnectionsCatalogFromRpcPayload([{ provider: "meta", status: "not_configured" }]);

  assert.equal(byId(provisioning, "meta").state, "aguardando-autorizacao");
  assert.equal(byId(provisioning, "meta").businessVerificationStatus, "Em análise");
  assert.equal(byId(unknown, "meta").state, "aguardando-autorizacao");
  assert.equal(byId(disabled, "meta").state, "aguardando-autorizacao");
  assert.equal(byId(notConfigured, "meta").state, "nao-configurado");
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
  assert.equal(meta.state, "parcialmente-conectado");
  assert.equal(merged.filter((entry) => entry.id === "meta").length, 1);
  assert.equal(channelById(meta, "facebook").state, "conectado");
  assert.equal(channelById(meta, "instagram").state, "requer-atencao");
  assert.equal(channelById(meta, "whatsapp").state, "conectado");
  assert.equal(JSON.stringify(meta).includes("Não deve aparecer"), false);
});

test("WhatsApp phone numbers drive operational state without WABA downgrade", () => {
  const merged = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [
        {
          kind: "whatsapp_phone_number",
          account_label: "+1 555-194-9020",
          status: "connected",
          external_account_id: "phone-test-id",
          metadata: {
            verified_name: "Numero de teste",
            provider_status: "CONNECTED",
            code_verification_status: "VERIFIED",
            platform_type: "CLOUD_API",
            parent_waba_id: "waba-hidden",
            discovery_complete: true,
            token: "never",
          },
        },
        {
          kind: "whatsapp_phone_number",
          account_label: "+55 83 9872-5431",
          status: "configuring",
          external_account_id: "phone-official-id",
          metadata: {
            verified_name: "Numero oficial",
            provider_status: "PENDING",
            code_verification_status: "VERIFIED",
            platform_type: "CLOUD_API",
            discovery_complete: true,
          },
        },
        {
          kind: "whatsapp_business_account",
          account_label: "OCM Negocios Imobiliarios",
          status: "configuring",
          metadata: {
            provider_status: "PENDING",
            discovery_complete: true,
            graph_confirmed: true,
          },
        },
        {
          kind: "waba",
          account_label: "Test WhatsApp Business Account",
          status: "configuring",
          metadata: {
            provider_status: "PENDING",
            discovery_complete: true,
            graph_confirmed: true,
          },
        },
      ],
    },
  ]);

  const meta = byId(merged, "meta");
  const whatsapp = channelById(meta, "whatsapp");
  assert.equal(meta.state, "parcialmente-conectado");
  assert.equal(whatsapp.state, "parcialmente-conectado");
  assert.equal(whatsapp.summary, "O número de teste está conectado. O número oficial segue em configuração.");
  assert.deepEqual(
    whatsapp.relatedAssets?.map((asset) => [asset.label, asset.state, asset.description]),
    [
      ["+1 555-194-9020", "conectado", "Disponível para validação técnica."],
      ["+55 83 9872-5431", "em-configuracao", "Número verificado, aguardando ativação técnica final."],
      ["OCM Negocios Imobiliarios", "em-configuracao", null],
      ["Test WhatsApp Business Account", "em-configuracao", null],
    ],
  );
  assert.equal(JSON.stringify(whatsapp).includes("phone-test-id"), false);
  assert.equal(JSON.stringify(whatsapp).includes("phone-official-id"), false);
  assert.equal(JSON.stringify(whatsapp).includes("waba-hidden"), false);
  assert.equal(JSON.stringify(whatsapp).includes("never"), false);
});

test("Meta parser accepts current RPC asset aliases without inventing channels", () => {
  const merged = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [
        {
          kind: "page",
          external_account_id: "page-1",
          account_label: "Pagina Real",
          metadata: { normalized_kind: "facebook_page", status: "connected" },
        },
        {
          kind: "instagram",
          external_account_id: "ig-1",
          account_label: "perfil.real",
          metadata: { normalized_kind: "instagram_business", status: "connected" },
        },
        {
          kind: "ad_account",
          external_account_id: "ad-1",
          account_label: "Conta Real",
          metadata: { normalized_kind: "meta_ad_account", status: "connected" },
        },
      ],
    },
  ]);

  const meta = byId(merged, "meta");
  assert.equal(meta.state, "parcialmente-conectado");
  assert.equal(
    meta.summary,
    "A Meta já está conectada ao Instagram, Facebook e Meta Ads. O WhatsApp ainda está em configuração.",
  );
  assert.equal(meta.primaryPendency, "Concluir ativação técnica do número oficial");
  assert.deepEqual(meta.impact, [
    "Instagram, Facebook e Meta Ads já estão conectados. O WhatsApp ainda precisa ser concluído para ativar o atendimento.",
  ]);
  assert.equal(meta.impact.join(" ").includes("não publica no Instagram ou Facebook"), false);
  assert.equal(channelById(meta, "facebook").state, "conectado");
  assert.equal(channelById(meta, "facebook").displayName, "Pagina Real");
  assert.equal(channelById(meta, "instagram").state, "conectado");
  assert.equal(channelById(meta, "instagram").displayName, "perfil.real");
  assert.equal(channelById(meta, "meta-ads").state, "conectado");
  assert.equal(channelById(meta, "meta-ads").displayName, "Conta Real");
  assert.equal(channelById(meta, "whatsapp").state, "em-configuracao");
  assert.equal(channelById(meta, "whatsapp").nextAction, "Ativar número oficial");

  const instagramOrganic = byId(merged, "instagram-organico");
  assert.equal(instagramOrganic.state, "parcialmente-conectado");
  assert.equal(instagramOrganic.displayName, "perfil.real");
  assert.equal(instagramOrganic.capabilities.find((capability) => capability.id === "identified")?.unlocked, true);
  assert.equal(instagramOrganic.capabilities.find((capability) => capability.id === "publish")?.unlocked, false);
  assert.equal(instagramOrganic.capabilities.find((capability) => capability.id === "metrics")?.unlocked, false);

  const facebookOrganic = byId(merged, "facebook-organico");
  assert.equal(facebookOrganic.state, "parcialmente-conectado");
  assert.equal(facebookOrganic.displayName, "Pagina Real");
  assert.equal(facebookOrganic.capabilities.find((capability) => capability.id === "identified")?.unlocked, true);
  assert.equal(facebookOrganic.capabilities.find((capability) => capability.id === "publish")?.unlocked, false);
  assert.equal(facebookOrganic.capabilities.find((capability) => capability.id === "metrics")?.unlocked, false);

  const ads = byId(merged, "meta-ads");
  assert.equal(ads.state, "parcialmente-conectado");
  assert.equal(ads.displayName, "Conta Real");
  assert.equal(ads.capabilities.find((capability) => capability.id === "identified")?.unlocked, true);
  assert.equal(ads.capabilities.find((capability) => capability.id === "read")?.unlocked, true);
  assert.equal(ads.capabilities.find((capability) => capability.id === "write")?.unlocked, false);
  assert.equal(byId(merged, "google-ads").state, "em-breve");
});

test("asset fallback promotes only active labeled RPC assets, never the connection", () => {
  const merged = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [
        {
          kind: "page",
          account_label: "OCM Negocios Imobiliarios",
        },
        {
          kind: "instagram",
          account_label: "ocm.imobiliaria",
          status: "attention_required",
        },
        {
          kind: "ad_account",
          account_label: "OCM Anuncios",
          metadata: { status: "connected" },
        },
      ],
    },
  ]);

  const meta = byId(merged, "meta");
  assert.equal(meta.state, "parcialmente-conectado");
  assert.equal(channelById(meta, "facebook").state, "conectado");
  assert.equal(channelById(meta, "facebook").displayName, "OCM Negocios Imobiliarios");
  assert.equal(channelById(meta, "instagram").state, "requer-atencao");
  assert.equal(channelById(meta, "instagram").displayName, "ocm.imobiliaria");
  assert.equal(channelById(meta, "meta-ads").state, "conectado");
  assert.equal(channelById(meta, "meta-ads").displayName, "OCM Anuncios");
  assert.equal(channelById(meta, "whatsapp").state, "em-configuracao");
});

test("Meta becomes connected when all four channels are connected", () => {
  const merged = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [
        { kind: "page", account_label: "OCM Negocios Imobiliarios" },
        { kind: "instagram", account_label: "ocm.imobiliaria" },
        { kind: "ad_account", account_label: "OCM Anuncios" },
        { kind: "waba", account_label: "OCM WhatsApp", status: "connected" },
      ],
    },
  ]);

  const meta = byId(merged, "meta");
  assert.equal(meta.state, "conectado");
  assert.equal(meta.primaryPendency, null);
  assert.deepEqual(meta.impact, []);
  assert.equal(channelById(meta, "whatsapp").state, "conectado");
});

test("Meta without channels and active provisioning remains awaiting", () => {
  const merged = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "provisioning",
      assets: [],
    },
  ]);

  const meta = byId(merged, "meta");
  assert.equal(meta.state, "aguardando-autorizacao");
  assert.equal(channelById(meta, "facebook").state, "nao-configurado");
  assert.equal(channelById(meta, "instagram").state, "nao-configurado");
  assert.equal(channelById(meta, "meta-ads").state, "nao-configurado");
  assert.equal(channelById(meta, "whatsapp").state, "nao-configurado");
});

test("business verification pending does not downgrade connected Meta assets", () => {
  const merged = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      metadata: { business_verification_status: "Pendente" },
      assets: [
        { kind: "page", account_label: "OCM Negocios Imobiliarios" },
        { kind: "instagram", account_label: "ocm.imobiliaria" },
        { kind: "ad_account", account_label: "OCM Anuncios" },
      ],
    },
  ]);

  const meta = byId(merged, "meta");
  assert.equal(meta.state, "parcialmente-conectado");
  assert.equal(meta.businessVerificationStatus, "Pendente");
  assert.equal(channelById(meta, "facebook").state, "conectado");
  assert.equal(channelById(meta, "instagram").state, "conectado");
  assert.equal(channelById(meta, "meta-ads").state, "conectado");
  assert.equal(channelById(meta, "whatsapp").state, "em-configuracao");
});

test("creative production remains inactive without brand kit templates or media", () => {
  const merged = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [
        { kind: "page", account_label: "Pagina Real" },
        { kind: "instagram", account_label: "perfil.real" },
        { kind: "ad_account", account_label: "Conta Real" },
      ],
    },
  ]);

  assert.equal(byId(merged, "base-marca").state, "nao-configurado");
  assert.equal(byId(merged, "templates").state, "nao-configurado");
  assert.equal(byId(merged, "biblioteca-midias").state, "nao-configurado");
  assert.equal(byId(merged, "geracao-criativa").state, "nao-configurado");
});

test("absent operational items are not invented from Meta assets", () => {
  const merged = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [{ kind: "instagram", account_label: "perfil.real" }],
    },
  ]);

  assert.equal(byId(merged, "instagram-organico").state, "parcialmente-conectado");
  assert.equal(byId(merged, "facebook-organico").state, "nao-configurado");
  assert.equal(byId(merged, "meta-ads").state, "nao-configurado");
  assert.equal(byId(merged, "google-search-console").state, "nao-configurado");
  assert.equal(byId(merged, "google-analytics").state, "nao-configurado");
  assert.equal(byId(merged, "google-business-profile").state, "nao-configurado");
});

test("Meta assets are not duplicated as independent active connections", () => {
  const merged = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [
        { kind: "page", account_label: "Pagina Real" },
        { kind: "instagram", account_label: "perfil.real" },
        { kind: "ad_account", account_label: "Conta Real" },
      ],
    },
  ]);

  assert.equal(merged.filter((entry) => entry.state === "conectado").length, 0);
  assert.equal(merged.filter((entry) => entry.state === "em-breve").length, 1);
  assert.equal(byId(merged, "google-ads").state, "em-breve");
});

test("status mapping is closed and unknown statuses cannot promote to connected", () => {
  assert.equal(mapPersistedStatus("connected"), "conectado");
  assert.equal(mapPersistedStatus("partially_connected"), "parcialmente-conectado");
  assert.equal(mapPersistedStatus("awaiting_account_selection"), "aguardando-autorizacao");
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
      businessVerificationStatus: null,
      assets: [],
    },
  ]);

  assert.equal(byId(merged, "google-ads").state, "em-breve");
});
