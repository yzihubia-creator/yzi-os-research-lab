// Bounded external worker for the inbound operations consumer.
//
// Intended execution patterns:
//
// 1. External scheduler / process manager:
//    node --conditions=react-server scripts/run-inbound-operations-worker.mjs --iterations=12 --idle-sleep-ms=5000
//
// 2. One-shot batch from a terminal:
//    node --conditions=react-server scripts/run-inbound-operations-worker.mjs --iterations=3
//
// This script never runs forever. Each iteration processes at most one
// operation through the existing governed claim -> classify -> select ->
// complete/fail path. Output is sanitized and never includes message bodies,
// phone numbers, payloads, or secrets.

import { runInboundOperationsIteration } from "../src/lib/yzi-imob/inbound-operations/runner.ts";

const DEFAULT_ITERATIONS = 1;
const MAX_ITERATIONS = 60;
const DEFAULT_IDLE_SLEEP_MS = 5000;
const MIN_IDLE_SLEEP_MS = 1000;
const MAX_IDLE_SLEEP_MS = 60000;

function parsePositiveInt(rawValue, fallback) {
  const parsed = Number.parseInt(rawValue ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function parseArgs(argv) {
  const args = { iterations: DEFAULT_ITERATIONS, idleSleepMs: DEFAULT_IDLE_SLEEP_MS };
  for (const item of argv) {
    if (item.startsWith("--iterations=")) {
      args.iterations = clamp(parsePositiveInt(item.slice("--iterations=".length), DEFAULT_ITERATIONS), 1, MAX_ITERATIONS);
    } else if (item.startsWith("--idle-sleep-ms=")) {
      args.idleSleepMs = clamp(
        parsePositiveInt(item.slice("--idle-sleep-ms=".length), DEFAULT_IDLE_SLEEP_MS),
        MIN_IDLE_SLEEP_MS,
        MAX_IDLE_SLEEP_MS,
      );
    }
  }
  return args;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { iterations, idleSleepMs } = parseArgs(process.argv.slice(2));
  const results = [];

  for (let index = 0; index < iterations; index += 1) {
    const outcome = await runInboundOperationsIteration();
    results.push(outcome);

    if (outcome.status === "configuration_missing" || outcome.status === "error") {
      console.log(JSON.stringify({ status: "stopped", iteration: index + 1, outcome }));
      process.exitCode = 1;
      return;
    }

    if (outcome.status === "idle") {
      if (index + 1 < iterations) {
        await delay(idleSleepMs);
      }
      continue;
    }
  }

  console.log(JSON.stringify({ status: "completed", iterations, results }));
}

main();
