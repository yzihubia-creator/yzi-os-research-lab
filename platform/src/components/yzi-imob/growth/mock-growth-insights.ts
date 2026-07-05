import type { GrowthInsight } from "./types";

export const MOCK_GROWTH_INSIGHTS: GrowthInsight[] = [
  {
    id: "insight_reuse_premium_assets",
    tenantId: "tenant_mock_growth_001",
    title: "Reuso premium disponível",
    summary: "Altiplano e Luxo João Pessoa já têm material suficiente para uma próxima campanha.",
    evidenceIds: ["evidence_altiplano_assets"],
    confidence: "alta",
  },
  {
    id: "insight_fix_incomplete_property",
    tenantId: "tenant_mock_growth_001",
    title: "Revisar imóveis com pouco argumento",
    summary: "Jardim Oceania deve receber mais diferenciais antes de voltar para campanha.",
    evidenceIds: ["evidence_jardim_oceania_gap"],
    confidence: "media",
  },
];

