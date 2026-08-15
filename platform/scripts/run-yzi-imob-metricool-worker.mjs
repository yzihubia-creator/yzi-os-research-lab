import {
  closeMetricoolRuntimeDatabase,
  runMetricoolWorkerIteration,
} from "../src/lib/yzi-imob/metricool/index.ts";

const MAX_ITERATIONS = 12;

function boundedInteger(rawValue, fallback, maximum) {
  const value = Number.parseInt(rawValue ?? "", 10);
  return Number.isInteger(value) && value > 0 ? Math.min(value, maximum) : fallback;
}

function parseArgs(argv) {
  const args = { iterations: 1, validationLimit: 2, publicationLimit: 5 };
  for (const item of argv) {
    if (item.startsWith("--iterations=")) {
      args.iterations = boundedInteger(item.slice(13), 1, MAX_ITERATIONS);
    } else if (item.startsWith("--validation-limit=")) {
      args.validationLimit = boundedInteger(item.slice(19), 2, 5);
    } else if (item.startsWith("--publication-limit=")) {
      args.publicationLimit = boundedInteger(item.slice(20), 5, 10);
    } else if (item === "--wire-real") {
      args.transportMode = "real";
      args.allowRealTransport = true;
    } else if (item === "--fake") {
      args.transportMode = "fake";
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const results = [];
  try {
    for (let index = 0; index < args.iterations; index += 1) {
      const result = await runMetricoolWorkerIteration(args);
      results.push(result);
      if (result.status === "configuration_missing" || result.status === "error") {
        process.exitCode = 1;
        break;
      }
      if (result.status === "idle") break;
    }
    console.log(JSON.stringify({ status: process.exitCode ? "stopped" : "completed", results }));
  } finally {
    await closeMetricoolRuntimeDatabase();
  }
}

main();
