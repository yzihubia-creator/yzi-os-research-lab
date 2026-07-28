import assert from "node:assert/strict";
import { test } from "node:test";

import { CONNECTIONS_CATALOG } from "../src/lib/yzi-imob/connections/catalog.ts";
import {
  formatConnectionQuantity,
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

test("Meta counts only the WhatsApp Cloud API connection in the MVP", () => {
  const catalog = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [
        { kind: "page", account_label: "Legacy Page" },
        { kind: "instagram", account_label: "legacy.profile" },
        { kind: "ad_account", account_label: "Legacy Ads" },
        { kind: "waba", account_label: "WhatsApp Real", status: "connected" },
      ],
    },
  ]);

  const meta = byId(catalog, "meta");
  assert.equal(meta.state, "conectado");
  assert.deepEqual(meta.channels?.map((channel) => channel.id), ["whatsapp"]);
  assert.equal(catalog.some((entry) => ["instagram-organico", "facebook-organico", "meta-ads"].includes(entry.id)), false);
  assert.deepEqual(summarizeConnectionMetrics(catalog), {
    connected: 1,
    deploying: 0,
    upcoming: 6,
    attention: 0,
  });
});

test("display-only Meta social assets never promote WhatsApp", () => {
  const catalog = buildConnectionsCatalogFromRpcPayload([
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

  assert.equal(byId(catalog, "meta").state, "aguardando-autorizacao");
  assert.equal(summarizeConnectionMetrics(catalog).connected, 0);
});

test("partially configured WhatsApp keeps Meta in deployment", () => {
  const catalog = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "meta",
      status: "awaiting_account_selection",
      assets: [
        { kind: "whatsapp_phone_number", account_label: "+1 555-194-9020", status: "connected" },
        { kind: "whatsapp_phone_number", account_label: "+55 83 9872-5431", status: "configuring" },
      ],
    },
  ]);

  assert.equal(byId(catalog, "meta").state, "parcialmente-conectado");
  assert.deepEqual(summarizeConnectionMetrics(catalog), {
    connected: 1,
    deploying: 1,
    upcoming: 6,
    attention: 0,
  });
});

test("Metricool is a primary managed connection", () => {
  const catalog = buildConnectionsCatalogFromRpcPayload([
    {
      provider: "metricool",
      status: "configuration_required",
      capabilities: [],
      assets: [],
    },
  ]);

  assert.equal(byId(catalog, "metricool").state, "aguardando-autorizacao");
  assert.deepEqual(summarizeConnectionMetrics(catalog), {
    connected: 0,
    deploying: 1,
    upcoming: 6,
    attention: 0,
  });
});

test("coming soon items and capability flags do not distort summary counts", () => {
  const catalog = cloneCatalog();
  const before = summarizeConnectionMetrics(catalog);
  assert.equal(byId(catalog, "google-ads").state, "em-breve");

  for (const entry of catalog) {
    for (const capability of entry.capabilities) capability.unlocked = true;
    for (const channel of entry.channels ?? []) {
      for (const capability of channel.capabilities) capability.unlocked = true;
    }
  }

  assert.deepEqual(summarizeConnectionMetrics(catalog), before);
});

test("explicit error enters attention", () => {
  const catalog = cloneCatalog();
  byId(catalog, "metricool").state = "requer-atencao";

  assert.equal(summarizeConnectionMetrics(catalog).attention, 1);
});

test("connection quantity pluralization handles zero, one, and many", () => {
  assert.equal(formatConnectionQuantity(0), "0 conexões");
  assert.equal(formatConnectionQuantity(1), "1 conexão");
  assert.equal(formatConnectionQuantity(2), "2 conexões");
});
