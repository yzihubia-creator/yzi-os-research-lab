import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { classifyIntent, normalizeInboundText } from "../src/lib/yzi-imob/inbound-operations/intent-classifier.ts";
import { selectWorkflow } from "../src/lib/yzi-imob/inbound-operations/workflow-selector.ts";

const MIGRATION_FILENAME = "20260720170000_yzi_imob_inbound_operations_consumer_v1.sql";
const MIGRATION_SQL = readFileSync(
  new URL(`../../supabase/migrations/${MIGRATION_FILENAME}`, import.meta.url),
  "utf8",
);
const PRIOR_HANDOFF_MIGRATION_SQL = readFileSync(
  new URL("../../supabase/migrations/20260720010000_yzi_imob_whatsapp_inbound_handoff_v1.sql", import.meta.url),
  "utf8",
);
const DATABASE_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/inbound-operations/database.ts", import.meta.url),
  "utf8",
);
const PROCESSOR_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/inbound-operations/processor.ts", import.meta.url),
  "utf8",
);
const CLASSIFIER_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/inbound-operations/intent-classifier.ts", import.meta.url),
  "utf8",
);
const WORKFLOW_SELECTOR_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/inbound-operations/workflow-selector.ts", import.meta.url),
  "utf8",
);
const TYPES_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/inbound-operations/types.ts", import.meta.url),
  "utf8",
);
const MANUAL_SCRIPT_SOURCE = readFileSync(
  new URL("../scripts/process-next-inbound-operation.mjs", import.meta.url),
  "utf8",
);

function functionBody(sql, name) {
  const marker = `create or replace function ${name}`;
  const start = sql.toLowerCase().indexOf(marker.toLowerCase());
  assert.notEqual(start, -1, `missing function ${name}`);
  const asMarker = "as $$";
  const bodyStart = sql.toLowerCase().indexOf(asMarker, start);
  assert.notEqual(bodyStart, -1, `missing body for ${name}`);
  const bodyEnd = sql.indexOf("$$;", bodyStart + asMarker.length);
  assert.notEqual(bodyEnd, -1, `missing body end for ${name}`);
  return sql.slice(bodyStart + asMarker.length, bodyEnd);
}

const CLAIM_BODY = functionBody(MIGRATION_SQL, "yzi_imob_inbound_operations_private.claim_next_inbound_operation");
const GET_MESSAGE_BODY = functionBody(
  MIGRATION_SQL,
  "yzi_imob_inbound_operations_private.get_inbound_operation_message",
);
const COMPLETE_BODY = functionBody(
  MIGRATION_SQL,
  "yzi_imob_inbound_operations_private.complete_inbound_operation",
);
const FAIL_BODY = functionBody(MIGRATION_SQL, "yzi_imob_inbound_operations_private.fail_inbound_operation");

const ALL_NEW_SOURCES = [
  MIGRATION_SQL,
  DATABASE_SOURCE,
  PROCESSOR_SOURCE,
  CLASSIFIER_SOURCE,
  WORKFLOW_SELECTOR_SOURCE,
  TYPES_SOURCE,
  MANUAL_SCRIPT_SOURCE,
].join("\n");

// ── 0. migration version ─────────────────────────────────────────────────

test("0. migration timestamp is strictly greater than the last known remote version", () => {
  const KNOWN_LATEST_REMOTE_VERSION = "20260720162037";
  const localVersion = MIGRATION_FILENAME.slice(0, 14);
  assert.match(localVersion, /^\d{14}$/);
  assert.ok(
    localVersion > KNOWN_LATEST_REMOTE_VERSION,
    `local migration version ${localVersion} must sort strictly after remote ${KNOWN_LATEST_REMOTE_VERSION}`,
  );
});

// ── 1. migration hygiene ─────────────────────────────────────────────────

test("1. new migration does not edit the prior handoff migration", () => {
  // The prior migration still pins the single literal values it always did —
  // proof this unit did not touch that file's constraints.
  assert.match(PRIOR_HANDOFF_MIGRATION_SQL, /check \(intent_status = 'pending'\)/i);
  assert.match(PRIOR_HANDOFF_MIGRATION_SQL, /check \(workflow_status = 'pending'\)/i);
  assert.match(PRIOR_HANDOFF_MIGRATION_SQL, /check \(execution_status = 'queued'\)/i);
  assert.doesNotMatch(PRIOR_HANDOFF_MIGRATION_SQL, /yzi_imob_inbound_operations_private/i);
  assert.doesNotMatch(PRIOR_HANDOFF_MIGRATION_SQL, /claim_next_inbound_operation/i);
});

test("2. new roles carry no password literal", () => {
  assert.match(MIGRATION_SQL, /create role yzi_imob_inbound_operations_runtime\s+login password null/i);
  assert.doesNotMatch(MIGRATION_SQL, /password\s+'[^']+'/i);
  assert.doesNotMatch(MIGRATION_SQL, /YZI_IMOB_INBOUND_OPERATIONS_DATABASE_URL\s*=\s*['"]postgres/i);
});

test("3. runtime and executor are separate roles, runtime granted executor", () => {
  assert.match(MIGRATION_SQL, /create role yzi_imob_inbound_operations_executor\s+nologin/i);
  assert.match(MIGRATION_SQL, /create role yzi_imob_inbound_operations_runtime\s+login/i);
  assert.match(MIGRATION_SQL, /grant yzi_imob_inbound_operations_executor to yzi_imob_inbound_operations_runtime/i);
});

test("4. no public/anon/authenticated/service_role grants anywhere in the migration", () => {
  assert.match(
    MIGRATION_SQL,
    /revoke all on schema yzi_imob_inbound_operations_private from public, anon, authenticated, service_role/i,
  );
  for (const fn of [
    "claim_next_inbound_operation\\(\\)",
    "get_inbound_operation_message\\(uuid\\)",
    "complete_inbound_operation\\(uuid, text, text\\)",
    "fail_inbound_operation\\(uuid, text, text, text\\)",
  ]) {
    const revokeRe = new RegExp(
      `revoke all on function yzi_imob_inbound_operations_private\\.${fn}\\s*\\nfrom public, anon, authenticated, service_role, yzi_meta_whatsapp_runtime`,
      "i",
    );
    assert.match(MIGRATION_SQL, revokeRe, `missing full revoke for ${fn}`);
  }
  assert.doesNotMatch(MIGRATION_SQL, /grant execute on function yzi_imob_inbound_operations_private\.\S+\s+to (public|anon|authenticated|service_role)\s*;/i);
});

// ── 5-8. claim RPC ───────────────────────────────────────────────────────

test("5. claim uses FOR UPDATE SKIP LOCKED", () => {
  assert.match(CLAIM_BODY, /for update skip locked/i);
});

test("6. claim orders by created_at asc, id asc, filtered to queued", () => {
  assert.match(CLAIM_BODY, /where r\.execution_status = 'queued'/i);
  assert.match(CLAIM_BODY, /order by r\.created_at asc, r\.id asc/i);
});

test("7. claim takes at most one row", () => {
  assert.match(CLAIM_BODY, /limit 1/i);
});

test("8. claim transitions queued -> processing and stamps claimed_at", () => {
  assert.match(CLAIM_BODY, /set execution_status = 'processing'/i);
  assert.match(CLAIM_BODY, /claimed_at = now\(\)/i);
  assert.match(CLAIM_BODY, /updated_at = now\(\)/i);
  assert.doesNotMatch(CLAIM_BODY, /intent_status|workflow_status|intent_key|workflow_key/i);
});

test("9. processor returns idle when nothing is claimed", () => {
  assert.match(PROCESSOR_SOURCE, /if \(!claimed\)\s*\{\s*return \{ status: "idle" \};/);
});

// ── 10-11. get_inbound_operation_message RPC ─────────────────────────────

test("10. reading the message requires execution_status = processing", () => {
  assert.match(GET_MESSAGE_BODY, /if v_request\.execution_status <> 'processing' then/i);
});

test("11. reading the message validates tenant/conversation/message identity", () => {
  assert.match(GET_MESSAGE_BODY, /v_message\.tenant_id <> v_request\.tenant_id/i);
  assert.match(GET_MESSAGE_BODY, /v_conversation\.tenant_id <> v_request\.tenant_id/i);
  assert.match(GET_MESSAGE_BODY, /v_message\.conversation_id <> v_request\.conversation_id/i);
  assert.match(GET_MESSAGE_BODY, /v_message\.direction <> 'inbound'/i);
  assert.match(GET_MESSAGE_BODY, /v_message\.sender_type <> 'external_contact'/i);
  assert.match(GET_MESSAGE_BODY, /v_message\.provider <> 'meta'/i);
  assert.match(GET_MESSAGE_BODY, /v_message\.channel <> 'whatsapp'/i);
  assert.match(GET_MESSAGE_BODY, /v_conversation\.channel <> 'whatsapp'/i);
  assert.match(GET_MESSAGE_BODY, /external_sender_id/i);
  assert.doesNotMatch(GET_MESSAGE_BODY, /return.*external_sender_id/is);
});

// ── 12-19. deterministic classifier (real runtime execution) ────────────

test("12. greeting", () => {
  assert.equal(classifyIntent("Bom dia!").intentKey, "greeting");
  assert.equal(classifyIntent("oi").intentKey, "greeting");
});

test("13. property_interest", () => {
  assert.equal(classifyIntent("Tenho interesse nesse apartamento").intentKey, "property_interest");
  assert.equal(classifyIntent("Qual o valor do imovel?").intentKey, "property_interest");
});

test("14. scheduling_interest", () => {
  assert.equal(classifyIntent("Quero agendar visita amanha").intentKey, "scheduling_interest");
  assert.equal(classifyIntent("Qual horario voces tem disponivel?").intentKey, "scheduling_interest");
});

test("15. human_support", () => {
  assert.equal(classifyIntent("Quero falar com atendente").intentKey, "human_support");
  assert.equal(classifyIntent("Preciso de atendimento humano").intentKey, "human_support");
});

test("16. unknown fallback", () => {
  const result = classifyIntent("xyzabc 12345 !!!");
  assert.equal(result.intentKey, "unknown");
  assert.equal(result.matchedRule, "unknown:fallback");
});

test("17. human_support takes precedence over greeting", () => {
  const result = classifyIntent("oi, quero falar com uma pessoa");
  assert.equal(result.intentKey, "human_support");
  assert.notEqual(result.intentKey, "greeting");
});

test("18. word boundaries avoid false positives (substring, not whole word)", () => {
  // "casamento" contains "casa" as a substring but is not the word "casa".
  assert.equal(classifyIntent("Marquei meu casamento para o mes que vem").intentKey, "unknown");
  // "apartamento" as its own word does match property_interest.
  assert.equal(classifyIntent("Tem apartamento disponivel?").intentKey, "property_interest");
});

test("19. accent normalization", () => {
  assert.equal(normalizeInboundText("Olá"), "ola");
  assert.equal(normalizeInboundText("Não, é sério"), "nao, e serio");
  assert.equal(classifyIntent("OLÁ, BOA TARDE!").intentKey, "greeting");
  assert.equal(classifyIntent("Quero visitar o imóvel").intentKey, "scheduling_interest");
});

// ── 20-21. workflow selector ─────────────────────────────────────────────

test("20. intent -> workflow static map", () => {
  assert.equal(selectWorkflow("greeting"), "whatsapp_greeting_response");
  assert.equal(selectWorkflow("property_interest"), "qualify_property_interest");
  assert.equal(selectWorkflow("scheduling_interest"), "collect_scheduling_context");
  assert.equal(selectWorkflow("human_support"), "route_to_human");
  assert.equal(selectWorkflow("unknown"), "ask_clarifying_question");
});

test("21. an intent outside the enum fails closed (workflow-selector + RPC combination guard)", () => {
  assert.throws(() => selectWorkflow("bogus_intent"));
  // RPC-level: an intent/workflow pair that does not match the fixed map is rejected.
  assert.match(COMPLETE_BODY, /v_expected_workflow <> p_workflow_key then/i);
  assert.match(COMPLETE_BODY, /raise exception using errcode = '22023', message = 'workflow_selection_failed'/i);
});

// ── 22-24. complete_inbound_operation ─────────────────────────────────────

test("22. complete transitions processing -> ready with all fields set", () => {
  assert.match(COMPLETE_BODY, /intent_status = 'classified'/i);
  assert.match(COMPLETE_BODY, /workflow_status = 'selected'/i);
  assert.match(COMPLETE_BODY, /execution_status = 'ready'/i);
  assert.match(COMPLETE_BODY, /intent_key = p_intent_key/i);
  assert.match(COMPLETE_BODY, /workflow_key = p_workflow_key/i);
  assert.match(COMPLETE_BODY, /completed_at = now\(\)/i);
  assert.match(COMPLETE_BODY, /failure_code = null/i);
});

test("23. complete is idempotent when re-called with the exact same values", () => {
  assert.match(
    COMPLETE_BODY,
    /if v_request\.execution_status = 'ready'\s+and v_request\.intent_key = p_intent_key\s+and v_request\.workflow_key = p_workflow_key\s+then/i,
  );
  assert.match(COMPLETE_BODY, /status := 'already_ready'/i);
});

test("24. complete fails closed on a divergent re-completion of an already-ready row", () => {
  // Ready-with-different-values falls through to the "not processing" guard,
  // which raises completion_failed rather than silently overwriting.
  assert.match(COMPLETE_BODY, /if v_request\.execution_status <> 'processing' then/i);
  assert.match(COMPLETE_BODY, /fail closed: never/i);
});

// ── 25. fail_inbound_operation ────────────────────────────────────────────

test("25. fail requires a controlled failure_code from the fixed enum", () => {
  assert.match(FAIL_BODY, /p_failure_code <> all \(array\[/i);
  for (const code of [
    "message_not_found",
    "conversation_not_found",
    "identity_mismatch",
    "invalid_message_contract",
    "intent_classification_failed",
    "workflow_selection_failed",
    "completion_failed",
  ]) {
    assert.match(FAIL_BODY, new RegExp(`'${code}'`));
  }
  assert.match(FAIL_BODY, /raise exception using errcode = '22023', message = 'invalid_failure_code'/i);
});

// ── intent invariant restoration (post-fix) ────────────────────────────────

test("classified never accepts a null intent_key (strict, symmetric constraint)", () => {
  assert.match(
    MIGRATION_SQL,
    /\(intent_status = 'classified' and intent_key is not null\)/i,
  );
  assert.match(MIGRATION_SQL, /\(intent_status = 'pending' and intent_key is null\)/i);
  assert.match(MIGRATION_SQL, /\(intent_status = 'failed' and intent_key is null\)/i);
  // The relaxed one-directional version from the prior iteration must be gone.
  assert.doesNotMatch(MIGRATION_SQL, /check \(intent_status = 'classified' or intent_key is null\)/i);
});

test("workflow_selected never accepts a null workflow_key (same strict shape)", () => {
  assert.match(
    MIGRATION_SQL,
    /\(workflow_status = 'selected' and workflow_key is not null\)/i,
  );
  assert.match(MIGRATION_SQL, /\(workflow_status = 'pending' and workflow_key is null\)/i);
  assert.match(MIGRATION_SQL, /\(workflow_status = 'failed' and workflow_key is null\)/i);
});

test("fail_inbound_operation signature accepts an optional p_workflow_key parameter", () => {
  assert.match(
    MIGRATION_SQL,
    /create or replace function yzi_imob_inbound_operations_private\.fail_inbound_operation\(\s*p_request_id uuid,\s*p_failure_code text,\s*p_intent_key text default null,\s*p_workflow_key text default null\s*\)/i,
  );
});

test("pre-classification failure codes forbid both intent_key and workflow_key", () => {
  assert.match(FAIL_BODY, /if p_intent_key is not null then/i);
  assert.match(FAIL_BODY, /if p_workflow_key is not null then/i);
  assert.match(FAIL_BODY, /raise exception using errcode = '22023', message = 'invalid_failure_intent_key'/i);
  assert.match(FAIL_BODY, /raise exception using errcode = '22023', message = 'invalid_failure_workflow_key'/i);
});

test("workflow_selection_failed requires a valid intent_key and forbids a workflow_key", () => {
  assert.match(FAIL_BODY, /elsif p_failure_code = 'workflow_selection_failed' then/i);
});

test("completion_failed requires a valid intent_key and a workflow_key matching the canonical intent map", () => {
  assert.match(FAIL_BODY, /if p_failure_code = 'completion_failed' then/i);
  assert.match(FAIL_BODY, /v_expected_workflow <> p_workflow_key then/i);
  assert.match(FAIL_BODY, /raise exception using errcode = '22023', message = 'invalid_failure_workflow_key'/i);
});

test("pre-classification failures persist intent_status=failed, workflow_status=pending, both keys null", () => {
  assert.match(
    FAIL_BODY,
    /intent_status = case\s+when p_failure_code = any \(array\[\s*'workflow_selection_failed', 'completion_failed'/i,
  );
  assert.match(FAIL_BODY, /else 'failed'\s+end,/i);
});

test("workflow_selection_failed persists workflow_status=failed and workflow_key=null (intent_key preserved)", () => {
  assert.match(
    FAIL_BODY,
    /workflow_status = case\s+when p_failure_code = 'completion_failed' then 'selected'\s+when p_failure_code = 'workflow_selection_failed' then 'failed'/i,
  );
});

test("completion_failed persists workflow_status=selected and workflow_key=p_workflow_key (no longer discarded)", () => {
  assert.match(
    FAIL_BODY,
    /workflow_key = case\s+when p_failure_code = 'completion_failed' then p_workflow_key\s+else null\s+end,/i,
  );
});

test("processor passes intentKey to fail_inbound_operation for workflow_selection_failed, and intentKey+workflowKey for completion_failed", () => {
  assert.match(
    PROCESSOR_SOURCE,
    /failInboundOperation\(requestId, "workflow_selection_failed", classification\.intentKey\)/,
  );
  assert.match(
    PROCESSOR_SOURCE,
    /failInboundOperation\(requestId, "completion_failed", classification\.intentKey, workflowKey\)/,
  );
  assert.match(PROCESSOR_SOURCE, /failInboundOperation\(requestId, failureCode\)/);
});

test("database.ts failInboundOperation accepts an optional workflowKey and forwards all four params to the RPC", () => {
  assert.match(
    DATABASE_SOURCE,
    /export async function failInboundOperation\(\s*requestId: string,\s*failureCode: FailureCode,\s*intentKey: IntentKey \| null = null,\s*workflowKey: WorkflowKey \| null = null,?\s*\)/,
  );
  assert.match(
    DATABASE_SOURCE,
    /fail_inbound_operation\(\s*\$\{requestId\}::uuid, \$\{failureCode\}::text, \$\{intentKey\}::text, \$\{workflowKey\}::text\s*\)/,
  );
});

// ── 26. ready is never reprocessed ────────────────────────────────────────

test("26. ready rows can never be re-claimed (claim only ever selects queued)", () => {
  const queuedOnly = /where r\.execution_status = 'queued'/i;
  assert.match(CLAIM_BODY, queuedOnly);
  assert.doesNotMatch(CLAIM_BODY, /execution_status = 'ready'/i);
});

// ── 27-31. governance boundaries ─────────────────────────────────────────

test("27. no LLM call anywhere in the new surface", () => {
  assert.doesNotMatch(ALL_NEW_SOURCES, /openai|anthropic|claude-|generateText|streamText|chat\.completions/i);
});

test("28. no generative YZI runtime is imported or called", () => {
  assert.doesNotMatch(ALL_NEW_SOURCES, /runYziImobRuntime\(/);
  // Only flags an actual import specifier pointing at the runtime/ tree —
  // prose in comments explaining the isolation is expected to mention it.
  assert.doesNotMatch(ALL_NEW_SOURCES, /from ["'][^"']*\/runtime\/[^"']*["']/);
});

test("29. no tool import or tool execution", () => {
  assert.doesNotMatch(ALL_NEW_SOURCES, /tool-registry|checkToolEligibility|allowed_tools/i);
});

test("30. no outbound send (no WhatsApp/Graph API call)", () => {
  assert.doesNotMatch(ALL_NEW_SOURCES, /graph\.facebook\.com/i);
  assert.doesNotMatch(ALL_NEW_SOURCES, /sendWhatsapp|sendMessage\(/i);
});

test("31. no lead creation", () => {
  assert.doesNotMatch(ALL_NEW_SOURCES, /yzi_imob_leads|createLead|insert_lead/i);
});

// ── 32-33. no endpoint, no cron ──────────────────────────────────────────

test("32. the manual script is explicitly not a public endpoint", () => {
  assert.match(MANUAL_SCRIPT_SOURCE, /NOT an endpoint/);
  assert.doesNotMatch(ALL_NEW_SOURCES, /export (async )?function (GET|POST|PUT|DELETE|PATCH)\(/);
});

test("33. no cron/scheduler wiring", () => {
  assert.doesNotMatch(ALL_NEW_SOURCES, /node-cron|croner|setInterval\(|schedule\(/i);
});

// ── 34. no body logging ───────────────────────────────────────────────────

test("34. database.ts and processor.ts never call console.* (no path to log the body)", () => {
  assert.doesNotMatch(DATABASE_SOURCE, /console\./);
  assert.doesNotMatch(PROCESSOR_SOURCE, /console\./);
});

test("34b. the manual script's console output never references the message body", () => {
  assert.doesNotMatch(MANUAL_SCRIPT_SOURCE, /\.body\b/);
  assert.doesNotMatch(MANUAL_SCRIPT_SOURCE, /console\.(log|error|warn|info|debug)\([^)]*body/i);
});

// ── 35. no password in the migration ──────────────────────────────────────

test("35. no password literal anywhere in the migration", () => {
  assert.doesNotMatch(MIGRATION_SQL, /password\s+'[^']*[a-zA-Z0-9][^']*'/i);
  assert.doesNotMatch(MIGRATION_SQL, /connection[_ ]?string\s*[:=]/i);
  // "secret" appears once, in prose confirming none is present — flag only a
  // credential-shaped assignment, not the word itself.
  assert.doesNotMatch(MIGRATION_SQL, /secret\s*[:=]\s*'[^']+'/i);
});

// ── extra: table state-machine constraints present in the migration ──────

test("state machine: ready requires classified+selected+keys+timestamps, no failure_code", () => {
  assert.match(
    MIGRATION_SQL,
    /execution_status = 'ready'\s+and intent_status = 'classified'\s+and workflow_status = 'selected'\s+and intent_key is not null\s+and workflow_key is not null\s+and claimed_at is not null\s+and completed_at is not null\s+and failure_code is null/i,
  );
});

test("state machine: failed requires failure_code+claimed_at+completed_at and one of the three valid status combos", () => {
  assert.match(
    MIGRATION_SQL,
    /execution_status = 'failed'\s+and failure_code is not null\s+and claimed_at is not null\s+and completed_at is not null/i,
  );
  assert.match(
    MIGRATION_SQL,
    /\(\s*intent_status = 'failed'\s+and workflow_status = 'pending'\s+and intent_key is null\s+and workflow_key is null\s*\)/i,
  );
  assert.match(
    MIGRATION_SQL,
    /\(\s*intent_status = 'classified'\s+and workflow_status = 'failed'\s+and intent_key is not null\s+and workflow_key is null\s*\)/i,
  );
  assert.match(
    MIGRATION_SQL,
    /\(\s*intent_status = 'classified'\s+and workflow_status = 'selected'\s+and intent_key is not null\s+and workflow_key is not null\s*\)/i,
  );
});

test("state machine: queued requires pending/pending and every timestamp/key null", () => {
  assert.match(
    MIGRATION_SQL,
    /execution_status = 'queued'\s+and intent_status = 'pending'\s+and workflow_status = 'pending'\s+and intent_key is null\s+and workflow_key is null\s+and claimed_at is null\s+and completed_at is null\s+and failure_code is null/i,
  );
});

test("no forbidden columns were added (body/prompt/model/response/tool/approval/lead_id/property_id/score/retry/stack)", () => {
  const alterBlockStart = MIGRATION_SQL.indexOf("-- PART 2 - Table evolution");
  const alterBlockEnd = MIGRATION_SQL.indexOf("-- PART 3");
  const alterBlock = MIGRATION_SQL.slice(alterBlockStart, alterBlockEnd);
  for (const forbidden of [
    "body",
    "prompt",
    "model",
    "response",
    "\\btool\\b",
    "approval",
    "lead_id",
    "property_id",
    "score",
    "retry",
    "stack",
  ]) {
    assert.doesNotMatch(alterBlock, new RegExp(`\\badd column ${forbidden}`, "i"));
  }
});

test("database.ts does not reuse META_WHATSAPP_DATABASE_URL and does not use a service role", () => {
  assert.match(DATABASE_SOURCE, /process\.env\.YZI_IMOB_INBOUND_OPERATIONS_DATABASE_URL/);
  assert.doesNotMatch(DATABASE_SOURCE, /process\.env\.META_WHATSAPP_DATABASE_URL/);
  assert.doesNotMatch(DATABASE_SOURCE, /service_role|SERVICE_ROLE/);
  assert.match(DATABASE_SOURCE, /import "server-only"/);
});

// ── effective identity validation (post-fix) ────────────────────────────────

test("identity is validated against Postgres session_user, not just the connection string", () => {
  assert.match(
    DATABASE_SOURCE,
    /select current_user as current_user_name, session_user as session_user_name/,
  );
  assert.match(
    DATABASE_SOURCE,
    /row\.session_user_name !== INBOUND_OPERATIONS_DATABASE_ROLE/,
  );
});

test("URL inspection alone is never treated as sufficient proof of identity", () => {
  // The URL-based check exists (cheap pre-filter)...
  assert.match(DATABASE_SOURCE, /function readInboundOperationsDatabaseUrl\(\)/);
  // ...but every public wrapper goes through the separate, query-backed
  // verification function, not the raw URL-based one.
  assert.match(DATABASE_SOURCE, /async function getVerifiedInboundOperationsSql\(\)/);
  for (const wrapper of [
    "claimNextInboundOperation",
    "getInboundOperationMessage",
    "completeInboundOperation",
    "failInboundOperation",
  ]) {
    const fnStart = DATABASE_SOURCE.indexOf(`export async function ${wrapper}`);
    assert.notEqual(fnStart, -1, `missing wrapper ${wrapper}`);
    const fnBodyPreview = DATABASE_SOURCE.slice(fnStart, fnStart + 600);
    assert.match(
      fnBodyPreview,
      /await getVerifiedInboundOperationsSql\(\)/,
      `${wrapper} must use the verified accessor, not the raw connection`,
    );
  }
  // Never a bare, unverified "getInboundOperationsSql" left over.
  assert.doesNotMatch(DATABASE_SOURCE, /\bgetInboundOperationsSql\b/);
});

test("identity mismatch closes the connection and throws a sanitized error (never logs the values)", () => {
  assert.match(DATABASE_SOURCE, /await sql\.end\(\{ timeout: 5 \}\);\s*\n\s*throw new Error\("Inbound operations consumer configuration is unavailable\."\);/);
  assert.doesNotMatch(DATABASE_SOURCE, /console\./);
});
