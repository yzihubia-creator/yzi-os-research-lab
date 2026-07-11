"use client";

import { useMemo, useState, useTransition } from "react";

import {
  AssetsIcon,
  AuditIcon,
  AuthorizationIcon,
} from "@/components/yzi-os/yzi-icons";
import {
  YziAlert,
  YziBadge,
  YziButton,
  YziDivider,
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
  YziArtifact,
  YziRunActionRequest,
  YziRunState,
} from "@/lib/yzi-os/types";

// YZI IMOB — Workspace real da run (Unidade 3, Persisted Run Slice).
//
// Workflow PREPARE_PROPERTY_CONTACT: run persistida → step produtor →
// artefato versionado → checkpoint → decisão humana → production lock →
// artefato final selado. Nenhuma tool externa é chamada; "liberar" significa
// apenas selar o artefato dentro do sistema — nenhuma mensagem é enviada.
// Reutiliza o Dashboard Visual System (mesmos primitives do preview do
// runtime e da fila de autorizações); nenhum componente novo de card wall.

type CandidateProperty = { id: string; title: string };

type Phase =
  | "idle"
  | "starting"
  | "deciding_approve"
  | "deciding_adjust"
  | "deciding_rework";

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

function latestArtifact(artifacts: readonly YziArtifact[]): YziArtifact | null {
  if (artifacts.length === 0) return null;
  return artifacts.reduce((latest, a) => (a.version > latest.version ? a : latest));
}

function pendingDecision(
  actionRequests: readonly YziRunActionRequest[],
): YziRunActionRequest | null {
  return actionRequests.find((a) => a.status === "pending_review") ?? null;
}

function StepTimeline({ state }: { state: YziRunState }) {
  const stepLabels: Record<string, string> = {
    prepare_contact_followup: "1 · Preparar rascunho de contato",
    release_contact_draft: "2 · Selar rascunho como final",
  };

  return (
    <div className="flex flex-col gap-2">
      {state.steps.map((step) => (
        <div
          key={step.id}
          className="flex items-center justify-between gap-3 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2"
        >
          <span className="text-xs text-[var(--yzi-text-primary)]">
            {stepLabels[step.stepKey] ?? step.stepKey}
            {step.attempt > 1 ? (
              <span className="ml-2 text-[var(--yzi-text-faint)]">
                (attempt {step.attempt})
              </span>
            ) : null}
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
          >
            {step.status}
          </YziBadge>
        </div>
      ))}
    </div>
  );
}

function ArtifactPanel({ artifact }: { artifact: YziArtifact }) {
  const messageDraft =
    typeof artifact.content.message_draft === "string"
      ? artifact.content.message_draft
      : "—";
  const mode = typeof artifact.content.mode === "string" ? artifact.content.mode : "—";
  const revisionNote =
    typeof artifact.content.revision_note === "string" ? artifact.content.revision_note : null;

  return (
    <YziPanel
      variant={artifact.status === "sealed" ? "trust" : "authorization"}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--yzi-text-secondary)]">
          Artefato — {artifact.contractKey} · v{artifact.version}
        </span>
        <div className="flex gap-2">
          <YziBadge tone="neutral" className="normal-case">
            {artifact.visibility}
          </YziBadge>
          <YziStatusBadge
            tone={
              artifact.status === "sealed"
                ? "opportunity"
                : artifact.status === "superseded"
                  ? "neutral"
                  : "authorization"
            }
          >
            {artifact.status}
          </YziStatusBadge>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-[var(--yzi-text-primary)]">
        {messageDraft}
      </p>

      {revisionNote ? (
        <p className="text-xs text-[var(--yzi-text-secondary)]">
          Nota da última decisão: {revisionNote}
        </p>
      ) : null}

      <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-[0.68rem] text-[var(--yzi-text-faint)] sm:grid-cols-2">
        <div>
          <dt className="inline">modo: </dt>
          <dd className="inline">{mode}</dd>
        </div>
        <div>
          <dt className="inline">criado em: </dt>
          <dd className="inline">{formatDateTime(artifact.createdAt)}</dd>
        </div>
        <div className="sm:col-span-2 break-all">
          <dt className="inline">hash: </dt>
          <dd className="inline font-mono">{artifact.contentHash}</dd>
        </div>
      </dl>
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
    <YziPanel variant="authorization" className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-[var(--yzi-accent-authorization)]">
        <AuthorizationIcon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.08em]">
          Decisão do gestor
        </span>
      </div>
      <p className="text-xs text-[var(--yzi-text-secondary)]">
        Aprovar sela o artefato como final (nada é enviado). Ajustar mantém a
        mesma base e aplica sua nota. Reformular descarta o rascunho atual e
        gera um novo do zero.
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nota curta — obrigatória para ajustar/reformular"
        rows={2}
        disabled={busy}
        className="w-full rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-xs text-[var(--yzi-text-primary)] outline-none focus:border-[color:rgba(63,224,197,0.42)]"
      />
      <div className="flex flex-wrap gap-2">
        <YziButton
          variant="primary"
          size="sm"
          disabled={busy}
          onClick={onApprove}
        >
          {pending === "deciding_approve" ? "Aprovando…" : "Aprovar"}
        </YziButton>
        <YziButton
          variant="secondary"
          size="sm"
          disabled={busy || !note.trim()}
          onClick={() => onAdjust(note)}
        >
          {pending === "deciding_adjust" ? "Enviando ajuste…" : "Solicitar ajuste"}
        </YziButton>
        <YziButton
          variant="danger"
          size="sm"
          disabled={busy || !note.trim()}
          onClick={() => onRework(note)}
        >
          {pending === "deciding_rework" ? "Enviando reformulação…" : "Reformular"}
        </YziButton>
      </div>
    </YziPanel>
  );
}

export function YziImobRunWorkspace({
  tenantId,
  userId,
  userRole,
  candidateProperties,
  initialState,
}: {
  tenantId: string;
  userId: string;
  userRole: string;
  candidateProperties: readonly CandidateProperty[];
  initialState: RunStateResult;
}) {
  const [selectedAssetId, setSelectedAssetId] = useState(
    candidateProperties[0]?.id ?? "",
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

  function handleStart() {
    setError(null);
    if (!selectedAssetId) {
      setError("Selecione um imóvel para iniciar o rascunho.");
      return;
    }
    setPhase("starting");
    startTransition(async () => {
      const started = await startPrepareContactRunAction({
        tenantId,
        userId,
        userRole,
        activeAssetId: selectedAssetId,
      });
      setPhase("idle");
      if (started.status === "started") {
        setResult({ status: "loaded", state: started.state });
        return;
      }
      if (started.status === "blocked") {
        setError(`Bloqueado pelo runtime: ${started.reason}`);
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
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[var(--yzi-text-secondary)]">
          YZI IMOB · Run Workspace · PREPARE_PROPERTY_CONTACT
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-[var(--yzi-text-primary)]">
          Contato sobre o imóvel — do rascunho à liberação
        </h2>
      </div>

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
        candidateProperties.length === 0 ? (
          <YziEmptyVisualState
            icon={AssetsIcon}
            message="Nenhum imóvel disponível para iniciar o rascunho nesta unidade (catálogo mock limitado ao tenant de demonstração)."
          />
        ) : (
          <YziPanel className="flex flex-col gap-3">
            <span className="text-xs text-[var(--yzi-text-secondary)]">
              A YZI explica: nenhuma run ativa. Escolha um imóvel para preparar
              o rascunho de contato.
            </span>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              disabled={pending}
              className="w-full rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm text-[var(--yzi-text-primary)]"
            >
              {candidateProperties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <YziButton variant="primary" size="sm" disabled={pending} onClick={handleStart}>
              {phase === "starting" ? "Iniciando…" : "Iniciar rascunho de contato"}
            </YziButton>
          </YziPanel>
        )
      ) : null}

      {state ? (
        <>
          <YziPanel className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
              <AuditIcon className="h-4 w-4" />
              <span className="text-sm font-semibold text-[var(--yzi-text-primary)]">
                Run {state.run.id.slice(0, 8)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--yzi-text-secondary)]">
              <span>cursor: {state.run.cursorStep}</span>
              <span>atualizado em {formatDateTime(state.run.updatedAt)}</span>
              <YziStatusBadge tone={runStatusTone(state.run.status)}>
                {state.run.status}
              </YziStatusBadge>
            </div>
          </YziPanel>

          <YziAlert tone={state.run.status === "done" ? "success" : "info"} title="A YZI explica">
            {state.run.status === "running" &&
              "Preparando o rascunho de contato."}
            {state.run.status === "awaiting_approval" &&
              "Rascunho pronto. Aguardando sua decisão — silêncio não aprova."}
            {state.run.status === "done" &&
              "Artefato final selado. Nenhuma mensagem foi enviada — apenas o rascunho foi liberado dentro do sistema."}
            {state.run.status === "failed" && "A run falhou. Veja o bloqueio acima."}
            {state.run.status === "cancelled" && "A run foi cancelada."}
          </YziAlert>

          <StepTimeline state={state} />

          <YziDivider />

          {artifact ? <ArtifactPanel artifact={artifact} /> : null}

          {state.run.status === "awaiting_approval" && decision ? (
            <DecisionPanel
              onApprove={handleApprove}
              onAdjust={handleAdjust}
              onRework={handleRework}
              pending={phase}
            />
          ) : null}
        </>
      ) : null}
    </section>
  );
}
