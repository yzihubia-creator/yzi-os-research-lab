import type { YziInspection } from "@/components/yzi-imob/yzi-imob-workspace-context";

// Catálogo de DEMONSTRAÇÃO. Nenhum imóvel real, nenhum cliente, nenhum upload,
// nenhuma publicação. Serve para desenhar os estados honestos do Workspace
// (Property Catalog Wireframe v1.1 + Property Workspace v1) sem backend, API
// ou banco. Todo texto da YZI segue a Content Language: decisão primeiro,
// frase curta, sem jargão técnico.

// Estados operacionais do imóvel derivados da jornada (Property Editor v1.2 +
// Workspace States da Visual Language v1).
export type PropertyStatus =
  | "rascunho"
  | "organizando"
  | "pendencias"
  | "aguardando"
  | "publicar"
  | "publicado";

export type ReadyState = "pronta" | "pendente";

// Nível de Ativação — decisão de objetivo do gestor no cadastro. Todo imóvel
// vira ativo; nem todo ativo vira campanha. O gestor não escolhe ferramenta:
// escolhe o objetivo e a YZI recomenda plano, peças, canais e próximos passos.
export type ActivationLevel = "L0" | "L1" | "L2" | "L3" | "L4";

export type ActivationMeta = {
  label: string;
  objetivo: string;
  // Consequência operacional — exibida junto ao seletor.
  consequencia: string;
  // Plano recomendado pela YZI (mock honesto: recomendação fixa, sem IA).
  plano: {
    pecas: string[];
    canais: string[];
    proximosPassos: string[];
  };
  accent: "neutral" | "petrol" | "cyan" | "primary" | "ice";
};

export const ACTIVATION_LEVELS: ActivationLevel[] = ["L0", "L1", "L2", "L3", "L4"];

export const ACTIVATION_META: Record<ActivationLevel, ActivationMeta> = {
  L0: {
    label: "L0 · Apenas banco de dados",
    objetivo: "Guardar o imóvel organizado, sem divulgação.",
    consequencia: "A YZI organiza o cadastro e não prepara nenhuma peça.",
    plano: {
      pecas: [],
      canais: [],
      proximosPassos: ["Manter o cadastro completo para ativar depois."],
    },
    accent: "neutral",
  },
  L1: {
    label: "L1 · Publicar no site",
    objetivo: "Colocar o imóvel no site da imobiliária.",
    consequencia: "A YZI prepara a página do imóvel e aguarda sua aprovação.",
    plano: {
      pecas: ["Página do imóvel", "Descrição comercial"],
      canais: ["Site da imobiliária"],
      proximosPassos: ["Completar mídia e aprovar a publicação no site."],
    },
    accent: "petrol",
  },
  L2: {
    label: "L2 · Site + redes",
    objetivo: "Divulgar no site e nas redes sociais.",
    consequencia: "A YZI prepara página e peças para redes; nada publica sem aprovação.",
    plano: {
      pecas: ["Página do imóvel", "Post de destaque", "Story", "Card WhatsApp"],
      canais: ["Site da imobiliária", "Instagram", "WhatsApp"],
      proximosPassos: [
        "Aprovar a publicação no site.",
        "Revisar as peças de redes na fila de aprovações.",
      ],
    },
    accent: "cyan",
  },
  L3: {
    label: "L3 · Campanha completa",
    objetivo: "Operar o imóvel com campanha estruturada.",
    consequencia: "A YZI monta o plano de campanha com peças derivadas para aprovação.",
    plano: {
      pecas: ["Página do imóvel", "Pacote de criativos", "Carrossel", "Vídeo curto"],
      canais: ["Site da imobiliária", "Instagram", "WhatsApp", "Portais"],
      proximosPassos: [
        "Aprovar o plano de campanha.",
        "Aprovar as peças antes de qualquer renderização cara.",
      ],
    },
    accent: "primary",
  },
  L4: {
    label: "L4 · Prioritário / Growth intensivo",
    objetivo: "Máxima prioridade comercial para este imóvel.",
    consequencia: "A YZI trata o imóvel como prioridade no plano editorial e nas campanhas.",
    plano: {
      pecas: [
        "Página do imóvel",
        "Pacote de criativos completo",
        "Vídeo do imóvel",
        "Conteúdo de autoridade vinculado",
      ],
      canais: ["Site da imobiliária", "Instagram", "WhatsApp", "Portais", "Newsletter"],
      proximosPassos: [
        "Aprovar o plano prioritário.",
        "Agendar captação de vídeo com o corretor responsável.",
      ],
    },
    accent: "ice",
  },
};

// Vínculo de responsável — obrigatório antes de publicação/visita/campanha/
// atendimento (regra "Fonte da Verdade" da spec). Entidade Corretor completa
// é unidade futura; aqui é só a referência mínima guardada no imóvel.
export type PropertyBroker = {
  corretorId: string | null;
  nome: string | null;
  vinculo: "vinculado" | "pendente";
  especialidade?: string;
  contato?: string;
};

// Base de Conhecimento do imóvel (Conhecimento da YZI): o que alimenta site,
// SEO, atendimento, criativos, campanhas, WhatsApp e landing pages depois.
export type PropertyKnowledge = {
  descricaoComercial: string;
  diferenciais: string;
  perfilComprador: string;
  objecoesComuns: string;
  observacoesInternas: string;
};

export type PropertyType = "apartamento" | "casa" | "terreno" | "comercial";

export const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "terreno", label: "Terreno" },
  { value: "comercial", label: "Comercial" },
];

// Dados básicos — única aba funcional nesta unidade (form, estado local, sem
// submit/persistência real).
export type PropertyBasics = {
  tipo: PropertyType;
  endereco: string;
  valor: string;
  area: string;
  quartos: string;
  banheiros: string;
  descricaoCurta: string;
};

export type DemoProperty = {
  id: string;
  idImovel: string;
  name: string;
  neighborhood: string;
  city: string;
  status: PropertyStatus;
  activation: ActivationLevel;
  completeness: number; // 0–100, completude calculada pela YZI
  media: ReadyState;
  publication: ReadyState;
  nextStep: string; // próxima ação, decisão primeiro
  responsavel: PropertyBroker;
  knowledge: PropertyKnowledge;
  basics: PropertyBasics;
};

export const STATUS_META: Record<
  PropertyStatus,
  { label: string; tone: "neutral" | "working" | "attention" | "ready" }
> = {
  rascunho: { label: "Rascunho", tone: "neutral" },
  organizando: { label: "YZI organizando", tone: "working" },
  pendencias: { label: "Com pendências", tone: "attention" },
  aguardando: { label: "Aguardando aprovação", tone: "ready" },
  publicar: { label: "Pronto para publicação", tone: "ready" },
  publicado: { label: "Publicado", tone: "neutral" },
};

// Estado oficial do Workspace (spec §Hero por estado). `missing-broker` tem
// prioridade sobre os demais — sem responsável, nada mais importa ainda.
export type WorkspaceState =
  | "novo"
  | "missing-broker"
  | "preparacao"
  | "pendencias"
  | "pronto";

export const WORKSPACE_HERO: Record<WorkspaceState, string> = {
  novo: "Vamos transformar este material em uma oferta pronta.",
  "missing-broker": "Este imóvel ainda precisa de um responsável.",
  preparacao: "Estou organizando este imóvel para publicação.",
  pendencias: "Existem bloqueios antes da publicação.",
  pronto: "Está pronto para publicar quando você decidir.",
};

const CHECKLIST_LABELS = [
  "Cadastro do imóvel",
  "Corretor responsável vinculado",
  "Mídia organizada",
  "SEO / Site",
  "Publicação",
] as const;

export const EMPTY_BASICS: PropertyBasics = {
  tipo: "apartamento",
  endereco: "",
  valor: "",
  area: "",
  quartos: "",
  banheiros: "",
  descricaoCurta: "",
};

export const EMPTY_KNOWLEDGE: PropertyKnowledge = {
  descricaoComercial: "",
  diferenciais: "",
  perfilComprador: "",
  objecoesComuns: "",
  observacoesInternas: "",
};

// Inspector para o Workspace de um imóvel ainda não criado (`id === "novo"`).
export function emptyInspection(): YziInspection {
  return {
    name: "Novo imóvel",
    subtitle: "Ainda sem endereço",
    statusLabel: "Novo",
    situation: WORKSPACE_HERO.novo,
    pendencies: ["O cadastro ainda não começou."],
    checklist: CHECKLIST_LABELS.map((label) => ({ label, done: false })),
    score: 0,
    scoreLabel: "Property Readiness",
    nextAction: "Preencher os dados básicos",
    suggestions: ["Quanto mais contexto você der, melhor a YZI prepara o resto."],
    history: ["Workspace criado."],
  };
}

export function resolveWorkspaceState(property: DemoProperty | null): WorkspaceState {
  if (!property) return "novo";
  if (property.responsavel.vinculo === "pendente") return "missing-broker";
  if (property.status === "pendencias") return "pendencias";
  if (property.status === "rascunho" || property.status === "organizando") {
    return "preparacao";
  }
  return "pronto";
}

export const DEMO_PROPERTIES: DemoProperty[] = [
  {
    id: "vista-mar",
    idImovel: "IMV-1042",
    name: "Cobertura Vista Mar",
    neighborhood: "Barra Sul",
    city: "Balneário Camboriú",
    status: "publicar",
    activation: "L3",
    completeness: 96,
    media: "pronta",
    publication: "pendente",
    nextStep: "Aprovar a publicação.",
    responsavel: {
      corretorId: "cor-241",
      nome: "Marina Alves",
      vinculo: "vinculado",
      especialidade: "Alto padrão · Litoral",
      contato: "marina.alves@yzi.demo",
    },
    knowledge: {
      descricaoComercial:
        "Cobertura duplex com vista frontal para o mar, acabamento alto padrão e piscina privativa.",
      diferenciais: "Vista mar frontal, piscina privativa, 2 vagas cobertas.",
      perfilComprador: "Investidor ou família buscando segunda residência.",
      objecoesComuns: "Valor do condomínio; disponibilidade de vaga extra.",
      observacoesInternas: "Proprietário prefere visitas agendadas com 24h de antecedência.",
    },
    basics: {
      tipo: "apartamento",
      endereco: "Av. Atlântica, 1420",
      valor: "R$ 3.850.000",
      area: "210",
      quartos: "4",
      banheiros: "5",
      descricaoCurta: "Cobertura duplex com vista mar frontal.",
    },
  },
  {
    id: "jardim-europa",
    idImovel: "IMV-1087",
    name: "Casa Jardim Europa",
    neighborhood: "Jardim Europa",
    city: "São Paulo",
    status: "pendencias",
    activation: "L2",
    completeness: 62,
    media: "pendente",
    publication: "pendente",
    nextStep: "Enviar a planta e a foto da fachada.",
    responsavel: {
      corretorId: "cor-118",
      nome: "Diego Ferraz",
      vinculo: "vinculado",
      especialidade: "Residencial · Zona Oeste",
      contato: "diego.ferraz@yzi.demo",
    },
    knowledge: {
      descricaoComercial: "",
      diferenciais: "",
      perfilComprador: "",
      objecoesComuns: "",
      observacoesInternas: "",
    },
    basics: {
      tipo: "casa",
      endereco: "Rua das Magnólias, 88",
      valor: "R$ 1.980.000",
      area: "340",
      quartos: "4",
      banheiros: "3",
      descricaoCurta: "Casa térrea em condomínio fechado.",
    },
  },
  {
    id: "edificio-aurora",
    idImovel: "IMV-1103",
    name: "Apartamento Edifício Aurora",
    neighborhood: "Centro",
    city: "Curitiba",
    status: "organizando",
    activation: "L1",
    completeness: 40,
    media: "pendente",
    publication: "pendente",
    nextStep: "Vincular corretor responsável.",
    responsavel: {
      corretorId: null,
      nome: null,
      vinculo: "pendente",
    },
    knowledge: {
      descricaoComercial: "",
      diferenciais: "",
      perfilComprador: "",
      objecoesComuns: "",
      observacoesInternas: "",
    },
    basics: {
      tipo: "apartamento",
      endereco: "Rua XV de Novembro, 512",
      valor: "R$ 620.000",
      area: "78",
      quartos: "2",
      banheiros: "2",
      descricaoCurta: "Apartamento no centro, próximo ao comércio.",
    },
  },
  {
    id: "recanto-verde",
    idImovel: "IMV-1131",
    name: "Terreno Recanto Verde",
    neighborhood: "Recanto Verde",
    city: "Florianópolis",
    status: "rascunho",
    activation: "L0",
    completeness: 12,
    media: "pendente",
    publication: "pendente",
    nextStep: "Continuar o cadastro e enviar as mídias.",
    responsavel: {
      corretorId: "cor-305",
      nome: "Bruna Kohl",
      vinculo: "vinculado",
      especialidade: "Terrenos · Grande Florianópolis",
      contato: "bruna.kohl@yzi.demo",
    },
    knowledge: {
      descricaoComercial: "",
      diferenciais: "",
      perfilComprador: "",
      objecoesComuns: "",
      observacoesInternas: "",
    },
    basics: {
      tipo: "terreno",
      endereco: "Estrada Geral do Recanto, km 4",
      valor: "R$ 340.000",
      area: "1200",
      quartos: "",
      banheiros: "",
      descricaoCurta: "Terreno plano, pronto para construir.",
    },
  },
];

function buildChecklist(property: DemoProperty): YziInspection["checklist"] {
  const brokerLinked = property.responsavel.vinculo === "vinculado";
  const done = [
    property.completeness > 0,
    brokerLinked,
    brokerLinked && property.media === "pronta",
    brokerLinked && property.status !== "rascunho" && property.status !== "organizando",
    brokerLinked && property.status === "publicado",
  ];
  return CHECKLIST_LABELS.map((label, index) => ({ label, done: done[index] }));
}

export function toInspection(property: DemoProperty): YziInspection {
  const brokerLinked = property.responsavel.vinculo === "vinculado";
  const pendencies = brokerLinked
    ? property.status === "pendencias"
      ? [
          "Falta a planta do imóvel.",
          "Falta a foto da fachada.",
          "Duas fotos estão com baixa resolução.",
        ]
      : ["Nenhuma pendência registrada."]
    : ["Vincular um corretor responsável antes de qualquer outro passo."];

  const nextAction = brokerLinked
    ? property.nextStep
    : "Vincular corretor responsável";

  const suggestions = brokerLinked
    ? [
        property.status === "publicar" || property.status === "aguardando"
          ? "Creative Brief pronto para o Creative Studio."
          : "Creative Brief depende das mídias e informações que faltam.",
      ]
    : [
        "A YZI não prepara visita, campanha ou atendimento sem responsável definido.",
      ];

  return {
    name: property.name,
    subtitle: `${property.neighborhood} · ${property.city}`,
    statusLabel: brokerLinked
      ? STATUS_META[property.status].label
      : "Sem responsável",
    situation: brokerLinked
      ? WORKSPACE_HERO[resolveWorkspaceState(property)]
      : WORKSPACE_HERO["missing-broker"],
    pendencies,
    checklist: buildChecklist(property),
    score: brokerLinked ? property.completeness : 0,
    scoreLabel: "Property Readiness",
    nextAction,
    suggestions,
    history: [
      "Você finalizou o cadastro.",
      brokerLinked
        ? `Corretor responsável: ${property.responsavel.nome}.`
        : "Ainda sem corretor responsável vinculado.",
    ],
  };
}
