"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { loadMetricoolMarketingWorkspace } from "@/lib/yzi-imob/metricool/repository";

export type SocialPublicationActionResult =
  | { status: "ok"; message: string }
  | {
      status: "error";
      code:
        | "access_denied"
        | "invalid_input"
        | "configuration_required"
        | "approved_revision_required"
        | "media_required"
        | "operation_failed";
    };

type SocialPublicationRpcClient = {
  rpc(
    fn:
      | "enqueue_yzi_imob_metricool_publication"
      | "cancel_yzi_imob_metricool_publication"
      | "retry_yzi_imob_metricool_publication",
    args: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { code?: string } | null }>;
};

export async function enqueueMetricoolPublicationAction(input: {
  revisionId: string;
  targetKeys: readonly string[];
  scheduledAt: string;
}): Promise<SocialPublicationActionResult> {
  const tenantContext = await getTenantContext();
  if (tenantContext.status !== "tenant_found") {
    return { status: "error", code: "access_denied" };
  }
  if (!isUuid(input.revisionId) || !isValidSchedule(input.scheduledAt)) {
    return { status: "error", code: "invalid_input" };
  }

  const supabase = await createServerSupabaseClient();
  const workspaceResult = await loadMetricoolMarketingWorkspace(
    supabase,
    tenantContext.tenant.id,
  );
  if (workspaceResult.status === "error") {
    return { status: "error", code: "operation_failed" };
  }
  const workspace = workspaceResult.value;
  if (
    !workspace.connection.id ||
    !["active", "connected"].includes(workspace.connection.status)
  ) {
    return { status: "error", code: "configuration_required" };
  }
  const candidate = workspace.candidates.find(
    (item) => item.revisionId === input.revisionId,
  );
  if (!candidate || candidate.revisionStatus !== "approved") {
    return { status: "error", code: "approved_revision_required" };
  }
  if (!candidate.mediaIds.length) {
    return { status: "error", code: "media_required" };
  }

  const selectedTargets = Array.from(new Set(input.targetKeys)).flatMap((key) => {
    const separator = key.indexOf(":");
    const network = key.slice(0, separator);
    const profileId = key.slice(separator + 1);
    if (network !== "instagram" && network !== "facebook") return [];
    const profile = workspace.connection.profiles.find(
      (item) => item.network === network && item.id === profileId,
    );
    return profile ? [{ network, profileId }] : [];
  });
  if (!selectedTargets.length || selectedTargets.length > 2) {
    return { status: "error", code: "invalid_input" };
  }

  const scheduledAt = new Date(input.scheduledAt).toISOString();
  const idempotencyKey = createHash("sha256")
    .update(JSON.stringify({
      tenantId: tenantContext.tenant.id,
      revisionId: candidate.revisionId,
      targets: selectedTargets,
      scheduledAt,
    }))
    .digest("hex");
  const rpcClient = supabase as unknown as SocialPublicationRpcClient;
  const { error } = await rpcClient.rpc("enqueue_yzi_imob_metricool_publication", {
    p_revision_id: candidate.revisionId,
    p_connection_id: workspace.connection.id,
    p_target_networks: selectedTargets.map((target) => target.network),
    p_target_profile_ids: selectedTargets.map((target) => target.profileId),
    p_format: candidate.mediaIds.length === 1 ? "single_image" : "carousel",
    p_caption: candidate.previewCaption,
    p_media_ids: candidate.mediaIds,
    p_scheduled_at: scheduledAt,
    p_idempotency_key: idempotencyKey,
  });
  if (error) return { status: "error", code: "operation_failed" };

  revalidateMetricoolSurfaces();
  return { status: "ok", message: "Publicação agendada sem envio imediato à rede social." };
}

export async function cancelMetricoolPublicationAction(
  socialPublicationId: string,
): Promise<SocialPublicationActionResult> {
  return runPublicationCommand("cancel_yzi_imob_metricool_publication", {
    p_social_publication_id: socialPublicationId,
  }, "Cancelamento enfileirado.");
}

export async function retryMetricoolPublicationAction(
  socialPublicationId: string,
): Promise<SocialPublicationActionResult> {
  if (!isUuid(socialPublicationId)) return { status: "error", code: "invalid_input" };
  const tenantContext = await getTenantContext();
  if (tenantContext.status !== "tenant_found") {
    return { status: "error", code: "access_denied" };
  }
  const supabase = await createServerSupabaseClient();
  const workspaceResult = await loadMetricoolMarketingWorkspace(
    supabase,
    tenantContext.tenant.id,
  );
  const publication = workspaceResult.status === "ok"
    ? workspaceResult.value.publications.find((item) => item.id === socialPublicationId)
    : null;
  if (!publication || publication.status !== "failed") {
    return { status: "error", code: "invalid_input" };
  }
  const retryKey = createHash("sha256")
    .update(`retry:${socialPublicationId}:${publication.updatedAt}`)
    .digest("hex");
  return runPublicationCommand("retry_yzi_imob_metricool_publication", {
    p_social_publication_id: socialPublicationId,
    p_retry_idempotency_key: retryKey,
  }, "Retry governado enfileirado.");
}

async function runPublicationCommand(
  fn:
    | "cancel_yzi_imob_metricool_publication"
    | "retry_yzi_imob_metricool_publication",
  args: Record<string, unknown>,
  message: string,
): Promise<SocialPublicationActionResult> {
  const socialPublicationId = args.p_social_publication_id;
  if (typeof socialPublicationId !== "string" || !isUuid(socialPublicationId)) {
    return { status: "error", code: "invalid_input" };
  }
  const tenantContext = await getTenantContext();
  if (tenantContext.status !== "tenant_found") {
    return { status: "error", code: "access_denied" };
  }
  const supabase = await createServerSupabaseClient();
  const rpcClient = supabase as unknown as SocialPublicationRpcClient;
  const { error } = await rpcClient.rpc(fn, args);
  if (error) return { status: "error", code: "operation_failed" };
  revalidateMetricoolSurfaces();
  return { status: "ok", message };
}

function isValidSchedule(value: string): boolean {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp >= Date.now() + 60_000;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function revalidateMetricoolSurfaces(): void {
  revalidatePath("/cockpit/yzi-imob/marketing/publicacoes");
  revalidatePath("/cockpit/yzi-imob/conexoes");
  revalidatePath("/cockpit/yzi-imob/resultados");
  revalidatePath("/cockpit/yzi-imob/radar");
}
