"use client";

import { usePathname } from "next/navigation";

import { YziPresence } from "@/components/yzi-os/yzi-primitives";
import { SidebarToggleIcon } from "@/components/yzi-os/yzi-icons";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";

// Inspector v2 — a YZI vive aqui (Entity Workspace Pattern v1). Estrutura
// canônica, sempre a mesma para qualquer entidade (imóvel, e no futuro
// corretor/cliente/campanha/atendimento): Resumo, Pendências, Checklist,
// Readiness, Próxima ação, Sugestões, Histórico. Muda só o conteúdo. Fala
// como coordenadora (Content Language): frase curta, estado honesto. Sem
// dados reais nesta fase — a YZI consulta, interpreta e recomenda, nunca
// executa cadastro/upload.

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
  if (pathname.startsWith("/cockpit/yzi-imob/growth/conteudo")) {
    return {
      situation: "Growth OS / Conteúdo.",
      reading: "Selecione um criativo para eu explicar prontidão, pendências e próxima ação.",
      nextAction: "Aprovação humana antes de qualquer uso externo.",
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

function InspectorSection({
  title,
  children,
  collapsible = false,
}: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  if (collapsible) {
    // Seção secundária: colapsada por padrão para o Inspector caber em 100vh
    // sem virar um segundo eixo de scroll (padrão de painel lateral fixo).
    return (
      <details className="group flex flex-col">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[var(--yzi-text-faint)] transition-colors hover:text-[var(--yzi-text-secondary)] [&::-webkit-details-marker]:hidden">
          {title}
          <span
            aria-hidden
            className="text-[0.6rem] transition-transform duration-[var(--duration-moderate)] ease-[var(--ease-standard)] group-open:rotate-90"
          >
            ›
          </span>
        </summary>
        <div className="pt-2">{children}</div>
      </details>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[var(--yzi-text-faint)]">
        {title}
      </span>
      {children}
    </div>
  );
}

function ReadinessBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[0.72rem]">
        <span className="text-[var(--yzi-text-secondary)]">{label}</span>
        <span className="font-medium tabular-nums text-[var(--yzi-text-primary)]">
          {value}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--yzi-surface-elevated)] shadow-[var(--yzi-glass-stroke-inner)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,rgb(var(--imob-deep)),rgb(var(--imob-cold)))] transition-[width] duration-[var(--duration-moderate)] ease-[var(--ease-standard)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function YziImobInspectorV2({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const { inspection } = useYziImobWorkspace();
  const reading = readingFor(pathname);

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-[min(360px,calc(100vw-1rem))] shrink-0 flex-col overflow-hidden border-l border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-bg-deep)] shadow-[-24px_0_70px_-42px_rgba(0,0,0,0.92)] min-[1280px]:static min-[1280px]:z-auto min-[1280px]:w-[288px] min-[1280px]:shadow-none min-[1720px]:w-[320px]">
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

      {inspection ? (
        // Estrutura canônica do Entity Workspace Pattern v1 — sempre estas 7
        // seções, qualquer entidade. Nunca Runtime, workflow, intent, banco,
        // tool ou fingerprint.
        <div className="yzi-inspector-scroll flex flex-1 flex-col gap-4 px-5 py-2">
          <InspectorSection title="Resumo">
            <div className="flex flex-col gap-1">
              <span className="text-[1rem] font-semibold text-[var(--yzi-text-primary)]">
                {inspection.name}
              </span>
              <span className="text-[0.72rem] text-[var(--yzi-text-secondary)]">
                {inspection.subtitle}
              </span>
              <span className="mt-1 w-fit rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-2.5 py-1 text-[0.66rem] text-[var(--yzi-text-secondary)] shadow-[var(--yzi-edge-highlight)]">
                {inspection.statusLabel}
              </span>
              <p className="mt-1.5 text-[0.92rem] leading-relaxed text-[var(--yzi-text-primary)]">
                {inspection.situation}
              </p>
            </div>
          </InspectorSection>

          <InspectorSection title="Pendências">
            <ul className="flex flex-col gap-1.5">
              {inspection.pendencies.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[0.8rem] leading-snug text-[var(--yzi-text-secondary)]"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--yzi-text-faint)]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </InspectorSection>

          <InspectorSection title="Checklist">
            {/* ok = primária fria (pronto); pendente = âmbar (falta dado/
                bloqueio leve) — nunca cinza neutro para pendência, que
                esconde a prioridade do item. */}
            <ul className="flex flex-col gap-1.5">
              {inspection.checklist.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 text-[0.8rem] leading-snug"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: item.done ? imobRgba("primary", 0.9) : imobRgba("amber", 0.85),
                    }}
                  />
                  <span
                    className={
                      item.done
                        ? "text-[var(--yzi-text-primary)]"
                        : "text-[var(--yzi-text-secondary)]"
                    }
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </InspectorSection>

          <InspectorSection title={inspection.scoreLabel}>
            <ReadinessBar value={inspection.score} label={inspection.scoreLabel} />
          </InspectorSection>

          <InspectorSection title="Próxima ação">
            <div className="flex items-center gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2.5 shadow-[var(--yzi-edge-highlight)]">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--imob-ice))]" />
              <span className="text-[0.8rem] text-[var(--yzi-text-primary)]">
                {inspection.nextAction}
              </span>
            </div>
          </InspectorSection>

          <InspectorSection title="Sugestões" collapsible>
            <ul className="flex flex-col gap-1.5">
              {inspection.suggestions.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[0.8rem] leading-snug text-[var(--yzi-text-secondary)]"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--yzi-text-faint)]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </InspectorSection>

          <InspectorSection title="Histórico" collapsible>
            <ul className="flex flex-col gap-1.5">
              {inspection.history.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[0.78rem] leading-snug text-[var(--yzi-text-faint)]"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--yzi-text-faint)]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </InspectorSection>
        </div>
      ) : (
        <div className="yzi-inspector-scroll flex flex-1 flex-col gap-4 px-5 py-2">
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
            {reading.situation}
          </p>
          <p className="text-[0.98rem] leading-relaxed text-[var(--yzi-text-primary)]">
            {reading.reading}
          </p>
          {reading.nextAction ? (
            <div className="mt-1 flex items-center gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2.5 shadow-[var(--yzi-edge-highlight)]">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--yzi-text-faint)]" />
              <span className="text-[0.78rem] text-[var(--yzi-text-secondary)]">
                {reading.nextAction}
              </span>
            </div>
          ) : null}
        </div>
      )}

      <div className="px-5 py-4">
        <p className="text-[0.64rem] leading-relaxed text-[var(--yzi-text-faint)]">
          Apareço quando há decisão, risco ou algo pronto. Fora disso, recuo.
        </p>
      </div>
    </aside>
  );
}
