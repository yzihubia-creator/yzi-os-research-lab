"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import {
  getAppointmentById,
  rescheduleAppointment,
  updateAppointmentConfirmation,
  updateAppointmentStatus,
} from "@/lib/yzi-imob/agenda/repository";
import type { OperationalActionState } from "@/lib/yzi-imob/operations/action-state";
import { recordVisitFeedback } from "@/lib/yzi-imob/operations/repository";

function stringValue(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseLocalDateTime(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toISOString();
}

async function getAgendaActionContext(): Promise<
  | { status: "ok"; tenantId: string }
  | { status: "blocked" }
> {
  const tenantContext = await getTenantContext();
  if (tenantContext.status === "no_session") {
    redirect("/login");
  }
  if (tenantContext.status !== "tenant_found") {
    return { status: "blocked" };
  }
  return { status: "ok", tenantId: tenantContext.tenant.id };
}

function revalidateAgenda() {
  revalidatePath("/cockpit/yzi-imob/agenda");
}

function actionState(
  previous: OperationalActionState,
  status: "saved" | "error",
  message: string,
): OperationalActionState {
  return { status, message, revision: previous.revision + 1 };
}

export async function confirmAppointmentAction(formData: FormData): Promise<void> {
  const appointmentId = stringValue(formData, "appointmentId");
  if (!appointmentId) return;

  const context = await getAgendaActionContext();
  if (context.status !== "ok") return;

  const supabase = await createServerSupabaseClient();
  await updateAppointmentConfirmation(supabase, context.tenantId, appointmentId, "confirmed");
  revalidateAgenda();
}

export async function cancelAppointmentAction(formData: FormData): Promise<void> {
  const appointmentId = stringValue(formData, "appointmentId");
  if (!appointmentId) return;

  const context = await getAgendaActionContext();
  if (context.status !== "ok") return;

  const supabase = await createServerSupabaseClient();
  await updateAppointmentStatus(supabase, context.tenantId, appointmentId, "cancelled");
  revalidateAgenda();
}

export async function rescheduleAppointmentAction(formData: FormData): Promise<void> {
  const appointmentId = stringValue(formData, "appointmentId");
  const startsAt = parseLocalDateTime(stringValue(formData, "startsAt"));
  const endsAt = parseLocalDateTime(stringValue(formData, "endsAt"));
  if (!appointmentId || !startsAt) return;

  const context = await getAgendaActionContext();
  if (context.status !== "ok") return;

  const supabase = await createServerSupabaseClient();
  await rescheduleAppointment(supabase, context.tenantId, appointmentId, startsAt, endsAt);
  revalidateAgenda();
}

export async function recordVisitFeedbackAction(
  previous: OperationalActionState,
  formData: FormData,
): Promise<OperationalActionState> {
  const appointmentId = stringValue(formData, "appointmentId");
  const clientAttendance = stringValue(formData, "clientAttendance");
  const outcome = stringValue(formData, "outcome");
  const observation = stringValue(formData, "observation");
  const nextAction = stringValue(formData, "nextAction");
  const nextActionAt = parseLocalDateTime(stringValue(formData, "nextActionAt"));
  if (
    !appointmentId ||
    !clientAttendance ||
    !outcome ||
    !["attended", "no_show", "unknown"].includes(clientAttendance) ||
    ![
      "interested",
      "not_interested",
      "proposal_requested",
      "follow_up_required",
      "undisclosed",
    ].includes(outcome)
  ) {
    return actionState(previous, "error", "O feedback informado e invalido.");
  }

  const tenantContext = await getTenantContext();
  if (tenantContext.status === "no_session") redirect("/login");
  if (tenantContext.status !== "tenant_found") {
    return actionState(previous, "error", "A operacao nao esta disponivel.");
  }
  if (!["owner", "admin", "operator"].includes(tenantContext.role)) {
    return actionState(previous, "error", "Seu papel nao permite registrar feedback.");
  }

  const supabase = await createServerSupabaseClient();
  const appointmentResult = await getAppointmentById(
    supabase,
    tenantContext.tenant.id,
    appointmentId,
  );
  if (appointmentResult.status === "error") {
    return actionState(previous, "error", "A visita nao existe neste tenant.");
  }
  if (appointmentResult.value.status !== "completed") {
    return actionState(
      previous,
      "error",
      appointmentResult.value.status === "cancelled"
        ? "Visitas canceladas nao recebem feedback."
        : "Conclua a visita antes de registrar o feedback.",
    );
  }

  const result = await recordVisitFeedback(
    supabase,
    tenantContext.tenant.id,
    {
      appointmentId,
      leadId: appointmentResult.value.leadId,
      propertyId: appointmentResult.value.propertyId,
      brokerUserId: appointmentResult.value.brokerUserId,
      clientAttendance: clientAttendance as "attended" | "no_show" | "unknown",
      outcome: outcome as
        | "interested"
        | "not_interested"
        | "proposal_requested"
        | "follow_up_required"
        | "undisclosed",
      observation,
      nextAction,
      nextActionAt,
    },
  );
  if (result.status === "error") {
    return actionState(previous, "error", "Nao foi possivel registrar o feedback.");
  }

  revalidateAgenda();
  if (result.value.leadId) {
    revalidatePath(`/cockpit/yzi-imob/clientes/${result.value.leadId}`);
  }
  if (result.value.brokerUserId) {
    revalidatePath(`/cockpit/yzi-imob/corretores/${result.value.brokerUserId}`);
  }
  return actionState(previous, "saved", "Feedback registrado.");
}
