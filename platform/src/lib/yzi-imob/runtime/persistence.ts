// YZI IMOB Runtime — Persistence Bridge (Unidade 3, Persisted Run Slice).
//
// Ponte PURA entre o pipeline puro do Runtime (types/workflows/context-builder/
// orchestrator, todos inalterados nesta unidade) e a camada de persistência
// real em `lib/yzi-os/runs.ts`. Este módulo NÃO importa Supabase, NÃO faz I/O
// de rede, NÃO lê cookies/sessão. Apenas deriva, de forma determinística, o
// conteúdo do artefato `contact_draft` a partir do contexto já montado pelo
// Context Builder existente, valida o gate estrutural e calcula o hash.
//
// Preserva o comportamento validado do Agent Lab sem filesystem/Markdown:
// gate binário = validação estrutural em código (nunca "declaração do
// modelo"); hash = liga a aprovação à versão exata do artefato.

import { createHash } from "node:crypto";

import type { BuiltContext, RuntimeRequest } from "./types";

/** Modo de derivação do conteúdo — espelha a decisão humana que o originou. */
export type ContactDraftMode = "initial" | "adjust" | "rework";

/** Artifact contract `contact_draft` — único contrato desta unidade. */
export type ContactDraftContent = {
  contract: "contact_draft";
  tenant_id: string;
  property_id: string;
  property_title: string;
  message_draft: string;
  channel: "internal_draft";
  context_fingerprint: string;
  mode: ContactDraftMode;
  /** Nota curta da decisão humana que originou este attempt (adjust/rework). */
  revision_note: string | null;
  prepared_at: string;
  note: string;
};

const DRAFT_DISCLAIMER =
  "Rascunho interno. Nenhuma mensagem é enviada nesta unidade — liberar significa apenas selar o artefato.";

/**
 * Extrai o resumo do imóvel a partir do bloco `execution` já montado pelo
 * Context Builder (Spec §5). Não consulta nenhuma fonte nova — reaproveita
 * exatamente o que o pipeline puro já resolveu e validou (tenant boundary
 * incluso). Retorna `null` honestamente se o bloco não existir (defensivo;
 * não deveria ocorrer quando `context.complete === true`).
 */
function extractExecutionSummary(context: BuiltContext): string | null {
  const block = context.blocks.find((b) => b.id === "execution");
  return block?.summary ?? null;
}

/**
 * Deriva o conteúdo do rascunho de contato de forma determinística (sem IA,
 * sem tool externa — a "inteligência" desta unidade é o gate estrutural e a
 * governança, não a geração de texto). `mode="rework"` explicitamente NÃO
 * reaproveita `revisionNote` como base factual — usa a mesma derivação limpa
 * de `mode="initial"`, apenas anexando a nota como contexto de reformulação
 * (nunca como autoridade sobre o conteúdo anterior).
 */
export function draftContactDraftContent(params: {
  request: RuntimeRequest;
  context: BuiltContext;
  mode: ContactDraftMode;
  revisionNote?: string | null;
  now?: Date;
}): ContactDraftContent | null {
  const { request, context, mode } = params;
  const summary = extractExecutionSummary(context);
  if (!summary || !request.active_asset_id) {
    return null;
  }

  const preparedAt = (params.now ?? new Date()).toISOString();
  const revisionNote = params.revisionNote?.trim() || null;

  const baseMessage = `Olá! Sobre o imóvel — ${summary} Podemos avançar com o próximo passo?`;

  const messageDraft =
    mode === "initial"
      ? baseMessage
      : mode === "adjust" && revisionNote
        ? `${baseMessage} (ajuste solicitado: ${revisionNote})`
        : mode === "rework"
          ? `${baseMessage} (reformulado a pedido do gestor${revisionNote ? `: ${revisionNote}` : ""}.)`
          : baseMessage;

  return {
    contract: "contact_draft",
    tenant_id: request.tenant_id,
    property_id: request.active_asset_id,
    property_title: summary,
    message_draft: messageDraft,
    channel: "internal_draft",
    context_fingerprint: context.fingerprint,
    mode,
    revision_note: mode === "initial" ? null : revisionNote,
    prepared_at: preparedAt,
    note: DRAFT_DISCLAIMER,
  };
}

/** Resultado do gate estrutural — nunca confia na declaração do modelo. */
export type ContentGateResult =
  | { valid: true }
  | { valid: false; errors: readonly string[] };

/**
 * Gate estrutural do artefato `contact_draft` — roda em código servidor,
 * SEMPRE antes de persistir. Verifica existência, não-vacuidade e shape
 * mínimo. Constraints CHECK equivalentes existem no banco (defesa em
 * profundidade), mas o avanço do workflow nunca depende só delas.
 */
export function validateContactDraftContent(
  content: ContactDraftContent | null,
): ContentGateResult {
  const errors: string[] = [];

  if (!content) {
    return { valid: false, errors: ["content_missing"] };
  }
  if (content.contract !== "contact_draft") {
    errors.push("contract_mismatch");
  }
  if (!content.tenant_id) {
    errors.push("tenant_id_missing");
  }
  if (!content.property_id) {
    errors.push("property_id_missing");
  }
  if (!content.message_draft || content.message_draft.trim().length === 0) {
    errors.push("message_draft_empty");
  }
  if (!content.context_fingerprint) {
    errors.push("context_fingerprint_missing");
  }
  if (!["initial", "adjust", "rework"].includes(content.mode)) {
    errors.push("mode_invalid");
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Hash determinístico do conteúdo — liga a aprovação à versão exata do
 * artefato (Bloco 8 do Implementation Readiness Map). Serialização com
 * chaves ordenadas para que o hash seja estável independente da ordem de
 * inserção das propriedades do objeto.
 */
export function computeContentHash(content: ContactDraftContent): string {
  const canonical = JSON.stringify(content, Object.keys(content).sort());
  return createHash("sha256").update(canonical).digest("hex");
}
