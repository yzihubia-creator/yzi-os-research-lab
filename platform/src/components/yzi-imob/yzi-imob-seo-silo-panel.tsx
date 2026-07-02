import {
  YziMatrix,
  type MatrixColumn,
} from "@/components/yzi-os/yzi-visual-primitives";
import { YziBadge, YziPanel } from "@/components/yzi-os/yzi-primitives";
import { DashboardIcon } from "@/components/yzi-os/yzi-icons";

// Painel "Silo do Site": a arquitetura de SEO onde cada imóvel entra. Os
// silos definem a estrutura futura do site; nenhum silo real foi criado nesta
// task e nenhum imóvel foi classificado — todas as colunas nascem vazias.
const SILO_COLUMNS: MatrixColumn[] = [
  { key: "comprar", label: "Comprar" },
  { key: "alugar", label: "Alugar" },
  { key: "bairros", label: "Bairros" },
  { key: "lancamentos", label: "Lançamentos" },
  { key: "alto-padrao", label: "Alto padrão" },
  { key: "comercial", label: "Comercial" },
];

export function YziImobSeoSiloPanel() {
  return (
    <YziPanel className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
          <DashboardIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Silo do site
          </h2>
        </div>
        <YziBadge tone="preview" className="normal-case">
          arquitetura preparada · sem silo criado
        </YziBadge>
      </div>

      <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        Cada imóvel entra num silo semântico de SEO. A estrutura abaixo prepara
        a arquitetura do site — os silos ainda estão vazios.
      </p>

      <YziMatrix
        columns={SILO_COLUMNS}
        items={[]}
        emptyLabel="Nenhum imóvel neste silo ainda"
      />
    </YziPanel>
  );
}
