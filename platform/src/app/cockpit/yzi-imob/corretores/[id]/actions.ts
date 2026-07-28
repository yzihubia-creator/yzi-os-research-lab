"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import type { OperationalActionState } from "@/lib/yzi-imob/operations/action-state";
import { respondToLeadAssignment } from "@/lib/yzi-imob/operations/repository";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function state(
  previous: OperationalActionState,
  status: "saved" | "error",
  message: string,
): OperationalActionState {
  return { status, message, revision: previous.revision + 1 };
}

export async function respondToAssignmentAction(
  previous: OperationalActionState,
  formData: FormData,
): Promise<OperationalActionState> {
  const assignmentId = field(formData, "assignmentId");
  const brokerUserId = field(formData, "brokerUserId");
  const decision = field(formData, "decision");
  if (
    !assignmentId ||
    !brokerUserId ||
    (decision !== "accepted" && decision !== "declined")
  ) {
    return state(previous, "error", "A resposta da atribuicao e invalida.");
  }

  const tenantContext = await getTenantContext();
  if (tenantContext.status === "no_session") redirect("/login");
  if (tenantContext.status !== "tenant_found") {
    return state(previous, "error", "A operacao nao esta disponivel para esta conta.");
  }
  if (tenantContext.userId !== brokerUserId) {
    return state(previous, "error", "Somente o corretor responsavel pode responder.");
  }

  const supabase = await createServerSupabaseClient();
  const result = await respondToLeadAssignment(
    supabase,
    tenantContext.tenant.id,
    tenantContext.userId,
    assignmentId,
    decision,
  );
  if (result.status === "error") {
    return state(
      previous,
      "error",
      result.code === "not_found"
        ? "A atribuicao nao esta mais aguardando sua resposta."
        : "Nao foi possivel registrar a resposta. Nada foi simulado.",
    );
  }

  revalidatePath(`/cockpit/yzi-imob/corretores/${brokerUserId}`);
  revalidatePath(`/cockpit/yzi-imob/clientes/${result.value.leadId}`);
  return state(
    previous,
    "saved",
    decision === "accepted" ? "Atribuicao aceita." : "Atribuicao recusada.",
  );
}
