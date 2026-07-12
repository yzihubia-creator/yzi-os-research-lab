// YZI IMOB — Property Completeness (helper de código, não coluna de banco).
//
// Completude = fração de campos de cadastro operacional preenchidos.
// Determinístico e puro — calculado sob demanda a partir do registro real,
// nunca armazenado (evita migration/coluna derivada divergindo da fonte).

import { countFilledAttributes, PROPERTY_ATTRIBUTES_KNOWN_KEY_COUNT } from "./attributes";
import type { Property } from "./types";

export type CompletenessField =
  | "title"
  | "referenceCode"
  | "propertyType"
  | "transactionType"
  | "city"
  | "neighborhood"
  | "price"
  | "description"
  | "attributes";

/**
 * Pesos do cálculo de completude. Soma = 1. `title`/`status` já são
 * obrigatórios no banco (NOT NULL) e por isso não entram como campo
 * "faltante" adicional — o peso deles é redistribuído para os campos que
 * realmente variam entre cadastro incompleto e completo.
 */
const FIELD_WEIGHTS: Record<CompletenessField, number> = {
  title: 0.1,
  referenceCode: 0.1,
  propertyType: 0.1,
  transactionType: 0.1,
  city: 0.1,
  neighborhood: 0.1,
  price: 0.15,
  description: 0.15,
  attributes: 0.1,
};

export type CompletenessResult = {
  /** 0..1 */
  score: number;
  /** 0..100, arredondado */
  percentage: number;
  missingFields: readonly CompletenessField[];
};

/**
 * `attributes` conta como "preenchido" quando ao menos 2 chaves conhecidas
 * têm valor — um único atributo isolado não caracteriza cadastro rico.
 */
const ATTRIBUTES_MIN_FILLED_FOR_COMPLETE = 2;

export function computePropertyCompleteness(
  property: Pick<
    Property,
    | "title"
    | "referenceCode"
    | "propertyType"
    | "transactionType"
    | "city"
    | "neighborhood"
    | "price"
    | "description"
    | "attributes"
  >,
): CompletenessResult {
  const filled: Record<CompletenessField, boolean> = {
    title: property.title.trim().length > 0,
    referenceCode: Boolean(property.referenceCode),
    propertyType: Boolean(property.propertyType),
    transactionType: Boolean(property.transactionType),
    city: Boolean(property.city),
    neighborhood: Boolean(property.neighborhood),
    price: property.price !== null && property.price !== undefined,
    description: Boolean(property.description && property.description.trim().length >= 20),
    attributes:
      countFilledAttributes(property.attributes) >=
      Math.min(ATTRIBUTES_MIN_FILLED_FOR_COMPLETE, PROPERTY_ATTRIBUTES_KNOWN_KEY_COUNT),
  };

  let score = 0;
  const missingFields: CompletenessField[] = [];
  for (const key of Object.keys(FIELD_WEIGHTS) as CompletenessField[]) {
    if (filled[key]) {
      score += FIELD_WEIGHTS[key];
    } else {
      missingFields.push(key);
    }
  }

  const rounded = Math.round(score * 100) / 100;
  return {
    score: rounded,
    percentage: Math.round(rounded * 100),
    missingFields,
  };
}
