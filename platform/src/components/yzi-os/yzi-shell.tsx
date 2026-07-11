"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { YziAssistantDock } from "@/components/yzi-os/yzi-assistant-dock";
import {
  YziPresence,
  YziStatusBadge,
  YziSurface,
} from "@/components/yzi-os/yzi-primitives";
import { YziSidebar } from "@/components/yzi-os/yzi-sidebar";
import { YziImobShellV2 } from "@/components/yzi-imob/yzi-imob-shell-v2";

const CONTEXT_LABELS: Array<{ match: string; label: string }> = [
  { match: "/cockpit/dashboard", label: "Dashboards" },
  { match: "/cockpit/radar", label: "Radar" },
  { match: "/cockpit/oportunidades", label: "Oportunidades" },
  { match: "/cockpit/acoes", label: "Ações" },
  { match: "/cockpit/autorizacoes", label: "Autorizações" },
  { match: "/cockpit/canais", label: "Canais" },
  { match: "/cockpit/busca-semantica", label: "Busca Semântica" },
  { match: "/cockpit/ativos", label: "Ativos" },
  { match: "/cockpit/trafego-pago", label: "Tráfego" },
  { match: "/cockpit/crm", label: "Relacionamento" },
  { match: "/cockpit/financeiro", label: "Financeiro" },
  { match: "/cockpit/agenda", label: "Agenda" },
  { match: "/cockpit/assistente", label: "Assistente YZI" },
  { match: "/cockpit/configuracoes", label: "Configurações" },
  { match: "/cockpit", label: "Command Center" },
];

function contextLabel(pathname: string): string {
  return (
    CONTEXT_LABELS.find(
      (entry) => pathname === entry.match || pathname.startsWith(`${entry.match}/`),
    )?.label ?? "Command Center"
  );
}

export function YziShell({
  children,
  operatorEmail,
}: {
  children: ReactNode;
  operatorEmail?: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const capability = contextLabel(pathname);
  const initial = (operatorEmail?.trim()?.[0] ?? "Y").toUpperCase();

  // A vertical YZI IMOB tem seu próprio casco visual (Workspace Shell v2). Aqui
  // trocamos todo o chrome do YZI OS por ele; a auth continua no layout do
  // cockpit e no middleware, intocada.
  if (pathname === "/cockpit/yzi-imob" || pathname.startsWith("/cockpit/yzi-imob/")) {
    return (
      <YziImobShellV2 operatorEmail={operatorEmail}>{children}</YziImobShellV2>
    );
  }

  return (
    <div className="yzi-environment flex min-h-screen w-full text-[var(--yzi-text-primary)] antialiased">
      <YziSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        operatorEmail={operatorEmail}
      />
      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="yzi-glass sticky top-0 z-10 shrink-0 border-b">
          <div className="flex h-14 items-center justify-between gap-4 px-6 text-[var(--yzi-text-primary)]">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="font-medium tracking-[0.16em] text-[var(--yzi-text-secondary)] uppercase">
                Cockpit
              </span>
              <span aria-hidden className="text-[var(--yzi-text-faint)]">
                /
              </span>
              <span className="font-medium text-[var(--yzi-text-primary)]">
                {capability}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <YziStatusBadge tone="preview">operação · preview</YziStatusBadge>
              <YziSurface
                aria-hidden
                title={operatorEmail ?? "Operador"}
                variant="elevated"
                className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full p-0 text-[0.7rem] font-semibold"
              >
                <YziPresence
                  state="ready"
                  className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5"
                />
                {initial}
              </YziSurface>
            </div>
          </div>
        </header>
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
      </main>
      {/* Contrato v1.2: na home o hero da YZI é a superfície de conversa, então o
          dock abre recolhido (rail) para não competir com o hero. */}
      <YziAssistantDock
        key={pathname === "/cockpit" ? "home" : "surface"}
        defaultCollapsed={pathname === "/cockpit"}
      />
    </div>
  );
}
