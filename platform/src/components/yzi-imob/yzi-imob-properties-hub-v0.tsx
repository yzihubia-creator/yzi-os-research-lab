import Link from "next/link";

import {
  YziActivityFeed,
  YziOverviewStrip,
  type OverviewKpi,
} from "@/components/yzi-os/yzi-dashboard-primitives";
import {
  YziAlert,
  YziBadge,
  YziButton,
  YziPanel,
} from "@/components/yzi-os/yzi-primitives";
import {
  YziFlowRail,
  type FlowStep,
} from "@/components/yzi-os/yzi-visual-primitives";
import {
  AssetsIcon,
  AttachmentIcon,
  AuditIcon,
  CommandCenterIcon,
  CrmIcon,
  DashboardIcon,
  RadarIcon,
  SearchIcon,
  SendIcon,
  TrafficIcon,
} from "@/components/yzi-os/yzi-icons";

import { YziImobAdPlanPanel } from "@/components/yzi-imob/yzi-imob-ad-plan-panel";
import { YziImobCreativeGenerationPanel } from "@/components/yzi-imob/yzi-imob-creative-generation-panel";
import { YziImobMediaLibraryPanel } from "@/components/yzi-imob/yzi-imob-media-library-panel";
import { YziImobPropertyFolderTable } from "@/components/yzi-imob/yzi-imob-property-folder-table";
import { YziImobPropertyReadinessPanel } from "@/components/yzi-imob/yzi-imob-property-readiness-panel";
import { YziImobSeoSiloPanel } from "@/components/yzi-imob/yzi-imob-seo-silo-panel";
import { YziImobTrendIntelligencePanel } from "@/components/yzi-imob/yzi-imob-trend-intelligence-panel";

// Fluxo de ativação comercial por imóvel: do cadastro ao lead, com análise de
// dados antes da verba. Representa a promessa da vertical, não etapas
// concluídas de verdade.
const ACTIVATION_STEPS: FlowStep[] = [
  { label: "Imóvel cadastrado", icon: AssetsIcon },
  { label: "Arquivos organizados", icon: AttachmentIcon },
  { label: "Silo do site", icon: DashboardIcon },
  { label: "Tendências", icon: SearchIcon },
  { label: "Concorrentes", icon: RadarIcon },
  { label: "Criativos", icon: SendIcon },
  { label: "Campanha", icon: TrafficIcon },
  { label: "Leads", icon: CrmIcon },
];

// Indicadores estruturais do hub. Zeros reais deste ambiente inicial — nenhum
// imóvel cadastrado, nenhuma operação real conectada. Não são métricas de
// cliente.
const HUB_KPIS: OverviewKpi[] = [
  { id: "cadastrados", label: "Imóveis cadastrados", value: "0", icon: AssetsIcon },
  { id: "midia", label: "Imóveis com mídia", value: "0", icon: AttachmentIcon },
  {
    id: "plano",
    label: "Imóveis com plano comercial",
    value: "0",
    icon: AuditIcon,
  },
  {
    id: "campanhas",
    label: "Campanhas em rascunho",
    value: "0",
    icon: TrafficIcon,
  },
];

export function YziImobPropertiesHubV0() {
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
            Pastas Comerciais dos Imóveis
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Todo imóvel precisa de um plano comercial. A YZI transforma
            cadastro, fotos e vídeos em site, SEO, criativos, posts e campanha
            assistida — com análise de dados antes de investir em anúncios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <YziButton variant="primary" size="sm" disabled>
            Cadastrar imóvel · em breve
          </YziButton>
          <YziButton variant="authorization" size="sm" disabled>
            Gerar plano comercial com YZI · em breve
          </YziButton>
        </div>
      </div>

      <YziAlert
        tone="info"
        title="Ambiente inicial — nada está conectado, enviado ou publicado."
      >
        Nenhum upload real, nenhuma mídia enviada, nenhum criativo gerado,
        nenhum post publicado, nenhuma campanha real, nenhuma fonte externa
        consultada e nenhum backend nesta fase. Tudo abaixo é a superfície do
        hub, sem dado real de cliente.
      </YziAlert>

      <YziOverviewStrip
        title="Estado do hub"
        kpis={HUB_KPIS}
        rightSlot={
          <YziBadge tone="preview" className="normal-case">
            sem operação real conectada
          </YziBadge>
        }
      />

      <YziPanel className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Do imóvel ao lead
          </h2>
          <p className="text-[0.66rem] text-[var(--yzi-text-faint)]">
            Cada imóvel percorre este caminho — a campanha é a última etapa, só
            depois da análise de dados.
          </p>
        </div>
        <YziFlowRail steps={ACTIVATION_STEPS} />
      </YziPanel>

      <YziImobPropertyFolderTable />

      <YziImobCreativeGenerationPanel />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <YziImobSeoSiloPanel />
        <YziImobTrendIntelligencePanel />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <YziImobPropertyReadinessPanel />
        <YziImobMediaLibraryPanel />
      </div>

      <YziImobAdPlanPanel />

      <YziActivityFeed
        title="Atividade do hub"
        items={[]}
        emptyLabel="Quando você cadastrar um imóvel e a YZI organizar arquivos, silo, criativos ou campanha, cada evento aparece aqui."
      />
    </section>
  );
}
