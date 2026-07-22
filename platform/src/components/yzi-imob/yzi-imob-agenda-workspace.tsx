"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ArrowRightIcon, SearchIcon } from "@/components/yzi-imob/yzi-imob-icons-v2";
import {
  imobRgba,
  type YziImobRole,
} from "@/components/yzi-imob/yzi-imob-status-colors";
import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import {
  type YziImobAppointment,
  type YziImobAppointmentConfirmationStatus,
  type YziImobAppointmentStatus,
} from "@/lib/yzi-imob/agenda/types";

type ViewMode = "mes" | "semana";
type AccessState = "ready" | "no_membership" | "tenant_error" | "read_error";

type CalendarDay = {
  date: Date;
  offset: number;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
};

type CalendarAppointment = YziImobAppointment & {
  dayOffset: number;
  dateLabel: string;
  timeLabel: string;
  endTimeLabel: string | null;
  searchText: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABEL = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"] as const;

const STATUS_LABEL: Record<YziImobAppointmentStatus, string> = {
  scheduled: "Agendado",
  completed: "Concluido",
  cancelled: "Cancelado",
  no_show: "Nao compareceu",
};

const STATUS_ACCENT: Record<YziImobAppointmentStatus, YziImobRole> = {
  scheduled: "cyan",
  completed: "coldGreen",
  cancelled: "wine",
  no_show: "amber",
};

const CONFIRMATION_LABEL: Record<YziImobAppointmentConfirmationStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Recusado",
};

const CONFIRMATION_ACCENT: Record<YziImobAppointmentConfirmationStatus, YziImobRole> = {
  pending: "amber",
  confirmed: "coldGreen",
  declined: "wine",
};

const STATUS_FILTER_OPTIONS: Array<{ value: YziImobAppointmentStatus | "todos"; label: string }> = [
  { value: "todos", label: "Todos os status" },
  { value: "scheduled", label: STATUS_LABEL.scheduled },
  { value: "completed", label: STATUS_LABEL.completed },
  { value: "cancelled", label: STATUS_LABEL.cancelled },
  { value: "no_show", label: STATUS_LABEL.no_show },
];

const CONFIRMATION_FILTER_OPTIONS: Array<{
  value: YziImobAppointmentConfirmationStatus | "todos";
  label: string;
}> = [
  { value: "todos", label: "Todas as confirmacoes" },
  { value: "pending", label: CONFIRMATION_LABEL.pending },
  { value: "confirmed", label: CONFIRMATION_LABEL.confirmed },
  { value: "declined", label: CONFIRMATION_LABEL.declined },
];

const selectClass =
  "h-8 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-2 text-[0.72rem] text-[var(--yzi-text-secondary)] outline-none transition-colors hover:text-[var(--yzi-text-primary)]";

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildCalendarDay(date: Date, currentMonth: number, today: Date): CalendarDay {
  const start = startOfLocalDay(date);
  const todayStart = startOfLocalDay(today);
  const offset = Math.round((start.getTime() - todayStart.getTime()) / DAY_MS);

  return {
    date: start,
    offset,
    dayNumber: start.getDate(),
    inCurrentMonth: start.getMonth() === currentMonth,
    isToday: offset === 0,
  };
}

function buildMonthGrid(monthOffset: number, today = new Date()): CalendarDay[][] {
  const cursor = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const currentMonth = cursor.getMonth();
  const firstGridDay = addDays(cursor, -cursor.getDay());
  const weeks: CalendarDay[][] = [];

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week: CalendarDay[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      week.push(buildCalendarDay(addDays(firstGridDay, weekIndex * 7 + dayIndex), currentMonth, today));
    }
    weeks.push(week);
  }

  return weeks;
}

function buildWeekRow(weekOffset: number, today = new Date()): CalendarDay[] {
  const base = startOfLocalDay(today);
  const weekStart = addDays(base, weekOffset * 7 - base.getDay());
  return Array.from({ length: 7 }, (_, index) => buildCalendarDay(addDays(weekStart, index), base.getMonth(), today));
}

function monthTitle(monthOffset: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthOffset);
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

function weekTitle(weekOffset: number): string {
  const base = startOfLocalDay(new Date());
  const start = addDays(base, weekOffset * 7 - base.getDay());
  const end = addDays(start, 6);
  const formatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function formatDateLabel(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(iso));
}

function formatTimeLabel(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function statusLabel(status: string): string {
  return STATUS_LABEL[status as YziImobAppointmentStatus] ?? status;
}

function statusRole(status: string): YziImobRole {
  return STATUS_ACCENT[status as YziImobAppointmentStatus] ?? "neutral";
}

function confirmationLabel(status: string): string {
  return CONFIRMATION_LABEL[status as YziImobAppointmentConfirmationStatus] ?? status;
}

function confirmationRole(status: string): YziImobRole {
  return CONFIRMATION_ACCENT[status as YziImobAppointmentConfirmationStatus] ?? "neutral";
}

function emptyLabel(value: string | null | undefined): string {
  return value?.trim() || "Ainda sem dados";
}

function mapCalendarAppointment(appointment: YziImobAppointment): CalendarAppointment {
  const start = new Date(appointment.startsAt);
  const todayStart = startOfLocalDay(new Date());
  const dayOffset = Math.round((startOfLocalDay(start).getTime() - todayStart.getTime()) / DAY_MS);
  const timeLabel = formatTimeLabel(appointment.startsAt) ?? "Ainda sem dados";
  const endTimeLabel = formatTimeLabel(appointment.endsAt);

  return {
    ...appointment,
    dayOffset,
    dateLabel: formatDateLabel(appointment.startsAt),
    timeLabel,
    endTimeLabel,
    searchText: [
      appointment.title,
      appointment.leadName ?? "",
      appointment.propertyTitle ?? "",
      appointment.status,
      appointment.confirmationStatus,
      appointment.notes ?? "",
    ]
      .join(" ")
      .toLowerCase(),
  };
}

function AccessMessage({ accessState }: { accessState: AccessState }) {
  const messages: Record<AccessState, { title: string; body: string }> = {
    ready: {
      title: "Nenhum agendamento real neste tenant",
      body: "Quando houver registros em yzi_imob_appointments, eles aparecerao neste calendario.",
    },
    no_membership: {
      title: "Sua operacao ainda nao esta disponivel",
      body: "Nao encontramos uma imobiliaria vinculada a sua conta.",
    },
    tenant_error: {
      title: "Nao foi possivel resolver o tenant",
      body: "Tente novamente em instantes. Se o problema continuar, fale com o administrador.",
    },
    read_error: {
      title: "Nao foi possivel carregar a agenda",
      body: "A consulta real falhou. Nenhum agendamento ficticio foi exibido.",
    },
  };
  const message = messages[accessState];

  return (
    <div className="flex flex-col gap-1 rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-4">
      <p className="text-[0.82rem] font-semibold text-[var(--yzi-text-primary)]">{message.title}</p>
      <p className="text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {message.body}
      </p>
    </div>
  );
}

function EmptyAgendaMessage({ hasAnyAppointments }: { hasAnyAppointments: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-4">
      <p className="text-[0.82rem] font-semibold text-[var(--yzi-text-primary)]">
        {hasAnyAppointments ? "Nenhum agendamento encontrado" : "Nenhum agendamento real neste tenant"}
      </p>
      <p className="text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {hasAnyAppointments
          ? "Ajuste busca ou filtros para ver outros registros reais."
          : "Quando houver registros em yzi_imob_appointments, eles aparecerao neste calendario."}
      </p>
    </div>
  );
}

function EventChip({
  appointment,
  selected,
  compact,
  onSelect,
}: {
  appointment: CalendarAppointment;
  selected: boolean;
  compact: boolean;
  onSelect: () => void;
}) {
  const role = statusRole(appointment.status);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "flex w-full flex-col gap-0.5 rounded-[var(--yzi-radius-sm)] px-2 py-1.5 text-left transition-colors",
        selected ? "bg-[rgba(255,255,255,0.07)]" : "hover:bg-[rgba(255,255,255,0.04)]",
      )}
      style={selected ? { boxShadow: `inset 0 0 0 1px ${imobRgba(role, 0.5)}` } : undefined}
    >
      <span className="flex items-center gap-1.5 text-[0.64rem] leading-none">
        <span
          aria-hidden
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: imobRgba(role, 0.95) }}
        />
        <span className="tabular-nums text-[var(--yzi-text-secondary)]">
          {appointment.timeLabel}
        </span>
        <span style={{ color: imobRgba(role, 0.9) }}>{statusLabel(appointment.status)}</span>
      </span>
      <span className="truncate text-[0.7rem] font-medium leading-snug text-[var(--yzi-text-primary)]">
        {appointment.title}
      </span>
      {!compact && appointment.leadName ? (
        <span className="truncate text-[0.64rem] text-[var(--yzi-text-faint)]">
          {appointment.leadName}
        </span>
      ) : null}
    </button>
  );
}

function DayCell({
  day,
  appointments,
  selectedId,
  onSelect,
  tall,
  maxVisible,
}: {
  day: CalendarDay;
  appointments: CalendarAppointment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  tall: boolean;
  maxVisible: number;
}) {
  const visible = appointments.slice(0, maxVisible);
  const hidden = appointments.length - visible.length;

  return (
    <div
      className={cx(
        "flex min-w-0 flex-col gap-1 border-t border-l border-[color:var(--yzi-border-subtle)] px-1.5 pb-1.5 pt-1.5",
        tall ? "min-h-[380px]" : "min-h-[118px]",
        !day.inCurrentMonth && "opacity-45",
      )}
      style={day.isToday ? { backgroundColor: imobRgba("primary", 0.05) } : undefined}
    >
      <span
        className={cx(
          "ml-auto grid h-6 min-w-6 place-items-center rounded-full px-1 text-[0.7rem] tabular-nums",
          day.isToday ? "font-semibold" : "text-[var(--yzi-text-faint)]",
        )}
        style={
          day.isToday
            ? {
                backgroundColor: imobRgba("primary", 0.18),
                color: imobRgba("primary", 1),
              }
            : undefined
        }
      >
        {day.dayNumber}
      </span>
      {visible.map((appointment) => (
        <EventChip
          key={appointment.id}
          appointment={appointment}
          compact={!tall}
          selected={appointment.id === selectedId}
          onSelect={() => onSelect(appointment.id)}
        />
      ))}
      {hidden > 0 ? (
        <span className="px-2 text-[0.62rem] text-[var(--yzi-text-faint)]">+{hidden} mais</span>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[0.74rem]">
      <span className="shrink-0 text-[var(--yzi-text-faint)]">{label}</span>
      <span className="text-right text-[var(--yzi-text-secondary)]">{value}</span>
    </div>
  );
}

function EventInspector({
  appointment,
  onClose,
}: {
  appointment: CalendarAppointment;
  onClose: () => void;
}) {
  const appointmentRole = statusRole(appointment.status);
  const confirmation = confirmationRole(appointment.confirmationStatus);

  return (
    <div className="flex flex-col gap-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-4 shadow-[var(--yzi-edge-highlight)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[0.64rem] font-medium" style={{ color: imobRgba(appointmentRole, 0.95) }}>
            {appointment.dateLabel} · {appointment.timeLabel}
            {appointment.endTimeLabel ? ` - ${appointment.endTimeLabel}` : ""}
          </span>
          <p className="text-[0.92rem] font-semibold leading-snug text-[var(--yzi-text-primary)]">
            {appointment.title}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes do agendamento"
          className="grid h-6 w-6 shrink-0 place-items-center rounded-[var(--yzi-radius-sm)] text-[var(--yzi-text-faint)] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--yzi-text-primary)]"
        >
          x
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span
          className="w-fit rounded-full border px-2.5 py-1 text-[0.66rem]"
          style={{
            borderColor: imobRgba(appointmentRole, 0.32),
            backgroundColor: imobRgba(appointmentRole, 0.1),
            color: imobRgba(appointmentRole, 0.95),
          }}
        >
          {statusLabel(appointment.status)}
        </span>
        <span
          className="w-fit rounded-full border px-2.5 py-1 text-[0.66rem]"
          style={{
            borderColor: imobRgba(confirmation, 0.32),
            backgroundColor: imobRgba(confirmation, 0.1),
            color: imobRgba(confirmation, 0.95),
          }}
        >
          {confirmationLabel(appointment.confirmationStatus)}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-[color:var(--yzi-border-subtle)] pt-3">
        <DetailRow label="Lead" value={emptyLabel(appointment.leadName)} />
        <DetailRow label="Imovel" value={emptyLabel(appointment.propertyTitle)} />
      </div>

      <div className="flex flex-col gap-1.5 border-t border-[color:var(--yzi-border-subtle)] pt-3">
        <p className="text-[0.64rem] font-medium uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
          Observacao
        </p>
        <p className="text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          {emptyLabel(appointment.notes)}
        </p>
      </div>

      {appointment.leadId || appointment.propertyId ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-[color:var(--yzi-border-subtle)] pt-3">
          {appointment.propertyId ? (
            <Link
              href={`/cockpit/yzi-imob/imoveis/${appointment.propertyId}`}
              className="inline-flex items-center gap-1 text-[0.7rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)]"
            >
              Abrir imovel <ArrowRightIcon className="h-3 w-3" />
            </Link>
          ) : null}
          {appointment.leadId ? (
            <Link
              href={`/cockpit/yzi-imob/clientes/${appointment.leadId}`}
              className="inline-flex items-center gap-1 text-[0.7rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)]"
            >
              Ver lead <ArrowRightIcon className="h-3 w-3" />
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AgendaSummary({
  appointments,
  accessState,
  hasAnyAppointments,
  onSelect,
}: {
  appointments: readonly CalendarAppointment[];
  accessState: AccessState;
  hasAnyAppointments: boolean;
  onSelect: (id: string) => void;
}) {
  if (accessState !== "ready") {
    return <AccessMessage accessState={accessState} />;
  }

  if (appointments.length === 0) {
    return <EmptyAgendaMessage hasAnyAppointments={hasAnyAppointments} />;
  }

  const nextAppointments = appointments
    .filter((appointment) => appointment.dayOffset >= 0)
    .slice(0, 5);
  const visible = nextAppointments.length > 0 ? nextAppointments : appointments.slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--yzi-text-faint)]">
        Proximos
      </p>
      <div className="flex flex-col gap-1">
        {visible.map((appointment) => {
          const role = statusRole(appointment.status);
          return (
            <button
              key={appointment.id}
              type="button"
              onClick={() => onSelect(appointment.id)}
              className="flex items-center gap-2 rounded-[var(--yzi-radius-sm)] px-2 py-1.5 text-left transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: imobRgba(role, 0.9) }}
              />
              <span className="min-w-0 flex-1 truncate text-[0.72rem] text-[var(--yzi-text-primary)]">
                {appointment.title}
              </span>
              <span className="shrink-0 text-[0.64rem] text-[var(--yzi-text-faint)]">
                {appointment.timeLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function YziImobAgendaWorkspace({
  appointments,
  accessState,
}: {
  appointments: readonly YziImobAppointment[];
  accessState: AccessState;
}) {
  const [view, setView] = useState<ViewMode>("mes");
  const [cursor, setCursor] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<YziImobAppointmentStatus | "todos">("todos");
  const [confirmationFilter, setConfirmationFilter] =
    useState<YziImobAppointmentConfirmationStatus | "todos">("todos");

  const calendarAppointments = useMemo(
    () => appointments.map(mapCalendarAppointment),
    [appointments],
  );

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return calendarAppointments
      .filter((appointment) => {
        if (statusFilter !== "todos" && appointment.status !== statusFilter) return false;
        if (confirmationFilter !== "todos" && appointment.confirmationStatus !== confirmationFilter) {
          return false;
        }
        if (!text) return true;
        return appointment.searchText.includes(text);
      })
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [calendarAppointments, query, statusFilter, confirmationFilter]);

  const byOffset = useMemo(() => {
    const map = new Map<number, CalendarAppointment[]>();
    for (const appointment of filtered) {
      const list = map.get(appointment.dayOffset) ?? [];
      list.push(appointment);
      map.set(appointment.dayOffset, list);
    }
    return map;
  }, [filtered]);

  const weeks = useMemo(
    () => (view === "mes" ? buildMonthGrid(cursor) : [buildWeekRow(cursor)]),
    [view, cursor],
  );
  const title = view === "mes" ? monthTitle(cursor) : weekTitle(cursor);
  const selected = selectedId
    ? calendarAppointments.find((appointment) => appointment.id === selectedId) ?? null
    : null;

  function switchView(next: ViewMode) {
    if (next !== view) {
      setView(next);
      setCursor(0);
    }
  }

  return (
    <section className="flex w-full flex-col gap-5 px-6 py-6 md:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[1.2rem] font-semibold tracking-[-0.01em] text-[var(--yzi-text-primary)]">
          Agenda
        </h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setCursor(0);
              setSelectedId(null);
            }}
            className="h-8 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 text-[0.74rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)]"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setCursor((value) => value - 1)}
            aria-label={view === "mes" ? "Mes anterior" : "Semana anterior"}
            className="grid h-8 w-8 place-items-center rounded-[var(--yzi-radius-sm)] text-[var(--yzi-text-faint)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--yzi-text-primary)]"
          >
            <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => setCursor((value) => value + 1)}
            aria-label={view === "mes" ? "Proximo mes" : "Proxima semana"}
            className="grid h-8 w-8 place-items-center rounded-[var(--yzi-radius-sm)] text-[var(--yzi-text-faint)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--yzi-text-primary)]"
          >
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-[0.88rem] font-medium capitalize text-[var(--yzi-text-primary)]">
          {title}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            className="flex items-center gap-0.5 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] p-0.5"
          >
            {(["semana", "mes"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={view === mode}
                onClick={() => switchView(mode)}
                className={cx(
                  "rounded-[calc(var(--yzi-radius-sm)-2px)] px-2.5 py-1 text-[0.72rem] transition-colors",
                  view === mode
                    ? "bg-[var(--yzi-surface-elevated)] text-[var(--yzi-text-primary)]"
                    : "text-[var(--yzi-text-secondary)] hover:text-[var(--yzi-text-primary)]",
                )}
              >
                {mode === "semana" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>

          <div className="flex h-8 items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-2.5">
            <SearchIcon aria-hidden className="h-3.5 w-3.5 shrink-0 text-[var(--yzi-text-faint)]" />
            <label htmlFor="agenda-search" className="sr-only">
              Buscar agendamentos
            </label>
            <input
              id="agenda-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar"
              className="w-28 bg-transparent text-[0.72rem] text-[var(--yzi-text-primary)] outline-none placeholder:text-[var(--yzi-text-faint)]"
            />
          </div>

          <select
            aria-label="Filtrar por status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as YziImobAppointmentStatus | "todos")
            }
            className={selectClass}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por confirmacao"
            value={confirmationFilter}
            onChange={(event) =>
              setConfirmationFilter(
                event.target.value as YziImobAppointmentConfirmationStatus | "todos",
              )
            }
            className={selectClass}
          >
            {CONFIRMATION_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1 overflow-hidden rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] shadow-[var(--yzi-edge-highlight)]">
          <div className="grid grid-cols-7">
            {WEEKDAY_LABEL.map((weekday) => (
              <span
                key={weekday}
                className="border-l border-[color:var(--yzi-border-subtle)] px-2 py-2 text-center text-[0.62rem] font-medium uppercase tracking-[0.14em] text-[var(--yzi-text-faint)] first:border-l-0"
              >
                {weekday}
              </span>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 [&>*:first-child]:border-l-0">
              {week.map((day) => (
                <DayCell
                  key={day.offset}
                  day={day}
                  appointments={byOffset.get(day.offset) ?? []}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  tall={view === "semana"}
                  maxVisible={view === "semana" ? 8 : 3}
                />
              ))}
            </div>
          ))}
        </div>

        <aside className="hidden w-[300px] shrink-0 flex-col gap-4 lg:flex">
          {selected ? (
            <EventInspector appointment={selected} onClose={() => setSelectedId(null)} />
          ) : (
            <AgendaSummary
              appointments={filtered}
              accessState={accessState}
              hasAnyAppointments={calendarAppointments.length > 0}
              onSelect={setSelectedId}
            />
          )}
        </aside>
      </div>

      {selected ? (
        <div className="lg:hidden">
          <EventInspector appointment={selected} onClose={() => setSelectedId(null)} />
        </div>
      ) : (
        <div className="lg:hidden">
          <AgendaSummary
            appointments={filtered}
            accessState={accessState}
            hasAnyAppointments={calendarAppointments.length > 0}
            onSelect={setSelectedId}
          />
        </div>
      )}

      <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Dados reais do tenant. Confirmacao externa, recorrencia, notificacoes e integracoes nao
        foram adicionadas nesta foundation.
      </p>
    </section>
  );
}
