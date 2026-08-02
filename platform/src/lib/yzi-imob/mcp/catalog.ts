import type {
  JsonObject,
  McpAdapter,
  McpCapabilityKey,
  McpConnectionKind,
  McpOperation,
  McpOperationDefinition,
  McpToolDefinition,
} from "./types.ts";

export const MCP_ENDPOINT_CATALOG = {
  metricool: {
    endpoint: "https://ai.metricool.com/mcp",
    callbackPath: "/api/yzi-imob/connections/social/callback",
  },
  higgsfield: {
    endpoint: "https://mcp.higgsfield.ai/mcp",
    callbackPath: "/api/yzi-imob/connections/creative/callback",
  },
} as const satisfies Record<
  McpConnectionKind,
  { endpoint: string; callbackPath: string }
>;

const METRICOOL_OPERATIONS: readonly McpOperationDefinition[] = [
  define("read_social_accounts", "social_accounts_read", "read", ["brands_list", "profiles_list"], ["mcp:read"]),
  define("read_social_calendar", "social_calendar_read", "read", ["calendar_list", "posts_calendar"], ["mcp:read"]),
  define("read_social_content", "social_content_read", "read", ["content_list", "posts_list"], ["mcp:read"]),
  define("read_social_metrics", "social_metrics_read", "read", ["metrics_get", "analytics_read"], ["mcp:read"]),
  define("create_social_content", "social_content_create", "write", ["content_create"], ["mcp:write"]),
  define("schedule_social_content", "social_content_schedule", "write", ["content_schedule", "post_schedule"], ["mcp:write"]),
  define("publish_social_content", "social_content_publish", "write", ["content_publish", "post_publish"], ["mcp:write"]),
  define("read_publication_status", "social_publication_status_read", "read", ["publication_status", "post_status"], ["mcp:read"]),
];

const HIGGSFIELD_OPERATIONS: readonly McpOperationDefinition[] = [
  define("read_generation_models", "model_capabilities_read", "read", ["models_list", "capabilities_list"], ["openid"]),
  define("read_usage_limits", "usage_limits_read", "read", ["usage_limits", "limits_get"], ["openid"]),
  define("prepare_image_job", "image_generation", "paid", ["image_generate", "generate_image"], ["openid"], estimateGenerationCost),
  define("prepare_video_job", "video_generation", "paid", ["video_generate", "generate_video"], ["openid"], estimateGenerationCost),
  define("submit_generation_job", "generation_job_submit", "paid", ["job_submit", "generation_submit"], ["openid"], estimateGenerationCost),
  define("read_generation_job", "generation_job_status", "read", ["job_status", "generation_status"], ["openid"]),
  define("read_generation_output", "generation_output_read", "read", ["job_output", "generation_output"], ["openid"]),
  define("cancel_generation_job", "generation_job_status", "write", ["job_cancel", "generation_cancel"], ["openid"]),
];

const METRICOOL_CAPABILITY_ALIASES: Readonly<Record<McpCapabilityKey, readonly string[]>> = {
  social_accounts_read: ["brands_list", "brand", "profiles_list", "profile"],
  social_calendar_read: ["calendar_list", "calendar"],
  social_content_read: ["content_list", "posts_list", "history"],
  social_metrics_read: ["metrics_get", "metrics", "analytics"],
  social_content_create: ["content_create", "draft_create"],
  social_content_schedule: ["content_schedule", "post_schedule", "schedule"],
  social_content_publish: ["content_publish", "post_publish", "publish"],
  social_publication_status_read: ["publication_status", "post_status"],
  image_generation: [],
  video_generation: [],
  generation_job_submit: [],
  generation_job_status: [],
  generation_output_read: [],
  model_capabilities_read: [],
  usage_limits_read: [],
};

const HIGGSFIELD_CAPABILITY_ALIASES: Readonly<Record<McpCapabilityKey, readonly string[]>> = {
  social_accounts_read: [],
  social_calendar_read: [],
  social_content_read: [],
  social_metrics_read: [],
  social_content_create: [],
  social_content_schedule: [],
  social_content_publish: [],
  social_publication_status_read: [],
  image_generation: ["image_generate", "generate_image"],
  video_generation: ["video_generate", "generate_video"],
  generation_job_submit: ["job_submit", "generation_submit"],
  generation_job_status: ["job_status", "generation_status", "job_cancel"],
  generation_output_read: ["job_output", "generation_output"],
  model_capabilities_read: ["models_list", "capabilities_list"],
  usage_limits_read: ["usage_limits", "limits_get"],
};

abstract class CatalogMcpAdapter implements McpAdapter {
  abstract readonly kind: McpConnectionKind;
  abstract readonly endpointKey: McpConnectionKind;
  abstract readonly authorizationScopes: readonly string[];
  protected abstract readonly operations: readonly McpOperationDefinition[];
  protected abstract readonly aliases: Readonly<Record<McpCapabilityKey, readonly string[]>>;

  mapCapability(tool: McpToolDefinition): McpCapabilityKey | null {
    const normalized = normalizeToolName(tool.name);
    for (const [capability, aliases] of Object.entries(this.aliases)) {
      if (aliases.some((alias) => normalized.includes(alias))) {
        return capability as McpCapabilityKey;
      }
    }
    return null;
  }

  operation(operation: McpOperation): McpOperationDefinition | null {
    return this.operations.find((entry) => entry.operation === operation) ?? null;
  }

  validatePolicy(
    definition: McpOperationDefinition,
    input: JsonObject,
  ): { ok: true } | { ok: false; code: string } {
    if (definition.risk === "read") return { ok: true };
    if (input.contentApproved !== true && definition.capability.startsWith("social_")) {
      return { ok: false, code: "approved_content_required" };
    }
    if (definition.capability.startsWith("social_")) {
      if (input.assetApproved !== true) return { ok: false, code: "approved_asset_required" };
      if (typeof input.destinationId !== "string" || !input.destinationId) {
        return { ok: false, code: "mapped_destination_required" };
      }
    }
    if (
      ["image_generation", "video_generation", "generation_job_submit"].includes(
        definition.capability,
      ) &&
      input.outputReviewRequired !== true
    ) {
      return { ok: false, code: "human_output_review_required" };
    }
    return { ok: true };
  }

  normalizeResult(_operation: McpOperation, result: JsonObject): JsonObject {
    return sanitizePublicResult(result);
  }
}

export class MetricoolMcpAdapter extends CatalogMcpAdapter {
  readonly kind = "metricool" as const;
  readonly endpointKey = "metricool" as const;
  readonly authorizationScopes = ["mcp:read", "mcp:write"] as const;
  protected readonly operations = METRICOOL_OPERATIONS;
  protected readonly aliases = METRICOOL_CAPABILITY_ALIASES;
}

export class HiggsfieldMcpAdapter extends CatalogMcpAdapter {
  readonly kind = "higgsfield" as const;
  readonly endpointKey = "higgsfield" as const;
  readonly authorizationScopes = ["openid", "email", "offline_access"] as const;
  protected readonly operations = HIGGSFIELD_OPERATIONS;
  protected readonly aliases = HIGGSFIELD_CAPABILITY_ALIASES;

  override normalizeResult(operation: McpOperation, result: JsonObject): JsonObject {
    const safe = sanitizePublicResult(result);
    if (operation === "read_generation_output") {
      return {
        ...safe,
        reviewState: "pending_human_review",
        approved: false,
        provenance:
          isRecord(safe.provenance) ? safe.provenance : { source: "external_generation" },
      };
    }
    return safe;
  }
}

export const MCP_ADAPTERS: Readonly<Record<McpConnectionKind, McpAdapter>> = {
  metricool: new MetricoolMcpAdapter(),
  higgsfield: new HiggsfieldMcpAdapter(),
};

function define(
  operation: McpOperation,
  capability: McpCapabilityKey,
  risk: McpOperationDefinition["risk"],
  toolAliases: readonly string[],
  requiredScopes: readonly string[],
  estimatedCost?: (input: JsonObject) => number | null,
): McpOperationDefinition {
  return { operation, capability, risk, toolAliases, requiredScopes, estimatedCost };
}

function estimateGenerationCost(input: JsonObject): number | null {
  const quoted = input.estimatedCost;
  return typeof quoted === "number" && Number.isFinite(quoted) && quoted >= 0
    ? quoted
    : null;
}

function normalizeToolName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function sanitizePublicResult(value: JsonObject): JsonObject {
  const forbidden = /token|secret|authorization|cookie|session|credential|password|endpoint/i;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !forbidden.test(key))
      .map(([key, item]) => [key, sanitizeValue(item, forbidden)]),
  );
}

function sanitizeValue(value: unknown, forbidden: RegExp): unknown {
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item, forbidden));
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !forbidden.test(key))
        .map(([key, item]) => [key, sanitizeValue(item, forbidden)]),
    );
  }
  return value;
}

function isRecord(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
