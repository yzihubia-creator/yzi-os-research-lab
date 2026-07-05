import type { GrowthPackage } from "./types";

export const MOCK_GROWTH_PACKAGES: GrowthPackage[] = [
  {
    id: "package_reel_premium",
    tenantId: "tenant_mock_growth_001",
    propertyId: "property_altiplano_001",
    title: "Reel Premium",
    format: "Reel",
    status: "Aprovado",
    credits: 18,
    assets: ["asset_altiplano_reel_01"],
    recommendedUse: "Campanha de visita qualificada.",
  },
  {
    id: "package_carrossel_alto_padrao",
    tenantId: "tenant_mock_growth_001",
    propertyId: "property_cabo_branco_014",
    title: "Carrossel Alto Padrão",
    format: "Carrossel",
    status: "Em uso",
    credits: 12,
    assets: ["asset_cabo_branco_carrossel_01"],
    recommendedUse: "Site Destaque e Instagram Feed.",
  },
  {
    id: "package_open_house_julho",
    tenantId: "tenant_mock_growth_001",
    collectionId: "collection_open_house_julho",
    title: "Open House Julho",
    format: "Collection",
    status: "Pronto para campanha",
    credits: 14,
    assets: ["asset_manaira_story_01", "asset_bessa_site_01"],
    recommendedUse: "Agenda de visitas e redistribuição em leads.",
  },
];

