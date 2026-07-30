import Link from "next/link";
import type { ReactNode } from "react";

import { YziPresence } from "@/components/yzi-os/yzi-primitives";
import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";

// Surface Kit v1 — a gramática visual transversal das superfícies do YZI IMOB
// que NÃO são Entity Workspaces (Marketing, Growth OS, Agenda, Resultados,
// Radar, Conexões, APIs & Créditos, Configurações).
//
// Os Entity Workspaces aprovados (Imóveis, Corretores, Equipe, Leads,
// Atendimento) continuam com o Entity Workspace Kit — este módulo NÃO os
// substitui: ele estende a mesma escala tipográfica, o mesmo spacing e a mesma
// paleta funcional para as telas-hub, para que todas pareçam o mesmo produto.
//
// Regras: cor carrega estado, nunca decoração; um CTA principal por tela;
// nenhum nome de fornecedor, tabela, RPC ou status cru chega ao gestor.

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* Escala tipográfica canônica                                         */
/* ------------------------------------------------------------------ */

// Uma única fonte de verdade para o tamanho/peso de cada papel de texto.
// Qualquer valor local fora desta tabela é dívida visual.
export const TYPE = {
  eyebrow:
    "text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[var(--yzi-text-secondary)]",
  pageTitle:
    "text-[1.5rem] font-semibold leading-tight tracking-[-0.01em] text-[var(--yzi-text-primary)]",
  pageLead: "text-[0.82rem] leading-relaxed text-[var(--yzi-text-secondary)]",
  sectionTitle: "text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]",
  sectionLead: "text-[0.76rem] leading-relaxed text-[var(--yzi-text-faint)]",
  itemTitle: "text-[0.88rem] font-medium text-[var(--yzi-text-primary)]",
  body: "text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]",
  meta: "text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]",
  label:
    "text-[0.62rem] font-medium uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]",
  figure:
    "text-[1.5rem] font-semibold leading-none tracking-tight tabular-nums text-[var(--yzi-text-primary)]",
} as const;

/* ------------------------------------------------------------------ */
/* Estados operacionais — cor com função                               */
/* ------------------------------------------------------------------ */

/**
 * Vocabulário único de estado do produto. Toda superfície aberta usa estes
 * tons; nenhuma tela inventa a própria semântica de cor.
 *
 * `ok`        funcionando / ativo / aprovado
 * `attention` precisa de atenção do gestor agora
 * `blocked`   indisponível por decisão externa ou falha persistente
 * `pending`   aguardando verificação, aprovação ou configuração
 * `idle`      ainda não configurado / sem dados suficientes
 * `info`      leitura neutra, sem chamada de ação
 */
export type SurfaceTone = "ok" | "attention" | "blocked" | "pending" | "idle" | "info";

export const TONE_ROLE: Record<SurfaceTone, YziImobRole> = {
  ok: "coldGreen",
  attention: "amber",
  blocked: "wine",
  pending: "lilac",
  idle: "graphite",
  info: "primary",
};

export function toneColor(tone: SurfaceTone, alpha: number) {
  return imobRgba(TONE_ROLE[tone], alpha);
}

/** Pílula de estado — a ÚNICA forma de exibir estado no produto. */
export function StateTag({
  tone,
  label,
  className,
}: {
  tone: SurfaceTone;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.64rem] font-medium",
        className,
      )}
      style={{
        borderColor: toneColor(tone, 0.32),
        backgroundColor: toneColor(tone, 0.09),
        color: toneColor(tone, 0.96),
      }}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: toneColor(tone, 0.95) }}
      />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas e cabeçalho                                                  */
/* ------------------------------------------------------------------ */

/**
 * Largura útil canônica. `reading` (max-w-5xl) para telas de leitura e
 * configuração; `wide` (max-w-6xl) para telas com tabela, calendário ou
 * comparação lado a lado. Nada além destas duas.
 */
export type SurfaceWidth = "reading" | "wide";

export function SurfaceCanvas({
  width = "reading",
  children,
  className,
}: {
  width?: SurfaceWidth;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "mx-auto flex w-full flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10",
        width === "wide" ? "max-w-6xl" : "max-w-5xl",
        className,
      )}
    >
      {children}
    </section>
  );
}

export type SurfaceAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Motivo humano quando indisponível — vira `title` e texto acessível. */
  unavailableReason?: string;
};

function actionClass(kind: "primary" | "secondary", disabled?: boolean) {
  const base =
    "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[var(--yzi-radius-sm)] px-3.5 py-2 text-[0.75rem] font-medium transition-[background-color,border-color,color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--yzi-bg-base)]";

  if (disabled) {
    return cx(
      base,
      "cursor-not-allowed border border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-faint)]",
    );
  }

  return kind === "primary"
    ? cx(
        base,
        "border border-[color:rgba(var(--imob-ice),0.3)] bg-[rgba(var(--imob-cold),0.16)] font-semibold text-[rgb(var(--imob-ice))] hover:bg-[rgba(var(--imob-cold),0.24)]",
      )
    : cx(
        base,
        "border border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-secondary)] hover:border-[color:var(--yzi-border-strong)] hover:text-[var(--yzi-text-primary)]",
      );
}

export function SurfaceButton({
  action,
  kind = "secondary",
  type = "button",
}: {
  action: SurfaceAction;
  kind?: "primary" | "secondary";
  type?: "button" | "submit";
}) {
  const disabled = action.disabled || (!action.href && !action.onClick && type !== "submit");
  const className = actionClass(kind, disabled);

  if (disabled) {
    return (
      <span
        className={className}
        aria-disabled
        title={action.unavailableReason ?? "Indisponível agora"}
      >
        {action.label}
        <span className="sr-only"> — {action.unavailableReason ?? "indisponível agora"}</span>
      </span>
    );
  }

  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }

  return (
    <button type={type} onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

/**
 * Cabeçalho canônico de superfície: eyebrow com a presença da YZI, título,
 * uma frase que diz para que serve a tela, e no máximo uma ação principal
 * acompanhada de secundárias discretas.
 */
export function SurfaceHeader({
  kicker,
  title,
  lead,
  primaryAction,
  secondaryActions,
  aside,
}: {
  kicker: string;
  title: string;
  lead: string;
  primaryAction?: SurfaceAction;
  secondaryActions?: SurfaceAction[];
  aside?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <YziPresence state="ready" animated />
        <span className={TYPE.eyebrow}>{kicker}</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className={cx(TYPE.pageTitle, "text-balance")}>{title}</h1>
          <p className={cx(TYPE.pageLead, "max-w-2xl text-pretty")}>{lead}</p>
        </div>
        {primaryAction || secondaryActions?.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {secondaryActions?.map((action) => (
              <SurfaceButton key={action.label} action={action} />
            ))}
            {primaryAction ? <SurfaceButton action={primaryAction} kind="primary" /> : null}
          </div>
        ) : null}
      </div>

      {aside}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Seções                                                              */
/* ------------------------------------------------------------------ */

/**
 * Seção da superfície. Mesma anatomia do `WorkspaceSection` dos Entity
 * Workspaces aprovados (título 0.9rem, descrição 0.76rem, separador no topo),
 * com a adição de ações de seção e de um contador discreto.
 */
export function SurfaceSection({
  title,
  description,
  count,
  actions,
  children,
  first = false,
}: {
  title: string;
  description?: string;
  count?: string;
  actions?: ReactNode;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <section
      className={cx(
        "flex flex-col gap-4",
        !first && "border-t border-[color:var(--yzi-border-subtle)] pt-7",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className={TYPE.sectionTitle}>{title}</h2>
            {count ? (
              <span className="rounded-full border border-[color:var(--yzi-border-subtle)] px-2 py-0.5 text-[0.62rem] tabular-nums text-[var(--yzi-text-faint)]">
                {count}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className={cx(TYPE.sectionLead, "max-w-xl")}>{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** Bloco enquadrado — o contêiner padrão de listas e conteúdo denso. */
export function SurfacePanel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] shadow-[var(--yzi-edge-highlight)]",
        padded && "px-5 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Estados — loading, vazio, erro, pendência, bloqueio                 */
/* ------------------------------------------------------------------ */

/**
 * Vocabulário único de estados. `empty` é tracejado (não há nada ainda),
 * `error`/`blocked`/`attention` são sólidos com borda tonal (algo aconteceu),
 * `pending` é sólido neutro (algo está a caminho). Erro nunca parece vazio.
 */
export function SurfaceState({
  tone,
  title,
  body,
  action,
  secondaryAction,
  compact = false,
}: {
  tone: SurfaceTone;
  title: string;
  body: string;
  action?: SurfaceAction;
  secondaryAction?: SurfaceAction;
  compact?: boolean;
}) {
  const isEmpty = tone === "idle" || tone === "info";

  return (
    <div
      role={tone === "blocked" || tone === "attention" ? "alert" : undefined}
      className={cx(
        "flex flex-col items-start gap-3 rounded-[var(--yzi-radius-md)]",
        compact ? "px-4 py-3.5" : "px-5 py-5",
        isEmpty
          ? "border border-dashed border-[color:var(--yzi-border-subtle)]"
          : "border bg-[var(--yzi-surface-base)] shadow-[var(--yzi-edge-highlight)]",
      )}
      style={
        isEmpty
          ? undefined
          : { borderColor: toneColor(tone, 0.28), backgroundColor: toneColor(tone, 0.05) }
      }
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {!isEmpty ? (
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: toneColor(tone, 0.95) }}
            />
          ) : null}
          <p className="text-[0.88rem] font-medium text-[var(--yzi-text-primary)]">{title}</p>
        </div>
        <p className={cx(TYPE.body, "max-w-xl")}>{body}</p>
      </div>
      {action || secondaryAction ? (
        <div className="flex flex-wrap items-center gap-2">
          {action ? <SurfaceButton action={action} kind="primary" /> : null}
          {secondaryAction ? <SurfaceButton action={secondaryAction} /> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Esqueleto de carregamento — nunca um spinner solto no meio do conteúdo. */
export function SurfaceSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="yzi-imob-skeleton h-[62px] rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)]"
        />
      ))}
    </div>
  );
}

export function SurfaceLoading({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy aria-live="polite">
      <p className={TYPE.meta}>{label}</p>
      <SurfaceSkeleton rows={rows} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Linhas de conteúdo                                                  */
/* ------------------------------------------------------------------ */

/**
 * Linha canônica de item. Substitui a parede de cards: densidade previsível,
 * estado à esquerda do título, ações à direita, metadado abaixo.
 */
export function SurfaceRow({
  title,
  description,
  meta,
  tone,
  stateLabel,
  actions,
  leading,
  children,
  href,
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
  tone?: SurfaceTone;
  stateLabel?: string;
  actions?: ReactNode;
  leading?: ReactNode;
  children?: ReactNode;
  href?: string;
}) {
  const heading = (
    <span className={cx(TYPE.itemTitle, "min-w-0 truncate")}>{title}</span>
  );

  return (
    <article className="flex flex-col gap-3 border-b border-[color:var(--yzi-border-subtle)] py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-start gap-3">
        {leading}
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            {href ? (
              <Link
                href={href}
                className="min-w-0 truncate rounded-[var(--yzi-radius-sm)] text-[0.88rem] font-medium text-[var(--yzi-text-primary)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)]"
              >
                {title}
              </Link>
            ) : (
              heading
            )}
            {tone && stateLabel ? <StateTag tone={tone} label={stateLabel} /> : null}
          </div>
          {description ? <p className={cx(TYPE.body, "max-w-2xl")}>{description}</p> : null}
          {meta ? <div className={TYPE.meta}>{meta}</div> : null}
          {children}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>
      ) : null}
    </article>
  );
}

/** Lista enquadrada de `SurfaceRow`. */
export function SurfaceList({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 shadow-[var(--yzi-edge-highlight)]">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Indicadores                                                         */
/* ------------------------------------------------------------------ */

export type SurfaceMetric = {
  label: string;
  value: string;
  detail?: string;
  tone?: SurfaceTone;
};

/**
 * Faixa de indicadores dentro do conteúdo (a `CounterStrip` full-bleed continua
 * sendo a barra estrutural das telas-hub). Um bloco, divisórias verticais,
 * nunca N cards soltos competindo.
 */
export function MetricBand({ metrics }: { metrics: SurfaceMetric[] }) {
  // As divisórias vêm de `gap-px` sobre o fundo da borda: assim 1, 2 ou 4
  // colunas se separam corretamente em qualquer breakpoint, sem a matemática
  // de `border-l`/`border-t` por índice, que quebra ao trocar de grade.
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-border-subtle)] shadow-[var(--yzi-edge-highlight)] sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex flex-col gap-1.5 bg-[var(--yzi-surface-base)] px-5 py-4"
        >
          <span className={TYPE.label}>{metric.label}</span>
          <span
            className={TYPE.figure}
            style={metric.tone ? { color: toneColor(metric.tone, 0.95) } : undefined}
          >
            {metric.value}
          </span>
          {metric.detail ? (
            <span className={cx(TYPE.meta, "text-pretty")}>{metric.detail}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Barra de leitura horizontal — proporção sem gráfico decorativo. */
export function SurfaceBar({
  value,
  total,
  tone = "info",
  label,
}: {
  value: number;
  total: number;
  tone?: SurfaceTone;
  label: string;
}) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0;
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]"
      role="img"
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-[width] duration-[var(--duration-moderate)] ease-[var(--ease-standard)]"
        style={{ width: `${ratio * 100}%`, backgroundColor: toneColor(tone, 0.85) }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Filtros                                                             */
/* ------------------------------------------------------------------ */

/** Barra de filtros — sempre no topo do conteúdo, nunca no rodapé. */
export function SurfaceToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3 shadow-[var(--yzi-edge-highlight)]">
      {children}
    </div>
  );
}

/** Grupo de filtros por segmento (chips com estado selecionado real). */
export function SurfaceSegmented<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: Array<{ id: T; label: string; count?: number }>;
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <fieldset className="flex min-w-0 flex-wrap items-center gap-1">
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={cx(
              "inline-flex items-center gap-1.5 rounded-[var(--yzi-radius-sm)] px-3 py-1.5 text-[0.75rem] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)]",
              selected
                ? "bg-[var(--yzi-surface-elevated)] text-[var(--yzi-text-primary)] shadow-[var(--yzi-edge-highlight)]"
                : "text-[var(--yzi-text-secondary)] hover:text-[var(--yzi-text-primary)]",
            )}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span className="tabular-nums text-[var(--yzi-text-faint)]">{option.count}</span>
            ) : null}
          </button>
        );
      })}
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* Tabelas responsivas                                                 */
/* ------------------------------------------------------------------ */

/**
 * Envelope de rolagem para tabelas e faixas largas. A página nunca rola
 * horizontalmente: o conteúdo largo rola dentro do próprio contêiner.
 */
export function SurfaceScroller({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="-mx-1 overflow-x-auto px-1 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.4)]"
    >
      {children}
    </div>
  );
}
