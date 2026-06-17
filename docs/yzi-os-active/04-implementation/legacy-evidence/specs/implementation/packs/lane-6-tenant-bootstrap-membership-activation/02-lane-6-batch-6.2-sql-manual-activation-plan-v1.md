# Pack 02 — Lane 6 · Batch 6.2 — SQL/Manual Activation Plan (1 tenant + 1 membership) v1

> Pack documental da **Lane 6 — Tenant Bootstrap / Membership Activation Layer**, Batch
> 6.2. **PLANO SQL — NÃO executa nada**: não executa SQL, não cria
> tenant/membership/seed/policy, não altera schema, não altera `platform/`/código, não usa
> MCP/service role, não versiona e‑mail/UUID real, não lê/imprime token/cookie/OAuth
> `code`, não cria evidence e não abre o Batch 6.3. Prepara um **plano SQL manual,
> revisível e reversível** para execução **humana** no Supabase SQL Editor.

Lane: 6 · Status da lane: **ABERTA (G1)** · Batch: **6.2 (plano)**
Projeto Supabase: `thwsltjcjrvtidhnfukc` · Data: 2026-06-12
Papéis ativados: **Backend/Supabase Planner** (principal) · **Auth/RLS Reviewer** *(consultivo)* · **Execution Coordinator** (handoff)

Entradas lidas:
- `lanes/lane-6-tenant-bootstrap-membership-activation-execution-program-v1.md` (`529bb12`)
- `packs/.../01-lane-6-batch-6.1-product-definition-pack-v1.md` (`7392a86`)
- `lanes/lane-6-product-scope-candidate-review-v1.md` (`94d7ec9`)
- `evidence/lane-5-batch-5.4-runtime-browser-no-membership-validated-evidence-v1.md` (`d9f6e3d`)
- `sql/lane-3-auth-tenant-boundary/00-preflight-inspection.sql`, `01-rls-policies.sql` (schema/policies, **sem executar**)
- `sql/yzi-os-manual-supabase-sql-plan-v1.md` (DDL de fundação — shapes de `tenants`/`tenant_memberships`)

---

## 0. Contexto de Gate

- Gate **G4** recebido: `AUTORIZO O PLANNER A PREPARAR O PLANO SQL DO BATCH 6.2 DA LANE 6,
  COM ROLLBACK EXPLÍCITO, SEM SEED PERMANENTE`.
- Este batch **prepara** o plano; **execução é ação humana** sob gate próprio (G6, §9).
- O agente **não executa SQL**.

---

## 1. Objetivo do SQL

- Criar **1 tenant real** (`public.tenants`: `slug`, `name`; `status` default `active`).
- Criar **1 membership real** ligando o **operador validado no Batch 5.4** ao tenant
  (`public.tenant_memberships`: `tenant_id`, `user_id`, `role`; `status` default `active`).
- **Não criar seed permanente** — a ativação é reversível; o baseline 0/0 é o estado de
  retorno.
- **Permitir rollback** completo para `0 tenants / 0 memberships` (§6).

### Decisão de boundary de escrita (importante — para revisão no Batch 6.3)
A execução é **SQL manual no Supabase SQL Editor**, que roda como role privilegiada
(`postgres`, owner das tabelas, com `BYPASSRLS`). Portanto **nenhuma policy de escrita
(INSERT) é necessária** para o bootstrap, e o plano **recomenda NÃO criar policy de
escrita**: o frontend permanece **read-only** (anon key + policies SELECT da Lane 3), e a
única escrita é esta ação manual, privilegiada e reversível. Isso **minimiza superfície**
(sem nova policy ampla) e mantém o tenant boundary intacto. → A confirmar pelo **Auth/RLS
Reviewer (Batch 6.3)**.

---

## 2. Pré-condições (antes da execução humana)

1. **Operador autenticado** via Google OAuth (conta validada no Batch 5.4).
2. **E‑mail do operador conhecido pelo humano** — fornecido **no momento da execução**,
   **nunca** versionado neste documento.
3. **Humano resolve o `user_id` (UUID)** no SQL Editor a partir do e‑mail; e‑mail/UUID
   **não** são gravados no repositório.
4. **Baseline confirmado** `0 tenants / 0 memberships` **antes** de executar (rodar o
   preflight/contagem da Lane 3, §7.A abaixo).
5. **Execução manual** pelo humano no Supabase SQL Editor — **não** via agente, **não**
   via MCP, **não** com service role no frontend.

---

## 3. Placeholders Obrigatórios

| Placeholder | Significado | Origem (no momento da execução) |
|---|---|---|
| `<OPERATOR_EMAIL>` | e‑mail do operador validado | fornecido pelo humano; **não versionar** |
| `<OPERATOR_USER_ID>` | UUID do operador em `auth.users` | resolvido pelo humano via §4.1; **não versionar** |
| `<TENANT_NAME>` | nome legível do tenant | Batch 6.1: `YZI OS — Operação Inicial` |
| `<TENANT_SLUG>` | slug interno do tenant | Batch 6.1: `operacao-inicial` |
| `<TENANT_ID>` | UUID do tenant criado | retornado pelo INSERT do tenant (§4.2) |
| `<MEMBERSHIP_ROLE>` | papel da membership | recomendação §4.4 (default `viewer`); confirmar |

> **Nenhum valor real** (e‑mail/UUID) aparece neste documento; apenas placeholders.

---

## 4. Plano SQL Conceitual (passo a passo)

### 4.1 Resolver `user_id` pelo e‑mail (somente leitura)
Consultar `auth.users` pelo e‑mail do operador para obter o `user_id`. O humano substitui
`<OPERATOR_EMAIL>` no SQL Editor e **anota** o UUID retornado como `<OPERATOR_USER_ID>`
(em memória/sessão, não no repositório).

### 4.2 Inserir o tenant e capturar `tenant_id`
Inserir 1 linha em `public.tenants` com `<TENANT_SLUG>`/`<TENANT_NAME>` (status assume
default `active`); capturar o `id` retornado como `<TENANT_ID>`.

### 4.3 Inserir a membership
Inserir 1 linha em `public.tenant_memberships` ligando `<OPERATOR_USER_ID>` a
`<TENANT_ID>`, com `role = <MEMBERSHIP_ROLE>` (status assume default `active`).

### 4.4 Papel (`role`) — mínimo, conforme schema real
O schema exige `role NOT NULL CHECK IN ('owner','admin','operator','viewer')` (sem
default). **Recomendação (menor privilégio): `viewer`** — suficiente para o operador
**pertencer** e o cockpit renderizar `tenant_found` (a RLS `tenants_select_member` exige
apenas a **existência** do membership, não papel elevado), e **nenhuma** policy da Lane 6
deriva capacidade de `role`. **Alternativa:** `owner`, se o humano quiser que o operador
seja administrador do tenant de ativação. **Decisão final é humana** (confirmar no gate de
execução). Evita-se `admin`/`operator` (papel elevado prematuro — non-goal §3 do programa).

### 4.5 Confirmar pós-inserção (SELECT)
Validar que existe exatamente 1 tenant e 1 membership para o operador (§7).

---

## 5. SQL Proposto (bloco separado · placeholders · sem e‑mail/UUID real · sem service role · **não executar**)

```sql
-- LANE 6 · BATCH 6.2 — ATIVAÇÃO MANUAL (PLANO — NÃO EXECUTAR PELO AGENTE)
-- Execução: humana, Supabase SQL Editor (role postgres, privilegiada).
-- Substituir os <PLACEHOLDERS> no momento da execução. Não versionar e-mail/UUID.
-- Service role: não usar. MCP: não usar.

-- (A) PRÉ-CHECK — baseline 0/0 (somente leitura)
SELECT 'tenants' AS tabela, count(*) AS total FROM public.tenants
UNION ALL
SELECT 'tenant_memberships', count(*) FROM public.tenant_memberships;
-- Esperado: tenants = 0, tenant_memberships = 0

-- (B) RESOLVER user_id PELO E-MAIL (somente leitura) — anotar o UUID retornado
SELECT id AS operator_user_id, email
FROM auth.users
WHERE email = '<OPERATOR_EMAIL>';
-- Anotar id como <OPERATOR_USER_ID> (não versionar)

-- (C) ATIVAÇÃO ATÔMICA (transação — reversível com ROLLBACK antes do COMMIT)
BEGIN;

-- C1. Inserir tenant e capturar id
WITH novo_tenant AS (
  INSERT INTO public.tenants (slug, name)
  VALUES ('<TENANT_SLUG>', '<TENANT_NAME>')
  RETURNING id
)
-- C2. Inserir membership ligando o operador ao tenant recém-criado
INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
SELECT novo_tenant.id, '<OPERATOR_USER_ID>'::uuid, '<MEMBERSHIP_ROLE>'
FROM novo_tenant
RETURNING tenant_id, user_id, role;
-- Conferir o tenant_id retornado e anotá-lo como <TENANT_ID>

-- Revisar a saída acima ANTES de confirmar:
--   COMMIT;    -- aplica a ativação
--   ROLLBACK;  -- desfaz tudo (nada persiste)
COMMIT;
```

> Alternativa em dois passos (se preferir não usar CTE): `INSERT INTO public.tenants ...
> RETURNING id;` → anotar `<TENANT_ID>` → `INSERT INTO public.tenant_memberships
> (tenant_id, user_id, role) VALUES ('<TENANT_ID>'::uuid, '<OPERATOR_USER_ID>'::uuid,
> '<MEMBERSHIP_ROLE>');`. A variante CTE/transação é **preferida** por atomicidade
> (evita tenant órfão se o passo 2 falhar).
>
> **Nenhuma policy de escrita é criada.** A inserção usa a role privilegiada do SQL Editor
> (bypassa RLS); o frontend continua sem escrita.

---

## 6. Rollback Explícito (placeholders · retorno a 0/0)

```sql
-- ROLLBACK PÓS-COMMIT (se a ativação precisar ser desfeita)
-- Execução humana, SQL Editor. Usa placeholders, sem dado sensível versionado.

BEGIN;

-- R1. Remover a membership do operador no tenant de ativação
DELETE FROM public.tenant_memberships
WHERE tenant_id = '<TENANT_ID>'::uuid
  AND user_id   = '<OPERATOR_USER_ID>'::uuid;

-- R2. Remover o tenant de ativação
--     (ON DELETE CASCADE em tenant_memberships já cobriria R1; R1 é explícito por clareza)
DELETE FROM public.tenants
WHERE id = '<TENANT_ID>'::uuid;

-- R3. Confirmar retorno ao baseline
SELECT 'tenants' AS tabela, count(*) AS total FROM public.tenants
UNION ALL
SELECT 'tenant_memberships', count(*) FROM public.tenant_memberships;
-- Esperado: 0 e 0

COMMIT;  -- ou ROLLBACK; para reavaliar
```

- **Nenhuma policy a remover** (nenhuma foi criada). Se, por decisão do Auth/RLS Reviewer,
  uma policy de escrita vier a ser criada num plano futuro, seu DROP deve ser adicionado
  ao rollback **desse** plano — não a este.
- Como não há seed/migration, o rollback restaura integralmente o baseline 0/0.

---

## 7. Validação Pós-SQL

```sql
-- (A) Contagem: exatamente 1/1
SELECT 'tenants' AS tabela, count(*) AS total FROM public.tenants
UNION ALL
SELECT 'tenant_memberships', count(*) FROM public.tenant_memberships;
-- Esperado: tenants = 1, tenant_memberships = 1

-- (B) Conferir o vínculo do operador (somente leitura)
SELECT t.name, tm.role, tm.status
FROM public.tenant_memberships tm
JOIN public.tenants t ON t.id = tm.tenant_id
WHERE tm.user_id = '<OPERATOR_USER_ID>'::uuid;
-- Esperado: 1 linha com <TENANT_NAME>, <MEMBERSHIP_ROLE>, status 'active'
```

- **`tenant_found` deve aparecer em `/cockpit` após refresh** com a sessão do operador
  (validação runtime/browser é o **Batch 6.5**, não este).
- **RLS SELECT** deve permitir ao operador ver **apenas o seu** tenant (a policy
  `tenants_select_member` já garante isso; nenhum outro tenant existe de qualquer forma).
- **`no_membership` deixa de aparecer** para esse operador (passa a `tenant_found`).

> Esta validação é **plano**; a execução das queries e a observação runtime são humanas,
> sob gates próprios (G6 execução, G7 validação runtime).

---

## 8. Riscos e Controles

| Risco | Controle |
|---|---|
| **Role ampla / papel elevado prematuro** | `<MEMBERSHIP_ROLE>` default **`viewer`** (menor privilégio); `admin`/`operator` evitados; decisão humana no gate |
| **`user_id` errado** | resolver via SELECT em `auth.users` por e‑mail (§4.1) e **conferir** antes do INSERT; transação permite `ROLLBACK` |
| **Tenant irreversível** | ativação em **transação**; rollback documentado (§6); sem seed/migration |
| **Bypass de RLS indevido** | escrita **só** via SQL Editor privilegiado e manual; **nenhuma** INSERT policy criada; frontend permanece read-only |
| **Inserir dados sem rollback** | rollback explícito (§6) entregue **junto** do plano; baseline 0/0 verificável |
| **Vazamento de e‑mail/UUID/segredo** | apenas placeholders versionados; e‑mail/UUID resolvidos em runtime pelo humano; sem token/cookie/`code` |
| **Slug/UNIQUE colisão em re-execução** | `slug` é UNIQUE e `(tenant_id,user_id)` é UNIQUE; re-executar falha — **idempotência por verificação**: rodar o pré-check 0/0 antes |

---

## 9. Gate de Execução Humana (proposto)

A execução manual do SQL exige, conforme o programa §8 (G6), a frase literal:

> `AUTORIZO A EXECUÇÃO MANUAL DO PLANO SQL DO BATCH 6.2 DA LANE 6 NO SUPABASE SQL EDITOR, COM ROLLBACK DISPONÍVEL, SEM SERVICE ROLE NO FRONTEND`

**O agente não executa SQL.** A execução é ação **humana** no Supabase SQL Editor; o agente
apenas preparou este plano e poderá, depois, consolidar o evidence (sob G8) a partir do
resultado relatado pelo humano (sem e‑mail/UUID/segredo).

Frases insuficientes: "vamos", "segue", "ok", "pode", "faça", "sim", "continue".

---

## 10. Escopo deste Batch

### Autorizado
- Preparar o plano SQL (§1–§9): objetivo, pré-condições, placeholders, plano conceitual,
  SQL proposto com placeholders, rollback, validação, riscos/controles, gate de execução.

### Proibido
- Executar SQL; criar tenant/membership/seed/policy; alterar schema/`platform/`/código;
  usar MCP/service role; versionar e‑mail/UUID real; ler/imprimir token/cookie/`code`;
  criar evidence; abrir o Batch 6.3.

## 11. Stop Conditions

- Schema divergente do assumido (ex.: `role` com valores diferentes) → **parar** e revisar
  o plano antes de qualquer execução.
- Baseline ≠ 0/0 no pré-check → **parar**: investigar antes de inserir.
- Pressão para executar SQL, criar dado ou abrir o 6.3 → recusar; não autorizado.

---

## Confirmação de Não-Execução

Este artefato é **plano SQL** em texto de spec. **Não** executou SQL, **não** criou
tenant/membership/seed/policy, **não** alterou schema/`platform/`/código, **não** usou
MCP/service role, **não** versionou e‑mail/UUID real, **não** leu/imprimiu
token/cookie/OAuth `code`, **não** criou evidence e **não** abriu o Batch 6.3.
`public.tenant_memberships` e `public.tenants` permanecem **vazios** (baseline 0/0). A
execução exige a frase humana do gate G6 (§9).

---

## Readiness deste Batch

`LANE_6_BATCH_6_2_SQL_MANUAL_ACTIVATION_PLAN_CREATED_NOT_EXECUTED`
