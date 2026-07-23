import "server-only";

import postgres from "postgres";

import {
  discoverMetaWhatsappAssets,
  type MetaWhatsappDiscoveryResult,
  type MetaWhatsappPhoneNumberAsset,
  type MetaWhatsappWabaAsset,
  type MetaWhatsappWebhookEvent,
} from "./meta-whatsapp";
import {
  sendMetaWhatsappTextMessage,
} from "./meta-whatsapp-outbound";

const META_WHATSAPP_DATABASE_ROLE = "yzi_meta_whatsapp_runtime";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

let whatsappSql: ReturnType<typeof postgres> | null = null;

type DiscoveryContextRow = {
  connection_id: string;
  tenant_id: string;
  graph_api_version: string;
  meta_access_token: string;
};

type OutboundContextRow = {
  tenant_id: string;
  conversation_id: string;
  connection_id: string;
  graph_api_version: string;
  meta_access_token: string;
  phone_number_id: string;
  external_sender_id: string;
};

type ReserveOutboundRow = {
  status: string;
  message_id: string;
  conversation_id: string;
  delivery_status: string | null;
  provider_message_id: string | null;
  provider_error_code: string | null;
};

type FinalizeOutboundRow = {
  status: string;
  message_id: string;
  conversation_id: string;
  provider_message_id: string;
  delivery_status: string;
  created_at: string;
  conversation_last_message_at: string;
};

type FailOutboundRow = {
  status: string;
  message_id: string;
  delivery_status: string;
  provider_error_code: string;
};

export type MetaWhatsappWebhookPersistenceResult =
  | { status: "ok"; inserted: boolean; eventId: string; createdAt: string }
  | { status: "ignored"; code: "no_supported_event" | "asset_not_found" }
  | { status: "error"; code: "persistence_failed" };

export type GovernedMetaWhatsappOutboundResult =
  | {
      status: "accepted";
      messageId: string;
      conversationId: string;
      providerMessageId: string;
      deliveryStatus: "accepted";
      idempotentReplay: boolean;
    }
  | {
      status: "error";
      code:
        | "configuration_unavailable"
        | "conversation_not_found"
        | "external_sender_missing"
        | "connection_unavailable"
        | "whatsapp_unavailable"
        | "idempotency_in_flight"
        | "idempotency_failed"
        | "provider_rejected"
        | "provider_unavailable"
        | "provider_response_invalid"
        | "network_error"
        | "persistence_failed";
      provider?: { httpStatus?: number; providerErrorCode?: number };
    };

function readWhatsappDatabaseUrl(): string {
  const connectionString = process.env.META_WHATSAPP_DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("Meta WhatsApp server configuration is unavailable.");
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("Meta WhatsApp server configuration is unavailable.");
  }

  const loginRole = decodeURIComponent(url.username).split(".", 1)[0];
  const sslMode = url.searchParams.get("sslmode");
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    loginRole !== META_WHATSAPP_DATABASE_ROLE ||
    !url.password ||
    !url.hostname ||
    (process.env.NODE_ENV === "production" && sslMode !== "require")
  ) {
    throw new Error("Meta WhatsApp server configuration is unavailable.");
  }

  return connectionString;
}

function getWhatsappSql(): ReturnType<typeof postgres> {
  if (!whatsappSql) {
    whatsappSql = postgres(readWhatsappDatabaseUrl(), {
      max: 1,
      prepare: false,
      connect_timeout: 5,
      idle_timeout: 20,
      max_lifetime: 60 * 10,
    });
  }
  return whatsappSql;
}

export async function runMetaWhatsappDiscovery(
  connectionId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<MetaWhatsappDiscoveryResult> {
  if (!UUID_RE.test(connectionId)) {
    return { status: "error", code: "configuration_unavailable" };
  }

  try {
    const sql = getWhatsappSql();
    const rows = await sql<DiscoveryContextRow[]>`
      select connection_id, tenant_id, graph_api_version, meta_access_token
      from yzi_meta_whatsapp_private.get_meta_whatsapp_discovery_context(
        ${connectionId}::uuid
      )
    `;
    const row = rows[0];
    if (
      !row ||
      !UUID_RE.test(row.connection_id) ||
      !UUID_RE.test(row.tenant_id) ||
      !row.graph_api_version ||
      !row.meta_access_token
    ) {
      return { status: "error", code: "configuration_unavailable" };
    }

    const discovery = await discoverMetaWhatsappAssets(
      {
        connectionId: row.connection_id,
        tenantId: row.tenant_id,
        graphApiVersion: row.graph_api_version,
        accessToken: row.meta_access_token,
      },
      fetchImpl,
    );

    if (discovery.status === "ok") {
      await persistMetaWhatsappAssets({
        connectionId: discovery.connectionId,
        wabas: discovery.wabas,
        phoneNumbers: discovery.phoneNumbers,
      });
    }

    return discovery;
  } catch {
    return { status: "error", code: "configuration_unavailable" };
  }
}

async function persistMetaWhatsappAssets(input: {
  connectionId: string;
  wabas: MetaWhatsappWabaAsset[];
  phoneNumbers: MetaWhatsappPhoneNumberAsset[];
}): Promise<void> {
  const sql = getWhatsappSql();
  await sql`
    select waba_count, phone_number_count, persisted_at
    from yzi_meta_whatsapp_private.upsert_meta_whatsapp_assets(
      ${input.connectionId}::uuid,
      ${sql.json(input.wabas as unknown as postgres.JSONValue)},
      ${sql.json(input.phoneNumbers as unknown as postgres.JSONValue)}
    )
  `;
}

export async function persistMetaWhatsappWebhookEvents(
  events: MetaWhatsappWebhookEvent[],
): Promise<MetaWhatsappWebhookPersistenceResult> {
  if (!events.length) {
    return { status: "ignored", code: "no_supported_event" };
  }

  try {
    const sql = getWhatsappSql();
    let inserted = false;
    let eventId = "";
    let createdAt = "";

    for (const event of events) {
      const assetRows = await sql<{
        tenant_id: string;
        connection_id: string;
      }[]>`
        select tenant_id, connection_id, matched_kind, matched_external_account_id
        from yzi_meta_whatsapp_private.resolve_meta_whatsapp_webhook_asset(
          ${event.phoneNumberId}::text,
          ${event.wabaId}::text
        )
      `;
      const asset = assetRows[0];
      if (!asset?.tenant_id || !asset.connection_id) {
        continue;
      }

      const rows = await sql<{
        event_id: string;
        inserted: boolean;
        created_at: string;
      }[]>`
        select event_id, inserted, created_at
        from yzi_meta_whatsapp_private.insert_meta_whatsapp_webhook_event(
          ${asset.connection_id}::uuid,
          ${event.providerEventKey}::text,
          ${event.externalMessageId}::text,
          ${event.eventType}::text,
          ${event.phoneNumberId}::text,
          ${event.wabaId}::text,
          ${event.normalizedStatus}::text,
          ${sql.json(event.payloadMin as unknown as postgres.JSONValue)}
        )
      `;
      const row = rows[0];
      if (row) {
        inserted ||= row.inserted;
        eventId ||= row.event_id;
        createdAt ||= row.created_at;
      }
    }

    if (!eventId) {
      return { status: "ignored", code: "asset_not_found" };
    }

    return { status: "ok", inserted, eventId, createdAt };
  } catch {
    return { status: "error", code: "persistence_failed" };
  }
}

export async function sendGovernedMetaWhatsappText(input: {
  tenantId: string;
  conversationId: string;
  body: string;
  idempotencyKey: string;
  fetchImpl?: typeof fetch;
}): Promise<GovernedMetaWhatsappOutboundResult> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const sql = getWhatsappSql();

  let reservation: ReserveOutboundRow;
  try {
    const reservationRows = await sql<ReserveOutboundRow[]>`
      select status, message_id, conversation_id, delivery_status, provider_message_id, provider_error_code
      from yzi_meta_whatsapp_private.reserve_meta_whatsapp_outbound_message(
        ${input.tenantId}::uuid,
        ${input.conversationId}::uuid,
        ${input.body}::text,
        ${input.idempotencyKey}::text
      )
    `;
    if (!reservationRows[0]) {
      return { status: "error", code: "persistence_failed" };
    }
    reservation = reservationRows[0];
  } catch (error) {
    return mapOutboundSqlError(error);
  }

  if (reservation.status === "duplicate") {
    if (reservation.delivery_status === "accepted" && reservation.provider_message_id) {
      return {
        status: "accepted",
        messageId: reservation.message_id,
        conversationId: reservation.conversation_id,
        providerMessageId: reservation.provider_message_id,
        deliveryStatus: "accepted",
        idempotentReplay: true,
      };
    }
    if (reservation.delivery_status === "pending_dispatch") {
      return { status: "error", code: "idempotency_in_flight" };
    }
    return { status: "error", code: "idempotency_failed" };
  }

  let context: OutboundContextRow;
  try {
    const contextRows = await sql<OutboundContextRow[]>`
      select tenant_id, conversation_id, connection_id, graph_api_version, meta_access_token, phone_number_id, external_sender_id
      from yzi_meta_whatsapp_private.get_meta_whatsapp_outbound_context(
        ${input.tenantId}::uuid,
        ${input.conversationId}::uuid
      )
    `;
    if (!contextRows[0]) {
      await markMetaWhatsappOutboundFailure(sql, input.tenantId, reservation.message_id, "configuration_unavailable");
      return { status: "error", code: "configuration_unavailable" };
    }
    context = contextRows[0];
  } catch (error) {
    const mapped = mapOutboundSqlError(error);
    if (mapped.status === "error") {
      await markMetaWhatsappOutboundFailure(sql, input.tenantId, reservation.message_id, mapped.code);
    }
    return mapped;
  }

  const providerResult = await sendMetaWhatsappTextMessage(
    {
      graphApiVersion: context.graph_api_version,
      accessToken: context.meta_access_token,
      phoneNumberId: context.phone_number_id,
      recipient: context.external_sender_id,
      body: input.body,
    },
    fetchImpl,
  );

  if (providerResult.status !== "accepted") {
    await markMetaWhatsappOutboundFailure(sql, input.tenantId, reservation.message_id, providerResult.code);
    return {
      status: "error",
      code: providerResult.code,
      provider: {
        httpStatus: providerResult.httpStatus,
        providerErrorCode: providerResult.providerErrorCode,
      },
    };
  }

  try {
    const finalizeRows = await sql<FinalizeOutboundRow[]>`
      select status, message_id, conversation_id, provider_message_id, delivery_status, created_at, conversation_last_message_at
      from yzi_meta_whatsapp_private.complete_meta_whatsapp_outbound_message(
        ${input.tenantId}::uuid,
        ${reservation.message_id}::uuid,
        ${providerResult.providerMessageId}::text,
        ${providerResult.deliveryStatus}::text
      )
    `;
    const finalized = finalizeRows[0];
    if (!finalized) {
      return { status: "error", code: "persistence_failed" };
    }
    return {
      status: "accepted",
      messageId: finalized.message_id,
      conversationId: finalized.conversation_id,
      providerMessageId: finalized.provider_message_id,
      deliveryStatus: "accepted",
      idempotentReplay: false,
    };
  } catch {
    return { status: "error", code: "persistence_failed" };
  }
}

async function markMetaWhatsappOutboundFailure(
  sql: ReturnType<typeof postgres>,
  tenantId: string,
  messageId: string,
  errorCode: string,
): Promise<void> {
  try {
    await sql<FailOutboundRow[]>`
      select status, message_id, delivery_status, provider_error_code
      from yzi_meta_whatsapp_private.fail_meta_whatsapp_outbound_message(
        ${tenantId}::uuid,
        ${messageId}::uuid,
        ${errorCode}::text
      )
    `;
  } catch {
    // Outbound caller already returns the governing failure. This best-effort
    // persistence path must stay sanitized and silent.
  }
}

function mapOutboundSqlError(error: unknown): GovernedMetaWhatsappOutboundResult {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("conversation_not_found")) {
    return { status: "error", code: "conversation_not_found" };
  }
  if (message.includes("external_sender_missing")) {
    return { status: "error", code: "external_sender_missing" };
  }
  if (
    message.includes("eligible_meta_connection_required") ||
    message.includes("meta_vault_secret_unavailable")
  ) {
    return { status: "error", code: "connection_unavailable" };
  }
  if (
    message.includes("whatsapp_phone_asset_missing") ||
    message.includes("ambiguous_whatsapp_phone_asset")
  ) {
    return { status: "error", code: "whatsapp_unavailable" };
  }
  if (message.includes("outbound_message_mismatch")) {
    return { status: "error", code: "idempotency_failed" };
  }
  if (message.includes("outbound_idempotency_conflict")) {
    return { status: "error", code: "idempotency_in_flight" };
  }
  return { status: "error", code: "configuration_unavailable" };
}

export async function closeMetaWhatsappServerClient(): Promise<void> {
  const sql = whatsappSql;
  whatsappSql = null;
  if (sql) {
    await sql.end({ timeout: 5 });
  }
}
