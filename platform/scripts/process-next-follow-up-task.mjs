import { runFollowUpWorkerIteration } from "../src/lib/yzi-imob/follow-up-worker/worker.ts";

async function main() {
  const outcome = await runFollowUpWorkerIteration();
  console.log(JSON.stringify(outcome));
  if (outcome.status === "configuration_missing" || outcome.status === "error") {
    process.exitCode = 1;
  }
}

main();
