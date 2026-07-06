"use client";

import Link from "next/link";

import { cx, type WorkspaceTab } from "@/components/yzi-imob/yzi-imob-workspace-kit";

import type { GrowthSurface } from "./types";

export const GROWTH_SURFACES: Array<WorkspaceTab & { id: GrowthSurface }> = [
  { id: "briefing", label: "Briefing" },
  { id: "conteudo", label: "Conteúdo" },
  { id: "biblioteca", label: "Biblioteca" },
  { id: "campanhas", label: "Campanhas" },
  { id: "resultados", label: "Resultados" },
];

export const GROWTH_ROUTE: Record<GrowthSurface, string> = {
  briefing: "/cockpit/yzi-imob/growth/briefing",
  conteudo: "/cockpit/yzi-imob/growth/conteudo",
  biblioteca: "/cockpit/yzi-imob/growth/biblioteca",
  campanhas: "/cockpit/yzi-imob/growth/campanhas",
  resultados: "/cockpit/yzi-imob/growth/resultados",
};

export function GrowthNavigation({
  active,
  onChange,
}: {
  active: GrowthSurface;
  onChange?: (id: GrowthSurface) => void;
}) {
  return (
    <nav
      aria-label="Growth OS"
      className="flex flex-wrap items-center gap-1 rounded-[var(--yzi-radius-md)] border border-[rgba(var(--imob-ice),0.12)] bg-[rgba(var(--imob-deep),0.12)] p-1 shadow-[var(--yzi-edge-highlight)]"
    >
      {GROWTH_SURFACES.map((tab) => {
        const isActive = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={GROWTH_ROUTE[tab.id]}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(tab.id)}
            className={cx(
              "relative inline-flex min-h-9 items-center rounded-[var(--yzi-radius-sm)] px-3.5 text-[0.78rem] font-medium transition-[background,border-color,color] duration-[var(--duration-fast)]",
              isActive
                ? "border border-[rgba(var(--imob-ice),0.25)] bg-[rgba(var(--imob-cold),0.13)] text-[var(--yzi-text-primary)]"
                : "border border-transparent text-[var(--yzi-text-secondary)] hover:bg-[rgba(255,255,255,0.035)] hover:text-[var(--yzi-text-primary)]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
