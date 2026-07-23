import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const RUNNER_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/inbound-operations/runner.ts", import.meta.url),
  "utf8",
);
const MANUAL_SCRIPT_SOURCE = readFileSync(
  new URL("../scripts/process-next-inbound-operation.mjs", import.meta.url),
  "utf8",
);
const WORKER_SCRIPT_SOURCE = readFileSync(
  new URL("../scripts/run-inbound-operations-worker.mjs", import.meta.url),
  "utf8",
);
const PACKAGE_JSON = readFileSync(new URL("../package.json", import.meta.url), "utf8");

test("runner wraps one iteration and only returns sanitized statuses", () => {
  assert.match(RUNNER_SOURCE, /processNextInboundOperation\(\)/);
  assert.match(RUNNER_SOURCE, /status: "configuration_missing"/);
  assert.match(RUNNER_SOURCE, /status: "error"/);
  assert.match(RUNNER_SOURCE, /requestId: shortId\(outcome\.requestId\)/);
  assert.doesNotMatch(RUNNER_SOURCE, /\.body\b/);
  assert.doesNotMatch(RUNNER_SOURCE, /console\./);
});

test("manual script stays one-shot and exits non-zero only on configuration or unexpected error", () => {
  assert.match(MANUAL_SCRIPT_SOURCE, /runInboundOperationsIteration\(\)/);
  assert.match(MANUAL_SCRIPT_SOURCE, /console\.log\(JSON\.stringify\(outcome\)\)/);
  assert.match(MANUAL_SCRIPT_SOURCE, /configuration_missing/);
  assert.match(MANUAL_SCRIPT_SOURCE, /process\.exitCode = 1/);
});

test("bounded worker never loops forever and sleeps only between idle iterations", () => {
  assert.match(WORKER_SCRIPT_SOURCE, /const DEFAULT_ITERATIONS = 1/);
  assert.match(WORKER_SCRIPT_SOURCE, /const MAX_ITERATIONS = 60/);
  assert.match(WORKER_SCRIPT_SOURCE, /await delay\(idleSleepMs\)/);
  assert.match(WORKER_SCRIPT_SOURCE, /for \(let index = 0; index < iterations; index \+= 1\)/);
  assert.doesNotMatch(WORKER_SCRIPT_SOURCE, /while\s*\(\s*true\s*\)/);
  assert.doesNotMatch(WORKER_SCRIPT_SOURCE, /setInterval\(/);
});

test("package.json exposes the bounded worker command", () => {
  assert.match(PACKAGE_JSON, /"inbound-operations:worker": "node --conditions=react-server scripts\/run-inbound-operations-worker\.mjs"/);
});
