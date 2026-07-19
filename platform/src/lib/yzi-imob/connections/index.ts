// YZI IMOB — Conexões (barrel). Catálogo estático de conexões operacionais:
// o que o produto pode vir a suportar, não o que uma imobiliária específica
// tem conectado hoje (não existe Tenant Connection nesta base ainda).

export {
  CONNECTIONS_CATALOG,
  CONNECTION_GROUPS,
  CONNECTION_CAPABILITY_LABEL,
  CONNECTION_STATE_LABEL,
  CONNECTION_STATE_ROLE,
  connectionsByGroup,
} from "./catalog";
export {
  countActiveConnections,
  countAwaitingAuthorization,
  countNeedsAttention,
  countNotConfigured,
  formatConnectionQuantity,
  isPrimaryConnectionSummaryEntry,
  summarizeConnectionMetrics,
  topOperationalImpacts,
} from "./metrics";
export type {
  ConnectionCapabilityId,
  ConnectionCapabilityLabel,
  ConnectionCapabilityLink,
  ConnectionChannel,
  ConnectionEntry,
  ConnectionEvidence,
  ConnectionGroup,
  ConnectionGroupId,
  ConnectionPriority,
  ConnectionState,
} from "./types";
