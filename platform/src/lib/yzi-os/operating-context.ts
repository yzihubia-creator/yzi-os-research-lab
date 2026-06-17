import { createServerSupabaseClient } from "@/lib/auth/session";

import {
  asRecord,
  readBoolean,
  readNumber,
  readString,
} from "./rpc-normalize";
import type {
  TenantOperatingContext,
  TenantOperatingContextResult,
} from "./types";

// Leitura REAL do contexto operacional do tenant via RPC SEGURA
// `public.yzi_get_tenant_operating_context(p_tenant_id)`. A função é
// security_definer = false: executa como o operador autenticado e é filtrada
// pelas policies RLS. Usa EXCLUSIVAMENTE a sessão por cookie (anon key) do
// `createServerSupabaseClient` — NUNCA service role, NUNCA SQL raw, NUNCA
// escrita, NUNCA MCP. Falhas viram mensagem saneada (sem vazar backend) e
// ausência de dados nunca é "preenchida" com valores inventados.

/**
 * Obtém o snapshot operacional do tenant atual. Sucesso traz o contexto
 * normalizado (camelCase); qualquer falha vira `error` com mensagem honesta.
 */
export async function getTenantOperatingContext(
  tenantId: string,
): Promise<TenantOperatingContextResult> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.rpc(
      "yzi_get_tenant_operating_context",
      { p_tenant_id: tenantId },
    );

    if (error) {
      return {
        status: "error",
        message: "Não foi possível carregar o contexto operacional do tenant.",
      };
    }

    // A RPC pode retornar o snapshot como objeto único ou como SETOF.
    const snapshot = asRecord(Array.isArray(data) ? data[0] : data);
    if (Object.keys(snapshot).length === 0) {
      return {
        status: "error",
        message:
          "O contexto operacional voltou vazio — nada foi inventado para preencher a tela.",
      };
    }

    const tenant = asRecord(snapshot.tenant);
    const membership = asRecord(snapshot.membership);
    const credits = asRecord(snapshot.credits);
    const counts = asRecord(snapshot.counts);
    const runtime = asRecord(snapshot.runtime);

    const context: TenantOperatingContext = {
      tenant: { name: readString(tenant, "name") },
      membership: {
        role: readString(membership, "role"),
        status: readString(membership, "status"),
      },
      credits: {
        planKey: readString(credits, "plan_key"),
        creditsBalance: readNumber(credits, "credits_balance"),
        mediaBudgetCents: readNumber(credits, "media_budget_cents"),
      },
      counts: {
        activeChatSessions: readNumber(counts, "active_chat_sessions"),
        pendingActionRequests: readNumber(counts, "pending_action_requests"),
        openRecommendations: readNumber(counts, "open_recommendations"),
        newRadarSignals: readNumber(counts, "new_radar_signals"),
      },
      runtime: {
        externalExecutionEnabled: readBoolean(
          runtime,
          "external_execution_enabled",
        ),
        agentResponseEnabled: readBoolean(runtime, "agent_response_enabled"),
        creditConsumptionEnabled: readBoolean(
          runtime,
          "credit_consumption_enabled",
        ),
        authorizationRequiredForSideEffects: readBoolean(
          runtime,
          "authorization_required_for_side_effects",
        ),
      },
    };

    return { status: "loaded", context };
  } catch {
    return {
      status: "error",
      message: "Erro inesperado ao carregar o contexto operacional.",
    };
  }
}
