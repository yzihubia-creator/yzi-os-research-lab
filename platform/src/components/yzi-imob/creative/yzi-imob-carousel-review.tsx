"use client";

import { useEffect, useMemo, useState } from "react";

import { decideCreativeRevisionAction } from "@/app/cockpit/yzi-imob/imoveis/[id]/creative/actions";
import { YziAlert, YziButton, YziPanel, YziStatusBadge } from "@/components/yzi-os/yzi-primitives";
import type { CarouselCard, CarouselEditorialPlan } from "@/lib/yzi-imob/creative/carousel/types";
import type { CreativeRevision } from "@/lib/yzi-imob/creative/types";

type MediaPreview = { id: string; url: string | null; altText: string | null };

const REVISION_STATUS_LABEL: Record<CreativeRevision["status"], string> = {
  in_review: "Aguardando aprovação",
  approved: "Aprovada",
  changes_requested: "Ajuste solicitado",
  rejected: "Reprovada",
  superseded: "Substituída",
};

const ROLE_LABELS: Record<CarouselCard["role"], string> = {
  cover: "Capa",
  core_experience: "Experiência",
  primary_space: "Ambiente",
  differentiators: "Diferenciais",
  location_context: "Localização",
  essential_facts: "Ficha",
  closing: "Encerramento",
};

function Artwork({
  card,
  media,
  compact = false,
}: {
  card: CarouselCard;
  media: MediaPreview | null;
  compact?: boolean;
}) {
  return (
    <div
      className="relative isolate aspect-[4/5] w-full overflow-hidden rounded-[var(--yzi-radius-md)] bg-[#101924] text-white"
      aria-label={`Card ${card.position}: ${ROLE_LABELS[card.role]}`}
    >
      {media?.url ? (
        // Canonical, tenant/property-scoped URL from yzi_imob_property_media.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.url}
          alt={media.altText ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,18,0.08),rgba(7,12,18,0.9))]" />
      <div className={compact ? "absolute inset-x-3 bottom-3" : "absolute inset-x-[8%] bottom-[8%]"}>
        <p className={compact ? "text-[0.5rem] uppercase tracking-[0.14em] text-white/70" : "text-xs uppercase tracking-[0.18em] text-white/70"}>
          {String(card.position).padStart(2, "0")} · {ROLE_LABELS[card.role]}
        </p>
        <h3 className={compact ? "mt-1 line-clamp-2 text-xs font-semibold leading-tight" : "mt-3 max-w-[90%] text-3xl font-semibold leading-[1.05] sm:text-4xl"}>
          {card.headline}
        </h3>
        {!compact && card.body ? (
          <p className="mt-4 max-w-[88%] text-sm leading-relaxed text-white/80">{card.body}</p>
        ) : null}
        {!compact && card.facts.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {card.facts.slice(0, 5).map((fact) => (
              <span key={`${fact.key}-${fact.displayValue}`} className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-xs">
                {fact.displayValue}
              </span>
            ))}
          </div>
        ) : null}
        {!compact ? (
          <p className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/65">
            YZI IMOB
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function YziImobCarouselReview({
  propertyId,
  revision,
  plan,
  media,
  canDecide,
}: {
  propertyId: string;
  revision: CreativeRevision;
  plan: CarouselEditorialPlan;
  media: readonly MediaPreview[];
  canDecide: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const mediaById = useMemo(() => new Map(media.map((item) => [item.id, item])), [media]);
  const card = plan.cards[selected] ?? plan.cards[0];

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
      if (event.key === "ArrowLeft") setSelected((value) => Math.max(0, value - 1));
      if (event.key === "ArrowRight") setSelected((value) => Math.min(6, value + 1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  if (!card) {
    return <YziAlert tone="blocked" title="Preview indisponível">O plano não contém os sete cards esperados.</YziAlert>;
  }

  const blocking = plan.diagnostics.filter((item) => item.severity === "blocking");
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <YziPanel className="p-3 sm:p-5">
          <div className="mx-auto max-w-[31rem]">
            <Artwork card={card} media={card.mediaId ? mediaById.get(card.mediaId) ?? null : null} />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--yzi-text-secondary)]">
              Card {selected + 1} de 7 · feed 4:5
            </p>
            <YziButton size="sm" variant="ghost" onClick={() => setExpanded(true)}>
              Ampliar preview
            </YziButton>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2" aria-label="Ordem dos cards">
            {plan.cards.map((item, index) => (
              <button
                key={item.position}
                type="button"
                onClick={() => setSelected(index)}
                aria-current={selected === index}
                className={selected === index ? "rounded-[var(--yzi-radius-sm)] ring-2 ring-[var(--yzi-accent-action)]" : "rounded-[var(--yzi-radius-sm)] opacity-65 hover:opacity-100"}
              >
                <Artwork card={item} media={item.mediaId ? mediaById.get(item.mediaId) ?? null : null} compact />
              </button>
            ))}
          </div>
        </YziPanel>

        <YziPanel variant={plan.approvalBlocked ? "risk" : "authorization"} className="h-fit">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">Decisão humana</p>
            <YziStatusBadge tone={revision.status === "approved" ? "opportunity" : plan.approvalBlocked ? "blocked" : "authorization"}>
              {REVISION_STATUS_LABEL[revision.status]}
            </YziStatusBadge>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            A YZI organizou fatos, mídias e copy. Nenhum canal externo foi acionado.
          </p>
          {blocking.length ? (
            <YziAlert className="mt-4" tone="blocked" title="Aprovação bloqueada">
              {blocking.map((item) => item.message).join(" ")}
            </YziAlert>
          ) : null}
          {["in_review", "changes_requested"].includes(revision.status) && canDecide ? (
            <div className="mt-5 flex flex-col gap-4">
              {revision.status === "in_review" ? (
                <form action={decideCreativeRevisionAction}>
                  <input type="hidden" name="propertyId" value={propertyId} />
                  <input type="hidden" name="revisionId" value={revision.id} />
                  <input type="hidden" name="deliverableType" value="carousel" />
                  <input type="hidden" name="decision" value="approved" />
                  <YziButton type="submit" variant="authorization" className="w-full" disabled={plan.approvalBlocked}>
                    Aprovar carrossel
                  </YziButton>
                </form>
              ) : null}
              <form action={decideCreativeRevisionAction} className="flex flex-col gap-3">
                <input type="hidden" name="propertyId" value={propertyId} />
                <input type="hidden" name="revisionId" value={revision.id} />
                <input type="hidden" name="deliverableType" value="carousel" />
                <input type="hidden" name="decision" value="changes_requested" />
                <input
                  type="hidden"
                  name="idempotencyKey"
                  value={`carousel-revision:${revision.id}:${revision.contentHash.slice(0, 16)}`}
                />
                <label className="text-xs text-[var(--yzi-text-secondary)]">
                  Ajuste
                  <select name="adjustmentKind" defaultValue="shorten_headline" className="mt-1 w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                    <option value="shorten_headline">Reduzir headline</option>
                    <option value="swap_media">Trocar imagem</option>
                    <option value="remove_fact">Retirar informação</option>
                    <option value="change_cta">Alterar CTA</option>
                    <option value="correct_fact">Reler dado canônico</option>
                  </select>
                </label>
                <label className="text-xs text-[var(--yzi-text-secondary)]">
                  Card
                  <select name="cardPosition" defaultValue={selected + 1} className="mt-1 w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                    {plan.cards.map((item) => <option key={item.position} value={item.position}>{item.position} · {ROLE_LABELS[item.role]}</option>)}
                  </select>
                </label>
                <label className="text-xs text-[var(--yzi-text-secondary)]">
                  Outra mídia aprovada (opcional)
                  <select name="replacementMediaId" defaultValue="" className="mt-1 w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm">
                    <option value="">Manter mídia atual</option>
                    {media.map((item, index) => <option key={item.id} value={item.id}>Imagem {index + 1}</option>)}
                  </select>
                </label>
                <textarea name="observation" required maxLength={500} rows={3} placeholder="Descreva o ajuste editorial" className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm" />
                <YziButton type="submit" variant="secondary">Pedir ajuste</YziButton>
              </form>
              {revision.status === "in_review" ? (
                <form action={decideCreativeRevisionAction}>
                  <input type="hidden" name="propertyId" value={propertyId} />
                  <input type="hidden" name="revisionId" value={revision.id} />
                  <input type="hidden" name="deliverableType" value="carousel" />
                  <input type="hidden" name="decision" value="rejected" />
                  <input type="hidden" name="observation" value="Revisão reprovada na análise humana." />
                  <YziButton type="submit" variant="danger" className="w-full">Reprovar</YziButton>
                </form>
              ) : null}
            </div>
          ) : null}
        </YziPanel>
      </div>

      <YziPanel>
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">Caption preparada</p>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
          {plan.caption.text}
        </p>
        {plan.caption.hashtags.length ? <p className="mt-3 text-xs text-[var(--yzi-accent-trust)]">{plan.caption.hashtags.join(" ")}</p> : null}
      </YziPanel>

      {expanded ? (
        <div role="dialog" aria-modal="true" aria-label="Preview ampliado do carrossel" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5">
          <div className="w-full max-w-[36rem]">
            <Artwork card={card} media={card.mediaId ? mediaById.get(card.mediaId) ?? null : null} />
            <div className="mt-3 flex items-center justify-between">
              <YziButton size="sm" variant="ghost" disabled={selected === 0} onClick={() => setSelected((value) => value - 1)}>Anterior</YziButton>
              <p className="text-sm text-white">{selected + 1} de 7</p>
              <YziButton size="sm" variant="ghost" disabled={selected === 6} onClick={() => setSelected((value) => value + 1)}>Próximo</YziButton>
            </div>
            <YziButton className="mt-3 w-full" variant="secondary" onClick={() => setExpanded(false)}>Fechar</YziButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
