import Link from "next/link";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { listBrokersForTenant } from "@/lib/yzi-imob/brokers/repository";
import type { BrokerOperationalSummary } from "@/lib/yzi-imob/brokers/types";

export const dynamic = "force-dynamic";

const AVAILABILITY_LABEL: Record<string, string> = {
  available: "Disponivel",
  busy: "Ocupado",
  away: "Ausente",
  no_new_leads: "Sem novos leads",
};

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-8 py-10">
      <h1 className="text-[1.5rem] font-semibold text-[var(--yzi-text-primary)]">Corretores</h1>
      <div
        role="alert"
        className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-5"
      >
        <p className="text-[0.88rem] font-medium text-[var(--yzi-text-primary)]">{title}</p>
        <p className="mt-1 text-[0.78rem] text-[var(--yzi-text-secondary)]">{body}</p>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <span className="text-[0.72rem] text-[var(--yzi-text-secondary)]">
      <strong className="font-semibold text-[var(--yzi-text-primary)]">{value}</strong> {label}
    </span>
  );
}

function BrokerRow({ broker }: { broker: BrokerOperationalSummary }) {
  return (
    <Link
      href={`/cockpit/yzi-imob/corretores/${broker.userId}`}
      className="grid gap-3 border-t border-[color:var(--yzi-border-subtle)] px-4 py-4 transition-colors first:border-t-0 hover:bg-[rgba(255,255,255,0.025)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto]"
    >
      <div className="min-w-0">
        <p className="truncate text-[0.86rem] font-medium text-[var(--yzi-text-primary)]">
          {broker.name}
          {broker.isSelf ? (
            <span className="ml-2 text-[0.66rem] font-normal text-[var(--yzi-text-faint)]">
              Voce
            </span>
          ) : null}
        </p>
        <p className="mt-1 text-[0.7rem] text-[var(--yzi-text-faint)]">
          {broker.role} · membership {broker.membershipStatus}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Metric label="leads ativos" value={broker.activeLeadCount} />
        <Metric label="visitas futuras" value={broker.futureVisitCount} />
        <Metric label="aguardando aceite" value={broker.pendingAssignmentCount} />
        <Metric label="feedbacks pendentes" value={broker.missingFeedbackCount} />
      </div>
      <span className="self-center text-[0.7rem] text-[var(--yzi-text-secondary)]">
        {AVAILABILITY_LABEL[broker.operationalAvailability] ??
          broker.operationalAvailability}
      </span>
    </Link>
  );
}

export default async function YziImobCorretoresPage() {
  const tenantContext = await getTenantContext();
  if (tenantContext.status === "no_session") redirect("/login");
  if (tenantContext.status === "no_membership") {
    return (
      <Notice
        title="Sua conta ainda nao esta vinculada a uma operacao."
        body="Conclua a implantacao ou solicite acesso ao administrador."
      />
    );
  }
  if (tenantContext.status === "error") {
    return (
      <Notice
        title="Nao foi possivel carregar os corretores."
        body="A operacao nao pode ser resolvida agora. Recarregue a pagina."
      />
    );
  }

  const supabase = await createServerSupabaseClient();
  const result = await listBrokersForTenant(
    supabase,
    tenantContext.tenant.id,
    tenantContext.userId,
  );
  if (result.status === "error") {
    return (
      <Notice
        title="Nao foi possivel carregar os corretores."
        body="A leitura operacional falhou. Nenhum dado foi alterado."
      />
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-8 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.5rem] font-semibold text-[var(--yzi-text-primary)]">
            Corretores
          </h1>
          <p className="mt-1 text-[0.82rem] text-[var(--yzi-text-secondary)]">
            Memberships reais e carga operacional do tenant atual.
          </p>
        </div>
        <Link
          href="/cockpit/yzi-imob/equipe"
          className="text-[0.76rem] text-[rgb(var(--imob-ice))] hover:underline"
        >
          Gerenciar em Equipe
        </Link>
      </header>

      {result.value.length === 0 ? (
        <div className="border-y border-[color:var(--yzi-border-subtle)] py-8 text-center">
          <p className="text-[0.82rem] text-[var(--yzi-text-secondary)]">
            Nenhuma membership operacional visivel para esta conta.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)]">
          {result.value.map((broker) => (
            <BrokerRow key={broker.userId} broker={broker} />
          ))}
        </div>
      )}
    </section>
  );
}
