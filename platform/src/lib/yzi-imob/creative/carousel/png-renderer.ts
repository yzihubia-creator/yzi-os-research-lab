import "server-only";

import { createHash } from "node:crypto";

import { PROPERTY_EDITORIAL_V1 } from "./template-registry.ts";
import type { CarouselCard, CarouselEditorialPlan } from "./types.ts";

export type CanonicalCarouselMedia = {
  id: string;
  tenantId: string;
  propertyId: string;
  contentHash: string;
  bytes: Buffer;
};

export type RenderedCarouselPng = {
  fileName: `card-0${1 | 2 | 3 | 4 | 5 | 6 | 7}.png`;
  position: number;
  width: 1080;
  height: 1350;
  mediaProvenance: readonly string[];
  templateKey: "property_editorial_v1";
  templateVersion: 1;
  contentHash: string;
  bytes: Buffer;
  assetKind: "rendered_preview";
  storageState: "pending";
  publicationState: "not_eligible";
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function assertCopyFits(card: CarouselCard): void {
  if (card.headline.length > 72 || (card.body?.length ?? 0) > 180) {
    throw new Error(`carousel_copy_overflow_card_${card.position}`);
  }
}

function overlayFor(card: CarouselCard): Buffer {
  assertCopyFits(card);
  const body = card.body
    ? `<text x="72" y="1120" fill="#e9edf2" font-family="Arial, sans-serif" font-size="34">${escapeXml(card.body)}</text>`
    : "";
  return Buffer.from(
    `<svg width="1080" height="1350" xmlns="http://www.w3.org/2000/svg">
      <rect width="1080" height="1350" fill="#121820" fill-opacity="0.28"/>
      <rect x="48" y="850" width="984" height="440" rx="28" fill="#071018" fill-opacity="0.84"/>
      <text x="72" y="1010" fill="#ffffff" font-family="Arial, sans-serif" font-size="58" font-weight="700">${escapeXml(card.headline)}</text>
      ${body}
      <text x="72" y="1250" fill="#b8c7d4" font-family="Arial, sans-serif" font-size="24">YZI IMOB</text>
    </svg>`,
  );
}

export async function renderCarouselPngs(input: {
  tenantId: string;
  propertyId: string;
  requestId: string;
  deliverableId: string;
  revisionId: string;
  plan: CarouselEditorialPlan;
  media: readonly CanonicalCarouselMedia[];
}): Promise<readonly RenderedCarouselPng[]> {
  if (input.plan.cards.length !== 7 || input.plan.approvalBlocked) {
    throw new Error("carousel_plan_not_renderable");
  }
  const mediaById = new Map(input.media.map((item) => [item.id, item]));
  if (
    input.media.some(
      (item) => item.tenantId !== input.tenantId || item.propertyId !== input.propertyId,
    )
  ) {
    throw new Error("carousel_media_scope_mismatch");
  }

  const sharpModule = await import("sharp");
  const sharp = sharpModule.default;
  return Promise.all(
    input.plan.cards.map(async (card) => {
      const source = card.mediaId ? mediaById.get(card.mediaId) : undefined;
      if (card.mediaId && !source) throw new Error("carousel_media_not_canonical");
      const base = source
        ? sharp(source.bytes).resize(1080, 1350, { fit: "cover", position: "centre" })
        : sharp({
            create: {
              width: 1080,
              height: 1350,
              channels: 4,
              background: "#17212b",
            },
          });
      const bytes = await base.composite([{ input: overlayFor(card) }]).png().toBuffer();
      const metadata = await sharp(bytes).metadata();
      if (metadata.width !== 1080 || metadata.height !== 1350 || metadata.format !== "png") {
        throw new Error("carousel_png_contract_failed");
      }
      const position = card.position as 1 | 2 | 3 | 4 | 5 | 6 | 7;
      const fileName = `card-0${position}.png` as const;
      return {
        fileName,
        position,
        width: PROPERTY_EDITORIAL_V1.width,
        height: PROPERTY_EDITORIAL_V1.height,
        mediaProvenance: source ? [source.id] : [],
        templateKey: PROPERTY_EDITORIAL_V1.key,
        templateVersion: PROPERTY_EDITORIAL_V1.version,
        contentHash: createHash("sha256").update(bytes).digest("hex"),
        bytes,
        assetKind: "rendered_preview",
        storageState: "pending",
        publicationState: "not_eligible",
      };
    }),
  );
}
