import {
  CONNECTIONS_CATALOG,
} from "./catalog.ts";
import type { ConnectionChannel, ConnectionEntry, ConnectionState } from "./types.ts";

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
};

export type SafePersistedConnection = SafeConnectionState & {
  assets: SafePersistedConnectionAsset[];
};

type MetaAssetKind =
  | "facebook_page"
  | "instagram_business"
  | "meta_ad_account"
  | "whatsapp_business_account";

const META_ASSET_KINDS = new Set<string>([
  "facebook_page",
  "instagram_business",
  "meta_ad_account",
  "whatsapp_business_account",
]);

const META_ASSET_CHANNEL: Record<MetaAssetKind, string> = {
  facebook_page: "facebook",
  instagram_business: "instagram",
  meta_ad_account: "meta-ads",
  whatsapp_business_account: "whatsapp",
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
      return "conectado";
    case "partially_connected":
      return "parcialmente-conectado";
    case "awaiting_account_selection":
    case "awaiting_customer":
    case "pending_authorization":
    case "provisioning":
      return "aguardando-autorizacao";
    case "attention_required":
    case "validation_failed":
      return "requer-atencao";
    case "disabled":
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

    const rawStatus = readString(record.status);

    parsed.push({
      id: visualId,
      state: mapPersistedConnectionStatus(rawStatus, visualId),
      lastCheckedAt: readDateString(record.last_checked_at),
      nextAction: readSafeText(record.next_action),
      ...readSafeMetadata(record),
      assets: readAssets(record.assets),
    });
  }

  return parsed;
}

export function mergeConnectionsCatalogWithPersistedState(
  persisted: SafePersistedConnection[],
  catalog: ConnectionEntry[] = CONNECTIONS_CATALOG,
): ConnectionEntry[] {
  const persistedById = new Map(persisted.map((connection) => [connection.id, connection]));
  const metaAssets = persistedById.get("meta")?.assets ?? [];

  return catalog.map((entry) => {
    const persistedConnection = persistedById.get(entry.id);
    if (!persistedConnection) {
      const copiedEntry: ConnectionEntry =
        entry.state === "em-breve" ? copyEntry(entry) : { ...copyEntry(entry), state: "nao-configurado" };
      applyMetaDerivedOperationalSemantics(copiedEntry, metaAssets);
      return copiedEntry;
    }

    const mergedEntry: ConnectionEntry = {
      ...copyEntry(entry),
      state: entry.state === "em-breve" ? "em-breve" : persistedConnection.state,
      lastCheckedAt: persistedConnection.lastCheckedAt,
      nextAction: persistedConnection.nextAction,
      displayName: persistedConnection.displayName,
      healthReason: persistedConnection.healthReason,
      businessVerificationStatus: persistedConnection.businessVerificationStatus,
    };

    if (entry.id === "meta" && entry.channels) {
      mergedEntry.channels = mergeMetaChannels(entry.channels, persistedConnection.assets);
      applyMetaChannelSemantics(mergedEntry);
    }

    applyMetaDerivedOperationalSemantics(mergedEntry, metaAssets);
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
  if (provider === "meta") return "meta";

  return catalogId && CONNECTIONS_CATALOG.some((entry) => entry.id === catalogId)
    ? catalogId
    : null;
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

    return {
      ...channel,
      state: primaryAsset.status,
      lastCheckedAt: primaryAsset.lastCheckedAt,
      nextAction: primaryAsset.nextAction,
      displayName: primaryAsset.displayName,
      healthReason: primaryAsset.healthReason,
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
  const missingChannels = channels.filter((channel) => channel.state === "nao-configurado");

  if (connectedChannels.length === channels.length) {
    entry.state = "conectado";
    entry.summary =
      "A Meta está conectada ao WhatsApp, Instagram, Facebook e conta de anúncios.";
    entry.primaryPendency = null;
    entry.impact = [];
    entry.nextAction = null;
    entry.businessVerificationStatus ??= "Pendente";
    return;
  }

  if (connectedChannels.length > 0 && missingChannels.length > 0) {
    entry.state = "parcialmente-conectado";
    entry.summary =
      "A Meta já está conectada ao Instagram, Facebook e conta de anúncios. O WhatsApp ainda está em configuração.";
    entry.primaryPendency = "Ativar o WhatsApp oficial";
    entry.impact = [
      "Instagram, Facebook e conta de anúncios já estão conectados. O WhatsApp ainda precisa ser concluído para ativar o atendimento.",
    ];
    entry.nextAction = "Ativar o WhatsApp oficial";
    entry.businessVerificationStatus ??= "Pendente";

    const whatsapp = channels.find((channel) => channel.id === "whatsapp");
    if (whatsapp?.state === "nao-configurado") {
      whatsapp.state = "em-configuracao";
      whatsapp.nextAction = "Ativar o WhatsApp oficial";
    }
  }
}

function applyMetaDerivedOperationalSemantics(
  entry: ConnectionEntry,
  assets: SafePersistedConnectionAsset[],
): void {
  const instagram = assets.find((asset) => asset.kind === "instagram_business" && asset.status === "conectado");
  const facebook = assets.find((asset) => asset.kind === "facebook_page" && asset.status === "conectado");
  const metaAds = assets.find((asset) => asset.kind === "meta_ad_account" && asset.status === "conectado");

  if (entry.id === "instagram-organico" && instagram) {
    markIdentifiedOnly(entry, instagram, "Conta identificada; publicação e métricas ainda não validadas.");
  }

  if (entry.id === "facebook-organico" && facebook) {
    markIdentifiedOnly(entry, facebook, "Página identificada; publicação e métricas ainda não validadas.");
  }

  if (entry.id === "meta-ads" && metaAds) {
    entry.state = "parcialmente-conectado";
    entry.displayName = metaAds.displayName;
    entry.lastCheckedAt = metaAds.lastCheckedAt;
    entry.summary = "Conta de anúncios identificada; leitura disponível, escrita e gestão financeira não validadas.";
    entry.primaryPendency = "Validar criação/edição, método de pagamento e limites de orçamento.";
    entry.impact = ["Meta Ads pode ser lido, mas criação, edição, pagamento e orçamento ainda não foram validados."];
    unlockCapabilities(entry, new Set(["identified", "read"]));
  }
}

function markIdentifiedOnly(
  entry: ConnectionEntry,
  asset: SafePersistedConnectionAsset,
  pendency: string,
): void {
  entry.state = "parcialmente-conectado";
  entry.displayName = asset.displayName;
  entry.lastCheckedAt = asset.lastCheckedAt;
  entry.summary = "Ativo identificado; operação de publicação e métricas ainda não validadas.";
  entry.primaryPendency = pendency;
  entry.impact = ["Canal identificado, mas operação completa ainda depende de validação de publicação e métricas."];
  unlockCapabilities(entry, new Set(["identified"]));
}

function unlockCapabilities(entry: ConnectionEntry, unlockedIds: Set<string>): void {
  entry.capabilities = entry.capabilities.map((capability) => ({
    ...capability,
    unlocked: unlockedIds.has(capability.id),
  }));
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
    default:
      return null;
  }
}

function mapPersistedAssetStatus(record: Record<string, unknown>): ConnectionState {
  const explicitStatus = readString(record.status);
  if (explicitStatus) return mapPersistedStatus(explicitStatus);

  const metadata = asRecord(record.metadata);
  const metadataStatus = readString(metadata?.status);
  if (metadataStatus) return mapPersistedStatus(metadataStatus);

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
