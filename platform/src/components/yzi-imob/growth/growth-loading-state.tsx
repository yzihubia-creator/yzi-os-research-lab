"use client";

export function GrowthLoadingState({ label = "Carregando estado mockado" }: { label?: string }) {
  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4 text-[0.78rem] text-[var(--yzi-text-secondary)]">
      {label}
    </div>
  );
}

