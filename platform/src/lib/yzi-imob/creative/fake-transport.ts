import "server-only";

import { createHash } from "node:crypto";

import { buildCarouselEditorialPlan } from "./carousel/editorial-plan.ts";
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
      const snapshot: CreativeContentSnapshot = {
        contract_version: CREATIVE_CONTRACT_VERSION,
        property_id: context.property.id,
        request_id: context.request.id,
        deliverable_id: deliverable.id,
        deliverable_type: "carousel",
        channels: context.request.intendedChannels,
        objective: context.request.objective,
        synthetic: true,
        rendered: false,
        publication_contract: {
          property_id: context.property.id,
          creative_revision_required: true,
          external_publication_allowed: false,
        },
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
