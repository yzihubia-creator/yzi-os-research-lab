import {
  CONNECTIONS_CATALOG,
} from "./catalog.ts";
import type {
  ConnectionCapabilityId,
  ConnectionChannel,
  ConnectionEntry,
  ConnectionState,
} from "./types.ts";

type SafeConnectionState = Pick<
  ConnectionEntry,
  "id" | "state" | "lastCheckedAt" | "nextAction" | "displayName" | "healthReason" | "businessVerificationStatus"
>;

export type SafePersistedConnectionAsset = {
  kind: MetaAssetKind;
  status: ConnectionState;
  lastCheckedAt: string | null;
  nextAction: string | null;
  displayName: string | null;
  healthReason: string | null;
  metadata: SafePersistedAssetMetadata;
};

export type SafePersistedConnection = SafeConnectionState & {
  assets: SafePersistedConnectionAsset[];
  availableNetworks: string[];
  capabilityIds: ConnectionCapabilityId[];
  lastSyncAt: string | null;
  pendingPublications: number;
  recentFailures: number;
  authorizationExpired: boolean;
  governedAuthorizationValidated: boolean;
  governedRuntimeValidated: boolean;
  humanCapabilities: string[];
};

type PublicRegistryState = {
  authState: "not_authorized" | "pending" | "authorized" | "expired" | "revoked" | "refresh_failed";
  connectionState: "not_connected" | "awaiting_authorization" | "connecting" | "ready" | "needs_attention" | "unavailable" | "revoked";
  healthState: "unknown" | "healthy" | "degraded" | "unavailable";
};

type MetaAssetKind =
  | "facebook_page"
  | "instagram_business"
  | "meta_ad_account"
  | "whatsapp_business_account"
  | "whatsapp_phone_number";

type SafePersistedAssetMetadata = {
  verifiedName: string | null;
  providerStatus: string | null;
  codeVerificationStatus: string | null;
  platformType: string | null;
  discoveryComplete: boolean | null;
  graphConfirmed: boolean | null;
};

const META_ASSET_KINDS = new Set<string>([
  "facebook_page",
  "instagram_business",
  "meta_ad_account",
  "whatsapp_business_account",
  "whatsapp_phone_number",
]);

const META_ASSET_CHANNEL: Record<MetaAssetKind, string> = {
  facebook_page: "facebook",
  instagram_business: "instagram",
  meta_ad_account: "meta-ads",
  whatsapp_business_account: "whatsapp",
  whatsapp_phone_number: "whatsapp",
};

const STATE_RANK: Record<ConnectionState, number> = {
  "requer-atencao": 4,
  "parcialmente-conectado": 3,
  "em-configuracao": 3,
  "aguardando-autorizacao": 3,
  conectado: 2,
  "nao-configurado": 1,
  "em-breve": 0,
};

export function mapPersistedStatus(status: string | null): ConnectionState {
  switch (status) {
    case "connected":
    case "active":
    case "ready":
      return "conectado";
    case "partially_connected":
      return "parcialmente-conectado";
    case "configuring":
    case "validating":
    case "connecting":
      return "em-configuracao";
    case "awaiting_account_selection":
    case "awaiting_customer":
    case "pending_authorization":
    case "awaiting_authorization":
    case "provisioning":
    case "configuration_required":
      return "aguardando-autorizacao";
    case "attention_required":
    case "needs_attention":
    case "expired":
    case "refresh_failed":
    case "validation_failed":
    case "token_invalid":
    case "plan_insufficient":
    case "rate_limited":
    case "failed":
      return "requer-atencao";
    case "disabled":
    case "disconnected":
    case "revoked":
    case "unavailable":
    case "not_configured":
    default:
      return "nao-configurado";
  }
}

export function parseTenantConnectionsRpcPayload(payload: unknown): SafePersistedConnection[] {
  const rows = Array.isArray(payload) ? payload : [];
  const parsed: SafePersistedConnection[] = [];

  for (const row of rows) {
    const record = asRecord(row);
    if (!record) continue;

    const visualId = readVisualConnectionId(record);
    if (!visualId) continue;

    const rawStatus =
      readString(record.connection_state) ??
      readString(record.auth_state) ??
      readString(record.status);
    const rawAuthorizationState = readString(record.auth_state);
    const rawHealthState = readString(record.health_state);
    const rawCapabilities =
      record.capability_snapshot ?? record.capabilities;
    const capabilityIds = readConnectionCapabilities(rawCapabilities);
    const publicRegistryState = derivePublicRegistryState({
      visualId,
      rawStatus,
      rawAuthorizationState,
      rawHealthState,
      validatedAt: readDateString(record.validated_at),
      lastCheckedAt: readDateString(record.last_checked_at),
      expiresAt: readDateString(record.expires_at),
      externalUserId: readString(record.external_user_id),
      externalBlogId: readString(record.external_blog_id),
      capabilityIds,
      lastErrorCode: readString(record.last_error_code),
    });

    parsed.push({
      id: visualId,
      state: mapPersistedConnectionStatus(rawStatus, visualId),
      lastCheckedAt: readDateString(record.validated_at) ?? readDateString(record.last_checked_at),
      nextAction: readSafeText(record.next_action),
      ...readSafeMetadata(record),
      assets: readAssets(record.assets),
      availableNetworks: readMetricoolNetworks(record.assets),
      capabilityIds,
      lastSyncAt: readDateString(record.last_sync_at),
      pendingPublications: readNonNegativeInteger(record.pending_publications),
      recentFailures: readNonNegativeInteger(record.recent_failures),
      authorizationExpired:
        publicRegistryState.authState === "expired" ||
        rawStatus === "token_invalid",
      governedAuthorizationValidated:
        visualId === "metricool"
          ? publicRegistryState.authState === "authorized"
          : rawAuthorizationState === "authorized",
      governedRuntimeValidated:
        visualId === "metricool"
          ? publicRegistryState.healthState === "healthy"
          : rawHealthState === "healthy",
      humanCapabilities: readHumanCapabilities(rawCapabilities),
    });
  }

  return parsed;
}

export function mergeConnectionsCatalogWithPersistedState(
  persisted: SafePersistedConnection[],
  catalog: ConnectionEntry[] = CONNECTIONS_CATALOG,
): ConnectionEntry[] {
  const persistedById = new Map(persisted.map((connection) => [connection.id, connection]));

  return catalog.map((entry) => {
    const persistedConnection = persistedById.get(entry.id);
    if (!persistedConnection) {
      return entry.state === "em-breve"
        ? copyEntry(entry)
        : { ...copyEntry(entry), state: "nao-configurado" };
    }

    const mergedEntry: ConnectionEntry = {
      ...copyEntry(entry),
      state: entry.state === "em-breve" ? "em-breve" : persistedConnection.state,
      lastCheckedAt: persistedConnection.lastCheckedAt,
      nextAction: persistedConnection.nextAction,
      displayName: persistedConnection.displayName,
      healthReason: persistedConnection.healthReason,
      businessVerificationStatus: persistedConnection.businessVerificationStatus,
      availableNetworks: persistedConnection.availableNetworks,
      lastSyncAt: persistedConnection.lastSyncAt,
      pendingPublications: persistedConnection.pendingPublications,
      recentFailures: persistedConnection.recentFailures,
    };

    if (entry.id === "metricool") {
      const unlockedIds = new Set(persistedConnection.capabilityIds);
      mergedEntry.capabilities = mergedEntry.capabilities.map((capability) => ({
        ...capability,
        unlocked: unlockedIds.has(capability.id),
      }));
      applyMetricoolSemantics(mergedEntry);
    }

    if (entry.id === "geracao-criativa") {
      const unlockedIds = new Set(persistedConnection.capabilityIds);
      mergedEntry.capabilities = mergedEntry.capabilities.map((capability) => ({
        ...capability,
        unlocked: unlockedIds.has(capability.id),
      }));
    }

    if (entry.id === "meta" && entry.channels) {
      mergedEntry.channels = mergeMetaChannels(entry.channels, persistedConnection.assets);
      applyMetaChannelSemantics(mergedEntry);
    }

    return mergedEntry;
  });
}

export function buildConnectionsCatalogFromRpcPayload(payload: unknown): ConnectionEntry[] {
  return mergeConnectionsCatalogWithPersistedState(parseTenantConnectionsRpcPayload(payload));
}

function readVisualConnectionId(record: Record<string, unknown>): string | null {
  const catalogId = readString(record.catalog_id);
  if (catalogId === "meta") return "meta";

  const provider = readString(record.provider);
  const connectionKind = readString(record.connection_kind);
  if (provider === "meta") return "meta";
  if (provider === "metricool") return "metricool";
  if (provider === "higgsfield") return "geracao-criativa";
  if (connectionKind === "metricool") return "metricool";
  if (connectionKind === "higgsfield") return "geracao-criativa";

  return catalogId && CONNECTIONS_CATALOG.some((entry) => entry.id === catalogId)
    ? catalogId
    : null;
}

function readMetricoolNetworks(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.flatMap((item) => {
    const record = asRecord(item);
    const network = readString(record?.network);
    return network === "instagram" || network === "facebook" ? [network] : [];
  })));
}

function readConnectionCapabilities(value: unknown): ConnectionCapabilityId[] {
  if (!Array.isArray(value)) return [];
  const mapped = value.flatMap((item) => {
    if (typeof item === "string") {
      switch (item) {
        case "social_publish":
        case "social_content_publish":
          return ["publicar-conteudo" as const];
        case "social_schedule":
        case "social_content_schedule":
          return ["programar-publicacao" as const];
        case "post_metrics":
        case "profile_metrics":
        case "social_metrics_read":
          return ["ler-metricas" as const];
        case "image_generation":
        case "video_generation":
          return ["produzir-criativos" as const];
        default:
          return [];
      }
    }
    const record = asRecord(item);
    if (!record || record.unlocked !== true) return [];
    switch (readString(record.capability_id)) {
      case "social_publish":
        return ["publicar-conteudo" as const];
      case "social_schedule":
        return ["programar-publicacao" as const];
      case "post_metrics":
      case "profile_metrics":
        return ["ler-metricas" as const];
      default:
        return [];
    }
  });
  return Array.from(new Set(mapped));
}

function readHumanCapabilities(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const labels = value.flatMap((item) => {
    const capability =
      typeof item === "string"
        ? item
        : readString(asRecord(item)?.capability_id);
    switch (capability) {
      case "social_content_publish":
      case "social_publish":
        return ["Publicação social"];
      case "social_calendar_read":
      case "social_content_schedule":
      case "social_schedule":
        return ["Calendário de conteúdo"];
      case "social_metrics_read":
      case "post_metrics":
      case "profile_metrics":
        return ["Métricas sociais"];
      case "image_generation":
        return ["Produção de imagens"];
      case "video_generation":
        return ["Produção de vídeos"];
      default:
        return [];
    }
  });
  return Array.from(new Set(labels));
}

function derivePublicRegistryState(input: {
  visualId: string;
  rawStatus: string | null;
  rawAuthorizationState: string | null;
  rawHealthState: string | null;
  validatedAt: string | null;
  lastCheckedAt: string | null;
  expiresAt: string | null;
  externalUserId: string | null;
  externalBlogId: string | null;
  capabilityIds: readonly ConnectionCapabilityId[];
  lastErrorCode: string | null;
}): PublicRegistryState {
  const explicit = {
    authState: readPublicAuthState(input.rawAuthorizationState),
    healthState: readPublicHealthState(input.rawHealthState),
  };
  const statusState = mapPersistedStatus(input.rawStatus);
  const expired = input.expiresAt !== null && Date.parse(input.expiresAt) <= Date.now();

  if (input.visualId === "metricool") {
    const hasProbeEvidence = Boolean(input.validatedAt ?? input.lastCheckedAt);
    const hasDiscoveredCapabilities = input.capabilityIds.length > 0;
    const active = ["active", "connected", "ready"].includes(input.rawStatus ?? "");
    const failed = statusState === "requer-atencao" || Boolean(input.lastErrorCode);

    return {
      authState:
        explicit.authState ??
        (expired
          ? "expired"
          : active && hasProbeEvidence
            ? "authorized"
            : statusState === "aguardando-autorizacao"
              ? "pending"
              : "not_authorized"),
      connectionState:
        active && hasProbeEvidence && hasDiscoveredCapabilities && !failed
          ? "ready"
          : failed
            ? "needs_attention"
            : statusState === "em-configuracao"
              ? "connecting"
              : statusState === "aguardando-autorizacao"
                ? "awaiting_authorization"
                : "not_connected",
      healthState:
        explicit.healthState ??
        (active && hasProbeEvidence && hasDiscoveredCapabilities && !failed
          ? "healthy"
          : failed
            ? "degraded"
            : "unknown"),
    };
  }

  return {
    authState:
      explicit.authState ??
      (expired ? "expired" : statusState === "conectado" ? "authorized" : "not_authorized"),
    connectionState:
      statusState === "conectado"
        ? "ready"
        : statusState === "em-configuracao"
          ? "connecting"
          : statusState === "aguardando-autorizacao"
            ? "awaiting_authorization"
            : statusState === "requer-atencao"
              ? "needs_attention"
              : "not_connected",
    healthState: explicit.healthState ?? (statusState === "conectado" ? "healthy" : "unknown"),
  };
}

function readPublicAuthState(value: string | null): PublicRegistryState["authState"] | null {
  switch (value) {
    case "not_authorized":
    case "pending":
    case "authorized":
    case "expired":
    case "revoked":
    case "refresh_failed":
      return value;
    default:
      return null;
  }
}

function readPublicHealthState(value: string | null): PublicRegistryState["healthState"] | null {
  switch (value) {
    case "unknown":
    case "healthy":
    case "degraded":
    case "unavailable":
      return value;
    default:
      return null;
  }
}

function applyMetricoolSemantics(entry: ConnectionEntry): void {
  const networks = entry.availableNetworks ?? [];
  if (entry.state === "conectado") {
    entry.primaryPendency = null;
    entry.nextAction = "Validar conexão";
    entry.healthReason = "API oficial validada";
    entry.impact = [];
    entry.summary = networks.length
      ? `Workspace Metricool validado para ${networks.join(" e ")}.`
      : "Workspace Metricool validado; descoberta de perfis ainda sem destinos disponíveis.";
    return;
  }
  if (entry.state === "aguardando-autorizacao") {
    entry.nextAction = "Aguardar configuração gerenciada";
    entry.healthReason = "Credenciais não são solicitadas ao cliente";
    entry.primaryPendency = "Provisionar API Metricool pela YZIHUB.";
  }
}

function readNonNegativeInteger(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}

function readAssets(value: unknown): SafePersistedConnectionAsset[] {
  if (!Array.isArray(value)) return [];

  const assets: SafePersistedConnectionAsset[] = [];
  for (const item of value) {
    const record = asRecord(item);
    if (!record) continue;

    const kind = readAssetKind(record);
    if (!kind) continue;

    assets.push({
      kind,
      status: mapPersistedAssetStatus(record),
      lastCheckedAt: readDateString(record.last_checked_at),
      nextAction: readSafeText(record.next_action),
      ...readSafeMetadata(record),
      metadata: readSafeAssetMetadata(record),
    });
  }

  return assets;
}

function mergeMetaChannels(
  channels: ConnectionChannel[],
  assets: SafePersistedConnectionAsset[],
): ConnectionChannel[] {
  const assetsByChannel = new Map<string, SafePersistedConnectionAsset[]>();
  for (const asset of assets) {
    const channelId = META_ASSET_CHANNEL[asset.kind];
    assetsByChannel.set(channelId, [...(assetsByChannel.get(channelId) ?? []), asset]);
  }

  return channels.map((channel) => {
    const channelAssets = assetsByChannel.get(channel.id);
    if (!channelAssets?.length) {
      return { ...channel, state: "nao-configurado" };
    }

    const primaryAsset = channelAssets.reduce((current, next) =>
      STATE_RANK[next.status] > STATE_RANK[current.status] ? next : current,
    );
    const operationalAsset = channel.id === "whatsapp" ? selectWhatsappOperationalAsset(channelAssets) : primaryAsset;

    return {
      ...channel,
      state: operationalAsset.status,
      lastCheckedAt: operationalAsset.lastCheckedAt,
      nextAction: operationalAsset.nextAction,
      displayName: operationalAsset.displayName,
      healthReason: operationalAsset.healthReason,
      summary: channel.id === "whatsapp" ? whatsappChannelSummary(channelAssets, channel.summary) : channel.summary,
      relatedAssets: channel.id === "whatsapp" ? whatsappRelatedAssets(channelAssets) : undefined,
    };
  });
}

function applyMetaChannelSemantics(entry: ConnectionEntry): void {
  const channels = entry.channels ?? [];
  if (!channels.length) return;

  if (entry.state === "requer-atencao" || entry.state === "nao-configurado" || entry.state === "em-breve") {
    return;
  }

  const connectedChannels = channels.filter((channel) => channel.state === "conectado");
  const partiallyConnectedChannels = channels.filter((channel) => channel.state === "parcialmente-conectado");
  const missingChannels = channels.filter((channel) => channel.state === "nao-configurado");

  if (connectedChannels.length === channels.length) {
    entry.state = "conectado";
    entry.summary = "O WhatsApp Cloud API está conectado para atendimento e mensagens.";
    entry.primaryPendency = null;
    entry.impact = [];
    entry.nextAction = null;
    entry.businessVerificationStatus ??= "Pendente";
    return;
  }

  const whatsapp = channels.find((channel) => channel.id === "whatsapp");
  if (whatsapp?.state === "parcialmente-conectado") {
    entry.state = "parcialmente-conectado";
    entry.summary =
      "O WhatsApp está parcialmente operacional: há um número conectado e outro em configuração.";
    entry.primaryPendency = "Concluir ativação técnica do número oficial";
    entry.impact = ["WhatsApp disponível para validação técnica; atendimento oficial ainda depende da ativação final."];
    entry.nextAction = "Concluir ativação técnica do número oficial";
    entry.businessVerificationStatus ??= "Pendente";
    return;
  }

  if (partiallyConnectedChannels.length > 0) {
    entry.state = "parcialmente-conectado";
    entry.businessVerificationStatus ??= "Pendente";
  }

  if (connectedChannels.length > 0 && missingChannels.length > 0) {
    entry.state = "parcialmente-conectado";
    entry.summary = "O WhatsApp Cloud API ainda está em configuração técnica.";
    entry.primaryPendency = "Concluir ativação técnica do número oficial";
    entry.impact = ["O WhatsApp ainda precisa ser concluído para ativar o atendimento."];
    entry.nextAction = "Concluir ativação técnica do número oficial";
    entry.businessVerificationStatus ??= "Pendente";

    const whatsapp = channels.find((channel) => channel.id === "whatsapp");
    if (whatsapp?.state === "nao-configurado") {
      whatsapp.state = "em-configuracao";
      whatsapp.nextAction = "Ativar número oficial";
    }
  }
}

function readAssetKind(record: Record<string, unknown>): MetaAssetKind | null {
  const rawKind =
    readString(record.metadata && typeof record.metadata === "object"
      ? (record.metadata as Record<string, unknown>).normalized_kind
      : null) ??
    readString(record.kind) ??
    readString(record.asset_type);
  if (!rawKind) return null;
  const normalized = normalizeMetaAssetKind(rawKind);
  return normalized && META_ASSET_KINDS.has(normalized) ? normalized : null;
}

function readSafeMetadata(record: Record<string, unknown>): {
  displayName: string | null;
  healthReason: string | null;
  businessVerificationStatus: string | null;
} {
  const metadata = asRecord(record.metadata);
  return {
    displayName:
      readSafeText(record.display_name) ??
      readSafeText(record.account_label) ??
      readSafeText(metadata?.display_name),
    healthReason: readSafeText(record.health_reason) ?? readSafeText(metadata?.health_reason),
    businessVerificationStatus:
      readSafeText(record.business_verification_status) ??
      readSafeText(metadata?.business_verification_status) ??
      readSafeText(metadata?.business_verification),
  };
}

function normalizeMetaAssetKind(kind: string): MetaAssetKind | null {
  switch (kind) {
    case "facebook_page":
    case "page":
      return "facebook_page";
    case "instagram_business":
    case "instagram":
      return "instagram_business";
    case "meta_ad_account":
    case "ad_account":
      return "meta_ad_account";
    case "whatsapp_business_account":
    case "waba":
      return "whatsapp_business_account";
    case "whatsapp_phone_number":
      return "whatsapp_phone_number";
    default:
      return null;
  }
}

function selectWhatsappOperationalAsset(
  assets: SafePersistedConnectionAsset[],
): SafePersistedConnectionAsset {
  const phoneAssets = assets.filter((asset) => asset.kind === "whatsapp_phone_number");
  const connectedPhone = phoneAssets.find((asset) => asset.status === "conectado");
  if (connectedPhone) {
    return phoneAssets.some((asset) => asset.status !== "conectado")
      ? { ...connectedPhone, status: "parcialmente-conectado" }
      : connectedPhone;
  }

  const configuringPhone = phoneAssets.find((asset) => asset.status === "em-configuracao");
  if (configuringPhone) return configuringPhone;

  return assets.reduce((current, next) =>
    STATE_RANK[next.status] > STATE_RANK[current.status] ? next : current,
  );
}

function whatsappChannelSummary(assets: SafePersistedConnectionAsset[], fallback: string): string {
  const phoneAssets = assets.filter((asset) => asset.kind === "whatsapp_phone_number");
  const hasConnected = phoneAssets.some((asset) => asset.status === "conectado");
  const hasConfiguring = phoneAssets.some((asset) => asset.status === "em-configuracao");
  if (hasConnected && hasConfiguring) {
    return "O número de teste está conectado. O número oficial segue em configuração.";
  }
  if (hasConnected) return "Número WhatsApp conectado para validação técnica.";
  if (hasConfiguring) return "Número WhatsApp em configuração técnica.";
  return fallback;
}

function whatsappRelatedAssets(assets: SafePersistedConnectionAsset[]) {
  return assets.map((asset) => ({
    kind: asset.kind,
    category: asset.kind === "whatsapp_phone_number" ? "phone" as const : "account" as const,
    label: whatsappAssetLabel(asset),
    state: asset.status,
    description: whatsappAssetDescription(asset),
  }));
}

function whatsappAssetLabel(asset: SafePersistedConnectionAsset): string {
  if (asset.kind === "whatsapp_phone_number") {
    return asset.displayName ?? asset.metadata.verifiedName ?? "Número WhatsApp";
  }
  return asset.displayName ?? "WhatsApp Business Account";
}

function whatsappAssetDescription(asset: SafePersistedConnectionAsset): string | null {
  if (asset.kind === "whatsapp_phone_number" && asset.status === "conectado") {
    return "Disponível para validação técnica.";
  }
  if (asset.kind === "whatsapp_phone_number" && asset.status === "em-configuracao") {
    return "Número verificado, aguardando ativação técnica final.";
  }
  return null;
}

function readSafeAssetMetadata(record: Record<string, unknown>): SafePersistedAssetMetadata {
  const metadata = asRecord(record.metadata);
  return {
    verifiedName: readSafeText(metadata?.verified_name),
    providerStatus: readSafeText(metadata?.provider_status),
    codeVerificationStatus: readSafeText(metadata?.code_verification_status),
    platformType: readSafeText(metadata?.platform_type),
    discoveryComplete: readBoolean(metadata?.discovery_complete),
    graphConfirmed: readBoolean(metadata?.graph_confirmed),
  };
}

function mapPersistedAssetStatus(record: Record<string, unknown>): ConnectionState {
  const explicitStatus = readString(record.status);
  if (explicitStatus) return mapPersistedStatus(explicitStatus);

  const metadata = asRecord(record.metadata);
  const metadataStatus = readString(metadata?.status);
  if (metadataStatus) return mapPersistedStatus(metadataStatus);

  const kind = readAssetKind(record);
  if (kind === "whatsapp_business_account" || kind === "whatsapp_phone_number") {
    return "nao-configurado";
  }

  const hasDisplayLabel = Boolean(
    readSafeText(record.account_label) ??
    readSafeText(record.display_name) ??
    readSafeText(record.label) ??
    readSafeText(metadata?.display_name) ??
    readSafeText(metadata?.label),
  );

  return hasDisplayLabel ? "conectado" : "nao-configurado";
}

function mapPersistedConnectionStatus(status: string | null, visualId: string): ConnectionState {
  const mapped = mapPersistedStatus(status);
  if (visualId !== "meta" || mapped !== "nao-configurado") return mapped;
  return status === "not_configured" ? "nao-configurado" : "aguardando-autorizacao";
}

function copyEntry(entry: ConnectionEntry): ConnectionEntry {
  return {
    ...entry,
    capabilities: entry.capabilities.map((capability) => ({ ...capability })),
    channels: entry.channels?.map((channel) => ({
      ...channel,
      capabilities: channel.capabilities.map((capability) => ({ ...capability })),
    })),
    impact: [...entry.impact],
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function readSafeText(value: unknown): string | null {
  const text = readString(value);
  if (!text || /token|secret|vault|postgres:\/\/|postgresql:\/\//i.test(text)) return null;
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

function readDateString(value: unknown): string | null {
  const text = readString(value);
  if (!text) return null;
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}
