// YZI IMOB Runtime — Registro de Workflows (Runtime Foundation, unidade 1).
//
// Catálogo declarativo dos workflows do runtime. Nesta unidade existe APENAS UM
// workflow: READ_ONLY_PROPERTY_LOOKUP. Nenhum passo é executado aqui — o
// registro apenas DECLARA o fluxo esperado; a execução é gated e fora do escopo.
//
// Aderência: Dynamic Workflows, Tool-Based Runtime, Approval First, Evidence
// First, Estados honestos. Deriva do Intent Router Spec §5 e Tool Registry §5/§11.

import type { WorkflowDefinition, WorkflowId } from "./types";

/**
 * READ_ONLY_PROPERTY_LOOKUP — o menor workflow útil: consulta de contexto de
 * imóvel, SEM efeito colateral.
 *
 * Fluxo esperado: Intent → Workflow → Context → READY_FOR_APPROVAL.
 *
 * O único passo previsto usa `yzi_imob_get_property_context` (Tool Registry §5,
 * `read_context`, side_effect `none`). Em produção um read puro não exigiria
 * Approval Queue; ainda assim, nesta unidade o runtime PARA antes de executar
 * qualquer passo. `terminal_status` é o ponto de handoff governado exigido pela
 * task (READY_FOR_APPROVAL), não uma execução.
 */
const READ_ONLY_PROPERTY_LOOKUP: WorkflowDefinition = {
  workflow_id: "READ_ONLY_PROPERTY_LOOKUP",
  title: "Consulta de imóvel (read-only)",
  intents: ["property_lookup"],
  required_context: ["tenant", "user", "workflow", "policies", "runtime", "crm"],
  allowed_tools: ["yzi_imob_get_property_context"],
  steps: [
    {
      id: "resolve_property_context",
      label: "Resolver contexto compacto do imóvel",
      tool: "yzi_imob_get_property_context",
      side_effect: "none",
      requires_approval: false,
    },
  ],
  risk_level: "low",
  terminal_status: "READY_FOR_APPROVAL",
};

/** Registro imutável de workflows disponíveis nesta unidade. */
export const WORKFLOW_REGISTRY: Readonly<Record<WorkflowId, WorkflowDefinition>> = {
  READ_ONLY_PROPERTY_LOOKUP,
};

/**
 * Retorna a definição de um workflow pelo id, ou `null` honestamente se não
 * existir. Função PURA. TODO(runtime): validar elegibilidade real por
 * plano/módulo/conexão via Tool Registry em unidade futura.
 */
export function getWorkflowDefinition(id: WorkflowId): WorkflowDefinition | null {
  return WORKFLOW_REGISTRY[id] ?? null;
}
