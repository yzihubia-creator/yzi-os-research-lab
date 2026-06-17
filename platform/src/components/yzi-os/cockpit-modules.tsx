import Link from "next/link";

type ModuleStatus = "em preparação" | "bloqueado";

export type CockpitModule = {
  name: string;
  description: string;
  href: string;
  status: ModuleStatus;
};

export const cockpitModules: CockpitModule[] = [
  {
    name: "Dashboard",
    description: "Visão institucional do cockpit quando houver dados reais.",
    href: "/cockpit/dashboard",
    status: "em preparação",
  },
  {
    name: "CRM",
    description: "Relacionamento e pipeline aguardando ativação operacional.",
    href: "/cockpit/crm",
    status: "em preparação",
  },
  {
    name: "Financeiro",
    description: "Leitura financeira reservada para fonte real e tenant ativo.",
    href: "/cockpit/financeiro",
    status: "em preparação",
  },
  {
    name: "Agenda",
    description: "Compromissos e cadência sem eventos simulados nesta fase.",
    href: "/cockpit/agenda",
    status: "em preparação",
  },
  {
    name: "Radar",
    description: "Sinais e inteligência aguardando fonte operacional confiável.",
    href: "/cockpit/radar",
    status: "em preparação",
  },
  {
    name: "Tráfego Pago",
    description: "Campanhas e mídia ficam bloqueadas até integração real.",
    href: "/cockpit/trafego-pago",
    status: "em preparação",
  },
  {
    name: "Assistente YZI",
    description: "Assistência institucional aguardando ativação controlada.",
    href: "/cockpit/assistente",
    status: "em preparação",
  },
  {
    name: "Configurações",
    description: "Preferências e controles futuros, sem escrita nesta etapa.",
    href: "/cockpit/configuracoes",
    status: "em preparação",
  },
];

export function CockpitModuleCard({
  moduleInfo,
}: {
  moduleInfo: CockpitModule;
}) {
  return (
    <article className="flex min-h-40 flex-col justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-100">
            {moduleInfo.name}
          </h3>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-zinc-400">
            {moduleInfo.status}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-zinc-400">
          {moduleInfo.description}
        </p>
      </div>
      <Link
        href={moduleInfo.href}
        className="w-fit rounded-md border border-white/15 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:border-white/30"
      >
        Abrir placeholder
      </Link>
    </article>
  );
}

export function ModulePlaceholderPage({
  moduleInfo,
}: {
  moduleInfo: CockpitModule;
}) {
  return (
    <section className="flex min-h-[60vh] flex-col justify-center gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/cockpit"
          className="w-fit rounded-md border border-white/15 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/30"
        >
          Voltar ao Cockpit
        </Link>
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          módulo em preparação
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          {moduleInfo.name}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          {moduleInfo.description}
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm font-medium text-zinc-100">
          Status: aguardando ativação
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Este módulo ainda não expõe dados operacionais reais nesta fase.
        </p>
      </div>
    </section>
  );
}

export function getCockpitModule(href: string): CockpitModule {
  const moduleInfo = cockpitModules.find((item) => item.href === href);

  if (!moduleInfo) {
    throw new Error(`Módulo não registrado: ${href}`);
  }

  return moduleInfo;
}
