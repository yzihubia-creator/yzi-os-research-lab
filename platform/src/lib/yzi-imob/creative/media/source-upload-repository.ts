import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { PropertyGallerySlotKey } from "./gallery-contract.ts";

export const PROPERTY_SOURCE_MEDIA_BUCKET = "yzi-imob-source-media" as const;

type UploadReservationRow = {
  media_id: string;
  storage_bucket: string;
  storage_path: string;
  expires_at: string;
};

type UploadFinalizationRow = {
  media_id: string;
  property_id: string;
  media_status: string;
  processing_status: string;
};

function firstRow<T>(data: unknown): T | null {
  if (Array.isArray(data)) return (data[0] as T | undefined) ?? null;
  return (data as T | null) ?? null;
}

export async function getPropertyMediaUploadCapability(
  supabase: SupabaseClient,
  propertyId: string,
): Promise<boolean> {
  const result = await supabase.rpc("get_yzi_imob_property_media_upload_capability", {
    p_property_id: propertyId,
  });
  if (result.error) return false;
  const row = firstRow<{ enabled?: boolean; storage_bucket?: string }>(result.data);
  return row?.enabled === true && row.storage_bucket === PROPERTY_SOURCE_MEDIA_BUCKET;
}

export async function reservePropertyMediaUpload(
  supabase: SupabaseClient,
  input: {
    propertyId: string;
    slot: PropertyGallerySlotKey;
    filename: string;
    mimeType: string;
    byteSize: number;
  },
): Promise<UploadReservationRow | null> {
  const result = await supabase.rpc("reserve_yzi_imob_property_media_upload", {
    p_property_id: input.propertyId,
    p_slot: input.slot,
    p_original_filename: input.filename,
    p_mime_type: input.mimeType,
    p_byte_size: input.byteSize,
  });
  if (result.error) return null;
  const row = firstRow<UploadReservationRow>(result.data);
  if (
    !row ||
    row.storage_bucket !== PROPERTY_SOURCE_MEDIA_BUCKET ||
    !row.media_id ||
    !row.storage_path ||
    !row.expires_at
  ) {
    return null;
  }
  return row;
}

export async function finalizePropertyMediaUpload(
  supabase: SupabaseClient,
  input: { mediaId: string; storagePath: string },
): Promise<UploadFinalizationRow | null> {
  const result = await supabase.rpc("finalize_yzi_imob_property_media_upload", {
    p_media_id: input.mediaId,
    p_storage_path: input.storagePath,
  });
  if (result.error) return null;
  return firstRow<UploadFinalizationRow>(result.data);
}

export async function cancelPropertyMediaUpload(
  supabase: SupabaseClient,
  input: { mediaId: string; storagePath: string },
): Promise<{ mediaId: string; storageBucket: string; storagePath: string } | null> {
  const result = await supabase.rpc("cancel_yzi_imob_property_media_upload", {
    p_media_id: input.mediaId,
    p_storage_path: input.storagePath,
  });
  if (result.error) return null;
  const row = firstRow<{
    media_id: string;
    storage_bucket: string;
    storage_path: string;
  }>(result.data);
  if (!row || row.storage_bucket !== PROPERTY_SOURCE_MEDIA_BUCKET) return null;
  return {
    mediaId: row.media_id,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
  };
}
