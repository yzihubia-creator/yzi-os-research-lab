import type { ReactNode } from "react";

import { YziBadge, YziPanel } from "@/components/yzi-os/yzi-primitives";
import type { QualitativeLevel } from "@/components/yzi-os/yzi-visual-primitives";

// Camada de gráficos do YZI OS v0.1. SVG + React puro, sem biblioteca de
// chart. Todo eixo e toda posição vêm de nível qualitativo (baixo/médio/alto)
// ou de contagem estrutural de categorias já definidas no código — nunca de
// número que simule uso, performance ou cliente real.

export type ChartPoint = { label: string; level: QualitativeLevel };

export type DonutSlice = { label: string; level: QualitativeLevel; count: number };

const CHART_WIDTH = 300;
const CHART_HEIGHT = 116;
const PLOT_LEFT = 32;
const PLOT_RIGHT = CHART_WIDTH - 10;
const PLOT_TOP = 12;
const PLOT_BOTTOM = CHART_HEIGHT - 10;

const LEVEL_ORDER: QualitativeLevel[] = ["alto", "médio", "baixo"];

const LEVEL_Y: Record<QualitativeLevel, number> = {
  alto: PLOT_TOP,
  médio: (PLOT_TOP + PLOT_BOTTOM) / 2,
  baixo: PLOT_BOTTOM,
};

const LEVEL_STROKE: Record<QualitativeLevel, string> = {
  baixo: "var(--yzi-accent-opportunity)",
  médio: "var(--yzi-accent-risk)",
  alto: "var(--yzi-state-blocked)",
};

const LEVEL_DOT: Record<QualitativeLevel, string> = {
  baixo: "bg-[var(--yzi-accent-opportunity)]",
  médio: "bg-[var(--yzi-accent-risk)]",
  alto: "bg-[var(--yzi-state-blocked)]",
};

function xForIndex(index: number, count: number) {
  if (count <= 1) return (PLOT_LEFT + PLOT_RIGHT) / 2;
  return PLOT_LEFT + (index * (PLOT_RIGHT - PLOT_LEFT)) / (count - 1);
}

function ChartGrid() {
  return (
    <>
      {LEVEL_ORDER.map((level) => (
        <g key={level}>
          <line
            x1={PLOT_LEFT}
            x2={PLOT_RIGHT}
            y1={LEVEL_Y[level]}
            y2={LEVEL_Y[level]}
            stroke="var(--yzi-border-subtle)"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
          <text
            x={PLOT_LEFT - 6}
            y={LEVEL_Y[level] + 3}
            textAnchor="end"
            fontSize={8}
            className="fill-[var(--yzi-text-faint)]"
          >
            {level}
          </text>
        </g>
      ))}
    </>
  );
}

function ChartXLabels({ points }: { points: ChartPoint[] }) {
  return (
    <div className="flex justify-between px-1">
      {points.map((point) => (
        <span
          key={point.label}
          className="max-w-[4.5rem] truncate text-[0.6rem] text-[var(--yzi-text-faint)]"
        >
          {point.label}
        </span>
      ))}
    </div>
  );
}

/**
 * Card de gráfico: título, badge "estrutura · sem dado real" fixa, o
 * gráfico em si e uma legenda simples opcional.
 */
export function YziChartCard({
  title,
  caption,
  legend,
  children,
}: {
  title: string;
  caption?: string;
  legend?: Array<{ label: string; level: QualitativeLevel }>;
  children: ReactNode;
}) {
  return (
    <YziPanel className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            {title}
          </h3>
          {caption ? (
            <p className="text-[0.66rem] text-[var(--yzi-text-faint)]">
              {caption}
            </p>
          ) : null}
        </div>
        <YziBadge tone="preview" className="shrink-0 normal-case">
          estrutura · sem dado real
        </YziBadge>
      </div>

      {children}

      {legend ? (
        <div className="flex flex-wrap items-center gap-3 border-t border-[color:var(--yzi-border-subtle)] pt-2.5">
          {legend.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-1.5 text-[0.68rem] text-[var(--yzi-text-secondary)]"
            >
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[item.level]}`} />
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
    </YziPanel>
  );
}

/**
 * Line chart conceitual: cada ponto é um nível qualitativo, não uma
 * medição. Grid e eixo Y mostram baixo/médio/alto, nunca número.
 */
export function YziLineChart({ points }: { points: ChartPoint[] }) {
  const coords = points.map((point, index) => ({
    x: xForIndex(index, points.length),
    y: LEVEL_Y[point.level],
  }));
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full">
        <ChartGrid />
        <path
          d={path}
          fill="none"
          stroke="var(--yzi-accent-trust)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c, index) => (
          <circle key={points[index].label} cx={c.x} cy={c.y} r={2.5} fill="var(--yzi-accent-trust)">
            <title>
              {points[index].label}: {points[index].level}
            </title>
          </circle>
        ))}
      </svg>
      <ChartXLabels points={points} />
    </div>
  );
}

/**
 * Area chart conceitual: mesma leitura do line chart, com preenchimento
 * suave só para reforçar a forma do fluxo — sem eixo numérico.
 */
export function YziAreaChart({ points }: { points: ChartPoint[] }) {
  const coords = points.map((point, index) => ({
    x: xForIndex(index, points.length),
    y: LEVEL_Y[point.level],
  }));
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const first = coords[0];
  const last = coords[coords.length - 1];
  const areaPath =
    first && last
      ? `${linePath} L${last.x},${PLOT_BOTTOM} L${first.x},${PLOT_BOTTOM} Z`
      : "";

  return (
    <div className="flex flex-col gap-1.5">
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full">
        <ChartGrid />
        {areaPath ? <path d={areaPath} fill="var(--yzi-accent-action-soft)" stroke="none" /> : null}
        <path
          d={linePath}
          fill="none"
          stroke="var(--yzi-accent-action)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <ChartXLabels points={points} />
    </div>
  );
}

/**
 * Bar chart conceitual: altura da barra vem do nível qualitativo do ponto,
 * colorida pelo próprio nível. Sem número no eixo.
 */
export function YziBarChart({ points }: { points: ChartPoint[] }) {
  const barWidth = 18;

  return (
    <div className="flex flex-col gap-1.5">
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full">
        <ChartGrid />
        {points.map((point, index) => {
          const x = xForIndex(index, points.length) - barWidth / 2;
          const y = LEVEL_Y[point.level];
          return (
            <rect
              key={point.label}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(PLOT_BOTTOM - y, 2)}
              rx={2}
              fill={LEVEL_STROKE[point.level]}
            >
              <title>
                {point.label}: {point.level}
              </title>
            </rect>
          );
        })}
      </svg>
      <ChartXLabels points={points} />
    </div>
  );
}

/**
 * Donut chart de distribuição: conta quantas categorias já definidas no
 * produto caem em cada nível — contagem estrutural do código, não volume
 * de uso ou métrica de cliente.
 */
export function YziDonutChart({ slices }: { slices: DonutSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0 -rotate-90">
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke="var(--yzi-border-subtle)"
          strokeWidth={12}
        />
        {total > 0
          ? slices.map((slice) => {
              const fraction = slice.count / total;
              const length = fraction * circumference;
              const segment = (
                <circle
                  key={slice.label}
                  cx={50}
                  cy={50}
                  r={radius}
                  fill="none"
                  stroke={LEVEL_STROKE[slice.level]}
                  strokeWidth={12}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                >
                  <title>
                    {slice.label}: {slice.count}
                  </title>
                </circle>
              );
              offset += length;
              return segment;
            })
          : null}
      </svg>
      <div className="flex flex-col gap-1.5">
        {slices.map((slice) => (
          <span
            key={slice.label}
            className="flex items-center gap-1.5 text-xs text-[var(--yzi-text-secondary)]"
          >
            <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[slice.level]}`} />
            <span className="text-[var(--yzi-text-primary)]">{slice.count}</span>
            {slice.label}
          </span>
        ))}
      </div>
    </div>
  );
}
