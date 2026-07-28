import type { Property } from "@/lib/yzi-imob/properties/types";

import type {
  PropertyPublicationMedia,
  PropertyPublicationReadiness,
} from "./types.ts";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_PATTERN = /^https:\/\/[^\s]+$/;
const MIN_TITLE_LENGTH = 10;
const MIN_DESCRIPTION_LENGTH = 80;
const MIN_GALLERY_IMAGES = 3;

const RESIDENTIAL_TYPES = new Set([
  "apartamento",
  "apartment",
  "casa",
  "house",
  "studio",
  "cobertura",
  "duplex",
  "triplex",
]);

const AREA_NOT_APPLICABLE_TYPES = new Set(["vaga", "garagem", "parking_space"]);

export type PropertyReadinessInput = {
  property: Property;
  publicSlug: string | null;
  media: readonly PropertyPublicationMedia[];
};

function normalizedType(propertyType: string | null): string {
  return propertyType?.trim().toLowerCase() ?? "";
}

function priceIsHidden(property: Property): boolean {
  return (
    property.commercialContext.priceHidden === true ||
    property.commercialContext.price_policy === "on_request"
  );
}

function pushUnique(target: string[], value: string) {
  if (!target.includes(value)) target.push(value);
}

export function evaluatePropertyPublicationReadiness(
  input: PropertyReadinessInput,
): PropertyPublicationReadiness {
  const { property, publicSlug, media } = input;
  const blockers: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];
  const invalidFields: string[] = [];
  const mediaIssues: string[] = [];

  const requireField = (present: boolean, field: string) => {
    if (!present) {
      pushUnique(missingFields, field);
      pushUnique(blockers, `missing_${field}`);
    }
  };

  const propertyType = normalizedType(property.propertyType);
  const description = (property.optimizedDescription ?? property.description ?? "").trim();
  const isResidential = RESIDENTIAL_TYPES.has(propertyType);
  const requiresArea = !AREA_NOT_APPLICABLE_TYPES.has(propertyType);

  requireField(property.title.trim().length > 0, "title");
  requireField(propertyType.length > 0, "property_type");
  requireField(Boolean(property.transactionType?.trim()), "operation_type");
  requireField(Boolean(property.city?.trim()), "city");
  requireField(Boolean(property.neighborhood?.trim()), "neighborhood");
  requireField(property.price !== null || priceIsHidden(property), "price_or_visibility_policy");
  requireField(description.length > 0, "description");
  requireField(Boolean(publicSlug), "slug");

  if (requiresArea) {
    requireField(property.privateArea !== null || property.totalArea !== null, "area");
  }

  if (isResidential) {
    requireField(property.bedrooms !== null, "bedrooms");
    requireField(property.suites !== null, "suites");
    requireField(property.bathrooms !== null, "bathrooms");
    requireField(property.parkingSpaces !== null, "parking_spaces");
  }

  if (property.title.trim().length > 0 && property.title.trim().length < MIN_TITLE_LENGTH) {
    pushUnique(invalidFields, "title");
    pushUnique(blockers, "title_too_short");
  }

  if (description.length > 0 && description.length < MIN_DESCRIPTION_LENGTH) {
    pushUnique(invalidFields, "description");
    pushUnique(blockers, "description_too_short");
  }

  if (publicSlug && (!SLUG_PATTERN.test(publicSlug) || publicSlug.length > 160)) {
    pushUnique(invalidFields, "slug");
    pushUnique(blockers, "slug_invalid");
  }

  if (property.price !== null && (!Number.isFinite(property.price) || property.price < 0)) {
    pushUnique(invalidFields, "price");
    pushUnique(blockers, "price_invalid");
  }

  for (const [field, value] of [
    ["bedrooms", property.bedrooms],
    ["suites", property.suites],
    ["bathrooms", property.bathrooms],
    ["parking_spaces", property.parkingSpaces],
  ] as const) {
    if (value !== null && (!Number.isInteger(value) || value < 0)) {
      pushUnique(invalidFields, field);
      pushUnique(blockers, `${field}_invalid`);
    }
  }

  if (property.availabilityStatus !== "available") {
    if (property.availabilityStatus === null) pushUnique(missingFields, "availability");
    else pushUnique(invalidFields, "availability");
    pushUnique(blockers, "property_not_available");
  }

  const allowedReadyMedia = media.filter(
    (item) => item.isPublicationAllowed && item.processingStatus === "ready",
  );
  const readyImages = allowedReadyMedia.filter((item) => item.mediaType === "image");
  const covers = readyImages.filter((item) => item.isCover);

  if (covers.length === 0) {
    pushUnique(mediaIssues, "cover_missing");
    pushUnique(blockers, "cover_missing");
  } else if (covers.length > 1) {
    pushUnique(mediaIssues, "multiple_covers");
    pushUnique(blockers, "multiple_covers");
  }

  if (readyImages.length < MIN_GALLERY_IMAGES) {
    pushUnique(mediaIssues, "gallery_below_minimum");
    pushUnique(blockers, "gallery_below_minimum");
  }

  for (const item of media) {
    if (!item.isPublicationAllowed) continue;
    if (item.processingStatus === "processing") {
      pushUnique(mediaIssues, `media_processing:${item.id}`);
      pushUnique(warnings, "media_processing_excluded");
    }
    if (item.processingStatus === "failed") {
      pushUnique(mediaIssues, `media_failed:${item.id}`);
      pushUnique(warnings, "media_failed_excluded");
    }
    if (item.processingStatus === "ready" && (!item.url || !URL_PATTERN.test(item.url))) {
      pushUnique(mediaIssues, `media_url_invalid:${item.id}`);
      pushUnique(blockers, "media_url_invalid");
    }
    if (item.mediaType === "image" && item.processingStatus === "ready" && !item.altText?.trim()) {
      pushUnique(warnings, "image_alt_text_missing");
    }
  }

  if (priceIsHidden(property)) pushUnique(warnings, "price_hidden_by_policy");
  pushUnique(warnings, "canonical_url_pending_until_first_sync");

  const ready = blockers.length === 0;
  return {
    ready,
    blockers,
    warnings,
    missingFields,
    invalidFields,
    mediaIssues,
    publicationEligibility: {
      eligible: ready,
      reasonCodes: ready ? [] : blockers,
    },
  };
}
