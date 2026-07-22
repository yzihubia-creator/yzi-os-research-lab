import type { SupabaseClient } from "@supabase/supabase-js";

import {
  APPOINTMENT_STATUS_VALUES,
  type CreateAppointmentInput,
  type YziImobAppointment,
  type YziImobAppointmentStatus,
} from "./types";

const APPOINTMENT_COLUMNS =
  "id, tenant_id, lead_id, property_id, title, starts_at, ends_at, status, confirmation_status, notes, created_at, updated_at";
const LEAD_COLUMNS = "id, full_name";
const PROPERTY_COLUMNS = "id, title";
const DEFAULT_APPOINTMENT_LIMIT = 300;

type AppointmentRow = {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  property_id: string | null;
  title: string | null;
  starts_at: string;
  ends_at: string | null;
  status: string | null;
  confirmation_status: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type LeadRow = {
  id: string;
  full_name: string | null;
};

type PropertyRow = {
  id: string;
  title: string | null;
};

export type AgendaRepositoryError =
  | "not_found"
  | "list_failed"
  | "read_failed"
  | "insert_failed"
  | "update_failed"
  | "invalid_status";

export type AgendaRepositoryResult<T> =
  | { status: "ok"; value: T }
  | { status: "error"; code: AgendaRepositoryError; detail?: string };

function mapAppointment(
  row: AppointmentRow,
  leadNameById: ReadonlyMap<string, string>,
  propertyTitleById: ReadonlyMap<string, string>,
): YziImobAppointment {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    leadId: row.lead_id,
    leadName: row.lead_id ? leadNameById.get(row.lead_id) ?? null : null,
    propertyId: row.property_id,
    propertyTitle: row.property_id ? propertyTitleById.get(row.property_id) ?? null : null,
    title: row.title?.trim() || "Ainda sem dados",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status?.trim() || "scheduled",
    confirmationStatus: row.confirmation_status?.trim() || "pending",
    notes: row.notes?.trim() || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listLeadNamesById(
  supabase: SupabaseClient,
  tenantId: string,
  leadIds: readonly string[],
): Promise<AgendaRepositoryResult<Map<string, string>>> {
  if (leadIds.length === 0) return { status: "ok", value: new Map() };

  const { data, error } = await supabase
    .from("yzi_imob_leads")
    .select(LEAD_COLUMNS)
    .eq("tenant_id", tenantId)
    .in("id", leadIds as string[]);

  if (error) return { status: "error", code: "read_failed", detail: error.message };

  return {
    status: "ok",
    value: new Map(
      ((data as LeadRow[] | null) ?? []).map((row) => [
        row.id,
        row.full_name?.trim() || "Ainda sem dados",
      ]),
    ),
  };
}

async function listPropertyTitlesById(
  supabase: SupabaseClient,
  tenantId: string,
  propertyIds: readonly string[],
): Promise<AgendaRepositoryResult<Map<string, string>>> {
  if (propertyIds.length === 0) return { status: "ok", value: new Map() };

  const { data, error } = await supabase
    .from("yzi_imob_properties")
    .select(PROPERTY_COLUMNS)
    .eq("tenant_id", tenantId)
    .in("id", propertyIds as string[]);

  if (error) return { status: "error", code: "read_failed", detail: error.message };

  return {
    status: "ok",
    value: new Map(
      ((data as PropertyRow[] | null) ?? []).map((row) => [
        row.id,
        row.title?.trim() || "Ainda sem dados",
      ]),
    ),
  };
}

async function hydrateAppointments(
  supabase: SupabaseClient,
  tenantId: string,
  rows: readonly AppointmentRow[],
): Promise<AgendaRepositoryResult<readonly YziImobAppointment[]>> {
  const leadIds = Array.from(
    new Set(rows.map((row) => row.lead_id).filter((id): id is string => Boolean(id))),
  );
  const propertyIds = Array.from(
    new Set(rows.map((row) => row.property_id).filter((id): id is string => Boolean(id))),
  );

  const [leadsResult, propertiesResult] = await Promise.all([
    listLeadNamesById(supabase, tenantId, leadIds),
    listPropertyTitlesById(supabase, tenantId, propertyIds),
  ]);

  if (leadsResult.status === "error") return leadsResult;
  if (propertiesResult.status === "error") return propertiesResult;

  return {
    status: "ok",
    value: rows.map((row) => mapAppointment(row, leadsResult.value, propertiesResult.value)),
  };
}

export async function listAppointmentsForTenant(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<AgendaRepositoryResult<{ items: readonly YziImobAppointment[] }>> {
  const { data, error } = await supabase
    .from("yzi_imob_appointments")
    .select(APPOINTMENT_COLUMNS)
    .eq("tenant_id", tenantId)
    .order("starts_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(DEFAULT_APPOINTMENT_LIMIT);

  if (error) return { status: "error", code: "list_failed", detail: error.message };

  const hydrated = await hydrateAppointments(
    supabase,
    tenantId,
    (data as AppointmentRow[] | null) ?? [],
  );

  if (hydrated.status === "error") {
    return { status: "error", code: "list_failed", detail: hydrated.detail };
  }
  return { status: "ok", value: { items: hydrated.value } };
}

export async function getAppointmentById(
  supabase: SupabaseClient,
  tenantId: string,
  appointmentId: string,
): Promise<AgendaRepositoryResult<YziImobAppointment>> {
  const { data, error } = await supabase
    .from("yzi_imob_appointments")
    .select(APPOINTMENT_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("id", appointmentId)
    .maybeSingle();

  if (error) return { status: "error", code: "read_failed", detail: error.message };
  if (!data) return { status: "error", code: "not_found" };

  const hydrated = await hydrateAppointments(supabase, tenantId, [data as AppointmentRow]);
  if (hydrated.status === "error") return hydrated;
  const appointment = hydrated.value[0];
  if (!appointment) return { status: "error", code: "not_found" };
  return { status: "ok", value: appointment };
}

export async function createAppointment(
  supabase: SupabaseClient,
  tenantId: string,
  input: CreateAppointmentInput,
): Promise<AgendaRepositoryResult<YziImobAppointment>> {
  const { data, error } = await supabase
    .from("yzi_imob_appointments")
    .insert({
      tenant_id: tenantId,
      lead_id: input.leadId ?? null,
      property_id: input.propertyId ?? null,
      title: input.title,
      starts_at: input.startsAt,
      ends_at: input.endsAt ?? null,
      status: input.status,
      confirmation_status: input.confirmationStatus,
      notes: input.notes ?? null,
    })
    .select(APPOINTMENT_COLUMNS)
    .single();

  if (error || !data) return { status: "error", code: "insert_failed", detail: error?.message };

  const hydrated = await hydrateAppointments(supabase, tenantId, [data as AppointmentRow]);
  if (hydrated.status === "error") return hydrated;
  const appointment = hydrated.value[0];
  if (!appointment) return { status: "error", code: "insert_failed" };
  return { status: "ok", value: appointment };
}

export async function updateAppointmentStatus(
  supabase: SupabaseClient,
  tenantId: string,
  appointmentId: string,
  status: YziImobAppointmentStatus,
): Promise<AgendaRepositoryResult<YziImobAppointment>> {
  if (!APPOINTMENT_STATUS_VALUES.includes(status)) {
    return { status: "error", code: "invalid_status" };
  }

  const { data, error } = await supabase
    .from("yzi_imob_appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("tenant_id", tenantId)
    .eq("id", appointmentId)
    .select(APPOINTMENT_COLUMNS)
    .maybeSingle();

  if (error) return { status: "error", code: "update_failed", detail: error.message };
  if (!data) return { status: "error", code: "not_found" };

  const hydrated = await hydrateAppointments(supabase, tenantId, [data as AppointmentRow]);
  if (hydrated.status === "error") return hydrated;
  const appointment = hydrated.value[0];
  if (!appointment) return { status: "error", code: "not_found" };
  return { status: "ok", value: appointment };
}
