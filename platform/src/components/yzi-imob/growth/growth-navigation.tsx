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

// Cada surface Growth vive em sua própria rota. O caminho fica centralizado
// aqui para que a navegação real (Link) e o restante do produto usem a
// mesma fonte de verdade.
export const GROWTH_ROUTE: Record<GrowthSurface, string> = {
  briefing: "/cockpit/yzi-imob/growth/briefing",
  conteudo: "/cockpit/yzi-imob/growth/conteudo",
  biblioteca: "/cockpit/yzi-imob/growth/biblioteca",
  campanhas: "/cockpit/yzi-imob/growth/campanhas",
  resultados: "/cockpit/yzi-imob/growth/resultados",
};

// Navegação própria do Growth OS: cada aba é um link real para a rota da
// surface (nunca só um toggle de estado local — cada surface é uma página
// própria, então a navegação precisa mudar a URL de verdade). A superfície
// ativa é claramente principal (peso + sublinhado de gelo); as demais ficam
// em texto secundário — evita aparência de menu genérico.
export function GrowthNavigation({
  active,
  onChange,
}: {
  active: GrowthSurface;
  onChange?: (id: GrowthSurface) => void;
}) {
  return (
    <div role="tablist" className="flex flex-wrap items-center gap-0.5 border-b border-[color:var(--yzi-border-subtle)] pb-px">
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
              "relative -mb-px inline-flex items-center gap-1.5 px-3.5 pb-2.5 pt-1.5 text-[0.8rem] transition-colors",
              isActive
                ? "font-semibold text-[var(--yzi-text-primary)]"
                : "text-[var(--yzi-text-secondary)] hover:text-[var(--yzi-text-primary)]",
            )}
          >
            {tab.label}
            {isActive ? (
              <span
                aria-hidden
                className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-[rgba(var(--imob-ice),0.75)]"
              />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
