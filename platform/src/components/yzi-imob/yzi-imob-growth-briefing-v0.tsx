"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  GrowthActionBar,
  GrowthCounterStrip,
  GrowthMockNotice,
  GrowthNavigation,
  GrowthSurfaceHeader,
  GrowthTag,
} from "@/components/yzi-imob/growth";
import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import {
  getAttentionItems,
  getBriefingGreeting,
  getEvidenceByIds,
  getLearnings,
  getOpportunities,
  getPanorama,
  getPendingDecisions,
  ROUTE_LABELS,
  routeDecision,
  SIMULATION_LABEL,
  SIMULATION_NOTE,
} from "@/lib/yzi-imob/growth-intelligence/mock-brain";
import type { BriefingItem, BriefingRoute } from "@/lib/yzi-imob/growth-intelligence/types";
import { propertyDemoAssetSrc } from "@/lib/yzi-imob/demo-media/property-demo-assets";

// Única mídia do Briefing: miniatura discreta na oportunidade vinculada ao
// imóvel demo (Cabo Branco). O Briefing continua leitura, não galeria.
const ITEM_THUMB: Record<string, string> = {
  op_resposta_cabo_branco: propertyDemoAssetSrc("thumbnail"),
};

const CONFIDENCE_LABEL = { alta: "Confiança alta", media: "Confiança média", baixa: "Confiança baixa" } as const;

// Cor como estado operacional: âmbar = atenção, gelo = oportunidade.
const KIND_ROLE: Record<BriefingItem["kind"], YziImobRole> = { atencao: "amber", oportunidade: "primary" };

function kindLabel(item: BriefingItem) {
  return item.kind === "atencao" ? "Atenção" : "Oportunidade";
}

// Título de seção sem card próprio: rótulo discreto em caps, conteúdo direto.
// Menos molduras competindo — a hierarquia vem da tipografia, não das bordas.
function BriefingSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[var(--yzi-text-faint)]">{title}</h2>
        {hint ? <span className="text-[0.66rem] text-[var(--yzi-text-faint)]">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

function BriefingItemCard({
  item,
  active,
  onSelect,
  decision,
}: {
  item: BriefingItem;
  active: boolean;
  onSelect: () => void;
  decision?: string;
}) {
  const role = KIND_ROLE[item.kind];

  return (
    <article
      className={`relative overflow-hidden rounded-[var(--yzi-radius-md)] border p-4 pl-5 transition-colors ${
        active
          ? "border-[rgba(var(--imob-ice),0.34)] bg-[rgba(var(--imob-cold),0.08)]"
          : "border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)]"
      }`}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: imobRgba(role, active ? 0.85 : 0.45) }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {ITEM_THUMB[item.id] ? (
            <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-[var(--yzi-radius-sm)] border border-white/12">
              <Image src={ITEM_THUMB[item.id]} alt="" fill sizes="36px" className="object-cover" />
            </span>
          ) : null}
          <h3 className="text-[0.98rem] font-semibold leading-snug tracking-[-0.01em] text-[var(--yzi-text-primary)]">
            {item.title}
          </h3>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.14em]"
          style={{ color: imobRgba(role, 0.95), backgroundColor: imobRgba(role, 0.1) }}
        >
          {kindLabel(item)}
        </span>
      </div>
      <p className="mt-1.5 text-[0.8rem] leading-relaxed text-[var(--yzi-text-secondary)]">{item.impact}</p>
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
          {CONFIDENCE_LABEL[item.confidence]}
        </span>
        <button
          type="button"
          onClick={onSelect}
          className={`rounded-[var(--yzi-radius-sm)] px-3.5 py-1.5 text-[0.76rem] font-medium transition-colors ${
            active
              ? "border border-[rgba(var(--imob-ice),0.4)] bg-[rgba(var(--imob-cold),0.2)] text-[var(--yzi-text-primary)]"
              : "border border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-secondary)] hover:border-[rgba(var(--imob-ice),0.34)] hover:text-[var(--yzi-text-primary)]"
          }`}
        >
          Ver recomendação
        </button>
      </div>
      {decision ? (
        <p className="mt-3 border-t border-[color:var(--yzi-border-subtle)] pt-3 text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          {decision}
        </p>
      ) : null}
    </article>
  );
}

export function YziImobGrowthBriefingV0() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const { select } = useYziImobWorkspace();

  const greeting = getBriefingGreeting();
  const attention = getAttentionItems();
  const opportunities = getOpportunities();
  const panorama = getPanorama();
  const learnings = getLearnings();
  const pending = getPendingDecisions();
  const allItems = useMemo(() => [...attention, ...opportunities], [attention, opportunities]);

  const selected = allItems.find((item) => item.id === selectedId) ?? null;
  const selectedEvidence = selected ? getEvidenceByIds(selected.evidenceIds) : [];

  useEffect(() => {
    if (!selected) {
      return;
    }
    const decided = decisions[selected.id];
    select({
      name: selected.title,
      subtitle: `${kindLabel(selected)} · ${SIMULATION_LABEL}`,
      statusLabel: decided ? "Decisão registrada" : "Aguardando a sua decisão",
      situation: selected.recommendation.interpretei,
      pendencies: decided ? [] : [selected.recommendation.proximaAcao],
      checklist: [
        { label: "Evidências disponíveis para leitura", done: true },
        { label: "Recomendação completa preparada", done: true },
        { label: "Decisão humana registrada", done: Boolean(decided) },
      ],
      score: selected.confidence === "alta" ? 86 : selected.confidence === "media" ? 62 : 34,
      scoreLabel: "Confiança da recomendação",
      nextAction: selected.recommendation.proximaAcao,
      suggestions: [selected.recommendation.recomendo, SIMULATION_NOTE],
      history: selected.evidenceIds.map((id) => `evidence_id: ${id}`),
    });
  }, [select, selected, decisions]);

  const decide = (route: BriefingRoute) => {
    if (!selected) {
      return;
    }
    setDecisions((current) => ({ ...current, [selected.id]: routeDecision(route) }));
  };

  return (
    <section className="yzi-growth-surface flex min-h-full w-full flex-col gap-6 px-4 pb-10 pt-5 sm:px-6 min-[1720px]:px-8">
      <header className="flex w-full flex-col gap-5">
        <div className="flex w-full flex-col gap-4">
          <GrowthSurfaceHeader
            title="Briefing"
            subtitle="O que a YZI encontrou para você hoje. Leitura de consultora, decisão sua."
          />

          <GrowthCounterStrip
            counters={[
              { label: "Oportunidades", value: String(opportunities.length), detail: "Encontradas hoje, em ordem de impacto." },
              { label: "Atenção agora", value: String(attention.length), detail: "Pontos que pedem o seu olhar antes das oportunidades." },
              { label: "Decisões pendentes", value: String(pending.length), detail: "Itens que aguardam a sua palavra." },
              { label: "Aprendizados", value: String(learnings.length), detail: "O que as últimas decisões me ensinaram." },
              { label: "Urgências críticas", value: "0", detail: "Nenhuma urgência crítica hoje. Bom sinal." },
            ]}
          />
        </div>

        <GrowthNavigation active="briefing" />
        <GrowthMockNotice active="briefing" ready={["briefing", "conteudo"]} />
      </header>

      <div className="grid min-h-0 grid-cols-1 gap-5 min-[1760px]:grid-cols-[minmax(0,1fr)_340px]">
        <main className="flex min-w-0 flex-col gap-8">
          <section className="yzi-lens flex flex-col gap-3.5 rounded-[var(--yzi-radius-lg)] p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[1.45rem] font-semibold tracking-[-0.015em] text-[var(--yzi-text-primary)]">
                {greeting.saudacao}
              </h2>
              <GrowthTag>{SIMULATION_LABEL}</GrowthTag>
            </div>
            <p className="max-w-3xl text-[0.88rem] leading-relaxed text-[var(--yzi-text-secondary)]">
              {greeting.oQueAconteceu}
            </p>
            <ul className="flex flex-col gap-1.5">
              {greeting.oQueEncontrei.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[0.88rem] leading-relaxed text-[var(--yzi-text-primary)]">
                  <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-[rgba(var(--imob-ice),0.7)]" />
                  {line}
                </li>
              ))}
            </ul>
            <p className="max-w-3xl border-t border-[color:var(--yzi-border-subtle)] pt-3.5 text-[0.88rem] leading-relaxed text-[var(--yzi-text-secondary)]">
              {greeting.porOndeComecaria}
            </p>
          </section>

          <BriefingSection title="Atenção agora" hint="Antes das oportunidades">
            <div className="flex flex-col gap-2.5">
              {attention.map((item) => (
                <BriefingItemCard
                  key={item.id}
                  item={item}
                  active={item.id === selectedId}
                  onSelect={() => setSelectedId(item.id)}
                  decision={decisions[item.id]}
                />
              ))}
            </div>
          </BriefingSection>

          <BriefingSection title="Oportunidades" hint="Em ordem de impacto">
            <div className="flex flex-col gap-2.5">
              {opportunities.map((item) => (
                <BriefingItemCard
                  key={item.id}
                  item={item}
                  active={item.id === selectedId}
                  onSelect={() => setSelectedId(item.id)}
                  decision={decisions[item.id]}
                />
              ))}
            </div>
          </BriefingSection>

          <BriefingSection title="Panorama">
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[color:var(--yzi-border-subtle)] md:grid-cols-2">
              {panorama.map((card) => (
                <div key={card.id} className="flex flex-col gap-1.5 bg-[var(--yzi-surface-base)] p-4">
                  <span className="text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[var(--yzi-text-faint)]">
                    {card.label}
                  </span>
                  <p className="text-[1rem] font-semibold text-[var(--yzi-text-primary)]">{card.value}</p>
                  <p className="text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">{card.reading}</p>
                </div>
              ))}
            </div>
          </BriefingSection>

          <BriefingSection title="Aprendizados">
            <div className="flex flex-col divide-y divide-[color:var(--yzi-border-subtle)] rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)]">
              {learnings.map((learning) => (
                <div key={learning.id} className="p-4">
                  <p className="text-[0.84rem] font-medium text-[var(--yzi-text-primary)]">{learning.title}</p>
                  <p className="mt-1 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">{learning.detail}</p>
                </div>
              ))}
            </div>
          </BriefingSection>
        </main>

        <aside className="flex min-w-0 flex-col gap-4">
          {selected ? (
            <>
              <section className="rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-5 shadow-[var(--yzi-edge-highlight)]">
                <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">Inspector YZI</h2>
                <div className="mt-4 flex flex-col text-[0.8rem] leading-relaxed">
                  {(
                    [
                      ["Observei", selected.recommendation.observei],
                      ["Interpretei", selected.recommendation.interpretei],
                      ["Impacto esperado", selected.recommendation.impactoEsperado],
                      ["Recomendo", selected.recommendation.recomendo],
                      ["Por quê", selected.recommendation.porQue],
                      ["Confiança", `${CONFIDENCE_LABEL[selected.confidence]} — ${selected.recommendation.confiancaBase}.`],
                    ] as Array<[string, string]>
                  ).map(([label, value]) => (
                    <div
                      key={label}
                      className="border-b border-[color:var(--yzi-border-subtle)] py-3 first:pt-0"
                    >
                      <span className="block text-[0.6rem] font-medium uppercase tracking-[0.16em] text-[var(--yzi-text-faint)]">
                        {label}
                      </span>
                      <p
                        className={`mt-1 ${
                          label === "Recomendo"
                            ? "font-medium text-[var(--yzi-text-primary)]"
                            : "text-[var(--yzi-text-secondary)]"
                        }`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}

                  <div className="mt-3 rounded-[var(--yzi-radius-sm)] bg-[rgba(var(--imob-cold),0.12)] px-3 py-3">
                    <span className="block text-[0.6rem] font-medium uppercase tracking-[0.16em] text-[rgba(var(--imob-ice),0.9)]">
                      Próxima ação
                    </span>
                    <p className="mt-1 font-medium text-[var(--yzi-text-primary)]">
                      {selected.recommendation.proximaAcao}
                    </p>
                  </div>

                  <div className="mt-4">
                    <span className="block text-[0.6rem] font-medium uppercase tracking-[0.16em] text-[var(--yzi-text-faint)]">
                      Evidências
                    </span>
                    <ul className="mt-1.5 flex flex-col gap-2">
                      {selectedEvidence.map((evidence) => (
                        <li key={evidence.id} className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-faint)]">
                          {evidence.fact}
                          <span className="mt-0.5 block text-[0.62rem] uppercase tracking-[0.1em]">
                            {evidence.source} · {evidence.period}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-4 border-t border-[color:var(--yzi-border-subtle)] pt-3 text-[0.68rem] text-[var(--yzi-text-faint)]">
                    {SIMULATION_NOTE}
                  </p>
                </div>
              </section>

              <section className="yzi-lens flex flex-col gap-4 rounded-[var(--yzi-radius-lg)] p-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">Decisão</h2>
                  <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                    Nenhum caminho executa, publica ou gasta. Aprovar apenas encaminha.
                  </p>
                </div>
                <GrowthActionBar
                  actions={(["conteudo", "experimento", "campanha", "adiar"] as BriefingRoute[]).map((route) => ({
                    id: route,
                    label: ROUTE_LABELS[route],
                    tone: route === "adiar" ? "neutral" : "primary",
                    disabled: !selected.allowedRoutes.includes(route),
                    onClick: () => decide(route),
                  }))}
                />
                {selected.routeNote ? (
                  <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">{selected.routeNote}</p>
                ) : null}
                {decisions[selected.id] ? (
                  <p className="border-t border-[color:var(--yzi-border-subtle)] pt-3 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                    {decisions[selected.id]}
                  </p>
                ) : null}
              </section>
            </>
          ) : (
            <section className="rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-5 shadow-[var(--yzi-edge-highlight)]">
              <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">Inspector YZI</h2>
              <p className="mt-3 text-[0.8rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                Selecione um ponto de atenção ou uma oportunidade e eu explico o meu raciocínio completo: o que
                observei, o que isso me diz e o que eu faria no seu lugar.
              </p>
              <p className="mt-4 border-t border-[color:var(--yzi-border-subtle)] pt-3 text-[0.68rem] text-[var(--yzi-text-faint)]">
                {SIMULATION_NOTE}
              </p>
            </section>
          )}

          <BriefingSection title="Decisões pendentes">
            <div className="flex flex-col divide-y divide-[color:var(--yzi-border-subtle)] rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)]">
              {pending.map((item) => (
                <div key={item.id} className="p-3.5">
                  <p className="text-[0.8rem] font-medium text-[var(--yzi-text-primary)]">{item.label}</p>
                  <p className="mt-1 text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">{item.status}</p>
                </div>
              ))}
            </div>
          </BriefingSection>
        </aside>
      </div>
    </section>
  );
}
