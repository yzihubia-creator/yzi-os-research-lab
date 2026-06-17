import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cockpit | YZI OS",
  description:
    "Entrada operacional mínima do YZI OS para sessão, tenant e módulos institucionais.",
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
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-[0.7rem] font-bold text-zinc-950"
          >
            YZI
          </span>
          <div className="flex flex-col leading-tight">
            <p className="text-sm font-semibold tracking-tight text-zinc-100">
              YZI OS · Cockpit
            </p>
            <p className="text-xs text-zinc-500">
              Shell operacional mínimo para módulos em ativação
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
