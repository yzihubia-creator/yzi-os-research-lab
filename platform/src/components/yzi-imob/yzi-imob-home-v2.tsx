"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type { CSSProperties, FormEvent } from "react";

import { YziPanel } from "@/components/yzi-os/yzi-primitives";
import { AuthorizationIcon, SendIcon } from "@/components/yzi-os/yzi-icons";
import { CreativeIcon } from "@/components/yzi-imob/yzi-imob-icons-v2";
import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";
import { CounterStrip, type CounterItem } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { MOCK_GROWTH_ASSETS, useGrowthCampaignState } from "@/components/yzi-imob/growth";
import {
  hourGreeting,
  operatorName,
  subscribeNoop,
} from "@/lib/yzi-os/hero-greeting";

// Home hero-first do YZI IMOB (contrato visual v1.2, evoluído em 2026-07-04).
// A YZI é a entidade: orb com presença viva, saudação central, composer-lente.
// A identificação da vertical vive no chrome superior esquerdo (header do
// shell) — não no centro do hero. Mesma atmosfera e material do Command Center,
// porém em paleta fria (petróleo/gelo) própria da vertical. Nenhuma rota, dado
// ou auth muda aqui; estados honestos preservados.

// Um chip por destino — sem dois caminhos para a mesma tela e cada rótulo
// aponta para a rota que promete.
const HERO_ACTIONS: Array<{ label: string; href: string }> = [
  { label: "Cadastrar imóvel", href: "/cockpit/yzi-imob/imoveis" },
  { label: "Criar criativo", href: "/cockpit/yzi-imob/studio" },
  { label: "Ver leads", href: "/cockpit/yzi-imob/clientes" },
  { label: "Agendar visita", href: "/cockpit/yzi-imob/agenda" },
];

// Faixa de contadores — leitura rápida, não analytics. Valores ilustrativos
// (mock honesto); nenhuma fonte de dados real conectada. A nota "Preview" logo
// acima já enquadra a superfície como pré-visualização. Cada contador carrega
// um papel de cor (Material System v1) coerente com o TIPO de dado que
// representa — nunca decorativo: leads novos = qualificação (cyan), visitas
// marcadas = decisão/agenda pendente (lilás), reações a criativos =
// comunicação (cyan), imóveis em preparo = pendência (âmbar).
const COUNTERS: CounterItem[] = [
  { label: "Leads novos", value: "12", detail: "Entraram hoje", role: "cyan" },
  { label: "Visitas marcadas", value: "4", detail: "Próximas 72h", role: "lilac" },
  {
    label: "Postagens com reação",
    value: "18",
    detail: "Reagiram aos criativos",
    role: "cyan",
  },
  { label: "Imóveis em preparo", value: "7", detail: "Aguardando mídia", role: "amber" },
];

// Linhas honestas de operação, sem KPI wall: cada uma é um estado de espera,
// não uma métrica. Rotas reais existentes; nenhum dado real ainda.
const STATIC_OPERATION_LINES: Array<{ label: string; detail: string }> = [
  { label: "Imóveis pendentes", detail: "Sem imóveis aguardando revisão." },
  { label: "Leads sem corretor", detail: "Nenhum lead sem atribuição." },
];

// Atraso de entrada por camada — profundidade também no tempo, não só no espaço.
function rise(delayMs: number): CSSProperties {
  return { animationDelay: `${delayMs}ms` };
}

export function YziImobHomeV2({
  operatorEmail,
}: {
  operatorEmail?: string | null;
}) {
  const [ask, setAsk] = useState("");
  const router = useRouter();
  const name = operatorName(operatorEmail);
  const greeting = useSyncExternalStore(
    subscribeNoop,
    () => hourGreeting(new Date().getHours()),
    () => "Olá",
  );

  // Reflexo do Growth OS: conta peças que ainda dependem de decisão do
  // gestor (status base "Em revisão" ou pedido de ajuste em aberto), lendo o
  // mesmo estado mockado usado em Campanhas e no Property Workspace.
  const { statusFor } = useGrowthCampaignState();
  const pendingPieces = MOCK_GROWTH_ASSETS.filter((asset) => {
    const status = statusFor(asset.id, asset.status);
    return status === "Em revisão" || status === "Ajuste solicitado";
  }).length;

  const operationLines = [
    STATIC_OPERATION_LINES[0],
    {
      label: "Criativos aguardando",
      detail:
        pendingPieces === 0
          ? "Nenhum criativo em fila."
          : `${pendingPieces} peça${pendingPieces > 1 ? "s" : ""} aguardando aprovação em Campanhas.`,
    },
    STATIC_OPERATION_LINES[1],
  ];

  function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/cockpit/yzi-imob/briefing");
  }

  return (
    <div className="yzi-atmosphere yzi-imob-hero flex w-full flex-col">
      <section className="mx-auto flex min-h-[68vh] w-full max-w-2xl flex-col items-center justify-center gap-8 px-6 pb-12 pt-12 text-center md:pt-16">
        <div className="yzi-rise flex flex-col gap-2.5" style={rise(0)}>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-[var(--yzi-text-primary)] md:text-5xl">
            {greeting}
            {name ? `, ${name}` : ""}.
          </h1>
          <p className="text-lg text-[var(--yzi-text-secondary)]">
            O que vamos resolver na operação imobiliária?
          </p>
        </div>

        <form
          onSubmit={handleAsk}
          className="yzi-lens yzi-rise w-full overflow-hidden rounded-[var(--yzi-radius-lg)] text-left"
          style={rise(120)}
        >
          <div className="flex items-center gap-3 px-4 py-4">
            <CreativeIcon
              aria-hidden
              className="h-4.5 w-4.5 shrink-0 text-[var(--yzi-text-faint)]"
            />
            <label htmlFor="yzi-imob-hero-ask" className="sr-only">
              Converse com a YZI sobre imóveis, leads, campanhas ou visitas
            </label>
            <input
              id="yzi-imob-hero-ask"
              value={ask}
              onChange={(event) => setAsk(event.target.value)}
              placeholder="Converse com a YZI sobre imóveis, leads, campanhas ou visitas..."
              className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--yzi-text-primary)] outline-none placeholder:text-[var(--yzi-text-faint)]"
            />
            <button
              type="submit"
              aria-label="Enviar para a YZI"
              title="Enviar para a YZI"
              className="yzi-imob-hero-submit grid h-9 w-9 shrink-0 place-items-center rounded-[var(--yzi-radius-sm)]"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Divisória interna: luz concentrada ao centro — mesma superfície. */}
          <div
            aria-hidden
            className="h-px w-full bg-[linear-gradient(90deg,transparent,var(--yzi-glass-border),transparent)]"
          />

          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">
              Ações rápidas
            </span>
            {HERO_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => router.push(action.href)}
                className="yzi-lens-chip rounded-full px-3 py-1 text-[0.72rem] text-[var(--yzi-text-secondary)]"
              >
                {action.label}
              </button>
            ))}
          </div>
        </form>

        <p
          className="yzi-rise flex items-center gap-1.5 text-[0.68rem]"
          style={{ ...rise(230), color: imobRgba("lilac", 0.72) }}
        >
          <AuthorizationIcon
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: imobRgba("lilac", 0.85) }}
          />
          Preview. Ações externas exigem autorização.
        </p>
      </section>

      {/* Counter Strip — barra estrutural FULL-BLEED do workspace: vive fora do
          max-width do conteúdo, ocupa 100% da área útil depois da sidebar e
          reage ao colapso/expansão dela (o canvas é flex-1; a strip é w-full,
          sem max-width nem mx-auto). Banda azulada, borda só topo/base,
          divisórias verticais sutis; padding interno responsivo nas células.
          Colunas: mobile 1 · tablet 2 · desktop 4. */}
      <section className="yzi-rise w-full pb-9" style={rise(320)}>
        <CounterStrip counters={COUNTERS} variant="home" />
      </section>

      {/* Operação imobiliária — seção full-width com título e LINHA de cards
          arredondados (layout "Seus Cursos" da referência). Estados honestos:
          cada card é uma espera, não uma métrica. */}
      <section
        className="yzi-rise mx-auto w-full max-w-6xl px-6 pb-12 md:px-8"
        style={rise(400)}
      >
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[var(--yzi-text-primary)]">
          Operação imobiliária
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {operationLines.map((line) => (
            <YziPanel key={line.label} variant="default" className="p-5">
              <p className="text-sm font-medium text-[var(--yzi-text-primary)]">
                {line.label}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
                {line.detail}
              </p>
            </YziPanel>
          ))}
        </div>
      </section>
    </div>
  );
}
