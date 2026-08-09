"use client";

import { useState } from "react";

import { decideCreativeRevisionAction } from "@/app/cockpit/yzi-imob/imoveis/[id]/creative/actions";
import { YziAlert, YziPanel, YziStatusBadge } from "@/components/yzi-os/yzi-primitives";
import type { PropertyPublicationMedia } from "@/lib/yzi-imob/publication/types";
import type { CreativeDeliverable, CreativeRevision } from "@/lib/yzi-imob/creative/types";
import type { VideoTourPlan } from "@/lib/yzi-imob/creative/video-tour/types";

export type VideoTourVisualPreview = {
  videoUrl: string | null;
  posterUrl: string | null;
  referenceImageUrl: string | null;
  referenceAltText: string | null;
};

export function YziImobVideoTourReview({
  propertyId,
  deliverable,
  revision,
  plan,
  preview,
  approvedMedia,
  canDecide,
  statusLabel,
}: {
  propertyId: string;
  deliverable: CreativeDeliverable;
  revision: CreativeRevision;
  plan: VideoTourPlan;
  preview: VideoTourVisualPreview;
  approvedMedia: readonly PropertyPublicationMedia[];
  canDecide: boolean;
  statusLabel: string;
}) {
  const [failedVideoUrl, setFailedVideoUrl] = useState<string | null>(null);
  const [failedFrameUrl, setFailedFrameUrl] = useState<string | null>(null);
  const playableVideoUrl = failedVideoUrl === preview.videoUrl ? null : preview.videoUrl;
  const candidateFrameUrl = preview.posterUrl ?? preview.referenceImageUrl;
  const frameUrl = failedFrameUrl === candidateFrameUrl ? null : candidateFrameUrl;
  const hasRenderedVideo = Boolean(playableVideoUrl);

  return (
    <YziPanel id="video-tour-review">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Video Tour</h2>
        <YziStatusBadge tone={deliverable.publicationEligible ? "opportunity" : "neutral"}>
          {statusLabel}
        </YziStatusBadge>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(15rem,20rem)_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[20rem]">
          <div className="relative aspect-[9/16] overflow-hidden rounded-[var(--yzi-radius-md)] bg-[#0d151f] text-white">
            {playableVideoUrl ? (
              <video
                src={playableVideoUrl}
                poster={preview.posterUrl ?? preview.referenceImageUrl ?? undefined}
                controls
                playsInline
                preload="metadata"
                onError={() => setFailedVideoUrl(playableVideoUrl)}
                className="h-full w-full object-cover"
                aria-label="Prévia vertical do Video Tour"
              />
            ) : frameUrl ? (
              <>
                {/* URL canônica ou temporária resolvida no servidor para o tenant ativo. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frameUrl}
                  alt={preview.referenceAltText ?? "Frame de referência do imóvel"}
                  onError={() => setFailedFrameUrl(frameUrl)}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(5,10,16,0.88))]" />
                <p className="absolute inset-x-4 bottom-4 text-xs leading-relaxed text-white/85">
                  {preview.posterUrl
                    ? "Thumbnail disponível. O vídeo ainda não pode ser reproduzido."
                    : "Frame de referência. O vídeo renderizado ainda não está disponível."}
                </p>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 border border-dashed border-white/20 px-6 text-center">
                <p className="text-sm font-medium">Preview visual pendente</p>
                <p className="text-xs leading-relaxed text-white/60">
                  O vídeo ainda não tem arquivo ou frame disponível para revisão.
                </p>
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-[var(--yzi-text-faint)]">
            Formato vertical 9:16 · {plan.duration} segundos
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-sm text-[var(--yzi-text-secondary)]">
            {plan.scenes.length} cenas preparadas para a sequência vertical.
          </p>
          <ol className="mt-3 grid gap-2 text-xs text-[var(--yzi-text-secondary)] sm:grid-cols-2">
            {plan.scenes.map((scene) => (
              <li
                key={scene.position}
                className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2"
              >
                Cena {scene.position}: {scene.environmentType.replaceAll("_", " ")} · {scene.duration}s
              </li>
            ))}
          </ol>

          {!hasRenderedVideo && revision.status === "in_review" ? (
            <YziAlert className="mt-4" tone="info" title="Aprovação visual ainda indisponível">
              A decisão de aprovar será liberada quando o vídeo renderizado puder ser reproduzido.
              Você ainda pode pedir ajuste ou reprovar esta versão.
            </YziAlert>
          ) : null}

          {revision.status === "in_review" && canDecide ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <form action={decideCreativeRevisionAction}>
                <input type="hidden" name="propertyId" value={propertyId} />
                <input type="hidden" name="revisionId" value={revision.id} />
                <input type="hidden" name="deliverableType" value="video_tour" />
                <input type="hidden" name="decision" value="approved" />
                <button
                  type="submit"
                  disabled={!hasRenderedVideo}
                  title={!hasRenderedVideo ? "Aguarde o preview renderizado para aprovar" : undefined}
                  className="w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Aprovar vídeo
                </button>
              </form>
              <form action={decideCreativeRevisionAction} className="sm:col-span-2">
                <input type="hidden" name="propertyId" value={propertyId} />
                <input type="hidden" name="revisionId" value={revision.id} />
                <input type="hidden" name="deliverableType" value="video_tour" />
                <input type="hidden" name="decision" value="changes_requested" />
                <input type="hidden" name="idempotencyKey" value={`video-revision:${revision.id}:${revision.contentHash.slice(0, 16)}`} />
                <div className="grid gap-2 sm:grid-cols-3">
                  <select name="adjustmentKind" defaultValue="slow_motion" className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                    <option value="swap_scene_media">Trocar imagem</option>
                    <option value="slow_motion">Usar movimento mais lento</option>
                    <option value="remove_overlay">Retirar texto</option>
                    <option value="reduce_duration">Reduzir duração</option>
                    <option value="correct_cta">Corrigir chamada</option>
                  </select>
                  <select name="scenePosition" defaultValue={1} className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                    {plan.scenes.map((scene) => (
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
                    Pedir ajuste
                  </button>
                </div>
              </form>
              <form action={decideCreativeRevisionAction} className="sm:col-span-3">
                <input type="hidden" name="propertyId" value={propertyId} />
                <input type="hidden" name="revisionId" value={revision.id} />
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
      </div>
    </YziPanel>
  );
}
