-- =============================================================================
-- Lane 16 — Runs SQL Manual Pack v1  (controlled_runs)
-- Projeto Supabase: thwsltjcjrvtidhnfukc
-- Branch operacional: lane-1-6-foundation
-- =============================================================================
-- STATUS: NOT_EXECUTED — ARTEFATO DOCUMENTAL / APLICAÇÃO MANUAL HUMANA APENAS.
--
-- ESTE ARQUIVO NÃO FOI EXECUTADO. Ele NÃO deve ser aplicado por agente, por MCP
-- nem automaticamente. A aplicação futura é MANUAL, por um humano, no Supabase
-- SQL Editor, e SOMENTE após o gate humano da Lane 17
-- (LANE_17_HUMAN_SQL_APPLICATION_GATE) ser concluído e autorizado.
--
-- Implementa o contrato documental da Lane 15 (Persistent Run Evidence Contract):
-- tabela `public.controlled_runs` + RLS tenant-scoped (SELECT) + NEGAÇÃO PADRÃO de
-- escrita (sem policy de INSERT/UPDATE/DELETE nesta fase). Não cria seed, não
-- insere nenhum run, não ativa execução real, não cria runner/tool/memória.
--
-- INVARIANTES (Lane 15): nenhum run real; side_effects sempre 'none'; nenhuma tool
-- real; nenhuma memória operacional; nenhuma automação; 'persisted' é estado FUTURO
-- e NÃO é usado ainda; persistência futura exige RLS + write policy + auditabilidade
-- + rollback. Nenhum secret/token/cookie/OAuth code aqui.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Pré-condições (verificação humana, NÃO executar às cegas)
-- -----------------------------------------------------------------------------
-- Antes de aplicar (Lane 17): confirmar branch, projeto Supabase, backup/rollback,
-- leitura completa deste SQL, ausência de MCP, execução manual humana e que este
-- SQL NÃO ativa execução real. As tabelas `public.tenants` e
-- `public.tenant_memberships` (Lane 3) devem existir, com a policy de SELECT por
-- membership já validada.

-- -----------------------------------------------------------------------------
-- 1. Tabela controlled_runs  (campos mínimos do contrato da Lane 15)
-- -----------------------------------------------------------------------------
create table if not exists public.controlled_runs (
  run_id                 uuid primary key default gen_random_uuid(),
  tenant_id              uuid not null references public.tenants (id) on delete cascade,
  operator_user_id       uuid not null references auth.users (id),
  operator_role          text not null,
  capability_key         text not null,
  run_mode               text not null,
  run_status             text not null,
  side_effects           text not null default 'none',
  persistence_status     text not null default 'not_persisted',
  input_context_snapshot jsonb not null default '{}'::jsonb,
  boundary_snapshot      jsonb not null default '{}'::jsonb,
  result_summary         text,
  created_at             timestamptz not null default now(),

  -- Estados permitidos (Lane 15 §3.1). 'persisted' é reservado/futuro: aceito no
  -- domínio, mas NÃO usado nesta fase (nenhum INSERT ocorre — escrita é negada).
  constraint controlled_runs_run_mode_chk
    check (run_mode in ('dry_run', 'simulated')),
  constraint controlled_runs_run_status_chk
    check (run_status in ('blocked_for_real_execution', 'not_persisted', 'persisted')),
  constraint controlled_runs_persistence_status_chk
    check (persistence_status in ('not_persisted', 'persisted')),
  -- Invariante de fase: sem side effect externo.
  constraint controlled_runs_side_effects_chk
    check (side_effects = 'none')
);

comment on table public.controlled_runs is
  'Lane 16 (NOT_EXECUTED até Lane 17). Registro documental de controlled runs governados. Nenhum run real executado; side_effects sempre none; persisted reservado para o futuro.';

-- -----------------------------------------------------------------------------
-- 2. Índices auxiliares (leitura tenant-scoped)
-- -----------------------------------------------------------------------------
create index if not exists controlled_runs_tenant_id_idx
  on public.controlled_runs (tenant_id);
create index if not exists controlled_runs_created_at_idx
  on public.controlled_runs (created_at desc);

-- -----------------------------------------------------------------------------
-- 3. RLS — habilitar e FORÇAR (nega tudo por padrão até haver policy)
-- -----------------------------------------------------------------------------
alter table public.controlled_runs enable row level security;
alter table public.controlled_runs force row level security;

-- -----------------------------------------------------------------------------
-- 4. Policy de leitura tenant-scoped (somente membros do tenant)
-- -----------------------------------------------------------------------------
-- Espelha o padrão da Lane 3 (membership do próprio usuário). Um operador só lê
-- runs de tenants aos quais pertence. Sem isso, RLS nega a leitura.
drop policy if exists controlled_runs_select_tenant_member on public.controlled_runs;
create policy controlled_runs_select_tenant_member
  on public.controlled_runs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships m
      where m.tenant_id = public.controlled_runs.tenant_id
        and m.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 5. ESCRITA — NEGAÇÃO PADRÃO (intencional nesta fase)
-- -----------------------------------------------------------------------------
-- NÃO criamos policy de INSERT/UPDATE/DELETE nesta fase. Com RLS habilitada e
-- forçada, a ausência de policy de escrita faz o Postgres NEGAR toda escrita —
-- inclusive para o owner da tabela (force RLS). Resultado: nenhum run pode ser
-- gravado até uma futura write policy governada (com role model, auditabilidade e
-- rollback) ser criada sob seu próprio gate humano. Isto satisfaz a invariante
-- "persisted não é usado ainda" e o estado not_persisted permanece verdadeiro.
--
-- (Esboço FUTURO — comentado, NÃO criar agora; depende de role model + auditoria:)
-- create policy controlled_runs_insert_governed
--   on public.controlled_runs for insert to authenticated
--   with check ( /* operador é membro do tenant E papel autorizado a escrever */ false );

-- -----------------------------------------------------------------------------
-- 6. ROLLBACK (para uso humano, se necessário após aplicação manual)
-- -----------------------------------------------------------------------------
-- drop policy if exists controlled_runs_select_tenant_member on public.controlled_runs;
-- drop index if exists public.controlled_runs_created_at_idx;
-- drop index if exists public.controlled_runs_tenant_id_idx;
-- drop table if exists public.controlled_runs;

-- =============================================================================
-- FIM — NOT_EXECUTED. Aplicação manual humana apenas, após gate da Lane 17.
-- =============================================================================
