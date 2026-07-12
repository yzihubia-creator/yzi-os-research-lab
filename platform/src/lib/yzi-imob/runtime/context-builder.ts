// YZI IMOB Runtime — Context Builder (Runtime Foundation, unidade 1).
//
// Responsabilidade ÚNICA: montar o MENOR contexto útil para o Orchestrator
// decidir a próxima ação de um workflow JÁ classificado e autorizado. Não decide
// ação, não chama tool, não executa. Context Builder Spec §1, §2, §3.
//
// Regra forte (Spec §1): `A YZI só deve ver o que é necessário para a próxima
// decisão do workflow ativo.` Filtra por tenant; nunca inclui segredo; faltante
// vira erro honesto, nunca preenchimento inventado (Spec §2, §7).

import {
  findMockProperty,
  isLookupSupportedAsset,
  listMockPropertiesForTenant,
} from "./mock-data";
import type {
  BuiltContext,
  ContextBlock,
  PolicyDecision,
  RealContactContext,
  RuntimeErrorState,
  RuntimeRequest,
  SelectedWorkflow,
  WorkflowId,
} from "./types";

/**
 * Monta o pacote de contexto para o workflow selecionado. Só monta os blocos
 * exigidos pelo `required_context` do workflow (Spec §12). Usa APENAS dados
 * mockados internos (nenhum banco/API). Retorna `complete=false` com
 * `error_state` honesto quando não pode montar com segurança (Spec §7, §13).
 */
export function buildContext(
  request: RuntimeRequest,
  workflow: SelectedWorkflow,
  policy: PolicyDecision,
): BuiltContext {
  const workflow_id = workflow.definition.workflow_id;
  const blocks: ContextBlock[] = [];

  // Ordem de prioridade conceitual — Context Builder Spec §6.
  // 1 Core: identidade invariante do módulo (nunca cortada por orçamento).
  blocks.push({
    id: "core",
    priority: 1,
    provenance: "runtime:core-invariants",
    freshness: "fresh",
    summary:
      "YZI IMOB — operação comercial centrada no imóvel. Multi-tenant; execução sempre gated por humano.",
  });

  // 2 Tenant: boundary + plano (aqui, mínimo honesto do skeleton).
  blocks.push({
    id: "tenant",
    priority: 2,
    provenance: `policy:tenant-check tenant_id=${request.tenant_id}`,
    freshness: "fresh",
    summary: `Tenant ativo="${request.tenant_id}"; boundary validado=${policy.tenant_ok}.`,
  });

  // 3 Workflow: passo atual, output contract e tools previstas.
  blocks.push({
    id: "workflow",
    priority: 3,
    provenance: `workflow-registry:${workflow_id}`,
    freshness: "fresh",
    summary: `Workflow=${workflow_id}; passo="${workflow.definition.steps[0]?.id ?? "n/a"}"; tools=${workflow.definition.allowed_tools.join(", ")}.`,
  });

  // 4 Approval: o que exige humano antes de executar (aqui: read-only).
  blocks.push({
    id: "approval",
    priority: 4,
    provenance: "policy:approval-awareness",
    freshness: "fresh",
    summary: policy.approval_required
      ? "Este workflow exige aprovação humana antes de qualquer execução."
      : "Workflow read-only — sem approval item; execução mesmo assim NÃO ocorre nesta unidade.",
  });

  // 5 Execution: para lookup/contato, o ativo é UM imóvel (resolvido de mock,
  //   filtrado por tenant); para PROPERTY_SEARCH, o "ativo" é o CRITÉRIO do
  //   cliente sobre o catálogo do tenant (a busca não tem imóvel ativo ainda).
  const executionBlock = buildExecutionBlock(request, workflow_id);
  if (executionBlock.block === null) {
    return {
      workflow_id,
      blocks,
      fingerprint: "",
      complete: false,
      error_state: executionBlock.error,
    };
  }
  blocks.push(executionBlock.block);

  // 6 Tool: tools permitidas e contrato resumido (via allowed_tools).
  blocks.push({
    id: "tool",
    priority: 6,
    provenance: "tool-registry:allowed-tools",
    freshness: "fresh",
    summary: `Tools permitidas (não executadas): ${workflow.definition.allowed_tools.join(", ")}.`,
  });

  return {
    workflow_id,
    blocks,
    fingerprint: computeFingerprint(workflow_id, request.tenant_id, blocks),
    complete: true,
    error_state: null,
  };
}

/** Monta o bloco de execução (ativo property, ou critério de busca) ou erro. */
function buildExecutionBlock(
  request: RuntimeRequest,
  workflow_id: WorkflowId,
):
  | { block: ContextBlock; error: null }
  | { block: null; error: RuntimeErrorState } {
  // PREPARE_PROPERTY_CONTACT no fluxo normal usa SEMPRE contexto real
  // (banco, tenant-scoped), pré-carregado pela persistência. Nunca cai para
  // mock em produção — faltante é erro honesto (`context_required`), nunca
  // preenchimento inventado (Spec §2).
  if (workflow_id === "PREPARE_PROPERTY_CONTACT") {
    if (!request.real_contact_context) {
      return { block: null, error: "context_required" };
    }
    return { block: buildRealExecutionBlock(request.real_contact_context), error: null };
  }

  // PROPERTY_SEARCH não tem imóvel ativo: o ativo é o CATÁLOGO do tenant sobre o
  // qual a busca vai casar. Bloco de escopo (read-only), sem inventar imóvel.
  if (workflow_id === "PROPERTY_SEARCH") {
    const catalogSize = listMockPropertiesForTenant(request.tenant_id).length;
    return {
      block: {
        id: "execution",
        priority: 5,
        provenance: `mock-data:catalog tenant_id=${request.tenant_id} size=${catalogSize}`,
        freshness: "fresh",
        summary: `Busca de imóvel — matching read-only sobre ${catalogSize} imóvel(is) do tenant "${request.tenant_id}". Critério vem do pedido do cliente; nenhum imóvel é alterado.`,
      },
      error: null,
    };
  }

  if (!isLookupSupportedAsset(request.active_asset_type) || !request.active_asset_id) {
    return { block: null, error: "asset_missing" };
  }

  const property = findMockProperty(request.tenant_id, request.active_asset_id);
  if (!property) {
    // Faltante vira erro, nunca preenchimento inventado (Spec §2).
    return { block: null, error: "asset_missing" };
  }

  const missing =
    property.missing_fields.length > 0
      ? `faltantes=[${property.missing_fields.join(", ")}]`
      : "faltantes=[nenhum]";

  return {
    block: {
      id: "execution",
      priority: 5,
      provenance: `mock-data:property tenant_id=${property.tenant_id} property_id=${property.property_id}`,
      freshness: "fresh",
      summary: `Imóvel "${property.title}" (status=${property.status}); mídia=${property.media_count}; ${missing}; próxima ação="${property.next_action}".`,
    },
    error: null,
  };
}

/**
 * Monta o bloco `execution` a partir de dados REAIS (property/lead/interest/
 * conversation), já lidos e validados tenant-scoped pela persistência. Função
 * PURA — apenas formata; não decide nem consulta nada.
 */
function buildRealExecutionBlock(real: RealContactContext): ContextBlock {
  const { property, lead, interest, conversation, recentMessages } = real;
  const conversationPart = conversation
    ? `conversa=${conversation.channel}/${conversation.status}, mensagens_recentes=${recentMessages.length}`
    : "conversa=nenhuma";

  return {
    id: "execution",
    priority: 5,
    provenance: `db:contact-context property_id=${property.id} lead_id=${lead.id}`,
    freshness: "fresh",
    summary: `Imóvel "${property.title}" (status=${property.status}, completude=${property.completenessPercentage}%, qualidade=${property.qualityLevel}) para o lead "${lead.fullName}" (status=${lead.status}, temperatura=${lead.temperature ?? "n/d"}); interesse=${interest.status}; ${conversationPart}.`,
  };
}

/**
 * Fingerprint CONCEITUAL do contexto (Spec §11): assinatura textual de
 * workflow + tenant + blocos/frescor. NÃO é hash criptográfico — serve à
 * auditoria e reprodutibilidade do skeleton.
 * TODO(runtime): definir esquema real de fingerprint em unidade futura.
 */
function computeFingerprint(
  workflow_id: string,
  tenant_id: string,
  blocks: readonly ContextBlock[],
): string {
  const parts = blocks.map((b) => `${b.id}:${b.freshness}`).join("+");
  return `fp:${workflow_id}:${tenant_id}:${parts}`;
}
