import type {
  McpAuthorizationAttempt,
  McpCapabilityKey,
  McpConnection,
  McpConnectionBinding,
  McpConnectionEvent,
  McpExecutionEvent,
  McpExecutionRequest,
  McpRepository,
  McpToolSnapshot,
} from "./types.ts";

/**
 * Deterministic repository used by unit tests and local fake transports.
 * Production must provide a durable implementation with encrypted secret references;
 * this repository never receives authorization material itself.
 */
export class InMemoryMcpRepository implements McpRepository {
  readonly #connections = new Map<string, McpConnection>();
  readonly #connectionEvents: McpConnectionEvent[] = [];
  readonly #attempts = new Map<string, McpAuthorizationAttempt>();
  readonly #toolSnapshots: McpToolSnapshot[] = [];
  readonly #bindings = new Map<string, McpConnectionBinding>();
  readonly #requests = new Map<string, McpExecutionRequest>();
  readonly #executionEvents: McpExecutionEvent[] = [];

  async createConnection(connection: McpConnection): Promise<void> {
    if (this.#connections.has(connection.id)) throw new Error("connection_exists");
    this.#connections.set(connection.id, clone(connection));
  }

  async updateConnection(
    id: string,
    patch: Partial<Omit<McpConnection, "id" | "createdAt">>,
  ): Promise<McpConnection> {
    const current = this.#connections.get(id);
    if (!current) throw new Error("connection_not_found");
    const updated = { ...current, ...clone(patch), id, createdAt: current.createdAt };
    this.#connections.set(id, updated);
    return clone(updated);
  }

  async getConnection(id: string): Promise<McpConnection | null> {
    return clone(this.#connections.get(id) ?? null);
  }

  async listConnections(): Promise<readonly McpConnection[]> {
    return Array.from(this.#connections.values(), clone);
  }

  async appendConnectionEvent(event: McpConnectionEvent): Promise<void> {
    this.#connectionEvents.push(clone(event));
  }

  async listConnectionEvents(
    connectionId: string,
  ): Promise<readonly McpConnectionEvent[]> {
    return this.#connectionEvents
      .filter((event) => event.connectionId === connectionId)
      .map(clone);
  }

  async saveAuthorizationAttempt(attempt: McpAuthorizationAttempt): Promise<void> {
    this.#attempts.set(attempt.id, clone(attempt));
  }

  async getAuthorizationAttempt(id: string): Promise<McpAuthorizationAttempt | null> {
    return clone(this.#attempts.get(id) ?? null);
  }

  async updateAuthorizationAttempt(
    id: string,
    patch: Partial<McpAuthorizationAttempt>,
  ): Promise<McpAuthorizationAttempt> {
    const current = this.#attempts.get(id);
    if (!current) throw new Error("authorization_attempt_not_found");
    const updated = { ...current, ...clone(patch), id };
    this.#attempts.set(id, updated);
    return clone(updated);
  }

  async claimAuthorizationAttempt(
    id: string,
    consumedAt: string,
  ): Promise<McpAuthorizationAttempt | null> {
    // Sem `await` entre a leitura e a escrita: o claim é indivisível para as
    // execuções concorrentes que compartilham este repositório.
    const current = this.#attempts.get(id);
    if (!current || current.status !== "pending") return null;
    const claimed = { ...current, status: "consumed" as const, consumedAt };
    this.#attempts.set(id, claimed);
    return clone(claimed);
  }

  async replaceToolSnapshot(
    connectionId: string,
    version: number,
    snapshots: readonly McpToolSnapshot[],
  ): Promise<void> {
    for (let index = 0; index < this.#toolSnapshots.length; index += 1) {
      const snapshot = this.#toolSnapshots[index];
      if (snapshot.connectionId === connectionId && snapshot.active) {
        this.#toolSnapshots[index] = { ...snapshot, active: false };
      }
    }
    this.#toolSnapshots.push(
      ...snapshots.map((snapshot) => ({
        ...clone(snapshot),
        connectionId,
        snapshotVersion: version,
        active: true,
      })),
    );
  }

  async listToolSnapshots(connectionId: string): Promise<readonly McpToolSnapshot[]> {
    return this.#toolSnapshots
      .filter((snapshot) => snapshot.connectionId === connectionId)
      .map(clone);
  }

  async saveBinding(binding: McpConnectionBinding): Promise<void> {
    this.#bindings.set(binding.id, clone(binding));
  }

  async listBindings(
    tenantId: string,
    capabilityKey: McpCapabilityKey,
  ): Promise<readonly McpConnectionBinding[]> {
    return Array.from(this.#bindings.values())
      .filter(
        (binding) =>
          binding.tenantId === tenantId &&
          binding.capabilityKey === capabilityKey,
      )
      .map(clone);
  }

  async appendExecutionRequest(request: McpExecutionRequest): Promise<void> {
    if (this.#requests.has(request.id)) throw new Error("execution_request_exists");
    this.#requests.set(request.id, clone(request));
  }

  async updateExecutionRequest(
    id: string,
    patch: Partial<McpExecutionRequest>,
  ): Promise<McpExecutionRequest> {
    const current = this.#requests.get(id);
    if (!current) throw new Error("execution_request_not_found");
    const updated = {
      ...current,
      ...clone(patch),
      id,
      connectionId: current.connectionId,
      tenantId: current.tenantId,
      idempotencyKey: current.idempotencyKey,
    };
    this.#requests.set(id, updated);
    return clone(updated);
  }

  async findExecutionByIdempotency(
    tenantId: string,
    key: string,
  ): Promise<McpExecutionRequest | null> {
    return clone(
      Array.from(this.#requests.values()).find(
        (request) => request.tenantId === tenantId && request.idempotencyKey === key,
      ) ?? null,
    );
  }

  async appendExecutionEvent(event: McpExecutionEvent): Promise<void> {
    this.#executionEvents.push(clone(event));
  }

  async listExecutionEvents(requestId: string): Promise<readonly McpExecutionEvent[]> {
    return this.#executionEvents
      .filter((event) => event.requestId === requestId)
      .map(clone);
  }

  async sumMonthlyCost(
    tenantId: string,
    connectionId: string,
    capability: McpCapabilityKey,
    at: Date,
  ): Promise<number> {
    const month = at.toISOString().slice(0, 7);
    return Array.from(this.#requests.values())
      .filter(
        (request) =>
          request.tenantId === tenantId &&
          request.connectionId === connectionId &&
          request.capabilityKey === capability &&
          request.status === "completed" &&
          request.createdAt.startsWith(month),
      )
      .reduce((sum, request) => sum + (request.estimatedCost ?? 0), 0);
  }
}

export class InMemoryMcpSecretVault {
  readonly #values = new Map<string, Record<string, unknown>>();
  #sequence = 0;

  async put(
    _kind: "pkce_verifier" | "authorization",
    value: Record<string, unknown>,
  ): Promise<string> {
    const reference = `vault://ref/${++this.#sequence}`;
    this.#values.set(reference, clone(value));
    return reference;
  }

  async get(reference: string): Promise<Record<string, unknown> | null> {
    return clone(this.#values.get(reference) ?? null);
  }

  async delete(reference: string): Promise<void> {
    this.#values.delete(reference);
  }
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
