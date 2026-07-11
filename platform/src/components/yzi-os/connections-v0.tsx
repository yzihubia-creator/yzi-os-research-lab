import Link from "next/link";

import {
  ActionsIcon,
  AuthorizationIcon,
  ChannelsIcon,
  CommandCenterIcon,
  RadarIcon,
} from "@/components/yzi-os/yzi-icons";
import { YziAlert } from "@/components/yzi-os/yzi-primitives";
import {
  YziConnectionMap,
  YziFlowRail,
  YziMetricStrip,
  type ConnectionMapLink,
  type FlowStep,
  type MetricStripItem,
  type QualitativeLevel,
} from "@/components/yzi-os/yzi-visual-primitives";
import { YziChartCard, YziDonutChart, type DonutSlice } from "@/components/yzi-os/yzi-charts";

// Mapa honesto de fontes candidatas do YZI OS v0.2. Nenhuma credencial real
// está conectada; risco reflete leitura vs. execução externa de cada fonte.
const SOURCES: ConnectionMapLink[] = [
  { id: "meta-ads", source: "Meta Ads", module: "Tráfego Pago · Resultados", risk: "alto" },
  {
    id: "instagram-meta-business",
    source: "Instagram / Meta Business",
    module: "Radar · Tráfego Pago",
    risk: "alto",
  },
  { id: "whatsapp", source: "WhatsApp", module: "Assistente YZI", risk: "alto" },
  {
    id: "google-analytics",
    source: "Google Analytics",
    module: "Radar · Resultados",
    risk: "médio",
  },
  {
    id: "google-search-console",
    source: "Google Search Console",
    module: "Radar · Oportunidades",
    risk: "médio",
  },
  { id: "google-drive", source: "Google Drive", module: "Biblioteca", risk: "médio" },
  { id: "google-trends", source: "Tendências de mercado", module: "Radar", risk: "baixo" },
  {
    id: "google-sheets",
    source: "Google Sheets",
    module: "Biblioteca · Resultados",
    risk: "baixo",
  },
  {
    id: "ia-modelos",
    source: "IA / Modelos",
    module: "Assistente YZI · Radar · Oportunidades",
    risk: "baixo",
  },
  {
    id: "biblioteca-interna",
    source: "Biblioteca interna",
    module: "Ativos · Busca Semântica",
    risk: "baixo",
  },
  { id: "radar", source: "Radar", module: "Command Center · Oportunidades", risk: "baixo" },
];

const TENANT_FLOW: FlowStep[] = [
  { label: "Tenant", icon: CommandCenterIcon },
  { label: "Conecta contas próprias", icon: ChannelsIcon },
  { label: "YZI OS lê e organiza", icon: RadarIcon },
  { label: "YZI propõe ações", icon: ActionsIcon },
  { label: "Humano aprova", icon: AuthorizationIcon },
];

const SUMMARY_LINE: MetricStripItem[] = [
  { label: "Fontes mapeadas", value: `${SOURCES.length} candidatas` },
  { label: "Conectadas", value: "nenhuma" },
  { label: "Autorização", value: "da conta do cliente" },
  { label: "Execução", value: "só com aprovação" },
];

const RISK_LEVEL_LABEL: Record<QualitativeLevel, string> = {
  baixo: "Baixo risco",
  médio: "Médio risco",
  alto: "Alto risco",
};

// Contagem estrutural: quantas fontes da lista acima caem em cada risco.
// Não é volume de uso nem dado de cliente.
const SOURCE_RISK_SLICES: DonutSlice[] = (
  ["baixo", "médio", "alto"] as QualitativeLevel[]
).map((level) => ({
  label: RISK_LEVEL_LABEL[level],
  level,
  count: SOURCES.filter((source) => source.risk === level).length,
}));

export function ConnectionsV0() {
  return (
    <section className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-5 px-6 py-10">
      <div className="flex flex-col gap-4">
        <Link
          href="/cockpit"
          className="inline-flex w-fit items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-1.5 text-xs text-[var(--yzi-text-secondary)] transition-colors hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]"
        >
          <CommandCenterIcon className="h-3.5 w-3.5" />
          Voltar ao Cockpit
        </Link>
        <div className="flex flex-col gap-1.5">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[var(--yzi-text-secondary)]">
            Mapa de fontes · v0.2
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--yzi-text-primary)]">
            Conexões
          </h1>
          <p className="text-sm text-[var(--yzi-text-secondary)]">
            Cada cliente conecta suas próprias contas.
          </p>
        </div>
      </div>

      <YziAlert tone="info" title="Nenhuma credencial está conectada nesta versão." />

      <div className="flex flex-col gap-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[linear-gradient(180deg,var(--yzi-surface-elevated),var(--yzi-surface-base))] p-4">
        <YziFlowRail steps={TENANT_FLOW} />
        <div className="border-t border-[color:var(--yzi-border-subtle)] pt-3">
          <YziMetricStrip items={SUMMARY_LINE} />
        </div>
      </div>

      <YziConnectionMap links={SOURCES} />

      <YziChartCard
        title="Distribuição por risco"
        caption="Quantas fontes mapeadas caem em cada risco — não é volume de uso ou dado de cliente."
      >
        <YziDonutChart slices={SOURCE_RISK_SLICES} />
      </YziChartCard>

      <p className="text-xs leading-relaxed text-[var(--yzi-text-faint)]">
        A YZIHUB não centraliza dados de campanha na conta dela. Conexões
        sensíveis exigem autorização; leitura e execução são tratadas
        separadamente. Quando uma fonte for autorizada de verdade, o consumo
        dela aparece em Uso &amp; Créditos.
      </p>
    </section>
  );
}
