// YZI IMOB - Inbound Operations Consumer - Contracts and types.
//
// Isolated namespace: does NOT import from src/lib/yzi-imob/runtime/. That
// tree belongs to a different, unrelated pipeline (general property/lead
// workflows, LLM-bound, with Tool Registry/Approval Queue/Context Builder).
// This consumer is a minimal, deterministic, non-LLM classifier for
// public.yzi_imob_inbound_operation_requests handoff rows.

export type IntentKey =
  | "greeting"
  | "property_interest"
  | "scheduling_interest"
  | "human_support"
  | "unknown";

export type WorkflowKey =
  | "whatsapp_greeting_response"
  | "qualify_property_interest"
  | "collect_scheduling_context"
  | "route_to_human"
  | "ask_clarifying_question";

export type FailureCode =
  | "message_not_found"
  | "conversation_not_found"
  | "identity_mismatch"
  | "invalid_message_contract"
  | "intent_classification_failed"
  | "workflow_selection_failed"
  | "outbound_dispatch_failed"
  | "completion_failed";

export const FAILURE_CODES: readonly FailureCode[] = [
  "message_not_found",
  "conversation_not_found",
  "identity_mismatch",
  "invalid_message_contract",
  "intent_classification_failed",
  "workflow_selection_failed",
  "outbound_dispatch_failed",
  "completion_failed",
];

export type ClaimedInboundOperation = {
  requestId: string;
  tenantId: string;
  conversationId: string;
  messageId: string;
};

export type InboundOperationMessage = {
  requestId: string;
  tenantId: string;
  conversationId: string;
  messageId: string;
  body: string;
  messageChannel: string;
  conversationChannel: string;
  senderType: string;
  direction: string;
  provider: string;
};

/** Output of the deterministic classifier — auditable, never a score. */
export type IntentClassification = {
  intentKey: IntentKey;
  /** `<intentKey>:<matched phrase>` or `unknown:fallback` — audit trail only. */
  matchedRule: string;
  normalizedText: string;
};

export type ProcessOutcome =
  | { status: "idle" }
  | { status: "ready"; requestId: string; intentKey: IntentKey; workflowKey: WorkflowKey }
  | { status: "failed"; requestId: string; failureCode: FailureCode };
