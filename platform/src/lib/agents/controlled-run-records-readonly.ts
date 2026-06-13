import { createServerSupabaseClient } from "@/lib/auth/session";

// Controlled Run Records Read-only Integration (Lane 18).
// Leitura real da tabela public.controlled_run_records usando a sessao
// autenticada do operador e RLS do Supabase. NUNCA usa service role, NUNCA
// escreve, NUNCA faz insert/update/delete, NUNCA chama API externa, NUNCA cria
// agente/runner/tool/memoria. A query ainda filtra pelo tenant atual para manter
// a superficie do cockpit tenant-scoped mesmo antes da RLS negar qualquer linha
// fora do vinculo do usuario.

export type ControlledRunRecordReadonly = {
  id: string;
  capabilityKey: string;
  runMode: string;
  runStatus: string;
  sideEffects: string;
  persistenceStatus: string;
  operatorRole: string;
  resultSummary: string;
  createdAt: string;
};

export type ControlledRunRecordsReadonlyResult =
  | { status: "loaded"; records: ControlledRunRecordReadonly[] }
  | { status: "error"; message: string };

type ControlledRunRecordRow = {
  id: string;
  capability_key: string;
  run_mode: string;
  run_status: string;
  side_effects: string;
  persistence_status: string;
  operator_role: string;
  result_summary: string;
  created_at: string;
};

type GetControlledRunRecordsReadonlyInput = {
  tenantId: string;
  limit?: number;
};

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 10;

function clampLimit(limit: number | undefined): number {
  if (!limit || !Number.isFinite(limit)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
}

function toReadonlyRecord(row: ControlledRunRecordRow): ControlledRunRecordReadonly {
  return {
    id: row.id,
    capabilityKey: row.capability_key,
    runMode: row.run_mode,
    runStatus: row.run_status,
    sideEffects: row.side_effects,
    persistenceStatus: row.persistence_status,
    operatorRole: row.operator_role,
    resultSummary: row.result_summary,
    createdAt: row.created_at,
  };
}

export async function getControlledRunRecordsReadonly({
  tenantId,
  limit,
}: GetControlledRunRecordsReadonlyInput): Promise<ControlledRunRecordsReadonlyResult> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("controlled_run_records")
      .select(
        "id, capability_key, run_mode, run_status, side_effects, persistence_status, operator_role, result_summary, created_at",
      )
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(clampLimit(limit));

    if (error) {
      return {
        status: "error",
        message:
          "Nao foi possivel carregar os registros persistidos de operacoes controladas.",
      };
    }

    return {
      status: "loaded",
      records: ((data ?? []) as ControlledRunRecordRow[]).map(toReadonlyRecord),
    };
  } catch {
    return {
      status: "error",
      message:
        "Nao foi possivel carregar os registros persistidos de operacoes controladas.",
    };
  }
}
