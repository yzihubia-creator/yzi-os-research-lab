begin;

-- YZI IMOB - governed Metricool social publishing MVP.
--
-- Boundaries:
-- - Metricool API is the deterministic runtime transport.
-- - Metricool MCP is not part of the application runtime.
-- - Secrets remain in Supabase Vault and are never projected to frontend RPCs.
-- - Social publications are derived from approved property publication revisions.
-- - No real provider request is executed by this migration.

-- The external runner uses a dedicated LOGIN role with no password in source
-- control. Its credential is provisioned out-of-band after the migration.
do $roles$
begin
  if not exists (
    select 1 from pg_catalog.pg_roles where rolname = 'yzi_imob_metricool_executor'
  ) then
    create role yzi_imob_metricool_executor
      nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
  end if;

  if not exists (
    select 1 from pg_catalog.pg_roles where rolname = 'yzi_imob_metricool_runtime'
  ) then
    create role yzi_imob_metricool_runtime
      login password null inherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
  end if;
end;
$roles$;

alter role yzi_imob_metricool_runtime set search_path = pg_catalog;
alter role yzi_imob_metricool_runtime set statement_timeout = '20s';
alter role yzi_imob_metricool_runtime set lock_timeout = '5s';
alter role yzi_imob_metricool_runtime set idle_in_transaction_session_timeout = '5s';

grant yzi_imob_metricool_executor to yzi_imob_metricool_runtime;
revoke all on database postgres from yzi_imob_metricool_executor, yzi_imob_metricool_runtime;
grant connect on database postgres to yzi_imob_metricool_runtime;
revoke all on schema public, auth, storage, vault
  from yzi_imob_metricool_executor, yzi_imob_metricool_runtime;
create schema if not exists yzi_imob_metricool_private authorization postgres;
revoke all on schema yzi_imob_metricool_private
  from public, anon, authenticated, service_role,
    yzi_imob_metricool_executor, yzi_imob_metricool_runtime;
grant usage on schema yzi_imob_metricool_private to yzi_imob_metricool_executor;

-- ============================================================================
-- Connection registry extension
-- ============================================================================

alter table public.tenant_connections
  drop constraint tenant_connections_provider_check;

alter table public.tenant_connections
  add constraint tenant_connections_provider_check
  check (provider = any (array['meta', 'metricool']::text[]));

alter table public.tenant_connections
  drop constraint tenant_connections_status_check;

alter table public.tenant_connections
  add constraint tenant_connections_status_check
  check (
    status = any (
      array[
        'pending_validation',
        'awaiting_account_selection',
        'connected',
        'insufficient_permissions',
        'token_expiring',
        'reconnect_required',
        'provider_error',
        'paused',
        'revoked',
        'not_configured',
        'configuration_required',
        'validating',
        'active',
        'attention_required',
        'token_invalid',
        'plan_insufficient',
        'rate_limited',
        'disconnected',
        'failed'
      ]::text[]
    )
  );

alter table public.tenant_connections
  add column external_user_id text null,
  add column external_blog_id text null,
  add column account_display_name text null,
  add column capabilities text[] not null default '{}'::text[],
  add column validated_at timestamptz null,
  add column disconnected_at timestamptz null,
  add column token_expires_at timestamptz null,
  add column last_error_code text null;

alter table public.tenant_connections
  add constraint tenant_connections_metricool_identity_check
  check (
    provider <> 'metricool'
    or (
      (external_user_id is null or external_user_id ~ '^[0-9]{1,32}$')
      and (external_blog_id is null or external_blog_id ~ '^[0-9]{1,32}$')
    )
  ),
  add constraint tenant_connections_account_display_name_check
  check (
    account_display_name is null
    or length(btrim(account_display_name)) between 1 and 160
  ),
  add constraint tenant_connections_capabilities_check
  check (
    cardinality(capabilities) <= 32
    and array_position(capabilities, ''::text) is null
    and array_position(capabilities, null::text) is null
    and capabilities <@ array[
      'connection_validation',
      'profile_discovery',
      'social_publish',
      'social_schedule',
      'social_cancel',
      'post_status',
      'post_metrics',
      'profile_metrics'
    ]::text[]
  ),
  add constraint tenant_connections_last_error_code_check
  check (
    last_error_code is null
    or last_error_code ~ '^[a-z0-9_]{1,80}$'
  ),
  add constraint tenant_connections_metricool_active_config_check
  check (
    provider <> 'metricool'
    or status not in ('active', 'connected')
    or (
      external_user_id is not null
      and external_blog_id is not null
      and vault_secret_id is not null
      and validated_at is not null
    )
  ),
  add constraint tenant_connections_disconnected_consistency_check
  check (
    provider <> 'metricool'
    or (status = 'disconnected') = (disconnected_at is not null)
  );

create unique index tenant_connections_active_metricool_provider_unique
  on public.tenant_connections (tenant_id, provider)
  where revoked_at is null and provider = 'metricool';

alter table public.tenant_connection_assets
  drop constraint tenant_connection_assets_provider_check;

alter table public.tenant_connection_assets
  add constraint tenant_connection_assets_provider_check
  check (provider = any (array['meta', 'metricool']::text[]));

alter table public.tenant_connection_assets
  drop constraint tenant_connection_assets_kind_check;

alter table public.tenant_connection_assets
  add constraint tenant_connection_assets_kind_check
  check (
    kind = any (
      array[
        'business',
        'page',
        'instagram',
        'ad_account',
        'waba',
        'whatsapp_business_account',
        'whatsapp_phone_number',
        'profile'
      ]::text[]
    )
  );

alter table public.tenant_connection_assets
  add constraint tenant_connection_assets_metricool_metadata_check
  check (
    provider <> 'metricool'
    or (
      kind = 'profile'
      and metadata ->> 'network' = any (array['instagram', 'facebook']::text[])
      and not (metadata ?| array['token', 'secret', 'raw', 'payload', 'private_url'])
    )
  );

alter table public.connection_audit_events
  drop constraint connection_audit_events_event_check;

alter table public.connection_audit_events
  add constraint connection_audit_events_event_check
  check (
    event = any (
      array[
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
        'meta_ads_validation_failed',
        'metricool_connection_validated',
        'metricool_connection_failed',
        'metricool_connection_disconnected',
        'metricool_configuration_requested'
      ]::text[]
    )
  );

-- ============================================================================
-- Governed social publication, jobs, events and metrics
-- ============================================================================

create table public.yzi_imob_social_publications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null,
  publication_revision_id uuid not null,
  connection_id uuid not null,
  provider text not null default 'metricool',
  target_networks text[] not null,
  target_profile_ids text[] not null,
  format text not null,
  caption text not null,
  asset_references jsonb not null,
  scheduled_at timestamptz not null,
  status text not null default 'queued',
  external_post_id text null,
  external_post_uuid text null,
  external_network_post_ids jsonb not null default '{}'::jsonb,
  external_url text null,
  idempotency_key text not null,
  accepted_at timestamptz null,
  published_at timestamptz null,
  failed_at timestamptz null,
  cancelled_at timestamptz null,
  last_status_sync_at timestamptz null,
  last_metrics_sync_at timestamptz null,
  error_code text null,
  created_by_user_id uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_social_publications_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_social_publications_revision_fkey
    foreign key (publication_revision_id, tenant_id, property_id)
    references public.yzi_imob_property_publication_revisions (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_social_publications_connection_fkey
    foreign key (connection_id, tenant_id, provider)
    references public.tenant_connections (id, tenant_id, provider)
    on delete restrict,
  constraint yzi_imob_social_publications_identity_unique
    unique (id, tenant_id),
  constraint yzi_imob_social_publications_idempotency_unique
    unique (tenant_id, provider, idempotency_key),
  constraint yzi_imob_social_publications_provider_check
    check (provider = 'metricool'),
  constraint yzi_imob_social_publications_networks_check
    check (
      cardinality(target_networks) between 1 and 2
      and target_networks <@ array['instagram', 'facebook']::text[]
      and (
        cardinality(target_networks) = 1
        or target_networks[1] <> target_networks[2]
      )
    ),
  constraint yzi_imob_social_publications_profiles_check
    check (
      cardinality(target_profile_ids) between 1 and 2
      and cardinality(target_profile_ids) = cardinality(target_networks)
      and array_position(target_profile_ids, ''::text) is null
    ),
  constraint yzi_imob_social_publications_format_check
    check (format = any (array['single_image', 'carousel']::text[])),
  constraint yzi_imob_social_publications_caption_check
    check (length(btrim(caption)) between 1 and 2200),
  constraint yzi_imob_social_publications_assets_check
    check (
      jsonb_typeof(asset_references) = 'array'
      and jsonb_array_length(asset_references) between 1 and 10
      and (
        (format = 'single_image' and jsonb_array_length(asset_references) = 1)
        or (format = 'carousel' and jsonb_array_length(asset_references) between 2 and 10)
      )
      and pg_column_size(asset_references) <= 32768
    ),
  constraint yzi_imob_social_publications_status_check
    check (
      status = any (
        array[
          'queued',
          'dispatching',
          'accepted',
          'scheduled',
          'publishing',
          'published',
          'failed',
          'cancelled'
        ]::text[]
      )
    ),
  constraint yzi_imob_social_publications_external_id_check
    check (
      (external_post_id is null or length(btrim(external_post_id)) between 1 and 160)
      and (external_post_uuid is null or length(btrim(external_post_uuid)) between 1 and 160)
      and (external_url is null or external_url ~ '^https://')
    ),
  constraint yzi_imob_social_publications_network_post_ids_check
    check (
      jsonb_typeof(external_network_post_ids) = 'object'
      and external_network_post_ids - 'instagram' - 'facebook' = '{}'::jsonb
      and pg_column_size(external_network_post_ids) <= 1024
    ),
  constraint yzi_imob_social_publications_key_check
    check (length(btrim(idempotency_key)) between 16 and 200),
  constraint yzi_imob_social_publications_error_check
    check (error_code is null or error_code ~ '^[a-z0-9_]{1,80}$')
);

create index yzi_imob_social_publications_status_idx
  on public.yzi_imob_social_publications (tenant_id, status, scheduled_at, created_at);

create index yzi_imob_social_publications_property_idx
  on public.yzi_imob_social_publications (tenant_id, property_id, created_at desc);

create table public.yzi_imob_social_publication_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  social_publication_id uuid not null,
  operation text not null,
  status text not null default 'queued',
  idempotency_key text not null,
  available_at timestamptz not null default now(),
  claimed_at timestamptz null,
  completed_at timestamptz null,
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  last_error_code text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_social_publication_jobs_publication_fkey
    foreign key (social_publication_id, tenant_id)
    references public.yzi_imob_social_publications (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_social_publication_jobs_idempotency_unique
    unique (tenant_id, idempotency_key),
  constraint yzi_imob_social_publication_jobs_operation_check
    check (operation = any (array['publish', 'status_sync', 'cancel', 'metrics_sync']::text[])),
  constraint yzi_imob_social_publication_jobs_status_check
    check (status = any (array['queued', 'processing', 'succeeded', 'failed', 'cancelled']::text[])),
  constraint yzi_imob_social_publication_jobs_attempts_check
    check (
      attempt_count >= 0
      and max_attempts between 1 and 8
      and attempt_count <= max_attempts
    ),
  constraint yzi_imob_social_publication_jobs_error_check
    check (last_error_code is null or last_error_code ~ '^[a-z0-9_]{1,80}$')
);

create index yzi_imob_social_publication_jobs_claim_idx
  on public.yzi_imob_social_publication_jobs (status, available_at, created_at)
  where status in ('queued', 'failed');

create table public.yzi_imob_social_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  social_publication_id uuid null,
  target_profile_id text null,
  provider text not null default 'metricool',
  network text not null,
  metric_scope text not null,
  provider_metric_name text not null,
  normalized_metric_name text null,
  value numeric not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  collected_at timestamptz not null,
  source text not null default 'metricool_api',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_social_metrics_publication_fkey
    foreign key (social_publication_id, tenant_id)
    references public.yzi_imob_social_publications (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_social_metrics_provider_check
    check (provider = 'metricool'),
  constraint yzi_imob_social_metrics_network_check
    check (network = any (array['instagram', 'facebook']::text[])),
  constraint yzi_imob_social_metrics_scope_check
    check (metric_scope = any (array['post', 'profile']::text[])),
  constraint yzi_imob_social_metrics_subject_check
    check (
      (metric_scope = 'post' and social_publication_id is not null)
      or (metric_scope = 'profile' and target_profile_id is not null)
    ),
  constraint yzi_imob_social_metrics_provider_name_check
    check (provider_metric_name ~ '^[A-Za-z0-9_.-]{1,100}$'),
  constraint yzi_imob_social_metrics_normalized_name_check
    check (
      normalized_metric_name is null
      or normalized_metric_name = any (
        array[
          'impressions',
          'views',
          'reach',
          'engagement',
          'likes',
          'comments',
          'shares',
          'saves',
          'clicks',
          'followers',
          'profile_views',
          'posts_published'
        ]::text[]
      )
    ),
  constraint yzi_imob_social_metrics_period_check
    check (period_end >= period_start and collected_at >= period_end),
  constraint yzi_imob_social_metrics_source_check
    check (source = 'metricool_api')
);

create unique index yzi_imob_social_metrics_identity_idx
  on public.yzi_imob_social_metrics (
    tenant_id,
    coalesce(social_publication_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(target_profile_id, ''),
    network,
    metric_scope,
    provider_metric_name,
    period_start,
    period_end
  );

create index yzi_imob_social_metrics_period_idx
  on public.yzi_imob_social_metrics (tenant_id, period_end desc, network, metric_scope);

create table public.yzi_imob_social_publication_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  social_publication_id uuid not null,
  job_id uuid null references public.yzi_imob_social_publication_jobs (id) on delete restrict,
  event_type text not null,
  error_code text null,
  metadata jsonb not null default '{}'::jsonb,
  actor_user_id uuid null references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint yzi_imob_social_publication_events_publication_fkey
    foreign key (social_publication_id, tenant_id)
    references public.yzi_imob_social_publications (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_social_publication_events_type_check
    check (
      event_type = any (
        array[
          'social_publish_queued',
          'social_publish_dispatched',
          'social_publish_accepted',
          'social_publish_published',
          'social_publish_failed',
          'social_publish_cancelled',
          'social_metrics_synced',
          'social_metrics_sync_failed',
          'social_publish_retry_requested'
        ]::text[]
      )
    ),
  constraint yzi_imob_social_publication_events_error_check
    check (error_code is null or error_code ~ '^[a-z0-9_]{1,80}$'),
  constraint yzi_imob_social_publication_events_metadata_check
    check (
      jsonb_typeof(metadata) = 'object'
      and pg_column_size(metadata) <= 4096
      and not (metadata ?| array['token', 'caption', 'media', 'raw', 'payload', 'secret'])
    )
);

create index yzi_imob_social_publication_events_tenant_idx
  on public.yzi_imob_social_publication_events (tenant_id, created_at desc);

create trigger yzi_imob_social_publications_set_updated_at
before update on public.yzi_imob_social_publications
for each row execute function public.yzi_set_updated_at();

create trigger yzi_imob_social_publication_jobs_set_updated_at
before update on public.yzi_imob_social_publication_jobs
for each row execute function public.yzi_set_updated_at();

create trigger yzi_imob_social_metrics_set_updated_at
before update on public.yzi_imob_social_metrics
for each row execute function public.yzi_set_updated_at();

create function public.record_yzi_imob_metricool_job_dispatch()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
begin
  if old.status is distinct from 'processing'
    and new.status = 'processing'
    and new.operation = 'publish'
  then
    insert into public.yzi_imob_social_publication_events (
      tenant_id,
      social_publication_id,
      job_id,
      event_type
    )
    values (
      new.tenant_id,
      new.social_publication_id,
      new.id,
      'social_publish_dispatched'
    );
  end if;
  return new;
end;
$function$;

create trigger yzi_imob_social_publication_jobs_record_dispatch
after update of status on public.yzi_imob_social_publication_jobs
for each row execute function public.record_yzi_imob_metricool_job_dispatch();

alter table public.yzi_imob_social_publications enable row level security;
alter table public.yzi_imob_social_publication_jobs enable row level security;
alter table public.yzi_imob_social_metrics enable row level security;
alter table public.yzi_imob_social_publication_events enable row level security;

create policy yzi_imob_social_publications_select_member
  on public.yzi_imob_social_publications
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_social_publications.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create policy yzi_imob_social_publication_jobs_select_member
  on public.yzi_imob_social_publication_jobs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      where tm.tenant_id = yzi_imob_social_publication_jobs.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
    )
  );

create policy yzi_imob_social_metrics_select_member
  on public.yzi_imob_social_metrics
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      where tm.tenant_id = yzi_imob_social_metrics.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
    )
  );

create policy yzi_imob_social_publication_events_select_member
  on public.yzi_imob_social_publication_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      where tm.tenant_id = yzi_imob_social_publication_events.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
    )
  );

revoke all
  on table
    public.yzi_imob_social_publications,
    public.yzi_imob_social_publication_jobs,
    public.yzi_imob_social_metrics,
    public.yzi_imob_social_publication_events
  from public, anon, authenticated;

grant select
  on table
    public.yzi_imob_social_publications,
    public.yzi_imob_social_publication_jobs,
    public.yzi_imob_social_metrics,
    public.yzi_imob_social_publication_events
  to authenticated;

grant all
  on table
    public.yzi_imob_social_publications,
    public.yzi_imob_social_publication_jobs,
    public.yzi_imob_social_metrics,
    public.yzi_imob_social_publication_events
  to service_role;

-- ============================================================================
-- Tenant-facing governed commands
-- ============================================================================

create or replace function public.request_yzi_imob_metricool_configuration(
  p_tenant_id uuid
)
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
    raise exception using errcode = '28000', message = 'authentication_required';
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
    raise exception using errcode = '42501', message = 'active_admin_membership_required';
  end if;

  insert into public.tenant_connections (
    tenant_id,
    provider,
    catalog_id,
    status,
    connected_by
  )
  values (
    p_tenant_id,
    'metricool',
    'metricool',
    'configuration_required',
    v_user_id
  )
  on conflict (tenant_id, provider, catalog_id)
    where revoked_at is null
  do update
    set status = 'configuration_required',
        disconnected_at = null,
        last_error_code = null,
        last_failure_reason = null,
        updated_at = now()
  returning *
  into v_connection;

  insert into public.connection_audit_events (
    tenant_id,
    connection_id,
    event,
    actor_user_id
  )
  values (
    p_tenant_id,
    v_connection.id,
    'metricool_configuration_requested',
    v_user_id
  );

  return query select v_connection.id, v_connection.status;
end;
$function$;

create or replace function public.request_yzi_imob_metricool_validation(
  p_tenant_id uuid
)
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
    raise exception using errcode = '28000', message = 'authentication_required';
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
    raise exception using errcode = '42501', message = 'active_admin_membership_required';
  end if;

  update public.tenant_connections tc
  set status = 'validating',
      last_checked_at = null,
      last_error_code = null,
      last_failure_reason = null,
      updated_at = now()
  where tc.tenant_id = p_tenant_id
    and tc.provider = 'metricool'
    and tc.revoked_at is null
    and tc.vault_secret_id is not null
    and tc.external_user_id is not null
    and tc.external_blog_id is not null
  returning *
  into v_connection;

  if v_connection.id is null then
    raise exception using errcode = '55000', message = 'metricool_configuration_required';
  end if;

  return query select v_connection.id, v_connection.status;
end;
$function$;

create or replace function public.disconnect_yzi_imob_metricool_connection(
  p_tenant_id uuid
)
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
    raise exception using errcode = '28000', message = 'authentication_required';
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
    raise exception using errcode = '42501', message = 'active_admin_membership_required';
  end if;

  update public.tenant_connections tc
  set status = 'disconnected',
      disconnected_at = now(),
      capabilities = '{}'::text[],
      last_error_code = null,
      updated_at = now()
  where tc.tenant_id = p_tenant_id
    and tc.provider = 'metricool'
    and tc.revoked_at is null
  returning *
  into v_connection;

  if v_connection.id is null then
    raise exception using errcode = 'P0002', message = 'metricool_connection_not_found';
  end if;

  update public.yzi_imob_social_publication_jobs j
  set status = 'cancelled',
      completed_at = now(),
      last_error_code = 'connection_disconnected',
      updated_at = now()
  where j.tenant_id = p_tenant_id
    and j.status in ('queued', 'failed')
    and exists (
      select 1
      from public.yzi_imob_social_publications sp
      where sp.id = j.social_publication_id
        and sp.connection_id = v_connection.id
    );

  insert into public.connection_audit_events (
    tenant_id,
    connection_id,
    event,
    actor_user_id
  )
  values (
    p_tenant_id,
    v_connection.id,
    'metricool_connection_disconnected',
    v_user_id
  );

  return query select v_connection.id, v_connection.status;
end;
$function$;

create or replace function public.enqueue_yzi_imob_metricool_publication(
  p_revision_id uuid,
  p_connection_id uuid,
  p_target_networks text[],
  p_target_profile_ids text[],
  p_format text,
  p_caption text,
  p_media_ids uuid[],
  p_scheduled_at timestamptz,
  p_idempotency_key text
)
returns table (
  social_publication_id uuid,
  job_id uuid,
  publication_status text,
  idempotent_replay boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_revision public.yzi_imob_property_publication_revisions%rowtype;
  v_connection public.tenant_connections%rowtype;
  v_assets jsonb;
  v_publication public.yzi_imob_social_publications%rowtype;
  v_job public.yzi_imob_social_publication_jobs%rowtype;
  v_expected_media_count integer;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  select r.*
    into v_revision
  from public.yzi_imob_property_publication_revisions r
  join public.tenant_memberships tm
    on tm.tenant_id = r.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin', 'operator']::text[])
  join public.tenants t
    on t.id = r.tenant_id
   and t.status = 'active'
  where r.id = p_revision_id;

  if v_revision.id is null then
    raise exception using errcode = '42501', message = 'revision_not_found_or_forbidden';
  end if;

  if v_revision.status <> 'approved' then
    raise exception using errcode = '55000', message = 'approved_revision_required';
  end if;

  select tc.*
    into v_connection
  from public.tenant_connections tc
  where tc.id = p_connection_id
    and tc.tenant_id = v_revision.tenant_id
    and tc.provider = 'metricool'
    and tc.status in ('active', 'connected')
    and tc.revoked_at is null;

  if v_connection.id is null then
    raise exception using errcode = '55000', message = 'active_metricool_connection_required';
  end if;

  if p_scheduled_at < now() + interval '1 minute' then
    raise exception using errcode = '22023', message = 'future_schedule_required';
  end if;

  if p_format not in ('single_image', 'carousel')
    or cardinality(p_media_ids) is null
    or cardinality(p_media_ids) not between 1 and 10
    or (p_format = 'single_image' and cardinality(p_media_ids) <> 1)
    or (p_format = 'carousel' and cardinality(p_media_ids) not between 2 and 10)
  then
    raise exception using errcode = '22023', message = 'invalid_social_media_format';
  end if;

  if cardinality(p_target_networks) is null
    or cardinality(p_target_networks) not between 1 and 2
    or cardinality(p_target_profile_ids) <> cardinality(p_target_networks)
    or not (p_target_networks <@ array['instagram', 'facebook']::text[])
  then
    raise exception using errcode = '22023', message = 'invalid_metricool_targets';
  end if;

  if exists (
    select 1
    from unnest(p_target_networks, p_target_profile_ids) as target(network, profile_id)
    where not exists (
      select 1
      from public.tenant_connection_assets a
      where a.tenant_id = v_revision.tenant_id
        and a.connection_id = v_connection.id
        and a.provider = 'metricool'
        and a.kind = 'profile'
        and a.external_account_id = target.profile_id
        and a.metadata ->> 'network' = target.network
        and a.revoked_at is null
    )
  ) then
    raise exception using errcode = '42501', message = 'metricool_target_not_allowlisted';
  end if;

  select count(*), coalesce(
    jsonb_agg(
      jsonb_build_object(
        'media_id', pm.id,
        'url', pm.public_url,
        'alt_text', pm.alt_text,
        'sort_order', pm.sort_order
      )
      order by pm.sort_order, pm.id
    ),
    '[]'::jsonb
  )
    into v_expected_media_count, v_assets
  from public.yzi_imob_property_media pm
  where pm.tenant_id = v_revision.tenant_id
    and pm.property_id = v_revision.property_id
    and pm.id = any (p_media_ids)
    and pm.media_type = 'image'
    and pm.processing_status = 'ready'
    and pm.is_publication_allowed
    and pm.public_url ~ '^https://';

  if v_expected_media_count <> cardinality(p_media_ids) then
    raise exception using errcode = '22023', message = 'public_ready_media_required';
  end if;

  select sp.*
    into v_publication
  from public.yzi_imob_social_publications sp
  where sp.tenant_id = v_revision.tenant_id
    and sp.provider = 'metricool'
    and sp.idempotency_key = p_idempotency_key;

  if v_publication.id is not null then
    if v_publication.publication_revision_id <> p_revision_id
      or v_publication.connection_id <> p_connection_id
      or v_publication.target_networks <> p_target_networks
      or v_publication.target_profile_ids <> p_target_profile_ids
      or v_publication.format <> p_format
      or v_publication.caption <> btrim(p_caption)
      or v_publication.asset_references <> v_assets
      or v_publication.scheduled_at <> p_scheduled_at
    then
      raise exception using errcode = '23505', message = 'social_publication_idempotency_conflict';
    end if;

    select j.*
      into v_job
    from public.yzi_imob_social_publication_jobs j
    where j.tenant_id = v_publication.tenant_id
      and j.social_publication_id = v_publication.id
      and j.operation = 'publish'
    order by j.created_at
    limit 1;

    return query select v_publication.id, v_job.id, v_publication.status, true;
    return;
  end if;

  insert into public.yzi_imob_social_publications (
    tenant_id,
    property_id,
    publication_revision_id,
    connection_id,
    provider,
    target_networks,
    target_profile_ids,
    format,
    caption,
    asset_references,
    scheduled_at,
    idempotency_key,
    created_by_user_id
  )
  values (
    v_revision.tenant_id,
    v_revision.property_id,
    v_revision.id,
    v_connection.id,
    'metricool',
    p_target_networks,
    p_target_profile_ids,
    p_format,
    btrim(p_caption),
    v_assets,
    p_scheduled_at,
    p_idempotency_key,
    v_user_id
  )
  returning *
  into v_publication;

  insert into public.yzi_imob_social_publication_jobs (
    tenant_id,
    social_publication_id,
    operation,
    status,
    idempotency_key,
    available_at
  )
  values (
    v_publication.tenant_id,
    v_publication.id,
    'publish',
    'queued',
    p_idempotency_key || ':publish',
    greatest(now(), p_scheduled_at - interval '5 minutes')
  )
  returning *
  into v_job;

  insert into public.yzi_imob_social_publication_events (
    tenant_id,
    social_publication_id,
    job_id,
    event_type,
    actor_user_id
  )
  values (
    v_publication.tenant_id,
    v_publication.id,
    v_job.id,
    'social_publish_queued',
    v_user_id
  );

  return query select v_publication.id, v_job.id, v_publication.status, false;
end;
$function$;

create or replace function public.cancel_yzi_imob_metricool_publication(
  p_social_publication_id uuid
)
returns table (social_publication_id uuid, job_id uuid, publication_status text)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_publication public.yzi_imob_social_publications%rowtype;
  v_job public.yzi_imob_social_publication_jobs%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  select sp.*
    into v_publication
  from public.yzi_imob_social_publications sp
  join public.tenant_memberships tm
    on tm.tenant_id = sp.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin', 'operator']::text[])
  where sp.id = p_social_publication_id
  for update of sp;

  if v_publication.id is null then
    raise exception using errcode = '42501', message = 'social_publication_not_found_or_forbidden';
  end if;

  if v_publication.status not in ('queued', 'accepted', 'scheduled', 'failed') then
    raise exception using errcode = '55000', message = 'social_publication_not_cancellable';
  end if;

  insert into public.yzi_imob_social_publication_jobs (
    tenant_id,
    social_publication_id,
    operation,
    idempotency_key
  )
  values (
    v_publication.tenant_id,
    v_publication.id,
    'cancel',
    v_publication.idempotency_key || ':cancel'
  )
  on conflict (tenant_id, idempotency_key)
  do update set updated_at = now()
  returning *
  into v_job;

  update public.yzi_imob_social_publications
  set status = case when external_post_id is null then 'cancelled' else status end,
      cancelled_at = case when external_post_id is null then now() else cancelled_at end,
      updated_at = now()
  where id = v_publication.id
  returning *
  into v_publication;

  return query select v_publication.id, v_job.id, v_publication.status;
end;
$function$;

create or replace function public.retry_yzi_imob_metricool_publication(
  p_social_publication_id uuid,
  p_retry_idempotency_key text
)
returns table (social_publication_id uuid, job_id uuid, publication_status text)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_publication public.yzi_imob_social_publications%rowtype;
  v_job public.yzi_imob_social_publication_jobs%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  select sp.*
    into v_publication
  from public.yzi_imob_social_publications sp
  join public.tenant_memberships tm
    on tm.tenant_id = sp.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin', 'operator']::text[])
  where sp.id = p_social_publication_id
  for update of sp;

  if v_publication.id is null then
    raise exception using errcode = '42501', message = 'social_publication_not_found_or_forbidden';
  end if;

  if v_publication.status <> 'failed' then
    raise exception using errcode = '55000', message = 'failed_social_publication_required';
  end if;

  insert into public.yzi_imob_social_publication_jobs (
    tenant_id,
    social_publication_id,
    operation,
    idempotency_key,
    available_at
  )
  values (
    v_publication.tenant_id,
    v_publication.id,
    case when v_publication.external_post_id is null then 'publish' else 'status_sync' end,
    p_retry_idempotency_key,
    now()
  )
  returning *
  into v_job;

  update public.yzi_imob_social_publications
  set status = case when external_post_id is null then 'queued' else 'accepted' end,
      failed_at = null,
      error_code = null,
      updated_at = now()
  where id = v_publication.id
  returning *
  into v_publication;

  insert into public.yzi_imob_social_publication_events (
    tenant_id,
    social_publication_id,
    job_id,
    event_type,
    actor_user_id
  )
  values (
    v_publication.tenant_id,
    v_publication.id,
    v_job.id,
    'social_publish_retry_requested',
    v_user_id
  );

  return query select v_publication.id, v_job.id, v_publication.status;
end;
$function$;

-- ============================================================================
-- Runtime-only commands. They are callable only with the dedicated
-- yzi_imob_metricool_runtime role and never granted to authenticated/anon.
-- ============================================================================

create or replace function yzi_imob_metricool_private.recover_yzi_imob_metricool_jobs(
  p_processing_timeout_seconds integer default 900,
  p_limit integer default 10
)
returns table (recovered_count integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_count integer := 0;
begin
  if session_user <> 'yzi_imob_metricool_runtime' then
    raise exception using errcode = '42501', message = 'metricool_runtime_required';
  end if;
  if p_processing_timeout_seconds not between 60 and 86400 or p_limit not between 1 and 50 then
    raise exception using errcode = '22023', message = 'bounded_recovery_required';
  end if;

  with stuck as (
    select j.id
    from public.yzi_imob_social_publication_jobs j
    where j.status = 'processing'
      and j.claimed_at < now() - make_interval(secs => p_processing_timeout_seconds)
    order by j.claimed_at, j.id
    for update skip locked
    limit p_limit
  )
  update public.yzi_imob_social_publication_jobs j
  set status = case when j.attempt_count < j.max_attempts then 'failed' else 'succeeded' end,
      available_at = now(),
      completed_at = case when j.attempt_count >= j.max_attempts then now() else null end,
      claimed_at = null,
      last_error_code = 'runner_interrupted',
      updated_at = now()
  from stuck
  where j.id = stuck.id;

  get diagnostics v_count = row_count;
  return query select v_count;
end;
$function$;

create or replace function yzi_imob_metricool_private.claim_yzi_imob_metricool_validations(
  p_limit integer default 2
)
returns table (
  connection_id uuid,
  tenant_id uuid,
  external_user_id text,
  external_blog_id text,
  api_token text
)
language plpgsql
security definer
set search_path = pg_catalog, public, vault
as $function$
begin
  if session_user <> 'yzi_imob_metricool_runtime' then
    raise exception using errcode = '42501', message = 'metricool_runtime_required';
  end if;
  if p_limit not between 1 and 5 then
    raise exception using errcode = '22023', message = 'bounded_validation_claim_required';
  end if;

  return query
  with candidates as (
    select tc.id
    from public.tenant_connections tc
    where tc.provider = 'metricool'
      and tc.status = 'validating'
      and tc.revoked_at is null
      and tc.vault_secret_id is not null
      and tc.external_user_id is not null
      and tc.external_blog_id is not null
      and (tc.last_checked_at is null or tc.last_checked_at < now() - interval '15 minutes')
    order by tc.updated_at, tc.id
    for update skip locked
    limit p_limit
  ),
  claimed as (
    update public.tenant_connections tc
    set last_checked_at = now(),
        updated_at = now()
    from candidates c
    where tc.id = c.id
    returning tc.*
  )
  select
    claimed.id,
    claimed.tenant_id,
    claimed.external_user_id,
    claimed.external_blog_id,
    secrets.decrypted_secret
  from claimed
  join vault.decrypted_secrets secrets on secrets.id = claimed.vault_secret_id;
end;
$function$;

create or replace function yzi_imob_metricool_private.complete_yzi_imob_metricool_validation(
  p_connection_id uuid,
  p_outcome text,
  p_display_name text default null,
  p_capabilities text[] default '{}'::text[],
  p_profiles jsonb default '[]'::jsonb,
  p_error_code text default null
)
returns table (connection_id uuid, connection_status text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_connection public.tenant_connections%rowtype;
  v_status text;
  v_event text;
begin
  if session_user <> 'yzi_imob_metricool_runtime' then
    raise exception using errcode = '42501', message = 'metricool_runtime_required';
  end if;
  if p_outcome not in ('active', 'token_invalid', 'plan_insufficient', 'rate_limited', 'failed') then
    raise exception using errcode = '22023', message = 'invalid_metricool_validation_outcome';
  end if;
  if p_error_code is not null and p_error_code !~ '^[a-z0-9_]{1,80}$' then
    raise exception using errcode = '22023', message = 'invalid_sanitized_error_code';
  end if;
  if jsonb_typeof(p_profiles) <> 'array'
    or jsonb_array_length(p_profiles) > 20
    or pg_column_size(p_profiles) > 16384
  then
    raise exception using errcode = '22023', message = 'bounded_profile_payload_required';
  end if;

  select *
    into v_connection
  from public.tenant_connections tc
  where tc.id = p_connection_id
    and tc.provider = 'metricool'
    and tc.status = 'validating'
    and tc.revoked_at is null
  for update;

  if v_connection.id is null then
    raise exception using errcode = '55000', message = 'metricool_connection_not_validating';
  end if;

  v_status := p_outcome;
  v_event := case when p_outcome = 'active'
    then 'metricool_connection_validated'
    else 'metricool_connection_failed'
  end;

  update public.tenant_connections
  set status = v_status,
      account_display_name = case
        when p_outcome = 'active' then nullif(btrim(p_display_name), '')
        else account_display_name
      end,
      capabilities = case when p_outcome = 'active' then p_capabilities else '{}'::text[] end,
      connected_at = case when p_outcome = 'active' then coalesce(connected_at, now()) else connected_at end,
      validated_at = case when p_outcome = 'active' then now() else validated_at end,
      last_sync_at = case when p_outcome = 'active' then now() else last_sync_at end,
      last_failure_at = case when p_outcome = 'active' then null else now() end,
      last_failure_reason = case when p_outcome = 'active' then null else p_error_code end,
      last_error_code = case when p_outcome = 'active' then null else p_error_code end,
      disconnected_at = null,
      updated_at = now()
  where id = v_connection.id;

  if p_outcome = 'active' then
    update public.tenant_connection_assets
    set revoked_at = now(),
        updated_at = now()
    where connection_id = v_connection.id
      and tenant_id = v_connection.tenant_id
      and provider = 'metricool'
      and revoked_at is null;

    insert into public.tenant_connection_assets (
      tenant_id,
      connection_id,
      provider,
      kind,
      external_account_id,
      account_label,
      metadata
    )
    select
      v_connection.tenant_id,
      v_connection.id,
      'metricool',
      'profile',
      profile ->> 'id',
      nullif(profile ->> 'display_name', ''),
      jsonb_build_object('network', profile ->> 'network')
    from jsonb_array_elements(p_profiles) profile
    where profile ->> 'network' in ('instagram', 'facebook')
      and profile ->> 'id' ~ '^[A-Za-z0-9_.:@/-]{1,160}$'
      and length(coalesce(profile ->> 'display_name', '')) <= 240;
  end if;

  insert into public.connection_audit_events (
    tenant_id,
    connection_id,
    event,
    metadata
  )
  values (
    v_connection.tenant_id,
    v_connection.id,
    v_event,
    jsonb_build_object('status', v_status)
  );

  return query select v_connection.id, v_status;
end;
$function$;

create or replace function yzi_imob_metricool_private.claim_yzi_imob_metricool_jobs(
  p_limit integer default 5
)
returns table (
  job_id uuid,
  tenant_id uuid,
  social_publication_id uuid,
  operation text,
  attempt_count integer,
  max_attempts integer,
  connection_id uuid,
  external_user_id text,
  external_blog_id text,
  api_token text,
  target_networks text[],
  target_profile_ids text[],
  publication_format text,
  caption text,
  asset_references jsonb,
  scheduled_at timestamptz,
  external_post_id text,
  external_post_uuid text,
  external_network_post_ids jsonb
)
language plpgsql
security definer
set search_path = pg_catalog, public, vault
as $function$
begin
  if session_user <> 'yzi_imob_metricool_runtime' then
    raise exception using errcode = '42501', message = 'metricool_runtime_required';
  end if;
  if p_limit not between 1 and 10 then
    raise exception using errcode = '22023', message = 'bounded_batch_required';
  end if;

  return query
  with claimed as (
    select j.id
    from public.yzi_imob_social_publication_jobs j
    join public.yzi_imob_social_publications candidate_publication
      on candidate_publication.id = j.social_publication_id
     and candidate_publication.tenant_id = j.tenant_id
    join public.tenant_connections candidate_connection
      on candidate_connection.id = candidate_publication.connection_id
     and candidate_connection.tenant_id = candidate_publication.tenant_id
     and candidate_connection.provider = 'metricool'
     and candidate_connection.status = 'active'
     and candidate_connection.revoked_at is null
    where j.status in ('queued', 'failed')
      and j.available_at <= now()
      and j.attempt_count < j.max_attempts
    order by j.available_at, j.created_at
    for update skip locked
    limit p_limit
  ),
  updated as (
    update public.yzi_imob_social_publication_jobs j
    set status = 'processing',
        claimed_at = now(),
        attempt_count = j.attempt_count + 1,
        last_error_code = null,
        updated_at = now()
    from claimed c
    where j.id = c.id
    returning j.*
  )
  select
    j.id,
    j.tenant_id,
    j.social_publication_id,
    j.operation,
    j.attempt_count,
    j.max_attempts,
    sp.connection_id,
    tc.external_user_id,
    tc.external_blog_id,
    ds.decrypted_secret,
    sp.target_networks,
    sp.target_profile_ids,
    sp.format,
    sp.caption,
    sp.asset_references,
    sp.scheduled_at,
    sp.external_post_id,
    sp.external_post_uuid,
    sp.external_network_post_ids
  from updated j
  join public.yzi_imob_social_publications sp
    on sp.id = j.social_publication_id
   and sp.tenant_id = j.tenant_id
  join public.tenant_connections tc
    on tc.id = sp.connection_id
   and tc.tenant_id = sp.tenant_id
   and tc.provider = 'metricool'
   and tc.status in ('active', 'connected')
  join vault.decrypted_secrets ds
    on ds.id = tc.vault_secret_id;
end;
$function$;

create or replace function yzi_imob_metricool_private.complete_yzi_imob_metricool_job(
  p_job_id uuid,
  p_outcome text,
  p_external_post_id text default null,
  p_external_post_uuid text default null,
  p_external_network_post_ids jsonb default null,
  p_external_url text default null,
  p_error_code text default null,
  p_retry_at timestamptz default null
)
returns table (job_status text, publication_status text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_job public.yzi_imob_social_publication_jobs%rowtype;
  v_publication public.yzi_imob_social_publications%rowtype;
  v_job_status text;
  v_publication_status text;
  v_event_type text;
begin
  if session_user <> 'yzi_imob_metricool_runtime' then
    raise exception using errcode = '42501', message = 'metricool_runtime_required';
  end if;
  if p_outcome not in ('accepted', 'scheduled', 'publishing', 'published', 'cancelled', 'failed') then
    raise exception using errcode = '22023', message = 'invalid_metricool_job_outcome';
  end if;

  select *
    into v_job
  from public.yzi_imob_social_publication_jobs
  where id = p_job_id
  for update;

  if v_job.id is null or v_job.status <> 'processing' then
    raise exception using errcode = '55000', message = 'metricool_job_not_processing';
  end if;

  select *
    into v_publication
  from public.yzi_imob_social_publications
  where id = v_job.social_publication_id
    and tenant_id = v_job.tenant_id
  for update;

  if p_outcome = 'failed' then
    v_job_status := case
      when p_retry_at is not null and v_job.attempt_count < v_job.max_attempts then 'failed'
      else 'succeeded'
    end;
    v_publication_status := 'failed';
    v_event_type := case
      when v_job.operation = 'metrics_sync' then 'social_metrics_sync_failed'
      else 'social_publish_failed'
    end;

    update public.yzi_imob_social_publication_jobs
    set status = v_job_status,
        available_at = coalesce(p_retry_at, available_at),
        completed_at = case when v_job_status = 'succeeded' then now() else null end,
        last_error_code = p_error_code,
        updated_at = now()
    where id = v_job.id;

    update public.yzi_imob_social_publications
    set status = case when v_job.operation = 'metrics_sync' then status else 'failed' end,
        failed_at = case when v_job.operation = 'metrics_sync' then failed_at else now() end,
        error_code = p_error_code,
        updated_at = now()
    where id = v_publication.id
    returning status into v_publication_status;
  else
    v_job_status := case
      when p_outcome in ('scheduled', 'publishing')
        and p_retry_at is not null
        and v_job.attempt_count < v_job.max_attempts
      then 'failed'
      else 'succeeded'
    end;
    v_publication_status := p_outcome;
    v_event_type := case
      when p_outcome = 'accepted' then 'social_publish_accepted'
      when p_outcome = 'published' then 'social_publish_published'
      when p_outcome = 'cancelled' then 'social_publish_cancelled'
      else null
    end;

    update public.yzi_imob_social_publication_jobs
    set status = v_job_status,
        available_at = coalesce(p_retry_at, available_at),
        completed_at = case when v_job_status = 'succeeded' then now() else null end,
        last_error_code = null,
        updated_at = now()
    where id = v_job.id;

    update public.yzi_imob_social_publications
    set status = v_publication_status,
        external_post_id = coalesce(p_external_post_id, external_post_id),
        external_post_uuid = coalesce(p_external_post_uuid, external_post_uuid),
        external_network_post_ids = coalesce(p_external_network_post_ids, external_network_post_ids),
        external_url = coalesce(p_external_url, external_url),
        accepted_at = case when p_outcome = 'accepted' then coalesce(accepted_at, now()) else accepted_at end,
        published_at = case when p_outcome = 'published' then coalesce(published_at, now()) else published_at end,
        cancelled_at = case when p_outcome = 'cancelled' then coalesce(cancelled_at, now()) else cancelled_at end,
        last_status_sync_at = case when v_job.operation = 'status_sync' then now() else last_status_sync_at end,
        error_code = null,
        updated_at = now()
    where id = v_publication.id;

    if p_outcome = 'accepted' then
      insert into public.yzi_imob_social_publication_jobs (
        tenant_id,
        social_publication_id,
        operation,
        idempotency_key,
        available_at,
        max_attempts
      )
      values (
        v_publication.tenant_id,
        v_publication.id,
        'status_sync',
        v_publication.idempotency_key || ':status',
        greatest(now() + interval '5 minutes', v_publication.scheduled_at),
        8
      )
      on conflict (tenant_id, idempotency_key) do nothing;
    elsif p_outcome = 'published' then
      insert into public.yzi_imob_social_publication_jobs (
        tenant_id,
        social_publication_id,
        operation,
        idempotency_key,
        available_at
      )
      values (
        v_publication.tenant_id,
        v_publication.id,
        'metrics_sync',
        v_publication.idempotency_key || ':metrics',
        now() + interval '6 hours'
      )
      on conflict (tenant_id, idempotency_key) do nothing;
    end if;
  end if;

  if v_event_type is not null then
    insert into public.yzi_imob_social_publication_events (
      tenant_id,
      social_publication_id,
      job_id,
      event_type,
      error_code,
      metadata
    )
    values (
      v_publication.tenant_id,
      v_publication.id,
      v_job.id,
      v_event_type,
      p_error_code,
      jsonb_build_object('operation', v_job.operation, 'outcome', p_outcome)
    );
  end if;

  return query select v_job_status, v_publication_status;
end;
$function$;

create or replace function yzi_imob_metricool_private.persist_yzi_imob_metricool_metrics(
  p_job_id uuid,
  p_metrics jsonb
)
returns table (persisted_count integer, collected_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_job public.yzi_imob_social_publication_jobs%rowtype;
  v_publication public.yzi_imob_social_publications%rowtype;
  v_collected_at timestamptz := now();
  v_count integer := 0;
begin
  if session_user <> 'yzi_imob_metricool_runtime' then
    raise exception using errcode = '42501', message = 'metricool_runtime_required';
  end if;
  if jsonb_typeof(p_metrics) <> 'array'
    or jsonb_array_length(p_metrics) > 100
    or pg_column_size(p_metrics) > 65536
  then
    raise exception using errcode = '22023', message = 'bounded_metric_payload_required';
  end if;

  select *
    into v_job
  from public.yzi_imob_social_publication_jobs
  where id = p_job_id
    and operation = 'metrics_sync'
    and status = 'processing'
  for update;

  if v_job.id is null then
    raise exception using errcode = '55000', message = 'metricool_metrics_job_not_processing';
  end if;

  select *
    into v_publication
  from public.yzi_imob_social_publications
  where id = v_job.social_publication_id
    and tenant_id = v_job.tenant_id;

  insert into public.yzi_imob_social_metrics (
    tenant_id,
    social_publication_id,
    target_profile_id,
    network,
    metric_scope,
    provider_metric_name,
    normalized_metric_name,
    value,
    period_start,
    period_end,
    collected_at
  )
  select
    v_publication.tenant_id,
    case when metric ->> 'metric_scope' = 'post' then v_publication.id else null end,
    nullif(metric ->> 'target_profile_id', ''),
    metric ->> 'network',
    metric ->> 'metric_scope',
    metric ->> 'provider_metric_name',
    nullif(metric ->> 'normalized_metric_name', ''),
    (metric ->> 'value')::numeric,
    (metric ->> 'period_start')::timestamptz,
    (metric ->> 'period_end')::timestamptz,
    v_collected_at
  from jsonb_array_elements(p_metrics) metric
  on conflict (
    tenant_id,
    (coalesce(social_publication_id, '00000000-0000-0000-0000-000000000000'::uuid)),
    (coalesce(target_profile_id, '')),
    network,
    metric_scope,
    provider_metric_name,
    period_start,
    period_end
  )
  do update
    set value = excluded.value,
        normalized_metric_name = excluded.normalized_metric_name,
        collected_at = excluded.collected_at,
        updated_at = now();

  get diagnostics v_count = row_count;

  update public.yzi_imob_social_publications
  set last_metrics_sync_at = v_collected_at,
      updated_at = now()
  where id = v_publication.id;

  update public.yzi_imob_social_publication_jobs
  set status = 'succeeded',
      completed_at = v_collected_at,
      last_error_code = null,
      updated_at = now()
  where id = v_job.id;

  insert into public.yzi_imob_social_publication_events (
    tenant_id,
    social_publication_id,
    job_id,
    event_type,
    metadata
  )
  values (
    v_publication.tenant_id,
    v_publication.id,
    v_job.id,
    'social_metrics_synced',
    jsonb_build_object('metric_count', v_count)
  );

  return query select v_count, v_collected_at;
end;
$function$;

-- ============================================================================
-- Sanitized Connections RPC projection
-- ============================================================================

drop function public.get_yzi_imob_tenant_connections(uuid);

create function public.get_yzi_imob_tenant_connections(p_tenant_id uuid)
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
  external_user_id text,
  external_blog_id text,
  display_name text,
  validated_at timestamptz,
  disconnected_at timestamptz,
  token_expires_at timestamptz,
  last_error_code text,
  created_at timestamptz,
  updated_at timestamptz,
  assets jsonb,
  capabilities jsonb,
  pending_publications bigint,
  recent_failures bigint
)
language plpgsql
security invoker
stable
set search_path to 'pg_catalog', 'public', 'auth'
as $function$
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
    tc.external_user_id,
    tc.external_blog_id,
    tc.account_display_name,
    tc.validated_at,
    tc.disconnected_at,
    tc.token_expires_at,
    tc.last_error_code,
    tc.created_at,
    tc.updated_at,
    case
      when tc.provider = 'metricool' then coalesce((
        select jsonb_agg(
          jsonb_strip_nulls(jsonb_build_object(
            'id', a.id,
            'kind', a.kind,
            'external_account_id', a.external_account_id,
            'account_label', a.account_label,
            'network', a.metadata ->> 'network',
            'created_at', a.created_at,
            'updated_at', a.updated_at
          ))
          order by a.kind, a.account_label nulls last, a.id
        )
        from public.tenant_connection_assets a
        where a.tenant_id = tc.tenant_id
          and a.connection_id = tc.id
          and a.revoked_at is null
      ), '[]'::jsonb)
      else coalesce((
        select jsonb_agg(
          jsonb_strip_nulls(jsonb_build_object(
            'kind',
              case a.kind
                when 'page' then 'facebook_page'
                when 'instagram' then 'instagram_business'
                when 'ad_account' then 'meta_ad_account'
                else a.kind
              end,
            'account_label', a.account_label,
            'status', coalesce(a.metadata ->> 'status', a.metadata ->> 'provider_status'),
            'external_account_id',
              case
                when a.kind in ('whatsapp_business_account', 'waba', 'whatsapp_phone_number') then null
                else regexp_replace(a.external_account_id, '^(.{3}).*(.{2})$', '\1...\2')
              end,
            'revoked_at', a.revoked_at,
            'metadata',
              case
                when a.kind in ('whatsapp_business_account', 'waba') then jsonb_strip_nulls(
                  jsonb_build_object(
                    'provider_status', a.metadata ->> 'provider_status',
                    'discovery_complete', a.metadata -> 'discovery_complete',
                    'graph_confirmed', a.metadata -> 'graph_confirmed'
                  )
                )
                when a.kind = 'whatsapp_phone_number' then jsonb_strip_nulls(
                  jsonb_build_object(
                    'verified_name', a.metadata ->> 'verified_name',
                    'provider_status', a.metadata ->> 'provider_status',
                    'code_verification_status', a.metadata ->> 'code_verification_status',
                    'platform_type', a.metadata ->> 'platform_type',
                    'discovery_complete', a.metadata -> 'discovery_complete'
                  )
                )
                else jsonb_strip_nulls(jsonb_build_object(
                  'normalized_kind',
                    case a.kind
                      when 'page' then 'facebook_page'
                      when 'instagram' then 'instagram_business'
                      when 'ad_account' then 'meta_ad_account'
                      else a.kind
                    end,
                  'status', coalesce(a.metadata ->> 'status', a.metadata ->> 'provider_status'),
                  'display_name', a.metadata ->> 'display_name',
                  'health_reason', a.metadata ->> 'health_reason'
                ))
              end
          ))
          order by
            case a.kind
              when 'whatsapp_phone_number' then 1
              when 'whatsapp_business_account' then 2
              when 'waba' then 2
              else 3
            end,
            a.account_label nulls last,
            a.id
        )
        from public.tenant_connection_assets a
        where a.tenant_id = tc.tenant_id
          and a.connection_id = tc.id
          and a.revoked_at is null
      ), '[]'::jsonb)
    end,
    case
      when tc.provider = 'metricool' then coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'capability_id', capability,
            'unlocked', tc.status in ('active', 'connected'),
            'source', 'validated'
          )
          order by capability
        )
        from unnest(tc.capabilities) capability
      ), '[]'::jsonb)
      else jsonb_build_array(
        jsonb_build_object(
          'capability_id', 'ler-metricas',
          'unlocked',
            tc.status in ('connected', 'token_expiring')
            and (
              (
                'pages_read_engagement' = any (tc.granted_scopes)
                and exists (
                  select 1 from public.tenant_connection_assets a
                  where a.connection_id = tc.id and a.revoked_at is null and a.kind = 'page'
                )
              )
              or (
                'instagram_basic' = any (tc.granted_scopes)
                and exists (
                  select 1 from public.tenant_connection_assets a
                  where a.connection_id = tc.id and a.revoked_at is null and a.kind = 'instagram'
                )
              )
              or (
                'ads_read' = any (tc.granted_scopes)
                and exists (
                  select 1 from public.tenant_connection_assets a
                  where a.connection_id = tc.id and a.revoked_at is null and a.kind = 'ad_account'
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
              select 1 from public.tenant_connection_assets a
              where a.connection_id = tc.id and a.revoked_at is null and a.kind = 'ad_account'
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
                  select 1 from public.tenant_connection_assets a
                  where a.connection_id = tc.id and a.revoked_at is null and a.kind = 'page'
                )
              )
              or (
                'instagram_content_publish' = any (tc.granted_scopes)
                and exists (
                  select 1 from public.tenant_connection_assets a
                  where a.connection_id = tc.id and a.revoked_at is null and a.kind = 'instagram'
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
              select 1 from public.tenant_connection_assets a
              where a.connection_id = tc.id and a.revoked_at is null and a.kind = 'ad_account'
            ),
          'source', 'derived'
        )
      )
    end,
    case when tc.provider = 'metricool' then (
      select count(*)
      from public.yzi_imob_social_publications sp
      where sp.tenant_id = tc.tenant_id
        and sp.connection_id = tc.id
        and sp.status in ('queued', 'dispatching', 'accepted', 'scheduled', 'publishing')
    ) else 0 end,
    case when tc.provider = 'metricool' then (
      select count(*)
      from public.yzi_imob_social_publications sp
      where sp.tenant_id = tc.tenant_id
        and sp.connection_id = tc.id
        and sp.status = 'failed'
        and sp.failed_at >= now() - interval '7 days'
    ) else 0 end
  from public.tenant_connections tc
  where tc.tenant_id = p_tenant_id
    and tc.revoked_at is null
    and tc.status <> 'revoked'
  order by tc.provider, tc.catalog_id, tc.created_at;
end;
$function$;

revoke all on function public.request_yzi_imob_metricool_configuration(uuid)
  from public, anon, authenticated;
grant execute on function public.request_yzi_imob_metricool_configuration(uuid)
  to authenticated;

revoke all on function public.request_yzi_imob_metricool_validation(uuid)
  from public, anon, authenticated;
grant execute on function public.request_yzi_imob_metricool_validation(uuid)
  to authenticated;

revoke all on function public.disconnect_yzi_imob_metricool_connection(uuid)
  from public, anon, authenticated;
grant execute on function public.disconnect_yzi_imob_metricool_connection(uuid)
  to authenticated;

revoke all on function public.enqueue_yzi_imob_metricool_publication(
  uuid, uuid, text[], text[], text, text, uuid[], timestamptz, text
) from public, anon, authenticated;
grant execute on function public.enqueue_yzi_imob_metricool_publication(
  uuid, uuid, text[], text[], text, text, uuid[], timestamptz, text
) to authenticated;

revoke all on function public.cancel_yzi_imob_metricool_publication(uuid)
  from public, anon, authenticated;
grant execute on function public.cancel_yzi_imob_metricool_publication(uuid)
  to authenticated;

revoke all on function public.retry_yzi_imob_metricool_publication(uuid, text)
  from public, anon, authenticated;
grant execute on function public.retry_yzi_imob_metricool_publication(uuid, text)
  to authenticated;

revoke all on function yzi_imob_metricool_private.claim_yzi_imob_metricool_jobs(integer)
  from public, anon, authenticated, service_role,
    yzi_imob_metricool_executor, yzi_imob_metricool_runtime;
grant execute on function yzi_imob_metricool_private.claim_yzi_imob_metricool_jobs(integer)
  to yzi_imob_metricool_executor;

revoke all on function yzi_imob_metricool_private.complete_yzi_imob_metricool_job(
  uuid, text, text, text, jsonb, text, text, timestamptz
) from public, anon, authenticated, service_role,
    yzi_imob_metricool_executor, yzi_imob_metricool_runtime;
grant execute on function yzi_imob_metricool_private.complete_yzi_imob_metricool_job(
  uuid, text, text, text, jsonb, text, text, timestamptz
) to yzi_imob_metricool_executor;

revoke all on function yzi_imob_metricool_private.persist_yzi_imob_metricool_metrics(uuid, jsonb)
  from public, anon, authenticated, service_role,
    yzi_imob_metricool_executor, yzi_imob_metricool_runtime;
grant execute on function yzi_imob_metricool_private.persist_yzi_imob_metricool_metrics(uuid, jsonb)
  to yzi_imob_metricool_executor;

revoke all on function yzi_imob_metricool_private.claim_yzi_imob_metricool_validations(integer)
  from public, anon, authenticated, service_role,
    yzi_imob_metricool_executor, yzi_imob_metricool_runtime;
grant execute on function yzi_imob_metricool_private.claim_yzi_imob_metricool_validations(integer)
  to yzi_imob_metricool_executor;

revoke all on function yzi_imob_metricool_private.recover_yzi_imob_metricool_jobs(integer, integer)
  from public, anon, authenticated, service_role,
    yzi_imob_metricool_executor, yzi_imob_metricool_runtime;
grant execute on function yzi_imob_metricool_private.recover_yzi_imob_metricool_jobs(integer, integer)
  to yzi_imob_metricool_executor;

revoke all on function yzi_imob_metricool_private.complete_yzi_imob_metricool_validation(
  uuid, text, text, text[], jsonb, text
) from public, anon, authenticated, service_role,
    yzi_imob_metricool_executor, yzi_imob_metricool_runtime;
grant execute on function yzi_imob_metricool_private.complete_yzi_imob_metricool_validation(
  uuid, text, text, text[], jsonb, text
) to yzi_imob_metricool_executor;

revoke all on function public.record_yzi_imob_metricool_job_dispatch()
  from public, anon, authenticated, service_role,
    yzi_imob_metricool_executor, yzi_imob_metricool_runtime;

revoke all on function public.get_yzi_imob_tenant_connections(uuid)
  from public, anon, authenticated;
grant execute on function public.get_yzi_imob_tenant_connections(uuid)
  to authenticated;

comment on function yzi_imob_metricool_private.claim_yzi_imob_metricool_jobs(integer) is
  'Bounded dedicated-runtime-only Metricool runner claim. Secret is read from Vault and never exposed to authenticated clients.';

commit;
