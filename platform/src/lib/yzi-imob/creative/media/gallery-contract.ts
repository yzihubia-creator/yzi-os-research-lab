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
  mediaClass: keyof typeof PROPERTY_MEDIA_ALLOWED_FILES;
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
    mediaClass: "image",
    label: "Imagem principal",
    description: "Capa operacional do imóvel e referência para os formatos derivados.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) => media.mediaType === "image" && (media.isPrimary || media.isCover),
  },
  {
    key: "facade",
    mediaClass: "image",
    label: "Fachada",
    description: "Identidade externa do imóvel ou do empreendimento.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) => media.mediaType === "image" && media.environmentType === "facade",
  },
  {
    key: "location_view",
    mediaClass: "image",
    label: "Localização / vista externa",
    description: "Entorno, acesso e vistas externas confirmadas.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) =>
      media.mediaType === "image" && ["location", "view"].includes(media.environmentType),
  },
  {
    key: "entrance",
    mediaClass: "image",
    label: "Entrada / recepção",
    description: "Chegada, hall e recepção do imóvel ou condomínio.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) => media.mediaType === "image" && media.environmentType === "entrance",
  },
  {
    key: "common_area",
    mediaClass: "image",
    label: "Área comum",
    description: "Circulação, salão, academia e outras áreas compartilhadas.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) => media.mediaType === "image" && media.slot === "common_area",
  },
  {
    key: "leisure",
    mediaClass: "image",
    label: "Lazer / rooftop / piscina",
    description: "Piscina, rooftop e espaços de lazer confirmados.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) => media.mediaType === "image" && media.environmentType === "leisure",
  },
  {
    key: "interior",
    mediaClass: "image",
    label: "Unidade / interior",
    description: "Sala, varanda, cozinha, quartos, suítes, banheiros e detalhes.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) =>
      media.mediaType === "image" && INTERIOR_ENVIRONMENTS.has(media.environmentType),
  },
  {
    key: "floor_plan",
    mediaClass: "image",
    label: "Planta / tipologia",
    description: "Plantas e materiais visuais que explicam a distribuição dos espaços.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.image.ruleLabel,
    support: "current",
    matches: (media) => media.mediaType === "image" && media.environmentType === "floor_plan",
  },
  {
    key: "raw_video",
    mediaClass: "rawVideo",
    label: "Vídeos brutos",
    description: "Captações originais, separadas de tours e peças geradas.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.rawVideo.ruleLabel,
    support: "current",
    matches: (media) => media.mediaType === "video",
  },
  {
    key: "commercial_document",
    mediaClass: "document",
    label: "Material comercial / documentos",
    description: "Apresentações, folders, tabelas e documentos liberados para uso.",
    fileRule: PROPERTY_MEDIA_ALLOWED_FILES.document.ruleLabel,
    support: "current",
    matches: (media) =>
      media.slot === "commercial_document" ||
      media.mediaType === "document" ||
      media.environmentType === "brand",
  },
] as const;

export function mediaForGallerySlot(
  slot: PropertyGallerySlotDefinition,
  media: readonly PropertyPublicationMedia[],
): readonly PropertyPublicationMedia[] {
  return media.filter((item) => item.slot === slot.key || slot.matches(item)).sort(
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
  fileExtension: string;
}): string {
  return `tenants/${input.tenantId}/properties/${input.propertyId}/source-media/${input.slot}/${input.mediaId}.${input.fileExtension}`;
}

export type PropertyMediaFileValidation =
  | { valid: true; mediaClass: PropertyGallerySlotDefinition["mediaClass"] }
  | { valid: false; message: string };

export function validatePropertyMediaFile(
  slotKey: PropertyGallerySlotKey,
  file: { name: string; type: string; size: number },
): PropertyMediaFileValidation {
  const slot = PROPERTY_GALLERY_SLOTS.find((item) => item.key === slotKey);
  if (!slot) return { valid: false, message: "Slot de mídia inválido." };
  const contract = PROPERTY_MEDIA_ALLOWED_FILES[slot.mediaClass];
  const limits = PROPERTY_MEDIA_LIMITS[slot.mediaClass];
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(contract.mimeTypes as readonly string[]).includes(file.type)) {
    return { valid: false, message: `Tipo de arquivo não permitido. Use ${contract.ruleLabel}.` };
  }
  if (!(contract.extensions as readonly string[]).includes(extension)) {
    return { valid: false, message: "A extensão do arquivo não corresponde ao tipo selecionado." };
  }
  if (!Number.isSafeInteger(file.size) || file.size < 1 || file.size > limits.maxBytes) {
    return { valid: false, message: `Arquivo fora do limite. Use ${contract.ruleLabel}.` };
  }
  return { valid: true, mediaClass: slot.mediaClass };
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
