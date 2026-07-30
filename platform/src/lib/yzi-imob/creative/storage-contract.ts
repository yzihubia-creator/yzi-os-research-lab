export const CREATIVE_PRIVATE_BUCKET = "yzi-imob-private" as const;
export const CREATIVE_PUBLIC_BUCKET = "yzi-imob-public" as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ASSET_PATTERN = /^[a-z0-9][a-z0-9._-]{0,119}$/;

export function buildCreativeAssetPath(input: {
  tenantId: string;
  propertyId: string;
  deliverableId: string;
  revisionId: string;
  assetName: string;
}): string {
  for (const value of [
    input.tenantId,
    input.propertyId,
    input.deliverableId,
    input.revisionId,
  ]) {
    if (!UUID_PATTERN.test(value)) throw new Error("invalid_creative_asset_identity");
  }
  if (!ASSET_PATTERN.test(input.assetName) || input.assetName.includes("..")) {
    throw new Error("invalid_creative_asset_name");
  }
  return [
    "tenants",
    input.tenantId,
    "properties",
    input.propertyId,
    "creative",
    input.deliverableId,
    "revisions",
    input.revisionId,
    input.assetName,
  ].join("/");
}

export function assertGovernedAssetReference(input: {
  assetTenantId: string;
  assetPropertyId: string;
  assetDeliverableId: string;
  assetRevisionId: string;
  tenantId: string;
  propertyId: string;
  deliverableId: string;
  revisionId: string;
}): void {
  if (
    input.assetTenantId !== input.tenantId ||
    input.assetPropertyId !== input.propertyId ||
    input.assetDeliverableId !== input.deliverableId ||
    input.assetRevisionId !== input.revisionId
  ) {
    throw new Error("creative_asset_scope_mismatch");
  }
}
