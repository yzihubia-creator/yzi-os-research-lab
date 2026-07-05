"use client";

import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";

import type { GrowthCounter } from "./types";

// Full-bleed: as três surfaces Growth (Briefing, Conteúdo, Biblioteca) usam o
// mesmo padding horizontal no container pai (px-6 xl:px-8). A margem negativa
// aqui cancela exatamente esse padding, então a faixa encosta nas bordas da
// área útil da surface — nunca no viewport, então a sidebar global nunca é
// atravessada e não há scroll horizontal. O padding interno das colunas de
// ponta compensa a margem removida para o texto continuar alinhado ao header.
export function GrowthCounterStrip({ counters }: { counters: GrowthCounter[] }) {
  const lastIndex = counters.length - 1;

  return (
    <div className="yzi-imob-strip -mx-6 grid w-[calc(100%+3rem)] grid-cols-1 overflow-hidden sm:grid-cols-2 lg:grid-cols-5 xl:-mx-8 xl:w-[calc(100%+4rem)]">
      {counters.map((counter, index) => (
        <div
          key={counter.label}
          className={cx(
            "flex flex-col gap-2 border-[color:var(--yzi-border-subtle)] px-5 py-4",
            index > 0 && "border-t sm:border-l sm:border-t-0",
            index === 4 && "lg:border-t-0",
            index === 0 && "pl-6 xl:pl-8",
            index === lastIndex && "pr-6 xl:pr-8",
          )}
        >
          <span className="text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[var(--yzi-text-faint)]">
            {counter.label}
          </span>
          <span className="text-[1.8rem] font-semibold leading-none tracking-tight text-[var(--yzi-text-primary)] tabular-nums">
            {counter.value}
          </span>
          <span className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-secondary)]">{counter.detail}</span>
        </div>
      ))}
    </div>
  );
}

