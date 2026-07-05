"use client";

export function GrowthProgress({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-[0.72rem]">
        <span className="text-[var(--yzi-text-secondary)]">{label}</span>
        <span className="tabular-nums text-[var(--yzi-text-primary)]">{normalized}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--yzi-surface-elevated)]">
        <span className="block h-full rounded-full bg-[rgb(var(--imob-ice))]" style={{ width: `${normalized}%` }} />
      </div>
    </div>
  );
}

