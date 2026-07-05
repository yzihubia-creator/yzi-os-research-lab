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
    <div className="flex flex-col gap-2">
      <span className="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-[var(--yzi-text-secondary)]">
        Growth OS · Mock operacional
      </span>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.01em] text-[var(--yzi-text-primary)]">
            {title}
          </h1>
          <p className="max-w-2xl text-[0.92rem] leading-relaxed text-[var(--yzi-text-secondary)]">{subtitle}</p>
        </div>
        <span className="rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-1.5 text-[0.7rem] text-[var(--yzi-text-secondary)] shadow-[var(--yzi-edge-highlight)]">
          {tenantLabel}
        </span>
      </div>
    </div>
  );
}

export const GrowthSurfaceHeader = GrowthWorkspaceHeader;

