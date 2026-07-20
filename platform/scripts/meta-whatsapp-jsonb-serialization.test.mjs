import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import postgres from "postgres";

const SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/connections/meta-whatsapp-server.ts", import.meta.url),
  "utf8",
);

function functionBody(name) {
  const marker = `async function ${name}`;
  const start = SOURCE.indexOf(marker);
  assert.notEqual(start, -1, `missing ${name}`);
  const returnArrow = SOURCE.indexOf("): Promise<", start);
  assert.notEqual(returnArrow, -1, `missing return type for ${name}`);
  const bodyStart = SOURCE.indexOf("{", returnArrow);
  let depth = 0;
  for (let i = bodyStart; i < SOURCE.length; i += 1) {
    if (SOURCE[i] === "{") depth += 1;
    if (SOURCE[i] === "}") {
      depth -= 1;
      if (depth === 0) return SOURCE.slice(bodyStart, i + 1);
    }
  }
  assert.fail(`unterminated body for ${name}`);
}

const ASSETS_BODY = functionBody("persistMetaWhatsappAssets");
const WEBHOOK_BODY = functionBody("persistMetaWhatsappWebhookEvents");

// A postgres.js Sql instance never opens a socket at construction time —
// connect() only runs when a query is actually sent — so this is safe
// to build without any live database.
const sql = postgres("postgres://user:pass@localhost:5432/db", { max: 0 });

test("persistMetaWhatsappAssets no longer double-encodes JSONB via JSON.stringify(...)::jsonb", () => {
  assert.doesNotMatch(ASSETS_BODY, /JSON\.stringify/);
  assert.doesNotMatch(ASSETS_BODY, /::jsonb/);
  assert.match(ASSETS_BODY, /sql\.json\(\s*input\.wabas\b/);
  assert.match(ASSETS_BODY, /sql\.json\(\s*input\.phoneNumbers\b/);
});

test("persistMetaWhatsappWebhookEvents no longer double-encodes JSONB via JSON.stringify(...)::jsonb", () => {
  assert.doesNotMatch(WEBHOOK_BODY, /JSON\.stringify/);
  assert.doesNotMatch(WEBHOOK_BODY, /::jsonb/);
  assert.match(WEBHOOK_BODY, /sql\.json\(\s*event\.payloadMin\b/);
});

test("no JSON.stringify(...)::jsonb pattern remains anywhere in the file", () => {
  assert.doesNotMatch(SOURCE, /JSON\.stringify\([^)]*\)\s*\}::jsonb/);
});

test("sql.json marks the parameter as native jsonb (oid 3802) without touching driver internals", () => {
  const object = { a: 1, nested: { b: [1, 2, 3] } };
  const param = sql.json(object);
  assert.equal(param.type, 3802);
  assert.equal(param.value, object);
});

test("sql.json preserves a plain object unchanged (no premature stringification)", () => {
  const value = { external_account_id: "waba-1", status: "connected", metadata: { foo: "bar" } };
  const param = sql.json(value);
  assert.deepEqual(param.value, value);
  assert.equal(typeof param.value, "object");
});

test("sql.json preserves a nested object unchanged", () => {
  const value = { metadata: { discovery_source: "me", nested: { deep: { flag: true } } } };
  const param = sql.json(value);
  assert.deepEqual(param.value, value);
});

test("sql.json preserves an array unchanged", () => {
  const value = [
    { external_account_id: "waba-1", status: "connected", metadata: {} },
    { external_account_id: "waba-2", status: "configuring", metadata: {} },
  ];
  const param = sql.json(value);
  assert.deepEqual(param.value, value);
  assert.equal(Array.isArray(param.value), true);
});

test("sql.json preserves null unchanged", () => {
  const param = sql.json(null);
  assert.equal(param.value, null);
  assert.equal(param.type, 3802);
});

test("sql.json preserves a string literal as a string, not double-quoted JSON", () => {
  const param = sql.json("plain-string");
  assert.equal(param.value, "plain-string");
  assert.equal(typeof param.value, "string");
});

test("sql.json preserves a synthetic webhook payloadMin shape unchanged", () => {
  const payloadMin = {
    message_id: "wamid.synthetic",
    from: "5511999990000",
    timestamp: "1720000000",
    message_type: "text",
    text: "Oi",
  };
  const param = sql.json(payloadMin);
  assert.deepEqual(param.value, payloadMin);
  assert.equal(param.type, 3802);
});

test("sql.json preserves synthetic WABA/phone number asset arrays unchanged", () => {
  const wabas = [
    {
      external_account_id: "waba-synthetic",
      account_label: "Synthetic WABA",
      status: "configuring",
      metadata: { normalized_kind: "whatsapp_business_account", discovery_source: "me" },
    },
  ];
  const phoneNumbers = [
    {
      phone_number_id: "phone-synthetic",
      display_phone_number: "+1 555-0100",
      verified_name: "Synthetic Test",
      status: "connected",
      metadata: { normalized_kind: "whatsapp_phone_number", waba_id: "waba-synthetic" },
    },
  ];
  assert.deepEqual(sql.json(wabas).value, wabas);
  assert.deepEqual(sql.json(phoneNumbers).value, phoneNumbers);
});

test("proof that JSON.stringify(...) fed into sql.json would double-encode (regression guard)", () => {
  const value = { a: 1 };
  const wronglyPreStringified = sql.json(JSON.stringify(value));
  assert.equal(typeof wronglyPreStringified.value, "string");
  assert.notDeepEqual(wronglyPreStringified.value, value);

  const correct = sql.json(value);
  assert.equal(typeof correct.value, "object");
  assert.deepEqual(correct.value, value);
});

test("HTTP/RPC contract is unchanged: same RPC names, same return columns, same exported signatures", () => {
  assert.match(SOURCE, /from yzi_meta_whatsapp_private\.upsert_meta_whatsapp_assets\(/);
  assert.match(SOURCE, /select waba_count, phone_number_count, persisted_at/);
  assert.match(SOURCE, /from yzi_meta_whatsapp_private\.insert_meta_whatsapp_webhook_event\(/);
  assert.match(SOURCE, /select event_id, inserted, created_at/);
  assert.match(SOURCE, /export async function runMetaWhatsappDiscovery/);
  assert.match(SOURCE, /export async function persistMetaWhatsappWebhookEvents/);
});

test("no payload is logged, no YZI call, no outbound send, no lead creation", () => {
  assert.doesNotMatch(SOURCE, /console\.(log|error|warn|info|debug)/);
  assert.doesNotMatch(SOURCE, /openai|generateText|streamText/i);
  assert.doesNotMatch(SOURCE, /graph\.facebook\.com\/.*\/messages/i);
  assert.doesNotMatch(SOURCE, /yzi_imob_leads/i);
});
