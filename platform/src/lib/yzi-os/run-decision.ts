import { createServerSupabaseClient } from "@/lib/auth/session";

// YZI OS — RPC de decisão do checkpoint (Unidade 3, Persisted Run Slice).
//
// Wrapper fino sobre `public.yzi_decide_action_request` — `security_definer
// = false`, roda como o operador autenticado, sob RLS. Esta função REGISTRA
// a decisão apenas; o avanço do workflow (selar artefato ou criar novo
// attempt) é responsabilidade do runtime/camada de persistência
// (`lib/yzi-os/runs.ts`), chamado em seguida pela Server Action — nunca pela
// própria RPC de decisão. Decisão duplicada falha honestamente (a RPC
// recusa quando o item não está mais `pending_review`). Silêncio nunca
// aprova: sem chamada explícita, o status permanece `pending_review`.

export type DecideActionRequestInput = {
  actionRequestId: string;
  decision: "approved" | "rejected";
  /** Obrigatório quando `decision="rejected"`; deve ser `null` quando aprovado. */
  decisionReason: "adjust" | "rework" | null;
  /** Nota curta opcional do gestor (Approval Queue Spec §7/§8: "razão curta"). */
  decisionNote: string | null;
};

export type DecideActionRequestResult =
  | { status: "decided" }
  | { status: "error"; message: string };

export async function decideActionRequest(
  input: DecideActionRequestInput,
): Promise<DecideActionRequestResult> {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.rpc("yzi_decide_action_request", {
      p_action_request_id: input.actionRequestId,
      p_decision: input.decision,
      p_decision_reason: input.decisionReason,
      p_decision_note: input.decisionNote,
    });

    if (error) {
      // Cobre, entre outros, o caso honesto de decisão duplicada
      // (`already_decided`) e falta de permissão (`approver_not_authorized`).
      return {
        status: "error",
        message:
          "Não foi possível registrar a decisão — ela já pode ter sido decidida, ou você não está autorizado.",
      };
    }

    return { status: "decided" };
  } catch {
    return { status: "error", message: "Erro inesperado ao registrar a decisão." };
  }
}
