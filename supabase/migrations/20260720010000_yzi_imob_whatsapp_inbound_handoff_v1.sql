begin;

-- ============================================================================
-- YZI IMOB - WhatsApp inbound handoff v1
-- Local migration only. Not applied remotely by this change.
--
-- Scope:
-- - durable neutral operation-request record for one already-persisted
--   inbound WhatsApp message, awaiting a future intent classification and
--   workflow execution capability that does not exist yet;
-- - the table carries no message content, payload, or provider secrets;
-- - the table is written exclusively by a private SECURITY DEFINER RPC,
--   called by the runtime as a separate step after
--   process_whatsapp_inbound_event has already committed;
-- - no policy is created in this version: RLS is enabled with zero policies
--   and every role grant is explicitly revoked, so nothing outside the
--   table owner can read or write it.
-- ============================================================================

-- PART 1 - Durable inbound operation-request table

create table public.yzi_imob_inbound_operation_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  conversation_id uuid not null,
  message_id uuid not null,
  provider text not null default 'meta',
  channel text not null default 'whatsapp',
  intent_status text not null default 'pending',
  workflow_status text not null default 'pending',
  execution_status text not null default 'queued',
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_inbound_operation_requests_provider_check
    check (provider = 'meta'),
  constraint yzi_imob_inbound_operation_requests_channel_check
    check (channel = 'whatsapp'),
  constraint yzi_imob_inbound_operation_requests_intent_status_check
    check (intent_status = 'pending'),
  constraint yzi_imob_inbound_operation_requests_workflow_status_check
    check (workflow_status = 'pending'),
  constraint yzi_imob_inbound_operation_requests_execution_status_check
    check (execution_status = 'queued'),
  constraint yzi_imob_inbound_operation_requests_idempotency_key_check
    check (length(btrim(idempotency_key)) > 0),
  constraint yzi_imob_inbound_operation_requests_tenant_message_unique
    unique (tenant_id, provider, channel, message_id),
  constraint yzi_imob_inbound_operation_requests_tenant_idempotency_unique
    unique (tenant_id, idempotency_key),
  constraint yzi_imob_inbound_operation_requests_tenant_id_fkey
    foreign key (tenant_id) references public.tenants (id) on delete restrict,
  constraint yzi_imob_inbound_operation_requests_conversation_tenant_fkey
    foreign key (conversation_id, tenant_id) references public.yzi_imob_conversations (id, tenant_id) on delete restrict,
  constraint yzi_imob_inbound_operation_requests_message_tenant_fkey
    foreign key (message_id, tenant_id) references public.yzi_imob_messages (id, tenant_id) on delete restrict
);

comment on table public.yzi_imob_inbound_operation_requests is
  'Durable neutral handoff record: one row per already-persisted inbound WhatsApp message, awaiting future intent classification and workflow execution. Written only by yzi_meta_whatsapp_private.enqueue_whatsapp_inbound_handoff. Carries no message body, payload, phone number, or provider secret.';
comment on column public.yzi_imob_inbound_operation_requests.idempotency_key is
  'Deterministic key meta:whatsapp:<message_id>. Never derived from phone number, body, or raw payload.';
comment on column public.yzi_imob_inbound_operation_requests.intent_status is
  'Placeholder for a future intent classification capability. This version only ever writes pending.';
comment on column public.yzi_imob_inbound_operation_requests.workflow_status is
  'Placeholder for a future workflow selection capability. This version only ever writes pending.';
comment on column public.yzi_imob_inbound_operation_requests.execution_status is
  'Placeholder for a future execution lifecycle. This version only ever writes queued.';

alter table public.yzi_imob_inbound_operation_requests enable row level security;

revoke all on public.yzi_imob_inbound_operation_requests
from public, anon, authenticated, service_role, yzi_meta_whatsapp_runtime, yzi_meta_whatsapp_executor;

-- No policy is created in this version. RLS stays enabled with zero policies,
-- which denies all row access to every role except the table owner
-- (postgres), matching the SECURITY DEFINER-only access model in Part 2.

-- PART 2 - Private RPC: enqueue_whatsapp_inbound_handoff

create or replace function yzi_meta_whatsapp_private.enqueue_whatsapp_inbound_handoff(
  p_conversation_id uuid,
  p_message_id uuid
)
returns table (
  status text,
  request_id uuid,
  conversation_id uuid,
  message_id uuid
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_message public.yzi_imob_messages%rowtype;
  v_conversation public.yzi_imob_conversations%rowtype;
  v_idempotency_key text;
  v_request public.yzi_imob_inbound_operation_requests%rowtype;
  v_inserted boolean;
begin
  if session_user <> 'yzi_meta_whatsapp_runtime' then
    raise exception using errcode = '42501', message = 'meta_whatsapp_runtime_required';
  end if;

  if p_conversation_id is null or p_message_id is null then
    raise exception using errcode = '22023', message = 'conversation_and_message_required';
  end if;

  select *
  into v_message
  from public.yzi_imob_messages m
  where m.id = p_message_id;

  if not found then
    raise exception using errcode = '22023', message = 'message_not_found';
  end if;

  select *
  into v_conversation
  from public.yzi_imob_conversations c
  where c.id = p_conversation_id;

  if not found then
    raise exception using errcode = '22023', message = 'conversation_not_found';
  end if;

  if v_message.conversation_id <> p_conversation_id
    or v_message.tenant_id <> v_conversation.tenant_id
    or v_message.direction <> 'inbound'
    or v_message.sender_type <> 'external_contact'
    or v_message.provider <> 'meta'
    or v_message.channel <> 'whatsapp'
    or v_conversation.channel <> 'whatsapp'
    or nullif(btrim(coalesce(v_conversation.external_sender_id, '')), '') is null
  then
    raise exception using errcode = '22023', message = 'message_conversation_mismatch';
  end if;

  v_idempotency_key := 'meta:whatsapp:' || v_message.id::text;

  insert into public.yzi_imob_inbound_operation_requests (
    tenant_id,
    conversation_id,
    message_id,
    provider,
    channel,
    idempotency_key
  ) values (
    v_message.tenant_id,
    p_conversation_id,
    v_message.id,
    'meta',
    'whatsapp',
    v_idempotency_key
  )
  on conflict (tenant_id, idempotency_key)
  do nothing
  returning *
  into v_request;

  v_inserted := found;

  if not v_inserted then
    select *
    into v_request
    from public.yzi_imob_inbound_operation_requests r
    where r.tenant_id = v_message.tenant_id
      and r.idempotency_key = v_idempotency_key
    for update;

    if not found then
      raise exception using errcode = '23505', message = 'handoff_idempotency_conflict';
    end if;

    if v_request.tenant_id is distinct from v_message.tenant_id
      or v_request.conversation_id is distinct from p_conversation_id
      or v_request.message_id is distinct from v_message.id
      or v_request.provider is distinct from 'meta'
      or v_request.channel is distinct from 'whatsapp'
      or v_request.idempotency_key is distinct from v_idempotency_key
    then
      raise exception using errcode = '23505', message = 'handoff_conflict_mismatch';
    end if;
  end if;

  status := case when v_inserted then 'queued' else 'duplicate' end;
  request_id := v_request.id;
  conversation_id := v_request.conversation_id;
  message_id := v_request.message_id;
  return next;
end;
$$;

alter function yzi_meta_whatsapp_private.enqueue_whatsapp_inbound_handoff(uuid, uuid)
  owner to postgres;

revoke all on function yzi_meta_whatsapp_private.enqueue_whatsapp_inbound_handoff(uuid, uuid)
from public, anon, authenticated, service_role;

grant execute on function yzi_meta_whatsapp_private.enqueue_whatsapp_inbound_handoff(uuid, uuid)
  to yzi_meta_whatsapp_executor;

comment on function yzi_meta_whatsapp_private.enqueue_whatsapp_inbound_handoff(uuid, uuid) is
  'Creates or reuses one durable neutral operation-request handoff for an already-persisted inbound WhatsApp message. Derives tenant_id exclusively from the message row. Never reads message body, never classifies intent, never selects a workflow, never touches provider_webhook_events.';

-- ============================================================================
-- Manual rollback notes:
-- - drop function yzi_meta_whatsapp_private.enqueue_whatsapp_inbound_handoff(uuid, uuid);
-- - drop table public.yzi_imob_inbound_operation_requests;
-- ============================================================================

commit;
