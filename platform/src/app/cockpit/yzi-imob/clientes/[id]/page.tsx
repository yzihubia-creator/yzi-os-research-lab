import { redirect } from "next/navigation";

import { YziImobClientWorkspace } from "@/components/yzi-imob/yzi-imob-client-workspace";
import { YziAlert, YziPanel } from "@/components/yzi-os/yzi-primitives";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { getLeadWorkspaceData } from "@/lib/yzi-imob/leads/repository";

// Client Workspace real: resolve o lead pelo id da rota e pelo tenant da
// sessao. Lead inexistente e lead de outro tenant chegam ao mesmo estado
// honesto de "nao encontrado", porque a query sempre filtra por tenant_id.

export default async function YziImobClienteWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "no_session") {
    redirect("/login");
  }

  if (tenantContext.status === "no_membership") {
    return (
      <section className="mx-auto flex max-w-2xl flex-col gap-4 px-8 py-10">
        <YziPanel className="p-5">
          <p className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
            Sua operacao ainda nao esta disponivel
          </p>
          <p className="mt-1 text-[0.82rem] text-[var(--yzi-text-secondary)]">
            Nao encontramos uma imobiliaria vinculada a sua conta. Verifique o acesso ou fale com o
            administrador.
          </p>
        </YziPanel>
      </section>
    );
  }

  if (tenantContext.status === "error") {
    return (
      <section className="mx-auto flex max-w-2xl flex-col gap-4 px-8 py-10">
        <YziAlert tone="blocked" title="Este lead nao pode ser carregado">
          Tente novamente em instantes. Se o problema continuar, fale com o administrador.
        </YziAlert>
      </section>
    );
  }

  const supabase = await createServerSupabaseClient();
  const result = await getLeadWorkspaceData(supabase, tenantContext.tenant.id, id);

  if (result.status === "error") {
    return (
      <YziImobClientWorkspace
        data={null}
        notFoundMessage={
          result.code === "not_found"
            ? "Este lead nao existe neste tenant."
            : "Este lead nao pode ser lido agora."
        }
      />
    );
  }

  return <YziImobClientWorkspace data={result.value} />;
}
