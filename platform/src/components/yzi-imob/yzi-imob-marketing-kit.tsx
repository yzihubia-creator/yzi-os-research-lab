"use client";

import type { ReactNode } from "react";

import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";
import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";

/* ==================================================================== */
/* Marketing Kit v0 — design system mínimo do módulo Marketing.          */
/*                                                                       */
/* Extraído da tela aprovada "Revisar sua semana" para reuso nas         */
/* próximas superfícies (Home de Marketing, anúncios, aprovação,         */
/* fechamento). Regras de layout:                                        */
/*                                                                       */
/* - MarketingShellContent é um @container: todos os breakpoints do      */
/*   módulo respondem à largura REAL do canvas (sidebar/Inspector        */
/*   abertos ou não), nunca ao viewport.                                 */
/* - MarketingReviewLayout: preview + decisão lado a lado quando o       */
/*   canvas tem ≥ 860px; empilhado abaixo disso; sempre 1 coluna no      */
/*   mobile.                                                             */
/* - MarketingPreviewStage: a moldura da peça usa o aspect ratio REAL    */
/*   do formato (MarketingMedia). Largura = min(coluna, orçamento de     */
/*   altura × ratio); nunca estica, nunca corta a peça inteira. Assets   */
/*   reais devem entrar em object-contain dentro da moldura (letterbox   */
/*   discreto se o ratio divergir).                                      */
/* - Formatos suportados: 4:5 (1080×1350), 1:1 (1080×1080), 9:16         */
/*   (1080×1920), 1.91:1 (1200×628), 16:9 (site hero).                   */
/* - Tokens: só --yzi-* e imobRgba(); nenhum valor de cor/radius novo.   */
/* ==================================================================== */

/* ------------------------------------------------------------------ */
/* Contrato de mídia por formato                                       */
/* ------------------------------------------------------------------ */

export type MarketingMediaFormat =
  | "feed-4x5"
  | "feed-1x1"
  | "reel-9x16"
  | "story-9x16"
  | "paisagem-1.91x1"
  | "hero-16x9";

export type MarketingMedia = {
  format: MarketingMediaFormat;
  width: number;
  height: number;
  aspectRatio: number;
  mimeType: string;
  durationSeconds?: number;
};

export const MARKETING_MEDIA_PRESET: Record<
  MarketingMediaFormat,
  Pick<MarketingMedia, "width" | "height" | "aspectRatio">
> = {
  "feed-4x5": { width: 1080, height: 1350, aspectRatio: 4 / 5 },
  "feed-1x1": { width: 1080, height: 1080, aspectRatio: 1 },
  "reel-9x16": { width: 1080, height: 1920, aspectRatio: 9 / 16 },
  "story-9x16": { width: 1080, height: 1920, aspectRatio: 9 / 16 },
  "paisagem-1.91x1": { width: 1200, height: 628, aspectRatio: 1200 / 628 },
  "hero-16x9": { width: 1920, height: 1080, aspectRatio: 16 / 9 },
};

export function marketingMedia(
  format: MarketingMediaFormat,
  extra?: { mimeType?: string; durationSeconds?: number },
): MarketingMedia {
  return {
    format,
    ...MARKETING_MEDIA_PRESET[format],
    mimeType: extra?.mimeType ?? "image/jpeg",
    durationSeconds: extra?.durationSeconds,
  };
}

export type MarketingOrientation = "vertical" | "quadrado" | "paisagem";

export function marketingOrientation(media: MarketingMedia): MarketingOrientation {
  if (media.aspectRatio < 0.95) return "vertical";
  if (media.aspectRatio > 1.3) return "paisagem";
  return "quadrado";
}

/* ------------------------------------------------------------------ */
/* MarketingShellContent — largura, gutters e container do módulo      */
/* ------------------------------------------------------------------ */

export function MarketingShellContent({
  children,
  width = "ampla",
  className,
}: {
  children: ReactNode;
  /** "ampla" para revisão/preview; "leitura" para resumos e fechamento. */
  width?: "ampla" | "leitura";
  className?: string;
}) {
  return (
    <section className="yzi-growth-surface @container/marketing flex min-h-full w-full flex-col">
      <div
        className={cx(
          "mx-auto flex w-full flex-1 flex-col px-4 sm:px-6 lg:px-8",
          width === "leitura" ? "max-w-xl pb-14 pt-8" : "max-w-6xl pb-12 pt-6",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* MarketingReviewLayout — preview + decisão pelo espaço real          */
/* ------------------------------------------------------------------ */

export function MarketingReviewLayout({
  preview,
  panel,
}: {
  preview: ReactNode;
  panel: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-8 @min-[860px]/marketing:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] @min-[860px]/marketing:gap-10">
      <div className="min-w-0">{preview}</div>
      <div className="min-w-0 @container/decisao">{panel}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MarketingPreviewStage — moldura da peça no formato real             */
/* ------------------------------------------------------------------ */

/** Orçamento de altura do palco: a peça nunca empurra a decisão para
 *  fora da dobra em 100% de zoom, em nenhum formato. */
const STAGE_HEIGHT_BUDGET = "min(68svh, 700px)";

export function MarketingPreviewStage({
  media,
  dimmed,
  className,
  children,
}: {
  media: MarketingMedia;
  /** Peça fora da semana / desabilitada. */
  dimmed?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "flex w-full justify-center @min-[860px]/marketing:items-center",
        dimmed && "opacity-40",
        className,
      )}
    >
      <div
        className="relative w-full overflow-hidden rounded-[var(--yzi-radius-lg)] border border-white/14 shadow-[0_28px_70px_-32px_rgba(0,0,0,0.85)]"
        style={{
          aspectRatio: `${media.width} / ${media.height}`,
          maxWidth: `min(100%, calc(${STAGE_HEIGHT_BUDGET} * ${media.aspectRatio}))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Botões e MarketingActionGroup                                       */
/* ------------------------------------------------------------------ */

const BTN_BASE =
  "inline-flex min-h-[44px] items-center justify-center rounded-[var(--yzi-radius-md)] px-4 text-[0.84rem] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--imob-ice),0.7)]";

export function MarketingButton({
  children,
  onClick,
  variant = "secundario",
  ariaLabel,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "primario" | "secundario";
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        BTN_BASE,
        variant === "primario"
          ? "border border-[rgba(var(--imob-ice),0.4)] bg-[rgba(var(--imob-cold),0.35)] text-[var(--yzi-text-primary)] hover:bg-[rgba(var(--imob-cold),0.55)]"
          : "border border-[color:var(--yzi-border-subtle)] bg-transparent text-[var(--yzi-text-secondary)] hover:text-[var(--yzi-text-primary)]",
        disabled &&
          "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-[var(--yzi-text-secondary)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Ação primária em cima; secundárias em linha quando o painel comporta
 *  (≥ 400px no container da decisão), coluna quando não. */
export function MarketingActionGroup({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {primary}
      {secondary ? (
        <div className="grid grid-cols-1 gap-2.5 @min-[400px]/decisao:grid-cols-2">{secondary}</div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MarketingDependency — a YZI precisa do gestor                       */
/* ------------------------------------------------------------------ */

const DEPENDENCY_TONE: Record<
  "voce" | "manual" | "desconectado",
  { role: YziImobRole; titulo: string }
> = {
  voce: { role: "lilac", titulo: "A YZI precisa de você" },
  manual: { role: "amber", titulo: "Publicação manual" },
  desconectado: { role: "wine", titulo: "Canal não conectado" },
};

export function MarketingDependency({
  tone = "voce",
  title,
  children,
}: {
  tone?: keyof typeof DEPENDENCY_TONE;
  /** Sobrescreve o título padrão do tom. */
  title?: string;
  children: ReactNode;
}) {
  const config = DEPENDENCY_TONE[tone];
  return (
    <div
      className="flex flex-col gap-2 rounded-[var(--yzi-radius-md)] border px-4 py-3.5"
      style={{ borderColor: imobRgba(config.role, 0.4) }}
    >
      <span
        className="text-[0.72rem] font-medium uppercase tracking-[0.1em]"
        style={{ color: imobRgba(config.role, 1) }}
      >
        {title ?? config.titulo}
      </span>
      <div className="text-[0.82rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MarketingStatusBadge — vocabulário de estado do módulo              */
/* ------------------------------------------------------------------ */

export type MarketingStatus =
  | "mantido"
  | "ajuste"
  | "fora"
  | "aprovado"
  | "manual"
  | "desconectado";

const STATUS_CONFIG: Record<MarketingStatus, { role: YziImobRole; label: string }> = {
  mantido: { role: "coldGreen", label: "mantido" },
  ajuste: { role: "amber", label: "ajuste solicitado" },
  fora: { role: "graphite", label: "fora da semana" },
  aprovado: { role: "coldGreen", label: "aprovado" },
  manual: { role: "amber", label: "sai pelo seu celular" },
  desconectado: { role: "wine", label: "não conectado" },
};

export function MarketingStatusBadge({
  status,
  label,
}: {
  status: MarketingStatus;
  /** Sobrescreve o rótulo padrão (ex.: microcopy aprovada da tela). */
  label?: string;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className="rounded-[var(--yzi-radius-sm)] border px-2 py-0.5 text-[0.68rem]"
      style={{ borderColor: imobRgba(config.role, 0.5), color: imobRgba(config.role, 1) }}
    >
      {label ?? config.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* MarketingProgress — posição discreta, não compete com o conteúdo    */
/* ------------------------------------------------------------------ */

export function MarketingProgress({ total, atual }: { total: number; atual: number }) {
  return (
    <div className="flex items-center gap-3" aria-label={`Conteúdo ${atual + 1} de ${total}`}>
      <div className="flex items-center gap-1.5" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cx(
              "h-1.5 rounded-full transition-all",
              i === atual ? "w-5 bg-[rgba(var(--imob-ice),0.85)]" : "w-1.5",
            )}
            style={
              i === atual ? undefined : { background: imobRgba("graphite", i < atual ? 0.7 : 0.35) }
            }
          />
        ))}
      </div>
      <span className="text-[0.72rem] tabular-nums text-[var(--yzi-text-secondary)]">
        {atual + 1} de {total}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MarketingWeekCloseRow — linha do resumo executivo do fechamento     */
/* ------------------------------------------------------------------ */

export function MarketingWeekCloseRow({
  titulo,
  detalhe,
  removido,
}: {
  titulo: string;
  detalhe: string;
  removido?: boolean;
}) {
  return (
    <li
      className={cx(
        "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-3",
        removido && "opacity-40",
      )}
    >
      <span className={cx("text-[0.84rem] text-[var(--yzi-text-primary)]", removido && "line-through")}>
        {titulo}
      </span>
      <span className="text-[0.72rem] tabular-nums text-[var(--yzi-text-secondary)]">{detalhe}</span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* MarketingTerminalState — estado final / vazio / bloqueado           */
/* ------------------------------------------------------------------ */

export function MarketingTerminalState({
  tone = "sucesso",
  titulo,
  consequencia,
  acao,
  nota,
}: {
  tone?: "sucesso" | "bloqueado" | "vazio";
  /** O que aconteceu / o motivo. */
  titulo: string;
  /** A consequência para o gestor. */
  consequencia?: ReactNode;
  /** A próxima ação, quando existir. */
  acao?: ReactNode;
  /** Nota de estado honesto (dados de exemplo etc.). */
  nota?: string;
}) {
  const role: YziImobRole = tone === "sucesso" ? "coldGreen" : tone === "bloqueado" ? "wine" : "graphite";
  const glyph = tone === "sucesso" ? "✓" : tone === "bloqueado" ? "!" : "·";
  return (
    <div className="flex min-h-full w-full flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full border text-[1.2rem]"
        style={{ borderColor: imobRgba(role, 0.5), color: imobRgba(role, 1) }}
        aria-hidden
      >
        {glyph}
      </span>
      <h1 className="max-w-md text-balance text-[1.4rem] font-semibold leading-snug text-[var(--yzi-text-primary)]">
        {titulo}
      </h1>
      {consequencia ? (
        <p className="max-w-md text-[0.86rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          {consequencia}
        </p>
      ) : null}
      {acao}
      {nota ? <p className="text-[0.7rem] text-[var(--yzi-text-faint)]">{nota}</p> : null}
    </div>
  );
}
