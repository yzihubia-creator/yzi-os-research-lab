import type { YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";

import type { GrowthCounter, GrowthStatusAccent } from "./types";

export type GrowthCreativeStatus = "Gerando" | "Em revisão" | "Aprovado" | "Falhou";
export type GrowthCreativeFormat = "Reel" | "Story" | "Carrossel" | "Meta Feed" | "Site";

export type GrowthCreativeItem = {
  id: string;
  name: string;
  property: string;
  propertyId: string;
  channel: string;
  format: GrowthCreativeFormat;
  status: GrowthCreativeStatus;
  credits: string;
  creditMode: "consumidos" | "reservados" | "não consumidos";
  objective: string;
  recommendedAction: string;
  readiness: number;
  usedData: string[];
  pendencies: string[];
  palette: [YziImobRole, YziImobRole];
  headline: string;
  supportingText: string;
};

export const MOCK_GROWTH_ASSET_COUNTERS: GrowthCounter[] = [
  { label: "Criativos", value: "12", detail: "mock operacional do tenant" },
  { label: "Em revisão", value: "4", detail: "dependem de aprovação humana" },
  { label: "Gerando", value: "3", detail: "estado visual simulado" },
  { label: "Reservados", value: "84", detail: "créditos separados" },
  { label: "Disponíveis", value: "1.144", detail: "saldo conceitual" },
];

export const GROWTH_ASSET_STATUS_ACCENT: GrowthStatusAccent = {
  Gerando: "amber",
  "Em revisão": "lilac",
  Aprovado: "coldGreen",
  Falhou: "wine",
};

export const MOCK_GROWTH_ASSETS: GrowthCreativeItem[] = [
  {
    id: "asset_altiplano_reel_01",
    name: "Reel Premium",
    property: "Apartamento Altiplano",
    propertyId: "property_altiplano_001",
    channel: "Instagram Reels",
    format: "Reel",
    status: "Em revisão",
    credits: "18",
    creditMode: "consumidos",
    objective: "Gerar desejo por visita qualificada",
    recommendedAction: "Aprovar para preparar a campanha",
    readiness: 92,
    usedData: ["bairro", "varanda", "metragem", "diferenciais", "preço sob consulta"],
    pendencies: ["Aprovação humana antes de uso em campanha"],
    palette: ["primary", "cyan"],
    headline: "Vista alta, rotina leve",
    supportingText: "Apartamento pronto para visita com varanda e acabamento premium.",
  },
  {
    id: "asset_cabo_branco_carrossel_01",
    name: "Carrossel Alto Padrão",
    property: "Cobertura Cabo Branco",
    propertyId: "property_cabo_branco_014",
    channel: "Instagram Feed",
    format: "Carrossel",
    status: "Gerando",
    credits: "12",
    creditMode: "reservados",
    objective: "Organizar argumentos de valor",
    recommendedAction: "Aguardar conclusão do preview",
    readiness: 68,
    usedData: ["cobertura", "vista mar", "área gourmet", "suítes"],
    pendencies: ["Preview ainda em preparação visual"],
    palette: ["petrol", "primary"],
    headline: "Cobertura com presença",
    supportingText: "Sequência visual para destacar vista, planta e área social.",
  },
  {
    id: "asset_manaira_story_01",
    name: "Story Visita",
    property: "Manaíra Residence",
    propertyId: "property_manaira_009",
    channel: "Instagram Stories",
    format: "Story",
    status: "Aprovado",
    credits: "6",
    creditMode: "consumidos",
    objective: "Convidar para visita no fim de semana",
    recommendedAction: "Preparar distribuição no canal escolhido",
    readiness: 100,
    usedData: ["localização", "data de visita", "perfil familiar"],
    pendencies: ["Canal ainda não conectado nesta unidade"],
    palette: ["coldGreen", "cyan"],
    headline: "Visita neste sábado",
    supportingText: "Story curto para captar interesse e levar ao atendimento.",
  },
  {
    id: "asset_jardim_oceania_meta_01",
    name: "Meta Feed",
    property: "Jardim Oceania",
    propertyId: "property_jardim_oceania_004",
    channel: "Meta Feed",
    format: "Meta Feed",
    status: "Falhou",
    credits: "0",
    creditMode: "não consumidos",
    objective: "Testar oferta de captação",
    recommendedAction: "Solicitar nova versão após revisar dados do imóvel",
    readiness: 24,
    usedData: ["bairro", "tipo do imóvel"],
    pendencies: ["Faltam diferenciais claros do imóvel", "Nenhum crédito consumido"],
    palette: ["wine", "amber"],
    headline: "Oferta em ajuste",
    supportingText: "A peça precisa de mais informação para parecer pronta.",
  },
  {
    id: "asset_bessa_site_01",
    name: "Destaque Site",
    property: "Bessa Garden",
    propertyId: "property_bessa_022",
    channel: "Site",
    format: "Site",
    status: "Em revisão",
    credits: "10",
    creditMode: "consumidos",
    objective: "Abrir seção de imóvel em página de campanha",
    recommendedAction: "Aprovar após checar chamada principal",
    readiness: 88,
    usedData: ["fachada", "planta", "CTA", "benefícios do bairro"],
    pendencies: ["Revisar CTA antes de publicar manualmente"],
    palette: ["primary", "petrol"],
    headline: "Bessa Garden",
    supportingText: "Página de entrada com argumento claro para lead qualificado.",
  },
];
