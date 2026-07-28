export default function AgendaLoading() {
  return (
    <section aria-busy="true" className="flex w-full flex-col gap-5 px-8 py-8">
      <div className="h-8 w-52 animate-pulse rounded-[var(--yzi-radius-sm)] bg-[var(--yzi-surface-elevated)]" />
      <div className="h-[32rem] animate-pulse rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)]" />
      <span className="sr-only">Carregando agenda</span>
    </section>
  );
}
