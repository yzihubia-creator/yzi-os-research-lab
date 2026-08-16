export type McpConnectionActionResult =
  | { status: "ok"; connectionStatus: string; authorizationUrl?: string }
  | {
      status: "error";
      code: "access_denied" | "configuration_required" | "operation_failed";
    };

export type MetricoolConnectionActionResult = McpConnectionActionResult;

export type MetricoolAccountCandidate = {
  externalUserId: string;
  externalBlogId: string;
  displayName: string;
};

export type MetricoolAccountDiscoveryResult =
  | { status: "ok"; accounts: readonly MetricoolAccountCandidate[] }
  | { status: "error"; code: "access_denied" | "operation_failed" };

export type ConnectionCommand = "configure" | "test" | "disconnect";
