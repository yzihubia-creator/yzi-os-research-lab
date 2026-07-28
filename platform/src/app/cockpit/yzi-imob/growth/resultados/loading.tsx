export default function YziImobResultsLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Carregando Resultados"
      className="flex min-h-full w-full animate-pulse flex-col gap-5 px-6 py-8"
    >
      <div className="h-8 w-48 rounded bg-[var(--yzi-surface-elevated)]" />
      <div className="h-20 rounded-[var(--yzi-radius-lg)] bg-[var(--yzi-surface-elevated)]" />
      <div className="h-72 rounded-[var(--yzi-radius-lg)] bg-[var(--yzi-surface-elevated)]" />
    </section>
  );
}
