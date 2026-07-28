import type { SupabaseClient } from "@supabase/supabase-js";

import { listAppointmentsForTenant } from "@/lib/yzi-imob/agenda/repository";
import type { YziImobAppointment } from "@/lib/yzi-imob/agenda/types";

import {
  FOLLOW_UP_TASK_KIND_VALUES,
  FOLLOW_UP_TASK_STATUS_VALUES,
  LEAD_ASSIGNMENT_STATUS_VALUES,
  VISIT_FEEDBACK_ATTENDANCE_VALUES,
  VISIT_FEEDBACK_OUTCOME_VALUES,
  type CreateLeadAssignmentInput,
  type FollowUpTask,
  type FollowUpTaskKind,
  type EligibleBroker,
  type LeadAssignment,
  type LeadAssignmentStatus,
  type LeadOperationalPacket,
  type LeadOperationsWorkspace,
  type RecordVisitFeedbackInput,
  type VisitFeedback,
} from "./types";

const LEAD_COLUMNS =
  "id, full_name, phone, email, status, temperature, score, updated_at";
const PROPERTY_COLUMNS = "id, title";
const BROKER_PROFILE_COLUMNS = "user_id, display_name";
const APPOINTMENT_COLUMNS =
  "id, title, starts_at, status, lead_id, property_id, broker_user_id";
const CONVERSATION_COLUMNS = "id, last_message_at, updated_at";
const MESSAGE_COLUMNS = "body, created_at";
const ASSIGNMENT_COLUMNS = [
  "id",
  "tenant_id",
  "lead_id",
  "broker_user_id",
  "status",
  "source",
  "notes",
  "expires_at",
  "assigned_at",
  "accepted_at",
  "declined_at",
  "created_by_user_id",
  "created_at",
  "updated_at",
].join(", ");
const VISIT_FEEDBACK_COLUMNS = [
  "id",
  "tenant_id",
  "appointment_id",
  "lead_id",
  "property_id",
  "broker_user_id",
  "client_attendance",
  "outcome",
  "observation",
  "next_action",
  "next_action_at",
  "feedback_at",
  "created_at",
  "updated_at",
].join(", ");
const FOLLOW_UP_TASK_COLUMNS = [
  "id",
  "tenant_id",
  "lead_id",
  "conversation_id",
  "appointment_id",
  "assignment_id",
  "kind",
  "status",
  "channel",
  "due_at",
  "notes",
  "source",
  "scheduled_at",
  "attempt_count",
  "max_attempts",
  "last_attempt_at",
  "last_error_code",
  "completed_at",
  "created_at",
  "updated_at",
].join(", ");
const APPOINTMENT_LIST_COLUMNS =
  "id, tenant_id, lead_id, property_id, broker_user_id, title, starts_at, ends_at, status, confirmation_status, source, notes, created_at, updated_at";

type LeadRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  temperature: string | null;
  score: number | null;
  updated_at: string | null;
};

type PropertyRow = { id: string; title: string | null };
type BrokerProfileRow = { user_id: string; display_name: string | null };
type AssignmentRow = {
  id: string;
  tenant_id: string;
  lead_id: string;
  broker_user_id: string;
  status: string;
  source: string;
  notes: string | null;
  expires_at: string | null;
  assigned_at: string;
  accepted_at: string | null;
  declined_at: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};
type AppointmentPacketRow = {
  id: string;
  title: string | null;
  starts_at: string;
  status: string | null;
  lead_id: string | null;
  property_id: string | null;
  broker_user_id: string | null;
};
type AppointmentListRow = {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  property_id: string | null;
  broker_user_id: string | null;
  title: string | null;
  starts_at: string;
  ends_at: string | null;
  status: string | null;
  confirmation_status: string | null;
  source: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};
type ConversationRow = {
  id: string;
  last_message_at: string | null;
  updated_at: string | null;
};
type MessageRow = {
  body: string | null;
  created_at: string;
};
type VisitFeedbackRow = {
  id: string;
  tenant_id: string;
  appointment_id: string;
  lead_id: string | null;
  property_id: string | null;
  broker_user_id: string | null;
  client_attendance: string;
  outcome: string;
  observation: string | null;
  next_action: string | null;
  next_action_at: string | null;
  feedback_at: string;
  created_at: string;
  updated_at: string;
};
type FollowUpTaskRow = {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  conversation_id: string | null;
  appointment_id: string | null;
  assignment_id: string | null;
  kind: string;
  status: string;
  channel: string | null;
  due_at: string;
  notes: string | null;
  source: string;
  scheduled_at: string | null;
  attempt_count: number;
  max_attempts: number;
  last_attempt_at: string | null;
  last_error_code: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OperationsRepositoryError =
  | "not_found"
  | "read_failed"
  | "insert_failed"
  | "update_failed"
  | "invalid_status"
  | "invalid_input"
  | "broker_not_found"
  | "lead_not_found";

export type OperationsRepositoryResult<T> =
  | { status: "ok"; value: T }
  | { status: "error"; code: OperationsRepositoryError; detail?: string };

function trimOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function mapLeadAssignment(
  row: AssignmentRow,
  leadNameById: ReadonlyMap<string, string>,
  brokerNameByUserId: ReadonlyMap<string, string>,
): LeadAssignment {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    leadId: row.lead_id,
    leadName: leadNameById.get(row.lead_id) ?? null,
    brokerUserId: row.broker_user_id,
    brokerName: brokerNameByUserId.get(row.broker_user_id) ?? null,
    status: row.status,
    source: row.source,
    notes: trimOrNull(row.notes),
    expiresAt: row.expires_at,
    assignedAt: row.assigned_at,
    acceptedAt: row.accepted_at,
    declinedAt: row.declined_at,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapVisitFeedback(
  row: VisitFeedbackRow,
  brokerNameByUserId: ReadonlyMap<string, string>,
): VisitFeedback {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    appointmentId: row.appointment_id,
    leadId: row.lead_id,
    propertyId: row.property_id,
    brokerUserId: row.broker_user_id,
    brokerName: row.broker_user_id ? brokerNameByUserId.get(row.broker_user_id) ?? null : null,
    clientAttendance: row.client_attendance,
    outcome: row.outcome,
    observation: trimOrNull(row.observation),
    nextAction: trimOrNull(row.next_action),
    nextActionAt: row.next_action_at,
    feedbackAt: row.feedback_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapFollowUpTask(row: FollowUpTaskRow): FollowUpTask {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    leadId: row.lead_id,
    conversationId: row.conversation_id,
    appointmentId: row.appointment_id,
    assignmentId: row.assignment_id,
    kind: row.kind,
    status: row.status,
    channel: row.channel,
    dueAt: row.due_at,
    notes: trimOrNull(row.notes),
    source: row.source,
    scheduledAt: row.scheduled_at,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    lastAttemptAt: row.last_attempt_at,
    lastErrorCode: trimOrNull(row.last_error_code),
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listLeadNamesById(
  supabase: SupabaseClient,
  tenantId: string,
  leadIds: readonly string[],
): Promise<OperationsRepositoryResult<Map<string, string>>> {
  if (leadIds.length === 0) return { status: "ok", value: new Map() };

  const { data, error } = await supabase
    .from("yzi_imob_leads")
    .select("id, full_name")
    .eq("tenant_id", tenantId)
    .in("id", leadIds as string[]);

  if (error) return { status: "error", code: "read_failed", detail: error.message };

  return {
    status: "ok",
    value: new Map(
      ((data as { id: string; full_name: string | null }[] | null) ?? []).map((row) => [
        row.id,
        trimOrNull(row.full_name) ?? "Ainda sem dados",
      ]),
    ),
  };
}

async function listBrokerNamesByUserId(
  supabase: SupabaseClient,
  tenantId: string,
  brokerUserIds: readonly string[],
): Promise<OperationsRepositoryResult<Map<string, string>>> {
  if (brokerUserIds.length === 0) return { status: "ok", value: new Map() };

  const { data, error } = await supabase
    .from("tenant_member_profiles")
    .select(BROKER_PROFILE_COLUMNS)
    .eq("tenant_id", tenantId)
    .in("user_id", brokerUserIds as string[]);

  if (error) return { status: "error", code: "read_failed", detail: error.message };

  return {
    status: "ok",
    value: new Map(
      ((data as BrokerProfileRow[] | null) ?? []).map((row) => [
        row.user_id,
        trimOrNull(row.display_name) ?? "Ainda sem dados",
      ]),
    ),
  };
}

async function getBrokerNameMapForAssignments(
  supabase: SupabaseClient,
  tenantId: string,
  rows: readonly AssignmentRow[],
): Promise<OperationsRepositoryResult<Map<string, string>>> {
  const brokerIds = Array.from(new Set(rows.map((row) => row.broker_user_id)));
  return listBrokerNamesByUserId(supabase, tenantId, brokerIds);
}

export async function listLeadAssignmentsForTenant(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<OperationsRepositoryResult<readonly LeadAssignment[]>> {
  const { data, error } = await supabase
    .from("yzi_imob_lead_assignments")
    .select(ASSIGNMENT_COLUMNS)
    .eq("tenant_id", tenantId)
    .order("assigned_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) return { status: "error", code: "read_failed", detail: error.message };

  const rows = ((data as unknown as AssignmentRow[] | null) ?? []);
  const leadIds = Array.from(new Set(rows.map((row) => row.lead_id)));
  const [leadNames, brokerNames] = await Promise.all([
    listLeadNamesById(supabase, tenantId, leadIds),
    getBrokerNameMapForAssignments(supabase, tenantId, rows),
  ]);

  if (leadNames.status === "error") return leadNames;
  if (brokerNames.status === "error") return brokerNames;

  return {
    status: "ok",
    value: rows.map((row) => mapLeadAssignment(row, leadNames.value, brokerNames.value)),
  };
}

export async function listEligibleBrokersForTenant(
  supabase: SupabaseClient,
  tenantId: string,
  actorUserId?: string,
): Promise<OperationsRepositoryResult<readonly EligibleBroker[]>> {
  const [membersResult, profilesResult] = await Promise.all([
    supabase.rpc("list_yzi_imob_team_members"),
    supabase
      .from("tenant_member_profiles")
      .select("user_id, display_name, membership_id")
      .eq("tenant_id", tenantId)
      .order("display_name", { ascending: true }),
  ]);

  if (membersResult.error || profilesResult.error || !membersResult.data) {
    return {
      status: "error",
      code: "read_failed",
      detail: membersResult.error?.message ?? profilesResult.error?.message,
    };
  }

  const eligibleMembershipIds = new Set(
    (
      membersResult.data as Array<{
        member_id: string;
        is_self: boolean;
        operational_availability: string;
        role: string;
        status: string;
      }>
    )
      .filter(
        (member) =>
          member.status === "active" &&
          member.role !== "viewer" &&
          member.operational_availability === "available",
      )
      .map((member) => member.member_id),
  );
  const selfMember = (
    membersResult.data as Array<{
      member_id: string;
      is_self: boolean;
      operational_availability: string;
      role: string;
      status: string;
    }>
  ).find(
    (member) =>
      member.is_self &&
      member.status === "active" &&
      member.role !== "viewer" &&
      member.operational_availability === "available",
  );

  return {
    status: "ok",
    value: [
      ...(
      (profilesResult.data as {
        user_id: string;
        display_name: string | null;
        membership_id: string;
      }[] | null) ?? []
    )
      .filter((row) => eligibleMembershipIds.has(row.membership_id))
      .map((row) => ({
        userId: row.user_id,
        displayName: trimOrNull(row.display_name),
      })),
      ...(actorUserId &&
      selfMember &&
      !(
        (profilesResult.data as { membership_id: string }[] | null) ?? []
      ).some((profile) => profile.membership_id === selfMember.member_id)
        ? [{ userId: actorUserId, displayName: null }]
        : []),
    ],
  };
}

async function getLeadRow(
  supabase: SupabaseClient,
  tenantId: string,
  leadId: string,
): Promise<OperationsRepositoryResult<LeadRow>> {
  const { data, error } = await supabase
    .from("yzi_imob_leads")
    .select(LEAD_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("id", leadId)
    .maybeSingle();

  if (error) return { status: "error", code: "read_failed", detail: error.message };
  if (!data) return { status: "error", code: "lead_not_found" };
  return { status: "ok", value: data as LeadRow };
}

async function validateBrokerMembership(
  supabase: SupabaseClient,
  tenantId: string,
  brokerUserId: string,
): Promise<OperationsRepositoryResult<void>> {
  const { data, error } = await supabase
    .from("tenant_memberships")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("user_id", brokerUserId)
    .eq("status", "active")
    .maybeSingle();

  if (error) return { status: "error", code: "read_failed", detail: error.message };
  if (!data) return { status: "error", code: "broker_not_found" };
  return { status: "ok", value: undefined };
}

export async function assignLeadToBroker(
  supabase: SupabaseClient,
  tenantId: string,
  actorUserId: string,
  input: CreateLeadAssignmentInput,
): Promise<OperationsRepositoryResult<LeadAssignment>> {
  if (!trimOrNull(input.source)) {
    return { status: "error", code: "invalid_input" };
  }

  const [leadResult, brokerResult] = await Promise.all([
    getLeadRow(supabase, tenantId, input.leadId),
    validateBrokerMembership(supabase, tenantId, input.brokerUserId),
  ]);
  if (leadResult.status === "error") return leadResult;
  if (brokerResult.status === "error") return brokerResult;

  const { data: currentActive, error: currentActiveError } = await supabase
    .from("yzi_imob_lead_assignments")
    .select(ASSIGNMENT_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("lead_id", input.leadId)
    .in("status", ["assigned", "accepted"])
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (currentActiveError) {
    return { status: "error", code: "read_failed", detail: currentActiveError.message };
  }

  if (currentActive) {
    const { error: closeError } = await supabase
      .from("yzi_imob_lead_assignments")
      .update({
        status: "reassigned",
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_id", tenantId)
      .eq("id", (currentActive as unknown as AssignmentRow).id);

    if (closeError) return { status: "error", code: "update_failed", detail: closeError.message };
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("yzi_imob_lead_assignments")
    .insert({
      tenant_id: tenantId,
      lead_id: input.leadId,
      broker_user_id: input.brokerUserId,
      status: "assigned",
      source: input.source.trim(),
      notes: trimOrNull(input.notes),
      expires_at: input.expiresAt ?? null,
      assigned_at: now,
      created_by_user_id: actorUserId,
      updated_at: now,
    })
    .select(ASSIGNMENT_COLUMNS)
    .single();

  if (error || !data) {
    if (currentActive) {
      const previous = currentActive as unknown as AssignmentRow;
      await supabase
        .from("yzi_imob_lead_assignments")
        .update({
          status: previous.status,
          updated_at: new Date().toISOString(),
        })
        .eq("tenant_id", tenantId)
        .eq("id", previous.id)
        .eq("status", "reassigned");
    }
    return { status: "error", code: "insert_failed", detail: error?.message };
  }

  const upsertTask = await upsertFollowUpTaskForAssignment(
    supabase,
    tenantId,
    data as unknown as AssignmentRow,
  );
  if (upsertTask.status === "error") return upsertTask;

  const brokerNameMap = await listBrokerNamesByUserId(supabase, tenantId, [input.brokerUserId]);
  if (brokerNameMap.status === "error") return brokerNameMap;

  return {
    status: "ok",
    value: mapLeadAssignment(
      data as unknown as AssignmentRow,
      new Map([[leadResult.value.id, trimOrNull(leadResult.value.full_name) ?? "Ainda sem dados"]]),
      brokerNameMap.value,
    ),
  };
}

async function upsertFollowUpTaskForAssignment(
  supabase: SupabaseClient,
  tenantId: string,
  assignment: AssignmentRow,
): Promise<OperationsRepositoryResult<void>> {
  if (!assignment.expires_at || assignment.status !== "assigned") {
    return { status: "ok", value: undefined };
  }

  const existing = await supabase
    .from("yzi_imob_follow_up_tasks")
    .select(FOLLOW_UP_TASK_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("assignment_id", assignment.id)
    .eq("kind", "assignment_response_due")
    .in("status", ["pending", "processing"])
    .maybeSingle();

  if (existing.error) return { status: "error", code: "read_failed", detail: existing.error.message };

  if (existing.data) {
    const { error } = await supabase
      .from("yzi_imob_follow_up_tasks")
      .update({
        due_at: assignment.expires_at,
        updated_at: new Date().toISOString(),
        notes: trimOrNull(assignment.notes),
      })
      .eq("tenant_id", tenantId)
      .eq("id", (existing.data as unknown as FollowUpTaskRow).id);

    if (error) return { status: "error", code: "update_failed", detail: error.message };
    return { status: "ok", value: undefined };
  }

  const { error } = await supabase.from("yzi_imob_follow_up_tasks").insert({
    tenant_id: tenantId,
    lead_id: assignment.lead_id,
    assignment_id: assignment.id,
    kind: "assignment_response_due",
    status: "pending",
    due_at: assignment.expires_at,
    notes: trimOrNull(assignment.notes),
    source: "lead_assignment",
    metadata: { broker_user_id: assignment.broker_user_id },
  });

  if (error) return { status: "error", code: "insert_failed", detail: error.message };
  return { status: "ok", value: undefined };
}

export async function respondToLeadAssignment(
  supabase: SupabaseClient,
  tenantId: string,
  actorUserId: string,
  assignmentId: string,
  decision: "accepted" | "declined",
): Promise<OperationsRepositoryResult<LeadAssignment>> {
  const status: LeadAssignmentStatus = decision;
  if (!LEAD_ASSIGNMENT_STATUS_VALUES.includes(status)) {
    return { status: "error", code: "invalid_status" };
  }

  const now = new Date().toISOString();
  const patch =
    decision === "accepted"
      ? { status, accepted_at: now, declined_at: null, updated_at: now }
      : { status, declined_at: now, accepted_at: null, updated_at: now };

  const { data, error } = await supabase
    .from("yzi_imob_lead_assignments")
    .update(patch)
    .eq("tenant_id", tenantId)
    .eq("id", assignmentId)
    .eq("broker_user_id", actorUserId)
    .eq("status", "assigned")
    .select(ASSIGNMENT_COLUMNS)
    .maybeSingle();

  if (error) return { status: "error", code: "update_failed", detail: error.message };
  if (!data) return { status: "error", code: "not_found" };

  const assignment = data as unknown as AssignmentRow;
  const { error: taskError } = await supabase
    .from("yzi_imob_follow_up_tasks")
    .update({
      status: decision === "accepted" ? "completed" : "cancelled",
      completed_at: now,
      updated_at: now,
    })
    .eq("tenant_id", tenantId)
    .eq("assignment_id", assignment.id)
    .eq("kind", "assignment_response_due")
    .in("status", ["pending", "processing"]);

  if (taskError) return { status: "error", code: "update_failed", detail: taskError.message };

  const [leadNames, brokerNames] = await Promise.all([
    listLeadNamesById(supabase, tenantId, [assignment.lead_id]),
    listBrokerNamesByUserId(supabase, tenantId, [assignment.broker_user_id]),
  ]);

  if (leadNames.status === "error") return leadNames;
  if (brokerNames.status === "error") return brokerNames;

  return {
    status: "ok",
    value: mapLeadAssignment(assignment, leadNames.value, brokerNames.value),
  };
}

export async function getLeadOperationalPacket(
  supabase: SupabaseClient,
  tenantId: string,
  leadId: string,
): Promise<OperationsRepositoryResult<LeadOperationalPacket>> {
  const leadResult = await getLeadRow(supabase, tenantId, leadId);
  if (leadResult.status === "error") return leadResult;

  const lead = leadResult.value;

  const [propertyInterest, assignmentResult, conversationResult, appointmentResult] = await Promise.all([
    supabase
      .from("yzi_imob_property_interests")
      .select("property_id")
      .eq("tenant_id", tenantId)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("yzi_imob_lead_assignments")
      .select(ASSIGNMENT_COLUMNS)
      .eq("tenant_id", tenantId)
      .eq("lead_id", leadId)
      .in("status", ["assigned", "accepted"])
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("yzi_imob_conversations")
      .select(CONVERSATION_COLUMNS)
      .eq("tenant_id", tenantId)
      .eq("lead_id", leadId)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("yzi_imob_appointments")
      .select(APPOINTMENT_COLUMNS)
      .eq("tenant_id", tenantId)
      .eq("lead_id", leadId)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (propertyInterest.error) return { status: "error", code: "read_failed", detail: propertyInterest.error.message };
  if (assignmentResult.error) return { status: "error", code: "read_failed", detail: assignmentResult.error.message };
  if (conversationResult.error) return { status: "error", code: "read_failed", detail: conversationResult.error.message };
  if (appointmentResult.error) return { status: "error", code: "read_failed", detail: appointmentResult.error.message };

  const propertyId = (propertyInterest.data as { property_id: string | null } | null)?.property_id ?? null;
  const conversation = conversationResult.data as ConversationRow | null;
  const appointment = appointmentResult.data as AppointmentPacketRow | null;

  const [propertyResult, messageResult, assignmentHydrated, brokerNames] = await Promise.all([
    propertyId
      ? supabase
          .from("yzi_imob_properties")
          .select(PROPERTY_COLUMNS)
          .eq("tenant_id", tenantId)
          .eq("id", propertyId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    conversation
      ? supabase
          .from("yzi_imob_messages")
          .select(MESSAGE_COLUMNS)
          .eq("tenant_id", tenantId)
          .eq("conversation_id", conversation.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    assignmentResult.data
      ? listLeadNamesById(supabase, tenantId, [leadId])
      : Promise.resolve({ status: "ok", value: new Map() } as OperationsRepositoryResult<Map<string, string>>),
    assignmentResult.data
      ? listBrokerNamesByUserId(
          supabase,
          tenantId,
          [(assignmentResult.data as unknown as AssignmentRow).broker_user_id],
        )
      : Promise.resolve({ status: "ok", value: new Map() } as OperationsRepositoryResult<Map<string, string>>),
  ]);

  if ("error" in propertyResult && propertyResult.error) {
    return { status: "error", code: "read_failed", detail: propertyResult.error.message };
  }
  if ("error" in messageResult && messageResult.error) {
    return { status: "error", code: "read_failed", detail: messageResult.error.message };
  }
  if (assignmentHydrated.status === "error") return assignmentHydrated;
  if (brokerNames.status === "error") return brokerNames;

  const property = propertyResult.data as unknown as PropertyRow | null;
  const latestMessage = messageResult.data as unknown as MessageRow | null;
  const assignment =
    assignmentResult.data && assignmentHydrated.status === "ok" && brokerNames.status === "ok"
      ? mapLeadAssignment(
          assignmentResult.data as unknown as AssignmentRow,
          assignmentHydrated.value,
          brokerNames.value,
        )
      : null;

  return {
    status: "ok",
    value: {
      leadId: lead.id,
      leadName: trimOrNull(lead.full_name),
      leadPhone: trimOrNull(lead.phone),
      leadEmail: trimOrNull(lead.email),
      leadStatus: trimOrNull(lead.status),
      leadTemperature: trimOrNull(lead.temperature),
      leadScore: lead.score,
      propertyId,
      propertyTitle: trimOrNull(property?.title),
      assignment,
      latestConversationId: conversation?.id ?? null,
      latestConversationAt: conversation?.last_message_at ?? conversation?.updated_at ?? null,
      latestConversationBody: trimOrNull(latestMessage?.body),
      nextAppointmentId: appointment?.id ?? null,
      nextAppointmentStartsAt: appointment?.starts_at ?? null,
      nextAppointmentStatus: trimOrNull(appointment?.status),
      nextAppointmentTitle: trimOrNull(appointment?.title),
    },
  };
}

export async function recordVisitFeedback(
  supabase: SupabaseClient,
  tenantId: string,
  input: RecordVisitFeedbackInput,
): Promise<OperationsRepositoryResult<VisitFeedback>> {
  if (
    !VISIT_FEEDBACK_ATTENDANCE_VALUES.includes(input.clientAttendance) ||
    !VISIT_FEEDBACK_OUTCOME_VALUES.includes(input.outcome)
  ) {
    return { status: "error", code: "invalid_input" };
  }

  const feedbackAt = input.feedbackAt ?? new Date().toISOString();
  const { data, error } = await supabase
    .from("yzi_imob_visit_feedback")
    .upsert(
      {
        tenant_id: tenantId,
        appointment_id: input.appointmentId,
        lead_id: input.leadId ?? null,
        property_id: input.propertyId ?? null,
        broker_user_id: input.brokerUserId ?? null,
        client_attendance: input.clientAttendance,
        outcome: input.outcome,
        observation: trimOrNull(input.observation),
        next_action: trimOrNull(input.nextAction),
        next_action_at: input.nextActionAt ?? null,
        feedback_at: feedbackAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,appointment_id" },
    )
    .select(VISIT_FEEDBACK_COLUMNS)
    .single();

  if (error || !data) return { status: "error", code: "insert_failed", detail: error?.message };

  const taskResult = await upsertFollowUpTaskFromFeedback(
    supabase,
    tenantId,
    data as unknown as VisitFeedbackRow,
  );
  if (taskResult.status === "error") return taskResult;

  const brokerNames = await listBrokerNamesByUserId(
    supabase,
    tenantId,
    input.brokerUserId ? [input.brokerUserId] : [],
  );
  if (brokerNames.status === "error") return brokerNames;

  return {
    status: "ok",
    value: mapVisitFeedback(data as unknown as VisitFeedbackRow, brokerNames.value),
  };
}

async function upsertFollowUpTaskFromFeedback(
  supabase: SupabaseClient,
  tenantId: string,
  feedback: VisitFeedbackRow,
): Promise<OperationsRepositoryResult<void>> {
  const dueAt = feedback.next_action_at;
  const now = new Date().toISOString();

  const { data: existing, error: existingError } = await supabase
    .from("yzi_imob_follow_up_tasks")
    .select(FOLLOW_UP_TASK_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("appointment_id", feedback.appointment_id)
    .eq("kind", "next_action_due")
    .in("status", ["pending", "processing", "failed"])
    .maybeSingle();

  if (existingError) return { status: "error", code: "read_failed", detail: existingError.message };

  if (!dueAt) {
    if (!existing) return { status: "ok", value: undefined };
    const { error } = await supabase
      .from("yzi_imob_follow_up_tasks")
      .update({ status: "completed", completed_at: now, updated_at: now })
      .eq("tenant_id", tenantId)
      .eq("id", (existing as unknown as FollowUpTaskRow).id);

    if (error) return { status: "error", code: "update_failed", detail: error.message };
    return { status: "ok", value: undefined };
  }

  if (existing) {
    const { error } = await supabase
      .from("yzi_imob_follow_up_tasks")
      .update({
        lead_id: feedback.lead_id,
        appointment_id: feedback.appointment_id,
        due_at: dueAt,
        notes: trimOrNull(feedback.next_action) ?? trimOrNull(feedback.observation),
        updated_at: now,
        status: "pending",
        completed_at: null,
      })
      .eq("tenant_id", tenantId)
      .eq("id", (existing as unknown as FollowUpTaskRow).id);

    if (error) return { status: "error", code: "update_failed", detail: error.message };
    return { status: "ok", value: undefined };
  }

  const { error } = await supabase.from("yzi_imob_follow_up_tasks").insert({
    tenant_id: tenantId,
    lead_id: feedback.lead_id,
    appointment_id: feedback.appointment_id,
    kind: "next_action_due",
    status: "pending",
    channel: null,
    due_at: dueAt,
    notes: trimOrNull(feedback.next_action) ?? trimOrNull(feedback.observation),
    source: "visit_feedback",
    metadata: { outcome: feedback.outcome, client_attendance: feedback.client_attendance },
  });

  if (error) return { status: "error", code: "insert_failed", detail: error.message };
  return { status: "ok", value: undefined };
}

export async function listFollowUpTasksForTenant(
  supabase: SupabaseClient,
  tenantId: string,
  kind?: FollowUpTaskKind,
): Promise<OperationsRepositoryResult<readonly FollowUpTask[]>> {
  let query = supabase
    .from("yzi_imob_follow_up_tasks")
    .select(FOLLOW_UP_TASK_COLUMNS)
    .eq("tenant_id", tenantId)
    .order("due_at", { ascending: true })
    .order("created_at", { ascending: true });

  if (kind) {
    if (!FOLLOW_UP_TASK_KIND_VALUES.includes(kind)) {
      return { status: "error", code: "invalid_input" };
    }
    query = query.eq("kind", kind);
  }

  const { data, error } = await query;
  if (error) return { status: "error", code: "read_failed", detail: error.message };

  return {
    status: "ok",
    value: ((data as unknown as FollowUpTaskRow[] | null) ?? []).map(mapFollowUpTask),
  };
}

export async function markFollowUpTaskStatus(
  supabase: SupabaseClient,
  tenantId: string,
  taskId: string,
  status: FollowUpTask["status"],
): Promise<OperationsRepositoryResult<FollowUpTask>> {
  if (!FOLLOW_UP_TASK_STATUS_VALUES.includes(status as (typeof FOLLOW_UP_TASK_STATUS_VALUES)[number])) {
    return { status: "error", code: "invalid_status" };
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("yzi_imob_follow_up_tasks")
    .update({
      status,
      updated_at: now,
      completed_at: status === "completed" || status === "cancelled" ? now : null,
      last_attempt_at: status === "processing" || status === "failed" ? now : null,
    })
    .eq("tenant_id", tenantId)
    .eq("id", taskId)
    .select(FOLLOW_UP_TASK_COLUMNS)
    .maybeSingle();

  if (error) return { status: "error", code: "update_failed", detail: error.message };
  if (!data) return { status: "error", code: "not_found" };

  return { status: "ok", value: mapFollowUpTask(data as unknown as FollowUpTaskRow) };
}

export async function listVisitFeedbackForTenant(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<OperationsRepositoryResult<readonly VisitFeedback[]>> {
  const { data, error } = await supabase
    .from("yzi_imob_visit_feedback")
    .select(VISIT_FEEDBACK_COLUMNS)
    .eq("tenant_id", tenantId)
    .order("feedback_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) return { status: "error", code: "read_failed", detail: error.message };

  const rows = ((data as unknown as VisitFeedbackRow[] | null) ?? []);
  const brokerIds = Array.from(
    new Set(rows.map((row) => row.broker_user_id).filter((value): value is string => Boolean(value))),
  );
  const brokerNames = await listBrokerNamesByUserId(supabase, tenantId, brokerIds);
  if (brokerNames.status === "error") return brokerNames;

  return { status: "ok", value: rows.map((row) => mapVisitFeedback(row, brokerNames.value)) };
}

export async function listAppointmentsMissingFeedback(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<OperationsRepositoryResult<readonly YziImobAppointment[]>> {
  const { data, error } = await supabase
    .from("yzi_imob_appointments")
    .select(APPOINTMENT_LIST_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("status", "completed")
    .order("starts_at", { ascending: false });

  if (error) return { status: "error", code: "read_failed", detail: error.message };

  const appointmentRows = ((data as unknown as AppointmentListRow[] | null) ?? []);
  const appointments: YziImobAppointment[] = appointmentRows.map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    leadId: row.lead_id,
    leadName: null,
    propertyId: row.property_id,
    propertyTitle: null,
    brokerUserId: row.broker_user_id,
    brokerName: null,
    title: trimOrNull(row.title) ?? "Ainda sem dados",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: trimOrNull(row.status) ?? "scheduled",
    confirmationStatus: trimOrNull(row.confirmation_status) ?? "pending",
    source: trimOrNull(row.source),
    notes: trimOrNull(row.notes),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
  if (appointments.length === 0) return { status: "ok", value: [] };

  const { data: feedbackRows, error: feedbackError } = await supabase
    .from("yzi_imob_visit_feedback")
    .select("appointment_id")
    .eq("tenant_id", tenantId)
    .in(
      "appointment_id",
      appointments.map((appointment) => appointment.id),
    );

  if (feedbackError) return { status: "error", code: "read_failed", detail: feedbackError.message };

  const covered = new Set(
    ((feedbackRows as { appointment_id: string }[] | null) ?? []).map((row) => row.appointment_id),
  );

  return {
    status: "ok",
    value: appointments.filter((appointment) => !covered.has(appointment.id)),
  };
}

export async function getLeadOperationsWorkspace(
  supabase: SupabaseClient,
  tenantId: string,
  leadId: string,
  actorUserId?: string,
): Promise<OperationsRepositoryResult<LeadOperationsWorkspace>> {
  const [
    packetResult,
    assignmentsResult,
    eligibleBrokersResult,
    appointmentsResult,
    feedbackResult,
    followUpsResult,
  ] = await Promise.all([
    getLeadOperationalPacket(supabase, tenantId, leadId),
    listLeadAssignmentsForTenant(supabase, tenantId),
    listEligibleBrokersForTenant(supabase, tenantId, actorUserId),
    listAppointmentsForTenant(supabase, tenantId),
    listVisitFeedbackForTenant(supabase, tenantId),
    listFollowUpTasksForTenant(supabase, tenantId),
  ]);

  if (packetResult.status === "error") return packetResult;
  if (assignmentsResult.status === "error") return assignmentsResult;
  if (eligibleBrokersResult.status === "error") return eligibleBrokersResult;
  if (appointmentsResult.status === "error") {
    return { status: "error", code: "read_failed", detail: appointmentsResult.detail };
  }
  if (feedbackResult.status === "error") return feedbackResult;
  if (followUpsResult.status === "error") return followUpsResult;

  const assignments = assignmentsResult.value.filter(
    (assignment) => assignment.leadId === leadId,
  );
  const assignmentIds = new Set(assignments.map((assignment) => assignment.id));
  const appointments = appointmentsResult.value.items.filter(
    (appointment) => appointment.leadId === leadId,
  );
  const appointmentIds = new Set(appointments.map((appointment) => appointment.id));

  return {
    status: "ok",
    value: {
      packet: packetResult.value,
      assignments,
      eligibleBrokers: eligibleBrokersResult.value,
      appointments,
      feedback: feedbackResult.value.filter((item) => item.leadId === leadId),
      followUps: followUpsResult.value.filter(
        (task) =>
          task.leadId === leadId ||
          (task.assignmentId !== null && assignmentIds.has(task.assignmentId)) ||
          (task.appointmentId !== null && appointmentIds.has(task.appointmentId)),
      ),
    },
  };
}
