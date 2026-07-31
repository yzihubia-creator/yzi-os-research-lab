"use client";

import { useEffect, useMemo } from "react";

import {
  MetricBand,
  StateTag,
  SurfaceBar,
  SurfaceButton,
  SurfaceCanvas,
  SurfaceHeader,
  SurfaceList,
  SurfaceScroller,
  SurfaceSection,
  SurfaceState,
  SurfaceToolbar,
  TYPE,
  cx,
  toneColor,
  type SurfaceMetric,
  type SurfaceTone,
} from "@/components/yzi-imob/yzi-imob-surface-kit";
import { YziInsight } from "@/components/yzi-imob/yzi-imob-yzi-kit";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import {
  describeMetric,
  describeRate,
  splitByMovement,
} from "@/lib/yzi-imob/results/presentation";
import type {
  DataAvailability,
  ResultsAccessState,
  ResultsMetricValue,
  ResultsWorkspaceData,
} from "@/lib/yzi-imob/results/types";

// Resultados — o que aconteceu no período. Não é Radar (o que fazer agora),
// não é Growth OS (onde investir), não é o Início.
//
// Correções desta passagem: a tela deixou de expor nome de tabela, id de fonte,
// nome de fornecedor, nome cru de métrica externa e coluna de banco; os seis
// cards numerados viraram seções com hierarquia; os gráficos só existem onde
// ajudam uma decisão (evolução e distribuição), nunca como enfeite.

const ACCESS_COPY: Record<
  Exclude<ResultsAccessState, "ready">,
  { tone: SurfaceTone; title: string; body: string }
> = {
  no_membership: {
    tone: "idle",
    title: "Sua conta ainda não está ligada a uma operação",
    body: "Conclua a implantação inicial para acompanhar os resultados da sua imobiliária.",
  },
  permission_denied: {
    tone: "pending",
    title: "Seu acesso não inclui esta leitura",
    body: "Peça a quem administra a operação para liberar os resultados para o seu perfil.",
  },
  tenant_error: {
    tone: "attention",
    title: "Não conseguimos identificar sua operação agora",
    body: "Recarregue a página. Nenhum número foi calculado e nada foi alterado.",
  },
  read_error: {
    tone: "attention",
    title: "Não foi possível ler os resultados agora",
    body: "A consulta falhou. Preferimos não mostrar nada a mostrar um número que não é seu.",
  },
};

function formatNumber(value: number | null): string {
  return value === null ? "—" : new Intl.NumberFormat("pt-BR").format(value);
}

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value)}%`;
}

/** Tradução humana da disponibilidade — nunca o valor cru do contrato. */
const AVAILABILITY_COPY: Record<DataAvailability, { tone: SurfaceTone; label: string }> = {
  available: { tone: "ok", label: "Leitura completa" },
  empty: { tone: "idle", label: "Sem movimento no período" },
  partial_data: { tone: "pending", label: "Leitura parcial" },
  unavailable: { tone: "attention", label: "Leitura indisponível" },
  stale_data: { tone: "pending", label: "Dados de uma leitura anterior" },
  configuration_required: { tone: "pending", label: "Aguardando configuração" },
};

const PERIOD_LABEL: Record<string, string> = {
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
};

/**
 * Indicadores do período. O que se moveu ocupa a leitura principal; o que ficou
 * em zero e o que não pôde ser lido continuam visíveis, mas agrupados — sem
 * isso, uma operação nova vira uma parede de zeros idênticos.
 */
function MetricRows({ metrics }: { metrics: readonly ResultsMetricValue[] }) {
  if (!metrics.length) {
    return <p className={TYPE.meta}>Nenhum indicador disponível para este recorte.</p>;
  }

  const { moved, idle, unavailable } = splitByMovement(metrics);

  return (
    <div className="flex flex-col gap-4">
      {moved.length ? (
        <div className="divide-y divide-[color:var(--yzi-border-subtle)]">
          {moved.map((metric) => {
            const copy = describeMetric(metric);
            return (
              <div
                key={metric.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 py-3.5 first:pt-0"
              >
                <div className="min-w-0">
                  <p className={TYPE.itemTitle}>{copy.label}</p>
                  {copy.detail ? (
                    <p className={cx(TYPE.meta, "mt-1 max-w-xl")}>{copy.detail}</p>
                  ) : null}
                </div>
                <span className="shrink-0 text-[1.05rem] font-semibold tabular-nums text-[var(--yzi-text-primary)]">
                  {formatNumber(metric.value)}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {idle.length ? (
        <div className="flex flex-col gap-2">
          <p className={TYPE.label}>Sem movimento no período</p>
          <ul className="flex flex-wrap gap-x-2 gap-y-1.5">
            {idle.map((metric) => (
              <li
                key={metric.id}
                title={describeMetric(metric).detail || undefined}
                className="rounded-full border border-[color:var(--yzi-border-subtle)] px-2.5 py-1 text-[0.7rem] text-[var(--yzi-text-faint)]"
              >
                {describeMetric(metric).label}
                <span className="ml-1.5 tabular-nums">0</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {unavailable.length ? (
        <div className="flex flex-col gap-2">
          <p className={TYPE.label}>Não foi possível ler</p>
          <ul className="flex flex-wrap gap-x-2 gap-y-1.5">
            {unavailable.map((metric) => (
              <li
                key={metric.id}
                className="rounded-full border border-dashed border-[color:var(--yzi-border-subtle)] px-2.5 py-1 text-[0.7rem] text-[var(--yzi-text-faint)]"
              >
                {describeMetric(metric).label}
                <span className="ml-1.5">—</span>
              </li>
            ))}
          </ul>
          <p className={TYPE.meta}>
            Estes números não puderam ser calculados neste recorte. Não saber é
            diferente de ser zero, então eles não entram na conta acima.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** Distribuição — barra proporcional, não pizza decorativa. */
function Distribution({
  items,
  emptyLabel,
}: {
  items: readonly { id: string; label: string; count: number; percentage: number }[];
  emptyLabel: string;
}) {
  if (!items.length) {
    return <p className={TYPE.meta}>{emptyLabel}</p>;
  }

  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="min-w-0 truncate text-[0.8rem] text-[var(--yzi-text-primary)]">
              {item.label}
            </span>
            <span className="shrink-0 text-[0.76rem] tabular-nums text-[var(--yzi-text-secondary)]">
              {formatNumber(item.count)}
              <span className="ml-2 text-[var(--yzi-text-faint)]">
                {formatPercent(item.percentage)}
              </span>
            </span>
          </div>
          <SurfaceBar
            value={item.count}
            total={total}
            label={`${item.label}: ${item.count} de ${total}`}
          />
        </li>
      ))}
    </ul>
  );
}

/** Evolução — colunas simples com rótulo legível, sem biblioteca de gráfico. */
function Trend({ points }: { points: ResultsWorkspaceData["trend"] }) {
  if (!points.length) {
    return (
      <p className={TYPE.meta}>
        Ainda não há períodos suficientes para comparar a evolução.
      </p>
    );
  }

  const max = Math.max(
    1,
    ...points.map((point) =>
      Math.max(point.leads, point.interests, point.conversations, point.appointments),
    ),
  );

  const series = [
    { key: "leads" as const, label: "Leads", tone: "info" as SurfaceTone },
    { key: "conversations" as const, label: "Conversas", tone: "pending" as SurfaceTone },
    { key: "appointments" as const, label: "Visitas", tone: "ok" as SurfaceTone },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {series.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-[0.72rem] text-[var(--yzi-text-secondary)]">
            <span
              aria-hidden
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: toneColor(item.tone, 0.85) }}
            />
            {item.label}
          </li>
        ))}
      </ul>

      <SurfaceScroller label="Evolução do período">
        <div className="flex min-w-full items-end gap-3">
          {points.map((point) => (
            <div key={point.label} className="flex min-w-[52px] flex-1 flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end justify-center gap-1">
                {series.map((item) => {
                  const value = point[item.key];
                  return (
                    <span
                      key={item.key}
                      title={`${item.label}: ${formatNumber(value)}`}
                      className="w-2.5 rounded-t-sm"
                      style={{
                        height: `${Math.max(2, (value / max) * 100)}%`,
                        backgroundColor: toneColor(item.tone, 0.8),
                      }}
                    />
                  );
                })}
              </div>
              <span className="whitespace-nowrap text-[0.64rem] text-[var(--yzi-text-faint)]">
                {point.label}
              </span>
            </div>
          ))}
        </div>
      </SurfaceScroller>

      <SurfaceScroller label="Evolução do período em números">
        <table className="w-full min-w-[420px] border-collapse text-left">
          <caption className="sr-only">
            Leads, conversas e visitas por período
          </caption>
          <thead>
            <tr className="border-b border-[color:var(--yzi-border-subtle)]">
              <th scope="col" className={cx(TYPE.label, "py-2 pr-4 font-medium")}>
                Período
              </th>
              {series.map((item) => (
                <th
                  key={item.key}
                  scope="col"
                  className={cx(TYPE.label, "py-2 pr-4 text-right font-medium")}
                >
                  {item.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.label} className="border-b border-[color:var(--yzi-border-subtle)] last:border-b-0">
                <th scope="row" className="py-2 pr-4 text-[0.76rem] font-normal text-[var(--yzi-text-secondary)]">
                  {point.label}
                </th>
                {series.map((item) => (
                  <td
                    key={item.key}
                    className="py-2 pr-4 text-right text-[0.76rem] tabular-nums text-[var(--yzi-text-primary)]"
                  >
                    {formatNumber(point[item.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </SurfaceScroller>
    </div>
  );
}

/**
 * Desempenho do conteúdo publicado. O executor externo que coleta as métricas
 * nunca é nomeado: o gestor vê "publicação" e "alcance", não fornecedor.
 */
function ContentPerformance({ data }: { data: ResultsWorkspaceData }) {
  const { social } = data;

  if (social.availability === "configuration_required") {
    return (
      <SurfaceState
        tone="pending"
        title="Desempenho das publicações ainda não está ligado"
        body="Suas publicações continuam sendo registradas normalmente. O alcance e a interação só aparecem depois que a medição de redes for concluída em Conexões."
        action={{ label: "Concluir em Conexões", href: "/cockpit/yzi-imob/conexoes" }}
      />
    );
  }

  if (social.availability === "unavailable") {
    return (
      <SurfaceState
        tone="attention"
        title="Não foi possível ler o desempenho das publicações"
        body="A medição de redes não respondeu nesta consulta. Os números de publicação abaixo continuam válidos."
      />
    );
  }

  if (!social.metrics.length) {
    return (
      <SurfaceState
        tone="idle"
        title="Nenhuma medição coletada neste período"
        body="A medição está ativa, mas ainda não recebeu números para as publicações deste recorte."
      />
    );
  }

  // Agrega por rede: uma leitura por canal, não uma lista crua de métricas.
  const byNetwork = new Map<string, number>();
  for (const metric of social.metrics) {
    const key = metric.network === "instagram" ? "Instagram" : "Facebook";
    byNetwork.set(key, (byNetwork.get(key) ?? 0) + metric.value);
  }

  return (
    <div className="flex flex-col gap-4">
      <Distribution
        items={[...byNetwork.entries()].map(([label, count]) => {
          const total = [...byNetwork.values()].reduce((sum, value) => sum + value, 0);
          return {
            id: label,
            label,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
          };
        })}
        emptyLabel="Sem medição por canal neste período."
      />
      <p className={TYPE.meta}>
        Números somados das publicações do período. Cada canal mede interação de
        um jeito próprio, então compare a evolução de um canal com ele mesmo.
      </p>
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

  const headline = useMemo(() => {
    if (!data) return null;
    const leads = data.summary.operation.find((metric) => metric.id === "period-leads");
    const appointments = data.summary.commercial.find((metric) =>
      metric.id.includes("appointment"),
    );
    const conversionRate = data.rates[0] ?? null;
    return { leads, appointments, conversionRate };
  }, [data]);

  useEffect(() => {
    select({
      name: "Resultados",
      subtitle: data ? data.period.label : "Sem leitura disponível",
      statusLabel: data
        ? AVAILABILITY_COPY[data.availability].label
        : "Leitura indisponível",
      situation: data
        ? `Leitura de ${data.period.label.toLowerCase()} para ${data.tenantLabel}.`
        : "Os resultados não puderam ser lidos agora.",
      pendencies: data ? [...data.omittedBlocks] : [],
      checklist: [],
      score: 0,
      scoreLabel: "",
      nextAction: data
        ? "Compare o período atual com o anterior antes de mudar a operação."
        : "Recarregue a página para tentar a leitura novamente.",
      suggestions: [],
      history: [],
    });
  }, [data, select]);

  if (!data) {
    const copy =
      accessState === "ready" ? ACCESS_COPY.read_error : ACCESS_COPY[accessState];
    return (
      <SurfaceCanvas width="wide">
        <SurfaceHeader
          kicker="Inteligência"
          title="Resultados"
          lead="O que aconteceu na sua operação no período — leads, visitas, imóveis e canais."
        />
        <SurfaceState tone={copy.tone} title={copy.title} body={copy.body} />
      </SurfaceCanvas>
    );
  }

  const availability = AVAILABILITY_COPY[data.availability];

  // A faixa do topo prioriza o que se moveu: um painel de quatro zeros nao
  // ajuda ninguem a decidir. Se nada se moveu, ela mostra o panorama honesto.
  const { moved: movedOperation } = splitByMovement(data.summary.operation);
  const bandSource = (movedOperation.length ? movedOperation : data.summary.operation).slice(0, 4);
  const metrics: SurfaceMetric[] = bandSource.map((metric) => {
    const copy = describeMetric(metric);
    return {
      label: copy.label,
      value: formatNumber(metric.value),
      detail:
        metric.availability === "available"
          ? copy.detail
          : AVAILABILITY_COPY[metric.availability].label,
    };
  });

  return (
    <SurfaceCanvas width="wide">
      <SurfaceHeader
        kicker="Inteligência"
        title="Resultados"
        lead="O que aconteceu na sua operação no período — leads, visitas, imóveis e canais."
        secondaryActions={[{ label: "Ver o que fazer agora", href: "/cockpit/yzi-imob/radar" }]}
        aside={
          <div className="flex flex-wrap items-center gap-3">
            <StateTag tone={availability.tone} label={availability.label} />
            <span className={TYPE.meta}>
              {PERIOD_LABEL[data.filters.period] ?? data.period.label}
            </span>
          </div>
        }
      />

      {metrics.length ? <MetricBand metrics={metrics} /> : null}

      <SurfaceToolbar>
        <form method="get" className="grid w-full grid-cols-2 gap-2 lg:grid-cols-6">
          <label className="sr-only" htmlFor="results-period">
            Período
          </label>
          <select
            id="results-period"
            name="period"
            defaultValue={data.filters.period}
            className="yzi-field"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>

          <label className="sr-only" htmlFor="results-property">
            Imóvel
          </label>
          <select
            id="results-property"
            name="property"
            defaultValue={data.filters.propertyId ?? ""}
            className="yzi-field"
          >
            <option value="">Todos os imóveis</option>
            {data.filterOptions.properties.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="results-broker">
            Corretor
          </label>
          <select
            id="results-broker"
            name="broker"
            defaultValue={data.filters.brokerUserId ?? ""}
            className="yzi-field"
          >
            <option value="">Todos os corretores</option>
            {data.filterOptions.brokers.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="results-channel">
            Canal de origem
          </label>
          <select
            id="results-channel"
            name="channel"
            defaultValue={data.filters.channel ?? ""}
            className="yzi-field"
          >
            <option value="">Todos os canais</option>
            {data.filterOptions.channels.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="results-status">
            Situação
          </label>
          <select
            id="results-status"
            name="status"
            defaultValue={data.filters.status ?? ""}
            className="yzi-field"
          >
            <option value="">Todas as situações</option>
            {data.filterOptions.statuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <SurfaceButton action={{ label: "Aplicar" }} kind="primary" type="submit" />
        </form>
      </SurfaceToolbar>

      {data.isEmpty ? (
        <SurfaceState
          tone="idle"
          title="Nenhum movimento neste recorte"
          body="A leitura funcionou, mas não houve leads, visitas ou publicações com esses filtros. Amplie o período ou remova um filtro."
        />
      ) : (
        headline?.leads?.value != null && (
          <YziInsight
            context={PERIOD_LABEL[data.filters.period] ?? data.period.label}
            headline={`${formatNumber(headline.leads.value)} ${headline.leads.value === 1 ? "lead entrou" : "leads entraram"} no período.`}
            reading={
              headline.appointments?.value != null && headline.appointments.value > 0
                ? `Desses, ${formatNumber(headline.appointments.value)} chegaram a visita agendada. O caminho até a visita é onde a operação ganha ou perde.`
                : "Nenhum deles chegou a visita agendada ainda. O interesse existe, mas ainda não virou encontro."
            }
            evidence={data.rates
              .slice(0, 3)
              .map(
                (rate) =>
                  `${describeRate(rate.id, rate.label)}: ${formatPercent(rate.value)}`,
              )}
            recommendation={
              headline.appointments?.value
                ? "Compare este período com o anterior antes de mudar a operação: uma queda de leads com visitas estáveis é um problema diferente do inverso."
                : "Vale revisar o tempo de primeira resposta no Atendimento — leads que esperam raramente marcam visita."
            }
            analysisHref="/cockpit/yzi-imob/radar"
            analysisLabel="Ver sinais abertos"
          />
        )
      )}

      <SurfaceSection
        first
        title="Movimento do período"
        description="Os números principais da operação no recorte selecionado."
      >
        <SurfaceList>
          <div className="py-1">
            <MetricRows metrics={data.summary.operation} />
          </div>
        </SurfaceList>
      </SurfaceSection>

      {data.trend.length ? (
        <SurfaceSection
          title="Evolução"
          description="Como leads, conversas e visitas se moveram ao longo do período."
        >
          <Trend points={data.trend} />
        </SurfaceSection>
      ) : null}

      <SurfaceSection
        title="Onde os leads nasceram"
        description="Origem e temperatura dos leads que entraram no período."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className={TYPE.itemTitle}>Canal de origem</h3>
            <Distribution
              items={data.leadSources}
              emptyLabel="Nenhum lead com origem registrada neste período."
            />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className={TYPE.itemTitle}>Temperatura</h3>
            <Distribution
              items={data.leadTemperatures}
              emptyLabel="Nenhum lead classificado neste período."
            />
          </div>
        </div>
      </SurfaceSection>

      <SurfaceSection
        title="Atendimento e comercial"
        description="O que a equipe conseguiu conduzir depois que o lead entrou."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className={TYPE.itemTitle}>Atendimento</h3>
            <MetricRows metrics={data.summary.service} />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className={TYPE.itemTitle}>Corretores e visitas</h3>
            <MetricRows metrics={data.summary.commercial} />
          </div>
        </div>
      </SurfaceSection>

      <SurfaceSection
        title="Conteúdo publicado"
        description="O que saiu para o público no período e como foi recebido."
      >
        <div className="flex flex-col gap-5">
          <MetricRows metrics={data.summary.content} />
          <ContentPerformance data={data} />
        </div>
      </SurfaceSection>

      {data.bottlenecks.length ? (
        <SurfaceSection
          title="Onde a operação travou"
          description="Pontos em que leads e visitas pararam de avançar no período."
        >
          <SurfaceList>
            <div className="py-1">
              <MetricRows metrics={data.bottlenecks} />
            </div>
          </SurfaceList>
        </SurfaceSection>
      ) : null}

      {data.availability !== "available" ? (
        <SurfaceState
          compact
          tone={availability.tone}
          title={
            data.availability === "partial_data"
              ? "Parte da leitura ficou de fora"
              : availability.label
          }
          body={
            data.omittedBlocks.length
              ? "Alguns blocos não puderam ser calculados neste recorte e por isso não aparecem acima. Nada foi estimado para preencher o espaço."
              : "Alguns números podem estar incompletos neste recorte. Nada foi estimado para preencher o espaço."
          }
        />
      ) : null}
    </SurfaceCanvas>
  );
}
