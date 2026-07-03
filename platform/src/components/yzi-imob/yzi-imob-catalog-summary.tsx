import {
  YziOverviewStrip,
  type OverviewKpi,
} from "@/components/yzi-os/yzi-dashboard-primitives";
import { YziBadge } from "@/components/yzi-os/yzi-primitives";
import {
  AssetsIcon,
  AttachmentIcon,
  AuditIcon,
  ChannelsIcon,
  FinanceIcon,
  OpportunityIcon,
} from "@/components/yzi-os/yzi-icons";

// Indicadores estruturais do catálogo. Zeros reais deste ambiente inicial —
// nenhum imóvel foi cadastrado, nenhuma operação real conectada. Não são
// métricas de cliente.
const CATALOG_KPIS: OverviewKpi[] = [
  { id: "total", label: "Total de imóveis", value: "0", icon: AssetsIcon },
  { id: "venda", label: "Para venda", value: "0", icon: OpportunityIcon },
  { id: "aluguel", label: "Para aluguel", value: "0", icon: FinanceIcon },
  { id: "sem-midia", label: "Sem mídia", value: "0", icon: AttachmentIcon },
  {
    id: "sem-pagina",
    label: "Sem página no site",
    value: "0",
    icon: ChannelsIcon,
  },
  {
    id: "sem-plano",
    label: "Sem plano comercial",
    value: "0",
    icon: AuditIcon,
  },
];

export function YziImobCatalogSummary() {
  return (
    <YziOverviewStrip
      title="Estado do catálogo"
      kpis={CATALOG_KPIS}
      rightSlot={
        <YziBadge tone="preview" className="normal-case">
          sem operação real conectada
        </YziBadge>
      }
    />
  );
}
