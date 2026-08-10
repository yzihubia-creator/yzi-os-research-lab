// YZI IMOB - canonical registration vocabulary.
// Persisted values are stable identifiers; labels belong to presentation only.

export type ContractOption<T extends string> = { value: T; label: string; legacy?: boolean };

export const PROPERTY_TYPE_OPTIONS = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "loft", label: "Loft" },
  { value: "studio", label: "Studio" },
  { value: "flat", label: "Flat" },
  { value: "cobertura", label: "Cobertura" },
  { value: "duplex", label: "Duplex" },
  { value: "triplex", label: "Triplex" },
  { value: "kitnet", label: "Kitnet" },
  { value: "sala_comercial", label: "Sala comercial" },
  { value: "loja", label: "Loja" },
  { value: "galpao", label: "Galpão" },
  { value: "terreno", label: "Terreno" },
  { value: "lote", label: "Lote" },
  { value: "casa_condominio", label: "Casa em condomínio" },
  { value: "apartamento_garden", label: "Apartamento garden" },
  { value: "unidade_comercial", label: "Unidade comercial" },
  { value: "outro", label: "Outro" },
] as const satisfies readonly ContractOption<string>[];

export const PROPERTY_TYPE_LEGACY_OPTIONS = [
  { value: "comercial", label: "Comercial (legado)", legacy: true },
] as const satisfies readonly ContractOption<string>[];
export const PROPERTY_TYPE_VALUES = [
  ...PROPERTY_TYPE_OPTIONS.map(({ value }) => value),
  ...PROPERTY_TYPE_LEGACY_OPTIONS.map(({ value }) => value),
] as const;
export type PropertyType = (typeof PROPERTY_TYPE_VALUES)[number];

export const PROPERTY_FLOOR_PLAN_APPLICABLE_TYPES = [
  "apartamento", "casa", "loft", "studio", "flat", "cobertura", "duplex", "triplex",
  "kitnet", "sala_comercial", "loja", "galpao", "casa_condominio", "apartamento_garden",
  "unidade_comercial", "comercial",
] as const satisfies readonly PropertyType[];

export const PROPERTY_TRANSACTION_OPTIONS = [
  { value: "venda", label: "Venda" },
  { value: "aluguel", label: "Aluguel" },
  { value: "ambos", label: "Venda ou aluguel" },
] as const satisfies readonly ContractOption<string>[];
export const PROPERTY_TRANSACTION_VALUES = PROPERTY_TRANSACTION_OPTIONS.map(({ value }) => value);
export type PropertyTransaction = (typeof PROPERTY_TRANSACTION_VALUES)[number];

export const PROPERTY_RECORD_KIND_OPTIONS = [
  { value: "unit", label: "Unidade / imóvel individual" },
  { value: "development", label: "Empreendimento" },
] as const satisfies readonly ContractOption<string>[];
export const PROPERTY_RECORD_KIND_VALUES = PROPERTY_RECORD_KIND_OPTIONS.map(({ value }) => value);
export type PropertyRecordKind = (typeof PROPERTY_RECORD_KIND_VALUES)[number];

export const PROPERTY_COMMERCIAL_STAGE_OPTIONS = [
  { value: "pre_launch", label: "Pré-lançamento" },
  { value: "launch", label: "Lançamento" },
  { value: "under_construction", label: "Em construção" },
  { value: "ready_to_move_in", label: "Pronto para morar" },
  { value: "resale", label: "Imóvel pronto / usado" },
] as const satisfies readonly ContractOption<string>[];
export const PROPERTY_COMMERCIAL_STAGE_VALUES = PROPERTY_COMMERCIAL_STAGE_OPTIONS.map(({ value }) => value);
export type PropertyCommercialStage = (typeof PROPERTY_COMMERCIAL_STAGE_VALUES)[number];

export const PROPERTY_PRICE_QUALIFIER_OPTIONS = [
  { value: "exact", label: "Preço do imóvel / unidade" },
  { value: "starting_at", label: "A partir de" },
  { value: "on_request", label: "Sob consulta" },
] as const satisfies readonly ContractOption<string>[];
export const PROPERTY_PRICE_QUALIFIER_VALUES = PROPERTY_PRICE_QUALIFIER_OPTIONS.map(({ value }) => value);
export type PropertyPriceQualifier = (typeof PROPERTY_PRICE_QUALIFIER_VALUES)[number];

export const PROPERTY_FLOOR_DESIGNATION_OPTIONS = [
  { value: "ground", label: "Térreo" },
  { value: "number", label: "Andar numerado" },
  { value: "basement", label: "Subsolo" },
  { value: "mezzanine", label: "Mezanino" },
  { value: "rooftop", label: "Cobertura (pavimento)" },
] as const satisfies readonly ContractOption<string>[];
export const PROPERTY_FLOOR_DESIGNATION_VALUES = PROPERTY_FLOOR_DESIGNATION_OPTIONS.map(({ value }) => value);
export type PropertyFloorDesignation = (typeof PROPERTY_FLOOR_DESIGNATION_VALUES)[number];

export const PROPERTY_FEATURE_OPTIONS = [
  "varanda", "vista para o mar", "posição nascente", "dependência", "escritório",
  "área de serviço", "pé-direito duplo", "garden privativo", "closet", "lavabo",
] as const;
export const PROPERTY_AMENITY_OPTIONS = [
  "piscina", "rooftop", "academia", "salão de festas", "portaria", "elevador",
  "espaço gourmet", "lavanderia compartilhada", "recepção", "coworking", "playground",
] as const;
export const PROPERTY_SURROUNDING_OPTIONS = [
  "praia", "escolas", "hospitais", "comércio", "parques", "mobilidade",
  "supermercados", "restaurantes",
] as const;

export function includesContractValue<T extends string>(values: readonly T[], value: string | null | undefined): value is T {
  return typeof value === "string" && (values as readonly string[]).includes(value);
}

export function contractLabel(options: readonly ContractOption<string>[], value: string | null | undefined): string | null {
  return options.find((option) => option.value === value)?.label ?? null;
}
