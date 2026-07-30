import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { buildVideoTourPlan } from "../src/lib/yzi-imob/creative/video-tour/plan.ts";
import { LocalRemotionVideoRenderTransport } from "../src/lib/yzi-imob/creative/video-tour/local-remotion-executor.ts";

const platformRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tenantId = "10000000-0000-4000-8000-000000000001";
const propertyId = "20000000-0000-4000-8000-000000000001";
const requestId = "30000000-0000-4000-8000-000000000001";
const deliverableId = "40000000-0000-4000-8000-000000000001";
const revisionId = "50000000-0000-4000-8000-000000000001";
const environments = ["facade", "entrance", "living_room", "balcony", "kitchen", "suite"];

test("explicit local transport creates a synthetic vertical MP4 and thumbnail without residue", {
  timeout: 180_000,
}, async () => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "yzi-imob-video-tour-"));
  const mediaRoot = path.join(fixtureRoot, "media");
  const outputDirectory = path.join(fixtureRoot, "output");
  const mediaPathsById = {};
  try {
    await mkdir(mediaRoot, { recursive: true });
    const media = [];
    for (const [index, environmentType] of environments.entries()) {
      const id = `60000000-0000-4000-8000-00000000000${index + 1}`;
      const file = path.join(mediaRoot, `${index + 1}.png`);
      await sharp({
        create: {
          width: 1080,
          height: 1920,
          channels: 4,
          background: {
            r: 30 + index * 20,
            g: 70 + index * 10,
            b: 110 + index * 12,
            alpha: 1,
          },
        },
      })
        .png()
        .toFile(file);
      mediaPathsById[id] = file;
      media.push({
        id,
        tenantId,
        propertyId,
        mediaType: "image",
        environmentType,
        displayOrder: index + 1,
        isPrimary: index === 0,
        eligibleForCarousel: true,
        eligibleForVideo: true,
        mediaStatus: "approved",
        orientation: "portrait",
        width: 1080,
        height: 1920,
        humanNote: null,
        exclusionReason: null,
      });
    }
    const plan = buildVideoTourPlan({
      tenantId,
      propertyId,
      title: "Imóvel sintético",
      cta: "Agende uma visita",
      duration: 15,
      media,
    });
    const transport = new LocalRemotionVideoRenderTransport({
      authorization: "explicit_local_render",
      entryPoint: path.join(platformRoot, "src", "remotion", "index.ts"),
      outputDirectory,
      trustedMediaRoot: mediaRoot,
      mediaPathsById,
      browserExecutable: path.join(
        platformRoot,
        "node_modules",
        ".remotion",
        "chrome-headless-shell",
        "win64",
        "chrome-headless-shell-win64",
        "chrome-headless-shell.exe",
      ),
      fixtureDurationInFrames: 45,
    });
    const result = await transport.render({
      tenantId,
      propertyId,
      requestId,
      deliverableId,
      revisionId,
      plan,
      sourceMedia: media.map((item) => ({
        id: item.id,
        tenantId,
        propertyId,
        contentHash: createHash("sha256").update(item.id).digest("hex"),
      })),
    });
    assert.equal(result.preview.width, 1080);
    assert.equal(result.preview.height, 1920);
    assert.ok(result.preview.durationSeconds >= 1.4 && result.preview.durationSeconds <= 1.6);
    assert.equal(result.preview.storageState, "pending");
    assert.equal(result.preview.publicationState, "not_eligible");
    assert.equal(result.thumbnail.width, 1080);
    assert.equal(result.thumbnail.height, 1920);
    const [video, thumbnail] = await Promise.all([
      readFile(result.preview.localArtifactPath),
      readFile(result.thumbnail.localArtifactPath),
    ]);
    assert.equal(video.subarray(4, 8).toString(), "ftyp");
    assert.equal(thumbnail.subarray(1, 4).toString(), "PNG");
    assert.equal(createHash("sha256").update(video).digest("hex"), result.preview.contentHash);
    assert.equal(
      createHash("sha256").update(thumbnail).digest("hex"),
      result.thumbnail.contentHash,
    );
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
  await assert.rejects(access(fixtureRoot));
});
