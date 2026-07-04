// YZI IMOB Runtime — Workflow Selector (Runtime Foundation, unidade 1).
//
// Responsabilidade ÚNICA: escolher o workflow operacional permitido para uma
// intenção JÁ classificada e enriquecer a classificação com o contexto exigido
// e as tools permitidas. Não monta contexto, não aplica policy, não chama tool.
//
// Regra (Intent Router Spec §10 / Tool Registry §11): só oferece tools cujos
// `supported_workflows` incluem o workflow ativo. Aqui as tools vêm da própria
// definição do workflow (allowed_tools), coerente com o Tool Registry.

import type { IntentClassification, SelectedWorkflow, WorkflowId } from "./types";
import { getWorkflowDefinition, WORKFLOW_REGISTRY } from "./workflows";

/** Mapa intent → workflow desta unidade (apenas o read-only lookup). */
const INTENT_TO_WORKFLOW: Partial<Record<string, WorkflowId>> = {
  property_lookup: "READ_ONLY_PROPERTY_LOOKUP",
};

/** Resultado da seleção: workflow escolhido + classificação enriquecida. */
export type WorkflowSelection = {
  selected: SelectedWorkflow | null;
  /** Classificação com workflow_id/allowed_tools/required_context preenchidos. */
  intent: IntentClassification;
};

/**
 * Seleciona o workflow para a intenção classificada. Se a intenção já veio
 * bloqueada, propaga o bloqueio sem escolher nada. Se nenhum workflow atende a
 * intenção, marca `workflow_not_allowed` de forma honesta.
 */
export function selectWorkflow(intent: IntentClassification): WorkflowSelection {
  // Intenção bloqueada na etapa anterior: nada a selecionar.
  if (intent.blocking_reason || intent.intent_type === "blocked_or_unknown") {
    return { selected: null, intent };
  }

  const workflowId = INTENT_TO_WORKFLOW[intent.intent_type];
  const definition = workflowId ? getWorkflowDefinition(workflowId) : null;

  if (!definition) {
    return {
      selected: null,
      intent: {
        ...intent,
        blocking_reason: `workflow_not_allowed: nenhum workflow para intent "${intent.intent_type}".`,
      },
    };
  }

  // Enriquecimento do Output §7: workflow_id, tools, contexto, approval, risco.
  const enrichedIntent: IntentClassification = {
    ...intent,
    workflow_id: definition.workflow_id,
    required_context: definition.required_context,
    allowed_tools: definition.allowed_tools,
    approval_required: definition.steps.some((s) => s.requires_approval),
    risk_level: definition.risk_level,
  };

  return {
    selected: {
      definition,
      reason: `intent "${intent.intent_type}" atende ao workflow ${definition.workflow_id}.`,
    },
    intent: enrichedIntent,
  };
}

/** Exposto para inspeção/validação — lista de workflows conhecidos. */
export function listKnownWorkflows(): readonly WorkflowId[] {
  return Object.keys(WORKFLOW_REGISTRY) as WorkflowId[];
}
