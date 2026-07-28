import { YziImobApisCreditosWorkspace } from "@/components/yzi-imob/yzi-imob-apis-creditos-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { getOperationalConsumptionSummary } from "@/lib/yzi-imob/consumption/repository";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function YziImobApisCreditosPage() {
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "no_session") {
    redirect("/login");
  }
  if (tenantContext.status === "no_membership") {
    return <YziImobApisCreditosWorkspace summary={null} accessState="no_membership" />;
  }
  if (tenantContext.status === "error") {
    return <YziImobApisCreditosWorkspace summary={null} accessState="tenant_error" />;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const summary = await getOperationalConsumptionSummary(
      supabase,
      tenantContext.tenant.id,
    );
    return <YziImobApisCreditosWorkspace summary={summary} accessState="ready" />;
  } catch {
    console.error("[yzi-imob/apis-creditos] operational_consumption_read_failed");
    return <YziImobApisCreditosWorkspace summary={null} accessState="read_error" />;
  }
}
