import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildCreativeAssetPath,
  CREATIVE_PRIVATE_BUCKET,
  CREATIVE_PUBLIC_BUCKET,
} from "./storage-contract.ts";

type StoredAssetKind = "rendered_preview" | "thumbnail";

export interface CreativeStorageGateway {
  storePrivate(input: {
    bucket: typeof CREATIVE_PRIVATE_BUCKET;
    objectPath: string;
    bytes: Uint8Array;
    contentType: "image/png" | "video/mp4";
    overwrite: false;
  }): Promise<void>;
  createTemporaryPrivateAccess(input: {
    bucket: typeof CREATIVE_PRIVATE_BUCKET;
    objectPath: string;
    expiresInSeconds: number;
  }): Promise<string>;
  copyForPromotion(input: {
    sourceBucket: typeof CREATIVE_PRIVATE_BUCKET;
    destinationBucket: typeof CREATIVE_PUBLIC_BUCKET;
    objectPath: string;
    overwrite: false;
  }): Promise<void>;
}

export class SupabaseCreativeStorageGateway implements CreativeStorageGateway {
  private readonly serverClient: SupabaseClient;

  constructor(serverClient: SupabaseClient) {
    this.serverClient = serverClient;
  }

  async storePrivate(input: Parameters<CreativeStorageGateway["storePrivate"]>[0]) {
    const result = await this.serverClient.storage
      .from(input.bucket)
      .upload(input.objectPath, input.bytes, {
        contentType: input.contentType,
        upsert: input.overwrite,
      });
    if (result.error) throw new Error("creative_private_store_failed");
  }

  async createTemporaryPrivateAccess(
    input: Parameters<CreativeStorageGateway["createTemporaryPrivateAccess"]>[0],
  ) {
    const result = await this.serverClient.storage
      .from(input.bucket)
      .createSignedUrl(input.objectPath, input.expiresInSeconds);
    if (result.error || !result.data.signedUrl) {
      throw new Error("creative_private_access_failed");
    }
    return result.data.signedUrl;
  }

  async copyForPromotion(
    input: Parameters<CreativeStorageGateway["copyForPromotion"]>[0],
  ) {
    const result = await this.serverClient.storage
      .from(input.sourceBucket)
      .copy(input.objectPath, input.objectPath, {
        destinationBucket: input.destinationBucket,
      });
    if (result.error) throw new Error("creative_promotion_copy_failed");
  }
}

type RevisionScope = {
  id: string;
  tenant_id: string;
  property_id: string;
  request_id: string;
  deliverable_id: string;
  revision_number: number;
  yzi_imob_creative_deliverables:
    | {
      deliverable_type: "carousel" | "video_tour";
      current_revision_id: string;
      approved_revision_id: string | null;
      publication_eligible: boolean;
    }
    | readonly {
        deliverable_type: "carousel" | "video_tour";
        current_revision_id: string;
        approved_revision_id: string | null;
        publication_eligible: boolean;
      }[];
};

function deliverable(scope: RevisionScope) {
  return Array.isArray(scope.yzi_imob_creative_deliverables)
    ? scope.yzi_imob_creative_deliverables[0]
    : scope.yzi_imob_creative_deliverables;
}

function filenameFor(
  deliverableType: "carousel" | "video_tour",
  assetKind: StoredAssetKind,
  position: number | null,
): string {
  if (deliverableType === "carousel" && assetKind === "rendered_preview") {
    if (!Number.isInteger(position) || position === null || position < 1 || position > 7) {
      throw new Error("carousel_render_position_required");
    }
    return `card-${String(position).padStart(2, "0")}.png`;
  }
  if (deliverableType === "video_tour" && assetKind === "rendered_preview" && position === null) {
    return "video-preview.mp4";
  }
  if (assetKind === "thumbnail" && position === null) return "thumbnail.png";
  throw new Error("creative_asset_shape_invalid");
}

async function getRevisionScope(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
  revisionId: string,
): Promise<RevisionScope> {
  const result = await supabase
    .from("yzi_imob_creative_revisions")
    .select(
      "id,tenant_id,property_id,request_id,deliverable_id,revision_number,yzi_imob_creative_deliverables!inner(deliverable_type,current_revision_id,approved_revision_id,publication_eligible)",
    )
    .eq("id", revisionId)
    .eq("tenant_id", tenantId)
    .eq("property_id", propertyId)
    .single();
  if (result.error || !result.data) throw new Error("creative_revision_not_found");
  const scope = result.data as unknown as RevisionScope;
  if (deliverable(scope)?.current_revision_id !== revisionId) {
    throw new Error("creative_revision_not_current");
  }
  return scope;
}

export async function storeCreativeRenderedAsset(input: {
  supabase: SupabaseClient;
  gateway: CreativeStorageGateway;
  tenantId: string;
  propertyId: string;
  revisionId: string;
  assetKind: StoredAssetKind;
  position: number | null;
  bytes: Uint8Array;
  contentHash: string;
  metadata: Readonly<Record<string, unknown>>;
}): Promise<{ assetId: string }> {
  const scope = await getRevisionScope(
    input.supabase,
    input.tenantId,
    input.propertyId,
    input.revisionId,
  );
  const type = deliverable(scope)?.deliverable_type;
  if (!type) throw new Error("creative_deliverable_not_found");
  const filename = filenameFor(type, input.assetKind, input.position);
  const objectPath = buildCreativeAssetPath({
    tenantId: scope.tenant_id,
    propertyId: scope.property_id,
    deliverableId: scope.deliverable_id,
    revisionId: scope.id,
    assetName: filename,
  });
  await input.gateway.storePrivate({
    bucket: CREATIVE_PRIVATE_BUCKET,
    objectPath,
    bytes: input.bytes,
    contentType: filename.endsWith(".mp4") ? "video/mp4" : "image/png",
    overwrite: false,
  });
  const registered = await input.supabase.rpc("register_yzi_imob_creative_stored_asset", {
    p_revision_id: input.revisionId,
    p_asset_kind: input.assetKind,
    p_asset_position: input.position,
    p_content_hash: input.contentHash,
    p_metadata: input.metadata,
  });
  if (registered.error) throw new Error("creative_asset_registration_failed");
  const row = (Array.isArray(registered.data) ? registered.data[0] : registered.data) as
    | { asset_id?: string }
    | null;
  if (!row?.asset_id) throw new Error("creative_asset_registration_failed");
  return { assetId: row.asset_id };
}

export async function getTemporaryCreativeAssetAccess(input: {
  supabase: SupabaseClient;
  gateway: CreativeStorageGateway;
  tenantId: string;
  propertyId: string;
  assetId: string;
  expiresInSeconds?: number;
}): Promise<{ temporaryUrl: string; expiresInSeconds: number }> {
  const expiresInSeconds = input.expiresInSeconds ?? 120;
  if (expiresInSeconds < 30 || expiresInSeconds > 300) {
    throw new Error("creative_asset_access_window_invalid");
  }
  const result = await input.supabase
    .from("yzi_imob_creative_assets")
    .select("storage_bucket,object_path,storage_state,publication_state")
    .eq("id", input.assetId)
    .eq("tenant_id", input.tenantId)
    .eq("property_id", input.propertyId)
    .eq("storage_bucket", CREATIVE_PRIVATE_BUCKET)
    .eq("storage_state", "stored")
    .eq("publication_state", "not_eligible")
    .single();
  if (result.error || !result.data?.object_path) throw new Error("creative_private_asset_not_found");
  const temporaryUrl = await input.gateway.createTemporaryPrivateAccess({
    bucket: CREATIVE_PRIVATE_BUCKET,
    objectPath: result.data.object_path,
    expiresInSeconds,
  });
  return { temporaryUrl, expiresInSeconds };
}

export async function promoteApprovedCreativeRevision(input: {
  supabase: SupabaseClient;
  gateway: CreativeStorageGateway;
  tenantId: string;
  propertyId: string;
  revisionId: string;
}): Promise<{ promotedAssets: number }> {
  const scope = await getRevisionScope(
    input.supabase,
    input.tenantId,
    input.propertyId,
    input.revisionId,
  );
  if (deliverable(scope)?.approved_revision_id !== input.revisionId) {
    throw new Error("creative_current_approval_required");
  }
  if (deliverable(scope)?.publication_eligible) {
    const existing = await input.supabase
      .from("yzi_imob_creative_assets")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", input.tenantId)
      .eq("property_id", input.propertyId)
      .eq("revision_id", input.revisionId)
      .eq("asset_kind", "final_render")
      .eq("storage_state", "promoted")
      .eq("publication_state", "eligible");
    if (existing.error) throw new Error("creative_promoted_set_read_failed");
    return { promotedAssets: existing.count ?? 0 };
  }
  const assets = await input.supabase
    .from("yzi_imob_creative_assets")
    .select("object_path")
    .eq("tenant_id", input.tenantId)
    .eq("property_id", input.propertyId)
    .eq("revision_id", input.revisionId)
    .eq("asset_kind", "rendered_preview")
    .eq("storage_state", "stored")
    .eq("storage_bucket", CREATIVE_PRIVATE_BUCKET);
  if (assets.error) throw new Error("creative_render_set_read_failed");
  const expected = deliverable(scope)?.deliverable_type === "carousel" ? 7 : 1;
  if (assets.data.length !== expected || assets.data.some((asset) => !asset.object_path)) {
    throw new Error("creative_render_set_incomplete");
  }
  for (const asset of assets.data) {
    await input.gateway.copyForPromotion({
      sourceBucket: CREATIVE_PRIVATE_BUCKET,
      destinationBucket: CREATIVE_PUBLIC_BUCKET,
      objectPath: asset.object_path!,
      overwrite: false,
    });
  }
  const promoted = await input.supabase.rpc("finalize_yzi_imob_creative_asset_promotion", {
    p_revision_id: input.revisionId,
  });
  if (promoted.error) throw new Error("creative_asset_promotion_failed");
  const row = (Array.isArray(promoted.data) ? promoted.data[0] : promoted.data) as
    | { promoted_assets?: number }
    | null;
  return { promotedAssets: Number(row?.promoted_assets ?? 0) };
}
