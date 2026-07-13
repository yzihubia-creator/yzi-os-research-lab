"use client";

import { useState } from "react";
import type { ComponentType, SVGProps } from "react";

import {
  DEMO_MOVEMENTS,
  MOVEMENT_META,
  PRIORITY_META,
  type DemoMovement,
  type MovementKind,
} from "@/components/yzi-imob/yzi-imob-radar-mock";
import {
  ArrowRightIcon,
  FlameIcon,
  PropertyIcon,
  SearchIcon,
  StackIcon,
  TargetIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "@/components/yzi-imob/yzi-imob-icons-v2";
import { WorkspaceSection } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";

// Radar do YZI IMOB — centro de inteligência, não relatório passivo.
// Hierarquia aprovada: O que mudou hoje (eventos com peso) → Por que mudou →
// O que fazer agora → Investigar tema (recurso claramente secundário).
// Estado honesto: movimentos mock — nenhum sinal é real, nenhuma fonte está
// conectada, nenhuma ação dispara. Substitui "Insights" como tela separada.

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

const MOVEMENT_ICON: Record<MovementKind, Glyph> = {
  crescimento: TrendUpIcon,
  queda: TrendDownIcon,
  aquecimento: FlameIcon,
  saturacao: StackIcon,
  lancamento: PropertyIcon,
  oportunidade: TargetIcon,
};

// Prioridade alta primeiro — a primeira dobra responde "o que mudou hoje"
// na ordem em que merece atenção.
const PRIORITY_ORDER = { alta: 0, media: 1, observar: 2 } as const;
const ORDERED_MOVEMENTS = [...DEMO_MOVEMENTS].sort(
  (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
);

function MovementCard({ movement }: { movement: DemoMovement }) {
  const meta = MOVEMENT_META[movement.kind];
  const priority = PRIORITY_META[movement.priority];
  const Glyph = MOVEMENT_ICON[movement.kind];

  return (
    <article className="flex gap-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-4 shadow-[var(--yzi-edge-highlight)]">
      {/* Tile do evento — cor funcional do tipo de movimento. */}
      <span
        aria-hidden
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--yzi-radius-md)] border"
        style={{
          borderColor: imobRgba(meta.role, 0.3),
          backgroundColor: imobRgba(meta.role, 0.1),
          color: imobRgba(meta.role, 0.95),
        }}
      >
        <Glyph className="h-[18px] w-[18px]" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.66rem]">
          <span className="font-medium" style={{ color: imobRgba(meta.role, 0.95) }}>
            {meta.label}
          </span>
          <span aria-hidden className="text-[var(--yzi-text-faint)]">
            ·
          </span>
          <span className="text-[var(--yzi-text-secondary)]">{movement.areaLabel}</span>
          <span
            className="ml-auto rounded-full border px-2 py-0.5 text-[0.62rem]"
            style={{
              borderColor: imobRgba(priority.role, 0.32),
              backgroundColor: imobRgba(priority.role, 0.1),
              color: imobRgba(priority.role, 0.95),
            }}
          >
            {priority.label}
          </span>
        </div>

        <p className="text-[0.9rem] font-medium leading-snug text-[var(--yzi-text-primary)]">
          {movement.whatLabel}
        </p>

        <p className="flex items-start gap-1.5 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          <ArrowRightIcon
            aria-hidden
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            style={{ color: imobRgba("cyan", 0.85) }}
          />
          {movement.actionLabel}
        </p>
      </div>
    </article>
  );
}

export function YziImobRadarWorkspace() {
  const [theme, setTheme] = useState("");

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-8 py-10">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.01em] text-[var(--yzi-text-primary)]">
          Radar
        </h1>
        <p className="text-[0.82rem] text-[var(--yzi-text-secondary)]">
          O que mudou na sua operação, por que mudou e o que fazer agora.
        </p>
      </header>

      <div className="flex flex-col gap-7">
        <WorkspaceSection
          first
          title="O que mudou hoje"
          description="Movimentos da operação em ordem de prioridade — não métricas soltas."
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {ORDERED_MOVEMENTS.map((movement) => (
              <MovementCard key={movement.id} movement={movement} />
            ))}
          </div>
        </WorkspaceSection>

        <WorkspaceSection
          title="Por que mudou"
          description="O motivo por trás de cada movimento, não só o número."
        >
          <div className="flex flex-col gap-2.5">
            {ORDERED_MOVEMENTS.map((movement) => {
              const meta = MOVEMENT_META[movement.kind];
              return (
                <div key={movement.id} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: imobRgba(meta.role, 0.9) }}
                  />
                  <p className="text-[0.8rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                    <span className="font-medium text-[var(--yzi-text-primary)]">
                      {movement.areaLabel}.
                    </span>{" "}
                    {movement.whyLabel}
                  </p>
                </div>
              );
            })}
          </div>
        </WorkspaceSection>

        <WorkspaceSection
          title="O que fazer agora"
          description="Sugestões executivas — nada é aplicado sem sua aprovação."
        >
          <div className="flex flex-col gap-2.5">
            {ORDERED_MOVEMENTS.map((movement) => {
              const priority = PRIORITY_META[movement.priority];
              return (
                <div key={movement.id} className="flex items-start gap-3">
                  <ArrowRightIcon
                    aria-hidden
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: imobRgba(priority.role, 0.85) }}
                  />
                  <p className="text-[0.8rem] leading-relaxed text-[var(--yzi-text-primary)]">
                    {movement.actionLabel}
                  </p>
                </div>
              );
            })}
          </div>
        </WorkspaceSection>

        {/* Pesquisa — recurso claramente secundário, fora do fluxo principal:
            uma linha quieta, sem seção com o mesmo peso dos movimentos. */}
        <div className="border-t border-[color:var(--yzi-border-subtle)] pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-3.5 py-2.5">
              <SearchIcon aria-hidden className="h-4 w-4 shrink-0 text-[var(--yzi-text-faint)]" />
              <label htmlFor="radar-theme" className="sr-only">
                Investigar um tema específico
              </label>
              <input
                id="radar-theme"
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
                placeholder="Investigar um tema específico — ex.: procura por lançamentos na Barra Sul"
                className="min-w-0 flex-1 bg-transparent text-[0.8rem] text-[var(--yzi-text-primary)] outline-none placeholder:text-[var(--yzi-text-faint)]"
              />
            </div>
            <button
              type="button"
              disabled
              title="Em preparação"
              className="h-10 w-fit cursor-not-allowed rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3.5 text-[0.76rem] text-[var(--yzi-text-faint)] opacity-60"
            >
              Investigar
            </button>
          </div>
          <p className="mt-2 text-[0.7rem] text-[var(--yzi-text-faint)]">
            Em preparação — ainda não há fonte conectada para investigar temas.
          </p>
        </div>
      </div>

      <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Demonstração — movimentos ilustrativos. Nenhum sinal é real, nada é buscado e nenhuma
        ação dispara ainda.
      </p>
    </section>
  );
}
