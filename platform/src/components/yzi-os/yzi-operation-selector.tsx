"use client";

import { useState } from "react";

import type { TenantSelectionOption } from "@/lib/tenant/tenant-context";

export function YziOperationSelector({
  operations,
}: {
  operations: TenantSelectionOption[];
}) {
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function selectOperation(operation: TenantSelectionOption) {
    setPendingSlug(operation.slug);
    setError(null);

    try {
      const response = await fetch(
        `/cockpit/t/${encodeURIComponent(operation.slug)}`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        },
      );

      if (!response.ok) throw new Error("operation_selection_failed");

      window.location.reload();
    } catch {
      setPendingSlug(null);
      setError("Não foi possível abrir esta operação. Tente novamente.");
    }
  }

  return (
    <section
      aria-labelledby="operation-selector-title"
      className="mx-auto flex min-h-full w-full max-w-xl flex-col justify-center px-6 py-12 sm:px-8"
    >
      <div className="yzi-glass-panel rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] p-5 sm:p-7">
        <div className="mb-6 space-y-2">
          <h1
            id="operation-selector-title"
            className="text-balance text-[1.15rem] font-semibold tracking-[-0.02em] text-[var(--yzi-text-primary)]"
          >
            Escolha a operação que deseja acessar
          </h1>
          <p className="max-w-md text-[0.84rem] leading-relaxed text-[var(--yzi-text-secondary)]">
            Você tem acesso a mais de uma operação. Selecione uma para
            continuar.
          </p>
        </div>

        <div className="space-y-2.5">
          {operations.map((operation) => {
            const isPending = pendingSlug === operation.slug;

            return (
              <button
                key={operation.slug}
                type="button"
                disabled={pendingSlug !== null}
                aria-busy={isPending}
                onClick={() => selectOperation(operation)}
                className="flex min-h-12 w-full items-center justify-between gap-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[color:var(--yzi-surface-base)] px-4 py-3 text-left text-[0.82rem] font-medium text-[var(--yzi-text-primary)] transition-[border-color,background-color,color,opacity] duration-[var(--duration-fast)] hover:border-[color:var(--yzi-border-strong)] hover:bg-[color:var(--yzi-surface-elevated)] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yzi-accent-trust)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--yzi-bg-base)]"
              >
                <span>{operation.name}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-[0.72rem] text-[var(--yzi-text-secondary)]"
                >
                  {isPending ? "Abrindo..." : "Acessar"}
                </span>
              </button>
            );
          })}
        </div>

        <p
          aria-live="polite"
          className="mt-4 min-h-5 text-[0.76rem] text-[var(--yzi-state-blocked)]"
        >
          {error}
        </p>
      </div>
    </section>
  );
}
