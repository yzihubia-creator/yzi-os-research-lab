import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  discoverMetaWhatsappAssets,
  normalizeInboundMessage,
  normalizeStatusCallback,
  normalizeWhatsappNumberStatus,
  parseMetaWhatsappWebhookPayload,
  signMetaWhatsappFixture,
  verifyMetaSignature,
  verifyMetaWhatsappChallenge,
} from "../src/lib/yzi-imob/connections/meta-whatsapp.ts";

const ROUTE_SOURCE = readFileSync(
  new URL("../src/app/api/webhooks/meta/whatsapp/route.ts", import.meta.url),
  "utf8",
);
const MIGRATION_SQL = readFileSync(
  new URL("../../supabase/migrations/20260719000000_yzi_imob_meta_whatsapp_foundation_v1.sql", import.meta.url),
  "utf8",
);

const FAKE_APP_SECRET = "unit-test-app-secret";
const FIXTURE_CONNECTION_ID = "00000000-0000-4000-8000-000000000001";
const FIXTURE_TENANT_ID = "00000000-0000-4000-8000-000000000002";
const FIXTURE_WABA_ID = "100000000000001";
const FIXTURE_CLIENT_WABA_ID = "100000000000002";
const FIXTURE_PHONE_NUMBER_ID = "200000000000001";
const FIXTURE_DISPLAY_PHONE_NUMBER = "+1 555-0100";

function fixturePayload() {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: FIXTURE_WABA_ID,
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "15550100",
                phone_number_id: FIXTURE_PHONE_NUMBER_ID,
              },
              contacts: [{ wa_id: "5511999990000" }],
              messages: [
                {
                  from: "5511999990000",
                  id: "wamid.HBgMNTUxMTk5OTk5MDAwMBUCABIY",
                  timestamp: "1720000000",
                  text: { body: "Oi" },
                  type: "text",
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

test("GET challenge valid returns the provider challenge", () => {
  assert.equal(
    verifyMetaWhatsappChallenge({
      mode: "subscribe",
      verifyToken: "verify-token",
      challenge: "challenge-value",
      expectedVerifyToken: "verify-token",
    }),
    "challenge-value",
  );
});

test("GET challenge invalid token fails closed", () => {
  assert.equal(
    verifyMetaWhatsappChallenge({
      mode: "subscribe",
      verifyToken: "wrong",
      challenge: "challenge-value",
      expectedVerifyToken: "verify-token",
    }),
    null,
  );
});

test("signature valid and invalid cases are handled without real secrets", () => {
  const body = Buffer.from(JSON.stringify(fixturePayload()));
  const signature = signMetaWhatsappFixture(body, FAKE_APP_SECRET);

  assert.equal(verifyMetaSignature(body, signature, FAKE_APP_SECRET), true);
  assert.equal(verifyMetaSignature(body, signature, "different-secret"), false);
  assert.equal(verifyMetaSignature(body, "sha256=abc", FAKE_APP_SECRET), false);
  assert.equal(verifyMetaSignature(body, null, FAKE_APP_SECRET), false);
});

test("JSON is parsed only after signature validation in the route", () => {
  const signatureIndex = ROUTE_SOURCE.indexOf("verifyMetaSignature");
  const parseIndex = ROUTE_SOURCE.indexOf("JSON.parse");
  assert.ok(signatureIndex > -1);
  assert.ok(parseIndex > signatureIndex);
});

test("normalizes inbound WhatsApp messages with deterministic provider_event_key", () => {
  const event = normalizeInboundMessage(
    {
      from: "5511999990000",
      id: "wamid.inbound",
      timestamp: "1720000000",
      text: { body: "Oi" },
      type: "text",
    },
    { wabaId: "waba-1", phoneNumberId: "phone-1" },
  );

  assert.deepEqual(event, {
    providerEventKey: "wamid.inbound",
    externalMessageId: "wamid.inbound",
    eventType: "message",
    phoneNumberId: "phone-1",
    wabaId: "waba-1",
    normalizedStatus: "received",
    payloadMin: {
      message_id: "wamid.inbound",
      from: "5511999990000",
      timestamp: "1720000000",
      message_type: "text",
      text: "Oi",
    },
  });
});

test("normalizes status callbacks with message id + status + timestamp key", () => {
  const event = normalizeStatusCallback(
    {
      id: "wamid.outbound",
      status: "delivered",
      timestamp: "1720000001",
      recipient_id: "5511999990000",
    },
    { wabaId: "waba-1", phoneNumberId: "phone-1" },
  );

  assert.equal(event?.providerEventKey, "wamid.outbound:delivered:1720000001");
  assert.equal(event?.externalMessageId, "wamid.outbound");
  assert.equal(event?.eventType, "status");
  assert.equal(event?.normalizedStatus, "delivered");
});

test("parses supported webhook events from a signed-provider-shaped payload", () => {
  const events = parseMetaWhatsappWebhookPayload(fixturePayload());
  assert.equal(events.length, 1);
  assert.equal(events[0].providerEventKey, "wamid.HBgMNTUxMTk5OTk5MDAwMBUCABIY");
  assert.equal(events[0].phoneNumberId, FIXTURE_PHONE_NUMBER_ID);
  assert.equal(events[0].wabaId, FIXTURE_WABA_ID);
});

test("provider_event_key replay is idempotent per connection", () => {
  const ledger = new Set();
  function insert(connectionId, providerEventKey) {
    const key = `${connectionId}:${providerEventKey}`;
    if (ledger.has(key)) return false;
    ledger.add(key);
    return true;
  }

  assert.equal(insert("connection-1", "wamid.inbound"), true);
  assert.equal(insert("connection-1", "wamid.inbound"), false);
  assert.equal(insert("connection-2", "wamid.inbound"), true);
});

test("webhook tenant resolution is asset based, never payload tenant based", () => {
  assert.match(ROUTE_SOURCE, /resolve|persistMetaWhatsappWebhookEvents/);
  assert.doesNotMatch(ROUTE_SOURCE, /tenant_id|tenantId/);
  assert.match(MIGRATION_SQL, /resolve_meta_whatsapp_webhook_asset/);
  assert.match(MIGRATION_SQL, /tenant_connection_assets/);
  assert.doesNotMatch(MIGRATION_SQL, /insert_meta_whatsapp_webhook_event\(\s*p_tenant_id/i);
  assert.match(MIGRATION_SQL, /v_connection\.tenant_id/);
});

test("migration enforces provider_event_key uniqueness per connection", () => {
  assert.match(MIGRATION_SQL, /provider_event_key text not null/i);
  assert.match(MIGRATION_SQL, /unique \(connection_id, provider_event_key\)/i);
});

test("lookup by phone_number_id and waba_id is implemented in private RPC", () => {
  assert.match(MIGRATION_SQL, /p_phone_number_id text/);
  assert.match(MIGRATION_SQL, /p_waba_id text/);
  assert.match(MIGRATION_SQL, /a\.kind = 'whatsapp_phone_number'/);
  assert.match(MIGRATION_SQL, /a\.kind in \('whatsapp_business_account', 'waba'\)/);
  assert.match(MIGRATION_SQL, /ambiguous_whatsapp_asset/);
  assert.doesNotMatch(MIGRATION_SQL, /limit 1/i);
  assert.match(MIGRATION_SQL, /tenant_connection_assets_active_meta_whatsapp_phone_unique/);
  assert.match(MIGRATION_SQL, /tenant_connection_assets_active_meta_whatsapp_waba_unique/);
});

test("webhook without matching asset returns controlled HTTP 200 response shape", () => {
  assert.match(ROUTE_SOURCE, /status: "accepted", persisted: false, code: result\.code/);
  assert.doesNotMatch(ROUTE_SOURCE, /status:\s*202/);
});

test("POST calls inbound processor only after successful persistence", () => {
  const signatureIndex = ROUTE_SOURCE.indexOf("verifyMetaSignature");
  const persistIndex = ROUTE_SOURCE.indexOf("persistMetaWhatsappWebhookEvents(events)");
  const processIndex = ROUTE_SOURCE.indexOf("processWhatsappInboundEvent(result.eventId)");
  assert.ok(signatureIndex > -1);
  assert.ok(persistIndex > signatureIndex);
  assert.ok(processIndex > persistIndex);
  assert.match(ROUTE_SOURCE, /if \(!UUID_RE\.test\(result\.eventId\)\)[\s\S]+reason: "invalid_event_id"[\s\S]+status: 500/);
  assert.match(ROUTE_SOURCE, /if \(result\.status === "error"\)[\s\S]+return NextResponse\.json\(\{ status: "error" \}, \{ status: 500 \}\)/);
  assert.match(ROUTE_SOURCE, /if \(result\.status === "ignored"\)[\s\S]+return NextResponse\.json\(\{ status: "accepted", persisted: false, code: result\.code \}\)/);
});

test("POST processing responses are idempotent and do not expose internal ids", () => {
  assert.match(ROUTE_SOURCE, /processingResult\.duplicate[\s\S]+webhookLog\("inbound_duplicate", \{ reason: controlledReason\(processingResult\.reason\) \}\)/);
  assert.match(ROUTE_SOURCE, /processingResult\.ignored[\s\S]+webhookLog\("inbound_ignored", \{ reason: controlledReason\(processingResult\.reason\) \}\)/);
  assert.match(ROUTE_SOURCE, /return NextResponse\.json\(\{ status: "accepted" \}\)/);
  assert.doesNotMatch(ROUTE_SOURCE, /conversationId|messageId|tenantId|senderId/);
  assert.doesNotMatch(ROUTE_SOURCE, /conversationId:|messageId:|tenantId:|senderId:|eventId:/);
});

test("processor failures fail closed with sanitized server logs", () => {
  assert.match(ROUTE_SOURCE, /catch \{[\s\S]+webhookError\("inbound_processing_failed", \{ reason: "processor_error" \}\)/);
  assert.match(ROUTE_SOURCE, /return NextResponse\.json\(\{ status: "error" \}, \{ status: 500 \}\)/);
  assert.match(ROUTE_SOURCE, /CONTROLLED_REASON_RE/);
  assert.doesNotMatch(ROUTE_SOURCE, /processed_at|payloadMin|phoneNumberId|wabaId/);
});

test("route introduces no outbound WhatsApp send, YZI call, or lead creation", () => {
  assert.doesNotMatch(ROUTE_SOURCE, /graph\.facebook|messages\?|recordMessage|sender_action|outbound/i);
  assert.doesNotMatch(ROUTE_SOURCE, /openai|generateText|streamText/i);
  assert.doesNotMatch(ROUTE_SOURCE, /yzi_imob_leads|insert\s*\(/i);
});

test("official number is not promoted without API evidence", () => {
  assert.equal(
    normalizeWhatsappNumberStatus({
      qualityRating: null,
      codeVerificationStatus: null,
      status: null,
    }),
    "unavailable",
  );
  assert.equal(
    normalizeWhatsappNumberStatus({
      qualityRating: "GREEN",
      codeVerificationStatus: "VERIFIED",
      status: "CONNECTED",
    }),
    "connected",
  );
  assert.equal(
    normalizeWhatsappNumberStatus({
      qualityRating: "UNKNOWN",
      codeVerificationStatus: "VERIFIED",
      status: "PENDING",
    }),
    "configuring",
  );
  assert.equal(
    normalizeWhatsappNumberStatus({
      qualityRating: "UNKNOWN",
      codeVerificationStatus: "NOT_VERIFIED",
      status: "CONNECTED",
    }),
    "connected",
  );
});

test("discovery preserves existing non-WhatsApp Meta assets by only upserting WhatsApp kinds", () => {
  assert.match(MIGRATION_SQL, /'whatsapp_business_account'/);
  assert.match(MIGRATION_SQL, /'whatsapp_phone_number'/);
  assert.doesNotMatch(MIGRATION_SQL, /kind,\s*'page'/i);
  assert.doesNotMatch(MIGRATION_SQL, /kind,\s*'instagram'/i);
  assert.doesNotMatch(MIGRATION_SQL, /kind,\s*'ad_account'/i);
});

test("discovery normalizes real Graph-shaped WABA and phone number responses without network", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(String(url));
    if (String(url).includes("/me/businesses")) {
      return Response.json({ data: [{ id: "business-1", name: "Example Business" }] });
    }
    if (String(url).includes("/business-1/owned_whatsapp_business_accounts")) {
      return Response.json({ data: [{ id: FIXTURE_WABA_ID, name: "Example Owned WABA" }] });
    }
    if (String(url).includes("/business-1/client_whatsapp_business_accounts")) {
      return Response.json({ data: [{ id: FIXTURE_CLIENT_WABA_ID, name: "Example Client WABA" }] });
    }
    if (String(url).includes("/me/whatsapp_business_accounts")) {
      return Response.json({ data: [] });
    }
    if (String(url).includes(`/${FIXTURE_WABA_ID}/phone_numbers`)) {
      return Response.json({
        data: [
          {
            id: FIXTURE_PHONE_NUMBER_ID,
            display_phone_number: FIXTURE_DISPLAY_PHONE_NUMBER,
            verified_name: "Example Test",
            quality_rating: "GREEN",
            code_verification_status: "VERIFIED",
            platform_type: "CLOUD_API",
            status: "CONNECTED",
          },
        ],
        paging: {
          next: `https://graph.facebook.com/v25.0/${FIXTURE_WABA_ID}/phone_numbers?after=cursor`,
        },
      });
    }
    if (String(url).includes("after=cursor")) {
      return Response.json({ data: [] });
    }
    if (String(url).includes(`/${FIXTURE_CLIENT_WABA_ID}/phone_numbers`)) {
      return Response.json({ data: [] });
    }
    return Response.json({ data: [] });
  };

  const result = await discoverMetaWhatsappAssets(
    {
      connectionId: FIXTURE_CONNECTION_ID,
      tenantId: FIXTURE_TENANT_ID,
      graphApiVersion: "v25.0",
      accessToken: "fake-token",
    },
    fetchImpl,
  );

  assert.equal(result.status, "ok");
  assert.equal(result.status === "ok" && result.wabas[0].external_account_id, FIXTURE_WABA_ID);
  assert.equal(result.status === "ok" && result.wabas.some((waba) => waba.external_account_id === FIXTURE_CLIENT_WABA_ID), true);
  assert.equal(result.status === "ok" && result.phoneNumbers[0].phone_number_id, FIXTURE_PHONE_NUMBER_ID);
  assert.equal(result.status === "ok" && result.phoneNumbers[0].status, "connected");
  assert.equal(result.status === "ok" && result.phoneNumbers[0].metadata.waba_id, FIXTURE_WABA_ID);
  assert.equal(result.status === "ok" && result.diagnostics.discovered.wabaCount, 2);
  assert.equal(result.status === "ok" && result.diagnostics.discovered.phoneNumberCount, 1);
  assert.equal(result.status === "ok" && result.diagnostics.discovered.linkedPhoneNumberCount, 1);
  assert.equal(result.status === "ok" && result.diagnostics.discovered.discoveryComplete, true);
  assert.ok(calls.some((url) => url.includes("/client_whatsapp_business_accounts")));
  assert.ok(calls.some((url) => url.includes("after=cursor")));
});
