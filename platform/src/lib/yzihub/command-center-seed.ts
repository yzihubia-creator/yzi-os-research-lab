// YZIHUB Command Center V1 — seed controlado (em código, sem banco).
//
// Conjunto MÍNIMO e NEUTRO de dados da própria YZIHUB para a primeira tela
// estratégica real do YZI OS, conforme
// docs/yzi-os-active/04-implementation/yzihub-command-center-v1.md (Seção 5).
//
// Honestidade obrigatória: estes dados são SEED CONTROLADO — não vêm de banco,
// não são execução real e não prometem ação real. A UI deve rotulá-los como tal.
// Nada de Jurema, Café com Pam, campanha política ou vertical imobiliária:
// o seed representa a operação neutra da YZIHUB (hub de produto/serviços com IA).
//
// Módulo puro de dados: sem `use client`, sem I/O, sem Supabase, sem env, sem
// service role, sem SQL, sem chamada externa. Apenas constantes tipadas.

/** Rótulos honestos de estado — nenhuma ação real acontece nesta fase. */
export type HonestState =
  | "preview"
  | "planejado"
  | "aguarda autorização"
  | "seed controlado";

/** Tom semântico para realce visual (oportunidade / risco / neutro / YZI). */
export type Tone = "neutral" | "opportunity" | "risk" | "yzi";

export type Opportunity = {
  id: string;
  title: string;
  stage: string;
  value: string;
  signal: string;
  tone: Tone;
};

export type ActionItem = {
  id: string;
  title: string;
  context: string;
  due: string;
  state: HonestState;
};

export type AgendaEvent = {
  id: string;
  time: string;
  title: string;
  kind: string;
};

export type FinanceItem = {
  id: string;
  label: string;
  amount: string;
  kind: "receita" | "despesa" | "a receber";
  note: string;
};

export type ContentItem = {
  id: string;
  title: string;
  channel: string;
  status: string;
  state: HonestState;
};

export type Recommendation = {
  id: string;
  headline: string;
  rationale: string;
  action: string;
  state: HonestState;
};

export type CreditsSummary = {
  used: number;
  total: number;
  period: string;
  note: string;
};

export type OperationalAlert = {
  id: string;
  title: string;
  detail: string;
  tone: Tone;
};

/** Capacidade do sistema operacional — módulo apresentado por job/resultado. */
export type ModuleCapability = {
  key: string;
  name: string;
  job: string;
  plan: "Start" | "Pro" | "Growth";
};

export type CommandCenterSeed = {
  company: {
    name: string;
    dayLabel: string;
    /** Resumo vivo do estado, escrito como a YZI leria o dia. */
    stateSummary: string;
    priorityOfDay: string;
  };
  /** Recomendação principal da YZI no topo da tela. */
  principalRecommendation: Recommendation;
  opportunities: Opportunity[];
  actions: ActionItem[];
  agenda: AgendaEvent[];
  finance: FinanceItem[];
  content: ContentItem[];
  recommendations: Recommendation[];
  credits: CreditsSummary;
  alert: OperationalAlert;
  modules: ModuleCapability[];
};

/**
 * Seed controlado da YZIHUB para o Command Center V1.
 *
 * Valores ilustrativos e neutros, suficientes para a tela provar
 * "decisão + ação contínua" sem fabricar tenant, sem banco e sem execução real.
 */
export const yzihubCommandCenterSeed: CommandCenterSeed = {
  company: {
    name: "YZIHUB",
    dayLabel: "Seu dia na YZIHUB",
    stateSummary:
      "Operação saudável e com tração: 3 oportunidades abertas, caixa positivo no mês e conteúdo pronto para distribuir. O ponto de atenção é uma proposta de alto valor esfriando — é a prioridade de hoje.",
    priorityOfDay:
      "Recuperar a proposta de alto valor antes que esfrie e destravar a receita prevista do mês.",
  },

  principalRecommendation: {
    id: "rec-principal",
    headline: "Retomar agora a proposta da plataforma B2B",
    rationale:
      "É a oportunidade de maior valor em aberto, sem contato há 5 dias e com sinal de esfriamento. Recuperá-la tem o maior impacto no resultado do mês.",
    action: "Preparar e enviar follow-up de retomada ao decisor.",
    state: "aguarda autorização",
  },

  opportunities: [
    {
      id: "opp-1",
      title: "Plataforma B2B — cliente novo",
      stage: "Proposta enviada",
      value: "R$ 48k / ano",
      signal: "Quente, mas esfriando (5 dias sem resposta)",
      tone: "opportunity",
    },
    {
      id: "opp-2",
      title: "Renovação de contrato anual",
      stage: "Em negociação",
      value: "R$ 36k / ano",
      signal: "No prazo — renovação em 3 semanas",
      tone: "neutral",
    },
    {
      id: "opp-3",
      title: "Upsell — módulo de Conteúdo IA",
      stage: "Sondagem",
      value: "R$ 1,2k / mês",
      signal: "Cliente ativo demonstrou interesse",
      tone: "opportunity",
    },
  ],

  actions: [
    {
      id: "act-1",
      title: "Retomar proposta da plataforma B2B",
      context: "Oportunidade de maior valor, parada há 5 dias",
      due: "Hoje",
      state: "aguarda autorização",
    },
    {
      id: "act-2",
      title: "Responder lead que pediu orçamento",
      context: "Entrou ontem pelo formulário do site",
      due: "Hoje",
      state: "preview",
    },
    {
      id: "act-3",
      title: "Confirmar pagamento pendente",
      context: "Fatura vencida há 2 dias",
      due: "Amanhã",
      state: "preview",
    },
  ],

  agenda: [
    {
      id: "evt-1",
      time: "10:00",
      title: "Descoberta com prospect (plataforma B2B)",
      kind: "Comercial",
    },
    {
      id: "evt-2",
      time: "14:00",
      title: "Alinhamento de roadmap do produto",
      kind: "Interno",
    },
    {
      id: "evt-3",
      time: "16:30",
      title: "Call de fechamento — renovação anual",
      kind: "Comercial",
    },
  ],

  finance: [
    {
      id: "fin-1",
      label: "Receita prevista do mês",
      amount: "R$ 62k",
      kind: "receita",
      note: "No ritmo da meta",
    },
    {
      id: "fin-2",
      label: "Custos fixos (infra + ferramentas)",
      amount: "R$ 14k",
      kind: "despesa",
      note: "Estável vs. mês anterior",
    },
    {
      id: "fin-3",
      label: "A receber em atraso",
      amount: "R$ 3,5k",
      kind: "a receber",
      note: "1 fatura vencida há 2 dias",
    },
  ],

  content: [
    {
      id: "cnt-1",
      title: "Carrossel — IA aplicada à operação",
      channel: "Instagram / LinkedIn",
      status: "Pronto para publicar",
      state: "aguarda autorização",
    },
    {
      id: "cnt-2",
      title: "Campanha de captação de leads",
      channel: "Meta Ads",
      status: "No ar — desempenho acima da média",
      state: "preview",
    },
    {
      id: "cnt-3",
      title: "Artigo de autoridade — tendências de IA",
      channel: "Blog / Newsletter",
      status: "Em rascunho",
      state: "planejado",
    },
  ],

  recommendations: [
    {
      id: "rec-1",
      headline: "Priorizar o follow-up de alto valor",
      rationale: "Proposta de R$ 48k esfriando — maior impacto no mês.",
      action: "Enviar retomada ao decisor.",
      state: "aguarda autorização",
    },
    {
      id: "rec-2",
      headline: "Escalar a campanha de captação",
      rationale: "Desempenho acima da média e custo por lead baixo.",
      action: "Aumentar verba dentro do limite de créditos.",
      state: "aguarda autorização",
    },
    {
      id: "rec-3",
      headline: "Publicar o carrossel pronto hoje",
      rationale: "Conteúdo aprovado parado reduz alcance e geração de leads.",
      action: "Publicar nos canais conectados.",
      state: "aguarda autorização",
    },
  ],

  credits: {
    used: 320,
    total: 1000,
    period: "Ciclo atual",
    note: "Consumo dentro do previsto. Execução da YZI ocorre só dentro deste limite e com autorização.",
  },

  alert: {
    id: "alert-1",
    title: "Oportunidade de alto valor esfriando",
    detail:
      "A proposta da plataforma B2B (R$ 48k) está há 5 dias sem resposta. Sem retomada, tende a esfriar de vez.",
    tone: "risk",
  },

  modules: [
    { key: "dashboard", name: "Dashboard", job: "Entender o estado do negócio", plan: "Start" },
    { key: "crm", name: "CRM", job: "Avançar relacionamentos e oportunidades", plan: "Start" },
    { key: "leads", name: "Leads", job: "Capturar e priorizar oportunidades", plan: "Start" },
    { key: "followups", name: "Follow-ups", job: "Recuperar e dar continuidade", plan: "Start" },
    { key: "calendar", name: "Calendário", job: "Organizar tempo e compromissos", plan: "Start" },
    { key: "finance", name: "Gestão Financeira", job: "Cuidar da saúde e previsibilidade", plan: "Start" },
    { key: "chat", name: "Chat", job: "Conduzir conversas operacionais", plan: "Pro" },
    { key: "reports", name: "Relatórios e Recomendações", job: "Aprender e decidir o próximo passo", plan: "Pro" },
    { key: "radar", name: "Radar", job: "Captar oportunidades de mercado", plan: "Growth" },
    { key: "ads", name: "Tráfego Pago", job: "Adquirir com decisão de investimento", plan: "Growth" },
    { key: "content", name: "Conteúdo IA", job: "Produzir e distribuir presença", plan: "Growth" },
    { key: "yzi", name: "AI Assistant / YZI", job: "Recomendar e executar o autorizado", plan: "Growth" },
  ],
};
