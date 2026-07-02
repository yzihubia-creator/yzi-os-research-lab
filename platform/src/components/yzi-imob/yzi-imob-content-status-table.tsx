import {
  YziDataTable,
  type DataTableColumn,
  type DataTableRow,
} from "@/components/yzi-os/yzi-dashboard-primitives";
import { YziBadge, YziPanel } from "@/components/yzi-os/yzi-primitives";
import { AssetsIcon } from "@/components/yzi-os/yzi-icons";

// Tabela operacional dos imóveis do estúdio. Nasce vazia de propósito:
// nenhum imóvel foi cadastrado nesta fase, então não há linha para exibir.
// As colunas mostram o que será acompanhado por imóvel quando o cadastro
// existir — não há dado de cliente inventado aqui.
const COLUMNS: DataTableColumn[] = [
  { key: "imovel", label: "Imóvel" },
  { key: "bairro", label: "Bairro" },
  { key: "finalidade", label: "Finalidade" },
  { key: "site", label: "Status no site" },
  { key: "conteudo", label: "Conteúdo" },
  { key: "criativos", label: "Criativos" },
  { key: "campanha", label: "Campanha" },
  { key: "proxima", label: "Próxima ação", align: "right" },
];

const ROWS: DataTableRow[] = [];

export function YziImobContentStatusTable() {
  return (
    <YziPanel className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
          <AssetsIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Imóveis no estúdio
          </h2>
        </div>
        <YziBadge tone="preview" className="normal-case">
          ambiente inicial · sem imóvel cadastrado
        </YziBadge>
      </div>
      <YziDataTable
        columns={COLUMNS}
        rows={ROWS}
        emptyLabel="Nenhum imóvel cadastrado ainda — cadastre o primeiro imóvel para o estúdio gerar site, posts, criativos e campanha."
      />
    </YziPanel>
  );
}
