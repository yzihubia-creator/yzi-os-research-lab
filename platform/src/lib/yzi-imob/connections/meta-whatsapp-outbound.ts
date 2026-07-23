const MAX_META_RESPONSE_BYTES = 64 * 1024;
const META_TIMEOUT_MS = 8_000;
const GRAPH_API_VERSION_RE = /^v\d+\.\d+$/;

type FetchLike = typeof fetch;

export type MetaWhatsappOutboundProviderResult =
  | { status: "accepted"; providerMessageId: string; deliveryStatus: "accepted" }
  | {
      status: "error";
      code:
        | "provider_rejected"
        | "provider_unavailable"
        | "provider_response_invalid"
        | "network_error";
      httpStatus?: number;
      providerErrorCode?: number;
    };

export type MetaWhatsappOutboundRequest = {
  graphApiVersion: string;
  accessToken: string;
  phoneNumberId: string;
  recipient: string;
  body: string;
};

export async function sendMetaWhatsappTextMessage(
  input: MetaWhatsappOutboundRequest,
  fetchImpl: FetchLike = fetch,
): Promise<MetaWhatsappOutboundProviderResult> {
  if (
    !GRAPH_API_VERSION_RE.test(input.graphApiVersion) ||
    !input.accessToken ||
    !input.phoneNumberId?.trim() ||
    !input.recipient?.trim() ||
    !input.body?.trim()
  ) {
    return { status: "error", code: "provider_response_invalid" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), META_TIMEOUT_MS);

  try {
    const url = new URL(`https://graph.facebook.com/${input.graphApiVersion}/${input.phoneNumberId}/messages`);
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${input.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: input.recipient,
        type: "text",
        text: {
          body: input.body,
          preview_url: false,
        },
      }),
      signal: controller.signal,
    });

    const payload = await readJsonBody(response);
    if (!response.ok) {
      return {
        status: "error",
        code: response.status >= 500 ? "provider_unavailable" : "provider_rejected",
        httpStatus: response.status,
        providerErrorCode: readProviderErrorCode(payload),
      };
    }

    const providerMessageId = readProviderMessageId(payload);
    if (!providerMessageId) {
      return { status: "error", code: "provider_response_invalid", httpStatus: response.status };
    }

    return {
      status: "accepted",
      providerMessageId,
      deliveryStatus: "accepted",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { status: "error", code: "network_error" };
    }
    return { status: "error", code: "network_error" };
  } finally {
    clearTimeout(timeout);
  }
}

function readProviderMessageId(payload: unknown): string | null {
  const record = asRecord(payload);
  const messages = Array.isArray(record?.messages) ? record.messages : [];
  const first = asRecord(messages[0]);
  return readString(first?.id);
}

function readProviderErrorCode(payload: unknown): number | undefined {
  const error = asRecord(asRecord(payload)?.error);
  return typeof error?.code === "number" ? error.code : undefined;
}

async function readJsonBody(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (raw.length > MAX_META_RESPONSE_BYTES) {
    return null;
  }
  try {
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
