import { createHash } from "node:crypto";

import type { GovernedPropertyMedia } from "../media/types.ts";
import {
  VIDEO_TOUR_DURATIONS,
  type VideoTourDuration,
  type VideoTourMotionPreset,
  type VideoTourPlan,
  type VideoTourTransition,
} from "./types.ts";

const ENVIRONMENT_PRIORITY = [
  "facade",
  "entrance",
  "living_room",
  "balcony",
  "view",
  "kitchen",
  "suite",
  "bedroom",
  "leisure",
  "bathroom",
  "floor_plan",
  "location",
  "detail",
  "brand",
  "other",
] as const;
const MOTIONS: readonly VideoTourMotionPreset[] = [
  "slow_zoom_in",
  "pan_right",
  "slow_zoom_out",
  "pan_left",
  "vertical_reveal",
  "static_hold",
];
const TRANSITIONS: readonly VideoTourTransition[] = ["cut", "crossfade", "dip_to_brand"];

function cleanCopy(value: string, maximum: number): string {
  const clean = value.trim().replace(/\s+/g, " ");
  if (!clean || clean.length > maximum) throw new Error("video_tour_copy_overflow");
  return clean;
}

export function buildVideoTourPlan(input: {
  tenantId: string;
  propertyId: string;
  title: string;
  cta: string;
  duration: VideoTourDuration;
  media: readonly GovernedPropertyMedia[];
}): VideoTourPlan {
  if (!(VIDEO_TOUR_DURATIONS as readonly number[]).includes(input.duration)) {
    throw new Error("invalid_video_tour_duration");
  }
  const priority = new Map(ENVIRONMENT_PRIORITY.map((item, index) => [item, index]));
  const media = input.media
    .filter(
      (item) =>
        item.tenantId === input.tenantId &&
        item.propertyId === input.propertyId &&
        item.mediaType === "image" &&
        item.mediaStatus === "approved" &&
        item.eligibleForVideo,
    )
    .sort(
      (left, right) =>
        (priority.get(left.environmentType) ?? 99) -
          (priority.get(right.environmentType) ?? 99) ||
        left.displayOrder - right.displayOrder ||
        left.id.localeCompare(right.id),
    );
  if (media.length < 2) throw new Error("video_tour_media_insufficient");

  const sceneCount = Math.min(media.length, input.duration === 15 ? 6 : input.duration === 20 ? 8 : 10);
  const selected = media.slice(0, sceneCount);
  const totalMilliseconds = input.duration * 1000;
  const baseMilliseconds = Math.floor(totalMilliseconds / sceneCount);
  const remainderMilliseconds = totalMilliseconds - baseMilliseconds * sceneCount;
  const scenes = selected.map((item, index) => ({
    position: index + 1,
    mediaId: item.id,
    environmentType: item.environmentType,
    duration: (baseMilliseconds + (index < remainderMilliseconds ? 1 : 0)) / 1000,
    motionPreset: MOTIONS[index % MOTIONS.length],
    transition:
      index === selected.length - 1
        ? TRANSITIONS[2]
        : TRANSITIONS[index % (TRANSITIONS.length - 1)],
    diagnostics: [],
  }));

  return {
    kind: "video_tour_plan",
    propertyId: input.propertyId,
    duration: input.duration,
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    selectedMediaIds: selected.map((item) => item.id),
    scenes,
    title: cleanCopy(input.title, 80),
    overlays: [],
    cta: cleanCopy(input.cta, 80),
    soundtrackPolicy: "silent",
    factualSources: [{ field: "title", source: "yzi_imob_properties" }],
    diagnostics: [],
  };
}

export function hashVideoTourPlan(plan: VideoTourPlan): string {
  return createHash("sha256").update(JSON.stringify(plan)).digest("hex");
}
