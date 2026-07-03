import { YziFlowRail, type FlowStep } from "@/components/yzi-os/yzi-visual-primitives";
import { YziPanel } from "@/components/yzi-os/yzi-primitives";
import {
  AssetsIcon,
  ChannelsIcon,
  CommandCenterIcon,
  SendIcon,
} from "@/components/yzi-os/yzi-icons";

// Representação visual do caminho de navegação interna do site. Nenhum link
// real de SEO foi criado — é só a estrutura pretendida entre as páginas.
const LINK_STEPS: FlowStep[] = [
  { label: "Homepage", icon: CommandCenterIcon },
  { label: "Hub do silo", icon: ChannelsIcon },
  { label: "Página do imóvel", icon: AssetsIcon },
  { label: "WhatsApp", icon: SendIcon },
];

export function YziImobInternalLinksPanel() {
  return (
    <YziPanel className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
          Links internos
        </h2>
        <p className="text-[0.66rem] text-[var(--yzi-text-faint)]">
          Caminho de navegação pretendido entre as páginas do site. Nenhum
          link real foi criado nesta fase.
        </p>
      </div>
      <YziFlowRail steps={LINK_STEPS} />
    </YziPanel>
  );
}
