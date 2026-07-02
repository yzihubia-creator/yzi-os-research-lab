import Link from "next/link";

import {
  YziActivityFeed,
  YziOverviewStrip,
  type OverviewKpi,
} from "@/components/yzi-os/yzi-dashboard-primitives";
import { YziAlert, YziBadge } from "@/components/yzi-os/yzi-primitives";
import {
  AssetsIcon,
  AuthorizationIcon,
  CommandCenterIcon,
  DashboardIcon,
  TrafficIcon,
} from "@/components/yzi-os/yzi-icons";

import { YziImobCampaignPreview } from "@/components/yzi-imob/yzi-imob-campaign-preview";
import { YziImobContentStatusTable } from "@/components/yzi-imob/yzi-imob-content-status-table";
import { YziImobPropertyPipeline } from "@/components/yzi-imob/yzi-imob-property-pipeline";
import { YziImobSitePublishPanel } from "@/components/yzi-imob/yzi-imob-site-publish-panel";
import { YziImobYziActionPanel } from "@/components/yzi-imob/yzi-imob-yzi-action-panel";

// Indicadores estruturais do estúdio. Todos os valores são zeros reais deste
// ambiente inicial — nenhuma operação real está conectada, nenhum imóvel foi
// cadastrado. Não são métricas de cliente.
const STUDIO_KPIS: OverviewKpi[] = [
  { id: "imoveis", label: "Imóveis no estúdio", value: "0", icon: AssetsIcon },
  {
    id: "paginas",
    label: "Páginas prontas para site",
    value: "0",
    icon: DashboardIcon,
  },
  {
    id: "aprovacao",
    label: "Peças aguardando aprovação",
    value: "0",
    icon: AuthorizationIcon,
  },
  {
    id: "campanhas",
    label: "Campanhas em rascunho",
    value: "0",
    icon: TrafficIcon,
  },
];

export function YziImobStudioV0() {
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
            Estúdio Comercial de Imóveis
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Transforme imóveis cadastrados em site, posts, criativos e
            campanhas. Cada imóvel vira página, conteúdo, criativo e anúncio —
            com aprovação humana em cada passo.
          </p>
        </div>
      </div>

      <YziAlert
        tone="info"
        title="Ambiente inicial — nada está conectado ou publicado."
      >
        Nenhuma rede social conectada, nenhuma campanha real criada, nenhum post
        publicado, nenhum backend nesta fase. Tudo abaixo é a superfície do
        estúdio, sem dado real de cliente.
      </YziAlert>

      <YziOverviewStrip
        title="Estado do estúdio"
        kpis={STUDIO_KPIS}
        rightSlot={
          <YziBadge tone="preview" className="normal-case">
            sem operação real conectada
          </YziBadge>
        }
      />

      <YziImobPropertyPipeline />

      <YziImobYziActionPanel />

      <YziImobContentStatusTable />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <YziImobCampaignPreview />
        <YziImobSitePublishPanel />
      </div>

      <YziActivityFeed
        title="Atividade do estúdio"
        items={[]}
        emptyLabel="Quando você cadastrar um imóvel e a YZI gerar site, posts ou campanha, cada evento aparece aqui."
      />
    </section>
  );
}
