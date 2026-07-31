"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { runConnectionCommandAction } from "@/app/cockpit/yzi-imob/conexoes/actions";
import {
  CONNECTION_CATEGORY_VALUES,
  type ConnectionCategory,
  type ConnectionHumanStatus,
  type ConnectionsViewModel,
  type ConnectionViewModelItem,
} from "@/lib/yzi-imob/connections/public-view-model";
import {
  MetricBand,
  StateTag,
  SurfaceButton,
  SurfaceCanvas,
  SurfaceHeader,
  SurfaceSection,
  SurfaceSegmented,
  SurfaceState,
  TYPE,
  cx,
  toneColor,
  type SurfaceMetric,
  type SurfaceTone,
} from "@/components/yzi-imob/yzi-imob-surface-kit";
import { YziInsight } from "@/components/yzi-imob/yzi-imob-yzi-kit";

// Conexões — o que a operação consegue fazer hoje e o que ainda falta liberar.
//
// Correções desta passagem: o composer da YZI que não fazia nada (`onAsk` vazio)
// saiu — um campo que aceita texto e ignora é uma promessa falsa; a leitura da
// YZI virou um diagnóstico real do estado das conexões; a copy deixou de citar
// "backend" e "capabilities"; estados vazios e de erro passaram a usar o
// vocabulário único do produto.

type AuthorizationCallbackStatus =
  | "success"
  | "cancelled"
  | "expired"
  | "invalid_state"
  | "provider_error"
  | "internal_error";

type ConnectionsWorkspaceProps = {
  viewModel: ConnectionsViewModel;
  authorizationCallbackStatus?: AuthorizationCallbackStatus | null;
};

/**
 * Estado exibido de um item. Verificacao empresarial externa chega do contrato
 * como "Precisa de atencao", mas nao e falha: a capacidade nunca chegou a
 * funcionar, esta esperando liberacao de terceiro. Radar e Sistema aplicam a
 * mesma distincao — as tres telas nao podem discordar sobre o mesmo fato.
 */
function itemState(item: ConnectionViewModelItem): { tone: SurfaceTone; label: string } {
  if (item.aguardandoVerificacaoExterna) {
    return { tone: "pending", label: "Aguardando verificação" };
  }
  return { tone: STATUS_TONE[item.status], label: item.status };
}

function isBroken(item: ConnectionViewModelItem): boolean {
  return (
    !item.aguardandoVerificacaoExterna &&
    ["Precisa de atenção", "Autorização expirada"].includes(item.status)
  );
}

function isPreparing(item: ConnectionViewModelItem): boolean {
  return (
    item.aguardandoVerificacaoExterna ||
    ["Conectando", "Aguardando autorização"].includes(item.status)
  );
}

const STATUS_TONE: Record<ConnectionHumanStatus, SurfaceTone> = {
  "Não conectado": "idle",
  "Aguardando autorização": "pending",
  Conectando: "pending",
  Ativo: "ok",
  "Precisa de atenção": "attention",
  "Autorização expirada": "attention",
  Indisponível: "idle",
};

/** O que cada categoria destrava no produto — o gestor lê consequência. */
const CATEGORY_IMPACT: Record<ConnectionCategory, string> = {
  Atendimento: "Receber e responder mensagens de clientes.",
  "Publicação social": "Programar e publicar conteúdo nas redes.",
  Site: "Manter as páginas dos imóveis no ar.",
  "Dados e mensuração": "Medir alcance e desempenho do que foi publicado.",
  "Produção criativa": "Gerar as peças que a equipe aprova antes de publicar.",
};

function displayDate(value: string | null): string {
  if (!value) return "Ainda não verificada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Ainda não verificada";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function callbackNotice(
  status: AuthorizationCallbackStatus | null | undefined,
): { tone: SurfaceTone; title: string; body: string } | null {
  switch (status) {
    case "success":
      return {
        tone: "ok",
        title: "Autorização concluída",
        body: "O estado abaixo já reflete a autorização que você acabou de conceder.",
      };
    case "cancelled":
      return {
        tone: "idle",
        title: "Autorização cancelada",
        body: "Nada foi alterado. Você pode recomeçar quando quiser.",
      };
    case "expired":
      return {
        tone: "pending",
        title: "A autorização expirou antes de concluir",
        body: "O tempo para concluir acabou. Comece o processo novamente.",
      };
    case "invalid_state":
      return {
        tone: "pending",
        title: "Esta autorização não é mais válida",
        body: "Ela já foi usada ou expirou. Comece o processo novamente.",
      };
    case "provider_error":
    case "internal_error":
      return {
        tone: "attention",
        title: "Não foi possível concluir a autorização",
        body: "Nada foi alterado na sua operação. Tente novamente em alguns minutos.",
      };
    case null:
    case undefined:
      return null;
  }
}

function ConnectionCommands({ item }: { item: ConnectionViewModelItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function run(command: "configure" | "test" | "disconnect") {
    setMessage(null);
    startTransition(async () => {
      const result = await runConnectionCommandAction({
        connectionId: item.id,
        command,
      });
      if (result.status === "ok") {
        if (result.authorizationUrl) {
          window.location.assign(result.authorizationUrl);
          return;
        }
        setMessage(
          command === "configure"
            ? "Pedido de configuração registrado."
            : command === "test"
              ? "Verificação em andamento. O estado se atualiza em instantes."
              : "Conexão removida da sua operação.",
        );
        router.refresh();
        return;
      }
      setMessage(
        result.code === "configuration_required"
          ? "Esta conexão ainda depende de uma liberação que não está do seu lado."
          : "Não foi possível concluir. Nada foi alterado na sua operação.",
      );
    });
  }

  if (!item.podeConfigurar && !item.podeTestar && !item.podeDesconectar) {
    return null;
  }

  const connectLabel =
    item.status === "Aguardando autorização"
      ? "Continuar autorização"
      : item.status === "Autorização expirada" || item.status === "Precisa de atenção"
        ? "Reconectar"
        : "Conectar";

  return (
    <div className="flex flex-col gap-2.5 border-t border-[color:var(--yzi-border-subtle)] pt-4">
      <div className="flex flex-wrap gap-2">
        {item.podeConfigurar ? (
          <SurfaceButton
            kind="primary"
            action={{ label: connectLabel, disabled: isPending, onClick: () => run("configure") }}
          />
        ) : null}
        {item.podeTestar ? (
          <SurfaceButton
            action={{
              label: "Verificar conexão",
              disabled: isPending,
              onClick: () => run("test"),
            }}
          />
        ) : null}
        {item.podeDesconectar ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run("disconnect")}
            className="inline-flex items-center rounded-[var(--yzi-radius-sm)] border px-3.5 py-2 text-[0.75rem] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderColor: toneColor("blocked", 0.34), color: toneColor("blocked", 0.95) }}
          >
            Remover conexão
          </button>
        ) : null}
      </div>
      {message ? (
        <p role="status" aria-live="polite" className={TYPE.meta}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

function ConnectionCard({ item }: { item: ConnectionViewModelItem }) {
  const { tone, label } = itemState(item);

  return (
    <article
      className="flex flex-col gap-4 rounded-[var(--yzi-radius-md)] border bg-[var(--yzi-surface-base)] px-5 py-4 shadow-[var(--yzi-edge-highlight)]"
      style={{ borderColor: toneColor(tone, 0.22) }}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="text-[0.95rem] font-medium text-[var(--yzi-text-primary)]">
            {item.nome}
          </h3>
          <p className={cx(TYPE.body, "max-w-xl")}>{item.finalidade}</p>
        </div>
        <StateTag tone={tone} label={label} />
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <dt className={TYPE.label}>Situação</dt>
          <dd className={TYPE.body}>{item.resumo}</dd>
        </div>
        <div className="flex flex-col gap-1.5">
          <dt className={TYPE.label}>O que já está liberado</dt>
          <dd>
            {item.capabilitiesDisponiveis.length ? (
              <ul className="flex flex-col gap-1">
                {item.capabilitiesDisponiveis.map((capability) => (
                  <li
                    key={capability}
                    className="flex items-start gap-2 text-[0.78rem] text-[var(--yzi-text-secondary)]"
                  >
                    <span
                      aria-hidden
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: toneColor("ok", 0.85) }}
                    />
                    {capability}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={TYPE.meta}>Nada liberado neste estado.</p>
            )}
          </dd>
        </div>
      </dl>

      {item.incidentesHumanos.length ? (
        <div className="flex flex-col gap-1.5 border-t border-[color:var(--yzi-border-subtle)] pt-4">
          <p className={TYPE.label}>Pontos de atenção</p>
          <ul className="flex flex-col gap-1">
            {item.incidentesHumanos.map((incident) => (
              <li key={incident} className={TYPE.body}>
                {incident}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {item.proximaAcao ? (
        <div className="flex flex-col gap-1.5 border-t border-[color:var(--yzi-border-subtle)] pt-4">
          <p className={TYPE.label}>Próximo passo</p>
          <p className={TYPE.body}>{item.proximaAcao}</p>
        </div>
      ) : null}

      <ConnectionCommands item={item} />

      <p className={TYPE.meta}>Última verificação: {displayDate(item.ultimaVerificacao)}</p>
    </article>
  );
}

export function YziImobConnectionsWorkspace({
  viewModel,
  authorizationCallbackStatus,
}: ConnectionsWorkspaceProps) {
  const [activeCategory, setActiveCategory] = useState<ConnectionCategory>("Atendimento");
  const notice = callbackNotice(authorizationCallbackStatus);

  const items = useMemo(
    () => (viewModel.loadState === "ready" ? viewModel.items : []),
    [viewModel],
  );

  const categoryItems = useMemo(
    () => items.filter((item) => item.categoria === activeCategory),
    [activeCategory, items],
  );

  const counts = useMemo(
    () => ({
      active: items.filter((item) => item.status === "Ativo").length,
      configuring: items.filter(isPreparing).length,
      attention: items.filter(isBroken).length,
      unavailable: items.filter(
        (item) =>
          !item.aguardandoVerificacaoExterna &&
          ["Indisponível", "Não conectado"].includes(item.status),
      ).length,
    }),
    [items],
  );

  const attentionItems = items.filter(isBroken);
  const pendingItems = items.filter(isPreparing);
  const awaitingExternal = items.filter((item) => item.aguardandoVerificacaoExterna);

  const metrics: SurfaceMetric[] = [
    {
      label: "Ativas",
      value: String(counts.active),
      detail: "Funcionando agora",
      tone: "ok",
    },
    {
      label: "Em preparação",
      value: String(counts.configuring),
      detail: awaitingExternal.length
        ? "Aguardando verificação empresarial"
        : "Falta concluir a autorização",
      tone: counts.configuring ? "pending" : undefined,
    },
    {
      label: "Precisam de atenção",
      value: String(counts.attention),
      detail: "Pararam de funcionar",
      tone: counts.attention ? "attention" : undefined,
    },
    {
      label: "Não configuradas",
      value: String(counts.unavailable),
      detail: "Ainda não fazem parte da operação",
    },
  ];

  const options = CONNECTION_CATEGORY_VALUES.map((category) => ({
    id: category,
    label: category,
    count: items.filter((item) => item.categoria === category).length,
  }));


  const header = (
    <SurfaceHeader
      kicker="Sistema"
      title="Conexões"
      lead="O que sua operação consegue fazer hoje: atender, publicar, medir e produzir. Cada conexão mostra o que já está liberado e o que falta."
      secondaryActions={[{ label: "Ver consumo", href: "/cockpit/yzi-imob/apis-creditos" }]}
    />
  );

  if (viewModel.loadState !== "ready") {
    const tone: SurfaceTone =
      viewModel.loadState === "empty"
        ? "idle"
        : viewModel.loadState === "no_membership" || viewModel.loadState === "no_session"
          ? "pending"
          : "attention";
    return (
      <SurfaceCanvas>
        {header}
        <SurfaceState
          tone={tone}
          title={
            viewModel.loadState === "empty"
              ? "Nenhuma conexão configurada ainda"
              : "Não foi possível ler suas conexões agora"
          }
          body={viewModel.message}
        />
      </SurfaceCanvas>
    );
  }

  return (
    <SurfaceCanvas width="wide">
      {header}

      {notice ? (
        <SurfaceState compact tone={notice.tone} title={notice.title} body={notice.body} />
      ) : null}

      <MetricBand metrics={metrics} />

      {awaitingExternal.length ? (
        <YziInsight
          context="Conexões da operação"
          tone="pending"
          stateLabel="Aguardando verificação"
          headline={
            awaitingExternal.length === 1
              ? `${awaitingExternal[0].nome} está aguardando verificação empresarial.`
              : `${awaitingExternal.length} conexões estão aguardando verificação empresarial.`
          }
          reading="Nada quebrou: essa verificação é feita por terceiros e ainda não foi concluída. Até lá, o que depende dela fica em espera e o resto da operação segue normal."
          evidence={awaitingExternal.map(
            (item) => `${item.nome}: ${CATEGORY_IMPACT[item.categoria]}`,
          )}
          recommendation="Envie a documentação pedida e acompanhe o retorno. Esse tipo de verificação costuma levar alguns dias e não depende de nova configuração aqui."
        />
      ) : null}

      {attentionItems.length ? (
        <YziInsight
          context="Conexões da operação"
          tone="attention"
          stateLabel="Precisa de atenção"
          headline={`${attentionItems.length} ${attentionItems.length === 1 ? "conexão parou" : "conexões pararam"} de funcionar.`}
          reading="Enquanto isso, a parte do produto que depende dela fica indisponível — mesmo que o resto continue rodando normalmente."
          evidence={attentionItems.map(
            (item) => `${item.nome}: ${CATEGORY_IMPACT[item.categoria]}`,
          )}
          recommendation="Reconecte a partir do card correspondente abaixo. Nada do que já foi publicado ou atendido é perdido nesse processo."
        />
      ) : pendingItems.length > awaitingExternal.length ? (
        <YziInsight
          context="Conexões da operação"
          tone="pending"
          stateLabel="Em preparação"
          headline={`${pendingItems.length} ${pendingItems.length === 1 ? "conexão está" : "conexões estão"} aguardando verificação.`}
          reading="Uma conta existir não basta: ela só passa a valer depois que a autorização e a verificação são concluídas. Até lá o produto não promete o que ainda não pode entregar."
          evidence={pendingItems.map((item) => `${item.nome}: ${item.proximaAcao ?? item.resumo}`)}
          recommendation="Conclua a etapa indicada em cada card. Algumas verificações dependem de aprovação externa e podem levar alguns dias."
        />
      ) : counts.active ? (
        <YziInsight
          context="Conexões da operação"
          tone="ok"
          stateLabel="Operação conectada"
          headline={`${counts.active} ${counts.active === 1 ? "conexão está ativa" : "conexões estão ativas"} e verificadas.`}
          reading="Tudo o que essas conexões liberam está disponível para a equipe usar agora."
        />
      ) : null}

      <SurfaceSection
        first
        title="Conexões por área"
        description={CATEGORY_IMPACT[activeCategory]}
        actions={
          <SurfaceSegmented
            legend="Área da operação"
            options={options}
            value={activeCategory}
            onChange={setActiveCategory}
          />
        }
      >
        {categoryItems.length ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {categoryItems.map((item) => (
              <ConnectionCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <SurfaceState
            tone="idle"
            title="Nenhuma conexão nesta área"
            body="Quando esta área passar a fazer parte da sua operação, as conexões dela aparecem aqui."
          />
        )}
      </SurfaceSection>
    </SurfaceCanvas>
  );
}
