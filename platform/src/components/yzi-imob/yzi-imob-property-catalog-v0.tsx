import Link from "next/link";

import { YziActivityFeed } from "@/components/yzi-os/yzi-dashboard-primitives";
import { YziAlert } from "@/components/yzi-os/yzi-primitives";
import {
  YziFlowRail,
  type FlowStep,
} from "@/components/yzi-os/yzi-visual-primitives";
import {
  ActionsIcon,
  AssetsIcon,
  AttachmentIcon,
  ChannelsIcon,
  CommandCenterIcon,
  DashboardIcon,
  DeepThinkingIcon,
  SendIcon,
  TrafficIcon,
} from "@/components/yzi-os/yzi-icons";

import { YziImobCatalogEmptyState } from "@/components/yzi-imob/yzi-imob-catalog-empty-state";
import { YziImobCatalogFilters } from "@/components/yzi-imob/yzi-imob-catalog-filters";
import { YziImobCatalogSummary } from "@/components/yzi-imob/yzi-imob-catalog-summary";
import { YziImobPropertyCard } from "@/components/yzi-imob/yzi-imob-property-card";

// Caminho do imóvel do formulário ao pipeline. Representa a promessa da
// vertical, não etapas concluídas de verdade.
const CATALOG_FLOW: FlowStep[] = [
  { label: "Formulário", icon: AttachmentIcon },
  { label: "YZI organiza", icon: DeepThinkingIcon },
  { label: "Catálogo", icon: AssetsIcon },
  { label: "Site", icon: ChannelsIcon },
  { label: "Conteúdo IA", icon: DashboardIcon },
  { label: "Ads", icon: TrafficIcon },
  { label: "WhatsApp", icon: SendIcon },
  { label: "Pipeline", icon: ActionsIcon },
];

export function YziImobPropertyCatalogV0() {
  return (
    <section className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-4">
        <Link
          href="/cockpit"
          className="inline-flex w-fit items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-1.5 text-xs text-[var(--yzi-text-secondary)] transition-colors hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]"
        >
          <CommandCenterIcon className="h-3.5 w-3.5" />
          Voltar ao Cockpit
        </Link>
        <div className="flex flex-col gap-2">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[var(--yzi-text-secondary)]">
            YZI IMOB · Vertical imobiliária · v0.1
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--yzi-text-primary)]">
            Catálogo de Imóveis
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Visualize os imóveis que alimentam site, criativos, campanhas,
            WhatsApp e pipeline comercial.
          </p>
        </div>
      </div>

      <YziAlert
        tone="info"
        title="Ambiente inicial — nenhum imóvel cadastrado, nada conectado ou publicado."
      >
        Nenhum upload real, nenhuma mídia enviada, nenhuma página publicada e
        nenhum backend nesta fase. Tudo abaixo é a superfície visual do
        catálogo, sem dado real de cliente.
      </YziAlert>

      <YziImobCatalogSummary />

      <YziImobCatalogFilters />

      <YziImobCatalogEmptyState />

      <YziImobPropertyCard />

      <div className="flex flex-col gap-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] p-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Do formulário ao pipeline
          </h2>
          <p className="text-[0.66rem] text-[var(--yzi-text-faint)]">
            Cada imóvel percorre este caminho depois que o corretor finaliza
            o cadastro.
          </p>
        </div>
        <YziFlowRail steps={CATALOG_FLOW} />
      </div>

      <YziActivityFeed
        title="Atividade do catálogo"
        items={[]}
        emptyLabel="Quando um imóvel for cadastrado e a YZI organizar o card, cada evento aparece aqui."
      />
    </section>
  );
}
