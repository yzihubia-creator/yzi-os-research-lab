import type { FollowUpFailureCode, FollowUpTaskContext } from "./types.ts";

type CancelDecision = { type: "cancel"; reason: string };
type FailDecision = { type: "fail"; failureCode: FollowUpFailureCode; retryDelaySeconds: number | null };
type OutboundDecision = { type: "outbound_whatsapp"; body: string };

export type FollowUpDecision = CancelDecision | FailDecision | OutboundDecision;

function isWhatsappEligible(context: FollowUpTaskContext): boolean {
  return context.channel === "whatsapp" && Boolean(context.conversationId && context.externalSenderId);
}

export function decideFollowUpTask(
  context: FollowUpTaskContext,
  now: Date,
  buildWhatsappBody: (context: FollowUpTaskContext) => string,
): FollowUpDecision {
  const dueAt = new Date(context.dueAt);
  if (Number.isFinite(dueAt.getTime()) && dueAt.getTime() > now.getTime()) {
    return { type: "cancel", reason: "not_due_anymore" };
  }

  switch (context.kind) {
    case "assignment_response_due":
      if (context.assignmentStatus && context.assignmentStatus !== "assigned") {
        return { type: "cancel", reason: "assignment_already_resolved" };
      }
      return {
        type: "fail",
        failureCode: "manual_assignment_response_required",
        retryDelaySeconds: null,
      };
    case "visit_feedback_due":
      if (context.feedbackPresent || context.appointmentStatus !== "completed") {
        return { type: "cancel", reason: "visit_feedback_already_resolved" };
      }
      return {
        type: "fail",
        failureCode: "manual_visit_feedback_required",
        retryDelaySeconds: null,
      };
    case "next_action_due":
      if (!isWhatsappEligible(context)) {
        return {
          type: "fail",
          failureCode: "manual_next_action_required",
          retryDelaySeconds: null,
        };
      }
      return { type: "outbound_whatsapp", body: buildWhatsappBody(context) };
    case "lead_stalled":
      if (context.nextAppointmentExists) {
        return { type: "cancel", reason: "lead_has_future_appointment" };
      }
      if (!isWhatsappEligible(context)) {
        return {
          type: "fail",
          failureCode: "manual_lead_recovery_required",
          retryDelaySeconds: null,
        };
      }
      return { type: "outbound_whatsapp", body: buildWhatsappBody(context) };
    case "conversation_waiting_reply":
      if (
        context.latestMessageDirection !== "inbound" ||
        context.latestMessageSenderType !== "external_contact"
      ) {
        return { type: "cancel", reason: "conversation_already_answered" };
      }
      if (!isWhatsappEligible(context)) {
        return {
          type: "fail",
          failureCode: "manual_lead_recovery_required",
          retryDelaySeconds: null,
        };
      }
      return { type: "outbound_whatsapp", body: buildWhatsappBody(context) };
  }
}
