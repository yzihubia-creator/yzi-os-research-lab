# Lane 3 — Auth and Tenant Boundary — SQL Execution Evidence v1

## Readiness Statement

`LANE_3_SQL_EXECUTION_VALIDATED_CLEAN_BASELINE`

Este documento é o **evidence record versionado** da execução SQL manual da Lane 3 — Backend Auth & Tenant Boundary, conforme o programa [`lane-3-auth-tenant-boundary-execution-program-v1`](../lanes/lane-3-auth-tenant-boundary-execution-program-v1.md) e o runbook [`lane-3-auth-tenant-boundary-serial-execution-v1`](../runbooks/lane-3-auth-tenant-boundary-serial-execution-v1.md). Ele **registra** o estado pós-execução validado; **não executa SQL, não usa MCP, não cria migrations, não cria código, não altera `platform/`**. Foi produzido exclusivamente a partir dos outputs reportados pelo humano.

---

## Contexto

- **Lane:** Lane 3 — Auth and Tenant Boundary
- **Data de execução:** 2026-06-11
- **Executor do SQL:** humano, manualmente, Supabase SQL Editor (projeto `thwsltjcjrvtidhnfukc`)
- **MCP usado:** não
- **SQL executado via agente:** não
- **Evidence anterior:** [`supabase-lane-1-foundation-ddl-evidence-v1`](supabase-lane-1-foundation-ddl-evidence-v1.md) (baseline: tabelas `tenants` e `tenant_memberships` existentes, RLS habilitado, 0 policies, 0 linhas)

---

## SQLs Executados Manualmente

| Ordem | Script | Resultado |
|-------|--------|-----------|
| 1 | `00-preflight-inspection.sql` — Preflight | Executado e aprovado |
| 2 | `01-rls-policies.sql` — Criação das policies | Executado e aprovado |
| 3 | `02-post-policy-validation.sql` — Validação pós-policy | Executado e aprovado |
| 4 | SQL cleanup manual do tenant de teste | Executado e aprovado |

Scripts versionados em [`docs/specs/implementation/sql/lane-3-auth-tenant-boundary/`](../sql/lane-3-auth-tenant-boundary/).

### Preflight — resultado observado

- RLS habilitado em `public.tenants` e `public.tenant_memberships` — confirmado;
- FK `tenant_memberships.tenant_id` → `public.tenants(id)` ON DELETE CASCADE — confirmada;
- FK `tenant_memberships.user_id` → `auth.users(id)` ON DELETE CASCADE — confirmada.

---

## Policies Criadas

| Policy | Tabela | Comando | Role | Qual |
|--------|--------|---------|------|------|
| `memberships_select_own` | `public.tenant_memberships` | SELECT | `authenticated` | `user_id = auth.uid()` |
| `tenants_select_member` | `public.tenants` | SELECT | `authenticated` | EXISTS de membership do usuário autenticado naquele tenant |

- Nenhuma policy de INSERT, UPDATE ou DELETE criada;
- Nenhuma referência a service role.

---

## Validações Realizadas

- Post-policy validation (`02-post-policy-validation.sql`) executada — as 2 policies existem com cmd, role e qual corretos;
- RLS permanece habilitado nas duas tabelas;
- Durante a validação, foi detectado **1 tenant de teste** residual:
  - `id`: `00000000-0000-0000-0000-000000000001`
  - `slug`: `test-lane-3`
  - `name`: `Tenant de Teste Lane 3`

---

## Cleanup do Tenant de Teste

- O tenant de teste foi removido manualmente por SQL cleanup pelo humano no Supabase SQL Editor;
- Validação final após o cleanup:

| Verificação | Resultado |
|-------------|-----------|
| `tenants_count` | 0 |
| `tenant_memberships_count` | 0 |
| `remaining_test_lane_3_tenants` | 0 |
| RLS em `public.tenants` | habilitado |
| RLS em `public.tenant_memberships` | habilitado |
| Policy `tenants_select_member` | existe e correta |
| Policy `memberships_select_own` | existe e correta |

---

## Estado Final (Baseline Limpa)

| Objeto | Estado final validado |
|--------|----------------------|
| `public.tenants` | RLS habilitado, 0 linhas, 1 policy SELECT (`tenants_select_member`) |
| `public.tenant_memberships` | RLS habilitado, 0 linhas, 1 policy SELECT (`memberships_select_own`) |
| Tenants de teste remanescentes | 0 |
| Service role | ausente em toda a lane |

---

## Restrições Preservadas

- `platform/` não foi alterado;
- MCP não foi usado nesta execução;
- SQL executado exclusivamente pelo humano, de forma manual;
- nenhuma migration criada ou registrada;
- nenhum código de backend/frontend criado;
- nenhum auth flow criado;
- nenhum seed permanente criado;
- nenhum subagent real criado;
- nenhuma skill executável criada;
- nenhum secret exposto em arquivos ou outputs.

---

## Riscos / Remanescentes

- As policies cobrem apenas SELECT; operações de escrita (INSERT/UPDATE/DELETE) permanecem sem policies por design e dependerão de lane futura com gate humano;
- A validação foi feita sobre banco vazio (0 linhas); o comportamento das policies com dados reais e usuários autenticados ainda não foi exercitado fim a fim;
- O health check TypeScript e qualquer verificação via aplicação permanecem fora do escopo desta execução;
- Este evidence registra outputs reportados pelo humano; os outputs brutos do SQL Editor não foram colados neste documento (gap documental aceito para o formato curto).

---

## Próxima Ação Recomendada

- Registrar este evidence como base da Lane 3 e submeter ao gate humano;
- Avançar para o próximo pack/lane do mapa operacional (Lane 4 — Cockpit Skeleton) **somente** mediante a frase de autorização explícita definida no documento de gate correspondente.

---

## Confirmação de Não-Execução

Este documento não executa código, não executa SQL, não usa MCP, não modifica `platform/`, não cria migrations, não cria seeds e não autoriza nenhuma ação futura sem gate humano explícito.

---

## Final Status

`LANE_3_SQL_EXECUTION_VALIDATED_CLEAN_BASELINE`
