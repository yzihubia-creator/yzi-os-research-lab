import "server-only";

import {
  METRICOOL_CAPABILITY_VALUES,
  METRICOOL_NETWORK_VALUES,
  type MetricoolCredentials,
  type MetricoolMetric,
  type MetricoolMetricPeriod,
  type MetricoolNetwork,
  type MetricoolPostState,
  type MetricoolScheduledPost,
  type MetricoolScheduledPostRequest,
  type MetricoolTargetProfile,
  type MetricoolTransportResult,
  type MetricoolValidation,
  type NormalizedSocialMetric,
  type SocialPublicationAsset,
} from "./types.ts";

export const METRICOOL_API_BASE_URL = "https://app.metricool.com/api";
export const METRICOOL_HTTP_TIMEOUT_MS = 8_000;

export type MetricoolTransport = {
  validateConnection(signal?: AbortSignal): Promise<MetricoolTransportResult<MetricoolValidation>>;
  listBrandsOrProfiles(
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<readonly MetricoolTargetProfile[]>>;
  createScheduledPost(
    request: MetricoolScheduledPostRequest,
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<MetricoolScheduledPost>>;
  getPostStatus(
    externalPostId: string,
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<MetricoolScheduledPost>>;
  cancelScheduledPost(
    externalPostId: string,
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<{ cancelled: true }>>;
  getPostMetrics(
    network: MetricoolNetwork,
    externalPostId: string,
    period: MetricoolMetricPeriod,
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<readonly MetricoolMetric[]>>;
  getProfileMetrics(
    network: MetricoolNetwork,
    targetProfileId: string,
    period: MetricoolMetricPeriod,
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<readonly MetricoolMetric[]>>;
};

type JsonRecord = Record<string, unknown>;

type HttpSuccess = {
  ok: true;
  payload: unknown;
};

type HttpFailure = {
  ok: false;
  result: MetricoolTransportResult<never>;
};

const POST_METRIC_MAP: Readonly<Record<string, NormalizedSocialMetric | null>> = {
  impressions: "impressions",
  impressionsTotal: "impressions",
  views: "views",
  reach: "reach",
  engagement: "engagement",
  likes: "likes",
  reactions: "likes",
  comments: "comments",
  shares: "shares",
  saved: "saves",
  saves: "saves",
  clicks: "clicks",
  interactions: null,
};

const PROFILE_METRICS: Readonly<Record<MetricoolNetwork, readonly string[]>> = {
  instagram: ["postsCount", "postsInteractions", "clicks_total"],
  facebook: [
    "pageFollows",
    "pageViews",
    "pageImpressions",
    "postsCount",
    "postsInteractions",
  ],
};

const PROFILE_METRIC_MAP: Readonly<Record<string, NormalizedSocialMetric | null>> = {
  pageFollows: "followers",
  pageViews: "profile_views",
  pageImpressions: "impressions",
  postsCount: "posts_published",
  clicks_total: "clicks",
  postsInteractions: null,
};

export class OfficialMetricoolHttpTransport implements MetricoolTransport {
  readonly #credentials: MetricoolCredentials;
  readonly #fetchImpl: typeof fetch;
  readonly #baseUrl: string;
  readonly #timeoutMs: number;

  constructor(input: {
    credentials: MetricoolCredentials;
    fetchImpl?: typeof fetch;
    baseUrl?: string;
    timeoutMs?: number;
  }) {
    this.#credentials = input.credentials;
    this.#fetchImpl = input.fetchImpl ?? fetch;
    this.#baseUrl = (input.baseUrl ?? METRICOOL_API_BASE_URL).replace(/\/+$/, "");
    this.#timeoutMs = input.timeoutMs ?? METRICOOL_HTTP_TIMEOUT_MS;
  }

  async validateConnection(
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<MetricoolValidation>> {
    if (!validCredentials(this.#credentials)) {
      return failure("invalid_configuration", false);
    }

    const response = await this.#request("/admin/simpleProfiles", { method: "GET" }, signal, 1);
    if (!response.ok) return response.result;

    const brands = asArray(response.payload);
    const brand = brands
      .map(asRecord)
      .find((item) => readIdentifier(item?.id) === this.#credentials.blogId);
    if (!brand) return failure("invalid_configuration", false);

    const ownerUserId =
      readIdentifier(brand.userId) ?? readIdentifier(brand.ownerUserId) ?? this.#credentials.userId;
    if (ownerUserId !== this.#credentials.userId) {
      return failure("invalid_configuration", false);
    }

    const profiles = profilesFromBrand(brand);
    return {
      status: "ok",
      value: {
        userId: this.#credentials.userId,
        blogId: this.#credentials.blogId,
        displayName: readSafeLabel(brand.label) ?? readSafeLabel(brand.title) ?? "Metricool",
        timezone: readTimezone(brand.timezone) ?? "America/Sao_Paulo",
        profiles,
        capabilities: [...METRICOOL_CAPABILITY_VALUES],
      },
    };
  }

  async listBrandsOrProfiles(
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<readonly MetricoolTargetProfile[]>> {
    const validation = await this.validateConnection(signal);
    return validation.status === "ok"
      ? { status: "ok", value: validation.value.profiles }
      : validation;
  }

  async createScheduledPost(
    request: MetricoolScheduledPostRequest,
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<MetricoolScheduledPost>> {
    const invalid = validateScheduledPostRequest(request);
    if (invalid) return invalid;

    const normalizedMedia: string[] = [];
    for (const asset of request.media) {
      const normalized = await this.#normalizeImage(asset, signal);
      if (normalized.status === "error") return normalized;
      normalizedMedia.push(normalized.value);
    }

    const body = {
      publicationDate: {
        dateTime: request.scheduledAt,
        timezone: request.timezone,
      },
      text: request.text,
      providers: request.networks.map((network) => ({ network })),
      media: normalizedMedia,
      mediaAltText: request.media.map((asset) => asset.altText ?? ""),
      autoPublish: true,
      saveExternalMediaFiles: true,
      draft: false,
      instagramData: request.networks.includes("instagram")
        ? { autoPublish: true, type: "POST" }
        : undefined,
      facebookData: request.networks.includes("facebook")
        ? { type: "POST" }
        : undefined,
    };

    // Creation is never retried by the HTTP layer. Local database idempotency
    // decides whether a new creation attempt is eligible.
    const response = await this.#request(
      "/v2/scheduler/posts",
      { method: "POST", body: JSON.stringify(body) },
      signal,
      0,
    );
    if (!response.ok) return response.result;
    return parseScheduledPost(response.payload, request.scheduledAt);
  }

  async getPostStatus(
    externalPostId: string,
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<MetricoolScheduledPost>> {
    if (!/^[0-9]{1,20}$/.test(externalPostId)) {
      return failure("post_not_found", false);
    }
    const response = await this.#request(
      `/v2/scheduler/posts/${externalPostId}`,
      { method: "GET" },
      signal,
      1,
    );
    if (!response.ok) return response.result;
    return parseScheduledPost(response.payload, new Date().toISOString());
  }

  async cancelScheduledPost(
    externalPostId: string,
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<{ cancelled: true }>> {
    if (!/^[0-9]{1,20}$/.test(externalPostId)) {
      return failure("post_not_found", false);
    }
    const response = await this.#request(
      `/v2/scheduler/posts/${externalPostId}`,
      { method: "DELETE" },
      signal,
      0,
    );
    return response.ok ? { status: "ok", value: { cancelled: true } } : response.result;
  }

  async getPostMetrics(
    network: MetricoolNetwork,
    externalPostId: string,
    period: MetricoolMetricPeriod,
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<readonly MetricoolMetric[]>> {
    if (!METRICOOL_NETWORK_VALUES.includes(network)) {
      return failure("unsupported_network", false);
    }

    const path =
      network === "instagram"
        ? "/v2/analytics/posts/instagram"
        : "/stats/facebook/posts";
    const response = await this.#request(
      path,
      {
        method: "GET",
        query: {
          from: period.from,
          to: period.to,
          timezone: period.timezone,
        },
      },
      signal,
      1,
    );
    if (!response.ok) return response.result;

    const rows = readDataArray(response.payload);
    const post = rows
      .map(asRecord)
      .find((item) => readIdentifier(item?.postId) === externalPostId);
    if (!post) return { status: "ok", value: [] };

    return {
      status: "ok",
      value: metricFieldsFromRecord({
        record: post,
        network,
        scope: "post",
        targetProfileId: null,
        period,
        mappings: POST_METRIC_MAP,
      }),
    };
  }

  async getProfileMetrics(
    network: MetricoolNetwork,
    targetProfileId: string,
    period: MetricoolMetricPeriod,
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<readonly MetricoolMetric[]>> {
    if (!METRICOOL_NETWORK_VALUES.includes(network)) {
      return failure("unsupported_network", false);
    }

    const metrics = await Promise.all(
      PROFILE_METRICS[network].map(async (metric) => {
        const response = await this.#request(
          "/v2/analytics/timelines",
          {
            method: "GET",
            query: {
              network,
              metric,
              subject: "account",
              from: period.from,
              to: period.to,
              timezone: period.timezone,
            },
          },
          signal,
          1,
        );
        if (!response.ok) return response.result;

        const series = readDataArray(response.payload).map(asRecord).find(Boolean);
        const aggregate = asRecord(series?.aggregate);
        const value = readFiniteNumber(aggregate?.value) ?? sumSeriesValues(series?.values);
        if (value === null) return { status: "ok", value: [] } as const;

        return {
          status: "ok",
          value: [
            buildMetric({
              network,
              scope: "profile",
              targetProfileId,
              providerMetricName: metric,
              normalizedMetricName: PROFILE_METRIC_MAP[metric] ?? null,
              value,
              period,
            }),
          ],
        } as const;
      }),
    );

    const failed = metrics.find((result) => result.status === "error");
    if (failed?.status === "error") return failed;
    return {
      status: "ok",
      value: metrics.flatMap((result) => result.status === "ok" ? result.value : []),
    };
  }

  async #normalizeImage(
    asset: SocialPublicationAsset,
    signal?: AbortSignal,
  ): Promise<MetricoolTransportResult<string>> {
    if (!isSafePublicHttpsUrl(asset.url)) {
      return failure("provider_rejected", false);
    }
    const response = await this.#request(
      "/actions/normalize/image/url",
      { method: "GET", query: { url: asset.url } },
      signal,
      1,
    );
    if (!response.ok) return response.result;

    const normalized = readNormalizedMediaUrl(response.payload);
    return normalized && isSafePublicHttpsUrl(normalized)
      ? { status: "ok", value: normalized }
      : failure("provider_response_invalid", false);
  }

  async #request(
    path: string,
    input: {
      method: "GET" | "POST" | "DELETE";
      query?: Readonly<Record<string, string>>;
      body?: string;
    },
    signal: AbortSignal | undefined,
    maxRetries: number,
  ): Promise<HttpSuccess | HttpFailure> {
    let attempt = 0;
    while (attempt <= maxRetries) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort("timeout"), this.#timeoutMs);
      const onAbort = () => controller.abort(signal?.reason);
      signal?.addEventListener("abort", onAbort, { once: true });

      try {
        const url = new URL(`${this.#baseUrl}${path}`);
        url.searchParams.set("userId", this.#credentials.userId);
        url.searchParams.set("blogId", this.#credentials.blogId);
        for (const [key, value] of Object.entries(input.query ?? {})) {
          url.searchParams.set(key, value);
        }

        const response = await this.#fetchImpl(url, {
          method: input.method,
          headers: {
            "Content-Type": "application/json",
            "X-Mc-Auth": this.#credentials.apiToken,
          },
          body: input.body,
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          const error = mapHttpFailure(response.status, response.headers.get("Retry-After"));
          if (attempt < maxRetries && error.retryable) {
            attempt += 1;
            continue;
          }
          return { ok: false, result: { status: "error", error } };
        }

        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("json")) {
          return { ok: false, result: failure("provider_response_invalid", false) };
        }
        return { ok: true, payload: await response.json() };
      } catch {
        const timedOut = controller.signal.aborted && !signal?.aborted;
        const mapped = timedOut
          ? failure("timeout", true)
          : failure("network_error", true);
        if (attempt < maxRetries && mapped.status === "error" && mapped.error.retryable) {
          attempt += 1;
          continue;
        }
        return { ok: false, result: mapped };
      } finally {
        clearTimeout(timeout);
        signal?.removeEventListener("abort", onAbort);
      }
    }

    return { ok: false, result: failure("provider_unavailable", true) };
  }
}

function validateScheduledPostRequest(
  request: MetricoolScheduledPostRequest,
): MetricoolTransportResult<never> | null {
  if (
    request.networks.length < 1 ||
    request.networks.length > 2 ||
    request.networks.some((network) => !METRICOOL_NETWORK_VALUES.includes(network)) ||
    new Set(request.networks).size !== request.networks.length ||
    request.text.trim().length < 1 ||
    request.text.length > 2200 ||
    request.media.length < 1 ||
    request.media.length > 10 ||
    !readTimezone(request.timezone) ||
    !Number.isFinite(Date.parse(request.scheduledAt)) ||
    Date.parse(request.scheduledAt) <= Date.now()
  ) {
    return failure("provider_rejected", false);
  }
  return null;
}

function profilesFromBrand(brand: JsonRecord): readonly MetricoolTargetProfile[] {
  const profiles: MetricoolTargetProfile[] = [];
  const instagram = readSafeLabel(brand.instagram);
  const facebook = readSafeLabel(brand.facebook);
  const facebookPageId = readIdentifier(brand.facebookPageId);

  if (instagram) {
    profiles.push({
      id: instagram,
      network: "instagram",
      displayName: instagram,
      connected: true,
    });
  }
  if (facebook || facebookPageId) {
    profiles.push({
      id: facebookPageId ?? facebook ?? "facebook",
      network: "facebook",
      displayName: facebook ?? "Facebook",
      connected: true,
    });
  }
  return profiles;
}

function parseScheduledPost(
  payload: unknown,
  fallbackScheduledAt: string,
): MetricoolTransportResult<MetricoolScheduledPost> {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const id = readIdentifier(data?.id);
  if (!data || !id) return failure("provider_response_invalid", false);

  const providers = asArray(data.providers).map(asRecord).filter(Boolean);
  const provider = providers[0] ?? null;
  const publicationDate = asRecord(data.publicationDate);
  return {
    status: "ok",
    value: {
      externalPostId: id,
      externalPostUuid: readSafeLabel(data.uuid),
      externalNetworkPostIds: Object.fromEntries(
        providers.flatMap((item) => {
          const network = readSafeLabel(item?.network);
          const providerId = readIdentifier(item?.id);
          return network && providerId && METRICOOL_NETWORK_VALUES.includes(network as MetricoolNetwork)
            ? [[network, providerId]]
            : [];
        }),
      ),
      state: mapProviderState(readSafeLabel(provider?.status)),
      publicUrl: readSafeHttpsUrl(provider?.publicUrl),
      scheduledAt: readSafeLabel(publicationDate?.dateTime) ?? fallbackScheduledAt,
    },
  };
}

function mapProviderState(value: string | null): MetricoolPostState {
  switch (value?.toUpperCase()) {
    case "PUBLISHED":
      return "published";
    case "PUBLISHING":
      return "publishing";
    case "AWAITING_CONFIRMATION":
      return "awaiting_confirmation";
    case "ERROR":
      return "error";
    case "DRAFT":
      return "draft";
    case "PENDING":
    default:
      return "pending";
  }
}

function metricFieldsFromRecord(input: {
  record: JsonRecord;
  network: MetricoolNetwork;
  scope: "post";
  targetProfileId: null;
  period: MetricoolMetricPeriod;
  mappings: Readonly<Record<string, NormalizedSocialMetric | null>>;
}): readonly MetricoolMetric[] {
  const metrics: MetricoolMetric[] = [];
  for (const [providerMetricName, normalizedMetricName] of Object.entries(input.mappings)) {
    const value = readFiniteNumber(input.record[providerMetricName]);
    if (value === null) continue;
    metrics.push(buildMetric({ ...input, providerMetricName, normalizedMetricName, value }));
  }
  return metrics;
}

function buildMetric(input: {
  network: MetricoolNetwork;
  scope: "post" | "profile";
  targetProfileId: string | null;
  providerMetricName: string;
  normalizedMetricName: NormalizedSocialMetric | null;
  value: number;
  period: MetricoolMetricPeriod;
}): MetricoolMetric {
  return {
    network: input.network,
    scope: input.scope,
    targetProfileId: input.targetProfileId,
    providerMetricName: input.providerMetricName,
    normalizedMetricName: input.normalizedMetricName,
    value: input.value,
    periodStart: new Date(input.period.from).toISOString(),
    periodEnd: new Date(input.period.to).toISOString(),
    collectedAt: new Date().toISOString(),
  };
}

function sumSeriesValues(value: unknown): number | null {
  const values = asArray(value)
    .map(asRecord)
    .map((item) => readFiniteNumber(item?.value))
    .filter((item): item is number => item !== null);
  return values.length ? values.reduce((sum, item) => sum + item, 0) : null;
}

function readNormalizedMediaUrl(payload: unknown): string | null {
  if (typeof payload === "string") return payload;
  const root = asRecord(payload);
  if (!root) return null;
  if (typeof root.data === "string") return root.data;
  const data = asRecord(root.data);
  return (
    readSafeHttpsUrl(root.url) ??
    readSafeHttpsUrl(root.mediaUrl) ??
    readSafeHttpsUrl(data?.url) ??
    readSafeHttpsUrl(data?.mediaUrl)
  );
}

function mapHttpFailure(status: number, retryAfter: string | null) {
  if (status === 401) return { code: "token_invalid" as const, retryable: false, httpStatus: status };
  if (status === 403) return { code: "plan_insufficient" as const, retryable: false, httpStatus: status };
  if (status === 404) return { code: "post_not_found" as const, retryable: false, httpStatus: status };
  if (status === 429) {
    return {
      code: "rate_limited" as const,
      retryable: true,
      httpStatus: status,
      retryAfterMs: parseRetryAfter(retryAfter),
    };
  }
  if (status >= 500) {
    return { code: "provider_unavailable" as const, retryable: true, httpStatus: status };
  }
  return { code: "provider_rejected" as const, retryable: false, httpStatus: status };
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 60 * 60 * 1000);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, Math.min(date - Date.now(), 60 * 60 * 1000)) : undefined;
}

function failure(
  code: Parameters<typeof failureResult>[0],
  retryable: boolean,
): MetricoolTransportResult<never> {
  return failureResult(code, retryable);
}

function failureResult(
  code:
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
    | "post_not_found",
  retryable: boolean,
): MetricoolTransportResult<never> {
  return { status: "error", error: { code, retryable } };
}

function validCredentials(credentials: MetricoolCredentials): boolean {
  return (
    /^[0-9]{1,32}$/.test(credentials.userId) &&
    /^[0-9]{1,32}$/.test(credentials.blogId) &&
    credentials.apiToken.trim().length >= 8
  );
}

function isSafePublicHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !["localhost", "127.0.0.1", "::1"].includes(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function readSafeHttpsUrl(value: unknown): string | null {
  return typeof value === "string" && isSafePublicHttpsUrl(value) ? value : null;
}

function readTimezone(value: unknown): string | null {
  if (typeof value !== "string" || !/^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+)+$/.test(value)) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return value;
  } catch {
    return null;
  }
}

function readSafeLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 160 || /token|secret|vault|postgres:\/\//i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function readIdentifier(value: unknown): string | null {
  if (typeof value === "number" && Number.isSafeInteger(value)) return String(value);
  if (typeof value === "string" && /^[A-Za-z0-9_.:@/-]{1,160}$/.test(value)) return value;
  return null;
}

function readFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readDataArray(payload: unknown): unknown[] {
  const root = asRecord(payload);
  return root ? asArray(root.data).length ? asArray(root.data) : asArray(payload) : asArray(payload);
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
