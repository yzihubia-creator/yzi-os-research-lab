// Contrato mínimo do runtime de conversa (Unidade "Conversation Runtime").
// Tipos puros — nenhum I/O, nenhum Supabase, nenhum service role.
//
// `channel`/`status`/`direction`/`senderType` são `text` frouxo no banco
// (check constraint só garante "não vazio" — ver
// yzi-imob-core-entities-manual-sql-pack-v1.sql). O domínio de valores ainda
// não está fechado pelo produto, então este módulo valida "não vazio" e
// oferece um vocabulário RECOMENDADO (não um enum rígido) para não travar o
// schema numa decisão prematura.

export type Conversation = {
  id: string;
  tenantId: string;
  leadId: string;
  channel: string;
  status: string;
  startedAt: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  tenantId: string;
  conversationId: string;
  direction: string;
  senderType: string;
  body: string;
  externalMessageId: string | null;
  createdAt: string;
};

/** Vocabulário recomendado — não é um enum de banco, apenas o domínio conhecido hoje. */
export const RECOMMENDED_CHANNELS = ["whatsapp"] as const;
export const RECOMMENDED_CONVERSATION_STATUSES = ["open", "paused", "closed"] as const;
export const RECOMMENDED_DIRECTIONS = ["inbound", "outbound"] as const;
export const RECOMMENDED_SENDER_TYPES = ["lead", "yzi", "human"] as const;

export type ConversationErrorCode =
  | "lead_not_found"
  | "conversation_not_found"
  | "conversation_lead_mismatch"
  | "invalid_input"
  | "empty_body"
  | "write_failed"
  | "read_failed"
  | "unexpected_error";

export type ConversationResult =
  | { status: "ok"; conversation: Conversation }
  | { status: "error"; code: ConversationErrorCode; message: string };

export type MessageResult =
  | { status: "ok"; message: Message; conversation: Conversation }
  | { status: "error"; code: ConversationErrorCode; message: string };

export type MessageHistoryResult =
  | { status: "ok"; messages: Message[] }
  | { status: "error"; code: ConversationErrorCode; message: string };

export type ConversationListResult =
  | { status: "ok"; conversations: Conversation[] }
  | { status: "error"; code: ConversationErrorCode; message: string };
