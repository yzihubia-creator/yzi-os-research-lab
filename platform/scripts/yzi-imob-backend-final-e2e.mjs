import assert from "node:assert/strict";

import {
  persistMetaWhatsappWebhookEvents,
  closeMetaWhatsappServerClient,
  sendGovernedMetaWhatsappText,
} from "../src/lib/yzi-imob/connections/meta-whatsapp-server.ts";
import {
  closeWhatsappInboundHandoffClient,
  enqueueWhatsappInboundHandoff,
} from "../src/lib/yzi-imob/connections/whatsapp-inbound-handoff.ts";
import {
  closeWhatsappInboundProcessorClient,
  processWhatsappInboundEvent,
} from "../src/lib/yzi-imob/connections/whatsapp-inbound-processor.ts";
import {
  closeFollowUpWorkerClient,
} from "../src/lib/yzi-imob/follow-up-worker/database.ts";
import {
  runFollowUpWorkerIteration,
  runGovernedOperationalRecovery,
} from "../src/lib/yzi-imob/follow-up-worker/worker.ts";
import {
  closeInboundOperationsClient,
} from "../src/lib/yzi-imob/inbound-operations/database.ts";
import { runInboundOperationsIteration } from "../src/lib/yzi-imob/inbound-operations/runner.ts";
import { parseMetaWhatsappWebhookPayload } from "../src/lib/yzi-imob/connections/meta-whatsapp.ts";

const FIXTURE = {
  tenantId: requiredEnv("YZI_IMOB_FIXTURE_TENANT_ID"),
  conversationId: requiredEnv("YZI_IMOB_FIXTURE_CONVERSATION_ID"),
  phoneNumberId: requiredEnv("YZI_IMOB_FIXTURE_PHONE_NUMBER_ID"),
  wabaId: requiredEnv("YZI_IMOB_FIXTURE_WABA_ID"),
  externalSenderId: requiredEnv("YZI_IMOB_FIXTURE_EXTERNAL_SENDER_ID"),
  inboundMessageId: requiredEnv("YZI_IMOB_FIXTURE_INBOUND_MESSAGE_ID"),
  recoverySource: process.env.YZI_IMOB_FIXTURE_RECOVERY_SOURCE?.trim() || "synthetic_e2e",
};
const PHASE = process.env.YZI_IMOB_E2E_PHASE?.trim() || "all";

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment: ${name}`);
  }
  return value;
}

function buildWebhookPayload(event) {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: FIXTURE.wabaId,
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "fixture-whatsapp",
                phone_number_id: FIXTURE.phoneNumberId,
              },
              ...event,
            },
          },
        ],
      },
    ],
  };
}

function inboundEventPayload() {
  return buildWebhookPayload({
    contacts: [{ wa_id: FIXTURE.externalSenderId }],
    messages: [
      {
        from: FIXTURE.externalSenderId,
        id: FIXTURE.inboundMessageId,
        timestamp: "1780000000",
        type: "text",
        text: { body: "Quero visitar o imovel ainda esta semana." },
      },
    ],
  });
}

function statusEventPayload(providerMessageId, status, timestamp) {
  return buildWebhookPayload({
    statuses: [
      {
        id: providerMessageId,
        status,
        timestamp,
        recipient_id: FIXTURE.externalSenderId,
      },
    ],
  });
}

async function dispatchWebhook(payload) {
  const events = parseMetaWhatsappWebhookPayload(payload);
  const persisted = await persistMetaWhatsappWebhookEvents(events);
  if (persisted.status !== "ok") {
    return { status: 500, body: persisted };
  }

  const processed = await processWhatsappInboundEvent(persisted.eventId);
  if (!processed.ignored && (processed.processed || processed.duplicate)) {
    assert.ok(processed.conversationId);
    assert.ok(processed.messageId);
    await enqueueWhatsappInboundHandoff({
      conversationId: processed.conversationId,
      messageId: processed.messageId,
    });
  }

  return {
    status: 200,
    body: {
      status: "accepted",
      persisted: true,
      processing: {
        processed: processed.processed,
        ignored: processed.ignored,
        duplicate: processed.duplicate,
      },
    },
  };
}

function makeFetchStub() {
  let outboundMessageCounter = 0;
  return async function fetchStub(input) {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (url.includes("/messages")) {
      outboundMessageCounter += 1;
      const providerMessageId = `wamid.synthetic.${PHASE}.${outboundMessageCounter}`;
      return new Response(
        JSON.stringify({
          messaging_product: "whatsapp",
          messages: [{ id: providerMessageId }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: { message: "unexpected synthetic fetch target" } }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  };
}

async function withSyntheticMetaEnv(fn) {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = makeFetchStub();
  try {
    return await fn();
  } finally {
    globalThis.fetch = previousFetch;
  }
}

async function main() {
  const summary = await withSyntheticMetaEnv(async () => {
    if (PHASE === "webhook_runner_callbacks" || PHASE === "all") {
      const inboundWebhook = await dispatchWebhook(inboundEventPayload());
      assert.equal(inboundWebhook.status, 200);
      assert.equal(inboundWebhook.body?.status, "accepted");

      const inboundRunner = await runInboundOperationsIteration();
      assert.equal(inboundRunner.status, "ready");

      const directOutbound = await sendGovernedMetaWhatsappText({
        tenantId: FIXTURE.tenantId,
        conversationId: FIXTURE.conversationId,
        body: "Mensagem sintetica governada para callback.",
        idempotencyKey: "synthetic-direct-outbound",
      });
      assert.equal(directOutbound.status, "accepted");

      const callbackStatuses = [];
      for (const [status, timestamp] of [
        ["sent", "1780000100"],
        ["delivered", "1780000200"],
        ["read", "1780000300"],
      ]) {
        const callback = await dispatchWebhook(
          statusEventPayload(directOutbound.providerMessageId, status, timestamp),
        );
        assert.equal(callback.status, 200);
        assert.equal(callback.body?.status, "accepted");
        callbackStatuses.push(status);
      }

      return {
        phase: PHASE,
        inboundWebhook: inboundWebhook.body?.status ?? null,
        inboundRunner: inboundRunner.status,
        inboundIntent: inboundRunner.status === "ready" ? inboundRunner.intentKey : null,
        inboundWorkflow: inboundRunner.status === "ready" ? inboundRunner.workflowKey : null,
        directOutbound: directOutbound.status,
        directOutboundProviderMessageId: directOutbound.providerMessageId,
        callbackStatuses,
      };
    }

    if (PHASE === "follow_up_recovery") {
      const followUpWorker = await runFollowUpWorkerIteration();
      assert.equal(followUpWorker.status, "completed");

      const recovery = await runGovernedOperationalRecovery({
        source: FIXTURE.recoverySource,
        processingTimeoutSeconds: 60,
        limit: 10,
      });
      assert.equal(recovery.status, "ok");

      return {
        phase: PHASE,
        followUpWorker: followUpWorker.status,
        recovery,
      };
    }

    throw new Error(`Unsupported phase: ${PHASE}`);
  });

  console.log(JSON.stringify({ status: "ok", summary }));
}

main()
  .catch((error) => {
    console.error(
      JSON.stringify({
        status: "error",
        message: error instanceof Error ? error.message : "unknown_error",
      }),
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([
      closeMetaWhatsappServerClient(),
      closeWhatsappInboundProcessorClient(),
      closeWhatsappInboundHandoffClient(),
      closeInboundOperationsClient(),
      closeFollowUpWorkerClient(),
    ]);
  });
