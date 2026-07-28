import type { SupabaseClient } from "@supabase/supabase-js";

import { parseTenantConnectionsRpcPayload } from "@/lib/yzi-imob/connections/persisted-state";

import {
  buildOperationalConsumptionSummary,
  connectionStatusFromPersistedState,
  resolveConsumptionPeriod,
} from "./model";
import type {
  OperationalConnectionResult,
  OperationalConsumptionSummary,
  OperationalCountResult,
} from "./types";

type CountQuery = PromiseLike<{
  data: unknown;
  error: { message?: string } | null;
  count: number | null;
}> & {
  select(columns: string, options: { count: "exact"; head: true }): CountQuery;
  eq(column: string, value: unknown): CountQuery;
  gte(column: string, value: string): CountQuery;
};

type ConsumptionClient = {
  from(table: string): CountQuery;
  rpc(
    fn: "get_yzi_imob_tenant_connections",
    args: { p_tenant_id: string },
  ): PromiseLike<{ data: unknown; error: { message?: string } | null }>;
};

function countResult(
  result: { error: unknown; count: number | null },
  readAt: string,
): OperationalCountResult {
  return result.error
    ? { status: "error" }
    : { status: "ok", count: result.count ?? 0, lastUpdatedAt: readAt };
}

function unavailableConnection(): OperationalConnectionResult {
  return { status: "unavailable", lastUpdatedAt: null, errorCode: null };
}

export async function getOperationalConsumptionSummary(
  supabase: SupabaseClient,
  tenantId: string,
  now = new Date(),
): Promise<OperationalConsumptionSummary> {
  const client = supabase as unknown as ConsumptionClient;
  const period = resolveConsumptionPeriod(now);

  const [connections, outboundMessages, socialPublications, runnerExecutions] =
    await Promise.all([
      client.rpc("get_yzi_imob_tenant_connections", { p_tenant_id: tenantId }),
      client
        .from("yzi_imob_messages")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("direction", "outbound")
        .eq("provider", "meta")
        .eq("channel", "whatsapp")
        .gte("created_at", period.start),
      client
        .from("yzi_imob_social_publications")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .gte("created_at", period.start),
      client
        .from("yzi_imob_inbound_runner_executions")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .gte("created_at", period.start),
    ]);

  let whatsappConnection = unavailableConnection();
  let metricoolConnection = unavailableConnection();

  if (!connections.error) {
    const persisted = parseTenantConnectionsRpcPayload(connections.data);
    const meta = persisted.find((connection) => connection.id === "meta");
    const whatsapp = meta?.assets.find(
      (asset) => asset.kind === "whatsapp_phone_number",
    );
    const metricool = persisted.find((connection) => connection.id === "metricool");

    whatsappConnection = connectionStatusFromPersistedState(
      whatsapp?.status ?? meta?.state ?? "nao-configurado",
      whatsapp?.lastCheckedAt ?? meta?.lastCheckedAt ?? null,
      now,
    );
    metricoolConnection = connectionStatusFromPersistedState(
      metricool?.state ?? "nao-configurado",
      metricool?.lastCheckedAt ?? metricool?.lastSyncAt ?? null,
      now,
    );
  }

  return buildOperationalConsumptionSummary(
    {
      whatsappConnection,
      metricoolConnection,
      outboundMessages: countResult(outboundMessages, period.end),
      socialPublications: countResult(socialPublications, period.end),
      runnerExecutions: countResult(runnerExecutions, period.end),
    },
    now,
  );
}
