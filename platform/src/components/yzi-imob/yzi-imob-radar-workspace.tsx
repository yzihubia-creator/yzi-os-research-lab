"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ComponentType, SVGProps } from "react";

import {
  ArrowRightIcon,
  FlameIcon,
  PropertyIcon,
  SearchIcon,
  StackIcon,
  TargetIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "@/components/yzi-imob/yzi-imob-icons-v2";
import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";
import { WorkspaceSection } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import type { RadarSignal, RadarSignalKind, RadarSourceIssue } from "@/lib/yzi-imob/radar/types";

type AccessState = "ready" | "no_membership" | "tenant_error" | "read_error";
type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

const SIGNAL_META: Record<RadarSignalKind, { label: string; role: YziImobRole; icon: Glyph }> = {
  property_incomplete: { label: "Cadastro incompleto", role: "amber", icon: PropertyIcon },
  property_without_interest: { label: "Sem interesse", role: "graphite", icon: StackIcon },
  lead_without_recent_interaction: { label: "Lead parado", role: "wine", icon: TrendDownIcon },
  hot_lead_without_progress: { label: "Lead quente", role: "amber", icon: FlameIcon },
  conversation_stalled: { label: "Atendimento parado", role: "wine", icon: TrendDownIcon },
  appointment_pending: { label: "Agenda pendente", role: "cyan", icon: TargetIcon },
  inbound_failure: { label: "Falha inbound", role: "wine", icon: TrendDownIcon },
  high_score_interest: { label: "Score alto", role: "coldGreen", icon: TrendUpIcon },
  social_publish_failed: { label: "Publicação falhou", role: "wine", icon: TrendDownIcon },
  social_publish_stalled: { label: "Publicação parada", role: "amber", icon: TrendDownIcon },
  metricool_connection_attention: { label: "Metricool com atenção", role: "wine", icon: StackIcon },
  approved_content_unscheduled: { label: "Aprovado sem agenda", role: "amber", icon: TargetIcon },
  social_metrics_missing: { label: "Métricas ausentes", role: "graphite", icon: SearchIcon },
  social_sync_delayed: { label: "Sincronização atrasada", role: "amber", icon: TrendDownIcon },
};

const SIGNAL_ORDER: Record<RadarSignalKind, number> = {
  social_publish_failed: 0,
  metricool_connection_attention: 1,
  social_publish_stalled: 2,
  social_sync_delayed: 3,
  social_metrics_missing: 4,
  approved_content_unscheduled: 5,
  inbound_failure: 6,
  appointment_pending: 7,
  conversation_stalled: 8,
  hot_lead_without_progress: 9,
  lead_without_recent_interaction: 10,
  high_score_interest: 11,
  property_incomplete: 12,
  property_without_interest: 13,
};

function formatLastSeen(iso: string | null): string {
  if (!iso) return "Ainda sem dados";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function AccessMessage({ accessState }: { accessState: AccessState }) {
  const messages: Record<AccessState, { title: string; body: string }> = {
    ready: {
      title: "Nenhum sinal real no Radar",
      body: "As fontes reais foram consultadas e nenhuma regra deterministica gerou sinal neste tenant.",
    },
    no_membership: {
      title: "Sua operacao ainda nao esta disponivel",
      body: "Nao encontramos uma imobiliaria vinculada a sua conta.",
    },
    tenant_error: {
      title: "Nao foi possivel resolver o tenant",
      body: "Tente novamente em instantes. Se o problema continuar, fale com o administrador.",
    },
    read_error: {
      title: "Nao foi possivel carregar o Radar",
      body: "A consulta real falhou. Nenhum sinal ficticio foi exibido.",
    },
  };
  const message = messages[accessState];

  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-5">
      <p className="text-[0.92rem] font-semibold text-[var(--yzi-text-primary)]">{message.title}</p>
      <p className="mt-1 text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {message.body}
      </p>
    </div>
  );
}

function FilterEmptyMessage() {
  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-5">
      <p className="text-[0.92rem] font-semibold text-[var(--yzi-text-primary)]">
        Nenhum sinal encontrado
      </p>
      <p className="mt-1 text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        Ajuste o filtro para ver outros sinais reais carregados neste tenant.
      </p>
    </div>
  );
}

function SignalCard({ signal }: { signal: RadarSignal }) {
  const meta = SIGNAL_META[signal.kind];
  const Glyph = meta.icon;

  return (
    <article className="flex gap-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-4 shadow-[var(--yzi-edge-highlight)]">
      <span
        aria-hidden
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--yzi-radius-md)] border"
        style={{
          borderColor: imobRgba(meta.role, 0.3),
          backgroundColor: imobRgba(meta.role, 0.1),
          color: imobRgba(meta.role, 0.95),
        }}
      >
        <Glyph className="h-[18px] w-[18px]" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.66rem]">
          <span className="font-medium" style={{ color: imobRgba(meta.role, 0.95) }}>
            {meta.label}
          </span>
          <span aria-hidden className="text-[var(--yzi-text-faint)]">
            -
          </span>
          <span className="text-[var(--yzi-text-secondary)]">{signal.areaLabel}</span>
          <span className="ml-auto rounded-full border border-[color:var(--yzi-border-subtle)] px-2 py-0.5 text-[0.62rem] tabular-nums text-[var(--yzi-text-secondary)]">
            {signal.count}
          </span>
        </div>

        <p className="text-[0.9rem] font-medium leading-snug text-[var(--yzi-text-primary)]">
          {signal.whatLabel}
        </p>

        <p className="flex items-start gap-1.5 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          <ArrowRightIcon
            aria-hidden
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            style={{ color: imobRgba("cyan", 0.85) }}
          />
          {signal.evidenceLabel}
        </p>
      </div>
    </article>
  );
}

function SignalRuleRow({ signal }: { signal: RadarSignal }) {
  const meta = SIGNAL_META[signal.kind];
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: imobRgba(meta.role, 0.9) }}
      />
      <p className="text-[0.8rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        <span className="font-medium text-[var(--yzi-text-primary)]">{signal.areaLabel}.</span>{" "}
        {signal.whyLabel}{" "}
        <span className="text-[var(--yzi-text-faint)]">Regra: {signal.ruleLabel}</span>
      </p>
    </div>
  );
}

function SourceRow({ signal }: { signal: RadarSignal }) {
  const meta = SIGNAL_META[signal.kind];
  const content = (
    <>
      <ArrowRightIcon
        aria-hidden
        className="mt-0.5 h-3.5 w-3.5 shrink-0"
        style={{ color: imobRgba(meta.role, 0.85) }}
      />
      <span className="min-w-0">
        <span className="text-[var(--yzi-text-primary)]">{signal.sourceLabel}</span>
        <span className="text-[var(--yzi-text-faint)]">
          {" "}
          - ultima evidencia: {formatLastSeen(signal.lastSeenAt)}
        </span>
      </span>
    </>
  );

  if (!signal.href) {
    return <div className="flex items-start gap-3 text-[0.8rem] leading-relaxed">{content}</div>;
  }

  return (
    <Link
      href={signal.href}
      className="flex items-start gap-3 text-[0.8rem] leading-relaxed transition-colors hover:text-[var(--yzi-text-primary)]"
    >
      {content}
    </Link>
  );
}

function SourceIssues({ issues }: { issues: readonly RadarSourceIssue[] }) {
  if (issues.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3">
      {issues.map((issue) => (
        <p key={issue.sourceLabel} className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-faint)]">
          {issue.sourceLabel}: {issue.detail}
        </p>
      ))}
    </div>
  );
}

export function YziImobRadarWorkspace({
  signals,
  sourceIssues,
  accessState,
}: {
  signals: readonly RadarSignal[];
  sourceIssues: readonly RadarSourceIssue[];
  accessState: AccessState;
}) {
  const [theme, setTheme] = useState("");

  const orderedSignals = useMemo(
    () =>
      [...signals].sort((a, b) => {
        const byKind = SIGNAL_ORDER[a.kind] - SIGNAL_ORDER[b.kind];
        if (byKind !== 0) return byKind;
        return b.count - a.count;
      }),
    [signals],
  );

  const filteredSignals = useMemo(() => {
    const text = theme.trim().toLowerCase();
    if (!text) return orderedSignals;
    return orderedSignals.filter((signal) =>
      [
        signal.areaLabel,
        signal.whatLabel,
        signal.whyLabel,
        signal.ruleLabel,
        signal.sourceLabel,
        signal.evidenceLabel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(text),
    );
  }, [orderedSignals, theme]);

  const hasSignals = accessState === "ready" && filteredSignals.length > 0;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-8 py-10">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.01em] text-[var(--yzi-text-primary)]">
          Radar
        </h1>
        <p className="text-[0.82rem] text-[var(--yzi-text-secondary)]">
          Sinais operacionais reais, com fonte e regra deterministica.
        </p>
      </header>

      <div className="flex flex-col gap-7">
        <WorkspaceSection
          first
          title="Sinais reais"
          description="Leitura tenant-scoped das fontes operacionais disponiveis."
        >
          {hasSignals ? (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {filteredSignals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          ) : accessState === "ready" && orderedSignals.length > 0 ? (
            <FilterEmptyMessage />
          ) : (
            <AccessMessage accessState={accessState} />
          )}
        </WorkspaceSection>

        {hasSignals ? (
          <WorkspaceSection
            title="Fonte e regra"
            description="Cada sinal abaixo vem de consulta real e regra deterministica."
          >
            <div className="flex flex-col gap-2.5">
              {filteredSignals.map((signal) => (
                <SignalRuleRow key={signal.id} signal={signal} />
              ))}
            </div>
          </WorkspaceSection>
        ) : null}

        {hasSignals ? (
          <WorkspaceSection
            title="Dados relacionados"
            description="Abertura da fonte operacional relacionada ao sinal."
          >
            <div className="flex flex-col gap-2.5">
              {filteredSignals.map((signal) => (
                <SourceRow key={signal.id} signal={signal} />
              ))}
            </div>
          </WorkspaceSection>
        ) : null}

        <div className="border-t border-[color:var(--yzi-border-subtle)] pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-3.5 py-2.5">
              <SearchIcon aria-hidden className="h-4 w-4 shrink-0 text-[var(--yzi-text-faint)]" />
              <label htmlFor="radar-theme" className="sr-only">
                Filtrar sinais reais
              </label>
              <input
                id="radar-theme"
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
                placeholder="Filtrar sinais reais"
                className="min-w-0 flex-1 bg-transparent text-[0.8rem] text-[var(--yzi-text-primary)] outline-none placeholder:text-[var(--yzi-text-faint)]"
              />
            </div>
            <button
              type="button"
              disabled
              title="Sem LLM nesta unidade"
              className="h-10 w-fit cursor-not-allowed rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3.5 text-[0.76rem] text-[var(--yzi-text-faint)] opacity-60"
            >
              Investigar
            </button>
          </div>
          <p className="mt-2 text-[0.7rem] text-[var(--yzi-text-faint)]">
            Busca local sobre os sinais carregados. Nenhum LLM ou automacao foi acionado.
          </p>
        </div>

        <SourceIssues issues={sourceIssues} />
      </div>

      <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Dados reais do tenant. Campanhas foram omitidas porque nao ha fonte real conectada para
        esta unidade.
      </p>
    </section>
  );
}
