"use client";

import { useMemo, useState } from "react";

import { SearchIcon } from "@/components/yzi-imob/yzi-imob-icons-v2";
import {
  MetricBand,
  StateTag,
  SurfaceButton,
  SurfaceCanvas,
  SurfaceHeader,
  SurfaceSection,
  SurfaceState,
  SurfaceToolbar,
  TYPE,
  cx,
  toneColor,
  type SurfaceMetric,
  type SurfaceTone,
} from "@/components/yzi-imob/yzi-imob-surface-kit";
import { YziInsight } from "@/components/yzi-imob/yzi-imob-yzi-kit";
import type {
  RadarSignal,
  RadarSignalCategory,
  RadarSignalSeverity,
  RadarWorkspaceData,
} from "@/lib/yzi-imob/radar/types";

// Radar — sinais que merecem atenção AGORA. Não é relatório, não é histórico,
// não é dashboard. Cada sinal responde: o que aconteceu → por que importa →
// evidência → urgência → onde agir.
//
// A saúde operacional e a disponibilidade das fontes saíram desta tela: elas
// descrevem o funcionamento do sistema, não um sinal acionável, e vivem em
// Sistema. Nada do contrato de dados mudou — só a leitura.
//
// Regra dura desta superfície: `signal.source`, `signal.type`, `signal.status`
// e `signal.entityId` são identificadores internos e NUNCA chegam à tela.

type AccessState =
  | "ready"
  | "no_membership"
  | "permission_denied"
  | "tenant_error"
  | "read_error";

type Filters = {
  category: RadarSignalCategory | null;
  severity: RadarSignalSeverity | null;
};

const SEVERITY_META: Record<
  RadarSignalSeverity,
  { label: string; tone: SurfaceTone; order: number }
> = {
  critical: { label: "Crítico", tone: "blocked", order: 0 },
  important: { label: "Importante", tone: "attention", order: 1 },
  attention: { label: "Acompanhar", tone: "pending", order: 2 },
  info: { label: "Informativo", tone: "idle", order: 3 },
};

const CATEGORY_LABEL: Record<RadarSignalCategory, string> = {
  ativo: "Imóvel",
  lead: "Lead",
  visita: "Visita",
  atendimento: "Atendimento",
  conexao: "Conexão",
  sistema: "Operação",
};

// Tradução humana da entidade relacionada. Nunca o nome interno do domínio.
const ENTITY_LABEL: Record<RadarSignal["entityType"], string> = {
  property: "Imóvel",
  lead: "Lead",
  assignment: "Encaminhamento",
  follow_up: "Follow-up",
  conversation: "Conversa",
  appointment: "Visita",
  publication: "Publicação",
  connection: "Conexão",
  job: "Rotina automática",
  operation: "Operação",
  system: "Operação",
};

/** Faixas de prioridade — a hierarquia da tela, não uma lista plana. */
const BANDS = [
  {
    id: "agora",
    title: "Resolver agora",
    description: "Sinais que travam receita ou atendimento se ficarem parados hoje.",
    severities: ["critical", "important"] as RadarSignalSeverity[],
  },
  {
    id: "semana",
    title: "Acompanhar esta semana",
    description: "Ainda não é urgente, mas piora se ninguém olhar.",
    severities: ["attention"] as RadarSignalSeverity[],
  },
  {
    id: "contexto",
    title: "Só para saber",
    description: "Mudanças registradas que não exigem ação agora.",
    severities: ["info"] as RadarSignalSeverity[],
  },
];

// `now` chega como parâmetro, resolvido uma única vez no servidor, para que a
// marcação renderizada lá e a hidratada aqui digam exatamente a mesma coisa.
function formatDeadline(value: string | null, now: number): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const formatted = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  const diffMs = date.getTime() - now;
  const diffDays = Math.round(diffMs / 86_400_000);

  if (diffMs < 0) {
    const late = Math.abs(diffDays);
    return late === 0
      ? `Venceu hoje · ${formatted}`
      : `Atrasado há ${late} ${late === 1 ? "dia" : "dias"} · ${formatted}`;
  }
  if (diffDays === 0) return `Vence hoje · ${formatted}`;
  if (diffDays === 1) return `Vence amanhã · ${formatted}`;
  return `Vence em ${diffDays} dias · ${formatted}`;
}

function formatDetected(value: string, now: number): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const diffDays = Math.floor((now - date.getTime()) / 86_400_000);
  if (diffDays <= 0) return "Detectado hoje";
  if (diffDays === 1) return "Detectado ontem";
  return `Detectado há ${diffDays} dias`;
}

function SignalCard({ signal, now }: { signal: RadarSignal; now: number }) {
  const [expanded, setExpanded] = useState(false);
  const meta = SEVERITY_META[signal.severity];
  const deadline = formatDeadline(signal.dueAt, now);
  const detected = formatDetected(signal.detectedAt, now);
  const detailId = `radar-signal-detail-${signal.id}`;

  return (
    <article className="flex flex-col gap-3 border-b border-[color:var(--yzi-border-subtle)] py-5 last:border-b-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <StateTag tone={meta.tone} label={meta.label} />
            <span className={TYPE.label}>{CATEGORY_LABEL[signal.category]}</span>
          </div>
          <h3 className="text-balance text-[0.95rem] font-medium leading-snug text-[var(--yzi-text-primary)]">
            {signal.title}
          </h3>
          <p className={cx(TYPE.body, "max-w-2xl")}>{signal.description}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls={detailId}
            className="inline-flex items-center rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-[0.72rem] text-[var(--yzi-text-secondary)] transition-colors hover:border-[color:var(--yzi-border-strong)] hover:text-[var(--yzi-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)]"
          >
            {expanded ? "Ocultar detalhe" : "Por que importa"}
          </button>
          {signal.actionHref ? (
            <SurfaceButton
              kind="primary"
              action={{ label: signal.actionLabel, href: signal.actionHref }}
            />
          ) : (
            <SurfaceButton
              action={{
                label: signal.actionLabel,
                disabled: true,
                unavailableReason: "Este sinal ainda não tem uma tela de destino",
              }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className={TYPE.meta}>{ENTITY_LABEL[signal.entityType]}</span>
        {detected ? <span className={TYPE.meta}>{detected}</span> : null}
        {deadline ? (
          <span
            className="text-[0.68rem] font-medium"
            style={{ color: toneColor(meta.tone, 0.92) }}
          >
            {deadline}
          </span>
        ) : null}
      </div>

      {expanded ? (
        <dl
          id={detailId}
          className="grid gap-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-4 sm:grid-cols-3"
        >
          <div className="flex flex-col gap-1.5">
            <dt className={TYPE.label}>O que aconteceu</dt>
            <dd className={TYPE.body}>{signal.title}</dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <dt className={TYPE.label}>Por que importa</dt>
            <dd className={TYPE.body}>{signal.description}</dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <dt className={TYPE.label}>Onde resolver</dt>
            <dd className={TYPE.body}>
              {signal.actionHref
                ? `${ENTITY_LABEL[signal.entityType]} · ${signal.actionLabel}`
                : "Ainda não há uma tela direta para esta ação."}
            </dd>
          </div>
        </dl>
      ) : null}
    </article>
  );
}

function AccessState({ accessState }: { accessState: Exclude<AccessState, "ready"> }) {
  const copy: Record<
    Exclude<AccessState, "ready">,
    { tone: SurfaceTone; title: string; body: string }
  > = {
    no_membership: {
      tone: "idle",
      title: "Sua conta ainda não está ligada a uma operação",
      body: "Conclua a implantação inicial para que o Radar passe a acompanhar seus imóveis, leads e visitas.",
    },
    permission_denied: {
      tone: "pending",
      title: "Seu acesso não inclui esta leitura",
      body: "Peça a quem administra a operação para liberar o acompanhamento de sinais para o seu perfil.",
    },
    tenant_error: {
      tone: "attention",
      title: "Não conseguimos identificar sua operação agora",
      body: "Recarregue a página. Nenhum sinal foi calculado e nada foi alterado na sua operação.",
    },
    read_error: {
      tone: "attention",
      title: "O Radar não conseguiu ler a operação agora",
      body: "Uma das leituras necessárias falhou. Preferimos não mostrar nada a mostrar uma lista incompleta — recarregue em instantes.",
    },
  };

  const content = copy[accessState];
  return <SurfaceState tone={content.tone} title={content.title} body={content.body} />;
}

export function YziImobRadarWorkspace({
  data,
  filters,
  accessState,
  now,
}: {
  data: RadarWorkspaceData | null;
  filters: Filters;
  accessState: AccessState;
  /**
   * Momento da leitura, resolvido no servidor. Prazos do Radar são medidos em
   * dias, então o instante da requisição é preciso o bastante — e evita que a
   * marcação do servidor e a do navegador divirjam na hidratação.
   */
  now: number;
}) {
  const [query, setQuery] = useState("");

  const allSignals = useMemo(() => data?.signals ?? [], [data]);

  const visibleSignals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allSignals
      .filter((signal) => !filters.category || signal.category === filters.category)
      .filter((signal) => !filters.severity || signal.severity === filters.severity)
      .filter(
        (signal) =>
          !normalizedQuery ||
          `${signal.title} ${signal.description}`.toLowerCase().includes(normalizedQuery),
      )
      .sort(
        (a, b) =>
          SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order ||
          Date.parse(a.dueAt ?? a.detectedAt) - Date.parse(b.dueAt ?? b.detectedAt),
      );
  }, [allSignals, filters, query]);

  const countBySeverity = (severities: RadarSignalSeverity[]) =>
    allSignals.filter((signal) => severities.includes(signal.severity)).length;

  const urgentCount = countBySeverity(["critical", "important"]);
  const overdueCount = allSignals.filter(
    (signal) => signal.dueAt && Date.parse(signal.dueAt) < now,
  ).length;

  const metrics: SurfaceMetric[] = [
    {
      label: "Resolver agora",
      value: String(urgentCount),
      detail: "Crítico ou importante",
      tone: urgentCount ? "attention" : "ok",
    },
    {
      label: "Com prazo vencido",
      value: String(overdueCount),
      detail: "Passou da data combinada",
      tone: overdueCount ? "blocked" : "ok",
    },
    {
      label: "Acompanhar",
      value: String(countBySeverity(["attention"])),
      detail: "Piora se ninguém olhar",
    },
    {
      label: "Sinais abertos",
      value: String(allSignals.length),
      detail: "Total lido nesta sessão",
    },
  ];

  const topSignal = visibleSignals[0];
  const filtersApplied = Boolean(filters.category || filters.severity || query.trim());

  return (
    <SurfaceCanvas width="wide">
      <SurfaceHeader
        kicker="Inteligência"
        title="Radar"
        lead="Os sinais que merecem sua atenção agora — o que mudou, por que importa e onde resolver."
      />

      {accessState !== "ready" || !data ? (
        <AccessState accessState={accessState === "ready" ? "read_error" : accessState} />
      ) : (
        <>
          <MetricBand metrics={metrics} />

          {topSignal && urgentCount > 0 ? (
            <YziInsight
              context="Radar da operação"
              tone={SEVERITY_META[topSignal.severity].tone}
              stateLabel={SEVERITY_META[topSignal.severity].label}
              headline={
                urgentCount === 1
                  ? "1 sinal precisa de decisão hoje."
                  : `${urgentCount} sinais precisam de decisão hoje.`
              }
              reading={
                overdueCount > 0
                  ? `Desses, ${overdueCount} já passaram do prazo combinado. Quanto mais tempo parados, maior a chance de o lead esfriar ou de a visita não acontecer.`
                  : "Resolver agora evita que virem atraso."
              }
              evidence={[
                `Prioridade mais alta: ${topSignal.title}`,
                `Área afetada: ${CATEGORY_LABEL[topSignal.category]}`,
              ]}
              recommendation={`Comece por “${topSignal.title}”. É o sinal com maior urgência e já tem destino de ação definido.`}
              primaryAction={
                topSignal.actionHref
                  ? { label: topSignal.actionLabel, href: topSignal.actionHref }
                  : undefined
              }
            />
          ) : null}

          <SurfaceToolbar>
            <form method="get" className="flex flex-1 flex-wrap items-center gap-2.5">
              <label className="sr-only" htmlFor="radar-category">
                Filtrar por área
              </label>
              <select
                id="radar-category"
                name="category"
                defaultValue={filters.category ?? ""}
                className="yzi-field min-w-[10rem] flex-1"
              >
                <option value="">Todas as áreas</option>
                {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor="radar-severity">
                Filtrar por prioridade
              </label>
              <select
                id="radar-severity"
                name="severity"
                defaultValue={filters.severity ?? ""}
                className="yzi-field min-w-[10rem] flex-1"
              >
                <option value="">Todas as prioridades</option>
                {Object.entries(SEVERITY_META).map(([value, severityMeta]) => (
                  <option key={value} value={value}>
                    {severityMeta.label}
                  </option>
                ))}
              </select>

              <SurfaceButton action={{ label: "Aplicar" }} type="submit" />
            </form>

            {/* Divisória só quando os dois grupos cabem na mesma linha; ao
                quebrar em telas estreitas ela viraria um traço solto. */}
            <div className="flex min-w-[12rem] flex-1 items-center gap-2 sm:border-l sm:border-[color:var(--yzi-border-subtle)] sm:pl-3">
              <SearchIcon aria-hidden className="h-4 w-4 shrink-0 text-[var(--yzi-text-faint)]" />
              <label htmlFor="radar-search" className="sr-only">
                Buscar entre os sinais listados
              </label>
              <input
                id="radar-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar nos sinais"
                className="min-w-0 flex-1 bg-transparent text-[0.8rem] text-[var(--yzi-text-primary)] outline-none placeholder:text-[var(--yzi-text-faint)]"
              />
            </div>
          </SurfaceToolbar>

          {visibleSignals.length === 0 ? (
            <SurfaceState
              tone={filtersApplied ? "info" : "ok"}
              title={
                filtersApplied
                  ? "Nenhum sinal corresponde a esses filtros"
                  : "Nada exige sua atenção agora"
              }
              body={
                filtersApplied
                  ? "Ajuste a área, a prioridade ou a busca para ver os demais sinais abertos."
                  : "Imóveis, leads, visitas e atendimento foram verificados e nenhum deles está fora do combinado."
              }
            />
          ) : (
            BANDS.map((band, index) => {
              const bandSignals = visibleSignals.filter((signal) =>
                band.severities.includes(signal.severity),
              );
              if (!bandSignals.length) return null;

              return (
                <SurfaceSection
                  key={band.id}
                  first={index === 0}
                  title={band.title}
                  description={band.description}
                  count={`${bandSignals.length}`}
                >
                  <div className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 shadow-[var(--yzi-edge-highlight)]">
                    {bandSignals.map((signal) => (
                      <SignalCard key={signal.id} signal={signal} now={now} />
                    ))}
                  </div>
                </SurfaceSection>
              );
            })
          )}

          {data.availability === "partial_data" ? (
            <SurfaceState
              compact
              tone="pending"
              title="Esta leitura está parcial"
              body="Uma parte da operação não respondeu nesta consulta, então alguns sinais podem estar faltando. Nenhum sinal exibido foi inventado."
              action={{ label: "Ver estado do sistema", href: "/cockpit/yzi-imob/sistema" }}
            />
          ) : null}
        </>
      )}
    </SurfaceCanvas>
  );
}
