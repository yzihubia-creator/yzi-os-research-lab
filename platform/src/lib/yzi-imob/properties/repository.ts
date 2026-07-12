// YZI IMOB — Property Repository (server-side, tenant-scoped, RLS-backed).
//
// Único ponto de I/O deste módulo. Usa o client Supabase de sessão
// (anon/publishable key + cookies — NUNCA service role); RLS em
// `yzi_imob_properties` é o limite de acesso real. `tenantId` é sempre
// filtrado explicitamente aqui como defesa em profundidade (nunca confia
// apenas em RLS), mas a resolução de qual tenant o usuário atual pertence é
// responsabilidade do chamador (fora do escopo desta unidade — não há tela
// conectada ainda).

import type { SupabaseClient } from "@supabase/supabase-js";

import { mapPropertyRow, type PropertyRow } from "./mapper";
import type { Property } from "./types";
import type { ValidatedCreateProperty, ValidatedUpdateProperty } from "./validation";

const PROPERTY_COLUMNS =
  "id, tenant_id, reference_code, title, property_type, transaction_type, status, city, neighborhood, price, description, attributes, created_at, updated_at";

export type PropertyRepositoryError =
  | "not_found"
  | "cross_tenant_denied"
  | "insert_failed"
  | "update_failed"
  | "list_failed";

export type PropertyRepositoryResult<T> =
  | { status: "ok"; value: T }
  | { status: "error"; code: PropertyRepositoryError; detail?: string };

/**
 * Lê um imóvel por id, sempre filtrando por `tenant_id`. Um id de outro
 * tenant é tratado como `not_found` — nunca vaza a existência do registro
 * (cross-tenant leakage é bloqueio, não apenas negado).
 */
export async function getPropertyById(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
): Promise<PropertyRepositoryResult<Property>> {
  const { data, error } = await supabase
    .from("yzi_imob_properties")
    .select(PROPERTY_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("id", propertyId)
    .maybeSingle();

  if (error) {
    return { status: "error", code: "not_found", detail: error.message };
  }
  if (!data) {
    return { status: "error", code: "not_found" };
  }
  return { status: "ok", value: mapPropertyRow(data as PropertyRow) };
}

export type ListPropertiesOptions = {
  status?: string;
  limit?: number;
  offset?: number;
};

const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 200;

/** Listagem tenant-scoped, paginada e ordenada por atualização mais recente. */
export async function listProperties(
  supabase: SupabaseClient,
  tenantId: string,
  options: ListPropertiesOptions = {},
): Promise<PropertyRepositoryResult<{ items: readonly Property[]; total: number }>> {
  const limit = Math.min(options.limit ?? DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
  const offset = options.offset ?? 0;

  let query = supabase
    .from("yzi_imob_properties")
    .select(PROPERTY_COLUMNS, { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error, count } = await query;

  if (error) {
    return { status: "error", code: "list_failed", detail: error.message };
  }
  return {
    status: "ok",
    value: {
      items: (data as PropertyRow[] | null ?? []).map(mapPropertyRow),
      total: count ?? 0,
    },
  };
}

/** Cria um imóvel. `tenantId` é resolvido pelo chamador — nunca aceito do payload do cliente. */
export async function createProperty(
  supabase: SupabaseClient,
  tenantId: string,
  input: ValidatedCreateProperty,
): Promise<PropertyRepositoryResult<Property>> {
  const { data, error } = await supabase
    .from("yzi_imob_properties")
    .insert({
      tenant_id: tenantId,
      reference_code: input.referenceCode,
      title: input.title,
      property_type: input.propertyType,
      transaction_type: input.transactionType,
      status: input.status,
      city: input.city,
      neighborhood: input.neighborhood,
      price: input.price,
      description: input.description,
      attributes: input.attributes,
    })
    .select(PROPERTY_COLUMNS)
    .single();

  if (error || !data) {
    return { status: "error", code: "insert_failed", detail: error?.message };
  }
  return { status: "ok", value: mapPropertyRow(data as PropertyRow) };
}

/**
 * Atualiza um imóvel, sempre filtrando por `tenant_id` + `id` no `.update()`
 * — nunca só no `where` lógico do chamador. Zero linhas afetadas é
 * `not_found` (inclui o caso cross-tenant).
 */
export async function updateProperty(
  supabase: SupabaseClient,
  tenantId: string,
  propertyId: string,
  input: ValidatedUpdateProperty,
): Promise<PropertyRepositoryResult<Property>> {
  const patch: Record<string, unknown> = {};
  if (input.referenceCode !== undefined) patch.reference_code = input.referenceCode;
  if (input.title !== undefined) patch.title = input.title;
  if (input.propertyType !== undefined) patch.property_type = input.propertyType;
  if (input.transactionType !== undefined) patch.transaction_type = input.transactionType;
  if (input.status !== undefined) patch.status = input.status;
  if (input.city !== undefined) patch.city = input.city;
  if (input.neighborhood !== undefined) patch.neighborhood = input.neighborhood;
  if (input.price !== undefined) patch.price = input.price;
  if (input.description !== undefined) patch.description = input.description;
  if (input.attributes !== undefined) patch.attributes = input.attributes;

  const { data, error } = await supabase
    .from("yzi_imob_properties")
    .update(patch)
    .eq("tenant_id", tenantId)
    .eq("id", propertyId)
    .select(PROPERTY_COLUMNS)
    .maybeSingle();

  if (error) {
    return { status: "error", code: "update_failed", detail: error.message };
  }
  if (!data) {
    return { status: "error", code: "not_found" };
  }
  return { status: "ok", value: mapPropertyRow(data as PropertyRow) };
}
