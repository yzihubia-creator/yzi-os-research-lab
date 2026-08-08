import type { SupabaseClient } from "@supabase/supabase-js";

import type { Json } from "@/lib/supabase/database.types";

export type TenantOnboardingInput = {
  name: string;
  slug: string;
  city: string;
  state: string;
  status: string;
};

export type TenantOnboardingResult =
  | { status: "ok"; tenant: { id: string; slug: string }; created: boolean }
  | { status: "already_member" }
  | { status: "duplicate_slug" }
  | { status: "invalid"; message: string }
  | { status: "create_failed" };

export type YziImobOnboardingInviteInput = {
  name: string;
  email: string;
  whatsapp: string;
  role: string;
};

export type YziImobOnboardingProfileInput = {
  companyName: string;
  tradeName: string;
  city: string;
  state: string;
  whatsapp: string;
  email: string;
  website: string;
  cnpj: string;
  operationType: string;
  commercialFocus: string[];
  regions: string[];
  propertyTypes: string[];
  leadDistribution: string;
  standaloneCaptador: boolean;
  launchBelongsToOperation: boolean;
  captadorPriority: boolean;
  responseTime: string;
  responseTimeCustom: string;
  positioning: string;
  positioningCustom: string;
  audience: string[];
  tone: string;
  channels: string[];
  serviceDays: string[];
  serviceStart: string;
  serviceEnd: string;
  afterHoursYzi: boolean;
  yziGoals: string[];
  ownerName: string;
  ownerPhone: string;
  ownerRole: string;
  inviteMode: "agora" | "depois";
  invites: YziImobOnboardingInviteInput[];
};

export type YziImobOnboardingProfileResult =
  | { status: "ok" }
  | { status: "invalid"; message: string }
  | { status: "forbidden" }
  | { status: "ambiguous_tenant" }
  | { status: "save_failed" };

export type YziImobOnboardingCompletion = "complete" | "incomplete" | "error";

type TenantOnboardingRpcRow = {
  success: boolean;
  tenant_id: string | null;
  tenant_slug: string | null;
  created: boolean;
};

type SaveOnboardingRpcRow = {
  success: boolean;
  onboarding_completed: boolean;
};

type ParseResult =
  | { status: "ok"; input: YziImobOnboardingProfileInput }
  | { status: "invalid"; message: string };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const UF_VALUES = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
]);
const PAYLOAD_KEYS = [
  "companyName", "tradeName", "city", "state", "whatsapp", "email", "website",
  "cnpj", "operationType", "commercialFocus", "regions", "propertyTypes",
  "leadDistribution", "standaloneCaptador", "launchBelongsToOperation",
  "captadorPriority", "responseTime", "responseTimeCustom", "positioning",
  "positioningCustom", "audience", "tone", "channels", "serviceDays", "serviceStart",
  "serviceEnd", "afterHoursYzi", "yziGoals", "ownerName", "ownerPhone", "ownerRole",
  "inviteMode", "invites",
] as const;
const INVITE_KEYS = ["name", "email", "whatsapp", "role"] as const;

const OPERATION_TYPES = new Set(["", "imobiliaria", "alto-padrao", "lancamentos", "locacao", "mista"]);
const COMMERCIAL_FOCUS = new Set(["Venda", "Locação", "Lançamentos", "Alto padrão"]);
const PROPERTY_TYPES = new Set(["Apartamento", "Casa", "Terreno", "Comercial", "Lançamento", "Outros"]);
const LEAD_DISTRIBUTIONS = new Set(["", "captador", "rodizio", "manual", "yzi"]);
const POSITIONINGS = new Set(["", "premium", "proximo", "direto", "institucional", "personalizado"]);
const AUDIENCES = new Set(["Famílias", "Investidores", "Primeira compra", "Alto padrão", "Empresas", "Lançamentos"]);
const TONES = new Set(["", "consultivo", "sofisticado", "acolhedor", "objetivo"]);
const CHANNELS = new Set(["WhatsApp", "Site", "Instagram", "Facebook", "YouTube", "Portais imobiliários"]);
const SERVICE_DAYS = new Set(["Segunda a sexta", "Sábado", "Domingo"]);
const YZI_GOALS = new Set(["Organizar imóveis", "Qualificar leads", "Preparar conteúdo", "Agendar visitas", "Apoiar corretores"]);
const INVITE_ROLES = new Set(["", "corretor", "gestor", "atendimento"]);

class OnboardingValidationError extends Error {}

function clean(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertExactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  message: string,
) {
  const keys = Object.keys(value);
  if (keys.length !== allowed.length || keys.some((key) => !allowed.includes(key))) {
    throw new OnboardingValidationError(message);
  }
}

function readText(
  value: Record<string, unknown>,
  key: string,
  maxLength: number,
): string {
  const candidate = value[key];
  if (typeof candidate !== "string") {
    throw new OnboardingValidationError("O formulário contém um campo de texto inválido.");
  }
  const normalized = candidate.trim();
  if (normalized.length > maxLength) {
    throw new OnboardingValidationError("Um dos campos ultrapassa o tamanho permitido.");
  }
  return normalized;
}

function readBoolean(value: Record<string, unknown>, key: string): boolean {
  const candidate = value[key];
  if (typeof candidate !== "boolean") {
    throw new OnboardingValidationError("O formulário contém uma opção inválida.");
  }
  return candidate;
}

function readCanonicalList(
  value: Record<string, unknown>,
  key: string,
  allowed: Set<string>,
  maxItems: number,
): string[] {
  const candidate = value[key];
  if (!Array.isArray(candidate) || candidate.length > maxItems) {
    throw new OnboardingValidationError("Uma das listas do formulário é inválida.");
  }
  if (candidate.some((item) => typeof item !== "string" || !allowed.has(item))) {
    throw new OnboardingValidationError("Uma das opções selecionadas não é válida.");
  }
  if (new Set(candidate).size !== candidate.length) {
    throw new OnboardingValidationError("Uma das listas contém opções duplicadas.");
  }
  return [...candidate];
}

function readRegions(value: Record<string, unknown>): string[] {
  const candidate = value.regions;
  if (!Array.isArray(candidate) || candidate.length > 20) {
    throw new OnboardingValidationError("Informe no máximo 20 regiões.");
  }
  const regions = candidate.map((item) => {
    if (typeof item !== "string") {
      throw new OnboardingValidationError("Uma das regiões é inválida.");
    }
    const region = item.trim();
    if (!region || region.length > 120) {
      throw new OnboardingValidationError("Revise as regiões informadas.");
    }
    return region;
  });
  if (new Set(regions.map((region) => region.toLocaleLowerCase("pt-BR"))).size !== regions.length) {
    throw new OnboardingValidationError("A lista de regiões contém duplicidades.");
  }
  return regions;
}

function validateTimeWindow(start: string, end: string) {
  if ((start && !TIME_PATTERN.test(start)) || (end && !TIME_PATTERN.test(end))) {
    throw new OnboardingValidationError("Revise o horário de atendimento.");
  }
  if (start && end && start >= end) {
    throw new OnboardingValidationError("O fim do atendimento deve ser posterior ao início.");
  }
}

export function readTenantOnboardingInput(formData: FormData): TenantOnboardingInput {
  return {
    name: clean(formData.get("name")),
    slug: clean(formData.get("slug")).toLowerCase(),
    city: clean(formData.get("city")),
    state: clean(formData.get("state")).toUpperCase(),
    status: clean(formData.get("status")),
  };
}

function validateTenantOnboardingInput(input: TenantOnboardingInput): string | null {
  if (!input.name) return "Informe o nome da imobiliária.";
  if (!SLUG_PATTERN.test(input.slug)) return "Use um slug em minúsculas com hífens.";
  if (!input.city) return "Informe a cidade.";
  if (!input.state) return "Informe o estado.";
  if (input.status !== "Ativa") return "O onboarding mínimo só cria imobiliárias ativas.";
  return null;
}

export function readYziImobOnboardingProfileInput(
  value: FormDataEntryValue | null,
): ParseResult {
  if (typeof value !== "string" || !value || value.length > 100_000) {
    return { status: "invalid", message: "Não foi possível ler os dados da implantação." };
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) {
      throw new OnboardingValidationError("Os dados da implantação são inválidos.");
    }
    assertExactKeys(parsed, PAYLOAD_KEYS, "Os dados da implantação estão incompletos.");

    const companyName = readText(parsed, "companyName", 160);
    const city = readText(parsed, "city", 120);
    const state = readText(parsed, "state", 2).toUpperCase();
    if (!companyName || !city || !UF_VALUES.has(state)) {
      throw new OnboardingValidationError(
        "Revise o nome da imobiliária, a cidade e o estado antes de concluir a implantação.",
      );
    }

    const email = readText(parsed, "email", 320).toLowerCase();
    if (email && !EMAIL_PATTERN.test(email)) {
      throw new OnboardingValidationError("Revise o e-mail principal da imobiliária.");
    }

    const operationType = readText(parsed, "operationType", 40);
    const leadDistribution = readText(parsed, "leadDistribution", 40);
    const positioning = readText(parsed, "positioning", 40);
    const tone = readText(parsed, "tone", 40);
    if (!OPERATION_TYPES.has(operationType)) {
      throw new OnboardingValidationError("O tipo de operação selecionado não é válido.");
    }
    if (!LEAD_DISTRIBUTIONS.has(leadDistribution)) {
      throw new OnboardingValidationError("A distribuição de leads selecionada não é válida.");
    }
    if (!POSITIONINGS.has(positioning) || !TONES.has(tone)) {
      throw new OnboardingValidationError("Revise as opções de marca e comunicação.");
    }

    const responseTime = readText(parsed, "responseTime", 20);
    const responseTimeCustom = readText(parsed, "responseTimeCustom", 6);
    if (!["", "5", "15", "30", "personalizado"].includes(responseTime)) {
      throw new OnboardingValidationError("O tempo de resposta selecionado não é válido.");
    }
    if (responseTime === "personalizado") {
      const minutes = Number(responseTimeCustom);
      if (!/^\d+$/.test(responseTimeCustom) || minutes < 1 || minutes > 1440) {
        throw new OnboardingValidationError("Informe um tempo personalizado entre 1 e 1440 minutos.");
      }
    }

    const serviceStart = readText(parsed, "serviceStart", 5);
    const serviceEnd = readText(parsed, "serviceEnd", 5);
    validateTimeWindow(serviceStart, serviceEnd);

    const inviteModeValue = readText(parsed, "inviteMode", 10);
    if (inviteModeValue !== "agora" && inviteModeValue !== "depois") {
      throw new OnboardingValidationError("A escolha de equipe inicial não é válida.");
    }

    const rawInvites = parsed.invites;
    if (!Array.isArray(rawInvites) || rawInvites.length > 3) {
      throw new OnboardingValidationError("Comece com no máximo três pessoas.");
    }
    if (inviteModeValue === "depois" && rawInvites.length > 0) {
      throw new OnboardingValidationError("Escolha convidar agora ou remova os convites preparados.");
    }

    const seenEmails = new Set<string>();
    const invites = rawInvites.map((invite) => {
      if (!isRecord(invite)) {
        throw new OnboardingValidationError("Um dos convites é inválido.");
      }
      assertExactKeys(invite, INVITE_KEYS, "Um dos convites está incompleto.");
      const name = readText(invite, "name", 160);
      const inviteEmail = readText(invite, "email", 320).toLowerCase();
      const whatsapp = readText(invite, "whatsapp", 40);
      const role = readText(invite, "role", 40);
      if (!name) {
        throw new OnboardingValidationError("Informe o nome de cada pessoa adicionada.");
      }
      if (inviteEmail && !EMAIL_PATTERN.test(inviteEmail)) {
        throw new OnboardingValidationError(`Revise o e-mail de ${name}.`);
      }
      if (inviteEmail && seenEmails.has(inviteEmail)) {
        throw new OnboardingValidationError("Não repita o mesmo e-mail na equipe inicial.");
      }
      if (!INVITE_ROLES.has(role)) {
        throw new OnboardingValidationError(`Revise a função de ${name}.`);
      }
      if (inviteEmail) seenEmails.add(inviteEmail);
      return { name, email: inviteEmail, whatsapp, role };
    });

    return {
      status: "ok",
      input: {
        companyName,
        tradeName: readText(parsed, "tradeName", 160),
        city,
        state,
        whatsapp: readText(parsed, "whatsapp", 40),
        email,
        website: readText(parsed, "website", 500),
        cnpj: readText(parsed, "cnpj", 24),
        operationType,
        commercialFocus: readCanonicalList(parsed, "commercialFocus", COMMERCIAL_FOCUS, 4),
        regions: readRegions(parsed),
        propertyTypes: readCanonicalList(parsed, "propertyTypes", PROPERTY_TYPES, 6),
        leadDistribution,
        standaloneCaptador: readBoolean(parsed, "standaloneCaptador"),
        launchBelongsToOperation: readBoolean(parsed, "launchBelongsToOperation"),
        captadorPriority: readBoolean(parsed, "captadorPriority"),
        responseTime,
        responseTimeCustom,
        positioning,
        positioningCustom: readText(parsed, "positioningCustom", 500),
        audience: readCanonicalList(parsed, "audience", AUDIENCES, 6),
        tone,
        channels: readCanonicalList(parsed, "channels", CHANNELS, 6),
        serviceDays: readCanonicalList(parsed, "serviceDays", SERVICE_DAYS, 3),
        serviceStart,
        serviceEnd,
        afterHoursYzi: readBoolean(parsed, "afterHoursYzi"),
        yziGoals: readCanonicalList(parsed, "yziGoals", YZI_GOALS, 5),
        ownerName: readText(parsed, "ownerName", 160),
        ownerPhone: readText(parsed, "ownerPhone", 40),
        ownerRole: readText(parsed, "ownerRole", 120),
        inviteMode: inviteModeValue,
        invites,
      },
    };
  } catch (error) {
    return {
      status: "invalid",
      message:
        error instanceof OnboardingValidationError
          ? error.message
          : "Não foi possível validar os dados da implantação.",
    };
  }
}

export async function createTenantWithOwnerMembership(
  supabase: SupabaseClient,
  input: TenantOnboardingInput,
): Promise<TenantOnboardingResult> {
  const validationMessage = validateTenantOnboardingInput(input);
  if (validationMessage) {
    return { status: "invalid", message: validationMessage };
  }

  const { data, error } = await supabase.rpc("create_yzi_imob_tenant_with_owner", {
    p_name: input.name,
    p_slug: input.slug,
  });

  if (error) {
    return { status: "create_failed" };
  }

  const result = (data as TenantOnboardingRpcRow[] | null)?.[0];
  if (!result) return { status: "create_failed" };
  if (!result.success) return { status: "duplicate_slug" };
  if (!result.tenant_id || !result.tenant_slug) return { status: "create_failed" };
  if (!result.created) return { status: "already_member" };

  return {
    status: "ok",
    tenant: { id: result.tenant_id, slug: result.tenant_slug },
    created: true,
  };
}

export async function saveYziImobOnboardingProfile(
  supabase: SupabaseClient,
  input: YziImobOnboardingProfileInput,
): Promise<YziImobOnboardingProfileResult> {
  const { data, error } = await supabase.rpc("save_yzi_imob_onboarding_profile", {
    p_payload: input as unknown as Json,
  });

  if (error) {
    if (error.code === "42501") return { status: "forbidden" };
    if (error.code === "21000") return { status: "ambiguous_tenant" };
    if (["22007", "22023", "23505", "23514"].includes(error.code ?? "")) {
      return {
        status: "invalid",
        message:
          error.code === "23505"
            ? "Já existe um convite com este e-mail nesta imobiliária."
            : "Revise os dados da implantação e tente novamente.",
      };
    }
    return { status: "save_failed" };
  }

  const result = (data as SaveOnboardingRpcRow[] | null)?.[0];
  if (!result?.success || !result.onboarding_completed) {
    return { status: "save_failed" };
  }
  return { status: "ok" };
}

export async function getYziImobOnboardingCompletion(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<YziImobOnboardingCompletion> {
  const { data, error } = await supabase
    .from("tenant_onboarding_state")
    .select("completed_at")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) return "error";
  return data?.completed_at ? "complete" : "incomplete";
}
