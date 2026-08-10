import Link from "next/link";

import { CardIcon, CreativeIcon, PlusIcon, StackIcon, TargetIcon } from "@/components/yzi-imob/yzi-imob-icons-v2";
import {
  StateTag,
  TYPE,
  cx,
  type SurfaceTone,
} from "@/components/yzi-imob/yzi-imob-surface-kit";
import { YziInsight } from "@/components/yzi-imob/yzi-imob-yzi-kit";
import {
  PROPERTY_GALLERY_SLOTS,
  PROPERTY_MEDIA_LIMITS,
  mediaForGallerySlot,
  type PropertyGallerySlotDefinition,
} from "@/lib/yzi-imob/creative/media/gallery-contract";
import { buildGuidedMediaJourney } from "@/lib/yzi-imob/creative/media/guided-journey";
import type { PropertyPublicationMedia } from "@/lib/yzi-imob/publication/types";

type Props = {
  tenantId: string;
  propertyId: string;
  propertyTitle: string;
  propertyType: string | null;
  propertyFactsComplete: boolean;
  media: readonly PropertyPublicationMedia[];
  mediaUnavailable?: boolean;
};

const FLOOR_PLAN_PROPERTY_TYPES = ["apartamento", "casa", "comercial"] as const;

function isFloorPlanApplicable(propertyType: string | null): boolean {
  const normalized = propertyType?.trim().toLocaleLowerCase("pt-BR") ?? "";
  return FLOOR_PLAN_PROPERTY_TYPES.some((type) => normalized.includes(type));
}

function gallerySlotPresentation(
  slot: PropertyGallerySlotDefinition,
  items: readonly PropertyPublicationMedia[],
  mediaUnavailable: boolean,
): { label: string; tone: SurfaceTone } {
  if (mediaUnavailable) return { label: "Leitura indisponível", tone: "blocked" };
  if (slot.support === "migration_required" && items.length === 0) {
    return { label: "Exige evolução", tone: "idle" };
  }
  if (items.some((item) => item.mediaStatus === "approved")) {
    return { label: `${items.length} no acervo`, tone: "ok" };
  }
  if (items.length) return { label: "Aguardando aprovação", tone: "pending" };
  return { label: "Slot vazio", tone: "attention" };
}

function mediaState(item: PropertyPublicationMedia): { label: string; tone: SurfaceTone } {
  if (item.processingStatus === "failed" || item.mediaStatus === "failed") {
    return { label: "Com problema", tone: "blocked" };
  }
  if (item.mediaStatus === "approved") return { label: "Aprovada", tone: "ok" };
  if (item.mediaStatus === "excluded") return { label: "Excluída", tone: "idle" };
  return { label: "Pendente", tone: "pending" };
}

function DisabledMediaAction({ label, reason }: { label: string; reason: string }) {
  return (
    <button
      type="button"
      disabled
      title={reason}
      className="cursor-not-allowed rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-2.5 py-1.5 text-[0.68rem] text-[var(--yzi-text-faint)] opacity-70"
    >
      {label}
    </button>
  );
}

function FormatReadiness({
  label,
  ready,
  diagnostics,
  detail,
}: {
  label: string;
  ready: boolean;
  diagnostics: readonly { code: string; message: string }[];
  detail: string;
}) {
  const relevantDiagnostics = diagnostics.filter((item) => item.code !== "property_facts_incomplete");
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] text-[var(--yzi-text-secondary)]"
        >
          {label === "Carrossel" ? <CardIcon className="h-4 w-4" /> : <CreativeIcon className="h-4 w-4" />}
        </span>
        <div>
          <p className={TYPE.itemTitle}>{label}</p>
          <p className={cx(TYPE.meta, "mt-1 max-w-xl")}>{detail}</p>
          {!ready && relevantDiagnostics.length ? (
            <ul className="mt-2 flex flex-col gap-1">
              {relevantDiagnostics.map((diagnostic, index) => (
                <li key={`${diagnostic.code}-${index}`} className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                  {diagnostic.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <StateTag tone={ready ? "ok" : "attention"} label={ready ? "Pronto" : "Faltam materiais"} className="sm:mt-1" />
    </div>
  );
}

export function YziImobPropertyMediaGuidance({
  tenantId,
  propertyId,
  propertyTitle,
  propertyType,
  propertyFactsComplete,
  media,
  mediaUnavailable = false,
}: Props) {
  const journey = buildGuidedMediaJourney({
    tenantId,
    propertyId,
    propertyFactsComplete,
    floorPlanApplicable: isFloorPlanApplicable(propertyType),
    media: media.map((item) => ({
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
    readFailed: mediaUnavailable,
  });
  const creativeHref = `/cockpit/yzi-imob/imoveis/${encodeURIComponent(propertyId)}/creative`;
  const canPrepare = journey.carouselReady || journey.videoTourReady;
  const yziTone: SurfaceTone =
    journey.state === "ready"
      ? "ok"
      : journey.state === "partially_ready"
        ? "info"
        : journey.state === "unavailable"
          ? "blocked"
          : "attention";
  const pendencies = mediaUnavailable
    ? []
    : [
        journey.missingCover ? "Falta capa" : null,
        journey.missingMedia ? "Falta mídia" : null,
        journey.missingEnvironments ? "Faltam ambientes" : null,
        journey.missingFloorPlan ? "Falta planta" : null,
      ].filter((item): item is string => Boolean(item));

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col gap-4" aria-labelledby="property-media-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="property-media-title" className="text-[1.05rem] font-semibold tracking-[-0.01em] text-[var(--yzi-text-primary)]">
              Galeria do imóvel
            </h2>
            <p className="mt-1 max-w-2xl text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
              Acervo original deste imóvel, separado dos criativos gerados. Upload não aprova e aprovação não publica.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <DisabledMediaAction
              label="Adicionar mídia"
              reason="Upload indisponível: falta contrato de ingestão e policy de escrita no storage privado."
            />
            <Link
              href={creativeHref}
              className="inline-flex items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-2 text-[0.74rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)]"
            >
              <CreativeIcon className="h-4 w-4" />
              Ver artes e vídeos
            </Link>
          </div>
        </div>

        <p className="flex items-start gap-2 text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
          <PlusIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Nenhum seletor de arquivo foi habilitado: o storage atual não autoriza ingestão de mídia original.
        </p>
      </section>

      <YziInsight
        context={`Mídias · ${propertyTitle}`}
        headline={journey.headline}
        reading={journey.reading}
        evidence={journey.evidence}
        recommendation={journey.recommendation}
        tone={yziTone}
        stateLabel={journey.stateLabel}
        primaryAction={{
          label: "Preparar criativos",
          href: canPrepare ? `${creativeHref}#preparar-criativos` : undefined,
          disabled: !canPrepare,
          unavailableReason: !canPrepare ? "Complete a capa e os materiais mínimos de ao menos um formato" : undefined,
        }}
        secondaryAction={{ label: "Ver artes e vídeos", href: creativeHref }}
        analysisHref={journey.linkedMediaCount ? `${creativeHref}#organizacao-midias` : undefined}
        analysisLabel="Revisar organização existente"
      />

      <section aria-labelledby="gallery-slots-title">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-secondary)]">
            <StackIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 id="gallery-slots-title" className={TYPE.sectionTitle}>Slots do acervo original</h3>
            <p className={cx(TYPE.sectionLead, "mt-0.5")}>Registros reais do imóvel, organizados pelo papel que cumprem.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] p-4 sm:grid-cols-3">
          <div><p className={TYPE.meta}>Imagens</p><p className={cx(TYPE.itemTitle, "mt-1")}>Até {PROPERTY_MEDIA_LIMITS.image.maxPerProperty} por imóvel</p></div>
          <div><p className={TYPE.meta}>Vídeos brutos</p><p className={cx(TYPE.itemTitle, "mt-1")}>Até {PROPERTY_MEDIA_LIMITS.rawVideo.maxPerProperty} por imóvel</p></div>
          <div><p className={TYPE.meta}>Documentos</p><p className={cx(TYPE.itemTitle, "mt-1")}>Até {PROPERTY_MEDIA_LIMITS.document.maxPerProperty} por imóvel</p></div>
        </div>

        <ol className="mt-4 grid gap-4 lg:grid-cols-2">
          {PROPERTY_GALLERY_SLOTS.map((slot, index) => {
            const slotMedia = mediaForGallerySlot(slot, media);
            const presentation = gallerySlotPresentation(slot, slotMedia, mediaUnavailable);
            const uploadReason = slot.support === "migration_required"
              ? slot.contractNote ?? "Este slot exige evolução do contrato de mídia."
              : "Upload indisponível: falta contrato de ingestão e policy de escrita no storage privado.";
            return (
              <li key={slot.key} className="flex min-h-[15rem] flex-col rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-medium tabular-nums text-[var(--yzi-text-faint)]">SLOT {String(index + 1).padStart(2, "0")}</p>
                    <p className={cx(TYPE.itemTitle, "mt-1")}>{slot.label}</p>
                  </div>
                  <StateTag tone={presentation.tone} label={presentation.label} />
                </div>
                <p className={cx(TYPE.body, "mt-3")}>{slot.description}</p>
                <p className={cx(TYPE.meta, "mt-2")}>{slot.fileRule}</p>
                {slot.contractNote ? <p className="mt-2 text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">{slot.contractNote}</p> : null}

                <div className="mt-4 flex flex-1 flex-col gap-2">
                  {slotMedia.length ? slotMedia.map((item, itemIndex) => {
                    const state = mediaState(item);
                    return (
                      <div key={item.id} className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[0.74rem] font-medium text-[var(--yzi-text-primary)]">{item.altText?.trim() || `${item.mediaType === "video" ? "Vídeo" : "Imagem"} ${itemIndex + 1}`}</p>
                            <p className={cx(TYPE.meta, "mt-1")}>{item.width && item.height ? `${item.width} × ${item.height} · ` : ""}ID {item.id.slice(0, 8)}</p>
                          </div>
                          <StateTag tone={state.tone} label={state.label} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <DisabledMediaAction label="Substituir" reason="Substituição exige upload real e ação explícita sem upsert implícito." />
                          <DisabledMediaAction label="Definir capa" reason="A governança existe, mas esta galeria ainda não expõe uma ação segura de capa." />
                          <DisabledMediaAction label="Baixar" reason="O contrato de mídia original ainda não fornece download por signed URL." />
                          <DisabledMediaAction label="Copiar link" reason="Nenhum link privado temporário é exposto para mídia original nesta tela." />
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="grid flex-1 place-items-center rounded-[var(--yzi-radius-sm)] border border-dashed border-[color:var(--yzi-border-subtle)] px-4 py-5 text-center">
                      <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-faint)]">Nenhuma mídia original registrada neste slot.</p>
                    </div>
                  )}
                </div>
                <div className="mt-3"><DisabledMediaAction label="Adicionar mídia" reason={uploadReason} /></div>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="format-readiness-title">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-secondary)]">
            <TargetIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 id="format-readiness-title" className={TYPE.sectionTitle}>Prontidão dos formatos</h3>
            <p className={cx(TYPE.sectionLead, "mt-0.5")}>Somente mídias aprovadas e liberadas entram nesta leitura.</p>
          </div>
        </div>
        <div className="mt-4 border-y border-[color:var(--yzi-border-subtle)]">
          <FormatReadiness label="Carrossel" ready={journey.carouselReady} diagnostics={journey.readiness.carousel.diagnostics} detail="Requer uma imagem principal e ao menos quatro imagens aprovadas para o formato." />
          <div className="border-t border-[color:var(--yzi-border-subtle)]">
            <FormatReadiness label="Video tour" ready={journey.videoTourReady} diagnostics={journey.readiness.videoTour.diagnostics} detail="Requer uma imagem principal, cinco imagens aprovadas e três ambientes distintos." />
          </div>
        </div>
        {pendencies.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Pendências de mídia">
            <span className={TYPE.meta}>Pendências detectadas:</span>
            {pendencies.map((pendency) => <StateTag key={pendency} tone="attention" label={pendency} />)}
          </div>
        ) : null}
      </section>
    </div>
  );
}
