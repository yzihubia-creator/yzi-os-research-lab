"use client";

import { AttentionQueue } from "@/components/yzi-imob/yzi-imob-attention-queue";
import {
  brokerLiveItems,
  brokerOperationTimeline,
  type OperationEvent,
} from "@/components/yzi-imob/yzi-imob-handoff-mock";
import { WorkspaceSection } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";

// Aba Operação do Broker Workspace — o corretor como posto de operação, não
// ficha de RH. Bloco "Agora" (handoffs/feedbacks vivos deste corretor) +
// "Histórico do aceite" (timeline de ofertas, aceites, expirações e
// feedbacks). Mock honesto: tudo derivado dos mocks de handoff, nada executa.

const TONE_ACCENT: Record<OperationEvent["tone"], YziImobRole> = {
  neutral: "graphite",
  positive: "coldGreen",
  attention: "amber",
};

export function BrokerOperationTab({ brokerId }: { brokerId: string }) {
  const liveItems = brokerLiveItems(brokerId);
  const timeline = brokerOperationTimeline(brokerId);

  return (
    <div className="flex flex-col gap-7">
      <WorkspaceSection
        first
        title="Agora"
        description="Handoffs e feedbacks esperando decisão deste corretor."
      >
        {liveItems.length > 0 ? (
          <AttentionQueue items={liveItems} />
        ) : (
          <p className="text-[0.8rem] text-[var(--yzi-text-secondary)]">
            Nada esperando decisão deste corretor.
          </p>
        )}
      </WorkspaceSection>

      <WorkspaceSection
        title="Histórico do aceite"
        description="Ofertas, aceites, prazos expirados e feedbacks — tudo fica registrado."
      >
        {timeline.length > 0 ? (
          <ol className="flex flex-col gap-3">
            {timeline.map((event) => (
              <li key={event.id} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: imobRgba(TONE_ACCENT[event.tone], 0.9) }}
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="text-[0.8rem] leading-relaxed text-[var(--yzi-text-primary)]">
                    {event.text}
                  </p>
                  <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">
                    {event.atLabel}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[0.8rem] text-[var(--yzi-text-secondary)]">
            Nenhum handoff registrado ainda para este corretor.
          </p>
        )}
      </WorkspaceSection>
    </div>
  );
}
