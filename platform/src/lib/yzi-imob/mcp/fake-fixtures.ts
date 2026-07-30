import { DeterministicFakeMcpTransport } from "./transport.ts";
import type { JsonObject, McpToolDefinition } from "./types.ts";

const EMPTY_INPUT = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;

export const FAKE_METRICOOL_TOOLS: readonly McpToolDefinition[] = [
  tool("brands_list", EMPTY_INPUT),
  tool("profiles_list", EMPTY_INPUT),
  tool("calendar_list", EMPTY_INPUT),
  tool("content_list", EMPTY_INPUT),
  tool("metrics_get", EMPTY_INPUT),
  tool("content_create", governedSocialSchema()),
  tool("content_schedule", governedSocialSchema()),
  tool("content_publish", governedSocialSchema()),
  tool("publication_status", {
    type: "object",
    properties: { publicationId: { type: "string" } },
    required: ["publicationId"],
  }),
];

export const FAKE_HIGGSFIELD_TOOLS: readonly McpToolDefinition[] = [
  tool("models_list", EMPTY_INPUT),
  tool("usage_limits", EMPTY_INPUT),
  tool("image_generate", generationSchema("image")),
  tool("video_generate", generationSchema("video")),
  tool("job_submit", generationSchema("job")),
  tool("job_status", jobSchema()),
  tool("job_output", jobSchema()),
  tool("job_cancel", jobSchema()),
];

export function createFakeMetricoolTransport(): DeterministicFakeMcpTransport {
  return new DeterministicFakeMcpTransport({
    tools: FAKE_METRICOOL_TOOLS,
    handlers: {
      brands_list: () => ({
        brands: [{ id: "brand-safe-1", displayName: "Operação sintética" }],
      }),
      profiles_list: () => ({
        profiles: [{ id: "profile-safe-1", channel: "social" }],
      }),
      calendar_list: () => ({ entries: [], source: "deterministic_fake" }),
      content_list: () => ({ entries: [], source: "deterministic_fake" }),
      metrics_get: () => ({
        metrics: [{ key: "reach", value: 120 }],
        source: "deterministic_fake",
      }),
      content_create: () => ({ draftId: "draft-fake-1", published: false }),
      content_schedule: (input) => ({
        requestId: "schedule-fake-1",
        destinations: partialDestinationResults(input),
        published: false,
      }),
      content_publish: (input) => ({
        requestId: "publish-fake-1",
        destinations: partialDestinationResults(input),
        published: false,
        simulated: true,
      }),
      publication_status: () => ({ state: "scheduled", simulated: true }),
    },
  });
}

export function createFakeHiggsfieldTransport(): DeterministicFakeMcpTransport {
  return new DeterministicFakeMcpTransport({
    tools: FAKE_HIGGSFIELD_TOOLS,
    handlers: {
      models_list: () => ({
        models: [
          { id: "image-model-allowlisted", media: "image" },
          { id: "video-model-allowlisted", media: "video" },
        ],
      }),
      usage_limits: () => ({
        remaining: 25,
        unit: "synthetic_credit",
        estimated: true,
      }),
      image_generate: () => ({
        jobId: "image-job-fake-1",
        state: "prepared",
        charged: false,
      }),
      video_generate: () => ({
        jobId: "video-job-fake-1",
        state: "prepared",
        charged: false,
      }),
      job_submit: () => ({
        jobId: "generation-job-fake-1",
        state: "queued",
        charged: false,
      }),
      job_status: () => ({ jobId: "generation-job-fake-1", state: "completed" }),
      job_output: () => ({
        jobId: "generation-job-fake-1",
        privateOutputReference: "private-output://fake/1",
        provenance: {
          model: "image-model-allowlisted",
          generatedAt: "2026-07-30T12:00:00.000Z",
          source: "deterministic_fake",
        },
      }),
      job_cancel: () => ({ jobId: "generation-job-fake-1", state: "cancelled" }),
    },
  });
}

function tool(name: string, inputSchema: JsonObject): McpToolDefinition {
  return {
    name,
    description: `Deterministic fixture for ${name}`,
    inputSchema,
    outputSchema: { type: "object" },
  };
}

function governedSocialSchema(): JsonObject {
  return {
    type: "object",
    properties: {
      contentApproved: { type: "boolean" },
      assetApproved: { type: "boolean" },
      destinationId: { type: "string" },
      destinations: { type: "array" },
    },
    required: ["contentApproved", "assetApproved", "destinationId"],
  };
}

function generationSchema(media: string): JsonObject {
  return {
    type: "object",
    properties: {
      model: { type: "string" },
      promptReference: { type: "string" },
      estimatedCost: { type: "number" },
      outputReviewRequired: { type: "boolean" },
      media: { type: "string", const: media },
    },
    required: [
      "model",
      "promptReference",
      "estimatedCost",
      "outputReviewRequired",
    ],
  };
}

function jobSchema(): JsonObject {
  return {
    type: "object",
    properties: { jobId: { type: "string" } },
    required: ["jobId"],
  };
}

function partialDestinationResults(input: JsonObject): JsonObject[] {
  const destinations = Array.isArray(input.destinations)
    ? input.destinations.filter((item): item is string => typeof item === "string")
    : [String(input.destinationId)];
  return destinations.map((destinationId, index) => ({
    destinationId,
    status: index === 0 ? "accepted" : "failed",
    errorCode: index === 0 ? null : "synthetic_destination_rejected",
  }));
}
