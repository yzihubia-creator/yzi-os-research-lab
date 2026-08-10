"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import {
  PROPERTY_GALLERY_SLOTS,
  validatePropertyMediaFile,
  type PropertyGallerySlotKey,
} from "@/lib/yzi-imob/creative/media/gallery-contract";
import { updateCreativeMediaGovernance } from "@/lib/yzi-imob/creative/media/repository";
import {
  cancelPropertyMediaUpload,
  finalizePropertyMediaUpload,
  getPropertyMediaUploadCapability,
  reservePropertyMediaUpload,
} from "@/lib/yzi-imob/creative/media/source-upload-repository";
import type { CreativeEnvironmentType } from "@/lib/yzi-imob/creative/media/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STORAGE_PATH_RE = /^tenants\/[0-9a-f-]{36}\/properties\/[0-9a-f-]{36}\/source-media\/[a-z_]+\/[0-9a-f-]{36}\.[a-z0-9]+$/i;

export type PropertyMediaActionResult =
  | { status: "ok"; message: string }
  | { status: "error"; message: string };

export type PropertyMediaUploadReservationResult =
  | {
      status: "ok";
      reservation: {
        mediaId: string;
        bucket: string;
        path: string;
        expiresAt: string;
      };
    }
  | { status: "error"; message: string };

async function getMediaActionContext(propertyId: string) {
  if (!UUID_RE.test(propertyId)) return null;
  const tenant = await getTenantContext();
  if (
    tenant.status !== "tenant_found" ||
    !["owner", "admin", "operator"].includes(tenant.role)
  ) {
    return null;
  }
  const supabase = await createServerSupabaseClient();
  const property = await supabase
    .from("yzi_imob_properties")
    .select("id")
    .eq("id", propertyId)
    .eq("tenant_id", tenant.tenant.id)
    .maybeSingle();
  if (property.error || !property.data) return null;
  return { supabase, tenantId: tenant.tenant.id };
}

function revalidatePropertyMedia(propertyId: string) {
  revalidatePath(`/cockpit/yzi-imob/imoveis/${propertyId}`);
  revalidatePath(`/cockpit/yzi-imob/imoveis/${propertyId}/creative`);
  revalidatePath("/cockpit/yzi-imob/imoveis");
  revalidatePath("/cockpit/yzi-imob/site");
}

export async function beginPropertyMediaUploadAction(input: {
  propertyId: string;
  slot: PropertyGallerySlotKey;
  filename: string;
  mimeType: string;
  byteSize: number;
}): Promise<PropertyMediaUploadReservationResult> {
  if (
    !input ||
    typeof input.propertyId !== "string" ||
    typeof input.slot !== "string" ||
    typeof input.filename !== "string" ||
    typeof input.mimeType !== "string" ||
    typeof input.byteSize !== "number"
  ) {
    return { status: "error", message: "Dados de upload inválidos." };
  }
  const validation = validatePropertyMediaFile(input.slot, {
    name: input.filename,
    type: input.mimeType,
    size: input.byteSize,
  });
  if (!validation.valid || input.filename.trim() !== input.filename || input.filename.length > 255) {
    return {
      status: "error",
      message: validation.valid ? "Nome de arquivo inválido." : validation.message,
    };
  }
  if (!PROPERTY_GALLERY_SLOTS.some((slot) => slot.key === input.slot)) {
    return { status: "error", message: "Slot de mídia inválido." };
  }

  const context = await getMediaActionContext(input.propertyId);
  if (!context) return { status: "error", message: "Você não pode enviar mídia para este imóvel." };
  if (!(await getPropertyMediaUploadCapability(context.supabase, input.propertyId))) {
    return { status: "error", message: "O upload seguro ainda não está disponível neste ambiente." };
  }

  const reservation = await reservePropertyMediaUpload(context.supabase, input);
  if (!reservation) {
    return {
      status: "error",
      message: "Não foi possível reservar o upload. Revise o arquivo e os limites do imóvel.",
    };
  }
  return {
    status: "ok",
    reservation: {
      mediaId: reservation.media_id,
      bucket: reservation.storage_bucket,
      path: reservation.storage_path,
      expiresAt: reservation.expires_at,
    },
  };
}

export async function finalizePropertyMediaUploadAction(input: {
  propertyId: string;
  mediaId: string;
  path: string;
}): Promise<PropertyMediaActionResult> {
  if (
    !input ||
    typeof input.propertyId !== "string" ||
    typeof input.mediaId !== "string" ||
    typeof input.path !== "string"
  ) {
    return { status: "error", message: "Reserva de upload inválida." };
  }
  if (!UUID_RE.test(input.mediaId) || !STORAGE_PATH_RE.test(input.path)) {
    return { status: "error", message: "Reserva de upload inválida." };
  }
  const context = await getMediaActionContext(input.propertyId);
  if (!context) return { status: "error", message: "Você não pode finalizar este upload." };
  const finalized = await finalizePropertyMediaUpload(context.supabase, {
    mediaId: input.mediaId,
    storagePath: input.path,
  });
  if (!finalized || finalized.property_id !== input.propertyId) {
    return {
      status: "error",
      message: "O arquivo não passou pela validação final. A reserva será cancelada.",
    };
  }
  revalidatePropertyMedia(input.propertyId);
  return { status: "ok", message: "Mídia enviada e aguardando revisão." };
}

export async function cancelPropertyMediaUploadAction(input: {
  propertyId: string;
  mediaId: string;
  path: string;
}): Promise<PropertyMediaActionResult> {
  if (
    !input ||
    typeof input.propertyId !== "string" ||
    typeof input.mediaId !== "string" ||
    typeof input.path !== "string"
  ) {
    return { status: "error", message: "Reserva de upload inválida." };
  }
  if (!UUID_RE.test(input.mediaId) || !STORAGE_PATH_RE.test(input.path)) {
    return { status: "error", message: "Reserva de upload inválida." };
  }
  const context = await getMediaActionContext(input.propertyId);
  if (!context) return { status: "error", message: "Você não pode cancelar este upload." };
  const cancelled = await cancelPropertyMediaUpload(context.supabase, {
    mediaId: input.mediaId,
    storagePath: input.path,
  });
  if (!cancelled) return { status: "error", message: "Não foi possível cancelar a reserva." };

  const cleanup = await context.supabase.storage
    .from(cancelled.storageBucket)
    .remove([cancelled.storagePath]);
  revalidatePropertyMedia(input.propertyId);
  return {
    status: "ok",
    message: cleanup.error
      ? "Reserva cancelada; a limpeza do arquivo órfão ficou pendente."
      : "Reserva cancelada e arquivo temporário removido.",
  };
}

export async function setPropertyMediaCoverAction(input: {
  propertyId: string;
  mediaId: string;
}): Promise<PropertyMediaActionResult> {
  if (
    !input ||
    typeof input.propertyId !== "string" ||
    typeof input.mediaId !== "string"
  ) {
    return { status: "error", message: "Mídia inválida." };
  }
  if (!UUID_RE.test(input.mediaId)) return { status: "error", message: "Mídia inválida." };
  const context = await getMediaActionContext(input.propertyId);
  if (!context) return { status: "error", message: "Você não pode alterar a capa deste imóvel." };
  if (!(await getPropertyMediaUploadCapability(context.supabase, input.propertyId))) {
    return { status: "error", message: "A governança segura de mídia não está disponível." };
  }
  const media = await context.supabase
    .from("yzi_imob_property_media")
    .select(
      "id,media_type,environment_type,sort_order,eligible_for_carousel,eligible_for_video,media_status,orientation,human_note,exclusion_reason,processing_status,is_publication_allowed,upload_state",
    )
    .eq("id", input.mediaId)
    .eq("property_id", input.propertyId)
    .eq("tenant_id", context.tenantId)
    .maybeSingle();
  const row = media.data as {
    id: string;
    media_type: string;
    environment_type: CreativeEnvironmentType;
    sort_order: number;
    eligible_for_carousel: boolean;
    eligible_for_video: boolean;
    media_status: "pending" | "approved" | "excluded" | "failed";
    orientation: "portrait" | "landscape" | "square" | "unknown";
    human_note: string | null;
    exclusion_reason: string | null;
    processing_status: string;
    is_publication_allowed: boolean;
    upload_state: string;
  } | null;
  if (
    media.error ||
    !row ||
    row.media_type !== "image" ||
    row.media_status !== "approved" ||
    row.processing_status !== "ready" ||
    !row.is_publication_allowed ||
    row.upload_state !== "completed"
  ) {
    return { status: "error", message: "Somente imagem aprovada e liberada pode virar capa." };
  }
  const result = await updateCreativeMediaGovernance(context.supabase, context.tenantId, {
    propertyId: input.propertyId,
    mediaId: input.mediaId,
    environmentType: row.environment_type,
    displayOrder: row.sort_order,
    isPrimary: true,
    eligibleForCarousel: row.eligible_for_carousel,
    eligibleForVideo: row.eligible_for_video,
    mediaStatus: row.media_status,
    orientation: row.orientation,
    humanNote: row.human_note,
    exclusionReason: row.exclusion_reason,
  });
  if (result.status !== "ok") return { status: "error", message: "Não foi possível definir a capa." };
  revalidatePropertyMedia(input.propertyId);
  return { status: "ok", message: "Capa definida com governança registrada." };
}
