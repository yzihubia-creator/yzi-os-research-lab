# Lane 14 — Controlled Run Record / Run State Boundary: Execution Program v1

Projeto Supabase: `thwsltjcjrvtidhnfukc` · Modo: SDD Lite / Execution Program Mode

Programa de execução **enxuto** da Lane 14. Parte do readiness anterior
`LANE_13_FIRST_CONTROLLED_AGENT_OPERATION_CLOSED_DRY_RUN_VALIDATED` (primeira operação agentic em
dry-run) — não reexplica o histórico. Abertura autorizada por `AUTORIZO ABERTURA DA LANE 14`.

---

## 1. Objetivo

Transformar o dry-run da Lane 13 em um **modelo visual/declarativo de run governado**: definir e
exibir, de forma **read-only e honesta**, o que seria um **registro de execução controlada ("run")**
**antes** de criar persistência real. A lane prova que o sistema consegue **representar** o estado de
um run governado — estado, insumos, bloqueios, ausência de side effects, o que seria persistido no
futuro e quais gates seriam necessários — **sem persistir nada em banco**. Esta lane **não cria
persistência, schema, policy nem agente real de produção**.

## 2. Enquadramento (controlado, read-only, pré-persistência)

`run mode (dry-run/preview/read-only) → run status (simulated / blocked_for_real_execution /
not_persisted) → capability (Qualificação de oportunidades) → tenant + operator role → input sources
(tenant context, role boundary, capability boundary, tool/memory boundary) → result (execução real
bloqueada até lanes futuras) → side effects (none) → persistence (not persisted) → future persistence
requirements (schema, RLS, write policy, evidence trace, rollback/audit)`. O run é local/declarativo e
baseado no estado **já existente** do cockpit (tenant + papel já carregados; nenhuma consulta nova).
Título de UI: **"Registro de operação controlada (run governado — pré-persistência)"**.

## 3. Arquivos

**Criados/alterados (código):**
- `platform/src/lib/agents/controlled-run-record.ts` — **novo**, helper puro/declarativo/read-only (`getControlledRunRecord()`), recebe apenas dados já carregados (tenant, papel) e não consulta nem persiste nada.
- `platform/src/app/cockpit/page.tsx` — render do run state boundary no `tenant_found`, abaixo da seção da Lane 13; preserva Lanes 8/9/10/11/12/13.

**Não alterados (intencional):** `controlled-agent-operation.ts`, `tool-memory-boundary.ts`, `agent-capability-boundary.ts`, `agent-definition.ts`, `agent-registry-shell.ts`, `role-boundary.ts`, `tenant-context.ts`, `session.ts`, `proxy.ts`, `supabase/*`.

## 4. Batches

| Batch | Conteúdo | Estado |
|---|---|---|
| 14.1 | Product definition (run governado pré-persistência, read-only) | concluído |
| 14.2 | Minimal implementation (1 helper novo + render) | concluído — lint/build verdes |
| 14.3 | Auth/RLS + UX/Cockpit review | aprovado |
| 14.4 | Runtime validation (browser, humano) | **requer relato humano** |
| 14.5 | Evidence + closure + mapa + checklist + commit único local | após 14.4 |

## 5. Validações obrigatórias

`npm run lint` · `npm run build` · revisão Auth/RLS · revisão UX/Cockpit · validação
runtime/browser por humano do cockpit exibindo: tenant real **YZI OS — Operação Inicial**; role
`viewer`; boundary `viewer`; Agent Registry Shell; capacidades planejadas (Lane 10); limites por
capacidade (Lane 11); Tool/Memory Boundary (Lane 12); First Controlled Agent Operation dry-run (Lane
13); **nova seção Controlled Run Record / Run State Boundary** com run mode (dry-run/preview/read-only),
run status (simulated / blocked_for_real_execution / not_persisted), capability, tenant, operator role,
input sources, result, side effects (none), persistence (not persisted) e future persistence
requirements (schema, RLS, write policy, evidence trace, audit/rollback); ausência explícita de
database write / SQL / policy / side effect / tool call / memory access / MCP / runner / external API;
**sem botão** que prometa persistir ou executar run real; sem erro visual/hydration; sem
token/cookie/OAuth `code` exposto.

## 6. Restrições obrigatórias (non-goals)

Não persistir run em banco; não criar tabela de runs/agents; não criar/executar SQL; não alterar
schema; não criar policy (RLS/escrita); não criar evidence trace persistido; não criar agente real;
não executar agente em produção; não criar MCP/runner/scheduler/tool real; não chamar API externa;
não criar memória operacional; não ler/escrever memória; não criar nenhum side effect; não usar
service role; não ler/imprimir env/secret/token/cookie/OAuth `code`; não alterar `main`; **não fazer
push**; não resolver commit acidental `9abc33e`; não commitar até a Lane 14 validada; não incluir
untracked antigos nem alterações fora de escopo; não abrir a Lane 15.

## 7. Readiness esperado

- Se tudo validar: `LANE_14_CONTROLLED_RUN_RECORD_CLOSED_NOT_PERSISTED_VALIDATED`.
- Se runtime pendente: `LANE_14_CONTROLLED_RUN_RECORD_IMPLEMENTED_LINT_BUILD_GREEN_RUNTIME_VALIDATION_PENDING_HUMAN`.
