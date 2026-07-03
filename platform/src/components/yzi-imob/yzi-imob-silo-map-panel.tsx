import {
  YziMatrix,
  type MatrixColumn,
} from "@/components/yzi-os/yzi-visual-primitives";
import { YziBadge, YziPanel } from "@/components/yzi-os/yzi-primitives";
import { DashboardIcon } from "@/components/yzi-os/yzi-icons";

// Mapa de silos orgânicos do site. Cada silo agrupa imóveis por intenção de
// busca. Nenhum silo foi criado de verdade e nenhum imóvel foi classificado
// nesta fase — todas as colunas nascem vazias.
const SILO_COLUMNS: MatrixColumn[] = [
  { key: "comprar", label: "Comprar" },
  { key: "alugar", label: "Alugar" },
  { key: "bairros", label: "Bairros" },
  { key: "lancamentos", label: "Lançamentos" },
  { key: "alto-padrao", label: "Alto padrão" },
  { key: "investimento", label: "Investimento" },
  { key: "comercial", label: "Comercial" },
];

export function YziImobSiloMapPanel() {
  return (
    <YziPanel className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
          <DashboardIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Mapa de silos
          </h2>
        </div>
        <YziBadge tone="preview" className="normal-case">
          planejado · sem páginas
        </YziBadge>
      </div>

      <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        Cada imóvel entra no silo certo por intenção de busca, para construir
        autoridade no Google antes de escalar com anúncios.
      </p>

      <YziMatrix
        columns={SILO_COLUMNS}
        items={[]}
        emptyLabel="Aguardando imóveis"
      />
    </YziPanel>
  );
}
