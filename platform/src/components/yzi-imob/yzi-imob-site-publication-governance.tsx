import Link from "next/link";

import type { SitePublicationGovernanceSummary } from "@/lib/yzi-imob/publication/types";

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  incomplete: "Incompleto",
  under_review: "Em revisão",
  changes_required: "Alterações solicitadas",
  ready_to_publish: "Pronto",
  approved: "Aprovado",
  publishing: "Sincronizando",
  published: "Publicado",
  update_pending: "Atualização pendente",
  paused: "Pausado",
  unpublished: "Despublicado",
  archived: "Arquivado",
  failed: "Falha",
};

function formatDate(value: string | null): string {
  if (!value) return "Sem sincronização";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function YziImobSitePublicationGovernance({
  summary,
}: {
  summary: SitePublicationGovernanceSummary;
}) {
  const counters = [
    ["Prontos", summary.counts.ready],
    ["Publicados", summary.counts.published],
    ["Atualização pendente", summary.counts.updatePending],
    ["Falhas", summary.counts.failed],
    ["Pausados", summary.counts.paused],
  ] as const;

  return (
    <section className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-3">
        <Link
          href="/cockpit/yzi-imob"
          className="w-fit text-[0.72rem] text-[var(--yzi-text-faint)] hover:text-[var(--yzi-text-secondary)]"
        >
          ← Voltar ao YZI IMOB
        </Link>
        <div>
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[var(--yzi-text-secondary)]">
            Site · governança de publicação
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--yzi-text-primary)]">
            Publicação de imóveis
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Acompanhe readiness, revisão, sincronização, pausa e despublicação. Esta
            superfície governa representações autorizadas; não é um CMS nem um construtor
            de páginas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] md:grid-cols-5">
        {counters.map(([label, value]) => (
          <div
            key={label}
            className="border-b border-r border-[color:var(--yzi-border-subtle)] px-4 py-4 last:border-r-0 md:border-b-0"
          >
            <p className="text-[0.58rem] uppercase tracking-[0.16em] text-[var(--yzi-text-faint)]">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--yzi-text-primary)]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {summary.items.length === 0 ? (
        <div className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-6 py-12 text-center">
          <p className="text-[0.88rem] text-[var(--yzi-text-primary)]">
            Nenhum imóvel nesta operação
          </p>
          <p className="mt-2 text-[0.76rem] text-[var(--yzi-text-secondary)]">
            Quando o cadastro canônico tiver imóveis, o estado de publicação aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)]">
          <div className="hidden grid-cols-[minmax(0,1.4fr)_0.7fr_0.9fr_1fr] gap-4 border-b border-[color:var(--yzi-border-subtle)] px-4 py-3 text-[0.6rem] uppercase tracking-[0.15em] text-[var(--yzi-text-faint)] md:grid">
            <span>Imóvel</span>
            <span>Status</span>
            <span>Sincronização</span>
            <span>Readiness</span>
          </div>
          {summary.items.map((item) => (
            <article
              key={item.propertyId}
              className="grid gap-3 border-b border-[color:var(--yzi-border-subtle)] px-4 py-4 last:border-b-0 md:grid-cols-[minmax(0,1.4fr)_0.7fr_0.9fr_1fr] md:items-center md:gap-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/cockpit/yzi-imob/imoveis/${item.propertyId}`}
                  className="truncate text-[0.82rem] font-medium text-[var(--yzi-text-primary)] hover:text-[rgb(var(--imob-ice))]"
                >
                  {item.propertyTitle}
                </Link>
                {item.publicUrl ? (
                  <p className="mt-1 truncate text-[0.68rem] text-[var(--yzi-text-faint)]">
                    {item.publicUrl}
                  </p>
                ) : null}
              </div>
              <p className="text-[0.74rem] text-[var(--yzi-text-secondary)]">
                {STATUS_LABEL[item.status] ?? item.status}
              </p>
              <p className="text-[0.7rem] text-[var(--yzi-text-secondary)]">
                {formatDate(item.lastSyncedAt)}
              </p>
              <p className="text-[0.7rem] text-[var(--yzi-text-secondary)]">
                {item.blockers.length
                  ? `${item.blockers.length} bloqueio(s): ${item.blockers.slice(0, 2).join(", ")}`
                  : "Sem bloqueios"}
              </p>
            </article>
          ))}
        </div>
      )}

      <p className="text-[0.68rem] text-[var(--yzi-text-faint)]">
        Nenhum domínio externo, publicação social, Google ou Metricool é acionado por esta
        tela.
      </p>
    </section>
  );
}
