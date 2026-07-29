import "server-only";

import { createHash } from "node:crypto";

import {
  CREATIVE_CONTRACT_VERSION,
  type CarouselBlueprint,
  type CreativeContentSnapshot,
  type CreativeGenerationContext,
  type SyntheticCreativeOutput,
  type VideoTourBlueprint,
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

function locationLabel(context: CreativeGenerationContext): string {
  return [context.property.neighborhood, context.property.city].filter(Boolean).join(", ");
}

function carouselBlueprint(context: CreativeGenerationContext): CarouselBlueprint {
  const selected = context.sourceMedia.slice(0, 4);
  const detail = [
    context.property.bedrooms === null ? null : `${context.property.bedrooms} quartos`,
    context.property.privateArea === null ? null : `${context.property.privateArea} m²`,
  ]
    .filter(Boolean)
    .join(" • ");

  return {
    kind: "carousel_blueprint",
    slides: [
      {
        order: 1,
        role: "cover",
        headline: context.property.title,
        sourceMediaId: selected[0]?.id ?? null,
      },
      ...selected.slice(1).map((media, index) => ({
        order: index + 2,
        role: "highlight" as const,
        headline: `Destaque ${index + 1} do imóvel`,
        sourceMediaId: media.id,
      })),
      {
        order: selected.length + 1,
        role: "details",
        headline: detail || locationLabel(context) || "Conheça os detalhes",
        sourceMediaId: null,
      },
      {
        order: selected.length + 2,
        role: "call_to_action",
        headline: "Agende uma visita",
        sourceMediaId: null,
      },
    ],
  };
}

function videoTourBlueprint(context: CreativeGenerationContext): VideoTourBlueprint {
  const selected = context.sourceMedia.slice(0, 6);
  return {
    kind: "video_tour_blueprint",
    durationSeconds: selected.length * 4,
    scenes: selected.map((media, index) => ({
      order: index + 1,
      durationSeconds: 4,
      direction:
        index === 0
          ? `Abertura do imóvel: ${context.property.title}`
          : `Percurso visual pelo ambiente ${index + 1}`,
      sourceMediaId: media.id,
    })),
  };
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
        deliverable_type: deliverable.deliverableType,
        channels: context.request.intendedChannels,
        objective: context.request.objective,
        synthetic: true,
        rendered: false,
        publication_contract: {
          property_id: context.property.id,
          creative_revision_required: true,
          external_publication_allowed: false,
        },
        blueprint:
          deliverable.deliverableType === "carousel"
            ? carouselBlueprint(context)
            : videoTourBlueprint(context),
      };

      return {
        deliverable_type: deliverable.deliverableType,
        content_hash: hashCreativeSnapshot(snapshot),
        content_snapshot: snapshot,
      };
    });
  }
}
