import Link from "next/link";

import { YziImobCarouselReview } from "@/components/yzi-imob/creative/yzi-imob-carousel-review";
import { YziImobPropertyAccessState } from "@/components/yzi-imob/properties/yzi-imob-property-access-state";
import { YziAlert, YziPanel, YziStatusBadge } from "@/components/yzi-os/yzi-primitives";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import type { CarouselEditorialPlan } from "@/lib/yzi-imob/creative/carousel/types";
import { evaluateCreativeMediaReadiness } from "@/lib/yzi-imob/creative/media/readiness";
import { deriveCreativePackageState } from "@/lib/yzi-imob/creative/package-state";
import { getCreativeWorkspace } from "@/lib/yzi-imob/creative/repository";
import type { CreativeRevision } from "@/lib/yzi-imob/creative/types";
import type { VideoTourPlan } from "@/lib/yzi-imob/creative/video-tour/types";
import { listPropertyPublicationMedia } from "@/lib/yzi-imob/publication/repository";
import { getPropertyById } from "@/lib/yzi-imob/properties/repository";

import {
  createCreativeRequestAction,
  decideCreativeRevisionAction,
  updateCreativeMediaGovernanceAction,
} from "./actions";

const STATUS_LABELS: Record<string, string> = {
  queued: "Na fila",
  generating: "Geração pendente",
  in_review: "Aguardando aprovação",
  changes_requested: "Ajustes solicitados",
  approved: "Aprovado",
  failed: "Geração falhou",
  rejected: "Reprovado",
  succeeded: "Geração concluída",
  preparing: "Em preparação",
  partially_ready: "Parte disponível",
  awaiting_approval: "Aguardando aprovação",
  partially_failed: "Falha parcial",
};

const ENVIRONMENT_OPTIONS = [
  ["facade", "Fachada"],
  ["entrance", "Entrada"],
  ["living_room", "Sala"],
  ["balcony", "Varanda"],
  ["kitchen", "Cozinha"],
  ["bedroom", "Quarto"],
  ["suite", "Suíte"],
  ["bathroom", "Banheiro"],
  ["leisure", "Lazer"],
  ["view", "Vista"],
  ["floor_plan", "Planta"],
  ["location", "Localização"],
  ["detail", "Detalhe"],
  ["brand", "Marca"],
  ["other", "Outro"],
] as const;

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

function isVideoTourPlan(value: unknown): value is VideoTourPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Partial<VideoTourPlan>;
  return plan.kind === "video_tour_plan" && Array.isArray(plan.scenes);
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
        title="Estúdio criativo indisponível"
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
        title="Erro de leitura do estúdio criativo"
        message="Não foi possível carregar o pedido, as revisões e os arquivos. Nenhum estado vazio foi presumido e nenhuma operação foi iniciada."
      />
    );
  }

  const workspace = workspaceResult.value;
  const carousel = workspace.deliverables.find((item) => item.deliverableType === "carousel") ?? null;
  const videoTour = workspace.deliverables.find((item) => item.deliverableType === "video_tour") ?? null;
  const currentRevision =
    workspace.revisions.find((item) => item.id === carousel?.currentRevisionId) ?? null;
  const plan = planFor(currentRevision);
  const videoRevision =
    workspace.revisions.find((item) => item.id === videoTour?.currentRevisionId) ?? null;
  const videoPlan = isVideoTourPlan(videoRevision?.contentSnapshot?.blueprint)
    ? videoRevision.contentSnapshot.blueprint
    : null;
  const carouselJob = workspace.jobs.find((job) => job.deliverableId === carousel?.id) ?? null;
  const approvedMedia =
    mediaResult.status === "ok"
      ? mediaResult.value.filter(
          (item) =>
            item.mediaType === "image" &&
            item.isPublicationAllowed &&
            item.processingStatus === "ready" &&
            item.mediaStatus === "approved",
        )
      : [];
  const allMedia = mediaResult.status === "ok" ? mediaResult.value : [];
  const readiness = evaluateCreativeMediaReadiness({
    tenantId: tenantContext.tenant.id,
    propertyId: id,
    propertyFactsComplete: Boolean(propertyResult.value.title && propertyResult.value.city),
    readFailed: mediaResult.status === "error",
    media: approvedMedia.map((item) => ({
      id: item.id,
      tenantId: item.tenantId,
      propertyId: item.propertyId,
      mediaType: item.mediaType,
      environmentType: item.environmentType,
      displayOrder: item.displayOrder,
      isPrimary: item.isPrimary,
      eligibleForCarousel: item.eligibleForCarousel,
      eligibleForVideo: item.eligibleForVideo,
      mediaStatus: item.mediaStatus,
      orientation: item.orientation,
      width: item.width,
      height: item.height,
      humanNote: item.humanNote,
      exclusionReason: item.exclusionReason,
    })),
  });
  const packageState = deriveCreativePackageState(workspace.deliverables);
  const feedback =
    query.result === "created"
      ? "Carrossel preparado em uma revisão nova e preservada no histórico."
      : query.result === "media_updated"
        ? "Classificação da mídia atualizada e readiness recalculado."
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
            Estúdio criativo · Imóvel
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--yzi-text-primary)]">
            {propertyResult.value.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Carrossel e vídeo organizados somente a partir do imóvel e de suas mídias
            aprovadas. Nenhum conteúdo foi publicado.
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

      <div className="grid gap-3 sm:grid-cols-4">
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
        <YziPanel>
          <p className="text-xs text-[var(--yzi-text-faint)]">Pacote</p>
          <p className="mt-2 text-sm text-[var(--yzi-text-primary)]">
            {statusLabel(packageState)}
          </p>
        </YziPanel>
      </div>

      <YziPanel>
        <h2 className="text-sm font-semibold">Prontidão das mídias</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["Carrossel", readiness.carousel],
            ["Video Tour", readiness.videoTour],
          ].map(([label, item]) => {
            const result = item as typeof readiness.carousel;
            return (
              <div key={String(label)}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm">{String(label)}</p>
                  <YziStatusBadge
                    tone={
                      result.state === "ready"
                        ? "opportunity"
                        : result.state === "incomplete" || result.state === "blocked"
                          ? "blocked"
                          : "neutral"
                    }
                  >
                    {result.state === "ready"
                      ? "Pronto"
                      : result.state === "ready_with_warnings"
                        ? "Pronto com alertas"
                        : result.state === "incomplete"
                          ? "Incompleto"
                          : "Bloqueado"}
                  </YziStatusBadge>
                </div>
                {result.diagnostics.length ? (
                  <ul className="mt-3 space-y-1 text-xs text-[var(--yzi-text-secondary)]">
                    {result.diagnostics.map((diagnostic) => (
                      <li key={`${diagnostic.code}-${diagnostic.mediaId ?? ""}`}>
                        {diagnostic.message}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      </YziPanel>

      {mediaResult.status === "ok" ? (
        <YziPanel>
          <h2 className="text-sm font-semibold">Organização das mídias</h2>
          <p className="mt-2 text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
            Confirme ambiente, ordem, imagem principal e uso em cada entrega.
          </p>
          {allMedia.length ? (
            <div className="mt-4 space-y-4">
              {allMedia.map((item, index) => (
                <form
                  key={item.id}
                  action={updateCreativeMediaGovernanceAction}
                  className="grid gap-3 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] p-4 md:grid-cols-3"
                >
                  <input type="hidden" name="propertyId" value={id} />
                  <input type="hidden" name="mediaId" value={item.id} />
                  <p className="text-sm font-medium md:col-span-3">Imagem {index + 1}</p>
                  <label className="text-xs text-[var(--yzi-text-secondary)]">
                    Ambiente
                    <select name="environmentType" defaultValue={item.environmentType} className="mt-1 w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                      {ENVIRONMENT_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-[var(--yzi-text-secondary)]">
                    Ordem
                    <input name="displayOrder" type="number" min={0} max={10000} defaultValue={item.displayOrder} className="mt-1 w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm" />
                  </label>
                  <label className="text-xs text-[var(--yzi-text-secondary)]">
                    Estado
                    <select name="mediaStatus" defaultValue={item.mediaStatus} className="mt-1 w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                      <option value="pending">Pendente</option>
                      <option value="approved">Aprovada</option>
                      <option value="excluded">Excluída da seleção</option>
                      <option value="failed">Com problema</option>
                    </select>
                  </label>
                  <label className="text-xs text-[var(--yzi-text-secondary)]">
                    Orientação
                    <select name="orientation" defaultValue={item.orientation} className="mt-1 w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                      <option value="portrait">Vertical</option>
                      <option value="landscape">Horizontal</option>
                      <option value="square">Quadrada</option>
                      <option value="unknown">Não confirmada</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[var(--yzi-text-secondary)]">
                    <input name="isPrimary" type="checkbox" defaultChecked={item.isPrimary} />
                    Imagem principal
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[var(--yzi-text-secondary)]">
                    <input name="eligibleForCarousel" type="checkbox" defaultChecked={item.eligibleForCarousel} />
                    Usar no carrossel
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[var(--yzi-text-secondary)]">
                    <input name="eligibleForVideo" type="checkbox" defaultChecked={item.eligibleForVideo} />
                    Usar no Video Tour
                  </label>
                  <label className="text-xs text-[var(--yzi-text-secondary)] md:col-span-2">
                    Nota humana
                    <input name="humanNote" maxLength={500} defaultValue={item.humanNote ?? ""} className="mt-1 w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm" />
                  </label>
                  <label className="text-xs text-[var(--yzi-text-secondary)]">
                    Motivo da exclusão
                    <input name="exclusionReason" maxLength={500} defaultValue={item.exclusionReason ?? ""} className="mt-1 w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm" />
                  </label>
                  <button type="submit" className="w-fit rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-4 py-2 text-sm md:col-span-3">
                    Salvar organização
                  </button>
                </form>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--yzi-text-secondary)]">
              Nenhuma mídia cadastrada para este imóvel.
            </p>
          )}
        </YziPanel>
      ) : null}

      {!workspace.request ? (
        <YziPanel variant="yzi" className="max-w-2xl">
          <h2 className="text-base font-semibold">Preparar conteúdo do imóvel</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            A seleção é feita entre as mídias aprovadas deste imóvel. Os dados factuais
            permanecem vinculados ao cadastro.
          </p>
          <form action={createCreativeRequestAction} className="mt-5 flex flex-col gap-4">
            <input type="hidden" name="propertyId" value={id} />
            <input type="hidden" name="idempotencyKey" value={`creative:${id}:${crypto.randomUUID()}`} />
            <label className="text-xs text-[var(--yzi-text-secondary)]">
              Entrega
              <select name="format" className="mt-1 w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                <option value="carousel">Carrossel</option>
                <option value="video_tour">Video Tour</option>
                <option value="complete_package">Pacote completo</option>
              </select>
            </label>
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
              Preparar conteúdo
            </button>
          </form>
        </YziPanel>
      ) : !carousel ? (
        <YziAlert tone="info" title={videoTour ? "Video Tour solicitado" : "Pedido sem entrega"}>
          {videoTour
            ? "O vídeo será preparado sem criar ou alterar um carrossel."
            : "O pedido existente ainda não contém uma entrega válida."}
        </YziAlert>
      ) : carousel.status === "generating" || carouselJob?.status === "processing" ? (
        <YziAlert tone="info" title="Geração pendente">
          A preparação ainda não concluiu a revisão. Nenhum resultado parcial foi tratado como pronto.
        </YziAlert>
      ) : carousel.status === "failed" || carouselJob?.status === "failed" ? (
        <YziAlert tone="blocked" title="Geração falhou">
          A última preparação falhou. A revisão anterior permanece preservada.
        </YziAlert>
      ) : !currentRevision ? (
        <YziAlert tone="warning" title="Revisão indisponível">
          O entregável ainda não possui uma revisão atual.
        </YziAlert>
      ) : !plan ? (
        <YziAlert tone="blocked" title="Plano inválido">
          A revisão atual não atende ao formato de sete cards.
        </YziAlert>
      ) : (
        <YziImobCarouselReview
          propertyId={id}
          revision={currentRevision}
          plan={plan}
          media={approvedMedia.map((item) => ({
            id: item.id,
            url: null,
            altText: item.altText,
          }))}
          canDecide={canDecide}
        />
      )}

      {videoTour ? (
        <YziPanel>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Video Tour</h2>
            <YziStatusBadge tone={videoTour.publicationEligible ? "opportunity" : "neutral"}>
              {statusLabel(videoTour.status)}
            </YziStatusBadge>
          </div>
          {videoPlan ? (
            <div className="mt-4">
              <p className="text-sm text-[var(--yzi-text-secondary)]">
                {videoPlan.scenes.length} cenas · {videoPlan.duration} segundos · formato vertical
              </p>
              <ol className="mt-3 space-y-2 text-xs text-[var(--yzi-text-secondary)]">
                {videoPlan.scenes.map((scene) => (
                  <li key={scene.position}>
                    Cena {scene.position}: {scene.environmentType.replaceAll("_", " ")} ·{" "}
                    {scene.duration}s
                  </li>
                ))}
              </ol>
              {videoRevision?.status === "in_review" && canDecide ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <form action={decideCreativeRevisionAction}>
                    <input type="hidden" name="propertyId" value={id} />
                    <input type="hidden" name="revisionId" value={videoRevision.id} />
                    <input type="hidden" name="deliverableType" value="video_tour" />
                    <input type="hidden" name="decision" value="approved" />
                    <button type="submit" className="w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-2 text-sm">
                      Aprovar vídeo
                    </button>
                  </form>
                  <form action={decideCreativeRevisionAction} className="sm:col-span-2">
                    <input type="hidden" name="propertyId" value={id} />
                    <input type="hidden" name="revisionId" value={videoRevision.id} />
                    <input type="hidden" name="deliverableType" value="video_tour" />
                    <input type="hidden" name="decision" value="changes_requested" />
                    <input type="hidden" name="idempotencyKey" value={`video-revision:${videoRevision.id}:${videoRevision.contentHash.slice(0, 16)}`} />
                    <div className="grid gap-2 sm:grid-cols-3">
                      <select name="adjustmentKind" defaultValue="slow_motion" className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                        <option value="swap_scene_media">Trocar imagem</option>
                        <option value="slow_motion">Usar movimento mais lento</option>
                        <option value="remove_overlay">Retirar texto</option>
                        <option value="reduce_duration">Reduzir duração</option>
                        <option value="correct_cta">Corrigir chamada</option>
                      </select>
                      <select name="scenePosition" defaultValue={1} className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                        {videoPlan.scenes.map((scene) => (
                          <option key={scene.position} value={scene.position}>Cena {scene.position}</option>
                        ))}
                      </select>
                      <select name="duration" defaultValue={15} className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                        <option value={15}>15 segundos</option>
                        <option value={20}>20 segundos</option>
                        <option value={30}>30 segundos</option>
                      </select>
                      <select name="replacementMediaId" defaultValue="" className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                        <option value="">Manter imagem</option>
                        {approvedMedia.filter((item) => item.eligibleForVideo).map((item, index) => (
                          <option key={item.id} value={item.id}>Imagem {index + 1}</option>
                        ))}
                      </select>
                      <input name="observation" required maxLength={80} placeholder="Descreva o ajuste" className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm sm:col-span-2" />
                      <button type="submit" className="w-fit rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-2 text-sm sm:col-span-3">
                        Solicitar nova revisão
                      </button>
                    </div>
                  </form>
                  <form action={decideCreativeRevisionAction} className="sm:col-span-3">
                    <input type="hidden" name="propertyId" value={id} />
                    <input type="hidden" name="revisionId" value={videoRevision.id} />
                    <input type="hidden" name="deliverableType" value="video_tour" />
                    <input type="hidden" name="decision" value="rejected" />
                    <input type="hidden" name="observation" value="Revisão reprovada na análise humana." />
                    <button type="submit" className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-2 text-sm">
                      Reprovar vídeo
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          ) : (
            <YziAlert className="mt-4" tone={videoTour.status === "failed" ? "blocked" : "info"}>
              {videoTour.status === "failed"
                ? "O vídeo não foi concluído. Outras entregas permanecem preservadas."
                : "O plano do vídeo ainda está sendo preparado."}
            </YziAlert>
          )}
        </YziPanel>
      ) : null}

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
