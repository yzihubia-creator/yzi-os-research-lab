"use client";

import Image from "next/image";

import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";
import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";

import type { DemoMediaItem } from "@/lib/yzi-imob/demo-media/mock-demo-media";

// Card puramente visual (sem onClick funcional, sem estado) para representar
// mídia mockada em grids (Biblioteca/Campanhas). Segue o mesmo padrão visual
// de GrowthPreviewFrame/GrowthThumbnail/MockFrame do Studio: quando o item
// traz imageSrc (pack demo local), a imagem preenche o card sob um scrim;
// sem imagem, mantém o gradiente via imobRgba como fallback.

function aspectClass(format: DemoMediaItem["format"]) {
  if (format === "9:16") return "aspect-[9/16]";
  if (format === "1:1") return "aspect-square";
  if (format === "4:5") return "aspect-[4/5]";
  if (format === "16:9") return "aspect-video";
  return "aspect-[16/10]";
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
    </svg>
  );
}

export function GrowthDemoMediaCard({
  item,
  size = "md",
  palette,
}: {
  item: DemoMediaItem;
  size?: "sm" | "md";
  palette?: [YziImobRole, YziImobRole];
}) {
  const resolvedPalette = palette ?? item.palette;
  const isMotion = item.type === "reel" || item.type === "story";

  return (
    <article
      className={cx(
        "relative overflow-hidden rounded-[var(--yzi-radius-md)] border border-white/12 shadow-[var(--yzi-edge-highlight)]",
        aspectClass(item.format),
        size === "sm" ? "w-full max-w-[168px]" : "w-full max-w-[240px]",
      )}
      style={{
        background: `linear-gradient(155deg, rgba(255,255,255,0.15), transparent 24%), linear-gradient(145deg, ${imobRgba(
          resolvedPalette[0],
          0.42,
        )}, ${imobRgba(resolvedPalette[1], 0.18)} 56%, rgba(8,12,18,0.97))`,
      }}
    >
      {item.imageSrc ? (
        <>
          <Image
            src={item.imageSrc}
            alt={`${item.title} — mídia de demonstração`}
            fill
            sizes="240px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,9,14,0.42),rgba(6,9,14,0.06)_38%,rgba(6,9,14,0.68))]" />
        </>
      ) : null}
      <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-2 text-[0.56rem] uppercase tracking-[0.1em] text-white/60">
        <span className="truncate">{item.propertyName}</span>
      </div>

      {item.type === "carousel" && item.slideCount ? (
        <span className="absolute right-2.5 top-8 rounded-[var(--yzi-radius-sm)] bg-black/32 px-1.5 py-0.5 text-[0.58rem] font-medium text-white/75">
          1/{item.slideCount}
        </span>
      ) : null}

      {isMotion ? (
        <span className="absolute left-2.5 top-8 flex items-center gap-1 rounded-[var(--yzi-radius-sm)] bg-black/32 px-1.5 py-0.5 text-white/85">
          <PlayIcon />
          {item.duration ? <span className="font-mono text-[0.56rem] text-white/70">{item.duration}</span> : null}
        </span>
      ) : null}

      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-col gap-1.5">
        <span className="w-fit rounded-[var(--yzi-radius-sm)] bg-black/28 px-2 py-1 text-[0.58rem] uppercase tracking-[0.12em] text-white/62">
          {item.badge}
        </span>
        <h3 className={cx("font-semibold leading-tight text-white", size === "sm" ? "text-[0.76rem]" : "text-[0.86rem]")}>
          {item.title}
        </h3>
        {item.cta ? (
          <span className="w-fit text-[0.62rem] font-medium text-white/70 underline decoration-white/30 underline-offset-2">
            {item.cta}
          </span>
        ) : null}
      </div>
    </article>
  );
}
