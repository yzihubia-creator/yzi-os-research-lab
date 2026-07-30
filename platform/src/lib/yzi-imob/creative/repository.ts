import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  ACTIVE_CREATIVE_DELIVERABLE_TYPES,
  type CreateCreativeRequestInput,
  type CreativeAsset,
  type CreativeDeliverable,
  type CreativeGenerationEvent,
  type CreativeGenerationJob,
  type CreativeRequest,
  type CreativeRevision,
  type CreativeRevisionDecision,
  type CreativeWorkspace,
} from "./types.ts";
import type { CarouselAdjustment } from "./carousel/types.ts";

const REQUEST_COLUMNS =
  "id, tenant_id, property_id, status, objective, desired_formats, intended_channels, context, idempotency_key, created_by_user_id, created_at, updated_at, completed_at";
const DELIVERABLE_COLUMNS =
  "id, tenant_id, property_id, request_id, deliverable_type, status, current_revision_id, approved_revision_id, publication_eligible, created_at, updated_at";
const REVISION_COLUMNS =
  "id, tenant_id, property_id, request_id, deliverable_id, source_revision_id, revision_number, status, content_snapshot, content_hash, review_observation, created_by_user_id, decided_by_user_id, decided_at, created_at, updated_at";
const ASSET_COLUMNS =
  "id, tenant_id, property_id, request_id, deliverable_id, revision_id, source_property_media_id, asset_role, media_type, synthetic_uri, content_hash, asset_position, asset_kind, storage_state, publication_state, storage_bucket, object_path, metadata, created_at";
const JOB_COLUMNS =
  "id, tenant_id, property_id, request_id, status, idempotency_key, correlation_id, attempt_count, max_attempts, last_error_code, started_at, completed_at, created_at, updated_at";
const EVENT_COLUMNS =
  "id, tenant_id, property_id, request_id, deliverable_id, revision_id, job_id, event_type, correlation_id, metadata, created_at";

type Row = Record<string, unknown>;

export type CreativeRepositoryError =
  | "invalid_input"
  | "not_found"
  | "read_failed"
  | "create_failed"
  | "generation_failed"
  | "decision_failed";

export type CreativeRepositoryResult<T> =
  | { status: "ok"; value: T }
  | { status: "error"; code: CreativeRepositoryError; detail?: string };

function text(row: Row, key: string): string {
  return String(row[key] ?? "");
}

function optionalText(row: Row, key: string): string | null {
  return row[key] === null || row[key] === undefined ? null : String(row[key]);
}

function object(row: Row, key: string): Record<string, unknown> {
  const value = row[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mapRequest(row: Row): CreativeRequest {
  return {
    id: text(row, "id"),
    tenantId: text(row, "tenant_id"),
    propertyId: text(row, "property_id"),
    status: text(row, "status") as CreativeRequest["status"],
    objective: text(row, "objective"),
    desiredFormats: (row.desired_formats ?? []) as CreativeRequest["desiredFormats"],
    intendedChannels: (row.intended_channels ?? []) as readonly string[],
    context: object(row, "context"),
    idempotencyKey: text(row, "idempotency_key"),
    createdByUserId: text(row, "created_by_user_id"),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
    completedAt: optionalText(row, "completed_at"),
  };
}

function mapDeliverable(row: Row): CreativeDeliverable {
  return {
    id: text(row, "id"),
    tenantId: text(row, "tenant_id"),
    propertyId: text(row, "property_id"),
    requestId: text(row, "request_id"),
    deliverableType: text(row, "deliverable_type") as CreativeDeliverable["deliverableType"],
    status: text(row, "status") as CreativeDeliverable["status"],
    currentRevisionId: optionalText(row, "current_revision_id"),
    approvedRevisionId: optionalText(row, "approved_revision_id"),
    publicationEligible: Boolean(row.publication_eligible),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
  };
}

function mapRevision(row: Row): CreativeRevision {
  return {
    id: text(row, "id"),
    tenantId: text(row, "tenant_id"),
    propertyId: text(row, "property_id"),
    requestId: text(row, "request_id"),
    deliverableId: text(row, "deliverable_id"),
    sourceRevisionId: optionalText(row, "source_revision_id"),
    revisionNumber: Number(row.revision_number),
    status: text(row, "status") as CreativeRevision["status"],
    contentSnapshot: row.content_snapshot as CreativeRevision["contentSnapshot"],
    contentHash: text(row, "content_hash"),
    reviewObservation: optionalText(row, "review_observation"),
    createdByUserId: text(row, "created_by_user_id"),
    decidedByUserId: optionalText(row, "decided_by_user_id"),
    decidedAt: optionalText(row, "decided_at"),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
  };
}

function mapAsset(row: Row): CreativeAsset {
  return {
    id: text(row, "id"),
    tenantId: text(row, "tenant_id"),
    propertyId: text(row, "property_id"),
    requestId: text(row, "request_id"),
    deliverableId: optionalText(row, "deliverable_id"),
    revisionId: optionalText(row, "revision_id"),
    sourcePropertyMediaId: optionalText(row, "source_property_media_id"),
    assetRole: text(row, "asset_role") as CreativeAsset["assetRole"],
    mediaType: text(row, "media_type") as CreativeAsset["mediaType"],
    syntheticUri: optionalText(row, "synthetic_uri"),
    contentHash: optionalText(row, "content_hash"),
    assetPosition: row.asset_position === null || row.asset_position === undefined
      ? null
      : Number(row.asset_position),
    assetKind: text(row, "asset_kind") as CreativeAsset["assetKind"],
    storageState: text(row, "storage_state") as CreativeAsset["storageState"],
    publicationState: text(row, "publication_state") as CreativeAsset["publicationState"],
    storageBucket: optionalText(row, "storage_bucket") as CreativeAsset["storageBucket"],
    objectPath: optionalText(row, "object_path"),
    metadata: object(row, "metadata"),
    createdAt: text(row, "created_at"),
  };
}

function mapJob(row: Row): CreativeGenerationJob {
  return {
    id: text(row, "id"),
    tenantId: text(row, "tenant_id"),
    propertyId: text(row, "property_id"),
    requestId: text(row, "request_id"),
    status: text(row, "status") as CreativeGenerationJob["status"],
    idempotencyKey: text(row, "idempotency_key"),
    correlationId: text(row, "correlation_id"),
    attemptCount: Number(row.attempt_count),
    maxAttempts: Number(row.max_attempts),
    lastErrorCode: optionalText(row, "last_error_code"),
    startedAt: optionalText(row, "started_at"),
    completedAt: optionalText(row, "completed_at"),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
  };
}

function mapEvent(row: Row): CreativeGenerationEvent {
  return {
    id: text(row, "id"),
    tenantId: text(row, "tenant_id"),
    propertyId: text(row, "property_id"),
    requestId: text(row, "request_id"),
    deliverableId: optionalText(row, "deliverable_id"),
    revisionId: optionalText(row, "revision_id"),
    jobId: optionalText(row, "job_id"),
    eventType: text(row, "event_type"),
    correlationId: optionalText(row, "correlation_id"),
    metadata: object(row, "metadata"),
    createdAt: text(row, "created_at"),
  };
}

function isValidInput(input: CreateCreativeRequestInput): boolean {
  const formats = [...new Set(input.formats)];
  const channels = [...new Set(input.intendedChannels.map((channel) => channel.trim().toLowerCase()))];
  return (
    input.objective.trim().length >= 3 &&
    input.objective.trim().length <= 1000 &&
    formats.length === 1 &&
    formats.every((format) =>
      (ACTIVE_CREATIVE_DELIVERABLE_TYPES as readonly string[]).includes(format),
    ) &&
    channels.length >= 1 &&
    channels.length <= 10 &&
    channels.every((channel) => /^[a-z0-9_]{1,40}$/.test(channel)) &&
    input.idempotencyKey.trim().length >= 1 &&
    input.idempotencyKey.trim().length <= 200
  );
}

export async function getCreativeWorkspace(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
  requestId?: string,
): Promise<CreativeRepositoryResult<CreativeWorkspace>> {
  let requestQuery = supabase
    .from("yzi_imob_creative_requests")
    .select(REQUEST_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("property_id", propertyId);

  requestQuery = requestId
    ? requestQuery.eq("id", requestId)
    : requestQuery.order("created_at", { ascending: false }).limit(1);

  const requestResult = await requestQuery.maybeSingle();
  if (requestResult.error) {
    return { status: "error", code: "read_failed", detail: requestResult.error.message };
  }
  if (!requestResult.data) {
    return {
      status: "ok",
      value: {
        request: null,
        deliverables: [],
        revisions: [],
        assets: [],
        latestJob: null,
        events: [],
      },
    };
  }

  const request = mapRequest(requestResult.data as unknown as Row);
  const [deliverablesResult, revisionsResult, assetsResult, jobResult, eventsResult] =
    await Promise.all([
      supabase
        .from("yzi_imob_creative_deliverables")
        .select(DELIVERABLE_COLUMNS)
        .eq("tenant_id", tenantId)
        .eq("property_id", propertyId)
        .eq("request_id", request.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("yzi_imob_creative_revisions")
        .select(REVISION_COLUMNS)
        .eq("tenant_id", tenantId)
        .eq("property_id", propertyId)
        .eq("request_id", request.id)
        .order("revision_number", { ascending: false }),
      supabase
        .from("yzi_imob_creative_assets")
        .select(ASSET_COLUMNS)
        .eq("tenant_id", tenantId)
        .eq("property_id", propertyId)
        .eq("request_id", request.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("yzi_imob_creative_generation_jobs")
        .select(JOB_COLUMNS)
        .eq("tenant_id", tenantId)
        .eq("property_id", propertyId)
        .eq("request_id", request.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("yzi_imob_creative_generation_events")
        .select(EVENT_COLUMNS)
        .eq("tenant_id", tenantId)
        .eq("property_id", propertyId)
        .eq("request_id", request.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  const error =
    deliverablesResult.error ??
    revisionsResult.error ??
    assetsResult.error ??
    jobResult.error ??
    eventsResult.error;
  if (error) return { status: "error", code: "read_failed", detail: error.message };

  return {
    status: "ok",
    value: {
      request,
      deliverables: ((deliverablesResult.data as unknown as Row[] | null) ?? []).map(
        mapDeliverable,
      ),
      revisions: ((revisionsResult.data as unknown as Row[] | null) ?? []).map(mapRevision),
      assets: ((assetsResult.data as unknown as Row[] | null) ?? []).map(mapAsset),
      latestJob: jobResult.data ? mapJob(jobResult.data as unknown as Row) : null,
      events: ((eventsResult.data as unknown as Row[] | null) ?? []).map(mapEvent),
    },
  };
}

export async function createCreativeRequestAndGenerate(
  supabase: SupabaseClient,
  tenantId: string,
  input: CreateCreativeRequestInput,
): Promise<CreativeRepositoryResult<CreativeWorkspace>> {
  if (!isValidInput(input)) return { status: "error", code: "invalid_input" };

  const formats = [...new Set(input.formats)].sort();
  const channels = [...new Set(input.intendedChannels.map((channel) => channel.trim().toLowerCase()))]
    .sort();
  const mediaResult = await supabase
    .from("yzi_imob_property_media")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("property_id", input.propertyId)
    .eq("media_type", "image")
    .eq("is_publication_allowed", true)
    .eq("processing_status", "ready")
    .order("is_cover", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (mediaResult.error) {
    return { status: "error", code: "read_failed", detail: mediaResult.error.message };
  }
  const sourceMediaIds = ((mediaResult.data as { id: string }[] | null) ?? []).map(
    (media) => media.id,
  );
  if (!sourceMediaIds.length) return { status: "error", code: "invalid_input" };
  const { data, error } = await supabase.rpc("create_yzi_imob_creative_request", {
    p_property_id: input.propertyId,
    p_objective: input.objective.trim(),
    p_formats: formats,
    p_channels: channels,
    p_source_media_ids: sourceMediaIds,
    p_context: input.context ?? {},
    p_idempotency_key: input.idempotencyKey.trim(),
  });
  if (error) return { status: "error", code: "create_failed", detail: error.message };

  const created = (Array.isArray(data) ? data[0] : data) as
    | { request_id: string; job_id: string; request_status: string; reused: boolean }
    | null;
  if (!created) return { status: "error", code: "create_failed" };

  if (created.request_status === "in_review" || created.request_status === "completed") {
    return getCreativeWorkspace(supabase, tenantId, input.propertyId, created.request_id);
  }

  const startResult = await supabase.rpc("start_yzi_imob_creative_generation_job", {
    p_job_id: created.job_id,
  });
  if (startResult.error) {
    return { status: "error", code: "generation_failed", detail: startResult.error.message };
  }
  const started = (Array.isArray(startResult.data) ? startResult.data[0] : startResult.data) as
    | { job_status: string }
    | null;
  if (started?.job_status === "succeeded") {
    return getCreativeWorkspace(supabase, tenantId, input.propertyId, created.request_id);
  }

  const completion = await supabase.rpc("complete_yzi_imob_creative_generation_job", {
    p_job_id: created.job_id,
  });
  if (completion.error) {
    await supabase.rpc("fail_yzi_imob_creative_generation_job", {
      p_job_id: created.job_id,
      p_error_code: "synthetic_completion_failed",
    });
    return {
      status: "error",
      code: "generation_failed",
      detail: completion.error.message,
    };
  }

  return getCreativeWorkspace(supabase, tenantId, input.propertyId, created.request_id);
}

export async function requestCreativeCarouselRevision(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
  revisionId: string,
  adjustment: CarouselAdjustment,
  idempotencyKey: string,
): Promise<CreativeRepositoryResult<CreativeWorkspace>> {
  if (
    !revisionId ||
    !idempotencyKey ||
    idempotencyKey.length > 200 ||
    adjustment.cardPosition < 1 ||
    adjustment.cardPosition > 7
  ) {
    return { status: "error", code: "invalid_input" };
  }

  const { data, error } = await supabase.rpc("request_yzi_imob_creative_carousel_revision", {
    p_revision_id: revisionId,
    p_adjustment_kind: adjustment.kind,
    p_card_position: adjustment.cardPosition,
    p_replacement_media_id:
      "replacementMediaId" in adjustment ? adjustment.replacementMediaId : null,
    p_observation: adjustment.note?.trim() || null,
    p_idempotency_key: idempotencyKey.trim(),
  });
  if (error || !data) {
    return { status: "error", code: "generation_failed", detail: error?.message };
  }
  const queued = (Array.isArray(data) ? data[0] : data) as { job_id?: string } | null;
  if (!queued?.job_id) return { status: "error", code: "generation_failed" };
  const start = await supabase.rpc("start_yzi_imob_creative_generation_job", {
    p_job_id: queued.job_id,
  });
  if (start.error) {
    return { status: "error", code: "generation_failed", detail: start.error.message };
  }
  const complete = await supabase.rpc("complete_yzi_imob_creative_generation_job", {
    p_job_id: queued.job_id,
  });
  if (complete.error) {
    return { status: "error", code: "generation_failed", detail: complete.error.message };
  }
  return getCreativeWorkspace(supabase, tenantId, propertyId);
}

export async function decideCreativeRevision(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
  revisionId: string,
  decision: CreativeRevisionDecision,
  observation?: string | null,
): Promise<CreativeRepositoryResult<CreativeWorkspace>> {
  if (
    !["approved", "changes_requested", "rejected"].includes(decision) ||
    (decision !== "approved" && !observation?.trim())
  ) {
    return { status: "error", code: "invalid_input" };
  }

  const { data, error } = await supabase.rpc("decide_yzi_imob_creative_revision", {
    p_revision_id: revisionId,
    p_decision: decision,
    p_observation: observation?.trim() || null,
  });
  if (error || !data) {
    return { status: "error", code: "decision_failed", detail: error?.message };
  }

  return getCreativeWorkspace(supabase, tenantId, propertyId);
}
