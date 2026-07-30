import { MCP_ENDPOINT_CATALOG } from "./catalog.ts";
import type {
  JsonObject,
  McpConnectionKind,
  McpInitializeResult,
  McpToolDefinition,
  McpTransport,
} from "./types.ts";
import { McpRuntimeError } from "./types.ts";

type FetchLike = typeof fetch;

export type RemoteMcpTransportOptions = {
  endpointKey: McpConnectionKind;
  authorizationHeader: () => Promise<string | null>;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  maxResponseBytes?: number;
};

/**
 * Generic Streamable HTTP MCP client. The endpoint is selected exclusively by
 * endpointKey from the server catalog; callers cannot supply a URL or headers.
 */
export class RemoteHttpMcpTransport implements McpTransport {
  readonly #endpoint: string;
  readonly #authorizationHeader: () => Promise<string | null>;
  readonly #fetch: FetchLike;
  readonly #timeoutMs: number;
  readonly #maxResponseBytes: number;
  #sessionId: string | null = null;
  #requestId = 0;
  #initialized = false;

  constructor(options: RemoteMcpTransportOptions) {
    const catalogEntry = MCP_ENDPOINT_CATALOG[options.endpointKey];
    if (!catalogEntry) throw new McpRuntimeError("endpoint_not_allowed");
    this.#endpoint = catalogEntry.endpoint;
    this.#authorizationHeader = options.authorizationHeader;
    this.#fetch = options.fetchImpl ?? fetch;
    this.#timeoutMs = options.timeoutMs ?? 15_000;
    this.#maxResponseBytes = options.maxResponseBytes ?? 1_000_000;
  }

  async initialize(signal?: AbortSignal): Promise<McpInitializeResult> {
    const result = await this.#rpc(
      "initialize",
      {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "yzi-os", version: "1" },
      },
      signal,
    );
    const parsed = asRecord(result);
    if (
      typeof parsed.protocolVersion !== "string" ||
      !isRecord(parsed.capabilities)
    ) {
      throw new McpRuntimeError("upstream_error", "initialize_invalid");
    }
    await this.#notify("notifications/initialized", {}, signal);
    this.#initialized = true;
    return {
      protocolVersion: parsed.protocolVersion,
      capabilities: parsed.capabilities,
      serverInfo: isRecord(parsed.serverInfo)
        ? {
            name:
              typeof parsed.serverInfo.name === "string"
                ? parsed.serverInfo.name
                : "remote",
            version:
              typeof parsed.serverInfo.version === "string"
                ? parsed.serverInfo.version
                : undefined,
          }
        : undefined,
    };
  }

  async listTools(signal?: AbortSignal): Promise<readonly McpToolDefinition[]> {
    if (!this.#initialized) throw new McpRuntimeError("transport_unavailable");
    const result = asRecord(await this.#rpc("tools/list", {}, signal));
    if (!Array.isArray(result.tools)) {
      throw new McpRuntimeError("upstream_error", "tools_list_invalid");
    }
    return result.tools.map(parseToolDefinition);
  }

  async callTool(
    toolName: string,
    input: JsonObject,
    signal?: AbortSignal,
  ): Promise<JsonObject> {
    if (!this.#initialized) throw new McpRuntimeError("transport_unavailable");
    return asRecord(
      await this.#rpc("tools/call", { name: toolName, arguments: input }, signal),
    );
  }

  async health(signal?: AbortSignal): Promise<boolean> {
    try {
      if (!this.#initialized) await this.initialize(signal);
      await this.listTools(signal);
      return true;
    } catch {
      return false;
    }
  }

  async reconnect(): Promise<void> {
    this.#sessionId = null;
    this.#initialized = false;
  }

  async close(): Promise<void> {
    this.#sessionId = null;
    this.#initialized = false;
  }

  async #rpc(method: string, params: JsonObject, signal?: AbortSignal): Promise<unknown> {
    const id = ++this.#requestId;
    const response = await this.#request({ jsonrpc: "2.0", id, method, params }, signal);
    const payload = parseRpcPayload(response, id);
    if ("error" in payload && payload.error) {
      throw normalizeRemoteError(payload.error);
    }
    return payload.result;
  }

  async #notify(method: string, params: JsonObject, signal?: AbortSignal): Promise<void> {
    await this.#request({ jsonrpc: "2.0", method, params }, signal);
  }

  async #request(payload: JsonObject, signal?: AbortSignal): Promise<string> {
    const authorization = await this.#authorizationHeader();
    if (!authorization) throw new McpRuntimeError("authorization_invalid");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), this.#timeoutMs);
    const onAbort = () => controller.abort(signal?.reason);
    signal?.addEventListener("abort", onAbort, { once: true });
    try {
      const response = await this.#fetch(this.#endpoint, {
        method: "POST",
        headers: {
          accept: "application/json, text/event-stream",
          "content-type": "application/json",
          authorization,
          ...(this.#sessionId ? { "mcp-session-id": this.#sessionId } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        redirect: "error",
      });
      if (!response.ok) {
        throw new McpRuntimeError(
          "upstream_error",
          `remote_status_${response.status}`,
          response.status === 429 || response.status >= 500,
        );
      }
      const sessionId = response.headers.get("mcp-session-id");
      if (sessionId) this.#sessionId = sessionId.slice(0, 256);
      const contentLength = Number(response.headers.get("content-length"));
      if (Number.isFinite(contentLength) && contentLength > this.#maxResponseBytes) {
        throw new McpRuntimeError("response_too_large");
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength > this.#maxResponseBytes) {
        throw new McpRuntimeError("response_too_large");
      }
      return new TextDecoder().decode(bytes);
    } catch (error) {
      if (error instanceof McpRuntimeError) throw error;
      if (controller.signal.aborted) {
        throw new McpRuntimeError("timeout", "request_cancelled_or_timed_out", true);
      }
      throw new McpRuntimeError("upstream_error", "remote_transport_failed", true);
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onAbort);
    }
  }
}

export class UnavailableMcpTransport implements McpTransport {
  async initialize(): Promise<McpInitializeResult> {
    throw new McpRuntimeError("transport_unavailable");
  }
  async listTools(): Promise<readonly McpToolDefinition[]> {
    throw new McpRuntimeError("transport_unavailable");
  }
  async callTool(): Promise<JsonObject> {
    throw new McpRuntimeError("transport_unavailable");
  }
  async health(): Promise<boolean> {
    return false;
  }
}

export class DeterministicFakeMcpTransport implements McpTransport {
  readonly calls: Array<{ toolName: string; input: JsonObject }> = [];
  readonly #tools: readonly McpToolDefinition[];
  readonly #handlers: Readonly<Record<string, (input: JsonObject) => JsonObject>>;
  #initialized = false;
  #healthy = true;
  #delayMs = 0;
  #callDelayMs = 0;
  #failNext: McpRuntimeError | null = null;
  #failNextCall: McpRuntimeError | null = null;

  constructor(input: {
    tools: readonly McpToolDefinition[];
    handlers?: Readonly<Record<string, (input: JsonObject) => JsonObject>>;
  }) {
    this.#tools = input.tools;
    this.#handlers = input.handlers ?? {};
  }

  setHealthy(healthy: boolean): void {
    this.#healthy = healthy;
  }

  setDelay(delayMs: number): void {
    this.#delayMs = delayMs;
  }

  setCallDelay(delayMs: number): void {
    this.#callDelayMs = delayMs;
  }

  failOnce(error: McpRuntimeError): void {
    this.#failNext = error;
  }

  failCallOnce(error: McpRuntimeError): void {
    this.#failNextCall = error;
  }

  async initialize(signal?: AbortSignal): Promise<McpInitializeResult> {
    await this.#wait(signal);
    this.#takeFailure();
    this.#initialized = true;
    return {
      protocolVersion: "2025-03-26",
      capabilities: { tools: { listChanged: true } },
      serverInfo: { name: "deterministic-fake", version: "1" },
    };
  }

  async listTools(signal?: AbortSignal): Promise<readonly McpToolDefinition[]> {
    if (!this.#initialized) throw new McpRuntimeError("transport_unavailable");
    await this.#wait(signal);
    this.#takeFailure();
    return structuredClone(this.#tools);
  }

  async callTool(
    toolName: string,
    input: JsonObject,
    signal?: AbortSignal,
  ): Promise<JsonObject> {
    if (!this.#initialized) throw new McpRuntimeError("transport_unavailable");
    await this.#wait(signal, this.#callDelayMs || this.#delayMs);
    this.#takeFailure();
    const callFailure = this.#failNextCall;
    this.#failNextCall = null;
    if (callFailure) throw callFailure;
    const handler = this.#handlers[toolName];
    if (!handler) throw new McpRuntimeError("tool_not_discovered");
    this.calls.push({ toolName, input: structuredClone(input) });
    return structuredClone(handler(input));
  }

  async health(signal?: AbortSignal): Promise<boolean> {
    await this.#wait(signal);
    return this.#healthy;
  }

  async reconnect(): Promise<void> {
    this.#initialized = false;
  }

  async close(): Promise<void> {
    this.#initialized = false;
  }

  #takeFailure(): void {
    const error = this.#failNext;
    this.#failNext = null;
    if (error) throw error;
  }

  async #wait(signal?: AbortSignal, delayMs = this.#delayMs): Promise<void> {
    if (signal?.aborted) throw new McpRuntimeError("timeout", "cancelled", true);
    if (delayMs <= 0) return;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, delayMs);
      const abort = () => {
        clearTimeout(timer);
        reject(new McpRuntimeError("timeout", "cancelled", true));
      };
      signal?.addEventListener("abort", abort, { once: true });
    });
  }
}

export function isValidJsonSchema(schema: unknown): schema is JsonObject {
  if (!isRecord(schema)) return false;
  if (schema.type !== undefined && schema.type !== "object") return false;
  if (schema.properties !== undefined && !isRecord(schema.properties)) return false;
  if (
    schema.required !== undefined &&
    (!Array.isArray(schema.required) ||
      schema.required.some((item) => typeof item !== "string"))
  ) {
    return false;
  }
  return true;
}

export function validateInputSchema(
  schema: JsonObject,
  input: JsonObject,
): { valid: true } | { valid: false } {
  if (!isValidJsonSchema(schema)) return { valid: false };
  const required = Array.isArray(schema.required) ? schema.required : [];
  if (required.some((key) => !(key in input))) return { valid: false };
  if (!isRecord(schema.properties)) return { valid: true };
  for (const [key, value] of Object.entries(input)) {
    const rule = schema.properties[key];
    if (!isRecord(rule)) continue;
    if (
      typeof rule.type === "string" &&
      !matchesJsonType(value, rule.type)
    ) {
      return { valid: false };
    }
  }
  return { valid: true };
}

function matchesJsonType(value: unknown, type: string): boolean {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "integer":
      return typeof value === "number" && Number.isInteger(value);
    case "boolean":
      return typeof value === "boolean";
    case "array":
      return Array.isArray(value);
    case "object":
      return isRecord(value);
    case "null":
      return value === null;
    default:
      return false;
  }
}

function parseToolDefinition(value: unknown): McpToolDefinition {
  const record = asRecord(value);
  if (typeof record.name !== "string" || !isValidJsonSchema(record.inputSchema)) {
    throw new McpRuntimeError("upstream_error", "tool_schema_invalid");
  }
  return {
    name: record.name,
    description:
      typeof record.description === "string" ? record.description : undefined,
    inputSchema: record.inputSchema,
    outputSchema: isRecord(record.outputSchema) ? record.outputSchema : undefined,
  };
}

function parseRpcPayload(
  body: string,
  id: number,
): { result?: unknown; error?: unknown } {
  const lines = body
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim());
  const candidate = lines.length ? lines.at(-1) ?? "" : body;
  try {
    const parsed = JSON.parse(candidate) as unknown;
    const record = asRecord(parsed);
    if (record.jsonrpc !== "2.0" || record.id !== id) {
      throw new Error("rpc_correlation_invalid");
    }
    return record;
  } catch {
    throw new McpRuntimeError("upstream_error", "remote_response_invalid");
  }
}

function normalizeRemoteError(error: unknown): McpRuntimeError {
  const record = isRecord(error) ? error : {};
  const code = typeof record.code === "number" ? record.code : 0;
  return new McpRuntimeError(
    "upstream_error",
    code === -32602 ? "remote_input_rejected" : "remote_tool_failed",
    code === -32001 || code === -32002,
  );
}

function asRecord(value: unknown): JsonObject {
  if (!isRecord(value)) throw new McpRuntimeError("upstream_error", "object_expected");
  return value;
}

function isRecord(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
