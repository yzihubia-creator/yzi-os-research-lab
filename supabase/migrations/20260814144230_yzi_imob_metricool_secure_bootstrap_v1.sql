begin;

-- Metricool credential bootstrap is intentionally split into four contracts:
-- configure credential -> discover accounts -> bind account -> request validation.
-- No provider request is executed by this migration and no secret is returned.

alter table public.tenant_connections
  drop constraint tenant_connections_status_check;

alter table public.tenant_connections
  add constraint tenant_connections_status_check
  check (
    status = any (array[
      'pending_validation', 'awaiting_account_selection', 'connected',
      'insufficient_permissions', 'token_expiring', 'reconnect_required',
      'provider_error', 'paused', 'revoked', 'not_configured',
      'configuration_required', 'authorization_required', 'configuring',
      'account_selection_required', 'validating', 'active',
      'attention_required', 'token_invalid', 'plan_insufficient',
      'rate_limited', 'disconnected', 'failed', 'error'
    ]::text[])
  );

alter table public.connection_audit_events
  drop constraint connection_audit_events_event_check;

alter table public.connection_audit_events
  add constraint connection_audit_events_event_check
  check (event = any (array[
    'authorization_started', 'authorization_callback_received',
    'authorization_completed', 'authorization_cancelled',
    'authorization_failed', 'assets_selected', 'connection_created',
    'connection_updated', 'connection_paused', 'connection_revoked',
    'refresh_failed', 'secret_rotated', 'meta_ads_bootstrapped',
    'meta_ads_validation_started', 'meta_ads_validation_succeeded',
    'meta_ads_validation_failed', 'metricool_connection_validated',
    'metricool_connection_failed', 'metricool_connection_disconnected',
    'metricool_configuration_requested', 'metricool_credential_configured',
    'metricool_account_discovery_started',
    'metricool_account_discovery_completed', 'metricool_account_bound',
    'metricool_validation_requested'
  ]::text[]));

create table yzi_imob_metricool_private.account_candidates (
  connection_id uuid not null,
  tenant_id uuid not null,
  provider text not null default 'metricool',
  external_user_id text not null,
  external_blog_id text not null,
  display_name text not null,
  discovered_at timestamptz not null default now(),
  primary key (connection_id, external_user_id, external_blog_id),
  foreign key (connection_id, tenant_id, provider)
    references public.tenant_connections (id, tenant_id, provider)
    on delete cascade,
  check (provider = 'metricool'),
  check (external_user_id ~ '^[0-9]{1,32}$'),
  check (external_blog_id ~ '^[0-9]{1,32}$'),
  check (length(btrim(display_name)) between 1 and 160)
);

alter table yzi_imob_metricool_private.account_candidates enable row level security;
revoke all on table yzi_imob_metricool_private.account_candidates
  from public, anon, authenticated, service_role,
    yzi_imob_metricool_executor, yzi_imob_metricool_runtime;

create function public.configure_yzi_imob_metricool_credential(
  p_tenant_id uuid,
  p_api_token text
)
returns table (connection_id uuid, connection_status text)
language plpgsql
security definer
set search_path = pg_catalog, public, auth, vault
as $function$
declare
  v_user_id uuid := auth.uid();
  v_connection public.tenant_connections%rowtype;
  v_secret_id uuid;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if not exists (
    select 1 from public.tenant_memberships tm
    join public.tenants t on t.id = tm.tenant_id
    where tm.tenant_id = p_tenant_id and tm.user_id = v_user_id
      and tm.status = 'active'
      and tm.role = any (array['owner', 'admin']::text[])
      and t.status = 'active'
  ) then
    raise exception using errcode = '42501', message = 'active_admin_membership_required';
  end if;
  if p_api_token is null or length(btrim(p_api_token)) not between 8 and 4096 then
    raise exception using errcode = '22023', message = 'valid_metricool_credential_required';
  end if;

  select tc.* into v_connection
  from public.tenant_connections tc
  where tc.tenant_id = p_tenant_id and tc.provider = 'metricool'
    and tc.revoked_at is null
  for update;

  if v_connection.id is null then
    insert into public.tenant_connections (
      tenant_id, provider, catalog_id, status, connected_by
    ) values (
      p_tenant_id, 'metricool', 'metricool', 'authorization_required', v_user_id
    ) returning * into v_connection;
  end if;

  if v_connection.vault_secret_id is null then
    select vault.create_secret(
      btrim(p_api_token),
      'yzi_imob_metricool_' || v_connection.id::text,
      'Metricool credential for a tenant-scoped YZI IMOB connection'
    ) into v_secret_id;
  else
    v_secret_id := v_connection.vault_secret_id;
    perform vault.update_secret(v_secret_id, btrim(p_api_token));
  end if;

  delete from yzi_imob_metricool_private.account_candidates c
  where c.connection_id = v_connection.id;

  update public.tenant_connections
  set vault_secret_id = v_secret_id,
      external_user_id = null,
      external_blog_id = null,
      account_display_name = null,
      capabilities = '{}'::text[],
      status = 'configuring',
      validated_at = null,
      last_checked_at = null,
      last_error_code = null,
      last_failure_reason = null,
      updated_at = now()
  where id = v_connection.id
  returning * into v_connection;

  insert into public.connection_audit_events (
    tenant_id, connection_id, event, actor_user_id
  ) values (
    p_tenant_id, v_connection.id, 'metricool_credential_configured', v_user_id
  );

  return query select v_connection.id, v_connection.status;
end;
$function$;

create function yzi_imob_metricool_private.claim_yzi_imob_metricool_discoveries(
  p_limit integer default 2
)
returns table (connection_id uuid, tenant_id uuid, api_token text)
language plpgsql
security definer
set search_path = pg_catalog, public, vault
as $function$
begin
  if session_user <> 'yzi_imob_metricool_runtime' then
    raise exception using errcode = '42501', message = 'metricool_runtime_required';
  end if;
  if p_limit not between 1 and 5 then
    raise exception using errcode = '22023', message = 'bounded_discovery_claim_required';
  end if;

  return query
  with candidates as (
    select tc.id
    from public.tenant_connections tc
    where tc.provider = 'metricool' and tc.status = 'configuring'
      and tc.revoked_at is null and tc.vault_secret_id is not null
      and (tc.last_checked_at is null or tc.last_checked_at < now() - interval '15 minutes')
    order by tc.updated_at, tc.id
    for update skip locked
    limit p_limit
  ), claimed as (
    update public.tenant_connections tc
    set last_checked_at = now(), updated_at = now()
    from candidates c where tc.id = c.id
    returning tc.*
  )
  select claimed.id, claimed.tenant_id, secrets.decrypted_secret
  from claimed
  join vault.decrypted_secrets secrets on secrets.id = claimed.vault_secret_id;
end;
$function$;

create function yzi_imob_metricool_private.complete_yzi_imob_metricool_discovery(
  p_connection_id uuid,
  p_outcome text,
  p_accounts jsonb default '[]'::jsonb,
  p_error_code text default null
)
returns table (connection_id uuid, connection_status text, account_count integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_connection public.tenant_connections%rowtype;
  v_count integer;
  v_status text;
begin
  if session_user <> 'yzi_imob_metricool_runtime' then
    raise exception using errcode = '42501', message = 'metricool_runtime_required';
  end if;
  if p_outcome not in ('ok', 'error') then
    raise exception using errcode = '22023', message = 'invalid_metricool_discovery_outcome';
  end if;
  if jsonb_typeof(p_accounts) <> 'array' or jsonb_array_length(p_accounts) > 50
    or pg_column_size(p_accounts) > 32768 then
    raise exception using errcode = '22023', message = 'bounded_account_payload_required';
  end if;
  if p_error_code is not null and p_error_code !~ '^[a-z0-9_]{1,80}$' then
    raise exception using errcode = '22023', message = 'invalid_sanitized_error_code';
  end if;

  select * into v_connection from public.tenant_connections tc
  where tc.id = p_connection_id and tc.provider = 'metricool'
    and tc.status = 'configuring' and tc.revoked_at is null
  for update;
  if v_connection.id is null then
    raise exception using errcode = '55000', message = 'metricool_connection_not_configuring';
  end if;

  delete from yzi_imob_metricool_private.account_candidates c
  where c.connection_id = v_connection.id;

  if p_outcome = 'ok' then
    insert into yzi_imob_metricool_private.account_candidates (
      connection_id, tenant_id, external_user_id, external_blog_id, display_name
    )
    select v_connection.id, v_connection.tenant_id,
      account ->> 'external_user_id', account ->> 'external_blog_id',
      btrim(account ->> 'display_name')
    from jsonb_array_elements(p_accounts) account
    where account ->> 'external_user_id' ~ '^[0-9]{1,32}$'
      and account ->> 'external_blog_id' ~ '^[0-9]{1,32}$'
      and length(btrim(account ->> 'display_name')) between 1 and 160
    on conflict do nothing;
  end if;

  select count(*)::integer into v_count
  from yzi_imob_metricool_private.account_candidates c
  where c.connection_id = v_connection.id;

  if p_outcome = 'error' or v_count = 0 then
    v_status := 'error';
  elsif v_count = 1 then
    update public.tenant_connections tc
    set external_user_id = c.external_user_id,
        external_blog_id = c.external_blog_id,
        account_display_name = c.display_name
    from yzi_imob_metricool_private.account_candidates c
    where tc.id = v_connection.id and c.connection_id = tc.id;
    v_status := 'pending_validation';
  else
    v_status := 'account_selection_required';
  end if;

  update public.tenant_connections
  set status = v_status,
      last_error_code = case
        when v_status = 'error' then coalesce(p_error_code, 'no_metricool_accounts')
        else null end,
      last_failure_at = case when v_status = 'error' then now() else null end,
      last_failure_reason = case
        when v_status = 'error' then coalesce(p_error_code, 'no_metricool_accounts')
        else null end,
      updated_at = now()
  where id = v_connection.id;

  insert into public.connection_audit_events (tenant_id, connection_id, event)
  values (v_connection.tenant_id, v_connection.id, 'metricool_account_discovery_completed');

  return query select v_connection.id, v_status, v_count;
end;
$function$;

create function public.get_yzi_imob_metricool_account_candidates(p_tenant_id uuid)
returns table (external_user_id text, external_blog_id text, display_name text)
language plpgsql
security definer
stable
set search_path = pg_catalog, public, auth
as $function$
declare v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if not exists (
    select 1 from public.tenant_memberships tm join public.tenants t on t.id=tm.tenant_id
    where tm.tenant_id=p_tenant_id and tm.user_id=v_user_id and tm.status='active'
      and tm.role=any(array['owner','admin']::text[]) and t.status='active'
  ) then
    raise exception using errcode='42501', message='active_admin_membership_required';
  end if;
  return query
  select c.external_user_id, c.external_blog_id, c.display_name
  from yzi_imob_metricool_private.account_candidates c
  join public.tenant_connections tc on tc.id=c.connection_id and tc.tenant_id=c.tenant_id
  where c.tenant_id=p_tenant_id and tc.provider='metricool'
    and tc.status='account_selection_required' and tc.revoked_at is null
  order by c.display_name, c.external_blog_id;
end;
$function$;

create function public.bind_yzi_imob_metricool_account(
  p_tenant_id uuid, p_external_user_id text, p_external_blog_id text
)
returns table (connection_id uuid, connection_status text)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_connection public.tenant_connections%rowtype;
  v_candidate yzi_imob_metricool_private.account_candidates%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode='28000', message='authentication_required';
  end if;
  if not exists (
    select 1 from public.tenant_memberships tm join public.tenants t on t.id=tm.tenant_id
    where tm.tenant_id=p_tenant_id and tm.user_id=v_user_id and tm.status='active'
      and tm.role=any(array['owner','admin']::text[]) and t.status='active'
  ) then
    raise exception using errcode='42501', message='active_admin_membership_required';
  end if;

  select * into v_connection from public.tenant_connections tc
  where tc.tenant_id=p_tenant_id and tc.provider='metricool'
    and tc.status='account_selection_required' and tc.revoked_at is null
  for update;
  if v_connection.id is null then
    raise exception using errcode='55000', message='metricool_account_selection_not_required';
  end if;

  select * into v_candidate from yzi_imob_metricool_private.account_candidates c
  where c.connection_id=v_connection.id and c.tenant_id=p_tenant_id
    and c.external_user_id=p_external_user_id
    and c.external_blog_id=p_external_blog_id;
  if v_candidate.connection_id is null then
    raise exception using errcode='22023', message='metricool_account_candidate_invalid';
  end if;

  update public.tenant_connections
  set external_user_id=v_candidate.external_user_id,
      external_blog_id=v_candidate.external_blog_id,
      account_display_name=v_candidate.display_name,
      status='pending_validation', last_error_code=null,
      last_failure_reason=null, updated_at=now()
  where id=v_connection.id returning * into v_connection;

  insert into public.connection_audit_events (tenant_id, connection_id, event, actor_user_id)
  values (p_tenant_id, v_connection.id, 'metricool_account_bound', v_user_id);
  return query select v_connection.id, v_connection.status;
end;
$function$;

create or replace function public.request_yzi_imob_metricool_validation(p_tenant_id uuid)
returns table (connection_id uuid, connection_status text)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_connection public.tenant_connections%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode='28000', message='authentication_required';
  end if;
  if not exists (
    select 1 from public.tenant_memberships tm join public.tenants t on t.id=tm.tenant_id
    where tm.tenant_id=p_tenant_id and tm.user_id=v_user_id and tm.status='active'
      and tm.role=any(array['owner','admin']::text[]) and t.status='active'
  ) then
    raise exception using errcode='42501', message='active_admin_membership_required';
  end if;

  update public.tenant_connections tc
  set status='validating', last_checked_at=null, last_error_code=null,
      last_failure_reason=null, updated_at=now()
  where tc.tenant_id=p_tenant_id and tc.provider='metricool'
    and tc.status='pending_validation' and tc.revoked_at is null
    and tc.vault_secret_id is not null and tc.external_user_id is not null
    and tc.external_blog_id is not null
  returning * into v_connection;
  if v_connection.id is null then
    raise exception using errcode='55000', message='metricool_account_binding_required';
  end if;

  insert into public.connection_audit_events (tenant_id, connection_id, event, actor_user_id)
  values (p_tenant_id, v_connection.id, 'metricool_validation_requested', v_user_id);
  return query select v_connection.id, v_connection.status;
end;
$function$;

revoke all on function public.configure_yzi_imob_metricool_credential(uuid, text)
  from public, anon, authenticated;
grant execute on function public.configure_yzi_imob_metricool_credential(uuid, text)
  to authenticated;
revoke all on function public.get_yzi_imob_metricool_account_candidates(uuid)
  from public, anon, authenticated;
grant execute on function public.get_yzi_imob_metricool_account_candidates(uuid)
  to authenticated;
revoke all on function public.bind_yzi_imob_metricool_account(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.bind_yzi_imob_metricool_account(uuid, text, text)
  to authenticated;
revoke all on function public.request_yzi_imob_metricool_validation(uuid)
  from public, anon, authenticated;
grant execute on function public.request_yzi_imob_metricool_validation(uuid)
  to authenticated;

revoke all on function yzi_imob_metricool_private.claim_yzi_imob_metricool_discoveries(integer)
  from public, anon, authenticated, service_role,
    yzi_imob_metricool_executor, yzi_imob_metricool_runtime;
grant execute on function yzi_imob_metricool_private.claim_yzi_imob_metricool_discoveries(integer)
  to yzi_imob_metricool_executor;
revoke all on function yzi_imob_metricool_private.complete_yzi_imob_metricool_discovery(uuid, text, jsonb, text)
  from public, anon, authenticated, service_role,
    yzi_imob_metricool_executor, yzi_imob_metricool_runtime;
grant execute on function yzi_imob_metricool_private.complete_yzi_imob_metricool_discovery(uuid, text, jsonb, text)
  to yzi_imob_metricool_executor;

comment on function public.configure_yzi_imob_metricool_credential(uuid, text) is
  'Owner/admin-only Metricool bootstrap. Writes credential directly to Vault and returns no secret or Vault identifier.';
comment on function yzi_imob_metricool_private.claim_yzi_imob_metricool_discoveries(integer) is
  'Dedicated-runtime-only bounded discovery claim. Secret is never exposed to authenticated clients.';

commit;
