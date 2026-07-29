import type { SupabaseClient } from "@supabase/supabase-js";

// Configurações Operacionais YZI IMOB — leitura read-only, sob RLS, do mesmo
// estado persistido pelo Onboarding Operacional v1 (tenant_profiles,
// tenant_operation_settings, tenant_brand_settings,
// tenant_communication_settings, tenant_onboarding_state,
// tenant_team_invitations). Nenhuma escrita aqui; a escrita continua passando
// exclusivamente pela RPC governada `save_yzi_imob_onboarding_profile` via
// `saveYziImobOnboardingProfile`. O tenant_id vem SEMPRE do contexto resolvido
// no servidor (getTenantContext), nunca do navegador.

export type OperationalProfile = {
  companyName: string;
  tradeName: string;
  city: string;
  state: string;
  whatsapp: string;
  email: string;
  website: string;
  cnpj: string;
  operationType: string;
  hasLogo: boolean;
};

export type OperationalRules = {
  commercialFocus: string[];
  regions: string[];
  propertyTypes: string[];
  leadDistribution: string;
  standaloneCaptador: boolean;
  launchBelongsToOperation: boolean;
  captadorPriority: boolean;
  responseTimeMinutes: number | null;
};

export type OperationalBrand = {
  positioning: string;
  positioningCustom: string;
  audience: string[];
  tone: string;
  channels: string[];
};

export type OperationalCommunication = {
  serviceDays: string[];
  serviceStart: string;
  serviceEnd: string;
  afterHoursYzi: boolean;
  yziGoals: string[];
};

export type OperationalOwner = {
  name: string;
  phone: string;
  roleTitle: string;
  teamSetupMode: "agora" | "depois";
  completedAt: string | null;
};

export type OperationalInvitation = {
  id: string;
  onboardingPosition: number | null;
  name: string;
  email: string;
  whatsapp: string;
  roleIntent: string;
  status: string;
};

export type OperationalSettingsViewModel = {
  companyName: string;
  /** null quando a tabela ainda não tem linha para o tenant. */
  profile: OperationalProfile | null;
  operation: OperationalRules | null;
  brand: OperationalBrand | null;
  communication: OperationalCommunication | null;
  owner: OperationalOwner | null;
  /**
   * Convites visíveis sob RLS (somente owner/admin enxergam). Membro sem
   * privilégio recebe lista vazia — a UI trata como visibilidade restrita.
   */
  invitations: OperationalInvitation[];
  onboardingComplete: boolean;
};

export type OperationalSettingsResult =
  | { status: "ok"; settings: OperationalSettingsViewModel }
  | { status: "error" };

// Normaliza `time` do Postgres ("08:00:00") para o formato HH:MM usado pelo
// contrato do onboarding e pelos inputs.
function toHourMinute(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 5);
}

function text(value: string | null): string {
  return value ?? "";
}

function list(value: string[] | null): string[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Monta o view model das Configurações Operacionais a partir das tabelas
 * persistidas pelo onboarding. Ausência de linha é estado vazio honesto
 * (configuração incompleta), nunca dado inventado. Falha de leitura vira
 * `error` sanitizado.
 */
export async function getOperationalSettings(
  supabase: SupabaseClient,
  tenantId: string,
  companyName: string,
): Promise<OperationalSettingsResult> {
  const [profileRes, operationRes, brandRes, communicationRes, stateRes, invitesRes] =
    await Promise.all([
      supabase
        .from("tenant_profiles")
        .select(
          "trade_name, city, state, whatsapp, email, website, cnpj, operation_type, logo_asset_ref",
        )
        .eq("tenant_id", tenantId)
        .maybeSingle(),
      supabase
        .from("tenant_operation_settings")
        .select(
          "commercial_focus, regions, property_types, lead_distribution, standalone_has_captador, launch_belongs_to_operation, captador_priority, response_time_minutes",
        )
        .eq("tenant_id", tenantId)
        .maybeSingle(),
      supabase
        .from("tenant_brand_settings")
        .select("positioning, positioning_custom, audience, tone, channels")
        .eq("tenant_id", tenantId)
        .maybeSingle(),
      supabase
        .from("tenant_communication_settings")
        .select("service_days, service_start, service_end, after_hours_yzi, yzi_goals")
        .eq("tenant_id", tenantId)
        .maybeSingle(),
      supabase
        .from("tenant_onboarding_state")
        .select(
          "completed_at, owner_display_name, owner_phone, owner_role_title, team_setup_mode",
        )
        .eq("tenant_id", tenantId)
        .maybeSingle(),
      supabase
        .from("tenant_team_invitations")
        .select("id, onboarding_position, name, email, whatsapp, role_intent, status")
        .eq("tenant_id", tenantId)
        .order("onboarding_position", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true }),
    ]);

  // Convites são a única leitura restrita por papel: RLS devolve linhas só
  // para owner/admin. Erro de convite não derruba a tela inteira; os demais
  // erros derrubam, porque sem eles não há estado confiável para editar.
  if (
    profileRes.error ||
    operationRes.error ||
    brandRes.error ||
    communicationRes.error ||
    stateRes.error
  ) {
    return { status: "error" };
  }

  const profileRow = profileRes.data as {
    trade_name: string | null;
    city: string;
    state: string;
    whatsapp: string | null;
    email: string | null;
    website: string | null;
    cnpj: string | null;
    operation_type: string | null;
    logo_asset_ref: string | null;
  } | null;

  const operationRow = operationRes.data as {
    commercial_focus: string[];
    regions: string[];
    property_types: string[];
    lead_distribution: string | null;
    standalone_has_captador: boolean;
    launch_belongs_to_operation: boolean;
    captador_priority: boolean;
    response_time_minutes: number | null;
  } | null;

  const brandRow = brandRes.data as {
    positioning: string | null;
    positioning_custom: string | null;
    audience: string[];
    tone: string | null;
    channels: string[];
  } | null;

  const communicationRow = communicationRes.data as {
    service_days: string[];
    service_start: string | null;
    service_end: string | null;
    after_hours_yzi: boolean;
    yzi_goals: string[];
  } | null;

  const stateRow = stateRes.data as {
    completed_at: string | null;
    owner_display_name: string | null;
    owner_phone: string | null;
    owner_role_title: string | null;
    team_setup_mode: string;
  } | null;

  const inviteRows = (invitesRes.error ? [] : (invitesRes.data ?? [])) as Array<{
    id: string;
    onboarding_position: number | null;
    name: string;
    email: string | null;
    whatsapp: string | null;
    role_intent: string | null;
    status: string;
  }>;

  return {
    status: "ok",
    settings: {
      companyName,
      profile: profileRow
        ? {
            companyName,
            tradeName: text(profileRow.trade_name),
            city: profileRow.city,
            state: profileRow.state,
            whatsapp: text(profileRow.whatsapp),
            email: text(profileRow.email),
            website: text(profileRow.website),
            cnpj: text(profileRow.cnpj),
            operationType: text(profileRow.operation_type),
            hasLogo: Boolean(profileRow.logo_asset_ref),
          }
        : null,
      operation: operationRow
        ? {
            commercialFocus: list(operationRow.commercial_focus),
            regions: list(operationRow.regions),
            propertyTypes: list(operationRow.property_types),
            leadDistribution: text(operationRow.lead_distribution),
            standaloneCaptador: operationRow.standalone_has_captador,
            launchBelongsToOperation: operationRow.launch_belongs_to_operation,
            captadorPriority: operationRow.captador_priority,
            responseTimeMinutes: operationRow.response_time_minutes,
          }
        : null,
      brand: brandRow
        ? {
            positioning: text(brandRow.positioning),
            positioningCustom: text(brandRow.positioning_custom),
            audience: list(brandRow.audience),
            tone: text(brandRow.tone),
            channels: list(brandRow.channels),
          }
        : null,
      communication: communicationRow
        ? {
            serviceDays: list(communicationRow.service_days),
            serviceStart: toHourMinute(communicationRow.service_start),
            serviceEnd: toHourMinute(communicationRow.service_end),
            afterHoursYzi: communicationRow.after_hours_yzi,
            yziGoals: list(communicationRow.yzi_goals),
          }
        : null,
      owner: stateRow
        ? {
            name: text(stateRow.owner_display_name),
            phone: text(stateRow.owner_phone),
            roleTitle: text(stateRow.owner_role_title),
            teamSetupMode: stateRow.team_setup_mode === "agora" ? "agora" : "depois",
            completedAt: stateRow.completed_at,
          }
        : null,
      invitations: inviteRows.map((row) => ({
        id: row.id,
        onboardingPosition: row.onboarding_position,
        name: row.name,
        email: text(row.email),
        whatsapp: text(row.whatsapp),
        roleIntent: text(row.role_intent),
        status: row.status,
      })),
      onboardingComplete: Boolean(stateRow?.completed_at),
    },
  };
}
