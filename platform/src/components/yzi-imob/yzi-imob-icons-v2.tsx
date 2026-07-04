import type { SVGProps } from "react";

import { YziIcon } from "@/components/yzi-os/yzi-icons";

// Iconografia própria do casco YZI IMOB v2. Reutiliza o wrapper YziIcon do YZI OS
// (viewBox 24×24, stroke currentColor) para consistência total; aqui só line
// icons maiores e mais expressivos por área operacional. Sem lib externa,
// sem emoji, sem SVG de terceiros.

export function BrokerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2" />
      <path d="M8.5 7.5V6A1.5 1.5 0 0 1 10 4.5h4A1.5 1.5 0 0 1 15.5 6v1.5" />
      <path d="M3 12.5h18" />
    </YziIcon>
  );
}

export function PropertyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M4 20V6.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1V20" />
      <path d="M14 20V10.5h5a1 1 0 0 1 1 1V20" />
      <path d="M7 9h2M7 12h2M7 15h2" />
      <path d="M3 20h18" />
    </YziIcon>
  );
}

export function ClientIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </YziIcon>
  );
}

export function InboxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-4 3.2V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
    </YziIcon>
  );
}

export function CreativeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M12 4l1.5 3.9L17.5 9l-4 1.1L12 14l-1.5-3.9L6.5 9l4-1.1z" />
      <path d="M18 13.5l.7 1.9 1.9.6-1.9.7-.7 1.8-.7-1.8-1.9-.7 1.9-.6z" />
    </YziIcon>
  );
}

export function CampaignIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M4 10v4a1 1 0 0 0 1 1h2l7 4V5L7 9H5a1 1 0 0 0-1 1z" />
      <path d="M18 9.5a3.2 3.2 0 0 1 0 5" />
    </YziIcon>
  );
}

export function SiteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4c2.5 2.2 3.8 5 3.8 8s-1.3 5.8-3.8 8c-2.5-2.2-3.8-5-3.8-8S9.5 6.2 12 4z" />
    </YziIcon>
  );
}

export function RadarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 4a8 8 0 1 1-8 8" />
      <path d="M12 12l5.5-3.4" />
    </YziIcon>
  );
}

export function InsightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M9.5 18.5h5" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" />
    </YziIcon>
  );
}

export function ResultsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M3 20h18" />
      <path d="M6.5 20v-6" />
      <path d="M12 20V7" />
      <path d="M17.5 20v-9" />
    </YziIcon>
  );
}

export function TeamIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 6.4a3 3 0 0 1 0 5.7" />
      <path d="M16.5 14.2a5.5 5.5 0 0 1 4 4.6" />
    </YziIcon>
  );
}

export function OperationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M4 8h9" />
      <path d="M18 8h2" />
      <circle cx="15.5" cy="8" r="2" />
      <path d="M4 16h2" />
      <path d="M11 16h9" />
      <circle cx="8.5" cy="16" r="2" />
    </YziIcon>
  );
}

export function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M5.2 5.2l1.5 1.5M17.3 17.3l1.5 1.5M3.5 12h2.2M18.3 12h2.2M5.2 18.8l1.5-1.5M17.3 6.7l1.5-1.5" />
    </YziIcon>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M12 5v14M5 12h14" />
    </YziIcon>
  );
}

export function GridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </YziIcon>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <YziIcon {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </YziIcon>
  );
}
