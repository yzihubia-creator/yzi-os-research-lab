import "server-only";

import postgres from "postgres";

import {
  discoverMetaWhatsappAssets,
  type MetaWhatsappDiscoveryResult,
  type MetaWhatsappPhoneNumberAsset,
  type MetaWhatsappWabaAsset,
  type MetaWhatsappWebhookEvent,
} from "./meta-whatsapp";

const META_WHATSAPP_DATABASE_ROLE = "yzi_meta_whatsapp_runtime";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

let whatsappSql: ReturnType<typeof postgres> | null = null;

type DiscoveryContextRow = {
  connection_id: string;
  tenant_id: string;
  graph_api_version: string;
  meta_access_token: string;
};

export type MetaWhatsappWebhookPersistenceResult =
  | { status: "ok"; inserted: boolean; eventId: string; createdAt: string }
  | { status: "ignored"; code: "no_supported_event" | "asset_not_found" }
  | { status: "error"; code: "persistence_failed" };

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
      ${JSON.stringify(input.wabas)}::jsonb,
      ${JSON.stringify(input.phoneNumbers)}::jsonb
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
          ${JSON.stringify(event.payloadMin)}::jsonb
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

export async function closeMetaWhatsappServerClient(): Promise<void> {
  const sql = whatsappSql;
  whatsappSql = null;
  if (sql) {
    await sql.end({ timeout: 5 });
  }
}
