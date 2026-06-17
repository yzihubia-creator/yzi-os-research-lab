import Link from "next/link";
import { redirect } from "next/navigation";

import {
  CockpitModuleCard,
  cockpitModules,
} from "@/components/yzi-os/cockpit-modules";
import { LogoutButton } from "@/components/yzi-os/logout-button";
import { getSessionUser } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { getPermissionBoundary } from "@/lib/tenant/role-boundary";

function StatusBlock({
  state,
  title,
  description,
}: {
  state: "no_session" | "no_membership" | "tenant_found" | "error";
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            estado atual
          </span>
          <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            {description}
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-wide text-zinc-400">
          {state}
        </span>
      </div>
    </section>
  );
}

function CockpitHeader({
  tenantName,
  roleLabel,
  operatorEmail,
}: {
  tenantName?: string;
  roleLabel?: string;
  operatorEmail?: string | null;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 pb-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            YZI OS
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Cockpit operacional
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            Entrada mínima para acessar módulos institucionais. Dados reais só
            aparecem quando houver sessão, tenant e módulo ativo.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
        <span className="rounded-full border border-white/10 px-3 py-1">
          Tenant: {tenantName ?? "não resolvido"}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1">
          Estado: {roleLabel ?? "sem vínculo operacional"}
        </span>
        {operatorEmail ? (
          <span className="rounded-full border border-white/10 px-3 py-1">
            Operador: {operatorEmail}
          </span>
        ) : null}
      </div>
    </header>
  );
}

function ModuleGrid() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cockpitModules.map((moduleInfo) => (
        <CockpitModuleCard key={moduleInfo.href} moduleInfo={moduleInfo} />
      ))}
    </section>
  );
}

export default async function CockpitPage() {
  const context = await getTenantContext();

  if (context.status === "no_session") {
    redirect("/login");
  }

  const operator = await getSessionUser();

  if (context.status === "error") {
    return (
      <div className="flex flex-col gap-6">
        <CockpitHeader operatorEmail={operator?.email} />
        <StatusBlock
          state="error"
          title="Falha de leitura"
          description="Não foi possível confirmar a sessão ou o vínculo atual. Nenhum dado operacional foi inferido."
        />
        <Link
          href="/login"
          className="w-fit rounded-md border border-white/15 px-4 py-2 text-sm text-zinc-200 transition-colors hover:border-white/30"
        >
          Voltar ao login
        </Link>
      </div>
    );
  }

  if (context.status === "no_membership") {
    return (
      <div className="flex flex-col gap-6">
        <CockpitHeader operatorEmail={operator?.email} />
        <StatusBlock
          state="no_membership"
          title="Sessão sem membership"
          description="A conta está autenticada, mas ainda não há vínculo com tenant operacional. Os módulos permanecem bloqueados até ativação."
        />
        <ModuleGrid />
      </div>
    );
  }

  const boundary = getPermissionBoundary(context.role);

  return (
    <div className="flex flex-col gap-6">
      <CockpitHeader
        tenantName={context.tenant.name}
        roleLabel={boundary.label}
        operatorEmail={operator?.email}
      />
      <StatusBlock
        state="tenant_found"
        title="Tenant encontrado"
        description="O cockpit reconheceu sessão, membership e tenant. Os cards abaixo são entradas institucionais; cada módulo ainda expõe apenas uma tela placeholder nesta fase."
      />
      <ModuleGrid />
      <p className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-zinc-400">
        Nenhuma receita, lead, campanha, agenda, crédito, alerta, oportunidade ou
        recomendação é exibida aqui sem fonte operacional real e módulo ativo.
      </p>
    </div>
  );
}
