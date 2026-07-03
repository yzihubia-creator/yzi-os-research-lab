import type { ComponentType, SVGProps } from "react";

import {
  YziFilterButton,
  YziSegmentedTabs,
  type SegmentedTab,
} from "@/components/yzi-os/yzi-dashboard-primitives";
import { YziPanel } from "@/components/yzi-os/yzi-primitives";
import {
  AssetsIcon,
  AuditIcon,
  ChannelsIcon,
  CrmIcon,
  FinanceIcon,
} from "@/components/yzi-os/yzi-icons";

// Filtros puramente visuais — sem estado, sem query real. Representam o que
// o catálogo vai oferecer quando houver imóvel cadastrado.
type CatalogFilter = {
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

const CATALOG_FILTERS: CatalogFilter[] = [
  { label: "Tipo", icon: AssetsIcon },
  { label: "Bairro" },
  { label: "Finalidade" },
  { label: "Faixa de valor", icon: FinanceIcon },
  { label: "Status", icon: AuditIcon },
  { label: "Corretor", icon: CrmIcon },
  { label: "Publicação no site", icon: ChannelsIcon },
];

const VIEW_TABS: SegmentedTab[] = [
  { id: "grade", label: "Grade" },
  { id: "tabela", label: "Tabela" },
];

export function YziImobCatalogFilters() {
  return (
    <YziPanel className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {CATALOG_FILTERS.map((filter) => (
          <YziFilterButton
            key={filter.label}
            label={filter.label}
            icon={filter.icon}
          />
        ))}
      </div>
      <YziSegmentedTabs tabs={VIEW_TABS} activeId="grade" />
    </YziPanel>
  );
}
