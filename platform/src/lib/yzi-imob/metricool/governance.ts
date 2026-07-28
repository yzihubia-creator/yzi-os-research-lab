import {
  METRICOOL_NETWORK_VALUES,
  type MetricoolNetwork,
  type SocialPublicationAsset,
  type SocialPublicationFormat,
} from "./types.ts";

export type GovernedSocialPublicationInput = {
  tenantId: string;
  propertyTenantId: string;
  revisionTenantId: string;
  connectionTenantId: string;
  revisionStatus: string;
  connectionStatus: string;
  targetNetworks: readonly MetricoolNetwork[];
  targetProfileIds: readonly string[];
  allowlistedProfiles: readonly {
    id: string;
    network: MetricoolNetwork;
  }[];
  format: SocialPublicationFormat;
  caption: string;
  assets: readonly SocialPublicationAsset[];
  scheduledAt: string;
  now?: Date;
};

export type GovernedSocialPublicationValidation =
  | { valid: true }
  | {
      valid: false;
      code:
        | "cross_tenant"
        | "approved_revision_required"
        | "active_connection_required"
        | "invalid_targets"
        | "target_not_allowlisted"
        | "invalid_caption"
        | "invalid_media"
        | "future_schedule_required";
    };

export function validateGovernedSocialPublication(
  input: GovernedSocialPublicationInput,
): GovernedSocialPublicationValidation {
  if (
    new Set([
      input.tenantId,
      input.propertyTenantId,
      input.revisionTenantId,
      input.connectionTenantId,
    ]).size !== 1
  ) {
    return { valid: false, code: "cross_tenant" };
  }
  if (input.revisionStatus !== "approved") {
    return { valid: false, code: "approved_revision_required" };
  }
  if (!["active", "connected"].includes(input.connectionStatus)) {
    return { valid: false, code: "active_connection_required" };
  }
  if (
    input.targetNetworks.length < 1 ||
    input.targetNetworks.length > 2 ||
    input.targetNetworks.length !== input.targetProfileIds.length ||
    new Set(input.targetNetworks).size !== input.targetNetworks.length ||
    input.targetNetworks.some((network) => !METRICOOL_NETWORK_VALUES.includes(network))
  ) {
    return { valid: false, code: "invalid_targets" };
  }
  for (let index = 0; index < input.targetNetworks.length; index += 1) {
    const network = input.targetNetworks[index];
    const profileId = input.targetProfileIds[index];
    if (
      !profileId ||
      !input.allowlistedProfiles.some(
        (profile) => profile.id === profileId && profile.network === network,
      )
    ) {
      return { valid: false, code: "target_not_allowlisted" };
    }
  }
  if (input.caption.trim().length < 1 || input.caption.length > 2200) {
    return { valid: false, code: "invalid_caption" };
  }
  if (
    input.assets.length < 1 ||
    input.assets.length > 10 ||
    (input.format === "single_image" && input.assets.length !== 1) ||
    (input.format === "carousel" && (input.assets.length < 2 || input.assets.length > 10)) ||
    input.assets.some((asset) => !isSafePublicAsset(asset))
  ) {
    return { valid: false, code: "invalid_media" };
  }
  const now = input.now ?? new Date();
  if (
    !Number.isFinite(Date.parse(input.scheduledAt)) ||
    Date.parse(input.scheduledAt) < now.getTime() + 60_000
  ) {
    return { valid: false, code: "future_schedule_required" };
  }
  return { valid: true };
}
function isSafePublicAsset(asset: SocialPublicationAsset): boolean {
  if (!asset.mediaId || !Number.isInteger(asset.sortOrder) || asset.sortOrder < 0) return false;
  try {
    const url = new URL(asset.url);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !["localhost", "127.0.0.1", "::1"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}
