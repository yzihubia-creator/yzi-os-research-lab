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
// truncated request id fragment for correlation — never the message body,
// never a phone number, never a full UUID, never a credential.

import { processNextInboundOperation } from "../src/lib/yzi-imob/inbound-operations/processor.ts";

function shortId(id) {
  return typeof id === "string" && id.length > 8 ? `${id.slice(0, 8)}…` : "…";
}

async function main() {
  let outcome;
  try {
    outcome = await processNextInboundOperation();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("configuration is unavailable")) {
      console.log(JSON.stringify({ status: "configuration_missing" }));
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify({ status: "error" }));
    process.exitCode = 1;
    return;
  }

  if (outcome.status === "idle") {
    console.log(JSON.stringify({ status: "idle" }));
    return;
  }

  if (outcome.status === "ready") {
    console.log(
      JSON.stringify({
        status: "ready",
        requestId: shortId(outcome.requestId),
        intentKey: outcome.intentKey,
        workflowKey: outcome.workflowKey,
      }),
    );
    return;
  }

  console.log(
    JSON.stringify({
      status: "failed",
      requestId: shortId(outcome.requestId),
      failureCode: outcome.failureCode,
    }),
  );
}

main();
