import type { ComponentType, SVGProps } from "react";

import {
  YziPanel,
  YziStatusBadge,
} from "@/components/yzi-os/yzi-primitives";
import {
  AuditIcon,
  RadarIcon,
  SearchIcon,
  TrafficIcon,
} from "@/components/yzi-os/yzi-icons";

// Painel "Inteligência de Tendências": as fontes que vão alimentar a análise
// antes da verba. Nenhuma fonte externa está conectada e nenhuma tendência
// real foi consultada nesta task — todas nascem "não conectada".
type IntelligenceSource = {
  id: string;
  label: string;
  hint: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const SOURCES: IntelligenceSource[] = [
  {
    id: "trends",
    label: "Google Trends",
    hint: "demanda e sazonalidade por bairro e tipo de imóvel",
    icon: SearchIcon,
  },
  {
    id: "search-console",
    label: "Search Console",
    hint: "termos que já trazem tráfego para o site",
    icon: SearchIcon,
  },
  {
    id: "concorrentes",
    label: "Concorrentes",
    hint: "como outras imobiliárias anunciam o mesmo perfil",
    icon: RadarIcon,
  },
  {
    id: "anuncios-ativos",
    label: "Anúncios ativos",
    hint: "criativos em circulação no mercado",
    icon: TrafficIcon,
  },
  {
    id: "historico",
    label: "Histórico de performance",
    hint: "o que já converteu em campanhas anteriores",
    icon: AuditIcon,
  },
];

export function YziImobTrendIntelligencePanel() {
  return (
    <YziPanel className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
        <RadarIcon className="h-4 w-4" />
        <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
          Inteligência de tendências
        </h2>
      </div>

      <ul className="flex flex-col gap-2">
        {SOURCES.map((source) => {
          const Glyph = source.icon;
          return (
            <li
              key={source.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2"
            >
              <Glyph className="h-3.5 w-3.5 shrink-0 text-[var(--yzi-text-secondary)]" />
              <span className="text-xs font-medium text-[var(--yzi-text-primary)]">
                {source.label}
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.66rem] text-[var(--yzi-text-faint)]">
                {source.hint}
              </span>
              <YziStatusBadge tone="neutral" dot={false} className="normal-case">
                não conectada
              </YziStatusBadge>
            </li>
          );
        })}
      </ul>

      <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        Nenhuma fonte externa está conectada e nenhuma tendência real foi
        consultada nesta fase. A análise acontece antes de qualquer investimento.
      </p>
    </YziPanel>
  );
}
