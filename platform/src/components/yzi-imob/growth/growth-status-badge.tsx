"use client";

import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";

import type { GrowthStatusAccent } from "./types";

export function GrowthStatusBadge({
  status,
  accents,
}: {
  status: string;
  accents: GrowthStatusAccent;
}) {
  const role = accents[status] ?? "neutral";

  return (
    <span
      className="inline-flex w-fit items-center gap-1.5 rounded-[var(--yzi-radius-sm)] border px-2.5 py-1 text-[0.66rem] font-medium shadow-[var(--yzi-edge-highlight)]"
      style={{
        color: imobRgba(role, 0.98),
        borderColor: imobRgba(role, 0.34),
        backgroundColor: imobRgba(role, 0.12),
      }}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: imobRgba(role, 0.9) }} />
      {status}
    </span>
  );
}
