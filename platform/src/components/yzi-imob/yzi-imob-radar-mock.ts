// Mock do Radar (YZI IMOB). Demonstração honesta: nenhum sinal é real,
// nenhuma fonte está conectada, nada dispara ação. Os movimentos abaixo
// ilustram a leitura que o Radar dará quando houver dado real — inteligência
// acionável (o que mudou → por que → o que fazer), nunca relatório passivo.

export type MovementKind =
  | "crescimento"
  | "queda"
  | "aquecimento"
  | "saturacao"
  | "lancamento"
  | "oportunidade";

export type MovementRole =
  | "primary"
  | "wine"
  | "amber"
  | "graphite"
  | "cyan"
  | "coldGreen";

// Ícones profissionais (yzi-imob-icons-v2) mapeados na tela — nunca emoji.
export const MOVEMENT_META: Record<
  MovementKind,
  { label: string; role: MovementRole }
> = {
  crescimento: { label: "Crescimento", role: "coldGreen" },
  queda: { label: "Queda", role: "wine" },
  aquecimento: { label: "Aquecimento", role: "amber" },
  saturacao: { label: "Saturação", role: "graphite" },
  lancamento: { label: "Novo lançamento", role: "cyan" },
  oportunidade: { label: "Oportunidade", role: "primary" },
};

export type MovementPriority = "alta" | "media" | "observar";

export const PRIORITY_META: Record<
  MovementPriority,
  { label: string; role: MovementRole }
> = {
  alta: { label: "Prioridade alta", role: "amber" },
  media: { label: "Prioridade média", role: "cyan" },
  observar: { label: "Observar", role: "graphite" },
};

export type DemoMovement = {
  id: string;
  kind: MovementKind;
  priority: MovementPriority;
  areaLabel: string;
  whatLabel: string;
  whyLabel: string;
  actionLabel: string;
};

export const DEMO_MOVEMENTS: DemoMovement[] = [
  {
    id: "mv-barra-sul",
    priority: "alta",
    kind: "crescimento",
    areaLabel: "Barra Sul",
    whatLabel: "Procura por apartamentos na Barra Sul cresceu na última semana.",
    whyLabel: "Mais leads chegaram pelo site pedindo apartamentos de 2 e 3 quartos na região.",
    actionLabel: "Priorizar a publicação de imóveis disponíveis na Barra Sul esta semana.",
  },
  {
    id: "mv-recanto-verde",
    priority: "media",
    kind: "queda",
    areaLabel: "Recanto Verde",
    whatLabel: "Interesse em terrenos no Recanto Verde caiu.",
    whyLabel: "Menos leads pedindo terreno na região nas últimas duas semanas.",
    actionLabel: "Revisar o preço ou o destaque dos terrenos publicados ali.",
  },
  {
    id: "mv-praia-brava",
    priority: "alta",
    kind: "aquecimento",
    areaLabel: "Praia Brava",
    whatLabel: "Buscas por imóveis na Praia Brava aqueceram nos últimos dias.",
    whyLabel: "Aumento de visitas ao site vindas de anúncios e indicações na região.",
    actionLabel: "Aproveitar o momento para reforçar criativos apontando para a Praia Brava.",
  },
  {
    id: "mv-centro",
    priority: "observar",
    kind: "saturacao",
    areaLabel: "Centro",
    whatLabel: "Muitos imóveis parecidos publicados no Centro ao mesmo tempo.",
    whyLabel: "Vários corretores publicaram apartamentos semelhantes na mesma faixa de preço.",
    actionLabel: "Diferenciar a apresentação dos imóveis do Centro para não competir entre si.",
  },
  {
    id: "mv-pioneiros",
    priority: "media",
    kind: "lancamento",
    areaLabel: "Pioneiros",
    whatLabel: "Novo lançamento entrou no radar em Pioneiros.",
    whyLabel: "Construtora anunciou lançamento na região — ainda sem corretor vinculado.",
    actionLabel: "Definir quais corretores são elegíveis para receber leads deste lançamento.",
  },
  {
    id: "mv-cliente-sem-imovel",
    priority: "alta",
    kind: "oportunidade",
    areaLabel: "Carteira de clientes",
    whatLabel: "Cliente qualificado sem imóvel compatível no catálogo ainda.",
    whyLabel: "Renata Souza busca cobertura vista mar acima de R$ 1,5M — nada novo publicado no perfil.",
    actionLabel: "Avisar corretores da área para captar imóveis compatíveis com esse perfil.",
  },
];
