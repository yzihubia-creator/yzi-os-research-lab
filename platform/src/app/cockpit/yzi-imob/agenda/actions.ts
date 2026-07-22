"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import {
  rescheduleAppointment,
  updateAppointmentConfirmation,
  updateAppointmentStatus,
} from "@/lib/yzi-imob/agenda/repository";

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
