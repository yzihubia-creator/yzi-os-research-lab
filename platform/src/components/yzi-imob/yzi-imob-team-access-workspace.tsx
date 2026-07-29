"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type {
  TeamAccessViewModel,
  TeamInvitation,
  TeamMember,
} from "@/lib/tenant/team-access";
import {
  createTeamInvitationAction,
  revokeTeamInvitationAction,
  updateTeamMemberAvailabilityAction,
  updateTeamMemberRoleAction,
  updateTeamMemberStatusAction,
} from "@/app/cockpit/yzi-imob/equipe/actions";
import { INITIAL_TEAM_ACCESS_ACTION_STATE } from "@/app/cockpit/yzi-imob/equipe/action-state";
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
import { YziPresence } from "@/components/yzi-os/yzi-primitives";

// Equipe e Acessos v1 — camada de GOVERNANÇA da operação: pessoas, vínculo,
// acesso e disponibilidade. Não é catálogo de corretores (isso é a rota
// Corretores) nem RH. Tudo o que aparece deriva de dado real legível sob RLS
// hoje: a própria membership, o responsável pela implantação e os convites.
// A listagem completa de membros, o convite real e a disponibilidade ainda
// não têm backend — a superfície declara isso e o contrato vai para o Codex.

/* ------------------------------------------------------------------ */
/* Tradução de papéis e status — linguagem de produto                  */
/* ------------------------------------------------------------------ */

// Papéis reais do CHECK de tenant_memberships.role (ver role-boundary.ts).
const ROLE_LABELS: Record<string, string> = {
  owner: "Responsável principal",
  admin: "Gestão",
  operator: "Operação",
  viewer: "Somente acompanhamento",
};

function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? "Vínculo registrado";
}

const INVITE_ROLE_LABELS: Record<string, string> = {
  corretor: "Corretor",
  gestor: "Gestão",
  atendimento: "Atendimento",
};

const ACCESS_ROLE_OPTIONS = [
  { value: "owner", label: "Responsável principal" },
  { value: "admin", label: "Gestão" },
  { value: "operator", label: "Operação" },
  { value: "viewer", label: "Somente acompanhamento" },
];

const PROFESSIONAL_ROLE_OPTIONS = [
  { value: "", label: "Função profissional" },
  { value: "corretor", label: "Corretor" },
  { value: "gestor", label: "Gestão" },
  { value: "atendimento", label: "Atendimento" },
];

// Status reais do CHECK de tenant_team_invitations.status — não existe
// "expired" no schema, então ele não aparece aqui.
const INVITE_STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando entrada",
  sent: "Convite enviado",
  accepted: "Entrada concluída",
  revoked: "Convite cancelado",
};

function inviteStatusLabel(status: string): string {
  return INVITE_STATUS_LABELS[status] ?? status;
}

const MEMBER_STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  suspended: "Suspenso",
  revoked: "Revogado",
};

function memberStatusLabel(status: string): string {
  return MEMBER_STATUS_LABELS[status] ?? status;
}

function isOpenInvite(invite: TeamInvitation): boolean {
  return invite.status === "pending" || invite.status === "sent";
}

function daysSince(iso: string): number {
  const elapsed = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(elapsed / 86_400_000));
}

function waitingLabel(invite: TeamInvitation): string {
  const days = daysSince(invite.createdAt);
  if (days === 0) return "aguardando desde hoje";
  if (days === 1) return "aguardando há 1 dia";
  return `aguardando há ${days} dias`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

/* ------------------------------------------------------------------ */
/* Atenção — só derivações de dado real                                */
/* ------------------------------------------------------------------ */

type AttentionItem = { id: string; text: string; tab: TabId };

function deriveAttention(team: TeamAccessViewModel): AttentionItem[] {
  const items: AttentionItem[] = [];
  for (const invite of team.invitations) {
    if (!isOpenInvite(invite)) continue;
    const days = daysSince(invite.createdAt);
    if (days >= 7) {
      items.push({
        id: `${invite.id}-wait`,
        text: `${invite.name} está ${waitingLabel(invite)} — vale confirmar o convite por outro canal.`,
        tab: "convites",
      });
    }
    if (!invite.email && !invite.whatsapp) {
      items.push({
        id: `${invite.id}-contact`,
        text: `${invite.name} não tem e-mail nem WhatsApp registrados — sem contato, o convite não avança.`,
        tab: "convites",
      });
    }
    if (!invite.roleIntent) {
      items.push({
        id: `${invite.id}-role`,
        text: `${invite.name} ainda não tem função definida na operação.`,
        tab: "convites",
      });
    }
  }
  return items;
}

/* ------------------------------------------------------------------ */
/* Blocos utilitários                                                  */
/* ------------------------------------------------------------------ */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
        {label}
      </span>
      <span className="text-[0.82rem] text-[var(--yzi-text-primary)]">
        {value || "—"}
      </span>
    </div>
  );
}

function HonestNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-4 py-3.5 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
      {children}
    </p>
  );
}

function StatusChip({
  tone,
  children,
}: {
  tone: "green" | "amber" | "neutral";
  children: ReactNode;
}) {
  if (tone === "neutral") {
    return (
      <span className="rounded-full border border-[color:var(--yzi-border-subtle)] px-2.5 py-1 text-[0.66rem] text-[var(--yzi-text-secondary)]">
        {children}
      </span>
    );
  }
  const key = tone === "green" ? "coldGreen" : "amber";
  return (
    <span
      className="rounded-full border px-2.5 py-1 text-[0.66rem]"
      style={{
        borderColor: imobRgba(key, 0.32),
        backgroundColor: imobRgba(key, 0.1),
        color: imobRgba(key, 0.95),
      }}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Workspace                                                           */
/* ------------------------------------------------------------------ */

type TabId = "visao-geral" | "pessoas" | "convites" | "funcoes";

const TABS: WorkspaceTab[] = [
  { id: "visao-geral", label: "Visão geral" },
  { id: "pessoas", label: "Pessoas" },
  { id: "convites", label: "Convites" },
  { id: "funcoes", label: "Funções e acessos" },
];

export function YziImobTeamAccessWorkspace({
  team,
}: {
  team: TeamAccessViewModel;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("visao-geral");
  const [assistantNote, setAssistantNote] = useState<string | null>(null);

  const attention = useMemo(() => deriveAttention(team), [team]);
  const openInvites = team.invitations.filter(isOpenInvite);

  const counters: CounterItem[] = [
    {
      label: "Pessoas na operação",
      value: String(team.members.length),
      detail: team.canManageTeam
        ? "membros visíveis pela listagem governada."
        : "vínculo visível para o seu papel atual.",
    },
    {
      label: "Corretores ativos",
      value: "—",
      detail: "O cadastro de corretores ainda não está conectado à operação.",
    },
    {
      label: "Convites pendentes",
      value: team.canSeeInvitations ? String(openInvites.length) : "—",
      detail: team.canSeeInvitations
        ? openInvites.length === 1
          ? "pessoa aguardando entrada."
          : "pessoas aguardando entrada."
        : "visível apenas para quem administra a operação.",
      accent: team.canSeeInvitations && openInvites.length > 0,
    },
    {
      label: "Precisam de ação",
      value: team.canSeeInvitations ? String(attention.length) : "—",
      detail: team.canSeeInvitations
        ? attention.length === 0
          ? "nenhuma pendência derivada dos dados atuais."
          : "pendências derivadas dos convites."
        : "depende da visibilidade de convites.",
      accent: team.canSeeInvitations && attention.length > 0,
    },
  ];

  function answer(text: string) {
    const normalized = text.trim().toLowerCase();
    if (!normalized) return;
    if (normalized.includes("convite")) {
      setActiveTab("convites");
      setAssistantNote("Abri a aba Convites — quem ainda não entrou aparece aqui.");
      return;
    }
    if (normalized.includes("acesso")) {
      setActiveTab("funcoes");
      setAssistantNote(
        "Abri Funções e acessos — o que cada papel pode ver e alterar hoje.",
      );
      return;
    }
    if (normalized.includes("agir") || normalized.includes("ação")) {
      setAssistantNote(
        attention.length === 0
          ? "Ninguém precisa de ação agora — nada pendente nos dados atuais."
          : `Precisam de ação: ${attention.map((item) => item.text).join(" ")}`,
      );
      return;
    }
    if (normalized.includes("adicionar")) {
      setActiveTab("convites");
      setAssistantNote("Abri Convites — quem administra a operação já pode registrar uma nova pessoa por aqui.");
      return;
    }
    setAssistantNote(
      "Ainda não converso livremente nesta tela. Use as ações rápidas ou as abas para revisar equipe, convites e acessos.",
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-8 py-10">
      <EntityHero
        backHref="/cockpit/yzi-imob"
        backLabel="Início"
        kicker="Equipe"
        title="Equipe e acessos"
        subtitle="Acompanhe quem participa da operação, quais responsabilidades cada pessoa possui e onde existem pendências."
        statusLabel={
          team.canSeeInvitations && openInvites.length > 0
            ? `${openInvites.length} aguardando entrada`
            : "Governança da operação"
        }
        composerPlaceholder="Pergunte sobre a sua equipe e os acessos"
        quickActions={[
          { label: "Ver convites pendentes" },
          { label: "Revisar acessos" },
          { label: "Quem precisa agir?" },
          { label: "Adicionar pessoa" },
        ]}
        assistantMessage={
          assistantNote ??
          "Eu uso as funções, permissões e disponibilidade da equipe para encaminhar oportunidades e indicar quem precisa agir."
        }
        onAsk={answer}
      />

      <CounterStrip counters={counters} />

      <div className="flex flex-col gap-7">
        <WorkspaceTabs
          tabs={TABS}
          active={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />

        {activeTab === "visao-geral" ? (
          <OverviewTab
            team={team}
            attention={attention}
            openInvites={openInvites}
            onGoTo={setActiveTab}
          />
        ) : null}
        {activeTab === "pessoas" ? <PeopleTab team={team} /> : null}
        {activeTab === "convites" ? <InvitesTab team={team} /> : null}
        {activeTab === "funcoes" ? <RolesTab team={team} /> : null}
      </div>

      <div className="flex items-start gap-2.5 text-[0.72rem] leading-relaxed text-[var(--yzi-text-faint)]">
        <YziPresence state="ready" />
        <p className="max-w-3xl">
          Equipe cuida do vínculo, do acesso e da disponibilidade das pessoas.
          O trabalho do corretor — carteira, leads, visitas e desempenho —
          continua em Corretores.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Visão geral                                                         */
/* ------------------------------------------------------------------ */

function OverviewTab({
  team,
  attention,
  openInvites,
  onGoTo,
}: {
  team: TeamAccessViewModel;
  attention: AttentionItem[];
  openInvites: TeamInvitation[];
  onGoTo: (tab: TabId) => void;
}) {
  return (
    <div className="flex flex-col gap-7">
      <WorkspaceSection
        first
        title="Sua participação"
        description="Como o seu acesso está registrado nesta operação."
      >
        <div className="grid grid-cols-1 gap-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-4 shadow-[var(--yzi-edge-highlight)] sm:grid-cols-3">
          <InfoRow label="Função" value={roleLabel(team.self.role)} />
          <InfoRow
            label="Situação"
            value={team.self.status === "active" ? "Ativa" : team.self.status}
          />
          <InfoRow label="Na operação desde" value={formatDate(team.self.since)} />
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        title="Composição da equipe"
        description="Quem responde pela operação e quem está a caminho."
      >
        <div className="flex flex-col gap-3">
          {team.owner?.name ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-4 py-3">
              <div className="flex min-w-0 flex-col">
                <span className="text-[0.82rem] font-medium text-[var(--yzi-text-primary)]">
                  {team.owner.name}
                </span>
                <span className="text-[0.7rem] text-[var(--yzi-text-faint)]">
                  Responsável pela implantação
                  {team.owner.roleTitle ? ` · ${team.owner.roleTitle}` : ""}
                </span>
              </div>
              <StatusChip tone="green">Ativo</StatusChip>
            </div>
          ) : null}
          {team.canSeeInvitations && openInvites.length > 0 ? (
            <button
              type="button"
              onClick={() => onGoTo("convites")}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-4 py-3 text-left transition-colors hover:border-[color:rgba(var(--imob-ice),0.3)]"
            >
              <span className="text-[0.8rem] text-[var(--yzi-text-primary)]">
                {openInvites.length === 1
                  ? "1 pessoa aguardando entrada na operação"
                  : `${openInvites.length} pessoas aguardando entrada na operação`}
              </span>
              <StatusChip tone="amber">Ver convites</StatusChip>
            </button>
          ) : null}
          <HonestNote>
            A lista de pessoas vem da RPC governada de equipe. Quem administra
            vê todos os vínculos do tenant; operação e acompanhamento veem
            apenas o próprio vínculo.
          </HonestNote>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        title="Ações recomendadas"
        description="Derivadas apenas dos dados reais disponíveis."
      >
        {!team.canSeeInvitations ? (
          <HonestNote>
            As pendências da equipe dependem dos convites, visíveis apenas para
            quem administra a operação.
          </HonestNote>
        ) : attention.length === 0 ? (
          <HonestNote>
            Nenhuma pendência derivada dos dados atuais. Quando um convite
            demorar ou faltar contato ou função, o alerta aparece aqui.
          </HonestNote>
        ) : (
          <ul className="flex flex-col gap-2">
            {attention.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onGoTo(item.tab)}
                  className="flex w-full items-start gap-2.5 rounded-[var(--yzi-radius-md)] border px-4 py-3 text-left transition-colors hover:border-[color:rgba(var(--imob-ice),0.3)]"
                  style={{ borderColor: imobRgba("amber", 0.3) }}
                >
                  <span
                    aria-hidden
                    className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: imobRgba("amber", 0.9) }}
                  />
                  <span className="text-[0.8rem] leading-relaxed text-[var(--yzi-text-primary)]">
                    {item.text}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </WorkspaceSection>

      <WorkspaceSection
        title="Corretores"
        description="O trabalho operacional do corretor continua na área própria."
      >
        <Link
          href="/cockpit/yzi-imob/corretores"
          className="w-fit rounded-full border border-[color:rgba(var(--imob-ice),0.35)] bg-[color:rgba(var(--imob-ice),0.1)] px-3.5 py-1.5 text-[0.78rem] font-medium text-[rgb(var(--imob-ice))] transition-colors hover:bg-[color:rgba(var(--imob-ice),0.16)]"
        >
          Abrir Corretores
        </Link>
      </WorkspaceSection>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pessoas                                                             */
/* ------------------------------------------------------------------ */

function PersonRow({
  name,
  detail,
  chip,
  selected,
  onSelect,
}: {
  name: string;
  detail: string;
  chip: ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-expanded={selected}
      className={cx(
        "flex w-full flex-wrap items-center justify-between gap-3 rounded-[var(--yzi-radius-md)] border px-4 py-3 text-left transition-colors",
        selected
          ? "border-[color:rgba(var(--imob-ice),0.4)] bg-[rgba(var(--imob-cold),0.08)]"
          : "border-[color:var(--yzi-border-subtle)] hover:border-[color:rgba(var(--imob-ice),0.3)]",
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] text-[0.72rem] font-semibold text-[var(--yzi-text-secondary)]"
        >
          {initials(name)}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[0.84rem] font-medium text-[var(--yzi-text-primary)]">
            {name}
          </span>
          <span className="truncate text-[0.7rem] text-[var(--yzi-text-faint)]">
            {detail}
          </span>
        </span>
      </span>
      {chip}
    </button>
  );
}

const AVAILABILITY_STATES = [
  { value: "available", label: "Disponível" },
  { value: "busy", label: "Ocupado" },
  { value: "away", label: "Ausente" },
  { value: "no_new_leads", label: "Não receber novos leads" },
];

function availabilityLabel(value: string): string {
  return AVAILABILITY_STATES.find((state) => state.value === value)?.label ?? value;
}

function PersonPanel({
  member,
  canManageTeam,
}: {
  member: TeamMember;
  canManageTeam: boolean;
}) {
  const [roleState, roleAction, rolePending] = useActionState(
    updateTeamMemberRoleAction,
    INITIAL_TEAM_ACCESS_ACTION_STATE,
  );
  const [statusState, statusAction, statusPending] = useActionState(
    updateTeamMemberStatusAction,
    INITIAL_TEAM_ACCESS_ACTION_STATE,
  );
  const [availabilityState, availabilityAction, availabilityPending] = useActionState(
    updateTeamMemberAvailabilityAction,
    INITIAL_TEAM_ACCESS_ACTION_STATE,
  );

  const canChangeAvailability = member.isSelf || canManageTeam;

  return (
    <div className="flex flex-col gap-5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-5 shadow-[var(--yzi-edge-highlight)]">
      <h3 className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
        {member.isSelf ? "Seu vínculo" : member.name}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoRow label="Função" value={roleLabel(member.role)} />
        <InfoRow label="Situação" value={memberStatusLabel(member.status)} />
        <InfoRow label="Disponibilidade" value={availabilityLabel(member.operationalAvailability)} />
        <InfoRow label="Cargo declarado" value={member.jobTitle} />
        <InfoRow label="WhatsApp" value={member.phone} />
        <InfoRow label="Na operação desde" value={formatDate(member.since)} />
      </div>
      <p className="text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {member.status === "active"
          ? "Vínculo ativo nesta operação. Regiões, especialidades e tipos de imóveis são perfil operacional, não métrica de desempenho."
          : "Vínculo preservado no histórico, mas sem acesso ativo agora."}
      </p>
      <div className="flex flex-col gap-1.5">
        <span className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
          Acesso hoje
        </span>
        <ul className="flex flex-col gap-1">
          {accessLines(member.role).map((line) => (
            <li key={line} className="text-[0.78rem] text-[var(--yzi-text-primary)]">
              {line}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
          Disponibilidade operacional
        </span>
        <form action={availabilityAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="memberId" value={member.id} />
          <select
            name="availability"
            defaultValue={member.operationalAvailability}
            disabled={!canChangeAvailability || availabilityPending}
            className="rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-1.5 text-[0.72rem] text-[var(--yzi-text-primary)] disabled:cursor-not-allowed disabled:text-[var(--yzi-text-faint)]"
          >
            {AVAILABILITY_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!canChangeAvailability || availabilityPending}
            className="rounded-full border border-[color:rgba(var(--imob-ice),0.35)] px-3 py-1.5 text-[0.72rem] text-[rgb(var(--imob-ice))] disabled:cursor-not-allowed disabled:border-[color:var(--yzi-border-subtle)] disabled:text-[var(--yzi-text-faint)]"
          >
            Salvar disponibilidade
          </button>
        </form>
        {availabilityState.status !== "idle" ? (
          <p className="text-[0.68rem] text-[var(--yzi-text-faint)]">{availabilityState.message}</p>
        ) : null}
        <p className="text-[0.68rem] text-[var(--yzi-text-faint)]">
          Esta disponibilidade será usada futuramente na distribuição de leads;
          nenhuma distribuição automática foi implementada nesta unidade.
        </p>
      </div>

      {canManageTeam ? (
        <div className="grid grid-cols-1 gap-3 border-t border-[color:var(--yzi-border-subtle)] pt-4 sm:grid-cols-2">
          <form action={roleAction} className="flex flex-col gap-2">
            <span className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
              Alterar função
            </span>
            <input type="hidden" name="memberId" value={member.id} />
            <div className="flex flex-wrap gap-2">
              <select
                name="role"
                defaultValue={member.role}
                disabled={rolePending}
                className="rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-1.5 text-[0.72rem] text-[var(--yzi-text-primary)]"
              >
                {ACCESS_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={rolePending}
                className="rounded-full border border-[color:rgba(var(--imob-ice),0.35)] px-3 py-1.5 text-[0.72rem] text-[rgb(var(--imob-ice))]"
              >
                Salvar função
              </button>
            </div>
            {roleState.status !== "idle" ? (
              <p className="text-[0.68rem] text-[var(--yzi-text-faint)]">{roleState.message}</p>
            ) : null}
          </form>

          <form action={statusAction} className="flex flex-col gap-2">
            <span className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
              Suspensão de acesso
            </span>
            <input type="hidden" name="memberId" value={member.id} />
            <input
              type="hidden"
              name="status"
              value={member.status === "active" ? "suspended" : "active"}
            />
            <button
              type="submit"
              disabled={statusPending}
              className="w-fit rounded-full border border-[color:var(--yzi-border-subtle)] px-3 py-1.5 text-[0.72rem] text-[var(--yzi-text-secondary)]"
            >
              {member.status === "active" ? "Suspender acesso" : "Reativar acesso"}
            </button>
            {statusState.status !== "idle" ? (
              <p className="text-[0.68rem] text-[var(--yzi-text-faint)]">{statusState.message}</p>
            ) : null}
          </form>
        </div>
      ) : null}

      {member.regions.length > 0 || member.specialties.length > 0 || member.propertyTypes.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Regiões", values: member.regions },
            { label: "Especialidades", values: member.specialties },
            { label: "Tipos de imóvel", values: member.propertyTypes },
          ].map((group) => (
            <InfoRow key={group.label} label={group.label} value={group.values.join(", ")} />
          ))}
        </div>
      ) : null}
      <p className="text-[0.68rem] text-[var(--yzi-text-faint)]">
        Imóveis vinculados, leads, visitas e propostas desta pessoa aparecem
        aqui quando essas fontes estiverem conectadas — nenhum indicador é
        inventado.
      </p>
    </div>
  );
}

function PeopleTab({ team }: { team: TeamAccessViewModel }) {
  const initialSelected = team.members.find((member) => member.isSelf)?.id ?? null;
  const [selected, setSelected] = useState<string | null>(initialSelected);

  return (
    <div className="flex flex-col gap-7">
      <WorkspaceSection
        first
        title="Pessoas visíveis hoje"
        description="Listagem governada pelo papel: gestão vê a equipe do tenant; operação e acompanhamento veem o próprio vínculo."
      >
        <div className="flex flex-col gap-2">
          {team.members.map((member) => (
            <div key={member.id} className="flex flex-col gap-2">
              <PersonRow
                name={member.isSelf ? `${member.name} (você)` : member.name}
                detail={`${roleLabel(member.role)} · ${availabilityLabel(member.operationalAvailability)} · desde ${formatDate(member.since)}`}
                chip={
                  <StatusChip tone={member.status === "active" ? "green" : "neutral"}>
                    {memberStatusLabel(member.status)}
                  </StatusChip>
                }
                selected={selected === member.id}
                onSelect={() => setSelected(selected === member.id ? null : member.id)}
              />
              {selected === member.id ? (
                <PersonPanel member={member} canManageTeam={team.canManageTeam} />
              ) : null}
            </div>
          ))}
        </div>
        <HonestNote>
          {team.canManageTeam
            ? "Esta lista vem do backend real de equipe. Ela não inclui carteira, desempenho, comissão ou métricas de corretor."
            : "Seu papel permite ver seu próprio vínculo. Convites e demais pessoas são visíveis para quem administra a operação."}
        </HonestNote>
      </WorkspaceSection>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Convites                                                            */
/* ------------------------------------------------------------------ */

function InvitesTab({ team }: { team: TeamAccessViewModel }) {
  const [createState, createAction, createPending] = useActionState(
    createTeamInvitationAction,
    INITIAL_TEAM_ACCESS_ACTION_STATE,
  );
  const [revokeState, revokeAction, revokePending] = useActionState(
    revokeTeamInvitationAction,
    INITIAL_TEAM_ACCESS_ACTION_STATE,
  );

  if (!team.canSeeInvitations) {
    return (
      <WorkspaceSection
        first
        title="Convites"
        description="Quem foi chamado para a operação e ainda não entrou."
      >
        <HonestNote>
          Os convites são visíveis apenas para quem administra a operação.
        </HonestNote>
      </WorkspaceSection>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <WorkspaceSection
        first
        title="Convites da operação"
        description="Convites registrados no backend. Criar e cancelar já persistem; envio de e-mail ainda depende de provedor."
      >
        {team.invitations.length === 0 ? (
          <HonestNote>
            Nenhum convite registrado. Cadastre uma nova pessoa abaixo; nenhum
            e-mail será enviado enquanto não houver provedor conectado.
          </HonestNote>
        ) : (
          <ul className="flex flex-col gap-2">
            {team.invitations.map((invite) => {
              const open = isOpenInvite(invite);
              return (
                <li
                  key={invite.id}
                  className="flex flex-col gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-4 py-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] text-[0.72rem] font-semibold text-[var(--yzi-text-secondary)]"
                      >
                        {initials(invite.name)}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-[0.84rem] font-medium text-[var(--yzi-text-primary)]">
                          {invite.name}
                          {invite.roleIntent ? (
                            <span className="ml-2 text-[0.7rem] font-normal text-[var(--yzi-text-secondary)]">
                              {INVITE_ROLE_LABELS[invite.roleIntent] ?? invite.roleIntent}
                            </span>
                          ) : null}
                        </span>
                        <span className="truncate text-[0.7rem] text-[var(--yzi-text-faint)]">
                          {[invite.email, invite.whatsapp]
                            .filter(Boolean)
                            .join(" · ") || "Sem contato registrado"}
                        </span>
                      </div>
                    </div>
                    <StatusChip
                      tone={
                        invite.status === "accepted"
                          ? "green"
                          : open
                            ? "amber"
                            : "neutral"
                      }
                    >
                      {inviteStatusLabel(invite.status)}
                    </StatusChip>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.7rem] text-[var(--yzi-text-faint)]">
                    <span>Criado em {formatDate(invite.createdAt)}</span>
                    {open ? <span>{waitingLabel(invite)}</span> : null}
                    <span>Acesso: {roleLabel(invite.membershipRole)}</span>
                    <span>
                      Convidado por {invite.invitedByMe ? "você" : "quem administra a operação"}
                    </span>
                  </div>
                  {open ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled
                        title="Sem provedor de e-mail conectado; nenhum e-mail será enviado."
                        className="cursor-not-allowed rounded-full border border-[color:var(--yzi-border-subtle)] px-3.5 py-1.5 text-[0.72rem] text-[var(--yzi-text-faint)] opacity-60"
                      >
                        Reenviar convite
                      </button>
                      <form action={revokeAction}>
                        <input type="hidden" name="invitationId" value={invite.id} />
                        <button
                          type="submit"
                          disabled={revokePending}
                          className="rounded-full border border-[color:var(--yzi-border-subtle)] px-3.5 py-1.5 text-[0.72rem] text-[var(--yzi-text-secondary)]"
                        >
                          Cancelar convite
                        </button>
                      </form>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        {revokeState.status !== "idle" ? (
          <p className="text-[0.7rem] text-[var(--yzi-text-faint)]">{revokeState.message}</p>
        ) : null}

        <form
          action={createAction}
          className="grid grid-cols-1 gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-4 sm:grid-cols-2"
        >
          <input
            name="name"
            required
            placeholder="Nome"
            className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-transparent px-3 py-2 text-[0.78rem] text-[var(--yzi-text-primary)]"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="email@empresa.com"
            className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-transparent px-3 py-2 text-[0.78rem] text-[var(--yzi-text-primary)]"
          />
          <input
            name="whatsapp"
            placeholder="WhatsApp (opcional)"
            className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-transparent px-3 py-2 text-[0.78rem] text-[var(--yzi-text-primary)]"
          />
          <select
            name="roleIntent"
            defaultValue=""
            className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2 text-[0.78rem] text-[var(--yzi-text-primary)]"
          >
            {PROFESSIONAL_ROLE_OPTIONS.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            name="membershipRole"
            defaultValue="operator"
            className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2 text-[0.78rem] text-[var(--yzi-text-primary)]"
          >
            {ACCESS_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Acesso: {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={createPending}
            className="w-fit rounded-full border border-[color:rgba(var(--imob-ice),0.35)] bg-[color:rgba(var(--imob-ice),0.1)] px-3.5 py-1.5 text-[0.78rem] font-medium text-[rgb(var(--imob-ice))]"
          >
            Convidar nova pessoa
          </button>
        </form>
        {createState.status !== "idle" ? (
          <p className="text-[0.7rem] text-[var(--yzi-text-faint)]">{createState.message}</p>
        ) : null}
        <p className="text-[0.7rem] text-[var(--yzi-text-faint)]">
          Criar e cancelar alteram o backend real. Reenvio permanece desabilitado
          porque não há provedor de e-mail nem token de renovação nesta unidade.
        </p>
      </WorkspaceSection>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Funções e acessos                                                   */
/* ------------------------------------------------------------------ */

// Descrições limitadas ao contrato real: owner/admin administram equipe por
// RPCs governadas; operator/viewer não alteram equipe, exceto a própria
// disponibilidade operacional.
function accessLines(role: string): string[] {
  if (role === "owner" || role === "admin") {
    return [
      "Acompanha as áreas da operação.",
      "Altera as configurações da operação (mesmo estado da implantação).",
      "Lista membros, mantém convites, funções, status e disponibilidade.",
    ];
  }
  if (role === "operator") {
    return [
      "Acompanha as áreas liberadas da operação.",
      "Pode atualizar a própria disponibilidade operacional.",
      "Não altera configurações estruturais, convites ou funções.",
    ];
  }
  if (role === "viewer") {
    return [
      "Visualiza as informações autorizadas.",
      "Pode atualizar a própria disponibilidade operacional.",
      "Não altera a operação nem administra equipe.",
    ];
  }
  return ["Vínculo registrado — o detalhamento deste papel ainda não está disponível."];
}

function RolesTab({ team }: { team: TeamAccessViewModel }) {
  const roles: Array<{ id: string; heldByYou: boolean }> = [
    { id: "owner", heldByYou: team.self.role === "owner" },
    { id: "admin", heldByYou: team.self.role === "admin" },
    { id: "operator", heldByYou: team.self.role === "operator" },
    { id: "viewer", heldByYou: team.self.role === "viewer" },
  ];

  return (
    <div className="flex flex-col gap-7">
      <WorkspaceSection
        first
        title="O que cada função pode fazer hoje"
        description="Descrições fiéis ao contrato atual — conforme novas capacidades forem conectadas, elas passam a valer por função."
      >
        <div className="flex flex-col gap-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex flex-col gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-5 py-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[0.86rem] font-semibold text-[var(--yzi-text-primary)]">
                  {roleLabel(role.id)}
                </h3>
                {role.heldByYou ? <StatusChip tone="green">Sua função</StatusChip> : null}
              </div>
              <ul className="flex flex-col gap-1">
                {accessLines(role.id).map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]"
                  >
                    <span
                      aria-hidden
                      className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[var(--yzi-text-faint)]"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <HonestNote>
          Alterar função, suspender acesso e disponibilidade já usam RPCs
          governadas. O reenvio de e-mail continua pendente de provedor real.
        </HonestNote>
      </WorkspaceSection>
    </div>
  );
}
