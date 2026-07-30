import {
  MetricBand,
  StateTag,
  SurfaceButton,
  SurfaceCanvas,
  SurfaceHeader,
  SurfaceSection,
  SurfaceState,
  TYPE,
  cx,
  toneColor,
  type SurfaceMetric,
  type SurfaceTone,
} from "@/components/yzi-imob/yzi-imob-surface-kit";
import {
  YziEmptyState,
  YziReading,
  YziWorkspacePanel,
} from "@/components/yzi-imob/yzi-imob-yzi-kit";
import {
  buildGrowthPanorama,
  buildGrowthReadings,
  type GrowthReadingTone,
} from "@/lib/yzi-imob/growth/readings";
import type { RadarSignal } from "@/lib/yzi-imob/radar/types";
import type { ResultsWorkspaceData } from "@/lib/yzi-imob/results/types";

// Growth OS — estratégia, oportunidade e decisão.
//
// Antes desta passagem, "Growth OS" e "Marketing" apontavam para EXATAMENTE a
// mesma rota: dois itens de menu, uma tela só. A separação agora é de
// responsabilidade, não de estética:
//   Marketing  → o que está sendo produzido, aprovado, programado e publicado.
//   Growth OS  → onde existe oportunidade, o que está travando, o que priorizar.
//
// Nada aqui é inventado: cada leitura nasce de Resultados ou do Radar. Onde o
// produto ainda não tem contrato real (experimentos, campanhas pagas), a tela
// diz isso com todas as letras em vez de exibir um bloco decorativo.

type AccessState =
  | "ready"
  | "no_membership"
  | "permission_denied"
  | "tenant_error"
  | "read_error";

const READING_TONE: Record<GrowthReadingTone, SurfaceTone> = {
  opportunity: "ok",
  risk: "attention",
  steady: "info",
};

const READING_LABEL: Record<GrowthReadingTone, string> = {
  opportunity: "Oportunidade",
  risk: "Atenção",
  steady: "Estável",
};

const ACCESS_COPY: Record<
  Exclude<AccessState, "ready">,
  { tone: SurfaceTone; title: string; body: string }
> = {
  no_membership: {
    tone: "idle",
    title: "Sua conta ainda não está ligada a uma operação",
    body: "Conclua a implantação inicial para que o Growth OS passe a ler o desempenho da sua imobiliária.",
  },
  permission_denied: {
    tone: "pending",
    title: "Seu acesso não inclui esta leitura",
    body: "Peça a quem administra a operação para liberar as decisões de crescimento para o seu perfil.",
  },
  tenant_error: {
    tone: "attention",
    title: "Não conseguimos identificar sua operação agora",
    body: "Recarregue a página. Nenhuma leitura foi calculada e nada foi alterado.",
  },
  read_error: {
    tone: "attention",
    title: "Não foi possível ler o desempenho agora",
    body: "A consulta falhou. Preferimos não recomendar nada a recomendar com base em número incompleto.",
  },
};

function formatPercent(value: number | null): string {
  return value === null
    ? "—"
    : `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value)}%`;
}

export function YziImobGrowthOsWorkspace({
  data,
  signals,
  accessState,
}: {
  data: ResultsWorkspaceData | null;
  signals: readonly RadarSignal[];
  accessState: AccessState;
}) {
  const header = (
    <SurfaceHeader
      kicker="Marketing"
      title="Growth OS"
      lead="Onde investir atenção agora: o que está funcionando, o que está travando e qual decisão dá mais resultado."
      secondaryActions={[
        { label: "Ver resultados", href: "/cockpit/yzi-imob/growth/resultados" },
        { label: "Ir para Marketing", href: "/cockpit/yzi-imob/marketing/publicacoes" },
      ]}
    />
  );

  if (accessState !== "ready" || !data) {
    const copy = ACCESS_COPY[accessState === "ready" ? "read_error" : accessState];
    return (
      <SurfaceCanvas>
        {header}
        <SurfaceState tone={copy.tone} title={copy.title} body={copy.body} />
      </SurfaceCanvas>
    );
  }

  const panorama = buildGrowthPanorama(data);
  const readings = buildGrowthReadings(data, signals);
  const opportunities = readings.filter((reading) => reading.tone === "opportunity");
  const risks = readings.filter((reading) => reading.tone === "risk");

  const metrics: SurfaceMetric[] = [
    {
      label: "Direção",
      value:
        panorama.direction === "sem-histórico"
          ? "—"
          : panorama.direction.charAt(0).toUpperCase() + panorama.direction.slice(1),
      detail:
        panorama.directionDelta !== null
          ? `${panorama.directionDelta > 0 ? "+" : ""}${formatPercent(panorama.directionDelta)} de leads na 2ª metade`
          : "Histórico ainda curto para comparar",
      tone:
        panorama.direction === "subindo"
          ? "ok"
          : panorama.direction === "caindo"
            ? "attention"
            : undefined,
    },
    {
      label: "Degrau mais fraco",
      value: panorama.weakestStep ? formatPercent(panorama.weakestStep.value) : "—",
      detail: panorama.weakestStep?.label ?? "Sem etapas medidas no período",
      tone: panorama.weakestStep ? "attention" : undefined,
    },
    {
      label: "Canal principal",
      value: panorama.topChannel ? formatPercent(panorama.topChannel.percentage) : "—",
      detail: panorama.topChannel?.label ?? "Nenhum canal com origem registrada",
    },
    {
      label: "Decisões abertas",
      value: String(readings.length),
      detail: `${opportunities.length} oportunidade(s) · ${risks.length} risco(s)`,
      tone: readings.length ? "info" : undefined,
    },
  ];

  return (
    <SurfaceCanvas>
      {header}

      <MetricBand metrics={metrics} />

      {readings.length === 0 ? (
        <YziEmptyState
          context={data.period.label}
          title="Ainda não há sinal suficiente para recomendar uma mudança."
          body="Sua operação registrou pouco movimento neste período. Assim que houver leads, publicações e visitas com histórico, este espaço passa a apontar onde investir primeiro."
          action={{
            label: "Ver o que já foi publicado",
            href: "/cockpit/yzi-imob/marketing/publicacoes",
          }}
        />
      ) : (
        <YziWorkspacePanel
          context={data.period.label}
          tone={risks.length ? "attention" : "ok"}
          stateLabel={risks.length ? `${risks.length} ponto(s) de atenção` : "Sem riscos abertos"}
          headline={
            risks.length
              ? "A operação tem volume, mas está perdendo gente no meio do caminho."
              : "A operação está fluindo — o espaço agora é para ampliar o que já funciona."
          }
          reading="Leitura construída sobre o que sua operação registrou no período. Cada achado abaixo aponta a evidência que o sustenta e a tela onde a decisão vira ação."
          primaryAction={
            readings[0]
              ? { label: readings[0].actionLabel, href: readings[0].actionHref }
              : undefined
          }
          analysisHref="/cockpit/yzi-imob/growth/resultados"
          analysisLabel="Ver números completos"
        >
          <div className="flex flex-col gap-4">
            {readings.slice(0, 3).map((reading) => (
              <YziReading
                key={reading.id}
                question={reading.question}
                finding={reading.finding}
                evidence={reading.evidence}
                implication={reading.implication}
                tone={READING_TONE[reading.tone]}
              />
            ))}
          </div>
        </YziWorkspacePanel>
      )}

      {opportunities.length ? (
        <SurfaceSection
          first
          title="Oportunidades"
          description="Onde ampliar dá mais retorno do que corrigir."
          count={String(opportunities.length)}
        >
          <div className="flex flex-col gap-3">
            {opportunities.map((reading) => (
              <DecisionCard key={reading.id} reading={reading} />
            ))}
          </div>
        </SurfaceSection>
      ) : null}

      {risks.length ? (
        <SurfaceSection
          first={opportunities.length === 0}
          title="O que está travando"
          description="Pontos em que a operação perde gente que já entrou."
          count={String(risks.length)}
        >
          <div className="flex flex-col gap-3">
            {risks.map((reading) => (
              <DecisionCard key={reading.id} reading={reading} />
            ))}
          </div>
        </SurfaceSection>
      ) : null}

      <SurfaceSection
        title="Experimentos"
        description="Testes comparados lado a lado, com hipótese e resultado."
      >
        <SurfaceState
          tone="idle"
          title="Sua operação ainda não registra experimentos"
          body="Para comparar dois caminhos com honestidade, o produto precisa registrar hipótese, recorte e resultado de cada teste. Enquanto isso não existe, preferimos não mostrar uma comparação que não seria verdadeira."
        />
      </SurfaceSection>

      <SurfaceSection
        title="Campanhas"
        description="Investimento pago e retorno por campanha."
      >
        <SurfaceState
          tone="pending"
          title="Campanhas pagas ainda não estão medidas aqui"
          body="Quando a medição de anúncios estiver ativa em Conexões, o investimento e o retorno de cada campanha aparecem nesta seção. Até lá, o que existe é a distribuição orgânica em Marketing."
          action={{ label: "Ver conexões", href: "/cockpit/yzi-imob/conexoes" }}
          secondaryAction={{
            label: "Ir para Marketing",
            href: "/cockpit/yzi-imob/marketing/publicacoes",
          }}
        />
      </SurfaceSection>

      {data.availability !== "available" ? (
        <SurfaceState
          compact
          tone="pending"
          title="Esta leitura está parcial"
          body="Parte do período não pôde ser lida, então algumas recomendações podem mudar quando a leitura completar. Nada foi estimado."
        />
      ) : null}
    </SurfaceCanvas>
  );
}

function DecisionCard({
  reading,
}: {
  reading: ReturnType<typeof buildGrowthReadings>[number];
}) {
  const tone = READING_TONE[reading.tone];

  return (
    <article
      className="flex flex-col gap-3 rounded-[var(--yzi-radius-md)] border bg-[var(--yzi-surface-base)] px-5 py-4 shadow-[var(--yzi-edge-highlight)]"
      style={{ borderColor: toneColor(tone, 0.24) }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className={TYPE.label}>{reading.question}</p>
        <StateTag tone={tone} label={READING_LABEL[reading.tone]} />
      </div>

      <p className="text-balance text-[0.95rem] font-medium leading-snug text-[var(--yzi-text-primary)]">
        {reading.finding}
      </p>

      <p className={cx(TYPE.body, "max-w-2xl")}>{reading.implication}</p>

      {reading.evidence.length ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {reading.evidence.map((item) => (
            <li key={item} className={TYPE.meta}>
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-3.5">
        <SurfaceButton action={{ label: reading.actionLabel, href: reading.actionHref }} />
      </div>
    </article>
  );
}
