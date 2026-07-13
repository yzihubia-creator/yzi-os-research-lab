// Mock da Agenda (YZI IMOB). Demonstração honesta: nenhum compromisso é
// real, nenhuma confirmação é enviada, nada é reagendado de verdade. Os
// registros abaixo ilustram o calendário operacional — visitas, reuniões e
// follow-ups conectados a imóveis, corretores e leads, com estado explícito.
// Sem backend, sem Runtime, sem WhatsApp real.

export type AppointmentKind = "visita" | "reuniao" | "followup";

export type AppointmentStatus =
  | "confirmado"
  | "aguardando-corretor"
  | "realizada"
  | "feedback-pendente"
  | "reagendar";

export const APPOINTMENT_KIND_LABEL: Record<AppointmentKind, string> = {
  visita: "Visita",
  reuniao: "Reunião",
  followup: "Follow-up",
};

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmado: "Confirmado",
  "aguardando-corretor": "Aguardando corretor",
  realizada: "Realizada",
  "feedback-pendente": "Feedback pendente",
  reagendar: "Reagendar",
};

export type StatusRole = "coldGreen" | "amber" | "graphite" | "wine" | "cyan" | "lilac";

export const APPOINTMENT_STATUS_ACCENT: Record<AppointmentStatus, StatusRole> = {
  confirmado: "coldGreen",
  "aguardando-corretor": "amber",
  realizada: "cyan",
  "feedback-pendente": "amber",
  reagendar: "wine",
};

// Cor do TIPO de evento no calendário — leitura de relance por cor funcional:
// visita = decisão de campo (gelo), reunião = coordenação (lilás),
// follow-up = comunicação assistida (ciano).
export const APPOINTMENT_KIND_ACCENT: Record<AppointmentKind, StatusRole> = {
  visita: "coldGreen",
  reuniao: "lilac",
  followup: "cyan",
};

/**
 * Evento do calendário. `dayOffset` é relativo a hoje (0 = hoje, negativo =
 * passado) — as datas reais são calculadas no cliente, sem persistência.
 * Cada evento conversa com a operação: cliente, imóvel, corretor e origem.
 */
export type DemoAppointment = {
  id: string;
  dayOffset: number;
  timeLabel: string;
  kind: AppointmentKind;
  status: AppointmentStatus;
  title: string; // imóvel ou assunto — a linha que aparece no calendário
  clientLabel: string | null;
  propertyLabel: string | null;
  brokerLabel: string;
  originLabel: string;
  notes: string;
  timeline: string[];
};

export const DEMO_APPOINTMENTS: DemoAppointment[] = [
  {
    id: "ap-feedback-vista-mar",
    dayOffset: -1,
    timeLabel: "16:00",
    kind: "visita",
    status: "feedback-pendente",
    title: "Cobertura Vista Mar",
    clientLabel: "Renata Souza",
    propertyLabel: "Cobertura Vista Mar",
    brokerLabel: "Marina Alves",
    originLabel: "Site — formulário do imóvel",
    notes: "Visita realizada ontem; a YZI pediu o feedback pela manhã e ainda não houve retorno.",
    timeline: [
      "Lead entrou pelo site pedindo cobertura vista mar",
      "YZI qualificou e ofertou para Marina (captadora)",
      "Visita confirmada e realizada",
      "Feedback pós-visita pendente",
    ],
  },
  {
    id: "ap-reagendar-brava",
    dayOffset: -2,
    timeLabel: "09:00",
    kind: "visita",
    status: "reagendar",
    title: "Lançamento Brava One",
    clientLabel: "Fernando Dias",
    propertyLabel: "Lançamento Brava One",
    brokerLabel: "Bruna Kohl",
    originLabel: "Campanha — lançamento",
    notes: "Corretora não confirmou dentro do prazo; o lead segue quente e espera nova data.",
    timeline: [
      "Lead quente do lançamento disparado para elegíveis",
      "Bruna aceitou o atendimento",
      "Prazo de confirmação expirou sem resposta",
      "Aguardando reagendamento",
    ],
  },
  {
    id: "ap-hoje-visita",
    dayOffset: 0,
    timeLabel: "09:00",
    kind: "visita",
    status: "confirmado",
    title: "Cobertura Vista Mar",
    clientLabel: "Marina Alves (cliente)",
    propertyLabel: "Cobertura Vista Mar",
    brokerLabel: "Marina Alves",
    originLabel: "Site — formulário do imóvel",
    notes: "Cliente quer avaliar a vista do pôr do sol; visita marcada de manhã a pedido dela.",
    timeline: [
      "Lead qualificado pela YZI no WhatsApp",
      "Corretora confirmou disponibilidade",
      "Visita confirmada com a cliente",
    ],
  },
  {
    id: "ap-hoje-reuniao",
    dayOffset: 0,
    timeLabel: "14:00",
    kind: "reuniao",
    status: "confirmado",
    title: "Construtora Atlas",
    clientLabel: null,
    propertyLabel: "Lançamento Brava One",
    brokerLabel: "Equipe",
    originLabel: "Parceria — construtora",
    notes: "Alinhamento sobre a tabela de lançamento e elegibilidade de corretores.",
    timeline: [
      "Construtora anunciou o lançamento",
      "Reunião de alinhamento agendada",
    ],
  },
  {
    id: "ap-hoje-followup",
    dayOffset: 0,
    timeLabel: "16:30",
    kind: "followup",
    status: "aguardando-corretor",
    title: "Renata Souza",
    clientLabel: "Renata Souza",
    propertyLabel: null,
    brokerLabel: "Diego Ferraz",
    originLabel: "Indicação",
    notes: "Cliente busca cobertura vista mar acima de R$ 1,5M; sem imóvel compatível publicado.",
    timeline: [
      "Lead qualificado pela YZI",
      "Follow-up ofertado para Diego",
      "Aguardando aceite do corretor",
    ],
  },
  {
    id: "ap-amanha-reuniao",
    dayOffset: 1,
    timeLabel: "10:00",
    kind: "reuniao",
    status: "confirmado",
    title: "Alinhamento semanal",
    clientLabel: null,
    propertyLabel: null,
    brokerLabel: "Equipe",
    originLabel: "Rotina da operação",
    notes: "Revisão da fila de handoffs e pendências de feedback da semana.",
    timeline: ["Reunião recorrente da operação"],
  },
  {
    id: "ap-amanha-visita",
    dayOffset: 1,
    timeLabel: "15:00",
    kind: "visita",
    status: "confirmado",
    title: "Casa Jardim Europa 112",
    clientLabel: "Carlos Eduardo",
    propertyLabel: "Casa Jardim Europa 112",
    brokerLabel: "Diego Ferraz",
    originLabel: "Anúncio — tráfego pago",
    notes: "Segunda visita do cliente; quer levar a esposa para conhecer a casa.",
    timeline: [
      "Lead entrou por anúncio",
      "Primeira visita realizada",
      "Segunda visita confirmada",
    ],
  },
  {
    id: "ap-brava-confirmar",
    dayOffset: 2,
    timeLabel: "09:30",
    kind: "visita",
    status: "aguardando-corretor",
    title: "Lançamento Brava One",
    clientLabel: "Juliana Melo",
    propertyLabel: "Lançamento Brava One",
    brokerLabel: "Bruna Kohl",
    originLabel: "Campanha — lançamento",
    notes: "Lead do lançamento; a YZI aguarda a confirmação da corretora para fechar o horário.",
    timeline: [
      "Lead quente disparado para elegíveis",
      "Bruna aceitou o atendimento",
      "Aguardando confirmação do horário",
    ],
  },
  {
    id: "ap-proposta-carlos",
    dayOffset: 4,
    timeLabel: "14:00",
    kind: "followup",
    status: "confirmado",
    title: "Carlos Eduardo",
    clientLabel: "Carlos Eduardo",
    propertyLabel: "Casa Jardim Europa 112",
    brokerLabel: "Diego Ferraz",
    originLabel: "Anúncio — tráfego pago",
    notes: "Follow-up da proposta enviada após a segunda visita.",
    timeline: [
      "Proposta enviada ao proprietário",
      "Follow-up agendado com o cliente",
    ],
  },
  {
    id: "ap-sabado-visita",
    dayOffset: 6,
    timeLabel: "11:00",
    kind: "visita",
    status: "confirmado",
    title: "Cobertura Vista Mar",
    clientLabel: "Patrícia Ramos",
    propertyLabel: "Cobertura Vista Mar",
    brokerLabel: "Marina Alves",
    originLabel: "Site — vitrine",
    notes: "Primeira visita; cliente vem de fora da cidade no fim de semana.",
    timeline: ["Lead qualificado pela YZI", "Visita confirmada para sábado"],
  },
  {
    id: "ap-semana2-reuniao",
    dayOffset: 8,
    timeLabel: "10:00",
    kind: "reuniao",
    status: "confirmado",
    title: "Alinhamento semanal",
    clientLabel: null,
    propertyLabel: null,
    brokerLabel: "Equipe",
    originLabel: "Rotina da operação",
    notes: "Revisão da fila de handoffs e pendências de feedback da semana.",
    timeline: ["Reunião recorrente da operação"],
  },
  {
    id: "ap-semana2-visita",
    dayOffset: 9,
    timeLabel: "15:30",
    kind: "visita",
    status: "aguardando-corretor",
    title: "Apto Centro 804",
    clientLabel: "Juliana Melo",
    propertyLabel: "Apto Centro 804",
    brokerLabel: "Diego Ferraz",
    originLabel: "Site — busca",
    notes: "Cliente comparando com outro apartamento do Centro; corretor ainda não confirmou.",
    timeline: [
      "Lead pediu visita pelo site",
      "Oferta enviada ao corretor",
      "Aguardando aceite",
    ],
  },
  {
    id: "ap-semana2-followup",
    dayOffset: 11,
    timeLabel: "09:00",
    kind: "followup",
    status: "confirmado",
    title: "Fernando Dias",
    clientLabel: "Fernando Dias",
    propertyLabel: "Lançamento Brava One",
    brokerLabel: "Bruna Kohl",
    originLabel: "Campanha — lançamento",
    notes: "Retomar contato após o reagendamento da visita ao lançamento.",
    timeline: ["Visita anterior não confirmada", "Follow-up de retomada agendado"],
  },
];

/**
 * Pendências operacionais — o painel compacto ao lado do calendário.
 * Cada pendência referencia um evento real (appointmentId) para abrir o
 * mesmo inspector sem sair do calendário.
 */
export type AgendaPendencyGroup = {
  label: string;
  appointmentIds: string[];
};

export const AGENDA_PENDENCY_GROUPS: AgendaPendencyGroup[] = [
  { label: "Visitas sem retorno", appointmentIds: ["ap-feedback-vista-mar"] },
  { label: "Feedback pendente", appointmentIds: ["ap-feedback-vista-mar"] },
  {
    label: "Confirmações aguardando",
    appointmentIds: ["ap-hoje-followup", "ap-brava-confirmar", "ap-semana2-visita"],
  },
  { label: "Reagendar", appointmentIds: ["ap-reagendar-brava"] },
];

/* ------------------------------------------------------------------ */
/* Grade do calendário — cálculo puro de cliente, sem persistência      */
/* ------------------------------------------------------------------ */

export const WEEKDAY_LABEL = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export type CalendarDay = {
  /** Offset em dias relativo a hoje — casa com DemoAppointment.dayOffset. */
  offset: number;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
};

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function diffInDays(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000);
}

/** Rótulo do mês visível, ex.: "julho de 2026". */
export function monthTitle(monthCursor: number, today: Date = new Date()): string {
  const date = new Date(today.getFullYear(), today.getMonth() + monthCursor, 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

/**
 * Grade mensal (semanas completas, domingo a sábado) do mês `monthCursor`
 * meses à frente/atrás do atual. Inclui dias vizinhos para fechar as semanas.
 */
export function buildMonthGrid(monthCursor: number, today: Date = new Date()): CalendarDay[][] {
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth() + monthCursor, 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const weeks: CalendarDay[][] = [];
  const cursor = new Date(gridStart);
  do {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 7; i += 1) {
      week.push({
        offset: diffInDays(today, cursor),
        dayNumber: cursor.getDate(),
        inCurrentMonth: cursor.getMonth() === firstOfMonth.getMonth(),
        isToday: diffInDays(today, cursor) === 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  } while (cursor.getMonth() === firstOfMonth.getMonth());
  return weeks;
}

/** Semana (domingo a sábado) `weekCursor` semanas à frente/atrás da atual. */
export function buildWeekRow(weekCursor: number, today: Date = new Date()): CalendarDay[] {
  const start = startOfDay(today);
  start.setDate(start.getDate() - start.getDay() + weekCursor * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    return {
      offset: diffInDays(today, date),
      dayNumber: date.getDate(),
      inCurrentMonth: date.getMonth() === today.getMonth(),
      isToday: diffInDays(today, date) === 0,
    };
  });
}

/** Rótulo da semana visível, ex.: "6 – 12 de julho". */
export function weekTitle(weekCursor: number, today: Date = new Date()): string {
  const days = buildWeekRow(weekCursor, today);
  const start = new Date(today);
  start.setDate(start.getDate() + days[0].offset);
  const end = new Date(today);
  end.setDate(end.getDate() + days[6].offset);
  const month = end.toLocaleDateString("pt-BR", { month: "long" });
  return `${start.getDate()} – ${end.getDate()} de ${month}`;
}
