export default function YziImobRadarLoading() {
  return (
    <section aria-busy="true" aria-label="Carregando Radar" className="mx-auto flex w-full max-w-6xl animate-pulse flex-col gap-5 px-8 py-10">
      <div className="h-8 w-32 rounded bg-[var(--yzi-surface-elevated)]" />
      <div className="h-16 rounded-[var(--yzi-radius-lg)] bg-[var(--yzi-surface-elevated)]" />
      <div className="h-80 rounded-[var(--yzi-radius-lg)] bg-[var(--yzi-surface-elevated)]" />
    </section>
  );
}
