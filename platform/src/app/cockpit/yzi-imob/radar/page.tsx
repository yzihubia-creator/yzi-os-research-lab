import { YziImobRadarWorkspace } from "@/components/yzi-imob/yzi-imob-radar-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { getRadarWorkspaceData } from "@/lib/yzi-imob/radar/repository";
import { redirect } from "next/navigation";

export default async function YziImobRadarPage() {
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "no_session") {
    redirect("/login");
  }

  if (tenantContext.status === "no_membership") {
    return <YziImobRadarWorkspace signals={[]} sourceIssues={[]} accessState="no_membership" />;
  }

  if (tenantContext.status === "error") {
    return <YziImobRadarWorkspace signals={[]} sourceIssues={[]} accessState="tenant_error" />;
  }

  const supabase = await createServerSupabaseClient();
  const result = await getRadarWorkspaceData(supabase, tenantContext.tenant.id);

  if (result.status === "error") {
    return <YziImobRadarWorkspace signals={[]} sourceIssues={[]} accessState="read_error" />;
  }

  return (
    <YziImobRadarWorkspace
      signals={result.value.signals}
      sourceIssues={result.value.sourceIssues}
      accessState="ready"
    />
  );
}
