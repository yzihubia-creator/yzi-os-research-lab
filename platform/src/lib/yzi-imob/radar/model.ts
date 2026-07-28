import type {
  RadarSignal,
  RadarSignalCategory,
  RadarSignalSeverity,
  RadarSignalType,
} from "./types.ts";

export type RadarSignalInput = Omit<RadarSignal, "id" | "detectedAt" | "status"> & {
  detectedAt?: string;
};

export function deterministicSignalId(
  tenantId: string,
  type: RadarSignalType,
  entityType: RadarSignal["entityType"],
  entityId: string,
): string {
  return `${tenantId}:${type}:${entityType}:${entityId}`;
}

export function createRadarSignal(input: RadarSignalInput, now = new Date()): RadarSignal {
  return {
    ...input,
    id: deterministicSignalId(input.tenantId, input.type, input.entityType, input.entityId),
    detectedAt: input.detectedAt ?? now.toISOString(),
    status: "active",
    metadata: Object.freeze({ ...input.metadata }),
  };
}

export function parseRadarFilters(input: Record<string, string | string[] | undefined>): {
  category: RadarSignalCategory | null;
  severity: RadarSignalSeverity | null;
} {
  const category = typeof input.category === "string" ? input.category : null;
  const severity = typeof input.severity === "string" ? input.severity : null;
  return {
    category: ["ativo", "lead", "visita", "atendimento", "conexao", "sistema"].includes(category ?? "")
      ? category as RadarSignalCategory
      : null,
    severity: ["info", "attention", "important", "critical"].includes(severity ?? "")
      ? severity as RadarSignalSeverity
      : null,
  };
}
