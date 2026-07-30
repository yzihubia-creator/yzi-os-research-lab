import "server-only";

import { createHash } from "node:crypto";

import type { VideoTourPlan } from "./types.ts";

export type VideoRenderRequest = {
  tenantId: string;
  propertyId: string;
  requestId: string;
  deliverableId: string;
  revisionId: string;
  plan: VideoTourPlan;
  sourceMedia: readonly {
    id: string;
    tenantId: string;
    propertyId: string;
    contentHash: string;
  }[];
};

export type VideoRenderResult = {
  preview: {
    assetKind: "rendered_preview";
    storageState: "pending";
    publicationState: "not_eligible";
    contentHash: string;
    localArtifactPath: string | null;
    width: 1080;
    height: 1920;
    durationSeconds: number;
  };
  thumbnail: {
    assetKind: "thumbnail";
    storageState: "pending";
    publicationState: "not_eligible";
    contentHash: string;
    localArtifactPath: string | null;
    width: 1080;
    height: 1920;
  };
};

export interface VideoRenderTransport {
  render(input: VideoRenderRequest): Promise<VideoRenderResult>;
}

export class UnavailableVideoRenderTransport implements VideoRenderTransport {
  async render(): Promise<never> {
    throw new Error("video_render_transport_required");
  }
}

export class DeterministicVideoRenderFakeTransport implements VideoRenderTransport {
  async render(input: VideoRenderRequest): Promise<VideoRenderResult> {
    const sourceIds = new Set(input.sourceMedia.map((item) => item.id));
    if (
      input.sourceMedia.some(
        (item) => item.tenantId !== input.tenantId || item.propertyId !== input.propertyId,
      ) ||
      input.plan.selectedMediaIds.some((id) => !sourceIds.has(id))
    ) {
      throw new Error("video_render_media_scope_mismatch");
    }
    const descriptor = JSON.stringify({
      plan: input.plan,
      sources: input.sourceMedia.map((item) => [item.id, item.contentHash]),
    });
    const contentHash = createHash("sha256").update(descriptor).digest("hex");
    return {
      preview: {
        assetKind: "rendered_preview",
        storageState: "pending",
        publicationState: "not_eligible",
        contentHash,
        localArtifactPath: null,
        width: 1080,
        height: 1920,
        durationSeconds: input.plan.duration,
      },
      thumbnail: {
        assetKind: "thumbnail",
        storageState: "pending",
        publicationState: "not_eligible",
        contentHash: createHash("sha256").update(`${contentHash}:thumbnail`).digest("hex"),
        localArtifactPath: null,
        width: 1080,
        height: 1920,
      },
    };
  }
}

export async function renderVideoTour(
  input: VideoRenderRequest,
  transport: VideoRenderTransport = new UnavailableVideoRenderTransport(),
): Promise<VideoRenderResult> {
  return transport.render(input);
}
