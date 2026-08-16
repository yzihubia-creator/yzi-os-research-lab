import "server-only";

import postgres from "postgres";

import type {
  JsonObject,
  McpAuthorizationAttempt,
  McpCapabilityKey,
  McpConnection,
  McpConnectionBinding,
  McpConnectionEvent,
  McpExecutionEvent,
  McpExecutionRequest,
  McpRepository,
  McpSecretVault,
  McpToolSnapshot,
} from "./types.ts";

const MCP_RUNTIME_ROLE = "yzi_imob_mcp_runtime";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VAULT_REF_RE = new RegExp("^vault://ref/(" + UUID_RE.source.slice(1, -1) + ")$", "i");
type Sql = ReturnType<typeof postgres>;
type Row = Record<string, unknown>;
type DbParameter = string | number | null | string[];

let runtimeSql: Sql | null = null;
let identityVerified = false;

export class PostgresMcpRepository implements McpRepository {
  async createConnection(value: McpConnection): Promise<void> {
    const sql = await getSql();
    await sql.unsafe(
      "insert into yzi_imob_mcp_private.connections " +
        "(id,owner_scope,owner_id,owner_tenant_id,connection_kind,display_name,endpoint_key," +
        "auth_state,connection_state,health_state,granted_scopes,capability_snapshot," +
        "capability_snapshot_version,authorization_reference,expires_at,last_connected_at," +
        "last_discovered_at,last_health_check_at,revoked_at,created_at,updated_at) " +
        "values($1::uuid,$2,$3,$4::uuid,$5,$6,$7,$8,$9,$10,$11::text[],$12::text[],$13," +
        "$14,$15::timestamptz,$16::timestamptz,$17::timestamptz,$18::timestamptz," +
        "$19::timestamptz,$20::timestamptz,$21::timestamptz)",
      connectionParams(value),
    );
  }

  async updateConnection(
    id: string,
    patch: Partial<Omit<McpConnection, "id" | "createdAt">>,
  ): Promise<McpConnection> {
    const current = await this.getConnection(id);
    if (!current) throw new Error("connection_not_found");
    const value = { ...current, ...patch, id, createdAt: current.createdAt };
    const sql = await getSql();
    const rows = await sql.unsafe<Row[]>(
      "update yzi_imob_mcp_private.connections set " +
        "owner_scope=$2,owner_id=$3,owner_tenant_id=$4::uuid,connection_kind=$5," +
        "display_name=$6,endpoint_key=$7,auth_state=$8,connection_state=$9,health_state=$10," +
        "granted_scopes=$11::text[],capability_snapshot=$12::text[]," +
        "capability_snapshot_version=$13,authorization_reference=$14,expires_at=$15::timestamptz," +
        "last_connected_at=$16::timestamptz,last_discovered_at=$17::timestamptz," +
        "last_health_check_at=$18::timestamptz,revoked_at=$19::timestamptz," +
        "created_at=$20::timestamptz,updated_at=$21::timestamptz " +
        "where id=$1::uuid returning *",
      connectionParams(value),
    );
    return required(mapConnection(rows[0]), "connection_not_found");
  }

  async getConnection(id: string): Promise<McpConnection | null> {
    const rows = await (await getSql()).unsafe<Row[]>(
      "select * from yzi_imob_mcp_private.connections where id=$1::uuid",
      [id],
    );
    return mapConnection(rows[0]);
  }

  async listConnections(): Promise<readonly McpConnection[]> {
    const rows = await (await getSql()).unsafe<Row[]>(
      "select * from yzi_imob_mcp_private.connections order by created_at,id",
    );
    return rows.map(mapConnection).filter(isPresent);
  }

  async appendConnectionEvent(value: McpConnectionEvent): Promise<void> {
    await (await getSql()).unsafe(
      "insert into yzi_imob_mcp_private.connection_events " +
        "(id,connection_id,event_type,status,safe_metadata,occurred_at) " +
        "values($1::uuid,$2::uuid,$3,$4,$5::text::jsonb,$6::timestamptz)",
      [value.id, value.connectionId, value.eventType, value.status,
        JSON.stringify(value.safeMetadata), value.occurredAt],
    );
  }

  async listConnectionEvents(connectionId: string): Promise<readonly McpConnectionEvent[]> {
    const rows = await (await getSql()).unsafe<Row[]>(
      "select * from yzi_imob_mcp_private.connection_events " +
        "where connection_id=$1::uuid order by occurred_at,id",
      [connectionId],
    );
    return rows.map(mapConnectionEvent).filter(isPresent);
  }

  async saveAuthorizationAttempt(value: McpAuthorizationAttempt): Promise<void> {
    await (await getSql()).unsafe(
      "insert into yzi_imob_mcp_private.authorization_attempts " +
        "(id,connection_id,state_hash,verifier_reference,callback_url,status,created_at,expires_at,consumed_at) " +
        "values($1::uuid,$2::uuid,$3,$4,$5,$6,$7::timestamptz,$8::timestamptz,$9::timestamptz)",
      attemptParams(value),
    );
  }

  async claimAuthorizationAttempt(
    id: string,
    consumedAt: string,
  ): Promise<McpAuthorizationAttempt | null> {
    // UPDATE condicional em uma única instrução: o próprio Postgres serializa
    // as execuções concorrentes e apenas uma vê `status='pending'`.
    const rows = await (await getSql()).unsafe<Row[]>(
      "update yzi_imob_mcp_private.authorization_attempts " +
        "set status='consumed', consumed_at=$2::timestamptz " +
        "where id=$1::uuid and status='pending' returning *",
      [id, consumedAt],
    );
    return mapAttempt(rows[0]);
  }

  async getAuthorizationAttempt(id: string): Promise<McpAuthorizationAttempt | null> {
    const rows = await (await getSql()).unsafe<Row[]>(
      "select * from yzi_imob_mcp_private.authorization_attempts where id=$1::uuid",
      [id],
    );
    return mapAttempt(rows[0]);
  }

  async updateAuthorizationAttempt(
    id: string,
    patch: Partial<McpAuthorizationAttempt>,
  ): Promise<McpAuthorizationAttempt> {
    const current = await this.getAuthorizationAttempt(id);
    if (!current) throw new Error("authorization_attempt_not_found");
    const value = { ...current, ...patch, id };
    const rows = await (await getSql()).unsafe<Row[]>(
      "update yzi_imob_mcp_private.authorization_attempts set connection_id=$2::uuid," +
        "state_hash=$3,verifier_reference=$4,callback_url=$5,status=$6,created_at=$7::timestamptz," +
        "expires_at=$8::timestamptz,consumed_at=$9::timestamptz where id=$1::uuid returning *",
      attemptParams(value),
    );
    return required(mapAttempt(rows[0]), "authorization_attempt_not_found");
  }

  async replaceToolSnapshot(
    connectionId: string,
    version: number,
    snapshots: readonly McpToolSnapshot[],
  ): Promise<void> {
    const sql = await getSql();
    await sql.begin(async (tx) => {
      await tx.unsafe(
        "update yzi_imob_mcp_private.tool_snapshots set active=false " +
          "where connection_id=$1::uuid and active",
        [connectionId],
      );
      for (const value of snapshots) {
        await tx.unsafe(
          "insert into yzi_imob_mcp_private.tool_snapshots " +
            "(id,connection_id,snapshot_version,tool_name,tool_description,input_schema_hash," +
            "output_schema_hash,capability_key,discovered_at,active) " +
            "values($1::uuid,$2::uuid,$3,$4,$5,$6,$7,$8,$9::timestamptz,true)",
          [value.id, connectionId, version, value.toolName, value.toolDescription,
            value.inputSchemaHash, value.outputSchemaHash, value.capabilityKey, value.discoveredAt],
        );
      }
    });
  }

  async listToolSnapshots(connectionId: string): Promise<readonly McpToolSnapshot[]> {
    const rows = await (await getSql()).unsafe<Row[]>(
      "select * from yzi_imob_mcp_private.tool_snapshots " +
        "where connection_id=$1::uuid order by snapshot_version,tool_name",
      [connectionId],
    );
    return rows.map(mapSnapshot).filter(isPresent);
  }

  async saveBinding(value: McpConnectionBinding): Promise<void> {
    await (await getSql()).unsafe(
      "insert into yzi_imob_mcp_private.bindings " +
        "(id,connection_id,tenant_id,capability_key,status,priority,monthly_limit," +
        "approval_policy,valid_from,valid_until) " +
        "values($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7,$8,$9::timestamptz,$10::timestamptz) " +
        "on conflict(id) do update set connection_id=excluded.connection_id," +
        "tenant_id=excluded.tenant_id,capability_key=excluded.capability_key,status=excluded.status," +
        "priority=excluded.priority,monthly_limit=excluded.monthly_limit," +
        "approval_policy=excluded.approval_policy,valid_from=excluded.valid_from,valid_until=excluded.valid_until",
      [value.id, value.connectionId, value.tenantId, value.capabilityKey, value.status,
        value.priority, value.monthlyLimit, value.approvalPolicy, value.validFrom, value.validUntil],
    );
  }

  async listBindings(
    tenantId: string,
    capabilityKey: McpCapabilityKey,
  ): Promise<readonly McpConnectionBinding[]> {
    const rows = await (await getSql()).unsafe<Row[]>(
      "select * from yzi_imob_mcp_private.bindings " +
        "where tenant_id=$1::uuid and capability_key=$2 order by priority desc,valid_from,id",
      [tenantId, capabilityKey],
    );
    return rows.map(mapBinding).filter(isPresent);
  }

  async appendExecutionRequest(value: McpExecutionRequest): Promise<void> {
    await (await getSql()).unsafe(
      "insert into yzi_imob_mcp_private.execution_requests " +
        "(id,connection_id,tenant_id,operation,capability_key,approval_state,estimated_cost," +
        "idempotency_key,status,created_at,completed_at,safe_result) " +
        "values($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7,$8,$9,$10::timestamptz,$11::timestamptz,$12::text::jsonb)",
      requestParams(value),
    );
  }

  async updateExecutionRequest(
    id: string,
    patch: Partial<McpExecutionRequest>,
  ): Promise<McpExecutionRequest> {
    const current = await this.getExecutionRequest(id);
    if (!current) throw new Error("execution_request_not_found");
    const value = {
      ...current, ...patch, id,
      connectionId: current.connectionId,
      tenantId: current.tenantId,
      idempotencyKey: current.idempotencyKey,
    };
    const rows = await (await getSql()).unsafe<Row[]>(
      "update yzi_imob_mcp_private.execution_requests set operation=$4,capability_key=$5," +
        "approval_state=$6,estimated_cost=$7,status=$9,created_at=$10::timestamptz," +
        "completed_at=$11::timestamptz,safe_result=$12::text::jsonb where id=$1::uuid returning *",
      requestParams(value),
    );
    return required(mapRequest(rows[0]), "execution_request_not_found");
  }

  async findExecutionByIdempotency(
    tenantId: string,
    key: string,
  ): Promise<McpExecutionRequest | null> {
    const rows = await (await getSql()).unsafe<Row[]>(
      "select * from yzi_imob_mcp_private.execution_requests " +
        "where tenant_id=$1::uuid and idempotency_key=$2",
      [tenantId, key],
    );
    return mapRequest(rows[0]);
  }

  async appendExecutionEvent(value: McpExecutionEvent): Promise<void> {
    await (await getSql()).unsafe(
      "insert into yzi_imob_mcp_private.execution_events " +
        "(id,request_id,connection_id,tenant_id,event_type,status,safe_metadata,occurred_at) " +
        "values($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5,$6,$7::text::jsonb,$8::timestamptz)",
      [value.id, value.requestId, value.connectionId, value.tenantId, value.eventType,
        value.status, JSON.stringify(value.safeMetadata), value.occurredAt],
    );
  }

  async listExecutionEvents(requestId: string): Promise<readonly McpExecutionEvent[]> {
    const rows = await (await getSql()).unsafe<Row[]>(
      "select * from yzi_imob_mcp_private.execution_events " +
        "where request_id=$1::uuid order by occurred_at,id",
      [requestId],
    );
    return rows.map(mapExecutionEvent).filter(isPresent);
  }

  async sumMonthlyCost(
    tenantId: string,
    connectionId: string,
    capability: McpCapabilityKey,
    at: Date,
  ): Promise<number> {
    const start = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), 1));
    const end = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1));
    const rows = await (await getSql()).unsafe<{ total: string | number }[]>(
      "select coalesce(sum(estimated_cost),0) as total " +
        "from yzi_imob_mcp_private.execution_requests where tenant_id=$1::uuid " +
        "and connection_id=$2::uuid and capability_key=$3 and status='completed' " +
        "and created_at >= $4::timestamptz and created_at < $5::timestamptz",
      [tenantId, connectionId, capability, start.toISOString(), end.toISOString()],
    );
    return Number(rows[0]?.total ?? 0);
  }

  private async getExecutionRequest(id: string): Promise<McpExecutionRequest | null> {
    const rows = await (await getSql()).unsafe<Row[]>(
      "select * from yzi_imob_mcp_private.execution_requests where id=$1::uuid",
      [id],
    );
    return mapRequest(rows[0]);
  }
}

export class PostgresMcpSecretVault implements McpSecretVault {
  async put(kind: "pkce_verifier" | "authorization", value: JsonObject): Promise<string> {
    const rows = await (await getSql()).unsafe<{ id: string }[]>(
      "select yzi_imob_mcp_private.put_secret($1,$2::text::jsonb) as id",
      [kind, JSON.stringify(value)],
    );
    const id = rows[0]?.id;
    if (!id || !UUID_RE.test(id)) throw new Error("mcp_vault_write_failed");
    return "vault://ref/" + id;
  }

  async get(reference: string): Promise<JsonObject | null> {
    const id = parseRef(reference);
    if (!id) return null;
    const rows = await (await getSql()).unsafe<{ value: unknown }[]>(
      "select yzi_imob_mcp_private.get_secret($1::uuid) as value",
      [id],
    );
    return objectOrNull(rows[0]?.value);
  }

  async update(reference: string, value: JsonObject): Promise<void> {
    const id = parseRef(reference);
    if (!id) throw new Error("mcp_vault_reference_invalid");
    await (await getSql()).unsafe(
      "select yzi_imob_mcp_private.update_secret($1::uuid,$2::text::jsonb)",
      [id, JSON.stringify(value)],
    );
  }

  async delete(reference: string): Promise<void> {
    const id = parseRef(reference);
    if (!id) return;
    await (await getSql()).unsafe(
      "select yzi_imob_mcp_private.delete_secret($1::uuid)",
      [id],
    );
  }
}

export async function closeMcpProductionDatabase(): Promise<void> {
  const sql = runtimeSql;
  runtimeSql = null;
  identityVerified = false;
  if (sql) await sql.end({ timeout: 5 }).catch(() => {});
}

async function getSql(): Promise<Sql> {
  if (!runtimeSql) {
    runtimeSql = postgres(readDatabaseUrl(), {
      max: 3, prepare: false, connect_timeout: 5, idle_timeout: 20, max_lifetime: 600,
    });
  }
  if (!identityVerified) {
    const sql = runtimeSql;
    try {
      const rows = await sql.unsafe<{ current_user_name: string; session_user_name: string }[]>(
        "select current_user as current_user_name,session_user as session_user_name",
      );
      if (
        rows[0]?.current_user_name !== MCP_RUNTIME_ROLE ||
        rows[0]?.session_user_name !== MCP_RUNTIME_ROLE
      ) throw new Error("mcp_runtime_identity_invalid");
      identityVerified = true;
    } catch {
      runtimeSql = null;
      await sql.end({ timeout: 5 }).catch(() => {});
      throw new Error("mcp_runtime_configuration_unavailable");
    }
  }
  return runtimeSql;
}

function readDatabaseUrl(): string {
  const value = process.env.YZI_IMOB_MCP_DATABASE_URL?.trim();
  if (!value) throw new Error("mcp_runtime_configuration_unavailable");
  try {
    const url = new URL(value);
    const role = decodeURIComponent(url.username).split(".", 1)[0];
    if (
      !["postgres:", "postgresql:"].includes(url.protocol) ||
      role !== MCP_RUNTIME_ROLE || !url.password || !url.hostname ||
      (process.env.NODE_ENV === "production" && url.searchParams.get("sslmode") !== "require")
    ) throw new Error("invalid");
  } catch {
    throw new Error("mcp_runtime_configuration_unavailable");
  }
  return value;
}

function connectionParams(v: McpConnection): DbParameter[] {
  const ownerTenant = v.ownerScope === "tenant" && UUID_RE.test(v.ownerId) ? v.ownerId : null;
  if (v.ownerScope === "tenant" && !ownerTenant) throw new Error("mcp_owner_tenant_invalid");
  return [v.id,v.ownerScope,v.ownerId,ownerTenant,v.connectionKind,v.displayName,v.endpointKey,
    v.authState,v.connectionState,v.healthState,[...v.grantedScopes],[...v.capabilitySnapshot],
    v.capabilitySnapshotVersion,v.authorizationReference,v.expiresAt,v.lastConnectedAt,
    v.lastDiscoveredAt,v.lastHealthCheckAt,v.revokedAt,v.createdAt,v.updatedAt];
}

function attemptParams(v: McpAuthorizationAttempt): DbParameter[] {
  return [v.id,v.connectionId,v.stateHash,v.verifierReference,v.callbackUrl,v.status,
    v.createdAt,v.expiresAt,v.consumedAt];
}

function requestParams(v: McpExecutionRequest): DbParameter[] {
  return [v.id,v.connectionId,v.tenantId,v.operation,v.capabilityKey,v.approvalState,
    v.estimatedCost,v.idempotencyKey,v.status,v.createdAt,v.completedAt,
    v.safeResult ? JSON.stringify(v.safeResult) : null];
}

function mapConnection(r: Row | undefined): McpConnection | null {
  return r ? {
    id:String(r.id),ownerScope:r.owner_scope as McpConnection["ownerScope"],
    ownerId:String(r.owner_id),connectionKind:r.connection_kind as McpConnection["connectionKind"],
    displayName:String(r.display_name),endpointKey:r.endpoint_key as McpConnection["endpointKey"],
    authState:r.auth_state as McpConnection["authState"],
    connectionState:r.connection_state as McpConnection["connectionState"],
    healthState:r.health_state as McpConnection["healthState"],
    grantedScopes:stringArray(r.granted_scopes),
    capabilitySnapshot:stringArray(r.capability_snapshot) as McpCapabilityKey[],
    capabilitySnapshotVersion:num(r.capability_snapshot_version),
    authorizationReference:strNull(r.authorization_reference),expiresAt:dateNull(r.expires_at),
    lastConnectedAt:dateNull(r.last_connected_at),lastDiscoveredAt:dateNull(r.last_discovered_at),
    lastHealthCheckAt:dateNull(r.last_health_check_at),revokedAt:dateNull(r.revoked_at),
    createdAt:date(r.created_at),updatedAt:date(r.updated_at),
  } : null;
}

function mapConnectionEvent(r: Row | undefined): McpConnectionEvent | null {
  return r ? {id:String(r.id),connectionId:String(r.connection_id),eventType:String(r.event_type),
    status:r.status as McpConnectionEvent["status"],safeMetadata:objectOrNull(r.safe_metadata) ?? {},
    occurredAt:date(r.occurred_at)} : null;
}
function mapAttempt(r: Row | undefined): McpAuthorizationAttempt | null {
  return r ? {id:String(r.id),connectionId:String(r.connection_id),stateHash:String(r.state_hash),
    verifierReference:String(r.verifier_reference),callbackUrl:String(r.callback_url),
    status:r.status as McpAuthorizationAttempt["status"],createdAt:date(r.created_at),
    expiresAt:date(r.expires_at),consumedAt:dateNull(r.consumed_at)} : null;
}
function mapSnapshot(r: Row | undefined): McpToolSnapshot | null {
  return r ? {id:String(r.id),connectionId:String(r.connection_id),snapshotVersion:num(r.snapshot_version),
    toolName:String(r.tool_name),toolDescription:String(r.tool_description),
    inputSchemaHash:String(r.input_schema_hash),outputSchemaHash:strNull(r.output_schema_hash),
    capabilityKey:strNull(r.capability_key) as McpCapabilityKey | null,
    discoveredAt:date(r.discovered_at),active:r.active === true} : null;
}
function mapBinding(r: Row | undefined): McpConnectionBinding | null {
  return r ? {id:String(r.id),connectionId:String(r.connection_id),tenantId:String(r.tenant_id),
    capabilityKey:String(r.capability_key) as McpCapabilityKey,
    status:r.status as McpConnectionBinding["status"],priority:num(r.priority),
    monthlyLimit:r.monthly_limit === null ? null : Number(r.monthly_limit),
    approvalPolicy:r.approval_policy as McpConnectionBinding["approvalPolicy"],
    validFrom:date(r.valid_from),validUntil:dateNull(r.valid_until)} : null;
}
function mapRequest(r: Row | undefined): McpExecutionRequest | null {
  if (!r) return null;
  const safeResult=objectOrNull(r.safe_result);
  return {id:String(r.id),connectionId:String(r.connection_id),tenantId:String(r.tenant_id),
    operation:r.operation as McpExecutionRequest["operation"],
    capabilityKey:r.capability_key as McpCapabilityKey,
    approvalState:r.approval_state as McpExecutionRequest["approvalState"],
    estimatedCost:r.estimated_cost === null ? null : Number(r.estimated_cost),
    idempotencyKey:String(r.idempotency_key),status:r.status as McpExecutionRequest["status"],
    createdAt:date(r.created_at),completedAt:dateNull(r.completed_at),
    ...(safeResult ? {safeResult} : {})};
}
function mapExecutionEvent(r: Row | undefined): McpExecutionEvent | null {
  return r ? {id:String(r.id),requestId:String(r.request_id),connectionId:String(r.connection_id),
    tenantId:String(r.tenant_id),eventType:String(r.event_type),
    status:r.status as McpExecutionEvent["status"],safeMetadata:objectOrNull(r.safe_metadata) ?? {},
    occurredAt:date(r.occurred_at)} : null;
}

function parseRef(value: string): string | null { return VAULT_REF_RE.exec(value)?.[1] ?? null; }
function objectOrNull(v: unknown): JsonObject | null {
  return v && typeof v === "object" && !Array.isArray(v) ? v as JsonObject : null;
}
function stringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}
function strNull(v: unknown): string | null { return typeof v === "string" ? v : null; }
function num(v: unknown): number {
  const n=Number(v); if (!Number.isFinite(n)) throw new Error("mcp_persistence_number_invalid"); return n;
}
function date(v: unknown): string {
  const value=dateNull(v); if (!value) throw new Error("mcp_persistence_date_invalid"); return value;
}
function dateNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const n=v instanceof Date ? v.getTime() : Date.parse(String(v));
  return Number.isFinite(n) ? new Date(n).toISOString() : null;
}
function required<T>(value: T | null, code: string): T {
  if (!value) throw new Error(code); return value;
}
function isPresent<T>(value: T | null): value is T { return value !== null; }
