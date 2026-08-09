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
  buildGuidedMediaJourney,
  type GuidedMediaSlot,
} from "@/lib/yzi-imob/creative/media/guided-journey";
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

function slotPresentation(slot: GuidedMediaSlot): {
  label: string;
  tone: SurfaceTone;
} {
  if (slot.status === "ready") return { label: "Preenchido", tone: "ok" };
  if (slot.status === "pending") return { label: "Aguardando aprovação", tone: "pending" };
  if (slot.status === "missing") {
    return slot.importance === "required"
      ? { label: "Obrigatório, pendente", tone: "attention" }
      : { label: "Recomendado, pendente", tone: "attention" };
  }
  if (slot.status === "contract_pending") return { label: "Em breve", tone: "idle" };
  return { label: "Opcional", tone: "info" };
}

function mediaCountCopy(slot: GuidedMediaSlot): string {
  if (slot.support === "pending") return "Este papel ainda não recebe mídia nesta etapa.";
  if (!slot.linkedCount) return "Nenhuma mídia vinculada a este papel.";
  if (slot.approvedCount === slot.linkedCount) {
    return `${slot.approvedCount} ${slot.approvedCount === 1 ? "mídia aprovada" : "mídias aprovadas"}.`;
  }
  return `${slot.linkedCount} vinculada${slot.linkedCount === 1 ? "" : "s"} · ${slot.approvedCount} aprovada${slot.approvedCount === 1 ? "" : "s"}.`;
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
      <StateTag
        tone={ready ? "ok" : "attention"}
        label={ready ? "Pronto" : "Faltam materiais"}
        className="sm:mt-1"
      />
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
              Mídias do imóvel
            </h2>
            <p className="mt-1 max-w-2xl text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
              Organize cada material pelo papel que cumpre na apresentação — é essa organização que libera cada formato abaixo, sem depender de classificação automática por IA.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled
              title="O upload real ainda será conectado em uma etapa posterior"
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-[0.74rem] text-[var(--yzi-text-faint)]"
            >
              <PlusIcon className="h-4 w-4" />
              Adicionar mídia
            </button>
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
          O upload real ainda não está conectado — por isso “Adicionar mídia” permanece indisponível e nenhum arquivo é enviado por esta tela.
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
          unavailableReason: !canPrepare
            ? "Complete a capa e os materiais mínimos de ao menos um formato"
            : undefined,
        }}
        secondaryAction={{ label: "Ver artes e vídeos", href: creativeHref }}
        analysisHref={journey.linkedMediaCount ? `${creativeHref}#organizacao-midias` : undefined}
        analysisLabel="Revisar organização existente"
      />

      <section aria-labelledby="format-readiness-title">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-secondary)]"
          >
            <TargetIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 id="format-readiness-title" className={TYPE.sectionTitle}>Prontidão dos formatos</h3>
            <p className={cx(TYPE.sectionLead, "mt-0.5")}>O que falta, por formato, a partir das mídias já organizadas abaixo.</p>
          </div>
        </div>

        <div className="mt-4 border-y border-[color:var(--yzi-border-subtle)]">
          <FormatReadiness
            label="Carrossel"
            ready={journey.carouselReady}
            diagnostics={journey.readiness.carousel.diagnostics}
            detail="Requer uma imagem principal e ao menos quatro imagens aprovadas para o formato."
          />
          <div className="border-t border-[color:var(--yzi-border-subtle)]">
            <FormatReadiness
              label="Video tour"
              ready={journey.videoTourReady}
              diagnostics={journey.readiness.videoTour.diagnostics}
              detail="Requer uma imagem principal, cinco imagens aprovadas e três ambientes distintos."
            />
          </div>
        </div>

        {pendencies.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Pendências de mídia">
            <span className={TYPE.meta}>Pendências detectadas:</span>
            {pendencies.map((pendency) => (
              <StateTag key={pendency} tone="attention" label={pendency} />
            ))}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="guided-media-slots-title">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-secondary)]"
          >
            <StackIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 id="guided-media-slots-title" className={TYPE.sectionTitle}>Sequência recomendada</h3>
            <p className={cx(TYPE.sectionLead, "mt-0.5")}>Os slots descrevem a função de cada material, não uma pasta genérica.</p>
          </div>
        </div>

        <ol className="mt-4 divide-y divide-[color:var(--yzi-border-subtle)] border-y border-[color:var(--yzi-border-subtle)]">
          {journey.slots.map((slot, index) => {
            const presentation = slotPresentation(slot);
            const isSecondary = slot.importance === "optional" || slot.support === "pending";
            return (
              <li
                key={slot.key}
                className={cx(
                  "grid gap-3 py-4 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-start",
                  isSecondary && "opacity-70",
                )}
              >
                <span className="text-[0.68rem] font-medium tabular-nums text-[var(--yzi-text-faint)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={TYPE.itemTitle}>{slot.label}</p>
                    {slot.support === "partial" ? <span className={TYPE.meta}>Suporte parcial</span> : null}
                  </div>
                  <p className={cx(TYPE.body, "mt-1 max-w-2xl")}>{slot.description}</p>
                  <p className={cx(TYPE.meta, "mt-1.5")}>{mediaCountCopy(slot)}</p>
                </div>
                <StateTag tone={presentation.tone} label={presentation.label} />
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
