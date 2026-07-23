import "server-only";

import { sendGovernedMetaWhatsappText } from "../connections/meta-whatsapp-server";

import {
  claimNextInboundOperation,
  completeInboundOperation,
  failInboundOperation,
  getInboundOperationMessage,
} from "./database.ts";
import { buildDeterministicWorkflowMessage } from "./deterministic-workflows";
import { classifyIntent } from "./intent-classifier.ts";
import { FAILURE_CODES, type FailureCode, type ProcessOutcome } from "./types.ts";
import { selectWorkflow } from "./workflow-selector.ts";

const KNOWN_FAILURE_CODES = new Set<string>(FAILURE_CODES);

function toFailureCode(error: unknown, fallback: FailureCode): FailureCode {
  const message = error instanceof Error ? error.message : "";
  return KNOWN_FAILURE_CODES.has(message) ? (message as FailureCode) : fallback;
}

/**
 * Processes exactly one inbound operation request per call:
 * claim -> load message -> classify -> select workflow -> build deterministic
 * reply -> dispatch governed outbound -> complete.
 *
 * No LLM, no tool, no lead creation, no wide context.
 * Never logs or persists the message body. `fail_inbound_operation` is only
 * ever called once a request has already been claimed (its request_id is
 * always known at every failure point below).
 */
export async function processNextInboundOperation(): Promise<ProcessOutcome> {
  const claimed = await claimNextInboundOperation();
  if (!claimed) {
    return { status: "idle" };
  }

  const { requestId } = claimed;

  let body: string;
  try {
    const message = await getInboundOperationMessage(requestId);
    body = message.body;
  } catch (error) {
    const failureCode = toFailureCode(error, "invalid_message_contract");
    await failInboundOperation(requestId, failureCode);
    return { status: "failed", requestId, failureCode };
  }

  const classification = classifyIntent(body);

  let workflowKey;
  try {
    workflowKey = selectWorkflow(classification.intentKey);
  } catch {
    // Classification already produced a definite intentKey — the failed row
    // must reflect that (intent_status=classified), not pretend classification
    // never happened.
    await failInboundOperation(requestId, "workflow_selection_failed", classification.intentKey);
    return { status: "failed", requestId, failureCode: "workflow_selection_failed" };
  }

  let outboundBody: string;
  try {
    outboundBody = buildDeterministicWorkflowMessage(workflowKey);
  } catch {
    await failInboundOperation(requestId, "workflow_selection_failed", classification.intentKey);
    return { status: "failed", requestId, failureCode: "workflow_selection_failed" };
  }

  const outboundResult = await sendGovernedMetaWhatsappText({
    tenantId: claimed.tenantId,
    conversationId: claimed.conversationId,
    body: outboundBody,
    idempotencyKey: `inbound-operation:${requestId}`,
  });

  if (outboundResult.status !== "accepted") {
    await failInboundOperation(
      requestId,
      "outbound_dispatch_failed",
      classification.intentKey,
      workflowKey,
    );
    return { status: "failed", requestId, failureCode: "outbound_dispatch_failed" };
  }

  try {
    await completeInboundOperation(requestId, classification.intentKey, workflowKey);
  } catch {
    // Completion already had a definite intentKey AND workflowKey — the
    // failed row must reflect that a workflow had been selected
    // (workflow_status=selected), not discard it as if selection never happened.
    await failInboundOperation(requestId, "completion_failed", classification.intentKey, workflowKey);
    return { status: "failed", requestId, failureCode: "completion_failed" };
  }

  return {
    status: "ready",
    requestId,
    intentKey: classification.intentKey,
    workflowKey,
  };
}
