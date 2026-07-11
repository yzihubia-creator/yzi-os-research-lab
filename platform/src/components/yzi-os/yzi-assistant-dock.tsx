"use client";

import { useState } from "react";
import type { ComponentType, SVGProps } from "react";

import {
  YziButton,
  YziDock,
  YziDivider,
  YziInput,
  YziPanel,
  YziPresence,
  YziStatusBadge,
} from "@/components/yzi-os/yzi-primitives";
import {
  ActionsIcon,
  AuditIcon,
  AuthorizationIcon,
  DeepThinkingIcon,
  SendIcon,
  SidebarToggleIcon,
  YziAssistantIcon,
} from "@/components/yzi-os/yzi-icons";

type QuickAction = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  authorize?: boolean;
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Explicar", icon: DeepThinkingIcon },
  { label: "Preparar ação", icon: ActionsIcon },
  { label: "Ver rastro", icon: AuditIcon },
  { label: "Autorizar", icon: AuthorizationIcon, authorize: true },
];

const STATUS_CHIPS = ["preview", "somente leitura", "ações exigem autorização"];

export function YziAssistantDock({
  defaultCollapsed = false,
}: {
  defaultCollapsed?: boolean;
} = {}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [ask, setAsk] = useState("");

  if (collapsed) {
    return (
      <YziDock className="hidden w-[3.25rem] shrink-0 flex-col items-center gap-3 rounded-none border-y-0 border-r-0 py-4 lg:flex">
        <YziButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(false)}
          aria-label="Expandir copiloto YZI"
          title="Expandir copiloto YZI"
          className="relative h-9 w-9 p-0 text-[var(--yzi-accent-action)]"
        >
          <YziPresence
            state="ready"
            animated
            className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5"
          />
          <YziAssistantIcon className="h-5 w-5" />
        </YziButton>
        <span
          aria-hidden
          className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[var(--yzi-text-secondary)] [writing-mode:vertical-rl]"
        >
          YZI
        </span>
      </YziDock>
    );
  }

  return (
    <YziDock className="hidden w-[21rem] shrink-0 flex-col rounded-none border-y-0 border-r-0 p-0 lg:flex xl:w-[23rem]">
      <header className="flex items-start justify-between gap-3 px-4 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-elevated)] text-[var(--yzi-accent-action)]"
          >
            <YziPresence
              state="ready"
              animated
              className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5"
            />
            <YziAssistantIcon className="h-5 w-5" />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold tracking-[0.08em] text-[var(--yzi-text-primary)]">
              YZI
            </span>
            <span className="flex items-center gap-1.5 text-[0.68rem] text-[var(--yzi-text-secondary)]">
              <YziPresence state="ready" className="h-1.5 w-1.5" />
              orquestradora · lendo cockpit
            </span>
          </div>
        </div>
        <YziButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(true)}
          aria-label="Recolher copiloto YZI"
          title="Recolher copiloto YZI"
          className="h-7 w-7 shrink-0 p-0 text-[var(--yzi-text-secondary)]"
        >
          <SidebarToggleIcon className="h-4 w-4 rotate-180" />
        </YziButton>
      </header>

      <YziDivider />

      <div className="flex flex-wrap gap-1.5 px-4 py-3">
        {STATUS_CHIPS.map((chip) => (
          <YziStatusBadge key={chip} tone="preview">
            {chip}
          </YziStatusBadge>
        ))}
      </div>

      <YziDivider />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        <YziPanel variant="presence" className="flex items-start gap-2.5 p-3">
          <DeepThinkingIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--yzi-accent-trust)]" />
          <p className="text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
            A YZI lê o cockpit e prepara próximos passos.
          </p>
        </YziPanel>

        <YziPanel variant="presence" className="p-3">
          <div className="mb-1.5 flex items-center gap-2 text-[var(--yzi-text-secondary)]">
            <YziAssistantIcon className="h-4 w-4" />
            <h3 className="text-[0.66rem] font-semibold uppercase tracking-[0.14em]">
              YZI recomenda
            </h3>
          </div>
          <p className="text-sm text-[var(--yzi-text-primary)]">
            Sem recomendações no momento.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
            Recomendações exigem autorização.
          </p>
        </YziPanel>
      </div>

      <YziDivider />

      <div className="grid grid-cols-2 gap-1.5 px-4 py-3">
        {QUICK_ACTIONS.map((action) => {
          const Glyph = action.icon;
          return (
            <YziButton
              key={action.label}
              type="button"
              title={`${action.label}: preview`}
              variant={action.authorize ? "authorization" : "ghost"}
              size="sm"
              className="text-[0.7rem]"
            >
              <Glyph className="h-3.5 w-3.5 shrink-0" />
              {action.label}
            </YziButton>
          );
        })}
      </div>

      <YziDivider />

      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <label htmlFor="yzi-dock-ask" className="sr-only">
            Pergunte à YZI sobre a operação
          </label>
          <YziInput
            id="yzi-dock-ask"
            value={ask}
            onChange={(event) => setAsk(event.target.value)}
            placeholder="Pergunte à YZI…"
            variant="composer"
            className="min-w-0 flex-1 py-2 text-sm"
          />
          <YziButton
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Perguntar à YZI"
            title="Perguntar à YZI"
            className="h-9 w-9 shrink-0 p-0"
          >
            <SendIcon className="h-4 w-4" />
          </YziButton>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[0.62rem] leading-relaxed text-[var(--yzi-text-faint)]">
          <AuthorizationIcon className="h-3.5 w-3.5 shrink-0 text-[var(--yzi-accent-authorization)]" />
          Preview. Ações externas exigem autorização.
        </p>
      </div>
    </YziDock>
  );
}
