export const CREATIVE_ENVIRONMENT_TYPES = [
  "facade",
  "entrance",
  "common_area",
  "living_room",
  "balcony",
  "kitchen",
  "bedroom",
  "suite",
  "bathroom",
  "leisure",
  "view",
  "floor_plan",
  "location",
  "detail",
  "brand",
  "other",
] as const;

export type CreativeEnvironmentType = (typeof CREATIVE_ENVIRONMENT_TYPES)[number];
export type CreativeMediaStatus = "pending" | "approved" | "excluded" | "failed";
export type CreativeMediaOrientation = "portrait" | "landscape" | "square" | "unknown";
export type CreativeReadinessState = "ready" | "ready_with_warnings" | "incomplete" | "blocked";

export type GovernedPropertyMedia = {
  id: string;
  tenantId: string;
  propertyId: string;
  mediaType: "image" | "video" | "document";
  environmentType: CreativeEnvironmentType;
  displayOrder: number;
  isPrimary: boolean;
  eligibleForCarousel: boolean;
  eligibleForVideo: boolean;
  mediaStatus: CreativeMediaStatus;
  orientation: CreativeMediaOrientation;
  width: number | null;
  height: number | null;
  humanNote: string | null;
  exclusionReason: string | null;
  processingStatus?: "processing" | "ready" | "failed";
  isPublicationAllowed?: boolean;
  uploadState?: "reserved" | "completed" | "cancelled" | "failed" | null;
};

export type CreativeReadinessDiagnostic = {
  code: string;
  severity: "warning" | "blocking";
  message: string;
  mediaId?: string;
};

export type DeliverableReadiness = {
  state: CreativeReadinessState;
  eligibleMediaIds: readonly string[];
  diagnostics: readonly CreativeReadinessDiagnostic[];
};

export type CreativeMediaReadiness = {
  carousel: DeliverableReadiness;
  videoTour: DeliverableReadiness;
};
