"use server";

import {
  createYziChatSession,
  createYziUserChatMessage,
} from "./chat";
import type {
  CreateChatMessageResult,
  CreateChatSessionResult,
} from "./types";

// Server Actions da camada YZI OS — ponte fina entre o Client Component do chat
// e as RPCs seguras. Por serem Server Actions ("use server"), executam no
// servidor com a sessão por cookie do operador (anon key, RLS) — NUNCA service
// role, SQL raw, MCP, API externa ou automação. Validação/limite real de acesso
// vive na RPC (security_definer = false) + RLS; aqui apenas saneamos a entrada.

/**
 * Inicia uma sessão de conversa (mode "decide"). O título é opcional; quando
 * vazio, usa um rótulo neutro. NÃO envia mensagem nem gera resposta da YZI.
 */
export async function startYziChatSessionAction(input: {
  tenantId: string;
  title?: string;
}): Promise<CreateChatSessionResult> {
  const title = input.title?.trim() || "Conversa com a YZI";
  return createYziChatSession({
    tenantId: input.tenantId,
    title,
    mode: "decide",
    contextScope: {},
  });
}

/**
 * Registra uma mensagem do usuário numa sessão existente. Recusa conteúdo vazio
 * com mensagem honesta. NÃO gera resposta da YZI, NÃO executa nada externo.
 */
export async function sendYziUserChatMessageAction(input: {
  tenantId: string;
  sessionId: string;
  content: string;
}): Promise<CreateChatMessageResult> {
  const content = input.content?.trim() ?? "";
  if (!content) {
    return { status: "error", message: "Escreva uma mensagem antes de enviar." };
  }
  if (!input.sessionId) {
    return {
      status: "error",
      message: "Inicie uma conversa antes de enviar a mensagem.",
    };
  }

  return createYziUserChatMessage({
    tenantId: input.tenantId,
    sessionId: input.sessionId,
    content,
  });
}
