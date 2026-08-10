import type {
  CreativeMediaReadiness,
  CreativeReadinessDiagnostic,
  DeliverableReadiness,
  GovernedPropertyMedia,
} from "./types.ts";

const MIN_CAROUSEL_MEDIA = 4;
const MIN_VIDEO_MEDIA = 5;
const MIN_VIDEO_ENVIRONMENTS = 3;

function stateFor(diagnostics: readonly CreativeReadinessDiagnostic[]): DeliverableReadiness["state"] {
  if (diagnostics.some((item) => item.code === "media_read_failed")) return "blocked";
  if (diagnostics.some((item) => item.severity === "blocking")) return "incomplete";
  return diagnostics.length ? "ready_with_warnings" : "ready";
}

function stableMedia(media: readonly GovernedPropertyMedia[]): GovernedPropertyMedia[] {
  return [...media].sort(
    (left, right) => left.displayOrder - right.displayOrder || left.id.localeCompare(right.id),
  );
}

export function evaluateCreativeMediaReadiness(input: {
  tenantId: string;
  propertyId: string;
  media: readonly GovernedPropertyMedia[];
  propertyFactsComplete: boolean;
  readFailed?: boolean;
}): CreativeMediaReadiness {
  const diagnostics: CreativeReadinessDiagnostic[] = [];
  if (input.readFailed) {
    diagnostics.push({
      code: "media_read_failed",
      severity: "blocking",
      message: "As mídias não puderam ser verificadas.",
    });
  }

  const scoped = stableMedia(
    input.media.filter(
      (item) => item.tenantId === input.tenantId && item.propertyId === input.propertyId,
    ),
  );
  const approvedImages = scoped.filter(
    (item) =>
      item.mediaType === "image" &&
      item.mediaStatus === "approved" &&
      item.processingStatus !== "processing" &&
      item.processingStatus !== "failed" &&
      item.isPublicationAllowed !== false &&
      !["reserved", "cancelled", "failed"].includes(item.uploadState ?? "completed"),
  );
  const primary = approvedImages.filter((item) => item.isPrimary);
  const baseDiagnostics = [...diagnostics];
  if (primary.length !== 1) {
    baseDiagnostics.push({
      code: primary.length ? "multiple_primary_media" : "primary_media_missing",
      severity: "blocking",
      message: primary.length
        ? "Defina somente uma imagem principal."
        : "Defina uma imagem principal aprovada.",
    });
  }
  if (!input.propertyFactsComplete) {
    baseDiagnostics.push({
      code: "property_facts_incomplete",
      severity: "blocking",
      message: "Complete os dados factuais mínimos do imóvel.",
    });
  }

  const carouselMedia = approvedImages.filter((item) => item.eligibleForCarousel);
  const carouselDiagnostics = [...baseDiagnostics];
  if (carouselMedia.length < MIN_CAROUSEL_MEDIA) {
    carouselDiagnostics.push({
      code: "carousel_media_insufficient",
      severity: "blocking",
      message: `Selecione ao menos ${MIN_CAROUSEL_MEDIA} imagens aprovadas para o carrossel.`,
    });
  }

  const videoMedia = approvedImages.filter((item) => item.eligibleForVideo);
  const videoDiagnostics = [...baseDiagnostics];
  if (videoMedia.length < MIN_VIDEO_MEDIA) {
    videoDiagnostics.push({
      code: "video_media_insufficient",
      severity: "blocking",
      message: `Selecione ao menos ${MIN_VIDEO_MEDIA} imagens aprovadas para o vídeo.`,
    });
  }
  const environmentCount = new Set(
    videoMedia
      .map((item) => item.environmentType)
      .filter((environment) => !["other", "detail", "brand"].includes(environment)),
  ).size;
  if (environmentCount < MIN_VIDEO_ENVIRONMENTS) {
    videoDiagnostics.push({
      code: "video_environment_diversity_insufficient",
      severity: "blocking",
      message: `Inclua ao menos ${MIN_VIDEO_ENVIRONMENTS} ambientes distintos.`,
    });
  }
  for (const item of videoMedia) {
    if (item.width && item.height && Math.min(item.width, item.height) < 720) {
      videoDiagnostics.push({
        code: "video_media_low_resolution",
        severity: "warning",
        message: "Uma imagem pode perder qualidade no formato vertical.",
        mediaId: item.id,
      });
    }
    if (item.orientation === "unknown") {
      videoDiagnostics.push({
        code: "video_media_orientation_unknown",
        severity: "warning",
        message: "A orientação de uma imagem ainda não foi confirmada.",
        mediaId: item.id,
      });
    }
  }

  return {
    carousel: {
      state: stateFor(carouselDiagnostics),
      eligibleMediaIds: carouselMedia.map((item) => item.id),
      diagnostics: carouselDiagnostics,
    },
    videoTour: {
      state: stateFor(videoDiagnostics),
      eligibleMediaIds: videoMedia.map((item) => item.id),
      diagnostics: videoDiagnostics,
    },
  };
}
