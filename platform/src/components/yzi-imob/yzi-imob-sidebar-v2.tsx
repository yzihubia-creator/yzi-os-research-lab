"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

import { YziMarkIcon, SidebarToggleIcon } from "@/components/yzi-os/yzi-icons";
import { YziPresence } from "@/components/yzi-os/yzi-primitives";
import {
  BrokerIcon,
  CampaignIcon,
  ClientIcon,
  CreativeIcon,
  InboxIcon,
  InsightIcon,
  OperationIcon,
  PropertyIcon,
  RadarIcon,
  ResultsIcon,
  SettingsIcon,
  SiteIcon,
  TeamIcon,
} from "@/components/yzi-imob/yzi-imob-icons-v2";

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;
type Item = { label: string; icon: Glyph; href?: string };
type Group = { eyebrow: string; items: Item[] };

// Sidebar v2 (Operating Surface Navigation v2): YZI como entrada, quatro áreas.
// Itens sem rota ainda ficam desativados em estado honesto — nunca 404, nunca
// badge poluído. Navegação por área do produto, nunca por runtime/capabilities.
const GROUPS: Group[] = [
  {
    eyebrow: "Operação",
    items: [
      { label: "Corretores", icon: BrokerIcon, href: "/cockpit/yzi-imob/corretores" },
      { label: "Imóveis", icon: PropertyIcon, href: "/cockpit/yzi-imob/imoveis" },
      { label: "Clientes", icon: ClientIcon, href: "/cockpit/yzi-imob/clientes" },
      { label: "Atendimento", icon: InboxIcon, href: "/cockpit/yzi-imob/atendimento" },
    ],
  },
  {
    eyebrow: "Marketing",
    items: [
      {
        label: "Creative Engine",
        icon: CreativeIcon,
        href: "/cockpit/yzi-imob/studio",
      },
      { label: "Growth OS", icon: CampaignIcon, href: "/cockpit/yzi-imob/growth/briefing" },
      { label: "Site", icon: SiteIcon, href: "/cockpit/yzi-imob/site" },
    ],
  },
  {
    eyebrow: "Inteligência",
    items: [
      { label: "Radar", icon: RadarIcon },
      { label: "Insights", icon: InsightIcon },
      { label: "Resultados", icon: ResultsIcon, href: "/cockpit/yzi-imob/growth/resultados" },
    ],
  },
  {
    eyebrow: "Sistema",
    items: [
      { label: "Operação", icon: OperationIcon },
      { label: "Equipe", icon: TeamIcon },
      { label: "Configurações", icon: SettingsIcon },
    ],
  },
];

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function NavItem({
  item,
  collapsed,
  active,
}: {
  item: Item;
  collapsed: boolean;
  active: boolean;
}) {
  const Glyph = item.icon;
  const disabled = !item.href;

  const body = (
    <>
      <span
        className={cx(
          "grid shrink-0 place-items-center",
          collapsed ? "h-10 w-10" : "h-9 w-9",
        )}
      >
        <Glyph className={collapsed ? "h-[22px] w-[22px]" : "h-5 w-5"} />
      </span>
      {!collapsed ? (
        <span className="min-w-0 flex-1 truncate text-[0.9rem]">{item.label}</span>
      ) : null}
    </>
  );

  const shared = cx(
    "group flex items-center rounded-[var(--yzi-radius-md)] transition-[background,border-color,color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
    collapsed ? "justify-center" : "gap-2 px-2 pr-3",
    active
      ? "yzi-imob-nav-active"
      : disabled
        ? "border border-transparent text-[var(--yzi-text-faint)]"
        : "border border-transparent text-[var(--yzi-text-secondary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--yzi-text-primary)]",
  );

  if (disabled) {
    return (
      <span
        className={cx(shared, "cursor-default select-none")}
        title={collapsed ? `${item.label} · em breve` : "Em breve"}
        aria-disabled
      >
        {body}
      </span>
    );
  }

  return (
    <Link
      href={item.href!}
      className={shared}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
    >
      {body}
    </Link>
  );
}

export function YziImobSidebarV2({
  collapsed,
  onToggle,
  operatorEmail,
}: {
  collapsed: boolean;
  onToggle: () => void;
  operatorEmail?: string | null;
}) {
  const pathname = usePathname();
  const initial = (operatorEmail?.trim()?.[0] ?? "Y").toUpperCase();
  const homeActive = pathname === "/cockpit/yzi-imob";

  return (
    <aside
      className={cx(
        "flex shrink-0 flex-col border-r border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-bg-deep)] transition-[width] duration-[var(--duration-moderate)] ease-[var(--ease-standard)]",
        collapsed ? "w-[72px]" : "w-[248px]",
      )}
    >
      {/* YZI no topo — a entrada do sistema. */}
      <div className={cx("flex items-center px-3 py-4", collapsed ? "flex-col gap-3" : "justify-between")}>
        <Link
          href="/cockpit/yzi-imob"
          className={cx(
            "group flex items-center rounded-[var(--yzi-radius-md)] px-1.5 py-1.5 transition-colors",
            collapsed ? "justify-center" : "gap-2.5",
            homeActive ? "text-[rgb(var(--imob-ice))]" : "text-[var(--yzi-text-primary)]",
          )}
          title="YZI"
        >
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] text-[rgb(var(--imob-ice))]">
            <YziMarkIcon className="h-[19px] w-[19px]" />
            <YziPresence
              state="ready"
              animated
              className="absolute -right-1 -top-1 h-2 w-2"
            />
          </span>
          {!collapsed ? (
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="text-[0.88rem] font-semibold tracking-[0.03em] text-[var(--yzi-text-primary)]">YZI</span>
              <span className="truncate text-[0.62rem] text-[var(--yzi-text-faint)]">
                operação imobiliária
              </span>
            </span>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          title={collapsed ? "Expandir" : "Recolher"}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-[var(--yzi-radius-sm)] text-[var(--yzi-text-faint)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--yzi-text-secondary)]"
        >
          <SidebarToggleIcon
            className={cx(
              "h-4 w-4 transition-transform duration-[var(--duration-moderate)] ease-[var(--ease-standard)]",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-3">
        {GROUPS.map((group) => (
          <div key={group.eyebrow} className="flex flex-col gap-1">
            {!collapsed ? (
              <span className="px-2 pb-1 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[var(--yzi-text-faint)]">
                {group.eyebrow}
              </span>
            ) : (
              <span aria-hidden className="mx-auto mb-1 h-px w-6 bg-[var(--yzi-border-subtle)]" />
            )}
            {group.items.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                collapsed={collapsed}
                active={isActive(pathname, item.href)}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-[color:var(--yzi-border-subtle)] px-3 py-3">
        <div className={cx("flex items-center", collapsed ? "justify-center" : "gap-2.5")}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] text-[0.72rem] font-semibold">
            {initial}
          </span>
          {!collapsed ? (
            <span className="truncate text-[0.72rem] text-[var(--yzi-text-secondary)]">
              {operatorEmail ?? "Operador"}
            </span>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
