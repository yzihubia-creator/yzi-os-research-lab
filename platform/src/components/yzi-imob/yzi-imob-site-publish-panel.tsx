import { YziProgressBar } from "@/components/yzi-os/yzi-dashboard-primitives";
import { YziPanel } from "@/components/yzi-os/yzi-primitives";
import {
  YziEmptyVisualState,
  YziMetricStrip,
  type MetricStripItem,
} from "@/components/yzi-os/yzi-visual-primitives";
import { DashboardIcon } from "@/components/yzi-os/yzi-icons";

// Painel de publicação no site. Todos os estados são honestos e reais para
// esta fase: nenhum domínio conectado, zero páginas publicadas. O "0" é um
// número verdadeiro, não uma métrica inventada.
const SITE_STATES: MetricStripItem[] = [
  { label: "Domínio", value: "não conectado" },
  { label: "Páginas publicadas", value: "0" },
  { label: "Status", value: "rascunho" },
];

export function YziImobSitePublishPanel() {
  return (
    <YziPanel className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
        <DashboardIcon className="h-4 w-4" />
        <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
          Publicação no site
        </h2>
      </div>

      <YziMetricStrip items={SITE_STATES} />

      <YziProgressBar
        label="Prontidão do site"
        valueLabel="inicial"
        level="low"
        tone="neutral"
        size="sm"
      />

      <YziEmptyVisualState
        icon={DashboardIcon}
        message="Nenhuma página publicada ainda"
      />

      <p className="text-center text-[0.68rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        Cada imóvel gera uma página pronta para publicar. Conecte um domínio
        para colocar o site no ar — nada é publicado automaticamente.
      </p>
    </YziPanel>
  );
}
