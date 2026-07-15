import "server-only";

import postgres from "postgres";

import type {
  MetaOAuthCallbackCompleteInput,
  MetaOAuthCallbackFailureInput,
  MetaOAuthCallbackRpcClient,
  MetaOAuthCallbackRpcError,
} from "./meta-oauth-callback";

const CALLBACK_DATABASE_ROLES = new Set([
  "yzi_meta_oauth_callback_runtime_a",
  "yzi_meta_oauth_callback_runtime_b",
]);

let callbackRpcClient: MetaOAuthCallbackRpcClient | null = null;

function readCallbackDatabaseUrl(): string {
  const connectionString = process.env.META_OAUTH_CALLBACK_DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("Meta OAuth callback server configuration is unavailable.");
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("Meta OAuth callback server configuration is unavailable.");
  }

  const loginRole = decodeURIComponent(url.username).split(".", 1)[0];
  const sslMode = url.searchParams.get("sslmode");
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !CALLBACK_DATABASE_ROLES.has(loginRole) ||
    !url.password ||
    !url.hostname ||
    (process.env.NODE_ENV === "production" && sslMode !== "require")
  ) {
    throw new Error("Meta OAuth callback server configuration is unavailable.");
  }

  return connectionString;
}

function toRpcError(error: unknown): MetaOAuthCallbackRpcError {
  const unsafeCode =
    error && typeof error === "object" && "code" in error
      ? (error as { code?: unknown }).code
      : undefined;

  return {
    code: typeof unsafeCode === "string" && /^[A-Z0-9]{5}$/.test(unsafeCode)
      ? unsafeCode
      : undefined,
    message: "Callback database operation failed.",
  };
}

export function getMetaOAuthCallbackServerRpcClient(): MetaOAuthCallbackRpcClient {
  if (callbackRpcClient) {
    return callbackRpcClient;
  }

  const sql = postgres(readCallbackDatabaseUrl(), {
    max: 1,
    prepare: false,
    connect_timeout: 5,
    idle_timeout: 20,
    max_lifetime: 60 * 10,
  });

  callbackRpcClient = {
    async consumeAuthorization(stateHash: string) {
      try {
        const data = await sql`
          select *
          from public.consume_yzi_imob_meta_authorization(${stateHash}::text)
        `;
        return { data, error: null };
      } catch (error) {
        return { data: null, error: toRpcError(error) };
      }
    },

    async recordAuthorizationFailure(input: MetaOAuthCallbackFailureInput) {
      try {
        await sql`
          select public.record_yzi_imob_meta_authorization_failure(
            ${input.authorizationId}::uuid,
            ${input.stateHash}::text,
            ${input.failureCode}::text,
            ${input.graphApiVersion}::text
          )
        `;
        return { error: null };
      } catch (error) {
        return { error: toRpcError(error) };
      }
    },

    async completeConnection(input: MetaOAuthCallbackCompleteInput) {
      try {
        await sql`
          select connection_id, connection_action, connection_status
          from public.complete_yzi_imob_meta_connection(
            ${input.authorizationId}::uuid,
            ${input.stateHash}::text,
            ${input.accessToken}::text,
            ${input.tokenType}::text,
            ${input.tokenExpiresAt}::timestamptz,
            ${input.graphApiVersion}::text,
            ${input.exchangedForLongLived}::boolean
          )
        `;
        return { error: null };
      } catch (error) {
        return { error: toRpcError(error) };
      }
    },
  };

  return callbackRpcClient;
}
