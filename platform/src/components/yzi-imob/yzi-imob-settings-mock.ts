// Mock de Configurações do YZI IMOB. Configurações não é cemitério de opções:
// é onde a imobiliária define como opera. Demonstração honesta: nenhuma regra
// é persistida nem aplicada à operação; os defaults abaixo representam o
// futuro schema por tenant. Sem backend, sem Runtime, sem WhatsApp real.
// Política comercial (comissão, divisão de corretagem) é decisão de negócio
// de cada imobiliária — aqui existe APENAS como placeholder, sem campos.

/* ------------------------------------------------------------------ */
/* Seções                                                              */
/* ------------------------------------------------------------------ */

export type SettingsSectionId =
  | "empresa"
  | "marca"
  | "site"
  | "seo"
  | "whatsapp"
  | "ia"
  | "automacoes"
  | "corretores"
  | "permissoes"
  | "seguranca"
  | "backups"
  | "sistema";

export type SettingsSectionMeta = {
  id: SettingsSectionId;
  label: string;
  /** Uma linha, em linguagem de operação — não jargão de sistema. */
  description: string;
  /**
   * "ativa": regra real de operação (só Corretores). "demonstracao": tem
   * campos mock visuais/editáveis, mas nada é salvo ou aplicado.
   */
  status: "ativa" | "demonstracao";
};

export const SETTINGS_SECTIONS: SettingsSectionMeta[] = [
  {
    id: "empresa",
    label: "Empresa",
    description: "Dados da imobiliária: razão social, CRECI jurídico, endereço e contatos.",
    status: "demonstracao",
  },
  {
    id: "marca",
    label: "Marca",
    description: "Logo, cores e tom de voz usados pela YZI nos materiais e no site.",
    status: "demonstracao",
  },
  {
    id: "site",
    label: "Site",
    description: "Domínio, páginas publicadas e o que aparece na vitrine de imóveis.",
    status: "demonstracao",
  },
  {
    id: "seo",
    label: "SEO",
    description: "Como o site aparece no Google: títulos, descrições e indexação.",
    status: "demonstracao",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Número conectado, horário de resposta e como a YZI atende os leads.",
    status: "demonstracao",
  },
  {
    id: "ia",
    label: "IA",
    description: "O que a YZI pode fazer sozinha e o que sempre espera aprovação humana.",
    status: "demonstracao",
  },
  {
    id: "automacoes",
    label: "Automações",
    description: "Rotinas automáticas: follow-ups, lembretes e disparos programados.",
    status: "demonstracao",
  },
  {
    id: "corretores",
    label: "Corretores",
    description: "Regras de operação: prioridade do captador, prazos de aceite, fallback e feedback.",
    status: "ativa",
  },
  {
    id: "permissoes",
    label: "Permissões",
    description: "Quem vê e quem faz o quê dentro da plataforma.",
    status: "demonstracao",
  },
  {
    id: "seguranca",
    label: "Segurança",
    description: "Acessos, sessões ativas e proteção da conta da imobiliária.",
    status: "demonstracao",
  },
  {
    id: "backups",
    label: "Backups",
    description: "Cópias dos dados operacionais e como recuperá-los.",
    status: "demonstracao",
  },
  {
    id: "sistema",
    label: "Sistema",
    description: "Ambiente, versão e uso de créditos da plataforma.",
    status: "demonstracao",
  },
];

/* ------------------------------------------------------------------ */
/* Empresa                                                             */
/* ------------------------------------------------------------------ */

export type CompanySettings = {
  razaoSocial: string;
  cnpj: string;
  creciJuridico: string;
  cidadeSede: string;
  telefone: string;
  email: string;
};

export const DEMO_COMPANY_SETTINGS: CompanySettings = {
  razaoSocial: "YZI Imóveis Demonstração Ltda.",
  cnpj: "00.000.000/0001-00",
  creciJuridico: "CRECI/SC 9.999-J",
  cidadeSede: "Balneário Camboriú",
  telefone: "(47) 3000-0000",
  email: "contato@yzi.demo",
};

/* ------------------------------------------------------------------ */
/* Marca                                                               */
/* ------------------------------------------------------------------ */

export type BrandTone = "consultivo" | "direto" | "institucional";

export type BrandSettings = {
  nomeExibido: string;
  corPrimaria: string; // hex, ilustrativo
  tom: BrandTone;
};

export const DEMO_BRAND_SETTINGS: BrandSettings = {
  nomeExibido: "YZI Imóveis",
  corPrimaria: "#5CBECC",
  tom: "consultivo",
};

export const BRAND_TONE_OPTIONS: { value: BrandTone; label: string }[] = [
  { value: "consultivo", label: "Consultivo — apresenta, não empurra" },
  { value: "direto", label: "Direto — objetivo e rápido" },
  { value: "institucional", label: "Institucional — formal, corporativo" },
];

/* ------------------------------------------------------------------ */
/* Site                                                                */
/* ------------------------------------------------------------------ */

export type SiteSettings = {
  dominio: string;
  status: "publicado" | "rascunho";
  aceitaLeadsPeloSite: boolean;
};

export const DEMO_SITE_SETTINGS: SiteSettings = {
  dominio: "yziimoveis.demo",
  status: "rascunho",
  aceitaLeadsPeloSite: true,
};

/* ------------------------------------------------------------------ */
/* SEO                                                                 */
/* ------------------------------------------------------------------ */

export type SeoSettings = {
  tituloSite: string;
  metaDescription: string;
  indexavel: boolean;
};

export const DEMO_SEO_SETTINGS: SeoSettings = {
  tituloSite: "YZI Imóveis — Imóveis em Balneário Camboriú",
  metaDescription:
    "Encontre apartamentos, casas e lançamentos com a YZI. Atendimento consultivo do primeiro contato à visita.",
  indexavel: true,
};

/* ------------------------------------------------------------------ */
/* WhatsApp                                                            */
/* ------------------------------------------------------------------ */

export type WhatsappSettings = {
  numeroConectado: string; // mascarado
  conectado: boolean;
  janelaInicio: string;
  janelaFim: string;
};

export const DEMO_WHATSAPP_SETTINGS: WhatsappSettings = {
  numeroConectado: "+55 47 9****-0341",
  conectado: true,
  janelaInicio: "08:00",
  janelaFim: "20:00",
};

/* ------------------------------------------------------------------ */
/* IA — política do produto, não do tenant (read-only)                 */
/* ------------------------------------------------------------------ */

export const IA_AUTONOMOUS_ACTIONS: string[] = [
  "Responder perguntas sobre imóveis do catálogo",
  "Qualificar leads com base em preferências informadas",
  "Sugerir corretor elegível para um lead",
  "Registrar aprendizados de conversas",
];

export const IA_APPROVAL_REQUIRED_ACTIONS: string[] = [
  "Publicar um imóvel no site",
  "Disparar campanha de anúncio",
  "Enviar proposta ou contrato",
  "Alterar dados cadastrais de corretor ou cliente",
];

/* ------------------------------------------------------------------ */
/* Automações                                                          */
/* ------------------------------------------------------------------ */

export type AutomationRule = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

export const DEMO_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "lembrete-followup",
    label: "Lembrete de follow-up",
    description: "Avisa o corretor quando um lead fica sem contato por 3 dias.",
    enabled: true,
  },
  {
    id: "aviso-feedback",
    label: "Aviso de feedback pendente",
    description: "Reforça o pedido de feedback pós-visita quando o prazo se aproxima.",
    enabled: true,
  },
  {
    id: "resumo-semanal",
    label: "Resumo semanal da operação",
    description: "Envia um resumo dos handoffs e feedbacks da semana.",
    enabled: false,
  },
];

/* ------------------------------------------------------------------ */
/* Permissões (read-only)                                              */
/* ------------------------------------------------------------------ */

export type PermissionRow = {
  papel: string;
  descricao: string;
};

export const DEMO_PERMISSION_ROWS: PermissionRow[] = [
  { papel: "Admin", descricao: "Vê e configura tudo, inclusive Configurações." },
  { papel: "Corretor", descricao: "Vê sua carteira, seus leads e feedbacks pendentes." },
  { papel: "Recepção", descricao: "Vê a fila de atendimento, sem acesso a indicadores." },
];

/* ------------------------------------------------------------------ */
/* Segurança                                                           */
/* ------------------------------------------------------------------ */

export type ActiveSession = {
  id: string;
  device: string;
  location: string;
  lastActiveLabel: string;
};

export const DEMO_ACTIVE_SESSIONS: ActiveSession[] = [
  { id: "s1", device: "Chrome · Windows", location: "Balneário Camboriú, SC", lastActiveLabel: "agora" },
  { id: "s2", device: "Safari · iPhone", location: "São Paulo, SP", lastActiveLabel: "há 2 dias" },
];

/* ------------------------------------------------------------------ */
/* Backups                                                             */
/* ------------------------------------------------------------------ */

export type BackupFrequency = "diario" | "semanal" | "mensal";

export const DEMO_LAST_BACKUP_LABEL = "ontem às 03:00";

export const BACKUP_FREQUENCY_OPTIONS: { value: BackupFrequency; label: string }[] = [
  { value: "diario", label: "Diário" },
  { value: "semanal", label: "Semanal" },
  { value: "mensal", label: "Mensal" },
];

/* ------------------------------------------------------------------ */
/* Sistema                                                             */
/* ------------------------------------------------------------------ */

export const SYSTEM_ENVIRONMENT_LABEL = "Demonstração";
export const SYSTEM_VERSION_LABEL = "YZI IMOB MVP";

/* ------------------------------------------------------------------ */
/* Regras de operação dos corretores                                   */
/* ------------------------------------------------------------------ */

export type FallbackMode = "proximo-elegivel" | "fila-geral";
export type LaunchEligibility = "todos-ativos" | "por-area" | "lista-manual";

export type BrokerOperationSettings = {
  /** Prazo de prioridade do captador antes da reoferta (minutos). */
  captadorPriorityMinutes: number;
  /** Janela de atendimento em que ofertas correm prazo ("08:00"–"20:00"). */
  atendimentoWindowStart: string;
  atendimentoWindowEnd: string;
  /** Prazo de aceite em lançamentos (minutos). */
  launchAcceptMinutes: number;
  /** O que a YZI faz quando o corretor não responde no prazo. */
  fallbackMode: FallbackMode;
  /** Quem recebe o disparo de lançamento. */
  launchEligibility: LaunchEligibility;
  /** Feedback pós-visita obrigatório. */
  feedbackObrigatorio: boolean;
  /** Horas até o feedback virar pendência. */
  feedbackDeadlineHours: number;
  /** Bloqueio leve: pausar novas ofertas quando há pendências acumuladas. */
  softBlockOnPendency: boolean;
  /** Nº de pendências para pausar novas ofertas. */
  softBlockThreshold: number;
};

export const DEFAULT_BROKER_OPERATION_SETTINGS: BrokerOperationSettings = {
  captadorPriorityMinutes: 5,
  atendimentoWindowStart: "08:00",
  atendimentoWindowEnd: "20:00",
  launchAcceptMinutes: 3,
  fallbackMode: "proximo-elegivel",
  launchEligibility: "por-area",
  feedbackObrigatorio: true,
  feedbackDeadlineHours: 12,
  softBlockOnPendency: true,
  softBlockThreshold: 2,
};

export const FALLBACK_MODE_OPTIONS: { value: FallbackMode; label: string }[] = [
  { value: "proximo-elegivel", label: "Reencaminhar ao próximo corretor elegível" },
  { value: "fila-geral", label: "Devolver o lead à fila geral da YZI" },
];

export const LAUNCH_ELIGIBILITY_OPTIONS: { value: LaunchEligibility; label: string }[] = [
  { value: "todos-ativos", label: "Todos os corretores ativos" },
  { value: "por-area", label: "Corretores com área de atuação compatível" },
  { value: "lista-manual", label: "Lista definida pela imobiliária (em preparação)" },
];

/**
 * Eco em linguagem de operação: descreve o comportamento que as regras
 * produziriam na fila de Corretores. É assim que a configuração "aparece"
 * antes de existir persistência real.
 */
export function describeBrokerOperation(s: BrokerOperationSettings): string[] {
  const fallback =
    s.fallbackMode === "proximo-elegivel"
      ? "a YZI reencaminha ao próximo corretor elegível"
      : "a YZI devolve o lead à fila geral";
  const eligibility =
    s.launchEligibility === "todos-ativos"
      ? "todos os corretores ativos"
      : s.launchEligibility === "por-area"
        ? "os corretores com área de atuação compatível"
        : "a lista definida pela imobiliária";

  return [
    `O captador tem ${s.captadorPriorityMinutes} min de prioridade antes de a YZI reencaminhar o lead.`,
    `Prazos de aceite correm das ${s.atendimentoWindowStart} às ${s.atendimentoWindowEnd}; fora da janela, a oferta espera.`,
    `Em lançamentos, ${eligibility} recebem o disparo e têm ${s.launchAcceptMinutes} min — o primeiro que aceitar assume.`,
    `Se o corretor não responder no prazo, ${fallback}.`,
    s.feedbackObrigatorio
      ? `Feedback pós-visita é obrigatório: sem retorno em ${s.feedbackDeadlineHours}h, vira pendência na fila.`
      : "Feedback pós-visita é opcional — a YZI pede, mas não gera pendência.",
    s.softBlockOnPendency
      ? `Com ${s.softBlockThreshold} pendência(s) acumulada(s), a YZI pausa novas ofertas para o corretor — nada é punitivo, só espera o retorno.`
      : "Pendências não pausam novas ofertas para o corretor.",
  ];
}
