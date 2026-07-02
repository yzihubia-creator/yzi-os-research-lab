import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import {
  AssetsIcon,
  AuditIcon,
  AuthorizationIcon,
  ChannelsIcon,
  CommandCenterIcon,
  DeepThinkingIcon,
  SendIcon,
  TrafficIcon,
} from "@/components/yzi-os/yzi-icons";
import {
  YziAlert,
  YziBadge,
  YziPanel,
  YziStatusBadge,
  YziSurface,
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

// Categorias honestas de consumo do YZI OS v0.1. Nenhum número real; status
// reflete o que existe hoje no produto, não uma promessa de cobrança.
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

const COST_RISK_DOT_COLOR: Record<CostRisk, string> = {
  baixo: "bg-[var(--yzi-accent-opportunity)]",
  médio: "bg-[var(--yzi-accent-risk)]",
  alto: "bg-[var(--yzi-state-blocked)]",
};

const SUMMARY_STATS: Array<{ label: string; value: string }> = [
  { label: "Créditos disponíveis", value: "Não definido" },
  { label: "Consumo atual", value: "Sem uso registrado" },
  { label: "Limite do plano", value: "Em preparação" },
  { label: "Aprovações pendentes", value: "Nenhuma nesta fase" },
];

const PROTECTION_RULES: string[] = [
  "Toda geração criativa precisa estar ligada a uma hipótese.",
  "Ações de campanha exigem aprovação antes de execução.",
  "Modelos caros exigem estimativa antes de rodar.",
  "Fontes externas podem consumir créditos por consulta.",
  "Nada altera dados fora do YZI OS sem aprovação humana.",
];

function SummaryStatCard({ label, value }: { label: string; value: string }) {
  return (
    <YziPanel className="flex flex-col gap-1.5 p-4">
      <span className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[var(--yzi-text-secondary)]">
        {label}
      </span>
      <span className="text-sm font-semibold text-[var(--yzi-text-primary)]">
        {value}
      </span>
    </YziPanel>
  );
}

function ConsumptionCard({ category }: { category: ConsumptionCategory }) {
  const Glyph = category.icon;

  return (
    <YziPanel className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <YziSurface
            aria-hidden
            variant="elevated"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--yzi-radius-md)] p-0 text-[var(--yzi-text-secondary)]"
          >
            <Glyph className="h-4 w-4" />
          </YziSurface>
          <h3 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            {category.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <YziStatusBadge tone={STATUS_TONE[category.status]}>
          {category.status}
        </YziStatusBadge>
        <YziBadge tone="neutral" className="normal-case">
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${COST_RISK_DOT_COLOR[category.costRisk]}`}
          />
          risco de custo {category.costRisk}
        </YziBadge>
      </div>

      <dl className="flex flex-col gap-1.5 border-t border-[color:var(--yzi-border-subtle)] pt-3 text-xs">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--yzi-text-secondary)]">Exige aprovação</dt>
          <dd className="text-right text-[var(--yzi-text-primary)]">
            {category.requiresApproval ? "Sim" : "Não nesta fase"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--yzi-text-secondary)]">Módulo</dt>
          <dd className="text-right text-[var(--yzi-text-primary)]">
            {category.module}
          </dd>
        </div>
      </dl>

      <p className="text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
        {category.note}
      </p>
    </YziPanel>
  );
}

export function UsageCreditsV0() {
  return (
    <section className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-6 px-6 py-10">
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
            Governança de consumo · v0.1
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--yzi-text-primary)]">
            Uso &amp; Créditos
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Acompanhe o consumo do YZI OS antes de liberar análises, criativos
            e ações que podem gerar custo.
          </p>
        </div>
      </div>

      <YziAlert tone="info" title="Nenhuma cobrança automática existe nesta versão.">
        Os números abaixo são estrutura de controle, não cobrança real. Ações
        futuras de IA, criativos ou execução passam por estimativa e
        aprovação antes de rodar.
      </YziAlert>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_STATS.map((stat) => (
          <SummaryStatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
          Tipos de consumo
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONSUMPTION_CATEGORIES.map((category) => (
            <ConsumptionCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      <YziPanel variant="authorization" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
          <AuthorizationIcon className="h-4 w-4" />
          <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
            Regras de proteção
          </h2>
        </div>
        <ul className="flex flex-col gap-2">
          {PROTECTION_RULES.map((rule) => (
            <li
              key={rule}
              className="flex items-baseline gap-2 text-sm leading-relaxed text-[var(--yzi-text-primary)]"
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

      <YziSurface variant="elevated" className="p-1.5">
        <YziPanel className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
            <AuditIcon className="h-4 w-4" />
            <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
              Histórico
            </h2>
          </div>
          <p className="text-sm font-medium text-[var(--yzi-text-primary)]">
            Nenhum uso registrado ainda.
          </p>
          <p className="text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Quando o YZI OS executar análises, consultas ou gerações, o
            histórico aparecerá aqui.
          </p>
        </YziPanel>
      </YziSurface>
    </section>
  );
}
