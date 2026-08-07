import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  PROPERTY_ASSET_PROVIDER_CONTRACT,
  PROPERTY_ASSET_STATUS_VALUES,
  derivePropertyAssets,
  isPropertyAssetEligibleForUsage,
} from "../src/lib/yzi-imob/creative/property-assets.ts";

const propertyId = "20000000-0000-4000-8000-000000000001";

function source(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

function revision(status, overrides = {}) {
  return {
    id: `revision-${status}`,
    tenantId: "tenant-1",
    propertyId,
    requestId: "request-1",
    deliverableId: "deliverable-carousel",
    sourceRevisionId: null,
    revisionNumber: 1,
    status,
    contentSnapshot: {
      blueprint: { cards: [{ headline: "Viva este imóvel" }] },
    },
    contentHash: "a".repeat(64),
    reviewObservation: null,
    createdByUserId: "user-1",
    decidedByUserId: null,
    decidedAt: null,
    createdAt: "2026-08-07T12:00:00.000Z",
    updatedAt: "2026-08-07T12:00:00.000Z",
    ...overrides,
  };
}

function workspace(status = "in_review", publicationState = "not_eligible") {
  const current = revision(status);
  return {
    request: null,
    deliverables: [
      {
        id: "deliverable-carousel",
        tenantId: "tenant-1",
        propertyId,
        requestId: "request-1",
        deliverableType: "carousel",
        status,
        currentRevisionId: current.id,
        approvedRevisionId: status === "approved" ? current.id : null,
        publicationEligible: status === "approved",
        createdAt: "2026-08-07T12:00:00.000Z",
        updatedAt: "2026-08-07T12:00:00.000Z",
      },
    ],
    revisions: [current],
    assets: [
      {
        id: "asset-1",
        propertyId,
        deliverableId: "deliverable-carousel",
        revisionId: current.id,
        publicationState,
      },
    ],
    jobs: [],
    latestJob: null,
    events: [],
  };
}

test("property asset contract fixes Canva for static templates and Higgsfield for optional video", () => {
  assert.deepEqual(PROPERTY_ASSET_PROVIDER_CONTRACT, {
    staticTemplateProvider: "canva",
    videoTourProvider: "higgsfield",
    generativeOptional: true,
    integrationMode: "local_mock",
    paidGenerationAllowed: false,
    mcpConnected: false,
  });
});

test("property asset lifecycle exposes the seven approved product states", () => {
  assert.deepEqual(PROPERTY_ASSET_STATUS_VALUES, [
    "draft",
    "in_review",
    "adjustment_requested",
    "approved",
    "rejected",
    "archived",
    "published",
  ]);
});

test("assets remain scoped to their property and only approved revisions are usage eligible", () => {
  const inReview = derivePropertyAssets(workspace("in_review"))[0];
  const approved = derivePropertyAssets(workspace("approved", "eligible"))[0];
  const published = derivePropertyAssets(workspace("approved", "published"))[0];

  assert.equal(inReview.propertyId, propertyId);
  assert.deepEqual(inReview.eligibleUsageChannels, []);
  assert.equal(isPropertyAssetEligibleForUsage(inReview, propertyId), false);
  assert.deepEqual(approved.eligibleUsageChannels, ["whatsapp", "site", "social"]);
  assert.equal(isPropertyAssetEligibleForUsage(approved, propertyId), true);
  assert.equal(isPropertyAssetEligibleForUsage(approved, "another-property"), false);
  assert.equal(published.status, "published");
  assert.equal(isPropertyAssetEligibleForUsage(published, propertyId), false);
});

test("tenant-facing review separates static art and video without exposing providers", () => {
  const ui = source(
    "../src/components/yzi-imob/creative/yzi-imob-property-assets-review.tsx",
  );
  assert.match(ui, /Artes estáticas/);
  assert.match(ui, /Video tour/);
  assert.match(ui, />\s*Aprovar\s*</);
  assert.match(ui, /Pedir ajuste/);
  assert.match(ui, />\s*Rejeitar\s*</);
  assert.match(ui, /WhatsApp, site e redes sociais permanecem bloqueados até a aprovação/);
  assert.doesNotMatch(ui, /Canva|Higgsfield|MCP|provider/i);
});

test("property workspace offers a direct, product-language path to property assets", () => {
  const propertyWorkspace = source(
    "../src/components/yzi-imob/yzi-imob-property-workspace.tsx",
  );
  assert.match(
    propertyWorkspace,
    /href={`\/cockpit\/yzi-imob\/imoveis\/\$\{encodeURIComponent\(property\.id\)\}\/creative`}/,
  );
  assert.match(propertyWorkspace, /Artes e vídeos/);
  assert.doesNotMatch(propertyWorkspace, /Creative Engine|FormField label="Provider"|FormField label="Modelo"/);
});

test("approval is visually explicit and no asset action suggests publishing or sending", () => {
  const ui = source(
    "../src/components/yzi-imob/creative/yzi-imob-property-assets-review.tsx",
  );
  assert.match(ui, /approved: "Aprovado"/);
  assert.match(ui, /status === "approved" \|\| status === "published"/);
  assert.match(ui, /Aprovado para uso nos canais habilitados do imóvel/);
  const buttonLabels = [...ui.matchAll(/<button[\s\S]*?>([\s\S]*?)<\/button>/g)]
    .map((match) => match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .join(" ");
  assert.doesNotMatch(buttonLabels, /publicar|enviar|WhatsApp|site|social/i);
});

test("local generation snapshot declares no MCP, paid generation or external publication", () => {
  const fake = source("../src/lib/yzi-imob/creative/fake-transport.ts");
  assert.match(fake, /property_asset_contract/);
  assert.match(fake, /paid_generation_allowed/);
  assert.match(fake, /mcp_connected/);
  assert.match(fake, /external_publication_allowed: false/);
});
