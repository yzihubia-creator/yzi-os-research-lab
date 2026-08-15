import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";

import {
  MCP_ADAPTERS,
  MCP_ENDPOINT_CATALOG,
} from "./catalog.ts";
import {
  isValidJsonSchema,
  validateInputSchema,
} from "./transport.ts";
import type {
  JsonObject,
  McpAdapter,
  McpAuthorizationBroker,
  McpAuthorizationGrant,
  McpCapabilityKey,
  McpConnection,
  McpConnectionBinding,
  McpConnectionKind,
  McpExecutionRequest,
  McpOperation,
  McpRepository,
  McpSecretVault,
  McpToolDefinition,
  McpToolSnapshot,
  McpTransport,
} from "./types.ts";
import { McpRuntimeError } from "./types.ts";

type Clock = () => Date;
type TransportFactory = (connection: McpConnection) => McpTransport;

export type McpRuntimeOptions = {
  repository: McpRepository;
  secretVault: McpSecretVault;
  authorizationBrokers: Readonly<Record<McpConnectionKind, McpAuthorizationBroker>>;
  transportFactory: TransportFactory;
  allowedCallbackOrigins: readonly string[];
  executionMode?: "fake" | "real_readonly";
  timeoutMs?: number;
  maxSafeResultBytes?: number;
  rateLimitPerMinute?: number;
  clock?: Clock;
};

export class McpConnectionRuntime {
  readonly #repository: McpRepository;
  readonly #secretVault: McpSecretVault;
  readonly #authorizationBrokers: Readonly<
    Record<McpConnectionKind, McpAuthorizationBroker>
  >;
  readonly #transportFactory: TransportFactory;
  readonly #allowedCallbackOrigins: ReadonlySet<string>;
  readonly #executionMode: "fake" | "real_readonly";
  readonly #timeoutMs: number;
  readonly #maxSafeResultBytes: number;
  readonly #rateLimitPerMinute: number;
  readonly #clock: Clock;
  readonly #controllers = new Map<string, AbortController>();
  readonly #rateWindows = new Map<string, number[]>();
  readonly #circuitFailures = new Map<string, number>();

  constructor(options: McpRuntimeOptions) {
    this.#repository = options.repository;
    this.#secretVault = options.secretVault;
    this.#authorizationBrokers = options.authorizationBrokers;
    this.#transportFactory = options.transportFactory;
    this.#allowedCallbackOrigins = new Set(options.allowedCallbackOrigins);
    this.#executionMode = options.executionMode ?? "real_readonly";
    this.#timeoutMs = options.timeoutMs ?? 15_000;
    this.#maxSafeResultBytes = options.maxSafeResultBytes ?? 500_000;
    this.#rateLimitPerMinute = options.rateLimitPerMinute ?? 30;
    this.#clock = options.clock ?? (() => new Date());
  }

  async createConnection(input: {
    ownerScope: McpConnection["ownerScope"];
    ownerId: string;
    connectionKind: McpConnectionKind;
    displayName: string;
  }): Promise<McpConnection> {
    if (!input.ownerId.trim()) throw new McpRuntimeError("authorization_invalid");
    const now = this.#now();
    const connection: McpConnection = {
      id: randomUUID(),
      ownerScope: input.ownerScope,
      ownerId: input.ownerId,
      connectionKind: input.connectionKind,
      displayName: input.displayName.slice(0, 120),
      endpointKey: input.connectionKind,
      authState: "not_authorized",
      connectionState: "not_connected",
      healthState: "unknown",
      grantedScopes: [],
      capabilitySnapshot: [],
      capabilitySnapshotVersion: 0,
      authorizationReference: null,
      expiresAt: null,
      lastConnectedAt: null,
      lastDiscoveredAt: null,
      lastHealthCheckAt: null,
      revokedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.#repository.createConnection(connection);
    await this.#connectionEvent(connection.id, "connection_created", "ok", {
      ownerScope: connection.ownerScope,
      connectionKind: connection.connectionKind,
    });
    return connection;
  }

  async startAuthorization(input: {
    connectionId: string;
    callbackUrl: string;
  }): Promise<{ attemptId: string; authorizationUrl: string; expiresAt: string }> {
    const connection = await this.#requiredConnection(input.connectionId);
    this.#assertCallback(connection.connectionKind, input.callbackUrl);

    const state = base64Url(randomBytes(32));
    const verifier = base64Url(randomBytes(48));
    const attemptId = randomUUID();
    const createdAt = this.#clock();
    const expiresAt = new Date(createdAt.getTime() + 10 * 60_000);
    const adapter = MCP_ADAPTERS[connection.connectionKind];
    const preparation =
      await this.#authorizationBrokers[connection.connectionKind].buildAuthorizationUrl({
        endpoint: MCP_ENDPOINT_CATALOG[adapter.endpointKey].endpoint,
        state: `${attemptId}.${state}`,
        codeChallenge: sha256Base64Url(verifier),
        callbackUrl: input.callbackUrl,
        scopes: adapter.authorizationScopes,
      });
    const authorizationUrl =
      typeof preparation === "string" ? preparation : preparation.authorizationUrl;
    assertExternalAuthorizationUrl(authorizationUrl);
    const verifierReference = await this.#secretVault.put("pkce_verifier", {
      verifier,
      ...(typeof preparation === "string"
        ? {}
        : { authorizationContext: preparation.exchangeContext }),
    });
    await this.#repository.saveAuthorizationAttempt({
      id: attemptId,
      connectionId: connection.id,
      stateHash: sha256(state),
      verifierReference,
      callbackUrl: input.callbackUrl,
      status: "pending",
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      consumedAt: null,
    });

    await this.#repository.updateConnection(connection.id, {
      authState: "pending",
      connectionState: "awaiting_authorization",
      updatedAt: this.#now(),
    });
    await this.#connectionEvent(connection.id, "authorization_started", "ok", {
      attemptId,
      pkce: true,
    });
    return {
      attemptId,
      authorizationUrl,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async completeAuthorization(input: {
    connectionId: string;
    state: string;
    code: string;
    callbackUrl: string;
  }): Promise<McpConnection> {
    const connection = await this.#requiredConnection(input.connectionId);
    this.#assertCallback(connection.connectionKind, input.callbackUrl);
    const [attemptId, stateSecret, extra] = input.state.split(".");
    if (!attemptId || !stateSecret || extra) throw new McpRuntimeError("state_invalid");
    const attempt = await this.#repository.getAuthorizationAttempt(attemptId);
    if (!attempt || attempt.connectionId !== connection.id) {
      throw new McpRuntimeError("state_invalid");
    }
    if (attempt.status === "consumed") throw new McpRuntimeError("state_replayed");
    if (attempt.status !== "pending" || attempt.callbackUrl !== input.callbackUrl) {
      throw new McpRuntimeError("state_invalid");
    }
    if (Date.parse(attempt.expiresAt) <= this.#clock().getTime()) {
      await this.#repository.updateAuthorizationAttempt(attempt.id, {
        status: "expired",
      });
      throw new McpRuntimeError("state_invalid");
    }
    if (!timingSafeHashMatch(attempt.stateHash, stateSecret)) {
      throw new McpRuntimeError("state_invalid");
    }
    if (!input.code || input.code.length > 4096) {
      throw new McpRuntimeError("authorization_invalid");
    }

    // Consume before exchange. A failed exchange cannot replay the same callback.
    await this.#repository.updateAuthorizationAttempt(attempt.id, {
      status: "consumed",
      consumedAt: this.#now(),
    });
    const verifierMaterial = await this.#secretVault.get(attempt.verifierReference);
    await this.#secretVault.delete(attempt.verifierReference);
    if (typeof verifierMaterial?.verifier !== "string") {
      throw new McpRuntimeError("authorization_invalid");
    }

    let grant: McpAuthorizationGrant;
    try {
      grant =
        await this.#authorizationBrokers[connection.connectionKind].exchange({
          endpoint: MCP_ENDPOINT_CATALOG[connection.endpointKey].endpoint,
          code: input.code,
          codeVerifier: verifierMaterial.verifier,
          callbackUrl: input.callbackUrl,
          authorizationContext:
            typeof verifierMaterial.authorizationContext === "object" &&
            verifierMaterial.authorizationContext !== null
              ? (verifierMaterial.authorizationContext as JsonObject)
              : undefined,
        });
    } catch {
      await this.#repository.updateConnection(connection.id, {
        authState: "not_authorized",
        connectionState: "needs_attention",
        healthState: "unknown",
        updatedAt: this.#now(),
      });
      await this.#connectionEvent(connection.id, "authorization_exchange", "error", {});
      throw new McpRuntimeError("authorization_invalid");
    }
    const authorizationReference = await this.#secretVault.put(
      "authorization",
      grant.material,
    );
    if (connection.authorizationReference) {
      await this.#secretVault.delete(connection.authorizationReference);
    }
    await this.#repository.updateConnection(connection.id, {
      authorizationReference,
      grantedScopes: [...grant.grantedScopes],
      expiresAt: grant.expiresAt,
      authState: "authorized",
      connectionState: "connecting",
      revokedAt: null,
      lastConnectedAt: this.#now(),
      updatedAt: this.#now(),
    });
    await this.#connectionEvent(connection.id, "authorization_completed", "ok", {
      scopesCount: grant.grantedScopes.length,
      expiresAt: grant.expiresAt,
    });
    await this.discover(connection.id);
    return this.#requiredConnection(connection.id);
  }

  async completeAuthorizationFromCallback(input: {
    state: string;
    code: string;
    callbackUrl: string;
  }): Promise<McpConnection> {
    const attemptId = input.state.split(".", 1)[0];
    if (!attemptId) throw new McpRuntimeError("state_invalid");
    const attempt = await this.#repository.getAuthorizationAttempt(attemptId);
    if (!attempt) throw new McpRuntimeError("state_invalid");
    return this.completeAuthorization({
      connectionId: attempt.connectionId,
      state: input.state,
      code: input.code,
      callbackUrl: input.callbackUrl,
    });
  }

  async discover(connectionId: string): Promise<readonly McpCapabilityKey[]> {
    const connection = await this.#requiredConnection(connectionId);
    this.#assertAuthorized(connection);
    const adapter = MCP_ADAPTERS[connection.connectionKind];
    const transport = this.#transportFactory(connection);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#timeoutMs);
    try {
      await transport.initialize(controller.signal);
      const tools = await transport.listTools(controller.signal);
      const healthy = await transport.health(controller.signal);
      const version = connection.capabilitySnapshotVersion + 1;
      const discoveredAt = this.#now();
      const snapshots = tools.map((tool) =>
        buildToolSnapshot(connection.id, version, tool, adapter, discoveredAt),
      );
      await this.#repository.replaceToolSnapshot(connection.id, version, snapshots);
      const capabilities = healthy
        ? deriveCapabilities(snapshots, adapter, connection.grantedScopes)
        : [];
      await this.#repository.updateConnection(connection.id, {
        capabilitySnapshot: capabilities,
        capabilitySnapshotVersion: version,
        healthState: healthy ? "healthy" : "degraded",
        connectionState: healthy ? "ready" : "needs_attention",
        lastDiscoveredAt: discoveredAt,
        lastHealthCheckAt: discoveredAt,
        updatedAt: discoveredAt,
      });
      await this.#connectionEvent(connection.id, "discovery_completed", "ok", {
        snapshotVersion: version,
        toolCount: tools.length,
        capabilityCount: capabilities.length,
        previousVersion: connection.capabilitySnapshotVersion,
      });
      return capabilities;
    } catch (error) {
      await this.#repository.updateConnection(connection.id, {
        healthState: "degraded",
        connectionState: "needs_attention",
        updatedAt: this.#now(),
      });
      await this.#connectionEvent(connection.id, "discovery_failed", "error", {
        code: normalizeError(error).code,
      });
      throw normalizeError(error);
    } finally {
      clearTimeout(timeout);
      await transport.close?.();
    }
  }

  async saveBinding(
    binding: McpConnectionBinding,
  ): Promise<void> {
    const connection = await this.#requiredConnection(binding.connectionId);
    if (!connection.capabilitySnapshot.includes(binding.capabilityKey)) {
      throw new McpRuntimeError("capability_not_allowed");
    }
    const existing = await this.#repository.listBindings(
      binding.tenantId,
      binding.capabilityKey,
    );
    await this.#repository.saveBinding(binding);
    await this.#connectionEvent(connection.id, "binding_changed", "ok", {
      tenantId: binding.tenantId,
      capabilityKey: binding.capabilityKey,
      previousConnectionIds: existing.map((item) => item.connectionId),
      priority: binding.priority,
    });
  }

  async health(connectionId: string): Promise<McpConnection> {
    const connection = await this.#requiredConnection(connectionId);
    this.#assertAuthorized(connection);
    const transport = this.#transportFactory(connection);
    const healthy = await withTimeout(
      (signal) => transport.health(signal),
      this.#timeoutMs,
    );
    const updated = await this.#repository.updateConnection(connection.id, {
      healthState: healthy ? "healthy" : "degraded",
      connectionState: healthy ? "ready" : "needs_attention",
      lastHealthCheckAt: this.#now(),
      capabilitySnapshot: healthy ? connection.capabilitySnapshot : [],
      updatedAt: this.#now(),
    });
    await this.#connectionEvent(connection.id, "health_checked", healthy ? "ok" : "error", {
      healthy,
    });
    return updated;
  }

  async refresh(connectionId: string): Promise<McpConnection> {
    const connection = await this.#requiredConnection(connectionId);
    this.#assertAuthorized(connection, true);
    const broker = this.#authorizationBrokers[connection.connectionKind];
    if (!broker.refresh || !connection.authorizationReference) {
      throw new McpRuntimeError("authorization_invalid");
    }
    const material = await this.#secretVault.get(connection.authorizationReference);
    if (!material) throw new McpRuntimeError("authorization_invalid");
    try {
      const grant = await broker.refresh(material);
      const newReference = await this.#secretVault.put("authorization", grant.material);
      await this.#secretVault.delete(connection.authorizationReference);
      return await this.#repository.updateConnection(connection.id, {
        authorizationReference: newReference,
        authState: "authorized",
        connectionState: "connecting",
        grantedScopes: [...grant.grantedScopes],
        expiresAt: grant.expiresAt,
        updatedAt: this.#now(),
      });
    } catch {
      await this.#repository.updateConnection(connection.id, {
        authState: "refresh_failed",
        connectionState: "needs_attention",
        healthState: "degraded",
        capabilitySnapshot: [],
        updatedAt: this.#now(),
      });
      await this.#connectionEvent(connection.id, "authorization_refresh", "error", {});
      throw new McpRuntimeError("authorization_invalid");
    }
  }

  async revoke(connectionId: string): Promise<McpConnection> {
    const connection = await this.#requiredConnection(connectionId);
    if (connection.authorizationReference) {
      const broker = this.#authorizationBrokers[connection.connectionKind];
      const material = await this.#secretVault.get(connection.authorizationReference);
      if (material && broker.revoke) {
        try {
          await broker.revoke(material);
        } catch {
          // Local revocation remains fail-closed even if the remote endpoint is unavailable.
        }
      }
      await this.#secretVault.delete(connection.authorizationReference);
    }
    const updated = await this.#repository.updateConnection(connection.id, {
      authorizationReference: null,
      authState: "revoked",
      connectionState: "revoked",
      healthState: "unavailable",
      capabilitySnapshot: [],
      revokedAt: this.#now(),
      updatedAt: this.#now(),
    });
    await this.#connectionEvent(connection.id, "connection_revoked", "ok", {});
    return updated;
  }

  async execute(input: {
    tenantId: string;
    operation: McpOperation;
    arguments: JsonObject;
    idempotencyKey: string;
    approvalState?: McpExecutionRequest["approvalState"];
    maxCost?: number | null;
  }): Promise<{ requestId: string; connectionId: string; result: JsonObject }> {
    if (!input.tenantId || !input.idempotencyKey) {
      throw new McpRuntimeError("binding_missing");
    }
    const previous = await this.#repository.findExecutionByIdempotency(
      input.tenantId,
      input.idempotencyKey,
    );
    if (previous) {
      if (previous.status === "completed" && previous.safeResult) {
        return {
          requestId: previous.id,
          connectionId: previous.connectionId,
          result: previous.safeResult,
        };
      }
      throw new McpRuntimeError("operation_not_allowed", "idempotency_in_progress");
    }

    const candidates = Object.values(MCP_ADAPTERS)
      .map((adapter) => ({ adapter, definition: adapter.operation(input.operation) }))
      .filter(
        (entry): entry is {
          adapter: McpAdapter;
          definition: NonNullable<ReturnType<McpAdapter["operation"]>>;
        } => Boolean(entry.definition),
      );
    if (candidates.length !== 1) throw new McpRuntimeError("operation_not_allowed");
    const { adapter, definition } = candidates[0];
    const binding = await this.#resolveBinding(
      input.tenantId,
      definition.capability,
      adapter.kind,
    );
    const connection = await this.#requiredConnection(binding.connectionId);
    this.#assertAuthorized(connection);
    if (
      connection.healthState !== "healthy" ||
      connection.connectionState !== "ready"
    ) {
      throw new McpRuntimeError("connection_unhealthy");
    }
    if (!connection.capabilitySnapshot.includes(definition.capability)) {
      throw new McpRuntimeError("capability_not_allowed");
    }
    const policy = adapter.validatePolicy(definition, input.arguments);
    if (!policy.ok) throw new McpRuntimeError("operation_not_allowed", policy.code);
    if (
      this.#executionMode === "real_readonly" &&
      definition.risk !== "read"
    ) {
      throw new McpRuntimeError("operation_not_allowed", "external_effect_disabled");
    }

    this.#consumeRateLimit(input.tenantId, definition.capability);
    if ((this.#circuitFailures.get(connection.id) ?? 0) >= 3) {
      throw new McpRuntimeError("circuit_open");
    }
    const estimatedCost = definition.estimatedCost?.(input.arguments) ?? null;
    const approvalState = input.approvalState ?? "pending";
    const approvalRequired =
      binding.approvalPolicy === "always" ||
      (binding.approvalPolicy === "writes" && definition.risk !== "read") ||
      definition.risk === "paid";
    const requestId = randomUUID();
    const request: McpExecutionRequest = {
      id: requestId,
      connectionId: connection.id,
      tenantId: input.tenantId,
      operation: input.operation,
      capabilityKey: definition.capability,
      approvalState: approvalRequired ? approvalState : "not_required",
      estimatedCost,
      idempotencyKey: input.idempotencyKey,
      status: "pending",
      createdAt: this.#now(),
      completedAt: null,
    };
    await this.#repository.appendExecutionRequest(request);
    if (approvalRequired && approvalState !== "approved") {
      await this.#blockRequest(request, "approval_required");
      throw new McpRuntimeError("approval_required");
    }
    if (
      estimatedCost === null &&
      definition.risk === "paid"
    ) {
      await this.#blockRequest(request, "cost_unknown");
      throw new McpRuntimeError("cost_limit_reached", "cost_unknown");
    }
    if (input.maxCost != null && estimatedCost != null && estimatedCost > input.maxCost) {
      await this.#blockRequest(request, "cost_limit_reached");
      throw new McpRuntimeError("cost_limit_reached");
    }
    if (binding.monthlyLimit != null) {
      const used = await this.#repository.sumMonthlyCost(
        input.tenantId,
        connection.id,
        definition.capability,
        this.#clock(),
      );
      if (estimatedCost != null && used + estimatedCost > binding.monthlyLimit) {
        await this.#blockRequest(request, "monthly_limit_reached");
        throw new McpRuntimeError("cost_limit_reached");
      }
    }

    const snapshots = await this.#repository.listToolSnapshots(connection.id);
    const tool = resolveTool(snapshots, definition.toolAliases);
    if (!tool) {
      await this.#blockRequest(request, "tool_not_discovered");
      throw new McpRuntimeError("tool_not_discovered");
    }
    const definitionSnapshot = await this.#toolDefinitionFromTransport(
      connection,
      tool.toolName,
    );
    if (!validateInputSchema(definitionSnapshot.inputSchema, input.arguments).valid) {
      await this.#blockRequest(request, "input_schema_invalid");
      throw new McpRuntimeError("input_schema_invalid");
    }

    const transport = this.#transportFactory(connection);
    const controller = new AbortController();
    this.#controllers.set(requestId, controller);
    await this.#repository.updateExecutionRequest(requestId, { status: "running" });
    await this.#executionEvent(request, "execution_started", "ok", {
      requestId,
      capability: definition.capability,
    });
    try {
      await transport.initialize(controller.signal);
      let raw: JsonObject | null = null;
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          raw = await withTimeout(
            (timeoutSignal) => {
              const combined = combineSignals(controller.signal, timeoutSignal);
              return transport.callTool(
                tool.toolName,
                input.arguments,
                combined,
              );
            },
            this.#timeoutMs,
          );
          break;
        } catch (error) {
          const normalized = normalizeError(error);
          if (!normalized.retryable || attempt === 2 || controller.signal.aborted) {
            throw normalized;
          }
          await this.#executionEvent(request, "execution_retry", "ok", {
            attempt,
            code: normalized.code,
          });
          await transport.reconnect?.();
          await transport.initialize(controller.signal);
        }
      }
      if (!raw) throw new McpRuntimeError("upstream_error");
      if (
        definitionSnapshot.outputSchema &&
        !validateInputSchema(definitionSnapshot.outputSchema, raw).valid
      ) {
        throw new McpRuntimeError("upstream_error", "output_schema_invalid");
      }
      const result = adapter.normalizeResult(input.operation, raw);
      if (byteSize(result) > this.#maxSafeResultBytes) {
        throw new McpRuntimeError("response_too_large");
      }
      await this.#repository.updateExecutionRequest(requestId, {
        status: "completed",
        completedAt: this.#now(),
        safeResult: result,
      });
      await this.#executionEvent(request, "execution_completed", "ok", {
        resultKeys: Object.keys(result).slice(0, 30),
        estimatedCost,
      });
      this.#circuitFailures.set(connection.id, 0);
      return { requestId, connectionId: connection.id, result };
    } catch (error) {
      const normalized = normalizeError(error);
      const status = controller.signal.aborted ? "cancelled" : "failed";
      await this.#repository.updateExecutionRequest(requestId, {
        status,
        completedAt: this.#now(),
      });
      await this.#executionEvent(request, "execution_failed", "error", {
        code: normalized.code,
        retryable: normalized.retryable,
      });
      this.#circuitFailures.set(
        connection.id,
        (this.#circuitFailures.get(connection.id) ?? 0) + 1,
      );
      throw normalized;
    } finally {
      this.#controllers.delete(requestId);
      await transport.close?.();
    }
  }

  cancel(requestId: string): boolean {
    const controller = this.#controllers.get(requestId);
    if (!controller) return false;
    controller.abort("cancelled");
    return true;
  }

  async cancelByIdempotency(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<boolean> {
    const request = await this.#repository.findExecutionByIdempotency(
      tenantId,
      idempotencyKey,
    );
    return request ? this.cancel(request.id) : false;
  }

  async #toolDefinitionFromTransport(
    connection: McpConnection,
    toolName: string,
  ): Promise<McpToolDefinition> {
    const transport = this.#transportFactory(connection);
    try {
      await withTimeout((signal) => transport.initialize(signal), this.#timeoutMs);
      const tools = await withTimeout(
        (signal) => transport.listTools(signal),
        this.#timeoutMs,
      );
      const tool = tools.find((item) => item.name === toolName);
      if (!tool) throw new McpRuntimeError("tool_not_discovered");
      if (!isValidJsonSchema(tool.inputSchema)) {
        throw new McpRuntimeError("input_schema_invalid");
      }
      return tool;
    } finally {
      await transport.close?.();
    }
  }

  async #resolveBinding(
    tenantId: string,
    capability: McpCapabilityKey,
    kind: McpConnectionKind,
  ): Promise<McpConnectionBinding> {
    const now = this.#clock().getTime();
    const bindings = await this.#repository.listBindings(tenantId, capability);
    const eligible: McpConnectionBinding[] = [];
    for (const binding of bindings) {
      if (
        binding.status !== "active" ||
        Date.parse(binding.validFrom) > now ||
        (binding.validUntil !== null && Date.parse(binding.validUntil) <= now)
      ) {
        continue;
      }
      const connection = await this.#repository.getConnection(binding.connectionId);
      if (connection?.connectionKind === kind) eligible.push(binding);
    }
    eligible.sort(
      (left, right) =>
        right.priority - left.priority || left.id.localeCompare(right.id),
    );
    if (!eligible[0]) throw new McpRuntimeError("binding_missing");
    return eligible[0];
  }

  #assertAuthorized(connection: McpConnection, allowExpired = false): void {
    if (
      !connection.authorizationReference ||
      !["authorized", ...(allowExpired ? ["expired"] as const : [])].includes(
        connection.authState as "authorized",
      )
    ) {
      throw new McpRuntimeError("authorization_invalid");
    }
    if (
      !allowExpired &&
      connection.expiresAt !== null &&
      Date.parse(connection.expiresAt) <= this.#clock().getTime()
    ) {
      void this.#repository.updateConnection(connection.id, {
        authState: "expired",
        connectionState: "needs_attention",
        healthState: "degraded",
        capabilitySnapshot: [],
        updatedAt: this.#now(),
      });
      throw new McpRuntimeError("authorization_expired");
    }
  }

  #assertCallback(kind: McpConnectionKind, callbackUrl: string): void {
    let parsed: URL;
    try {
      parsed = new URL(callbackUrl);
    } catch {
      throw new McpRuntimeError("callback_invalid");
    }
    if (
      !this.#allowedCallbackOrigins.has(parsed.origin) ||
      parsed.pathname !== MCP_ENDPOINT_CATALOG[kind].callbackPath ||
      parsed.search ||
      parsed.hash
    ) {
      throw new McpRuntimeError("callback_invalid");
    }
  }

  #consumeRateLimit(tenantId: string, capability: McpCapabilityKey): void {
    const key = `${tenantId}:${capability}`;
    const now = this.#clock().getTime();
    const current = (this.#rateWindows.get(key) ?? []).filter(
      (timestamp) => timestamp > now - 60_000,
    );
    if (current.length >= this.#rateLimitPerMinute) {
      throw new McpRuntimeError("rate_limited", "internal_rate_limit", true);
    }
    current.push(now);
    this.#rateWindows.set(key, current);
  }

  async #blockRequest(request: McpExecutionRequest, code: string): Promise<void> {
    await this.#repository.updateExecutionRequest(request.id, {
      status: "blocked",
      completedAt: this.#now(),
    });
    await this.#executionEvent(request, "execution_blocked", "blocked", { code });
  }

  async #requiredConnection(id: string): Promise<McpConnection> {
    const connection = await this.#repository.getConnection(id);
    if (!connection) throw new McpRuntimeError("authorization_invalid");
    return connection;
  }

  async #connectionEvent(
    connectionId: string,
    eventType: string,
    status: "ok" | "blocked" | "error",
    metadata: JsonObject,
  ): Promise<void> {
    await this.#repository.appendConnectionEvent({
      id: randomUUID(),
      connectionId,
      eventType,
      status,
      safeMetadata: sanitizeMetadata(metadata),
      occurredAt: this.#now(),
    });
  }

  async #executionEvent(
    request: McpExecutionRequest,
    eventType: string,
    status: "ok" | "blocked" | "error",
    metadata: JsonObject,
  ): Promise<void> {
    await this.#repository.appendExecutionEvent({
      id: randomUUID(),
      requestId: request.id,
      connectionId: request.connectionId,
      tenantId: request.tenantId,
      eventType,
      status,
      safeMetadata: sanitizeMetadata(metadata),
      occurredAt: this.#now(),
    });
  }

  #now(): string {
    return this.#clock().toISOString();
  }
}

export class DeterministicFakeAuthorizationBroker implements McpAuthorizationBroker {
  exchangeCount = 0;
  refreshFails = false;
  readonly authorizationOrigin: string;

  constructor(authorizationOrigin = "https://authorization.invalid") {
    this.authorizationOrigin = authorizationOrigin;
  }

  async buildAuthorizationUrl(input: {
    state: string;
    codeChallenge: string;
    callbackUrl: string;
    scopes: readonly string[];
  }): Promise<string> {
    const url = new URL("/authorize", this.authorizationOrigin);
    url.searchParams.set("state", input.state);
    url.searchParams.set("code_challenge", input.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("redirect_uri", input.callbackUrl);
    url.searchParams.set("scope", input.scopes.join(" "));
    return url.toString();
  }

  async exchange(input: {
    code: string;
    codeVerifier: string;
  }): Promise<McpAuthorizationGrant> {
    this.exchangeCount += 1;
    if (input.code !== "valid-code" || input.codeVerifier.length < 43) {
      throw new Error("exchange_rejected");
    }
    return {
      material: {
        accessToken: "fake-access-material",
        refreshToken: "fake-refresh-material",
      },
      grantedScopes: ["read", "analytics", "write", "publish", "generate", "mcp:read", "mcp:write", "openid", "email", "offline_access"],
      expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    };
  }

  async refresh(): Promise<McpAuthorizationGrant> {
    if (this.refreshFails) throw new Error("refresh_failed");
    return {
      material: { accessToken: "fake-refreshed-material" },
      grantedScopes: ["read", "analytics", "write", "publish", "generate", "mcp:read", "mcp:write", "openid", "email", "offline_access"],
      expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    };
  }

  async revoke(): Promise<void> {}
}

function buildToolSnapshot(
  connectionId: string,
  version: number,
  tool: McpToolDefinition,
  adapter: McpAdapter,
  discoveredAt: string,
): McpToolSnapshot {
  const valid = isValidJsonSchema(tool.inputSchema);
  return {
    id: randomUUID(),
    connectionId,
    snapshotVersion: version,
    toolName: tool.name,
    toolDescription: (tool.description ?? "").slice(0, 500),
    inputSchemaHash: sha256(stableJson(tool.inputSchema)),
    outputSchemaHash: tool.outputSchema ? sha256(stableJson(tool.outputSchema)) : null,
    capabilityKey: valid ? adapter.mapCapability(tool) : null,
    discoveredAt,
    active: true,
  };
}

function deriveCapabilities(
  snapshots: readonly McpToolSnapshot[],
  adapter: McpAdapter,
  grantedScopes: readonly string[],
): McpCapabilityKey[] {
  const granted = new Set(grantedScopes);
  return Array.from(
    new Set(
      snapshots.flatMap((snapshot) => {
        if (!snapshot.active || !snapshot.capabilityKey) return [];
        const operations = [
          "read_social_accounts",
          "read_social_calendar",
          "read_social_content",
          "read_social_metrics",
          "create_social_content",
          "schedule_social_content",
          "publish_social_content",
          "read_publication_status",
          "read_generation_models",
          "read_usage_limits",
          "prepare_image_job",
          "prepare_video_job",
          "submit_generation_job",
          "read_generation_job",
          "read_generation_output",
          "cancel_generation_job",
        ] as const;
        const relevant = operations
          .map((operation) => adapter.operation(operation))
          .filter(
            (definition) => definition?.capability === snapshot.capabilityKey,
          );
        return relevant.some(
          (definition) =>
            definition &&
            definition.requiredScopes.every((scope) => granted.has(scope)),
        )
          ? [snapshot.capabilityKey]
          : [];
      }),
    ),
  );
}

function resolveTool(
  snapshots: readonly McpToolSnapshot[],
  aliases: readonly string[],
): McpToolSnapshot | null {
  const active = snapshots.filter((snapshot) => snapshot.active && snapshot.capabilityKey);
  for (const alias of aliases) {
    const exact = active.find(
      (snapshot) => normalizeToolName(snapshot.toolName) === alias,
    );
    if (exact) return exact;
  }
  return null;
}

function assertExternalAuthorizationUrl(value: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new McpRuntimeError("authorization_invalid");
  }
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new McpRuntimeError("authorization_invalid");
  }
}

async function withTimeout<T>(
  callback: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);
  try {
    return await callback(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new McpRuntimeError("timeout", "operation_timed_out", true);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function combineSignals(left: AbortSignal, right: AbortSignal): AbortSignal {
  if (left.aborted) return left;
  if (right.aborted) return right;
  const controller = new AbortController();
  const abort = (event: Event) =>
    controller.abort((event.target as AbortSignal).reason);
  left.addEventListener("abort", abort, { once: true });
  right.addEventListener("abort", abort, { once: true });
  return controller.signal;
}

function sanitizeMetadata(value: JsonObject): JsonObject {
  const forbidden = /token|secret|authorization|cookie|password|credential|payload|body|session/i;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !forbidden.test(key))
      .slice(0, 50)
      .map(([key, item]) => [key, sanitizeMetadataValue(item, forbidden)]),
  );
}

function sanitizeMetadataValue(value: unknown, forbidden: RegExp): unknown {
  if (typeof value === "string") return value.slice(0, 240);
  if (typeof value === "number" || typeof value === "boolean" || value === null) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeMetadataValue(item, forbidden));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !forbidden.test(key))
        .slice(0, 30)
        .map(([key, item]) => [key, sanitizeMetadataValue(item, forbidden)]),
    );
  }
  return undefined;
}

function timingSafeHashMatch(expectedHash: string, value: string): boolean {
  const expected = Buffer.from(expectedHash, "hex");
  const received = Buffer.from(sha256(value), "hex");
  return (
    expected.byteLength === received.byteLength &&
    timingSafeEqual(expected, received)
  );
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function sha256Base64Url(value: string): string {
  return createHash("sha256").update(value).digest("base64url");
}

function base64Url(value: Uint8Array): string {
  return Buffer.from(value).toString("base64url");
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function normalizeToolName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function normalizeError(error: unknown): McpRuntimeError {
  return error instanceof McpRuntimeError
    ? error
    : new McpRuntimeError("upstream_error", "runtime_failure");
}

function byteSize(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}
