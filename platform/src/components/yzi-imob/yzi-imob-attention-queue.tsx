"use client";

import {
  HANDOFF_MODE_LABEL,
  HANDOFF_STATUS_LABEL,
  brokerName,
  type AttentionItem,
  type DemoHandoff,
  type DemoVisitFeedback,
  type OfferOutcome,
} from "@/components/yzi-imob/yzi-imob-handoff-mock";
import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";

// Fila viva de atenção operacional (tela Corretores). Fila ÚNICA: handoffs
// priority, corridas de lançamento (race) e feedbacks pendentes na mesma
// lógica — o que precisa de decisão agora, ordenado por urgência, nunca por
// performance. Mock honesto: prazos são labels estáticos (contador regressivo
// real é FUTURO), nada aceita/recusa/dispara de verdade.

/* ------------------------------------------------------------------ */
/* Acentos por tipo de card                                            */
/* ------------------------------------------------------------------ */

const CARD_ACCENT: Record<"priority" | "race" | "feedback", YziImobRole> = {
  priority: "primary",
  race: "cyan",
  feedback: "amber",
};

const OFFER_OUTCOME_LABEL: Record<OfferOutcome, string> = {
  pending: "aguardando",
  accepted: "assumiu",
  declined: "recusou",
  expired: "não respondeu",
};

/* ------------------------------------------------------------------ */
/* Peças pequenas                                                      */
/* ------------------------------------------------------------------ */

function TypeBadge({ label, role }: { label: string; role: YziImobRole }) {
  return (
    <span
      className="rounded-full border px-2.5 py-1 text-[0.64rem] uppercase tracking-[0.08em]"
      style={{
        borderColor: imobRgba(role, 0.32),
        backgroundColor: imobRgba(role, 0.1),
        color: imobRgba(role, 0.95),
      }}
    >
      {label}
    </span>
  );
}

/**
 * Prazo de aceite. Valor ESTÁTICO do mock — o contador regressivo real
 * (relógio/servidor + reoferta automática) é FUTURO.
 */
export function DeadlineChip({ deadlineLabel }: { deadlineLabel: string }) {
  return (
    <span
      className="rounded-full border px-2.5 py-1 text-[0.7rem] font-medium tabular-nums"
      style={{
        borderColor: imobRgba("amber", 0.4),
        backgroundColor: imobRgba("amber", 0.12),
        color: imobRgba("amber", 0.95),
      }}
    >
      Aceite em {deadlineLabel}
    </span>
  );
}

function cardShell(role: YziImobRole) {
  return {
    className:
      "flex flex-col gap-2.5 rounded-[var(--yzi-radius-md)] border border-l-[3px] border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3.5 shadow-[var(--yzi-edge-highlight)]",
    style: { borderLeftColor: imobRgba(role, 0.5) },
  } as const;
}

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

export function HandoffQueueCard({ handoff }: { handoff: DemoHandoff }) {
  const role = CARD_ACCENT[handoff.mode];
  const shell = cardShell(role);
  const currentOffer = handoff.offers.find((offer) => offer.outcome === "pending");

  return (
    <article className={shell.className} style={shell.style}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TypeBadge label={HANDOFF_MODE_LABEL[handoff.mode]} role={role} />
        {handoff.mode === "priority" && handoff.deadlineLabel ? (
          <DeadlineChip deadlineLabel={handoff.deadlineLabel} />
        ) : (
          <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">
            {HANDOFF_STATUS_LABEL[handoff.status]}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="text-[0.9rem] font-medium text-[var(--yzi-text-primary)]">
          {handoff.leadName}
        </p>
        <p className="text-[0.74rem] text-[var(--yzi-text-secondary)]">
          {handoff.leadSummary} · {handoff.propertyLabel}
        </p>
      </div>

      {handoff.mode === "priority" ? (
        <div className="flex flex-col gap-1">
          {currentOffer ? (
            <p className="text-[0.76rem] text-[var(--yzi-text-secondary)]">
              Ofereci primeiro a{" "}
              <span className="text-[var(--yzi-text-primary)]">
                {brokerName(currentOffer.brokerId)}
              </span>
              {currentOffer.isCaptador ? " (captadora do imóvel)" : ""}.
            </p>
          ) : (
            <p className="text-[0.76rem] text-[var(--yzi-text-secondary)]">
              Nenhuma oferta ativa — aguardando corretor elegível.
            </p>
          )}
          <p className="text-[0.7rem] text-[var(--yzi-text-faint)]">
            Se o prazo expirar, reencaminho ao próximo corretor elegível.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {handoff.offers.map((offer) => (
              <span
                key={offer.brokerId}
                className="rounded-full border border-[color:var(--yzi-border-subtle)] px-2 py-0.5 text-[0.68rem] text-[var(--yzi-text-secondary)]"
              >
                {brokerName(offer.brokerId)} · {OFFER_OUTCOME_LABEL[offer.outcome]}
              </span>
            ))}
          </div>
          <p className="text-[0.7rem] text-[var(--yzi-text-faint)]">
            Primeiro que aceitar assume — os demais deixam de receber.
          </p>
        </div>
      )}
    </article>
  );
}

export function FeedbackPendingCard({ feedback }: { feedback: DemoVisitFeedback }) {
  const shell = cardShell(CARD_ACCENT.feedback);
  return (
    <article className={shell.className} style={shell.style}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TypeBadge label="Feedback pendente" role={CARD_ACCENT.feedback} />
        <span
          className="rounded-full border px-2.5 py-1 text-[0.7rem]"
          style={{
            borderColor: imobRgba("amber", 0.4),
            backgroundColor: imobRgba("amber", 0.12),
            color: imobRgba("amber", 0.95),
          }}
        >
          {feedback.dueLabel}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="text-[0.9rem] font-medium text-[var(--yzi-text-primary)]">
          Visita de {feedback.visitAtLabel} sem retorno
        </p>
        <p className="text-[0.74rem] text-[var(--yzi-text-secondary)]">
          {brokerName(feedback.brokerId)} · {feedback.leadName} · {feedback.propertyLabel}
        </p>
      </div>

      <p className="text-[0.7rem] text-[var(--yzi-text-faint)]">
        Pedi feedback pelo WhatsApp ({feedback.remindersSent}x) — demonstração,
        nenhuma mensagem real é enviada.
      </p>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Fila                                                                */
/* ------------------------------------------------------------------ */

export function AttentionQueue({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-5 text-center shadow-[var(--yzi-edge-highlight)]">
        <p className="text-[0.82rem] text-[var(--yzi-text-secondary)]">
          Nenhum handoff aguardando. Tudo encaminhado.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) =>
        item.kind === "handoff" ? (
          <HandoffQueueCard key={item.handoff.id} handoff={item.handoff} />
        ) : (
          <FeedbackPendingCard key={item.feedback.id} feedback={item.feedback} />
        ),
      )}
    </div>
  );
}
