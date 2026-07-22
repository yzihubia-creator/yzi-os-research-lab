import Link from "next/link";
import { redirect } from "next/navigation";

import { YziAlert, YziPanel } from "@/components/yzi-os/yzi-primitives";
import {
  CLIENT_STAGE_ACCENT,
  imobRgba,
  type YziImobRole,
} from "@/components/yzi-imob/yzi-imob-status-colors";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { listLeads } from "@/lib/yzi-imob/leads/repository";

const LEAD_STATUS_LABEL: Record<string, string> = {
  lead: "Lead",
  qualificado: "Qualificado",
  cliente: "Cliente",
  inativo: "Inativo",
};

function labelOrEmpty(value: string | null): string {
  return value?.trim() || "Ainda sem dados";
}

function statusLabel(status: string | null): string {
  if (!status) return "Ainda sem dados";
  return LEAD_STATUS_LABEL[status] ?? status;
}

function statusRole(status: string | null): YziImobRole {
  if (status && status in CLIENT_STAGE_ACCENT) {
    return CLIENT_STAGE_ACCENT[status as keyof typeof CLIENT_STAGE_ACCENT];
  }
  return "neutral";
}

function formatLastInteraction(iso: string | null): string {
  if (!iso) return "Ainda sem dados";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// Catalogo de clientes/leads reais. Mantem o layout de lista e troca somente
// a origem dos dados: leitura server-side, tenant-scoped, sem mock e sem
// inferir campos que nao existem nas tabelas reais.

export default async function YziImobClientesPage() {
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "no_session") {
    redirect("/login");
  }

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

      {tenantContext.status === "no_membership" ? (
        <YziPanel className="p-5">
          <p className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
            Sua operacao ainda nao esta disponivel
          </p>
          <p className="mt-1 text-[0.82rem] text-[var(--yzi-text-secondary)]">
            Nao encontramos uma imobiliaria vinculada a sua conta. Verifique o acesso ou fale com o
            administrador.
          </p>
        </YziPanel>
      ) : null}

      {tenantContext.status === "error" ? (
        <YziAlert tone="blocked" title="Nao foi possivel carregar os leads">
          Tente novamente em instantes. Se o problema continuar, fale com o administrador.
        </YziAlert>
      ) : null}

      {tenantContext.status === "tenant_found" ? (
        <LeadsList tenantId={tenantContext.tenant.id} />
      ) : null}
    </section>
  );
}

async function LeadsList({ tenantId }: { tenantId: string }) {
  const supabase = await createServerSupabaseClient();
  const result = await listLeads(supabase, tenantId);

  if (result.status === "error") {
    return (
      <YziAlert tone="blocked" title="Nao foi possivel consultar os leads">
        Tente novamente em instantes.
      </YziAlert>
    );
  }

  if (result.value.items.length === 0) {
    return (
      <p className="rounded-[var(--yzi-radius-sm)] border border-dashed border-[color:var(--yzi-border-subtle)] px-4 py-6 text-center text-[0.8rem] text-[var(--yzi-text-faint)]">
        Nenhum lead real encontrado neste tenant.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {result.value.items.map((lead) => {
        const role = statusRole(lead.status);
        return (
          <Link
            key={lead.id}
            href={`/cockpit/yzi-imob/clientes/${lead.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--yzi-radius-md)] border border-l-[3px] border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3.5 shadow-[var(--yzi-edge-highlight)] transition-colors hover:border-[color:rgba(var(--imob-ice),0.3)]"
            style={{ borderLeftColor: imobRgba(role, 0.45) }}
          >
            <div className="flex min-w-0 flex-col">
              <span className="text-[0.9rem] font-medium text-[var(--yzi-text-primary)]">
                {lead.fullName}
              </span>
              <span className="text-[0.72rem] text-[var(--yzi-text-faint)]">
                Telefone: {labelOrEmpty(lead.phone)} - Email: {labelOrEmpty(lead.email)} -
                Origem: {labelOrEmpty(lead.source)}
              </span>
              <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">
                Interesses: {lead.interestCount} - Maior score:{" "}
                {lead.maxInterestScore ?? "Ainda sem dados"} - Ultima interacao:{" "}
                {formatLastInteraction(lead.lastInteractionAt)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full border px-2.5 py-1 text-[0.66rem]"
                style={{
                  borderColor: imobRgba(role, 0.32),
                  backgroundColor: imobRgba(role, 0.1),
                  color: imobRgba(role, 0.95),
                }}
              >
                {statusLabel(lead.status)}
              </span>
              {lead.temperature ? (
                <span className="rounded-full border border-[color:var(--yzi-border-subtle)] px-2.5 py-1 text-[0.66rem] text-[var(--yzi-text-secondary)]">
                  {lead.temperature}
                </span>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
