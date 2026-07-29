"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Navegação interna da área de Imóveis — única fonte deste markup, usada
// pelo layout da área (app/cockpit/yzi-imob/imoveis/layout.tsx). Some nas
// telas de detalhe (Property Workspace), onde a orientação é o back-link do
// próprio Workspace, não a navegação da área.

const BASE = "/cockpit/yzi-imob/imoveis";

const ITEMS = [
  { label: "Visão geral", href: BASE, exact: true },
  { label: "Catálogo", href: `${BASE}/catalogo`, exact: false },
  { label: "Cadastrar imóvel", href: `${BASE}/novo`, exact: false },
  { label: "Distribuição", href: `${BASE}/distribuicao`, exact: false },
];

export function YziImobImoveisNav() {
  const pathname = usePathname();

  const isSurface =
    pathname === BASE || ITEMS.some((item) => !item.exact && pathname.startsWith(item.href));
  if (!isSurface) return null;

  return (
    <nav
      aria-label="Navegação de Imóveis"
      className="mx-auto w-full max-w-5xl px-8 pt-7"
    >
      <div className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-1 shadow-[var(--yzi-edge-highlight)]">
        {ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "shrink-0 rounded-full bg-[var(--yzi-surface-elevated)] px-3.5 py-1.5 text-[0.78rem] font-medium text-[var(--yzi-text-primary)] shadow-[var(--yzi-edge-highlight)]"
                  : "shrink-0 rounded-full px-3.5 py-1.5 text-[0.78rem] text-[var(--yzi-text-secondary)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--yzi-text-primary)]"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
