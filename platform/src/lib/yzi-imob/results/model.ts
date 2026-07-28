import type { ResultsFilters, ResultsPeriod, ResultsPeriodPreset } from "./types.ts";

const PERIOD_DAYS: Record<ResultsPeriodPreset, number> = { "7d": 7, "30d": 30, "90d": 90 };

export function parseResultsFilters(input: Record<string, string | string[] | undefined>): ResultsFilters {
  const scalar = (value: string | string[] | undefined) =>
    typeof value === "string" && value.trim() ? value.trim() : null;
  const requestedPeriod = scalar(input.period);
  return {
    period:
      requestedPeriod === "7d" || requestedPeriod === "90d" || requestedPeriod === "30d"
        ? requestedPeriod
        : "30d",
    propertyId: scalar(input.property),
    brokerUserId: scalar(input.broker),
    channel: scalar(input.channel)?.toLowerCase() ?? null,
    status: scalar(input.status)?.toLowerCase() ?? null,
  };
}

export function resolveResultsPeriod(preset: ResultsPeriodPreset, now = new Date()): ResultsPeriod {
  const end = new Date(now);
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - PERIOD_DAYS[preset]);
  return {
    preset,
    start: start.toISOString(),
    end: end.toISOString(),
    label: `Últimos ${PERIOD_DAYS[preset]} dias`,
  };
}
