"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import {
  decidePropertyPublicationRevision,
  requestPropertyPublicationReview,
  retryPropertyPublication,
  setPropertyPublicationAvailability,
  simulatePropertyPublicationSync,
} from "@/lib/yzi-imob/publication/repository";
import type { PropertyPublicationReviewDecision } from "@/lib/yzi-imob/publication/types";
import { syncErrorLabel } from "@/lib/yzi-imob/publication/labels";

export type PropertyPublicationActionState = {
  status: "idle" | "ok" | "error" | "forbidden";
  message?: string;
  blockers?: readonly string[];
};

export const INITIAL_PROPERTY_PUBLICATION_ACTION_STATE: PropertyPublicationActionState = {
  status: "idle",
};

function value(formData: FormData, name: string): string {
  const item = formData.get(name);
  return typeof item === "string" ? item.trim() : "";
}

async function actionContext(
  allowedRoles: readonly string[],
): Promise<
  | { status: "ok"; tenantId: string }
  | { status: "error"; state: PropertyPublicationActionState }
> {
  const context = await getTenantContext();
  if (context.status !== "tenant_found") {
    return {
      status: "error",
      state: {
        status: "forbidden",
        message:
          context.status === "no_session"
            ? "Entre novamente para continuar."
            : "Não foi possível validar sua operação.",
      },
    };
  }
  if (!allowedRoles.includes(context.role)) {
    return {
      status: "error",
      state: {
        status: "forbidden",
        message: "Seu papel não permite esta ação de publicação.",
      },
    };
  }
  return { status: "ok", tenantId: context.tenant.id };
}

function revalidatePublication(propertyId: string) {
  revalidatePath(`/cockpit/yzi-imob/imoveis/${propertyId}`);
  revalidatePath("/cockpit/yzi-imob/site");
}

export async function requestPublicationReviewAction(
  _previous: PropertyPublicationActionState,
  formData: FormData,
): Promise<PropertyPublicationActionState> {
  const propertyId = value(formData, "propertyId");
  const publicSlug = value(formData, "publicSlug");
  const context = await actionContext(["owner", "admin", "operator"]);
  if (context.status === "error") return context.state;

  const supabase = await createServerSupabaseClient();
  const result = await requestPropertyPublicationReview(
    supabase,
    context.tenantId,
    propertyId,
    publicSlug || undefined,
  );
  if (result.status === "error") {
    return {
      status: "error",
      message:
        result.code === "not_ready"
          ? "O imóvel ainda possui bloqueios de prontidão."
          : "Não foi possível solicitar a revisão agora.",
      blockers: result.blockers,
    };
  }

  revalidatePublication(propertyId);
  return {
    status: "ok",
    message: `Revisão pública ${result.value.revisionNumber} enviada para aprovação.`,
  };
}

export async function decidePublicationReviewAction(
  _previous: PropertyPublicationActionState,
  formData: FormData,
): Promise<PropertyPublicationActionState> {
  const propertyId = value(formData, "propertyId");
  const revisionId = value(formData, "revisionId");
  const decision = value(formData, "decision") as PropertyPublicationReviewDecision;
  const observation = value(formData, "observation");
  const context = await actionContext(["owner", "admin"]);
  if (context.status === "error") return context.state;

  if (!["approved", "rejected", "changes_required"].includes(decision)) {
    return { status: "error", message: "Decisão de revisão inválida." };
  }
  if (decision !== "approved" && !observation) {
    return {
      status: "error",
      message: "Informe uma observação para reprovar ou solicitar alterações.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const result = await decidePropertyPublicationRevision(
    supabase,
    revisionId,
    decision,
    observation || null,
  );
  if (result.status === "error") {
    return { status: "error", message: "Não foi possível registrar a decisão." };
  }

  revalidatePublication(propertyId);
  return {
    status: "ok",
    message:
      decision === "approved"
        ? "Revisão aprovada para publicação."
        : decision === "rejected"
          ? "Revisão reprovada com observação."
          : "Alterações solicitadas.",
  };
}

export async function synchronizePublicationAction(
  _previous: PropertyPublicationActionState,
  formData: FormData,
): Promise<PropertyPublicationActionState> {
  const propertyId = value(formData, "propertyId");
  const operation = value(formData, "operation") as "publish" | "update";
  const idempotencyKey = value(formData, "idempotencyKey");
  const context = await actionContext(["owner", "admin", "operator"]);
  if (context.status === "error") return context.state;
  if (!["publish", "update"].includes(operation) || !idempotencyKey) {
    return { status: "error", message: "Operação de sincronização inválida." };
  }

  const supabase = await createServerSupabaseClient();
  const result = await simulatePropertyPublicationSync(
    supabase,
    context.tenantId,
    propertyId,
    operation,
    idempotencyKey,
  );
  if (result.status === "error") {
    return {
      status: "error",
      message: "A sincronização simulada não pôde ser concluída.",
    };
  }

  revalidatePublication(propertyId);
  return result.value.status === "synced"
    ? {
        status: "ok",
        message: `Sincronização simulada concluída na versão ${result.value.publicationVersion}.`,
      }
    : {
        status: "error",
        message: `Falha simulada registrada: ${syncErrorLabel(result.value.errorCode)}.`,
      };
}

export async function changePublicationAvailabilityAction(
  _previous: PropertyPublicationActionState,
  formData: FormData,
): Promise<PropertyPublicationActionState> {
  const propertyId = value(formData, "propertyId");
  const action = value(formData, "availabilityAction") as "pause" | "unpublish";
  const context = await actionContext(["owner", "admin", "operator"]);
  if (context.status === "error") return context.state;
  if (!["pause", "unpublish"].includes(action)) {
    return { status: "error", message: "Ação de disponibilidade inválida." };
  }

  const supabase = await createServerSupabaseClient();
  const result = await setPropertyPublicationAvailability(
    supabase,
    propertyId,
    action,
  );
  if (result.status === "error") {
    return { status: "error", message: "Não foi possível alterar a publicação." };
  }

  revalidatePublication(propertyId);
  return {
    status: "ok",
    message: action === "pause" ? "Publicação pausada." : "Imóvel despublicado.",
  };
}

export async function retryPublicationAction(
  _previous: PropertyPublicationActionState,
  formData: FormData,
): Promise<PropertyPublicationActionState> {
  const propertyId = value(formData, "propertyId");
  const jobId = value(formData, "jobId");
  const retryIdempotencyKey = value(formData, "retryIdempotencyKey");
  const context = await actionContext(["owner", "admin", "operator"]);
  if (context.status === "error") return context.state;

  const supabase = await createServerSupabaseClient();
  const result = await retryPropertyPublication(
    supabase,
    jobId,
    retryIdempotencyKey,
  );
  if (result.status === "error") {
    return { status: "error", message: "Este job não está elegível para retry." };
  }

  revalidatePublication(propertyId);
  return {
    status: "ok",
    message: result.value.reused
      ? "Retry idempotente já registrado."
      : "Retry elegível reenfileirado sem criar nova versão.",
  };
}
