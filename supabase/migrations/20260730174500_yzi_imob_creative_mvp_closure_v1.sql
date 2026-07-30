begin;

-- YZI IMOB - Creative MVP closure.
-- This migration is declarative only in this unit: it does not render, copy,
-- promote or publish files. Tenant, bucket, path and URL never come from a
-- browser mutation.

drop trigger if exists yzi_imob_creative_requests_carousel_only
  on public.yzi_imob_creative_requests;
drop trigger if exists yzi_imob_creative_deliverables_carousel_only
  on public.yzi_imob_creative_deliverables;
drop function if exists public.guard_yzi_imob_carousel_only_contract();

alter table public.yzi_imob_creative_requests
  drop constraint yzi_imob_creative_requests_status_check;

update public.yzi_imob_creative_requests
set status = case status
  when 'queued' then 'preparing'
  when 'generating' then 'preparing'
  when 'in_review' then 'awaiting_approval'
  else status
end;

alter table public.yzi_imob_creative_requests
  alter column status set default 'preparing',
  add constraint yzi_imob_creative_requests_status_check
    check (status = any (array[
      'preparing','partially_ready','awaiting_approval','changes_requested',
      'approved','partially_failed','failed','cancelled','completed'
    ]::text[]));

alter table public.yzi_imob_creative_deliverables
  drop constraint yzi_imob_creative_deliverables_status_check,
  add constraint yzi_imob_creative_deliverables_status_check
    check (status = any (array[
      'planned','generating','in_review','changes_requested',
      'approved','rejected','failed','cancelled'
    ]::text[]));

alter table public.yzi_imob_property_media
  add column environment_type text not null default 'other',
  add column display_order integer generated always as (sort_order) stored,
  add column is_primary boolean generated always as (is_cover) stored,
  add column eligible_for_carousel boolean not null default false,
  add column eligible_for_video boolean not null default false,
  add column media_status text not null default 'pending',
  add column orientation text not null default 'unknown',
  add column width_px integer null,
  add column height_px integer null,
  add column human_note text null,
  add column exclusion_reason text null,
  add constraint yzi_imob_property_media_environment_check
    check (environment_type = any (array[
      'facade','entrance','living_room','balcony','kitchen','bedroom','suite',
      'bathroom','leisure','view','floor_plan','location','detail','brand','other'
    ]::text[])),
  add constraint yzi_imob_property_media_creative_status_check
    check (media_status = any (array['pending','approved','excluded','failed']::text[])),
  add constraint yzi_imob_property_media_orientation_check
    check (orientation = any (array['portrait','landscape','square','unknown']::text[])),
  add constraint yzi_imob_property_media_dimensions_check
    check (
      (width_px is null and height_px is null)
      or (width_px between 1 and 20000 and height_px between 1 and 20000)
    ),
  add constraint yzi_imob_property_media_notes_check
    check (
      (human_note is null or length(btrim(human_note)) between 1 and 500)
      and (exclusion_reason is null or length(btrim(exclusion_reason)) between 1 and 500)
    ),
  add constraint yzi_imob_property_media_exclusion_check
    check (
      (media_status = 'excluded' and exclusion_reason is not null)
      or (media_status <> 'excluded' and exclusion_reason is null)
    ),
  add constraint yzi_imob_property_media_creative_eligibility_check
    check (
      (not eligible_for_carousel and not eligible_for_video)
      or (
        media_type = 'image'
        and media_status = 'approved'
        and processing_status = 'ready'
        and is_publication_allowed
        and storage_bucket is not null
        and storage_path is not null
        and storage_path like
          'tenants/' || tenant_id::text || '/properties/' || property_id::text || '/%'
        and public_url is null
      )
    ),
  add constraint yzi_imob_property_media_primary_governance_check
    check (
      not is_cover
      or (
        media_type = 'image'
        and media_status = 'approved'
        and processing_status = 'ready'
        and is_publication_allowed
      )
    );

update public.yzi_imob_property_media
set media_status = case
      when processing_status = 'failed' then 'failed'
      when processing_status = 'ready' and is_publication_allowed then 'approved'
      else 'pending'
    end,
    eligible_for_carousel = false,
    eligible_for_video = false;

drop index if exists public.yzi_imob_property_media_one_cover_idx;
create unique index yzi_imob_property_media_one_active_primary_idx
  on public.yzi_imob_property_media (tenant_id, property_id)
  where is_cover and media_status = 'approved';

create table public.yzi_imob_property_media_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null,
  media_id uuid not null,
  event_type text not null,
  actor_user_id uuid not null references auth.users (id) on delete restrict,
  before_state jsonb not null,
  after_state jsonb not null,
  created_at timestamptz not null default now(),
  constraint yzi_imob_property_media_events_media_fkey
    foreign key (media_id, tenant_id, property_id)
    references public.yzi_imob_property_media (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_property_media_events_type_check
    check (event_type = 'creative_governance_updated'),
  constraint yzi_imob_property_media_events_state_check
    check (
      jsonb_typeof(before_state) = 'object'
      and jsonb_typeof(after_state) = 'object'
      and pg_column_size(before_state) <= 4096
      and pg_column_size(after_state) <= 4096
    )
);

alter table public.yzi_imob_property_media_events enable row level security;
create policy yzi_imob_property_media_events_select_member
  on public.yzi_imob_property_media_events
  for select to authenticated
  using (
    exists (
      select 1 from public.tenant_memberships tm
      where tm.tenant_id = yzi_imob_property_media_events.tenant_id
        and tm.user_id = auth.uid()
        and tm.status = 'active'
    )
  );

create or replace function public.guard_yzi_imob_property_media_event_append_only()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
begin
  raise exception using errcode = '55000', message = 'property_media_events_are_append_only';
end;
$function$;

create trigger yzi_imob_property_media_events_append_only
before update or delete on public.yzi_imob_property_media_events
for each row execute function public.guard_yzi_imob_property_media_event_append_only();

revoke insert, update, delete on public.yzi_imob_property_media from authenticated;
revoke insert, update, delete on public.yzi_imob_property_media_events from authenticated;

create or replace function public.update_yzi_imob_property_media_governance(
  p_property_id uuid,
  p_media_id uuid,
  p_environment_type text,
  p_display_order integer,
  p_is_primary boolean,
  p_eligible_for_carousel boolean,
  p_eligible_for_video boolean,
  p_media_status text,
  p_orientation text,
  p_human_note text default null,
  p_exclusion_reason text default null
)
returns table (
  media_id uuid,
  property_id uuid,
  media_status text,
  is_primary boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_tenant_id uuid;
  v_before public.yzi_imob_property_media%rowtype;
  v_after public.yzi_imob_property_media%rowtype;
  v_previous public.yzi_imob_property_media%rowtype;
  v_demoted public.yzi_imob_property_media%rowtype;
begin
  select p.tenant_id into v_tenant_id
  from public.yzi_imob_properties p
  join public.tenant_memberships tm
    on tm.tenant_id = p.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner','admin','operator']::text[])
  where p.id = p_property_id;
  if not exists (
    select 1 from public.tenants t
    where t.id = v_tenant_id and t.status = 'active'
  ) then
    v_tenant_id := null;
  end if;
  if v_tenant_id is null then
    raise exception using errcode = '42501', message = 'property_not_found_or_forbidden';
  end if;

  select * into v_before
  from public.yzi_imob_property_media
  where id = p_media_id
    and tenant_id = v_tenant_id
    and property_id = p_property_id
  for update;
  if v_before.id is null then
    raise exception using errcode = '42501', message = 'media_not_found_or_forbidden';
  end if;

  if p_is_primary and p_media_status = 'approved' then
    for v_previous in
      select m.*
      from public.yzi_imob_property_media m
      where m.tenant_id = v_tenant_id
        and m.property_id = p_property_id
        and m.id <> p_media_id
        and m.is_cover
      for update
    loop
      update public.yzi_imob_property_media
      set is_cover = false
      where id = v_previous.id
      returning * into v_demoted;
      insert into public.yzi_imob_property_media_events (
        tenant_id, property_id, media_id, event_type, actor_user_id, before_state, after_state
      ) values (
        v_tenant_id,
        p_property_id,
        v_previous.id,
        'creative_governance_updated',
        v_user_id,
        to_jsonb(v_previous) - array['storage_bucket','storage_path','public_url']::text[],
        to_jsonb(v_demoted) - array['storage_bucket','storage_path','public_url']::text[]
      );
    end loop;
  end if;

  update public.yzi_imob_property_media
  set environment_type = p_environment_type,
      sort_order = p_display_order,
      is_cover = p_is_primary and p_media_status = 'approved',
      eligible_for_carousel = p_eligible_for_carousel and p_media_status = 'approved',
      eligible_for_video = p_eligible_for_video and p_media_status = 'approved',
      media_status = p_media_status,
      orientation = p_orientation,
      human_note = nullif(btrim(p_human_note), ''),
      exclusion_reason = nullif(btrim(p_exclusion_reason), '')
  where id = p_media_id
    and tenant_id = v_tenant_id
    and property_id = p_property_id
  returning * into v_after;

  insert into public.yzi_imob_property_media_events (
    tenant_id, property_id, media_id, event_type, actor_user_id, before_state, after_state
  ) values (
    v_tenant_id,
    p_property_id,
    p_media_id,
    'creative_governance_updated',
    v_user_id,
    to_jsonb(v_before) - array['storage_bucket','storage_path','public_url']::text[],
    to_jsonb(v_after) - array['storage_bucket','storage_path','public_url']::text[]
  );
  return query
  select v_after.id, v_after.property_id, v_after.media_status, v_after.is_cover;
end;
$function$;

revoke all on function public.update_yzi_imob_property_media_governance(
  uuid,uuid,text,integer,boolean,boolean,boolean,text,text,text,text
) from public, anon;
grant execute on function public.update_yzi_imob_property_media_governance(
  uuid,uuid,text,integer,boolean,boolean,boolean,text,text,text,text
) to authenticated;

drop index if exists public.yzi_imob_creative_assets_revision_position_unique;
create unique index yzi_imob_creative_assets_revision_kind_position_unique
  on public.yzi_imob_creative_assets
    (tenant_id, revision_id, asset_kind, asset_position)
  where asset_role = 'synthetic_output';

alter table public.yzi_imob_creative_assets
  drop constraint yzi_imob_creative_assets_position_check,
  add constraint yzi_imob_creative_assets_position_check
    check (
      (asset_role = 'source_media' and asset_position is null)
      or (asset_role = 'synthetic_output' and (asset_position is null or asset_position between 1 and 100))
    ),
  drop constraint yzi_imob_creative_assets_source_check,
  add constraint yzi_imob_creative_assets_source_check
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
        and deliverable_id is not null
        and revision_id is not null
        and synthetic_uri ~ '^yzi://creative/[a-f0-9-]+/[a-f0-9-]+(?:/r[1-9][0-9]*/[a-z0-9-]+)?$'
        and content_hash ~ '^[a-f0-9]{64}$'
      )
    ),
  add constraint yzi_imob_creative_assets_full_identity_unique
    unique (id, tenant_id, property_id, request_id, deliverable_id, revision_id);

create table public.yzi_imob_creative_asset_sources (
  asset_id uuid not null,
  tenant_id uuid not null,
  property_id uuid not null,
  request_id uuid not null,
  deliverable_id uuid not null,
  revision_id uuid not null,
  source_property_media_id uuid not null,
  source_position smallint not null,
  created_at timestamptz not null default now(),
  primary key (asset_id, source_property_media_id),
  constraint yzi_imob_creative_asset_sources_asset_fkey
    foreign key (asset_id, tenant_id, property_id, request_id, deliverable_id, revision_id)
    references public.yzi_imob_creative_assets
      (id, tenant_id, property_id, request_id, deliverable_id, revision_id)
    on delete restrict,
  constraint yzi_imob_creative_asset_sources_media_fkey
    foreign key (source_property_media_id, tenant_id, property_id)
    references public.yzi_imob_property_media (id, tenant_id, property_id)
    on delete restrict,
  constraint yzi_imob_creative_asset_sources_position_check
    check (source_position between 1 and 100),
  unique (tenant_id, asset_id, source_position)
);
alter table public.yzi_imob_creative_asset_sources enable row level security;
create policy yzi_imob_creative_asset_sources_select_member
  on public.yzi_imob_creative_asset_sources
  for select to authenticated
  using (
    exists (
      select 1 from public.tenant_memberships tm
      where tm.tenant_id = yzi_imob_creative_asset_sources.tenant_id
        and tm.user_id = auth.uid()
        and tm.status = 'active'
    )
  );
revoke insert, update, delete on public.yzi_imob_creative_asset_sources from authenticated;

drop index if exists public.yzi_imob_creative_generation_jobs_initial_unique;
alter table public.yzi_imob_creative_generation_jobs
  drop constraint yzi_imob_creative_generation_jobs_kind_shape_check,
  drop constraint yzi_imob_creative_generation_jobs_idempotency_unique,
  drop constraint if exists yzi_imob_creative_generation_jobs_request_unique,
  add column operation text not null default 'generate',
  add column retry_of_job_id uuid null
    references public.yzi_imob_creative_generation_jobs (id) on delete restrict,
  add column retry_number smallint not null default 0,
  add constraint yzi_imob_creative_generation_jobs_operation_check
    check (operation = any (array['generate','revise','retry']::text[])),
  add constraint yzi_imob_creative_generation_jobs_retry_check
    check (
      (operation <> 'retry' and retry_of_job_id is null and retry_number = 0)
      or (operation = 'retry' and retry_of_job_id is not null and retry_number between 1 and 3)
    );

update public.yzi_imob_creative_generation_jobs j
set deliverable_id = d.id
from public.yzi_imob_creative_deliverables d
where j.generation_kind = 'initial'
  and j.deliverable_id is null
  and d.tenant_id = j.tenant_id
  and d.property_id = j.property_id
  and d.request_id = j.request_id
  and d.deliverable_type = 'carousel';

do $block$
begin
  if exists (
    select 1
    from public.yzi_imob_creative_generation_jobs
    where deliverable_id is null
  ) then
    raise exception using errcode = '23514', message = 'creative_job_deliverable_backfill_incomplete';
  end if;
end;
$block$;

alter table public.yzi_imob_creative_generation_jobs
  alter column deliverable_id set not null,
  add constraint yzi_imob_creative_generation_jobs_kind_shape_check
    check (
      (generation_kind = 'initial' and deliverable_id is not null and source_revision_id is null)
      or (generation_kind = 'revision' and deliverable_id is not null and source_revision_id is not null)
    );
create unique index yzi_imob_creative_generation_jobs_deliverable_operation_key_unique
  on public.yzi_imob_creative_generation_jobs
    (tenant_id, property_id, deliverable_id, operation, idempotency_key);
create unique index yzi_imob_creative_generation_jobs_one_active_operation_idx
  on public.yzi_imob_creative_generation_jobs
    (tenant_id, property_id, deliverable_id, operation)
  where status=any(array['queued','processing']::text[]);

alter table public.yzi_imob_creative_generation_events
  drop constraint yzi_imob_creative_generation_events_type_check,
  add constraint yzi_imob_creative_generation_events_type_check
    check (event_type = any (array[
      'request_created','job_queued','job_started','job_retried',
      'revision_created','job_succeeded','job_failed','revision_approved',
      'changes_requested','revision_rejected','request_approved',
      'request_completed','asset_stored','asset_promoted'
    ]::text[]));

alter table public.yzi_imob_creative_revisions
  drop constraint yzi_imob_creative_revisions_snapshot_check,
  add constraint yzi_imob_creative_revisions_snapshot_check
    check (
      jsonb_typeof(content_snapshot) = 'object'
      and content_snapshot ->> 'property_id' = property_id::text
      and content_snapshot ->> 'request_id' = request_id::text
      and content_snapshot ->> 'deliverable_id' = deliverable_id::text
      and (
        (
          content_snapshot ->> 'contract_version' = '2026-07-29.v1'
          and content_snapshot ->> 'deliverable_type' = any (array['carousel','video_tour']::text[])
        )
        or (
          content_snapshot ->> 'contract_version' = '2026-07-29.carousel.v1'
          and content_snapshot ->> 'deliverable_type' = 'carousel'
        )
        or (
          content_snapshot ->> 'contract_version' = '2026-07-30.creative-mvp.v1'
          and content_snapshot ->> 'deliverable_type' = any (array['carousel','video_tour']::text[])
          and content_snapshot ->> 'synthetic' = 'true'
          and content_snapshot #>> '{publication_contract,external_publication_allowed}' = 'false'
        )
      )
      and pg_column_size(content_snapshot) <= 131072
    );

create or replace function public.recompute_yzi_imob_creative_request_status(
  p_request_id uuid
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_status text;
begin
  select case
    when bool_and(d.status = any (array['failed','rejected','cancelled']::text[]))
      then 'failed'
    when bool_or(d.status = any (array['failed','rejected','cancelled']::text[]))
      then 'partially_failed'
    when bool_or(d.status = 'changes_requested')
      then 'changes_requested'
    when bool_and(d.status = 'approved')
      then 'approved'
    when bool_and(d.status = any (array['approved','in_review']::text[]))
      and bool_or(d.status = 'in_review')
      then 'awaiting_approval'
    when bool_and(d.status = any (array['planned','generating']::text[]))
      then 'preparing'
    else 'partially_ready'
  end
  into v_status
  from public.yzi_imob_creative_deliverables d
  where d.request_id = p_request_id;

  if v_status is null then
    raise exception using errcode = '55000', message = 'creative_request_has_no_deliverables';
  end if;

  update public.yzi_imob_creative_requests
  set status = v_status,
      completed_at = null,
      updated_at = now()
  where id = p_request_id;
  return v_status;
end;
$function$;

revoke all on function public.recompute_yzi_imob_creative_request_status(uuid)
  from public, anon, authenticated;

create or replace function public.create_yzi_imob_creative_request(
  p_property_id uuid,
  p_objective text,
  p_formats text[],
  p_channels text[],
  p_source_media_ids uuid[],
  p_context jsonb,
  p_idempotency_key text
)
returns table (request_id uuid, job_id uuid, request_status text, reused boolean)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_tenant_id uuid;
  v_request public.yzi_imob_creative_requests%rowtype;
  v_deliverable public.yzi_imob_creative_deliverables%rowtype;
  v_job public.yzi_imob_creative_generation_jobs%rowtype;
  v_first_job_id uuid;
  v_objective text := btrim(coalesce(p_objective, ''));
  v_formats text[];
  v_channels text[];
  v_media_ids uuid[];
  v_context jsonb := coalesce(p_context, '{}'::jsonb);
  v_key text := btrim(coalesce(p_idempotency_key, ''));
  v_valid_count integer;
  v_primary_count integer;
  v_environment_count integer;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  select p.tenant_id into v_tenant_id
  from public.yzi_imob_properties p
  join public.tenant_memberships tm
    on tm.tenant_id = p.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner','admin','operator']::text[])
  join public.tenants t on t.id = p.tenant_id and t.status = 'active'
  where p.id = p_property_id;
  if v_tenant_id is null then
    raise exception using errcode = '42501', message = 'property_not_found_or_forbidden';
  end if;

  select coalesce(array_agg(distinct f order by f), '{}'::text[])
    into v_formats from unnest(coalesce(p_formats, '{}'::text[])) f;
  select coalesce(array_agg(distinct lower(btrim(c)) order by lower(btrim(c))), '{}'::text[])
    into v_channels from unnest(coalesce(p_channels, '{}'::text[])) c;
  select coalesce(array_agg(distinct m order by m), '{}'::uuid[])
    into v_media_ids from unnest(coalesce(p_source_media_ids, '{}'::uuid[])) m;
  if length(v_objective) not between 3 and 1000
    or cardinality(v_formats) not between 1 and 2
    or not (v_formats <@ array['carousel','video_tour']::text[])
    or cardinality(v_channels) not between 1 and 10
    or exists (select 1 from unnest(v_channels) c where c !~ '^[a-z0-9_]{1,40}$')
    or jsonb_typeof(v_context) <> 'object'
    or pg_column_size(v_context) > 16384
    or length(v_key) not between 1 and 200
  then
    raise exception using errcode = '22023', message = 'invalid_creative_request';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_tenant_id::text || ':' || p_property_id || ':' || v_key));
  select * into v_request
  from public.yzi_imob_creative_requests
  where tenant_id = v_tenant_id
    and property_id = p_property_id
    and idempotency_key = v_key;
  if v_request.id is not null then
    if v_request.objective <> v_objective
      or v_request.desired_formats <> v_formats
      or v_request.intended_channels <> v_channels
      or v_request.context <> v_context
    then
      raise exception using errcode = '23505', message = 'creative_request_idempotency_conflict';
    end if;
    select j.id into v_first_job_id
    from public.yzi_imob_creative_generation_jobs j
    where j.tenant_id = v_tenant_id and j.request_id = v_request.id
    order by j.created_at, j.id limit 1;
    return query select v_request.id, v_first_job_id, v_request.status, true;
    return;
  end if;

  select count(*), count(*) filter (where m.is_primary)
    into v_valid_count, v_primary_count
  from public.yzi_imob_property_media m
  where m.tenant_id = v_tenant_id
    and m.property_id = p_property_id
    and m.id = any (v_media_ids)
    and m.media_type = 'image'
    and m.media_status = 'approved'
    and m.processing_status = 'ready'
    and m.is_publication_allowed
    and m.storage_path like
      'tenants/' || v_tenant_id::text || '/properties/' || p_property_id::text || '/%'
    and (
      ('carousel' = any (v_formats) and m.eligible_for_carousel)
      or ('video_tour' = any (v_formats) and m.eligible_for_video)
    );
  if v_valid_count <> cardinality(v_media_ids) or v_primary_count <> 1 then
    raise exception using errcode = '22023', message = 'invalid_or_unready_property_media';
  end if;
  if 'carousel' = any (v_formats) and (
    select count(*) from public.yzi_imob_property_media m
    where m.tenant_id = v_tenant_id and m.property_id = p_property_id
      and m.id = any (v_media_ids) and m.eligible_for_carousel
  ) < 4 then
    raise exception using errcode = '22023', message = 'carousel_media_readiness_incomplete';
  end if;
  if 'video_tour' = any (v_formats) then
    select count(*), count(distinct m.environment_type)
      into v_valid_count, v_environment_count
    from public.yzi_imob_property_media m
    where m.tenant_id = v_tenant_id and m.property_id = p_property_id
      and m.id = any (v_media_ids) and m.eligible_for_video
      and m.media_status = 'approved';
    if v_valid_count < 5 or v_environment_count < 3 then
      raise exception using errcode = '22023', message = 'video_media_readiness_incomplete';
    end if;
  end if;

  insert into public.yzi_imob_creative_requests (
    tenant_id, property_id, status, objective, desired_formats, intended_channels,
    context, idempotency_key, created_by_user_id
  ) values (
    v_tenant_id, p_property_id, 'preparing', v_objective, v_formats, v_channels,
    v_context, v_key, v_user_id
  ) returning * into v_request;

  insert into public.yzi_imob_creative_assets (
    tenant_id, property_id, request_id, source_property_media_id,
    asset_role, media_type, asset_kind, storage_state, publication_state, metadata
  )
  select v_tenant_id, p_property_id, v_request.id, m.id,
    'source_media', m.media_type, 'source_media', 'not_required', 'not_eligible',
    jsonb_build_object(
      'display_order',m.display_order,'is_primary',m.is_primary,
      'environment_type',m.environment_type,
      'eligible_for_carousel',m.eligible_for_carousel,
      'eligible_for_video',m.eligible_for_video)
  from public.yzi_imob_property_media m
  where m.tenant_id = v_tenant_id and m.property_id = p_property_id
    and m.id = any (v_media_ids);

  for v_deliverable in
    insert into public.yzi_imob_creative_deliverables (
      tenant_id, property_id, request_id, deliverable_type, status
    )
    select v_tenant_id, p_property_id, v_request.id, f, 'planned'
    from unnest(v_formats) f
    returning *
  loop
    insert into public.yzi_imob_creative_generation_jobs (
      tenant_id, property_id, request_id, deliverable_id, generation_kind,
      operation, status, idempotency_key, created_by_user_id
    ) values (
      v_tenant_id, p_property_id, v_request.id, v_deliverable.id, 'initial',
      'generate', 'queued', 'generate:' || v_request.id || ':' || v_deliverable.deliverable_type,
      v_user_id
    ) returning * into v_job;
    v_first_job_id := coalesce(v_first_job_id, v_job.id);
    insert into public.yzi_imob_creative_generation_events (
      tenant_id, property_id, request_id, deliverable_id, job_id, event_type,
      actor_user_id, correlation_id, metadata
    ) values (
      v_tenant_id, p_property_id, v_request.id, v_deliverable.id, v_job.id,
      'job_queued', v_user_id, v_job.correlation_id,
      jsonb_build_object('operation','generate','deliverable_type',v_deliverable.deliverable_type)
    );
  end loop;
  insert into public.yzi_imob_creative_generation_events (
    tenant_id, property_id, request_id, event_type, actor_user_id, metadata
  ) values (
    v_tenant_id, p_property_id, v_request.id, 'request_created', v_user_id,
    jsonb_build_object('formats',v_formats,'source_media_count',cardinality(v_media_ids))
  );
  return query select v_request.id, v_first_job_id, 'preparing'::text, false;
end;
$function$;

create or replace function public.build_yzi_imob_video_tour_plan(
  p_tenant_id uuid,
  p_property_id uuid,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_scenes jsonb;
  v_count integer;
  v_environment_count integer;
begin
  with selected as (
    select m.id, m.environment_type, m.display_order
    from public.yzi_imob_creative_assets a
    join public.yzi_imob_property_media m
      on m.id = a.source_property_media_id
     and m.tenant_id = a.tenant_id and m.property_id = a.property_id
    where a.tenant_id = p_tenant_id and a.property_id = p_property_id
      and a.request_id = p_request_id and a.asset_role = 'source_media'
      and m.eligible_for_video and m.media_status = 'approved'
      and m.processing_status = 'ready' and m.is_publication_allowed
    order by
      case m.environment_type
        when 'facade' then 1 when 'entrance' then 2 when 'living_room' then 3
        when 'balcony' then 4 when 'view' then 5 when 'kitchen' then 6
        when 'suite' then 7 when 'bedroom' then 8 when 'leisure' then 9
        else 10 end,
      m.display_order, m.id
    limit 8
  ), ordered as (
    select id, environment_type,
      row_number() over (order by
        case environment_type
          when 'facade' then 1 when 'entrance' then 2 when 'living_room' then 3
          when 'balcony' then 4 when 'view' then 5 when 'kitchen' then 6
          when 'suite' then 7 when 'bedroom' then 8 when 'leisure' then 9
          else 10 end,
        display_order, id) as position,
      count(*) over () as total_count
    from selected
    order by position
  )
  select jsonb_agg(jsonb_build_object(
      'position',position,'mediaId',id,'environmentType',environment_type,
      'duration',20.0/total_count,
      'motionPreset',(array['slow_zoom_in','pan_right','slow_zoom_out','pan_left'])[
        1 + ((position - 1) % 4)],
      'transition',case when position = 1 then 'cut'
        when position % 4 = 0 then 'dip_to_brand' else 'crossfade' end,
      'diagnostics','[]'::jsonb
    ) order by position),
    count(*), count(distinct environment_type)
  into v_scenes, v_count, v_environment_count
  from ordered;
  if v_count < 5 or v_environment_count < 3 then
    raise exception using errcode = '55000', message = 'video_media_readiness_incomplete';
  end if;
  return jsonb_build_object(
    'kind','video_tour_plan','propertyId',p_property_id,'duration',20,
    'aspectRatio','9:16','width',1080,'height',1920,
    'selectedMediaIds',(select jsonb_agg(s -> 'mediaId') from jsonb_array_elements(v_scenes) s),
    'scenes',v_scenes,'title','Conheça este imóvel',
    'overlays',jsonb_build_array('title','cta'),'cta','Agende uma visita',
    'soundtrackPolicy','silent',
    'factualSources',jsonb_build_array(
      jsonb_build_object('field','title','source','yzi_imob_properties')),
    'diagnostics','[]'::jsonb
  );
end;
$function$;

revoke all on function public.build_yzi_imob_video_tour_plan(uuid,uuid,uuid)
  from public, anon, authenticated;

create or replace function public.start_yzi_imob_creative_generation_job(p_job_id uuid)
returns table (job_id uuid, request_id uuid, job_status text)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_job public.yzi_imob_creative_generation_jobs%rowtype;
begin
  select j.* into v_job
  from public.yzi_imob_creative_generation_jobs j
  join public.tenant_memberships tm on tm.tenant_id = j.tenant_id
    and tm.user_id = v_user_id and tm.status = 'active'
    and tm.role = any (array['owner','admin','operator']::text[])
  where j.id = p_job_id for update of j;
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  elsif v_job.id is null then
    raise exception using errcode = '42501', message = 'creative_job_not_found_or_forbidden';
  elsif v_job.status = any (array['processing','succeeded']::text[]) then
    return query select v_job.id, v_job.request_id, v_job.status; return;
  elsif v_job.status <> 'queued' or v_job.attempt_count >= v_job.max_attempts then
    raise exception using errcode = '55000', message = 'creative_job_not_startable';
  end if;
  update public.yzi_imob_creative_generation_jobs
  set status='processing',attempt_count=attempt_count+1,started_at=now(),
      completed_at=null,updated_at=now()
  where id=v_job.id returning * into v_job;
  update public.yzi_imob_creative_deliverables
  set status='generating',publication_eligible=false,updated_at=now()
  where id=v_job.deliverable_id and tenant_id=v_job.tenant_id;
  perform public.recompute_yzi_imob_creative_request_status(v_job.request_id);
  insert into public.yzi_imob_creative_generation_events (
    tenant_id,property_id,request_id,deliverable_id,job_id,event_type,
    actor_user_id,correlation_id,metadata
  ) values (
    v_job.tenant_id,v_job.property_id,v_job.request_id,v_job.deliverable_id,
    v_job.id,'job_started',v_user_id,v_job.correlation_id,
    jsonb_build_object('operation',v_job.operation,'retry_number',v_job.retry_number)
  );
  return query select v_job.id,v_job.request_id,v_job.status;
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
  v_error text := btrim(coalesce(p_error_code,''));
begin
  if v_error !~ '^[a-z0-9_]{1,80}$' then
    raise exception using errcode = '22023', message = 'invalid_creative_error_code';
  end if;
  select j.* into v_job
  from public.yzi_imob_creative_generation_jobs j
  join public.tenant_memberships tm on tm.tenant_id=j.tenant_id
    and tm.user_id=v_user_id and tm.status='active'
    and tm.role=any(array['owner','admin','operator']::text[])
  where j.id=p_job_id for update of j;
  if v_user_id is null then
    raise exception using errcode='28000',message='authentication_required';
  elsif v_job.id is null then
    raise exception using errcode='42501',message='creative_job_not_found_or_forbidden';
  elsif v_job.status='failed' and v_job.last_error_code=v_error then
    return query select v_job.id,v_job.request_id,v_job.status; return;
  elsif v_job.status <> all(array['queued','processing']::text[]) then
    raise exception using errcode='55000',message='creative_job_not_failable';
  end if;
  update public.yzi_imob_creative_generation_jobs
  set status='failed',completed_at=now(),last_error_code=v_error,updated_at=now()
  where id=v_job.id;
  update public.yzi_imob_creative_deliverables
  set status='failed',publication_eligible=false,updated_at=now()
  where id=v_job.deliverable_id and tenant_id=v_job.tenant_id;
  perform public.recompute_yzi_imob_creative_request_status(v_job.request_id);
  insert into public.yzi_imob_creative_generation_events (
    tenant_id,property_id,request_id,deliverable_id,job_id,event_type,
    actor_user_id,correlation_id,metadata
  ) values (
    v_job.tenant_id,v_job.property_id,v_job.request_id,v_job.deliverable_id,
    v_job.id,'job_failed',v_user_id,v_job.correlation_id,
    jsonb_build_object('error_code',v_error,'isolated',true)
  );
  return query select v_job.id,v_job.request_id,'failed'::text;
end;
$function$;

create or replace function public.retry_yzi_imob_creative_generation_job(
  p_failed_job_id uuid,
  p_idempotency_key text
)
returns table (job_id uuid, request_id uuid, reused boolean)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_failed public.yzi_imob_creative_generation_jobs%rowtype;
  v_job public.yzi_imob_creative_generation_jobs%rowtype;
  v_key text := btrim(coalesce(p_idempotency_key,''));
begin
  select j.* into v_failed
  from public.yzi_imob_creative_generation_jobs j
  join public.tenant_memberships tm on tm.tenant_id=j.tenant_id
    and tm.user_id=v_user_id and tm.status='active'
    and tm.role=any(array['owner','admin','operator']::text[])
  where j.id=p_failed_job_id for update of j;
  if v_user_id is null then
    raise exception using errcode='28000',message='authentication_required';
  elsif v_failed.id is null or v_failed.status <> 'failed' then
    raise exception using errcode='55000',message='creative_failed_job_required';
  elsif length(v_key) not between 1 and 200 or v_failed.retry_number >= 3 then
    raise exception using errcode='22023',message='creative_retry_invalid';
  end if;
  select * into v_job from public.yzi_imob_creative_generation_jobs
  where tenant_id=v_failed.tenant_id and property_id=v_failed.property_id
    and deliverable_id=v_failed.deliverable_id and operation='retry'
    and idempotency_key=v_key;
  if v_job.id is not null then
    return query select v_job.id,v_job.request_id,true; return;
  end if;
  insert into public.yzi_imob_creative_generation_jobs (
    tenant_id,property_id,request_id,deliverable_id,generation_kind,
    source_revision_id,adjustment_context,operation,retry_of_job_id,retry_number,
    status,idempotency_key,max_attempts,created_by_user_id
  ) values (
    v_failed.tenant_id,v_failed.property_id,v_failed.request_id,v_failed.deliverable_id,
    v_failed.generation_kind,v_failed.source_revision_id,v_failed.adjustment_context,
    'retry',v_failed.id,v_failed.retry_number+1,'queued',v_key,1,v_user_id
  ) returning * into v_job;
  update public.yzi_imob_creative_deliverables
  set status='planned',updated_at=now() where id=v_job.deliverable_id;
  perform public.recompute_yzi_imob_creative_request_status(v_job.request_id);
  insert into public.yzi_imob_creative_generation_events (
    tenant_id,property_id,request_id,deliverable_id,job_id,event_type,
    actor_user_id,correlation_id,metadata
  ) values (
    v_job.tenant_id,v_job.property_id,v_job.request_id,v_job.deliverable_id,
    v_job.id,'job_retried',v_user_id,v_job.correlation_id,
    jsonb_build_object('retry_of_job_id',v_failed.id,'retry_number',v_job.retry_number)
  );
  return query select v_job.id,v_job.request_id,false;
end;
$function$;

create or replace function public.complete_yzi_imob_creative_generation_job(p_job_id uuid)
returns table (job_id uuid, request_id uuid, job_status text, revision_count integer)
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
  v_plan jsonb;
  v_snapshot jsonb;
  v_item jsonb;
  v_hash text;
  v_number integer;
  v_source_media_id uuid;
  v_asset_id uuid;
  v_asset_count integer := 0;
begin
  select j.* into v_job
  from public.yzi_imob_creative_generation_jobs j
  join public.tenant_memberships tm on tm.tenant_id=j.tenant_id
    and tm.user_id=v_user_id and tm.status='active'
    and tm.role=any(array['owner','admin','operator']::text[])
  where j.id=p_job_id for update of j;
  if v_user_id is null then
    raise exception using errcode='28000',message='authentication_required';
  elsif v_job.id is null then
    raise exception using errcode='42501',message='creative_job_not_found_or_forbidden';
  elsif v_job.status='succeeded' then
    select count(*)::integer into v_asset_count
    from public.yzi_imob_creative_revisions
    where tenant_id=v_job.tenant_id and deliverable_id=v_job.deliverable_id;
    return query select v_job.id,v_job.request_id,v_job.status,v_asset_count; return;
  elsif v_job.status <> 'processing' then
    raise exception using errcode='55000',message='creative_job_not_processing';
  end if;

  select * into v_request from public.yzi_imob_creative_requests
  where id=v_job.request_id and tenant_id=v_job.tenant_id and property_id=v_job.property_id;
  select * into v_deliverable from public.yzi_imob_creative_deliverables
  where id=v_job.deliverable_id and tenant_id=v_job.tenant_id
    and property_id=v_job.property_id and request_id=v_job.request_id
  for update;
  if v_deliverable.id is null then
    raise exception using errcode='55000',message='creative_job_deliverable_missing';
  end if;

  if exists (
    select 1
    from public.yzi_imob_creative_assets a
    join public.yzi_imob_property_media m
      on m.id=a.source_property_media_id and m.tenant_id=a.tenant_id
     and m.property_id=a.property_id
    where a.tenant_id=v_job.tenant_id and a.request_id=v_job.request_id
      and a.asset_role='source_media'
      and (
        m.media_status <> 'approved' or m.processing_status <> 'ready'
        or not m.is_publication_allowed
        or (v_deliverable.deliverable_type='carousel' and not m.eligible_for_carousel)
        or (v_deliverable.deliverable_type='video_tour' and not m.eligible_for_video)
      )
  ) then
    raise exception using errcode='55000',message='creative_source_media_no_longer_eligible';
  end if;

  if v_deliverable.deliverable_type='carousel' then
    v_plan := public.build_yzi_imob_carousel_editorial_plan(
      v_job.tenant_id,v_job.property_id,v_job.request_id);
  else
    v_plan := public.build_yzi_imob_video_tour_plan(
      v_job.tenant_id,v_job.property_id,v_job.request_id);
  end if;
  if v_job.generation_kind='revision' then
    if v_deliverable.deliverable_type='carousel' then
      if v_job.adjustment_context->>'kind' in ('swap_media','use_approved_media') then
        v_plan := jsonb_set(v_plan,
          array['cards',((v_job.adjustment_context->>'card_position')::integer-1)::text,'mediaId'],
          to_jsonb(v_job.adjustment_context->>'replacement_media_id'));
      elsif v_job.adjustment_context->>'kind'='shorten_headline' then
        v_plan := jsonb_set(v_plan,
          array['cards',((v_job.adjustment_context->>'card_position')::integer-1)::text,'headline'],
          to_jsonb(left(v_plan #>> array[
            'cards',((v_job.adjustment_context->>'card_position')::integer-1)::text,'headline'
          ],40)));
      elsif v_job.adjustment_context->>'kind'='remove_fact' then
        v_plan := jsonb_set(v_plan,
          array['cards',((v_job.adjustment_context->>'card_position')::integer-1)::text,'facts'],
          '[]'::jsonb);
      elsif v_job.adjustment_context->>'kind'='change_cta' then
        v_plan := jsonb_set(v_plan,array['cards','6','headline'],
          to_jsonb(v_job.adjustment_context->>'observation'));
      end if;
    else
      if v_job.adjustment_context->>'kind'='swap_scene_media' then
        v_plan := jsonb_set(v_plan,
          array['scenes',((v_job.adjustment_context->>'scene_position')::integer-1)::text,'mediaId'],
          to_jsonb(v_job.adjustment_context->>'replacement_media_id'));
        v_plan := jsonb_set(v_plan,
          array['selectedMediaIds',((v_job.adjustment_context->>'scene_position')::integer-1)::text],
          to_jsonb(v_job.adjustment_context->>'replacement_media_id'));
      elsif v_job.adjustment_context->>'kind'='remove_overlay' then
        v_plan := jsonb_set(v_plan,
          array['scenes',((v_job.adjustment_context->>'scene_position')::integer-1)::text,'overlay'],
          'null'::jsonb,true);
      elsif v_job.adjustment_context->>'kind'='slow_motion' then
        v_plan := jsonb_set(v_plan,
          array['scenes',((v_job.adjustment_context->>'scene_position')::integer-1)::text,'motionPreset'],
          '"slow_zoom_in"'::jsonb);
      elsif v_job.adjustment_context->>'kind'='reduce_duration' then
        v_plan := jsonb_set(v_plan,array['duration'],
          to_jsonb((v_job.adjustment_context->>'duration')::integer));
      elsif v_job.adjustment_context->>'kind'='correct_cta' then
        v_plan := jsonb_set(v_plan,array['cta'],
          to_jsonb(v_job.adjustment_context->>'observation'));
      end if;
    end if;
    v_plan := v_plan || jsonb_build_object('governedAdjustment',v_job.adjustment_context);
  end if;
  select coalesce(max(revision_number),0)+1 into v_number
  from public.yzi_imob_creative_revisions
  where tenant_id=v_job.tenant_id and deliverable_id=v_job.deliverable_id;
  v_snapshot := jsonb_build_object(
    'contract_version','2026-07-30.creative-mvp.v1',
    'property_id',v_job.property_id,'request_id',v_job.request_id,
    'deliverable_id',v_job.deliverable_id,
    'deliverable_type',v_deliverable.deliverable_type,
    'channels',v_request.intended_channels,'objective',v_request.objective,
    'synthetic',true,'rendered',false,
    'publication_contract',jsonb_build_object(
      'property_id',v_job.property_id,'creative_revision_required',true,
      'external_publication_allowed',false),
    'blueprint',v_plan);
  v_hash := md5(v_snapshot::text) || md5('yzi-imob-creative:' || v_snapshot::text);
  insert into public.yzi_imob_creative_revisions (
    tenant_id,property_id,request_id,deliverable_id,source_revision_id,
    revision_number,status,content_snapshot,content_hash,created_by_user_id
  ) values (
    v_job.tenant_id,v_job.property_id,v_job.request_id,v_job.deliverable_id,
    v_job.source_revision_id,v_number,'in_review',v_snapshot,v_hash,v_user_id
  ) returning * into v_revision;

  if v_deliverable.deliverable_type='carousel' then
    for v_item in select value from jsonb_array_elements(v_plan->'cards')
    loop
      v_source_media_id := nullif(v_item->>'mediaId','')::uuid;
      insert into public.yzi_imob_creative_assets (
        tenant_id,property_id,request_id,deliverable_id,revision_id,
        source_property_media_id,asset_role,media_type,synthetic_uri,content_hash,
        asset_position,asset_kind,storage_state,publication_state,metadata
      ) values (
        v_job.tenant_id,v_job.property_id,v_job.request_id,v_job.deliverable_id,
        v_revision.id,v_source_media_id,'synthetic_output','structured',
        'yzi://creative/'||v_job.request_id||'/'||v_job.deliverable_id||
          '/r'||v_number||'/card-'||(v_item->>'position'),
        md5(v_item::text)||md5('yzi-imob-card:'||v_item::text),
        (v_item->>'position')::smallint,'structured_preview','not_required',
        'not_eligible',jsonb_build_object(
          'template_key','property_editorial_v1','template_version',1,
          'synthetic',true,'rendered',false,'publishable',false)
      ) returning id into v_asset_id;
      if v_source_media_id is not null then
        insert into public.yzi_imob_creative_asset_sources (
          asset_id,tenant_id,property_id,request_id,deliverable_id,revision_id,
          source_property_media_id,source_position
        ) values (
          v_asset_id,v_job.tenant_id,v_job.property_id,v_job.request_id,
          v_job.deliverable_id,v_revision.id,v_source_media_id,1
        );
      end if;
      v_asset_count := v_asset_count + 1;
    end loop;
    if v_asset_count <> 7 then
      raise exception using errcode='55000',message='carousel_asset_cardinality_invalid';
    end if;
  else
    insert into public.yzi_imob_creative_assets (
      tenant_id,property_id,request_id,deliverable_id,revision_id,
      asset_role,media_type,synthetic_uri,content_hash,asset_kind,
      storage_state,publication_state,metadata
    ) values (
      v_job.tenant_id,v_job.property_id,v_job.request_id,v_job.deliverable_id,
      v_revision.id,'synthetic_output','structured',
      'yzi://creative/'||v_job.request_id||'/'||v_job.deliverable_id||
        '/r'||v_number||'/video-plan',
      v_hash,'structured_preview','not_required','not_eligible',
      jsonb_build_object('synthetic',true,'rendered',false,'publishable',false)
    ) returning id into v_asset_id;
    insert into public.yzi_imob_creative_asset_sources (
      asset_id,tenant_id,property_id,request_id,deliverable_id,revision_id,
      source_property_media_id,source_position
    )
    select v_asset_id,v_job.tenant_id,v_job.property_id,v_job.request_id,
      v_job.deliverable_id,v_revision.id,(scene->>'mediaId')::uuid,
      (scene->>'position')::smallint
    from jsonb_array_elements(v_plan->'scenes') scene;
    v_asset_count := 1;
  end if;

  update public.yzi_imob_creative_deliverables
  set status='in_review',current_revision_id=v_revision.id,
      approved_revision_id=null,publication_eligible=false,updated_at=now()
  where id=v_job.deliverable_id;
  update public.yzi_imob_creative_generation_jobs
  set status='succeeded',completed_at=now(),last_error_code=null,updated_at=now()
  where id=v_job.id;
  perform public.recompute_yzi_imob_creative_request_status(v_job.request_id);
  insert into public.yzi_imob_creative_generation_events (
    tenant_id,property_id,request_id,deliverable_id,revision_id,job_id,event_type,
    actor_user_id,correlation_id,metadata
  ) values (
    v_job.tenant_id,v_job.property_id,v_job.request_id,v_job.deliverable_id,
    v_revision.id,v_job.id,'revision_created',v_user_id,v_job.correlation_id,
    jsonb_build_object('revision_number',v_number,'asset_count',v_asset_count,
      'external_execution',false)
  );
  insert into public.yzi_imob_creative_generation_events (
    tenant_id,property_id,request_id,deliverable_id,revision_id,job_id,event_type,
    actor_user_id,correlation_id,metadata
  ) values (
    v_job.tenant_id,v_job.property_id,v_job.request_id,v_job.deliverable_id,
    v_revision.id,v_job.id,'job_succeeded',v_user_id,v_job.correlation_id,
    jsonb_build_object('server_produced',true,'external_execution',false)
  );
  return query select v_job.id,v_job.request_id,'succeeded'::text,1;
end;
$function$;

create or replace function public.decide_yzi_imob_creative_revision(
  p_revision_id uuid,
  p_decision text,
  p_observation text default null
)
returns table (revision_id uuid, request_id uuid, deliverable_status text, request_status text)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_revision public.yzi_imob_creative_revisions%rowtype;
  v_status text;
  v_event text;
  v_note text := nullif(btrim(coalesce(p_observation,'')),'');
begin
  select r.* into v_revision
  from public.yzi_imob_creative_revisions r
  join public.yzi_imob_creative_deliverables d
    on d.id=r.deliverable_id and d.tenant_id=r.tenant_id
   and d.current_revision_id=r.id
  join public.tenant_memberships tm on tm.tenant_id=r.tenant_id
    and tm.user_id=v_user_id and tm.status='active'
    and tm.role=any(array['owner','admin','operator']::text[])
  where r.id=p_revision_id for update of r;
  if v_user_id is null then
    raise exception using errcode='28000',message='authentication_required';
  elsif v_revision.id is null then
    raise exception using errcode='42501',message='creative_revision_not_found_or_forbidden';
  elsif p_decision not in ('approved','changes_requested','rejected')
    or (p_decision <> 'approved' and v_note is null)
    or length(coalesce(v_note,'')) > 1000
  then
    raise exception using errcode='22023',message='invalid_creative_revision_decision';
  elsif v_revision.status <> 'in_review' then
    if v_revision.status=p_decision then
      select d.status into v_status from public.yzi_imob_creative_deliverables d
      where d.id=v_revision.deliverable_id;
      return query select v_revision.id,v_revision.request_id,v_status,
        public.recompute_yzi_imob_creative_request_status(v_revision.request_id);
      return;
    end if;
    raise exception using errcode='55000',message='creative_revision_not_decidable';
  end if;
  update public.yzi_imob_creative_revisions
  set status=p_decision,review_observation=v_note,decided_by_user_id=v_user_id,
      decided_at=now(),updated_at=now()
  where id=v_revision.id;
  update public.yzi_imob_creative_deliverables
  set status=p_decision,
      approved_revision_id=case when p_decision='approved' then v_revision.id else null end,
      publication_eligible=false,updated_at=now()
  where id=v_revision.deliverable_id;
  v_event := case p_decision when 'approved' then 'revision_approved'
    when 'changes_requested' then 'changes_requested' else 'revision_rejected' end;
  insert into public.yzi_imob_creative_generation_events (
    tenant_id,property_id,request_id,deliverable_id,revision_id,event_type,
    actor_user_id,metadata
  ) values (
    v_revision.tenant_id,v_revision.property_id,v_revision.request_id,
    v_revision.deliverable_id,v_revision.id,v_event,v_user_id,
    jsonb_build_object('publication_eligible',false,'promotion_required',p_decision='approved')
  );
  select public.recompute_yzi_imob_creative_request_status(v_revision.request_id)
    into v_status;
  return query select v_revision.id,v_revision.request_id,p_decision,v_status;
end;
$function$;

create or replace function public.guard_yzi_imob_creative_eligibility()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
declare
  v_revision public.yzi_imob_creative_revisions%rowtype;
  v_final_count integer;
begin
  if not new.publication_eligible then
    return new;
  end if;
  select * into v_revision
  from public.yzi_imob_creative_revisions r
  where r.id=new.current_revision_id and r.tenant_id=new.tenant_id
    and r.property_id=new.property_id and r.request_id=new.request_id
    and r.deliverable_id=new.id and r.status='approved';
  if v_revision.id is null
    or new.status <> 'approved'
    or new.approved_revision_id is distinct from new.current_revision_id
    or (
      new.deliverable_type='carousel'
      and coalesce((v_revision.content_snapshot #>> '{blueprint,approvalBlocked}')::boolean,true)
    )
  then
    raise exception using errcode='55000',message='creative_publication_eligibility_invariant_failed';
  end if;
  select count(*)::integer into v_final_count
  from public.yzi_imob_creative_assets a
  where a.tenant_id=new.tenant_id and a.property_id=new.property_id
    and a.request_id=new.request_id and a.deliverable_id=new.id
    and a.revision_id=new.current_revision_id and a.asset_kind='final_render'
    and a.storage_state='promoted' and a.publication_state='eligible'
    and a.storage_bucket='yzi-imob-public'
    and (
      (new.deliverable_type='carousel' and a.media_type='image'
        and a.asset_position between 1 and 7)
      or (new.deliverable_type='video_tour' and a.media_type='video'
        and a.asset_position is null)
    );
  if (new.deliverable_type='carousel' and v_final_count<>7)
    or (new.deliverable_type='video_tour' and v_final_count<>1)
  then
    raise exception using errcode='55000',message='creative_final_render_set_incomplete';
  end if;
  return new;
end;
$function$;

create or replace function public.queue_yzi_imob_creative_revision_job(
  p_revision_id uuid,
  p_deliverable_type text,
  p_adjustment jsonb,
  p_idempotency_key text
)
returns table (job_id uuid, request_id uuid, reused boolean)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_revision public.yzi_imob_creative_revisions%rowtype;
  v_deliverable public.yzi_imob_creative_deliverables%rowtype;
  v_job public.yzi_imob_creative_generation_jobs%rowtype;
  v_key text := btrim(coalesce(p_idempotency_key,''));
  v_replacement uuid := nullif(p_adjustment->>'replacement_media_id','')::uuid;
begin
  select r,d into v_revision,v_deliverable
  from public.yzi_imob_creative_revisions r
  join public.yzi_imob_creative_deliverables d
    on d.id=r.deliverable_id and d.tenant_id=r.tenant_id
   and d.current_revision_id=r.id and d.deliverable_type=p_deliverable_type
  join public.tenant_memberships tm on tm.tenant_id=r.tenant_id
    and tm.user_id=v_user_id and tm.status='active'
    and tm.role=any(array['owner','admin']::text[])
  where r.id=p_revision_id for update of r,d;
  if v_user_id is null then
    raise exception using errcode='28000',message='authentication_required';
  elsif v_revision.id is null or v_revision.status not in ('changes_requested','approved') then
    raise exception using errcode='55000',message='creative_revision_not_adjustable';
  elsif jsonb_typeof(p_adjustment)<>'object' or pg_column_size(p_adjustment)>4096
    or length(v_key) not between 1 and 200
  then
    raise exception using errcode='22023',message='invalid_creative_revision_job';
  end if;
  if v_replacement is not null and not exists (
    select 1 from public.yzi_imob_property_media m
    where m.id=v_replacement and m.tenant_id=v_revision.tenant_id
      and m.property_id=v_revision.property_id and m.media_type='image'
      and m.media_status='approved' and m.processing_status='ready'
      and m.is_publication_allowed
      and (
        (p_deliverable_type='carousel' and m.eligible_for_carousel)
        or (p_deliverable_type='video_tour' and m.eligible_for_video)
      )
  ) then
    raise exception using errcode='22023',message='invalid_replacement_property_media';
  end if;
  perform pg_advisory_xact_lock(
    hashtext(v_revision.tenant_id::text||':'||v_revision.deliverable_id||':'||v_key));
  select * into v_job from public.yzi_imob_creative_generation_jobs
  where tenant_id=v_revision.tenant_id and property_id=v_revision.property_id
    and deliverable_id=v_revision.deliverable_id and operation='revise'
    and idempotency_key=v_key;
  if v_job.id is not null then
    return query select v_job.id,v_job.request_id,true; return;
  end if;
  insert into public.yzi_imob_creative_generation_jobs (
    tenant_id,property_id,request_id,deliverable_id,generation_kind,
    source_revision_id,adjustment_context,operation,status,idempotency_key,
    created_by_user_id
  ) values (
    v_revision.tenant_id,v_revision.property_id,v_revision.request_id,
    v_revision.deliverable_id,'revision',v_revision.id,p_adjustment,'revise',
    'queued',v_key,v_user_id
  ) returning * into v_job;
  update public.yzi_imob_creative_deliverables
  set status='planned',approved_revision_id=null,publication_eligible=false,updated_at=now()
  where id=v_revision.deliverable_id;
  perform public.recompute_yzi_imob_creative_request_status(v_revision.request_id);
  insert into public.yzi_imob_creative_generation_events (
    tenant_id,property_id,request_id,deliverable_id,revision_id,job_id,event_type,
    actor_user_id,correlation_id,metadata
  ) values (
    v_revision.tenant_id,v_revision.property_id,v_revision.request_id,
    v_revision.deliverable_id,v_revision.id,v_job.id,'job_queued',v_user_id,
    v_job.correlation_id,jsonb_build_object('operation','revise')
  );
  return query select v_job.id,v_job.request_id,false;
end;
$function$;

revoke all on function public.queue_yzi_imob_creative_revision_job(uuid,text,jsonb,text)
  from public, anon, authenticated;

create or replace function public.request_yzi_imob_creative_carousel_revision(
  p_revision_id uuid,
  p_adjustment_kind text,
  p_card_position integer,
  p_replacement_media_id uuid default null,
  p_observation text default null,
  p_idempotency_key text default null
)
returns table (job_id uuid, request_id uuid, reused boolean)
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_kind text := btrim(coalesce(p_adjustment_kind,''));
  v_note text := nullif(btrim(coalesce(p_observation,'')),'');
  v_adjustment jsonb;
begin
  if v_kind not in (
      'swap_media','shorten_headline','remove_fact','change_cta',
      'correct_fact','use_approved_media'
    )
    or p_card_position not between 1 and 7
    or length(coalesce(v_note,''))>500
    or coalesce(v_note,'') ~* '(https?://|token|secret|api[_ -]?key|provider|model|bucket|path)'
    or (v_kind in ('swap_media','use_approved_media') and p_replacement_media_id is null)
    or (v_kind='change_cta' and (p_card_position<>7 or v_note is null or length(v_note)>80))
  then
    raise exception using errcode='22023',message='invalid_carousel_adjustment';
  end if;
  v_adjustment := jsonb_strip_nulls(jsonb_build_object(
    'kind',v_kind,'card_position',p_card_position,
    'replacement_media_id',p_replacement_media_id,'observation',v_note));
  return query select * from public.queue_yzi_imob_creative_revision_job(
    p_revision_id,'carousel',v_adjustment,p_idempotency_key);
end;
$function$;

create or replace function public.request_yzi_imob_creative_video_revision(
  p_revision_id uuid,
  p_adjustment_kind text,
  p_scene_position integer default null,
  p_replacement_media_id uuid default null,
  p_duration integer default null,
  p_observation text default null,
  p_idempotency_key text default null
)
returns table (job_id uuid, request_id uuid, reused boolean)
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_kind text := btrim(coalesce(p_adjustment_kind,''));
  v_note text := nullif(btrim(coalesce(p_observation,'')),'');
  v_adjustment jsonb;
begin
  if v_kind not in (
      'swap_scene_media','reorder_scene','reduce_duration','remove_overlay',
      'slow_motion','correct_cta'
    )
    or length(coalesce(v_note,''))>500
    or coalesce(v_note,'') ~* '(https?://|token|secret|api[_ -]?key|provider|model|bucket|path)'
    or (v_kind in ('swap_scene_media','reorder_scene','remove_overlay','slow_motion')
      and p_scene_position not between 1 and 10)
    or (v_kind='swap_scene_media' and p_replacement_media_id is null)
    or (v_kind='reduce_duration' and p_duration not in (15,20,30))
    or (v_kind='correct_cta' and (v_note is null or length(v_note)>80))
  then
    raise exception using errcode='22023',message='invalid_video_adjustment';
  end if;
  v_adjustment := jsonb_strip_nulls(jsonb_build_object(
    'kind',v_kind,'scene_position',p_scene_position,
    'replacement_media_id',p_replacement_media_id,'duration',p_duration,
    'observation',v_note));
  return query select * from public.queue_yzi_imob_creative_revision_job(
    p_revision_id,'video_tour',v_adjustment,p_idempotency_key);
end;
$function$;

create unique index yzi_imob_creative_assets_revision_kind_unpositioned_unique
  on public.yzi_imob_creative_assets (tenant_id, revision_id, asset_kind)
  where asset_role='synthetic_output' and asset_position is null;

create or replace function public.guard_yzi_imob_creative_asset_append_only()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
begin
  raise exception using errcode='55000',message='creative_assets_are_immutable';
end;
$function$;
create trigger yzi_imob_creative_assets_append_only
before update or delete on public.yzi_imob_creative_assets
for each row execute function public.guard_yzi_imob_creative_asset_append_only();
create trigger yzi_imob_creative_asset_sources_append_only
before update or delete on public.yzi_imob_creative_asset_sources
for each row execute function public.guard_yzi_imob_creative_asset_append_only();

create or replace function public.register_yzi_imob_creative_stored_asset(
  p_revision_id uuid,
  p_asset_kind text,
  p_asset_position integer,
  p_content_hash text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (asset_id uuid, object_path text, reused boolean)
language plpgsql
security definer
set search_path = pg_catalog, public, storage
as $function$
declare
  v_revision public.yzi_imob_creative_revisions%rowtype;
  v_deliverable public.yzi_imob_creative_deliverables%rowtype;
  v_filename text;
  v_path text;
  v_asset_id uuid;
begin
  if current_user not in ('service_role','postgres','supabase_admin') then
    raise exception using errcode='42501',message='creative_storage_server_only';
  end if;
  select r, d into v_revision, v_deliverable
  from public.yzi_imob_creative_revisions r
  join public.yzi_imob_creative_deliverables d
    on d.id=r.deliverable_id and d.tenant_id=r.tenant_id
   and d.property_id=r.property_id and d.request_id=r.request_id
   and d.current_revision_id=r.id
  where r.id=p_revision_id;
  if v_revision.id is null or p_asset_kind not in ('rendered_preview','thumbnail')
    or p_content_hash !~ '^[a-f0-9]{64}$'
    or jsonb_typeof(coalesce(p_metadata,'{}'::jsonb)) <> 'object'
  then
    raise exception using errcode='22023',message='invalid_creative_stored_asset';
  end if;
  if v_deliverable.deliverable_type='carousel' and p_asset_kind='rendered_preview' then
    if p_asset_position not between 1 and 7 then
      raise exception using errcode='22023',message='carousel_render_position_required';
    end if;
    v_filename := 'card-'||lpad(p_asset_position::text,2,'0')||'.png';
  elsif v_deliverable.deliverable_type='video_tour' and p_asset_kind='rendered_preview'
    and p_asset_position is null
  then
    v_filename := 'video-preview.mp4';
  elsif p_asset_kind='thumbnail' and p_asset_position is null then
    v_filename := 'thumbnail.png';
  else
    raise exception using errcode='22023',message='creative_asset_shape_invalid';
  end if;
  v_path := public.build_yzi_imob_creative_asset_path(
    v_revision.tenant_id,v_revision.property_id,v_revision.deliverable_id,
    v_revision.id,v_filename);
  select a.id into v_asset_id from public.yzi_imob_creative_assets a
  where a.tenant_id=v_revision.tenant_id and a.revision_id=v_revision.id
    and a.asset_kind=p_asset_kind
    and a.asset_position is not distinct from p_asset_position;
  if v_asset_id is not null then
    if not exists (
      select 1 from public.yzi_imob_creative_assets a
      where a.id=v_asset_id and a.content_hash=p_content_hash
        and a.storage_bucket='yzi-imob-private' and a.object_path=v_path
    ) then
      raise exception using errcode='23505',message='creative_asset_registration_conflict';
    end if;
    return query select v_asset_id,v_path,true; return;
  end if;
  if not exists (
    select 1 from storage.objects o
    where o.bucket_id='yzi-imob-private' and o.name=v_path
  ) then
    raise exception using errcode='55000',message='creative_private_object_missing';
  end if;
  insert into public.yzi_imob_creative_assets (
    tenant_id,property_id,request_id,deliverable_id,revision_id,asset_role,
    media_type,synthetic_uri,content_hash,asset_position,asset_kind,
    storage_state,publication_state,storage_bucket,object_path,metadata
  ) values (
    v_revision.tenant_id,v_revision.property_id,v_revision.request_id,
    v_revision.deliverable_id,v_revision.id,'synthetic_output',
    case when right(v_filename,4)='.mp4' then 'video' else 'image' end,
    'yzi://creative/'||v_revision.request_id||'/'||v_revision.deliverable_id||
      '/r'||v_revision.revision_number||'/'||
      replace(replace(v_filename,'.png',''),'.mp4',''),
    p_content_hash,p_asset_position,p_asset_kind,'stored','not_eligible',
    'yzi-imob-private',v_path,coalesce(p_metadata,'{}'::jsonb)
  ) returning id into v_asset_id;
  insert into public.yzi_imob_creative_generation_events (
    tenant_id,property_id,request_id,deliverable_id,revision_id,event_type,metadata
  ) values (
    v_revision.tenant_id,v_revision.property_id,v_revision.request_id,
    v_revision.deliverable_id,v_revision.id,'asset_stored',
    jsonb_build_object('asset_id',v_asset_id,'asset_kind',p_asset_kind)
  );
  return query select v_asset_id,v_path,false;
end;
$function$;

revoke all on function public.register_yzi_imob_creative_stored_asset(
  uuid,text,integer,text,jsonb
) from public, anon, authenticated;
grant execute on function public.register_yzi_imob_creative_stored_asset(
  uuid,text,integer,text,jsonb
) to service_role;

create or replace function public.finalize_yzi_imob_creative_asset_promotion(
  p_revision_id uuid
)
returns table (deliverable_id uuid, promoted_assets integer, reused boolean)
language plpgsql
security definer
set search_path = pg_catalog, public, storage
as $function$
declare
  v_revision public.yzi_imob_creative_revisions%rowtype;
  v_deliverable public.yzi_imob_creative_deliverables%rowtype;
  v_asset public.yzi_imob_creative_assets%rowtype;
  v_public_path text;
  v_count integer := 0;
  v_required integer;
begin
  if current_user not in ('service_role','postgres','supabase_admin') then
    raise exception using errcode='42501',message='creative_storage_server_only';
  end if;
  select r,d into v_revision,v_deliverable
  from public.yzi_imob_creative_revisions r
  join public.yzi_imob_creative_deliverables d
    on d.id=r.deliverable_id and d.tenant_id=r.tenant_id
   and d.property_id=r.property_id and d.request_id=r.request_id
   and d.current_revision_id=r.id and d.approved_revision_id=r.id
  where r.id=p_revision_id and r.status='approved'
  for update of d;
  if v_revision.id is null then
    raise exception using errcode='55000',message='creative_current_approval_required';
  end if;
  if v_deliverable.publication_eligible then
    select count(*)::integer into v_count
    from public.yzi_imob_creative_assets
    where tenant_id=v_revision.tenant_id and revision_id=v_revision.id
      and asset_kind='final_render' and publication_state='eligible';
    return query select v_deliverable.id,v_count,true; return;
  end if;
  v_required := case when v_deliverable.deliverable_type='carousel' then 7 else 1 end;
  select count(*)::integer into v_count
  from public.yzi_imob_creative_assets a
  where a.tenant_id=v_revision.tenant_id and a.revision_id=v_revision.id
    and a.asset_kind='rendered_preview' and a.storage_state='stored'
    and a.storage_bucket='yzi-imob-private'
    and (
      (v_deliverable.deliverable_type='carousel' and a.media_type='image'
        and a.asset_position between 1 and 7)
      or (v_deliverable.deliverable_type='video_tour' and a.media_type='video'
        and a.asset_position is null)
    );
  if v_count <> v_required then
    raise exception using errcode='55000',message='creative_render_set_incomplete';
  end if;
  v_count := 0;
  for v_asset in
    select * from public.yzi_imob_creative_assets
    where tenant_id=v_revision.tenant_id and revision_id=v_revision.id
      and asset_kind='rendered_preview' and storage_state='stored'
    order by asset_position nulls first
  loop
    v_public_path := v_asset.object_path;
    if not exists (
      select 1 from storage.objects o
      where o.bucket_id='yzi-imob-public' and o.name=v_public_path
    ) then
      raise exception using errcode='55000',message='creative_promoted_object_missing';
    end if;
    insert into public.yzi_imob_creative_assets (
      tenant_id,property_id,request_id,deliverable_id,revision_id,asset_role,
      media_type,synthetic_uri,content_hash,asset_position,asset_kind,
      storage_state,publication_state,storage_bucket,object_path,metadata
    ) values (
      v_asset.tenant_id,v_asset.property_id,v_asset.request_id,v_asset.deliverable_id,
      v_asset.revision_id,'synthetic_output',v_asset.media_type,
      v_asset.synthetic_uri||'-final',v_asset.content_hash,v_asset.asset_position,
      'final_render','promoted','eligible','yzi-imob-public',v_public_path,
      v_asset.metadata||jsonb_build_object('promoted_from_asset_id',v_asset.id)
    );
    v_count := v_count + 1;
  end loop;
  update public.yzi_imob_creative_deliverables
  set publication_eligible=true,updated_at=now()
  where id=v_deliverable.id and current_revision_id=v_revision.id
    and approved_revision_id=v_revision.id;
  insert into public.yzi_imob_creative_generation_events (
    tenant_id,property_id,request_id,deliverable_id,revision_id,event_type,metadata
  ) values (
    v_revision.tenant_id,v_revision.property_id,v_revision.request_id,
    v_revision.deliverable_id,v_revision.id,'asset_promoted',
    jsonb_build_object('asset_count',v_count,'external_publication',false)
  );
  return query select v_deliverable.id,v_count,false;
end;
$function$;

revoke all on function public.finalize_yzi_imob_creative_asset_promotion(uuid)
  from public, anon, authenticated;
grant execute on function public.finalize_yzi_imob_creative_asset_promotion(uuid)
  to service_role;

insert into storage.buckets (id, name, public)
values
  ('yzi-imob-private', 'yzi-imob-private', false),
  ('yzi-imob-public', 'yzi-imob-public', false)
on conflict (id) do update
set public = false
where storage.buckets.name = excluded.name;

do $block$
begin
  if exists (
    select 1 from storage.buckets
    where id=any(array['yzi-imob-private','yzi-imob-public']::text[])
      and (name <> id or public)
  ) or (
    select count(*) from storage.buckets
    where id=any(array['yzi-imob-private','yzi-imob-public']::text[])
  ) <> 2 then
    raise exception using errcode='55000',message='canonical_creative_bucket_contract_conflict';
  end if;
end;
$block$;

create policy yzi_imob_creative_private_objects_select_member
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'yzi-imob-private'
    and exists (
      select 1
      from public.yzi_imob_creative_assets a
      join public.tenant_memberships tm
        on tm.tenant_id = a.tenant_id
       and tm.user_id = auth.uid()
       and tm.status = 'active'
      where a.storage_bucket = bucket_id
        and a.object_path = name
        and a.storage_state = 'stored'
        and a.publication_state = 'not_eligible'
    )
  );

create policy yzi_imob_creative_public_objects_select_member
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'yzi-imob-public'
    and exists (
      select 1
      from public.yzi_imob_creative_assets a
      join public.yzi_imob_creative_deliverables d
        on d.id = a.deliverable_id
       and d.tenant_id = a.tenant_id
       and d.property_id = a.property_id
       and d.request_id = a.request_id
       and d.approved_revision_id = a.revision_id
       and d.current_revision_id = a.revision_id
       and d.publication_eligible
      join public.tenant_memberships tm
        on tm.tenant_id = a.tenant_id
       and tm.user_id = auth.uid()
       and tm.status = 'active'
      where a.storage_bucket = bucket_id
        and a.object_path = name
        and a.asset_kind = 'final_render'
        and a.storage_state = 'promoted'
        and a.publication_state = any (array['eligible','published']::text[])
    )
  );

-- There are intentionally no authenticated INSERT/UPDATE/DELETE policies on
-- storage.objects. A future explicitly authorized worker must store bytes and
-- then call a server-only registration/promotion contract.

comment on table public.yzi_imob_property_media_events is
  'Append-only audit trail for governed Creative media classification.';
comment on table public.yzi_imob_creative_asset_sources is
  'Tenant/property-scoped provenance between immutable Creative assets and canonical property media.';

revoke all on function public.create_yzi_imob_creative_request(
  uuid,text,text[],text[],uuid[],jsonb,text
) from public, anon;
grant execute on function public.create_yzi_imob_creative_request(
  uuid,text,text[],text[],uuid[],jsonb,text
) to authenticated;
revoke all on function public.start_yzi_imob_creative_generation_job(uuid)
  from public, anon;
grant execute on function public.start_yzi_imob_creative_generation_job(uuid)
  to authenticated;
revoke all on function public.complete_yzi_imob_creative_generation_job(uuid)
  from public, anon;
grant execute on function public.complete_yzi_imob_creative_generation_job(uuid)
  to authenticated;
revoke all on function public.fail_yzi_imob_creative_generation_job(uuid,text)
  from public, anon;
grant execute on function public.fail_yzi_imob_creative_generation_job(uuid,text)
  to authenticated;
revoke all on function public.retry_yzi_imob_creative_generation_job(uuid,text)
  from public, anon;
grant execute on function public.retry_yzi_imob_creative_generation_job(uuid,text)
  to authenticated;
revoke all on function public.decide_yzi_imob_creative_revision(uuid,text,text)
  from public, anon;
grant execute on function public.decide_yzi_imob_creative_revision(uuid,text,text)
  to authenticated;
revoke all on function public.request_yzi_imob_creative_carousel_revision(
  uuid,text,integer,uuid,text,text
) from public, anon;
grant execute on function public.request_yzi_imob_creative_carousel_revision(
  uuid,text,integer,uuid,text,text
) to authenticated;
revoke all on function public.request_yzi_imob_creative_video_revision(
  uuid,text,integer,uuid,integer,text,text
) from public, anon;
grant execute on function public.request_yzi_imob_creative_video_revision(
  uuid,text,integer,uuid,integer,text,text
) to authenticated;

commit;
