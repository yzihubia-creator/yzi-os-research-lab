export const MCP_CAPABILITIES = [
  "social_accounts_read",
  "social_calendar_read",
  "social_content_read",
  "social_metrics_read",
  "social_content_create",
  "social_content_schedule",
  "social_content_publish",
  "social_publication_status_read",
  "image_generation",
  "video_generation",
  "generation_job_submit",
  "generation_job_status",
  "generation_output_read",
  "model_capabilities_read",
  "usage_limits_read",
] as const;

export type McpCapabilityKey = (typeof MCP_CAPABILITIES)[number];
export type McpConnectionKind = "metricool" | "higgsfield";
export type McpOwnerScope = "platform" | "tenant" | "operation";
export type McpAuthState =
  | "not_authorized"
  | "pending"
  | "authorized"
  | "expired"
  | "revoked"
  | "refresh_failed";
export type McpConnectionState =
  | "not_connected"
  | "awaiting_authorization"
  | "connecting"
  | "ready"
  | "needs_attention"
  | "unavailable"
  | "revoked";
export type McpHealthState = "unknown" | "healthy" | "degraded" | "unavailable";

export type JsonObject = Record<string, unknown>;

export type McpConnection = {
  id: string;
  ownerScope: McpOwnerScope;
  ownerId: string;
  connectionKind: McpConnectionKind;
  displayName: string;
  endpointKey: McpConnectionKind;
  authState: McpAuthState;
  connectionState: McpConnectionState;
  healthState: McpHealthState;
  grantedScopes: readonly string[];
  capabilitySnapshot: readonly McpCapabilityKey[];
  capabilitySnapshotVersion: number;
  authorizationReference: string | null;
  expiresAt: string | null;
  lastConnectedAt: string | null;
  lastDiscoveredAt: string | null;
  lastHealthCheckAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type McpConnectionEvent = {
  id: string;
  connectionId: string;
  eventType: string;
  status: "ok" | "blocked" | "error";
  safeMetadata: JsonObject;
  occurredAt: string;
};

export type McpToolDefinition = {
  name: string;
  description?: string;
  inputSchema: JsonObject;
  outputSchema?: JsonObject;
};

export type McpToolSnapshot = {
  id: string;
  connectionId: string;
  snapshotVersion: number;
  toolName: string;
  toolDescription: string;
  inputSchemaHash: string;
  outputSchemaHash: string | null;
  capabilityKey: McpCapabilityKey | null;
  discoveredAt: string;
  active: boolean;
};

export type McpApprovalPolicy = "never" | "writes" | "always";

export type McpConnectionBinding = {
  id: string;
  connectionId: string;
  tenantId: string;
  capabilityKey: McpCapabilityKey;
  status: "active" | "disabled";
  priority: number;
  monthlyLimit: number | null;
  approvalPolicy: McpApprovalPolicy;
  validFrom: string;
  validUntil: string | null;
};

export type McpExecutionRequest = {
  id: string;
  connectionId: string;
  tenantId: string;
  operation: McpOperation;
  capabilityKey: McpCapabilityKey;
  approvalState: "not_required" | "pending" | "approved" | "rejected";
  estimatedCost: number | null;
  idempotencyKey: string;
  status: "pending" | "running" | "completed" | "blocked" | "failed" | "cancelled";
  createdAt: string;
  completedAt: string | null;
  safeResult?: JsonObject;
};

export type McpExecutionEvent = {
  id: string;
  requestId: string;
  connectionId: string;
  tenantId: string;
  eventType: string;
  status: "ok" | "blocked" | "error";
  safeMetadata: JsonObject;
  occurredAt: string;
};

export type McpAuthorizationAttempt = {
  id: string;
  connectionId: string;
  stateHash: string;
  verifierReference: string;
  callbackUrl: string;
  status: "pending" | "consumed" | "expired" | "failed";
  createdAt: string;
  expiresAt: string;
  consumedAt: string | null;
};

export type McpAuthorizationGrant = {
  material: JsonObject;
  grantedScopes: readonly string[];
  expiresAt: string | null;
};

export type McpInitializeResult = {
  protocolVersion: string;
  serverInfo?: { name: string; version?: string };
  capabilities: JsonObject;
};

export type McpTransport = {
  initialize(signal?: AbortSignal): Promise<McpInitializeResult>;
  listTools(signal?: AbortSignal): Promise<readonly McpToolDefinition[]>;
  callTool(
    toolName: string,
    input: JsonObject,
    signal?: AbortSignal,
  ): Promise<JsonObject>;
  health(signal?: AbortSignal): Promise<boolean>;
  refresh?(signal?: AbortSignal): Promise<void>;
  revoke?(signal?: AbortSignal): Promise<void>;
  reconnect?(): Promise<void>;
  close?(): Promise<void>;
};

export type McpAuthorizationBroker = {
  buildAuthorizationUrl(input: {
    endpoint: string;
    state: string;
    codeChallenge: string;
    callbackUrl: string;
    scopes: readonly string[];
  }): Promise<string>;
  exchange(input: {
    endpoint: string;
    code: string;
    codeVerifier: string;
    callbackUrl: string;
  }): Promise<McpAuthorizationGrant>;
  refresh?(authorizationMaterial: JsonObject): Promise<McpAuthorizationGrant>;
  revoke?(authorizationMaterial: JsonObject): Promise<void>;
};

export type McpSecretVault = {
  put(kind: "pkce_verifier" | "authorization", value: JsonObject): Promise<string>;
  get(reference: string): Promise<JsonObject | null>;
  delete(reference: string): Promise<void>;
};

export type McpOperation =
  | "read_social_accounts"
  | "read_social_calendar"
  | "read_social_content"
  | "read_social_metrics"
  | "create_social_content"
  | "schedule_social_content"
  | "publish_social_content"
  | "read_publication_status"
  | "read_generation_models"
  | "read_usage_limits"
  | "prepare_image_job"
  | "prepare_video_job"
  | "submit_generation_job"
  | "read_generation_job"
  | "read_generation_output"
  | "cancel_generation_job";

export type McpOperationDefinition = {
  operation: McpOperation;
  capability: McpCapabilityKey;
  risk: "read" | "write" | "paid";
  toolAliases: readonly string[];
  requiredScopes: readonly string[];
  estimatedCost?: (input: JsonObject) => number | null;
};

export type McpAdapter = {
  readonly kind: McpConnectionKind;
  readonly endpointKey: McpConnectionKind;
  readonly authorizationScopes: readonly string[];
  mapCapability(tool: McpToolDefinition): McpCapabilityKey | null;
  operation(operation: McpOperation): McpOperationDefinition | null;
  validatePolicy(
    definition: McpOperationDefinition,
    input: JsonObject,
  ): { ok: true } | { ok: false; code: string };
  normalizeResult(operation: McpOperation, result: JsonObject): JsonObject;
};

export type McpRepository = {
  createConnection(connection: McpConnection): Promise<void>;
  updateConnection(
    id: string,
    patch: Partial<Omit<McpConnection, "id" | "createdAt">>,
  ): Promise<McpConnection>;
  getConnection(id: string): Promise<McpConnection | null>;
  listConnections(): Promise<readonly McpConnection[]>;
  appendConnectionEvent(event: McpConnectionEvent): Promise<void>;
  listConnectionEvents(connectionId: string): Promise<readonly McpConnectionEvent[]>;
  saveAuthorizationAttempt(attempt: McpAuthorizationAttempt): Promise<void>;
  getAuthorizationAttempt(id: string): Promise<McpAuthorizationAttempt | null>;
  updateAuthorizationAttempt(
    id: string,
    patch: Partial<McpAuthorizationAttempt>,
  ): Promise<McpAuthorizationAttempt>;
  replaceToolSnapshot(
    connectionId: string,
    version: number,
    snapshots: readonly McpToolSnapshot[],
  ): Promise<void>;
  listToolSnapshots(connectionId: string): Promise<readonly McpToolSnapshot[]>;
  saveBinding(binding: McpConnectionBinding): Promise<void>;
  listBindings(
    tenantId: string,
    capabilityKey: McpCapabilityKey,
  ): Promise<readonly McpConnectionBinding[]>;
  appendExecutionRequest(request: McpExecutionRequest): Promise<void>;
  updateExecutionRequest(
    id: string,
    patch: Partial<McpExecutionRequest>,
  ): Promise<McpExecutionRequest>;
  findExecutionByIdempotency(
    tenantId: string,
    key: string,
  ): Promise<McpExecutionRequest | null>;
  appendExecutionEvent(event: McpExecutionEvent): Promise<void>;
  listExecutionEvents(requestId: string): Promise<readonly McpExecutionEvent[]>;
  sumMonthlyCost(
    tenantId: string,
    connectionId: string,
    capability: McpCapabilityKey,
    at: Date,
  ): Promise<number>;
};

export class McpRuntimeError extends Error {
  readonly code:
    | "approval_required"
    | "authorization_expired"
    | "authorization_invalid"
    | "binding_missing"
    | "callback_invalid"
    | "capability_not_allowed"
    | "circuit_open"
    | "connection_unhealthy"
    | "cost_limit_reached"
    | "endpoint_not_allowed"
    | "input_schema_invalid"
    | "operation_not_allowed"
    | "rate_limited"
    | "response_too_large"
    | "state_invalid"
    | "state_replayed"
    | "timeout"
    | "tool_disabled"
    | "tool_not_discovered"
    | "transport_unavailable"
    | "upstream_error";
  readonly retryable: boolean;

  constructor(
    code: McpRuntimeError["code"],
    message: string = code,
    retryable = false,
  ) {
    super(message);
    this.name = "McpRuntimeError";
    this.code = code;
    this.retryable = retryable;
  }
}
