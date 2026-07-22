"use client";

import { useEffect, useMemo } from "react";

import {
  GrowthCounterStrip,
  GrowthInspectorPanel,
  GrowthNavigation,
  GrowthSectionCard,
  GrowthSurfaceHeader,
  GrowthTag,
} from "@/components/yzi-imob/growth";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import type {
  ResultsAccessState,
  ResultsDistributionItem,
  ResultsMetric,
  ResultsRate,
  ResultsTrendPoint,
  ResultsWorkspaceData,
} from "@/lib/yzi-imob/results/types";

const ACCESS_COPY: Record<Exclude<ResultsAccessState, "ready">, { title: string; body: string }> = {
  no_membership: {
    title: "Operacao indisponivel",
    body: "Nao encontramos uma imobiliaria vinculada a sua conta. Nenhum tenant foi inventado para preencher a tela.",
  },
  tenant_error: {
    title: "Tenant nao resolvido",
    body: "A leitura foi interrompida antes de consultar as fontes operacionais.",
  },
  read_error: {
    title: "Leitura real indisponivel",
    body: "A consulta aos dados reais falhou. Nenhum mock foi exibido como substituto.",
  },
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatPercent(value: number | null): string {
  if (value === null) return "Sem base";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function metricById(metrics: readonly ResultsMetric[], id: string): ResultsMetric {
  return (
    metrics.find((metric) => metric.id === id) ?? {
      id,
      label: "Sem dados",
      value: 0,
      detail: "Fonte real ausente.",
    }
  );
}

function rateById(rates: readonly ResultsRate[], id: string): ResultsRate | null {
  return rates.find((rate) => rate.id === id) ?? null;
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <section className="yzi-lens flex flex-col gap-2 rounded-[var(--yzi-radius-lg)] p-5">
      <h2 className="text-[1rem] font-semibold text-[var(--yzi-text-primary)]">{title}</h2>
      <p className="max-w-3xl text-[0.82rem] leading-relaxed text-[var(--yzi-text-secondary)]">{body}</p>
    </section>
  );
}

function MetricGrid({ metrics }: { metrics: readonly ResultsMetric[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4 shadow-[var(--yzi-edge-highlight)]"
        >
          <span className="text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[var(--yzi-text-faint)]">
            {metric.label}
          </span>
          <p className="mt-2 text-[1.55rem] font-semibold leading-none text-[var(--yzi-text-primary)] tabular-nums">
            {formatNumber(metric.value)}
          </p>
          <p className="mt-2 text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">{metric.detail}</p>
        </div>
      ))}
    </div>
  );
}

function RateRow({ rate }: { rate: ResultsRate }) {
  const percent = rate.value === null ? 0 : Math.max(0, Math.min(100, rate.value * 100));

  return (
    <div className="flex flex-col gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-[0.86rem] font-medium text-[var(--yzi-text-primary)]">{rate.label}</p>
          <p className="mt-1 text-[0.7rem] text-[var(--yzi-text-faint)]">{rate.formula}</p>
        </div>
        <span className="font-mono text-[1.25rem] font-semibold text-[var(--yzi-text-primary)]">
          {formatPercent(rate.value)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[rgba(var(--imob-graphite),0.2)]">
        <div className="h-full rounded-full bg-[rgba(var(--imob-cyan),0.72)]" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-[0.7rem] text-[var(--yzi-text-secondary)]">
        {formatNumber(rate.numerator)} de {formatNumber(rate.denominator)} registro(s).
      </p>
    </div>
  );
}

function DistributionList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: readonly ResultsDistributionItem[];
  emptyLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[0.78rem] font-semibold text-[var(--yzi-text-primary)]">{title}</h3>
      {items.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3 text-[0.76rem]">
                <span className="min-w-0 truncate text-[var(--yzi-text-secondary)]">{item.label}</span>
                <span className="font-mono text-[var(--yzi-text-primary)]">
                  {formatNumber(item.count)} - {formatPercent(item.percentage)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(var(--imob-graphite),0.2)]">
                <div
                  className="h-full rounded-full bg-[rgba(var(--imob-cold),0.72)]"
                  style={{ width: `${Math.max(3, item.percentage * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">{emptyLabel}</p>
      )}
    </div>
  );
}

function TrendTable({ points }: { points: readonly ResultsTrendPoint[] }) {
  if (points.length === 0) return null;

  const maxValue = Math.max(
    1,
    ...points.map((point) => point.leads + point.interests + point.conversations + point.appointments),
  );

  return (
    <GrowthSectionCard title="Tendencia recente">
      <div className="flex flex-col gap-3">
        {points.map((point) => {
          const total = point.leads + point.interests + point.conversations + point.appointments;
          return (
            <div key={point.label} className="grid grid-cols-[64px_minmax(0,1fr)_48px] items-center gap-3">
              <span className="font-mono text-[0.7rem] text-[var(--yzi-text-faint)]">{point.label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-[rgba(var(--imob-graphite),0.2)]">
                <div
                  className="h-full rounded-full bg-[rgba(var(--imob-cyan),0.72)]"
                  style={{ width: `${Math.max(4, (total / maxValue) * 100)}%` }}
                />
              </div>
              <span className="text-right font-mono text-[0.72rem] text-[var(--yzi-text-secondary)]">
                {formatNumber(total)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Soma semanal de leads, interesses, conversas e agendamentos com timestamp real.
      </p>
    </GrowthSectionCard>
  );
}

function SourceAudit({ data }: { data: ResultsWorkspaceData }) {
  return (
    <GrowthInspectorPanel
      title="Fonte e formula"
      sections={[
        {
          label: "Fontes reais",
          value: data.sources.join(", "),
        },
        {
          label: "Formulas",
          value: (
            <ul className="flex flex-col gap-1.5">
              {data.formulas.map((formula) => (
                <li key={formula}>{formula}</li>
              ))}
            </ul>
          ),
        },
        {
          label: "Omitido",
          value: (
            <ul className="flex flex-col gap-1.5">
              {data.omittedBlocks.map((block) => (
                <li key={block}>{block}</li>
              ))}
            </ul>
          ),
        },
        {
          label: "Isolamento",
          value: "Todas as consultas foram filtradas por tenant_id resolvido na sessao.",
        },
      ]}
      note={
        data.sourceIssues.length > 0
          ? data.sourceIssues.map((issue) => `${issue.sourceLabel}: ${issue.detail}`).join(" ")
          : "Sem LLM, sem fixtures, sem campanhas ou receita inventada."
      }
    />
  );
}

export function YziImobGrowthResultadosV0({
  accessState,
  data,
}: {
  accessState: ResultsAccessState;
  data: ResultsWorkspaceData | null;
}) {
  const { select } = useYziImobWorkspace();

  const counters = useMemo(() => {
    if (!data) {
      return [
        { label: "Leads recebidos", value: "0", detail: "sem leitura real disponivel" },
        { label: "Leads quentes", value: "0", detail: "sem tenant operacional" },
        { label: "Interesses", value: "0", detail: "sem dados carregados" },
        { label: "Conversas", value: "0", detail: "sem dados carregados" },
        { label: "Agendamentos", value: "0", detail: "sem dados carregados" },
      ];
    }

    const leads = metricById(data.metrics, "leads-received");
    const hotLeads = metricById(data.metrics, "hot-leads");
    const interests = metricById(data.metrics, "registered-interests");
    const conversations = metricById(data.metrics, "started-conversations");
    const appointments = metricById(data.metrics, "created-appointments");

    return [leads, hotLeads, interests, conversations, appointments].map((metric) => ({
      label: metric.label,
      value: formatNumber(metric.value),
      detail: metric.detail,
    }));
  }, [data]);

  useEffect(() => {
    const confirmationRate = data ? rateById(data.rates, "appointment-confirmation-rate") : null;
    select({
      name: "Resultados",
      subtitle: "Growth OS - leitura operacional consolidada",
      statusLabel: data ? "Dados reais" : "Sem leitura",
      situation: data
        ? "Resultados consolidados a partir das fontes reais do tenant, sem campanha, receita ou ROI inventado."
        : "Resultados nao foram carregados porque o tenant ou a leitura real nao esta disponivel.",
      pendencies: data ? [...data.omittedBlocks] : ["Resolver tenant e leitura real antes de exibir metricas."],
      checklist: [
        { label: "Tenant resolvido", done: Boolean(data) },
        { label: "Consultas filtradas por tenant_id", done: Boolean(data) },
        { label: "Mocks removidos da tela", done: true },
        { label: "Campanhas e receita omitidas sem fonte", done: true },
      ],
      score:
        confirmationRate?.value === null || confirmationRate?.value === undefined
          ? 0
          : Math.round(confirmationRate.value * 100),
      scoreLabel: "Taxa de confirmacao",
      nextAction: "Ler volume, qualidade e avanco ate agenda com base nas fontes reais disponiveis.",
      suggestions: [
        "Acompanhar origem e temperatura antes de criar novas recomendacoes.",
        "Conectar fonte real de campanhas em outra lane antes de medir midia ou ROI.",
      ],
      history: data ? [...data.sources] : [],
    });
  }, [select, data]);

  const confirmationRate = data ? rateById(data.rates, "appointment-confirmation-rate") : null;
  const attendanceRate = data ? rateById(data.rates, "appointment-attendance-rate") : null;
  const accessCopy =
    accessState === "ready"
      ? {
          title: "Leitura real indisponivel",
          body: "A tela nao recebeu dados reais. Nenhum mock foi exibido como substituto.",
        }
      : ACCESS_COPY[accessState];

  return (
    <section className="yzi-growth-surface flex min-h-full w-full flex-col gap-6 px-4 pb-10 pt-5 sm:px-6 min-[1720px]:px-8">
      <header className="flex w-full flex-col gap-5">
        <div className="flex w-full flex-col gap-4">
          <GrowthSurfaceHeader
            title="Resultados"
            subtitle="Desempenho consolidado da operacao imobiliaria, calculado somente com fontes reais do tenant."
            tenantLabel={data ? `tenant: ${data.tenantLabel}` : "tenant: indisponivel"}
          />

          <GrowthCounterStrip counters={counters} />
        </div>

        <GrowthNavigation active="resultados" />
      </header>

      {!data ? (
        <EmptyPanel title={accessCopy.title} body={accessCopy.body} />
      ) : data.isEmpty ? (
        <EmptyPanel
          title="Nenhum dado operacional encontrado"
          body="As fontes reais foram consultadas para este tenant, mas ainda nao ha imoveis, leads, interesses, conversas ou agendamentos registrados."
        />
      ) : (
        <div className="grid min-h-0 grid-cols-1 gap-4 min-[1760px]:grid-cols-[minmax(0,1fr)_330px]">
          <main className="flex min-w-0 flex-col gap-4">
            <section className="yzi-lens flex flex-col gap-3 rounded-[var(--yzi-radius-lg)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[1.1rem] font-semibold text-[var(--yzi-text-primary)]">
                  Leitura objetiva da operacao
                </h2>
                <GrowthTag>Dados reais</GrowthTag>
              </div>
              <p className="max-w-3xl text-[0.86rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                A tela mostra volume, qualidade de lead e avanco ate agendamento usando tabelas operacionais ja
                existentes. Blocos sem fonte confiavel foram ocultados.
              </p>
            </section>

            <GrowthSectionCard title="Volume e qualidade">
              <MetricGrid metrics={data.metrics} />
            </GrowthSectionCard>

            <GrowthSectionCard title="Avanco ate agenda">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {confirmationRate ? <RateRow rate={confirmationRate} /> : null}
                {attendanceRate && attendanceRate.value !== null ? <RateRow rate={attendanceRate} /> : null}
              </div>
            </GrowthSectionCard>

            <GrowthSectionCard title="Principais origens e temperatura">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DistributionList
                  title="Origem dos leads"
                  items={data.leadSources}
                  emptyLabel="Nenhum lead com origem registrada."
                />
                <DistributionList
                  title="Temperatura dos leads"
                  items={data.leadTemperatures}
                  emptyLabel="Nenhum lead com temperatura registrada."
                />
              </div>
            </GrowthSectionCard>

            <TrendTable points={data.trend} />
          </main>

          <aside className="flex min-w-0 flex-col gap-4">
            <SourceAudit data={data} />
          </aside>
        </div>
      )}
    </section>
  );
}
