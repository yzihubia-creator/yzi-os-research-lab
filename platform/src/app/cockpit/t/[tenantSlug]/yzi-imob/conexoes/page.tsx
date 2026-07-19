import { redirect } from "next/navigation";

import { YziImobConnectionsWorkspace } from "@/components/yzi-imob/yzi-imob-connections-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContextBySlug } from "@/lib/tenant/tenant-context";
import { buildConnectionsCatalogFromRpcPayload } from "@/lib/yzi-imob/connections/persisted-state";

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
};

async function loadTenantConnectionsPayload(tenantId: string): Promise<unknown | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const rpcClient: TenantConnectionsRpcClient = supabase;
    const { data, error } = await rpcClient.rpc("get_yzi_imob_tenant_connections", {
      p_tenant_id: tenantId,
    });

    if (error) {
      console.error("[yzi-imob/conexoes/tenant] tenant_connections_rpc_error", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        tenantId,
        routeKind: "explicit_slug",
      });
      return null;
    }

    return data;
  } catch {
    console.error("[yzi-imob/conexoes/tenant] tenant_connections_unavailable");
    return null;
  }
}

function TenantAccessState({ title, message }: { title: string; message: string }) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-8 py-10">
      <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--yzi-text-faint)]">
        Conexões
      </p>
      <h1 className="text-xl font-semibold text-[var(--yzi-text-primary)]">{title}</h1>
      <p className="text-sm leading-relaxed text-[var(--yzi-text-secondary)]">{message}</p>
    </section>
  );
}

export default async function YziImobTenantConexoesPage({ params }: PageProps) {
  const { tenantSlug } = await params;
  const tenantContext = await getTenantContextBySlug(tenantSlug);

  if (tenantContext.status === "no_session") {
    redirect("/login");
  }

  if (tenantContext.status === "no_membership") {
    return (
      <TenantAccessState
        title="Acesso não disponível"
        message="Não foi possível abrir as conexões deste tenant com a sessão atual."
      />
    );
  }

  if (tenantContext.status === "error") {
    return (
      <TenantAccessState
        title="Conexões indisponíveis"
        message="Não foi possível carregar este tenant agora."
      />
    );
  }

  const payload = await loadTenantConnectionsPayload(tenantContext.tenant.id);
  const connections = payload === null ? undefined : buildConnectionsCatalogFromRpcPayload(payload);

  return <YziImobConnectionsWorkspace connections={connections} />;
}
