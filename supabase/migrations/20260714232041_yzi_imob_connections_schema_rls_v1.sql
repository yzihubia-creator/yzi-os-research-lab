-- YZI IMOB - Connections Schema/RLS v1
-- Supabase migration: 20260714232041_yzi_imob_connections_schema_rls_v1
--
-- Scope:
-- - tenant_connections
-- - tenant_connection_assets
-- - connection_authorizations
-- - connection_audit_events
-- - read RPC get_yzi_imob_tenant_connections(p_tenant_id uuid)
--
-- Non-goals:
-- - No OAuth routes, Server Actions, provider calls, or frontend changes.
-- - No direct client writes.
-- - No materialized tenant_connection_capabilities table; capabilities are
--   derived from provider, scopes, assets, and persisted state.
-- - No grants to vault.* for public, anon, or authenticated.
--
-- Meta V1 boundary:
-- - This unit is structurally Meta-only. Do not generalize this schema to
--   Metricool, Google, OLX, portals, or other providers yet.
-- - Capability IDs used by the RPC match the canonical ConnectionCapabilityId
--   catalog: ler-metricas, acompanhar-campanhas, publicar-conteudo,
--   criar-anuncios.
-- - The RPC derives technical availability only. It does not grant operational
--   authority, does not bypass runtime policy, and does not replace human
--   approval gates.
--
-- Idempotency note:
-- - IF NOT EXISTS / DROP POLICY IF EXISTS / DROP TRIGGER IF EXISTS make this
--   pack replay-tolerant for the expected clean Unit 1 path. They do not
--   reconcile incompatible pre-existing objects; drift must be reviewed
--   manually before application.

begin;

-- ============================================================================
-- PART 0 - Preflight
-- ============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_extension
    where extname = 'supabase_vault'
  ) then
    raise exception using
      errcode = '55000',
      message = 'supabase_vault extension is required.';
  end if;

  if to_regclass('vault.secrets') is null then
    raise exception using
      errcode = '55000',
      message = 'vault.secrets is required.';
  end if;
end;
$$;

-- ============================================================================
-- PART 1 - Tables
-- ============================================================================

create table if not exists public.tenant_connections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  provider text not null,
  catalog_id text not null,
  status text not null default 'awaiting_account_selection',
  granted_scopes text[] not null default '{}'::text[],
  connected_by uuid null references auth.users(id) on delete set null,
  connected_at timestamptz null,
  expires_at timestamptz null,
  last_checked_at timestamptz null,
  last_sync_at timestamptz null,
  last_failure_at timestamptz null,
  last_failure_reason text null,
  revoked_at timestamptz null,
  provider_metadata jsonb not null default '{}'::jsonb,
  vault_secret_id uuid null references vault.secrets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_connections_provider_check
    check (provider = 'meta'),
  constraint tenant_connections_catalog_id_check
    check (catalog_id ~ '^[a-z0-9][a-z0-9_-]{0,95}$'),
  constraint tenant_connections_status_check
    check (status = any (array[
      'awaiting_account_selection',
      'connected',
      'insufficient_permissions',
      'token_expiring',
      'reconnect_required',
      'provider_error',
      'paused',
      'revoked'
    ]::text[])),
  constraint tenant_connections_revoked_consistency_check
    check ((status = 'revoked') = (revoked_at is not null)),
  constraint tenant_connections_scopes_check
    check (
      cardinality(granted_scopes) <= 100
      and array_position(granted_scopes, ''::text) is null
      and array_position(granted_scopes, null::text) is null
    ),
  constraint tenant_connections_failure_reason_check
    check (
      last_failure_reason is null
      or length(btrim(last_failure_reason)) between 1 and 500
    ),
  constraint tenant_connections_provider_metadata_check
    check (
      jsonb_typeof(provider_metadata) = 'object'
      and not (provider_metadata ?| array[
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
  constraint tenant_connections_identity_unique unique (id, tenant_id),
  constraint tenant_connections_identity_provider_unique unique (id, tenant_id, provider)
);

comment on table public.tenant_connections is
  'Tenant-scoped operational provider connections. Secrets are referenced by vault_secret_id and never exposed to frontend reads.';
comment on column public.tenant_connections.provider_metadata is
  'Internal sanitized metadata only. Server-side allowlists remain mandatory; checks only reject selected first-level secret-like keys.';
comment on column public.tenant_connections.vault_secret_id is
  'Reference to vault.secrets(id). Never returned by public RPCs or granted to frontend roles.';

create table if not exists public.tenant_connection_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  connection_id uuid not null,
  provider text not null,
  kind text not null,
  external_account_id text not null,
  account_label text null,
  revoked_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_connection_assets_connection_fkey
    foreign key (connection_id, tenant_id, provider)
    references public.tenant_connections(id, tenant_id, provider)
    on delete restrict,
  constraint tenant_connection_assets_provider_check
    check (provider = 'meta'),
  constraint tenant_connection_assets_kind_check
    check (kind = any (array[
      'business',
      'page',
      'instagram',
      'ad_account',
      'waba'
    ]::text[])),
  constraint tenant_connection_assets_external_account_id_check
    check (length(btrim(external_account_id)) between 1 and 160),
  constraint tenant_connection_assets_account_label_check
    check (
      account_label is null
      or length(btrim(account_label)) between 1 and 240
    ),
  constraint tenant_connection_assets_metadata_check
    check (
      jsonb_typeof(metadata) = 'object'
      and not (metadata ?| array[
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
    )
);

comment on table public.tenant_connection_assets is
  'Tenant-scoped provider assets selected for a connection. Meta page, Instagram, and ad account are globally exclusive while active.';
comment on column public.tenant_connection_assets.metadata is
  'Internal sanitized metadata only. Not granted to frontend roles.';

create table if not exists public.connection_authorizations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  catalog_id text not null,
  state_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  consumed_at timestamptz null,
  constraint connection_authorizations_provider_check
    check (provider = 'meta'),
  constraint connection_authorizations_catalog_id_check
    check (catalog_id ~ '^[a-z0-9][a-z0-9_-]{0,95}$'),
  constraint connection_authorizations_state_hash_check
    check (state_hash ~ '^[a-f0-9]{64}$'),
  constraint connection_authorizations_expiry_check
    check (expires_at > created_at),
  constraint connection_authorizations_consumed_check
    check (consumed_at is null or (consumed_at >= created_at and consumed_at <= expires_at)),
  constraint connection_authorizations_state_unique unique (provider, state_hash)
);

comment on table public.connection_authorizations is
  'OAuth state records. Stores only state_hash, never raw state/code/token. No frontend grants.';

create table if not exists public.connection_audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  connection_id uuid null,
  event text not null,
  actor_user_id uuid null references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint connection_audit_events_connection_fkey
    foreign key (connection_id, tenant_id)
    references public.tenant_connections(id, tenant_id)
    on delete restrict,
  constraint connection_audit_events_event_check
    check (event = any (array[
      'authorization_started',
      'authorization_completed',
      'authorization_cancelled',
      'assets_selected',
      'connection_updated',
      'connection_paused',
      'connection_revoked',
      'refresh_failed'
    ]::text[])),
  constraint connection_audit_events_metadata_check
    check (
      jsonb_typeof(metadata) = 'object'
      and not (metadata ?| array[
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
    )
);

comment on table public.connection_audit_events is
  'Append-only connection audit trail. Frontend has no direct INSERT, UPDATE, or DELETE.';
comment on column public.connection_audit_events.metadata is
  'Internal sanitized metadata only. Not granted to frontend roles.';

-- ============================================================================
-- PART 2 - Indexes
-- ============================================================================

create unique index if not exists tenant_connections_active_catalog_unique
  on public.tenant_connections (tenant_id, provider, catalog_id)
  where revoked_at is null;

create unique index if not exists tenant_connections_active_meta_provider_unique
  on public.tenant_connections (tenant_id, provider)
  where revoked_at is null and provider = 'meta';

create index if not exists tenant_connections_tenant_status_idx
  on public.tenant_connections (tenant_id, status, updated_at desc);

create index if not exists tenant_connections_connected_by_idx
  on public.tenant_connections (connected_by)
  where connected_by is not null;

create unique index if not exists tenant_connection_assets_active_per_connection_unique
  on public.tenant_connection_assets (connection_id, kind, external_account_id)
  where revoked_at is null;

create unique index if not exists tenant_connection_assets_active_meta_exclusive_unique
  on public.tenant_connection_assets (provider, kind, external_account_id)
  where revoked_at is null
    and provider = 'meta'
    and kind in ('page', 'instagram', 'ad_account');

create index if not exists tenant_connection_assets_tenant_connection_idx
  on public.tenant_connection_assets (tenant_id, connection_id);

create index if not exists connection_authorizations_active_lookup_idx
  on public.connection_authorizations (provider, state_hash, expires_at)
  where consumed_at is null;

create index if not exists connection_authorizations_tenant_user_idx
  on public.connection_authorizations (tenant_id, user_id, created_at desc);

create index if not exists connection_audit_events_tenant_created_idx
  on public.connection_audit_events (tenant_id, created_at desc);

create index if not exists connection_audit_events_connection_created_idx
  on public.connection_audit_events (connection_id, created_at desc)
  where connection_id is not null;

-- ============================================================================
-- PART 3 - updated_at triggers
-- ============================================================================

drop trigger if exists tenant_connections_set_updated_at
  on public.tenant_connections;
create trigger tenant_connections_set_updated_at
before update on public.tenant_connections
for each row execute function public.yzi_set_updated_at();

drop trigger if exists tenant_connection_assets_set_updated_at
  on public.tenant_connection_assets;
create trigger tenant_connection_assets_set_updated_at
before update on public.tenant_connection_assets
for each row execute function public.yzi_set_updated_at();

-- ============================================================================
-- PART 4 - RLS
-- ============================================================================

alter table public.tenant_connections enable row level security;
alter table public.tenant_connection_assets enable row level security;
alter table public.connection_authorizations enable row level security;
alter table public.connection_audit_events enable row level security;

drop policy if exists tenant_connections_select_admin
  on public.tenant_connections;
create policy tenant_connections_select_admin
on public.tenant_connections
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_memberships tm
    join public.tenants t on t.id = tm.tenant_id
    where tm.tenant_id = tenant_connections.tenant_id
      and tm.user_id = (select auth.uid())
      and tm.status = 'active'
      and tm.role = any (array['owner', 'admin']::text[])
      and t.status = 'active'
  )
);

drop policy if exists tenant_connection_assets_select_admin
  on public.tenant_connection_assets;
create policy tenant_connection_assets_select_admin
on public.tenant_connection_assets
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_memberships tm
    join public.tenants t on t.id = tm.tenant_id
    where tm.tenant_id = tenant_connection_assets.tenant_id
      and tm.user_id = (select auth.uid())
      and tm.status = 'active'
      and tm.role = any (array['owner', 'admin']::text[])
      and t.status = 'active'
  )
);

drop policy if exists connection_audit_events_select_admin
  on public.connection_audit_events;
create policy connection_audit_events_select_admin
on public.connection_audit_events
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_memberships tm
    join public.tenants t on t.id = tm.tenant_id
    where tm.tenant_id = connection_audit_events.tenant_id
      and tm.user_id = (select auth.uid())
      and tm.status = 'active'
      and tm.role = any (array['owner', 'admin']::text[])
      and t.status = 'active'
  )
);

-- connection_authorizations intentionally has no frontend policies.
-- connection_audit_events intentionally has no frontend INSERT/UPDATE/DELETE
-- policies; future governed functions append events.

-- ============================================================================
-- PART 5 - Read RPC
-- ============================================================================
-- Capability IDs below are canonical ConnectionCapabilityId values from the
-- YZI IMOB Connections catalog. They represent derived technical availability
-- for the connected Meta assets/scopes only, never permission to execute a
-- runtime action.

create or replace function public.get_yzi_imob_tenant_connections(p_tenant_id uuid)
returns table (
  id uuid,
  tenant_id uuid,
  provider text,
  catalog_id text,
  status text,
  granted_scopes text[],
  connected_by uuid,
  connected_at timestamptz,
  expires_at timestamptz,
  last_checked_at timestamptz,
  last_sync_at timestamptz,
  last_failure_at timestamptz,
  last_failure_reason text,
  created_at timestamptz,
  updated_at timestamptz,
  assets jsonb,
  capabilities jsonb
)
language plpgsql
security invoker
stable
set search_path to 'pg_catalog', 'public', 'auth'
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required.';
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

  return query
  select
    tc.id,
    tc.tenant_id,
    tc.provider,
    tc.catalog_id,
    tc.status,
    tc.granted_scopes,
    tc.connected_by,
    tc.connected_at,
    tc.expires_at,
    tc.last_checked_at,
    tc.last_sync_at,
    tc.last_failure_at,
    tc.last_failure_reason,
    tc.created_at,
    tc.updated_at,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'kind', a.kind,
          'external_account_id', a.external_account_id,
          'account_label', a.account_label,
          'created_at', a.created_at,
          'updated_at', a.updated_at
        )
        order by a.kind, a.account_label nulls last, a.id
      )
      from public.tenant_connection_assets a
      where a.tenant_id = tc.tenant_id
        and a.connection_id = tc.id
        and a.revoked_at is null
    ), '[]'::jsonb) as assets,
    jsonb_build_array(
      jsonb_build_object(
        'capability_id', 'ler-metricas',
        'unlocked',
          tc.status in ('connected', 'token_expiring')
          and (
            (
              'pages_read_engagement' = any (tc.granted_scopes)
              and exists (
                select 1
                from public.tenant_connection_assets a
                where a.connection_id = tc.id
                  and a.revoked_at is null
                  and a.kind = 'page'
              )
            )
            or (
              'instagram_basic' = any (tc.granted_scopes)
              and exists (
                select 1
                from public.tenant_connection_assets a
                where a.connection_id = tc.id
                  and a.revoked_at is null
                  and a.kind = 'instagram'
              )
            )
            or (
              'ads_read' = any (tc.granted_scopes)
              and exists (
                select 1
                from public.tenant_connection_assets a
                where a.connection_id = tc.id
                  and a.revoked_at is null
                  and a.kind = 'ad_account'
              )
            )
          ),
        'source', 'derived'
      ),
      jsonb_build_object(
        'capability_id', 'acompanhar-campanhas',
        'unlocked',
          tc.status in ('connected', 'token_expiring')
          and 'ads_read' = any (tc.granted_scopes)
          and exists (
            select 1
            from public.tenant_connection_assets a
            where a.connection_id = tc.id
              and a.revoked_at is null
              and a.kind = 'ad_account'
          ),
        'source', 'derived'
      ),
      jsonb_build_object(
        'capability_id', 'publicar-conteudo',
        'unlocked',
          tc.status in ('connected', 'token_expiring')
          and (
            (
              'pages_manage_posts' = any (tc.granted_scopes)
              and exists (
                select 1
                from public.tenant_connection_assets a
                where a.connection_id = tc.id
                  and a.revoked_at is null
                  and a.kind = 'page'
              )
            )
            or (
              'instagram_content_publish' = any (tc.granted_scopes)
              and exists (
                select 1
                from public.tenant_connection_assets a
                where a.connection_id = tc.id
                  and a.revoked_at is null
                  and a.kind = 'instagram'
              )
            )
          ),
        'source', 'derived'
      ),
      jsonb_build_object(
        'capability_id', 'criar-anuncios',
        'unlocked',
          tc.status in ('connected', 'token_expiring')
          and 'ads_management' = any (tc.granted_scopes)
          and exists (
            select 1
            from public.tenant_connection_assets a
            where a.connection_id = tc.id
              and a.revoked_at is null
              and a.kind = 'ad_account'
          ),
        'source', 'derived'
      )
    ) as capabilities
  from public.tenant_connections tc
  where tc.tenant_id = p_tenant_id
    and tc.revoked_at is null
    and tc.status <> 'revoked'
  order by tc.provider, tc.catalog_id, tc.created_at;
end;
$$;

comment on function public.get_yzi_imob_tenant_connections(uuid) is
  'Admin-only read projection for YZI IMOB Connections. Requires explicit p_tenant_id and active owner/admin membership in an active tenant. Never returns vault_secret_id or internal metadata.';

-- ============================================================================
-- PART 6 - Grants
-- ============================================================================

revoke all on public.tenant_connections from public, anon, authenticated;
revoke all on public.tenant_connection_assets from public, anon, authenticated;
revoke all on public.connection_authorizations from public, anon, authenticated;
revoke all on public.connection_audit_events from public, anon, authenticated;

grant select (
  id,
  tenant_id,
  provider,
  catalog_id,
  status,
  granted_scopes,
  connected_by,
  connected_at,
  expires_at,
  last_checked_at,
  last_sync_at,
  last_failure_at,
  last_failure_reason,
  revoked_at,
  created_at,
  updated_at
) on public.tenant_connections to authenticated;

grant select (
  id,
  tenant_id,
  connection_id,
  provider,
  kind,
  external_account_id,
  account_label,
  revoked_at,
  created_at,
  updated_at
) on public.tenant_connection_assets to authenticated;

grant select (
  id,
  tenant_id,
  connection_id,
  event,
  actor_user_id,
  created_at
) on public.connection_audit_events to authenticated;

revoke all on function public.get_yzi_imob_tenant_connections(uuid)
from public, anon, authenticated;
grant execute on function public.get_yzi_imob_tenant_connections(uuid)
to authenticated;

commit;
