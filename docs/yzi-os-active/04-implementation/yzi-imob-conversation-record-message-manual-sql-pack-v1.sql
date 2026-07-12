-- YZI IMOB — Conversation recordMessage Atomicity — Manual SQL Pack v1
-- Unit: yzi-quality-auditor, Fase 2 (atomicity fix for
-- platform/src/lib/yzi-imob/conversations/queries.ts::recordMessage).
-- Project ref confirmed live (this session, read-only preflight): the same
-- project already holding public.yzi_imob_conversations/messages
-- (thwsltjcjrvtidhnfukc per prior units' record; re-confirmed here by
-- querying to_regclass for both tables + yzi_is_active_tenant_member before
-- writing this pack).
--
-- IMPORTANT — NON-EXECUTION STATEMENT:
-- Saving this file does NOT create any function. A HUMAN OPERATOR (or, once
-- reviewed, an authorized `execute_sql` call) applies it to the live project.
-- No service role, no apply_migration.
--
-- PROBLEM (confirmed by code, not hypothesis):
-- `recordMessage` in queries.ts does two separate statements — INSERT into
-- yzi_imob_messages, then UPDATE yzi_imob_conversations.last_message_at.
-- If the UPDATE fails after the INSERT succeeds, the message persists but
-- last_message_at goes stale. No rollback path existed in application code.
--
-- FIX: a single SECURITY INVOKER Postgres function. A Postgres function body
-- is an implicit transaction — any `raise exception` inside it rolls back
-- every write already performed in that call, so the two writes become
-- atomic without inventing new tables, gates, or SECURITY DEFINER.
--
-- WHY NO TRANSACTION-LOCAL GATE (unlike the PREPARE_PROPERTY_CONTACT pack):
-- yzi_imob_conversations/yzi_imob_messages already carry plain
-- "active tenant member" INSERT/UPDATE policies (no gate requirement) from
-- yzi-imob-core-entities-manual-sql-pack-v1.sql. This RPC does not need to
-- restrict direct REST access more than those policies already do — it only
-- needs to make the two writes atomic and re-validate membership/ownership
-- server-side (defense in depth, same posture as queries.ts today).
--
-- SAFETY POSTURE:
--   - SECURITY INVOKER (matches every existing yzi_* RPC). Runs as the
--     calling user, under RLS. No SECURITY DEFINER.
--   - Re-validates active tenant membership even though RLS also enforces it.
--   - Re-validates the conversation belongs to the given tenant_id before
--     writing (never trusts a loose conversationId).
--   - Body is trimmed and rejected if empty BEFORE any write (mirrors the
--     application-level check already in queries.ts; the DB CHECK constraint
--     is the second layer, not the only one).
--   - No new table, no RLS change, no policy change.

-- ============================================================================
-- PART 0 — PREFLIGHT (READ-ONLY — RUN FIRST)
-- ============================================================================

-- 0.1 Dependencies exist. Expect all 3 non-null.
select to_regclass('public.yzi_imob_conversations') as conversations_table,
       to_regclass('public.yzi_imob_messages')      as messages_table,
       (select proname from pg_proc where proname = 'yzi_is_active_tenant_member') as helper_fn;

-- 0.2 Function name must not already exist with a different signature. Expect 0 rows.
select p.proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'yzi_imob_record_message';

-- ============================================================================
-- PART 1 — RPC: yzi_imob_record_message
-- ============================================================================
-- Inserts a message and updates the parent conversation's last_message_at in
-- the same transaction. Returns the created message row plus the updated
-- conversation's last_message_at, so the caller does not need a second read.

create or replace function public.yzi_imob_record_message(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_direction text,
  p_sender_type text,
  p_body text,
  p_external_message_id text default null
)
returns table (
  id uuid,
  tenant_id uuid,
  conversation_id uuid,
  direction text,
  sender_type text,
  body text,
  external_message_id text,
  created_at timestamptz,
  conversation_last_message_at timestamptz
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_direction text := btrim(coalesce(p_direction, ''));
  v_sender_type text := btrim(coalesce(p_sender_type, ''));
  v_body text := btrim(coalesce(p_body, ''));
  v_message_id uuid;
  v_created_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if p_tenant_id is null or p_conversation_id is null then
    raise exception 'invalid_input: tenantId and conversationId are required';
  end if;
  if not public.yzi_is_active_tenant_member(p_tenant_id) then
    raise exception 'TENANT_ACCESS_DENIED';
  end if;
  if length(v_direction) = 0 or length(v_sender_type) = 0 then
    raise exception 'invalid_input: direction and senderType are required';
  end if;
  if length(v_body) = 0 then
    raise exception 'empty_body: message body cannot be blank';
  end if;

  -- Re-validate the conversation belongs to this tenant BEFORE any write —
  -- never trusts a loose conversationId (mirrors queries.ts today).
  perform 1
  from public.yzi_imob_conversations c
  where c.id = p_conversation_id
    and c.tenant_id = p_tenant_id
  for update;

  if not found then
    raise exception 'conversation_not_found: conversation does not belong to this tenant';
  end if;

  insert into public.yzi_imob_messages (
    tenant_id, conversation_id, direction, sender_type, body, external_message_id
  ) values (
    p_tenant_id, p_conversation_id, v_direction, v_sender_type, v_body, p_external_message_id
  )
  returning yzi_imob_messages.id, yzi_imob_messages.created_at
  into v_message_id, v_created_at;

  update public.yzi_imob_conversations c
  set last_message_at = v_created_at
  where c.id = p_conversation_id
    and c.tenant_id = p_tenant_id;

  if not found then
    -- Unreachable in practice (row was locked above), but explicit rather
    -- than silent: a failed UPDATE here raises and rolls back the INSERT too.
    raise exception 'write_failed: could not update conversation last_message_at';
  end if;

  return query
  select v_message_id, p_tenant_id, p_conversation_id, v_direction, v_sender_type,
         v_body, p_external_message_id, v_created_at, v_created_at;
end;
$$;

comment on function public.yzi_imob_record_message is
  'Atomic replacement for the two-statement recordMessage (insert message + update conversation.last_message_at). SECURITY INVOKER, RLS-backed, tenant re-validated server-side. Added by yzi-quality-auditor, Fase 2, after confirming the original code was genuinely non-atomic.';

-- ============================================================================
-- PART 2 — ROLLBACK (manual, if this function needs to be removed)
-- ============================================================================
-- drop function if exists public.yzi_imob_record_message(uuid, uuid, text, text, text, text);
