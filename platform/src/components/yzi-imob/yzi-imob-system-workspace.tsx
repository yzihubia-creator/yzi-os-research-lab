import {
  MetricBand,
  StateTag,
  SurfaceButton,
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
import {
  AREA_BY_CATEGORY,
  AREA_COPY,
  describeSignal,
  isAwaitingRelease,
  type OperationalArea,
} from "@/lib/yzi-imob/radar/presentation";
import type { RadarWorkspaceData } from "@/lib/yzi-imob/radar/types";

// Sistema — saúde e funcionamento da operação em linguagem humana.
//
// Radar responde "o que eu faço agora"; Sistema responde "isso está
// funcionando". As duas telas leem O MESMO objeto, então precisam contar a
// mesma história: Sistema deriva o estado de cada área dos MESMOS sinais que o
// Radar lista, e não apenas de a consulta ter respondido.
//
// A versão anterior olhava só para `sources[].availability` — que é verdadeiro
// sempre que a consulta não deu erro. Com canais pendentes e sinais abertos no
// Radar, esta tela dizia "Normal" e "zero atenção". Isso acabou.
//
// Distinção que as três telas agora compartilham: capacidade AGUARDANDO
// LIBERAÇÃO não é falha. Nada quebrou — ainda não foi liberado.

type AccessState =
  | "ready"
  | "no_membership"
  | "permission_denied"
  | "tenant_error"
  | "read_error";

/** Fontes do contrato → áreas da operação, para cruzar com os sinais. */
const SOURCE_AREA: Record<string, OperationalArea> = {
  assets: "imoveis",
  commercial: "comercial",
  service: "atendimento",
  connections: "canais",
  system: "rotinas",
};

const AREA_ORDER: OperationalArea[] = [
  "imoveis",
  "comercial",
  "atendimento",
  "canais",
  "rotinas",
];

type AreaState = {
  area: OperationalArea;
  tone: SurfaceTone;
  stateLabel: string;
  /** Sinais abertos que explicam o estado — os mesmos que o Radar mostra. */
  openItems: string[];
  /** Quantos itens realmente exigem ação (aguardando liberação não conta). */
  attentionCount: number;
  awaitingCount: number;
  unreadable: boolean;
};

function formatLastCheck(value: string | null): string {
  if (!value) return "Sem verificação registrada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem verificação registrada";
  return `Última verificação: ${new Intl.DateTimeFormat("pt-BR", {
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

/**
 * Deriva o estado de cada área a partir dos sinais abertos — a MESMA fonte que
 * o Radar usa — cruzada com a disponibilidade da leitura.
 */
function buildAreaStates(data: RadarWorkspaceData): AreaState[] {
  const unreadable = new Set<OperationalArea>();
  for (const source of data.sources) {
    const area = SOURCE_AREA[source.id];
    if (area && source.availability !== "available") unreadable.add(area);
  }

  return AREA_ORDER.map((area) => {
    const signals = data.signals.filter(
      (signal) => AREA_BY_CATEGORY[signal.category] === area,
    );

    const awaiting = signals.filter(isAwaitingRelease);
    const attention = signals.filter(
      (signal) => !isAwaitingRelease(signal) && signal.severity !== "info",
    );
    const cannotRead = unreadable.has(area);

    const tone: SurfaceTone = cannotRead
      ? "attention"
      : attention.length
        ? "attention"
        : awaiting.length
          ? "pending"
          : "ok";

    const stateLabel = cannotRead
      ? "Não foi possível verificar"
      : attention.length
        ? "Precisa de atenção"
        : awaiting.length
          ? "Aguardando liberação"
          : "Funcionando normalmente";

    return {
      area,
      tone,
      stateLabel,
      openItems: [...attention, ...awaiting]
        .slice(0, 4)
        .map((signal) => describeSignal(signal).title),
      attentionCount: attention.length,
      awaitingCount: awaiting.length,
      unreadable: cannotRead,
    };
  });
}

export function YziImobSystemWorkspace({
  data,
  accessState,
}: {
  data: RadarWorkspaceData | null;
  accessState: AccessState;
}) {
  const header = (
    <SurfaceHeader
      kicker="Sistema"
      title="Funcionamento da operação"
      lead="Se algo da sua operação parar de funcionar, aparece aqui — em português, com o impacto e o que fazer."
      secondaryActions={[
        { label: "Ver o que fazer agora", href: "/cockpit/yzi-imob/radar" },
        { label: "Ver canais", href: "/cockpit/yzi-imob/conexoes" },
      ]}
    />
  );

  if (accessState !== "ready" || !data) {
    return (
      <SurfaceCanvas>
        {header}
        <AccessNotice accessState={accessState === "ready" ? "read_error" : accessState} />
      </SurfaceCanvas>
    );
  }

  const areas = buildAreaStates(data);
  const needingAttention = areas.filter((area) => area.tone === "attention");
  const awaitingRelease = areas.filter((area) => area.tone === "pending");
  const unreadable = areas.filter((area) => area.unreadable);

  const totalAttention = areas.reduce((sum, area) => sum + area.attentionCount, 0);
  const totalAwaiting = areas.reduce((sum, area) => sum + area.awaitingCount, 0);

  const generalTone: SurfaceTone = needingAttention.length
    ? "attention"
    : awaitingRelease.length
      ? "pending"
      : "ok";

  const generalLabel = needingAttention.length
    ? "Precisa de atenção"
    : awaitingRelease.length
      ? "Aguardando liberação"
      : "Normal";

  const health = data.operationalHealth;
  const healthAvailable = health.availability === "available";

  const metrics: SurfaceMetric[] = [
    {
      label: "Estado geral",
      value: generalLabel,
      detail: needingAttention.length
        ? `${needingAttention.length} ${needingAttention.length === 1 ? "área precisa" : "áreas precisam"} de revisão`
        : awaitingRelease.length
          ? `${awaitingRelease.length} ${awaitingRelease.length === 1 ? "área aguarda" : "áreas aguardam"} liberação`
          : "Todas as áreas dentro do combinado",
      tone: generalTone,
    },
    {
      label: "Itens com atenção",
      value: String(totalAttention),
      detail: totalAttention ? "Precisam de alguém olhando" : "Nenhum item pendente",
      tone: totalAttention ? "attention" : "ok",
    },
    {
      label: "Aguardando liberação",
      value: String(totalAwaiting),
      detail: "Capacidades que ainda não foram liberadas",
      tone: totalAwaiting ? "pending" : undefined,
    },
    {
      label: "Recuperações automáticas",
      value: healthAvailable ? String(health.recoveriesExecuted ?? 0) : "—",
      detail: healthAvailable
        ? "Falhas que o sistema resolveu sozinho"
        : "Verificação detalhada indisponível",
      tone: healthAvailable ? "ok" : undefined,
    },
  ];

  return (
    <SurfaceCanvas>
      {header}

      <MetricBand metrics={metrics} />

      {needingAttention.length ? (
        <YziInsight
          context="Funcionamento da operação"
          tone="attention"
          stateLabel="Precisa de atenção"
          headline={
            needingAttention.length === 1
              ? `A área “${AREA_COPY[needingAttention[0].area].label}” tem item aberto precisando de alguém.`
              : `${needingAttention.length} áreas têm itens abertos precisando de alguém.`
          }
          reading={
            unreadable.length
              ? "Parte da verificação não respondeu, então esta leitura pode estar incompleta. Sua operação continua rodando — o que falha é a leitura."
              : "A operação segue rodando, mas esses itens não avançam sozinhos."
          }
          evidence={needingAttention.flatMap((area) =>
            area.openItems.map((item) => `${AREA_COPY[area.area].label}: ${item}`),
          )}
          recommendation="Cada item aparece no Radar com o destino da ação. Comece pelos que têm prazo vencido."
          primaryAction={{ label: "Abrir o Radar", href: "/cockpit/yzi-imob/radar" }}
        />
      ) : awaitingRelease.length ? (
        <YziInsight
          context="Funcionamento da operação"
          tone="pending"
          stateLabel="Aguardando liberação"
          headline={
            awaitingRelease.length === 1
              ? `A área “${AREA_COPY[awaitingRelease[0].area].label}” depende de uma liberação para funcionar por completo.`
              : `${awaitingRelease.length} áreas dependem de liberação para funcionar por completo.`
          }
          reading="Nada quebrou: essas capacidades ainda não foram liberadas. O resto da operação segue normal e o que depende delas fica em espera."
          evidence={awaitingRelease.flatMap((area) =>
            area.openItems.map((item) => `${AREA_COPY[area.area].label}: ${item}`),
          )}
          recommendation="Acompanhe o andamento em Conexões. Algumas liberações dependem de verificação externa e levam alguns dias."
          primaryAction={{ label: "Ver conexões", href: "/cockpit/yzi-imob/conexoes" }}
        />
      ) : (
        <YziInsight
          context="Funcionamento da operação"
          tone="ok"
          stateLabel="Funcionando normalmente"
          headline="Nenhuma área da operação tem item aberto."
          reading="Imóveis, leads, atendimento, canais e rotinas automáticas responderam e estão dentro do combinado."
        />
      )}

      <SurfaceSection
        first
        title="Áreas da operação"
        description="Cada área é uma parte do produto. O estado vem dos mesmos itens que aparecem no Radar."
      >
        <SurfaceList>
          {areas.map((area) => {
            const copy = AREA_COPY[area.area];
            return (
              <SurfaceRow
                key={area.area}
                title={copy.label}
                description={
                  area.unreadable
                    ? "A verificação desta área não respondeu nesta consulta."
                    : copy.description
                }
                tone={area.tone}
                stateLabel={area.stateLabel}
                meta={
                  <span className="flex flex-wrap gap-x-4 gap-y-1">
                    <span>Afeta: {copy.affected}</span>
                    {area.openItems.length ? (
                      <span>Em aberto: {area.openItems.join(" · ")}</span>
                    ) : null}
                  </span>
                }
                actions={
                  area.tone === "ok" ? undefined : (
                    <SurfaceButton
                      action={{
                        label: area.tone === "pending" ? "Ver conexões" : "Abrir",
                        href:
                          area.tone === "pending"
                            ? "/cockpit/yzi-imob/conexoes"
                            : copy.href,
                      }}
                    />
                  )
                }
              />
            );
          })}
        </SurfaceList>
      </SurfaceSection>

      <SurfaceSection
        title="Última verificação"
        description="A operação é verificada continuamente; este é o registro mais recente."
      >
        <div className="flex flex-wrap items-center gap-3">
          <StateTag tone={generalTone} label={generalLabel} />
          <span className={cx(TYPE.meta)}>
            {formatLastCheck(health.latestRunnerExecutionAt)}
          </span>
        </div>
        {data.availability === "partial_data" ? (
          <SurfaceState
            compact
            tone="pending"
            title="Esta leitura está parcial"
            body="Uma parte da operação não respondeu nesta consulta, então algumas áreas podem estar sem leitura. Nenhum estado exibido foi presumido."
          />
        ) : null}
      </SurfaceSection>
    </SurfaceCanvas>
  );
}
