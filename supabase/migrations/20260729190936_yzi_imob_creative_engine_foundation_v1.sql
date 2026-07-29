begin;

-- YZI IMOB - Creative Engine foundation v1.
--
-- Canonical input is always a tenant-owned property plus its governed property
-- media. This migration creates no generic media workflow, external renderer,
-- external publication, provider credential, or browser-side secret.

alter table public.yzi_imob_property_media
  add constraint yzi_imob_property_media_identity_unique
    unique (id, tenant_id, property_id);

create table public.yzi_imob_creative_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null,
  status text not null default 'queued',
  objective text not null,
  desired_formats text[] not null,
  intended_channels text[] not null,
  context jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  created_by_user_id uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz null,
  constraint yzi_imob_creative_requests_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_creative_requests_identity_unique
    unique (id, tenant_id, property_id),
  constraint yzi_imob_creative_requests_idempotency_unique
    unique (tenant_id, property_id, idempotency_key),
  constraint yzi_imob_creative_requests_status_check
    check (
      status = any (
        array[
          'queued',
          'generating',
          'in_review',
          'changes_requested',
          'approved',
          'completed',
          'failed',
          'cancelled'
        ]::text[]
      )
    ),
  constraint yzi_imob_creative_requests_objective_check
    check (
      objective = btrim(objective)
      and length(objective) between 3 and 1000
    ),
  constraint yzi_imob_creative_requests_formats_check
    check (
      cardinality(desired_formats) between 1 and 2
      and array_position(desired_formats, null) is null
      and desired_formats <@ array['carousel', 'video_tour']::text[]
    ),
  constraint yzi_imob_creative_requests_channels_check
    check (
      cardinality(intended_channels) between 1 and 10
      and array_position(intended_channels, null) is null
      and array_to_string(intended_channels, ',') ~ '^[a-z0-9_]+(?:,[a-z0-9_]+)*$'
    ),
  constraint yzi_imob_creative_requests_context_check
    check (
      jsonb_typeof(context) = 'object'
      and pg_column_size(context) <= 16384
    ),
  constraint yzi_imob_creative_requests_key_check
    check (
      idempotency_key = btrim(idempotency_key)
      and length(idempotency_key) between 1 and 200
    ),
  constraint yzi_imob_creative_requests_completion_check
    check (
      (status = 'completed' and completed_at is not null)
      or (status <> 'completed' and completed_at is null)
    )
);

create index yzi_imob_creative_requests_property_idx
  on public.yzi_imob_creative_requests (tenant_id, property_id, created_at desc);

create table public.yzi_imob_creative_deliverables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null,
  request_id uuid not null,
  deliverable_type text not null,
  status text not null default 'planned',
  current_revision_id uuid null,
  approved_revision_id uuid null,
  publication_eligible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_creative_deliverables_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_creative_deliverables_request_fkey
    foreign key (request_id, tenant_id, property_id)
    references public.yzi_imob_creative_requests (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_creative_deliverables_identity_unique
    unique (id, tenant_id, property_id, request_id),
  constraint yzi_imob_creative_deliverables_request_type_unique
    unique (tenant_id, request_id, deliverable_type),
  constraint yzi_imob_creative_deliverables_type_check
    check (deliverable_type = any (array['carousel', 'video_tour']::text[])),
  constraint yzi_imob_creative_deliverables_status_check
    check (
      status = any (
        array[
          'planned',
          'generating',
          'in_review',
          'changes_requested',
          'approved',
          'failed',
          'cancelled'
        ]::text[]
      )
    ),
  constraint yzi_imob_creative_deliverables_eligibility_check
    check (
      (
        publication_eligible
        and status = 'approved'
        and approved_revision_id is not null
        and approved_revision_id = current_revision_id
      )
      or (not publication_eligible)
    )
);

create index yzi_imob_creative_deliverables_request_idx
  on public.yzi_imob_creative_deliverables
    (tenant_id, property_id, request_id, created_at);

create table public.yzi_imob_creative_revisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null,
  request_id uuid not null,
  deliverable_id uuid not null,
  revision_number integer not null,
  status text not null default 'in_review',
  content_snapshot jsonb not null,
  content_hash text not null,
  review_observation text null,
  created_by_user_id uuid not null references auth.users (id) on delete restrict,
  decided_by_user_id uuid null references auth.users (id) on delete set null,
  decided_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_creative_revisions_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_creative_revisions_request_fkey
    foreign key (request_id, tenant_id, property_id)
    references public.yzi_imob_creative_requests (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_creative_revisions_deliverable_fkey
    foreign key (deliverable_id, tenant_id, property_id, request_id)
    references public.yzi_imob_creative_deliverables (id, tenant_id, property_id, request_id)
    on delete restrict,
  constraint yzi_imob_creative_revisions_identity_unique
    unique (id, tenant_id, property_id, request_id, deliverable_id),
  constraint yzi_imob_creative_revisions_number_unique
    unique (tenant_id, deliverable_id, revision_number),
  constraint yzi_imob_creative_revisions_number_check
    check (revision_number >= 1),
  constraint yzi_imob_creative_revisions_status_check
    check (
      status = any (
        array[
          'in_review',
          'approved',
          'changes_requested',
          'rejected',
          'superseded'
        ]::text[]
      )
    ),
  constraint yzi_imob_creative_revisions_snapshot_check
    check (
      jsonb_typeof(content_snapshot) = 'object'
      and content_snapshot ->> 'property_id' = property_id::text
      and content_snapshot ->> 'request_id' = request_id::text
      and content_snapshot ->> 'deliverable_id' = deliverable_id::text
      and content_snapshot ->> 'contract_version' = '2026-07-29.v1'
      and content_snapshot ->> 'deliverable_type' = any (array['carousel', 'video_tour']::text[])
      and pg_column_size(content_snapshot) <= 65536
    ),
  constraint yzi_imob_creative_revisions_hash_check
    check (content_hash ~ '^[a-f0-9]{64}$'),
  constraint yzi_imob_creative_revisions_decision_check
    check (
      (status = 'in_review' and decided_by_user_id is null and decided_at is null)
      or (
        status <> 'in_review'
        and decided_by_user_id is not null
        and decided_at is not null
      )
    ),
  constraint yzi_imob_creative_revisions_observation_check
    check (
      review_observation is null
      or length(btrim(review_observation)) between 1 and 1000
    )
);

alter table public.yzi_imob_creative_deliverables
  add constraint yzi_imob_creative_deliverables_current_revision_fkey
    foreign key (current_revision_id, tenant_id, property_id, request_id, id)
    references public.yzi_imob_creative_revisions
      (id, tenant_id, property_id, request_id, deliverable_id)
    on delete restrict,
  add constraint yzi_imob_creative_deliverables_approved_revision_fkey
    foreign key (approved_revision_id, tenant_id, property_id, request_id, id)
    references public.yzi_imob_creative_revisions
      (id, tenant_id, property_id, request_id, deliverable_id)
    on delete restrict;

create index yzi_imob_creative_revisions_deliverable_idx
  on public.yzi_imob_creative_revisions
    (tenant_id, property_id, deliverable_id, revision_number desc);

create table public.yzi_imob_creative_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null,
  request_id uuid not null,
  deliverable_id uuid null,
  revision_id uuid null,
  source_property_media_id uuid null,
  asset_role text not null,
  media_type text not null,
  synthetic_uri text null,
  content_hash text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint yzi_imob_creative_assets_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_creative_assets_request_fkey
    foreign key (request_id, tenant_id, property_id)
    references public.yzi_imob_creative_requests (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_creative_assets_source_media_fkey
    foreign key (source_property_media_id, tenant_id, property_id)
    references public.yzi_imob_property_media (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_creative_assets_deliverable_fkey
    foreign key (deliverable_id, tenant_id, property_id, request_id)
    references public.yzi_imob_creative_deliverables (id, tenant_id, property_id, request_id)
    on delete restrict,
  constraint yzi_imob_creative_assets_revision_fkey
    foreign key (revision_id, tenant_id, property_id, request_id, deliverable_id)
    references public.yzi_imob_creative_revisions
      (id, tenant_id, property_id, request_id, deliverable_id)
    on delete restrict,
  constraint yzi_imob_creative_assets_role_check
    check (asset_role = any (array['source_media', 'synthetic_output']::text[])),
  constraint yzi_imob_creative_assets_media_type_check
    check (media_type = any (array['image', 'video', 'structured']::text[])),
  constraint yzi_imob_creative_assets_source_check
    check (
      (
        asset_role = 'source_media'
        and source_property_media_id is not null
        and deliverable_id is null
        and revision_id is null
        and synthetic_uri is null
        and content_hash is null
      )
      or (
        asset_role = 'synthetic_output'
        and source_property_media_id is null
        and deliverable_id is not null
        and revision_id is not null
        and synthetic_uri ~ '^yzi://creative/[a-f0-9-]+/[a-f0-9-]+$'
        and content_hash ~ '^[a-f0-9]{64}$'
      )
    ),
  constraint yzi_imob_creative_assets_metadata_check
    check (
      jsonb_typeof(metadata) = 'object'
      and pg_column_size(metadata) <= 16384
    ),
  constraint yzi_imob_creative_assets_source_unique
    unique (tenant_id, request_id, source_property_media_id)
);

create index yzi_imob_creative_assets_request_idx
  on public.yzi_imob_creative_assets
    (tenant_id, property_id, request_id, created_at);

create table public.yzi_imob_creative_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null,
  request_id uuid not null,
  status text not null default 'queued',
  idempotency_key text not null,
  correlation_id uuid not null default gen_random_uuid(),
  attempt_count integer not null default 0,
  max_attempts integer not null default 1,
  last_error_code text null,
  started_at timestamptz null,
  completed_at timestamptz null,
  created_by_user_id uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_creative_generation_jobs_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_creative_generation_jobs_request_fkey
    foreign key (request_id, tenant_id, property_id)
    references public.yzi_imob_creative_requests (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_creative_generation_jobs_identity_unique
    unique (id, tenant_id, property_id, request_id),
  constraint yzi_imob_creative_generation_jobs_request_unique
    unique (tenant_id, request_id),
  constraint yzi_imob_creative_generation_jobs_idempotency_unique
    unique (tenant_id, property_id, idempotency_key),
  constraint yzi_imob_creative_generation_jobs_status_check
    check (status = any (array['queued', 'processing', 'succeeded', 'failed', 'cancelled']::text[])),
  constraint yzi_imob_creative_generation_jobs_key_check
    check (
      idempotency_key = btrim(idempotency_key)
      and length(idempotency_key) between 1 and 200
    ),
  constraint yzi_imob_creative_generation_jobs_attempts_check
    check (
      attempt_count between 0 and max_attempts
      and max_attempts between 1 and 3
    ),
  constraint yzi_imob_creative_generation_jobs_error_check
    check (
      last_error_code is null
      or last_error_code ~ '^[a-z0-9_]{1,80}$'
    ),
  constraint yzi_imob_creative_generation_jobs_timing_check
    check (
      (status = 'queued' and started_at is null and completed_at is null)
      or (status = 'processing' and started_at is not null and completed_at is null)
      or (status in ('succeeded', 'failed', 'cancelled') and completed_at is not null)
    )
);

create index yzi_imob_creative_generation_jobs_claim_idx
  on public.yzi_imob_creative_generation_jobs (status, created_at)
  where status = 'queued';

create table public.yzi_imob_creative_generation_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null,
  request_id uuid not null,
  deliverable_id uuid null,
  revision_id uuid null,
  job_id uuid null,
  event_type text not null,
  actor_user_id uuid null references auth.users (id) on delete set null,
  correlation_id uuid null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint yzi_imob_creative_generation_events_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_creative_generation_events_request_fkey
    foreign key (request_id, tenant_id, property_id)
    references public.yzi_imob_creative_requests (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_creative_generation_events_deliverable_fkey
    foreign key (deliverable_id, tenant_id, property_id, request_id)
    references public.yzi_imob_creative_deliverables (id, tenant_id, property_id, request_id)
    on delete restrict,
  constraint yzi_imob_creative_generation_events_revision_fkey
    foreign key (revision_id, tenant_id, property_id, request_id, deliverable_id)
    references public.yzi_imob_creative_revisions
      (id, tenant_id, property_id, request_id, deliverable_id)
    on delete restrict,
  constraint yzi_imob_creative_generation_events_job_fkey
    foreign key (job_id, tenant_id, property_id, request_id)
    references public.yzi_imob_creative_generation_jobs (id, tenant_id, property_id, request_id)
    on delete restrict,
  constraint yzi_imob_creative_generation_events_revision_shape_check
    check (revision_id is null or deliverable_id is not null),
  constraint yzi_imob_creative_generation_events_type_check
    check (
      event_type = any (
        array[
          'request_created',
          'job_queued',
          'job_started',
          'revision_created',
          'job_succeeded',
          'job_failed',
          'revision_approved',
          'changes_requested',
          'revision_rejected',
          'request_approved',
          'request_completed'
        ]::text[]
      )
    ),
  constraint yzi_imob_creative_generation_events_metadata_check
    check (
      jsonb_typeof(metadata) = 'object'
      and pg_column_size(metadata) <= 4096
    )
);

create index yzi_imob_creative_generation_events_request_idx
  on public.yzi_imob_creative_generation_events
    (tenant_id, property_id, request_id, created_at);

create or replace function public.guard_yzi_imob_creative_revision_immutability()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
begin
  if old.id is distinct from new.id
    or old.tenant_id is distinct from new.tenant_id
    or old.property_id is distinct from new.property_id
    or old.request_id is distinct from new.request_id
    or old.deliverable_id is distinct from new.deliverable_id
    or old.revision_number is distinct from new.revision_number
    or old.content_snapshot is distinct from new.content_snapshot
    or old.content_hash is distinct from new.content_hash
    or old.created_by_user_id is distinct from new.created_by_user_id
    or old.created_at is distinct from new.created_at
  then
    raise exception using errcode = '55000', message = 'creative_revision_content_is_immutable';
  end if;

  return new;
end;
$function$;

create trigger yzi_imob_creative_revisions_guard_immutability
before update on public.yzi_imob_creative_revisions
for each row execute function public.guard_yzi_imob_creative_revision_immutability();

create or replace function public.guard_yzi_imob_creative_event_append_only()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
begin
  raise exception using errcode = '55000', message = 'creative_generation_events_are_append_only';
end;
$function$;

create trigger yzi_imob_creative_generation_events_guard_append_only
before update or delete on public.yzi_imob_creative_generation_events
for each row execute function public.guard_yzi_imob_creative_event_append_only();

create trigger yzi_imob_creative_requests_set_updated_at
before update on public.yzi_imob_creative_requests
for each row execute function public.yzi_set_updated_at();

create trigger yzi_imob_creative_deliverables_set_updated_at
before update on public.yzi_imob_creative_deliverables
for each row execute function public.yzi_set_updated_at();

create trigger yzi_imob_creative_revisions_set_updated_at
before update on public.yzi_imob_creative_revisions
for each row execute function public.yzi_set_updated_at();

create trigger yzi_imob_creative_generation_jobs_set_updated_at
before update on public.yzi_imob_creative_generation_jobs
for each row execute function public.yzi_set_updated_at();

alter table public.yzi_imob_creative_requests enable row level security;
alter table public.yzi_imob_creative_deliverables enable row level security;
alter table public.yzi_imob_creative_revisions enable row level security;
alter table public.yzi_imob_creative_assets enable row level security;
alter table public.yzi_imob_creative_generation_jobs enable row level security;
alter table public.yzi_imob_creative_generation_events enable row level security;

create policy yzi_imob_creative_requests_select_member
  on public.yzi_imob_creative_requests
  for select
  to authenticated
  using (
    tenant_id in (
      select tm.tenant_id
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create policy yzi_imob_creative_deliverables_select_member
  on public.yzi_imob_creative_deliverables
  for select
  to authenticated
  using (
    tenant_id in (
      select tm.tenant_id
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create policy yzi_imob_creative_revisions_select_member
  on public.yzi_imob_creative_revisions
  for select
  to authenticated
  using (
    tenant_id in (
      select tm.tenant_id
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create policy yzi_imob_creative_assets_select_member
  on public.yzi_imob_creative_assets
  for select
  to authenticated
  using (
    tenant_id in (
      select tm.tenant_id
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create policy yzi_imob_creative_generation_jobs_select_member
  on public.yzi_imob_creative_generation_jobs
  for select
  to authenticated
  using (
    tenant_id in (
      select tm.tenant_id
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create policy yzi_imob_creative_generation_events_select_member
  on public.yzi_imob_creative_generation_events
  for select
  to authenticated
  using (
    tenant_id in (
      select tm.tenant_id
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

revoke all
  on table
    public.yzi_imob_creative_requests,
    public.yzi_imob_creative_deliverables,
    public.yzi_imob_creative_revisions,
    public.yzi_imob_creative_assets,
    public.yzi_imob_creative_generation_jobs,
    public.yzi_imob_creative_generation_events
  from public, anon;

grant select
  on table
    public.yzi_imob_creative_requests,
    public.yzi_imob_creative_deliverables,
    public.yzi_imob_creative_revisions,
    public.yzi_imob_creative_assets,
    public.yzi_imob_creative_generation_jobs,
    public.yzi_imob_creative_generation_events
  to authenticated;

grant all
  on table
    public.yzi_imob_creative_requests,
    public.yzi_imob_creative_deliverables,
    public.yzi_imob_creative_revisions,
    public.yzi_imob_creative_assets,
    public.yzi_imob_creative_generation_jobs,
    public.yzi_imob_creative_generation_events
  to service_role;

create or replace function public.create_yzi_imob_creative_request(
  p_property_id uuid,
  p_objective text,
  p_formats text[],
  p_channels text[],
  p_source_media_ids uuid[],
  p_context jsonb,
  p_idempotency_key text
)
returns table (
  request_id uuid,
  job_id uuid,
  request_status text,
  reused boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_tenant_id uuid;
  v_request public.yzi_imob_creative_requests%rowtype;
  v_job public.yzi_imob_creative_generation_jobs%rowtype;
  v_objective text := btrim(coalesce(p_objective, ''));
  v_formats text[];
  v_channels text[];
  v_media_ids uuid[];
  v_context jsonb := coalesce(p_context, '{}'::jsonb);
  v_key text := btrim(coalesce(p_idempotency_key, ''));
  v_source_count integer;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  select p.tenant_id
    into v_tenant_id
  from public.yzi_imob_properties p
  join public.tenant_memberships tm
    on tm.tenant_id = p.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin', 'operator']::text[])
  join public.tenants t
    on t.id = p.tenant_id
   and t.status = 'active'
  where p.id = p_property_id
  limit 1;

  if v_tenant_id is null then
    raise exception using errcode = '42501', message = 'property_not_found_or_forbidden';
  end if;

  select coalesce(array_agg(distinct format order by format), '{}'::text[])
    into v_formats
  from unnest(coalesce(p_formats, '{}'::text[])) format;

  select coalesce(array_agg(distinct lower(btrim(channel)) order by lower(btrim(channel))), '{}'::text[])
    into v_channels
  from unnest(coalesce(p_channels, '{}'::text[])) channel;

  select coalesce(array_agg(distinct media_id order by media_id), '{}'::uuid[])
    into v_media_ids
  from unnest(coalesce(p_source_media_ids, '{}'::uuid[])) media_id;

  if length(v_objective) not between 3 and 1000
    or cardinality(v_formats) not between 1 and 2
    or array_position(v_formats, null) is not null
    or not (v_formats <@ array['carousel', 'video_tour']::text[])
    or cardinality(v_channels) not between 1 and 10
    or array_position(v_channels, null) is not null
    or exists (
      select 1
      from unnest(v_channels) channel
      where channel !~ '^[a-z0-9_]{1,40}$'
    )
    or jsonb_typeof(v_context) <> 'object'
    or pg_column_size(v_context) > 16384
    or length(v_key) not between 1 and 200
  then
    raise exception using errcode = '22023', message = 'invalid_creative_request';
  end if;

  perform pg_advisory_xact_lock(
    hashtext(v_tenant_id::text || ':' || p_property_id::text || ':' || v_key)
  );

  select r.*
    into v_request
  from public.yzi_imob_creative_requests r
  where r.tenant_id = v_tenant_id
    and r.property_id = p_property_id
    and r.idempotency_key = v_key;

  if v_request.id is not null then
    if v_request.objective <> v_objective
      or v_request.desired_formats <> v_formats
      or v_request.intended_channels <> v_channels
      or v_request.context <> v_context
      or (
        select coalesce(array_agg(a.source_property_media_id order by a.source_property_media_id), '{}'::uuid[])
        from public.yzi_imob_creative_assets a
        where a.tenant_id = v_tenant_id
          and a.request_id = v_request.id
          and a.asset_role = 'source_media'
      ) <> v_media_ids
    then
      raise exception using errcode = '23505', message = 'creative_request_idempotency_conflict';
    end if;

    select j.*
      into v_job
    from public.yzi_imob_creative_generation_jobs j
    where j.tenant_id = v_tenant_id
      and j.request_id = v_request.id;

    return query select v_request.id, v_job.id, v_request.status, true;
    return;
  end if;

  select count(*)
    into v_source_count
  from public.yzi_imob_property_media media
  where media.tenant_id = v_tenant_id
    and media.property_id = p_property_id
    and media.id = any (v_media_ids)
    and media.is_publication_allowed
    and media.processing_status = 'ready';

  if cardinality(v_media_ids) < 1 or v_source_count <> cardinality(v_media_ids) then
    raise exception using errcode = '22023', message = 'invalid_or_unready_property_media';
  end if;

  insert into public.yzi_imob_creative_requests (
    tenant_id,
    property_id,
    objective,
    desired_formats,
    intended_channels,
    context,
    idempotency_key,
    created_by_user_id
  )
  values (
    v_tenant_id,
    p_property_id,
    v_objective,
    v_formats,
    v_channels,
    v_context,
    v_key,
    v_user_id
  )
  returning *
  into v_request;

  insert into public.yzi_imob_creative_deliverables (
    tenant_id,
    property_id,
    request_id,
    deliverable_type
  )
  select
    v_tenant_id,
    p_property_id,
    v_request.id,
    format
  from unnest(v_formats) format;

  insert into public.yzi_imob_creative_assets (
    tenant_id,
    property_id,
    request_id,
    source_property_media_id,
    asset_role,
    media_type,
    metadata
  )
  select
    v_tenant_id,
    p_property_id,
    v_request.id,
    media.id,
    'source_media',
    media.media_type,
    jsonb_build_object('sort_order', media.sort_order, 'is_cover', media.is_cover)
  from public.yzi_imob_property_media media
  where media.tenant_id = v_tenant_id
    and media.property_id = p_property_id
    and media.id = any (v_media_ids);

  insert into public.yzi_imob_creative_generation_jobs (
    tenant_id,
    property_id,
    request_id,
    idempotency_key,
    created_by_user_id
  )
  values (
    v_tenant_id,
    p_property_id,
    v_request.id,
    'generate:' || v_key,
    v_user_id
  )
  returning *
  into v_job;

  insert into public.yzi_imob_creative_generation_events (
    tenant_id,
    property_id,
    request_id,
    job_id,
    event_type,
    actor_user_id,
    correlation_id,
    metadata
  )
  values
    (
      v_tenant_id,
      p_property_id,
      v_request.id,
      v_job.id,
      'request_created',
      v_user_id,
      v_job.correlation_id,
      jsonb_build_object('formats', v_formats, 'source_media_count', v_source_count)
    ),
    (
      v_tenant_id,
      p_property_id,
      v_request.id,
      v_job.id,
      'job_queued',
      v_user_id,
      v_job.correlation_id,
      '{}'::jsonb
    );

  return query select v_request.id, v_job.id, v_request.status, false;
end;
$function$;

create or replace function public.start_yzi_imob_creative_generation_job(
  p_job_id uuid
)
returns table (
  job_id uuid,
  request_id uuid,
  job_status text
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_job public.yzi_imob_creative_generation_jobs%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  select j.*
    into v_job
  from public.yzi_imob_creative_generation_jobs j
  join public.tenant_memberships tm
    on tm.tenant_id = j.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin', 'operator']::text[])
  join public.tenants t
    on t.id = j.tenant_id
   and t.status = 'active'
  where j.id = p_job_id
  for update of j;

  if v_job.id is null then
    raise exception using errcode = '42501', message = 'creative_job_not_found_or_forbidden';
  end if;

  if v_job.status = 'processing' then
    return query select v_job.id, v_job.request_id, v_job.status;
    return;
  end if;

  if v_job.status = 'succeeded' then
    return query select v_job.id, v_job.request_id, v_job.status;
    return;
  end if;

  if v_job.status <> 'queued' then
    raise exception using errcode = '55000', message = 'creative_job_not_startable';
  end if;

  update public.yzi_imob_creative_generation_jobs j
  set status = 'processing',
      attempt_count = attempt_count + 1,
      started_at = now(),
      updated_at = now()
  where j.id = v_job.id
  returning *
  into v_job;

  update public.yzi_imob_creative_requests
  set status = 'generating',
      updated_at = now()
  where id = v_job.request_id;

  update public.yzi_imob_creative_deliverables
  set status = 'generating',
      updated_at = now()
  where request_id = v_job.request_id;

  insert into public.yzi_imob_creative_generation_events (
    tenant_id,
    property_id,
    request_id,
    job_id,
    event_type,
    actor_user_id,
    correlation_id
  )
  values (
    v_job.tenant_id,
    v_job.property_id,
    v_job.request_id,
    v_job.id,
    'job_started',
    v_user_id,
    v_job.correlation_id
  );

  return query select v_job.id, v_job.request_id, v_job.status;
end;
$function$;

create or replace function public.complete_yzi_imob_creative_generation_job(
  p_job_id uuid
)
returns table (
  job_id uuid,
  request_id uuid,
  job_status text,
  revision_count integer
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_job public.yzi_imob_creative_generation_jobs%rowtype;
  v_request public.yzi_imob_creative_requests%rowtype;
  v_deliverable public.yzi_imob_creative_deliverables%rowtype;
  v_revision public.yzi_imob_creative_revisions%rowtype;
  v_hash text;
  v_snapshot jsonb;
  v_source_media_id uuid;
  v_count integer := 0;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  select j.*
    into v_job
  from public.yzi_imob_creative_generation_jobs j
  join public.tenant_memberships tm
    on tm.tenant_id = j.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin', 'operator']::text[])
  join public.tenants t
    on t.id = j.tenant_id
   and t.status = 'active'
  where j.id = p_job_id
  for update of j;

  if v_job.id is null then
    raise exception using errcode = '42501', message = 'creative_job_not_found_or_forbidden';
  end if;

  if v_job.status = 'succeeded' then
    select count(*)::integer
      into v_count
    from public.yzi_imob_creative_revisions r
    where r.tenant_id = v_job.tenant_id
      and r.request_id = v_job.request_id;
    return query select v_job.id, v_job.request_id, v_job.status, v_count;
    return;
  end if;

  if v_job.status <> 'processing' then
    raise exception using errcode = '55000', message = 'creative_job_not_processing';
  end if;

  select r.*
    into v_request
  from public.yzi_imob_creative_requests r
  where r.id = v_job.request_id
    and r.tenant_id = v_job.tenant_id
    and r.property_id = v_job.property_id;

  select a.source_property_media_id
    into v_source_media_id
  from public.yzi_imob_creative_assets a
  where a.tenant_id = v_request.tenant_id
    and a.property_id = v_request.property_id
    and a.request_id = v_request.id
    and a.asset_role = 'source_media'
  order by coalesce((a.metadata ->> 'sort_order')::integer, 0), a.id
  limit 1;

  if v_source_media_id is null then
    raise exception using errcode = '55000', message = 'creative_source_media_missing';
  end if;

  for v_deliverable in
    select d.*
    from public.yzi_imob_creative_deliverables d
    where d.tenant_id = v_request.tenant_id
      and d.property_id = v_request.property_id
      and d.request_id = v_request.id
    order by d.deliverable_type
  loop
    v_snapshot := jsonb_build_object(
      'contract_version', '2026-07-29.v1',
      'property_id', v_request.property_id,
      'request_id', v_request.id,
      'deliverable_id', v_deliverable.id,
      'deliverable_type', v_deliverable.deliverable_type,
      'channels', v_request.intended_channels,
      'objective', v_request.objective,
      'synthetic', true,
      'rendered', false,
      'publication_contract', jsonb_build_object(
        'property_id', v_request.property_id,
        'creative_revision_required', true,
        'external_publication_allowed', false
      ),
      'blueprint',
        case v_deliverable.deliverable_type
          when 'carousel' then jsonb_build_object(
            'kind', 'carousel_blueprint',
            'slides', jsonb_build_array(
              jsonb_build_object(
                'order', 1,
                'role', 'cover',
                'headline', 'Apresentação do imóvel',
                'sourceMediaId', v_source_media_id
              ),
              jsonb_build_object(
                'order', 2,
                'role', 'details',
                'headline', 'Conheça os detalhes',
                'sourceMediaId', null
              ),
              jsonb_build_object(
                'order', 3,
                'role', 'call_to_action',
                'headline', 'Agende uma visita',
                'sourceMediaId', null
              )
            )
          )
          else jsonb_build_object(
            'kind', 'video_tour_blueprint',
            'durationSeconds', 4,
            'scenes', jsonb_build_array(
              jsonb_build_object(
                'order', 1,
                'durationSeconds', 4,
                'direction', 'Percurso visual do imóvel',
                'sourceMediaId', v_source_media_id
              )
            )
          )
        end
    );
    v_hash := md5(v_snapshot::text) || md5('yzi-imob:' || v_snapshot::text);

    if exists (
      select 1
      from public.yzi_imob_creative_revisions r
      where r.tenant_id = v_deliverable.tenant_id
        and r.deliverable_id = v_deliverable.id
    ) then
      raise exception using errcode = '55000', message = 'creative_revision_already_exists';
    end if;

    insert into public.yzi_imob_creative_revisions (
      tenant_id,
      property_id,
      request_id,
      deliverable_id,
      revision_number,
      content_snapshot,
      content_hash,
      created_by_user_id
    )
    values (
      v_request.tenant_id,
      v_request.property_id,
      v_request.id,
      v_deliverable.id,
      1,
      v_snapshot,
      v_hash,
      v_user_id
    )
    returning *
    into v_revision;

    update public.yzi_imob_creative_deliverables d
    set status = 'in_review',
        current_revision_id = v_revision.id,
        updated_at = now()
    where d.id = v_deliverable.id;

    insert into public.yzi_imob_creative_assets (
      tenant_id,
      property_id,
      request_id,
      deliverable_id,
      revision_id,
      asset_role,
      media_type,
      synthetic_uri,
      content_hash,
      metadata
    )
    values (
      v_request.tenant_id,
      v_request.property_id,
      v_request.id,
      v_deliverable.id,
      v_revision.id,
      'synthetic_output',
      case when v_deliverable.deliverable_type = 'video_tour' then 'video' else 'structured' end,
      'yzi://creative/' || v_request.id::text || '/' || v_deliverable.id::text,
      v_hash,
      jsonb_build_object(
        'synthetic', true,
        'rendered', false,
        'publishable', false,
        'deliverable_type', v_deliverable.deliverable_type
      )
    );

    insert into public.yzi_imob_creative_generation_events (
      tenant_id,
      property_id,
      request_id,
      deliverable_id,
      revision_id,
      job_id,
      event_type,
      actor_user_id,
      correlation_id,
      metadata
    )
    values (
      v_request.tenant_id,
      v_request.property_id,
      v_request.id,
      v_deliverable.id,
      v_revision.id,
      v_job.id,
      'revision_created',
      v_user_id,
      v_job.correlation_id,
      jsonb_build_object('revision_number', 1, 'synthetic', true)
    );

    v_count := v_count + 1;
  end loop;

  update public.yzi_imob_creative_generation_jobs
  set status = 'succeeded',
      completed_at = now(),
      last_error_code = null,
      updated_at = now()
  where id = v_job.id;

  update public.yzi_imob_creative_requests
  set status = 'in_review',
      updated_at = now()
  where id = v_request.id;

  insert into public.yzi_imob_creative_generation_events (
    tenant_id,
    property_id,
    request_id,
    job_id,
    event_type,
    actor_user_id,
    correlation_id,
    metadata
  )
  values (
    v_request.tenant_id,
    v_request.property_id,
    v_request.id,
    v_job.id,
    'job_succeeded',
    v_user_id,
    v_job.correlation_id,
    jsonb_build_object('revision_count', v_count, 'external_execution', false)
  );

  return query select v_job.id, v_request.id, 'succeeded'::text, v_count;
end;
$function$;

create or replace function public.fail_yzi_imob_creative_generation_job(
  p_job_id uuid,
  p_error_code text
)
returns table (job_id uuid, request_id uuid, job_status text)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_job public.yzi_imob_creative_generation_jobs%rowtype;
  v_error_code text := btrim(coalesce(p_error_code, ''));
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if v_error_code <> 'synthetic_completion_failed' then
    raise exception using errcode = '22023', message = 'invalid_creative_error_code';
  end if;

  select j.*
    into v_job
  from public.yzi_imob_creative_generation_jobs j
  join public.tenant_memberships tm
    on tm.tenant_id = j.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin', 'operator']::text[])
  join public.tenants t
    on t.id = j.tenant_id
   and t.status = 'active'
  where j.id = p_job_id
  for update of j;

  if v_job.id is null then
    raise exception using errcode = '42501', message = 'creative_job_not_found_or_forbidden';
  end if;

  if v_job.status = 'failed' and v_job.last_error_code = v_error_code then
    return query select v_job.id, v_job.request_id, v_job.status;
    return;
  end if;

  if v_job.status not in ('queued', 'processing') then
    raise exception using errcode = '55000', message = 'creative_job_not_failable';
  end if;

  update public.yzi_imob_creative_generation_jobs
  set status = 'failed',
      completed_at = now(),
      last_error_code = v_error_code,
      updated_at = now()
  where id = v_job.id;

  update public.yzi_imob_creative_requests
  set status = 'failed',
      updated_at = now()
  where id = v_job.request_id;

  update public.yzi_imob_creative_deliverables
  set status = 'failed',
      updated_at = now()
  where request_id = v_job.request_id;

  insert into public.yzi_imob_creative_generation_events (
    tenant_id,
    property_id,
    request_id,
    job_id,
    event_type,
    actor_user_id,
    correlation_id,
    metadata
  )
  values (
    v_job.tenant_id,
    v_job.property_id,
    v_job.request_id,
    v_job.id,
    'job_failed',
    v_user_id,
    v_job.correlation_id,
    jsonb_build_object('error_code', v_error_code)
  );

  return query select v_job.id, v_job.request_id, 'failed'::text;
end;
$function$;

create or replace function public.decide_yzi_imob_creative_revision(
  p_revision_id uuid,
  p_decision text,
  p_observation text default null
)
returns table (
  revision_id uuid,
  deliverable_id uuid,
  revision_status text,
  deliverable_status text,
  publication_eligible boolean,
  request_status text
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_revision public.yzi_imob_creative_revisions%rowtype;
  v_deliverable public.yzi_imob_creative_deliverables%rowtype;
  v_decision text := btrim(coalesce(p_decision, ''));
  v_observation text := nullif(btrim(coalesce(p_observation, '')), '');
  v_request_status text;
  v_all_approved boolean;
  v_event_type text;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if v_decision not in ('approved', 'changes_requested', 'rejected')
    or (v_decision <> 'approved' and v_observation is null)
    or (v_observation is not null and length(v_observation) > 1000)
  then
    raise exception using errcode = '22023', message = 'invalid_creative_revision_decision';
  end if;

  select r.*
    into v_revision
  from public.yzi_imob_creative_revisions r
  join public.tenant_memberships tm
    on tm.tenant_id = r.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin']::text[])
  join public.tenants t
    on t.id = r.tenant_id
   and t.status = 'active'
  where r.id = p_revision_id
  for update of r;

  if v_revision.id is null then
    raise exception using errcode = '42501', message = 'creative_revision_not_found_or_forbidden';
  end if;

  select d.*
    into v_deliverable
  from public.yzi_imob_creative_deliverables d
  where d.id = v_revision.deliverable_id
  for update of d;

  if v_revision.status = v_decision then
    select r.status
      into v_request_status
    from public.yzi_imob_creative_requests r
    where r.id = v_revision.request_id;
    return query
      select
        v_revision.id,
        v_deliverable.id,
        v_revision.status,
        v_deliverable.status,
        v_deliverable.publication_eligible,
        v_request_status;
    return;
  end if;

  if v_revision.status <> 'in_review' then
    raise exception using errcode = '55000', message = 'creative_revision_already_decided';
  end if;

  if v_deliverable.current_revision_id is distinct from v_revision.id then
    raise exception using errcode = '55000', message = 'creative_revision_is_not_current';
  end if;

  update public.yzi_imob_creative_revisions
  set status = v_decision,
      review_observation = v_observation,
      decided_by_user_id = v_user_id,
      decided_at = now(),
      updated_at = now()
  where id = v_revision.id
  returning *
  into v_revision;

  update public.yzi_imob_creative_deliverables
  set status = v_decision,
      approved_revision_id = case when v_decision = 'approved' then v_revision.id else null end,
      publication_eligible = (v_decision = 'approved'),
      updated_at = now()
  where id = v_revision.deliverable_id
  returning *
  into v_deliverable;

  select bool_and(d.status = 'approved')
    into v_all_approved
  from public.yzi_imob_creative_deliverables d
  where d.request_id = v_revision.request_id;

  v_request_status := case
    when v_all_approved then 'approved'
    when v_decision = 'changes_requested' then 'changes_requested'
    else 'in_review'
  end;

  update public.yzi_imob_creative_requests
  set status = v_request_status,
      completed_at = null,
      updated_at = now()
  where id = v_revision.request_id;

  v_event_type := case v_decision
    when 'approved' then 'revision_approved'
    when 'changes_requested' then 'changes_requested'
    else 'revision_rejected'
  end;

  insert into public.yzi_imob_creative_generation_events (
    tenant_id,
    property_id,
    request_id,
    deliverable_id,
    revision_id,
    event_type,
    actor_user_id,
    metadata
  )
  values (
    v_revision.tenant_id,
    v_revision.property_id,
    v_revision.request_id,
    v_revision.deliverable_id,
    v_revision.id,
    v_event_type,
    v_user_id,
    case
      when v_observation is null then '{}'::jsonb
      else jsonb_build_object('observation_recorded', true)
    end
  );

  if v_request_status = 'approved' then
    insert into public.yzi_imob_creative_generation_events (
      tenant_id,
      property_id,
      request_id,
      deliverable_id,
      revision_id,
      event_type,
      actor_user_id,
      metadata
    )
    values (
      v_revision.tenant_id,
      v_revision.property_id,
      v_revision.request_id,
      v_revision.deliverable_id,
      v_revision.id,
      'request_approved',
      v_user_id,
      jsonb_build_object('all_deliverables_publication_eligible', true)
    );
  end if;

  return query
    select
      v_revision.id,
      v_deliverable.id,
      v_revision.status,
      v_deliverable.status,
      v_deliverable.publication_eligible,
      v_request_status;
end;
$function$;

revoke all on function public.create_yzi_imob_creative_request(uuid, text, text[], text[], uuid[], jsonb, text)
  from public, anon, authenticated;
revoke all on function public.start_yzi_imob_creative_generation_job(uuid)
  from public, anon, authenticated;
revoke all on function public.complete_yzi_imob_creative_generation_job(uuid)
  from public, anon, authenticated;
revoke all on function public.fail_yzi_imob_creative_generation_job(uuid, text)
  from public, anon, authenticated;
revoke all on function public.decide_yzi_imob_creative_revision(uuid, text, text)
  from public, anon, authenticated;

grant execute on function public.create_yzi_imob_creative_request(uuid, text, text[], text[], uuid[], jsonb, text)
  to authenticated, service_role;
grant execute on function public.start_yzi_imob_creative_generation_job(uuid)
  to authenticated, service_role;
grant execute on function public.complete_yzi_imob_creative_generation_job(uuid)
  to authenticated, service_role;
grant execute on function public.fail_yzi_imob_creative_generation_job(uuid, text)
  to authenticated, service_role;
grant execute on function public.decide_yzi_imob_creative_revision(uuid, text, text)
  to authenticated, service_role;

revoke all on function public.guard_yzi_imob_creative_revision_immutability()
  from public, anon, authenticated;
revoke all on function public.guard_yzi_imob_creative_event_append_only()
  from public, anon, authenticated;

comment on table public.yzi_imob_creative_requests is
  'Property-bound creative intent. Only carousel and video_tour are active in v1.';
comment on table public.yzi_imob_creative_deliverables is
  'Governed property creative deliverables with explicit human approval and publication eligibility.';
comment on table public.yzi_imob_creative_revisions is
  'Immutable structured creative snapshots used as review and approval evidence.';
comment on table public.yzi_imob_creative_assets is
  'Property media inputs and deterministic synthetic outputs. Synthetic URIs are not rendered files.';
comment on table public.yzi_imob_creative_generation_jobs is
  'Idempotent creative generation ledger. V1 has no external executor.';
comment on table public.yzi_imob_creative_generation_events is
  'Append-only sanitized creative lifecycle events; no prompts, credentials, or raw transport payloads.';

commit;
