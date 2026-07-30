import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  DeterministicCreativeFakeTransport,
  hashCreativeSnapshot,
} from "../src/lib/yzi-imob/creative/fake-transport.ts";
import {
  ACTIVE_CREATIVE_DELIVERABLE_TYPES,
  RESERVED_CREATIVE_DELIVERABLE_TYPES,
} from "../src/lib/yzi-imob/creative/types.ts";

const MIGRATION_PATH =
  "../../supabase/migrations/20260729190936_yzi_imob_creative_engine_foundation_v1.sql";

function source(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const MIGRATION = source(MIGRATION_PATH);
const REPOSITORY = source("../src/lib/yzi-imob/creative/repository.ts");
const TYPES = source("../src/lib/yzi-imob/creative/types.ts");
const UI = [
  source("../src/app/cockpit/yzi-imob/imoveis/[id]/creative/page.tsx"),
  source("../src/app/cockpit/yzi-imob/imoveis/[id]/creative/actions.ts"),
  source("../src/components/yzi-imob/creative/yzi-imob-carousel-review.tsx"),
].join("\n");

const context = {
  tenantId: "10000000-0000-4000-8000-000000000001",
  property: {
    id: "20000000-0000-4000-8000-000000000001",
    title: "Casa Jardim",
    city: "São Paulo",
    neighborhood: "Jardins",
    referenceCode: "YZ-101",
    price: 2500000,
    bedrooms: 3,
    suites: 2,
    parkingSpaces: 2,
    privateArea: 180,
    totalArea: 220,
    availabilityStatus: "available",
    shortSummary: "Arquitetura acolhedora em uma localização desejada.",
    propertyFeatures: ["varanda"],
  },
  request: {
    id: "30000000-0000-4000-8000-000000000001",
    tenantId: "10000000-0000-4000-8000-000000000001",
    propertyId: "20000000-0000-4000-8000-000000000001",
    status: "generating",
    objective: "Apresentar os principais diferenciais do imóvel",
    desiredFormats: ["carousel"],
    intendedChannels: ["social_feed"],
    context: {},
    idempotencyKey: "creative:test:1",
    createdByUserId: "40000000-0000-4000-8000-000000000001",
    createdAt: "2026-07-29T12:00:00.000Z",
    updatedAt: "2026-07-29T12:00:00.000Z",
    completedAt: null,
  },
  deliverables: [
    {
      id: "50000000-0000-4000-8000-000000000001",
      tenantId: "10000000-0000-4000-8000-000000000001",
      propertyId: "20000000-0000-4000-8000-000000000001",
      requestId: "30000000-0000-4000-8000-000000000001",
      deliverableType: "carousel",
      status: "generating",
      currentRevisionId: null,
      approvedRevisionId: null,
      publicationEligible: false,
      createdAt: "2026-07-29T12:00:00.000Z",
      updatedAt: "2026-07-29T12:00:00.000Z",
    },
  ],
  sourceMedia: [
    {
      id: "60000000-0000-4000-8000-000000000001",
      mediaType: "image",
      sortOrder: 0,
      isCover: true,
      isPublicationAllowed: true,
      processingStatus: "ready",
    },
    {
      id: "60000000-0000-4000-8000-000000000002",
      mediaType: "image",
      sortOrder: 1,
      isCover: false,
      isPublicationAllowed: true,
      processingStatus: "ready",
    },
  ],
};

test("current contract activates only the property carousel", () => {
  assert.deepEqual(ACTIVE_CREATIVE_DELIVERABLE_TYPES, ["carousel"]);
  assert.deepEqual(RESERVED_CREATIVE_DELIVERABLE_TYPES, [
    "video_tour",
    "story_pack",
    "static_post",
  ]);
  assert.match(
    MIGRATION,
    /deliverable_type = any \(array\['carousel', 'video_tour'\]::text\[\]\)/i,
  );
  assert.doesNotMatch(
    MIGRATION,
    /deliverable_type = any \(array\[[^\]]*(?:story_pack|static_post)/i,
  );
});

test("fake generation is deterministic, structured and never rendered", async () => {
  const transport = new DeterministicCreativeFakeTransport();
  const first = await transport.generate(context);
  const second = await transport.generate(context);

  assert.deepEqual(first, second);
  assert.equal(first.length, 1);
  assert.deepEqual(
    first.map((output) => output.deliverable_type),
    ["carousel"],
  );
  for (const output of first) {
    assert.equal(output.content_snapshot.property_id, context.property.id);
    assert.equal(output.content_snapshot.synthetic, true);
    assert.equal(output.content_snapshot.rendered, false);
    assert.equal(
      output.content_snapshot.publication_contract.external_publication_allowed,
      false,
    );
    assert.equal(output.content_hash, hashCreativeSnapshot(output.content_snapshot));
    assert.match(output.content_hash, /^[a-f0-9]{64}$/);
  }
});

test("schema is property-bound, tenant-safe, RLS-backed and read-only to the app", () => {
  const tables = [
    "yzi_imob_creative_requests",
    "yzi_imob_creative_deliverables",
    "yzi_imob_creative_revisions",
    "yzi_imob_creative_assets",
    "yzi_imob_creative_generation_jobs",
    "yzi_imob_creative_generation_events",
  ];

  for (const table of tables) {
    assert.match(MIGRATION, new RegExp(`create table public\\.${table}`, "i"));
    assert.match(
      MIGRATION,
      new RegExp(`alter table public\\.${table} enable row level security`, "i"),
    );
  }

  assert.match(
    MIGRATION,
    /foreign key \(property_id, tenant_id\)[\s\S]*references public\.yzi_imob_properties \(id, tenant_id\)/i,
  );
  assert.match(
    MIGRATION,
    /foreign key \(source_property_media_id, tenant_id, property_id\)[\s\S]*references public\.yzi_imob_property_media \(id, tenant_id, property_id\)/i,
  );
  assert.match(
    MIGRATION,
    /check \(revision_id is null or deliverable_id is not null\)/i,
  );
  assert.match(MIGRATION, /to authenticated[\s\S]*select tm\.tenant_id/i);
  assert.match(MIGRATION, /grant select[\s\S]*to authenticated/i);
  assert.doesNotMatch(
    MIGRATION,
    /grant (?:insert|update|delete|all)[\s\S]{0,1200}to authenticated/i,
  );
});

test("mutations are explicit, idempotent and approval gates publication eligibility", () => {
  for (const operation of [
    "create_yzi_imob_creative_request",
    "start_yzi_imob_creative_generation_job",
    "complete_yzi_imob_creative_generation_job",
    "fail_yzi_imob_creative_generation_job",
    "decide_yzi_imob_creative_revision",
  ]) {
    assert.match(MIGRATION, new RegExp(`function public\\.${operation}`, "i"));
  }

  assert.match(MIGRATION, /unique \(tenant_id, property_id, idempotency_key\)/i);
  assert.match(MIGRATION, /pg_advisory_xact_lock/i);
  assert.match(MIGRATION, /creative_request_idempotency_conflict/i);
  assert.match(MIGRATION, /invalid_or_unready_property_media/i);
  assert.match(
    MIGRATION,
    /publication_eligible = \(v_decision = 'approved'\)/i,
  );
  assert.match(
    MIGRATION,
    /tm\.role = any \(array\['owner', 'admin'\]::text\[\]\)/i,
  );
  assert.match(MIGRATION, /external_execution', false/i);
  assert.match(
    MIGRATION,
    /function public\.complete_yzi_imob_creative_generation_job\(\s*p_job_id uuid\s*\)/i,
  );
  assert.doesNotMatch(MIGRATION, /\bp_outputs\b/i);
  assert.match(MIGRATION, /guard_yzi_imob_creative_revision_immutability/i);
  assert.match(MIGRATION, /guard_yzi_imob_creative_event_append_only/i);
});

test("application repository always scopes reads by tenant and property", () => {
  assert.ok((REPOSITORY.match(/\.eq\("tenant_id", tenantId\)/g) ?? []).length >= 6);
  assert.ok((REPOSITORY.match(/\.eq\("property_id", propertyId\)/g) ?? []).length >= 6);
  assert.match(REPOSITORY, /create_yzi_imob_creative_request/);
  assert.match(REPOSITORY, /complete_yzi_imob_creative_generation_job/);
  assert.doesNotMatch(REPOSITORY, /p_outputs/);
  assert.doesNotMatch(REPOSITORY, /service[_-]?role/i);
  assert.match(TYPES, /creative_revision_required: true/);
});

test("minimal UI exposes status and approval, not an editor or external engine", () => {
  assert.match(UI, /Pedido/);
  assert.match(UI, /Carrossel editorial/);
  assert.match(UI, /Revisão atual/);
  assert.match(UI, /Aprovar carrossel/);
  assert.match(UI, /preview local/i);
  assert.doesNotMatch(UI, /Higgsfield|Metricool|drag-and-drop|contenteditable/i);
});
