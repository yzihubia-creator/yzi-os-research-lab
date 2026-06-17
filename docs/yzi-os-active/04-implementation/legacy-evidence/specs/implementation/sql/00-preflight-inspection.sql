-- Lane 3 Auth and Tenant Boundary -- Preflight Inspection
-- Projeto: thwsltjcjrvtidhnfukc
-- Execucao: manual, humano, Supabase SQL Editor
-- Proposito: confirmar estado herdado antes de qualquer escrita
-- Idempotente: sim (somente leitura)
-- Nao executar via agente, MCP ou migration

-- 1. Verificar existencia e RLS das tabelas de fundacao
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'tenant_memberships')
ORDER BY tablename;

-- 2. Verificar policies existentes (deve retornar zero linhas)
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'tenant_memberships')
ORDER BY tablename, policyname;

-- 3. Contar linhas nas tabelas (deve ser zero em ambas)
SELECT 'tenants' AS tabela, COUNT(*) AS total_linhas FROM public.tenants
UNION ALL
SELECT 'tenant_memberships', COUNT(*) FROM public.tenant_memberships;

-- 4. Verificar foreign keys esperadas
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_schema,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'tenant_memberships'
ORDER BY kcu.column_name;

-- 5. Verificar indexes em tenant_memberships
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'tenant_memberships'
ORDER BY indexname;

-- Resultado esperado:
-- Query 1: 2 linhas, rls_enabled = true em ambas
-- Query 2: 0 linhas (nenhuma policy existente)
-- Query 3: tenants=0, tenant_memberships=0
-- Query 4: 2 FKs (tenant_id -> tenants.id, user_id -> auth.users.id), ambas ON DELETE CASCADE
-- Query 5: indexes em tenant_id, user_id, role, status
