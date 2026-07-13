"use client";

import { useId, useState } from "react";
import type { KeyboardEvent } from "react";

import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";

// Campos canônicos dos Entity Workspaces — o "schema visual do banco".
// Um único vocabulário de controles para Property, Broker e entidades
// futuras: nunca duplicar estes componentes por tela. Estado sempre
// controlado pelo Workspace (local, mock honesto); nenhum submit real.

const controlClass =
  "w-full rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2.5 text-[0.86rem] text-[var(--yzi-text-primary)] outline-none transition-colors placeholder:text-[var(--yzi-text-faint)] focus:border-[color:rgba(var(--imob-ice),0.35)]";

function FieldShell({
  label,
  hint,
  children,
  span2,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <div className={cx("flex flex-col gap-1.5", span2 && "sm:col-span-2")}>
      <span className="text-[0.72rem] text-[var(--yzi-text-secondary)]">{label}</span>
      {children}
      {hint ? (
        <span className="text-[0.66rem] text-[var(--yzi-text-faint)]">{hint}</span>
      ) : null}
    </div>
  );
}

/* WorkspaceField — texto simples; readonly vira valor "de sistema";
   `suggestions` transforma em autocomplete nativo (datalist). */
export function WorkspaceField({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
  hint,
  suggestions,
  span2,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  hint?: string;
  suggestions?: string[];
  span2?: boolean;
}) {
  const listId = useId();
  return (
    <FieldShell label={label} hint={hint} span2={span2}>
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        aria-readonly={readOnly || undefined}
        list={suggestions ? listId : undefined}
        className={cx(
          controlClass,
          readOnly &&
            "cursor-default bg-[var(--yzi-bg-deep)] font-mono text-[0.8rem] tracking-[0.04em] text-[var(--yzi-text-secondary)]",
        )}
      />
      {suggestions ? (
        <datalist id={listId}>
          {suggestions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      ) : null}
    </FieldShell>
  );
}

export function WorkspaceTextarea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  hint,
  span2,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  span2?: boolean;
}) {
  return (
    <FieldShell label={label} hint={hint} span2={span2}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={cx(controlClass, "resize-y leading-relaxed")}
      />
    </FieldShell>
  );
}

export function WorkspaceDropdown({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <FieldShell label={label} hint={hint}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={controlClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/* WorkspaceToggle — interruptor operacional (sim/não do schema). */
export function WorkspaceToggle({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex items-center justify-between gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2.5 text-left transition-colors hover:border-[color:rgba(var(--imob-ice),0.25)]"
    >
      <span className="flex min-w-0 flex-col">
        <span className="text-[0.82rem] text-[var(--yzi-text-primary)]">{label}</span>
        {hint ? (
          <span className="text-[0.66rem] text-[var(--yzi-text-faint)]">{hint}</span>
        ) : null}
      </span>
      <span
        aria-hidden
        className={cx(
          "relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-[var(--duration-fast)]",
          value
            ? "border-[color:rgba(var(--imob-ice),0.5)] bg-[rgba(var(--imob-cold),0.35)]"
            : "border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-bg-deep)]",
        )}
      >
        <span
          className={cx(
            "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-[left,background] duration-[var(--duration-fast)]",
            value
              ? "left-[calc(100%-1.05rem)] bg-[rgb(var(--imob-ice))]"
              : "left-[3px] bg-[var(--yzi-text-faint)]",
          )}
        />
      </span>
    </button>
  );
}

/* WorkspaceMultiSelect — chips de opções fixas, seleção múltipla. */
export function WorkspaceMultiSelect({
  label,
  options,
  value,
  onChange,
  hint,
  span2,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
  span2?: boolean;
}) {
  function toggle(option: string) {
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option],
    );
  }

  return (
    <FieldShell label={label} hint={hint} span2={span2}>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const selected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(option)}
              className={cx(
                "rounded-full border px-3 py-1 text-[0.72rem] transition-colors",
                selected
                  ? "border-[color:rgba(var(--imob-ice),0.45)] bg-[rgba(var(--imob-cold),0.16)] text-[rgb(var(--imob-ice))]"
                  : "border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-secondary)] hover:text-[var(--yzi-text-primary)]",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </FieldShell>
  );
}

/* WorkspaceTagInput — tags livres (Enter adiciona, × remove). */
export function WorkspaceTagInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  span2,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
  span2?: boolean;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const tag = draft.trim();
    if (!tag) return;
    if (!value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    }
    if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <FieldShell label={label} hint={hint} span2={span2}>
      <div
        className={cx(
          controlClass,
          "flex min-h-[2.75rem] flex-wrap items-center gap-1.5 py-2",
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-[color:rgba(var(--imob-ice),0.35)] bg-[rgba(var(--imob-cold),0.12)] px-2.5 py-0.5 text-[0.7rem] text-[rgb(var(--imob-ice))]"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remover ${tag}`}
              onClick={() => onChange(value.filter((item) => item !== tag))}
              className="text-[rgb(var(--imob-ice))] opacity-70 transition-opacity hover:opacity-100"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={value.length ? undefined : placeholder}
          className="min-w-[8ch] flex-1 bg-transparent text-[0.82rem] text-[var(--yzi-text-primary)] outline-none placeholder:text-[var(--yzi-text-faint)]"
        />
      </div>
    </FieldShell>
  );
}
