import type { SupabaseClient } from "@supabase/supabase-js";

import { loadMetricoolMarketingWorkspace } from "@/lib/yzi-imob/metricool/repository";
import type { RadarSignal, RadarSourceIssue, RadarWorkspaceData } from "./types";

const PROPERTY_COLUMNS =
  "id, title, status, stage, editorial_status, description, price, city, neighborhood, updated_at";
const LEAD_COLUMNS = "id, full_name, status, temperature, updated_at";
const INTEREST_COLUMNS = "id, property_id, lead_id, status, source, score, updated_at";
const CONVERSATION_COLUMNS = "id, lead_id, channel, status, started_at, last_message_at, updated_at";
const APPOINTMENT_COLUMNS = "id, lead_id, property_id, title, starts_at, status, confirmation_status, updated_at";
const INBOUND_COLUMNS = "id, execution_status, workflow_status, failure_code, updated_at";

const STALE_LEAD_DAYS = 14;
const STALLED_CONVERSATION_HOURS = 72;
const HIGH_INTEREST_SCORE = 80;
const SOCIAL_STALLED_MINUTES = 30;
const SOCIAL_METRICS_WINDOW_HOURS = 24;
const SOCIAL_SYNC_WINDOW_HOURS = 24;

type PropertyRow = {
  id: string;
  title: string | null;
  status: string | null;
  stage: string | null;
  editorial_status: string | null;
  description: string | null;
  price: number | string | null;
  city: string | null;
  neighborhood: string | null;
  updated_at: string | null;
};

type LeadRow = {
  id: string;
  full_name: string | null;
  status: string | null;
  temperature: string | null;
  updated_at: string | null;
};

type InterestRow = {
  id: string;
  property_id: string | null;
  lead_id: string | null;
  status: string | null;
  source: string | null;
  score: number | string | null;
  updated_at: string | null;
};

type ConversationRow = {
  id: string;
  lead_id: string | null;
  channel: string | null;
  status: string | null;
  started_at: string | null;
  last_message_at: string | null;
  updated_at: string | null;
};

type AppointmentRow = {
  id: string;
  lead_id: string | null;
  property_id: string | null;
  title: string | null;
  starts_at: string | null;
  status: string | null;
  confirmation_status: string | null;
  updated_at: string | null;
};

type InboundOperationRow = {
  id: string;
  execution_status: string | null;
  workflow_status: string | null;
  failure_code: string | null;
  updated_at: string | null;
};

export type RadarRepositoryResult =
  | { status: "ok"; value: RadarWorkspaceData }
  | { status: "error"; detail?: string };

function latestDate(rows: readonly { updated_at?: string | null }[]): string | null {
  let latest: string | null = null;
  for (const row of rows) {
    const candidate = row.updated_at ?? null;
    if (!candidate) continue;
    if (!latest || Date.parse(candidate) > Date.parse(latest)) latest = candidate;
  }
  return latest;
}

function latestConversationInteraction(row: ConversationRow): string | null {
  return row.last_message_at ?? row.started_at ?? row.updated_at ?? null;
}

function isOlderThan(iso: string | null, limitMs: number, nowMs: number): boolean {
  if (!iso) return true;
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return true;
  return nowMs - time > limitMs;
}

function isIncompleteProperty(row: PropertyRow): boolean {
  const stage = row.stage?.trim();
  const editorialStatus = row.editorial_status?.trim();
  return (
    stage === "draft" ||
    stage === "intake" ||
    editorialStatus === "raw" ||
    editorialStatus === "pending_review" ||
    !row.description?.trim() ||
    row.price === null ||
    !row.city?.trim() ||
    !row.neighborhood?.trim()
  );
}

function isHotLead(row: LeadRow): boolean {
  const temperature = row.temperature?.trim().toLowerCase();
  return temperature === "hot" || temperature === "quente" || temperature === "alta";
}

function isAdvancedLead(row: LeadRow): boolean {
  const status = row.status?.trim().toLowerCase();
  return status === "qualificado" || status === "cliente";
}

function toScore(value: number | string | null): number | null {
  if (value === null) return null;
  const score = Number(value);
  return Number.isFinite(score) ? score : null;
}

function signal(input: Omit<RadarSignal, "count"> & { count: number }): RadarSignal | null {
  if (input.count <= 0) return null;
  return input;
}

function pushSignal(signals: RadarSignal[], next: RadarSignal | null) {
  if (next) signals.push(next);
}

export async function getRadarWorkspaceData(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<RadarRepositoryResult> {
  const [
    propertiesResult,
    interestsResult,
    leadsResult,
    conversationsResult,
    appointmentsResult,
    inboundResult,
    metricoolResult,
  ] = await Promise.all([
    supabase.from("yzi_imob_properties").select(PROPERTY_COLUMNS).eq("tenant_id", tenantId),
    supabase.from("yzi_imob_property_interests").select(INTEREST_COLUMNS).eq("tenant_id", tenantId),
    supabase.from("yzi_imob_leads").select(LEAD_COLUMNS).eq("tenant_id", tenantId),
    supabase.from("yzi_imob_conversations").select(CONVERSATION_COLUMNS).eq("tenant_id", tenantId),
    supabase.from("yzi_imob_appointments").select(APPOINTMENT_COLUMNS).eq("tenant_id", tenantId),
    supabase.from("yzi_imob_inbound_operation_requests").select(INBOUND_COLUMNS).eq("tenant_id", tenantId),
    loadMetricoolMarketingWorkspace(supabase, tenantId),
  ]);

  if (propertiesResult.error) return { status: "error", detail: propertiesResult.error.message };
  if (interestsResult.error) return { status: "error", detail: interestsResult.error.message };
  if (leadsResult.error) return { status: "error", detail: leadsResult.error.message };
  if (conversationsResult.error) return { status: "error", detail: conversationsResult.error.message };
  if (appointmentsResult.error) return { status: "error", detail: appointmentsResult.error.message };

  const sourceIssues: RadarSourceIssue[] = [];
  if (inboundResult.error) {
    sourceIssues.push({
      sourceLabel: "yzi_imob_inbound_operation_requests",
      detail: "Fonte existe, mas nao esta legivel pela sessao do operador.",
    });
  }
  if (metricoolResult.status === "error") {
    sourceIssues.push({
      sourceLabel: "Metricool social",
      detail: "Contrato social existe, mas nao esta legivel pela sessao atual.",
    });
  }

  const properties = (propertiesResult.data as PropertyRow[] | null) ?? [];
  const interests = (interestsResult.data as InterestRow[] | null) ?? [];
  const leads = (leadsResult.data as LeadRow[] | null) ?? [];
  const conversations = (conversationsResult.data as ConversationRow[] | null) ?? [];
  const appointments = (appointmentsResult.data as AppointmentRow[] | null) ?? [];
  const inboundOperations = inboundResult.error
    ? []
    : ((inboundResult.data as InboundOperationRow[] | null) ?? []);

  const signals: RadarSignal[] = [];
  const nowMs = Date.now();

  const incompleteProperties = properties.filter(isIncompleteProperty);
  pushSignal(
    signals,
    signal({
      id: "properties-incomplete",
      kind: "property_incomplete",
      sourceLabel: "yzi_imob_properties",
      areaLabel: "Imoveis",
      whatLabel: `${incompleteProperties.length} imovel(is) com cadastro incompleto.`,
      whyLabel:
        "A regra marcou imoveis em draft/intake, editorial raw/pending_review ou com descricao, preco, cidade ou bairro ausentes.",
      ruleLabel:
        "stage in (draft, intake) OR editorial_status in (raw, pending_review) OR campo essencial ausente.",
      evidenceLabel: `${incompleteProperties.length} de ${properties.length} imovel(is) avaliados.`,
      href: "/cockpit/yzi-imob/imoveis",
      count: incompleteProperties.length,
      lastSeenAt: latestDate(incompleteProperties),
    }),
  );

  const interestedPropertyIds = new Set(
    interests.map((interest) => interest.property_id).filter((id): id is string => Boolean(id)),
  );
  const propertiesWithoutInterest = properties.filter((property) => !interestedPropertyIds.has(property.id));
  pushSignal(
    signals,
    signal({
      id: "properties-without-interest",
      kind: "property_without_interest",
      sourceLabel: "yzi_imob_properties + yzi_imob_property_interests",
      areaLabel: "Imoveis",
      whatLabel: `${propertiesWithoutInterest.length} imovel(is) sem interesse registrado.`,
      whyLabel: "Nao ha linha em yzi_imob_property_interests vinculada a esses imoveis neste tenant.",
      ruleLabel: "property.id sem correspondente em yzi_imob_property_interests.property_id.",
      evidenceLabel: `${propertiesWithoutInterest.length} de ${properties.length} imovel(is) sem interesse.`,
      href: "/cockpit/yzi-imob/imoveis",
      count: propertiesWithoutInterest.length,
      lastSeenAt: latestDate(propertiesWithoutInterest),
    }),
  );

  const conversationByLead = new Map<string, ConversationRow[]>();
  for (const conversation of conversations) {
    if (!conversation.lead_id) continue;
    const current = conversationByLead.get(conversation.lead_id) ?? [];
    current.push(conversation);
    conversationByLead.set(conversation.lead_id, current);
  }

  const staleLeadLimitMs = STALE_LEAD_DAYS * 24 * 60 * 60 * 1000;
  const leadsWithoutRecentInteraction = leads.filter((lead) => {
    const leadConversations = conversationByLead.get(lead.id) ?? [];
    const latest = latestDate(
      leadConversations.map((conversation) => ({
        updated_at: latestConversationInteraction(conversation),
      })),
    );
    return isOlderThan(latest, staleLeadLimitMs, nowMs);
  });
  pushSignal(
    signals,
    signal({
      id: "leads-without-recent-interaction",
      kind: "lead_without_recent_interaction",
      sourceLabel: "yzi_imob_leads + yzi_imob_conversations",
      areaLabel: "Leads",
      whatLabel: `${leadsWithoutRecentInteraction.length} lead(s) sem interacao recente.`,
      whyLabel: `A ultima conversa registrada esta ausente ou passou de ${STALE_LEAD_DAYS} dias.`,
      ruleLabel: `sem conversation OR max(last_message_at, started_at) > ${STALE_LEAD_DAYS} dias.`,
      evidenceLabel: `${leadsWithoutRecentInteraction.length} de ${leads.length} lead(s) avaliados.`,
      href: "/cockpit/yzi-imob/clientes",
      count: leadsWithoutRecentInteraction.length,
      lastSeenAt: latestDate(leadsWithoutRecentInteraction),
    }),
  );

  const scheduledLeadIds = new Set(
    appointments
      .filter((appointment) => appointment.status === "scheduled")
      .map((appointment) => appointment.lead_id)
      .filter((id): id is string => Boolean(id)),
  );
  const hotLeadsWithoutProgress = leads.filter(
    (lead) => isHotLead(lead) && !isAdvancedLead(lead) && !scheduledLeadIds.has(lead.id),
  );
  pushSignal(
    signals,
    signal({
      id: "hot-leads-without-progress",
      kind: "hot_lead_without_progress",
      sourceLabel: "yzi_imob_leads + yzi_imob_appointments",
      areaLabel: "Leads",
      whatLabel: `${hotLeadsWithoutProgress.length} lead(s) quente(s) sem avanco confirmado.`,
      whyLabel: "Temperatura quente/alta, status ainda nao avancado e sem agendamento scheduled vinculado.",
      ruleLabel:
        "temperature in (hot, quente, alta) AND status not in (qualificado, cliente) AND sem appointment scheduled.",
      evidenceLabel: `${hotLeadsWithoutProgress.length} lead(s) quente(s) nessa condicao.`,
      href: "/cockpit/yzi-imob/clientes",
      count: hotLeadsWithoutProgress.length,
      lastSeenAt: latestDate(hotLeadsWithoutProgress),
    }),
  );

  const stalledConversationLimitMs = STALLED_CONVERSATION_HOURS * 60 * 60 * 1000;
  const stalledConversations = conversations.filter((conversation) => {
    const status = conversation.status?.trim().toLowerCase();
    if (status === "closed") return false;
    return isOlderThan(latestConversationInteraction(conversation), stalledConversationLimitMs, nowMs);
  });
  pushSignal(
    signals,
    signal({
      id: "conversations-stalled",
      kind: "conversation_stalled",
      sourceLabel: "yzi_imob_conversations",
      areaLabel: "Atendimento",
      whatLabel: `${stalledConversations.length} conversa(s) aberta(s) parada(s).`,
      whyLabel: `Conversas nao fechadas sem mensagem ha mais de ${STALLED_CONVERSATION_HOURS} horas.`,
      ruleLabel: `status != closed AND max(last_message_at, started_at) > ${STALLED_CONVERSATION_HOURS} horas.`,
      evidenceLabel: `${stalledConversations.length} de ${conversations.length} conversa(s) avaliadas.`,
      href: "/cockpit/yzi-imob/atendimento",
      count: stalledConversations.length,
      lastSeenAt: latestDate(stalledConversations),
    }),
  );

  const pendingAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "scheduled" && appointment.confirmation_status === "pending",
  );
  pushSignal(
    signals,
    signal({
      id: "appointments-pending",
      kind: "appointment_pending",
      sourceLabel: "yzi_imob_appointments",
      areaLabel: "Agenda",
      whatLabel: `${pendingAppointments.length} agendamento(s) aguardando confirmacao.`,
      whyLabel: "Status scheduled com confirmation_status pending.",
      ruleLabel: "status = scheduled AND confirmation_status = pending.",
      evidenceLabel: `${pendingAppointments.length} de ${appointments.length} agendamento(s) avaliados.`,
      href: "/cockpit/yzi-imob/agenda",
      count: pendingAppointments.length,
      lastSeenAt: latestDate(pendingAppointments),
    }),
  );

  const highScoreInterests = interests.filter((interest) => {
    const score = toScore(interest.score);
    return score !== null && score >= HIGH_INTEREST_SCORE;
  });
  pushSignal(
    signals,
    signal({
      id: "high-score-interests",
      kind: "high_score_interest",
      sourceLabel: "yzi_imob_property_interests",
      areaLabel: "Interesses",
      whatLabel: `${highScoreInterests.length} interesse(s) com score alto.`,
      whyLabel: `O score real do interesse e maior ou igual a ${HIGH_INTEREST_SCORE}.`,
      ruleLabel: `score >= ${HIGH_INTEREST_SCORE}.`,
      evidenceLabel: `${highScoreInterests.length} de ${interests.length} interesse(s) avaliados.`,
      href: "/cockpit/yzi-imob/clientes",
      count: highScoreInterests.length,
      lastSeenAt: latestDate(highScoreInterests),
    }),
  );

  const failedInboundOperations = inboundOperations.filter((operation) => {
    const execution = operation.execution_status?.trim().toLowerCase();
    const workflow = operation.workflow_status?.trim().toLowerCase();
    return Boolean(operation.failure_code) || execution === "failed" || workflow === "failed";
  });
  pushSignal(
    signals,
    signal({
      id: "inbound-failures",
      kind: "inbound_failure",
      sourceLabel: "yzi_imob_inbound_operation_requests",
      areaLabel: "Inbound",
      whatLabel: `${failedInboundOperations.length} falha(s) de processamento inbound.`,
      whyLabel: "A propria tabela registrou failure_code ou status failed.",
      ruleLabel: "failure_code is not null OR execution_status = failed OR workflow_status = failed.",
      evidenceLabel: `${failedInboundOperations.length} de ${inboundOperations.length} request(s) avaliados.`,
      href: null,
      count: failedInboundOperations.length,
      lastSeenAt: latestDate(failedInboundOperations),
    }),
  );

  if (metricoolResult.status === "ok") {
    const metricool = metricoolResult.value;
    const failedPublications = metricool.publications.filter(
      (publication) => publication.status === "failed",
    );
    pushSignal(
      signals,
      signal({
        id: "metricool-publications-failed",
        kind: "social_publish_failed",
        sourceLabel: "yzi_imob_social_publications",
        areaLabel: "Marketing",
        whatLabel: `${failedPublications.length} publicacao(oes) Metricool com falha.`,
        whyLabel: "A propria publicacao social registrou status failed e erro sanitizado.",
        ruleLabel: "provider = metricool AND status = failed.",
        evidenceLabel: `${failedPublications.length} falha(s) real(is) registrada(s).`,
        href: "/cockpit/yzi-imob/marketing/publicacoes",
        count: failedPublications.length,
        lastSeenAt: latestDate(
          failedPublications.map((publication) => ({ updated_at: publication.updatedAt })),
        ),
      }),
    );

    const stalledLimit = SOCIAL_STALLED_MINUTES * 60 * 1000;
    const stalledPublications = metricool.publications.filter(
      (publication) =>
        ["dispatching", "publishing"].includes(publication.status) &&
        isOlderThan(publication.updatedAt, stalledLimit, nowMs),
    );
    pushSignal(
      signals,
      signal({
        id: "metricool-publications-stalled",
        kind: "social_publish_stalled",
        sourceLabel: "yzi_imob_social_publications",
        areaLabel: "Marketing",
        whatLabel: `${stalledPublications.length} publicacao(oes) parada(s) no envio.`,
        whyLabel: `Status dispatching/publishing sem atualizacao ha mais de ${SOCIAL_STALLED_MINUTES} minutos.`,
        ruleLabel: `status in (dispatching, publishing) AND updated_at > ${SOCIAL_STALLED_MINUTES} minutos.`,
        evidenceLabel: `${stalledPublications.length} publicacao(oes) nessa janela.`,
        href: "/cockpit/yzi-imob/marketing/publicacoes",
        count: stalledPublications.length,
        lastSeenAt: latestDate(
          stalledPublications.map((publication) => ({ updated_at: publication.updatedAt })),
        ),
      }),
    );

    const attentionStatuses = new Set([
      "attention_required",
      "token_invalid",
      "plan_insufficient",
      "rate_limited",
      "failed",
    ]);
    const connectionAttention = attentionStatuses.has(metricool.connection.status) ? 1 : 0;
    pushSignal(
      signals,
      signal({
        id: "metricool-connection-attention",
        kind: "metricool_connection_attention",
        sourceLabel: "tenant_connections",
        areaLabel: "Conexoes",
        whatLabel: "Conexao Metricool requer atencao.",
        whyLabel: `Estado real da conexao: ${metricool.connection.status}.`,
        ruleLabel: "status in (attention_required, token_invalid, plan_insufficient, rate_limited, failed).",
        evidenceLabel: `status=${metricool.connection.status}.`,
        href: "/cockpit/yzi-imob/conexoes",
        count: connectionAttention,
        lastSeenAt: metricool.connection.validatedAt,
      }),
    );

    const scheduledRevisionIds = new Set(
      metricool.publications.map((publication) => publication.revisionId),
    );
    const approvedWithoutSchedule = metricool.candidates.filter(
      (candidate) =>
        candidate.revisionStatus === "approved" &&
        !scheduledRevisionIds.has(candidate.revisionId),
    );
    pushSignal(
      signals,
      signal({
        id: "metricool-approved-unscheduled",
        kind: "approved_content_unscheduled",
        sourceLabel: "yzi_imob_property_publication_revisions + yzi_imob_social_publications",
        areaLabel: "Marketing",
        whatLabel: `${approvedWithoutSchedule.length} conteudo(s) aprovado(s) sem agenda social.`,
        whyLabel: "A revisao aprovada ainda nao possui publicacao Metricool correlacionada.",
        ruleLabel: "revision.status = approved AND sem social_publication.publication_revision_id.",
        evidenceLabel: `${approvedWithoutSchedule.length} revisao(oes) sem agenda.`,
        href: "/cockpit/yzi-imob/marketing/publicacoes",
        count: approvedWithoutSchedule.length,
        lastSeenAt: null,
      }),
    );

    const metricsWindow = SOCIAL_METRICS_WINDOW_HOURS * 60 * 60 * 1000;
    const publishedWithoutMetrics = metricool.publications.filter(
      (publication) =>
        publication.status === "published" &&
        publication.metricCount === 0 &&
        isOlderThan(publication.publishedAt, metricsWindow, nowMs),
    );
    pushSignal(
      signals,
      signal({
        id: "metricool-published-without-metrics",
        kind: "social_metrics_missing",
        sourceLabel: "yzi_imob_social_publications + yzi_imob_social_metrics",
        areaLabel: "Resultados",
        whatLabel: `${publishedWithoutMetrics.length} post(s) sem metricas apos a janela esperada.`,
        whyLabel: `Publicacao concluida ha mais de ${SOCIAL_METRICS_WINDOW_HOURS} horas sem metrica persistida.`,
        ruleLabel: `status = published AND metric_count = 0 por ${SOCIAL_METRICS_WINDOW_HOURS} horas.`,
        evidenceLabel: `${publishedWithoutMetrics.length} post(s) sem coleta.`,
        href: "/cockpit/yzi-imob/marketing/publicacoes",
        count: publishedWithoutMetrics.length,
        lastSeenAt: latestDate(
          publishedWithoutMetrics.map((publication) => ({ updated_at: publication.publishedAt })),
        ),
      }),
    );

    const syncDelayed =
      ["active", "connected"].includes(metricool.connection.status) &&
      isOlderThan(
        metricool.connection.lastSyncAt,
        SOCIAL_SYNC_WINDOW_HOURS * 60 * 60 * 1000,
        nowMs,
      )
        ? 1
        : 0;
    pushSignal(
      signals,
      signal({
        id: "metricool-sync-delayed",
        kind: "social_sync_delayed",
        sourceLabel: "tenant_connections",
        areaLabel: "Resultados",
        whatLabel: "Sincronizacao Metricool atrasada.",
        whyLabel: `A ultima sincronizacao passou de ${SOCIAL_SYNC_WINDOW_HOURS} horas.`,
        ruleLabel: `connection active AND last_sync_at > ${SOCIAL_SYNC_WINDOW_HOURS} horas.`,
        evidenceLabel: metricool.connection.lastSyncAt
          ? `last_sync_at=${metricool.connection.lastSyncAt}.`
          : "last_sync_at ausente.",
        href: "/cockpit/yzi-imob/conexoes",
        count: syncDelayed,
        lastSeenAt: metricool.connection.lastSyncAt,
      }),
    );
  }

  return {
    status: "ok",
    value: {
      signals,
      sourceIssues,
    },
  };
}
