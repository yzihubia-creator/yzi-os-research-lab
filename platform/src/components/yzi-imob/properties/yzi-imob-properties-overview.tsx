import Link from "next/link";

import { YziPresence } from "@/components/yzi-os/yzi-primitives";
import { computePropertyCompleteness } from "@/lib/yzi-imob/properties/completeness";
import type { Property } from "@/lib/yzi-imob/properties/types";

// Visão geral da área de Imóveis — olhar de gestor imobiliário, não painel
// técnico. Server component: todos os números são derivados diretamente da
// lista real de imóveis da imobiliária (nenhum valor inventado). Informação
// gerencial que ainda não tem fonte real (leads, visitas, propostas,
// campanhas) simplesmente não aparece aqui.

const RECENT_DAYS = 30;

function isRecent(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  return Date.now() - created <= RECENT_DAYS * 24 * 60 * 60 * 1000;
}

function countBy(
  properties: readonly Property[],
  pick: (property: Property) => string | null,
): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  for (const property of properties) {
    const value = pick(property)?.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-4 shadow-[var(--yzi-edge-highlight)]">
      <span className="text-[1.6rem] font-semibold tabular-nums leading-none text-[var(--yzi-text-primary)]">
        {value}
      </span>
      <span className="text-[0.74rem] text-[var(--yzi-text-secondary)]">{label}</span>
    </div>
  );
}

function DistributionRow({
  title,
  entries,
}: {
  title: string;
  entries: Array<{ label: string; count: number }>;
}) {
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="w-24 shrink-0 text-[0.74rem] text-[var(--yzi-text-faint)]">{title}</span>
      <span className="flex flex-wrap gap-x-4 gap-y-1">
        {entries.map((entry) => (
          <span key={entry.label} className="text-[0.8rem] text-[var(--yzi-text-secondary)]">
            <span className="text-[var(--yzi-text-primary)]">{entry.label}</span>{" "}
            <span className="tabular-nums">({entry.count})</span>
          </span>
        ))}
      </span>
    </div>
  );
}

export function YziImobPropertiesOverview({
  properties,
  membershipMissing = false,
}: {
  properties: readonly Property[];
  membershipMissing?: boolean;
}) {
  const withCompleteness = properties.map((property) => ({
    property,
    completeness: computePropertyCompleteness(property),
  }));

  const total = properties.length;
  const active = properties.filter((p) => p.status === "active").length;
  const incomplete = withCompleteness.filter((e) => e.completeness.percentage < 100);
  const recent = properties.filter((p) => isRecent(p.createdAt)).length;

  const byType = countBy(properties, (p) => p.propertyType);
  const byTransaction = countBy(properties, (p) => p.transactionType);
  const byNeighborhood = countBy(properties, (p) => p.neighborhood);
  const hasDistribution =
    byType.length > 0 || byTransaction.length > 0 || byNeighborhood.length > 0;

  // Atenção: os cadastros mais incompletos primeiro, com o motivo real.
  const attention = [...incomplete]
    .sort((a, b) => a.completeness.percentage - b.completeness.percentage)
    .slice(0, 5);

  return (
    <section className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-8 px-8 py-10">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <YziPresence state="ready" animated />
          <span className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[var(--yzi-text-secondary)]">
            Imóveis
          </span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.01em] text-[var(--yzi-text-primary)]">
              Visão geral
            </h1>
            <p className="max-w-xl text-[0.92rem] leading-relaxed text-[var(--yzi-text-secondary)]">
              {membershipMissing
                ? "Sua conta ainda não está vinculada a uma imobiliária."
                : total > 0
                  ? "Como está o estoque de imóveis desta operação."
                  : "Ainda não há imóveis cadastrados nesta operação."}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            <Link
              href="/cockpit/yzi-imob/imoveis/novo"
              className="inline-flex items-center gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-elevated)] px-4 py-2.5 text-[0.82rem] font-medium text-[var(--yzi-text-primary)] shadow-[var(--yzi-edge-highlight)] transition-colors hover:bg-[var(--yzi-surface-base)]"
            >
              Cadastrar imóvel
            </Link>
            <Link
              href="/cockpit/yzi-imob/imoveis/catalogo"
              className="inline-flex items-center gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-4 py-2.5 text-[0.82rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)]"
            >
              Abrir catálogo
            </Link>
          </div>
        </div>
      </header>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-6 py-16 text-center">
          <p className="max-w-sm text-[0.92rem] leading-relaxed text-[var(--yzi-text-primary)]">
            {membershipMissing
              ? "Sua conta ainda não está vinculada a uma imobiliária."
              : "A visão geral nasce do primeiro imóvel cadastrado."}
          </p>
          <p className="max-w-sm text-[0.78rem] text-[var(--yzi-text-secondary)]">
            {membershipMissing
              ? "Você pode preparar um cadastro, mas para salvá-lo é preciso vincular sua conta a uma imobiliária."
              : "Cadastre um imóvel para acompanhar estoque, cadastros incompletos e novidades por aqui."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label="Imóveis no total" value={total} />
            <Metric label="Ativos" value={active} />
            <Metric label="Com cadastro incompleto" value={incomplete.length} />
            <Metric label={`Cadastrados nos últimos ${RECENT_DAYS} dias`} value={recent} />
          </div>

          {hasDistribution ? (
            <div className="flex flex-col gap-2.5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-4 shadow-[var(--yzi-edge-highlight)]">
              <DistributionRow title="Por tipo" entries={byType} />
              <DistributionRow title="Por transação" entries={byTransaction} />
              <DistributionRow title="Por bairro" entries={byNeighborhood} />
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">
              Pedem sua atenção
            </h2>
            {attention.length === 0 ? (
              <p className="text-[0.82rem] text-[var(--yzi-text-secondary)]">
                Nenhum cadastro pendente — todos os imóveis estão completos.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {attention.map(({ property, completeness }) => {
                  const reasons: string[] = [];
                  if (property.price === null) reasons.push("sem preço");
                  if (!property.description?.trim()) reasons.push("sem descrição");
                  const otherMissing =
                    completeness.missingFields.length - reasons.length;
                  if (otherMissing > 0) {
                    reasons.push(
                      `${otherMissing} ${otherMissing === 1 ? "campo pendente" : "campos pendentes"}`,
                    );
                  }
                  return (
                    <li key={property.id}>
                      <Link
                        href={`/cockpit/yzi-imob/imoveis/${property.id}`}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3 shadow-[var(--yzi-edge-highlight)] transition-colors hover:border-[color:var(--yzi-border-strong)] hover:bg-[var(--yzi-surface-elevated)]"
                      >
                        <span className="min-w-0 truncate text-[0.86rem] font-medium text-[var(--yzi-text-primary)]">
                          {property.title}
                        </span>
                        <span className="text-[0.74rem] text-[var(--yzi-text-secondary)]">
                          {completeness.percentage}% completo
                          {reasons.length > 0 ? ` · ${reasons.join(" · ")}` : ""}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
