-- YZI IMOB — PREPARE_PROPERTY_CONTACT Persisted Run Slice — Manual SQL Pack v1
-- (reconciliado com schema vivo + HARDENED: anti-bypass e FKs revisadas)
-- Unit: Capability Platform, first vertical slice (Implementation Readiness Map, approved)
-- Status: NOT_EXECUTED — RECONCILED (2026-07-11) + HARDENED (2026-07-11)
--
-- IMPORTANT — NON-EXECUTION STATEMENT:
-- This file is a manual proposal only. Saving it does NOT create any table,
-- column, policy, function, trigger, index, or data. It is intended for a
-- HUMAN OPERATOR to review and run manually against the live Supabase project
-- (thwsltjcjrvtidhnfukc), section by section, in a controlled session
-- (Supabase SQL editor or `psql`). Do NOT execute via service role or agent
-- tooling.
--
-- SCHEMA CONFIRMATION STATUS:
--   CONFIRMED via authorized read-only catalog inspection of the LIVE schema
--   (human-created `.claude/ALLOW_MCP_FOR_THIS_TASK`, 2026-07-11; only
--   information_schema/pg_catalog SELECTs were executed):
--     - tenants(id, name, slug, status, metadata, created_at, updated_at)
--     - tenant_memberships(id, tenant_id, user_id, role, status, metadata,
--       created_at, updated_at) — status in ('active','suspended','revoked')
--     - yzi_action_requests: id, tenant_id, session_id, recommendation_id,
--       requested_by (NOT NULL, FK auth.users ON DELETE CASCADE), action_type,
--       status DEFAULT 'pending' CHECK in ('pending','approved','rejected',
--       'executed','cancelled','blocked'), risk_level CHECK in ('low','medium',
--       'high','critical'), side_effects CHECK in ('none','internal_only',
--       'external_message','spend_credits','move_budget','publish_content',
--       'run_campaign'), payload jsonb, evidence_snapshot jsonb, approved_by,
--       approved_at, rejected_by, rejected_at, executed_at, metadata jsonb,
--       created_at, updated_at. UNIQUE INDEX (id, tenant_id). Trigger
--       yzi_action_requests_set_updated_at (yzi_set_updated_at). Policies:
--       INSERT (requested_by = auth.uid() AND status = 'pending' AND active
--       membership) and SELECT (active membership). NO UPDATE policy today.
--     - yzi_audit_events: id, tenant_id, actor_user_id, session_id,
--       recommendation_id, action_request_id, event_type NOT NULL,
--       event_label NOT NULL, source NOT NULL DEFAULT 'yzi',
--       evidence_snapshot jsonb, metadata jsonb, created_at. Composite tenant
--       FKs, e.g. (action_request_id, tenant_id) → yzi_action_requests
--       (id, tenant_id) ON DELETE SET NULL (pre-existing; NOT touched by this
--       pack). Policy: SELECT only (active membership). NO INSERT policy
--       today. Both tables have 0 rows — schema is the contract.
--     - Institutional helpers: yzi_is_active_tenant_member(p_tenant_id)
--       (membership + status='active'), yzi_set_updated_at() trigger fn.
--       Every existing yzi_* RPC is SECURITY INVOKER (prosecdef = false) with
--       `set search_path = public` and UPPER_SNAKE auth errors
--       ('AUTH_REQUIRED', 'TENANT_ACCESS_DENIED').
--
-- RECONCILIATION DECISIONS (hypotheses removed):
--   1. yzi_audit_events stub REMOVED — real INSERT into the live columns.
--      run_id travels in metadata (no run_id column; the institutional audit
--      table is NOT altered); action_request_id uses the existing FK column.
--   2. Approval status uses the LIVE enum: 'pending' (not 'pending_review'),
--      then 'approved' / 'rejected'. side_effects uses 'internal_only'.
--   3. Decision actor/timestamps REUSE approved_by/approved_at and
--      rejected_by/rejected_at. decided_by/decided_at were DROPPED.
--   4. Only genuinely absent columns are added to yzi_action_requests:
--      run_id, run_step_id, artifact_id, artifact_hash, decision_reason,
--      decision_note.
--   5. Cross-table tenant consistency uses COMPOSITE FKs (id, tenant_id).
--   6. Membership validation uses public.yzi_is_active_tenant_member.
--
-- HARDENING DECISIONS (this revision):
--
--   H1. ANTI-BYPASS FOR DECISIONS AND AUDIT (Bloqueio 1). Options evaluated:
--       (a) Table/column privileges (REVOKE UPDATE from authenticated):
--           REJECTED as the sole mechanism — under SECURITY INVOKER the RPC
--           runs with the caller's privileges, so revoking UPDATE from
--           `authenticated` would break the governed RPC too. Privileges
--           cannot distinguish "inside RPC" from "direct REST".
--       (b) Plain RLS policy (active member): REJECTED — RLS alone also
--           cannot distinguish RPC from direct REST for an invoker function.
--       (c) SECURITY DEFINER RPCs: REJECTED — not indispensable. It would
--           break the institutional SECURITY INVOKER pattern, bypass RLS
--           entirely, and concentrate risk in function-side validation only.
--       (d) CHOSEN: transaction-local gate via set_config(..., is_local =>
--           true) + RLS policies that require the gate. Only the governed
--           RPCs set the gate; PostgREST clients cannot execute arbitrary
--           set_config (pg_catalog functions are not exposed as RPC and each
--           REST request runs its own transaction), so a direct REST
--           UPDATE/INSERT never has the gate and is denied by RLS. Keeps
--           SECURITY INVOKER, keeps RLS as the tenant boundary, needs no
--           service role. Gates:
--             yzi.decision_gate  — UPDATE on yzi_action_requests
--                                  (set only inside yzi_decide_action_request)
--             yzi.audit_gate     — INSERT on yzi_audit_events
--                                  (set only inside yzi_internal_record_audit_event,
--                                   cleared immediately after the INSERT)
--             yzi.audit_caller_gate — checked INSIDE
--                                  yzi_internal_record_audit_event before it
--                                  opens yzi.audit_gate; set only by the four
--                                  workflow RPCs. Calling the audit writer
--                                  directly via REST /rpc therefore fails —
--                                  only the governed path records events.
--             yzi.run_write_gate — INSERT/UPDATE on yzi_runs / yzi_run_steps /
--                                  yzi_artifacts (set only inside the three
--                                  write RPCs), so run-slice state also cannot
--                                  be forged or tampered via direct REST.
--       (e) Trigger defense-in-depth: a BEFORE UPDATE trigger on
--           yzi_action_requests makes decided rows immutable at the engine
--           level (double decision impossible even if a future policy is
--           added carelessly). Allowed transitions: pending → approved /
--           rejected / cancelled / blocked, approved → executed. Everything
--           else on status/decision/actor columns raises.
--       Audit failure still aborts the caller's whole transaction (no
--       exception handler swallows it).
--
--   H2. FK DELETE ACTIONS (Bloqueio 2). No new FK uses ON DELETE SET NULL —
--       every composite (x_id, tenant_id) SET NULL would try to null
--       tenant_id (NOT NULL) and is therefore banned in this pack. Decisions
--       per relation (all NEW FKs are ON DELETE RESTRICT):
--         tenants → yzi_runs/steps/artifacts .... RESTRICT: offboarding a
--           tenant must be an explicit, human, ordered cleanup — never a
--           silent cascade that destroys operational evidence. (Conscious
--           deviation from the CASCADE used by older institutional tables.)
--         auth.users → yzi_runs.initiated_by .... RESTRICT: deleting a user
--           must not silently erase runs they initiated.
--         yzi_runs → yzi_run_steps ............... RESTRICT: a run with
--           recorded steps cannot silently disappear.
--         yzi_runs → yzi_artifacts ............... RESTRICT: evidence must
--           never vanish through a parent delete.
--         yzi_run_steps → yzi_artifacts .......... RESTRICT: same principle.
--         yzi_runs/steps/artifacts → yzi_action_requests (run_id,
--           run_step_id, artifact_id) ............ RESTRICT: the approval
--           history must keep its binding; detaching an approval from the
--           artifact it approved (SET NULL) would silently break the
--           production lock's evidence chain.
--         yzi_action_requests → yzi_audit_events . PRE-EXISTING institutional
--           FK (ON DELETE SET NULL on nullable action_request_id) — NOT
--           modified by this pack; audit rows themselves are never deleted
--           by any path in this pack.
--       Net effect: no orphan states, no nullable-tenant paths, deletion of
--       any row that carries evidence requires explicit human dependency
--       cleanup first.
--
-- Safety posture:
--   - All RPCs SECURITY INVOKER (run as the calling user, under RLS),
--     matching every existing YZI OS RPC. No SECURITY DEFINER anywhere.
--   - RLS enabled on every new table before any policy is relied on.
--   - No service role. No scheduler. No external call. No destructive DDL.
--   - Every new table carries tenant_id NOT NULL; every RPC re-validates
--     active tenant membership even though RLS also enforces it.
--   - The decision RPC ONLY records the decision. Advancing the workflow is
--     a separate, server-validated RPC called by the runtime.

-- ============================================================================
-- PART 0 — PREFLIGHT (READ-ONLY — RUN FIRST; expected results annotated)
-- ============================================================================

-- 0.1 Dependencies exist. Expect all 4 non-null; if any is null, STOP.
select to_regclass('public.tenants')             as tenants_table,
       to_regclass('public.tenant_memberships')  as tenant_memberships_table,
       to_regclass('public.yzi_action_requests') as yzi_action_requests_table,
       to_regclass('public.yzi_audit_events')    as yzi_audit_events_table;

-- 0.2 Confirm the audit columns this pack writes to still exist.
-- Expect exactly 6 rows: action_request_id, actor_user_id, event_label,
-- event_type, evidence_snapshot, metadata. Fewer rows => STOP (schema drifted).
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'yzi_audit_events'
  and column_name in ('actor_user_id','action_request_id','event_type',
                      'event_label','evidence_snapshot','metadata')
order by column_name;

-- 0.3 Confirm the action-request columns this pack reuses still exist.
-- Expect exactly 8 rows: approved_at, approved_by, evidence_snapshot,
-- metadata, rejected_at, rejected_by, requested_by, status.
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'yzi_action_requests'
  and column_name in ('requested_by','status','approved_by','approved_at',
                      'rejected_by','rejected_at','evidence_snapshot','metadata')
order by column_name;

-- 0.4 Confirm the live status CHECK still allows 'pending','approved','rejected'.
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.yzi_action_requests'::regclass
  and conname = 'yzi_action_requests_status_check';

-- 0.5 Columns this pack ADDS must not pre-exist with another meaning.
-- Expect 0 rows. Any row => STOP and reconcile manually.
select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'yzi_action_requests'
  and column_name in ('run_id','run_step_id','artifact_id','artifact_hash',
                      'decision_reason','decision_note');

-- 0.6 Tables this pack CREATES must not pre-exist. Expect all 3 null.
select to_regclass('public.yzi_runs')      as yzi_runs,
       to_regclass('public.yzi_run_steps') as yzi_run_steps,
       to_regclass('public.yzi_artifacts') as yzi_artifacts;

-- 0.7 Institutional helper functions this pack calls. Expect 2 rows, prosecdef = f.
select p.proname, p.prosecdef
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('yzi_is_active_tenant_member','yzi_set_updated_at');

-- 0.8 No conflicting policies/triggers with the names this pack creates.
-- Expect 0 rows on both.
select policyname from pg_policies
where schemaname = 'public'
  and policyname in ('yzi_action_requests_update_decision_gate',
                     'yzi_audit_events_insert_audit_gate');
select tgname from pg_trigger
where tgname = 'yzi_action_requests_decision_immutability'
  and tgrelid = 'public.yzi_action_requests'::regclass;

-- ============================================================================
-- PART 1 — NEW TABLE: yzi_runs
-- ============================================================================

create table if not exists public.yzi_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  initiated_by uuid not null references auth.users(id) on delete restrict,
  workflow_id text not null,
  intent_type text not null,
  active_asset_type text not null,
  active_asset_id text not null,
  context_fingerprint text not null,
  status text not null default 'running',
  cursor_step text not null default 'prepare_contact_followup',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint yzi_runs_workflow_id_check
    check (workflow_id = 'PREPARE_PROPERTY_CONTACT'),
  constraint yzi_runs_intent_type_check
    check (intent_type = 'property_contact_prepare'),
  constraint yzi_runs_active_asset_type_check
    check (active_asset_type = 'property'),
  constraint yzi_runs_status_check
    check (status in ('running','awaiting_approval','done','failed','cancelled')),
  constraint yzi_runs_cursor_step_check
    check (cursor_step in ('prepare_contact_followup','release_contact_draft')),
  constraint yzi_runs_active_asset_id_not_empty_check
    check (length(btrim(active_asset_id)) > 0),
  constraint yzi_runs_context_fingerprint_not_empty_check
    check (length(btrim(context_fingerprint)) > 0),
  -- Institutional pattern: (id, tenant_id) unique so children can carry
  -- composite tenant FKs (same as yzi_action_requests_id_tenant_unique).
  constraint yzi_runs_id_tenant_unique unique (id, tenant_id)
);

comment on table public.yzi_runs is
  'Unidade 3 (Persisted Run Slice) — run persistida do workflow PREPARE_PROPERTY_CONTACT. Escopo intencionalmente restrito a este único workflow (ver CHECK); ampliar exige nova unidade, não edição silenciosa. Escrita apenas via RPCs governadas (gate transacional yzi.run_write_gate).';

alter table public.yzi_runs enable row level security;

create index if not exists yzi_runs_tenant_status_idx
  on public.yzi_runs (tenant_id, status);
create index if not exists yzi_runs_tenant_workflow_created_idx
  on public.yzi_runs (tenant_id, workflow_id, created_at desc);

drop trigger if exists yzi_runs_set_updated_at on public.yzi_runs;
create trigger yzi_runs_set_updated_at
before update on public.yzi_runs
for each row execute function public.yzi_set_updated_at();

-- Policies (drop+create for idempotence; these are THIS pack's own policies).
-- SELECT: any active tenant member. INSERT/UPDATE: active tenant member AND
-- the transaction-local gate set only by the governed RPCs — a direct REST
-- write never has the gate and is denied.
drop policy if exists yzi_runs_select_tenant_member on public.yzi_runs;
create policy yzi_runs_select_tenant_member
on public.yzi_runs for select to authenticated
using (
  exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = yzi_runs.tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
);

drop policy if exists yzi_runs_insert_tenant_member on public.yzi_runs;
create policy yzi_runs_insert_tenant_member
on public.yzi_runs for insert to authenticated
with check (
  coalesce(current_setting('yzi.run_write_gate', true), '') = 'rpc'
  and initiated_by = auth.uid()
  and exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = yzi_runs.tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
);

drop policy if exists yzi_runs_update_tenant_member on public.yzi_runs;
create policy yzi_runs_update_tenant_member
on public.yzi_runs for update to authenticated
using (
  coalesce(current_setting('yzi.run_write_gate', true), '') = 'rpc'
  and exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = yzi_runs.tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
)
with check (
  coalesce(current_setting('yzi.run_write_gate', true), '') = 'rpc'
  and exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = yzi_runs.tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
);

-- ============================================================================
-- PART 1b — NEW TABLE: yzi_run_steps
-- ============================================================================

create table if not exists public.yzi_run_steps (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  run_id uuid not null,
  step_key text not null,
  attempt int not null default 1,
  status text not null default 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),

  constraint yzi_run_steps_step_key_check
    check (step_key in ('prepare_contact_followup','release_contact_draft')),
  constraint yzi_run_steps_attempt_check
    check (attempt >= 1),
  constraint yzi_run_steps_status_check
    check (status in ('pending','running','completed','failed')),
  constraint yzi_run_steps_unique_attempt
    unique (run_id, step_key, attempt),
  -- Tenant consistency by construction (institutional composite-FK pattern):
  -- a step's tenant_id MUST match its run's tenant_id. RESTRICT: a run with
  -- recorded steps cannot silently disappear.
  constraint yzi_run_steps_run_tenant_fkey
    foreign key (run_id, tenant_id)
    references public.yzi_runs(id, tenant_id) on delete restrict,
  -- Lets children (artifacts) pin (run_step_id, run_id) atomically.
  constraint yzi_run_steps_id_run_unique unique (id, run_id),
  constraint yzi_run_steps_id_tenant_unique unique (id, tenant_id)
);

comment on table public.yzi_run_steps is
  'Unidade 3 — transições por step/attempt. "Ajustar" cria attempt N+1 do step 1; "reformular" idem, mas o conteúdo do novo attempt nunca reaproveita o attempt anterior como autoridade (garantido em código de aplicação, não aqui). Escrita apenas via RPCs governadas.';

alter table public.yzi_run_steps enable row level security;

create index if not exists yzi_run_steps_run_id_idx
  on public.yzi_run_steps (run_id);
create index if not exists yzi_run_steps_tenant_idx
  on public.yzi_run_steps (tenant_id);

drop policy if exists yzi_run_steps_select_tenant_member on public.yzi_run_steps;
create policy yzi_run_steps_select_tenant_member
on public.yzi_run_steps for select to authenticated
using (
  exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = yzi_run_steps.tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
);

drop policy if exists yzi_run_steps_insert_tenant_member on public.yzi_run_steps;
create policy yzi_run_steps_insert_tenant_member
on public.yzi_run_steps for insert to authenticated
with check (
  coalesce(current_setting('yzi.run_write_gate', true), '') = 'rpc'
  and exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = yzi_run_steps.tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
);

drop policy if exists yzi_run_steps_update_tenant_member on public.yzi_run_steps;
create policy yzi_run_steps_update_tenant_member
on public.yzi_run_steps for update to authenticated
using (
  coalesce(current_setting('yzi.run_write_gate', true), '') = 'rpc'
  and exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = yzi_run_steps.tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
)
with check (
  coalesce(current_setting('yzi.run_write_gate', true), '') = 'rpc'
  and exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = yzi_run_steps.tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
);

-- ============================================================================
-- PART 1c — NEW TABLE: yzi_artifacts
-- ============================================================================

create table if not exists public.yzi_artifacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  run_id uuid not null,
  run_step_id uuid not null,
  contract_key text not null,
  version int not null,
  visibility text not null default 'approval',
  status text not null default 'written',
  content jsonb not null,
  content_hash text not null,
  created_at timestamptz not null default now(),

  constraint yzi_artifacts_contract_key_check
    check (contract_key = 'contact_draft'),
  constraint yzi_artifacts_version_check
    check (version >= 1),
  constraint yzi_artifacts_visibility_check
    check (visibility in ('internal','approval','final')),
  constraint yzi_artifacts_status_check
    check (status in ('written','sealed','superseded')),
  constraint yzi_artifacts_content_hash_not_empty_check
    check (length(btrim(content_hash)) > 0),
  constraint yzi_artifacts_content_has_message_check
    check (content ? 'message_draft'),
  constraint yzi_artifacts_content_message_not_empty_check
    check (length(btrim(content->>'message_draft')) > 0),
  constraint yzi_artifacts_unique_version
    unique (run_id, contract_key, version),
  -- Tenant/run consistency by construction. RESTRICT: evidence must never
  -- vanish through a parent delete.
  constraint yzi_artifacts_run_tenant_fkey
    foreign key (run_id, tenant_id)
    references public.yzi_runs(id, tenant_id) on delete restrict,
  constraint yzi_artifacts_step_run_fkey
    foreign key (run_step_id, run_id)
    references public.yzi_run_steps(id, run_id) on delete restrict,
  constraint yzi_artifacts_id_tenant_unique unique (id, tenant_id)
);

comment on table public.yzi_artifacts is
  'Unidade 3 — Evidence Store mínimo. Gate estrutural em DB (CHECK) é defesa em profundidade; o gate primário roda em código servidor ANTES do INSERT — nunca confia na declaração do modelo de que o conteúdo existe. Escrita apenas via RPCs governadas.';

alter table public.yzi_artifacts enable row level security;

create index if not exists yzi_artifacts_run_id_idx
  on public.yzi_artifacts (run_id);
create index if not exists yzi_artifacts_tenant_visibility_idx
  on public.yzi_artifacts (tenant_id, visibility);

drop policy if exists yzi_artifacts_select_tenant_member on public.yzi_artifacts;
create policy yzi_artifacts_select_tenant_member
on public.yzi_artifacts for select to authenticated
using (
  exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = yzi_artifacts.tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
);

drop policy if exists yzi_artifacts_insert_tenant_member on public.yzi_artifacts;
create policy yzi_artifacts_insert_tenant_member
on public.yzi_artifacts for insert to authenticated
with check (
  coalesce(current_setting('yzi.run_write_gate', true), '') = 'rpc'
  and exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = yzi_artifacts.tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
);

drop policy if exists yzi_artifacts_update_tenant_member on public.yzi_artifacts;
create policy yzi_artifacts_update_tenant_member
on public.yzi_artifacts for update to authenticated
using (
  coalesce(current_setting('yzi.run_write_gate', true), '') = 'rpc'
  and exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = yzi_artifacts.tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
)
with check (
  coalesce(current_setting('yzi.run_write_gate', true), '') = 'rpc'
  and exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = yzi_artifacts.tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
);

-- ============================================================================
-- PART 2 — EXTEND yzi_action_requests (ADD COLUMN IF NOT EXISTS ONLY)
-- ============================================================================
-- REUSED live columns (nothing added for these): status ('pending' →
-- 'approved'/'rejected'), requested_by, approved_by/approved_at,
-- rejected_by/rejected_at, payload, evidence_snapshot, metadata, tenant_id,
-- risk_level, side_effects, created_at/updated_at.
-- ADDED (genuinely absent, confirmed by Part 0.5). Columns are added WITHOUT
-- inline single-column FKs; the composite tenant FKs below (ON DELETE
-- RESTRICT — never SET NULL, which would try to null tenant_id) are the only
-- FKs, so the approval's binding to run/artifact can never be silently
-- detached.

alter table public.yzi_action_requests
  add column if not exists run_id uuid,
  add column if not exists run_step_id uuid,
  add column if not exists artifact_id uuid,
  add column if not exists artifact_hash text,
  add column if not exists decision_reason text,
  add column if not exists decision_note text;

create index if not exists yzi_action_requests_run_id_idx
  on public.yzi_action_requests (run_id);

-- Composite tenant FKs, mirroring the institutional composite pattern but
-- with RESTRICT (evidence chain must not be silently broken).
-- (No "ADD CONSTRAINT IF NOT EXISTS" in Postgres; guard manually.)
do $$
begin
  if not exists (select 1 from pg_constraint
                 where conname = 'yzi_action_requests_run_tenant_fkey') then
    alter table public.yzi_action_requests
      add constraint yzi_action_requests_run_tenant_fkey
      foreign key (run_id, tenant_id)
      references public.yzi_runs(id, tenant_id) on delete restrict;
  end if;
  if not exists (select 1 from pg_constraint
                 where conname = 'yzi_action_requests_step_tenant_fkey') then
    alter table public.yzi_action_requests
      add constraint yzi_action_requests_step_tenant_fkey
      foreign key (run_step_id, tenant_id)
      references public.yzi_run_steps(id, tenant_id) on delete restrict;
  end if;
  if not exists (select 1 from pg_constraint
                 where conname = 'yzi_action_requests_artifact_tenant_fkey') then
    alter table public.yzi_action_requests
      add constraint yzi_action_requests_artifact_tenant_fkey
      foreign key (artifact_id, tenant_id)
      references public.yzi_artifacts(id, tenant_id) on delete restrict;
  end if;
  if not exists (select 1 from pg_constraint
                 where conname = 'yzi_action_requests_decision_reason_check') then
    alter table public.yzi_action_requests
      add constraint yzi_action_requests_decision_reason_check
      check (decision_reason is null or decision_reason in ('adjust','rework'));
  end if;
end $$;

-- ============================================================================
-- PART 2b — GATED POLICIES ON INSTITUTIONAL TABLES (guarded — created only
-- if absent; never replaces an existing policy)
-- ============================================================================
-- (a) UPDATE on yzi_action_requests: required by the decision RPC under
--     SECURITY INVOKER. The policy demands BOTH active membership AND the
--     transaction-local gate `yzi.decision_gate`, which ONLY
--     yzi_decide_action_request sets. A direct REST UPDATE (PostgREST) runs
--     without the gate => USING fails => 0 rows updatable => bypass blocked.
--     Approving/rejecting via REST is therefore impossible; the governed
--     path (single decision, artifact/hash binding, transactional audit,
--     adjust/rework rules, production lock) cannot be circumvented.
-- (b) INSERT on yzi_audit_events: required by the audit function under
--     SECURITY INVOKER. The policy demands active membership AND
--     actor_user_id = auth.uid() AND the transaction-local gate
--     `yzi.audit_gate`, which ONLY yzi_internal_record_audit_event sets (and
--     clears right after its INSERT). Ordinary users cannot fabricate audit
--     events via REST.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'yzi_action_requests'
      and policyname = 'yzi_action_requests_update_decision_gate'
  ) then
    create policy yzi_action_requests_update_decision_gate
    on public.yzi_action_requests for update to authenticated
    using (
      coalesce(current_setting('yzi.decision_gate', true), '') = 'yzi_decide_action_request'
      and exists (
        select 1 from public.tenant_memberships tm
        where tm.tenant_id = yzi_action_requests.tenant_id
          and tm.user_id = auth.uid()
          and tm.status = 'active'
      )
    )
    with check (
      coalesce(current_setting('yzi.decision_gate', true), '') = 'yzi_decide_action_request'
      and exists (
        select 1 from public.tenant_memberships tm
        where tm.tenant_id = yzi_action_requests.tenant_id
          and tm.user_id = auth.uid()
          and tm.status = 'active'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'yzi_audit_events'
      and policyname = 'yzi_audit_events_insert_audit_gate'
  ) then
    create policy yzi_audit_events_insert_audit_gate
    on public.yzi_audit_events for insert to authenticated
    with check (
      coalesce(current_setting('yzi.audit_gate', true), '') = 'yzi_internal_record_audit_event'
      and actor_user_id = auth.uid()
      and exists (
        select 1 from public.tenant_memberships tm
        where tm.tenant_id = yzi_audit_events.tenant_id
          and tm.user_id = auth.uid()
          and tm.status = 'active'
      )
    );
  end if;
end $$;

-- ============================================================================
-- PART 2c — DECISION IMMUTABILITY TRIGGER (defense in depth)
-- ============================================================================
-- Engine-level guarantee, independent of RLS and of any future policy: a
-- decided action request can never be re-decided or have its decision fields
-- rewritten. Allowed status transitions on UPDATE:
--   pending  → approved | rejected | cancelled | blocked
--   approved → executed          (future execution flows; decision untouched)
-- Everything else that touches status/decision/actor columns raises.
-- New function (no existing function is replaced); plain trigger function,
-- runs regardless of who performs the UPDATE.

create or replace function public.yzi_guard_action_request_decision()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if old.status = 'pending'
       and new.status in ('approved','rejected','cancelled','blocked') then
      null; -- legal decision transition
    elsif old.status = 'approved' and new.status = 'executed' then
      null; -- legal future execution transition
    else
      raise exception 'already_decided: illegal status transition % -> %',
        old.status, new.status;
    end if;
  end if;

  if old.status in ('approved','rejected','executed','cancelled','blocked') then
    if new.decision_reason is distinct from old.decision_reason
       or new.decision_note is distinct from old.decision_note
       or new.approved_by  is distinct from old.approved_by
       or new.approved_at  is distinct from old.approved_at
       or new.rejected_by  is distinct from old.rejected_by
       or new.rejected_at  is distinct from old.rejected_at
       or new.artifact_id  is distinct from old.artifact_id
       or new.artifact_hash is distinct from old.artifact_hash
       or new.run_id       is distinct from old.run_id
       or new.run_step_id  is distinct from old.run_step_id then
      raise exception 'already_decided: decision evidence is immutable';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists yzi_action_requests_decision_immutability
  on public.yzi_action_requests;
create trigger yzi_action_requests_decision_immutability
before update on public.yzi_action_requests
for each row execute function public.yzi_guard_action_request_decision();

-- ============================================================================
-- PART 3 — AUDIT EVENT WRITER (REAL — stub removed; live columns confirmed)
-- ============================================================================
-- Institutional contract: tenant_id + actor_user_id + event_type +
-- event_label + source + evidence_snapshot + metadata. run_id has no column
-- in yzi_audit_events (deliberately NOT added — the institutional table is
-- not altered by this pack); it is recorded in metadata.run_id, and
-- action_request_id uses the existing FK column when applicable.
-- The function REFUSES to run unless `yzi.audit_caller_gate` is open (set
-- only by the four workflow RPCs) — so calling it directly via REST /rpc
-- fails and events cannot be fabricated. It then opens `yzi.audit_gate`
-- transaction-locally (required by the INSERT policy), inserts, and closes
-- the gate immediately. Any failure here raises => the CALLER's whole
-- transaction rolls back.

create or replace function public.yzi_internal_record_audit_event(
  p_tenant_id uuid,
  p_run_id uuid,
  p_action_request_id uuid,
  p_event_type text,
  p_event_label text,
  p_evidence jsonb default '{}'::jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if coalesce(current_setting('yzi.audit_caller_gate', true), '') <> 'rpc' then
    raise exception 'audit_event_outside_governed_path';
  end if;

  perform set_config('yzi.audit_gate', 'yzi_internal_record_audit_event', true);

  insert into public.yzi_audit_events (
    tenant_id, actor_user_id, action_request_id,
    event_type, event_label, source,
    evidence_snapshot, metadata
  ) values (
    p_tenant_id, auth.uid(), p_action_request_id,
    p_event_type, p_event_label, 'yzi',
    coalesce(p_evidence, '{}'::jsonb),
    jsonb_build_object(
      'run_id', p_run_id,
      'origin', 'prepare_contact_run_slice_v1'
    )
  );

  perform set_config('yzi.audit_gate', '', true);
end;
$$;

-- ============================================================================
-- PART 4 — RPCs (SECURITY INVOKER, matches every existing YZI OS RPC)
-- ============================================================================

-- 4.1 Start the run — step 1, artifact v1, checkpoint, all in one transaction.
create or replace function public.yzi_start_prepare_contact_run(
  p_tenant_id uuid,
  p_active_asset_id text,
  p_context_fingerprint text,
  p_content jsonb,
  p_content_hash text
)
returns table (
  run_id uuid,
  run_step_id uuid,
  artifact_id uuid,
  action_request_id uuid,
  status text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_run_id uuid;
  v_step1_id uuid;
  v_artifact_id uuid;
  v_action_request_id uuid;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if not public.yzi_is_active_tenant_member(p_tenant_id) then
    raise exception 'TENANT_ACCESS_DENIED';
  end if;

  if p_content is null or not (p_content ? 'message_draft')
     or length(btrim(p_content->>'message_draft')) = 0 then
    raise exception 'artifact_gate_failed: message_draft missing or empty';
  end if;
  if p_content_hash is null or length(btrim(p_content_hash)) = 0 then
    raise exception 'artifact_gate_failed: content_hash missing';
  end if;

  -- Open the governed gates for this transaction only (RLS/audit require them).
  perform set_config('yzi.run_write_gate', 'rpc', true);
  perform set_config('yzi.audit_caller_gate', 'rpc', true);

  insert into public.yzi_runs (
    tenant_id, initiated_by, workflow_id, intent_type,
    active_asset_type, active_asset_id, context_fingerprint,
    status, cursor_step
  ) values (
    p_tenant_id, auth.uid(), 'PREPARE_PROPERTY_CONTACT', 'property_contact_prepare',
    'property', p_active_asset_id, p_context_fingerprint,
    'awaiting_approval', 'prepare_contact_followup'
  )
  returning id into v_run_id;

  insert into public.yzi_run_steps (
    tenant_id, run_id, step_key, attempt, status, started_at, completed_at
  ) values (
    p_tenant_id, v_run_id, 'prepare_contact_followup', 1, 'completed', now(), now()
  )
  returning id into v_step1_id;

  -- Step 2 pre-created as pending so the timeline is visible before any
  -- decision exists; it stays 'pending' until yzi_advance_after_approval.
  insert into public.yzi_run_steps (
    tenant_id, run_id, step_key, attempt, status
  ) values (
    p_tenant_id, v_run_id, 'release_contact_draft', 1, 'pending'
  );

  insert into public.yzi_artifacts (
    tenant_id, run_id, run_step_id, contract_key, version,
    visibility, status, content, content_hash
  ) values (
    p_tenant_id, v_run_id, v_step1_id, 'contact_draft', 1,
    'approval', 'written', p_content, p_content_hash
  )
  returning id into v_artifact_id;

  -- Live-schema insert: requested_by NOT NULL; status must be 'pending' to
  -- satisfy the live INSERT policy; side_effects 'internal_only' (live enum
  -- has no 'draft_only' — the draft never leaves the platform at this stage).
  insert into public.yzi_action_requests (
    tenant_id, requested_by, action_type, status, risk_level, side_effects,
    payload, evidence_snapshot, metadata,
    run_id, run_step_id, artifact_id, artifact_hash
  ) values (
    p_tenant_id, auth.uid(), 'contact_draft_release', 'pending', 'medium', 'internal_only',
    p_content,
    jsonb_build_object('context_fingerprint', p_context_fingerprint),
    jsonb_build_object(
      'created_by_rpc', 'yzi_start_prepare_contact_run',
      'rpc_version', 'v1',
      'execution_status', 'not_executed'
    ),
    v_run_id, v_step1_id, v_artifact_id, p_content_hash
  )
  returning id into v_action_request_id;

  perform set_config('yzi.run_write_gate', '', true);

  perform public.yzi_internal_record_audit_event(
    p_tenant_id, v_run_id, v_action_request_id,
    'run.started', 'Run PREPARE_PROPERTY_CONTACT iniciada',
    jsonb_build_object('workflow_id', 'PREPARE_PROPERTY_CONTACT'));
  perform public.yzi_internal_record_audit_event(
    p_tenant_id, v_run_id, v_action_request_id,
    'step.started', 'Step prepare_contact_followup iniciado (attempt 1)',
    jsonb_build_object('step_key', 'prepare_contact_followup', 'attempt', 1));
  perform public.yzi_internal_record_audit_event(
    p_tenant_id, v_run_id, v_action_request_id,
    'step.output_gate_passed', 'Gate de conteúdo do rascunho aprovado no servidor',
    jsonb_build_object('step_key', 'prepare_contact_followup'));
  perform public.yzi_internal_record_audit_event(
    p_tenant_id, v_run_id, v_action_request_id,
    'artifact.created', 'Artefato contact_draft v1 criado',
    jsonb_build_object('artifact_id', v_artifact_id, 'version', 1,
                       'content_hash', p_content_hash));
  perform public.yzi_internal_record_audit_event(
    p_tenant_id, v_run_id, v_action_request_id,
    'approval.requested', 'Checkpoint humano criado para contact_draft',
    jsonb_build_object('gate', 'contact_draft'));

  perform set_config('yzi.audit_caller_gate', '', true);

  return query select v_run_id, v_step1_id, v_artifact_id, v_action_request_id,
                      'awaiting_approval'::text;
end;
$$;

-- 4.2 Decide the checkpoint — registers the decision ONLY. Never advances the
-- workflow (the app-layer runtime calls 4.3 or 4.4 next). Uses the LIVE
-- status enum ('pending' → 'approved'/'rejected') and the LIVE actor columns
-- (approved_by/approved_at or rejected_by/rejected_at). This is the ONLY
-- code path that opens `yzi.decision_gate` — decisions cannot happen any
-- other way.
--
-- IMPORTANT (fixed after live testing, 2026-07-11): the gate MUST be opened
-- BEFORE the `select ... for update` below, not just before the `update`.
-- Postgres RLS treats a locking read (FOR UPDATE/FOR SHARE) as requiring the
-- USING clause of any applicable UPDATE policy to pass too, not only the
-- SELECT policy's USING clause — because taking the row lock is itself a
-- form of update. Since `yzi_action_requests_update_decision_gate` (Part 2b)
-- requires `yzi.decision_gate`, opening the gate only after this SELECT
-- caused the locking read itself to be filtered out by RLS, producing a
-- false 'approval_item_not_found' even for a real, visible row. Opening the
-- gate first is safe: if any check below still fails, the function raises
-- and the whole transaction (including the gate's transaction-local value)
-- is rolled back — no partial effect ever persists.
create or replace function public.yzi_decide_action_request(
  p_action_request_id uuid,
  p_decision text,
  p_decision_reason text default null,
  p_decision_note text default null
)
returns table (
  action_request_id uuid,
  status text,
  decided_at timestamptz
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_current_status text;
  v_run_id uuid;
  v_now timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if p_decision not in ('approved', 'rejected') then
    raise exception 'invalid_decision: %', p_decision;
  end if;
  if p_decision = 'rejected'
     and (p_decision_reason is null or p_decision_reason not in ('adjust','rework')) then
    raise exception 'decision_reason_required_for_rejection';
  end if;
  if p_decision = 'approved' and p_decision_reason is not null then
    raise exception 'decision_reason_not_allowed_for_approval';
  end if;

  -- Open the decision gate BEFORE the locking read (see note above) so the
  -- UPDATE-policy USING clause does not filter out the row during FOR UPDATE.
  perform set_config('yzi.decision_gate', 'yzi_decide_action_request', true);

  select ar.tenant_id, ar.status, ar.run_id
    into v_tenant_id, v_current_status, v_run_id
  from public.yzi_action_requests ar
  where ar.id = p_action_request_id
  for update;

  if not found then
    raise exception 'approval_item_not_found';
  end if;

  if not public.yzi_is_active_tenant_member(v_tenant_id) then
    raise exception 'approver_not_authorized';
  end if;

  -- Honest duplicate-decision failure: silence never approves, and a second
  -- decision on an already-decided item fails loudly. (Also enforced at the
  -- engine level by the Part 2c trigger.)
  if v_current_status <> 'pending' then
    raise exception 'already_decided: current status is %', v_current_status;
  end if;

  update public.yzi_action_requests ar
  set status = p_decision,
      decision_reason = p_decision_reason,
      decision_note = p_decision_note,
      approved_by = case when p_decision = 'approved' then auth.uid() else ar.approved_by end,
      approved_at = case when p_decision = 'approved' then v_now else ar.approved_at end,
      rejected_by = case when p_decision = 'rejected' then auth.uid() else ar.rejected_by end,
      rejected_at = case when p_decision = 'rejected' then v_now else ar.rejected_at end
  where ar.id = p_action_request_id;

  perform set_config('yzi.decision_gate', '', true);

  perform set_config('yzi.audit_caller_gate', 'rpc', true);
  perform public.yzi_internal_record_audit_event(
    v_tenant_id, v_run_id, p_action_request_id,
    'approval.decided', 'Decisão humana registrada no checkpoint',
    jsonb_build_object(
      'decision', p_decision,
      'decision_reason', p_decision_reason
    )
  );
  perform set_config('yzi.audit_caller_gate', '', true);

  return query select p_action_request_id, p_decision, v_now;
end;
$$;

-- 4.3 Advance to step 2 AFTER an 'approved' decision. Re-validates the
-- production lock INSIDE the transaction (never trusts the caller): the
-- approval must belong to this exact run, this exact artifact, and this
-- exact content hash.
create or replace function public.yzi_advance_after_approval(
  p_run_id uuid,
  p_action_request_id uuid
)
returns table (
  run_id uuid,
  run_step_id uuid,
  artifact_id uuid,
  status text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_ar_status text;
  v_ar_run_id uuid;
  v_artifact_id uuid;
  v_artifact_hash text;
  v_ar_hash text;
  v_artifact_run_id uuid;
  v_artifact_status text;
  v_step2_id uuid;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  -- Open the run-write gate BEFORE any locking read (see the note on
  -- yzi_decide_action_request above): FOR UPDATE on yzi_runs / yzi_artifacts
  -- requires the applicable UPDATE policy's USING clause to pass, and both
  -- policies require yzi.run_write_gate. Opening it late made both locking
  -- reads below invisible under RLS, producing false 'run_not_found' /
  -- 'production_lock_violation' errors even for legitimate rows. If any
  -- check below still fails, the whole transaction rolls back, so opening
  -- the gate early has no unsafe side effect.
  perform set_config('yzi.run_write_gate', 'rpc', true);

  select r.tenant_id into v_tenant_id
  from public.yzi_runs r where r.id = p_run_id for update;
  if not found then
    raise exception 'run_not_found';
  end if;
  if not public.yzi_is_active_tenant_member(v_tenant_id) then
    raise exception 'TENANT_ACCESS_DENIED';
  end if;

  select ar.status, ar.run_id, ar.artifact_id, ar.artifact_hash
    into v_ar_status, v_ar_run_id, v_artifact_id, v_ar_hash
  from public.yzi_action_requests ar
  where ar.id = p_action_request_id;

  if not found or v_ar_run_id is distinct from p_run_id then
    raise exception 'production_lock_violation: approval does not belong to this run';
  end if;
  if v_ar_status <> 'approved' then
    raise exception 'production_lock_violation: decision is not approved (status=%)', v_ar_status;
  end if;
  if v_artifact_id is null or v_ar_hash is null then
    raise exception 'production_lock_violation: approval carries no artifact binding';
  end if;

  select a.run_id, a.content_hash, a.status
    into v_artifact_run_id, v_artifact_hash, v_artifact_status
  from public.yzi_artifacts a
  where a.id = v_artifact_id
  for update;

  if not found or v_artifact_run_id <> p_run_id then
    raise exception 'production_lock_violation: artifact does not belong to this run';
  end if;
  if v_artifact_hash <> v_ar_hash then
    raise exception 'production_lock_violation: artifact hash does not match the approved hash';
  end if;
  if v_artifact_status <> 'written' then
    raise exception 'production_lock_violation: artifact is not in a sealable state (status=%)', v_artifact_status;
  end if;

  update public.yzi_artifacts
  set status = 'sealed', visibility = 'final'
  where id = v_artifact_id;

  update public.yzi_run_steps s
  set status = 'completed',
      started_at = coalesce(s.started_at, now()),
      completed_at = now()
  where s.run_id = p_run_id and s.step_key = 'release_contact_draft' and s.attempt = 1
  returning s.id into v_step2_id;

  update public.yzi_runs
  set status = 'done', cursor_step = 'release_contact_draft'
  where id = p_run_id;

  perform set_config('yzi.run_write_gate', '', true);
  perform set_config('yzi.audit_caller_gate', 'rpc', true);

  perform public.yzi_internal_record_audit_event(
    v_tenant_id, p_run_id, p_action_request_id,
    'approval.gate_unlocked', 'Gate contact_draft liberado por aprovação humana',
    jsonb_build_object('gate', 'contact_draft'));
  perform public.yzi_internal_record_audit_event(
    v_tenant_id, p_run_id, p_action_request_id,
    'artifact.sealed', 'Artefato selado após aprovação',
    jsonb_build_object('artifact_id', v_artifact_id));
  perform public.yzi_internal_record_audit_event(
    v_tenant_id, p_run_id, p_action_request_id,
    'run.completed', 'Run concluída',
    jsonb_build_object('run_id', p_run_id));

  perform set_config('yzi.audit_caller_gate', '', true);

  return query select p_run_id, v_step2_id, v_artifact_id, 'done'::text;
end;
$$;

-- 4.4 Record a new attempt after 'adjust' or 'rework'. Only proceeds if the
-- previous action_request was actually rejected with the matching reason —
-- prevents the client from forging progression.
create or replace function public.yzi_record_run_adjustment(
  p_run_id uuid,
  p_previous_action_request_id uuid,
  p_mode text,
  p_new_content jsonb,
  p_new_content_hash text
)
returns table (
  run_id uuid,
  run_step_id uuid,
  artifact_id uuid,
  action_request_id uuid,
  status text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_prev_status text;
  v_prev_reason text;
  v_prev_run_id uuid;
  v_prev_artifact_id uuid;
  v_prev_version int;
  v_new_attempt int;
  v_new_step_id uuid;
  v_new_artifact_id uuid;
  v_new_action_request_id uuid;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if p_mode not in ('adjust','rework') then
    raise exception 'invalid_mode: %', p_mode;
  end if;
  if p_new_content is null or not (p_new_content ? 'message_draft')
     or length(btrim(p_new_content->>'message_draft')) = 0 then
    raise exception 'artifact_gate_failed: message_draft missing or empty';
  end if;
  if p_new_content_hash is null or length(btrim(p_new_content_hash)) = 0 then
    raise exception 'artifact_gate_failed: content_hash missing';
  end if;

  -- Open the run-write gate BEFORE any locking read (same fix applied to
  -- yzi_decide_action_request and yzi_advance_after_approval): FOR UPDATE on
  -- yzi_runs / yzi_artifacts requires the applicable UPDATE policy's USING
  -- clause to pass, which requires yzi.run_write_gate. Opening it late made
  -- both locking reads below invisible under RLS. If any check below still
  -- fails, the whole transaction rolls back, so opening the gate early has
  -- no unsafe side effect.
  perform set_config('yzi.run_write_gate', 'rpc', true);

  select r.tenant_id into v_tenant_id
  from public.yzi_runs r where r.id = p_run_id for update;
  if not found then
    raise exception 'run_not_found';
  end if;
  if not public.yzi_is_active_tenant_member(v_tenant_id) then
    raise exception 'TENANT_ACCESS_DENIED';
  end if;

  select ar.status, ar.decision_reason, ar.run_id, ar.artifact_id
    into v_prev_status, v_prev_reason, v_prev_run_id, v_prev_artifact_id
  from public.yzi_action_requests ar
  where ar.id = p_previous_action_request_id;

  if not found or v_prev_run_id is distinct from p_run_id then
    raise exception 'adjustment_not_allowed: previous approval does not belong to this run';
  end if;
  if v_prev_status <> 'rejected' or v_prev_reason is distinct from p_mode then
    raise exception 'adjustment_not_allowed: previous decision is not a matching rejection (status=%, reason=%)', v_prev_status, v_prev_reason;
  end if;

  select a.version into v_prev_version
  from public.yzi_artifacts a where a.id = v_prev_artifact_id for update;
  if not found then
    raise exception 'previous_artifact_not_found';
  end if;

  -- Table alias required: this function's RETURNS TABLE declares an OUT
  -- parameter named `status`, so an unqualified `status` in the WHERE clause
  -- is ambiguous between that variable and the column (fixed after live
  -- testing, 2026-07-11). The SET target and the id/tenant lookups elsewhere
  -- in this function are unaffected (assignment targets and INSERT column
  -- lists are not subject to this resolution, and other reads already use a
  -- table alias), so this is the only statement that needed qualification.
  update public.yzi_artifacts as a
  set status = 'superseded'
  where a.id = v_prev_artifact_id
    and a.status = 'written';

  select coalesce(max(s.attempt), 0) + 1 into v_new_attempt
  from public.yzi_run_steps s
  where s.run_id = p_run_id and s.step_key = 'prepare_contact_followup';

  insert into public.yzi_run_steps (
    tenant_id, run_id, step_key, attempt, status, started_at, completed_at
  ) values (
    v_tenant_id, p_run_id, 'prepare_contact_followup', v_new_attempt, 'completed', now(), now()
  )
  returning id into v_new_step_id;

  insert into public.yzi_artifacts (
    tenant_id, run_id, run_step_id, contract_key, version,
    visibility, status, content, content_hash
  ) values (
    v_tenant_id, p_run_id, v_new_step_id, 'contact_draft', v_prev_version + 1,
    'approval', 'written', p_new_content, p_new_content_hash
  )
  returning id into v_new_artifact_id;

  insert into public.yzi_action_requests (
    tenant_id, requested_by, action_type, status, risk_level, side_effects,
    payload, evidence_snapshot, metadata,
    run_id, run_step_id, artifact_id, artifact_hash
  ) values (
    v_tenant_id, auth.uid(), 'contact_draft_release', 'pending', 'medium', 'internal_only',
    p_new_content,
    jsonb_build_object('adjustment_mode', p_mode,
                       'previous_action_request_id', p_previous_action_request_id),
    jsonb_build_object(
      'created_by_rpc', 'yzi_record_run_adjustment',
      'rpc_version', 'v1',
      'execution_status', 'not_executed'
    ),
    p_run_id, v_new_step_id, v_new_artifact_id, p_new_content_hash
  )
  returning id into v_new_action_request_id;

  update public.yzi_runs
  set status = 'awaiting_approval', cursor_step = 'prepare_contact_followup'
  where id = p_run_id;

  perform set_config('yzi.run_write_gate', '', true);
  perform set_config('yzi.audit_caller_gate', 'rpc', true);

  perform public.yzi_internal_record_audit_event(
    v_tenant_id, p_run_id, v_new_action_request_id,
    'artifact.superseded', 'Artefato anterior substituído após rejeição',
    jsonb_build_object('artifact_id', v_prev_artifact_id, 'mode', p_mode));
  perform public.yzi_internal_record_audit_event(
    v_tenant_id, p_run_id, v_new_action_request_id,
    'step.started', 'Novo attempt do step prepare_contact_followup',
    jsonb_build_object('step_key', 'prepare_contact_followup', 'attempt', v_new_attempt));
  perform public.yzi_internal_record_audit_event(
    v_tenant_id, p_run_id, v_new_action_request_id,
    'step.output_gate_passed', 'Gate de conteúdo do novo rascunho aprovado no servidor',
    jsonb_build_object('step_key', 'prepare_contact_followup'));
  perform public.yzi_internal_record_audit_event(
    v_tenant_id, p_run_id, v_new_action_request_id,
    'artifact.created', 'Novo artefato contact_draft criado',
    jsonb_build_object('artifact_id', v_new_artifact_id, 'version', v_prev_version + 1,
                       'content_hash', p_new_content_hash));
  perform public.yzi_internal_record_audit_event(
    v_tenant_id, p_run_id, v_new_action_request_id,
    'approval.requested', 'Novo checkpoint humano criado para contact_draft',
    jsonb_build_object('gate', 'contact_draft'));

  perform set_config('yzi.audit_caller_gate', '', true);

  return query select p_run_id, v_new_step_id, v_new_artifact_id,
                      v_new_action_request_id, 'awaiting_approval'::text;
end;
$$;

-- ============================================================================
-- PART 5 — POST-APPLICATION VERIFICATION (READ-ONLY)
-- ============================================================================

-- 5.1 Tables exist with RLS enabled. Expect 3 rows, relrowsecurity = t.
select relname, relrowsecurity
from pg_class
where relname in ('yzi_runs','yzi_run_steps','yzi_artifacts')
  and relnamespace = 'public'::regnamespace;

-- 5.2 Policies present. Expect 3 per new table (select/insert/update) PLUS
-- yzi_action_requests_update_decision_gate and
-- yzi_audit_events_insert_audit_gate.
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('yzi_runs','yzi_run_steps','yzi_artifacts',
                    'yzi_action_requests','yzi_audit_events')
order by tablename, cmd, policyname;

-- 5.3 Gate expressions really present in the policies. Expect 8 rows (every
-- INSERT/UPDATE policy of the new tables + the 2 institutional policies),
-- each containing a current_setting('yzi.*') reference.
select tablename, policyname
from pg_policies
where schemaname = 'public'
  and (coalesce(qual,'') like '%current_setting%'
       or coalesce(with_check,'') like '%current_setting%')
order by tablename, policyname;

-- 5.4 New columns present on yzi_action_requests. Expect exactly 6 rows.
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'yzi_action_requests'
  and column_name in ('run_id','run_step_id','artifact_id','artifact_hash',
                      'decision_reason','decision_note')
order by column_name;

-- 5.5 RPCs present with security invoker. Expect 6 rows, all prosecdef = f
-- (includes the trigger guard function — no SECURITY DEFINER anywhere).
select p.proname, p.prosecdef
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'yzi_start_prepare_contact_run',
    'yzi_decide_action_request',
    'yzi_advance_after_approval',
    'yzi_record_run_adjustment',
    'yzi_internal_record_audit_event',
    'yzi_guard_action_request_decision'
  );

-- 5.6 FKs: all NEW FKs must be RESTRICT ('r'); NO new FK may be SET NULL.
-- confdeltype: a=no action, r=restrict, c=cascade, n=set null, d=set default.
-- Expect every listed conname with confdeltype = 'r'.
select conname, confdeltype
from pg_constraint
where conname in (
  'yzi_run_steps_run_tenant_fkey',
  'yzi_artifacts_run_tenant_fkey',
  'yzi_artifacts_step_run_fkey',
  'yzi_action_requests_run_tenant_fkey',
  'yzi_action_requests_step_tenant_fkey',
  'yzi_action_requests_artifact_tenant_fkey'
)
order by conname;

-- 5.7 Decision-immutability trigger present. Expect 1 row.
select tgname from pg_trigger
where tgrelid = 'public.yzi_action_requests'::regclass
  and tgname = 'yzi_action_requests_decision_immutability';

-- ============================================================================
-- PART 6 — MANUAL TEST SCRIPT (roteiro; run as two different authenticated
-- sessions/users belonging to two different tenants)
-- ============================================================================
--
-- (A) HAPPY PATH — as User A (tenant A, active member):
--   select * from public.yzi_start_prepare_contact_run(
--     '<tenant_A_id>'::uuid, 'prop_001', 'fp:test',
--     '{"message_draft":"teste"}'::jsonb, 'deadbeef');
--   -- expect: 1 row, status 'awaiting_approval'; yzi_audit_events gains 5
--   -- events (run.started … approval.requested), tenant A, actor = user A.
--
-- (B) BYPASS TEST 1 — direct UPDATE on yzi_action_requests (as User A, who
--     IS an active member — proves membership alone is not enough):
--   update public.yzi_action_requests
--   set status = 'approved' where id = '<action_request_id>';
--   -- MUST report "UPDATE 0": the RLS USING clause requires
--   -- yzi.decision_gate, which no direct statement has. Zero rows are
--   -- updatable => approving/rejecting via REST/direct SQL is impossible.
--   select status from public.yzi_action_requests
--   where id = '<action_request_id>';   -- MUST still be 'pending'.
--
-- (C) BYPASS TEST 2 — direct INSERT into yzi_audit_events (as User A):
--   insert into public.yzi_audit_events
--     (tenant_id, actor_user_id, event_type, event_label)
--   values ('<tenant_A_id>', auth.uid(), 'forged.event', 'forjado');
--   -- MUST FAIL with "new row violates row-level security policy":
--   -- yzi.audit_gate is not set outside yzi_internal_record_audit_event.
--
-- (D) BYPASS TEST 3 — calling the audit writer directly (as User A):
--   select public.yzi_internal_record_audit_event(
--     '<tenant_A_id>', null, null, 'forged.event', 'forjado');
--   -- MUST raise 'audit_event_outside_governed_path': the function refuses
--   -- to run unless yzi.audit_caller_gate is open, and only the four
--   -- workflow RPCs open it. Direct REST /rpc fabrication is impossible.
--
-- (E) GOVERNED DECISION — as User A:
--   select * from public.yzi_decide_action_request('<action_request_id>', 'approved');
--   -- expect: 1 row, status 'approved'; audit event approval.decided created.
--   select * from public.yzi_decide_action_request('<action_request_id>', 'approved');
--   -- second call MUST raise 'already_decided: current status is approved'.
--
-- (F) TRIGGER IMMUTABILITY — as the operator (or any path that could update):
--   -- even a statement that WOULD pass RLS cannot rewrite a decision:
--   -- inside yzi_decide_action_request a second decision is blocked by
--   -- status check AND by the Part 2c trigger
--   -- ('already_decided: illegal status transition approved -> rejected').
--
-- (G) PRODUCTION LOCK — as User A:
--   select * from public.yzi_advance_after_approval('<run_id>', '<action_request_id>');
--   -- expect: run status='done', artifact 'sealed'/'final'.
--   -- With a wrong action_request_id, an unapproved item, another run's
--   -- approval, or a tampered artifact_hash: MUST raise
--   -- 'production_lock_violation'.
--
-- (H) CROSS-TENANT — as User B (tenant B, active member, NOT in tenant A):
--   select * from yzi_runs where tenant_id = '<tenant_A_id>';  -- 0 rows (RLS)
--   select * from public.yzi_decide_action_request('<tenant_A_action_request_id>', 'approved');
--   -- MUST raise 'approver_not_authorized' (and even reaching the UPDATE
--   -- would find 0 updatable rows: membership fails in the policy).
--
-- (I) REJECTION + ADJUSTMENT — as User A (new run):
--   select * from public.yzi_decide_action_request('<ar_id>', 'rejected', 'adjust', 'nota');
--   select * from public.yzi_record_run_adjustment('<run_id>', '<ar_id>', 'adjust',
--     '{"message_draft":"v2"}'::jsonb, 'cafebabe');
--   -- expect: new pending action request, artifact v2, previous artifact
--   -- 'superseded'.
--
-- (J) FK BEHAVIOR — as the operator (psql, superuser session, NO commit):
--   begin;
--     delete from public.yzi_runs where id = '<run_id_with_steps>';
--     -- MUST FAIL: update or delete on table "yzi_runs" violates foreign key
--     -- constraint (RESTRICT) — evidence cannot silently disappear.
--   rollback;
--
-- (K) AUDIT ROLLBACK PROOF — the audit INSERT policy requires active
--   membership; if it ever fails (e.g., membership revoked mid-transaction),
--   the raise aborts the WHOLE RPC transaction — no run/decision is
--   persisted without its audit trail (no exception handler exists to
--   swallow it).

-- ============================================================================
-- PART 7 — ROLLBACK (safe, dependency-ordered; run only if reverting)
-- ============================================================================
-- Reverts everything this pack created. Does NOT drop any pre-existing column
-- of yzi_action_requests, does NOT touch yzi_audit_events' table definition
-- (only removes the policy this pack added), and does NOT delete audit rows
-- (auditoria é evidência; remoção de eventos é decisão humana separada).

-- drop function if exists public.yzi_record_run_adjustment(uuid, uuid, text, jsonb, text);
-- drop function if exists public.yzi_advance_after_approval(uuid, uuid);
-- drop function if exists public.yzi_decide_action_request(uuid, text, text, text);
-- drop function if exists public.yzi_start_prepare_contact_run(uuid, text, text, jsonb, text);
-- drop function if exists public.yzi_internal_record_audit_event(uuid, uuid, uuid, text, text, jsonb);
--
-- drop trigger if exists yzi_action_requests_decision_immutability on public.yzi_action_requests;
-- drop function if exists public.yzi_guard_action_request_decision();
--
-- drop policy if exists yzi_action_requests_update_decision_gate on public.yzi_action_requests;
-- drop policy if exists yzi_audit_events_insert_audit_gate on public.yzi_audit_events;
--
-- alter table public.yzi_action_requests
--   drop constraint if exists yzi_action_requests_run_tenant_fkey,
--   drop constraint if exists yzi_action_requests_step_tenant_fkey,
--   drop constraint if exists yzi_action_requests_artifact_tenant_fkey,
--   drop constraint if exists yzi_action_requests_decision_reason_check;
-- alter table public.yzi_action_requests
--   drop column if exists run_id,
--   drop column if exists run_step_id,
--   drop column if exists artifact_id,
--   drop column if exists artifact_hash,
--   drop column if exists decision_reason,
--   drop column if exists decision_note;
--
-- drop table if exists public.yzi_artifacts;
-- drop table if exists public.yzi_run_steps;
-- drop table if exists public.yzi_runs;

-- ============================================================================
-- PART 8 — AMENDMENT v2 (2026-07-12): real entity contract for
-- PREPARE_PROPERTY_CONTACT
-- ============================================================================
-- Applied to the live project (thwsltjcjrvtidhnfukc) via mcp__supabase
-- (apply_migration), under this unit's explicit human authorization
-- ("aplicar a alteração no banco vivo via mcp__supabase" — unit brief).
--
-- Reconciled against the LIVE `yzi_imob_run_contexts` table, which already
-- existed (created by a prior unit) with exactly:
--   run_id uuid pk, tenant_id uuid, property_id uuid, lead_id uuid,
--   conversation_id uuid nullable, created_at timestamptz,
--   FK (property_id, tenant_id) -> yzi_imob_properties, FK (lead_id,
--   tenant_id) -> yzi_imob_leads, FK (conversation_id, lead_id, tenant_id)
--   -> yzi_imob_conversations (composite — enforces conversation belongs to
--   the SAME lead), FK (run_id, tenant_id) -> yzi_runs. RLS enabled, INSERT
--   policy requires active tenant membership (not gated by
--   yzi.run_write_gate — this table is descriptive linkage, not part of the
--   governed decision/audit chain, so no new gate is introduced for it).
-- No new table, no new column beyond what already existed. Only
-- `yzi_start_prepare_contact_run` changes signature (old signature is
-- DROPped first — the client contract changes; no dual-signature ambiguity
-- is left live). `yzi_advance_after_approval` and `yzi_record_run_adjustment`
-- are unchanged (they operate on run_id/action_request_id, which already
-- carry the tenant/property/lead binding transitively via yzi_runs +
-- yzi_imob_run_contexts).

drop function if exists public.yzi_start_prepare_contact_run(uuid, text, text, jsonb, text);

create or replace function public.yzi_start_prepare_contact_run(
  p_tenant_id uuid,
  p_property_id uuid,
  p_lead_id uuid,
  p_context_fingerprint text,
  p_content jsonb,
  p_content_hash text,
  p_conversation_id uuid default null
)
returns table (
  run_id uuid,
  run_step_id uuid,
  artifact_id uuid,
  action_request_id uuid,
  status text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_run_id uuid;
  v_step1_id uuid;
  v_artifact_id uuid;
  v_action_request_id uuid;
  v_active_asset_id text;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if not public.yzi_is_active_tenant_member(p_tenant_id) then
    raise exception 'TENANT_ACCESS_DENIED';
  end if;

  -- Real entity contract (Fase 2/4 of the unit brief): the run may only
  -- start when the property and lead exist in THIS tenant and a
  -- yzi_imob_property_interests row links them; an optional conversation
  -- must belong to the same lead and tenant. Honest, named errors — never a
  -- generic failure.
  if not exists (
    select 1 from public.yzi_imob_properties p
    where p.id = p_property_id and p.tenant_id = p_tenant_id
  ) then
    raise exception 'property_not_found';
  end if;

  if not exists (
    select 1 from public.yzi_imob_leads l
    where l.id = p_lead_id and l.tenant_id = p_tenant_id
  ) then
    raise exception 'lead_not_found';
  end if;

  if not exists (
    select 1 from public.yzi_imob_property_interests pi
    where pi.property_id = p_property_id
      and pi.lead_id = p_lead_id
      and pi.tenant_id = p_tenant_id
  ) then
    raise exception 'property_interest_not_found';
  end if;

  if p_conversation_id is not null then
    if not exists (
      select 1 from public.yzi_imob_conversations c
      where c.id = p_conversation_id and c.tenant_id = p_tenant_id
    ) then
      raise exception 'conversation_not_found';
    end if;
    if not exists (
      select 1 from public.yzi_imob_conversations c
      where c.id = p_conversation_id
        and c.tenant_id = p_tenant_id
        and c.lead_id = p_lead_id
    ) then
      raise exception 'conversation_lead_mismatch';
    end if;
  end if;

  if p_content is null or not (p_content ? 'message_draft')
     or length(btrim(p_content->>'message_draft')) = 0 then
    raise exception 'artifact_gate_failed: message_draft missing or empty';
  end if;
  if p_content_hash is null or length(btrim(p_content_hash)) = 0 then
    raise exception 'artifact_gate_failed: content_hash missing';
  end if;

  v_active_asset_id := p_property_id::text;

  -- Open the governed gates for this transaction only (RLS/audit require them).
  perform set_config('yzi.run_write_gate', 'rpc', true);
  perform set_config('yzi.audit_caller_gate', 'rpc', true);

  insert into public.yzi_runs (
    tenant_id, initiated_by, workflow_id, intent_type,
    active_asset_type, active_asset_id, context_fingerprint,
    status, cursor_step
  ) values (
    p_tenant_id, auth.uid(), 'PREPARE_PROPERTY_CONTACT', 'property_contact_prepare',
    'property', v_active_asset_id, p_context_fingerprint,
    'awaiting_approval', 'prepare_contact_followup'
  )
  returning id into v_run_id;

  insert into public.yzi_run_steps (
    tenant_id, run_id, step_key, attempt, status, started_at, completed_at
  ) values (
    p_tenant_id, v_run_id, 'prepare_contact_followup', 1, 'completed', now(), now()
  )
  returning id into v_step1_id;

  -- Step 2 pre-created as pending so the timeline is visible before any
  -- decision exists; it stays 'pending' until yzi_advance_after_approval.
  insert into public.yzi_run_steps (
    tenant_id, run_id, step_key, attempt, status
  ) values (
    p_tenant_id, v_run_id, 'release_contact_draft', 1, 'pending'
  );

  insert into public.yzi_artifacts (
    tenant_id, run_id, run_step_id, contract_key, version,
    visibility, status, content, content_hash
  ) values (
    p_tenant_id, v_run_id, v_step1_id, 'contact_draft', 1,
    'approval', 'written', p_content, p_content_hash
  )
  returning id into v_artifact_id;

  -- Live-schema insert: requested_by NOT NULL; status must be 'pending' to
  -- satisfy the live INSERT policy; side_effects 'internal_only' (live enum
  -- has no 'draft_only' — the draft never leaves the platform at this stage).
  insert into public.yzi_action_requests (
    tenant_id, requested_by, action_type, status, risk_level, side_effects,
    payload, evidence_snapshot, metadata,
    run_id, run_step_id, artifact_id, artifact_hash
  ) values (
    p_tenant_id, auth.uid(), 'contact_draft_release', 'pending', 'medium', 'internal_only',
    p_content,
    jsonb_build_object('context_fingerprint', p_context_fingerprint),
    jsonb_build_object(
      'created_by_rpc', 'yzi_start_prepare_contact_run',
      'rpc_version', 'v2',
      'execution_status', 'not_executed'
    ),
    v_run_id, v_step1_id, v_artifact_id, p_content_hash
  )
  returning id into v_action_request_id;

  -- Vertical association lives in yzi_imob_run_contexts (never on yzi_runs
  -- directly — unit brief, decisão fechada). Composite FKs on this table
  -- (already live) re-enforce property/lead/conversation tenant-scoping as
  -- defense in depth even though the checks above already validated it.
  insert into public.yzi_imob_run_contexts (
    run_id, tenant_id, property_id, lead_id, conversation_id
  ) values (
    v_run_id, p_tenant_id, p_property_id, p_lead_id, p_conversation_id
  );

  perform set_config('yzi.run_write_gate', '', true);

  perform public.yzi_internal_record_audit_event(
    p_tenant_id, v_run_id, v_action_request_id,
    'run.started', 'Run PREPARE_PROPERTY_CONTACT iniciada',
    jsonb_build_object('workflow_id', 'PREPARE_PROPERTY_CONTACT',
                       'property_id', p_property_id, 'lead_id', p_lead_id));
  perform public.yzi_internal_record_audit_event(
    p_tenant_id, v_run_id, v_action_request_id,
    'step.started', 'Step prepare_contact_followup iniciado (attempt 1)',
    jsonb_build_object('step_key', 'prepare_contact_followup', 'attempt', 1));
  perform public.yzi_internal_record_audit_event(
    p_tenant_id, v_run_id, v_action_request_id,
    'step.output_gate_passed', 'Gate de conteúdo do rascunho aprovado no servidor',
    jsonb_build_object('step_key', 'prepare_contact_followup'));
  perform public.yzi_internal_record_audit_event(
    p_tenant_id, v_run_id, v_action_request_id,
    'artifact.created', 'Artefato contact_draft v1 criado',
    jsonb_build_object('artifact_id', v_artifact_id, 'version', 1,
                       'content_hash', p_content_hash));
  perform public.yzi_internal_record_audit_event(
    p_tenant_id, v_run_id, v_action_request_id,
    'approval.requested', 'Checkpoint humano criado para contact_draft',
    jsonb_build_object('gate', 'contact_draft'));

  perform set_config('yzi.audit_caller_gate', '', true);

  return query select v_run_id, v_step1_id, v_artifact_id, v_action_request_id,
                      'awaiting_approval'::text;
end;
$$;

-- PART 8 — VERIFICATION (read-only)
-- Expect 1 row, args starting with p_tenant_id uuid, p_property_id uuid,
-- p_lead_id uuid, ... (new signature live; old 5-arg signature gone).
select p.proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'yzi_start_prepare_contact_run';
