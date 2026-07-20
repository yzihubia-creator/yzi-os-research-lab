begin;

-- ============================================================================
-- YZI IMOB - WhatsApp inbound processing v1
-- Local migration only until explicitly applied remotely.
--
-- Scope:
-- - allow conversations without a commercial lead when they are anchored to an
--   external WhatsApp sender identity;
-- - add message-level provider/channel idempotency;
-- - restore provider_webhook_events.processed_at semantics;
-- - add a private transactional inbound processor for persisted WhatsApp events.
-- ============================================================================

-- PART 1 - Conversation identity for non-lead WhatsApp senders

alter table public.yzi_imob_conversations
  alter column lead_id drop not null;

alter table public.yzi_imob_conversations
  add column if not exists external_sender_id text null;

alter table public.yzi_imob_conversations
  drop constraint if exists yzi_imob_conversations_identity_check;

alter table public.yzi_imob_conversations
  add constraint yzi_imob_conversations_identity_check
  check (
    lead_id is not null
    or length(btrim(coalesce(external_sender_id, ''))) > 0
  );

create unique index if not exists yzi_imob_conversations_tenant_channel_external_sender_unique
  on public.yzi_imob_conversations (tenant_id, channel, external_sender_id)
  where external_sender_id is not null;

comment on column public.yzi_imob_conversations.external_sender_id is
  'Canonical external sender identity for non-lead inbound channels. For WhatsApp this is the normalized provider sender id, tenant-scoped and not a commercial lead.';

-- PART 2 - Message-level provider/channel idempotency

alter table public.yzi_imob_messages
  add column if not exists provider text null,
  add column if not exists channel text null,
  add column if not exists provider_timestamp timestamptz null;

alter table public.yzi_imob_messages
  drop constraint if exists yzi_imob_messages_provider_check;

alter table public.yzi_imob_messages
  add constraint yzi_imob_messages_provider_check
  check (provider is null or provider = 'meta');

alter table public.yzi_imob_messages
  drop constraint if exists yzi_imob_messages_channel_check;

alter table public.yzi_imob_messages
  add constraint yzi_imob_messages_channel_check
  check (channel is null or channel = 'whatsapp');

create unique index if not exists yzi_imob_messages_tenant_provider_channel_external_message_unique
  on public.yzi_imob_messages (tenant_id, provider, channel, external_message_id)
  where external_message_id is not null;

comment on column public.yzi_imob_messages.provider is
  'Technical provider namespace for inbound/outbound integration idempotency. WhatsApp inbound v1 uses meta.';
comment on column public.yzi_imob_messages.channel is
  'Technical channel namespace for integration idempotency. WhatsApp inbound v1 uses whatsapp.';
comment on column public.yzi_imob_messages.provider_timestamp is
  'Provider supplied message timestamp when available. This is not raw webhook payload.';

-- PART 3 - Webhook event insertion no longer marks processing complete

create or replace function yzi_meta_whatsapp_private.insert_meta_whatsapp_webhook_event(
  p_connection_id uuid,
  p_provider_event_key text,
  p_external_message_id text,
  p_event_type text,
  p_phone_number_id text,
  p_waba_id text,
  p_normalized_status text,
  p_payload_min jsonb
)
returns table (
  event_id uuid,
  inserted boolean,
  created_at timestamptz
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_connection public.tenant_connections%rowtype;
  v_event_id uuid;
  v_created_at timestamptz;
  v_inserted boolean;
begin
  if session_user <> 'yzi_meta_whatsapp_runtime' then
    raise exception using errcode = '42501', message = 'meta_whatsapp_runtime_required';
  end if;

  if p_connection_id is null
    or nullif(btrim(coalesce(p_provider_event_key, '')), '') is null
    or p_event_type <> all (array['message', 'status', 'unsupported']::text[])
    or nullif(btrim(coalesce(p_normalized_status, '')), '') is null
    or jsonb_typeof(coalesce(p_payload_min, '{}'::jsonb)) <> 'object'
  then
    raise exception using errcode = '22023', message = 'invalid_webhook_event';
  end if;

  select *
  into v_connection
  from public.tenant_connections tc
  where tc.id = p_connection_id
    and tc.provider = 'meta'
    and tc.revoked_at is null
    and tc.status not in ('paused', 'revoked')
  for update;

  if not found then
    raise exception using errcode = '42501', message = 'eligible_meta_connection_required';
  end if;

  insert into public.provider_webhook_events (
    tenant_id,
    connection_id,
    provider,
    channel,
    provider_event_key,
    external_message_id,
    event_type,
    phone_number_id,
    waba_id,
    normalized_status,
    payload_min,
    processed_at
  ) values (
    v_connection.tenant_id,
    v_connection.id,
    'meta',
    'whatsapp',
    btrim(p_provider_event_key),
    nullif(btrim(coalesce(p_external_message_id, '')), ''),
    p_event_type,
    nullif(btrim(coalesce(p_phone_number_id, '')), ''),
    nullif(btrim(coalesce(p_waba_id, '')), ''),
    btrim(p_normalized_status),
    coalesce(p_payload_min, '{}'::jsonb),
    null
  )
  on conflict (connection_id, provider_event_key)
  do nothing
  returning id, provider_webhook_events.created_at
  into v_event_id, v_created_at;

  v_inserted := found;

  if not v_inserted then
    select pwe.id, pwe.created_at
    into v_event_id, v_created_at
    from public.provider_webhook_events pwe
    where pwe.connection_id = v_connection.id
      and pwe.provider_event_key = btrim(p_provider_event_key);
  end if;

  event_id := v_event_id;
  inserted := v_inserted;
  created_at := v_created_at;
  return next;
end;
$$;

alter function yzi_meta_whatsapp_private.insert_meta_whatsapp_webhook_event(uuid, text, text, text, text, text, text, jsonb)
  owner to postgres;

-- PART 4 - Transactional inbound event processor

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
    reason := case
      when v_event.event_type = 'status' then 'status_callback'
      else 'unsupported_event_type'
    end;
    return next;
    return;
  end if;

  v_payload := coalesce(v_event.payload_min, '{}'::jsonb);
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

revoke all on function yzi_meta_whatsapp_private.insert_meta_whatsapp_webhook_event(uuid, text, text, text, text, text, text, jsonb)
from public, anon, authenticated, service_role;

revoke all on function yzi_meta_whatsapp_private.process_whatsapp_inbound_event(uuid)
from public, anon, authenticated, service_role;

grant execute on function yzi_meta_whatsapp_private.insert_meta_whatsapp_webhook_event(uuid, text, text, text, text, text, text, jsonb)
  to yzi_meta_whatsapp_executor;

grant execute on function yzi_meta_whatsapp_private.process_whatsapp_inbound_event(uuid)
  to yzi_meta_whatsapp_executor;

comment on function yzi_meta_whatsapp_private.process_whatsapp_inbound_event(uuid) is
  'Processes one persisted signed WhatsApp webhook event transactionally: resolves/creates an external-sender conversation, inserts inbound text idempotently, and marks the event processed without creating a lead or outbound response.';

-- ============================================================================
-- Manual rollback notes:
-- - drop function yzi_meta_whatsapp_private.process_whatsapp_inbound_event(uuid);
-- - restore insert_meta_whatsapp_webhook_event from 20260719000000 if needed;
-- - drop index yzi_imob_messages_tenant_provider_channel_external_message_unique;
-- - alter table public.yzi_imob_messages drop columns provider, channel, provider_timestamp;
-- - drop index yzi_imob_conversations_tenant_channel_external_sender_unique;
-- - alter table public.yzi_imob_conversations drop constraint yzi_imob_conversations_identity_check;
-- - alter table public.yzi_imob_conversations drop column external_sender_id;
-- - alter table public.yzi_imob_conversations alter column lead_id set not null; -- only after confirming no leadless conversations exist.
-- ============================================================================

commit;
