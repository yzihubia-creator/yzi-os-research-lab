import {
  MetricBand,
  SurfaceButton,
  SurfaceCanvas,
  SurfaceHeader,
  SurfaceList,
  SurfaceRow,
  SurfaceSection,
  SurfaceState,
  TYPE,
  type SurfaceMetric,
  type SurfaceTone,
} from "@/components/yzi-imob/yzi-imob-surface-kit";
import { YziInsight, YziRestrictedState } from "@/components/yzi-imob/yzi-imob-yzi-kit";
import type {
  OperationalConsumptionSummary,
  SystemResourceState,
  SystemResourceStatus,
} from "@/lib/yzi-imob/consumption/types";

// APIs & Créditos — quanto a operação consumiu e o que está no limite.
//
// O gestor precisa entender e controlar consumo; ele não precisa saber qual
// fornecedor executa cada capacidade. Por isso a tela lê o `capability` do
// contrato e apresenta a CAPACIDADE em linguagem de produto — o `label` e o
// `description` do contrato, que carregam nome de fornecedor e vocabulário de
// engenharia, ficam de fora por princípio.
//
// As seções numeradas ("1. Estado das integrações", "2. Uso operacional"…)
// foram substituídas por títulos que dizem o que o gestor vai encontrar.

type AccessState =
  | "ready"
  | "no_session"
  | "no_membership"
  | "tenant_error"
  | "read_error";

/** Capacidade do produto → linguagem do gestor. Nunca o fornecedor por trás. */
const CAPABILITY_COPY: Record<
  SystemResourceState["capability"],
  { category: string; label: string; description: string }
> = {
  outbound_messages: {
    category: "Atendimento",
    label: "Mensagens enviadas",
    description: "Mensagens que a operação enviou para clientes e leads no período.",
  },
  social_publication: {
    category: "Publicação",
    label: "Publicações em redes",
    description: "Conteúdos aprovados que foram programados ou publicados no período.",
  },
  runner_execution: {
    category: "Automações",
    label: "Rotinas automáticas",
    description: "Tarefas que a operação executou sozinha em segundo plano.",
  },
};

const STATUS_STATE: Record<SystemResourceStatus, { tone: SurfaceTone; label: string }> = {
  available: { tone: "ok", label: "Funcionando normalmente" },
  partial: { tone: "pending", label: "Parcialmente disponível" },
  unavailable: { tone: "idle", label: "Indisponível" },
  configuration_required: { tone: "pending", label: "Aguardando configuração" },
  stale: { tone: "pending", label: "Última leitura antiga" },
  error: { tone: "attention", label: "Precisa de atenção" },
};

const UNIT_LABEL: Record<SystemResourceState["usage_unit"], [string, string]> = {
  messages: ["mensagem", "mensagens"],
  publications: ["publicação", "publicações"],
  executions: ["execução", "execuções"],
};

function formatUsage(resource: SystemResourceState): string {
  if (!resource.usage_available || resource.usage_value === null) return "—";
  const unit = UNIT_LABEL[resource.usage_unit];
  return `${resource.usage_value.toLocaleString("pt-BR")} ${
    resource.usage_value === 1 ? unit[0] : unit[1]
  }`;
}

function formatUpdatedAt(value: string | null): string {
  if (!value) return "Sem leitura registrada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem leitura registrada";
  return `Atualizado em ${new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date)}`;
}

function AccessNotice({ accessState }: { accessState: Exclude<AccessState, "ready"> }) {
  const copy: Record<
    Exclude<AccessState, "ready">,
    { tone: SurfaceTone; title: string; body: string }
  > = {
    no_session: {
      tone: "pending",
      title: "Entre novamente para ver seu consumo",
      body: "Sua sessão expirou. Nenhum consumo foi consultado.",
    },
    no_membership: {
      tone: "idle",
      title: "Sua conta ainda não está ligada a uma operação",
      body: "Conclua a implantação inicial para acompanhar o consumo da sua imobiliária.",
    },
    tenant_error: {
      tone: "attention",
      title: "Não conseguimos identificar sua operação agora",
      body: "Recarregue a página. Nenhum valor foi estimado.",
    },
    read_error: {
      tone: "attention",
      title: "Não foi possível ler o consumo agora",
      body: "A leitura falhou. Preferimos não mostrar nada a mostrar um número que não é seu.",
    },
  };

  const content = copy[accessState];
  return <SurfaceState tone={content.tone} title={content.title} body={content.body} />;
}

function ResourceRow({
  resource,
  showUsage = true,
}: {
  resource: SystemResourceState;
  showUsage?: boolean;
}) {
  const copy = CAPABILITY_COPY[resource.capability];
  const state = STATUS_STATE[resource.status];

  return (
    <SurfaceRow
      title={copy.label}
      description={copy.description}
      tone={state.tone}
      stateLabel={state.label}
      meta={
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          <span>{copy.category}</span>
          <span>{formatUpdatedAt(resource.last_updated_at)}</span>
        </span>
      }
      actions={
        <>
          {showUsage ? (
            <span className="text-[0.92rem] font-semibold tabular-nums text-[var(--yzi-text-primary)]">
              {resource.usage_available && resource.usage_value !== null ? (
                formatUsage(resource)
              ) : (
                <span className={TYPE.meta}>Consumo indisponível</span>
              )}
            </span>
          ) : null}
          <SurfaceButton action={{ label: "Abrir", href: resource.action_href }} />
        </>
      }
    />
  );
}

export function YziImobApisCreditosWorkspace({
  summary,
  accessState,
}: {
  summary: OperationalConsumptionSummary | null;
  accessState: AccessState;
}) {
  const header = (
    <SurfaceHeader
      kicker="Sistema"
      title="Consumo da operação"
      lead="Quanto cada capacidade do produto consumiu no período, o que está no limite e o que precisa de atenção."
      secondaryActions={[{ label: "Ver canais", href: "/cockpit/yzi-imob/conexoes" }]}
    />
  );

  if (accessState !== "ready" || !summary) {
    return (
      <SurfaceCanvas>
        {header}
        <AccessNotice accessState={accessState === "ready" ? "read_error" : accessState} />
      </SurfaceCanvas>
    );
  }

  const attention = summary.resources.filter((resource) =>
    ["partial", "unavailable", "configuration_required", "stale", "error"].includes(
      resource.status,
    ),
  );

  const measured = summary.resources.filter(
    (resource) => resource.usage_available && resource.usage_value !== null,
  );

  const topConsumer = [...measured].sort(
    (a, b) => (b.usage_value ?? 0) - (a.usage_value ?? 0),
  )[0];

  const metrics: SurfaceMetric[] = summary.resources.slice(0, 3).map((resource) => {
    const copy = CAPABILITY_COPY[resource.capability];
    const state = STATUS_STATE[resource.status];
    return {
      label: copy.category,
      value:
        resource.usage_available && resource.usage_value !== null
          ? resource.usage_value.toLocaleString("pt-BR")
          : "—",
      detail: copy.label,
      tone: state.tone === "ok" ? undefined : state.tone,
    };
  });

  metrics.push({
    label: "Precisam de atenção",
    value: String(attention.length),
    detail: attention.length ? "Capacidades com pendência" : "Nenhuma pendência",
    tone: attention.length ? "attention" : "ok",
  });

  return (
    <SurfaceCanvas>
      {header}

      <MetricBand metrics={metrics} />

      {topConsumer ? (
        <YziInsight
          context={summary.period.label}
          tone={attention.length ? "attention" : "ok"}
          stateLabel={attention.length ? "Requer revisão" : "Dentro do esperado"}
          headline={`${CAPABILITY_COPY[topConsumer.capability].label} foi o que mais consumiu: ${formatUsage(topConsumer)}.`}
          reading={
            attention.length
              ? `Outras ${attention.length === 1 ? "capacidade está" : `${attention.length} capacidades estão`} com pendência de configuração ou leitura antiga, então o total do período pode estar incompleto.`
              : "Todas as capacidades responderam nesta leitura, então o total do período reflete o consumo real."
          }
          evidence={measured.map(
            (resource) =>
              `${CAPABILITY_COPY[resource.capability].category}: ${formatUsage(resource)}`,
          )}
          recommendation="Compare este período com o anterior antes de mudar o ritmo de publicação ou de atendimento — um pico isolado raramente justifica ajuste."
          analysisHref="/cockpit/yzi-imob/growth/resultados"
          analysisLabel="Ver resultados do período"
        />
      ) : null}

      <SurfaceSection
        first
        title="Consumo por capacidade"
        description={`${summary.period.label}. Contagens do que a sua operação realmente executou.`}
      >
        <SurfaceList>
          {summary.resources.map((resource) => (
            <ResourceRow key={`${resource.capability}:usage`} resource={resource} />
          ))}
        </SurfaceList>
      </SurfaceSection>

      <SurfaceSection
        title="Precisa de atenção"
        description="Capacidades com configuração pendente, leitura antiga ou falha."
        count={attention.length ? String(attention.length) : undefined}
      >
        {attention.length ? (
          <SurfaceList>
            {attention.map((resource) => (
              <ResourceRow
                key={`${resource.capability}:attention`}
                resource={resource}
                showUsage={false}
              />
            ))}
          </SurfaceList>
        ) : (
          <SurfaceState
            tone="ok"
            title="Nenhuma capacidade exige atenção agora"
            body="Tudo o que a operação usa respondeu normalmente nesta leitura."
          />
        )}
      </SurfaceSection>

      <SurfaceSection
        title="Franquia e limites"
        description="Saldo disponível, projeção do período e alertas de limite."
      >
        <YziRestrictedState
          context="Consumo da operação"
          stateLabel="Aguardando liberação"
          title="Sua operação ainda não tem franquia ou limite definidos."
          body="Enquanto não houver um limite acordado para a sua conta, mostrar saldo ou projeção seria inventar um número. O consumo acima continua sendo real e atualizado."
        />
      </SurfaceSection>

      <SurfaceSection
        title="Custos"
        description="Valor financeiro por capacidade no período."
      >
        <SurfaceState
          tone="idle"
          title="Custo financeiro ainda não é medido nesta operação"
          body="Não existe fonte de cobrança ligada à sua conta. Preferimos deixar o campo vazio a mostrar zero como se fosse um custo real."
        />
      </SurfaceSection>
    </SurfaceCanvas>
  );
}
