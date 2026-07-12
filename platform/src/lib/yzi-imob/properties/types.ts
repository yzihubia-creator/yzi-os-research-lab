// YZI IMOB — Property Domain Contract (Data Foundation).
//
// Contrato funcional final da autoridade real de imóvel, tenant-scoped,
// espelhando `public.yzi_imob_properties` (ver
// docs/yzi-os-active/04-implementation/yzi-imob-core-entities-manual-sql-pack-v1.sql).
// Nenhum campo comercial (mídia, campanha, corretor, visita, proposta) —
// fora do escopo desta unidade.

import type { PropertyAttributes } from "./attributes";

/**
 * Estados operacionais reais permitidos para `status`. Representa o estado
 * do imóvel na operação (não estado de UI). Lista fechada e honesta: apenas
 * os estados necessários para completude/qualidade/prontidão nesta unidade.
 */
export const PROPERTY_STATUS_VALUES = [
  "draft",
  "active",
  "paused",
  "sold",
  "rented",
  "archived",
] as const;

export type PropertyStatus = (typeof PROPERTY_STATUS_VALUES)[number];

export function isPropertyStatus(value: string): value is PropertyStatus {
  return (PROPERTY_STATUS_VALUES as readonly string[]).includes(value);
}

export type Property = {
  id: string;
  tenantId: string;
  referenceCode: string | null;
  title: string;
  propertyType: string | null;
  transactionType: string | null;
  status: PropertyStatus | string;
  city: string | null;
  neighborhood: string | null;
  price: number | null;
  description: string | null;
  attributes: PropertyAttributes;
  createdAt: string;
  updatedAt: string;
};

/** Input para criação — `tenantId` nunca vem do cliente; é resolvido no server. */
export type CreatePropertyInput = {
  referenceCode?: string | null;
  title: string;
  propertyType?: string | null;
  transactionType?: string | null;
  status: string;
  city?: string | null;
  neighborhood?: string | null;
  price?: number | null;
  description?: string | null;
  attributes?: unknown;
};

/** Input para atualização — todos os campos opcionais (patch parcial). */
export type UpdatePropertyInput = {
  referenceCode?: string | null;
  title?: string;
  propertyType?: string | null;
  transactionType?: string | null;
  status?: string;
  city?: string | null;
  neighborhood?: string | null;
  price?: number | null;
  description?: string | null;
  attributes?: unknown;
};
