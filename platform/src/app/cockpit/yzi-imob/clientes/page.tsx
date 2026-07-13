"use client";

import Link from "next/link";

import {
  CLIENT_STATUS_LABEL,
  DEMO_CLIENTS,
} from "@/components/yzi-imob/yzi-imob-entity-workspace-mock";
import {
  CLIENT_STAGE_ACCENT,
  imobRgba,
} from "@/components/yzi-imob/yzi-imob-status-colors";

// Catálogo de Clientes — apenas lista; clicar abre o Client Workspace. Mesma
// regra do catálogo de Imóveis/Corretores: o catálogo nunca duplica o que o
// Workspace mostra, só navega até ele.

export default function YziImobClientesPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 py-10">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.01em] text-[var(--yzi-text-primary)]">
          Clientes
        </h1>
        <p className="text-[0.82rem] text-[var(--yzi-text-secondary)]">
          Selecione um cliente para abrir o Client Workspace.
        </p>
      </header>

      <div className="flex flex-col gap-2">
        {DEMO_CLIENTS.map((client) => {
          const role = CLIENT_STAGE_ACCENT[client.status];
          return (
            <Link
              key={client.id}
              href={`/cockpit/yzi-imob/clientes/${client.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--yzi-radius-md)] border border-l-[3px] border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3.5 shadow-[var(--yzi-edge-highlight)] transition-colors hover:border-[color:rgba(var(--imob-ice),0.3)]"
              style={{ borderLeftColor: imobRgba(role, 0.45) }}
            >
              <div className="flex min-w-0 flex-col">
                <span className="text-[0.9rem] font-medium text-[var(--yzi-text-primary)]">
                  {client.nome}
                </span>
                <span className="text-[0.72rem] text-[var(--yzi-text-faint)]">
                  {client.whatsapp || client.email || "Sem contato registrado"} ·{" "}
                  {client.bairrosInteresse.join(", ") || "Sem interesse definido"}
                </span>
                {client.corretorResponsavel ? (
                  <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">
                    Corretor: {client.corretorResponsavel} · Última interação: {client.ultimaInteracao}
                  </span>
                ) : null}
              </div>
              <span
                className="rounded-full border px-2.5 py-1 text-[0.66rem]"
                style={{
                  borderColor: imobRgba(role, 0.32),
                  backgroundColor: imobRgba(role, 0.1),
                  color: imobRgba(role, 0.95),
                }}
              >
                {CLIENT_STATUS_LABEL[client.status]}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
