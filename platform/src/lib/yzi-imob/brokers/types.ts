import type { YziImobAppointment } from "@/lib/yzi-imob/agenda/types";
import type {
  FollowUpTask,
  LeadAssignment,
  LeadOperationalPacket,
  VisitFeedback,
} from "@/lib/yzi-imob/operations/types";

export type BrokerOperationalSummary = {
  userId: string;
  membershipId: string;
  name: string;
  role: string;
  membershipStatus: string;
  operationalAvailability: string;
  activeLeadCount: number;
  futureVisitCount: number;
  pendingAssignmentCount: number;
  missingFeedbackCount: number;
  isSelf: boolean;
};

export type BrokerWorkspaceData = {
  broker: BrokerOperationalSummary;
  assignments: readonly LeadAssignment[];
  futureAppointments: readonly YziImobAppointment[];
  appointmentsMissingFeedback: readonly YziImobAppointment[];
  operationalPackets: readonly LeadOperationalPacket[];
  feedback: readonly VisitFeedback[];
  followUps: readonly FollowUpTask[];
};

export type BrokerRepositoryError = "not_found" | "read_failed";

export type BrokerRepositoryResult<T> =
  | { status: "ok"; value: T }
  | { status: "error"; code: BrokerRepositoryError; detail?: string };
