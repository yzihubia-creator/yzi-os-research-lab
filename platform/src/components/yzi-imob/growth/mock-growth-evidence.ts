import type { GrowthEvidence } from "./types";

export const MOCK_GROWTH_EVIDENCE: GrowthEvidence[] = [
  {
    id: "evidence_altiplano_assets",
    tenantId: "tenant_mock_growth_001",
    title: "Pacote com patrimônio suficiente",
    detail: "Fotos, vídeo curto, planta e diferenciais estão disponíveis no mock operacional.",
    source: "Biblioteca Growth OS",
    confidence: "alta",
  },
  {
    id: "evidence_jardim_oceania_gap",
    tenantId: "tenant_mock_growth_001",
    title: "Dados incompletos para campanha",
    detail: "O imóvel tem poucos diferenciais cadastrados e nenhum pacote aprovado.",
    source: "Conteúdo Growth OS",
    confidence: "media",
  },
];

