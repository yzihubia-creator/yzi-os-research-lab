// YZI IMOB — Capability de produto #1: Property Search (v0).
//
// Primeira CAPABILITY de produto do YZI IMOB. NASCE de um workflow real do
// runtime: o pedido do cliente passa por Intent Router → Workflow Selector
// (PROPERTY_SEARCH) → Policy → Context Builder e PARA no handoff governado. Só
// então esta camada compõe o resultado de produto — detecta filtros e casa o
// critério com o catálogo mockado do tenant.
//
// INVARIANTES (mesmas do runtime skeleton):
//   - Sem banco, sem Supabase, sem API externa, sem LLM, sem WhatsApp.
//   - Nenhuma tool é executada; o matching é PURO sobre dados mockados internos
//     (é o que `yzi_imob_search_properties` FARIA — aqui nada muda de estado).
//   - `evidence.no_side_effects` é sempre `true`.
//   - Tenant boundary: só enxerga o catálogo do próprio `tenant_id`.
//
// A detecção de filtros é um parser heurístico do skeleton (não LLM). Estados
// honestos: filtro não reconhecido fica `null`; imóvel sem preço vira ressalva,
// nunca um número inventado.
// TODO(runtime): substituir o parser heurístico por extração de parâmetros do
//   classificador real (Claude API por tenant) e o matching por
//   `yzi_imob_search_properties` sobre dados reais via RLS/RPC segura.

import {
  listMockPropertiesForTenant,
  type MockProperty,
  type PropertyKind,
} from "../runtime/mock-data";
import { runYziImobRuntime } from "../runtime/runtime-api";
import type {
  IntentType,
  RuntimeRequest,
  RuntimeStage,
  RuntimeStatus,
  WorkflowId,
} from "../runtime/types";

// ── Filtros detectados ───────────────────────────────────────────────────────

/** Critério de busca extraído do pedido do cliente. `null` = não reconhecido. */
export type PropertySearchFilters = {
  kind: PropertyKind | null;
  bedrooms: number | null;
  neighborhood: string | null;
  city: string | null;
  /** Teto de preço em BRL. `null` quando o cliente não delimitou. */
  max_price: number | null;
};

// ── Candidato ────────────────────────────────────────────────────────────────

/** Um imóvel candidato, com o porquê do match e ressalvas honestas. */
export type PropertyCandidate = {
  property_id: string;
  title: string;
  status: string;
  kind: PropertyKind;
  bedrooms: number;
  neighborhood: string;
  city: string;
  /** Preço em BRL, ou `null` quando ainda não cadastrado (honesto). */
  price: number | null;
  media_count: number;
  /** Nº de filtros ativos que este imóvel satisfez. */
  match_score: number;
  /** Quais filtros bateram (rótulos legíveis). */
  matched_on: readonly string[];
  /** Frase de produto explicando o match. */
  match_reason: string;
  /** Lacunas honestas do cadastro (nunca escondidas). */
  caveats: readonly string[];
};

// ── Resultado estruturado da capability ──────────────────────────────────────

export type PropertySearchResult = {
  capability: "property_search_v0";
  status: RuntimeStatus;
  intent: IntentType | null;
  confidence: number | null;
  workflow: WorkflowId | null;
  /** Pedido bruto do cliente (para exibição na experiência de produto). */
  client_request: string;
  detected_filters: PropertySearchFilters;
  /** Nº de filtros efetivamente detectados (não-nulos). */
  active_filter_count: number;
  candidates: readonly PropertyCandidate[];
  /** Total de imóveis do tenant varridos no matching. */
  total_scanned: number;
  suggested_next_steps: readonly string[];
  blocking_reason: string | null;
  evidence: {
    no_side_effects: true;
    runtime_status: RuntimeStatus;
    stages_completed: readonly RuntimeStage[];
    /** Reforço honesto: nada externo foi tocado. */
    used_tools: readonly [];
    matching: "mock_read_only";
  };
  notes: readonly string[];
};

// ── Helpers de parsing (puros) ───────────────────────────────────────────────

// Marcas diacríticas combinantes (U+0300–U+036F). Construído via RegExp para não
// carregar caracteres combinantes literais no fonte.
const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

function stripAccents(text: string): string {
  return text.normalize("NFD").replace(COMBINING_MARKS, "");
}

function normalize(text: string): string {
  return stripAccents(text.trim().toLowerCase());
}

function detectKind(haystack: string): PropertyKind | null {
  if (/\bcobertura\b/.test(haystack)) return "cobertura";
  if (/\b(apartamento|apto|apê|ape|ap)\b/.test(haystack)) return "apartamento";
  if (/\bcasa\b/.test(haystack)) return "casa";
  if (/\b(terreno|lote)\b/.test(haystack)) return "terreno";
  return null;
}

function detectBedrooms(haystack: string): number | null {
  const match = haystack.match(/(\d+)\s*(dorm|quart|suite)/);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isNaN(value) ? null : value;
}

/**
 * Detecta um teto de preço em BRL. Reconhece "até 500 mil", "no máximo 1,2
 * milhão", "abaixo de R$ 480.000". Heurístico do skeleton: retorna `null` quando
 * não há delimitador claro (nunca chuta um valor).
 */
function detectMaxPrice(haystack: string): number | null {
  const match = haystack.match(
    /(?:ate|abaixo de|no maximo|maximo de|maximo)\s*(?:r\$)?\s*([\d.,]+)\s*(mil|milhao|milhoes|k|m)?/,
  );
  if (!match) return null;

  const rawNumber = match[1];
  const unit = match[2] ?? "";

  if (unit === "mil" || unit === "k") {
    const base = Number.parseFloat(rawNumber.replace(/\./g, "").replace(",", "."));
    return Number.isNaN(base) ? null : Math.round(base * 1_000);
  }
  if (unit === "milhao" || unit === "milhoes" || unit === "m") {
    const base = Number.parseFloat(rawNumber.replace(/\./g, "").replace(",", "."));
    return Number.isNaN(base) ? null : Math.round(base * 1_000_000);
  }

  // Sem unidade: interpreta separadores como milhar (formato pt-BR "480.000").
  const digits = rawNumber.replace(/[.,]/g, "");
  const value = Number.parseInt(digits, 10);
  return Number.isNaN(value) ? null : value;
}

function detectLocation(
  haystack: string,
  catalog: readonly MockProperty[],
): { neighborhood: string | null; city: string | null } {
  const neighborhood =
    catalog
      .map((p) => p.neighborhood)
      .find((n) => haystack.includes(normalize(n))) ?? null;
  const city =
    catalog.map((p) => p.city).find((c) => haystack.includes(normalize(c))) ?? null;
  return { neighborhood, city };
}

/**
 * Extrai os filtros do pedido do cliente. Parser heurístico e PURO — não usa
 * LLM. O catálogo do tenant é usado apenas para reconhecer bairros/cidades
 * existentes (não vaza dados de outro tenant).
 */
export function detectFilters(
  rawIntent: string,
  catalog: readonly MockProperty[],
): PropertySearchFilters {
  const haystack = normalize(rawIntent);
  const { neighborhood, city } = detectLocation(haystack, catalog);
  return {
    kind: detectKind(haystack),
    bedrooms: detectBedrooms(haystack),
    neighborhood,
    city,
    max_price: detectMaxPrice(haystack),
  };
}

function countActiveFilters(filters: PropertySearchFilters): number {
  return Object.values(filters).filter((v) => v !== null).length;
}

function formatBrl(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function eq(a: string, b: string): boolean {
  return normalize(a) === normalize(b);
}

// ── Matching (puro, sobre o catálogo mockado do tenant) ──────────────────────

function buildCaveats(property: MockProperty): string[] {
  const caveats: string[] = [];
  if (property.price === null) {
    caveats.push("Preço ainda não cadastrado — confirmar antes de ofertar.");
  }
  if (property.missing_fields.length > 0) {
    caveats.push(`Cadastro incompleto: faltam ${property.missing_fields.join(", ")}.`);
  }
  if (property.media_count === 0) {
    caveats.push("Sem mídia publicável.");
  }
  return caveats;
}

function scoreProperty(
  property: MockProperty,
  filters: PropertySearchFilters,
): { score: number; matched_on: string[]; reason: string } {
  const matched_on: string[] = [];

  if (filters.kind && property.kind === filters.kind) {
    matched_on.push(`tipo=${property.kind}`);
  }
  if (filters.bedrooms !== null && property.bedrooms >= filters.bedrooms) {
    matched_on.push(`dormitórios≥${filters.bedrooms}`);
  }
  if (filters.neighborhood && eq(property.neighborhood, filters.neighborhood)) {
    matched_on.push(`bairro=${property.neighborhood}`);
  }
  if (filters.city && eq(property.city, filters.city)) {
    matched_on.push(`cidade=${property.city}`);
  }

  let priceNote = "";
  if (filters.max_price !== null) {
    if (property.price !== null && property.price <= filters.max_price) {
      matched_on.push(`preço≤${formatBrl(filters.max_price)}`);
      priceNote = ` Preço ${formatBrl(property.price)} dentro do teto ${formatBrl(filters.max_price)}.`;
    } else if (property.price === null) {
      priceNote = " Preço não cadastrado — não foi possível confirmar o teto.";
    }
  }

  const reason =
    matched_on.length > 0
      ? `Bate em: ${matched_on.join(", ")}.${priceNote}`
      : "Sem filtro específico detectado — mostrando o catálogo do tenant.";

  return { score: matched_on.length, matched_on, reason };
}

function toCandidate(
  property: MockProperty,
  filters: PropertySearchFilters,
): PropertyCandidate {
  const { score, matched_on, reason } = scoreProperty(property, filters);
  return {
    property_id: property.property_id,
    title: property.title,
    status: property.status,
    kind: property.kind,
    bedrooms: property.bedrooms,
    neighborhood: property.neighborhood,
    city: property.city,
    price: property.price,
    media_count: property.media_count,
    match_score: score,
    matched_on,
    match_reason: reason,
    caveats: buildCaveats(property),
  };
}

function rankCandidates(
  catalog: readonly MockProperty[],
  filters: PropertySearchFilters,
): PropertyCandidate[] {
  const activeFilters = countActiveFilters(filters);
  const scored = catalog.map((p) => toCandidate(p, filters));

  // Sem filtro reconhecido: mostra o catálogo inteiro (transparente), sem ordenar
  // por score (todos zero). Ordena por completude/mídia para priorizar o pronto.
  const selected =
    activeFilters === 0 ? scored : scored.filter((c) => c.match_score >= 1);

  return selected.sort((a, b) => {
    if (b.match_score !== a.match_score) return b.match_score - a.match_score;
    const priceA = a.price ?? Number.POSITIVE_INFINITY;
    const priceB = b.price ?? Number.POSITIVE_INFINITY;
    if (priceA !== priceB) return priceA - priceB;
    return b.media_count - a.media_count;
  });
}

// ── Próximos passos (product continuity) ─────────────────────────────────────

function suggestNextSteps(
  candidates: readonly PropertyCandidate[],
  activeFilters: number,
  blocked: boolean,
  blockingReason: string | null,
): string[] {
  if (blocked) {
    return [
      `Runtime bloqueou a busca: ${blockingReason ?? "motivo não informado"}.`,
      "Reformule o pedido do cliente (tipo, dormitórios, bairro ou faixa de preço).",
    ];
  }

  if (candidates.length === 0) {
    return [
      activeFilters === 0
        ? "O catálogo do tenant está vazio para esta operação."
        : "Nenhum imóvel do tenant bate no critério atual.",
      "Ampliar a faixa de preço ou incluir bairros vizinhos.",
      "Revisar a captação do tenant — pode faltar imóvel neste perfil.",
    ];
  }

  const top = candidates[0];
  const steps = [
    `Consultar detalhes de "${top.title}" (workflow READ_ONLY_PROPERTY_LOOKUP).`,
    `Preparar contato sobre "${top.title}" (workflow PREPARE_PROPERTY_CONTACT — exige aprovação humana).`,
  ];
  if (candidates.some((c) => c.caveats.length > 0)) {
    steps.push(
      "Completar o cadastro dos imóveis com dados faltantes antes de ofertar ao cliente.",
    );
  }
  return steps;
}

// ── Entrada da capability ────────────────────────────────────────────────────

const CAPABILITY_NOTES: readonly string[] = [
  "Capability de produto Property Search v0 — nasce do workflow real PROPERTY_SEARCH.",
  "Matching é PURO sobre dados mockados internos; nenhuma tool foi executada.",
  "Sem banco, sem Supabase, sem API externa, sem LLM, sem WhatsApp, sem credenciais.",
];

/**
 * Executa a capability Property Search para um pedido do cliente. Roda o runtime
 * real (que para no handoff), detecta os filtros e casa com o catálogo mockado
 * do tenant. Função PURA e síncrona — sem I/O, sem efeito colateral.
 */
export function runPropertySearch(request: RuntimeRequest): PropertySearchResult {
  const runtime = runYziImobRuntime(request);
  const catalog = listMockPropertiesForTenant(request.tenant_id);
  const filters = detectFilters(request.raw_intent, catalog);
  const activeFilters = countActiveFilters(filters);

  const isSearchReady =
    runtime.status === "READY_FOR_APPROVAL" &&
    runtime.intent?.intent_type === "property_search";

  // Só casa o catálogo se o runtime liberou o handoff da busca. Se bloqueou
  // (tenant/usuário/intenção), respeita a parada honesta — sem candidatos.
  const candidates = isSearchReady ? rankCandidates(catalog, filters) : [];

  const suggested_next_steps = suggestNextSteps(
    candidates,
    activeFilters,
    !isSearchReady,
    runtime.blocking_reason,
  );

  return {
    capability: "property_search_v0",
    status: runtime.status,
    intent: runtime.intent?.intent_type ?? null,
    confidence: runtime.intent?.confidence ?? null,
    workflow: runtime.workflow?.definition.workflow_id ?? null,
    client_request: request.raw_intent,
    detected_filters: filters,
    active_filter_count: activeFilters,
    candidates,
    total_scanned: catalog.length,
    suggested_next_steps,
    blocking_reason: runtime.blocking_reason,
    evidence: {
      no_side_effects: true,
      runtime_status: runtime.status,
      stages_completed: runtime.evidence.stages_completed,
      used_tools: [],
      matching: "mock_read_only",
    },
    notes: CAPABILITY_NOTES,
  };
}
