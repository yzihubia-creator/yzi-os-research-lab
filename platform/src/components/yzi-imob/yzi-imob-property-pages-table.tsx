import {
  YziDataTable,
  type DataTableColumn,
  type DataTableRow,
} from "@/components/yzi-os/yzi-dashboard-primitives";
import { YziBadge, YziPanel } from "@/components/yzi-os/yzi-primitives";
import { AssetsIcon } from "@/components/yzi-os/yzi-icons";

// Tabela das páginas de imóveis no site. Nasce vazia: nenhuma página real foi
// publicada nesta fase. As colunas descrevem o que cada página acompanha
// quando existir — nenhum dado de cliente é inventado.
const COLUMNS: DataTableColumn[] = [
  { key: "imovel", label: "Imóvel" },
  { key: "bairro", label: "Bairro" },
  { key: "finalidade", label: "Finalidade" },
  { key: "pagina", label: "Página" },
  { key: "silo", label: "Silo" },
  { key: "links", label: "Links internos" },
  { key: "seo", label: "Prontidão SEO" },
  { key: "proxima", label: "Próxima ação", align: "right" },
];

const ROWS: DataTableRow[] = [];

export function YziImobPropertyPagesTable() {
  return (
    <YziPanel className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
          <AssetsIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Páginas de imóveis
          </h2>
        </div>
        <YziBadge tone="preview" className="normal-case">
          ambiente inicial · sem página publicada
        </YziBadge>
      </div>
      <YziDataTable
        columns={COLUMNS}
        rows={ROWS}
        emptyLabel="Nenhuma página de imóvel publicada ainda."
      />
    </YziPanel>
  );
}
