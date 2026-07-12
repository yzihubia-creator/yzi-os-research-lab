// YZI IMOB — Property Quality (qualidade mínima de cadastro, helper puro).
//
// Qualidade != completude: completude mede "quanto está preenchido"; qualidade
// mede "o preenchido é bom o suficiente para atendimento/site". Determinístico,
// sem IA, sem coluna de banco.

import { computePropertyCompleteness } from "./completeness";
import type { Property } from "./types";

export type PropertyQualityLevel = "insufficient" | "basic" | "ready";

export type QualityCheck = {
  name: string;
  passed: boolean;
};

export type QualityResult = {
  level: PropertyQualityLevel;
  checks: readonly QualityCheck[];
  /** Prontidão honesta para site/atendimento/Creative Studio — dados apenas, sem integração. */
  readyForPublication: boolean;
};

const TITLE_MIN_LENGTH = 10;
const DESCRIPTION_MIN_LENGTH = 40;

export function computePropertyQuality(
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
    | "status"
  >,
): QualityResult {
  const completeness = computePropertyCompleteness(property);

  const checks: QualityCheck[] = [
    { name: "title_length", passed: property.title.trim().length >= TITLE_MIN_LENGTH },
    {
      name: "description_length",
      passed: Boolean(property.description && property.description.trim().length >= DESCRIPTION_MIN_LENGTH),
    },
    { name: "has_price", passed: property.price !== null && property.price !== undefined },
    { name: "has_location", passed: Boolean(property.city && property.neighborhood) },
    {
      name: "has_type_and_transaction",
      passed: Boolean(property.propertyType && property.transactionType),
    },
    { name: "completeness_at_least_70pct", passed: completeness.percentage >= 70 },
  ];

  const passedCount = checks.filter((check) => check.passed).length;

  let level: PropertyQualityLevel;
  if (passedCount === checks.length) {
    level = "ready";
  } else if (passedCount >= Math.ceil(checks.length / 2)) {
    level = "basic";
  } else {
    level = "insufficient";
  }

  return {
    level,
    checks,
    readyForPublication: level === "ready",
  };
}
