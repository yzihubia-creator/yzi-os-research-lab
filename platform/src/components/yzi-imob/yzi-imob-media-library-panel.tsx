import { YziProgressBar } from "@/components/yzi-os/yzi-dashboard-primitives";
import { YziPanel } from "@/components/yzi-os/yzi-primitives";
import {
  YziEmptyVisualState,
  YziMetricStrip,
  type MetricStripItem,
} from "@/components/yzi-os/yzi-visual-primitives";
import { AttachmentIcon } from "@/components/yzi-os/yzi-icons";

// Painel da biblioteca de mídia do imóvel. Estados honestos: nenhum upload
// real foi implementado, nenhuma mídia enviada. Os "0" são contagens reais
// deste ambiente inicial, não métricas fabricadas.
const MEDIA_STATES: MetricStripItem[] = [
  { label: "Fotos", value: "0" },
  { label: "Vídeos", value: "0" },
  { label: "Upload", value: "não implementado" },
];

export function YziImobMediaLibraryPanel() {
  return (
    <YziPanel className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
        <AttachmentIcon className="h-4 w-4" />
        <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
          Arquivos do imóvel
        </h2>
      </div>

      <YziMetricStrip items={MEDIA_STATES} />

      <YziProgressBar
        label="Mídia organizada"
        valueLabel="inicial"
        level="low"
        tone="neutral"
        size="sm"
      />

      <YziEmptyVisualState
        icon={AttachmentIcon}
        message="Nenhuma foto ou vídeo enviado ainda"
      />

      <p className="text-center text-[0.68rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        Suba fotos e vídeos por imóvel para a YZI montar criativos, posts e a
        página do site. O upload real chega numa próxima fase.
      </p>
    </YziPanel>
  );
}
