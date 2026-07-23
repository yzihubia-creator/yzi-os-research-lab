begin;

alter table public.yzi_imob_messages
  drop constraint if exists yzi_imob_messages_delivery_status_check;

alter table public.yzi_imob_messages
  add constraint yzi_imob_messages_delivery_status_check
    check (
      delivery_status is null
      or delivery_status = any (
        array['pending_dispatch', 'accepted', 'sent', 'delivered', 'read', 'failed']::text[]
      )
    );

comment on column public.yzi_imob_messages.delivery_status is
  'Governed outbound lifecycle: pending_dispatch before provider acceptance, accepted after synchronous Meta 2xx, then sent/delivered/read/failed from official status callbacks.';

create or replace function yzi_meta_whatsapp_private.process_whatsapp_inbound_event(
  p_event_id uuid
)
returns table (
  processed boolean,
  ignored boolean,
  duplicate boolean,
  conversation_id uuid,
  message_id uuid,
  reason text
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_event public.provider_webhook_events%rowtype;
  v_connection public.tenant_connections%rowtype;
  v_payload jsonb;
  v_external_sender_id text;
  v_body text;
  v_external_message_id text;
  v_provider_timestamp timestamptz;
  v_conversation_id uuid;
  v_message_conversation_id uuid;
  v_message_id uuid;
  v_message_inserted boolean := false;
  v_effective_message_at timestamptz;
  v_status_message public.yzi_imob_messages%rowtype;
  v_callback_status text;
  v_current_rank integer := 0;
  v_next_rank integer := 0;
  v_provider_error_code text;
  v_status_advanced boolean := false;
begin
  if session_user <> 'yzi_meta_whatsapp_runtime' then
    raise exception using errcode = '42501', message = 'meta_whatsapp_runtime_required';
  end if;

  if p_event_id is null then
    raise exception using errcode = '22023', message = 'event_id_required';
  end if;

  select *
  into v_event
  from public.provider_webhook_events pwe
  where pwe.id = p_event_id
  for update;

  if not found then
    processed := false;
    ignored := true;
    duplicate := false;
    conversation_id := null;
    message_id := null;
    reason := 'event_not_found';
    return next;
    return;
  end if;

  if v_event.provider <> 'meta' or v_event.channel <> 'whatsapp' then
    raise exception using errcode = '22023', message = 'invalid_provider_channel';
  end if;

  select *
  into v_connection
  from public.tenant_connections tc
  where tc.id = v_event.connection_id
    and tc.tenant_id = v_event.tenant_id
    and tc.provider = 'meta'
    and tc.revoked_at is null
    and tc.status not in ('paused', 'revoked')
  for update;

  if not found then
    raise exception using errcode = '42501', message = 'eligible_meta_connection_required';
  end if;

  if v_event.processed_at is not null then
    if v_event.event_type <> 'message' then
      processed := true;
      ignored := true;
      duplicate := true;
      conversation_id := null;
      message_id := null;
      reason := v_event.normalized_status;
      return next;
      return;
    end if;

    select m.id, m.conversation_id
    into v_message_id, v_conversation_id
    from public.yzi_imob_messages m
    where m.tenant_id = v_event.tenant_id
      and m.provider = 'meta'
      and m.channel = 'whatsapp'
      and m.external_message_id = v_event.external_message_id
    limit 1;

    processed := true;
    ignored := false;
    duplicate := true;
    conversation_id := v_conversation_id;
    message_id := v_message_id;
    reason := null;
    return next;
    return;
  end if;

  v_payload := coalesce(v_event.payload_min, '{}'::jsonb);

  if v_event.event_type = 'status' then
    v_external_message_id := btrim(coalesce(v_event.external_message_id, ''));
    v_callback_status := lower(btrim(coalesce(v_payload ->> 'status', v_event.normalized_status, '')));
    v_provider_error_code := nullif(left(btrim(coalesce(v_payload ->> 'provider_error_code', '')), 80), '');

    if v_external_message_id = '' then
      update public.provider_webhook_events
      set processed_at = now(),
          normalized_status = 'status_message_id_missing'
      where id = v_event.id;

      processed := true;
      ignored := true;
      duplicate := false;
      conversation_id := null;
      message_id := null;
      reason := 'status_message_id_missing';
      return next;
      return;
    end if;

    select *
    into v_status_message
    from public.yzi_imob_messages m
    where m.tenant_id = v_event.tenant_id
      and m.provider = 'meta'
      and m.channel = 'whatsapp'
      and m.external_message_id = v_external_message_id
    order by m.created_at desc, m.id desc
    limit 1
    for update;

    if not found then
      update public.provider_webhook_events
      set processed_at = now(),
          normalized_status = 'status_message_not_found'
      where id = v_event.id;

      processed := true;
      ignored := true;
      duplicate := false;
      conversation_id := null;
      message_id := null;
      reason := 'status_message_not_found';
      return next;
      return;
    end if;

    v_current_rank := case coalesce(v_status_message.delivery_status, 'pending_dispatch')
      when 'pending_dispatch' then 0
      when 'accepted' then 1
      when 'sent' then 2
      when 'delivered' then 3
      when 'read' then 4
      when 'failed' then 5
      else 0
    end;

    v_next_rank := case v_callback_status
      when 'accepted' then 1
      when 'sent' then 2
      when 'delivered' then 3
      when 'read' then 4
      when 'failed' then 5
      else -1
    end;

    if v_next_rank = -1 then
      update public.provider_webhook_events
      set processed_at = now(),
          normalized_status = 'status_callback_ignored'
      where id = v_event.id;

      processed := true;
      ignored := true;
      duplicate := false;
      conversation_id := v_status_message.conversation_id;
      message_id := v_status_message.id;
      reason := 'status_callback_ignored';
      return next;
      return;
    end if;

    if v_callback_status = 'failed' then
      if coalesce(v_status_message.delivery_status, 'pending_dispatch') not in ('delivered', 'read') then
        update public.yzi_imob_messages
        set delivery_status = 'failed',
            provider_error_code = coalesce(v_provider_error_code, provider_error_code, 'provider_failed')
        where id = v_status_message.id
          and tenant_id = v_event.tenant_id;
        v_status_advanced := true;
      end if;
    elsif coalesce(v_status_message.delivery_status, 'pending_dispatch') <> 'failed'
      and v_next_rank > v_current_rank then
      update public.yzi_imob_messages
      set delivery_status = v_callback_status,
          provider_error_code = null
      where id = v_status_message.id
        and tenant_id = v_event.tenant_id;
      v_status_advanced := true;
    end if;

    update public.provider_webhook_events
    set processed_at = now(),
        normalized_status = case
          when v_status_advanced then 'status_callback_updated'
          else 'status_callback_ignored'
        end
    where id = v_event.id;

    processed := true;
    ignored := true;
    duplicate := false;
    conversation_id := v_status_message.conversation_id;
    message_id := v_status_message.id;
    reason := case
      when v_status_advanced then 'status_callback_updated'
      else 'status_callback_ignored'
    end;
    return next;
    return;
  end if;

  if v_event.event_type <> 'message' then
    update public.provider_webhook_events
    set processed_at = now(),
        normalized_status = 'ignored'
    where id = v_event.id;

    processed := true;
    ignored := true;
    duplicate := false;
    conversation_id := null;
    message_id := null;
    reason := 'unsupported_event_type';
    return next;
    return;
  end if;

  v_external_sender_id := case
    when btrim(coalesce(v_payload ->> 'from', '')) like '%@%' then
      regexp_replace(btrim(coalesce(v_payload ->> 'from', '')), '[^0-9A-Za-z@._:-]+', '', 'g')
    else
      regexp_replace(btrim(coalesce(v_payload ->> 'from', '')), '[^0-9A-Za-z]+', '', 'g')
    end;
  v_body := btrim(coalesce(v_payload ->> 'text', ''));
  v_external_message_id := btrim(coalesce(v_event.external_message_id, ''));

  if v_external_message_id = '' then
    update public.provider_webhook_events
    set processed_at = now(),
        normalized_status = 'ignored'
    where id = v_event.id;

    processed := true;
    ignored := true;
    duplicate := false;
    conversation_id := null;
    message_id := null;
    reason := 'missing_external_message_id';
    return next;
    return;
  end if;

  if v_external_sender_id = '' then
    update public.provider_webhook_events
    set processed_at = now(),
        normalized_status = 'ignored'
    where id = v_event.id;

    processed := true;
    ignored := true;
    duplicate := false;
    conversation_id := null;
    message_id := null;
    reason := 'missing_external_sender';
    return next;
    return;
  end if;

  if v_body = '' then
    update public.provider_webhook_events
    set processed_at = now(),
        normalized_status = 'ignored'
    where id = v_event.id;

    processed := true;
    ignored := true;
    duplicate := false;
    conversation_id := null;
    message_id := null;
    reason := 'empty_text';
    return next;
    return;
  end if;

  if length(v_body) > 4096 then
    update public.provider_webhook_events
    set processed_at = now(),
        normalized_status = 'ignored'
    where id = v_event.id;

    processed := true;
    ignored := true;
    duplicate := false;
    conversation_id := null;
    message_id := null;
    reason := 'text_too_long';
    return next;
    return;
  end if;

  begin
    v_provider_timestamp := to_timestamp(coalesce(v_payload ->> 'provider_timestamp', v_payload ->> 'timestamp')::double precision);
  exception when others then
    v_provider_timestamp := null;
  end;

  insert into public.yzi_imob_conversations (
    tenant_id,
    lead_id,
    channel,
    external_sender_id,
    status
  ) values (
    v_event.tenant_id,
    null,
    'whatsapp',
    v_external_sender_id,
    'open'
  )
  on conflict (tenant_id, channel, external_sender_id)
  where external_sender_id is not null
  do update
    set updated_at = public.yzi_imob_conversations.updated_at
  returning id
  into v_conversation_id;

  insert into public.yzi_imob_messages (
    tenant_id,
    conversation_id,
    direction,
    sender_type,
    body,
    external_message_id,
    provider,
    channel,
    provider_timestamp
  ) values (
    v_event.tenant_id,
    v_conversation_id,
    'inbound',
    'external_contact',
    v_body,
    v_external_message_id,
    'meta',
    'whatsapp',
    v_provider_timestamp
  )
  on conflict (tenant_id, provider, channel, external_message_id)
  where external_message_id is not null
  do nothing
  returning id, created_at
  into v_message_id, v_effective_message_at;

  v_message_inserted := found;

  if not v_message_inserted then
    select m.id, m.conversation_id, m.created_at
    into v_message_id, v_message_conversation_id, v_effective_message_at
    from public.yzi_imob_messages m
    where m.tenant_id = v_event.tenant_id
      and m.provider = 'meta'
      and m.channel = 'whatsapp'
      and m.external_message_id = v_external_message_id
    for update;

    if not found then
      raise exception using errcode = '23505', message = 'message_idempotency_conflict';
    end if;

    if v_message_conversation_id is distinct from v_conversation_id then
      raise exception using errcode = '23505', message = 'external_message_id_conversation_conflict';
    end if;
  end if;

  update public.yzi_imob_conversations c
  set last_message_at = greatest(
        coalesce(c.last_message_at, '-infinity'::timestamptz),
        coalesce(v_provider_timestamp, v_effective_message_at, now())
      )
  where c.id = v_conversation_id
    and c.tenant_id = v_event.tenant_id;

  if not found then
    raise exception using errcode = '23503', message = 'conversation_update_failed';
  end if;

  update public.provider_webhook_events
  set processed_at = now(),
      normalized_status = case
        when v_message_inserted then 'processed'
        else 'processed_duplicate_message'
      end
  where id = v_event.id;

  processed := true;
  ignored := false;
  duplicate := not v_message_inserted;
  conversation_id := v_conversation_id;
  message_id := v_message_id;
  reason := null;
  return next;
end;
$$;

alter function yzi_meta_whatsapp_private.process_whatsapp_inbound_event(uuid)
  owner to postgres;

comment on function yzi_meta_whatsapp_private.process_whatsapp_inbound_event(uuid) is
  'Processes one persisted WhatsApp webhook event transactionally: inbound message events resolve/create external-sender conversations and enqueue handoff downstream; status events update outbound yzi_imob_messages delivery_status monotonically and never trigger handoff.';

commit;
