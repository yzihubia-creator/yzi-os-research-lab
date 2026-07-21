begin;

-- ============================================================================
-- YZI IMOB - Inbound operations consumer v1
-- Local migration only. Not applied remotely by this change.
--
-- Scope:
-- - first governed consumer of public.yzi_imob_inbound_operation_requests;
-- - claims one queued row at a time (FOR UPDATE SKIP LOCKED), reads the
--   minimal message contract needed for a deterministic (non-LLM) intent
--   classification, records intent_key/workflow_key, and marks the row
--   ready or failed;
-- - dedicated private schema + role pair, isolated from
--   yzi_meta_whatsapp_private / yzi_meta_whatsapp_runtime (different bounded
--   context: this consumer never touches Meta webhook ingestion);
-- - no LLM, no tool, no outbound, no lead, no wide context;
-- - credential for yzi_imob_inbound_operations_runtime is provisioned
--   out-of-band after a future remote apply. This migration sets
--   `password null` (matches the yzi_meta_whatsapp_runtime pattern) and
--   never contains a secret.
-- ============================================================================

-- PART 1 - Private schema + role pair

create schema if not exists yzi_imob_inbound_operations_private authorization postgres;

do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_roles
    where rolname = 'yzi_imob_inbound_operations_executor'
  ) then
    create role yzi_imob_inbound_operations_executor
      nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
  end if;

  if not exists (
    select 1 from pg_catalog.pg_roles
    where rolname = 'yzi_imob_inbound_operations_runtime'
  ) then
    create role yzi_imob_inbound_operations_runtime
      login password null inherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
  end if;
end;
$$;

alter role yzi_imob_inbound_operations_runtime set search_path = pg_catalog;
alter role yzi_imob_inbound_operations_runtime set statement_timeout = '20s';
alter role yzi_imob_inbound_operations_runtime set lock_timeout = '5s';
alter role yzi_imob_inbound_operations_runtime set idle_in_transaction_session_timeout = '5s';

grant yzi_imob_inbound_operations_executor to yzi_imob_inbound_operations_runtime;

revoke all on schema yzi_imob_inbound_operations_private from public, anon, authenticated, service_role;
grant usage on schema yzi_imob_inbound_operations_private to yzi_imob_inbound_operations_executor;

comment on role yzi_imob_inbound_operations_executor is
  'NOLOGIN capability role: EXECUTE only on governed inbound-operations consumer functions.';
comment on role yzi_imob_inbound_operations_runtime is
  'LOGIN runtime dedicated exclusively to claiming/classifying/completing yzi_imob_inbound_operation_requests; credential provisioned out-of-band. Not the same runtime as yzi_meta_whatsapp_runtime.';

-- No direct grants on public tables for either role in this schema: all
-- access goes through SECURITY DEFINER functions owned by postgres (Part 3),
-- the same access model used by yzi_meta_whatsapp_private.

-- PART 2 - Table evolution

alter table public.yzi_imob_inbound_operation_requests
  add column intent_key text null,
  add column workflow_key text null,
  add column claimed_at timestamptz null,
  add column completed_at timestamptz null,
  add column failure_code text null;

alter table public.yzi_imob_inbound_operation_requests
  drop constraint yzi_imob_inbound_operation_requests_intent_status_check,
  drop constraint yzi_imob_inbound_operation_requests_workflow_status_check,
  drop constraint yzi_imob_inbound_operation_requests_execution_status_check;

-- intent_status / workflow_status: enum membership.
alter table public.yzi_imob_inbound_operation_requests
  add constraint yzi_imob_inbound_operation_requests_intent_status_check
    check (intent_status = any (array['pending', 'classified', 'failed']::text[])),
  add constraint yzi_imob_inbound_operation_requests_workflow_status_check
    check (workflow_status = any (array['pending', 'selected', 'failed']::text[]));

-- intent_key / workflow_key: enum membership when present.
alter table public.yzi_imob_inbound_operation_requests
  add constraint yzi_imob_inbound_operation_requests_intent_key_check
    check (
      intent_key is null
      or intent_key = any (array[
        'greeting', 'property_interest', 'scheduling_interest', 'human_support', 'unknown'
      ]::text[])
    ),
  add constraint yzi_imob_inbound_operation_requests_workflow_key_check
    check (
      workflow_key is null
      or workflow_key = any (array[
        'whatsapp_greeting_response', 'qualify_property_interest',
        'collect_scheduling_context', 'route_to_human', 'ask_clarifying_question'
      ]::text[])
    );

-- failure_code: enum membership when present.
alter table public.yzi_imob_inbound_operation_requests
  add constraint yzi_imob_inbound_operation_requests_failure_code_check
    check (
      failure_code is null
      or failure_code = any (array[
        'message_not_found', 'conversation_not_found', 'identity_mismatch',
        'invalid_message_contract', 'intent_classification_failed',
        'workflow_selection_failed', 'completion_failed'
      ]::text[])
    );

-- intent_key / workflow_key consistency with their status column. Strict,
-- symmetric invariant in both directions:
--   classified  <=> intent_key is not null
--   pending     <=> intent_key is null
--   failed      <=> intent_key is null
-- and analogously for workflow_status/workflow_key. This means
-- intent_status can never be 'classified' without a real, persisted
-- intent_key — including on a failed row: fail_inbound_operation() (Part 3.4)
-- takes an explicit p_intent_key parameter precisely so it can set
-- intent_status='classified' + intent_key=p_intent_key together for
-- workflow_selection_failed / completion_failed, never one without the other.
alter table public.yzi_imob_inbound_operation_requests
  add constraint yzi_imob_inbound_operation_requests_intent_key_consistency_check
    check (
      (intent_status = 'classified' and intent_key is not null)
      or (intent_status = 'pending' and intent_key is null)
      or (intent_status = 'failed' and intent_key is null)
    ),
  add constraint yzi_imob_inbound_operation_requests_workflow_key_consistency_check
    check (
      (workflow_status = 'selected' and workflow_key is not null)
      or (workflow_status = 'pending' and workflow_key is null)
      or (workflow_status = 'failed' and workflow_key is null)
    );

-- execution_status: full cross-field state machine (replaces the old
-- single-value pin). Every branch is closed and exhaustive; any other
-- execution_status value, or a mismatched combination, is rejected.
alter table public.yzi_imob_inbound_operation_requests
  add constraint yzi_imob_inbound_operation_requests_execution_status_check
    check (
      (
        execution_status = 'queued'
        and intent_status = 'pending'
        and workflow_status = 'pending'
        and intent_key is null
        and workflow_key is null
        and claimed_at is null
        and completed_at is null
        and failure_code is null
      )
      or (
        execution_status = 'processing'
        and intent_status = 'pending'
        and workflow_status = 'pending'
        and claimed_at is not null
        and completed_at is null
        and failure_code is null
      )
      or (
        execution_status = 'ready'
        and intent_status = 'classified'
        and workflow_status = 'selected'
        and intent_key is not null
        and workflow_key is not null
        and claimed_at is not null
        and completed_at is not null
        and failure_code is null
      )
      or (
        execution_status = 'failed'
        and failure_code is not null
        and claimed_at is not null
        and completed_at is not null
        and (
          (
            intent_status = 'failed'
            and workflow_status = 'pending'
            and intent_key is null
            and workflow_key is null
          )
          or (
            intent_status = 'classified'
            and workflow_status = 'failed'
            and intent_key is not null
            and workflow_key is null
          )
          or (
            intent_status = 'classified'
            and workflow_status = 'selected'
            and intent_key is not null
            and workflow_key is not null
          )
        )
      )
    );

comment on column public.yzi_imob_inbound_operation_requests.intent_status is
  'pending (not yet classified) | classified (intent_key set) | failed (classification never completed).';
comment on column public.yzi_imob_inbound_operation_requests.workflow_status is
  'pending (not yet selected) | selected (workflow_key set) | failed (selection/completion never finished).';
comment on column public.yzi_imob_inbound_operation_requests.execution_status is
  'queued -> processing (claimed) -> ready (classified+selected) or failed (controlled failure_code). See yzi_imob_inbound_operation_requests_execution_status_check for the full state machine.';
comment on column public.yzi_imob_inbound_operation_requests.intent_key is
  'Deterministic intent classification result (greeting|property_interest|scheduling_interest|human_support|unknown). Never null unless intent_status=classified.';
comment on column public.yzi_imob_inbound_operation_requests.workflow_key is
  'Deterministic workflow selected for intent_key. Never null unless workflow_status=selected.';
comment on column public.yzi_imob_inbound_operation_requests.claimed_at is
  'Set by claim_next_inbound_operation() when the row transitions queued -> processing.';
comment on column public.yzi_imob_inbound_operation_requests.completed_at is
  'Set by complete_inbound_operation() (ready) or fail_inbound_operation() (failed). Null while queued/processing.';
comment on column public.yzi_imob_inbound_operation_requests.failure_code is
  'Controlled failure vocabulary set only by fail_inbound_operation(). Never a raw error message or stack trace.';

-- PART 3 - Private RPCs (SECURITY DEFINER, owner postgres)

-- 3.1 claim_next_inbound_operation
create or replace function yzi_imob_inbound_operations_private.claim_next_inbound_operation()
returns table (
  request_id uuid,
  tenant_id uuid,
  conversation_id uuid,
  message_id uuid
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_claimed_id uuid;
begin
  if session_user <> 'yzi_imob_inbound_operations_runtime' then
    raise exception using errcode = '42501', message = 'inbound_operations_runtime_required';
  end if;

  select r.id
  into v_claimed_id
  from public.yzi_imob_inbound_operation_requests r
  where r.execution_status = 'queued'
  order by r.created_at asc, r.id asc
  for update skip locked
  limit 1;

  if v_claimed_id is null then
    return;
  end if;

  return query
  update public.yzi_imob_inbound_operation_requests u
  set execution_status = 'processing',
      claimed_at = now(),
      updated_at = now()
  where u.id = v_claimed_id
  returning u.id, u.tenant_id, u.conversation_id, u.message_id;
end;
$$;

alter function yzi_imob_inbound_operations_private.claim_next_inbound_operation()
  owner to postgres;

revoke all on function yzi_imob_inbound_operations_private.claim_next_inbound_operation()
from public, anon, authenticated, service_role, yzi_meta_whatsapp_runtime;

grant execute on function yzi_imob_inbound_operations_private.claim_next_inbound_operation()
  to yzi_imob_inbound_operations_executor;

comment on function yzi_imob_inbound_operations_private.claim_next_inbound_operation() is
  'Claims the single oldest queued inbound operation request (FOR UPDATE SKIP LOCKED), marks it processing, and returns only its identifiers. Never reads or returns message body.';

-- 3.2 get_inbound_operation_message
create or replace function yzi_imob_inbound_operations_private.get_inbound_operation_message(
  p_request_id uuid
)
returns table (
  request_id uuid,
  tenant_id uuid,
  conversation_id uuid,
  message_id uuid,
  body text,
  message_channel text,
  conversation_channel text,
  sender_type text,
  direction text,
  provider text
)
language plpgsql
security definer
stable
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_request public.yzi_imob_inbound_operation_requests%rowtype;
  v_message public.yzi_imob_messages%rowtype;
  v_conversation public.yzi_imob_conversations%rowtype;
begin
  if session_user <> 'yzi_imob_inbound_operations_runtime' then
    raise exception using errcode = '42501', message = 'inbound_operations_runtime_required';
  end if;

  select *
  into v_request
  from public.yzi_imob_inbound_operation_requests r
  where r.id = p_request_id;

  if not found then
    raise exception using errcode = '22023', message = 'invalid_message_contract';
  end if;

  if v_request.execution_status <> 'processing' then
    raise exception using errcode = '22023', message = 'invalid_message_contract';
  end if;

  select *
  into v_message
  from public.yzi_imob_messages m
  where m.id = v_request.message_id;

  if not found then
    raise exception using errcode = '22023', message = 'message_not_found';
  end if;

  select *
  into v_conversation
  from public.yzi_imob_conversations c
  where c.id = v_request.conversation_id;

  if not found then
    raise exception using errcode = '22023', message = 'conversation_not_found';
  end if;

  if v_message.tenant_id <> v_request.tenant_id
    or v_conversation.tenant_id <> v_request.tenant_id
    or v_message.conversation_id <> v_request.conversation_id
    or v_message.direction <> 'inbound'
    or v_message.sender_type <> 'external_contact'
    or v_message.provider <> 'meta'
    or v_message.channel <> 'whatsapp'
    or v_conversation.channel <> 'whatsapp'
    or nullif(btrim(coalesce(v_conversation.external_sender_id, '')), '') is null
  then
    raise exception using errcode = '22023', message = 'identity_mismatch';
  end if;

  request_id := v_request.id;
  tenant_id := v_request.tenant_id;
  conversation_id := v_request.conversation_id;
  message_id := v_message.id;
  body := v_message.body;
  message_channel := v_message.channel;
  conversation_channel := v_conversation.channel;
  sender_type := v_message.sender_type;
  direction := v_message.direction;
  provider := v_message.provider;
  return next;
end;
$$;

alter function yzi_imob_inbound_operations_private.get_inbound_operation_message(uuid)
  owner to postgres;

revoke all on function yzi_imob_inbound_operations_private.get_inbound_operation_message(uuid)
from public, anon, authenticated, service_role, yzi_meta_whatsapp_runtime;

grant execute on function yzi_imob_inbound_operations_private.get_inbound_operation_message(uuid)
  to yzi_imob_inbound_operations_executor;

comment on function yzi_imob_inbound_operations_private.get_inbound_operation_message(uuid) is
  'Reads the minimal inbound message contract (body, channel, sender_type, direction, provider) for a request already claimed (processing). Never returns external_sender_id, phone, payload, WABA/phone_number_id, token, or lead data. Exception message doubles as the controlled failure_code for the caller.';

-- 3.3 complete_inbound_operation
create or replace function yzi_imob_inbound_operations_private.complete_inbound_operation(
  p_request_id uuid,
  p_intent_key text,
  p_workflow_key text
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

  if p_intent_key is null or p_intent_key <> all (array[
    'greeting', 'property_interest', 'scheduling_interest', 'human_support', 'unknown'
  ]::text[]) then
    raise exception using errcode = '22023', message = 'intent_classification_failed';
  end if;

  if p_workflow_key is null or p_workflow_key <> all (array[
    'whatsapp_greeting_response', 'qualify_property_interest',
    'collect_scheduling_context', 'route_to_human', 'ask_clarifying_question'
  ]::text[]) then
    raise exception using errcode = '22023', message = 'workflow_selection_failed';
  end if;

  v_expected_workflow := case p_intent_key
    when 'greeting' then 'whatsapp_greeting_response'
    when 'property_interest' then 'qualify_property_interest'
    when 'scheduling_interest' then 'collect_scheduling_context'
    when 'human_support' then 'route_to_human'
    when 'unknown' then 'ask_clarifying_question'
  end;

  if v_expected_workflow <> p_workflow_key then
    raise exception using errcode = '22023', message = 'workflow_selection_failed';
  end if;

  select *
  into v_request
  from public.yzi_imob_inbound_operation_requests r
  where r.id = p_request_id
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'completion_failed';
  end if;

  if v_request.execution_status = 'ready'
    and v_request.intent_key = p_intent_key
    and v_request.workflow_key = p_workflow_key
  then
    status := 'already_ready';
    request_id := v_request.id;
    return next;
    return;
  end if;

  if v_request.execution_status <> 'processing' then
    -- Covers both "already ready with different values" (fail closed: never
    -- silently overwrite) and any other non-processing state.
    raise exception using errcode = '22023', message = 'completion_failed';
  end if;

  update public.yzi_imob_inbound_operation_requests
  set intent_status = 'classified',
      workflow_status = 'selected',
      execution_status = 'ready',
      intent_key = p_intent_key,
      workflow_key = p_workflow_key,
      completed_at = now(),
      failure_code = null,
      updated_at = now()
  where id = v_request.id;

  status := 'ready';
  request_id := v_request.id;
  return next;
end;
$$;

alter function yzi_imob_inbound_operations_private.complete_inbound_operation(uuid, text, text)
  owner to postgres;

revoke all on function yzi_imob_inbound_operations_private.complete_inbound_operation(uuid, text, text)
from public, anon, authenticated, service_role, yzi_meta_whatsapp_runtime;

grant execute on function yzi_imob_inbound_operations_private.complete_inbound_operation(uuid, text, text)
  to yzi_imob_inbound_operations_executor;

comment on function yzi_imob_inbound_operations_private.complete_inbound_operation(uuid, text, text) is
  'Transitions a processing request to ready with a validated intent_key/workflow_key pair (fixed map only). Idempotent when re-called with the exact same values on an already-ready row (returns already_ready); fails closed on any divergent re-completion attempt.';

-- 3.4 fail_inbound_operation
--
-- Three failure classes, matched 1:1 to the three combinations the
-- intent_key_consistency/workflow_key_consistency/execution_status checks
-- allow for execution_status='failed':
--
--   pre-classification (message_not_found, conversation_not_found,
--   identity_mismatch, invalid_message_contract, intent_classification_failed):
--     intent_status=failed, intent_key=null, workflow_status=pending, workflow_key=null.
--     p_intent_key and p_workflow_key MUST both be null (classification
--     never produced a value, so neither key exists yet).
--
--   workflow_selection_failed:
--     intent_status=classified, intent_key=p_intent_key, workflow_status=failed, workflow_key=null.
--     p_intent_key MUST be a valid, non-null intent key (classification DID
--     succeed); p_workflow_key MUST be null (no workflow was ever selected).
--
--   completion_failed:
--     intent_status=classified, intent_key=p_intent_key, workflow_status=selected, workflow_key=p_workflow_key.
--     Both p_intent_key and p_workflow_key MUST be valid, non-null, and
--     match the same fixed intent->workflow map enforced by
--     complete_inbound_operation. By the time complete_inbound_operation can
--     fail, a workflow has already been selected — this failure class
--     preserves that fact on the row instead of discarding it, which is why
--     it is the only execution_status='failed' combination with
--     workflow_status='selected' and a non-null workflow_key.
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
    'workflow_selection_failed', 'completion_failed'
  ]::text[]) then
    raise exception using errcode = '22023', message = 'invalid_failure_code';
  end if;

  -- Fail closed on any incoherent pairing: pre-classification codes must
  -- never carry either key; workflow_selection_failed must carry a valid
  -- intent_key but never a workflow_key; completion_failed must carry both,
  -- with the workflow_key matching the same fixed map complete_inbound_operation
  -- uses.
  if p_failure_code = 'completion_failed' then
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
    raise exception using errcode = '22023', message = 'request_not_found';
  end if;

  if v_request.execution_status <> 'processing' then
    raise exception using errcode = '22023', message = 'request_not_processing';
  end if;

  update public.yzi_imob_inbound_operation_requests
  set intent_status = case
        when p_failure_code = any (array['workflow_selection_failed', 'completion_failed']::text[]) then 'classified'
        else 'failed'
      end,
      intent_key = case
        when p_failure_code = any (array['workflow_selection_failed', 'completion_failed']::text[]) then p_intent_key
        else null
      end,
      workflow_status = case
        when p_failure_code = 'completion_failed' then 'selected'
        when p_failure_code = 'workflow_selection_failed' then 'failed'
        else 'pending'
      end,
      workflow_key = case
        when p_failure_code = 'completion_failed' then p_workflow_key
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
  'Transitions a processing request to failed with a controlled failure_code. p_intent_key is required and validated for workflow_selection_failed/completion_failed (intent_status becomes classified with that key), and forbidden for every pre-classification code (intent_status becomes failed, intent_key stays null). p_workflow_key is additionally required and validated (against the same fixed intent->workflow map as complete_inbound_operation) only for completion_failed, where it is persisted with workflow_status=selected instead of being discarded; forbidden for every other code. Fails closed on any incoherent pairing. Never a raw error message or stack trace.';

-- ============================================================================
-- Manual rollback notes:
-- - drop function yzi_imob_inbound_operations_private.fail_inbound_operation(uuid, text, text, text);
-- - drop function yzi_imob_inbound_operations_private.complete_inbound_operation(uuid, text, text);
-- - drop function yzi_imob_inbound_operations_private.get_inbound_operation_message(uuid);
-- - drop function yzi_imob_inbound_operations_private.claim_next_inbound_operation();
-- - alter table public.yzi_imob_inbound_operation_requests
--     drop constraint yzi_imob_inbound_operation_requests_execution_status_check,
--     drop constraint yzi_imob_inbound_operation_requests_workflow_key_consistency_check,
--     drop constraint yzi_imob_inbound_operation_requests_intent_key_consistency_check,
--     drop constraint yzi_imob_inbound_operation_requests_failure_code_check,
--     drop constraint yzi_imob_inbound_operation_requests_workflow_key_check,
--     drop constraint yzi_imob_inbound_operation_requests_intent_key_check,
--     drop constraint yzi_imob_inbound_operation_requests_workflow_status_check,
--     drop constraint yzi_imob_inbound_operation_requests_intent_status_check,
--     add constraint yzi_imob_inbound_operation_requests_intent_status_check check (intent_status = 'pending'),
--     add constraint yzi_imob_inbound_operation_requests_workflow_status_check check (workflow_status = 'pending'),
--     add constraint yzi_imob_inbound_operation_requests_execution_status_check check (execution_status = 'queued'),
--     drop column failure_code,
--     drop column completed_at,
--     drop column claimed_at,
--     drop column workflow_key,
--     drop column intent_key;
-- - revoke usage on schema yzi_imob_inbound_operations_private from yzi_imob_inbound_operations_executor;
-- - drop role yzi_imob_inbound_operations_runtime;
-- - drop role yzi_imob_inbound_operations_executor;
-- - drop schema yzi_imob_inbound_operations_private;
-- ============================================================================

commit;
