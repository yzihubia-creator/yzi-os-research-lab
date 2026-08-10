// YZI IMOB - Property Domain Contract (Property Core V1).
//
// Mirrors the real Supabase schema applied for public.yzi_imob_properties and
// related tables. Private exact address data is intentionally represented as a
// separate type and must only be read/written through governed RPCs.

import type { PropertyAttributes } from "./attributes.ts";
import type {
  PropertyCommercialStage,
  PropertyPriceQualifier,
  PropertyRecordKind,
  PropertyTransaction,
  PropertyType,
} from "./contract.ts";

export const PROPERTY_STATUS_VALUES = [
  "draft",
  "active",
  "paused",
  "sold",
  "rented",
  "archived",
  "em_captacao",
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUS_VALUES)[number];

// New writes use lifecycle-only statuses. sold/rented live in availability;
// the broader list above remains accepted for historical rows.
export const PROPERTY_OPERATIONAL_STATUS_VALUES = ["draft", "active", "paused", "archived"] as const;

export function isPropertyStatus(value: string): value is PropertyStatus {
  return (PROPERTY_STATUS_VALUES as readonly string[]).includes(value);
}

export const PROPERTY_STAGE_VALUES = ["draft", "intake", "review", "published", "archived"] as const;
export type PropertyStage = (typeof PROPERTY_STAGE_VALUES)[number];

export const PROPERTY_AVAILABILITY_STATUS_VALUES = [
  "available",
  "reserved",
  "sold",
  "rented",
  "unavailable",
] as const;
export type PropertyAvailabilityStatus = (typeof PROPERTY_AVAILABILITY_STATUS_VALUES)[number];

export const PROPERTY_EDITORIAL_STATUS_VALUES = [
  "raw",
  "pending_review",
  "approved",
  "rejected",
] as const;
export type PropertyEditorialStatus = (typeof PROPERTY_EDITORIAL_STATUS_VALUES)[number];

export const PROPERTY_SOLAR_ORIENTATION_VALUES = [
  "north",
  "south",
  "east",
  "west",
  "northeast",
  "northwest",
  "southeast",
  "southwest",
] as const;
export type PropertySolarOrientation = (typeof PROPERTY_SOLAR_ORIENTATION_VALUES)[number];

export const PROPERTY_FURNISHED_STATUS_VALUES = [
  "unfurnished",
  "semi_furnished",
  "furnished",
] as const;
export type PropertyFurnishedStatus = (typeof PROPERTY_FURNISHED_STATUS_VALUES)[number];

export const PROPERTY_PROXIMITY_DISTANCE_UNIT_VALUES = ["m", "km"] as const;
export type PropertyProximityDistanceUnit = (typeof PROPERTY_PROXIMITY_DISTANCE_UNIT_VALUES)[number];

export const PROPERTY_PROXIMITY_TRAVEL_MODE_VALUES = ["walk", "drive", "transit", "bike"] as const;
export type PropertyProximityTravelMode = (typeof PROPERTY_PROXIMITY_TRAVEL_MODE_VALUES)[number];

export const PROPERTY_PROXIMITY_SOURCE_VALUES = [
  "manual",
  "extracted_from_text",
  "imported",
  "external_api",
] as const;
export type PropertyProximitySource = (typeof PROPERTY_PROXIMITY_SOURCE_VALUES)[number];

export const PROPERTY_DESCRIPTION_REVISION_STATUS_VALUES = [
  "proposed",
  "accepted",
  "rejected",
] as const;
export type PropertyDescriptionRevisionStatus =
  (typeof PROPERTY_DESCRIPTION_REVISION_STATUS_VALUES)[number];

export type JsonObject = Record<string, unknown>;
export type JsonArray = unknown[];

export type PropertyCommercialContext = JsonObject & {
  payment_conditions?: string;
  occupancy_status?: string;
  commercial_notes?: string;
  record_kind?: PropertyRecordKind;
  commercial_stage?: PropertyCommercialStage;
  price_qualifier?: PropertyPriceQualifier;
  price_policy?: "on_request";
  priceHidden?: boolean;
};

export function isOneOf<const T extends readonly string[]>(
  values: T,
  value: string | null | undefined,
): value is T[number] {
  return typeof value === "string" && values.includes(value);
}

export type Property = {
  id: string;
  tenantId: string;
  referenceCode: string | null;
  title: string;
  propertyType: PropertyType | string | null;
  transactionType: PropertyTransaction | string | null;
  status: PropertyStatus | string;
  city: string | null;
  neighborhood: string | null;
  price: number | null;
  description: string | null;
  attributes: PropertyAttributes;
  stage: PropertyStage | null;
  availabilityStatus: PropertyAvailabilityStatus | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
  privateArea: number | null;
  totalArea: number | null;
  floor: number | null;
  solarOrientation: PropertySolarOrientation | null;
  furnishedStatus: PropertyFurnishedStatus | null;
  condominiumFee: number | null;
  iptuValue: number | null;
  originalDescription: string | null;
  optimizedDescription: string | null;
  shortSummary: string | null;
  editorialStatus: PropertyEditorialStatus | null;
  createdByUserId: string | null;
  propertyFeatures: JsonArray;
  condominiumAmenities: JsonArray;
  surroundings: JsonArray;
  commercialContext: PropertyCommercialContext;
  createdAt: string;
  updatedAt: string;
};

export type CreatePropertyInput = {
  referenceCode?: string | null;
  title: string;
  propertyType?: string | null;
  transactionType?: string | null;
  status: string;
  city?: string | null;
  neighborhood?: string | null;
  price?: number | null;
  description?: string | null;
  attributes?: unknown;
  stage?: string | null;
  availabilityStatus?: string | null;
  bedrooms?: number | null;
  suites?: number | null;
  bathrooms?: number | null;
  parkingSpaces?: number | null;
  privateArea?: number | null;
  totalArea?: number | null;
  floor?: number | null;
  solarOrientation?: string | null;
  furnishedStatus?: string | null;
  condominiumFee?: number | null;
  iptuValue?: number | null;
  originalDescription?: string | null;
  optimizedDescription?: string | null;
  shortSummary?: string | null;
  editorialStatus?: string | null;
  propertyFeatures?: unknown;
  condominiumAmenities?: unknown;
  surroundings?: unknown;
  commercialContext?: unknown;
};

export type UpdatePropertyInput = Partial<CreatePropertyInput>;

export type PropertyProximity = {
  id: string;
  tenantId: string;
  propertyId: string;
  placeType: string;
  label: string;
  distanceValue: number | null;
  distanceUnit: PropertyProximityDistanceUnit | null;
  travelMode: PropertyProximityTravelMode | null;
  estimatedMinutes: number | null;
  isConfirmed: boolean;
  source: PropertyProximitySource;
  createdAt: string;
  updatedAt: string;
};

export type CreatePropertyProximityInput = {
  propertyId: string;
  placeType: string;
  label: string;
  distanceValue?: number | null;
  distanceUnit?: string | null;
  travelMode?: string | null;
  estimatedMinutes?: number | null;
  isConfirmed?: boolean;
  source?: string | null;
};

export type PropertyPrivateLocation = {
  propertyId: string;
  postalCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  condominiumName: string | null;
  block: string | null;
  unit: string | null;
  latitude: number | null;
  longitude: number | null;
  accessInstructions: string | null;
  meetingPoint: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertPropertyPrivateLocationInput = {
  propertyId: string;
  postalCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  condominiumName?: string | null;
  block?: string | null;
  unit?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  accessInstructions?: string | null;
  meetingPoint?: string | null;
};

export type PropertyDescriptionRevision = {
  id: string;
  tenantId: string;
  propertyId: string;
  sourceRevisionId: string | null;
  originalText: string;
  suggestedText: string;
  status: PropertyDescriptionRevisionStatus;
  provider: string | null;
  model: string | null;
  requestedByUserId: string | null;
  acceptedByUserId: string | null;
  createdAt: string;
  acceptedAt: string | null;
};

export type CreatePropertyDescriptionRevisionInput = {
  propertyId: string;
  originalText: string;
  suggestedText: string;
  provider?: string | null;
  model?: string | null;
};
