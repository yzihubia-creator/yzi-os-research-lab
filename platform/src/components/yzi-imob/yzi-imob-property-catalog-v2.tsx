"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { YziPresence } from "@/components/yzi-os/yzi-primitives";
import {
  GridIcon,
  PlusIcon,
  PropertyIcon,
} from "@/components/yzi-imob/yzi-imob-icons-v2";
import { SearchIcon } from "@/components/yzi-os/yzi-icons";
import {
  ACTIVATION_META,
  DEMO_PROPERTIES,
  STATUS_META,
  toInspection,
  type ActivationLevel,
  type DemoProperty,
  type PropertyStatus,
} from "@/components/yzi-imob/yzi-imob-catalog-mock";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import { imobRgba, PROPERTY_STATUS_ACCENT } from "@/components/yzi-imob/yzi-imob-status-colors";

// Property Catalog Workspace v2 — primeiro Workspace real dentro do casco novo.
// Canvas alterna Catalog View ↔ Gallery View (Property Catalog Wireframe v1.1),
// uma tarefa principal por vez. Selecionar um imóvel publica a leitura da YZI no
// Inspector (via workspace context). Dados de demonstração honestos: sem
// backend, API, banco, Runtime ou tool real.

type View = "catalog" | "gallery";
type StatusFilter = "todos" | PropertyStatus;

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "pendencias", label: "Com pendências" },
  { value: "publicar", label: "Prontos" },
  { value: "organizando", label: "Organizando" },
  { value: "rascunho", label: "Rascunho" },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusDot({ status }: { status: PropertyStatus }) {
  const role = PROPERTY_STATUS_ACCENT[status];
  return (
    <span
      aria-hidden
      className="h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: imobRgba(role, 0.9) }}
    />
  );
}

function ReadyPill({ label, ready }: { label: string; ready: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.66rem]"
      style={{
        borderColor: ready ? imobRgba("primary", 0.32) : "var(--yzi-border-subtle)",
        color: ready ? imobRgba("ice", 0.95) : "var(--yzi-text-faint)",
      }}
    >
      <span
        aria-hidden
        className="h-1 w-1 rounded-full"
        style={{
          backgroundColor: ready ? imobRgba("primary", 0.9) : "var(--yzi-text-faint)",
        }}
      />
      {label} {ready ? "pronta" : "pendente"}
    </span>
  );
}

function ActivationBadge({ level }: { level: ActivationLevel }) {
  const meta = ACTIVATION_META[level];
  return (
    <span
      className="inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[0.64rem] font-medium tracking-[0.02em]"
      style={{
        borderColor: imobRgba(meta.accent, 0.32),
        backgroundColor: imobRgba(meta.accent, 0.1),
        color: imobRgba(meta.accent, 0.95),
      }}
      title={meta.objetivo}
    >
      {meta.label}
    </span>
  );
}

function CompletenessBar({ value }: { value: number }) {
  // Gradiente frio (petrol → primary), nunca verde — leitura qualitativa de
  // prontidão comercial, não KPI de sucesso.
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--yzi-surface-elevated)] shadow-[var(--yzi-glass-stroke-inner)]">
        <div
          className="h-full rounded-full transition-[width] duration-[var(--duration-moderate)] ease-[var(--ease-standard)]"
          style={{
            width: `${value}%`,
            backgroundImage: `linear-gradient(90deg, ${imobRgba("petrol", 0.9)}, ${imobRgba("primary", 0.9)})`,
          }}
        />
      </div>
      <span className="shrink-0 text-[0.7rem] tabular-nums text-[var(--yzi-text-secondary)]">
        {value}%
      </span>
    </div>
  );
}

function StatusLabel({ status }: { status: PropertyStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.72rem] text-[var(--yzi-text-secondary)]">
      <StatusDot status={status} />
      {STATUS_META[status].label}
    </span>
  );
}

function CatalogRow({
  property,
  active,
  onSelect,
}: {
  property: DemoProperty;
  active: boolean;
  onSelect: () => void;
}) {
  const stateRole = PROPERTY_STATUS_ACCENT[property.status];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cx(
        "group grid w-full grid-cols-[1fr] items-center gap-3 rounded-[var(--yzi-radius-md)] border border-l-[3px] px-5 py-4 text-left shadow-[var(--yzi-edge-highlight)] transition-[background,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.6fr)_auto]",
        active
          ? "border-[color:rgba(var(--imob-ice),0.4)] bg-[rgba(var(--imob-cold),0.1)]"
          : "border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] hover:border-[color:var(--yzi-border-strong)] hover:bg-[var(--yzi-surface-elevated)]",
      )}
      style={{ borderLeftColor: imobRgba(stateRole, active ? 0.75 : 0.4) }}
    >
      <span className="flex min-w-0 items-center gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] text-[var(--yzi-text-secondary)] shadow-[var(--yzi-edge-highlight)]">
          <PropertyIcon className="h-5 w-5" />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[0.95rem] font-medium text-[var(--yzi-text-primary)]">
            {property.name}
          </span>
          <span className="truncate text-[0.74rem] text-[var(--yzi-text-secondary)]">
            {property.neighborhood} · {property.city}
          </span>
        </span>
      </span>

      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="flex flex-wrap items-center gap-2">
          <StatusLabel status={property.status} />
          <ActivationBadge level={property.activation} />
        </span>
        <CompletenessBar value={property.completeness} />
      </span>

      <span className="flex flex-col items-start gap-1.5 md:items-end">
        <span className="flex items-center gap-1.5">
          <ReadyPill label="Mídia" ready={property.media === "pronta"} />
          <ReadyPill
            label="Publicação"
            ready={property.publication === "pronta"}
          />
        </span>
        <span className="text-[0.72rem] text-[var(--yzi-text-faint)]">
          Próximo: {property.nextStep}
        </span>
      </span>
    </button>
  );
}

function GalleryCard({
  property,
  active,
  onSelect,
}: {
  property: DemoProperty;
  active: boolean;
  onSelect: () => void;
}) {
  const stateRole = PROPERTY_STATUS_ACCENT[property.status];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cx(
        "group flex flex-col gap-4 rounded-[var(--yzi-radius-md)] border border-t-[3px] p-5 text-left shadow-[var(--yzi-edge-highlight)] transition-[background,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        active
          ? "border-[color:rgba(var(--imob-ice),0.4)] bg-[rgba(var(--imob-cold),0.1)]"
          : "border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] hover:border-[color:var(--yzi-border-strong)] hover:bg-[var(--yzi-surface-elevated)]",
      )}
      style={{ borderTopColor: imobRgba(stateRole, active ? 0.75 : 0.4) }}
    >
      <span className="relative grid aspect-[16/10] w-full place-items-center overflow-hidden rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[radial-gradient(120%_120%_at_28%_8%,rgba(var(--imob-cold),0.2),transparent_58%),linear-gradient(160deg,var(--yzi-surface-elevated),var(--yzi-surface-base))] text-[var(--yzi-text-secondary)] shadow-[var(--yzi-glass-stroke-inner)]">
        <span className="flex flex-col items-center gap-2">
          <PropertyIcon className="h-7 w-7 text-[rgb(var(--imob-ice))] opacity-80" />
          <span className="text-[0.66rem] text-[var(--yzi-text-faint)]">
            {property.media === "pronta" ? "Capa pronta" : "Sem capa ainda"}
          </span>
        </span>
      </span>
      <span className="flex flex-col gap-2">
        <span className="flex flex-col gap-0.5">
          <span className="truncate text-[0.95rem] font-medium text-[var(--yzi-text-primary)]">
            {property.name}
          </span>
          <span className="truncate text-[0.74rem] text-[var(--yzi-text-secondary)]">
            {property.neighborhood} · {property.city}
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-2">
          <StatusLabel status={property.status} />
          <ActivationBadge level={property.activation} />
        </span>
        <CompletenessBar value={property.completeness} />
      </span>
    </button>
  );
}

function EmptyResult({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-faint)]">
        <SearchIcon className="h-6 w-6" />
      </span>
      <p className="max-w-sm text-[0.92rem] leading-relaxed text-[var(--yzi-text-primary)]">
        Nenhum imóvel corresponde a{" "}
        <span className="text-[var(--yzi-text-secondary)]">“{query}”</span>.
      </p>
      <p className="max-w-sm text-[0.78rem] text-[var(--yzi-text-secondary)]">
        Ajuste a busca ou os filtros para encontrar o imóvel.
      </p>
    </div>
  );
}

export function YziImobPropertyCatalogV2() {
  const router = useRouter();
  const { select, inspection } = useYziImobWorkspace();
  const [view, setView] = useState<View>("catalog");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_PROPERTIES.filter((property) => {
      const matchesStatus =
        statusFilter === "todos" || property.status === statusFilter;
      const matchesQuery =
        q.length === 0 ||
        `${property.name} ${property.neighborhood} ${property.city}`
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);

  const pending = DEMO_PROPERTIES.filter(
    (p) => p.status === "pendencias",
  ).length;
  const ready = DEMO_PROPERTIES.filter((p) => p.status === "publicar").length;

  function handleSelect(property: DemoProperty) {
    setSelectedId(property.id);
    select(toInspection(property));
    router.push(`/cockpit/yzi-imob/imoveis/${property.id}`);
  }

  // Mantém o card em destaque coerente com o Inspector aberto.
  const activeId = inspection ? selectedId : null;

  return (
    <section className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-8 px-8 py-10">
      {/* Cabeçalho do Workspace — decisão primeiro, sem métricas em destaque. */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <YziPresence state="ready" animated />
          <span className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[var(--yzi-text-secondary)]">
            Imóveis
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.01em] text-[var(--yzi-text-primary)]">
            Seu catálogo de imóveis
          </h1>
          <p className="max-w-xl text-[0.92rem] leading-relaxed text-[var(--yzi-text-secondary)]">
            {ready > 0
              ? `Hoje vale publicar ${ready} ${ready === 1 ? "imóvel" : "imóveis"}. ${
                  pending > 0
                    ? `${pending} ${pending === 1 ? "precisa" : "precisam"} de mídia antes de seguir.`
                    : "Selecione um imóvel para eu mostrar o próximo passo."
                }`
              : "Selecione um imóvel para eu mostrar pendências e o próximo passo."}
          </p>
        </div>
      </header>

      {/* Toolbar (grupos oficiais): Busca · Filtros · View · Novo imóvel. */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3.5 py-2.5 shadow-[var(--yzi-edge-highlight)] transition-colors focus-within:border-[color:rgba(var(--imob-ice),0.35)]">
            <SearchIcon className="h-4 w-4 shrink-0 text-[var(--yzi-text-faint)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, bairro ou cidade"
              className="min-w-0 flex-1 bg-transparent text-[0.86rem] text-[var(--yzi-text-primary)] outline-none placeholder:text-[var(--yzi-text-faint)]"
            />
          </label>

          <div className="flex items-center gap-1 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] p-1 shadow-[var(--yzi-edge-highlight)]">
            <ViewToggle
              active={view === "catalog"}
              onClick={() => setView("catalog")}
              label="Lista"
            >
              <PropertyIcon className="h-4 w-4" />
            </ViewToggle>
            <ViewToggle
              active={view === "gallery"}
              onClick={() => setView("gallery")}
              label="Galeria"
            >
              <GridIcon className="h-4 w-4" />
            </ViewToggle>
          </div>

          <button
            type="button"
            onClick={() => router.push("/cockpit/yzi-imob/imoveis/novo")}
            title="Abrir o Workspace de um novo imóvel"
            className="inline-flex shrink-0 items-center gap-2 rounded-[var(--yzi-radius-md)] border border-[color:rgba(var(--imob-ice),0.3)] bg-[rgba(var(--imob-cold),0.1)] px-3.5 py-2.5 text-[0.82rem] font-medium text-[rgb(var(--imob-ice))] shadow-[var(--yzi-edge-highlight)] transition-colors hover:bg-[rgba(var(--imob-cold),0.16)]"
          >
            <PlusIcon className="h-4 w-4" />
            Novo imóvel
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={cx(
                "rounded-full border px-3 py-1.5 text-[0.74rem] transition-colors duration-[var(--duration-fast)]",
                statusFilter === filter.value
                  ? "border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-elevated)] text-[var(--yzi-text-primary)]"
                  : "border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-secondary)] hover:text-[var(--yzi-text-primary)]",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas: Catálogo (uma tarefa por vez). */}
      {filtered.length === 0 ? (
        <EmptyResult query={query.trim()} />
      ) : view === "catalog" ? (
        <div className="flex flex-col gap-2.5">
          {filtered.map((property) => (
            <CatalogRow
              key={property.id}
              property={property}
              active={activeId === property.id}
              onSelect={() => handleSelect(property)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <GalleryCard
              key={property.id}
              property={property}
              active={activeId === property.id}
              onSelect={() => handleSelect(property)}
            />
          ))}
        </div>
      )}

      {/* Nota honesta — catálogo de demonstração, sem operação real. */}
      <p className="mt-2 text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Catálogo de demonstração. Nenhum imóvel real, nenhuma mídia enviada e
        nenhuma publicação — o cadastro real entra em breve.
      </p>
    </section>
  );
}

function ViewToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={active}
      className={cx(
        "grid h-8 w-8 place-items-center rounded-[var(--yzi-radius-sm)] transition-colors duration-[var(--duration-fast)]",
        active
          ? "bg-[var(--yzi-surface-elevated)] text-[var(--yzi-text-primary)]"
          : "text-[var(--yzi-text-faint)] hover:text-[var(--yzi-text-secondary)]",
      )}
    >
      {children}
    </button>
  );
}
