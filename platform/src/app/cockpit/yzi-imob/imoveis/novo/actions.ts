"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import {
  createProperty,
  createPropertyProximity,
  getPropertyById,
  updateProperty,
  upsertPropertyPrivateLocation,
} from "@/lib/yzi-imob/properties/repository";
import {
  validateCreateProperty,
  validateCreatePropertyProximity,
  validatePropertyPrivateLocation,
} from "@/lib/yzi-imob/properties/validation";
import type {
  CreatePropertyInput,
  CreatePropertyProximityInput,
  JsonObject,
  UpsertPropertyPrivateLocationInput,
} from "@/lib/yzi-imob/properties/types";
import type { CreatePropertyActionState } from "./action-state";

type CreatePropertyResumeStep = "private_location" | "proximities" | "property_details";

function stringValue(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function stringValues(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function rawStringValues(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .map((value) => (typeof value === "string" ? value.trim() : ""));
}

function numberValue(formData: FormData, name: string): number | null {
  const raw = stringValue(formData, name);
  if (raw === null) return null;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : Number.NaN;
}

function compactObject(entries: Array<[string, string | null]>): JsonObject {
  return Object.fromEntries(entries.filter((entry): entry is [string, string] => entry[1] !== null));
}

function buildPropertyInput(formData: FormData): CreatePropertyInput {
  const bedrooms = numberValue(formData, "bedrooms");
  const bathrooms = numberValue(formData, "bathrooms");
  const parkingSpaces = numberValue(formData, "parkingSpaces");
  const privateArea = numberValue(formData, "privateArea");
  const totalArea = numberValue(formData, "totalArea");
  const condominiumFee = numberValue(formData, "condominiumFee");
  const iptuValue = numberValue(formData, "iptuValue");
  const originalDescription = stringValue(formData, "originalDescription");

  return {
    referenceCode: stringValue(formData, "referenceCode"),
    title: stringValue(formData, "title") ?? "",
    propertyType: stringValue(formData, "propertyType"),
    transactionType: stringValue(formData, "transactionType"),
    status: stringValue(formData, "status") ?? "draft",
    city: stringValue(formData, "city"),
    neighborhood: stringValue(formData, "neighborhood"),
    price: numberValue(formData, "price"),
    description: originalDescription,
    attributes: {
      ...(bedrooms === null ? {} : { bedrooms }),
      ...(bathrooms === null ? {} : { bathrooms }),
      ...(parkingSpaces === null ? {} : { parkingSpaces }),
      ...(privateArea === null ? {} : { areaUsable: privateArea }),
      ...(totalArea === null ? {} : { areaTotal: totalArea }),
      ...(condominiumFee === null ? {} : { condoFee: condominiumFee }),
      ...(iptuValue === null ? {} : { iptu: iptuValue }),
    },
    stage: "intake",
    availabilityStatus: stringValue(formData, "availabilityStatus") ?? "available",
    bedrooms,
    suites: numberValue(formData, "suites"),
    bathrooms,
    parkingSpaces,
    privateArea,
    totalArea,
    floor: numberValue(formData, "floor"),
    solarOrientation: stringValue(formData, "solarOrientation"),
    furnishedStatus: stringValue(formData, "furnishedStatus"),
    condominiumFee,
    iptuValue,
    originalDescription,
    optimizedDescription: null,
    shortSummary: stringValue(formData, "shortSummary"),
    editorialStatus: originalDescription ? "raw" : null,
    propertyFeatures: stringValues(formData, "propertyFeatures"),
    condominiumAmenities: stringValues(formData, "condominiumAmenities"),
    surroundings: stringValues(formData, "surroundings"),
    commercialContext: compactObject([
      ["payment_conditions", stringValue(formData, "commercialPaymentConditions")],
      ["occupancy_status", stringValue(formData, "commercialOccupancyStatus")],
      ["commercial_notes", stringValue(formData, "commercialNotes")],
    ]),
  };
}

function buildPrivateLocationInput(formData: FormData): UpsertPropertyPrivateLocationInput {
  return {
    propertyId: "pending-property",
    postalCode: stringValue(formData, "postalCode"),
    street: stringValue(formData, "street"),
    number: stringValue(formData, "number"),
    complement: stringValue(formData, "complement"),
    condominiumName: stringValue(formData, "condominiumName"),
    block: stringValue(formData, "block"),
    unit: stringValue(formData, "unit"),
    latitude: numberValue(formData, "latitude"),
    longitude: numberValue(formData, "longitude"),
    accessInstructions: stringValue(formData, "accessInstructions"),
    meetingPoint: stringValue(formData, "meetingPoint"),
  };
}

function hasPrivateLocation(input: UpsertPropertyPrivateLocationInput): boolean {
  return Object.entries(input).some(([key, value]) => key !== "propertyId" && value !== null && value !== undefined);
}

function buildProximityInputs(formData: FormData): CreatePropertyProximityInput[] {
  const placeTypes = rawStringValues(formData, "proximityPlaceType");
  const labels = rawStringValues(formData, "proximityLabel");
  const distances = formData.getAll("proximityDistance");
  const units = formData.getAll("proximityDistanceUnit");
  const modes = formData.getAll("proximityTravelMode");
  const minutes = formData.getAll("proximityMinutes");
  const sources = formData.getAll("proximitySource");
  const confirmed = formData.getAll("proximityConfirmed");

  return labels.map((label, index) => ({
    propertyId: "pending-property",
    placeType: placeTypes[index] ?? "",
    label,
    distanceValue:
      typeof distances[index] === "string" && distances[index].trim()
        ? Number(distances[index])
        : null,
    distanceUnit: typeof units[index] === "string" ? units[index] : null,
    travelMode: typeof modes[index] === "string" ? modes[index] : null,
    estimatedMinutes:
      typeof minutes[index] === "string" && minutes[index].trim() ? Number(minutes[index]) : null,
    source: typeof sources[index] === "string" ? sources[index] : "manual",
    isConfirmed: confirmed[index] === "true",
  }));
}

const FIELD_MESSAGES: Record<string, [string, string]> = {
  title_required: ["title", "Informe o título do imóvel."],
  status_invalid: ["status", "Selecione um status válido."],
  availability_status_invalid: ["availabilityStatus", "Selecione uma disponibilidade válida."],
  solar_orientation_invalid: ["solarOrientation", "Selecione uma orientação solar válida."],
  furnished_status_invalid: ["furnishedStatus", "Selecione uma opção de mobília válida."],
  price_invalid: ["price", "Informe um valor monetário válido."],
  bedrooms_invalid: ["bedrooms", "Use um número inteiro igual ou maior que zero."],
  suites_invalid: ["suites", "Use um número inteiro igual ou maior que zero."],
  bathrooms_invalid: ["bathrooms", "Use um número inteiro igual ou maior que zero."],
  parking_spaces_invalid: ["parkingSpaces", "Use um número inteiro igual ou maior que zero."],
  private_area_invalid: ["privateArea", "Informe uma área válida."],
  total_area_invalid: ["totalArea", "Informe uma área válida."],
  floor_invalid: ["floor", "Use um número inteiro igual ou maior que zero."],
  condominium_fee_invalid: ["condominiumFee", "Informe um valor monetário válido."],
  iptu_value_invalid: ["iptuValue", "Informe um valor monetário válido."],
  latitude_invalid: ["latitude", "A latitude deve estar entre -90 e 90."],
  longitude_invalid: ["longitude", "A longitude deve estar entre -180 e 180."],
  place_type_required: ["proximities", "Informe o tipo de cada proximidade."],
  label_required: ["proximities", "Informe o nome de cada proximidade."],
  distance_value_invalid: ["proximities", "Revise a distância informada."],
  estimated_minutes_invalid: ["proximities", "Os minutos devem ser um número inteiro."],
  distance_unit_invalid: ["proximities", "Selecione uma unidade de distância válida."],
  travel_mode_invalid: ["proximities", "Selecione um modo de deslocamento válido."],
  source_invalid: ["proximities", "Selecione uma fonte válida."],
  extracted_source_must_be_unconfirmed: [
    "proximities",
    "Proximidades extraídas de texto precisam nascer como não confirmadas.",
  ],
};

function toFieldErrors(codes: readonly string[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const code of codes) {
    const baseCode = code.split(":")[0];
    const entry = FIELD_MESSAGES[baseCode] ?? ["form", "Revise os dados informados."];
    errors[entry[0]] ??= entry[1];
  }
  return errors;
}

function partialFailure(
  propertyId: string,
  failedSection: NonNullable<CreatePropertyActionState["failedSection"]>,
  resumeFrom: CreatePropertyResumeStep,
  message: string,
  completedProximities = 0,
): CreatePropertyActionState {
  return {
    status: "partial",
    message,
    createdPropertyId: propertyId,
    failedSection,
    resumeFrom,
    completedProximities,
  };
}

export async function createPropertyAction(
  prevState: CreatePropertyActionState,
  formData: FormData,
): Promise<CreatePropertyActionState> {
  const propertyValidation = validateCreateProperty(buildPropertyInput(formData));
  const privateValidation = validatePropertyPrivateLocation(buildPrivateLocationInput(formData));
  const proximityValidations = buildProximityInputs(formData).map(validateCreatePropertyProximity);
  const validationCodes = [
    ...(propertyValidation.valid ? [] : propertyValidation.errors),
    ...(privateValidation.valid ? [] : privateValidation.errors),
    ...proximityValidations.flatMap((result) => (result.valid ? [] : result.errors)),
  ];

  if (validationCodes.length > 0 || !propertyValidation.valid || !privateValidation.valid) {
    return {
      ...prevState,
      status: "error",
      message: "Corrija os campos indicados antes de salvar.",
      fieldErrors: toFieldErrors(validationCodes),
    };
  }

  const tenantContext = await getTenantContext();
  if (tenantContext.status === "no_session") {
    return { status: "error", message: "Você precisa entrar para cadastrar um imóvel." };
  }
  if (tenantContext.status === "error") {
    return { status: "error", message: "Não foi possível validar seu acesso agora." };
  }
  if (tenantContext.status === "no_membership") {
    return {
      status: "membership_missing",
      message: "Para salvar este imóvel, primeiro vincule sua conta a uma imobiliária.",
    };
  }

  const supabase = await createServerSupabaseClient();
  let propertyId = prevState.createdPropertyId;

  if (propertyId) {
    const existing = await getPropertyById(supabase, tenantContext.tenant.id, propertyId);
    if (existing.status === "error") {
      return {
        status: "error",
        message: "Não foi possível retomar este cadastro. Abra o imóvel salvo pelo catálogo.",
      };
    }
  } else {
    const full = propertyValidation.value;
    const created = await createProperty(
      supabase,
      tenantContext.tenant.id,
      tenantContext.userId,
      {
        ...full,
        status: "draft",
        stage: "intake",
        attributes: {},
        bedrooms: null,
        suites: null,
        bathrooms: null,
        parkingSpaces: null,
        privateArea: null,
        totalArea: null,
        floor: null,
        solarOrientation: null,
        furnishedStatus: null,
        condominiumFee: null,
        iptuValue: null,
        description: null,
        originalDescription: null,
        optimizedDescription: null,
        shortSummary: null,
        editorialStatus: null,
        propertyFeatures: [],
        condominiumAmenities: [],
        surroundings: [],
        commercialContext: {},
      },
    );
    if (created.status === "error") {
      return { status: "error", message: "Não foi possível criar o imóvel agora." };
    }
    propertyId = created.value.id;
    revalidatePath("/cockpit/yzi-imob/imoveis");
    revalidatePath("/cockpit/yzi-imob/imoveis/catalogo");
  }

  const resumeFrom = prevState.resumeFrom ?? "private_location";
  const steps: CreatePropertyResumeStep[] = ["private_location", "proximities", "property_details"];
  const shouldRun = (step: CreatePropertyResumeStep) => steps.indexOf(step) >= steps.indexOf(resumeFrom);

  if (shouldRun("private_location") && hasPrivateLocation(privateValidation.value)) {
    const privateResult = await upsertPropertyPrivateLocation(supabase, {
      ...privateValidation.value,
      propertyId,
    });
    if (privateResult.status === "error") {
      return partialFailure(
        propertyId,
        "localizacao",
        "private_location",
        "O imóvel foi criado, mas o endereço confidencial não foi salvo. Revise e tente novamente.",
      );
    }
  }

  const completedProximities =
    resumeFrom === "proximities" ? Math.max(0, prevState.completedProximities ?? 0) : 0;
  if (shouldRun("proximities")) {
    for (let index = completedProximities; index < proximityValidations.length; index += 1) {
      const validation = proximityValidations[index];
      if (!validation.valid) continue;
      const proximityResult = await createPropertyProximity(supabase, tenantContext.tenant.id, {
        ...validation.value,
        propertyId,
      });
      if (proximityResult.status === "error") {
        return partialFailure(
          propertyId,
          "proximidades",
          "proximities",
          `O imóvel foi criado, mas a proximidade ${index + 1} não foi salva. Tente novamente para retomar.`,
          index,
        );
      }
    }
  }

  const updateResult = await updateProperty(
    supabase,
    tenantContext.tenant.id,
    propertyId,
    propertyValidation.value,
  );
  if (updateResult.status === "error") {
    return partialFailure(
      propertyId,
      "cadastro",
      "property_details",
      "O imóvel e os dados complementares foram preservados, mas o cadastro principal não foi finalizado. Tente novamente.",
      proximityValidations.length,
    );
  }

  revalidatePath("/cockpit/yzi-imob/imoveis");
  revalidatePath("/cockpit/yzi-imob/imoveis/catalogo");
  redirect(`/cockpit/yzi-imob/imoveis/${propertyId}`);
}
