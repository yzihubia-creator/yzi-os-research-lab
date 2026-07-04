// YZI IMOB Runtime — Tool Registry (Runtime Foundation, unidade 2).
//
// Responsabilidade ÚNICA: declarar o catálogo de tools do runtime e validar
// ELEGIBILIDADE (tenant, workflow, contexto) — NUNCA executar. Posição
// arquitetural fixa (Tool Registry Spec v0.1 §2): entre o YZI Orchestrator e a
// Approval Queue.
//
// Regra forte (Spec §3): `O Registry decide o que pode; o Executor faz o que
// foi aprovado. Nunca se confundem.` Este módulo não tem Executor: não há
// nenhuma chamada de rede, banco, storage ou API — apenas checagem declarativa.
//
// Catálogo restrito às tools usadas pelos workflows já implementados
// (READ_ONLY_PROPERTY_LOOKUP, PREPARE_PROPERTY_CONTACT). Evita abstração
// antecipada: as demais tools do Tool Registry Spec §5
// (yzi_imob_prepare_property_page, yzi_imob_prepare_ad_brief,
// yzi_imob_get_lead_context, yzi_imob_submit_for_human_approval,
// yzi_imob_record_learning, yzi_imob_check_connection_status) entram quando um
// workflow futuro exigi-las.
// TODO(runtime): completar o catálogo conforme novos workflows chegarem.

import type {
  BuiltContext,
  RuntimeToolName,
  ToolEligibilityResult,
  ToolMetadata,
  WorkflowId,
} from "./types";

/** Catálogo declarativo — Tool Registry Spec §4, §5, §11. */
const TOOL_REGISTRY: Partial<Record<RuntimeToolName, ToolMetadata>> = {
  yzi_imob_get_property_context: {
    tool_name: "yzi_imob_get_property_context",
    description: "Retorna contexto compacto do imóvel (leitura pura, sem efeito).",
    category: "property",
    tenant_scope: "tenant",
    side_effects: "none",
    risk_level: "low",
    supported_workflows: ["READ_ONLY_PROPERTY_LOOKUP"],
    required_context: ["tenant", "user", "crm"],
    approval_required: false,
  },
  yzi_imob_prepare_followup: {
    tool_name: "yzi_imob_prepare_followup",
    description: "Prepara rascunho de contato/follow-up sobre o imóvel; nunca envia.",
    category: "property_contact",
    tenant_scope: "tenant",
    side_effects: "draft_only",
    risk_level: "medium",
    supported_workflows: ["PREPARE_PROPERTY_CONTACT"],
    required_context: ["tenant", "user", "crm"],
    // Conservador por princípio (Human-in-the-loop / Runtime Arch §9): todo
    // rascunho que pode virar contato real com cliente exige sign-off humano
    // antes de qualquer envio, mesmo sendo side_effect=draft_only.
    approval_required: true,
  },
};

/** Retorna os metadados de uma tool, ou `null` honestamente se não registrada. */
export function getToolMetadata(tool: RuntimeToolName): ToolMetadata | null {
  return TOOL_REGISTRY[tool] ?? null;
}

/**
 * Valida a elegibilidade de uma tool para o workflow/tenant/contexto atuais.
 * NÃO executa a tool. Falhas honestas (Spec §15): `tool_not_registered`,
 * `tenant_missing`, `workflow_not_allowed`, `context_required`.
 *
 * TODO(runtime): `required_context` da tool usa `ContextSourceId` (fontes),
 *   enquanto o `BuiltContext` expõe `ContextBlockId` (blocos já montados) — os
 *   dois vocabulários ainda não têm mapeamento fino (fica para o Tool Registry
 *   Data Model, unidade futura). Por ora, valida apenas que o contexto foi
 *   montado com sucesso (`complete=true`) antes de considerar a tool elegível.
 */
export function checkToolEligibility(
  tool: RuntimeToolName | null,
  workflow_id: WorkflowId,
  tenant_id: string,
  context: BuiltContext,
): ToolEligibilityResult {
  if (!tool) {
    return {
      eligible: false,
      tool: null,
      reason: "Nenhuma tool associada ao próximo passo do workflow.",
      error_state: null,
    };
  }

  const metadata = getToolMetadata(tool);
  if (!metadata) {
    return {
      eligible: false,
      tool: null,
      reason: `tool_not_registered: "${tool}" não está no catálogo do Tool Registry.`,
      error_state: "tool_not_registered",
    };
  }

  if (!tenant_id) {
    return {
      eligible: false,
      tool: metadata,
      reason: "tenant_missing: tool exige tenant ativo.",
      error_state: "tenant_missing",
    };
  }

  if (!metadata.supported_workflows.includes(workflow_id)) {
    return {
      eligible: false,
      tool: metadata,
      reason: `workflow_not_allowed: "${tool}" não suporta o workflow "${workflow_id}".`,
      error_state: "workflow_not_allowed",
    };
  }

  if (!context.complete) {
    return {
      eligible: false,
      tool: metadata,
      reason: "context_required: contexto incompleto — tool não fica elegível.",
      error_state: "context_required",
    };
  }

  return {
    eligible: true,
    tool: metadata,
    reason: `"${tool}" elegível para "${workflow_id}" (nenhuma execução ocorre aqui).`,
    error_state: null,
  };
}
