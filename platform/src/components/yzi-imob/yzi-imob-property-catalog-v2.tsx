"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { YziPresence } from "@/components/yzi-os/yzi-primitives";
import {
  GridIcon,
  PropertyIcon,
} from "@/components/yzi-imob/yzi-imob-icons-v2";
import { SearchIcon } from "@/components/yzi-os/yzi-icons";
import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";
import {
  formatPropertyLocation,
  formatPropertyPrice,
  PROPERTY_QUALITY_ACCENT,
  PROPERTY_QUALITY_LABEL,
  propertyStatusAccent,
  propertyStatusColor,
  propertyStatusLabel,
} from "@/components/yzi-imob/properties/property-view-helpers";
import { computePropertyCompleteness } from "@/lib/yzi-imob/properties/completeness";
import { computePropertyQuality } from "@/lib/yzi-imob/properties/quality";
import {
  PROPERTY_STATUS_VALUES,
  type Property,
  type PropertyStatus,
} from "@/lib/yzi-imob/properties/types";

// Property Catalog Workspace v2 — Canvas alterna Catalog View ↔ Gallery View
// (Property Catalog Wireframe v1.1), uma tarefa principal por vez. Dados
// reais, tenant-scoped (buscados no server em app/.../imoveis/page.tsx).
// Completude e qualidade vêm sempre dos módulos reais
// (lib/yzi-imob/properties/completeness.ts, quality.ts) — nunca recalculados
// aqui. O Inspector (select() do workspace-context) exige um shape
// `YziInspection` (situação/pendências/checklist/score) incompatível com o
// schema real enxuto — contrato pendente, não chamado aqui.

type View = "catalog" | "gallery";
type StatusFilter = "todos" | PropertyStatus;

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "todos", label: "Todos" },
  ...PROPERTY_STATUS_VALUES.map((status) => ({
    value: status,
    label: propertyStatusLabel(status),
  })),
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusDot({ status }: { status: string }) {
  return (
    <span
      aria-hidden
      className="h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: propertyStatusColor(status, 0.9) }}
    />
  );
}

function StatusLabel({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.72rem] text-[var(--yzi-text-secondary)]">
      <StatusDot status={status} />
      {propertyStatusLabel(status)}
    </span>
  );
}

function QualityBadge({ level }: { level: keyof typeof PROPERTY_QUALITY_LABEL }) {
  return (
    <span
      className="inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[0.64rem] font-medium tracking-[0.02em]"
      style={{
        borderColor: imobRgba(PROPERTY_QUALITY_ACCENT[level], 0.32),
        backgroundColor: imobRgba(PROPERTY_QUALITY_ACCENT[level], 0.1),
        color: imobRgba(PROPERTY_QUALITY_ACCENT[level], 0.95),
      }}
    >
      {PROPERTY_QUALITY_LABEL[level]}
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

function CatalogRow({
  property,
  onSelect,
}: {
  property: Property;
  onSelect: () => void;
}) {
  const stateRole = propertyStatusAccent(property.status);
  const completeness = computePropertyCompleteness(property);
  const quality = computePropertyQuality(property);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "group grid w-full grid-cols-[1fr] items-center gap-3 rounded-[var(--yzi-radius-md)] border border-l-[3px] px-5 py-4 text-left shadow-[var(--yzi-edge-highlight)] transition-[background,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.6fr)_auto]",
        "border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] hover:border-[color:var(--yzi-border-strong)] hover:bg-[var(--yzi-surface-elevated)]",
      )}
      style={{ borderLeftColor: imobRgba(stateRole, 0.4) }}
    >
      <span className="flex min-w-0 items-center gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] text-[var(--yzi-text-secondary)] shadow-[var(--yzi-edge-highlight)]">
          <PropertyIcon className="h-5 w-5" />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[0.95rem] font-medium text-[var(--yzi-text-primary)]">
            {property.title}
          </span>
          <span className="truncate text-[0.74rem] text-[var(--yzi-text-secondary)]">
            {formatPropertyLocation(property.city, property.neighborhood)}
          </span>
        </span>
      </span>

      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="flex flex-wrap items-center gap-2">
          <StatusLabel status={property.status} />
          <QualityBadge level={quality.level} />
        </span>
        <CompletenessBar value={completeness.percentage} />
      </span>

      <span className="flex flex-col items-start gap-1.5 md:items-end">
        <span className="text-[0.86rem] font-medium text-[var(--yzi-text-primary)]">
          {formatPropertyPrice(property.price)}
        </span>
        <span className="text-[0.72rem] text-[var(--yzi-text-faint)]">
          {property.referenceCode ?? "Sem referência"}
        </span>
      </span>
    </button>
  );
}

function GalleryCard({
  property,
  onSelect,
}: {
  property: Property;
  onSelect: () => void;
}) {
  const stateRole = propertyStatusAccent(property.status);
  const completeness = computePropertyCompleteness(property);
  const quality = computePropertyQuality(property);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "group flex flex-col gap-4 rounded-[var(--yzi-radius-md)] border border-t-[3px] p-5 text-left shadow-[var(--yzi-edge-highlight)] transition-[background,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        "border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] hover:border-[color:var(--yzi-border-strong)] hover:bg-[var(--yzi-surface-elevated)]",
      )}
      style={{ borderTopColor: imobRgba(stateRole, 0.4) }}
    >
      <span className="relative grid aspect-[16/10] w-full place-items-center overflow-hidden rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[radial-gradient(120%_120%_at_28%_8%,rgba(var(--imob-cold),0.2),transparent_58%),linear-gradient(160deg,var(--yzi-surface-elevated),var(--yzi-surface-base))] text-[var(--yzi-text-secondary)] shadow-[var(--yzi-glass-stroke-inner)]">
        <span className="flex flex-col items-center gap-2">
          <PropertyIcon className="h-7 w-7 text-[rgb(var(--imob-ice))] opacity-80" />
          <span className="text-[0.66rem] text-[var(--yzi-text-faint)]">Sem mídia ainda</span>
        </span>
      </span>
      <span className="flex flex-col gap-2">
        <span className="flex flex-col gap-0.5">
          <span className="truncate text-[0.95rem] font-medium text-[var(--yzi-text-primary)]">
            {property.title}
          </span>
          <span className="truncate text-[0.74rem] text-[var(--yzi-text-secondary)]">
            {formatPropertyLocation(property.city, property.neighborhood)}
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-2">
          <StatusLabel status={property.status} />
          <QualityBadge level={quality.level} />
        </span>
        <CompletenessBar value={completeness.percentage} />
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
        <span className="text-[var(--yzi-text-secondary)]">&ldquo;{query}&rdquo;</span>.
      </p>
      <p className="max-w-sm text-[0.78rem] text-[var(--yzi-text-secondary)]">
        Ajuste a busca ou os filtros para encontrar o imóvel.
      </p>
    </div>
  );
}

function EmptyCatalog({ membershipMissing }: { membershipMissing: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-faint)]">
        <PropertyIcon className="h-6 w-6" />
      </span>
      {membershipMissing ? (
        <>
          <p className="max-w-sm text-[0.92rem] leading-relaxed text-[var(--yzi-text-primary)]">
            Sua conta ainda não está vinculada a uma imobiliária.
          </p>
          <p className="max-w-sm text-[0.78rem] text-[var(--yzi-text-secondary)]">
            Você pode preparar o cadastro de um imóvel, mas para salvá-lo é preciso primeiro vincular sua
            conta a uma imobiliária.
          </p>
        </>
      ) : (
        <>
          <p className="max-w-sm text-[0.92rem] leading-relaxed text-[var(--yzi-text-primary)]">
            Nenhum imóvel cadastrado ainda.
          </p>
          <p className="max-w-sm text-[0.78rem] text-[var(--yzi-text-secondary)]">
            Quando houver imóveis cadastrados nesta operação, eles aparecem aqui.
          </p>
          <Link
            href="/cockpit/yzi-imob/imoveis/novo"
            className="mt-1 text-[0.78rem] text-[rgb(var(--imob-ice))] hover:underline"
          >
            Cadastrar o primeiro imóvel
          </Link>
        </>
      )}
    </div>
  );
}

export function YziImobPropertyCatalogV2({
  properties,
  membershipMissing = false,
}: {
  properties: readonly Property[];
  membershipMissing?: boolean;
}) {
  const router = useRouter();
  const [view, setView] = useState<View>("catalog");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((property) => {
      const matchesStatus = statusFilter === "todos" || property.status === statusFilter;
      const matchesQuery =
        q.length === 0 ||
        `${property.title} ${property.neighborhood ?? ""} ${property.city ?? ""}`
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [properties, query, statusFilter]);

  function handleSelect(property: Property) {
    router.push(`/cockpit/yzi-imob/imoveis/${property.id}`);
  }

  return (
    <section className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-8 px-8 py-10">
      {/* Cabeçalho do Workspace — decisão primeiro, sem métricas em destaque.
          Sempre visível, independente de haver imobiliária vinculada ou
          imóveis cadastrados: ausência de dado nunca remove a tela. */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <YziPresence state="ready" animated />
          <span className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[var(--yzi-text-secondary)]">
            Imóveis
          </span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.01em] text-[var(--yzi-text-primary)]">
              Seu catálogo de imóveis
            </h1>
            <p className="max-w-xl text-[0.92rem] leading-relaxed text-[var(--yzi-text-secondary)]">
              {membershipMissing
                ? "Sua conta ainda não está vinculada a uma imobiliária."
                : properties.length > 0
                  ? `${properties.length} ${properties.length === 1 ? "imóvel cadastrado" : "imóveis cadastrados"} nesta operação.`
                  : "Ainda não há imóveis cadastrados nesta operação."}
            </p>
          </div>
          <Link
            href="/cockpit/yzi-imob/imoveis/novo"
            className="inline-flex shrink-0 items-center gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-elevated)] px-4 py-2.5 text-[0.82rem] font-medium text-[var(--yzi-text-primary)] shadow-[var(--yzi-edge-highlight)] transition-colors hover:bg-[var(--yzi-surface-base)]"
          >
            Cadastrar imóvel
          </Link>
        </div>
      </header>

      {/* Toolbar (grupos oficiais): Busca · Filtros · View. */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3.5 py-2.5 shadow-[var(--yzi-edge-highlight)] transition-colors focus-within:border-[color:rgba(var(--imob-ice),0.35)]">
            <SearchIcon className="h-4 w-4 shrink-0 text-[var(--yzi-text-faint)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título, bairro ou cidade"
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
      {properties.length === 0 ? (
        <EmptyCatalog membershipMissing={membershipMissing} />
      ) : filtered.length === 0 ? (
        <EmptyResult query={query.trim()} />
      ) : view === "catalog" ? (
        <div className="flex flex-col gap-2.5">
          {filtered.map((property) => (
            <CatalogRow
              key={property.id}
              property={property}
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
              onSelect={() => handleSelect(property)}
            />
          ))}
        </div>
      )}
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
