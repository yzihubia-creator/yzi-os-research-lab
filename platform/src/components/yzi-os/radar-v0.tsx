"use client";

import Link from "next/link";
import { useState } from "react";

import { CommandCenterIcon, RadarIcon } from "@/components/yzi-os/yzi-icons";
import {
  YziAlert,
  YziBadge,
  YziInput,
  YziPanel,
  YziStatusBadge,
  YziSurface,
} from "@/components/yzi-os/yzi-primitives";

type AnalysisBlock = {
  key: string;
  title: string;
  emptyLabel: string;
  hint: string;
};

// Estrutura honesta da análise do Radar v0.1. Todos os blocos nascem vazios:
// não há fonte conectada nem dado automático nesta fase.
const analysisBlocks: AnalysisBlock[] = [
  {
    key: "signals",
    title: "Sinais",
    emptyLabel: "Sem sinais ainda",
    hint: "Tendência, demanda e busca aparecem aqui quando você conectar uma fonte.",
  },
  {
    key: "opportunity",
    title: "Nível de oportunidade",
    emptyLabel: "Ainda não avaliado",
    hint: "Quão promissor o tema parece, com base nos sinais coletados.",
  },
  {
    key: "why",
    title: "Por que importa",
    emptyLabel: "Aguardando análise",
    hint: "O motivo estratégico para a YZIHUB agir — ou não — sobre o tema.",
  },
  {
    key: "action",
    title: "Próximo passo",
    emptyLabel: "Depende da sua aprovação",
    hint: "O Radar sugere; nada acontece sem você aprovar.",
  },
  {
    key: "missing",
    title: "O que ainda falta",
    emptyLabel: "A definir na primeira análise",
    hint: "Quais dados faltam para decidir com segurança.",
  },
  {
    key: "source",
    title: "Fonte para aprofundar",
    emptyLabel: "Nenhuma fonte conectada",
    hint: "Qual conexão destrava a próxima camada de profundidade.",
  },
];

export function RadarV0() {
  // Estado puramente local. Não persiste, não faz fetch, não dispara análise.
  const [theme, setTheme] = useState("");
  const trimmedTheme = theme.trim();

  return (
    <section className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-7 px-6 py-10">
      <div className="flex flex-col gap-4">
        <Link
          href="/cockpit"
          className="inline-flex w-fit items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-1.5 text-xs text-[var(--yzi-text-secondary)] transition-colors hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]"
        >
          <CommandCenterIcon className="h-3.5 w-3.5" />
          Voltar ao Cockpit
        </Link>
        <div className="flex flex-col gap-3">
          <YziStatusBadge tone="preview" className="w-fit">
            versão inicial
          </YziStatusBadge>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-[var(--yzi-text-primary)]">
            <RadarIcon className="h-6 w-6" />
            Radar
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            O Radar é onde você descobre o que está crescendo no seu mercado e
            decide onde vale a pena agir. Ele transforma um tema em uma leitura
            estruturada que termina em um próximo passo claro.
          </p>
        </div>
      </div>

      <YziAlert tone="info" title="O Radar ainda não está conectado a fontes">
        Por enquanto, use este espaço para estruturar uma hipótese de mercado.
        Quando você conectar fontes, o Radar passa a ler sinais reais — e nenhuma
        recomendação é executada sem a sua aprovação.
      </YziAlert>

      <YziSurface variant="elevated" className="flex flex-col gap-3 p-5">
        <label
          htmlFor="radar-theme"
          className="text-sm font-medium text-[var(--yzi-text-primary)]"
        >
          Qual tema, mercado ou oferta você quer analisar?
        </label>
        <YziInput
          id="radar-theme"
          variant="composer"
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
          placeholder="ex.: automação para imobiliárias, CRM com IA, tráfego para clínicas"
        />
        <p className="text-xs leading-relaxed text-[var(--yzi-text-faint)]">
          O Radar ainda não busca dados automaticamente. O que você escreve aqui
          fica só nesta tela, para ajudar a enquadrar a hipótese.
        </p>
      </YziSurface>

      <div className="flex flex-col gap-4">
        <YziPanel variant="yzi" className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
              Tema em análise
            </h2>
            <YziBadge tone={trimmedTheme ? "trust" : "neutral"}>
              {trimmedTheme ? "rascunho" : "sem tema"}
            </YziBadge>
          </div>
          <p className="text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            {trimmedTheme
              ? trimmedTheme
              : "Escreva um tema no campo acima para enquadrar a análise."}
          </p>
        </YziPanel>

        <div className="flex flex-col gap-2">
          <span className="px-0.5 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[var(--yzi-text-faint)]">
            Estrutura da análise
          </span>
          <p className="px-0.5 text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
            Quando houver fonte conectada, estas áreas mostram sinais,
            oportunidade e o próximo passo recomendado.
          </p>
          <div className="mt-1 grid gap-3 sm:grid-cols-2">
            {analysisBlocks.map((block) => (
              <YziPanel key={block.key} className="flex min-h-32 flex-col gap-2">
                <h3 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
                  {block.title}
                </h3>
                <p className="text-xs font-medium text-[var(--yzi-text-faint)]">
                  {block.emptyLabel}
                </p>
                <p className="mt-auto text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
                  {block.hint}
                </p>
              </YziPanel>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
