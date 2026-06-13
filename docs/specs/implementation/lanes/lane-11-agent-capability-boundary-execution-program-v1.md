# Lane 11 — Agent Capability Boundary Layer: Execution Program v1

Projeto Supabase: `thwsltjcjrvtidhnfukc` · Modo: SDD Lite / Execution Program Mode

Programa de execução **enxuto** da Lane 11. Abertura: mini-fase autorizada (Lanes 11–13 em
sequência). Parte do readiness anterior `LANE_10_AGENT_DEFINITION_CONFIGURATION_CLOSED_READ_ONLY_AGENTS_VALIDATED`
(camada job-anchored de capacidades planejadas, read-only) — não reexplica o histórico.

---

## 1. Objetivo

Antes de qualquer agente operar, exibir de forma **read-only e honesta** o **limite de cada
capacidade planejada** (Lane 10): finalidade, status, o que **poderá** fazer no futuro, o que
ainda **não pode** fazer, **dependências** futuras e a **ausência de execução**. Sem executar
agente, runner, MCP, tool ou memória; sem policy de escrita; sem expor agentes como protagonistas.

## 2. Enquadramento (job-anchored)

`capacidade → finalidade → status (Planejado — limite definido, sem execução) → poderá fazer →
ainda não pode → depende de`. Lidera pelo resultado; agentes são o motor por baixo; nenhum nome
de agente apresentado. As 6 capacidades são as mesmas da Lane 10 (sourced do Growth OS):
Qualificação de oportunidades · Radar de oportunidades · Follow-up operacional · Nutrição e
reativação · Memória operacional futura · Supervisão executiva. Título de UI:
**"Limites das capacidades planejadas"**.

## 3. Arquivos

**Criados/alterados (código):**
- `platform/src/lib/agents/agent-capability-boundary.ts` — **novo**, helper puro/declarativo/read-only (`getAgentCapabilityBoundary()`).
- `platform/src/app/cockpit/page.tsx` — render da fronteira por capacidade no `tenant_found`, abaixo da seção da Lane 10; preserva Lanes 8/9/10.

**Não alterados (intencional):** `agent-definition.ts`, `agent-registry-shell.ts`, `role-boundary.ts`, `tenant-context.ts`, `session.ts`, `proxy.ts`, `supabase/*`.

## 4. Batches

| Batch | Conteúdo | Estado |
|---|---|---|
| 11.1 | Product definition (limite por capacidade, job-anchored) | concluído |
| 11.2 | Minimal implementation (1 helper novo + render) | concluído — lint/build verdes |
| 11.3 | Auth/RLS + UX/Cockpit review | aprovado |
| 11.4 | Runtime validation (browser, humano) | **requer relato humano** |
| 11.5 | Evidence + closure + mapa + checklist + commit único local | após 11.4 |

## 5. Validações obrigatórias

`npm run lint` · `npm run build` · revisão Auth/RLS · revisão UX/Cockpit · validação
runtime/browser por humano do cockpit exibindo: tenant real; role `viewer`; boundary `viewer`;
Agent Registry Shell; capacidades planejadas (Lane 10); **fronteira por capacidade** (poderá /
ainda não pode / depende de); cada uma "Planejado — limite definido, sem execução"; nenhum agente
ativo; nenhum botão/ação falsa; nenhum MCP/runner/tool/memória.

## 6. Restrições obrigatórias

Não criar/executar SQL; não alterar schema; não criar tabela `agents`/tenant/membership/seed/
policy; não usar MCP/service role/runner/tool/memória; não criar botão de ação nem ação falsa;
não criar roster de agentes nomeados; não ler/imprimir env/secret/token/cookie/OAuth `code`; não
alterar `main`; **não fazer push**; não resolver commit acidental `9abc33e`; não commitar até a
Lane 11 validada; não incluir untracked antigos nem alterações fora de escopo; não abrir a Lane 12
antes de a Lane 11 estar validada+fechada+commitada.

## 7. Readiness esperado

- Se tudo validar: `LANE_11_AGENT_CAPABILITY_BOUNDARY_CLOSED_CAPABILITY_LIMITS_VALIDATED`.
- Se runtime pendente: `LANE_11_AGENT_CAPABILITY_BOUNDARY_IMPLEMENTED_LINT_BUILD_GREEN_RUNTIME_VALIDATION_PENDING_HUMAN`.
