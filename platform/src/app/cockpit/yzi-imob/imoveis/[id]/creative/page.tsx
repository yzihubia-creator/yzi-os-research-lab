import Link from "next/link";

import { YziImobCarouselReview } from "@/components/yzi-imob/creative/yzi-imob-carousel-review";
import {
  YziImobPropertyAssetsReview,
  type PropertyAssetVisualPreview,
} from "@/components/yzi-imob/creative/yzi-imob-property-assets-review";
import {
  YziImobVideoTourReview,
  type VideoTourVisualPreview,
} from "@/components/yzi-imob/creative/yzi-imob-video-tour-review";
import { YziImobPropertyAccessState } from "@/components/yzi-imob/properties/yzi-imob-property-access-state";
import { YziAlert, YziPanel, YziStatusBadge } from "@/components/yzi-os/yzi-primitives";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import type { CarouselEditorialPlan } from "@/lib/yzi-imob/creative/carousel/types";
import { evaluateCreativeMediaReadiness } from "@/lib/yzi-imob/creative/media/readiness";
import { deriveCreativePackageState } from "@/lib/yzi-imob/creative/package-state";
import { loadCreativePreviewUrls } from "@/lib/yzi-imob/creative/preview-access";
import { derivePropertyAssets } from "@/lib/yzi-imob/creative/property-assets";
import { getCreativeWorkspace } from "@/lib/yzi-imob/creative/repository";
import type { CreativeRevision } from "@/lib/yzi-imob/creative/types";
import type { CreativePackageState } from "@/lib/yzi-imob/creative/package-state";
import type { VideoTourPlan } from "@/lib/yzi-imob/creative/video-tour/types";
import { listPropertyPublicationMedia } from "@/lib/yzi-imob/publication/repository";
import { getPropertyById } from "@/lib/yzi-imob/properties/repository";

import {
  createCreativeRequestAction,
  updateCreativeMediaGovernanceAction,
} from "./actions";

// Vocabulário único de estado para todo o estúdio de artes. Cobre os valores
// de pedido, entregável e revisão para que nenhum status cru do contrato
// chegue ao gestor — inclusive os que não tinham tradução antes (ex.:
// "planned", "cancelled") e apareciam sem tratamento na tela.
const STATUS_LABELS: Record<string, string> = {
  planned: "Em preparo",
  queued: "Em preparo",
  processing: "Em preparo",
  generating: "Em preparo",
  preparing: "Em preparo",
  partially_ready: "Parcialmente pronta",
  in_review: "Aguardando aprovação",
  awaiting_approval: "Aguardando aprovação",
  changes_requested: "Ajuste solicitado",
  approved: "Aprovada",
  succeeded: "Concluída",
  completed: "Concluída",
  rejected: "Reprovada",
  superseded: "Substituída",
  partially_failed: "Parte não concluída",
  failed: "Não foi possível preparar",
  cancelled: "Cancelada",
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

/** Leitura de uma frase só: o estado do pacote de artes deste imóvel. */
const PACKAGE_SUMMARY: Record<
  CreativePackageState,
  { tone: "trust" | "authorization" | "risk" | "opportunity" | "blocked"; label: string; body: string }
> = {
  preparing: {
    tone: "trust",
    label: "Em preparo",
    body: "As artes deste imóvel ainda estão sendo preparadas.",
  },
  partially_ready: {
    tone: "trust",
    label: "Parcialmente pronta",
    body: "Parte das artes deste imóvel já pode ser revisada.",
  },
  awaiting_approval: {
    tone: "authorization",
    label: "Aguardando aprovação",
    body: "Há arte esperando sua decisão. Nada foi publicado ainda.",
  },
  changes_requested: {
    tone: "risk",
    label: "Ajuste solicitado",
    body: "Uma arte deste imóvel está com ajuste pendente antes de seguir.",
  },
  approved: {
    tone: "opportunity",
    label: "Aprovada",
    body: "Todas as artes deste imóvel estão aprovadas e prontas para publicação.",
  },
  partially_failed: {
    tone: "risk",
    label: "Precisa de atenção",
    body: "Uma arte não pôde ser preparada. As demais seguem normalmente.",
  },
  failed: {
    tone: "blocked",
    label: "Não foi possível preparar",
    body: "Nenhuma arte deste imóvel pôde ser preparada agora.",
  },
};

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
        title="Aprovação de artes indisponível"
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
        message="Este imóvel não existe ou não pertence à sua operação."
      />
    );
  }
  if (workspaceResult.status === "error") {
    return (
      <YziImobPropertyAccessState
        title="Não foi possível abrir a aprovação de artes"
        message="Não conseguimos carregar as artes deste imóvel agora. Nada foi alterado — tente novamente em instantes."
      />
    );
  }

  const workspace = workspaceResult.value;
  const temporaryAssetUrls = await loadCreativePreviewUrls(
    supabase,
    tenantContext.tenant.id,
    id,
    workspace.assets,
  );
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
  const approvedMediaById = new Map(approvedMedia.map((item) => [item.id, item]));
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
      ? "Carrossel preparado em uma versão nova, preservada no histórico."
      : query.result === "media_updated"
        ? "Classificação das fotos atualizada. A preparação das próximas artes foi ajustada de acordo."
      : query.result === "approved"
        ? "Sua decisão foi registrada."
        : query.result === "error"
          ? "A ação não foi concluída. Nada mudou em relação ao estado anterior."
          : null;
  const canDecide = ["owner", "admin"].includes(tenantContext.role);
  const propertyAssets = derivePropertyAssets(workspace);
  const accessibleCreativeAssets = workspace.assets.filter(
    (asset) => Boolean(temporaryAssetUrls[asset.id]),
  );
  const carouselRenderedCards = Object.fromEntries(
    accessibleCreativeAssets.flatMap((asset) =>
      asset.revisionId === currentRevision?.id &&
      asset.assetKind === "rendered_preview" &&
      asset.mediaType === "image" &&
      asset.assetPosition !== null
        ? [[asset.assetPosition, temporaryAssetUrls[asset.id]]]
        : [],
    ),
  ) as Record<number, string>;
  const videoRenderAsset = accessibleCreativeAssets.find(
    (asset) =>
      asset.revisionId === videoRevision?.id &&
      asset.assetKind === "rendered_preview" &&
      asset.mediaType === "video",
  );
  const videoThumbnailAsset = accessibleCreativeAssets.find(
    (asset) =>
      asset.revisionId === videoRevision?.id &&
      asset.assetKind === "thumbnail" &&
      asset.mediaType === "image",
  );
  const videoReferenceMedia = videoPlan?.scenes
    .map((scene) => approvedMediaById.get(scene.mediaId) ?? null)
    .find((item) => Boolean(item?.url)) ?? null;
  const videoVisualPreview: VideoTourVisualPreview = {
    videoUrl: videoRenderAsset ? temporaryAssetUrls[videoRenderAsset.id] : null,
    posterUrl: videoThumbnailAsset ? temporaryAssetUrls[videoThumbnailAsset.id] : null,
    referenceImageUrl: videoReferenceMedia?.url ?? null,
    referenceAltText: videoReferenceMedia?.altText ?? null,
  };
  const propertyAssetPreviews = Object.fromEntries(
    propertyAssets.flatMap((asset) => {
      if (!asset.revisionId) return [];
      const revision = workspace.revisions.find((item) => item.id === asset.revisionId) ?? null;
      const rendered = accessibleCreativeAssets.find(
        (item) =>
          item.revisionId === asset.revisionId &&
          item.assetKind === "rendered_preview" &&
          (asset.format === "video_tour" ? item.mediaType === "video" : item.mediaType === "image"),
      );
      const thumbnail = accessibleCreativeAssets.find(
        (item) =>
          item.revisionId === asset.revisionId &&
          item.assetKind === "thumbnail" &&
          item.mediaType === "image",
      );
      const blueprint = revision?.contentSnapshot.blueprint;
      const sourceMediaId = isCarouselPlan(blueprint)
        ? blueprint.cards.find((card) => card.mediaId)?.mediaId ?? null
        : isVideoTourPlan(blueprint)
          ? blueprint.scenes[0]?.mediaId ?? null
          : null;
      const sourceMedia = sourceMediaId ? approvedMediaById.get(sourceMediaId) ?? null : null;
      let preview: PropertyAssetVisualPreview | null = null;
      if (rendered) {
        preview = {
          url: temporaryAssetUrls[rendered.id]!,
          mediaType: rendered.mediaType as "image" | "video",
          posterUrl: thumbnail
            ? temporaryAssetUrls[thumbnail.id]!
            : sourceMedia?.url ?? null,
          altText: sourceMedia?.altText ?? `Preview de ${asset.title}`,
          kind: "rendered",
          decisionReady: true,
        };
      } else if (thumbnail) {
        preview = {
          url: temporaryAssetUrls[thumbnail.id]!,
          mediaType: "image",
          posterUrl: null,
          altText: sourceMedia?.altText ?? `Thumbnail de ${asset.title}`,
          kind: "rendered",
          decisionReady: asset.format !== "video_tour",
        };
      } else if (sourceMedia?.url) {
        preview = {
          url: sourceMedia.url,
          mediaType: "image",
          posterUrl: null,
          altText: sourceMedia.altText ?? `Imagem de referência de ${asset.title}`,
          kind: "reference",
          decisionReady: false,
        };
      }
      return preview ? [[asset.id, preview]] : [];
    }),
  ) as Record<string, PropertyAssetVisualPreview>;
  const currentRevisionIds = workspace.deliverables.flatMap((deliverable) =>
    deliverable.currentRevisionId ? [deliverable.currentRevisionId] : [],
  );

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.18em] text-[var(--yzi-text-faint)]">
            Artes e vídeos · Imóvel
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--yzi-text-primary)]">
            {propertyResult.value.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Revise as artes deste imóvel e decida o que segue pronto para publicação.
            Aprovar não publica nada — a publicação em si continua sendo uma ação
            separada, feita por você.
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
        <YziAlert tone="blocked" title="Não foi possível carregar as fotos">
          Não conseguimos confirmar quais fotos estão aprovadas agora. A preparação de
          novas artes fica bloqueada até isso ser resolvido.
        </YziAlert>
      ) : null}

      <YziPanel variant="authorization" className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
            Artes deste imóvel
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            {["changes_requested", "partially_failed", "failed"].includes(packageState)
              ? PACKAGE_SUMMARY[packageState].body
              : "Cada arte abaixo pertence a este imóvel. Aprovar deixa a peça pronta para publicação — a publicação em WhatsApp, site ou redes sociais continua sendo uma decisão separada, feita por você."}
          </p>
        </div>
        <YziStatusBadge tone={PACKAGE_SUMMARY[packageState].tone}>
          {PACKAGE_SUMMARY[packageState].label}
        </YziStatusBadge>
      </YziPanel>

      <YziImobPropertyAssetsReview
        assets={propertyAssets}
        previews={propertyAssetPreviews}
        canDecide={canDecide}
        currentRevisionIds={currentRevisionIds}
      />

      {readiness.carousel.state !== "ready" || readiness.videoTour.state !== "ready" ? (
        <YziPanel>
          <h2 className="text-sm font-semibold">Fotos para novas artes</h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
            O que falta para preparar cada formato a partir das fotos aprovadas.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              ["Carrossel", readiness.carousel],
              ["Video Tour", readiness.videoTour],
            ].map(([label, item]) => {
              const result = item as typeof readiness.carousel;
              if (result.state === "ready") return null;
              return (
                <div key={String(label)}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm">{String(label)}</p>
                    <YziStatusBadge tone={result.state === "ready_with_warnings" ? "preview" : "blocked"}>
                      {result.state === "ready_with_warnings"
                        ? "Pronto com alertas"
                        : result.state === "incomplete"
                          ? "Faltam fotos"
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
      ) : null}

      {mediaResult.status === "ok" ? (
        <YziPanel id="organizacao-midias" className="scroll-mt-6">
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
        <YziPanel id="preparar-criativos" variant="yzi" className="max-w-2xl scroll-mt-6">
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
        <YziAlert tone="info" title={videoTour ? "Vídeo solicitado" : "Nenhuma arte pronta ainda"}>
          {videoTour
            ? "O vídeo será preparado sem criar ou alterar um carrossel."
            : "Ainda não há uma arte válida preparada para este imóvel."}
        </YziAlert>
      ) : carousel.status === "generating" || carouselJob?.status === "processing" ? (
        <YziAlert tone="info" title="Em preparo">
          Esta arte ainda está sendo preparada. Nada parcial é mostrado como pronto para revisão.
        </YziAlert>
      ) : carousel.status === "failed" || carouselJob?.status === "failed" ? (
        <YziAlert tone="blocked" title="Não foi possível preparar esta arte">
          A última tentativa não foi concluída. A versão anterior continua preservada e disponível.
        </YziAlert>
      ) : !currentRevision ? (
        <YziAlert tone="warning" title="Preview ainda não disponível">
          Esta arte ainda não tem uma versão para revisar.
        </YziAlert>
      ) : !plan ? (
        <YziAlert tone="blocked" title="Preview com problema">
          A versão atual desta arte não pôde ser exibida corretamente.
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
          renderedCards={carouselRenderedCards}
          canDecide={canDecide}
        />
      )}

      {videoTour && videoRevision && videoPlan ? (
        <YziImobVideoTourReview
          propertyId={id}
          deliverable={videoTour}
          revision={videoRevision}
          plan={videoPlan}
          preview={videoVisualPreview}
          approvedMedia={approvedMedia}
          canDecide={canDecide}
          statusLabel={statusLabel(videoTour.status)}
        />
      ) : videoTour ? (
        <YziAlert tone={videoTour.status === "failed" ? "blocked" : "info"}>
          {videoTour.status === "failed"
            ? "O vídeo não foi concluído. As demais artes deste imóvel continuam preservadas."
            : "O vídeo ainda está sendo preparado. O preview visual aparecerá quando estiver disponível."}
        </YziAlert>
      ) : null}

      {workspace.revisions.length ? (
        <YziPanel>
          <h2 className="text-sm font-semibold">Histórico</h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
            Todas as versões desta arte, da mais recente à primeira.
          </p>
          <ol className="mt-4 divide-y divide-[color:var(--yzi-border-subtle)]">
            {workspace.revisions.map((revision) => (
              <li key={revision.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm text-[var(--yzi-text-primary)]">Versão {revision.revisionNumber}</p>
                  <p className="mt-1 text-xs text-[var(--yzi-text-faint)]">
                    {revision.sourceRevisionId ? "Ajustada a partir da versão anterior" : "Primeira versão"} · {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(revision.createdAt))}
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
    </section>
  );
}
