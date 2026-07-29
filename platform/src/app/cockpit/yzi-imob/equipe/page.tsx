import { redirect } from "next/navigation";

import { YziImobTeamAccessWorkspace } from "@/components/yzi-imob/yzi-imob-team-access-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTeamAccess } from "@/lib/tenant/team-access";
import { getTenantContext } from "@/lib/tenant/tenant-context";

// Equipe e Acessos YZI IMOB v1 — camada de governança: pessoas, vínculo,
// acesso e disponibilidade. O servidor resolve tenant, usuário e papel via
// RLS (nunca do navegador) e hidrata o workspace apenas com o que é legível
// hoje: a própria membership, o responsável pela implantação e os convites.

export const dynamic = "force-dynamic";

function TeamNotice({ title, body }: { title: string; body: string }) {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-8 py-10">
      <h1 className="text-[1.5rem] font-semibold tracking-[-0.01em] text-[var(--yzi-text-primary)]">
        Equipe e acessos
      </h1>
      <div
        role="alert"
        className="flex flex-col gap-1.5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-5 shadow-[var(--yzi-edge-highlight)]"
      >
        <p className="text-[0.88rem] font-medium text-[var(--yzi-text-primary)]">{title}</p>
        <p className="max-w-xl text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          {body}
        </p>
      </div>
    </section>
  );
}

export default async function YziImobEquipePage() {
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "no_session") {
    redirect("/login");
  }

  if (tenantContext.status === "no_membership") {
    return (
      <TeamNotice
        title="Sua conta ainda não está vinculada a uma operação."
        body="Conclua a implantação inicial para criar sua operação — a equipe dela aparece aqui depois."
      />
    );
  }

  if (tenantContext.status === "error") {
    return (
      <TeamNotice
        title="Não foi possível carregar a equipe agora."
        body="Houve uma falha ao resolver sua operação. Recarregue a página; se persistir, tente novamente em instantes."
      />
    );
  }

  const supabase = await createServerSupabaseClient();
  const result = await getTeamAccess(
    supabase,
    tenantContext.tenant.id,
    tenantContext.userId,
    tenantContext.role,
  );

  if (result.status === "error") {
    return (
      <TeamNotice
        title="Não foi possível carregar a equipe agora."
        body="A leitura dos dados da equipe falhou. Recarregue a página; nada foi alterado na sua operação."
      />
    );
  }

  return <YziImobTeamAccessWorkspace team={result.team} />;
}
