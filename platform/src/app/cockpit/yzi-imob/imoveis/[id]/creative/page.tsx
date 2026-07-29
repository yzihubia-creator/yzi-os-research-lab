import Link from "next/link";

import { YziImobPropertyAccessState } from "@/components/yzi-imob/properties/yzi-imob-property-access-state";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { getCreativeWorkspace } from "@/lib/yzi-imob/creative/repository";
import type {
  CreativeDeliverable,
  CreativeRevision,
} from "@/lib/yzi-imob/creative/types";
import { listPropertyPublicationMedia } from "@/lib/yzi-imob/publication/repository";
import { getPropertyById } from "@/lib/yzi-imob/properties/repository";

import {
  createCreativeRequestAction,
  decideCreativeRevisionAction,
} from "./actions";

const STATUS_LABELS: Record<string, string> = {
  queued: "Na fila",
  generating: "Gerando estrutura",
  in_review: "Aguardando revisão",
  changes_requested: "Ajustes solicitados",
  approved: "Aprovado",
  completed: "Concluído",
  failed: "Falhou",
  cancelled: "Cancelado",
  planned: "Planejado",
  processing: "Processando",
  succeeded: "Concluído",
  rejected: "Reprovado",
  superseded: "Substituído",
};

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function deliverableLabel(deliverable: CreativeDeliverable): string {
  return deliverable.deliverableType === "carousel" ? "Carrossel" : "Tour em vídeo";
}

function revisionFor(
  deliverable: CreativeDeliverable,
  revisions: readonly CreativeRevision[],
): CreativeRevision | null {
  return revisions.find((revision) => revision.id === deliverable.currentRevisionId) ?? null;
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
        title="Estado criativo indisponível"
        message="Não foi possível carregar o pedido e seu histórico. Nenhuma nova operação foi iniciada."
      />
    );
  }

  const workspace = workspaceResult.value;
  const mediaReadFailed = mediaResult.status === "error";
  const sourceMedia =
    mediaResult.status === "ok"
      ? mediaResult.value.filter(
          (media) => media.isPublicationAllowed && media.processingStatus === "ready",
        )
      : [];
  const canApprove = ["owner", "admin"].includes(tenantContext.role);
  const feedback =
    query.result === "created"
      ? "Pedido criado e saída sintética preparada para revisão."
      : query.result === "approved"
        ? "Decisão registrada. A elegibilidade para publicação foi atualizada."
        : query.result === "error"
          ? "A operação não pôde ser concluída. Revise os dados e tente novamente."
          : null;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.18em] text-[var(--yzi-text-faint)]">
            Creative Engine · fundação
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--yzi-text-primary)]">
            Conteúdo de {propertyResult.value.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Produção governada a partir das mídias do imóvel. Nesta etapa, as saídas são
            estruturas sintéticas: nenhum arquivo é renderizado e nada é publicado.
          </p>
        </div>
        <Link
          href={`/cockpit/yzi-imob/imoveis/${encodeURIComponent(id)}`}
          className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-xs text-[var(--yzi-text-secondary)]"
        >
          Voltar ao imóvel
        </Link>
      </div>

      {feedback ? (
        <p
          role="status"
          className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3 text-sm text-[var(--yzi-text-secondary)]"
        >
          {feedback}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4">
          <p className="text-xs text-[var(--yzi-text-faint)]">Pedido</p>
          <p className="mt-2 text-sm font-medium text-[var(--yzi-text-primary)]">
            {workspace.request ? statusLabel(workspace.request.status) : "Ainda não criado"}
          </p>
          {workspace.request ? (
            <p className="mt-1 break-all text-[0.68rem] text-[var(--yzi-text-faint)]">
              ID {workspace.request.id}
            </p>
          ) : null}
        </article>
        <article className="rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4">
          <p className="text-xs text-[var(--yzi-text-faint)]">Entregáveis</p>
          <p className="mt-2 text-sm font-medium text-[var(--yzi-text-primary)]">
            {workspace.deliverables.length}
          </p>
        </article>
        <article className="rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4">
          <p className="text-xs text-[var(--yzi-text-faint)]">Job de geração</p>
          <p className="mt-2 text-sm font-medium text-[var(--yzi-text-primary)]">
            {workspace.latestJob ? statusLabel(workspace.latestJob.status) : "Não iniciado"}
          </p>
          {workspace.latestJob ? (
            <p className="mt-1 break-all text-[0.68rem] text-[var(--yzi-text-faint)]">
              ID {workspace.latestJob.id}
            </p>
          ) : null}
        </article>
      </div>

      {!workspace.request ? (
        <form
          action={createCreativeRequestAction}
          className="flex flex-col gap-5 rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-raised)] p-5"
        >
          <input type="hidden" name="propertyId" value={id} />
          <input
            type="hidden"
            name="idempotencyKey"
            value={`creative:${id}:${crypto.randomUUID()}`}
          />
          <div>
            <h2 className="text-base font-semibold text-[var(--yzi-text-primary)]">
              Preparar conteúdo
            </h2>
            <p className="mt-1 text-xs text-[var(--yzi-text-secondary)]">
              Escolha somente formatos e mídias deste imóvel.
            </p>
          </div>

          <label className="flex flex-col gap-2 text-xs text-[var(--yzi-text-secondary)]">
            Objetivo
            <select
              name="objective"
              required
              className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm text-[var(--yzi-text-primary)]"
            >
              <option value="Apresentar os principais diferenciais do imóvel">
                Apresentar diferenciais
              </option>
              <option value="Convidar potenciais clientes para uma visita ao imóvel">
                Gerar visitas
              </option>
            </select>
          </label>

          <fieldset className="flex flex-wrap gap-4">
            <legend className="mb-2 text-xs text-[var(--yzi-text-secondary)]">Formatos</legend>
            <label className="flex items-center gap-2 text-sm text-[var(--yzi-text-primary)]">
              <input type="checkbox" name="formats" value="carousel" defaultChecked />
              Carrossel
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--yzi-text-primary)]">
              <input type="checkbox" name="formats" value="video_tour" defaultChecked />
              Tour em vídeo
            </label>
          </fieldset>

          <fieldset className="flex flex-wrap gap-4">
            <legend className="mb-2 text-xs text-[var(--yzi-text-secondary)]">
              Canais pretendidos
            </legend>
            <label className="flex items-center gap-2 text-sm text-[var(--yzi-text-primary)]">
              <input type="checkbox" name="channels" value="social_feed" defaultChecked />
              Feed social
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--yzi-text-primary)]">
              <input type="checkbox" name="channels" value="social_video" defaultChecked />
              Vídeo social
            </label>
          </fieldset>

          <fieldset className="grid gap-2">
            <legend className="mb-2 text-xs text-[var(--yzi-text-secondary)]">
              Mídias canônicas
            </legend>
            {mediaReadFailed ? (
              <p role="alert" className="text-sm text-[var(--yzi-text-secondary)]">
                Não foi possível verificar as mídias canônicas. A criação permanece bloqueada.
              </p>
            ) : sourceMedia.length ? (
              sourceMedia.map((media, index) => (
                <label
                  key={media.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-sm text-[var(--yzi-text-primary)]"
                >
                  <span>
                    {media.mediaType === "image" ? "Imagem" : "Vídeo"} {index + 1}
                    {media.isCover ? " · capa" : ""}
                  </span>
                  <input
                    type="checkbox"
                    name="sourceMediaIds"
                    value={media.id}
                    defaultChecked
                  />
                </label>
              ))
            ) : (
              <p className="text-sm text-[var(--yzi-text-secondary)]">
                O imóvel ainda não possui mídia pronta e autorizada.
              </p>
            )}
          </fieldset>

          <button
            type="submit"
            disabled={!sourceMedia.length}
            className="w-fit rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.35)] bg-[rgba(var(--imob-ice),0.1)] px-4 py-2 text-sm text-[rgb(var(--imob-ice))] disabled:opacity-40"
          >
            Criar pedido sintético
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          {workspace.deliverables.map((deliverable) => {
            const revision = revisionFor(deliverable, workspace.revisions);
            return (
              <article
                key={deliverable.id}
                className="rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-raised)] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--yzi-text-primary)]">
                      {deliverableLabel(deliverable)}
                    </h2>
                    <p className="mt-1 text-xs text-[var(--yzi-text-secondary)]">
                      {statusLabel(deliverable.status)} · revisão{" "}
                      {revision?.revisionNumber ?? "não criada"}
                    </p>
                  </div>
                  <span className="rounded-full border border-[color:var(--yzi-border-subtle)] px-3 py-1 text-xs text-[var(--yzi-text-secondary)]">
                    {deliverable.publicationEligible
                      ? "Elegível para publicação"
                      : "Publicação bloqueada"}
                  </span>
                </div>

                {revision ? (
                  <div className="mt-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4">
                    <p className="text-xs text-[var(--yzi-text-faint)]">
                      Blueprint sintético · sem render
                    </p>
                    <p className="mt-2 text-sm text-[var(--yzi-text-secondary)]">
                      {revision.contentSnapshot.blueprint.kind === "carousel_blueprint"
                        ? `${revision.contentSnapshot.blueprint.slides.length} quadros planejados`
                        : `${revision.contentSnapshot.blueprint.scenes.length} cenas · ${revision.contentSnapshot.blueprint.durationSeconds}s`}
                    </p>

                    {revision.status === "in_review" && canApprove ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <form action={decideCreativeRevisionAction}>
                          <input type="hidden" name="propertyId" value={id} />
                          <input type="hidden" name="revisionId" value={revision.id} />
                          <input type="hidden" name="decision" value="approved" />
                          <button
                            type="submit"
                            className="rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.35)] px-3 py-2 text-xs text-[rgb(var(--imob-ice))]"
                          >
                            Aprovar revisão
                          </button>
                        </form>
                        <form action={decideCreativeRevisionAction} className="flex gap-2">
                          <input type="hidden" name="propertyId" value={id} />
                          <input type="hidden" name="revisionId" value={revision.id} />
                          <input type="hidden" name="decision" value="changes_requested" />
                          <input
                            required
                            name="observation"
                            aria-label="Observação dos ajustes"
                            placeholder="Ajuste necessário"
                            className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-transparent px-3 py-2 text-xs text-[var(--yzi-text-primary)]"
                          />
                          <button
                            type="submit"
                            className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-xs text-[var(--yzi-text-secondary)]"
                          >
                            Solicitar ajustes
                          </button>
                        </form>
                      </div>
                    ) : null}
                    {revision.status === "in_review" && !canApprove ? (
                      <p className="mt-4 text-xs text-[var(--yzi-text-secondary)]">
                        A revisão aguarda decisão de um proprietário ou administrador do tenant.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <p className="text-xs leading-relaxed text-[var(--yzi-text-faint)]">
        Fonte: imóvel e mídias canônicas do tenant. A aprovação só altera a elegibilidade;
        não agenda nem publica conteúdo.
        {workspace.events[0]
          ? ` Última evidência: ${workspace.events[0].eventType} · ${workspace.events[0].id}.`
          : ""}
      </p>
    </section>
  );
}
