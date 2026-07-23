import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_META_RESPONSE_BYTES = 64 * 1024;
const META_TIMEOUT_MS = 8_000;
const GRAPH_API_VERSION_RE = /^v\d+\.\d+$/;
const HEX_SHA256_RE = /^[a-f0-9]{64}$/i;

export type MetaWhatsappDiscoveryContext = {
  connectionId: string;
  tenantId: string;
  graphApiVersion: string;
  accessToken: string;
};

export type MetaWhatsappWabaAsset = {
  external_account_id: string;
  account_label: string | null;
  status: "connected" | "configuring" | "attention" | "unavailable";
  metadata: Record<string, unknown>;
};

export type MetaWhatsappPhoneNumberAsset = {
  phone_number_id: string;
  display_phone_number: string | null;
  verified_name: string | null;
  status: "connected" | "configuring" | "attention" | "unavailable";
  metadata: Record<string, unknown>;
};

export type MetaWhatsappDiscoveryResult =
  | {
      status: "ok";
      connectionId: string;
      tenantId: string;
      wabas: MetaWhatsappWabaAsset[];
      phoneNumbers: MetaWhatsappPhoneNumberAsset[];
      diagnostics: MetaWhatsappDiscoveryDiagnostics;
    }
  | {
      status: "error";
      code: "configuration_unavailable" | "provider_unavailable" | "provider_response_invalid";
      diagnostics?: MetaWhatsappDiscoveryDiagnostics;
    };

export type MetaWhatsappDiscoveryDiagnostics = {
  discovered: {
    wabaCount: number;
    phoneNumberCount: number;
    linkedPhoneNumberCount: number;
    discoveryComplete: boolean;
  };
  providerErrors: MetaWhatsappProviderError[];
};

export type MetaWhatsappProviderError = {
  stage: "businesses" | "business_owned_wabas" | "business_client_wabas" | "me_wabas" | "phone_numbers";
  httpStatus?: number;
  metaErrorCode?: number;
  metaErrorSubcode?: number;
};

export type MetaWhatsappWebhookEvent = {
  providerEventKey: string;
  externalMessageId: string | null;
  eventType: "message" | "status" | "unsupported";
  phoneNumberId: string | null;
  wabaId: string | null;
  normalizedStatus: string;
  payloadMin: Record<string, unknown>;
};

type FetchLike = typeof fetch;

type MetaFetchResult =
  | { status: "ok"; payload: unknown }
  | { status: "error"; error: MetaWhatsappProviderError };

export function readMetaWhatsappWebhookConfig(env: NodeJS.ProcessEnv = process.env): {
  appSecret: string;
  verifyToken: string;
} | null {
  const appSecret = env.META_APP_SECRET;
  const verifyToken = env.META_WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (!appSecret || !verifyToken || appSecret.trim() !== appSecret || verifyToken.trim() !== verifyToken) {
    return null;
  }
  return { appSecret, verifyToken };
}

export function verifyMetaWhatsappChallenge(input: {
  mode: string | null;
  verifyToken: string | null;
  challenge: string | null;
  expectedVerifyToken: string;
}): string | null {
  if (input.mode !== "subscribe" || !input.challenge || !input.verifyToken) {
    return null;
  }
  return safeEqualText(input.verifyToken, input.expectedVerifyToken) ? input.challenge : null;
}

export function verifyMetaSignature(rawBody: Buffer, headerValue: string | null, appSecret: string): boolean {
  if (!headerValue?.startsWith("sha256=")) {
    return false;
  }
  const hex = headerValue.slice("sha256=".length);
  if (!HEX_SHA256_RE.test(hex)) {
    return false;
  }
  const actual = Buffer.from(hex, "hex");
  const expected = createHmac("sha256", appSecret).update(rawBody).digest();
  if (actual.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(actual, expected);
}

export function signMetaWhatsappFixture(rawBody: Buffer, appSecret: string): string {
  return `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
}

export function parseMetaWhatsappWebhookPayload(payload: unknown): MetaWhatsappWebhookEvent[] {
  const root = asRecord(payload);
  const entries = Array.isArray(root?.entry) ? root.entry : [];
  const events: MetaWhatsappWebhookEvent[] = [];

  for (const entry of entries) {
    const entryRecord = asRecord(entry);
    const wabaId = readString(entryRecord?.id);
    const changes = Array.isArray(entryRecord?.changes) ? entryRecord.changes : [];

    for (const change of changes) {
      const value = asRecord(asRecord(change)?.value);
      if (!value) continue;
      const metadata = asRecord(value.metadata);
      const phoneNumberId = readString(metadata?.phone_number_id);

      const messages = Array.isArray(value.messages) ? value.messages : [];
      for (const message of messages) {
        const event = normalizeInboundMessage(message, { wabaId, phoneNumberId });
        if (event) events.push(event);
      }

      const statuses = Array.isArray(value.statuses) ? value.statuses : [];
      for (const status of statuses) {
        const event = normalizeStatusCallback(status, { wabaId, phoneNumberId });
        if (event) events.push(event);
      }
    }
  }

  return events;
}

export function normalizeInboundMessage(
  value: unknown,
  context: { wabaId: string | null; phoneNumberId: string | null },
): MetaWhatsappWebhookEvent | null {
  const record = asRecord(value);
  const id = readString(record?.id);
  if (!id) return null;
  const type = readString(record?.type) ?? "unknown";
  const timestamp = readString(record?.timestamp);
  const from = readString(record?.from);
  const text = type === "text" ? readString(asRecord(record?.text)?.body) : null;

  return {
    providerEventKey: id,
    externalMessageId: id,
    eventType: "message",
    phoneNumberId: context.phoneNumberId,
    wabaId: context.wabaId,
    normalizedStatus: "received",
    payloadMin: stripNulls({
      message_id: id,
      from,
      timestamp,
      message_type: type,
      text,
    }),
  };
}

export function normalizeStatusCallback(
  value: unknown,
  context: { wabaId: string | null; phoneNumberId: string | null },
): MetaWhatsappWebhookEvent | null {
  const record = asRecord(value);
  const firstError = Array.isArray(record?.errors) ? asRecord(record.errors[0]) : null;
  const id = readString(record?.id);
  const status = readString(record?.status);
  const timestamp = readString(record?.timestamp);
  if (!id || !status || !timestamp) return null;

  return {
    providerEventKey: `${id}:${status}:${timestamp}`,
    externalMessageId: id,
    eventType: "status",
    phoneNumberId: context.phoneNumberId,
    wabaId: context.wabaId,
    normalizedStatus: normalizeWebhookStatus(status),
    payloadMin: stripNulls({
      message_id: id,
      status,
      timestamp,
      recipient_id: readString(record?.recipient_id),
      provider_error_code: readNumber(firstError?.code),
      provider_error_subcode: readNumber(firstError?.error_subcode),
    }),
  };
}

export function normalizeWhatsappNumberStatus(input: {
  qualityRating: string | null;
  codeVerificationStatus: string | null;
  status: string | null;
}): MetaWhatsappPhoneNumberAsset["status"] {
  const providerStatus = input.status?.toUpperCase() ?? "";
  const codeStatus = input.codeVerificationStatus?.toUpperCase() ?? "";
  if (providerStatus.includes("DISABLED") || providerStatus.includes("RESTRICTED")) {
    return "attention";
  }
  if (providerStatus === "CONNECTED") {
    return "connected";
  }
  if (providerStatus === "PENDING") {
    return "configuring";
  }
  if (codeStatus === "VERIFIED" || codeStatus === "APPROVED") {
    return "configuring";
  }
  if (input.status || input.codeVerificationStatus || input.qualityRating) {
    return "configuring";
  }
  return "unavailable";
}

export async function discoverMetaWhatsappAssets(
  context: MetaWhatsappDiscoveryContext,
  fetchImpl: FetchLike = fetch,
): Promise<MetaWhatsappDiscoveryResult> {
  if (!GRAPH_API_VERSION_RE.test(context.graphApiVersion) || !context.accessToken) {
    return { status: "error", code: "configuration_unavailable" };
  }

  const providerErrors: MetaWhatsappProviderError[] = [];
  const wabas = new Map<string, MetaWhatsappWabaAsset>();
  const phoneNumbers = new Map<string, MetaWhatsappPhoneNumberAsset>();

  const businessesUrl = graphUrl(context.graphApiVersion, "/me/businesses");
  businessesUrl.searchParams.set("fields", "id,name,verification_status");
  const businesses = await fetchMetaPages(businessesUrl, context.accessToken, "businesses", fetchImpl);
  const businessRows = businesses.status === "ok" ? businesses.rows : [];
  if (businesses.status === "error") providerErrors.push(...businesses.errors);

  for (const business of businessRows) {
    const businessId = readString(business.id);
    if (!businessId) continue;

    for (const edge of [
      { path: "owned_whatsapp_business_accounts", stage: "business_owned_wabas" as const },
      { path: "client_whatsapp_business_accounts", stage: "business_client_wabas" as const },
    ]) {
      const wabaUrl = graphUrl(context.graphApiVersion, `/${businessId}/${edge.path}`);
      wabaUrl.searchParams.set("fields", "id,name,account_review_status,business_verification_status");
      const result = await fetchMetaPages(wabaUrl, context.accessToken, edge.stage, fetchImpl);
      if (result.status === "error") {
        providerErrors.push(...result.errors);
        continue;
      }
      for (const waba of result.rows) {
        addWaba(wabas, waba, { discoverySource: edge.path, businessId });
      }
    }
  }

  const meWabasUrl = graphUrl(context.graphApiVersion, "/me/whatsapp_business_accounts");
  meWabasUrl.searchParams.set("fields", "id,name,account_review_status,business_verification_status");
  const meWabas = await fetchMetaPages(meWabasUrl, context.accessToken, "me_wabas", fetchImpl);
  if (meWabas.status === "error") {
    providerErrors.push(...meWabas.errors);
  } else {
    for (const waba of meWabas.rows) {
      addWaba(wabas, waba, { discoverySource: "me" });
    }
  }

  for (const waba of wabas.values()) {
    const phonesUrl = graphUrl(context.graphApiVersion, `/${waba.external_account_id}/phone_numbers`);
    phonesUrl.searchParams.set(
      "fields",
      "id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type,status",
    );
    const result = await fetchMetaPages(phonesUrl, context.accessToken, "phone_numbers", fetchImpl);
    if (result.status === "error") {
      providerErrors.push(...result.errors);
      continue;
    }
    for (const phone of result.rows) {
      const normalized = normalizePhoneNumber(phone, waba.external_account_id);
      if (normalized) phoneNumbers.set(normalized.phone_number_id, normalized);
    }
  }

  if (!wabas.size && !phoneNumbers.size && providerErrors.length) {
    return {
      status: "error",
      code: providerErrors.some((error) => error.httpStatus) ? "provider_unavailable" : "provider_response_invalid",
      diagnostics: buildDiscoveryDiagnostics([], [], providerErrors),
    };
  }

  return {
    status: "ok",
    connectionId: context.connectionId,
    tenantId: context.tenantId,
    wabas: [...wabas.values()],
    phoneNumbers: [...phoneNumbers.values()],
    diagnostics: buildDiscoveryDiagnostics([...wabas.values()], [...phoneNumbers.values()], providerErrors),
  };
}

function addWaba(
  target: Map<string, MetaWhatsappWabaAsset>,
  value: Record<string, unknown>,
  context: { discoverySource: string; businessId?: string },
): void {
  const id = readString(value.id);
  if (!id) return;
  const name = readString(value.name);
  target.set(id, {
    external_account_id: id,
    account_label: name,
    status: "configuring",
    metadata: stripNulls({
      normalized_kind: "whatsapp_business_account",
      status: "configuring",
      account_review_status: readString(value.account_review_status),
      business_verification_status: readString(value.business_verification_status),
      discovery_source: context.discoverySource,
      business_id: context.businessId,
      access_confirmed: true,
    }),
  });
}

function normalizePhoneNumber(
  value: Record<string, unknown>,
  wabaId: string,
): MetaWhatsappPhoneNumberAsset | null {
  const id = readString(value.id);
  if (!id) return null;
  const displayPhoneNumber = readString(value.display_phone_number);
  const verifiedName = readString(value.verified_name);
  const qualityRating = readString(value.quality_rating);
  const codeVerificationStatus = readString(value.code_verification_status);
  const platformType = readString(value.platform_type);
  const providerStatus = readString(value.status);
  const status = normalizeWhatsappNumberStatus({ qualityRating, codeVerificationStatus, status: providerStatus });

  return {
    phone_number_id: id,
    display_phone_number: displayPhoneNumber,
    verified_name: verifiedName,
    status,
    metadata: stripNulls({
      normalized_kind: "whatsapp_phone_number",
      waba_id: wabaId,
      display_phone_number: displayPhoneNumber,
      verified_name: verifiedName,
      quality_rating: qualityRating,
      code_verification_status: codeVerificationStatus,
      platform_type: platformType,
      provider_status: providerStatus,
      status,
      source_endpoint: "phone_numbers",
    }),
  };
}

async function fetchMetaPages(
  initialUrl: URL,
  accessToken: string,
  stage: MetaWhatsappProviderError["stage"],
  fetchImpl: FetchLike,
): Promise<{ status: "ok"; rows: Record<string, unknown>[] } | { status: "error"; errors: MetaWhatsappProviderError[] }> {
  const rows: Record<string, unknown>[] = [];
  const errors: MetaWhatsappProviderError[] = [];
  let nextUrl: URL | null = initialUrl;
  let pageCount = 0;

  while (nextUrl && pageCount < 10) {
    pageCount += 1;
    const result = await fetchMetaJson(nextUrl, accessToken, stage, fetchImpl);
    if (result.status === "error") {
      errors.push(result.error);
      break;
    }
    rows.push(...readDataArray(result.payload));
    nextUrl = readNextPageUrl(result.payload);
  }

  if (errors.length) {
    return rows.length ? { status: "ok", rows } : { status: "error", errors };
  }
  return { status: "ok", rows };
}

async function fetchMetaJson(
  url: URL,
  accessToken: string,
  stage: MetaWhatsappProviderError["stage"],
  fetchImpl: FetchLike,
): Promise<MetaFetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), META_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
    });
    const text = await readLimitedResponseText(response, MAX_META_RESPONSE_BYTES);
    if (!response.ok) {
      return { status: "error", error: { stage, httpStatus: response.status, ...readMetaError(text) } };
    }
    if (text === null) {
      return { status: "error", error: { stage } };
    }
    try {
      return { status: "ok", payload: JSON.parse(text) as unknown };
    } catch {
      return { status: "error", error: { stage } };
    }
  } catch {
    return { status: "error", error: { stage } };
  } finally {
    clearTimeout(timeout);
  }
}

async function readLimitedResponseText(response: Response, maxBytes: number): Promise<string | null> {
  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) return null;
  const text = await response.text();
  return new TextEncoder().encode(text).byteLength <= maxBytes ? text : null;
}

function readMetaError(text: string | null): Pick<MetaWhatsappProviderError, "metaErrorCode" | "metaErrorSubcode"> {
  try {
    const error = asRecord(JSON.parse(text ?? "{}"))?.error;
    const record = asRecord(error);
    return stripNulls({
      metaErrorCode: typeof record?.code === "number" ? record.code : null,
      metaErrorSubcode: typeof record?.error_subcode === "number" ? record.error_subcode : null,
    }) as Pick<MetaWhatsappProviderError, "metaErrorCode" | "metaErrorSubcode">;
  } catch {
    return {};
  }
}

function graphUrl(version: string, path: string): URL {
  return new URL(`https://graph.facebook.com/${version}${path}`);
}

function readDataArray(payload: unknown): Record<string, unknown>[] {
  const data = asRecord(payload)?.data;
  return Array.isArray(data) ? data.map(asRecord).filter((item): item is Record<string, unknown> => Boolean(item)) : [];
}

function readNextPageUrl(payload: unknown): URL | null {
  const next = readString(asRecord(asRecord(payload)?.paging)?.next);
  if (!next) return null;
  try {
    const url = new URL(next);
    return url.hostname === "graph.facebook.com" ? url : null;
  } catch {
    return null;
  }
}

function buildDiscoveryDiagnostics(
  wabas: MetaWhatsappWabaAsset[],
  phoneNumbers: MetaWhatsappPhoneNumberAsset[],
  providerErrors: MetaWhatsappProviderError[],
): MetaWhatsappDiscoveryDiagnostics {
  return {
    discovered: {
      wabaCount: wabas.length,
      phoneNumberCount: phoneNumbers.length,
      linkedPhoneNumberCount: phoneNumbers.filter((phone) => Boolean(phone.metadata.waba_id)).length,
      discoveryComplete: providerErrors.length === 0,
    },
    providerErrors,
  };
}

function normalizeWebhookStatus(status: string): string {
  switch (status) {
    case "sent":
    case "delivered":
    case "read":
    case "failed":
      return status;
    default:
      return "status_update";
  }
}

function safeEqualText(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stripNulls(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== null && value !== undefined && value !== ""),
  );
}
