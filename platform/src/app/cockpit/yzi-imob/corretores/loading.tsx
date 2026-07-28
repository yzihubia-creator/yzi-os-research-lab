export default function CorretoresLoading() {
  return (
    <section
      aria-busy="true"
      className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-8 py-10"
    >
      <div className="h-7 w-40 animate-pulse rounded-[var(--yzi-radius-sm)] bg-[var(--yzi-surface-elevated)]" />
      <div className="h-48 animate-pulse rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)]" />
      <span className="sr-only">Carregando corretores</span>
    </section>
  );
}
