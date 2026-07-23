export type FollowUpTaskKind =
  | "assignment_response_due"
  | "visit_feedback_due"
  | "next_action_due"
  | "lead_stalled"
  | "conversation_waiting_reply";

export type ClaimedFollowUpTask = {
  taskId: string;
  tenantId: string;
  kind: FollowUpTaskKind;
  status: "processing";
  channel: "whatsapp" | null;
  dueAt: string;
  scheduledAt: string;
  attemptCount: number;
  maxAttempts: number;
};

export type FollowUpTaskContext = {
  taskId: string;
  tenantId: string;
  leadId: string | null;
  conversationId: string | null;
  appointmentId: string | null;
  assignmentId: string | null;
  kind: FollowUpTaskKind;
  status: "processing";
  channel: "whatsapp" | null;
  dueAt: string;
  scheduledAt: string;
  notes: string | null;
  attemptCount: number;
  maxAttempts: number;
  metadata: Record<string, unknown>;
  assignmentStatus: string | null;
  appointmentStatus: string | null;
  feedbackPresent: boolean;
  externalSenderId: string | null;
  latestMessageDirection: string | null;
  latestMessageSenderType: string | null;
  latestMessageBody: string | null;
  latestMessageCreatedAt: string | null;
  leadStatus: string | null;
  nextAppointmentExists: boolean;
};

export type FollowUpFailureCode =
  | "manual_assignment_response_required"
  | "manual_visit_feedback_required"
  | "manual_next_action_required"
  | "manual_lead_recovery_required"
  | "outbound_provider_rejected"
  | "outbound_provider_unavailable"
  | "outbound_provider_response_invalid"
  | "outbound_network_error"
  | "outbound_configuration_unavailable"
  | "outbound_connection_unavailable"
  | "outbound_whatsapp_unavailable"
  | "outbound_external_sender_missing"
  | "outbound_conversation_not_found"
  | "outbound_idempotency_in_flight"
  | "outbound_idempotency_failed"
  | "outbound_persistence_failed";

export type FollowUpWorkerStatus =
  | { status: "idle"; synced: number }
  | { status: "completed"; synced: number; taskId: string; kind: FollowUpTaskKind }
  | { status: "cancelled"; synced: number; taskId: string; kind: FollowUpTaskKind; reason: string }
  | {
      status: "failed";
      synced: number;
      taskId: string;
      kind: FollowUpTaskKind;
      failureCode: FollowUpFailureCode;
      terminal: boolean;
    }
  | {
      status: "retry_scheduled";
      synced: number;
      taskId: string;
      kind: FollowUpTaskKind;
      failureCode: FollowUpFailureCode;
    }
  | { status: "configuration_missing"; synced: number }
  | { status: "error"; synced: number };

export type FollowUpRecoveryStatus =
  | { status: "ok"; followUpRecovered: number; inboundRecovered: number }
  | { status: "configuration_missing" }
  | { status: "error" };
