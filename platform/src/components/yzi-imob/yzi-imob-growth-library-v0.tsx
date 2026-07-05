"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  GrowthCounterStrip,
  GrowthDetailRow,
  GrowthInspectorPanel,
  GrowthMockNotice,
  GrowthNavigation,
  GrowthPreviewFrame,
  GrowthQueueCard,
  GrowthStatusBadge,
  GrowthSurfaceHeader,
  type GrowthSurface,
  type GrowthStatusAccent,
} from "@/components/yzi-imob/yzi-imob-growth-components";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";
import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";

type LibraryKind = "Property" | "Collection";
type LibraryStatus = "Aprovado" | "Em uso" | "Arquivado" | "Pronto para campanha";
type LibraryAssetType = "Package" | "Marketing Asset";

type LibraryItem = {
  id: string;
  title: string;
  type: LibraryAssetType;
  property: string;
  channel: string;
  status: LibraryStatus;
  credits: string;
  reuses: string;
  lastCampaign: string;
  headline: string;
  supportingText: string;
  palette: [YziImobRole, YziImobRole];
};

type LibrarySource = {
  id: string;
  name: string;
  kind: LibraryKind;
  status: LibraryStatus;
  subtitle: string;
  assets: Array<{ label: string; value: string; role: YziImobRole }>;
  packages: string[];
  marketingAssets: string[];
  campaigns: string[];
  knowledge: Array<{ label: string; value: string }>;
  reusableReason: string;
  campaignOpportunity: string;
  palette: [YziImobRole, YziImobRole];
  items: LibraryItem[];
};

const COUNTERS = [
  { label: "Assets", value: "38", detail: "por imóvel e coleção" },
  { label: "Packages", value: "9", detail: "pacotes aprovados" },
  { label: "Campanhas", value: "4", detail: "relacionadas ao acervo" },
  { label: "Reutilizações", value: "6", detail: "uso reaproveitado" },
  { label: "Collections", value: "3", detail: "patrimônio agrupado" },
];

const STATUS_ACCENT: GrowthStatusAccent = {
  Aprovado: "primary",
  "Em uso": "cyan",
  Arquivado: "neutral",
  "Pronto para campanha": "lilac",
};

const SOURCES: LibrarySource[] = [
  {
    id: "property_altiplano_001",
    name: "Apartamento Altiplano",
    kind: "Property",
    status: "Pronto para campanha",
    subtitle: "Patrimônio pronto para reuso em campanhas de visita qualificada.",
    assets: [
      { label: "Fotos", value: "14", role: "primary" },
      { label: "Vídeos", value: "3", role: "cyan" },
      { label: "Planta", value: "1", role: "petrol" },
      { label: "Tour 360", value: "1", role: "lilac" },
      { label: "Documentos", value: "2", role: "neutral" },
    ],
    packages: ["Reel Premium", "Carrossel Alto Padrão", "Site Hero"],
    marketingAssets: ["Lançamento Premium", "Open House Julho"],
    campaigns: ["Instagram Feed", "Meta Leads", "Site Destaque"],
    knowledge: [
      { label: "Última aprovação", value: "Reel Premium aprovado sem ajuste" },
      { label: "Último pacote reutilizado", value: "Site Hero" },
      { label: "Créditos totais consumidos", value: "42" },
      { label: "Aprovações sem ajuste", value: "3" },
      { label: "Itens arquivados", value: "1" },
      { label: "Itens reutilizados", value: "4" },
    ],
    reusableReason: "O imóvel tem fotos, vídeo curto, planta e pacote aprovado com argumento consistente.",
    campaignOpportunity: "Reutilizar o pacote premium em Meta Leads com chamada de visita.",
    palette: ["primary", "lilac"],
    items: [
      {
        id: "altiplano_reel_premium",
        title: "Reel Premium",
        type: "Package",
        property: "Apartamento Altiplano",
        channel: "Instagram Reels",
        status: "Aprovado",
        credits: "18",
        reuses: "2",
        lastCampaign: "Instagram Feed",
        headline: "Vista alta, rotina leve",
        supportingText: "Pacote aprovado para destacar varanda, metragem e diferenciais.",
        palette: ["primary", "lilac"],
      },
      {
        id: "altiplano_open_house_julho",
        title: "Open House Julho",
        type: "Marketing Asset",
        property: "Apartamento Altiplano",
        channel: "Meta Leads",
        status: "Pronto para campanha",
        credits: "10",
        reuses: "1",
        lastCampaign: "Meta Leads",
        headline: "Visita qualificada",
        supportingText: "Asset de campanha com convite para agenda presencial.",
        palette: ["cyan", "petrol"],
      },
    ],
  },
  {
    id: "property_cabo_branco_014",
    name: "Cobertura Cabo Branco",
    kind: "Property",
    status: "Em uso",
    subtitle: "Acervo de alto padrão com foco em vista, área social e acabamento.",
    assets: [
      { label: "Fotos", value: "11", role: "primary" },
      { label: "Vídeos", value: "2", role: "cyan" },
      { label: "Planta", value: "1", role: "petrol" },
      { label: "Tour 360", value: "0", role: "neutral" },
      { label: "Documentos", value: "1", role: "neutral" },
    ],
    packages: ["Carrossel Alto Padrão", "Meta Feed"],
    marketingAssets: ["Lançamento Premium"],
    campaigns: ["Instagram Feed", "Site Destaque"],
    knowledge: [
      { label: "Última aprovação", value: "Carrossel aprovado com ajuste de chamada" },
      { label: "Último pacote reutilizado", value: "Carrossel Alto Padrão" },
      { label: "Créditos totais consumidos", value: "28" },
      { label: "Aprovações sem ajuste", value: "1" },
      { label: "Itens arquivados", value: "0" },
      { label: "Itens reutilizados", value: "2" },
    ],
    reusableReason: "O pacote tem imagens fortes, canal definido e histórico recente de aprovação.",
    campaignOpportunity: "Reaproveitar o carrossel para Site Destaque com foco na área gourmet.",
    palette: ["petrol", "primary"],
    items: [
      {
        id: "cabo_branco_carrossel",
        title: "Carrossel Alto Padrão",
        type: "Package",
        property: "Cobertura Cabo Branco",
        channel: "Instagram Feed",
        status: "Em uso",
        credits: "12",
        reuses: "2",
        lastCampaign: "Site Destaque",
        headline: "Cobertura com presença",
        supportingText: "Pacote editorial para destacar vista, planta e área social.",
        palette: ["petrol", "primary"],
      },
    ],
  },
  {
    id: "property_manaira_009",
    name: "Manaíra Residence",
    kind: "Property",
    status: "Aprovado",
    subtitle: "Biblioteca enxuta para campanhas de visita e atendimento rápido.",
    assets: [
      { label: "Fotos", value: "7", role: "primary" },
      { label: "Vídeos", value: "1", role: "cyan" },
      { label: "Planta", value: "1", role: "petrol" },
      { label: "Tour 360", value: "0", role: "neutral" },
      { label: "Documentos", value: "1", role: "neutral" },
    ],
    packages: ["Story Visita"],
    marketingAssets: ["Open House Julho"],
    campaigns: ["Instagram Feed"],
    knowledge: [
      { label: "Última aprovação", value: "Story aprovado sem ajuste" },
      { label: "Último pacote reutilizado", value: "Story Visita" },
      { label: "Créditos totais consumidos", value: "14" },
      { label: "Aprovações sem ajuste", value: "2" },
      { label: "Itens arquivados", value: "0" },
      { label: "Itens reutilizados", value: "1" },
    ],
    reusableReason: "A biblioteca já liga localização, chamada de visita e perfil familiar.",
    campaignOpportunity: "Reusar o story em atendimento de fim de semana.",
    palette: ["ice", "cyan"],
    items: [
      {
        id: "manaira_story_visita",
        title: "Story Visita",
        type: "Package",
        property: "Manaíra Residence",
        channel: "Instagram Stories",
        status: "Aprovado",
        credits: "6",
        reuses: "1",
        lastCampaign: "Instagram Feed",
        headline: "Visita neste sábado",
        supportingText: "Pacote curto para captar interesse e levar ao atendimento.",
        palette: ["ice", "cyan"],
      },
    ],
  },
  {
    id: "property_jardim_oceania_004",
    name: "Jardim Oceania",
    kind: "Property",
    status: "Arquivado",
    subtitle: "Acervo parcialmente arquivado por falta de diferenciais claros.",
    assets: [
      { label: "Fotos", value: "4", role: "neutral" },
      { label: "Vídeos", value: "0", role: "neutral" },
      { label: "Planta", value: "0", role: "neutral" },
      { label: "Tour 360", value: "0", role: "neutral" },
      { label: "Documentos", value: "1", role: "neutral" },
    ],
    packages: ["Meta Feed"],
    marketingAssets: ["Captação Proprietário"],
    campaigns: ["Meta Leads"],
    knowledge: [
      { label: "Última aprovação", value: "Sem aprovação final" },
      { label: "Último pacote reutilizado", value: "Nenhum" },
      { label: "Créditos totais consumidos", value: "0" },
      { label: "Aprovações sem ajuste", value: "0" },
      { label: "Itens arquivados", value: "2" },
      { label: "Itens reutilizados", value: "0" },
    ],
    reusableReason: "Há pouco patrimônio reaproveitável; faltam diferenciais do imóvel.",
    campaignOpportunity: "Revisar dados antes de enviar qualquer campanha.",
    palette: ["coldRed", "amber"],
    items: [
      {
        id: "jardim_oceania_meta_feed",
        title: "Meta Feed",
        type: "Package",
        property: "Jardim Oceania",
        channel: "Meta Feed",
        status: "Arquivado",
        credits: "0",
        reuses: "0",
        lastCampaign: "Nenhuma",
        headline: "Oferta em ajuste",
        supportingText: "Pacote arquivado até o imóvel ter diferenciais suficientes.",
        palette: ["coldRed", "amber"],
      },
    ],
  },
  {
    id: "collection_luxo_jp",
    name: "Collection: Luxo João Pessoa",
    kind: "Collection",
    status: "Pronto para campanha",
    subtitle: "Coleção de imóveis premium com pacotes aprovados para reuso.",
    assets: [
      { label: "Fotos", value: "22", role: "primary" },
      { label: "Vídeos", value: "5", role: "cyan" },
      { label: "Planta", value: "3", role: "petrol" },
      { label: "Tour 360", value: "1", role: "lilac" },
      { label: "Documentos", value: "4", role: "neutral" },
    ],
    packages: ["Reel Premium", "Carrossel Alto Padrão", "Site Hero"],
    marketingAssets: ["Lançamento Premium", "Captação Proprietário"],
    campaigns: ["Instagram Feed", "Meta Leads", "Site Destaque"],
    knowledge: [
      { label: "Última aprovação", value: "Coleção aprovada para campanha premium" },
      { label: "Último pacote reutilizado", value: "Reel Premium" },
      { label: "Créditos totais consumidos", value: "70" },
      { label: "Aprovações sem ajuste", value: "5" },
      { label: "Itens arquivados", value: "1" },
      { label: "Itens reutilizados", value: "6" },
    ],
    reusableReason: "A coleção agrupa imóveis com linguagem visual consistente e pacotes já aprovados.",
    campaignOpportunity: "Reutilizar o conjunto premium em campanha de captação qualificada.",
    palette: ["lilac", "primary"],
    items: [
      {
        id: "luxo_jp_lancamento_premium",
        title: "Lançamento Premium",
        type: "Marketing Asset",
        property: "Collection: Luxo João Pessoa",
        channel: "Meta Leads",
        status: "Pronto para campanha",
        credits: "16",
        reuses: "3",
        lastCampaign: "Meta Leads",
        headline: "Imóveis de presença",
        supportingText: "Asset aprovado para organizar imóveis premium por coleção.",
        palette: ["lilac", "primary"],
      },
    ],
  },
  {
    id: "collection_open_house_julho",
    name: "Collection: Open House Julho",
    kind: "Collection",
    status: "Em uso",
    subtitle: "Coleção operacional para visitas e redistribuição em canais ativos.",
    assets: [
      { label: "Fotos", value: "18", role: "primary" },
      { label: "Vídeos", value: "4", role: "cyan" },
      { label: "Planta", value: "2", role: "petrol" },
      { label: "Tour 360", value: "0", role: "neutral" },
      { label: "Documentos", value: "3", role: "neutral" },
    ],
    packages: ["Story Visita", "Meta Feed", "Site Hero"],
    marketingAssets: ["Open House Julho"],
    campaigns: ["Instagram Feed", "Meta Leads"],
    knowledge: [
      { label: "Última aprovação", value: "Open House aprovado para campanha" },
      { label: "Último pacote reutilizado", value: "Story Visita" },
      { label: "Créditos totais consumidos", value: "36" },
      { label: "Aprovações sem ajuste", value: "4" },
      { label: "Itens arquivados", value: "0" },
      { label: "Itens reutilizados", value: "5" },
    ],
    reusableReason: "A coleção tem assets e pacotes já usados em visita, com histórico de aprovação.",
    campaignOpportunity: "Reaproveitar assets de visita no canal de leads.",
    palette: ["cyan", "primary"],
    items: [
      {
        id: "open_house_julho_asset",
        title: "Open House Julho",
        type: "Marketing Asset",
        property: "Collection: Open House Julho",
        channel: "Instagram Feed",
        status: "Em uso",
        credits: "14",
        reuses: "5",
        lastCampaign: "Instagram Feed",
        headline: "Agenda de visitas",
        supportingText: "Asset de coleção para organizar imóveis com chamada de visita.",
        palette: ["cyan", "primary"],
      },
    ],
  },
];

function LibraryBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4 shadow-[var(--yzi-edge-highlight)]">
      <h2 className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] px-3 py-1 text-[0.7rem] text-[var(--yzi-text-secondary)]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function YziImobGrowthLibraryV0() {
  const [activeSurface, setActiveSurface] = useState<GrowthSurface>("biblioteca");
  const [sourceId, setSourceId] = useState(SOURCES[0].id);
  const { select } = useYziImobWorkspace();

  const selectedSource = useMemo(
    () => SOURCES.find((source) => source.id === sourceId) ?? SOURCES[0],
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
    <section className="flex min-h-full w-full flex-col gap-7 px-6 pb-10 pt-6 xl:px-8">
      <header className="flex flex-col gap-5">
        <GrowthSurfaceHeader
          title="Biblioteca"
          subtitle="Patrimônio de marketing aprovado por imóvel e coleção."
        />

        <GrowthCounterStrip counters={COUNTERS} />

        <GrowthNavigation active={activeSurface} onChange={setActiveSurface} libraryAvailable />
        <GrowthMockNotice active={activeSurface} ready={["biblioteca"]} />
      </header>

      <div className="grid min-h-0 grid-cols-1 gap-5 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
              Imóveis e collections
            </h2>
            <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">Dados mockados</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {SOURCES.map((source) => (
              <GrowthQueueCard
                key={source.id}
                title={source.name}
                subtitle={source.subtitle}
                status={source.status}
                accents={STATUS_ACCENT}
                palette={source.palette}
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

        <div className="grid min-w-0 grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="flex min-w-0 flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <LibraryBlock title="Assets">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {selectedSource.assets.map((asset) => (
                    <div
                      key={asset.label}
                      className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] p-3"
                    >
                      <span className="text-[0.62rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
                        {asset.label}
                      </span>
                      <p
                        className="mt-1 text-[1.35rem] font-semibold leading-none tabular-nums"
                        style={{ color: imobRgba(asset.role, 0.94) }}
                      >
                        {asset.value}
                      </p>
                    </div>
                  ))}
                </div>
              </LibraryBlock>

              <LibraryBlock title="Creative Packages">
                <TagList items={selectedSource.packages} />
              </LibraryBlock>

              <LibraryBlock title="Marketing Assets">
                <TagList items={selectedSource.marketingAssets} />
              </LibraryBlock>

              <LibraryBlock title="Campaigns">
                <TagList items={selectedSource.campaigns} />
              </LibraryBlock>
            </div>

            <LibraryBlock title="Knowledge / History">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {selectedSource.knowledge.map((entry) => (
                  <GrowthDetailRow key={entry.label} label={entry.label} value={entry.value} />
                ))}
              </div>
            </LibraryBlock>

            <GrowthPreviewFrame
              channel={selectedItem.channel}
              format={selectedItem.type === "Package" ? "Coleção" : "Site"}
              palette={selectedItem.palette}
              headline={selectedItem.headline}
              supportingText={selectedItem.supportingText}
              badges={[selectedItem.property, selectedItem.type]}
            />
          </main>

          <aside className="flex min-w-0 flex-col gap-4">
            <section className="yzi-lens flex flex-col gap-4 rounded-[var(--yzi-radius-lg)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">
                    Preview / Detail
                  </h2>
                  <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                    Patrimônio selecionado para decisão mockada.
                  </p>
                </div>
                <GrowthStatusBadge status={selectedItem.status} accents={STATUS_ACCENT} />
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
                {
                  label: "Por que é reutilizável",
                  value: selectedSource.reusableReason,
                },
                {
                  label: "Assets do imóvel",
                  value: selectedSource.assets.map((asset) => `${asset.label}: ${asset.value}`).join(", "),
                },
                {
                  label: "Packages aprovados",
                  value: selectedSource.packages.join(", "),
                },
                {
                  label: "Reaproveitamento em campanha",
                  value: selectedSource.campaignOpportunity,
                },
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
