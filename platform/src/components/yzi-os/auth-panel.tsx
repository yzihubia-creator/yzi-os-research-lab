import type { ReactNode } from "react";

type AuthPanelProps = {
  title: string;
  eyebrow: string;
  description: string;
  primaryAction: ReactNode;
  note: string;
  errorMessage?: string | null;
};

export function AuthPanel({
  title,
  eyebrow,
  description,
  primaryAction,
  note,
  errorMessage,
}: AuthPanelProps) {
  return (
    <section className="flex min-h-[calc(100vh-2rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              {eyebrow}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
              {title}
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-zinc-400">
              {description}
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-indigo-400/20 bg-indigo-400/[0.04] p-4">
            {primaryAction}
            <p className="text-xs leading-relaxed text-zinc-500">{note}</p>
          </div>

          <ul className="grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
            <li className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
              Acesso controlado por Google OAuth
            </li>
            <li className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
              Nenhum dado operacional é criado aqui
            </li>
            <li className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
              Sessão só aparece após autenticação válida
            </li>
            <li className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
              Sem tenant, não há operação para mostrar
            </li>
          </ul>

          {errorMessage ? (
            <p
              role="alert"
              className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-200"
            >
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
