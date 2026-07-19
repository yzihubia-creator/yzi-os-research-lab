"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { YziPresence } from "@/components/yzi-os/yzi-primitives";
import { AuthorizationIcon, SendIcon } from "@/components/yzi-os/yzi-icons";
import { CreativeIcon } from "@/components/yzi-imob/yzi-imob-icons-v2";
import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";

// Entity Workspace Kit v1 — a base canônica de todos os Entity Workspaces do
// YZI IMOB (Property, Broker e, no futuro, Client/Campaign/Site). Estrutura
// fixa: EntityHero (conversa da YZI termina aqui) → CounterStrip → Workspace
// Body (tabs + Inspector v2 do Shell). Material System v1: glass só na lente
// do composer, strip estrutural sem card, paleta fria. Sem backend, sem
// Runtime, sem IA executando — tudo estado local e mock honesto.

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* EntityHero                                                          */
/* ------------------------------------------------------------------ */

export type EntityQuickAction = { label: string };

export function EntityHero({
  backHref,
  backLabel,
  kicker,
  title,
  subtitle,
  statusLabel,
  composerPlaceholder,
  quickActions,
  assistantMessage,
  onAsk,
  compactComposer = false,
}: {
  backHref: string;
  backLabel: string;
  kicker: string;
  title: string;
  subtitle?: string | null;
  statusLabel: string;
  composerPlaceholder: string;
  quickActions: EntityQuickAction[];
  assistantMessage?: string;
  onAsk: (text: string) => void;
  /**
   * Telas-hub (Conexões) usam a MESMA lente da Home: coluna compacta e
   * centralizada (max-w-2xl ≈ 672px) em vez de esticar na largura do canvas.
   * Entity Workspaces (Property, Broker, Client…) mantêm o composer alinhado
   * ao header — por isso o padrão é `false` e nenhuma tela existente muda.
   */
  compactComposer?: boolean;
}) {
  const [ask, setAsk] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAsk(ask);
  }

  return (
    <header className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <Link
          href={backHref}
          className="text-[0.72rem] text-[var(--yzi-text-faint)] transition-colors hover:text-[var(--yzi-text-secondary)]"
        >
          ← {backLabel}
        </Link>
        <span aria-hidden className="text-[var(--yzi-text-faint)]">
          /
        </span>
        <YziPresence state="ready" animated />
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[var(--yzi-text-secondary)]">
          {kicker}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-balance text-[1.9rem] font-semibold leading-tight tracking-[-0.01em] text-[var(--yzi-text-primary)]">
            {title}
          </h1>
          <span className="rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-2.5 py-1 text-[0.66rem] text-[var(--yzi-text-secondary)] shadow-[var(--yzi-edge-highlight)]">
            {statusLabel}
          </span>
        </div>
        {subtitle ? (
          <p className="text-[0.82rem] text-[var(--yzi-text-secondary)]">{subtitle}</p>
        ) : null}
      </div>

      {/* Campo principal da YZI — Glass Composer (mesma lente da home).
          Depois desta caixa, a conversa da YZI termina: o resto é Workspace. */}
      <form
        onSubmit={handleSubmit}
        className={cx(
          "yzi-lens w-full overflow-hidden rounded-[var(--yzi-radius-lg)] text-left",
          compactComposer && "mx-auto max-w-2xl",
        )}
      >
        <div
          className={cx(
            "flex items-center gap-3 px-4",
            compactComposer ? "py-4" : "py-3.5",
          )}
        >
          <CreativeIcon
            aria-hidden
            className="h-4.5 w-4.5 shrink-0 text-[var(--yzi-text-faint)]"
          />
          <label htmlFor={`entity-hero-ask-${kicker}`} className="sr-only">
            {composerPlaceholder}
          </label>
          <input
            id={`entity-hero-ask-${kicker}`}
            value={ask}
            onChange={(event) => setAsk(event.target.value)}
            placeholder={composerPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--yzi-text-primary)] outline-none placeholder:text-[var(--yzi-text-faint)]"
          />
          <button
            type="submit"
            aria-label="Enviar para a YZI"
            title="Enviar para a YZI"
            className="yzi-imob-hero-submit grid h-9 w-9 shrink-0 place-items-center rounded-[var(--yzi-radius-sm)]"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </div>

        <div
          aria-hidden
          className="h-px w-full bg-[linear-gradient(90deg,transparent,var(--yzi-glass-border),transparent)]"
        />

        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">
            Ações rápidas:
          </span>
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onAsk(action.label)}
              className="yzi-lens-chip rounded-full px-3 py-1 text-[0.72rem] text-[var(--yzi-text-secondary)]"
            >
              {action.label}
            </button>
          ))}
        </div>
      </form>

      {assistantMessage ? (
        <div
          className={cx(
            "flex items-start gap-2.5 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]",
            compactComposer && "mx-auto w-full max-w-2xl",
          )}
        >
          <YziPresence state="ready" />
          <p className="max-w-3xl">{assistantMessage}</p>
        </div>
      ) : null}

      <p
        className={cx(
          "flex items-center gap-1.5 text-[0.68rem] text-[var(--yzi-text-faint)]",
          compactComposer && "mx-auto w-full max-w-2xl",
        )}
      >
        <AuthorizationIcon className="h-3.5 w-3.5 shrink-0 text-[var(--yzi-accent-authorization)]" />
        Preview. Ações externas exigem autorização.
      </p>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* CounterStrip                                                        */
/* ------------------------------------------------------------------ */

export type CounterItem = {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
  /**
   * Papel de cor (Material System v1) do TIPO de dado. Só é LIDO na variante
   * `home`: o número herda a cor do papel e a divisória ganha o mesmo tom em
   * 0.22. Na variante `default` o papel é ignorado de propósito — a presença
   * de `role` nunca muda a apresentação de uma tela que não pediu a densidade
   * da Home.
   */
  role?: YziImobRole;
};

/**
 * `default` — densidade histórica dos Entity Workspaces (Property, Broker,
 * Client, Team, Settings, Property Create). Leitura cromática neutra/`accent`.
 * `home` — faixa estrutural das telas-hub (Home e Conexões): mais alta,
 * tipografia maior e hierarquia cromática por papel.
 */
export type CounterStripVariant = "default" | "home";

// A ÚNICA barra estrutural do YZI IMOB (Material System v1 §5) — a Home também
// renderiza esta função. Full-bleed, dark, sem glass, borda só topo/base,
// divisórias verticais. 1/2/4 colunas. Quem chama é responsável por NÃO a
// colocar dentro do max-width do conteúdo: a strip vive na largura do canvas.
export function CounterStrip({
  counters,
  variant = "default",
}: {
  counters: CounterItem[];
  variant?: CounterStripVariant;
}) {
  const isHome = variant === "home";

  return (
    <div className="yzi-imob-strip grid w-full grid-cols-1 overflow-hidden sm:grid-cols-2 md:grid-cols-4">
      {counters.map((counter, index) => {
        const dividers = [
          "",
          "border-t sm:border-t-0 sm:border-l",
          "border-t md:border-t-0 md:border-l",
          "border-t sm:border-l md:border-t-0",
        ][index % 4];

        // Papel de cor só participa da leitura na variante home.
        const role = isHome ? counter.role : undefined;

        return (
          <div
            key={counter.label}
            className={cx(
              "flex flex-col gap-2 border-[color:var(--yzi-border-subtle)] px-6 md:px-8",
              isHome ? "py-6 md:py-7" : "py-5 md:py-6",
              dividers,
            )}
            style={
              role && dividers ? { borderLeftColor: imobRgba(role, 0.22) } : undefined
            }
          >
            <span className="text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[var(--yzi-text-faint)]">
              {counter.label}
            </span>
            <span
              className={cx(
                "font-semibold leading-none tracking-tight tabular-nums",
                isHome
                  ? "text-[2rem] md:text-[2.25rem]"
                  : "text-[1.75rem] md:text-[2rem]",
                role
                  ? null
                  : counter.accent
                    ? "text-[var(--yzi-accent-authorization)]"
                    : "text-[var(--yzi-text-primary)]",
              )}
              style={role ? { color: imobRgba(role, 0.92) } : undefined}
            >
              {counter.value}
            </span>
            <span className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
              {counter.detail}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WorkspaceTabs                                                       */
/* ------------------------------------------------------------------ */

export type WorkspaceTab = { id: string; label: string; soon?: boolean };

export function WorkspaceTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: WorkspaceTab[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      role="tablist"
      className="flex flex-wrap items-center gap-1 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] p-1"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cx(
            "inline-flex items-center gap-1.5 rounded-[var(--yzi-radius-sm)] px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors",
            active === tab.id
              ? "bg-[var(--yzi-surface-elevated)] text-[var(--yzi-text-primary)]"
              : "text-[var(--yzi-text-secondary)] hover:text-[var(--yzi-text-primary)]",
          )}
        >
          {tab.label}
          {tab.soon ? (
            <span className="rounded-full border border-[color:var(--yzi-border-subtle)] px-1.5 py-px text-[0.56rem] uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
              Em breve
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function ComingSoonPanel({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-6 py-16 text-center">
      <span
        aria-hidden
        className="grid h-12 w-12 place-items-center rounded-[var(--yzi-radius-md)] border border-[color:rgba(var(--imob-ice),0.3)] bg-[rgba(var(--imob-cold),0.1)] text-[rgb(var(--imob-ice))]"
      >
        <CreativeIcon className="h-5 w-5" />
      </span>
      <p className="text-[0.92rem] text-[var(--yzi-text-primary)]">{label}</p>
      <p className="max-w-sm text-[0.78rem] text-[var(--yzi-text-secondary)]">{note}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WorkspaceSection                                                    */
/* ------------------------------------------------------------------ */

// Seção do schema visual — não formulário tradicional. Título + descrição
// operacional + grid de campos.
export function WorkspaceSection({
  title,
  description,
  children,
  first = false,
}: {
  title: string;
  description?: string;
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
      <div className="flex flex-col gap-1">
        <h2 className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-xl text-[0.76rem] leading-relaxed text-[var(--yzi-text-faint)]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function WorkspaceGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}
