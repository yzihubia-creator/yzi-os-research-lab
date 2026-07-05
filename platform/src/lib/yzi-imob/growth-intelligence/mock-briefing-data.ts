// Dataset mockado do Mock Brain — tenant fictício "Imobiliária Horizonte".
// Determinístico, coerente e declarado: todo registro carrega simulated: true
// e a Surface exibe "Dados de demonstração" de forma permanente.

import type {
  BriefingEvidence,
  BriefingGreeting,
  BriefingItem,
  BriefingLearning,
  BriefingPanoramaCard,
  BriefingPendingDecision,
} from "./types";

export const BRIEFING_TENANT_ID = "tenant_mock_growth_001";

export const MOCK_BRIEFING_GREETING: BriefingGreeting = {
  saudacao: "Bom dia, Eric.",
  oQueAconteceu:
    "Desde a sua última visita, a peça do Reel Premium entrou em revisão em Conteúdo e a campanha do Altiplano segue em rascunho aguardando orçamento.",
  oQueEncontrei: [
    "Encontrei 3 oportunidades para a sua carteira.",
    "Identifiquei 2 pontos de atenção — um deles consome verba sem retorno.",
    "Nenhuma urgência crítica hoje.",
  ],
  porOndeComecaria:
    "Eu começaria pelo anúncio do Jardim Oceania — é onde há dinheiro saindo sem conversa entrando. Está tudo abaixo, na ordem que eu olharia.",
};

export const MOCK_BRIEFING_EVIDENCE: BriefingEvidence[] = [
  {
    id: "ev_busca_bessa_2q",
    tenantId: BRIEFING_TENANT_ID,
    simulated: true,
    fact: "As buscas por apartamentos de 2 quartos no Bessa cresceram 38% nos últimos 90 dias.",
    source: "Search Console (demonstração)",
    period: "últimos 90 dias",
  },
  {
    id: "ev_carrossel_ctr",
    tenantId: BRIEFING_TENANT_ID,
    simulated: true,
    fact: "Os seus carrosséis tiveram o dobro do desempenho dos posts estáticos.",
    source: "Histórico de conteúdo (demonstração)",
    period: "últimos 60 dias",
  },
  {
    id: "ev_altiplano_leads",
    tenantId: BRIEFING_TENANT_ID,
    simulated: true,
    fact: "O apartamento do Altiplano está há 84 dias sem novos leads.",
    source: "CRM (demonstração)",
    period: "84 dias",
  },
  {
    id: "ev_anuncio_oceania",
    tenantId: BRIEFING_TENANT_ID,
    simulated: true,
    fact: "O anúncio do Jardim Oceania gastou 6 dias de verba sem gerar nenhuma conversa.",
    source: "Histórico de campanhas (demonstração)",
    period: "últimos 6 dias",
  },
  {
    id: "ev_concorrente_cabo_branco",
    tenantId: BRIEFING_TENANT_ID,
    simulated: true,
    fact: "Um lançamento concorrente entrou no ar em Cabo Branco com 3 anúncios ativos.",
    source: "Leitura de mercado (demonstração)",
    period: "esta semana",
  },
  {
    id: "ev_cpl_meta",
    tenantId: BRIEFING_TENANT_ID,
    simulated: true,
    fact: "O custo por conversa das suas campanhas no Meta ficou em R$ 19 nas últimas 3 campanhas.",
    source: "Histórico de campanhas (demonstração)",
    period: "últimos 4 meses",
  },
  {
    id: "ev_sem_video",
    tenantId: BRIEFING_TENANT_ID,
    simulated: true,
    fact: "A sua carteira ainda não publicou nenhum vídeo — não há histórico próprio de Reels.",
    source: "Histórico de conteúdo (demonstração)",
    period: "todo o período",
  },
];

export const MOCK_BRIEFING_ITEMS: BriefingItem[] = [
  {
    id: "atencao_anuncio_oceania",
    tenantId: BRIEFING_TENANT_ID,
    simulated: true,
    kind: "atencao",
    title: "Este anúncio consome verba sem retorno",
    impact: "Interromper agora preserva o orçamento restante do mês.",
    confidence: "alta",
    nextAction: "Decidir entre pausar ou reposicionar o anúncio.",
    evidenceIds: ["ev_anuncio_oceania"],
    recommendation: {
      observei: "O anúncio do Jardim Oceania gastou 6 dias de verba sem gerar nenhuma conversa.",
      interpretei:
        "O problema não parece ser o imóvel: o público configurado está amplo demais para o perfil dele.",
      impactoEsperado:
        "Pausar agora preserva o orçamento restante; reposicionar tende a retomar conversas na primeira semana.",
      recomendo: "Pausar o anúncio hoje e preparar uma nova versão com público mais próximo do perfil do imóvel.",
      porQue: "Nas suas campanhas anteriores, públicos amplos custaram mais que o dobro por conversa.",
      confianca: "alta",
      confiancaBase: "dados diretos da própria campanha",
      proximaAcao: "Aprovar a pausa e a preparação da nova versão em Campanhas.",
    },
    allowedRoutes: ["campanha", "adiar"],
  },
  {
    id: "atencao_altiplano_parado",
    tenantId: BRIEFING_TENANT_ID,
    simulated: true,
    kind: "atencao",
    title: "Este imóvel está há 84 dias sem novos leads",
    impact: "Sem ajuste, o imóvel tende a continuar invisível para quem procura na região.",
    confidence: "alta",
    nextAction: "Rever o preço com o proprietário antes de qualquer campanha.",
    evidenceIds: ["ev_altiplano_leads"],
    recommendation: {
      observei: "O apartamento do Altiplano está há 84 dias sem novos leads, e o preço pedido está acima de imóveis parecidos na mesma região.",
      interpretei: "Qualquer campanha agora tende a queimar orçamento — o preço afasta antes do anúncio convencer.",
      impactoEsperado: "Com o preço ajustado, imóveis parecidos da sua carteira voltaram a receber leads em poucas semanas.",
      recomendo: "Conversar com o proprietário sobre o preço antes de investir. Quando ajustar, eu volto com o plano.",
      porQue: "Anunciar um imóvel fora de preço gasta verba para trazer visitas que não avançam.",
      confianca: "alta",
      confiancaBase: "comparação direta de preço com imóveis semelhantes",
      proximaAcao: "Decisão sua com o proprietário — este ponto não gera campanha nem conteúdo por enquanto.",
    },
    allowedRoutes: ["adiar"],
    routeNote: "A causa está no preço, fora do alcance de conteúdo ou campanha. Por isso, só alerto.",
  },
  {
    id: "op_carrossel_bessa",
    tenantId: BRIEFING_TENANT_ID,
    simulated: true,
    kind: "oportunidade",
    title: "Existe procura crescente por 2 quartos no Bessa",
    impact: "Tende a dobrar os leads desse perfil nas próximas semanas.",
    confidence: "media",
    nextAction: "Aprovar a produção de um carrossel comparativo.",
    evidenceIds: ["ev_busca_bessa_2q", "ev_carrossel_ctr"],
    recommendation: {
      observei:
        "As buscas por apartamentos de 2 quartos no Bessa cresceram 38% em 90 dias — e você tem 3 imóveis exatamente nesse perfil, dois deles sem conteúdo há um mês.",
      interpretei: "Existe demanda não atendida, e a sua carteira já tem o que ela procura.",
      impactoEsperado:
        "A tendência é dobrar os leads desse perfil nas próximas semanas — estimativa baseada nas suas peças dos últimos 90 dias.",
      recomendo: "Um carrossel comparativo dos 3 imóveis, publicado na terça às 18h.",
      porQue: "Os seus carrosséis tiveram o dobro do desempenho dos posts estáticos nesse período.",
      confianca: "media",
      confiancaBase: "histórico de 12 peças da sua carteira",
      proximaAcao: "Aprovar a produção — eu preparo tudo e você revisa em Conteúdo antes de publicar.",
    },
    allowedRoutes: ["conteudo", "adiar"],
  },
  {
    id: "op_resposta_cabo_branco",
    tenantId: BRIEFING_TENANT_ID,
    simulated: true,
    kind: "oportunidade",
    title: "Há um lançamento concorrente em Cabo Branco",
    impact: "Responder nesta janela mantém a sua presença para quem compara opções na região.",
    confidence: "media",
    nextAction: "Preparar campanha de comparação para quem busca na região.",
    evidenceIds: ["ev_concorrente_cabo_branco", "ev_cpl_meta"],
    recommendation: {
      observei:
        "Um lançamento concorrente entrou no ar em Cabo Branco com 3 anúncios ativos — e você tem 2 imóveis prontos na mesma faixa e região.",
      interpretei:
        "Quem está vendo os anúncios do concorrente é exatamente quem procuraria os seus imóveis. É uma janela de comparação, não uma ameaça.",
      impactoEsperado:
        "Aparecer agora para esse público tende a trazer conversas a um custo próximo do seu histórico de R$ 19 por conversa.",
      recomendo: "Uma campanha enxuta no Meta para quem busca em Cabo Branco, destacando os diferenciais dos seus 2 imóveis prontos.",
      porQue: "As suas últimas campanhas na região tiveram custo por conversa estável — há base para investir com controle.",
      confianca: "media",
      confiancaBase: "3 campanhas anteriores na mesma região",
      proximaAcao: "Aprovar a preparação — a campanha nasce em rascunho e o orçamento continua com você.",
    },
    allowedRoutes: ["campanha", "conteudo", "adiar"],
  },
  {
    id: "op_teste_reel",
    tenantId: BRIEFING_TENANT_ID,
    simulated: true,
    kind: "oportunidade",
    title: "Vale testar vídeo na sua carteira",
    impact: "O resultado do teste me ensina o que funciona para a sua carteira.",
    confidence: "baixa",
    nextAction: "Aprovar um teste pequeno: 1 Reel contra 1 carrossel.",
    evidenceIds: ["ev_sem_video", "ev_carrossel_ctr"],
    recommendation: {
      observei: "A sua carteira ainda não publicou nenhum vídeo — não tenho histórico próprio de Reels para me apoiar.",
      interpretei: "Ainda não tenho base para afirmar que vídeo funciona aqui. Prefiro testar a chutar.",
      impactoEsperado: "Não estimável ainda — é exatamente o que o teste vai me ensinar.",
      recomendo: "Um teste pequeno: 1 Reel e 1 carrossel do mesmo imóvel, na mesma semana.",
      porQue: "Só o seu próprio resultado me diz o que funciona para a sua carteira — benchmark alheio não vale decisão sua.",
      confianca: "baixa",
      confiancaBase: "sem histórico próprio de vídeo",
      proximaAcao: "Aprovar o experimento — custo mínimo, aprendizado direto.",
    },
    allowedRoutes: ["experimento", "adiar"],
    routeNote: "Confiança baixa não autoriza investimento — por isso proponho só o experimento.",
  },
];

export const MOCK_BRIEFING_PANORAMA: BriefingPanoramaCard[] = [
  {
    id: "pan_mercado",
    label: "Mercado",
    value: "Aquecendo",
    reading: "A procura por 2 quartos no Bessa segue subindo; Cabo Branco ganhou um concorrente novo.",
  },
  {
    id: "pan_competitividade",
    label: "Competitividade",
    value: "2 de 3",
    reading: "Dois dos seus imóveis em destaque competem bem; o do Altiplano está fora de preço.",
  },
  {
    id: "pan_conteudo",
    label: "Conteúdo",
    value: "1 em revisão",
    reading: "Carrosséis seguem sendo o seu formato mais forte; vídeo ainda não foi testado.",
  },
  {
    id: "pan_campanhas",
    label: "Campanhas",
    value: "1 atenção",
    reading: "O custo por conversa está estável, exceto no anúncio do Jardim Oceania.",
  },
];

export const MOCK_BRIEFING_LEARNINGS: BriefingLearning[] = [
  {
    id: "learn_carrossel",
    title: "Carrosséis funcionam melhor que estáticos para a sua carteira",
    detail: "Nos últimos 60 dias, o dobro do desempenho. Passei a priorizar esse formato nas recomendações.",
  },
  {
    id: "learn_publico",
    title: "Públicos amplos custam caro nas suas campanhas",
    detail: "Custo por conversa mais que dobra. Passei a recomendar públicos próximos do perfil do imóvel.",
  },
];

export const MOCK_BRIEFING_PENDING: BriefingPendingDecision[] = [
  {
    id: "pend_reel_premium",
    label: "Reel Premium do Altiplano",
    status: "Em revisão em Conteúdo — aguardando o seu olhar.",
  },
  {
    id: "pend_campanha_altiplano",
    label: "Campanha do Altiplano",
    status: "Rascunho em Campanhas — aguardando a sua definição de orçamento.",
  },
];
