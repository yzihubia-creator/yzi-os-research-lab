import assert from "node:assert/strict";
import { test } from "node:test";

import { CONNECTIONS_CATALOG } from "../src/lib/yzi-imob/connections/catalog.ts";
import {
  formatConnectionQuantity,
  isPrimaryConnectionSummaryEntry,
  summarizeConnectionMetrics,
} from "../src/lib/yzi-imob/connections/metrics.ts";
import { buildConnectionsCatalogFromRpcPayload } from "../src/lib/yzi-imob/connections/persisted-state.ts";

function cloneCatalog() {
  return structuredClone(CONNECTIONS_CATALOG);
}

function byId(entries, id) {
  const entry = entries.find((candidate) => candidate.id === id);
  assert.ok(entry, `missing catalog entry ${id}`);
  return entry;
}

test("Meta with four channels counts once as a connected connection", () => {
  const catalog = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [
        { kind: "page", account_label: "Pagina Real" },
        { kind: "instagram", account_label: "perfil.real" },
        { kind: "ad_account", account_label: "Conta Real" },
        { kind: "waba", account_label: "WhatsApp Real" },
      ],
    },
  ]);

  assert.equal(byId(catalog, "meta").state, "conectado");
  assert.deepEqual(summarizeConnectionMetrics(catalog), {
    connected: 1,
    deploying: 0,
    upcoming: 9,
    attention: 0,
  });
});

test("partially connected Meta enters deployment without counting derived entries", () => {
  const catalog = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [
        { kind: "page", account_label: "OCM Negocios Imobiliarios" },
        { kind: "instagram", account_label: "ocm.imobiliaria" },
        { kind: "ad_account", account_label: "OCM Anuncios" },
      ],
    },
  ]);

  assert.equal(byId(catalog, "meta").state, "parcialmente-conectado");
  assert.equal(byId(catalog, "instagram-organico").state, "parcialmente-conectado");
  assert.equal(byId(catalog, "facebook-organico").state, "parcialmente-conectado");
  assert.equal(byId(catalog, "meta-ads").state, "parcialmente-conectado");
  assert.deepEqual(summarizeConnectionMetrics(catalog), {
    connected: 0,
    deploying: 1,
    upcoming: 9,
    attention: 0,
  });
});

test("coming soon items enter upcoming integrations", () => {
  const catalog = cloneCatalog();

  assert.equal(byId(catalog, "google-ads").state, "em-breve");
  assert.deepEqual(summarizeConnectionMetrics(catalog), {
    connected: 0,
    deploying: 0,
    upcoming: 10,
    attention: 0,
  });
});

test("subcapabilities do not change summary counts", () => {
  const catalog = cloneCatalog();
  const before = summarizeConnectionMetrics(catalog);

  for (const entry of catalog) {
    for (const capability of entry.capabilities) {
      capability.unlocked = true;
    }
    for (const channel of entry.channels ?? []) {
      for (const capability of channel.capabilities) {
        capability.unlocked = true;
      }
    }
  }

  assert.deepEqual(summarizeConnectionMetrics(catalog), before);
});

test("explicit error enters attention", () => {
  const catalog = cloneCatalog();
  byId(catalog, "site").state = "requer-atencao";

  assert.deepEqual(summarizeConnectionMetrics(catalog), {
    connected: 0,
    deploying: 0,
    upcoming: 9,
    attention: 1,
  });
});

test("no connection is promoted by display-only Meta assets", () => {
  const catalog = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [
        { kind: "page", account_label: "OCM Negocios Imobiliarios" },
        { kind: "instagram", account_label: "ocm.imobiliaria" },
        { kind: "ad_account", account_label: "OCM Anuncios" },
      ],
    },
  ]);

  assert.equal(isPrimaryConnectionSummaryEntry(byId(catalog, "instagram-organico")), false);
  assert.equal(isPrimaryConnectionSummaryEntry(byId(catalog, "facebook-organico")), false);
  assert.equal(isPrimaryConnectionSummaryEntry(byId(catalog, "meta-ads")), false);
  assert.equal(summarizeConnectionMetrics(catalog).connected, 0);
});

test("connection quantity pluralization handles zero, one, and many", () => {
  assert.equal(formatConnectionQuantity(0), "0 conexões");
  assert.equal(formatConnectionQuantity(1), "1 conexão");
  assert.equal(formatConnectionQuantity(2), "2 conexões");
});
