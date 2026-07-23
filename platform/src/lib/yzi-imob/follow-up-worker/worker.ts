import "server-only";

import { buildFollowUpWhatsappBody } from "./messages.ts";
import {
  cancelFollowUpTask,
  claimNextFollowUpTask,
  completeFollowUpTask,
  failFollowUpTask,
  getFollowUpTaskContext,
  recoverFollowUpTasks,
  recoverInboundOperations,
  syncFollowUpTasks,
} from "./database.ts";
import { decideFollowUpTask } from "./policy.ts";
import type {
  ClaimedFollowUpTask,
  FollowUpFailureCode,
  FollowUpRecoveryStatus,
  FollowUpTaskContext,
  FollowUpWorkerStatus,
} from "./types.ts";
import type { GovernedMetaWhatsappOutboundResult } from "../connections/meta-whatsapp-server.ts";

export type FollowUpWorkerAdapters = {
  syncTasks(limit: number): Promise<number>;
  claimTask(): Promise<ClaimedFollowUpTask | null>;
  getTaskContext(taskId: string): Promise<FollowUpTaskContext>;
  completeTask(taskId: string): Promise<void>;
  failTask(
    taskId: string,
    failureCode: FollowUpFailureCode,
    retryDelaySeconds: number | null,
  ): Promise<{ attemptCount: number; maxAttempts: number }>;
  cancelTask(taskId: string, reason: string): Promise<void>;
  sendWhatsapp(input: {
    tenantId: string;
    conversationId: string;
    body: string;
    idempotencyKey: string;
  }): Promise<GovernedMetaWhatsappOutboundResult>;
};

function mapOutboundFailure(
  result: Extract<GovernedMetaWhatsappOutboundResult, { status: "error" }>,
): { failureCode: FollowUpFailureCode; retryDelaySeconds: number | null } {
  switch (result.code) {
    case "provider_unavailable":
    case "network_error":
    case "idempotency_in_flight":
      return { failureCode: `outbound_${result.code}` as FollowUpFailureCode, retryDelaySeconds: 300 };
    default:
      return { failureCode: `outbound_${result.code}` as FollowUpFailureCode, retryDelaySeconds: null };
  }
}

export async function runFollowUpWorkerIterationWithAdapters(
  adapters: FollowUpWorkerAdapters,
  input: { now?: Date; syncLimit?: number } = {},
): Promise<FollowUpWorkerStatus> {
  const now = input.now ?? new Date();
  const syncLimit = Math.max(1, Math.min(input.syncLimit ?? 1, 5));
  let synced = 0;

  try {
    synced = await adapters.syncTasks(syncLimit);
    const claimed = await adapters.claimTask();
    if (!claimed) {
      return { status: "idle", synced };
    }

    const context = await adapters.getTaskContext(claimed.taskId);
    const decision = decideFollowUpTask(context, now, buildFollowUpWhatsappBody);

    if (decision.type === "cancel") {
      await adapters.cancelTask(context.taskId, decision.reason);
      return {
        status: "cancelled",
        synced,
        taskId: context.taskId,
        kind: context.kind,
        reason: decision.reason,
      };
    }

    if (decision.type === "fail") {
      const failure = await adapters.failTask(
        context.taskId,
        decision.failureCode,
        decision.retryDelaySeconds,
      );
      if (decision.retryDelaySeconds && failure.attemptCount < failure.maxAttempts) {
        return {
          status: "retry_scheduled",
          synced,
          taskId: context.taskId,
          kind: context.kind,
          failureCode: decision.failureCode,
        };
      }
      return {
        status: "failed",
        synced,
        taskId: context.taskId,
        kind: context.kind,
        failureCode: decision.failureCode,
        terminal: failure.attemptCount >= failure.maxAttempts,
      };
    }

    const outboundResult = await adapters.sendWhatsapp({
      tenantId: context.tenantId,
      conversationId: context.conversationId!,
      body: decision.body,
      idempotencyKey: `follow-up-task:${context.taskId}`,
    });
    if (outboundResult.status !== "accepted") {
      const mapped = mapOutboundFailure(outboundResult);
      const failure = await adapters.failTask(
        context.taskId,
        mapped.failureCode,
        mapped.retryDelaySeconds,
      );
      if (mapped.retryDelaySeconds && failure.attemptCount < failure.maxAttempts) {
        return {
          status: "retry_scheduled",
          synced,
          taskId: context.taskId,
          kind: context.kind,
          failureCode: mapped.failureCode,
        };
      }
      return {
        status: "failed",
        synced,
        taskId: context.taskId,
        kind: context.kind,
        failureCode: mapped.failureCode,
        terminal: failure.attemptCount >= failure.maxAttempts,
      };
    }

    await adapters.completeTask(context.taskId);
    return {
      status: "completed",
      synced,
      taskId: context.taskId,
      kind: context.kind,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("configuration is unavailable")) {
      return { status: "configuration_missing", synced };
    }
    return { status: "error", synced };
  }
}

export async function runFollowUpWorkerIteration(
  input: { now?: Date; syncLimit?: number } = {},
): Promise<FollowUpWorkerStatus> {
  const { sendGovernedMetaWhatsappText } = await import("../connections/meta-whatsapp-server.ts");
  return runFollowUpWorkerIterationWithAdapters(
    {
      syncTasks: syncFollowUpTasks,
      claimTask: claimNextFollowUpTask,
      getTaskContext: getFollowUpTaskContext,
      completeTask: completeFollowUpTask,
      failTask: failFollowUpTask,
      cancelTask: cancelFollowUpTask,
      sendWhatsapp: sendGovernedMetaWhatsappText,
    },
    input,
  );
}

export async function runGovernedOperationalRecovery(input: {
  source: string;
  processingTimeoutSeconds?: number;
  limit?: number;
}): Promise<FollowUpRecoveryStatus> {
  try {
    const [followUpRecovered, inboundRecovered] = await Promise.all([
      recoverFollowUpTasks(input),
      recoverInboundOperations(input),
    ]);
    return { status: "ok", followUpRecovered, inboundRecovered };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("configuration is unavailable")) {
      return { status: "configuration_missing" };
    }
    return { status: "error" };
  }
}
