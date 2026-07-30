"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import {
  createCreativeRequestAndGenerate,
  decideCreativeRevision,
  requestCreativeCarouselRevision,
  requestCreativeVideoRevision,
} from "@/lib/yzi-imob/creative/repository";
import { updateCreativeMediaGovernance } from "@/lib/yzi-imob/creative/media/repository";
import type {
  CreativeEnvironmentType,
  CreativeMediaOrientation,
  CreativeMediaStatus,
} from "@/lib/yzi-imob/creative/media/types";
import type { CarouselAdjustment } from "@/lib/yzi-imob/creative/carousel/types";
import type {
  CreativeDeliverableType,
  CreativeRevisionDecision,
} from "@/lib/yzi-imob/creative/types";
import type { VideoTourAdjustment } from "@/lib/yzi-imob/creative/video-tour/types";

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

async function requireCreativeContext(allowedRoles: readonly string[]) {
  const context = await getTenantContext();
  if (
    context.status !== "tenant_found" ||
    !allowedRoles.includes(context.role)
  ) {
    return null;
  }
  return context;
}

function creativePath(
  propertyId: string,
  result: "created" | "approved" | "media_updated" | "error",
): string {
  const params = new URLSearchParams({ result });
  return `/cockpit/yzi-imob/imoveis/${encodeURIComponent(propertyId)}/creative?${params}`;
}

function formChecked(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

export async function updateCreativeMediaGovernanceAction(
  formData: FormData,
): Promise<void> {
  const propertyId = formText(formData, "propertyId");
  const mediaId = formText(formData, "mediaId");
  const context = await requireCreativeContext(["owner", "admin", "operator"]);
  if (!context || !propertyId || !mediaId) {
    redirect(creativePath(propertyId, "error"));
  }
  const supabase = await createServerSupabaseClient();
  const result = await updateCreativeMediaGovernance(supabase, context.tenant.id, {
    propertyId,
    mediaId,
    environmentType: formText(formData, "environmentType") as CreativeEnvironmentType,
    displayOrder: Number(formText(formData, "displayOrder")),
    isPrimary: formChecked(formData, "isPrimary"),
    eligibleForCarousel: formChecked(formData, "eligibleForCarousel"),
    eligibleForVideo: formChecked(formData, "eligibleForVideo"),
    mediaStatus: formText(formData, "mediaStatus") as CreativeMediaStatus,
    orientation: formText(formData, "orientation") as CreativeMediaOrientation,
    humanNote: formText(formData, "humanNote") || null,
    exclusionReason: formText(formData, "exclusionReason") || null,
  });
  revalidatePath(`/cockpit/yzi-imob/imoveis/${propertyId}/creative`);
  redirect(creativePath(propertyId, result.status === "ok" ? "media_updated" : "error"));
}

export async function createCreativeRequestAction(formData: FormData): Promise<void> {
  const propertyId = formText(formData, "propertyId");
  const context = await requireCreativeContext(["owner", "admin", "operator"]);
  if (!context || !propertyId) redirect(creativePath(propertyId, "error"));

  const formatChoice = formText(formData, "format");
  const formats: readonly CreativeDeliverableType[] =
    formatChoice === "video_tour"
      ? ["video_tour"]
      : formatChoice === "complete_package"
        ? ["carousel", "video_tour"]
        : ["carousel"];
  const channels = ["social_feed"];
  const objectiveKey = formText(formData, "objective");
  const objective =
    objectiveKey === "generate_visits"
      ? "Convidar potenciais clientes para uma visita ao imóvel"
      : "Apresentar os principais diferenciais do imóvel";
  const idempotencyKey = formText(formData, "idempotencyKey");

  const supabase = await createServerSupabaseClient();
  const result = await createCreativeRequestAndGenerate(
    supabase,
    context.tenant.id,
    {
      propertyId,
      objective,
      formats,
      intendedChannels: channels,
      context: { origin: "property_workspace", objective_key: objectiveKey },
      idempotencyKey,
    },
  );

  revalidatePath(`/cockpit/yzi-imob/imoveis/${propertyId}/creative`);
  redirect(creativePath(propertyId, result.status === "ok" ? "created" : "error"));
}

export async function decideCreativeRevisionAction(formData: FormData): Promise<void> {
  const propertyId = formText(formData, "propertyId");
  const revisionId = formText(formData, "revisionId");
  const decision = formText(formData, "decision") as CreativeRevisionDecision;
  const observation = formText(formData, "observation");
  const context = await requireCreativeContext(["owner", "admin"]);
  if (
    !context ||
    !propertyId ||
    !revisionId ||
    !["approved", "changes_requested", "rejected"].includes(decision)
  ) {
    redirect(creativePath(propertyId, "error"));
  }

  const supabase = await createServerSupabaseClient();
  const result = await decideCreativeRevision(
    supabase,
    context.tenant.id,
    propertyId,
    revisionId,
    decision,
    observation || null,
  );

  if (result.status === "ok" && decision === "changes_requested") {
    const deliverableType = formText(formData, "deliverableType");
    const kind = formText(formData, "adjustmentKind");
    const replacementMediaId = formText(formData, "replacementMediaId");
    const idempotencyKey = formText(formData, "idempotencyKey");
    const note = observation || undefined;
    if (deliverableType === "video_tour") {
      const scenePosition = Number(formText(formData, "scenePosition"));
      const duration = Number(formText(formData, "duration"));
      let adjustment: VideoTourAdjustment | null = null;
      if (kind === "swap_scene_media" && replacementMediaId) {
        adjustment = { kind, scenePosition, replacementMediaId };
      } else if (kind === "remove_overlay" || kind === "slow_motion") {
        adjustment = { kind, scenePosition };
      } else if (kind === "reduce_duration" && [15, 20, 30].includes(duration)) {
        adjustment = { kind, duration: duration as 15 | 20 | 30 };
      } else if (kind === "correct_cta" && note) {
        adjustment = { kind, cta: note };
      }
      if (!adjustment) redirect(creativePath(propertyId, "error"));
      const revisionResult = await requestCreativeVideoRevision(
        supabase,
        context.tenant.id,
        propertyId,
        revisionId,
        adjustment,
        idempotencyKey,
      );
      revalidatePath(`/cockpit/yzi-imob/imoveis/${propertyId}/creative`);
      redirect(
        creativePath(propertyId, revisionResult.status === "ok" ? "created" : "error"),
      );
    }
    const cardPosition = Number(formText(formData, "cardPosition"));
    let adjustment: CarouselAdjustment | null = null;
    if (kind === "swap_media" || kind === "use_approved_media") {
      adjustment = replacementMediaId
        ? { kind, cardPosition, replacementMediaId, note }
        : null;
    } else if (kind === "shorten_headline" || kind === "remove_fact" || kind === "correct_fact") {
      adjustment = { kind, cardPosition, note };
    } else if (kind === "change_cta" && cardPosition === 7 && note) {
      adjustment = { kind, cardPosition: 7, note };
    }
    if (!adjustment) redirect(creativePath(propertyId, "error"));
    const revisionResult = await requestCreativeCarouselRevision(
      supabase,
      context.tenant.id,
      propertyId,
      revisionId,
      adjustment,
      idempotencyKey,
    );
    revalidatePath(`/cockpit/yzi-imob/imoveis/${propertyId}/creative`);
    redirect(
      creativePath(propertyId, revisionResult.status === "ok" ? "created" : "error"),
    );
  }

  revalidatePath(`/cockpit/yzi-imob/imoveis/${propertyId}/creative`);
  redirect(creativePath(propertyId, result.status === "ok" ? "approved" : "error"));
}
