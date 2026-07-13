// Mock de Contas & Consumo (APIs & Créditos). Demonstração honesta: nenhuma
// conta é conectada de verdade, nenhum token é emitido, nenhum consumo é
// medido. Titularidade é sempre da imobiliária (cartão e conta do cliente) —
// a infraestrutura por trás nunca aparece aqui: sem Metricool, Redis,
// workers, filas, cache, MCP ou qualquer termo de infraestrutura YZIHUB.

export type ConnectionCapability =
  | "inteligencia"
  | "marketing"
  | "whatsapp"
  | "site"
  | "seo"
  | "criacao";

export type ConnectionStatus = "conectado" | "nao-conectado";

export type DemoConnection = {
  id: ConnectionCapability;
  label: string;
  description: string;
  status: ConnectionStatus;
  accountLabel: string | null;
  lastSyncLabel: string | null;
  usageLabel: string | null;
  renewalLabel: string | null;
};

// Capacidades da operação — nunca ferramentas. O cliente conecta a conta
// dele; a YZI opera por cima. Valores ilustrativos, estado honesto.
export const DEMO_CONNECTIONS: DemoConnection[] = [
  {
    id: "inteligencia",
    label: "Inteligência",
    description: "A YZI lendo, respondendo e organizando a sua operação.",
    status: "conectado",
    accountLabel: "Plano da imobiliária",
    lastSyncLabel: "Agora — demonstração",
    usageLabel: "Sem consumo real",
    renewalLabel: "Renova todo dia 1º",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Número usado pela YZI para atender e encaminhar leads.",
    status: "conectado",
    accountLabel: "+55 47 9****-0341",
    lastSyncLabel: "Há poucos minutos — demonstração",
    usageLabel: "Sem consumo real",
    renewalLabel: "Sem cobrança pela YZI",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Conta de anúncios usada para publicar campanhas de imóveis.",
    status: "nao-conectado",
    accountLabel: null,
    lastSyncLabel: null,
    usageLabel: null,
    renewalLabel: null,
  },
  {
    id: "site",
    label: "Site",
    description: "Domínio e hospedagem da vitrine pública de imóveis.",
    status: "nao-conectado",
    accountLabel: null,
    lastSyncLabel: null,
    usageLabel: null,
    renewalLabel: null,
  },
  {
    id: "seo",
    label: "SEO",
    description: "Conta usada para aparecer bem nos resultados de busca.",
    status: "nao-conectado",
    accountLabel: null,
    lastSyncLabel: null,
    usageLabel: null,
    renewalLabel: null,
  },
  {
    id: "criacao",
    label: "Criação",
    description: "Geração de criativos e materiais em nome da sua marca.",
    status: "nao-conectado",
    accountLabel: null,
    lastSyncLabel: null,
    usageLabel: null,
    renewalLabel: null,
  },
];

// Primeira dobra — confiança, controle e simplicidade. Três pilares fixos.
export const TRUST_PILLARS: Array<{
  title: string;
  description: string;
}> = [
  {
    title: "Suas contas",
    description:
      "Cada capacidade usa uma conta da própria imobiliária — nada roda em nome de terceiros.",
  },
  {
    title: "Seu cartão",
    description:
      "O cartão fica na plataforma oficial de cada conta. A YZI nunca vê nem guarda o cartão — só recebe a autorização.",
  },
  {
    title: "Seu controle",
    description:
      "Você pode desconectar qualquer conta quando quiser. Nenhuma cobrança é feita pela YZI em seu nome.",
  },
];
