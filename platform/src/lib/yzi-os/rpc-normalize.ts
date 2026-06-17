// Helpers internos de normalização das respostas das RPCs YZI OS.
//
// As RPCs foram criadas direto no Supabase e podem retornar a linha criada como
// composite/jsonb (objeto), como SETOF (array) ou um identificador cru (string).
// Estes helpers leem essas formas de modo DEFENSIVO e saneado, sem `any`, sem
// inventar dados: quando um campo não vem, devolvem fallback honesto.
//
// Módulo PURO: sem I/O, sem Supabase, sem env, sem service role, sem SQL.

/** Extrai a primeira linha útil de um retorno de RPC (objeto, array ou string). */
export function pickRow(
  data: unknown,
): Record<string, unknown> | string | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (typeof row === "string") {
    return row;
  }
  if (row && typeof row === "object") {
    return row as Record<string, unknown>;
  }
  return null;
}

/** Procura um identificador string nas chaves candidatas (ou na string crua). */
export function pickId(
  row: Record<string, unknown> | string | null,
  keys: readonly string[],
): string | null {
  if (typeof row === "string") {
    return row.length > 0 ? row : null;
  }
  if (!row) {
    return null;
  }
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return null;
}

/** Lê uma string de um objeto desconhecido, com fallback. */
export function readString(
  source: Record<string, unknown>,
  key: string,
  fallback = "—",
): string {
  const value = source[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

/** Lê um número finito de um objeto desconhecido, com fallback 0. */
export function readNumber(
  source: Record<string, unknown>,
  key: string,
): number {
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Lê um booleano estritamente verdadeiro de um objeto desconhecido. */
export function readBoolean(
  source: Record<string, unknown>,
  key: string,
): boolean {
  return source[key] === true;
}

/** Garante um objeto-registro a partir de um campo aninhado desconhecido. */
export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
