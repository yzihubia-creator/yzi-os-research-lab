"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  AGENDA_PENDENCY_GROUPS,
  APPOINTMENT_KIND_ACCENT,
  APPOINTMENT_KIND_LABEL,
  APPOINTMENT_STATUS_ACCENT,
  APPOINTMENT_STATUS_LABEL,
  DEMO_APPOINTMENTS,
  WEEKDAY_LABEL,
  buildMonthGrid,
  buildWeekRow,
  monthTitle,
  weekTitle,
  type AppointmentKind,
  type AppointmentStatus,
  type CalendarDay,
  type DemoAppointment,
} from "@/components/yzi-imob/yzi-imob-agenda-mock";
import { ArrowRightIcon, SearchIcon } from "@/components/yzi-imob/yzi-imob-icons-v2";
import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";

// Agenda — um CALENDÁRIO de verdade, protagonista da tela. A grade de dias é
// a estrutura; os eventos são habitantes compactos dela. Clicar em um evento
// abre o inspector lateral (mesmo padrão do sistema) sem sair do calendário.
// O calendário conversa com a operação: cliente, imóvel, corretor, lead e
// atendimento. Estado honesto: nenhum compromisso é real, nada confirma ou
// reagenda de verdade.

type ViewMode = "mes" | "semana";

const KIND_FILTER_OPTIONS: Array<{ value: AppointmentKind | "todos"; label: string }> = [
  { value: "todos", label: "Todos os tipos" },
  { value: "visita", label: "Visitas" },
  { value: "reuniao", label: "Reuniões" },
  { value: "followup", label: "Follow-ups" },
];

const STATUS_FILTER_OPTIONS: Array<{ value: AppointmentStatus | "todos"; label: string }> = [
  { value: "todos", label: "Todos os status" },
  { value: "confirmado", label: "Confirmado" },
  { value: "aguardando-corretor", label: "Aguardando corretor" },
  { value: "feedback-pendente", label: "Feedback pendente" },
  { value: "reagendar", label: "Reagendar" },
];

const selectClass =
  "h-8 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-2 text-[0.72rem] text-[var(--yzi-text-secondary)] outline-none transition-colors hover:text-[var(--yzi-text-primary)]";

/* ------------------------------------------------------------------ */
/* Evento no quadrante do calendário                                    */
/* ------------------------------------------------------------------ */

function EventChip({
  appointment,
  selected,
  compact,
  onSelect,
}: {
  appointment: DemoAppointment;
  selected: boolean;
  compact: boolean;
  onSelect: () => void;
}) {
  const kindRole = APPOINTMENT_KIND_ACCENT[appointment.kind];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "flex w-full flex-col gap-0.5 rounded-[var(--yzi-radius-sm)] px-2 py-1.5 text-left transition-colors",
        selected
          ? "bg-[rgba(255,255,255,0.07)]"
          : "hover:bg-[rgba(255,255,255,0.04)]",
      )}
      style={selected ? { boxShadow: `inset 0 0 0 1px ${imobRgba(kindRole, 0.5)}` } : undefined}
    >
      <span className="flex items-center gap-1.5 text-[0.64rem] leading-none">
        <span
          aria-hidden
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: imobRgba(kindRole, 0.95) }}
        />
        <span className="tabular-nums text-[var(--yzi-text-secondary)]">
          {appointment.timeLabel}
        </span>
        <span style={{ color: imobRgba(kindRole, 0.9) }}>
          {APPOINTMENT_KIND_LABEL[appointment.kind]}
        </span>
      </span>
      <span className="truncate text-[0.7rem] font-medium leading-snug text-[var(--yzi-text-primary)]">
        {appointment.title}
      </span>
      {!compact && appointment.clientLabel ? (
        <span className="truncate text-[0.64rem] text-[var(--yzi-text-faint)]">
          {appointment.clientLabel}
        </span>
      ) : null}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Quadrante (célula de dia)                                            */
/* ------------------------------------------------------------------ */

function DayCell({
  day,
  appointments,
  selectedId,
  onSelect,
  tall,
  maxVisible,
}: {
  day: CalendarDay;
  appointments: DemoAppointment[];
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
          day.isToday
            ? "font-semibold"
            : "text-[var(--yzi-text-faint)]",
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

/* ------------------------------------------------------------------ */
/* Inspector do evento — widget lateral, sem sair do calendário         */
/* ------------------------------------------------------------------ */

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
  appointment: DemoAppointment;
  onClose: () => void;
}) {
  const kindRole = APPOINTMENT_KIND_ACCENT[appointment.kind];
  const statusRole = APPOINTMENT_STATUS_ACCENT[appointment.status];

  return (
    <div className="flex flex-col gap-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-4 shadow-[var(--yzi-edge-highlight)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[0.64rem] font-medium" style={{ color: imobRgba(kindRole, 0.95) }}>
            {APPOINTMENT_KIND_LABEL[appointment.kind]} · {appointment.timeLabel}
          </span>
          <p className="text-[0.92rem] font-semibold leading-snug text-[var(--yzi-text-primary)]">
            {appointment.title}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes do evento"
          className="grid h-6 w-6 shrink-0 place-items-center rounded-[var(--yzi-radius-sm)] text-[var(--yzi-text-faint)] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--yzi-text-primary)]"
        >
          ✕
        </button>
      </div>

      <span
        className="w-fit rounded-full border px-2.5 py-1 text-[0.66rem]"
        style={{
          borderColor: imobRgba(statusRole, 0.32),
          backgroundColor: imobRgba(statusRole, 0.1),
          color: imobRgba(statusRole, 0.95),
        }}
      >
        {APPOINTMENT_STATUS_LABEL[appointment.status]}
      </span>

      <div className="flex flex-col gap-1.5 border-t border-[color:var(--yzi-border-subtle)] pt-3">
        <DetailRow label="Cliente" value={appointment.clientLabel ?? "—"} />
        <DetailRow label="Imóvel" value={appointment.propertyLabel ?? "—"} />
        <DetailRow label="Corretor" value={appointment.brokerLabel} />
        <DetailRow label="Origem do lead" value={appointment.originLabel} />
      </div>

      <div className="flex flex-col gap-1.5 border-t border-[color:var(--yzi-border-subtle)] pt-3">
        <p className="text-[0.64rem] font-medium uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
          Observações
        </p>
        <p className="text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          {appointment.notes}
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-3">
        <p className="text-[0.64rem] font-medium uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
          Linha do tempo
        </p>
        <ul className="flex flex-col gap-1.5">
          {appointment.timeline.map((step, index) => (
            <li key={step} className="flex items-start gap-2">
              <span
                aria-hidden
                className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: imobRgba(
                    index === appointment.timeline.length - 1 ? statusRole : "graphite",
                    0.85,
                  ),
                }}
              />
              <span className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                {step}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-3">
        <p className="text-[0.64rem] font-medium uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
          Ações
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled
            title="Em preparação"
            className="cursor-not-allowed rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-2.5 py-1.5 text-[0.7rem] text-[var(--yzi-text-faint)] opacity-60"
          >
            Confirmar pelo WhatsApp
          </button>
          <button
            type="button"
            disabled
            title="Em preparação"
            className="cursor-not-allowed rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-2.5 py-1.5 text-[0.7rem] text-[var(--yzi-text-faint)] opacity-60"
          >
            Reagendar
          </button>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {appointment.propertyLabel ? (
            <Link
              href="/cockpit/yzi-imob/imoveis"
              className="inline-flex items-center gap-1 text-[0.7rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)]"
            >
              Abrir imóvel <ArrowRightIcon className="h-3 w-3" />
            </Link>
          ) : null}
          {appointment.clientLabel ? (
            <Link
              href="/cockpit/yzi-imob/clientes"
              className="inline-flex items-center gap-1 text-[0.7rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)]"
            >
              Ver lead <ArrowRightIcon className="h-3 w-3" />
            </Link>
          ) : null}
          <Link
            href="/cockpit/yzi-imob/corretores"
            className="inline-flex items-center gap-1 text-[0.7rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)]"
          >
            Abrir corretor <ArrowRightIcon className="h-3 w-3" />
          </Link>
          <Link
            href="/cockpit/yzi-imob/atendimento"
            className="inline-flex items-center gap-1 text-[0.7rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)]"
          >
            Abrir atendimento <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pendências — painel lateral extremamente compacto                    */
/* ------------------------------------------------------------------ */

function PendencyPanel({ onSelect }: { onSelect: (id: string) => void }) {
  const byId = useMemo(
    () => new Map(DEMO_APPOINTMENTS.map((appointment) => [appointment.id, appointment])),
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--yzi-text-faint)]">
        Pendências
      </p>
      {AGENDA_PENDENCY_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="flex items-center justify-between text-[0.7rem] text-[var(--yzi-text-secondary)]">
            {group.label}
            <span className="tabular-nums text-[var(--yzi-text-faint)]">
              {group.appointmentIds.length}
            </span>
          </p>
          {group.appointmentIds.map((id) => {
            const appointment = byId.get(id);
            if (!appointment) return null;
            const role = APPOINTMENT_STATUS_ACCENT[appointment.status];
            return (
              <button
                key={`${group.label}-${id}`}
                type="button"
                onClick={() => onSelect(id)}
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
                  {appointment.brokerLabel.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Workspace                                                            */
/* ------------------------------------------------------------------ */

export function YziImobAgendaWorkspace() {
  const [view, setView] = useState<ViewMode>("mes");
  const [cursor, setCursor] = useState(0); // meses ou semanas, conforme a vista
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [brokerFilter, setBrokerFilter] = useState("todos");
  const [kindFilter, setKindFilter] = useState<AppointmentKind | "todos">("todos");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "todos">("todos");

  const brokers = useMemo(
    () => Array.from(new Set(DEMO_APPOINTMENTS.map((a) => a.brokerLabel))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return DEMO_APPOINTMENTS.filter((appointment) => {
      if (brokerFilter !== "todos" && appointment.brokerLabel !== brokerFilter) return false;
      if (kindFilter !== "todos" && appointment.kind !== kindFilter) return false;
      if (statusFilter !== "todos" && appointment.status !== statusFilter) return false;
      if (!text) return true;
      return [
        appointment.title,
        appointment.clientLabel ?? "",
        appointment.propertyLabel ?? "",
        appointment.brokerLabel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(text);
    }).sort((a, b) => a.timeLabel.localeCompare(b.timeLabel));
  }, [query, brokerFilter, kindFilter, statusFilter]);

  const byOffset = useMemo(() => {
    const map = new Map<number, DemoAppointment[]>();
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
    ? DEMO_APPOINTMENTS.find((appointment) => appointment.id === selectedId) ?? null
    : null;

  function switchView(next: ViewMode) {
    if (next !== view) {
      setView(next);
      setCursor(0);
    }
  }

  return (
    <section className="flex w-full flex-col gap-5 px-6 py-6 md:px-8">
      {/* Toolbar do calendário — controles simples, sem virar dashboard. */}
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
            aria-label={view === "mes" ? "Mês anterior" : "Semana anterior"}
            className="grid h-8 w-8 place-items-center rounded-[var(--yzi-radius-sm)] text-[var(--yzi-text-faint)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--yzi-text-primary)]"
          >
            <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => setCursor((value) => value + 1)}
            aria-label={view === "mes" ? "Próximo mês" : "Próxima semana"}
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
                {mode === "semana" ? "Semana" : "Mês"}
              </button>
            ))}
          </div>

          <div className="flex h-8 items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-2.5">
            <SearchIcon aria-hidden className="h-3.5 w-3.5 shrink-0 text-[var(--yzi-text-faint)]" />
            <label htmlFor="agenda-search" className="sr-only">
              Buscar eventos
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
            aria-label="Filtrar por corretor"
            value={brokerFilter}
            onChange={(event) => setBrokerFilter(event.target.value)}
            className={selectClass}
          >
            <option value="todos">Todos os corretores</option>
            {brokers.map((broker) => (
              <option key={broker} value={broker}>
                {broker}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por tipo"
            value={kindFilter}
            onChange={(event) => setKindFilter(event.target.value as AppointmentKind | "todos")}
            className={selectClass}
          >
            {KIND_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as AppointmentStatus | "todos")
            }
            className={selectClass}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-start gap-5">
        {/* O calendário — protagonista da tela. */}
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

        {/* Painel lateral — inspector do evento ou pendências compactas. */}
        <aside className="hidden w-[300px] shrink-0 flex-col gap-4 lg:flex">
          {selected ? (
            <EventInspector appointment={selected} onClose={() => setSelectedId(null)} />
          ) : (
            <PendencyPanel onSelect={setSelectedId} />
          )}
        </aside>
      </div>

      {/* Em telas menores o inspector aparece abaixo do calendário. */}
      {selected ? (
        <div className="lg:hidden">
          <EventInspector appointment={selected} onClose={() => setSelectedId(null)} />
        </div>
      ) : null}

      <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Demonstração — compromissos ilustrativos. Nenhuma confirmação é enviada e nenhum
        reagendamento acontece de verdade.
      </p>
    </section>
  );
}
