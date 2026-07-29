"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import {
  acceptPropertyDescriptionRevision,
  createPropertyDescriptionRevision,
  createPropertyProximity,
  rejectPropertyDescriptionRevision,
  updateProperty,
  upsertPropertyPrivateLocation,
} from "@/lib/yzi-imob/properties/repository";
import {
  validateCreatePropertyDescriptionRevision,
  validateCreatePropertyProximity,
  validatePropertyPrivateLocation,
  validateUpdateProperty,
} from "@/lib/yzi-imob/properties/validation";
import type {
  CreatePropertyDescriptionRevisionInput,
  CreatePropertyProximityInput,
  UpdatePropertyInput,
  UpsertPropertyPrivateLocationInput,
} from "@/lib/yzi-imob/properties/types";

export type PropertyWorkspaceActionState = {
  status: "idle" | "ok" | "error" | "membership_missing";
  message?: string;
  fieldErrors?: readonly string[];
};

export const INITIAL_PROPERTY_WORKSPACE_ACTION_STATE: PropertyWorkspaceActionState = {
  status: "idle",
};

function stringValue(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function requiredStringValue(formData: FormData, name: string): string {
  return stringValue(formData, name) ?? "";
}

function numberValue(formData: FormData, name: string): number | null {
  const raw = stringValue(formData, name);
  if (raw === null) return null;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : Number.NaN;
}

function booleanValue(formData: FormData, name: string): boolean {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

async function getActionContext(): Promise<
  | { status: "ok"; tenantId: string; userId: string }
  | { status: "error"; state: PropertyWorkspaceActionState }
> {
  const tenantContext = await getTenantContext();
  if (tenantContext.status === "tenant_found") {
    return { status: "ok", tenantId: tenantContext.tenant.id, userId: tenantContext.userId };
  }
  if (tenantContext.status === "no_membership") {
    return {
      status: "error",
      state: {
        status: "membership_missing",
        message: "Sua conta ainda nao esta vinculada a uma imobiliaria.",
      },
    };
  }
  return {
    status: "error",
    state: {
      status: "error",
      message:
        tenantContext.status === "no_session"
          ? "Voce precisa entrar para alterar este imovel."
          : "Nao foi possivel validar seu acesso agora.",
    },
  };
}

function revalidateProperty(propertyId: string) {
  revalidatePath(`/cockpit/yzi-imob/imoveis/${propertyId}`);
  revalidatePath("/cockpit/yzi-imob/imoveis");
  revalidatePath("/cockpit/yzi-imob/imoveis/catalogo");
}

export async function updatePropertyCoreAction(
  _prevState: PropertyWorkspaceActionState,
  formData: FormData,
): Promise<PropertyWorkspaceActionState> {
  const propertyId = requiredStringValue(formData, "propertyId");
  const input: UpdatePropertyInput = {
    referenceCode: stringValue(formData, "referenceCode"),
    title: requiredStringValue(formData, "title"),
    propertyType: stringValue(formData, "propertyType"),
    transactionType: stringValue(formData, "transactionType"),
    status: requiredStringValue(formData, "status"),
    city: stringValue(formData, "city"),
    neighborhood: stringValue(formData, "neighborhood"),
    price: numberValue(formData, "price"),
    stage: stringValue(formData, "stage"),
    availabilityStatus: stringValue(formData, "availabilityStatus"),
    bedrooms: numberValue(formData, "bedrooms"),
    suites: numberValue(formData, "suites"),
    bathrooms: numberValue(formData, "bathrooms"),
    parkingSpaces: numberValue(formData, "parkingSpaces"),
    privateArea: numberValue(formData, "privateArea"),
    totalArea: numberValue(formData, "totalArea"),
    floor: numberValue(formData, "floor"),
    solarOrientation: stringValue(formData, "solarOrientation"),
    furnishedStatus: stringValue(formData, "furnishedStatus"),
    condominiumFee: numberValue(formData, "condominiumFee"),
    iptuValue: numberValue(formData, "iptuValue"),
    originalDescription: stringValue(formData, "originalDescription"),
    shortSummary: stringValue(formData, "shortSummary"),
    editorialStatus: stringValue(formData, "editorialStatus"),
  };

  const validated = validateUpdateProperty(input);
  if (!validated.valid) {
    return { status: "error", message: "Revise os campos do imovel.", fieldErrors: validated.errors };
  }

  const context = await getActionContext();
  if (context.status === "error") return context.state;

  const supabase = await createServerSupabaseClient();
  const result = await updateProperty(supabase, context.tenantId, propertyId, validated.value);
  if (result.status === "error") {
    return { status: "error", message: "Nao foi possivel atualizar o imovel agora." };
  }

  revalidateProperty(propertyId);
  return { status: "ok", message: "Imovel atualizado." };
}

export async function upsertPrivateLocationAction(
  _prevState: PropertyWorkspaceActionState,
  formData: FormData,
): Promise<PropertyWorkspaceActionState> {
  const input: UpsertPropertyPrivateLocationInput = {
    propertyId: requiredStringValue(formData, "propertyId"),
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

  const validated = validatePropertyPrivateLocation(input);
  if (!validated.valid) {
    return { status: "error", message: "Revise o endereco privado.", fieldErrors: validated.errors };
  }

  const context = await getActionContext();
  if (context.status === "error") return context.state;

  const supabase = await createServerSupabaseClient();
  const result = await upsertPropertyPrivateLocation(supabase, validated.value);
  if (result.status === "error") {
    return { status: "error", message: "Nao foi possivel salvar o endereco privado." };
  }

  revalidateProperty(validated.value.propertyId);
  return { status: "ok", message: "Endereco privado salvo." };
}

export async function createProximityAction(
  _prevState: PropertyWorkspaceActionState,
  formData: FormData,
): Promise<PropertyWorkspaceActionState> {
  const input: CreatePropertyProximityInput = {
    propertyId: requiredStringValue(formData, "propertyId"),
    placeType: requiredStringValue(formData, "placeType"),
    label: requiredStringValue(formData, "label"),
    distanceValue: numberValue(formData, "distanceValue"),
    distanceUnit: stringValue(formData, "distanceUnit"),
    travelMode: stringValue(formData, "travelMode"),
    estimatedMinutes: numberValue(formData, "estimatedMinutes"),
    isConfirmed: booleanValue(formData, "isConfirmed"),
    source: stringValue(formData, "source") ?? "manual",
  };

  const validated = validateCreatePropertyProximity(input);
  if (!validated.valid) {
    return { status: "error", message: "Revise a proximidade.", fieldErrors: validated.errors };
  }

  const context = await getActionContext();
  if (context.status === "error") return context.state;

  const supabase = await createServerSupabaseClient();
  const result = await createPropertyProximity(supabase, context.tenantId, validated.value);
  if (result.status === "error") {
    return { status: "error", message: "Nao foi possivel salvar a proximidade." };
  }

  revalidateProperty(validated.value.propertyId);
  return { status: "ok", message: "Proximidade cadastrada." };
}

export async function createDescriptionRevisionAction(
  _prevState: PropertyWorkspaceActionState,
  formData: FormData,
): Promise<PropertyWorkspaceActionState> {
  const input: CreatePropertyDescriptionRevisionInput = {
    propertyId: requiredStringValue(formData, "propertyId"),
    originalText: requiredStringValue(formData, "originalText"),
    suggestedText: requiredStringValue(formData, "suggestedText"),
    provider: stringValue(formData, "provider") ?? "manual",
    model: stringValue(formData, "model"),
  };

  const validated = validateCreatePropertyDescriptionRevision(input);
  if (!validated.valid) {
    return { status: "error", message: "Revise a proposta editorial.", fieldErrors: validated.errors };
  }

  const context = await getActionContext();
  if (context.status === "error") return context.state;

  const supabase = await createServerSupabaseClient();
  const result = await createPropertyDescriptionRevision(
    supabase,
    context.tenantId,
    context.userId,
    validated.value,
  );
  if (result.status === "error") {
    return { status: "error", message: "Nao foi possivel salvar a proposta editorial." };
  }

  revalidateProperty(validated.value.propertyId);
  return { status: "ok", message: "Proposta editorial registrada." };
}

export async function acceptDescriptionRevisionAction(formData: FormData): Promise<void> {
  const propertyId = requiredStringValue(formData, "propertyId");
  const revisionId = requiredStringValue(formData, "revisionId");
  const context = await getActionContext();
  if (context.status === "error") return;

  const supabase = await createServerSupabaseClient();
  await acceptPropertyDescriptionRevision(supabase, revisionId);
  revalidateProperty(propertyId);
}

export async function rejectDescriptionRevisionAction(formData: FormData): Promise<void> {
  const propertyId = requiredStringValue(formData, "propertyId");
  const revisionId = requiredStringValue(formData, "revisionId");
  const context = await getActionContext();
  if (context.status === "error") return;

  const supabase = await createServerSupabaseClient();
  await rejectPropertyDescriptionRevision(supabase, revisionId);
  revalidateProperty(propertyId);
}
