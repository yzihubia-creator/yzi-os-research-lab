import type {
  CreativeEnvironmentType,
  CreativeReadinessDiagnostic,
} from "../media/types.ts";

export const VIDEO_TOUR_DURATIONS = [15, 20, 30] as const;
export type VideoTourDuration = (typeof VIDEO_TOUR_DURATIONS)[number];
export const VIDEO_TOUR_MOTION_PRESETS = [
  "slow_zoom_in",
  "slow_zoom_out",
  "pan_left",
  "pan_right",
  "vertical_reveal",
  "static_hold",
] as const;
export type VideoTourMotionPreset = (typeof VIDEO_TOUR_MOTION_PRESETS)[number];
export const VIDEO_TOUR_TRANSITIONS = ["cut", "crossfade", "dip_to_brand"] as const;
export type VideoTourTransition = (typeof VIDEO_TOUR_TRANSITIONS)[number];

export type VideoTourScene = {
  position: number;
  mediaId: string;
  environmentType: CreativeEnvironmentType;
  duration: number;
  motionPreset: VideoTourMotionPreset;
  transition: VideoTourTransition;
  overlay?: string;
  diagnostics: readonly CreativeReadinessDiagnostic[];
};

export type VideoTourPlan = {
  kind: "video_tour_plan";
  propertyId: string;
  duration: VideoTourDuration;
  aspectRatio: "9:16";
  width: 1080;
  height: 1920;
  selectedMediaIds: readonly string[];
  scenes: readonly VideoTourScene[];
  title: string;
  overlays: readonly string[];
  cta: string;
  soundtrackPolicy: "silent";
  factualSources: readonly { field: string; source: "yzi_imob_properties" }[];
  diagnostics: readonly CreativeReadinessDiagnostic[];
};

export type VideoTourAdjustment =
  | { kind: "swap_scene_media"; scenePosition: number; replacementMediaId: string }
  | { kind: "reorder_scene"; scenePosition: number; targetPosition: number }
  | { kind: "reduce_duration"; duration: VideoTourDuration }
  | { kind: "remove_overlay"; scenePosition: number }
  | { kind: "slow_motion"; scenePosition: number }
  | { kind: "correct_cta"; cta: string };
