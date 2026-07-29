import { YziImobPropertyCatalogV2 } from "@/components/yzi-imob/yzi-imob-property-catalog-v2";
import { YziImobPropertyAccessState } from "@/components/yzi-imob/properties/yzi-imob-property-access-state";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { listProperties } from "@/lib/yzi-imob/properties/repository";

// Catálogo de imóveis — busca real, escopada por imobiliária, server-side.
// Sem sessão ou sem vínculo: estado honesto de acesso, nunca catálogo vazio
// disfarçado de dado real. `listProperties` já filtra por tenant_id
// explicitamente (defesa em profundidade além de RLS).

export default async function YziImobCatalogoImoveisPage() {
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "no_session") {
    return (
      <YziImobPropertyAccessState
        title="Você precisa entrar para ver seus imóveis"
        message="Faça login para acessar o catálogo de imóveis."
      />
    );
  }

  if (tenantContext.status === "error") {
    return (
      <YziImobPropertyAccessState
        title="Não foi possível carregar seu acesso"
        message="Tente novamente em instantes. Se o problema continuar, fale com o administrador."
      />
    );
  }

  // Sessão válida, mas sem imobiliária vinculada: a tela (header, explicação
  // e CTA de cadastro) continua visível — só a ação de salvar fica bloqueada,
  // dentro do formulário de cadastro.
  if (tenantContext.status === "no_membership") {
    return <YziImobPropertyCatalogV2 properties={[]} membershipMissing />;
  }

  const supabase = await createServerSupabaseClient();
  const result = await listProperties(supabase, tenantContext.tenant.id);

  if (result.status === "error") {
    return (
      <YziImobPropertyAccessState
        title="Não foi possível carregar o catálogo"
        message="Tente novamente em instantes."
      />
    );
  }

  return <YziImobPropertyCatalogV2 properties={result.value.items} />;
}
