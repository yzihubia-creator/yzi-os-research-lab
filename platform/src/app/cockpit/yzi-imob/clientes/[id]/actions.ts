"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import {
  createAppointment,
} from "@/lib/yzi-imob/agenda/repository";
import type { OperationalActionState } from "@/lib/yzi-imob/operations/action-state";
import {
  assignLeadToBroker,
  getLeadOperationsWorkspace,
  getLeadOperationalPacket,
  listEligibleBrokersForTenant,
  markFollowUpTaskStatus,
} from "@/lib/yzi-imob/operations/repository";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function nextState(
  previous: OperationalActionState,
  status: "saved" | "error",
  message: string,
): OperationalActionState {
  return { status, message, revision: previous.revision + 1 };
}

async function getActionContext(): Promise<
  | { status: "ok"; tenantId: string; userId: string; role: string }
  | { status: "blocked"; message: string }
> {
  const tenantContext = await getTenantContext();
  if (tenantContext.status === "no_session") redirect("/login");
  if (tenantContext.status !== "tenant_found") {
    return { status: "blocked", message: "A operacao nao esta disponivel para esta conta." };
  }
  if (!["owner", "admin", "operator"].includes(tenantContext.role)) {
    return { status: "blocked", message: "Seu papel nao permite executar esta acao." };
  }
  return {
    status: "ok",
    tenantId: tenantContext.tenant.id,
    userId: tenantContext.userId,
    role: tenantContext.role,
  };
}

function revalidateLead(leadId: string) {
  revalidatePath(`/cockpit/yzi-imob/clientes/${leadId}`);
  revalidatePath("/cockpit/yzi-imob/corretores");
}

export async function assignLeadAction(
  previous: OperationalActionState,
  formData: FormData,
): Promise<OperationalActionState> {
  const leadId = field(formData, "leadId");
  const brokerUserId = field(formData, "brokerUserId");
  if (!leadId || !brokerUserId) {
    return nextState(previous, "error", "Selecione um corretor elegivel.");
  }

  const context = await getActionContext();
  if (context.status === "blocked") return nextState(previous, "error", context.message);

  const supabase = await createServerSupabaseClient();
  const eligibleResult = await listEligibleBrokersForTenant(
    supabase,
    context.tenantId,
    context.userId,
  );
  if (
    eligibleResult.status === "error" ||
    !eligibleResult.value.some((broker) => broker.userId === brokerUserId)
  ) {
    return nextState(
      previous,
      "error",
      "O corretor nao esta elegivel para receber novos leads.",
    );
  }

  const result = await assignLeadToBroker(
    supabase,
    context.tenantId,
    context.userId,
    {
      leadId,
      brokerUserId,
      source: "lead_workspace",
    },
  );
  if (result.status === "error") {
    return nextState(previous, "error", "Nao foi possivel atribuir o lead.");
  }

  revalidateLead(leadId);
  revalidatePath(`/cockpit/yzi-imob/corretores/${brokerUserId}`);
  return nextState(previous, "saved", "Lead atribuido ao corretor.");
}

export async function createLeadVisitAction(
  previous: OperationalActionState,
  formData: FormData,
): Promise<OperationalActionState> {
  const leadId = field(formData, "leadId");
  const brokerUserId = field(formData, "brokerUserId");
  const propertyId = field(formData, "propertyId");
  const startsAtValue = field(formData, "startsAt");
  const startsAt = new Date(startsAtValue);
  if (!leadId || !brokerUserId || !Number.isFinite(startsAt.getTime())) {
    return nextState(previous, "error", "Preencha corretor e horario validos.");
  }

  const context = await getActionContext();
  if (context.status === "blocked") return nextState(previous, "error", context.message);
  const supabase = await createServerSupabaseClient();
  const [packetResult, eligibleResult] = await Promise.all([
    getLeadOperationalPacket(supabase, context.tenantId, leadId),
    listEligibleBrokersForTenant(supabase, context.tenantId, context.userId),
  ]);
  if (packetResult.status === "error") {
    return nextState(previous, "error", "O lead nao existe neste tenant.");
  }
  if (
    eligibleResult.status === "error" ||
    !eligibleResult.value.some((broker) => broker.userId === brokerUserId)
  ) {
    return nextState(previous, "error", "O corretor nao esta elegivel para a visita.");
  }

  const result = await createAppointment(supabase, context.tenantId, {
    leadId,
    propertyId: propertyId || null,
    brokerUserId,
    title: `Visita - ${packetResult.value.leadName ?? "Lead"}`,
    startsAt: startsAt.toISOString(),
    status: "scheduled",
    confirmationStatus: "pending",
    source: "lead_workspace",
  });
  if (result.status === "error") {
    return nextState(previous, "error", "Nao foi possivel criar a visita.");
  }

  revalidateLead(leadId);
  revalidatePath("/cockpit/yzi-imob/agenda");
  revalidatePath(`/cockpit/yzi-imob/corretores/${brokerUserId}`);
  return nextState(previous, "saved", "Visita criada na Agenda.");
}

export async function updateFollowUpAction(
  previous: OperationalActionState,
  formData: FormData,
): Promise<OperationalActionState> {
  const leadId = field(formData, "leadId");
  const taskId = field(formData, "taskId");
  const status = field(formData, "status");
  if (!leadId || !taskId || (status !== "completed" && status !== "cancelled")) {
    return nextState(previous, "error", "A tarefa de follow-up e invalida.");
  }

  const context = await getActionContext();
  if (context.status === "blocked") return nextState(previous, "error", context.message);
  const supabase = await createServerSupabaseClient();
  const workspaceResult = await getLeadOperationsWorkspace(
    supabase,
    context.tenantId,
    leadId,
    context.userId,
  );
  if (
    workspaceResult.status === "error" ||
    !workspaceResult.value.followUps.some((task) => task.id === taskId)
  ) {
    return nextState(previous, "error", "O follow-up nao pertence a este lead.");
  }
  const result = await markFollowUpTaskStatus(
    supabase,
    context.tenantId,
    taskId,
    status,
  );
  if (result.status === "error") {
    return nextState(previous, "error", "Nao foi possivel atualizar o follow-up.");
  }
  revalidateLead(leadId);
  return nextState(
    previous,
    "saved",
    status === "completed" ? "Follow-up resolvido." : "Follow-up cancelado.",
  );
}
