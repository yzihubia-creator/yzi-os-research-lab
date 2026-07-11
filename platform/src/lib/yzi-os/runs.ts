import { createServerSupabaseClient } from "@/lib/auth/session";
import {
  computeContentHash,
  draftContactDraftContent,
  validateContactDraftContent,
  type ContactDraftMode,
} from "@/lib/yzi-imob/runtime/persistence";
import { runYziImobRuntime } from "@/lib/yzi-imob/runtime/runtime-api";
import type { RuntimeRequest } from "@/lib/yzi-imob/runtime/types";

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
// decisão → production lock → artefato final selado). Reutiliza o pipeline
// puro do Runtime YZI IMOB (inalterado) apenas para classificar intenção,
// montar contexto e validar elegibilidade de tool — a escrita real acontece
// exclusivamente via RPCs `security_definer = false` (`runs.sql`, pack
// manual), sob RLS, com a sessão por cookie do operador. NUNCA service role,
// SQL raw, MCP ou execução externa. NENHUMA tool externa é chamada; "liberar"
// significa apenas selar o artefato dentro do sistema.
//
// As RPCs abaixo (`yzi_start_prepare_contact_run`,
// `yzi_advance_after_approval`, `yzi_record_run_adjustment`) ainda NÃO
// existem no banco — fazem parte do SQL pack manual entregue com esta
// unidade, para aplicação por um operador humano. Até lá, toda chamada
// retorna `status: "error"` (RPC inexistente), estado honesto.

const WORKFLOW_ID = "PREPARE_PROPERTY_CONTACT";
const ACTIVE_ASSET_TYPE = "property";

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

/**
 * Lê o estado agregado de uma run — reconstrói TUDO a partir do banco
 * (nenhum estado do cliente é confiado). Se `runId` não for informado, busca
 * a run mais recente de `PREPARE_PROPERTY_CONTACT` do tenant. Ausência de run
 * é estado honesto (`no_run`), nunca inventado.
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
      : await baseRunQuery.order("created_at", { ascending: false }).limit(1);
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
  };
}

/**
 * Inicia a run persistida. Roda o pipeline puro do Runtime primeiro (nunca
 * pula essa etapa): só persiste se o pipeline chegar honestamente a
 * `READY_FOR_APPROVAL` com um Approval Descriptor para a tool de contato.
 * Gate estrutural do artefato roda em código servidor antes de qualquer
 * escrita — nunca confia na "declaração" de que o conteúdo existe.
 */
export async function startPrepareContactRun(input: {
  tenantId: string;
  userId: string;
  userRole: string;
  activeAssetId: string;
}): Promise<StartRunResult> {
  const request = buildRuntimeRequest(input);
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
    request,
    context: result.context,
    mode: "initial",
  });
  const gate = validateContactDraftContent(content);
  if (!gate.valid || !content) {
    return { status: "blocked", reason: `artifact_gate_failed: ${gate.valid ? "" : gate.errors.join(",")}` };
  }
  const contentHash = computeContentHash(content);

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("yzi_start_prepare_contact_run", {
      p_tenant_id: input.tenantId,
      p_active_asset_id: input.activeAssetId,
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

  const request = buildRuntimeRequest({
    tenantId: input.tenantId,
    userId: input.userId,
    userRole: input.userRole,
    activeAssetId: current.state.run.activeAssetId,
  });
  const result = runYziImobRuntime(request);
  if (result.status !== "READY_FOR_APPROVAL" || !result.context) {
    return { status: "error", message: "Não foi possível recompor o contexto para o novo rascunho." };
  }

  const content = draftContactDraftContent({
    request,
    context: result.context,
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
