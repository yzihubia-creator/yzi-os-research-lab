import "server-only";

import postgres from "postgres";

import type {
  ClaimedFollowUpTask,
  FollowUpFailureCode,
  FollowUpTaskContext,
} from "./types.ts";

const INBOUND_OPERATIONS_DATABASE_ROLE = "yzi_imob_inbound_operations_runtime";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let workerSql: ReturnType<typeof postgres> | null = null;
let identityVerified = false;

type IdentityRow = { current_user_name: string; session_user_name: string };
type SyncRow = { created_count: number };
type ClaimRow = {
  task_id: string;
  tenant_id: string;
  kind: ClaimedFollowUpTask["kind"];
  status: "processing";
  channel: "whatsapp" | null;
  due_at: string;
  scheduled_at: string;
  attempt_count: number;
  max_attempts: number;
};
type ContextRow = {
  task_id: string;
  tenant_id: string;
  lead_id: string | null;
  conversation_id: string | null;
  appointment_id: string | null;
  assignment_id: string | null;
  kind: FollowUpTaskContext["kind"];
  status: "processing";
  channel: "whatsapp" | null;
  due_at: string;
  scheduled_at: string;
  notes: string | null;
  attempt_count: number;
  max_attempts: number;
  metadata: unknown;
  assignment_status: string | null;
  appointment_status: string | null;
  feedback_present: boolean;
  external_sender_id: string | null;
  latest_message_direction: string | null;
  latest_message_sender_type: string | null;
  latest_message_body: string | null;
  latest_message_created_at: string | null;
  lead_status: string | null;
  next_appointment_exists: boolean;
};
type MutationRow = {
  status: string;
  task_id: string;
  attempt_count?: number;
  max_attempts?: number;
};
type RecoveryRow = { recovered_count: number };

function readWorkerDatabaseUrl(): string {
  const connectionString = process.env.YZI_IMOB_INBOUND_OPERATIONS_DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("Follow-up worker configuration is unavailable.");
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("Follow-up worker configuration is unavailable.");
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
    throw new Error("Follow-up worker configuration is unavailable.");
  }

  return connectionString;
}

async function getVerifiedWorkerSql(): Promise<ReturnType<typeof postgres>> {
  if (!workerSql) {
    workerSql = postgres(readWorkerDatabaseUrl(), {
      max: 1,
      prepare: false,
      connect_timeout: 5,
      idle_timeout: 20,
      max_lifetime: 60 * 10,
    });
  }

  if (!identityVerified) {
    const sql = workerSql;
    let rows: IdentityRow[];
    try {
      rows = await sql<IdentityRow[]>`
        select current_user as current_user_name, session_user as session_user_name
      `;
    } catch {
      workerSql = null;
      identityVerified = false;
      await sql.end({ timeout: 5 }).catch(() => {});
      throw new Error("Follow-up worker configuration is unavailable.");
    }

    const row = rows[0];
    if (!row || row.current_user_name !== INBOUND_OPERATIONS_DATABASE_ROLE || row.session_user_name !== INBOUND_OPERATIONS_DATABASE_ROLE) {
      workerSql = null;
      identityVerified = false;
      await sql.end({ timeout: 5 }).catch(() => {});
      throw new Error("Follow-up worker configuration is unavailable.");
    }

    identityVerified = true;
  }

  return workerSql;
}

function asMetadata(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function syncFollowUpTasks(limit = 1): Promise<number> {
  const sql = await getVerifiedWorkerSql();
  const rows = await sql<SyncRow[]>`
    select created_count
    from yzi_imob_operations_private.sync_follow_up_tasks(${limit}::integer)
  `;
  return rows[0]?.created_count ?? 0;
}

export async function claimNextFollowUpTask(): Promise<ClaimedFollowUpTask | null> {
  const sql = await getVerifiedWorkerSql();
  const rows = await sql<ClaimRow[]>`
    select task_id, tenant_id, kind, status, channel, due_at, scheduled_at, attempt_count, max_attempts
    from yzi_imob_operations_private.claim_next_follow_up_task()
  `;
  const row = rows[0];
  if (!row) {
    return null;
  }
  if (!UUID_RE.test(row.task_id) || !UUID_RE.test(row.tenant_id)) {
    throw new Error("Invalid follow-up task claim result.");
  }
  return {
    taskId: row.task_id,
    tenantId: row.tenant_id,
    kind: row.kind,
    status: row.status,
    channel: row.channel,
    dueAt: row.due_at,
    scheduledAt: row.scheduled_at,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
  };
}

export async function getFollowUpTaskContext(taskId: string): Promise<FollowUpTaskContext> {
  if (!UUID_RE.test(taskId)) {
    throw new Error("Invalid follow-up task id.");
  }
  const sql = await getVerifiedWorkerSql();
  const rows = await sql<ContextRow[]>`
    select *
    from yzi_imob_operations_private.get_follow_up_task_context(${taskId}::uuid)
  `;
  const row = rows[0];
  if (!row || !UUID_RE.test(row.task_id) || !UUID_RE.test(row.tenant_id)) {
    throw new Error("Invalid follow-up task context.");
  }
  return {
    taskId: row.task_id,
    tenantId: row.tenant_id,
    leadId: row.lead_id,
    conversationId: row.conversation_id,
    appointmentId: row.appointment_id,
    assignmentId: row.assignment_id,
    kind: row.kind,
    status: row.status,
    channel: row.channel,
    dueAt: row.due_at,
    scheduledAt: row.scheduled_at,
    notes: row.notes,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    metadata: asMetadata(row.metadata),
    assignmentStatus: row.assignment_status,
    appointmentStatus: row.appointment_status,
    feedbackPresent: Boolean(row.feedback_present),
    externalSenderId: row.external_sender_id,
    latestMessageDirection: row.latest_message_direction,
    latestMessageSenderType: row.latest_message_sender_type,
    latestMessageBody: row.latest_message_body,
    latestMessageCreatedAt: row.latest_message_created_at,
    leadStatus: row.lead_status,
    nextAppointmentExists: Boolean(row.next_appointment_exists),
  };
}

export async function completeFollowUpTask(taskId: string): Promise<void> {
  const sql = await getVerifiedWorkerSql();
  const rows = await sql<MutationRow[]>`
    select status, task_id
    from yzi_imob_operations_private.complete_follow_up_task(${taskId}::uuid)
  `;
  if (!rows[0] || rows[0].status !== "completed") {
    throw new Error("Invalid follow-up completion result.");
  }
}

export async function failFollowUpTask(
  taskId: string,
  failureCode: FollowUpFailureCode,
  retryDelaySeconds: number | null,
): Promise<{ attemptCount: number; maxAttempts: number }> {
  const sql = await getVerifiedWorkerSql();
  const rows = await sql<MutationRow[]>`
    select status, task_id, attempt_count, max_attempts
    from yzi_imob_operations_private.fail_follow_up_task(
      ${taskId}::uuid,
      ${failureCode}::text,
      ${retryDelaySeconds ?? null}::integer
    )
  `;
  const row = rows[0];
  if (!row || row.status !== "failed") {
    throw new Error("Invalid follow-up failure result.");
  }
  return {
    attemptCount: row.attempt_count ?? 0,
    maxAttempts: row.max_attempts ?? 0,
  };
}

export async function cancelFollowUpTask(taskId: string, reason: string): Promise<void> {
  const sql = await getVerifiedWorkerSql();
  const rows = await sql<MutationRow[]>`
    select status, task_id
    from yzi_imob_operations_private.cancel_follow_up_task(
      ${taskId}::uuid,
      ${reason}::text
    )
  `;
  if (!rows[0] || rows[0].status !== "cancelled") {
    throw new Error("Invalid follow-up cancel result.");
  }
}

export async function recoverFollowUpTasks(input: {
  source: string;
  processingTimeoutSeconds?: number;
  limit?: number;
}): Promise<number> {
  const sql = await getVerifiedWorkerSql();
  const rows = await sql<RecoveryRow[]>`
    select recovered_count
    from yzi_imob_operations_private.recover_follow_up_tasks(
      ${input.source}::text,
      ${input.processingTimeoutSeconds ?? 900}::integer,
      ${input.limit ?? 20}::integer
    )
  `;
  return rows[0]?.recovered_count ?? 0;
}

export async function recoverInboundOperations(input: {
  source: string;
  processingTimeoutSeconds?: number;
  limit?: number;
}): Promise<number> {
  const sql = await getVerifiedWorkerSql();
  const rows = await sql<RecoveryRow[]>`
    select recovered_count
    from yzi_imob_operations_private.recover_inbound_operations(
      ${input.source}::text,
      ${input.processingTimeoutSeconds ?? 900}::integer,
      ${input.limit ?? 20}::integer
    )
  `;
  return rows[0]?.recovered_count ?? 0;
}

export async function closeFollowUpWorkerClient(): Promise<void> {
  const sql = workerSql;
  workerSql = null;
  identityVerified = false;
  if (sql) {
    await sql.end({ timeout: 5 });
  }
}
