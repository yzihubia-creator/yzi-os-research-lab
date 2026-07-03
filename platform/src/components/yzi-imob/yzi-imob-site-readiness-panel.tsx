import { YziProgressBar } from "@/components/yzi-os/yzi-dashboard-primitives";
import { YziBadge, YziPanel } from "@/components/yzi-os/yzi-primitives";
import { AuditIcon } from "@/components/yzi-os/yzi-icons";

// Checklist de prontidão do site. Todos os itens nascem "pendente" porque
// nada foi configurado ainda — leitura honesta, sem simular operação real.
type ReadinessItem = { label: string };

const READINESS_ITEMS: ReadinessItem[] = [
  { label: "Domínio configurado" },
  { label: "Identidade visual" },
  { label: "Página inicial" },
  { label: "Páginas de imóveis" },
  { label: "Silos definidos" },
  { label: "Links internos" },
  { label: "Analytics / Search Console" },
  { label: "WhatsApp conectado" },
];

export function YziImobSiteReadinessPanel() {
  return (
    <YziPanel className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
          <AuditIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Prontidão do site
          </h2>
        </div>
        <YziBadge tone="neutral" className="normal-case">
          nenhum item conectado
        </YziBadge>
      </div>

      <div className="flex flex-col gap-3">
        {READINESS_ITEMS.map((item) => (
          <YziProgressBar
            key={item.label}
            label={item.label}
            valueLabel="pendente"
            level="low"
            tone="neutral"
            size="sm"
          />
        ))}
      </div>

      <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        Nenhum domínio conectado, nenhum Search Console ou Analytics ativo e
        nenhuma página real publicada nesta fase.
      </p>
    </YziPanel>
  );
}
