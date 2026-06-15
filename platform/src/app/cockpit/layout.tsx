import type { Metadata } from "next";

// App shell do cockpit — YZIHUB Command Center V1.
//
// Invólucro premium e estratégico do YZI OS (não mais "esqueleto"). Escuro,
// calmo e denso de sentido, conforme
// docs/yzi-os-active/01-brand-positioning/visual-direction.md — NÃO TailAdmin,
// não admin genérico. O dark é explícito (zinc-950) para o cockpit ter a mesma
// presença premium independente do tema do sistema. Server Component (sem
// `use client`); não busca dados, não lê env, não consome Supabase.

export const metadata: Metadata = {
  title: "YZIHUB — Command Center | YZI OS",
  description:
    "Centro de comando estratégico da YZIHUB no YZI OS: estado da empresa, próximas ações e recomendações da YZI.",
};

export default function CockpitLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="flex min-h-screen flex-1 flex-col bg-zinc-950 font-sans text-zinc-100 antialiased">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-400 to-violet-500 text-[0.7rem] font-bold text-zinc-950"
          >
            YZI
          </span>
          <div className="flex flex-col leading-tight">
            <p className="text-sm font-semibold tracking-tight text-zinc-100">
              YZI OS · Command Center
            </p>
            <p className="text-xs text-zinc-500">
              Sistema operacional estratégico — decisão + ação contínua
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
        {children}
      </main>
    </section>
  );
}
