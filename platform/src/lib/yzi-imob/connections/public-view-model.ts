export const CONNECTION_HUMAN_STATUS_VALUES = [
  "Não conectado",
  "Aguardando autorização",
  "Conectando",
  "Ativo",
  "Precisa de atenção",
  "Autorização expirada",
  "Indisponível",
] as const;

export type ConnectionHumanStatus =
  (typeof CONNECTION_HUMAN_STATUS_VALUES)[number];

export const CONNECTION_CATEGORY_VALUES = [
  "Atendimento",
  "Publicação social",
  "Site",
  "Dados e mensuração",
  "Produção criativa",
] as const;

export type ConnectionCategory =
  (typeof CONNECTION_CATEGORY_VALUES)[number];

export type ConnectionCapabilityTruth = {
  accountExists: boolean;
  credentialsConfigured: boolean;
  authorizationValid: boolean;
  authorizationExpired: boolean;
  connectionHealthy: boolean;
  readCapabilityReady: boolean;
  writeCapabilityReady: boolean;
  externallyBlocked: boolean;
};

export type ConnectionViewModelItem = {
  id: string;
  nome: string;
  categoria: ConnectionCategory;
  finalidade: string;
  status: ConnectionHumanStatus;
  resumo: string;
  capabilitiesDisponiveis: string[];
  ultimaVerificacao: string | null;
  proximaAcao: string | null;
  incidentesHumanos: string[];
  /**
   * A ativacao depende de verificacao empresarial externa e ainda nao foi
   * concluida. O status humano continua "Precisa de atencao" (o contrato de
   * estados nao muda), mas a interface precisa separar os dois casos: dizer
   * "parou de funcionar" sobre algo que nunca chegou a funcionar e falso.
   */
  aguardandoVerificacaoExterna: boolean;
  podeConfigurar: boolean;
  podeTestar: boolean;
  podeDesconectar: boolean;
};

export type ConnectionsViewModel =
  | {
      loadState: "ready";
      items: ConnectionViewModelItem[];
    }
  | {
      loadState:
        | "empty"
        | "error"
        | "no_session"
        | "no_membership"
        | "tenant_error";
      items: [];
      message: string;
    };
