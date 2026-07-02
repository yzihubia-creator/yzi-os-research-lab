import { YziPanel } from "@/components/yzi-os/yzi-primitives";
import { YziFlowRail, type FlowStep } from "@/components/yzi-os/yzi-visual-primitives";
import {
  AssetsIcon,
  AttachmentIcon,
  ChannelsIcon,
  CrmIcon,
  DashboardIcon,
  SendIcon,
  TrafficIcon,
} from "@/components/yzi-os/yzi-icons";

// Fluxo comercial do YZI IMOB: o que acontece com um imóvel depois do
// cadastro. É a promessa da vertical em uma linha — não representa nenhum
// imóvel real nem etapa concluída de verdade.
const PIPELINE_STEPS: FlowStep[] = [
  { label: "Imóvel cadastrado", icon: AssetsIcon },
  { label: "Página no site", icon: DashboardIcon },
  { label: "Conteúdo social", icon: ChannelsIcon },
  { label: "Criativo", icon: AttachmentIcon },
  { label: "Publicação", icon: SendIcon },
  { label: "Campanha", icon: TrafficIcon },
  { label: "Leads", icon: CrmIcon },
];

export function YziImobPropertyPipeline() {
  return (
    <YziPanel className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
          Do imóvel ao lead
        </h2>
        <p className="text-[0.66rem] text-[var(--yzi-text-faint)]">
          Cada imóvel cadastrado percorre este caminho. Nenhuma etapa roda
          sozinha — o gestor aprova antes de publicar ou anunciar.
        </p>
      </div>
      <YziFlowRail steps={PIPELINE_STEPS} />
    </YziPanel>
  );
}
