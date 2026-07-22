export type ResultsAccessState = "ready" | "no_membership" | "tenant_error" | "read_error";

export type ResultsMetric = {
  id: string;
  label: string;
  value: number;
  detail: string;
};

export type ResultsRate = {
  id: string;
  label: string;
  numerator: number;
  denominator: number;
  value: number | null;
  formula: string;
};

export type ResultsDistributionItem = {
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

export type ResultsSourceIssue = {
  sourceLabel: string;
  detail: string;
};

export type ResultsWorkspaceData = {
  tenantLabel: string;
  metrics: readonly ResultsMetric[];
  rates: readonly ResultsRate[];
  leadSources: readonly ResultsDistributionItem[];
  leadTemperatures: readonly ResultsDistributionItem[];
  trend: readonly ResultsTrendPoint[];
  sources: readonly string[];
  formulas: readonly string[];
  omittedBlocks: readonly string[];
  sourceIssues: readonly ResultsSourceIssue[];
  isEmpty: boolean;
};
