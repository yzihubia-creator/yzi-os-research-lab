"use client";

import { useEffect, useMemo } from "react";

import {
  GrowthCounterStrip,
  GrowthDemoMediaCard,
  GrowthInspectorPanel,
  GrowthNavigation,
  GrowthSectionCard,
  GrowthSurfaceHeader,
  GrowthTag,
} from "@/components/yzi-imob/growth";
import { MOCK_DEMO_MEDIA } from "@/lib/yzi-imob/demo-media/mock-demo-media";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import { getLearnings } from "@/lib/yzi-imob/growth-intelligence/mock-brain";

const DEMO_EXAMPLES = [
  "Exemplo futuro: comparar criativo aprovado com leads gerados por campanha.",
  "Exemplo futuro: registrar custo por lead somente quando a fonte real estiver conectada.",
  "Exemplo futuro: transformar aprendizado de venda/perda em próxima recomendação.",
];

const RESULTS_PREVIEW_IDS = ["demo_altiplano_reel", "demo_cabo_branco_carrossel", "demo_bessa_site"];
const RESULTS_PREVIEW_ITEMS = MOCK_DEMO_MEDIA.filter((item) => RESULTS_PREVIEW_IDS.includes(item.id));

export function YziImobGrowthResultadosV0() {
  const { select } = useYziImobWorkspace();
  const learnings = useMemo(() => getLearnings(), []);
  const counters = [
    { label: "Resultados reais", value: "0", detail: "dependem de integrações futuras" },
    { label: "Campanhas medidas", value: "0", detail: "nenhuma campanha real executada" },
    { label: "Fontes conectadas", value: "0", detail: "GA4, Search Console, Meta e Google ausentes" },
    { label: "Aprendizados mock", value: String(learnings.length), detail: "vindos da simulação de briefing" },
    { label: "Status", value: "Em construção", detail: "rota real, dashboard futuro" },
  ];

  useEffect(() => {
    select({
      name: "Resultados",
      subtitle: "Growth OS · Estado futuro honesto",
      statusLabel: "Em construção",
      situation:
        "Resultados reais dependem de integrações futuras. Esta rota existe para mostrar o lugar da leitura de performance, sem fingir métrica real.",
      pendencies: [
        "GA4 não conectado",
        "Search Console não conectado",
        "Meta Ads não conectado",
        "Google Ads não conectado",
      ],
      checklist: [
        { label: "Rota Growth OS disponível", done: true },
        { label: "Aprendizados mockados disponíveis", done: learnings.length > 0 },
        { label: "Fonte real de tráfego conectada", done: false },
        { label: "Fonte real de campanha conectada", done: false },
      ],
      score: 0,
      scoreLabel: "Maturidade de medição real",
      nextAction: "Conectar fontes reais em uma unidade futura antes de exibir métricas como performance.",
      suggestions: ["Não usar KPI mockado como resultado real.", "Manter exemplos claramente marcados como demonstração."],
      history: learnings.map((learning) => learning.title),
    });
  }, [select, learnings]);

  return (
    <section className="yzi-growth-surface flex min-h-full w-full flex-col gap-6 px-4 pb-10 pt-5 sm:px-6 min-[1720px]:px-8">
      <header className="flex w-full flex-col gap-5">
        <div className="flex w-full flex-col gap-4">
          <GrowthSurfaceHeader
            title="Resultados"
            subtitle="Resultados em construção. Métricas reais dependem de integrações futuras."
          />

          <GrowthCounterStrip counters={counters} />
        </div>

        <GrowthNavigation active="resultados" />
      </header>

      <div className="grid min-h-0 grid-cols-1 gap-4 min-[1760px]:grid-cols-[minmax(0,1fr)_330px]">
        <main className="flex min-w-0 flex-col gap-4">
          <section className="yzi-lens flex flex-col gap-3 rounded-[var(--yzi-radius-lg)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[1.1rem] font-semibold text-[var(--yzi-text-primary)]">Resultados em construção</h2>
              <GrowthTag>Demonstração</GrowthTag>
            </div>
            <p className="max-w-3xl text-[0.86rem] leading-relaxed text-[var(--yzi-text-secondary)]">
              Esta tela não mostra dashboard real porque as fontes de performance ainda não estão conectadas. Quando
              Meta, Google, GA4 ou Search Console forem autorizados por tenant, os números poderão aparecer com fonte,
              período e evidência.
            </p>
          </section>

          <GrowthSectionCard title="Exemplos discretos de leitura futura">
            <ul className="flex flex-col gap-2">
              {DEMO_EXAMPLES.map((example) => (
                <li key={example} className="text-[0.82rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                  {example}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              {RESULTS_PREVIEW_ITEMS.map((item) => (
                <GrowthDemoMediaCard key={item.id} item={item} size="sm" />
              ))}
            </div>
          </GrowthSectionCard>

          <GrowthSectionCard title="Aprendizados disponíveis no mock">
            <div className="flex flex-col divide-y divide-[color:var(--yzi-border-subtle)]">
              {learnings.map((learning) => (
                <div key={learning.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-[0.84rem] font-medium text-[var(--yzi-text-primary)]">{learning.title}</p>
                  <p className="mt-1 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">{learning.detail}</p>
                </div>
              ))}
            </div>
          </GrowthSectionCard>
        </main>

        <aside className="flex min-w-0 flex-col gap-4">
          <GrowthInspectorPanel
            title="Inspector YZI"
            sections={[
              {
                label: "O que falta",
                value: "Integrações reais de tráfego, busca e mídia. Sem elas, não existe performance confiável.",
              },
              {
                label: "O que posso mostrar agora",
                value: "Apenas aprendizados de demonstração e o modelo de leitura futura.",
              },
              {
                label: "Como evitar falso dashboard",
                value: "Todo número real futuro deve ter fonte, período e vínculo com campanha ou conteúdo.",
              },
              {
                label: "Próxima ação recomendada",
                value: <p className="text-[var(--yzi-text-primary)]">Planejar integrações em unidade própria, com aprovação humana.</p>,
              },
            ]}
            note="Nenhum KPI real foi medido. Nenhuma integração externa foi chamada."
          />
        </aside>
      </div>
    </section>
  );
}
