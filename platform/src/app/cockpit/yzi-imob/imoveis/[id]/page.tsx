import { YziImobPropertyWorkspace } from "@/components/yzi-imob/yzi-imob-property-workspace";
import { YziImobPropertyAccessState } from "@/components/yzi-imob/properties/yzi-imob-property-access-state";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { getPropertyMediaUploadCapability } from "@/lib/yzi-imob/creative/media/source-upload-repository";
import { listPropertyPublicationMedia } from "@/lib/yzi-imob/publication/repository";
import { getPropertyWorkspaceData } from "@/lib/yzi-imob/properties/repository";

// Workspace de um imóvel — busca real, tenant-scoped, server-side.
// `getPropertyById` filtra por tenant_id + id explicitamente: um id de
// outro tenant nunca vaza, sempre vira `not_found` honesto (tratado dentro
// do próprio Workspace, junto com "id inexistente").

export default async function YziImobImovelWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "no_session") {
    return (
      <YziImobPropertyAccessState
        title="Você precisa entrar para ver este imóvel"
        message="Faça login para acessar os imóveis desta operação."
      />
    );
  }

  // Sessão válida, mas sem imobiliária vinculada: não há imóvel para
  // resolver, mas a estrutura do Workspace (header, navegação) continua
  // visível através do próprio estado "não encontrado" do componente.
  if (tenantContext.status === "no_membership") {
    return <YziImobPropertyWorkspace tenantId="" property={null} />;
  }

  if (tenantContext.status === "error") {
    return (
      <YziImobPropertyAccessState
        title="Não foi possível carregar seu acesso"
        message="Tente novamente em instantes. Se o problema continuar, fale com o administrador."
      />
    );
  }

  const supabase = await createServerSupabaseClient();
  const [result, mediaResult, mediaUploadEnabled] = await Promise.all([
    getPropertyWorkspaceData(supabase, tenantContext.tenant.id, id),
    listPropertyPublicationMedia(supabase, tenantContext.tenant.id, id),
    getPropertyMediaUploadCapability(supabase, id),
  ]);

  if (result.status === "error") {
    return <YziImobPropertyWorkspace tenantId={tenantContext.tenant.id} property={null} />;
  }

  return (
    <YziImobPropertyWorkspace
      tenantId={tenantContext.tenant.id}
      property={result.value.property}
      proximities={result.value.proximities}
      privateLocation={result.value.privateLocation}
      privateLocationError={result.value.privateLocationError}
      descriptionRevisions={result.value.descriptionRevisions}
      media={mediaResult.status === "ok" ? mediaResult.value : []}
      mediaUnavailable={mediaResult.status === "error"}
      mediaUploadEnabled={mediaUploadEnabled}
    />
  );
}
