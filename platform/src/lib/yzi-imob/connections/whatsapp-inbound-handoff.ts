import "server-only";

import postgres from "postgres";

const META_WHATSAPP_DATABASE_ROLE = "yzi_meta_whatsapp_runtime";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HANDOFF_STATUSES = new Set(["queued", "duplicate"]);

let handoffSql: ReturnType<typeof postgres> | null = null;

export type WhatsappInboundHandoffStatus = "queued" | "duplicate";

export type WhatsappInboundHandoffInput = {
  conversationId: string;
  messageId: string;
};

export type WhatsappInboundHandoffResult = {
  status: WhatsappInboundHandoffStatus;
  requestId: string;
  conversationId: string;
  messageId: string;
};

type WhatsappInboundHandoffRow = {
  status: string;
  request_id: string;
  conversation_id: string;
  message_id: string;
};

function readWhatsappInboundHandoffDatabaseUrl(): string {
  const connectionString = process.env.META_WHATSAPP_DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("Meta WhatsApp inbound handoff configuration is unavailable.");
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("Meta WhatsApp inbound handoff configuration is unavailable.");
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
    throw new Error("Meta WhatsApp inbound handoff configuration is unavailable.");
  }

  return connectionString;
}

function getHandoffSql(): ReturnType<typeof postgres> {
  if (!handoffSql) {
    handoffSql = postgres(readWhatsappInboundHandoffDatabaseUrl(), {
      max: 1,
      prepare: false,
      connect_timeout: 5,
      idle_timeout: 20,
      max_lifetime: 60 * 10,
    });
  }
  return handoffSql;
}

export async function enqueueWhatsappInboundHandoff(
  input: WhatsappInboundHandoffInput,
): Promise<WhatsappInboundHandoffResult> {
  const { conversationId, messageId } = input;
  if (!UUID_RE.test(conversationId) || !UUID_RE.test(messageId)) {
    throw new Error("Invalid WhatsApp inbound handoff identifiers.");
  }

  const sql = getHandoffSql();
  const rows = await sql<WhatsappInboundHandoffRow[]>`
    select status, request_id, conversation_id, message_id
    from yzi_meta_whatsapp_private.enqueue_whatsapp_inbound_handoff(${conversationId}::uuid, ${messageId}::uuid)
  `;
  const row = rows[0];
  if (
    !row ||
    !HANDOFF_STATUSES.has(row.status) ||
    !UUID_RE.test(row.request_id) ||
    !UUID_RE.test(row.conversation_id) ||
    !UUID_RE.test(row.message_id)
  ) {
    throw new Error("Invalid WhatsApp inbound handoff result.");
  }

  return {
    status: row.status as WhatsappInboundHandoffStatus,
    requestId: row.request_id,
    conversationId: row.conversation_id,
    messageId: row.message_id,
  };
}

export async function closeWhatsappInboundHandoffClient(): Promise<void> {
  const sql = handoffSql;
  handoffSql = null;
  if (sql) {
    await sql.end({ timeout: 5 });
  }
}
