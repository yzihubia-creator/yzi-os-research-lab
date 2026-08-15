import "server-only";

import { DynamicRegistrationOAuthBroker } from "./oauth-broker";
import { PostgresMcpRepository, PostgresMcpSecretVault } from "./postgres-repository";
import { McpConnectionRuntime } from "./runtime";
import { RemoteHttpMcpTransport } from "./transport";

export function createProductionMcpRuntime(): McpConnectionRuntime {
  const repository = new PostgresMcpRepository();
  const secretVault = new PostgresMcpSecretVault();
  const broker = new DynamicRegistrationOAuthBroker();

  return new McpConnectionRuntime({
    repository,
    secretVault,
    authorizationBrokers: { metricool: broker, higgsfield: broker },
    transportFactory: (connection) => new RemoteHttpMcpTransport({
      endpointKey: connection.endpointKey,
      authorizationHeader: async () => {
        if (!connection.authorizationReference) return null;
        const material = await secretVault.get(connection.authorizationReference);
        return typeof material?.accessToken === "string"
          ? `Bearer ${material.accessToken}`
          : null;
      },
    }),
    allowedCallbackOrigins: [readAppOrigin()],
    executionMode: "real_readonly",
  });
}

export function readMetricoolMcpCallbackUrl(): string {
  return new URL(
    "/api/yzi-imob/connections/metricool/callback",
    readAppOrigin(),
  ).toString();
}

function readAppOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) throw new Error("mcp_app_origin_unavailable");
  const url = new URL(raw);
  const local = url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
  if (url.protocol !== "https:" && !local) throw new Error("mcp_app_origin_invalid");
  return url.origin;
}
