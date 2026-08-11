begin;

-- YZI IMOB - ciclo de vida governado da mídia original do imóvel.
--
-- Esta migration NÃO cria um segundo sistema de mídia. Ela fecha três lacunas
-- do contrato existente (20260810051921_yzi_imob_property_source_media_upload_v1):
--
--   1. `yzi_imob_property_media_original_upload_check` congelava a mídia enviada
--      em `pending`/`failed` para sempre. O estado inicial seguro estava correto,
--      mas a evolução legítima (aprovar / liberar / virar capa por decisão humana
--      registrada) era impossível. O CHECK passa a proteger o estado INICIAL sem
--      proibir a transição governada posterior.
--   2. `is_publication_allowed` não tinha produtor: nenhuma função a ligava. Ela
--      passa a ser derivada da MESMA decisão de governança que define
--      `media_status`, dentro do RPC que já existe.
--   3. Não havia remoção governada. Os tipos de evento `media_removed` e
--      `media_replaced` já estavam declarados na tabela de eventos desde a
--      migration anterior e nunca tiveram produtor. Esta migration os produz.
--
-- Nenhuma linha existente é reescrita em massa. Nenhum bucket vira público.
-- Nenhuma policy genérica é criada. Nenhum RLS é afrouxado entre tenants.

-- ---------------------------------------------------------------------------
-- 1. Estado de upload: `removed` é o desfecho governado de uma mídia concluída.
--    `cancelled` continua sendo exclusivo da reserva abortada antes do finalize.
-- ---------------------------------------------------------------------------

alter table public.yzi_imob_property_media
  drop constraint if exists yzi_imob_property_media_upload_state_check,
  add constraint yzi_imob_property_media_upload_state_check
    check (upload_state = any (array['reserved','completed','cancelled','failed','removed']::text[]));

-- ---------------------------------------------------------------------------
-- 2. CHECK do upload original: estado inicial seguro + evolução governada.
--
--    Garantias preservadas (regra do produto "upload não aprova"):
--      - enquanto o upload não está `completed`, a mídia não pode ser capa,
--        não pode estar liberada para publicação, não pode ser elegível a
--        formato e só pode estar em `pending`/`failed`/`excluded`;
--      - capa exige, sempre: upload concluído + aprovada + liberada;
--      - liberação para publicação exige, sempre: upload concluído + aprovada;
--      - elegibilidade de formato exige, sempre: upload concluído + aprovada.
--
--    `source_kind = 'original_upload'` continua significando apenas a ORIGEM
--    do arquivo. Nada aqui muda esse significado.
-- ---------------------------------------------------------------------------

alter table public.yzi_imob_property_media
  drop constraint if exists yzi_imob_property_media_original_upload_check,
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
        and (
          upload_state = 'completed'
          or (
            not is_cover
            and not is_publication_allowed
            and not eligible_for_carousel
            and not eligible_for_video
            and media_status = any (array['pending','failed','excluded']::text[])
          )
        )
        and (
          not is_cover
          or (upload_state = 'completed' and media_status = 'approved' and is_publication_allowed)
        )
        and (
          not is_publication_allowed
          or (upload_state = 'completed' and media_status = 'approved')
        )
        and (
          not (eligible_for_carousel or eligible_for_video)
          or (upload_state = 'completed' and media_status = 'approved')
        )
      )
    );

-- ---------------------------------------------------------------------------
-- 3. Governança de mídia: `is_publication_allowed` deixa de ser órfã.
--
--    Mesma assinatura, mesmo nome, mesmos eventos. A única mudança de
--    comportamento é que a liberação para publicação passa a acompanhar a
--    decisão de aprovação registrada — em vez de ficar sem produtor algum.
-- ---------------------------------------------------------------------------

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

  select * into v_before
  from public.yzi_imob_property_media
  where id = p_media_id
    and tenant_id = v_tenant_id
    and property_id = p_property_id
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
      is_cover = p_is_primary and v_approved,
      is_publication_allowed = v_approved,
      eligible_for_carousel = p_eligible_for_carousel and v_approved,
      eligible_for_video = p_eligible_for_video and v_approved,
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

-- ---------------------------------------------------------------------------
-- 4. Remoção governada de mídia concluída.
--
--    Nunca apaga a linha: marca `upload_state = 'removed'`, registra o evento
--    (`media_removed` ou `media_replaced`), zera capa/liberação/elegibilidade e
--    devolve o caminho no Storage para a limpeza feita pela API com a sessão do
--    próprio usuário. O objeto do bucket NUNCA é mexido de dentro do banco.
-- ---------------------------------------------------------------------------

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

  select * into v_before
  from public.yzi_imob_property_media
  where id = p_media_id
    and tenant_id = v_tenant_id
    and property_id = p_property_id
  for update;

  if v_before.id is null then
    raise exception using errcode = '42501', message = 'media_not_found_or_forbidden';
  end if;

  -- Reserva pendente tem contrato próprio; não é remoção de acervo.
  if v_before.upload_state = 'reserved' then
    raise exception using errcode = '22023', message = 'reserved_upload_requires_cancel';
  end if;

  -- Idempotente: remover duas vezes não gera evento duplicado nem erro.
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
    select * into v_replacement
    from public.yzi_imob_property_media
    where id = p_replacement_media_id
      and tenant_id = v_tenant_id
      and property_id = p_property_id;
    if v_replacement.id is null or v_replacement.upload_state <> 'completed' then
      raise exception using errcode = '22023', message = 'replacement_media_not_available';
    end if;
  end if;

  v_event := case when p_replacement_media_id is null then 'media_removed' else 'media_replaced' end;

  update public.yzi_imob_property_media
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
  where id = v_before.id
  returning * into v_after;

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

revoke all on function public.remove_yzi_imob_property_media(uuid,uuid,uuid,text) from public, anon;
grant execute on function public.remove_yzi_imob_property_media(uuid,uuid,uuid,text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Storage DELETE: mesma porta, agora também para a mídia removida.
--
--    A policy continua exigindo bucket certo, linha correspondente em
--    `yzi_imob_property_media`, origem `original_upload`, estado terminal e
--    vínculo ativo do usuário com o tenant dono da mídia em papel operacional.
--    A única condição retirada é a de autoria individual (`owner_id` /
--    `created_by_user_id`): com ela, uma mídia enviada por um corretor não podia
--    ser limpa por outro operador do MESMO tenant, e a remoção governada deixaria
--    objeto órfão no bucket. O isolamento entre tenants é inalterado.
-- ---------------------------------------------------------------------------

drop policy if exists yzi_imob_source_media_delete_cancelled on storage.objects;
create policy yzi_imob_source_media_delete_cancelled
  on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'yzi-imob-source-media'
    and exists (
      select 1
      from public.yzi_imob_property_media m
      join public.tenant_memberships tm
        on tm.tenant_id = m.tenant_id
       and tm.user_id = auth.uid()
       and tm.status = 'active'
       and tm.role = any (array['owner','admin','operator']::text[])
      join public.tenants tn
        on tn.id = m.tenant_id
       and tn.status = 'active'
      -- `objects.` é obrigatório: sem a qualificação, o join com `tenants`
      -- faz o Postgres resolver `name` como `tenants.name`.
      where m.storage_bucket = objects.bucket_id
        and m.storage_path = objects.name
        and m.source_kind = 'original_upload'
        and m.upload_state = any (array['cancelled','failed','removed']::text[])
    )
  );

comment on function public.update_yzi_imob_property_media_governance(uuid,uuid,text,integer,boolean,boolean,boolean,text,text,text,text) is
  'Registra a decisão humana de governança sobre uma mídia do imóvel. Aprovação, liberação para publicação, capa e elegibilidade derivam da mesma decisão e do mesmo evento.';
comment on function public.remove_yzi_imob_property_media(uuid,uuid,uuid,text) is
  'Remoção governada de mídia já finalizada: marca upload_state=removed, limpa capa/liberação, registra media_removed ou media_replaced e autoriza a limpeza do objeto via API. Nunca apaga a linha nem toca em storage.objects.';

commit;
