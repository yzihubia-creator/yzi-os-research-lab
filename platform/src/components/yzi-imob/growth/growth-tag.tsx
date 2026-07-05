"use client";

export function GrowthTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] px-3 py-1 text-[0.7rem] text-[var(--yzi-text-secondary)]">
      {children}
    </span>
  );
}

