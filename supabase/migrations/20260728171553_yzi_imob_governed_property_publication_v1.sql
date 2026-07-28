begin;

-- YZI IMOB - Governed property publication contract v1.
--
-- YZI IMOB remains the canonical property source. These tables only keep:
-- - governed public media associations;
-- - immutable, identifiable public revision snapshots used as approval evidence;
-- - one state row per property/channel;
-- - synchronization jobs and append-only events.
--
-- No external transport or public anonymous endpoint is created by this migration.

create table public.yzi_imob_property_media (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null,
  media_type text not null,
  storage_bucket text null,
  storage_path text null,
  public_url text null,
  alt_text text null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  is_publication_allowed boolean not null default true,
  processing_status text not null default 'ready',
  created_by_user_id uuid null references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_property_media_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_property_media_type_check
    check (media_type = any (array['image', 'video']::text[])),
  constraint yzi_imob_property_media_source_check
    check (
      (storage_bucket is not null and storage_path is not null and public_url is null)
      or (storage_bucket is null and storage_path is null and public_url is not null)
    ),
  constraint yzi_imob_property_media_sort_order_check
    check (sort_order >= 0),
  constraint yzi_imob_property_media_processing_status_check
    check (processing_status = any (array['processing', 'ready', 'failed']::text[])),
  constraint yzi_imob_property_media_text_check
    check (
      (storage_bucket is null or length(btrim(storage_bucket)) between 1 and 100)
      and (storage_path is null or length(btrim(storage_path)) between 1 and 500)
      and (public_url is null or length(btrim(public_url)) between 8 and 2000)
      and (alt_text is null or length(btrim(alt_text)) between 1 and 300)
    )
);

create unique index yzi_imob_property_media_one_cover_idx
  on public.yzi_imob_property_media (tenant_id, property_id)
  where is_cover and is_publication_allowed and processing_status = 'ready';

create unique index yzi_imob_property_media_storage_object_idx
  on public.yzi_imob_property_media (tenant_id, storage_bucket, storage_path)
  where storage_bucket is not null and storage_path is not null;

create index yzi_imob_property_media_property_order_idx
  on public.yzi_imob_property_media (tenant_id, property_id, sort_order, created_at);

create table public.yzi_imob_property_publication_revisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null,
  revision_number integer not null,
  public_slug text not null,
  content_snapshot jsonb not null,
  content_hash text not null,
  status text not null default 'under_review',
  review_observation text null,
  created_by_user_id uuid not null references auth.users (id) on delete restrict,
  review_requested_at timestamptz not null default now(),
  decided_by_user_id uuid null references auth.users (id) on delete set null,
  decided_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_property_publication_revisions_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_property_publication_revisions_identity_unique
    unique (id, tenant_id, property_id),
  constraint yzi_imob_property_publication_revisions_number_unique
    unique (tenant_id, property_id, revision_number),
  constraint yzi_imob_property_publication_revisions_number_check
    check (revision_number >= 1),
  constraint yzi_imob_property_publication_revisions_slug_check
    check (
      public_slug = btrim(public_slug)
      and public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      and length(public_slug) between 1 and 160
    ),
  constraint yzi_imob_property_publication_revisions_hash_check
    check (content_hash ~ '^[a-f0-9]{64}$'),
  constraint yzi_imob_property_publication_revisions_snapshot_check
    check (
      jsonb_typeof(content_snapshot) = 'object'
      and content_snapshot ->> 'property_id' = property_id::text
      and content_snapshot ->> 'tenant_id' = tenant_id::text
      and content_snapshot ->> 'slug' = public_slug
    ),
  constraint yzi_imob_property_publication_revisions_status_check
    check (
      status = any (
        array['under_review', 'approved', 'rejected', 'changes_required', 'superseded']::text[]
      )
    ),
  constraint yzi_imob_property_publication_revisions_decision_check
    check (
      (status = 'under_review' and decided_by_user_id is null and decided_at is null)
      or (
        status <> 'under_review'
        and decided_by_user_id is not null
        and decided_at is not null
      )
    ),
  constraint yzi_imob_property_publication_revisions_observation_check
    check (
      review_observation is null
      or length(btrim(review_observation)) between 1 and 1000
    )
);

create index yzi_imob_property_publication_revisions_property_idx
  on public.yzi_imob_property_publication_revisions
    (tenant_id, property_id, revision_number desc);

create table public.yzi_imob_property_publications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null,
  publication_channel text not null default 'site',
  status text not null default 'draft',
  public_slug text null,
  public_url text null,
  current_revision_id uuid null,
  approved_revision_id uuid null,
  publication_version integer not null default 0,
  scheduled_at timestamptz null,
  published_at timestamptz null,
  paused_at timestamptz null,
  unpublished_at timestamptz null,
  last_synced_at timestamptz null,
  sync_error_code text null,
  idempotency_key text null,
  created_by_user_id uuid null references auth.users (id) on delete set null,
  approved_by_user_id uuid null references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_property_publications_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_property_publications_identity_unique
    unique (id, tenant_id, property_id),
  constraint yzi_imob_property_publications_property_channel_unique
    unique (tenant_id, property_id, publication_channel),
  constraint yzi_imob_property_publications_current_revision_fkey
    foreign key (current_revision_id, tenant_id, property_id)
    references public.yzi_imob_property_publication_revisions (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_property_publications_approved_revision_fkey
    foreign key (approved_revision_id, tenant_id, property_id)
    references public.yzi_imob_property_publication_revisions (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_property_publications_channel_check
    check (publication_channel = 'site'),
  constraint yzi_imob_property_publications_status_check
    check (
      status = any (
        array[
          'draft',
          'incomplete',
          'under_review',
          'changes_required',
          'ready_to_publish',
          'approved',
          'publishing',
          'published',
          'update_pending',
          'paused',
          'unpublished',
          'archived',
          'failed'
        ]::text[]
      )
    ),
  constraint yzi_imob_property_publications_version_check
    check (publication_version >= 0),
  constraint yzi_imob_property_publications_slug_check
    check (
      public_slug is null
      or (
        public_slug = btrim(public_slug)
        and public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
        and length(public_slug) between 1 and 160
      )
    ),
  constraint yzi_imob_property_publications_error_check
    check (
      sync_error_code is null
      or sync_error_code ~ '^[a-z0-9_]{1,80}$'
    ),
  constraint yzi_imob_property_publications_idempotency_check
    check (
      idempotency_key is null
      or length(btrim(idempotency_key)) between 1 and 200
    )
);

create unique index yzi_imob_property_publications_slug_unique_idx
  on public.yzi_imob_property_publications (tenant_id, publication_channel, public_slug)
  where public_slug is not null;

create index yzi_imob_property_publications_governance_idx
  on public.yzi_imob_property_publications
    (tenant_id, publication_channel, status, updated_at desc);

create table public.yzi_imob_property_publication_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null,
  publication_id uuid not null,
  publication_channel text not null default 'site',
  operation text not null,
  status text not null default 'queued',
  revision_id uuid not null,
  publication_version integer not null,
  idempotency_key text not null,
  last_retry_idempotency_key text null,
  correlation_id uuid not null default gen_random_uuid(),
  scheduled_at timestamptz not null default now(),
  started_at timestamptz null,
  completed_at timestamptz null,
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  last_error_code text null,
  created_by_user_id uuid null references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_property_publication_jobs_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_property_publication_jobs_publication_fkey
    foreign key (publication_id, tenant_id, property_id)
    references public.yzi_imob_property_publications (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_property_publication_jobs_revision_fkey
    foreign key (revision_id, tenant_id, property_id)
    references public.yzi_imob_property_publication_revisions (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_property_publication_jobs_idempotency_unique
    unique (tenant_id, publication_channel, idempotency_key),
  constraint yzi_imob_property_publication_jobs_channel_check
    check (publication_channel = 'site'),
  constraint yzi_imob_property_publication_jobs_operation_check
    check (operation = any (array['publish', 'update']::text[])),
  constraint yzi_imob_property_publication_jobs_status_check
    check (status = any (array['queued', 'processing', 'succeeded', 'failed', 'cancelled']::text[])),
  constraint yzi_imob_property_publication_jobs_version_check
    check (publication_version >= 1),
  constraint yzi_imob_property_publication_jobs_attempts_check
    check (
      attempt_count >= 0
      and max_attempts between 1 and 10
      and attempt_count <= max_attempts
    ),
  constraint yzi_imob_property_publication_jobs_key_check
    check (
      length(btrim(idempotency_key)) between 1 and 200
      and (
        last_retry_idempotency_key is null
        or length(btrim(last_retry_idempotency_key)) between 1 and 200
      )
    ),
  constraint yzi_imob_property_publication_jobs_error_check
    check (
      last_error_code is null
      or last_error_code ~ '^[a-z0-9_]{1,80}$'
    )
);

create index yzi_imob_property_publication_jobs_claim_idx
  on public.yzi_imob_property_publication_jobs
    (status, scheduled_at, created_at)
  where status in ('queued', 'failed');

create index yzi_imob_property_publication_jobs_property_idx
  on public.yzi_imob_property_publication_jobs
    (tenant_id, property_id, created_at desc);

create table public.yzi_imob_property_publication_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null,
  publication_channel text not null default 'site',
  event_type text not null,
  revision_id uuid null,
  job_id uuid null references public.yzi_imob_property_publication_jobs (id) on delete restrict,
  actor_user_id uuid null references auth.users (id) on delete set null,
  correlation_id uuid null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint yzi_imob_property_publication_events_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties (id, tenant_id)
    on delete restrict,
  constraint yzi_imob_property_publication_events_revision_fkey
    foreign key (revision_id, tenant_id, property_id)
    references public.yzi_imob_property_publication_revisions (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_property_publication_events_channel_check
    check (publication_channel = 'site'),
  constraint yzi_imob_property_publication_events_type_check
    check (
      event_type = any (
        array[
          'review_requested',
          'approved',
          'rejected',
          'changes_requested',
          'publish_queued',
          'publish_started',
          'publish_succeeded',
          'publish_failed',
          'update_queued',
          'paused',
          'unpublished',
          'retry_requested'
        ]::text[]
      )
    ),
  constraint yzi_imob_property_publication_events_metadata_check
    check (
      jsonb_typeof(metadata) = 'object'
      and pg_column_size(metadata) <= 4096
    )
);

create index yzi_imob_property_publication_events_property_idx
  on public.yzi_imob_property_publication_events
    (tenant_id, property_id, created_at desc);

alter table public.yzi_imob_property_media enable row level security;
alter table public.yzi_imob_property_publication_revisions enable row level security;
alter table public.yzi_imob_property_publications enable row level security;
alter table public.yzi_imob_property_publication_jobs enable row level security;
alter table public.yzi_imob_property_publication_events enable row level security;

create policy yzi_imob_property_media_select_member
  on public.yzi_imob_property_media
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_property_media.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create policy yzi_imob_property_media_write_operator
  on public.yzi_imob_property_media
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_property_media.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and tm.role = any (array['owner', 'admin', 'operator']::text[])
        and t.status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_property_media.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and tm.role = any (array['owner', 'admin', 'operator']::text[])
        and t.status = 'active'
    )
    and (
      created_by_user_id is null
      or created_by_user_id = (select auth.uid())
    )
  );

create policy yzi_imob_property_publication_revisions_select_member
  on public.yzi_imob_property_publication_revisions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      where tm.tenant_id = yzi_imob_property_publication_revisions.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
    )
  );

create policy yzi_imob_property_publications_select_member
  on public.yzi_imob_property_publications
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      where tm.tenant_id = yzi_imob_property_publications.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
    )
  );

create policy yzi_imob_property_publication_jobs_select_member
  on public.yzi_imob_property_publication_jobs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      where tm.tenant_id = yzi_imob_property_publication_jobs.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
    )
  );

create policy yzi_imob_property_publication_events_select_member
  on public.yzi_imob_property_publication_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      where tm.tenant_id = yzi_imob_property_publication_events.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
    )
  );

grant select, insert, update, delete
  on table public.yzi_imob_property_media
  to authenticated;

grant select
  on table
    public.yzi_imob_property_publication_revisions,
    public.yzi_imob_property_publications,
    public.yzi_imob_property_publication_jobs,
    public.yzi_imob_property_publication_events
  to authenticated;

grant all
  on table
    public.yzi_imob_property_media,
    public.yzi_imob_property_publication_revisions,
    public.yzi_imob_property_publications,
    public.yzi_imob_property_publication_jobs,
    public.yzi_imob_property_publication_events
  to service_role;

create or replace function public.request_yzi_imob_property_publication_review(
  p_property_id uuid,
  p_public_slug text,
  p_content_snapshot jsonb,
  p_content_hash text
)
returns table (
  publication_id uuid,
  revision_id uuid,
  revision_number integer,
  publication_status text
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_tenant_id uuid;
  v_publication public.yzi_imob_property_publications%rowtype;
  v_revision public.yzi_imob_property_publication_revisions%rowtype;
  v_revision_number integer;
  v_next_status text;
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

  if jsonb_typeof(p_content_snapshot) <> 'object'
    or p_content_snapshot ->> 'property_id' <> p_property_id::text
    or p_content_snapshot ->> 'tenant_id' <> v_tenant_id::text
    or p_content_snapshot ->> 'slug' <> p_public_slug
    or p_content_snapshot ->> 'status' <> 'ready_to_publish'
    or p_content_hash !~ '^[a-f0-9]{64}$'
  then
    raise exception using errcode = '22023', message = 'invalid_publication_snapshot';
  end if;

  insert into public.yzi_imob_property_publications (
    tenant_id,
    property_id,
    publication_channel,
    status,
    public_slug,
    created_by_user_id
  )
  values (
    v_tenant_id,
    p_property_id,
    'site',
    'ready_to_publish',
    p_public_slug,
    v_user_id
  )
  on conflict (tenant_id, property_id, publication_channel)
  do nothing;

  select pub.*
    into v_publication
  from public.yzi_imob_property_publications pub
  where pub.tenant_id = v_tenant_id
    and pub.property_id = p_property_id
    and pub.publication_channel = 'site'
  for update;

  if v_publication.status in ('publishing', 'archived') then
    raise exception using errcode = '55000', message = 'publication_state_not_reviewable';
  end if;

  select coalesce(max(r.revision_number), 0) + 1
    into v_revision_number
  from public.yzi_imob_property_publication_revisions r
  where r.tenant_id = v_tenant_id
    and r.property_id = p_property_id;

  insert into public.yzi_imob_property_publication_revisions (
    tenant_id,
    property_id,
    revision_number,
    public_slug,
    content_snapshot,
    content_hash,
    status,
    created_by_user_id
  )
  values (
    v_tenant_id,
    p_property_id,
    v_revision_number,
    p_public_slug,
    p_content_snapshot,
    p_content_hash,
    'under_review',
    v_user_id
  )
  returning *
  into v_revision;

  v_next_status := case
    when v_publication.publication_version > 0
      and v_publication.status in ('published', 'paused', 'update_pending', 'failed')
      then 'update_pending'
    else 'under_review'
  end;

  update public.yzi_imob_property_publications pub
  set current_revision_id = v_revision.id,
      public_slug = p_public_slug,
      status = v_next_status,
      sync_error_code = null,
      updated_at = now()
  where pub.id = v_publication.id
  returning *
  into v_publication;

  insert into public.yzi_imob_property_publication_events (
    tenant_id,
    property_id,
    event_type,
    revision_id,
    actor_user_id
  )
  values (
    v_tenant_id,
    p_property_id,
    'review_requested',
    v_revision.id,
    v_user_id
  );

  return query
  select v_publication.id, v_revision.id, v_revision.revision_number, v_publication.status;
end;
$function$;

create or replace function public.decide_yzi_imob_property_publication_revision(
  p_revision_id uuid,
  p_decision text,
  p_observation text default null
)
returns table (
  publication_id uuid,
  revision_id uuid,
  revision_status text,
  publication_status text
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_revision public.yzi_imob_property_publication_revisions%rowtype;
  v_publication public.yzi_imob_property_publications%rowtype;
  v_revision_status text;
  v_publication_status text;
  v_event_type text;
  v_observation text := nullif(btrim(coalesce(p_observation, '')), '');
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if p_decision not in ('approved', 'rejected', 'changes_required') then
    raise exception using errcode = '22023', message = 'invalid_review_decision';
  end if;

  if p_decision in ('rejected', 'changes_required') and v_observation is null then
    raise exception using errcode = '22023', message = 'review_observation_required';
  end if;

  select r.*
    into v_revision
  from public.yzi_imob_property_publication_revisions r
  join public.tenant_memberships tm
    on tm.tenant_id = r.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin']::text[])
  where r.id = p_revision_id
  for update of r;

  if v_revision.id is null then
    raise exception using errcode = '42501', message = 'revision_not_found_or_forbidden';
  end if;

  if v_revision.status <> 'under_review' then
    raise exception using errcode = '55000', message = 'revision_already_decided';
  end if;

  select pub.*
    into v_publication
  from public.yzi_imob_property_publications pub
  where pub.tenant_id = v_revision.tenant_id
    and pub.property_id = v_revision.property_id
    and pub.publication_channel = 'site'
    and pub.current_revision_id = v_revision.id
  for update;

  if v_publication.id is null then
    raise exception using errcode = '55000', message = 'revision_is_not_current';
  end if;

  v_revision_status := p_decision;
  v_event_type := case
    when p_decision = 'approved' then 'approved'
    when p_decision = 'rejected' then 'rejected'
    else 'changes_requested'
  end;

  v_publication_status := case
    when p_decision = 'approved' then 'approved'
    when v_publication.publication_version > 0 then
      case when v_publication.paused_at is not null and v_publication.unpublished_at is null
        then 'paused'
        else 'published'
      end
    else 'changes_required'
  end;

  update public.yzi_imob_property_publication_revisions r
  set status = v_revision_status,
      review_observation = v_observation,
      decided_by_user_id = v_user_id,
      decided_at = now(),
      updated_at = now()
  where r.id = v_revision.id;

  update public.yzi_imob_property_publications pub
  set status = v_publication_status,
      approved_revision_id = case
        when p_decision = 'approved' then v_revision.id
        else pub.approved_revision_id
      end,
      approved_by_user_id = case
        when p_decision = 'approved' then v_user_id
        else pub.approved_by_user_id
      end,
      updated_at = now()
  where pub.id = v_publication.id;

  insert into public.yzi_imob_property_publication_events (
    tenant_id,
    property_id,
    event_type,
    revision_id,
    actor_user_id,
    metadata
  )
  values (
    v_revision.tenant_id,
    v_revision.property_id,
    v_event_type,
    v_revision.id,
    v_user_id,
    case
      when v_observation is null then '{}'::jsonb
      else jsonb_build_object('observation_recorded', true)
    end
  );

  return query
  select v_publication.id, v_revision.id, v_revision_status, v_publication_status;
end;
$function$;

create or replace function public.enqueue_yzi_imob_property_publication(
  p_property_id uuid,
  p_operation text,
  p_idempotency_key text,
  p_scheduled_at timestamptz default now()
)
returns table (
  job_id uuid,
  publication_id uuid,
  job_status text,
  publication_version integer,
  reused boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_publication public.yzi_imob_property_publications%rowtype;
  v_revision public.yzi_imob_property_publication_revisions%rowtype;
  v_job public.yzi_imob_property_publication_jobs%rowtype;
  v_key text := btrim(coalesce(p_idempotency_key, ''));
  v_version integer;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if p_operation not in ('publish', 'update') then
    raise exception using errcode = '22023', message = 'invalid_publication_operation';
  end if;

  if length(v_key) not between 1 and 200 then
    raise exception using errcode = '22023', message = 'idempotency_key_required';
  end if;

  select pub.*
    into v_publication
  from public.yzi_imob_property_publications pub
  join public.tenant_memberships tm
    on tm.tenant_id = pub.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin', 'operator']::text[])
  where pub.property_id = p_property_id
    and pub.publication_channel = 'site'
  for update of pub;

  if v_publication.id is null then
    raise exception using errcode = '42501', message = 'publication_not_found_or_forbidden';
  end if;

  select j.*
    into v_job
  from public.yzi_imob_property_publication_jobs j
  where j.tenant_id = v_publication.tenant_id
    and j.publication_channel = 'site'
    and j.idempotency_key = v_key;

  if v_job.id is not null then
    if v_job.publication_id <> v_publication.id or v_job.operation <> p_operation then
      raise exception using errcode = '23505', message = 'publication_idempotency_conflict';
    end if;

    return query
    select v_job.id, v_job.publication_id, v_job.status, v_job.publication_version, true;
    return;
  end if;

  if v_publication.approved_revision_id is null
    or v_publication.current_revision_id is distinct from v_publication.approved_revision_id
    or v_publication.status <> 'approved'
  then
    raise exception using errcode = '55000', message = 'approved_current_revision_required';
  end if;

  if p_operation = 'publish' and v_publication.publication_version <> 0 then
    raise exception using errcode = '55000', message = 'property_already_published_use_update';
  end if;

  if p_operation = 'update' and v_publication.publication_version = 0 then
    raise exception using errcode = '55000', message = 'property_not_yet_published';
  end if;

  select r.*
    into v_revision
  from public.yzi_imob_property_publication_revisions r
  where r.id = v_publication.approved_revision_id
    and r.tenant_id = v_publication.tenant_id
    and r.property_id = v_publication.property_id
    and r.status = 'approved';

  if v_revision.id is null then
    raise exception using errcode = '55000', message = 'approved_revision_not_found';
  end if;

  v_version := v_publication.publication_version + 1;

  insert into public.yzi_imob_property_publication_jobs (
    tenant_id,
    property_id,
    publication_id,
    publication_channel,
    operation,
    revision_id,
    publication_version,
    idempotency_key,
    scheduled_at,
    created_by_user_id
  )
  values (
    v_publication.tenant_id,
    v_publication.property_id,
    v_publication.id,
    'site',
    p_operation,
    v_revision.id,
    v_version,
    v_key,
    greatest(coalesce(p_scheduled_at, now()), now()),
    v_user_id
  )
  returning *
  into v_job;

  update public.yzi_imob_property_publications pub
  set status = 'publishing',
      scheduled_at = v_job.scheduled_at,
      idempotency_key = v_key,
      sync_error_code = null,
      updated_at = now()
  where pub.id = v_publication.id;

  insert into public.yzi_imob_property_publication_events (
    tenant_id,
    property_id,
    event_type,
    revision_id,
    job_id,
    actor_user_id,
    correlation_id
  )
  values (
    v_publication.tenant_id,
    v_publication.property_id,
    case when p_operation = 'publish' then 'publish_queued' else 'update_queued' end,
    v_revision.id,
    v_job.id,
    v_user_id,
    v_job.correlation_id
  );

  return query
  select v_job.id, v_job.publication_id, v_job.status, v_job.publication_version, false;
end;
$function$;

create or replace function public.mark_yzi_imob_property_publication_started(
  p_job_id uuid
)
returns table (job_id uuid, job_status text)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_job public.yzi_imob_property_publication_jobs%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  select j.*
    into v_job
  from public.yzi_imob_property_publication_jobs j
  join public.tenant_memberships tm
    on tm.tenant_id = j.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin', 'operator']::text[])
  where j.id = p_job_id
  for update of j;

  if v_job.id is null then
    raise exception using errcode = '42501', message = 'publication_job_not_found_or_forbidden';
  end if;

  if v_job.status = 'processing' then
    return query select v_job.id, v_job.status;
    return;
  end if;

  if v_job.status <> 'queued' then
    raise exception using errcode = '55000', message = 'publication_job_not_startable';
  end if;

  update public.yzi_imob_property_publication_jobs j
  set status = 'processing',
      attempt_count = attempt_count + 1,
      started_at = now(),
      updated_at = now()
  where j.id = v_job.id
  returning *
  into v_job;

  insert into public.yzi_imob_property_publication_events (
    tenant_id,
    property_id,
    event_type,
    revision_id,
    job_id,
    actor_user_id,
    correlation_id
  )
  values (
    v_job.tenant_id,
    v_job.property_id,
    'publish_started',
    v_job.revision_id,
    v_job.id,
    v_user_id,
    v_job.correlation_id
  );

  return query select v_job.id, v_job.status;
end;
$function$;

create or replace function public.mark_yzi_imob_property_publication_synced(
  p_job_id uuid,
  p_public_url text
)
returns table (
  publication_id uuid,
  job_id uuid,
  publication_status text,
  publication_version integer
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_job public.yzi_imob_property_publication_jobs%rowtype;
  v_publication public.yzi_imob_property_publications%rowtype;
  v_url text := nullif(btrim(coalesce(p_public_url, '')), '');
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if v_url is null or length(v_url) > 2000 or v_url !~ '^https://[^[:space:]]+$' then
    raise exception using errcode = '22023', message = 'invalid_public_url';
  end if;

  select j.*
    into v_job
  from public.yzi_imob_property_publication_jobs j
  join public.tenant_memberships tm
    on tm.tenant_id = j.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin', 'operator']::text[])
  where j.id = p_job_id
  for update of j;

  if v_job.id is null then
    raise exception using errcode = '42501', message = 'publication_job_not_found_or_forbidden';
  end if;

  if v_job.status = 'succeeded' then
    select pub.*
      into v_publication
    from public.yzi_imob_property_publications pub
    where pub.id = v_job.publication_id;

    return query
    select v_publication.id, v_job.id, v_publication.status, v_publication.publication_version;
    return;
  end if;

  if v_job.status <> 'processing' then
    raise exception using errcode = '55000', message = 'publication_job_not_processing';
  end if;

  update public.yzi_imob_property_publication_jobs j
  set status = 'succeeded',
      completed_at = now(),
      last_error_code = null,
      updated_at = now()
  where j.id = v_job.id;

  update public.yzi_imob_property_publications pub
  set status = 'published',
      public_url = v_url,
      publication_version = v_job.publication_version,
      published_at = coalesce(pub.published_at, now()),
      paused_at = null,
      unpublished_at = null,
      last_synced_at = now(),
      sync_error_code = null,
      updated_at = now()
  where pub.id = v_job.publication_id
  returning *
  into v_publication;

  insert into public.yzi_imob_property_publication_events (
    tenant_id,
    property_id,
    event_type,
    revision_id,
    job_id,
    actor_user_id,
    correlation_id
  )
  values (
    v_job.tenant_id,
    v_job.property_id,
    'publish_succeeded',
    v_job.revision_id,
    v_job.id,
    v_user_id,
    v_job.correlation_id
  );

  return query
  select v_publication.id, v_job.id, v_publication.status, v_publication.publication_version;
end;
$function$;

create or replace function public.mark_yzi_imob_property_publication_failed(
  p_job_id uuid,
  p_error_code text
)
returns table (publication_id uuid, job_id uuid, publication_status text)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_job public.yzi_imob_property_publication_jobs%rowtype;
  v_error_code text := btrim(coalesce(p_error_code, ''));
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if v_error_code !~ '^[a-z0-9_]{1,80}$' then
    raise exception using errcode = '22023', message = 'invalid_sync_error_code';
  end if;

  select j.*
    into v_job
  from public.yzi_imob_property_publication_jobs j
  join public.tenant_memberships tm
    on tm.tenant_id = j.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin', 'operator']::text[])
  where j.id = p_job_id
  for update of j;

  if v_job.id is null then
    raise exception using errcode = '42501', message = 'publication_job_not_found_or_forbidden';
  end if;

  if v_job.status = 'failed' and v_job.last_error_code = v_error_code then
    return query select v_job.publication_id, v_job.id, 'failed'::text;
    return;
  end if;

  if v_job.status not in ('queued', 'processing') then
    raise exception using errcode = '55000', message = 'publication_job_not_failable';
  end if;

  update public.yzi_imob_property_publication_jobs j
  set status = 'failed',
      completed_at = now(),
      last_error_code = v_error_code,
      updated_at = now()
  where j.id = v_job.id;

  update public.yzi_imob_property_publications pub
  set status = 'failed',
      sync_error_code = v_error_code,
      updated_at = now()
  where pub.id = v_job.publication_id;

  insert into public.yzi_imob_property_publication_events (
    tenant_id,
    property_id,
    event_type,
    revision_id,
    job_id,
    actor_user_id,
    correlation_id
  )
  values (
    v_job.tenant_id,
    v_job.property_id,
    'publish_failed',
    v_job.revision_id,
    v_job.id,
    v_user_id,
    v_job.correlation_id
  );

  return query select v_job.publication_id, v_job.id, 'failed'::text;
end;
$function$;

create or replace function public.retry_yzi_imob_property_publication(
  p_job_id uuid,
  p_retry_idempotency_key text
)
returns table (
  job_id uuid,
  job_status text,
  publication_version integer,
  reused boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_job public.yzi_imob_property_publication_jobs%rowtype;
  v_key text := btrim(coalesce(p_retry_idempotency_key, ''));
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if length(v_key) not between 1 and 200 then
    raise exception using errcode = '22023', message = 'retry_idempotency_key_required';
  end if;

  select j.*
    into v_job
  from public.yzi_imob_property_publication_jobs j
  join public.tenant_memberships tm
    on tm.tenant_id = j.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin', 'operator']::text[])
  where j.id = p_job_id
  for update of j;

  if v_job.id is null then
    raise exception using errcode = '42501', message = 'publication_job_not_found_or_forbidden';
  end if;

  if v_job.last_retry_idempotency_key = v_key then
    return query select v_job.id, v_job.status, v_job.publication_version, true;
    return;
  end if;

  if v_job.status <> 'failed' or v_job.attempt_count >= v_job.max_attempts then
    raise exception using errcode = '55000', message = 'publication_job_not_retryable';
  end if;

  update public.yzi_imob_property_publication_jobs j
  set status = 'queued',
      scheduled_at = now(),
      started_at = null,
      completed_at = null,
      last_retry_idempotency_key = v_key,
      updated_at = now()
  where j.id = v_job.id
  returning *
  into v_job;

  update public.yzi_imob_property_publications pub
  set status = 'publishing',
      sync_error_code = null,
      updated_at = now()
  where pub.id = v_job.publication_id;

  insert into public.yzi_imob_property_publication_events (
    tenant_id,
    property_id,
    event_type,
    revision_id,
    job_id,
    actor_user_id,
    correlation_id
  )
  values (
    v_job.tenant_id,
    v_job.property_id,
    'retry_requested',
    v_job.revision_id,
    v_job.id,
    v_user_id,
    v_job.correlation_id
  );

  return query select v_job.id, v_job.status, v_job.publication_version, false;
end;
$function$;

create or replace function public.set_yzi_imob_property_publication_availability(
  p_property_id uuid,
  p_action text
)
returns table (publication_id uuid, publication_status text)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_publication public.yzi_imob_property_publications%rowtype;
  v_next_status text;
  v_event_type text;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if p_action not in ('pause', 'unpublish') then
    raise exception using errcode = '22023', message = 'invalid_publication_availability_action';
  end if;

  select pub.*
    into v_publication
  from public.yzi_imob_property_publications pub
  join public.tenant_memberships tm
    on tm.tenant_id = pub.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner', 'admin', 'operator']::text[])
  where pub.property_id = p_property_id
    and pub.publication_channel = 'site'
  for update of pub;

  if v_publication.id is null then
    raise exception using errcode = '42501', message = 'publication_not_found_or_forbidden';
  end if;

  if p_action = 'pause' then
    if v_publication.status = 'paused' then
      return query select v_publication.id, v_publication.status;
      return;
    end if;
    if v_publication.status not in ('published', 'update_pending') then
      raise exception using errcode = '55000', message = 'publication_not_pausable';
    end if;
    v_next_status := 'paused';
    v_event_type := 'paused';
  else
    if v_publication.status = 'unpublished' then
      return query select v_publication.id, v_publication.status;
      return;
    end if;
    if v_publication.publication_version = 0
      or v_publication.status not in ('published', 'paused', 'update_pending', 'failed')
    then
      raise exception using errcode = '55000', message = 'publication_not_unpublishable';
    end if;
    v_next_status := 'unpublished';
    v_event_type := 'unpublished';
  end if;

  update public.yzi_imob_property_publications pub
  set status = v_next_status,
      paused_at = case when p_action = 'pause' then now() else pub.paused_at end,
      unpublished_at = case when p_action = 'unpublish' then now() else null end,
      sync_error_code = null,
      updated_at = now()
  where pub.id = v_publication.id
  returning *
  into v_publication;

  insert into public.yzi_imob_property_publication_events (
    tenant_id,
    property_id,
    event_type,
    revision_id,
    actor_user_id
  )
  values (
    v_publication.tenant_id,
    v_publication.property_id,
    v_event_type,
    v_publication.approved_revision_id,
    v_user_id
  );

  return query select v_publication.id, v_publication.status;
end;
$function$;

revoke all on function public.request_yzi_imob_property_publication_review(uuid, text, jsonb, text)
  from public, anon, authenticated;
revoke all on function public.decide_yzi_imob_property_publication_revision(uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.enqueue_yzi_imob_property_publication(uuid, text, text, timestamptz)
  from public, anon, authenticated;
revoke all on function public.mark_yzi_imob_property_publication_started(uuid)
  from public, anon, authenticated;
revoke all on function public.mark_yzi_imob_property_publication_synced(uuid, text)
  from public, anon, authenticated;
revoke all on function public.mark_yzi_imob_property_publication_failed(uuid, text)
  from public, anon, authenticated;
revoke all on function public.retry_yzi_imob_property_publication(uuid, text)
  from public, anon, authenticated;
revoke all on function public.set_yzi_imob_property_publication_availability(uuid, text)
  from public, anon, authenticated;

grant execute on function public.request_yzi_imob_property_publication_review(uuid, text, jsonb, text)
  to authenticated, service_role;
grant execute on function public.decide_yzi_imob_property_publication_revision(uuid, text, text)
  to authenticated, service_role;
grant execute on function public.enqueue_yzi_imob_property_publication(uuid, text, text, timestamptz)
  to authenticated, service_role;
grant execute on function public.mark_yzi_imob_property_publication_started(uuid)
  to authenticated, service_role;
grant execute on function public.mark_yzi_imob_property_publication_synced(uuid, text)
  to authenticated, service_role;
grant execute on function public.mark_yzi_imob_property_publication_failed(uuid, text)
  to authenticated, service_role;
grant execute on function public.retry_yzi_imob_property_publication(uuid, text)
  to authenticated, service_role;
grant execute on function public.set_yzi_imob_property_publication_availability(uuid, text)
  to authenticated, service_role;

comment on table public.yzi_imob_property_media is
  'Canonical tenant/property association for publication-eligible media. It does not duplicate property registration or implement upload.';
comment on table public.yzi_imob_property_publication_revisions is
  'Immutable public payload snapshots used as identifiable review and approval evidence.';
comment on table public.yzi_imob_property_publications is
  'One governed publication lifecycle row per tenant/property/channel.';
comment on table public.yzi_imob_property_publication_jobs is
  'Idempotent outbound synchronization ledger. This migration creates no external executor.';
comment on table public.yzi_imob_property_publication_events is
  'Append-only sanitized publication observability events; never stores raw transport payloads or secrets.';

commit;
