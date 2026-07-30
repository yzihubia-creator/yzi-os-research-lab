import Link from "next/link";
import type { ReactNode } from "react";

import { YziPresence } from "@/components/yzi-os/yzi-primitives";
import {
  StateTag,
  SurfaceButton,
  TYPE,
  cx,
  toneColor,
  type SurfaceAction,
  type SurfaceTone,
} from "@/components/yzi-imob/yzi-imob-surface-kit";

// YZI Presence Kit v1 — a família visual ÚNICA da YZI dentro do YZI IMOB.
//
// Antes deste módulo cada rota inventava o próprio gradiente, borda, raio e
// anatomia para representar a YZI. Aqui existe uma assinatura só: a superfície
// `.yzi-imob-yzi` (gradiente governado, declarado uma vez no globals.css) e uma
// anatomia compartilhada — presença → contexto → diagnóstico → conteúdo →
// evidência → recomendação → ação.
//
// A YZI aparece quando há leitura, diagnóstico, risco, recomendação, explicação
// de estado ou preparação de decisão. Nunca para preencher espaço.
//
// Copy: fato → leitura → recomendação. Sem "insights valiosos", sem "potencialize
// seus resultados", sem linguagem genérica de assistente.

/* ------------------------------------------------------------------ */
/* 1. YziSignal — presença curta em lista, alerta ou indicador          */
/* ------------------------------------------------------------------ */

export function YziSignal({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: SurfaceTone;
}) {
  return (
    <p className="flex items-start gap-2.5">
      <YziPresence state="ready" className="mt-1 shrink-0" />
      <span
        className="text-[0.76rem] leading-relaxed"
        style={{ color: tone === "info" ? undefined : toneColor(tone, 0.95) }}
      >
        <span className={tone === "info" ? "text-[var(--yzi-text-secondary)]" : undefined}>
          {children}
        </span>
      </span>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Casca compartilhada                                                 */
/* ------------------------------------------------------------------ */

function YziShell({
  size = "insight",
  children,
}: {
  size?: "insight" | "workspace";
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "yzi-imob-yzi flex flex-col rounded-[var(--yzi-radius-lg)]",
        size === "workspace" ? "gap-5 p-5 sm:p-6" : "gap-4 p-4 sm:p-5",
      )}
    >
      {children}
    </div>
  );
}

function YziHead({
  context,
  tone,
  stateLabel,
}: {
  context: string;
  tone?: SurfaceTone;
  stateLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <YziPresence state="ready" animated />
        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--imob-ice))]">
          YZI
        </span>
        <span aria-hidden className="text-[var(--yzi-text-faint)]">
          ·
        </span>
        <span className="min-w-0 truncate text-[0.68rem] text-[var(--yzi-text-faint)]">
          {context}
        </span>
      </div>
      {tone && stateLabel ? <StateTag tone={tone} label={stateLabel} /> : null}
    </div>
  );
}

function YziFoot({
  primaryAction,
  secondaryAction,
  analysisHref,
  analysisLabel,
}: {
  primaryAction?: SurfaceAction;
  secondaryAction?: SurfaceAction;
  analysisHref?: string;
  analysisLabel?: string;
}) {
  if (!primaryAction && !secondaryAction && !analysisHref) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[color:rgba(var(--imob-ice),0.14)] pt-4">
      {primaryAction ? <SurfaceButton action={primaryAction} kind="primary" /> : null}
      {secondaryAction ? <SurfaceButton action={secondaryAction} /> : null}
      {analysisHref ? (
        <Link
          href={analysisHref}
          className="ml-auto rounded-[var(--yzi-radius-sm)] text-[0.72rem] text-[var(--yzi-text-secondary)] underline-offset-4 transition-colors hover:text-[rgb(var(--imob-ice))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)]"
        >
          {analysisLabel ?? "Ver análise completa"} →
        </Link>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. YziInsight — diagnóstico, evidência, recomendação, ação           */
/* ------------------------------------------------------------------ */

export function YziInsight({
  context,
  headline,
  reading,
  evidence,
  recommendation,
  tone,
  stateLabel,
  primaryAction,
  secondaryAction,
  analysisHref,
  analysisLabel,
}: {
  /** Onde a leitura acontece: "Publicações da semana", "Imóvel Vila Nova 210". */
  context: string;
  /** O FATO observado, com número quando existir. */
  headline: string;
  /** A LEITURA: o que o fato significa para a operação. */
  reading?: string;
  /** A EVIDÊNCIA que sustenta a leitura. */
  evidence?: readonly string[];
  /** A RECOMENDAÇÃO: o próximo passo concreto. */
  recommendation?: string;
  tone?: SurfaceTone;
  stateLabel?: string;
  primaryAction?: SurfaceAction;
  secondaryAction?: SurfaceAction;
  analysisHref?: string;
  analysisLabel?: string;
}) {
  return (
    <YziShell>
      <YziHead context={context} tone={tone} stateLabel={stateLabel} />

      <div className="flex flex-col gap-2">
        <p className="text-[0.95rem] font-medium leading-snug text-[var(--yzi-text-primary)]">
          {headline}
        </p>
        {reading ? <p className={cx(TYPE.body, "max-w-2xl")}>{reading}</p> : null}
      </div>

      {evidence?.length ? (
        <ul className="flex flex-col gap-1.5">
          {evidence.map((item) => (
            <li key={item} className="flex items-start gap-2 text-[0.72rem] text-[var(--yzi-text-faint)]">
              <span
                aria-hidden
                className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[rgba(var(--imob-ice),0.5)]"
              />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {recommendation ? (
        <p className="rounded-[var(--yzi-radius-md)] border border-[color:rgba(var(--imob-ice),0.16)] bg-[rgba(var(--imob-cold),0.06)] px-3.5 py-3 text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          {recommendation}
        </p>
      ) : null}

      <YziFoot
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        analysisHref={analysisHref}
        analysisLabel={analysisLabel}
      />
    </YziShell>
  );
}

/* ------------------------------------------------------------------ */
/* 3. YziWorkspace — superfície ampliada para análise e decisão         */
/* ------------------------------------------------------------------ */

export function YziWorkspacePanel({
  context,
  headline,
  reading,
  tone,
  stateLabel,
  children,
  primaryAction,
  secondaryAction,
  analysisHref,
  analysisLabel,
}: {
  context: string;
  headline: string;
  reading?: string;
  tone?: SurfaceTone;
  stateLabel?: string;
  children: ReactNode;
  primaryAction?: SurfaceAction;
  secondaryAction?: SurfaceAction;
  analysisHref?: string;
  analysisLabel?: string;
}) {
  return (
    <YziShell size="workspace">
      <YziHead context={context} tone={tone} stateLabel={stateLabel} />

      <div className="flex flex-col gap-2">
        <h2 className="text-balance text-[1.15rem] font-semibold leading-snug tracking-[-0.01em] text-[var(--yzi-text-primary)]">
          {headline}
        </h2>
        {reading ? <p className={cx(TYPE.body, "max-w-3xl")}>{reading}</p> : null}
      </div>

      {children}

      <YziFoot
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        analysisHref={analysisHref}
        analysisLabel={analysisLabel}
      />
    </YziShell>
  );
}

/** Bloco de leitura dentro do YziWorkspacePanel: pergunta → achado → evidência. */
export function YziReading({
  question,
  finding,
  evidence,
  implication,
  tone = "info",
}: {
  question: string;
  finding: string;
  evidence?: readonly string[];
  implication?: string;
  tone?: SurfaceTone;
}) {
  return (
    <article className="flex flex-col gap-2 border-t border-[color:rgba(var(--imob-ice),0.12)] pt-4 first:border-t-0 first:pt-0">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
        {question}
      </p>
      <p
        className="text-[0.88rem] font-medium leading-snug"
        style={{
          color: tone === "info" ? "var(--yzi-text-primary)" : toneColor(tone, 0.95),
        }}
      >
        {finding}
      </p>
      {evidence?.length ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {evidence.map((item) => (
            <li key={item} className="text-[0.7rem] tabular-nums text-[var(--yzi-text-faint)]">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      {implication ? <p className={TYPE.body}>{implication}</p> : null}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* 4. YziEmptyState — ainda não há dados suficientes                    */
/* ------------------------------------------------------------------ */

export function YziEmptyState({
  context,
  title,
  body,
  action,
}: {
  context: string;
  title: string;
  body: string;
  action?: SurfaceAction;
}) {
  return (
    <YziShell>
      <YziHead context={context} />
      <div className="flex flex-col gap-2">
        <p className="text-[0.92rem] font-medium text-[var(--yzi-text-primary)]">{title}</p>
        <p className={cx(TYPE.body, "max-w-2xl")}>{body}</p>
      </div>
      <YziFoot primaryAction={action} />
    </YziShell>
  );
}

/* ------------------------------------------------------------------ */
/* 5. YziRestrictedState — falta uma capacidade para esta leitura       */
/* ------------------------------------------------------------------ */

export function YziRestrictedState({
  context,
  title,
  body,
  action,
  stateLabel = "Aguardando liberação",
}: {
  context: string;
  title: string;
  body: string;
  action?: SurfaceAction;
  stateLabel?: string;
}) {
  return (
    <YziShell>
      <YziHead context={context} tone="pending" stateLabel={stateLabel} />
      <div className="flex flex-col gap-2">
        <p className="text-[0.92rem] font-medium text-[var(--yzi-text-primary)]">{title}</p>
        <p className={cx(TYPE.body, "max-w-2xl")}>{body}</p>
      </div>
      <YziFoot primaryAction={action} />
    </YziShell>
  );
}
