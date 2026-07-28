import { YziImobPropertyAccessState } from "@/components/yzi-imob/properties/yzi-imob-property-access-state";
import { YziImobSitePublicationGovernance } from "@/components/yzi-imob/yzi-imob-site-publication-governance";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { getSitePublicationGovernanceSummary } from "@/lib/yzi-imob/publication/repository";

export default async function YziImobSitePage() {
  const tenantContext = await getTenantContext();
  if (tenantContext.status === "no_session") {
    return (
      <YziImobPropertyAccessState
        title="Entre para governar publicações"
        message="Esta superfície é restrita à operação autenticada."
      />
    );
  }
  if (tenantContext.status === "no_membership") {
    return (
      <YziImobPropertyAccessState
        title="Operação não vinculada"
        message="Sua conta ainda não pertence a uma imobiliária."
      />
    );
  }
  if (tenantContext.status === "error") {
    return (
      <YziImobPropertyAccessState
        title="Publicação indisponível"
        message="Não foi possível validar seu acesso agora."
      />
    );
  }

  const supabase = await createServerSupabaseClient();
  const result = await getSitePublicationGovernanceSummary(
    supabase,
    tenantContext.tenant.id,
  );
  if (result.status === "error") {
    return (
      <YziImobPropertyAccessState
        title="Contrato de publicação indisponível"
        message="A migration local ainda não está aplicada neste ambiente ou a leitura falhou. Nenhum dado foi alterado."
      />
    );
  }

  return <YziImobSitePublicationGovernance summary={result.value} />;
}
