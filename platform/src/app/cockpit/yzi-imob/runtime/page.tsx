import { redirect } from "next/navigation";

import { YziImobRunWorkspace } from "@/components/yzi-imob/yzi-imob-run-workspace";
import { YziImobRuntimePreviewV0 } from "@/components/yzi-imob/yzi-imob-runtime-preview-v0";
import { YziAlert, YziDivider } from "@/components/yzi-os/yzi-primitives";
import { getSessionUser } from "@/lib/auth/session";
import { listMockPropertiesForTenant } from "@/lib/yzi-imob/runtime/mock-data";
import { getPrepareContactRunState } from "@/lib/yzi-os/runs";
import { getTenantContext } from "@/lib/tenant/tenant-context";

// Unidade 3 (Persisted Run Slice): esta rota já existia como preview
// somente-leitura do pipeline puro do Runtime; agora também hospeda o
// workspace REAL da primeira run persistida de ponta a ponta
// (PREPARE_PROPERTY_CONTACT). Mesma rota, mesma navegação — nenhuma tela
// nova foi criada. Protege sessão/tenant boundary com o mesmo padrão de
// `app/cockpit/page.tsx`; ausência de sessão ou membership é estado
// honesto, nunca contornado.
export default async function YziImobRuntimePreviewPage() {
  const operator = await getSessionUser();
  if (!operator) {
    redirect("/login");
  }

  const tenantContext = await getTenantContext();

  return (
    <>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pt-10">
        {tenantContext.status === "no_membership" ? (
          <YziAlert tone="blocked" title="Sem tenant vinculado">
            {tenantContext.message}
          </YziAlert>
        ) : null}

        {tenantContext.status === "error" ? (
          <YziAlert tone="blocked" title="Tenant indisponível">
            {tenantContext.error}
          </YziAlert>
        ) : null}

        {tenantContext.status === "tenant_found" ? (
          <RunWorkspaceSection
            tenantId={tenantContext.tenant.id}
            userId={tenantContext.userId}
            userRole={tenantContext.role}
          />
        ) : null}

        <YziDivider className="my-2" />
      </section>

      <YziImobRuntimePreviewV0 />
    </>
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
