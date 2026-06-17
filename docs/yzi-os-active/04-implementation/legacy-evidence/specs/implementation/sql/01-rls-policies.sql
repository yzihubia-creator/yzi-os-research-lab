-- Lane 3 Auth and Tenant Boundary -- RLS Policies
-- Projeto: thwsltjcjrvtidhnfukc
-- Execucao: manual, humano, Supabase SQL Editor
-- Pre-requisito: preflight (00-preflight-inspection.sql) executado e aprovado
-- Gate humano L3-G2 exigido antes desta execucao
-- Nao executar via agente, MCP ou migration
-- Service role: proibida, nao aparece nesta lane

-- Policy 1: usuarios autenticados veem apenas tenants dos quais sao membros
-- Tabela: public.tenants
-- Operacao: SELECT
-- Role: authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tenants'
      AND policyname = 'tenants_select_member'
  ) THEN
    CREATE POLICY "tenants_select_member" ON public.tenants
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.tenant_memberships
          WHERE tenant_memberships.tenant_id = tenants.id
            AND tenant_memberships.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policy 2: usuarios autenticados veem apenas suas proprias memberships
-- Tabela: public.tenant_memberships
-- Operacao: SELECT
-- Role: authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tenant_memberships'
      AND policyname = 'memberships_select_own'
  ) THEN
    CREATE POLICY "memberships_select_own" ON public.tenant_memberships
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Verificacao imediata apos criacao
SELECT
  tablename,
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'tenant_memberships')
ORDER BY tablename, policyname;

-- Resultado esperado:
-- 2 linhas: tenants_select_member (SELECT, authenticated) e memberships_select_own (SELECT, authenticated)
-- Nenhuma policy de INSERT, UPDATE ou DELETE
-- Nenhuma referencia a service role
