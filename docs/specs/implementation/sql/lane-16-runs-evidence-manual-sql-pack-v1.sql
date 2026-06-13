-- Lane 16 - Runs Evidence Manual SQL Pack v1
-- Project context: YZI OS Research Lab / Bloco 15-17
-- Status: NOT_EXECUTED
--
-- IMPORTANT:
-- This SQL pack is a manual proposal only. It was saved as a file and MUST NOT be treated as
-- executed by the agent. No table, policy, schema change, persistence, trigger, function, scheduler,
-- runner, tool, seed, or database write is created by saving this file.
--
-- Intended future execution path:
-- Human operator only, after the Lane 17 human SQL application gate, using a controlled manual
-- database session. Do not execute through MCP, automation, agent tooling, or service role.

-- ============================================================================
-- 1. Header / finalidade / nao execucao
-- ============================================================================
--
-- Purpose:
-- Propose a conservative, multi-tenant, fail-closed persistence surface for controlled run records.
--
-- Non-execution statement:
-- This file has NOT been executed. It is documentation and a future manual execution candidate only.
--
-- Safety posture:
-- - Tenant-scoped access through public.tenant_memberships.
-- - RLS enabled before policies are relied on.
-- - Insert constrained to the authenticated operator and side_effects = 'none'.
-- - No update/delete policy initially.
-- - No service role.
-- - No trigger.
-- - No function.
-- - No scheduler.

-- ============================================================================
-- 2. DDL proposta para tabela de controlled runs/evidence
-- ============================================================================

create table if not exists public.controlled_run_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  operator_user_id uuid not null references auth.users(id) on delete restrict,
  operator_role text not null,
  capability_key text not null,
  run_mode text not null,
  run_status text not null,
  side_effects text not null default 'none',
  persistence_status text not null default 'persisted',
  input_context_snapshot jsonb not null default '{}'::jsonb,
  boundary_snapshot jsonb not null default '{}'::jsonb,
  result_summary text not null,
  created_at timestamptz not null default now(),

  constraint controlled_run_records_run_mode_check
    check (run_mode in ('dry_run', 'preview', 'read_only')),

  constraint controlled_run_records_run_status_check
    check (run_status in ('simulated', 'blocked_for_real_execution', 'not_persisted', 'persisted')),

  constraint controlled_run_records_side_effects_none_check
    check (side_effects = 'none'),

  constraint controlled_run_records_persistence_status_check
    check (persistence_status in ('persisted', 'not_persisted')),

  constraint controlled_run_records_capability_key_not_empty_check
    check (length(btrim(capability_key)) > 0),

  constraint controlled_run_records_operator_role_not_empty_check
    check (length(btrim(operator_role)) > 0),

  constraint controlled_run_records_result_summary_not_empty_check
    check (length(btrim(result_summary)) > 0)
);

-- ============================================================================
-- 3. RLS enable
-- ============================================================================

alter table public.controlled_run_records enable row level security;

-- Optional hardening for a future manual application review:
-- alter table public.controlled_run_records force row level security;

-- ============================================================================
-- 4. Policies propostas tenant-scoped
-- ============================================================================

create policy controlled_run_records_select_tenant_member
on public.controlled_run_records
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = controlled_run_records.tenant_id
      and tm.user_id = auth.uid()
  )
);

create policy controlled_run_records_insert_tenant_member_self_no_side_effects
on public.controlled_run_records
for insert
to authenticated
with check (
  operator_user_id = auth.uid()
  and side_effects = 'none'
  and run_mode in ('dry_run', 'preview', 'read_only')
  and run_status in ('simulated', 'blocked_for_real_execution', 'not_persisted', 'persisted')
  and exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = controlled_run_records.tenant_id
      and tm.user_id = auth.uid()
  )
);

-- No update policy is created initially. Updates remain blocked by absence of policy.
-- No delete policy is created initially. Deletes remain blocked by absence of policy.

-- ============================================================================
-- 5. Indices minimos
-- ============================================================================

create index if not exists controlled_run_records_tenant_created_at_idx
on public.controlled_run_records (tenant_id, created_at desc);

create index if not exists controlled_run_records_tenant_capability_created_at_idx
on public.controlled_run_records (tenant_id, capability_key, created_at desc);

create index if not exists controlled_run_records_operator_created_at_idx
on public.controlled_run_records (operator_user_id, created_at desc);

-- ============================================================================
-- 6. Comentarios de seguranca
-- ============================================================================

comment on table public.controlled_run_records is
  'Manual Lane 16 proposal for controlled run evidence records. Not executed by agent. Tenant-scoped RLS, no side effects.';

comment on column public.controlled_run_records.side_effects is
  'Must remain none. Controlled run evidence cannot represent real side effects in this pack.';

comment on column public.controlled_run_records.persistence_status is
  'Persistence status for the evidence row itself; allowed values are persisted or not_persisted.';

comment on column public.controlled_run_records.input_context_snapshot is
  'Bounded JSON snapshot for audit context. Do not store secrets, OAuth codes, tokens, cookies, or raw PII.';

comment on column public.controlled_run_records.boundary_snapshot is
  'Bounded JSON snapshot of safety boundaries. Do not store secrets, OAuth codes, tokens, cookies, or raw PII.';

-- ============================================================================
-- 7. Rollback manual
-- ============================================================================
--
-- Manual rollback candidate, to be reviewed by a human before use:
--
-- drop policy if exists controlled_run_records_insert_tenant_member_self_no_side_effects
--   on public.controlled_run_records;
--
-- drop policy if exists controlled_run_records_select_tenant_member
--   on public.controlled_run_records;
--
-- drop index if exists public.controlled_run_records_operator_created_at_idx;
-- drop index if exists public.controlled_run_records_tenant_capability_created_at_idx;
-- drop index if exists public.controlled_run_records_tenant_created_at_idx;
--
-- drop table if exists public.controlled_run_records;

-- ============================================================================
-- 8. Checklist de aplicacao humana
-- ============================================================================
--
-- [ ] Confirmar branch/processo autorizado e readiness da Lane 17.
-- [ ] Confirmar projeto Supabase correto.
-- [ ] Confirmar backup/rollback operacional antes de aplicar.
-- [ ] Ler este arquivo completo.
-- [ ] Confirmar que a execucao sera manual humana, nao MCP, nao agente, nao automacao.
-- [ ] Confirmar que public.tenants existe e esta correta.
-- [ ] Confirmar que public.tenant_memberships existe com colunas tenant_id e user_id.
-- [ ] Confirmar que auth.uid() e role authenticated sao adequados ao modelo de auth vigente.
-- [ ] Confirmar que nao ha secrets, OAuth codes, tokens, cookies ou PII nos snapshots.
-- [ ] Aplicar em janela controlada, se e somente se o gate humano autorizar.

-- ============================================================================
-- 9. Checklist de validacao pos-SQL
-- ============================================================================
--
-- [ ] Tabela public.controlled_run_records existe.
-- [ ] RLS esta habilitada na tabela.
-- [ ] SELECT retorna apenas records de tenants com membership do usuario autenticado.
-- [ ] INSERT falha quando operator_user_id <> auth.uid().
-- [ ] INSERT falha quando nao existe membership para tenant_id/auth.uid().
-- [ ] INSERT falha quando side_effects <> 'none'.
-- [ ] INSERT falha quando run_mode nao esta em dry_run/preview/read_only.
-- [ ] INSERT falha quando run_status esta fora do dominio permitido.
-- [ ] UPDATE permanece bloqueado por ausencia de policy.
-- [ ] DELETE permanece bloqueado por ausencia de policy.
-- [ ] Indices minimos existem.
-- [ ] Rollback manual foi revisado e permanece disponivel.
-- [ ] Nenhuma trigger, funcao, scheduler, service role ou seed foi introduzido por este pack.
