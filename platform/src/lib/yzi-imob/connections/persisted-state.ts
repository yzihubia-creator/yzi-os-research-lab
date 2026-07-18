import {
  CONNECTIONS_CATALOG,
} from "./catalog.ts";
import type { ConnectionChannel, ConnectionEntry, ConnectionState } from "./types.ts";

type SafeConnectionState = Pick<
  ConnectionEntry,
  "id" | "state" | "lastCheckedAt" | "nextAction" | "displayName" | "healthReason"
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
  | "whatsapp_business_account"
  | "whatsapp_phone_number";

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

    parsed.push({
      id: visualId,
      state: mapPersistedStatus(readString(record.status)),
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

  return catalog.map((entry) => {
    const persistedConnection = persistedById.get(entry.id);
    if (!persistedConnection) {
      return entry.state === "em-breve" ? copyEntry(entry) : { ...copyEntry(entry), state: "nao-configurado" };
    }

    const mergedEntry: ConnectionEntry = {
      ...copyEntry(entry),
      state: entry.state === "em-breve" ? "em-breve" : persistedConnection.state,
      lastCheckedAt: persistedConnection.lastCheckedAt,
      nextAction: persistedConnection.nextAction,
      displayName: persistedConnection.displayName,
      healthReason: persistedConnection.healthReason,
    };

    if (entry.id === "meta" && entry.channels) {
      mergedEntry.channels = mergeMetaChannels(entry.channels, persistedConnection.assets);
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
      status: mapPersistedStatus(readString(record.status)),
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

function readAssetKind(record: Record<string, unknown>): MetaAssetKind | null {
  const rawKind = readString(record.kind) ?? readString(record.asset_type);
  return rawKind && META_ASSET_KINDS.has(rawKind) ? (rawKind as MetaAssetKind) : null;
}

function readSafeMetadata(record: Record<string, unknown>): {
  displayName: string | null;
  healthReason: string | null;
} {
  const metadata = asRecord(record.metadata);
  return {
    displayName: readSafeText(record.display_name) ?? readSafeText(metadata?.display_name),
    healthReason: readSafeText(record.health_reason) ?? readSafeText(metadata?.health_reason),
  };
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
