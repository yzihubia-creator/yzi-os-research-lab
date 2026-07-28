import type { ConnectionEntry } from "./types";

const PRIMARY_CONNECTION_IDS = new Set([
  "meta",
  "metricool",
  "site",
  "google-search-console",
  "google-analytics",
  "google-business-profile",
  "google-ads",
]);

type ConnectionSummaryMetric = {
  connected: number;
  deploying: number;
  upcoming: number;
  attention: number;
};

export function isPrimaryConnectionSummaryEntry(entry: ConnectionEntry): boolean {
  return PRIMARY_CONNECTION_IDS.has(entry.id);
}

export function summarizeConnectionMetrics(catalog: ConnectionEntry[]): ConnectionSummaryMetric {
  const summary: ConnectionSummaryMetric = {
    connected: 0,
    deploying: 0,
    upcoming: 0,
    attention: 0,
  };

  for (const entry of catalog) {
    if (!isPrimaryConnectionSummaryEntry(entry)) continue;

    switch (entry.state) {
      case "conectado":
        summary.connected += 1;
        break;
      case "parcialmente-conectado":
        summary.connected += 1;
        summary.deploying += 1;
        break;
      case "em-configuracao":
      case "aguardando-autorizacao":
        summary.deploying += 1;
        break;
      case "nao-configurado":
      case "em-breve":
        summary.upcoming += 1;
        break;
      case "requer-atencao":
        summary.attention += 1;
        break;
    }
  }

  return summary;
}

export function countActiveConnections(catalog: ConnectionEntry[]): number {
  return summarizeConnectionMetrics(catalog).connected;
}

export function countAwaitingAuthorization(catalog: ConnectionEntry[]): number {
  return summarizeConnectionMetrics(catalog).deploying;
}

export function countNotConfigured(catalog: ConnectionEntry[]): number {
  return summarizeConnectionMetrics(catalog).upcoming;
}

export function countNeedsAttention(catalog: ConnectionEntry[]): number {
  return summarizeConnectionMetrics(catalog).attention;
}

export function formatConnectionQuantity(count: number): string {
  return count === 1 ? "1 conexão" : `${count} conexões`;
}

export function topOperationalImpacts(catalog: ConnectionEntry[], limit: number): string[] {
  const impacts: string[] = [];
  for (const entry of catalog) {
    if (entry.priority !== "essencial") continue;
    if (entry.state === "conectado" || entry.state === "em-breve") continue;
    const [firstImpact] = entry.impact;
    if (firstImpact) impacts.push(firstImpact);
    if (impacts.length >= limit) break;
  }
  return impacts;
}
