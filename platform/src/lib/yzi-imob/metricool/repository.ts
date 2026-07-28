import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  MetricoolNetwork,
  MetricoolTargetProfile,
  SocialPublicationFormat,
  SocialPublicationStatus,
} from "./types.ts";

export type SocialPublicationListItem = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  revisionId: string;
  revisionNumber: number;
  targetNetworks: readonly MetricoolNetwork[];
  format: SocialPublicationFormat;
  scheduledAt: string;
  status: SocialPublicationStatus;
  externalUrl: string | null;
  publishedAt: string | null;
  errorCode: string | null;
  lastStatusSyncAt: string | null;
  lastMetricsSyncAt: string | null;
  metricCount: number;
  updatedAt: string;
};

export type SocialPublicationCandidate = {
  revisionId: string;
  revisionNumber: number;
  revisionStatus: "under_review" | "approved";
  propertyId: string;
  propertyTitle: string;
  previewCaption: string;
  mediaIds: readonly string[];
  mediaCount: number;
};

export type MetricoolMarketingWorkspace = {
  connection: {
    id: string | null;
    status: string;
    displayName: string | null;
    profiles: readonly MetricoolTargetProfile[];
    validatedAt: string | null;
    lastSyncAt: string | null;
  };
  candidates: readonly SocialPublicationCandidate[];
  publications: readonly SocialPublicationListItem[];
};

type QueryError = { message?: string } | null;
type QueryResult = PromiseLike<{ data: unknown; error: QueryError }>;
type QueryBuilder = {
  select(columns: string): QueryBuilder;
  eq(column: string, value: unknown): QueryBuilder;
  in(column: string, values: readonly unknown[]): QueryBuilder;
  order(column: string, options: { ascending: boolean }): QueryBuilder;
  limit(value: number): QueryResult;
};
type RepositoryClient = {
  from(table: string): QueryBuilder;
  rpc(
    fn: "get_yzi_imob_tenant_connections",
    args: { p_tenant_id: string },
  ): QueryResult;
};

export async function loadMetricoolMarketingWorkspace(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<{ status: "ok"; value: MetricoolMarketingWorkspace } | { status: "error" }> {
  const client = supabase as unknown as RepositoryClient;
  const [revisionsResult, publicationsResult, connectionsResult] = await Promise.all([
    client
      .from("yzi_imob_property_publication_revisions")
      .select("id, property_id, revision_number, status, content_snapshot")
      .eq("tenant_id", tenantId)
      .in("status", ["under_review", "approved"])
      .order("created_at", { ascending: false })
      .limit(40),
    client
      .from("yzi_imob_social_publications")
      .select(
        "id, property_id, publication_revision_id, target_networks, format, scheduled_at, status, external_url, published_at, error_code, last_status_sync_at, last_metrics_sync_at, updated_at",
      )
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(100),
    client.rpc("get_yzi_imob_tenant_connections", { p_tenant_id: tenantId }),
  ]);

  if (revisionsResult.error || publicationsResult.error || connectionsResult.error) {
    return { status: "error" };
  }

  const revisionRows = asRows(revisionsResult.data);
  const publicationRows = asRows(publicationsResult.data);
  const propertyIds = Array.from(new Set([
    ...revisionRows.map((row) => readUuid(row.property_id)).filter(isString),
    ...publicationRows.map((row) => readUuid(row.property_id)).filter(isString),
  ]));
  const revisionIds = publicationRows
    .map((row) => readUuid(row.publication_revision_id))
    .filter(isString);

  const [propertiesResult, mediaResult, metricsResult, publishedRevisionsResult] =
    await Promise.all([
      propertyIds.length
        ? client
            .from("yzi_imob_properties")
            .select("id, title")
            .eq("tenant_id", tenantId)
            .in("id", propertyIds)
            .order("title", { ascending: true })
            .limit(200)
        : emptyResult(),
      propertyIds.length
        ? client
            .from("yzi_imob_property_media")
            .select("id, property_id, media_type, public_url, is_publication_allowed, processing_status, sort_order")
            .eq("tenant_id", tenantId)
            .in("property_id", propertyIds)
            .order("sort_order", { ascending: true })
            .limit(400)
        : emptyResult(),
      client
        .from("yzi_imob_social_metrics")
        .select("social_publication_id")
        .eq("tenant_id", tenantId)
        .order("collected_at", { ascending: false })
        .limit(1000),
      revisionIds.length
        ? client
            .from("yzi_imob_property_publication_revisions")
            .select("id, revision_number")
            .eq("tenant_id", tenantId)
            .in("id", revisionIds)
            .order("revision_number", { ascending: false })
            .limit(100)
        : emptyResult(),
    ]);

  if (
    propertiesResult.error ||
    mediaResult.error ||
    metricsResult.error ||
    publishedRevisionsResult.error
  ) {
    return { status: "error" };
  }

  const titleByProperty = new Map(
    asRows(propertiesResult.data).flatMap((row) => {
      const id = readUuid(row.id);
      const title = readText(row.title, 200);
      return id && title ? [[id, title] as const] : [];
    }),
  );
  const mediaByProperty = groupReadyMedia(asRows(mediaResult.data));
  const revisionNumberById = new Map(
    asRows(publishedRevisionsResult.data).flatMap((row) => {
      const id = readUuid(row.id);
      const revisionNumber = readInteger(row.revision_number);
      return id && revisionNumber ? [[id, revisionNumber] as const] : [];
    }),
  );
  const metricCountByPublication = countMetrics(asRows(metricsResult.data));

  return {
    status: "ok",
    value: {
      connection: readMetricoolConnection(connectionsResult.data),
      candidates: revisionRows.flatMap((row) => {
        const revisionId = readUuid(row.id);
        const propertyId = readUuid(row.property_id);
        const revisionNumber = readInteger(row.revision_number);
        const revisionStatus =
          row.status === "approved" || row.status === "under_review" ? row.status : null;
        if (!revisionId || !propertyId || !revisionNumber || !revisionStatus) return [];
        const mediaIds = mediaByProperty.get(propertyId) ?? [];
        return [{
          revisionId,
          revisionNumber,
          revisionStatus,
          propertyId,
          propertyTitle: titleByProperty.get(propertyId) ?? "Imóvel",
          previewCaption: deriveCaption(row.content_snapshot),
          mediaIds,
          mediaCount: mediaIds.length,
        }];
      }),
      publications: publicationRows.flatMap((row) => {
        const id = readUuid(row.id);
        const propertyId = readUuid(row.property_id);
        const revisionId = readUuid(row.publication_revision_id);
        const scheduledAt = readDate(row.scheduled_at);
        const status = readSocialStatus(row.status);
        const updatedAt = readDate(row.updated_at);
        const format = row.format === "carousel" ? "carousel" : "single_image";
        const networks = readNetworks(row.target_networks);
        if (!id || !propertyId || !revisionId || !scheduledAt || !status || !updatedAt || !networks.length) {
          return [];
        }
        return [{
          id,
          propertyId,
          propertyTitle: titleByProperty.get(propertyId) ?? "Imóvel",
          revisionId,
          revisionNumber: revisionNumberById.get(revisionId) ?? 0,
          targetNetworks: networks,
          format,
          scheduledAt,
          status,
          externalUrl: readHttpsUrl(row.external_url),
          publishedAt: readDate(row.published_at),
          errorCode: readErrorCode(row.error_code),
          lastStatusSyncAt: readDate(row.last_status_sync_at),
          lastMetricsSyncAt: readDate(row.last_metrics_sync_at),
          metricCount: metricCountByPublication.get(id) ?? 0,
          updatedAt,
        }];
      }),
    },
  };
}

export function deriveCaption(snapshot: unknown): string {
  const row = asRecord(snapshot);
  const candidates = [
    readText(row?.short_summary, 1200),
    readText(row?.description, 1800),
    readText(row?.title, 300),
  ].filter(isString);
  const caption = candidates[0] ?? "Imóvel disponível.";
  return caption.slice(0, 2200);
}

function readMetricoolConnection(payload: unknown): MetricoolMarketingWorkspace["connection"] {
  const row = asRows(payload).find((item) => item.provider === "metricool");
  if (!row) {
    return {
      id: null,
      status: "not_configured",
      displayName: null,
      profiles: [],
      validatedAt: null,
      lastSyncAt: null,
    };
  }
  const profiles: MetricoolTargetProfile[] = asRows(row.assets).flatMap((asset) => {
    const id = readText(asset.external_account_id, 160);
    const network: MetricoolNetwork | null =
      asset.network === "instagram" || asset.network === "facebook"
      ? asset.network as MetricoolNetwork
      : null;
    if (!id || !network) return [];
    return [{
      id,
      network,
      displayName: readText(asset.account_label, 240) ?? `${network} ${id}`,
      connected: true,
    }];
  });
  return {
    id: readUuid(row.id),
    status: readText(row.status, 80) ?? "not_configured",
    displayName: readText(row.display_name, 160),
    profiles,
    validatedAt: readDate(row.validated_at),
    lastSyncAt: readDate(row.last_sync_at),
  };
}

function groupReadyMedia(rows: JsonRecord[]): Map<string, string[]> {
  const result = new Map<string, string[]>();
  for (const row of rows) {
    const id = readUuid(row.id);
    const propertyId = readUuid(row.property_id);
    if (
      !id ||
      !propertyId ||
      row.media_type !== "image" ||
      row.processing_status !== "ready" ||
      row.is_publication_allowed !== true ||
      !readHttpsUrl(row.public_url)
    ) {
      continue;
    }
    const existing = result.get(propertyId) ?? [];
    if (existing.length < 10) result.set(propertyId, [...existing, id]);
  }
  return result;
}

function countMetrics(rows: JsonRecord[]): Map<string, number> {
  const result = new Map<string, number>();
  for (const row of rows) {
    const publicationId = readUuid(row.social_publication_id);
    if (publicationId) result.set(publicationId, (result.get(publicationId) ?? 0) + 1);
  }
  return result;
}

type JsonRecord = Record<string, unknown>;

function asRows(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((item): item is JsonRecord => Boolean(asRecord(item)))
    : [];
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function readNetworks(value: unknown): MetricoolNetwork[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is MetricoolNetwork => item === "instagram" || item === "facebook",
      )
    : [];
}

function readSocialStatus(value: unknown): SocialPublicationStatus | null {
  return typeof value === "string" &&
    ["queued", "dispatching", "accepted", "scheduled", "publishing", "published", "failed", "cancelled"].includes(value)
    ? value as SocialPublicationStatus
    : null;
}

function readUuid(value: unknown): string | null {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

function readText(value: unknown, maxLength: number): string | null {
  return typeof value === "string" && value.trim() && value.length <= maxLength
    ? value.trim()
    : null;
}

function readDate(value: unknown): string | null {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return null;
  return new Date(value).toISOString();
}

function readInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

function readErrorCode(value: unknown): string | null {
  return typeof value === "string" && /^[a-z0-9_]{1,80}$/.test(value) ? value : null;
}

function readHttpsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? value : null;
  } catch {
    return null;
  }
}

function isString(value: string | null): value is string {
  return value !== null;
}

async function emptyResult(): Promise<{ data: unknown[]; error: null }> {
  return { data: [], error: null };
}
