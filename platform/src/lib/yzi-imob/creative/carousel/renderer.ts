import { createHash } from "node:crypto";

import { PROPERTY_EDITORIAL_V1 } from "./template-registry.ts";
import type { CarouselEditorialPlan } from "./types.ts";

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

export type DeterministicCarouselAsset = {
  position: number;
  role: string;
  width: 1080;
  height: 1350;
  mediaId: string | null;
  syntheticUri: string;
  contentHash: string;
  assetKind: "structured_preview";
  storageState: "not_required";
  publicationState: "not_eligible";
  storageBucket: null;
  objectPath: null;
  preview: {
    headline: string;
    body: string | null;
    layoutVariant: string;
  };
};

export function renderDeterministicCarousel(
  plan: CarouselEditorialPlan,
  identity: { requestId: string; deliverableId: string; revisionNumber: number },
): readonly DeterministicCarouselAsset[] {
  if (plan.cards.length !== PROPERTY_EDITORIAL_V1.cardCount) {
    throw new Error("invalid_carousel_card_count");
  }
  return plan.cards.map((card) => {
    const descriptor = {
      template: plan.templateKey,
      templateVersion: plan.templateVersion,
      width: PROPERTY_EDITORIAL_V1.width,
      height: PROPERTY_EDITORIAL_V1.height,
      card,
    };
    return {
      position: card.position,
      role: card.role,
      width: PROPERTY_EDITORIAL_V1.width,
      height: PROPERTY_EDITORIAL_V1.height,
      mediaId: card.mediaId ?? null,
      syntheticUri: `yzi://creative/${identity.requestId}/${identity.deliverableId}/r${identity.revisionNumber}/card-${card.position}`,
      contentHash: createHash("sha256").update(stableJson(descriptor)).digest("hex"),
      assetKind: "structured_preview",
      storageState: "not_required",
      publicationState: "not_eligible",
      storageBucket: null,
      objectPath: null,
      preview: {
        headline: card.headline,
        body: card.body ?? null,
        layoutVariant: card.layoutVariant,
      },
    };
  });
}
