import type { GrowthCampaign } from "./types";

export const MOCK_GROWTH_CAMPAIGNS: GrowthCampaign[] = [
  {
    id: "campaign_meta_leads_altiplano",
    tenantId: "tenant_mock_growth_001",
    title: "Meta Leads Altiplano",
    channel: "Meta Leads",
    status: "Planejado",
    propertyIds: ["property_altiplano_001"],
    packageIds: ["package_reel_premium"],
    objective: "Converter interesse em visita qualificada.",
  },
  {
    id: "campaign_site_destaque_cabo",
    tenantId: "tenant_mock_growth_001",
    title: "Site Destaque Cabo Branco",
    channel: "Site",
    status: "Em uso",
    propertyIds: ["property_cabo_branco_014"],
    packageIds: ["package_carrossel_alto_padrao"],
    objective: "Organizar argumento de alto padrão para tráfego orgânico.",
  },
];

