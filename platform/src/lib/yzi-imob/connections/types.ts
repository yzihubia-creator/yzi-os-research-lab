// YZI IMOB — Conexões: tipos do catálogo. Nenhum tipo aqui representa dado
// real de tenant — hoje não existe tabela de conexão/autorização por
// imobiliária nesta base. O catálogo é estático (Connection Catalog): o que
// o produto pode vir a suportar, não o que uma imobiliária específica tem
// conectado (Tenant Connection — ainda sem contrato, ver docs/yzi-imob).

export type ConnectionGroupId =
  | "meta"
  | "presenca-digital"
  | "anuncios"
  | "producao-criativa";

// Vocabulário canônico de estado — nunca termos técnicos (oauth, webhook,
// token) na interface. Quatro estados operacionais honestos + "em-breve"
// para capacidades futuras que ainda não podem ser configuradas.
// Ver docs/yzi-imob/yzi-imob-conexoes-backend-contract-v1.md.
export type ConnectionState =
  | "conectado"
  | "aguardando-autorizacao"
  | "nao-configurado"
  | "requer-atencao"
  | "em-breve";

export type ConnectionCapabilityId =
  | "receber-contatos"
  | "responder-mensagens"
  | "publicar-conteudo"
  | "programar-publicacao"
  | "criar-anuncios"
  | "acompanhar-campanhas"
  | "ler-metricas"
  | "sincronizar-imoveis"
  | "atualizar-informacoes"
  | "produzir-criativos"
  | "gerar-narracao";

// Prioridade operacional — mesma linguagem do Inventário de Setups v0.1
// (docs/yzi-imob/yzi-imob-api-setup-inventory-v0.1.md), usada para derivar
// contadores honestos (nunca um número inventado).
export type ConnectionPriority = "essencial" | "importante" | "futuro";

// De onde vem a evidência de que esta linha do catálogo é real — nunca
// listar algo só porque o nome aparece em algum lugar da documentação.
export type ConnectionEvidence =
  | "produto" // já referenciado em componente/mock de produto existente
  | "documentado" // só existe em doc de planejamento/arquitetura
  | "planejado"; // sem nenhuma referência hoje, capability futura declarada

export type ConnectionCapabilityLink = {
  id: ConnectionCapabilityId;
  // Hoje sempre false: capability do catálogo descreve o que o PRODUTO
  // suporta, nunca o que está liberado para o tenant. Sem registro
  // tenant-scoped de conexão + health check, nada é "liberado".
  unlocked: boolean;
};

// Canal/ativo dentro de uma conexão-ecossistema (hoje só a Meta): WhatsApp,
// Instagram, Página do Facebook e Conta de anúncios são capacidades da mesma
// conexão, não integrações independentes. Cada canal tem estado próprio.
export type ConnectionChannel = {
  id: string;
  label: string;
  summary: string;
  state: ConnectionState;
  lastCheckedAt?: string | null;
  nextAction?: string | null;
  displayName?: string | null;
  healthReason?: string | null;
  capabilities: ConnectionCapabilityLink[];
};

export type ConnectionEntry = {
  id: string;
  groupId: ConnectionGroupId;
  label: string;
  summary: string;
  state: ConnectionState;
  lastCheckedAt?: string | null;
  nextAction?: string | null;
  displayName?: string | null;
  healthReason?: string | null;
  priority: ConnectionPriority;
  capabilities: ConnectionCapabilityLink[];
  // Presente apenas em conexões-ecossistema (Meta): os canais internos.
  channels?: ConnectionChannel[];
  primaryPendency: string | null;
  impact: string[];
  evidence: ConnectionEvidence;
  evidenceNote: string;
};

export type ConnectionGroup = {
  id: ConnectionGroupId;
  label: string;
  description: string;
};

export type ConnectionCapabilityLabel = Record<ConnectionCapabilityId, string>;
