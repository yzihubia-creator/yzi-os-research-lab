begin;

-- Durable persistence for the already-committed generic YZI IMOB MCP runtime.
-- Authorization material is never stored here: only opaque Vault references.

do $roles$
begin
  if not exists (
    select 1 from pg_catalog.pg_roles where rolname = 'yzi_imob_mcp_executor'
  ) then
    create role yzi_imob_mcp_executor
      nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
  end if;
  if not exists (
    select 1 from pg_catalog.pg_roles where rolname = 'yzi_imob_mcp_runtime'
  ) then
    create role yzi_imob_mcp_runtime
      login password null inherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
  end if;
end;
$roles$;

alter role yzi_imob_mcp_runtime set search_path = pg_catalog;
alter role yzi_imob_mcp_runtime set statement_timeout = '20s';
alter role yzi_imob_mcp_runtime set lock_timeout = '5s';
alter role yzi_imob_mcp_runtime set idle_in_transaction_session_timeout = '5s';
grant yzi_imob_mcp_executor to yzi_imob_mcp_runtime;
revoke all on database postgres from yzi_imob_mcp_executor, yzi_imob_mcp_runtime;
grant connect on database postgres to yzi_imob_mcp_runtime;

create schema if not exists yzi_imob_mcp_private authorization postgres;
revoke all on schema yzi_imob_mcp_private
  from public, anon, authenticated, service_role,
    yzi_imob_mcp_executor, yzi_imob_mcp_runtime;
grant usage on schema yzi_imob_mcp_private to yzi_imob_mcp_executor;

create function yzi_imob_mcp_private.is_safe_metadata(p_value jsonb)
returns boolean
language sql
immutable
security invoker
set search_path = pg_catalog
as $function$
  select
    jsonb_typeof(p_value) = 'object'
    and pg_column_size(p_value) <= 65536
    and p_value::text !~* '"(access_token|refresh_token|authorization|authorization_code|cookie|client_secret|password|credential|headers|raw_payload|signed_url)"[[:space:]]*:'
$function$;

revoke all on function yzi_imob_mcp_private.is_safe_metadata(jsonb) from public;

create table yzi_imob_mcp_private.connections (
  id uuid primary key,
  owner_scope text not null,
  owner_id text not null,
  owner_tenant_id uuid null references public.tenants(id) on delete restrict,
  connection_kind text not null,
  display_name text not null,
  endpoint_key text not null,
  auth_state text not null,
  connection_state text not null,
  health_state text not null,
  granted_scopes text[] not null default '{}',
  capability_snapshot text[] not null default '{}',
  capability_snapshot_version integer not null default 0,
  authorization_reference text null,
  expires_at timestamptz null,
  last_connected_at timestamptz null,
  last_discovered_at timestamptz null,
  last_health_check_at timestamptz null,
  revoked_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint yzi_imob_mcp_connections_owner_scope_check
    check (owner_scope in ('platform','tenant','operation')),
  constraint yzi_imob_mcp_connections_owner_check
    check (
      length(btrim(owner_id)) between 1 and 160
      and (
        (owner_scope = 'tenant' and owner_tenant_id is not null and owner_id = owner_tenant_id::text)
        or (owner_scope <> 'tenant' and owner_tenant_id is null)
      )
    ),
  constraint yzi_imob_mcp_connections_kind_check
    check (connection_kind in ('metricool','higgsfield') and endpoint_key = connection_kind),
  constraint yzi_imob_mcp_connections_display_check
    check (length(btrim(display_name)) between 1 and 120),
  constraint yzi_imob_mcp_connections_auth_check
    check (auth_state in ('not_authorized','pending','authorized','expired','revoked','refresh_failed')),
  constraint yzi_imob_mcp_connections_state_check
    check (connection_state in ('not_connected','awaiting_authorization','connecting','ready','needs_attention','unavailable','revoked')),
  constraint yzi_imob_mcp_connections_health_check
    check (health_state in ('unknown','healthy','degraded','unavailable')),
  constraint yzi_imob_mcp_connections_snapshot_check
    check (
      capability_snapshot_version >= 0
      and cardinality(granted_scopes) <= 32
      and cardinality(capability_snapshot) <= 32
      and array_position(granted_scopes, null) is null
      and array_position(capability_snapshot, null) is null
    ),
  constraint yzi_imob_mcp_connections_reference_check
    check (
      authorization_reference is null
      or authorization_reference ~ '^vault://ref/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    ),
  constraint yzi_imob_mcp_connections_authorized_reference_check
    check (auth_state <> 'authorized' or authorization_reference is not null),
  constraint yzi_imob_mcp_connections_time_check
    check (
      updated_at >= created_at
      and (revoked_at is null or revoked_at >= created_at)
    )
);

create index yzi_imob_mcp_connections_owner_idx
  on yzi_imob_mcp_private.connections(owner_scope, owner_id, connection_kind);
create index yzi_imob_mcp_connections_health_idx
  on yzi_imob_mcp_private.connections(connection_state, health_state, updated_at);

create table yzi_imob_mcp_private.connection_events (
  id uuid primary key,
  connection_id uuid not null references yzi_imob_mcp_private.connections(id) on delete restrict,
  event_type text not null,
  status text not null,
  safe_metadata jsonb not null default '{}',
  occurred_at timestamptz not null,
  constraint yzi_imob_mcp_connection_events_type_check
    check (event_type ~ '^[a-z0-9_]{1,80}$'),
  constraint yzi_imob_mcp_connection_events_status_check
    check (status in ('ok','blocked','error')),
  constraint yzi_imob_mcp_connection_events_metadata_check
    check (yzi_imob_mcp_private.is_safe_metadata(safe_metadata))
);
create index yzi_imob_mcp_connection_events_connection_idx
  on yzi_imob_mcp_private.connection_events(connection_id, occurred_at, id);

create table yzi_imob_mcp_private.authorization_attempts (
  id uuid primary key,
  connection_id uuid not null references yzi_imob_mcp_private.connections(id) on delete restrict,
  state_hash text not null,
  verifier_reference text not null,
  callback_url text not null,
  status text not null,
  created_at timestamptz not null,
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  constraint yzi_imob_mcp_authorization_attempts_hash_check
    check (state_hash ~ '^[a-f0-9]{64}$'),
  constraint yzi_imob_mcp_authorization_attempts_reference_check
    check (verifier_reference ~ '^vault://ref/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  constraint yzi_imob_mcp_authorization_attempts_callback_check
    check (callback_url ~ '^https://[^[:space:]]{1,1900}$'),
  constraint yzi_imob_mcp_authorization_attempts_status_check
    check (status in ('pending','consumed','expired','failed')),
  constraint yzi_imob_mcp_authorization_attempts_time_check
    check (
      expires_at > created_at
      and (consumed_at is null or consumed_at >= created_at)
      and (status <> 'consumed' or consumed_at is not null)
    )
);
create unique index yzi_imob_mcp_authorization_attempts_state_idx
  on yzi_imob_mcp_private.authorization_attempts(state_hash);
create index yzi_imob_mcp_authorization_attempts_connection_idx
  on yzi_imob_mcp_private.authorization_attempts(connection_id, created_at desc);

create table yzi_imob_mcp_private.tool_snapshots (
  id uuid primary key,
  connection_id uuid not null references yzi_imob_mcp_private.connections(id) on delete restrict,
  snapshot_version integer not null,
  tool_name text not null,
  tool_description text not null,
  input_schema_hash text not null,
  output_schema_hash text null,
  capability_key text null,
  discovered_at timestamptz not null,
  active boolean not null default true,
  constraint yzi_imob_mcp_tool_snapshots_version_check check (snapshot_version >= 1),
  constraint yzi_imob_mcp_tool_snapshots_name_check
    check (length(tool_name) between 1 and 200 and length(tool_description) <= 2000),
  constraint yzi_imob_mcp_tool_snapshots_hash_check
    check (
      input_schema_hash ~ '^[a-f0-9]{64}$'
      and (output_schema_hash is null or output_schema_hash ~ '^[a-f0-9]{64}$')
    ),
  unique(connection_id, snapshot_version, tool_name)
);
create unique index yzi_imob_mcp_tool_snapshots_active_idx
  on yzi_imob_mcp_private.tool_snapshots(connection_id, tool_name)
  where active;

create table yzi_imob_mcp_private.bindings (
  id uuid primary key,
  connection_id uuid not null references yzi_imob_mcp_private.connections(id) on delete restrict,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  capability_key text not null,
  status text not null,
  priority integer not null,
  monthly_limit numeric(14,4) null,
  approval_policy text not null,
  valid_from timestamptz not null,
  valid_until timestamptz null,
  constraint yzi_imob_mcp_bindings_status_check check (status in ('active','disabled')),
  constraint yzi_imob_mcp_bindings_priority_check check (priority between 0 and 10000),
  constraint yzi_imob_mcp_bindings_limit_check check (monthly_limit is null or monthly_limit >= 0),
  constraint yzi_imob_mcp_bindings_approval_check check (approval_policy in ('never','writes','always')),
  constraint yzi_imob_mcp_bindings_time_check check (valid_until is null or valid_until > valid_from),
  unique(tenant_id, connection_id, capability_key)
);
create index yzi_imob_mcp_bindings_resolution_idx
  on yzi_imob_mcp_private.bindings(tenant_id, capability_key, status, priority desc, valid_from);

create table yzi_imob_mcp_private.execution_requests (
  id uuid primary key,
  connection_id uuid not null references yzi_imob_mcp_private.connections(id) on delete restrict,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  operation text not null,
  capability_key text not null,
  approval_state text not null,
  estimated_cost numeric(14,4) null,
  idempotency_key text not null,
  status text not null,
  created_at timestamptz not null,
  completed_at timestamptz null,
  safe_result jsonb null,
  constraint yzi_imob_mcp_execution_requests_operation_check
    check (operation ~ '^[a-z0-9_]{1,100}$'),
  constraint yzi_imob_mcp_execution_requests_approval_check
    check (approval_state in ('not_required','pending','approved','rejected')),
  constraint yzi_imob_mcp_execution_requests_cost_check
    check (estimated_cost is null or estimated_cost >= 0),
  constraint yzi_imob_mcp_execution_requests_key_check
    check (idempotency_key = btrim(idempotency_key) and length(idempotency_key) between 1 and 200),
  constraint yzi_imob_mcp_execution_requests_status_check
    check (status in ('pending','running','completed','blocked','failed','cancelled')),
  constraint yzi_imob_mcp_execution_requests_result_check
    check (safe_result is null or yzi_imob_mcp_private.is_safe_metadata(safe_result)),
  constraint yzi_imob_mcp_execution_requests_time_check
    check (
      (completed_at is null or completed_at >= created_at)
      and (status not in ('completed','blocked','failed','cancelled') or completed_at is not null)
    ),
  unique(tenant_id, idempotency_key)
);
create index yzi_imob_mcp_execution_requests_cost_idx
  on yzi_imob_mcp_private.execution_requests(
    tenant_id, connection_id, capability_key, created_at
  ) where status = 'completed';

create table yzi_imob_mcp_private.execution_events (
  id uuid primary key,
  request_id uuid not null references yzi_imob_mcp_private.execution_requests(id) on delete restrict,
  connection_id uuid not null references yzi_imob_mcp_private.connections(id) on delete restrict,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  event_type text not null,
  status text not null,
  safe_metadata jsonb not null default '{}',
  occurred_at timestamptz not null,
  constraint yzi_imob_mcp_execution_events_type_check
    check (event_type ~ '^[a-z0-9_]{1,80}$'),
  constraint yzi_imob_mcp_execution_events_status_check
    check (status in ('ok','blocked','error')),
  constraint yzi_imob_mcp_execution_events_metadata_check
    check (yzi_imob_mcp_private.is_safe_metadata(safe_metadata))
);
create index yzi_imob_mcp_execution_events_request_idx
  on yzi_imob_mcp_private.execution_events(request_id, occurred_at, id);

create function yzi_imob_mcp_private.guard_append_only()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $function$
begin
  raise exception using errcode='55000', message='mcp_events_are_append_only';
end;
$function$;
create trigger yzi_imob_mcp_connection_events_append_only
before update or delete on yzi_imob_mcp_private.connection_events
for each row execute function yzi_imob_mcp_private.guard_append_only();
create trigger yzi_imob_mcp_execution_events_append_only
before update or delete on yzi_imob_mcp_private.execution_events
for each row execute function yzi_imob_mcp_private.guard_append_only();

create function yzi_imob_mcp_private.audit_binding_change()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, yzi_imob_mcp_private
as $function$
begin
  if tg_op = 'UPDATE' and old is not distinct from new then
    return new;
  end if;
  insert into yzi_imob_mcp_private.connection_events(
    id, connection_id, event_type, status, safe_metadata, occurred_at
  ) values (
    gen_random_uuid(), new.connection_id, 'binding_changed', 'ok',
    jsonb_build_object(
      'bindingId', new.id,
      'tenantId', new.tenant_id,
      'capabilityKey', new.capability_key,
      'status', new.status,
      'priority', new.priority,
      'changeType', lower(tg_op)
    ),
    now()
  );
  return new;
end;
$function$;
create trigger yzi_imob_mcp_bindings_audit
after insert or update on yzi_imob_mcp_private.bindings
for each row execute function yzi_imob_mcp_private.audit_binding_change();

create function yzi_imob_mcp_private.put_secret(p_kind text, p_value jsonb)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, vault
as $function$
declare
  v_id uuid;
begin
  if session_user <> 'yzi_imob_mcp_runtime' then
    raise exception using errcode='42501', message='mcp_runtime_required';
  end if;
  if p_kind not in ('pkce_verifier','authorization')
    or jsonb_typeof(p_value) <> 'object'
    or pg_column_size(p_value) > 32768
  then
    raise exception using errcode='22023', message='invalid_mcp_secret';
  end if;
  select vault.create_secret(
    p_value::text,
    null,
    'yzi-imob-mcp/' || p_kind
  ) into v_id;
  return v_id;
end;
$function$;

create function yzi_imob_mcp_private.get_secret(p_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, vault
as $function$
  select case
    when session_user <> 'yzi_imob_mcp_runtime' then
      null
    else (
      select ds.decrypted_secret::jsonb
      from vault.decrypted_secrets ds
      where ds.id = p_id and ds.description like 'yzi-imob-mcp/%'
    )
  end
$function$;

create function yzi_imob_mcp_private.update_secret(p_id uuid, p_value jsonb)
returns void
language plpgsql
security definer
set search_path = pg_catalog, vault
as $function$
begin
  if session_user <> 'yzi_imob_mcp_runtime' then
    raise exception using errcode='42501', message='mcp_runtime_required';
  end if;
  if jsonb_typeof(p_value) <> 'object' or pg_column_size(p_value) > 32768
    or not exists (
      select 1 from vault.secrets s
      where s.id=p_id and s.description like 'yzi-imob-mcp/%'
    )
  then
    raise exception using errcode='22023', message='invalid_mcp_secret';
  end if;
  perform vault.update_secret(p_id, p_value::text);
end;
$function$;

create function yzi_imob_mcp_private.delete_secret(p_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, vault
as $function$
begin
  if session_user <> 'yzi_imob_mcp_runtime' then
    raise exception using errcode='42501', message='mcp_runtime_required';
  end if;
  delete from vault.secrets
  where id=p_id and description like 'yzi-imob-mcp/%';
end;
$function$;

alter table yzi_imob_mcp_private.connections enable row level security;
alter table yzi_imob_mcp_private.connection_events enable row level security;
alter table yzi_imob_mcp_private.authorization_attempts enable row level security;
alter table yzi_imob_mcp_private.tool_snapshots enable row level security;
alter table yzi_imob_mcp_private.bindings enable row level security;
alter table yzi_imob_mcp_private.execution_requests enable row level security;
alter table yzi_imob_mcp_private.execution_events enable row level security;

create policy yzi_imob_mcp_connections_runtime on yzi_imob_mcp_private.connections
  for all to yzi_imob_mcp_executor using (true) with check (true);
create policy yzi_imob_mcp_connection_events_runtime on yzi_imob_mcp_private.connection_events
  for all to yzi_imob_mcp_executor using (true) with check (true);
create policy yzi_imob_mcp_authorization_attempts_runtime on yzi_imob_mcp_private.authorization_attempts
  for all to yzi_imob_mcp_executor using (true) with check (true);
create policy yzi_imob_mcp_tool_snapshots_runtime on yzi_imob_mcp_private.tool_snapshots
  for all to yzi_imob_mcp_executor using (true) with check (true);
create policy yzi_imob_mcp_bindings_runtime on yzi_imob_mcp_private.bindings
  for all to yzi_imob_mcp_executor using (true) with check (true);
create policy yzi_imob_mcp_execution_requests_runtime on yzi_imob_mcp_private.execution_requests
  for all to yzi_imob_mcp_executor using (true) with check (true);
create policy yzi_imob_mcp_execution_events_runtime on yzi_imob_mcp_private.execution_events
  for all to yzi_imob_mcp_executor using (true) with check (true);

revoke all on all tables in schema yzi_imob_mcp_private
  from public, anon, authenticated, service_role, yzi_imob_mcp_runtime;
grant select, insert, update, delete on
  yzi_imob_mcp_private.connections,
  yzi_imob_mcp_private.authorization_attempts,
  yzi_imob_mcp_private.tool_snapshots,
  yzi_imob_mcp_private.bindings,
  yzi_imob_mcp_private.execution_requests
to yzi_imob_mcp_executor;
grant select, insert on
  yzi_imob_mcp_private.connection_events,
  yzi_imob_mcp_private.execution_events
to yzi_imob_mcp_executor;

revoke all on function yzi_imob_mcp_private.guard_append_only() from public;
revoke all on function yzi_imob_mcp_private.audit_binding_change() from public;
revoke all on function yzi_imob_mcp_private.put_secret(text,jsonb)
  from public, anon, authenticated, service_role, yzi_imob_mcp_executor, yzi_imob_mcp_runtime;
revoke all on function yzi_imob_mcp_private.get_secret(uuid)
  from public, anon, authenticated, service_role, yzi_imob_mcp_executor, yzi_imob_mcp_runtime;
revoke all on function yzi_imob_mcp_private.update_secret(uuid,jsonb)
  from public, anon, authenticated, service_role, yzi_imob_mcp_executor, yzi_imob_mcp_runtime;
revoke all on function yzi_imob_mcp_private.delete_secret(uuid)
  from public, anon, authenticated, service_role, yzi_imob_mcp_executor, yzi_imob_mcp_runtime;
grant execute on function yzi_imob_mcp_private.put_secret(text,jsonb) to yzi_imob_mcp_executor;
grant execute on function yzi_imob_mcp_private.get_secret(uuid) to yzi_imob_mcp_executor;
grant execute on function yzi_imob_mcp_private.update_secret(uuid,jsonb) to yzi_imob_mcp_executor;
grant execute on function yzi_imob_mcp_private.delete_secret(uuid) to yzi_imob_mcp_executor;

comment on schema yzi_imob_mcp_private is
  'Server-only durable state for governed YZI IMOB MCP connections. No provider authorization material is stored in ordinary columns.';

commit;
