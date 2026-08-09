import { YziImobSocialPublicationsWorkspace } from "@/components/yzi-imob/yzi-imob-social-publications-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { listPendingCreativeApprovals } from "@/lib/yzi-imob/creative/repository";
import { loadMetricoolMarketingWorkspace } from "@/lib/yzi-imob/metricool/repository";

export default async function YziImobSocialPublicationsPage() {
  const tenantContext = await getTenantContext();
  if (tenantContext.status !== "tenant_found") {
    return (
      <YziImobSocialPublicationsWorkspace
        workspace={null}
        accessState={tenantContext.status === "error" ? "tenant-error" : tenantContext.status}
      />
    );
  }

  const supabase = await createServerSupabaseClient();
  const [result, creativeApprovalsResult] = await Promise.all([
    loadMetricoolMarketingWorkspace(supabase, tenantContext.tenant.id),
    listPendingCreativeApprovals(supabase, tenantContext.tenant.id),
  ]);
  return (
    <YziImobSocialPublicationsWorkspace
      workspace={result.status === "ok" ? result.value : null}
      accessState={result.status === "ok" ? "ready" : "read-error"}
      creativeApprovals={
        creativeApprovalsResult.status === "ok" ? creativeApprovalsResult.value : []
      }
      creativeApprovalsReadFailed={creativeApprovalsResult.status === "error"}
    />
  );
}
