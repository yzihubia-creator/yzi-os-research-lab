import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import {
  AssetsIcon,
  AttachmentIcon,
  ChannelsIcon,
  CommandCenterIcon,
  DashboardIcon,
  DeepThinkingIcon,
  RadarIcon,
  SearchIcon,
  SendIcon,
  TrafficIcon,
} from "@/components/yzi-os/yzi-icons";
import {
  YziAlert,
  YziBadge,
  YziPanel,
  YziStatusBadge,
  YziSurface,
} from "@/components/yzi-os/yzi-primitives";

type ConnectionCategory =
  | "Dados"
  | "Campanha"
  | "Arquivo"
  | "Comunicação"
  | "IA"
  | "Sistema";

type ConnectionStatus =
  | "disponível no sistema"
  | "em preparação"
  | "planejado"
  | "não conectado";

type CredentialLevel =
  | "nenhuma"
  | "API do sistema"
  | "OAuth do cliente"
  | "token sensível";

type RiskLevel = "baixo" | "médio" | "alto";

type AccessMode = "leitura" | "escrita" | "execução externa";

type ConnectionSource = {
  id: string;
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  category: ConnectionCategory;
  status: ConnectionStatus;
  usedBy: string[];
  credential: CredentialLevel;
  risk: RiskLevel;
  modes: AccessMode[];
  note: string;
};

// Mapa honesto de fontes candidatas do YZI OS v0.1. Nenhuma credencial real
// está conectada; status reflete o que existe hoje, não uma promessa.
const CONNECTIONS: ConnectionSource[] = [
  {
    id: "meta-ads",
    name: "Meta Ads",
    icon: TrafficIcon,
    category: "Campanha",
    status: "não conectado",
    usedBy: ["Tráfego Pago", "Resultados"],
    credential: "OAuth do cliente",
    risk: "alto",
    modes: ["leitura", "execução externa"],
    note: "Pode envolver dados sensíveis de campanha e orçamento. Ajustar orçamento ou pausar campanhas só será permitido com aprovação humana.",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    icon: DashboardIcon,
    category: "Dados",
    status: "não conectado",
    usedBy: ["Radar", "Resultados"],
    credential: "OAuth do cliente",
    risk: "médio",
    modes: ["leitura"],
    note: "Fonte planejada para alimentar o Radar com tráfego e conversões. Apenas leitura nesta fase.",
  },
  {
    id: "google-search-console",
    name: "Google Search Console",
    icon: SearchIcon,
    category: "Dados",
    status: "não conectado",
    usedBy: ["Radar"],
    credential: "OAuth do cliente",
    risk: "médio",
    modes: ["leitura"],
    note: "Leitura de desempenho de busca orgânica. Exige autorização da conta antes de buscar dados.",
  },
  {
    id: "google-trends",
    name: "Tendências de mercado",
    icon: ChannelsIcon,
    category: "Dados",
    status: "planejado",
    usedBy: ["Radar"],
    credential: "nenhuma",
    risk: "baixo",
    modes: ["leitura"],
    note: "Dado público de mercado. Não exige autorização de conta nem credencial sensível.",
  },
  {
    id: "instagram-meta-business",
    name: "Instagram / Meta Business",
    icon: ChannelsIcon,
    category: "Comunicação",
    status: "não conectado",
    usedBy: ["Radar", "Tráfego Pago"],
    credential: "OAuth do cliente",
    risk: "alto",
    modes: ["leitura", "execução externa"],
    note: "Exige autorização da conta antes de buscar dados ou publicar. Pode envolver informação de audiência.",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    icon: AssetsIcon,
    category: "Arquivo",
    status: "não conectado",
    usedBy: ["Biblioteca"],
    credential: "OAuth do cliente",
    risk: "médio",
    modes: ["leitura"],
    note: "Fonte planejada para alimentar a Biblioteca com material já existente do cliente.",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    icon: AttachmentIcon,
    category: "Arquivo",
    status: "não conectado",
    usedBy: ["Biblioteca", "Resultados"],
    credential: "OAuth do cliente",
    risk: "baixo",
    modes: ["leitura", "escrita"],
    note: "Leitura e escrita de planilhas operacionais do cliente. Nenhuma credencial está conectada nesta versão.",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: SendIcon,
    category: "Comunicação",
    status: "não conectado",
    usedBy: ["Assistente YZI"],
    credential: "token sensível",
    risk: "alto",
    modes: ["leitura", "execução externa"],
    note: "Conversas e mensagens diretas. Enviar mensagem por aqui só será permitido com aprovação humana.",
  },
  {
    id: "ia-modelos",
    name: "IA / Modelos",
    icon: DeepThinkingIcon,
    category: "IA",
    status: "em preparação",
    usedBy: ["Assistente YZI", "Radar", "Oportunidades"],
    credential: "API do sistema",
    risk: "baixo",
    modes: ["leitura"],
    note: "Raciocínio que a YZI usa para ler e sugerir. Não acessa contas do cliente diretamente.",
  },
  {
    id: "biblioteca-interna",
    name: "Biblioteca interna",
    icon: AssetsIcon,
    category: "Sistema",
    status: "em preparação",
    usedBy: ["Ativos", "Busca Semântica"],
    credential: "nenhuma",
    risk: "baixo",
    modes: ["leitura", "escrita"],
    note: "Armazenamento interno do YZI OS para material já recebido e entendido.",
  },
  {
    id: "radar",
    name: "Radar",
    icon: RadarIcon,
    category: "Sistema",
    status: "disponível no sistema",
    usedBy: ["Command Center", "Oportunidades"],
    credential: "nenhuma",
    risk: "baixo",
    modes: ["leitura"],
    note: "Motor de leitura interno do YZI OS. Hoje é manual e assistido; nenhuma fonte externa está conectada a ele ainda.",
  },
];

const STATUS_TONE: Record<ConnectionStatus, "trust" | "preview" | "neutral" | "authorization"> = {
  "disponível no sistema": "trust",
  "em preparação": "preview",
  planejado: "neutral",
  "não conectado": "authorization",
};

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  "disponível no sistema": "disponível no sistema",
  "em preparação": "em preparação",
  planejado: "planejado",
  "não conectado": "ainda não conectado",
};

const RISK_DOT_COLOR: Record<RiskLevel, string> = {
  baixo: "bg-[var(--yzi-accent-opportunity)]",
  médio: "bg-[var(--yzi-accent-risk)]",
  alto: "bg-[var(--yzi-state-blocked)]",
};

const CREDENTIAL_LABEL: Record<CredentialLevel, string> = {
  nenhuma: "Nenhuma",
  "API do sistema": "Recurso interno do YZI OS",
  "OAuth do cliente": "Exige autorização da conta",
  "token sensível": "Acesso sensível do cliente",
};

const MODE_LABEL: Record<AccessMode, string> = {
  leitura: "Leitura",
  escrita: "Escrita",
  "execução externa": "Pode alterar dados fora do YZI OS",
};

function renderModes(modes: AccessMode[]): string {
  if (modes.length === 1 && modes[0] === "leitura") {
    return "Somente leitura nesta fase";
  }
  return modes.map((mode) => MODE_LABEL[mode]).join(" · ");
}

const STATUS_ORDER: ConnectionStatus[] = [
  "disponível no sistema",
  "em preparação",
  "planejado",
  "não conectado",
];

function summarizeByStatus(sources: ConnectionSource[]) {
  return STATUS_ORDER.map((status) => ({
    status,
    count: sources.filter((source) => source.status === status).length,
  })).filter((entry) => entry.count > 0);
}

function ConnectionCard({ source }: { source: ConnectionSource }) {
  const Glyph = source.icon;

  return (
    <YziPanel className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <YziSurface
            aria-hidden
            variant="elevated"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--yzi-radius-md)] p-0 text-[var(--yzi-text-secondary)]"
          >
            <Glyph className="h-4 w-4" />
          </YziSurface>
          <h3 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            {source.name}
          </h3>
        </div>
        <YziBadge tone="neutral" className="shrink-0 normal-case">
          {source.category}
        </YziBadge>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <YziStatusBadge tone={STATUS_TONE[source.status]}>
          {STATUS_LABEL[source.status]}
        </YziStatusBadge>
        <YziBadge tone="neutral" className="normal-case">
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${RISK_DOT_COLOR[source.risk]}`}
          />
          risco {source.risk}
        </YziBadge>
      </div>

      <dl className="flex flex-col gap-1.5 border-t border-[color:var(--yzi-border-subtle)] pt-3 text-xs">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--yzi-text-secondary)]">Usado por</dt>
          <dd className="text-right text-[var(--yzi-text-primary)]">
            {source.usedBy.join(", ")}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--yzi-text-secondary)]">Credencial</dt>
          <dd className="text-right text-[var(--yzi-text-primary)]">
            {CREDENTIAL_LABEL[source.credential]}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--yzi-text-secondary)]">Modo</dt>
          <dd className="text-right text-[var(--yzi-text-primary)]">
            {renderModes(source.modes)}
          </dd>
        </div>
      </dl>

      <p className="text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
        {source.note}
      </p>
    </YziPanel>
  );
}

export function ConnectionsV0() {
  const summary = summarizeByStatus(CONNECTIONS);

  return (
    <section className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-4">
        <Link
          href="/cockpit"
          className="inline-flex w-fit items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-1.5 text-xs text-[var(--yzi-text-secondary)] transition-colors hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]"
        >
          <CommandCenterIcon className="h-3.5 w-3.5" />
          Voltar ao Cockpit
        </Link>
        <div className="flex flex-col gap-2">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[var(--yzi-text-secondary)]">
            Mapa de fontes · v0.1
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--yzi-text-primary)]">
            Conexões
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            De onde os dados do YZI OS podem vir, quem precisa autorizar, qual
            módulo usa cada fonte e qual risco ela envolve.
          </p>
        </div>
      </div>

      <YziAlert tone="info" title="Nenhuma credencial está conectada nesta versão.">
        Esta tela é um mapa visual das fontes planejadas. Conectar uma conta
        real, autorizar o acesso do cliente ou guardar qualquer credencial
        acontece em uma fase futura.
      </YziAlert>

      <div className="flex flex-wrap items-center gap-1.5">
        {summary.map(({ status, count }) => (
          <YziStatusBadge key={status} tone={STATUS_TONE[status]}>
            {count} · {STATUS_LABEL[status]}
          </YziStatusBadge>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONNECTIONS.map((source) => (
          <ConnectionCard key={source.id} source={source} />
        ))}
      </div>

      <YziSurface variant="elevated" className="p-1.5">
        <YziPanel className="flex flex-col gap-2 p-4">
          <p className="text-sm font-medium text-[var(--yzi-text-primary)]">
            Próximas fases
          </p>
          <p className="text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Quando uma conexão for autorizada de verdade, o consumo dela
            aparece em Uso &amp; Créditos. Nenhuma ação que altere dados fora
            do YZI OS acontece sem aprovação humana explícita.
          </p>
        </YziPanel>
      </YziSurface>
    </section>
  );
}
