import type { YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";

import { propertyDemoAssetSrc } from "./property-demo-assets";

// Dados puramente visuais de demonstração para os grids de mídia mockada do
// Growth OS (Conteúdo, Biblioteca, Campanhas). Nenhum arquivo real de cliente,
// nenhuma imagem remota — as miniaturas usam o pack local mockado da
// "Cobertura Atlântico — Cabo Branco" (property-demo-assets), servido de
// /public/demo, com gradiente + indicadores (play, contador, duração, CTA).

export type DemoMediaType = "property" | "reel" | "story" | "carousel" | "landing" | "meta_ad" | "display";
export type DemoMediaFormat = "9:16" | "1:1" | "4:5" | "16:9" | "wide";

export type DemoMediaItem = {
  id: string;
  title: string;
  propertyName: string;
  type: DemoMediaType;
  format: DemoMediaFormat;
  badge: string;
  simulated: true;
  palette: [YziImobRole, YziImobRole];
  imageSrc?: string;
  duration?: string;
  slideCount?: number;
  cta?: string;
};

// Mapeia tipo de mídia → asset do manifesto demo, respeitando o formato.
const DEMO_IMAGE_BY_TYPE: Record<DemoMediaType, string> = {
  property: propertyDemoAssetSrc("facade"),
  reel: propertyDemoAssetSrc("story"),
  story: propertyDemoAssetSrc("story"),
  carousel: propertyDemoAssetSrc("carousel"),
  landing: propertyDemoAssetSrc("drone"),
  meta_ad: propertyDemoAssetSrc("living"),
  display: propertyDemoAssetSrc("facade"),
};

export function demoImageForType(type: DemoMediaType, format?: DemoMediaFormat): string {
  if (type === "meta_ad" && format === "4:5") {
    return propertyDemoAssetSrc("balcony");
  }
  return DEMO_IMAGE_BY_TYPE[type];
}

const MOCK_DEMO_MEDIA_BASE: DemoMediaItem[] = [
  {
    id: "demo_altiplano_reel",
    title: "Reel Premium",
    propertyName: "Apartamento Altiplano",
    type: "reel",
    format: "9:16",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["primary", "cyan"],
    duration: "00:18",
  },
  {
    id: "demo_altiplano_site",
    title: "Site Hero",
    propertyName: "Apartamento Altiplano",
    type: "landing",
    format: "16:9",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["primary", "lilac"],
    cta: "Ver página",
  },
  {
    id: "demo_altiplano_lancamento",
    title: "Lançamento Premium",
    propertyName: "Apartamento Altiplano",
    type: "meta_ad",
    format: "4:5",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["cyan", "petrol"],
    cta: "Ver anúncio",
  },
  {
    id: "demo_altiplano_open_house",
    title: "Open House Julho",
    propertyName: "Apartamento Altiplano",
    type: "meta_ad",
    format: "4:5",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["lilac", "primary"],
    cta: "Ver anúncio",
  },
  {
    id: "demo_cabo_branco_carrossel",
    title: "Carrossel Alto Padrão",
    propertyName: "Cobertura Cabo Branco",
    type: "carousel",
    format: "1:1",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["petrol", "primary"],
    slideCount: 5,
  },
  {
    id: "demo_cabo_branco_meta",
    title: "Meta Feed",
    propertyName: "Cobertura Cabo Branco",
    type: "meta_ad",
    format: "1:1",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["petrol", "cyan"],
    cta: "Ver anúncio",
  },
  {
    id: "demo_cabo_branco_lancamento",
    title: "Lançamento Premium",
    propertyName: "Cobertura Cabo Branco",
    type: "meta_ad",
    format: "4:5",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["primary", "petrol"],
    cta: "Ver anúncio",
  },
  {
    id: "demo_manaira_story",
    title: "Story Visita",
    propertyName: "Manaíra Residence",
    type: "story",
    format: "9:16",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["coldGreen", "cyan"],
    duration: "00:09",
  },
  {
    id: "demo_manaira_open_house",
    title: "Open House Julho",
    propertyName: "Manaíra Residence",
    type: "meta_ad",
    format: "4:5",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["ice", "cyan"],
    cta: "Ver anúncio",
  },
  {
    id: "demo_jardim_oceania_meta",
    title: "Meta Feed",
    propertyName: "Jardim Oceania",
    type: "meta_ad",
    format: "1:1",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["wine", "amber"],
    cta: "Ver anúncio",
  },
  {
    id: "demo_jardim_oceania_captacao",
    title: "Captação Proprietário",
    propertyName: "Jardim Oceania",
    type: "display",
    format: "16:9",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["amber", "graphite"],
  },
  {
    id: "demo_bessa_site",
    title: "Destaque Site",
    propertyName: "Bessa Garden",
    type: "landing",
    format: "16:9",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["primary", "petrol"],
    cta: "Ver página",
  },
  {
    id: "demo_luxo_jp_reel",
    title: "Reel Premium",
    propertyName: "Collection: Luxo João Pessoa",
    type: "reel",
    format: "9:16",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["lilac", "primary"],
    duration: "00:15",
  },
  {
    id: "demo_luxo_jp_carrossel",
    title: "Carrossel Alto Padrão",
    propertyName: "Collection: Luxo João Pessoa",
    type: "carousel",
    format: "1:1",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["primary", "lilac"],
    slideCount: 6,
  },
  {
    id: "demo_luxo_jp_site",
    title: "Site Hero",
    propertyName: "Collection: Luxo João Pessoa",
    type: "landing",
    format: "16:9",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["petrol", "lilac"],
    cta: "Ver página",
  },
  {
    id: "demo_luxo_jp_lancamento",
    title: "Lançamento Premium",
    propertyName: "Collection: Luxo João Pessoa",
    type: "meta_ad",
    format: "4:5",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["lilac", "cyan"],
    cta: "Ver anúncio",
  },
  {
    id: "demo_luxo_jp_captacao",
    title: "Captação Proprietário",
    propertyName: "Collection: Luxo João Pessoa",
    type: "display",
    format: "16:9",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["primary", "graphite"],
  },
  {
    id: "demo_open_house_story",
    title: "Story Visita",
    propertyName: "Collection: Open House Julho",
    type: "story",
    format: "9:16",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["cyan", "primary"],
    duration: "00:11",
  },
  {
    id: "demo_open_house_meta",
    title: "Meta Feed",
    propertyName: "Collection: Open House Julho",
    type: "meta_ad",
    format: "1:1",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["cyan", "ice"],
    cta: "Ver anúncio",
  },
  {
    id: "demo_open_house_site",
    title: "Site Hero",
    propertyName: "Collection: Open House Julho",
    type: "landing",
    format: "16:9",
    badge: "Dados de demonstração",
    simulated: true,
    palette: ["primary", "cyan"],
    cta: "Ver página",
  },
];

// Toda miniatura demo aponta para o pack mockado do manifesto — nenhuma
// imagem de cliente real, nenhum arquivo remoto.
export const MOCK_DEMO_MEDIA: DemoMediaItem[] = MOCK_DEMO_MEDIA_BASE.map((item) => ({
  ...item,
  imageSrc: item.imageSrc ?? demoImageForType(item.type, item.format),
}));
