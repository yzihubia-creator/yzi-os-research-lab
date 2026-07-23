import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { sendMetaWhatsappTextMessage } from "../src/lib/yzi-imob/connections/meta-whatsapp-outbound.ts";

const MIGRATION_SQL = readFileSync(
  new URL("../../supabase/migrations/20260723103000_yzi_imob_meta_whatsapp_outbound_v1.sql", import.meta.url),
  "utf8",
);
const SERVER_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/connections/meta-whatsapp-server.ts", import.meta.url),
  "utf8",
);
const OUTBOUND_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/connections/meta-whatsapp-outbound.ts", import.meta.url),
  "utf8",
);

test("migration is incremental and introduces governed outbound message columns", () => {
  assert.match(MIGRATION_SQL, /add column if not exists idempotency_key text null/i);
  assert.match(MIGRATION_SQL, /add column if not exists provider_message_id text null/i);
  assert.match(MIGRATION_SQL, /add column if not exists delivery_status text null/i);
  assert.match(MIGRATION_SQL, /add column if not exists provider_error_code text null/i);
  assert.match(MIGRATION_SQL, /yzi_imob_messages_tenant_provider_channel_idempotency_unique/i);
  assert.match(MIGRATION_SQL, /yzi_imob_messages_tenant_provider_channel_provider_message_unique/i);
});

test("outbound private functions are runtime-only and never granted to frontend roles", () => {
  for (const fn of [
    "get_meta_whatsapp_outbound_context\\(uuid, uuid\\)",
    "reserve_meta_whatsapp_outbound_message\\(uuid, uuid, text, text\\)",
    "complete_meta_whatsapp_outbound_message\\(uuid, uuid, text, text\\)",
    "fail_meta_whatsapp_outbound_message\\(uuid, uuid, text\\)",
  ]) {
    assert.match(MIGRATION_SQL, new RegExp(`revoke all on function yzi_meta_whatsapp_private\\.${fn}`, "i"));
    assert.match(MIGRATION_SQL, new RegExp(`grant execute on function yzi_meta_whatsapp_private\\.${fn}\\s+to yzi_meta_whatsapp_executor;`, "i"));
  }
  assert.match(MIGRATION_SQL, /session_user <> 'yzi_meta_whatsapp_runtime'/i);
  assert.doesNotMatch(MIGRATION_SQL, /grant execute on function yzi_meta_whatsapp_private\.\S+\s+to (public|anon|authenticated|service_role)/i);
});

test("outbound sender accepts a 2xx response with provider message id", async () => {
  const result = await sendMetaWhatsappTextMessage(
    {
      graphApiVersion: "v25.0",
      accessToken: "token",
      phoneNumberId: "123456",
      recipient: "5511999999999",
      body: "teste",
    },
    async () =>
      new Response(JSON.stringify({ messages: [{ id: "wamid.test" }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
  );

  assert.deepEqual(result, {
    status: "accepted",
    providerMessageId: "wamid.test",
    deliveryStatus: "accepted",
  });
});

test("outbound sender sanitizes 4xx errors", async () => {
  const result = await sendMetaWhatsappTextMessage(
    {
      graphApiVersion: "v25.0",
      accessToken: "token",
      phoneNumberId: "123456",
      recipient: "5511999999999",
      body: "teste",
    },
    async () =>
      new Response(JSON.stringify({ error: { code: 131045, message: "raw provider text" } }), {
        status: 400,
        headers: { "content-type": "application/json" },
      }),
  );

  assert.deepEqual(result, {
    status: "error",
    code: "provider_rejected",
    httpStatus: 400,
    providerErrorCode: 131045,
  });
});

test("server-side outbound flow remains server-only and never logs tokens or raw provider bodies", () => {
  assert.match(SERVER_SOURCE, /import "server-only";/);
  assert.match(SERVER_SOURCE, /reserve_meta_whatsapp_outbound_message/);
  assert.match(SERVER_SOURCE, /complete_meta_whatsapp_outbound_message/);
  assert.match(SERVER_SOURCE, /fail_meta_whatsapp_outbound_message/);
  assert.doesNotMatch(SERVER_SOURCE, /console\./);
  assert.doesNotMatch(OUTBOUND_SOURCE, /console\./);
  assert.doesNotMatch(OUTBOUND_SOURCE, /raw provider text/i);
  assert.doesNotMatch(SERVER_SOURCE, /console\.(log|error|warn|info|debug)\([^)]*meta_access_token/i);
});
