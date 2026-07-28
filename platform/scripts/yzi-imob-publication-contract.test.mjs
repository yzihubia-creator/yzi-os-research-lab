import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  buildPropertyCtaContext,
  buildPropertyPublicPayload,
  derivePropertyPublicSlug,
  hashPropertyPublicPayload,
} from "../src/lib/yzi-imob/publication/payload.ts";
import { evaluatePropertyPublicationReadiness } from "../src/lib/yzi-imob/publication/readiness.ts";
import {
  PROPERTY_PUBLICATION_STATUS_VALUES,
} from "../src/lib/yzi-imob/publication/types.ts";

function source(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const MIGRATION = source(
  "../../supabase/migrations/20260728171553_yzi_imob_governed_property_publication_v1.sql",
);
const HARDENING_MIGRATION = source(
  "../../supabase/migrations/20260728175307_yzi_imob_property_publication_access_hardening_v1.sql",
);
const REPOSITORY = source("../src/lib/yzi-imob/publication/repository.ts");
const PAYLOAD_SOURCE = source("../src/lib/yzi-imob/publication/payload.ts");
const SITE_PAGE = source("../src/app/cockpit/yzi-imob/site/page.tsx");
const PROPERTY_PAGE = source("../src/app/cockpit/yzi-imob/imoveis/[id]/page.tsx");
const PROPERTY_WORKSPACE = source(
  "../src/components/yzi-imob/yzi-imob-property-workspace.tsx",
);

function property(overrides = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    tenantId: "22222222-2222-4222-8222-222222222222",
    referenceCode: "REF-101",
    title: "Apartamento com vista para o parque",
    propertyType: "apartamento",
    transactionType: "venda",
    status: "active",
    city: "São Paulo",
    neighborhood: "Jardins",
    price: 1250000,
    description:
      "Apartamento com ambientes integrados, iluminação natural e características objetivas suficientes para uma apresentação pública completa.",
    attributes: {},
    stage: "review",
    availabilityStatus: "available",
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    parkingSpaces: 2,
    privateArea: 128,
    totalArea: 160,
    floor: 8,
    solarOrientation: "north",
    furnishedStatus: "unfurnished",
    condominiumFee: 1200,
    iptuValue: 450,
    originalDescription: null,
    optimizedDescription: null,
    shortSummary: null,
    editorialStatus: "approved",
    createdByUserId: "33333333-3333-4333-8333-333333333333",
    propertyFeatures: ["Varanda", "Iluminação natural"],
    condominiumAmenities: ["Piscina", "Academia"],
    surroundings: [],
    commercialContext: {},
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-28T10:00:00.000Z",
    ...overrides,
  };
}

function media() {
  return [
    {
      id: "cover",
      mediaType: "image",
      url: "https://cdn.example.test/property/cover.jpg",
      altText: "Sala do apartamento",
      sortOrder: 0,
      isCover: true,
      isPublicationAllowed: true,
      processingStatus: "ready",
    },
    {
      id: "gallery-2",
      mediaType: "image",
      url: "https://cdn.example.test/property/bedroom.jpg",
      altText: "Quarto do apartamento",
      sortOrder: 1,
      isCover: false,
      isPublicationAllowed: true,
      processingStatus: "ready",
    },
    {
      id: "gallery-3",
      mediaType: "image",
      url: "https://cdn.example.test/property/balcony.jpg",
      altText: "Varanda do apartamento",
      sortOrder: 2,
      isCover: false,
      isPublicationAllowed: true,
      processingStatus: "ready",
    },
  ];
}

test("readiness rejects incomplete, invalid, unavailable and media-less properties", () => {
  const result = evaluatePropertyPublicationReadiness({
    property: property({
      title: "Curto",
      city: null,
      price: -1,
      availabilityStatus: "sold",
    }),
    publicSlug: "Slug Inválido",
    media: [],
  });

  assert.equal(result.ready, false);
  assert.ok(result.missingFields.includes("city"));
  assert.ok(result.invalidFields.includes("title"));
  assert.ok(result.invalidFields.includes("price"));
  assert.ok(result.invalidFields.includes("slug"));
  assert.ok(result.mediaIssues.includes("cover_missing"));
  assert.ok(result.mediaIssues.includes("gallery_below_minimum"));
  assert.ok(result.blockers.includes("property_not_available"));
  assert.equal(result.publicationEligibility.eligible, false);
});

test("readiness is applicability-aware and accepts explicit hidden-price policy", () => {
  const nonResidential = property({
    propertyType: "terreno",
    bedrooms: null,
    suites: null,
    bathrooms: null,
    parkingSpaces: null,
    price: null,
    commercialContext: { price_policy: "on_request" },
  });
  const result = evaluatePropertyPublicationReadiness({
    property: nonResidential,
    publicSlug: derivePropertyPublicSlug(nonResidential),
    media: media(),
  });

  assert.equal(result.ready, true);
  assert.equal(result.blockers.length, 0);
  assert.ok(result.warnings.includes("price_hidden_by_policy"));
  assert.ok(!result.missingFields.includes("bedrooms"));
});

test("public payload is deterministic, versioned and excludes private property data", () => {
  const canonical = property();
  const slug = derivePropertyPublicSlug(canonical);
  const result = buildPropertyPublicPayload({
    property: canonical,
    publicSlug: slug,
    media: media(),
    publicationVersion: 2,
    publicBaseUrl: "https://imoveis.example.test",
  });
  assert.equal(result.status, "ok");
  if (result.status !== "ok") return;

  assert.equal(result.payload.property_id, canonical.id);
  assert.equal(result.payload.slug, slug);
  assert.equal(result.payload.publication_version, 2);
  assert.equal(result.payload.cover.id, "cover");
  assert.equal(result.payload.gallery.length, 3);
  assert.equal(result.payload.price_display.visibility, "visible");
  assert.equal(result.payload.seo.canonicalUrl, `https://imoveis.example.test/imoveis/${slug}`);
  assert.equal(result.contentHash, hashPropertyPublicPayload(result.payload));
  assert.match(result.contentHash, /^[a-f0-9]{64}$/);

  const serialized = JSON.stringify(result.payload);
  for (const forbidden of [
    "private_location",
    "owner_contact",
    "documents",
    "internal_notes",
    "internal_costs",
    "operational_comments",
    "raw_payloads",
    "access_instructions",
    "meeting_point",
  ]) {
    assert.doesNotMatch(serialized, new RegExp(forbidden, "i"));
  }
});

test("CTA preserves property context without invented free text", () => {
  const context = buildPropertyCtaContext(
    "11111111-1111-4111-8111-111111111111",
    "apartamento-ref-101",
  );
  assert.deepEqual(context, {
    propertyId: "11111111-1111-4111-8111-111111111111",
    slug: "apartamento-ref-101",
    url: "/imoveis/apartamento-ref-101",
    source: "yzi_imob_site",
    campaign: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    referrer: null,
    initialIntent: "property_interest",
  });
});

test("publication schema is tenant-scoped, immutable-by-grant and idempotent", () => {
  for (const table of [
    "yzi_imob_property_media",
    "yzi_imob_property_publication_revisions",
    "yzi_imob_property_publications",
    "yzi_imob_property_publication_jobs",
    "yzi_imob_property_publication_events",
  ]) {
    assert.match(MIGRATION, new RegExp(`create table public\\.${table}`, "i"));
    assert.match(MIGRATION, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  }
  assert.match(
    MIGRATION,
    /foreign key \(property_id, tenant_id\)[\s\S]*references public\.yzi_imob_properties \(id, tenant_id\)/i,
  );
  assert.match(
    MIGRATION,
    /unique \(tenant_id, publication_channel, idempotency_key\)/i,
  );
  assert.match(MIGRATION, /current_revision_id is distinct from v_publication\.approved_revision_id/i);
  assert.match(MIGRATION, /property_already_published_use_update/i);
  assert.match(MIGRATION, /property_not_yet_published/i);
  assert.match(MIGRATION, /attempt_count >= v_job\.max_attempts/i);
  assert.match(MIGRATION, /from public, anon, authenticated/i);
  assert.doesNotMatch(
    MIGRATION,
    /grant (?:insert|update|delete|all)[\s\S]{0,160}yzi_imob_property_publication_revisions[\s\S]{0,80}to authenticated/i,
  );
  assert.match(HARDENING_MIGRATION, /from public, anon/i);
  for (const command of ["insert", "update", "delete"]) {
    assert.match(
      HARDENING_MIGRATION,
      new RegExp(`property_media_${command}_operator[\\s\\S]*for ${command}`, "i"),
    );
  }
});

test("review, approval, publish, update, pause, unpublish and retry are explicit operations", () => {
  for (const rpc of [
    "request_yzi_imob_property_publication_review",
    "decide_yzi_imob_property_publication_revision",
    "enqueue_yzi_imob_property_publication",
    "mark_yzi_imob_property_publication_started",
    "mark_yzi_imob_property_publication_synced",
    "mark_yzi_imob_property_publication_failed",
    "retry_yzi_imob_property_publication",
    "set_yzi_imob_property_publication_availability",
  ]) {
    assert.match(MIGRATION, new RegExp(`function public\\.${rpc}`, "i"));
    assert.match(REPOSITORY, new RegExp(rpc));
  }
  for (const event of [
    "review_requested",
    "approved",
    "rejected",
    "publish_queued",
    "publish_started",
    "publish_succeeded",
    "publish_failed",
    "update_queued",
    "paused",
    "unpublished",
    "retry_requested",
  ]) {
    assert.match(MIGRATION, new RegExp(`'${event}'`));
  }
});

test("all canonical publication lifecycle distinctions exist", () => {
  assert.deepEqual(PROPERTY_PUBLICATION_STATUS_VALUES, [
    "draft",
    "incomplete",
    "under_review",
    "changes_required",
    "ready_to_publish",
    "approved",
    "publishing",
    "published",
    "update_pending",
    "paused",
    "unpublished",
    "archived",
    "failed",
  ]);
});

test("repository queries always carry tenant/property boundaries", () => {
  assert.match(REPOSITORY, /\.eq\("tenant_id", tenantId\)/);
  assert.match(REPOSITORY, /\.eq\("property_id", propertyId\)/);
  assert.match(REPOSITORY, /getPropertyById\(supabase, tenantId, propertyId\)/);
  assert.match(REPOSITORY, /approved[\s\S]*content_snapshot/i);
  assert.doesNotMatch(REPOSITORY, /service_role|SUPABASE_SERVICE_ROLE/i);
});

test("site and property workspace consume governance without a CMS or raw payload", () => {
  assert.match(SITE_PAGE, /getSitePublicationGovernanceSummary/);
  assert.doesNotMatch(SITE_PAGE, /YziImobSiteSilosV0/);
  assert.match(PROPERTY_PAGE, /getPropertyPublicationWorkspace/);
  assert.match(PROPERTY_PAGE, /evaluatePropertyPublicationReadiness/);
  assert.match(PROPERTY_WORKSPACE, /YziImobPropertyPublicationPanel/);
  assert.doesNotMatch(PROPERTY_WORKSPACE, /Publicacao - em breve/);
  assert.doesNotMatch(PROPERTY_WORKSPACE, /content_snapshot|raw payload/i);
  assert.doesNotMatch(PAYLOAD_SOURCE, /privateLocation|accessInstructions|meetingPoint/);
});
