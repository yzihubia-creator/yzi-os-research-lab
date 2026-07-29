import Link from "next/link";

// Distribuição — surface da área de Imóveis, ainda não conectada a dados
// reais. Estado honesto e curto: explica o que vai viver aqui, sem mock de
// corretores, leads ou mensagens e sem simular fluxo.

export default function YziImobDistribuicaoPage() {
  return (
    <section className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-8 px-8 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.01em] text-[var(--yzi-text-primary)]">
          Distribuição
        </h1>
        <p className="max-w-xl text-[0.92rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          Aqui vai ficar a distribuição das oportunidades dos imóveis: prioridade de
          captadores, lançamentos e atribuição aos corretores.
        </p>
      </header>

      <div className="flex flex-col items-center gap-3 rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-6 py-16 text-center">
        <p className="max-w-sm text-[0.92rem] leading-relaxed text-[var(--yzi-text-primary)]">
          A distribuição ainda não está conectada à operação.
        </p>
        <p className="max-w-sm text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          Ela depende do cadastro real de corretores e do fluxo de aceite pelo
          WhatsApp. Enquanto isso, mantenha o catálogo completo — é dele que as
          oportunidades vão nascer.
        </p>
        <Link
          href="/cockpit/yzi-imob/imoveis/catalogo"
          className="mt-1 text-[0.78rem] text-[rgb(var(--imob-ice))] hover:underline"
        >
          Abrir catálogo
        </Link>
      </div>
    </section>
  );
}
