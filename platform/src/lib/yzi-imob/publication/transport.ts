import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import type { PropertyPublicPayload } from "./types.ts";

export const SITE_PUBLICATION_CONTRACT_VERSION = "2026-07-28.v1" as const;
export const SITE_PUBLICATION_TIMEOUT_MS = 8_000;
export const SITE_PUBLICATION_MAX_ATTEMPTS = 3;

export const SITE_PUBLICATION_ERROR_CODES = [
  "authentication_failed",
  "invalid_signature",
  "unsupported_contract_version",
  "invalid_payload",
  "idempotency_conflict",
  "timeout",
  "transport_unavailable",
  "site_rejected",
] as const;

export type SitePublicationErrorCode = (typeof SITE_PUBLICATION_ERROR_CODES)[number];

export type SitePublicationRequest = {
  contractVersion: typeof SITE_PUBLICATION_CONTRACT_VERSION;
  idempotencyKey: string;
  correlationId: string;
  origin: "yzi_imob";
  operation: "publish" | "update";
  payload: PropertyPublicPayload;
};

export type SitePublicationResponse =
  | {
      status: "accepted";
      propertyId: string;
      publicationVersion: number;
      publicUrl: string;
      correlationId: string;
    }
  | {
      status: "rejected";
      errorCode: SitePublicationErrorCode;
      retryable: boolean;
      correlationId: string;
    };

export type SitePublicationTransport = {
  send(request: SitePublicationRequest): Promise<SitePublicationResponse>;
};

export function buildSitePublicationSignature(
  secret: string,
  timestamp: string,
  body: string,
): string {
  if (!secret) throw new Error("site_publication_secret_required");
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

export function verifySitePublicationSignature(
  secret: string,
  timestamp: string,
  body: string,
  providedSignature: string,
): boolean {
  if (!/^[a-f0-9]{64}$/.test(providedSignature)) return false;
  const expected = buildSitePublicationSignature(secret, timestamp, body);
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(providedSignature, "hex"));
}

export class ControlledFakeSitePublicationTransport
  implements SitePublicationTransport
{
  readonly #baseUrl: string;
  readonly #responses = new Map<string, SitePublicationResponse>();

  constructor(baseUrl = "https://site.invalid") {
    this.#baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async send(request: SitePublicationRequest): Promise<SitePublicationResponse> {
    const existing = this.#responses.get(request.idempotencyKey);
    if (existing) return existing;

    const response: SitePublicationResponse = {
      status: "accepted",
      propertyId: request.payload.property_id,
      publicationVersion: request.payload.publication_version,
      publicUrl: `${this.#baseUrl}/imoveis/${request.payload.slug}`,
      correlationId: request.correlationId,
    };
    this.#responses.set(request.idempotencyKey, response);
    return response;
  }
}
