import type { ValidatedCreateProperty } from "./validation.ts";

/** Pure row serializer. Tenant identity is supplied by the authenticated server layer. */
export function buildPropertyPersistencePayload(
  tenantId: string,
  input: ValidatedCreateProperty,
): Record<string, unknown> {
  return {
    tenant_id: tenantId,
    reference_code: input.referenceCode,
    title: input.title,
    property_type: input.propertyType,
    transaction_type: input.transactionType,
    status: input.status,
    city: input.city,
    neighborhood: input.neighborhood,
    price: input.price,
    description: input.description,
    attributes: input.attributes,
    stage: input.stage,
    availability_status: input.availabilityStatus,
    bedrooms: input.bedrooms,
    suites: input.suites,
    bathrooms: input.bathrooms,
    parking_spaces: input.parkingSpaces,
    private_area: input.privateArea,
    total_area: input.totalArea,
    floor: input.floor,
    solar_orientation: input.solarOrientation,
    furnished_status: input.furnishedStatus,
    condominium_fee: input.condominiumFee,
    iptu_value: input.iptuValue,
    original_description: input.originalDescription,
    optimized_description: input.optimizedDescription,
    short_summary: input.shortSummary,
    editorial_status: input.editorialStatus,
    property_features: input.propertyFeatures,
    condominium_amenities: input.condominiumAmenities,
    surroundings: input.surroundings,
    commercial_context: input.commercialContext,
  };
}
