import { evaluateCreativeMediaReadiness } from "./readiness.ts";
import type {
  CreativeEnvironmentType,
  CreativeMediaReadiness,
  CreativeMediaStatus,
  CreativeMediaOrientation,
  GovernedPropertyMedia,
} from "./types.ts";

export type GuidedMediaInput = {
  id: string;
  tenantId: string;
  propertyId: string;
  mediaType: "image" | "video" | "document";
  environmentType: CreativeEnvironmentType;
  displayOrder: number;
  isPrimary: boolean;
  eligibleForCarousel: boolean;
  eligibleForVideo: boolean;
  mediaStatus: CreativeMediaStatus;
  orientation: CreativeMediaOrientation;
  width: number | null;
  height: number | null;
  humanNote: string | null;
  exclusionReason: string | null;
  processingStatus?: "processing" | "ready" | "failed";
  isPublicationAllowed?: boolean;
  uploadState?: "reserved" | "completed" | "cancelled" | "failed" | null;
};

export type GuidedMediaSlotKey =
  | "primary"
  | "facade"
  | "location_view"
  | "entrance"
  | "common_area"
  | "leisure"
  | "interior"
  | "floor_plan"
  | "commercial_material"
  | "closing_cta";

export type GuidedMediaSlot = {
  key: GuidedMediaSlotKey;
  label: string;
  description: string;
  support: "supported" | "partial" | "pending";
  importance: "required" | "recommended" | "optional";
  linkedCount: number;
  approvedCount: number;
  status: "ready" | "pending" | "missing" | "optional" | "contract_pending";
};

export type GuidedMediaSlotDefinition = Omit<
  GuidedMediaSlot,
  "linkedCount" | "approvedCount" | "status"
> & {
  environments?: readonly CreativeEnvironmentType[];
  primary?: true;
};

export const GUIDED_MEDIA_SLOT_DEFINITIONS: readonly GuidedMediaSlotDefinition[] = [
  {
    key: "primary",
    label: "Imagem principal",
    description: "Abre a apresentação do imóvel e orienta a capa dos formatos.",
    support: "supported",
    importance: "required",
    primary: true,
  },
  {
    key: "facade",
    label: "Fachada",
    description: "Apresenta a identidade externa do imóvel ou empreendimento.",
    support: "supported",
    importance: "recommended",
    environments: ["facade"],
  },
  {
    key: "location_view",
    label: "Localização / vista externa",
    description: "Contextualiza entorno, acesso ou vista confirmada.",
    support: "supported",
    importance: "recommended",
    environments: ["location", "view"],
  },
  {
    key: "entrance",
    label: "Entrada / recepção",
    description: "Faz a transição da chegada para os ambientes internos.",
    support: "supported",
    importance: "recommended",
    environments: ["entrance"],
  },
  {
    key: "common_area",
    label: "Área comum",
    description: "Ainda não é possível organizar isso separado de Lazer nesta etapa.",
    support: "supported",
    importance: "optional",
    environments: ["common_area"],
  },
  {
    key: "leisure",
    label: "Lazer / rooftop / piscina",
    description: "Reúne os espaços de convivência e lazer já confirmados.",
    support: "supported",
    importance: "recommended",
    environments: ["leisure"],
  },
  {
    key: "interior",
    label: "Unidade / interior",
    description: "Agrupa sala, varanda, cozinha, quartos, suíte e banheiro.",
    support: "supported",
    importance: "recommended",
    environments: [
      "living_room",
      "balcony",
      "kitchen",
      "bedroom",
      "suite",
      "bathroom",
      "detail",
    ],
  },
  {
    key: "floor_plan",
    label: "Planta / tipologia",
    description: "Ajuda a explicar distribuição e tipologia sem inferência visual.",
    support: "supported",
    importance: "recommended",
    environments: ["floor_plan"],
  },
  {
    key: "commercial_material",
    label: "Material comercial",
    description: "Mídia de marca é reconhecida; documentos comerciais ainda não.",
    support: "partial",
    importance: "optional",
    environments: ["brand"],
  },
  {
    key: "closing_cta",
    label: "Imagem final / CTA",
    description: "O fechamento é montado automaticamente; ainda não é possível enviar uma imagem própria para ele.",
    support: "pending",
    importance: "optional",
  },
] as const;

function isFormatReady(readiness: CreativeMediaReadiness["carousel"]): boolean {
  return readiness.state === "ready" || readiness.state === "ready_with_warnings";
}

function slotMedia(
  definition: GuidedMediaSlotDefinition,
  media: readonly GuidedMediaInput[],
): readonly GuidedMediaInput[] {
  if (definition.primary) {
    return media.filter((item) => item.mediaType === "image" && item.isPrimary);
  }
  if (!definition.environments) return [];
  return media.filter((item) => definition.environments?.includes(item.environmentType));
}

function slotStatus(
  definition: GuidedMediaSlotDefinition,
  linkedCount: number,
  approvedCount: number,
): GuidedMediaSlot["status"] {
  if (definition.support === "pending") return "contract_pending";
  if (approvedCount > 0) return "ready";
  if (linkedCount > 0) return "pending";
  return definition.importance === "optional" ? "optional" : "missing";
}

export type GuidedMediaJourney = {
  slots: readonly GuidedMediaSlot[];
  readiness: CreativeMediaReadiness;
  carouselReady: boolean;
  videoTourReady: boolean;
  missingCover: boolean;
  missingMedia: boolean;
  missingEnvironments: boolean;
  missingFloorPlan: boolean;
  linkedMediaCount: number;
  approvedImageCount: number;
  approvedEnvironmentCount: number;
  state: "unavailable" | "incomplete" | "partially_ready" | "ready";
  stateLabel: string;
  headline: string;
  reading: string;
  recommendation: string;
  evidence: readonly string[];
};

export function buildGuidedMediaJourney(input: {
  tenantId: string;
  propertyId: string;
  media: readonly GuidedMediaInput[];
  propertyFactsComplete: boolean;
  floorPlanApplicable: boolean;
  readFailed?: boolean;
}): GuidedMediaJourney {
  const scopedMedia = input.media.filter(
    (item) => item.tenantId === input.tenantId && item.propertyId === input.propertyId,
  );
  const governedMedia: GovernedPropertyMedia[] = scopedMedia.map((item) => ({ ...item }));
  const readiness = evaluateCreativeMediaReadiness({
    tenantId: input.tenantId,
    propertyId: input.propertyId,
    media: governedMedia,
    propertyFactsComplete: input.propertyFactsComplete,
    readFailed: input.readFailed,
  });
  const carouselReady = isFormatReady(readiness.carousel);
  const videoTourReady = isFormatReady(readiness.videoTour);
  const approvedImages = scopedMedia.filter(
    (item) => item.mediaType === "image" && item.mediaStatus === "approved",
  );
  const approvedVideoMedia = approvedImages.filter((item) => item.eligibleForVideo);
  const approvedEnvironmentCount = new Set(
    approvedVideoMedia
      .map((item) => item.environmentType)
      .filter((environment) => !["other", "detail", "brand"].includes(environment)),
  ).size;
  const missingCover = readiness.carousel.diagnostics.some((item) =>
    ["primary_media_missing", "multiple_primary_media"].includes(item.code),
  );
  const missingMedia = [readiness.carousel, readiness.videoTour].some((format) =>
    format.diagnostics.some((item) =>
      ["carousel_media_insufficient", "video_media_insufficient"].includes(item.code),
    ),
  );
  const missingEnvironments = readiness.videoTour.diagnostics.some(
    (item) => item.code === "video_environment_diversity_insufficient",
  );
  const hasFloorPlan = approvedImages.some((item) => item.environmentType === "floor_plan");
  const missingFloorPlan = input.floorPlanApplicable && !hasFloorPlan;
  const slots = GUIDED_MEDIA_SLOT_DEFINITIONS.map((definition) => {
    const linked = slotMedia(definition, scopedMedia);
    const approvedCount = linked.filter((item) => item.mediaStatus === "approved").length;
    return {
      key: definition.key,
      label: definition.label,
      description: definition.description,
      support: definition.support,
      importance:
        definition.key === "floor_plan" && !input.floorPlanApplicable
          ? "optional"
          : definition.importance,
      linkedCount: linked.length,
      approvedCount,
      status: slotStatus(
        definition.key === "floor_plan" && !input.floorPlanApplicable
          ? { ...definition, importance: "optional" }
          : definition,
        linked.length,
        approvedCount,
      ),
    } satisfies GuidedMediaSlot;
  });

  const state: GuidedMediaJourney["state"] = input.readFailed
    ? "unavailable"
    : carouselReady && videoTourReady
      ? "ready"
      : carouselReady || videoTourReady
        ? "partially_ready"
        : "incomplete";

  const copy = input.readFailed
    ? {
        stateLabel: "Verificação indisponível",
        headline: "As mídias não puderam ser verificadas agora.",
        reading: "Nenhum formato será apresentado como pronto até a leitura ser restabelecida.",
        recommendation: "Tente novamente antes de preparar criativos.",
      }
    : scopedMedia.length === 0
      ? {
          stateLabel: "Sem mídias vinculadas",
          headline: "Este imóvel ainda não possui mídias vinculadas.",
          reading: "O runtime precisa de uma capa aprovada e de uma seleção mínima organizada.",
          recommendation: "O upload real ainda será conectado. Até lá, nenhum criativo será preparado.",
        }
    : missingCover
      ? {
          stateLabel: "Organização pendente",
          headline: "Defina a imagem principal antes de preparar criativos.",
          reading: "A capa é a referência obrigatória para carrossel e video tour.",
          recommendation: "Revise as mídias vinculadas e mantenha uma única imagem principal aprovada.",
        }
      : state === "ready"
        ? {
            stateLabel: "Pronto para preparar",
            headline: "As mídias estão prontas para carrossel e video tour.",
            reading: "A seleção mínima, a capa e a diversidade de ambientes foram confirmadas pelo runtime.",
            recommendation: "Autorize a preparação dos criativos e revise o preview antes de aprovar.",
          }
        : state === "partially_ready"
          ? {
              stateLabel: "Um formato pronto",
              headline: carouselReady
                ? "O carrossel já pode ser preparado. O video tour ainda tem pendências."
                : "O video tour já pode ser preparado. O carrossel ainda tem pendências.",
              reading: "Cada formato é liberado separadamente a partir das mesmas mídias aprovadas.",
              recommendation: missingEnvironments
                ? "Inclua ambientes diferentes para liberar também o video tour."
                : "Complete as mídias indicadas para liberar o segundo formato.",
            }
          : {
              stateLabel: "Materiais pendentes",
              headline: "As mídias vinculadas ainda não atendem ao mínimo dos formatos.",
              reading: "O runtime precisa de uma capa aprovada e de uma seleção mínima organizada.",
              recommendation: "Aprove e organize as mídias existentes conforme os slots abaixo.",
            };

  return {
    slots,
    readiness,
    carouselReady,
    videoTourReady,
    missingCover,
    missingMedia,
    missingEnvironments,
    missingFloorPlan,
    linkedMediaCount: scopedMedia.length,
    approvedImageCount: approvedImages.length,
    approvedEnvironmentCount,
    state,
    ...copy,
    evidence: [
      `${scopedMedia.length} mídia${scopedMedia.length === 1 ? "" : "s"} vinculada${scopedMedia.length === 1 ? "" : "s"}`,
      `${approvedImages.length} imagem${approvedImages.length === 1 ? "" : "s"} aprovada${approvedImages.length === 1 ? "" : "s"}`,
      `${approvedEnvironmentCount} ${approvedEnvironmentCount === 1 ? "ambiente elegível" : "ambientes elegíveis"} para vídeo`,
      missingFloorPlan ? "Planta recomendada ainda não vinculada" : "Planta sem pendência aplicável",
    ],
  };
}
