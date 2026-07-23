import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  FOLLOW_UP_TASK_KIND_VALUES,
  FOLLOW_UP_TASK_STATUS_VALUES,
  LEAD_ASSIGNMENT_STATUS_VALUES,
  VISIT_FEEDBACK_ATTENDANCE_VALUES,
  VISIT_FEEDBACK_OUTCOME_VALUES,
} from "../src/lib/yzi-imob/operations/types.ts";

const MIGRATION_SQL = readFileSync(
  new URL("../../supabase/migrations/20260723143000_yzi_imob_broker_distribution_follow_up_v1.sql", import.meta.url),
  "utf8",
);
const REPOSITORY_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/operations/repository.ts", import.meta.url),
  "utf8",
);

test("distribution migration is tenant-scoped and forbids cross-tenant broker assignment", () => {
  assert.match(MIGRATION_SQL, /create table if not exists public\.yzi_imob_lead_assignments/i);
  assert.match(MIGRATION_SQL, /foreign key \(lead_id, tenant_id\) references public\.yzi_imob_leads \(id, tenant_id\)/i);
  assert.match(MIGRATION_SQL, /create unique index if not exists yzi_imob_lead_assignments_active_lead_unique/i);
  assert.match(MIGRATION_SQL, /exists \(\s*select 1\s*from public\.tenant_memberships broker_tm/i);
  assert.match(MIGRATION_SQL, /create policy yzi_imob_lead_assignments_update_self/i);
});

test("visit feedback and follow-up tasks are explicit, operational, and non-LLM", () => {
  assert.match(MIGRATION_SQL, /create table if not exists public\.yzi_imob_visit_feedback/i);
  assert.match(MIGRATION_SQL, /create table if not exists public\.yzi_imob_follow_up_tasks/i);
  assert.match(MIGRATION_SQL, /'visit_feedback_due', 'assignment_response_due', 'next_action_due', 'conversation_waiting_reply'/i);
  assert.doesNotMatch(MIGRATION_SQL, /openai|generateText|streamText|llm/i);
  assert.match(REPOSITORY_SOURCE, /upsertFollowUpTaskForAssignment/);
  assert.match(REPOSITORY_SOURCE, /upsertFollowUpTaskFromFeedback/);
});

test("repository wires operational packet, assignment response, and feedback contracts", () => {
  assert.match(REPOSITORY_SOURCE, /export async function assignLeadToBroker/);
  assert.match(REPOSITORY_SOURCE, /export async function respondToLeadAssignment/);
  assert.match(REPOSITORY_SOURCE, /export async function getLeadOperationalPacket/);
  assert.match(REPOSITORY_SOURCE, /export async function recordVisitFeedback/);
  assert.match(REPOSITORY_SOURCE, /from\("yzi_imob_conversations"\)/);
  assert.match(REPOSITORY_SOURCE, /from\("yzi_imob_messages"\)/);
  assert.match(REPOSITORY_SOURCE, /from\("yzi_imob_appointments"\)/);
});

test("public type contracts enumerate only governed values", () => {
  assert.deepEqual(LEAD_ASSIGNMENT_STATUS_VALUES, [
    "assigned",
    "accepted",
    "declined",
    "expired",
    "reassigned",
  ]);
  assert.deepEqual(VISIT_FEEDBACK_ATTENDANCE_VALUES, ["attended", "no_show", "unknown"]);
  assert.deepEqual(VISIT_FEEDBACK_OUTCOME_VALUES, [
    "interested",
    "not_interested",
    "proposal_requested",
    "follow_up_required",
    "undisclosed",
  ]);
  assert.deepEqual(FOLLOW_UP_TASK_KIND_VALUES, [
    "lead_stalled",
    "visit_feedback_due",
    "assignment_response_due",
    "next_action_due",
    "conversation_waiting_reply",
  ]);
  assert.deepEqual(FOLLOW_UP_TASK_STATUS_VALUES, [
    "pending",
    "processing",
    "completed",
    "cancelled",
    "failed",
  ]);
});
