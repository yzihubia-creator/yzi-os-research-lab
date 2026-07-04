"use client";

import { usePathname } from "next/navigation";

import { YziPresence } from "@/components/yzi-os/yzi-primitives";
import { SidebarToggleIcon } from "@/components/yzi-os/yzi-icons";

// Inspector v2 — a YZI vive aqui (Workspace Architecture v1). Camada operacional
// contextual e discreta: não é chat, não compete com o Canvas. Fala como
// coordenadora (Content Language): frase curta, começa pela leitura, estado
// honesto. Sem dados reais nesta fase.

type Reading = {
  situation: string;
  reading: string;
  nextAction?: string;
};

function readingFor(pathname: string): Reading {
  if (pathname.startsWith("/cockpit/yzi-imob/imoveis")) {
    return {
      situation: "Catálogo de imóveis.",
      reading: "Selecione um imóvel para eu mostrar pendências e completude.",
      nextAction: "Nenhum imóvel selecionado.",
    };
  }
  if (pathname.startsWith("/cockpit/yzi-imob/studio")) {
    return {
      situation: "Creative Studio.",
      reading: "Aprove um imóvel para eu preparar o criativo.",
    };
  }
  if (pathname.startsWith("/cockpit/yzi-imob/site")) {
    return {
      situation: "Site.",
      reading: "Publico apenas o que você autorizar.",
    };
  }
  return {
    situation: "Bom dia.",
    reading: "Comece por um imóvel. Eu organizo o material e preparo o resto.",
    nextAction: "Sem pendências agora.",
  };
}

export function YziImobInspectorV2({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const reading = readingFor(pathname);

  return (
    <aside className="hidden w-[320px] shrink-0 flex-col border-l border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-bg-deep)] xl:flex">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <YziPresence state="ready" animated />
          <div className="flex flex-col leading-tight">
            <span className="text-[0.9rem] font-semibold tracking-[0.03em] text-[var(--yzi-text-primary)]">
              YZI
            </span>
            <span className="text-[0.64rem] text-[var(--yzi-text-secondary)]">
              acompanha sua operação
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Recolher Inspector"
          title="Recolher"
          className="grid h-7 w-7 place-items-center rounded-[var(--yzi-radius-sm)] text-[var(--yzi-text-faint)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--yzi-text-secondary)]"
        >
          <SidebarToggleIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 py-2">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
          {reading.situation}
        </p>
        <p className="text-[0.98rem] leading-relaxed text-[var(--yzi-text-primary)]">
          {reading.reading}
        </p>
        {reading.nextAction ? (
          <div className="mt-1 flex items-center gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2.5">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--yzi-text-faint)]" />
            <span className="text-[0.78rem] text-[var(--yzi-text-secondary)]">
              {reading.nextAction}
            </span>
          </div>
        ) : null}
      </div>

      <div className="px-5 py-4">
        <p className="text-[0.64rem] leading-relaxed text-[var(--yzi-text-faint)]">
          Apareço quando há decisão, risco ou algo pronto. Fora disso, recuo.
        </p>
      </div>
    </aside>
  );
}
