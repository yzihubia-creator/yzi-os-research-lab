"use client";

import { useMemo, useState, useTransition } from "react";

import { AssetsIcon, AuthorizationIcon } from "@/components/yzi-os/yzi-icons";
import {
  YziAlert,
  YziBadge,
  YziButton,
  YziPanel,
  YziStatusBadge,
} from "@/components/yzi-os/yzi-primitives";
import { YziEmptyVisualState } from "@/components/yzi-os/yzi-visual-primitives";
import {
  approveCheckpointAction,
  requestAdjustmentAction,
  requestReworkAction,
  startPrepareContactRunAction,
} from "@/lib/yzi-os/actions";
import type {
  RunStateResult,
  YziApprovalStatus,
  YziArtifact,
  YziArtifactStatus,
  YziRunActionRequest,
  YziRunState,
  YziRunStepStatus,
} from "@/lib/yzi-os/types";

// YZI IMOB — Workspace real da run (Unidade 3, Persisted Run Slice).
//
// Workflow PREPARE_PROPERTY_CONTACT: run persistida → step produtor →
// artefato versionado → checkpoint → decisão humana → production lock →
// artefato final selado. Nenhuma tool externa é chamada; "liberar" significa
// apenas selar o artefato dentro do sistema — nenhuma mensagem é enviada.
//
// Correção de UX/UI (sem mudança funcional): a superfície principal fala em
// linguagem operacional (o que foi preparado / o que depende do gestor / o
// que acontece depois); todo termo técnico (ids, hash, fingerprint, cursor
// de workflow, contagem de tentativas) vive só no inspector colapsável no
// final da página.

/** Par explícito (imóvel, lead) — cada operação é sempre um par, nunca só um imóvel. */
type CandidateOperation = { propertyId: string; leadId: string; title: string };

function operationKey(op: { propertyId: string; leadId: string }): string {
  return `${op.propertyId}::${op.leadId}`;
}

function parseOperationKey(key: string): { propertyId: string; leadId: string } | null {
  const [propertyId, leadId] = key.split("::");
  return propertyId && leadId ? { propertyId, leadId } : null;
}

type Phase =
  | "idle"
  | "starting"
  | "deciding_approve"
  | "deciding_adjust"
  | "deciding_rework";

const WORKFLOW_LABEL = "Preparar contato com o cliente";

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function runStatusTone(
  status: YziRunState["run"]["status"],
): "opportunity" | "authorization" | "blocked" | "neutral" {
  switch (status) {
    case "done":
      return "opportunity";
    case "awaiting_approval":
      return "authorization";
    case "failed":
    case "cancelled":
      return "blocked";
    default:
      return "neutral";
  }
}

function runStatusLabel(status: YziRunState["run"]["status"]): string {
  switch (status) {
    case "running":
      return "Preparando rascunho";
    case "awaiting_approval":
      return "Aguardando sua decisão";
    case "done":
      return "Concluído";
    case "failed":
      return "Falhou";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
}

const STEP_STATUS_LABEL: Record<YziRunStepStatus, string> = {
  pending: "Pendente",
  running: "Em andamento",
  completed: "Concluído",
  failed: "Falhou",
};

const ARTIFACT_STATUS_LABEL: Record<YziArtifactStatus, string> = {
  written: "Em revisão",
  sealed: "Selado",
  superseded: "Substituído",
};

const APPROVAL_STATUS_LABEL: Record<YziApprovalStatus, string> = {
  pending_review: "Aguardando decisão",
  approved: "Aprovado",
  rejected: "Rejeitado",
  expired: "Expirado",
  cancelled: "Cancelado",
};

const STEP_LABEL: Record<string, string> = {
  prepare_contact_followup: "Preparar rascunho de contato",
  release_contact_draft: "Selar rascunho como final",
};

function latestArtifact(artifacts: readonly YziArtifact[]): YziArtifact | null {
  if (artifacts.length === 0) return null;
  return artifacts.reduce((latest, a) => (a.version > latest.version ? a : latest));
}

function pendingDecision(
  actionRequests: readonly YziRunActionRequest[],
): YziRunActionRequest | null {
  return actionRequests.find((a) => a.status === "pending_review") ?? null;
}

function propertyTitleFor(
  activeAssetId: string,
  candidateOperations: readonly CandidateOperation[],
): string {
  return candidateOperations.find((op) => op.propertyId === activeAssetId)?.title ?? activeAssetId;
}

type HistoryEntry = {
  key: string;
  timestamp: string;
  title: string;
  detail: string | null;
};

/**
 * Deriva uma linha do tempo em linguagem simples a partir do estado já
 * carregado (artefatos + decisões) — nenhuma consulta nova, apenas
 * recombinação de dados já disponíveis para leitura humana.
 */
function buildHistoryEntries(state: YziRunState): HistoryEntry[] {
  const entries: HistoryEntry[] = [
    {
      key: "run-started",
      timestamp: state.run.createdAt,
      title: "Operação iniciada",
      detail: null,
    },
  ];

  for (const artifact of state.artifacts) {
    entries.push({
      key: `artifact-${artifact.id}`,
      timestamp: artifact.createdAt,
      title: `Rascunho (versão ${artifact.version}) preparado`,
      detail: null,
    });
  }

  for (const actionRequest of state.actionRequests) {
    if (actionRequest.status === "approved" && actionRequest.decidedAt) {
      entries.push({
        key: `decision-${actionRequest.id}`,
        timestamp: actionRequest.decidedAt,
        title: "Aprovado pelo gestor",
        detail: null,
      });
    } else if (actionRequest.status === "rejected" && actionRequest.decidedAt) {
      entries.push({
        key: `decision-${actionRequest.id}`,
        timestamp: actionRequest.decidedAt,
        title:
          actionRequest.decisionReason === "rework"
            ? "Reformulação solicitada"
            : "Ajuste solicitado",
        detail: actionRequest.decisionNote,
      });
    }
  }

  return entries.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

function OperationSummary({
  state,
  candidateOperations,
}: {
  state: YziRunState;
  candidateOperations: readonly CandidateOperation[];
}) {
  return (
    <YziPanel className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Resumo da operação
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            {WORKFLOW_LABEL} para{" "}
            <strong className="font-semibold text-[var(--yzi-text-primary)] [overflow-wrap:anywhere]">
              {propertyTitleFor(state.run.activeAssetId, candidateOperations)}
            </strong>
            .
          </p>
        </div>
        <span className="text-xs text-[var(--yzi-text-faint)]">
          Atualizado em {formatDateTime(state.run.updatedAt)}
        </span>
      </div>
      <YziStatusBadge tone={runStatusTone(state.run.status)}>
        {runStatusLabel(state.run.status)}
      </YziStatusBadge>
    </YziPanel>
  );
}

function StepTimeline({ state }: { state: YziRunState }) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby="runtime-timeline">
      <h2
        id="runtime-timeline"
        className="text-sm font-semibold text-[var(--yzi-text-primary)]"
      >
        Timeline
      </h2>
      <div className="flex flex-col rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)]">
        {state.steps.map((step, index) => (
          <div
            key={step.id}
            className={`grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${
              index > 0 ? "border-t border-[color:var(--yzi-border-subtle)]" : ""
            }`}
          >
            <span className="text-sm text-[var(--yzi-text-primary)] [overflow-wrap:anywhere]">
              {STEP_LABEL[step.stepKey] ?? step.stepKey}
            </span>
            <YziBadge
              tone={
                step.status === "completed"
                  ? "opportunity"
                  : step.status === "failed"
                    ? "blocked"
                    : step.status === "running"
                      ? "action"
                      : "neutral"
              }
              className="w-fit shrink-0 normal-case"
            >
              {STEP_STATUS_LABEL[step.status]}
            </YziBadge>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArtifactSection({ artifact }: { artifact: YziArtifact }) {
  const messageDraft =
    typeof artifact.content.message_draft === "string"
      ? artifact.content.message_draft
      : "—";

  return (
    <YziPanel
      variant={artifact.status === "sealed" ? "trust" : "authorization"}
      className="flex flex-col gap-3 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
          Artefato em revisão
        </h2>
        <YziStatusBadge
          tone={
            artifact.status === "sealed"
              ? "opportunity"
              : artifact.status === "superseded"
                ? "neutral"
                : "authorization"
          }
        >
          {ARTIFACT_STATUS_LABEL[artifact.status]}
        </YziStatusBadge>
      </div>

      <p className="text-sm leading-relaxed text-[var(--yzi-text-primary)] [overflow-wrap:anywhere]">
        {messageDraft}
      </p>
    </YziPanel>
  );
}

function DecisionPanel({
  onApprove,
  onAdjust,
  onRework,
  pending,
}: {
  onApprove: () => void;
  onAdjust: (note: string) => void;
  onRework: (note: string) => void;
  pending: Phase;
}) {
  const [note, setNote] = useState("");
  const busy = pending !== "idle";

  return (
    <YziPanel variant="authorization" className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 text-[var(--yzi-accent-authorization)]">
        <AuthorizationIcon className="h-4 w-4" />
        <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
          Decisão humana
        </h2>
      </div>

      <ul className="flex flex-col gap-1 text-xs text-[var(--yzi-text-secondary)]">
        <li>
          <strong className="text-[var(--yzi-text-primary)]">O que foi preparado:</strong>{" "}
          um rascunho de mensagem para o contato com o cliente sobre este imóvel.
        </li>
        <li>
          <strong className="text-[var(--yzi-text-primary)]">O que depende de você:</strong>{" "}
          aprovar, pedir um ajuste pontual ou pedir uma reformulação completa.
        </li>
        <li>
          <strong className="text-[var(--yzi-text-primary)]">O que acontece depois:</strong>{" "}
          ao aprovar, o rascunho é selado como versão final — nada é enviado
          automaticamente.
        </li>
      </ul>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nota curta — obrigatória para ajustar/reformular"
        rows={2}
        disabled={busy}
        className="w-full rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm text-[var(--yzi-text-primary)] outline-none transition-[border-color,box-shadow] duration-[var(--duration-fast)] focus:border-[color:rgba(var(--imob-ice),0.42)] focus:shadow-[0_0_0_3px_rgba(var(--imob-cold),0.14)]"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <YziButton
          variant="primary"
          size="sm"
          disabled={busy}
          onClick={onApprove}
          className="w-full sm:w-auto"
        >
          {pending === "deciding_approve" ? "Aprovando…" : "Aprovar"}
        </YziButton>
        <YziButton
          variant="secondary"
          size="sm"
          disabled={busy || !note.trim()}
          onClick={() => onAdjust(note)}
          className="w-full sm:w-auto"
        >
          {pending === "deciding_adjust" ? "Enviando ajuste…" : "Solicitar ajuste"}
        </YziButton>
        <YziButton
          variant="danger"
          size="sm"
          disabled={busy || !note.trim()}
          onClick={() => onRework(note)}
          className="w-full sm:w-auto"
        >
          {pending === "deciding_rework" ? "Enviando reformulação…" : "Reformular"}
        </YziButton>
      </div>
    </YziPanel>
  );
}

function HistorySection({ entries }: { entries: readonly HistoryEntry[] }) {
  if (entries.length <= 1) return null;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="runtime-history">
      <h2
        id="runtime-history"
        className="text-sm font-semibold text-[var(--yzi-text-primary)]"
      >
        Histórico
      </h2>
      <div className="flex flex-col rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)]">
        {entries.map((entry, index) => (
          <div
            key={entry.key}
            className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3 ${
              index > 0 ? "border-t border-[color:var(--yzi-border-subtle)]" : ""
            }`}
          >
            <span className="text-sm text-[var(--yzi-text-primary)] [overflow-wrap:anywhere]">
              {entry.title}
              {entry.detail ? (
                <span className="text-[var(--yzi-text-secondary)]"> — {entry.detail}</span>
              ) : null}
            </span>
            <span className="shrink-0 text-xs text-[var(--yzi-text-faint)]">
              {formatDateTime(entry.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function InspectorField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[var(--yzi-text-faint)]">
        {label}
      </dt>
      <dd className="font-mono text-[0.68rem] text-[var(--yzi-text-secondary)] [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}

function TechnicalInspector({
  state,
  history,
}: {
  state: YziRunState;
  history: readonly HistoryEntry[];
}) {
  return (
    <details className="group min-w-0 rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] bg-[rgba(255,255,255,0.015)] lg:h-fit">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-xs font-medium uppercase tracking-[0.08em] text-[var(--yzi-text-faint)] marker:content-['']">
        <span>Detalhes técnicos</span>
        <span className="transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="max-h-[70vh] overflow-y-auto border-t border-[color:var(--yzi-border-subtle)] p-4">
        <div className="flex flex-col gap-4">
        <dl className="flex flex-col gap-3">
          <InspectorField label="Workflow" value={state.run.workflowId} />
          <InspectorField label="Run id" value={state.run.id} />
          <InspectorField label="Cursor" value={state.run.cursorStep} />
          <InspectorField label="Imóvel (id)" value={state.run.activeAssetId} />
          <InspectorField label="Fingerprint de contexto" value={state.run.contextFingerprint} />
        </dl>

        <div className="flex flex-col gap-2">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[var(--yzi-text-faint)]">
            Steps
          </span>
          <dl className="flex flex-col gap-3">
            {state.steps.map((step) => (
              <InspectorField
                key={step.id}
                label={`${step.stepKey} · tentativa ${step.attempt}`}
                value={`${step.status} · início ${formatDateTime(step.startedAt)} · fim ${formatDateTime(step.completedAt)}`}
              />
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[var(--yzi-text-faint)]">
            Artefatos
          </span>
          <dl className="flex flex-col gap-3">
            {state.artifacts.map((artifact) => (
              <InspectorField
                key={artifact.id}
                label={`v${artifact.version} · ${artifact.visibility}`}
                value={`${artifact.status} · hash ${artifact.contentHash}`}
              />
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[var(--yzi-text-faint)]">
            Decisões (evidência)
          </span>
          <dl className="flex flex-col gap-3">
            {state.actionRequests.map((actionRequest) => (
              <InspectorField
                key={actionRequest.id}
                label={`${APPROVAL_STATUS_LABEL[actionRequest.status]}${
                  actionRequest.decisionReason ? ` · ${actionRequest.decisionReason}` : ""
                }`}
                value={`hash ${actionRequest.artifactHash} · decidido em ${formatDateTime(actionRequest.decidedAt)}${
                  actionRequest.decidedBy ? ` · por ${actionRequest.decidedBy}` : ""
                }`}
              />
            ))}
          </dl>
        </div>

        {history.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[var(--yzi-text-faint)]">
              Eventos
            </span>
            <dl className="flex flex-col gap-3">
              {history.map((entry) => (
                <InspectorField
                  key={entry.key}
                  label={entry.title}
                  value={`${entry.timestamp}${entry.detail ? ` · ${entry.detail}` : ""}`}
                />
              ))}
            </dl>
          </div>
        ) : null}
        </div>
      </div>
    </details>
  );
}

export function YziImobRunWorkspace({
  tenantId,
  userId,
  userRole,
  candidateOperations,
  initialState,
}: {
  tenantId: string;
  userId: string;
  userRole: string;
  candidateOperations: readonly CandidateOperation[];
  initialState: RunStateResult;
}) {
  const [selectedOperationKey, setSelectedOperationKey] = useState(
    candidateOperations[0] ? operationKey(candidateOperations[0]) : "",
  );
  const [result, setResult] = useState<RunStateResult>(initialState);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const state = result.status === "loaded" ? result.state : null;
  const artifact = useMemo(
    () => (state ? latestArtifact(state.artifacts) : null),
    [state],
  );
  const decision = useMemo(
    () => (state ? pendingDecision(state.actionRequests) : null),
    [state],
  );
  const history = useMemo(() => (state ? buildHistoryEntries(state) : []), [state]);

  function handleStart() {
    setError(null);
    const parsed = parseOperationKey(selectedOperationKey);
    if (!parsed) {
      setError("Selecione um imóvel e um lead para iniciar o rascunho.");
      return;
    }
    setPhase("starting");
    startTransition(async () => {
      const started = await startPrepareContactRunAction({
        tenantId,
        userId,
        userRole,
        activeAssetId: parsed.propertyId,
        leadId: parsed.leadId,
      });
      setPhase("idle");
      if (started.status === "started") {
        setResult({ status: "loaded", state: started.state });
        return;
      }
      if (started.status === "blocked") {
        setError(`Não foi possível iniciar: ${started.reason}`);
        return;
      }
      setError(started.message);
    });
  }

  function handleApprove() {
    if (!state || !decision) return;
    setError(null);
    setPhase("deciding_approve");
    startTransition(async () => {
      const decided = await approveCheckpointAction({
        tenantId,
        runId: state.run.id,
        actionRequestId: decision.id,
      });
      setPhase("idle");
      if (decided.status === "decided") {
        setResult({ status: "loaded", state: decided.state });
        return;
      }
      setError(decided.message);
    });
  }

  function handleAdjust(note: string) {
    if (!state || !decision) return;
    setError(null);
    setPhase("deciding_adjust");
    startTransition(async () => {
      const decided = await requestAdjustmentAction({
        tenantId,
        userId,
        userRole,
        runId: state.run.id,
        actionRequestId: decision.id,
        note,
      });
      setPhase("idle");
      if (decided.status === "decided") {
        setResult({ status: "loaded", state: decided.state });
        return;
      }
      setError(decided.message);
    });
  }

  function handleRework(note: string) {
    if (!state || !decision) return;
    setError(null);
    setPhase("deciding_rework");
    startTransition(async () => {
      const decided = await requestReworkAction({
        tenantId,
        userId,
        userRole,
        runId: state.run.id,
        actionRequestId: decision.id,
        note,
      });
      setPhase("idle");
      if (decided.status === "decided") {
        setResult({ status: "loaded", state: decided.state });
        return;
      }
      setError(decided.message);
    });
  }

  return (
    <section className="flex flex-col gap-6">
      {error ? (
        <YziAlert tone="blocked" title="Não foi possível concluir a ação">
          {error}
        </YziAlert>
      ) : null}

      {result.status === "error" ? (
        <YziAlert tone="blocked" title="Estado indisponível">
          {result.message}
        </YziAlert>
      ) : null}

      {result.status === "no_run" ? (
        candidateOperations.length === 0 ? (
          <YziEmptyVisualState
            icon={AssetsIcon}
            message="Nenhum par imóvel/lead disponível para iniciar um contato nesta operação."
          />
        ) : (
          <YziPanel className="flex max-w-3xl flex-col gap-3 p-4">
            <span className="text-sm text-[var(--yzi-text-secondary)]">
              Nenhuma operação em andamento. Escolha o imóvel e o lead para a
              YZI preparar o rascunho de contato.
            </span>
            <select
              value={selectedOperationKey}
              onChange={(e) => setSelectedOperationKey(e.target.value)}
              disabled={pending}
              className="w-full rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm text-[var(--yzi-text-primary)]"
            >
              {candidateOperations.map((op) => (
                <option key={operationKey(op)} value={operationKey(op)}>
                  {op.title}
                </option>
              ))}
            </select>
            <YziButton
              variant="primary"
              size="sm"
              disabled={pending}
              onClick={handleStart}
              className="w-full sm:w-auto"
            >
              {phase === "starting" ? "Iniciando…" : "Iniciar rascunho de contato"}
            </YziButton>
          </YziPanel>
        )
      ) : null}

      {state ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] lg:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            <OperationSummary state={state} candidateOperations={candidateOperations} />

            <YziAlert
              tone={state.run.status === "done" ? "success" : "info"}
              title="Execução atual"
            >
              {state.run.status === "running" &&
                "A YZI está preparando o rascunho de contato."}
              {state.run.status === "awaiting_approval" &&
                "Rascunho pronto. Aguardando sua decisão — silêncio não aprova."}
              {state.run.status === "done" &&
                "Rascunho liberado. Nenhuma mensagem foi enviada — apenas o conteúdo foi selado como versão final."}
              {state.run.status === "failed" &&
                "Não foi possível concluir esta operação."}
              {state.run.status === "cancelled" && "Esta operação foi cancelada."}
            </YziAlert>

            <StepTimeline state={state} />

            {artifact ? <ArtifactSection artifact={artifact} /> : null}

            {state.run.status === "awaiting_approval" && decision ? (
              <DecisionPanel
                onApprove={handleApprove}
                onAdjust={handleAdjust}
                onRework={handleRework}
                pending={phase}
              />
            ) : null}

            <HistorySection entries={history} />
          </div>

          <TechnicalInspector state={state} history={history} />
        </div>
      ) : null}
    </section>
  );
}
