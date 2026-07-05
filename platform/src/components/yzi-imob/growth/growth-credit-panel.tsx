"use client";

import { AuthorizationIcon } from "@/components/yzi-os/yzi-icons";

import { GrowthDetailRow } from "./growth-inspector";

export function GrowthCreditPanel({
  title = "Confirmar custo da nova versão",
  rows,
  note = "Estado visual mockado. Nenhuma geração real foi executada.",
}: {
  title?: string;
  rows: Array<{ label: string; value: string }>;
  note?: string;
}) {
  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-[rgba(var(--imob-ice),0.22)] bg-[rgba(var(--imob-cold),0.07)] p-4">
      <div className="mb-3 flex items-center gap-2 text-[0.82rem] font-semibold text-[var(--yzi-text-primary)]">
        <AuthorizationIcon className="h-4 w-4 text-[rgb(var(--imob-ice))]" />
        {title}
      </div>
      <div className="grid grid-cols-2 gap-2 text-[0.76rem]">
        {rows.map((row) => (
          <GrowthDetailRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
      <p className="mt-3 text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">{note}</p>
    </div>
  );
}

