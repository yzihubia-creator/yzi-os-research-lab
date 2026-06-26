import Link from "next/link";

import { CommandCenterIcon } from "@/components/yzi-os/yzi-icons";
import {
  YziPanel,
  YziStatusBadge,
  YziSurface,
} from "@/components/yzi-os/yzi-primitives";

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
    name: "Relacionamento",
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
    name: "Oportunidades",
    description:
      "Oportunidades acionáveis surgem aqui quando o Radar detecta sinal.",
    href: "/cockpit/oportunidades",
    status: "em preparação",
  },
  {
    name: "Ações",
    description:
      "Fila priorizada de ações; nada é executado sem autorização do gestor.",
    href: "/cockpit/acoes",
    status: "em preparação",
  },
  {
    name: "Autorizações",
    description:
      "Revisão humana antes de qualquer ação com impacto externo.",
    href: "/cockpit/autorizacoes",
    status: "em preparação",
  },
  {
    name: "Canais",
    description:
      "Conexão de canais reais que alimentam a leitura operacional da YZI.",
    href: "/cockpit/canais",
    status: "em preparação",
  },
  {
    name: "Busca Semântica",
    description:
      "Pergunta por intenção sobre ativos entendidos. Sem dados indexados ainda.",
    href: "/cockpit/busca-semantica",
    status: "em preparação",
  },
  {
    name: "Ativos",
    description:
      "Material recebido, entendido e conectado a oportunidades quando ativado.",
    href: "/cockpit/ativos",
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
    <YziPanel className="flex min-h-40 flex-col justify-between gap-4 p-4 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:border-[color:var(--yzi-border-strong)]">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            {moduleInfo.name}
          </h3>
          <YziStatusBadge tone="preview">{moduleInfo.status}</YziStatusBadge>
        </div>
        <p className="text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
          {moduleInfo.description}
        </p>
      </div>
      <Link
        href={moduleInfo.href}
        className="w-fit rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-1.5 text-xs text-[var(--yzi-text-primary)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--yzi-surface-elevated)]"
      >
        Abrir placeholder
      </Link>
    </YziPanel>
  );
}

export function ModulePlaceholderPage({
  moduleInfo,
}: {
  moduleInfo: CockpitModule;
}) {
  return (
    <section className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col gap-4">
        <Link
          href="/cockpit"
          className="inline-flex w-fit items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-1.5 text-xs text-[var(--yzi-text-secondary)] transition-colors hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]"
        >
          <CommandCenterIcon className="h-3.5 w-3.5" />
          Voltar ao Cockpit
        </Link>
        <div className="flex flex-col gap-2">
          <YziStatusBadge tone="preview" className="w-fit">
            {moduleInfo.status}
          </YziStatusBadge>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--yzi-text-primary)]">
            {moduleInfo.name}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            {moduleInfo.description}
          </p>
        </div>
      </div>

      <YziSurface variant="elevated" className="p-1.5">
        <YziPanel className="flex flex-col gap-3 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-[var(--yzi-text-primary)]">
            <span
              aria-hidden
              className="h-1.5 w-1.5 animate-yzi-breathe rounded-full bg-[var(--yzi-state-preview)]"
            />
            Status: aguardando ativação
          </p>
          <p className="text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Este módulo ainda não expõe dados operacionais reais nesta fase.
          </p>
          <dl className="flex flex-col gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-3 text-xs">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[var(--yzi-text-secondary)]">
                Ativa quando
              </dt>
              <dd className="text-right text-[var(--yzi-text-primary)]">
                fonte real conectada e tenant ativo
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[var(--yzi-text-secondary)]">
                Dados simulados
              </dt>
              <dd className="text-right text-[var(--yzi-text-primary)]">
                nenhum nesta fase
              </dd>
            </div>
          </dl>
        </YziPanel>
      </YziSurface>
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
