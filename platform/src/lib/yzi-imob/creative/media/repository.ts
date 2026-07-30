import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  CREATIVE_ENVIRONMENT_TYPES,
  type CreativeEnvironmentType,
  type CreativeMediaOrientation,
  type CreativeMediaStatus,
} from "./types.ts";

const MEDIA_STATUSES: readonly CreativeMediaStatus[] = [
  "pending",
  "approved",
  "excluded",
  "failed",
];
const ORIENTATIONS: readonly CreativeMediaOrientation[] = [
  "portrait",
  "landscape",
  "square",
  "unknown",
];

export type UpdateCreativeMediaGovernanceInput = {
  propertyId: string;
  mediaId: string;
  environmentType: CreativeEnvironmentType;
  displayOrder: number;
  isPrimary: boolean;
  eligibleForCarousel: boolean;
  eligibleForVideo: boolean;
  mediaStatus: CreativeMediaStatus;
  orientation: CreativeMediaOrientation;
  humanNote?: string | null;
  exclusionReason?: string | null;
};

export type CreativeMediaGovernanceResult =
  | {
      status: "ok";
      value: {
        mediaId: string;
        propertyId: string;
        mediaStatus: CreativeMediaStatus;
        isPrimary: boolean;
      };
    }
  | { status: "error"; code: "invalid_input" | "not_found" | "update_failed" };

function validText(value: string | null | undefined): boolean {
  return !value || value.trim().length <= 500;
}

export async function updateCreativeMediaGovernance(
  supabase: SupabaseClient,
  tenantId: string,
  input: UpdateCreativeMediaGovernanceInput,
): Promise<CreativeMediaGovernanceResult> {
  const exclusionReason = input.exclusionReason?.trim() || null;
  if (
    !(CREATIVE_ENVIRONMENT_TYPES as readonly string[]).includes(input.environmentType) ||
    !MEDIA_STATUSES.includes(input.mediaStatus) ||
    !ORIENTATIONS.includes(input.orientation) ||
    !Number.isInteger(input.displayOrder) ||
    input.displayOrder < 0 ||
    input.displayOrder > 10000 ||
    !validText(input.humanNote) ||
    !validText(exclusionReason) ||
    (input.mediaStatus === "excluded" && !exclusionReason) ||
    (input.mediaStatus !== "excluded" && exclusionReason)
  ) {
    return { status: "error", code: "invalid_input" };
  }

  const media = await supabase
    .from("yzi_imob_property_media")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("property_id", input.propertyId)
    .eq("id", input.mediaId)
    .maybeSingle();
  if (media.error || !media.data) return { status: "error", code: "not_found" };

  const { data, error } = await supabase.rpc(
    "update_yzi_imob_property_media_governance",
    {
      p_property_id: input.propertyId,
      p_media_id: input.mediaId,
      p_environment_type: input.environmentType,
      p_display_order: input.displayOrder,
      p_is_primary: input.isPrimary,
      p_eligible_for_carousel: input.eligibleForCarousel,
      p_eligible_for_video: input.eligibleForVideo,
      p_media_status: input.mediaStatus,
      p_orientation: input.orientation,
      p_human_note: input.humanNote?.trim() || null,
      p_exclusion_reason: exclusionReason,
    },
  );
  if (error || !data) return { status: "error", code: "update_failed" };
  const row = (Array.isArray(data) ? data[0] : data) as
    | {
        media_id: string;
        property_id: string;
        media_status: CreativeMediaStatus;
        is_primary: boolean;
      }
    | null;
  if (!row) return { status: "error", code: "update_failed" };
  return {
    status: "ok",
    value: {
      mediaId: row.media_id,
      propertyId: row.property_id,
      mediaStatus: row.media_status,
      isPrimary: row.is_primary,
    },
  };
}
