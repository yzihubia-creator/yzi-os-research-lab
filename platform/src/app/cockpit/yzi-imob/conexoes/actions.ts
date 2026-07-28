"use server";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { revalidatePath } from "next/cache";
import {
  startMetaOAuthAuthorization,
  type StartMetaOAuthInput,
  type StartMetaOAuthResult,
} from "@/lib/yzi-imob/connections/meta-oauth-start";

export async function startMetaOAuthAuthorizationAction(
  input: StartMetaOAuthInput,
): Promise<StartMetaOAuthResult> {
  const supabase = await createServerSupabaseClient();
  return startMetaOAuthAuthorization(supabase, input);
}

export type MetricoolConnectionActionResult =
  | { status: "ok"; connectionStatus: string }
  | {
      status: "error";
      code: "access_denied" | "configuration_required" | "operation_failed";
    };

type MetricoolConnectionRpcClient = {
  rpc(
    fn:
      | "request_yzi_imob_metricool_configuration"
      | "request_yzi_imob_metricool_validation"
      | "disconnect_yzi_imob_metricool_connection",
    args: { p_tenant_id: string },
  ): PromiseLike<{
    data: unknown;
    error: { code?: string } | null;
  }>;
};

export async function requestMetricoolConfigurationAction(): Promise<MetricoolConnectionActionResult> {
  return runMetricoolConnectionAction("request_yzi_imob_metricool_configuration");
}

export async function requestMetricoolValidationAction(): Promise<MetricoolConnectionActionResult> {
  return runMetricoolConnectionAction("request_yzi_imob_metricool_validation");
}

export async function disconnectMetricoolConnectionAction(): Promise<MetricoolConnectionActionResult> {
  return runMetricoolConnectionAction("disconnect_yzi_imob_metricool_connection");
}

async function runMetricoolConnectionAction(
  fn:
    | "request_yzi_imob_metricool_configuration"
    | "request_yzi_imob_metricool_validation"
    | "disconnect_yzi_imob_metricool_connection",
): Promise<MetricoolConnectionActionResult> {
  const tenantContext = await getTenantContext();
  if (tenantContext.status !== "tenant_found") {
    return { status: "error", code: "access_denied" };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const rpcClient: MetricoolConnectionRpcClient = supabase;
    const { data, error } = await rpcClient.rpc(fn, {
      p_tenant_id: tenantContext.tenant.id,
    });
    if (error) {
      return {
        status: "error",
        code: error.code === "55000" ? "configuration_required" : "operation_failed",
      };
    }

    revalidatePath("/cockpit/yzi-imob/conexoes");
    const row = Array.isArray(data) && data[0] && typeof data[0] === "object"
      ? data[0] as Record<string, unknown>
      : null;
    return {
      status: "ok",
      connectionStatus:
        typeof row?.connection_status === "string" ? row.connection_status : "configuration_required",
    };
  } catch {
    return { status: "error", code: "operation_failed" };
  }
}
