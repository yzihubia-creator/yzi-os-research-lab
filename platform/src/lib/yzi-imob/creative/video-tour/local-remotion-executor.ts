import { createHash } from "node:crypto";
import { mkdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";

import type { VideoRenderRequest, VideoRenderResult, VideoRenderTransport } from "./transport.ts";

export class LocalRemotionVideoRenderTransport implements VideoRenderTransport {
  private readonly options: {
    authorization: "explicit_local_render";
    entryPoint: string;
    outputDirectory: string;
    trustedMediaRoot: string;
    mediaPathsById: Readonly<Record<string, string>>;
    browserExecutable: string;
    fixtureDurationInFrames?: number;
  };

  constructor(options: {
    authorization: "explicit_local_render";
    entryPoint: string;
    outputDirectory: string;
    trustedMediaRoot: string;
    mediaPathsById: Readonly<Record<string, string>>;
    browserExecutable: string;
    fixtureDurationInFrames?: number;
  }) {
    this.options = options;
  }

  async render(input: VideoRenderRequest): Promise<VideoRenderResult> {
    if (this.options.authorization !== "explicit_local_render") {
      throw new Error("video_render_transport_required");
    }
    if (
      !path.isAbsolute(this.options.entryPoint) ||
      !path.isAbsolute(this.options.outputDirectory) ||
      !path.isAbsolute(this.options.trustedMediaRoot) ||
      !path.isAbsolute(this.options.browserExecutable) ||
      /^https?:/i.test(this.options.entryPoint)
    ) {
      throw new Error("video_render_local_configuration_invalid");
    }
    const sourceById = new Map(input.sourceMedia.map((item) => [item.id, item]));
    if (
      input.sourceMedia.some(
        (item) => item.tenantId !== input.tenantId || item.propertyId !== input.propertyId,
      ) ||
      input.plan.selectedMediaIds.some((id) => !sourceById.has(id))
    ) {
      throw new Error("video_render_media_scope_mismatch");
    }
    const trustedRoot = await realpath(this.options.trustedMediaRoot);
    const mediaSources: Record<string, string> = {};
    for (const mediaId of input.plan.selectedMediaIds) {
      const mediaPath = this.options.mediaPathsById[mediaId];
      if (!mediaPath || !path.isAbsolute(mediaPath) || /^https?:/i.test(mediaPath)) {
        throw new Error("video_render_media_path_not_trusted");
      }
      const resolved = await realpath(mediaPath);
      if (resolved !== trustedRoot && !resolved.startsWith(`${trustedRoot}${path.sep}`)) {
        throw new Error("video_render_media_path_not_trusted");
      }
      const bytes = await readFile(resolved);
      mediaSources[mediaId] = `data:image/png;base64,${bytes.toString("base64")}`;
    }

    await mkdir(this.options.outputDirectory, { recursive: true });
    const [{ bundle }, { getVideoMetadata, renderMedia, renderStill, selectComposition }] =
      await Promise.all([import("@remotion/bundler"), import("@remotion/renderer")]);
    const serveUrl = await bundle({ entryPoint: this.options.entryPoint });
    const inputProps = {
      plan: input.plan,
      mediaSources,
      renderDurationSeconds:
        this.options.fixtureDurationInFrames === undefined
          ? undefined
          : this.options.fixtureDurationInFrames / 30,
    };
    const composition = await selectComposition({
      serveUrl,
      id: "YziImobVideoTour",
      inputProps,
      browserExecutable: this.options.browserExecutable,
    });
    const fixtureDuration = this.options.fixtureDurationInFrames;
    const renderComposition =
      fixtureDuration === undefined
        ? composition
        : {
            ...composition,
            durationInFrames: Math.min(composition.durationInFrames, fixtureDuration),
          };
    const previewFile = path.join(this.options.outputDirectory, "video-preview.mp4");
    const thumbnailFile = path.join(this.options.outputDirectory, "thumbnail.png");
    await renderMedia({
      composition: renderComposition,
      serveUrl,
      codec: "h264",
      outputLocation: previewFile,
      inputProps,
      browserExecutable: this.options.browserExecutable,
    });
    await renderStill({
      composition,
      serveUrl,
      output: thumbnailFile,
      frame: 0,
      inputProps,
      imageFormat: "png",
      browserExecutable: this.options.browserExecutable,
    });
    const [previewBytes, thumbnailBytes, metadata] = await Promise.all([
      readFile(previewFile),
      readFile(thumbnailFile),
      getVideoMetadata(previewFile),
    ]);
    if (metadata.width !== 1080 || metadata.height !== 1920 || !metadata.durationInSeconds) {
      throw new Error("video_render_metadata_invalid");
    }
    if (
      thumbnailBytes.length < 24 ||
      thumbnailBytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" ||
      thumbnailBytes.readUInt32BE(16) !== 1080 ||
      thumbnailBytes.readUInt32BE(20) !== 1920
    ) {
      throw new Error("video_render_thumbnail_invalid");
    }
    return {
      preview: {
        assetKind: "rendered_preview",
        storageState: "pending",
        publicationState: "not_eligible",
        contentHash: createHash("sha256").update(previewBytes).digest("hex"),
        localArtifactPath: previewFile,
        width: 1080,
        height: 1920,
        durationSeconds: metadata.durationInSeconds,
      },
      thumbnail: {
        assetKind: "thumbnail",
        storageState: "pending",
        publicationState: "not_eligible",
        contentHash: createHash("sha256").update(thumbnailBytes).digest("hex"),
        localArtifactPath: thumbnailFile,
        width: 1080,
        height: 1920,
      },
    };
  }
}
