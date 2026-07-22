import { YziImobAgendaWorkspace } from "@/components/yzi-imob/yzi-imob-agenda-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { listAppointmentsForTenant } from "@/lib/yzi-imob/agenda/repository";
import { redirect } from "next/navigation";
import {
  cancelAppointmentAction,
  confirmAppointmentAction,
  rescheduleAppointmentAction,
} from "./actions";

const agendaActions = {
  confirm: confirmAppointmentAction,
  cancel: cancelAppointmentAction,
  reschedule: rescheduleAppointmentAction,
};

export default async function YziImobAgendaPage() {
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "no_session") {
    redirect("/login");
  }

  if (tenantContext.status === "no_membership") {
    return <YziImobAgendaWorkspace appointments={[]} accessState="no_membership" actions={agendaActions} />;
  }

  if (tenantContext.status === "error") {
    return <YziImobAgendaWorkspace appointments={[]} accessState="tenant_error" actions={agendaActions} />;
  }

  const supabase = await createServerSupabaseClient();
  const result = await listAppointmentsForTenant(supabase, tenantContext.tenant.id);

  if (result.status === "error") {
    return <YziImobAgendaWorkspace appointments={[]} accessState="read_error" actions={agendaActions} />;
  }

  return <YziImobAgendaWorkspace appointments={result.value.items} accessState="ready" actions={agendaActions} />;
}
