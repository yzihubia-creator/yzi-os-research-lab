import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { normalizeWhatsappExternalSenderId } from "../src/lib/yzi-imob/connections/whatsapp-sender-id.ts";

const MIGRATION_SQL = readFileSync(
  new URL("../../supabase/migrations/20260719010000_yzi_imob_whatsapp_inbound_processing_v1.sql", import.meta.url),
  "utf8",
);

const PROCESSOR_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/connections/whatsapp-inbound-processor.ts", import.meta.url),
  "utf8",
);
const RECORD_MESSAGE_SQL = readFileSync(
  new URL("../../docs/yzi-os-active/04-implementation/yzi-imob-conversation-record-message-manual-sql-pack-v1.sql", import.meta.url),
  "utf8",
);

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

const PROCESS_BODY = functionBody("yzi_meta_whatsapp_private.process_whatsapp_inbound_event");
const INSERT_EVENT_BODY = functionBody("yzi_meta_whatsapp_private.insert_meta_whatsapp_webhook_event");

test("migration allows leadless WhatsApp conversations only with external sender identity", () => {
  assert.match(MIGRATION_SQL, /alter table public\.yzi_imob_conversations\s+alter column lead_id drop not null;/i);
  assert.match(MIGRATION_SQL, /add column if not exists external_sender_id text null;/i);
  assert.match(
    MIGRATION_SQL,
    /lead_id is not null[\s\S]+or length\(btrim\(coalesce\(external_sender_id, ''\)\)\) > 0/i,
  );
  assert.match(
    MIGRATION_SQL,
    /create unique index if not exists yzi_imob_conversations_tenant_channel_external_sender_unique[\s\S]+on public\.yzi_imob_conversations \(tenant_id, channel, external_sender_id\)[\s\S]+where external_sender_id is not null;/i,
  );
});

test("migration adds message provider/channel idempotency for WhatsApp inbound", () => {
  assert.match(MIGRATION_SQL, /add column if not exists provider text null/i);
  assert.match(MIGRATION_SQL, /add column if not exists channel text null/i);
  assert.match(MIGRATION_SQL, /add column if not exists provider_timestamp timestamptz null/i);
  assert.match(MIGRATION_SQL, /check \(provider is null or provider = 'meta'\)/i);
  assert.match(MIGRATION_SQL, /check \(channel is null or channel = 'whatsapp'\)/i);
  assert.match(
    MIGRATION_SQL,
    /create unique index if not exists yzi_imob_messages_tenant_provider_channel_external_message_unique[\s\S]+on public\.yzi_imob_messages \(tenant_id, provider, channel, external_message_id\)[\s\S]+where external_message_id is not null;/i,
  );
});

test("legacy yzi_imob_record_message contract remains compatible with nullable provider and channel", () => {
  assert.match(RECORD_MESSAGE_SQL, /create or replace function public\.yzi_imob_record_message\(\s*p_tenant_id uuid,\s*p_conversation_id uuid,\s*p_direction text,\s*p_sender_type text,\s*p_body text,\s*p_external_message_id text default null/i);
  assert.match(RECORD_MESSAGE_SQL, /security invoker/i);
  assert.match(RECORD_MESSAGE_SQL, /insert into public\.yzi_imob_messages \(\s*tenant_id, conversation_id, direction, sender_type, body, external_message_id\s*\)/i);
  assert.doesNotMatch(RECORD_MESSAGE_SQL, /provider|channel|provider_timestamp/i);
  assert.match(MIGRATION_SQL, /add column if not exists provider text null/i);
  assert.match(MIGRATION_SQL, /add column if not exists channel text null/i);
  assert.match(MIGRATION_SQL, /add column if not exists provider_timestamp timestamptz null/i);
});

test("webhook event insert preserves idempotency but leaves processed_at null", () => {
  assert.match(INSERT_EVENT_BODY, /on conflict \(connection_id, provider_event_key\)[\s\S]+do nothing/i);
  assert.match(INSERT_EVENT_BODY, /processed_at[\s\S]+\) values \([\s\S]+null[\s\S]+\)/i);
  assert.doesNotMatch(INSERT_EVENT_BODY, /processed_at[\s\S]{0,120}now\(\)/i);
});

test("private processor is security-definer, scoped, and not exposed to frontend roles", () => {
  assert.match(MIGRATION_SQL, /create or replace function yzi_meta_whatsapp_private\.process_whatsapp_inbound_event\(\s*p_event_id uuid\s*\)/i);
  assert.match(MIGRATION_SQL, /security definer/i);
  assert.match(MIGRATION_SQL, /set search_path to 'pg_catalog', 'public'/i);
  assert.match(PROCESS_BODY, /session_user <> 'yzi_meta_whatsapp_runtime'/i);
  assert.match(MIGRATION_SQL, /alter function yzi_meta_whatsapp_private\.process_whatsapp_inbound_event\(uuid\)\s+owner to postgres;/i);
  assert.match(
    MIGRATION_SQL,
    /revoke all on function yzi_meta_whatsapp_private\.process_whatsapp_inbound_event\(uuid\)[\s\S]+from public, anon, authenticated, service_role/i,
  );
  assert.match(
    MIGRATION_SQL,
    /grant execute on function yzi_meta_whatsapp_private\.process_whatsapp_inbound_event\(uuid\)\s+to yzi_meta_whatsapp_executor;/i,
  );
  assert.doesNotMatch(MIGRATION_SQL, /grant execute on function yzi_meta_whatsapp_private\.process_whatsapp_inbound_event\(uuid\)[\s\S]+to (public|anon|authenticated|service_role)/i);
});

test("runtime receives no direct table grants in this migration", () => {
  assert.doesNotMatch(MIGRATION_SQL, /grant\s+(select|insert|update|delete|all)[\s\S]+on\s+(table\s+)?public\.(yzi_imob_conversations|yzi_imob_messages|yzi_imob_leads|provider_webhook_events)[\s\S]+to\s+yzi_meta_whatsapp_runtime/i);
  assert.doesNotMatch(MIGRATION_SQL, /grant\s+(select|insert|update|delete|all)[\s\S]+on\s+(table\s+)?public\.(yzi_imob_conversations|yzi_imob_messages|yzi_imob_leads|provider_webhook_events)[\s\S]+to\s+yzi_meta_whatsapp_executor/i);
});

test("migration does not depend on roles from other Meta units", () => {
  assert.doesNotMatch(MIGRATION_SQL, /yzi_meta_ads|yzi_meta_oauth|validation_executor|callback_runtime/i);
});

test("processor validates persisted event and never trusts tenant or conversation from payload", () => {
  assert.match(PROCESS_BODY, /from public\.provider_webhook_events pwe[\s\S]+where pwe\.id = p_event_id[\s\S]+for update/i);
  assert.match(PROCESS_BODY, /v_event\.provider <> 'meta' or v_event\.channel <> 'whatsapp'/i);
  assert.match(PROCESS_BODY, /tc\.id = v_event\.connection_id[\s\S]+tc\.tenant_id = v_event\.tenant_id/i);
  assert.doesNotMatch(PROCESS_BODY, /v_payload\s*->>\s*'tenant_id'/i);
  assert.doesNotMatch(PROCESS_BODY, /v_payload\s*->>\s*'connection_id'/i);
  assert.doesNotMatch(PROCESS_BODY, /v_payload\s*->>\s*'conversation_id'/i);
});

test("first text message creates leadless external conversation and inbound message", () => {
  assert.match(
    PROCESS_BODY,
    /insert into public\.yzi_imob_conversations \([\s\S]+tenant_id,[\s\S]+lead_id,[\s\S]+channel,[\s\S]+external_sender_id,[\s\S]+status/i,
  );
  assert.match(PROCESS_BODY, /v_event\.tenant_id,[\s\S]+null,[\s\S]+'whatsapp',[\s\S]+v_external_sender_id,[\s\S]+'open'/i);
  assert.match(
    PROCESS_BODY,
    /insert into public\.yzi_imob_messages \([\s\S]+direction,[\s\S]+sender_type,[\s\S]+body,[\s\S]+external_message_id,[\s\S]+provider,[\s\S]+channel,[\s\S]+provider_timestamp/i,
  );
  assert.match(PROCESS_BODY, /'inbound'[\s\S]+'external_contact'[\s\S]+v_body[\s\S]+v_external_message_id[\s\S]+'meta'[\s\S]+'whatsapp'/i);
  assert.doesNotMatch(PROCESS_BODY, /insert into public\.yzi_imob_leads/i);
});

test("same sender reuses conversation across messages and remains tenant-scoped", () => {
  assert.match(
    PROCESS_BODY,
    /on conflict \(tenant_id, channel, external_sender_id\)[\s\S]+where external_sender_id is not null[\s\S]+do update/i,
  );
  assert.match(PROCESS_BODY, /v_event\.tenant_id/i);
  assert.doesNotMatch(PROCESS_BODY, /on conflict \(channel, external_sender_id\)/i);
});

test("message external id and event replay are idempotent", () => {
  assert.match(
    PROCESS_BODY,
    /on conflict \(tenant_id, provider, channel, external_message_id\)[\s\S]+where external_message_id is not null[\s\S]+do nothing/i,
  );
  assert.match(PROCESS_BODY, /where m\.tenant_id = v_event\.tenant_id[\s\S]+m\.provider = 'meta'[\s\S]+m\.channel = 'whatsapp'[\s\S]+m\.external_message_id = v_external_message_id/i);
  assert.match(PROCESS_BODY, /if v_event\.processed_at is not null then/i);
  assert.match(PROCESS_BODY, /duplicate := true/i);
});

test("unprocessed persisted event can resume from existing message and mark processed", () => {
  const duplicateLookup = PROCESS_BODY.indexOf("if not v_message_inserted then");
  const markProcessed = PROCESS_BODY.lastIndexOf("update public.provider_webhook_events");
  assert.ok(duplicateLookup > 0);
  assert.ok(markProcessed > duplicateLookup);
  assert.match(PROCESS_BODY, /set processed_at = now\(\),[\s\S]+normalized_status = case[\s\S]+processed_duplicate_message/i);
});

test("empty text, missing message id, status, and unsupported events are ignored without message creation", () => {
  assert.match(PROCESS_BODY, /v_event\.event_type <> 'message'[\s\S]+normalized_status = 'ignored'/i);
  assert.match(PROCESS_BODY, /v_external_message_id = ''[\s\S]+normalized_status = 'ignored'[\s\S]+missing_external_message_id/i);
  assert.match(PROCESS_BODY, /v_external_sender_id = ''[\s\S]+normalized_status = 'ignored'[\s\S]+missing_external_sender/i);
  assert.match(PROCESS_BODY, /v_body = ''[\s\S]+normalized_status = 'ignored'[\s\S]+empty_text/i);
});

test("message conflicts across conversations fail closed instead of silently accepting duplicates", () => {
  assert.match(PROCESS_BODY, /v_message_conversation_id uuid;/i);
  assert.match(PROCESS_BODY, /into v_message_id, v_message_conversation_id, v_effective_message_at/i);
  assert.match(PROCESS_BODY, /v_message_conversation_id is distinct from v_conversation_id[\s\S]+external_message_id_conversation_conflict/i);
});

test("text size is bounded and invalid provider timestamps do not abort processing", () => {
  assert.match(PROCESS_BODY, /if length\(v_body\) > 4096 then[\s\S]+reason := 'text_too_long'/i);
  assert.match(PROCESS_BODY, /coalesce\(v_payload ->> 'provider_timestamp', v_payload ->> 'timestamp'\)::double precision/i);
  assert.match(PROCESS_BODY, /exception when others then[\s\S]+v_provider_timestamp := null;/i);
});

test("processed_at is marked only after message consistency, and errors roll back naturally", () => {
  const conversationInsert = PROCESS_BODY.indexOf("insert into public.yzi_imob_conversations");
  const messageInsert = PROCESS_BODY.indexOf("insert into public.yzi_imob_messages");
  const conversationUpdate = PROCESS_BODY.indexOf("update public.yzi_imob_conversations");
  const eventProcessedUpdate = PROCESS_BODY.lastIndexOf("update public.provider_webhook_events");
  assert.ok(conversationInsert > 0);
  assert.ok(messageInsert > conversationInsert);
  assert.ok(conversationUpdate > messageInsert);
  assert.ok(eventProcessedUpdate > conversationUpdate);
  assert.doesNotMatch(PROCESS_BODY.slice(messageInsert), /exception\s+when[\s\S]+processed_at = now\(\)/i);
});

test("processor creates no outbound, lead, score, property, broker distribution, or YZI call", () => {
  assert.doesNotMatch(PROCESS_BODY, /direction[\s\S]{0,80}'outbound'/i);
  assert.doesNotMatch(PROCESS_BODY, /sender_type[\s\S]{0,80}'yzi'/i);
  assert.doesNotMatch(PROCESS_BODY, /yzi_imob_leads|yzi_imob_property_interests|score|broker|corretor|distribution|distribu/i);
  assert.doesNotMatch(PROCESSOR_SOURCE, /fetch\(|openai|llm|generateText|streamText/i);
});

test("Node processor is server-only, sanitizes ids, and only calls the private RPC", () => {
  assert.match(PROCESSOR_SOURCE, /import "server-only";/);
  assert.match(PROCESSOR_SOURCE, /META_WHATSAPP_DATABASE_URL/);
  assert.match(PROCESSOR_SOURCE, /META_WHATSAPP_DATABASE_ROLE = "yzi_meta_whatsapp_runtime"/);
  assert.match(PROCESSOR_SOURCE, /UUID_RE\.test\(eventId\)/);
  assert.match(PROCESSOR_SOURCE, /from yzi_meta_whatsapp_private\.process_whatsapp_inbound_event\(\$\{eventId\}::uuid\)/);
  assert.match(PROCESSOR_SOURCE, /processWhatsappInboundEvent\(eventId: string\)/);
  assert.doesNotMatch(PROCESSOR_SOURCE, /service_role|access_token|refresh_token/i);
});

test("normalizes synthetic WhatsApp external sender ids without assuming country or human name", () => {
  assert.deepEqual(normalizeWhatsappExternalSenderId("  +55 (00) 0000-0000  "), {
    status: "ok",
    externalSenderId: "550000000000",
  });
  assert.deepEqual(normalizeWhatsappExternalSenderId("synthetic.sender@example.test"), {
    status: "ok",
    externalSenderId: "synthetic.sender@example.test",
  });
  assert.deepEqual(normalizeWhatsappExternalSenderId("   "), { status: "error", code: "empty_sender" });
});
