import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import {
  YziActivityFeed,
  YziChartPanel,
  YziDataTable,
  YziKpiCard,
  YziOverviewStrip,
  YziProgressBar,
  type DataTableColumn,
  type DataTableRow,
  type OverviewKpi,
  type ProgressLevel,
  type ProgressTone,
} from "@/components/yzi-os/yzi-dashboard-primitives";
import { YziDonutChart, type DonutSlice } from "@/components/yzi-os/yzi-charts";
import {
  YziCreditGauge,
  YziFlowRail,
  YziMetricStrip,
  type QualitativeLevel,
} from "@/components/yzi-os/yzi-visual-primitives";
import {
  AssetsIcon,
  AuditIcon,
  AuthorizationIcon,
  ChannelsIcon,
  CommandCenterIcon,
  DeepThinkingIcon,
  FinanceIcon,
  OpportunityIcon,
  SendIcon,
  TrafficIcon,
} from "@/components/yzi-os/yzi-icons";
import {
  YziAlert,
  YziBadge,
  YziPanel,
  YziStatusBadge,
} from "@/components/yzi-os/yzi-primitives";

type ConsumptionStatus = "disponível no sistema" | "em preparação" | "planejado";

type CostRisk = "baixo" | "médio" | "alto";

type ConsumptionCategory = {
  id: string;
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  status: ConsumptionStatus;
  costRisk: CostRisk;
  requiresApproval: boolean;
  module: string;
  note: string;
};

// Categorias honestas de consumo do YZI OS. Nenhum número real; status
// reflete o que existe hoje no produto, não uma promessa de cobrança. Toda
// leitura da tela deriva desta lista estrutural — não de uso registrado.
const CONSUMPTION_CATEGORIES: ConsumptionCategory[] = [
  {
    id: "analises-ia",
    name: "Análises com IA",
    icon: DeepThinkingIcon,
    status: "em preparação",
    costRisk: "médio",
    requiresApproval: false,
    module: "Radar · Oportunidades",
    note: "Leitura e sugestão da YZI. Uma estimativa aparece antes de qualquer análise mais pesada.",
  },
  {
    id: "geracao-copy",
    name: "Geração de copy",
    icon: SendIcon,
    status: "planejado",
    costRisk: "médio",
    requiresApproval: true,
    module: "Creative Ops",
    note: "Toda geração criativa precisa estar ligada a uma hipótese aprovada.",
  },
  {
    id: "briefing-visual",
    name: "Briefing visual",
    icon: AssetsIcon,
    status: "planejado",
    costRisk: "médio",
    requiresApproval: true,
    module: "Creative Ops",
    note: "Parte do pacote criativo. Ainda não existe nesta fase do produto.",
  },
  {
    id: "fontes-externas",
    name: "Fontes externas",
    icon: ChannelsIcon,
    status: "em preparação",
    costRisk: "alto",
    requiresApproval: true,
    module: "Conexões",
    note: "Consultar uma fonte externa pode consumir crédito por chamada quando ela for conectada de verdade.",
  },
  {
    id: "execucao-assistida",
    name: "Execução assistida",
    icon: TrafficIcon,
    status: "planejado",
    costRisk: "alto",
    requiresApproval: true,
    module: "Ações · Tráfego Pago",
    note: "Qualquer ação que altere dados fora do YZI OS passa por aprovação humana antes de rodar.",
  },
  {
    id: "armazenamento-historico",
    name: "Armazenamento / histórico",
    icon: AuditIcon,
    status: "disponível no sistema",
    costRisk: "baixo",
    requiresApproval: false,
    module: "Biblioteca",
    note: "Guardar material e histórico de uso não consome créditos nesta fase.",
  },
];

const STATUS_TONE: Record<ConsumptionStatus, "trust" | "preview" | "neutral"> = {
  "disponível no sistema": "trust",
  "em preparação": "preview",
  planejado: "neutral",
};

// Mapa risco de custo → leitura qualitativa da barra. A barra representa o
// risco estrutural de cada categoria (atributo do código), nunca consumo.
const COST_RISK_BAR: Record<CostRisk, { level: ProgressLevel; tone: ProgressTone }> = {
  baixo: { level: "low", tone: "positive" },
  médio: { level: "medium", tone: "warning" },
  alto: { level: "high", tone: "danger" },
};

const COST_RISK_QUALITATIVE: Record<CostRisk, QualitativeLevel> = {
  baixo: "baixo",
  médio: "médio",
  alto: "alto",
};

// Contagens estruturais derivadas da lista de categorias — não são métricas
// de uso. É só "quantos tipos de consumo o produto já mapeou".
const totalCategories = CONSUMPTION_CATEGORIES.length;
const categoriesRequiringApproval = CONSUMPTION_CATEGORIES.filter(
  (category) => category.requiresApproval,
).length;
const categoriesWithoutCost = CONSUMPTION_CATEGORIES.filter(
  (category) => !category.requiresApproval && category.costRisk === "baixo",
).length;

const OVERVIEW_KPIS: OverviewKpi[] = [
  {
    id: "creditos",
    label: "Créditos disponíveis",
    value: "Não definido",
    icon: FinanceIcon,
  },
  {
    id: "consumo",
    label: "Consumo atual",
    value: "Sem uso",
    icon: DeepThinkingIcon,
  },
  {
    id: "limite",
    label: "Limite do plano",
    value: "Em preparação",
    icon: AuditIcon,
  },
  {
    id: "protecao",
    label: "Proteção",
    value: "Ativa",
    icon: AuthorizationIcon,
  },
];

// KPI cards conceituais: valores são contagens estruturais reais (inteiros
// derivados da lista acima), por isso ganham tipografia tabular.
const STRUCTURAL_KPIS: Array<{
  id: string;
  label: string;
  value: string;
  caption: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  {
    id: "mapeadas",
    label: "Categorias mapeadas",
    value: String(totalCategories),
    caption: "tipos de consumo definidos no produto",
    icon: OpportunityIcon,
  },
  {
    id: "aprovacao",
    label: "Exigem aprovação",
    value: String(categoriesRequiringApproval),
    caption: "passam por humano antes de qualquer custo",
    icon: AuthorizationIcon,
  },
  {
    id: "sem-custo",
    label: "Sem custo nesta fase",
    value: String(categoriesWithoutCost),
    caption: "leitura e armazenamento não consomem crédito",
    icon: AuditIcon,
  },
];

// Distribuição estrutural: quantas categorias caem em cada nível de risco de
// custo. Contagem do código, não volume de uso.
const COST_RISK_ORDER: CostRisk[] = ["baixo", "médio", "alto"];

const COST_DISTRIBUTION: DonutSlice[] = COST_RISK_ORDER.map((risk) => ({
  label: `Risco ${risk}`,
  level: COST_RISK_QUALITATIVE[risk],
  count: CONSUMPTION_CATEGORIES.filter((category) => category.costRisk === risk)
    .length,
}));

const PROTECTION_STATES: Array<{ label: string; value: string }> = [
  { label: "Cobrança automática", value: "não" },
  { label: "Proteção", value: "ativa" },
  { label: "Limite definido", value: "ainda não" },
];

const PROTECTION_RULES: string[] = [
  "Toda geração criativa precisa estar ligada a uma hipótese.",
  "Ações de campanha exigem aprovação antes de execução.",
  "Modelos caros exigem estimativa antes de rodar.",
  "Nada altera dados fora do YZI OS sem aprovação humana.",
];

const PROTECTION_FLOW = [
  { label: "Estimar", icon: DeepThinkingIcon },
  { label: "Aprovar", icon: AuthorizationIcon },
  { label: "Consumir", icon: TrafficIcon },
  { label: "Registrar", icon: AuditIcon },
];

// Colunas do registro de consumo. A tabela nasce vazia de propósito: não há
// uso registrado nesta fase e nenhuma linha é fabricada.
const HISTORY_COLUMNS: DataTableColumn[] = [
  { key: "quando", label: "Quando" },
  { key: "categoria", label: "Categoria" },
  { key: "modulo", label: "Módulo" },
  { key: "risco", label: "Risco de custo", align: "right" },
];

const HISTORY_ROWS: DataTableRow[] = [];

// Tabela estrutural dos tipos de consumo (definição, não uso). Cada linha é
// uma categoria já existente no código.
const CATALOG_COLUMNS: DataTableColumn[] = [
  { key: "categoria", label: "Categoria" },
  { key: "status", label: "Status" },
  { key: "modulo", label: "Módulo" },
  { key: "aprovacao", label: "Aprovação", align: "right" },
];

const CATALOG_ROWS: DataTableRow[] = CONSUMPTION_CATEGORIES.map((category) => {
  const Glyph = category.icon;
  return {
    id: category.id,
    cells: {
      categoria: (
        <span className="flex items-center gap-2">
          <Glyph className="h-3.5 w-3.5 shrink-0 text-[var(--yzi-text-secondary)]" />
          <span className="font-medium text-[var(--yzi-text-primary)]">
            {category.name}
          </span>
        </span>
      ),
      status: (
        <YziStatusBadge tone={STATUS_TONE[category.status]}>
          {category.status}
        </YziStatusBadge>
      ),
      modulo: (
        <span className="text-[var(--yzi-text-secondary)]">{category.module}</span>
      ),
      aprovacao: (
        <span className="text-[var(--yzi-text-secondary)]">
          {category.requiresApproval ? "Sim" : "Não nesta fase"}
        </span>
      ),
    },
  };
});

export function UsageCreditsV0() {
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
            Governança de consumo · v0.2
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--yzi-text-primary)]">
            Uso &amp; Créditos
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Leitura operacional do que pode gerar custo no YZI OS — antes de
            liberar análises, criativos e ações.
          </p>
        </div>
      </div>

      <YziAlert tone="info" title="Nenhuma cobrança automática existe nesta versão.">
        Tudo abaixo é estrutura de controle, não cobrança real. Nenhum crédito,
        consumo ou histórico é numérico ainda — ações futuras passam por
        estimativa e aprovação antes de rodar.
      </YziAlert>

      <YziOverviewStrip
        title="Estado atual"
        kpis={OVERVIEW_KPIS}
        rightSlot={
          <YziBadge tone="preview" className="normal-case">
            sem dado real
          </YziBadge>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STRUCTURAL_KPIS.map((kpi) => (
          <YziKpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            caption={kpi.caption}
            icon={kpi.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <YziChartPanel
          title="Distribuição estrutural de custo"
          caption="Quantas categorias caem em cada nível de risco — contagem do código, não uso registrado, não cobrança."
          tabs={[
            { id: "risco", label: "Por risco de custo" },
            { id: "modulo", label: "Por módulo" },
          ]}
          rightSlot={
            <YziBadge tone="preview" className="normal-case">
              estrutura · sem dado real
            </YziBadge>
          }
        >
          <div className="lg:col-span-2">
            <YziDonutChart slices={COST_DISTRIBUTION} />
          </div>
        </YziChartPanel>

        <YziPanel className="flex flex-col items-stretch gap-4 p-4">
          <YziCreditGauge label="Limite de crédito" state="limite futuro" />
          <p className="text-center text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
            Ainda não há limite definido nem cobrança automática. O medidor fica
            neutro até um plano real ser conectado.
          </p>
          <YziMetricStrip items={PROTECTION_STATES} />
        </YziPanel>
      </div>

      <YziPanel className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Risco de custo por categoria
          </h2>
          <p className="text-[0.66rem] text-[var(--yzi-text-faint)]">
            Atributo estrutural de cada tipo de consumo — não representa uso nem
            percentual real.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {CONSUMPTION_CATEGORIES.map((category) => {
            const bar = COST_RISK_BAR[category.costRisk];
            return (
              <YziProgressBar
                key={category.id}
                label={category.name}
                valueLabel={`risco ${category.costRisk}`}
                level={bar.level}
                tone={bar.tone}
                size="sm"
              />
            );
          })}
        </div>
      </YziPanel>

      <YziPanel className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Tipos de consumo · definição estrutural
          </h2>
          <YziBadge tone="neutral" className="normal-case">
            {totalCategories} categorias mapeadas
          </YziBadge>
        </div>
        <YziDataTable columns={CATALOG_COLUMNS} rows={CATALOG_ROWS} />
      </YziPanel>

      <YziPanel variant="authorization" className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
          <AuthorizationIcon className="h-4 w-4" />
          <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
            Fluxo de proteção
          </h2>
        </div>
        <YziFlowRail steps={PROTECTION_FLOW} />
        <p className="text-center text-xs text-[var(--yzi-text-faint)]">
          Todo custo passa por este caminho antes de existir. Nenhuma etapa roda
          sozinha.
        </p>
        <ul className="grid grid-cols-1 gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-3 sm:grid-cols-2">
          {PROTECTION_RULES.map((rule) => (
            <li
              key={rule}
              className="flex items-baseline gap-2 text-xs leading-relaxed text-[var(--yzi-text-primary)]"
            >
              <span
                aria-hidden
                className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--yzi-accent-authorization)]"
              />
              {rule}
            </li>
          ))}
        </ul>
      </YziPanel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
            <AuditIcon className="h-4 w-4" />
            <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
              Registro de consumo
            </h2>
          </div>
          <YziDataTable
            columns={HISTORY_COLUMNS}
            rows={HISTORY_ROWS}
            emptyLabel="Nenhum uso registrado ainda — nada consumiu crédito nesta fase."
          />
        </div>

        <YziActivityFeed
          title="Atividade recente"
          items={[]}
          emptyLabel="Quando a YZI executar análises, consultas ou gerações, cada evento aparece aqui."
        />
      </div>
    </section>
  );
}
