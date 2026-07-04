import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import { YziPresence } from "@/components/yzi-os/yzi-primitives";
import {
  ArrowRightIcon,
  CreativeIcon,
  GridIcon,
  PlusIcon,
} from "@/components/yzi-imob/yzi-imob-icons-v2";

// Home provisória do YZI IMOB — a YZI é a entrada, não um dashboard. Três ações
// principais, texto curto e hierarquia forte (Visual Language v1). Sem métricas,
// sem cards decorativos, sem dados reais.

type Action = {
  label: string;
  hint: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  primary?: boolean;
};

const ACTIONS: Action[] = [
  {
    label: "Cadastrar imóvel",
    hint: "Traga o material bruto. A YZI organiza.",
    href: "/cockpit/yzi-imob/imoveis",
    icon: PlusIcon,
    primary: true,
  },
  {
    label: "Abrir imóveis",
    hint: "Catálogo dos imóveis em operação.",
    href: "/cockpit/yzi-imob/imoveis",
    icon: GridIcon,
  },
  {
    label: "Criar criativo",
    hint: "Do imóvel aprovado ao anúncio pronto.",
    href: "/cockpit/yzi-imob/studio",
    icon: CreativeIcon,
  },
];

function ActionRow({ action }: { action: Action }) {
  const Glyph = action.icon;
  return (
    <Link
      href={action.href}
      className={`group flex items-center gap-4 rounded-[var(--yzi-radius-md)] border px-5 py-4 transition-[background,border-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] ${
        action.primary
          ? "border-[color:rgba(63,224,197,0.32)] bg-[var(--yzi-accent-action-soft)] hover:border-[color:rgba(63,224,197,0.5)]"
          : "border-[color:var(--yzi-border-subtle)] hover:border-[color:var(--yzi-border-strong)] hover:bg-[rgba(255,255,255,0.02)]"
      }`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-[var(--yzi-radius-md)] ${
          action.primary
            ? "text-[var(--yzi-accent-action)]"
            : "border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] text-[var(--yzi-text-secondary)] group-hover:text-[var(--yzi-text-primary)]"
        }`}
      >
        <Glyph className="h-6 w-6" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={`text-[1.05rem] font-semibold tracking-[0.01em] ${
            action.primary
              ? "text-[var(--yzi-accent-action)]"
              : "text-[var(--yzi-text-primary)]"
          }`}
        >
          {action.label}
        </span>
        <span className="truncate text-[0.82rem] text-[var(--yzi-text-secondary)]">
          {action.hint}
        </span>
      </span>
      <ArrowRightIcon
        className={`h-5 w-5 shrink-0 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:translate-x-0.5 ${
          action.primary
            ? "text-[var(--yzi-accent-action)]"
            : "text-[var(--yzi-text-faint)]"
        }`}
      />
    </Link>
  );
}

export function YziImobHomeV2() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-10 px-8 py-16">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <YziPresence state="ready" animated />
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--yzi-text-secondary)]">
            YZI IMOB
          </span>
        </div>
        <h1 className="text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.02em] text-[var(--yzi-text-primary)]">
          Por onde começamos?
        </h1>
        <p className="max-w-md text-[0.98rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          Eu preparo o trabalho pesado. Você decide. Escolha um ponto de partida.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ACTIONS.map((action) => (
          <ActionRow key={action.label} action={action} />
        ))}
      </div>
    </section>
  );
}
