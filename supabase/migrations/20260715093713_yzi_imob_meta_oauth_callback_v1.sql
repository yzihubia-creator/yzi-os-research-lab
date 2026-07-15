-- YZI IMOB - Meta OAuth Callback v1
-- Supabase migration: 20260715093713_yzi_imob_meta_oauth_callback_v1
--
-- Adds the governed callback boundary for Meta OAuth:
-- - stores request_id on authorizations for callback/audit correlation;
-- - claims state_hash once with a processing lease only after server-side Meta code exchange succeeds;
-- - completes authorizations only after Vault and connection persistence;
-- - records sanitized callback/failure/completion audit events;
-- - writes Meta tokens only through Supabase Vault;
-- - creates or updates the single active tenant Meta connection.

begin;

-- The callback uses a PostgreSQL-wire credential instead of a Supabase API
-- secret. The NOLOGIN role owns only the RPC capability; the two LOGIN roles
-- enable blue/green password rotation without ever storing a password here.
do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_roles where rolname = 'yzi_meta_oauth_callback_executor'
  ) then
    create role yzi_meta_oauth_callback_executor
      nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
  end if;

  if not exists (
    select 1 from pg_catalog.pg_roles where rolname = 'yzi_meta_oauth_callback_runtime_a'
  ) then
    create role yzi_meta_oauth_callback_runtime_a
      login password null inherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
  end if;

  if not exists (
    select 1 from pg_catalog.pg_roles where rolname = 'yzi_meta_oauth_callback_runtime_b'
  ) then
    create role yzi_meta_oauth_callback_runtime_b
      login password null inherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
  end if;
end;
$$;

alter role yzi_meta_oauth_callback_executor
  nologin noinherit nocreatedb nocreaterole;
alter role yzi_meta_oauth_callback_runtime_a
  login inherit nocreatedb nocreaterole;
alter role yzi_meta_oauth_callback_runtime_b
  login inherit nocreatedb nocreaterole;

-- The migration executor may create least-privilege roles but is intentionally
-- not a superuser. Protected attributes are fixed at CREATE ROLE time above;
-- fail closed if the managed Postgres environment did not preserve them.
do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname in (
      'yzi_meta_oauth_callback_executor',
      'yzi_meta_oauth_callback_runtime_a',
      'yzi_meta_oauth_callback_runtime_b'
    )
      and (
        rolsuper
        or rolreplication
        or rolbypassrls
        or rolcreatedb
        or rolcreaterole
      )
  ) then
    raise exception using
      errcode = '42501',
      message = 'callback_role_has_protected_or_administrative_attribute';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'yzi_meta_oauth_callback_executor'
      and not rolcanlogin
      and not rolinherit
  ) then
    raise exception using
      errcode = '42501',
      message = 'callback_executor_role_attributes_invalid';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname in (
      'yzi_meta_oauth_callback_runtime_a',
      'yzi_meta_oauth_callback_runtime_b'
    )
      and (not rolcanlogin or not rolinherit)
  ) then
    raise exception using
      errcode = '42501',
      message = 'callback_runtime_role_attributes_invalid';
  end if;
end;
$$;

alter role yzi_meta_oauth_callback_runtime_a set search_path = pg_catalog;
alter role yzi_meta_oauth_callback_runtime_b set search_path = pg_catalog;
alter role yzi_meta_oauth_callback_runtime_a set statement_timeout = '15s';
alter role yzi_meta_oauth_callback_runtime_b set statement_timeout = '15s';
alter role yzi_meta_oauth_callback_runtime_a set lock_timeout = '5s';
alter role yzi_meta_oauth_callback_runtime_b set lock_timeout = '5s';
alter role yzi_meta_oauth_callback_runtime_a set idle_in_transaction_session_timeout = '5s';
alter role yzi_meta_oauth_callback_runtime_b set idle_in_transaction_session_timeout = '5s';

grant yzi_meta_oauth_callback_executor to
  yzi_meta_oauth_callback_runtime_a,
  yzi_meta_oauth_callback_runtime_b;

revoke all on database postgres from
  yzi_meta_oauth_callback_executor,
  yzi_meta_oauth_callback_runtime_a,
  yzi_meta_oauth_callback_runtime_b;
grant connect on database postgres to
  yzi_meta_oauth_callback_runtime_a,
  yzi_meta_oauth_callback_runtime_b;

revoke all on schema public, auth, storage, vault from
  yzi_meta_oauth_callback_executor,
  yzi_meta_oauth_callback_runtime_a,
  yzi_meta_oauth_callback_runtime_b;
grant usage on schema public to yzi_meta_oauth_callback_executor;

revoke all on all tables in schema public, auth, storage, vault from
  yzi_meta_oauth_callback_executor,
  yzi_meta_oauth_callback_runtime_a,
  yzi_meta_oauth_callback_runtime_b;
revoke all on all sequences in schema public, auth, storage, vault from
  yzi_meta_oauth_callback_executor,
  yzi_meta_oauth_callback_runtime_a,
  yzi_meta_oauth_callback_runtime_b;
-- Removed incompatible blanket: revoke all on all functions in schema public, auth, storage, vault from
-- Managed Vault functions are extension-owned. The migration executor cannot
-- alter their ACLs, and the callback roles have no USAGE on schema vault, so
-- those functions have no executable path. Revoke only in schemas whose
-- function ACLs are governed by this project migration.
revoke all on all functions in schema public, auth, storage from
  yzi_meta_oauth_callback_executor,
  yzi_meta_oauth_callback_runtime_a,
  yzi_meta_oauth_callback_runtime_b;

comment on role yzi_meta_oauth_callback_executor is
  'NOLOGIN capability role: EXECUTE only on the three governed Meta OAuth callback functions; no table, Vault, Auth, Storage, RLS-bypass, or administration privileges.';
comment on role yzi_meta_oauth_callback_runtime_a is
  'Password starts NULL. Provision and rotate only out-of-band; active/standby login for the Meta OAuth callback executor capability.';
comment on role yzi_meta_oauth_callback_runtime_b is
  'Password starts NULL. Provision and rotate only out-of-band; active/standby login for the Meta OAuth callback executor capability.';

alter table public.tenant_connections
  add column if not exists previous_vault_secret_id uuid null;

alter table public.tenant_connections
  add column if not exists previous_vault_secret_retire_after timestamptz null;

alter table public.tenant_connections
  drop constraint if exists tenant_connections_previous_vault_secret_retirement_check;

alter table public.tenant_connections
  add constraint tenant_connections_previous_vault_secret_retirement_check
  check (
    (previous_vault_secret_id is null and previous_vault_secret_retire_after is null)
    or (
      previous_vault_secret_id is not null
      and previous_vault_secret_retire_after is not null
    )
  );

comment on column public.tenant_connections.previous_vault_secret_id is
  'Server-only rollback reference for the immediately previous Vault secret. A future governed cleanup unit must delete it after validation and clear both retirement columns.';

comment on column public.tenant_connections.previous_vault_secret_retire_after is
  'Earliest governed cleanup time for the previous Vault secret. New rotations are blocked until cleanup clears the retirement contract.';

alter table public.connection_authorizations
  add column if not exists request_id text null;

alter table public.connection_authorizations
  add column if not exists status text not null default 'pending';

alter table public.connection_authorizations
  add column if not exists processing_started_at timestamptz null;

alter table public.connection_authorizations
  add column if not exists processing_lease_expires_at timestamptz null;

alter table public.connection_authorizations
  add column if not exists completed_at timestamptz null;

alter table public.connection_authorizations
  add column if not exists failed_at timestamptz null;

alter table public.connection_authorizations
  add column if not exists failure_code text null;

alter table public.connection_authorizations
  drop constraint if exists connection_authorizations_request_id_check;

alter table public.connection_authorizations
  add constraint connection_authorizations_request_id_check
  check (
    request_id is null
    or request_id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
  );

alter table public.connection_authorizations
  drop constraint if exists connection_authorizations_status_check;

alter table public.connection_authorizations
  add constraint connection_authorizations_status_check
  check (status = any (array[
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
  ]::text[]));

alter table public.connection_authorizations
  drop constraint if exists connection_authorizations_processing_check;

alter table public.connection_authorizations
  add constraint connection_authorizations_processing_check
  check (
    (
      status <> 'processing'
      and processing_started_at is null
      and processing_lease_expires_at is null
    )
    or (
      status = 'processing'
      and processing_started_at is not null
      and processing_lease_expires_at is not null
      and processing_lease_expires_at > processing_started_at
    )
  );

alter table public.connection_authorizations
  drop constraint if exists connection_authorizations_terminal_check;

alter table public.connection_authorizations
  add constraint connection_authorizations_terminal_check
  check (
    (
      status = 'completed'
      and consumed_at is not null
      and completed_at is not null
      and failed_at is null
      and failure_code is null
    )
    or (
      status = 'failed'
      and consumed_at is null
      and completed_at is null
      and failed_at is not null
      and failure_code is not null
    )
    or (
      status = 'cancelled'
      and consumed_at is null
      and completed_at is null
      and failed_at is not null
      and failure_code = 'provider_cancelled'
    )
    or (
      status in ('pending', 'processing')
      and consumed_at is null
      and completed_at is null
      and failed_at is null
      and failure_code is null
    )
  );

alter table public.connection_authorizations
  drop constraint if exists connection_authorizations_consumed_check;

alter table public.connection_authorizations
  add constraint connection_authorizations_consumed_check
  check (consumed_at is null or consumed_at >= created_at);

alter table public.connection_authorizations
  drop constraint if exists connection_authorizations_failure_code_check;

alter table public.connection_authorizations
  add constraint connection_authorizations_failure_code_check
  check (
    failure_code is null
    or failure_code = any (array[
      'provider_cancelled',
      'authorization_expired',
      'missing_code',
      'token_exchange_failed',
      'token_exchange_timeout',
      'token_response_invalid',
      'long_lived_exchange_failed',
      'vault_or_connection_failed',
      'processing_abandoned'
    ]::text[])
  );

create index if not exists connection_authorizations_processing_lease_idx
  on public.connection_authorizations (provider, status, processing_lease_expires_at)
  where status = 'processing';

alter table public.connection_audit_events
  drop constraint if exists connection_audit_events_event_check;

alter table public.connection_audit_events
  add constraint connection_audit_events_event_check
  check (
    event = any (array[
      'authorization_started',
      'authorization_callback_received',
      'authorization_completed',
      'authorization_cancelled',
      'authorization_failed',
      'assets_selected',
      'connection_created',
      'connection_updated',
      'connection_paused',
      'connection_revoked',
      'refresh_failed',
      'secret_rotated'
    ]::text[])
  );

create or replace function public.start_yzi_imob_meta_authorization(
  p_tenant_id uuid,
  p_catalog_id text,
  p_state_hash text,
  p_expires_at timestamptz,
  p_redirect_origin text,
  p_request_id text default null
)
returns table (
  authorization_id uuid,
  expires_at timestamptz
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public', 'auth'
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required.';
  end if;

  if p_catalog_id is null
    or not (p_catalog_id = any (array['instagram', 'facebook', 'meta-ads']::text[]))
  then
    raise exception using errcode = '22023', message = 'Unsupported Meta connection catalog_id.';
  end if;

  if p_state_hash is null or p_state_hash !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = '22023', message = 'Invalid OAuth state hash.';
  end if;

  if p_expires_at is null
    or p_expires_at <= now()
    or p_expires_at > now() + interval '15 minutes'
  then
    raise exception using errcode = '22023', message = 'Invalid OAuth state expiration.';
  end if;

  if p_redirect_origin is null
    or length(p_redirect_origin) > 255
    or p_redirect_origin !~ '^https?://[^/?#]+$'
  then
    raise exception using errcode = '22023', message = 'Invalid redirect origin.';
  end if;

  if p_request_id is not null
    and p_request_id !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
  then
    raise exception using errcode = '22023', message = 'Invalid request id.';
  end if;

  if not exists (
    select 1
    from public.tenant_memberships tm
    join public.tenants t on t.id = tm.tenant_id
    where tm.tenant_id = p_tenant_id
      and tm.user_id = v_user_id
      and tm.status = 'active'
      and tm.role = any (array['owner', 'admin']::text[])
      and t.status = 'active'
  ) then
    raise exception using errcode = '42501', message = 'Active owner or admin membership required.';
  end if;

  insert into public.connection_authorizations (
    tenant_id,
    user_id,
    provider,
    catalog_id,
    state_hash,
    expires_at,
    request_id,
    status
  )
  values (
    p_tenant_id,
    v_user_id,
    'meta',
    p_catalog_id,
    p_state_hash,
    p_expires_at,
    p_request_id,
    'pending'
  )
  returning id, connection_authorizations.expires_at
  into authorization_id, expires_at;

  insert into public.connection_audit_events (
    tenant_id,
    connection_id,
    event,
    actor_user_id,
    metadata
  )
  values (
    p_tenant_id,
    null,
    'authorization_started',
    v_user_id,
    jsonb_strip_nulls(jsonb_build_object(
      'catalog_id', p_catalog_id,
      'provider', 'meta',
      'redirect_origin', p_redirect_origin,
      'expires_at', p_expires_at,
      'request_id', p_request_id
    ))
  );

  return next;
end;
$$;

comment on function public.start_yzi_imob_meta_authorization(
  uuid,
  text,
  text,
  timestamptz,
  text,
  text
) is
  'Governed Meta OAuth start. Requires explicit tenant_id, active owner/admin membership in an active tenant, stores only state_hash plus request_id, and audits authorization_started with sanitized metadata. catalog_id is the requested Meta catalog entry point, not a separate provider identity.';

create or replace function public.consume_yzi_imob_meta_authorization(
  p_state_hash text
)
returns table (
  claim_status text,
  authorization_id uuid,
  tenant_id uuid,
  user_id uuid,
  catalog_id text,
  request_id text,
  expires_at timestamptz,
  processing_lease_expires_at timestamptz
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public', 'auth'
as $$
declare
  v_authorization public.connection_authorizations%rowtype;
  v_claimed_at timestamptz := now();
  v_lease_expires_at timestamptz := v_claimed_at + interval '2 minutes';
begin
  if session_user not in (
    'yzi_meta_oauth_callback_runtime_a',
    'yzi_meta_oauth_callback_runtime_b'
  ) then
    raise exception using errcode = '42501', message = 'callback_executor_required';
  end if;

  if p_state_hash is null or p_state_hash !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = '22023', message = 'invalid_state';
  end if;

  select *
  into v_authorization
  from public.connection_authorizations ca
  where ca.provider = 'meta'
    and ca.state_hash = p_state_hash
  for update;

  if not found then
    claim_status := 'invalid_state';
    return next;
    return;
  end if;

  if v_authorization.status = 'processing'
    and v_authorization.processing_lease_expires_at <= v_claimed_at
  then
    update public.connection_authorizations ca
    set
      status = 'failed',
      processing_started_at = null,
      processing_lease_expires_at = null,
      failed_at = v_claimed_at,
      failure_code = 'processing_abandoned'
    where ca.id = v_authorization.id
      and ca.provider = 'meta'
      and ca.state_hash = p_state_hash;

    insert into public.connection_audit_events (
      tenant_id,
      connection_id,
      event,
      actor_user_id,
      metadata
    )
    values (
      v_authorization.tenant_id,
      null,
      'authorization_failed',
      v_authorization.user_id,
      jsonb_build_object(
        'provider', 'meta',
        'catalog_id', v_authorization.catalog_id,
        'request_id', v_authorization.request_id,
        'authorization_id', v_authorization.id,
        'failure_code', 'processing_abandoned',
        'failed_at', v_claimed_at
      )
    );

    claim_status := 'processing_abandoned';
    return next;
    return;
  end if;

  if v_authorization.status <> 'pending' then
    claim_status := 'not_pending';
    return next;
    return;
  end if;

  if v_authorization.expires_at <= v_claimed_at then
    update public.connection_authorizations ca
    set
      status = 'failed',
      failed_at = v_claimed_at,
      failure_code = 'authorization_expired'
    where ca.id = v_authorization.id
      and ca.provider = 'meta'
      and ca.state_hash = p_state_hash
      and ca.status = 'pending';

    insert into public.connection_audit_events (
      tenant_id,
      connection_id,
      event,
      actor_user_id,
      metadata
    )
    values (
      v_authorization.tenant_id,
      null,
      'authorization_failed',
      v_authorization.user_id,
      jsonb_build_object(
        'provider', 'meta',
        'catalog_id', v_authorization.catalog_id,
        'request_id', v_authorization.request_id,
        'authorization_id', v_authorization.id,
        'failure_code', 'authorization_expired',
        'failed_at', v_claimed_at
      )
    );

    claim_status := 'expired';
    return next;
    return;
  end if;

  if not exists (
    select 1
    from public.tenant_memberships tm
    join public.tenants t on t.id = tm.tenant_id
    where tm.tenant_id = v_authorization.tenant_id
      and tm.user_id = v_authorization.user_id
      and tm.status = 'active'
      and tm.role = any (array['owner', 'admin']::text[])
      and t.status = 'active'
  ) then
    raise exception using errcode = '42501', message = 'authorization_not_allowed';
  end if;

  update public.connection_authorizations ca
  set
    status = 'processing',
    processing_started_at = v_claimed_at,
    processing_lease_expires_at = v_lease_expires_at
  where ca.id = v_authorization.id
    and ca.provider = 'meta'
    and ca.state_hash = p_state_hash
    and ca.status = 'pending'
    and ca.expires_at > v_claimed_at
  returning
    ca.id,
    ca.tenant_id,
    ca.user_id,
    ca.catalog_id,
    coalesce(ca.request_id, ca.id::text),
    ca.expires_at,
    ca.processing_lease_expires_at
  into
    authorization_id,
    tenant_id,
    user_id,
    catalog_id,
    request_id,
    expires_at,
    processing_lease_expires_at;

  if authorization_id is null then
    claim_status := 'not_pending';
    return next;
    return;
  end if;

  claim_status := 'claimed';

  insert into public.connection_audit_events (
    tenant_id,
    connection_id,
    event,
    actor_user_id,
    metadata
  )
  values (
    tenant_id,
    null,
    'authorization_callback_received',
    user_id,
    jsonb_build_object(
      'provider', 'meta',
      'catalog_id', catalog_id,
      'request_id', request_id,
      'authorization_id', authorization_id,
      'expires_at', expires_at,
      'processing_lease_expires_at', processing_lease_expires_at,
      'received_at', v_claimed_at
    )
  );

  return next;
end;
$$;

comment on function public.consume_yzi_imob_meta_authorization(text) is
  'Claims a Meta OAuth authorization by state_hash exactly once, moving pending to processing with a short lease. Expired pending or processing authorizations are persisted as failed and returned as a closed claim_status without raising, so terminal transitions are not rolled back. It does not set consumed_at; consumed_at is set only by complete_yzi_imob_meta_connection after Vault and connection persistence.';

create or replace function public.record_yzi_imob_meta_authorization_failure(
  p_authorization_id uuid,
  p_state_hash text,
  p_failure_code text,
  p_graph_api_version text default null
)
returns void
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public', 'auth'
as $$
declare
  v_authorization public.connection_authorizations%rowtype;
  v_failed_at timestamptz := now();
  v_status text;
  v_event text;
begin
  if session_user not in (
    'yzi_meta_oauth_callback_runtime_a',
    'yzi_meta_oauth_callback_runtime_b'
  ) then
    raise exception using errcode = '42501', message = 'callback_executor_required';
  end if;

  if p_authorization_id is null then
    raise exception using errcode = '22023', message = 'Invalid authorization id.';
  end if;

  if p_state_hash is null or p_state_hash !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = '22023', message = 'Invalid OAuth state hash.';
  end if;

  if p_failure_code is null
    or not (
      p_failure_code = any (array[
        'provider_cancelled',
        'authorization_expired',
        'missing_code',
        'token_exchange_failed',
        'token_exchange_timeout',
        'token_response_invalid',
        'long_lived_exchange_failed',
        'vault_or_connection_failed',
        'processing_abandoned'
      ]::text[])
    )
  then
    raise exception using errcode = '22023', message = 'Invalid failure code.';
  end if;

  if p_graph_api_version is not null and p_graph_api_version !~ '^v[0-9]+[.][0-9]+$' then
    raise exception using errcode = '22023', message = 'Invalid Graph API version.';
  end if;

  select *
  into v_authorization
  from public.connection_authorizations ca
  where ca.id = p_authorization_id
    and ca.provider = 'meta'
    and ca.state_hash = p_state_hash
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'Invalid authorization.';
  end if;

  if v_authorization.status <> 'processing' then
    raise exception using errcode = '42501', message = 'Authorization is not processing.';
  end if;

  v_status := case
    when p_failure_code = 'provider_cancelled' then 'cancelled'
    else 'failed'
  end;
  v_event := case
    when p_failure_code = 'provider_cancelled' then 'authorization_cancelled'
    else 'authorization_failed'
  end;

  update public.connection_authorizations ca
  set
    status = v_status,
    processing_started_at = null,
    processing_lease_expires_at = null,
    failed_at = v_failed_at,
    failure_code = p_failure_code
  where ca.id = v_authorization.id
    and ca.provider = 'meta'
    and ca.state_hash = p_state_hash
    and ca.status = 'processing';

  insert into public.connection_audit_events (
    tenant_id,
    connection_id,
    event,
    actor_user_id,
    metadata
  )
  values (
    v_authorization.tenant_id,
    null,
    v_event,
    v_authorization.user_id,
    jsonb_strip_nulls(jsonb_build_object(
      'provider', 'meta',
      'catalog_id', v_authorization.catalog_id,
      'request_id', v_authorization.request_id,
      'authorization_id', v_authorization.id,
      'failure_code', p_failure_code,
      'graph_api_version', p_graph_api_version,
      'failed_at', v_failed_at
    ))
  );
end;
$$;

comment on function public.record_yzi_imob_meta_authorization_failure(
  uuid,
  text,
  text,
  text
) is
  'Records a sanitized terminal Meta OAuth callback failure after processing claim. Does not accept provider, tenant_id, user_id, event name, metadata, code, token, or raw provider payload.';

create or replace function public.complete_yzi_imob_meta_connection(
  p_authorization_id uuid,
  p_state_hash text,
  p_access_token text,
  p_token_type text default null,
  p_token_expires_at timestamptz default null,
  p_graph_api_version text default null,
  p_exchanged_for_long_lived boolean default false
)
returns table (
  connection_id uuid,
  connection_action text,
  connection_status text
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public', 'auth', 'vault'
as $$
declare
  v_authorization public.connection_authorizations%rowtype;
  v_connection public.tenant_connections%rowtype;
  v_has_connection boolean := false;
  v_new_secret_id uuid;
  v_old_secret_id uuid;
  v_persisted_secret_id uuid;
  v_action text;
  v_now timestamptz := now();
  v_secret_name text;
  v_secret_description text := 'YZI IMOB Meta connection access token';
begin
  if session_user not in (
    'yzi_meta_oauth_callback_runtime_a',
    'yzi_meta_oauth_callback_runtime_b'
  ) then
    raise exception using errcode = '42501', message = 'callback_executor_required';
  end if;

  if p_authorization_id is null then
    raise exception using errcode = '22023', message = 'Invalid authorization id.';
  end if;

  if p_state_hash is null or p_state_hash !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = '22023', message = 'Invalid OAuth state hash.';
  end if;

  if p_access_token is null or length(btrim(p_access_token)) < 1 then
    raise exception using errcode = '22023', message = 'Invalid access token.';
  end if;

  if p_token_type is not null and length(p_token_type) > 64 then
    raise exception using errcode = '22023', message = 'Invalid token type.';
  end if;

  if p_token_expires_at is not null and p_token_expires_at <= v_now then
    raise exception using errcode = '22023', message = 'Invalid token expiration.';
  end if;

  if p_graph_api_version is not null and p_graph_api_version !~ '^v[0-9]+[.][0-9]+$' then
    raise exception using errcode = '22023', message = 'Invalid Graph API version.';
  end if;

  select *
  into v_authorization
  from public.connection_authorizations ca
  where ca.id = p_authorization_id
    and ca.provider = 'meta'
    and ca.state_hash = p_state_hash
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'Invalid authorization.';
  end if;

  if v_authorization.status <> 'processing' then
    raise exception using errcode = '42501', message = 'Authorization is not processing.';
  end if;

  if v_authorization.processing_lease_expires_at <= v_now then
    raise exception using errcode = '55000', message = 'Authorization processing lease expired.';
  end if;

  if not exists (
    select 1
    from public.tenant_memberships tm
    join public.tenants t on t.id = tm.tenant_id
    where tm.tenant_id = v_authorization.tenant_id
      and tm.user_id = v_authorization.user_id
      and tm.status = 'active'
      and tm.role = any (array['owner', 'admin']::text[])
      and t.status = 'active'
  ) then
    raise exception using errcode = '42501', message = 'Authorization is no longer allowed.';
  end if;

  select *
  into v_connection
  from public.tenant_connections tc
  where tc.tenant_id = v_authorization.tenant_id
    and tc.provider = 'meta'
    and tc.revoked_at is null
  for update;

  v_has_connection := found;
  v_old_secret_id := case when v_has_connection then v_connection.vault_secret_id else null end;

  if v_has_connection and v_connection.previous_vault_secret_id is not null then
    raise exception using
      errcode = '55000',
      message = 'Previous Vault secret retirement is pending.';
  end if;

  v_secret_name := format(
    'yzi-imob-meta-%s-%s',
    v_authorization.tenant_id::text,
    v_authorization.id::text
  );

  v_new_secret_id := vault.create_secret(
    p_access_token,
    v_secret_name,
    v_secret_description,
    null
  );

  begin
    if v_has_connection then
      update public.tenant_connections tc
      set
        catalog_id = v_authorization.catalog_id,
        status = 'connected',
        granted_scopes = array[]::text[],
        connected_by = v_authorization.user_id,
        connected_at = v_now,
        expires_at = p_token_expires_at,
        last_checked_at = null,
        last_failure_at = null,
        last_failure_reason = null,
        revoked_at = null,
        provider_metadata = jsonb_strip_nulls(jsonb_build_object(
          'source_catalog_id', v_authorization.catalog_id,
          'graph_api_version', p_graph_api_version,
          'token_type', p_token_type,
          'exchanged_for_long_lived', p_exchanged_for_long_lived,
          'previous_secret_retained', v_old_secret_id is not null,
          'previous_secret_retire_after', case
            when v_old_secret_id is not null then v_now + interval '24 hours'
            else null
          end
        )),
        vault_secret_id = v_new_secret_id,
        previous_vault_secret_id = v_old_secret_id,
        previous_vault_secret_retire_after = case
          when v_old_secret_id is not null then v_now + interval '24 hours'
          else null
        end,
        updated_at = v_now
      where tc.id = v_connection.id
        and tc.tenant_id = v_authorization.tenant_id
        and tc.provider = 'meta'
      returning tc.id, tc.vault_secret_id
      into connection_id, v_persisted_secret_id;

      v_action := 'updated';
    else
      insert into public.tenant_connections (
        tenant_id,
        provider,
        catalog_id,
        status,
        granted_scopes,
        connected_by,
        connected_at,
        expires_at,
        provider_metadata,
        vault_secret_id
      )
      values (
        v_authorization.tenant_id,
        'meta',
        v_authorization.catalog_id,
        'connected',
        array[]::text[],
        v_authorization.user_id,
        v_now,
        p_token_expires_at,
        jsonb_strip_nulls(jsonb_build_object(
          'source_catalog_id', v_authorization.catalog_id,
          'graph_api_version', p_graph_api_version,
          'token_type', p_token_type,
          'exchanged_for_long_lived', p_exchanged_for_long_lived
        )),
        v_new_secret_id
      )
      returning id, tenant_connections.vault_secret_id
      into connection_id, v_persisted_secret_id;

      v_action := 'created';
    end if;

    if connection_id is null or v_persisted_secret_id <> v_new_secret_id then
      raise exception using errcode = '55000', message = 'Connection persistence failed.';
    end if;

    update public.connection_authorizations ca
    set
      status = 'completed',
      processing_started_at = null,
      processing_lease_expires_at = null,
      consumed_at = v_now,
      completed_at = v_now
    where ca.id = v_authorization.id
      and ca.provider = 'meta'
      and ca.state_hash = p_state_hash
      and ca.status = 'processing';

    insert into public.connection_audit_events (
      tenant_id,
      connection_id,
      event,
      actor_user_id,
      metadata
    )
    values (
      v_authorization.tenant_id,
      connection_id,
      'authorization_completed',
      v_authorization.user_id,
      jsonb_strip_nulls(jsonb_build_object(
        'provider', 'meta',
        'catalog_id', v_authorization.catalog_id,
        'request_id', v_authorization.request_id,
        'authorization_id', v_authorization.id,
        'graph_api_version', p_graph_api_version,
        'completed_at', v_now
      ))
    );

    insert into public.connection_audit_events (
      tenant_id,
      connection_id,
      event,
      actor_user_id,
      metadata
    )
    values (
      v_authorization.tenant_id,
      connection_id,
      case when v_action = 'created' then 'connection_created' else 'connection_updated' end,
      v_authorization.user_id,
      jsonb_strip_nulls(jsonb_build_object(
        'provider', 'meta',
        'catalog_id', v_authorization.catalog_id,
        'request_id', v_authorization.request_id,
        'authorization_id', v_authorization.id,
        'connection_action', v_action,
        'graph_api_version', p_graph_api_version,
        'connected_at', v_now
      ))
    );

    if v_action = 'updated' then
      insert into public.connection_audit_events (
        tenant_id,
        connection_id,
        event,
        actor_user_id,
        metadata
      )
      values (
        v_authorization.tenant_id,
        connection_id,
        'secret_rotated',
        v_authorization.user_id,
        jsonb_strip_nulls(jsonb_build_object(
          'provider', 'meta',
          'catalog_id', v_authorization.catalog_id,
          'request_id', v_authorization.request_id,
          'authorization_id', v_authorization.id,
          'rotation_strategy', 'create_then_swap_reference_temporary_retention',
          'previous_secret_retire_after', v_now + interval '24 hours',
          'cleanup_contract', 'governed_health_check_then_delete_and_clear_reference',
          'rotated_at', v_now
        ))
      );
    end if;
  exception
    when others then
      delete from vault.secrets s
      where s.id = v_new_secret_id
        and s.name = v_secret_name;
      raise;
  end;

  connection_action := v_action;
  connection_status := 'completed';
  return next;
end;
$$;

comment on function public.complete_yzi_imob_meta_connection(
  uuid,
  text,
  text,
  text,
  timestamptz,
  text,
  boolean
) is
  'Completes Meta OAuth callback after a processing claim. The Meta access token is the only secret input and is written only to Vault. The function creates a new secret, swaps the tenant-scoped connection reference, retains the immediately previous secret under an explicit 24-hour governed-cleanup contract, blocks another rotation until cleanup clears that contract, compensates failed new-secret persistence, and sets consumed_at only after success. It does not accept tenant_id, user_id, provider, catalog_id, connection_id, event name, free-form metadata, authorization code, or vault_secret_id, and it never returns a Vault secret identifier.';

alter function public.consume_yzi_imob_meta_authorization(text) owner to postgres;
alter function public.record_yzi_imob_meta_authorization_failure(uuid, text, text, text)
  owner to postgres;
alter function public.complete_yzi_imob_meta_connection(
  uuid,
  text,
  text,
  text,
  timestamptz,
  text,
  boolean
) owner to postgres;

revoke all on function public.start_yzi_imob_meta_authorization(
  uuid,
  text,
  text,
  timestamptz,
  text,
  text
) from public, anon, authenticated, service_role,
  yzi_meta_oauth_callback_executor,
  yzi_meta_oauth_callback_runtime_a,
  yzi_meta_oauth_callback_runtime_b;

grant execute on function public.start_yzi_imob_meta_authorization(
  uuid,
  text,
  text,
  timestamptz,
  text,
  text
) to authenticated;

revoke all on function public.consume_yzi_imob_meta_authorization(text)
  from public, anon, authenticated, service_role,
    yzi_meta_oauth_callback_executor,
    yzi_meta_oauth_callback_runtime_a,
    yzi_meta_oauth_callback_runtime_b;
grant execute on function public.consume_yzi_imob_meta_authorization(text)
  to yzi_meta_oauth_callback_executor;

revoke all on function public.record_yzi_imob_meta_authorization_failure(uuid, text, text, text)
  from public, anon, authenticated, service_role,
    yzi_meta_oauth_callback_executor,
    yzi_meta_oauth_callback_runtime_a,
    yzi_meta_oauth_callback_runtime_b;
grant execute on function public.record_yzi_imob_meta_authorization_failure(uuid, text, text, text)
  to yzi_meta_oauth_callback_executor;

revoke all on function public.complete_yzi_imob_meta_connection(
  uuid,
  text,
  text,
  text,
  timestamptz,
  text,
  boolean
) from public, anon, authenticated, service_role,
  yzi_meta_oauth_callback_executor,
  yzi_meta_oauth_callback_runtime_a,
  yzi_meta_oauth_callback_runtime_b;
grant execute on function public.complete_yzi_imob_meta_connection(
  uuid,
  text,
  text,
  text,
  timestamptz,
  text,
  boolean
) to yzi_meta_oauth_callback_executor;

-- PostgreSQL privileges inherited from PUBLIC are additive and cannot be
-- negated for a single role. Fail the migration closed if the live project has
-- any PUBLIC/table grant or other application-schema function that would enlarge this
-- credential beyond the three allowlisted callback functions.
do $$
declare
  v_runtime_role name;
begin
  foreach v_runtime_role in array array[
    'yzi_meta_oauth_callback_executor'::name,
    'yzi_meta_oauth_callback_runtime_a'::name,
    'yzi_meta_oauth_callback_runtime_b'::name
  ]
  loop
    if exists (
      select 1
      from pg_catalog.pg_namespace n
      where n.nspname in ('auth', 'storage', 'vault')
        and has_schema_privilege(v_runtime_role, n.oid, 'USAGE')
    ) then
      raise exception using
        errcode = '42501',
        message = 'callback_role_has_protected_schema_usage';
    end if;

    if exists (
      select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname in ('public', 'auth', 'storage', 'vault')
        and c.relkind in ('r', 'p', 'v', 'm', 'f')
        and (
          has_table_privilege(v_runtime_role, c.oid, 'SELECT')
          or has_table_privilege(v_runtime_role, c.oid, 'INSERT')
          or has_table_privilege(v_runtime_role, c.oid, 'UPDATE')
          or has_table_privilege(v_runtime_role, c.oid, 'DELETE')
          or has_table_privilege(v_runtime_role, c.oid, 'TRUNCATE')
        )
    ) then
      raise exception using
        errcode = '42501',
        message = 'callback_role_has_unexpected_table_privilege';
    end if;

    if exists (
      select 1
      from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      where n.nspname in ('auth', 'storage', 'vault')
        and has_schema_privilege(v_runtime_role, n.oid, 'USAGE')
        and has_function_privilege(v_runtime_role, p.oid, 'EXECUTE')
    ) then
      raise exception using
        errcode = '42501',
        message = 'callback_role_has_protected_function_execution_path';
    end if;

    if exists (
      select 1
      from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      where n.nspname in ('public', 'auth', 'storage', 'vault')
        and has_schema_privilege(v_runtime_role, n.oid, 'USAGE')
        and has_function_privilege(v_runtime_role, p.oid, 'EXECUTE')
        and p.oid not in (
          to_regprocedure('public.consume_yzi_imob_meta_authorization(text)'),
          to_regprocedure('public.record_yzi_imob_meta_authorization_failure(uuid,text,text,text)'),
          to_regprocedure('public.complete_yzi_imob_meta_connection(uuid,text,text,text,timestamptz,text,boolean)')
        )
    ) then
      raise exception using
        errcode = '42501',
        message = 'callback_role_has_unexpected_function_privilege';
    end if;
  end loop;
end;
$$;

commit;
