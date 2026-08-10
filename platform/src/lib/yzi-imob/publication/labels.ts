// YZI IMOB — Publication presentation labels (leitura, somente).
//
// Traduz o status de publicação e os códigos de bloqueio/alerta calculados em
// `readiness.ts` para linguagem humana. Os códigos internos continuam
// disponíveis para lógica/debug — este módulo é presentation-only.

import type { PropertyPublicationStatus } from "./types";
import type { SitePublicationErrorCode } from "./transport";

export const PUBLICATION_STATUS_LABEL: Record<PropertyPublicationStatus, string> = {
  draft: "Rascunho",
  incomplete: "Incompleto",
  under_review: "Em revisão",
  changes_required: "Alterações solicitadas",
  ready_to_publish: "Pronto",
  approved: "Aprovado",
  publishing: "Sincronizando",
  published: "Publicado",
  update_pending: "Atualização pendente",
  paused: "Pausado",
  unpublished: "Despublicado",
  archived: "Arquivado",
  failed: "Falha",
};

export function publicationStatusLabel(status: string | null | undefined): string {
  if (!status) return "Rascunho";
  return PUBLICATION_STATUS_LABEL[status as PropertyPublicationStatus] ?? status;
}

/** Bloqueios: impedem a publicação enquanto existirem. */
const PUBLICATION_BLOCKER_LABEL: Record<string, string> = {
  missing_title: "Defina um título para o imóvel",
  missing_property_type: "Defina o tipo do imóvel",
  missing_operation_type: "Defina a transação (venda, aluguel ou ambos)",
  missing_city: "Informe a cidade",
  missing_neighborhood: "Informe o bairro",
  missing_price_or_visibility_policy: "Informe o preço ou marque a política de exibição do preço",
  missing_description: "Escreva uma descrição para o imóvel",
  missing_slug: "Defina a URL pública (slug)",
  missing_area: "Informe a área do imóvel",
  missing_bedrooms: "Informe o número de quartos",
  missing_suites: "Informe o número de suítes",
  missing_bathrooms: "Informe o número de banheiros",
  missing_parking_spaces: "Informe o número de vagas",
  title_too_short: "O título está curto demais",
  description_too_short: "A descrição está curta demais",
  slug_invalid: "A URL pública (slug) é inválida",
  price_invalid: "O preço informado é inválido",
  bedrooms_invalid: "O número de quartos é inválido",
  suites_invalid: "O número de suítes é inválido",
  bathrooms_invalid: "O número de banheiros é inválido",
  parking_spaces_invalid: "O número de vagas é inválido",
  property_not_available: "O imóvel precisa estar disponível para ser publicado",
  cover_missing: "Defina uma imagem principal",
  multiple_covers: "Defina apenas uma imagem como principal",
  gallery_below_minimum: "Adicione mais imagens aprovadas à galeria",
  media_url_invalid: "Uma mídia aprovada está com link inválido",
};

/** Alertas: não impedem a publicação, mas merecem atenção. */
const PUBLICATION_WARNING_LABEL: Record<string, string> = {
  media_processing_excluded: "Há mídia ainda em processamento; ela não entra na publicação até concluir",
  media_failed_excluded: "Há mídia com falha de processamento; ela não entra na publicação",
  image_alt_text_missing: "Há imagem aprovada sem texto alternativo",
  price_hidden_by_policy: "O preço ficará oculto por política de exibição",
  canonical_url_pending_until_first_sync: "A URL pública será criada na primeira sincronização",
};

export function publicationBlockerLabel(code: string): string {
  return PUBLICATION_BLOCKER_LABEL[code] ?? `Pendência: ${code}`;
}

export function publicationWarningLabel(code: string): string {
  return PUBLICATION_WARNING_LABEL[code] ?? `Alerta: ${code}`;
}

const SYNC_ERROR_LABEL: Record<SitePublicationErrorCode, string> = {
  authentication_failed: "Falha de autenticação com o site",
  invalid_signature: "Assinatura de segurança inválida",
  unsupported_contract_version: "Versão de contrato não suportada pelo site",
  invalid_payload: "Os dados enviados ao site são inválidos",
  idempotency_conflict: "Conflito com uma sincronização anterior",
  timeout: "O site não respondeu a tempo",
  transport_unavailable: "O site está indisponível no momento",
  site_rejected: "O site rejeitou a publicação",
};

export function syncErrorLabel(code: string | null | undefined): string {
  if (!code) return "Nenhum";
  return SYNC_ERROR_LABEL[code as SitePublicationErrorCode] ?? code;
}
