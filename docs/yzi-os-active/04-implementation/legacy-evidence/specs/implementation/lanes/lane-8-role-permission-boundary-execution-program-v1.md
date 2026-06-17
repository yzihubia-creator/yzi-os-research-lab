# Lane 8 — Role / Permission Boundary: Execution Program v1

Status: **ativo — Lane 8 autorizada e em execução nesta task**
Modo: Execution Program Mode (sobre o SDD Lite / Execution Pack Mode)
Projeto Supabase: `thwsltjcjrvtidhnfukc` · Data: 2026-06-12

> Programa de execução **enxuto** da Lane 8. Consolida definição de produto (8.1) e plano
> mínimo (8.2) — **nenhum pack separado é necessário** para um incremento de exibição
> read-only (evita monstro documental). Fundamenta-se em
> [`lane-8-product-scope-candidate-review-v1.md`](lane-8-product-scope-candidate-review-v1.md)
> e no closure da Lane 7
> [`lane-7-operator-session-control-layer-closure-gate-v1.md`](lane-7-operator-session-control-layer-closure-gate-v1.md).
> **Não** cria SQL/policy/schema, **não** altera tenant/membership, **não** usa service
> role/MCP, **não** cria agente/registry/tool/memória/runner, **não** abre a Lane 9.

---

## 1. Lane Identity

| Campo | Valor |
|---|---|
| **Nome** | Lane 8 — Role / Permission Boundary |
| **Objetivo de produto** | Tornar **explícita e legível** no cockpit a fronteira de permissão do operador: exibir o **papel real** (`viewer`) e o que esse papel **pode** e **ainda não pode** fazer — sem policy nova, sem schema novo, sem registry, sem agente, sem caminho de escrita. |
| **Readiness de entrada** | `LANE_7_OPERATOR_SESSION_CONTROL_CLOSED_LOGOUT_RELOGIN_TENANT_FOUND_VALIDATED` · `LANE_8_PRODUCT_SCOPE_CANDIDATE_REVIEW_CREATED_NOT_OPENED` |
| **Readiness esperado de saída** | `LANE_8_ROLE_PERMISSION_BOUNDARY_CLOSED_VIEWER_BOUNDARY_VALIDATED` (token provisório) |

### Fluxo-alvo
`tenant_found` → operador vê o tenant real (`YZI OS — Operação Inicial`) → vê o papel `viewer`
→ entende, de forma honesta, o que pode e o que ainda não pode fazer.

---

## 2. Product Definition (Batch 8.1)

**O que o operador `viewer` deve entender:** que seu vínculo é de **observação** (menor
privilégio do modelo `owner > admin > operator > viewer`); que pode **ver** a operação e o
próprio vínculo e **encerrar a sessão**; e que **ainda não há** ações de escrita, agentes ou
administração no cockpit — para nenhum papel.

**O que a UI deve comunicar:** papel humano (não valor cru), uma linha honesta sobre o papel,
e duas listas — "o que você pode fazer" / "o que você ainda não pode fazer" — **sem ação
falsa, sem botão inoperante, sem id/slug cru**.

**Definition of Done (DoD):**
1. `/cockpit` em `tenant_found` exibe tenant real + papel `viewer` + fronteira legível.
2. Papel vem de **dado real** da membership (RLS read-only); nada fabricado.
3. Base agentic permanece vazia/honesta; nenhum agente/registry/tool/memória.
4. `npm run lint` e `npm run build` verdes.
5. Revisão Auth/RLS e UX/Cockpit aprovadas.
6. Validação runtime/browser humana confirmando o fluxo-alvo.

---

## 3. Implementation Plan (Batch 8.2)

**Arquivos mínimos lidos:** `cockpit/page.tsx`, `tenant/tenant-context.ts`, `auth/session.ts`,
`lib/supabase/*`, `cockpit/layout.tsx`, e o DDL versionado (`sql/.../role` — confirma
`role text CHECK IN (owner,admin,operator,viewer)` e RLS **só SELECT**).

**Incremento de UI:** no estado `tenant_found`, bloco "Seu papel nesta operação" + grade
"pode / ainda não pode".

**Mudança de dados:** `getTenantContext` passa a ler `role` na **mesma** query SELECT da
membership (`select("tenant_id, role")`) — sem policy/schema novo.

**Arquivos modificados/criados:**
- `platform/src/lib/tenant/role-boundary.ts` *(novo — helper puro, declarativo, read-only)*
- `platform/src/lib/tenant/tenant-context.ts` *(lê `role`; tipo `tenant_found` ganha `role`)*
- `platform/src/app/cockpit/page.tsx` *(render da fronteira no `tenant_found`)*

---

## 4. Execution Batches

| Batch | Conteúdo | Estado |
|---|---|---|
| 8.1 | Product definition + DoD | ✅ |
| 8.2 | Plano mínimo + arquivos | ✅ |
| 8.3 | Implementação mínima (3 arquivos) | ✅ |
| 8.4 | Revisão Auth/RLS + UX/Cockpit | ✅ |
| 8.5 | Validação runtime/browser | ⏳ **requer relato humano** |
| 8.6 | Evidence + closure gate + mapa + commit único | ⏳ após 8.5 |

---

## 5. Non-Goals

Sem Agent Registry, agente real, MCP, runner, tools, memória, SQL, alteração de schema,
alteração de tenant/membership, seed, policy nova, role model amplo, ações administrativas,
onboarding comercial. Não mexer em `main`, não resolver `9abc33e`, não fazer push, não
commitar microetapas, não abrir a Lane 9.

---

## 6. Validações Obrigatórias

`npm run lint` · `npm run build` · revisão Auth/RLS · revisão UX/Cockpit · validação
runtime/browser humana (tenant real + operador autenticado + role `viewer` + fronteira
legível + base agentic vazia + sem ação falsa + sem token/cookie/OAuth code exposto).

---

## 7. Readiness desta task

`LANE_8_ROLE_PERMISSION_BOUNDARY_EXECUTION_PROGRAM_ACTIVE` — implementação e validações
estáticas concluídas; **fechamento (8.6) e commit único condicionados à validação runtime
humana** (Batch 8.5).
