import { createServerSupabaseClient } from "@/lib/auth/session";

import { asRecord, pickId, pickRow, readString } from "./rpc-normalize";
import type { CreateActionRequestResult } from "./types";

// Preparação CONTROLADA (NÃO execução) de um action request via RPC SEGURA
// `public.yzi_create_action_request`. security_definer = false → roda como o
// operador, sob RLS. Esta fase apenas REGISTRA a intenção como pendente; o
// frontend NÃO dispara execução externa, NÃO consome crédito e NÃO produz
// efeito colateral. A função existe na camada para fechar a fatia, porém AINDA
// NÃO é acionada pela UI do cockpit (a UI só prepara, nunca executa).

type CreateActionRequestInput = {
  tenantId: string;
  actionType: string;
  payload?: Record<string, unknown>;
  sessionId?: string | null;
  recommendationId?: string | null;
  riskLevel?: string | null;
  sideEffects?: string | null;
  evidenceSnapshot?: Record<string, unknown>;
};

/** Prepara (registra como pendente) uma solicitação de ação — sem executá-la. */
export async function createYziActionRequest(
  input: CreateActionRequestInput,
): Promise<CreateActionRequestResult> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.rpc("yzi_create_action_request", {
      p_tenant_id: input.tenantId,
      p_action_type: input.actionType,
      p_payload: input.payload ?? {},
      p_session_id: input.sessionId ?? null,
      p_recommendation_id: input.recommendationId ?? null,
      p_risk_level: input.riskLevel ?? null,
      p_side_effects: input.sideEffects ?? null,
      p_evidence_snapshot: input.evidenceSnapshot ?? {},
    });

    if (error) {
      return {
        status: "error",
        message: "Não foi possível preparar a solicitação de ação.",
      };
    }

    const row = pickRow(data);
    const id = pickId(row, ["id", "action_request_id"]);
    const status =
      typeof row === "object" && row
        ? readString(asRecord(row), "status", "pending")
        : "pending";

    return {
      status: "prepared",
      actionRequest: {
        id,
        actionType: input.actionType,
        riskLevel: input.riskLevel ?? null,
        status,
      },
    };
  } catch {
    return {
      status: "error",
      message: "Erro inesperado ao preparar a solicitação de ação.",
    };
  }
}
