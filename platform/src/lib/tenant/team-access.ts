import type { SupabaseClient } from "@supabase/supabase-js";

// Equipe e Acessos YZI IMOB v1 — backend governado.
//
// A listagem de membros e as mutações reais passam por RPCs que resolvem o
// tenant ativo pelo auth.uid(). O cliente nunca envia tenant_id, user_id,
// role atual ou status atual como autoridade; envia apenas o alvo necessário
// (member_id/invitation_id) e o valor solicitado, que a RPC valida de novo.

export type TeamSelfMembership = {
  memberId: string;
  role: string;
  status: string;
  since: string;
  operationalAvailability: string;
};

export type TeamMember = {
  id: string;
  name: string;
  phone: string;
  jobTitle: string;
  avatarAssetRef: string | null;
  regions: string[];
  specialties: string[];
  propertyTypes: string[];
  operationalAvailability: string;
  role: string;
  status: string;
  since: string;
  updatedAt: string;
  isSelf: boolean;
};

export type TeamOwnerRecord = {
  name: string;
  phone: string;
  roleTitle: string;
  teamSetupMode: "agora" | "depois";
  completedAt: string | null;
};

export type TeamInvitation = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  roleIntent: string;
  membershipRole: string;
  status: string;
  createdAt: string;
  invitedByMe: boolean;
};

export type TeamAccessViewModel = {
  self: TeamSelfMembership;
  owner: TeamOwnerRecord | null;
  canSeeInvitations: boolean;
  canManageTeam: boolean;
  members: TeamMember[];
  invitations: TeamInvitation[];
};

export type TeamAccessResult =
  | { status: "ok"; team: TeamAccessViewModel }
  | { status: "error" };

export type TeamMutationResult =
  | { status: "ok"; message: string }
  | { status: "invalid"; message: string }
  | { status: "forbidden"; message: string }
  | { status: "error"; message: string };

export type CreateTeamInvitationInput = {
  name: string;
  email: string;
  whatsapp: string;
  roleIntent: string;
  membershipRole: string;
};

const GENERIC_ERROR = "Não foi possível concluir a ação agora. Nada foi alterado na interface.";

function text(value: string | null | undefined): string {
  return value ?? "";
}

function normalizeRpcError(error: { code?: string; message?: string } | null): TeamMutationResult {
  if (!error) return { status: "error", message: GENERIC_ERROR };
  if (error.code === "22023" || error.code === "23505") {
    return { status: "invalid", message: error.message ?? GENERIC_ERROR };
  }
  if (error.code === "42501" || error.code === "28000") {
    return { status: "forbidden", message: error.message ?? GENERIC_ERROR };
  }
  return { status: "error", message: error.message ?? GENERIC_ERROR };
}

/**
 * Monta o view model de Equipe e Acessos com a RPC governada de listagem.
 */
export async function getTeamAccess(
  supabase: SupabaseClient,
  tenantId: string,
  userId: string,
  role: string,
): Promise<TeamAccessResult> {
  const canManageTeam = role === "owner" || role === "admin";
  const canSeeInvitations = canManageTeam;

  const [membersRes, stateRes, invitesRes] = await Promise.all([
    supabase.rpc("list_yzi_imob_team_members"),
    supabase
      .from("tenant_onboarding_state")
      .select(
        "completed_at, owner_display_name, owner_phone, owner_role_title, team_setup_mode",
      )
      .eq("tenant_id", tenantId)
      .maybeSingle(),
    supabase
      .from("tenant_team_invitations")
      .select(
        "id, name, email, whatsapp, role_intent, membership_role, status, created_at, invited_by",
      )
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true }),
  ]);

  if (membersRes.error || stateRes.error || !membersRes.data) {
    return { status: "error" };
  }

  const memberRows = membersRes.data as Array<{
    member_id: string;
    display_name: string;
    phone: string | null;
    job_title: string | null;
    avatar_asset_ref: string | null;
    regions: string[];
    specialties: string[];
    property_types: string[];
    operational_availability: string;
    role: string;
    status: string;
    since: string;
    updated_at: string;
    is_self: boolean;
  }>;

  const members: TeamMember[] = memberRows.map((row) => ({
    id: row.member_id,
    name: row.display_name,
    phone: text(row.phone),
    jobTitle: text(row.job_title),
    avatarAssetRef: row.avatar_asset_ref,
    regions: row.regions,
    specialties: row.specialties,
    propertyTypes: row.property_types,
    operationalAvailability: row.operational_availability,
    role: row.role,
    status: row.status,
    since: row.since,
    updatedAt: row.updated_at,
    isSelf: row.is_self,
  }));

  const self = members.find((member) => member.isSelf);
  if (!self) {
    return { status: "error" };
  }

  const stateRow = stateRes.data as {
    completed_at: string | null;
    owner_display_name: string | null;
    owner_phone: string | null;
    owner_role_title: string | null;
    team_setup_mode: string;
  } | null;

  const inviteRows = (invitesRes.error ? [] : (invitesRes.data ?? [])) as Array<{
    id: string;
    name: string;
    email: string | null;
    whatsapp: string | null;
    role_intent: string | null;
    membership_role: string | null;
    status: string;
    created_at: string;
    invited_by: string;
  }>;

  return {
    status: "ok",
    team: {
      self: {
        memberId: self.id,
        role: self.role,
        status: self.status,
        since: self.since,
        operationalAvailability: self.operationalAvailability,
      },
      owner: stateRow
        ? {
            name: text(stateRow.owner_display_name),
            phone: text(stateRow.owner_phone),
            roleTitle: text(stateRow.owner_role_title),
            teamSetupMode: stateRow.team_setup_mode === "agora" ? "agora" : "depois",
            completedAt: stateRow.completed_at,
          }
        : null,
      canSeeInvitations,
      canManageTeam,
      members,
      invitations: inviteRows.map((row) => ({
        id: row.id,
        name: row.name,
        email: text(row.email),
        whatsapp: text(row.whatsapp),
        roleIntent: text(row.role_intent),
        membershipRole: row.membership_role ?? "operator",
        status: row.status,
        createdAt: row.created_at,
        invitedByMe: row.invited_by === userId,
      })),
    },
  };
}

export async function createTeamInvitation(
  supabase: SupabaseClient,
  input: CreateTeamInvitationInput,
): Promise<TeamMutationResult> {
  const { error } = await supabase.rpc("create_yzi_imob_team_invitation", {
    p_name: input.name,
    p_email: input.email,
    p_whatsapp: input.whatsapp || null,
    p_role_intent: input.roleIntent || null,
    p_membership_role: input.membershipRole || "operator",
  });

  if (error) return normalizeRpcError(error);
  return {
    status: "ok",
    message: "Convite registrado. Nenhum e-mail foi enviado porque o provedor ainda não está conectado.",
  };
}

export async function revokeTeamInvitation(
  supabase: SupabaseClient,
  invitationId: string,
): Promise<TeamMutationResult> {
  const { error } = await supabase.rpc("revoke_yzi_imob_team_invitation", {
    p_invitation_id: invitationId,
  });

  if (error) return normalizeRpcError(error);
  return { status: "ok", message: "Convite cancelado. O histórico foi preservado." };
}

export async function updateTeamMemberRole(
  supabase: SupabaseClient,
  memberId: string,
  role: string,
): Promise<TeamMutationResult> {
  const { error } = await supabase.rpc("update_yzi_imob_team_member_role", {
    p_member_id: memberId,
    p_role: role,
  });

  if (error) return normalizeRpcError(error);
  return { status: "ok", message: "Função atualizada." };
}

export async function updateTeamMemberStatus(
  supabase: SupabaseClient,
  memberId: string,
  status: string,
): Promise<TeamMutationResult> {
  const { error } = await supabase.rpc("update_yzi_imob_team_member_status", {
    p_member_id: memberId,
    p_status: status,
  });

  if (error) return normalizeRpcError(error);
  return { status: "ok", message: status === "active" ? "Acesso reativado." : "Acesso suspenso." };
}

export async function updateTeamMemberAvailability(
  supabase: SupabaseClient,
  memberId: string,
  availability: string,
): Promise<TeamMutationResult> {
  const { error } = await supabase.rpc("update_yzi_imob_team_member_availability", {
    p_member_id: memberId,
    p_operational_availability: availability,
  });

  if (error) return normalizeRpcError(error);
  return { status: "ok", message: "Disponibilidade atualizada." };
}
