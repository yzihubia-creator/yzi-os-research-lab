"use client";

import { useEffect, useMemo, useState } from "react";

import {
  GROWTH_ASSET_STATUS_ACCENT,
  GrowthApprovalActions,
  GrowthCounterStrip,
  GrowthCreditPanel,
  GrowthDetailRow,
  GrowthInspectorPanel,
  GrowthMockNotice,
  GrowthNavigation,
  GrowthPreviewFrame,
  GrowthQueueCard,
  GrowthSurfaceHeader,
  MOCK_GROWTH_ASSET_COUNTERS,
  MOCK_GROWTH_ASSETS,
  MOCK_GROWTH_CREDIT_ROWS,
  type GrowthCreativeItem,
} from "@/components/yzi-imob/growth";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";

function creditLabel(item: GrowthCreativeItem) {
  return `${item.credits} ${item.credits === "1" ? "crédito" : "créditos"} ${item.creditMode}`;
}

function formatIndicator(item: GrowthCreativeItem) {
  if (item.format === "Reel") return "▶ 00:18";
  if (item.format === "Story") return "▶ 00:09 · vertical";
  if (item.format === "Carrossel") return "1/5";
  if (item.format === "Meta Feed") return "1:1 / 4:5";
  return "wide · landing";
}

export function YziImobGrowthContentV0() {
  const [selectedId, setSelectedId] = useState(MOCK_GROWTH_ASSETS[0].id);
  const [actionMode, setActionMode] = useState<"none" | "version" | "adjust">("none");
  const { select } = useYziImobWorkspace();

  const selected = useMemo(
    () => MOCK_GROWTH_ASSETS.find((item) => item.id === selectedId) ?? MOCK_GROWTH_ASSETS[0],
    [selectedId],
  );

  useEffect(() => {
    select({
      name: selected.name,
      subtitle: `${selected.property} · ${selected.channel}`,
      statusLabel: selected.status,
      situation:
        selected.status === "Em revisão"
          ? "A peça está pronta para decisão humana, com preview, imóvel, canal e custo visíveis."
          : selected.status === "Aprovado"
            ? "A peça já foi aprovada e aguarda uso operacional em canal autorizado."
            : selected.status === "Gerando"
              ? "A peça está em preparação visual mockada, com créditos reservados."
              : "A peça falhou antes de consumir créditos e precisa de nova versão.",
      pendencies: selected.pendencies,
      checklist: [
        { label: "Imóvel vinculado ao tenant ativo", done: true },
        { label: "Canal e formato definidos", done: true },
        { label: "Preview disponível", done: selected.status !== "Gerando" && selected.status !== "Falhou" },
        { label: "Aprovação humana registrada", done: selected.status === "Aprovado" },
      ],
      score: selected.readiness,
      scoreLabel: "Prontidão do criativo",
      nextAction: selected.recommendedAction,
      suggestions: [
        `Canal recomendado: ${selected.channel}.`,
        `Dados usados: ${selected.usedData.join(", ")}.`,
        "Nota honesta: Mock visual. Nenhuma geração real foi executada.",
      ],
      history: [
        "tenant_id: tenant_mock_growth_001",
        `property_id: ${selected.propertyId}`,
        `${selected.credits} créditos ${selected.creditMode}.`,
      ],
    });
  }, [select, selected]);

  return (
    <section className="yzi-growth-surface flex min-h-full w-full flex-col gap-6 px-4 pb-10 pt-5 sm:px-6 min-[1720px]:px-8">
      <header className="flex flex-col gap-5">
        <GrowthSurfaceHeader title="Conteúdo" subtitle="Criativos produzidos pela YZI para aprovação." />

        <GrowthCounterStrip counters={MOCK_GROWTH_ASSET_COUNTERS} />

        <GrowthNavigation active="conteudo" />
        <GrowthMockNotice active="conteudo" />
      </header>

      <div className="grid min-h-0 grid-cols-1 gap-4 min-[1720px]:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">Fila de criativos</h2>
            <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">Dados mockados</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {MOCK_GROWTH_ASSETS.map((item) => (
              <GrowthQueueCard
                key={item.id}
                title={item.name}
                subtitle={item.property}
                status={item.status}
                accents={GROWTH_ASSET_STATUS_ACCENT}
                palette={item.palette}
                active={item.id === selected.id}
                onSelect={() => {
                  setSelectedId(item.id);
                  setActionMode("none");
                }}
                meta={
                  <>
                    <span>{item.format}</span>
                    <span aria-hidden>·</span>
                    <span>{formatIndicator(item)}</span>
                    <span aria-hidden>·</span>
                    <span>{item.channel}</span>
                    <span aria-hidden>·</span>
                    <span>{creditLabel(item)}</span>
                  </>
                }
              />
            ))}
          </div>
        </aside>

        <div className="grid min-w-0 grid-cols-1 gap-4 min-[1840px]:grid-cols-[minmax(0,1fr)_320px]">
          <main className="flex min-w-0 flex-col gap-4">
            <GrowthPreviewFrame
              channel={selected.channel}
              format={selected.format}
              palette={selected.palette}
              headline={selected.headline}
              supportingText={selected.supportingText}
              badges={[selected.property, selected.objective]}
            />

            <div className="grid grid-cols-1 gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4 md:grid-cols-2">
              <GrowthDetailRow label="Canal" value={selected.channel} />
              <GrowthDetailRow label="Objetivo" value={selected.objective} />
              <GrowthDetailRow label="Imóvel" value={selected.property} />
              <GrowthDetailRow label="Formato" value={selected.format} />
              <GrowthDetailRow label="Créditos" value={creditLabel(selected)} />
              <GrowthDetailRow label="Status" value={selected.status} />
              <div className="md:col-span-2">
                <GrowthDetailRow label="Ação recomendada da YZI" value={selected.recommendedAction} />
              </div>
            </div>
          </main>

          <aside className="flex min-w-0 flex-col gap-4">
            <GrowthApprovalActions
              status={selected.status}
              accents={GROWTH_ASSET_STATUS_ACCENT}
              onVersion={() => setActionMode("version")}
              onAdjust={() => setActionMode("adjust")}
            />

            {actionMode === "version" ? <GrowthCreditPanel rows={MOCK_GROWTH_CREDIT_ROWS} /> : null}

            {actionMode === "adjust" ? (
              <label className="flex flex-col gap-2">
                <span className="text-[0.72rem] font-medium text-[var(--yzi-text-secondary)]">
                  Descreva o ajuste em linguagem natural.
                </span>
                <textarea
                  className="min-h-28 resize-none rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2 text-[0.82rem] leading-relaxed text-[var(--yzi-text-primary)] outline-none placeholder:text-[var(--yzi-text-faint)] focus:border-[rgba(var(--imob-ice),0.38)]"
                  placeholder="Quero uma versão mais premium, com menos texto e foco na varanda."
                />
              </label>
            ) : null}

            <GrowthInspectorPanel
              sections={[
                {
                  label: "Por que está pronta",
                  value: "Imóvel, objetivo, canal, formato, preview e custo estão visíveis para decisão.",
                },
                { label: "Dados do imóvel usados", value: `${selected.usedData.join(", ")}.` },
                { label: "Canal recomendado", value: `${selected.channel}.` },
                {
                  label: "Pendências",
                  value: (
                    <ul className="flex flex-col gap-1">
                      {selected.pendencies.map((pendency) => (
                        <li key={pendency}>{pendency}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  label: "Próxima ação recomendada",
                  value: <p className="text-[var(--yzi-text-primary)]">{selected.recommendedAction}</p>,
                },
              ]}
              note="Mock visual. Nenhuma geração real foi executada."
            />
          </aside>
        </div>
      </div>
    </section>
  );
}

