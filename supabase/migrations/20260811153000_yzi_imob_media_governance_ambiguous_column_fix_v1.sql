begin;

-- Correção de bug de runtime em `update_yzi_imob_property_media_governance`.
--
-- A função declara `returns table (media_id uuid, property_id uuid, ...)`.
-- Esses nomes viram variáveis PL/pgSQL no escopo do corpo e sombreiam as
-- colunas homônimas de `yzi_imob_property_media`. Com o `#variable_conflict`
-- padrão (`error`), qualquer referência não qualificada a `property_id` dentro
-- do corpo aborta a chamada com:
--
--   42702: column reference "property_id" is ambiguous
--
-- Efeito prático: a governança de mídia nunca completou em runtime desde
-- 20260802163151. Junto com o CHECK de `original_upload` (corrigido na
-- migration anterior), era o segundo motivo de "Definir capa" nunca funcionar.
--
-- A correção é só de resolução de nome: todas as referências de coluna passam a
-- ser qualificadas pelo alias da tabela. Assinatura, retorno, eventos, regras de
-- aprovação e semântica de capa permanecem idênticos.

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
  v_approved boolean := p_media_status = 'approved';
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

  select m.* into v_before
  from public.yzi_imob_property_media m
  where m.id = p_media_id
    and m.tenant_id = v_tenant_id
    and m.property_id = p_property_id
  for update;
  if v_before.id is null then
    raise exception using errcode = '42501', message = 'media_not_found_or_forbidden';
  end if;

  -- Uma mídia originalmente enviada só entra em governança depois que o
  -- upload foi finalizado e validado contra o objeto real no Storage.
  if v_approved
    and v_before.source_kind = 'original_upload'
    and (v_before.upload_state <> 'completed' or v_before.processing_status <> 'ready')
  then
    raise exception using errcode = '22023', message = 'media_upload_not_finalized';
  end if;

  if p_is_primary and v_approved then
    for v_previous in
      select m.*
      from public.yzi_imob_property_media m
      where m.tenant_id = v_tenant_id
        and m.property_id = p_property_id
        and m.id <> p_media_id
        and m.is_cover
      for update
    loop
      update public.yzi_imob_property_media m
      set is_cover = false
      where m.id = v_previous.id
      returning m.* into v_demoted;
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

  update public.yzi_imob_property_media m
  set environment_type = p_environment_type,
      sort_order = p_display_order,
      is_cover = p_is_primary and v_approved,
      is_publication_allowed = v_approved,
      eligible_for_carousel = p_eligible_for_carousel and v_approved,
      eligible_for_video = p_eligible_for_video and v_approved,
      media_status = p_media_status,
      orientation = p_orientation,
      human_note = nullif(btrim(p_human_note), ''),
      exclusion_reason = nullif(btrim(p_exclusion_reason), '')
  where m.id = p_media_id
    and m.tenant_id = v_tenant_id
    and m.property_id = p_property_id
  returning m.* into v_after;

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

-- Mesma classe de risco na remoção governada: `storage_bucket` e `storage_path`
-- também são parâmetros de saída. As referências de coluna ficam qualificadas.
create or replace function public.remove_yzi_imob_property_media(
  p_property_id uuid,
  p_media_id uuid,
  p_replacement_media_id uuid default null,
  p_reason text default null
)
returns table (
  media_id uuid,
  storage_bucket text,
  storage_path text,
  cover_cleared boolean,
  storage_cleanup_required boolean
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
  v_replacement public.yzi_imob_property_media%rowtype;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
  v_event text;
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
  where p.id = p_property_id;

  if v_tenant_id is null then
    raise exception using errcode = '42501', message = 'property_not_found_or_forbidden';
  end if;

  select m.* into v_before
  from public.yzi_imob_property_media m
  where m.id = p_media_id
    and m.tenant_id = v_tenant_id
    and m.property_id = p_property_id
  for update;

  if v_before.id is null then
    raise exception using errcode = '42501', message = 'media_not_found_or_forbidden';
  end if;

  if v_before.upload_state = 'reserved' then
    raise exception using errcode = '22023', message = 'reserved_upload_requires_cancel';
  end if;

  if v_before.upload_state = 'removed' then
    return query select
      v_before.id,
      v_before.storage_bucket,
      v_before.storage_path,
      false,
      false;
    return;
  end if;

  if p_replacement_media_id is not null then
    if p_replacement_media_id = p_media_id then
      raise exception using errcode = '22023', message = 'replacement_must_differ';
    end if;
    select m.* into v_replacement
    from public.yzi_imob_property_media m
    where m.id = p_replacement_media_id
      and m.tenant_id = v_tenant_id
      and m.property_id = p_property_id;
    if v_replacement.id is null or v_replacement.upload_state <> 'completed' then
      raise exception using errcode = '22023', message = 'replacement_media_not_available';
    end if;
  end if;

  v_event := case when p_replacement_media_id is null then 'media_removed' else 'media_replaced' end;

  update public.yzi_imob_property_media m
  set upload_state = 'removed',
      upload_expires_at = null,
      media_status = 'excluded',
      exclusion_reason = coalesce(
        v_reason,
        case when p_replacement_media_id is null
          then 'Removida do acervo pelo gestor.'
          else 'Substituída por uma nova mídia do acervo.'
        end
      ),
      is_cover = false,
      is_publication_allowed = false,
      eligible_for_carousel = false,
      eligible_for_video = false,
      updated_at = now()
  where m.id = v_before.id
  returning m.* into v_after;

  insert into public.yzi_imob_property_media_events (
    tenant_id, property_id, media_id, event_type, actor_user_id, before_state, after_state
  ) values (
    v_tenant_id,
    p_property_id,
    v_before.id,
    v_event,
    v_user_id,
    to_jsonb(v_before) - array['storage_bucket','storage_path','public_url']::text[],
    (to_jsonb(v_after) - array['storage_bucket','storage_path','public_url']::text[])
      || jsonb_build_object(
        'replacement_media_id', p_replacement_media_id,
        'cover_cleared', v_before.is_cover,
        'orphan_cleanup_required', v_before.source_kind = 'original_upload'
      )
  );

  return query select
    v_after.id,
    v_after.storage_bucket,
    v_after.storage_path,
    v_before.is_cover,
    v_after.source_kind = 'original_upload'
      and v_after.storage_bucket = 'yzi-imob-source-media'
      and v_after.storage_path is not null;
end;
$function$;

commit;
