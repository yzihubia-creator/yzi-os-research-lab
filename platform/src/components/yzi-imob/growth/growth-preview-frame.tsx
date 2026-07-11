"use client";

import Image from "next/image";

import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";
import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";

function formatClass(format: string) {
  if (format === "Site" || format === "Coleção") return "aspect-[16/10] w-full max-w-[760px]";
  if (format === "Meta Feed" || format === "Carrossel") return "aspect-square w-full max-w-[500px]";
  return "aspect-[9/16] h-[clamp(390px,56vh,600px)] w-auto";
}

function motionLabel(format: string) {
  if (format === "Reel" || format === "Story") return "Video preview";
  if (format === "Carrossel") return "Carousel preview";
  if (format === "Site" || format === "Coleção") return "Page preview";
  return "Post preview";
}

export function GrowthPreviewFrame({
  channel,
  format,
  palette,
  headline,
  supportingText,
  badges,
  imageSrc,
}: {
  channel: string;
  format: string;
  palette: [YziImobRole, YziImobRole];
  headline: string;
  supportingText: string;
  badges: string[];
  imageSrc?: string;
}) {
  const isWide = format === "Site" || format === "Meta Feed" || format === "Carrossel" || format === "Coleção";
  const isMotion = format === "Reel" || format === "Story";

  return (
    <div className="yzi-growth-card flex min-h-[480px] flex-col gap-4 rounded-[var(--yzi-radius-lg)] border p-4 min-[1720px]:min-h-[540px] min-[1720px]:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[rgba(var(--imob-cyan),0.88)]">
            {motionLabel(format)}
          </span>
          <span className="text-[0.78rem] text-[var(--yzi-text-secondary)]">Mock visual declarado / sem render real</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {["motion: preparado", "render: offline", "voice: roteiro"].map((item) => (
            <span
              key={item}
              className="rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-graphite),0.36)] bg-[rgba(var(--imob-graphite),0.12)] px-2.5 py-1 text-[0.66rem] text-[var(--yzi-text-secondary)]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-[var(--yzi-radius-md)] border border-[rgba(var(--imob-ice),0.1)] bg-[radial-gradient(circle_at_50%_0%,rgba(var(--imob-cold),0.12),transparent_38%),rgba(4,7,12,0.42)] p-3 sm:p-5">
        <div
          className={cx("relative overflow-hidden rounded-[24px] border border-white/15 shadow-2xl", formatClass(format))}
          style={{
            background: `linear-gradient(160deg, rgba(255,255,255,0.16), transparent 20%), linear-gradient(145deg, ${imobRgba(
              palette[0],
              0.44,
            )}, ${imobRgba(palette[1], 0.2)} 54%, rgba(7,10,16,0.98))`,
          }}
        >
          <div className="absolute left-5 right-5 top-5 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.14em] text-white/62">
            <span>{channel}</span>
            <span>{format}</span>
          </div>

          <div
            className={cx(
              "absolute overflow-hidden rounded-[20px] border border-white/12 bg-black/22",
              isWide ? "left-7 right-7 top-14 h-[44%]" : "left-6 right-6 top-16 h-[44%]",
            )}
          >
            {imageSrc ? (
              <>
                <Image
                  src={imageSrc}
                  alt="Mídia de demonstração do imóvel"
                  fill
                  sizes="(max-width: 768px) 100vw, 760px"
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 h-1/2 w-full bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.42))]" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.035)_42%,rgba(0,0,0,0.16))]" />
                <div className="absolute bottom-0 left-0 h-1/2 w-full bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.42))]" />
                <div className="absolute bottom-5 left-5 h-12 w-24 rounded-t-full bg-black/28" />
                <div className="absolute bottom-5 right-5 h-16 w-20 rounded-[10px] border border-white/10 bg-white/12" />
              </>
            )}
            <div className="absolute left-5 top-5 rounded-[var(--yzi-radius-sm)] bg-black/24 px-2 py-1 text-[0.58rem] uppercase tracking-[0.12em] text-white/58">
              imóvel mockado
            </div>
          </div>

          {format === "Carrossel" ? (
            <div className="absolute right-7 top-[54%] flex gap-1.5">
              {[0, 1, 2, 3].map((item) => (
                <span key={item} className={cx("h-1.5 rounded-full", item === 0 ? "w-6 bg-white/70" : "w-1.5 bg-white/24")} />
              ))}
            </div>
          ) : null}

          {isMotion ? (
            <div className="absolute bottom-5 left-6 right-6 flex items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-white/10 bg-black/22 px-2.5 py-2">
              <span className="h-6 w-6 rounded-full border border-white/20 bg-white/12" />
              <span className="h-1.5 flex-1 rounded bg-white/16">
                <span className="block h-1.5 w-2/5 rounded bg-white/50" />
              </span>
              <span className="font-mono text-[0.58rem] text-white/55">00:12</span>
            </div>
          ) : null}

          <div className={cx("absolute flex flex-col", isWide ? "bottom-8 left-8 right-8" : "bottom-16 left-6 right-6")}>
            <span className="mb-3 w-fit rounded-[var(--yzi-radius-sm)] border border-white/16 bg-black/28 px-3 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-white/72">
              Preview mock
            </span>
            <h2 className="text-balance text-[clamp(1.35rem,4vw,3rem)] font-semibold leading-[1.02] text-white">
              {headline}
            </h2>
            <p className="mt-3 max-w-lg text-[0.82rem] leading-relaxed text-white/68">{supportingText}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span key={badge} className="rounded-[var(--yzi-radius-sm)] bg-white/12 px-3 py-1 text-[0.66rem] text-white/72">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
