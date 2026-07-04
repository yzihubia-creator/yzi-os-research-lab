// YZI IMOB Runtime — YZI Orchestrator (Runtime Foundation, unidade 1).
//
// Responsabilidade ÚNICA nesta unidade: com intenção + workflow + policy +
// contexto JÁ montados, decidir a próxima ação do workflow e PARAR no ponto de
// handoff governado. Este é o local onde vive a INVARIANTE DE PARADA:
//   - NÃO chama o Tool Registry;
//   - NÃO executa nenhuma tool;
//   - NÃO cria approval item (Approval Queue está fora do escopo);
//   - NÃO altera banco/estado; NÃO faz I/O externo.
//
// Runtime Architecture §4 (Orchestrator bloqueia risco antes de executar) e
// Intent Router Spec §2 (Orchestrator fica antes do Tool Registry — aqui, STOP).

import type {
  ApprovalHandoff,
  BuiltContext,
  IntentClassification,
  PolicyDecision,
  RuntimeStatus,
  SelectedWorkflow,
  WorkflowStep,
} from "./types";

/** Insumos que o Orchestrator recebe já prontos do pipeline. */
export type OrchestrationInput = {
  intent: IntentClassification;
  workflow: SelectedWorkflow;
  policy: PolicyDecision;
  context: BuiltContext;
};

/** Saída do Orchestrator: status terminal + descritor de handoff (sem efeito). */
export type OrchestrationOutcome = {
  status: RuntimeStatus;
  approval: ApprovalHandoff;
  next_step: WorkflowStep | null;
  decision: string;
};

/**
 * Decide a próxima ação e PARA. Nunca executa. Produz um `ApprovalHandoff`
 * descritivo (`created: false`) representando o que SERIA encaminhado adiante —
 * sem criar nada. Retorna sempre o `terminal_status` do workflow
 * (READY_FOR_APPROVAL) quando o contexto está completo.
 */
export function orchestrate(input: OrchestrationInput): OrchestrationOutcome {
  const { workflow, context } = input;

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
      },
      next_step: null,
      decision: "blocked: context_incomplete",
    };
  }

  const nextStep = workflow.definition.steps[0] ?? null;

  // Descritor honesto do handoff. Para o workflow read-only, o próximo passo é
  // uma tool `read_context` (side_effect none) — que NÃO é executada aqui.
  const approval: ApprovalHandoff = {
    created: false,
    would_submit: Boolean(nextStep?.requires_approval),
    tool: nextStep?.tool ?? null,
    side_effect: nextStep?.side_effect ?? "none",
    note: nextStep
      ? `PARADA antes de executar "${nextStep.tool ?? nextStep.id}". Nenhuma tool chamada; nenhum approval criado.`
      : "Workflow sem passos executáveis declarados.",
  };

  return {
    status: workflow.definition.terminal_status, // READY_FOR_APPROVAL
    approval,
    next_step: nextStep,
    decision: `ready: contexto montado (fingerprint=${context.fingerprint}); execução permanece gated.`,
  };
}
