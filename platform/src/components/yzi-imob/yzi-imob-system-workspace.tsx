import {
  MetricBand,
  StateTag,
  SurfaceCanvas,
  SurfaceHeader,
  SurfaceList,
  SurfaceRow,
  SurfaceSection,
  SurfaceState,
  TYPE,
  cx,
  type SurfaceMetric,
  type SurfaceTone,
} from "@/components/yzi-imob/yzi-imob-surface-kit";
import { YziInsight } from "@/components/yzi-imob/yzi-imob-yzi-kit";
import type { RadarWorkspaceData } from "@/lib/yzi-imob/radar/types";

// Sistema — saúde e funcionamento da operação em linguagem humana.
//
// Esta leitura já existia, mas estava dentro do Radar, misturada com sinais
// acionáveis e escrita em termos de engenharia ("Inbound failed", "Jobs
// parados", "Recoveries", nomes de fontes internas). Radar responde "o que eu
// faço agora"; Sistema responde "isso está funcionando?".
//
// Nenhuma fonte, tabela, fila, provedor ou código técnico é nomeado aqui.

type AccessState =
  | "ready"
  | "no_membership"
  | "permission_denied"
  | "tenant_error"
  | "read_error";

/** Áreas do produto que dependem de cada leitura, em linguagem do gestor. */
const AREA_COPY: Record<
  string,
  { label: string; description: string; affected: string }
> = {
  assets: {
    label: "Imóveis e publicação",
    description: "Cadastro, fotos, revisão e envio das páginas de imóvel.",
    affected: "Imóveis · Marketing",
  },
  commercial: {
    label: "Leads e visitas",
    description: "Distribuição de leads, próximas ações, agenda e retorno de visita.",
    affected: "Leads · Agenda · Corretores",
  },
  service: {
    label: "Atendimento",
    description: "Recebimento e envio de mensagens da operação.",
    affected: "Atendimento",
  },
  connections: {
    label: "Canais conectados",
    description: "Autorização e saúde dos canais usados para atender e publicar.",
    affected: "Conexões",
  },
  system: {
    label: "Rotinas automáticas",
    description: "Tarefas que a operação executa sozinha em segundo plano.",
    affected: "Marketing · Atendimento",
  },
};

function availabilityState(available: boolean): { tone: SurfaceTone; stateLabel: string } {
  return available
    ? { tone: "ok", stateLabel: "Funcionando normalmente" }
    : { tone: "attention", stateLabel: "Precisa de atenção" };
}

function formatLastCheck(value: string | null): string {
  if (!value) return "Sem verificação registrada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem verificação registrada";

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  const stamp = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);

  if (diffMinutes < 2) return `Última verificação: agora · ${stamp}`;
  if (diffMinutes < 60) return `Última verificação: há ${diffMinutes} min · ${stamp}`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `Última verificação: há ${diffHours} ${diffHours === 1 ? "hora" : "horas"} · ${stamp}`;
  return `Última verificação: ${stamp}`;
}

function AccessNotice({ accessState }: { accessState: Exclude<AccessState, "ready"> }) {
  const copy: Record<
    Exclude<AccessState, "ready">,
    { tone: SurfaceTone; title: string; body: string }
  > = {
    no_membership: {
      tone: "idle",
      title: "Sua conta ainda não está ligada a uma operação",
      body: "Conclua a implantação inicial para acompanhar a saúde da sua operação por aqui.",
    },
    permission_denied: {
      tone: "pending",
      title: "Seu acesso não inclui esta leitura",
      body: "Peça a quem administra a operação para liberar o acompanhamento do funcionamento do sistema.",
    },
    tenant_error: {
      tone: "attention",
      title: "Não conseguimos identificar sua operação agora",
      body: "Recarregue a página. Nenhuma verificação foi executada e nada foi alterado.",
    },
    read_error: {
      tone: "attention",
      title: "Não foi possível verificar a operação agora",
      body: "A checagem de funcionamento não respondeu. Recarregue em instantes; sua operação continua rodando normalmente.",
    },
  };

  const content = copy[accessState];
  return <SurfaceState tone={content.tone} title={content.title} body={content.body} />;
}

export function YziImobSystemWorkspace({
  data,
  accessState,
}: {
  data: RadarWorkspaceData | null;
  accessState: AccessState;
}) {
  if (accessState !== "ready" || !data) {
    return (
      <SurfaceCanvas>
        <SurfaceHeader
          kicker="Sistema"
          title="Funcionamento da operação"
          lead="Se algo da sua operação parar de funcionar, aparece aqui — em português, com o impacto e o que fazer."
        />
        <AccessNotice accessState={accessState === "ready" ? "read_error" : accessState} />
      </SurfaceCanvas>
    );
  }

  const health = data.operationalHealth;
  const healthAvailable = health.availability === "available";

  const areas = data.sources.map((source) => {
    const copy = AREA_COPY[source.id] ?? {
      label: source.label,
      description: "Parte da operação acompanhada automaticamente.",
      affected: "Operação",
    };
    const state = availabilityState(source.availability === "available");
    return { id: source.id, ...copy, ...state };
  });

  const degraded = areas.filter((area) => area.tone !== "ok");

  // Contadores traduzidos: cada número vira uma consequência operacional, nunca
  // o nome interno da fila ou do erro que o gerou.
  const attentionItems = [
    {
      id: "messages",
      label: "Mensagens não entregues",
      value: (health.outboundFailed ?? 0) + (health.inboundFailed ?? 0),
      description:
        "Mensagens que a operação tentou trocar com clientes e não completaram o caminho.",
      affected: "Atendimento",
      href: "/cockpit/yzi-imob/atendimento",
    },
    {
      id: "routines",
      label: "Rotinas automáticas travadas",
      value: health.jobsStalled ?? 0,
      description:
        "Tarefas que a operação executa sozinha e ficaram paradas antes de terminar.",
      affected: "Marketing · Atendimento",
      href: "/cockpit/yzi-imob/conexoes",
    },
    {
      id: "tasks",
      label: "Tarefas vencidas da equipe",
      value: health.overdueTasks ?? 0,
      description: "Próximas ações combinadas com leads que passaram do prazo.",
      affected: "Leads · Corretores",
      href: "/cockpit/yzi-imob/radar",
    },
  ];

  const totalAttention = attentionItems.reduce((sum, item) => sum + item.value, 0);

  const metrics: SurfaceMetric[] = [
    {
      label: "Estado geral",
      value: degraded.length === 0 ? "Normal" : "Atenção",
      detail:
        degraded.length === 0
          ? "Todas as áreas responderam"
          : `${degraded.length} ${degraded.length === 1 ? "área precisa" : "áreas precisam"} de revisão`,
      tone: degraded.length === 0 ? "ok" : "attention",
    },
    {
      label: "Áreas verificadas",
      value: String(areas.length),
      detail: "Partes da operação acompanhadas",
    },
    {
      label: "Itens com atenção",
      value: healthAvailable ? String(totalAttention) : "—",
      detail: healthAvailable ? "Somados nas rotinas e mensagens" : "Verificação indisponível",
      tone: healthAvailable && totalAttention > 0 ? "attention" : undefined,
    },
    {
      label: "Recuperações automáticas",
      value: healthAvailable ? String(health.recoveriesExecuted ?? 0) : "—",
      detail: "Falhas que o sistema resolveu sozinho",
      tone: "ok",
    },
  ];

  return (
    <SurfaceCanvas>
      <SurfaceHeader
        kicker="Sistema"
        title="Funcionamento da operação"
        lead="Se algo da sua operação parar de funcionar, aparece aqui — em português, com o impacto e o que fazer."
      />

      <MetricBand metrics={metrics} />

      {degraded.length > 0 ? (
        <YziInsight
          context="Funcionamento da operação"
          tone="attention"
          stateLabel="Precisa de atenção"
          headline={
            degraded.length === 1
              ? `A área “${degraded[0].label}” não respondeu na última verificação.`
              : `${degraded.length} áreas não responderam na última verificação.`
          }
          reading="Enquanto isso, os dados dessas áreas podem estar incompletos nas telas que dependem delas. Sua operação continua funcionando — o que falha é a leitura."
          evidence={degraded.map((area) => `${area.label} · afeta ${area.affected}`)}
          recommendation="Recarregue a página em alguns minutos. Se continuar, verifique os canais conectados antes de abrir chamado."
          primaryAction={{ label: "Ver conexões", href: "/cockpit/yzi-imob/conexoes" }}
        />
      ) : (
        <YziInsight
          context="Funcionamento da operação"
          tone="ok"
          stateLabel="Funcionando normalmente"
          headline="Todas as áreas da operação responderam na última verificação."
          reading={
            healthAvailable && totalAttention > 0
              ? `Ainda assim, ${totalAttention} ${totalAttention === 1 ? "item precisa" : "itens precisam"} de acompanhamento — nada impede a operação de rodar hoje.`
              : "Nenhum item pendente de acompanhamento no momento."
          }
          recommendation={
            healthAvailable && totalAttention > 0
              ? "Vale revisar os itens com atenção abaixo antes do fim do dia."
              : undefined
          }
        />
      )}

      <SurfaceSection
        first
        title="Áreas da operação"
        description="Cada área é uma parte do produto que depende de leituras automáticas para funcionar."
      >
        <SurfaceList>
          {areas.map((area) => (
            <SurfaceRow
              key={area.id}
              title={area.label}
              description={area.description}
              tone={area.tone}
              stateLabel={area.stateLabel}
              meta={<span>Afeta: {area.affected}</span>}
            />
          ))}
        </SurfaceList>
      </SurfaceSection>

      <SurfaceSection
        title="Itens com atenção"
        description="Números traduzidos para o efeito que causam na operação, não para o erro que os gerou."
      >
        {!healthAvailable ? (
          <SurfaceState
            tone="pending"
            title="Verificação detalhada indisponível"
            body="A checagem detalhada não respondeu nesta consulta. Preferimos não estimar números a mostrar um valor que não é real."
          />
        ) : totalAttention === 0 ? (
          <SurfaceState
            tone="ok"
            title="Nenhum item exige atenção agora"
            body="Mensagens, rotinas automáticas e tarefas da equipe estão dentro do esperado."
          />
        ) : (
          <SurfaceList>
            {attentionItems
              .filter((item) => item.value > 0)
              .map((item) => (
                <SurfaceRow
                  key={item.id}
                  title={item.label}
                  description={item.description}
                  tone="attention"
                  stateLabel={`${item.value} ${item.value === 1 ? "ocorrência" : "ocorrências"}`}
                  meta={<span>Afeta: {item.affected}</span>}
                  actions={
                    <a
                      href={item.href}
                      className="inline-flex items-center rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-[0.72rem] text-[var(--yzi-text-secondary)] transition-colors hover:border-[color:var(--yzi-border-strong)] hover:text-[var(--yzi-text-primary)]"
                    >
                      Abrir
                    </a>
                  }
                />
              ))}
          </SurfaceList>
        )}
      </SurfaceSection>

      <SurfaceSection
        title="Última verificação"
        description="A operação é verificada continuamente; este é o registro mais recente."
      >
        <div className="flex flex-wrap items-center gap-3">
          <StateTag
            tone={degraded.length === 0 ? "ok" : "attention"}
            label={degraded.length === 0 ? "Funcionando normalmente" : "Precisa de atenção"}
          />
          <span className={cx(TYPE.meta)}>
            {formatLastCheck(health.latestRunnerExecutionAt)}
          </span>
        </div>
      </SurfaceSection>
    </SurfaceCanvas>
  );
}
