"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ArrowRightIcon, SearchIcon } from "@/components/yzi-imob/yzi-imob-icons-v2";
import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";
import { WorkspaceSection } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import type {
  RadarSignal,
  RadarSignalCategory,
  RadarSignalSeverity,
  RadarWorkspaceData,
} from "@/lib/yzi-imob/radar/types";

type AccessState = "ready" | "no_membership" | "permission_denied" | "tenant_error" | "read_error";
type Filters = { category: RadarSignalCategory | null; severity: RadarSignalSeverity | null };

const SEVERITY_META: Record<RadarSignalSeverity, { label: string; role: YziImobRole; order: number }> = {
  critical: { label: "Crítico", role: "wine", order: 0 },
  important: { label: "Importante", role: "amber", order: 1 },
  attention: { label: "Atenção", role: "cyan", order: 2 },
  info: { label: "Informativo", role: "graphite", order: 3 },
};

const CATEGORY_LABEL: Record<RadarSignalCategory, string> = {
  ativo: "Ativo",
  lead: "Lead",
  visita: "Visita",
  atendimento: "Atendimento",
  conexao: "Conexão",
  sistema: "Sistema",
};

function formatDate(value: string | null): string {
  if (!value) return "Sem prazo aplicável";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatePanel({ accessState }: { accessState: AccessState }) {
  const copy = {
    ready: ["Nenhum sinal ativo", "As fontes disponíveis foram consultadas e nenhuma regra determinística disparou."],
    no_membership: ["Operação indisponível", "Não encontramos uma imobiliária vinculada a sua conta."],
    permission_denied: ["Acesso não autorizado", "Seu papel atual não permite esta leitura."],
    tenant_error: ["Tenant não resolvido", "A consulta foi interrompida antes de acessar dados operacionais."],
    read_error: ["Radar indisponível", "Uma fonte obrigatória falhou. Nenhum sinal fictício foi exibido."],
  }[accessState];
  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-5 py-5">
      <p className="text-[0.92rem] font-semibold text-[var(--yzi-text-primary)]">{copy[0]}</p>
      <p className="mt-1 text-[0.78rem] text-[var(--yzi-text-secondary)]">{copy[1]}</p>
    </div>
  );
}

function SignalRow({ signal, onInspect }: { signal: RadarSignal; onInspect: (signal: RadarSignal) => void }) {
  const meta = SEVERITY_META[signal.severity];
  return (
    <article className="grid gap-4 border-b border-[color:var(--yzi-border-subtle)] py-4 last:border-0 md:grid-cols-[130px_minmax(0,1fr)_auto]">
      <div className="flex items-start gap-2">
        <span className="mt-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: imobRgba(meta.role, 0.95) }} />
        <div>
          <p className="text-[0.68rem] font-semibold" style={{ color: imobRgba(meta.role, 0.95) }}>{meta.label}</p>
          <p className="mt-1 text-[0.64rem] text-[var(--yzi-text-faint)]">{CATEGORY_LABEL[signal.category]}</p>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">{signal.title}</p>
        <p className="mt-1 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">{signal.description}</p>
        <p className="mt-2 text-[0.66rem] text-[var(--yzi-text-faint)]">
          Fonte: {signal.source} · Prazo: {formatDate(signal.dueAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onInspect(signal)}
          className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-[0.7rem] text-[var(--yzi-text-secondary)]"
        >
          Entender
        </button>
        {signal.actionHref ? (
          <Link href={signal.actionHref} className="inline-flex items-center gap-1.5 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-2 text-[0.7rem] font-semibold text-[var(--yzi-text-primary)]">
            {signal.actionLabel}<ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function Inspector({ signal }: { signal: RadarSignal | null }) {
  if (!signal) {
    return <p className="text-[0.76rem] text-[var(--yzi-text-secondary)]">Selecione “Entender” para ver a explicação determinística de um sinal.</p>;
  }
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div>
        <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">Motivo</p>
        <p className="mt-2 text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">{signal.description}</p>
      </div>
      <div>
        <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">Evidência</p>
        <p className="mt-2 text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">{signal.source}</p>
      </div>
      <div>
        <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">Contrato</p>
        <p className="mt-2 text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          {signal.type} · entidade {signal.entityType} · status {signal.status}
        </p>
      </div>
    </div>
  );
}

export function YziImobRadarWorkspace({
  data,
  filters,
  accessState,
}: {
  data: RadarWorkspaceData | null;
  filters: Filters;
  accessState: AccessState;
}) {
  const [query, setQuery] = useState("");
  const [inspected, setInspected] = useState<RadarSignal | null>(null);
  const visibleSignals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (data?.signals ?? [])
      .filter((signal) => !filters.category || signal.category === filters.category)
      .filter((signal) => !filters.severity || signal.severity === filters.severity)
      .filter((signal) => !normalizedQuery || [signal.title, signal.description, signal.source, signal.type].join(" ").toLowerCase().includes(normalizedQuery))
      .sort((a, b) => SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order || Date.parse(a.dueAt ?? a.detectedAt) - Date.parse(b.dueAt ?? b.detectedAt));
  }, [data, filters, query]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-8 py-10">
      <header>
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.01em] text-[var(--yzi-text-primary)]">Radar</h1>
        <p className="mt-1.5 text-[0.82rem] text-[var(--yzi-text-secondary)]">
          Problemas, pendências e riscos derivados de contratos operacionais reais.
        </p>
      </header>

      {data ? (
        <form method="get" className="grid gap-2 rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] p-4 sm:grid-cols-[1fr_1fr_auto]">
          <label className="sr-only" htmlFor="radar-category">Categoria</label>
          <select id="radar-category" name="category" defaultValue={filters.category ?? ""} className="yzi-field">
            <option value="">Todas as categorias</option>
            {Object.entries(CATEGORY_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label className="sr-only" htmlFor="radar-severity">Severidade</label>
          <select id="radar-severity" name="severity" defaultValue={filters.severity ?? ""} className="yzi-field">
            <option value="">Todas as severidades</option>
            {Object.entries(SEVERITY_META).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
          </select>
          <button type="submit" className="rounded-[var(--yzi-radius-sm)] bg-[var(--yzi-text-primary)] px-4 py-2 text-[0.72rem] font-semibold text-[var(--yzi-surface-base)]">Aplicar</button>
        </form>
      ) : null}

      <WorkspaceSection first title="Sinais ativos" description={data ? `${visibleSignals.length} ocorrência(s) após os filtros.` : "Leitura tenant-scoped."}>
        {visibleSignals.length ? (
          <div>{visibleSignals.map((signal) => <SignalRow key={signal.id} signal={signal} onInspect={setInspected} />)}</div>
        ) : accessState === "ready" && data?.signals.length ? (
          <StatePanel accessState="ready" />
        ) : (
          <StatePanel accessState={accessState} />
        )}
      </WorkspaceSection>

      {data ? (
        <WorkspaceSection title="Inspector determinístico" description="Explica a regra sem LLM, recomendação generativa ou decisão autônoma.">
          <Inspector signal={inspected} />
        </WorkspaceSection>
      ) : null}

      {data?.operationalHealth.availability === "available" ? (
        <WorkspaceSection title="Saúde operacional — gestor" description="Snapshot sanitizado, sem payload, telefone, SQL ou stack trace.">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {[
              ["Inbound failed", data.operationalHealth.inboundFailed],
              ["Outbound failed", data.operationalHealth.outboundFailed],
              ["Jobs parados", data.operationalHealth.jobsStalled],
              ["Tarefas vencidas", data.operationalHealth.overdueTasks],
              ["Recoveries", data.operationalHealth.recoveriesExecuted],
            ].map(([label, value]) => (
              <div key={String(label)}><p className="text-[0.64rem] text-[var(--yzi-text-faint)]">{label}</p><p className="mt-1 font-mono text-[1.2rem] text-[var(--yzi-text-primary)]">{value ?? "—"}</p></div>
            ))}
          </div>
        </WorkspaceSection>
      ) : null}

      {data ? (
        <WorkspaceSection title="Disponibilidade das fontes" description={data.availability === "partial_data" ? "Dados parciais: uma ou mais fontes opcionais estão indisponíveis." : "Fontes disponíveis."}>
          <div className="divide-y divide-[color:var(--yzi-border-subtle)]">
            {data.sources.map((source) => (
              <div key={source.id} className="flex justify-between gap-4 py-2.5 text-[0.74rem]">
                <span className="text-[var(--yzi-text-primary)]">{source.label}</span>
                <span className="text-right text-[var(--yzi-text-faint)]">{source.availability} · {source.detail}</span>
              </div>
            ))}
          </div>
        </WorkspaceSection>
      ) : null}

      <div className="flex items-center gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-5">
        <SearchIcon className="h-4 w-4 text-[var(--yzi-text-faint)]" />
        <label htmlFor="radar-search" className="sr-only">Buscar nos sinais carregados</label>
        <input id="radar-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nos sinais carregados" className="min-w-0 flex-1 bg-transparent text-[0.8rem] text-[var(--yzi-text-primary)] outline-none" />
      </div>
      <p className="text-[0.68rem] text-[var(--yzi-text-faint)]">
        Sinais são derivados em leitura e não persistidos; reconhecimento e resolução não aparecem porque não há contrato real de acknowledgement.
      </p>
    </section>
  );
}
