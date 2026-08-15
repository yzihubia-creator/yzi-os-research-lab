import { redirect } from "next/navigation";

import { YziImobConnectionsWorkspace } from "@/components/yzi-imob/yzi-imob-connections-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContextBySlug } from "@/lib/tenant/tenant-context";
import {
  buildConnectionsLoadFailure,
  buildConnectionsViewModelFromRpcPayload,
} from "@/lib/yzi-imob/connections/view-model";
import { mergeMetricoolMcpRegistryRow } from "@/lib/yzi-imob/mcp/public-registry";

type MetaOAuthCallbackStatus =
  | "success"
  | "cancelled"
  | "expired"
  | "invalid_state"
  | "provider_error"
  | "internal_error";

type TenantConnectionsRpcClient = {
  rpc(
    fn: "get_yzi_imob_tenant_connections",
    args: { p_tenant_id: string },
  ): PromiseLike<{
    data: unknown;
    error: { code?: string; message?: string; details?: string; hint?: string } | null;
  }>;
};

type PageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type TenantConnectionsLoadResult =
  | { status: "ok"; payload: unknown }
  | { status: "error"; message: string };

const META_OAUTH_CALLBACK_STATUSES = new Set<MetaOAuthCallbackStatus>([
  "success",
  "cancelled",
  "expired",
  "invalid_state",
  "provider_error",
  "internal_error",
]);

function readMetaOAuthStatus(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): MetaOAuthCallbackStatus | null {
  const rawValue = searchParams?.meta_oauth;
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  return value && META_OAUTH_CALLBACK_STATUSES.has(value as MetaOAuthCallbackStatus)
    ? (value as MetaOAuthCallbackStatus)
    : null;
}

async function loadTenantConnectionsPayload(tenantId: string): Promise<TenantConnectionsLoadResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const rpcClient: TenantConnectionsRpcClient = supabase;
    const { data, error } = await rpcClient.rpc("get_yzi_imob_tenant_connections", {
      p_tenant_id: tenantId,
    });

    if (error) {
      console.error("[yzi-imob/conexoes/tenant] tenant_connections_rpc_error", {
        code: error.code,
        routeKind: "explicit_slug",
      });
      return {
        status: "error",
        message: "Nao foi possivel carregar as conexoes deste tenant com a sessao atual.",
      };
    }

    return { status: "ok", payload: await mergeMetricoolMcpRegistryRow(data, tenantId) };
  } catch {
    console.error("[yzi-imob/conexoes/tenant] tenant_connections_unavailable");
    return {
      status: "error",
      message: "Nao foi possivel carregar as conexoes agora.",
    };
  }
}

export default async function YziImobTenantConexoesPage({ params, searchParams }: PageProps) {
  const { tenantSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const metaOAuthStatus = readMetaOAuthStatus(resolvedSearchParams);
  const tenantContext = await getTenantContextBySlug(tenantSlug);

  if (tenantContext.status === "no_session") {
    redirect("/login");
  }

  if (tenantContext.status === "no_membership") {
    return (
      <YziImobConnectionsWorkspace
        viewModel={buildConnectionsLoadFailure(
          "no_membership",
          "A sessão atual não pode ler as conexões deste tenant.",
        )}
        authorizationCallbackStatus={metaOAuthStatus}
      />
    );
  }

  if (tenantContext.status === "error") {
    return (
      <YziImobConnectionsWorkspace
        viewModel={buildConnectionsLoadFailure(
          "tenant_error",
          "Não foi possível resolver o tenant para carregar conexões.",
        )}
        authorizationCallbackStatus={metaOAuthStatus}
      />
    );
  }

  const result = await loadTenantConnectionsPayload(tenantContext.tenant.id);
  if (result.status === "error") {
    return (
      <YziImobConnectionsWorkspace
        viewModel={buildConnectionsLoadFailure("error", result.message)}
        authorizationCallbackStatus={metaOAuthStatus}
      />
    );
  }

  const viewModel = buildConnectionsViewModelFromRpcPayload(
    result.payload,
    tenantContext.tenant.id,
  );

  return (
    <YziImobConnectionsWorkspace
      viewModel={viewModel}
      authorizationCallbackStatus={metaOAuthStatus}
      operationName={tenantContext.tenant.name}
    />
  );
}
