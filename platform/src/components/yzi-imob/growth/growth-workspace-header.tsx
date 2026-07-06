"use client";

export function GrowthWorkspaceHeader({
  title,
  subtitle,
  tenantLabel = "tenant_id: tenant_mock_growth_001",
}: {
  title: string;
  subtitle: string;
  tenantLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[rgba(var(--imob-cyan),0.86)]">
        Growth OS / experiencia do gestor
      </span>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[2.15rem] font-semibold leading-[1.04] text-[var(--yzi-text-primary)]">{title}</h1>
          <p className="max-w-2xl text-[0.92rem] leading-relaxed text-[var(--yzi-text-secondary)]">{subtitle}</p>
        </div>
        <span className="rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-graphite),0.35)] bg-[rgba(var(--imob-graphite),0.12)] px-3 py-1.5 font-mono text-[0.68rem] text-[var(--yzi-text-secondary)] shadow-[var(--yzi-edge-highlight)]">
          {tenantLabel}
        </span>
      </div>
    </div>
  );
}

export const GrowthSurfaceHeader = GrowthWorkspaceHeader;
