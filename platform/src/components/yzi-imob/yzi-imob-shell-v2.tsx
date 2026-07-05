"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import { YziPresence } from "@/components/yzi-os/yzi-primitives";
import { YziImobSidebarV2 } from "@/components/yzi-imob/yzi-imob-sidebar-v2";
import { YziImobInspectorV2 } from "@/components/yzi-imob/yzi-imob-inspector-v2";
import {
  YziImobWorkspaceProvider,
  useYziImobWorkspace,
} from "@/components/yzi-imob/yzi-imob-workspace-context";

// Workspace Shell v2 do YZI IMOB (Workspace Architecture v1):
// Sidebar → Canvas Principal → Inspector Contextual (YZI).
// Substitui o chrome do YZI OS apenas dentro da vertical /cockpit/yzi-imob.
// Não toca auth (proteção continua no layout do cockpit e no middleware),
// não usa dados reais, não fala com Runtime/API/banco.

const AREA_LABELS: Array<{ match: string; label: string }> = [
  { match: "/cockpit/yzi-imob/growth/biblioteca", label: "Growth OS / Biblioteca" },
  { match: "/cockpit/yzi-imob/growth/conteudo", label: "Growth OS / Conteúdo" },
  { match: "/cockpit/yzi-imob/imoveis", label: "Imóveis" },
  { match: "/cockpit/yzi-imob/studio", label: "Creative Studio" },
  { match: "/cockpit/yzi-imob/site", label: "Site" },
  { match: "/cockpit/yzi-imob/catalogo", label: "Catálogo" },
  { match: "/cockpit/yzi-imob/runtime", label: "Runtime" },
  { match: "/cockpit/yzi-imob/briefing", label: "Briefing" },
  { match: "/cockpit/yzi-imob", label: "Início" },
];

function areaLabel(pathname: string): string {
  return (
    AREA_LABELS.find(
      (entry) => pathname === entry.match || pathname.startsWith(`${entry.match}/`),
    )?.label ?? "Início"
  );
}

export function YziImobShellV2({
  children,
  operatorEmail,
}: {
  children: ReactNode;
  operatorEmail?: string | null;
}) {
  // Provider partilha a seleção do Canvas com o Inspector (YZI), renderizado
  // aqui fora de `children`. Sem isso o Inspector não teria como reagir ao
  // imóvel selecionado. Na home hero-first (contrato v1.2), o Inspector abre
  // fechado/discreto para não competir com o hero da YZI.
  const pathname = usePathname();
  const isHome = pathname === "/cockpit/yzi-imob";

  return (
    <YziImobWorkspaceProvider defaultOpen={!isHome}>
      <YziImobShellBody operatorEmail={operatorEmail}>{children}</YziImobShellBody>
    </YziImobWorkspaceProvider>
  );
}

function YziImobShellBody({
  children,
  operatorEmail,
}: {
  children: ReactNode;
  operatorEmail?: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { open: inspectorOpen, setOpen: setInspectorOpen } = useYziImobWorkspace();
  const pathname = usePathname();
  const area = areaLabel(pathname);

  return (
    <div className="yzi-environment yzi-imob-scope flex min-h-screen w-full text-[var(--yzi-text-primary)] antialiased">
      <YziImobSidebarV2
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        operatorEmail={operatorEmail}
      />

      <main className="relative flex min-w-0 flex-1 flex-col">
        {/* Header slim — orientação, sem virar dashboard. */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-8">
          <div className="flex items-center gap-2.5 text-[0.72rem]">
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--yzi-accent-trust)] shadow-[0_0_0_3px_var(--yzi-accent-trust-soft)]"
            />
            <span className="font-semibold uppercase tracking-[0.2em] text-[var(--yzi-text-secondary)]">
              YZI IMOB
            </span>
            <span aria-hidden className="text-[var(--yzi-text-faint)]">
              /
            </span>
            <span className="font-medium text-[var(--yzi-text-primary)]">{area}</span>
          </div>
          {!inspectorOpen ? (
            <button
              type="button"
              onClick={() => setInspectorOpen(true)}
              className="hidden items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-2.5 py-1.5 text-[0.72rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)] xl:inline-flex"
              title="Abrir Inspector da YZI"
            >
              <YziPresence state="ready" />
              YZI
            </button>
          ) : null}
        </header>

        {/* Canvas principal — uma tarefa por vez. */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </main>

      {inspectorOpen ? (
        <YziImobInspectorV2 onClose={() => setInspectorOpen(false)} />
      ) : null}
    </div>
  );
}
