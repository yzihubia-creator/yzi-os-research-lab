import { redirect } from "next/navigation";

import { YziImobSystemWorkspace } from "@/components/yzi-imob/yzi-imob-system-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { getRadarWorkspaceData } from "@/lib/yzi-imob/radar/repository";

// Sistema — saúde e funcionamento da operação. Reusa exatamente a mesma leitura
// tenant-scoped que alimenta o Radar (`getRadarWorkspaceData`): nenhum contrato
// novo, nenhuma capacidade nova. O que muda é a pergunta que a tela responde —
// Radar: "o que eu faço agora"; Sistema: "isso está funcionando".

export default async function YziImobSistemaPage() {
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "no_session") {
    redirect("/login");
  }

  if (tenantContext.status === "no_membership") {
    return <YziImobSystemWorkspace data={null} accessState="no_membership" />;
  }

  if (tenantContext.status === "error") {
    return <YziImobSystemWorkspace data={null} accessState="tenant_error" />;
  }

  const supabase = await createServerSupabaseClient();
  const result = await getRadarWorkspaceData(
    supabase,
    tenantContext.tenant.id,
    tenantContext.role === "owner" || tenantContext.role === "admin",
  );

  if (result.status === "error") {
    return <YziImobSystemWorkspace data={null} accessState="read_error" />;
  }

  return <YziImobSystemWorkspace data={result.value} accessState="ready" />;
}
