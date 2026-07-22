import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ResultsDistributionItem,
  ResultsRate,
  ResultsTrendPoint,
  ResultsWorkspaceData,
} from "./types";

const PROPERTY_COLUMNS = "id, status, availability_status, created_at, updated_at";
const LEAD_COLUMNS = "id, status, temperature, source, created_at, updated_at";
const INTEREST_COLUMNS = "id, source, score, created_at, updated_at";
const CONVERSATION_COLUMNS = "id, channel, status, started_at, created_at, updated_at";
const APPOINTMENT_COLUMNS = "id, status, confirmation_status, starts_at, created_at, updated_at";

const HIGH_INTEREST_SCORE = 80;
const TREND_WEEKS = 8;

type PropertyRow = {
  id: string;
  status: string | null;
  availability_status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type LeadRow = {
  id: string;
  status: string | null;
  temperature: string | null;
  source: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type InterestRow = {
  id: string;
  source: string | null;
  score: number | string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ConversationRow = {
  id: string;
  channel: string | null;
  status: string | null;
  started_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type AppointmentRow = {
  id: string;
  status: string | null;
  confirmation_status: string | null;
  starts_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ResultsRepositoryResult =
  | { status: "ok"; value: ResultsWorkspaceData }
  | { status: "error"; detail?: string };

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function toScore(value: number | string | null): number | null {
  if (value === null) return null;
  const score = Number(value);
  return Number.isFinite(score) ? score : null;
}

function isActiveProperty(row: PropertyRow): boolean {
  return normalize(row.status) === "active" || normalize(row.availability_status) === "available";
}

function isHotLead(row: LeadRow): boolean {
  const temperature = normalize(row.temperature);
  return temperature === "hot" || temperature === "quente" || temperature === "alta";
}

function isHighScoreInterest(row: InterestRow): boolean {
  const score = toScore(row.score);
  return score !== null && score >= HIGH_INTEREST_SCORE;
}

function rate(input: Omit<ResultsRate, "value">): ResultsRate {
  return {
    ...input,
    value: input.denominator > 0 ? input.numerator / input.denominator : null,
  };
}

function labelOrEmpty(value: string | null): string {
  const normalized = value?.trim();
  return normalized ? normalized : "Sem origem";
}

function distribution(values: readonly (string | null)[], maxItems = 5): ResultsDistributionItem[] {
  if (values.length === 0) return [];

  const counts = new Map<string, number>();
  for (const value of values) {
    const label = labelOrEmpty(value);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({
      label,
      count,
      percentage: count / values.length,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"))
    .slice(0, maxItems);
}

function startOfUtcWeek(date: Date): Date {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = next.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setUTCDate(next.getUTCDate() + diff);
  next.setUTCHours(0, 0, 0, 0);
  return next;
}

function formatTrendLabel(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(date);
}

function addTrendCount(
  buckets: Map<string, ResultsTrendPoint>,
  dateIso: string | null,
  field: keyof Omit<ResultsTrendPoint, "label">,
) {
  if (!dateIso) return;
  const parsed = new Date(dateIso);
  if (!Number.isFinite(parsed.getTime())) return;

  const week = startOfUtcWeek(parsed);
  const key = week.toISOString();
  const current =
    buckets.get(key) ?? {
      label: formatTrendLabel(week),
      leads: 0,
      interests: 0,
      conversations: 0,
      appointments: 0,
    };
  current[field] += 1;
  buckets.set(key, current);
}

function recentTrend(input: {
  leads: readonly LeadRow[];
  interests: readonly InterestRow[];
  conversations: readonly ConversationRow[];
  appointments: readonly AppointmentRow[];
}): ResultsTrendPoint[] {
  const buckets = new Map<string, ResultsTrendPoint>();

  for (const lead of input.leads) addTrendCount(buckets, lead.created_at, "leads");
  for (const interest of input.interests) addTrendCount(buckets, interest.created_at, "interests");
  for (const conversation of input.conversations) {
    addTrendCount(buckets, conversation.started_at ?? conversation.created_at, "conversations");
  }
  for (const appointment of input.appointments) addTrendCount(buckets, appointment.created_at, "appointments");

  const ordered = [...buckets.entries()]
    .sort(([a], [b]) => Date.parse(a) - Date.parse(b))
    .slice(-TREND_WEEKS)
    .map(([, point]) => point);

  const populatedWeeks = ordered.filter(
    (point) => point.leads + point.interests + point.conversations + point.appointments > 0,
  );

  return populatedWeeks.length >= 2 ? ordered : [];
}

export async function getResultsWorkspaceData(
  supabase: SupabaseClient,
  tenantId: string,
  tenantLabel: string,
): Promise<ResultsRepositoryResult> {
  const [
    propertiesResult,
    leadsResult,
    interestsResult,
    conversationsResult,
    appointmentsResult,
  ] = await Promise.all([
    supabase.from("yzi_imob_properties").select(PROPERTY_COLUMNS).eq("tenant_id", tenantId),
    supabase.from("yzi_imob_leads").select(LEAD_COLUMNS).eq("tenant_id", tenantId),
    supabase.from("yzi_imob_property_interests").select(INTEREST_COLUMNS).eq("tenant_id", tenantId),
    supabase.from("yzi_imob_conversations").select(CONVERSATION_COLUMNS).eq("tenant_id", tenantId),
    supabase.from("yzi_imob_appointments").select(APPOINTMENT_COLUMNS).eq("tenant_id", tenantId),
  ]);

  if (propertiesResult.error) return { status: "error", detail: propertiesResult.error.message };
  if (leadsResult.error) return { status: "error", detail: leadsResult.error.message };
  if (interestsResult.error) return { status: "error", detail: interestsResult.error.message };
  if (conversationsResult.error) return { status: "error", detail: conversationsResult.error.message };
  if (appointmentsResult.error) return { status: "error", detail: appointmentsResult.error.message };

  const properties = (propertiesResult.data as PropertyRow[] | null) ?? [];
  const leads = (leadsResult.data as LeadRow[] | null) ?? [];
  const interests = (interestsResult.data as InterestRow[] | null) ?? [];
  const conversations = (conversationsResult.data as ConversationRow[] | null) ?? [];
  const appointments = (appointmentsResult.data as AppointmentRow[] | null) ?? [];

  const activeProperties = properties.filter(isActiveProperty).length;
  const hotLeads = leads.filter(isHotLead).length;
  const highScoreInterests = interests.filter(isHighScoreInterest).length;
  const appointmentsConfirmed = appointments.filter(
    (appointment) => normalize(appointment.confirmation_status) === "confirmed",
  ).length;
  const appointmentsCompleted = appointments.filter(
    (appointment) => normalize(appointment.status) === "completed",
  ).length;
  const appointmentsCancelled = appointments.filter(
    (appointment) => normalize(appointment.status) === "cancelled",
  ).length;
  const appointmentsNoShow = appointments.filter((appointment) => normalize(appointment.status) === "no_show")
    .length;

  const trend = recentTrend({ leads, interests, conversations, appointments });

  return {
    status: "ok",
    value: {
      tenantLabel,
      metrics: [
        {
          id: "active-properties",
          label: "Imoveis ativos",
          value: activeProperties,
          detail: "status active ou disponibilidade available.",
        },
        {
          id: "leads-received",
          label: "Leads recebidos",
          value: leads.length,
          detail: "linhas reais em yzi_imob_leads.",
        },
        {
          id: "hot-leads",
          label: "Leads quentes",
          value: hotLeads,
          detail: "temperature hot, quente ou alta.",
        },
        {
          id: "registered-interests",
          label: "Interesses registrados",
          value: interests.length,
          detail: "linhas reais em yzi_imob_property_interests.",
        },
        {
          id: "high-score-opportunities",
          label: "Oportunidades score alto",
          value: highScoreInterests,
          detail: `score real maior ou igual a ${HIGH_INTEREST_SCORE}.`,
        },
        {
          id: "started-conversations",
          label: "Conversas iniciadas",
          value: conversations.length,
          detail: "linhas reais em yzi_imob_conversations.",
        },
        {
          id: "created-appointments",
          label: "Agendamentos criados",
          value: appointments.length,
          detail: "linhas reais em yzi_imob_appointments.",
        },
        {
          id: "confirmed-appointments",
          label: "Agendamentos confirmados",
          value: appointmentsConfirmed,
          detail: "confirmation_status confirmed.",
        },
        {
          id: "completed-appointments",
          label: "Agendamentos concluidos",
          value: appointmentsCompleted,
          detail: "status completed.",
        },
        {
          id: "cancelled-appointments",
          label: "Agendamentos cancelados",
          value: appointmentsCancelled,
          detail: "status cancelled.",
        },
      ],
      rates: [
        rate({
          id: "appointment-confirmation-rate",
          label: "Taxa de confirmacao",
          numerator: appointmentsConfirmed,
          denominator: appointments.length,
          formula: "agendamentos com confirmation_status=confirmed / agendamentos criados",
        }),
        rate({
          id: "appointment-attendance-rate",
          label: "Taxa de comparecimento",
          numerator: appointmentsCompleted,
          denominator: appointmentsCompleted + appointmentsNoShow,
          formula: "status=completed / (status=completed + status=no_show)",
        }),
      ],
      leadSources: distribution(leads.map((lead) => lead.source)),
      leadTemperatures: distribution(leads.map((lead) => lead.temperature), 4),
      trend,
      sources: [
        "yzi_imob_properties",
        "yzi_imob_leads",
        "yzi_imob_property_interests",
        "yzi_imob_conversations",
        "yzi_imob_appointments",
      ],
      formulas: [
        "Todas as consultas usam eq('tenant_id', tenantId).",
        "Imoveis ativos = status active ou availability_status available.",
        "Leads quentes = temperature em hot, quente ou alta.",
        `Oportunidades com score alto = score >= ${HIGH_INTEREST_SCORE}.`,
        "Taxa de confirmacao = confirmados / agendamentos criados.",
        "Taxa de comparecimento = concluidos / (concluidos + no_show), exibida somente com denominador real.",
      ],
      omittedBlocks: [
        "Campanhas, midia paga, receita, ROI e faturamento: sem fonte real versionada nesta rota.",
        ...(trend.length === 0 ? ["Evolucao temporal: timestamps insuficientes para duas semanas reais."] : []),
        ...(appointmentsCompleted + appointmentsNoShow === 0
          ? ["Taxa de comparecimento: sem eventos completed/no_show suficientes."]
          : []),
      ],
      sourceIssues: [],
      isEmpty:
        properties.length + leads.length + interests.length + conversations.length + appointments.length === 0,
    },
  };
}
