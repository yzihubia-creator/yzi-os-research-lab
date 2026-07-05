// Módulo central de cor funcional do YZI IMOB (Material System v1). Cor aqui
// representa estado operacional, prioridade e tipo de decisão — nunca
// decoração. Paleta fria, sem verde saturado e sem o teal canônico do YZI OS
// core como cor principal desta vertical. Todo componente do YZI IMOB que
// precisar de um RGB triple de papel deve importar daqui, em vez de repetir
// strings de cor soltas.
//
// Papéis:
// - primary (ice-blue / petrol-blue): ações principais, item ativo, YZI
//   conduzindo, estado pronto. Mesmo valor de --imob-ice/--imob-cold do
//   globals.css.
// - petrol: superfícies/containers/estados neutros de destaque (mais escuro
//   que primary).
// - cyan: qualificação, WhatsApp, comunicação, leitura da YZI.
// - lilac: preview, autorização, decisão humana pendente.
// - amber: pendência, atenção, falta de dado, bloqueio leve.
// - coldRed: perdido, erro, bloqueado, indisponível.
//
// Uso: inline style com `rgba(${YZI_IMOB_ROLE_COLOR.amber}, 0.16)` — mesmo
// padrão já aprovado em yzi-imob-conversation-mock.ts (Atendimento).

export const YZI_IMOB_ROLE_COLOR = {
  primary: "96, 165, 230", // ice-blue / --imob-cold — ativo, pronto, ação principal
  ice: "152, 196, 236", // --imob-ice — realce mais claro do primary
  petrol: "70, 122, 168", // superfícies/containers/estados neutros de destaque
  cyan: "94, 184, 202", // qualificação, WhatsApp, comunicação
  lilac: "178, 160, 214", // preview, autorização, decisão humana pendente
  amber: "196, 158, 96", // pendência, atenção, falta de dado
  coldRed: "196, 108, 108", // perdido, bloqueado, indisponível
  neutral: "148, 163, 184", // cinza frio — rascunho, metadado sem estado ainda
} as const;

export type YziImobRole = keyof typeof YZI_IMOB_ROLE_COLOR;

// Helper: monta rgba() a partir de um papel + opacidade, evitando template
// strings repetidas em cada componente.
export function imobRgba(role: YziImobRole, alpha: number): string {
  return `rgba(${YZI_IMOB_ROLE_COLOR[role]}, ${alpha})`;
}

/* ------------------------------------------------------------------ */
/* Property / Catalog                                                  */
/* ------------------------------------------------------------------ */

// Estados do imóvel (yzi-imob-catalog-mock.ts PropertyStatus). Mapeamento
// funcional: rascunho→cinza frio, organizando→cyan, pendências→âmbar,
// aguardando aprovação→lilás, pronto para publicar→primária fria,
// publicado→petrol/cyan discreto.
export const PROPERTY_STATUS_ACCENT: Record<
  "rascunho" | "organizando" | "pendencias" | "aguardando" | "publicar" | "publicado",
  YziImobRole
> = {
  rascunho: "neutral",
  organizando: "cyan",
  pendencias: "amber",
  aguardando: "lilac",
  publicar: "primary",
  publicado: "petrol",
};

/* ------------------------------------------------------------------ */
/* Broker / Corretores                                                 */
/* ------------------------------------------------------------------ */

// Status do corretor (yzi-imob-entity-workspace-mock.ts BrokerStatus).
export const BROKER_STATUS_ACCENT: Record<
  "ativo" | "em integração" | "inativo",
  YziImobRole
> = {
  ativo: "primary",
  "em integração": "amber",
  inativo: "coldRed",
};

/* ------------------------------------------------------------------ */
/* Client / Clientes                                                   */
/* ------------------------------------------------------------------ */

// Status do cliente (yzi-imob-entity-workspace-mock.ts ClientStatus).
export const CLIENT_STAGE_ACCENT: Record<
  "lead" | "qualificado" | "cliente" | "inativo",
  YziImobRole
> = {
  lead: "cyan",
  qualificado: "lilac",
  cliente: "primary",
  inativo: "coldRed",
};

/* ------------------------------------------------------------------ */
/* Readiness / checklist genérico                                      */
/* ------------------------------------------------------------------ */

// Estado de item de checklist (ok / pendente / bloqueado), usado em Property,
// Broker e Client Workspace.
export type ReadinessState = "done" | "pending" | "blocked";

export const READINESS_ACCENT: Record<ReadinessState, YziImobRole> = {
  done: "primary",
  pending: "amber",
  blocked: "coldRed",
};
