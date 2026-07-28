import { YziImobRadarWorkspace } from "@/components/yzi-imob/yzi-imob-radar-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { parseRadarFilters } from "@/lib/yzi-imob/radar/model";
import { getRadarWorkspaceData } from "@/lib/yzi-imob/radar/repository";
import { redirect } from "next/navigation";

export default async function YziImobRadarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseRadarFilters(await searchParams);
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "no_session") {
    redirect("/login");
  }

  if (tenantContext.status === "no_membership") {
    return <YziImobRadarWorkspace data={null} filters={filters} accessState="no_membership" />;
  }

  if (tenantContext.status === "error") {
    return <YziImobRadarWorkspace data={null} filters={filters} accessState="tenant_error" />;
  }

  const supabase = await createServerSupabaseClient();
  const result = await getRadarWorkspaceData(
    supabase,
    tenantContext.tenant.id,
    tenantContext.role === "owner" || tenantContext.role === "admin",
  );

  if (result.status === "error") {
    return <YziImobRadarWorkspace data={null} filters={filters} accessState="read_error" />;
  }

  return (
    <YziImobRadarWorkspace data={result.value} filters={filters} accessState="ready" />
  );
}
