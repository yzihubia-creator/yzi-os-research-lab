import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildCarouselEditorialPlan } from "../src/lib/yzi-imob/creative/carousel/editorial-plan.ts";
import { renderCarouselPngs } from "../src/lib/yzi-imob/creative/carousel/png-renderer.ts";
import { evaluateCreativeMediaReadiness } from "../src/lib/yzi-imob/creative/media/readiness.ts";
import { deriveCreativePackageState } from "../src/lib/yzi-imob/creative/package-state.ts";
import { buildCreativeAssetPath } from "../src/lib/yzi-imob/creative/storage-contract.ts";
import { buildVideoTourPlan } from "../src/lib/yzi-imob/creative/video-tour/plan.ts";
import {
  DeterministicVideoRenderFakeTransport,
  renderVideoTour,
} from "../src/lib/yzi-imob/creative/video-tour/transport.ts";

const source = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const MIGRATION = source(
  "../../supabase/migrations/20260730174500_yzi_imob_creative_mvp_closure_v1.sql",
);
const ACTIONS = source("../src/app/cockpit/yzi-imob/imoveis/[id]/creative/actions.ts");
const FRONTEND = source("../src/app/cockpit/yzi-imob/imoveis/[id]/creative/page.tsx");
const LOCAL_VIDEO_TRANSPORT = source(
  "../src/lib/yzi-imob/creative/video-tour/local-remotion-executor.ts",
);
const MEDIA_REPOSITORY = source("../src/lib/yzi-imob/creative/media/repository.ts");
const CREATIVE_REPOSITORY = source("../src/lib/yzi-imob/creative/repository.ts");
const STORAGE_REPOSITORY = source("../src/lib/yzi-imob/creative/storage-repository.ts");

const tenantId = "10000000-0000-4000-8000-000000000001";
const propertyId = "20000000-0000-4000-8000-000000000001";
const requestId = "30000000-0000-4000-8000-000000000001";
const deliverableId = "40000000-0000-4000-8000-000000000001";
const revisionId = "50000000-0000-4000-8000-000000000001";
const environments = ["facade", "entrance", "living_room", "balcony", "kitchen", "suite"];
const governedMedia = environments.map((environmentType, index) => ({
  id: `60000000-0000-4000-8000-00000000000${index + 1}`,
  tenantId,
  propertyId,
  mediaType: "image",
  environmentType,
  displayOrder: index + 1,
  isPrimary: index === 0,
  eligibleForCarousel: true,
  eligibleForVideo: true,
  mediaStatus: "approved",
  orientation: index % 2 ? "landscape" : "portrait",
  width: 1600,
  height: 1200,
  humanNote: null,
  exclusionReason: null,
}));

test("media readiness is deterministic, scoped and honest", () => {
  const ready = evaluateCreativeMediaReadiness({
    tenantId,
    propertyId,
    propertyFactsComplete: true,
    media: governedMedia,
  });
  assert.equal(ready.carousel.state, "ready");
  assert.equal(ready.videoTour.state, "ready");
  const incomplete = evaluateCreativeMediaReadiness({
    tenantId,
    propertyId,
    propertyFactsComplete: true,
    media: governedMedia.slice(1, 3),
  });
  assert.equal(incomplete.carousel.state, "incomplete");
  assert.equal(
    incomplete.carousel.diagnostics.some((item) => item.code === "primary_media_missing"),
    true,
  );
});

test("excluded, foreign tenant and foreign property media are not used", () => {
  const result = evaluateCreativeMediaReadiness({
    tenantId,
    propertyId,
    propertyFactsComplete: true,
    media: [
      ...governedMedia,
      { ...governedMedia[0], id: "foreign-tenant", tenantId: "other" },
      { ...governedMedia[1], id: "foreign-property", propertyId: "other" },
      { ...governedMedia[2], id: "excluded", mediaStatus: "excluded", eligibleForVideo: false },
    ],
  });
  assert.deepEqual(result.videoTour.eligibleMediaIds, governedMedia.map((item) => item.id));
});

test("video plan is deterministic, ordered and allowlisted", () => {
  const input = {
    tenantId,
    propertyId,
    title: "Apartamento Horizonte",
    cta: "Agende uma visita",
    duration: 20,
    media: [...governedMedia].reverse(),
  };
  const first = buildVideoTourPlan(input);
  const second = buildVideoTourPlan(input);
  assert.deepEqual(first, second);
  assert.equal(
    Number(first.scenes.reduce((total, scene) => total + scene.duration, 0).toFixed(3)),
    20,
  );
  assert.deepEqual(first.scenes.map((scene) => scene.environmentType), environments);
  assert.ok(first.scenes.every((scene) =>
    ["slow_zoom_in", "slow_zoom_out", "pan_left", "pan_right", "vertical_reveal", "static_hold"]
      .includes(scene.motionPreset),
  ));
  assert.ok(first.scenes.every((scene) =>
    ["cut", "crossfade", "dip_to_brand"].includes(scene.transition),
  ));
});

test("video has no silent media fallback and real execution is blocked by default", async () => {
  const plan = buildVideoTourPlan({
    tenantId,
    propertyId,
    title: "Apartamento Horizonte",
    cta: "Agende uma visita",
    duration: 15,
    media: governedMedia,
  });
  const request = {
    tenantId,
    propertyId,
    requestId,
    deliverableId,
    revisionId,
    plan,
    sourceMedia: governedMedia.map((item) => ({
      id: item.id,
      tenantId,
      propertyId,
      contentHash: "a".repeat(64),
    })),
  };
  await assert.rejects(() => renderVideoTour(request), /video_render_transport_required/);
  const fake = await renderVideoTour(request, new DeterministicVideoRenderFakeTransport());
  assert.equal(fake.preview.assetKind, "rendered_preview");
  assert.equal(fake.preview.storageState, "pending");
  assert.equal(fake.preview.publicationState, "not_eligible");
  assert.doesNotMatch(JSON.stringify(fake), /https?:\/\//);
});

test("canonical path is deterministic and rejects arbitrary asset paths", () => {
  const path = buildCreativeAssetPath({
    tenantId,
    propertyId,
    deliverableId,
    revisionId,
    assetName: "card-01.png",
  });
  assert.equal(
    path,
    `tenants/${tenantId}/properties/${propertyId}/creative/${deliverableId}/revisions/${revisionId}/card-01.png`,
  );
  assert.throws(
    () => buildCreativeAssetPath({
      tenantId,
      propertyId,
      deliverableId,
      revisionId,
      assetName: "../escape.png",
    }),
    /invalid_creative_asset_name/,
  );
});

test("carousel renderer creates seven ordered real PNG buffers", async () => {
  const carouselMedia = governedMedia.map((item, index) => ({
    id: item.id,
    tenantId,
    propertyId,
    mediaType: "image",
    sortOrder: index,
    isCover: index === 0,
    isPublicationAllowed: true,
    processingStatus: "ready",
  }));
  const plan = buildCarouselEditorialPlan({
    property: {
      id: propertyId,
      tenantId,
      referenceCode: "YZ-202",
      title: "Apartamento Horizonte",
      city: "João Pessoa",
      neighborhood: "Cabo Branco",
      price: 1850000,
      privateArea: 142,
      totalArea: null,
      bedrooms: 3,
      suites: 2,
      parkingSpaces: 2,
      availabilityStatus: "available",
      shortSummary: "Luz natural e espaços bem distribuídos.",
      propertyFeatures: ["Varanda", "Vista aberta"],
    },
    media: carouselMedia,
  });
  const image = readFileSync(
    new URL("../public/demo/yzi-imob/properties/cobertura-atlantico-cabo-branco/facade-01.png", import.meta.url),
  );
  const rendered = await renderCarouselPngs({
    tenantId,
    propertyId,
    requestId,
    deliverableId,
    revisionId,
    plan,
    media: governedMedia.map((item) => ({
      id: item.id,
      tenantId,
      propertyId,
      contentHash: "b".repeat(64),
      bytes: image,
    })),
  });
  assert.equal(rendered.length, 7);
  assert.deepEqual(rendered.map((item) => item.fileName), [
    "card-01.png", "card-02.png", "card-03.png", "card-04.png",
    "card-05.png", "card-06.png", "card-07.png",
  ]);
  assert.ok(rendered.every((item) => item.width === 1080 && item.height === 1350));
  assert.ok(rendered.every((item) => item.bytes.subarray(1, 4).toString() === "PNG"));
  assert.ok(rendered.every((item) => item.publicationState === "not_eligible"));
});

test("package state preserves partial failure", () => {
  assert.equal(
    deriveCreativePackageState([{ status: "in_review" }, { status: "failed" }]),
    "partially_failed",
  );
  assert.equal(
    deriveCreativePackageState([{ status: "approved" }, { status: "approved" }]),
    "approved",
  );
});

test("complete package state follows isolated failure, retry and independent approvals", () => {
  const state = (carousel, video) =>
    deriveCreativePackageState([{ status: carousel }, { status: video }]);
  assert.equal(state("planned", "planned"), "preparing");
  assert.equal(state("in_review", "failed"), "partially_failed");
  assert.equal(state("in_review", "planned"), "partially_ready");
  assert.equal(state("in_review", "in_review"), "awaiting_approval");
  assert.equal(state("approved", "in_review"), "awaiting_approval");
  assert.equal(state("approved", "approved"), "approved");
  assert.equal(state("changes_requested", "approved"), "changes_requested");
  assert.equal(state("planned", "approved"), "partially_ready");
});

test("migration governs media, jobs, provenance and canonical private buckets", () => {
  assert.match(MIGRATION, /environment_type text not null/i);
  assert.match(MIGRATION, /one_active_primary_idx/i);
  assert.match(MIGRATION, /property_media_events_append_only/i);
  assert.match(MIGRATION, /revoke insert, update, delete on public\.yzi_imob_property_media/i);
  assert.match(MIGRATION, /generation_jobs_deliverable_operation_key_unique/i);
  assert.match(MIGRATION, /creative_asset_sources_media_fkey/i);
  assert.match(MIGRATION, /retry_yzi_imob_creative_generation_job/i);
  assert.match(MIGRATION, /recompute_yzi_imob_creative_request_status/i);
  assert.match(MIGRATION, /jsonb_build_object\('server_produced',true/i);
  assert.match(MIGRATION, /\('yzi-imob-private', 'yzi-imob-private', false\)/i);
  assert.match(MIGRATION, /\('yzi-imob-public', 'yzi-imob-public', false\)/i);
  assert.doesNotMatch(MIGRATION, /public\s*=\s*true/i);
  assert.doesNotMatch(MIGRATION, /for insert to authenticated|for update to authenticated/i);
});

test("media intake is persisted atomically and browser mutation stays editorial-only", () => {
  assert.match(MIGRATION, /for v_previous in[\s\S]*for update[\s\S]*is_cover = false/i);
  assert.match(MIGRATION, /property_media_events[\s\S]*before_state[\s\S]*after_state/i);
  assert.match(MIGRATION, /media_not_found_or_forbidden/i);
  assert.match(MEDIA_REPOSITORY, /\.eq\("tenant_id", tenantId\)/);
  assert.match(MEDIA_REPOSITORY, /\.eq\("property_id", input\.propertyId\)/);
  assert.doesNotMatch(MEDIA_REPOSITORY, /storage_bucket|object_path|public_url/i);
  assert.match(FRONTEND, /updateCreativeMediaGovernanceAction/);
  assert.match(FRONTEND, /eligibleForCarousel/);
  assert.match(FRONTEND, /eligibleForVideo/);
});

test("jobs are per-deliverable, idempotent and failures are isolated", () => {
  assert.match(MIGRATION, /deliverable_id set not null/i);
  assert.match(
    MIGRATION,
    /\(tenant_id, property_id, deliverable_id, operation, idempotency_key\)/i,
  );
  assert.match(
    MIGRATION.match(/function public\.fail_yzi_imob_creative_generation_job[\s\S]*?\$function\$;/i)?.[0] ?? "",
    /where id=v_job\.deliverable_id/i,
  );
  assert.doesNotMatch(
    MIGRATION.match(/function public\.fail_yzi_imob_creative_generation_job[\s\S]*?\$function\$;/i)?.[0] ?? "",
    /where request_id\s*=\s*v_job\.request_id/i,
  );
  assert.match(CREATIVE_REPOSITORY, /for \(const job of jobs\.data \?\? \[\]\)/);
  assert.match(CREATIVE_REPOSITORY, /continue;/);
});

test("storage registration, private access and promotion are server-only and governed", () => {
  assert.match(MIGRATION, /register_yzi_imob_creative_stored_asset/i);
  assert.match(MIGRATION, /finalize_yzi_imob_creative_asset_promotion/i);
  assert.match(MIGRATION, /to service_role/i);
  assert.match(MIGRATION, /creative_assets_are_immutable/i);
  assert.match(MIGRATION, /creative_render_set_incomplete/i);
  assert.match(STORAGE_REPOSITORY, /expiresInSeconds < 30 \|\| expiresInSeconds > 300/);
  assert.match(STORAGE_REPOSITORY, /overwrite: false/g);
  assert.match(STORAGE_REPOSITORY, /buildCreativeAssetPath/);
  assert.doesNotMatch(
    STORAGE_REPOSITORY.match(/storeCreativeRenderedAsset[\s\S]*?^}/m)?.[0] ?? "",
    /input\.(?:bucket|objectPath|url)/i,
  );
});

test("browser cannot provide tenant, bucket, object path or external URL", () => {
  assert.doesNotMatch(
    ACTIONS,
    /formText\(formData,\s*"(?:tenantId|tenant_id|bucket|bucketId|objectPath|storagePath|url|externalUrl)"\)/i,
  );
  assert.doesNotMatch(
    MIGRATION.match(/function public\.update_yzi_imob_property_media_governance[\s\S]*?\$function\$;/i)?.[0] ?? "",
    /\bp_(?:tenant_id|bucket|object_path|storage_path|url)\b/i,
  );
});

test("frontend stays supplier-neutral and does not expose storage details", () => {
  assert.match(FRONTEND, /Prontidão das mídias/);
  assert.match(FRONTEND, /Pacote completo/);
  assert.doesNotMatch(
    FRONTEND,
    /OpenAI|Anthropic|Gemini|Higgsfield|Metricool|Remotion|Sharp|FFmpeg|Docker/i,
  );
  assert.doesNotMatch(
    FRONTEND,
    /yzi-imob-private|yzi-imob-public|storage_bucket|object_path|provider|bucket/i,
  );
  assert.doesNotMatch(FRONTEND, /Publicar|Agendar publicação/i);
});

test("local video transport is explicit and imports renderer only after the gate", () => {
  const gate = LOCAL_VIDEO_TRANSPORT.indexOf('authorization !== "explicit_local_render"');
  const rendererImport = LOCAL_VIDEO_TRANSPORT.indexOf('import("@remotion/renderer")');
  assert.ok(gate >= 0 && rendererImport > gate);
  assert.doesNotMatch(LOCAL_VIDEO_TRANSPORT, /fetch\s*\(|https?:\/\//i);
});
