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
  DataAvailability,
  ResultsAccessState,
  ResultsMetricValue,
  ResultsWorkspaceData,
} from "@/lib/yzi-imob/results/types";

const ACCESS_COPY: Record<Exclude<ResultsAccessState, "ready">, { title: string; body: string }> = {
  no_membership: {
    title: "Operação indisponível",
    body: "Não encontramos uma imobiliária vinculada a sua conta.",
  },
  permission_denied: {
    title: "Acesso não autorizado",
    body: "Seu papel atual não permite acessar esta leitura.",
  },
  tenant_error: {
    title: "Tenant não resolvido",
    body: "A leitura foi interrompida antes de consultar as fontes operacionais.",
  },
  read_error: {
    title: "Leitura real indisponível",
    body: "A consulta falhou. Nenhum zero ou mock foi exibido como substituto.",
  },
};

function formatNumber(value: number | null): string {
  return value === null ? "—" : new Intl.NumberFormat("pt-BR").format(value);
}

function availabilityLabel(value: DataAvailability): string {
  return {
    available: "Disponível",
    empty: "Sem dados",
    partial_data: "Dados parciais",
    unavailable: "Indisponível",
    stale_data: "Dados desatualizados",
    configuration_required: "Configuração necessária",
  }[value];
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <section className="yzi-lens flex flex-col gap-2 rounded-[var(--yzi-radius-lg)] p-5">
      <h2 className="text-[1rem] font-semibold text-[var(--yzi-text-primary)]">{title}</h2>
      <p className="max-w-3xl text-[0.82rem] leading-relaxed text-[var(--yzi-text-secondary)]">{body}</p>
    </section>
  );
}

function MetricRows({ metrics }: { metrics: readonly ResultsMetricValue[] }) {
  return (
    <div className="divide-y divide-[color:var(--yzi-border-subtle)]">
      {metrics.map((metric) => (
        <div key={metric.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3 first:pt-0 last:pb-0">
          <div>
            <p className="text-[0.82rem] font-medium text-[var(--yzi-text-primary)]">{metric.label}</p>
            <p className="mt-1 text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
              {metric.detail} Fonte: {metric.sourceId}.
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[1.05rem] font-semibold text-[var(--yzi-text-primary)]">
              {formatNumber(metric.value)}
            </p>
            {metric.availability !== "available" ? (
              <p className="mt-1 text-[0.62rem] text-[var(--yzi-text-faint)]">
                {availabilityLabel(metric.availability)}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function Filters({ data }: { data: ResultsWorkspaceData }) {
  return (
    <form method="get" className="grid grid-cols-2 gap-2 lg:grid-cols-6">
      <label className="sr-only" htmlFor="results-period">Período</label>
      <select id="results-period" name="period" defaultValue={data.filters.period} className="yzi-field">
        <option value="7d">7 dias</option>
        <option value="30d">30 dias</option>
        <option value="90d">90 dias</option>
      </select>
      <label className="sr-only" htmlFor="results-property">Imóvel</label>
      <select id="results-property" name="property" defaultValue={data.filters.propertyId ?? ""} className="yzi-field">
        <option value="">Todos os imóveis</option>
        {data.filterOptions.properties.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <label className="sr-only" htmlFor="results-broker">Corretor</label>
      <select id="results-broker" name="broker" defaultValue={data.filters.brokerUserId ?? ""} className="yzi-field">
        <option value="">Todos os corretores</option>
        {data.filterOptions.brokers.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <label className="sr-only" htmlFor="results-channel">Canal</label>
      <select id="results-channel" name="channel" defaultValue={data.filters.channel ?? ""} className="yzi-field">
        <option value="">Todos os canais</option>
        {data.filterOptions.channels.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <label className="sr-only" htmlFor="results-status">Status</label>
      <select id="results-status" name="status" defaultValue={data.filters.status ?? ""} className="yzi-field">
        <option value="">Todos os status</option>
        {data.filterOptions.statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <button type="submit" className="rounded-[var(--yzi-radius-sm)] bg-[var(--yzi-text-primary)] px-4 py-2 text-[0.76rem] font-semibold text-[var(--yzi-surface-base)]">
        Aplicar
      </button>
    </form>
  );
}

function MetricoolBlock({ data }: { data: ResultsWorkspaceData }) {
  if (data.social.availability === "configuration_required") {
    return (
      <EmptyPanel
        title="Aguardando configuração da Metricool"
        body="As publicações internas continuam disponíveis. Métricas externas só aparecerão após configuração e coleta reais."
      />
    );
  }
  if (data.social.availability === "unavailable") {
    return <EmptyPanel title="Métricas externas indisponíveis" body="A fonte Metricool não pôde ser lida nesta sessão." />;
  }
  if (!data.social.metrics.length) {
    return <EmptyPanel title="Nenhuma métrica externa coletada" body="A conexão está disponível, mas não existem métricas persistidas no período." />;
  }
  return (
    <div className="divide-y divide-[color:var(--yzi-border-subtle)]">
      {data.social.metrics.slice(0, 12).map((metric, index) => (
        <div key={`${metric.socialPublicationId}-${metric.providerMetricName}-${index}`} className="flex items-center justify-between gap-4 py-2.5">
          <span className="text-[0.76rem] text-[var(--yzi-text-secondary)]">
            {metric.network} · {metric.normalizedMetricName ?? metric.providerMetricName}
          </span>
          <span className="font-mono text-[0.8rem] text-[var(--yzi-text-primary)]">{formatNumber(metric.value)}</span>
        </div>
      ))}
    </div>
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
  const headline = data?.summary.operation ?? [];
  const counters = useMemo(
    () => headline.slice(0, 5).map((metric) => ({
      label: metric.label,
      value: formatNumber(metric.value),
      detail: metric.availability === "available" ? metric.detail : availabilityLabel(metric.availability),
    })),
    [headline],
  );

  useEffect(() => {
    select({
      name: "Resultados",
      subtitle: "Leitura operacional consolidada",
      statusLabel: data ? availabilityLabel(data.availability) : "Sem leitura",
      situation: data
        ? `${data.period.label}, com filtros aplicados no servidor e fontes tenant-scoped.`
        : "Os dados operacionais não estão disponíveis.",
      pendencies: data ? [...data.omittedBlocks] : ["Resolver a leitura real antes de exibir métricas."],
      checklist: [
        { label: "Tenant resolvido", done: Boolean(data) },
        { label: "Período aplicado no servidor", done: Boolean(data) },
        { label: "Sem métricas simuladas", done: true },
      ],
      score: 0,
      scoreLabel: "Sem score inventado",
      nextAction: "Investigar gargalos com base nas entidades relacionadas.",
      suggestions: [],
      history: data?.sources.map((source) => source.label) ?? [],
    });
  }, [data, select]);

  const accessCopy = accessState === "ready"
    ? { title: "Leitura real indisponível", body: "Nenhum dado foi recebido e nenhum mock foi exibido." }
    : ACCESS_COPY[accessState];

  return (
    <section className="yzi-growth-surface flex min-h-full w-full flex-col gap-6 px-4 pb-10 pt-5 sm:px-6 min-[1720px]:px-8">
      <header className="flex flex-col gap-5">
        <GrowthSurfaceHeader
          title="Resultados"
          subtitle="O que aconteceu na operação, calculado somente com contratos reais."
          tenantLabel={data ? `tenant: ${data.tenantLabel}` : "tenant: indisponível"}
        />
        {data ? <GrowthCounterStrip counters={counters} /> : null}
        <GrowthNavigation active="resultados" />
      </header>

      {!data ? (
        <EmptyPanel title={accessCopy.title} body={accessCopy.body} />
      ) : (
        <div className="flex flex-col gap-4">
          <section className="yzi-lens rounded-[var(--yzi-radius-lg)] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[1rem] font-semibold text-[var(--yzi-text-primary)]">Filtros da leitura</h2>
                <p className="mt-1 text-[0.72rem] text-[var(--yzi-text-secondary)]">{data.period.label}</p>
              </div>
              <GrowthTag>{availabilityLabel(data.availability)}</GrowthTag>
            </div>
            <Filters data={data} />
          </section>

          {data.isEmpty ? (
            <EmptyPanel title="Zero ocorrências no período" body="As fontes foram consultadas com sucesso, mas os filtros não encontraram eventos. Isso não representa indisponibilidade." />
          ) : null}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <GrowthSectionCard title="1. Resumo do período"><MetricRows metrics={data.summary.operation} /></GrowthSectionCard>
            <GrowthSectionCard title="2. Movimento dos imóveis">
              <MetricRows metrics={data.summary.operation.filter((metric) => metric.id.includes("properties") || metric.id.includes("publication"))} />
            </GrowthSectionCard>
            <GrowthSectionCard title="3. Atendimento e leads">
              <MetricRows metrics={[...data.summary.service, ...data.summary.operation.filter((metric) => ["period-leads", "period-interests"].includes(metric.id))]} />
            </GrowthSectionCard>
            <GrowthSectionCard title="4. Corretores e visitas"><MetricRows metrics={data.summary.commercial} /></GrowthSectionCard>
            <GrowthSectionCard title="5. Publicação e conteúdo">
              <MetricRows metrics={data.summary.content} />
              <div className="mt-4 border-t border-[color:var(--yzi-border-subtle)] pt-4"><MetricoolBlock data={data} /></div>
            </GrowthSectionCard>
            <GrowthSectionCard title="6. Gargalos do período"><MetricRows metrics={data.bottlenecks} /></GrowthSectionCard>
          </div>

          {data.operationalHealth.availability === "available" ? (
            <GrowthSectionCard title="Saúde operacional — gestor">
              <MetricRows metrics={[
                { id: "health-inbound", label: "Operações inbound com falha", value: data.operationalHealth.inboundFailed, availability: "available", sourceId: "service", detail: "Snapshot de observabilidade." },
                { id: "health-outbound", label: "Outbound com falha", value: data.operationalHealth.outboundFailed, availability: "available", sourceId: "service", detail: "Snapshot de observabilidade." },
                { id: "health-recovery", label: "Recuperações executadas", value: data.operationalHealth.recoveryExecuted, availability: "available", sourceId: "commercial", detail: "Follow-ups com recovery_count real." },
              ]} />
            </GrowthSectionCard>
          ) : null}

          <GrowthInspectorPanel
            title="Fonte e disponibilidade"
            sections={data.sources.map((item) => ({
              label: item.label,
              value: `${availabilityLabel(item.availability)} · ${item.tables.join(", ")}. ${item.detail}`,
            }))}
            note={data.omittedBlocks.join(" ")}
          />
        </div>
      )}
    </section>
  );
}
