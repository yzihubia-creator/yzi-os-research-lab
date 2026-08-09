import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const PAGE = source("../src/app/cockpit/yzi-imob/imoveis/[id]/creative/page.tsx");
const PREVIEW_ACCESS = source("../src/lib/yzi-imob/creative/preview-access.ts");
const CAROUSEL = source(
  "../src/components/yzi-imob/creative/yzi-imob-carousel-review.tsx",
);
const ASSETS = source(
  "../src/components/yzi-imob/creative/yzi-imob-property-assets-review.tsx",
);
const VIDEO = source(
  "../src/components/yzi-imob/creative/yzi-imob-video-tour-review.tsx",
);
const QUEUE = source(
  "../src/components/yzi-imob/yzi-imob-social-publications-workspace.tsx",
);

test("creative page resolves existing media URLs without inventing an endpoint", () => {
  assert.match(PAGE, /loadCreativePreviewUrls/);
  assert.match(PREVIEW_ACCESS, /getTemporaryCreativeAssetAccess/);
  assert.match(PREVIEW_ACCESS, /tenantId/);
  assert.match(PREVIEW_ACCESS, /propertyId/);
  assert.match(PAGE, /url: item\.url/);
  assert.doesNotMatch(PAGE, /url:\s*null,\s*altText: item\.altText/);
  assert.match(PAGE, /referenceImageUrl: videoReferenceMedia\?\.url \?\? null/);
});

test("carousel stays 4:5 and blocks approval while required visuals are unavailable", () => {
  assert.match(CAROUSEL, /aspect-\[4\/5\]/);
  assert.match(CAROUSEL, /Preview visual incompleto/);
  assert.match(CAROUSEL, /disabled=\{plan\.approvalBlocked \|\| !visualPreviewReady\}/);
  assert.match(CAROUSEL, /onError=\{\(\) => onVisualError\(visualUrl\)\}/);
});

test("video tour uses a vertical playable preview and never approves from scene text alone", () => {
  assert.match(VIDEO, /aspect-\[9\/16\]/);
  assert.match(VIDEO, /<video/);
  assert.match(VIDEO, /Preview visual pendente/);
  assert.match(VIDEO, /disabled=\{!hasRenderedVideo\}/);
  assert.doesNotMatch(VIDEO, /aspect-video/);
});

test("asset cards use real media with honest fallbacks and type-specific aspect ratios", () => {
  assert.match(ASSETS, /preview\.mediaType === "video"/);
  assert.match(ASSETS, /aspect-\[9\/16\]/);
  assert.match(ASSETS, /aspect-\[4\/5\]/);
  assert.match(ASSETS, /Preview visual pendente/);
  assert.match(ASSETS, /disabled=\{!preview\?\.decisionReady\}/);
  assert.match(PAGE, /kind: "reference",\s+decisionReady: false/);
  assert.doesNotMatch(ASSETS, /aspect-video/);
});

test("legacy publication review is labelled separately from creative review", () => {
  assert.match(QUEUE, /Revisar publica(?:ç|Ã§)(?:ã|Ã£)o/);
  assert.match(QUEUE, /Revisar arte/);
  assert.match(QUEUE, /imoveis\/\$\{encodeURIComponent\(approval\.propertyId\)\}\/creative/);
});
