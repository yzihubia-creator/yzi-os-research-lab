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
        "relative shrink-0 overflow-hidden rounded-[var(--yzi-radius-sm)] border shadow-[var(--yzi-edge-highlight)]",
        wide ? "h-16 w-16" : "h-16 w-12",
        active ? "border-[rgba(var(--imob-ice),0.5)]" : "border-[color:var(--yzi-border-subtle)]",
      )}
      style={{
        background: `linear-gradient(160deg, rgba(255,255,255,0.12), transparent 22%), linear-gradient(145deg, ${imobRgba(
          palette[0],
          0.32,
        )}, ${imobRgba(palette[1], 0.12)} 58%, rgba(8,12,18,0.98))`,
      }}
    >
      <div className="absolute inset-x-1.5 top-1.5 h-7 overflow-hidden rounded-[5px] border border-white/10 bg-black/20">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.03))]" />
        <div className="absolute -bottom-2 left-1 h-5 w-7 rounded-t-full bg-black/30" />
        <div className="absolute bottom-1 right-1 h-3 w-4 rounded-sm bg-white/14" />
      </div>
      <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1.5">
        <span className="h-1 rounded bg-white/38" />
        <span className="h-1 w-2/3 rounded bg-white/18" />
        <span className="h-1 w-1/2 rounded bg-white/12" />
      </div>
    </div>
  );
}
