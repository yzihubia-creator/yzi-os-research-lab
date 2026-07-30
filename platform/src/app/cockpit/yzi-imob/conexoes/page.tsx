import { YziImobConnectionsWorkspace } from "@/components/yzi-imob/yzi-imob-connections-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import {
  buildConnectionsLoadFailure,
  buildConnectionsViewModelFromRpcPayload,
} from "@/lib/yzi-imob/connections/view-model";

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
      console.error("[yzi-imob/conexoes] tenant_connections_rpc_error", {
        code: error.code,
        routeKind: "legacy",
      });
      return {
        status: "error",
        message: "Nao foi possivel carregar as conexoes deste tenant com a sessao atual.",
      };
    }

    return { status: "ok", payload: data };
  } catch {
    console.error("[yzi-imob/conexoes] tenant_connections_unavailable");
    return {
      status: "error",
      message: "Nao foi possivel carregar as conexoes agora.",
    };
  }
}

export default async function YziImobConexoesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const metaOAuthStatus = readMetaOAuthStatus(resolvedSearchParams);
  const tenantContext = await getTenantContext();

  if (tenantContext.status !== "tenant_found") {
    if (tenantContext.status === "error") {
      console.error("[yzi-imob/conexoes] tenant_context_error");
    }
    return (
      <YziImobConnectionsWorkspace
        viewModel={buildConnectionsLoadFailure(
          tenantContext.status === "error"
            ? "tenant_error"
            : tenantContext.status,
          tenantContext.status === "no_session"
            ? "Entre novamente para carregar o estado real das conexões."
            : tenantContext.status === "no_membership"
              ? "A sessão atual não pode ler as conexões deste tenant."
              : "Não foi possível resolver o tenant para carregar conexões.",
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
    />
  );
}
