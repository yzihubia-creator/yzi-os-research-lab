import { redirect } from "next/navigation";

import { YziImobDemoEnvironment } from "@/components/yzi-imob/yzi-imob-demo-environment";
import { YziImobRunWorkspace } from "@/components/yzi-imob/yzi-imob-run-workspace";
import { YziImobRuntimePreviewV0 } from "@/components/yzi-imob/yzi-imob-runtime-preview-v0";
import { YziAlert, YziPanel } from "@/components/yzi-os/yzi-primitives";
import { getSessionUser } from "@/lib/auth/session";
import { listMockPropertiesForTenant } from "@/lib/yzi-imob/runtime/mock-data";
import { getPrepareContactRunState } from "@/lib/yzi-os/runs";
import { getTenantContext } from "@/lib/tenant/tenant-context";

// Unidade 3 (Persisted Run Slice) + correção de UX/UI: esta rota hospeda o
// workspace REAL da primeira run persistida de ponta a ponta
// (PREPARE_PROPERTY_CONTACT). A run real é a protagonista da tela; o preview
// antigo do runtime vira um "Ambiente de demonstração" isolado, fechado por
// padrão, que nunca compete visualmente com a operação real. Protege sessão/
// tenant boundary com o mesmo padrão de `app/cockpit/page.tsx`; ausência de
// sessão ou membership é estado honesto, nunca contornado nem misturado com
// operação simulada.
export default async function YziImobRuntimePreviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ demo?: string | string[] }>;
}) {
  const operator = await getSessionUser();
  if (!operator) {
    redirect("/login");
  }

  const tenantContext = await getTenantContext();
  const params = await searchParams;
  const demoParam = Array.isArray(params?.demo) ? params.demo[0] : params?.demo;
  const showDemoEnvironment =
    process.env.NODE_ENV === "development" && demoParam === "1";

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="flex max-w-3xl flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--yzi-text-primary)] sm:text-3xl">
          Operação da YZI
        </h1>
        <p className="text-sm leading-relaxed text-[var(--yzi-text-secondary)] sm:text-[15px]">
          Acompanhe o que a YZI está preparando, o que depende de decisão e o
          que já foi concluído.
        </p>
      </header>

      {tenantContext.status === "no_membership" ? (
        <UnavailableOperationState userId={tenantContext.userId} />
      ) : null}

      {tenantContext.status === "error" ? (
        <YziAlert tone="blocked" title="Sua operação não pôde ser carregada">
          Tente novamente em alguns instantes. Se o problema continuar,
          verifique o acesso com o administrador.
        </YziAlert>
      ) : null}

      {tenantContext.status === "tenant_found" ? (
        <RunWorkspaceSection
          tenantId={tenantContext.tenant.id}
          userId={tenantContext.userId}
          userRole={tenantContext.role}
        />
      ) : null}

      {showDemoEnvironment ? (
        <YziImobDemoEnvironment>
          <YziImobRuntimePreviewV0 />
        </YziImobDemoEnvironment>
      ) : null}
    </section>
  );
}

function UnavailableOperationState({ userId }: { userId: string }) {
  return (
    <YziPanel className="flex max-w-3xl flex-col gap-4 p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--yzi-text-primary)]">
          Sua operação ainda não está disponível
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
          Não encontramos uma imobiliária vinculada à sua conta. Verifique o
          acesso ou fale com o administrador.
        </p>
      </div>

      <details className="group rounded-[var(--yzi-radius-sm)] border border-dashed border-[color:var(--yzi-border-subtle)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-xs font-medium text-[var(--yzi-text-faint)] marker:content-['']">
          <span>Detalhes técnicos</span>
          <span className="transition-transform group-open:rotate-180">▾</span>
        </summary>
        <div className="border-t border-[color:var(--yzi-border-subtle)] px-3 py-2 font-mono text-[0.68rem] leading-relaxed text-[var(--yzi-text-secondary)] [overflow-wrap:anywhere]">
          usuário autenticado: {userId}
        </div>
      </details>
    </YziPanel>
  );
}

async function RunWorkspaceSection({
  tenantId,
  userId,
  userRole,
}: {
  tenantId: string;
  userId: string;
  userRole: string;
}) {
  const candidateProperties = listMockPropertiesForTenant(tenantId).map((p) => ({
    id: p.property_id,
    title: p.title,
  }));
  const initialState = await getPrepareContactRunState({ tenantId });

  return (
    <YziImobRunWorkspace
      tenantId={tenantId}
      userId={userId}
      userRole={userRole}
      candidateProperties={candidateProperties}
      initialState={initialState}
    />
  );
}
