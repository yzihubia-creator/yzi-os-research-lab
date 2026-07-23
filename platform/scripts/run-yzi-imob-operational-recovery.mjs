import { runGovernedOperationalRecovery } from "../src/lib/yzi-imob/follow-up-worker/worker.ts";

function parsePositiveInt(rawValue, fallback) {
  const parsed = Number.parseInt(rawValue ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseArgs(argv) {
  const args = {
    timeoutSeconds: 900,
    limit: 20,
    source: "internal_recovery_worker",
  };
  for (const item of argv) {
    if (item.startsWith("--timeout-seconds=")) {
      args.timeoutSeconds = parsePositiveInt(item.slice("--timeout-seconds=".length), args.timeoutSeconds);
    } else if (item.startsWith("--limit=")) {
      args.limit = parsePositiveInt(item.slice("--limit=".length), args.limit);
    } else if (item.startsWith("--source=")) {
      args.source = item.slice("--source=".length).trim() || args.source;
    }
  }
  return args;
}

async function main() {
  const { timeoutSeconds, limit, source } = parseArgs(process.argv.slice(2));
  const outcome = await runGovernedOperationalRecovery({
    source,
    processingTimeoutSeconds: timeoutSeconds,
    limit,
  });
  console.log(JSON.stringify(outcome));
  if (outcome.status !== "ok") {
    process.exitCode = 1;
  }
}

main();
