"use server";

import {
  createYziChatSession,
  createYziUserChatMessage,
} from "./chat";
import { decideActionRequest } from "./run-decision";
import {
  advanceRunAfterApproval,
  getPrepareContactRunState,
  recordRunAdjustment,
  startPrepareContactRun,
} from "./runs";
import type {
  CreateChatMessageResult,
  CreateChatSessionResult,
  DecisionResult,
  RunStateResult,
  StartRunResult,
} from "./types";

// Server Actions da camada YZI OS — ponte fina entre o Client Component do chat
// e as RPCs seguras. Por serem Server Actions ("use server"), executam no
// servidor com a sessão por cookie do operador (anon key, RLS) — NUNCA service
// role, SQL raw, MCP, API externa ou automação. Validação/limite real de acesso
// vive na RPC (security_definer = false) + RLS; aqui apenas saneamos a entrada.

/**
 * Inicia uma sessão de conversa (mode "decide"). O título é opcional; quando
 * vazio, usa um rótulo neutro. NÃO envia mensagem nem gera resposta da YZI.
 */
export async function startYziChatSessionAction(input: {
  tenantId: string;
  title?: string;
}): Promise<CreateChatSessionResult> {
  const title = input.title?.trim() || "Conversa com a YZI";
  return createYziChatSession({
    tenantId: input.tenantId,
    title,
    mode: "decide",
    contextScope: {},
  });
}

/**
 * Registra uma mensagem do usuário numa sessão existente. Recusa conteúdo vazio
 * com mensagem honesta. NÃO gera resposta da YZI, NÃO executa nada externo.
 */
export async function sendYziUserChatMessageAction(input: {
  tenantId: string;
  sessionId: string;
  content: string;
}): Promise<CreateChatMessageResult> {
  const content = input.content?.trim() ?? "";
  if (!content) {
    return { status: "error", message: "Escreva uma mensagem antes de enviar." };
  }
  if (!input.sessionId) {
    return {
      status: "error",
      message: "Inicie uma conversa antes de enviar a mensagem.",
    };
  }

  return createYziUserChatMessage({
    tenantId: input.tenantId,
    sessionId: input.sessionId,
    content,
  });
}

// ── Persisted Run Slice (Unidade 3) — Server Actions ────────────────────
//
// Ponte fina entre o workspace do cockpit (`YziImobRunWorkspace`, Client
// Component) e a camada de persistência (`runs.ts` / `run-decision.ts`). O
// avanço do workflow (selar artefato ou criar novo attempt) é decidido AQUI,
// no servidor, nunca pela UI: cada ação de decisão primeiro registra a
// decisão via RPC e só então chama a função de avanço correspondente,
// sempre relendo o estado do banco antes de retornar.

/**
 * Inicia a run `PREPARE_PROPERTY_CONTACT` para o par (imóvel, lead)
 * informado. `activeAssetId` é o `property_id` real (nome do campo
 * preservado para não exigir mudança na UI já aprovada). `leadId` é
 * OBRIGATÓRIO — cada operação é o par explícito (imóvel, lead); nunca há
 * inferência do "primeiro interesse" nem fallback automático para qualquer
 * lead. `conversationId` continua opcional.
 */
export async function startPrepareContactRunAction(input: {
  tenantId: string;
  userId: string;
  userRole: string;
  activeAssetId: string;
  leadId: string;
  conversationId?: string | null;
}): Promise<StartRunResult> {
  if (!input.tenantId || !input.userId || !input.activeAssetId || !input.leadId) {
    return { status: "error", message: "Dados insuficientes para iniciar a run." };
  }
  return startPrepareContactRun({
    tenantId: input.tenantId,
    userId: input.userId,
    userRole: input.userRole,
    propertyId: input.activeAssetId,
    leadId: input.leadId,
    conversationId: input.conversationId,
  });
}

/** Recarrega o estado da run a partir do banco (reload/estado inicial). */
export async function refreshPrepareContactRunAction(input: {
  tenantId: string;
  runId?: string;
}): Promise<RunStateResult> {
  return getPrepareContactRunState(input);
}

/** Aprova o checkpoint e avança para o step 2 (selar artefato final). */
export async function approveCheckpointAction(input: {
  tenantId: string;
  runId: string;
  actionRequestId: string;
}): Promise<DecisionResult> {
  const decided = await decideActionRequest({
    actionRequestId: input.actionRequestId,
    decision: "approved",
    decisionReason: null,
    decisionNote: null,
  });
  if (decided.status === "error") {
    return { status: "error", message: decided.message };
  }
  return advanceRunAfterApproval({
    tenantId: input.tenantId,
    runId: input.runId,
    actionRequestId: input.actionRequestId,
  });
}

/** Solicita ajuste: mantém a mesma base factual, anexa a nota do gestor. */
export async function requestAdjustmentAction(input: {
  tenantId: string;
  userId: string;
  userRole: string;
  runId: string;
  actionRequestId: string;
  note: string;
}): Promise<DecisionResult> {
  const note = input.note.trim();
  if (!note) {
    return { status: "error", message: "Descreva o ajuste antes de enviar." };
  }
  const decided = await decideActionRequest({
    actionRequestId: input.actionRequestId,
    decision: "rejected",
    decisionReason: "adjust",
    decisionNote: note,
  });
  if (decided.status === "error") {
    return { status: "error", message: decided.message };
  }
  return recordRunAdjustment({
    tenantId: input.tenantId,
    userId: input.userId,
    userRole: input.userRole,
    runId: input.runId,
    previousActionRequestId: input.actionRequestId,
    mode: "adjust",
    note,
  });
}

/** Solicita reformulação: descarta o rascunho anterior como autoridade. */
export async function requestReworkAction(input: {
  tenantId: string;
  userId: string;
  userRole: string;
  runId: string;
  actionRequestId: string;
  note: string;
}): Promise<DecisionResult> {
  const note = input.note.trim();
  if (!note) {
    return { status: "error", message: "Descreva o motivo da reformulação antes de enviar." };
  }
  const decided = await decideActionRequest({
    actionRequestId: input.actionRequestId,
    decision: "rejected",
    decisionReason: "rework",
    decisionNote: note,
  });
  if (decided.status === "error") {
    return { status: "error", message: decided.message };
  }
  return recordRunAdjustment({
    tenantId: input.tenantId,
    userId: input.userId,
    userRole: input.userRole,
    runId: input.runId,
    previousActionRequestId: input.actionRequestId,
    mode: "rework",
    note,
  });
}
