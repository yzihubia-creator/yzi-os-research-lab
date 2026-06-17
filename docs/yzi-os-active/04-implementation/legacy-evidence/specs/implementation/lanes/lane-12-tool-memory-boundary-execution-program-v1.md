# Lane 12 — Tool / Memory Boundary Layer: Execution Program v1

Projeto Supabase: `thwsltjcjrvtidhnfukc` · Modo: SDD Lite / Execution Program Mode

Programa de execução **enxuto** da Lane 12. Parte do readiness anterior
`LANE_11_AGENT_CAPABILITY_BOUNDARY_CLOSED_CAPABILITY_LIMITS_VALIDATED` (limites read-only por
capacidade planejada, job-anchored) — não reexplica o histórico. Abertura autorizada por
`AUTORIZO ABERTURA DA LANE 12`.

---

## 1. Objetivo

Definir e exibir, de forma **read-only e honesta**, os **limites futuros de tools e memória** para
as capacidades planejadas, deixando claro que nada está conectado/ativo. A memória **não é** chat
history nem RAG genérico: a lane **preserva a arquitetura de memória já definida na base do
projeto** (`docs/specs/memory/`) — Raw Event Memory, Reflective Memory, Retrieval Evidence Layer,
Memory Governance, RAG/Semantic Knowledge separado de memória operacional, e Context/Evidence
Trace — tratando memória como **boundary/governança read-only**, não como implementação
operacional.

## 2. Enquadramento (job-anchored, read-only)

`tools futuras (não conectadas) → memory boundary (camadas planejadas, não ativas) → relação com
as capacidades planejadas → ausência de ativação`. Lidera pelo resultado; nenhuma tool/memória
executa. Título de UI: **"Ferramentas e memória — limites planejados"**.

**Memory boundary (arquitetura preservada):**
- Raw Event Memory — planejada / não ativa.
- Reflective Memory — planejada / não ativa.
- Retrieval Evidence Layer — planejada / não ativa.
- Memory Governance — planejada / não ativa.
- Context / Evidence Trace — planejado / não ativo.
- RAG / Semantic Knowledge — **separado** de memória operacional; também não ativo.

## 3. Arquivos

**Criados/alterados (código):**
- `platform/src/lib/agents/tool-memory-boundary.ts` — **novo**, helper puro/declarativo/read-only (`getToolMemoryBoundary()`).
- `platform/src/app/cockpit/page.tsx` — render da fronteira de tools/memória no `tenant_found`, abaixo da seção da Lane 11; preserva Lanes 8/9/10/11.

**Não alterados (intencional):** `agent-capability-boundary.ts`, `agent-definition.ts`, `agent-registry-shell.ts`, `role-boundary.ts`, `tenant-context.ts`, `session.ts`, `proxy.ts`, `supabase/*`.

## 4. Batches

| Batch | Conteúdo | Estado |
|---|---|---|
| 12.1 | Product definition (tool/memory boundary, arquitetura de memória preservada) | concluído |
| 12.2 | Minimal implementation (1 helper novo + render) | concluído — lint/build verdes |
| 12.3 | Auth/RLS + UX/Cockpit review | aprovado |
| 12.4 | Runtime validation (browser, humano) | **requer relato humano** |
| 12.5 | Evidence + closure + mapa + checklist + commit único local | após 12.4 |

## 5. Validações obrigatórias

`npm run lint` · `npm run build` · revisão Auth/RLS · revisão UX/Cockpit · validação
runtime/browser por humano do cockpit exibindo: tenant real **YZI OS — Operação Inicial**; role
`viewer`; boundary `viewer`; Agent Registry Shell; capacidades planejadas (Lane 10); limites por
capacidade (Lane 11); **seção de Tool/Memory Boundary**; tools futuras como não conectadas;
memória futura como não ativa (Raw Event / Reflective / Retrieval Evidence / Memory Governance /
Context-Evidence Trace planejadas/não ativas); RAG/Semantic Knowledge separado de memória
operacional; nenhum agente usando memória; nenhuma tool ativa; nenhum MCP/runner; sem erro
visual/hydration; sem token/cookie/OAuth `code` exposto.

## 6. Restrições obrigatórias (non-goals)

Não criar memória operacional real; não criar vector store; não criar embeddings; não criar tabela
de memória; não criar SQL; não alterar schema; não criar policy; não criar tool real; não criar
MCP; não criar runner; não criar agente real; não criar automação; não criar save-memory
automático; não permitir agente decidir o que salvar; não criar memória cross-tenant; não misturar
RAG com memória operacional; não alterar tenant/membership; não usar service role; não ler/imprimir
env/secret/token/cookie/OAuth `code`; não alterar `main`; **não fazer push**; não resolver commit
acidental `9abc33e`; não commitar até a Lane 12 validada; não incluir untracked antigos nem
alterações fora de escopo; não abrir a Lane 13.

## 7. Readiness esperado

- Se tudo validar: `LANE_12_TOOL_MEMORY_BOUNDARY_CLOSED_NO_ACTIVE_TOOLS_MEMORY_VALIDATED`.
- Se runtime pendente: `LANE_12_TOOL_MEMORY_BOUNDARY_IMPLEMENTED_LINT_BUILD_GREEN_RUNTIME_VALIDATION_PENDING_HUMAN`.
