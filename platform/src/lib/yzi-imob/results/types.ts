export type ResultsAccessState =
  | "ready"
  | "no_membership"
  | "permission_denied"
  | "tenant_error"
  | "read_error";

export type ResultsPeriodPreset = "7d" | "30d" | "90d";

export type ResultsPeriod = {
  preset: ResultsPeriodPreset;
  start: string;
  end: string;
  label: string;
};

export type ResultsFilters = {
  period: ResultsPeriodPreset;
  propertyId: string | null;
  brokerUserId: string | null;
  channel: string | null;
  status: string | null;
};

export type DataAvailability =
  | "available"
  | "empty"
  | "partial_data"
  | "unavailable"
  | "stale_data"
  | "configuration_required";

export type StaleStatus = {
  isStale: boolean;
  lastUpdatedAt: string | null;
  staleAfterHours: number | null;
};

export type ResultsSourceAttribution = {
  id: string;
  label: string;
  tables: readonly string[];
  availability: DataAvailability;
  detail: string;
  stale: StaleStatus;
};

export type ResultsMetricValue = {
  id: string;
  label: string;
  value: number | null;
  availability: DataAvailability;
  sourceId: string;
  detail: string;
};

export type ResultsRate = {
  id: string;
  label: string;
  numerator: number;
  denominator: number;
  value: number | null;
  sourceId: string;
  formula: string;
};

export type ResultsDistributionItem = {
  id: string;
  label: string;
  count: number;
  percentage: number;
};

export type ResultsTrendPoint = {
  label: string;
  leads: number;
  interests: number;
  conversations: number;
  appointments: number;
};

export type ResultsSocialMetric = {
  socialPublicationId: string | null;
  propertyId: string | null;
  network: "instagram" | "facebook";
  providerMetricName: string;
  normalizedMetricName: string | null;
  value: number;
  periodStart: string;
  periodEnd: string;
  collectedAt: string;
};

export type ResultsSocialContract = {
  availability: DataAvailability;
  configurationMessage: string | null;
  publicationCount: number | null;
  publishedCount: number | null;
  failedCount: number | null;
  metrics: readonly ResultsSocialMetric[];
  lastCollectedAt: string | null;
};

export type ResultsOperationalHealth = {
  availability: DataAvailability;
  inboundFailed: number | null;
  outboundFailed: number | null;
  overdueFollowUps: number | null;
  recoveryExecuted: number | null;
  runnerLastExecutedAt: string | null;
  runnerStale: boolean | null;
};

export type ResultsSummary = {
  operation: readonly ResultsMetricValue[];
  service: readonly ResultsMetricValue[];
  commercial: readonly ResultsMetricValue[];
  content: readonly ResultsMetricValue[];
};

export type ResultsFilterOption = {
  value: string;
  label: string;
};

export type ResultsWorkspaceData = {
  tenantLabel: string;
  period: ResultsPeriod;
  filters: ResultsFilters;
  filterOptions: {
    properties: readonly ResultsFilterOption[];
    brokers: readonly ResultsFilterOption[];
    channels: readonly ResultsFilterOption[];
    statuses: readonly ResultsFilterOption[];
  };
  availability: DataAvailability;
  summary: ResultsSummary;
  rates: readonly ResultsRate[];
  leadSources: readonly ResultsDistributionItem[];
  leadTemperatures: readonly ResultsDistributionItem[];
  trend: readonly ResultsTrendPoint[];
  sources: readonly ResultsSourceAttribution[];
  omittedBlocks: readonly string[];
  social: ResultsSocialContract;
  operationalHealth: ResultsOperationalHealth;
  bottlenecks: readonly ResultsMetricValue[];
  isEmpty: boolean;
};
