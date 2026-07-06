"use client";

import type { ReactNode } from "react";

export function GrowthDetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(var(--imob-graphite),0.2)] py-2.5 last:border-b-0">
      <span className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">{label}</span>
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
    <section className="yzi-growth-card rounded-[var(--yzi-radius-lg)] border p-4">
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(var(--imob-graphite),0.22)] pb-3">
        <div className="flex flex-col gap-1">
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.16em] text-[rgba(var(--imob-cyan),0.82)]">
            reasoning panel
          </span>
          <h2 className="text-[0.98rem] font-semibold text-[var(--yzi-text-primary)]">{title}</h2>
        </div>
        <span className="h-2 w-2 rounded-full bg-[rgba(var(--imob-cyan),0.86)] shadow-[0_0_18px_rgba(var(--imob-cyan),0.42)]" />
      </div>
      <div className="mt-2 flex flex-col divide-y divide-[rgba(var(--imob-graphite),0.18)] text-[0.77rem] leading-relaxed">
        {sections.map((section) => (
          <div key={section.label} className="py-2.5 first:pt-2">
            <span className="block text-[0.6rem] font-medium uppercase tracking-[0.13em] text-[var(--yzi-text-faint)]">
              {section.label}
            </span>
            <div className="mt-1.5 text-[var(--yzi-text-secondary)]">{section.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-graphite),0.26)] bg-[rgba(var(--imob-graphite),0.1)] px-3 py-2.5 text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
        {note}
      </p>
    </section>
  );
}

export const GrowthInspectorPanel = GrowthInspector;
