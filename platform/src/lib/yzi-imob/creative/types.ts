export const CREATIVE_CONTRACT_VERSION = "2026-07-29.v1" as const;

export const ACTIVE_CREATIVE_DELIVERABLE_TYPES = ["carousel", "video_tour"] as const;
export type CreativeDeliverableType = (typeof ACTIVE_CREATIVE_DELIVERABLE_TYPES)[number];

// Reserved for later contract evolution. They are intentionally not accepted
// by the v1 request validator or database constraints.
export const RESERVED_CREATIVE_DELIVERABLE_TYPES = ["story_pack", "static_post"] as const;

export const CREATIVE_REQUEST_STATUS_VALUES = [
  "queued",
  "generating",
  "in_review",
  "changes_requested",
  "approved",
  "completed",
  "failed",
  "cancelled",
] as const;
export type CreativeRequestStatus = (typeof CREATIVE_REQUEST_STATUS_VALUES)[number];

export const CREATIVE_DELIVERABLE_STATUS_VALUES = [
  "planned",
  "generating",
  "in_review",
  "changes_requested",
  "approved",
  "failed",
  "cancelled",
] as const;
export type CreativeDeliverableStatus = (typeof CREATIVE_DELIVERABLE_STATUS_VALUES)[number];

export const CREATIVE_REVISION_STATUS_VALUES = [
  "in_review",
  "approved",
  "changes_requested",
  "rejected",
  "superseded",
] as const;
export type CreativeRevisionStatus = (typeof CREATIVE_REVISION_STATUS_VALUES)[number];

export const CREATIVE_JOB_STATUS_VALUES = [
  "queued",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
] as const;
export type CreativeJobStatus = (typeof CREATIVE_JOB_STATUS_VALUES)[number];

export type CreativeRevisionDecision = "approved" | "changes_requested" | "rejected";

export type CreativeRequest = {
  id: string;
  tenantId: string;
  propertyId: string;
  status: CreativeRequestStatus;
  objective: string;
  desiredFormats: readonly CreativeDeliverableType[];
  intendedChannels: readonly string[];
  context: Readonly<Record<string, unknown>>;
  idempotencyKey: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type CreativeDeliverable = {
  id: string;
  tenantId: string;
  propertyId: string;
  requestId: string;
  deliverableType: CreativeDeliverableType;
  status: CreativeDeliverableStatus;
  currentRevisionId: string | null;
  approvedRevisionId: string | null;
  publicationEligible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreativeRevision = {
  id: string;
  tenantId: string;
  propertyId: string;
  requestId: string;
  deliverableId: string;
  revisionNumber: number;
  status: CreativeRevisionStatus;
  contentSnapshot: CreativeContentSnapshot;
  contentHash: string;
  reviewObservation: string | null;
  createdByUserId: string;
  decidedByUserId: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreativeAsset = {
  id: string;
  tenantId: string;
  propertyId: string;
  requestId: string;
  deliverableId: string | null;
  revisionId: string | null;
  sourcePropertyMediaId: string | null;
  assetRole: "source_media" | "synthetic_output";
  mediaType: "image" | "video" | "structured";
  syntheticUri: string | null;
  contentHash: string | null;
  metadata: Readonly<Record<string, unknown>>;
  createdAt: string;
};

export type CreativeGenerationJob = {
  id: string;
  tenantId: string;
  propertyId: string;
  requestId: string;
  status: CreativeJobStatus;
  idempotencyKey: string;
  correlationId: string;
  attemptCount: number;
  maxAttempts: number;
  lastErrorCode: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreativeGenerationEvent = {
  id: string;
  tenantId: string;
  propertyId: string;
  requestId: string;
  deliverableId: string | null;
  revisionId: string | null;
  jobId: string | null;
  eventType: string;
  correlationId: string | null;
  metadata: Readonly<Record<string, unknown>>;
  createdAt: string;
};

export type CarouselBlueprint = {
  kind: "carousel_blueprint";
  slides: readonly {
    order: number;
    role: "cover" | "highlight" | "details" | "call_to_action";
    headline: string;
    sourceMediaId: string | null;
  }[];
};

export type VideoTourBlueprint = {
  kind: "video_tour_blueprint";
  durationSeconds: number;
  scenes: readonly {
    order: number;
    durationSeconds: number;
    direction: string;
    sourceMediaId: string;
  }[];
};

export type CreativeContentSnapshot = {
  contract_version: typeof CREATIVE_CONTRACT_VERSION;
  property_id: string;
  request_id: string;
  deliverable_id: string;
  deliverable_type: CreativeDeliverableType;
  channels: readonly string[];
  objective: string;
  synthetic: true;
  rendered: false;
  publication_contract: {
    property_id: string;
    creative_revision_required: true;
    external_publication_allowed: false;
  };
  blueprint: CarouselBlueprint | VideoTourBlueprint;
};

export type CreativeGenerationContext = {
  tenantId: string;
  property: {
    id: string;
    title: string;
    city: string | null;
    neighborhood: string | null;
    bedrooms: number | null;
    privateArea: number | null;
  };
  request: CreativeRequest;
  deliverables: readonly CreativeDeliverable[];
  sourceMedia: readonly {
    id: string;
    mediaType: "image" | "video";
    sortOrder: number;
    isCover: boolean;
  }[];
};

export type SyntheticCreativeOutput = {
  deliverable_type: CreativeDeliverableType;
  content_hash: string;
  content_snapshot: CreativeContentSnapshot;
};

export type CreateCreativeRequestInput = {
  propertyId: string;
  objective: string;
  formats: readonly CreativeDeliverableType[];
  intendedChannels: readonly string[];
  sourceMediaIds: readonly string[];
  context?: Readonly<Record<string, unknown>>;
  idempotencyKey: string;
};

export type CreativeWorkspace = {
  request: CreativeRequest | null;
  deliverables: readonly CreativeDeliverable[];
  revisions: readonly CreativeRevision[];
  assets: readonly CreativeAsset[];
  latestJob: CreativeGenerationJob | null;
  events: readonly CreativeGenerationEvent[];
};
