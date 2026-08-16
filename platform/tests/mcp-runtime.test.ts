import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  DeterministicFakeAuthorizationBroker,
  DeterministicFakeMcpTransport,
  InMemoryMcpRepository,
  InMemoryMcpSecretVault,
  MCP_ENDPOINT_CATALOG,
  McpConnectionRuntime,
  McpRuntimeError,
  RemoteHttpMcpTransport,
  UnavailableMcpTransport,
  createFakeCanvaTransport,
  createFakeHiggsfieldTransport,
  createFakeMetricoolTransport,
  type McpCapabilityKey,
  type McpConnection,
  type McpConnectionBinding,
  type McpConnectionKind,
} from "../src/lib/yzi-imob/mcp/index.ts";
import {
  CANVA_CONNECT_API_BASE,
  CANVA_CONNECT_AUTHORIZATION_ENDPOINT,
  CANVA_CONNECT_TOKEN_ENDPOINT,
  CanvaConnectOAuthBroker,
  CanvaConnectTransport,
} from "../src/lib/yzi-imob/mcp/canva-connect.ts";
import { parseTenantConnectionsRpcPayload } from "../src/lib/yzi-imob/connections/persisted-state.ts";

type Harness = ReturnType<typeof createHarness>;

function createHarness(options?: { timeoutMs?: number; executionMode?: "fake" | "real_readonly" }) {
  const repository = new InMemoryMcpRepository();
  const vault = new InMemoryMcpSecretVault();
  const metricoolBroker = new DeterministicFakeAuthorizationBroker();
  const higgsfieldBroker = new DeterministicFakeAuthorizationBroker();
  const canvaBroker = new DeterministicFakeAuthorizationBroker();
  const transports: Record<
    McpConnectionKind,
    DeterministicFakeMcpTransport
  > = {
    metricool: createFakeMetricoolTransport(),
    higgsfield: createFakeHiggsfieldTransport(),
    canva: createFakeCanvaTransport(),
  };
  const runtime = new McpConnectionRuntime({
    repository,
    secretVault: vault,
    authorizationBrokers: {
      metricool: metricoolBroker,
      higgsfield: higgsfieldBroker,
      canva: canvaBroker,
    },
    transportFactory: (connection) => transports[connection.connectionKind],
    allowedCallbackOrigins: ["https://app.example.test"],
    executionMode: options?.executionMode ?? "fake",
    timeoutMs: options?.timeoutMs ?? 100,
  });
  return {
    runtime,
    repository,
    vault,
    metricoolBroker,
    higgsfieldBroker,
    canvaBroker,
    transports,
  };
}

async function authorize(
  harness: Harness,
  kind: McpConnectionKind,
  ownerId = "owner-platform",
): Promise<McpConnection> {
  const connection = await harness.runtime.createConnection({
    ownerScope: "platform",
    ownerId,
    connectionKind: kind,
    displayName: "Conta autorizada sintética",
  });
  const callbackUrl = callbackFor(kind);
  const started = await harness.runtime.startAuthorization({
    connectionId: connection.id,
    callbackUrl,
  });
  const state = new URL(started.authorizationUrl).searchParams.get("state");
  assert.ok(state);
  return harness.runtime.completeAuthorization({
    connectionId: connection.id,
    state,
    code: "valid-code",
    callbackUrl,
  });
}

async function bind(
  harness: Harness,
  connectionId: string,
  capabilityKey: McpCapabilityKey,
  input?: Partial<McpConnectionBinding>,
): Promise<McpConnectionBinding> {
  const binding: McpConnectionBinding = {
    id: input?.id ?? `binding-${connectionId}-${capabilityKey}`,
    connectionId,
    tenantId: input?.tenantId ?? "tenant-ocm",
    capabilityKey,
    status: input?.status ?? "active",
    priority: input?.priority ?? 100,
    monthlyLimit: input?.monthlyLimit ?? 50,
    approvalPolicy: input?.approvalPolicy ?? "writes",
    validFrom: input?.validFrom ?? new Date(Date.now() - 1_000).toISOString(),
    validUntil: input?.validUntil ?? null,
  };
  await harness.runtime.saveBinding(binding);
  return binding;
}

function callbackFor(kind: McpConnectionKind): string {
  return `https://app.example.test${MCP_ENDPOINT_CATALOG[kind].callbackPath}`;
}

async function expectCode(
  promise: Promise<unknown>,
  code: McpRuntimeError["code"],
): Promise<void> {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof McpRuntimeError);
    assert.equal(error.code, code);
    return true;
  });
}

test("core negotiates initialize, tools/list and tools/call deterministically", async () => {
  const transport = createFakeMetricoolTransport();
  const initialized = await transport.initialize();
  assert.equal(initialized.protocolVersion, "2025-03-26");
  const tools = await transport.listTools();
  assert.ok(tools.some((tool) => tool.name === "brands_list"));
  const result = await transport.callTool("brands_list", {});
  assert.ok(Array.isArray(result.brands));
  await expectCode(transport.callTool("unknown_tool", {}), "tool_not_discovered");
});

test("core fails closed without transport and rejects an arbitrary endpoint key", async () => {
  const unavailable = new UnavailableMcpTransport();
  await expectCode(unavailable.initialize(), "transport_unavailable");
  assert.throws(
    () =>
      new RemoteHttpMcpTransport({
        endpointKey: "arbitrary" as McpConnectionKind,
        authorizationHeader: async () => "Bearer synthetic",
      }),
    (error: unknown) =>
      error instanceof McpRuntimeError && error.code === "endpoint_not_allowed",
  );
});

test("core honors cancellation and timeout", async () => {
  const transport = createFakeHiggsfieldTransport();
  transport.setDelay(50);
  const controller = new AbortController();
  const pending = transport.initialize(controller.signal);
  controller.abort();
  await expectCode(pending, "timeout");

  const harness = createHarness({ timeoutMs: 5 });
  harness.transports.metricool.setDelay(20);
  const connection = await harness.runtime.createConnection({
    ownerScope: "platform",
    ownerId: "owner",
    connectionKind: "metricool",
    displayName: "Synthetic",
  });
  const callbackUrl = callbackFor("metricool");
  const started = await harness.runtime.startAuthorization({
    connectionId: connection.id,
    callbackUrl,
  });
  const state = new URL(started.authorizationUrl).searchParams.get("state")!;
  await expectCode(
    harness.runtime.completeAuthorization({
      connectionId: connection.id,
      state,
      code: "valid-code",
      callbackUrl,
    }),
    "timeout",
  );
});

test("authorization requires allowlisted callback, one-time state and PKCE", async () => {
  const harness = createHarness();
  const connection = await harness.runtime.createConnection({
    ownerScope: "operation",
    ownerId: "operation-1",
    connectionKind: "metricool",
    displayName: "Synthetic",
  });
  await expectCode(
    harness.runtime.startAuthorization({
      connectionId: connection.id,
      callbackUrl: "https://evil.example/callback",
    }),
    "callback_invalid",
  );
  const callbackUrl = callbackFor("metricool");
  const started = await harness.runtime.startAuthorization({
    connectionId: connection.id,
    callbackUrl,
  });
  const url = new URL(started.authorizationUrl);
  const state = url.searchParams.get("state");
  assert.ok(state);
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  await expectCode(
    harness.runtime.completeAuthorization({
      connectionId: connection.id,
      state: "",
      code: "valid-code",
      callbackUrl,
    }),
    "state_invalid",
  );
  const authorized = await harness.runtime.completeAuthorization({
    connectionId: connection.id,
    state,
    code: "valid-code",
    callbackUrl,
  });
  assert.equal(authorized.authState, "authorized");
  assert.match(authorized.authorizationReference ?? "", /^vault:\/\/ref\//);
  assert.doesNotMatch(JSON.stringify({ started, authorized }), /fake-access-material|password/i);
  await expectCode(
    harness.runtime.completeAuthorization({
      connectionId: connection.id,
      state,
      code: "valid-code",
      callbackUrl,
    }),
    "state_replayed",
  );
});

test("Metricool authorization uses its dedicated callback route", () => {
  assert.equal(
    MCP_ENDPOINT_CATALOG.metricool.callbackPath,
    "/api/yzi-imob/connections/metricool/callback",
  );
});

test("Canva uses the official MCP endpoint and persists PKCE state without fixed capabilities", async () => {
  assert.deepEqual(MCP_ENDPOINT_CATALOG.canva, {
    endpoint: "https://mcp.canva.com/mcp",
    callbackPath: "/api/yzi-imob/connections/canva/callback",
  });
  const harness = createHarness();
  const connection = await harness.runtime.createConnection({
    ownerScope: "tenant",
    ownerId: "tenant-ocm",
    connectionKind: "canva",
    displayName: "Canva",
  });
  const callbackUrl = callbackFor("canva");
  const started = await harness.runtime.startAuthorization({
    connectionId: connection.id,
    callbackUrl,
  });
  const authorizationUrl = new URL(started.authorizationUrl);
  assert.equal(authorizationUrl.searchParams.get("code_challenge_method"), "S256");
  assert.equal(authorizationUrl.searchParams.get("redirect_uri"), callbackUrl);
  assert.equal(authorizationUrl.searchParams.get("scope"), "");
  const attempt = await harness.repository.getAuthorizationAttempt(started.attemptId);
  assert.equal(attempt?.status, "pending");
  assert.equal(attempt?.callbackUrl, callbackUrl);
  assert.match(attempt?.verifierReference ?? "", /^vault:\/\/ref\//);
  const verifierMaterial = await harness.vault.get(attempt?.verifierReference ?? "");
  assert.equal(typeof verifierMaterial?.verifier, "string");
  assert.ok((verifierMaterial?.verifier as string).length >= 43);

  const state = authorizationUrl.searchParams.get("state");
  assert.ok(state);
  const authorized = await harness.runtime.completeAuthorization({
    connectionId: connection.id,
    state,
    code: "valid-code",
    callbackUrl,
  });
  assert.equal(authorized.connectionKind, "canva");
  assert.deepEqual(authorized.capabilitySnapshot, []);
  assert.deepEqual(await harness.repository.listToolSnapshots(connection.id), []);
});

test("Canva connection-kind migration preserves the constrained provider domain", async () => {
  const migration = await readFile(
    new URL("../../supabase/migrations/20260815035008_yzi_imob_mcp_canva_connection_kind.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /connection_kind in \('metricool', 'higgsfield', 'canva'\)/);
  assert.match(migration, /endpoint_key = connection_kind/);
  assert.match(migration, /validate constraint yzi_imob_mcp_connections_kind_check_canva/);
  assert.match(migration, /rename constraint[\s\S]*to yzi_imob_mcp_connections_kind_check/);
  assert.doesNotMatch(migration, /drop constraint[^;]*;\s*commit;/i);
});

test("Canva production route uses the generic MCP broker and transport", async () => {
  const productionRuntime = await readFile(
    new URL("../src/lib/yzi-imob/mcp/production-runtime.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(productionRuntime, /canva-connect|CanvaConnect/);
  assert.match(productionRuntime, /canva:\s*broker/);
  assert.match(
    productionRuntime,
    /transportFactory:\s*\(connection\)\s*=>\s*new RemoteHttpMcpTransport/,
  );
  assert.match(productionRuntime, /process\.env\.NEXT_PUBLIC_APP_URL/);
  assert.match(
    productionRuntime,
    /new URL\(\s*"\/api\/yzi-imob\/connections\/canva\/callback",\s*readAppOrigin\(\)/,
  );
  assert.equal(
    new URL(
      MCP_ENDPOINT_CATALOG.canva.callbackPath,
      "https://yzios.com.br",
    ).toString(),
    "https://yzios.com.br/api/yzi-imob/connections/canva/callback",
  );
});

test("authorization expiry, refresh failure and revocation block execution", async () => {
  const harness = createHarness();
  const connection = await authorize(harness, "metricool");
  await bind(harness, connection.id, "social_accounts_read");
  await harness.repository.updateConnection(connection.id, {
    expiresAt: new Date(Date.now() - 1_000).toISOString(),
  });
  await expectCode(
    harness.runtime.execute({
      tenantId: "tenant-ocm",
      operation: "read_social_accounts",
      arguments: {},
      idempotencyKey: "expired-1",
    }),
    "authorization_expired",
  );

  await harness.repository.updateConnection(connection.id, {
    authState: "authorized",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    connectionState: "ready",
    healthState: "healthy",
    capabilitySnapshot: ["social_accounts_read"],
  });
  harness.metricoolBroker.refreshFails = true;
  await expectCode(harness.runtime.refresh(connection.id), "authorization_invalid");
  const failedRefresh = await harness.repository.getConnection(connection.id);
  assert.equal(failedRefresh?.authState, "refresh_failed");
  const revoked = await harness.runtime.revoke(connection.id);
  assert.equal(revoked.authState, "revoked");
  assert.deepEqual(revoked.capabilitySnapshot, []);
  await expectCode(
    harness.runtime.execute({
      tenantId: "tenant-ocm",
      operation: "read_social_accounts",
      arguments: {},
      idempotencyKey: "revoked-1",
    }),
    "authorization_invalid",
  );
});

test("discovery versions snapshots, preserves history and removes missing capabilities", async () => {
  const harness = createHarness();
  const connection = await authorize(harness, "metricool");
  assert.ok(connection.capabilitySnapshot.includes("social_metrics_read"));
  harness.transports.metricool = new DeterministicFakeMcpTransport({
    tools: [
      {
        name: "brands_list",
        inputSchema: { type: "object", properties: {} },
      },
    ],
    handlers: { brands_list: () => ({ brands: [] }) },
  });
  const capabilities = await harness.runtime.discover(connection.id);
  assert.deepEqual(capabilities, ["social_accounts_read"]);
  const snapshots = await harness.repository.listToolSnapshots(connection.id);
  assert.ok(snapshots.some((snapshot) => snapshot.snapshotVersion === 1 && !snapshot.active));
  assert.ok(snapshots.some((snapshot) => snapshot.snapshotVersion === 2 && snapshot.active));
  const events = await harness.repository.listConnectionEvents(connection.id);
  assert.equal(
    events.filter((event) => event.eventType === "discovery_completed").length,
    2,
  );
});

test("invalid schema and insufficient authorization do not enable capabilities", async () => {
  const harness = createHarness();
  const connection = await authorize(harness, "metricool");
  harness.transports.metricool = new DeterministicFakeMcpTransport({
    tools: [{ name: "brands_list", inputSchema: { type: "string" } }],
  });
  assert.deepEqual(await harness.runtime.discover(connection.id), []);

  harness.transports.metricool = createFakeMetricoolTransport();
  await harness.repository.updateConnection(connection.id, { grantedScopes: [] });
  assert.deepEqual(await harness.runtime.discover(connection.id), []);
});

test("platform-owned connection serves only explicitly bound tenant", async () => {
  const harness = createHarness();
  const connection = await authorize(harness, "metricool", "platform-yzihub");
  await bind(harness, connection.id, "social_accounts_read", {
    tenantId: "tenant-ocm",
  });
  const allowed = await harness.runtime.execute({
    tenantId: "tenant-ocm",
    operation: "read_social_accounts",
    arguments: {},
    idempotencyKey: "accounts-1",
  });
  assert.equal(allowed.connectionId, connection.id);
  await expectCode(
    harness.runtime.execute({
      tenantId: "tenant-other",
      operation: "read_social_accounts",
      arguments: {},
      idempotencyKey: "accounts-other",
    }),
    "binding_missing",
  );
});

test("binding priority is deterministic and an operation keeps its original connection", async () => {
  const harness = createHarness();
  const platformConnection = await authorize(harness, "metricool", "platform");
  await bind(harness, platformConnection.id, "social_accounts_read", {
    id: "binding-platform",
    priority: 10,
  });
  const first = await harness.runtime.execute({
    tenantId: "tenant-ocm",
    operation: "read_social_accounts",
    arguments: {},
    idempotencyKey: "binding-stable",
  });
  assert.equal(first.connectionId, platformConnection.id);

  const tenantConnection = await authorize(harness, "metricool", "tenant-ocm");
  await bind(harness, tenantConnection.id, "social_accounts_read", {
    id: "binding-tenant",
    priority: 100,
  });
  const second = await harness.runtime.execute({
    tenantId: "tenant-ocm",
    operation: "read_social_accounts",
    arguments: {},
    idempotencyKey: "binding-new",
  });
  assert.equal(second.connectionId, tenantConnection.id);
  const replay = await harness.runtime.execute({
    tenantId: "tenant-ocm",
    operation: "read_social_accounts",
    arguments: {},
    idempotencyKey: "binding-stable",
  });
  assert.equal(replay.connectionId, platformConnection.id);
  const events = await harness.repository.listConnectionEvents(tenantConnection.id);
  assert.ok(events.some((event) => event.eventType === "binding_changed"));
});

test("Metricool fake flow reads data and gates publication, assets and idempotency", async () => {
  const harness = createHarness();
  const connection = await authorize(harness, "metricool");
  await bind(harness, connection.id, "social_accounts_read");
  await bind(harness, connection.id, "social_calendar_read");
  await bind(harness, connection.id, "social_metrics_read");
  await bind(harness, connection.id, "social_content_publish");
  await bind(harness, connection.id, "social_publication_status_read");

  const accounts = await harness.runtime.execute({
    tenantId: "tenant-ocm",
    operation: "read_social_accounts",
    arguments: {},
    idempotencyKey: "metricool-accounts",
  });
  assert.ok(Array.isArray(accounts.result.brands));
  const calendar = await harness.runtime.execute({
    tenantId: "tenant-ocm",
    operation: "read_social_calendar",
    arguments: {},
    idempotencyKey: "metricool-calendar",
  });
  assert.deepEqual(calendar.result.entries, []);
  const metrics = await harness.runtime.execute({
    tenantId: "tenant-ocm",
    operation: "read_social_metrics",
    arguments: {},
    idempotencyKey: "metricool-metrics",
  });
  assert.ok(Array.isArray(metrics.result.metrics));
  await expectCode(
    harness.runtime.execute({
      tenantId: "tenant-ocm",
      operation: "read_publication_status",
      arguments: {},
      idempotencyKey: "publication-invalid-schema",
    }),
    "input_schema_invalid",
  );

  const governedArguments = {
    contentApproved: true,
    assetApproved: true,
    destinationId: "destination-safe-1",
    destinations: ["destination-safe-1", "destination-safe-2"],
  };
  await expectCode(
    harness.runtime.execute({
      tenantId: "tenant-ocm",
      operation: "publish_social_content",
      arguments: governedArguments,
      idempotencyKey: "publish-awaiting-approval",
      approvalState: "pending",
    }),
    "approval_required",
  );
  await expectCode(
    harness.runtime.execute({
      tenantId: "tenant-ocm",
      operation: "publish_social_content",
      arguments: { ...governedArguments, assetApproved: false },
      idempotencyKey: "publish-bad-asset",
      approvalState: "approved",
    }),
    "operation_not_allowed",
  );
  const published = await harness.runtime.execute({
    tenantId: "tenant-ocm",
    operation: "publish_social_content",
    arguments: governedArguments,
    idempotencyKey: "publish-fake-only",
    approvalState: "approved",
  });
  assert.equal(published.result.published, false);
  assert.equal((published.result.destinations as JsonObject[])[1]?.status, "failed");
  const callCount = harness.transports.metricool.calls.length;
  const replay = await harness.runtime.execute({
    tenantId: "tenant-ocm",
    operation: "publish_social_content",
    arguments: governedArguments,
    idempotencyKey: "publish-fake-only",
    approvalState: "approved",
  });
  assert.equal(replay.requestId, published.requestId);
  assert.equal(harness.transports.metricool.calls.length, callCount);
});

test("Higgsfield fake flow gates cost and approval, retries, cancels and marks output for review", async () => {
  const harness = createHarness();
  const connection = await authorize(harness, "higgsfield");
  await bind(harness, connection.id, "image_generation", {
    approvalPolicy: "always",
    monthlyLimit: 10,
  });
  await bind(harness, connection.id, "generation_job_status");
  await bind(harness, connection.id, "generation_output_read");
  const generationInput = {
    model: "image-model-allowlisted",
    promptReference: "prompt://tenant-ocm/approved/1",
    estimatedCost: 3,
    outputReviewRequired: true,
  };
  await expectCode(
    harness.runtime.execute({
      tenantId: "tenant-ocm",
      operation: "prepare_image_job",
      arguments: generationInput,
      idempotencyKey: "image-pending",
      approvalState: "pending",
      maxCost: 5,
    }),
    "approval_required",
  );
  await expectCode(
    harness.runtime.execute({
      tenantId: "tenant-ocm",
      operation: "prepare_image_job",
      arguments: generationInput,
      idempotencyKey: "image-cost-blocked",
      approvalState: "approved",
      maxCost: 2,
    }),
    "cost_limit_reached",
  );
  const prepared = await harness.runtime.execute({
    tenantId: "tenant-ocm",
    operation: "prepare_image_job",
    arguments: generationInput,
    idempotencyKey: "image-fake-prepared",
    approvalState: "approved",
    maxCost: 5,
  });
  assert.equal(prepared.result.state, "prepared");
  assert.equal(prepared.result.charged, false);
  await expectCode(
    harness.runtime.execute({
      tenantId: "tenant-ocm",
      operation: "prepare_image_job",
      arguments: { ...generationInput, estimatedCost: 8 },
      idempotencyKey: "image-monthly-limit",
      approvalState: "approved",
      maxCost: 10,
    }),
    "cost_limit_reached",
  );

  harness.transports.higgsfield.failCallOnce(
    new McpRuntimeError("upstream_error", "synthetic_retry", true),
  );
  const status = await harness.runtime.execute({
    tenantId: "tenant-ocm",
    operation: "read_generation_job",
    arguments: { jobId: "generation-job-fake-1" },
    idempotencyKey: "job-status-retry",
  });
  assert.equal(status.result.state, "completed");
  const retryEvents = await harness.repository.listExecutionEvents(status.requestId);
  assert.ok(retryEvents.some((event) => event.eventType === "execution_retry"));

  const output = await harness.runtime.execute({
    tenantId: "tenant-ocm",
    operation: "read_generation_output",
    arguments: { jobId: "generation-job-fake-1" },
    idempotencyKey: "job-output",
  });
  assert.equal(output.result.approved, false);
  assert.equal(output.result.reviewState, "pending_human_review");
  assert.ok(output.result.provenance);

  harness.transports.higgsfield.setCallDelay(50);
  const pending = harness.runtime.execute({
    tenantId: "tenant-ocm",
    operation: "read_generation_job",
    arguments: { jobId: "generation-job-fake-1" },
    idempotencyKey: "job-cancelled",
  });
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(
    await harness.runtime.cancelByIdempotency("tenant-ocm", "job-cancelled"),
    true,
  );
  await expectCode(pending, "timeout");
});

test("real readonly mode blocks publication and paid generation before a tool call", async () => {
  const harness = createHarness({ executionMode: "real_readonly" });
  const social = await authorize(harness, "metricool");
  await bind(harness, social.id, "social_content_publish");
  await expectCode(
    harness.runtime.execute({
      tenantId: "tenant-ocm",
      operation: "publish_social_content",
      arguments: {
        contentApproved: true,
        assetApproved: true,
        destinationId: "safe",
      },
      idempotencyKey: "real-publication-blocked",
      approvalState: "approved",
    }),
    "operation_not_allowed",
  );
  assert.equal(harness.transports.metricool.calls.length, 0);

  const creative = await authorize(harness, "higgsfield");
  await bind(harness, creative.id, "image_generation", {
    approvalPolicy: "always",
  });
  await expectCode(
    harness.runtime.execute({
      tenantId: "tenant-ocm",
      operation: "prepare_image_job",
      arguments: {
        model: "image-model-allowlisted",
        promptReference: "prompt://safe",
        estimatedCost: 1,
        outputReviewRequired: true,
      },
      idempotencyKey: "real-generation-blocked",
      approvalState: "approved",
    }),
    "operation_not_allowed",
  );
  assert.equal(harness.transports.higgsfield.calls.length, 0);
});

test("connection events are append-only safe metadata without sensitive payload", async () => {
  const harness = createHarness();
  const connection = await authorize(harness, "metricool");
  const events = await harness.repository.listConnectionEvents(connection.id);
  const serialized = JSON.stringify(events);
  assert.doesNotMatch(
    serialized,
    /fake-access-material|fake-refresh-material|valid-code|password/i,
  );
  assert.ok(events.length >= 3);
});

test("frontend exposes human states and capabilities without technical provider identity", async () => {
  const component = await readFile(
    new URL(
      "../src/components/yzi-imob/yzi-imob-connections-workspace.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  for (const status of [
    "Não conectado",
    "Aguardando autorização",
    "Conectando",
    "Ativo",
    "Precisa de atenção",
    "Autorização expirada",
    "Indisponível",
  ]) {
    assert.match(component, new RegExp(status));
  }
  assert.doesNotMatch(
    component,
    /Metricool|Higgsfield|\bMCP\b|OAuth|token|secret|tool_name|session ID/i,
  );
  assert.doesNotMatch(component, /type=["'](?:password|email)["']/i);

  const parsed = parseTenantConnectionsRpcPayload([
    {
      tenant_id: "tenant-ocm",
      connection_kind: "metricool",
      connection_state: "ready",
      auth_state: "authorized",
      health_state: "healthy",
      validated_at: "2026-07-30T12:00:00.000Z",
      capability_snapshot: [
        "social_content_publish",
        "social_calendar_read",
        "social_metrics_read",
      ],
    },
    {
      tenant_id: "tenant-ocm",
      connection_kind: "higgsfield",
      connection_state: "ready",
      auth_state: "authorized",
      health_state: "healthy",
      validated_at: "2026-07-30T12:00:00.000Z",
      capability_snapshot: ["image_generation", "video_generation"],
    },
  ]);
  assert.deepEqual(parsed[0]?.humanCapabilities, [
    "Publicação social",
    "Calendário de conteúdo",
    "Métricas sociais",
  ]);
  assert.deepEqual(parsed[1]?.humanCapabilities, [
    "Produção de imagens",
    "Produção de vídeos",
  ]);
});

type JsonObject = Record<string, unknown>;

test("Canva Connect broker builds official authorization URL without DCR", async () => {
  process.env.CANVA_CONNECT_CLIENT_ID = "OC-TEST-CLIENT";
  process.env.CANVA_CONNECT_CLIENT_SECRET = "test-secret";
  const requests: string[] = [];
  const broker = new CanvaConnectOAuthBroker({
    fetchImpl: (async (url: RequestInfo | URL) => {
      requests.push(String(url));
      return new Response("{}", { status: 500 });
    }) as typeof fetch,
  });
  const prepared = await broker.buildAuthorizationUrl({
    endpoint: MCP_ENDPOINT_CATALOG.canva.endpoint,
    state: "attempt-1.secret",
    codeChallenge: "challenge-value",
    callbackUrl: `https://app.example.test${MCP_ENDPOINT_CATALOG.canva.callbackPath}`,
    scopes: ["profile:read", "design:meta:read"],
  });
  assert.equal(requests.length, 0, "não deve registrar cliente dinamicamente");
  const url = new URL(prepared.authorizationUrl);
  assert.equal(url.origin + url.pathname, CANVA_CONNECT_AUTHORIZATION_ENDPOINT);
  assert.equal(url.searchParams.get("client_id"), "OC-TEST-CLIENT");
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(url.searchParams.get("code_challenge"), "challenge-value");
  assert.equal(url.searchParams.get("scope"), "profile:read design:meta:read");
  assert.equal(url.searchParams.get("state"), "attempt-1.secret");
});

test("Canva Connect broker exchanges and refreshes with Basic auth and rotation", async () => {
  process.env.CANVA_CONNECT_CLIENT_ID = "OC-TEST-CLIENT";
  process.env.CANVA_CONNECT_CLIENT_SECRET = "test-secret";
  const seen: Array<{ url: string; authorization: string | null; body: string }> = [];
  let call = 0;
  const broker = new CanvaConnectOAuthBroker({
    fetchImpl: (async (url: RequestInfo | URL, init?: RequestInit) => {
      call += 1;
      seen.push({
        url: String(url),
        authorization:
          (init?.headers as Record<string, string> | undefined)?.authorization ?? null,
        body: String(init?.body),
      });
      return new Response(
        JSON.stringify({
          access_token: `access-${call}`,
          refresh_token: `refresh-${call}`,
          expires_in: 3600,
          scope: "profile:read design:meta:read",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch,
  });
  const grant = await broker.exchange({
    endpoint: MCP_ENDPOINT_CATALOG.canva.endpoint,
    code: "auth-code",
    codeVerifier: "verifier-value",
    callbackUrl: `https://app.example.test${MCP_ENDPOINT_CATALOG.canva.callbackPath}`,
  });
  assert.equal(seen[0]?.url, CANVA_CONNECT_TOKEN_ENDPOINT);
  const expectedBasic = `Basic ${Buffer.from("OC-TEST-CLIENT:test-secret", "utf8").toString("base64")}`;
  assert.equal(seen[0]?.authorization, expectedBasic);
  assert.match(seen[0]?.body ?? "", /grant_type=authorization_code/);
  assert.match(seen[0]?.body ?? "", /code_verifier=verifier-value/);
  assert.equal(grant.material.accessToken, "access-1");
  assert.equal(grant.material.refreshToken, "refresh-1");
  assert.equal(grant.material.clientSecret, undefined, "segredo não vai ao Vault");
  assert.deepEqual(grant.grantedScopes, ["profile:read", "design:meta:read"]);
  assert.ok(grant.expiresAt);

  const refreshed = await broker.refresh(grant.material);
  assert.equal(seen[1]?.authorization, expectedBasic);
  assert.match(seen[1]?.body ?? "", /grant_type=refresh_token/);
  assert.match(seen[1]?.body ?? "", /refresh_token=refresh-1/);
  assert.equal(refreshed.material.accessToken, "access-2");
  assert.equal(refreshed.material.refreshToken, "refresh-2");
});

test("Canva Connect transport proves the token with GET /users/me and stays tool-less", async () => {
  const seen: Array<{ url: string; authorization: string | null }> = [];
  const transport = new CanvaConnectTransport({
    authorizationHeader: async () => "Bearer access-token",
    fetchImpl: (async (url: RequestInfo | URL, init?: RequestInit) => {
      seen.push({
        url: String(url),
        authorization:
          (init?.headers as Record<string, string> | undefined)?.authorization ?? null,
      });
      return new Response(
        JSON.stringify({ team_user: { user_id: "user-1", team_id: "team-1" } }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch,
  });
  const initialized = await transport.initialize();
  assert.equal(initialized.protocolVersion, "canva-connect-rest-v1");
  assert.equal(seen[0]?.url, `${CANVA_CONNECT_API_BASE}/users/me`);
  assert.equal(seen[0]?.authorization, "Bearer access-token");
  assert.deepEqual(await transport.listTools(), []);
  assert.equal(await transport.health(), true);
  await assert.rejects(transport.callTool(), (error: unknown) => {
    assert.ok(error instanceof McpRuntimeError);
    assert.equal(error.code, "operation_not_allowed");
    return true;
  });
});

test("Canva Connect transport maps 401 to authorization_expired on health", async () => {
  const transport = new CanvaConnectTransport({
    authorizationHeader: async () => "Bearer stale-token",
    fetchImpl: (async () => new Response("{}", { status: 401 })) as typeof fetch,
  });
  assert.equal(await transport.health(), false);
});
