import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const MIGRATION_SQL = readFileSync(
  new URL("../../supabase/migrations/20260723171517_yzi_imob_follow_up_worker_recovery_v1.sql", import.meta.url),
  "utf8",
);
const WORKER_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/follow-up-worker/worker.ts", import.meta.url),
  "utf8",
);
const RECOVERY_SCRIPT = readFileSync(
  new URL("../scripts/run-yzi-imob-operational-recovery.mjs", import.meta.url),
  "utf8",
);

test("migration adds governed recovery for processing and retryable failures only", () => {
  assert.match(MIGRATION_SQL, /create or replace function yzi_imob_operations_private\.recover_follow_up_tasks/i);
  assert.match(MIGRATION_SQL, /ft\.status = 'processing'/i);
  assert.match(MIGRATION_SQL, /recovery_reason = 'processing_timeout'/i);
  assert.match(MIGRATION_SQL, /ft\.status = 'failed'/i);
  assert.match(MIGRATION_SQL, /recovery_reason = 'failed_retry_ready'/i);
  assert.doesNotMatch(MIGRATION_SQL, /where ft\.status = 'completed'/i);
  assert.doesNotMatch(MIGRATION_SQL, /set status = 'pending'[\s\S]+where ft\.status = 'completed'/i);
});

test("inbound recovery marks timed out executions as processing_abandoned", () => {
  assert.match(MIGRATION_SQL, /failure_code = 'processing_abandoned'/i);
  assert.match(MIGRATION_SQL, /execution_status = 'failed'/i);
  assert.match(MIGRATION_SQL, /insert into public\.yzi_imob_inbound_runner_executions/i);
  const OBSERVABILITY_FIX_SQL = readFileSync(
    new URL("../../supabase/migrations/20260723184500_yzi_imob_inbound_runner_observability_failure_code_fix_v1.sql", import.meta.url),
    "utf8",
  );
  assert.match(OBSERVABILITY_FIX_SQL, /processing_abandoned/i);
  assert.match(OBSERVABILITY_FIX_SQL, /yzi_imob_inbound_runner_executions_failure_code_check/i);
});

test("runtime recovery stays bounded and internal-only", () => {
  assert.match(WORKER_SOURCE, /recoverFollowUpTasks\(input\)/);
  assert.match(WORKER_SOURCE, /recoverInboundOperations\(input\)/);
  assert.match(RECOVERY_SCRIPT, /processingTimeoutSeconds/i);
  assert.doesNotMatch(RECOVERY_SCRIPT, /while\s*\(\s*true\s*\)/);
});
