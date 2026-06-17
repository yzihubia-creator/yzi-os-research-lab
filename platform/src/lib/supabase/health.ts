import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "./server";

// Health check mínimo de conectividade/configuração contra o Supabase real
// (Lane 4, Step 3, gate L4-G1). Usa exclusivamente o client server existente
// (anon/publishable key) — NUNCA service role. Valida que o client é
// configurável e que a camada de auth responde, SEM consultar nenhuma tabela
// protegida: o gate L4-G1 proíbe consultar `tenants` e `tenant_memberships`.
// Probe via `auth.getSession()`: ausência de sessão é o estado esperado
// (sem auth flow nesta lane), não uma falha. Nenhum dado real ou tabela RLS
// é tocado. Execução real e evidence ficam para o Step 7/8.

/** Resultado tipado do health check. Nunca contém URL, key, env ou stack. */
export type SupabaseHealthResult = {
  /** true quando o client está configurado e a camada de auth respondeu. */
  ok: boolean;
  /** Código de status estável e legível. */
  status: string;
  /** Mensagem humana saneada (sem secrets). */
  message?: string;
  /** Detalhes seguros — apenas flags não sensíveis. */
  details?: unknown;
};

/**
 * Verifica configuração e alcance básico do Supabase usando apenas a anon key.
 *
 * Não consulta nenhuma tabela (sem `tenants`/`tenant_memberships`, sem RLS).
 * A ausência de sessão é tratada como estado esperado, não como falha.
 *
 * @param client Client Supabase opcional; por padrão usa o server client
 *   existente (`createSupabaseServerClient`). Nenhum client paralelo é criado.
 * @returns {@link SupabaseHealthResult} tipado e sem secrets.
 */
export async function checkSupabaseHealth(
  client?: SupabaseClient,
): Promise<SupabaseHealthResult> {
  try {
    // Instanciado dentro do try para que falha de configuração (env ausente)
    // seja sanitizada, nunca propagada com nomes/valores de env.
    const supabase = client ?? (await createSupabaseServerClient());

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      // A camada de auth respondeu com erro lógico (ex.: sem sessão). O client
      // está configurado e alcançável; tratamos como estado esperado.
      return {
        ok: true,
        status: "reachable_no_session",
        message: "Supabase configurado; sem sessão ativa (estado esperado).",
        details: { hasSession: false },
      };
    }

    const hasSession = Boolean(data?.session);
    return {
      ok: true,
      status: hasSession ? "reachable_with_session" : "reachable_no_session",
      message: "Supabase configurado e alcançável.",
      details: { hasSession },
    };
  } catch {
    // Apenas falha de configuração/inicialização cai aqui. Mensagem fixa e
    // saneada — nunca repassa URL, key, env ou stack.
    return {
      ok: false,
      status: "config_error",
      message: "Health check falhou: client Supabase não pôde ser inicializado.",
    };
  }
}
