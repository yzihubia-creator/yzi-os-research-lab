// YZI IMOB Runtime — Dados mockados internos (Runtime Foundation, unidade 1).
//
// Fonte de dados PURAMENTE mockada e read-only, suficiente para validar o fluxo
// arquitetural do workflow READ_ONLY_PROPERTY_LOOKUP. NÃO é banco, NÃO é API,
// NÃO é Supabase, NÃO é cache. Nenhum dado real de cliente. Todo registro
// pertence a um `tenant_id` fixo para exercitar o tenant boundary.
//
// TODO(runtime): substituir por `yzi_imob_get_property_context` (Tool Registry
//   §5, read_context) sobre dados reais via RLS/RPC segura — em unidade futura,
//   sob autorização humana. Enquanto isso, estes mocks NUNCA saem do processo.

import type { ActiveAssetType } from "./types";

/** Imóvel mockado — formato compacto de alto sinal (Context Builder §5). */
export type MockProperty = {
  tenant_id: string;
  property_id: string;
  title: string;
  status: string;
  filled_fields: readonly string[];
  /** Campos faltantes: verdade honesta, nunca preenchidos por invenção. */
  missing_fields: readonly string[];
  media_count: number;
  next_action: string;
};

/**
 * Catálogo mockado, indexado por tenant. Mínimo necessário para validar o fluxo:
 * um imóvel completo e um incompleto (para exercitar "campos faltantes").
 */
const MOCK_PROPERTIES: readonly MockProperty[] = [
  {
    tenant_id: "tenant_demo",
    property_id: "prop_001",
    title: "Apartamento 2 dorm. — Centro",
    status: "em_captacao",
    filled_fields: ["endereco", "area", "preco", "fotos"],
    missing_fields: [],
    media_count: 8,
    next_action: "Revisar descrição comercial antes de preparar página.",
  },
  {
    tenant_id: "tenant_demo",
    property_id: "prop_002",
    title: "Casa 3 dorm. — Bairro Jardim",
    status: "cadastro_incompleto",
    filled_fields: ["endereco", "area"],
    missing_fields: ["preco", "fotos", "descricao"],
    media_count: 0,
    next_action: "Completar preço e mídia antes de qualquer preparação.",
  },
];

/**
 * Resolve um imóvel mockado respeitando o tenant boundary: só retorna se o
 * `tenant_id` do registro casar com o solicitado. Função PURA (sem I/O).
 * Retorna `null` honestamente quando não encontra — nunca inventa dado.
 */
export function findMockProperty(
  tenant_id: string,
  property_id: string,
): MockProperty | null {
  const match = MOCK_PROPERTIES.find(
    (p) => p.tenant_id === tenant_id && p.property_id === property_id,
  );
  return match ?? null;
}

/** Indica se o tipo de ativo é suportado pelo lookup read-only (property). */
export function isLookupSupportedAsset(assetType: ActiveAssetType): boolean {
  return assetType === "property";
}
