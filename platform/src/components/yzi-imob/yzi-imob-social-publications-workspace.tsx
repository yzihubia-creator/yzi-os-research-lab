"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  cancelMetricoolPublicationAction,
  enqueueMetricoolPublicationAction,
  retryMetricoolPublicationAction,
} from "@/app/cockpit/yzi-imob/marketing/publicacoes/actions";
import type { MetricoolMarketingWorkspace } from "@/lib/yzi-imob/metricool/repository";

type Props = {
  workspace: MetricoolMarketingWorkspace | null;
  accessState?: "ready" | "no_session" | "no_membership" | "tenant-error" | "read-error";
};

const STATUS_LABEL = {
  queued: "Aprovado",
  dispatching: "Em publicação",
  accepted: "Agendado",
  scheduled: "Agendado",
  publishing: "Em publicação",
  published: "Publicado",
  failed: "Falhou",
  cancelled: "Cancelado",
} as const;

export function YziImobSocialPublicationsWorkspace({
  workspace,
  accessState = "ready",
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedRevisionId, setSelectedRevisionId] = useState(
    () => workspace?.candidates.find((candidate) => candidate.revisionStatus === "approved")?.revisionId ?? "",
  );
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const counts = useMemo(() => {
    const values = { pending: 0, scheduled: 0, published: 0, failed: 0 };
    for (const publication of workspace?.publications ?? []) {
      if (publication.status === "published") values.published += 1;
      else if (publication.status === "failed") values.failed += 1;
      else if (["accepted", "scheduled", "publishing", "dispatching"].includes(publication.status)) {
        values.scheduled += 1;
      } else if (publication.status !== "cancelled") values.pending += 1;
    }
    return values;
  }, [workspace?.publications]);

  if (accessState !== "ready" || !workspace) {
    return (
      <section className="rounded-2xl border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-6">
        <h1 className="text-xl font-semibold text-[var(--yzi-text-primary)]">Publicações sociais</h1>
        <p className="mt-2 text-sm text-[var(--yzi-text-secondary)]">
          Não foi possível carregar o contrato social deste tenant. Nenhum dado foi simulado.
        </p>
      </section>
    );
  }

  const connectionReady =
    Boolean(workspace.connection.id) &&
    ["active", "connected"].includes(workspace.connection.status);
  const selectedCandidate = workspace.candidates.find(
    (candidate) => candidate.revisionId === selectedRevisionId,
  );

  function toggleTarget(key: string) {
    setSelectedTargets((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : current.length < 2
          ? [...current, key]
          : current,
    );
  }

  function schedulePublication() {
    if (!selectedCandidate) return;
    setNotice(null);
    startTransition(async () => {
      const result = await enqueueMetricoolPublicationAction({
        revisionId: selectedCandidate.revisionId,
        targetKeys: selectedTargets,
        scheduledAt,
      });
      setNotice(result.status === "ok" ? result.message : actionErrorMessage(result.code));
      if (result.status === "ok") router.refresh();
    });
  }

  function runPublicationAction(action: () => Promise<{ status: string; message?: string; code?: string }>) {
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      setNotice(
        result.status === "ok"
          ? result.message ?? "Operação concluída."
          : actionErrorMessage(result.code ?? "operation_failed"),
      );
      if (result.status === "ok") router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--yzi-text-faint)]">
            Marketing · Metricool
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--yzi-text-primary)]">
            Publicações sociais
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Acompanhe aprovação, agenda, envio e métricas. A edição do conteúdo continua fora desta
            superfície.
          </p>
        </div>
        <Link
          href="/cockpit/yzi-imob/conexoes"
          className="text-sm text-[var(--yzi-text-secondary)] underline underline-offset-4"
        >
          Ver conexão Metricool →
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        <Counter label="Aguardando" value={counts.pending} />
        <Counter label="Agendadas" value={counts.scheduled} />
        <Counter label="Publicadas" value={counts.published} />
        <Counter label="Falhas" value={counts.failed} />
      </div>

      {!connectionReady ? (
        <section className="rounded-2xl border border-dashed border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-5">
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Metricool requer configuração
          </h2>
          <p className="mt-2 text-sm text-[var(--yzi-text-secondary)]">
            Estado atual: {workspace.connection.status}. A API é provisionada pela YZIHUB; nenhum
            token deve ser informado aqui.
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-[var(--yzi-text-primary)]">
              Agendar revisão aprovada
            </h2>
            <p className="text-xs text-[var(--yzi-text-faint)]">
              Imagem única ou carrossel são derivados das mídias públicas e autorizadas da revisão.
            </p>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <div className="flex flex-col gap-2">
              {workspace.candidates.length ? workspace.candidates.map((candidate) => (
                <label
                  key={candidate.revisionId}
                  className="flex cursor-pointer gap-3 rounded-xl border border-[color:var(--yzi-border-subtle)] p-3"
                >
                  <input
                    type="radio"
                    name="revision"
                    value={candidate.revisionId}
                    checked={selectedRevisionId === candidate.revisionId}
                    onChange={() => setSelectedRevisionId(candidate.revisionId)}
                    disabled={candidate.revisionStatus !== "approved"}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[var(--yzi-text-primary)]">
                      {candidate.propertyTitle} · revisão {candidate.revisionNumber}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--yzi-text-faint)]">
                      {candidate.revisionStatus === "approved" ? "Aprovada" : "Aguardando aprovação"} ·{" "}
                      {candidate.mediaCount} imagem(ns)
                    </span>
                    <span className="mt-2 line-clamp-2 block text-xs text-[var(--yzi-text-secondary)]">
                      {candidate.previewCaption}
                    </span>
                    <Link
                      href={`/cockpit/yzi-imob/imoveis/${candidate.propertyId}`}
                      className="mt-2 inline-block text-xs underline underline-offset-4"
                    >
                      Abrir revisão {candidate.revisionStatus === "approved" ? "" : "para aprovar ou reprovar"} →
                    </Link>
                  </span>
                </label>
              )) : (
                <p className="rounded-xl border border-dashed border-[color:var(--yzi-border-subtle)] p-4 text-sm text-[var(--yzi-text-faint)]">
                  Nenhuma revisão pendente ou aprovada disponível.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <fieldset>
                <legend className="text-xs font-medium text-[var(--yzi-text-secondary)]">
                  Destinos válidos
                </legend>
                <div className="mt-2 flex flex-col gap-2">
                  {workspace.connection.profiles.map((profile) => {
                    const key = `${profile.network}:${profile.id}`;
                    return (
                      <label key={key} className="flex items-center gap-2 text-sm text-[var(--yzi-text-secondary)]">
                        <input
                          type="checkbox"
                          checked={selectedTargets.includes(key)}
                          onChange={() => toggleTarget(key)}
                        />
                        {profile.displayName} · {profile.network}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--yzi-text-secondary)]">
                Data e hora
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  className="rounded-lg border border-[color:var(--yzi-border-subtle)] bg-transparent px-3 py-2 text-sm"
                />
              </label>
              <button
                type="button"
                disabled={
                  isPending ||
                  !selectedCandidate ||
                  selectedCandidate.revisionStatus !== "approved" ||
                  !selectedCandidate.mediaCount ||
                  !selectedTargets.length ||
                  !scheduledAt
                }
                onClick={schedulePublication}
                className="rounded-lg border border-[color:var(--yzi-border-strong)] px-4 py-2 text-sm font-medium text-[var(--yzi-text-primary)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isPending ? "Processando..." : "Enviar para agendamento"}
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)]">
        <div className="border-b border-[color:var(--yzi-border-subtle)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--yzi-text-primary)]">Histórico governado</h2>
        </div>
        <div className="divide-y divide-[color:var(--yzi-border-subtle)]">
          {workspace.publications.length ? workspace.publications.map((publication) => (
            <article key={publication.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--yzi-text-primary)]">
                  {publication.propertyTitle} · revisão {publication.revisionNumber || "—"}
                </p>
                <p className="mt-1 text-xs text-[var(--yzi-text-faint)]">
                  {publication.targetNetworks.join(", ")} · {publication.format === "carousel" ? "carrossel" : "imagem única"} ·{" "}
                  {formatDate(publication.scheduledAt)}
                </p>
                <p className="mt-1 text-xs text-[var(--yzi-text-secondary)]">
                  {STATUS_LABEL[publication.status]} · {publication.metricCount} métrica(s)
                  {publication.errorCode ? ` · erro ${publication.errorCode}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {["queued", "accepted", "scheduled"].includes(publication.status) ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      runPublicationAction(() => cancelMetricoolPublicationAction(publication.id))
                    }
                    className="rounded-lg border border-[color:var(--yzi-border-subtle)] px-3 py-1.5 text-xs"
                  >
                    Cancelar
                  </button>
                ) : null}
                {publication.status === "failed" ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      runPublicationAction(() => retryMetricoolPublicationAction(publication.id))
                    }
                    className="rounded-lg border border-[color:var(--yzi-border-subtle)] px-3 py-1.5 text-xs"
                  >
                    Retry
                  </button>
                ) : null}
                {publication.externalUrl ? (
                  <a
                    href={publication.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-[color:var(--yzi-border-subtle)] px-3 py-1.5 text-xs"
                  >
                    Abrir post
                  </a>
                ) : null}
              </div>
            </article>
          )) : (
            <p className="px-5 py-8 text-sm text-[var(--yzi-text-faint)]">
              Nenhuma publicação social registrada.
            </p>
          )}
        </div>
      </section>

      {notice ? (
        <p role="status" className="text-sm text-[var(--yzi-text-secondary)]">
          {notice}
        </p>
      ) : null}
    </div>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4">
      <p className="text-xs text-[var(--yzi-text-faint)]">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[var(--yzi-text-primary)]">{value}</p>
    </div>
  );
}

function actionErrorMessage(code: string): string {
  switch (code) {
    case "configuration_required":
      return "A conexão Metricool ainda requer configuração gerenciada.";
    case "approved_revision_required":
      return "A revisão precisa estar aprovada antes do agendamento.";
    case "media_required":
      return "A revisão não possui mídia pública pronta e autorizada.";
    case "invalid_input":
      return "Revise destinos e data do agendamento.";
    default:
      return "Não foi possível concluir a operação. Nenhum envio externo foi marcado como publicado.";
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
