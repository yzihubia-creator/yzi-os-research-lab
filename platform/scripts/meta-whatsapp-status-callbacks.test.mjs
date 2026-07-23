import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { normalizeStatusCallback } from "../src/lib/yzi-imob/connections/meta-whatsapp.ts";

const MIGRATION_SQL = readFileSync(
  new URL("../../supabase/migrations/20260723162000_yzi_imob_meta_whatsapp_status_callbacks_v1.sql", import.meta.url),
  "utf8",
);

test("status callback migration extends delivery lifecycle and updates messages monotonically", () => {
  assert.match(MIGRATION_SQL, /'pending_dispatch', 'accepted', 'sent', 'delivered', 'read', 'failed'/i);
  assert.match(MIGRATION_SQL, /v_event\.event_type = 'status'/i);
  assert.match(MIGRATION_SQL, /status_callback_updated/i);
  assert.match(MIGRATION_SQL, /status_callback_ignored/i);
  assert.match(MIGRATION_SQL, /update public\.yzi_imob_messages\s+set delivery_status = 'failed'/i);
  assert.match(MIGRATION_SQL, /update public\.yzi_imob_messages\s+set delivery_status = v_callback_status/i);
});

test("status callback parser keeps deterministic idempotency key and sanitized provider error codes", () => {
  const event = normalizeStatusCallback(
    {
      id: "wamid.status",
      status: "failed",
      timestamp: "1720000002",
      recipient_id: "5511999990000",
      errors: [{ code: 131045, error_subcode: 2494010, message: "raw provider text" }],
    },
    { wabaId: "waba-1", phoneNumberId: "phone-1" },
  );

  assert.equal(event?.providerEventKey, "wamid.status:failed:1720000002");
  assert.equal(event?.normalizedStatus, "failed");
  assert.deepEqual(event?.payloadMin, {
    message_id: "wamid.status",
    status: "failed",
    timestamp: "1720000002",
    recipient_id: "5511999990000",
    provider_error_code: 131045,
    provider_error_subcode: 2494010,
  });
});
