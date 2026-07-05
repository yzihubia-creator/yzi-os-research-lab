"use client";

import { GrowthProgress } from "./growth-progress";
import { GrowthStatusBadge } from "./growth-status-badge";
import { GrowthTag } from "./growth-tag";
import { GrowthThumbnail } from "./growth-preview-thumbnail";
import type { GrowthProperty, GrowthStatusAccent } from "./types";

export function GrowthPropertyCard({
  property,
  accents,
}: {
  property: GrowthProperty;
  accents: GrowthStatusAccent;
}) {
  return (
    <article className="flex gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-3">
      <GrowthThumbnail palette={property.palette} active={false} wide />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">{property.name}</h3>
            <p className="truncate text-[0.72rem] text-[var(--yzi-text-secondary)]">{property.location}</p>
          </div>
          <GrowthStatusBadge status={property.status} accents={accents} />
        </div>
        <p className="mt-2 line-clamp-2 text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">{property.summary}</p>
        <div className="mt-3">
          <GrowthProgress label="Prontidão" value={property.readiness} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {property.tags.map((tag) => (
            <GrowthTag key={tag}>{tag}</GrowthTag>
          ))}
        </div>
      </div>
    </article>
  );
}

