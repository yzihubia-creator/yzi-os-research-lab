import type { GrowthRecommendation } from "./types";

export const MOCK_GROWTH_RECOMMENDATIONS: GrowthRecommendation[] = [
  {
    id: "recommendation_reuse_altiplano",
    tenantId: "tenant_mock_growth_001",
    title: "Reutilizar Reel Premium no Meta Leads",
    rationale: "O asset já foi aprovado, tem boa prontidão e se conecta ao objetivo de visita qualificada.",
    nextAction: "Preparar campanha mockada com aprovação humana antes de qualquer execução real.",
    state: "nova",
    confidence: "alta",
    evidenceIds: ["evidence_altiplano_assets"],
  },
  {
    id: "recommendation_review_jardim_oceania",
    tenantId: "tenant_mock_growth_001",
    title: "Pausar campanha do Jardim Oceania",
    rationale: "O patrimônio disponível ainda não sustenta uma peça convincente.",
    nextAction: "Completar diferenciais do imóvel antes de solicitar nova versão.",
    state: "em_analise",
    confidence: "media",
    evidenceIds: ["evidence_jardim_oceania_gap"],
  },
];

