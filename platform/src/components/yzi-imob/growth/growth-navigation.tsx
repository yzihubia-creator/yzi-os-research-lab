"use client";

import { cx, type WorkspaceTab } from "@/components/yzi-imob/yzi-imob-workspace-kit";

import type { GrowthSurface } from "./types";

export const GROWTH_SURFACES: Array<WorkspaceTab & { id: GrowthSurface }> = [
  { id: "briefing", label: "Briefing" },
  { id: "estrategia", label: "Estratégia", soon: true },
  { id: "conteudo", label: "Conteúdo" },
  { id: "campanhas", label: "Campanhas", soon: true },
  { id: "biblioteca", label: "Biblioteca", soon: true },
  { id: "resultados", label: "Resultados", soon: true },
];

// Navegação própria do Growth OS: a superfície ativa é claramente principal
// (pill fria com aro de gelo), as demais recuam como texto secundário — evita
// aparência de menu genérico.
export function GrowthNavigation({
  active,
  onChange,
  libraryAvailable = false,
}: {
  active: GrowthSurface;
  onChange: (id: GrowthSurface) => void;
  libraryAvailable?: boolean;
}) {
  const tabs = GROWTH_SURFACES.map((surface) =>
    surface.id === "biblioteca" && libraryAvailable ? { ...surface, soon: false } : surface,
  );

  return (
    <div role="tablist" className="flex flex-wrap items-center gap-0.5 border-b border-[color:var(--yzi-border-subtle)] pb-px">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id as GrowthSurface)}
            className={cx(
              "relative -mb-px inline-flex items-center gap-1.5 px-3.5 pb-2.5 pt-1.5 text-[0.8rem] transition-colors",
              isActive
                ? "font-semibold text-[var(--yzi-text-primary)]"
                : tab.soon
                  ? "text-[var(--yzi-text-faint)] hover:text-[var(--yzi-text-secondary)]"
                  : "text-[var(--yzi-text-secondary)] hover:text-[var(--yzi-text-primary)]",
            )}
          >
            {tab.label}
            {tab.soon ? (
              <span className="rounded-full border border-[color:var(--yzi-border-subtle)] px-1.5 py-px text-[0.54rem] uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
                Em breve
              </span>
            ) : null}
            {isActive ? (
              <span
                aria-hidden
                className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-[rgba(var(--imob-ice),0.75)]"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

