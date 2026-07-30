"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  cancelMetricoolPublicationAction,
  enqueueMetricoolPublicationAction,
  retryMetricoolPublicationAction,
} from "@/app/cockpit/yzi-imob/marketing/publicacoes/actions";
import {
  MetricBand,
  SurfaceButton,
  SurfaceCanvas,
  SurfaceHeader,
  SurfaceList,
  SurfaceRow,
  SurfaceSection,
  SurfaceSegmented,
  SurfaceState,
  TYPE,
  cx,
  type SurfaceMetric,
  type SurfaceTone,
} from "@/components/yzi-imob/yzi-imob-surface-kit";
import { YziInsight } from "@/components/yzi-imob/yzi-imob-yzi-kit";
import type {
  SocialPublicationCandidate,
  MetricoolMarketingWorkspace,
} from "@/lib/yzi-imob/metricool/repository";

// Marketing — a operação de conteúdo e distribuição da imobiliária.
//
// Responde: o que está em produção, o que aguarda aprovação, o que está
// programado, o que já saiu, o que precisa de ajuste. NÃO é Growth OS (que
// responde onde investir) e não é uma galeria de cards.
//
// Correções desta passagem: o nome do executor externo que publica, o estado
// cru da conexão, o código de erro do provedor e a menção a token saíram da
// tela; as ações ganharam prioridade; o fluxo passou a ser lido em etapas
// (produção → aprovação → programado → publicado → precisa de ajuste).

type Props = {
  workspace: MetricoolMarketingWorkspace | null;
  accessState?: "ready" | "no_session" | "no_membership" | "tenant-error" | "read-error";
};

/** Etapas do ciclo — a linguagem do gestor, nunca o status cru do contrato. */
type Stage = "aprovacao" | "programado" | "publicado" | "ajuste";

const STATUS_STAGE: Record<string, Stage> = {
  queued: "programado",
  accepted: "programado",
  scheduled: "programado",
  dispatching: "programado",
  publishing: "programado",
  published: "publicado",
  failed: "ajuste",
  cancelled: "ajuste",
};

const STATUS_STATE: Record<string, { tone: SurfaceTone; label: string }> = {
  queued: { tone: "pending", label: "Aprovado, aguardando envio" },
  accepted: { tone: "pending", label: "Programado" },
  scheduled: { tone: "pending", label: "Programado" },
  dispatching: { tone: "info", label: "Publicando agora" },
  publishing: { tone: "info", label: "Publicando agora" },
  published: { tone: "ok", label: "Publicado" },
  failed: { tone: "attention", label: "Precisa de ajuste" },
  cancelled: { tone: "idle", label: "Cancelado" },
};

const NETWORK_LABEL: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
};

/**
 * Traduz o motivo de uma falha de envio para o que o gestor pode fazer.
 * O código cru do executor externo nunca chega à tela.
 */
function failureReason(errorCode: string | null): string {
  if (!errorCode) return "O envio não foi concluído. Nada foi publicado.";
  if (errorCode.includes("media")) {
    return "As imagens desta peça não estavam prontas na hora do envio. Revise as fotos do imóvel e programe de novo.";
  }
  if (errorCode.includes("auth") || errorCode.includes("token") || errorCode.includes("credential")) {
    return "O canal precisa ser reconectado antes de publicar. Nada foi publicado.";
  }
  if (errorCode.includes("rate") || errorCode.includes("limit")) {
    return "O canal recusou o envio por excesso de publicações no período. Programe para outro horário.";
  }
  return "O envio não foi concluído. Nada foi publicado — você pode programar novamente.";
}

function actionErrorMessage(code: string): string {
  switch (code) {
    case "configuration_required":
      return "A publicação em redes ainda não está liberada para a sua operação. Conclua em Conexões.";
    case "approved_revision_required":
      return "Aprove a peça antes de programar a publicação.";
    case "media_required":
      return "Esta peça ainda não tem imagem pronta e autorizada.";
    case "invalid_input":
      return "Revise os canais escolhidos e a data da publicação.";
    default:
      return "Não foi possível concluir. Nada foi publicado.";
  }
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data definida";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function YziImobSocialPublicationsWorkspace({
  workspace,
  accessState = "ready",
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [stage, setStage] = useState<Stage>("aprovacao");
  const [selectedRevisionId, setSelectedRevisionId] = useState(
    () =>
      workspace?.candidates.find((candidate) => candidate.revisionStatus === "approved")
        ?.revisionId ?? "",
  );
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const publications = useMemo(() => workspace?.publications ?? [], [workspace]);
  const candidates = useMemo(() => workspace?.candidates ?? [], [workspace]);

  const awaitingApproval = useMemo(
    () => candidates.filter((candidate) => candidate.revisionStatus !== "approved"),
    [candidates],
  );
  const readyToSchedule = useMemo(
    () => candidates.filter((candidate) => candidate.revisionStatus === "approved"),
    [candidates],
  );

  const byStage = useMemo(() => {
    const grouped: Record<Stage, typeof publications> = {
      aprovacao: [],
      programado: [],
      publicado: [],
      ajuste: [],
    };
    for (const publication of publications) {
      const target = STATUS_STAGE[publication.status] ?? "programado";
      grouped[target] = [...grouped[target], publication];
    }
    return grouped;
  }, [publications]);

  if (accessState !== "ready" || !workspace) {
    const copy: Record<string, { tone: SurfaceTone; title: string; body: string }> = {
      no_session: {
        tone: "pending",
        title: "Entre novamente para ver suas publicações",
        body: "Sua sessão expirou. Nada foi alterado nas peças da sua operação.",
      },
      no_membership: {
        tone: "idle",
        title: "Sua conta ainda não está ligada a uma operação",
        body: "Conclua a implantação inicial para começar a produzir e publicar conteúdo.",
      },
      "tenant-error": {
        tone: "attention",
        title: "Não conseguimos identificar sua operação agora",
        body: "Recarregue a página. Nenhuma publicação foi alterada.",
      },
      "read-error": {
        tone: "attention",
        title: "Não foi possível carregar suas publicações agora",
        body: "A leitura falhou. Preferimos não mostrar nada a mostrar uma lista incompleta.",
      },
    };
    const content = copy[accessState] ?? copy["read-error"];
    return (
      <SurfaceCanvas>
        <SurfaceHeader
          kicker="Marketing"
          title="Conteúdo e publicação"
          lead="O que está sendo produzido, o que espera aprovação, o que está programado e o que já saiu."
        />
        <SurfaceState tone={content.tone} title={content.title} body={content.body} />
      </SurfaceCanvas>
    );
  }

  const distributionReady =
    Boolean(workspace.connection.id) &&
    ["active", "connected"].includes(workspace.connection.status);
  const selectedCandidate = candidates.find(
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
      if (result.status === "ok") {
        setSelectedTargets([]);
        setScheduledAt("");
        router.refresh();
      }
    });
  }

  function runPublicationAction(
    action: () => Promise<{ status: string; message?: string; code?: string }>,
  ) {
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      setNotice(
        result.status === "ok"
          ? (result.message ?? "Pronto.")
          : actionErrorMessage(result.code ?? "operation_failed"),
      );
      if (result.status === "ok") router.refresh();
    });
  }

  const needsAdjustment = byStage.ajuste.filter(
    (publication) => publication.status === "failed",
  );

  const metrics: SurfaceMetric[] = [
    {
      label: "Aguardando aprovação",
      value: String(awaitingApproval.length),
      detail: "Peças prontas para sua decisão",
      tone: awaitingApproval.length ? "pending" : undefined,
    },
    {
      label: "Programadas",
      value: String(byStage.programado.length),
      detail: "Com data e canal definidos",
    },
    {
      label: "Publicadas",
      value: String(byStage.publicado.length),
      detail: "Já no ar",
      tone: "ok",
    },
    {
      label: "Precisa de ajuste",
      value: String(needsAdjustment.length),
      detail: "Não chegaram a publicar",
      tone: needsAdjustment.length ? "attention" : undefined,
    },
  ];

  const stageOptions: Array<{ id: Stage; label: string; count: number }> = [
    { id: "aprovacao", label: "Aguardando aprovação", count: awaitingApproval.length },
    { id: "programado", label: "Programadas", count: byStage.programado.length },
    { id: "publicado", label: "Publicadas", count: byStage.publicado.length },
    { id: "ajuste", label: "Precisa de ajuste", count: needsAdjustment.length },
  ];

  return (
    <SurfaceCanvas width="wide">
      <SurfaceHeader
        kicker="Marketing"
        title="Conteúdo e publicação"
        lead="O que está sendo produzido, o que espera aprovação, o que está programado e o que já saiu."
        secondaryActions={[
          { label: "Ver onde investir", href: "/cockpit/yzi-imob/growth" },
          { label: "Ver canais", href: "/cockpit/yzi-imob/conexoes" },
        ]}
      />

      <MetricBand metrics={metrics} />

      {!distributionReady ? (
        <SurfaceState
          tone="pending"
          title="A publicação automática ainda não está liberada"
          body="Suas peças continuam sendo produzidas e aprovadas normalmente. Assim que os canais estiverem prontos em Conexões, a programação passa a sair daqui."
          action={{ label: "Concluir em Conexões", href: "/cockpit/yzi-imob/conexoes" }}
        />
      ) : awaitingApproval.length > 0 ? (
        <YziInsight
          context="Ciclo de conteúdo"
          tone="pending"
          stateLabel="Aguardando você"
          headline={`${awaitingApproval.length} ${awaitingApproval.length === 1 ? "peça está pronta" : "peças estão prontas"} e espera sua aprovação.`}
          reading="Peça aprovada é peça que pode ser programada. Enquanto ela espera, o imóvel continua sem alcance novo."
          evidence={awaitingApproval.slice(0, 3).map((candidate) => candidate.propertyTitle)}
          recommendation="Abra a peça mais antiga primeiro: quanto mais tempo parada, maior a chance de a foto ou o preço já não representarem o imóvel."
          primaryAction={
            awaitingApproval[0]
              ? {
                  label: "Abrir para aprovar",
                  href: `/cockpit/yzi-imob/imoveis/${awaitingApproval[0].propertyId}`,
                }
              : undefined
          }
        />
      ) : needsAdjustment.length > 0 ? (
        <YziInsight
          context="Ciclo de conteúdo"
          tone="attention"
          stateLabel="Precisa de ajuste"
          headline={`${needsAdjustment.length} ${needsAdjustment.length === 1 ? "publicação não chegou" : "publicações não chegaram"} a sair.`}
          reading="Nada foi publicado nesses casos. O conteúdo continua aprovado e pode ser programado novamente depois do ajuste."
          evidence={needsAdjustment.slice(0, 3).map((item) => item.propertyTitle)}
          recommendation="Confira a causa indicada em cada item antes de programar de novo — repetir o envio sem ajuste tende a falhar igual."
        />
      ) : null}

      {distributionReady ? (
        <SurfaceSection
          first
          title="Programar uma peça aprovada"
          description="Escolha a peça, os canais e quando ela deve ir ao ar."
        >
          {readyToSchedule.length === 0 ? (
            <SurfaceState
              tone="idle"
              title="Nenhuma peça aprovada esperando programação"
              body="Assim que você aprovar uma peça, ela aparece aqui pronta para receber data e canais."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_1fr]">
              <fieldset className="flex flex-col gap-2">
                <legend className={cx(TYPE.label, "mb-1")}>Peça aprovada</legend>
                {readyToSchedule.map((candidate) => (
                  <CandidateOption
                    key={candidate.revisionId}
                    candidate={candidate}
                    checked={selectedRevisionId === candidate.revisionId}
                    onSelect={() => setSelectedRevisionId(candidate.revisionId)}
                  />
                ))}
              </fieldset>

              <div className="flex flex-col gap-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-4 shadow-[var(--yzi-edge-highlight)]">
                <fieldset className="flex flex-col gap-2">
                  <legend className={cx(TYPE.label, "mb-1")}>
                    Onde publicar (até 2 canais)
                  </legend>
                  {workspace.connection.profiles.length ? (
                    workspace.connection.profiles.map((profile) => {
                      const key = `${profile.network}:${profile.id}`;
                      return (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center gap-2.5 text-[0.8rem] text-[var(--yzi-text-secondary)]"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTargets.includes(key)}
                            onChange={() => toggleTarget(key)}
                            className="h-4 w-4 accent-[rgb(var(--imob-ice))]"
                          />
                          <span className="min-w-0 truncate">
                            {profile.displayName}
                            <span className="ml-1.5 text-[var(--yzi-text-faint)]">
                              {NETWORK_LABEL[profile.network] ?? profile.network}
                            </span>
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <p className={TYPE.meta}>
                      Nenhum canal disponível para publicar. Verifique em Conexões.
                    </p>
                  )}
                </fieldset>

                <label className="flex flex-col gap-1.5">
                  <span className={TYPE.label}>Quando publicar</span>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                    className="yzi-field"
                  />
                </label>

                <SurfaceButton
                  kind="primary"
                  action={{
                    label: isPending ? "Programando…" : "Programar publicação",
                    onClick: schedulePublication,
                    disabled:
                      isPending ||
                      !selectedCandidate ||
                      selectedCandidate.revisionStatus !== "approved" ||
                      !selectedCandidate.mediaCount ||
                      !selectedTargets.length ||
                      !scheduledAt,
                    unavailableReason:
                      "Escolha uma peça aprovada com imagem, pelo menos um canal e uma data",
                  }}
                />
              </div>
            </div>
          )}
        </SurfaceSection>
      ) : null}

      <SurfaceSection
        first={!distributionReady}
        title="Ciclo de conteúdo"
        description="Acompanhe cada peça da aprovação até a publicação."
        actions={
          <SurfaceSegmented
            legend="Etapa do ciclo"
            options={stageOptions}
            value={stage}
            onChange={setStage}
          />
        }
      >
        {stage === "aprovacao" ? (
          awaitingApproval.length ? (
            <SurfaceList>
              {awaitingApproval.map((candidate) => (
                <SurfaceRow
                  key={candidate.revisionId}
                  title={candidate.propertyTitle}
                  description={candidate.previewCaption}
                  tone="pending"
                  stateLabel="Aguardando aprovação"
                  meta={
                    <span>
                      {candidate.mediaCount}{" "}
                      {candidate.mediaCount === 1 ? "imagem" : "imagens"} · versão{" "}
                      {candidate.revisionNumber}
                    </span>
                  }
                  actions={
                    <SurfaceButton
                      kind="primary"
                      action={{
                        label: "Abrir para aprovar",
                        href: `/cockpit/yzi-imob/imoveis/${candidate.propertyId}`,
                      }}
                    />
                  }
                />
              ))}
            </SurfaceList>
          ) : (
            <SurfaceState
              tone="ok"
              title="Nada esperando aprovação"
              body="Todas as peças produzidas já foram avaliadas."
            />
          )
        ) : null}

        {stage !== "aprovacao"
          ? (() => {
              const list =
                stage === "ajuste" ? needsAdjustment : byStage[stage];
              if (!list.length) {
                const empty: Record<string, { title: string; body: string }> = {
                  programado: {
                    title: "Nenhuma publicação programada",
                    body: "Aprove uma peça e defina data e canais para vê-la aqui.",
                  },
                  publicado: {
                    title: "Nada publicado ainda",
                    body: "As publicações que forem ao ar aparecem aqui com o link do post.",
                  },
                  ajuste: {
                    title: "Nenhuma publicação com problema",
                    body: "Todas as tentativas de envio recentes foram concluídas.",
                  },
                };
                const content = empty[stage];
                return (
                  <SurfaceState
                    tone={stage === "ajuste" ? "ok" : "idle"}
                    title={content.title}
                    body={content.body}
                  />
                );
              }

              return (
                <SurfaceList>
                  {list.map((publication) => {
                    const state =
                      STATUS_STATE[publication.status] ?? {
                        tone: "idle" as SurfaceTone,
                        label: "Registrada",
                      };
                    const canCancel = ["queued", "accepted", "scheduled"].includes(
                      publication.status,
                    );
                    return (
                      <SurfaceRow
                        key={publication.id}
                        title={publication.propertyTitle}
                        description={
                          publication.status === "failed"
                            ? failureReason(publication.errorCode)
                            : undefined
                        }
                        tone={state.tone}
                        stateLabel={state.label}
                        meta={
                          <span>
                            {publication.targetNetworks
                              .map((network) => NETWORK_LABEL[network] ?? network)
                              .join(" · ")}
                            {" · "}
                            {publication.format === "carousel" ? "Carrossel" : "Imagem única"}
                            {" · "}
                            {formatDateTime(publication.scheduledAt)}
                          </span>
                        }
                        actions={
                          <>
                            {canCancel ? (
                              <SurfaceButton
                                action={{
                                  label: "Cancelar",
                                  disabled: isPending,
                                  onClick: () =>
                                    runPublicationAction(() =>
                                      cancelMetricoolPublicationAction(publication.id),
                                    ),
                                }}
                              />
                            ) : null}
                            {publication.status === "failed" ? (
                              <SurfaceButton
                                kind="primary"
                                action={{
                                  label: "Programar de novo",
                                  disabled: isPending,
                                  onClick: () =>
                                    runPublicationAction(() =>
                                      retryMetricoolPublicationAction(publication.id),
                                    ),
                                }}
                              />
                            ) : null}
                            {publication.externalUrl ? (
                              <a
                                href={publication.externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3.5 py-2 text-[0.75rem] text-[var(--yzi-text-secondary)] transition-colors hover:border-[color:var(--yzi-border-strong)] hover:text-[var(--yzi-text-primary)]"
                              >
                                Ver publicação
                              </a>
                            ) : null}
                          </>
                        }
                      />
                    );
                  })}
                </SurfaceList>
              );
            })()
          : null}
      </SurfaceSection>

      {notice ? (
        <p role="status" aria-live="polite" className={cx(TYPE.body, "flex items-center gap-2")}>
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--imob-ice))]"
          />
          {notice}
        </p>
      ) : null}
    </SurfaceCanvas>
  );
}

function CandidateOption({
  candidate,
  checked,
  onSelect,
}: {
  candidate: SocialPublicationCandidate;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cx(
        "flex cursor-pointer gap-3 rounded-[var(--yzi-radius-md)] border px-4 py-3.5 transition-colors duration-[var(--duration-fast)]",
        checked
          ? "border-[color:rgba(var(--imob-ice),0.32)] bg-[rgba(var(--imob-cold),0.08)]"
          : "border-[color:var(--yzi-border-subtle)] hover:border-[color:var(--yzi-border-strong)]",
      )}
    >
      <input
        type="radio"
        name="revision"
        value={candidate.revisionId}
        checked={checked}
        onChange={onSelect}
        className="mt-1 h-4 w-4 shrink-0 accent-[rgb(var(--imob-ice))]"
      />
      <span className="flex min-w-0 flex-col gap-1">
        <span className={TYPE.itemTitle}>{candidate.propertyTitle}</span>
        <span className={TYPE.meta}>
          Versão {candidate.revisionNumber} · {candidate.mediaCount}{" "}
          {candidate.mediaCount === 1 ? "imagem" : "imagens"}
        </span>
        <span className={cx(TYPE.body, "line-clamp-2")}>{candidate.previewCaption}</span>
      </span>
    </label>
  );
}
