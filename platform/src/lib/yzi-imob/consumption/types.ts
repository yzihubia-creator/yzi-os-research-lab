export type SystemResourceStatus =
  | "available"
  | "partial"
  | "unavailable"
  | "configuration_required"
  | "stale"
  | "error";

export type UsageAvailability = boolean;
export type CostAvailability = boolean;
export type LimitAvailability = boolean;

export type SystemResourceState = {
  provider: "meta_whatsapp" | "metricool" | "yzi_runtime";
  capability: "outbound_messages" | "social_publication" | "runner_execution";
  label: string;
  description: string;
  status: SystemResourceStatus;
  usage_available: UsageAvailability;
  cost_available: CostAvailability;
  limit_available: LimitAvailability;
  period: {
    start: string;
    end: string;
    label: string;
  };
  usage_value: number | null;
  usage_unit: "messages" | "publications" | "executions";
  cost_value: number | null;
  currency: string | null;
  limit_value: number | null;
  last_updated_at: string | null;
  source:
    | "yzi_imob_messages"
    | "yzi_imob_social_publications"
    | "yzi_imob_inbound_runner_executions";
  error_code: "read_failed" | "connection_attention_required" | null;
  action_href: string;
  connection_status: SystemResourceStatus | null;
};

export type OperationalConsumptionSummary = {
  generated_at: string;
  period: SystemResourceState["period"];
  resources: readonly SystemResourceState[];
  financial_consumption_available: boolean;
  known_costs: readonly [];
  known_limits: readonly [];
};

export type ProviderUsage = SystemResourceState;

export type OperationalCountResult =
  | { status: "ok"; count: number; lastUpdatedAt: string | null }
  | { status: "error" };

export type OperationalConnectionResult = {
  status:
    | "available"
    | "partial"
    | "unavailable"
    | "configuration_required"
    | "stale"
    | "error";
  lastUpdatedAt: string | null;
  errorCode: "connection_attention_required" | null;
};

export type OperationalConsumptionSources = {
  whatsappConnection: OperationalConnectionResult;
  metricoolConnection: OperationalConnectionResult;
  outboundMessages: OperationalCountResult;
  socialPublications: OperationalCountResult;
  runnerExecutions: OperationalCountResult;
};
