"use client";

import { GrowthStatusBadge } from "./growth-status-badge";
import { GrowthThumbnail } from "./growth-preview-thumbnail";
import type { GrowthCollection, GrowthStatusAccent } from "./types";

export function GrowthCollectionCard({
  collection,
  accents,
}: {
  collection: GrowthCollection;
  accents: GrowthStatusAccent;
}) {
  return (
    <article className="flex gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-3">
      <GrowthThumbnail palette={collection.palette} active={false} wide />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">{collection.name}</h3>
            <p className="truncate text-[0.72rem] text-[var(--yzi-text-secondary)]">{collection.subtitle}</p>
          </div>
          <GrowthStatusBadge status={collection.status} accents={accents} />
        </div>
        <p className="mt-2 line-clamp-2 text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          {collection.reusableReason}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] text-[var(--yzi-text-faint)]">
          <span>{collection.packages.length} packages</span>
          <span aria-hidden>·</span>
          <span>{collection.campaigns.length} campanhas</span>
        </div>
      </div>
    </article>
  );
}

