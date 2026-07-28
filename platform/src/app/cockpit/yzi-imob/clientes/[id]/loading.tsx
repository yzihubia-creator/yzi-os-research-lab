export default function LeadWorkspaceLoading() {
  return (
    <section aria-busy="true" className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-8 py-10">
      <div className="h-24 animate-pulse rounded-[var(--yzi-radius-md)] bg-[var(--yzi-surface-base)]" />
      <div className="h-52 animate-pulse rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)]" />
      <span className="sr-only">Carregando workspace do lead</span>
    </section>
  );
}
