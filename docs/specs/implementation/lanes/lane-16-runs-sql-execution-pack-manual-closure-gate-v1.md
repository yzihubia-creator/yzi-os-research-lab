# Lane 16 — Runs SQL Manual Pack: Closure Gate v1

## Readiness Statement

`LANE_16_RUNS_SQL_MANUAL_PACK_CLOSED_NOT_EXECUTED`

Fechamento **documental** da Lane 16 (segunda lane do Bloco 15–17). Registra o SQL pack manual entregue
como artefato **NOT_EXECUTED**, as decisões de governança e os remanescentes. **Não executa código, não
executa SQL, não usa MCP, não cria schema/tabela/policy no banco, não persiste run, não modifica
`platform/`, não altera tenant/membership e não autoriza nenhuma execução por si só.** Gate de abertura:
`AUTORIZO O BLOCO 15–17`.

---

## 1. Lane Identity

| Campo | Valor |
|---|---|
| **Nome** | Lane 16 — Runs SQL Manual Pack |
| **Status** | **concluída (SQL pack NOT_EXECUTED)** |
| **Readiness final** | `LANE_16_RUNS_SQL_MANUAL_PACK_CLOSED_NOT_EXECUTED` |
| **SQL pack** | [`../sql/lane-16-runs-sql-execution-pack-manual-v1.sql`](../sql/lane-16-runs-sql-execution-pack-manual-v1.sql) |
| **Evidence** | [`../evidence/lane-16-runs-sql-execution-pack-manual-evidence-v1.md`](../evidence/lane-16-runs-sql-execution-pack-manual-evidence-v1.md) |
| **Readiness anterior** | `LANE_15_PERSISTENT_RUN_EVIDENCE_CONTRACT_CLOSED_DOCUMENTARY_ONLY` |
| **Projeto Supabase** | `thwsltjcjrvtidhnfukc` |

### Objetivo original (cumprido)

Preparar um SQL pack manual para futura criação de tabela/policies de controlled runs (contrato da Lane
15), salvo como arquivo `.sql` **NOT_EXECUTED**, sem aplicar SQL agora.

---

## 2. Produto Entregue

**SQL pack manual `NOT_EXECUTED`** em `docs/specs/implementation/sql/lane-16-runs-sql-execution-pack-manual-v1.sql`:
- Tabela `public.controlled_runs` com os 13 campos mínimos da Lane 15 + CHECKs de estados permitidos +
  `side_effects = 'none'`.
- Índices `tenant_id` e `created_at desc`.
- RLS `enable` + `force` (nega tudo por padrão).
- Policy de **SELECT tenant-scoped** (`controlled_runs_select_tenant_member`, somente membros do tenant).
- **Negação padrão de escrita** (sem policy de INSERT/UPDATE/DELETE; esboço futuro comentado).
- Bloco de **rollback** comentado para uso humano.

---

## 3. Decisões de Governança

- **NOT_EXECUTED / manual apenas** — o pack é arquivo documental; aplicação futura é manual humana no
  Supabase SQL Editor, nunca por agente/MCP/automação, e só após o gate da Lane 17.
- **Default-deny de escrita** — RLS forçada + ausência de write policy ⇒ nenhuma gravação possível;
  `not_persisted` permanece verdadeiro e `persisted` não é usado.
- **Leitura tenant-scoped** — espelha o padrão de membership da Lane 3 (`auth.uid()`).
- **Sem seed / sem INSERT / sem dados** — nenhum run gravado.
- **Persistência futura condicionada** — write policy governada (com role model), auditabilidade e
  rollback ficam para lane futura, sob gate próprio.
- **Sem secret/PII** no arquivo.

---

## 4. O Que NÃO Foi Feito (Por Design)

Nenhuma execução de SQL; nenhuma tabela/policy criada no banco; nenhum MCP; nenhum seed/INSERT;
nenhuma persistência de run; nenhuma write policy permissiva; nenhuma alteração de `platform/`/
tenant/membership/auth; nenhum runner/tool/memória/agente real/side effect/API externa.

---

## 5. Validações

Documental: SQL pack revisado quanto à aderência ao contrato da Lane 15 (campos/estados/invariantes) e à
postura de segurança (RLS forçada, default-deny de escrita, leitura tenant-scoped, sem seed, sem secret).
`lint`/`build` rodam no fechamento do bloco (sem mudança de código; devem permanecer verdes). **A
verificação funcional real (tabela criada, RLS, inserts bloqueados, select tenant-scoped, rollback) só
ocorre após aplicação manual humana — coberta pela Lane 17.**

---

## 6. Remanescentes / Não Bloqueantes

| Remanescente | Destino |
|---|---|
| SQL ainda não aplicado | Lane 17 (gate humano) + aplicação manual humana |
| Write policy governada | Lane futura, gate próprio (role model + auditoria + rollback) |
| `persisted` ainda não usado | Após aplicação e validação manual |
| Integração read-only do cockpit com tabela real | Lane 18 (candidata, não aberta) |
| `main` / commit `9abc33e` / push | Diferidos por design |

---

## 7. Gate

Integra o Bloco 15–17 (commit único ao final). Não aplica SQL, não abre Lane 18.

---

## Confirmação de Não-Execução

Este documento não executa código, não executa SQL, não usa MCP, não cria schema/tabela/policy no banco,
não persiste run, não modifica `platform/`, não altera tenant/membership/auth e não autoriza nenhuma ação
futura por si só. O SQL pack referenciado é `NOT_EXECUTED`.

## Final Status

`LANE_16_RUNS_SQL_MANUAL_PACK_CLOSED_NOT_EXECUTED`
