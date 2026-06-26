import type { ReactNode } from "react";

import {
  YziAlert,
  YziPanel,
  YziSurface,
} from "@/components/yzi-os/yzi-primitives";

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
      <YziSurface variant="elevated" className="w-full max-w-xl p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--yzi-text-faint)]">
              {eyebrow}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--yzi-text-primary)]">
              {title}
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
              {description}
            </p>
          </div>

          <YziPanel variant="presence" className="flex flex-col gap-3 p-4">
            {primaryAction}
            <p className="text-xs leading-relaxed text-[var(--yzi-text-faint)]">
              {note}
            </p>
          </YziPanel>

          <ul className="grid gap-2 text-sm text-[var(--yzi-text-primary)] sm:grid-cols-2">
            <li className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2">
              Acesso controlado por Google OAuth
            </li>
            <li className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2">
              Nenhum dado operacional é criado aqui
            </li>
            <li className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2">
              Sessão só aparece após autenticação válida
            </li>
            <li className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2">
              Sem tenant, não há operação para mostrar
            </li>
          </ul>

          {errorMessage ? (
            <YziAlert tone="risk" title="alerta">
              {errorMessage}
            </YziAlert>
          ) : null}
        </div>
      </YziSurface>
    </section>
  );
}
