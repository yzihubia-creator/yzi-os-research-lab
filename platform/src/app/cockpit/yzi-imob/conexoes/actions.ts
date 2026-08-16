"use server";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { revalidatePath } from "next/cache";
import {
  startMetaOAuthAuthorization,
  type MetaOAuthEntryCatalogId,
  type StartMetaOAuthResult,
} from "@/lib/yzi-imob/connections/meta-oauth-start";
import type {
  ConnectionCommand,
  McpConnectionActionResult,
  MetricoolAccountDiscoveryResult,
  MetricoolConnectionActionResult,
} from "./action-types";

export async function startMetaOAuthAuthorizationAction(
  catalogId: MetaOAuthEntryCatalogId,
): Promise<StartMetaOAuthResult> {
  const tenantContext = await getTenantContext();
  if (tenantContext.status !== "tenant_found") {
    return {
      status: "forbidden",
      message: "A sessão atual não pode iniciar esta configuração.",
    };
  }
  const supabase = await createServerSupabaseClient();
  return startMetaOAuthAuthorization(supabase, {
    tenantId: tenantContext.tenant.id,
    catalogId,
  });
}

export async function startMetricoolMcpAuthorizationAction(): Promise<MetricoolConnectionActionResult> {
  if (process.env.NODE_ENV !== "production") {
    console.info("[Metricool MCP environment]", {
      mcpDatabaseUrlPresent: Boolean(process.env.YZI_IMOB_MCP_DATABASE_URL?.trim()),
    });
  }
  const tenantContext = await getTenantContext();
  if (
    tenantContext.status !== "tenant_found" ||
    !["owner", "admin"].includes(tenantContext.role)
  ) {
    return { status: "error", code: "access_denied" };
  }

  let checkpoint = "connection_lookup";
  try {
    const [{ PostgresMcpRepository }, { createProductionMcpRuntime, readMetricoolMcpCallbackUrl }] =
      await Promise.all([
        import("@/lib/yzi-imob/mcp/postgres-repository"),
        import("@/lib/yzi-imob/mcp/production-runtime"),
      ]);
    const repository = new PostgresMcpRepository();
    const existing = (await repository.listConnections()).find((connection) =>
      connection.ownerScope === "tenant" &&
      connection.ownerId === tenantContext.tenant.id &&
      connection.connectionKind === "metricool" &&
      connection.connectionState !== "revoked"
    );
    checkpoint = "connection_selected";
    const runtime = createProductionMcpRuntime();
    const connection = existing ?? await runtime.createConnection({
      ownerScope: "tenant",
      ownerId: tenantContext.tenant.id,
      connectionKind: "metricool",
      displayName: "Metricool",
    });
    checkpoint = "authorization_start";
    const authorization = await runtime.startAuthorization({
      connectionId: connection.id,
      callbackUrl: readMetricoolMcpCallbackUrl(),
    });
    checkpoint = "action_return_ok";
    if (process.env.NODE_ENV !== "production") {
      console.info("[Metricool MCP authorization]", {
        checkpoint,
        reusedExistingConnection: Boolean(existing),
      });
    }
    return {
      status: "ok",
      connectionStatus: "awaiting_authorization",
      authorizationUrl: authorization.authorizationUrl,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Metricool MCP authorization failed]", {
        checkpoint,
        name: error instanceof Error ? error.name : "Unknown",
        sqlstate: sanitizeSqlState(error),
        message: sanitizeMetricoolAuthorizationError(error),
      });
    }
    return { status: "error", code: "operation_failed" };
  }
}

export async function startCanvaMcpAuthorizationAction(): Promise<McpConnectionActionResult> {
  const tenantContext = await getTenantContext();
  if (
    tenantContext.status !== "tenant_found" ||
    !["owner", "admin"].includes(tenantContext.role)
  ) {
    return { status: "error", code: "access_denied" };
  }

  let checkpoint = "connection_lookup";
  try {
    const [{ PostgresMcpRepository }, { createProductionMcpRuntime, readCanvaMcpCallbackUrl }] =
      await Promise.all([
        import("@/lib/yzi-imob/mcp/postgres-repository"),
        import("@/lib/yzi-imob/mcp/production-runtime"),
      ]);
    const repository = new PostgresMcpRepository();
    const existing = (await repository.listConnections()).find((connection) =>
      connection.ownerScope === "tenant" &&
      connection.ownerId === tenantContext.tenant.id &&
      connection.connectionKind === "canva" &&
      connection.connectionState !== "revoked"
    );
    checkpoint = "connection_selected";
    const runtime = createProductionMcpRuntime();
    const connection = existing ?? await runtime.createConnection({
      ownerScope: "tenant",
      ownerId: tenantContext.tenant.id,
      connectionKind: "canva",
      displayName: "Canva",
    });
    checkpoint = "authorization_start";
    const authorization = await runtime.startAuthorization({
      connectionId: connection.id,
      callbackUrl: readCanvaMcpCallbackUrl(),
    });
    console.info("[Canva MCP authorization]", {
      checkpoint: "action_return_ok",
      reusedExistingConnection: Boolean(existing),
      authorizationUrlPresent: Boolean(authorization.authorizationUrl),
      authorizationHost: safeUrlHost(authorization.authorizationUrl),
    });
    return {
      status: "ok",
      connectionStatus: "awaiting_authorization",
      authorizationUrl: authorization.authorizationUrl,
    };
  } catch (error) {
    console.error("[Canva MCP authorization failed]", {
      checkpoint,
      name: error instanceof Error ? error.name : "Unknown",
      sqlstate: sanitizeSqlState(error),
      message: sanitizeMetricoolAuthorizationError(error),
    });
    return { status: "error", code: "operation_failed" };
  }
}

function safeUrlHost(value: string): string | null {
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

function sanitizeSqlState(error: unknown): string | null {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && /^[0-9A-Z]{5}$/.test(code) ? code : null;
}

function sanitizeMetricoolAuthorizationError(error: unknown): string {
  if (!(error instanceof Error)) return "unknown_error";
  return /^[a-z0-9_ $.-]{1,160}$/i.test(error.message)
    ? error.message
    : "redacted_error";
}

type MetricoolConnectionRpcClient = {
  rpc(
    fn:
      | "request_yzi_imob_metricool_configuration"
      | "request_yzi_imob_metricool_validation"
      | "disconnect_yzi_imob_metricool_connection",
    args: { p_tenant_id: string },
  ): PromiseLike<{
    data: unknown;
    error: { code?: string } | null;
  }>;
};

type MetricoolBootstrapRpcClient = {
  rpc(
    fn:
      | "configure_yzi_imob_metricool_credential"
      | "get_yzi_imob_metricool_account_candidates"
      | "bind_yzi_imob_metricool_account",
    args: Record<string, string>,
  ): PromiseLike<{ data: unknown; error: { code?: string } | null }>;
};

export async function configureMetricoolConnectionAction(
  apiToken: string,
): Promise<MetricoolConnectionActionResult> {
  if (typeof apiToken !== "string" || apiToken.trim().length < 8) {
    return { status: "error", code: "configuration_required" };
  }
  return runMetricoolBootstrapRpc("configure_yzi_imob_metricool_credential", {
    p_api_token: apiToken,
  });
}

export async function discoverMetricoolAccountsAction(): Promise<MetricoolAccountDiscoveryResult> {
  const tenantContext = await getTenantContext();
  if (tenantContext.status !== "tenant_found") {
    return { status: "error", code: "access_denied" };
  }
  try {
    const supabase = await createServerSupabaseClient();
    const rpcClient: MetricoolBootstrapRpcClient = supabase;
    const { data, error } = await rpcClient.rpc(
      "get_yzi_imob_metricool_account_candidates",
      { p_tenant_id: tenantContext.tenant.id },
    );
    if (error || !Array.isArray(data)) {
      return { status: "error", code: "operation_failed" };
    }
    const accounts = data.flatMap((value) => {
      const row = value && typeof value === "object" ? value as Record<string, unknown> : null;
      return typeof row?.external_user_id === "string" &&
          typeof row.external_blog_id === "string" &&
          typeof row.display_name === "string"
        ? [{
            externalUserId: row.external_user_id,
            externalBlogId: row.external_blog_id,
            displayName: row.display_name,
          }]
        : [];
    });
    return { status: "ok", accounts };
  } catch {
    return { status: "error", code: "operation_failed" };
  }
}

export async function bindMetricoolAccountAction(input: {
  externalUserId: string;
  externalBlogId: string;
}): Promise<MetricoolConnectionActionResult> {
  return runMetricoolBootstrapRpc("bind_yzi_imob_metricool_account", {
    p_external_user_id: input.externalUserId,
    p_external_blog_id: input.externalBlogId,
  });
}

export async function requestMetricoolConfigurationAction(): Promise<MetricoolConnectionActionResult> {
  return runMetricoolConnectionAction("request_yzi_imob_metricool_configuration");
}

export async function requestMetricoolValidationAction(): Promise<MetricoolConnectionActionResult> {
  return runMetricoolConnectionAction("request_yzi_imob_metricool_validation");
}

export async function disconnectMetricoolConnectionAction(): Promise<MetricoolConnectionActionResult> {
  return runMetricoolConnectionAction("disconnect_yzi_imob_metricool_connection");
}

export async function runConnectionCommandAction(input: {
  connectionId: string;
  command: ConnectionCommand;
}): Promise<MetricoolConnectionActionResult> {
  const operationalIntent = {
    "publicacao-social": "social_operations",
    "producao-criativa-complementar": "creative_production",
  } as const;
  if (!(input.connectionId in operationalIntent)) {
    return { status: "error", code: "access_denied" };
  }
  // The browser supplies only an allowlisted operational intent. Provider,
  // endpoint, tool and authorization headers are resolved by the server runtime.
  if (input.connectionId === "producao-criativa-complementar") {
    return { status: "error", code: "configuration_required" };
  }
  switch (input.command) {
    case "configure":
      return requestMetricoolConfigurationAction();
    case "test":
      return requestMetricoolValidationAction();
    case "disconnect":
      return disconnectMetricoolConnectionAction();
  }
}

async function runMetricoolConnectionAction(
  fn:
    | "request_yzi_imob_metricool_configuration"
    | "request_yzi_imob_metricool_validation"
    | "disconnect_yzi_imob_metricool_connection",
): Promise<MetricoolConnectionActionResult> {
  const tenantContext = await getTenantContext();
  if (tenantContext.status !== "tenant_found") {
    return { status: "error", code: "access_denied" };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const rpcClient: MetricoolConnectionRpcClient = supabase;
    const { data, error } = await rpcClient.rpc(fn, {
      p_tenant_id: tenantContext.tenant.id,
    });
    if (error) {
      return {
        status: "error",
        code: error.code === "55000" ? "configuration_required" : "operation_failed",
      };
    }

    revalidatePath("/cockpit/yzi-imob/conexoes");
    const row = Array.isArray(data) && data[0] && typeof data[0] === "object"
      ? data[0] as Record<string, unknown>
      : null;
    return {
      status: "ok",
      connectionStatus:
        typeof row?.connection_status === "string" ? row.connection_status : "configuration_required",
    };
  } catch {
    return { status: "error", code: "operation_failed" };
  }
}

async function runMetricoolBootstrapRpc(
  fn: "configure_yzi_imob_metricool_credential" | "bind_yzi_imob_metricool_account",
  args: Record<string, string>,
): Promise<MetricoolConnectionActionResult> {
  const tenantContext = await getTenantContext();
  if (tenantContext.status !== "tenant_found") {
    return { status: "error", code: "access_denied" };
  }
  try {
    const supabase = await createServerSupabaseClient();
    const rpcClient: MetricoolBootstrapRpcClient = supabase;
    const { data, error } = await rpcClient.rpc(fn, {
      p_tenant_id: tenantContext.tenant.id,
      ...args,
    });
    if (error) {
      return {
        status: "error",
        code: error.code === "42501"
          ? "access_denied"
          : error.code === "22023" || error.code === "55000"
            ? "configuration_required"
            : "operation_failed",
      };
    }
    revalidatePath("/cockpit/yzi-imob/conexoes");
    const row = Array.isArray(data) && data[0] && typeof data[0] === "object"
      ? data[0] as Record<string, unknown>
      : null;
    return {
      status: "ok",
      connectionStatus: typeof row?.connection_status === "string"
        ? row.connection_status
        : "configuration_required",
    };
  } catch {
    return { status: "error", code: "operation_failed" };
  }
}
