-- YZI IMOB - Meta Ads read-only validation v1
--
-- Purpose:
-- - bind an existing Vault secret to one tenant Meta Ads read-only connection;
-- - expose the decrypted credential only to one dedicated server runtime role;
-- - validate and persist only the fixed ad account 219235883;
-- - never grant the runtime direct table, Vault, Auth, Storage, callback, or
--   service_role authority.

begin;

create schema if not exists yzi_meta_ads_private authorization postgres;

do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_roles
    where rolname = 'yzi_meta_ads_validation_executor'
  ) then
    create role yzi_meta_ads_validation_executor
      nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
  end if;

  if not exists (
    select 1 from pg_catalog.pg_roles
    where rolname = 'yzi_meta_ads_validation_runtime'
  ) then
    create role yzi_meta_ads_validation_runtime
      login password null inherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
  end if;
end;
$$;

alter role yzi_meta_ads_validation_runtime set search_path = pg_catalog;
alter role yzi_meta_ads_validation_runtime set statement_timeout = '20s';
alter role yzi_meta_ads_validation_runtime set lock_timeout = '5s';
alter role yzi_meta_ads_validation_runtime set idle_in_transaction_session_timeout = '5s';

grant yzi_meta_ads_validation_executor to yzi_meta_ads_validation_runtime;

revoke all on database postgres from
  yzi_meta_ads_validation_executor,
  yzi_meta_ads_validation_runtime;
grant connect on database postgres to yzi_meta_ads_validation_runtime;

revoke all on schema public, auth, storage, vault, yzi_meta_ads_private from
  yzi_meta_ads_validation_executor,
  yzi_meta_ads_validation_runtime;
revoke all on schema yzi_meta_ads_private from public, anon, authenticated, service_role,
  yzi_meta_oauth_callback_executor,
  yzi_meta_oauth_callback_runtime_a,
  yzi_meta_oauth_callback_runtime_b;
grant usage on schema yzi_meta_ads_private to yzi_meta_ads_validation_executor;

revoke all on all tables in schema public, auth, storage, vault from
  yzi_meta_ads_validation_executor,
  yzi_meta_ads_validation_runtime;
revoke all on all sequences in schema public, auth, storage, vault from
  yzi_meta_ads_validation_executor,
  yzi_meta_ads_validation_runtime;
revoke all on all functions in schema public, auth, storage from
  yzi_meta_ads_validation_executor,
  yzi_meta_ads_validation_runtime;

comment on role yzi_meta_ads_validation_executor is
  'NOLOGIN capability role: EXECUTE only on the four governed YZI IMOB Meta Ads read-only validation functions.';
comment on role yzi_meta_ads_validation_runtime is
  'LOGIN runtime dedicated exclusively to YZI IMOB Meta Ads read-only bootstrap and validation; credential provisioned out-of-band.';

alter table public.tenant_connections
  drop constraint if exists tenant_connections_status_check;
alter table public.tenant_connections
  add constraint tenant_connections_status_check
  check (status = any (array[
    'pending_validation',
    'awaiting_account_selection',
    'connected',
    'insufficient_permissions',
    'token_expiring',
    'reconnect_required',
    'provider_error',
    'paused',
    'revoked'
  ]::text[]));

create unique index if not exists tenant_connections_active_vault_secret_unique
  on public.tenant_connections (vault_secret_id)
  where vault_secret_id is not null and revoked_at is null;

alter table public.connection_audit_events
  drop constraint if exists connection_audit_events_event_check;
alter table public.connection_audit_events
  add constraint connection_audit_events_event_check
  check (event = any (array[
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
    'secret_rotated',
    'meta_ads_bootstrapped',
    'meta_ads_validation_started',
    'meta_ads_validation_succeeded',
    'meta_ads_validation_failed'
  ]::text[]));

create or replace function yzi_meta_ads_private.bootstrap_meta_ads_readonly_connection(
  p_tenant_id uuid,
  p_vault_secret_id uuid
)
returns table (
  connection_id uuid,
  connection_action text,
  connection_status text
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public', 'vault'
as $$
declare
  v_connection public.tenant_connections%rowtype;
  v_now timestamptz := now();
begin
  if session_user <> 'yzi_meta_ads_validation_runtime' then
    raise exception using errcode = '42501', message = 'meta_ads_validation_runtime_required';
  end if;

  if p_tenant_id is null or p_vault_secret_id is null then
    raise exception using errcode = '22023', message = 'invalid_bootstrap_reference';
  end if;

  if not exists (
    select 1 from public.tenants t
    where t.id = p_tenant_id and t.status = 'active'
  ) then
    raise exception using errcode = '42501', message = 'active_tenant_required';
  end if;

  if not exists (
    select 1 from vault.secrets s where s.id = p_vault_secret_id
  ) then
    raise exception using errcode = '22023', message = 'vault_secret_reference_not_found';
  end if;

  if exists (
    select 1
    from public.tenant_connections tc
    where (tc.vault_secret_id = p_vault_secret_id
      or tc.previous_vault_secret_id = p_vault_secret_id)
      and (
        tc.tenant_id <> p_tenant_id
        or tc.provider <> 'meta'
        or tc.catalog_id <> 'meta-ads'
        or tc.provider_metadata ->> 'credential_purpose' is distinct from 'meta_ads_readonly'
      )
  ) then
    raise exception using errcode = '23505', message = 'vault_secret_reference_already_bound';
  end if;

  select *
  into v_connection
  from public.tenant_connections tc
  where tc.tenant_id = p_tenant_id
    and tc.provider = 'meta'
    and tc.revoked_at is null
  for update;

  if found then
    if v_connection.catalog_id <> 'meta-ads'
      or v_connection.vault_secret_id is distinct from p_vault_secret_id
      or v_connection.provider_metadata ->> 'credential_purpose' is distinct from 'meta_ads_readonly'
    then
      raise exception using errcode = '23505', message = 'active_meta_connection_conflict';
    end if;

    if v_connection.status not in ('connected', 'token_expiring') then
      update public.tenant_connections tc
      set
        status = 'pending_validation',
        last_failure_at = null,
        last_failure_reason = null,
        updated_at = v_now
      where tc.id = v_connection.id;
      connection_status := 'pending_validation';
      connection_action := 'reset_pending_validation';
    else
      connection_status := v_connection.status;
      connection_action := 'unchanged';
    end if;

    connection_id := v_connection.id;
  else
    insert into public.tenant_connections (
      tenant_id,
      provider,
      catalog_id,
      status,
      granted_scopes,
      provider_metadata,
      vault_secret_id
    ) values (
      p_tenant_id,
      'meta',
      'meta-ads',
      'pending_validation',
      array[]::text[],
      jsonb_build_object(
        'credential_purpose', 'meta_ads_readonly',
        'expected_app_id', '1501572615104757',
        'expected_external_account_id', '219235883'
      ),
      p_vault_secret_id
    )
    returning id, status into connection_id, connection_status;
    connection_action := 'created';
  end if;

  insert into public.connection_audit_events (
    tenant_id,
    connection_id,
    event,
    actor_user_id,
    metadata
  ) values (
    p_tenant_id,
    connection_id,
    'meta_ads_bootstrapped',
    null,
    jsonb_build_object(
      'provider', 'meta',
      'kind', 'ad_account',
      'external_account_id', '219235883',
      'credential_purpose', 'meta_ads_readonly',
      'connection_action', connection_action,
      'connection_status', connection_status,
      'bootstrapped_at', v_now
    )
  );

  return next;
end;
$$;

create or replace function yzi_meta_ads_private.get_meta_ads_readonly_validation_context(
  p_connection_id uuid
)
returns table (
  connection_id uuid,
  tenant_id uuid,
  meta_ads_readonly_secret text
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public', 'vault'
as $$
declare
  v_connection public.tenant_connections%rowtype;
  v_meta_ads_readonly_secret text;
  v_now timestamptz := now();
begin
  if session_user <> 'yzi_meta_ads_validation_runtime' then
    raise exception using errcode = '42501', message = 'meta_ads_validation_runtime_required';
  end if;

  if p_connection_id is null then
    raise exception using errcode = '22023', message = 'invalid_connection_reference';
  end if;

  select *
  into v_connection
  from public.tenant_connections tc
  where tc.id = p_connection_id
    and tc.provider = 'meta'
    and tc.catalog_id = 'meta-ads'
    and tc.revoked_at is null
  for update;

  if not found
    or v_connection.provider_metadata ->> 'credential_purpose' is distinct from 'meta_ads_readonly'
    or v_connection.vault_secret_id is null
    or v_connection.status in ('paused', 'revoked')
  then
    raise exception using errcode = '42501', message = 'eligible_meta_ads_connection_required';
  end if;

  select ds.decrypted_secret
  into v_meta_ads_readonly_secret
  from vault.decrypted_secrets ds
  where ds.id = v_connection.vault_secret_id;

  if v_meta_ads_readonly_secret is null or length(v_meta_ads_readonly_secret) < 1 then
    raise exception using errcode = '55000', message = 'meta_ads_vault_secret_unavailable';
  end if;

  insert into public.connection_audit_events (
    tenant_id,
    connection_id,
    event,
    actor_user_id,
    metadata
  ) values (
    v_connection.tenant_id,
    v_connection.id,
    'meta_ads_validation_started',
    null,
    jsonb_build_object(
      'provider', 'meta',
      'kind', 'ad_account',
      'external_account_id', '219235883',
      'started_at', v_now
    )
  );

  connection_id := v_connection.id;
  tenant_id := v_connection.tenant_id;
  meta_ads_readonly_secret := v_meta_ads_readonly_secret;
  return next;
end;
$$;

create or replace function yzi_meta_ads_private.complete_meta_ads_readonly_validation(
  p_connection_id uuid,
  p_debug_token_valid boolean,
  p_debug_app_id text,
  p_granted_scopes text[],
  p_external_id text,
  p_external_account_id text,
  p_label text,
  p_account_status integer,
  p_currency text,
  p_timezone_name text
)
returns table (
  asset_id uuid,
  connection_status text,
  validated_at timestamptz
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_connection public.tenant_connections%rowtype;
  v_now timestamptz := now();
begin
  if session_user <> 'yzi_meta_ads_validation_runtime' then
    raise exception using errcode = '42501', message = 'meta_ads_validation_runtime_required';
  end if;

  if p_debug_token_valid is distinct from true
    or p_debug_app_id is distinct from '1501572615104757'
  then
    raise exception using errcode = '22023', message = 'debug_token_validation_failed';
  end if;

  if p_granted_scopes is null
    or not (array['ads_read', 'business_management']::text[] <@ p_granted_scopes)
    or not (p_granted_scopes <@ array['ads_read', 'business_management']::text[])
  then
    raise exception using errcode = '22023', message = 'required_meta_ads_scopes_missing';
  end if;

  if p_external_id is distinct from 'act_219235883'
    or p_external_account_id is distinct from '219235883'
    or p_account_status is distinct from 1
    or p_currency is distinct from 'BRL'
    or p_timezone_name is distinct from 'America/Sao_Paulo'
    or p_label is null
    or length(btrim(p_label)) not between 1 and 240
  then
    raise exception using errcode = '22023', message = 'meta_ads_account_validation_failed';
  end if;

  select *
  into v_connection
  from public.tenant_connections tc
  where tc.id = p_connection_id
    and tc.provider = 'meta'
    and tc.catalog_id = 'meta-ads'
    and tc.revoked_at is null
  for update;

  if not found
    or v_connection.provider_metadata ->> 'credential_purpose' is distinct from 'meta_ads_readonly'
    or v_connection.vault_secret_id is null
    or v_connection.status in ('paused', 'revoked')
  then
    raise exception using errcode = '42501', message = 'eligible_meta_ads_connection_required';
  end if;

  begin
    insert into public.tenant_connection_assets (
      tenant_id,
      connection_id,
      provider,
      kind,
      external_account_id,
      account_label,
      metadata
    ) values (
      v_connection.tenant_id,
      v_connection.id,
      'meta',
      'ad_account',
      '219235883',
      btrim(p_label),
      jsonb_build_object(
        'external_id', 'act_219235883',
        'status', 'active',
        'currency', 'BRL',
        'timezone_name', 'America/Sao_Paulo',
        'token_validated_at', v_now,
        'permissions_validated_at', v_now,
        'account_validated_at', v_now
      )
    )
    on conflict (connection_id, kind, external_account_id)
      where revoked_at is null
    do update set
      account_label = excluded.account_label,
      metadata = excluded.metadata,
      updated_at = v_now
    returning id into asset_id;
  exception
    when unique_violation then
      raise exception using errcode = '23505', message = 'meta_ads_asset_already_bound';
  end;

  update public.tenant_connections tc
  set
    status = 'connected',
    granted_scopes = array['ads_read', 'business_management']::text[],
    last_checked_at = v_now,
    last_sync_at = v_now,
    last_failure_at = null,
    last_failure_reason = null,
    provider_metadata = tc.provider_metadata || jsonb_build_object(
      'validated_external_account_id', '219235883',
      'validation_status', 'active',
      'validated_at', v_now
    ),
    updated_at = v_now
  where tc.id = v_connection.id;

  insert into public.connection_audit_events (
    tenant_id,
    connection_id,
    event,
    actor_user_id,
    metadata
  ) values (
    v_connection.tenant_id,
    v_connection.id,
    'meta_ads_validation_succeeded',
    null,
    jsonb_build_object(
      'provider', 'meta',
      'kind', 'ad_account',
      'external_account_id', '219235883',
      'external_id', 'act_219235883',
      'status', 'active',
      'currency', 'BRL',
      'timezone_name', 'America/Sao_Paulo',
      'validated_at', v_now
    )
  );

  connection_status := 'connected';
  validated_at := v_now;
  return next;
end;
$$;

create or replace function yzi_meta_ads_private.fail_meta_ads_readonly_validation(
  p_connection_id uuid,
  p_failure_code text
)
returns table (
  connection_status text,
  failure_code text,
  failed_at timestamptz
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_connection public.tenant_connections%rowtype;
  v_status text;
  v_now timestamptz := now();
begin
  if session_user <> 'yzi_meta_ads_validation_runtime' then
    raise exception using errcode = '42501', message = 'meta_ads_validation_runtime_required';
  end if;

  if p_failure_code is null or p_failure_code <> all (array[
    'token_invalid',
    'token_type_mismatch',
    'app_id_mismatch',
    'missing_ads_read',
    'missing_business_management',
    'account_id_mismatch',
    'account_inactive',
    'currency_mismatch',
    'timezone_mismatch',
    'provider_timeout',
    'provider_unavailable',
    'provider_response_invalid',
    'persistence_failed'
  ]::text[]) then
    raise exception using errcode = '22023', message = 'invalid_meta_ads_failure_code';
  end if;

  select *
  into v_connection
  from public.tenant_connections tc
  where tc.id = p_connection_id
    and tc.provider = 'meta'
    and tc.catalog_id = 'meta-ads'
    and tc.revoked_at is null
  for update;

  if not found
    or v_connection.provider_metadata ->> 'credential_purpose' is distinct from 'meta_ads_readonly'
  then
    raise exception using errcode = '42501', message = 'eligible_meta_ads_connection_required';
  end if;

  v_status := case
    when p_failure_code in ('token_invalid', 'token_type_mismatch', 'app_id_mismatch') then 'reconnect_required'
    when p_failure_code in ('missing_ads_read', 'missing_business_management') then 'insufficient_permissions'
    else 'provider_error'
  end;

  update public.tenant_connections tc
  set
    status = v_status,
    last_checked_at = v_now,
    last_failure_at = v_now,
    last_failure_reason = p_failure_code,
    updated_at = v_now
  where tc.id = v_connection.id;

  insert into public.connection_audit_events (
    tenant_id,
    connection_id,
    event,
    actor_user_id,
    metadata
  ) values (
    v_connection.tenant_id,
    v_connection.id,
    'meta_ads_validation_failed',
    null,
    jsonb_build_object(
      'provider', 'meta',
      'kind', 'ad_account',
      'external_account_id', '219235883',
      'failure_code', p_failure_code,
      'connection_status', v_status,
      'failed_at', v_now
    )
  );

  connection_status := v_status;
  failure_code := p_failure_code;
  failed_at := v_now;
  return next;
end;
$$;

alter function yzi_meta_ads_private.bootstrap_meta_ads_readonly_connection(uuid, uuid) owner to postgres;
alter function yzi_meta_ads_private.get_meta_ads_readonly_validation_context(uuid) owner to postgres;
alter function yzi_meta_ads_private.complete_meta_ads_readonly_validation(
  uuid, boolean, text, text[], text, text, text, integer, text, text
) owner to postgres;
alter function yzi_meta_ads_private.fail_meta_ads_readonly_validation(uuid, text) owner to postgres;

revoke all on function yzi_meta_ads_private.bootstrap_meta_ads_readonly_connection(uuid, uuid)
  from public, anon, authenticated, service_role,
    yzi_meta_oauth_callback_executor,
    yzi_meta_oauth_callback_runtime_a,
    yzi_meta_oauth_callback_runtime_b,
    yzi_meta_ads_validation_executor,
    yzi_meta_ads_validation_runtime;
revoke all on function yzi_meta_ads_private.get_meta_ads_readonly_validation_context(uuid)
  from public, anon, authenticated, service_role,
    yzi_meta_oauth_callback_executor,
    yzi_meta_oauth_callback_runtime_a,
    yzi_meta_oauth_callback_runtime_b,
    yzi_meta_ads_validation_executor,
    yzi_meta_ads_validation_runtime;
revoke all on function yzi_meta_ads_private.complete_meta_ads_readonly_validation(
  uuid, boolean, text, text[], text, text, text, integer, text, text
) from public, anon, authenticated, service_role,
    yzi_meta_oauth_callback_executor,
    yzi_meta_oauth_callback_runtime_a,
    yzi_meta_oauth_callback_runtime_b,
    yzi_meta_ads_validation_executor,
    yzi_meta_ads_validation_runtime;
revoke all on function yzi_meta_ads_private.fail_meta_ads_readonly_validation(uuid, text)
  from public, anon, authenticated, service_role,
    yzi_meta_oauth_callback_executor,
    yzi_meta_oauth_callback_runtime_a,
    yzi_meta_oauth_callback_runtime_b,
    yzi_meta_ads_validation_executor,
    yzi_meta_ads_validation_runtime;

grant execute on function yzi_meta_ads_private.bootstrap_meta_ads_readonly_connection(uuid, uuid)
  to yzi_meta_ads_validation_executor;
grant execute on function yzi_meta_ads_private.get_meta_ads_readonly_validation_context(uuid)
  to yzi_meta_ads_validation_executor;
grant execute on function yzi_meta_ads_private.complete_meta_ads_readonly_validation(
  uuid, boolean, text, text[], text, text, text, integer, text, text
) to yzi_meta_ads_validation_executor;
grant execute on function yzi_meta_ads_private.fail_meta_ads_readonly_validation(uuid, text)
  to yzi_meta_ads_validation_executor;

do $$
declare
  v_role name;
  v_role_oid oid;
begin
  if pg_has_role(
    'yzi_meta_ads_validation_runtime',
    'yzi_meta_oauth_callback_executor',
    'member'
  ) then
    raise exception using errcode = '42501', message = 'meta_ads_runtime_reuses_callback_role';
  end if;

  foreach v_role in array array[
    'yzi_meta_ads_validation_executor'::name,
    'yzi_meta_ads_validation_runtime'::name
  ] loop
    select r.oid into v_role_oid
    from pg_catalog.pg_roles r
    where r.rolname = v_role;

    if exists (
      select 1
      from pg_catalog.pg_roles r
      where r.rolname = v_role
        and (r.rolsuper or r.rolcreatedb or r.rolcreaterole or r.rolreplication or r.rolbypassrls)
    ) then
      raise exception using errcode = '42501', message = 'meta_ads_role_has_global_privilege';
    end if;

    if exists (
      select 1
      from pg_catalog.pg_namespace n
      cross join lateral aclexplode(coalesce(n.nspacl, acldefault('n', n.nspowner))) acl
      where n.nspname in ('public', 'auth', 'storage', 'vault')
        and acl.grantee = v_role_oid
        and acl.privilege_type = 'USAGE'
    ) then
      raise exception using errcode = '42501', message = 'meta_ads_role_has_protected_schema_usage';
    end if;

    if exists (
      select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      cross join lateral aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) acl
      where n.nspname in ('public', 'auth', 'storage', 'vault')
        and c.relkind in ('r', 'p', 'v', 'm', 'f')
        and acl.grantee = v_role_oid
        and acl.privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
    ) then
      raise exception using errcode = '42501', message = 'meta_ads_role_has_unexpected_table_privilege';
    end if;

    if exists (
      select 1
      from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) acl
      where n.nspname in ('public', 'auth', 'storage', 'vault', 'yzi_meta_ads_private')
        and acl.grantee = v_role_oid
        and acl.privilege_type = 'EXECUTE'
        and p.oid not in (
          to_regprocedure('yzi_meta_ads_private.bootstrap_meta_ads_readonly_connection(uuid,uuid)'),
          to_regprocedure('yzi_meta_ads_private.get_meta_ads_readonly_validation_context(uuid)'),
          to_regprocedure('yzi_meta_ads_private.complete_meta_ads_readonly_validation(uuid,boolean,text,text[],text,text,text,integer,text,text)'),
          to_regprocedure('yzi_meta_ads_private.fail_meta_ads_readonly_validation(uuid,text)')
        )
    ) then
      raise exception using errcode = '42501', message = 'meta_ads_role_has_unexpected_function_privilege';
    end if;
  end loop;
end;
$$;

comment on function yzi_meta_ads_private.bootstrap_meta_ads_readonly_connection(uuid, uuid) is
  'Idempotently binds one existing Vault secret reference to one tenant Meta Ads read-only connection in pending_validation. Never accepts or returns the secret value.';
comment on function yzi_meta_ads_private.get_meta_ads_readonly_validation_context(uuid) is
  'Returns the current Meta Ads read-only credential only to the dedicated server runtime for immediate provider validation; never callable through Data API or callback roles.';
comment on function yzi_meta_ads_private.complete_meta_ads_readonly_validation(
  uuid, boolean, text, text[], text, text, text, integer, text, text
) is
  'Atomically validates fixed allowlisted Meta Ads facts, upserts ad account 219235883, updates the connection, and writes sanitized audit metadata.';
comment on function yzi_meta_ads_private.fail_meta_ads_readonly_validation(uuid, text) is
  'Persists only an allowlisted Meta Ads validation failure code and normalized connection status.';

commit;
