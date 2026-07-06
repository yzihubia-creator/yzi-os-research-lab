"use client";

import { useEffect, useState } from "react";

import { GrowthCounterStrip, GrowthInspectorPanel, GrowthNavigation, GrowthSurfaceHeader, type GrowthSurface } from "@/components/yzi-imob/growth";
import { ComingSoonPanel } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import { getLearnings } from "@/lib/yzi-imob/growth-intelligence/mock-brain";

export function YziImobGrowthResultadosV0() {
  const [activeSurface, setActiveSurface] = useState<GrowthSurface>("resultados");
  const { select } = useYziImobWorkspace();
  const learnings = getLearnings();

  useEffect(() => {
    select({
      name: "Resultados",
      subtitle: "Growth OS · Em construção",
      statusLabel: "Em construção",
      situation:
        "As métricas reais de resultado dependem de integrações que ainda não existem (GA4, Search Console, Meta, Google). Por enquanto, esta superfície só pode mostrar o que já foi aprendido em Briefing.",
      pendencies: ["Integração com GA4 ainda não conectada", "Integração com Meta/Google Ads ainda não conectada"],
      checklist: [
        { label: "Aprendizados registrados no Briefing", done: learnings.length > 0 },
        { label: "Métrica real de tráfego conectada", done: false },
        { label: "Métrica real de campanha conectada", done: false },
      ],
      score: 0,
      scoreLabel: "Progresso da integração real",
      nextAction: "Aguardar a conexão das fontes de dados reais antes de exibir qualquer métrica como resultado real.",
      suggestions: ["Nenhum resultado real está sendo medido nesta unidade.", "Dados de demonstração."],
      history: [`${learnings.length} aprendizados registrados a partir de decisões simuladas no Briefing.`],
    });
  }, [select, learnings.length]);

  return (
    <section className="flex min-h-full w-full flex-col gap-7 px-6 pb-10 pt-6 xl:px-8">
      <header className="flex w-full flex-col gap-5">
        <div className="flex w-full flex-col gap-4">
          <GrowthSurfaceHeader
            title="Resultados"
            subtitle="Leitura honesta de performance, evidências e aprendizados."
          />

          <GrowthCounterStrip
            counters={[
              { label: "Métricas reais", value: "0", detail: "Dependem de integrações futuras." },
              { label: "Fonte de dados", value: "Nenhuma conectada", detail: "GA4, Search Console e Meta não conectados." },
              {
                label: "Aprendizados",
                value: String(learnings.length),
                detail: "Registrados a partir de decisões no Briefing.",
              },
              { label: "Campanhas medidas", value: "0", detail: "Nenhuma campanha real foi executada ainda." },
              { label: "Status", value: "Em construção", detail: "Superfície ainda não disponível para uso real." },
            ]}
          />
        </div>

        <GrowthNavigation active={activeSurface} onChange={setActiveSurface} />
      </header>

      <div className="grid min-h-0 grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_368px]">
        <main className="flex min-w-0 flex-col gap-5">
          <ComingSoonPanel
            label="Em construção — métricas reais dependem das integrações futuras."
            note="Nenhuma fonte externa (GA4, Search Console, Meta ou Google) está conectada. Nada aqui representa performance real."
          />
        </main>

        <aside className="flex min-w-0 flex-col gap-4">
          <GrowthInspectorPanel
            title="Inspector YZI"
            sections={[
              {
                label: "O que esta superfície vai fazer",
                value: "Mostrar performance real de conteúdo e campanhas, sempre citando a fonte e o período dos dados.",
              },
              {
                label: "O que ainda não existe",
                value: "Conexão com GA4, Search Console, Meta ou Google Ads. Nenhum número aqui vem de canal real.",
              },
              {
                label: "Honestidade",
                value: "Todos os dados desta tela são de demonstração. Nenhuma inteligência real está conectada.",
              },
            ]}
            note="Dados de demonstração. Nenhuma métrica real foi medida."
          />
        </aside>
      </div>
    </section>
  );
}
