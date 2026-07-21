// YZI IMOB - Inbound Operations Consumer - Deterministic workflow selector.
//
// Pure function, static map only. Does not execute a workflow, does not
// import tools, does not import src/lib/yzi-imob/runtime/ (different,
// unrelated pipeline). Fails closed for anything outside the known enum.

import type { IntentKey, WorkflowKey } from "./types.ts";

const INTENT_TO_WORKFLOW: Readonly<Record<IntentKey, WorkflowKey>> = {
  greeting: "whatsapp_greeting_response",
  property_interest: "qualify_property_interest",
  scheduling_interest: "collect_scheduling_context",
  human_support: "route_to_human",
  unknown: "ask_clarifying_question",
};

export function selectWorkflow(intentKey: IntentKey): WorkflowKey {
  const workflowKey = INTENT_TO_WORKFLOW[intentKey];
  if (!workflowKey) {
    throw new Error(`workflow_selection_failed: no workflow mapped for intent "${intentKey}".`);
  }
  return workflowKey;
}
