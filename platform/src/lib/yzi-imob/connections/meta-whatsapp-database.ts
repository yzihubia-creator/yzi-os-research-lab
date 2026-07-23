import postgres from "postgres";

const SUPABASE_POOLER_SUFFIX = ".pooler.supabase.com";

type ReadMetaWhatsappDatabaseUrlInput = {
  expectedRole: string;
  unavailableMessage: string;
};

type IdentityRow = { current_user_name: string; session_user_name: string };

function isSupabaseSharedPooler(hostname: string): boolean {
  return hostname.endsWith(SUPABASE_POOLER_SUFFIX) && hostname.startsWith("aws-");
}

function readProjectRefSuffix(connectionString: string | undefined): string | null {
  const trimmed = connectionString?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const username = decodeURIComponent(url.username);
    const parts = username.split(".");
    return parts.length >= 2 ? parts.slice(1).join(".") : null;
  } catch {
    return null;
  }
}

function alignSupabasePoolerProjectRef(url: URL): void {
  if (!isSupabaseSharedPooler(url.hostname)) {
    return;
  }

  const inboundProjectRef = readProjectRefSuffix(
    process.env.YZI_IMOB_INBOUND_OPERATIONS_DATABASE_URL,
  );
  if (!inboundProjectRef) {
    return;
  }

  const username = decodeURIComponent(url.username);
  const [rolePrefix] = username.split(".", 1);
  if (!rolePrefix) {
    return;
  }

  url.username = `${rolePrefix}.${inboundProjectRef}`;
}

export function readMetaWhatsappDatabaseUrl(input: ReadMetaWhatsappDatabaseUrlInput): string {
  const connectionString = process.env.META_WHATSAPP_DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error(input.unavailableMessage);
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error(input.unavailableMessage);
  }

  alignSupabasePoolerProjectRef(url);

  const loginRole = decodeURIComponent(url.username).split(".", 1)[0];
  const sslMode = url.searchParams.get("sslmode");
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    loginRole !== input.expectedRole ||
    !url.password ||
    !url.hostname ||
    (process.env.NODE_ENV === "production" && sslMode !== "require")
  ) {
    throw new Error(input.unavailableMessage);
  }

  return url.toString();
}

export async function verifyExpectedRuntimeIdentity(
  sql: ReturnType<typeof postgres>,
  expectedRole: string,
  unavailableMessage: string,
): Promise<void> {
  let rows: IdentityRow[];
  try {
    rows = await sql<IdentityRow[]>`
      select current_user as current_user_name, session_user as session_user_name
    `;
  } catch {
    throw new Error(unavailableMessage);
  }

  const row = rows[0];
  if (!row || row.current_user_name !== expectedRole || row.session_user_name !== expectedRole) {
    throw new Error(unavailableMessage);
  }
}
