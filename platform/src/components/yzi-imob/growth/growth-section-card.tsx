"use client";

export function GrowthSectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4 shadow-[var(--yzi-edge-highlight)]">
      <h2 className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

