import type { SupabaseClient } from "@supabase/supabase-js";

export type OperationsObservabilitySnapshot = {
  inboundQueued: number;
  inboundProcessing: number;
  inboundReady: number;
  inboundFailed: number;
  inboundStuck: number;
  outboundFailed: number;
  outboundPendingStatus: number;
  overdueFollowUpTasks: number;
  socialPublishPending: number;
  socialPublishFailed: number;
  socialJobsStuck: number;
  socialMetricsSyncFailedRecent: number;
  latestRunnerExecutions: readonly {
    requestId: string | null;
    status: string;
    failureCode: string | null;
    intentKey: string | null;
    workflowKey: string | null;
    createdAt: string;
  }[];
};

export type OperationsObservabilityResult =
  | { status: "ok"; value: OperationsObservabilitySnapshot }
  | { status: "error"; code: "read_failed"; detail?: string };

type RunnerExecutionRow = {
  request_id: string | null;
  outcome_status: string;
  failure_code: string | null;
  intent_key: string | null;
  workflow_key: string | null;
  created_at: string;
};

export async function getOperationsObservabilitySnapshot(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<OperationsObservabilityResult> {
  const now = new Date();
  const stuckBefore = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
  const recentSocialFailureWindow = new Date(
    now.getTime() - 24 * 60 * 60 * 1000,
  ).toISOString();
  const socialClient = supabase as unknown as SocialObservabilityClient;

  const [
    inboundQueued,
    inboundProcessing,
    inboundReady,
    inboundFailed,
    inboundStuck,
    outboundFailed,
    outboundPendingStatus,
    overdueFollowUpTasks,
    socialPublishPending,
    socialPublishFailed,
    socialJobsStuck,
    socialMetricsSyncFailedRecent,
    runnerExecutions,
  ] = await Promise.all([
    supabase
      .from("yzi_imob_inbound_operation_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("execution_status", "queued"),
    supabase
      .from("yzi_imob_inbound_operation_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("execution_status", "processing"),
    supabase
      .from("yzi_imob_inbound_operation_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("execution_status", "ready"),
    supabase
      .from("yzi_imob_inbound_operation_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("execution_status", "failed"),
    supabase
      .from("yzi_imob_inbound_operation_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("execution_status", "processing")
      .lt("claimed_at", stuckBefore),
    supabase
      .from("yzi_imob_messages")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("direction", "outbound")
      .eq("provider", "meta")
      .eq("channel", "whatsapp")
      .eq("delivery_status", "failed"),
    supabase
      .from("yzi_imob_messages")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("direction", "outbound")
      .eq("provider", "meta")
      .eq("channel", "whatsapp")
      .in("delivery_status", ["pending_dispatch", "accepted", "sent"]),
    supabase
      .from("yzi_imob_follow_up_tasks")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "pending")
      .lt("due_at", now.toISOString()),
    socialClient
      .from("yzi_imob_social_publications")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .in("status", ["queued", "dispatching", "accepted", "scheduled", "publishing"]),
    socialClient
      .from("yzi_imob_social_publications")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "failed"),
    socialClient
      .from("yzi_imob_social_publication_jobs")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "processing")
      .lt("claimed_at", stuckBefore),
    socialClient
      .from("yzi_imob_social_publication_events")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("event_type", "social_metrics_sync_failed")
      .gte("created_at", recentSocialFailureWindow),
    supabase
      .from("yzi_imob_inbound_runner_executions")
      .select("request_id, outcome_status, failure_code, intent_key, workflow_key, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  for (const result of [
    inboundQueued,
    inboundProcessing,
    inboundReady,
    inboundFailed,
    inboundStuck,
    outboundFailed,
    outboundPendingStatus,
    overdueFollowUpTasks,
    socialPublishPending,
    socialPublishFailed,
    socialJobsStuck,
    socialMetricsSyncFailedRecent,
    runnerExecutions,
  ]) {
    if (result.error) {
      return { status: "error", code: "read_failed", detail: result.error.message };
    }
  }

  return {
    status: "ok",
    value: {
      inboundQueued: inboundQueued.count ?? 0,
      inboundProcessing: inboundProcessing.count ?? 0,
      inboundReady: inboundReady.count ?? 0,
      inboundFailed: inboundFailed.count ?? 0,
      inboundStuck: inboundStuck.count ?? 0,
      outboundFailed: outboundFailed.count ?? 0,
      outboundPendingStatus: outboundPendingStatus.count ?? 0,
      overdueFollowUpTasks: overdueFollowUpTasks.count ?? 0,
      socialPublishPending: socialPublishPending.count ?? 0,
      socialPublishFailed: socialPublishFailed.count ?? 0,
      socialJobsStuck: socialJobsStuck.count ?? 0,
      socialMetricsSyncFailedRecent: socialMetricsSyncFailedRecent.count ?? 0,
      latestRunnerExecutions: ((runnerExecutions.data as RunnerExecutionRow[] | null) ?? []).map((row) => ({
        requestId: row.request_id,
        status: row.outcome_status,
        failureCode: row.failure_code,
        intentKey: row.intent_key,
        workflowKey: row.workflow_key,
        createdAt: row.created_at,
      })),
    },
  };
}

type SocialCountQuery = PromiseLike<{
  data: unknown;
  error: { message: string } | null;
  count: number | null;
}> & {
  select(
    columns: string,
    options: { count: "exact"; head: true },
  ): SocialCountQuery;
  eq(column: string, value: unknown): SocialCountQuery;
  in(column: string, values: readonly string[]): SocialCountQuery;
  lt(column: string, value: string): SocialCountQuery;
  gte(column: string, value: string): SocialCountQuery;
};

type SocialObservabilityClient = {
  from(table: string): SocialCountQuery;
};
