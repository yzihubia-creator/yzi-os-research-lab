import { YziImobGrowthResultadosV0 } from "@/components/yzi-imob/yzi-imob-growth-resultados-v0";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { parseResultsFilters } from "@/lib/yzi-imob/results/model";
import { getResultsWorkspaceData } from "@/lib/yzi-imob/results/repository";
import { redirect } from "next/navigation";

export default async function YziImobGrowthResultadosPage({
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
    return <YziImobGrowthResultadosV0 accessState="no_membership" data={null} />;
  }

  if (tenantContext.status === "error") {
    return <YziImobGrowthResultadosV0 accessState="tenant_error" data={null} />;
  }

  const supabase = await createServerSupabaseClient();
  const result = await getResultsWorkspaceData(
    supabase,
    tenantContext.tenant.id,
    tenantContext.tenant.name,
    filters,
    tenantContext.role === "owner" || tenantContext.role === "admin",
  );

  if (result.status === "error") {
    return <YziImobGrowthResultadosV0 accessState="read_error" data={null} />;
  }

  return <YziImobGrowthResultadosV0 accessState="ready" data={result.value} />;
}
