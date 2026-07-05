"use client";

import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";

export function GrowthErrorState({
  title = "Estado indisponível",
  detail,
}: {
  title?: string;
  detail: string;
}) {
  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-[rgba(196,108,108,0.28)] bg-[rgba(196,108,108,0.08)] p-4 text-[0.78rem]">
      <p className="font-medium" style={{ color: imobRgba("coldRed", 0.96) }}>
        {title}
      </p>
      <p className="mt-1 text-[var(--yzi-text-secondary)]">{detail}</p>
    </div>
  );
}
