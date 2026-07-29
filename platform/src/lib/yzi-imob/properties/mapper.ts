// YZI IMOB - Property Core row <-> domain mapping.

import { validatePropertyAttributes, type PropertyAttributes } from "./attributes";
import type {
  JsonArray,
  JsonObject,
  Property,
  PropertyDescriptionRevision,
  PropertyPrivateLocation,
  PropertyProximity,
} from "./types";

export type PropertyRow = {
  id: string;
  tenant_id: string;
  reference_code: string | null;
  title: string;
  property_type: string | null;
  transaction_type: string | null;
  status: string;
  city: string | null;
  neighborhood: string | null;
  price: number | string | null;
  description: string | null;
  attributes: unknown;
  stage?: string | null;
  availability_status?: string | null;
  bedrooms?: number | string | null;
  suites?: number | string | null;
  bathrooms?: number | string | null;
  parking_spaces?: number | string | null;
  private_area?: number | string | null;
  total_area?: number | string | null;
  floor?: number | string | null;
  solar_orientation?: string | null;
  furnished_status?: string | null;
  condominium_fee?: number | string | null;
  iptu_value?: number | string | null;
  original_description?: string | null;
  optimized_description?: string | null;
  short_summary?: string | null;
  editorial_status?: string | null;
  created_by_user_id?: string | null;
  property_features?: unknown;
  condominium_amenities?: unknown;
  surroundings?: unknown;
  commercial_context?: unknown;
  created_at: string;
  updated_at: string;
};

export type PropertyProximityRow = {
  id: string;
  tenant_id: string;
  property_id: string;
  place_type: string;
  label: string;
  distance_value: number | string | null;
  distance_unit: string | null;
  travel_mode: string | null;
  estimated_minutes: number | string | null;
  is_confirmed: boolean;
  source: string;
  created_at: string;
  updated_at: string;
};

export type PropertyPrivateLocationRow = {
  property_id: string;
  postal_code: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  condominium_name: string | null;
  block: string | null;
  unit: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  access_instructions: string | null;
  meeting_point: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyDescriptionRevisionRow = {
  id: string;
  tenant_id: string;
  property_id: string;
  source_revision_id: string | null;
  original_text: string;
  suggested_text: string;
  status: string;
  provider: string | null;
  model: string | null;
  requested_by_user_id: string | null;
  accepted_by_user_id: string | null;
  created_at: string;
  accepted_at: string | null;
};

function toAttributes(raw: unknown): PropertyAttributes {
  const result = validatePropertyAttributes(raw);
  return result.valid ? result.attributes : {};
}

export function toNumber(raw: number | string | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  const numeric = typeof raw === "string" ? Number(raw) : raw;
  return Number.isFinite(numeric) ? numeric : null;
}

function toJsonArray(raw: unknown): JsonArray {
  return Array.isArray(raw) ? raw : [];
}

function toJsonObject(raw: unknown): JsonObject {
  return raw !== null && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as JsonObject)
    : {};
}

export function mapPropertyRow(row: PropertyRow): Property {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    referenceCode: row.reference_code,
    title: row.title,
    propertyType: row.property_type,
    transactionType: row.transaction_type,
    status: row.status,
    city: row.city,
    neighborhood: row.neighborhood,
    price: toNumber(row.price),
    description: row.description,
    attributes: toAttributes(row.attributes),
    stage: (row.stage ?? null) as Property["stage"],
    availabilityStatus: (row.availability_status ?? null) as Property["availabilityStatus"],
    bedrooms: toNumber(row.bedrooms),
    suites: toNumber(row.suites),
    bathrooms: toNumber(row.bathrooms),
    parkingSpaces: toNumber(row.parking_spaces),
    privateArea: toNumber(row.private_area),
    totalArea: toNumber(row.total_area),
    floor: toNumber(row.floor),
    solarOrientation: (row.solar_orientation ?? null) as Property["solarOrientation"],
    furnishedStatus: (row.furnished_status ?? null) as Property["furnishedStatus"],
    condominiumFee: toNumber(row.condominium_fee),
    iptuValue: toNumber(row.iptu_value),
    originalDescription: row.original_description ?? null,
    optimizedDescription: row.optimized_description ?? null,
    shortSummary: row.short_summary ?? null,
    editorialStatus: (row.editorial_status ?? null) as Property["editorialStatus"],
    createdByUserId: row.created_by_user_id ?? null,
    propertyFeatures: toJsonArray(row.property_features),
    condominiumAmenities: toJsonArray(row.condominium_amenities),
    surroundings: toJsonArray(row.surroundings),
    commercialContext: toJsonObject(row.commercial_context),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPropertyProximityRow(row: PropertyProximityRow): PropertyProximity {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    propertyId: row.property_id,
    placeType: row.place_type,
    label: row.label,
    distanceValue: toNumber(row.distance_value),
    distanceUnit: row.distance_unit as PropertyProximity["distanceUnit"],
    travelMode: row.travel_mode as PropertyProximity["travelMode"],
    estimatedMinutes: toNumber(row.estimated_minutes),
    isConfirmed: row.is_confirmed,
    source: row.source as PropertyProximity["source"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPropertyPrivateLocationRow(
  row: PropertyPrivateLocationRow,
): PropertyPrivateLocation {
  return {
    propertyId: row.property_id,
    postalCode: row.postal_code,
    street: row.street,
    number: row.number,
    complement: row.complement,
    condominiumName: row.condominium_name,
    block: row.block,
    unit: row.unit,
    latitude: toNumber(row.latitude),
    longitude: toNumber(row.longitude),
    accessInstructions: row.access_instructions,
    meetingPoint: row.meeting_point,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPropertyDescriptionRevisionRow(
  row: PropertyDescriptionRevisionRow,
): PropertyDescriptionRevision {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    propertyId: row.property_id,
    sourceRevisionId: row.source_revision_id,
    originalText: row.original_text,
    suggestedText: row.suggested_text,
    status: row.status as PropertyDescriptionRevision["status"],
    provider: row.provider,
    model: row.model,
    requestedByUserId: row.requested_by_user_id,
    acceptedByUserId: row.accepted_by_user_id,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
  };
}
