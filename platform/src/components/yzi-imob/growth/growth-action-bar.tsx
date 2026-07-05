"use client";

import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";
import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";

import { GrowthStatusBadge } from "./growth-status-badge";
import type { GrowthAction, GrowthStatusAccent } from "./types";

export function GrowthActionBar({ actions }: { actions: GrowthAction[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={action.disabled}
          onClick={action.onClick}
          className={cx(
            "rounded-[var(--yzi-radius-sm)] border px-3 py-2 text-[0.78rem] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            action.tone === "primary"
              ? "border-[rgba(var(--imob-ice),0.34)] bg-[rgba(var(--imob-cold),0.14)] font-medium text-[var(--yzi-text-primary)] hover:bg-[rgba(var(--imob-cold),0.2)]"
              : action.tone === "danger"
                ? "hover:bg-[rgba(196,108,108,0.12)]"
                : "border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-secondary)] hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]",
          )}
          style={
            action.tone === "danger"
              ? {
                  color: imobRgba("coldRed", 0.96),
                  borderColor: imobRgba("coldRed", 0.28),
                }
              : undefined
          }
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

export function GrowthApprovalActions({
  status,
  accents,
  onVersion,
  onAdjust,
}: {
  status: string;
  accents: GrowthStatusAccent;
  onVersion: () => void;
  onAdjust: () => void;
}) {
  return (
    <section className="yzi-lens flex flex-col gap-4 rounded-[var(--yzi-radius-lg)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">Aprovação</h2>
          <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
            Decisão visual mockada. Nada será publicado ou gerado.
          </p>
        </div>
        <GrowthStatusBadge status={status} accents={accents} />
      </div>

      <GrowthActionBar
        actions={[
          { id: "approve", label: "Aprovar", tone: "primary" },
          { id: "version", label: "Nova versão", onClick: onVersion },
          { id: "adjust", label: "Solicitar ajuste", onClick: onAdjust },
          { id: "reject", label: "Rejeitar", tone: "danger" },
        ]}
      />
    </section>
  );
}

