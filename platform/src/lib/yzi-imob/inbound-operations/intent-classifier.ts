// YZI IMOB - Inbound Operations Consumer - Deterministic intent classifier.
//
// Pure function. No LLM, no network, no database, no score, no probability.
// Ordered, word-bounded keyword rules only — auditable by construction
// (every result carries the exact rule that matched).

import type { IntentClassification, IntentKey } from "./types.ts";

type Rule = {
  phrase: string;
  pattern: RegExp;
};

function buildRule(phrase: string): Rule {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return { phrase, pattern: new RegExp(`\\b${escaped}\\b`) };
}

type RuleCategory = {
  intentKey: IntentKey;
  rules: readonly Rule[];
};

// Precedence order (first match wins): human_support > scheduling_interest >
// property_interest > greeting > unknown. This is what stops
// "oi, quero falar com uma pessoa" from being classified as a mere greeting.
const RULE_CATEGORIES: readonly RuleCategory[] = [
  {
    intentKey: "human_support",
    rules: [
      "falar com atendente",
      "falar com corretor",
      "falar com uma pessoa",
      "atendimento humano",
    ].map(buildRule),
  },
  {
    intentKey: "scheduling_interest",
    rules: [
      "marcar visita",
      "agendar visita",
      "visitar o imovel",
      "qual horario",
      "disponibilidade para visita",
    ].map(buildRule),
  },
  {
    intentKey: "property_interest",
    rules: [
      "quero saber mais",
      "tenho interesse",
      "gostei do imovel",
      "valor do imovel",
      "apartamento",
      "casa",
      "lancamento",
    ].map(buildRule),
  },
  {
    intentKey: "greeting",
    rules: ["oi", "ola", "bom dia", "boa tarde", "boa noite"].map(buildRule),
  },
];

/** Lowercase, accent-stripped (NFD), whitespace-collapsed. Rule phrases are authored already in this form. */
export function normalizeInboundText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function classifyIntent(rawText: string): IntentClassification {
  const normalizedText = normalizeInboundText(rawText);

  for (const category of RULE_CATEGORIES) {
    for (const rule of category.rules) {
      if (rule.pattern.test(normalizedText)) {
        return {
          intentKey: category.intentKey,
          matchedRule: `${category.intentKey}:${rule.phrase}`,
          normalizedText,
        };
      }
    }
  }

  return {
    intentKey: "unknown",
    matchedRule: "unknown:fallback",
    normalizedText,
  };
}
