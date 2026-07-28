"use client";

export default function LeadWorkspaceError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-8 py-10">
      <h1 className="text-[1.1rem] font-semibold text-[var(--yzi-text-primary)]">
        Este lead nao pode ser carregado
      </h1>
      <p className="text-[0.82rem] text-[var(--yzi-text-secondary)]">
        A leitura operacional falhou. Nenhuma acao foi executada.
      </p>
      <button type="button" onClick={() => unstable_retry()} className="h-9 w-fit rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 text-[0.74rem] text-[var(--yzi-text-primary)]">
        Tentar novamente
      </button>
    </section>
  );
}
