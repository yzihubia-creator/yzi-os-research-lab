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
  imageSrc,
}: {
  title: string;
  subtitle: string;
  meta: ReactNode;
  status: string;
  accents: GrowthStatusAccent;
  palette: [YziImobRole, YziImobRole];
  active: boolean;
  onSelect: () => void;
  imageSrc?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "yzi-growth-card-hover flex w-full gap-3 rounded-[var(--yzi-radius-md)] border p-3.5 text-left",
        active
          ? "border-[rgba(var(--imob-ice),0.34)] bg-[rgba(var(--imob-cold),0.1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-[rgba(var(--imob-graphite),0.28)] bg-[rgba(17,22,31,0.72)]",
      )}
    >
      <GrowthThumbnail palette={palette} active={active} imageSrc={imageSrc} />
      <span className="flex min-w-0 flex-1 flex-col gap-2.5">
        <span className="flex flex-col gap-2 min-[520px]:flex-row min-[520px]:items-start min-[520px]:justify-between">
          <span className="min-w-0">
            <span className="block truncate text-[0.88rem] font-semibold leading-snug text-[var(--yzi-text-primary)]">{title}</span>
            <span className="mt-0.5 block truncate text-[0.72rem] leading-snug text-[var(--yzi-text-secondary)]">{subtitle}</span>
          </span>
          <GrowthStatusBadge status={status} accents={accents} />
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[rgba(var(--imob-graphite),0.18)] pt-2 text-[0.68rem] leading-snug text-[var(--yzi-text-faint)]">{meta}</span>
      </span>
    </button>
  );
}
