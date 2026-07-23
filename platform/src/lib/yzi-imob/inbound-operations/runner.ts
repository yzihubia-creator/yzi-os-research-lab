import "server-only";

import { recordInboundRunnerExecution } from "./database.ts";
import { processNextInboundOperation } from "./processor.ts";
import type { FailureCode, IntentKey, WorkflowKey } from "./types.ts";

const CONTROLLED_STATUSES = new Set(["idle", "ready", "failed", "configuration_missing", "error"]);

export type InboundOperationsRunnerStatus =
  | { status: "idle" }
  | { status: "ready"; requestId: string; intentKey: IntentKey; workflowKey: WorkflowKey }
  | { status: "failed"; requestId: string; failureCode: FailureCode }
  | { status: "configuration_missing" }
  | { status: "error" };

function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}...` : id;
}

async function recordRunnerExecutionSafely(input: {
  requestId?: string;
  outcomeStatus: "idle" | "ready" | "failed";
  failureCode?: FailureCode;
  intentKey?: IntentKey;
  workflowKey?: WorkflowKey;
}): Promise<void> {
  try {
    await recordInboundRunnerExecution({
      requestId: input.requestId ?? null,
      outcomeStatus: input.outcomeStatus,
      failureCode: input.failureCode ?? null,
      intentKey: input.intentKey ?? null,
      workflowKey: input.workflowKey ?? null,
    });
  } catch {
    // Observability must never change the operational result.
  }
}

export async function runInboundOperationsIteration(): Promise<InboundOperationsRunnerStatus> {
  try {
    const outcome = await processNextInboundOperation();

    if (outcome.status === "idle") {
      await recordRunnerExecutionSafely({ outcomeStatus: "idle" });
      return { status: "idle" };
    }

    if (outcome.status === "ready") {
      await recordRunnerExecutionSafely({
        requestId: outcome.requestId,
        outcomeStatus: "ready",
        intentKey: outcome.intentKey,
        workflowKey: outcome.workflowKey,
      });
      return {
        status: "ready",
        requestId: shortId(outcome.requestId),
        intentKey: outcome.intentKey,
        workflowKey: outcome.workflowKey,
      };
    }

    await recordRunnerExecutionSafely({
      requestId: outcome.requestId,
      outcomeStatus: "failed",
      failureCode: outcome.failureCode,
    });
    return {
      status: "failed",
      requestId: shortId(outcome.requestId),
      failureCode: outcome.failureCode,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("configuration is unavailable")) {
      return { status: "configuration_missing" };
    }
    return { status: "error" };
  }
}

export function isInboundOperationsRunnerStatus(value: unknown): value is InboundOperationsRunnerStatus {
  if (!value || typeof value !== "object") {
    return false;
  }
  const status = (value as { status?: string }).status;
  return typeof status === "string" && CONTROLLED_STATUSES.has(status);
}
