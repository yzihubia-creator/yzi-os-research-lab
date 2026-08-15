import type {
  MetricoolAccountCandidate,
  MetricoolMetric,
  MetricoolMetricPeriod,
  MetricoolNetwork,
  MetricoolScheduledPost,
  MetricoolScheduledPostRequest,
  MetricoolTargetProfile,
  MetricoolTransportResult,
  MetricoolValidation,
} from "./types.ts";
import type { MetricoolDiscoveryTransport, MetricoolTransport } from "./transport.ts";

type FakeFailureCode =
  | "token_invalid"
  | "plan_insufficient"
  | "rate_limited"
  | "timeout"
  | "provider_rejected"
  | "provider_unavailable";

export class DeterministicFakeMetricoolDiscoveryTransport
  implements MetricoolDiscoveryTransport {
  readonly accounts: readonly MetricoolAccountCandidate[];

  constructor(
    accounts: readonly MetricoolAccountCandidate[] = [{
      externalUserId: "10001",
      externalBlogId: "20001",
      displayName: "Metricool sintético",
    }],
  ) {
    this.accounts = accounts;
  }

  async discoverAccounts(): Promise<
    MetricoolTransportResult<readonly MetricoolAccountCandidate[]>
  > {
    return { status: "ok", value: this.accounts };
  }
}

export class DeterministicFakeMetricoolTransport implements MetricoolTransport {
  readonly #postsByRequest = new Map<string, MetricoolScheduledPost>();
  readonly #postsById = new Map<string, MetricoolScheduledPost>();
  readonly #profiles: readonly MetricoolTargetProfile[];
  #nextPostId = 7000;
  #failure: FakeFailureCode | null = null;
  #postMetrics: readonly MetricoolMetric[] = [];
  #profileMetrics: readonly MetricoolMetric[] = [];
  createCallCount = 0;

  constructor(
    profiles: readonly MetricoolTargetProfile[] = [
      {
        id: "ig-yzi-synthetic",
        network: "instagram",
        displayName: "Instagram sintético",
        connected: true,
      },
      {
        id: "fb-yzi-synthetic",
        network: "facebook",
        displayName: "Facebook sintético",
        connected: true,
      },
    ],
  ) {
    this.#profiles = profiles;
  }

  failNext(code: FakeFailureCode): void {
    this.#failure = code;
  }

  setPostMetrics(metrics: readonly MetricoolMetric[]): void {
    this.#postMetrics = metrics;
  }

  setProfileMetrics(metrics: readonly MetricoolMetric[]): void {
    this.#profileMetrics = metrics;
  }

  markPostState(externalPostId: string, state: MetricoolScheduledPost["state"]): void {
    const existing = this.#postsById.get(externalPostId);
    if (existing) {
      const updated = {
        ...existing,
        state,
        networkStates: Object.fromEntries(
          Object.keys(existing.networkStates).map((network) => [network, state]),
        ),
        publicUrl:
          state === "published"
            ? `https://social.invalid/posts/${externalPostId}`
            : existing.publicUrl,
      };
      this.#postsById.set(externalPostId, updated);
    }
  }

  async validateConnection(): Promise<MetricoolTransportResult<MetricoolValidation>> {
    const failure = this.#takeFailure();
    if (failure) return failure;
    return {
      status: "ok",
      value: {
        userId: "10001",
        blogId: "20001",
        displayName: "YZI sintético",
        timezone: "America/Sao_Paulo",
        profiles: this.#profiles,
        capabilities: [
          "connection_validation",
          "profile_discovery",
          "social_publish",
          "social_schedule",
          "social_cancel",
          "post_status",
          "post_metrics",
          "profile_metrics",
        ],
      },
    };
  }

  async listBrandsOrProfiles(): Promise<
    MetricoolTransportResult<readonly MetricoolTargetProfile[]>
  > {
    const failure = this.#takeFailure();
    return failure ?? { status: "ok", value: this.#profiles };
  }

  async createScheduledPost(
    request: MetricoolScheduledPostRequest,
  ): Promise<MetricoolTransportResult<MetricoolScheduledPost>> {
    const failure = this.#takeFailure();
    if (failure) return failure;

    const requestKey = JSON.stringify({
      networks: request.networks,
      text: request.text,
      media: request.media.map((asset) => asset.mediaId),
      scheduledAt: request.scheduledAt,
    });
    const existing = this.#postsByRequest.get(requestKey);
    if (existing) return { status: "ok", value: existing };

    this.createCallCount += 1;
    const externalPostId = String(this.#nextPostId++);
    const post: MetricoolScheduledPost = {
      externalPostId,
      externalPostUuid: `yzi-synthetic-${externalPostId}`,
      externalNetworkPostIds: Object.fromEntries(
        request.networks.map((network) => [network, `${network}-${externalPostId}`]),
      ),
      networkStates: Object.fromEntries(
        request.networks.map((network) => [network, "pending"]),
      ),
      state: "pending",
      publicUrl: null,
      scheduledAt: request.scheduledAt,
    };
    this.#postsByRequest.set(requestKey, post);
    this.#postsById.set(externalPostId, post);
    return { status: "ok", value: post };
  }

  async getPostStatus(
    externalPostId: string,
  ): Promise<MetricoolTransportResult<MetricoolScheduledPost>> {
    const failure = this.#takeFailure();
    if (failure) return failure;
    const post = this.#postsById.get(externalPostId);
    return post
      ? { status: "ok", value: post }
      : {
          status: "error",
          error: { code: "post_not_found", retryable: false },
        };
  }

  async cancelScheduledPost(
    externalPostId: string,
  ): Promise<MetricoolTransportResult<{ cancelled: true }>> {
    const failure = this.#takeFailure();
    if (failure) return failure;
    const post = this.#postsById.get(externalPostId);
    if (!post || post.state === "published") {
      return {
        status: "error",
        error: { code: "provider_rejected", retryable: false },
      };
    }
    this.#postsById.set(externalPostId, { ...post, state: "error" });
    return { status: "ok", value: { cancelled: true } };
  }

  async getPostMetrics(
    network: MetricoolNetwork,
    _externalPostId: string,
    period: MetricoolMetricPeriod,
  ): Promise<MetricoolTransportResult<readonly MetricoolMetric[]>> {
    const failure = this.#takeFailure();
    if (failure) return failure;
    return {
      status: "ok",
      value: this.#postMetrics.filter(
        (metric) =>
          metric.network === network &&
          metric.periodStart === period.from &&
          metric.periodEnd === period.to,
      ),
    };
  }

  async getProfileMetrics(
    network: MetricoolNetwork,
    targetProfileId: string,
    period: MetricoolMetricPeriod,
  ): Promise<MetricoolTransportResult<readonly MetricoolMetric[]>> {
    const failure = this.#takeFailure();
    if (failure) return failure;
    return {
      status: "ok",
      value: this.#profileMetrics.filter(
        (metric) =>
          metric.network === network &&
          metric.targetProfileId === targetProfileId &&
          metric.periodStart === period.from &&
          metric.periodEnd === period.to,
      ),
    };
  }

  #takeFailure(): MetricoolTransportResult<never> | null {
    const code = this.#failure;
    this.#failure = null;
    if (!code) return null;
    return {
      status: "error",
      error: {
        code,
        retryable: ["rate_limited", "timeout", "provider_unavailable"].includes(code),
        httpStatus:
          code === "token_invalid"
            ? 401
            : code === "plan_insufficient"
              ? 403
              : code === "rate_limited"
                ? 429
                : code === "provider_unavailable"
                  ? 503
                  : undefined,
      },
    };
  }
}
