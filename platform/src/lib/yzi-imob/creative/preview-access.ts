import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getTemporaryCreativeAssetAccess,
  SupabaseCreativeStorageGateway,
} from "./storage-repository";
import type { CreativeAsset } from "./types";

export async function loadCreativePreviewUrls(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
  assets: readonly CreativeAsset[],
): Promise<Readonly<Record<string, string>>> {
  const gateway = new SupabaseCreativeStorageGateway(supabase);
  const candidates = assets.filter(
    (asset) =>
      asset.storageBucket === "yzi-imob-private" &&
      asset.storageState === "stored" &&
      asset.publicationState === "not_eligible" &&
      (asset.assetKind === "rendered_preview" || asset.assetKind === "thumbnail"),
  );
  const entries = await Promise.all(
    candidates.map(async (asset) => {
      try {
        const access = await getTemporaryCreativeAssetAccess({
          supabase,
          gateway,
          tenantId,
          propertyId,
          assetId: asset.id,
          expiresInSeconds: 300,
        });
        return [asset.id, access.temporaryUrl] as const;
      } catch {
        return null;
      }
    }),
  );
  return Object.fromEntries(entries.filter((entry) => entry !== null));
}
