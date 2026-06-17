-- Lane 3 Auth and Tenant Boundary -- Post-Policy Validation
-- Projeto: thwsltjcjrvtidhnfukc
-- Execucao: manual, humano, Supabase SQL Editor
-- Pre-requisito: 01-rls-policies.sql executado e output aprovado
-- Gate humano L3-G3 exigido antes desta execucao
-- Nao executar via agente, MCP ou migration
-- Proposito: confirmar que policies foram criadas corretamente

-- 1. Verificar policies por tabela com detalhes completos
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'tenant_memberships')
ORDER BY tablename, policyname;

-- 2. Verificar RLS ainda habilitado (deve permanecer ativo)
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled,
  forcerowsecurity AS rls_forced
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'tenant_memberships')
ORDER BY tablename;

-- 3. Contar policies por tabela (deve ser exatamente 1 por tabela)
SELECT
  tablename,
  COUNT(*) AS total_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'tenant_memberships')
GROUP BY tablename
ORDER BY tablename;

-- 4. Verificar que nenhuma policy de escrita foi criada
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'tenant_memberships')
  AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
ORDER BY tablename;

-- Resultado esperado:
-- Query 1: 2 linhas
--   tenants / tenants_select_member / SELECT / {authenticated} / PERMISSIVE
--     qual: EXISTS (SELECT 1 FROM tenant_memberships WHERE ... AND user_id = auth.uid())
--   tenant_memberships / memberships_select_own / SELECT / {authenticated} / PERMISSIVE
--     qual: (user_id = auth.uid())
-- Query 2: 2 linhas, rls_enabled = true em ambas
-- Query 3: 2 linhas, total_policies = 1 em cada tabela
-- Query 4: 0 linhas (nenhuma policy de escrita)
