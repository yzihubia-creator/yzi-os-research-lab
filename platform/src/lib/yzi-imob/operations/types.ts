export const LEAD_ASSIGNMENT_STATUS_VALUES = [
  "assigned",
  "accepted",
  "declined",
  "expired",
  "reassigned",
] as const;

export type LeadAssignmentStatus = (typeof LEAD_ASSIGNMENT_STATUS_VALUES)[number];

export const VISIT_FEEDBACK_ATTENDANCE_VALUES = [
  "attended",
  "no_show",
  "unknown",
] as const;

export type VisitFeedbackAttendance = (typeof VISIT_FEEDBACK_ATTENDANCE_VALUES)[number];

export const VISIT_FEEDBACK_OUTCOME_VALUES = [
  "interested",
  "not_interested",
  "proposal_requested",
  "follow_up_required",
  "undisclosed",
] as const;

export type VisitFeedbackOutcome = (typeof VISIT_FEEDBACK_OUTCOME_VALUES)[number];

export const FOLLOW_UP_TASK_KIND_VALUES = [
  "lead_stalled",
  "visit_feedback_due",
  "assignment_response_due",
  "next_action_due",
  "conversation_waiting_reply",
] as const;

export type FollowUpTaskKind = (typeof FOLLOW_UP_TASK_KIND_VALUES)[number];

export const FOLLOW_UP_TASK_STATUS_VALUES = [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "failed",
] as const;

export type FollowUpTaskStatus = (typeof FOLLOW_UP_TASK_STATUS_VALUES)[number];

export type LeadAssignment = {
  id: string;
  tenantId: string;
  leadId: string;
  leadName: string | null;
  brokerUserId: string;
  brokerName: string | null;
  status: LeadAssignmentStatus | string;
  source: string;
  notes: string | null;
  expiresAt: string | null;
  assignedAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadOperationalPacket = {
  leadId: string;
  leadName: string | null;
  leadPhone: string | null;
  leadEmail: string | null;
  leadStatus: string | null;
  leadTemperature: string | null;
  leadScore: number | null;
  propertyId: string | null;
  propertyTitle: string | null;
  assignment: LeadAssignment | null;
  latestConversationId: string | null;
  latestConversationAt: string | null;
  latestConversationBody: string | null;
  nextAppointmentId: string | null;
  nextAppointmentStartsAt: string | null;
  nextAppointmentStatus: string | null;
  nextAppointmentTitle: string | null;
};

export type VisitFeedback = {
  id: string;
  tenantId: string;
  appointmentId: string;
  leadId: string | null;
  propertyId: string | null;
  brokerUserId: string | null;
  brokerName: string | null;
  clientAttendance: VisitFeedbackAttendance | string;
  outcome: VisitFeedbackOutcome | string;
  observation: string | null;
  nextAction: string | null;
  nextActionAt: string | null;
  feedbackAt: string;
  createdAt: string;
  updatedAt: string;
};

export type FollowUpTask = {
  id: string;
  tenantId: string;
  leadId: string | null;
  conversationId: string | null;
  appointmentId: string | null;
  assignmentId: string | null;
  kind: FollowUpTaskKind | string;
  status: FollowUpTaskStatus | string;
  channel: string | null;
  dueAt: string;
  notes: string | null;
  source: string;
  lastAttemptAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateLeadAssignmentInput = {
  leadId: string;
  brokerUserId: string;
  source: string;
  notes?: string | null;
  expiresAt?: string | null;
};

export type RecordVisitFeedbackInput = {
  appointmentId: string;
  leadId?: string | null;
  propertyId?: string | null;
  brokerUserId?: string | null;
  clientAttendance: VisitFeedbackAttendance;
  outcome: VisitFeedbackOutcome;
  observation?: string | null;
  nextAction?: string | null;
  nextActionAt?: string | null;
  feedbackAt?: string | null;
};
