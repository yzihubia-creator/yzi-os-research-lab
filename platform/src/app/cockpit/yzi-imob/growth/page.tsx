import { redirect } from "next/navigation";

import { YziImobGrowthOsWorkspace } from "@/components/yzi-imob/yzi-imob-growth-os-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { getRadarWorkspaceData } from "@/lib/yzi-imob/radar/repository";
import { parseResultsFilters } from "@/lib/yzi-imob/results/model";
import { getResultsWorkspaceData } from "@/lib/yzi-imob/results/repository";

// Growth OS — leitura estratégica sobre os MESMOS contratos de Resultados e
// Radar. Nenhuma consulta nova, nenhuma tabela nova, nenhuma capacidade nova:
// o que muda é a pergunta respondida.

export default async function YziImobGrowthOsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseResultsFilters(await searchParams);
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "no_session") {
    redirect("/login");
  }

  if (tenantContext.status === "no_membership") {
    return <YziImobGrowthOsWorkspace data={null} signals={[]} accessState="no_membership" />;
  }

  if (tenantContext.status === "error") {
    return <YziImobGrowthOsWorkspace data={null} signals={[]} accessState="tenant_error" />;
  }

  const supabase = await createServerSupabaseClient();
  const elevated = tenantContext.role === "owner" || tenantContext.role === "admin";

  const [resultsResult, radarResult] = await Promise.all([
    getResultsWorkspaceData(
      supabase,
      tenantContext.tenant.id,
      tenantContext.tenant.name,
      filters,
      elevated,
    ),
    getRadarWorkspaceData(supabase, tenantContext.tenant.id, elevated),
  ]);

  if (resultsResult.status === "error") {
    return <YziImobGrowthOsWorkspace data={null} signals={[]} accessState="read_error" />;
  }

  return (
    <YziImobGrowthOsWorkspace
      data={resultsResult.value}
      signals={radarResult.status === "ok" ? radarResult.value.signals : []}
      accessState="ready"
    />
  );
}
