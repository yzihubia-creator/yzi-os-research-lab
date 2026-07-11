// YZI IMOB — Demos da capability Property Search (v0).
//
// Requisições de exemplo PURAS para inspeção manual e para a Runtime Preview UI.
// Não são testes automatizados e não produzem efeito: apenas montam o pedido do
// cliente e chamam a capability, que roda o runtime real e casa com o catálogo
// mockado do tenant. Esperado em ambas: `evidence.no_side_effects === true`.

import { runPropertySearch, type PropertySearchResult } from "./property-search";
import type { RuntimeRequest } from "../runtime/types";

/** Base de request de busca — cliente procurando, sem imóvel ativo ainda. */
function searchRequest(raw_intent: string): RuntimeRequest {
  return {
    tenant_id: "tenant_demo",
    user_id: "user_demo",
    route: "/imob/busca",
    module: "yzi-imob",
    raw_intent,
    active_asset_type: "none",
    active_asset_id: null,
    user_role: "corretor",
    available_connections: [],
    requested_action: "search",
  };
}

/** Pedido com match: apartamento, 2 dorm., bairro Centro, teto de preço. */
export const DEMO_SEARCH_REQUEST: RuntimeRequest = searchRequest(
  "cliente procura apartamento de 2 dormitórios no Centro até 500 mil",
);

/** Pedido sem match no catálogo do tenant (terreno) — exercita estado honesto. */
export const DEMO_SEARCH_REQUEST_NO_MATCH: RuntimeRequest = searchRequest(
  "cliente quer um terreno para investir",
);

/**
 * Roda a busca com resultado positivo. Esperado: status READY_FOR_APPROVAL,
 * candidatos ordenados por match, `evidence.no_side_effects === true`.
 */
export function demoPropertySearch(): PropertySearchResult {
  return runPropertySearch(DEMO_SEARCH_REQUEST);
}

/**
 * Roda a busca sem candidatos elegíveis. Esperado: status READY_FOR_APPROVAL,
 * `candidates` vazio e próximos passos honestos (ampliar critério).
 */
export function demoPropertySearchNoMatch(): PropertySearchResult {
  return runPropertySearch(DEMO_SEARCH_REQUEST_NO_MATCH);
}
