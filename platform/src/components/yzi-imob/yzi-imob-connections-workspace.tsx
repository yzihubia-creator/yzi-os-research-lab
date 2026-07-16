"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  CONNECTIONS_CATALOG,
  CONNECTION_CAPABILITY_LABEL,
  CONNECTION_GROUPS,
  CONNECTION_STATE_LABEL,
  CONNECTION_STATE_ROLE,
  connectionsByGroup,
  countActiveConnections,
  countAwaitingAuthorization,
  countNeedsAttention,
  countNotConfigured,
  topOperationalImpacts,
  type ConnectionChannel,
  type ConnectionEntry,
  type ConnectionGroupId,
} from "@/lib/yzi-imob/connections";
import {
  CounterStrip,
  EntityHero,
  WorkspaceSection,
  WorkspaceTabs,
  cx,
  type CounterItem,
  type WorkspaceTab,
} from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";

// Conexões Operacionais v2 — centro de vínculo, autorização, disponibilidade
// e capacidade operacional. Não é a tela de consumo/custos (isso é APIs &
// Créditos, /cockpit/yzi-imob/apis-creditos) e não duplica o catálogo dela.
// A Meta é UMA conexão-ecossistema: WhatsApp, Instagram, Página do Facebook
// e Conta de anúncios são canais dentro dela, com estado próprio, nunca
// quatro integrações independentes.
// Catálogo estático (Connection Catalog): hoje não existe Tenant Connection
// nesta base, então toda linha reflete o estado honesto "não configurado"/
// "disponível em breve" — nenhum número ou saúde é inventado.
// Ver docs/yzi-imob/yzi-imob-conexoes-backend-contract-v1.md.

// Entradas cuja capacidade se relaciona a consumo cobrado pela YZI — as
// únicas que ganham o link "Ver consumo e limites" para Contas & Consumo.
// Métricas de leitura (Analytics, Search Console, Business Profile, Google
// Ads) não têm consumo YZI associado hoje.
const CONSUMPTION_LINKED_IDS = new Set(["site", "meta", "criacao-criativos", "narracao-ia"]);

// Override de superfície (sem tocar no catálogo): o summary da Meta no
// catálogo insinua que uma única autorização libera automaticamente os
// quatro canais — a frase aprovada de produto é a de "localizar e
// configurar", sem promessa de liberação automática.
const META_SURFACE_SUMMARY =
  "A conexão com a Meta permite localizar e configurar os canais disponíveis para a imobiliária.";

function surfaceSummary(entry: ConnectionEntry): string {
  return entry.id === "meta" ? META_SURFACE_SUMMARY : entry.summary;
}

function StateChip({ state }: { state: ConnectionEntry["state"] }) {
  const role = CONNECTION_STATE_ROLE[state];
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
      {CONNECTION_STATE_LABEL[state]}
    </span>
  );
}

function ConnectionRow({
  entry,
  active,
  onSelect,
}: {
  entry: ConnectionEntry;
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
        <span
          className={cx(
            "min-w-0 truncate text-[0.86rem] font-medium",
            active ? "text-[var(--yzi-text-primary)]" : "text-[var(--yzi-text-secondary)]",
          )}
        >
          {entry.label}
        </span>
        <StateChip state={entry.state} />
      </div>
      <p className="text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {surfaceSummary(entry)}
      </p>
      {entry.primaryPendency ? (
        <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
          {entry.primaryPendency}
        </p>
      ) : null}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[0.74rem]">
      <span className="shrink-0 text-[var(--yzi-text-faint)]">{label}</span>
      <span className="truncate text-right text-[var(--yzi-text-secondary)]">{value}</span>
    </div>
  );
}

function actionForState(state: ConnectionEntry["state"]): string | null {
  switch (state) {
    case "nao-configurado":
      return "Conectar";
    case "aguardando-autorizacao":
      return "Revisar autorização";
    case "requer-atencao":
      return "Reconectar";
    case "conectado":
      return "Gerenciar conexão";
    case "em-breve":
      return null;
  }
}

function CapabilityList({ capabilities }: { capabilities: ConnectionEntry["capabilities"] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {capabilities.map((capability) => (
        <li
          key={capability.id}
          className="flex items-center gap-2 text-[0.76rem] text-[var(--yzi-text-secondary)]"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              backgroundColor: imobRgba(capability.unlocked ? "coldGreen" : "neutral", 0.85),
            }}
          />
          <span className={capability.unlocked ? "" : "text-[var(--yzi-text-faint)]"}>
            {CONNECTION_CAPABILITY_LABEL[capability.id]}
          </span>
          {!capability.unlocked ? (
            <span className="text-[0.64rem] text-[var(--yzi-text-faint)]">— depende da conexão</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ChannelBlock({ channel, compact }: { channel: ConnectionChannel; compact?: boolean }) {
  return (
    <div className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.8rem] font-medium text-[var(--yzi-text-primary)]">
          {channel.label}
        </span>
        <StateChip state={channel.state} />
      </div>
      <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {channel.summary}
      </p>
      {compact ? null : <CapabilityList capabilities={channel.capabilities} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MetaConnectPanel — bloco operacional único de conexão Meta.         */
/* Estado somente em memória; backend ainda não ligado nesta unidade,  */
/* então qualquer ação termina no estado honesto                       */
/* "Conexão segura em preparação".                                     */
/* ------------------------------------------------------------------ */

function MetaConnectPanel() {
  const [authInput, setAuthInput] = useState("");
  const [statusNote, setStatusNote] = useState<string | null>(null);

  function connect() {
    setStatusNote("Conexão segura em preparação");
  }

  return (
    <div className="flex flex-col gap-4 border-t border-[color:var(--yzi-border-subtle)] pt-4">
      <div className="flex flex-col gap-1.5">
        <h4 className="text-[0.92rem] font-semibold text-[var(--yzi-text-primary)]">
          Conectar a Meta
        </h4>
        <p className="text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          Conecte a conta da imobiliária para localizar os canais disponíveis.
        </p>
      </div>

      <button
        type="button"
        onClick={connect}
        className="w-full rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.36)] bg-[rgba(var(--imob-cold),0.16)] px-4 py-2.5 text-[0.8rem] font-medium text-[rgb(var(--imob-ice))] transition-colors hover:bg-[rgba(var(--imob-cold),0.24)]"
      >
        Conectar com a Meta
      </button>

      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-[var(--yzi-border-subtle)]" />
        <span className="text-[0.66rem] text-[var(--yzi-text-faint)]">
          ou use uma autorização existente
        </span>
        <span className="h-px flex-1 bg-[var(--yzi-border-subtle)]" />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="meta-auth-input"
          className="text-[0.72rem] text-[var(--yzi-text-secondary)]"
        >
          Token ou link de autorização
        </label>
        <input
          id="meta-auth-input"
          name="meta-auth-input"
          type="text"
          value={authInput}
          onChange={(event) => setAuthInput(event.target.value)}
          placeholder="Cole o token ou link fornecido pela Meta"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2.5 text-[0.84rem] text-[var(--yzi-text-primary)] outline-none transition-colors placeholder:text-[var(--yzi-text-faint)] focus:border-[color:rgba(var(--imob-ice),0.35)]"
        />
        <button
          type="button"
          onClick={connect}
          disabled={!authInput.trim()}
          className="w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-4 py-2.5 text-[0.78rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Verificar e conectar
        </button>
        <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">
          A informação será usada somente para conectar a conta e não ficará visível depois.
        </p>
      </div>

      {statusNote ? (
        <p
          role="status"
          className="inline-flex items-center gap-2 text-[0.74rem] text-[rgb(var(--imob-ice))]"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(var(--imob-ice),0.8)]"
          />
          {statusNote}
        </p>
      ) : null}
    </div>
  );
}

function ConnectionDetail({ entry }: { entry: ConnectionEntry }) {
  const groupLabel = CONNECTION_GROUPS.find((group) => group.id === entry.groupId)?.label ?? "";
  const isMeta = entry.id === "meta";
  const action = isMeta ? null : actionForState(entry.state);
  const showConsumptionLink = CONSUMPTION_LINKED_IDS.has(entry.id);

  return (
    <div className="flex flex-col gap-6 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-5 shadow-[var(--yzi-edge-highlight)]">
      <div className="flex flex-col gap-2">
        {groupLabel !== entry.label ? (
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[var(--yzi-text-faint)]">
            {groupLabel}
          </span>
        ) : null}
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-[1.05rem] font-semibold text-[var(--yzi-text-primary)]">
            {entry.label}
          </h3>
          <StateChip state={entry.state} />
        </div>
        <p className="text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          {surfaceSummary(entry)}
        </p>
      </div>

      {isMeta ? <MetaConnectPanel /> : null}

      {entry.channels && entry.channels.length > 0 ? (
        <div className="flex flex-col gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-4">
          <span className="text-[0.72rem] font-medium text-[var(--yzi-text-primary)]">
            Canais desta conexão
          </span>
          <div className="flex flex-col divide-y divide-[color:var(--yzi-border-subtle)]">
            {entry.channels.map((channel) => (
              <ChannelBlock key={channel.id} channel={channel} compact={isMeta} />
            ))}
          </div>
        </div>
      ) : null}

      {entry.capabilities.length > 0 ? (
        <div className="flex flex-col gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-4">
          <span className="text-[0.72rem] font-medium text-[var(--yzi-text-primary)]">
            Capacidade do produto
          </span>
          <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">
            O que o YZI IMOB suporta nesta conexão — a disponibilidade na sua operação depende da
            conexão real da imobiliária.
          </p>
          <CapabilityList capabilities={entry.capabilities} />
        </div>
      ) : null}

      {isMeta ? null : (
        <div className="flex flex-col gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-4">
          <span className="text-[0.72rem] font-medium text-[var(--yzi-text-primary)]">Saúde</span>
          <div className="flex flex-col gap-1.5 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3.5 py-3">
            <DetailRow label="Última sincronização" value="Ainda não disponível" />
            <DetailRow label="Última falha" value="Ainda não disponível" />
            <DetailRow label="Autorização" value="Ainda não disponível" />
          </div>
        </div>
      )}

      {isMeta ? null : entry.impact.length > 0 ? (
        <div className="flex flex-col gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-4">
          <span className="text-[0.72rem] font-medium text-[var(--yzi-text-primary)]">Impacto</span>
          <ul className="flex flex-col gap-1.5">
            {entry.impact.map((line) => (
              <li key={line} className="text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-[var(--yzi-radius-sm)] border border-dashed border-[color:var(--yzi-border-subtle)] px-3.5 py-3 text-[0.72rem] text-[var(--yzi-text-faint)]">
          Ainda sem contrato de produto para esta conexão — nenhuma ação depende dela hoje.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2.5 border-t border-[color:var(--yzi-border-subtle)] pt-4">
        {action ? (
          <button
            type="button"
            disabled
            title="Em preparação — aguardando contrato de backend"
            className="cursor-not-allowed rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-1.5 text-[0.72rem] text-[var(--yzi-text-faint)] opacity-60"
          >
            {action}
          </button>
        ) : null}
        {showConsumptionLink ? (
          <Link
            href="/cockpit/yzi-imob/apis-creditos"
            className="text-[0.72rem] text-[var(--yzi-text-secondary)] underline decoration-[color:var(--yzi-border-subtle)] underline-offset-4 transition-colors hover:text-[var(--yzi-text-primary)]"
          >
            Ver consumo e limites →
          </Link>
        ) : null}
      </div>

      {isMeta ? null : (
        <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">
          Evidência: {entry.evidenceNote}
        </p>
      )}
    </div>
  );
}

export function YziImobConnectionsWorkspace() {
  const [activeGroup, setActiveGroup] = useState<ConnectionGroupId>("meta");
  const [selectedId, setSelectedId] = useState<string>("meta");
  const [assistantNote, setAssistantNote] = useState<string | null>(null);

  const groupEntries = useMemo(() => connectionsByGroup(activeGroup), [activeGroup]);
  const selectedEntry =
    CONNECTIONS_CATALOG.find((entry) => entry.id === selectedId) ?? groupEntries[0];

  const activeCount = useMemo(() => countActiveConnections(CONNECTIONS_CATALOG), []);
  const awaitingCount = useMemo(() => countAwaitingAuthorization(CONNECTIONS_CATALOG), []);
  const notConfiguredCount = useMemo(() => countNotConfigured(CONNECTIONS_CATALOG), []);
  const attentionCount = useMemo(() => countNeedsAttention(CONNECTIONS_CATALOG), []);
  const impacts = useMemo(() => topOperationalImpacts(CONNECTIONS_CATALOG, 4), []);

  const counters: CounterItem[] = [
    {
      label: "Ativas",
      value: String(activeCount),
      detail:
        activeCount === 0
          ? "Nenhuma conexão ativa ainda."
          : `${activeCount} conexão(ões) funcionando na operação.`,
    },
    {
      label: "Aguardando",
      value: String(awaitingCount),
      detail:
        awaitingCount === 0
          ? "Nenhuma autorização em andamento."
          : `${awaitingCount} autorização(ões) em andamento.`,
    },
    {
      label: "Não configuradas",
      value: String(notConfiguredCount),
      detail: "Conexões disponíveis que ainda não foram configuradas.",
      accent: notConfiguredCount > 0,
    },
    {
      label: "Com atenção",
      value: String(attentionCount),
      detail:
        attentionCount === 0
          ? "Nenhuma conexão com falha ou autorização vencida."
          : `${attentionCount} conexão(ões) precisando de ação.`,
      accent: attentionCount > 0,
    },
  ];

  const groupTabs: WorkspaceTab[] = CONNECTION_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
  }));

  function selectGroup(id: string) {
    const groupId = id as ConnectionGroupId;
    setActiveGroup(groupId);
    const [firstEntry] = connectionsByGroup(groupId);
    if (firstEntry) setSelectedId(firstEntry.id);
  }

  function answer(text: string) {
    const normalized = text.trim().toLowerCase();
    if (!normalized) return;
    if (normalized.includes("atenç")) {
      setAssistantNote(
        impacts.length === 0
          ? "Nada precisa de atenção agora nas conexões essenciais."
          : impacts.join(" "),
      );
      return;
    }
    if (normalized.includes("funcionando")) {
      setAssistantNote(
        activeCount === 0
          ? "Nenhuma conexão está ativa ainda — todas aguardam configuração."
          : `${activeCount} conexão(ões) funcionando.`,
      );
      return;
    }
    if (normalized.includes("publicar")) {
      selectGroup("meta");
      setAssistantNote(
        "Abri a Meta — Instagram e Página do Facebook fazem parte dessa conexão, que ainda não foi configurada para publicar.",
      );
      return;
    }
    if (normalized.includes("atender")) {
      selectGroup("meta");
      setAssistantNote(
        "Abri a Meta — o WhatsApp faz parte dessa conexão. O produto suporta registrar conversas, mas a conexão desta imobiliária ainda não foi configurada.",
      );
      return;
    }
    setAssistantNote(
      "Ainda não converso livremente nesta tela. Use as ações rápidas ou os grupos para revisar cada conexão.",
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-8 py-10">
      <EntityHero
        backHref="/cockpit/yzi-imob"
        backLabel="Início"
        kicker="Ecossistema integrado"
        title="Conexões"
        subtitle="Acompanhe os canais e serviços que permitem à YZI publicar, atender, anunciar e medir sua operação."
        statusLabel={
          activeCount === 0
            ? "Conexões em configuração"
            : attentionCount > 0
              ? "Conexões precisam de atenção"
              : "Operação conectada"
        }
        composerPlaceholder="Pergunte sobre suas conexões"
        quickActions={[
          { label: "O que precisa de atenção?" },
          { label: "O que já está funcionando?" },
          { label: "O que falta para publicar?" },
          { label: "O que falta para atender?" },
        ]}
        assistantMessage={
          assistantNote ??
          "Eu uso estas conexões para executar a operação. Elas ainda estão sendo configuradas — quando uma autorização falta ou expira, algumas ações deixam de funcionar."
        }
        onAsk={answer}
      />

      <CounterStrip counters={counters} />

      <WorkspaceSection
        title="Visão geral"
        description="Impacto operacional das conexões essenciais que ainda não estão prontas."
        first
      >
        {impacts.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {impacts.map((line) => (
              <li
                key={line}
                className="flex items-start gap-2.5 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3.5 py-3 text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]"
              >
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: imobRgba("amber", 0.85) }}
                />
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-4 py-3.5 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
            Nenhum impacto pendente nas conexões essenciais no momento.
          </p>
        )}
      </WorkspaceSection>

      <WorkspaceSection
        title="Conexões por grupo"
        description="Cada grupo reúne canais e serviços com a mesma natureza operacional."
      >
        <WorkspaceTabs tabs={groupTabs} active={activeGroup} onChange={selectGroup} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex h-fit flex-col divide-y divide-[color:var(--yzi-border-subtle)] overflow-hidden rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)]">
            {groupEntries.map((entry) => (
              <ConnectionRow
                key={entry.id}
                entry={entry}
                active={entry.id === selectedEntry?.id}
                onSelect={() => setSelectedId(entry.id)}
              />
            ))}
          </div>

          {selectedEntry ? <ConnectionDetail entry={selectedEntry} /> : null}
        </div>
      </WorkspaceSection>

      <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Catálogo de conexões — nenhuma conta está conectada de verdade ainda. Consumo e créditos
        vivem em Contas &amp; Consumo, não aqui.
      </p>
    </section>
  );
}
