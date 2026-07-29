// YZI IMOB — Property View Helpers (leitura, somente).
//
// Traduz o `Property` real (schema enxuto, ver
// lib/yzi-imob/properties/types.ts) para rótulos, cores e formatação de UI.
// Nenhum cálculo de completude/qualidade acontece aqui — isso vem sempre de
// `computePropertyCompleteness`/`computePropertyQuality` (lib/yzi-imob/properties).
// Este módulo só traduz para apresentação honesta.

import type { PropertyStatus } from "@/lib/yzi-imob/properties/types";
import type { PropertyQualityLevel } from "@/lib/yzi-imob/properties/quality";
import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";

/** Rótulos honestos para os 6 estados reais de `PropertyStatus`. */
export const REAL_PROPERTY_STATUS_LABEL: Record<PropertyStatus, string> = {
  draft: "Rascunho",
  active: "Ativo",
  paused: "Pausado",
  sold: "Vendido",
  rented: "Alugado",
  archived: "Arquivado",
};

export const REAL_PROPERTY_STATUS_ACCENT: Record<PropertyStatus, YziImobRole> = {
  draft: "graphite",
  active: "coldGreen",
  paused: "amber",
  sold: "primary",
  rented: "cyan",
  archived: "neutral",
};

const FALLBACK_STATUS_LABEL = "Status desconhecido";
const FALLBACK_STATUS_ACCENT: YziImobRole = "neutral";

/** Aceita `PropertyStatus | string` (o tipo real do banco não é estritamente fechado em TS). */
export function propertyStatusLabel(status: string): string {
  return REAL_PROPERTY_STATUS_LABEL[status as PropertyStatus] ?? FALLBACK_STATUS_LABEL;
}

export function propertyStatusAccent(status: string): YziImobRole {
  return REAL_PROPERTY_STATUS_ACCENT[status as PropertyStatus] ?? FALLBACK_STATUS_ACCENT;
}

export function propertyStatusColor(status: string, alpha: number): string {
  return imobRgba(propertyStatusAccent(status), alpha);
}

export const PROPERTY_QUALITY_LABEL: Record<PropertyQualityLevel, string> = {
  insufficient: "Cadastro insuficiente",
  basic: "Cadastro básico",
  ready: "Pronto",
};

export const PROPERTY_QUALITY_ACCENT: Record<PropertyQualityLevel, YziImobRole> = {
  insufficient: "wine",
  basic: "amber",
  ready: "coldGreen",
};

const PRICE_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

/** Nunca inventa preço: `null`/`undefined` vira rótulo honesto, nunca R$0. */
export function formatPropertyPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return "Preço não informado";
  }
  return PRICE_FORMATTER.format(price);
}

/** Cidade/bairro compostos honestamente — omite partes ausentes, nunca inventa. */
export function formatPropertyLocation(
  city: string | null,
  neighborhood: string | null,
): string {
  const parts = [neighborhood, city].filter((part): part is string => Boolean(part && part.trim()));
  return parts.length > 0 ? parts.join(" · ") : "Localização não informada";
}

export function formatPropertyTypeLabel(propertyType: string | null): string {
  return propertyType && propertyType.trim().length > 0 ? propertyType : "Tipo não informado";
}

export function formatTransactionTypeLabel(transactionType: string | null): string {
  return transactionType && transactionType.trim().length > 0
    ? transactionType
    : "Transação não informada";
}
