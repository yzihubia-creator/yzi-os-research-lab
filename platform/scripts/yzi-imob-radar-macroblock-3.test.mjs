import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  createRadarSignal,
  deterministicSignalId,
  parseRadarFilters,
} from "../src/lib/yzi-imob/radar/model.ts";

const repositorySource = readFileSync(
  new URL("../src/lib/yzi-imob/radar/repository.ts", import.meta.url),
  "utf8",
);
const componentSource = readFileSync(
  new URL("../src/components/yzi-imob/yzi-imob-radar-workspace.tsx", import.meta.url),
  "utf8",
);

test("signal ids are deterministic, tenant scoped, and entity scoped", () => {
  assert.equal(
    deterministicSignalId("tenant-a", "follow_up_overdue", "follow_up", "task-1"),
    "tenant-a:follow_up_overdue:follow_up:task-1",
  );
  assert.notEqual(
    deterministicSignalId("tenant-a", "follow_up_overdue", "follow_up", "task-1"),
    deterministicSignalId("tenant-b", "follow_up_overdue", "follow_up", "task-1"),
  );
});

test("signal creation allowlists the complete active contract", () => {
  const signal = createRadarSignal({
    tenantId: "tenant-a",
    type: "visit_without_feedback",
    category: "visita",
    severity: "important",
    title: "Visita concluída sem feedback",
    description: "Sem feedback associado.",
    entityType: "appointment",
    entityId: "visit-1",
    source: "yzi_imob_visit_feedback",
    dueAt: "2026-07-28T10:00:00.000Z",
    actionLabel: "Registrar feedback",
    actionHref: "/cockpit/yzi-imob/agenda",
    metadata: { propertyId: "property-1" },
  }, new Date("2026-07-28T12:00:00.000Z"));
  assert.equal(signal.status, "active");
  assert.equal(signal.detectedAt, "2026-07-28T12:00:00.000Z");
  assert.equal(signal.id, "tenant-a:visit_without_feedback:appointment:visit-1");
  assert.ok(Object.isFrozen(signal.metadata));
});

test("category and severity filters fail closed", () => {
  assert.deepEqual(parseRadarFilters({ category: "lead", severity: "critical" }), {
    category: "lead",
    severity: "critical",
  });
  assert.deepEqual(parseRadarFilters({ category: "other", severity: "urgent" }), {
    category: null,
    severity: null,
  });
});

test("all six categories and four severities are represented", () => {
  for (const category of ["ativo", "lead", "visita", "atendimento", "conexao", "sistema"]) {
    assert.match(repositorySource, new RegExp(`category: "${category}"`));
  }
  for (const severity of ["info", "attention", "important", "critical"]) {
    assert.match(readFileSync(new URL("../src/lib/yzi-imob/radar/types.ts", import.meta.url), "utf8"), new RegExp(`"${severity}"`));
  }
});

test("repository uses tenant filters, bounded event reads, deduplication, and no persistence", () => {
  assert.match(repositorySource, /\.eq\("tenant_id", tenantId\)/);
  assert.match(repositorySource, /\.gte\(timestamp, windowStart\)\.limit\(MAX_ROWS\)/);
  assert.match(repositorySource, /new Map\(signals\.map/);
  assert.doesNotMatch(repositorySource, /\.(insert|update|upsert|delete)\(/);
  assert.doesNotMatch(repositorySource, /service_role|SUPABASE_SERVICE/);
});

test("observability UI is sanitized and acknowledgment is not invented", () => {
  assert.match(componentSource, /sem payload, telefone, SQL ou stack trace/i);
  assert.match(componentSource, /não há contrato real de acknowledgement/i);
  assert.doesNotMatch(componentSource, /mensagem privada|provider_message_id|external_sender_id/i);
});

test("entity actions use existing routes and no Insights route is created", () => {
  for (const route of [
    "/cockpit/yzi-imob/imoveis/",
    "/cockpit/yzi-imob/clientes/",
    "/cockpit/yzi-imob/atendimento/",
    "/cockpit/yzi-imob/agenda",
    "/cockpit/yzi-imob/conexoes",
    "/cockpit/yzi-imob/marketing/publicacoes",
  ]) {
    assert.ok(repositorySource.includes(route));
  }
  assert.doesNotMatch(repositorySource + componentSource, /\/insights/);
});
