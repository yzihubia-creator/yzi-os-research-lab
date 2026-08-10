begin;

-- YZI IMOB - tenant-safe source media upload contract.
--
-- This migration creates only the database/storage contract. It does not
-- upload, approve, publish, promote, or send any media.

alter table public.yzi_imob_property_media
  alter column is_publication_allowed set default false,
  add column slot text null,
  add column original_filename text null,
  add column mime_type text null,
  add column file_extension text null,
  add column byte_size bigint null,
  add column checksum_sha256 text null,
  add column source_kind text not null default 'legacy_storage',
  add column upload_state text not null default 'completed',
  add column upload_expires_at timestamptz null;

update public.yzi_imob_property_media
set slot = case
      when media_type = 'video' then 'raw_video'
      when is_cover then 'primary'
      when environment_type = 'facade' then 'facade'
      when environment_type in ('location', 'view') then 'location_view'
      when environment_type = 'entrance' then 'entrance'
      when environment_type = 'leisure' then 'leisure'
      when environment_type = 'floor_plan' then 'floor_plan'
      when environment_type = 'brand' then 'commercial_document'
      else 'interior'
    end,
    source_kind = case
      when public_url is not null then 'external_url'
      else 'legacy_storage'
    end;

alter table public.yzi_imob_property_media
  alter column slot set not null,
  drop constraint yzi_imob_property_media_type_check,
  drop constraint yzi_imob_property_media_environment_check,
  add constraint yzi_imob_property_media_type_check
    check (media_type = any (array['image', 'video', 'document']::text[])),
  add constraint yzi_imob_property_media_environment_check
    check (environment_type = any (array[
      'facade','entrance','common_area','living_room','balcony','kitchen','bedroom','suite',
      'bathroom','leisure','view','floor_plan','location','detail','brand','other'
    ]::text[])),
  add constraint yzi_imob_property_media_slot_check
    check (slot = any (array[
      'primary','facade','location_view','entrance','common_area','leisure',
      'interior','floor_plan','raw_video','commercial_document'
    ]::text[])),
  add constraint yzi_imob_property_media_slot_type_check
    check (
      (slot = 'raw_video' and media_type = 'video')
      or (
        slot = 'commercial_document'
        and (
          media_type = 'document'
          or (source_kind <> 'original_upload' and media_type = 'image')
        )
      )
      or (
        slot = any (array[
          'primary','facade','location_view','entrance','common_area','leisure','interior','floor_plan'
        ]::text[])
        and media_type = 'image'
      )
    ),
  add constraint yzi_imob_property_media_source_kind_check
    check (source_kind = any (array['original_upload','external_url','legacy_storage']::text[])),
  add constraint yzi_imob_property_media_upload_state_check
    check (upload_state = any (array['reserved','completed','cancelled','failed']::text[])),
  add constraint yzi_imob_property_media_upload_lifecycle_check
    check (
      (upload_state = 'reserved' and upload_expires_at is not null and processing_status = 'processing')
      or (upload_state <> 'reserved' and upload_expires_at is null)
    ),
  add constraint yzi_imob_property_media_original_metadata_check
    check (
      (original_filename is null or (
        original_filename = btrim(original_filename)
        and length(original_filename) between 1 and 255
      ))
      and (mime_type is null or mime_type = any (array[
        'image/jpeg','image/png','image/webp','video/mp4','video/quicktime','application/pdf'
      ]::text[]))
      and (file_extension is null or file_extension = any (array['jpg','jpeg','png','webp','mp4','mov','pdf']::text[]))
      and (byte_size is null or byte_size between 1 and 52428800)
      and (checksum_sha256 is null or checksum_sha256 ~ '^[a-f0-9]{64}$')
    ),
  add constraint yzi_imob_property_media_original_upload_check
    check (
      source_kind <> 'original_upload'
      or (
        storage_bucket = 'yzi-imob-source-media'
        and storage_path is not null
        and public_url is null
        and original_filename is not null
        and mime_type is not null
        and file_extension is not null
        and byte_size is not null
        and not is_cover
        and not is_publication_allowed
        and not eligible_for_carousel
        and not eligible_for_video
        and media_status = any (array['pending','failed']::text[])
      )
    );

create index yzi_imob_property_media_upload_capacity_idx
  on public.yzi_imob_property_media (tenant_id, property_id, media_type, upload_state, upload_expires_at)
  where source_kind = 'original_upload';

alter table public.yzi_imob_property_media_events
  drop constraint yzi_imob_property_media_events_type_check,
  add constraint yzi_imob_property_media_events_type_check
    check (event_type = any (array[
      'creative_governance_updated','upload_reserved','upload_completed','upload_failed',
      'media_removed','media_replaced'
    ]::text[]));

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'yzi-imob-source-media',
  'yzi-imob-source-media',
  false,
  52428800,
  array[
    'image/jpeg','image/png','image/webp','video/mp4','video/quicktime','application/pdf'
  ]::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types
where storage.buckets.name = excluded.name;

do $block$
begin
  if not exists (
    select 1
    from storage.buckets b
    where b.id = 'yzi-imob-source-media'
      and b.name = b.id
      and not b.public
      and b.file_size_limit = 52428800
      and b.allowed_mime_types @> array[
        'image/jpeg','image/png','image/webp','video/mp4','video/quicktime','application/pdf'
      ]::text[]
  ) then
    raise exception using errcode = '55000', message = 'source_media_bucket_contract_conflict';
  end if;
end;
$block$;

create or replace function public.reserve_yzi_imob_property_media_upload(
  p_property_id uuid,
  p_slot text,
  p_original_filename text,
  p_mime_type text,
  p_byte_size bigint
)
returns table (
  media_id uuid,
  storage_bucket text,
  storage_path text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_tenant_id uuid;
  v_media_id uuid := gen_random_uuid();
  v_media_type text;
  v_extension text;
  v_environment_type text;
  v_max_bytes bigint;
  v_max_count integer;
  v_storage_path text;
  v_expires_at timestamptz := now() + interval '15 minutes';
  v_sort_order integer;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  select p.tenant_id into v_tenant_id
  from public.yzi_imob_properties p
  join public.tenant_memberships tm
    on tm.tenant_id = p.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner','admin','operator']::text[])
  join public.tenants t
    on t.id = p.tenant_id
   and t.status = 'active'
  where p.id = p_property_id
  for update of p;

  if v_tenant_id is null then
    raise exception using errcode = '42501', message = 'property_not_found_or_forbidden';
  end if;

  if p_slot = any (array[
    'primary','facade','location_view','entrance','common_area','leisure','interior','floor_plan'
  ]::text[]) then
    v_media_type := 'image';
    v_max_bytes := 10485760;
    v_max_count := 30;
  elsif p_slot = 'raw_video' then
    v_media_type := 'video';
    v_max_bytes := 52428800;
    v_max_count := 5;
  elsif p_slot = 'commercial_document' then
    v_media_type := 'document';
    v_max_bytes := 26214400;
    v_max_count := 10;
  else
    raise exception using errcode = '22023', message = 'invalid_media_slot';
  end if;

  if p_original_filename is null
    or btrim(p_original_filename) <> p_original_filename
    or length(p_original_filename) not between 1 and 255
  then
    raise exception using errcode = '22023', message = 'invalid_original_filename';
  end if;

  v_extension := lower(substring(p_original_filename from '\.([A-Za-z0-9]+)$'));
  if p_mime_type is null or p_mime_type not in (
    'image/jpeg','image/png','image/webp','video/mp4','video/quicktime','application/pdf'
  ) or p_byte_size is null or p_byte_size < 1 or p_byte_size > v_max_bytes then
    raise exception using errcode = '22023', message = 'invalid_media_file';
  end if;

  if v_extension is null or not (
    (v_media_type = 'image' and (
      (p_mime_type = 'image/jpeg' and v_extension in ('jpg','jpeg'))
      or (p_mime_type = 'image/png' and v_extension = 'png')
      or (p_mime_type = 'image/webp' and v_extension = 'webp')
    ))
    or (v_media_type = 'video' and (
      (p_mime_type = 'video/mp4' and v_extension = 'mp4')
      or (p_mime_type = 'video/quicktime' and v_extension = 'mov')
    ))
    or (v_media_type = 'document' and p_mime_type = 'application/pdf' and v_extension = 'pdf')
  ) then
    raise exception using errcode = '22023', message = 'slot_file_type_mismatch';
  end if;

  if (
    select count(*)
    from public.yzi_imob_property_media m
    where m.tenant_id = v_tenant_id
      and m.property_id = p_property_id
      and m.media_type = v_media_type
      and (
        m.upload_state = 'completed'
        or (m.upload_state = 'reserved' and m.upload_expires_at > now())
      )
  ) >= v_max_count then
    raise exception using errcode = '22023', message = 'property_media_limit_reached';
  end if;

  v_environment_type := case p_slot
    when 'facade' then 'facade'
    when 'location_view' then 'location'
    when 'entrance' then 'entrance'
    when 'common_area' then 'common_area'
    when 'leisure' then 'leisure'
    when 'floor_plan' then 'floor_plan'
    when 'commercial_document' then 'brand'
    else 'other'
  end;
  v_storage_path := 'tenants/' || v_tenant_id::text || '/properties/' ||
    p_property_id::text || '/source-media/' || p_slot || '/' || v_media_id::text || '.' || v_extension;

  select coalesce(max(m.sort_order), -1) + 1 into v_sort_order
  from public.yzi_imob_property_media m
  where m.tenant_id = v_tenant_id and m.property_id = p_property_id;

  insert into public.yzi_imob_property_media (
    id, tenant_id, property_id, media_type, storage_bucket, storage_path,
    public_url, alt_text, sort_order, is_cover, is_publication_allowed,
    processing_status, created_by_user_id, environment_type,
    eligible_for_carousel, eligible_for_video, media_status, orientation,
    slot, original_filename, mime_type, file_extension, byte_size,
    source_kind, upload_state, upload_expires_at
  ) values (
    v_media_id, v_tenant_id, p_property_id, v_media_type,
    'yzi-imob-source-media', v_storage_path, null, p_original_filename,
    v_sort_order, false, false, 'processing', v_user_id, v_environment_type,
    false, false, 'pending', 'unknown', p_slot, p_original_filename,
    p_mime_type, v_extension, p_byte_size, 'original_upload', 'reserved', v_expires_at
  );

  insert into public.yzi_imob_property_media_events (
    tenant_id, property_id, media_id, event_type, actor_user_id, before_state, after_state
  ) values (
    v_tenant_id, p_property_id, v_media_id, 'upload_reserved', v_user_id, '{}'::jsonb,
    jsonb_build_object(
      'slot', p_slot,
      'media_type', v_media_type,
      'mime_type', p_mime_type,
      'byte_size', p_byte_size,
      'media_status', 'pending',
      'processing_status', 'processing',
      'is_publication_allowed', false
    )
  );

  return query select v_media_id, 'yzi-imob-source-media'::text, v_storage_path, v_expires_at;
end;
$function$;

create or replace function public.finalize_yzi_imob_property_media_upload(
  p_media_id uuid,
  p_storage_path text
)
returns table (
  media_id uuid,
  property_id uuid,
  media_status text,
  processing_status text
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth, storage
as $function$
declare
  v_user_id uuid := auth.uid();
  v_media public.yzi_imob_property_media%rowtype;
  v_object storage.objects%rowtype;
  v_actual_size bigint;
  v_actual_mime text;
  v_after public.yzi_imob_property_media%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  select m.* into v_media
  from public.yzi_imob_property_media m
  join public.tenant_memberships tm
    on tm.tenant_id = m.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner','admin','operator']::text[])
  join public.tenants t
    on t.id = m.tenant_id and t.status = 'active'
  join public.yzi_imob_properties p
    on p.id = m.property_id and p.tenant_id = m.tenant_id
  where m.id = p_media_id
    and m.created_by_user_id = v_user_id
  for update of m;

  if v_media.id is null
    or v_media.source_kind <> 'original_upload'
    or v_media.upload_state <> 'reserved'
    or v_media.upload_expires_at <= now()
    or v_media.storage_bucket <> 'yzi-imob-source-media'
    or v_media.storage_path <> p_storage_path
  then
    raise exception using errcode = '42501', message = 'upload_reservation_not_found_or_expired';
  end if;

  select o.* into v_object
  from storage.objects o
  where o.bucket_id = v_media.storage_bucket
    and o.name = v_media.storage_path;

  if v_object.id is null or v_object.owner_id is distinct from v_user_id::text then
    raise exception using errcode = '55000', message = 'source_media_object_missing';
  end if;

  v_actual_size := case
    when v_object.metadata ->> 'size' ~ '^[0-9]+$'
      then (v_object.metadata ->> 'size')::bigint
    else null
  end;
  v_actual_mime := lower(coalesce(
    v_object.metadata ->> 'mimetype',
    v_object.metadata ->> 'contentType',
    v_object.metadata ->> 'content-type'
  ));

  if v_actual_size is null
    or v_actual_size <> v_media.byte_size
    or v_actual_size > case v_media.media_type
      when 'image' then 10485760
      when 'video' then 52428800
      when 'document' then 26214400
      else 0
    end
    or v_actual_mime is null
    or v_actual_mime <> v_media.mime_type
  then
    raise exception using errcode = '22023', message = 'source_media_object_metadata_mismatch';
  end if;

  update public.yzi_imob_property_media m
  set upload_state = 'completed',
      upload_expires_at = null,
      byte_size = v_actual_size,
      mime_type = v_actual_mime,
      processing_status = 'ready',
      media_status = 'pending',
      is_cover = false,
      is_publication_allowed = false,
      eligible_for_carousel = false,
      eligible_for_video = false,
      updated_at = now()
  where m.id = v_media.id
  returning m.* into v_after;

  insert into public.yzi_imob_property_media_events (
    tenant_id, property_id, media_id, event_type, actor_user_id, before_state, after_state
  ) values (
    v_after.tenant_id, v_after.property_id, v_after.id, 'upload_completed', v_user_id,
    jsonb_build_object(
      'upload_state', v_media.upload_state,
      'processing_status', v_media.processing_status,
      'media_status', v_media.media_status
    ),
    jsonb_build_object(
      'upload_state', v_after.upload_state,
      'processing_status', v_after.processing_status,
      'media_status', v_after.media_status,
      'is_publication_allowed', v_after.is_publication_allowed,
      'is_cover', v_after.is_cover
    )
  );

  return query select v_after.id, v_after.property_id, v_after.media_status, v_after.processing_status;
end;
$function$;

create or replace function public.cancel_yzi_imob_property_media_upload(
  p_media_id uuid,
  p_storage_path text
)
returns table (
  media_id uuid,
  storage_bucket text,
  storage_path text
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_media public.yzi_imob_property_media%rowtype;
  v_after public.yzi_imob_property_media%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  select m.* into v_media
  from public.yzi_imob_property_media m
  join public.tenant_memberships tm
    on tm.tenant_id = m.tenant_id
   and tm.user_id = v_user_id
   and tm.status = 'active'
   and tm.role = any (array['owner','admin','operator']::text[])
  where m.id = p_media_id
    and m.created_by_user_id = v_user_id
  for update of m;

  if v_media.id is null
    or v_media.source_kind <> 'original_upload'
    or v_media.upload_state <> 'reserved'
    or v_media.storage_bucket <> 'yzi-imob-source-media'
    or v_media.storage_path <> p_storage_path
  then
    raise exception using errcode = '42501', message = 'upload_reservation_not_found';
  end if;

  update public.yzi_imob_property_media m
  set upload_state = 'cancelled',
      upload_expires_at = null,
      processing_status = 'failed',
      media_status = 'failed',
      is_cover = false,
      is_publication_allowed = false,
      eligible_for_carousel = false,
      eligible_for_video = false,
      updated_at = now()
  where m.id = v_media.id
  returning m.* into v_after;

  insert into public.yzi_imob_property_media_events (
    tenant_id, property_id, media_id, event_type, actor_user_id, before_state, after_state
  ) values (
    v_after.tenant_id, v_after.property_id, v_after.id, 'upload_failed', v_user_id,
    jsonb_build_object(
      'upload_state', v_media.upload_state,
      'processing_status', v_media.processing_status,
      'media_status', v_media.media_status
    ),
    jsonb_build_object(
      'upload_state', v_after.upload_state,
      'processing_status', v_after.processing_status,
      'media_status', v_after.media_status,
      'orphan_cleanup_required', true
    )
  );

  return query select v_after.id, v_after.storage_bucket, v_after.storage_path;
end;
$function$;

create or replace function public.get_yzi_imob_property_media_upload_capability(
  p_property_id uuid
)
returns table (enabled boolean, storage_bucket text)
language plpgsql
security definer
stable
set search_path = pg_catalog, public, auth, storage
as $function$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not exists (
    select 1
    from public.yzi_imob_properties p
    join public.tenant_memberships tm
      on tm.tenant_id = p.tenant_id
     and tm.user_id = v_user_id
     and tm.status = 'active'
     and tm.role = any (array['owner','admin','operator']::text[])
    join public.tenants t on t.id = p.tenant_id and t.status = 'active'
    where p.id = p_property_id
  ) then
    raise exception using errcode = '42501', message = 'property_not_found_or_forbidden';
  end if;

  return query
  select exists (
    select 1
    from storage.buckets b
    where b.id = 'yzi-imob-source-media'
      and b.name = b.id
      and not b.public
      and b.file_size_limit = 52428800
      and b.allowed_mime_types @> array[
        'image/jpeg','image/png','image/webp','video/mp4','video/quicktime','application/pdf'
      ]::text[]
  ), 'yzi-imob-source-media'::text;
end;
$function$;

revoke all on function public.reserve_yzi_imob_property_media_upload(uuid,text,text,text,bigint)
  from public, anon;
revoke all on function public.finalize_yzi_imob_property_media_upload(uuid,text)
  from public, anon;
revoke all on function public.cancel_yzi_imob_property_media_upload(uuid,text)
  from public, anon;
revoke all on function public.get_yzi_imob_property_media_upload_capability(uuid)
  from public, anon;
grant execute on function public.reserve_yzi_imob_property_media_upload(uuid,text,text,text,bigint)
  to authenticated;
grant execute on function public.finalize_yzi_imob_property_media_upload(uuid,text)
  to authenticated;
grant execute on function public.cancel_yzi_imob_property_media_upload(uuid,text)
  to authenticated;
grant execute on function public.get_yzi_imob_property_media_upload_capability(uuid)
  to authenticated;

drop policy if exists yzi_imob_source_media_insert_reserved on storage.objects;
create policy yzi_imob_source_media_insert_reserved
  on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'yzi-imob-source-media'
    and exists (
      select 1
      from public.yzi_imob_property_media m
      join public.tenant_memberships tm
        on tm.tenant_id = m.tenant_id
       and tm.user_id = auth.uid()
       and tm.status = 'active'
       and tm.role = any (array['owner','admin','operator']::text[])
      where m.storage_bucket = bucket_id
        and m.storage_path = name
        and m.source_kind = 'original_upload'
        and m.upload_state = 'reserved'
        and m.upload_expires_at > now()
        and m.created_by_user_id = auth.uid()
    )
  );

drop policy if exists yzi_imob_source_media_select_member on storage.objects;
create policy yzi_imob_source_media_select_member
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'yzi-imob-source-media'
    and exists (
      select 1
      from public.yzi_imob_property_media m
      join public.tenant_memberships tm
        on tm.tenant_id = m.tenant_id
       and tm.user_id = auth.uid()
       and tm.status = 'active'
      where m.storage_bucket = bucket_id
        and m.storage_path = name
        and m.source_kind = 'original_upload'
        and m.upload_state = 'completed'
    )
  );

drop policy if exists yzi_imob_source_media_delete_cancelled on storage.objects;
create policy yzi_imob_source_media_delete_cancelled
  on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'yzi-imob-source-media'
    and owner_id = auth.uid()::text
    and exists (
      select 1
      from public.yzi_imob_property_media m
      join public.tenant_memberships tm
        on tm.tenant_id = m.tenant_id
       and tm.user_id = auth.uid()
       and tm.status = 'active'
       and tm.role = any (array['owner','admin','operator']::text[])
      where m.storage_bucket = bucket_id
        and m.storage_path = name
        and m.source_kind = 'original_upload'
        and m.upload_state in ('cancelled','failed')
        and m.created_by_user_id = auth.uid()
    )
  );

-- No UPDATE policy is created. Upload clients must use upsert=false.

comment on function public.reserve_yzi_imob_property_media_upload(uuid,text,text,text,bigint) is
  'Reserves one tenant/property-scoped source media path. It never approves or publishes media.';
comment on function public.finalize_yzi_imob_property_media_upload(uuid,text) is
  'Finalizes a reserved source upload only after exact Storage metadata validation. Media remains pending and private.';
comment on function public.cancel_yzi_imob_property_media_upload(uuid,text) is
  'Cancels a reservation and authorizes API-based orphan cleanup; it never mutates storage.objects directly.';

commit;
