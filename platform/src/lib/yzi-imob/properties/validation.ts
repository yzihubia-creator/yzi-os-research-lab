// YZI IMOB — Property Validation (server-side, tenant-independent).
//
// Validação estrutural pura — nunca confia em checagem do cliente. As CHECK
// constraints do banco (title/status não vazios, price >= 0) são defesa em
// profundidade; esta camada é a primeira e falha cedo com erros honestos.

import { validatePropertyAttributes, type PropertyAttributes } from "./attributes";
import { isPropertyStatus, type CreatePropertyInput, type UpdatePropertyInput } from "./types";

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
};

export type ValidatedUpdateProperty = Partial<ValidatedCreateProperty>;

function normalizeOptionalString(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function validatePrice(price: number | null | undefined, errors: string[]): number | null {
  if (price === undefined || price === null) return null;
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    errors.push("price_invalid");
    return null;
  }
  return price;
}

function validateStatus(status: string, errors: string[]): string {
  const trimmed = status?.trim() ?? "";
  if (trimmed.length === 0) {
    errors.push("status_required");
    return trimmed;
  }
  if (!isPropertyStatus(trimmed)) {
    errors.push(`status_invalid:${trimmed}`);
  }
  return trimmed;
}

export function validateCreateProperty(
  input: CreatePropertyInput,
): ValidationResult<ValidatedCreateProperty> {
  const errors: string[] = [];

  const title = input.title?.trim() ?? "";
  if (title.length === 0) {
    errors.push("title_required");
  }

  const status = validateStatus(input.status, errors);
  const price = validatePrice(input.price, errors);

  const attributesResult = validatePropertyAttributes(input.attributes);
  if (!attributesResult.valid) {
    errors.push(...attributesResult.errors);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      referenceCode: normalizeOptionalString(input.referenceCode),
      title,
      propertyType: normalizeOptionalString(input.propertyType),
      transactionType: normalizeOptionalString(input.transactionType),
      status,
      city: normalizeOptionalString(input.city),
      neighborhood: normalizeOptionalString(input.neighborhood),
      price,
      description: normalizeOptionalString(input.description),
      attributes: attributesResult.valid ? attributesResult.attributes : {},
    },
  };
}

export function validateUpdateProperty(
  input: UpdatePropertyInput,
): ValidationResult<ValidatedUpdateProperty> {
  const errors: string[] = [];
  const value: ValidatedUpdateProperty = {};

  if (input.title !== undefined) {
    const title = input.title.trim();
    if (title.length === 0) {
      errors.push("title_required");
    } else {
      value.title = title;
    }
  }

  if (input.status !== undefined) {
    value.status = validateStatus(input.status, errors);
  }

  if (input.price !== undefined) {
    value.price = validatePrice(input.price, errors);
  }

  if (input.attributes !== undefined) {
    const attributesResult = validatePropertyAttributes(input.attributes);
    if (!attributesResult.valid) {
      errors.push(...attributesResult.errors);
    } else {
      value.attributes = attributesResult.attributes;
    }
  }

  if (input.referenceCode !== undefined) value.referenceCode = normalizeOptionalString(input.referenceCode);
  if (input.propertyType !== undefined) value.propertyType = normalizeOptionalString(input.propertyType);
  if (input.transactionType !== undefined)
    value.transactionType = normalizeOptionalString(input.transactionType);
  if (input.city !== undefined) value.city = normalizeOptionalString(input.city);
  if (input.neighborhood !== undefined) value.neighborhood = normalizeOptionalString(input.neighborhood);
  if (input.description !== undefined) value.description = normalizeOptionalString(input.description);

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true, value };
}
