import { createServerSupabaseClient } from "@/lib/auth/session";
import { getConversation, listRecentMessages } from "@/lib/yzi-imob/conversations";
import {
  computePropertyCompleteness,
  computePropertyQuality,
  getPropertyById,
} from "@/lib/yzi-imob/properties";
import {
  computeContentHash,
  draftContactDraftContent,
  validateContactDraftContent,
  type ContactDraftMode,
} from "@/lib/yzi-imob/runtime/persistence";
import { runYziImobRuntime } from "@/lib/yzi-imob/runtime/runtime-api";
import type { RealContactContext, RuntimeRequest } from "@/lib/yzi-imob/runtime/types";

import { asRecord, readNumber, readString } from "./rpc-normalize";
import type {
  DecisionResult,
  RunStateResult,
  StartRunResult,
  YziApprovalStatus,
  YziArtifact,
  YziArtifactStatus,
  YziArtifactVisibility,
  YziDecisionReason,
  YziRun,
  YziRunActionRequest,
  YziRunStep,
  YziRunStepStatus,
  YziRunStatus,
} from "./types";

// YZI OS — Persistência da primeira fatia vertical da Capability Platform
// (Unidade 3: PREPARE_PROPERTY_CONTACT, run → step → artefato → checkpoint →
// decisão → production lock → artefato final selado; Unidade "Real Entity
// Contract": o fluxo normal lê imóvel/lead/interesse/conversa REAIS do banco,
// tenant-scoped — nenhum mock no caminho persistido). Reutiliza o pipeline
// puro do Runtime YZI IMOB (inalterado) apenas para classificar intenção,
// montar contexto e validar elegibilidade de tool — a escrita real acontece
// exclusivamente via RPCs `security_definer = false` (`runs.sql`, pack
// manual v1 + amendment v2), sob RLS, com a sessão por cookie do operador.
// NUNCA service role, SQL raw, MCP ou execução externa. NENHUMA tool externa
// é chamada; "liberar" significa apenas selar o artefato dentro do sistema.

const WORKFLOW_ID = "PREPARE_PROPERTY_CONTACT";
const ACTIVE_ASSET_TYPE = "property";

/** Códigos de erro honestos do contrato de entrada real (Fase 7 da unidade). */
export type PrepareContactInputError =
  | "property_not_found"
  | "lead_not_found"
  | "property_interest_not_found"
  | "conversation_not_found"
  | "conversation_lead_mismatch"
  | "invalid_runtime_input";

type LoadRealContextResult =
  | { status: "ok"; context: RealContactContext }
  | { status: "error"; code: PrepareContactInputError };

const RECENT_MESSAGES_LIMIT = 5;

/**
 * Lê imóvel, lead, interesse e (opcionalmente) conversa/mensagens REAIS do
 * banco, sempre filtrando por `tenant_id` — nunca confia em IDs soltos do
 * cliente sem confirmar que pertencem ao tenant. Ausência de qualquer
 * entidade é um erro honesto e nomeado (Fase 7), nunca um valor inventado.
 * As FKs compostas de `yzi_imob_run_contexts` e a RPC (Fase 4/9) revalidam o
 * mesmo vínculo no servidor — esta leitura é a primeira camada, não a única.
 */
async function loadRealContactContext(input: {
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  tenantId: string;
  propertyId: string;
  leadId: string;
  conversationId: string | null;
}): Promise<LoadRealContextResult> {
  const { supabase, tenantId, propertyId, leadId, conversationId } = input;

  const [propertyResult, leadResult, interestResult] = await Promise.all([
    getPropertyById(supabase, tenantId, propertyId),
    supabase
      .from("yzi_imob_leads")
      .select("id, full_name, phone, email, status, temperature, source, notes")
      .eq("tenant_id", tenantId)
      .eq("id", leadId)
      .maybeSingle(),
    supabase
      .from("yzi_imob_property_interests")
      .select("id, status, source, score")
      .eq("tenant_id", tenantId)
      .eq("property_id", propertyId)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (propertyResult.status === "error") {
    return { status: "error", code: "property_not_found" };
  }
  if (leadResult.error || !leadResult.data) {
    return { status: "error", code: "lead_not_found" };
  }
  if (interestResult.error || !interestResult.data) {
    return { status: "error", code: "property_interest_not_found" };
  }

  let conversation: RealContactContext["conversation"] = null;
  let recentMessages: RealContactContext["recentMessages"] = [];

  if (conversationId) {
    const conversationResult = await getConversation({ tenantId, conversationId });
    if (conversationResult.status === "error") {
      return { status: "error", code: "conversation_not_found" };
    }
    if (conversationResult.conversation.leadId !== leadId) {
      return { status: "error", code: "conversation_lead_mismatch" };
    }

    conversation = {
      id: conversationResult.conversation.id,
      channel: conversationResult.conversation.channel,
      status: conversationResult.conversation.status,
      startedAt: conversationResult.conversation.startedAt,
      lastMessageAt: conversationResult.conversation.lastMessageAt,
    };

    const messagesResult = await listRecentMessages({
      tenantId,
      conversationId,
      limit: RECENT_MESSAGES_LIMIT,
    });
    if (messagesResult.status === "ok") {
      recentMessages = messagesResult.messages.map((message) => ({
        direction: message.direction,
        senderType: message.senderType,
        body: message.body,
        createdAt: message.createdAt,
      }));
    }
  }

  const property = propertyResult.value;
  const leadRow = asRecord(leadResult.data);
  const interestRow = asRecord(interestResult.data);

  const completeness = computePropertyCompleteness(property);
  const quality = computePropertyQuality(property);

  return {
    status: "ok",
    context: {
      property: {
        id: property.id,
        title: property.title,
        referenceCode: property.referenceCode,
        propertyType: property.propertyType,
        transactionType: property.transactionType,
        status: property.status,
        city: property.city,
        neighborhood: property.neighborhood,
        price: property.price,
        description: property.description,
        completenessPercentage: completeness.percentage,
        qualityLevel: quality.level,
      },
      lead: {
        id: readString(leadRow, "id"),
        fullName: readString(leadRow, "full_name"),
        phone: typeof leadRow.phone === "string" ? leadRow.phone : null,
        email: typeof leadRow.email === "string" ? leadRow.email : null,
        status: readString(leadRow, "status"),
        temperature: typeof leadRow.temperature === "string" ? leadRow.temperature : null,
        source: typeof leadRow.source === "string" ? leadRow.source : null,
        notes: typeof leadRow.notes === "string" ? leadRow.notes : null,
      },
      interest: {
        id: readString(interestRow, "id"),
        status: readString(interestRow, "status"),
        source: typeof interestRow.source === "string" ? interestRow.source : null,
        score: typeof interestRow.score === "number" ? interestRow.score : null,
      },
      conversation,
      recentMessages,
    },
  };
}

function mapRunStatus(value: string): YziRunStatus {
  const allowed: YziRunStatus[] = [
    "running",
    "awaiting_approval",
    "done",
    "failed",
    "cancelled",
  ];
  return (allowed as string[]).includes(value) ? (value as YziRunStatus) : "failed";
}

function mapStepStatus(value: string): YziRunStepStatus {
  const allowed: YziRunStepStatus[] = ["pending", "running", "completed", "failed"];
  return (allowed as string[]).includes(value) ? (value as YziRunStepStatus) : "failed";
}

function mapArtifactVisibility(value: string): YziArtifactVisibility {
  return value === "final" ? "final" : "approval";
}

function mapArtifactStatus(value: string): YziArtifactStatus {
  const allowed: YziArtifactStatus[] = ["written", "sealed", "superseded"];
  return (allowed as string[]).includes(value) ? (value as YziArtifactStatus) : "written";
}

function mapApprovalStatus(value: string): YziApprovalStatus {
  // O enum vivo de `yzi_action_requests.status` é institucional (pending/
  // approved/rejected/executed/cancelled/blocked) e não usa "pending_review".
  // "pending" é o único valor que esta run persistida produz antes de uma
  // decisão; mapeamos explicitamente para o rótulo de UI em vez de confiar
  // no fallback abaixo, que deve tratar apenas valores realmente inesperados.
  if (value === "pending") return "pending_review";
  const allowed: YziApprovalStatus[] = [
    "pending_review",
    "approved",
    "rejected",
    "expired",
    "cancelled",
  ];
  return (allowed as string[]).includes(value)
    ? (value as YziApprovalStatus)
    : "pending_review";
}

function mapDecisionReason(value: unknown): YziDecisionReason | null {
  return value === "adjust" || value === "rework" ? value : null;
}

function mapRunRow(row: Record<string, unknown>): YziRun {
  return {
    id: readString(row, "id"),
    tenantId: readString(row, "tenant_id"),
    workflowId: readString(row, "workflow_id"),
    status: mapRunStatus(readString(row, "status")),
    cursorStep: readString(row, "cursor_step"),
    activeAssetId: readString(row, "active_asset_id"),
    contextFingerprint: readString(row, "context_fingerprint"),
    createdAt: readString(row, "created_at"),
    updatedAt: readString(row, "updated_at"),
  };
}

function mapStepRow(row: Record<string, unknown>): YziRunStep {
  return {
    id: readString(row, "id"),
    runId: readString(row, "run_id"),
    stepKey: readString(row, "step_key"),
    attempt: readNumber(row, "attempt"),
    status: mapStepStatus(readString(row, "status")),
    startedAt: typeof row.started_at === "string" ? row.started_at : null,
    completedAt: typeof row.completed_at === "string" ? row.completed_at : null,
  };
}

function mapArtifactRow(row: Record<string, unknown>): YziArtifact {
  return {
    id: readString(row, "id"),
    runId: readString(row, "run_id"),
    runStepId: readString(row, "run_step_id"),
    contractKey: readString(row, "contract_key"),
    version: readNumber(row, "version"),
    visibility: mapArtifactVisibility(readString(row, "visibility")),
    status: mapArtifactStatus(readString(row, "status")),
    content: asRecord(row.content),
    contentHash: readString(row, "content_hash"),
    createdAt: readString(row, "created_at"),
  };
}

function mapActionRequestRow(row: Record<string, unknown>): YziRunActionRequest {
  // `yzi_action_requests` não tem colunas `decided_by`/`decided_at` (evitamos
  // duplicar o contrato institucional — ver SQL pack). O ator/timestamp da
  // decisão vive em `approved_by`/`approved_at` ou `rejected_by`/`rejected_at`,
  // conforme o status; reconstruímos `decidedBy`/`decidedAt` a partir deles.
  const status = readString(row, "status");
  const decidedBy =
    status === "approved"
      ? typeof row.approved_by === "string"
        ? row.approved_by
        : null
      : status === "rejected"
        ? typeof row.rejected_by === "string"
          ? row.rejected_by
          : null
        : null;
  const decidedAt =
    status === "approved"
      ? typeof row.approved_at === "string"
        ? row.approved_at
        : null
      : status === "rejected"
        ? typeof row.rejected_at === "string"
          ? row.rejected_at
          : null
        : null;

  return {
    id: readString(row, "id"),
    runId: readString(row, "run_id"),
    runStepId: readString(row, "run_step_id"),
    artifactId: readString(row, "artifact_id"),
    artifactHash: readString(row, "artifact_hash"),
    status: mapApprovalStatus(status),
    decisionReason: mapDecisionReason(row.decision_reason),
    decisionNote: typeof row.decision_note === "string" ? row.decision_note : null,
    decidedBy,
    decidedAt,
    createdAt: readString(row, "created_at"),
  };
}

/** Status não-terminais — a "operação atual" quando nenhum `runId` é informado. */
const ACTIVE_RUN_STATUSES: readonly YziRunStatus[] = ["running", "awaiting_approval"];

/**
 * Lê o estado agregado de uma run — reconstrói TUDO a partir do banco
 * (nenhum estado do cliente é confiado). Se `runId` não for informado, busca
 * a run ATIVA mais recente (`running`/`awaiting_approval`) de
 * `PREPARE_PROPERTY_CONTACT` do tenant — runs terminais (`done`/`failed`/
 * `cancelled`) nunca são tratadas como "operação atual", para não bloquear
 * permanentemente o início de uma nova operação após a anterior concluir.
 * Se `runId` FOR informado, nenhum filtro de status é aplicado — leitura de
 * histórico/inspeção explícita continua abrindo runs de qualquer status.
 * Ausência de run é estado honesto (`no_run`), nunca inventado.
 */
export async function getPrepareContactRunState(input: {
  tenantId: string;
  runId?: string;
}): Promise<RunStateResult> {
  try {
    const supabase = await createServerSupabaseClient();

    const baseRunQuery = supabase
      .from("yzi_runs")
      .select("*")
      .eq("tenant_id", input.tenantId)
      .eq("workflow_id", WORKFLOW_ID);

    const { data: runRows, error: runError } = input.runId
      ? await baseRunQuery.eq("id", input.runId)
      : await baseRunQuery
          .in("status", ACTIVE_RUN_STATUSES)
          .order("created_at", { ascending: false })
          .limit(1);
    if (runError) {
      return { status: "error", message: "Não foi possível carregar a run." };
    }
    const runRow = Array.isArray(runRows) ? runRows[0] : null;
    if (!runRow) {
      return { status: "no_run" };
    }
    const run = mapRunRow(asRecord(runRow));

    const [stepsResult, artifactsResult, actionRequestsResult] = await Promise.all([
      supabase
        .from("yzi_run_steps")
        .select("*")
        .eq("tenant_id", input.tenantId)
        .eq("run_id", run.id)
        .order("attempt", { ascending: true }),
      supabase
        .from("yzi_artifacts")
        .select("*")
        .eq("tenant_id", input.tenantId)
        .eq("run_id", run.id)
        .order("version", { ascending: true }),
      supabase
        .from("yzi_action_requests")
        .select("*")
        .eq("tenant_id", input.tenantId)
        .eq("run_id", run.id)
        .order("created_at", { ascending: true }),
    ]);

    if (stepsResult.error || artifactsResult.error || actionRequestsResult.error) {
      return {
        status: "error",
        message: "A run foi encontrada, mas a timeline não pôde ser carregada.",
      };
    }

    const steps = (stepsResult.data ?? []).map((row) => mapStepRow(asRecord(row)));
    const artifacts = (artifactsResult.data ?? []).map((row) =>
      mapArtifactRow(asRecord(row)),
    );
    const actionRequests = (actionRequestsResult.data ?? []).map((row) =>
      mapActionRequestRow(asRecord(row)),
    );

    return { status: "loaded", state: { run, steps, artifacts, actionRequests } };
  } catch {
    return { status: "error", message: "Erro inesperado ao carregar a run." };
  }
}

function buildRuntimeRequest(params: {
  tenantId: string;
  userId: string;
  userRole: string;
  activeAssetId: string;
  realContactContext: RealContactContext;
}): RuntimeRequest {
  return {
    tenant_id: params.tenantId,
    user_id: params.userId,
    route: "/cockpit/yzi-imob/runtime",
    module: "yzi-imob",
    raw_intent: "preparar contato sobre o imóvel",
    active_asset_type: ACTIVE_ASSET_TYPE,
    active_asset_id: params.activeAssetId,
    user_role: params.userRole,
    available_connections: [],
    requested_action: "prepare_contact_followup",
    real_contact_context: params.realContactContext,
  };
}

/**
 * Inicia a run persistida. `propertyId` e `leadId` são AMBOS obrigatórios —
 * cada operação é o par explícito (imóvel, lead); nunca há inferência do
 * "primeiro interesse" nem fallback automático para qualquer lead
 * (correção desta unidade: um imóvel com dois leads produz duas operações
 * distintas e determinísticas, escolhidas explicitamente na UI).
 * `conversationId` continua opcional. Lê o contexto REAL do banco (Fase 3),
 * roda o pipeline puro do Runtime (nunca pula essa etapa) e só persiste se
 * o pipeline chegar honestamente a `READY_FOR_APPROVAL`. Gate estrutural do
 * artefato roda em código servidor antes de qualquer escrita — nunca confia
 * na "declaração" de que o conteúdo existe.
 */
export async function startPrepareContactRun(input: {
  tenantId: string;
  userId: string;
  userRole: string;
  propertyId: string;
  leadId: string;
  conversationId?: string | null;
}): Promise<StartRunResult> {
  if (!input.tenantId || !input.userId || !input.propertyId || !input.leadId) {
    return { status: "blocked", reason: "invalid_runtime_input" };
  }

  const supabase = await createServerSupabaseClient();

  const loaded = await loadRealContactContext({
    supabase,
    tenantId: input.tenantId,
    propertyId: input.propertyId,
    leadId: input.leadId,
    conversationId: input.conversationId ?? null,
  });
  if (loaded.status === "error") {
    return { status: "blocked", reason: loaded.code };
  }

  const request = buildRuntimeRequest({
    tenantId: input.tenantId,
    userId: input.userId,
    userRole: input.userRole,
    activeAssetId: input.propertyId,
    realContactContext: loaded.context,
  });
  const result = runYziImobRuntime(request);

  if (result.status !== "READY_FOR_APPROVAL" || !result.context) {
    return {
      status: "blocked",
      reason: result.blocking_reason ?? `bloqueado em ${result.stopped_at}`,
    };
  }
  if (!result.approval?.descriptor) {
    return { status: "blocked", reason: "approval_descriptor_missing" };
  }

  const content = draftContactDraftContent({
    real: loaded.context,
    contextFingerprint: result.context.fingerprint,
    mode: "initial",
  });
  const gate = validateContactDraftContent(content);
  if (!gate.valid || !content) {
    return { status: "blocked", reason: `artifact_gate_failed: ${gate.valid ? "" : gate.errors.join(",")}` };
  }
  const contentHash = computeContentHash(content);

  try {
    const { data, error } = await supabase.rpc("yzi_start_prepare_contact_run", {
      p_tenant_id: input.tenantId,
      p_property_id: input.propertyId,
      p_lead_id: input.leadId,
      p_conversation_id: input.conversationId ?? null,
      p_context_fingerprint: result.context.fingerprint,
      p_content: content,
      p_content_hash: contentHash,
    });

    if (error) {
      return {
        status: "error",
        message: "Não foi possível iniciar a run (RPC indisponível ou recusada).",
      };
    }

    const row = asRecord(Array.isArray(data) ? data[0] : data);
    const runId = readString(row, "run_id");
    if (!runId) {
      return { status: "error", message: "A run foi processada, mas sem identificador utilizável." };
    }

    const state = await getPrepareContactRunState({ tenantId: input.tenantId, runId });
    return state.status === "loaded"
      ? { status: "started", state: state.state }
      : { status: "error", message: "Run iniciada, mas não foi possível recarregar o estado." };
  } catch {
    return { status: "error", message: "Erro inesperado ao iniciar a run." };
  }
}

/**
 * Avança para o step 2 (selar artefato) APÓS a decisão `approved` já ter
 * sido registrada por `decideActionRequest`. A RPC revalida, dentro da
 * transação, que a aprovação pertence a esta run, a este gate e ao
 * `artifact_id`/hash exatos (production lock) — nunca confia no cliente.
 */
export async function advanceRunAfterApproval(input: {
  tenantId: string;
  runId: string;
  actionRequestId: string;
}): Promise<DecisionResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.rpc("yzi_advance_after_approval", {
      p_run_id: input.runId,
      p_action_request_id: input.actionRequestId,
    });

    if (error) {
      return {
        status: "error",
        message: "Não foi possível selar o artefato (lock de produção recusou ou RPC indisponível).",
      };
    }

    const state = await getPrepareContactRunState({ tenantId: input.tenantId, runId: input.runId });
    return state.status === "loaded"
      ? { status: "decided", state: state.state }
      : { status: "error", message: "Decisão aplicada, mas não foi possível recarregar o estado." };
  } catch {
    return { status: "error", message: "Erro inesperado ao selar o artefato." };
  }
}

/**
 * Registra um novo attempt do step produtor após `adjust`/`rework`. Regera o
 * conteúdo a partir do pipeline puro (nunca reaproveita o rascunho anterior
 * como fonte de verdade — `mode="rework"` explicitamente ignora o texto
 * anterior; `mode="adjust"` apenas anexa a nota humana). A run/asset vêm do
 * banco (via `getPrepareContactRunState`), nunca de um valor enviado solto
 * pelo cliente.
 */
export async function recordRunAdjustment(input: {
  tenantId: string;
  userId: string;
  userRole: string;
  runId: string;
  previousActionRequestId: string;
  mode: ContactDraftMode;
  note: string | null;
}): Promise<DecisionResult> {
  const current = await getPrepareContactRunState({ tenantId: input.tenantId, runId: input.runId });
  if (current.status !== "loaded") {
    return { status: "error", message: "Run não encontrada para registrar o ajuste." };
  }

  const supabase = await createServerSupabaseClient();
  const runContextRow = await supabase
    .from("yzi_imob_run_contexts")
    .select("property_id, lead_id, conversation_id")
    .eq("tenant_id", input.tenantId)
    .eq("run_id", input.runId)
    .maybeSingle();

  if (runContextRow.error || !runContextRow.data) {
    return { status: "error", message: "Vínculo real (imóvel/lead) da run não foi encontrado." };
  }
  const runContext = asRecord(runContextRow.data);
  const propertyId = readString(runContext, "property_id");
  const leadId = readString(runContext, "lead_id");
  const conversationId =
    typeof runContext.conversation_id === "string" ? runContext.conversation_id : null;

  const loaded = await loadRealContactContext({
    supabase,
    tenantId: input.tenantId,
    propertyId,
    leadId,
    conversationId,
  });
  if (loaded.status === "error") {
    return { status: "error", message: `Não foi possível recarregar o vínculo real: ${loaded.code}.` };
  }

  const request = buildRuntimeRequest({
    tenantId: input.tenantId,
    userId: input.userId,
    userRole: input.userRole,
    activeAssetId: current.state.run.activeAssetId,
    realContactContext: loaded.context,
  });
  const result = runYziImobRuntime(request);
  if (result.status !== "READY_FOR_APPROVAL" || !result.context) {
    return { status: "error", message: "Não foi possível recompor o contexto para o novo rascunho." };
  }

  const content = draftContactDraftContent({
    real: loaded.context,
    contextFingerprint: result.context.fingerprint,
    mode: input.mode,
    revisionNote: input.note,
  });
  const gate = validateContactDraftContent(content);
  if (!gate.valid || !content) {
    return { status: "error", message: "O novo rascunho não passou no gate estrutural." };
  }
  const contentHash = computeContentHash(content);

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.rpc("yzi_record_run_adjustment", {
      p_run_id: input.runId,
      p_previous_action_request_id: input.previousActionRequestId,
      p_mode: input.mode,
      p_new_content: content,
      p_new_content_hash: contentHash,
    });

    if (error) {
      return {
        status: "error",
        message: "Não foi possível registrar o novo rascunho (RPC indisponível ou recusada).",
      };
    }

    const state = await getPrepareContactRunState({ tenantId: input.tenantId, runId: input.runId });
    return state.status === "loaded"
      ? { status: "decided", state: state.state }
      : { status: "error", message: "Ajuste aplicado, mas não foi possível recarregar o estado." };
  } catch {
    return { status: "error", message: "Erro inesperado ao registrar o ajuste." };
  }
}
