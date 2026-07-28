import type {
  OperationalConnectionResult,
  OperationalConsumptionSources,
  OperationalConsumptionSummary,
  OperationalCountResult,
  SystemResourceState,
  SystemResourceStatus,
} from "./types";

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

export function resolveConsumptionPeriod(now = new Date()): SystemResourceState["period"] {
  return {
    start: new Date(now.getTime() - PERIOD_MS).toISOString(),
    end: now.toISOString(),
    label: "Últimos 30 dias",
  };
}

export function connectionStatusFromPersistedState(
  state: string | null,
  lastUpdatedAt: string | null,
  now = new Date(),
): OperationalConnectionResult {
  const stale =
    lastUpdatedAt !== null &&
    Number.isFinite(Date.parse(lastUpdatedAt)) &&
    now.getTime() - Date.parse(lastUpdatedAt) > STALE_AFTER_MS;

  if (["conectado", "active", "connected"].includes(state ?? "")) {
    return {
      status: stale ? "stale" : "available",
      lastUpdatedAt,
      errorCode: null,
    };
  }
  if (["parcialmente-conectado", "validating"].includes(state ?? "")) {
    return { status: "partial", lastUpdatedAt, errorCode: null };
  }
  if (
    [
      "nao-configurado",
      "em-configuracao",
      "aguardando-autorizacao",
      "not_configured",
      "configuration_required",
    ].includes(state ?? "")
  ) {
    return { status: "configuration_required", lastUpdatedAt, errorCode: null };
  }
  if (["requer-atencao", "attention_required", "failed"].includes(state ?? "")) {
    return {
      status: "error",
      lastUpdatedAt,
      errorCode: "connection_attention_required",
    };
  }
  return { status: "unavailable", lastUpdatedAt, errorCode: null };
}

function resourceStatus(
  connection: OperationalConnectionResult | null,
  usage: OperationalCountResult,
): SystemResourceStatus {
  if (connection?.status === "configuration_required") return "configuration_required";
  if (connection?.status === "error") return "error";
  if (usage.status === "error") return connection?.status === "available" ? "partial" : "unavailable";
  if (connection?.status === "stale") return "stale";
  if (connection?.status === "partial") return "partial";
  return "available";
}

function resource(input: {
  provider: SystemResourceState["provider"];
  capability: SystemResourceState["capability"];
  label: string;
  description: string;
  usageUnit: SystemResourceState["usage_unit"];
  source: SystemResourceState["source"];
  actionHref: string;
  period: SystemResourceState["period"];
  connection: OperationalConnectionResult | null;
  usage: OperationalCountResult;
}): SystemResourceState {
  const usageAvailable = input.usage.status === "ok";
  return {
    provider: input.provider,
    capability: input.capability,
    label: input.label,
    description: input.description,
    status: resourceStatus(input.connection, input.usage),
    usage_available: usageAvailable,
    cost_available: false,
    limit_available: false,
    period: input.period,
    usage_value: input.usage.status === "ok" ? input.usage.count : null,
    usage_unit: input.usageUnit,
    cost_value: null,
    currency: null,
    limit_value: null,
    last_updated_at:
      input.usage.status === "ok"
        ? input.usage.lastUpdatedAt ?? input.period.end
        : input.connection?.lastUpdatedAt ?? null,
    source: input.source,
    error_code:
      input.connection?.errorCode ?? (input.usage.status === "error" ? "read_failed" : null),
    action_href: input.actionHref,
    connection_status: input.connection?.status ?? null,
  };
}

export function buildOperationalConsumptionSummary(
  sources: OperationalConsumptionSources,
  now = new Date(),
): OperationalConsumptionSummary {
  const period = resolveConsumptionPeriod(now);
  return {
    generated_at: period.end,
    period,
    financial_consumption_available: false,
    known_costs: [],
    known_limits: [],
    resources: [
      resource({
        provider: "meta_whatsapp",
        capability: "outbound_messages",
        label: "WhatsApp",
        description: "Mensagens outbound registradas pela operação.",
        usageUnit: "messages",
        source: "yzi_imob_messages",
        actionHref: "/cockpit/yzi-imob/atendimento",
        period,
        connection: sources.whatsappConnection,
        usage: sources.outboundMessages,
      }),
      resource({
        provider: "metricool",
        capability: "social_publication",
        label: "Metricool",
        description: "Publicações sociais registradas no fluxo governado.",
        usageUnit: "publications",
        source: "yzi_imob_social_publications",
        actionHref: "/cockpit/yzi-imob/marketing/publicacoes",
        period,
        connection: sources.metricoolConnection,
        usage: sources.socialPublications,
      }),
      resource({
        provider: "yzi_runtime",
        capability: "runner_execution",
        label: "Execuções operacionais",
        description: "Execuções persistidas do runner da operação.",
        usageUnit: "executions",
        source: "yzi_imob_inbound_runner_executions",
        actionHref: "/cockpit/yzi-imob/radar",
        period,
        connection: null,
        usage: sources.runnerExecutions,
      }),
    ],
  };
}
