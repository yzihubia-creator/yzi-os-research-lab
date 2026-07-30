"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import {
  createCreativeRequestAndGenerate,
  decideCreativeRevision,
  requestCreativeCarouselRevision,
} from "@/lib/yzi-imob/creative/repository";
import type { CarouselAdjustment } from "@/lib/yzi-imob/creative/carousel/types";
import type {
  CreativeDeliverableType,
  CreativeRevisionDecision,
} from "@/lib/yzi-imob/creative/types";

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

function creativePath(propertyId: string, result: "created" | "approved" | "error"): string {
  const params = new URLSearchParams({ result });
  return `/cockpit/yzi-imob/imoveis/${encodeURIComponent(propertyId)}/creative?${params}`;
}

export async function createCreativeRequestAction(formData: FormData): Promise<void> {
  const propertyId = formText(formData, "propertyId");
  const context = await requireCreativeContext(["owner", "admin", "operator"]);
  if (!context || !propertyId) redirect(creativePath(propertyId, "error"));

  const formats: readonly CreativeDeliverableType[] = ["carousel"];
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
    const kind = formText(formData, "adjustmentKind");
    const cardPosition = Number(formText(formData, "cardPosition"));
    const replacementMediaId = formText(formData, "replacementMediaId");
    const idempotencyKey = formText(formData, "idempotencyKey");
    const note = observation || undefined;
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
