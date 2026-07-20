const NON_SEMANTIC_HANDLE_CHARS_RE = /[^0-9A-Za-z@._:-]+/g;
const NON_SEMANTIC_NUMBER_CHARS_RE = /[^0-9A-Za-z]+/g;

export type ExternalSenderIdNormalizationResult =
  | { status: "ok"; externalSenderId: string }
  | { status: "error"; code: "empty_sender" };

export function normalizeWhatsappExternalSenderId(input: string | null | undefined): ExternalSenderIdNormalizationResult {
  const trimmed = (input ?? "").trim();
  const normalized = trimmed.includes("@")
    ? trimmed.replace(NON_SEMANTIC_HANDLE_CHARS_RE, "")
    : trimmed.replace(NON_SEMANTIC_NUMBER_CHARS_RE, "");
  if (!normalized) {
    return { status: "error", code: "empty_sender" };
  }
  return { status: "ok", externalSenderId: normalized };
}
