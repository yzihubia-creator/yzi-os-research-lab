import {
  YziMatrix,
  type MatrixColumn,
  type MatrixItem,
} from "@/components/yzi-os/yzi-visual-primitives";
import {
  YziButton,
  YziPanel,
} from "@/components/yzi-os/yzi-primitives";
import {
  AssetsIcon,
  AttachmentIcon,
  ChannelsIcon,
  DashboardIcon,
  SendIcon,
  TrafficIcon,
} from "@/components/yzi-os/yzi-icons";

// Painel do "Pacote Comercial YZI": o que a vertical entrega para cada
// imóvel cadastrado. A superfície lidera pelo resultado (o que o gestor
// recebe), com a YZI como motor. É capacidade estrutural — nada foi gerado
// ainda, nenhum conteúdo real existe nesta fase.
const PACKAGE_COLUMNS: MatrixColumn[] = [
  { key: "site", label: "Página no site" },
  { key: "social", label: "Conteúdo social" },
  { key: "criativo", label: "Criativo" },
  { key: "anuncio", label: "Anúncio" },
];

const PACKAGE_ITEMS: MatrixItem[] = [
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
    id: "roteiro",
    label: "Roteiro de vídeo",
    sublabel: "reels / stories",
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
    id: "headline-anuncio",
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

export function YziImobYziActionPanel() {
  return (
    <YziPanel variant="yzi" className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AssetsIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--yzi-accent-action)]" />
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
              Pacote Comercial YZI
            </h2>
            <p className="max-w-xl text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
              Cadastre um imóvel e receba de volta o pacote completo — site,
              posts, criativos e campanha. A YZI monta; você aprova.
            </p>
          </div>
        </div>
        <YziButton variant="primary" size="sm" disabled>
          Cadastrar imóvel · em breve
        </YziButton>
      </div>

      <YziMatrix columns={PACKAGE_COLUMNS} items={PACKAGE_ITEMS} />

      <p className="text-[0.66rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Capacidade estrutural do estúdio. Nenhuma peça foi gerada, nenhum
        conteúdo real existe e nada é publicado sem cadastro de imóvel e
        aprovação humana.
      </p>
    </YziPanel>
  );
}
