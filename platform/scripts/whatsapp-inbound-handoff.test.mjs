import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const MIGRATION_SQL = readFileSync(
  new URL("../../supabase/migrations/20260720010000_yzi_imob_whatsapp_inbound_handoff_v1.sql", import.meta.url),
  "utf8",
);

const HANDOFF_MODULE_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/connections/whatsapp-inbound-handoff.ts", import.meta.url),
  "utf8",
);

const ROUTE_SOURCE = readFileSync(
  new URL("../src/app/api/webhooks/meta/whatsapp/route.ts", import.meta.url),
  "utf8",
);

function tableBody(name) {
  const marker = `create table ${name} (`;
  const start = MIGRATION_SQL.toLowerCase().indexOf(marker.toLowerCase());
  assert.notEqual(start, -1, `missing table ${name}`);
  const bodyStart = start + marker.length;
  const bodyEnd = MIGRATION_SQL.indexOf("\n);", bodyStart);
  assert.notEqual(bodyEnd, -1, `missing table body end for ${name}`);
  return MIGRATION_SQL.slice(bodyStart, bodyEnd);
}

function functionBody(name) {
  const marker = `create or replace function ${name}`;
  const start = MIGRATION_SQL.toLowerCase().indexOf(marker.toLowerCase());
  assert.notEqual(start, -1, `missing ${name}`);
  const asMarker = "as $$";
  const bodyStart = MIGRATION_SQL.toLowerCase().indexOf(asMarker, start);
  assert.notEqual(bodyStart, -1, `missing body for ${name}`);
  const bodyEnd = MIGRATION_SQL.indexOf("$$;", bodyStart + asMarker.length);
  assert.notEqual(bodyEnd, -1, `missing body end for ${name}`);
  return MIGRATION_SQL.slice(bodyStart + asMarker.length, bodyEnd);
}

const TABLE_BODY = tableBody("public.yzi_imob_inbound_operation_requests");
const RPC_BODY = functionBody("yzi_meta_whatsapp_private.enqueue_whatsapp_inbound_handoff");

test("1. table and RPC exist in the migration SQL", () => {
  assert.match(MIGRATION_SQL, /create table public\.yzi_imob_inbound_operation_requests \(/i);
  assert.match(
    MIGRATION_SQL,
    /create or replace function yzi_meta_whatsapp_private\.enqueue_whatsapp_inbound_handoff\(\s*p_conversation_id uuid,\s*p_message_id uuid\s*\)/i,
  );
});

test("2. table stores no body, payload, token, phone, or classification columns", () => {
  assert.doesNotMatch(TABLE_BODY, /\bbody\b/i);
  assert.doesNotMatch(TABLE_BODY, /\bpayload\b/i);
  assert.doesNotMatch(TABLE_BODY, /\btoken\b/i);
  assert.doesNotMatch(TABLE_BODY, /\bphone\b/i);
  assert.doesNotMatch(TABLE_BODY, /external_sender_id/i);
  assert.doesNotMatch(TABLE_BODY, /waba/i);
  assert.doesNotMatch(TABLE_BODY, /phone_number_id/i);
  assert.doesNotMatch(TABLE_BODY, /\bcontext\b/i);
  assert.doesNotMatch(TABLE_BODY, /\bprompt\b/i);
  assert.doesNotMatch(TABLE_BODY, /\bmodel\b/i);
  assert.doesNotMatch(TABLE_BODY, /\btool\b/i);
  assert.doesNotMatch(TABLE_BODY, /\bresponse\b/i);
  assert.doesNotMatch(TABLE_BODY, /\bapproval\b/i);
  assert.doesNotMatch(TABLE_BODY, /lead_id/i);
  assert.doesNotMatch(TABLE_BODY, /property_id/i);
  assert.doesNotMatch(TABLE_BODY, /retry/i);
  assert.doesNotMatch(TABLE_BODY, /\berror\b/i);
});

test("3. intent_status, workflow_status, and execution_status start pending/pending/queued and are pinned by check constraints", () => {
  assert.match(TABLE_BODY, /intent_status text not null default 'pending'/i);
  assert.match(TABLE_BODY, /workflow_status text not null default 'pending'/i);
  assert.match(TABLE_BODY, /execution_status text not null default 'queued'/i);
  assert.match(TABLE_BODY, /check \(intent_status = 'pending'\)/i);
  assert.match(TABLE_BODY, /check \(workflow_status = 'pending'\)/i);
  assert.match(TABLE_BODY, /check \(execution_status = 'queued'\)/i);
});

test("4. no policy and no grant to authenticated are created for the handoff table", () => {
  assert.doesNotMatch(MIGRATION_SQL, /create policy/i);
  assert.doesNotMatch(
    MIGRATION_SQL,
    /grant\s+(select|insert|update|delete|all)[\s\S]*on\s+(table\s+)?public\.yzi_imob_inbound_operation_requests[\s\S]*to\s+authenticated/i,
  );
  assert.match(
    MIGRATION_SQL,
    /revoke all on public\.yzi_imob_inbound_operation_requests\s*\nfrom public, anon, authenticated, service_role, yzi_meta_whatsapp_runtime, yzi_meta_whatsapp_executor;/i,
  );
});

test("5. runtime and executor receive no direct table grant on the handoff table", () => {
  assert.doesNotMatch(
    MIGRATION_SQL,
    /grant\s+(select|insert|update|delete|all)[\s\S]*on\s+(table\s+)?public\.yzi_imob_inbound_operation_requests[\s\S]*to\s+yzi_meta_whatsapp_runtime/i,
  );
  assert.doesNotMatch(
    MIGRATION_SQL,
    /grant\s+(select|insert|update|delete|all)[\s\S]*on\s+(table\s+)?public\.yzi_imob_inbound_operation_requests[\s\S]*to\s+yzi_meta_whatsapp_executor/i,
  );
  assert.match(MIGRATION_SQL, /revoke all on public\.yzi_imob_inbound_operation_requests[\s\S]*yzi_meta_whatsapp_runtime, yzi_meta_whatsapp_executor;/i);
});

test("6. idempotency is enforced by tenant/provider/channel/message_id", () => {
  assert.match(
    TABLE_BODY,
    /constraint yzi_imob_inbound_operation_requests_tenant_message_unique\s*\n\s*unique \(tenant_id, provider, channel, message_id\)/i,
  );
});

test("7. idempotency is also enforced by tenant/idempotency_key, derived only from message_id", () => {
  assert.match(
    TABLE_BODY,
    /constraint yzi_imob_inbound_operation_requests_tenant_idempotency_unique\s*\n\s*unique \(tenant_id, idempotency_key\)/i,
  );
  assert.match(RPC_BODY, /v_idempotency_key := 'meta:whatsapp:' \|\| v_message\.id::text;/i);
  assert.doesNotMatch(RPC_BODY, /v_idempotency_key[\s\S]{0,80}(body|phone|payload)/i);
});

test("8. tenant_id is derived from the database, never accepted as a parameter", () => {
  assert.doesNotMatch(MIGRATION_SQL, /p_tenant_id/i);
  assert.match(
    MIGRATION_SQL,
    /create or replace function yzi_meta_whatsapp_private\.enqueue_whatsapp_inbound_handoff\(\s*p_conversation_id uuid,\s*p_message_id uuid\s*\)/i,
  );
  assert.match(RPC_BODY, /v_message\.tenant_id/i);
});

test("9. RPC requires the correct runtime session_user", () => {
  assert.match(RPC_BODY, /session_user <> 'yzi_meta_whatsapp_runtime'/i);
});

test("10. RPC validates same conversation and same tenant between message and conversation", () => {
  assert.match(RPC_BODY, /v_message\.conversation_id <> p_conversation_id/i);
  assert.match(RPC_BODY, /v_message\.tenant_id <> v_conversation\.tenant_id/i);
});

test("11. inbound external_contact meta/whatsapp message is accepted", () => {
  assert.match(
    RPC_BODY,
    /v_message\.direction <> 'inbound'[\s\S]*v_message\.sender_type <> 'external_contact'[\s\S]*v_message\.provider <> 'meta'[\s\S]*v_message\.channel <> 'whatsapp'/i,
  );
});

test("12. outbound direction fails closed", () => {
  assert.match(RPC_BODY, /v_message\.direction <> 'inbound'/i);
  assert.doesNotMatch(RPC_BODY, /direction\s*=\s*'outbound'/i);
});

test("13. human sender fails closed", () => {
  assert.match(RPC_BODY, /v_message\.sender_type <> 'external_contact'/i);
});

test("14. yzi sender fails closed", () => {
  assert.match(RPC_BODY, /v_message\.sender_type <> 'external_contact'/i);
  assert.doesNotMatch(RPC_BODY, /sender_type\s*=\s*'yzi'/i);
});

test("15. divergent provider or channel fails closed", () => {
  assert.match(RPC_BODY, /v_message\.provider <> 'meta'/i);
  assert.match(RPC_BODY, /v_message\.channel <> 'whatsapp'/i);
  assert.match(RPC_BODY, /v_conversation\.channel <> 'whatsapp'/i);
});

test("16. missing external identity on the conversation fails closed", () => {
  assert.match(RPC_BODY, /nullif\(btrim\(coalesce\(v_conversation\.external_sender_id, ''\)\), ''\) is null/i);
});

test("17. no lead is created anywhere in the handoff path", () => {
  assert.doesNotMatch(RPC_BODY, /yzi_imob_leads/i);
  assert.doesNotMatch(HANDOFF_MODULE_SOURCE, /yzi_imob_leads/i);
});

test("18. no call to YZI, an LLM, or a tool exists in the handoff path", () => {
  assert.doesNotMatch(RPC_BODY, /openai|anthropic|llm|generatetext|streamtext/i);
  assert.doesNotMatch(HANDOFF_MODULE_SOURCE, /openai|anthropic|llm|generatetext|streamtext|fetch\(/i);
});

test("19. server-side module is server-only, uses META_WHATSAPP_DATABASE_URL, and validates the runtime role", () => {
  assert.match(HANDOFF_MODULE_SOURCE, /import "server-only";/);
  assert.match(HANDOFF_MODULE_SOURCE, /META_WHATSAPP_DATABASE_URL/);
  assert.match(HANDOFF_MODULE_SOURCE, /META_WHATSAPP_DATABASE_ROLE = "yzi_meta_whatsapp_runtime"/);
  assert.doesNotMatch(HANDOFF_MODULE_SOURCE, /service_role/i);
  assert.match(HANDOFF_MODULE_SOURCE, /from yzi_meta_whatsapp_private\.enqueue_whatsapp_inbound_handoff\(\$\{conversationId\}::uuid, \$\{messageId\}::uuid\)/);
});

test("20. route enqueues the handoff when the processor reports processed", () => {
  assert.match(ROUTE_SOURCE, /!processingResult\.ignored && \(processingResult\.processed \|\| processingResult\.duplicate\)/);
});

test("21. route enqueues the handoff on replay (duplicate) with conversation and message ids", () => {
  assert.match(ROUTE_SOURCE, /processingResult\.duplicate/);
  assert.match(ROUTE_SOURCE, /const \{ conversationId, messageId \} = processingResult;/);
  assert.match(ROUTE_SOURCE, /enqueueWhatsappInboundHandoff\(\{ conversationId, messageId \}\)/);
});

test("22. route does not enqueue when the event was ignored", () => {
  assert.match(ROUTE_SOURCE, /!processingResult\.ignored/);
});

test("23. queued handoff status returns HTTP 200", () => {
  const handoffBlockStart = ROUTE_SOURCE.indexOf("enqueueWhatsappInboundHandoff({ conversationId, messageId })");
  const acceptedReturn = ROUTE_SOURCE.indexOf('NextResponse.json({ status: "accepted" })', handoffBlockStart);
  assert.ok(handoffBlockStart > 0);
  assert.ok(acceptedReturn > handoffBlockStart);
  assert.doesNotMatch(ROUTE_SOURCE.slice(handoffBlockStart, acceptedReturn), /status:\s*400\)/);
});

test("24. duplicate handoff status also returns HTTP 200", () => {
  assert.match(ROUTE_SOURCE, /handoffResult\.status === "duplicate"/);
  const duplicateLogIndex = ROUTE_SOURCE.indexOf('webhookLog("inbound_handoff_duplicate"');
  const acceptedReturn = ROUTE_SOURCE.lastIndexOf('NextResponse.json({ status: "accepted" })');
  assert.ok(duplicateLogIndex > 0);
  assert.ok(acceptedReturn > duplicateLogIndex);
});

test("25. handoff failure returns HTTP 500 without touching processed_at", () => {
  assert.match(
    ROUTE_SOURCE,
    /catch \{\s*webhookError\("inbound_handoff_failed", \{ reason: "handoff_error" \}\);\s*return NextResponse\.json\(\{ status: "error" \}, \{ status: 500 \}\);\s*\}/,
  );
  assert.doesNotMatch(RPC_BODY, /provider_webhook_events/i);
});

test("26. HTTP response never exposes internal request, conversation, or message ids", () => {
  assert.doesNotMatch(ROUTE_SOURCE, /NextResponse\.json\(\{\s*status:\s*"accepted",[\s\S]{0,120}(requestId|conversationId|messageId)/i);
  assert.match(ROUTE_SOURCE, /return NextResponse\.json\(\{ status: "accepted" \}\);/);
});

test("handoff module fails closed on invalid identifiers and invalid RPC results", () => {
  assert.match(HANDOFF_MODULE_SOURCE, /UUID_RE\.test\(conversationId\) \|\| !UUID_RE\.test\(messageId\)/);
  assert.match(HANDOFF_MODULE_SOURCE, /throw new Error\("Invalid WhatsApp inbound handoff identifiers\."\);/);
  assert.match(HANDOFF_MODULE_SOURCE, /throw new Error\("Invalid WhatsApp inbound handoff result\."\);/);
});

test("RPC is security-definer, scoped, and only reachable by the executor role", () => {
  assert.match(MIGRATION_SQL, /security definer/i);
  assert.match(MIGRATION_SQL, /set search_path to 'pg_catalog', 'public'/i);
  assert.match(
    MIGRATION_SQL,
    /alter function yzi_meta_whatsapp_private\.enqueue_whatsapp_inbound_handoff\(uuid, uuid\)\s+owner to postgres;/i,
  );
  assert.match(
    MIGRATION_SQL,
    /revoke all on function yzi_meta_whatsapp_private\.enqueue_whatsapp_inbound_handoff\(uuid, uuid\)\s*\nfrom public, anon, authenticated, service_role;/i,
  );
  assert.match(
    MIGRATION_SQL,
    /grant execute on function yzi_meta_whatsapp_private\.enqueue_whatsapp_inbound_handoff\(uuid, uuid\)\s+to yzi_meta_whatsapp_executor;/i,
  );
  assert.doesNotMatch(
    MIGRATION_SQL,
    /grant execute on function yzi_meta_whatsapp_private\.enqueue_whatsapp_inbound_handoff\(uuid, uuid\)[\s\S]*to (public|anon|authenticated|service_role)/i,
  );
});

test("foreign keys reuse existing composite unique constraints without altering existing tables", () => {
  assert.match(
    TABLE_BODY,
    /foreign key \(tenant_id\) references public\.tenants \(id\) on delete restrict/i,
  );
  assert.match(
    TABLE_BODY,
    /foreign key \(conversation_id, tenant_id\) references public\.yzi_imob_conversations \(id, tenant_id\) on delete restrict/i,
  );
  assert.match(
    TABLE_BODY,
    /foreign key \(message_id, tenant_id\) references public\.yzi_imob_messages \(id, tenant_id\) on delete restrict/i,
  );
  assert.doesNotMatch(MIGRATION_SQL, /alter table public\.yzi_imob_conversations/i);
  assert.doesNotMatch(MIGRATION_SQL, /alter table public\.yzi_imob_messages/i);
});
