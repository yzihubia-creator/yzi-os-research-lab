import { runFollowUpWorkerIteration } from "../src/lib/yzi-imob/follow-up-worker/worker.ts";

const DEFAULT_ITERATIONS = 1;
const MAX_ITERATIONS = 60;
const DEFAULT_IDLE_SLEEP_MS = 5000;
const MIN_IDLE_SLEEP_MS = 1000;
const MAX_IDLE_SLEEP_MS = 60000;
const DEFAULT_SYNC_LIMIT = 1;

function parsePositiveInt(rawValue, fallback) {
  const parsed = Number.parseInt(rawValue ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function parseArgs(argv) {
  const args = {
    iterations: DEFAULT_ITERATIONS,
    idleSleepMs: DEFAULT_IDLE_SLEEP_MS,
    syncLimit: DEFAULT_SYNC_LIMIT,
  };
  for (const item of argv) {
    if (item.startsWith("--iterations=")) {
      args.iterations = clamp(parsePositiveInt(item.slice("--iterations=".length), DEFAULT_ITERATIONS), 1, MAX_ITERATIONS);
    } else if (item.startsWith("--idle-sleep-ms=")) {
      args.idleSleepMs = clamp(
        parsePositiveInt(item.slice("--idle-sleep-ms=".length), DEFAULT_IDLE_SLEEP_MS),
        MIN_IDLE_SLEEP_MS,
        MAX_IDLE_SLEEP_MS,
      );
    } else if (item.startsWith("--sync-limit=")) {
      args.syncLimit = clamp(parsePositiveInt(item.slice("--sync-limit=".length), DEFAULT_SYNC_LIMIT), 1, 5);
    }
  }
  return args;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { iterations, idleSleepMs, syncLimit } = parseArgs(process.argv.slice(2));
  const results = [];

  for (let index = 0; index < iterations; index += 1) {
    const outcome = await runFollowUpWorkerIteration({ syncLimit });
    results.push(outcome);

    if (outcome.status === "configuration_missing" || outcome.status === "error") {
      console.log(JSON.stringify({ status: "stopped", iteration: index + 1, outcome }));
      process.exitCode = 1;
      return;
    }

    if (outcome.status === "idle" && index + 1 < iterations) {
      await delay(idleSleepMs);
    }
  }

  console.log(JSON.stringify({ status: "completed", iterations, results }));
}

main();
