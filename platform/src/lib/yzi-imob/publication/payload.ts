import { createHash } from "node:crypto";

import type { Property } from "@/lib/yzi-imob/properties/types";

import { evaluatePropertyPublicationReadiness } from "./readiness.ts";
import type {
  PropertyCtaContext,
  PropertyPublicationMedia,
  PropertyPublicMedia,
  PropertyPublicPayload,
  PropertySeoContract,
} from "./types.ts";

const PRICE_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export type BuildPropertyPublicPayloadInput = {
  property: Property;
  publicSlug: string;
  media: readonly PropertyPublicationMedia[];
  publicationVersion: number;
  publishedAt?: string | null;
  publicBaseUrl?: string | null;
};

export type BuildPropertyPublicPayloadResult =
  | {
      status: "ok";
      payload: PropertyPublicPayload;
      contentHash: string;
    }
  | {
      status: "not_ready";
      readiness: ReturnType<typeof evaluatePropertyPublicationReadiness>;
    };

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function derivePropertyPublicSlug(
  property: Pick<Property, "id" | "title" | "referenceCode">,
): string {
  const discriminator = property.referenceCode?.trim() || property.id.slice(0, 8);
  return slugify(`${property.title}-${discriminator}`);
}

function publicStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string") {
      const normalized = item.trim();
      return normalized && normalized.length <= 120 ? [normalized] : [];
    }
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const label = (item as Record<string, unknown>).label;
      if (typeof label === "string" && label.trim() && label.trim().length <= 120) {
        return [label.trim()];
      }
    }
    return [];
  });
}

function isPriceHidden(property: Property): boolean {
  return (
    property.commercialContext.priceHidden === true ||
    property.commercialContext.price_policy === "on_request"
  );
}

function absoluteCanonicalUrl(baseUrl: string | null | undefined, slug: string): string | null {
  if (!baseUrl) return null;
  try {
    const url = new URL(`/imoveis/${slug}`, baseUrl);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function buildPropertyCtaContext(
  propertyId: string,
  slug: string,
): PropertyCtaContext {
  return {
    propertyId,
    slug,
    url: `/imoveis/${slug}`,
    source: "yzi_imob_site",
    campaign: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    referrer: null,
    initialIntent: "property_interest",
  };
}

function buildCtaHref(context: PropertyCtaContext): string {
  const params = new URLSearchParams({
    property_id: context.propertyId,
    slug: context.slug,
    source: context.source,
    initial_intent: context.initialIntent,
  });
  return `/atendimento?${params.toString()}`;
}

function buildSeoContract(
  property: Property,
  slug: string,
  description: string,
  publicBaseUrl: string | null | undefined,
): PropertySeoContract {
  const city = property.city ?? "";
  const neighborhood = property.neighborhood ?? "";
  const propertyType = property.propertyType ?? "";
  const locationSilo = [slugify(city), slugify(neighborhood)].filter(Boolean).join("/");
  const propertyTypeSilo = slugify(propertyType);

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    identifier: property.id,
    name: property.title,
    description,
    url: `/imoveis/${slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressRegion: neighborhood,
    },
  };

  if (property.price !== null && !isPriceHidden(property)) {
    structuredData.offers = {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    };
  }

  return {
    title: property.title.trim().slice(0, 70),
    metaDescription: description.replace(/\s+/g, " ").slice(0, 160),
    canonicalUrl: absoluteCanonicalUrl(publicBaseUrl, slug),
    robots: "index,follow",
    structuredData,
    sitemapInclusion: true,
    locationSilo,
    propertyTypeSilo,
    developmentSilo: null,
    relatedContentIdentifiers: [
      `location:${locationSilo}`,
      `property_type:${propertyTypeSilo}`,
    ].filter((value) => !value.endsWith(":")),
  };
}

function toPublicMedia(item: PropertyPublicationMedia): PropertyPublicMedia | null {
  if (
    !item.isPublicationAllowed ||
    item.processingStatus !== "ready" ||
    !item.url
  ) {
    return null;
  }
  return {
    id: item.id,
    type: item.mediaType,
    url: item.url,
    alt: item.altText?.trim() || "",
    sortOrder: item.sortOrder,
  };
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

export function hashPropertyPublicPayload(payload: PropertyPublicPayload): string {
  return createHash("sha256").update(stableJson(payload)).digest("hex");
}

export function buildPropertyPublicPayload(
  input: BuildPropertyPublicPayloadInput,
): BuildPropertyPublicPayloadResult {
  const readiness = evaluatePropertyPublicationReadiness({
    property: input.property,
    publicSlug: input.publicSlug,
    media: input.media,
  });
  if (!readiness.ready) return { status: "not_ready", readiness };

  const description = (
    input.property.optimizedDescription ??
    input.property.description ??
    ""
  ).trim();
  const ctaContext = buildPropertyCtaContext(input.property.id, input.publicSlug);
  const publicMedia = input.media
    .map(toPublicMedia)
    .filter((item): item is PropertyPublicMedia => item !== null)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id));
  const cover = publicMedia.find(
    (item) => input.media.find((source) => source.id === item.id)?.isCover,
  );
  if (!cover) return { status: "not_ready", readiness };

  const gallery = publicMedia.filter((item) => item.type === "image");
  const videos = publicMedia.filter((item) => item.type === "video");
  const publicLocation = [input.property.neighborhood, input.property.city]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(", ");
  const features = publicStrings(input.property.propertyFeatures);
  const highlights = publicStrings(input.property.condominiumAmenities).slice(0, 6);

  const payload: PropertyPublicPayload = {
    property_id: input.property.id,
    tenant_id: input.property.tenantId,
    slug: input.publicSlug,
    title: input.property.title.trim(),
    description,
    property_type: input.property.propertyType ?? "",
    operation_type: input.property.transactionType ?? "",
    city: input.property.city ?? "",
    neighborhood: input.property.neighborhood ?? "",
    public_location: publicLocation,
    price_display:
      input.property.price !== null && !isPriceHidden(input.property)
        ? {
            visibility: "visible",
            amount: input.property.price,
            currency: "BRL",
            formatted: PRICE_FORMATTER.format(input.property.price),
          }
        : { visibility: "on_request", label: "Sob consulta" },
    bedrooms: input.property.bedrooms,
    suites: input.property.suites,
    bathrooms: input.property.bathrooms,
    parking_spaces: input.property.parkingSpaces,
    area: {
      private: input.property.privateArea,
      total: input.property.totalArea,
      unit: "m2",
    },
    features,
    highlights,
    development: null,
    gallery,
    cover,
    videos,
    cta: {
      label: "Tenho interesse",
      href: buildCtaHref(ctaContext),
      context: ctaContext,
    },
    seo: buildSeoContract(
      input.property,
      input.publicSlug,
      description,
      input.publicBaseUrl,
    ),
    status: input.publishedAt ? "published" : "ready_to_publish",
    published_at: input.publishedAt ?? null,
    updated_at: input.property.updatedAt,
    publication_version: input.publicationVersion,
  };

  return {
    status: "ok",
    payload,
    contentHash: hashPropertyPublicPayload(payload),
  };
}

export const EXPLICITLY_EXCLUDED_PUBLIC_PROPERTY_FIELDS = [
  "private_location",
  "owner",
  "owner_contact",
  "documents",
  "internal_notes",
  "internal_costs",
  "operational_comments",
  "raw_payloads",
  "origin_private_fields",
  "access_instructions",
  "meeting_point",
  "created_by_user_id",
] as const;
