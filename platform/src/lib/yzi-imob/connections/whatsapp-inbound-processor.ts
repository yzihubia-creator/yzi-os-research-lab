import "server-only";

import postgres from "postgres";

const META_WHATSAPP_DATABASE_ROLE = "yzi_meta_whatsapp_runtime";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

let inboundSql: ReturnType<typeof postgres> | null = null;

export type WhatsappInboundProcessingResult = {
  processed: boolean;
  ignored: boolean;
  duplicate: boolean;
  conversationId: string | null;
  messageId: string | null;
  reason: string | null;
};

type WhatsappInboundProcessingRow = {
  processed: boolean;
  ignored: boolean;
  duplicate: boolean;
  conversation_id: string | null;
  message_id: string | null;
  reason: string | null;
};

function readWhatsappInboundDatabaseUrl(): string {
  const connectionString = process.env.META_WHATSAPP_DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("Meta WhatsApp inbound configuration is unavailable.");
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("Meta WhatsApp inbound configuration is unavailable.");
  }

  const loginRole = decodeURIComponent(url.username).split(".", 1)[0];
  const sslMode = url.searchParams.get("sslmode");
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    loginRole !== META_WHATSAPP_DATABASE_ROLE ||
    !url.password ||
    !url.hostname ||
    (process.env.NODE_ENV === "production" && sslMode !== "require")
  ) {
    throw new Error("Meta WhatsApp inbound configuration is unavailable.");
  }

  return connectionString;
}

function getInboundSql(): ReturnType<typeof postgres> {
  if (!inboundSql) {
    inboundSql = postgres(readWhatsappInboundDatabaseUrl(), {
      max: 1,
      prepare: false,
      connect_timeout: 5,
      idle_timeout: 20,
      max_lifetime: 60 * 10,
    });
  }
  return inboundSql;
}

export async function processWhatsappInboundEvent(eventId: string): Promise<WhatsappInboundProcessingResult> {
  if (!UUID_RE.test(eventId)) {
    return {
      processed: false,
      ignored: true,
      duplicate: false,
      conversationId: null,
      messageId: null,
      reason: "invalid_event_id",
    };
  }

  const sql = getInboundSql();
  const rows = await sql<WhatsappInboundProcessingRow[]>`
    select processed, ignored, duplicate, conversation_id, message_id, reason
    from yzi_meta_whatsapp_private.process_whatsapp_inbound_event(${eventId}::uuid)
  `;
  const row = rows[0];
  if (!row) {
    return {
      processed: false,
      ignored: true,
      duplicate: false,
      conversationId: null,
      messageId: null,
      reason: "no_result",
    };
  }

  return {
    processed: Boolean(row.processed),
    ignored: Boolean(row.ignored),
    duplicate: Boolean(row.duplicate),
    conversationId: row.conversation_id ?? null,
    messageId: row.message_id ?? null,
    reason: row.reason ?? null,
  };
}

export async function closeWhatsappInboundProcessorClient(): Promise<void> {
  const sql = inboundSql;
  inboundSql = null;
  if (sql) {
    await sql.end({ timeout: 5 });
  }
}
