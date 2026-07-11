"use client";

import { useEffect, useMemo, useState } from "react";

import {
  GROWTH_COLLECTION_STATUS_ACCENT,
  GrowthCounterStrip,
  GrowthDemoMediaCard,
  GrowthDetailRow,
  GrowthInspectorPanel,
  GrowthMockNotice,
  GrowthNavigation,
  GrowthPreviewFrame,
  GrowthQueueCard,
  GrowthSectionCard,
  GrowthStat,
  GrowthStatusBadge,
  GrowthSurfaceHeader,
  GrowthTag,
  MOCK_GROWTH_COLLECTION_COUNTERS,
  MOCK_GROWTH_COLLECTIONS,
} from "@/components/yzi-imob/growth";
import { MOCK_DEMO_MEDIA } from "@/lib/yzi-imob/demo-media/mock-demo-media";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <GrowthTag key={item}>{item}</GrowthTag>
      ))}
    </div>
  );
}

function findDemoMedia(propertyName: string, title: string) {
  return MOCK_DEMO_MEDIA.find((media) => media.propertyName === propertyName && media.title === title);
}

function DemoMediaGrid({ propertyName, titles }: { propertyName: string; titles: string[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {titles.map((title) => {
        const media = findDemoMedia(propertyName, title);
        if (!media) {
          return <GrowthTag key={title}>{title}</GrowthTag>;
        }
        return <GrowthDemoMediaCard key={media.id} item={media} size="sm" />;
      })}
    </div>
  );
}

export function YziImobGrowthLibraryV0() {
  const [sourceId, setSourceId] = useState(MOCK_GROWTH_COLLECTIONS[0].id);
  const { select } = useYziImobWorkspace();

  const selectedSource = useMemo(
    () => MOCK_GROWTH_COLLECTIONS.find((source) => source.id === sourceId) ?? MOCK_GROWTH_COLLECTIONS[0],
    [sourceId],
  );
  const selectedItem = selectedSource.items[0];

  useEffect(() => {
    select({
      name: selectedSource.name,
      subtitle: `${selectedSource.kind} · Biblioteca Growth OS`,
      statusLabel: selectedSource.status,
      situation: selectedSource.reusableReason,
      pendencies:
        selectedSource.status === "Arquivado"
          ? ["Revisar dados do imóvel antes de reutilizar em campanha"]
          : ["Ações externas continuam dependentes de aprovação humana"],
      checklist: [
        { label: "Assets pertencem ao imóvel ou coleção selecionada", done: true },
        { label: "Packages aprovados identificados", done: selectedSource.packages.length > 0 },
        { label: "Campanhas relacionadas mapeadas", done: selectedSource.campaigns.length > 0 },
        { label: "Nenhum arquivo real acessado", done: true },
      ],
      score: selectedSource.status === "Arquivado" ? 42 : 88,
      scoreLabel: "Reutilização do patrimônio",
      nextAction: selectedSource.campaignOpportunity,
      suggestions: [
        `Assets disponíveis: ${selectedSource.assets.map((asset) => asset.label).join(", ")}.`,
        `Packages aprovados: ${selectedSource.packages.join(", ")}.`,
        "Nota honesta: Mock operacional. Nenhum arquivo real foi acessado.",
      ],
      history: selectedSource.knowledge.map((entry) => `${entry.label}: ${entry.value}.`),
    });
  }, [select, selectedSource]);

  return (
    <section className="yzi-growth-surface flex min-h-full w-full flex-col gap-6 px-4 pb-10 pt-5 sm:px-6 min-[1720px]:px-8">
      <header className="flex flex-col gap-5">
        <GrowthSurfaceHeader
          title="Biblioteca"
          subtitle="Patrimônio de marketing aprovado por imóvel e coleção."
        />

        <GrowthCounterStrip counters={MOCK_GROWTH_COLLECTION_COUNTERS} />

        <GrowthNavigation active="biblioteca" />
        <GrowthMockNotice active="biblioteca" ready={["biblioteca"]} />
      </header>

      <div className="grid min-h-0 grid-cols-1 gap-4 min-[1720px]:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">Imóveis e collections</h2>
            <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">Dados mockados</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {MOCK_GROWTH_COLLECTIONS.map((source) => (
              <GrowthQueueCard
                key={source.id}
                title={source.name}
                subtitle={source.subtitle}
                status={source.status}
                accents={GROWTH_COLLECTION_STATUS_ACCENT}
                palette={source.palette}
                imageSrc={source.imageSrc}
                active={source.id === selectedSource.id}
                onSelect={() => setSourceId(source.id)}
                meta={
                  <>
                    <span>{source.kind}</span>
                    <span aria-hidden>·</span>
                    <span>{source.packages.length} packages</span>
                    <span aria-hidden>·</span>
                    <span>{source.campaigns.length} campanhas</span>
                  </>
                }
              />
            ))}
          </div>
        </aside>

        <div className="grid min-w-0 grid-cols-1 gap-4 min-[1840px]:grid-cols-[minmax(0,1fr)_320px]">
          <main className="flex min-w-0 flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 min-[1500px]:grid-cols-2">
              <GrowthSectionCard title="Assets">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {selectedSource.assets.map((asset) => (
                    <GrowthStat key={asset.label} label={asset.label} value={asset.value} role={asset.role} />
                  ))}
                </div>
              </GrowthSectionCard>

              <GrowthSectionCard title="Creative Packages">
                <DemoMediaGrid propertyName={selectedSource.name} titles={selectedSource.packages} />
              </GrowthSectionCard>

              <GrowthSectionCard title="Marketing Assets">
                <DemoMediaGrid propertyName={selectedSource.name} titles={selectedSource.marketingAssets} />
              </GrowthSectionCard>

              <GrowthSectionCard title="Campaigns">
                <TagList items={selectedSource.campaigns} />
              </GrowthSectionCard>
            </div>

            <GrowthSectionCard title="Knowledge / History">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {selectedSource.knowledge.map((entry) => (
                  <GrowthDetailRow key={entry.label} label={entry.label} value={entry.value} />
                ))}
              </div>
            </GrowthSectionCard>

            <GrowthPreviewFrame
              channel={selectedItem.channel}
              format={selectedItem.type === "Package" ? "Coleção" : "Site"}
              palette={selectedItem.palette}
              headline={selectedItem.headline}
              supportingText={selectedItem.supportingText}
              badges={[selectedItem.property, selectedItem.type]}
              imageSrc={selectedItem.imageSrc}
            />
          </main>

          <aside className="flex min-w-0 flex-col gap-4">
            <section className="yzi-lens flex flex-col gap-4 rounded-[var(--yzi-radius-lg)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">Preview / Detail</h2>
                  <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                    Patrimônio selecionado para decisão mockada.
                  </p>
                </div>
                <GrowthStatusBadge status={selectedItem.status} accents={GROWTH_COLLECTION_STATUS_ACCENT} />
              </div>

              <div className="grid grid-cols-1 gap-2 text-[0.76rem]">
                <GrowthDetailRow label="Tipo" value={selectedItem.type} />
                <GrowthDetailRow label="Imóvel" value={selectedItem.property} />
                <GrowthDetailRow label="Canal" value={selectedItem.channel} />
                <GrowthDetailRow label="Lifecycle" value={selectedItem.status} />
                <GrowthDetailRow label="Créditos consumidos" value={selectedItem.credits} />
                <GrowthDetailRow label="Reutilizações" value={selectedItem.reuses} />
                <GrowthDetailRow label="Última campanha" value={selectedItem.lastCampaign} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {["Ver preview", "Reutilizar", "Enviar para campanha", "Arquivar"].map((action, index) => (
                  <button
                    key={action}
                    type="button"
                    className={cx(
                      "rounded-[var(--yzi-radius-sm)] border px-3 py-2 text-[0.78rem] transition-colors",
                      index === 0
                        ? "border-[rgba(var(--imob-ice),0.34)] bg-[rgba(var(--imob-cold),0.14)] font-medium text-[var(--yzi-text-primary)] hover:bg-[rgba(var(--imob-cold),0.2)]"
                        : "border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-secondary)] hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]",
                    )}
                  >
                    {action}
                  </button>
                ))}
              </div>
              <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">
                Ações mockadas. Nenhuma publicação, arquivo ou campanha real foi acionada.
              </p>
            </section>

            <GrowthInspectorPanel
              sections={[
                { label: "Por que é reutilizável", value: selectedSource.reusableReason },
                {
                  label: "Assets do imóvel",
                  value: selectedSource.assets.map((asset) => `${asset.label}: ${asset.value}`).join(", "),
                },
                { label: "Packages aprovados", value: selectedSource.packages.join(", ") },
                { label: "Reaproveitamento em campanha", value: selectedSource.campaignOpportunity },
                {
                  label: "Histórico",
                  value: (
                    <ul className="flex flex-col gap-1">
                      {selectedSource.knowledge.slice(0, 4).map((entry) => (
                        <li key={entry.label}>
                          {entry.label}: {entry.value}
                        </li>
                      ))}
                    </ul>
                  ),
                },
              ]}
              note="Mock operacional. Nenhum arquivo real foi acessado."
            />
          </aside>
        </div>
      </div>
    </section>
  );
}

