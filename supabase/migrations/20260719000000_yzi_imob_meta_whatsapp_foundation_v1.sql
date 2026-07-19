-- YZI IMOB - Meta WhatsApp Cloud API foundation v1
--
-- Purpose:
-- - keep Meta as one tenant connection;
-- - discover/persist WhatsApp Business Accounts and phone numbers as assets;
-- - persist signed WhatsApp webhook events idempotently;
-- - expose Vault credentials only to one dedicated server runtime role.

begin;

create schema if not exists yzi_meta_whatsapp_private authorization postgres;

do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_roles
    where rolname = 'yzi_meta_whatsapp_executor'
  ) then
    create role yzi_meta_whatsapp_executor
      nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
  end if;

  if not exists (
    select 1 from pg_catalog.pg_roles
    where rolname = 'yzi_meta_whatsapp_runtime'
  ) then
    create role yzi_meta_whatsapp_runtime
      login password null inherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
  end if;
end;
$$;

alter role yzi_meta_whatsapp_runtime set search_path = pg_catalog;
alter role yzi_meta_whatsapp_runtime set statement_timeout = '20s';
alter role yzi_meta_whatsapp_runtime set lock_timeout = '5s';
alter role yzi_meta_whatsapp_runtime set idle_in_transaction_session_timeout = '5s';

grant yzi_meta_whatsapp_executor to yzi_meta_whatsapp_runtime;

revoke all on schema yzi_meta_whatsapp_private from public, anon, authenticated, service_role;
grant usage on schema yzi_meta_whatsapp_private to yzi_meta_whatsapp_executor;

comment on role yzi_meta_whatsapp_executor is
  'NOLOGIN capability role: EXECUTE only on governed YZI IMOB Meta WhatsApp functions.';
comment on role yzi_meta_whatsapp_runtime is
  'LOGIN runtime dedicated exclusively to YZI IMOB WhatsApp discovery and webhook persistence; credential provisioned out-of-band.';

alter table public.tenant_connection_assets
  drop constraint if exists tenant_connection_assets_kind_check;
alter table public.tenant_connection_assets
  add constraint tenant_connection_assets_kind_check
  check (kind = any (array[
    'business',
    'page',
    'instagram',
    'ad_account',
    'waba',
    'whatsapp_business_account',
    'whatsapp_phone_number'
  ]::text[]));

create table if not exists public.provider_webhook_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  connection_id uuid not null,
  provider text not null,
  channel text not null,
  provider_event_key text not null,
  external_message_id text null,
  event_type text not null,
  phone_number_id text null,
  waba_id text null,
  normalized_status text not null,
  payload_min jsonb not null default '{}'::jsonb,
  processed_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint provider_webhook_events_connection_fkey
    foreign key (connection_id, tenant_id)
    references public.tenant_connections(id, tenant_id)
    on delete restrict,
  constraint provider_webhook_events_provider_check
    check (provider = 'meta'),
  constraint provider_webhook_events_channel_check
    check (channel = 'whatsapp'),
  constraint provider_webhook_events_provider_event_key_check
    check (length(btrim(provider_event_key)) between 1 and 300),
  constraint provider_webhook_events_external_message_id_check
    check (
      external_message_id is null
      or length(btrim(external_message_id)) between 1 and 300
    ),
  constraint provider_webhook_events_event_type_check
    check (event_type = any (array['message', 'status', 'unsupported']::text[])),
  constraint provider_webhook_events_phone_number_id_check
    check (
      phone_number_id is null
      or length(btrim(phone_number_id)) between 1 and 160
    ),
  constraint provider_webhook_events_waba_id_check
    check (
      waba_id is null
      or length(btrim(waba_id)) between 1 and 160
    ),
  constraint provider_webhook_events_normalized_status_check
    check (length(btrim(normalized_status)) between 1 and 80),
  constraint provider_webhook_events_payload_min_check
    check (
      jsonb_typeof(payload_min) = 'object'
      and not (payload_min ?| array[
        'token',
        'access_token',
        'refresh_token',
        'client_secret',
        'app_secret',
        'code',
        'state',
        'raw',
        'payload',
        'secret',
        'vault_secret_id'
      ])
    ),
  constraint provider_webhook_events_connection_event_unique
    unique (connection_id, provider_event_key)
);

comment on table public.provider_webhook_events is
  'Provider webhook delivery ledger. Anonymous webhooks are persisted only after signature validation and asset-based tenant resolution.';
comment on column public.provider_webhook_events.provider_event_key is
  'Required deterministic idempotency key derived from provider message/status identifiers, never from the full payload.';
comment on column public.provider_webhook_events.payload_min is
  'Sanitized minimal audit payload. Never stores raw webhook payload or secrets.';

create index if not exists provider_webhook_events_tenant_idx
  on public.provider_webhook_events (tenant_id);
create index if not exists provider_webhook_events_connection_idx
  on public.provider_webhook_events (connection_id);
create index if not exists provider_webhook_events_phone_number_id_idx
  on public.provider_webhook_events (phone_number_id)
  where phone_number_id is not null;
create index if not exists provider_webhook_events_waba_id_idx
  on public.provider_webhook_events (waba_id)
  where waba_id is not null;
create index if not exists provider_webhook_events_created_at_idx
  on public.provider_webhook_events (created_at desc);

create unique index if not exists tenant_connection_assets_active_meta_whatsapp_phone_unique
  on public.tenant_connection_assets (provider, external_account_id)
  where revoked_at is null
    and provider = 'meta'
    and kind = 'whatsapp_phone_number';

create unique index if not exists tenant_connection_assets_active_meta_whatsapp_waba_unique
  on public.tenant_connection_assets (provider, external_account_id)
  where revoked_at is null
    and provider = 'meta'
    and kind in ('waba', 'whatsapp_business_account');

alter table public.provider_webhook_events enable row level security;
revoke all on public.provider_webhook_events from public, anon, authenticated;

create or replace function yzi_meta_whatsapp_private.get_meta_whatsapp_discovery_context(
  p_connection_id uuid
)
returns table (
  connection_id uuid,
  tenant_id uuid,
  graph_api_version text,
  meta_access_token text
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public', 'vault'
as $$
declare
  v_connection public.tenant_connections%rowtype;
  v_meta_access_token text;
begin
  if session_user <> 'yzi_meta_whatsapp_runtime' then
    raise exception using errcode = '42501', message = 'meta_whatsapp_runtime_required';
  end if;

  if p_connection_id is null then
    raise exception using errcode = '22023', message = 'invalid_connection_reference';
  end if;

  select *
  into v_connection
  from public.tenant_connections tc
  where tc.id = p_connection_id
    and tc.provider = 'meta'
    and tc.revoked_at is null
  for update;

  if not found
    or v_connection.vault_secret_id is null
    or v_connection.status in ('paused', 'revoked')
  then
    raise exception using errcode = '42501', message = 'eligible_meta_connection_required';
  end if;

  select ds.decrypted_secret
  into v_meta_access_token
  from vault.decrypted_secrets ds
  where ds.id = v_connection.vault_secret_id;

  if v_meta_access_token is null or length(v_meta_access_token) < 1 then
    raise exception using errcode = '55000', message = 'meta_vault_secret_unavailable';
  end if;

  connection_id := v_connection.id;
  tenant_id := v_connection.tenant_id;
  graph_api_version := coalesce(v_connection.provider_metadata ->> 'graph_api_version', 'v25.0');
  meta_access_token := v_meta_access_token;
  return next;
end;
$$;

create or replace function yzi_meta_whatsapp_private.upsert_meta_whatsapp_assets(
  p_connection_id uuid,
  p_wabas jsonb,
  p_phone_numbers jsonb
)
returns table (
  waba_count integer,
  phone_number_count integer,
  persisted_at timestamptz
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_connection public.tenant_connections%rowtype;
  v_now timestamptz := now();
  v_item jsonb;
  v_waba_count integer := 0;
  v_phone_count integer := 0;
begin
  if session_user <> 'yzi_meta_whatsapp_runtime' then
    raise exception using errcode = '42501', message = 'meta_whatsapp_runtime_required';
  end if;

  if p_connection_id is null
    or jsonb_typeof(coalesce(p_wabas, '[]'::jsonb)) <> 'array'
    or jsonb_typeof(coalesce(p_phone_numbers, '[]'::jsonb)) <> 'array'
  then
    raise exception using errcode = '22023', message = 'invalid_whatsapp_assets';
  end if;

  select *
  into v_connection
  from public.tenant_connections tc
  where tc.id = p_connection_id
    and tc.provider = 'meta'
    and tc.revoked_at is null
  for update;

  if not found or v_connection.status in ('paused', 'revoked') then
    raise exception using errcode = '42501', message = 'eligible_meta_connection_required';
  end if;

  for v_item in select * from jsonb_array_elements(coalesce(p_wabas, '[]'::jsonb)) loop
    if v_item ->> 'external_account_id' is null
      or length(btrim(v_item ->> 'external_account_id')) not between 1 and 160
    then
      raise exception using errcode = '22023', message = 'invalid_waba_asset';
    end if;

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
      'whatsapp_business_account',
      btrim(v_item ->> 'external_account_id'),
      nullif(btrim(coalesce(v_item ->> 'account_label', '')), ''),
      coalesce(v_item -> 'metadata', '{}'::jsonb)
    )
    on conflict (connection_id, kind, external_account_id)
      where revoked_at is null
    do update set
      account_label = excluded.account_label,
      metadata = excluded.metadata,
      updated_at = v_now;

    v_waba_count := v_waba_count + 1;
  end loop;

  for v_item in select * from jsonb_array_elements(coalesce(p_phone_numbers, '[]'::jsonb)) loop
    if v_item ->> 'phone_number_id' is null
      or length(btrim(v_item ->> 'phone_number_id')) not between 1 and 160
    then
      raise exception using errcode = '22023', message = 'invalid_phone_number_asset';
    end if;

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
      'whatsapp_phone_number',
      btrim(v_item ->> 'phone_number_id'),
      nullif(btrim(coalesce(v_item ->> 'display_phone_number', v_item ->> 'verified_name', '')), ''),
      coalesce(v_item -> 'metadata', '{}'::jsonb)
    )
    on conflict (connection_id, kind, external_account_id)
      where revoked_at is null
    do update set
      account_label = excluded.account_label,
      metadata = excluded.metadata,
      updated_at = v_now;

    v_phone_count := v_phone_count + 1;
  end loop;

  update public.tenant_connections tc
  set
    last_checked_at = v_now,
    last_sync_at = v_now,
    last_failure_at = null,
    last_failure_reason = null,
    updated_at = v_now
  where tc.id = v_connection.id;

  waba_count := v_waba_count;
  phone_number_count := v_phone_count;
  persisted_at := v_now;
  return next;
end;
$$;

create or replace function yzi_meta_whatsapp_private.resolve_meta_whatsapp_webhook_asset(
  p_phone_number_id text,
  p_waba_id text
)
returns table (
  tenant_id uuid,
  connection_id uuid,
  matched_kind text,
  matched_external_account_id text
)
language plpgsql
security definer
stable
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_match_count integer;
begin
  if session_user <> 'yzi_meta_whatsapp_runtime' then
    raise exception using errcode = '42501', message = 'meta_whatsapp_runtime_required';
  end if;

  if nullif(btrim(coalesce(p_phone_number_id, '')), '') is null
    and nullif(btrim(coalesce(p_waba_id, '')), '') is null
  then
    raise exception using errcode = '22023', message = 'asset_identifier_required';
  end if;

  with candidate as (
    select a.tenant_id, a.connection_id, a.kind, a.external_account_id
    from public.tenant_connection_assets a
    join public.tenant_connections tc
      on tc.id = a.connection_id
     and tc.tenant_id = a.tenant_id
     and tc.provider = a.provider
    where a.provider = 'meta'
      and a.revoked_at is null
      and tc.revoked_at is null
      and tc.status not in ('paused', 'revoked')
      and (
        (
          nullif(btrim(coalesce(p_phone_number_id, '')), '') is not null
          and a.kind = 'whatsapp_phone_number'
          and a.external_account_id = btrim(p_phone_number_id)
        )
        or (
          nullif(btrim(coalesce(p_phone_number_id, '')), '') is null
          and nullif(btrim(coalesce(p_waba_id, '')), '') is not null
          and a.kind in ('whatsapp_business_account', 'waba')
          and a.external_account_id = btrim(p_waba_id)
        )
      )
  )
  select count(*) into v_match_count from candidate;

  if v_match_count > 1 then
    raise exception using errcode = '23505', message = 'ambiguous_whatsapp_asset';
  end if;

  return query
  with candidate as (
    select a.tenant_id, a.connection_id, a.kind, a.external_account_id
    from public.tenant_connection_assets a
    join public.tenant_connections tc
      on tc.id = a.connection_id
     and tc.tenant_id = a.tenant_id
     and tc.provider = a.provider
    where a.provider = 'meta'
      and a.revoked_at is null
      and tc.revoked_at is null
      and tc.status not in ('paused', 'revoked')
      and (
        (
          nullif(btrim(coalesce(p_phone_number_id, '')), '') is not null
          and a.kind = 'whatsapp_phone_number'
          and a.external_account_id = btrim(p_phone_number_id)
        )
        or (
          nullif(btrim(coalesce(p_phone_number_id, '')), '') is null
          and nullif(btrim(coalesce(p_waba_id, '')), '') is not null
          and a.kind in ('whatsapp_business_account', 'waba')
          and a.external_account_id = btrim(p_waba_id)
        )
      )
  )
  select candidate.tenant_id, candidate.connection_id, candidate.kind, candidate.external_account_id
  from candidate;
end;
$$;

create or replace function yzi_meta_whatsapp_private.insert_meta_whatsapp_webhook_event(
  p_connection_id uuid,
  p_provider_event_key text,
  p_external_message_id text,
  p_event_type text,
  p_phone_number_id text,
  p_waba_id text,
  p_normalized_status text,
  p_payload_min jsonb
)
returns table (
  event_id uuid,
  inserted boolean,
  created_at timestamptz
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_connection public.tenant_connections%rowtype;
  v_event_id uuid;
  v_created_at timestamptz;
  v_inserted boolean;
begin
  if session_user <> 'yzi_meta_whatsapp_runtime' then
    raise exception using errcode = '42501', message = 'meta_whatsapp_runtime_required';
  end if;

  if p_connection_id is null
    or nullif(btrim(coalesce(p_provider_event_key, '')), '') is null
    or p_event_type <> all (array['message', 'status', 'unsupported']::text[])
    or nullif(btrim(coalesce(p_normalized_status, '')), '') is null
    or jsonb_typeof(coalesce(p_payload_min, '{}'::jsonb)) <> 'object'
  then
    raise exception using errcode = '22023', message = 'invalid_webhook_event';
  end if;

  select *
  into v_connection
  from public.tenant_connections tc
  where tc.id = p_connection_id
    and tc.provider = 'meta'
    and tc.revoked_at is null
    and tc.status not in ('paused', 'revoked')
  for update;

  if not found then
    raise exception using errcode = '42501', message = 'eligible_meta_connection_required';
  end if;

  insert into public.provider_webhook_events (
    tenant_id,
    connection_id,
    provider,
    channel,
    provider_event_key,
    external_message_id,
    event_type,
    phone_number_id,
    waba_id,
    normalized_status,
    payload_min,
    processed_at
  ) values (
    v_connection.tenant_id,
    v_connection.id,
    'meta',
    'whatsapp',
    btrim(p_provider_event_key),
    nullif(btrim(coalesce(p_external_message_id, '')), ''),
    p_event_type,
    nullif(btrim(coalesce(p_phone_number_id, '')), ''),
    nullif(btrim(coalesce(p_waba_id, '')), ''),
    btrim(p_normalized_status),
    coalesce(p_payload_min, '{}'::jsonb),
    now()
  )
  on conflict (connection_id, provider_event_key)
  do nothing
  returning id, provider_webhook_events.created_at
  into v_event_id, v_created_at;

  v_inserted := found;

  if not v_inserted then
    select pwe.id, pwe.created_at
    into v_event_id, v_created_at
    from public.provider_webhook_events pwe
    where pwe.connection_id = v_connection.id
      and pwe.provider_event_key = btrim(p_provider_event_key);
  end if;

  event_id := v_event_id;
  inserted := v_inserted;
  created_at := v_created_at;
  return next;
end;
$$;

alter function yzi_meta_whatsapp_private.get_meta_whatsapp_discovery_context(uuid) owner to postgres;
alter function yzi_meta_whatsapp_private.upsert_meta_whatsapp_assets(uuid, jsonb, jsonb) owner to postgres;
alter function yzi_meta_whatsapp_private.resolve_meta_whatsapp_webhook_asset(text, text) owner to postgres;
alter function yzi_meta_whatsapp_private.insert_meta_whatsapp_webhook_event(uuid, text, text, text, text, text, text, jsonb) owner to postgres;

revoke all on function yzi_meta_whatsapp_private.get_meta_whatsapp_discovery_context(uuid)
  from public, anon, authenticated, service_role,
    yzi_meta_whatsapp_executor,
    yzi_meta_whatsapp_runtime;
revoke all on function yzi_meta_whatsapp_private.upsert_meta_whatsapp_assets(uuid, jsonb, jsonb)
  from public, anon, authenticated, service_role,
    yzi_meta_whatsapp_executor,
    yzi_meta_whatsapp_runtime;
revoke all on function yzi_meta_whatsapp_private.resolve_meta_whatsapp_webhook_asset(text, text)
  from public, anon, authenticated, service_role,
    yzi_meta_whatsapp_executor,
    yzi_meta_whatsapp_runtime;
revoke all on function yzi_meta_whatsapp_private.insert_meta_whatsapp_webhook_event(uuid, text, text, text, text, text, text, jsonb)
  from public, anon, authenticated, service_role,
    yzi_meta_whatsapp_executor,
    yzi_meta_whatsapp_runtime;

grant execute on function yzi_meta_whatsapp_private.get_meta_whatsapp_discovery_context(uuid)
  to yzi_meta_whatsapp_executor;
grant execute on function yzi_meta_whatsapp_private.upsert_meta_whatsapp_assets(uuid, jsonb, jsonb)
  to yzi_meta_whatsapp_executor;
grant execute on function yzi_meta_whatsapp_private.resolve_meta_whatsapp_webhook_asset(text, text)
  to yzi_meta_whatsapp_executor;
grant execute on function yzi_meta_whatsapp_private.insert_meta_whatsapp_webhook_event(uuid, text, text, text, text, text, text, jsonb)
  to yzi_meta_whatsapp_executor;

comment on function yzi_meta_whatsapp_private.get_meta_whatsapp_discovery_context(uuid) is
  'Returns the current Meta credential only to the dedicated WhatsApp server runtime for immediate read-only discovery.';
comment on function yzi_meta_whatsapp_private.upsert_meta_whatsapp_assets(uuid, jsonb, jsonb) is
  'Upserts only WhatsApp WABA and phone number assets under the existing Meta connection; never touches Page, Instagram, or Ads assets.';
comment on function yzi_meta_whatsapp_private.resolve_meta_whatsapp_webhook_asset(text, text) is
  'Resolves anonymous signed WhatsApp webhook payloads to tenant/connection exclusively through persisted WhatsApp assets.';
comment on function yzi_meta_whatsapp_private.insert_meta_whatsapp_webhook_event(uuid, text, text, text, text, text, text, jsonb) is
  'Idempotently inserts one sanitized WhatsApp webhook event using unique (connection_id, provider_event_key).';

commit;
