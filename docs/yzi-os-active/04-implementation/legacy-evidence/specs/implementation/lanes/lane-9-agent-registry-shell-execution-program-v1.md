# Lane 9 — Agent Registry Shell / Agent Existence Layer: Execution Program v1

Projeto Supabase: `thwsltjcjrvtidhnfukc` · Modo: SDD Lite / Execution Program Mode

Programa de execução **enxuto** da Lane 9. Gate de abertura recebido (decisão de produto
humana explícita): abrir a Lane 9 como **Agent Registry Shell / Agent Existence Layer** e
executá-la completa em sequência controlada. Este documento descreve o recorte; a execução
real produz evidência e closure próprios.

---

## 1. Objetivo

Criar a primeira superfície completa e honesta de **existência de agentes** no cockpit: o
operador (autenticado, tenant real, role `viewer`) vê a área de Agent Registry **vazia e
governada**, entende que nenhum agente está ativo, e vê as capacidades futuras — sem executar
agente, sem runner, sem MCP, sem tools, sem memória, sem automação.

## 2. Fluxo esperado

`tenant_found` → operador vê tenant real → vê role `viewer` → vê **Agent Registry Shell** →
entende que ainda não há agentes ativos → nenhuma execução agentic acontece.

## 3. Escopo autorizado

| # | Conteúdo | Tipo |
|---|---|---|
| 1 | Superfície visual no cockpit (`tenant_found`) | UI estática |
| 2 | Estado vazio honesto de agentes | UI estática |
| 3 | Fronteira de capacidades (o que a área não faz) | UI estática |
| 4 | Capacidades futuras declarativas, não-executáveis | UI estática |
| 5 | Helper declarativo puro | Código (pure) |
| 6 | Docs da lane (scope, este programa, evidence, closure) | Documentário |
| 7 | Mapa operacional atualizado | Documentário |

## 4. Arquivos

**Criados/alterados (código):**
- `platform/src/lib/agents/agent-registry-shell.ts` — **novo**, helper puro/declarativo/read-only.
- `platform/src/app/cockpit/page.tsx` — render do registry shell no estado `tenant_found`.

**Não alterados (intencional):** `role-boundary.ts`, `tenant-context.ts`, `session.ts`,
`proxy.ts`, `supabase/*` — a fronteira "ainda não pode operar agentes" já era honesta e
permanece verdadeira.

## 5. Batches

| Batch | Conteúdo | Estado |
|---|---|---|
| 9.1 | Product definition (scope review, DoD) | concluído |
| 9.2 | Minimal implementation plan (arquivos, incremento UI) | concluído |
| 9.3 | Minimal implementation (helper + render) | concluído |
| 9.4 | Auth/RLS + UX/Cockpit review | aprovado |
| 9.5 | Runtime validation (browser, humano) | **requer relato humano** |
| 9.6 | Evidence + closure + mapa + commit único | após 9.5 |

## 6. Validações obrigatórias

`npm run lint` · `npm run build` · revisão Auth/RLS · revisão UX/Cockpit · validação
runtime/browser por humano do cockpit exibindo: tenant real; operador autenticado; role
`viewer`; boundary `viewer`; Agent Registry Shell; estado vazio honesto; nenhuma ação falsa;
nenhum agente ativo; nenhum MCP/runner/tool/memória.

## 7. Restrições obrigatórias

Não criar/executar SQL; não alterar schema; não criar tabela `agents`/tenant/membership/seed/
policy; não usar MCP/service role/runner/tool/memória; não ler/imprimir env/secret/token/
cookie/OAuth `code`; não alterar `main`; não fazer push; não commitar até a Lane 9 validada/
consolidada; não incluir untracked antigos nem alterações fora de escopo; não abrir a Lane 10.

## 8. Readiness esperado

- Se tudo validar: `LANE_9_AGENT_REGISTRY_SHELL_CLOSED_EMPTY_REGISTRY_VALIDATED`.
- Se runtime pendente: `LANE_9_AGENT_REGISTRY_SHELL_IMPLEMENTED_LINT_BUILD_GREEN_RUNTIME_VALIDATION_PENDING_HUMAN`.
