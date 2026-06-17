# YZI OS Manual Supabase SQL Plan v1

## 1. Readiness Statement

`YZI_OS_MANUAL_SUPABASE_SQL_PLAN_V1_CREATED_SQL_PLAN_ONLY_NOT_EXECUTED`

Este documento é o **plano SQL manual completo** do MVP database foundation do YZI OS.
Segue Spec-Driven Development: **define e organiza** o SQL candidato para execução humana no
Supabase SQL Editor, mas **não executa nenhum SQL, não chama MCP, não altera Supabase, não cria
migration real e não altera `platform/`**. Todo o SQL aqui é revisável antes de qualquer execução.

---

## 2. Purpose

Prover um plano SQL completo, organizado em blocos executáveis sequencialmente, que permita ao
humano **reconciliar e completar** a database foundation mínima do YZI OS no projeto Supabase
remoto (`thwsltjcjrvtidhnfukc`), respeitando os invariantes de tenant isolation, auditabilidade
e idempotência.

Fontes normativas consumidas para produzir este plano:

| Fonte | Papel |
| --- | --- |
| [`yzi-os-tenant-model-spec-v1`](../yzi-os-tenant-model-spec-v1.md) | shape candidato de `tenants` e `tenant_memberships` |
| [`yzi-os-persistence-spec-v1`](../yzi-os-persistence-spec-v1.md) | disciplina de banco; gerar ≠ aplicar |
| [`yzi-os-execution-harness-map-v1`](../yzi-os-execution-harness-map-v1.md) | harness de execução; lanes; sequência |
| [`yzi-os-security-review-skill-adaptation-spec-v1`](../skills/yzi-os-security-review-skill-adaptation-spec-v1.md) | blocker classes; RLS safety; service role rules |
| [`yzi-os-verification-loop-skill-adaptation-spec-v1`](../skills/yzi-os-verification-loop-skill-adaptation-spec-v1.md) | verificar ≠ corrigir ≠ aplicar |
| [`yzi-os-backend-skills-adaptation-pack-v1`](../skills/yzi-os-backend-skills-adaptation-pack-v1.md) | tenant-aware access layer; contrato leitura/escrita/evidência |
| [`tenant-boundary.spec.md`](../../p0/tenant-boundary.spec.md) | fronteira de tenant como invariante de engenharia P0 |
| [`tenant-state-isolation.spec.md`](../../p1/tenant-state-isolation.spec.md) | todo estado tenant-scoped; formas de cruzamento proibidas |
| [`event-driven-state.spec.md`](../../p1/event-driven-state.spec.md) | nenhuma mutação silenciosa; toda mudança auditável |
| [`supabase-project-baseline-evidence-v1`](../evidence/supabase-project-baseline-evidence-v1.md) | estado remoto conhecido (baseline) |

---

## 3. Remote Baseline

Estado conhecido do projeto Supabase remoto conforme
[`supabase-project-baseline-evidence-v1`](../evidence/supabase-project-baseline-evidence-v1.md):

| Item | Estado observado |
| --- | --- |
| `project_ref` | `thwsltjcjrvtidhnfukc` |
| `public.tenants` | **existe** (criada manualmente antes do fluxo formal) |
| `public.tenants` RLS | habilitado |
| `public.tenants` policies | **nenhuma** |
| `public.tenants` row count | 0 |
| `public.tenants` migration registrada | **nenhuma** |
| `public.tenants` column structure | **não inspecionada via SQL** — Block 0 revela antes de qualquer DDL |
| `public.tenant_memberships` | **não existe** |
| migrations do projeto registradas | **nenhuma** |
| Advisor security | INFO `rls_enabled_no_policy` em `public.tenants` |
| Advisor performance | zero findings |
| Extensions instaladas | `plpgsql`, `pgcrypto`, `uuid-ossp`, `pg_stat_statements`, `supabase_vault` |

**Implicação para o plano:**
- `public.tenants` deve ser reconciliada (não recriada) de forma idempotente e não-destrutiva.
- `public.tenant_memberships` deve ser criada (`CREATE TABLE IF NOT EXISTS`).
- A estrutura exata de colunas de `public.tenants` é desconhecida — Block 0 deve ser executado
  e seu output revisado antes de qualquer DDL do Block 2.

---

## 4. Design Rules

As regras abaixo governam todos os SQL blocks deste plano:

1. **`tenant_id` obrigatório** em toda futura tabela de negócio — `uuid NOT NULL` com FK para
   `public.tenants(id)`. `public.tenants` em si é a raiz da partição (sem `tenant_id` próprio).
2. **Gerar SQL não é executar SQL** — este documento é um artefato revisável. O humano decide
   o que executar, quando e em que ordem. Claude não executa MCP nem SQL por nenhum meio.
3. **Humano executa manualmente** — cada bloco é copiado/colado individualmente no
   Supabase SQL Editor; nenhuma automação, script ou migration runner é usada neste plano.
4. **Nenhuma query deve retornar secrets** — nenhum block consulta ou exibe connection strings,
   anon keys, service role keys ou qualquer material criptográfico.
5. **Nenhum dado real será inserido** — zero `INSERT` statements em qualquer block.
   O plano define estrutura e constraints, nunca seed.
6. **Idempotência** — todos os DDL blocks usam `IF NOT EXISTS`, `DO $$ ... END $$` com guards
   ou `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, de modo que reexecutar um block não gera erro
   nem modifica o que já existe com a estrutura esperada.
7. **Não-destrutivo** — nenhum `DROP TABLE`, `DROP COLUMN`, `TRUNCATE` ou operação de remoção
   de dado ou estrutura existente.
8. **Sem função custom** neste plano — as únicas funções usadas são nativas do Postgres/Supabase
   (`gen_random_uuid()`, `now()`).

---

## 5. SQL Block 0 — Safety / Inspection

**Natureza:** somente leitura. Sem DDL. Sem DML.

**Propósito:** revelar o estado atual do projeto antes de qualquer DDL. Execute este block
**primeiro** e revise o output antes de prosseguir para Block 1.

```sql
-- ============================================================
-- BLOCK 0 — Safety / Inspection (somente leitura)
-- Execute PRIMEIRO. Revise o output antes de qualquer DDL.
-- ============================================================

-- 0a. Tabelas existentes no schema public
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 0b. Estrutura atual de public.tenants (colunas, tipos, nullable, default)
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tenants'
ORDER BY ordinal_position;

-- 0c. Estrutura atual de public.tenant_memberships (deve retornar 0 linhas = tabela não existe)
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tenant_memberships'
ORDER BY ordinal_position;

-- 0d. Constraints existentes nas tabelas public (PK, UNIQUE, CHECK, FK)
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name  AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
  AND tc.constraint_schema = ccu.constraint_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- 0e. Status de RLS por tabela no schema public
SELECT
  relname   AS table_name,
  relrowsecurity AS rls_enabled,
  relforcerowsecurity AS rls_forced
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
ORDER BY relname;

-- 0f. Policies existentes no schema public
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
ORDER BY tablename, policyname;

-- 0g. Indexes existentes no schema public
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 0h. Contagem de linhas (confirmar 0 antes do DDL)
SELECT 'tenants' AS table_name, count(*) AS row_count
FROM public.tenants;

-- 0i. Migrations registradas pelo projeto
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version;
```

**O que verificar no output antes de continuar:**

- `0a` — `public.tenants` aparece; `public.tenant_memberships` NÃO aparece (esperado).
- `0b` — revise as colunas existentes; compare com o shape esperado na §3.
  Se houver colunas com tipos incompatíveis, **não execute Block 2** sem análise prévia.
- `0h` — confirme `row_count = 0` em `tenants`; se houver linhas, avaliar impacto das
  constraints `NOT NULL` antes de executar Block 2.
- `0i` — confirme lista vazia de migrations do projeto.

---

## 6. SQL Block 1 — Extensions

**Natureza:** DDL de extensões. Idempotente com `CREATE EXTENSION IF NOT EXISTS`.

**Propósito:** confirmar que as extensões necessárias estão disponíveis. Conforme o baseline,
`pgcrypto` (provê `gen_random_uuid()`) e `uuid-ossp` já estão instaladas. Este block é
essencialmente no-op mas documenta as dependências explicitamente.

```sql
-- ============================================================
-- BLOCK 1 — Extensions (idempotente)
-- Todas as extensões abaixo já estão instaladas (confirmado pelo baseline).
-- Este block é no-op e confirma a disponibilidade.
-- ============================================================

-- pgcrypto: provê gen_random_uuid() — necessária para PKs uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

-- uuid-ossp: provê uuid_generate_v4() (alternativa; não usada diretamente neste plano)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
```

**Nota:** `gen_random_uuid()` também está disponível nativamente no PostgreSQL 13+
(built-in, sem extensão). O Supabase usa PostgreSQL 15+, então qualquer das duas fontes
funciona. Este plano usa `gen_random_uuid()` em todos os `DEFAULT`.

---

## 7. SQL Block 2 — Reconcile tenants table

**Natureza:** DDL. Idempotente. Não-destrutivo.

**Pré-condição obrigatória:** executar Block 0 e confirmar:
- `public.tenants` existe
- `row_count = 0` em `0h` (ou avaliar impacto das constraints `NOT NULL` se houver linhas)
- Colunas existentes em `0b` são compatíveis com o shape abaixo

**Shape esperado de `public.tenants` após este block:**

| Coluna | Tipo | Restrições |
| --- | --- | --- |
| `id` | `uuid` | PRIMARY KEY (assume existente; não modificado) |
| `slug` | `text` | NOT NULL, UNIQUE |
| `name` | `text` | NOT NULL |
| `status` | `text` | NOT NULL, DEFAULT `'active'`, CHECK `IN ('active','suspended')` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` |

```sql
-- ============================================================
-- BLOCK 2 — Reconciliar public.tenants (idempotente, não-destrutivo)
-- NÃO dropa, NÃO recria, NÃO trunca, NÃO insere.
-- Assume: id uuid PRIMARY KEY já existe (criado manualmente).
-- Assume: 0 linhas em public.tenants (confirmado via Block 0).
-- ============================================================

-- 2a. Adicionar colunas ausentes (nullable inicialmente; constraints abaixo)
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS slug       text,
  ADD COLUMN IF NOT EXISTS name       text,
  ADD COLUMN IF NOT EXISTS status     text        DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2b. NOT NULL em slug
--     Só aplica se: coluna existe como nullable E não há linhas com slug IS NULL.
--     Com 0 linhas: seguro. Com linhas: verificar antes.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'tenants'
      AND column_name  = 'slug'
      AND is_nullable  = 'YES'
  ) AND (SELECT count(*) FROM public.tenants WHERE slug IS NULL) = 0 THEN
    ALTER TABLE public.tenants ALTER COLUMN slug SET NOT NULL;
  END IF;
END $$;

-- 2c. NOT NULL em name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'tenants'
      AND column_name  = 'name'
      AND is_nullable  = 'YES'
  ) AND (SELECT count(*) FROM public.tenants WHERE name IS NULL) = 0 THEN
    ALTER TABLE public.tenants ALTER COLUMN name SET NOT NULL;
  END IF;
END $$;

-- 2d. NOT NULL em status
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'tenants'
      AND column_name  = 'status'
      AND is_nullable  = 'YES'
  ) AND (SELECT count(*) FROM public.tenants WHERE status IS NULL) = 0 THEN
    ALTER TABLE public.tenants ALTER COLUMN status SET NOT NULL;
  END IF;
END $$;

-- 2e. NOT NULL em created_at
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'tenants'
      AND column_name  = 'created_at'
      AND is_nullable  = 'YES'
  ) AND (SELECT count(*) FROM public.tenants WHERE created_at IS NULL) = 0 THEN
    ALTER TABLE public.tenants ALTER COLUMN created_at SET NOT NULL;
  END IF;
END $$;

-- 2f. NOT NULL em updated_at
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'tenants'
      AND column_name  = 'updated_at'
      AND is_nullable  = 'YES'
  ) AND (SELECT count(*) FROM public.tenants WHERE updated_at IS NULL) = 0 THEN
    ALTER TABLE public.tenants ALTER COLUMN updated_at SET NOT NULL;
  END IF;
END $$;

-- 2g. UNIQUE constraint em slug (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname    = 'tenants_slug_key'
      AND conrelid   = 'public.tenants'::regclass
  ) THEN
    ALTER TABLE public.tenants ADD CONSTRAINT tenants_slug_key UNIQUE (slug);
  END IF;
END $$;

-- 2h. CHECK constraint em status (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname    = 'tenants_status_check'
      AND conrelid   = 'public.tenants'::regclass
  ) THEN
    ALTER TABLE public.tenants
      ADD CONSTRAINT tenants_status_check
      CHECK (status IN ('active', 'suspended'));
  END IF;
END $$;
```

---

## 8. SQL Block 3 — Create tenant_memberships

**Natureza:** DDL. Idempotente com `CREATE TABLE IF NOT EXISTS`.

**Propósito:** criar a tabela `public.tenant_memberships` com todos os constraints e FKs
necessários para enforçar tenant isolation e a relação user↔tenant.

**Shape de `public.tenant_memberships`:**

| Coluna | Tipo | Restrições |
| --- | --- | --- |
| `id` | `uuid` | PRIMARY KEY DEFAULT `gen_random_uuid()` |
| `tenant_id` | `uuid` | NOT NULL, FK → `public.tenants(id)` ON DELETE CASCADE |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `role` | `text` | NOT NULL, CHECK `IN ('owner','admin','operator','viewer')` |
| `status` | `text` | NOT NULL DEFAULT `'active'`, CHECK `IN ('active','suspended')` |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| — | — | UNIQUE `(tenant_id, user_id)` |

```sql
-- ============================================================
-- BLOCK 3 — Criar public.tenant_memberships (idempotente)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid        NOT NULL
                         REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL
                         REFERENCES auth.users(id)    ON DELETE CASCADE,
  role       text        NOT NULL
                         CHECK (role IN ('owner', 'admin', 'operator', 'viewer')),
  status     text        NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);
```

**Nota sobre `role`:** o tenant-model spec v1 lista `owner/operator/viewer`; este plano
acrescenta `admin` por adequação ao gradiente de privilégio necessário para gestão multi-tenant.
Qualquer alteração de enum futura exigirá uma migration formal via Drizzle.

---

## 9. SQL Block 4 — Indexes

**Natureza:** DDL. Idempotente com `CREATE INDEX IF NOT EXISTS`.

**Propósito:** garantir performance em queries tenant-scoped e de membership lookup.

```sql
-- ============================================================
-- BLOCK 4 — Indexes (idempotente com IF NOT EXISTS)
-- ============================================================

-- 4a. tenants: index em slug (para lookup por identificador legível)
--     A constraint UNIQUE de Block 2 já cria um index; este é explícito para documentação.
--     IF NOT EXISTS garante no-op se o index já existe.
CREATE INDEX IF NOT EXISTS idx_tenants_slug
  ON public.tenants (slug);

-- 4b. tenants: index em status (para filtrar tenants ativos)
CREATE INDEX IF NOT EXISTS idx_tenants_status
  ON public.tenants (status);

-- 4c. tenant_memberships: index em tenant_id (lookup de todos os membros de um tenant)
--     FK já cria index em alguns DBs, mas Postgres não cria automaticamente — index explícito.
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant_id
  ON public.tenant_memberships (tenant_id);

-- 4d. tenant_memberships: index em user_id (lookup de todos os tenants de um usuário)
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user_id
  ON public.tenant_memberships (user_id);

-- 4e. tenant_memberships: index em status (para filtrar memberships ativas)
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_status
  ON public.tenant_memberships (status);

-- 4f. tenant_memberships: index composto (tenant_id, user_id) — coberto pela UNIQUE constraint,
--     mas registrado aqui para clareza. O index da constraint já serve a este propósito.
--     (Comentado por ser redundante com a UNIQUE constraint de Block 3.)
-- CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant_user
--   ON public.tenant_memberships (tenant_id, user_id);
```

---

## 10. SQL Block 5 — RLS

**Natureza:** DDL. Idempotente (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY` é no-op se já ativo).

**Propósito:** habilitar RLS em ambas as tabelas. **Nenhuma policy é criada neste plano.**

### Decisão sobre policies

**Policies NÃO foram incluídas neste plano.** Razão:

1. **Sem auth spec:** nenhuma spec de auth/sessão foi criada ou aprovada. `auth.uid()` não tem
   contexto definido na plataforma atual — criar policies que o referenciam seria prematura.
2. **Risco de policy incorreta > risco de ausência de policy:** uma policy mal construída pode
   abrir acesso cross-tenant (blocker `RLS_POLICY_UNAUTHORIZED` da security-review spec). Sem
   auth, não há como verificar o comportamento real da policy antes de aplicá-la.
3. **RLS é segunda linha de defesa, não única** — per [`yzi-os-persistence-spec-v1`](../yzi-os-persistence-spec-v1.md):
   o isolamento primário é a camada de acesso a dados (código). RLS é redundância futura.
4. **Tabelas com RLS habilitado e sem policy ficam inacessíveis via API** (anon/authenticated) —
   isso é **seguro**: apenas `service_role` acessa. É o estado correto até as policies serem
   definidas com auth.
5. **Future spec:** quando a auth spec + RLS policy spec existirem, as policies serão criadas
   em pack dedicado com gate humano próprio.

```sql
-- ============================================================
-- BLOCK 5 — RLS (idempotente)
-- Habilita RLS em ambas as tabelas. SEM POLICIES.
-- Tabelas com RLS habilitado e sem policy ficam inacessíveis via API (anon/authed).
-- Isso é seguro: somente service_role tem acesso até policies existirem.
-- ============================================================

-- 5a. RLS em tenants (já habilitado conforme baseline — este statement é no-op)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 5b. RLS em tenant_memberships (nova tabela — habilitando agora)
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

-- Confirmação: NENHUMA policy é criada aqui.
-- Policies exigem spec de auth + spec de RLS dedicada + gate humano próprio.
-- Decisão pendente registrada na §15.
```

---

## 11. SQL Block 6 — Comments

**Natureza:** DDL metadata. Idempotente (COMMENT ON substitui o anterior).

**Propósito:** documentar tabelas e colunas com comentários institucionais legíveis para
ferramentas de inspeção de schema.

```sql
-- ============================================================
-- BLOCK 6 — Comments (idempotente)
-- ============================================================

-- 6a. Tabela tenants
COMMENT ON TABLE public.tenants IS
  'YZI OS: raiz da partição multi-tenant. Cada linha é um tenant institucional isolado. '
  'Criada manualmente; reconciliada por yzi-os-manual-supabase-sql-plan-v1. '
  'Fronteira de tenant é invariante de engenharia (P10, DO2).';

COMMENT ON COLUMN public.tenants.id IS
  'Identidade canônica do tenant. UUID gerado pelo sistema. Nunca definido por LLM.';
COMMENT ON COLUMN public.tenants.slug IS
  'Identificador legível e imutável após criação. Único por plataforma.';
COMMENT ON COLUMN public.tenants.name IS
  'Nome institucional de exibição do tenant.';
COMMENT ON COLUMN public.tenants.status IS
  'Estado operacional do tenant: active | suspended. '
  'Mudança de status gera evidência — sem soft-delete silencioso.';
COMMENT ON COLUMN public.tenants.created_at IS
  'Timestamp de criação do tenant. Trilha de auditoria mínima.';
COMMENT ON COLUMN public.tenants.updated_at IS
  'Timestamp da última atualização. Nunca silencioso.';

-- 6b. Tabela tenant_memberships
COMMENT ON TABLE public.tenant_memberships IS
  'YZI OS: associação entre usuário e tenant com papel institucional. '
  'Todo acesso à plataforma ocorre através de uma membership. '
  'tenant_id é obrigatório e não-nullable — isolamento desde o dia 1.';

COMMENT ON COLUMN public.tenant_memberships.id IS
  'Identidade canônica da membership. UUID gerado pelo sistema.';
COMMENT ON COLUMN public.tenant_memberships.tenant_id IS
  'FK para o tenant raiz. Obrigatório. Raiz da partição multi-tenant.';
COMMENT ON COLUMN public.tenant_memberships.user_id IS
  'FK para auth.users. Usuário que pertence ao tenant.';
COMMENT ON COLUMN public.tenant_memberships.role IS
  'Papel institucional do usuário no tenant: owner | admin | operator | viewer. '
  'Atenuação de privilégio: delegação não transfere acesso cross-tenant.';
COMMENT ON COLUMN public.tenant_memberships.status IS
  'Estado da membership: active | suspended.';
COMMENT ON COLUMN public.tenant_memberships.created_at IS
  'Timestamp de criação da membership. Auditável.';
COMMENT ON COLUMN public.tenant_memberships.updated_at IS
  'Timestamp da última atualização da membership.';
```

---

## 12. SQL Block 7 — Validation Queries

**Natureza:** somente leitura. Nenhum DDL. Nenhum DML.

**Propósito:** verificar o estado final após a execução dos blocks 1–6. Execute após todos os
blocks e cole o output no chat.

```sql
-- ============================================================
-- BLOCK 7 — Validation Queries (somente leitura)
-- Execute após blocks 1–6. Cole o output completo no chat.
-- ============================================================

-- 7a. Tabelas no schema public (esperado: tenants, tenant_memberships)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 7b. Colunas de public.tenants
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tenants'
ORDER BY ordinal_position;

-- 7c. Colunas de public.tenant_memberships
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tenant_memberships'
ORDER BY ordinal_position;

-- 7d. Constraints em public.tenants e public.tenant_memberships
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema   = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('tenants', 'tenant_memberships')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- 7e. Indexes nas tabelas public
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'tenant_memberships')
ORDER BY tablename, indexname;

-- 7f. Status de RLS (ambas as tabelas devem ter rls_enabled = true)
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind      = 'r'
  AND relname IN ('tenants', 'tenant_memberships');

-- 7g. Policies existentes (esperado: nenhuma — neste plano não foram criadas)
SELECT schemaname, tablename, policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'tenant_memberships')
ORDER BY tablename, policyname;

-- 7h. Contagem de linhas (confirmar zero seeds)
SELECT 'tenants'           AS table_name, count(*) AS row_count FROM public.tenants
UNION ALL
SELECT 'tenant_memberships' AS table_name, count(*) AS row_count FROM public.tenant_memberships;

-- 7i. Migrations registradas (confirmar ainda vazia — este plano não usa migration runner)
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;

-- 7j. Comments de tabela (confirmar que foram aplicados)
SELECT
  t.relname   AS table_name,
  d.description
FROM pg_class t
LEFT JOIN pg_description d ON d.objoid = t.oid AND d.objsubid = 0
WHERE t.relnamespace = 'public'::regnamespace
  AND t.relkind      = 'r'
  AND t.relname IN ('tenants', 'tenant_memberships');
```

---

## 13. Manual Execution Instructions

Execute os blocks na ordem abaixo no **Supabase SQL Editor**
(`https://supabase.com/dashboard/project/thwsltjcjrvtidhnfukc/sql/new`):

| Passo | Block | Ação antes de continuar |
| --- | --- | --- |
| 1 | Block 0 | Execute. Cole o output no chat. Revise estrutura de `tenants`. Confirme `row_count = 0`. **Só continue se o output for compatível.** |
| 2 | Block 1 | Execute. Confirme sucesso (sem erros). |
| 3 | Block 2 | Execute **somente após** revisar o output do Block 0 e confirmar compatibilidade de tipos. Confirme sucesso. |
| 4 | Block 3 | Execute. Confirme criação de `tenant_memberships`. |
| 5 | Block 4 | Execute. Confirme criação dos indexes. |
| 6 | Block 5 | Execute. Confirme RLS habilitado em ambas as tabelas. |
| 7 | Block 6 | Execute. Confirme aplicação dos comments. |
| 8 | Block 7 | Execute. Cole o **output completo** no chat. |

**Como copiar e colar:**

1. Abra o Supabase SQL Editor para o projeto `thwsltjcjrvtidhnfukc`.
2. Crie um novo editor ("New query") para cada block.
3. Copie o conteúdo do block (entre as linhas `-- ====...====`) e cole no editor.
4. Clique em **Run**.
5. Se houver erro: **pare**, não execute o próximo block, e cole o erro no chat.
6. Se sucesso: prossiga para o próximo block.

**Regra de parada:** qualquer erro inesperado interrompe a sequência. Não tente contornar o
erro executando o próximo block. Cole o erro no chat para análise.

---

## 14. Expected Output

Após executar todos os blocks, cole no chat o output completo do **Block 7**.

O output esperado é:

**7a — Tabelas:**
```
table_name
------------------
tenant_memberships
tenants
```

**7b — Colunas de tenants:**
```
column_name | data_type | is_nullable | column_default
------------|-----------|-------------|----------------
id          | uuid      | NO          | gen_random_uuid()  (ou outro UUID default)
slug        | text      | NO          | (null ou vazio)
name        | text      | NO          | (null ou vazio)
status      | text      | NO          | 'active'::text
created_at  | timestamp...| NO        | now()
updated_at  | timestamp...| NO        | now()
```

**7c — Colunas de tenant_memberships:**
```
column_name | data_type | is_nullable | column_default
------------|-----------|-------------|----------------
id          | uuid      | NO          | gen_random_uuid()
tenant_id   | uuid      | NO          | (null)
user_id     | uuid      | NO          | (null)
role        | text      | NO          | (null)
status      | text      | NO          | 'active'::text
created_at  | timestamp...| NO        | now()
updated_at  | timestamp...| NO        | now()
```

**7f — RLS:**
```
table_name         | rls_enabled
-------------------|-------------
tenants            | true
tenant_memberships | true
```

**7g — Policies:**
```
(0 rows) — nenhuma policy criada neste plano
```

**7h — Row counts:**
```
table_name         | row_count
-------------------|-----------
tenants            | 0
tenant_memberships | 0
```

Cole também qualquer **erro** que ocorrer em qualquer block — não apenas o Block 7.

---

## 15. Risks / Decisions

| Item | Registro |
| --- | --- |
| `public.tenants` criada manualmente | A tabela existe antes do fluxo formal de migrations. Block 2 reconcilia sem dropar. Decisão de reconciliação via migration formal (Opção 1 ou 2 do evidence record) permanece pendente e fora do escopo deste plano. |
| Plano não usa migration runner | Este plano é SQL manual direto no SQL Editor. A disciplina formal de migrations via Drizzle será adotada em packs futuros da Database Lane. Qualquer DDL aplicado aqui precisará de migration reconciliadora futura. |
| `role` tem 4 valores (`admin` acrescido) | O tenant-model spec lista `owner/operator/viewer`. Este plano acrescenta `admin` como papel intermediário de gestão. Se houver discordância, o humano deve ajustar o CHECK antes de executar Block 3. |
| Sem policies de RLS | RLS habilitado em ambas as tabelas; zero policies criadas. Tabelas inacessíveis via API (anon/authenticated) — somente `service_role`. **Isso é seguro.** Policies serão definidas em spec própria + pack dedicado quando a auth spec existir. Risco oposto: criar policies sem auth context pode abrir tenant isolation risk. |
| Futura reconciliação com Drizzle | Todo DDL aplicado manualmente aqui precisará ser refletido no schema Drizzle e em uma migration reconciliadora formal antes de usar o ORM em código. |
| Column structure de `tenants` desconhecida | Block 0 revela a estrutura. Block 2 deve ser revisado contra o output do Block 0 antes da execução. |
| DEFAULT temporário em colunas adicionadas | Colunas adicionadas via `ADD COLUMN IF NOT EXISTS` recebem `DEFAULT now()` ou `DEFAULT 'active'`. Estes defaults são permanentes e adequados; se a intenção era outro default, ajustar antes de executar. |

---

## 16. What This Does Not Authorize

`This SQL plan does NOT authorize:`

- Claude executar qualquer SQL por qualquer meio;
- Claude chamar MCP do Supabase ou qualquer outro;
- criar dados reais, seed ou tenant de teste;
- inserir linhas em nenhuma tabela;
- alterar `platform/`;
- instalar dependências;
- criar migration formal via Drizzle ou qualquer runner;
- aplicar ou registrar migration na tabela de migrations do Supabase;
- criar ou alterar RLS policies;
- criar auth custom ou configuração de auth;
- criar backend, API route ou server action;
- criar frontend, componente ou página;
- deploy ou alteração em qualquer ambiente de produção;
- criar subagents;
- criar ou alterar funções de banco além das nativas (`gen_random_uuid()`, `now()`);
- dropar, recriar ou popular `public.tenants` por qualquer meio;
- executar os SQL blocks de forma autônoma.

---

## 17. Final Status

`SQL_PLAN_CREATED_NOT_EXECUTED_AWAITING_HUMAN_REVIEW`

---

## Validação (desta task)

**Arquivo criado:** `docs/specs/implementation/sql/yzi-os-manual-supabase-sql-plan-v1.md` ✅

**Fontes lidas:**
1. `docs/specs/implementation/yzi-os-tenant-model-spec-v1.md` ✅
2. `docs/specs/implementation/yzi-os-persistence-spec-v1.md` ✅
3. `docs/specs/implementation/yzi-os-execution-harness-map-v1.md` ✅
4. `docs/specs/implementation/skills/yzi-os-security-review-skill-adaptation-spec-v1.md` ✅
5. `docs/specs/implementation/skills/yzi-os-verification-loop-skill-adaptation-spec-v1.md` ✅
6. `docs/specs/implementation/skills/yzi-os-backend-skills-adaptation-pack-v1.md` ✅
7. `docs/specs/p0/tenant-boundary.spec.md` ✅
8. `docs/specs/p1/tenant-state-isolation.spec.md` ✅
9. `docs/specs/p1/event-driven-state.spec.md` ✅
10. `docs/specs/implementation/evidence/supabase-project-baseline-evidence-v1.md` ✅ (baseline remoto)

**SQL blocks criados:** 8 blocks (Block 0 a Block 7) ✅

**Policies incluídas:** **NÃO** — decisão documentada na §10 e §15. Razão: auth spec inexistente;
`auth.uid()` sem contexto definido; política prematura abre `RLS_POLICY_UNAUTHORIZED` risk;
tabela sem policy + RLS habilitado = inacessível via API (seguro); RLS é segunda linha de defesa;
policies exigem spec de auth + spec de RLS + gate humano próprio.

**Confirmação de não-execução:** nenhum SQL foi executado. Nenhuma chamada MCP foi feita.
Nenhuma alteração no Supabase remoto. ✅

**Confirmação de não-alteração do Supabase:** Supabase não foi alterado. ✅

**Confirmação de não-alteração de `platform/`:** `platform/` não foi alterado. ✅

**Próximo passo recomendado:** revisão humana deste plano; execução manual sequencial dos blocks
no Supabase SQL Editor (Block 0 primeiro); colar output do Block 7 no chat para confirmação.
Após confirmação do estado final, o próximo pack candidato é o
**`Tenant Schema Migration Generation Pack`** — gerar (não aplicar) migration SQL via Drizzle
que reconcilie o schema manual com o fluxo formal de migrations.
