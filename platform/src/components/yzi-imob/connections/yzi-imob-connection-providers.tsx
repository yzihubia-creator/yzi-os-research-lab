import type { ComponentType, SVGProps } from "react";

// Identidade visual dos serviços da tela Conexões.
//
// Esta camada é EXCLUSIVAMENTE de apresentação: ela dá rosto (marca, cor e nome
// do serviço) aos itens que o view-model real já entrega. Nenhum estado nasce
// aqui — o estado continua vindo inteiro do servidor.
//
// A chave é o `id` do item público de conexão. Um serviço sem entrada aqui
// ainda aparece na tela, com a marca neutra: a grade nunca esconde algo que a
// operação possui.

type MarkProps = SVGProps<SVGSVGElement>;

function Mark({ children, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function MetricoolMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <circle cx="8.6" cy="12" r="4.4" />
      <circle cx="15.4" cy="12" r="4.4" />
    </Mark>
  );
}

export function WhatsappMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <path d="M12 3.6a8.4 8.4 0 0 0-7.3 12.6l-1.1 4.2 4.3-1.1A8.4 8.4 0 1 0 12 3.6Z" />
      <path d="M9.6 9.4c.4 2.4 2.6 4.6 5 5" />
      <path d="m9.6 9.4 1.4-.8.9 1.7-1.3.8" />
      <path d="m14.6 14.4.8-1.4 1.7.9-.8 1.3" />
    </Mark>
  );
}

export function SearchConsoleMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <circle cx="10.6" cy="10.6" r="5.9" />
      <path d="m15 15 4.4 4.4" />
      <path d="M8.6 12.4v-1.7" />
      <path d="M10.6 12.4V9.2" />
      <path d="M12.6 12.4V7.9" />
    </Mark>
  );
}

export function AnalyticsMark(props: MarkProps) {
  return (
    <Mark {...props} strokeWidth={2}>
      <path d="M7.2 19v-4.6" />
      <path d="M12 19v-8.6" />
      <path d="M16.8 19V6" />
    </Mark>
  );
}

export function BusinessProfileMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <path d="M4.4 9.6h15.2" />
      <path d="m4.4 9.6 2-4.6h11.2l2 4.6" />
      <path d="M6 9.6V19h12V9.6" />
      <path d="M9.6 19v-5.4h4.8V19" />
    </Mark>
  );
}

export function AdsMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <path d="M4.6 10.4v3.2l9 4.4V6l-9 4.4Z" />
      <path d="M4.6 10.4h-.8A1.3 1.3 0 0 0 2.5 11.7v.6c0 .7.6 1.3 1.3 1.3h.8" />
      <path d="M16.8 9.4a4.2 4.2 0 0 1 0 5.2" />
      <path d="M6.8 15v3.4" />
    </Mark>
  );
}

export function SiteMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M3.8 12h16.4" />
      <path d="M12 3.8c2.1 2.3 3.2 5.1 3.2 8.2s-1.1 5.9-3.2 8.2c-2.1-2.3-3.2-5.1-3.2-8.2S9.9 6.1 12 3.8Z" />
    </Mark>
  );
}

export function HiggsfieldMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="4.6" />
      <path d="m10.2 8.8 5.2 3.2-5.2 3.2V8.8Z" />
    </Mark>
  );
}

export function CanvaMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M14.9 9.7a3.7 3.7 0 1 0 .5 4.7" />
    </Mark>
  );
}

export function GenericMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <path d="M9.6 14.4 6.9 17a3.8 3.8 0 0 1-5.4-5.4l2.7-2.6" />
      <path d="m14.4 9.6 2.7-2.6a3.8 3.8 0 0 1 5.4 5.4L19.8 15" />
      <path d="m9.4 14.6 5.2-5.2" />
    </Mark>
  );
}

export type ConnectionProviderIdentity = {
  /** Nome do serviço como o gestor o reconhece fora do produto. */
  serviceName: string;
  /** Cor do serviço em RGB puro — usada só na marca e na ação. */
  rgb: string;
  Mark: ComponentType<MarkProps>;
};

/** Marca por id de conexão pública. Sem entrada aqui, a conexão usa o neutro. */
export const CONNECTION_PROVIDER: Record<string, ConnectionProviderIdentity> = {
  "publicacao-social": {
    serviceName: "Metricool",
    rgb: "198, 233, 74",
    Mark: MetricoolMark,
  },
  "producao-criativa-complementar": {
    serviceName: "Higgsfield",
    rgb: "168, 130, 246",
    Mark: HiggsfieldMark,
  },
  canva: {
    serviceName: "Canva",
    rgb: "0, 196, 204",
    Mark: CanvaMark,
  },
  "desempenho-busca": {
    serviceName: "Google Search Console",
    rgb: "66, 133, 244",
    Mark: SearchConsoleMark,
  },
  "atendimento-mensagens": {
    serviceName: "WhatsApp",
    rgb: "37, 211, 102",
    Mark: WhatsappMark,
  },
  site: {
    serviceName: "Site",
    rgb: "190, 222, 248",
    Mark: SiteMark,
  },
  "mensuracao-site": {
    serviceName: "Google Analytics",
    rgb: "232, 132, 33",
    Mark: AnalyticsMark,
  },
  "presenca-local": {
    serviceName: "Google Business Profile",
    rgb: "52, 168, 83",
    Mark: BusinessProfileMark,
  },
  "campanhas-busca": {
    serviceName: "Google Ads",
    rgb: "251, 188, 5",
    Mark: AdsMark,
  },
};

export const NEUTRAL_PROVIDER: ConnectionProviderIdentity = {
  serviceName: "Serviço",
  rgb: "152, 196, 236",
  Mark: GenericMark,
};

/** Ordem de leitura da grade. Ids fora desta lista entram depois, na ordem do servidor. */
export const CONNECTION_ORDER: readonly string[] = [
  "publicacao-social",
  "producao-criativa-complementar",
  "canva",
  "desempenho-busca",
  "atendimento-mensagens",
  "site",
  "mensuracao-site",
  "presenca-local",
  "campanhas-busca",
];

/**
 * Serviços que o produto usa em outras superfícies mas que ainda NÃO possuem
 * conexão no servidor. Aparecem no fim da grade, sem ação e sem estado
 * inventado: a tela mostra que o serviço existe e diz a verdade sobre ele.
 */
export type AnnouncedProvider = ConnectionProviderIdentity & {
  id: string;
  /** O que o serviço faz na operação — uma linha. */
  role: string;
  /** Por que ainda não há ação. Vira o motivo acessível do botão. */
  unavailableReason: string;
};

export const ANNOUNCED_PROVIDERS: readonly AnnouncedProvider[] = [];

export function providerFor(id: string): ConnectionProviderIdentity {
  return CONNECTION_PROVIDER[id] ?? NEUTRAL_PROVIDER;
}
