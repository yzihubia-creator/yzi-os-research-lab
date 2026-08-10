import type { PropertyPublicationMedia } from "@/lib/yzi-imob/publication/types";

export const PROPERTY_MEDIA_LIMITS = {
  image: { maxBytes: 10 * 1024 * 1024, maxPerProperty: 30 },
  rawVideo: { maxBytes: 50 * 1024 * 1024, maxPerProperty: 5 },
  document: { maxBytes: 25 * 1024 * 1024, maxPerProperty: 10 },
} as const;

export const PROPERTY_MEDIA_ALLOWED_FILES = {
  image: {
    extensions: ["jpg", "jpeg", "png", "webp"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    ruleLabel: "JPG, PNG ou WEBP · até 10 MB por arquivo",
  },
  rawVideo: {
    extensions: ["mp4", "mov"],
    mimeTypes: ["video/mp4", "video/quicktime"],
    ruleLabel: "MP4 ou MOV · até 50 MB por arquivo (limite atual do plano)",
  },
  document: {
    extensions: ["pdf"],
    mimeTypes: ["application/pdf"],
    ruleLabel: "PDF · até 25 MB por arquivo",
  },
} as const;

export type PropertyGallerySlotKey =
  | "primary"
  | "facade"
  | "location_view"
  | "entrance"
  | "common_area"
  | "leisure"
  | "interior"
  | "floor_plan"
  | "raw_video"
  | "commercial_document";

export type PropertyGallerySlotDefinition = {
  key: PropertyGallerySlotKey;
  label: string;
  description: string;
  fileRule: string;
  support: "current" | "partial" | "migration_required";
  contractNote?: string;
  matches: (media: PropertyPublicationMedia) => boolean;
};

const INTERIOR_ENVIRONMENTS = new Set([
  "living_room",
  "balcony",
  "kitchen",
  "bedroom",
  "suite",
  "bathroom",
  "detail",
]);

export const PROPERTY_GALLERY_SLOTS: readonly PropertyGallerySlotDefinition[] = [
  {
    key: "primary",
    label: "Imagem principal",
    description: "Capa operacional do imóvel e referência para os formatos derivados.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) => media.mediaType === "image" && (media.isPrimary || media.isCover),
  },
  {
    key: "facade",
    label: "Fachada",
    description: "Identidade externa do imóvel ou do empreendimento.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) => media.mediaType === "image" && media.environmentType === "facade",
  },
  {
    key: "location_view",
    label: "Localização / vista externa",
    description: "Entorno, acesso e vistas externas confirmadas.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) =>
      media.mediaType === "image" && ["location", "view"].includes(media.environmentType),
  },
  {
    key: "entrance",
    label: "Entrada / recepção",
    description: "Chegada, hall e recepção do imóvel ou condomínio.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) => media.mediaType === "image" && media.environmentType === "entrance",
  },
  {
    key: "common_area",
    label: "Área comum",
    description: "Circulação, salão, academia e outras áreas compartilhadas.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "migration_required",
    contractNote: "O enum atual não distingue área comum de lazer.",
    matches: () => false,
  },
  {
    key: "leisure",
    label: "Lazer / rooftop / piscina",
    description: "Piscina, rooftop e espaços de lazer confirmados.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) => media.mediaType === "image" && media.environmentType === "leisure",
  },
  {
    key: "interior",
    label: "Unidade / interior",
    description: "Sala, varanda, cozinha, quartos, suítes, banheiros e detalhes.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) =>
      media.mediaType === "image" && INTERIOR_ENVIRONMENTS.has(media.environmentType),
  },
  {
    key: "floor_plan",
    label: "Planta / tipologia",
    description: "Plantas e materiais visuais que explicam a distribuição dos espaços.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) => media.mediaType === "image" && media.environmentType === "floor_plan",
  },
  {
    key: "raw_video",
    label: "Vídeos brutos",
    description: "Captações originais, separadas de tours e peças geradas.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.rawVideo.ruleLabel,
    support: "partial",
    contractNote: "O banco aceita vídeo, mas ainda não registra MIME, tamanho ou slot de ingestão.",
    matches: (media) => media.mediaType === "video",
  },
  {
    key: "commercial_document",
    label: "Material comercial / documentos",
    description: "Apresentações, folders, tabelas e documentos liberados para uso.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.document.ruleLabel,
    support: "migration_required",
    contractNote: "PDF/documento não é aceito pelo media_type atual; imagens de marca continuam visíveis aqui.",
    matches: (media) => media.environmentType === "brand",
  },
] as const;

export function mediaForGallerySlot(
  slot: PropertyGallerySlotDefinition,
  media: readonly PropertyPublicationMedia[],
): readonly PropertyPublicationMedia[] {
  return media.filter(slot.matches).sort(
    (left, right) =>
      left.displayOrder - right.displayOrder ||
      left.sortOrder - right.sortOrder ||
      left.id.localeCompare(right.id),
  );
}

export function buildPropertySourceMediaPath(input: {
  tenantId: string;
  propertyId: string;
  slot: PropertyGallerySlotKey;
  mediaId: string;
  safeFilename: string;
}): string {
  return `tenant/${input.tenantId}/properties/${input.propertyId}/source-media/${input.slot}/${input.mediaId}-${input.safeFilename}`;
}

export function buildPropertyCreativeRunPath(input: {
  tenantId: string;
  propertyId: string;
  runId: string;
  format: string;
  safeFilename: string;
}): string {
  return `tenant/${input.tenantId}/properties/${input.propertyId}/creative-runs/${input.runId}/${input.format}/${input.safeFilename}`;
}
