import Link from "next/link";

import {
  ActionsIcon,
  AssetsIcon,
  AuditIcon,
  AuthorizationIcon,
  ChannelsIcon,
  CommandCenterIcon,
  DeepThinkingIcon,
  SendIcon,
  TrafficIcon,
} from "@/components/yzi-os/yzi-icons";
import { YziAlert, YziBadge, YziPanel } from "@/components/yzi-os/yzi-primitives";
import {
  YziEmptyVisualState,
  YziFlowRail,
  YziMatrix,
  YziMetricStrip,
  YziQualitativeBar,
  type FlowStep,
  type MatrixColumn,
  type MatrixItem,
  type MetricStripItem,
  type QualitativeLevel,
} from "@/components/yzi-os/yzi-visual-primitives";
import {
  YziChartCard,
  YziDonutChart,
  type DonutSlice,
} from "@/components/yzi-os/yzi-charts";

// Tipos honestos de decisão protegida do YZI OS v0.1. Nenhuma fila real
// existe ainda — a matriz só distribui por risco, sem texto explicativo por item.
const APPROVAL_TYPES: MatrixItem[] = [
  {
    id: "geracao-ia",
    label: "Geração com IA",
    sublabel: "Radar",
    icon: DeepThinkingIcon,
    columnKey: "médio",
  },
  {
    id: "pacote-criativo",
    label: "Pacote criativo",
    sublabel: "Creative Ops",
    icon: AssetsIcon,
    columnKey: "médio",
  },
  {
    id: "creditos-limite",
    label: "Créditos acima do limite",
    sublabel: "Uso & Créditos",
    icon: AuditIcon,
    columnKey: "alto",
  },
  {
    id: "publicacao-envio",
    label: "Publicação ou envio externo",
    sublabel: "Tráfego · Canais",
    icon: SendIcon,
    columnKey: "alto",
  },
  {
    id: "alteracao-campanha",
    label: "Alteração de campanha",
    sublabel: "Tráfego Pago",
    icon: TrafficIcon,
    columnKey: "alto",
  },
  {
    id: "fonte-sensivel",
    label: "Acesso a fonte sensível",
    sublabel: "Conexões",
    icon: ChannelsIcon,
    columnKey: "alto",
  },
];

const RISK_COLUMNS: MatrixColumn[] = [
  { key: "baixo", label: "Baixo risco", tone: "baixo" },
  { key: "médio", label: "Médio risco", tone: "médio" },
  { key: "alto", label: "Alto risco", tone: "alto" },
];

const DECISION_TRACK: FlowStep[] = [
  { label: "Ação sensível", icon: ActionsIcon },
  { label: "Revisão humana", icon: AuthorizationIcon },
  { label: "Aprovar · Ajustar · Rejeitar", icon: DeepThinkingIcon },
  { label: "Registro futuro", icon: AuditIcon },
];

const SUMMARY_LINE: MetricStripItem[] = [
  { label: "Fila atual", value: "vazia nesta fase" },
  { label: "Proteção", value: "ativa" },
  { label: "Decisão", value: "humana" },
  { label: "Histórico", value: "futuro" },
];

function renderApprovalType(item: MatrixItem) {
  const Glyph = item.icon;

  return (
    <>
      <div className="flex items-center gap-2">
        {Glyph ? (
          <Glyph className="h-3.5 w-3.5 shrink-0 text-[var(--yzi-text-secondary)]" />
        ) : null}
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xs font-medium text-[var(--yzi-text-primary)]">
            {item.label}
          </span>
          {item.sublabel ? (
            <span className="truncate text-[0.62rem] text-[var(--yzi-text-faint)]">
              {item.sublabel}
            </span>
          ) : null}
        </div>
      </div>
      <YziQualitativeBar level={item.columnKey as QualitativeLevel} />
    </>
  );
}

const RISK_LEVEL_LABEL: Record<QualitativeLevel, string> = {
  baixo: "Baixo risco",
  médio: "Médio risco",
  alto: "Alto risco",
};

// Contagem estrutural: quantas categorias já definidas em APPROVAL_TYPES
// caem em cada risco. Não é volume de uso — é a mesma lista da matriz acima.
const DECISION_RISK_SLICES: DonutSlice[] = (
  ["baixo", "médio", "alto"] as QualitativeLevel[]
).map((level) => ({
  label: RISK_LEVEL_LABEL[level],
  level,
  count: APPROVAL_TYPES.filter((item) => item.columnKey === level).length,
}));

const PROTECTION_CHIPS: string[] = [
  "Nada publica sem aprovação",
  "Custo precisa de revisão",
  "Campanha exige confirmação",
  "Ajuste vira aprendizado",
  "Decisão será registrada",
];

export function ApprovalsV0() {
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
            Decisão humana · v0.1
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--yzi-text-primary)]">
            Aprovações
          </h1>
          <p className="text-sm text-[var(--yzi-text-secondary)]">
            Nada avança sem revisão humana.
          </p>
        </div>
      </div>

      <YziAlert tone="info" title="Sem decisões pendentes nesta fase." />

      <YziPanel className="flex flex-col gap-4 p-4">
        <YziFlowRail steps={DECISION_TRACK} />
        <div className="border-t border-[color:var(--yzi-border-subtle)] pt-3">
          <YziMetricStrip items={SUMMARY_LINE} />
        </div>
      </YziPanel>

      <YziMatrix
        columns={RISK_COLUMNS}
        items={APPROVAL_TYPES}
        emptyLabel="Nenhum tipo aqui ainda"
        renderItem={renderApprovalType}
      />

      <YziChartCard
        title="Distribuição por risco"
        caption="Quantas categorias de decisão protegida existem em cada nível — não é volume de uso."
      >
        <YziDonutChart slices={DECISION_RISK_SLICES} />
      </YziChartCard>

      <YziEmptyVisualState
        icon={ActionsIcon}
        message="Ações sensíveis aparecerão aqui antes de rodar."
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {PROTECTION_CHIPS.map((chip) => (
          <YziBadge key={chip} tone="authorization" className="normal-case">
            {chip}
          </YziBadge>
        ))}
      </div>
    </section>
  );
}
