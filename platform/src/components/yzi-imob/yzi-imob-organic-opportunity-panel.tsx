import { YziPanel, YziStatusBadge } from "@/components/yzi-os/yzi-primitives";
import { RadarIcon } from "@/components/yzi-os/yzi-icons";

// Painel de oportunidades orgânicas: temas de busca que o site pode capturar
// quando houver imóveis e conteúdo suficiente. Nenhuma fonte externa está
// conectada e nenhuma demanda real foi consultada nesta fase.
const OPPORTUNITY_TOPICS: string[] = [
  "Bairros com demanda",
  "Imóveis próximos à praia",
  "Apartamentos por faixa de preço",
  "Lançamentos",
  "Imóveis para investimento",
  "Salas comerciais",
  "Buscas de aluguel",
];

export function YziImobOrganicOpportunityPanel() {
  return (
    <YziPanel className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
        <RadarIcon className="h-4 w-4" />
        <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
          Oportunidades orgânicas
        </h2>
      </div>

      <ul className="flex flex-col gap-2">
        {OPPORTUNITY_TOPICS.map((topic) => (
          <li
            key={topic}
            className="flex items-center justify-between gap-3 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2 text-xs"
          >
            <span className="text-[var(--yzi-text-primary)]">{topic}</span>
            <YziStatusBadge tone="neutral" dot={false} className="normal-case">
              sem fonte conectada
            </YziStatusBadge>
          </li>
        ))}
      </ul>

      <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        Nenhuma fonte orgânica conectada ainda. Estes são os temas de busca que
        o site poderá capturar quando o silo e as páginas estiverem prontos.
      </p>
    </YziPanel>
  );
}
