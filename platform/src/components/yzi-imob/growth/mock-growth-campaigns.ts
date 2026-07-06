import type { YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";

import type { GrowthCounter, GrowthStatusAccent } from "./types";

export type GrowthCampaignDraftStatus = "Rascunho" | "Aguardando aprovação" | "Bloqueada por conexão";

export type GrowthCampaignDraft = {
  id: string;
  tenantId: string;
  name: string;
  target: string;
  objective: string;
  suggestedChannels: string[];
  estimatedBudget: string;
  linkedCreatives: string[];
  status: GrowthCampaignDraftStatus;
  nextAction: string;
  audience: string;
  approvedCreativesUsed: string[];
  budgetRationale: string;
  risks: string[];
  suggestedBecause: string;
  sourceInputs: string[];
  recommendedAction: string;
  palette: [YziImobRole, YziImobRole];
};

export const MOCK_GROWTH_CAMPAIGN_COUNTERS: GrowthCounter[] = [
  { label: "Rascunhos", value: "4", detail: "planos preparados para revisão" },
  { label: "Aguardando aprovação", value: "2", detail: "dependem de decisão humana" },
  { label: "Campanhas ativas", value: "0", detail: "nenhuma campanha real criada" },
  { label: "Meta", value: "Não conectado", detail: "sem credencial ou autorização" },
  { label: "Google", value: "Não conectado", detail: "sem credencial ou autorização" },
];

export const GROWTH_CAMPAIGN_STATUS_ACCENT: GrowthStatusAccent = {
  Rascunho: "graphite",
  "Aguardando aprovação": "amber",
  "Bloqueada por conexão": "wine",
};

export const MOCK_GROWTH_CAMPAIGNS: GrowthCampaignDraft[] = [
  {
    id: "campaign_cabo_branco_launch",
    tenantId: "tenant_mock_growth_001",
    name: "Lançamento Premium · Cobertura Cabo Branco",
    target: "Cobertura Cabo Branco",
    objective: "Organizar interesse qualificado para visitas de alto padrão.",
    suggestedChannels: ["Instagram Feed", "Meta Leads", "Site Destaque"],
    estimatedBudget: "R$ 1.800 a R$ 2.400 / 10 dias",
    linkedCreatives: ["Carrossel Alto Padrão", "Site Hero", "Reel Premium"],
    status: "Aguardando aprovação",
    nextAction: "Revisar plano e aprovar orçamento antes de qualquer envio.",
    audience: "Famílias e investidores em João Pessoa com interesse em cobertura, vista e área gourmet.",
    approvedCreativesUsed: ["Carrossel Alto Padrão", "Site Hero"],
    budgetRationale: "Verba sugerida para validar demanda premium sem comprometer escala antes da aprovação.",
    risks: ["Meta Ads não conectado", "Google Ads não conectado", "Orçamento ainda não aprovado pelo tenant"],
    suggestedBecause: "O briefing apontou alta atratividade visual e a biblioteca já tem criativos aprovados para o imóvel.",
    sourceInputs: ["Briefing: oportunidade premium", "Conteúdo: carrossel aprovado", "Biblioteca: pacote Site Hero"],
    recommendedAction: "Enviar para aprovação humana depois de ajustar o orçamento final.",
    palette: ["petrol", "primary"],
  },
  {
    id: "campaign_manaira_reactivation",
    tenantId: "tenant_mock_growth_001",
    name: "Reativação · Imóveis parados em Manaíra",
    target: "Manaíra Residence + imóveis similares",
    objective: "Reativar interesse com chamada de visita e argumento de localização.",
    suggestedChannels: ["Instagram Stories", "Lista de atendimento", "Meta Leads"],
    estimatedBudget: "R$ 900 a R$ 1.200 / 7 dias",
    linkedCreatives: ["Story Visita", "Open House Julho"],
    status: "Rascunho",
    nextAction: "Confirmar lista de imóveis e janela de visita antes de pedir aprovação.",
    audience: "Leads antigos que buscaram Manaíra, famílias em comparação de bairro e contatos com visita não concluída.",
    approvedCreativesUsed: ["Story Visita"],
    budgetRationale: "Orçamento curto para testar reativação sem inflar mídia paga.",
    risks: ["Base de leads precisa de revisão humana", "Meta Ads não conectado"],
    suggestedBecause: "O briefing indicou oportunidade de recuperar demanda e a biblioteca já tem story aprovado.",
    sourceInputs: ["Briefing: reativação", "Conteúdo: Story Visita aprovado", "Biblioteca: Open House Julho"],
    recommendedAction: "Manter como rascunho até validar a lista de contatos e a agenda de visitas.",
    palette: ["ice", "cyan"],
  },
  {
    id: "campaign_altiplano_owners",
    tenantId: "tenant_mock_growth_001",
    name: "Captação Proprietários · Altiplano",
    target: "Collection: proprietários Altiplano",
    objective: "Atrair proprietários com imóveis premium para captação consultiva.",
    suggestedChannels: ["Instagram Feed", "Site Conteúdo", "Google Search futuro"],
    estimatedBudget: "R$ 1.200 a R$ 1.600 / 14 dias",
    linkedCreatives: ["Meta Feed", "Captação Proprietário"],
    status: "Bloqueada por conexão",
    nextAction: "Resolver pendências de mensagem e conexão antes de publicar.",
    audience: "Proprietários no Altiplano que avaliam vender ou alugar imóveis de alto padrão.",
    approvedCreativesUsed: ["Captação Proprietário"],
    budgetRationale: "Verba moderada porque a campanha depende de mensagem mais precisa e canal validado.",
    risks: ["Google Ads não conectado", "Criativo Meta Feed falhou", "Promessa de captação precisa revisão jurídica/comercial"],
    suggestedBecause: "A biblioteca mostra demanda por material de captação, mas o conteúdo principal ainda tem falha.",
    sourceInputs: ["Briefing: captação", "Conteúdo: Meta Feed falhou", "Biblioteca: asset Captação Proprietário"],
    recommendedAction: "Ajustar criativo e revisar promessa antes de enviar para aprovação.",
    palette: ["wine", "amber"],
  },
  {
    id: "campaign_open_house_luxury_jp",
    tenantId: "tenant_mock_growth_001",
    name: "Open House Julho · Collection Luxo João Pessoa",
    target: "Collection: Luxo João Pessoa",
    objective: "Concentrar visitas qualificadas em imóveis premium durante julho.",
    suggestedChannels: ["Instagram Reels", "Instagram Feed", "Meta Leads"],
    estimatedBudget: "R$ 2.400 a R$ 3.200 / 12 dias",
    linkedCreatives: ["Reel Premium", "Open House Julho", "Carrossel Alto Padrão"],
    status: "Aguardando aprovação",
    nextAction: "Revisar datas, orçamento e imóveis participantes.",
    audience: "Compradores de alto padrão em João Pessoa, investidores e leads com histórico de busca por luxo.",
    approvedCreativesUsed: ["Reel Premium", "Open House Julho"],
    budgetRationale: "Maior verba por envolver collection premium e janela curta de visita.",
    risks: ["Agenda dos imóveis ainda precisa confirmação", "Meta Ads não conectado", "Nenhuma campanha real será criada nesta demo"],
    suggestedBecause: "O briefing encontrou oportunidade de collection e a biblioteca possui pacote visual consistente.",
    sourceInputs: ["Briefing: collection premium", "Conteúdo: Reel Premium aprovado", "Biblioteca: Collection Luxo João Pessoa"],
    recommendedAction: "Enviar para aprovação depois de confirmar agenda e orçamento.",
    palette: ["lilac", "primary"],
  },
];
