import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  buildOperationalConsumptionSummary,
  connectionStatusFromPersistedState,
} from "../src/lib/yzi-imob/consumption/model.ts";

const repositorySource = readFileSync(
  new URL("../src/lib/yzi-imob/consumption/repository.ts", import.meta.url),
  "utf8",
);
const componentSource = readFileSync(
  new URL(
    "../src/components/yzi-imob/yzi-imob-apis-creditos-workspace.tsx",
    import.meta.url,
  ),
  "utf8",
);
const pageSource = readFileSync(
  new URL("../src/app/cockpit/yzi-imob/apis-creditos/page.tsx", import.meta.url),
  "utf8",
);

const NOW = new Date("2026-07-28T18:00:00.000Z");
const connection = {
  status: "available",
  lastUpdatedAt: "2026-07-28T17:00:00.000Z",
  errorCode: null,
};

function sources(overrides = {}) {
  return {
    whatsappConnection: connection,
    metricoolConnection: connection,
    outboundMessages: { status: "ok", count: 12, lastUpdatedAt: NOW.toISOString() },
    socialPublications: { status: "ok", count: 3, lastUpdatedAt: NOW.toISOString() },
    runnerExecutions: { status: "ok", count: 8, lastUpdatedAt: NOW.toISOString() },
    ...overrides,
  };
}

test("operational usage is real while financial cost and limits remain unavailable", () => {
  const summary = buildOperationalConsumptionSummary(sources(), NOW);
  assert.deepEqual(summary.resources.map((resource) => resource.usage_value), [12, 3, 8]);
  assert.equal(summary.financial_consumption_available, false);
  assert.ok(summary.resources.every((resource) => resource.cost_available === false));
  assert.ok(summary.resources.every((resource) => resource.cost_value === null));
  assert.ok(summary.resources.every((resource) => resource.currency === null));
  assert.ok(summary.resources.every((resource) => resource.limit_available === false));
  assert.ok(summary.resources.every((resource) => resource.limit_value === null));
});

test("missing usage is unavailable, never an invented zero", () => {
  const summary = buildOperationalConsumptionSummary(
    sources({ outboundMessages: { status: "error" } }),
    NOW,
  );
  assert.equal(summary.resources[0].usage_available, false);
  assert.equal(summary.resources[0].usage_value, null);
  assert.equal(summary.resources[0].status, "partial");
  assert.equal(summary.resources[0].error_code, "read_failed");
});

test("configuration required, stale data, and sanitized errors remain distinct", () => {
  assert.equal(connectionStatusFromPersistedState("nao-configurado", null, NOW).status, "configuration_required");
  assert.equal(
    connectionStatusFromPersistedState("conectado", "2026-07-26T10:00:00.000Z", NOW).status,
    "stale",
  );
  assert.deepEqual(
    connectionStatusFromPersistedState("requer-atencao", NOW.toISOString(), NOW),
    {
      status: "error",
      lastUpdatedAt: NOW.toISOString(),
      errorCode: "connection_attention_required",
    },
  );
});

test("all reads are tenant scoped and use the authenticated server client", () => {
  assert.match(pageSource, /createServerSupabaseClient/);
  assert.match(pageSource, /tenantContext\.tenant\.id/);
  assert.equal((repositorySource.match(/\.eq\("tenant_id", tenantId\)/g) ?? []).length, 3);
  assert.match(repositorySource, /p_tenant_id: tenantId/);
  assert.doesNotMatch(repositorySource + pageSource, /service_role|SUPABASE_SERVICE/i);
});

test("the surface contains honest unavailable states and no demo contract", () => {
  assert.match(componentSource, /Consumo financeiro ainda não disponível/);
  assert.match(componentSource, /Uso operacional indisponível/);
  assert.match(componentSource, /Limites de provedor ainda não disponíveis/);
  assert.doesNotMatch(componentSource + pageSource + repositorySource, /DEMO_CONNECTIONS/);
  assert.doesNotMatch(componentSource, /R\$|US\$|créditos usados|economia|orçamento restante/i);
});
