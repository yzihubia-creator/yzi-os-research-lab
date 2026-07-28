import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { loadMetricoolMarketingWorkspace } from "@/lib/yzi-imob/metricool/repository";
import { getOperationsObservabilitySnapshot } from "@/lib/yzi-imob/operations/observability";
import { resolveResultsPeriod } from "./model";
import type {
  DataAvailability,
  ResultsDistributionItem,
  ResultsFilters,
  ResultsMetricValue,
  ResultsRate,
  ResultsSocialMetric,
  ResultsSourceAttribution,
  ResultsTrendPoint,
  ResultsWorkspaceData,
} from "./types";

const RUNNER_STALE_HOURS = 24;
const SOCIAL_STALE_HOURS = 48;

type Row = Record<string, unknown>;
type QueryError = { message?: string } | null;
type QueryResult = PromiseLike<{ data: unknown; error: QueryError; count?: number | null }>;
type Query = QueryResult & {
  select(columns: string, options?: { count: "exact"; head: true }): Query;
  eq(column: string, value: unknown): Query;
  gte(column: string, value: string): Query;
  lte(column: string, value: string): Query;
  order(column: string, options: { ascending: boolean }): Query;
  limit(value: number): Query;
};
type Client = { from(table: string): Query };

export type ResultsRepositoryResult =
  | { status: "ok"; value: ResultsWorkspaceData }
  | { status: "error"; detail?: string };

function rows(value: unknown): Row[] {
  return Array.isArray(value)
    ? value.filter((item): item is Row => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    : [];
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function date(value: unknown): string | null {
  const candidate = text(value);
  return candidate && Number.isFinite(Date.parse(candidate)) ? candidate : null;
}

function normalized(value: unknown): string {
  return text(value)?.toLowerCase() ?? "";
}

function number(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function latest(values: readonly (string | null)[]): string | null {
  return values.filter((value): value is string => Boolean(value)).sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null;
}

function isStale(lastUpdatedAt: string | null, hours: number, nowMs: number): boolean {
  return !lastUpdatedAt || nowMs - Date.parse(lastUpdatedAt) > hours * 60 * 60 * 1000;
}

function metric(
  id: string,
  label: string,
  value: number | null,
  sourceId: string,
  detail: string,
  availability: DataAvailability = "available",
): ResultsMetricValue {
  return { id, label, value, sourceId, detail, availability };
}

function rate(input: Omit<ResultsRate, "value">): ResultsRate {
  return { ...input, value: input.denominator > 0 ? input.numerator / input.denominator : null };
}

function distribution(values: readonly (string | null)[], maxItems = 6): ResultsDistributionItem[] {
  if (!values.length) return [];
  const counts = new Map<string, number>();
  for (const value of values) {
    const label = value?.trim() || "Sem classificação";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ id: label.toLowerCase(), label, count, percentage: count / values.length }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"))
    .slice(0, maxItems);
}

function trend(input: {
  leads: Row[];
  interests: Row[];
  conversations: Row[];
  appointments: Row[];
}): ResultsTrendPoint[] {
  const buckets = new Map<string, ResultsTrendPoint>();
  const add = (iso: string | null, field: keyof Omit<ResultsTrendPoint, "label">) => {
    if (!iso) return;
    const parsed = new Date(iso);
    const key = parsed.toISOString().slice(0, 10);
    const point = buckets.get(key) ?? { label: key.slice(5), leads: 0, interests: 0, conversations: 0, appointments: 0 };
    point[field] += 1;
    buckets.set(key, point);
  };
  input.leads.forEach((row) => add(date(row.created_at), "leads"));
  input.interests.forEach((row) => add(date(row.created_at), "interests"));
  input.conversations.forEach((row) => add(date(row.started_at) ?? date(row.created_at), "conversations"));
  input.appointments.forEach((row) => add(date(row.starts_at), "appointments"));
  return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, point]) => point);
}

function source(
  id: string,
  label: string,
  tables: string[],
  availability: DataAvailability,
  detail: string,
  lastUpdatedAt: string | null,
  staleAfterHours: number | null,
  nowMs: number,
): ResultsSourceAttribution {
  return {
    id,
    label,
    tables,
    availability,
    detail,
    stale: {
      isStale: staleAfterHours !== null && availability === "available"
        ? isStale(lastUpdatedAt, staleAfterHours, nowMs)
        : false,
      lastUpdatedAt,
      staleAfterHours,
    },
  };
}

function applyFilters(input: {
  filters: ResultsFilters;
  properties: Row[];
  leads: Row[];
  interests: Row[];
  conversations: Row[];
  appointments: Row[];
  assignments: Row[];
  feedback: Row[];
  followUps: Row[];
}) {
  const { filters } = input;
  const appointments = input.appointments.filter((row) =>
    (!filters.propertyId || row.property_id === filters.propertyId) &&
    (!filters.brokerUserId || row.broker_user_id === filters.brokerUserId) &&
    (!filters.status || normalized(row.status) === filters.status),
  );
  const leadIds = new Set<string>([
    ...appointments.map((row) => text(row.lead_id)).filter((id): id is string => Boolean(id)),
    ...input.assignments
      .filter((row) => !filters.brokerUserId || row.broker_user_id === filters.brokerUserId)
      .map((row) => text(row.lead_id))
      .filter((id): id is string => Boolean(id)),
  ]);
  const leads = input.leads.filter((row) =>
    (!filters.status || normalized(row.status) === filters.status) &&
    (!filters.brokerUserId || leadIds.has(String(row.id))),
  );
  const visibleLeadIds = new Set(leads.map((row) => String(row.id)));
  const conversations = input.conversations.filter((row) =>
    (!filters.channel || normalized(row.channel) === filters.channel) &&
    (!filters.status || normalized(row.status) === filters.status) &&
    (!filters.brokerUserId || (text(row.lead_id) ? visibleLeadIds.has(String(row.lead_id)) : false)),
  );
  const interests = input.interests.filter((row) =>
    (!filters.propertyId || row.property_id === filters.propertyId) &&
    (!filters.brokerUserId || visibleLeadIds.has(String(row.lead_id))) &&
    (!filters.status || normalized(row.status) === filters.status),
  );
  const appointmentIds = new Set(appointments.map((row) => String(row.id)));
  return {
    properties: input.properties.filter((row) =>
      (!filters.propertyId || row.id === filters.propertyId) &&
      (!filters.status || normalized(row.status) === filters.status),
    ),
    leads,
    interests,
    conversations,
    appointments,
    assignments: input.assignments.filter((row) =>
      (!filters.brokerUserId || row.broker_user_id === filters.brokerUserId) &&
      (!filters.status || normalized(row.status) === filters.status),
    ),
    feedback: input.feedback.filter((row) =>
      (!filters.propertyId || row.property_id === filters.propertyId) &&
      (!filters.brokerUserId || row.broker_user_id === filters.brokerUserId) &&
      (!filters.status || normalized(row.outcome) === filters.status) &&
      (!appointmentIds.size || appointmentIds.has(String(row.appointment_id))),
    ),
    followUps: input.followUps.filter((row) =>
      (!filters.channel || normalized(row.channel) === filters.channel) &&
      (!filters.status || normalized(row.status) === filters.status) &&
      (!filters.brokerUserId || (text(row.lead_id) ? visibleLeadIds.has(String(row.lead_id)) : false)),
    ),
  };
}

export async function getResultsWorkspaceData(
  supabase: SupabaseClient,
  tenantId: string,
  tenantLabel: string,
  filters: ResultsFilters,
  canViewOperationalHealth: boolean,
  now = new Date(),
): Promise<ResultsRepositoryResult> {
  const client = supabase as unknown as Client;
  const period = resolveResultsPeriod(filters.period, now);
  const range = (table: string, columns: string, timestamp = "created_at") =>
    client.from(table).select(columns).eq("tenant_id", tenantId).gte(timestamp, period.start).lte(timestamp, period.end);
  const [
    propertiesResult,
    leadsResult,
    interestsResult,
    conversationsResult,
    messagesResult,
    appointmentsResult,
    assignmentsResult,
    feedbackResult,
    followUpsResult,
    revisionsResult,
    publicationsResult,
    socialMetricsResult,
    brokerProfilesResult,
    metricoolResult,
    observabilityResult,
  ] = await Promise.all([
    client.from("yzi_imob_properties").select("id, title, status, availability_status, stage, editorial_status, description, price, city, neighborhood, updated_at").eq("tenant_id", tenantId).limit(1000),
    range("yzi_imob_leads", "id, status, temperature, source, created_at, updated_at"),
    range("yzi_imob_property_interests", "id, property_id, lead_id, status, source, score, created_at, updated_at"),
    range("yzi_imob_conversations", "id, lead_id, channel, status, started_at, last_message_at, created_at, updated_at", "started_at"),
    range("yzi_imob_messages", "id, conversation_id, direction, channel, delivery_status, provider_error_code, created_at"),
    range("yzi_imob_appointments", "id, lead_id, property_id, broker_user_id, status, confirmation_status, starts_at, created_at, updated_at", "starts_at"),
    range("yzi_imob_lead_assignments", "id, lead_id, broker_user_id, status, assigned_at, accepted_at, declined_at, expires_at, updated_at", "assigned_at"),
    range("yzi_imob_visit_feedback", "id, appointment_id, lead_id, property_id, broker_user_id, outcome, next_action, next_action_at, feedback_at, updated_at", "feedback_at"),
    range("yzi_imob_follow_up_tasks", "id, lead_id, appointment_id, conversation_id, status, channel, due_at, attempt_count, max_attempts, recovery_count, recovered_at, updated_at", "due_at"),
    range("yzi_imob_property_publication_revisions", "id, property_id, status, decided_at, created_at, updated_at"),
    range("yzi_imob_social_publications", "id, property_id, status, target_networks, scheduled_at, published_at, updated_at"),
    range("yzi_imob_social_metrics", "social_publication_id, network, provider_metric_name, normalized_metric_name, value, period_start, period_end, collected_at", "collected_at").order("collected_at", { ascending: false }).limit(1000),
    client.from("tenant_member_profiles").select("user_id, display_name").eq("tenant_id", tenantId).order("display_name", { ascending: true }).limit(200),
    loadMetricoolMarketingWorkspace(supabase, tenantId),
    canViewOperationalHealth
      ? getOperationsObservabilitySnapshot(supabase, tenantId)
      : Promise.resolve({ status: "error" as const, code: "read_failed" as const }),
  ]);

  const requiredResults = [propertiesResult, leadsResult, interestsResult, conversationsResult, appointmentsResult];
  if (requiredResults.some((result) => result.error)) {
    return { status: "error", detail: "Uma fonte operacional obrigatória não pôde ser lida." };
  }

  const raw = {
    properties: rows(propertiesResult.data),
    leads: rows(leadsResult.data),
    interests: rows(interestsResult.data),
    conversations: rows(conversationsResult.data),
    appointments: rows(appointmentsResult.data),
    assignments: assignmentsResult.error ? [] : rows(assignmentsResult.data),
    feedback: feedbackResult.error ? [] : rows(feedbackResult.data),
    followUps: followUpsResult.error ? [] : rows(followUpsResult.data),
  };
  const filtered = applyFilters({ filters, ...raw });
  const messages = messagesResult.error
    ? []
    : rows(messagesResult.data).filter((row) =>
        (!filters.channel || normalized(row.channel) === filters.channel) &&
        (!filters.status || normalized(row.delivery_status) === filters.status),
      );
  const revisions = revisionsResult.error ? [] : rows(revisionsResult.data).filter((row) =>
    (!filters.propertyId || row.property_id === filters.propertyId) &&
    (!filters.status || normalized(row.status) === filters.status),
  );
  const publications = publicationsResult.error ? [] : rows(publicationsResult.data).filter((row) =>
    (!filters.propertyId || row.property_id === filters.propertyId) &&
    (!filters.channel || (Array.isArray(row.target_networks) && row.target_networks.includes(filters.channel))) &&
    (!filters.status || normalized(row.status) === filters.status),
  );

  const sourceFailures = [
    messagesResult.error,
    assignmentsResult.error,
    feedbackResult.error,
    followUpsResult.error,
    revisionsResult.error,
    publicationsResult.error,
    socialMetricsResult.error,
    brokerProfilesResult.error,
    metricoolResult.status === "error",
    observabilityResult.status === "error",
  ].filter(Boolean).length;
  const availability: DataAvailability = sourceFailures ? "partial_data" : "available";
  const nowMs = now.getTime();

  const activeProperties = filtered.properties.filter((row) =>
    normalized(row.status) === "active" || normalized(row.availability_status) === "available",
  ).length;
  const incompleteProperties = filtered.properties.filter((row) =>
    ["draft", "intake"].includes(normalized(row.stage)) ||
    ["raw", "pending_review"].includes(normalized(row.editorial_status)) ||
    !text(row.description) || number(row.price) === null || !text(row.city) || !text(row.neighborhood),
  ).length;
  const inbound = messages.filter((row) => normalized(row.direction) === "inbound");
  const outbound = messages.filter((row) => normalized(row.direction) === "outbound");
  const delivered = outbound.filter((row) => ["delivered", "read"].includes(normalized(row.delivery_status))).length;
  const read = outbound.filter((row) => normalized(row.delivery_status) === "read").length;
  const failedMessages = outbound.filter((row) => normalized(row.delivery_status) === "failed").length;
  const acceptedAssignments = filtered.assignments.filter((row) => normalized(row.status) === "accepted").length;
  const declinedAssignments = filtered.assignments.filter((row) => ["declined", "refused"].includes(normalized(row.status))).length;
  const pendingAssignments = filtered.assignments.filter((row) => ["pending", "assigned"].includes(normalized(row.status))).length;
  const completedAppointments = filtered.appointments.filter((row) => normalized(row.status) === "completed").length;
  const cancelledAppointments = filtered.appointments.filter((row) => normalized(row.status) === "cancelled").length;
  const feedbackAppointmentIds = new Set(filtered.feedback.map((row) => String(row.appointment_id)));
  const visitsWithoutFeedback = filtered.appointments.filter((row) =>
    normalized(row.status) === "completed" && !feedbackAppointmentIds.has(String(row.id)),
  ).length;
  const overdueFollowUps = filtered.followUps.filter((row) =>
    normalized(row.status) === "pending" && (date(row.due_at) ? Date.parse(String(row.due_at)) < nowMs : false),
  ).length;
  const approvedRevisions = revisions.filter((row) => normalized(row.status) === "approved").length;
  const scheduledPublications = publications.filter((row) => ["queued", "scheduled", "accepted"].includes(normalized(row.status))).length;
  const publishedPublications = publications.filter((row) => normalized(row.status) === "published").length;
  const failedPublications = publications.filter((row) => normalized(row.status) === "failed").length;

  let socialAvailability: DataAvailability = "unavailable";
  let configurationMessage: string | null = null;
  if (metricoolResult.status === "ok") {
    const connectionStatus = metricoolResult.value.connection.status;
    if (["not_configured", "configuration_required"].includes(connectionStatus)) {
      socialAvailability = "configuration_required";
      configurationMessage = "Aguardando configuração da Metricool";
    } else if (socialMetricsResult.error) {
      socialAvailability = "unavailable";
    } else {
      const lastCollected = latest(rows(socialMetricsResult.data).map((row) => date(row.collected_at)));
      socialAvailability = lastCollected && isStale(lastCollected, SOCIAL_STALE_HOURS, nowMs)
        ? "stale_data"
        : "available";
    }
  }

  const socialMetrics: ResultsSocialMetric[] = socialMetricsResult.error
    ? []
    : rows(socialMetricsResult.data).flatMap((row) => {
        const network = row.network === "instagram" || row.network === "facebook" ? row.network : null;
        const value = number(row.value);
        const periodStart = date(row.period_start);
        const periodEnd = date(row.period_end);
        const collectedAt = date(row.collected_at);
        const providerMetricName = text(row.provider_metric_name);
        if (!network || value === null || !periodStart || !periodEnd || !collectedAt || !providerMetricName) return [];
        const publicationId = text(row.social_publication_id);
        const publication = publications.find((candidate) => candidate.id === publicationId);
        return [{
          socialPublicationId: publicationId,
          propertyId: text(publication?.property_id),
          network,
          providerMetricName,
          normalizedMetricName: text(row.normalized_metric_name),
          value,
          periodStart,
          periodEnd,
          collectedAt,
        }];
      });

  const runnerLastExecutedAt = observabilityResult.status === "ok"
    ? observabilityResult.value.latestRunnerExecutions[0]?.createdAt ?? null
    : null;
  const runnerStale = observabilityResult.status === "ok"
    ? isStale(runnerLastExecutedAt, RUNNER_STALE_HOURS, nowMs)
    : null;
  const optionalAvailability = (failed: boolean): DataAvailability => failed ? "unavailable" : "available";
  const summary = {
    operation: [
      metric("active-properties", "Imóveis ativos", activeProperties, "properties", "Estado atual do cadastro."),
      metric("incomplete-properties", "Imóveis incompletos", incompleteProperties, "properties", "Campos essenciais ou etapa editorial pendentes."),
      metric("published-properties", "Publicações concluídas", publishedPublications, "content", "Publicações sociais concluídas no período.", optionalAvailability(Boolean(publicationsResult.error))),
      metric("pending-publications", "Publicações pendentes", scheduledPublications, "content", "Fila social no período.", optionalAvailability(Boolean(publicationsResult.error))),
      metric("failed-publications", "Falhas de publicação", failedPublications, "content", "Status failed no período.", optionalAvailability(Boolean(publicationsResult.error))),
      metric("period-leads", "Leads no período", filtered.leads.length, "commercial", "Criados dentro do período selecionado."),
      metric("period-interests", "Interesses", filtered.interests.length, "commercial", "Interesses registrados no período."),
      metric("period-conversations", "Conversas", filtered.conversations.length, "service", "Conversas iniciadas no período."),
      metric("period-visits", "Visitas", filtered.appointments.length, "commercial", "Agenda no período."),
      metric("period-feedback", "Feedbacks", feedbackResult.error ? null : filtered.feedback.length, "commercial", "Feedbacks de visita no período.", optionalAvailability(Boolean(feedbackResult.error))),
      metric("period-assignments", "Assignments", assignmentsResult.error ? null : filtered.assignments.length, "commercial", "Distribuições no período.", optionalAvailability(Boolean(assignmentsResult.error))),
      metric("period-followups", "Follow-ups", followUpsResult.error ? null : filtered.followUps.length, "commercial", "Tarefas com vencimento no período.", optionalAvailability(Boolean(followUpsResult.error))),
    ],
    service: [
      metric("inbound-messages", "Mensagens inbound", messagesResult.error ? null : inbound.length, "service", "Mensagens recebidas.", optionalAvailability(Boolean(messagesResult.error))),
      metric("outbound-messages", "Mensagens outbound", messagesResult.error ? null : outbound.length, "service", "Mensagens enviadas.", optionalAvailability(Boolean(messagesResult.error))),
      metric("delivered-messages", "Entregues", messagesResult.error ? null : delivered, "service", "delivery_status delivered ou read.", optionalAvailability(Boolean(messagesResult.error))),
      metric("read-messages", "Lidas", messagesResult.error ? null : read, "service", "delivery_status read.", optionalAvailability(Boolean(messagesResult.error))),
      metric("failed-messages", "Falhas", messagesResult.error ? null : failedMessages, "service", "delivery_status failed.", optionalAvailability(Boolean(messagesResult.error))),
      metric("open-conversations", "Conversas abertas", filtered.conversations.filter((row) => normalized(row.status) !== "closed").length, "service", "Status diferente de closed."),
    ],
    commercial: [
      metric("assigned-leads", "Leads atribuídos", assignmentsResult.error ? null : filtered.assignments.length, "commercial", "Assignments criados.", optionalAvailability(Boolean(assignmentsResult.error))),
      metric("accepted-assignments", "Aceitos", assignmentsResult.error ? null : acceptedAssignments, "commercial", "Assignments accepted.", optionalAvailability(Boolean(assignmentsResult.error))),
      metric("declined-assignments", "Recusados", assignmentsResult.error ? null : declinedAssignments, "commercial", "Assignments declined/refused.", optionalAvailability(Boolean(assignmentsResult.error))),
      metric("pending-assignments", "Aguardando aceite", assignmentsResult.error ? null : pendingAssignments, "commercial", "Assignments pending/assigned.", optionalAvailability(Boolean(assignmentsResult.error))),
      metric("scheduled-visits", "Visitas agendadas", filtered.appointments.filter((row) => normalized(row.status) === "scheduled").length, "commercial", "Status scheduled."),
      metric("completed-visits", "Visitas concluídas", completedAppointments, "commercial", "Status completed."),
      metric("cancelled-visits", "Visitas canceladas", cancelledAppointments, "commercial", "Status cancelled."),
      metric("visits-without-feedback", "Visitas sem feedback", feedbackResult.error ? null : visitsWithoutFeedback, "commercial", "Concluídas sem feedback associado.", optionalAvailability(Boolean(feedbackResult.error))),
      metric("post-visit-interest", "Interesse pós-visita", feedbackResult.error ? null : filtered.feedback.filter((row) => ["interested", "proposal", "positive"].includes(normalized(row.outcome))).length, "commercial", "Outcome positivo registrado.", optionalAvailability(Boolean(feedbackResult.error))),
      metric("next-actions", "Próximas ações", feedbackResult.error ? null : filtered.feedback.filter((row) => Boolean(text(row.next_action))).length, "commercial", "Feedbacks com próxima ação.", optionalAvailability(Boolean(feedbackResult.error))),
    ],
    content: [
      metric("approved-revisions", "Revisões aprovadas", revisionsResult.error ? null : approvedRevisions, "content", "Revisões approved.", optionalAvailability(Boolean(revisionsResult.error))),
      metric("scheduled-content", "Publicações agendadas", publicationsResult.error ? null : scheduledPublications, "content", "Status queued/scheduled/accepted.", optionalAvailability(Boolean(publicationsResult.error))),
      metric("published-content", "Publicadas", publicationsResult.error ? null : publishedPublications, "content", "Status published.", optionalAvailability(Boolean(publicationsResult.error))),
      metric("failed-content", "Falhas", publicationsResult.error ? null : failedPublications, "content", "Status failed.", optionalAvailability(Boolean(publicationsResult.error))),
    ],
  };
  const sources: ResultsSourceAttribution[] = [
    source("properties", "Imóveis", ["yzi_imob_properties"], "available", "Estado atual, sempre filtrado pelo tenant.", latest(raw.properties.map((row) => date(row.updated_at))), null, nowMs),
    source("commercial", "Funil comercial", ["yzi_imob_leads", "yzi_imob_property_interests", "yzi_imob_lead_assignments", "yzi_imob_appointments", "yzi_imob_visit_feedback", "yzi_imob_follow_up_tasks"], assignmentsResult.error || feedbackResult.error || followUpsResult.error ? "partial_data" : "available", "Eventos limitados ao período.", latest([...raw.leads, ...raw.interests, ...raw.appointments].map((row) => date(row.updated_at))), null, nowMs),
    source("service", "Atendimento", ["yzi_imob_conversations", "yzi_imob_messages", "yzi_imob_inbound_operation_requests", "yzi_imob_inbound_runner_executions"], messagesResult.error || observabilityResult.status === "error" ? "partial_data" : "available", "Conteúdo e identificadores privados de mensagens não são projetados.", runnerLastExecutedAt, RUNNER_STALE_HOURS, nowMs),
    source("content", "Publicação", ["yzi_imob_property_publication_revisions", "yzi_imob_social_publications", "yzi_imob_social_metrics"], publicationsResult.error || revisionsResult.error ? "partial_data" : "available", "Métricas externas aparecem somente quando persistidas.", latest(publications.map((row) => date(row.updated_at))), SOCIAL_STALE_HOURS, nowMs),
  ];
  if (sources.some((item) => item.stale.isStale) && availability === "available") {
    sources.forEach((item) => {
      if (item.stale.isStale && item.availability === "available") item.availability = "stale_data";
    });
  }

  const operationalHealth = observabilityResult.status === "ok"
    ? {
        availability: "available" as const,
        inboundFailed: observabilityResult.value.inboundFailed,
        outboundFailed: observabilityResult.value.outboundFailed,
        overdueFollowUps: observabilityResult.value.overdueFollowUpTasks,
        recoveryExecuted: filtered.followUps.filter((row) => number(row.recovery_count) && Number(row.recovery_count) > 0).length,
        runnerLastExecutedAt,
        runnerStale,
      }
    : {
        availability: "unavailable" as const,
        inboundFailed: null,
        outboundFailed: null,
        overdueFollowUps: null,
        recoveryExecuted: null,
        runnerLastExecutedAt: null,
        runnerStale: null,
      };

  const allMetrics = [...summary.operation, ...summary.service, ...summary.commercial, ...summary.content];
  return {
    status: "ok",
    value: {
      tenantLabel,
      period,
      filters,
      filterOptions: {
        properties: raw.properties.map((row) => ({ value: String(row.id), label: text(row.title) ?? "Imóvel sem título" })),
        brokers: brokerProfilesResult.error ? [] : rows(brokerProfilesResult.data).flatMap((row) => {
          const id = text(row.user_id);
          return id ? [{ value: id, label: text(row.display_name) ?? "Corretor" }] : [];
        }),
        channels: ["whatsapp", "instagram", "facebook"].map((value) => ({ value, label: value })),
        statuses: [...new Set([...raw.leads, ...raw.appointments, ...raw.assignments].map((row) => normalized(row.status)).filter(Boolean))].map((value) => ({ value, label: value })),
      },
      availability,
      summary,
      rates: [
        rate({ id: "assignment-acceptance", label: "Aceite de assignments", numerator: acceptedAssignments, denominator: filtered.assignments.length, sourceId: "commercial", formula: "accepted / assignments no período" }),
        rate({ id: "visit-feedback", label: "Cobertura de feedback", numerator: completedAppointments - visitsWithoutFeedback, denominator: completedAppointments, sourceId: "commercial", formula: "visitas concluídas com feedback / visitas concluídas" }),
      ],
      leadSources: distribution(filtered.leads.map((row) => text(row.source))),
      leadTemperatures: distribution(filtered.leads.map((row) => text(row.temperature)), 4),
      trend: trend({ leads: filtered.leads, interests: filtered.interests, conversations: filtered.conversations, appointments: filtered.appointments }),
      sources,
      omittedBlocks: [
        "Receita, VGV, comissão, ROI, CAC e CPL: sem fonte financeira governada.",
        "Atribuição de lead a post: não existe relação comprovável no schema atual.",
        "Tempo de resposta: omitido porque direção e timestamps não formam pares confiáveis por mensagem.",
      ],
      social: {
        availability: socialAvailability,
        configurationMessage,
        publicationCount: publicationsResult.error ? null : publications.length,
        publishedCount: publicationsResult.error ? null : publishedPublications,
        failedCount: publicationsResult.error ? null : failedPublications,
        metrics: socialMetrics,
        lastCollectedAt: latest(socialMetrics.map((item) => item.collectedAt)),
      },
      operationalHealth,
      bottlenecks: [
        metric("bottleneck-overdue-followups", "Follow-ups vencidos", followUpsResult.error ? null : overdueFollowUps, "commercial", "Pending com due_at vencido.", optionalAvailability(Boolean(followUpsResult.error))),
        metric("bottleneck-pending-assignments", "Assignments sem aceite", assignmentsResult.error ? null : pendingAssignments, "commercial", "Pending/assigned.", optionalAvailability(Boolean(assignmentsResult.error))),
        metric("bottleneck-visits-feedback", "Visitas sem feedback", feedbackResult.error ? null : visitsWithoutFeedback, "commercial", "Completed sem feedback.", optionalAvailability(Boolean(feedbackResult.error))),
        metric("bottleneck-message-failures", "Mensagens com erro", messagesResult.error ? null : failedMessages, "service", "Outbound failed.", optionalAvailability(Boolean(messagesResult.error))),
        metric("bottleneck-publication-failures", "Publicações com falha", publicationsResult.error ? null : failedPublications, "content", "Status failed.", optionalAvailability(Boolean(publicationsResult.error))),
      ],
      isEmpty: allMetrics.every((item) => item.value === null || item.value === 0),
    },
  };
}
