begin;

create or replace function yzi_meta_whatsapp_private.reserve_meta_whatsapp_outbound_message(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_body text,
  p_idempotency_key text
)
returns table (
  status text,
  message_id uuid,
  conversation_id uuid,
  delivery_status text,
  provider_message_id text,
  provider_error_code text
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_body text := btrim(coalesce(p_body, ''));
  v_idempotency_key text := btrim(coalesce(p_idempotency_key, ''));
  v_message public.yzi_imob_messages%rowtype;
  v_inserted boolean;
begin
  if session_user <> 'yzi_meta_whatsapp_runtime' then
    raise exception using errcode = '42501', message = 'meta_whatsapp_runtime_required';
  end if;

  if p_tenant_id is null or p_conversation_id is null then
    raise exception using errcode = '22023', message = 'invalid_outbound_reference';
  end if;

  if v_body = '' then
    raise exception using errcode = '22023', message = 'empty_outbound_body';
  end if;

  if v_idempotency_key = '' then
    raise exception using errcode = '22023', message = 'idempotency_key_required';
  end if;

  perform 1
  from public.yzi_imob_conversations c
  where c.id = p_conversation_id
    and c.tenant_id = p_tenant_id
    and c.channel = 'whatsapp'
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'conversation_not_found';
  end if;

  insert into public.yzi_imob_messages (
    tenant_id,
    conversation_id,
    direction,
    sender_type,
    body,
    provider,
    channel,
    idempotency_key,
    delivery_status,
    provider_error_code,
    provider_message_id,
    external_message_id
  ) values (
    p_tenant_id,
    p_conversation_id,
    'outbound',
    'yzi',
    v_body,
    'meta',
    'whatsapp',
    v_idempotency_key,
    'pending_dispatch',
    null,
    null,
    null
  )
  on conflict (tenant_id, provider, channel, idempotency_key)
    where idempotency_key is not null
  do nothing
  returning *
  into v_message;

  v_inserted := found;

  if not v_inserted then
    select *
    into v_message
    from public.yzi_imob_messages m
    where m.tenant_id = p_tenant_id
      and m.provider = 'meta'
      and m.channel = 'whatsapp'
      and m.idempotency_key = v_idempotency_key
    for update;

    if not found then
      raise exception using errcode = '23505', message = 'outbound_idempotency_conflict';
    end if;

    if v_message.conversation_id is distinct from p_conversation_id
      or v_message.direction is distinct from 'outbound'
      or v_message.sender_type is distinct from 'yzi'
      or v_message.body is distinct from v_body
    then
      raise exception using errcode = '23505', message = 'outbound_message_mismatch';
    end if;
  end if;

  status := case when v_inserted then 'reserved' else 'duplicate' end;
  message_id := v_message.id;
  conversation_id := v_message.conversation_id;
  delivery_status := v_message.delivery_status;
  provider_message_id := v_message.provider_message_id;
  provider_error_code := v_message.provider_error_code;
  return next;
end;
$$;

alter function yzi_meta_whatsapp_private.reserve_meta_whatsapp_outbound_message(uuid, uuid, text, text)
  owner to postgres;

revoke all on function yzi_meta_whatsapp_private.reserve_meta_whatsapp_outbound_message(uuid, uuid, text, text)
  from public, anon, authenticated, service_role, yzi_meta_whatsapp_executor, yzi_meta_whatsapp_runtime;

grant execute on function yzi_meta_whatsapp_private.reserve_meta_whatsapp_outbound_message(uuid, uuid, text, text)
  to yzi_meta_whatsapp_executor;

commit;
