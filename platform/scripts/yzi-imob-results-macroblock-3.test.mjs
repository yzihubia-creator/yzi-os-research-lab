import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { parseResultsFilters, resolveResultsPeriod } from "../src/lib/yzi-imob/results/model.ts";

const repositorySource = readFileSync(
  new URL("../src/lib/yzi-imob/results/repository.ts", import.meta.url),
  "utf8",
);
const componentSource = readFileSync(
  new URL("../src/components/yzi-imob/yzi-imob-growth-resultados-v0.tsx", import.meta.url),
  "utf8",
);

test("period presets resolve to bounded UTC ranges", () => {
  const now = new Date("2026-07-28T12:00:00.000Z");
  assert.equal(resolveResultsPeriod("7d", now).start, "2026-07-21T12:00:00.000Z");
  assert.equal(resolveResultsPeriod("30d", now).start, "2026-06-28T12:00:00.000Z");
  assert.equal(resolveResultsPeriod("90d", now).start, "2026-04-29T12:00:00.000Z");
});

test("filters reject unsupported periods and normalize channel/status", () => {
  assert.deepEqual(parseResultsFilters({
    period: "365d",
    property: "property-1",
    broker: "broker-1",
    channel: " WhatsApp ",
    status: " COMPLETED ",
  }), {
    period: "30d",
    propertyId: "property-1",
    brokerUserId: "broker-1",
    channel: "whatsapp",
    status: "completed",
  });
});

test("event queries are tenant scoped, time bounded, and limited", () => {
  assert.match(repositorySource, /\.eq\("tenant_id", tenantId\)\.gte\(timestamp, period\.start\)\.lte\(timestamp, period\.end\)/);
  assert.match(repositorySource, /limit\(1000\)/);
  assert.doesNotMatch(repositorySource, /service_role|SUPABASE_SERVICE/);
});

test("unavailable Metricool is never represented as an empty graph or invented zero", () => {
  assert.match(componentSource, /Aguardando configuração da Metricool/);
  assert.match(componentSource, /Métricas externas indisponíveis/);
  assert.doesNotMatch(componentSource, /alcance|impressões|ROI|CAC|CPL/i);
});

test("the six required executive blocks and honest states are present", () => {
  for (const title of [
    "1. Resumo do período",
    "2. Movimento dos imóveis",
    "3. Atendimento e leads",
    "4. Corretores e visitas",
    "5. Publicação e conteúdo",
    "6. Gargalos do período",
  ]) {
    assert.ok(componentSource.includes(title));
  }
  assert.match(componentSource, /Zero ocorrências no período/);
  assert.match(componentSource, /Dados parciais/);
  assert.match(componentSource, /Dados desatualizados/);
});
