import type {
  CreativeDeliverable,
  CreativeRevision,
  CreativeWorkspace,
} from "./types.ts";

export const PROPERTY_ASSET_STATUS_VALUES = [
  "draft",
  "in_review",
  "adjustment_requested",
  "approved",
  "rejected",
  "archived",
  "published",
] as const;

export type PropertyAssetStatus = (typeof PROPERTY_ASSET_STATUS_VALUES)[number];

export const PROPERTY_ASSET_PROVIDER_CONTRACT = {
  staticTemplateProvider: "canva",
  videoTourProvider: "higgsfield",
  generativeOptional: true,
  integrationMode: "local_mock",
  paidGenerationAllowed: false,
  mcpConnected: false,
} as const;

export type PropertyAssetCategory = "static_art" | "video_tour";
export type PropertyAssetUsageChannel = "whatsapp" | "site" | "social";
export type PropertyAssetProductionPath =
  | "static_template_provider"
  | "video_tour_provider";

export type PropertyAsset = {
  id: string;
  runId: string;
  propertyId: string;
  deliverableId: string;
  revisionId: string | null;
  title: string;
  category: PropertyAssetCategory;
  format: "carousel" | "video_tour";
  status: PropertyAssetStatus;
  productionPath: PropertyAssetProductionPath;
  previewLabel: string;
  previewDetail: string;
  sourceAssetIds: readonly string[];
  finalAssetCount: number;
  eligibleUsageChannels: readonly PropertyAssetUsageChannel[];
};

const APPROVED_USAGE_CHANNELS = ["whatsapp", "site", "social"] as const;

export function isPropertyAssetEligibleForUsage(
  asset: Pick<PropertyAsset, "propertyId" | "status" | "revisionId">,
  propertyId: string,
): boolean {
  return (
    asset.propertyId === propertyId &&
    asset.status === "approved" &&
    Boolean(asset.revisionId)
  );
}

function operationalStatus(
  deliverable: CreativeDeliverable,
  revision: CreativeRevision | null,
  isPublished: boolean,
): PropertyAssetStatus {
  if (isPublished) return "published";
  if (!revision) return "draft";
  if (revision.status === "changes_requested") return "adjustment_requested";
  if (revision.status === "superseded") return "archived";
  if (revision.status === "approved") return "approved";
  if (revision.status === "rejected") return "rejected";
  if (revision.status === "in_review") return "in_review";
  return deliverable.status === "approved" ? "approved" : "draft";
}

function previewFor(revision: CreativeRevision | null): {
  label: string;
  detail: string;
} {
  if (!revision) return { label: "Preview em preparação", detail: "Sem revisão disponível" };
  const blueprint = revision.contentSnapshot.blueprint as unknown;
  if (!blueprint || typeof blueprint !== "object") {
    return { label: `Revisão ${revision.revisionNumber}`, detail: "Preview estruturado" };
  }
  const record = blueprint as Record<string, unknown>;
  if (Array.isArray(record.cards)) {
    const first = record.cards[0];
    const headline =
      first && typeof first === "object" && typeof (first as Record<string, unknown>).headline === "string"
        ? String((first as Record<string, unknown>).headline)
        : "Carrossel do imóvel";
    return { label: headline, detail: `${record.cards.length} artes no carrossel` };
  }
  if (Array.isArray(record.scenes)) {
    return { label: "Video tour do imóvel", detail: `${record.scenes.length} cenas preparadas` };
  }
  return { label: `Revisão ${revision.revisionNumber}`, detail: "Preview estruturado" };
}

function buildPropertyAsset(
  workspace: CreativeWorkspace,
  deliverable: CreativeDeliverable,
  revision: CreativeRevision | null,
): PropertyAsset {
  const physicalAssets = workspace.assets.filter(
    (asset) =>
      asset.propertyId === deliverable.propertyId &&
      asset.deliverableId === deliverable.id &&
      (!revision || asset.revisionId === revision.id),
  );
  const published = physicalAssets.some((asset) => asset.publicationState === "published");
  const finalAssetCount = physicalAssets.filter(
    (asset) =>
      asset.assetKind === "final_render" &&
      asset.storageState === "promoted" &&
      ["eligible", "published"].includes(asset.publicationState),
  ).length;
  const status = operationalStatus(deliverable, revision, published);
  const preview = previewFor(revision);
  const isVideo = deliverable.deliverableType === "video_tour";

  return {
    id: revision?.id ?? deliverable.id,
    runId: workspace.request?.id ?? deliverable.requestId,
    propertyId: deliverable.propertyId,
    deliverableId: deliverable.id,
    revisionId: revision?.id ?? null,
    title: isVideo ? "Video tour" : "Carrossel",
    category: isVideo ? "video_tour" : "static_art",
    format: deliverable.deliverableType,
    status,
    productionPath: isVideo ? "video_tour_provider" : "static_template_provider",
    previewLabel: preview.label,
    previewDetail: preview.detail,
    sourceAssetIds: physicalAssets.map((asset) => asset.id),
    finalAssetCount,
    eligibleUsageChannels:
      status === "approved" ? APPROVED_USAGE_CHANNELS : [],
  };
}

export function derivePropertyAssets(workspace: CreativeWorkspace): readonly PropertyAsset[] {
  return workspace.deliverables.flatMap((deliverable) => {
    const revisions = workspace.revisions
      .filter((revision) => revision.deliverableId === deliverable.id)
      .sort((left, right) => right.revisionNumber - left.revisionNumber);

    if (!revisions.length) return [buildPropertyAsset(workspace, deliverable, null)];
    return revisions.map((revision) => buildPropertyAsset(workspace, deliverable, revision));
  });
}
