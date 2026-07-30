begin;

-- YZI IMOB - Creative Engine / Carousel MVP.
-- Additive evolution of the governed foundation. No external renderer,
-- publication side effect, caller-provided output, URL, tenant or ownership.

create or replace function public.guard_yzi_imob_carousel_only_contract()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
begin
  if tg_table_name = 'yzi_imob_creative_requests'
    and new.desired_formats <> array['carousel']::text[]
  then
    raise exception using errcode='22023',message='carousel_is_the_only_active_creative_format';
  end if;
  if tg_table_name = 'yzi_imob_creative_deliverables'
    and new.deliverable_type <> 'carousel'
  then
    raise exception using errcode='22023',message='carousel_is_the_only_active_creative_deliverable';
  end if;
  return new;
end;
$function$;

create trigger yzi_imob_creative_requests_carousel_only
before insert on public.yzi_imob_creative_requests
for each row execute function public.guard_yzi_imob_carousel_only_contract();

create trigger yzi_imob_creative_deliverables_carousel_only
before insert on public.yzi_imob_creative_deliverables
for each row execute function public.guard_yzi_imob_carousel_only_contract();

alter table public.yzi_imob_creative_revisions
  add column source_revision_id uuid null,
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
          and content_snapshot #>> '{blueprint,kind}' = 'carousel_editorial_plan'
          and content_snapshot #>> '{blueprint,templateKey}' = 'property_editorial_v1'
          and jsonb_array_length(content_snapshot #> '{blueprint,cards}') = 7
        )
      )
      and pg_column_size(content_snapshot) <= 65536
    ),
  add constraint yzi_imob_creative_revisions_source_fkey
    foreign key (source_revision_id, tenant_id, property_id, request_id, deliverable_id)
    references public.yzi_imob_creative_revisions
      (id, tenant_id, property_id, request_id, deliverable_id)
    on delete restrict;

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
    or old.source_revision_id is distinct from new.source_revision_id
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

alter table public.yzi_imob_creative_assets
  add column asset_position smallint null,
  add column asset_kind text not null default 'source_media',
  add column storage_state text not null default 'not_required',
  add column publication_state text not null default 'not_eligible',
  add column storage_bucket text null,
  add column object_path text null,
  drop constraint yzi_imob_creative_assets_source_unique,
  drop constraint yzi_imob_creative_assets_source_check,
  add constraint yzi_imob_creative_assets_kind_check
    check (
      asset_kind = any (
        array[
          'structured_preview',
          'rendered_preview',
          'final_render',
          'source_media',
          'thumbnail'
        ]::text[]
      )
    ),
  add constraint yzi_imob_creative_assets_storage_state_check
    check (
      storage_state = any (
        array['not_required', 'pending', 'stored', 'failed', 'promoted']::text[]
      )
    ),
  add constraint yzi_imob_creative_assets_publication_state_check
    check (
      publication_state = any (
        array['not_eligible', 'eligible', 'published']::text[]
      )
    ),
  add constraint yzi_imob_creative_assets_storage_text_check
    check (
      (storage_bucket is null or storage_bucket = any (
        array['yzi-imob-private', 'yzi-imob-public']::text[]
      ))
      and (object_path is null or (
        length(object_path) between 1 and 700
        and object_path !~ '(^|/)\.\.?(/|$)'
      ))
    ),
  add constraint yzi_imob_creative_assets_storage_contract_check
    check (
      (
        asset_kind = 'structured_preview'
        and asset_role = 'synthetic_output'
        and media_type = any (array['image', 'video', 'structured']::text[])
        and storage_state = 'not_required'
        and publication_state = 'not_eligible'
        and storage_bucket is null
        and object_path is null
      )
      or (
        asset_kind = 'source_media'
        and asset_role = 'source_media'
        and storage_state = 'not_required'
        and publication_state = 'not_eligible'
        and storage_bucket is null
        and object_path is null
      )
      or (
        asset_kind = 'rendered_preview'
        and asset_role = 'synthetic_output'
        and storage_state = any (array['pending', 'stored', 'failed']::text[])
        and publication_state = 'not_eligible'
        and (
          (storage_state in ('pending', 'failed') and storage_bucket is null and object_path is null)
          or (storage_state = 'stored' and storage_bucket = 'yzi-imob-private' and object_path is not null)
        )
      )
      or (
        asset_kind = 'final_render'
        and asset_role = 'synthetic_output'
        and storage_state = 'promoted'
        and publication_state = any (array['eligible', 'published']::text[])
        and storage_bucket = 'yzi-imob-public'
        and object_path is not null
      )
      or (
        asset_kind = 'thumbnail'
        and asset_role = 'synthetic_output'
        and storage_state = any (array['pending', 'stored', 'failed']::text[])
        and publication_state = 'not_eligible'
        and (
          (storage_state in ('pending', 'failed') and storage_bucket is null and object_path is null)
          or (storage_state = 'stored' and storage_bucket = 'yzi-imob-private' and object_path is not null)
        )
      )
    ) not valid,
  add constraint yzi_imob_creative_assets_position_check
    check (
      (asset_role = 'source_media' and asset_position is null)
      or (asset_role = 'synthetic_output' and (asset_position is null or asset_position between 1 and 7))
    ),
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
        and (
          (asset_position is null and synthetic_uri ~ '^yzi://creative/[a-f0-9-]+/[a-f0-9-]+$')
          or
          (asset_position between 1 and 7 and synthetic_uri ~ '^yzi://creative/[a-f0-9-]+/[a-f0-9-]+/r[1-9][0-9]*/card-[1-7]$')
        )
        and content_hash ~ '^[a-f0-9]{64}$'
      )
    );

update public.yzi_imob_creative_assets
set asset_kind = case
      when asset_role = 'source_media' then 'source_media'
      else 'structured_preview'
    end,
    storage_state = 'not_required',
    publication_state = 'not_eligible',
    storage_bucket = null,
    object_path = null;

alter table public.yzi_imob_creative_assets
  validate constraint yzi_imob_creative_assets_storage_contract_check;

create or replace function public.build_yzi_imob_creative_asset_path(
  p_tenant_id uuid,
  p_property_id uuid,
  p_deliverable_id uuid,
  p_revision_id uuid,
  p_asset_name text
)
returns text
language plpgsql
immutable
security invoker
set search_path = pg_catalog
as $function$
declare
  v_asset_name text := btrim(coalesce(p_asset_name, ''));
begin
  if p_tenant_id is null
    or p_property_id is null
    or p_deliverable_id is null
    or p_revision_id is null
    or v_asset_name !~ '^[a-zA-Z0-9][a-zA-Z0-9._-]{0,199}$'
  then
    raise exception using errcode = '22023', message = 'invalid_creative_asset_path_input';
  end if;

  return 'tenants/' || p_tenant_id ||
    '/properties/' || p_property_id ||
    '/creative/' || p_deliverable_id ||
    '/revisions/' || p_revision_id ||
    '/' || v_asset_name;
end;
$function$;

revoke all on function public.build_yzi_imob_creative_asset_path(uuid,uuid,uuid,uuid,text)
  from public, anon, authenticated;

create or replace function public.guard_yzi_imob_creative_asset_storage_contract()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
declare
  v_expected_prefix text;
begin
  if new.object_path is not null then
    if new.deliverable_id is null or new.revision_id is null then
      raise exception using errcode='55000',message='creative_asset_storage_scope_required';
    end if;
    v_expected_prefix :=
      'tenants/' || new.tenant_id ||
      '/properties/' || new.property_id ||
      '/creative/' || new.deliverable_id ||
      '/revisions/' || new.revision_id || '/';
    if left(new.object_path, length(v_expected_prefix)) <> v_expected_prefix then
      raise exception using errcode='55000',message='creative_asset_storage_path_invalid';
    end if;
  end if;

  if new.publication_state in ('eligible', 'published') and not exists (
    select 1
    from public.yzi_imob_creative_revisions r
    join public.yzi_imob_creative_deliverables d
      on d.id = r.deliverable_id
     and d.tenant_id = r.tenant_id
     and d.property_id = r.property_id
     and d.request_id = r.request_id
    where r.id = new.revision_id
      and r.tenant_id = new.tenant_id
      and r.property_id = new.property_id
      and r.request_id = new.request_id
      and r.deliverable_id = new.deliverable_id
      and r.status = 'approved'
      and d.current_revision_id = r.id
      and d.approved_revision_id = r.id
  ) then
    raise exception using errcode='55000',message='creative_asset_publication_requires_governed_approval';
  end if;
  return new;
end;
$function$;

create trigger yzi_imob_creative_assets_guard_storage_contract
before insert or update on public.yzi_imob_creative_assets
for each row execute function public.guard_yzi_imob_creative_asset_storage_contract();

create or replace function public.guard_yzi_imob_creative_approval_event_contract()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
begin
  if new.event_type = 'request_approved' then
    new.metadata :=
      (new.metadata - 'all_deliverables_publication_eligible')
      || jsonb_build_object(
        'all_deliverables_approved', true,
        'publication_eligible', false
      );
  end if;
  return new;
end;
$function$;

create trigger yzi_imob_creative_events_guard_approval_contract
before insert on public.yzi_imob_creative_generation_events
for each row execute function public.guard_yzi_imob_creative_approval_event_contract();

create unique index yzi_imob_creative_assets_source_unique
  on public.yzi_imob_creative_assets (tenant_id, request_id, source_property_media_id)
  where asset_role = 'source_media';

create unique index yzi_imob_creative_assets_revision_position_unique
  on public.yzi_imob_creative_assets (tenant_id, revision_id, asset_position)
  where asset_role = 'synthetic_output';

alter table public.yzi_imob_creative_generation_jobs
  add column generation_kind text not null default 'initial',
  add column deliverable_id uuid null,
  add column source_revision_id uuid null,
  add column adjustment_context jsonb not null default '{}'::jsonb,
  drop constraint yzi_imob_creative_generation_jobs_request_unique,
  add constraint yzi_imob_creative_generation_jobs_kind_check
    check (generation_kind = any (array['initial', 'revision']::text[])),
  add constraint yzi_imob_creative_generation_jobs_adjustment_check
    check (jsonb_typeof(adjustment_context) = 'object' and pg_column_size(adjustment_context) <= 4096),
  add constraint yzi_imob_creative_generation_jobs_deliverable_fkey
    foreign key (deliverable_id, tenant_id, property_id, request_id)
    references public.yzi_imob_creative_deliverables
      (id, tenant_id, property_id, request_id)
    on delete restrict,
  add constraint yzi_imob_creative_generation_jobs_source_revision_fkey
    foreign key (source_revision_id, tenant_id, property_id, request_id, deliverable_id)
    references public.yzi_imob_creative_revisions
      (id, tenant_id, property_id, request_id, deliverable_id)
    on delete restrict,
  add constraint yzi_imob_creative_generation_jobs_kind_shape_check
    check (
      (generation_kind = 'initial' and deliverable_id is null and source_revision_id is null)
      or (generation_kind = 'revision' and deliverable_id is not null and source_revision_id is not null)
    );

create unique index yzi_imob_creative_generation_jobs_initial_unique
  on public.yzi_imob_creative_generation_jobs (tenant_id, request_id)
  where generation_kind = 'initial';

create or replace function public.build_yzi_imob_carousel_editorial_plan(
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
  v_property jsonb;
  v_media_ids uuid[];
  v_media_count integer;
  v_location text;
  v_title text;
  v_reference text;
  v_price text;
  v_private_area text;
  v_bedrooms text;
  v_suites text;
  v_parking text;
  v_facts jsonb := '[]'::jsonb;
  v_diagnostics jsonb := '[]'::jsonb;
begin
  select to_jsonb(p)
    into v_property
  from public.yzi_imob_properties p
  where p.id = p_property_id
    and p.tenant_id = p_tenant_id;

  if v_property is null then
    raise exception using errcode = '42501', message = 'carousel_property_not_found';
  end if;

  select coalesce(array_agg(a.source_property_media_id order by
      coalesce((a.metadata ->> 'is_cover')::boolean, false) desc,
      coalesce((a.metadata ->> 'sort_order')::integer, 0),
      a.source_property_media_id), '{}'::uuid[])
    into v_media_ids
  from public.yzi_imob_creative_assets a
  join public.yzi_imob_property_media media
    on media.id = a.source_property_media_id
   and media.tenant_id = a.tenant_id
   and media.property_id = a.property_id
   and media.media_type = 'image'
   and media.is_publication_allowed
   and media.processing_status = 'ready'
  where a.tenant_id = p_tenant_id
    and a.property_id = p_property_id
    and a.request_id = p_request_id
    and a.asset_role = 'source_media';

  v_media_count := cardinality(v_media_ids);
  if v_media_count = 0 then
    raise exception using errcode = '55000', message = 'carousel_source_media_missing';
  end if;

  v_title := coalesce(nullif(v_property ->> 'title', ''), 'Imóvel');
  v_reference := nullif(v_property ->> 'reference_code', '');
  v_location := concat_ws(', ', nullif(v_property ->> 'neighborhood', ''), nullif(v_property ->> 'city', ''));
  v_price := nullif(v_property ->> 'price', '');
  v_private_area := nullif(v_property ->> 'private_area', '');
  v_bedrooms := nullif(v_property ->> 'bedrooms', '');
  v_suites := nullif(v_property ->> 'suites', '');
  v_parking := nullif(v_property ->> 'parking_spaces', '');

  if v_price is not null then
    v_facts := v_facts || jsonb_build_array(jsonb_build_object(
      'key', 'price', 'displayValue', 'R$ ' || v_price, 'sourceField', 'price'));
  end if;
  if v_private_area is not null then
    v_facts := v_facts || jsonb_build_array(jsonb_build_object(
      'key', 'private_area', 'displayValue', v_private_area || ' m²', 'sourceField', 'private_area'));
  end if;
  if v_bedrooms is not null then
    v_facts := v_facts || jsonb_build_array(jsonb_build_object(
      'key', 'bedrooms', 'displayValue', v_bedrooms || ' quartos', 'sourceField', 'bedrooms'));
  end if;
  if v_suites is not null then
    v_facts := v_facts || jsonb_build_array(jsonb_build_object(
      'key', 'suites', 'displayValue', v_suites || ' suítes', 'sourceField', 'suites'));
  end if;
  if v_parking is not null then
    v_facts := v_facts || jsonb_build_array(jsonb_build_object(
      'key', 'parking_spaces', 'displayValue', v_parking || ' vagas', 'sourceField', 'parking_spaces'));
  end if;

  if v_media_count < 5 then
    v_diagnostics := v_diagnostics || jsonb_build_array(jsonb_build_object(
      'code', 'insufficient_media',
      'severity', case when v_media_count < 3 then 'blocking' else 'warning' end,
      'message', v_media_count || ' imagem(ns) canônica(s) disponível(is).'));
  end if;

  return jsonb_build_object(
    'kind', 'carousel_editorial_plan',
    'propertyId', p_property_id,
    'templateKey', 'property_editorial_v1',
    'templateVersion', 1,
    'objective', 'present_property',
    'selectedMediaIds', to_jsonb(v_media_ids[1:least(v_media_count, 5)]),
    'cards', jsonb_build_array(
      jsonb_build_object('position',1,'role','cover','headline',v_title,'body',nullif(v_location,''),'facts',jsonb_build_array(jsonb_build_object('key','title','displayValue',v_title,'sourceField','title')),'mediaId',v_media_ids[1],'layoutVariant','image_full','diagnostics','[]'::jsonb),
      jsonb_build_object('position',2,'role','core_experience','headline',coalesce(nullif(v_property ->> 'short_summary',''),'Um imóvel para viver bem'),'body',nullif(v_location,''),'facts','[]'::jsonb,'mediaId',v_media_ids[1 + (1 % v_media_count)],'layoutVariant','image_split','diagnostics','[]'::jsonb),
      jsonb_build_object('position',3,'role','primary_space','headline','Espaços que acolhem a rotina','body','Conheça os ambientes registrados nas mídias deste imóvel.','facts','[]'::jsonb,'mediaId',v_media_ids[1 + (2 % v_media_count)],'layoutVariant','image_full','diagnostics','[]'::jsonb),
      jsonb_build_object('position',4,'role','differentiators','headline','Diferenciais cadastrados','body','Consulte a ficha completa do imóvel.','facts','[]'::jsonb,'mediaId',v_media_ids[1 + (3 % v_media_count)],'layoutVariant','facts_over_image','diagnostics','[]'::jsonb),
      jsonb_build_object('position',5,'role','location_context','headline',coalesce(nullif(v_property ->> 'neighborhood',''),nullif(v_property ->> 'city',''),'Localização cadastrada'),'body',nullif(v_location,''),'facts','[]'::jsonb,'mediaId',v_media_ids[1 + (4 % v_media_count)],'layoutVariant','location_over_image','diagnostics','[]'::jsonb),
      jsonb_build_object('position',6,'role','essential_facts','headline','Ficha essencial','body',null,'facts',v_facts,'layoutVariant','facts_panel','diagnostics','[]'::jsonb),
      jsonb_build_object('position',7,'role','closing','headline','Quer conhecer este imóvel?','body',case when v_reference is null then 'Fale com a equipe responsável por este imóvel.' else 'Referência ' || v_reference end,'facts',case when v_reference is null then '[]'::jsonb else jsonb_build_array(jsonb_build_object('key','reference_code','displayValue',v_reference,'sourceField','reference_code')) end,'layoutVariant','brand_closing','diagnostics','[]'::jsonb)
    ),
    'caption', jsonb_build_object(
      'text', v_title || case when v_location = '' then '. ' else ', em ' || v_location || '. ' end || 'Conheça os dados e ambientes cadastrados e fale com nossa equipe para saber mais.',
      'hashtags', jsonb_build_array('#Imóveis','#YZiImob')),
    'factualSources', jsonb_build_array(
      jsonb_build_object('field','title','source','yzi_imob_properties'),
      jsonb_build_object('field','price','source','yzi_imob_properties'),
      jsonb_build_object('field','private_area','source','yzi_imob_properties'),
      jsonb_build_object('field','bedrooms','source','yzi_imob_properties')),
    'diagnostics', v_diagnostics,
    'approvalBlocked', v_media_count < 3
  );
end;
$function$;

revoke all on function public.build_yzi_imob_carousel_editorial_plan(uuid, uuid, uuid)
  from public, anon, authenticated;

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
  v_hash text;
  v_number integer;
  v_card jsonb;
  v_source_media_id uuid;
  v_asset_count integer;
  v_count integer := 0;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  select j.* into v_job
  from public.yzi_imob_creative_generation_jobs j
  join public.tenant_memberships tm
    on tm.tenant_id = j.tenant_id and tm.user_id = v_user_id
   and tm.status = 'active' and tm.role = any (array['owner','admin','operator']::text[])
  join public.tenants t on t.id = j.tenant_id and t.status = 'active'
  where j.id = p_job_id
  for update of j;

  if v_job.id is null then
    raise exception using errcode = '42501', message = 'creative_job_not_found_or_forbidden';
  end if;
  if v_job.status = 'succeeded' then
    select count(*)::integer into v_count
    from public.yzi_imob_creative_revisions r
    where r.tenant_id = v_job.tenant_id and r.request_id = v_job.request_id;
    return query select v_job.id, v_job.request_id, v_job.status, v_count;
    return;
  end if;
  if v_job.status <> 'processing' then
    raise exception using errcode = '55000', message = 'creative_job_not_processing';
  end if;

  select r.* into v_request
  from public.yzi_imob_creative_requests r
  where r.id = v_job.request_id and r.tenant_id = v_job.tenant_id;

  for v_deliverable in
    select d.* from public.yzi_imob_creative_deliverables d
    where d.tenant_id = v_request.tenant_id
      and d.request_id = v_request.id
      and d.deliverable_type = 'carousel'
      and (v_job.deliverable_id is null or d.id = v_job.deliverable_id)
    order by d.id
    for update
  loop
    v_plan := public.build_yzi_imob_carousel_editorial_plan(
      v_request.tenant_id, v_request.property_id, v_request.id);

    if v_job.generation_kind = 'revision' then
      if (v_job.adjustment_context ->> 'kind') in ('swap_media','use_approved_media') then
        v_plan := jsonb_set(
          v_plan,
          array['cards', ((v_job.adjustment_context ->> 'card_position')::integer - 1)::text, 'mediaId'],
          to_jsonb(v_job.adjustment_context ->> 'replacement_media_id'));
      elsif v_job.adjustment_context ->> 'kind' = 'shorten_headline' then
        v_plan := jsonb_set(
          v_plan,
          array['cards', ((v_job.adjustment_context ->> 'card_position')::integer - 1)::text, 'headline'],
          to_jsonb(left(v_plan #>> array['cards', ((v_job.adjustment_context ->> 'card_position')::integer - 1)::text, 'headline'], 40)));
      elsif v_job.adjustment_context ->> 'kind' = 'remove_fact' then
        v_plan := jsonb_set(
          v_plan,
          array['cards', ((v_job.adjustment_context ->> 'card_position')::integer - 1)::text, 'facts'],
          '[]'::jsonb);
      elsif v_job.adjustment_context ->> 'kind' = 'change_cta' then
        v_plan := jsonb_set(v_plan, array['cards','6','headline'], to_jsonb(v_job.adjustment_context ->> 'observation'));
      end if;
      v_plan := v_plan || jsonb_build_object('adjustment', v_job.adjustment_context);
    end if;

    select coalesce(max(r.revision_number), 0) + 1 into v_number
    from public.yzi_imob_creative_revisions r
    where r.tenant_id = v_deliverable.tenant_id and r.deliverable_id = v_deliverable.id;

    v_snapshot := jsonb_build_object(
      'contract_version','2026-07-29.carousel.v1',
      'property_id',v_request.property_id,
      'request_id',v_request.id,
      'deliverable_id',v_deliverable.id,
      'deliverable_type','carousel',
      'channels',v_request.intended_channels,
      'objective',v_request.objective,
      'synthetic',true,
      'rendered',false,
      'publication_contract',jsonb_build_object(
        'property_id',v_request.property_id,
        'creative_revision_required',true,
        'external_publication_allowed',false),
      'blueprint',v_plan);
    v_hash := md5(v_snapshot::text) || md5('yzi-imob-carousel:' || v_snapshot::text);

    insert into public.yzi_imob_creative_revisions (
      tenant_id, property_id, request_id, deliverable_id, source_revision_id,
      revision_number, content_snapshot, content_hash, created_by_user_id
    ) values (
      v_request.tenant_id, v_request.property_id, v_request.id, v_deliverable.id,
      v_job.source_revision_id, v_number, v_snapshot, v_hash, v_user_id
    ) returning * into v_revision;

    for v_card in select value from jsonb_array_elements(v_plan -> 'cards')
    loop
      v_source_media_id := nullif(v_card ->> 'mediaId', '')::uuid;
      insert into public.yzi_imob_creative_assets (
        tenant_id, property_id, request_id, deliverable_id, revision_id,
        source_property_media_id, asset_role, media_type, synthetic_uri,
        content_hash, asset_position, asset_kind, storage_state,
        publication_state, storage_bucket, object_path, metadata
      ) values (
        v_request.tenant_id, v_request.property_id, v_request.id, v_deliverable.id,
        v_revision.id, v_source_media_id, 'synthetic_output', 'structured',
        'yzi://creative/' || v_request.id || '/' || v_deliverable.id ||
          '/r' || v_number || '/card-' || (v_card ->> 'position'),
        md5(v_card::text) || md5('yzi-imob-card:' || v_card::text),
        (v_card ->> 'position')::smallint, 'structured_preview', 'not_required',
        'not_eligible', null, null,
        jsonb_build_object('role',v_card ->> 'role','template_key','property_editorial_v1',
          'synthetic',true,'rendered',false,'publishable',false)
      );
    end loop;

    select count(*)::integer into v_asset_count
    from public.yzi_imob_creative_assets a
    where a.tenant_id = v_revision.tenant_id
      and a.revision_id = v_revision.id
      and a.asset_role = 'synthetic_output';
    if v_asset_count <> 7 then
      raise exception using errcode = '55000', message = 'carousel_asset_cardinality_invalid';
    end if;

    update public.yzi_imob_creative_deliverables
    set status = 'in_review', current_revision_id = v_revision.id,
        approved_revision_id = null, publication_eligible = false, updated_at = now()
    where id = v_deliverable.id;

    insert into public.yzi_imob_creative_generation_events (
      tenant_id,property_id,request_id,deliverable_id,revision_id,job_id,
      event_type,actor_user_id,correlation_id,metadata
    ) values (
      v_revision.tenant_id,v_revision.property_id,v_revision.request_id,
      v_revision.deliverable_id,v_revision.id,v_job.id,'revision_created',
      v_user_id,v_job.correlation_id,
      jsonb_build_object('revision_number',v_number,'asset_count',7,
        'template_key','property_editorial_v1','external_execution',false));
    v_count := v_count + 1;
  end loop;

  update public.yzi_imob_creative_generation_jobs
  set status='succeeded',completed_at=now(),last_error_code=null,updated_at=now()
  where id=v_job.id;
  update public.yzi_imob_creative_requests
  set status='in_review',completed_at=null,updated_at=now()
  where id=v_request.id;

  return query select v_job.id,v_job.request_id,'succeeded'::text,v_count;
end;
$function$;

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
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_revision public.yzi_imob_creative_revisions%rowtype;
  v_deliverable public.yzi_imob_creative_deliverables%rowtype;
  v_job public.yzi_imob_creative_generation_jobs%rowtype;
  v_kind text := btrim(coalesce(p_adjustment_kind,''));
  v_note text := nullif(btrim(coalesce(p_observation,'')),'');
  v_key text := btrim(coalesce(p_idempotency_key,''));
  v_adjustment jsonb;
begin
  if v_user_id is null then
    raise exception using errcode='28000',message='authentication_required';
  end if;
  if v_kind not in ('swap_media','shorten_headline','remove_fact','change_cta','correct_fact','use_approved_media')
    or p_card_position not between 1 and 7
    or length(v_key) not between 1 and 200
    or length(coalesce(v_note,'')) > 500
    or coalesce(v_note,'') ~* '(https?://|token|secret|api[_ -]?key|provider|model|docker|supabase|javascript|<script)'
    or (v_kind in ('swap_media','use_approved_media') and p_replacement_media_id is null)
    or (v_kind = 'change_cta' and (p_card_position <> 7 or v_note is null or length(v_note) > 80))
  then
    raise exception using errcode='22023',message='invalid_carousel_adjustment';
  end if;

  select r.* into v_revision
  from public.yzi_imob_creative_revisions r
  join public.tenant_memberships tm on tm.tenant_id=r.tenant_id
    and tm.user_id=v_user_id and tm.status='active'
    and tm.role=any(array['owner','admin']::text[])
  join public.tenants t on t.id=r.tenant_id and t.status='active'
  where r.id=p_revision_id
  for update of r;
  if v_revision.id is null then
    raise exception using errcode='42501',message='creative_revision_not_found_or_forbidden';
  end if;

  select d.* into v_deliverable
  from public.yzi_imob_creative_deliverables d
  where d.id=v_revision.deliverable_id and d.current_revision_id=v_revision.id
  for update of d;
  if v_deliverable.id is null or v_revision.status not in ('changes_requested','approved') then
    raise exception using errcode='55000',message='carousel_revision_not_adjustable';
  end if;

  if p_replacement_media_id is not null and not exists (
    select 1 from public.yzi_imob_property_media m
    where m.id=p_replacement_media_id and m.tenant_id=v_revision.tenant_id
      and m.property_id=v_revision.property_id and m.media_type='image'
      and m.is_publication_allowed and m.processing_status='ready'
  ) then
    raise exception using errcode='22023',message='invalid_replacement_property_media';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_revision.tenant_id::text || ':' || v_key));
  select j.* into v_job
  from public.yzi_imob_creative_generation_jobs j
  where j.tenant_id=v_revision.tenant_id and j.property_id=v_revision.property_id
    and j.idempotency_key=v_key;
  if v_job.id is not null then
    return query select v_job.id,v_job.request_id,true;
    return;
  end if;

  v_adjustment := jsonb_strip_nulls(jsonb_build_object(
    'kind',v_kind,'card_position',p_card_position,
    'replacement_media_id',p_replacement_media_id,'observation',v_note));
  insert into public.yzi_imob_creative_generation_jobs (
    tenant_id,property_id,request_id,idempotency_key,created_by_user_id,
    generation_kind,deliverable_id,source_revision_id,adjustment_context
  ) values (
    v_revision.tenant_id,v_revision.property_id,v_revision.request_id,v_key,v_user_id,
    'revision',v_revision.deliverable_id,v_revision.id,v_adjustment
  ) returning * into v_job;

  update public.yzi_imob_creative_deliverables
  set status='generating',approved_revision_id=null,publication_eligible=false,updated_at=now()
  where id=v_revision.deliverable_id;
  update public.yzi_imob_creative_requests
  set status='generating',completed_at=null,updated_at=now()
  where id=v_revision.request_id;

  return query select v_job.id,v_job.request_id,false;
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
begin
  if tg_op = 'UPDATE'
    and new.publication_eligible
    and old.status is distinct from 'approved'
    and new.status = 'approved'
  then
    new.publication_eligible := false;
  end if;

  if new.publication_eligible then
    select r.* into v_revision
    from public.yzi_imob_creative_revisions r
    where r.id=new.current_revision_id
      and r.tenant_id=new.tenant_id and r.property_id=new.property_id
      and r.request_id=new.request_id and r.deliverable_id=new.id;
    if v_revision.id is null or v_revision.status <> 'approved'
      or new.approved_revision_id is distinct from new.current_revision_id
      or coalesce((v_revision.content_snapshot #>> '{blueprint,approvalBlocked}')::boolean,true)
      or not exists (
        select 1
        from public.yzi_imob_creative_assets a
        where a.tenant_id = new.tenant_id
          and a.property_id = new.property_id
          and a.request_id = new.request_id
          and a.deliverable_id = new.id
          and a.revision_id = new.current_revision_id
          and a.asset_kind = 'final_render'
          and a.storage_state = 'promoted'
          and a.publication_state in ('eligible', 'published')
          and a.storage_bucket = 'yzi-imob-public'
      )
    then
      raise exception using errcode='55000',message='creative_publication_eligibility_invariant_failed';
    end if;
  end if;
  return new;
end;
$function$;

create trigger yzi_imob_creative_deliverables_guard_eligibility
before insert or update on public.yzi_imob_creative_deliverables
for each row execute function public.guard_yzi_imob_creative_eligibility();

revoke all on function public.request_yzi_imob_creative_carousel_revision(uuid,text,integer,uuid,text,text)
  from public,anon,authenticated;
grant execute on function public.request_yzi_imob_creative_carousel_revision(uuid,text,integer,uuid,text,text)
  to authenticated,service_role;

comment on function public.request_yzi_imob_creative_carousel_revision(uuid,text,integer,uuid,text,text)
  is 'Creates an idempotent local carousel revision job from governed IDs and structured adjustment only.';

commit;
