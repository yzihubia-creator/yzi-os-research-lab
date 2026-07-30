import Link from "next/link";

import { YziImobCarouselReview } from "@/components/yzi-imob/creative/yzi-imob-carousel-review";
import { YziImobPropertyAccessState } from "@/components/yzi-imob/properties/yzi-imob-property-access-state";
import { YziAlert, YziPanel, YziStatusBadge } from "@/components/yzi-os/yzi-primitives";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import type { CarouselEditorialPlan } from "@/lib/yzi-imob/creative/carousel/types";
import { getCreativeWorkspace } from "@/lib/yzi-imob/creative/repository";
import type { CreativeRevision } from "@/lib/yzi-imob/creative/types";
import { listPropertyPublicationMedia } from "@/lib/yzi-imob/publication/repository";
import { getPropertyById } from "@/lib/yzi-imob/properties/repository";

import { createCreativeRequestAction } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  queued: "Na fila",
  generating: "Geração pendente",
  in_review: "Aguardando aprovação",
  changes_requested: "Ajustes solicitados",
  approved: "Aprovado",
  failed: "Geração falhou",
  rejected: "Reprovado",
  succeeded: "Geração concluída",
};

function isCarouselPlan(value: unknown): value is CarouselEditorialPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Partial<CarouselEditorialPlan>;
  return (
    plan.kind === "carousel_editorial_plan" &&
    plan.templateKey === "property_editorial_v1" &&
    Array.isArray(plan.cards) &&
    plan.cards.length === 7
  );
}

function planFor(revision: CreativeRevision | null): CarouselEditorialPlan | null {
  const blueprint = revision?.contentSnapshot?.blueprint;
  return isCarouselPlan(blueprint) ? blueprint : null;
}

function statusLabel(value: string): string {
  return STATUS_LABELS[value] ?? value;
}

export default async function CreativeEnginePropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const [{ id }, query, tenantContext] = await Promise.all([
    params,
    searchParams,
    getTenantContext(),
  ]);

  if (tenantContext.status !== "tenant_found") {
    return (
      <YziImobPropertyAccessState
        title="Creative Engine indisponível"
        message="Não foi possível validar seu acesso a este imóvel."
      />
    );
  }

  const supabase = await createServerSupabaseClient();
  const [propertyResult, workspaceResult, mediaResult] = await Promise.all([
    getPropertyById(supabase, tenantContext.tenant.id, id),
    getCreativeWorkspace(supabase, tenantContext.tenant.id, id),
    listPropertyPublicationMedia(supabase, tenantContext.tenant.id, id),
  ]);

  if (propertyResult.status === "error") {
    return (
      <YziImobPropertyAccessState
        title="Imóvel não encontrado"
        message="Este ativo não existe ou não pertence à sua operação."
      />
    );
  }
  if (workspaceResult.status === "error") {
    return (
      <YziImobPropertyAccessState
        title="Erro de leitura do Creative Engine"
        message="Não foi possível carregar pedido, revisões e assets. Nenhum estado vazio foi presumido e nenhuma operação foi iniciada."
      />
    );
  }

  const workspace = workspaceResult.value;
  const carousel = workspace.deliverables.find((item) => item.deliverableType === "carousel") ?? null;
  const currentRevision =
    workspace.revisions.find((item) => item.id === carousel?.currentRevisionId) ?? null;
  const plan = planFor(currentRevision);
  const approvedMedia =
    mediaResult.status === "ok"
      ? mediaResult.value.filter(
          (item) =>
            item.mediaType === "image" &&
            item.isPublicationAllowed &&
            item.processingStatus === "ready",
        )
      : [];
  const feedback =
    query.result === "created"
      ? "Carrossel preparado em uma revisão nova e preservada no histórico."
      : query.result === "approved"
        ? "Decisão humana registrada."
        : query.result === "error"
          ? "A operação não foi concluída. O estado anterior foi preservado."
          : null;
  const canDecide = ["owner", "admin"].includes(tenantContext.role);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.18em] text-[var(--yzi-text-faint)]">
            Creative Engine · Carrossel editorial
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--yzi-text-primary)]">
            {propertyResult.value.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Sete cards em 4:5, compostos somente a partir do imóvel e de suas mídias
            canônicas. Nenhum conteúdo foi publicado.
          </p>
        </div>
        <Link
          href={`/cockpit/yzi-imob/imoveis/${encodeURIComponent(id)}`}
          className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-xs text-[var(--yzi-text-secondary)]"
        >
          Voltar ao imóvel
        </Link>
      </header>

      {feedback ? <YziAlert tone={query.result === "error" ? "blocked" : "success"}>{feedback}</YziAlert> : null}
      {mediaResult.status === "error" ? (
        <YziAlert tone="blocked" title="Erro de leitura das mídias">
          A seleção canônica não pôde ser verificada; uma nova geração permanece bloqueada.
        </YziAlert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <YziPanel>
          <p className="text-xs text-[var(--yzi-text-faint)]">Pedido</p>
          <p className="mt-2 text-sm text-[var(--yzi-text-primary)]">
            {workspace.request ? statusLabel(workspace.request.status) : "Nenhum pedido criativo"}
          </p>
        </YziPanel>
        <YziPanel>
          <p className="text-xs text-[var(--yzi-text-faint)]">Revisão atual</p>
          <p className="mt-2 text-sm text-[var(--yzi-text-primary)]">
            {currentRevision ? `#${currentRevision.revisionNumber}` : "Ainda não criada"}
          </p>
        </YziPanel>
        <YziPanel>
          <p className="text-xs text-[var(--yzi-text-faint)]">Estado</p>
          <div className="mt-2">
            <YziStatusBadge tone={carousel?.publicationEligible ? "opportunity" : "neutral"}>
              {carousel ? statusLabel(carousel.status) : "Sem carrossel"}
            </YziStatusBadge>
          </div>
        </YziPanel>
      </div>

      {!workspace.request ? (
        <YziPanel variant="yzi" className="max-w-2xl">
          <h2 className="text-base font-semibold">Preparar carrossel editorial</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            A seleção das imagens será feita no servidor entre as mídias prontas e
            autorizadas deste imóvel. O navegador não envia URLs, fatos ou ownership.
          </p>
          <form action={createCreativeRequestAction} className="mt-5 flex flex-col gap-4">
            <input type="hidden" name="propertyId" value={id} />
            <input type="hidden" name="idempotencyKey" value={`carousel:${id}:${crypto.randomUUID()}`} />
            <label className="text-xs text-[var(--yzi-text-secondary)]">
              Objetivo editorial
              <select name="objective" className="mt-1 w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                <option value="present_property">Apresentar o imóvel</option>
                <option value="generate_visits">Convidar para uma visita</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={mediaResult.status !== "ok" || approvedMedia.length === 0}
              className="w-fit rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.35)] bg-[rgba(var(--imob-ice),0.1)] px-4 py-2 text-sm text-[rgb(var(--imob-ice))] disabled:opacity-40"
            >
              Gerar preview local
            </button>
          </form>
        </YziPanel>
      ) : !carousel ? (
        <YziAlert tone="warning" title="Pedido sem carrossel">
          O pedido existente não contém o entregável ativo desta unidade.
        </YziAlert>
      ) : carousel.status === "generating" || workspace.latestJob?.status === "processing" ? (
        <YziAlert tone="info" title="Geração pendente">
          O job local ainda não concluiu a revisão. Nenhum preview parcial foi tratado como pronto.
        </YziAlert>
      ) : carousel.status === "failed" || workspace.latestJob?.status === "failed" ? (
        <YziAlert tone="blocked" title="Geração falhou">
          O último job falhou com um código sanitizado. A revisão anterior permanece preservada.
        </YziAlert>
      ) : !currentRevision ? (
        <YziAlert tone="warning" title="Preview indisponível">
          O entregável ainda não possui uma revisão atual.
        </YziAlert>
      ) : !plan ? (
        <YziAlert tone="blocked" title="Plano inválido">
          A revisão atual não atende ao contrato de sete cards do template canônico.
        </YziAlert>
      ) : (
        <YziImobCarouselReview
          propertyId={id}
          revision={currentRevision}
          plan={plan}
          media={approvedMedia.map((item) => ({
            id: item.id,
            url: item.url,
            altText: item.altText,
          }))}
          canDecide={canDecide}
        />
      )}

      {workspace.revisions.length ? (
        <YziPanel>
          <h2 className="text-sm font-semibold">Histórico de revisões</h2>
          <ol className="mt-4 divide-y divide-[color:var(--yzi-border-subtle)]">
            {workspace.revisions.map((revision) => (
              <li key={revision.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm text-[var(--yzi-text-primary)]">Revisão #{revision.revisionNumber}</p>
                  <p className="mt-1 text-xs text-[var(--yzi-text-faint)]">
                    {revision.sourceRevisionId ? "Derivada da revisão anterior" : "Versão inicial"} · {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(revision.createdAt))}
                  </p>
                </div>
                <YziStatusBadge tone={revision.status === "approved" ? "opportunity" : revision.status === "rejected" ? "blocked" : "neutral"}>
                  {statusLabel(revision.status)}
                </YziStatusBadge>
              </li>
            ))}
          </ol>
        </YziPanel>
      ) : null}

      <p className="text-xs leading-relaxed text-[var(--yzi-text-faint)]">
        Evidência: imóvel {id}
        {workspace.request ? ` · pedido ${workspace.request.id}` : ""}
        {carousel ? ` · entregável ${carousel.id}` : ""}
        {currentRevision ? ` · revisão ${currentRevision.id}` : ""}. Fonte factual:
        cadastro canônico do imóvel; seleção visual: mídias governadas do mesmo tenant e imóvel.
      </p>
    </section>
  );
}
