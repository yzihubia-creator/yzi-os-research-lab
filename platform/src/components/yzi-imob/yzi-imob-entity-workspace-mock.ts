import type { YziInspection } from "@/components/yzi-imob/yzi-imob-workspace-context";
import type { CounterItem } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import type {
  WorkspaceFile,
  WorkspaceUploadCategory,
} from "@/components/yzi-imob/yzi-imob-workspace-uploader";
import {
  DEMO_PROPERTIES,
  STATUS_META,
  type ActivationLevel,
  type DemoProperty,
} from "@/components/yzi-imob/yzi-imob-catalog-mock";

// Mock dos Entity Workspaces (Property + Broker). Demonstração honesta:
// nenhum imóvel, corretor ou arquivo real; os registros abaixo representam o
// futuro schema do banco (Fonte da Verdade: o imóvel nasce no YZI IMOB).
// Deriva do catálogo (`yzi-imob-catalog-mock.ts`) sem alterá-lo.

/* ------------------------------------------------------------------ */
/* Opções de schema                                                    */
/* ------------------------------------------------------------------ */

export const FINALIDADE_OPTIONS = [
  { value: "venda", label: "Venda" },
  { value: "aluguel", label: "Aluguel" },
  { value: "venda-aluguel", label: "Venda e aluguel" },
];

export const SOLAR_OPTIONS = [
  { value: "", label: "Não informada" },
  { value: "norte", label: "Norte" },
  { value: "sul", label: "Sul" },
  { value: "leste", label: "Leste (sol da manhã)" },
  { value: "oeste", label: "Oeste (sol da tarde)" },
];

export const LAZER_OPTIONS = [
  "Piscina",
  "Academia",
  "Churrasqueira",
  "Salão de festas",
  "Playground",
  "Quadra",
  "Sauna",
  "Espaço gourmet",
];

export const ATUACAO_BAIRROS = [
  "Barra Sul",
  "Centro",
  "Jardim Europa",
  "Recanto Verde",
  "Praia Brava",
  "Pioneiros",
];

export const ATUACAO_TIPOS = [
  "Apartamento",
  "Casa",
  "Terreno",
  "Comercial",
  "Lançamento",
];

export const ATUACAO_ESPECIALIDADES = [
  "Alto padrão",
  "Investidores",
  "Primeira compra",
  "Locação",
  "Litoral",
  "Rural",
];

/* ------------------------------------------------------------------ */
/* Property record — schema visual completo                            */
/* ------------------------------------------------------------------ */

export type PropertyRecord = {
  // Identidade
  finalidade: string;
  // Nível de Ativação — objetivo comercial definido no cadastro (L0–L4).
  nivelAtivacao: ActivationLevel;
  // Localização
  cidade: string;
  bairro: string;
  endereco: string;
  complemento: string;
  cep: string;
  referencia: string;
  // Características
  tipo: string;
  area: string;
  quartos: string;
  suites: string;
  banheiros: string;
  garagem: string;
  posicaoSolar: string;
  mobiliado: boolean;
  porteiraFechada: boolean;
  aceitaFinanciamento: boolean;
  aceitaPermuta: boolean;
  lazer: string[];
  diferenciais: string[];
  // Valores
  valorVenda: string;
  valorAluguel: string;
  condominio: string;
  iptu: string;
  taxas: string;
  // Base de Conhecimento da YZI
  conhecimento: string;
};

const PROPERTY_RECORD_OVERRIDES: Record<string, Partial<PropertyRecord>> = {
  "vista-mar": {
    finalidade: "venda",
    complemento: "Cobertura 01 · Torre única",
    cep: "88330-000",
    referencia: "Em frente ao trecho central da Av. Atlântica",
    suites: "3",
    garagem: "2",
    posicaoSolar: "leste",
    mobiliado: true,
    aceitaFinanciamento: true,
    lazer: ["Piscina", "Academia", "Espaço gourmet"],
    diferenciais: ["Vista mar frontal", "Piscina privativa", "2 vagas cobertas"],
    condominio: "R$ 2.900",
    iptu: "R$ 1.120/mês",
    conhecimento:
      "Cobertura duplex com vista frontal para o mar, acabamento alto padrão e piscina privativa. Perfil ideal: investidor ou família buscando segunda residência no litoral. Objeções comuns: valor do condomínio e vaga extra. O proprietário prefere visitas agendadas com 24h de antecedência. Pontos fortes: vista desimpedida, andar alto, prédio novo. Ponto de atenção: entrega da vaga extra depende de negociação.",
  },
};

export function toPropertyRecord(property: DemoProperty | null): PropertyRecord {
  const base: PropertyRecord = {
    finalidade: "venda",
    nivelAtivacao: property?.activation ?? "L0",
    cidade: property?.city ?? "",
    bairro: property?.neighborhood ?? "",
    endereco: property?.basics.endereco ?? "",
    complemento: "",
    cep: "",
    referencia: "",
    tipo: property?.basics.tipo ?? "apartamento",
    area: property?.basics.area ?? "",
    quartos: property?.basics.quartos ?? "",
    suites: "",
    banheiros: property?.basics.banheiros ?? "",
    garagem: "",
    posicaoSolar: "",
    mobiliado: false,
    porteiraFechada: false,
    aceitaFinanciamento: false,
    aceitaPermuta: false,
    lazer: [],
    diferenciais: [],
    valorVenda: property?.basics.valor ?? "",
    valorAluguel: "",
    condominio: "",
    iptu: "",
    taxas: "",
    conhecimento: property?.knowledge.descricaoComercial ?? "",
  };
  return { ...base, ...(property ? PROPERTY_RECORD_OVERRIDES[property.id] : undefined) };
}

export const PROPERTY_UPLOAD_CATEGORIES: WorkspaceUploadCategory[] = [
  { id: "fotos", label: "Fotos" },
  { id: "videos", label: "Vídeos" },
  { id: "documentos", label: "Documentos" },
  { id: "plantas", label: "Plantas" },
  { id: "drone", label: "Vídeos Drone" },
  { id: "extras", label: "Arquivos Extras" },
];

export function propertyFiles(property: DemoProperty | null): WorkspaceFile[] {
  if (!property || property.media !== "pronta") return [];
  return [
    {
      id: `${property.id}-foto-1`,
      category: "fotos",
      name: "fachada-principal",
      kind: "JPG",
      status: "aprovado",
      note: "Foto de capa aprovada para o site.",
    },
    {
      id: `${property.id}-foto-2`,
      category: "fotos",
      name: "living-vista-mar",
      kind: "JPG",
      status: "em revisão",
      note: "Aguardando revisão de enquadramento.",
    },
    {
      id: `${property.id}-video-1`,
      category: "videos",
      name: "tour-interno",
      kind: "MP4",
      status: "em revisão",
      note: "Cortar os 12s iniciais antes de aprovar.",
    },
    {
      id: `${property.id}-planta-1`,
      category: "plantas",
      name: "planta-duplex",
      kind: "PDF",
      status: "aprovado",
      note: "Planta oficial enviada pela construtora.",
    },
  ];
}

export function propertyCounters(property: DemoProperty | null): CounterItem[] {
  if (!property) {
    return [
      { label: "Completude", value: "0%", detail: "Cadastro ainda não começou" },
      { label: "Arquivos", value: "0", detail: "Nenhum material recebido" },
      { label: "Leads interessados", value: "—", detail: "Sem publicação ainda" },
      { label: "Publicação", value: "—", detail: "Aguardando cadastro" },
    ];
  }
  const files = propertyFiles(property).length;
  return [
    {
      label: "Completude",
      value: `${property.responsavel.vinculo === "vinculado" ? property.completeness : 0}%`,
      detail: "Calculada pela YZI",
    },
    {
      label: "Arquivos",
      value: String(files),
      detail: files ? "Organizados por categoria" : "Aguardando mídia",
    },
    {
      label: "Leads interessados",
      value: property.status === "publicado" ? "6" : "—",
      detail:
        property.status === "publicado"
          ? "Vindos do site (demonstração)"
          : "Sem publicação ainda",
    },
    {
      label: "Publicação",
      value: STATUS_META[property.status].label,
      detail: "Nada publica sem sua autorização",
      accent: property.status === "publicar" || property.status === "aguardando",
    },
  ];
}

export { DEMO_PROPERTIES };

/* ------------------------------------------------------------------ */
/* Broker — entidade completa (demonstração)                           */
/* ------------------------------------------------------------------ */

export type BrokerStatus = "ativo" | "em integração" | "inativo";

export type DemoBroker = {
  id: string;
  corretorId: string;
  nome: string;
  creci: string;
  status: BrokerStatus;
  /**
   * Disponibilidade operacional — decisão do corretor/imobiliária, nunca
   * performance. Indisponível = a YZI pula a oferta sem esperar prazo.
   */
  available: boolean;
  // Contato
  telefone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  // Endereço
  cidade: string;
  bairro: string;
  // Atuação
  bairrosAtuacao: string[];
  tiposImovel: string[];
  especialidades: string[];
  // Indicadores (ilustrativos)
  comissao: string;
  meta: string;
  vendasAno: number;
  locacoesAno: number;
  leadResponse: string;
  nps: string;
  // Conhecimento da YZI
  conhecimento: string;
  imoveisAtivos: number;
};

export const BROKER_STATUS_LABEL: Record<BrokerStatus, string> = {
  ativo: "Ativo",
  "em integração": "Em integração",
  inativo: "Inativo",
};

export const DEMO_BROKERS: DemoBroker[] = [
  {
    id: "marina-alves",
    corretorId: "cor-241",
    nome: "Marina Alves",
    creci: "CRECI/SC 24.118-F",
    status: "ativo",
    available: true,
    telefone: "(47) 99812-0341",
    whatsapp: "(47) 99812-0341",
    email: "marina.alves@yzi.demo",
    instagram: "@marina.imoveis",
    cidade: "Balneário Camboriú",
    bairro: "Pioneiros",
    bairrosAtuacao: ["Barra Sul", "Pioneiros", "Praia Brava"],
    tiposImovel: ["Apartamento", "Lançamento"],
    especialidades: ["Alto padrão", "Investidores", "Litoral"],
    comissao: "5%",
    meta: "R$ 12M/ano",
    vendasAno: 9,
    locacoesAno: 2,
    leadResponse: "18 min",
    nps: "92",
    conhecimento:
      "Perfil consultivo, forte em alto padrão no litoral. Especialista em atender investidores e segunda residência. Estilo de venda: apresenta o imóvel pelo estilo de vida, não pela planta. Ponto forte: relacionamento pós-venda. Observação: prefere receber leads qualificados com contexto do imóvel.",
    imoveisAtivos: 6,
  },
  {
    id: "diego-ferraz",
    corretorId: "cor-118",
    nome: "Diego Ferraz",
    creci: "CRECI/SP 118.502-F",
    status: "ativo",
    available: true,
    telefone: "(11) 98211-7788",
    whatsapp: "(11) 98211-7788",
    email: "diego.ferraz@yzi.demo",
    instagram: "@diegoferraz.sp",
    cidade: "São Paulo",
    bairro: "Jardim Europa",
    bairrosAtuacao: ["Jardim Europa", "Centro"],
    tiposImovel: ["Casa", "Apartamento"],
    especialidades: ["Primeira compra"],
    comissao: "6%",
    meta: "R$ 8M/ano",
    vendasAno: 5,
    locacoesAno: 7,
    leadResponse: "41 min",
    nps: "84",
    conhecimento: "",
    imoveisAtivos: 4,
  },
  {
    id: "bruna-kohl",
    corretorId: "cor-305",
    nome: "Bruna Kohl",
    creci: "CRECI/SC 30.577-F",
    status: "em integração",
    available: false,
    telefone: "(48) 99655-2210",
    whatsapp: "(48) 99655-2210",
    email: "bruna.kohl@yzi.demo",
    instagram: "@brunakohl.terrenos",
    cidade: "Florianópolis",
    bairro: "Recanto Verde",
    bairrosAtuacao: ["Recanto Verde"],
    tiposImovel: ["Terreno"],
    especialidades: ["Rural", "Investidores"],
    comissao: "5%",
    meta: "R$ 4M/ano",
    vendasAno: 1,
    locacoesAno: 0,
    leadResponse: "—",
    nps: "—",
    conhecimento: "",
    imoveisAtivos: 1,
  },
];

export const BROKER_UPLOAD_CATEGORIES: WorkspaceUploadCategory[] = [
  { id: "creci", label: "CRECI" },
  { id: "contrato", label: "Contrato" },
  { id: "foto", label: "Foto" },
  { id: "documentos", label: "Documentos" },
];

export function brokerFiles(broker: DemoBroker): WorkspaceFile[] {
  if (broker.status !== "ativo") return [];
  return [
    {
      id: `${broker.id}-creci`,
      category: "creci",
      name: "carteira-creci",
      kind: "PDF",
      status: "aprovado",
      note: "Registro validado na integração.",
    },
    {
      id: `${broker.id}-contrato`,
      category: "contrato",
      name: "contrato-parceria",
      kind: "PDF",
      status: "aprovado",
      note: "Assinado na entrada da equipe.",
    },
    {
      id: `${broker.id}-foto`,
      category: "foto",
      name: "foto-perfil",
      kind: "JPG",
      status: "em revisão",
      note: "Usar no site e nos criativos após aprovação.",
    },
  ];
}

export function brokerCounters(broker: DemoBroker): CounterItem[] {
  return [
    {
      label: "Imóveis ativos",
      value: String(broker.imoveisAtivos),
      detail: "Sob responsabilidade dele",
    },
    {
      label: "Vendas no ano",
      value: String(broker.vendasAno),
      detail: `Meta ${broker.meta}`,
    },
    {
      label: "Locações no ano",
      value: String(broker.locacoesAno),
      detail: "Contratos fechados",
    },
    {
      label: "Lead response",
      value: broker.leadResponse,
      detail:
        broker.leadResponse === "—"
          ? "Sem histórico ainda"
          : `Tempo médio · NPS ${broker.nps}`,
      accent: broker.leadResponse !== "—",
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Client — entidade completa (demonstração)                           */
/* ------------------------------------------------------------------ */

export type ClientStatus = "lead" | "qualificado" | "cliente" | "inativo";

export type DemoClient = {
  id: string;
  clienteId: string;
  nome: string;
  status: ClientStatus;
  origem: string;
  // Contato
  telefone: string;
  whatsapp: string;
  email: string;
  // Preferências de busca
  cidade: string;
  bairrosInteresse: string[];
  tiposImovel: string[];
  finalidade: string;
  valorMin: string;
  valorMax: string;
  // Conhecimento da YZI
  conhecimento: string;
  // Atividade (ilustrativa)
  corretorResponsavel: string;
  imoveisVisitados: number;
  propostasAtivas: number;
  ultimaInteracao: string;
};

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  lead: "Lead",
  qualificado: "Qualificado",
  cliente: "Cliente",
  inativo: "Inativo",
};

export const CLIENT_FINALIDADE_OPTIONS = [
  { value: "compra", label: "Compra" },
  { value: "aluguel", label: "Aluguel" },
];

export const DEMO_CLIENTS: DemoClient[] = [
  {
    id: "renata-souza",
    clienteId: "cli-512",
    nome: "Renata Souza",
    status: "qualificado",
    origem: "Site — formulário de contato",
    telefone: "(47) 99123-4455",
    whatsapp: "(47) 99123-4455",
    email: "renata.souza@exemplo.com",
    cidade: "Balneário Camboriú",
    bairrosInteresse: ["Barra Sul", "Praia Brava"],
    tiposImovel: ["Apartamento"],
    finalidade: "compra",
    valorMin: "R$ 900.000",
    valorMax: "R$ 1.600.000",
    conhecimento:
      "Busca cobertura ou apartamento alto padrão com vista mar para segunda residência. Prefere prédios novos com poucas unidades. Objeção comum: valor do condomínio. Já visitou 2 imóveis e pediu para ser avisada de novos lançamentos na Barra Sul.",
    corretorResponsavel: "Marina Alves",
    imoveisVisitados: 2,
    propostasAtivas: 0,
    ultimaInteracao: "há 3 dias",
  },
  {
    id: "carlos-eduardo",
    clienteId: "cli-478",
    nome: "Carlos Eduardo",
    status: "cliente",
    origem: "Indicação",
    telefone: "(11) 98877-2233",
    whatsapp: "(11) 98877-2233",
    email: "carlos.eduardo@exemplo.com",
    cidade: "São Paulo",
    bairrosInteresse: ["Jardim Europa"],
    tiposImovel: ["Casa"],
    finalidade: "compra",
    valorMin: "R$ 1.200.000",
    valorMax: "R$ 1.800.000",
    conhecimento:
      "Primeira compra, família com dois filhos. Prioriza escola próxima e quintal. Já fechou proposta e está em fase de contrato.",
    corretorResponsavel: "Diego Ferraz",
    imoveisVisitados: 5,
    propostasAtivas: 1,
    ultimaInteracao: "há 1 dia",
  },
  {
    id: "juliana-melo",
    clienteId: "cli-601",
    nome: "Juliana Melo",
    status: "lead",
    origem: "Instagram",
    telefone: "(48) 99001-2020",
    whatsapp: "",
    email: "",
    cidade: "Florianópolis",
    bairrosInteresse: [],
    tiposImovel: [],
    finalidade: "aluguel",
    valorMin: "",
    valorMax: "",
    conhecimento: "",
    corretorResponsavel: "",
    imoveisVisitados: 0,
    propostasAtivas: 0,
    ultimaInteracao: "há 2 semanas",
  },
];

export const CLIENT_UPLOAD_CATEGORIES: WorkspaceUploadCategory[] = [
  { id: "documentos", label: "Documentos" },
  { id: "contratos", label: "Contratos" },
  { id: "outros", label: "Outros" },
];

export function clientFiles(client: DemoClient): WorkspaceFile[] {
  if (client.status !== "cliente") return [];
  return [
    {
      id: `${client.id}-doc-1`,
      category: "documentos",
      name: "rg-cpf",
      kind: "PDF",
      status: "aprovado",
      note: "Documentos pessoais para a proposta.",
    },
    {
      id: `${client.id}-contrato-1`,
      category: "contratos",
      name: "proposta-compra",
      kind: "PDF",
      status: "em revisão",
      note: "Aguardando assinatura das partes.",
    },
  ];
}

export function clientCounters(client: DemoClient): CounterItem[] {
  return [
    {
      label: "Imóveis visitados",
      value: String(client.imoveisVisitados),
      detail: "Desde o primeiro contato",
    },
    {
      label: "Propostas ativas",
      value: String(client.propostasAtivas),
      detail: client.propostasAtivas ? "Em negociação" : "Nenhuma no momento",
      accent: client.propostasAtivas > 0,
    },
    {
      label: "Última interação",
      value: client.ultimaInteracao,
      detail: "Registrada pela equipe",
    },
    {
      label: "Corretor responsável",
      value: client.corretorResponsavel || "—",
      detail: client.corretorResponsavel ? "Acompanhando este cliente" : "Ainda sem vínculo",
    },
  ];
}

export function toClientInspection(client: DemoClient): YziInspection {
  const hasKnowledge = client.conhecimento.trim().length > 0;
  const hasBroker = client.corretorResponsavel.trim().length > 0;
  const checklist = [
    { label: "Cadastro do cliente", done: true },
    { label: "Contato validado", done: client.whatsapp.trim().length > 0 },
    { label: "Corretor responsável vinculado", done: hasBroker },
    { label: "Preferências de busca definidas", done: client.bairrosInteresse.length > 0 },
    { label: "Conhecimento da YZI preenchido", done: hasKnowledge },
  ];
  const doneCount = checklist.filter((item) => item.done).length;

  return {
    name: client.nome,
    subtitle: `${client.origem} · ${client.cidade}`,
    statusLabel: CLIENT_STATUS_LABEL[client.status],
    situation:
      client.status === "lead"
        ? "Ainda não qualificado. Preciso de mais contexto antes de sugerir imóveis compatíveis."
        : "Cliente ativo na operação. Acompanho preferências e novidades compatíveis.",
    pendencies: hasBroker
      ? hasKnowledge
        ? ["Nenhuma pendência registrada."]
        : ["Preencher o Conhecimento da YZI para melhorar as sugestões de imóveis."]
      : ["Vincular um corretor responsável para dar continuidade ao atendimento."],
    checklist,
    score: Math.round((doneCount / checklist.length) * 100),
    scoreLabel: "Client Readiness",
    nextAction: hasBroker
      ? hasKnowledge
        ? "Nada pendente — acompanhar novidades compatíveis."
        : "Preencher o Conhecimento da YZI."
      : "Vincular corretor responsável.",
    suggestions: client.bairrosInteresse.length
      ? [`Interesse em: ${client.bairrosInteresse.join(", ")}.`]
      : ["Ainda sem preferências de busca registradas."],
    history: [
      "Cadastro criado a partir do primeiro contato.",
      client.imoveisVisitados > 0
        ? `${client.imoveisVisitados} imóvel(is) visitado(s).`
        : "Nenhuma visita registrada ainda.",
    ],
  };
}

export function toBrokerInspection(broker: DemoBroker): YziInspection {
  const active = broker.status === "ativo";
  const hasKnowledge = broker.conhecimento.trim().length > 0;
  const checklist = [
    { label: "Cadastro do corretor", done: true },
    { label: "CRECI e contrato validados", done: active },
    { label: "Área de atuação definida", done: broker.bairrosAtuacao.length > 0 },
    { label: "Conhecimento da YZI preenchido", done: hasKnowledge },
    { label: "Recebendo leads", done: active },
  ];
  const doneCount = checklist.filter((item) => item.done).length;

  return {
    name: broker.nome,
    subtitle: `${broker.bairro} · ${broker.cidade}`,
    statusLabel: BROKER_STATUS_LABEL[broker.status],
    situation: active
      ? "Corretor operando. Eu encaminho leads compatíveis com a área de atuação dele."
      : "Integração em andamento. Ainda não encaminho leads para este corretor.",
    pendencies: active
      ? hasKnowledge
        ? ["Nenhuma pendência registrada."]
        : ["Preencher o Conhecimento da YZI para melhorar a triagem de leads."]
      : ["Validar CRECI e contrato antes de ativar o encaminhamento de leads."],
    checklist,
    score: Math.round((doneCount / checklist.length) * 100),
    scoreLabel: "Broker Readiness",
    nextAction: active
      ? hasKnowledge
        ? "Nada pendente — acompanhar os leads da semana."
        : "Preencher o Conhecimento da YZI."
      : "Concluir a validação de documentos.",
    suggestions: active
      ? [`Especialidades: ${broker.especialidades.join(", ")}.`]
      : ["Depois da ativação, defina a área de atuação para a triagem de leads."],
    history: [
      "Cadastro criado pela equipe.",
      active ? "Documentos validados." : "Documentos em validação.",
    ],
  };
}
