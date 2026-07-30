import "server-only";

import { createHash } from "node:crypto";

import { buildCarouselEditorialPlan } from "./carousel/editorial-plan.ts";
import { buildVideoTourPlan } from "./video-tour/plan.ts";
import {
  CREATIVE_CONTRACT_VERSION,
  type CreativeContentSnapshot,
  type CreativeGenerationContext,
  type SyntheticCreativeOutput,
} from "./types.ts";

export type CreativeGenerationTransport = {
  generate(context: CreativeGenerationContext): Promise<readonly SyntheticCreativeOutput[]>;
};

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function hashCreativeSnapshot(snapshot: CreativeContentSnapshot): string {
  return createHash("sha256").update(stableJson(snapshot)).digest("hex");
}

export class DeterministicCreativeFakeTransport implements CreativeGenerationTransport {
  async generate(
    context: CreativeGenerationContext,
  ): Promise<readonly SyntheticCreativeOutput[]> {
    return context.deliverables.map((deliverable) => {
      const base = {
        contract_version: CREATIVE_CONTRACT_VERSION,
        property_id: context.property.id,
        request_id: context.request.id,
        deliverable_id: deliverable.id,
        channels: context.request.intendedChannels,
        objective: context.request.objective,
        synthetic: true as const,
        rendered: false as const,
        publication_contract: {
          property_id: context.property.id,
          creative_revision_required: true as const,
          external_publication_allowed: false as const,
        },
      };
      const snapshot: CreativeContentSnapshot =
        deliverable.deliverableType === "video_tour"
          ? {
              ...base,
              deliverable_type: "video_tour",
              blueprint: buildVideoTourPlan({
                tenantId: context.tenantId,
                propertyId: context.property.id,
                title: context.property.title,
                cta: "Agende uma visita",
                duration:
                  context.request.context.duration === 15 ||
                  context.request.context.duration === 30
                    ? context.request.context.duration
                    : 20,
                media: context.sourceMedia.map((media) => ({
                  id: media.id,
                  tenantId: context.tenantId,
                  propertyId: context.property.id,
                  mediaType: media.mediaType,
                  environmentType:
                    (media.environmentType as
                      | "facade" | "entrance" | "living_room" | "balcony" | "kitchen"
                      | "bedroom" | "suite" | "bathroom" | "leisure" | "view"
                      | "floor_plan" | "location" | "detail" | "brand" | "other") ?? "other",
                  displayOrder: media.displayOrder ?? media.sortOrder,
                  isPrimary: media.isPrimary ?? media.isCover,
                  eligibleForCarousel: media.eligibleForCarousel ?? true,
                  eligibleForVideo: media.eligibleForVideo ?? true,
                  mediaStatus:
                    media.mediaStatus === "excluded" || media.mediaStatus === "failed"
                      ? media.mediaStatus
                      : "approved",
                  orientation:
                    (media.orientation as "portrait" | "landscape" | "square" | "unknown") ??
                    "unknown",
                  width: null,
                  height: null,
                  humanNote: null,
                  exclusionReason: null,
                })),
              }),
            }
          : {
              ...base,
              deliverable_type: "carousel",
              blueprint: buildCarouselEditorialPlan({
                property: { ...context.property, tenantId: context.tenantId },
                media: context.sourceMedia.map((media) => ({
                  ...media,
                  tenantId: context.tenantId,
                  propertyId: context.property.id,
                })),
                objective:
                  context.request.context.objective_key === "generate_visits"
                    ? "generate_visits"
                    : "present_property",
              }),
            };

      return {
        deliverable_type: deliverable.deliverableType,
        content_hash: hashCreativeSnapshot(snapshot),
        content_snapshot: snapshot,
      };
    });
  }
}
