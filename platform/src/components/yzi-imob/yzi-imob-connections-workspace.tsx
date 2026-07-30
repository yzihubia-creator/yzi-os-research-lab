"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { runConnectionCommandAction } from "@/app/cockpit/yzi-imob/conexoes/actions";
import {
  CONNECTION_CATEGORY_VALUES,
  type ConnectionCategory,
  type ConnectionHumanStatus,
  type ConnectionsViewModel,
  type ConnectionViewModelItem,
} from "@/lib/yzi-imob/connections/public-view-model";
import {
  CounterStrip,
  EntityHero,
  WorkspaceSection,
  WorkspaceTabs,
  cx,
  type CounterItem,
  type WorkspaceTab,
} from "@/components/yzi-imob/yzi-imob-workspace-kit";
import {
  imobRgba,
  type YziImobRole,
} from "@/components/yzi-imob/yzi-imob-status-colors";

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

const STATUS_ROLE: Record<ConnectionHumanStatus, YziImobRole> = {
  "Não conectado": "neutral",
  "Aguardando autorização": "amber",
  Conectando: "amber",
  Ativo: "coldGreen",
  "Precisa de atenção": "wine",
  "Autorização expirada": "wine",
  Indisponível: "neutral",
};

function StateChip({ status }: { status: ConnectionHumanStatus }) {
  const role = STATUS_ROLE[status];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.64rem]"
      style={{
        borderColor: imobRgba(role, 0.32),
        backgroundColor: imobRgba(role, 0.1),
        color: imobRgba(role, 0.95),
      }}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: imobRgba(role, 0.9) }}
      />
      {status}
    </span>
  );
}

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
): { role: "success" | "warning"; message: string } | null {
  switch (status) {
    case "success":
      return {
        role: "success",
        message: "A autorização foi concluída. O estado abaixo foi recarregado a partir do backend.",
      };
    case "cancelled":
      return { role: "warning", message: "A autorização foi cancelada." };
    case "expired":
      return { role: "warning", message: "A autorização expirou. Inicie o fluxo novamente." };
    case "invalid_state":
      return { role: "warning", message: "A autorização é inválida ou já foi consumida." };
    case "provider_error":
    case "internal_error":
      return {
        role: "warning",
        message: "Não foi possível concluir a autorização agora.",
      };
    case null:
    case undefined:
      return null;
  }
}

function ConnectionRow({
  item,
  active,
  onSelect,
}: {
  item: ConnectionViewModelItem;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cx(
        "flex w-full flex-col gap-1.5 px-4 py-3.5 text-left transition-colors",
        active
          ? "bg-[var(--yzi-surface-elevated)]"
          : "hover:bg-[var(--yzi-surface-elevated)]/50",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-[0.86rem] font-medium text-[var(--yzi-text-primary)]">
          {item.nome}
        </span>
        <StateChip status={item.status} />
      </div>
      <p className="text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {item.resumo}
      </p>
      {item.proximaAcao ? (
        <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
          Próxima ação: {item.proximaAcao}
        </p>
      ) : null}
    </button>
  );
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
            ? "Solicitação de configuração registrada."
            : command === "test"
              ? "Validação controlada enfileirada."
              : "Conexão revogada localmente.",
        );
        router.refresh();
        return;
      }
      setMessage(
        result.code === "configuration_required"
          ? "A configuração server-side ainda precisa ser concluída."
          : "A ação não pôde ser concluída. Nenhum segredo ou conteúdo foi alterado.",
      );
    });
  }

  if (!item.podeConfigurar && !item.podeTestar && !item.podeDesconectar) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-4">
      <div className="flex flex-wrap gap-2">
        {item.podeConfigurar ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run("configure")}
            className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-1.5 text-[0.72rem] text-[var(--yzi-text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {item.status === "Aguardando autorização"
              ? "Continuar autorização"
              : item.status === "Autorização expirada" ||
                  item.status === "Precisa de atenção"
                ? "Reconectar"
                : "Conectar"}
          </button>
        ) : null}
        {item.podeTestar ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run("test")}
            className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-1.5 text-[0.72rem] text-[var(--yzi-text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Verificar conexão
          </button>
        ) : null}
        {item.podeDesconectar ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run("disconnect")}
            className="rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-wine),0.3)] px-3 py-1.5 text-[0.72rem] text-[rgb(var(--imob-wine))] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Revogar
          </button>
        ) : null}
      </div>
      {message ? (
        <p role="status" className="text-[0.7rem] text-[var(--yzi-text-secondary)]">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function ConnectionDetail({ item }: { item: ConnectionViewModelItem }) {
  return (
    <div className="flex flex-col gap-5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-5 shadow-[var(--yzi-edge-highlight)]">
      <div className="flex flex-col gap-2">
        <span className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[var(--yzi-text-faint)]">
          {item.categoria}
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-[1.05rem] font-semibold text-[var(--yzi-text-primary)]">
            {item.nome}
          </h3>
          <StateChip status={item.status} />
        </div>
        <p className="text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          {item.finalidade}
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-4">
        <span className="text-[0.72rem] font-medium text-[var(--yzi-text-primary)]">
          Estado operacional
        </span>
        <p className="text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          {item.resumo}
        </p>
        <p className="text-[0.7rem] text-[var(--yzi-text-faint)]">
          Última verificação: {displayDate(item.ultimaVerificacao)}
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-4">
        <span className="text-[0.72rem] font-medium text-[var(--yzi-text-primary)]">
          Recursos disponíveis
        </span>
        {item.capabilitiesDisponiveis.length ? (
          <ul className="flex flex-col gap-1.5">
            {item.capabilitiesDisponiveis.map((capability) => (
              <li
                key={capability}
                className="flex items-center gap-2 text-[0.76rem] text-[var(--yzi-text-secondary)]"
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: imobRgba("coldGreen", 0.85) }}
                />
                {capability}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[0.72rem] text-[var(--yzi-text-faint)]">
            Nenhum recurso liberado neste estado.
          </p>
        )}
      </div>

      {item.incidentesHumanos.length ? (
        <div className="flex flex-col gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-4">
          <span className="text-[0.72rem] font-medium text-[var(--yzi-text-primary)]">
            Pontos de atenção
          </span>
          <ul className="flex flex-col gap-1.5">
            {item.incidentesHumanos.map((incident) => (
              <li
                key={incident}
                className="text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]"
              >
                {incident}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {item.proximaAcao ? (
        <div className="flex flex-col gap-1.5 border-t border-[color:var(--yzi-border-subtle)] pt-4">
          <span className="text-[0.72rem] font-medium text-[var(--yzi-text-primary)]">
            Próxima ação
          </span>
          <p className="text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">
            {item.proximaAcao}
          </p>
        </div>
      ) : null}

      <ConnectionCommands item={item} />

      {item.id === "publicacao-social" ? (
        <Link
          href="/cockpit/yzi-imob/marketing/publicacoes"
          className="text-[0.72rem] text-[var(--yzi-text-secondary)] underline decoration-[color:var(--yzi-border-subtle)] underline-offset-4 hover:text-[var(--yzi-text-primary)]"
        >
          Abrir histórico de publicações →
        </Link>
      ) : null}
    </div>
  );
}

export function YziImobConnectionsWorkspace({
  viewModel,
  authorizationCallbackStatus,
}: ConnectionsWorkspaceProps) {
  const [activeCategory, setActiveCategory] =
    useState<ConnectionCategory>("Atendimento");
  const [selectedId, setSelectedId] = useState<string>(
    viewModel.items[0]?.id ?? "",
  );
  const notice = callbackNotice(authorizationCallbackStatus);
  const items = useMemo(
    () => (viewModel.loadState === "ready" ? viewModel.items : []),
    [viewModel],
  );
  const categoryItems = useMemo(
    () => items.filter((item) => item.categoria === activeCategory),
    [activeCategory, items],
  );
  const selected =
    items.find((item) => item.id === selectedId) ?? categoryItems[0];
  const counts = useMemo(
    () => ({
      active: items.filter((item) => item.status === "Ativo").length,
      configuring: items.filter((item) =>
        ["Conectando", "Aguardando autorização"].includes(item.status),
      ).length,
      attention: items.filter((item) =>
        ["Precisa de atenção", "Autorização expirada"].includes(item.status),
      ).length,
      unavailable: items.filter((item) =>
        ["Indisponível", "Não conectado"].includes(item.status),
      ).length,
    }),
    [items],
  );
  const counters: CounterItem[] = [
    { label: "Ativas", value: String(counts.active), detail: "Conexões validadas e saudáveis.", role: "coldGreen" },
    { label: "Em preparação", value: String(counts.configuring), detail: "Configuração ou verificação pendente.", role: "cyan" },
    { label: "Com atenção", value: String(counts.attention), detail: "Autorização ou saúde precisa de revisão.", role: "amber" },
    { label: "Não disponíveis", value: String(counts.unavailable), detail: "Não configuradas ou fora do MVP.", role: "neutral" },
  ];
  const tabs: WorkspaceTab[] = CONNECTION_CATEGORY_VALUES.map((category) => ({
    id: category,
    label: category,
  }));

  function selectCategory(id: string) {
    const category = id as ConnectionCategory;
    setActiveCategory(category);
    const first = items.find((item) => item.categoria === category);
    setSelectedId(first?.id ?? "");
  }

  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-6xl flex-col px-8 pb-12 pt-10">
        <EntityHero
          compactComposer
          backHref="/cockpit/yzi-imob"
          backLabel="Início"
          kicker="Operação integrada"
          title="Conexões"
          subtitle="Acompanhe o estado verdadeiro das capabilities que permitem atender, publicar e medir a operação."
          statusLabel={
            viewModel.loadState !== "ready"
              ? "Estado real indisponível"
              : counts.attention
                ? "Conexões precisam de atenção"
                : counts.active
                  ? "Operação conectada"
                  : "Conexões em configuração"
          }
          composerPlaceholder="Pergunte sobre suas conexões"
          quickActions={[]}
          assistantMessage={
            viewModel.loadState === "ready"
              ? "Uma conta existente só aparece como ativa depois de autorização e saúde validadas."
              : viewModel.message
          }
          onAsk={() => undefined}
        />
        {notice ? (
          <div
            className={cx(
              "mt-5 rounded-[var(--yzi-radius-md)] border px-4 py-3 text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]",
              notice.role === "success"
                ? "border-[rgba(var(--imob-green),0.34)] bg-[rgba(var(--imob-green),0.08)]"
                : "border-[rgba(var(--imob-amber),0.34)] bg-[rgba(var(--imob-amber),0.08)]",
            )}
          >
            {notice.message}
          </div>
        ) : null}
      </section>

      <section className="w-full">
        <CounterStrip counters={counters} variant="home" />
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-8 pb-10 pt-10">
        <WorkspaceSection
          title="Conexões por categoria"
          description="O estado vem do backend e não é promovido apenas porque uma conta existe."
          first
        >
          {viewModel.loadState === "ready" ? (
            <>
              <WorkspaceTabs tabs={tabs} active={activeCategory} onChange={selectCategory} />
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
                <div className="flex h-fit flex-col divide-y divide-[color:var(--yzi-border-subtle)] overflow-hidden rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)]">
                  {categoryItems.length ? (
                    categoryItems.map((item) => (
                      <ConnectionRow
                        key={item.id}
                        item={item}
                        active={item.id === selected?.id}
                        onSelect={() => setSelectedId(item.id)}
                      />
                    ))
                  ) : (
                    <p className="px-4 py-3.5 text-[0.76rem] text-[var(--yzi-text-secondary)]">
                      Nenhuma conexão nesta categoria.
                    </p>
                  )}
                </div>
                {selected ? (
                  <ConnectionDetail item={selected} />
                ) : (
                  <p className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-4 py-3.5 text-[0.76rem] text-[var(--yzi-text-secondary)]">
                    Nenhuma conexão disponível para detalhar.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-4 py-3.5 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
              {viewModel.message}
            </p>
          )}
        </WorkspaceSection>
      </section>
    </div>
  );
}
