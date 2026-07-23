begin;

-- ============================================================================
-- YZI IMOB - Meta WhatsApp outbound + deterministic consumer completion v1
-- Local migration only until explicitly applied remotely.
--
-- Scope:
-- - govern outbound WhatsApp dispatch with tenant-scoped reservation,
--   provider_message_id persistence, and delivery observability on
--   public.yzi_imob_messages;
-- - expose only private SECURITY DEFINER functions to the dedicated
--   yzi_meta_whatsapp_runtime role;
-- - extend inbound-operation failure vocabulary with an explicit
--   outbound_dispatch_failed code, preserving the already-selected
--   intent/workflow pair without overloading completion_failed.
-- ============================================================================

-- PART 1 - yzi_imob_messages outbound observability

alter table public.yzi_imob_messages
  add column if not exists idempotency_key text null,
  add column if not exists provider_message_id text null,
  add column if not exists delivery_status text null,
  add column if not exists provider_error_code text null;

alter table public.yzi_imob_messages
  drop constraint if exists yzi_imob_messages_idempotency_key_check;

alter table public.yzi_imob_messages
  add constraint yzi_imob_messages_idempotency_key_check
    check (
      idempotency_key is null
      or length(btrim(idempotency_key)) between 1 and 200
    );

alter table public.yzi_imob_messages
  drop constraint if exists yzi_imob_messages_provider_message_id_check;

alter table public.yzi_imob_messages
  add constraint yzi_imob_messages_provider_message_id_check
    check (
      provider_message_id is null
      or length(btrim(provider_message_id)) between 1 and 300
    );

alter table public.yzi_imob_messages
  drop constraint if exists yzi_imob_messages_delivery_status_check;

alter table public.yzi_imob_messages
  add constraint yzi_imob_messages_delivery_status_check
    check (
      delivery_status is null
      or delivery_status = any (array['pending_dispatch', 'accepted', 'failed']::text[])
    );

alter table public.yzi_imob_messages
  drop constraint if exists yzi_imob_messages_provider_error_code_check;

alter table public.yzi_imob_messages
  add constraint yzi_imob_messages_provider_error_code_check
    check (
      provider_error_code is null
      or length(btrim(provider_error_code)) between 1 and 80
    );

alter table public.yzi_imob_messages
  drop constraint if exists yzi_imob_messages_meta_whatsapp_outbound_contract_check;

alter table public.yzi_imob_messages
  add constraint yzi_imob_messages_meta_whatsapp_outbound_contract_check
    check (
      not (
        direction = 'outbound'
        and provider = 'meta'
        and channel = 'whatsapp'
      )
      or (
        sender_type = 'yzi'
        and idempotency_key is not null
        and delivery_status is not null
      )
    );

create unique index if not exists yzi_imob_messages_tenant_provider_channel_idempotency_unique
  on public.yzi_imob_messages (tenant_id, provider, channel, idempotency_key)
  where idempotency_key is not null;

create unique index if not exists yzi_imob_messages_tenant_provider_channel_provider_message_unique
  on public.yzi_imob_messages (tenant_id, provider, channel, provider_message_id)
  where provider_message_id is not null;

comment on column public.yzi_imob_messages.idempotency_key is
  'Deterministic outbound reservation key. For governed Meta WhatsApp outbound it is provided by the caller and remains tenant/provider/channel scoped.';
comment on column public.yzi_imob_messages.provider_message_id is
  'Provider-assigned outbound message id after Meta accepts the dispatch.';
comment on column public.yzi_imob_messages.delivery_status is
  'Minimal governed outbound lifecycle: pending_dispatch before provider acceptance, accepted after synchronous Meta 2xx, failed after a controlled local/provider rejection.';
comment on column public.yzi_imob_messages.provider_error_code is
  'Sanitized provider/local failure code for outbound dispatch observability. Never stores raw response bodies or tokens.';

-- PART 2 - inbound operation failure vocabulary

alter table public.yzi_imob_inbound_operation_requests
  drop constraint if exists yzi_imob_inbound_operation_requests_failure_code_check;

alter table public.yzi_imob_inbound_operation_requests
  add constraint yzi_imob_inbound_operation_requests_failure_code_check
    check (
      failure_code is null
      or failure_code = any (array[
        'message_not_found', 'conversation_not_found', 'identity_mismatch',
        'invalid_message_contract', 'intent_classification_failed',
        'workflow_selection_failed', 'outbound_dispatch_failed',
        'completion_failed'
      ]::text[])
    );

comment on column public.yzi_imob_inbound_operation_requests.failure_code is
  'Controlled failure vocabulary for the deterministic inbound consumer: pre-classification read/contract failures, workflow_selection_failed, outbound_dispatch_failed, or completion_failed.';

-- PART 3 - private governed outbound helpers

create or replace function yzi_meta_whatsapp_private.get_meta_whatsapp_outbound_context(
  p_tenant_id uuid,
  p_conversation_id uuid
)
returns table (
  tenant_id uuid,
  conversation_id uuid,
  connection_id uuid,
  graph_api_version text,
  meta_access_token text,
  phone_number_id text,
  external_sender_id text
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public', 'vault'
as $$
declare
  v_connection public.tenant_connections%rowtype;
  v_conversation public.yzi_imob_conversations%rowtype;
  v_meta_access_token text;
  v_phone_number_id text;
  v_asset_count integer;
begin
  if session_user <> 'yzi_meta_whatsapp_runtime' then
    raise exception using errcode = '42501', message = 'meta_whatsapp_runtime_required';
  end if;

  if p_tenant_id is null or p_conversation_id is null then
    raise exception using errcode = '22023', message = 'invalid_outbound_reference';
  end if;

  select *
  into v_conversation
  from public.yzi_imob_conversations c
  where c.id = p_conversation_id
    and c.tenant_id = p_tenant_id
    and c.channel = 'whatsapp'
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'conversation_not_found';
  end if;

  if nullif(btrim(coalesce(v_conversation.external_sender_id, '')), '') is null then
    raise exception using errcode = '22023', message = 'external_sender_missing';
  end if;

  select *
  into v_connection
  from public.tenant_connections tc
  where tc.tenant_id = p_tenant_id
    and tc.provider = 'meta'
    and tc.revoked_at is null
    and tc.status not in ('paused', 'revoked')
  order by coalesce(tc.last_sync_at, tc.last_checked_at, tc.updated_at, tc.created_at) desc, tc.id desc
  limit 1
  for update;

  if not found or v_connection.vault_secret_id is null then
    raise exception using errcode = '42501', message = 'eligible_meta_connection_required';
  end if;

  select count(*)
  into v_asset_count
  from public.tenant_connection_assets a
  where a.tenant_id = p_tenant_id
    and a.connection_id = v_connection.id
    and a.provider = 'meta'
    and a.kind = 'whatsapp_phone_number'
    and a.revoked_at is null;

  if v_asset_count = 0 then
    raise exception using errcode = '22023', message = 'whatsapp_phone_asset_missing';
  end if;

  if v_asset_count > 1 then
    raise exception using errcode = '22023', message = 'ambiguous_whatsapp_phone_asset';
  end if;

  select a.external_account_id
  into v_phone_number_id
  from public.tenant_connection_assets a
  where a.tenant_id = p_tenant_id
    and a.connection_id = v_connection.id
    and a.provider = 'meta'
    and a.kind = 'whatsapp_phone_number'
    and a.revoked_at is null
  order by a.updated_at desc, a.id desc
  limit 1;

  if nullif(btrim(coalesce(v_phone_number_id, '')), '') is null then
    raise exception using errcode = '22023', message = 'whatsapp_phone_asset_missing';
  end if;

  select ds.decrypted_secret
  into v_meta_access_token
  from vault.decrypted_secrets ds
  where ds.id = v_connection.vault_secret_id;

  if v_meta_access_token is null or length(v_meta_access_token) < 1 then
    raise exception using errcode = '55000', message = 'meta_vault_secret_unavailable';
  end if;

  tenant_id := p_tenant_id;
  conversation_id := v_conversation.id;
  connection_id := v_connection.id;
  graph_api_version := coalesce(v_connection.provider_metadata ->> 'graph_api_version', 'v25.0');
  meta_access_token := v_meta_access_token;
  phone_number_id := v_phone_number_id;
  external_sender_id := btrim(v_conversation.external_sender_id);
  return next;
end;
$$;

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

create or replace function yzi_meta_whatsapp_private.complete_meta_whatsapp_outbound_message(
  p_tenant_id uuid,
  p_message_id uuid,
  p_provider_message_id text,
  p_delivery_status text default 'accepted'
)
returns table (
  status text,
  message_id uuid,
  conversation_id uuid,
  provider_message_id text,
  delivery_status text,
  created_at timestamptz,
  conversation_last_message_at timestamptz
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_message public.yzi_imob_messages%rowtype;
  v_conversation public.yzi_imob_conversations%rowtype;
  v_provider_message_id text := btrim(coalesce(p_provider_message_id, ''));
begin
  if session_user <> 'yzi_meta_whatsapp_runtime' then
    raise exception using errcode = '42501', message = 'meta_whatsapp_runtime_required';
  end if;

  if p_tenant_id is null or p_message_id is null or v_provider_message_id = '' then
    raise exception using errcode = '22023', message = 'invalid_outbound_completion';
  end if;

  if p_delivery_status is null or p_delivery_status <> 'accepted' then
    raise exception using errcode = '22023', message = 'invalid_outbound_delivery_status';
  end if;

  select *
  into v_message
  from public.yzi_imob_messages m
  where m.id = p_message_id
    and m.tenant_id = p_tenant_id
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'message_not_found';
  end if;

  if v_message.provider <> 'meta'
    or v_message.channel <> 'whatsapp'
    or v_message.direction <> 'outbound'
    or v_message.sender_type <> 'yzi'
    or v_message.idempotency_key is null
  then
    raise exception using errcode = '22023', message = 'invalid_outbound_message_contract';
  end if;

  if v_message.delivery_status = 'accepted'
    and v_message.provider_message_id = v_provider_message_id then
    select *
    into v_conversation
    from public.yzi_imob_conversations c
    where c.id = v_message.conversation_id
      and c.tenant_id = p_tenant_id
    for update;

    status := 'already_accepted';
    message_id := v_message.id;
    conversation_id := v_message.conversation_id;
    provider_message_id := v_message.provider_message_id;
    delivery_status := v_message.delivery_status;
    created_at := v_message.created_at;
    conversation_last_message_at := v_conversation.last_message_at;
    return next;
    return;
  end if;

  if v_message.delivery_status <> 'pending_dispatch' then
    raise exception using errcode = '22023', message = 'invalid_outbound_transition';
  end if;

  update public.yzi_imob_messages m
  set provider_message_id = v_provider_message_id,
      external_message_id = v_provider_message_id,
      delivery_status = p_delivery_status,
      provider_error_code = null
  where m.id = v_message.id
    and m.tenant_id = p_tenant_id;

  update public.yzi_imob_conversations c
  set last_message_at = greatest(
        coalesce(c.last_message_at, '-infinity'::timestamptz),
        coalesce(v_message.created_at, now())
      )
  where c.id = v_message.conversation_id
    and c.tenant_id = p_tenant_id
  returning *
  into v_conversation;

  if not found then
    raise exception using errcode = '23503', message = 'conversation_update_failed';
  end if;

  status := 'accepted';
  message_id := v_message.id;
  conversation_id := v_message.conversation_id;
  provider_message_id := v_provider_message_id;
  delivery_status := p_delivery_status;
  created_at := v_message.created_at;
  conversation_last_message_at := v_conversation.last_message_at;
  return next;
end;
$$;

create or replace function yzi_meta_whatsapp_private.fail_meta_whatsapp_outbound_message(
  p_tenant_id uuid,
  p_message_id uuid,
  p_provider_error_code text
)
returns table (
  status text,
  message_id uuid,
  delivery_status text,
  provider_error_code text
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_message public.yzi_imob_messages%rowtype;
  v_provider_error_code text := btrim(coalesce(p_provider_error_code, ''));
begin
  if session_user <> 'yzi_meta_whatsapp_runtime' then
    raise exception using errcode = '42501', message = 'meta_whatsapp_runtime_required';
  end if;

  if p_tenant_id is null or p_message_id is null or v_provider_error_code = '' then
    raise exception using errcode = '22023', message = 'invalid_outbound_failure';
  end if;

  select *
  into v_message
  from public.yzi_imob_messages m
  where m.id = p_message_id
    and m.tenant_id = p_tenant_id
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'message_not_found';
  end if;

  if v_message.provider <> 'meta'
    or v_message.channel <> 'whatsapp'
    or v_message.direction <> 'outbound'
    or v_message.sender_type <> 'yzi'
    or v_message.idempotency_key is null
  then
    raise exception using errcode = '22023', message = 'invalid_outbound_message_contract';
  end if;

  if v_message.delivery_status = 'accepted' then
    raise exception using errcode = '22023', message = 'invalid_outbound_transition';
  end if;

  if v_message.delivery_status = 'failed'
    and v_message.provider_error_code = v_provider_error_code then
    status := 'already_failed';
    message_id := v_message.id;
    delivery_status := v_message.delivery_status;
    provider_error_code := v_message.provider_error_code;
    return next;
    return;
  end if;

  update public.yzi_imob_messages m
  set delivery_status = 'failed',
      provider_error_code = v_provider_error_code,
      provider_message_id = null,
      external_message_id = null
  where m.id = v_message.id
    and m.tenant_id = p_tenant_id;

  status := 'failed';
  message_id := v_message.id;
  delivery_status := 'failed';
  provider_error_code := v_provider_error_code;
  return next;
end;
$$;

alter function yzi_meta_whatsapp_private.get_meta_whatsapp_outbound_context(uuid, uuid)
  owner to postgres;
alter function yzi_meta_whatsapp_private.reserve_meta_whatsapp_outbound_message(uuid, uuid, text, text)
  owner to postgres;
alter function yzi_meta_whatsapp_private.complete_meta_whatsapp_outbound_message(uuid, uuid, text, text)
  owner to postgres;
alter function yzi_meta_whatsapp_private.fail_meta_whatsapp_outbound_message(uuid, uuid, text)
  owner to postgres;

revoke all on function yzi_meta_whatsapp_private.get_meta_whatsapp_outbound_context(uuid, uuid)
from public, anon, authenticated, service_role, yzi_meta_whatsapp_executor, yzi_meta_whatsapp_runtime;
revoke all on function yzi_meta_whatsapp_private.reserve_meta_whatsapp_outbound_message(uuid, uuid, text, text)
from public, anon, authenticated, service_role, yzi_meta_whatsapp_executor, yzi_meta_whatsapp_runtime;
revoke all on function yzi_meta_whatsapp_private.complete_meta_whatsapp_outbound_message(uuid, uuid, text, text)
from public, anon, authenticated, service_role, yzi_meta_whatsapp_executor, yzi_meta_whatsapp_runtime;
revoke all on function yzi_meta_whatsapp_private.fail_meta_whatsapp_outbound_message(uuid, uuid, text)
from public, anon, authenticated, service_role, yzi_meta_whatsapp_executor, yzi_meta_whatsapp_runtime;

grant execute on function yzi_meta_whatsapp_private.get_meta_whatsapp_outbound_context(uuid, uuid)
  to yzi_meta_whatsapp_executor;
grant execute on function yzi_meta_whatsapp_private.reserve_meta_whatsapp_outbound_message(uuid, uuid, text, text)
  to yzi_meta_whatsapp_executor;
grant execute on function yzi_meta_whatsapp_private.complete_meta_whatsapp_outbound_message(uuid, uuid, text, text)
  to yzi_meta_whatsapp_executor;
grant execute on function yzi_meta_whatsapp_private.fail_meta_whatsapp_outbound_message(uuid, uuid, text)
  to yzi_meta_whatsapp_executor;

comment on function yzi_meta_whatsapp_private.get_meta_whatsapp_outbound_context(uuid, uuid) is
  'Resolves the active tenant-scoped Meta connection, exactly one WhatsApp phone asset, the decrypted access token, and the WhatsApp external recipient for a conversation.';
comment on function yzi_meta_whatsapp_private.reserve_meta_whatsapp_outbound_message(uuid, uuid, text, text) is
  'Creates or reuses one governed outbound WhatsApp message reservation in yzi_imob_messages, keyed by tenant/provider/channel/idempotency_key before any provider call.';
comment on function yzi_meta_whatsapp_private.complete_meta_whatsapp_outbound_message(uuid, uuid, text, text) is
  'Marks a reserved outbound WhatsApp message as accepted, persists provider_message_id, and advances conversation.last_message_at only after the reservation exists.';
comment on function yzi_meta_whatsapp_private.fail_meta_whatsapp_outbound_message(uuid, uuid, text) is
  'Marks a reserved outbound WhatsApp message as failed with a sanitized provider/local error code. Never persists raw provider bodies.';

-- PART 4 - inbound consumer failure helper updated for outbound_dispatch_failed

create or replace function yzi_imob_inbound_operations_private.fail_inbound_operation(
  p_request_id uuid,
  p_failure_code text,
  p_intent_key text default null,
  p_workflow_key text default null
)
returns table (
  status text,
  request_id uuid
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_request public.yzi_imob_inbound_operation_requests%rowtype;
  v_expected_workflow text;
begin
  if session_user <> 'yzi_imob_inbound_operations_runtime' then
    raise exception using errcode = '42501', message = 'inbound_operations_runtime_required';
  end if;

  if p_failure_code is null or p_failure_code <> all (array[
    'message_not_found', 'conversation_not_found', 'identity_mismatch',
    'invalid_message_contract', 'intent_classification_failed',
    'workflow_selection_failed', 'outbound_dispatch_failed',
    'completion_failed'
  ]::text[]) then
    raise exception using errcode = '22023', message = 'invalid_failure_code';
  end if;

  if p_failure_code = any (array['completion_failed', 'outbound_dispatch_failed']::text[]) then
    if p_intent_key is null or p_intent_key <> all (array[
      'greeting', 'property_interest', 'scheduling_interest', 'human_support', 'unknown'
    ]::text[]) then
      raise exception using errcode = '22023', message = 'invalid_failure_intent_key';
    end if;

    if p_workflow_key is null or p_workflow_key <> all (array[
      'whatsapp_greeting_response', 'qualify_property_interest',
      'collect_scheduling_context', 'route_to_human', 'ask_clarifying_question'
    ]::text[]) then
      raise exception using errcode = '22023', message = 'invalid_failure_workflow_key';
    end if;

    v_expected_workflow := case p_intent_key
      when 'greeting' then 'whatsapp_greeting_response'
      when 'property_interest' then 'qualify_property_interest'
      when 'scheduling_interest' then 'collect_scheduling_context'
      when 'human_support' then 'route_to_human'
      when 'unknown' then 'ask_clarifying_question'
    end;

    if v_expected_workflow <> p_workflow_key then
      raise exception using errcode = '22023', message = 'invalid_failure_workflow_key';
    end if;
  elsif p_failure_code = 'workflow_selection_failed' then
    if p_intent_key is null or p_intent_key <> all (array[
      'greeting', 'property_interest', 'scheduling_interest', 'human_support', 'unknown'
    ]::text[]) then
      raise exception using errcode = '22023', message = 'invalid_failure_intent_key';
    end if;

    if p_workflow_key is not null then
      raise exception using errcode = '22023', message = 'invalid_failure_workflow_key';
    end if;
  else
    if p_intent_key is not null then
      raise exception using errcode = '22023', message = 'invalid_failure_intent_key';
    end if;

    if p_workflow_key is not null then
      raise exception using errcode = '22023', message = 'invalid_failure_workflow_key';
    end if;
  end if;

  select *
  into v_request
  from public.yzi_imob_inbound_operation_requests r
  where r.id = p_request_id
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'invalid_request_id';
  end if;

  update public.yzi_imob_inbound_operation_requests
  set intent_status =
        case
          when p_failure_code = any (array[
            'workflow_selection_failed', 'outbound_dispatch_failed', 'completion_failed'
          ]::text[]) then 'classified'
          else 'failed'
        end,
      intent_key =
        case
          when p_failure_code = any (array[
            'workflow_selection_failed', 'outbound_dispatch_failed', 'completion_failed'
          ]::text[]) then p_intent_key
          else null
        end,
      workflow_status =
        case
          when p_failure_code = any (array['completion_failed', 'outbound_dispatch_failed']::text[]) then 'selected'
          when p_failure_code = 'workflow_selection_failed' then 'failed'
          else 'pending'
        end,
      workflow_key =
        case
          when p_failure_code = any (array['completion_failed', 'outbound_dispatch_failed']::text[]) then p_workflow_key
          else null
        end,
      execution_status = 'failed',
      completed_at = now(),
      failure_code = p_failure_code,
      updated_at = now()
  where id = v_request.id;

  status := 'failed';
  request_id := v_request.id;
  return next;
end;
$$;

alter function yzi_imob_inbound_operations_private.fail_inbound_operation(uuid, text, text, text)
  owner to postgres;

revoke all on function yzi_imob_inbound_operations_private.fail_inbound_operation(uuid, text, text, text)
from public, anon, authenticated, service_role, yzi_meta_whatsapp_runtime;

grant execute on function yzi_imob_inbound_operations_private.fail_inbound_operation(uuid, text, text, text)
  to yzi_imob_inbound_operations_executor;

comment on function yzi_imob_inbound_operations_private.fail_inbound_operation(uuid, text, text, text) is
  'Transitions a processing request to failed with a controlled failure_code. workflow_selection_failed requires only intent_key. outbound_dispatch_failed and completion_failed both preserve the already-selected intent/workflow pair, but remain distinct causes.';

commit;
