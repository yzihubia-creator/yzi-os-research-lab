// YZI IMOB — Property Attributes (contrato mínimo do campo `attributes`).
//
// `attributes` no banco é `jsonb not null default '{}'`. Sem contrato, vira
// depósito arbitrário. Este módulo define o shape mínimo permitido — chaves
// conhecidas, tipadas, todas opcionais — e rejeita qualquer chave fora da
// lista ou com tipo incorreto. Nenhum campo comercial inventado: apenas os
// atributos físicos/operacionais necessários para completude e prontidão.

export type PropertyAttributes = {
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  areaTotal?: number;
  areaUsable?: number;
  furnished?: boolean;
  petsAllowed?: boolean;
  condoFee?: number;
  iptu?: number;
};

const ALLOWED_NUMBER_KEYS: readonly (keyof PropertyAttributes)[] = [
  "bedrooms",
  "bathrooms",
  "parkingSpaces",
  "areaTotal",
  "areaUsable",
  "condoFee",
  "iptu",
];

const ALLOWED_BOOLEAN_KEYS: readonly (keyof PropertyAttributes)[] = [
  "furnished",
  "petsAllowed",
];

const ALLOWED_KEYS = new Set<string>([...ALLOWED_NUMBER_KEYS, ...ALLOWED_BOOLEAN_KEYS]);

export type AttributesValidationResult =
  | { valid: true; attributes: PropertyAttributes }
  | { valid: false; errors: readonly string[] };

/**
 * Valida o shape mínimo de `attributes` — chave desconhecida ou tipo
 * incorreto é erro honesto, nunca silenciosamente descartado ou coagido.
 */
export function validatePropertyAttributes(input: unknown): AttributesValidationResult {
  if (input === null || input === undefined) {
    return { valid: true, attributes: {} };
  }
  if (typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, errors: ["attributes_must_be_object"] };
  }

  const errors: string[] = [];
  const result: PropertyAttributes = {};
  const record = input as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (!ALLOWED_KEYS.has(key)) {
      errors.push(`attributes_unknown_key:${key}`);
      continue;
    }
    const value = record[key];
    if (ALLOWED_NUMBER_KEYS.includes(key as keyof PropertyAttributes)) {
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        errors.push(`attributes_invalid_number:${key}`);
        continue;
      }
      (result as Record<string, unknown>)[key] = value;
    } else if (ALLOWED_BOOLEAN_KEYS.includes(key as keyof PropertyAttributes)) {
      if (typeof value !== "boolean") {
        errors.push(`attributes_invalid_boolean:${key}`);
        continue;
      }
      (result as Record<string, unknown>)[key] = value;
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true, attributes: result };
}

/** Quantas chaves conhecidas de `attributes` estão preenchidas — usado por completude/qualidade. */
export function countFilledAttributes(attributes: PropertyAttributes): number {
  return Object.values(attributes).filter((value) => value !== undefined && value !== null).length;
}

export const PROPERTY_ATTRIBUTES_KNOWN_KEY_COUNT =
  ALLOWED_NUMBER_KEYS.length + ALLOWED_BOOLEAN_KEYS.length;
