import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { buildFollowUpWhatsappBody } from "../src/lib/yzi-imob/follow-up-worker/messages.ts";
import { decideFollowUpTask } from "../src/lib/yzi-imob/follow-up-worker/policy.ts";
import { runFollowUpWorkerIterationWithAdapters } from "../src/lib/yzi-imob/follow-up-worker/worker.ts";

const MIGRATION_SQL = readFileSync(
  new URL("../../supabase/migrations/20260723171517_yzi_imob_follow_up_worker_recovery_v1.sql", import.meta.url),
  "utf8",
);
const WORKER_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/follow-up-worker/worker.ts", import.meta.url),
  "utf8",
);
const PACKAGE_JSON = readFileSync(new URL("../package.json", import.meta.url), "utf8");

function makeContext(overrides = {}) {
  return {
    taskId: "11111111-1111-4111-8111-111111111111",
    tenantId: "22222222-2222-4222-8222-222222222222",
    leadId: "33333333-3333-4333-8333-333333333333",
    conversationId: "44444444-4444-4444-8444-444444444444",
    appointmentId: null,
    assignmentId: null,
    kind: "conversation_waiting_reply",
    status: "processing",
    channel: "whatsapp",
    dueAt: "2026-07-22T10:00:00.000Z",
    scheduledAt: "2026-07-22T10:00:00.000Z",
    notes: "Retomar contato",
    attemptCount: 1,
    maxAttempts: 3,
    metadata: {},
    assignmentStatus: null,
    appointmentStatus: null,
    feedbackPresent: false,
    externalSenderId: "synthetic.sender@example.test",
    latestMessageDirection: "inbound",
    latestMessageSenderType: "external_contact",
    latestMessageBody: "Ainda tenho interesse",
    latestMessageCreatedAt: "2026-07-22T10:00:00.000Z",
    leadStatus: "active",
    nextAppointmentExists: false,
    ...overrides,
  };
}

test("migration extends follow-up tasks with bounded worker lifecycle and recovery columns", () => {
  assert.match(MIGRATION_SQL, /add column if not exists scheduled_at timestamptz/i);
  assert.match(MIGRATION_SQL, /add column if not exists claimed_at timestamptz/i);
  assert.match(MIGRATION_SQL, /add column if not exists failed_at timestamptz/i);
  assert.match(MIGRATION_SQL, /add column if not exists attempt_count integer/i);
  assert.match(MIGRATION_SQL, /add column if not exists max_attempts integer/i);
  assert.match(MIGRATION_SQL, /add column if not exists recovery_count integer/i);
  assert.match(MIGRATION_SQL, /create or replace function yzi_imob_operations_private\.claim_next_follow_up_task/i);
  assert.match(MIGRATION_SQL, /for update skip locked/i);
  assert.match(MIGRATION_SQL, /create or replace function yzi_imob_operations_private\.recover_follow_up_tasks/i);
  assert.match(MIGRATION_SQL, /create or replace function yzi_imob_operations_private\.recover_inbound_operations/i);
  assert.match(MIGRATION_SQL, /processing_abandoned/i);
});

test("follow-up task context function is not declared stable while locking the row", () => {
  const FIX_SQL = readFileSync(
    new URL("../../supabase/migrations/20260723183000_yzi_imob_follow_up_context_volatility_fix_v1.sql", import.meta.url),
    "utf8",
  );
  assert.match(
    FIX_SQL,
    /create or replace function yzi_imob_operations_private\.get_follow_up_task_context[\s\S]+language plpgsql[\s\S]+volatile[\s\S]+for update/i,
  );
});

test("bounded worker scripts are exposed in package.json", () => {
  assert.match(PACKAGE_JSON, /"follow-up:worker": "node --conditions=react-server scripts\/run-yzi-imob-follow-up-worker\.mjs"/);
  assert.match(PACKAGE_JSON, /"follow-up:recover": "node --conditions=react-server scripts\/run-yzi-imob-operational-recovery\.mjs"/);
});

test("conversation waiting reply builds deterministic outbound body", () => {
  const body = buildFollowUpWhatsappBody(makeContext());
  assert.match(body, /ultima mensagem/i);
  assert.doesNotMatch(body, /http/i);
});

test("policy cancels already resolved assignment tasks", () => {
  const decision = decideFollowUpTask(
    makeContext({ kind: "assignment_response_due", assignmentStatus: "accepted", channel: null, conversationId: null, externalSenderId: null }),
    new Date("2026-07-23T12:00:00.000Z"),
    buildFollowUpWhatsappBody,
  );
  assert.deepEqual(decision, { type: "cancel", reason: "assignment_already_resolved" });
});

test("policy routes overdue next action to WhatsApp when contract is sufficient", () => {
  const decision = decideFollowUpTask(
    makeContext({ kind: "next_action_due" }),
    new Date("2026-07-23T12:00:00.000Z"),
    buildFollowUpWhatsappBody,
  );
  assert.equal(decision.type, "outbound_whatsapp");
});

test("worker returns idle when no task is available", async () => {
  const result = await runFollowUpWorkerIterationWithAdapters(
    {
      syncTasks: async () => 0,
      claimTask: async () => null,
      getTaskContext: async () => { throw new Error("unused"); },
      completeTask: async () => { throw new Error("unused"); },
      failTask: async () => ({ attemptCount: 0, maxAttempts: 0 }),
      cancelTask: async () => { throw new Error("unused"); },
      sendWhatsapp: async () => ({ status: "error", code: "provider_unavailable" }),
    },
    { now: new Date("2026-07-23T12:00:00.000Z") },
  );
  assert.deepEqual(result, { status: "idle", synced: 0 });
});

test("worker completes an eligible conversation task after simulated 2xx outbound", async () => {
  const completions = [];
  const result = await runFollowUpWorkerIterationWithAdapters(
    {
      syncTasks: async () => 1,
      claimTask: async () => ({
        taskId: makeContext().taskId,
        tenantId: makeContext().tenantId,
        kind: "conversation_waiting_reply",
        status: "processing",
        channel: "whatsapp",
        dueAt: makeContext().dueAt,
        scheduledAt: makeContext().scheduledAt,
        attemptCount: 1,
        maxAttempts: 3,
      }),
      getTaskContext: async () => makeContext(),
      completeTask: async (taskId) => { completions.push(taskId); },
      failTask: async () => ({ attemptCount: 1, maxAttempts: 3 }),
      cancelTask: async () => {},
      sendWhatsapp: async () => ({
        status: "accepted",
        messageId: "mid",
        conversationId: "cid",
        providerMessageId: "wamid.synthetic",
        deliveryStatus: "accepted",
        idempotentReplay: false,
      }),
    },
    { now: new Date("2026-07-23T12:00:00.000Z") },
  );
  assert.equal(completions.length, 1);
  assert.deepEqual(result, {
    status: "completed",
    synced: 1,
    taskId: makeContext().taskId,
    kind: "conversation_waiting_reply",
  });
});

test("worker schedules retry after simulated provider 5xx", async () => {
  const failures = [];
  const result = await runFollowUpWorkerIterationWithAdapters(
    {
      syncTasks: async () => 0,
      claimTask: async () => ({
        taskId: makeContext().taskId,
        tenantId: makeContext().tenantId,
        kind: "lead_stalled",
        status: "processing",
        channel: "whatsapp",
        dueAt: makeContext().dueAt,
        scheduledAt: makeContext().scheduledAt,
        attemptCount: 1,
        maxAttempts: 3,
      }),
      getTaskContext: async () => makeContext({ kind: "lead_stalled" }),
      completeTask: async () => {},
      failTask: async (_taskId, code, retryDelaySeconds) => {
        failures.push({ code, retryDelaySeconds });
        return { attemptCount: 1, maxAttempts: 3 };
      },
      cancelTask: async () => {},
      sendWhatsapp: async () => ({ status: "error", code: "provider_unavailable" }),
    },
    { now: new Date("2026-07-23T12:00:00.000Z") },
  );
  assert.deepEqual(failures[0], {
    code: "outbound_provider_unavailable",
    retryDelaySeconds: 300,
  });
  assert.deepEqual(result, {
    status: "retry_scheduled",
    synced: 0,
    taskId: makeContext().taskId,
    kind: "lead_stalled",
    failureCode: "outbound_provider_unavailable",
  });
});

test("worker terminates manual tasks without outbound when the condition is still unresolved", async () => {
  const result = await runFollowUpWorkerIterationWithAdapters(
    {
      syncTasks: async () => 0,
      claimTask: async () => ({
        taskId: makeContext().taskId,
        tenantId: makeContext().tenantId,
        kind: "visit_feedback_due",
        status: "processing",
        channel: null,
        dueAt: makeContext().dueAt,
        scheduledAt: makeContext().scheduledAt,
        attemptCount: 1,
        maxAttempts: 1,
      }),
      getTaskContext: async () => makeContext({
        kind: "visit_feedback_due",
        channel: null,
        conversationId: null,
        externalSenderId: null,
        latestMessageDirection: null,
        latestMessageSenderType: null,
        feedbackPresent: false,
        appointmentStatus: "completed",
      }),
      completeTask: async () => {},
      failTask: async () => ({ attemptCount: 1, maxAttempts: 1 }),
      cancelTask: async () => {},
      sendWhatsapp: async () => ({ status: "error", code: "provider_unavailable" }),
    },
    { now: new Date("2026-07-23T12:00:00.000Z") },
  );
  assert.deepEqual(result, {
    status: "failed",
    synced: 0,
    taskId: makeContext().taskId,
    kind: "visit_feedback_due",
    failureCode: "manual_visit_feedback_required",
    terminal: true,
  });
});

test("worker source keeps deterministic idempotency and bounded statuses", () => {
  assert.match(WORKER_SOURCE, /idempotencyKey: `follow-up-task:\$\{context\.taskId\}`/);
  assert.doesNotMatch(WORKER_SOURCE, /while\s*\(\s*true\s*\)/);
});
