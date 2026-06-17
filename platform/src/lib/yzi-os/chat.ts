import { createServerSupabaseClient } from "@/lib/auth/session";

import { pickId, pickRow } from "./rpc-normalize";
import type {
  CreateChatMessageResult,
  CreateChatSessionResult,
} from "./types";

// Escrita CONTROLADA via RPCs SEGURAS de chat
// (`public.yzi_create_chat_session`, `public.yzi_create_user_chat_message`).
// Ambas são security_definer = false: rodam como o operador autenticado, sob
// RLS, e a própria RPC valida o vínculo via `yzi_is_active_tenant_member`.
// Usa EXCLUSIVAMENTE a sessão por cookie (anon key) — NUNCA service role, SQL
// raw, MCP, API externa ou automação. NENHUMA resposta da YZI é gerada aqui:
// apenas a mensagem do usuário é registrada. Sem consumo de crédito, sem efeito
// externo. Falhas viram mensagem saneada.

type CreateChatSessionInput = {
  tenantId: string;
  title: string;
  mode: string;
  contextScope?: Record<string, unknown>;
};

/** Cria uma sessão de conversa para o tenant (ex.: mode = "decide"). */
export async function createYziChatSession(
  input: CreateChatSessionInput,
): Promise<CreateChatSessionResult> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.rpc("yzi_create_chat_session", {
      p_tenant_id: input.tenantId,
      p_title: input.title,
      p_mode: input.mode,
      p_context_scope: input.contextScope ?? {},
    });

    if (error) {
      return {
        status: "error",
        message: "Não foi possível iniciar a sessão de conversa.",
      };
    }

    const id = pickId(pickRow(data), ["id", "session_id"]);
    if (!id) {
      return {
        status: "error",
        message:
          "A sessão foi processada, mas não retornou um identificador utilizável.",
      };
    }

    return {
      status: "created",
      session: { id, title: input.title, mode: input.mode },
    };
  } catch {
    return {
      status: "error",
      message: "Erro inesperado ao iniciar a sessão de conversa.",
    };
  }
}

type CreateChatMessageInput = {
  tenantId: string;
  sessionId: string;
  content: string;
  structuredPayload?: Record<string, unknown>;
};

/** Registra uma mensagem do usuário na sessão. NÃO gera resposta da YZI. */
export async function createYziUserChatMessage(
  input: CreateChatMessageInput,
): Promise<CreateChatMessageResult> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.rpc(
      "yzi_create_user_chat_message",
      {
        p_tenant_id: input.tenantId,
        p_session_id: input.sessionId,
        p_content: input.content,
        p_structured_payload: input.structuredPayload ?? {},
      },
    );

    if (error) {
      return {
        status: "error",
        message: "Não foi possível registrar a mensagem.",
      };
    }

    const row = pickRow(data);
    const id = pickId(row, ["id", "message_id"]);
    const createdAt =
      row && typeof row === "object" && typeof row.created_at === "string"
        ? row.created_at
        : null;

    return {
      status: "created",
      // O conteúdo exibido é o próprio texto persistido do usuário — nada é
      // sintetizado em nome da YZI.
      message: { id, content: input.content, createdAt },
    };
  } catch {
    return {
      status: "error",
      message: "Erro inesperado ao registrar a mensagem.",
    };
  }
}
