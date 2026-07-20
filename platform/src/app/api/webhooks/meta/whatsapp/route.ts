import { NextResponse, type NextRequest } from "next/server";

import {
  parseMetaWhatsappWebhookPayload,
  readMetaWhatsappWebhookConfig,
  verifyMetaSignature,
  verifyMetaWhatsappChallenge,
} from "@/lib/yzi-imob/connections/meta-whatsapp";
import { persistMetaWhatsappWebhookEvents } from "@/lib/yzi-imob/connections/meta-whatsapp-server";
import { processWhatsappInboundEvent } from "@/lib/yzi-imob/connections/whatsapp-inbound-processor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_LOG_BASE = { provider: "meta", channel: "whatsapp" } as const;
const CONTROLLED_REASON_RE = /^[a-z0-9_:-]{1,80}$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function controlledReason(reason: string | null): string | null {
  return reason && CONTROLLED_REASON_RE.test(reason) ? reason : null;
}

function webhookLog(event: string, details: Record<string, string | boolean | number | null> = {}): void {
  console.info(`[meta-whatsapp-webhook] ${event}`, { ...WEBHOOK_LOG_BASE, ...details });
}

function webhookError(event: string, details: Record<string, string | boolean | number | null> = {}): void {
  console.error(`[meta-whatsapp-webhook] ${event}`, { ...WEBHOOK_LOG_BASE, ...details });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const config = readMetaWhatsappWebhookConfig();
  if (!config) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const challenge = verifyMetaWhatsappChallenge({
    mode: request.nextUrl.searchParams.get("hub.mode"),
    verifyToken: request.nextUrl.searchParams.get("hub.verify_token"),
    challenge: request.nextUrl.searchParams.get("hub.challenge"),
    expectedVerifyToken: config.verifyToken,
  });

  if (!challenge) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return new NextResponse(challenge, {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const config = readMetaWhatsappWebhookConfig();
  if (!config) {
    return NextResponse.json({ status: "rejected" }, { status: 403 });
  }

  const rawBody = Buffer.from(await request.arrayBuffer());
  const signature = request.headers.get("x-hub-signature-256");
  if (!verifyMetaSignature(rawBody, signature, config.appSecret)) {
    return NextResponse.json({ status: "rejected" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody.toString("utf8")) as unknown;
  } catch {
    return NextResponse.json({ status: "ignored", code: "invalid_json" }, { status: 400 });
  }

  const events = parseMetaWhatsappWebhookPayload(payload);
  webhookLog("webhook_received", { status: events[0]?.normalizedStatus ?? null });
  const result = await persistMetaWhatsappWebhookEvents(events);
  if (result.status === "error") {
    webhookError("inbound_processing_failed", { reason: result.code });
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
  if (result.status === "ignored") {
    webhookLog("inbound_ignored", { reason: result.code });
    return NextResponse.json({ status: "accepted", persisted: false, code: result.code });
  }

  webhookLog("webhook_persisted", { inserted: result.inserted });

  if (!UUID_RE.test(result.eventId)) {
    webhookError("inbound_processing_failed", { reason: "invalid_event_id" });
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  try {
    const processingResult = await processWhatsappInboundEvent(result.eventId);
    if (processingResult.duplicate) {
      webhookLog("inbound_duplicate", { reason: controlledReason(processingResult.reason) });
    } else if (processingResult.ignored) {
      webhookLog("inbound_ignored", { reason: controlledReason(processingResult.reason) });
    } else {
      webhookLog("inbound_processed");
    }

    return NextResponse.json({ status: "accepted" });
  } catch {
    webhookError("inbound_processing_failed", { reason: "processor_error" });
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
