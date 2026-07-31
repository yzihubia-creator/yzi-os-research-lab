import "server-only";

import {
  CONNECTIONS_CATALOG,
  CONNECTION_CAPABILITY_LABEL,
} from "./catalog.ts";
import {
  mergeConnectionsCatalogWithPersistedState,
  parseTenantConnectionsRpcPayload,
  type SafePersistedConnection,
} from "./persisted-state.ts";
import type {
  ConnectionCapabilityId,
  ConnectionEntry,
} from "./types.ts";

export {
  CONNECTION_CATEGORY_VALUES,
  CONNECTION_HUMAN_STATUS_VALUES,
} from "./public-view-model.ts";
export type {
  ConnectionCapabilityTruth,
  ConnectionCategory,
  ConnectionHumanStatus,
  ConnectionsViewModel,
  ConnectionViewModelItem,
} from "./public-view-model.ts";
import type {
  ConnectionCapabilityTruth,
  ConnectionCategory,
  ConnectionHumanStatus,
  ConnectionsViewModel,
  ConnectionViewModelItem,
} from "./public-view-model.ts";

type PublicConnectionDefinition = {
  id: string;
  sourceId: string;
  nome: string;
  categoria: ConnectionCategory;
  finalidade: string;
  resumoNaoConfigurado: string;
  capabilityIds: readonly ConnectionCapabilityId[];
  future?: boolean;
  externalCreative?: boolean;
};

const PUBLIC_CONNECTIONS: readonly PublicConnectionDefinition[] = [
  {
    id: "atendimento-mensagens",
    sourceId: "meta",
    nome: "Atendimento por mensagens",
    categoria: "Atendimento",
    finalidade: "Receber e responder contatos pelo canal oficial da imobiliária.",
    resumoNaoConfigurado: "O atendimento oficial ainda não está disponível.",
    capabilityIds: ["receber-contatos", "responder-mensagens"],
  },
  {
    id: "publicacao-social",
    sourceId: "metricool",
    nome: "Publicação social",
    categoria: "Publicação social",
    finalidade: "Agendar conteúdo aprovado, acompanhar o histórico e coletar métricas sociais.",
    resumoNaoConfigurado: "A operação social ainda não possui autorização validada.",
    capabilityIds: ["publicar-conteudo", "programar-publicacao", "ler-metricas"],
  },
  {
    id: "site",
    sourceId: "site",
    nome: "Site",
    categoria: "Site",
    finalidade: "Publicar e acompanhar as páginas dos imóveis aprovados.",
    resumoNaoConfigurado: "Domínio e publicação do catálogo ainda não foram validados.",
    capabilityIds: ["identified", "publish", "metrics"],
  },
  {
    id: "desempenho-busca",
    sourceId: "google-search-console",
    nome: "Desempenho de busca",
    categoria: "Dados e mensuração",
    finalidade: "Ler indexação e termos de busca relacionados ao site.",
    resumoNaoConfigurado: "A propriedade de busca do site ainda não foi conectada.",
    capabilityIds: ["metrics"],
  },
  {
    id: "mensuracao-site",
    sourceId: "google-analytics",
    nome: "Mensuração do site",
    categoria: "Dados e mensuração",
    finalidade: "Ler tráfego e eventos do site sem expor configuração técnica.",
    resumoNaoConfigurado: "A mensuração do site ainda não foi conectada.",
    capabilityIds: ["metrics"],
  },
  {
    id: "presenca-local",
    sourceId: "google-business-profile",
    nome: "Presença local",
    categoria: "Dados e mensuração",
    finalidade: "Acompanhar a presença institucional local da imobiliária.",
    resumoNaoConfigurado: "O perfil local ainda não foi conectado.",
    capabilityIds: ["identified", "publish", "metrics"],
  },
  {
    id: "campanhas-busca",
    sourceId: "google-ads",
    nome: "Campanhas de busca",
    categoria: "Publicação social",
    finalidade: "Preparar campanhas de busca quando essa capability entrar no produto.",
    resumoNaoConfigurado: "Esta capability não faz parte do MVP atual.",
    capabilityIds: [],
    future: true,
  },
  {
    id: "producao-criativa-complementar",
    sourceId: "geracao-criativa",
    nome: "Produção criativa complementar",
    categoria: "Produção criativa",
    finalidade: "Solicitar variações externas governadas sem substituir o Creative local.",
    resumoNaoConfigurado: "A conta externa conhecida ainda não possui autenticação configurada no projeto.",
    capabilityIds: ["produzir-criativos"],
    externalCreative: true,
  },
];

export function buildConnectionsViewModelFromRpcPayload(
  payload: unknown,
  expectedTenantId?: string,
): ConnectionsViewModel {
  if (expectedTenantId && containsMismatchedTenant(payload, expectedTenantId)) {
    return buildConnectionsLoadFailure(
      "error",
      "O estado recebido não pertence ao tenant ativo.",
    );
  }
  const persisted = parseTenantConnectionsRpcPayload(payload);
  const entries = mergeConnectionsCatalogWithPersistedState(
    persisted,
    CONNECTIONS_CATALOG,
  );
  const persistedById = new Map(
    persisted.map((connection) => [connection.id, connection]),
  );

  return {
    loadState: "ready",
    items: PUBLIC_CONNECTIONS.map((definition) =>
      buildItem(
        definition,
        entries.find((entry) => entry.id === definition.sourceId),
        persistedById.get(definition.sourceId),
      ),
    ),
  };
}

function containsMismatchedTenant(
  payload: unknown,
  expectedTenantId: string,
): boolean {
  if (!Array.isArray(payload)) return false;
  return payload.some((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return false;
    const tenantId = (row as Record<string, unknown>).tenant_id;
    return typeof tenantId === "string" && tenantId !== expectedTenantId;
  });
}

export function buildConnectionsLoadFailure(
  state: Exclude<ConnectionsViewModel["loadState"], "ready">,
  message: string,
): ConnectionsViewModel {
  return { loadState: state, items: [], message: sanitizeHumanText(message) };
}

export function deriveConnectionTruth(input: {
  entry: ConnectionEntry | undefined;
  persisted: SafePersistedConnection | undefined;
}): ConnectionCapabilityTruth {
  const { entry, persisted } = input;
  const accountExists = Boolean(persisted);
  const requiresGovernedValidation =
    entry?.id === "metricool" || entry?.id === "geracao-criativa";
  const authorizationExpired = persisted?.authorizationExpired ?? false;
  const credentialsConfigured =
    accountExists &&
    Boolean(entry) &&
    !["nao-configurado", "aguardando-autorizacao", "em-breve"].includes(
      entry?.state ?? "nao-configurado",
    );
  const authorizationValid =
    credentialsConfigured &&
    entry?.state === "conectado" &&
    Boolean(persisted?.lastCheckedAt) &&
    (!requiresGovernedValidation ||
      persisted?.governedAuthorizationValidated === true);
  const externallyBlocked =
    entry?.id === "meta" && isMessagingExternallyBlocked(entry, persisted);
  const connectionHealthy =
    authorizationValid &&
    !externallyBlocked &&
    (!requiresGovernedValidation ||
      persisted?.governedRuntimeValidated === true) &&
    (persisted?.recentFailures ?? 0) === 0;
  const unlocked = new Set(
    entry?.capabilities
      .filter((capability) => capability.unlocked)
      .map((capability) => capability.id) ?? [],
  );
  const messagingReady =
    entry?.id === "meta" &&
    entry.channels?.some(
      (channel) =>
        channel.id === "whatsapp" &&
        channel.state === "conectado" &&
        Boolean(channel.lastCheckedAt),
    );
  const readCapabilityReady =
    connectionHealthy &&
    (messagingReady ||
      unlocked.has("read") ||
      unlocked.has("metrics") ||
      unlocked.has("ler-metricas") ||
      unlocked.has("receber-contatos"));
  const writeCapabilityReady =
    connectionHealthy &&
    (messagingReady ||
      unlocked.has("write") ||
      unlocked.has("publish") ||
      unlocked.has("publicar-conteudo") ||
      unlocked.has("programar-publicacao") ||
      unlocked.has("responder-mensagens"));

  return {
    accountExists,
    credentialsConfigured,
    authorizationValid,
    authorizationExpired,
    connectionHealthy,
    readCapabilityReady,
    writeCapabilityReady,
    externallyBlocked,
  };
}

function buildItem(
  definition: PublicConnectionDefinition,
  entry: ConnectionEntry | undefined,
  persisted: SafePersistedConnection | undefined,
): ConnectionViewModelItem {
  const truth = deriveConnectionTruth({
    entry,
    persisted,
  });
  const status = deriveHumanStatus(definition, entry, truth);
  const capabilitiesDisponiveis = availableCapabilities(
    definition,
    entry,
    truth,
    persisted,
  );
  const incidentesHumanos = humanIncidents(status, truth, persisted);
  const configured = truth.accountExists || truth.credentialsConfigured;

  return {
    id: definition.id,
    nome: definition.nome,
    categoria: definition.categoria,
    finalidade: definition.finalidade,
    status,
    resumo:
      status === "Ativo"
        ? activeSummary(definition)
        : definition.resumoNaoConfigurado,
    capabilitiesDisponiveis,
    ultimaVerificacao: persisted?.lastCheckedAt ?? null,
    proximaAcao: nextAction(definition, status),
    incidentesHumanos,
    aguardandoVerificacaoExterna: truth.externallyBlocked,
    podeConfigurar:
      !definition.future &&
      !truth.externallyBlocked &&
      ["publicacao-social", "producao-criativa-complementar"].includes(
        definition.id,
      ) &&
      !truth.connectionHealthy,
    podeTestar:
      !definition.future &&
      !truth.externallyBlocked &&
      ["publicacao-social", "producao-criativa-complementar"].includes(
        definition.id,
      ) &&
      truth.credentialsConfigured,
    podeDesconectar:
      !definition.future &&
      ["publicacao-social", "producao-criativa-complementar"].includes(
        definition.id,
      ) &&
      configured,
  };
}

function deriveHumanStatus(
  definition: PublicConnectionDefinition,
  entry: ConnectionEntry | undefined,
  truth: ConnectionCapabilityTruth,
): ConnectionHumanStatus {
  if (definition.future) return "Indisponível";
  if (truth.externallyBlocked) return "Precisa de atenção";
  if (!truth.accountExists) return "Não conectado";
  if (truth.authorizationExpired) return "Autorização expirada";
  if (entry?.state === "aguardando-autorizacao") {
    return "Aguardando autorização";
  }
  if (entry?.state === "em-configuracao") return "Conectando";
  if (!truth.credentialsConfigured || !truth.authorizationValid) {
    if (entry?.state === "requer-atencao") return "Precisa de atenção";
    return "Aguardando autorização";
  }
  if (!truth.connectionHealthy) return "Precisa de atenção";
  if (!truth.readCapabilityReady && !truth.writeCapabilityReady) {
    return "Conectando";
  }
  return "Ativo";
}

function availableCapabilities(
  definition: PublicConnectionDefinition,
  entry: ConnectionEntry | undefined,
  truth: ConnectionCapabilityTruth,
  persisted: SafePersistedConnection | undefined,
): string[] {
  if (!truth.connectionHealthy) return [];
  if (persisted?.humanCapabilities.length) {
    return persisted.humanCapabilities;
  }
  if (entry?.id === "meta") {
    return truth.readCapabilityReady && truth.writeCapabilityReady
      ? ["Receber contatos", "Responder mensagens"]
      : [];
  }
  const allowedIds = new Set(definition.capabilityIds);
  return (
    entry?.capabilities
      .filter(
        (capability) =>
          capability.unlocked && allowedIds.has(capability.id),
      )
      .map((capability) => CONNECTION_CAPABILITY_LABEL[capability.id]) ?? []
  );
}

function isMessagingExternallyBlocked(
  entry: ConnectionEntry,
  persisted: SafePersistedConnection | undefined,
): boolean {
  const verification = entry.businessVerificationStatus?.toLowerCase() ?? "";
  const verificationPending =
    Boolean(verification) &&
    !["approved", "aprovado", "verified", "verificado"].includes(verification);
  const officialActivationPending =
    persisted?.assets.some(
      (asset) =>
        asset.kind === "whatsapp_phone_number" &&
        ["em-configuracao", "aguardando-autorizacao"].includes(asset.status),
    ) ?? false;
  return verificationPending || officialActivationPending;
}

function activeSummary(definition: PublicConnectionDefinition): string {
  switch (definition.id) {
    case "atendimento-mensagens":
      return "Atendimento oficial validado e disponível para as capabilities liberadas.";
    case "publicacao-social":
      return "Publicação, acompanhamento e métricas estão disponíveis conforme as capabilities validadas.";
    default:
      return "Conexão validada e saudável para as capabilities liberadas.";
  }
}

function nextAction(
  definition: PublicConnectionDefinition,
  status: ConnectionHumanStatus,
): string | null {
  if (definition.id === "atendimento-mensagens" && status === "Precisa de atenção") {
    return "Concluir a regularização documental e reenviar a documentação para verificação.";
  }
  switch (status) {
    case "Ativo":
      return "Acompanhar a próxima verificação de saúde.";
    case "Conectando":
      return "Aguardar a descoberta e a verificação da conexão.";
    case "Aguardando autorização":
      return "Continuar a autorização externa.";
    case "Precisa de atenção":
      return "Revisar a autorização e executar um novo teste controlado.";
    case "Indisponível":
      return null;
    case "Autorização expirada":
      return "Reconectar para renovar a autorização.";
    case "Não conectado":
      return definition.future
        ? null
        : "Iniciar a autorização externa.";
  }
}

function humanIncidents(
  status: ConnectionHumanStatus,
  truth: ConnectionCapabilityTruth,
  persisted: SafePersistedConnection | undefined,
): string[] {
  const incidents: string[] = [];
  if (truth.externallyBlocked) {
    incidents.push("A ativação depende de verificação empresarial externa.");
  }
  if (status === "Precisa de atenção") {
    incidents.push("A autorização ou a verificação de saúde não está válida.");
  }
  if ((persisted?.recentFailures ?? 0) > 0) {
    incidents.push("Há falhas recentes que precisam de revisão.");
  }
  return incidents;
}

function sanitizeHumanText(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim().slice(0, 240);
  if (
    !normalized ||
    /token|secret|vault|postgres(?:ql)?:\/\/|https?:\/\/|webhook|endpoint/i.test(
      normalized,
    )
  ) {
    return "Não foi possível carregar o estado real das conexões.";
  }
  return normalized;
}
