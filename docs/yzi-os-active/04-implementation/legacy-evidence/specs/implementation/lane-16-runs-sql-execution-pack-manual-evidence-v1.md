# Lane 16 — Runs SQL Manual Pack: Evidence v1

Projeto Supabase: `thwsltjcjrvtidhnfukc` · Modo: SDD Lite / Execution Program Mode · Branch: `lane-1-6-foundation`

Evidence **documental** da Lane 16 (Bloco 15–17). Registra o SQL pack manual criado como artefato
**NOT_EXECUTED**. **Não executa código, não executa SQL, não usa MCP, não cria schema/tabela/policy no
banco, não persiste run e não autoriza nada por si só.** Readiness anterior:
`LANE_15_PERSISTENT_RUN_EVIDENCE_CONTRACT_CLOSED_DOCUMENTARY_ONLY`.

---

## 1. Escopo da Lane 16

Preparar um **SQL pack manual** para a **futura** criação de tabela/policies de controlled runs,
implementando o contrato da Lane 15. O SQL é salvo como arquivo `.sql` **NOT_EXECUTED** — aplicação
**manual humana apenas**, após o gate da Lane 17. **Nenhum SQL foi executado nesta lane.**

## 2. Arquivo SQL pack criado

- **Caminho:** `docs/specs/implementation/sql/lane-16-runs-sql-execution-pack-manual-v1.sql`
- **Status:** `NOT_EXECUTED` — aplicação manual humana apenas (Supabase SQL Editor), nunca por
  agente/MCP/automação.

### Conteúdo do pack (resumo)

| Seção | O que define |
|---|---|
| 0. Pré-condições | Verificação humana antes de aplicar (branch, projeto, backup/rollback, leitura, sem MCP, manual, não ativa execução real). |
| 1. Tabela `public.controlled_runs` | 13 campos mínimos do contrato (Lane 15) + CHECKs de estados permitidos + `side_effects = 'none'`. |
| 2. Índices | `tenant_id`, `created_at desc` (leitura tenant-scoped). |
| 3. RLS | `enable` + `force row level security` (nega tudo por padrão). |
| 4. Policy SELECT | `controlled_runs_select_tenant_member` — somente membros do tenant (espelha Lane 3). |
| 5. Escrita | **Negação padrão**: nenhuma policy de INSERT/UPDATE/DELETE; esboço futuro comentado. |
| 6. Rollback | Comandos `drop` comentados para uso humano. |

## 3. Aderência ao contrato da Lane 15 verificada

- **Campos:** todos os 13 campos mínimos presentes (`run_id`, `tenant_id`, `operator_user_id`,
  `operator_role`, `capability_key`, `run_mode`, `run_status`, `side_effects`, `persistence_status`,
  `input_context_snapshot`, `boundary_snapshot`, `result_summary`, `created_at`).
- **Estados:** CHECKs permitem `dry_run`/`simulated` (mode) e `blocked_for_real_execution`/
  `not_persisted`/`persisted` (status); `persisted` está no domínio mas **não é usado** (nenhum INSERT;
  escrita negada).
- **Invariantes:** `side_effects = 'none'` por CHECK; escrita negada (sem write policy) garante
  `not_persisted`; RLS forçada exige policy explícita para qualquer acesso; nenhum seed/insert; rollback
  documentado; persistência futura exige write policy + auditabilidade + rollback (declarado).

## 4. Segurança do SQL pack verificada

- **Default-deny de escrita:** RLS `force` + ausência de policy de escrita ⇒ nenhuma gravação possível,
  inclusive para o owner.
- **Leitura tenant-scoped:** SELECT só para membros do tenant via `tenant_memberships`/`auth.uid()`.
- **Sem seed, sem INSERT, sem dados:** o pack não grava nenhum run.
- **Sem secret/PII:** nenhum token/cookie/OAuth `code`/anon/service key/PII no arquivo.

## 5. Ausências verificadas (verdade da fase)

- **Execução de SQL:** nenhuma — `NOT_EXECUTED`.
- **Tabela/policy no banco:** nenhuma criada (apenas arquivo documental).
- **MCP / Supabase MCP:** não usado.
- **Persistência de run / seed / escrita em banco:** nenhuma.
- **Código (`platform/*`), runner, tool, memória, agente real, side effect, API externa:** nenhum.
- **tenant/membership/auth:** inalterados.

---

## Confirmação de Não-Execução

Este documento registra evidência documental. O SQL pack referenciado é `NOT_EXECUTED`. Nada foi
executado no banco; nenhum MCP foi usado; nenhuma tabela/policy criada; nenhum run persistido; nenhuma
alteração de `platform/`/tenant/membership/auth. Não autoriza nenhuma ação futura por si só.

## Final Status

`LANE_16_RUNS_SQL_MANUAL_PACK_CLOSED_NOT_EXECUTED`
