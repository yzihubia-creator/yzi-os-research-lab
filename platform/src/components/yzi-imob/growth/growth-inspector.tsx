"use client";

import type { ReactNode } from "react";

export function GrowthDetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[color:var(--yzi-border-subtle)] py-2.5 last:border-b-0">
      <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">{label}</span>
      <span className="text-right text-[0.8rem] text-[var(--yzi-text-primary)]">{value}</span>
    </div>
  );
}

export function GrowthInspector({
  title = "Inspector YZI",
  sections,
  note,
}: {
  title?: string;
  sections: Array<{ label: string; value: ReactNode }>;
  note: string;
}) {
  return (
    <section className="rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4 shadow-[var(--yzi-edge-highlight)]">
      <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-[0.78rem] leading-relaxed">
        {sections.map((section) => (
          <div key={section.label}>
            <span className="block text-[0.62rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
              {section.label}
            </span>
            <div className="mt-1 text-[var(--yzi-text-secondary)]">{section.value}</div>
          </div>
        ))}
        <p className="border-t border-[color:var(--yzi-border-subtle)] pt-3 text-[0.7rem] text-[var(--yzi-text-faint)]">
          {note}
        </p>
      </div>
    </section>
  );
}

export const GrowthInspectorPanel = GrowthInspector;

