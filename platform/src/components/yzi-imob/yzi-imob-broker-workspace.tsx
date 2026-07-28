"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  CounterStrip,
  EntityHero,
  WorkspaceSection,
  WorkspaceTabs,
  type CounterItem,
} from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import type { YziInspection } from "@/components/yzi-imob/yzi-imob-workspace-context";
import type { BrokerWorkspaceData } from "@/lib/yzi-imob/brokers/types";
import {
  INITIAL_OPERATIONAL_ACTION_STATE,
  type OperationalActionState,
} from "@/lib/yzi-imob/operations/action-state";
import type {
  FollowUpTask,
  LeadAssignment,
  LeadOperationalPacket,
  VisitFeedback,
} from "@/lib/yzi-imob/operations/types";

const TABS = [
  { id: "operacao", label: "Operacao" },
  { id: "leads", label: "Leads" },
  { id: "visitas", label: "Visitas" },
  { id: "follow-ups", label: "Follow-up" },
];

const AVAILABILITY_LABEL: Record<string, string> = {
  available: "Disponivel",
  busy: "Ocupado",
  away: "Ausente",
  no_new_leads: "Sem novos leads",
};

const ASSIGNMENT_LABEL: Record<string, string> = {
  assigned: "Aguardando resposta",
  accepted: "Aceita",
  declined: "Recusada",
  expired: "Expirada",
  reassigned: "Reatribuida",
};

const FOLLOW_UP_LABEL: Record<string, string> = {
  lead_stalled: "Retomar lead",
  visit_feedback_due: "Registrar feedback",
  assignment_response_due: "Responder atribuicao",
  next_action_due: "Proxima acao",
  conversation_waiting_reply: "Responder conversa",
};

type AssignmentAction = (
  state: OperationalActionState,
  formData: FormData,
) => Promise<OperationalActionState>;

function formatDateTime(value: string | null): string {
  if (!value) return "Ainda sem dados";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-y border-[color:var(--yzi-border-subtle)] py-6 text-center text-[0.8rem] text-[var(--yzi-text-faint)]">
      {children}
    </p>
  );
}

function StatusMessage({ state }: { state: OperationalActionState }) {
  if (state.status === "idle") return null;
  return (
    <p
      role="status"
      className={
        state.status === "saved"
          ? "text-[0.76rem] text-emerald-300"
          : "text-[0.76rem] text-rose-300"
      }
    >
      {state.message}
    </p>
  );
}

function AssignmentRows({
  assignments,
  brokerUserId,
  canRespond,
  action,
}: {
  assignments: readonly LeadAssignment[];
  brokerUserId: string;
  canRespond: boolean;
  action: AssignmentAction;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_OPERATIONAL_ACTION_STATE,
  );
  if (assignments.length === 0) return <EmptyState>Nenhuma atribuicao registrada.</EmptyState>;

  return (
    <div className="flex flex-col">
      <StatusMessage state={state} />
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="flex flex-wrap items-center gap-3 border-b border-[color:var(--yzi-border-subtle)] py-3 last:border-b-0"
        >
          <div className="min-w-0 flex-1">
            <Link
              href={`/cockpit/yzi-imob/clientes/${assignment.leadId}`}
              className="text-[0.82rem] font-medium text-[var(--yzi-text-primary)] hover:underline"
            >
              {assignment.leadName ?? "Ainda sem dados"}
            </Link>
            <p className="mt-1 text-[0.7rem] text-[var(--yzi-text-faint)]">
              {ASSIGNMENT_LABEL[assignment.status] ?? assignment.status} ·{" "}
              {formatDateTime(assignment.assignedAt)}
            </p>
          </div>
          {assignment.status === "assigned" ? (
            canRespond ? (
              <form action={formAction} className="flex gap-2">
                <input type="hidden" name="assignmentId" value={assignment.id} />
                <input type="hidden" name="brokerUserId" value={brokerUserId} />
                <button
                  type="submit"
                  name="decision"
                  value="accepted"
                  disabled={pending}
                  className="h-8 rounded-[var(--yzi-radius-sm)] border border-emerald-400/30 px-3 text-[0.72rem] text-emerald-300 disabled:opacity-50"
                >
                  Aceitar
                </button>
                <button
                  type="submit"
                  name="decision"
                  value="declined"
                  disabled={pending}
                  className="h-8 rounded-[var(--yzi-radius-sm)] border border-rose-400/30 px-3 text-[0.72rem] text-rose-300 disabled:opacity-50"
                >
                  Recusar
                </button>
              </form>
            ) : (
              <span
                title="Somente o corretor responsavel pode responder"
                className="text-[0.7rem] text-[var(--yzi-text-faint)]"
              >
                Resposta restrita ao corretor
              </span>
            )
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PacketRows({ packets }: { packets: readonly LeadOperationalPacket[] }) {
  if (packets.length === 0) return <EmptyState>Nenhum pacote operacional ativo.</EmptyState>;
  return (
    <div className="flex flex-col">
      {packets.map((packet) => (
        <div
          key={packet.leadId}
          className="grid gap-2 border-b border-[color:var(--yzi-border-subtle)] py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          <div>
            <Link
              href={`/cockpit/yzi-imob/clientes/${packet.leadId}`}
              className="text-[0.82rem] font-medium text-[var(--yzi-text-primary)] hover:underline"
            >
              {packet.leadName ?? "Ainda sem dados"}
            </Link>
            <p className="mt-1 text-[0.7rem] text-[var(--yzi-text-faint)]">
              {packet.leadStatus ?? "Sem status"} · {packet.leadTemperature ?? "Sem temperatura"}
            </p>
          </div>
          <p className="text-[0.74rem] text-[var(--yzi-text-secondary)]">
            Imovel: {packet.propertyTitle ?? "Ainda sem dados"}
          </p>
          <p className="text-[0.7rem] text-[var(--yzi-text-faint)]">
            Proxima visita: {formatDateTime(packet.nextAppointmentStartsAt)}
          </p>
        </div>
      ))}
    </div>
  );
}

function FeedbackRows({ feedback }: { feedback: readonly VisitFeedback[] }) {
  if (feedback.length === 0) return <EmptyState>Nenhum feedback registrado.</EmptyState>;
  return (
    <div className="flex flex-col">
      {feedback.map((item) => (
        <div
          key={item.id}
          className="grid gap-1 border-b border-[color:var(--yzi-border-subtle)] py-3 last:border-b-0 sm:grid-cols-2"
        >
          <p className="text-[0.78rem] text-[var(--yzi-text-primary)]">
            {item.clientAttendance} · {item.outcome}
          </p>
          <p className="text-[0.7rem] text-[var(--yzi-text-faint)] sm:text-right">
            {formatDateTime(item.feedbackAt)}
          </p>
          <p className="text-[0.74rem] text-[var(--yzi-text-secondary)] sm:col-span-2">
            {item.observation ?? "Sem observacao"}
          </p>
          {item.nextAction ? (
            <p className="text-[0.72rem] text-[var(--yzi-text-secondary)] sm:col-span-2">
              Proxima acao: {item.nextAction} · {formatDateTime(item.nextActionAt)}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function FollowUpRows({ tasks }: { tasks: readonly FollowUpTask[] }) {
  if (tasks.length === 0) return <EmptyState>Nenhum follow-up relacionado.</EmptyState>;
  return (
    <div className="flex flex-col">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="grid gap-1 border-b border-[color:var(--yzi-border-subtle)] py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <p className="text-[0.78rem] text-[var(--yzi-text-primary)]">
            {FOLLOW_UP_LABEL[task.kind] ?? task.kind}
          </p>
          <p className="text-[0.7rem] text-[var(--yzi-text-faint)]">{task.status}</p>
          <p className="text-[0.72rem] text-[var(--yzi-text-secondary)]">
            Vencimento: {formatDateTime(task.dueAt)} · Tentativas {task.attemptCount}/
            {task.maxAttempts}
          </p>
          <p className="text-[0.7rem] text-[var(--yzi-text-faint)] sm:text-right">
            Proxima execucao: {formatDateTime(task.scheduledAt)}
          </p>
          {task.lastErrorCode ? (
            <p className="text-[0.7rem] text-rose-300 sm:col-span-2">
              Ultimo erro: {task.lastErrorCode}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function toInspection(data: BrokerWorkspaceData): YziInspection {
  return {
    name: data.broker.name,
    subtitle: `${data.broker.role} · ${data.broker.membershipStatus}`,
    statusLabel:
      AVAILABILITY_LABEL[data.broker.operationalAvailability] ??
      data.broker.operationalAvailability,
    situation: `${data.broker.activeLeadCount} leads ativos e ${data.broker.futureVisitCount} visitas futuras.`,
    pendencies: [
      `${data.broker.pendingAssignmentCount} atribuicoes aguardando resposta.`,
      `${data.broker.missingFeedbackCount} visitas sem feedback.`,
    ],
    checklist: [
      { label: "Membership ativa", done: data.broker.membershipStatus === "active" },
      { label: "Disponivel para novos leads", done: data.broker.operationalAvailability === "available" },
      { label: "Atribuicoes respondidas", done: data.broker.pendingAssignmentCount === 0 },
      { label: "Feedbacks em dia", done: data.broker.missingFeedbackCount === 0 },
    ],
    score: 0,
    scoreLabel: "Sem score operacional",
    nextAction:
      data.broker.pendingAssignmentCount > 0
        ? "Responder as atribuicoes pendentes."
        : data.broker.missingFeedbackCount > 0
          ? "Registrar os feedbacks pendentes."
          : "Abrir o proximo lead atribuido.",
    suggestions: [],
    history: data.assignments.map(
      (assignment) =>
        `${ASSIGNMENT_LABEL[assignment.status] ?? assignment.status}: ${assignment.leadName ?? assignment.leadId}`,
    ),
  };
}

export function YziImobBrokerWorkspace({
  data,
  canRespond,
  action,
  notFoundMessage = "Este corretor nao foi encontrado.",
}: {
  data: BrokerWorkspaceData | null;
  canRespond: boolean;
  action: AssignmentAction;
  notFoundMessage?: string;
}) {
  const router = useRouter();
  const { select } = useYziImobWorkspace();
  const [tab, setTab] = useState("operacao");

  useEffect(() => {
    if (data) select(toInspection(data));
  }, [data, select]);

  const counters = useMemo<CounterItem[]>(
    () =>
      data
        ? [
            { label: "Leads ativos", value: String(data.broker.activeLeadCount), detail: "Assignments ativos reais" },
            { label: "Aguardando resposta", value: String(data.broker.pendingAssignmentCount), detail: "Assignments pendentes" },
            { label: "Visitas futuras", value: String(data.broker.futureVisitCount), detail: "Agenda do tenant" },
            { label: "Feedback pendente", value: String(data.broker.missingFeedbackCount), detail: "Visitas concluidas" },
          ]
        : [],
    [data],
  );

  if (!data) {
    return (
      <section className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center gap-3 px-8 py-10 text-center">
        <p className="text-[1.1rem] font-semibold text-[var(--yzi-text-primary)]">
          Corretor nao encontrado.
        </p>
        <p className="text-[0.86rem] text-[var(--yzi-text-secondary)]">{notFoundMessage}</p>
        <Link href="/cockpit/yzi-imob/corretores" className="text-[0.82rem] text-[rgb(var(--imob-ice))] hover:underline">
          Voltar aos corretores
        </Link>
      </section>
    );
  }

  const pending = data.assignments.filter((assignment) => assignment.status === "assigned");
  const accepted = data.assignments.filter((assignment) => assignment.status === "accepted");

  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 pt-10">
        <EntityHero
          backHref="/cockpit/yzi-imob/corretores"
          backLabel="Corretores"
          kicker="Broker Workspace"
          title={data.broker.name}
          subtitle="Membership real conectada a assignments, visitas, feedbacks e follow-ups."
          statusLabel={
            AVAILABILITY_LABEL[data.broker.operationalAvailability] ??
            data.broker.operationalAvailability
          }
          composerPlaceholder="Pergunte a YZI sobre a operacao deste corretor..."
          quickActions={[{ label: "Abrir proximo lead" }, { label: "Ver pendencias" }]}
          onAsk={() => router.push("/cockpit/yzi-imob/briefing")}
        />
      </section>

      <section className="w-full py-7"><CounterStrip counters={counters} /></section>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-8 pb-10">
        <WorkspaceTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "operacao" ? (
          <div className="flex flex-col gap-7">
            <WorkspaceSection first title="Aguardando resposta" description="Somente o corretor responsavel pode aceitar ou recusar.">
              <AssignmentRows assignments={pending} brokerUserId={data.broker.userId} canRespond={canRespond} action={action} />
            </WorkspaceSection>
            <WorkspaceSection title="Pacote operacional" description="Contexto real dos leads atualmente atribuidos.">
              <PacketRows packets={data.operationalPackets} />
            </WorkspaceSection>
            <WorkspaceSection title="Historico operacional minimo">
              <AssignmentRows assignments={data.assignments} brokerUserId={data.broker.userId} canRespond={false} action={action} />
            </WorkspaceSection>
          </div>
        ) : tab === "leads" ? (
          <WorkspaceSection first title="Leads aceitos" description="Assignments ativos aceitos por este corretor.">
            <AssignmentRows assignments={accepted} brokerUserId={data.broker.userId} canRespond={false} action={action} />
          </WorkspaceSection>
        ) : tab === "visitas" ? (
          <div className="flex flex-col gap-7">
            <WorkspaceSection first title="Visitas futuras">
              {data.futureAppointments.length === 0 ? <EmptyState>Nenhuma visita futura.</EmptyState> : (
                <div className="flex flex-col">
                  {data.futureAppointments.map((appointment) => (
                    <Link key={appointment.id} href="/cockpit/yzi-imob/agenda" className="border-b border-[color:var(--yzi-border-subtle)] py-3 text-[0.8rem] text-[var(--yzi-text-primary)] last:border-b-0 hover:underline">
                      {appointment.title} · {formatDateTime(appointment.startsAt)}
                    </Link>
                  ))}
                </div>
              )}
            </WorkspaceSection>
            <WorkspaceSection title="Sem feedback" description="Visitas concluidas que ainda exigem registro na Agenda.">
              {data.appointmentsMissingFeedback.length === 0 ? <EmptyState>Nenhum feedback pendente.</EmptyState> : (
                <div className="flex flex-col">
                  {data.appointmentsMissingFeedback.map((appointment) => (
                    <Link key={appointment.id} href={`/cockpit/yzi-imob/agenda?appointment=${appointment.id}`} className="border-b border-[color:var(--yzi-border-subtle)] py-3 text-[0.8rem] text-[var(--yzi-text-primary)] last:border-b-0 hover:underline">
                      {appointment.title} · {formatDateTime(appointment.startsAt)}
                    </Link>
                  ))}
                </div>
              )}
            </WorkspaceSection>
            <WorkspaceSection title="Feedback registrado"><FeedbackRows feedback={data.feedback} /></WorkspaceSection>
          </div>
        ) : (
          <WorkspaceSection first title="Follow-up relacionado" description="Tarefas reais, sem payload tecnico ou dados sensiveis.">
            <FollowUpRows tasks={data.followUps} />
          </WorkspaceSection>
        )}
      </section>
    </div>
  );
}
