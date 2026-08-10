import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getPropertyById,
  listProperties,
} from "@/lib/yzi-imob/properties/repository";

import {
  buildPropertyPublicPayload,
  derivePropertyPublicSlug,
} from "./payload.ts";
import { evaluatePropertyPublicationReadiness } from "./readiness.ts";
import {
  ControlledFakeSitePublicationTransport,
  SITE_PUBLICATION_CONTRACT_VERSION,
  type SitePublicationTransport,
} from "./transport.ts";
import type {
  PropertyPublicationJob,
  PropertyPublicationMedia,
  PropertyPublicationReviewDecision,
  PropertyPublicationRevision,
  PropertyPublicationState,
  PropertyPublicationStatus,
  PropertyPublicationSyncResult,
  PropertyPublicationWorkspace,
  PropertyPublicPayload,
  SitePublicationGovernanceSummary,
} from "./types.ts";

const PUBLICATION_COLUMNS =
  "id, tenant_id, property_id, publication_channel, status, public_slug, public_url, current_revision_id, approved_revision_id, publication_version, scheduled_at, published_at, paused_at, unpublished_at, last_synced_at, sync_error_code, idempotency_key, created_by_user_id, approved_by_user_id, created_at, updated_at";

const REVISION_COLUMNS =
  "id, tenant_id, property_id, revision_number, public_slug, content_hash, status, review_observation, created_by_user_id, review_requested_at, decided_by_user_id, decided_at, created_at, updated_at";

const JOB_COLUMNS =
  "id, tenant_id, property_id, publication_id, operation, status, revision_id, publication_version, correlation_id, attempt_count, max_attempts, last_error_code, scheduled_at, started_at, completed_at";

const MEDIA_BASE_COLUMNS =
  "id, tenant_id, property_id, media_type, storage_bucket, storage_path, public_url, alt_text, sort_order, is_cover, is_publication_allowed, processing_status, environment_type, display_order, is_primary, eligible_for_carousel, eligible_for_video, media_status, orientation, width_px, height_px, human_note, exclusion_reason";
const MEDIA_COLUMNS = `${MEDIA_BASE_COLUMNS}, slot, original_filename, mime_type, file_extension, byte_size, source_kind, upload_state`;

type PublicationRow = {
  id: string;
  tenant_id: string;
  property_id: string;
  publication_channel: string;
  status: string;
  public_slug: string | null;
  public_url: string | null;
  current_revision_id: string | null;
  approved_revision_id: string | null;
  publication_version: number;
  scheduled_at: string | null;
  published_at: string | null;
  paused_at: string | null;
  unpublished_at: string | null;
  last_synced_at: string | null;
  sync_error_code: string | null;
  idempotency_key: string | null;
  created_by_user_id: string | null;
  approved_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

type RevisionRow = {
  id: string;
  tenant_id: string;
  property_id: string;
  revision_number: number;
  public_slug: string;
  content_hash: string;
  status: string;
  review_observation: string | null;
  created_by_user_id: string;
  review_requested_at: string;
  decided_by_user_id: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
};

type JobRow = {
  id: string;
  tenant_id: string;
  property_id: string;
  publication_id: string;
  operation: string;
  status: string;
  revision_id: string;
  publication_version: number;
  correlation_id: string;
  attempt_count: number;
  max_attempts: number;
  last_error_code: string | null;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
};

type MediaRow = {
  id: string;
  tenant_id: string;
  property_id: string;
  media_type: string;
  storage_bucket: string | null;
  storage_path: string | null;
  public_url: string | null;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  is_publication_allowed: boolean;
  processing_status: string;
  environment_type: string;
  display_order: number;
  is_primary: boolean;
  eligible_for_carousel: boolean;
  eligible_for_video: boolean;
  media_status: string;
  orientation: string;
  width_px: number | null;
  height_px: number | null;
  human_note: string | null;
  exclusion_reason: string | null;
  slot?: string | null;
  original_filename?: string | null;
  mime_type?: string | null;
  file_extension?: string | null;
  byte_size?: number | null;
  source_kind?: string | null;
  upload_state?: string | null;
};

export type PropertyPublicationRepositoryError =
  | "not_found"
  | "not_ready"
  | "read_failed"
  | "review_failed"
  | "decision_failed"
  | "enqueue_failed"
  | "sync_failed"
  | "state_change_failed"
  | "retry_failed";

export type PropertyPublicationRepositoryResult<T> =
  | { status: "ok"; value: T }
  | {
      status: "error";
      code: PropertyPublicationRepositoryError;
      detail?: string;
      blockers?: readonly string[];
    };

function mapState(row: PublicationRow): PropertyPublicationState {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    propertyId: row.property_id,
    publicationChannel: "site",
    status: row.status as PropertyPublicationStatus,
    publicSlug: row.public_slug,
    publicUrl: row.public_url,
    currentRevisionId: row.current_revision_id,
    approvedRevisionId: row.approved_revision_id,
    publicationVersion: row.publication_version,
    scheduledAt: row.scheduled_at,
    publishedAt: row.published_at,
    pausedAt: row.paused_at,
    unpublishedAt: row.unpublished_at,
    lastSyncedAt: row.last_synced_at,
    syncErrorCode: row.sync_error_code,
    idempotencyKey: row.idempotency_key,
    createdByUserId: row.created_by_user_id,
    approvedByUserId: row.approved_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRevision(row: RevisionRow): PropertyPublicationRevision {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    propertyId: row.property_id,
    revisionNumber: row.revision_number,
    publicSlug: row.public_slug,
    contentHash: row.content_hash,
    status: row.status as PropertyPublicationRevision["status"],
    reviewObservation: row.review_observation,
    createdByUserId: row.created_by_user_id,
    reviewRequestedAt: row.review_requested_at,
    decidedByUserId: row.decided_by_user_id,
    decidedAt: row.decided_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapJob(row: JobRow): PropertyPublicationJob {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    propertyId: row.property_id,
    publicationId: row.publication_id,
    operation: row.operation as PropertyPublicationJob["operation"],
    status: row.status as PropertyPublicationJob["status"],
    revisionId: row.revision_id,
    publicationVersion: row.publication_version,
    correlationId: row.correlation_id,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    lastErrorCode: row.last_error_code,
    scheduledAt: row.scheduled_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

function mapMedia(row: MediaRow): PropertyPublicationMedia {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    propertyId: row.property_id,
    mediaType: row.media_type as PropertyPublicationMedia["mediaType"],
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    url: row.public_url,
    altText: row.alt_text,
    sortOrder: row.sort_order,
    isCover: row.is_cover,
    isPublicationAllowed: row.is_publication_allowed,
    processingStatus:
      row.processing_status as PropertyPublicationMedia["processingStatus"],
    environmentType:
      row.environment_type as PropertyPublicationMedia["environmentType"],
    displayOrder: row.display_order,
    isPrimary: row.is_primary,
    eligibleForCarousel: row.eligible_for_carousel,
    eligibleForVideo: row.eligible_for_video,
    mediaStatus: row.media_status as PropertyPublicationMedia["mediaStatus"],
    orientation: row.orientation as PropertyPublicationMedia["orientation"],
    width: row.width_px,
    height: row.height_px,
    humanNote: row.human_note,
    exclusionReason: row.exclusion_reason,
    slot: (row.slot ?? null) as PropertyPublicationMedia["slot"],
    originalFilename: row.original_filename ?? null,
    mimeType: row.mime_type ?? null,
    fileExtension: row.file_extension ?? null,
    byteSize: row.byte_size ?? null,
    sourceKind: (row.source_kind ?? null) as PropertyPublicationMedia["sourceKind"],
    uploadState: (row.upload_state ?? null) as PropertyPublicationMedia["uploadState"],
  };
}

export async function listPropertyPublicationMedia(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
): Promise<PropertyPublicationRepositoryResult<readonly PropertyPublicationMedia[]>> {
  const extended = await supabase
    .from("yzi_imob_property_media")
    .select(MEDIA_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("property_id", propertyId)
    .neq("upload_state", "cancelled")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!extended.error) {
    return {
      status: "ok",
      value: ((extended.data as unknown as MediaRow[] | null) ?? []).map(mapMedia),
    };
  }

  // Compatibilidade de rollout: antes da migration local ser aplicada, a
  // leitura legada continua funcionando e a capability de upload fica false.
  const { data, error } = await supabase
    .from("yzi_imob_property_media")
    .select(MEDIA_BASE_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return { status: "error", code: "read_failed", detail: error.message };
  return {
    status: "ok",
    value: ((data as unknown as MediaRow[] | null) ?? []).map(mapMedia),
  };
}

export async function getPropertyPublicationWorkspace(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
): Promise<PropertyPublicationRepositoryResult<PropertyPublicationWorkspace>> {
  const [stateResult, revisionResult, jobResult, mediaResult] = await Promise.all([
    supabase
      .from("yzi_imob_property_publications")
      .select(PUBLICATION_COLUMNS)
      .eq("tenant_id", tenantId)
      .eq("property_id", propertyId)
      .eq("publication_channel", "site")
      .maybeSingle(),
    supabase
      .from("yzi_imob_property_publication_revisions")
      .select(REVISION_COLUMNS)
      .eq("tenant_id", tenantId)
      .eq("property_id", propertyId)
      .order("revision_number", { ascending: false })
      .limit(20),
    supabase
      .from("yzi_imob_property_publication_jobs")
      .select(JOB_COLUMNS)
      .eq("tenant_id", tenantId)
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    listPropertyPublicationMedia(supabase, tenantId, propertyId),
  ]);

  if (stateResult.error || revisionResult.error || jobResult.error) {
    return {
      status: "error",
      code: "read_failed",
      detail:
        stateResult.error?.message ??
        revisionResult.error?.message ??
        jobResult.error?.message,
    };
  }
  if (mediaResult.status === "error") return mediaResult;

  const state = stateResult.data
    ? mapState(stateResult.data as unknown as PublicationRow)
    : null;
  const revisions = (
    (revisionResult.data as unknown as RevisionRow[] | null) ?? []
  ).map(mapRevision);
  const latestJob = jobResult.data
    ? mapJob(jobResult.data as unknown as JobRow)
    : null;

  return {
    status: "ok",
    value: {
      state,
      currentRevision:
        revisions.find((revision) => revision.id === state?.currentRevisionId) ?? null,
      approvedRevision:
        revisions.find((revision) => revision.id === state?.approvedRevisionId) ?? null,
      latestJob,
      media: mediaResult.value,
    },
  };
}

export async function requestPropertyPublicationReview(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
  publicSlug?: string,
): Promise<
  PropertyPublicationRepositoryResult<{
    publicationId: string;
    revisionId: string;
    revisionNumber: number;
    publicationStatus: string;
  }>
> {
  const [propertyResult, workspaceResult] = await Promise.all([
    getPropertyById(supabase, tenantId, propertyId),
    getPropertyPublicationWorkspace(supabase, tenantId, propertyId),
  ]);
  if (propertyResult.status === "error") {
    return { status: "error", code: "not_found" };
  }
  if (workspaceResult.status === "error") return workspaceResult;

  const slug = publicSlug?.trim() || derivePropertyPublicSlug(propertyResult.value);
  const payloadResult = buildPropertyPublicPayload({
    property: propertyResult.value,
    publicSlug: slug,
    media: workspaceResult.value.media,
    publicationVersion:
      (workspaceResult.value.state?.publicationVersion ?? 0) + 1,
  });
  if (payloadResult.status === "not_ready") {
    return {
      status: "error",
      code: "not_ready",
      blockers: payloadResult.readiness.blockers,
    };
  }

  const { data, error } = await supabase.rpc(
    "request_yzi_imob_property_publication_review",
    {
      p_property_id: propertyId,
      p_public_slug: slug,
      p_content_snapshot: payloadResult.payload,
      p_content_hash: payloadResult.contentHash,
    },
  );
  if (error) return { status: "error", code: "review_failed", detail: error.message };

  const row = (Array.isArray(data) ? data[0] : data) as
    | {
        publication_id: string;
        revision_id: string;
        revision_number: number;
        publication_status: string;
      }
    | null;
  if (!row) return { status: "error", code: "review_failed" };
  return {
    status: "ok",
    value: {
      publicationId: row.publication_id,
      revisionId: row.revision_id,
      revisionNumber: row.revision_number,
      publicationStatus: row.publication_status,
    },
  };
}

export async function decidePropertyPublicationRevision(
  supabase: SupabaseClient,
  revisionId: string,
  decision: PropertyPublicationReviewDecision,
  observation?: string | null,
): Promise<PropertyPublicationRepositoryResult<{ publicationStatus: string }>> {
  const { data, error } = await supabase.rpc(
    "decide_yzi_imob_property_publication_revision",
    {
      p_revision_id: revisionId,
      p_decision: decision,
      p_observation: observation?.trim() || null,
    },
  );
  if (error) return { status: "error", code: "decision_failed", detail: error.message };
  const row = (Array.isArray(data) ? data[0] : data) as
    | { publication_status: string }
    | null;
  if (!row) return { status: "error", code: "decision_failed" };
  return { status: "ok", value: { publicationStatus: row.publication_status } };
}

export async function enqueuePropertyPublication(
  supabase: SupabaseClient,
  propertyId: string,
  operation: "publish" | "update",
  idempotencyKey: string,
): Promise<
  PropertyPublicationRepositoryResult<{
    jobId: string;
    publicationId: string;
    jobStatus: string;
    publicationVersion: number;
    reused: boolean;
  }>
> {
  const { data, error } = await supabase.rpc(
    "enqueue_yzi_imob_property_publication",
    {
      p_property_id: propertyId,
      p_operation: operation,
      p_idempotency_key: idempotencyKey,
      p_scheduled_at: new Date().toISOString(),
    },
  );
  if (error) return { status: "error", code: "enqueue_failed", detail: error.message };
  const row = (Array.isArray(data) ? data[0] : data) as
    | {
        job_id: string;
        publication_id: string;
        job_status: string;
        publication_version: number;
        reused: boolean;
      }
    | null;
  if (!row) return { status: "error", code: "enqueue_failed" };
  return {
    status: "ok",
    value: {
      jobId: row.job_id,
      publicationId: row.publication_id,
      jobStatus: row.job_status,
      publicationVersion: row.publication_version,
      reused: row.reused,
    },
  };
}

async function getApprovedPayloadForJob(
  supabase: SupabaseClient,
  tenantId: string,
  jobId: string,
): Promise<
  | {
      status: "ok";
      job: PropertyPublicationJob;
      payload: PropertyPublicPayload;
    }
  | { status: "error"; detail?: string }
> {
  const { data, error } = await supabase
    .from("yzi_imob_property_publication_jobs")
    .select(
      `${JOB_COLUMNS}, yzi_imob_property_publication_revisions!inner(content_snapshot, status)`,
    )
    .eq("tenant_id", tenantId)
    .eq("id", jobId)
    .eq("yzi_imob_property_publication_revisions.status", "approved")
    .maybeSingle();
  if (error || !data) return { status: "error", detail: error?.message };

  const record = data as unknown as JobRow & {
    yzi_imob_property_publication_revisions:
      | { content_snapshot: PropertyPublicPayload; status: string }
      | { content_snapshot: PropertyPublicPayload; status: string }[];
  };
  const revision = Array.isArray(record.yzi_imob_property_publication_revisions)
    ? record.yzi_imob_property_publication_revisions[0]
    : record.yzi_imob_property_publication_revisions;
  if (!revision || revision.status !== "approved") return { status: "error" };
  return { status: "ok", job: mapJob(record), payload: revision.content_snapshot };
}

export async function simulatePropertyPublicationSync(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
  operation: "publish" | "update",
  idempotencyKey: string,
  transport: SitePublicationTransport = new ControlledFakeSitePublicationTransport(),
): Promise<PropertyPublicationRepositoryResult<PropertyPublicationSyncResult>> {
  const enqueueResult = await enqueuePropertyPublication(
    supabase,
    propertyId,
    operation,
    idempotencyKey,
  );
  if (enqueueResult.status === "error") return enqueueResult;

  const approvedPayload = await getApprovedPayloadForJob(
    supabase,
    tenantId,
    enqueueResult.value.jobId,
  );
  if (approvedPayload.status === "error") {
    return {
      status: "error",
      code: "sync_failed",
      detail: approvedPayload.detail,
    };
  }

  if (approvedPayload.job.status === "succeeded") {
    const workspace = await getPropertyPublicationWorkspace(
      supabase,
      tenantId,
      propertyId,
    );
    if (workspace.status === "error" || !workspace.value.state?.publicUrl) {
      return { status: "error", code: "sync_failed" };
    }
    return {
      status: "ok",
      value: {
        status: "synced",
        publicationId: approvedPayload.job.publicationId,
        jobId: approvedPayload.job.id,
        publicationVersion: approvedPayload.job.publicationVersion,
        publicUrl: workspace.value.state.publicUrl,
      },
    };
  }

  const startResult = await supabase.rpc(
    "mark_yzi_imob_property_publication_started",
    { p_job_id: approvedPayload.job.id },
  );
  if (startResult.error) {
    return { status: "error", code: "sync_failed", detail: startResult.error.message };
  }

  let response;
  try {
    response = await transport.send({
      contractVersion: SITE_PUBLICATION_CONTRACT_VERSION,
      idempotencyKey,
      correlationId: approvedPayload.job.correlationId,
      origin: "yzi_imob",
      operation,
      payload: {
        ...approvedPayload.payload,
        publication_version: approvedPayload.job.publicationVersion,
      },
    });
  } catch {
    response = {
      status: "rejected" as const,
      errorCode: "transport_unavailable" as const,
      retryable: true,
      correlationId: approvedPayload.job.correlationId,
    };
  }

  if (response.status === "rejected") {
    await supabase.rpc("mark_yzi_imob_property_publication_failed", {
      p_job_id: approvedPayload.job.id,
      p_error_code: response.errorCode,
    });
    return {
      status: "ok",
      value: {
        status: "failed",
        publicationId: approvedPayload.job.publicationId,
        jobId: approvedPayload.job.id,
        errorCode: response.errorCode,
        retryEligible:
          response.retryable &&
          approvedPayload.job.attemptCount < approvedPayload.job.maxAttempts,
      },
    };
  }

  const syncResult = await supabase.rpc(
    "mark_yzi_imob_property_publication_synced",
    {
      p_job_id: approvedPayload.job.id,
      p_public_url: response.publicUrl,
    },
  );
  if (syncResult.error) {
    return { status: "error", code: "sync_failed", detail: syncResult.error.message };
  }

  return {
    status: "ok",
    value: {
      status: "synced",
      publicationId: approvedPayload.job.publicationId,
      jobId: approvedPayload.job.id,
      publicationVersion: approvedPayload.job.publicationVersion,
      publicUrl: response.publicUrl,
    },
  };
}

export async function setPropertyPublicationAvailability(
  supabase: SupabaseClient,
  propertyId: string,
  action: "pause" | "unpublish",
): Promise<PropertyPublicationRepositoryResult<{ publicationStatus: string }>> {
  const { data, error } = await supabase.rpc(
    "set_yzi_imob_property_publication_availability",
    { p_property_id: propertyId, p_action: action },
  );
  if (error) {
    return { status: "error", code: "state_change_failed", detail: error.message };
  }
  const row = (Array.isArray(data) ? data[0] : data) as
    | { publication_status: string }
    | null;
  if (!row) return { status: "error", code: "state_change_failed" };
  return { status: "ok", value: { publicationStatus: row.publication_status } };
}

export async function retryPropertyPublication(
  supabase: SupabaseClient,
  jobId: string,
  retryIdempotencyKey: string,
): Promise<
  PropertyPublicationRepositoryResult<{
    jobId: string;
    jobStatus: string;
    publicationVersion: number;
    reused: boolean;
  }>
> {
  const { data, error } = await supabase.rpc(
    "retry_yzi_imob_property_publication",
    {
      p_job_id: jobId,
      p_retry_idempotency_key: retryIdempotencyKey,
    },
  );
  if (error) return { status: "error", code: "retry_failed", detail: error.message };
  const row = (Array.isArray(data) ? data[0] : data) as
    | {
        job_id: string;
        job_status: string;
        publication_version: number;
        reused: boolean;
      }
    | null;
  if (!row) return { status: "error", code: "retry_failed" };
  return {
    status: "ok",
    value: {
      jobId: row.job_id,
      jobStatus: row.job_status,
      publicationVersion: row.publication_version,
      reused: row.reused,
    },
  };
}

export async function getSitePublicationGovernanceSummary(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<PropertyPublicationRepositoryResult<SitePublicationGovernanceSummary>> {
  const propertiesResult = await listProperties(supabase, tenantId, { limit: 200 });
  if (propertiesResult.status === "error") {
    return { status: "error", code: "read_failed", detail: propertiesResult.detail };
  }

  const [statesResult, mediaResult] = await Promise.all([
    supabase
      .from("yzi_imob_property_publications")
      .select(PUBLICATION_COLUMNS)
      .eq("tenant_id", tenantId)
      .eq("publication_channel", "site"),
    supabase
      .from("yzi_imob_property_media")
      .select(MEDIA_COLUMNS)
      .eq("tenant_id", tenantId),
  ]);
  if (statesResult.error || mediaResult.error) {
    return {
      status: "error",
      code: "read_failed",
      detail: statesResult.error?.message ?? mediaResult.error?.message,
    };
  }

  const states = new Map(
    (((statesResult.data as unknown as PublicationRow[] | null) ?? []).map(mapState)).map(
      (state) => [state.propertyId, state],
    ),
  );
  const mediaByProperty = new Map<string, PropertyPublicationMedia[]>();
  for (const row of (mediaResult.data as unknown as (MediaRow & { property_id: string })[] | null) ??
    []) {
    const items = mediaByProperty.get(row.property_id) ?? [];
    items.push(mapMedia(row));
    mediaByProperty.set(row.property_id, items);
  }

  const items = propertiesResult.value.items.map((property) => {
    const state = states.get(property.id);
    const readiness = evaluatePropertyPublicationReadiness({
      property,
      publicSlug: state?.publicSlug ?? derivePropertyPublicSlug(property),
      media: mediaByProperty.get(property.id) ?? [],
    });
    return {
      propertyId: property.id,
      propertyTitle: property.title,
      status: state?.status ?? (readiness.ready ? "ready_to_publish" : "incomplete"),
      publicUrl: state?.publicUrl ?? null,
      lastSyncedAt: state?.lastSyncedAt ?? null,
      blockers: readiness.blockers,
    };
  });

  return {
    status: "ok",
    value: {
      counts: {
        ready: items.filter((item) => item.status === "ready_to_publish").length,
        published: items.filter((item) => item.status === "published").length,
        updatePending: items.filter((item) => item.status === "update_pending").length,
        failed: items.filter((item) => item.status === "failed").length,
        paused: items.filter((item) => item.status === "paused").length,
      },
      items,
    },
  };
}
