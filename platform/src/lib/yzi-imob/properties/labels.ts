// YZI IMOB — Property presentation labels (leitura, somente).
//
// Traduz enums do contrato (lib/yzi-imob/properties/types.ts) para rótulos em
// português. Os valores persistidos permanecem inalterados; isto é
// presentation-only, seguindo o mesmo padrão de `properties/contract.ts`.

import type { ContractOption } from "./contract";
import type { CompletenessField } from "./completeness";
import type { QualityCheck } from "./quality";
import {
  PROPERTY_AVAILABILITY_STATUS_VALUES,
  PROPERTY_EDITORIAL_STATUS_VALUES,
  PROPERTY_FURNISHED_STATUS_VALUES,
  PROPERTY_OPERATIONAL_STATUS_VALUES,
  PROPERTY_PROXIMITY_SOURCE_VALUES,
  PROPERTY_PROXIMITY_TRAVEL_MODE_VALUES,
  PROPERTY_SOLAR_ORIENTATION_VALUES,
  PROPERTY_STAGE_VALUES,
} from "./types";

export const PROPERTY_OPERATIONAL_STATUS_OPTIONS = [
  { value: "draft", label: "Rascunho" },
  { value: "active", label: "Ativo" },
  { value: "paused", label: "Pausado" },
  { value: "archived", label: "Arquivado" },
] as const satisfies readonly ContractOption<(typeof PROPERTY_OPERATIONAL_STATUS_VALUES)[number]>[];

/** Valores históricos de `status` que ainda podem estar persistidos, mas não fazem parte da lista operacional atual. */
export const PROPERTY_OPERATIONAL_STATUS_LEGACY_OPTIONS = [
  { value: "sold", label: "Vendido (legado)", legacy: true },
  { value: "rented", label: "Alugado (legado)", legacy: true },
  { value: "em_captacao", label: "Em captação (legado)", legacy: true },
] as const satisfies readonly ContractOption<string>[];

export const PROPERTY_STAGE_OPTIONS = [
  { value: "draft", label: "Rascunho" },
  { value: "intake", label: "Entrada" },
  { value: "review", label: "Em revisão" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Arquivado" },
] as const satisfies readonly ContractOption<(typeof PROPERTY_STAGE_VALUES)[number]>[];

export const PROPERTY_AVAILABILITY_STATUS_OPTIONS = [
  { value: "available", label: "Disponível" },
  { value: "reserved", label: "Reservado" },
  { value: "sold", label: "Vendido" },
  { value: "rented", label: "Alugado" },
  { value: "unavailable", label: "Indisponível" },
] as const satisfies readonly ContractOption<(typeof PROPERTY_AVAILABILITY_STATUS_VALUES)[number]>[];

export const PROPERTY_EDITORIAL_STATUS_OPTIONS = [
  { value: "raw", label: "Sem revisão" },
  { value: "pending_review", label: "Em revisão" },
  { value: "approved", label: "Aprovado" },
  { value: "rejected", label: "Rejeitado" },
] as const satisfies readonly ContractOption<(typeof PROPERTY_EDITORIAL_STATUS_VALUES)[number]>[];

export const PROPERTY_SOLAR_ORIENTATION_OPTIONS = [
  { value: "north", label: "Norte" },
  { value: "south", label: "Sul" },
  { value: "east", label: "Leste" },
  { value: "west", label: "Oeste" },
  { value: "northeast", label: "Nordeste" },
  { value: "northwest", label: "Noroeste" },
  { value: "southeast", label: "Sudeste" },
  { value: "southwest", label: "Sudoeste" },
] as const satisfies readonly ContractOption<(typeof PROPERTY_SOLAR_ORIENTATION_VALUES)[number]>[];

export const PROPERTY_FURNISHED_STATUS_OPTIONS = [
  { value: "unfurnished", label: "Não mobiliado" },
  { value: "semi_furnished", label: "Semimobiliado" },
  { value: "furnished", label: "Mobiliado" },
] as const satisfies readonly ContractOption<(typeof PROPERTY_FURNISHED_STATUS_VALUES)[number]>[];

export const PROPERTY_PROXIMITY_TRAVEL_MODE_OPTIONS = [
  { value: "walk", label: "A pé" },
  { value: "drive", label: "Carro" },
  { value: "transit", label: "Transporte público" },
  { value: "bike", label: "Bicicleta" },
] as const satisfies readonly ContractOption<(typeof PROPERTY_PROXIMITY_TRAVEL_MODE_VALUES)[number]>[];

export const PROPERTY_PROXIMITY_SOURCE_OPTIONS = [
  { value: "manual", label: "Manual" },
  { value: "extracted_from_text", label: "Extraída do texto" },
  { value: "imported", label: "Importada" },
  { value: "external_api", label: "API externa" },
] as const satisfies readonly ContractOption<(typeof PROPERTY_PROXIMITY_SOURCE_VALUES)[number]>[];

/** Rótulos honestos para os campos de completude (`computePropertyCompleteness`). */
export const COMPLETENESS_FIELD_LABEL: Record<CompletenessField, string> = {
  title: "Título",
  referenceCode: "Referência",
  propertyType: "Tipo do imóvel",
  transactionType: "Transação",
  city: "Cidade",
  neighborhood: "Bairro",
  price: "Preço",
  description: "Descrição",
  attributes: "Características do imóvel",
};

export function completenessFieldLabel(field: CompletenessField): string {
  return COMPLETENESS_FIELD_LABEL[field] ?? field;
}

/** Rótulos honestos para as checagens de qualidade (`computePropertyQuality`). */
export const QUALITY_CHECK_LABEL: Record<QualityCheck["name"], string> = {
  title_length: "Título com tamanho adequado",
  description_length: "Descrição com tamanho adequado",
  has_price: "Preço informado",
  has_location: "Cidade e bairro informados",
  has_type_and_transaction: "Tipo e transação informados",
  completeness_at_least_70pct: "Cadastro pelo menos 70% completo",
};

export function qualityCheckLabel(name: string): string {
  return QUALITY_CHECK_LABEL[name] ?? name;
}
