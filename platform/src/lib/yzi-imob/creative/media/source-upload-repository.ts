import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { PropertyGallerySlotKey } from "./gallery-contract.ts";

export const PROPERTY_SOURCE_MEDIA_BUCKET = "yzi-imob-source-media" as const;
export const PROPERTY_MEDIA_PREVIEW_TTL_SECONDS = 120 as const;
// Acesso temporário explícito. O bucket continua privado: nada aqui produz URL
// pública nem contrato durável — o link expira e precisa ser gerado de novo.
export const PROPERTY_MEDIA_DOWNLOAD_TTL_SECONDS = 300 as const;
export const PROPERTY_MEDIA_SHARE_TTL_SECONDS = 900 as const;

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

function logMediaRpcFailure(
  operation: "capability" | "reserve" | "finalize" | "cancel" | "remove",
  error: { code?: string },
) {
  console.error("[yzi-imob-property-media-rpc]", {
    operation,
    code: error.code ?? "unknown",
  });
}

function isOwnedSourcePath(input: {
  tenantId: string;
  propertyId: string;
  storageBucket: string | null;
  storagePath: string | null;
}): input is typeof input & { storageBucket: string; storagePath: string } {
  return (
    input.storageBucket === PROPERTY_SOURCE_MEDIA_BUCKET &&
    typeof input.storagePath === "string" &&
    input.storagePath.startsWith(
      `tenants/${input.tenantId}/properties/${input.propertyId}/source-media/`,
    )
  );
}

export async function createPropertyMediaPreview(
  supabase: SupabaseClient,
  input: {
    tenantId: string;
    propertyId: string;
    storageBucket: string;
    storagePath: string;
  },
): Promise<{ signedUrl: string; expiresAt: string } | null> {
  if (!isOwnedSourcePath(input)) return null;

  const result = await supabase.storage
    .from(PROPERTY_SOURCE_MEDIA_BUCKET)
    .createSignedUrl(input.storagePath, PROPERTY_MEDIA_PREVIEW_TTL_SECONDS);
  if (result.error || !result.data.signedUrl) return null;

  return {
    signedUrl: result.data.signedUrl,
    expiresAt: new Date(Date.now() + PROPERTY_MEDIA_PREVIEW_TTL_SECONDS * 1000).toISOString(),
  };
}

/**
 * Acesso temporário a uma mídia do acervo privado.
 *
 * `download` força o navegador a salvar o arquivo com o nome original;
 * `share` devolve o mesmo tipo de link assinado para ser copiado. Em nenhum dos
 * dois casos existe URL pública: o link expira e a policy de SELECT do bucket
 * continua exigindo vínculo ativo com o tenant dono da mídia.
 */
export async function createPropertyMediaAccessLink(
  supabase: SupabaseClient,
  input: {
    tenantId: string;
    propertyId: string;
    storageBucket: string | null;
    storagePath: string | null;
    mode: "download" | "share";
    downloadFilename?: string | null;
  },
): Promise<{ signedUrl: string; expiresAt: string; ttlSeconds: number } | null> {
  if (!isOwnedSourcePath(input)) return null;
  const ttlSeconds =
    input.mode === "download"
      ? PROPERTY_MEDIA_DOWNLOAD_TTL_SECONDS
      : PROPERTY_MEDIA_SHARE_TTL_SECONDS;

  const result = await supabase.storage
    .from(PROPERTY_SOURCE_MEDIA_BUCKET)
    .createSignedUrl(
      input.storagePath,
      ttlSeconds,
      input.mode === "download" && input.downloadFilename
        ? { download: input.downloadFilename }
        : undefined,
    );
  if (result.error || !result.data.signedUrl) return null;

  return {
    signedUrl: result.data.signedUrl,
    expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    ttlSeconds,
  };
}

export async function getPropertyMediaUploadCapability(
  supabase: SupabaseClient,
  propertyId: string,
): Promise<boolean> {
  const result = await supabase.rpc("get_yzi_imob_property_media_upload_capability", {
    p_property_id: propertyId,
  });
  if (result.error) {
    logMediaRpcFailure("capability", result.error);
    return false;
  }
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
  if (result.error) {
    logMediaRpcFailure("reserve", result.error);
    return null;
  }
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
  if (result.error) {
    logMediaRpcFailure("finalize", result.error);
    return null;
  }
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
  if (result.error) {
    logMediaRpcFailure("cancel", result.error);
    return null;
  }
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

/**
 * Remoção governada de mídia já finalizada. A linha nunca é apagada: o RPC a
 * marca como removida, limpa a capa se for o caso e registra `media_removed`
 * ou `media_replaced`. A limpeza do objeto no bucket acontece depois, com a
 * sessão do próprio usuário, autorizada pela policy de DELETE.
 */
export async function removePropertyMedia(
  supabase: SupabaseClient,
  input: {
    propertyId: string;
    mediaId: string;
    replacementMediaId?: string | null;
    reason?: string | null;
  },
): Promise<{
  mediaId: string;
  storageBucket: string | null;
  storagePath: string | null;
  coverCleared: boolean;
  storageCleanupRequired: boolean;
} | null> {
  const result = await supabase.rpc("remove_yzi_imob_property_media", {
    p_property_id: input.propertyId,
    p_media_id: input.mediaId,
    p_replacement_media_id: input.replacementMediaId ?? null,
    p_reason: input.reason ?? null,
  });
  if (result.error) {
    logMediaRpcFailure("remove", result.error);
    return null;
  }
  const row = firstRow<{
    media_id: string;
    storage_bucket: string | null;
    storage_path: string | null;
    cover_cleared: boolean;
    storage_cleanup_required: boolean;
  }>(result.data);
  if (!row?.media_id) return null;
  return {
    mediaId: row.media_id,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    coverCleared: row.cover_cleared === true,
    storageCleanupRequired: row.storage_cleanup_required === true,
  };
}
