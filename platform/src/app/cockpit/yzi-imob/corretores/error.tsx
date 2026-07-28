"use client";

export default function CorretoresError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-8 py-10">
      <h1 className="text-[1.1rem] font-semibold text-[var(--yzi-text-primary)]">
        Nao foi possivel carregar os corretores
      </h1>
      <p className="text-[0.82rem] text-[var(--yzi-text-secondary)]">
        A operacao falhou antes de concluir a leitura. Nenhum dado foi alterado.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="h-9 w-fit rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 text-[0.74rem] text-[var(--yzi-text-primary)]"
      >
        Tentar novamente
      </button>
    </section>
  );
}
