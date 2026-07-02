import type { ComponentType, ReactNode, SVGProps } from "react";

import { YziBadge, YziPanel, YziStatusBadge } from "@/components/yzi-os/yzi-primitives";

// Kit de dashboard premium do YZI OS v0.1. Todo componente é genérico —
// recebe valor/label/nível por prop, não fabrica métrica de cliente. Onde a
// referência visual pedia número real (receita, usuário, invoice), o
// componente aceita string/qualitativo e quem chama decide o conteúdo.

export { YziStatusBadge as YziStatusPill };

export type DeltaTone = "positive" | "negative" | "neutral";

const DELTA_TONE_CLASS: Record<DeltaTone, string> = {
  positive:
    "text-[var(--yzi-accent-opportunity)] bg-[var(--yzi-accent-opportunity-soft)]",
  negative: "text-[var(--yzi-state-blocked)] bg-[var(--yzi-state-blocked-soft)]",
  neutral: "text-[var(--yzi-text-secondary)] bg-[var(--yzi-surface-elevated)]",
};

const DELTA_DOT_CLASS: Record<DeltaTone, string> = {
  positive: "bg-[var(--yzi-accent-opportunity)]",
  negative: "bg-[var(--yzi-state-blocked)]",
  neutral: "bg-[var(--yzi-text-faint)]",
};

/**
 * 10. YziDelta — chip de variação (positivo/negativo/neutro). O texto vem
 * de `label`, sempre fornecido por quem chama — o componente não calcula
 * nem inventa percentual.
 */
export function YziDelta({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: DeltaTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.68rem] font-semibold tabular-nums ${DELTA_TONE_CLASS[tone]}`}
    >
      {label}
    </span>
  );
}

/**
 * 1. YziKpiCard — card de métrica grande (valor + delta opcional).
 */
export function YziKpiCard({
  label,
  value,
  deltaLabel,
  deltaTone = "neutral",
  caption,
  icon: Glyph,
}: {
  label: string;
  value: string;
  deltaLabel?: string;
  deltaTone?: DeltaTone;
  caption?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <YziPanel className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-1.5 text-[var(--yzi-text-secondary)]">
        {Glyph ? <Glyph className="h-3.5 w-3.5 shrink-0" /> : null}
        <span className="text-[0.66rem] font-medium uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums tracking-tight text-[var(--yzi-text-primary)]">
          {value}
        </span>
        {deltaLabel ? <YziDelta label={deltaLabel} tone={deltaTone} /> : null}
      </div>
      {caption ? (
        <span className="text-[0.66rem] text-[var(--yzi-text-faint)]">{caption}</span>
      ) : null}
    </YziPanel>
  );
}

export type OverviewKpi = {
  id: string;
  label: string;
  value: string;
  deltaLabel?: string;
  deltaTone?: DeltaTone;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

/**
 * 2. YziOverviewStrip — faixa horizontal de KPIs, separados por divisor
 * vertical em vez de cards isolados (leitura em uma linha só).
 */
export function YziOverviewStrip({
  title,
  kpis,
  rightSlot,
}: {
  title?: string;
  kpis: OverviewKpi[];
  rightSlot?: ReactNode;
}) {
  return (
    <YziPanel className="flex flex-col gap-4 p-4">
      {title || rightSlot ? (
        <div className="flex items-center justify-between gap-3">
          {title ? (
            <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {rightSlot}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Glyph = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="flex flex-col gap-1.5 border-l border-[color:var(--yzi-border-subtle)] pl-4 first:border-l-0 first:pl-0"
            >
              <span className="flex items-center gap-1.5 text-[0.64rem] font-medium uppercase tracking-[0.12em] text-[var(--yzi-text-secondary)]">
                {Glyph ? <Glyph className="h-3 w-3 shrink-0" /> : null}
                {kpi.label}
              </span>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-xl font-semibold tabular-nums tracking-tight text-[var(--yzi-text-primary)]">
                  {kpi.value}
                </span>
                {kpi.deltaLabel ? (
                  <YziDelta label={kpi.deltaLabel} tone={kpi.deltaTone} />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </YziPanel>
  );
}

function Sparkline({ points, tone = "neutral" }: { points: number[]; tone?: DeltaTone }) {
  const width = 100;
  const height = 32;

  if (points.length < 2) return null;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((point, index) => ({
    x: index * stepX,
    y: height - ((point - min) / range) * height,
  }));
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const stroke =
    tone === "positive"
      ? "var(--yzi-accent-opportunity)"
      : tone === "negative"
        ? "var(--yzi-state-blocked)"
        : "var(--yzi-accent-trust)";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-8 w-full" aria-hidden>
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 3. YziMiniTrendCard — card pequeno com mini sparkline. `points` é sempre
 * fornecido por quem chama e a badge "preview" fica fixa, porque uma linha
 * de tendência é fácil de confundir com dado real.
 */
export function YziMiniTrendCard({
  title,
  value,
  deltaLabel,
  deltaTone = "neutral",
  points,
  caption,
}: {
  title: string;
  value: string;
  deltaLabel?: string;
  deltaTone?: DeltaTone;
  points: number[];
  caption?: string;
}) {
  return (
    <YziPanel className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--yzi-text-secondary)]">
          {title}
        </span>
        <YziBadge tone="preview" className="normal-case">
          preview
        </YziBadge>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold tabular-nums text-[var(--yzi-text-primary)]">
          {value}
        </span>
        {deltaLabel ? <YziDelta label={deltaLabel} tone={deltaTone} /> : null}
      </div>
      <Sparkline points={points} tone={deltaTone} />
      {caption ? (
        <span className="text-[0.64rem] text-[var(--yzi-text-faint)]">{caption}</span>
      ) : null}
    </YziPanel>
  );
}

export type ProgressLevel = "low" | "medium" | "high" | "full";
export type ProgressTone = "neutral" | "positive" | "warning" | "danger" | "brand";

const PROGRESS_LEVEL_FRACTION: Record<ProgressLevel, number> = {
  low: 0.25,
  medium: 0.5,
  high: 0.75,
  full: 1,
};

const PROGRESS_TONE_FILL: Record<ProgressTone, string> = {
  neutral: "bg-[var(--yzi-text-faint)]",
  positive: "bg-[var(--yzi-accent-opportunity)]",
  warning: "bg-[var(--yzi-accent-risk)]",
  danger: "bg-[var(--yzi-state-blocked)]",
  brand: "bg-[var(--yzi-accent-action)]",
};

const PROGRESS_SIZE_HEIGHT: Record<"sm" | "md" | "lg", string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

/**
 * 4. YziProgressBar — barra qualitativa (low/medium/high/full). A largura
 * vem de um nível fixo, nunca de um número de progresso real recebido
 * como prop — não existe caminho para passar porcentagem fake.
 */
export function YziProgressBar({
  label,
  valueLabel,
  level,
  tone = "neutral",
  size = "md",
  insideLabel,
}: {
  label: string;
  valueLabel?: string;
  level: ProgressLevel;
  tone?: ProgressTone;
  size?: "sm" | "md" | "lg";
  insideLabel?: string;
}) {
  const fraction = PROGRESS_LEVEL_FRACTION[level];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-[var(--yzi-text-secondary)]">{label}</span>
        {valueLabel ? (
          <span className="font-medium tabular-nums text-[var(--yzi-text-primary)]">{valueLabel}</span>
        ) : null}
      </div>
      <div
        className={`relative w-full overflow-hidden rounded-full bg-[var(--yzi-border-strong)] ${PROGRESS_SIZE_HEIGHT[size]}`}
      >
        <div
          className={`h-full rounded-full ${PROGRESS_TONE_FILL[tone]}`}
          style={{ width: `${fraction * 100}%` }}
        />
        {insideLabel ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[0.6rem] font-medium text-[var(--yzi-text-primary)]">
            {insideLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export type SegmentedTab = { id: string; label: string };

/**
 * 5. YziSegmentedTabs — tabs puramente visuais (`<span>`, não `<button>`).
 * Só marca qual está "ativa" via `activeId`; não controla estado real.
 */
export function YziSegmentedTabs({
  tabs,
  activeId,
}: {
  tabs: SegmentedTab[];
  activeId?: string;
}) {
  const resolvedActiveId = activeId ?? tabs[0]?.id;

  return (
    <div className="inline-flex items-center gap-1 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-1">
      {tabs.map((tab) => (
        <span
          key={tab.id}
          className={`rounded-[var(--yzi-radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors ${
            tab.id === resolvedActiveId
              ? "bg-[var(--yzi-surface-elevated)] text-[var(--yzi-text-primary)]"
              : "text-[var(--yzi-text-secondary)]"
          }`}
        >
          {tab.label}
        </span>
      ))}
    </div>
  );
}

/**
 * 6. YziFilterButton — botão visual de filtro, sem `onClick` nem estado.
 */
export function YziFilterButton({
  label,
  icon: Glyph,
}: {
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-1.5 text-xs font-medium text-[var(--yzi-text-secondary)]">
      {Glyph ? <Glyph className="h-3.5 w-3.5" /> : null}
      {label}
    </span>
  );
}

/**
 * 7. YziChartPanel — wrapper premium genérico (título, caption, slot à
 * direita, tabs opcionais). Diferente de `YziChartCard` (yzi-charts.tsx),
 * que já embute a badge "estrutura · sem dado real" fixa para gráfico —
 * aqui quem chama decide o que vai no `rightSlot`.
 */
export function YziChartPanel({
  title,
  caption,
  rightSlot,
  tabs,
  children,
}: {
  title: string;
  caption?: string;
  rightSlot?: ReactNode;
  tabs?: SegmentedTab[];
  children: ReactNode;
}) {
  return (
    <YziPanel className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            {title}
          </h3>
          {caption ? (
            <p className="text-[0.66rem] text-[var(--yzi-text-faint)]">{caption}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {tabs ? <YziSegmentedTabs tabs={tabs} /> : null}
          {rightSlot}
        </div>
      </div>
      {children}
    </YziPanel>
  );
}

export type DataTableColumn = { key: string; label: string; align?: "left" | "right" };
export type DataTableRow = { id: string; cells: Record<string, ReactNode> };

/**
 * 8. YziDataTable — tabela compacta. Estado vazio honesto por padrão;
 * `rows` fica vazio até existir fonte real conectada em cada tela que usar.
 */
export function YziDataTable({
  columns,
  rows,
  emptyLabel = "Nenhum dado nesta fase",
}: {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  emptyLabel?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)]">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)]">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-3 py-2.5 text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-[var(--yzi-text-secondary)] ${
                  column.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center text-[var(--yzi-text-faint)]"
              >
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[color:var(--yzi-border-subtle)] last:border-b-0"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-3 py-2.5 text-[var(--yzi-text-primary)] ${
                      column.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {row.cells[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export type ActivityItem = {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  tone?: DeltaTone;
};

/**
 * 9. YziActivityFeed — feed vertical de eventos, estado vazio honesto.
 */
export function YziActivityFeed({
  title,
  items,
  emptyLabel = "Nenhuma atividade registrada ainda.",
}: {
  title?: string;
  items: ActivityItem[];
  emptyLabel?: string;
}) {
  return (
    <YziPanel className="flex flex-col gap-3 p-4">
      {title ? (
        <h3 className="text-sm font-semibold text-[var(--yzi-text-primary)]">{title}</h3>
      ) : null}
      {items.length === 0 ? (
        <p className="text-xs text-[var(--yzi-text-faint)]">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex gap-2.5">
              <span
                aria-hidden
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${DELTA_DOT_CLASS[item.tone ?? "neutral"]}`}
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-xs font-medium text-[var(--yzi-text-primary)]">
                  {item.title}
                </span>
                {item.description ? (
                  <span className="text-[0.66rem] text-[var(--yzi-text-secondary)]">
                    {item.description}
                  </span>
                ) : null}
                {item.meta ? (
                  <span className="text-[0.6rem] text-[var(--yzi-text-faint)]">
                    {item.meta}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </YziPanel>
  );
}
