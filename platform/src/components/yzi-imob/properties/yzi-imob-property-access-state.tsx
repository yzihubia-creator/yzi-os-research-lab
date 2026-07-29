// YZI IMOB — Property Access State (estado honesto de acesso/tenant/erro).
//
// Reutilizado pela lista e pelo workspace de imóvel. Nunca inventa dado:
// apenas comunica por que a tela não pôde carregar.

export function YziImobPropertyAccessState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      <p className="text-[1.1rem] font-semibold text-[var(--yzi-text-primary)]">{title}</p>
      <p className="text-[0.86rem] text-[var(--yzi-text-secondary)]">{message}</p>
    </section>
  );
}
