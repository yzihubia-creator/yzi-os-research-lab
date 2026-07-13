// Mock de Handoff & Atenção Operacional (tela Corretores). Demonstração
// honesta: nenhum lead, prazo, disparo ou feedback real. Os registros abaixo
// representam o futuro schema de handoff (oferta de lead a corretor) e de
// feedback pós-visita. Regra aprovada: prioridade do captador é uma ordem na
// fila de oferta (disponibilidade + aceite + prazo), nunca propriedade do
// imóvel. Sem backend, sem Runtime, sem WhatsApp real, sem política comercial.
//
// Prazos e horários são labels ESTÁTICOS do mock — contador regressivo real e
// reoferta automática são FUTURO.

import { DEMO_BROKERS } from "@/components/yzi-imob/yzi-imob-entity-workspace-mock";

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export type HandoffMode = "priority" | "race";

export type HandoffStatus =
  | "offered" // priority: oferta ativa ao corretor da vez
  | "assigned" // priority: aceito
  | "expired" // oferta corrente expirou (transitório, gera reoferta)
  | "unassigned" // ninguém aceitou — alerta
  | "broadcasting" // race: aberto simultaneamente aos elegíveis
  | "claimed" // race: alguém assumiu
  | "closed"; // race: encerrado para os demais

export type OfferOutcome = "pending" | "accepted" | "declined" | "expired";

export type HandoffOffer = {
  brokerId: string; // id de DEMO_BROKERS
  round: number; // priority: 1 = captador; race: 1 para todos
  isCaptador: boolean;
  offeredAtLabel: string; // "há 4 min" — mock, sem relógio real
  outcome: OfferOutcome;
};

export type DemoHandoff = {
  id: string;
  mode: HandoffMode;
  status: HandoffStatus;
  leadName: string;
  leadSummary: string;
  propertyId: string | null; // id de DEMO_PROPERTIES quando houver
  propertyLabel: string;
  offers: HandoffOffer[];
  assignedBrokerId: string | null;
  deadlineLabel: string | null; // "04:12" — estático (mock honesto)
  createdAtLabel: string;
};

export type FeedbackStatus = "pending" | "received";

export type DemoVisitFeedback = {
  id: string;
  brokerId: string;
  propertyLabel: string;
  leadName: string;
  status: FeedbackStatus;
  visitAtLabel: string;
  dueLabel: string; // "devendo há 18h"
  remindersSent: number;
};

/** Item unificado da fila de atenção operacional. */
export type AttentionItem =
  | { kind: "handoff"; handoff: DemoHandoff }
  | { kind: "feedback"; feedback: DemoVisitFeedback };

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

export const HANDOFF_MODE_LABEL: Record<HandoffMode, string> = {
  priority: "Prioridade do captador",
  race: "Lançamento · aceite rápido",
};

export const HANDOFF_STATUS_LABEL: Record<HandoffStatus, string> = {
  offered: "Aguardando aceite",
  assigned: "Aceito",
  expired: "Prazo expirado",
  unassigned: "Sem corretor",
  broadcasting: "Oportunidade aberta",
  claimed: "Assumido",
  closed: "Encerrado",
};

/* ------------------------------------------------------------------ */
/* Dados de demonstração                                               */
/* ------------------------------------------------------------------ */

export const DEMO_HANDOFFS: DemoHandoff[] = [
  {
    // Vivo: oferta ativa à captadora, prazo correndo.
    id: "hf-lead-renata",
    mode: "priority",
    status: "offered",
    leadName: "Renata Souza",
    leadSummary: "Apto alto padrão · Barra Sul · até R$ 1,6M",
    propertyId: "vista-mar",
    propertyLabel: "Cobertura Vista Mar · Barra Sul",
    offers: [
      {
        brokerId: "marina-alves",
        round: 1,
        isCaptador: true,
        offeredAtLabel: "há 4 min",
        outcome: "pending",
      },
    ],
    assignedBrokerId: null,
    deadlineLabel: "04:12",
    createdAtLabel: "há 4 min",
  },
  {
    // Vivo: corrida de lançamento em aberto.
    id: "hf-lead-otavio",
    mode: "race",
    status: "broadcasting",
    leadName: "Otávio Ramos",
    leadSummary: "Lançamento · Praia Brava · lead quente do site",
    propertyId: null,
    propertyLabel: "Lançamento Brava One",
    offers: [
      {
        brokerId: "marina-alves",
        round: 1,
        isCaptador: false,
        offeredAtLabel: "há 2 min",
        outcome: "pending",
      },
      {
        brokerId: "diego-ferraz",
        round: 1,
        isCaptador: false,
        offeredAtLabel: "há 2 min",
        outcome: "declined",
      },
      {
        brokerId: "bruna-kohl",
        round: 1,
        isCaptador: false,
        offeredAtLabel: "há 2 min",
        outcome: "pending",
      },
    ],
    assignedBrokerId: null,
    deadlineLabel: null,
    createdAtLabel: "há 2 min",
  },
  {
    // Histórico: fallback registrado — captadora expirou, Diego aceitou.
    id: "hf-lead-carlos",
    mode: "priority",
    status: "assigned",
    leadName: "Carlos Eduardo",
    leadSummary: "Casa · Jardim Europa · primeira compra",
    propertyId: null,
    propertyLabel: "Casa Jardim Europa 112",
    offers: [
      {
        brokerId: "marina-alves",
        round: 1,
        isCaptador: true,
        offeredAtLabel: "ontem 10h",
        outcome: "expired",
      },
      {
        brokerId: "diego-ferraz",
        round: 2,
        isCaptador: false,
        offeredAtLabel: "ontem 10h15",
        outcome: "accepted",
      },
    ],
    assignedBrokerId: "diego-ferraz",
    deadlineLabel: null,
    createdAtLabel: "ontem 10h",
  },
  {
    // Histórico: corrida encerrada — Diego assumiu, demais fecharam.
    id: "hf-lead-paula",
    mode: "race",
    status: "claimed",
    leadName: "Paula Trindade",
    leadSummary: "Lançamento · Centro · indicada por cliente",
    propertyId: null,
    propertyLabel: "Lançamento Centro Norte",
    offers: [
      {
        brokerId: "diego-ferraz",
        round: 1,
        isCaptador: false,
        offeredAtLabel: "há 3 dias",
        outcome: "accepted",
      },
      {
        brokerId: "marina-alves",
        round: 1,
        isCaptador: false,
        offeredAtLabel: "há 3 dias",
        outcome: "expired",
      },
    ],
    assignedBrokerId: "diego-ferraz",
    deadlineLabel: null,
    createdAtLabel: "há 3 dias",
  },
];

export const DEMO_VISIT_FEEDBACKS: DemoVisitFeedback[] = [
  {
    id: "fb-visita-renata",
    brokerId: "marina-alves",
    propertyLabel: "Cobertura Vista Mar · Barra Sul",
    leadName: "Renata Souza",
    status: "pending",
    visitAtLabel: "ontem 16h",
    dueLabel: "devendo há 18h",
    remindersSent: 2,
  },
  {
    id: "fb-visita-carlos",
    brokerId: "diego-ferraz",
    propertyLabel: "Casa Jardim Europa 112",
    leadName: "Carlos Eduardo",
    status: "pending",
    visitAtLabel: "hoje 9h",
    dueLabel: "devendo há 2h",
    remindersSent: 1,
  },
];

/* ------------------------------------------------------------------ */
/* Fila de atenção — só itens vivos, pré-ordenados por urgência        */
/* ------------------------------------------------------------------ */

const LIVE_HANDOFF_STATUS: readonly HandoffStatus[] = [
  "offered",
  "broadcasting",
  "unassigned",
];

function isLiveHandoff(handoff: DemoHandoff): boolean {
  return LIVE_HANDOFF_STATUS.includes(handoff.status);
}

/**
 * Fila unificada de atenção operacional: handoffs vivos + feedbacks pendentes,
 * na mesma lógica. Ordem de urgência (mock, sem relógio real): prazo de aceite
 * correndo > corrida aberta > feedback devendo há mais tempo.
 */
export const ATTENTION_QUEUE: AttentionItem[] = [
  ...DEMO_HANDOFFS.filter(isLiveHandoff)
    .slice()
    .sort((a, b) => {
      // Prazo correndo primeiro; depois corridas abertas; depois alertas.
      const weight = (h: DemoHandoff) =>
        h.status === "offered" ? 0 : h.status === "broadcasting" ? 1 : 2;
      return weight(a) - weight(b);
    })
    .map((handoff): AttentionItem => ({ kind: "handoff", handoff })),
  ...DEMO_VISIT_FEEDBACKS.filter((feedback) => feedback.status === "pending")
    .slice()
    .sort((a, b) => b.remindersSent - a.remindersSent)
    .map((feedback): AttentionItem => ({ kind: "feedback", feedback })),
];

/* ------------------------------------------------------------------ */
/* Atenção por corretor — alimenta a ordenação da lista                */
/* ------------------------------------------------------------------ */

export type BrokerAttentionLevel = "urgente" | "atenção" | "tranquilo";

export type BrokerAttention = {
  pendingHandoffs: number;
  pendingFeedbacks: number;
  level: BrokerAttentionLevel;
  /** No máximo um chip discreto na lista — nunca métrica de performance. */
  chipLabel: string | null;
};

export function brokerAttention(brokerId: string): BrokerAttention {
  const pendingHandoffs = DEMO_HANDOFFS.filter(
    (handoff) =>
      isLiveHandoff(handoff) &&
      handoff.offers.some(
        (offer) => offer.brokerId === brokerId && offer.outcome === "pending",
      ),
  ).length;
  const pendingFeedbacks = DEMO_VISIT_FEEDBACKS.filter(
    (feedback) => feedback.brokerId === brokerId && feedback.status === "pending",
  ).length;

  const level: BrokerAttentionLevel =
    pendingHandoffs > 0 ? "urgente" : pendingFeedbacks > 0 ? "atenção" : "tranquilo";

  const chipLabel =
    pendingHandoffs > 0
      ? pendingHandoffs === 1
        ? "1 handoff aguardando"
        : `${pendingHandoffs} handoffs aguardando`
      : pendingFeedbacks > 0
        ? "feedback devendo"
        : null;

  return { pendingHandoffs, pendingFeedbacks, level, chipLabel };
}

const ATTENTION_LEVEL_WEIGHT: Record<BrokerAttentionLevel, number> = {
  urgente: 0,
  atenção: 1,
  tranquilo: 2,
};

export function attentionWeight(level: BrokerAttentionLevel): number {
  return ATTENTION_LEVEL_WEIGHT[level];
}

/* ------------------------------------------------------------------ */
/* Timeline de operação do corretor (aba Operação)                     */
/* ------------------------------------------------------------------ */

export type OperationEvent = {
  id: string;
  atLabel: string;
  text: string;
  tone: "neutral" | "positive" | "attention";
};

export function brokerName(brokerId: string): string {
  return DEMO_BROKERS.find((broker) => broker.id === brokerId)?.nome ?? brokerId;
}

/**
 * Timeline derivada dos mocks de handoff + feedback — histórico do aceite.
 * Ordem: eventos mais recentes primeiro (a ordem dos mocks já reflete isso).
 */
export function brokerOperationTimeline(brokerId: string): OperationEvent[] {
  const events: OperationEvent[] = [];

  for (const handoff of DEMO_HANDOFFS) {
    for (const offer of handoff.offers) {
      if (offer.brokerId !== brokerId) continue;
      const who = offer.isCaptador ? " (captador do imóvel)" : "";
      if (offer.outcome === "pending") {
        events.push({
          id: `${handoff.id}-${offer.brokerId}-pending`,
          atLabel: offer.offeredAtLabel,
          text:
            handoff.mode === "race"
              ? `Oportunidade de lançamento aberta — ${handoff.leadName} · ${handoff.propertyLabel}. Primeiro que aceitar assume.`
              : `Lead ${handoff.leadName} ofertado${who} — aguardando aceite.`,
          tone: "attention",
        });
      } else if (offer.outcome === "accepted") {
        events.push({
          id: `${handoff.id}-${offer.brokerId}-accepted`,
          atLabel: offer.offeredAtLabel,
          text:
            handoff.mode === "race"
              ? `Assumiu a oportunidade ${handoff.leadName} · ${handoff.propertyLabel}.`
              : `Aceitou o lead ${handoff.leadName} · ${handoff.propertyLabel}.`,
          tone: "positive",
        });
      } else if (offer.outcome === "expired") {
        events.push({
          id: `${handoff.id}-${offer.brokerId}-expired`,
          atLabel: offer.offeredAtLabel,
          text:
            handoff.mode === "race"
              ? `Não respondeu a tempo — ${brokerName(handoff.assignedBrokerId ?? "")} assumiu ${handoff.leadName}.`
              : `Oferta de ${handoff.leadName} expirou${who} — reencaminhada ao próximo corretor elegível.`,
          tone: "attention",
        });
      } else {
        events.push({
          id: `${handoff.id}-${offer.brokerId}-declined`,
          atLabel: offer.offeredAtLabel,
          text: `Recusou a oportunidade ${handoff.leadName} · ${handoff.propertyLabel}.`,
          tone: "neutral",
        });
      }
    }
  }

  for (const feedback of DEMO_VISIT_FEEDBACKS) {
    if (feedback.brokerId !== brokerId) continue;
    events.push({
      id: `${feedback.id}-${feedback.status}`,
      atLabel: feedback.visitAtLabel,
      text:
        feedback.status === "pending"
          ? `Visita com ${feedback.leadName} (${feedback.propertyLabel}) sem retorno — feedback ${feedback.dueLabel}.`
          : `Feedback da visita com ${feedback.leadName} recebido — estado do lead e do imóvel atualizados.`,
      tone: feedback.status === "pending" ? "attention" : "positive",
    });
  }

  return events;
}

/** Itens vivos (handoffs + feedbacks) de UM corretor — bloco "Agora". */
export function brokerLiveItems(brokerId: string): AttentionItem[] {
  return ATTENTION_QUEUE.filter((item) =>
    item.kind === "handoff"
      ? item.handoff.offers.some(
          (offer) => offer.brokerId === brokerId && offer.outcome === "pending",
        )
      : item.feedback.brokerId === brokerId,
  );
}
