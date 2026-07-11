// YZI IMOB Runtime — Intent Router (Runtime Foundation, unidade 1).
//
// Responsabilidade ÚNICA: classificar a intenção do usuário ANTES de qualquer
// montagem de contexto ou tool. Não monta contexto, não seleciona workflow, não
// chama tool, não executa nada. Regra forte (Intent Router Spec §1):
//   `Sem intenção classificada, a YZI não monta contexto nem chama tool.`
//
// Skeleton: a classificação real (LLM/Claude API por tenant) é TODO. Aqui há
// apenas um classificador heurístico mínimo, suficiente para validar o fluxo.

import type { IntentClassification, IntentType, RuntimeRequest } from "./types";

/** Palavras-chave mínimas que sugerem uma consulta read-only de imóvel. */
const LOOKUP_HINTS = [
  "consultar",
  "consulta",
  "ver imovel",
  "ver imóvel",
  "detalhe",
  "detalhes",
  "lookup",
  "buscar imovel",
  "buscar imóvel",
  "status do imovel",
  "status do imóvel",
];

/**
 * Palavras-chave mínimas que sugerem BUSCA de imóvel a partir do critério do
 * cliente (Property Search v0). Diferente do lookup: o cliente ainda não tem um
 * imóvel ativo — ele procura um. Não depende de `active_asset_type=property`.
 */
const SEARCH_HINTS = [
  "procuro",
  "procurando",
  "quero um",
  "quero uma",
  "quero comprar",
  "quero alugar",
  "cliente quer",
  "cliente procura",
  "cliente busca",
  "busca de imovel",
  "busca de imóvel",
  "buscar imoveis",
  "buscar imóveis",
  "tem apartamento",
  "tem casa",
  "tem algum imovel",
  "tem algum imóvel",
  "opcoes de imovel",
  "opções de imóvel",
];

/** Palavras-chave mínimas que sugerem preparar contato/follow-up (unidade 2). */
const CONTACT_PREPARE_HINTS = [
  "preparar contato",
  "preparar follow-up",
  "preparar followup",
  "preparar follow up",
  "rascunho de contato",
  "follow-up",
  "followup",
];

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

/**
 * Classifica a intenção. Retorna uma classificação PARCIAL: preenche
 * `intent_type` / `confidence` / bloqueio; deixa `workflow_id`, `allowed_tools`,
 * `required_context`, `approval_required` e `risk_level` para o Workflow
 * Selector enriquecer (single-responsibility do pipeline).
 *
 * Bloqueios honestos (Intent Router Spec §8, §12): tenant/usuário ausentes ou
 * intenção desconhecida param aqui, sem avançar.
 */
export function routeIntent(request: RuntimeRequest): IntentClassification {
  const base: IntentClassification = {
    intent_type: "blocked_or_unknown",
    confidence: 0,
    workflow_id: null,
    required_context: [],
    allowed_tools: [],
    approval_required: false,
    risk_level: "low",
    blocking_reason: null,
    next_question: null,
  };

  // Boundary primeiro (Spec §3, §8): sem tenant/usuário não há intenção válida.
  if (!request.tenant_id) {
    return { ...base, blocking_reason: "tenant_missing: request sem tenant_id." };
  }
  if (!request.user_id) {
    return { ...base, blocking_reason: "user_missing: request sem user_id." };
  }

  const haystack = `${normalize(request.raw_intent)} ${normalize(
    request.requested_action,
  )}`;
  const looksLikeLookup =
    LOOKUP_HINTS.some((hint) => haystack.includes(hint)) &&
    request.active_asset_type === "property";

  if (looksLikeLookup) {
    const intent_type: IntentType = "property_lookup";
    return {
      ...base,
      intent_type,
      // Confiança conceitual do skeleton heurístico. TODO(runtime): substituir
      // por confiança do classificador real (Claude API por tenant).
      confidence: 0.6,
    };
  }

  // Busca: o cliente procura um imóvel que ainda não é o ativo ativo. Por isso
  // NÃO exige `active_asset_type=property` (ao contrário do lookup/contato).
  const looksLikeSearch =
    SEARCH_HINTS.some((hint) => haystack.includes(hint)) &&
    request.active_asset_type !== "property";

  if (looksLikeSearch) {
    const intent_type: IntentType = "property_search";
    return {
      ...base,
      intent_type,
      // Confiança conceitual do skeleton heurístico (ver TODO acima).
      confidence: 0.65,
    };
  }

  const looksLikeContactPrepare =
    CONTACT_PREPARE_HINTS.some((hint) => haystack.includes(hint)) &&
    request.active_asset_type === "property";

  if (looksLikeContactPrepare) {
    const intent_type: IntentType = "property_contact_prepare";
    return {
      ...base,
      intent_type,
      // Confiança conceitual do skeleton heurístico (ver TODO acima).
      confidence: 0.55,
    };
  }

  // Intenção não reconhecida: estado honesto, sem adivinhar (Spec §8).
  return {
    ...base,
    blocking_reason:
      "intent_unknown: nenhuma intenção de busca/consulta/contato reconhecida no skeleton.",
    next_question:
      "Você quer buscar um imóvel para o cliente, consultar um imóvel específico ou preparar um contato? (skeleton reconhece busca, consulta read-only e preparo de contato)",
  };
}
