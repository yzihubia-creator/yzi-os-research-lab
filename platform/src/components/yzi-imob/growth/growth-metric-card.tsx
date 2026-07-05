"use client";

export function GrowthMetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4 shadow-[var(--yzi-edge-highlight)]">
      <span className="text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[var(--yzi-text-faint)]">{label}</span>
      <p className="mt-2 text-[1.6rem] font-semibold leading-none tracking-tight text-[var(--yzi-text-primary)] tabular-nums">
        {value}
      </p>
      {detail ? <p className="mt-2 text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">{detail}</p> : null}
    </div>
  );
}

