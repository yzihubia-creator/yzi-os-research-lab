import { createServerSupabaseClient } from "@/lib/auth/session";

import { mapConversationRow, mapMessageRow } from "./mappers";
import type {
  Conversation,
  ConversationErrorCode,
  ConversationListResult,
  ConversationResult,
  Message,
  MessageHistoryResult,
  MessageResult,
} from "./types";

// Conversation Runtime — fundação server-side tenant-scoped para
// yzi_imob_conversations / yzi_imob_messages / yzi_imob_leads.
//
// Nenhum service role, nenhum SQL raw: todo acesso passa pelo client
// server-side com a sessão do operador (RLS ativa, `auth.uid()` real —
// mesmo padrão de `lib/yzi-os/runs.ts`, só leitura desse arquivo). RLS já
// garante `tenant_memberships.status = 'active'` em toda operação; este
// módulo AINDA assim filtra `.eq("tenant_id", ...)` explicitamente em toda
// query, como segunda camada (defesa em profundidade, não confiança cega em
// uma única camada).
//
// Sem mock, sem fallback: leitura real que falha retorna erro honesto
// nomeado (`ConversationErrorCode`), nunca dado inventado.

const DEFAULT_HISTORY_LIMIT = 30;
const MAX_HISTORY_LIMIT = 100;

function clampLimit(limit: number | undefined): number {
  if (!limit || !Number.isFinite(limit) || limit <= 0) return DEFAULT_HISTORY_LIMIT;
  return Math.min(Math.floor(limit), MAX_HISTORY_LIMIT);
}

/**
 * Confirma que o lead existe E pertence ao tenant informado antes de abrir
 * conversation — nunca confia num `leadId` solto vindo do cliente.
 */
async function assertLeadBelongsToTenant(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  tenantId: string,
  leadId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("yzi_imob_leads")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("id", leadId)
    .maybeSingle();
  return !error && Boolean(data);
}

/**
 * Abre uma conversation nova para um lead JÁ existente no tenant. Não
 * reaproveita conversation aberta anterior — decisão de "retomar vs. abrir
 * nova" é de produto, não desta fundação; o chamador decide via
 * `listConversationsForLead` antes de chamar isto, se quiser evitar duplicar.
 */
export async function openConversationForLead(input: {
  tenantId: string;
  leadId: string;
  channel: string;
  status?: string;
}): Promise<ConversationResult> {
  const tenantId = input.tenantId?.trim();
  const leadId = input.leadId?.trim();
  const channel = input.channel?.trim();
  const status = (input.status ?? "open").trim();

  if (!tenantId || !leadId || !channel || !status) {
    return { status: "error", code: "invalid_input", message: "tenantId, leadId, channel e status são obrigatórios." };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const leadExists = await assertLeadBelongsToTenant(supabase, tenantId, leadId);
    if (!leadExists) {
      return { status: "error", code: "lead_not_found", message: "Lead não encontrado neste tenant." };
    }

    const { data, error } = await supabase
      .from("yzi_imob_conversations")
      .insert({ tenant_id: tenantId, lead_id: leadId, channel, status })
      .select("*")
      .single();

    if (error || !data) {
      return { status: "error", code: "write_failed", message: "Não foi possível abrir a conversation." };
    }

    return { status: "ok", conversation: mapConversationRow(data) };
  } catch {
    return { status: "error", code: "unexpected_error", message: "Erro inesperado ao abrir a conversation." };
  }
}

/** Lê uma conversation por id, tenant-scoped. Ausência é `conversation_not_found`, nunca inventada. */
export async function getConversation(input: {
  tenantId: string;
  conversationId: string;
}): Promise<ConversationResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("yzi_imob_conversations")
      .select("*")
      .eq("tenant_id", input.tenantId)
      .eq("id", input.conversationId)
      .maybeSingle();

    if (error) {
      return { status: "error", code: "read_failed", message: "Não foi possível ler a conversation." };
    }
    if (!data) {
      return { status: "error", code: "conversation_not_found", message: "Conversation não encontrada neste tenant." };
    }
    return { status: "ok", conversation: mapConversationRow(data) };
  } catch {
    return { status: "error", code: "unexpected_error", message: "Erro inesperado ao ler a conversation." };
  }
}

/** Lista conversations de um lead, mais recente primeiro. */
export async function listConversationsForLead(input: {
  tenantId: string;
  leadId: string;
}): Promise<ConversationListResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("yzi_imob_conversations")
      .select("*")
      .eq("tenant_id", input.tenantId)
      .eq("lead_id", input.leadId)
      .order("started_at", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      return { status: "error", code: "read_failed", message: "Não foi possível listar as conversations." };
    }
    return { status: "ok", conversations: (data ?? []).map(mapConversationRow) };
  } catch {
    return { status: "error", code: "unexpected_error", message: "Erro inesperado ao listar conversations." };
  }
}

/** Atualiza o estado (`status`) de uma conversation já existente no tenant. */
export async function updateConversationStatus(input: {
  tenantId: string;
  conversationId: string;
  status: string;
}): Promise<ConversationResult> {
  const status = input.status?.trim();
  if (!status) {
    return { status: "error", code: "invalid_input", message: "status é obrigatório." };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("yzi_imob_conversations")
      .update({ status })
      .eq("tenant_id", input.tenantId)
      .eq("id", input.conversationId)
      .select("*")
      .maybeSingle();

    if (error) {
      return { status: "error", code: "write_failed", message: "Não foi possível atualizar o estado da conversation." };
    }
    if (!data) {
      return { status: "error", code: "conversation_not_found", message: "Conversation não encontrada neste tenant." };
    }
    return { status: "ok", conversation: mapConversationRow(data) };
  } catch {
    return { status: "error", code: "unexpected_error", message: "Erro inesperado ao atualizar a conversation." };
  }
}

/**
 * Registra uma mensagem (inbound ou outbound) e atualiza `last_message_at`
 * da conversation numa única transação, via RPC Postgres
 * `yzi_imob_record_message` (SECURITY INVOKER, RLS ativa). `body` vazio é
 * bloqueado ANTES de qualquer escrita, tanto aqui quanto dentro da RPC (o
 * check constraint do banco é a terceira camada, não a única). A RPC
 * revalida tenant/membership/conversation no servidor — nunca confia num
 * `conversationId` solto.
 *
 * Atômico: a função Postgres é uma transação implícita. Se a atualização de
 * `last_message_at` falhar depois do insert, a exceção reverte também o
 * insert — nunca fica mensagem órfã. Ver
 * docs/yzi-os-active/04-implementation/yzi-imob-conversation-record-message-manual-sql-pack-v1.sql
 * (11 testes de atomicidade/tenant-boundary como usuário authenticated,
 * rollback forçado, sem service role).
 */
export async function recordMessage(input: {
  tenantId: string;
  conversationId: string;
  direction: string;
  senderType: string;
  body: string;
  externalMessageId?: string | null;
}): Promise<MessageResult> {
  const tenantId = input.tenantId?.trim();
  const conversationId = input.conversationId?.trim();
  const direction = input.direction?.trim();
  const senderType = input.senderType?.trim();
  const body = input.body?.trim();

  if (!tenantId || !conversationId || !direction || !senderType) {
    return { status: "error", code: "invalid_input", message: "tenantId, conversationId, direction e senderType são obrigatórios." };
  }
  if (!body) {
    return { status: "error", code: "empty_body", message: "A mensagem não pode ter corpo vazio." };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .rpc("yzi_imob_record_message", {
        p_tenant_id: tenantId,
        p_conversation_id: conversationId,
        p_direction: direction,
        p_sender_type: senderType,
        p_body: body,
        p_external_message_id: input.externalMessageId ?? null,
      })
      .single();

    if (error || !data) {
      const code = mapRpcErrorToCode(error?.message);
      return { status: "error", code, message: rpcErrorMessage(code) };
    }

    const row = data as {
      id: string;
      tenant_id: string;
      conversation_id: string;
      direction: string;
      sender_type: string;
      body: string;
      external_message_id: string | null;
      created_at: string;
      conversation_last_message_at: string;
    };

    const message = mapMessageRow({
      id: row.id,
      tenant_id: row.tenant_id,
      conversation_id: row.conversation_id,
      direction: row.direction,
      sender_type: row.sender_type,
      body: row.body,
      external_message_id: row.external_message_id,
      created_at: row.created_at,
    });

    // A RPC devolve só `conversation_last_message_at` (não o registro
    // completo). Rebuscar aqui é uma leitura pós-commit, fora da transação
    // atômica (que já terminou com sucesso) — não monta um `Conversation`
    // parcial/inventado com campos vazios.
    const conversationResult = await getConversation({ tenantId, conversationId });
    if (conversationResult.status === "error") {
      return conversationResult;
    }

    return { status: "ok", message, conversation: conversationResult.conversation };
  } catch {
    return { status: "error", code: "unexpected_error", message: "Erro inesperado ao registrar a mensagem." };
  }
}

/** Traduz a mensagem de erro da RPC (prefixo estável) para um `ConversationErrorCode` honesto. */
function mapRpcErrorToCode(rpcMessage: string | undefined): ConversationErrorCode {
  const message = rpcMessage ?? "";
  if (message.startsWith("empty_body")) return "empty_body";
  if (message.startsWith("conversation_not_found")) return "conversation_not_found";
  if (message.startsWith("invalid_input")) return "invalid_input";
  if (message.startsWith("TENANT_ACCESS_DENIED") || message.startsWith("AUTH_REQUIRED")) return "write_failed";
  return "write_failed";
}

function rpcErrorMessage(code: ConversationErrorCode): string {
  switch (code) {
    case "empty_body":
      return "A mensagem não pode ter corpo vazio.";
    case "conversation_not_found":
      return "Conversation não encontrada neste tenant.";
    case "invalid_input":
      return "tenantId, conversationId, direction e senderType são obrigatórios.";
    default:
      return "Não foi possível registrar a mensagem.";
  }
}

/** Histórico recente de mensagens, mais recente primeiro, com limite (paginação simples via `beforeCreatedAt`). */
export async function listRecentMessages(input: {
  tenantId: string;
  conversationId: string;
  limit?: number;
  beforeCreatedAt?: string;
}): Promise<MessageHistoryResult> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from("yzi_imob_messages")
      .select("*")
      .eq("tenant_id", input.tenantId)
      .eq("conversation_id", input.conversationId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(clampLimit(input.limit));

    if (input.beforeCreatedAt) {
      query = query.lt("created_at", input.beforeCreatedAt);
    }

    const { data, error } = await query;
    if (error) {
      return { status: "error", code: "read_failed", message: "Não foi possível carregar o histórico de mensagens." };
    }
    return { status: "ok", messages: (data ?? []).map(mapMessageRow) };
  } catch {
    return { status: "error", code: "unexpected_error", message: "Erro inesperado ao carregar o histórico." };
  }
}

export type { Conversation, Message };
