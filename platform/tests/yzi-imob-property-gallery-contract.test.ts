import assert from "node:assert/strict";
import test from "node:test";

import {
  PROPERTY_GALLERY_SLOTS,
  PROPERTY_MEDIA_ALLOWED_FILES,
  PROPERTY_MEDIA_LIMITS,
  buildPropertyCreativeRunPath,
  buildPropertySourceMediaPath,
  mediaForGallerySlot,
  validatePropertyMediaFile,
} from "../src/lib/yzi-imob/creative/media/gallery-contract.ts";
import type { PropertyPublicationMedia } from "../src/lib/yzi-imob/publication/types.ts";

function media(overrides: Partial<PropertyPublicationMedia>): PropertyPublicationMedia {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    tenantId: "00000000-0000-4000-8000-000000000002",
    propertyId: "00000000-0000-4000-8000-000000000003",
    mediaType: "image",
    storageBucket: null,
    storagePath: null,
    url: null,
    altText: null,
    sortOrder: 0,
    isCover: false,
    isPublicationAllowed: false,
    processingStatus: "ready",
    environmentType: "other",
    displayOrder: 0,
    isPrimary: false,
    eligibleForCarousel: false,
    eligibleForVideo: false,
    mediaStatus: "pending",
    orientation: "unknown",
    width: null,
    height: null,
    humanNote: null,
    exclusionReason: null,
    slot: null,
    originalFilename: null,
    mimeType: null,
    fileExtension: null,
    byteSize: null,
    sourceKind: null,
    uploadState: null,
    ...overrides,
  };
}

test("expõe os dez slots do contrato de galeria", () => {
  assert.deepEqual(
    PROPERTY_GALLERY_SLOTS.map((slot) => slot.key),
    [
      "primary",
      "facade",
      "location_view",
      "entrance",
      "common_area",
      "leisure",
      "interior",
      "floor_plan",
      "raw_video",
      "commercial_document",
    ],
  );
});

test("mantém limites e tipos explícitos por classe de arquivo", () => {
  assert.equal(PROPERTY_MEDIA_LIMITS.image.maxBytes, 10 * 1024 * 1024);
  assert.equal(PROPERTY_MEDIA_LIMITS.rawVideo.maxBytes, 50 * 1024 * 1024);
  assert.equal(PROPERTY_MEDIA_LIMITS.document.maxBytes, 25 * 1024 * 1024);
  assert.equal(PROPERTY_MEDIA_LIMITS.image.maxPerProperty, 30);
  assert.equal(PROPERTY_MEDIA_LIMITS.rawVideo.maxPerProperty, 5);
  assert.equal(PROPERTY_MEDIA_LIMITS.document.maxPerProperty, 10);
  assert.deepEqual(PROPERTY_MEDIA_ALLOWED_FILES.document.mimeTypes, ["application/pdf"]);
});

test("organiza registros reais nos slots sem inventar documentos", () => {
  const records = [
    media({ isPrimary: true, environmentType: "facade" }),
    media({ id: "00000000-0000-4000-8000-000000000004", mediaType: "video" }),
    media({ id: "00000000-0000-4000-8000-000000000005", environmentType: "brand" }),
  ];
  const primary = PROPERTY_GALLERY_SLOTS.find((slot) => slot.key === "primary")!;
  const rawVideo = PROPERTY_GALLERY_SLOTS.find((slot) => slot.key === "raw_video")!;
  const document = PROPERTY_GALLERY_SLOTS.find((slot) => slot.key === "commercial_document")!;

  assert.equal(mediaForGallerySlot(primary, records).length, 1);
  assert.equal(mediaForGallerySlot(rawVideo, records).length, 1);
  assert.equal(mediaForGallerySlot(document, records).length, 1);
  assert.equal(document.support, "current");
});

test("documenta os paths alvo sem sobrescrita implícita", () => {
  assert.equal(
    buildPropertySourceMediaPath({
      tenantId: "tenant-id",
      propertyId: "property-id",
      slot: "facade",
      mediaId: "media-id",
      fileExtension: "webp",
    }),
    "tenants/tenant-id/properties/property-id/source-media/facade/media-id.webp",
  );
  assert.equal(
    buildPropertyCreativeRunPath({
      tenantId: "tenant-id",
      propertyId: "property-id",
      runId: "run-id",
      format: "carousel",
      safeFilename: "card-01.png",
    }),
    "tenant/tenant-id/properties/property-id/creative-runs/run-id/carousel/card-01.png",
  );
});

test("valida tipo, extensão e tamanho por slot antes da reserva", () => {
  assert.deepEqual(
    validatePropertyMediaFile("facade", {
      name: "fachada.webp",
      type: "image/webp",
      size: 1024,
    }),
    { valid: true, mediaClass: "image" },
  );
  assert.equal(
    validatePropertyMediaFile("raw_video", {
      name: "tour.pdf",
      type: "application/pdf",
      size: 1024,
    }).valid,
    false,
  );
  assert.equal(
    validatePropertyMediaFile("commercial_document", {
      name: "folder.pdf",
      type: "application/pdf",
      size: PROPERTY_MEDIA_LIMITS.document.maxBytes + 1,
    }).valid,
    false,
  );
});
