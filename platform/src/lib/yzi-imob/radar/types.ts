import type { DataAvailability, StaleStatus } from "@/lib/yzi-imob/results/types";

export type RadarSignalSeverity = "info" | "attention" | "important" | "critical";
export type RadarSignalCategory = "ativo" | "lead" | "visita" | "atendimento" | "conexao" | "sistema";
export type RadarSignalStatus = "active" | "acknowledged" | "resolved";

export type RadarSignalType =
  | "property_incomplete"
  | "property_media_insufficient"
  | "publication_waiting_approval"
  | "publication_failed"
  | "property_publication_inconsistent"
  | "hot_lead_without_assignment"
  | "assignment_waiting_acceptance"
  | "lead_without_next_action"
  | "follow_up_overdue"
  | "conversation_waiting_response"
  | "visit_unconfirmed"
  | "visit_without_feedback"
  | "cancelled_visit_follow_up_pending"
  | "feedback_next_action_overdue"
  | "outbound_failed"
  | "message_status_stale"
  | "inbound_operation_failed"
  | "runner_stale"
  | "recoverable_operation"
  | "whatsapp_attention_required"
  | "metricool_configuration_required"
  | "metricool_token_invalid"
  | "metricool_rate_limited"
  | "social_sync_stale"
  | "social_publication_stalled"
  | "job_stalled"
  | "recovery_limit_reached"
  | "attempts_exhausted";

export type RadarSignalMetadata = Readonly<Record<string, string | number | boolean | null>>;

export type RadarSignal = {
  id: string;
  tenantId: string;
  type: RadarSignalType;
  category: RadarSignalCategory;
  severity: RadarSignalSeverity;
  title: string;
  description: string;
  entityType: "property" | "lead" | "assignment" | "follow_up" | "conversation" | "appointment" | "publication" | "connection" | "job" | "operation" | "system";
  entityId: string;
  source: string;
  detectedAt: string;
  dueAt: string | null;
  status: RadarSignalStatus;
  actionLabel: string;
  actionHref: string | null;
  metadata: RadarSignalMetadata;
};

export type RadarSourceState = {
  id: string;
  label: string;
  availability: DataAvailability;
  detail: string;
  stale: StaleStatus;
};

export type RadarOperationalHealth = {
  availability: DataAvailability;
  inboundFailed: number | null;
  outboundFailed: number | null;
  jobsStalled: number | null;
  overdueTasks: number | null;
  recoveriesExecuted: number | null;
  latestRunnerExecutionAt: string | null;
};

export type RadarWorkspaceData = {
  signals: readonly RadarSignal[];
  sources: readonly RadarSourceState[];
  operationalHealth: RadarOperationalHealth;
  availability: DataAvailability;
  persistenceRequired: false;
};
