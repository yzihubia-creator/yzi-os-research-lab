"use client";

import type { ReactNode } from "react";

// YZI IMOB — Ambiente de demonstração (Unidade 3, correção de UX/UI).
//
// Isola qualquer superfície de demo/inspeção técnica (ex.: o preview antigo
// do runtime) da operação real da run persistida, para que uma nunca compita
// visualmente com a outra. Fechado por padrão (<details> nativo, sem
// dependência extra) — o gestor só vê se abrir de propósito. Não altera nem
// remove o conteúdo do demo; apenas o isola abaixo do workspace real.
export function YziImobDemoEnvironment({ children }: { children: ReactNode }) {
  return (
    <details className="group rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-xs font-medium uppercase tracking-[0.08em] text-[var(--yzi-text-faint)] marker:content-['']">
        <span>Ambiente de demonstração — não é a operação real</span>
        <span className="text-[var(--yzi-text-faint)] transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="border-t border-[color:var(--yzi-border-subtle)]">
        {children}
      </div>
    </details>
  );
}
