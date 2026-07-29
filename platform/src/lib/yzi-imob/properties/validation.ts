// YZI IMOB - Property Core validation.
//
// Pure validation only. Tenant is resolved by server actions/repositories and
// must never be accepted from client payloads.

import { validatePropertyAttributes, type PropertyAttributes } from "./attributes";
import {
  isOneOf,
  isPropertyStatus,
  PROPERTY_AVAILABILITY_STATUS_VALUES,
  PROPERTY_DESCRIPTION_REVISION_STATUS_VALUES,
  PROPERTY_EDITORIAL_STATUS_VALUES,
  PROPERTY_FURNISHED_STATUS_VALUES,
  PROPERTY_PROXIMITY_DISTANCE_UNIT_VALUES,
  PROPERTY_PROXIMITY_SOURCE_VALUES,
  PROPERTY_PROXIMITY_TRAVEL_MODE_VALUES,
  PROPERTY_SOLAR_ORIENTATION_VALUES,
  PROPERTY_STAGE_VALUES,
  type CreatePropertyDescriptionRevisionInput,
  type CreatePropertyInput,
  type CreatePropertyProximityInput,
  type JsonArray,
  type JsonObject,
  type UpdatePropertyInput,
  type UpsertPropertyPrivateLocationInput,
} from "./types";

export type ValidationResult<T> =
  | { valid: true; value: T }
  | { valid: false; errors: readonly string[] };

export type ValidatedCreateProperty = {
  referenceCode: string | null;
  title: string;
  propertyType: string | null;
  transactionType: string | null;
  status: string;
  city: string | null;
  neighborhood: string | null;
  price: number | null;
  description: string | null;
  attributes: PropertyAttributes;
  stage: string | null;
  availabilityStatus: string | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
  privateArea: number | null;
  totalArea: number | null;
  floor: number | null;
  solarOrientation: string | null;
  furnishedStatus: string | null;
  condominiumFee: number | null;
  iptuValue: number | null;
  originalDescription: string | null;
  optimizedDescription: string | null;
  shortSummary: string | null;
  editorialStatus: string | null;
  propertyFeatures: JsonArray;
  condominiumAmenities: JsonArray;
  surroundings: JsonArray;
  commercialContext: JsonObject;
};

export type ValidatedUpdateProperty = Partial<ValidatedCreateProperty>;

export type ValidatedCreatePropertyProximity = {
  propertyId: string;
  placeType: string;
  label: string;
  distanceValue: number | null;
  distanceUnit: string | null;
  travelMode: string | null;
  estimatedMinutes: number | null;
  isConfirmed: boolean;
  source: string;
};

export type ValidatedPropertyPrivateLocation = {
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
};

export type ValidatedCreatePropertyDescriptionRevision = {
  propertyId: string;
  originalText: string;
  suggestedText: string;
  provider: string | null;
  model: string | null;
};

function normalizeOptionalString(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function normalizeRequiredString(value: string | null | undefined, code: string, errors: string[]): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) errors.push(code);
  return trimmed;
}

function validateNonNegativeNumber(
  value: number | null | undefined,
  code: string,
  errors: string[],
): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    errors.push(code);
    return null;
  }
  return value;
}

function validateInteger(
  value: number | null | undefined,
  code: string,
  errors: string[],
): number | null {
  const normalized = validateNonNegativeNumber(value, code, errors);
  if (normalized === null) return null;
  if (!Number.isInteger(normalized)) {
    errors.push(code);
    return null;
  }
  return normalized;
}

function validateStatus(status: string, errors: string[]): string {
  const trimmed = status?.trim() ?? "";
  if (trimmed.length === 0) {
    errors.push("status_required");
    return trimmed;
  }
  if (!isPropertyStatus(trimmed)) errors.push(`status_invalid:${trimmed}`);
  return trimmed;
}

function validateCanonical<const T extends readonly string[]>(
  value: string | null | undefined,
  allowed: T,
  code: string,
  errors: string[],
): T[number] | null {
  const normalized = normalizeOptionalString(value);
  if (normalized === null) return null;
  if (!isOneOf(allowed, normalized)) {
    errors.push(`${code}:${normalized}`);
    return null;
  }
  return normalized;
}

function validateJsonArray(value: unknown, code: string, errors: string[]): JsonArray {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    errors.push(code);
    return [];
  }
  return value;
}

function validateJsonObject(value: unknown, code: string, errors: string[]): JsonObject {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) {
    errors.push(code);
    return {};
  }
  return value as JsonObject;
}

function validateLatitude(value: number | null | undefined, errors: string[]): number | null {
  const normalized = validateNonNegativeOrSignedNumber(value, "latitude_invalid", errors);
  if (normalized === null) return null;
  if (normalized < -90 || normalized > 90) errors.push("latitude_invalid");
  return normalized;
}

function validateLongitude(value: number | null | undefined, errors: string[]): number | null {
  const normalized = validateNonNegativeOrSignedNumber(value, "longitude_invalid", errors);
  if (normalized === null) return null;
  if (normalized < -180 || normalized > 180) errors.push("longitude_invalid");
  return normalized;
}

function validateNonNegativeOrSignedNumber(
  value: number | null | undefined,
  code: string,
  errors: string[],
): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push(code);
    return null;
  }
  return value;
}

function applyPropertyCoreValidation(
  input: CreatePropertyInput,
  errors: string[],
): Omit<ValidatedCreateProperty, "title" | "status" | "attributes"> {
  return {
    referenceCode: normalizeOptionalString(input.referenceCode),
    propertyType: normalizeOptionalString(input.propertyType),
    transactionType: normalizeOptionalString(input.transactionType),
    city: normalizeOptionalString(input.city),
    neighborhood: normalizeOptionalString(input.neighborhood),
    price: validateNonNegativeNumber(input.price, "price_invalid", errors),
    description: normalizeOptionalString(input.description),
    stage: validateCanonical(input.stage, PROPERTY_STAGE_VALUES, "stage_invalid", errors),
    availabilityStatus: validateCanonical(
      input.availabilityStatus,
      PROPERTY_AVAILABILITY_STATUS_VALUES,
      "availability_status_invalid",
      errors,
    ),
    bedrooms: validateInteger(input.bedrooms, "bedrooms_invalid", errors),
    suites: validateInteger(input.suites, "suites_invalid", errors),
    bathrooms: validateInteger(input.bathrooms, "bathrooms_invalid", errors),
    parkingSpaces: validateInteger(input.parkingSpaces, "parking_spaces_invalid", errors),
    privateArea: validateNonNegativeNumber(input.privateArea, "private_area_invalid", errors),
    totalArea: validateNonNegativeNumber(input.totalArea, "total_area_invalid", errors),
    floor: validateInteger(input.floor, "floor_invalid", errors),
    solarOrientation: validateCanonical(
      input.solarOrientation,
      PROPERTY_SOLAR_ORIENTATION_VALUES,
      "solar_orientation_invalid",
      errors,
    ),
    furnishedStatus: validateCanonical(
      input.furnishedStatus,
      PROPERTY_FURNISHED_STATUS_VALUES,
      "furnished_status_invalid",
      errors,
    ),
    condominiumFee: validateNonNegativeNumber(input.condominiumFee, "condominium_fee_invalid", errors),
    iptuValue: validateNonNegativeNumber(input.iptuValue, "iptu_value_invalid", errors),
    originalDescription: normalizeOptionalString(input.originalDescription),
    optimizedDescription: normalizeOptionalString(input.optimizedDescription),
    shortSummary: normalizeOptionalString(input.shortSummary),
    editorialStatus: validateCanonical(
      input.editorialStatus,
      PROPERTY_EDITORIAL_STATUS_VALUES,
      "editorial_status_invalid",
      errors,
    ),
    propertyFeatures: validateJsonArray(input.propertyFeatures, "property_features_must_be_array", errors),
    condominiumAmenities: validateJsonArray(
      input.condominiumAmenities,
      "condominium_amenities_must_be_array",
      errors,
    ),
    surroundings: validateJsonArray(input.surroundings, "surroundings_must_be_array", errors),
    commercialContext: validateJsonObject(input.commercialContext, "commercial_context_must_be_object", errors),
  };
}

export function validateCreateProperty(input: CreatePropertyInput): ValidationResult<ValidatedCreateProperty> {
  const errors: string[] = [];
  const title = normalizeRequiredString(input.title, "title_required", errors);
  const status = validateStatus(input.status, errors);
  const attributesResult = validatePropertyAttributes(input.attributes);
  if (!attributesResult.valid) errors.push(...attributesResult.errors);
  const core = applyPropertyCoreValidation(input, errors);

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    value: {
      ...core,
      title,
      status,
      attributes: attributesResult.valid ? attributesResult.attributes : {},
    },
  };
}

export function validateUpdateProperty(input: UpdatePropertyInput): ValidationResult<ValidatedUpdateProperty> {
  const errors: string[] = [];
  const value: ValidatedUpdateProperty = {};

  if (input.title !== undefined) {
    const title = normalizeRequiredString(input.title, "title_required", errors);
    if (title) value.title = title;
  }
  if (input.status !== undefined) value.status = validateStatus(input.status, errors);
  if (input.attributes !== undefined) {
    const attributesResult = validatePropertyAttributes(input.attributes);
    if (!attributesResult.valid) errors.push(...attributesResult.errors);
    else value.attributes = attributesResult.attributes;
  }

  const core = applyPropertyCoreValidation(input as CreatePropertyInput, errors);
  for (const [key, coreValue] of Object.entries(core) as Array<[keyof typeof core, unknown]>) {
    if ((input as Record<string, unknown>)[key] !== undefined) {
      (value as Record<string, unknown>)[key] = coreValue;
    }
  }

  if (input.referenceCode !== undefined) value.referenceCode = normalizeOptionalString(input.referenceCode);
  if (input.propertyType !== undefined) value.propertyType = normalizeOptionalString(input.propertyType);
  if (input.transactionType !== undefined) value.transactionType = normalizeOptionalString(input.transactionType);
  if (input.city !== undefined) value.city = normalizeOptionalString(input.city);
  if (input.neighborhood !== undefined) value.neighborhood = normalizeOptionalString(input.neighborhood);
  if (input.description !== undefined) value.description = normalizeOptionalString(input.description);
  if (input.originalDescription !== undefined)
    value.originalDescription = normalizeOptionalString(input.originalDescription);
  if (input.optimizedDescription !== undefined)
    value.optimizedDescription = normalizeOptionalString(input.optimizedDescription);
  if (input.shortSummary !== undefined) value.shortSummary = normalizeOptionalString(input.shortSummary);

  if (errors.length > 0) return { valid: false, errors };
  return { valid: true, value };
}

export function validateCreatePropertyProximity(
  input: CreatePropertyProximityInput,
): ValidationResult<ValidatedCreatePropertyProximity> {
  const errors: string[] = [];
  const propertyId = normalizeRequiredString(input.propertyId, "property_id_required", errors);
  const placeType = normalizeRequiredString(input.placeType, "place_type_required", errors);
  const label = normalizeRequiredString(input.label, "label_required", errors);
  const source =
    validateCanonical(input.source ?? "manual", PROPERTY_PROXIMITY_SOURCE_VALUES, "source_invalid", errors) ??
    "manual";
  const isConfirmed = input.isConfirmed ?? false;
  const distanceValue = validateNonNegativeNumber(input.distanceValue, "distance_value_invalid", errors);
  const distanceUnit = validateCanonical(
    input.distanceUnit,
    PROPERTY_PROXIMITY_DISTANCE_UNIT_VALUES,
    "distance_unit_invalid",
    errors,
  );
  const travelMode = validateCanonical(
    input.travelMode,
    PROPERTY_PROXIMITY_TRAVEL_MODE_VALUES,
    "travel_mode_invalid",
    errors,
  );
  const estimatedMinutes = validateInteger(input.estimatedMinutes, "estimated_minutes_invalid", errors);
  if (source === "extracted_from_text" && isConfirmed) errors.push("extracted_source_must_be_unconfirmed");

  if (errors.length > 0) return { valid: false, errors };
  return {
    valid: true,
    value: {
      propertyId,
      placeType,
      label,
      distanceValue,
      distanceUnit,
      travelMode,
      estimatedMinutes,
      isConfirmed,
      source,
    },
  };
}

export function validatePropertyPrivateLocation(
  input: UpsertPropertyPrivateLocationInput,
): ValidationResult<ValidatedPropertyPrivateLocation> {
  const errors: string[] = [];
  const propertyId = normalizeRequiredString(input.propertyId, "property_id_required", errors);
  const latitude = validateLatitude(input.latitude, errors);
  const longitude = validateLongitude(input.longitude, errors);

  if (errors.length > 0) return { valid: false, errors };
  return {
    valid: true,
    value: {
      propertyId,
      postalCode: normalizeOptionalString(input.postalCode),
      street: normalizeOptionalString(input.street),
      number: normalizeOptionalString(input.number),
      complement: normalizeOptionalString(input.complement),
      condominiumName: normalizeOptionalString(input.condominiumName),
      block: normalizeOptionalString(input.block),
      unit: normalizeOptionalString(input.unit),
      latitude,
      longitude,
      accessInstructions: normalizeOptionalString(input.accessInstructions),
      meetingPoint: normalizeOptionalString(input.meetingPoint),
    },
  };
}

export function validateCreatePropertyDescriptionRevision(
  input: CreatePropertyDescriptionRevisionInput,
): ValidationResult<ValidatedCreatePropertyDescriptionRevision> {
  const errors: string[] = [];
  const propertyId = normalizeRequiredString(input.propertyId, "property_id_required", errors);
  const originalText = normalizeRequiredString(input.originalText, "original_text_required", errors);
  const suggestedText = normalizeRequiredString(input.suggestedText, "suggested_text_required", errors);
  if (!isOneOf(PROPERTY_DESCRIPTION_REVISION_STATUS_VALUES, "proposed")) {
    errors.push("revision_status_contract_invalid");
  }

  if (errors.length > 0) return { valid: false, errors };
  return {
    valid: true,
    value: {
      propertyId,
      originalText,
      suggestedText,
      provider: normalizeOptionalString(input.provider),
      model: normalizeOptionalString(input.model),
    },
  };
}
