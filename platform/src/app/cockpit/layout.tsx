import type { Metadata } from "next";

// Layout do cockpit (Lane 4, Step 6, gate L4-G4). Apenas o invólucro mínimo e
// navegável do esqueleto — sem dashboard, sem navegação complexa, sem design
// system, sem componentes globais. O root layout já provê <html>/<body>; este
// layout aninhado usa um <section> (convenção Next.js 16). Server Component
// (sem `use client`); não busca dados, não lê env, não consome Supabase.

export const metadata: Metadata = {
  title: "Cockpit — YZI OS (skeleton)",
  description:
    "Esqueleto navegável do cockpit YZI OS. Ainda não é o produto completo.",
};

export default function CockpitLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="flex min-h-screen flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <p className="text-sm font-medium tracking-tight">YZI OS — Cockpit</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Esqueleto navegável. Ainda não é o produto completo — sem dashboard,
          métricas, CRUD ou billing.
        </p>
      </header>
      <main className="flex flex-1 flex-col gap-6 px-6 py-8">{children}</main>
    </section>
  );
}
