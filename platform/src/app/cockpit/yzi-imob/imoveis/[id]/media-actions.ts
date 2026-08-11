"use server";

import { randomUUID } from "node:crypto";

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
  createPropertyMediaAccessLink,
  finalizePropertyMediaUpload,
  getPropertyMediaUploadCapability,
  removePropertyMedia,
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
  | { status: "error"; message: string; code?: undefined }
  | {
      status: "error";
      message: string;
      code: "media_upload_prepare_failed";
      stage: MediaUploadPrepareStage;
      diagnosticId: string;
    };

type MediaUploadPrepareStage =
  | "action_started"
  | "property_input_validated"
  | "tenant_resolve_start"
  | "tenant_resolved"
  | "property_access_client_create"
  | "property_access_query_start"
  | "property_access_resolved"
  | "capability_call_start"
  | "capability_loaded"
  | "reserve_call_start"
  | "reserve_call_result";

type MediaUploadCheckpoint = (stage: MediaUploadPrepareStage) => void;

function sanitizeDiagnosticValue(value: string, fallback: string) {
  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (!normalized) return fallback;
  return normalized
    .replace(/\bBearer\s+\S+/gi, "[redacted]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[redacted]")
    .replace(
      /\b(access[_ -]?token|refresh[_ -]?token|signed[_ -]?(?:upload[_ -]?)?token|service[_ -]?role|api[_ -]?key|apikey|authorization|cookie|password|secret)\b\s*[:=]\s*\S+/gi,
      "$1=[redacted]",
    )
    .replace(/[A-Za-z0-9_-]{80,}/g, "[redacted]")
    .slice(0, 240);
}

function getSafeErrorDetails(error: unknown) {
  if (!(error instanceof Error)) {
    return { errorClass: "UnknownError", errorMessage: "Non-Error exception" };
  }
  return {
    errorClass: sanitizeDiagnosticValue(error.name, "Error").slice(0, 80),
    errorMessage: sanitizeDiagnosticValue(error.message, "No error message"),
  };
}

async function getMediaActionContext(propertyId: string, checkpoint?: MediaUploadCheckpoint) {
  if (!UUID_RE.test(propertyId)) return null;
  checkpoint?.("tenant_resolve_start");
  const tenant = await getTenantContext();
  if (checkpoint && tenant.status === "error") {
    throw new Error("Tenant context returned an error status");
  }
  if (
    tenant.status !== "tenant_found" ||
    !["owner", "admin", "operator"].includes(tenant.role)
  ) {
    return null;
  }
  checkpoint?.("tenant_resolved");
  checkpoint?.("property_access_client_create");
  const supabase = await createServerSupabaseClient();
  checkpoint?.("property_access_query_start");
  const property = await supabase
    .from("yzi_imob_properties")
    .select("id")
    .eq("id", propertyId)
    .eq("tenant_id", tenant.tenant.id)
    .maybeSingle();
  if (property.error || !property.data) return null;
  checkpoint?.("property_access_resolved");
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
  const diagnosticId = randomUUID();
  let stage: MediaUploadPrepareStage = "action_started";
  const checkpoint: MediaUploadCheckpoint = (nextStage) => {
    stage = nextStage;
    console.info("[yzi-imob-property-media-upload-prepare]", { diagnosticId, stage });
  };

  checkpoint(stage);
  try {
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
  checkpoint("property_input_validated");

  const context = await getMediaActionContext(input.propertyId, checkpoint);
  if (!context) return { status: "error", message: "Você não pode enviar mídia para este imóvel." };
  checkpoint("capability_call_start");
  const capabilityEnabled = await getPropertyMediaUploadCapability(context.supabase, input.propertyId);
  checkpoint("capability_loaded");
  if (!capabilityEnabled) {
    return { status: "error", message: "O upload seguro ainda não está disponível neste ambiente." };
  }

  checkpoint("reserve_call_start");
  const reservation = await reservePropertyMediaUpload(context.supabase, input);
  checkpoint("reserve_call_result");
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
  } catch (error) {
    console.error("[yzi-imob-property-media-upload-prepare-failed]", {
      diagnosticId,
      stage,
      ...getSafeErrorDetails(error),
    });
    return {
      status: "error",
      code: "media_upload_prepare_failed",
      stage,
      diagnosticId,
      message: `Não foi possível preparar a mídia. Código de diagnóstico: ${diagnosticId}. Etapa: ${stage}.`,
    };
  }
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

const GOVERNABLE_MEDIA_COLUMNS =
  "id,media_type,environment_type,sort_order,eligible_for_carousel,eligible_for_video,media_status,orientation,human_note,exclusion_reason,processing_status,is_publication_allowed,upload_state,is_cover,storage_bucket,storage_path,original_filename,file_extension,source_kind";

type GovernableMediaRow = {
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
  is_cover: boolean;
  storage_bucket: string | null;
  storage_path: string | null;
  original_filename: string | null;
  file_extension: string | null;
  source_kind: string | null;
};

async function loadGovernableMedia(
  context: { supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>; tenantId: string },
  propertyId: string,
  mediaId: string,
): Promise<GovernableMediaRow | null> {
  const media = await context.supabase
    .from("yzi_imob_property_media")
    .select(GOVERNABLE_MEDIA_COLUMNS)
    .eq("id", mediaId)
    .eq("property_id", propertyId)
    .eq("tenant_id", context.tenantId)
    .maybeSingle();
  if (media.error || !media.data) return null;
  return media.data as unknown as GovernableMediaRow;
}

/**
 * Aprovação governada da mídia original.
 *
 * Upload continua não aprovando nada: esta é a decisão humana explícita que
 * libera a mídia para uso e, só a partir dela, permite capa e prontidão de
 * formato. Reverter devolve a mídia para revisão e derruba a capa junto.
 */
export async function setPropertyMediaApprovalAction(input: {
  propertyId: string;
  mediaId: string;
  approved: boolean;
}): Promise<PropertyMediaActionResult> {
  if (
    !input ||
    typeof input.propertyId !== "string" ||
    typeof input.mediaId !== "string" ||
    typeof input.approved !== "boolean"
  ) {
    return { status: "error", message: "Mídia inválida." };
  }
  if (!UUID_RE.test(input.mediaId)) return { status: "error", message: "Mídia inválida." };
  const context = await getMediaActionContext(input.propertyId);
  if (!context) return { status: "error", message: "Você não pode revisar a mídia deste imóvel." };

  const row = await loadGovernableMedia(context, input.propertyId, input.mediaId);
  if (!row) return { status: "error", message: "Mídia não encontrada neste imóvel." };
  if (row.upload_state !== "completed" || row.processing_status !== "ready") {
    return { status: "error", message: "O envio desta mídia ainda não foi concluído." };
  }
  if (input.approved && row.media_status === "approved") {
    return { status: "ok", message: "Esta mídia já estava aprovada." };
  }

  const result = await updateCreativeMediaGovernance(context.supabase, context.tenantId, {
    propertyId: input.propertyId,
    mediaId: input.mediaId,
    environmentType: row.environment_type,
    displayOrder: row.sort_order,
    isPrimary: input.approved && row.is_cover,
    // Elegibilidade de formato só faz sentido para imagem; vídeo bruto e
    // documento entram no acervo, não na composição de carrossel/vídeo.
    eligibleForCarousel: input.approved && row.media_type === "image",
    eligibleForVideo: input.approved && row.media_type === "image",
    mediaStatus: input.approved ? "approved" : "pending",
    orientation: row.orientation,
    humanNote: row.human_note,
    exclusionReason: null,
  });
  if (result.status !== "ok") {
    return { status: "error", message: "Não foi possível registrar a revisão desta mídia." };
  }
  revalidatePropertyMedia(input.propertyId);
  return {
    status: "ok",
    message: input.approved
      ? "Mídia aprovada e liberada para uso, com governança registrada."
      : "Mídia devolvida para revisão.",
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
  const row = await loadGovernableMedia(context, input.propertyId, input.mediaId);
  if (
    !row ||
    row.media_type !== "image" ||
    row.media_status !== "approved" ||
    row.processing_status !== "ready" ||
    !row.is_publication_allowed ||
    row.upload_state !== "completed"
  ) {
    return {
      status: "error",
      message: "Só uma imagem aprovada pode virar capa. Aprove esta mídia antes.",
    };
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

/**
 * Remoção governada. A linha nunca some do banco: ela sai do acervo, o evento
 * fica registrado e o arquivo privado é apagado em seguida com a sessão do
 * próprio usuário. Se a mídia removida era a capa, o imóvel fica sem capa —
 * explicitamente, nunca apontando para algo que não existe mais.
 */
export async function removePropertyMediaAction(input: {
  propertyId: string;
  mediaId: string;
  replacementMediaId?: string | null;
  reason?: string | null;
}): Promise<PropertyMediaActionResult> {
  if (
    !input ||
    typeof input.propertyId !== "string" ||
    typeof input.mediaId !== "string" ||
    !UUID_RE.test(input.mediaId)
  ) {
    return { status: "error", message: "Mídia inválida." };
  }
  const replacementMediaId = input.replacementMediaId ?? null;
  if (replacementMediaId !== null && !UUID_RE.test(replacementMediaId)) {
    return { status: "error", message: "Mídia substituta inválida." };
  }
  const context = await getMediaActionContext(input.propertyId);
  if (!context) return { status: "error", message: "Você não pode remover mídia deste imóvel." };

  const removed = await removePropertyMedia(context.supabase, {
    propertyId: input.propertyId,
    mediaId: input.mediaId,
    replacementMediaId,
    reason: typeof input.reason === "string" ? input.reason.slice(0, 300) : null,
  });
  if (!removed) {
    return { status: "error", message: "Não foi possível remover esta mídia. Tente novamente." };
  }

  let cleanupPending = false;
  if (removed.storageCleanupRequired && removed.storageBucket && removed.storagePath) {
    const cleanup = await context.supabase.storage
      .from(removed.storageBucket)
      .remove([removed.storagePath]);
    cleanupPending = Boolean(cleanup.error);
  }
  revalidatePropertyMedia(input.propertyId);

  const base = replacementMediaId
    ? "Mídia substituída; a anterior saiu do acervo com o registro da troca."
    : "Mídia removida do acervo com o registro da exclusão.";
  return {
    status: "ok",
    message: [
      base,
      removed.coverCleared ? "O imóvel ficou sem capa — defina uma nova." : null,
      cleanupPending ? "A limpeza do arquivo privado ficou pendente." : null,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

export type PropertyMediaAccessLinkResult =
  | {
      status: "ok";
      url: string;
      expiresAt: string;
      ttlSeconds: number;
      filename: string | null;
    }
  | { status: "error"; message: string };

/**
 * Acesso temporário para baixar ou compartilhar. Nunca devolve URL pública nem
 * caminho de Storage: cada clique gera um link assinado novo, com validade
 * curta e explícita para o gestor.
 */
export async function createPropertyMediaAccessLinkAction(input: {
  propertyId: string;
  mediaId: string;
  mode: "download" | "share";
}): Promise<PropertyMediaAccessLinkResult> {
  if (
    !input ||
    typeof input.propertyId !== "string" ||
    typeof input.mediaId !== "string" ||
    !UUID_RE.test(input.mediaId) ||
    (input.mode !== "download" && input.mode !== "share")
  ) {
    return { status: "error", message: "Mídia inválida." };
  }
  const context = await getMediaActionContext(input.propertyId);
  if (!context) return { status: "error", message: "Você não pode acessar a mídia deste imóvel." };

  const row = await loadGovernableMedia(context, input.propertyId, input.mediaId);
  if (!row || row.upload_state !== "completed") {
    return { status: "error", message: "Esta mídia ainda não está disponível para acesso." };
  }

  const filename = row.original_filename?.trim() || null;
  const link = await createPropertyMediaAccessLink(context.supabase, {
    tenantId: context.tenantId,
    propertyId: input.propertyId,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    mode: input.mode,
    downloadFilename: filename,
  });
  if (!link) {
    return { status: "error", message: "Não foi possível gerar o acesso temporário." };
  }
  return {
    status: "ok",
    url: link.signedUrl,
    expiresAt: link.expiresAt,
    ttlSeconds: link.ttlSeconds,
    filename,
  };
}
