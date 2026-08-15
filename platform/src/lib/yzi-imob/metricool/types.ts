export const METRICOOL_CONNECTION_STATUS_VALUES = [
  "not_configured",
  "configuration_required",
  "connected",
  "validating",
  "active",
  "attention_required",
  "token_invalid",
  "plan_insufficient",
  "rate_limited",
  "disconnected",
  "failed",
] as const;

export type MetricoolConnectionStatus =
  (typeof METRICOOL_CONNECTION_STATUS_VALUES)[number];

export const METRICOOL_CAPABILITY_VALUES = [
  "connection_validation",
  "profile_discovery",
  "social_publish",
  "social_schedule",
  "social_cancel",
  "post_status",
  "post_metrics",
  "profile_metrics",
] as const;

export type MetricoolCapability = (typeof METRICOOL_CAPABILITY_VALUES)[number];

export const METRICOOL_NETWORK_VALUES = ["instagram", "facebook"] as const;
export type MetricoolNetwork = (typeof METRICOOL_NETWORK_VALUES)[number];

export type MetricoolConnection = {
  id: string;
  tenantId: string;
  provider: "metricool";
  status: MetricoolConnectionStatus;
  externalUserId: string | null;
  externalBlogId: string | null;
  displayName: string | null;
  capabilities: readonly MetricoolCapability[];
  connectedAt: string | null;
  validatedAt: string | null;
  disconnectedAt: string | null;
  tokenExpiresAt: string | null;
  lastSyncAt: string | null;
  lastErrorCode: string | null;
};

export type MetricoolTargetProfile = {
  id: string;
  network: MetricoolNetwork;
  displayName: string;
  connected: boolean;
};

export type MetricoolCredentials = {
  userId: string;
  blogId: string;
  apiToken: string;
};

export type MetricoolDiscoveryCredentials = {
  apiToken: string;
};

export type MetricoolAccountCandidate = {
  externalUserId: string;
  externalBlogId: string;
  displayName: string;
};

export type SocialPublicationFormat = "single_image" | "carousel";

export type SocialPublicationStatus =
  | "queued"
  | "dispatching"
  | "accepted"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "cancelled";

export type SocialPublicationAsset = {
  mediaId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
};

export type SocialPublication = {
  id: string;
  tenantId: string;
  propertyId: string;
  publicationRevisionId: string;
  connectionId: string;
  provider: "metricool";
  targetNetworks: readonly MetricoolNetwork[];
  targetProfileIds: readonly string[];
  format: SocialPublicationFormat;
  caption: string;
  assets: readonly SocialPublicationAsset[];
  scheduledAt: string;
  status: SocialPublicationStatus;
  externalPostId: string | null;
  externalPostUuid: string | null;
  externalNetworkPostIds: Readonly<Partial<Record<MetricoolNetwork, string>>>;
  externalUrl: string | null;
  idempotencyKey: string;
  acceptedAt: string | null;
  publishedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  lastStatusSyncAt: string | null;
  lastMetricsSyncAt: string | null;
  errorCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MetricoolPostState =
  | "draft"
  | "pending"
  | "awaiting_confirmation"
  | "publishing"
  | "published"
  | "error";

export type MetricoolScheduledPostRequest = {
  networks: readonly MetricoolNetwork[];
  text: string;
  media: readonly SocialPublicationAsset[];
  scheduledAt: string;
  timezone: string;
};

export type MetricoolScheduledPost = {
  externalPostId: string;
  externalPostUuid: string | null;
  externalNetworkPostIds: Readonly<Partial<Record<MetricoolNetwork, string>>>;
  networkStates: Readonly<Partial<Record<MetricoolNetwork, MetricoolPostState>>>;
  state: MetricoolPostState;
  publicUrl: string | null;
  scheduledAt: string;
};

export type MetricoolMetricScope = "post" | "profile";

export const NORMALIZED_SOCIAL_METRIC_VALUES = [
  "impressions",
  "views",
  "reach",
  "engagement",
  "likes",
  "comments",
  "shares",
  "saves",
  "clicks",
  "followers",
  "profile_views",
  "posts_published",
] as const;

export type NormalizedSocialMetric =
  (typeof NORMALIZED_SOCIAL_METRIC_VALUES)[number];

export type MetricoolMetric = {
  network: MetricoolNetwork;
  scope: MetricoolMetricScope;
  targetProfileId: string | null;
  providerMetricName: string;
  normalizedMetricName: NormalizedSocialMetric | null;
  value: number;
  periodStart: string;
  periodEnd: string;
  collectedAt: string;
};

export type MetricoolMetricPeriod = {
  from: string;
  to: string;
  timezone: string;
};

export type MetricoolSanitizedErrorCode =
  | "configuration_required"
  | "invalid_configuration"
  | "token_invalid"
  | "plan_insufficient"
  | "rate_limited"
  | "timeout"
  | "network_error"
  | "provider_rejected"
  | "provider_unavailable"
  | "provider_response_invalid"
  | "unsupported_network"
  | "post_not_found";

export type MetricoolSanitizedError = {
  code: MetricoolSanitizedErrorCode;
  retryable: boolean;
  httpStatus?: number;
  retryAfterMs?: number;
};

export type MetricoolTransportResult<T> =
  | { status: "ok"; value: T }
  | { status: "error"; error: MetricoolSanitizedError };

export type MetricoolValidation = {
  userId: string;
  blogId: string;
  displayName: string;
  timezone: string;
  profiles: readonly MetricoolTargetProfile[];
  capabilities: readonly MetricoolCapability[];
};

export type SocialMetricsSyncResult = {
  socialPublicationId: string;
  metrics: readonly MetricoolMetric[];
  collectedAt: string;
};
