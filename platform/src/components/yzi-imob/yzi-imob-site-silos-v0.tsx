import Link from "next/link";

import {
  YziActivityFeed,
  YziOverviewStrip,
  type OverviewKpi,
} from "@/components/yzi-os/yzi-dashboard-primitives";
import { YziAlert, YziBadge } from "@/components/yzi-os/yzi-primitives";
import {
  YziFlowRail,
  type FlowStep,
} from "@/components/yzi-os/yzi-visual-primitives";
import {
  AssetsIcon,
  ChannelsIcon,
  CommandCenterIcon,
  DashboardIcon,
  OpportunityIcon,
  RadarIcon,
  SendIcon,
} from "@/components/yzi-os/yzi-icons";

import { YziImobInternalLinksPanel } from "@/components/yzi-imob/yzi-imob-internal-links-panel";
import { YziImobOrganicOpportunityPanel } from "@/components/yzi-imob/yzi-imob-organic-opportunity-panel";
import { YziImobPropertyPagesTable } from "@/components/yzi-imob/yzi-imob-property-pages-table";
import { YziImobSiloMapPanel } from "@/components/yzi-imob/yzi-imob-silo-map-panel";
import { YziImobSiteReadinessPanel } from "@/components/yzi-imob/yzi-imob-site-readiness-panel";

// Fluxo do imóvel até o lead orgânico. Representa a promessa da vertical,
// não etapas concluídas de verdade.
const ORGANIC_FLOW: FlowStep[] = [
  { label: "Imóvel", icon: AssetsIcon },
  { label: "Página", icon: DashboardIcon },
  { label: "Silo", icon: ChannelsIcon },
  { label: "Link interno", icon: OpportunityIcon },
  { label: "Google", icon: RadarIcon },
  { label: "Lead orgânico", icon: CommandCenterIcon },
  { label: "WhatsApp", icon: SendIcon },
];

// Indicadores estruturais da tela. Zeros reais deste ambiente inicial —
// nenhuma página publicada, nenhum silo ativo. Não são métricas de cliente.
const SITE_KPIS: OverviewKpi[] = [
  { id: "paginas", label: "Páginas publicadas", value: "0", icon: DashboardIcon },
  { id: "silos", label: "Silos ativos", value: "0", icon: ChannelsIcon },
  {
    id: "sem-pagina",
    label: "Imóveis sem página",
    value: "0",
    icon: AssetsIcon,
  },
  {
    id: "oportunidades",
    label: "Oportunidades orgânicas",
    value: "0",
    icon: OpportunityIcon,
  },
];

export function YziImobSiteSilosV0() {
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
            Site e Silos Orgânicos
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Organize imóveis, bairros e intenções de busca para construir
            autoridade antes de escalar com Ads. O orgânico constrói
            autoridade. O Ads escala a oferta. O WhatsApp converte a demanda.
          </p>
        </div>
      </div>

      <YziAlert
        tone="info"
        title="Ambiente inicial — nada está conectado ou publicado."
      >
        Nenhum site real publicado, nenhum domínio conectado, nenhum Search
        Console ou Analytics ativo, nenhum ranking medido e nenhuma campanha
        executada nesta fase. Tudo abaixo é a superfície do módulo, sem dado
        real de cliente.
      </YziAlert>

      <YziOverviewStrip
        title="Estado do site"
        kpis={SITE_KPIS}
        rightSlot={
          <YziBadge tone="preview" className="normal-case">
            sem operação real conectada
          </YziBadge>
        }
      />

      <div className="flex flex-col gap-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] p-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Do imóvel ao lead orgânico
          </h2>
          <p className="text-[0.66rem] text-[var(--yzi-text-faint)]">
            Cada imóvel percorre este caminho até virar conversa no WhatsApp.
          </p>
        </div>
        <YziFlowRail steps={ORGANIC_FLOW} />
      </div>

      <YziImobSiloMapPanel />

      <YziImobPropertyPagesTable />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <YziImobSiteReadinessPanel />
        <YziImobOrganicOpportunityPanel />
      </div>

      <YziImobInternalLinksPanel />

      <YziActivityFeed
        title="Atividade do site"
        items={[]}
        emptyLabel="Quando uma página, silo ou link interno for criado, cada evento aparece aqui."
      />
    </section>
  );
}
