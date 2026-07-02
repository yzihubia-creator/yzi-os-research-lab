import { YziProgressBar } from "@/components/yzi-os/yzi-dashboard-primitives";
import {
  YziPanel,
  YziStatusBadge,
} from "@/components/yzi-os/yzi-primitives";
import { TrafficIcon } from "@/components/yzi-os/yzi-icons";

// Campanha assistida como RASCUNHO. Nenhum valor, público ou verba é real:
// cada campo descreve de onde a informação virá quando um imóvel for
// cadastrado e uma conta de anúncios for conectada. Nada é publicado ou
// gasto sem aprovação humana.
type DraftField = { label: string; value: string };

const CAMPAIGN_FIELDS: DraftField[] = [
  { label: "Objetivo", value: "Definido a partir do imóvel" },
  { label: "Público", value: "Sugerido pela YZI após o cadastro" },
  { label: "Orçamento sugerido", value: "Estimativa antes de qualquer gasto" },
  { label: "Região", value: "Bairro do imóvel" },
  { label: "Criativos necessários", value: "Gerados no pacote comercial" },
];

export function YziImobCampaignPreview() {
  return (
    <YziPanel variant="risk" className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
          <TrafficIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Campanha assistida
          </h2>
        </div>
        <YziStatusBadge tone="risk">rascunho</YziStatusBadge>
      </div>

      <dl className="flex flex-col gap-2">
        {CAMPAIGN_FIELDS.map((field) => (
          <div
            key={field.label}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-[color:var(--yzi-border-subtle)] pb-2 text-xs last:border-b-0 last:pb-0"
          >
            <dt className="text-[var(--yzi-text-secondary)]">{field.label}</dt>
            <dd className="text-right font-medium text-[var(--yzi-text-primary)]">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>

      <YziProgressBar
        label="Prontidão da campanha"
        valueLabel="inicial"
        level="low"
        tone="warning"
        size="sm"
      />

      <p className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2 text-[0.68rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        Aguardando aprovação humana. Nenhuma campanha real foi criada, nenhuma
        conta de anúncios está conectada e nada é gasto sem sua autorização.
      </p>
    </YziPanel>
  );
}
