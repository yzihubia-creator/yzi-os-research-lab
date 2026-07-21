import "server-only";

import postgres from "postgres";

import type {
  ClaimedInboundOperation,
  FailureCode,
  InboundOperationMessage,
  IntentKey,
  WorkflowKey,
} from "./types.ts";

const INBOUND_OPERATIONS_DATABASE_ROLE = "yzi_imob_inbound_operations_runtime";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let inboundOperationsSql: ReturnType<typeof postgres> | null = null;
let identityVerified = false;

function readInboundOperationsDatabaseUrl(): string {
  // Deliberately its own env var — never reuses META_WHATSAPP_DATABASE_URL.
  // The credential is provisioned out-of-band after a future remote apply;
  // this module never creates or logs it.
  const connectionString = process.env.YZI_IMOB_INBOUND_OPERATIONS_DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("Inbound operations consumer configuration is unavailable.");
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("Inbound operations consumer configuration is unavailable.");
  }

  const loginRole = decodeURIComponent(url.username).split(".", 1)[0];
  const sslMode = url.searchParams.get("sslmode");
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    loginRole !== INBOUND_OPERATIONS_DATABASE_ROLE ||
    !url.password ||
    !url.hostname ||
    (process.env.NODE_ENV === "production" && sslMode !== "require")
  ) {
    throw new Error("Inbound operations consumer configuration is unavailable.");
  }

  return connectionString;
}

type IdentityRow = { current_user_name: string; session_user_name: string };

/**
 * Connection-string inspection (readInboundOperationsDatabaseUrl) is a
 * cheap pre-filter, never proof: a role name embedded in the URL is not the
 * role Postgres actually authenticated as. The only trustworthy signal is
 * asking Postgres itself, on the live connection, right after it opens.
 * Verified once per connection lifetime; never logs the returned values.
 */
async function getVerifiedInboundOperationsSql(): Promise<ReturnType<typeof postgres>> {
  if (!inboundOperationsSql) {
    inboundOperationsSql = postgres(readInboundOperationsDatabaseUrl(), {
      max: 1,
      prepare: false,
      connect_timeout: 5,
      idle_timeout: 20,
      max_lifetime: 60 * 10,
    });
  }

  if (!identityVerified) {
    const sql = inboundOperationsSql;
    let rows: IdentityRow[];
    try {
      rows = await sql<IdentityRow[]>`
        select current_user as current_user_name, session_user as session_user_name
      `;
    } catch {
      inboundOperationsSql = null;
      identityVerified = false;
      await sql.end({ timeout: 5 });
      throw new Error("Inbound operations consumer configuration is unavailable.");
    }

    const row = rows[0];
    if (!row || row.session_user_name !== INBOUND_OPERATIONS_DATABASE_ROLE) {
      inboundOperationsSql = null;
      identityVerified = false;
      await sql.end({ timeout: 5 });
      throw new Error("Inbound operations consumer configuration is unavailable.");
    }

    identityVerified = true;
  }

  return inboundOperationsSql;
}

type ClaimRow = {
  request_id: string;
  tenant_id: string;
  conversation_id: string;
  message_id: string;
};

/** Claims the single oldest queued row, or null when there is nothing to do. */
export async function claimNextInboundOperation(): Promise<ClaimedInboundOperation | null> {
  const sql = await getVerifiedInboundOperationsSql();
  const rows = await sql<ClaimRow[]>`
    select request_id, tenant_id, conversation_id, message_id
    from yzi_imob_inbound_operations_private.claim_next_inbound_operation()
  `;
  const row = rows[0];
  if (!row) {
    return null;
  }
  if (
    !UUID_RE.test(row.request_id) ||
    !UUID_RE.test(row.tenant_id) ||
    !UUID_RE.test(row.conversation_id) ||
    !UUID_RE.test(row.message_id)
  ) {
    throw new Error("Invalid claim result.");
  }
  return {
    requestId: row.request_id,
    tenantId: row.tenant_id,
    conversationId: row.conversation_id,
    messageId: row.message_id,
  };
}

type MessageRow = {
  request_id: string;
  tenant_id: string;
  conversation_id: string;
  message_id: string;
  body: string;
  message_channel: string;
  conversation_channel: string;
  sender_type: string;
  direction: string;
  provider: string;
};

/**
 * Reads the minimal message contract for a claimed (processing) request.
 * Throws with the RPC's controlled failure_code as the error message on any
 * validation failure (message_not_found / conversation_not_found /
 * identity_mismatch / invalid_message_contract) — never a raw Postgres error.
 */
export async function getInboundOperationMessage(
  requestId: string,
): Promise<InboundOperationMessage> {
  if (!UUID_RE.test(requestId)) {
    throw new Error("invalid_message_contract");
  }
  const sql = await getVerifiedInboundOperationsSql();
  const rows = await sql<MessageRow[]>`
    select request_id, tenant_id, conversation_id, message_id, body,
           message_channel, conversation_channel, sender_type, direction, provider
    from yzi_imob_inbound_operations_private.get_inbound_operation_message(${requestId}::uuid)
  `;
  const row = rows[0];
  if (!row) {
    throw new Error("invalid_message_contract");
  }
  return {
    requestId: row.request_id,
    tenantId: row.tenant_id,
    conversationId: row.conversation_id,
    messageId: row.message_id,
    body: row.body,
    messageChannel: row.message_channel,
    conversationChannel: row.conversation_channel,
    senderType: row.sender_type,
    direction: row.direction,
    provider: row.provider,
  };
}

type CompleteRow = { status: string; request_id: string };

export async function completeInboundOperation(
  requestId: string,
  intentKey: IntentKey,
  workflowKey: WorkflowKey,
): Promise<{ status: "ready" | "already_ready"; requestId: string }> {
  if (!UUID_RE.test(requestId)) {
    throw new Error("completion_failed");
  }
  const sql = await getVerifiedInboundOperationsSql();
  const rows = await sql<CompleteRow[]>`
    select status, request_id
    from yzi_imob_inbound_operations_private.complete_inbound_operation(
      ${requestId}::uuid, ${intentKey}::text, ${workflowKey}::text
    )
  `;
  const row = rows[0];
  if (
    !row ||
    (row.status !== "ready" && row.status !== "already_ready") ||
    !UUID_RE.test(row.request_id)
  ) {
    throw new Error("completion_failed");
  }
  return { status: row.status, requestId: row.request_id };
}

type FailRow = { status: string; request_id: string };

/**
 * intentKey is required for workflow_selection_failed/completion_failed
 * (classification already succeeded — the RPC persists it alongside
 * intent_status='classified') and must be omitted/null for every
 * pre-classification failure_code. workflowKey is additionally required for
 * completion_failed only (a workflow had already been selected before the
 * completion write failed — the RPC persists it alongside
 * workflow_status='selected' instead of discarding it) and must be
 * omitted/null for every other failure_code. The RPC fails closed on any
 * other pairing; this wrapper does not attempt to guess or default either
 * value.
 */
export async function failInboundOperation(
  requestId: string,
  failureCode: FailureCode,
  intentKey: IntentKey | null = null,
  workflowKey: WorkflowKey | null = null,
): Promise<{ status: "failed"; requestId: string }> {
  if (!UUID_RE.test(requestId)) {
    throw new Error("Invalid request id for fail_inbound_operation.");
  }
  const sql = await getVerifiedInboundOperationsSql();
  const rows = await sql<FailRow[]>`
    select status, request_id
    from yzi_imob_inbound_operations_private.fail_inbound_operation(
      ${requestId}::uuid, ${failureCode}::text, ${intentKey}::text, ${workflowKey}::text
    )
  `;
  const row = rows[0];
  if (!row || row.status !== "failed" || !UUID_RE.test(row.request_id)) {
    throw new Error("Invalid fail_inbound_operation result.");
  }
  return { status: "failed", requestId: row.request_id };
}

export async function closeInboundOperationsClient(): Promise<void> {
  const sql = inboundOperationsSql;
  inboundOperationsSql = null;
  identityVerified = false;
  if (sql) {
    await sql.end({ timeout: 5 });
  }
}
