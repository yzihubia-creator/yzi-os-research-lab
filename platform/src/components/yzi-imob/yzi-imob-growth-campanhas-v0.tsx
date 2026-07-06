"use client";

import { useEffect, useState } from "react";

import {
  GrowthCounterStrip,
  GrowthInspectorPanel,
  GrowthNavigation,
  GrowthSurfaceHeader,
  MOCK_GROWTH_CAMPAIGNS,
  type GrowthSurface,
} from "@/components/yzi-imob/growth";
import { ComingSoonPanel } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";

export function YziImobGrowthCampanhasV0() {
  const [activeSurface, setActiveSurface] = useState<GrowthSurface>("campanhas");
  const { select } = useYziImobWorkspace();

  useEffect(() => {
    select({
      name: "Campanhas",
      subtitle: "Growth OS · Em construção",
      statusLabel: "Em construção",
      situation:
        "As campanhas ainda não são montadas automaticamente. Esta superfície vai reunir criativos aprovados e decisões do Briefing em uma única campanha, com orçamento e canal definidos por você.",
      pendencies: ["Integração com Meta Ads ainda não conectada", "Integração com Google Ads ainda não conectada"],
      checklist: [
        { label: "Criativos aprovados em Conteúdo", done: true },
        { label: "Decisões do Briefing roteadas para campanha", done: false },
        { label: "Conta de mídia conectada", done: false },
      ],
      score: 0,
      scoreLabel: "Progresso da integração real",
      nextAction: "Aguardar a conexão de contas de mídia e a montagem de campanhas a partir do Briefing.",
      suggestions: ["Nenhuma campanha real será criada nesta unidade.", "Dados de demonstração."],
      history: [`${MOCK_GROWTH_CAMPAIGNS.length} rascunhos conceituais de campanha no mock operacional.`],
    });
  }, [select]);

  return (
    <section className="flex min-h-full w-full flex-col gap-7 px-6 pb-10 pt-6 xl:px-8">
      <header className="flex w-full flex-col gap-5">
        <div className="flex w-full flex-col gap-4">
          <GrowthSurfaceHeader
            title="Campanhas"
            subtitle="Agrupamento de criativos, canal, orçamento e decisões do Briefing."
          />

          <GrowthCounterStrip
            counters={[
              { label: "Campanhas ativas", value: "0", detail: "Nenhuma campanha real foi criada." },
              {
                label: "Rascunhos conceituais",
                value: String(MOCK_GROWTH_CAMPAIGNS.length),
                detail: "Vindos do mock operacional, aguardando orçamento.",
              },
              { label: "Integração Meta", value: "Não conectada", detail: "Aguardando autorização e credencial do tenant." },
              { label: "Integração Google", value: "Não conectada", detail: "Aguardando autorização e credencial do tenant." },
              { label: "Status", value: "Em construção", detail: "Superfície ainda não disponível para uso real." },
            ]}
          />
        </div>

        <GrowthNavigation active={activeSurface} onChange={setActiveSurface} />
      </header>

      <div className="grid min-h-0 grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_368px]">
        <main className="flex min-w-0 flex-col gap-5">
          <ComingSoonPanel
            label="Em construção — campanhas serão montadas a partir de criativos aprovados e decisões do Briefing."
            note="Nenhuma campanha real é criada nesta unidade. Nenhuma conta de mídia (Meta ou Google) está conectada."
          />
        </main>

        <aside className="flex min-w-0 flex-col gap-4">
          <GrowthInspectorPanel
            title="Inspector YZI"
            sections={[
              {
                label: "O que esta superfície vai fazer",
                value: "Reunir criativos aprovados e decisões do Briefing em uma campanha, com canal e orçamento definidos por você.",
              },
              {
                label: "O que ainda não existe",
                value: "Integração real com Meta Ads ou Google Ads. Nenhuma verba é comprometida aqui.",
              },
              {
                label: "Honestidade",
                value: "Todos os dados desta tela são de demonstração. Nenhuma inteligência real está conectada.",
              },
            ]}
            note="Dados de demonstração. Nenhuma publicação, cobrança ou conexão real foi executada."
          />
        </aside>
      </div>
    </section>
  );
}
