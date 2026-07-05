"use client";

import { GrowthTag } from "./growth-tag";
import type { GrowthEvidence } from "./types";

export function GrowthEvidenceCard({ evidence }: { evidence: GrowthEvidence }) {
  return (
    <article className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[0.86rem] font-semibold text-[var(--yzi-text-primary)]">{evidence.title}</h3>
        <GrowthTag>{evidence.confidence}</GrowthTag>
      </div>
      <p className="mt-2 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">{evidence.detail}</p>
      <p className="mt-3 text-[0.66rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">{evidence.source}</p>
    </article>
  );
}

