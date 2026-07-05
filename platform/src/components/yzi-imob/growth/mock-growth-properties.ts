import type { GrowthProperty, GrowthStatusAccent } from "./types";

export const GROWTH_PROPERTY_STATUS_ACCENT: GrowthStatusAccent = {
  "Pronto para campanha": "lilac",
  "Em uso": "cyan",
  Aprovado: "primary",
  Arquivado: "neutral",
};

export const MOCK_GROWTH_PROPERTIES: GrowthProperty[] = [
  {
    id: "property_altiplano_001",
    tenantId: "tenant_mock_growth_001",
    name: "Apartamento Altiplano",
    location: "Altiplano, João Pessoa",
    status: "Pronto para campanha",
    lifecycle: "approved",
    readiness: 92,
    palette: ["primary", "lilac"],
    tags: ["premium", "visita", "varanda"],
    summary: "Imóvel com assets e pacote aprovado para campanha de visita qualificada.",
  },
  {
    id: "property_cabo_branco_014",
    tenantId: "tenant_mock_growth_001",
    name: "Cobertura Cabo Branco",
    location: "Cabo Branco, João Pessoa",
    status: "Em uso",
    lifecycle: "active",
    readiness: 84,
    palette: ["petrol", "primary"],
    tags: ["vista mar", "alto padrão"],
    summary: "Acervo forte para campanhas de destaque e argumentos de valor.",
  },
  {
    id: "property_jardim_oceania_004",
    tenantId: "tenant_mock_growth_001",
    name: "Jardim Oceania",
    location: "Jardim Oceania, João Pessoa",
    status: "Arquivado",
    lifecycle: "archived",
    readiness: 42,
    palette: ["coldRed", "amber"],
    tags: ["revisar dados", "captação"],
    summary: "Patrimônio parcialmente arquivado por falta de diferenciais claros.",
  },
];

