import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { buildDeterministicWorkflowMessage } from "../src/lib/yzi-imob/inbound-operations/deterministic-workflows.ts";
import { selectWorkflow } from "../src/lib/yzi-imob/inbound-operations/workflow-selector.ts";

const MIGRATION_SQL = readFileSync(
  new URL("../../supabase/migrations/20260723103000_yzi_imob_meta_whatsapp_outbound_v1.sql", import.meta.url),
  "utf8",
);
const PROCESSOR_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/inbound-operations/processor.ts", import.meta.url),
  "utf8",
);
const TYPES_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/inbound-operations/types.ts", import.meta.url),
  "utf8",
);

test("inbound operation failure vocabulary now includes outbound_dispatch_failed", () => {
  assert.match(MIGRATION_SQL, /'outbound_dispatch_failed'/i);
  assert.match(TYPES_SOURCE, /"outbound_dispatch_failed"/);
  assert.match(PROCESSOR_SOURCE, /failInboundOperation\(\s*requestId,\s*"outbound_dispatch_failed"/);
});

test("processor order includes deterministic reply, one outbound call, then complete", () => {
  const buildIndex = PROCESSOR_SOURCE.indexOf("buildDeterministicWorkflowMessage");
  const sendIndex = PROCESSOR_SOURCE.indexOf("const outboundResult = await sendGovernedMetaWhatsappText");
  const completeIndex = PROCESSOR_SOURCE.lastIndexOf("completeInboundOperation");
  assert.ok(buildIndex > 0);
  assert.ok(sendIndex > buildIndex);
  assert.ok(completeIndex > sendIndex);
  assert.match(PROCESSOR_SOURCE, /idempotencyKey: `inbound-operation:\$\{requestId\}`/);
});

test("deterministic workflow messages cover every known workflow", () => {
  assert.match(buildDeterministicWorkflowMessage(selectWorkflow("greeting")), /Oi!/);
  assert.match(buildDeterministicWorkflowMessage(selectWorkflow("property_interest")), /codigo ou link/i);
  assert.match(buildDeterministicWorkflowMessage(selectWorkflow("scheduling_interest")), /data desejada/i);
  assert.match(buildDeterministicWorkflowMessage(selectWorkflow("human_support")), /atendimento humano/i);
  assert.match(buildDeterministicWorkflowMessage(selectWorkflow("unknown")), /imovel, visita ou atendimento humano/i);
});
