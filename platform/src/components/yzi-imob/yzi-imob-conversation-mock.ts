import type { YziInspection } from "@/components/yzi-imob/yzi-imob-workspace-context";
import type { CounterItem } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { YZI_IMOB_ROLE_COLOR } from "@/components/yzi-imob/yzi-imob-status-colors";

// Mock do Conversation Workspace (Atendimento). Demonstração honesta: nenhum
// lead, mensagem ou envio real. Os registros representam o futuro schema do
// banco (lead subordinado a tenant_id; property_id/broker_id quando houver
// vínculo). Deriva do mesmo vocabulário do Property/Broker/Client Workspace.

export type LeadStage =
  | "novo"
  | "qualificando"
  | "interessado"
  | "visita"
  | "proposta"
  | "reserva"
  | "perdido";

export const LEAD_STAGE_LABEL: Record<LeadStage, string> = {
  novo: "Novo lead",
  qualificando: "Qualificando",
  interessado: "Interessado",
  visita: "Visita marcada",
  proposta: "Proposta",
  reserva: "Reserva",
  perdido: "Perdido",
};

export const LEAD_STAGE_ORDER: LeadStage[] = [
  "novo",
  "qualificando",
  "interessado",
  "visita",
  "proposta",
  "reserva",
  "perdido",
];

// Identidade sutil por etapa: RGB triples desaturados, dentro da paleta fria
// do Material System (sem verde saturado). Usado só como dot/hairline/badge —
// nunca como preenchimento sólido de card. Mapeamento por função:
// novo=azul gelo, qualificando=cyan frio, interessado=lilás suave,
// visita=azul petróleo, proposta=âmbar discreto, reserva=violeta/indigo,
// perdido=vermelho frio.
export const LEAD_STAGE_ACCENT: Record<LeadStage, string> = {
  novo: "158, 196, 232",
  qualificando: YZI_IMOB_ROLE_COLOR.cyan,
  interessado: YZI_IMOB_ROLE_COLOR.lilac,
  visita: YZI_IMOB_ROLE_COLOR.petrol,
  proposta: YZI_IMOB_ROLE_COLOR.amber,
  reserva: "136, 128, 198",
  perdido: YZI_IMOB_ROLE_COLOR.coldRed,
};

// Cores funcionais (Material System v1) para o Conversation Workspace: cada
// papel comunica um significado fixo, não decorativo. Deriva do módulo
// central `yzi-imob-status-colors.ts` (fonte única dos RGB triples de papel)
// para não duplicar cor solta em cada tela — os valores e o resultado visual
// do Atendimento já aprovado permanecem idênticos.
export const LEAD_ROLE_COLOR = {
  primary: YZI_IMOB_ROLE_COLOR.primary, // ações principais / estado ativo
  cyan: YZI_IMOB_ROLE_COLOR.cyan, // WhatsApp / YZI / qualificação
  lilac: YZI_IMOB_ROLE_COLOR.lilac, // autorização / preview
  amber: YZI_IMOB_ROLE_COLOR.amber, // pendência / atenção
  coldRed: YZI_IMOB_ROLE_COLOR.coldRed, // perdido / bloqueado
} as const;

export type LeadTemperature = "frio" | "morno" | "quente";

export const LEAD_TEMPERATURE_LABEL: Record<LeadTemperature, string> = {
  frio: "Frio",
  morno: "Morno",
  quente: "Quente",
};

export type ConversationMessage = {
  id: string;
  from: "lead" | "yzi";
  text: string;
  time: string;
};

export type ConversationTimelineEntry = {
  label: string;
  time: string;
};

export type DemoLead = {
  id: string;
  leadId: string;
  nome: string;
  telefone: string;
  email: string;
  origem: string;
  temperatura: LeadTemperature;
  estagio: LeadStage;
  score: number;
  intencao: string;
  tipoImovel: string;
  bairroDesejado: string;
  faixaValor: string;
  timelineDecisao: string;
  observacoes: string;
  imovelRelacionado: string | null;
  corretorVinculado: string | null;
  ultimaMensagem: string;
  proximaAcao: string;
  yziPausada: boolean;
  agendaJanela: string;
  agendaObservacao: string;
  mensagens: ConversationMessage[];
  timeline: ConversationTimelineEntry[];
};

export const DEMO_LEADS: DemoLead[] = [
  {
    id: "patricia-nunes",
    leadId: "lead-882",
    nome: "Patrícia Nunes",
    telefone: "(47) 99654-1122",
    email: "patricia.nunes@exemplo.com",
    origem: "WhatsApp — anúncio Instagram",
    temperatura: "quente",
    estagio: "visita",
    score: 78,
    intencao: "Comprar para morar",
    tipoImovel: "Apartamento",
    bairroDesejado: "Barra Sul",
    faixaValor: "R$ 800.000 – R$ 1.100.000",
    timelineDecisao: "Próximos 60 dias",
    observacoes: "Prefere prédios com poucas unidades. Já mora no bairro, quer trocar de imóvel.",
    imovelRelacionado: "Cobertura Vista Mar — Barra Sul",
    corretorVinculado: "Marina Alves",
    ultimaMensagem: "Consigo visitar sábado de manhã?",
    proximaAcao: "Confirmar horário da visita de sábado.",
    yziPausada: false,
    agendaJanela: "Sábado de manhã",
    agendaObservacao: "Cliente já confirmou preferência por sábado. Falta a Marina confirmar o horário.",
    mensagens: [
      { id: "m1", from: "lead", text: "Vi o anúncio da cobertura vista mar, ainda está disponível?", time: "seg · 09:12" },
      { id: "m2", from: "yzi", text: "Sim, está disponível! Posso te contar mais sobre ela ou já agendar uma visita?", time: "seg · 09:14" },
      { id: "m3", from: "lead", text: "Quero visitar. Tem disponibilidade no fim de semana?", time: "seg · 09:20" },
      { id: "m4", from: "yzi", text: "Tenho horário sábado às 10h ou 15h. Qual prefere?", time: "seg · 09:21" },
      { id: "m5", from: "lead", text: "Consigo visitar sábado de manhã?", time: "seg · 09:25" },
    ],
    timeline: [
      { label: "Lead criado a partir do anúncio", time: "seg · 09:12" },
      { label: "Conversa iniciada pela YZI", time: "seg · 09:14" },
      { label: "Interesse em visita identificado", time: "seg · 09:20" },
      { label: "Visita sugerida para sábado", time: "seg · 09:21" },
    ],
  },
  {
    id: "andre-lima",
    leadId: "lead-861",
    nome: "André Lima",
    telefone: "(11) 98455-3300",
    email: "",
    origem: "Site — formulário de contato",
    temperatura: "morno",
    estagio: "qualificando",
    score: 42,
    intencao: "Investir",
    tipoImovel: "Apartamento",
    bairroDesejado: "Jardim Europa",
    faixaValor: "Ainda não informado",
    timelineDecisao: "Não informado",
    observacoes: "",
    imovelRelacionado: null,
    corretorVinculado: null,
    ultimaMensagem: "Quero entender melhor o retorno de investimento na região.",
    proximaAcao: "Confirmar faixa de valor e prazo de decisão.",
    yziPausada: false,
    agendaJanela: "Ainda não sugerida",
    agendaObservacao: "A YZI só agenda após corretor e horário confirmados. Sem corretor vinculado ainda.",
    mensagens: [
      { id: "m1", from: "lead", text: "Vi um imóvel no site, quero saber mais sobre a região para investir.", time: "ter · 14:02" },
      { id: "m2", from: "yzi", text: "Legal! Você busca para alugar ou revender depois?", time: "ter · 14:05" },
      { id: "m3", from: "lead", text: "Quero entender melhor o retorno de investimento na região.", time: "ter · 14:10" },
    ],
    timeline: [
      { label: "Lead criado via formulário do site", time: "ter · 14:02" },
      { label: "Conversa iniciada pela YZI", time: "ter · 14:05" },
    ],
  },
  {
    id: "camila-torres",
    leadId: "lead-905",
    nome: "Camila Torres",
    telefone: "(48) 99887-0011",
    email: "camila.torres@exemplo.com",
    origem: "Indicação",
    temperatura: "quente",
    estagio: "proposta",
    score: 88,
    intencao: "Comprar para morar",
    tipoImovel: "Terreno",
    bairroDesejado: "Recanto Verde",
    faixaValor: "R$ 350.000 – R$ 420.000",
    timelineDecisao: "Imediato",
    observacoes: "Já visitou duas vezes. Aguardando análise da proposta pelo proprietário.",
    imovelRelacionado: "Terreno Recanto Verde, lote 14",
    corretorVinculado: "Bruna Kohl",
    ultimaMensagem: "Alguma notícia sobre a proposta?",
    proximaAcao: "Retornar sobre status da proposta com o corretor.",
    yziPausada: true,
    agendaJanela: "Não aplicável",
    agendaObservacao: "Visita já concluída (2x). Fase atual é análise da proposta, não agendamento.",
    mensagens: [
      { id: "m1", from: "lead", text: "Já enviei a proposta pelo corretor, alguma notícia?", time: "qua · 11:40" },
      { id: "m2", from: "yzi", text: "Vou confirmar com a Bruna e já te retorno.", time: "qua · 11:42" },
      { id: "m3", from: "lead", text: "Alguma notícia sobre a proposta?", time: "hoje · 08:15" },
    ],
    timeline: [
      { label: "Lead criado por indicação", time: "sem passada" },
      { label: "Visita realizada (2x)", time: "sem passada" },
      { label: "Proposta enviada ao proprietário", time: "qua · 11:40" },
      { label: "YZI pausada — aguardando corretor", time: "qua · 11:42" },
    ],
  },
  {
    id: "roberto-dias",
    leadId: "lead-799",
    nome: "Roberto Dias",
    telefone: "(47) 99120-4477",
    email: "",
    origem: "WhatsApp — indicação",
    temperatura: "frio",
    estagio: "novo",
    score: 12,
    intencao: "Não informado",
    tipoImovel: "Não informado",
    bairroDesejado: "Não informado",
    faixaValor: "Não informado",
    timelineDecisao: "Não informado",
    observacoes: "",
    imovelRelacionado: null,
    corretorVinculado: null,
    ultimaMensagem: "Oi, vi o número de vocês com um amigo.",
    proximaAcao: "Iniciar qualificação inicial.",
    yziPausada: false,
    agendaJanela: "Ainda não sugerida",
    agendaObservacao: "Qualificação inicial não concluída. Cedo demais para sugerir visita.",
    mensagens: [
      { id: "m1", from: "lead", text: "Oi, vi o número de vocês com um amigo.", time: "hoje · 07:50" },
    ],
    timeline: [{ label: "Lead criado via WhatsApp", time: "hoje · 07:50" }],
  },
  {
    id: "fernanda-brito",
    leadId: "lead-733",
    nome: "Fernanda Brito",
    telefone: "(11) 99011-2244",
    email: "fernanda.brito@exemplo.com",
    origem: "Instagram",
    temperatura: "morno",
    estagio: "interessado",
    score: 61,
    intencao: "Comprar para morar",
    tipoImovel: "Casa",
    bairroDesejado: "Jardim Europa",
    faixaValor: "R$ 1.200.000 – R$ 1.800.000",
    timelineDecisao: "Próximos 90 dias",
    observacoes: "Família com dois filhos, priorizando escola próxima.",
    imovelRelacionado: null,
    corretorVinculado: "Diego Ferraz",
    ultimaMensagem: "Vou conversar com meu marido e te aviso.",
    proximaAcao: "Fazer follow-up em 3 dias.",
    yziPausada: false,
    agendaJanela: "Segunda ou terça à tarde",
    agendaObservacao: "Cliente prefere segunda ou terça à tarde. Sem corretor vinculado ainda.",
    mensagens: [
      { id: "m1", from: "lead", text: "Gostei muito das fotos da casa no Jardim Europa.", time: "seg · 16:00" },
      { id: "m2", from: "yzi", text: "Que bom! Posso te passar mais detalhes ou já agendar uma visita.", time: "seg · 16:03" },
      { id: "m3", from: "lead", text: "Vou conversar com meu marido e te aviso.", time: "seg · 16:10" },
    ],
    timeline: [
      { label: "Lead criado via Instagram", time: "seg · 16:00" },
      { label: "Interesse confirmado em imóvel específico", time: "seg · 16:03" },
    ],
  },
  {
    id: "gustavo-melo",
    leadId: "lead-640",
    nome: "Gustavo Melo",
    telefone: "(48) 99344-5566",
    email: "",
    origem: "Site — formulário de contato",
    temperatura: "frio",
    estagio: "perdido",
    score: 8,
    intencao: "Alugar",
    tipoImovel: "Apartamento",
    bairroDesejado: "Centro",
    faixaValor: "R$ 2.500/mês",
    timelineDecisao: "Não informado",
    observacoes: "Parou de responder após 3 tentativas de contato.",
    imovelRelacionado: null,
    corretorVinculado: null,
    ultimaMensagem: "Sem resposta há 2 semanas.",
    proximaAcao: "Nenhuma — lead marcado como perdido.",
    yziPausada: true,
    agendaJanela: "Não aplicável",
    agendaObservacao: "Lead perdido. A YZI não sugere agenda para conversas encerradas.",
    mensagens: [
      { id: "m1", from: "lead", text: "Quero saber mais sobre apartamentos para alugar no centro.", time: "há 2 semanas" },
      { id: "m2", from: "yzi", text: "Claro! Pode me contar sua faixa de valor e quando pretende se mudar?", time: "há 2 semanas" },
    ],
    timeline: [
      { label: "Lead criado via site", time: "há 2 semanas" },
      { label: "Sem resposta após 3 tentativas", time: "há 3 dias" },
      { label: "Marcado como perdido", time: "há 3 dias" },
    ],
  },
];

export function leadCounters(lead: DemoLead): CounterItem[] {
  return [
    {
      label: "Score",
      value: String(lead.score),
      detail: LEAD_TEMPERATURE_LABEL[lead.temperatura],
      accent: lead.temperatura === "quente",
    },
    {
      label: "Estágio",
      value: LEAD_STAGE_LABEL[lead.estagio],
      detail: "Definido pela qualificação",
    },
    {
      label: "Corretor vinculado",
      value: lead.corretorVinculado ?? "—",
      detail: lead.corretorVinculado ? "Encaminhado" : "Ainda sem corretor",
    },
    {
      label: "YZI",
      value: lead.yziPausada ? "Pausada" : "Ativa",
      detail: lead.yziPausada ? "Aguardando retomada humana" : "Conduzindo a conversa",
      accent: lead.yziPausada,
    },
  ];
}

export function toLeadInspection(lead: DemoLead): YziInspection {
  const hasBroker = Boolean(lead.corretorVinculado);
  const hasImovel = Boolean(lead.imovelRelacionado);
  const checklist = [
    { label: "Lead criado", done: true },
    { label: "Qualificação iniciada", done: lead.estagio !== "novo" },
    { label: "Imóvel de interesse identificado", done: hasImovel },
    { label: "Corretor vinculado", done: hasBroker },
    { label: "Visita ou proposta em andamento", done: ["visita", "proposta", "reserva"].includes(lead.estagio) },
  ];
  const doneCount = checklist.filter((item) => item.done).length;

  return {
    name: lead.nome,
    subtitle: `${lead.origem} · ${LEAD_STAGE_LABEL[lead.estagio]}`,
    statusLabel: LEAD_TEMPERATURE_LABEL[lead.temperatura],
    situation:
      lead.estagio === "perdido"
        ? "Lead sem resposta. Marcado como perdido, sem ação pendente."
        : lead.yziPausada
          ? "Estou pausada neste atendimento aguardando retomada humana."
          : "Estou conduzindo esta conversa e acompanhando a qualificação.",
    pendencies: hasBroker
      ? ["Nenhuma pendência registrada."]
      : ["Vincular um corretor quando o interesse for confirmado."],
    checklist,
    score: Math.round((doneCount / checklist.length) * 100),
    scoreLabel: "Lead Readiness",
    nextAction: lead.proximaAcao,
    suggestions: hasImovel
      ? [`Interesse em: ${lead.imovelRelacionado}.`]
      : ["Ainda sem imóvel específico identificado."],
    history: lead.timeline.map((entry) => `${entry.label} — ${entry.time}`),
  };
}
