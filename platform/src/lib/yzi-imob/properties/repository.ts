// YZI IMOB - Property Core repository (server-side, tenant-scoped, RLS-backed).
//
// Uses the request Supabase session client only. No service role. Private exact
// location is never selected directly; it is accessed only through governed RPCs.

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapPropertyDescriptionRevisionRow,
  mapPropertyPrivateLocationRow,
  mapPropertyProximityRow,
  mapPropertyRow,
  type PropertyDescriptionRevisionRow,
  type PropertyPrivateLocationRow,
  type PropertyProximityRow,
  type PropertyRow,
} from "./mapper";
import { buildPropertyPersistencePayload } from "./persistence";
import type {
  Property,
  PropertyDescriptionRevision,
  PropertyPrivateLocation,
  PropertyProximity,
} from "./types";
import type {
  ValidatedCreateProperty,
  ValidatedCreatePropertyDescriptionRevision,
  ValidatedCreatePropertyProximity,
  ValidatedPropertyPrivateLocation,
  ValidatedUpdateProperty,
} from "./validation";

const PROPERTY_COLUMNS = [
  "id",
  "tenant_id",
  "reference_code",
  "title",
  "property_type",
  "transaction_type",
  "status",
  "city",
  "neighborhood",
  "price",
  "description",
  "attributes",
  "stage",
  "availability_status",
  "bedrooms",
  "suites",
  "bathrooms",
  "parking_spaces",
  "private_area",
  "total_area",
  "floor",
  "solar_orientation",
  "furnished_status",
  "condominium_fee",
  "iptu_value",
  "original_description",
  "optimized_description",
  "short_summary",
  "editorial_status",
  "created_by_user_id",
  "property_features",
  "condominium_amenities",
  "surroundings",
  "commercial_context",
  "created_at",
  "updated_at",
].join(", ");

const PROXIMITY_COLUMNS =
  "id, tenant_id, property_id, place_type, label, distance_value, distance_unit, travel_mode, estimated_minutes, is_confirmed, source, created_at, updated_at";

const DESCRIPTION_REVISION_COLUMNS =
  "id, tenant_id, property_id, source_revision_id, original_text, suggested_text, status, provider, model, requested_by_user_id, accepted_by_user_id, created_at, accepted_at";

export type PropertyRepositoryError =
  | "not_found"
  | "insert_failed"
  | "update_failed"
  | "list_failed"
  | "rpc_failed"
  | "private_location_unavailable";

export type PropertyRepositoryResult<T> =
  | { status: "ok"; value: T }
  | { status: "error"; code: PropertyRepositoryError; detail?: string };

export type PropertyWorkspaceData = {
  property: Property;
  proximities: readonly PropertyProximity[];
  privateLocation: PropertyPrivateLocation | null;
  privateLocationError: string | null;
  descriptionRevisions: readonly PropertyDescriptionRevision[];
};

export async function getPropertyById(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
): Promise<PropertyRepositoryResult<Property>> {
  const { data, error } = await supabase
    .from("yzi_imob_properties")
    .select(PROPERTY_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("id", propertyId)
    .maybeSingle();

  if (error) return { status: "error", code: "not_found", detail: error.message };
  if (!data) return { status: "error", code: "not_found" };
  return { status: "ok", value: mapPropertyRow(data as unknown as PropertyRow) };
}

export type ListPropertiesOptions = {
  status?: string;
  limit?: number;
  offset?: number;
};

const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 200;

export async function listProperties(
  supabase: SupabaseClient,
  tenantId: string,
  options: ListPropertiesOptions = {},
): Promise<PropertyRepositoryResult<{ items: readonly Property[]; total: number }>> {
  const limit = Math.min(options.limit ?? DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
  const offset = options.offset ?? 0;

  let query = supabase
    .from("yzi_imob_properties")
    .select(PROPERTY_COLUMNS, { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.status) query = query.eq("status", options.status);

  const { data, error, count } = await query;
  if (error) return { status: "error", code: "list_failed", detail: error.message };

  return {
    status: "ok",
    value: {
      items: ((data as unknown as PropertyRow[] | null) ?? []).map(mapPropertyRow),
      total: count ?? 0,
    },
  };
}

export async function createProperty(
  supabase: SupabaseClient,
  tenantId: string,
  userId: string,
  input: ValidatedCreateProperty,
): Promise<PropertyRepositoryResult<Property>> {
  const { data, error } = await supabase
    .from("yzi_imob_properties")
    .insert({
      ...buildPropertyPersistencePayload(tenantId, input),
      created_by_user_id: userId,
    })
    .select(PROPERTY_COLUMNS)
    .single();

  if (error || !data) return { status: "error", code: "insert_failed", detail: error?.message };
  return { status: "ok", value: mapPropertyRow(data as unknown as PropertyRow) };
}

export async function updateProperty(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
  input: ValidatedUpdateProperty,
): Promise<PropertyRepositoryResult<Property>> {
  const patch: Record<string, unknown> = {};
  if (input.referenceCode !== undefined) patch.reference_code = input.referenceCode;
  if (input.title !== undefined) patch.title = input.title;
  if (input.propertyType !== undefined) patch.property_type = input.propertyType;
  if (input.transactionType !== undefined) patch.transaction_type = input.transactionType;
  if (input.status !== undefined) patch.status = input.status;
  if (input.city !== undefined) patch.city = input.city;
  if (input.neighborhood !== undefined) patch.neighborhood = input.neighborhood;
  if (input.price !== undefined) patch.price = input.price;
  if (input.description !== undefined) patch.description = input.description;
  if (input.attributes !== undefined) patch.attributes = input.attributes;
  if (input.stage !== undefined) patch.stage = input.stage;
  if (input.availabilityStatus !== undefined) patch.availability_status = input.availabilityStatus;
  if (input.bedrooms !== undefined) patch.bedrooms = input.bedrooms;
  if (input.suites !== undefined) patch.suites = input.suites;
  if (input.bathrooms !== undefined) patch.bathrooms = input.bathrooms;
  if (input.parkingSpaces !== undefined) patch.parking_spaces = input.parkingSpaces;
  if (input.privateArea !== undefined) patch.private_area = input.privateArea;
  if (input.totalArea !== undefined) patch.total_area = input.totalArea;
  if (input.floor !== undefined) patch.floor = input.floor;
  if (input.solarOrientation !== undefined) patch.solar_orientation = input.solarOrientation;
  if (input.furnishedStatus !== undefined) patch.furnished_status = input.furnishedStatus;
  if (input.condominiumFee !== undefined) patch.condominium_fee = input.condominiumFee;
  if (input.iptuValue !== undefined) patch.iptu_value = input.iptuValue;
  if (input.originalDescription !== undefined) patch.original_description = input.originalDescription;
  if (input.optimizedDescription !== undefined) patch.optimized_description = input.optimizedDescription;
  if (input.shortSummary !== undefined) patch.short_summary = input.shortSummary;
  if (input.editorialStatus !== undefined) patch.editorial_status = input.editorialStatus;
  if (input.propertyFeatures !== undefined) patch.property_features = input.propertyFeatures;
  if (input.condominiumAmenities !== undefined)
    patch.condominium_amenities = input.condominiumAmenities;
  if (input.surroundings !== undefined) patch.surroundings = input.surroundings;
  if (input.commercialContext !== undefined) patch.commercial_context = input.commercialContext;

  const { data, error } = await supabase
    .from("yzi_imob_properties")
    .update(patch)
    .eq("tenant_id", tenantId)
    .eq("id", propertyId)
    .select(PROPERTY_COLUMNS)
    .maybeSingle();

  if (error) return { status: "error", code: "update_failed", detail: error.message };
  if (!data) return { status: "error", code: "not_found" };
  return { status: "ok", value: mapPropertyRow(data as unknown as PropertyRow) };
}

export async function listPropertyProximities(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
): Promise<PropertyRepositoryResult<readonly PropertyProximity[]>> {
  const { data, error } = await supabase
    .from("yzi_imob_property_proximities")
    .select(PROXIMITY_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error) return { status: "error", code: "list_failed", detail: error.message };
  return { status: "ok", value: (data as PropertyProximityRow[] | null ?? []).map(mapPropertyProximityRow) };
}

export async function createPropertyProximity(
  supabase: SupabaseClient,
  tenantId: string,
  input: ValidatedCreatePropertyProximity,
): Promise<PropertyRepositoryResult<PropertyProximity>> {
  const { data, error } = await supabase
    .from("yzi_imob_property_proximities")
    .insert({
      tenant_id: tenantId,
      property_id: input.propertyId,
      place_type: input.placeType,
      label: input.label,
      distance_value: input.distanceValue,
      distance_unit: input.distanceUnit,
      travel_mode: input.travelMode,
      estimated_minutes: input.estimatedMinutes,
      is_confirmed: input.isConfirmed,
      source: input.source,
    })
    .select(PROXIMITY_COLUMNS)
    .single();

  if (error || !data) return { status: "error", code: "insert_failed", detail: error?.message };
  return { status: "ok", value: mapPropertyProximityRow(data as PropertyProximityRow) };
}

export async function getPropertyPrivateLocation(
  supabase: SupabaseClient,
  propertyId: string,
): Promise<PropertyRepositoryResult<PropertyPrivateLocation | null>> {
  const { data, error } = await supabase.rpc("get_yzi_imob_property_private_location", {
    p_property_id: propertyId,
  });

  if (error) return { status: "error", code: "private_location_unavailable", detail: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  return { status: "ok", value: row ? mapPropertyPrivateLocationRow(row as PropertyPrivateLocationRow) : null };
}

export async function upsertPropertyPrivateLocation(
  supabase: SupabaseClient,
  input: ValidatedPropertyPrivateLocation,
): Promise<PropertyRepositoryResult<{ propertyId: string }>> {
  const { data, error } = await supabase.rpc("upsert_yzi_imob_property_private_location", {
    p_property_id: input.propertyId,
    p_postal_code: input.postalCode,
    p_street: input.street,
    p_number: input.number,
    p_complement: input.complement,
    p_condominium_name: input.condominiumName,
    p_block: input.block,
    p_unit: input.unit,
    p_latitude: input.latitude,
    p_longitude: input.longitude,
    p_access_instructions: input.accessInstructions,
    p_meeting_point: input.meetingPoint,
  });

  if (error) return { status: "error", code: "rpc_failed", detail: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  return { status: "ok", value: { propertyId: String(row?.returned_property_id ?? input.propertyId) } };
}

export async function listPropertyDescriptionRevisions(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
): Promise<PropertyRepositoryResult<readonly PropertyDescriptionRevision[]>> {
  const { data, error } = await supabase
    .from("yzi_imob_property_description_revisions")
    .select(DESCRIPTION_REVISION_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error) return { status: "error", code: "list_failed", detail: error.message };
  return {
    status: "ok",
    value: (data as PropertyDescriptionRevisionRow[] | null ?? []).map(mapPropertyDescriptionRevisionRow),
  };
}

export async function createPropertyDescriptionRevision(
  supabase: SupabaseClient,
  tenantId: string,
  userId: string,
  input: ValidatedCreatePropertyDescriptionRevision,
): Promise<PropertyRepositoryResult<PropertyDescriptionRevision>> {
  const { data, error } = await supabase
    .from("yzi_imob_property_description_revisions")
    .insert({
      tenant_id: tenantId,
      property_id: input.propertyId,
      original_text: input.originalText,
      suggested_text: input.suggestedText,
      status: "proposed",
      requested_by_user_id: userId,
      provider: input.provider,
      model: input.model,
    })
    .select(DESCRIPTION_REVISION_COLUMNS)
    .single();

  if (error || !data) return { status: "error", code: "insert_failed", detail: error?.message };
  return { status: "ok", value: mapPropertyDescriptionRevisionRow(data as PropertyDescriptionRevisionRow) };
}

export async function acceptPropertyDescriptionRevision(
  supabase: SupabaseClient,
  sourceRevisionId: string,
): Promise<PropertyRepositoryResult<{ propertyId: string; revisionId: string }>> {
  const { data, error } = await supabase.rpc("accept_yzi_imob_property_description_revision", {
    p_source_revision_id: sourceRevisionId,
  });

  if (error) return { status: "error", code: "rpc_failed", detail: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  return {
    status: "ok",
    value: {
      propertyId: String(row?.property_id ?? ""),
      revisionId: String(row?.accepted_revision_id ?? ""),
    },
  };
}

export async function rejectPropertyDescriptionRevision(
  supabase: SupabaseClient,
  sourceRevisionId: string,
): Promise<PropertyRepositoryResult<{ propertyId: string; revisionId: string }>> {
  const { data, error } = await supabase.rpc("reject_yzi_imob_property_description_revision", {
    p_source_revision_id: sourceRevisionId,
  });

  if (error) return { status: "error", code: "rpc_failed", detail: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  return {
    status: "ok",
    value: {
      propertyId: String(row?.property_id ?? ""),
      revisionId: String(row?.rejected_revision_id ?? ""),
    },
  };
}

export async function getPropertyWorkspaceData(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
): Promise<PropertyRepositoryResult<PropertyWorkspaceData>> {
  const propertyResult = await getPropertyById(supabase, tenantId, propertyId);
  if (propertyResult.status === "error") return propertyResult;

  const [proximitiesResult, privateLocationResult, revisionsResult] = await Promise.all([
    listPropertyProximities(supabase, tenantId, propertyId),
    getPropertyPrivateLocation(supabase, propertyId),
    listPropertyDescriptionRevisions(supabase, tenantId, propertyId),
  ]);

  return {
    status: "ok",
    value: {
      property: propertyResult.value,
      proximities: proximitiesResult.status === "ok" ? proximitiesResult.value : [],
      privateLocation: privateLocationResult.status === "ok" ? privateLocationResult.value : null,
      privateLocationError:
        privateLocationResult.status === "error" ? privateLocationResult.detail ?? privateLocationResult.code : null,
      descriptionRevisions: revisionsResult.status === "ok" ? revisionsResult.value : [],
    },
  };
}
