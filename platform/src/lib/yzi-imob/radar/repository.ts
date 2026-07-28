import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { loadMetricoolMarketingWorkspace } from "@/lib/yzi-imob/metricool/repository";
import { getOperationsObservabilitySnapshot } from "@/lib/yzi-imob/operations/observability";
import { createRadarSignal, type RadarSignalInput } from "./model";
import type {
  RadarOperationalHealth,
  RadarSignal,
  RadarSourceState,
  RadarWorkspaceData,
} from "./types";

const MAX_ROWS = 1000;
const EVENT_WINDOW_DAYS = 90;
const CONVERSATION_STALE_HOURS = 24;
const MESSAGE_STATUS_STALE_HOURS = 6;
const RUNNER_STALE_HOURS = 24;
const JOB_STALE_MINUTES = 30;
const UPCOMING_VISIT_HOURS = 24;
const MIN_READY_MEDIA = 3;

type Row = Record<string, unknown>;
type QueryError = { message?: string } | null;
type QueryResult = PromiseLike<{ data: unknown; error: QueryError }>;
type Query = QueryResult & {
  select(columns: string): Query;
  eq(column: string, value: unknown): Query;
  gte(column: string, value: string): Query;
  order(column: string, options: { ascending: boolean }): Query;
  limit(value: number): Query;
};
type Client = { from(table: string): Query };

export type RadarRepositoryResult =
  | { status: "ok"; value: RadarWorkspaceData }
  | { status: "error"; detail?: string };

function rows(value: unknown): Row[] {
  return Array.isArray(value)
    ? value.filter((item): item is Row => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    : [];
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalized(value: unknown): string {
  return text(value)?.toLowerCase() ?? "";
}

function date(value: unknown): string | null {
  const candidate = text(value);
  return candidate && Number.isFinite(Date.parse(candidate)) ? candidate : null;
}

function numeric(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function olderThan(value: unknown, milliseconds: number, nowMs: number): boolean {
  const iso = date(value);
  return !iso || nowMs - Date.parse(iso) > milliseconds;
}

function sourceState(
  id: string,
  label: string,
  failed: boolean,
  detail: string,
  lastUpdatedAt: string | null = null,
  staleAfterHours: number | null = null,
): RadarSourceState {
  return {
    id,
    label,
    availability: failed ? "unavailable" : "available",
    detail,
    stale: { isStale: false, lastUpdatedAt, staleAfterHours },
  };
}

function push(signals: RadarSignal[], input: RadarSignalInput | false, now: Date) {
  if (input) signals.push(createRadarSignal(input, now));
}

function propertyHref(id: string) {
  return `/cockpit/yzi-imob/imoveis/${encodeURIComponent(id)}`;
}

function leadHref(id: string) {
  return `/cockpit/yzi-imob/clientes/${encodeURIComponent(id)}`;
}

function conversationHref(id: string) {
  return `/cockpit/yzi-imob/atendimento/${encodeURIComponent(id)}`;
}

export async function getRadarWorkspaceData(
  supabase: SupabaseClient,
  tenantId: string,
  canViewObservability: boolean,
  now = new Date(),
): Promise<RadarRepositoryResult> {
  const client = supabase as unknown as Client;
  const windowStart = new Date(now.getTime() - EVENT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const current = (table: string, columns: string) =>
    client.from(table).select(columns).eq("tenant_id", tenantId).limit(MAX_ROWS);
  const recent = (table: string, columns: string, timestamp = "created_at") =>
    client.from(table).select(columns).eq("tenant_id", tenantId).gte(timestamp, windowStart).limit(MAX_ROWS);

  const [
    propertiesResult,
    mediaResult,
    revisionsResult,
    propertyPublicationsResult,
    leadsResult,
    assignmentsResult,
    followUpsResult,
    conversationsResult,
    appointmentsResult,
    feedbackResult,
    messagesResult,
    inboundResult,
    runnersResult,
    propertyJobsResult,
    socialJobsResult,
    connectionsResult,
    metricoolResult,
    observabilityResult,
  ] = await Promise.all([
    current("yzi_imob_properties", "id, title, status, availability_status, stage, editorial_status, description, price, city, neighborhood, updated_at"),
    current("yzi_imob_property_media", "id, property_id, processing_status, is_publication_allowed, media_type, updated_at"),
    recent("yzi_imob_property_publication_revisions", "id, property_id, status, review_requested_at, decided_at, updated_at"),
    current("yzi_imob_property_publications", "id, property_id, status, sync_error_code, published_at, scheduled_at, last_synced_at, updated_at"),
    recent("yzi_imob_leads", "id, status, temperature, updated_at"),
    current("yzi_imob_lead_assignments", "id, lead_id, status, expires_at, assigned_at, updated_at"),
    current("yzi_imob_follow_up_tasks", "id, lead_id, appointment_id, conversation_id, status, due_at, attempt_count, max_attempts, recovery_count, recovered_at, last_error_code, updated_at"),
    recent("yzi_imob_conversations", "id, lead_id, status, last_message_at, started_at, updated_at", "started_at"),
    recent("yzi_imob_appointments", "id, lead_id, property_id, status, confirmation_status, starts_at, updated_at", "starts_at"),
    recent("yzi_imob_visit_feedback", "id, appointment_id, lead_id, next_action, next_action_at, feedback_at, updated_at", "feedback_at"),
    recent("yzi_imob_messages", "id, conversation_id, direction, delivery_status, provider_error_code, created_at"),
    recent("yzi_imob_inbound_operation_requests", "id, conversation_id, execution_status, workflow_status, failure_code, claimed_at, updated_at"),
    recent("yzi_imob_inbound_runner_executions", "id, outcome_status, failure_code, created_at"),
    current("yzi_imob_property_publication_jobs", "id, property_id, status, started_at, attempt_count, max_attempts, last_error_code, updated_at"),
    current("yzi_imob_social_publication_jobs", "id, social_publication_id, status, claimed_at, attempt_count, max_attempts, last_error_code, updated_at"),
    current("tenant_connections", "id, provider, status, validated_at, last_sync_at, updated_at"),
    loadMetricoolMarketingWorkspace(supabase, tenantId),
    canViewObservability
      ? getOperationsObservabilitySnapshot(supabase, tenantId)
      : Promise.resolve({ status: "error" as const, code: "read_failed" as const }),
  ]);

  if ([propertiesResult, leadsResult, conversationsResult, appointmentsResult].some((result) => result.error)) {
    return { status: "error", detail: "Uma fonte obrigatória do Radar não pôde ser lida." };
  }

  const properties = rows(propertiesResult.data);
  const media = mediaResult.error ? [] : rows(mediaResult.data);
  const revisions = revisionsResult.error ? [] : rows(revisionsResult.data);
  const propertyPublications = propertyPublicationsResult.error ? [] : rows(propertyPublicationsResult.data);
  const leads = rows(leadsResult.data);
  const assignments = assignmentsResult.error ? [] : rows(assignmentsResult.data);
  const followUps = followUpsResult.error ? [] : rows(followUpsResult.data);
  const conversations = rows(conversationsResult.data);
  const appointments = rows(appointmentsResult.data);
  const feedback = feedbackResult.error ? [] : rows(feedbackResult.data);
  const messages = messagesResult.error ? [] : rows(messagesResult.data);
  const inbound = inboundResult.error ? [] : rows(inboundResult.data);
  const runners = runnersResult.error ? [] : rows(runnersResult.data);
  const propertyJobs = propertyJobsResult.error ? [] : rows(propertyJobsResult.data);
  const socialJobs = socialJobsResult.error ? [] : rows(socialJobsResult.data);
  const connections = connectionsResult.error ? [] : rows(connectionsResult.data);
  const nowMs = now.getTime();
  const signals: RadarSignal[] = [];

  const mediaCount = new Map<string, number>();
  for (const item of media) {
    if (item.media_type !== "image" || item.processing_status !== "ready" || item.is_publication_allowed !== true) continue;
    const propertyId = text(item.property_id);
    if (propertyId) mediaCount.set(propertyId, (mediaCount.get(propertyId) ?? 0) + 1);
  }
  for (const property of properties) {
    const id = text(property.id);
    if (!id) continue;
    const title = text(property.title) ?? "Imóvel";
    const incomplete =
      ["draft", "intake"].includes(normalized(property.stage)) ||
      ["raw", "pending_review"].includes(normalized(property.editorial_status)) ||
      !text(property.description) || property.price === null || !text(property.city) || !text(property.neighborhood);
    push(signals, incomplete && {
      tenantId, type: "property_incomplete", category: "ativo", severity: "attention",
      title: "Imóvel incompleto", description: `${title} possui etapa pendente ou campo essencial ausente.`,
      entityType: "property", entityId: id, source: "yzi_imob_properties",
      dueAt: null, actionLabel: "Abrir imóvel", actionHref: propertyHref(id),
      metadata: { rule: "essential_fields_or_stage_incomplete" },
    }, now);
    const readyMedia = mediaCount.get(id) ?? 0;
    push(signals, !mediaResult.error && readyMedia < MIN_READY_MEDIA && {
      tenantId, type: "property_media_insufficient", category: "ativo", severity: "attention",
      title: "Mídia insuficiente", description: `${title} tem ${readyMedia} mídia(s) pronta(s) para publicação; mínimo operacional: ${MIN_READY_MEDIA}.`,
      entityType: "property", entityId: id, source: "yzi_imob_property_media",
      dueAt: null, actionLabel: "Abrir imóvel", actionHref: propertyHref(id),
      metadata: { readyMedia, minimum: MIN_READY_MEDIA },
    }, now);
  }
  for (const revision of revisions) {
    const id = text(revision.id);
    const propertyId = text(revision.property_id);
    if (!id || !propertyId || normalized(revision.status) !== "under_review") continue;
    push(signals, {
      tenantId, type: "publication_waiting_approval", category: "ativo", severity: "attention",
      title: "Publicação aguardando aprovação", description: "Uma revisão governada permanece em análise.",
      entityType: "publication", entityId: id, source: "yzi_imob_property_publication_revisions",
      detectedAt: date(revision.review_requested_at) ?? undefined, dueAt: null,
      actionLabel: "Solicitar revisão", actionHref: propertyHref(propertyId),
      metadata: { propertyId },
    }, now);
  }
  for (const publication of propertyPublications) {
    const id = text(publication.id);
    const propertyId = text(publication.property_id);
    if (!id || !propertyId) continue;
    const status = normalized(publication.status);
    push(signals, status === "failed" && {
      tenantId, type: "publication_failed", category: "ativo", severity: "important",
      title: "Publicação falhou", description: "A publicação do imóvel registrou falha sanitizada.",
      entityType: "publication", entityId: id, source: "yzi_imob_property_publications",
      dueAt: null, actionLabel: "Abrir publicação", actionHref: propertyHref(propertyId),
      metadata: { errorCode: text(publication.sync_error_code) },
    }, now);
    push(signals, status === "published" && !date(publication.published_at) && {
      tenantId, type: "property_publication_inconsistent", category: "ativo", severity: "important",
      title: "Estado de publicação inconsistente", description: "A publicação está marked como published sem published_at.",
      entityType: "publication", entityId: id, source: "yzi_imob_property_publications",
      dueAt: null, actionLabel: "Abrir publicação", actionHref: propertyHref(propertyId),
      metadata: { status },
    }, now);
  }

  const activeAssignmentsByLead = new Map<string, Row>();
  for (const assignment of assignments) {
    const leadId = text(assignment.lead_id);
    if (leadId && !["declined", "refused", "expired", "cancelled"].includes(normalized(assignment.status))) {
      activeAssignmentsByLead.set(leadId, assignment);
    }
    const id = text(assignment.id);
    if (!id || !["pending", "assigned"].includes(normalized(assignment.status))) continue;
    push(signals, {
      tenantId, type: "assignment_waiting_acceptance", category: "lead", severity: "important",
      title: "Assignment aguardando aceite", description: "A distribuição ainda não foi aceita pelo corretor.",
      entityType: "assignment", entityId: id, source: "yzi_imob_lead_assignments",
      detectedAt: date(assignment.assigned_at) ?? undefined, dueAt: date(assignment.expires_at),
      actionLabel: "Abrir lead", actionHref: text(assignment.lead_id) ? leadHref(String(assignment.lead_id)) : "/cockpit/yzi-imob/clientes",
      metadata: { leadId: text(assignment.lead_id) },
    }, now);
  }
  const pendingFollowUpLeadIds = new Set(
    followUps.filter((row) => normalized(row.status) === "pending").map((row) => text(row.lead_id)).filter((id): id is string => Boolean(id)),
  );
  for (const lead of leads) {
    const id = text(lead.id);
    if (!id) continue;
    const hot = ["hot", "quente", "alta"].includes(normalized(lead.temperature));
    push(signals, hot && !activeAssignmentsByLead.has(id) && {
      tenantId, type: "hot_lead_without_assignment", category: "lead", severity: "critical",
      title: "Lead quente sem assignment", description: "O lead está quente e não possui distribuição ativa.",
      entityType: "lead", entityId: id, source: "yzi_imob_leads + yzi_imob_lead_assignments",
      dueAt: null, actionLabel: "Abrir lead", actionHref: leadHref(id),
      metadata: { temperature: text(lead.temperature) },
    }, now);
    push(signals, !pendingFollowUpLeadIds.has(id) && {
      tenantId, type: "lead_without_next_action", category: "lead", severity: hot ? "important" : "attention",
      title: "Lead sem próxima ação", description: "Não existe follow-up pending vinculado ao lead.",
      entityType: "lead", entityId: id, source: "yzi_imob_leads + yzi_imob_follow_up_tasks",
      dueAt: null, actionLabel: "Abrir lead", actionHref: leadHref(id),
      metadata: { hot },
    }, now);
  }
  for (const task of followUps) {
    const id = text(task.id);
    if (!id) continue;
    const dueAt = date(task.due_at);
    const pending = normalized(task.status) === "pending";
    push(signals, pending && dueAt !== null && Date.parse(dueAt) < nowMs && {
      tenantId, type: "follow_up_overdue", category: "lead", severity: "important",
      title: "Follow-up vencido", description: "A tarefa permanece pending após o prazo.",
      entityType: "follow_up", entityId: id, source: "yzi_imob_follow_up_tasks",
      dueAt, actionLabel: "Resolver follow-up", actionHref: text(task.lead_id) ? leadHref(String(task.lead_id)) : "/cockpit/yzi-imob/clientes",
      metadata: { attemptCount: numeric(task.attempt_count), maxAttempts: numeric(task.max_attempts) },
    }, now);
    const exhausted = numeric(task.max_attempts) > 0 && numeric(task.attempt_count) >= numeric(task.max_attempts) && normalized(task.status) === "failed";
    push(signals, exhausted && {
      tenantId, type: "attempts_exhausted", category: "sistema", severity: "critical",
      title: "Tentativas esgotadas", description: "A tarefa falhou após atingir o limite governado.",
      entityType: "follow_up", entityId: id, source: "yzi_imob_follow_up_tasks",
      dueAt, actionLabel: "Abrir lead", actionHref: text(task.lead_id) ? leadHref(String(task.lead_id)) : null,
      metadata: { attemptCount: numeric(task.attempt_count), maxAttempts: numeric(task.max_attempts), errorCode: text(task.last_error_code) },
    }, now);
    push(signals, numeric(task.recovery_count) >= 3 && normalized(task.status) === "failed" && {
      tenantId, type: "recovery_limit_reached", category: "sistema", severity: "critical",
      title: "Limite de recovery atingido", description: "A tarefa continua failed após três ou mais recuperações.",
      entityType: "follow_up", entityId: id, source: "yzi_imob_follow_up_tasks",
      dueAt, actionLabel: "Abrir lead", actionHref: text(task.lead_id) ? leadHref(String(task.lead_id)) : null,
      metadata: { recoveryCount: numeric(task.recovery_count) },
    }, now);
  }

  for (const conversation of conversations) {
    const id = text(conversation.id);
    if (!id || normalized(conversation.status) === "closed") continue;
    const lastActivity = date(conversation.last_message_at) ?? date(conversation.started_at) ?? date(conversation.updated_at);
    push(signals, olderThan(lastActivity, CONVERSATION_STALE_HOURS * 60 * 60 * 1000, nowMs) && {
      tenantId, type: "conversation_waiting_response", category: "lead", severity: "important",
      title: "Conversa aguardando retorno", description: `Conversa aberta sem atividade há mais de ${CONVERSATION_STALE_HOURS} horas.`,
      entityType: "conversation", entityId: id, source: "yzi_imob_conversations",
      detectedAt: lastActivity ?? undefined, dueAt: lastActivity ? new Date(Date.parse(lastActivity) + CONVERSATION_STALE_HOURS * 60 * 60 * 1000).toISOString() : null,
      actionLabel: "Abrir conversa", actionHref: conversationHref(id),
      metadata: { thresholdHours: CONVERSATION_STALE_HOURS },
    }, now);
  }

  const feedbackByAppointment = new Map(feedback.map((row) => [text(row.appointment_id), row]));
  const followUpAppointmentIds = new Set(followUps.filter((row) => normalized(row.status) === "pending").map((row) => text(row.appointment_id)));
  for (const appointment of appointments) {
    const id = text(appointment.id);
    const startsAt = date(appointment.starts_at);
    if (!id || !startsAt) continue;
    const status = normalized(appointment.status);
    const hoursUntil = (Date.parse(startsAt) - nowMs) / (60 * 60 * 1000);
    push(signals, status === "scheduled" && hoursUntil >= 0 && hoursUntil <= UPCOMING_VISIT_HOURS && normalized(appointment.confirmation_status) !== "confirmed" && {
      tenantId, type: "visit_unconfirmed", category: "visita", severity: "important",
      title: "Visita próxima sem confirmação", description: `A visita ocorre em até ${UPCOMING_VISIT_HOURS} horas e não está confirmada.`,
      entityType: "appointment", entityId: id, source: "yzi_imob_appointments",
      dueAt: startsAt, actionLabel: "Abrir visita", actionHref: "/cockpit/yzi-imob/agenda",
      metadata: { confirmationStatus: text(appointment.confirmation_status) },
    }, now);
    push(signals, status === "completed" && !feedbackByAppointment.has(id) && {
      tenantId, type: "visit_without_feedback", category: "visita", severity: "important",
      title: "Visita concluída sem feedback", description: "Não existe feedback associado à visita concluída.",
      entityType: "appointment", entityId: id, source: "yzi_imob_appointments + yzi_imob_visit_feedback",
      dueAt: startsAt, actionLabel: "Registrar feedback", actionHref: "/cockpit/yzi-imob/agenda",
      metadata: { leadId: text(appointment.lead_id), propertyId: text(appointment.property_id) },
    }, now);
    push(signals, status === "cancelled" && followUpAppointmentIds.has(id) && {
      tenantId, type: "cancelled_visit_follow_up_pending", category: "visita", severity: "attention",
      title: "Visita cancelada com follow-up pendente", description: "Existe uma tarefa pending vinculada à visita cancelada.",
      entityType: "appointment", entityId: id, source: "yzi_imob_appointments + yzi_imob_follow_up_tasks",
      dueAt: startsAt, actionLabel: "Abrir visita", actionHref: "/cockpit/yzi-imob/agenda",
      metadata: {},
    }, now);
  }
  for (const item of feedback) {
    const id = text(item.id);
    const dueAt = date(item.next_action_at);
    if (!id || !text(item.next_action) || !dueAt || Date.parse(dueAt) >= nowMs) continue;
    push(signals, {
      tenantId, type: "feedback_next_action_overdue", category: "visita", severity: "important",
      title: "Próxima ação pós-visita vencida", description: "O feedback registra uma próxima ação com prazo vencido.",
      entityType: "appointment", entityId: text(item.appointment_id) ?? id, source: "yzi_imob_visit_feedback",
      dueAt, actionLabel: "Abrir visita", actionHref: "/cockpit/yzi-imob/agenda",
      metadata: { feedbackId: id },
    }, now);
  }

  for (const message of messages) {
    const id = text(message.id);
    if (!id || normalized(message.direction) !== "outbound") continue;
    const status = normalized(message.delivery_status);
    push(signals, status === "failed" && {
      tenantId, type: "outbound_failed", category: "atendimento", severity: "important",
      title: "Mensagem outbound falhou", description: "O provedor registrou delivery_status failed.",
      entityType: "conversation", entityId: text(message.conversation_id) ?? id, source: "yzi_imob_messages",
      detectedAt: date(message.created_at) ?? undefined, dueAt: null,
      actionLabel: "Abrir conversa", actionHref: text(message.conversation_id) ? conversationHref(String(message.conversation_id)) : "/cockpit/yzi-imob/atendimento",
      metadata: { errorCode: text(message.provider_error_code) },
    }, now);
    push(signals, ["", "pending_dispatch", "accepted", "sent"].includes(status) && olderThan(message.created_at, MESSAGE_STATUS_STALE_HOURS * 60 * 60 * 1000, nowMs) && {
      tenantId, type: "message_status_stale", category: "atendimento", severity: "attention",
      title: "Mensagem sem status final", description: `Mensagem outbound sem status final após ${MESSAGE_STATUS_STALE_HOURS} horas.`,
      entityType: "conversation", entityId: text(message.conversation_id) ?? id, source: "yzi_imob_messages",
      detectedAt: date(message.created_at) ?? undefined, dueAt: null,
      actionLabel: "Abrir conversa", actionHref: text(message.conversation_id) ? conversationHref(String(message.conversation_id)) : "/cockpit/yzi-imob/atendimento",
      metadata: { deliveryStatus: status || null },
    }, now);
  }
  for (const operation of inbound) {
    const id = text(operation.id);
    if (!id) continue;
    const failed = normalized(operation.execution_status) === "failed" || normalized(operation.workflow_status) === "failed" || Boolean(text(operation.failure_code));
    push(signals, failed && {
      tenantId, type: "inbound_operation_failed", category: "atendimento", severity: "important",
      title: "Operação inbound falhou", description: "A operação registrou status failed ou failure_code sanitizado.",
      entityType: "operation", entityId: id, source: "yzi_imob_inbound_operation_requests",
      dueAt: null, actionLabel: "Abrir conversa", actionHref: text(operation.conversation_id) ? conversationHref(String(operation.conversation_id)) : "/cockpit/yzi-imob/atendimento",
      metadata: { failureCode: text(operation.failure_code) },
    }, now);
    push(signals, failed && {
      tenantId, type: "recoverable_operation", category: "atendimento", severity: "attention",
      title: "Operação recuperável", description: "A falha inbound está visível para o fluxo de recovery já existente.",
      entityType: "operation", entityId: id, source: "yzi_imob_inbound_operation_requests",
      dueAt: null, actionLabel: "Abrir atendimento", actionHref: "/cockpit/yzi-imob/atendimento",
      metadata: { governedRetryOnly: true },
    }, now);
  }
  const latestRunnerAt = runners.map((row) => date(row.created_at)).filter((value): value is string => Boolean(value)).sort().at(-1) ?? null;
  push(signals, !runnersResult.error && olderThan(latestRunnerAt, RUNNER_STALE_HOURS * 60 * 60 * 1000, nowMs) && {
    tenantId, type: "runner_stale", category: "atendimento", severity: "important",
    title: "Runner sem execução recente", description: `Nenhuma execução registrada nas últimas ${RUNNER_STALE_HOURS} horas.`,
    entityType: "system", entityId: "inbound-runner", source: "yzi_imob_inbound_runner_executions",
    detectedAt: latestRunnerAt ?? undefined, dueAt: null, actionLabel: "Abrir atendimento", actionHref: "/cockpit/yzi-imob/atendimento",
    metadata: { thresholdHours: RUNNER_STALE_HOURS },
  }, now);

  for (const connection of connections) {
    const id = text(connection.id);
    if (!id) continue;
    const provider = normalized(connection.provider);
    const status = normalized(connection.status);
    push(signals, provider === "whatsapp" && ["attention_required", "failed", "token_invalid"].includes(status) && {
      tenantId, type: "whatsapp_attention_required", category: "conexao", severity: "critical",
      title: "WhatsApp requer atenção", description: `A conexão registra estado ${status}.`,
      entityType: "connection", entityId: id, source: "tenant_connections",
      dueAt: null, actionLabel: "Abrir conexão", actionHref: "/cockpit/yzi-imob/conexoes",
      metadata: { provider, status },
    }, now);
  }
  if (metricoolResult.status === "ok") {
    const connection = metricoolResult.value.connection;
    const status = normalized(connection.status);
    const id = connection.id ?? "metricool";
    const type = status === "token_invalid"
      ? "metricool_token_invalid"
      : status === "rate_limited"
        ? "metricool_rate_limited"
        : ["not_configured", "configuration_required"].includes(status)
          ? "metricool_configuration_required"
          : null;
    push(signals, type !== null && {
      tenantId, type, category: "conexao", severity: type === "metricool_token_invalid" ? "critical" : "attention",
      title: type === "metricool_configuration_required" ? "Metricool aguardando configuração" : "Conexão Metricool requer atenção",
      description: `Estado real da conexão: ${status}.`,
      entityType: "connection", entityId: id, source: "tenant_connections",
      detectedAt: connection.validatedAt ?? undefined, dueAt: null,
      actionLabel: "Abrir conexão", actionHref: "/cockpit/yzi-imob/conexoes",
      metadata: { provider: "metricool", status },
    }, now);
    push(signals, ["active", "connected"].includes(status) && olderThan(connection.lastSyncAt, 24 * 60 * 60 * 1000, nowMs) && {
      tenantId, type: "social_sync_stale", category: "conexao", severity: "attention",
      title: "Sync Metricool atrasado", description: "A última sincronização passou da janela de 24 horas.",
      entityType: "connection", entityId: id, source: "tenant_connections",
      detectedAt: connection.lastSyncAt ?? undefined, dueAt: null,
      actionLabel: "Abrir conexão", actionHref: "/cockpit/yzi-imob/conexoes",
      metadata: { thresholdHours: 24 },
    }, now);
    for (const publication of metricoolResult.value.publications) {
      push(signals, ["dispatching", "publishing"].includes(publication.status) && olderThan(publication.updatedAt, JOB_STALE_MINUTES * 60 * 1000, nowMs) && {
        tenantId, type: "social_publication_stalled", category: "conexao", severity: "important",
        title: "Publicação social travada", description: `Sem atualização há mais de ${JOB_STALE_MINUTES} minutos.`,
        entityType: "publication", entityId: publication.id, source: "yzi_imob_social_publications",
        detectedAt: publication.updatedAt, dueAt: null, actionLabel: "Abrir publicação", actionHref: "/cockpit/yzi-imob/marketing/publicacoes",
        metadata: { status: publication.status, propertyId: publication.propertyId },
      }, now);
    }
  }

  for (const job of [...propertyJobs, ...socialJobs]) {
    const id = text(job.id);
    if (!id) continue;
    const claimedAt = date(job.started_at) ?? date(job.claimed_at) ?? date(job.updated_at);
    const stalled = normalized(job.status) === "processing" && olderThan(claimedAt, JOB_STALE_MINUTES * 60 * 1000, nowMs);
    push(signals, stalled && {
      tenantId, type: "job_stalled", category: "sistema", severity: "critical",
      title: "Job travado", description: `Job processing sem atualização há mais de ${JOB_STALE_MINUTES} minutos.`,
      entityType: "job", entityId: id,
      source: "yzi_imob_property_publication_jobs / yzi_imob_social_publication_jobs",
      detectedAt: claimedAt ?? undefined, dueAt: null,
      actionLabel: text(job.property_id) ? "Abrir publicação" : "Abrir publicações",
      actionHref: text(job.property_id) ? propertyHref(String(job.property_id)) : "/cockpit/yzi-imob/marketing/publicacoes",
      metadata: { status: text(job.status), attemptCount: numeric(job.attempt_count), maxAttempts: numeric(job.max_attempts), errorCode: text(job.last_error_code) },
    }, now);
  }

  const sourceFailures = [
    mediaResult.error, revisionsResult.error, propertyPublicationsResult.error, assignmentsResult.error,
    followUpsResult.error, feedbackResult.error, messagesResult.error, inboundResult.error, runnersResult.error,
    propertyJobsResult.error, socialJobsResult.error, connectionsResult.error, metricoolResult.status === "error",
  ].filter(Boolean).length;
  const sources: RadarSourceState[] = [
    sourceState("assets", "Ativos e publicação", Boolean(mediaResult.error || revisionsResult.error || propertyPublicationsResult.error), "Cadastro, mídia, revisão e publicação."),
    sourceState("commercial", "Leads e visitas", Boolean(assignmentsResult.error || followUpsResult.error || feedbackResult.error), "Assignments, próximas ações, agenda e feedback."),
    sourceState("service", "Atendimento", Boolean(messagesResult.error || inboundResult.error || runnersResult.error), "Somente status, códigos sanitizados e timestamps."),
    sourceState("connections", "Conexões", Boolean(connectionsResult.error || metricoolResult.status === "error"), "Estados allowlisted de WhatsApp e Metricool."),
    sourceState("system", "Jobs e recovery", Boolean(propertyJobsResult.error || socialJobsResult.error), "Tentativas, status e códigos sanitizados."),
  ];
  const operationalHealth: RadarOperationalHealth = observabilityResult.status === "ok"
    ? {
        availability: "available",
        inboundFailed: observabilityResult.value.inboundFailed,
        outboundFailed: observabilityResult.value.outboundFailed,
        jobsStalled: observabilityResult.value.socialJobsStuck + observabilityResult.value.inboundStuck,
        overdueTasks: observabilityResult.value.overdueFollowUpTasks,
        recoveriesExecuted: followUps.filter((row) => numeric(row.recovery_count) > 0).length,
        latestRunnerExecutionAt: observabilityResult.value.latestRunnerExecutions[0]?.createdAt ?? null,
      }
    : {
        availability: "unavailable",
        inboundFailed: null,
        outboundFailed: null,
        jobsStalled: null,
        overdueTasks: null,
        recoveriesExecuted: null,
        latestRunnerExecutionAt: null,
      };

  return {
    status: "ok",
    value: {
      signals: [...new Map(signals.map((signal) => [signal.id, signal])).values()],
      sources,
      operationalHealth,
      availability: sourceFailures ? "partial_data" : "available",
      persistenceRequired: false,
    },
  };
}
