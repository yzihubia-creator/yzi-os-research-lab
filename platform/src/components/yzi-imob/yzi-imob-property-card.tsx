import type { ComponentType, SVGProps } from "react";

import {
  YziBadge,
  YziButton,
  YziPanel,
  YziStatusBadge,
} from "@/components/yzi-os/yzi-primitives";
import {
  ActionsIcon,
  AssetsIcon,
  AttachmentIcon,
  AuditIcon,
  ChannelsIcon,
  CrmIcon,
  DashboardIcon,
  SendIcon,
} from "@/components/yzi-os/yzi-icons";

// Estrutura visual do card de imóvel — não representa nenhum imóvel real.
// Cada linha descreve de onde a informação virá quando o corretor finalizar
// o formulário de cadastro; nenhum valor aqui é dado de cliente.
type CardField = { label: string; value: string };

const CARD_FIELDS: CardField[] = [
  { label: "Título", value: "Definido a partir do cadastro" },
  { label: "Bairro", value: "Localização informada pelo corretor" },
  { label: "Valor", value: "Valor informado pelo corretor" },
  {
    label: "Quartos / suítes / vagas",
    value: "Características informadas no formulário",
  },
  { label: "Metragem", value: "Área informada no formulário" },
  {
    label: "Nível de Ativação",
    value: "Objetivo comercial definido no cadastro (L0–L4)",
  },
  { label: "property_id", value: "Gerado no cadastro" },
  { label: "Corretor responsável", value: "broker_id vinculado ao imóvel" },
];

type CardAction = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const CARD_ACTIONS: CardAction[] = [
  { label: "Site", icon: ChannelsIcon },
  { label: "Plano", icon: AuditIcon },
  { label: "Criativos", icon: DashboardIcon },
  { label: "Leads", icon: CrmIcon },
  { label: "WhatsApp", icon: SendIcon },
  { label: "Pipeline", icon: ActionsIcon },
];

export function YziImobPropertyCard() {
  return (
    <YziPanel className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
          <AssetsIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Estrutura do card de imóvel
          </h2>
        </div>
        <YziBadge tone="preview" className="normal-case">
          estrutura · sem imóvel real
        </YziBadge>
      </div>

      <div className="flex items-center justify-center gap-2 rounded-[var(--yzi-radius-sm)] border border-dashed border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-6 text-center">
        <AttachmentIcon className="h-4 w-4 text-[var(--yzi-text-faint)]" />
        <span className="text-xs text-[var(--yzi-text-faint)]">
          Capa — foto principal do imóvel
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <YziStatusBadge tone="preview">status do cadastro</YziStatusBadge>
        <YziBadge tone="neutral" className="normal-case">
          tipo do imóvel
        </YziBadge>
        <YziBadge tone="neutral" className="normal-case">
          nível de ativação
        </YziBadge>
      </div>

      <dl className="flex flex-col gap-2">
        {CARD_FIELDS.map((field) => (
          <div
            key={field.label}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-[color:var(--yzi-border-subtle)] pb-2 text-xs last:border-b-0 last:pb-0"
          >
            <dt className="text-[var(--yzi-text-secondary)]">{field.label}</dt>
            <dd className="text-right font-medium text-[var(--yzi-text-primary)]">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2 border-t border-[color:var(--yzi-border-subtle)] pt-3">
        {CARD_ACTIONS.map((action) => {
          const Glyph = action.icon;
          return (
            <YziButton key={action.label} variant="ghost" size="sm" disabled>
              <Glyph className="h-3.5 w-3.5" />
              {action.label}
            </YziButton>
          );
        })}
      </div>
    </YziPanel>
  );
}
