"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import {
  createCreativeRequestAndGenerate,
  decideCreativeRevision,
} from "@/lib/yzi-imob/creative/repository";
import type {
  CreativeDeliverableType,
  CreativeRevisionDecision,
} from "@/lib/yzi-imob/creative/types";

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function formTexts(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
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

  const formats = formTexts(formData, "formats").filter(
    (format): format is CreativeDeliverableType =>
      format === "carousel" || format === "video_tour",
  );
  const channels = formTexts(formData, "channels");
  const sourceMediaIds = formTexts(formData, "sourceMediaIds");
  const objective = formText(formData, "objective");
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
      sourceMediaIds,
      context: { origin: "property_workspace" },
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
  if (!context || !propertyId || !revisionId) {
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

  revalidatePath(`/cockpit/yzi-imob/imoveis/${propertyId}/creative`);
  redirect(creativePath(propertyId, result.status === "ok" ? "approved" : "error"));
}
