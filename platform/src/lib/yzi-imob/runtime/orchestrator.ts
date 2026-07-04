// YZI IMOB Runtime — YZI Orchestrator (Runtime Foundation, unidade 1 + 2).
//
// Responsabilidade: com intenção + workflow + policy + contexto JÁ montados,
// decidir a próxima ação do workflow, consultar o Tool Registry para validar
// elegibilidade (unidade 2) e PARAR no ponto de handoff governado. Este é o
// local onde vive a INVARIANTE DE PARADA:
//   - Consulta o Tool Registry apenas para ELEGIBILIDADE — nunca executa;
//   - NÃO executa nenhuma tool;
//   - NÃO cria approval item (Approval Queue está fora do escopo);
//   - NÃO altera banco/estado; NÃO faz I/O externo.
//
// Runtime Architecture §4 (Orchestrator bloqueia risco antes de executar);
// Tool Registry Spec §2 (Registry fica entre Orchestrator e Approval Queue —
// aqui, STOP acontece logo após a consulta ao Registry).

import { checkToolEligibility } from "./tool-registry";
import type {
  ApprovalDescriptor,
  ApprovalHandoff,
  BuiltContext,
  IntentClassification,
  IntentType,
  PolicyDecision,
  RuntimeErrorState,
  RuntimeRequest,
  RuntimeStatus,
  SelectedWorkflow,
  ToolMetadata,
  WorkflowId,
  WorkflowStep,
} from "./types";

/** Insumos que o Orchestrator recebe já prontos do pipeline. */
export type OrchestrationInput = {
  intent: IntentClassification;
  workflow: SelectedWorkflow;
  policy: PolicyDecision;
  context: BuiltContext;
  /** Necessário para tenant_id/requested_action (Approval Descriptor) e p/ o Tool Registry. */
  request: RuntimeRequest;
};

/** Saída do Orchestrator: status terminal + descritor de handoff (sem efeito). */
export type OrchestrationOutcome = {
  status: RuntimeStatus;
  approval: ApprovalHandoff;
  next_step: WorkflowStep | null;
  decision: string;
  /** Preenchido apenas quando o Tool Registry bloqueia (status=BLOCKED). */
  error_state: RuntimeErrorState | null;
};

/**
 * Decide a próxima ação, consulta o Tool Registry (elegibilidade, nunca
 * execução) e PARA. Retorna `terminal_status` do workflow (READY_FOR_APPROVAL)
 * quando elegível; `BLOCKED` honesto quando o contexto está incompleto ou o
 * Tool Registry recusa a tool.
 */
export function orchestrate(input: OrchestrationInput): OrchestrationOutcome {
  const { workflow, context, request, intent } = input;

  // Defesa: se o contexto não está completo, não há handoff possível.
  if (!context.complete) {
    return {
      status: "BLOCKED",
      approval: {
        created: false,
        would_submit: false,
        tool: null,
        side_effect: "none",
        note: "Contexto incompleto — Orchestrator não avança nem prepara handoff.",
        descriptor: null,
      },
      next_step: null,
      decision: "blocked: context_incomplete",
      error_state: "context_incomplete",
    };
  }

  const nextStep = workflow.definition.steps[0] ?? null;

  // Tool Registry — valida elegibilidade da tool do próximo passo. NUNCA executa.
  const eligibility = checkToolEligibility(
    nextStep?.tool ?? null,
    workflow.definition.workflow_id,
    request.tenant_id,
    context,
  );

  if (nextStep?.tool && !eligibility.eligible) {
    return {
      status: "BLOCKED",
      approval: {
        created: false,
        would_submit: false,
        tool: nextStep.tool,
        side_effect: nextStep.side_effect,
        note: `Tool Registry bloqueou: ${eligibility.reason}`,
        descriptor: null,
      },
      next_step: nextStep,
      decision: `blocked: ${eligibility.reason}`,
      error_state: eligibility.error_state ?? "workflow_not_allowed",
    };
  }

  // Aprovação exigida = passo do workflow OU contrato da própria tool (Tool
  // Registry Spec §8 — Approval Awareness). Read-only não exige; prepare_action
  // de contato exige, mesmo sendo draft_only.
  const requiresApproval =
    Boolean(nextStep?.requires_approval) || Boolean(eligibility.tool?.approval_required);

  const descriptor: ApprovalDescriptor | null =
    requiresApproval && eligibility.tool && nextStep?.tool
      ? buildApprovalDescriptor({
          tool: eligibility.tool,
          workflow_id: workflow.definition.workflow_id,
          intent_type: intent.intent_type,
          tenant_id: request.tenant_id,
          requested_action: nextStep.label,
          reason: `Tool "${nextStep.tool}" tem side_effect="${eligibility.tool.side_effects}" e risk_level="${eligibility.tool.risk_level}" — exige aprovação humana antes de qualquer execução (Human-in-the-loop).`,
        })
      : null;

  const approval: ApprovalHandoff = {
    created: false,
    would_submit: requiresApproval,
    tool: nextStep?.tool ?? null,
    side_effect: nextStep?.side_effect ?? "none",
    note: nextStep
      ? `PARADA antes de executar "${nextStep.tool ?? nextStep.id}". Nenhuma tool chamada; nenhum approval criado.`
      : "Workflow sem passos executáveis declarados.",
    descriptor,
  };

  return {
    status: workflow.definition.terminal_status, // READY_FOR_APPROVAL
    approval,
    next_step: nextStep,
    decision: `ready: contexto montado (fingerprint=${context.fingerprint}); tool "${nextStep?.tool ?? "n/a"}" elegível=${eligibility.eligible}; execução permanece gated.`,
    error_state: null,
  };
}

/**
 * Monta o Approval Descriptor — contrato mínimo, sem persistência/fila/banco.
 * `approval_id` é determinístico e puro (sem Date.now()/random): apenas
 * identifica o par tenant/workflow/tool para inspeção, nunca é armazenado.
 */
function buildApprovalDescriptor(params: {
  tool: ToolMetadata;
  workflow_id: WorkflowId;
  intent_type: IntentType;
  tenant_id: string;
  requested_action: string;
  reason: string;
}): ApprovalDescriptor {
  return {
    approval_id: `mock:${params.tenant_id}:${params.workflow_id}:${params.tool.tool_name}`,
    workflow_id: params.workflow_id,
    intent: params.intent_type,
    tenant_id: params.tenant_id,
    tool_id: params.tool.tool_name,
    risk_level: params.tool.risk_level,
    reason: params.reason,
    requested_action: params.requested_action,
    estimated_side_effect: params.tool.side_effects,
    estimated_usage: "not_metered (skeleton — Usage Engine fora do escopo desta unidade)",
    estimated_credits: "not_charged (skeleton — Credits Engine fora do escopo desta unidade)",
    created: false,
  };
}
