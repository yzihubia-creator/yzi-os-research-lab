"use client";

import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";

export function GrowthStat({
  label,
  value,
  role = "primary",
}: {
  label: string;
  value: string;
  role?: YziImobRole;
}) {
  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] p-3">
      <span className="text-[0.62rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">{label}</span>
      <p className="mt-1 text-[1.35rem] font-semibold leading-none tabular-nums" style={{ color: imobRgba(role, 0.94) }}>
        {value}
      </p>
    </div>
  );
}

