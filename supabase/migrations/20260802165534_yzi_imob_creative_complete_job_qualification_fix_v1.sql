begin;

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

  select r.* into v_request from public.yzi_imob_creative_requests r
  where r.id=v_job.request_id and r.tenant_id=v_job.tenant_id
    and r.property_id=v_job.property_id;
  select d.* into v_deliverable from public.yzi_imob_creative_deliverables d
  where d.id=v_job.deliverable_id and d.tenant_id=v_job.tenant_id
    and d.property_id=v_job.property_id and d.request_id=v_job.request_id
  for update of d;
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

commit;
