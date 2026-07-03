"use client";

import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

import { LogoutButton } from "@/components/yzi-os/logout-button";
import {
  YziButton,
  YziDivider,
  YziNavItem,
  YziPresence,
  YziSurface,
} from "@/components/yzi-os/yzi-primitives";
import {
  AssetsIcon,
  AuditIcon,
  AuthorizationIcon,
  ChannelsIcon,
  CommandCenterIcon,
  DashboardIcon,
  OpportunityIcon,
  RadarIcon,
  SettingsIcon,
  SidebarToggleIcon,
  TrafficIcon,
  YziAssistantIcon,
  YziMarkIcon,
} from "@/components/yzi-os/yzi-icons";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type NavGroup = { eyebrow: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    eyebrow: "Início",
    items: [
      { href: "/cockpit", label: "Início", icon: CommandCenterIcon },
    ],
  },
  {
    eyebrow: "Módulos",
    items: [
      {
        href: "/cockpit/yzi-imob/studio",
        label: "Conteúdo IA",
        icon: DashboardIcon,
      },
      {
        href: "/cockpit/yzi-imob/imoveis",
        label: "Imóveis",
        icon: AssetsIcon,
      },
      {
        href: "/cockpit/yzi-imob/site",
        label: "Site",
        icon: CommandCenterIcon,
      },
      {
        href: "/cockpit/yzi-imob/catalogo",
        label: "Catálogo",
        icon: AuditIcon,
      },
    ],
  },
  {
    eyebrow: "Descobrir",
    items: [
      { href: "/cockpit/radar", label: "Radar", icon: RadarIcon },
      {
        href: "/cockpit/oportunidades",
        label: "Oportunidades",
        icon: OpportunityIcon,
      },
    ],
  },
  {
    eyebrow: "Planejar & Agir",
    items: [
      { href: "/cockpit/trafego-pago", label: "Tráfego", icon: TrafficIcon },
      {
        href: "/cockpit/autorizacoes",
        label: "Aprovações",
        icon: AuthorizationIcon,
      },
    ],
  },
  {
    eyebrow: "Medir",
    items: [
      { href: "/cockpit/dashboard", label: "Resultados", icon: DashboardIcon },
    ],
  },
  {
    eyebrow: "Base",
    items: [
      { href: "/cockpit/canais", label: "Conexões", icon: ChannelsIcon },
      {
        href: "/cockpit/uso-creditos",
        label: "Uso & Créditos",
        icon: AuditIcon,
      },
      { href: "/cockpit/ativos", label: "Biblioteca", icon: AssetsIcon },
      {
        href: "/cockpit/configuracoes",
        label: "Configurações",
        icon: SettingsIcon,
      },
    ],
  },
];

function isActiveHref(pathname: string, href: string) {
  return href === "/cockpit"
    ? pathname === "/cockpit"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Glyph = item.icon;

  return (
    <YziNavItem
      href={item.href}
      title={collapsed ? item.label : undefined}
      state={active ? "active" : "inactive"}
      className={collapsed ? "justify-center px-2" : "w-full"}
      icon={<Glyph className="h-5 w-5" />}
    >
      {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
    </YziNavItem>
  );
}

export function YziSidebar({
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
  const assistantActive = isActiveHref(pathname, "/cockpit/assistente");

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-bg-deep)] transition-[width] duration-[var(--duration-moderate)] ease-[var(--ease-standard)] ${
        collapsed ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-expanded)]"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-5 ${
          collapsed ? "flex-col" : "justify-between"
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <YziSurface
            aria-hidden
            variant="elevated"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--yzi-radius-md)] p-0 text-[var(--yzi-accent-action)]"
          >
            <YziMarkIcon className="h-5 w-5" />
          </YziSurface>
          {!collapsed ? (
            <span className="whitespace-nowrap text-sm font-semibold tracking-[0.08em] text-[var(--yzi-text-primary)]">
              YZI OS
            </span>
          ) : null}
        </div>
        <YziButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className="h-7 w-7 shrink-0 p-0 text-[var(--yzi-text-secondary)]"
        >
          <SidebarToggleIcon
            className={`h-4 w-4 transition-transform duration-[var(--duration-moderate)] ease-[var(--ease-standard)] ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </YziButton>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.eyebrow} className="mb-2 flex flex-col gap-0.5">
            {collapsed ? (
              <YziDivider className="mx-auto mb-1 w-6" />
            ) : (
              <span className="px-3 pb-1 text-[0.58rem] font-medium uppercase tracking-[0.2em] text-[var(--yzi-text-faint)]">
                {group.eyebrow}
              </span>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                collapsed={collapsed}
                active={isActiveHref(pathname, item.href)}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-[color:var(--yzi-border-subtle)] px-3 py-4">
        <YziNavItem
          href="/cockpit/assistente"
          title={collapsed ? "Assistente YZI" : undefined}
          state={assistantActive ? "active" : "inactive"}
          className={collapsed ? "justify-center px-2" : "w-full"}
          icon={
            <span aria-hidden className="relative grid h-5 w-5 place-items-center">
              <YziPresence
                state="ready"
                animated
                className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5"
              />
              <YziAssistantIcon className="h-5 w-5" />
            </span>
          }
        >
          {!collapsed ? (
            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-medium text-[var(--yzi-text-primary)]">
                Assistente YZI
              </span>
              <span className="text-[0.62rem] text-[var(--yzi-text-secondary)]">
                orquestradora · lendo cockpit
              </span>
            </span>
          ) : (
            <span className="sr-only">Assistente YZI</span>
          )}
        </YziNavItem>

        <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""}`}>
          <YziSurface
            aria-hidden
            variant="elevated"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full p-0 text-sm font-semibold"
          >
            {initial}
          </YziSurface>
          {collapsed ? (
            <LogoutButton iconOnly />
          ) : (
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-xs text-[var(--yzi-text-secondary)]">
                {operatorEmail ?? "Operador"}
              </span>
              <LogoutButton className="px-2 py-1 text-[0.7rem]" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
