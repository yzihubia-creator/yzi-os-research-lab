"use client";

export function GrowthTimeline({ items }: { items: Array<{ label: string; detail: string }> }) {
  return (
    <ol className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={`${item.label}-${item.detail}`} className="grid grid-cols-[10px_minmax(0,1fr)] gap-3 text-[0.78rem]">
          <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[rgb(var(--imob-ice))]" />
          <span>
            <span className="block font-medium text-[var(--yzi-text-primary)]">{item.label}</span>
            <span className="block text-[var(--yzi-text-secondary)]">{item.detail}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

