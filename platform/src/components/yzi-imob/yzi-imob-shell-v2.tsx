"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  // Home do ciclo + Revisar Semana exibem "Marketing" (match por prefixo).
  { match: "/cockpit/yzi-imob/marketing", label: "Marketing" },
  // Resultados precisa vir ANTES de /growth: o match é por prefixo e
  // /growth/resultados também casaria com Growth OS.
  { match: "/cockpit/yzi-imob/growth/resultados", label: "Resultados" },
  { match: "/cockpit/yzi-imob/growth", label: "Growth OS" },
  { match: "/cockpit/yzi-imob/sistema", label: "Sistema" },
  { match: "/cockpit/yzi-imob/imoveis", label: "Imóveis" },
  { match: "/cockpit/yzi-imob/corretores", label: "Corretores" },
  // Mesma nomenclatura da sidebar: a rota de clientes exibe "Leads".
  { match: "/cockpit/yzi-imob/clientes", label: "Leads" },
  { match: "/cockpit/yzi-imob/atendimento", label: "Atendimento" },
  { match: "/cockpit/yzi-imob/agenda", label: "Agenda" },
  { match: "/cockpit/yzi-imob/radar", label: "Radar" },
  { match: "/cockpit/yzi-imob/apis-creditos", label: "APIs & Créditos" },
  { match: "/cockpit/yzi-imob/conexoes", label: "Conexões" },
  { match: "/cockpit/yzi-imob/configuracoes", label: "Configurações" },
  { match: "/cockpit/yzi-imob/site", label: "Site" },
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

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const syncSidebar = () => setCollapsed(media.matches);

    syncSidebar();
    media.addEventListener("change", syncSidebar);

    return () => media.removeEventListener("change", syncSidebar);
  }, []);

  return (
    <div className="yzi-environment yzi-imob-scope flex h-screen w-full overflow-hidden text-[var(--yzi-text-primary)] antialiased">
      <YziImobSidebarV2
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        operatorEmail={operatorEmail}
      />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header slim — orientação, sem virar dashboard. */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-4 sm:px-6 min-[1720px]:px-8">
          <div className="flex min-w-0 items-center gap-2.5 text-[0.72rem]">
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--yzi-accent-trust)] shadow-[0_0_0_3px_var(--yzi-accent-trust-soft)]"
            />
            <span className="shrink-0 font-semibold uppercase tracking-[0.2em] text-[var(--yzi-text-secondary)]">
              YZI IMOB
            </span>
            <span aria-hidden className="shrink-0 text-[var(--yzi-text-faint)]">
              /
            </span>
            <span className="min-w-0 truncate font-medium text-[var(--yzi-text-primary)]">
              {area}
            </span>
          </div>
          {!inspectorOpen ? (
            <button
              type="button"
              onClick={() => setInspectorOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-2.5 py-1.5 text-[0.72rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)]"
              title="Abrir Inspector da YZI"
            >
              <YziPresence state="ready" />
              YZI
            </button>
          ) : null}
        </header>

        {/* Canvas principal — uma tarefa por vez. */}
        <div className="yzi-main-scroll relative flex min-h-0 flex-1 flex-col overflow-x-hidden">
          {children}
        </div>
      </main>

      {inspectorOpen ? (
        <>
          <button
            type="button"
            aria-label="Fechar Inspector"
            className="fixed inset-0 z-30 bg-black/45 min-[1280px]:hidden"
            onClick={() => setInspectorOpen(false)}
          />
          <YziImobInspectorV2 onClose={() => setInspectorOpen(false)} />
        </>
      ) : null}
    </div>
  );
}
