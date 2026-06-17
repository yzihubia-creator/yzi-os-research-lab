# Lane 6 — Batch 6.4 — Human SQL Execution — Evidence v1

Readiness Statement: `LANE_6_BATCH_6_4_HUMAN_SQL_EXECUTION_EVIDENCE_CONSOLIDATED`

> Registro de evidência documentário, único e curto, do Batch 6.4 da Lane 6 — Tenant
> Bootstrap / Membership Activation Layer. Consolida a **execução humana manual** do plano
> SQL do Batch 6.2 no Supabase SQL Editor, que **ativou 1 tenant real e 1 membership real**
> do operador validado. **Não executa implementação**: o agente não rodou SQL, não alterou
> `platform/`/código, não criou novo SQL, não usou MCP, não usou service role, não criou
> policy de escrita, não colou e‑mail/UUID/token/cookie/OAuth `code`/segredo, não atualizou
> o mapa operacional, não fechou a Lane 6 e não abriu o Batch 6.5.

Lane: 6 — Tenant Bootstrap / Membership Activation Layer · Batch: **6.4** · Status da lane: **ABERTA (G1)**
Projeto Supabase: `thwsltjcjrvtidhnfukc` · Data: 2026-06-12
Autor (papel): **Evidence Auditor** (sob gate G8) · Executor do SQL: **humano, no Supabase SQL Editor**
Gates recebidos: G3 (`AUTORIZO O EXECUTION COORDINATOR A ABRIR O BATCH 6.4 DA LANE 6`) · G8 (`AUTORIZO O EVIDENCE AUDITOR A CONSOLIDAR O EVIDENCE DA EXECUÇÃO MANUAL DO SQL DO BATCH 6.2`)

---

## 1. Cadeia Documental

| Etapa | Artefato | Commit |
|---|---|---|
| Plano SQL (Batch 6.2) | `packs/.../02-lane-6-batch-6.2-sql-manual-activation-plan-v1.md` | `fdda440` |
| Parecer Auth/RLS (Batch 6.3) | `packs/.../03-lane-6-batch-6.3-auth-rls-review-sql-plan-v1.md` | `fee8124` |
| Execução manual (Batch 6.2, sob G6) | **ação humana no SQL Editor** — consolidada neste evidence | — |

A execução seguiu **exatamente** o plano aprovado; nenhum SQL novo foi criado nesta task.

## 2. Natureza da Execução — Humana e Manual

- O SQL foi **executado manualmente pelo humano** no **Supabase SQL Editor** (role
  privilegiada `postgres`), sob a frase de gate **G6**.
- **O agente NÃO executou SQL.** Não houve chamada de MCP, runner, migration ou service
  role por parte do agente em nenhum momento.
- O SQL executado foi **baseado no plano do Batch 6.2** (`fdda440`), **aprovado pelo
  Auth/RLS Reviewer no Batch 6.3** (`fee8124`).

## 3. Resultado Relatado pelo Humano

- SQL executado manualmente no Supabase SQL Editor.
- **1 tenant real** criado:
  - **Nome:** `YZI OS — Operação Inicial`
  - **Slug:** `operacao-inicial`
- **1 membership real** criada, ligando o **operador validado no Batch 5.4** ao tenant.
  - **Role:** `viewer` (papel mínimo ratificado no Batch 6.3).
- **Resultado esperado confirmado:** **1 tenant / 1 membership**.

> O identificador concreto do operador (e‑mail e `user_id`) foi resolvido e substituído
> **localmente** pelo humano no SQL Editor e **não** é registrado neste evidence.

## 4. Decisão de Boundary de Escrita — Ratificada na Execução

- **Nenhuma policy de escrita (INSERT/UPDATE/DELETE) foi criada** — conforme a decisão
  formal do Batch 6.3 (§4). A escrita ocorreu **apenas** pela ação manual privilegiada no
  SQL Editor; o frontend permanece **read-only** (anon key + policies SELECT da Lane 3:
  `tenants_select_member`, `memberships_select_own`).
- **Nenhum service role no frontend** (nem em qualquer ponto de `platform/`).

## 5. Reversibilidade

- A ativação é **reversível** via o **rollback documentado** no plano do Batch 6.2 (§6):
  remover a membership → remover o tenant → reconfirmar baseline `0 tenants / 0
  memberships`. (`ON DELETE CASCADE` já cobriria a membership; o passo explícito é por
  clareza.)
- **Nenhum seed permanente** foi criado: sem script de seed, sem migration que embuta o
  tenant, sem fixture durável. O baseline `0/0` permanece o **estado de retorno**.

## 6. Estado Resultante (Before / After)

| Momento | `tenants` | `tenant_memberships` | Estado de cockpit esperado |
|---|---|---|---|
| **Antes** | 0 | 0 | `no_membership` (validado no 5.4, `d9f6e3d`) |
| **Depois** | 1 (`YZI OS — Operação Inicial`) | 1 (operador, `viewer`, `active`) | `tenant_found` real — **a validar em runtime (Batch 6.5)** |

> A renderização de `tenant_found` em runtime/browser **ainda não foi validada** neste
> batch — é o objeto do **Batch 6.5** (sob gate G7), **não aberto** aqui.

## 7. Confirmação — Nenhum Dado Sensível no Evidence

Confirmado: **nenhum e‑mail real**, **nenhum UUID real**, **nenhum token/cookie/OAuth
`code`** e **nenhum segredo** foram versionados neste registro. O output bruto sensível
**não** foi colado; os achados são descritivos e usam apenas nome/slug/role públicos do
tenant de ativação.

## 8. Confirmações de Não-Execução (do agente)

- **Agente não executou SQL.**
- **Nenhum MCP** usado.
- **Nenhum service role.**
- **Nenhuma policy de escrita criada.**
- **Nenhum SQL novo criado** nesta task.
- **Nenhum código alterado.**
- **`platform/` não alterado.**
- **Nenhum seed permanente.**
- **Mapa operacional não atualizado.**
- **Lane 6 não fechada.**
- **Batch 6.5 não aberto.**

## 9. Próximo Passo

**Validar em runtime o estado `tenant_found` no cockpit** (Batch 6.5), com observação
humana no navegador, sob o gate **G7**:

> `AUTORIZO A VALIDAÇÃO RUNTIME DO tenant_found DO BATCH 6.5 DA LANE 6`

## 10. Readiness Final

`LANE_6_BATCH_6_4_HUMAN_SQL_EXECUTION_EVIDENCE_CONSOLIDATED`

---

## Confirmação de Não-Execução (deste registro)

Este evidence é documentário e consolida a execução **humana manual** do SQL. **Não**
executou SQL, **não** alterou `platform/`, **não** alterou código, **não** criou novo SQL,
**não** usou MCP, **não** usou service role, **não** criou policy de escrita, **não**
versionou e‑mail/UUID/token/cookie/OAuth `code`/segredo, **não** atualizou o mapa
operacional, **não** fechou a Lane 6 e **não** abriu o Batch 6.5. A ativação registrada é
**real e reversível** (rollback no Batch 6.2 §6). Qualquer ação concreta posterior exige a
frase de autorização humana do gate correspondente (programa da Lane 6 §8).
