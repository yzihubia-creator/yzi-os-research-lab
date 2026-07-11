"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  GROWTH_ASSET_STATUS_ACCENT,
  GROWTH_CAMPAIGN_STATUS_ACCENT,
  GrowthActionBar,
  GrowthCounterStrip,
  GrowthDetailRow,
  GrowthInspectorPanel,
  GrowthNavigation,
  GrowthPiecePreviewModal,
  GrowthQueueCard,
  GrowthSectionCard,
  GrowthStatusBadge,
  GrowthSurfaceHeader,
  GrowthTag,
  GrowthThumbnail,
  MOCK_GROWTH_ASSETS,
  MOCK_GROWTH_CAMPAIGN_COUNTERS,
  MOCK_GROWTH_CAMPAIGNS,
  useGrowthCampaignState,
} from "@/components/yzi-imob/growth";
import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <GrowthTag key={item}>{item}</GrowthTag>
      ))}
    </div>
  );
}

function CampaignPieceGallery({ pieceIds }: { pieceIds: string[] }) {
  const { statusFor } = useGrowthCampaignState();
  const [activeId, setActiveId] = useState<string | null>(null);

  const pieces = pieceIds
    .map((id) => MOCK_GROWTH_ASSETS.find((asset) => asset.id === id))
    .filter((piece): piece is (typeof MOCK_GROWTH_ASSETS)[number] => Boolean(piece));

  if (pieces.length === 0) {
    return (
      <p className="text-[0.78rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Nenhuma peça preparada para esta campanha ainda.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {pieces.map((piece) => (
          <button
            key={piece.id}
            type="button"
            onClick={() => setActiveId(piece.id)}
            className="yzi-growth-card-hover flex flex-col gap-1.5 rounded-[var(--yzi-radius-md)] border border-[rgba(var(--imob-graphite),0.28)] bg-[rgba(17,22,31,0.72)] p-2 text-left"
          >
            <GrowthThumbnail palette={piece.palette} active={false} wide imageSrc={piece.imageSrc} />
            <span className="truncate text-[0.74rem] font-medium leading-snug text-[var(--yzi-text-primary)]">
              {piece.name}
            </span>
            <span className="flex items-center justify-between gap-1">
              <span className="truncate text-[0.64rem] text-[var(--yzi-text-faint)]">{piece.format}</span>
              <GrowthStatusBadge status={statusFor(piece.id, piece.status)} accents={GROWTH_ASSET_STATUS_ACCENT} />
            </span>
          </button>
        ))}
      </div>

      {activeId ? (
        <GrowthPiecePreviewModal
          pieces={pieces}
          activeId={activeId}
          onClose={() => setActiveId(null)}
          onNavigate={setActiveId}
        />
      ) : null}
    </>
  );
}

export function YziImobGrowthCampanhasV0() {
  // Preseleção via ?campaign=<id> — permite link direto de fora (ex.: home de
  // Comunicação, Property Workspace) para o detalhe de uma campanha específica.
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("campaign");
  const initialId =
    (requestedId && MOCK_GROWTH_CAMPAIGNS.some((campaign) => campaign.id === requestedId)
      ? requestedId
      : MOCK_GROWTH_CAMPAIGNS[0].id) ?? MOCK_GROWTH_CAMPAIGNS[0].id;

  const [campaignId, setCampaignId] = useState(initialId);
  const [lastMockAction, setLastMockAction] = useState("Nenhuma ação executada.");
  const { select } = useYziImobWorkspace();

  const selected = useMemo(
    () => MOCK_GROWTH_CAMPAIGNS.find((campaign) => campaign.id === campaignId) ?? MOCK_GROWTH_CAMPAIGNS[0],
    [campaignId],
  );

  useEffect(() => {
    select({
      name: selected.name,
      subtitle: `${selected.target} · plano de campanha`,
      statusLabel: selected.status,
      situation: selected.suggestedBecause,
      pendencies: selected.risks,
      checklist: [
        { label: "Briefing usado como insumo", done: true },
        { label: "Criativos aprovados vinculados", done: selected.approvedCreativesUsed.length > 0 },
        { label: "Orçamento revisado por humano", done: selected.status === "Aguardando aprovação" },
        { label: "Conta de mídia conectada", done: false },
      ],
      score: selected.status === "Bloqueada por conexão" ? 36 : selected.status === "Aguardando aprovação" ? 74 : 58,
      scoreLabel: "Prontidão do plano",
      nextAction: selected.nextAction,
      suggestions: [
        selected.recommendedAction,
        "Meta Ads não conectado. Google Ads não conectado.",
        "Dados de demonstração. Nenhuma campanha real será criada.",
      ],
      history: selected.sourceInputs,
    });
  }, [select, selected]);

  const mockActions = [
    { id: "review", label: "Revisar plano", tone: "primary" as const },
    { id: "budget", label: "Ajustar orçamento" },
    { id: "approval", label: "Enviar para aprovação" },
    { id: "draft", label: "Manter como rascunho" },
  ].map((action) => ({
    ...action,
    onClick: () => setLastMockAction(`${action.label}: ação mockada, sem envio para mídia.`),
  }));

  return (
    <section className="yzi-growth-surface flex min-h-full w-full flex-col gap-6 px-4 pb-10 pt-5 sm:px-6 min-[1720px]:px-8">
      <header className="flex w-full flex-col gap-5">
        <div className="flex w-full flex-col gap-4">
          <GrowthSurfaceHeader
            title="Campanhas"
            subtitle="Planos de campanha preparados pela YZI para revisão."
          />

          <GrowthCounterStrip counters={MOCK_GROWTH_CAMPAIGN_COUNTERS} />
        </div>

        <GrowthNavigation active="campanhas" />
      </header>

      <div className="grid min-h-0 grid-cols-1 gap-4 min-[1720px]:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">Rascunhos de campanha</h2>
            <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">Dados de demonstração</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {MOCK_GROWTH_CAMPAIGNS.map((campaign) => (
              <GrowthQueueCard
                key={campaign.id}
                title={campaign.name}
                subtitle={campaign.target}
                status={campaign.status}
                accents={GROWTH_CAMPAIGN_STATUS_ACCENT}
                palette={campaign.palette}
                imageSrc={campaign.imageSrc}
                active={campaign.id === selected.id}
                onSelect={() => {
                  setCampaignId(campaign.id);
                  setLastMockAction("Nenhuma ação executada.");
                }}
                meta={
                  <>
                    <span>{campaign.estimatedBudget}</span>
                    <span aria-hidden>·</span>
                    <span>{campaign.suggestedChannels.length} canais</span>
                    <span aria-hidden>·</span>
                    <span>{campaign.linkedCreatives.length} criativos</span>
                  </>
                }
              />
            ))}
          </div>
        </aside>

        <div className="grid min-w-0 grid-cols-1 gap-4 min-[1840px]:grid-cols-[minmax(0,1fr)_330px]">
          <main className="flex min-w-0 flex-col gap-4">
            <section className="yzi-lens flex flex-col gap-4 rounded-[var(--yzi-radius-lg)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <h2 className="text-[1.25rem] font-semibold tracking-[-0.01em] text-[var(--yzi-text-primary)]">
                    {selected.name}
                  </h2>
                  <p className="max-w-2xl text-[0.84rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                    {selected.objective}
                  </p>
                </div>
                <GrowthStatusBadge status={selected.status} accents={GROWTH_CAMPAIGN_STATUS_ACCENT} />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <GrowthDetailRow label="Imóvel / Collection" value={selected.target} />
                <GrowthDetailRow label="Orçamento sugerido" value={selected.estimatedBudget} />
                <GrowthDetailRow label="Próxima ação" value={selected.nextAction} />
                <GrowthDetailRow label="Status honesto" value="Plano mockado. Nenhuma campanha real criada." />
              </div>
            </section>

            <GrowthSectionCard title="Peças da campanha">
              <CampaignPieceGallery pieceIds={selected.pieceIds} />
            </GrowthSectionCard>

            <div className="grid grid-cols-1 gap-4 min-[1500px]:grid-cols-2">
              <GrowthSectionCard title="Canais sugeridos">
                <TagList items={selected.suggestedChannels} />
              </GrowthSectionCard>

              <GrowthSectionCard title="Público sugerido">
                <p className="text-[0.82rem] leading-relaxed text-[var(--yzi-text-secondary)]">{selected.audience}</p>
              </GrowthSectionCard>

              <GrowthSectionCard title="Orçamento">
                <p className="text-[0.82rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                  {selected.budgetRationale}
                </p>
              </GrowthSectionCard>
            </div>

            <GrowthSectionCard title="Riscos / pendências">
              <ul className="flex flex-col gap-2">
                {selected.risks.map((risk) => (
                  <li key={risk} className="flex items-start gap-2 text-[0.82rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                    <span
                      aria-hidden
                      className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: imobRgba("amber", 0.85) }}
                    />
                    {risk}
                  </li>
                ))}
              </ul>
            </GrowthSectionCard>
          </main>

          <aside className="flex min-w-0 flex-col gap-4">
            <section className="yzi-lens flex flex-col gap-4 rounded-[var(--yzi-radius-lg)] p-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">Ações mockadas</h2>
                <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                  Nenhuma ação executa campanha real, cria cobrança ou conecta mídia.
                </p>
              </div>
              <GrowthActionBar actions={mockActions} />
              <p className="border-t border-[color:var(--yzi-border-subtle)] pt-3 text-[0.72rem] leading-relaxed text-[var(--yzi-text-faint)]">
                {lastMockAction}
              </p>
            </section>

            <GrowthInspectorPanel
              title="Inspector YZI"
              sections={[
                { label: "Por que sugeri", value: selected.suggestedBecause },
                { label: "Criativos usados", value: selected.approvedCreativesUsed.join(", ") },
                { label: "Público que faz sentido", value: selected.audience },
                {
                  label: "Pendência que impede publicação",
                  value: selected.risks.includes("Meta Ads não conectado")
                    ? "Meta Ads não conectado. Google Ads também não conectado."
                    : selected.risks[0],
                },
                {
                  label: "Próxima ação recomendada",
                  value: <p className="text-[var(--yzi-text-primary)]">{selected.recommendedAction}</p>,
                },
              ]}
              note="Dados de demonstração. Nenhuma campanha real será criada, enviada ou publicada."
            />
          </aside>
        </div>
      </div>
    </section>
  );
}
