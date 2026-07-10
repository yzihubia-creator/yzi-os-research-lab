"use client";

import { useEffect, useState } from "react";

import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";
import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";

import { GrowthPreviewFrame } from "./growth-preview-frame";
import { GrowthStatusBadge } from "./growth-status-badge";
import { GROWTH_ASSET_STATUS_ACCENT, type GrowthCreativeItem } from "./mock-growth-assets";
import { useGrowthCampaignState } from "./growth-campaign-state-context";
import type { GrowthAction } from "./types";

// Preview ampliado de uma peça dentro de uma campanha: mesa de decisão do
// gestor, não uma Asset Library. Copy completa, CTA e status sempre visíveis;
// aprovação e pedido de ajuste mudam estado só em memória (mock honesto).

export function GrowthPiecePreviewModal({
  pieces,
  activeId,
  onClose,
  onNavigate,
}: {
  pieces: GrowthCreativeItem[];
  activeId: string;
  onClose: () => void;
  onNavigate: (pieceId: string) => void;
}) {
  const { statusFor, noteFor, approvePiece, requestAdjustment } = useGrowthCampaignState();
  const index = pieces.findIndex((piece) => piece.id === activeId);
  const piece = pieces[index] ?? pieces[0];

  const [adjustMode, setAdjustMode] = useState(false);
  const [note, setNote] = useState(() => noteFor(piece.id) ?? "");

  // Reset por peça durante o render (padrão React para estado derivado de
  // prop), sem effect — trocar de peça fecha o modo de ajuste e recarrega a nota.
  const [prevPieceId, setPrevPieceId] = useState(piece.id);
  if (prevPieceId !== piece.id) {
    setPrevPieceId(piece.id);
    setAdjustMode(false);
    setNote(noteFor(piece.id) ?? "");
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && index < pieces.length - 1) onNavigate(pieces[index + 1].id);
      if (event.key === "ArrowLeft" && index > 0) onNavigate(pieces[index - 1].id);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, onClose, onNavigate, pieces]);

  if (!piece) return null;

  const status = statusFor(piece.id, piece.status);
  const savedNote = noteFor(piece.id);

  const actions: GrowthAction[] = [
    {
      id: "approve",
      label: "Aprovar",
      tone: "primary",
      onClick: () => {
        setAdjustMode(false);
        approvePiece(piece.id);
      },
    },
    {
      id: "adjust",
      label: "Pedir ajuste",
      onClick: () => setAdjustMode(true),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/72 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <span className="text-[0.72rem] text-white/60">
          Peça {index + 1} de {pieces.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar preview"
          className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/8 text-white/85 transition-colors hover:bg-white/16"
        >
          ✕
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-4 sm:px-6">
        {index > 0 ? (
          <button
            type="button"
            onClick={() => onNavigate(pieces[index - 1].id)}
            aria-label="Peça anterior"
            className="absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/8 text-white/85 transition-colors hover:bg-white/16 sm:left-4"
          >
            ‹
          </button>
        ) : null}
        {index < pieces.length - 1 ? (
          <button
            type="button"
            onClick={() => onNavigate(pieces[index + 1].id)}
            aria-label="Próxima peça"
            className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/8 text-white/85 transition-colors hover:bg-white/16 sm:right-4"
          >
            ›
          </button>
        ) : null}

        <div className="grid max-h-full w-full max-w-6xl min-h-0 grid-cols-1 gap-4 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-h-0">
            <GrowthPreviewFrame
              channel={piece.channel}
              format={piece.format}
              palette={piece.palette}
              headline={piece.headline}
              supportingText={piece.supportingText}
              badges={[piece.channel, piece.format]}
              imageSrc={piece.imageSrc}
            />
          </div>

          <div className="yzi-lens flex min-h-0 flex-col gap-4 rounded-[var(--yzi-radius-lg)] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[1.05rem] font-semibold leading-snug text-[var(--yzi-text-primary)]">
                {piece.name}
              </h2>
              <GrowthStatusBadge status={status} accents={GROWTH_ASSET_STATUS_ACCENT} />
            </div>

            <div className="flex flex-wrap gap-2 text-[0.68rem] text-[var(--yzi-text-secondary)]">
              <span className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-2 py-1">
                {piece.channel}
              </span>
              <span className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-2 py-1">
                {piece.format}
              </span>
              <span className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-2 py-1">
                {piece.property}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[0.64rem] font-medium uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
                Copy completa
              </span>
              <p className="text-[0.92rem] font-medium leading-snug text-[var(--yzi-text-primary)]">
                {piece.headline}
              </p>
              <p className="text-[0.82rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                {piece.supportingText}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[0.64rem] font-medium uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
                CTA sugerido
              </span>
              <p className="text-[0.82rem] leading-relaxed text-[var(--yzi-text-primary)]">{piece.cta}</p>
            </div>

            {piece.pendencies.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <span className="text-[0.64rem] font-medium uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
                  Pendências
                </span>
                <ul className="flex flex-col gap-1">
                  {piece.pendencies.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                      <span
                        aria-hidden
                        className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: imobRgba("amber", 0.85) }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-auto flex flex-col gap-3 border-t border-[color:var(--yzi-border-subtle)] pt-4">
              <div className="grid grid-cols-2 gap-2">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.onClick}
                    className={cx(
                      "rounded-[var(--yzi-radius-sm)] border px-3 py-2 text-[0.78rem] transition-[background,border-color,color,transform] duration-[var(--duration-fast)] active:translate-y-px",
                      action.tone === "primary"
                        ? "border-[rgba(var(--imob-ice),0.34)] bg-[rgba(var(--imob-cold),0.14)] font-medium text-[var(--yzi-text-primary)] hover:bg-[rgba(var(--imob-cold),0.22)]"
                        : "border-[rgba(var(--imob-graphite),0.3)] text-[var(--yzi-text-secondary)] hover:bg-[rgba(255,255,255,0.045)] hover:text-[var(--yzi-text-primary)]",
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {adjustMode ? (
                <div className="flex flex-col gap-2">
                  <label htmlFor="growth-piece-adjust-note" className="text-[0.7rem] text-[var(--yzi-text-secondary)]">
                    Descreva o ajuste necessário
                  </label>
                  <textarea
                    id="growth-piece-adjust-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder="Ex.: trocar o CTA, revisar a chamada de vista mar..."
                    className="w-full rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-bg-deep)] px-3 py-2 text-[0.8rem] text-[var(--yzi-text-primary)] outline-none placeholder:text-[var(--yzi-text-faint)]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      requestAdjustment(piece.id, note.trim());
                      setAdjustMode(false);
                    }}
                    disabled={note.trim().length === 0}
                    className="self-start rounded-[var(--yzi-radius-sm)] border px-3 py-1.5 text-[0.74rem] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      color: imobRgba("amber", 0.96),
                      borderColor: imobRgba("amber", 0.34),
                      backgroundColor: imobRgba("amber", 0.1),
                    }}
                  >
                    Enviar pedido de ajuste
                  </button>
                </div>
              ) : status === "Ajuste solicitado" && savedNote ? (
                <p className="text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                  <span className="font-medium text-[var(--yzi-text-primary)]">Nota de ajuste:</span> {savedNote}
                </p>
              ) : null}

              <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">
                Decisão mockada, sem publicação, sem cobrança e sem envio a Higgsfield, ElevenLabs, Metricool ou canal
                real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
