import { YziImobConnectionsWorkspace } from "@/components/yzi-imob/yzi-imob-connections-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { buildConnectionsCatalogFromRpcPayload } from "@/lib/yzi-imob/connections/persisted-state";

type TenantConnectionsRpcClient = {
  rpc(
    fn: "get_yzi_imob_tenant_connections",
    args: { p_tenant_id: string },
  ): PromiseLike<{ data: unknown; error: { code?: string; message?: string } | null }>;
};

async function loadTenantConnectionsPayload(tenantId: string): Promise<unknown | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const rpcClient: TenantConnectionsRpcClient = supabase;
    const { data, error } = await rpcClient.rpc("get_yzi_imob_tenant_connections", {
      p_tenant_id: tenantId,
    });

    if (error) {
      console.error("[yzi-imob/conexoes] tenant_connections_rpc_error");
      return null;
    }

    return data;
  } catch {
    console.error("[yzi-imob/conexoes] tenant_connections_unavailable");
    return null;
  }
}

export default async function YziImobConexoesPage() {
  const tenantContext = await getTenantContext();

  if (tenantContext.status !== "tenant_found") {
    if (tenantContext.status === "error") {
      console.error("[yzi-imob/conexoes] tenant_context_error");
    }
    return <YziImobConnectionsWorkspace />;
  }

  const payload = await loadTenantConnectionsPayload(tenantContext.tenant.id);
  const connections = payload === null ? undefined : buildConnectionsCatalogFromRpcPayload(payload);

  return <YziImobConnectionsWorkspace connections={connections} />;
}
