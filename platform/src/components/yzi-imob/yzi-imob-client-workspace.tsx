"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  CounterStrip,
  EntityHero,
  WorkspaceGrid,
  WorkspaceSection,
  WorkspaceTabs,
  cx,
  type CounterItem,
} from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { WorkspaceField } from "@/components/yzi-imob/yzi-imob-workspace-fields";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import type { YziInspection } from "@/components/yzi-imob/yzi-imob-workspace-context";
import {
  CLIENT_STAGE_ACCENT,
  imobRgba,
  type YziImobRole,
} from "@/components/yzi-imob/yzi-imob-status-colors";
import type {
  YziImobLeadConversation,
  YziImobLeadInterest,
  YziImobLeadWorkspaceData,
} from "@/lib/yzi-imob/leads/types";

const TABS = [
  { id: "perfil", label: "Perfil" },
  { id: "interesses", label: "Interesses" },
  { id: "imoveis", label: "Imoveis" },
  { id: "conversas", label: "Conversas" },
];

const LEAD_STATUS_LABEL: Record<string, string> = {
  lead: "Lead",
  qualificado: "Qualificado",
  cliente: "Cliente",
  inativo: "Inativo",
};

const HERO_BY_STATUS: Record<string, string> = {
  lead: "Lead real carregado. Acompanhe somente os dados confirmados neste tenant.",
  qualificado: "Lead qualificado real. Interesses e conversas abaixo vem das tabelas operacionais.",
  cliente: "Cliente real carregado. Esta tela exibe somente fontes confirmadas.",
  inativo: "Lead real inativo. Nenhuma acao automatica esta em andamento nesta tela.",
};

function emptyLabel(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "Ainda sem dados";
  return String(value);
}

function statusLabel(status: string | null): string {
  if (!status) return "Ainda sem dados";
  return LEAD_STATUS_LABEL[status] ?? status;
}

function statusRole(status: string | null): YziImobRole {
  if (status && status in CLIENT_STAGE_ACCENT) {
    return CLIENT_STAGE_ACCENT[status as keyof typeof CLIENT_STAGE_ACCENT];
  }
  return "neutral";
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "Ainda sem dados";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function latestInteraction(conversations: readonly YziImobLeadConversation[]): string | null {
  let latest: string | null = null;
  for (const conversation of conversations) {
    const candidate = conversation.lastMessageAt ?? conversation.startedAt;
    if (!candidate) continue;
    if (!latest || Date.parse(candidate) > Date.parse(latest)) latest = candidate;
  }
  return latest;
}

function maxInterestScore(interests: readonly YziImobLeadInterest[]): number | null {
  const scores = interests
    .map((interest) => interest.score)
    .filter((score): score is number => score !== null);
  return scores.length ? Math.max(...scores) : null;
}

function contactSummary(data: YziImobLeadWorkspaceData): string {
  return data.lead.phone || data.lead.email || "Ainda sem dados";
}

function leadCounters(data: YziImobLeadWorkspaceData): CounterItem[] {
  const latest = latestInteraction(data.conversations);
  return [
    {
      label: "Interesses",
      value: String(data.interests.length),
      detail: data.interests.length ? "Registros reais de interesse" : "Ainda sem dados",
    },
    {
      label: "Maior score",
      value: emptyLabel(maxInterestScore(data.interests)),
      detail: "Maior score real de interesse",
      accent: maxInterestScore(data.interests) !== null,
    },
    {
      label: "Ultima interacao",
      value: latest ? formatDateTime(latest) : "-",
      detail: latest ? "Registrada em conversation" : "Ainda sem dados",
    },
    {
      label: "Conversas",
      value: String(data.conversations.length),
      detail: data.conversations.length ? "Relacionadas ao lead" : "Ainda sem dados",
    },
  ];
}

function toLeadInspection(data: YziImobLeadWorkspaceData): YziInspection {
  const checklist = [
    { label: "Lead carregado", done: true },
    { label: "Contato disponivel", done: Boolean(data.lead.phone || data.lead.email) },
    { label: "Interesse registrado", done: data.interests.length > 0 },
    { label: "Conversation registrada", done: data.conversations.length > 0 },
    { label: "Notes preenchido", done: Boolean(data.lead.notes) },
  ];
  const doneCount = checklist.filter((item) => item.done).length;

  return {
    name: data.lead.fullName,
    subtitle: `${emptyLabel(data.lead.source)} - ${contactSummary(data)}`,
    statusLabel: statusLabel(data.lead.status),
    situation: data.conversations.length
      ? "Lead real com conversation relacionada neste tenant."
      : "Lead real sem conversation relacionada.",
    pendencies: [
      data.interests.length ? "Interesses reais carregados." : "Ainda sem interesse registrado.",
      data.conversations.length ? "Conversas reais carregadas." : "Ainda sem conversation registrada.",
    ],
    checklist,
    score: Math.round((doneCount / checklist.length) * 100),
    scoreLabel: "Lead Readiness",
    nextAction: "Usar somente dados confirmados antes de qualquer acao.",
    suggestions: data.interests.length
      ? [`Interesses registrados: ${data.interests.length}.`]
      : ["Ainda sem interesses registrados."],
    history: data.conversations.length
      ? data.conversations.map(
          (conversation) =>
            `${emptyLabel(conversation.channel)} - ultima interacao: ${formatDateTime(
              conversation.lastMessageAt ?? conversation.startedAt,
            )}`,
        )
      : ["Ainda sem historico de conversa."],
  };
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--yzi-radius-sm)] border border-dashed border-[color:var(--yzi-border-subtle)] px-4 py-6 text-center text-[0.8rem] text-[var(--yzi-text-faint)]">
      {children}
    </p>
  );
}

function ReadOnlyTextBlock({
  label,
  value,
  span2 = false,
}: {
  label: string;
  value: string | null;
  span2?: boolean;
}) {
  return (
    <div className={cx("flex flex-col gap-1.5", span2 && "sm:col-span-2")}>
      <span className="text-[0.72rem] text-[var(--yzi-text-secondary)]">{label}</span>
      <div className="min-h-[2.75rem] whitespace-pre-wrap rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-bg-deep)] px-3 py-2.5 text-[0.82rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {value?.trim() || "Ainda sem dados"}
      </div>
    </div>
  );
}

function InterestList({ interests }: { interests: readonly YziImobLeadInterest[] }) {
  if (interests.length === 0) {
    return <EmptyState>Ainda sem interesse registrado.</EmptyState>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {interests.map((interest) => (
        <li
          key={`${interest.propertyId}-${interest.source ?? "source"}-${interest.status ?? "status"}`}
          className="flex flex-col gap-1 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3 text-[0.82rem]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[var(--yzi-text-primary)]">
              {interest.propertyTitle ?? interest.propertyId}
            </span>
            <span
              className="rounded-full border px-2.5 py-1 text-[0.66rem]"
              style={{
                borderColor: imobRgba("cyan", 0.32),
                backgroundColor: imobRgba("cyan", 0.1),
                color: imobRgba("cyan", 0.95),
              }}
            >
              Score: {emptyLabel(interest.score)}
            </span>
          </div>
          <span className="text-[0.72rem] text-[var(--yzi-text-secondary)]">
            Status: {emptyLabel(interest.status)} - Origem: {emptyLabel(interest.source)}
          </span>
          <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">
            Imovel: {interest.propertyId}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RelatedProperties({ interests }: { interests: readonly YziImobLeadInterest[] }) {
  const properties = Array.from(
    new Map(interests.map((interest) => [interest.propertyId, interest])).values(),
  );

  if (properties.length === 0) {
    return <EmptyState>Ainda sem imovel relacionado.</EmptyState>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {properties.map((interest) => (
        <li
          key={interest.propertyId}
          className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3 text-[0.82rem]"
        >
          <span className="text-[var(--yzi-text-primary)]">
            {interest.propertyTitle ?? "Ainda sem dados"}
          </span>
          <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">
            {interest.propertyId}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ConversationList({
  conversations,
}: {
  conversations: readonly YziImobLeadConversation[];
}) {
  if (conversations.length === 0) {
    return <EmptyState>Ainda sem conversa relacionada.</EmptyState>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {conversations.map((conversation, index) => (
        <li
          key={`${conversation.leadId}-${conversation.channel ?? "channel"}-${conversation.startedAt ?? index}`}
          className="flex flex-col gap-1 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3 text-[0.82rem]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[var(--yzi-text-primary)]">
              Canal: {emptyLabel(conversation.channel)}
            </span>
            <span
              className="rounded-full border px-2.5 py-1 text-[0.66rem]"
              style={{
                borderColor: imobRgba("lilac", 0.32),
                backgroundColor: imobRgba("lilac", 0.1),
                color: imobRgba("lilac", 0.95),
              }}
            >
              {emptyLabel(conversation.status)}
            </span>
          </div>
          <span className="text-[0.72rem] text-[var(--yzi-text-secondary)]">
            Inicio: {formatDateTime(conversation.startedAt)}
          </span>
          <span className="text-[0.72rem] text-[var(--yzi-text-faint)]">
            Ultima interacao: {formatDateTime(conversation.lastMessageAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function YziImobClientWorkspace({
  data,
  notFoundMessage = "Este lead nao existe neste tenant ou nao pode ser lido.",
}: {
  data: YziImobLeadWorkspaceData | null;
  notFoundMessage?: string;
}) {
  const router = useRouter();
  const { select } = useYziImobWorkspace();
  const [tab, setTab] = useState<string>("perfil");

  useEffect(() => {
    if (data) select(toLeadInspection(data));
  }, [data, select]);

  const counters = useMemo(() => (data ? leadCounters(data) : []), [data]);

  if (!data) {
    return (
      <section className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center gap-3 px-8 py-10 text-center">
        <p className="text-[1.1rem] font-semibold text-[var(--yzi-text-primary)]">
          Cliente nao encontrado.
        </p>
        <p className="text-[0.86rem] text-[var(--yzi-text-secondary)]">
          {notFoundMessage}
        </p>
        <Link
          href="/cockpit/yzi-imob/clientes"
          className="mt-2 text-[0.82rem] text-[rgb(var(--imob-ice))] hover:underline"
        >
          Voltar aos clientes
        </Link>
      </section>
    );
  }

  const role = statusRole(data.lead.status);
  const leadStatusLabel = statusLabel(data.lead.status);

  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 pt-10">
        <EntityHero
          backHref="/cockpit/yzi-imob/clientes"
          backLabel="Clientes"
          kicker="Client Workspace"
          title={data.lead.fullName}
          subtitle={HERO_BY_STATUS[data.lead.status ?? ""] ?? "Lead real carregado neste tenant."}
          statusLabel={leadStatusLabel}
          composerPlaceholder="Pergunte a YZI sobre este lead, interesses e conversas reais..."
          quickActions={[
            { label: "Resumir o lead" },
            { label: "Quais imoveis relacionados?" },
            { label: "Ver ultima interacao" },
          ]}
          onAsk={() => router.push("/cockpit/yzi-imob/briefing")}
        />
        <div className="flex flex-wrap gap-2">
          <div
            className="flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem]"
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
            {leadStatusLabel}
          </div>
          {data.lead.temperature ? (
            <div className="w-fit rounded-full border border-[color:var(--yzi-border-subtle)] px-3 py-1.5 text-[0.72rem] text-[var(--yzi-text-secondary)]">
              Temperatura: {data.lead.temperature}
            </div>
          ) : null}
        </div>
      </section>

      <section className="w-full py-7">
        <CounterStrip counters={counters} />
      </section>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-8 pb-10">
        <WorkspaceTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "perfil" ? (
          <div className="flex flex-col gap-7">
            <WorkspaceSection
              first
              title="Identidade"
              description="Dados reais do lead dentro deste tenant."
            >
              <WorkspaceGrid>
                <WorkspaceField label="Nome" value={data.lead.fullName} readOnly />
                <WorkspaceField label="ID do lead" value={data.lead.id} readOnly />
                <WorkspaceField label="Origem" value={emptyLabel(data.lead.source)} readOnly />
                <WorkspaceField label="Status" value={leadStatusLabel} readOnly />
                <WorkspaceField
                  label="Temperatura"
                  value={emptyLabel(data.lead.temperature)}
                  readOnly
                />
              </WorkspaceGrid>
            </WorkspaceSection>

            <WorkspaceSection title="Contato">
              <WorkspaceGrid>
                <WorkspaceField label="Telefone" value={emptyLabel(data.lead.phone)} readOnly />
                <WorkspaceField label="Email" value={emptyLabel(data.lead.email)} readOnly />
              </WorkspaceGrid>
            </WorkspaceSection>

            <WorkspaceSection title="Notes">
              <WorkspaceGrid>
                <ReadOnlyTextBlock label="Notes" value={data.lead.notes} span2 />
              </WorkspaceGrid>
            </WorkspaceSection>
          </div>
        ) : tab === "interesses" ? (
          <WorkspaceSection
            first
            title="Interesses em imoveis"
            description="Registros reais de yzi_imob_property_interests para este lead."
          >
            <InterestList interests={data.interests} />
          </WorkspaceSection>
        ) : tab === "imoveis" ? (
          <WorkspaceSection
            first
            title="Imoveis relacionados"
            description="Imoveis encontrados a partir dos interesses reais do lead."
          >
            <RelatedProperties interests={data.interests} />
          </WorkspaceSection>
        ) : (
          <WorkspaceSection
            first
            title="Conversas relacionadas"
            description="Conversas reais vinculadas a este lead."
          >
            <ConversationList conversations={data.conversations} />
          </WorkspaceSection>
        )}

        <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
          Dados reais lidos no tenant atual. Campos sem fonte confirmada ficam ocultos ou marcados
          como Ainda sem dados.
        </p>
      </section>
    </div>
  );
}
