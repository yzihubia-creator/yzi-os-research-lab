// YZI IMOB Runtime — Exemplo de validação de fluxo (Runtime Foundation, unidade 1 + 2).
//
// Demonstração PURA dos workflows READ_ONLY_PROPERTY_LOOKUP e
// PREPARE_PROPERTY_CONTACT com dados mockados internos. Não é teste
// automatizado nem executa efeito: apenas monta requisições de exemplo e chama
// a Runtime API para inspeção manual do resultado honesto
// (status READY_FOR_APPROVAL). Nenhuma tool, approval ou banco envolvido.

import { runYziImobRuntime } from "./runtime-api";
import type { RuntimeRequest, RuntimeResult } from "./types";

/** Requisição de exemplo que aciona o workflow read-only sobre um imóvel mockado. */
export const DEMO_REQUEST: RuntimeRequest = {
  tenant_id: "tenant_demo",
  user_id: "user_demo",
  route: "/imob/imoveis/prop_001",
  module: "yzi-imob",
  raw_intent: "consultar detalhes do imóvel",
  active_asset_type: "property",
  active_asset_id: "prop_001",
  user_role: "corretor",
  available_connections: [],
  requested_action: "lookup",
};

/**
 * Roda o fluxo de exemplo e retorna o resultado honesto do runtime.
 * Esperado: `status === "READY_FOR_APPROVAL"`, `approval.created === false`,
 * `evidence.no_side_effects === true`.
 */
export function demoReadOnlyPropertyLookup(): RuntimeResult {
  return runYziImobRuntime(DEMO_REQUEST);
}

/**
 * Requisição de exemplo que aciona o workflow PREPARE_PROPERTY_CONTACT
 * (unidade 2 — Approval-Only Vertical Slice) sobre o mesmo imóvel mockado.
 */
export const DEMO_REQUEST_PREPARE_CONTACT: RuntimeRequest = {
  tenant_id: "tenant_demo",
  user_id: "user_demo",
  route: "/imob/imoveis/prop_001",
  module: "yzi-imob",
  raw_intent: "preparar contato de follow-up sobre o imóvel",
  active_asset_type: "property",
  active_asset_id: "prop_001",
  user_role: "corretor",
  available_connections: [],
  requested_action: "prepare_contact",
};

/**
 * Roda o fluxo de exemplo do workflow de preparo de contato e retorna o
 * resultado honesto do runtime. Esperado: `status === "READY_FOR_APPROVAL"`,
 * `approval.would_submit === true`, `approval.created === false`,
 * `approval.descriptor` preenchido, `evidence.no_side_effects === true`.
 */
export function demoPreparePropertyContact(): RuntimeResult {
  return runYziImobRuntime(DEMO_REQUEST_PREPARE_CONTACT);
}
