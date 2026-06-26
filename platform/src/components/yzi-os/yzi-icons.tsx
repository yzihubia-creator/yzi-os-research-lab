import type { SVGProps } from "react";

export type YziIconSize = 16 | 20 | 24;

export type YziIconProps = Omit<SVGProps<SVGSVGElement>, "width" | "height"> & {
  size?: YziIconSize;
};

// Iconografia proprietária mínima do YZI OS. Line icons consistentes: viewBox
// 24×24, fill none, stroke="currentColor" (cor herdada, nunca fixa), stroke
// width único (1.5), cantos arredondados. Calmas e estratégicas, sem
// preenchimentos pesados. Sem biblioteca externa, sem SVG de terceiros.

export function YziIcon({ children, size = 20, ...props }: YziIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

// Marca do sistema: abertura/aperture convergindo num núcleo, "sistema
// operacional" sob comando, não logo genérico.
export function YziMarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M5 4l7 7 7-7" />
      <path d="M12 11v9" />
      <circle cx="12" cy="11" r="1.15" fill="currentColor" stroke="none" />
    </YziIcon>
  );
}

// Assistente YZI: o ícone mais identitário, núcleo orquestrador com órbita e
// satélite. Inteligência trabalhando ao lado, não conversa genérica.
export function YziAssistantIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M5.5 12a6.5 6.5 0 0 1 9.7-5.6" />
      <path d="M18.5 12a6.5 6.5 0 0 1-9.7 5.6" />
      <circle cx="17.4" cy="6.6" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="6.6" cy="17.4" r="1.25" fill="currentColor" stroke="none" />
    </YziIcon>
  );
}

// Command Center: painel dominante + rail de decisão à direita (mesa de decisão),
// não grid de métricas. É a primeira superfície.
export function CommandCenterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <rect x="3.5" y="4.5" width="11" height="15" rx="1.6" />
      <path d="M17.5 5h3M17.5 9.5h3M17.5 14h3M17.5 18.5h3" />
      <path d="M6.5 9h5" />
      <circle cx="6.8" cy="14.5" r="1.1" fill="currentColor" stroke="none" />
    </YziIcon>
  );
}

// Oportunidade acionável: alvo com faísca de sinal (não ficha comercial).
export function OpportunityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <circle cx="11" cy="13" r="6.5" />
      <circle cx="11" cy="13" r="1.2" fill="currentColor" stroke="none" />
      <path d="M16 8l4-4M17.5 4h2.5v2.5" />
    </YziIcon>
  );
}

// Ações: fila priorizada (linhas com marcador de ordem), não task manager.
export function ActionsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M9 6.5h11M9 12h11M9 17.5h11" />
      <path d="M4 5.5l1.4 1.4L4.6 7.9" />
      <circle cx="4.4" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="4.4" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    </YziIcon>
  );
}

// Canais: fontes que emitem sinal para a operação (não ícone de mídia).
export function ChannelsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <circle cx="6" cy="18" r="2" />
      <path d="M6 14a8 8 0 0 1 0 8" transform="translate(0 -4)" />
      <path d="M6 13a9 9 0 0 1 5 5" />
      <path d="M6 9a13 13 0 0 1 9 9" />
    </YziIcon>
  );
}

// Busca semântica: pergunta por intenção que devolve raciocínio (não busca de arquivo).
export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
      <path d="M8 10.5h5M10.5 8v5" />
    </YziIcon>
  );
}

// Ativos: material entendido em camadas conectadas (não pasta de arquivos).
export function AssetsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M12 3.5l8 4.5-8 4.5-8-4.5 8-4.5z" />
      <path d="M4 12l8 4.5 8-4.5" />
      <path d="M4 16.5l8 4 8-4" />
    </YziIcon>
  );
}

// Audit Drawer: rastro/linha do tempo sob demanda, secundário.
export function AuditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M6 4.5v15" />
      <circle cx="6" cy="8" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="6" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
      <path d="M10 8h10M10 15.5h7" />
    </YziIcon>
  );
}

// Command view: um painel dominante + leitura secundária (não grid de 4 iguais).
export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <rect x="3.5" y="4" width="9.5" height="16" rx="1.6" />
      <path d="M16.5 4h4M16.5 9h4M16.5 14h4M16.5 19h4" />
    </YziIcon>
  );
}

// Radar: varredura + blip (onde agir), não alvo genérico.
export function RadarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M20.5 12a8.5 8.5 0 1 1-5.4-7.9" />
      <path d="M12 12l5.5-4" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16.6" cy="7.4" r="1.4" />
    </YziIcon>
  );
}

// Tráfego: fluxo de crescimento com direção (escalar/pausar/ajustar).
export function TrafficIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M3.5 16.5l5-5 3.5 3 7-7.5" />
      <path d="M15 7h4v4" />
      <path d="M3.5 20h17" />
    </YziIcon>
  );
}

// Relacionamento: nós conectados (responsabilidade), não ficha.
export function CrmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <circle cx="8" cy="8" r="2.6" />
      <path d="M3.5 19a4.5 4.5 0 0 1 9 0" />
      <circle cx="17" cy="9.5" r="2" />
      <path d="M15.5 14.2a4 4 0 0 1 5 3.8" />
    </YziIcon>
  );
}

// Financeiro: valor/fluxo ligado à ação, não planilha contábil.
export function FinanceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M7 14.5h3" />
      <circle cx="16.5" cy="14.5" r="1.15" fill="currentColor" stroke="none" />
    </YziIcon>
  );
}

// Agenda: tempo a serviço de ação, frame com foco num dia.
export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8.5 3.5v3M15.5 3.5v3" />
      <rect x="8" y="13" width="3" height="3" rx="0.6" fill="currentColor" stroke="none" />
    </YziIcon>
  );
}

// Configurações: controles/sliders, menos genérico que engrenagem.
export function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M4 7.5h9M17 7.5h3" />
      <path d="M4 16.5h3M11 16.5h9" />
      <circle cx="15" cy="7.5" r="2" />
      <circle cx="9" cy="16.5" r="2" />
    </YziIcon>
  );
}

// Anexo: clipe mínimo.
export function AttachmentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M20 11.5l-8.3 8.3a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.6 1.6 0 0 1-2.3-2.3l7.8-7.8" />
    </YziIcon>
  );
}

// Enviar: seta de ação para cima.
export function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M12 19.5V5.5" />
      <path d="M6 11l6-5.5 6 5.5" />
    </YziIcon>
  );
}

// Autorização: escudo + check, revisão deliberada com consequência.
export function AuthorizationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M12 3.5l6.5 2.4v5.1c0 4-2.7 7-6.5 8.5-3.8-1.5-6.5-4.5-6.5-8.5V5.9L12 3.5z" />
      <path d="M9.2 12l2 2 3.6-3.8" />
    </YziIcon>
  );
}

// Pensamento profundo: grafo de nós (raciocínio), não lâmpada.
export function DeepThinkingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <circle cx="12" cy="6" r="2" />
      <circle cx="6" cy="16" r="2" />
      <circle cx="18" cy="16" r="2" />
      <path d="M10.6 7.6l-3.2 6.8M13.4 7.6l3.2 6.8M8 16h8" />
    </YziIcon>
  );
}

// Toggle da sidebar: painel + chevron (recolher/expandir).
export function SidebarToggleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M9.5 4.5v15" />
      <path d="M15.5 9.5l-2.5 2.5 2.5 2.5" />
    </YziIcon>
  );
}

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M15 17l5-5-5-5" />
      <path d="M20 12H9" />
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    </YziIcon>
  );
}

export {
  ActionsIcon as ActionIcon,
  AssetsIcon as AssetIcon,
  AuditIcon as AuditTrailIcon,
  ChannelsIcon as ChannelIcon,
  YziAssistantIcon as YziPresenceIcon,
};
