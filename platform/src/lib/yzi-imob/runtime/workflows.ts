// YZI IMOB Runtime — Registro de Workflows (Runtime Foundation, unidade 1 + 2).
//
// Catálogo declarativo dos workflows do runtime. Unidade 1: READ_ONLY_PROPERTY_
// LOOKUP (read-only, sem approval). Unidade 2: PREPARE_PROPERTY_CONTACT
// (primeiro workflow que atravessa a fronteira de aprovação). Nenhum passo é
// executado aqui — o registro apenas DECLARA o fluxo esperado; a execução é
// gated e fora do escopo.
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

/**
 * PROPERTY_SEARCH — primeira CAPABILITY de produto do YZI IMOB (Property Search
 * v0). O cliente descreve o que procura; o runtime classifica a busca, monta o
 * contexto mínimo e para no handoff. O matching real (read-only, sobre o
 * catálogo do tenant) é o que a tool `yzi_imob_search_properties` FARIA — nesta
 * unidade nada é executado: a capability compõe o resultado a partir de dados
 * mockados internos, sem efeito colateral.
 *
 * Fluxo esperado: Intent → Workflow → Policy → Context → READY_FOR_APPROVAL.
 * Read-only (`side_effect: none`), sem approval — descoberta não muda estado.
 */
const PROPERTY_SEARCH: WorkflowDefinition = {
  workflow_id: "PROPERTY_SEARCH",
  title: "Buscar imóvel para o cliente (read-only)",
  intents: ["property_search"],
  required_context: ["tenant", "user", "workflow", "policies", "runtime", "crm"],
  allowed_tools: ["yzi_imob_search_properties"],
  steps: [
    {
      id: "match_properties",
      label: "Casar critério do cliente com o catálogo do tenant",
      tool: "yzi_imob_search_properties",
      side_effect: "none",
      requires_approval: false,
    },
  ],
  risk_level: "low",
  terminal_status: "READY_FOR_APPROVAL",
};

/**
 * PREPARE_PROPERTY_CONTACT — primeiro workflow que atravessa a fronteira de
 * aprovação (unidade 2, Approval-Only Vertical Slice).
 *
 * Fluxo esperado: Intent → Workflow → Policy → Context → Orchestrator →
 * Tool Registry → Approval Descriptor → STOP.
 *
 * O único passo previsto usa `yzi_imob_prepare_followup` (Tool Registry §5,
 * `prepare_action`, side_effect `draft_only`) — prepara um rascunho de contato
 * sobre o imóvel, nunca envia. `requires_approval=true`: por princípio
 * (Human-in-the-loop / Runtime Architecture §9), qualquer rascunho que possa
 * originar contato real com cliente exige aprovação humana antes de avançar,
 * mesmo sendo `draft_only`. O runtime PARA antes de qualquer execução ou
 * criação de approval item — a Approval Queue está fora do escopo desta unidade.
 */
const PREPARE_PROPERTY_CONTACT: WorkflowDefinition = {
  workflow_id: "PREPARE_PROPERTY_CONTACT",
  title: "Preparar contato sobre o imóvel (draft, aprovação obrigatória)",
  intents: ["property_contact_prepare"],
  required_context: ["tenant", "user", "workflow", "policies", "runtime", "crm"],
  allowed_tools: ["yzi_imob_prepare_followup"],
  steps: [
    {
      id: "prepare_contact_followup",
      label: "Preparar rascunho de contato/follow-up sobre o imóvel",
      tool: "yzi_imob_prepare_followup",
      side_effect: "draft_only",
      requires_approval: true,
    },
  ],
  risk_level: "medium",
  terminal_status: "READY_FOR_APPROVAL",
};

/** Registro imutável de workflows disponíveis nesta unidade. */
export const WORKFLOW_REGISTRY: Readonly<Record<WorkflowId, WorkflowDefinition>> = {
  READ_ONLY_PROPERTY_LOOKUP,
  PROPERTY_SEARCH,
  PREPARE_PROPERTY_CONTACT,
};

/**
 * Retorna a definição de um workflow pelo id, ou `null` honestamente se não
 * existir. Função PURA. TODO(runtime): validar elegibilidade real por
 * plano/módulo/conexão via Tool Registry em unidade futura.
 */
export function getWorkflowDefinition(id: WorkflowId): WorkflowDefinition | null {
  return WORKFLOW_REGISTRY[id] ?? null;
}
