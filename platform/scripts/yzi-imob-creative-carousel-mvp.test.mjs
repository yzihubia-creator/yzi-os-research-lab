import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  buildCarouselEditorialPlan,
  selectGovernedCarouselMedia,
  validateCarouselPlan,
} from "../src/lib/yzi-imob/creative/carousel/editorial-plan.ts";
import { renderDeterministicCarousel } from "../src/lib/yzi-imob/creative/carousel/renderer.ts";
import {
  CAROUSEL_CARD_ROLES,
  CAROUSEL_TEMPLATE_KEY,
} from "../src/lib/yzi-imob/creative/carousel/types.ts";
import {
  CAROUSEL_TEMPLATE_REGISTRY,
  PROPERTY_EDITORIAL_V1,
} from "../src/lib/yzi-imob/creative/carousel/template-registry.ts";

const source = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const MIGRATION = source("../../supabase/migrations/20260729213000_yzi_imob_creative_carousel_mvp_v1.sql");
const REPOSITORY = source("../src/lib/yzi-imob/creative/repository.ts");
const ACTIONS = source("../src/app/cockpit/yzi-imob/imoveis/[id]/creative/actions.ts");
const FRONTEND = [
  source("../src/app/cockpit/yzi-imob/imoveis/[id]/creative/page.tsx"),
  source("../src/components/yzi-imob/creative/yzi-imob-carousel-review.tsx"),
].join("\n");
const RENDERER = source("../src/lib/yzi-imob/creative/carousel/renderer.ts");

const tenantId = "10000000-0000-4000-8000-000000000001";
const propertyId = "20000000-0000-4000-8000-000000000001";
const property = {
  id: propertyId,
  tenantId,
  referenceCode: "YZ-202",
  title: "Apartamento Horizonte",
  city: "São Paulo",
  neighborhood: "Pinheiros",
  price: 1850000,
  privateArea: 142,
  totalArea: null,
  bedrooms: 3,
  suites: 2,
  parkingSpaces: 2,
  availabilityStatus: "available",
  shortSummary: "Luz natural e espaços bem distribuídos.",
  propertyFeatures: ["Varanda", "Vista aberta", "Home office"],
};
const media = Array.from({ length: 5 }, (_, index) => ({
  id: `60000000-0000-4000-8000-00000000000${index + 1}`,
  tenantId,
  propertyId,
  mediaType: "image",
  sortOrder: index,
  isCover: index === 0,
  isPublicationAllowed: true,
  processingStatus: "ready",
}));

test("registry contains only the canonical 1080x1350 template", () => {
  assert.deepEqual(Object.keys(CAROUSEL_TEMPLATE_REGISTRY), [CAROUSEL_TEMPLATE_KEY]);
  assert.equal(PROPERTY_EDITORIAL_V1.width, 1080);
  assert.equal(PROPERTY_EDITORIAL_V1.height, 1350);
  assert.equal(PROPERTY_EDITORIAL_V1.cardCount, 7);
});

test("editorial plan has exactly seven required cards in order", () => {
  const plan = buildCarouselEditorialPlan({ property, media });
  assert.equal(plan.cards.length, 7);
  assert.deepEqual(plan.cards.map((card) => card.position), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(plan.cards.map((card) => card.role), CAROUSEL_CARD_ROLES);
  assert.deepEqual(validateCarouselPlan(plan).filter((item) => item.severity === "blocking"), []);
});

test("media selection is deterministic and cover-first", () => {
  const shuffled = [media[3], media[1], media[4], media[0], media[2]];
  assert.deepEqual(
    selectGovernedCarouselMedia(tenantId, propertyId, shuffled).map((item) => item.id),
    media.map((item) => item.id),
  );
});

test("media from another property is rejected", () => {
  const foreign = { ...media[0], propertyId: "20000000-0000-4000-8000-000000000099" };
  assert.deepEqual(selectGovernedCarouselMedia(tenantId, propertyId, [foreign]), []);
});

test("media from another tenant is rejected", () => {
  const foreign = { ...media[0], tenantId: "10000000-0000-4000-8000-000000000099" };
  assert.deepEqual(selectGovernedCarouselMedia(tenantId, propertyId, [foreign]), []);
});

test("unready, forbidden and non-image media are rejected", () => {
  assert.deepEqual(
    selectGovernedCarouselMedia(tenantId, propertyId, [
      { ...media[0], processingStatus: "processing" },
      { ...media[1], isPublicationAllowed: false },
      { ...media[2], mediaType: "video" },
    ]),
    [],
  );
});

test("missing canonical facts are omitted and never estimated", () => {
  const plan = buildCarouselEditorialPlan({
    property: { ...property, price: null, privateArea: null, suites: null },
    media,
  });
  const facts = plan.cards.flatMap((card) => card.facts);
  assert.equal(facts.some((item) => item.key === "price"), false);
  assert.equal(facts.some((item) => item.key === "private_area"), false);
  assert.equal(facts.some((item) => item.key === "suites"), false);
  assert.doesNotMatch(JSON.stringify(plan), /estimad|aproximad|urgente/i);
});

test("overflow creates blocking diagnostics and prevents approval", () => {
  const plan = buildCarouselEditorialPlan({
    property: { ...property, title: "Título excessivamente longo ".repeat(8) },
    media,
  });
  assert.equal(plan.diagnostics.some((item) => item.code === "headline_overflow"), true);
  assert.equal(plan.approvalBlocked, true);
});

test("insufficient media is diagnostic and controlled reuse is explicit", () => {
  const plan = buildCarouselEditorialPlan({ property, media: media.slice(0, 2) });
  assert.equal(plan.selectedMediaIds.length, 2);
  assert.equal(plan.diagnostics.some((item) => item.code === "insufficient_media"), true);
  assert.equal(plan.diagnostics.some((item) => item.code === "excessive_media_reuse"), true);
  assert.equal(plan.approvalBlocked, true);
});

test("renderer creates exactly seven deterministic card assets", () => {
  const plan = buildCarouselEditorialPlan({ property, media });
  const identity = {
    requestId: "30000000-0000-4000-8000-000000000001",
    deliverableId: "40000000-0000-4000-8000-000000000001",
    revisionNumber: 1,
  };
  const first = renderDeterministicCarousel(plan, identity);
  const second = renderDeterministicCarousel(plan, identity);
  assert.equal(first.length, 7);
  assert.deepEqual(first, second);
  assert.deepEqual(first.map((asset) => asset.position), [1, 2, 3, 4, 5, 6, 7]);
  assert.ok(first.every((asset) => asset.width === 1080 && asset.height === 1350));
  assert.ok(first.every((asset) => asset.assetKind === "structured_preview"));
  assert.ok(first.every((asset) => asset.storageState === "not_required"));
  assert.ok(first.every((asset) => asset.publicationState === "not_eligible"));
  assert.ok(first.every((asset) => asset.storageBucket === null && asset.objectPath === null));
});

test("renderer has no network or external execution path", () => {
  assert.doesNotMatch(RENDERER, /fetch\s*\(|https?:\/\/|axios|child_process|exec\s*\(/i);
  assert.match(RENDERER, /createHash/);
});

test("database completion owns output and enforces seven assets", () => {
  assert.match(MIGRATION, /function public\.complete_yzi_imob_creative_generation_job\(p_job_id uuid\)/i);
  assert.doesNotMatch(MIGRATION, /\bp_outputs\b|\bp_snapshot\b|\bp_tenant_id\b.*complete_yzi/im);
  assert.match(MIGRATION, /v_asset_count <> 7/i);
  assert.match(MIGRATION, /asset_position between 1 and 7/i);
  assert.match(MIGRATION, /revision_position_unique/i);
});

test("revision jobs are idempotent and preserve ancestry", () => {
  assert.match(MIGRATION, /generation_kind = 'revision'/i);
  assert.match(MIGRATION, /source_revision_id/i);
  assert.match(MIGRATION, /idempotency_key=v_key/i);
  assert.match(MIGRATION, /coalesce\(max\(r\.revision_number\), 0\) \+ 1/i);
  assert.doesNotMatch(MIGRATION, /delete from public\.yzi_imob_creative_(?:revisions|assets)/i);
});

test("changes requested creates a new governed revision path", () => {
  assert.match(ACTIONS, /decision === "changes_requested"/);
  assert.match(ACTIONS, /requestCreativeCarouselRevision/);
  assert.match(MIGRATION, /request_yzi_imob_creative_carousel_revision/i);
  assert.match(MIGRATION, /v_revision\.status not in \('changes_requested','approved'\)/i);
});

test("new revisions clear previous approval and publication eligibility", () => {
  assert.match(
    MIGRATION,
    /approved_revision_id\s*=\s*null,\s*publication_eligible\s*=\s*false/i,
  );
  assert.match(MIGRATION, /current_revision_id = v_revision\.id/i);
});

test("structured preview stays non-eligible after approval", () => {
  assert.match(MIGRATION, /guard_yzi_imob_creative_eligibility/i);
  assert.match(
    MIGRATION,
    /old\.status is distinct from 'approved'[\s\S]*new\.publication_eligible := false/i,
  );
  assert.match(MIGRATION, /asset_kind = 'final_render'/i);
  assert.match(MIGRATION, /storage_state = 'promoted'/i);
  assert.match(MIGRATION, /publication_state in \('eligible', 'published'\)/i);
  assert.match(MIGRATION, /v_revision\.status <> 'approved'/i);
  assert.match(MIGRATION, /new\.approved_revision_id is distinct from new\.current_revision_id/i);
  assert.match(MIGRATION, /blueprint,approvalBlocked/i);
  assert.match(MIGRATION, /guard_yzi_imob_creative_approval_event_contract/i);
  assert.match(MIGRATION, /new\.metadata - 'all_deliverables_publication_eligible'/i);
  assert.match(MIGRATION, /'publication_eligible', false/i);
});

test("browser cannot inject ownership, storage, facts, URLs or generated outputs", () => {
  assert.doesNotMatch(
    ACTIONS,
    /formText\(formData,\s*"(?:tenantId|tenant_id|bucket|bucketId|bucket_id|objectPath|object_path|storagePath|storage_path|contentSnapshot|output|price|privateArea|url|externalUrl)"\)/i,
  );
  assert.doesNotMatch(
    REPOSITORY,
    /p_outputs|p_content_snapshot|p_tenant_id|p_bucket|p_object_path|p_storage_path|p_external_url/,
  );
  assert.match(REPOSITORY, /\.eq\("tenant_id", tenantId\)/);
  assert.match(REPOSITORY, /\.eq\("property_id", input\.propertyId\)/);
  assert.match(MIGRATION, /invalid_replacement_property_media/i);
});

test("structured preview requires no physical storage and is never publishable", () => {
  assert.match(MIGRATION, /asset_kind = 'structured_preview'/i);
  assert.match(MIGRATION, /storage_state = 'not_required'/i);
  assert.match(MIGRATION, /publication_state = 'not_eligible'/i);
  assert.match(MIGRATION, /storage_bucket is null\s+and object_path is null/i);
  assert.doesNotMatch(MIGRATION, /rendered_locally/i);
});

test("legacy non-rendered synthetic outputs backfill without activating video", () => {
  assert.match(
    MIGRATION,
    /asset_kind = 'structured_preview'[\s\S]*media_type = any \(array\['image', 'video', 'structured'\]::text\[\]\)/i,
  );
  assert.match(
    MIGRATION,
    /when asset_role = 'source_media' then 'source_media'[\s\S]*else 'structured_preview'/i,
  );
  assert.doesNotMatch(MIGRATION, /deliverable_type\s*=\s*'video_tour'[\s\S]*insert/i);
});

test("future storage path is canonical, tenant-safe and server-owned", () => {
  assert.match(
    MIGRATION,
    /'tenants\/' \|\| p_tenant_id[\s\S]*'\/properties\/' \|\| p_property_id[\s\S]*'\/creative\/' \|\| p_deliverable_id[\s\S]*'\/revisions\/' \|\| p_revision_id/i,
  );
  assert.match(MIGRATION, /revoke all on function public\.build_yzi_imob_creative_asset_path/i);
  assert.match(MIGRATION, /storage_bucket = 'yzi-imob-private'/i);
  assert.match(MIGRATION, /storage_bucket = 'yzi-imob-public'/i);
  assert.doesNotMatch(MIGRATION, /insert\s+into\s+storage\.buckets/i);
});

test("final render eligibility requires governed approval and promotion", () => {
  assert.match(MIGRATION, /creative_asset_publication_requires_governed_approval/i);
  assert.match(MIGRATION, /r\.status = 'approved'/i);
  assert.match(MIGRATION, /d\.current_revision_id = r\.id/i);
  assert.match(MIGRATION, /d\.approved_revision_id = r\.id/i);
  assert.match(MIGRATION, /asset_kind = 'final_render'/i);
  assert.match(MIGRATION, /storage_state = 'promoted'/i);
});

test("fake renderer remains independent from real buckets", () => {
  assert.doesNotMatch(RENDERER, /storage\.from|supabase|yzi-imob-private|yzi-imob-public/i);
  assert.match(RENDERER, /storageState:\s*"not_required"/i);
  assert.match(RENDERER, /storageBucket:\s*null/i);
  assert.match(RENDERER, /objectPath:\s*null/i);
});

test("frontend is editorial, honest and supplier-neutral", () => {
  assert.match(FRONTEND, /Card \{selected \+ 1\} de 7/);
  assert.match(FRONTEND, /Caption preparada/);
  assert.match(FRONTEND, /Histórico de revisões/);
  assert.match(FRONTEND, /Erro de leitura do estúdio criativo/);
  assert.match(FRONTEND, /Nenhum pedido criativo/);
  assert.doesNotMatch(
    FRONTEND,
    /Higgsfield|Metricool|OpenAI|Anthropic|Gemini|Docker|drag-and-drop|contenteditable/i,
  );
  assert.doesNotMatch(
    FRONTEND,
    /yzi-imob-private|yzi-imob-public|object_path|storage_path|storage_bucket|provider/i,
  );
  assert.doesNotMatch(FRONTEND, /Publicar|Agendar publicação/);
});
