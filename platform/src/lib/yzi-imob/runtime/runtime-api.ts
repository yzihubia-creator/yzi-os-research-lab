// YZI IMOB Runtime — Runtime API (Runtime Foundation, unidade 1 + 2).
//
// ENTRADA ÚNICA do runtime (Runtime Architecture §4: "entrada única para
// intenções; todo request carrega tenant_id"). NÃO é endpoint REST, NÃO é rota
// Next.js, NÃO é CRUD: é uma função de orquestração pura que sequencia o
// pipeline arquitetural e retorna um objeto honesto.
//
//   Runtime API → Intent Router → Workflow Selector → Policy → Context Builder
//                → YZI Orchestrator → Tool Registry → Approval Descriptor
//                → STOP (READY_FOR_APPROVAL)
//
// Unidade 2 estende o pipeline com o estágio Tool Registry (Tool Registry Spec
// §2: fica entre Orchestrator e Approval Queue) — aplicado aos dois workflows
// existentes, não apenas ao novo. Invariante: nenhuma ação real, nenhuma tool
// executada, nenhum approval criado, nenhum banco tocado. Qualquer bloqueio
// para de forma honesta e explícita.

import { buildContext } from "./context-builder";
import { routeIntent } from "./intent-router";
import { orchestrate } from "./orchestrator";
import { applyPolicy } from "./policy";
import { selectWorkflow } from "./workflow-selector";
import type {
  RuntimeErrorState,
  RuntimeRequest,
  RuntimeResult,
  RuntimeStage,
} from "./types";

/**
 * Executa o menor Runtime possível para uma intenção e PARA antes da execução.
 * Função PURA e síncrona: sem I/O, sem rede, sem banco, sem credenciais.
 */
export function runYziImobRuntime(request: RuntimeRequest): RuntimeResult {
  const stages: RuntimeStage[] = ["runtime_api"];
  const decisions: string[] = [];

  const fail = (
    stopped_at: RuntimeStage,
    error_state: RuntimeErrorState,
    blocking_reason: string,
    partial: Partial<RuntimeResult>,
  ): RuntimeResult => ({
    status: "BLOCKED",
    stopped_at,
    intent: partial.intent ?? null,
    workflow: partial.workflow ?? null,
    policy: partial.policy ?? null,
    context: partial.context ?? null,
    approval: null,
    error_state,
    blocking_reason,
    evidence: {
      received_request: request,
      stages_completed: stages,
      decisions,
      no_side_effects: true,
    },
    notes: NOTES,
  });

  // 1) Intent Router — classifica a intenção.
  stages.push("intent_router");
  const routed = routeIntent(request);
  decisions.push(`intent_router: intent_type=${routed.intent_type} confidence=${routed.confidence}`);
  if (routed.blocking_reason) {
    return fail("intent_router", mapIntentError(routed.blocking_reason), routed.blocking_reason, {
      intent: routed,
    });
  }

  // 2) Workflow Selector — escolhe o workflow e enriquece a classificação.
  stages.push("workflow_selector");
  const selection = selectWorkflow(routed);
  decisions.push(
    `workflow_selector: workflow_id=${selection.intent.workflow_id ?? "none"}`,
  );
  if (!selection.selected) {
    const reason = selection.intent.blocking_reason ?? "workflow_not_allowed.";
    return fail("workflow_selector", "workflow_not_allowed", reason, {
      intent: selection.intent,
    });
  }

  // 3) Policy / Governance — valida tenant boundary e política de aprovação.
  stages.push("policy");
  const policy = applyPolicy(request, selection.selected, selection.intent);
  decisions.push(`policy: allowed=${policy.allowed} approval_required=${policy.approval_required}`);
  if (!policy.allowed) {
    return fail("policy", policy.error_state ?? "blocked_by_policy", policy.reason, {
      intent: selection.intent,
      workflow: selection.selected,
      policy,
    });
  }

  // 4) Context Builder — monta o menor contexto útil (só dados mockados).
  stages.push("context_builder");
  const context = buildContext(request, selection.selected, policy);
  decisions.push(`context_builder: complete=${context.complete} blocks=${context.blocks.length}`);
  if (!context.complete) {
    return fail("context_builder", context.error_state ?? "context_incomplete",
      `context_incomplete: ${context.error_state ?? "não foi possível montar o contexto."}`, {
        intent: selection.intent,
        workflow: selection.selected,
        policy,
        context,
      });
  }

  // 5) YZI Orchestrator — decide próxima ação, consulta o Tool Registry
  //    internamente (elegibilidade, nunca execução) e PARA (STOP).
  stages.push("orchestrator");
  const outcome = orchestrate({
    intent: selection.intent,
    workflow: selection.selected,
    policy,
    context,
    request,
  });
  decisions.push(`orchestrator: status=${outcome.status} decision=${outcome.decision}`);

  // 6) Tool Registry — estágio de evidência: a checagem já ocorreu dentro do
  //    Orchestrator (posição arquitetural fixa, Tool Registry Spec §2); aqui
  //    apenas registramos o estágio e, se o Registry bloqueou, paramos honestos.
  if (outcome.status === "BLOCKED") {
    return fail("tool_registry", outcome.error_state ?? "workflow_not_allowed", outcome.decision, {
      intent: selection.intent,
      workflow: selection.selected,
      policy,
      context,
    });
  }
  stages.push("tool_registry");
  decisions.push(
    `tool_registry: tool=${outcome.approval.tool ?? "none"} would_submit=${outcome.approval.would_submit} descriptor=${outcome.approval.descriptor ? "generated" : "none"}`,
  );

  return {
    status: outcome.status, // READY_FOR_APPROVAL
    stopped_at: "tool_registry",
    intent: selection.intent,
    workflow: selection.selected,
    policy,
    context,
    approval: outcome.approval,
    error_state: null,
    blocking_reason: null,
    evidence: {
      received_request: request,
      stages_completed: stages,
      decisions,
      no_side_effects: true,
    },
    notes: NOTES,
  };
}

/** Notas honestas anexadas a todo resultado — reforçam a invariante do skeleton. */
const NOTES: readonly string[] = [
  "Runtime de validação arquitetural: para no handoff, não executa nada.",
  "Nenhuma tool foi chamada; nenhum approval foi criado; nenhum banco foi tocado.",
  "Dados de imóvel são mockados internos; não há acesso a API, Supabase ou credenciais.",
];

/** Mapeia a razão textual do Intent Router para um error_state honesto. */
function mapIntentError(reason: string): RuntimeErrorState {
  if (reason.startsWith("tenant_missing")) return "tenant_missing";
  if (reason.startsWith("user_missing")) return "user_missing";
  if (reason.startsWith("intent_unknown")) return "intent_unknown";
  if (reason.startsWith("intent_ambiguous")) return "intent_ambiguous";
  return "intent_unknown";
}
