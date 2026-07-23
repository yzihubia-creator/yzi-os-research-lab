// Manual, local-only trigger for the inbound operations consumer.
//
// NOT an endpoint, NOT a cron job, NOT a Next.js route. Runs only when
// invoked directly, from platform/:
//
//   node --conditions=react-server scripts/process-next-inbound-operation.mjs
//
// The --conditions=react-server flag is required because database.ts (and
// its processor.ts caller) import the "server-only" marker package, same as
// every other DB-touching module in this codebase. Next.js resolves that
// package to a no-op under its own server build; plain Node needs the same
// export condition told explicitly, or the import throws by design.
//
// Processes at most one queued yzi_imob_inbound_operation_requests row and
// exits. Output is sanitized: status only (idle | ready | failed), intent
// and workflow keys (already a controlled enum, never free text), and a
// truncated request id fragment for correlation - never the message body,
// never a phone number, never a full UUID, never a credential.

import { runInboundOperationsIteration } from "../src/lib/yzi-imob/inbound-operations/runner.ts";

async function main() {
  const outcome = await runInboundOperationsIteration();
  console.log(JSON.stringify(outcome));
  if (outcome.status === "configuration_missing" || outcome.status === "error") {
    process.exitCode = 1;
  }
}

main();
