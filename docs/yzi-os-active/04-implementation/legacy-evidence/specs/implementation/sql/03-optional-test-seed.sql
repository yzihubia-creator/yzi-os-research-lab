-- Lane 3 Auth and Tenant Boundary -- Optional Test Seed
-- Projeto: thwsltjcjrvtidhnfukc
-- Execucao: manual, humano, Supabase SQL Editor
-- ESTE ARQUIVO E COMPLETAMENTE OPCIONAL
-- Gate humano L3-G4 exigido; so executar se humano decidir explicitamente
-- Pre-requisito: policies validadas (02-post-policy-validation.sql aprovado)
-- Nao executar via agente, MCP ou migration
--
-- AVISO: Este seed insere dados de TESTE apenas.
-- Nao representa tenant real, usuario real ou cliente real.
-- O tenant de teste criado aqui e facilmente identificavel e removivel.
-- Nao recriar se ja existir (verificacao de idempotencia incluida).

-- Verificacao inicial: confirmar que nao ha tenants existentes
SELECT COUNT(*) AS tenants_existentes FROM public.tenants;

-- INSTRUCOES PARA O HUMANO:
-- Antes de executar o bloco abaixo, confirmar que a query acima retornou 0.
-- Se retornar > 0, parar e reportar ao agente.

-- Bloco de seed (executar somente se tenants_existentes = 0 e gate L3-G4 ativo)
-- ===== INICIO DO BLOCO OPCIONAL =====

-- Inserir tenant de teste
INSERT INTO public.tenants (id, name, slug, status, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Tenant de Teste Lane 3',
  'test-lane-3',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- NOTA: A membership abaixo requer um user_id real de auth.users.
-- O humano deve substituir o UUID abaixo pelo user_id de um usuario de teste
-- criado previamente no Supabase Auth Dashboard do projeto thwsltjcjrvtidhnfukc.
-- Nao inventar UUIDs de usuario -- usar somente IDs reais de auth.users.
--
-- Para obter o user_id: Supabase Dashboard > Authentication > Users

-- Descomentar e substituir <USER_ID_REAL> pelo UUID real antes de executar:
-- INSERT INTO public.tenant_memberships (id, tenant_id, user_id, role, status, created_at, updated_at)
-- VALUES (
--   '00000000-0000-0000-0000-000000000002'::uuid,
--   '00000000-0000-0000-0000-000000000001'::uuid,
--   '<USER_ID_REAL>'::uuid,
--   'owner',
--   'active',
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (id) DO NOTHING;

-- ===== FIM DO BLOCO OPCIONAL =====

-- Verificacao apos seed (se executado)
SELECT 'tenants' AS tabela, COUNT(*) AS linhas FROM public.tenants
UNION ALL
SELECT 'tenant_memberships', COUNT(*) FROM public.tenant_memberships;

-- Resultado esperado (se seed executado):
-- tenants = 1, tenant_memberships = 1 (se membership tambem inserida)
--
-- Para remover o seed de teste apos uso:
-- DELETE FROM public.tenants WHERE id = '00000000-0000-0000-0000-000000000001';
-- (O CASCADE remove a membership automaticamente)
