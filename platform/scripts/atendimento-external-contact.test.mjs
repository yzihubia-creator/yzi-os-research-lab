import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { maskExternalSenderId } from "../src/lib/yzi-imob/conversations/external-identity.ts";

const LIST_PAGE_SOURCE = readFileSync(
  new URL("../src/app/cockpit/yzi-imob/atendimento/page.tsx", import.meta.url),
  "utf8",
);
const DETAIL_PAGE_SOURCE = readFileSync(
  new URL("../src/app/cockpit/yzi-imob/atendimento/[id]/page.tsx", import.meta.url),
  "utf8",
);
const WORKSPACE_SOURCE = readFileSync(
  new URL("../src/components/yzi-imob/yzi-imob-conversation-workspace.tsx", import.meta.url),
  "utf8",
);
const QUERIES_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/conversations/queries.ts", import.meta.url),
  "utf8",
);
const MAPPERS_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/conversations/mappers.ts", import.meta.url),
  "utf8",
);
const WHATSAPP_PROCESSOR_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/connections/whatsapp-inbound-processor.ts", import.meta.url),
  "utf8",
);
const WEBHOOK_ROUTE_SOURCE = readFileSync(
  new URL("../src/app/api/webhooks/meta/whatsapp/route.ts", import.meta.url),
  "utf8",
);

test("mapper preserves lead conversations and derives external contact contract", () => {
  assert.match(MAPPERS_SOURCE, /const leadId = strOrNull\(record, "lead_id"\)/);
  assert.match(MAPPERS_SOURCE, /const externalSenderId = strOrNull\(record, "external_sender_id"\)/);
  assert.match(MAPPERS_SOURCE, /const isExternalContact = !leadId && Boolean\(externalSenderId\)/);
  assert.match(MAPPERS_SOURCE, /displayName: isExternalContact \? "Contato externo" : null/);
  assert.match(MAPPERS_SOURCE, /externalIdentityMasked: isExternalContact \? maskExternalSenderId\(externalSenderId\) : null/);
  assert.match(MAPPERS_SOURCE, /lead: null/);
  assert.match(MAPPERS_SOURCE, /throw new Error\("conversation_identity_missing/);
});

test("external sender mask is synthetic, short, and does not expose full provider identity", () => {
  assert.equal(maskExternalSenderId("551199990100"), "final 0100");
  assert.equal(maskExternalSenderId("+1 (555) 0100"), "final 0100");
  assert.equal(maskExternalSenderId("synthetic.sender@example.test"), "final er@example.test");
  assert.equal(maskExternalSenderId(""), null);
});

test("list query keeps tenant scoping, pagination, and ordering without joining leads", () => {
  assert.match(QUERIES_SOURCE, /\.from\("yzi_imob_conversations"\)[\s\S]+\.select\("\*"\)/);
  assert.match(QUERIES_SOURCE, /\.eq\("tenant_id", input\.tenantId\)/);
  assert.match(QUERIES_SOURCE, /\.order\("last_message_at", \{ ascending: false, nullsFirst: false \}\)/);
  assert.match(QUERIES_SOURCE, /\.range\(offset, offset \+ limit - 1\)/);
  assert.doesNotMatch(QUERIES_SOURCE, /yzi_imob_leads\([^)]*\)/);
});

test("external conversation stays visible in list and no null lead id is looked up", () => {
  assert.match(LIST_PAGE_SOURCE, /filter\(\(leadId\): leadId is string => Boolean\(leadId\)\)/);
  assert.match(LIST_PAGE_SOURCE, /conversation\.isExternalContact[\s\S]+\? "Contato externo"/);
  assert.match(LIST_PAGE_SOURCE, /conversation\.externalIdentityMasked/);
  assert.doesNotMatch(LIST_PAGE_SOURCE, /lead quente|temperatura|score|corretor|im[oó]vel|pipeline/i);
});

test("detail page does not fetch lead record for external contact", () => {
  assert.match(DETAIL_PAGE_SOURCE, /conversation\.leadId \? getLead\(tenantId, conversation\.leadId\) : Promise\.resolve\(null\)/);
});

test("external contact detail renders header, qualification state, and hides commercial affordances", () => {
  assert.match(WORKSPACE_SOURCE, /const title = isExternalContact \? "Contato externo"/);
  assert.match(WORKSPACE_SOURCE, /Ainda não qualificado como lead/);
  assert.match(WORKSPACE_SOURCE, /conversation\.externalIdentityMasked/);
  assert.match(WORKSPACE_SOURCE, /ficha, score, temperatura, imóvel, corretor, pipeline, proposta e visita/);
  assert.doesNotMatch(WORKSPACE_SOURCE, /Converter em lead|Abrir ficha|Criar lead/);
});

test("external_contact renders as inbound contact and callbacks do not enter chat history", () => {
  assert.match(WORKSPACE_SOURCE, /external_contact: "Contato externo"/);
  assert.match(WORKSPACE_SOURCE, /filter\(\(message\) => message\.direction === "inbound" \|\| message\.direction === "outbound"\)/);
});

test("no automatic lead, webhook processor call, YZI call, or outbound message is introduced", () => {
  assert.doesNotMatch(LIST_PAGE_SOURCE + DETAIL_PAGE_SOURCE + WORKSPACE_SOURCE, /insert\s*\(\s*\{[\s\S]*yzi_imob_leads|from\("yzi_imob_leads"\)\.insert/i);
  assert.doesNotMatch(WEBHOOK_ROUTE_SOURCE, /processWhatsappInboundEvent/);
  assert.doesNotMatch(WORKSPACE_SOURCE, /fetch\(|openai|generateText|streamText|recordMessage/i);
  assert.doesNotMatch(WHATSAPP_PROCESSOR_SOURCE, /direction[\s\S]{0,80}'outbound'/i);
});
