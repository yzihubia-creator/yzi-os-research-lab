import type { ReactNode } from "react";

import { OpportunityIcon, SearchIcon } from "@/components/yzi-os/yzi-icons";
import {
  YziBadge,
  YziPanel,
  YziStatusBadge,
} from "@/components/yzi-os/yzi-primitives";

import {
  demoPropertySearch,
  demoPropertySearchNoMatch,
  type PropertyCandidate,
  type PropertySearchFilters,
  type PropertySearchResult,
} from "@/lib/yzi-imob/capabilities";

// YZI IMOB — Property Search v0 (experiência de PRODUTO). Diferente da inspeção
// do runtime: aqui o pedido do cliente vira uma resposta estruturada de busca.
// Renderiza o resultado honesto de duas capabilities demo (`demoPropertySearch`,
// `demoPropertySearchNoMatch`) — funções PURAS, síncronas, com matching mockado.
//
// NÃO executa tool, NÃO cria approval, NÃO toca banco/API/Supabase/credenciais.
// Reutiliza o Dashboard Visual System (YZI IMOB é vertical sobre o core YZI OS).

function formatBrl(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusTone(status: PropertySearchResult["status"]): "opportunity" | "blocked" {
  return status === "READY_FOR_APPROVAL" ? "opportunity" : "blocked";
}

function FilterChips({ filters }: { filters: PropertySearchFilters }) {
  const chips: string[] = [];
  if (filters.kind) chips.push(`tipo: ${filters.kind}`);
  if (filters.bedrooms !== null) chips.push(`${filters.bedrooms}+ dorm.`);
  if (filters.neighborhood) chips.push(`bairro: ${filters.neighborhood}`);
  if (filters.city) chips.push(`cidade: ${filters.city}`);
  if (filters.max_price !== null) chips.push(`até ${formatBrl(filters.max_price)}`);

  if (chips.length === 0) {
    return (
      <span className="text-[0.7rem] text-[var(--yzi-text-faint)]">
        Nenhum filtro específico detectado no pedido.
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <YziBadge key={chip} tone="trust" className="normal-case">
          {chip}
        </YziBadge>
      ))}
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: PropertyCandidate }) {
  return (
    <div className="flex flex-col gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            {candidate.title}
          </span>
          <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">
            {candidate.property_id} · {candidate.status}
          </span>
        </div>
        <YziBadge tone="opportunity" className="normal-case">
          match {candidate.match_score}
        </YziBadge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <YziBadge tone="neutral" className="normal-case">
          {candidate.kind}
        </YziBadge>
        <YziBadge tone="neutral" className="normal-case">
          {candidate.bedrooms} dorm.
        </YziBadge>
        <YziBadge tone="neutral" className="normal-case">
          {candidate.neighborhood} · {candidate.city}
        </YziBadge>
        <YziBadge tone="neutral" className="normal-case">
          {candidate.price !== null ? formatBrl(candidate.price) : "preço n/d"}
        </YziBadge>
      </div>

      <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {candidate.match_reason}
      </p>

      {candidate.caveats.length > 0 ? (
        <ul className="flex flex-col gap-0.5">
          {candidate.caveats.map((caveat) => (
            <li
              key={caveat}
              className="text-[0.68rem] text-[var(--yzi-accent-risk)]"
            >
              ⚠ {caveat}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[var(--yzi-text-secondary)]">
        {label}
      </span>
      {children}
    </div>
  );
}

function PropertySearchCard({ result }: { result: PropertySearchResult }) {
  return (
    <YziPanel variant="default" className="flex flex-col gap-4 p-4">
      {/* Pedido do cliente — a entrada da experiência de produto. */}
      <div className="flex items-start gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] p-3">
        <SearchIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--yzi-text-secondary)]" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--yzi-text-faint)]">
            Pedido do cliente
          </span>
          <span className="text-sm text-[var(--yzi-text-primary)]">
            “{result.client_request}”
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <YziStatusBadge tone={statusTone(result.status)}>
          {result.status}
        </YziStatusBadge>
        <YziBadge tone="preview" className="normal-case">
          intent: {result.intent ?? "—"}
        </YziBadge>
        <YziBadge tone="action" className="normal-case">
          workflow: {result.workflow ?? "—"}
        </YziBadge>
      </div>

      <Section label="Filtros detectados">
        <FilterChips filters={result.detected_filters} />
      </Section>

      <Section
        label={`Imóveis candidatos (${result.candidates.length} de ${result.total_scanned})`}
      >
        {result.candidates.length > 0 ? (
          <div className="flex flex-col gap-2">
            {result.candidates.map((candidate) => (
              <CandidateCard key={candidate.property_id} candidate={candidate} />
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] p-3 text-[0.72rem] text-[var(--yzi-text-secondary)]">
            Nenhum imóvel do tenant bate no critério — estado honesto, nada
            inventado.
          </div>
        )}
      </Section>

      <Section label="Próximos passos sugeridos">
        <ul className="flex flex-col gap-1">
          {result.suggested_next_steps.map((step) => (
            <li
              key={step}
              className="flex items-start gap-2 text-[0.72rem] text-[var(--yzi-text-secondary)]"
            >
              <OpportunityIcon className="mt-0.5 h-3 w-3 shrink-0 text-[var(--yzi-accent-opportunity)]" />
              {step}
            </li>
          ))}
        </ul>
      </Section>

      <div className="flex flex-wrap items-center gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-3">
        <YziBadge tone="opportunity" className="normal-case">
          evidence.no_side_effects: {String(result.evidence.no_side_effects)}
        </YziBadge>
        <YziBadge tone="neutral" className="normal-case">
          matching: {result.evidence.matching}
        </YziBadge>
        <YziBadge tone="neutral" className="normal-case">
          tools executadas: {result.evidence.used_tools.length}
        </YziBadge>
      </div>
    </YziPanel>
  );
}

export function YziImobPropertySearchV0() {
  const matchResult = demoPropertySearch();
  const noMatchResult = demoPropertySearchNoMatch();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[var(--yzi-text-secondary)]">
          Capability de produto · Property Search · v0
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--yzi-text-primary)]">
          Busca de imóvel
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
          O cliente descreve o que procura; o runtime classifica a intenção,
          escolhe o workflow PROPERTY_SEARCH e casa o critério com o catálogo do
          tenant. Matching mockado, read-only — nenhuma tool, banco, API ou
          credencial é usada.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PropertySearchCard result={matchResult} />
        <PropertySearchCard result={noMatchResult} />
      </div>
    </div>
  );
}
