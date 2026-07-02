import {
  YziDataTable,
  type DataTableColumn,
  type DataTableRow,
} from "@/components/yzi-os/yzi-dashboard-primitives";
import { YziBadge, YziPanel } from "@/components/yzi-os/yzi-primitives";
import { AssetsIcon } from "@/components/yzi-os/yzi-icons";

// Tabela das pastas comerciais, uma por imóvel. Nasce vazia: nenhum imóvel
// foi cadastrado nesta fase. As colunas descrevem o que cada pasta acompanha
// quando existir — nenhum dado de cliente é inventado.
const COLUMNS: DataTableColumn[] = [
  { key: "imovel", label: "Imóvel" },
  { key: "bairro", label: "Bairro" },
  { key: "arquivos", label: "Arquivos" },
  { key: "silo", label: "Silo / site" },
  { key: "inteligencia", label: "Inteligência YZI" },
  { key: "criativos", label: "Criativos" },
  { key: "campanha", label: "Campanha" },
  { key: "proxima", label: "Próxima ação", align: "right" },
];

const ROWS: DataTableRow[] = [];

export function YziImobPropertyFolderTable() {
  return (
    <YziPanel className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
          <AssetsIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Pastas comerciais
          </h2>
        </div>
        <YziBadge tone="preview" className="normal-case">
          ambiente inicial · sem imóvel cadastrado
        </YziBadge>
      </div>
      <YziDataTable
        columns={COLUMNS}
        rows={ROWS}
        emptyLabel="Nenhum imóvel cadastrado ainda — cadastre o primeiro imóvel para abrir sua pasta comercial e deixar a YZI montar o plano."
      />
    </YziPanel>
  );
}
