import { NextResponse, type NextRequest } from "next/server";

import {
  parseMetaWhatsappWebhookPayload,
  readMetaWhatsappWebhookConfig,
  verifyMetaSignature,
  verifyMetaWhatsappChallenge,
} from "@/lib/yzi-imob/connections/meta-whatsapp";
import { persistMetaWhatsappWebhookEvents } from "@/lib/yzi-imob/connections/meta-whatsapp-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const result = await persistMetaWhatsappWebhookEvents(events);
  if (result.status === "error") {
    return NextResponse.json({ status: "accepted", persisted: false });
  }
  if (result.status === "ignored") {
    return NextResponse.json({ status: "accepted", persisted: false, code: result.code });
  }

  return NextResponse.json({
    status: "accepted",
    persisted: true,
    inserted: result.inserted,
  });
}
