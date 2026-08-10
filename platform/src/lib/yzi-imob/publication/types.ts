export const PROPERTY_PUBLICATION_STATUS_VALUES = [
  "draft",
  "incomplete",
  "under_review",
  "changes_required",
  "ready_to_publish",
  "approved",
  "publishing",
  "published",
  "update_pending",
  "paused",
  "unpublished",
  "archived",
  "failed",
] as const;

export type PropertyPublicationStatus = (typeof PROPERTY_PUBLICATION_STATUS_VALUES)[number];

export const PROPERTY_PUBLICATION_REVISION_STATUS_VALUES = [
  "under_review",
  "approved",
  "rejected",
  "changes_required",
  "superseded",
] as const;

export type PropertyPublicationRevisionStatus =
  (typeof PROPERTY_PUBLICATION_REVISION_STATUS_VALUES)[number];

export const PROPERTY_PUBLICATION_EVENT_VALUES = [
  "review_requested",
  "approved",
  "rejected",
  "changes_requested",
  "publish_queued",
  "publish_started",
  "publish_succeeded",
  "publish_failed",
  "update_queued",
  "paused",
  "unpublished",
  "retry_requested",
] as const;

export type PropertyPublicationEvent = (typeof PROPERTY_PUBLICATION_EVENT_VALUES)[number];

export type PropertyPublicationChannel = "site";
export type PropertyPublicationOperation = "publish" | "update";
export type PropertyPublicationReviewDecision = "approved" | "rejected" | "changes_required";

export type PropertyPublicationMedia = {
  id: string;
  tenantId: string;
  propertyId: string;
  mediaType: "image" | "video" | "document";
  storageBucket: string | null;
  storagePath: string | null;
  url: string | null;
  altText: string | null;
  sortOrder: number;
  isCover: boolean;
  isPublicationAllowed: boolean;
  processingStatus: "processing" | "ready" | "failed";
  environmentType:
    | "facade" | "entrance" | "living_room" | "balcony" | "kitchen"
    | "bedroom" | "suite" | "bathroom" | "common_area" | "leisure" | "view"
    | "floor_plan" | "location" | "detail" | "brand" | "other";
  displayOrder: number;
  isPrimary: boolean;
  eligibleForCarousel: boolean;
  eligibleForVideo: boolean;
  mediaStatus: "pending" | "approved" | "excluded" | "failed";
  orientation: "portrait" | "landscape" | "square" | "unknown";
  width: number | null;
  height: number | null;
  humanNote: string | null;
  exclusionReason: string | null;
  slot: import("@/lib/yzi-imob/creative/media/gallery-contract").PropertyGallerySlotKey | null;
  originalFilename: string | null;
  mimeType: string | null;
  fileExtension: string | null;
  byteSize: number | null;
  sourceKind: "original_upload" | "external_url" | "legacy_storage" | null;
  uploadState: "reserved" | "completed" | "cancelled" | "failed" | null;
};

export type PublicationReadinessEligibility = {
  eligible: boolean;
  reasonCodes: readonly string[];
};

export type PropertyPublicationReadiness = {
  ready: boolean;
  blockers: readonly string[];
  warnings: readonly string[];
  missingFields: readonly string[];
  invalidFields: readonly string[];
  mediaIssues: readonly string[];
  publicationEligibility: PublicationReadinessEligibility;
};

export type PropertyCtaContext = {
  propertyId: string;
  slug: string;
  url: string;
  source: "yzi_imob_site";
  campaign: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  referrer: string | null;
  initialIntent: "property_interest";
};

export type PropertyPublicCta = {
  label: "Tenho interesse";
  href: string;
  context: PropertyCtaContext;
};

export type PropertySeoContract = {
  title: string;
  metaDescription: string;
  canonicalUrl: string | null;
  robots: "index,follow";
  structuredData: Readonly<Record<string, unknown>>;
  sitemapInclusion: boolean;
  locationSilo: string;
  propertyTypeSilo: string;
  developmentSilo: string | null;
  relatedContentIdentifiers: readonly string[];
};

export type PropertyPublicMedia = {
  id: string;
  type: "image" | "video";
  url: string;
  alt: string;
  sortOrder: number;
};

export type PropertyPublicPrice =
  | {
      visibility: "visible";
      amount: number;
      currency: "BRL";
      formatted: string;
    }
  | {
      visibility: "on_request";
      label: "Sob consulta";
    };

export type PropertyPublicPayload = {
  property_id: string;
  tenant_id: string;
  slug: string;
  title: string;
  description: string;
  property_type: string;
  operation_type: string;
  city: string;
  neighborhood: string;
  public_location: string;
  price_display: PropertyPublicPrice;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  area: {
    private: number | null;
    total: number | null;
    unit: "m2";
  };
  features: readonly string[];
  highlights: readonly string[];
  development: string | null;
  gallery: readonly PropertyPublicMedia[];
  cover: PropertyPublicMedia;
  videos: readonly PropertyPublicMedia[];
  cta: PropertyPublicCta;
  seo: PropertySeoContract;
  status: "ready_to_publish" | "published";
  published_at: string | null;
  updated_at: string;
  publication_version: number;
};

export type PropertyPublicationState = {
  id: string;
  tenantId: string;
  propertyId: string;
  publicationChannel: PropertyPublicationChannel;
  status: PropertyPublicationStatus;
  publicSlug: string | null;
  publicUrl: string | null;
  currentRevisionId: string | null;
  approvedRevisionId: string | null;
  publicationVersion: number;
  scheduledAt: string | null;
  publishedAt: string | null;
  pausedAt: string | null;
  unpublishedAt: string | null;
  lastSyncedAt: string | null;
  syncErrorCode: string | null;
  idempotencyKey: string | null;
  createdByUserId: string | null;
  approvedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PropertyPublicationRevision = {
  id: string;
  tenantId: string;
  propertyId: string;
  revisionNumber: number;
  publicSlug: string;
  contentHash: string;
  status: PropertyPublicationRevisionStatus;
  reviewObservation: string | null;
  createdByUserId: string;
  reviewRequestedAt: string;
  decidedByUserId: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PropertyPublicationJob = {
  id: string;
  tenantId: string;
  propertyId: string;
  publicationId: string;
  operation: PropertyPublicationOperation;
  status: "queued" | "processing" | "succeeded" | "failed" | "cancelled";
  revisionId: string;
  publicationVersion: number;
  correlationId: string;
  attemptCount: number;
  maxAttempts: number;
  lastErrorCode: string | null;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export type PropertyPublicationSyncResult =
  | {
      status: "synced";
      publicationId: string;
      jobId: string;
      publicationVersion: number;
      publicUrl: string;
    }
  | {
      status: "failed";
      publicationId: string;
      jobId: string;
      errorCode: string;
      retryEligible: boolean;
    };

export type PropertyPublicationWorkspace = {
  state: PropertyPublicationState | null;
  currentRevision: PropertyPublicationRevision | null;
  approvedRevision: PropertyPublicationRevision | null;
  latestJob: PropertyPublicationJob | null;
  media: readonly PropertyPublicationMedia[];
};

export type SitePublicationGovernanceSummary = {
  counts: {
    ready: number;
    published: number;
    updatePending: number;
    failed: number;
    paused: number;
  };
  items: readonly {
    propertyId: string;
    propertyTitle: string;
    status: PropertyPublicationStatus;
    publicUrl: string | null;
    lastSyncedAt: string | null;
    blockers: readonly string[];
  }[];
};
