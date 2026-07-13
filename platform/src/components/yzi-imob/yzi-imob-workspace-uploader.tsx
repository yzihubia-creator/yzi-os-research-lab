"use client";

import { useState } from "react";

import { AttachmentIcon } from "@/components/yzi-os/yzi-icons";
import { cx } from "@/components/yzi-imob/yzi-imob-workspace-kit";

// WorkspaceUploader — área de arquivos estilo Airtable: cada arquivo é um
// Card (preview + tipo + status + observações), organizado por categoria.
// Upload real está fora de escopo: "Adicionar" cria um card local marcado
// como demonstração; nada é enviado a lugar nenhum (mock honesto).

export type WorkspaceFileStatus = "aprovado" | "em revisão" | "aguardando envio";

export type WorkspaceFile = {
  id: string;
  category: string;
  name: string;
  kind: string; // ex.: JPG, MP4, PDF
  status: WorkspaceFileStatus;
  note: string;
};

export type WorkspaceUploadCategory = { id: string; label: string };

const STATUS_TONE: Record<WorkspaceFileStatus, string> = {
  aprovado:
    "border-[color:rgba(var(--imob-ice),0.4)] bg-[rgba(var(--imob-cold),0.14)] text-[rgb(var(--imob-ice))]",
  "em revisão":
    "border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] text-[var(--yzi-text-secondary)]",
  "aguardando envio":
    "border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-faint)]",
};

export function WorkspaceUploader({
  categories,
  initialFiles,
}: {
  categories: WorkspaceUploadCategory[];
  initialFiles: WorkspaceFile[];
}) {
  const [files, setFiles] = useState<WorkspaceFile[]>(initialFiles);
  const [active, setActive] = useState<string>(categories[0]?.id ?? "");

  const visible = files.filter((file) => file.category === active);

  function addDemoFile() {
    const category = categories.find((item) => item.id === active);
    if (!category) return;
    setFiles((current) => [
      ...current,
      {
        id: `demo-${Date.now()}`,
        category: active,
        name: `${category.label.toLowerCase()}-${String(
          current.filter((file) => file.category === active).length + 1,
        ).padStart(2, "0")}`,
        kind: "Demo",
        status: "aguardando envio",
        note: "Card de demonstração — o envio real chega com o Creative Studio.",
      },
    ]);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Categorias — trilho horizontal, contagem honesta por categoria. */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((category) => {
          const count = files.filter((file) => file.category === category.id).length;
          const selected = active === category.id;
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setActive(category.id)}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.74rem] transition-colors",
                selected
                  ? "border-[color:rgba(var(--imob-ice),0.45)] bg-[rgba(var(--imob-cold),0.16)] text-[rgb(var(--imob-ice))]"
                  : "border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-secondary)] hover:text-[var(--yzi-text-primary)]",
              )}
            >
              {category.label}
              <span className="tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid de cards de arquivo. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((file) => (
          <article
            key={file.id}
            className="flex flex-col overflow-hidden rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] shadow-[var(--yzi-edge-highlight)]"
          >
            {/* Preview — placeholder honesto, nunca imagem falsa. */}
            <div className="grid h-24 place-items-center border-b border-[color:var(--yzi-border-subtle)] bg-[linear-gradient(160deg,rgba(var(--imob-deep),0.35),rgba(var(--imob-cold),0.08))]">
              <AttachmentIcon className="h-5 w-5 text-[var(--yzi-text-faint)]" />
            </div>
            <div className="flex flex-col gap-2 px-3.5 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[0.8rem] font-medium text-[var(--yzi-text-primary)]">
                  {file.name}
                </span>
                <span className="shrink-0 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-1.5 py-px text-[0.6rem] uppercase tracking-[0.1em] text-[var(--yzi-text-faint)]">
                  {file.kind}
                </span>
              </div>
              <span
                className={cx(
                  "w-fit rounded-full border px-2 py-0.5 text-[0.64rem]",
                  STATUS_TONE[file.status],
                )}
              >
                {file.status}
              </span>
              <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                {file.note}
              </p>
            </div>
          </article>
        ))}

        {/* Slot de adicionar — sempre por último, mesma malha. */}
        <button
          type="button"
          onClick={addDemoFile}
          className="flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-faint)] transition-colors hover:border-[color:rgba(var(--imob-ice),0.35)] hover:text-[var(--yzi-text-secondary)]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full border border-[color:var(--yzi-border-subtle)]">
            +
          </span>
          <span className="text-[0.74rem]">Adicionar card (demonstração)</span>
        </button>
      </div>

      <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Nenhum arquivo é enviado — os cards são locais e ilustram o padrão de
        organização por categoria.
      </p>
    </div>
  );
}
