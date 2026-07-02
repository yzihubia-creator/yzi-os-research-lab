import {
  YziMatrix,
  type MatrixColumn,
  type MatrixItem,
} from "@/components/yzi-os/yzi-visual-primitives";
import { YziPanel } from "@/components/yzi-os/yzi-primitives";
import {
  AttachmentIcon,
  ChannelsIcon,
  DashboardIcon,
  SendIcon,
  TrafficIcon,
} from "@/components/yzi-os/yzi-icons";

// Painel "Gerar com YZI": os entregáveis que a vertical produz por imóvel.
// Lidera pelo resultado (o que o gestor recebe), com a YZI como motor. É
// capacidade estrutural — nenhum criativo real foi gerado nesta fase.
const OUTPUT_COLUMNS: MatrixColumn[] = [
  { key: "site", label: "Página no site" },
  { key: "social", label: "Conteúdo social" },
  { key: "criativo", label: "Criativo" },
  { key: "anuncio", label: "Anúncio" },
];

const OUTPUT_ITEMS: MatrixItem[] = [
  {
    id: "titulo",
    label: "Título comercial",
    sublabel: "headline da página",
    icon: DashboardIcon,
    columnKey: "site",
  },
  {
    id: "descricao",
    label: "Descrição para site",
    sublabel: "texto do imóvel",
    icon: DashboardIcon,
    columnKey: "site",
  },
  {
    id: "legenda-ig",
    label: "Legenda Instagram",
    sublabel: "post do feed",
    icon: ChannelsIcon,
    columnKey: "social",
  },
  {
    id: "texto-fb",
    label: "Texto Facebook",
    sublabel: "publicação",
    icon: ChannelsIcon,
    columnKey: "social",
  },
  {
    id: "story",
    label: "Story",
    sublabel: "formato vertical",
    icon: SendIcon,
    columnKey: "social",
  },
  {
    id: "reels",
    label: "Roteiro de reels",
    sublabel: "vídeo curto",
    icon: SendIcon,
    columnKey: "social",
  },
  {
    id: "criativo-letter",
    label: "Criativo com letter",
    sublabel: "arte com texto",
    icon: AttachmentIcon,
    columnKey: "criativo",
  },
  {
    id: "headline",
    label: "Headline de anúncio",
    sublabel: "copy paga",
    icon: TrafficIcon,
    columnKey: "anuncio",
  },
  {
    id: "campanha",
    label: "Campanha assistida",
    sublabel: "tráfego pago",
    icon: TrafficIcon,
    columnKey: "anuncio",
  },
];

export function YziImobCreativeGenerationPanel() {
  return (
    <YziPanel variant="yzi" className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
          Gerar com YZI
        </h2>
        <p className="max-w-xl text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          A partir do cadastro e da mídia, a YZI produz o pacote completo. Você
          revisa e aprova antes de qualquer publicação.
        </p>
      </div>

      <YziMatrix columns={OUTPUT_COLUMNS} items={OUTPUT_ITEMS} />

      <p className="text-[0.66rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Capacidade estrutural do estúdio. Nenhuma peça foi gerada e nenhum
        conteúdo real existe nesta fase.
      </p>
    </YziPanel>
  );
}
