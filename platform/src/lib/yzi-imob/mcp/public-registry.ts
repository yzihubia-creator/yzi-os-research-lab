import "server-only";

import { PostgresMcpRepository } from "./postgres-repository";
import type { McpConnection, McpConnectionKind } from "./types";

const PUBLIC_MCP_CONNECTION_KINDS = ["metricool", "higgsfield", "canva"] as const satisfies readonly McpConnectionKind[];

export async function mergeMcpRegistryRows(
  payload: unknown,
  tenantId: string,
): Promise<unknown> {
  const rows = Array.isArray(payload) ? payload : [];
  try {
    const repository = new PostgresMcpRepository();
    const connections = (await repository.listConnections())
      .filter((item) =>
        item.ownerScope === "tenant" &&
        item.ownerId === tenantId &&
        PUBLIC_MCP_CONNECTION_KINDS.includes(item.connectionKind as typeof PUBLIC_MCP_CONNECTION_KINDS[number])
      )
      .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
    const newestByKind = new Map<McpConnectionKind, McpConnection>();
    for (const connection of connections) {
      if (!newestByKind.has(connection.connectionKind)) {
        newestByKind.set(connection.connectionKind, connection);
      }
    }
    if (newestByKind.size === 0) return rows;
    return [
      ...rows.filter((row) => !isManagedMcpRow(row)),
      ...Array.from(newestByKind.values(), (connection) => toRegistryRow(connection, tenantId)),
    ];
  } catch {
    return rows;
  }
}

export const mergeMetricoolMcpRegistryRow = mergeMcpRegistryRows;

function toRegistryRow(connection: McpConnection, tenantId: string): Record<string, unknown> {
  const ready = connection.authState === "authorized" &&
    connection.connectionState === "ready" &&
    connection.healthState === "healthy" &&
    connection.lastDiscoveredAt !== null &&
    connection.capabilitySnapshotVersion > 0;
  return {
    id: connection.id,
    tenant_id: tenantId,
    provider: connection.connectionKind,
    catalog_id: connection.connectionKind,
    status: ready ? "active" : connection.connectionState,
    auth_state: connection.authState,
    connection_state: connection.connectionState,
    health_state: connection.healthState,
    granted_scopes: connection.grantedScopes,
    capability_snapshot: connection.capabilitySnapshot,
    display_name: connection.displayName,
    connected_at: connection.lastConnectedAt,
    validated_at: connection.lastDiscoveredAt,
    last_checked_at: connection.lastHealthCheckAt,
    expires_at: connection.expiresAt,
    assets: [],
    pending_publications: 0,
    recent_failures: 0,
  };
}

function isManagedMcpRow(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const provider = (value as Record<string, unknown>).provider;
  return typeof provider === "string" &&
    PUBLIC_MCP_CONNECTION_KINDS.includes(provider as typeof PUBLIC_MCP_CONNECTION_KINDS[number]);
}
