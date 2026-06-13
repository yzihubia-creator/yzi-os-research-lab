# Lane 10 — Agent Definition / Read-only Configuration Layer: Execution Program v1

Projeto Supabase: `thwsltjcjrvtidhnfukc` · Modo: SDD Lite / Execution Program Mode

Programa de execução **enxuto** da Lane 10. Gate de abertura recebido (decisão de produto
humana explícita): abrir a Lane 10 como **Agent Definition / Read-only Configuration Layer**,
com enquadramento **job-anchored** confirmado pelo humano.

---

## 1. Objetivo

Transformar o Agent Registry Shell vazio (Lane 9) numa **configuração declarativa e honesta de
capacidades planejadas**, job-anchored: o operador vê **quais capacidades a operação vai
habilitar**, sua finalidade, status e limites — sem executar agente, sem runner, sem MCP, sem
tool, sem memória, sem policy de escrita, e sem expor agentes como protagonistas.

## 2. Enquadramento aprovado (job-anchored)

`job/capacidade → finalidade → status (Planejado — não ativo) → limites → dependências
futuras`. Lidera pelo resultado; agentes são o motor por baixo; nenhum nome de agente é
apresentado como se já existisse institucionalmente. Título de UI: **"Operação de crescimento —
capacidades planejadas"**. Fonte: Growth OS (operating model / product architecture plan).

## 3. Arquivos

**Criados/alterados (código):**
- `platform/src/lib/agents/agent-definition.ts` — **novo**, helper puro/declarativo/read-only (`getAgentDefinitionConfig()`).
- `platform/src/app/cockpit/page.tsx` — render da camada job-anchored no `tenant_found`; substitui a coluna genérica "O que será habilitado no futuro" (Lane 9) pela seção sourced.

**Não alterados (intencional):** `agent-registry-shell.ts` (Lane 9, empty state + boundary preservados), `role-boundary.ts`, `tenant-context.ts`, `session.ts`, `proxy.ts`, `supabase/*`.

## 4. Batches

| Batch | Conteúdo | Estado |
|---|---|---|
| 10.1 | Product definition (job-anchored, DoD) | concluído |
| 10.2 | Minimal implementation plan (arquivos, incremento UI) | concluído |
| 10.3 | Minimal implementation (helper + render) | concluído |
| 10.4 | Auth/RLS + UX/Cockpit review | aprovado |
| 10.5 | Runtime validation (browser, humano) | **requer relato humano** |
| 10.6 | Evidence + closure + mapa + commit único local | após 10.5 |

## 5. Validações obrigatórias

`npm run lint` · `npm run build` · revisão Auth/RLS · revisão UX/Cockpit · validação
runtime/browser por humano do cockpit exibindo: tenant real; role `viewer`; boundary `viewer`;
Agent Registry Shell; **capacidades planejadas job-anchored**; cada uma "Planejado — não
ativo"; nenhum agente ativo; nenhum botão/ação falsa; nenhum MCP/runner/tool/memória.

## 6. Restrições obrigatórias

Não criar/executar SQL; não alterar schema; não criar tabela `agents`/tenant/membership/seed/
policy; não usar MCP/service role/runner/tool/memória; não criar botão de ativar agente nem
ação falsa; não criar roster de agentes nomeados; não ler/imprimir env/secret/token/cookie/
OAuth `code`; não alterar `main`; **não fazer push**; não commitar até a Lane 10 validada;
não incluir untracked antigos nem alterações fora de escopo; não abrir a Lane 11.

## 7. Readiness esperado

- Se tudo validar: `LANE_10_AGENT_DEFINITION_CONFIGURATION_CLOSED_READ_ONLY_AGENTS_VALIDATED`.
- Se runtime pendente: `LANE_10_AGENT_DEFINITION_CONFIGURATION_IMPLEMENTED_LINT_BUILD_GREEN_RUNTIME_VALIDATION_PENDING_HUMAN`.
