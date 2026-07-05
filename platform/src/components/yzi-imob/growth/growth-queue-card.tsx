"use client";

import type { ReactNode } from "react";

import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import type { YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";

import { GrowthStatusBadge } from "./growth-status-badge";
import { GrowthThumbnail } from "./growth-preview-thumbnail";
import type { GrowthStatusAccent } from "./types";

export function GrowthQueueCard({
  title,
  subtitle,
  meta,
  status,
  accents,
  palette,
  active,
  onSelect,
}: {
  title: string;
  subtitle: string;
  meta: ReactNode;
  status: string;
  accents: GrowthStatusAccent;
  palette: [YziImobRole, YziImobRole];
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "flex w-full gap-3 rounded-[var(--yzi-radius-md)] border p-3 text-left transition-colors",
        active
          ? "border-[rgba(var(--imob-ice),0.34)] bg-[rgba(var(--imob-cold),0.08)]"
          : "border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] hover:bg-[var(--yzi-surface-elevated)]",
      )}
    >
      <GrowthThumbnail palette={palette} active={active} />
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">{title}</span>
            <span className="block truncate text-[0.72rem] text-[var(--yzi-text-secondary)]">{subtitle}</span>
          </span>
          <GrowthStatusBadge status={status} accents={accents} />
        </span>
        <span className="flex flex-wrap items-center gap-2 text-[0.68rem] text-[var(--yzi-text-faint)]">{meta}</span>
      </span>
    </button>
  );
}

