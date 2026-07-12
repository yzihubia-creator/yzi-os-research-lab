import type { Conversation, Message } from "./types";

// Mapeamento puro linha-de-banco → tipo de domínio. Sem I/O, sem fallback
// inventado: campos ausentes/tipos errados viram string vazia explícita, o
// chamador decide se isso é erro (nunca escondemos aqui).

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function str(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

function strOrNull(source: Record<string, unknown>, key: string): string | null {
  const value = source[key];
  return typeof value === "string" ? value : null;
}

export function mapConversationRow(row: unknown): Conversation {
  const record = asRecord(row);
  return {
    id: str(record, "id"),
    tenantId: str(record, "tenant_id"),
    leadId: str(record, "lead_id"),
    channel: str(record, "channel"),
    status: str(record, "status"),
    startedAt: str(record, "started_at"),
    lastMessageAt: strOrNull(record, "last_message_at"),
    createdAt: str(record, "created_at"),
    updatedAt: str(record, "updated_at"),
  };
}

export function mapMessageRow(row: unknown): Message {
  const record = asRecord(row);
  return {
    id: str(record, "id"),
    tenantId: str(record, "tenant_id"),
    conversationId: str(record, "conversation_id"),
    direction: str(record, "direction"),
    senderType: str(record, "sender_type"),
    body: str(record, "body"),
    externalMessageId: strOrNull(record, "external_message_id"),
    createdAt: str(record, "created_at"),
  };
}
