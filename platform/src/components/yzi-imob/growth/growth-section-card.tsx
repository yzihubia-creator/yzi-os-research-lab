"use client";

export function GrowthSectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="yzi-growth-card rounded-[var(--yzi-radius-lg)] border p-4">
      <h2 className="text-[0.82rem] font-semibold leading-snug text-[var(--yzi-text-primary)]">{title}</h2>
      <div className="mt-3 border-t border-[rgba(var(--imob-graphite),0.18)] pt-3.5">{children}</div>
    </section>
  );
}
