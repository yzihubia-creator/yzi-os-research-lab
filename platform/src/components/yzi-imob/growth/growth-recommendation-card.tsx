"use client";

import { GrowthTag } from "./growth-tag";
import type { GrowthRecommendation } from "./types";

export function GrowthRecommendationCard({ recommendation }: { recommendation: GrowthRecommendation }) {
  return (
    <article className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[0.92rem] font-semibold text-[var(--yzi-text-primary)]">{recommendation.title}</h3>
        <GrowthTag>{recommendation.confidence}</GrowthTag>
      </div>
      <p className="mt-2 text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">{recommendation.rationale}</p>
      <p className="mt-3 text-[0.76rem] text-[var(--yzi-text-primary)]">{recommendation.nextAction}</p>
    </article>
  );
}

