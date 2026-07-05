"use client";

import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";
import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";

export function GrowthPreviewFrame({
  channel,
  format,
  palette,
  headline,
  supportingText,
  badges,
}: {
  channel: string;
  format: string;
  palette: [YziImobRole, YziImobRole];
  headline: string;
  supportingText: string;
  badges: string[];
}) {
  const isWide = format === "Site" || format === "Meta Feed" || format === "Carrossel" || format === "Coleção";
  const frameClass =
    format === "Site" || format === "Coleção"
      ? "aspect-[16/10] w-full max-w-[760px]"
      : format === "Meta Feed" || format === "Carrossel"
        ? "aspect-square w-full max-w-[520px]"
        : "aspect-[9/16] h-[min(62vh,620px)] min-h-[440px] w-auto";

  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[radial-gradient(circle_at_50%_0%,rgba(var(--imob-cold),0.14),transparent_34%),var(--yzi-bg-deep)] p-6 shadow-[var(--yzi-edge-highlight)]">
      <div
        className={cx("relative overflow-hidden rounded-[28px] border border-white/15 shadow-2xl", frameClass)}
        style={{
          background: `linear-gradient(145deg, ${imobRgba(palette[0], 0.38)}, ${imobRgba(
            palette[1],
            0.18,
          )} 52%, rgba(9,12,18,0.96))`,
        }}
      >
        <div className="absolute left-5 right-5 top-5 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.16em] text-white/60">
          <span>{channel}</span>
          <span>{format}</span>
        </div>

        <div
          className={cx(
            "absolute rounded-[24px] border border-white/10 bg-white/[0.08]",
            isWide ? "left-8 right-8 top-16 h-[42%]" : "left-6 right-6 top-20 h-[46%]",
          )}
        >
          <div className="absolute inset-4 rounded-[18px] bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.03))]" />
          <div className="absolute bottom-5 left-5 right-5 flex gap-2">
            <span className="h-2 flex-1 rounded bg-white/35" />
            <span className="h-2 w-1/4 rounded bg-white/15" />
          </div>
        </div>

        <div className={cx("absolute flex flex-col", isWide ? "bottom-8 left-8 right-8" : "bottom-10 left-6 right-6")}>
          <span className="mb-3 w-fit rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-white/70">
            Preview
          </span>
          <h2 className="text-balance text-[clamp(1.35rem,4vw,3rem)] font-semibold leading-[0.98] text-white">
            {headline}
          </h2>
          <p className="mt-3 max-w-lg text-[0.82rem] leading-relaxed text-white/68">{supportingText}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="rounded-full bg-white/12 px-3 py-1 text-[0.66rem] text-white/72">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

