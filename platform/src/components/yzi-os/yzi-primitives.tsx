import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

import { YziIcon } from "@/components/yzi-os/yzi-icons";

type Tone =
  | "preview"
  | "action"
  | "opportunity"
  | "authorization"
  | "risk"
  | "trust"
  | "blocked"
  | "neutral";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const toneClasses: Record<Tone, string> = {
  preview:
    "border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-state-preview-soft)] text-[var(--yzi-state-preview)]",
  action:
    "border-[color:rgba(63,224,197,0.35)] bg-[var(--yzi-accent-action-soft)] text-[var(--yzi-accent-action)]",
  opportunity:
    "border-[color:rgba(95,215,155,0.35)] bg-[var(--yzi-accent-opportunity-soft)] text-[var(--yzi-accent-opportunity)]",
  authorization:
    "border-[color:rgba(167,139,250,0.38)] bg-[var(--yzi-accent-authorization-soft)] text-[var(--yzi-accent-authorization)]",
  risk:
    "border-[color:rgba(232,177,76,0.38)] bg-[var(--yzi-accent-risk-soft)] text-[var(--yzi-accent-risk)]",
  trust:
    "border-[color:rgba(94,155,240,0.32)] bg-[var(--yzi-accent-trust-soft)] text-[var(--yzi-accent-trust)]",
  blocked:
    "border-[color:rgba(196,107,90,0.38)] bg-[var(--yzi-state-blocked-soft)] text-[var(--yzi-state-blocked)]",
  neutral:
    "border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] text-[var(--yzi-text-secondary)]",
};

export type YziSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "base" | "elevated" | "overlay";
  framed?: boolean;
};

export function YziSurface({
  variant = "base",
  framed = true,
  className,
  ...props
}: YziSurfaceProps) {
  const variants = {
    base: "bg-[var(--yzi-surface-base)]",
    elevated: "bg-[var(--yzi-surface-elevated)] shadow-[var(--yzi-shadow-elevated)]",
    overlay: "bg-[var(--yzi-surface-overlay)] shadow-[var(--yzi-shadow-overlay)]",
  };

  return (
    <div
      className={cx(
        "text-[var(--yzi-text-primary)]",
        framed &&
          "rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export type YziPanelProps = HTMLAttributes<HTMLDivElement> & {
  variant?:
    | "default"
    | "command"
    | "presence"
    | "yzi"
    | "authorization"
    | "risk"
    | "trust";
};

export function YziPanel({
  variant = "default",
  className,
  ...props
}: YziPanelProps) {
  const variants = {
    default:
      "border-[color:var(--yzi-border-subtle)] bg-[linear-gradient(180deg,var(--yzi-surface-elevated),var(--yzi-surface-base))]",
    command:
      "border-[color:var(--yzi-border-subtle)] bg-[linear-gradient(180deg,var(--yzi-surface-elevated),var(--yzi-surface-base))]",
    yzi:
      "border-[color:rgba(63,224,197,0.28)] bg-[linear-gradient(180deg,rgba(63,224,197,0.06),var(--yzi-surface-base))]",
    presence:
      "border-[color:rgba(63,224,197,0.28)] bg-[linear-gradient(180deg,rgba(63,224,197,0.06),var(--yzi-surface-base))]",
    authorization:
      "border-[color:rgba(167,139,250,0.35)] bg-[linear-gradient(180deg,rgba(167,139,250,0.05),var(--yzi-surface-base))]",
    risk:
      "border-[color:rgba(232,177,76,0.35)] bg-[linear-gradient(180deg,rgba(232,177,76,0.07),var(--yzi-surface-base))]",
    trust:
      "border-[color:rgba(94,155,240,0.25)] bg-[linear-gradient(180deg,rgba(94,155,240,0.045),var(--yzi-surface-base))]",
  };

  return (
    <section
      className={cx(
        "rounded-[var(--yzi-radius-md)] border p-4 text-[var(--yzi-text-primary)]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export type YziButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "authorization" | "danger";
  size?: "sm" | "md";
};

export function YziButton({
  variant = "secondary",
  size = "md",
  className,
  type = "button",
  ...props
}: YziButtonProps) {
  const variants = {
    primary:
      "border-transparent bg-[var(--yzi-accent-action)] text-[#04231F] shadow-[var(--yzi-glow-action)] hover:brightness-110",
    secondary:
      "border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] text-[var(--yzi-text-primary)] hover:bg-[var(--yzi-surface-elevated)]",
    ghost:
      "border-[color:var(--yzi-border-strong)] bg-transparent text-[var(--yzi-text-primary)] hover:bg-[rgba(255,255,255,0.025)]",
    authorization:
      "border-[color:rgba(167,139,250,0.45)] bg-[var(--yzi-accent-authorization-soft)] text-[var(--yzi-accent-authorization)] hover:border-[color:rgba(167,139,250,0.65)]",
    danger:
      "border-[color:rgba(196,107,90,0.5)] bg-transparent text-[var(--yzi-state-blocked)] hover:bg-[var(--yzi-state-blocked-soft)]",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-[var(--yzi-radius-sm)] border font-semibold tracking-[0.01em] transition-[background,border-color,color,filter] duration-[var(--duration-fast)] ease-[var(--ease-standard)] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

export type YziBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

export function YziBadge({
  tone = "neutral",
  className,
  ...props
}: YziBadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none tracking-[0.02em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

export type YziStatusBadgeProps = YziBadgeProps & {
  dot?: boolean;
};

export function YziStatusBadge({
  tone = "neutral",
  dot = true,
  className,
  children,
  ...props
}: YziStatusBadgeProps) {
  return (
    <YziBadge tone={tone} className={cx("uppercase", className)} {...props}>
      {dot ? (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-current"
        />
      ) : null}
      {children}
    </YziBadge>
  );
}

export type YziAlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "info" | "success" | "warning" | "risk" | "blocked" | "authorization";
  title?: ReactNode;
  action?: ReactNode;
};

export function YziAlert({
  tone = "info",
  title,
  action,
  children,
  className,
  ...props
}: YziAlertProps) {
  const tones = {
    info: toneClasses.trust,
    success: toneClasses.opportunity,
    warning: toneClasses.preview,
    risk: toneClasses.risk,
    blocked: toneClasses.blocked,
    authorization: toneClasses.authorization,
  };

  return (
    <div
      className={cx(
        "flex gap-3 rounded-[var(--yzi-radius-md)] border p-3",
        tones[tone],
        className,
      )}
      role="status"
      {...props}
    >
      <span aria-hidden className="mt-1 h-8 w-0.5 rounded-full bg-current" />
      <div className="min-w-0 flex-1">
        {title ? <div className="text-sm font-semibold">{title}</div> : null}
        {children ? (
          <div className="mt-1 text-sm text-[var(--yzi-text-secondary)]">
            {children}
          </div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export type YziInputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: "default" | "composer";
};

export function YziInput({
  variant = "default",
  className,
  ...props
}: YziInputProps) {
  const variants = {
    default:
      "bg-[var(--yzi-surface-base)] px-3 py-2 text-sm",
    composer:
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.035),var(--yzi-surface-base))] px-4 py-3 text-[15px]",
  };

  return (
    <input
      className={cx(
        "w-full rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-strong)] text-[var(--yzi-text-primary)] outline-none transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] placeholder:text-[var(--yzi-text-faint)] focus:border-[color:rgba(63,224,197,0.42)] focus:shadow-[0_0_0_3px_var(--yzi-accent-action-soft)]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export type YziNavItemProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  state?: "active" | "inactive" | "disabled";
  icon?: ReactNode;
};

export function YziNavItem({
  state = "inactive",
  icon,
  className,
  children,
  "aria-disabled": ariaDisabled,
  ...props
}: YziNavItemProps) {
  const disabled = state === "disabled" || ariaDisabled === true;
  const states = {
    active:
      "bg-[var(--yzi-accent-action-soft)] text-[var(--yzi-accent-action)]",
    inactive:
      "text-[var(--yzi-text-secondary)] hover:bg-[rgba(255,255,255,0.025)] hover:text-[var(--yzi-text-primary)]",
    disabled:
      "pointer-events-none text-[var(--yzi-text-faint)] opacity-60",
  };

  return (
    <a
      className={cx(
        "inline-flex items-center gap-2 rounded-[var(--yzi-radius-sm)] px-3 py-2 text-sm transition-[background,color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        states[state],
        className,
      )}
      aria-current={state === "active" ? "page" : undefined}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {icon ? (
        <span className="inline-flex shrink-0 text-current">{icon}</span>
      ) : null}
      <span className="min-w-0 truncate">{children}</span>
    </a>
  );
}

export type YziDockProps = HTMLAttributes<HTMLElement>;

export function YziDock({ className, ...props }: YziDockProps) {
  return (
    <aside
      className={cx(
        "rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[linear-gradient(180deg,var(--yzi-surface-overlay),var(--yzi-surface-base))] p-4 text-[var(--yzi-text-primary)] shadow-[var(--yzi-shadow-overlay)]",
        className,
      )}
      {...props}
    />
  );
}

export type YziDividerProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function YziDivider({
  orientation = "horizontal",
  className,
  ...props
}: YziDividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cx(
        orientation === "horizontal"
          ? "h-px w-full bg-[var(--yzi-border-subtle)]"
          : "h-full w-px bg-[var(--yzi-border-subtle)]",
        className,
      )}
      {...props}
    />
  );
}

export type YziPresenceProps = HTMLAttributes<HTMLSpanElement> & {
  state?: "idle" | "ready" | "preview" | "blocked";
  animated?: boolean;
};

export function YziPresence({
  state = "ready",
  animated = false,
  className,
  ...props
}: YziPresenceProps) {
  const states = {
    idle: "bg-[var(--yzi-text-faint)] shadow-none",
    ready:
      "bg-[var(--yzi-presence)] shadow-[0_0_0_4px_var(--yzi-presence-soft)]",
    preview:
      "bg-[var(--yzi-state-preview)] shadow-[0_0_0_4px_var(--yzi-state-preview-soft)]",
    blocked:
      "bg-[var(--yzi-state-blocked)] shadow-[0_0_0_4px_var(--yzi-state-blocked-soft)]",
  };

  return (
    <span
      aria-hidden
      className={cx(
        "inline-block h-2 w-2 rounded-full",
        states[state],
        animated && "animate-yzi-breathe",
        className,
      )}
      {...props}
    />
  );
}

export { YziIcon };
