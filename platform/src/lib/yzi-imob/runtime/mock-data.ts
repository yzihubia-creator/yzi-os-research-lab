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

/** Tipo comercial do imóvel — vocabulário mínimo, alto sinal. */
export type PropertyKind = "apartamento" | "casa" | "cobertura" | "terreno";

/** Imóvel mockado — formato compacto de alto sinal (Context Builder §5). */
export type MockProperty = {
  tenant_id: string;
  property_id: string;
  title: string;
  status: string;
  /** Atributos de busca (mockados) — exercitam o matching read-only. */
  kind: PropertyKind;
  bedrooms: number;
  neighborhood: string;
  city: string;
  /** Preço em BRL. `null` = ainda não cadastrado (verdade honesta, nunca inventado). */
  price: number | null;
  filled_fields: readonly string[];
  /** Campos faltantes: verdade honesta, nunca preenchidos por invenção. */
  missing_fields: readonly string[];
  media_count: number;
  next_action: string;
};

/**
 * Catálogo mockado, indexado por tenant. Amostra pequena mas suficiente para
 * exercitar o matching de busca: tipos diferentes, faixas de preço distintas,
 * bairros distintos e um imóvel com preço faltante (cadastro incompleto).
 */
const MOCK_PROPERTIES: readonly MockProperty[] = [
  {
    tenant_id: "tenant_demo",
    property_id: "prop_001",
    title: "Apartamento 2 dorm. — Centro",
    status: "em_captacao",
    kind: "apartamento",
    bedrooms: 2,
    neighborhood: "Centro",
    city: "São Paulo",
    price: 480000,
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
    kind: "casa",
    bedrooms: 3,
    neighborhood: "Jardim",
    city: "São Paulo",
    price: null,
    filled_fields: ["endereco", "area"],
    missing_fields: ["preco", "fotos", "descricao"],
    media_count: 0,
    next_action: "Completar preço e mídia antes de qualquer preparação.",
  },
  {
    tenant_id: "tenant_demo",
    property_id: "prop_003",
    title: "Apartamento 3 dorm. — Centro",
    status: "publicado",
    kind: "apartamento",
    bedrooms: 3,
    neighborhood: "Centro",
    city: "São Paulo",
    price: 620000,
    filled_fields: ["endereco", "area", "preco", "fotos", "descricao"],
    missing_fields: [],
    media_count: 12,
    next_action: "Manter anúncio ativo; acompanhar leads.",
  },
  {
    tenant_id: "tenant_demo",
    property_id: "prop_004",
    title: "Cobertura 2 dorm. — Beira-Mar",
    status: "em_captacao",
    kind: "cobertura",
    bedrooms: 2,
    neighborhood: "Beira-Mar",
    city: "Santos",
    price: 950000,
    filled_fields: ["endereco", "area", "preco"],
    missing_fields: ["fotos"],
    media_count: 3,
    next_action: "Agendar sessão de fotos antes de publicar.",
  },
  {
    tenant_id: "tenant_demo",
    property_id: "prop_005",
    title: "Apartamento 2 dorm. — Jardim",
    status: "publicado",
    kind: "apartamento",
    bedrooms: 2,
    neighborhood: "Jardim",
    city: "São Paulo",
    price: 395000,
    filled_fields: ["endereco", "area", "preco", "fotos", "descricao"],
    missing_fields: [],
    media_count: 10,
    next_action: "Manter anúncio ativo; responder interessados.",
  },
  {
    // Outro tenant — presente de propósito para provar o tenant boundary: NUNCA
    // deve aparecer em buscas do tenant_demo.
    tenant_id: "tenant_outro",
    property_id: "prop_900",
    title: "Apartamento 2 dorm. — Centro (outro tenant)",
    status: "publicado",
    kind: "apartamento",
    bedrooms: 2,
    neighborhood: "Centro",
    city: "São Paulo",
    price: 450000,
    filled_fields: ["endereco", "area", "preco", "fotos"],
    missing_fields: [],
    media_count: 6,
    next_action: "N/A — pertence a outro tenant.",
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

/**
 * Retorna o catálogo mockado de um tenant, respeitando o tenant boundary: só
 * inclui imóveis cujo `tenant_id` casa com o solicitado. Função PURA (sem I/O).
 * Fonte read-only para o matching de busca — nunca inventa nem cruza tenants.
 */
export function listMockPropertiesForTenant(
  tenant_id: string,
): readonly MockProperty[] {
  if (!tenant_id) return [];
  return MOCK_PROPERTIES.filter((p) => p.tenant_id === tenant_id);
}

/** Indica se o tipo de ativo é suportado pelo lookup read-only (property). */
export function isLookupSupportedAsset(assetType: ActiveAssetType): boolean {
  return assetType === "property";
}
