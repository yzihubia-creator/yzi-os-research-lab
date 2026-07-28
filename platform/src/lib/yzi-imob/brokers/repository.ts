import type { SupabaseClient } from "@supabase/supabase-js";

import { listAppointmentsForTenant } from "@/lib/yzi-imob/agenda/repository";
import {
  getLeadOperationalPacket,
  listAppointmentsMissingFeedback,
  listFollowUpTasksForTenant,
  listLeadAssignmentsForTenant,
  listVisitFeedbackForTenant,
} from "@/lib/yzi-imob/operations/repository";
import type { LeadAssignment } from "@/lib/yzi-imob/operations/types";

import type {
  BrokerOperationalSummary,
  BrokerRepositoryResult,
  BrokerWorkspaceData,
} from "./types";

type TeamMemberRow = {
  member_id: string;
  display_name: string;
  operational_availability: string;
  role: string;
  status: string;
  is_self: boolean;
};

type MemberProfileRow = {
  membership_id: string;
  user_id: string;
};

function readFailure(detail?: string): {
  status: "error";
  code: "read_failed";
  detail?: string;
} {
  return { status: "error", code: "read_failed", detail };
}

function isActiveAssignment(assignment: LeadAssignment): boolean {
  return assignment.status === "assigned" || assignment.status === "accepted";
}

function isFutureAppointment(startsAt: string, status: string): boolean {
  return status !== "cancelled" && Date.parse(startsAt) >= Date.now();
}

async function listBrokerBaseRows(
  supabase: SupabaseClient,
  tenantId: string,
  actorUserId: string,
): Promise<
  BrokerRepositoryResult<
    readonly (TeamMemberRow & { userId: string })[]
  >
> {
  const [membersResult, profilesResult] = await Promise.all([
    supabase.rpc("list_yzi_imob_team_members"),
    supabase
      .from("tenant_member_profiles")
      .select("membership_id, user_id")
      .eq("tenant_id", tenantId),
  ]);

  if (membersResult.error || profilesResult.error || !membersResult.data) {
    return {
      status: "error",
      code: "read_failed",
      detail: membersResult.error?.message ?? profilesResult.error?.message,
    };
  }

  const userIdByMembershipId = new Map(
    ((profilesResult.data as MemberProfileRow[] | null) ?? []).map((profile) => [
      profile.membership_id,
      profile.user_id,
    ]),
  );

  const members = (membersResult.data as TeamMemberRow[])
    .map((member) => {
      const userId =
        userIdByMembershipId.get(member.member_id) ??
        (member.is_self ? actorUserId : undefined);
      return userId ? { ...member, userId } : null;
    })
    .filter((member): member is TeamMemberRow & { userId: string } => member !== null);

  return { status: "ok", value: members };
}

export async function listBrokersForTenant(
  supabase: SupabaseClient,
  tenantId: string,
  actorUserId: string,
): Promise<BrokerRepositoryResult<readonly BrokerOperationalSummary[]>> {
  const [
    brokersResult,
    assignmentsResult,
    appointmentsResult,
    missingFeedbackResult,
  ] = await Promise.all([
    listBrokerBaseRows(supabase, tenantId, actorUserId),
    listLeadAssignmentsForTenant(supabase, tenantId),
    listAppointmentsForTenant(supabase, tenantId),
    listAppointmentsMissingFeedback(supabase, tenantId),
  ]);

  if (brokersResult.status === "error") return brokersResult;
  if (assignmentsResult.status === "error") return readFailure(assignmentsResult.detail);
  if (appointmentsResult.status === "error") return readFailure(appointmentsResult.detail);
  if (missingFeedbackResult.status === "error") return readFailure(missingFeedbackResult.detail);

  return {
    status: "ok",
    value: brokersResult.value.map((broker) => {
      const assignments = assignmentsResult.value.filter(
        (assignment) => assignment.brokerUserId === broker.userId,
      );
      const appointments = appointmentsResult.value.items.filter(
        (appointment) => appointment.brokerUserId === broker.userId,
      );

      return {
        userId: broker.userId,
        membershipId: broker.member_id,
        name: broker.display_name?.trim() || "Ainda sem dados",
        role: broker.role,
        membershipStatus: broker.status,
        operationalAvailability: broker.operational_availability,
        activeLeadCount: assignments.filter(isActiveAssignment).length,
        futureVisitCount: appointments.filter((appointment) =>
          isFutureAppointment(appointment.startsAt, appointment.status),
        ).length,
        pendingAssignmentCount: assignments.filter(
          (assignment) => assignment.status === "assigned",
        ).length,
        missingFeedbackCount: missingFeedbackResult.value.filter(
          (appointment) => appointment.brokerUserId === broker.userId,
        ).length,
        isSelf: broker.is_self,
      };
    }),
  };
}

export async function getBrokerWorkspace(
  supabase: SupabaseClient,
  tenantId: string,
  actorUserId: string,
  brokerUserId: string,
): Promise<BrokerRepositoryResult<BrokerWorkspaceData>> {
  const [
    brokersResult,
    assignmentsResult,
    appointmentsResult,
    missingFeedbackResult,
    feedbackResult,
    followUpsResult,
  ] = await Promise.all([
    listBrokersForTenant(supabase, tenantId, actorUserId),
    listLeadAssignmentsForTenant(supabase, tenantId),
    listAppointmentsForTenant(supabase, tenantId),
    listAppointmentsMissingFeedback(supabase, tenantId),
    listVisitFeedbackForTenant(supabase, tenantId),
    listFollowUpTasksForTenant(supabase, tenantId),
  ]);

  if (brokersResult.status === "error") return brokersResult;
  if (assignmentsResult.status === "error") return readFailure(assignmentsResult.detail);
  if (appointmentsResult.status === "error") return readFailure(appointmentsResult.detail);
  if (missingFeedbackResult.status === "error") return readFailure(missingFeedbackResult.detail);
  if (feedbackResult.status === "error") return readFailure(feedbackResult.detail);
  if (followUpsResult.status === "error") return readFailure(followUpsResult.detail);

  const broker = brokersResult.value.find((item) => item.userId === brokerUserId);
  if (!broker) return { status: "error", code: "not_found" };

  const assignments = assignmentsResult.value.filter(
    (assignment) => assignment.brokerUserId === brokerUserId,
  );
  const activeLeadIds = Array.from(
    new Set(assignments.filter(isActiveAssignment).map((assignment) => assignment.leadId)),
  );
  const packetResults = await Promise.all(
    activeLeadIds.map((leadId) => getLeadOperationalPacket(supabase, tenantId, leadId)),
  );
  const failedPacket = packetResults.find((result) => result.status === "error");
  if (failedPacket?.status === "error") return readFailure(failedPacket.detail);

  const futureAppointments = appointmentsResult.value.items.filter(
    (appointment) =>
      appointment.brokerUserId === brokerUserId &&
      isFutureAppointment(appointment.startsAt, appointment.status),
  );
  const appointmentsMissingFeedback = missingFeedbackResult.value.filter(
    (appointment) => appointment.brokerUserId === brokerUserId,
  );
  const assignmentIds = new Set(assignments.map((assignment) => assignment.id));
  const appointmentIds = new Set(
    appointmentsResult.value.items
      .filter((appointment) => appointment.brokerUserId === brokerUserId)
      .map((appointment) => appointment.id),
  );
  const leadIds = new Set(assignments.map((assignment) => assignment.leadId));

  return {
    status: "ok",
    value: {
      broker,
      assignments,
      futureAppointments,
      appointmentsMissingFeedback,
      operationalPackets: packetResults.flatMap((result) =>
        result.status === "ok" ? [result.value] : [],
      ),
      feedback: feedbackResult.value.filter(
        (item) => item.brokerUserId === brokerUserId,
      ),
      followUps: followUpsResult.value.filter(
        (task) =>
          (task.assignmentId !== null && assignmentIds.has(task.assignmentId)) ||
          (task.appointmentId !== null && appointmentIds.has(task.appointmentId)) ||
          (task.leadId !== null && leadIds.has(task.leadId)),
      ),
    },
  };
}
