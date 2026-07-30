// YZI IMOB — Conexões (barrel). Catálogo estático de conexões operacionais:
// o que o produto suporta e o estado seguro resolvido pelo backend.

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
export {
  buildConnectionsLoadFailure,
  buildConnectionsViewModelFromRpcPayload,
  deriveConnectionTruth,
} from "./view-model";
export {
  CONNECTION_CATEGORY_VALUES,
  CONNECTION_HUMAN_STATUS_VALUES,
} from "./public-view-model";
export type {
  ConnectionCapabilityTruth,
  ConnectionCategory,
  ConnectionHumanStatus,
  ConnectionsViewModel,
  ConnectionViewModelItem,
} from "./public-view-model";
