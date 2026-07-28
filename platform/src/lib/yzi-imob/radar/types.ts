export type RadarSignalKind =
  | "property_incomplete"
  | "property_without_interest"
  | "lead_without_recent_interaction"
  | "hot_lead_without_progress"
  | "conversation_stalled"
  | "appointment_pending"
  | "inbound_failure"
  | "high_score_interest"
  | "social_publish_failed"
  | "social_publish_stalled"
  | "metricool_connection_attention"
  | "approved_content_unscheduled"
  | "social_metrics_missing"
  | "social_sync_delayed";

export type RadarSignal = {
  id: string;
  kind: RadarSignalKind;
  sourceLabel: string;
  areaLabel: string;
  whatLabel: string;
  whyLabel: string;
  ruleLabel: string;
  evidenceLabel: string;
  href: string | null;
  count: number;
  lastSeenAt: string | null;
};

export type RadarSourceIssue = {
  sourceLabel: string;
  detail: string;
};

export type RadarWorkspaceData = {
  signals: readonly RadarSignal[];
  sourceIssues: readonly RadarSourceIssue[];
};
