import type { ComponentType, ReactNode, SVGProps } from "react";

import { YziPanel, YziSurface } from "@/components/yzi-os/yzi-primitives";

// Camada de componentes visuais reutilizáveis do YZI OS v0.1. Todos aceitam
// só dado qualitativo (baixo/médio/alto, ativo/vazio/futuro, labels curtas).
// Nenhum aceita porcentagem, número ou histórico — quem chama não tem como
// fingir dado real através destes componentes.

export type QualitativeLevel = "baixo" | "médio" | "alto";

const QUALITATIVE_ORDER: QualitativeLevel[] = ["baixo", "médio", "alto"];

const QUALITATIVE_DOT: Record<QualitativeLevel, string> = {
  baixo: "bg-[var(--yzi-accent-opportunity)]",
  médio: "bg-[var(--yzi-accent-risk)]",
  alto: "bg-[var(--yzi-state-blocked)]",
};

/**
 * 1. YziQualitativeBar — risco/custo/impacto/prioridade sem número. Só
 * quantos dos 3 segmentos estão preenchidos, coloridos pelo nível.
 */
export function YziQualitativeBar({
  label,
  level,
}: {
  label?: string;
  level: QualitativeLevel;
}) {
  const activeCount = QUALITATIVE_ORDER.indexOf(level) + 1;

  return (
    <div className="flex items-center gap-2.5">
      {label ? (
        <span className="min-w-0 flex-1 truncate text-xs text-[var(--yzi-text-secondary)]">
          {label}
        </span>
      ) : null}
      <div className="flex items-center gap-1">
        {QUALITATIVE_ORDER.map((step, index) => (
          <span
            key={step}
            aria-hidden
            className={`h-1.5 w-5 rounded-full ${
              index < activeCount
                ? QUALITATIVE_DOT[level]
                : "bg-[var(--yzi-border-strong)]"
            }`}
          />
        ))}
      </div>
      <span className="w-10 shrink-0 text-right text-[0.68rem] font-medium capitalize text-[var(--yzi-text-primary)]">
        {level}
      </span>
    </div>
  );
}

export type FlowStep = {
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

/**
 * 2. YziFlowRail — fluxo horizontal de etapas conectadas por seta. Texto e
 * ícone só; nenhuma etapa é marcada como "concluída" ou "ativa" de verdade.
 */
export function YziFlowRail({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {steps.map((step, index) => {
        const Glyph = step.icon;
        return (
          <div key={step.label} className="flex items-center gap-2">
            <YziSurface
              variant="elevated"
              className="flex items-center gap-2 px-3 py-2"
            >
              {Glyph ? (
                <Glyph className="h-3.5 w-3.5 shrink-0 text-[var(--yzi-text-secondary)]" />
              ) : null}
              <span className="text-xs font-medium text-[var(--yzi-text-primary)]">
                {step.label}
              </span>
            </YziSurface>
            {index < steps.length - 1 ? (
              <span aria-hidden className="text-[var(--yzi-text-faint)]">
                →
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export type MetricStripItem = { label: string; value: string };

/**
 * 3. YziMetricStrip — linha compacta de estados ("Fila: vazia", "Proteção:
 * ativa"). `value` é sempre texto qualitativo, nunca número calculado.
 */
export function YziMetricStrip({ items }: { items: MetricStripItem[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
      {items.map((item) => (
        <span key={item.label} className="text-[var(--yzi-text-secondary)]">
          <span className="font-medium text-[var(--yzi-text-primary)]">
            {item.label}:
          </span>{" "}
          {item.value}
        </span>
      ))}
    </div>
  );
}

const GRID_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export type MatrixColumn = {
  key: string;
  label: string;
  tone?: QualitativeLevel;
};

export type MatrixItem = {
  id: string;
  label: string;
  sublabel?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  columnKey: string;
};

/**
 * 4. YziMatrix — matriz visual simples (risco x impacto, fonte x risco...).
 * Cada coluna é um agrupamento qualitativo; cada célula é um chip, não uma
 * linha de tabela.
 */
export function YziMatrix({
  columns,
  items,
  emptyLabel = "Nenhum item aqui ainda",
  renderItem,
}: {
  columns: MatrixColumn[];
  items: MatrixItem[];
  emptyLabel?: string;
  renderItem?: (item: MatrixItem) => ReactNode;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-3 ${GRID_COLS[columns.length] ?? "sm:grid-cols-3"}`}
    >
      {columns.map((column) => {
        const columnItems = items.filter((item) => item.columnKey === column.key);
        const dot = column.tone
          ? QUALITATIVE_DOT[column.tone]
          : "bg-[var(--yzi-text-faint)]";

        return (
          <YziPanel key={column.key} className="flex flex-col gap-2.5 p-3">
            <div className="flex items-center gap-1.5">
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />
              <span className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[var(--yzi-text-secondary)]">
                {column.label}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {columnItems.length === 0 ? (
                <span className="text-xs text-[var(--yzi-text-faint)]">
                  {emptyLabel}
                </span>
              ) : (
                columnItems.map((item) => {
                  const Glyph = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-1.5 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-2.5 py-2"
                    >
                      {renderItem ? (
                        renderItem(item)
                      ) : (
                        <div className="flex items-center gap-2">
                          {Glyph ? (
                            <Glyph className="h-3.5 w-3.5 shrink-0 text-[var(--yzi-text-secondary)]" />
                          ) : null}
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-xs font-medium text-[var(--yzi-text-primary)]">
                              {item.label}
                            </span>
                            {item.sublabel ? (
                              <span className="truncate text-[0.62rem] text-[var(--yzi-text-faint)]">
                                {item.sublabel}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </YziPanel>
        );
      })}
    </div>
  );
}

/**
 * 5. YziEmptyVisualState — estado vazio como superfície visual (área
 * tracejada + ícone + uma frase curta), não bloco de texto explicativo.
 */
export function YziEmptyVisualState({
  icon: Glyph,
  message,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  message: string;
}) {
  return (
    <YziSurface
      variant="elevated"
      className="flex flex-col items-center gap-2 border-dashed p-6 text-center"
    >
      <Glyph className="h-5 w-5 text-[var(--yzi-text-faint)]" />
      <p className="text-sm font-medium text-[var(--yzi-text-primary)]">
        {message}
      </p>
    </YziSurface>
  );
}

export type GaugeState =
  | "não definido"
  | "em preparação"
  | "limite futuro"
  | "consumo estimado";

const GAUGE_STATE_TONE: Record<GaugeState, string> = {
  "não definido": "text-[var(--yzi-text-faint)]",
  "em preparação": "text-[var(--yzi-state-preview)]",
  "limite futuro": "text-[var(--yzi-accent-trust)]",
  "consumo estimado": "text-[var(--yzi-accent-risk)]",
};

/**
 * 6. YziCreditGauge — medidor conceitual de créditos/limite. O arco é
 * sempre decorativo e pontilhado, sem posição proporcional a nenhum número
 * — só o texto central comunica o estado real.
 */
export function YziCreditGauge({
  label,
  state,
}: {
  label: string;
  state: GaugeState;
}) {
  return (
    <YziPanel className="flex flex-col items-center gap-2 p-4 text-center">
      <svg viewBox="0 0 100 56" className="h-14 w-24" aria-hidden>
        <path
          d="M8 52a42 42 0 0 1 84 0"
          fill="none"
          stroke="var(--yzi-border-strong)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="4 7"
        />
      </svg>
      <span className={`text-sm font-semibold ${GAUGE_STATE_TONE[state]}`}>
        {state}
      </span>
      <span className="text-[0.62rem] uppercase tracking-[0.14em] text-[var(--yzi-text-secondary)]">
        {label}
      </span>
    </YziPanel>
  );
}

export type ConnectionMapLink = {
  id: string;
  source: string;
  module: string;
  risk: QualitativeLevel;
};

/**
 * 7. YziConnectionMap — mapa visual fonte → módulo → risco, uma linha por
 * vínculo. Não representa volume nem frequência, só a relação e o risco.
 */
export function YziConnectionMap({ links }: { links: ConnectionMapLink[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {links.map((link) => (
        <div
          key={link.id}
          className="flex flex-wrap items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2 text-xs"
        >
          <span className="font-medium text-[var(--yzi-text-primary)]">
            {link.source}
          </span>
          <span aria-hidden className="text-[var(--yzi-text-faint)]">
            →
          </span>
          <span className="text-[var(--yzi-text-secondary)]">
            {link.module}
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${QUALITATIVE_DOT[link.risk]}`}
            />
            <span className="text-[var(--yzi-text-secondary)]">
              {link.risk}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
