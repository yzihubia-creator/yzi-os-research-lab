// YZI IMOB — Property row <-> domain mapping.

import { validatePropertyAttributes, type PropertyAttributes } from "./attributes";
import type { Property } from "./types";

/** Shape mínimo esperado da linha `public.yzi_imob_properties` (snake_case, do Supabase). */
export type PropertyRow = {
  id: string;
  tenant_id: string;
  reference_code: string | null;
  title: string;
  property_type: string | null;
  transaction_type: string | null;
  status: string;
  city: string | null;
  neighborhood: string | null;
  price: number | string | null;
  description: string | null;
  attributes: unknown;
  created_at: string;
  updated_at: string;
};

function toAttributes(raw: unknown): PropertyAttributes {
  const result = validatePropertyAttributes(raw);
  // Defesa em profundidade: se um dado legado/externo não bater com o
  // contrato, a leitura não quebra — apenas ignora o que não valida. A
  // escrita, por outro lado, sempre passa por `validation.ts` antes de
  // chegar ao banco.
  return result.valid ? result.attributes : {};
}

function toPrice(raw: number | string | null): number | null {
  if (raw === null || raw === undefined) return null;
  const numeric = typeof raw === "string" ? Number(raw) : raw;
  return Number.isFinite(numeric) ? numeric : null;
}

export function mapPropertyRow(row: PropertyRow): Property {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    referenceCode: row.reference_code,
    title: row.title,
    propertyType: row.property_type,
    transactionType: row.transaction_type,
    status: row.status,
    city: row.city,
    neighborhood: row.neighborhood,
    price: toPrice(row.price),
    description: row.description,
    attributes: toAttributes(row.attributes),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
