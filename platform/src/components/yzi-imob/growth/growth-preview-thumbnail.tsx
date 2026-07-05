"use client";

import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";
import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";

export function GrowthThumbnail({
  palette,
  active,
  wide = false,
}: {
  palette: [YziImobRole, YziImobRole];
  active: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={cx(
        "relative shrink-0 overflow-hidden rounded-[var(--yzi-radius-sm)] border",
        wide ? "h-16 w-16" : "h-16 w-12",
        active ? "border-[rgba(var(--imob-ice),0.5)]" : "border-[color:var(--yzi-border-subtle)]",
      )}
      style={{
        background: `linear-gradient(145deg, ${imobRgba(palette[0], 0.26)}, ${imobRgba(
          palette[1],
          0.1,
        )}), var(--yzi-surface-elevated)`,
      }}
    >
      <div className="absolute inset-x-2 top-2 h-5 rounded bg-white/10" />
      <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1">
        <span className="h-1 rounded bg-white/30" />
        <span className="h-1 w-2/3 rounded bg-white/15" />
      </div>
    </div>
  );
}

