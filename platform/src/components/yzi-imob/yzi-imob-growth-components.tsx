"use client";

import type { ReactNode } from "react";

import {
  WorkspaceTabs,
  cx,
  type WorkspaceTab,
} from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";
import { AuthorizationIcon } from "@/components/yzi-os/yzi-icons";

export type GrowthSurface = "estrategia" | "conteudo" | "campanhas" | "biblioteca" | "resultados";

export const GROWTH_SURFACES: Array<WorkspaceTab & { id: GrowthSurface }> = [
  { id: "estrategia", label: "Estratégia", soon: true },
  { id: "conteudo", label: "Conteúdo" },
  { id: "campanhas", label: "Campanhas", soon: true },
  { id: "biblioteca", label: "Biblioteca", soon: true },
  { id: "resultados", label: "Resultados", soon: true },
];

export type GrowthCounter = {
  label: string;
  value: string;
  detail: string;
};

export type GrowthStatusAccent = Record<string, YziImobRole>;

export function GrowthSurfaceHeader({
  title,
  subtitle,
  tenantLabel = "tenant_id: tenant_mock_growth_001",
}: {
  title: string;
  subtitle: string;
  tenantLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-[var(--yzi-text-secondary)]">
        Growth OS · Mock operacional
      </span>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.01em] text-[var(--yzi-text-primary)]">
            {title}
          </h1>
          <p className="max-w-2xl text-[0.92rem] leading-relaxed text-[var(--yzi-text-secondary)]">
            {subtitle}
          </p>
        </div>
        <span className="rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-1.5 text-[0.7rem] text-[var(--yzi-text-secondary)] shadow-[var(--yzi-edge-highlight)]">
          {tenantLabel}
        </span>
      </div>
    </div>
  );
}

export function GrowthCounterStrip({ counters }: { counters: GrowthCounter[] }) {
  return (
    <div className="yzi-imob-strip grid w-full grid-cols-1 overflow-hidden sm:grid-cols-2 lg:grid-cols-5">
      {counters.map((counter, index) => (
        <div
          key={counter.label}
          className={cx(
            "flex flex-col gap-2 border-[color:var(--yzi-border-subtle)] px-5 py-4",
            index > 0 && "border-t sm:border-l sm:border-t-0",
            index === 4 && "lg:border-t-0",
          )}
        >
          <span className="text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[var(--yzi-text-faint)]">
            {counter.label}
          </span>
          <span className="text-[1.8rem] font-semibold leading-none tracking-tight text-[var(--yzi-text-primary)] tabular-nums">
            {counter.value}
          </span>
          <span className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-secondary)]">
            {counter.detail}
          </span>
        </div>
      ))}
    </div>
  );
}

export function GrowthNavigation({
  active,
  onChange,
  libraryAvailable = false,
}: {
  active: GrowthSurface;
  onChange: (id: GrowthSurface) => void;
  libraryAvailable?: boolean;
}) {
  const tabs = GROWTH_SURFACES.map((surface) =>
    surface.id === "biblioteca" && libraryAvailable
      ? { ...surface, soon: false }
      : surface,
  );

  return (
    <WorkspaceTabs
      tabs={tabs}
      active={active}
      onChange={(id) => onChange(id as GrowthSurface)}
    />
  );
}

export function GrowthMockNotice({
  active,
  ready = ["conteudo"],
}: {
  active: GrowthSurface;
  ready?: GrowthSurface[];
}) {
  if (ready.includes(active)) {
    return null;
  }

  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-4 py-3 text-[0.78rem] text-[var(--yzi-text-secondary)]">
      Em construção para {GROWTH_SURFACES.find((surface) => surface.id === active)?.label}.
    </div>
  );
}

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
      className="inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.66rem] font-medium"
      style={{
        color: imobRgba(role, 0.98),
        borderColor: imobRgba(role, 0.32),
        backgroundColor: imobRgba(role, 0.1),
      }}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: imobRgba(role, 0.9) }}
      />
      {status}
    </span>
  );
}

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
            <span className="block truncate text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
              {title}
            </span>
            <span className="block truncate text-[0.72rem] text-[var(--yzi-text-secondary)]">
              {subtitle}
            </span>
          </span>
          <GrowthStatusBadge status={status} accents={accents} />
        </span>
        <span className="flex flex-wrap items-center gap-2 text-[0.68rem] text-[var(--yzi-text-faint)]">
          {meta}
        </span>
      </span>
    </button>
  );
}

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
          <p className="mt-3 max-w-lg text-[0.82rem] leading-relaxed text-white/68">
            {supportingText}
          </p>
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

export function GrowthDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[color:var(--yzi-border-subtle)] py-2.5 last:border-b-0">
      <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
        {label}
      </span>
      <span className="text-right text-[0.8rem] text-[var(--yzi-text-primary)]">{value}</span>
    </div>
  );
}

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
      <p className="mt-3 text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">
        {note}
      </p>
    </div>
  );
}

export function GrowthApprovalActions({
  status,
  accents,
  onVersion,
  onAdjust,
}: {
  status: string;
  accents: GrowthStatusAccent;
  onVersion: () => void;
  onAdjust: () => void;
}) {
  return (
    <section className="yzi-lens flex flex-col gap-4 rounded-[var(--yzi-radius-lg)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">
            Aprovação
          </h2>
          <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
            Decisão visual mockada. Nada será publicado ou gerado.
          </p>
        </div>
        <GrowthStatusBadge status={status} accents={accents} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.34)] bg-[rgba(var(--imob-cold),0.14)] px-3 py-2 text-[0.78rem] font-medium text-[var(--yzi-text-primary)] transition-colors hover:bg-[rgba(var(--imob-cold),0.2)]"
        >
          Aprovar
        </button>
        <button
          type="button"
          onClick={onVersion}
          className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-[0.78rem] text-[var(--yzi-text-secondary)] transition-colors hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]"
        >
          Nova versão
        </button>
        <button
          type="button"
          onClick={onAdjust}
          className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-[0.78rem] text-[var(--yzi-text-secondary)] transition-colors hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]"
        >
          Solicitar ajuste
        </button>
        <button
          type="button"
          className="rounded-[var(--yzi-radius-sm)] border px-3 py-2 text-[0.78rem] transition-colors hover:bg-[rgba(196,108,108,0.12)]"
          style={{
            color: imobRgba("coldRed", 0.96),
            borderColor: imobRgba("coldRed", 0.28),
          }}
        >
          Rejeitar
        </button>
      </div>
    </section>
  );
}

export function GrowthInspectorPanel({
  title = "Inspector YZI",
  sections,
  note,
}: {
  title?: string;
  sections: Array<{ label: string; value: ReactNode }>;
  note: string;
}) {
  return (
    <section className="rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4 shadow-[var(--yzi-edge-highlight)]">
      <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-4 text-[0.78rem] leading-relaxed">
        {sections.map((section) => (
          <div key={section.label}>
            <span className="block text-[0.62rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
              {section.label}
            </span>
            <div className="mt-1 text-[var(--yzi-text-secondary)]">{section.value}</div>
          </div>
        ))}
        <p className="border-t border-[color:var(--yzi-border-subtle)] pt-3 text-[0.7rem] text-[var(--yzi-text-faint)]">
          {note}
        </p>
      </div>
    </section>
  );
}
