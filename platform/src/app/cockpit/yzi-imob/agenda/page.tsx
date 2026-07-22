import { YziImobAgendaWorkspace } from "@/components/yzi-imob/yzi-imob-agenda-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { listAppointmentsForTenant } from "@/lib/yzi-imob/agenda/repository";
import { redirect } from "next/navigation";

export default async function YziImobAgendaPage() {
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "no_session") {
    redirect("/login");
  }

  if (tenantContext.status === "no_membership") {
    return <YziImobAgendaWorkspace appointments={[]} accessState="no_membership" />;
  }

  if (tenantContext.status === "error") {
    return <YziImobAgendaWorkspace appointments={[]} accessState="tenant_error" />;
  }

  const supabase = await createServerSupabaseClient();
  const result = await listAppointmentsForTenant(supabase, tenantContext.tenant.id);

  if (result.status === "error") {
    return <YziImobAgendaWorkspace appointments={[]} accessState="read_error" />;
  }

  return <YziImobAgendaWorkspace appointments={result.value.items} accessState="ready" />;
}
