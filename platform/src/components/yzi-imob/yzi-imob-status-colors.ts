// Modulo central de cor funcional do YZI IMOB (Material System v1). Cor aqui
// representa estado operacional, prioridade e tipo de decisao, nunca decoracao.
// A paleta e dark-first e comunica papel: gelo/inteligencia, azul profundo/
// navegacao, ciano/recomendacao, ambar/atencao, verde frio/aprovado, vinho/
// bloqueio e grafite/estrutura.

export const YZI_IMOB_ROLE_COLOR = {
  primary: "152, 196, 236", // azul gelo: inteligencia, item ativo, recomendacao central
  ice: "190, 222, 248", // realce frio de precisao
  petrol: "48, 88, 132", // azul profundo: navegacao e direcao
  deepBlue: "25, 48, 78", // azul profundo fechado: superficie ativa
  cyan: "92, 190, 204", // ciano discreto: recomendacao e leitura assistida
  lilac: "178, 160, 214", // legado compativel: decisao humana pendente
  amber: "214, 164, 82", // ambar: atencao, falta de dado, pendencia
  coldGreen: "92, 184, 142", // verde frio: aprovado, pronto, validado
  wine: "142, 58, 72", // vermelho vinho: bloqueio ou reprovacao
  coldRed: "142, 58, 72", // alias compativel para bloqueios existentes
  graphite: "95, 109, 126", // cinza grafite: estrutura e estado neutro
  neutral: "125, 139, 156", // cinza frio: rascunho, metadado sem estado ainda
} as const;

export type YziImobRole = keyof typeof YZI_IMOB_ROLE_COLOR;

export function imobRgba(role: YziImobRole, alpha: number): string {
  return `rgba(${YZI_IMOB_ROLE_COLOR[role]}, ${alpha})`;
}

/* ------------------------------------------------------------------ */
/* Property / Catalog                                                  */
/* ------------------------------------------------------------------ */

export const PROPERTY_STATUS_ACCENT: Record<
  "rascunho" | "organizando" | "pendencias" | "aguardando" | "publicar" | "publicado",
  YziImobRole
> = {
  rascunho: "graphite",
  organizando: "cyan",
  pendencias: "amber",
  aguardando: "lilac",
  publicar: "coldGreen",
  publicado: "coldGreen",
};

/* ------------------------------------------------------------------ */
/* Broker / Corretores                                                 */
/* ------------------------------------------------------------------ */

export const BROKER_STATUS_ACCENT: Record<"ativo" | "em integração" | "inativo", YziImobRole> = {
  ativo: "coldGreen",
  "em integração": "amber",
  inativo: "wine",
};

/* ------------------------------------------------------------------ */
/* Client / Clientes                                                   */
/* ------------------------------------------------------------------ */

export const CLIENT_STAGE_ACCENT: Record<"lead" | "qualificado" | "cliente" | "inativo", YziImobRole> = {
  lead: "cyan",
  qualificado: "lilac",
  cliente: "coldGreen",
  inativo: "wine",
};

/* ------------------------------------------------------------------ */
/* Readiness / checklist generico                                      */
/* ------------------------------------------------------------------ */

export type ReadinessState = "done" | "pending" | "blocked";

export const READINESS_ACCENT: Record<ReadinessState, YziImobRole> = {
  done: "coldGreen",
  pending: "amber",
  blocked: "wine",
};
