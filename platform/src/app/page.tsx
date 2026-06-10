export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
        YZI OS Platform
      </h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Infrastructure scaffold — no modules active yet.
      </p>
      <span className="rounded-full border border-zinc-300 px-4 py-1 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        status: scaffold ok
      </span>
    </main>
  );
}
