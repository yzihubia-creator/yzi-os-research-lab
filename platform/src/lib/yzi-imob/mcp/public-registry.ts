import "server-only";

import { PostgresMcpRepository } from "./postgres-repository";

export async function mergeMetricoolMcpRegistryRow(
  payload: unknown,
  tenantId: string,
): Promise<unknown> {
  const rows = Array.isArray(payload) ? payload : [];
  try {
    const repository = new PostgresMcpRepository();
    const connection = (await repository.listConnections())
      .filter((item) => item.ownerScope === "tenant" && item.ownerId === tenantId && item.connectionKind === "metricool")
      .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))[0];
    if (!connection) return rows;
    const ready = connection.authState === "authorized" &&
      connection.connectionState === "ready" &&
      connection.healthState === "healthy" &&
      connection.lastDiscoveredAt !== null &&
      connection.capabilitySnapshotVersion > 0;
    return [
      ...rows.filter((row) => !isMetricoolRow(row)),
      {
        id: connection.id,
        tenant_id: tenantId,
        provider: "metricool",
        catalog_id: "metricool",
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
      },
    ];
  } catch {
    return rows;
  }
}

function isMetricoolRow(value: unknown): boolean {
  return Boolean(value && typeof value === "object" && (value as Record<string, unknown>).provider === "metricool");
}
