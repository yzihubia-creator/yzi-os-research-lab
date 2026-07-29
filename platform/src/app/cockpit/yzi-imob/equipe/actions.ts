"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/auth/session";
import {
  createTeamInvitation,
  revokeTeamInvitation,
  updateTeamMemberAvailability,
  updateTeamMemberRole,
  updateTeamMemberStatus,
  type CreateTeamInvitationInput,
  type TeamMutationResult,
} from "@/lib/tenant/team-access";
import type { TeamAccessActionState } from "./action-state";

const TEAM_PATH = "/cockpit/yzi-imob/equipe";

function result(
  previous: TeamAccessActionState,
  mutation: TeamMutationResult,
): TeamAccessActionState {
  return {
    status: mutation.status === "ok" ? "saved" : "error",
    message: mutation.message,
    revision: previous.revision + 1,
  };
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function requireId(formData: FormData, key: string): string | null {
  const value = readText(formData, key);
  return value.length > 0 ? value : null;
}

async function getAuthenticatedSupabase() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login");
  }
  return supabase;
}

export async function createTeamInvitationAction(
  previous: TeamAccessActionState,
  formData: FormData,
): Promise<TeamAccessActionState> {
  const input: CreateTeamInvitationInput = {
    name: readText(formData, "name"),
    email: readText(formData, "email").toLowerCase(),
    whatsapp: readText(formData, "whatsapp"),
    roleIntent: readText(formData, "roleIntent"),
    membershipRole: readText(formData, "membershipRole") || "operator",
  };

  const supabase = await getAuthenticatedSupabase();
  const mutation = await createTeamInvitation(supabase, input);
  if (mutation.status === "ok") revalidatePath(TEAM_PATH);
  return result(previous, mutation);
}

export async function revokeTeamInvitationAction(
  previous: TeamAccessActionState,
  formData: FormData,
): Promise<TeamAccessActionState> {
  const invitationId = requireId(formData, "invitationId");
  if (!invitationId) {
    return result(previous, { status: "invalid", message: "Convite inválido." });
  }

  const supabase = await getAuthenticatedSupabase();
  const mutation = await revokeTeamInvitation(supabase, invitationId);
  if (mutation.status === "ok") revalidatePath(TEAM_PATH);
  return result(previous, mutation);
}

export async function updateTeamMemberRoleAction(
  previous: TeamAccessActionState,
  formData: FormData,
): Promise<TeamAccessActionState> {
  const memberId = requireId(formData, "memberId");
  const role = readText(formData, "role");
  if (!memberId || !role) {
    return result(previous, { status: "invalid", message: "Função inválida." });
  }

  const supabase = await getAuthenticatedSupabase();
  const mutation = await updateTeamMemberRole(supabase, memberId, role);
  if (mutation.status === "ok") revalidatePath(TEAM_PATH);
  return result(previous, mutation);
}

export async function updateTeamMemberStatusAction(
  previous: TeamAccessActionState,
  formData: FormData,
): Promise<TeamAccessActionState> {
  const memberId = requireId(formData, "memberId");
  const status = readText(formData, "status");
  if (!memberId || !status) {
    return result(previous, { status: "invalid", message: "Status inválido." });
  }

  const supabase = await getAuthenticatedSupabase();
  const mutation = await updateTeamMemberStatus(supabase, memberId, status);
  if (mutation.status === "ok") revalidatePath(TEAM_PATH);
  return result(previous, mutation);
}

export async function updateTeamMemberAvailabilityAction(
  previous: TeamAccessActionState,
  formData: FormData,
): Promise<TeamAccessActionState> {
  const memberId = requireId(formData, "memberId");
  const availability = readText(formData, "availability");
  if (!memberId || !availability) {
    return result(previous, { status: "invalid", message: "Disponibilidade inválida." });
  }

  const supabase = await getAuthenticatedSupabase();
  const mutation = await updateTeamMemberAvailability(supabase, memberId, availability);
  if (mutation.status === "ok") revalidatePath(TEAM_PATH);
  return result(previous, mutation);
}
