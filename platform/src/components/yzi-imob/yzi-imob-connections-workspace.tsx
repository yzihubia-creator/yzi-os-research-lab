"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  CONNECTIONS_CATALOG,
  CONNECTION_CAPABILITY_LABEL,
  CONNECTION_GROUPS,
  CONNECTION_STATE_LABEL,
  CONNECTION_STATE_ROLE,
  summarizeConnectionMetrics,
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
  return entry.id === "meta" && entry.state === "nao-configurado" ? META_SURFACE_SUMMARY : entry.summary;
}

function metaRowSummary(entry: ConnectionEntry): string | null {
  if (entry.id !== "meta" || !entry.channels?.length) return null;
  const connectedCount = entry.channels.filter((channel) => channel.state === "conectado").length;
  const whatsapp = entry.channels.find((channel) => channel.id === "whatsapp");
  if (whatsapp?.state === "parcialmente-conectado") {
    return `${connectedCount} canais conectados · WhatsApp em implantação`;
  }
  return null;
}

function isMetaPartiallyConnected(entry: ConnectionEntry): boolean {
  if (entry.id !== "meta" || !entry.channels?.length) return false;
  const connectedCount = entry.channels.filter((channel) => channel.state === "conectado").length;
  return entry.state === "aguardando-autorizacao" && connectedCount > 0 && connectedCount < entry.channels.length;
}

function isChannelInConfiguration(channel: ConnectionChannel): boolean {
  return channel.state === "nao-configurado" && channel.nextAction === "Ativar número oficial";
}

function displayStateLabel(entry: ConnectionEntry): string {
  if (entry.state === "parcialmente-conectado") return "Parcialmente conectada";
  return isMetaPartiallyConnected(entry)
    ? "Parcialmente conectada"
    : CONNECTION_STATE_LABEL[entry.state];
}

function displayChannelStateLabel(channel: ConnectionChannel): string {
  return isChannelInConfiguration(channel) ? "Em configuração" : CONNECTION_STATE_LABEL[channel.state];
}

function StateChip({
  state,
  label,
}: {
  state: ConnectionEntry["state"];
  label?: string;
}) {
  const role =
    label === "Parcialmente conectada" || label === "Em configuração"
      ? "amber"
      : CONNECTION_STATE_ROLE[state];
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
      {label ?? CONNECTION_STATE_LABEL[state]}
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
        <StateChip state={entry.state} label={displayStateLabel(entry)} />
      </div>
      <p className="text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {metaRowSummary(entry) ?? surfaceSummary(entry)}
      </p>
      {entry.id !== "meta" && entry.primaryPendency ? (
        <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
          {entry.primaryPendency}
        </p>
      ) : null}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[0.74rem]">
      <span className="shrink-0 text-[var(--yzi-text-faint)]">{label}</span>
      <span className="min-w-0 break-words text-right text-[var(--yzi-text-secondary)]">{value}</span>
    </div>
  );
}

function displayDetail(value: string | null | undefined): string {
  return value?.trim() || "Ainda não disponível";
}

function displayDate(value: string | null | undefined): string {
  if (!value) return "Ainda não disponível";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Ainda não disponível";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function actionForState(state: ConnectionEntry["state"]): string | null {
  switch (state) {
    case "nao-configurado":
      return "Conectar";
    case "aguardando-autorizacao":
    case "parcialmente-conectado":
    case "em-configuracao":
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

function RelatedAssetGroup({
  title,
  assets,
  secondary,
}: {
  title: string;
  assets: NonNullable<ConnectionChannel["relatedAssets"]>;
  secondary?: boolean;
}) {
  if (!assets.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.64rem] font-medium uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
        {title}
      </span>
      <div className="flex flex-col gap-1.5">
        {assets.map((asset) => (
          <div
            key={`${asset.kind}:${asset.label}`}
            className={cx(
              "flex flex-col gap-1 rounded-[var(--yzi-radius-sm)] border px-3 py-2.5",
              secondary
                ? "border-[color:var(--yzi-border-subtle)] bg-transparent opacity-85"
                : "border-[color:var(--yzi-border-subtle)]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={cx(
                  "min-w-0 truncate text-[0.74rem]",
                  secondary
                    ? "font-normal text-[var(--yzi-text-faint)]"
                    : "font-medium text-[var(--yzi-text-secondary)]",
                )}
              >
                {asset.label}
              </span>
              <StateChip state={asset.state} />
            </div>
            {asset.description ? (
              <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">
                {asset.description}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChannelBlock({ channel, compact }: { channel: ConnectionChannel; compact?: boolean }) {
  const phoneAssets = channel.relatedAssets?.filter((asset) => asset.category === "phone") ?? [];
  const accountAssets = channel.relatedAssets?.filter((asset) => asset.category === "account") ?? [];

  return (
    <div className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.8rem] font-medium text-[var(--yzi-text-primary)]">
          {channel.label}
        </span>
        <StateChip state={channel.state} label={displayChannelStateLabel(channel)} />
      </div>
      <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {channel.summary}
      </p>
      {channel.displayName || channel.healthReason || channel.lastCheckedAt || channel.nextAction ? (
        <div className="flex flex-col gap-1">
          {channel.displayName ? (
            <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">
              {channel.displayName}
            </p>
          ) : null}
          {channel.healthReason ? (
            <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">
              {channel.healthReason}
            </p>
          ) : null}
          {channel.lastCheckedAt || channel.nextAction ? (
            <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">
              Última verificação: {displayDate(channel.lastCheckedAt)}
              {channel.nextAction ? ` · ${channel.nextAction}` : ""}
            </p>
          ) : null}
        </div>
      ) : null}
      {channel.relatedAssets?.length ? (
        <div className="mt-1 flex flex-col gap-3">
          <RelatedAssetGroup title="Números" assets={phoneAssets} />
          <RelatedAssetGroup title="Contas associadas" assets={accountAssets} secondary />
        </div>
      ) : null}
      {compact ? null : <CapabilityList capabilities={channel.capabilities} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MetaManagedPanel — bloco operacional de provisionamento gerenciado. */
/* Sem manipulação de autorização no frontend.                         */
/* ------------------------------------------------------------------ */

function MetaManagedPanel() {
  const [statusNote, setStatusNote] = useState<string | null>(null);

  function showManagedAction(action: string) {
    setStatusNote(`${action}: solicitação registrada para acompanhamento operacional.`);
  }

  return (
    <div className="flex flex-col gap-4 border-t border-[color:var(--yzi-border-subtle)] pt-4">
      <div className="flex flex-col gap-1.5">
        <h4 className="text-[0.92rem] font-semibold text-[var(--yzi-text-primary)]">
          Configuração gerenciada pela YZIHUB
        </h4>
        <p className="text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          A conexão da Meta é configurada durante a implantação. Acompanhe os canais
          identificados e eventuais pendências abaixo.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => showManagedAction("Atualizar estado")}
          className="rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.36)] bg-[rgba(var(--imob-cold),0.16)] px-3 py-1.5 text-[0.72rem] font-medium text-[rgb(var(--imob-ice))] transition-colors hover:bg-[rgba(var(--imob-cold),0.24)]"
        >
          Atualizar estado
        </button>
        <button
          type="button"
          onClick={() => showManagedAction("Ver detalhes")}
          className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-1.5 text-[0.72rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)]"
        >
          Ver detalhes
        </button>
        <button
          type="button"
          onClick={() => showManagedAction("Solicitar suporte")}
          className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-1.5 text-[0.72rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)]"
        >
          Solicitar suporte
        </button>
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
  const action = isMeta ? null : entry.nextAction || actionForState(entry.state);
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
          <StateChip state={entry.state} label={displayStateLabel(entry)} />
        </div>
        <p className="text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          {surfaceSummary(entry)}
        </p>
        {entry.displayName || entry.healthReason ? (
          <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-faint)]">
            {[entry.displayName, entry.healthReason].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>

      {isMeta ? <MetaManagedPanel /> : null}

      {isMeta ? (
        <div className="flex flex-col gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-4">
          <span className="text-[0.72rem] font-medium text-[var(--yzi-text-primary)]">
            Estados da conexão
          </span>
          <div className="flex flex-col gap-1.5 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3.5 py-3">
            <DetailRow label="Estado técnico" value={displayStateLabel(entry)} />
            <DetailRow
              label="Verificação empresarial"
              value={displayDetail(entry.businessVerificationStatus)}
            />
            <DetailRow label="Última verificação" value={displayDate(entry.lastCheckedAt)} />
            <DetailRow label="Pendência operacional" value={displayDetail(entry.nextAction)} />
          </div>
        </div>
      ) : null}

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
            <DetailRow label="Última verificação" value={displayDate(entry.lastCheckedAt)} />
            <DetailRow label="Ação indicada" value={displayDetail(entry.nextAction)} />
            <DetailRow label="Saúde" value={displayDetail(entry.healthReason)} />
          </div>
        </div>
      )}

      {isMeta ? null : entry.impact.length > 0 ? (
        <div className="flex flex-col gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-4">
          <span className="text-[0.72rem] font-medium text-[var(--yzi-text-primary)]">Impacto</span>
          <ul className="flex flex-col gap-1.5">
            {entry.impact.map((line, impactIndex) => (
              <li
                key={`${entry.id}:impact:${impactIndex}`}
                className="text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]"
              >
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

function entriesByGroup(entries: ConnectionEntry[], groupId: ConnectionGroupId): ConnectionEntry[] {
  return entries.filter((entry) => entry.groupId === groupId);
}

type OperationalImpactItem = {
  id: string;
  text: string;
};

function isTopOperationalImpactCandidate(entry: ConnectionEntry): boolean {
  return entry.priority === "essencial" && entry.state !== "conectado" && entry.state !== "em-breve";
}

function firstImpactItem(entry: ConnectionEntry): OperationalImpactItem | null {
  const impactIndex = entry.impact.findIndex((impact) => impact);
  return impactIndex >= 0
    ? {
        id: `${entry.id}:impact:${impactIndex}`,
        text: entry.impact[impactIndex],
      }
    : null;
}

function topOperationalImpactItems(catalog: ConnectionEntry[], limit: number): OperationalImpactItem[] {
  const items: OperationalImpactItem[] = [];
  const consolidatedIds = new Set<string>();
  const instagram = catalog.find((entry) => entry.id === "instagram-organico");
  const facebook = catalog.find((entry) => entry.id === "facebook-organico");
  const shouldConsolidateOrganicMeta =
    instagram &&
    facebook &&
    isTopOperationalImpactCandidate(instagram) &&
    isTopOperationalImpactCandidate(facebook) &&
    instagram.state === "parcialmente-conectado" &&
    facebook.state === "parcialmente-conectado" &&
    instagram.impact.length > 0 &&
    facebook.impact.length > 0;

  for (const entry of catalog) {
    if (!isTopOperationalImpactCandidate(entry)) continue;
    if (consolidatedIds.has(entry.id)) continue;
    if (shouldConsolidateOrganicMeta && entry.id === "instagram-organico") {
      items.push({
        id: "presenca-digital:instagram-facebook:publish-metrics",
        text: "Instagram e Facebook foram identificados, mas publicação e métricas ainda precisam ser validadas.",
      });
      consolidatedIds.add("instagram-organico");
      consolidatedIds.add("facebook-organico");
    } else {
      const item = firstImpactItem(entry);
      if (item) items.push(item);
    }
    if (items.length >= limit) break;
  }
  return items;
}

export function YziImobConnectionsWorkspace({
  connections = CONNECTIONS_CATALOG,
}: {
  connections?: ConnectionEntry[];
}) {
  const [activeGroup, setActiveGroup] = useState<ConnectionGroupId>("meta");
  const [selectedId, setSelectedId] = useState<string>("meta");
  const [assistantNote, setAssistantNote] = useState<string | null>(null);

  const groupEntries = useMemo(() => entriesByGroup(connections, activeGroup), [connections, activeGroup]);
  const selectedEntry =
    connections.find((entry) => entry.id === selectedId) ?? groupEntries[0];

  const connectionSummary = useMemo(() => summarizeConnectionMetrics(connections), [connections]);
  const activeCount = connectionSummary.connected;
  const deployingCount = connectionSummary.deploying;
  const upcomingCount = connectionSummary.upcoming;
  const attentionCount = connectionSummary.attention;
  const impacts = useMemo(() => topOperationalImpactItems(connections, 4), [connections]);

  // Mesma hierarquia cromática da Home: cada contador carrega o papel de cor do
  // TIPO de estado que representa (Material System v1) — pronto/validado,
  // leitura assistida em andamento, metadado sem estado, pendência.
  const counters: CounterItem[] = [
    {
      label: "Conectadas",
      value: String(activeCount),
      detail: "Conexões prontas para uso.",
      role: "coldGreen",
    },
    {
      label: "Em implantação",
      value: String(deployingCount),
      detail: "Conexões com configuração ou validação em andamento.",
      role: "cyan",
    },
    {
      label: "Próximas integrações",
      value: String(upcomingCount),
      detail: "Integrações disponíveis para as próximas etapas.",
      role: "neutral",
    },
    {
      label: "Com atenção",
      value: String(attentionCount),
      detail: "Conexões com falha ou autorização expirada.",
      role: "amber",
    },
  ];
  const groupTabs: WorkspaceTab[] = CONNECTION_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
  }));

  function selectGroup(id: string) {
    const groupId = id as ConnectionGroupId;
    setActiveGroup(groupId);
    const [firstEntry] = entriesByGroup(connections, groupId);
    if (firstEntry) setSelectedId(firstEntry.id);
  }

  function answer(text: string) {
    const normalized = text.trim().toLowerCase();
    if (!normalized) return;
    if (normalized.includes("atenç")) {
      setAssistantNote(
        impacts.length === 0
          ? "Nada precisa de atenção agora nas conexões essenciais."
          : impacts.map((impact) => impact.text).join(" "),
      );
      return;
    }
    if (normalized.includes("funcionando")) {
      setAssistantNote(
        activeCount === 0
          ? "Nenhuma conexão está ativa ainda — todas aguardam configuração."
          : activeCount === 1
            ? "1 conexão funcionando."
            : `${activeCount} conexões funcionando.`,
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

  // Mesma gramática da Home: a conversa da YZI é uma coluna compacta dentro do
  // conteúdo (max-w-2xl), enquanto a CounterStrip é uma faixa ESTRUTURAL que
  // vive fora do max-w-6xl e ocupa a largura inteira do canvas. Por isso as
  // duas nunca compartilham o mesmo wrapper de largura.
  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-6xl flex-col px-8 pb-12 pt-10">
        <EntityHero
          compactComposer
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
      </section>

      {/* Faixa full-bleed do canvas — sem mx-auto, sem max-width, sem padding
          lateral: começa e termina nos limites da área útil, como na Home. */}
      <section className="w-full">
        <CounterStrip counters={counters} variant="home" />
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-8 pb-10 pt-10">
        <WorkspaceSection
          title="Visão geral"
          description="Impacto operacional das conexões essenciais que ainda não estão prontas."
          first
        >
          {impacts.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {impacts.map((impact) => (
                <li
                  key={impact.id}
                  className="flex items-start gap-2.5 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3.5 py-3 text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: imobRgba("amber", 0.85) }}
                  />
                  {impact.text}
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
          Catálogo de conexões — o estado desta imobiliária vem do Supabase quando disponível.
          Consumo e créditos vivem em Contas &amp; Consumo, não aqui.
        </p>
      </section>
    </div>
  );
}
