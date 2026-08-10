"use client";

import { useActionState } from "react";

import {
  changePublicationAvailabilityAction,
  decidePublicationReviewAction,
  INITIAL_PROPERTY_PUBLICATION_ACTION_STATE,
  requestPublicationReviewAction,
  retryPublicationAction,
  synchronizePublicationAction,
  type PropertyPublicationActionState,
} from "@/app/cockpit/yzi-imob/imoveis/[id]/publication-actions";
import type {
  PropertyPublicationReadiness,
  PropertyPublicationWorkspace,
} from "@/lib/yzi-imob/publication/types";
import {
  publicationBlockerLabel,
  publicationStatusLabel,
  publicationWarningLabel,
  syncErrorLabel,
} from "@/lib/yzi-imob/publication/labels";

function Message({ state }: { state: PropertyPublicationActionState }) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <div
      role="status"
      className={
        state.status === "ok"
          ? "rounded-[var(--yzi-radius-md)] border border-[rgba(var(--imob-ice),0.28)] bg-[rgba(var(--imob-ice),0.08)] px-3 py-2 text-[0.76rem] text-[rgb(var(--imob-ice))]"
          : "rounded-[var(--yzi-radius-md)] border border-[rgba(255,120,120,0.28)] bg-[rgba(255,120,120,0.08)] px-3 py-2 text-[0.76rem] text-[rgb(255,170,170)]"
      }
    >
      <p>{state.message}</p>
      {state.blockers?.length ? (
        <p className="mt-1 text-[0.7rem] opacity-80">
          {state.blockers.map(publicationBlockerLabel).join(", ")}
        </p>
      ) : null}
    </div>
  );
}

function ActionButton({
  label,
  pending,
  destructive = false,
}: {
  label: string;
  pending: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        destructive
          ? "rounded-[var(--yzi-radius-sm)] border border-[rgba(255,120,120,0.3)] px-3 py-2 text-[0.74rem] text-[rgb(255,170,170)] disabled:opacity-50"
          : "rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.32)] bg-[rgba(var(--imob-ice),0.1)] px-3 py-2 text-[0.74rem] text-[rgb(var(--imob-ice))] disabled:opacity-50"
      }
    >
      {pending ? "Processando..." : label}
    </button>
  );
}

function Datum({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-3">
      <p className="text-[0.6rem] uppercase tracking-[0.16em] text-[var(--yzi-text-faint)]">
        {label}
      </p>
      <p className="mt-1 text-[0.78rem] text-[var(--yzi-text-primary)]">{value}</p>
    </div>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Ainda não ocorreu";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function YziImobPropertyPublicationPanel({
  propertyId,
  suggestedSlug,
  readiness,
  workspace,
  unavailable = false,
}: {
  propertyId: string;
  suggestedSlug: string;
  readiness: PropertyPublicationReadiness;
  workspace: PropertyPublicationWorkspace | null;
  unavailable?: boolean;
}) {
  const [reviewState, reviewAction, reviewPending] = useActionState(
    requestPublicationReviewAction,
    INITIAL_PROPERTY_PUBLICATION_ACTION_STATE,
  );
  const [decisionState, decisionAction, decisionPending] = useActionState(
    decidePublicationReviewAction,
    INITIAL_PROPERTY_PUBLICATION_ACTION_STATE,
  );
  const [syncState, syncAction, syncPending] = useActionState(
    synchronizePublicationAction,
    INITIAL_PROPERTY_PUBLICATION_ACTION_STATE,
  );
  const [availabilityState, availabilityAction, availabilityPending] =
    useActionState(
      changePublicationAvailabilityAction,
      INITIAL_PROPERTY_PUBLICATION_ACTION_STATE,
    );
  const [retryState, retryAction, retryPending] = useActionState(
    retryPublicationAction,
    INITIAL_PROPERTY_PUBLICATION_ACTION_STATE,
  );

  if (unavailable) {
    return (
      <div className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-5 py-8">
        <p className="text-[0.84rem] text-[var(--yzi-text-primary)]">
          Contrato de publicação indisponível neste ambiente
        </p>
        <p className="mt-2 text-[0.76rem] text-[var(--yzi-text-secondary)]">
          O cadastro do imóvel permanece intacto. A migration local ainda não foi aplicada
          ao banco deste ambiente.
        </p>
      </div>
    );
  }

  const state = workspace?.state ?? null;
  const currentRevision = workspace?.currentRevision ?? null;
  const approvedRevision = workspace?.approvedRevision ?? null;
  const latestJob = workspace?.latestJob ?? null;
  const syncOperation = state?.publicationVersion ? "update" : "publish";
  const syncKey = `property:${propertyId}:${syncOperation}:${approvedRevision?.id ?? "none"}`;
  const canSync =
    state?.status === "approved" &&
    Boolean(approvedRevision) &&
    state.currentRevisionId === state.approvedRevisionId;
  const retryEligible =
    latestJob?.status === "failed" &&
    latestJob.attemptCount < latestJob.maxAttempts;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Datum label="Prontidão" value={readiness.ready ? "Pronto" : "Incompleto"} />
        <Datum label="Publicação" value={publicationStatusLabel(state?.status)} />
        <Datum
          label="Revisão atual"
          value={currentRevision ? `#${currentRevision.revisionNumber}` : "Nenhuma"}
        />
        <Datum
          label="Versão publicada"
          value={state?.publicationVersion ? `v${state.publicationVersion}` : "Nenhuma"}
        />
        <Datum
          label="Revisão aprovada"
          value={approvedRevision ? `#${approvedRevision.revisionNumber}` : "Nenhuma"}
        />
        <Datum label="Última sincronização" value={formatDate(state?.lastSyncedAt)} />
        <Datum label="URL pública" value={state?.publicUrl ?? "Ainda não disponível"} />
        <Datum label="Erro de sincronização" value={syncErrorLabel(state?.syncErrorCode)} />
      </div>

      {!readiness.ready ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <p className="text-[0.72rem] font-medium text-[var(--yzi-text-primary)]">
              Bloqueios
            </p>
            <ul className="mt-2 space-y-1 text-[0.74rem] text-[var(--yzi-text-secondary)]">
              {readiness.blockers.map((blocker) => (
                <li key={blocker}>• {publicationBlockerLabel(blocker)}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.72rem] font-medium text-[var(--yzi-text-primary)]">
              Alertas
            </p>
            <ul className="mt-2 space-y-1 text-[0.74rem] text-[var(--yzi-text-secondary)]">
              {readiness.warnings.map((warning) => (
                <li key={warning}>• {publicationWarningLabel(warning)}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <form action={reviewAction} className="flex flex-col gap-3">
        <input type="hidden" name="propertyId" value={propertyId} />
        <label className="flex max-w-xl flex-col gap-1.5">
          <span className="text-[0.7rem] text-[var(--yzi-text-secondary)]">Slug público</span>
          <input
            name="publicSlug"
            defaultValue={state?.publicSlug ?? suggestedSlug}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2 text-[0.8rem] text-[var(--yzi-text-primary)]"
          />
        </label>
        <ActionButton
          label="Solicitar revisão"
          pending={reviewPending}
        />
        <Message state={reviewState} />
      </form>

      {currentRevision?.status === "under_review" ? (
        <form action={decisionAction} className="flex flex-col gap-3">
          <input type="hidden" name="propertyId" value={propertyId} />
          <input type="hidden" name="revisionId" value={currentRevision.id} />
          <label className="flex max-w-xl flex-col gap-1.5">
            <span className="text-[0.7rem] text-[var(--yzi-text-secondary)]">
              Observação da revisão
            </span>
            <textarea
              name="observation"
              rows={3}
              maxLength={1000}
              className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2 text-[0.8rem] text-[var(--yzi-text-primary)]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              name="decision"
              value="approved"
              disabled={decisionPending}
              className="rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.32)] px-3 py-2 text-[0.74rem] text-[rgb(var(--imob-ice))] disabled:opacity-50"
            >
              {decisionPending ? "Processando..." : "Aprovar"}
            </button>
            <button
              type="submit"
              name="decision"
              value="changes_required"
              disabled={decisionPending}
              className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-[0.74rem] text-[var(--yzi-text-secondary)] disabled:opacity-50"
            >
              Solicitar alterações
            </button>
            <button
              type="submit"
              name="decision"
              value="rejected"
              disabled={decisionPending}
              className="rounded-[var(--yzi-radius-sm)] border border-[rgba(255,120,120,0.3)] px-3 py-2 text-[0.74rem] text-[rgb(255,170,170)] disabled:opacity-50"
            >
              Reprovar
            </button>
          </div>
          <Message state={decisionState} />
        </form>
      ) : null}

      {canSync ? (
        <form action={syncAction} className="flex flex-col gap-3">
          <input type="hidden" name="propertyId" value={propertyId} />
          <input type="hidden" name="operation" value={syncOperation} />
          <input type="hidden" name="idempotencyKey" value={syncKey} />
          <ActionButton
            label={syncOperation === "publish" ? "Publicar (simulado)" : "Atualizar (simulado)"}
            pending={syncPending}
          />
          <p className="text-[0.68rem] text-[var(--yzi-text-faint)]">
            O adapter controlado não chama domínio, site ou serviço externo.
          </p>
          <Message state={syncState} />
        </form>
      ) : null}

      {state?.status === "published" || state?.status === "update_pending" ? (
        <form action={availabilityAction} className="flex flex-wrap gap-2">
          <input type="hidden" name="propertyId" value={propertyId} />
          <button
            type="submit"
            name="availabilityAction"
            value="pause"
            disabled={availabilityPending}
            className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-[0.74rem] text-[var(--yzi-text-secondary)] disabled:opacity-50"
          >
            {availabilityPending ? "Processando..." : "Pausar"}
          </button>
          <button
            type="submit"
            name="availabilityAction"
            value="unpublish"
            disabled={availabilityPending}
            className="rounded-[var(--yzi-radius-sm)] border border-[rgba(255,120,120,0.3)] px-3 py-2 text-[0.74rem] text-[rgb(255,170,170)] disabled:opacity-50"
          >
            Despublicar
          </button>
          <Message state={availabilityState} />
        </form>
      ) : null}

      {state?.status === "paused" ? (
        <form action={availabilityAction} className="flex flex-col gap-2">
          <input type="hidden" name="propertyId" value={propertyId} />
          <input type="hidden" name="availabilityAction" value="unpublish" />
          <ActionButton label="Despublicar" pending={availabilityPending} destructive />
          <Message state={availabilityState} />
        </form>
      ) : null}

      {retryEligible && latestJob ? (
        <form action={retryAction} className="flex flex-col gap-2">
          <input type="hidden" name="propertyId" value={propertyId} />
          <input type="hidden" name="jobId" value={latestJob.id} />
          <input
            type="hidden"
            name="retryIdempotencyKey"
            value={`retry:${latestJob.id}:${latestJob.attemptCount + 1}`}
          />
          <ActionButton label="Retry elegível" pending={retryPending} />
          <Message state={retryState} />
        </form>
      ) : null}
    </div>
  );
}
