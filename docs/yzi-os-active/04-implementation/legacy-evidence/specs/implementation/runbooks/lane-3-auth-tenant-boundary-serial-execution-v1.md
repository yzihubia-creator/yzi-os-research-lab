# Runbook — Lane 3 Auth and Tenant Boundary: Execução Seriada v1

## Readiness Statement

`LANE_3_SERIAL_EXECUTION_RUNBOOK_DEFINED_NO_EXECUTION_AUTHORIZED`

Este é o **arquivo principal para execução futura da Lane 3**. Lista, em ordem, cada step da execução seriada: quem executa, arquivo usado, o que colar no chat, critério de sucesso e critério de parada. Nada é executado agora. Cada step exige o gate humano correspondente.

---

## Projeto Supabase de Referência

`thwsltjcjrvtidhnfukc`

---

## Pré-condições Antes de Iniciar

Confirmar que os seguintes evidence records existem e têm status de sucesso:
- `supabase-lane-1-foundation-ddl-evidence-v1.md` → `LANE_1_DDL_VALIDATED_SUCCESS`
- `platform-lane-2-supabase-client-foundation-evidence-v1.md` → `TASK_221_SUPABASE_CLIENT_FOUNDATION_VALIDATED`

Se qualquer um estiver ausente ou com status de falha: **não iniciar a Lane 3**.

---

## Step 0 — Revisar o Programa da Lane 3

**Quem executa:** humano

**Arquivo:** `docs/specs/implementation/lanes/lane-3-auth-tenant-boundary-execution-program-v1.md`

**O que fazer:** Ler o programa completo. Verificar que o estado herdado, as decisões pendentes, a sequência e os critérios de parada fazem sentido antes de qualquer execução.

**O que colar no chat:** Confirmação de leitura e decisão de prosseguir.

**Critério de sucesso:** Humano confirma explicitamente que leu o programa e autoriza o início.

**Critério de parada:** Humano identifica discrepância com o estado real do banco → parar e reportar antes de qualquer SQL.

---

## Step 1 — Executar SQL Preflight Manual

**Quem executa:** humano (Supabase SQL Editor, projeto `thwsltjcjrvtidhnfukc`)

**Gate requerido:** L3-G1 — frase explícita do humano autorizando execução do preflight

**Arquivo SQL:** `docs/specs/implementation/sql/lane-3-auth-tenant-boundary/00-preflight-inspection.sql`

**O que colar no SQL Editor:** conteúdo completo do arquivo `00-preflight-inspection.sql`

**O que colar no chat:** output completo de todas as queries do preflight

**Critério de sucesso:**
- 2 tabelas com RLS habilitado
- 0 policies existentes
- 0 linhas em ambas as tabelas
- 2 FKs com ON DELETE CASCADE confirmadas
- Indexes presentes

**Critério de parada:**
- RLS desabilitado em qualquer tabela → `RLS_DISABLED` → parar
- Policy existente inesperada → `UNEXPECTED_POLICY_STATE` → reportar e aguardar gate
- Tabela ausente → `PRECONDITION_FAILED` → parar e não avançar

---

## Step 2 — Validar Output do Preflight

**Quem executa:** Claude (verificação documental do output reportado pelo humano)

**Arquivo:** Pack 02 — `02-rls-policy-sql-pack-v1.md` (seção de validação)

**O que fazer:** Claude lê o output colado no chat e confirma ou rejeita o estado esperado.

**O que o humano recebe:** tabela de checks com resultado individual e recomendação de avançar ou bloquear.

**Critério de sucesso:** Todos os checks do preflight passam. Claude emite: `PREFLIGHT_VALIDATED — avançar para Step 3`.

**Critério de parada:** Qualquer check falha → Claude lista o stop event → humano decide antes de prosseguir.

---

## Step 3 — Executar SQL de RLS Policies Manual

**Quem executa:** humano (Supabase SQL Editor, projeto `thwsltjcjrvtidhnfukc`)

**Gate requerido:** L3-G2 — frase explícita do humano autorizando criação das policies

**Arquivo SQL:** `docs/specs/implementation/sql/lane-3-auth-tenant-boundary/01-rls-policies.sql`

**O que colar no SQL Editor:** conteúdo completo do arquivo `01-rls-policies.sql`

**O que colar no chat:** output completo do SQL Editor, incluindo a query de verificação imediata ao final do arquivo

**Critério de sucesso:**
- Nenhum erro SQL reportado
- Output da query final mostra 2 policies: `tenants_select_member` e `memberships_select_own`
- Ambas com cmd=SELECT, roles=authenticated

**Critério de parada:**
- Erro SQL no output → `SQL_OUTPUT_ERROR` → parar e reportar
- Referência a service role no output → `SECRET_EXPOSURE` → parar imediatamente
- Output incompleto → solicitar reenvio antes de prosseguir

---

## Step 4 — Executar SQL de Validação Pós-Policy Manual

**Quem executa:** humano (Supabase SQL Editor, projeto `thwsltjcjrvtidhnfukc`)

**Gate requerido:** L3-G3 — frase explícita do humano após revisão do output do Step 3

**Arquivo SQL:** `docs/specs/implementation/sql/lane-3-auth-tenant-boundary/02-post-policy-validation.sql`

**O que colar no SQL Editor:** conteúdo completo do arquivo `02-post-policy-validation.sql`

**O que colar no chat:** output completo de todas as queries de validação

**Critério de sucesso:**
- Ambas as policies confirmadas em `pg_policies` com semântica correta
- RLS habilitado nas duas tabelas
- Contagem = 1 policy por tabela
- Zero policies de INSERT, UPDATE, DELETE

**O que fazer após:** Claude preenche `lane-3-policy-validation-evidence-template-v1.md` com base no output.

**Critério de parada:**
- Policy ausente → `POLICY_VALIDATION_FAILED` → parar
- RLS desabilitado → `RLS_DISABLED` → parar imediatamente
- Policy extra inesperada → reportar antes de concluir

---

## Step 5 — Decidir Seed/Test User (Opcional)

**Quem executa:** humano (decisão)

**Gate requerido:** L3-G4 — decisão explícita do humano

**Arquivo SQL (se executado):** `docs/specs/implementation/sql/lane-3-auth-tenant-boundary/03-optional-test-seed.sql`

**O que colar no SQL Editor (se executado):** conteúdo completo de `03-optional-test-seed.sql`, com `<USER_ID_REAL>` substituído pelo user_id real obtido no Supabase Auth Dashboard

**Critério de sucesso (se executado):** 1 tenant de teste e 1 membership inseridos sem erro; não afetar tabelas de produção.

**Critério de sucesso (se não executado):** Humano declara explicitamente: `SEED_NOT_EXECUTED_BY_HUMAN_DECISION`.

**Critério de parada:** Output indicar erro ou conflito de dados → parar e reportar.

---

## Step 6 — Decidir Health/Check TypeScript (Opcional)

**Quem executa:** humano (decisão); Claude (criação controlada de `health.ts` se autorizado)

**Gate requerido:** L3-G5 — decisão explícita do humano

**Arquivo alvo (se executado):** `platform/src/lib/supabase/health.ts`

**O que fazer (se autorizado):**
1. Claude cria `platform/src/lib/supabase/health.ts` dentro do escopo do Pack 04;
2. Humano executa `npm run lint` e `npm run build` e reporta output;
3. Claude verifica ausência de secrets e lint/build limpos;
4. Claude preenche `lane-3-health-check-evidence-template-v1.md`.

**Critério de sucesso (se executado):** arquivo criado sem secrets; lint e build limpos; evidence preenchido.

**Critério de sucesso (se não executado):** Humano declara: `HEALTH_CHECK_DEFERRED_BY_HUMAN_DECISION`.

**Critério de parada:** Build falha → `BUILD_FAILURE` → reverter arquivo e reportar.

---

## Step 7 — Registrar Evidence Final

**Quem executa:** Claude (com base nos outputs dos steps anteriores)

**Gate requerido:** L3-G6 — confirmação explícita do humano após revisão dos evidences

**Arquivo:** `docs/specs/implementation/evidence/templates/lane-3-final-evidence-template-v1.md`

**O que fazer:** Claude preenche o evidence final com:
- Lista de packs executados;
- Checklist de conclusão;
- Decisões opcionais (seed, health/check);
- Estado final das tabelas e policies;
- Nota para atualização do mapa operacional.

**Critério de sucesso:** Todos os itens obrigatórios da checklist satisfeitos; gate L3-G6 confirmado; evidence preenchido.

**Critério de parada:** Qualquer item obrigatório não satisfeito → `CONCLUSION_BLOCKED_BY: [item]` → listar e não declarar conclusão.

---

## Step 8 — Atualizar Mapa Operacional

**Quem executa:** Claude (em task separada, após revisão humana do evidence final)

**Gate requerido:** Gate explícito em task própria

**Arquivo alvo:** `docs/specs/implementation/yzi-os-spec-harness-execution-map-v1.md`

**IMPORTANTE:** O mapa operacional **não é atualizado agora**. Este step define apenas o que a atualização deve conter:
- Lane 3 marcada como concluída;
- Policies RLS criadas registradas;
- Health/check: executado ou diferido;
- Lane 4 — Cockpit Skeleton como próxima lane;
- Próxima ação: aguardar gate humano para Lane 4.

**Critério de sucesso:** Mapa atualizado reflete com precisão o estado pós-Lane 3; Lane 4 identificada como próxima ação.

**Critério de parada:** Evidence final não preenchido → não atualizar o mapa.

---

## Regras Absolutas Durante a Execução

1. **Nunca executar SQL via agente** — somente o humano executa SQL no Supabase SQL Editor;
2. **Nunca usar MCP** — MCP não é rota padrão nesta lane;
3. **Nunca modificar `platform/`** sem gate humano explícito;
4. **Nunca expor secrets** — parar imediatamente se service role aparecer em qualquer output;
5. **Um gate por fase** — nenhum step avança sem a frase explícita do humano;
6. **Evidence antes de avançar** — nenhuma fase seguinte começa sem evidence da fase anterior;
7. **Bloquear na ambiguidade** — nunca presumir escopo; sempre solicitar clarificação.

---

## Glossário de Códigos de Stop Event

| Código | Significado |
|--------|-------------|
| `PRECONDITION_FAILED` | Pré-condição herdada não confirmada |
| `RLS_DISABLED` | RLS desabilitado inesperadamente em tabela |
| `UNEXPECTED_POLICY_STATE` | Policy existente onde zero era esperado |
| `SQL_OUTPUT_ERROR` | Erro SQL no output reportado pelo humano |
| `SECRET_EXPOSURE` | Secret ou service role encontrado em qualquer output ou arquivo |
| `POLICY_VALIDATION_FAILED` | Policy ausente ou com semântica incorreta |
| `OUT_OF_SCOPE_WRITE` | Arquivo fora da lista autorizada foi alterado |
| `BUILD_FAILURE` | `npm run build` falhou após escrita |
| `SCOPE_AMBIGUITY` | Dúvida de escopo — bloquear, nunca presumir |
| `CONCLUSION_BLOCKED_BY` | Item obrigatório da checklist de conclusão não satisfeito |

---

## Final Status

`LANE_3_SERIAL_EXECUTION_RUNBOOK_DEFINED_NO_EXECUTION_AUTHORIZED`
