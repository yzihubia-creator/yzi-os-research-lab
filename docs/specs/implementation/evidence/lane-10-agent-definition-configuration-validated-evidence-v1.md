# Lane 10 — Agent Definition / Read-only Configuration Layer: Evidence v1

Projeto Supabase: `thwsltjcjrvtidhnfukc` · Data: 2026-06-13 · Papel: Evidence Auditor

Registro de evidência da Lane 10 — Agent Definition / Read-only Configuration Layer.
Documentário: não executa código, não executa SQL, não usa MCP, não altera `platform/`
adicionalmente, não usa service role, não versiona token/cookie/OAuth `code`.

**Estado deste registro:** **consolidado/validado.** Implementação concluída; `lint`/`build`
verdes; Auth/RLS e UX/Cockpit aprovados; **validação runtime/browser confirmada por relato
humano** (seção 8).

---

## 1. Escopo da Lane 10

Transformar o Agent Registry Shell vazio (Lane 9) numa configuração **declarativa, honesta e
job-anchored** de capacidades planejadas: no `tenant_found`, o operador vê quais capacidades a
operação vai habilitar, com finalidade, status e limites — sem executar agente, sem runner, sem
MCP, sem tool, sem memória, sem policy de escrita, sem expor agentes como protagonistas.

## 2. Arquivos de código alterados/criados

| Arquivo | Mudança |
|---|---|
| `platform/src/lib/agents/agent-definition.ts` | **novo** — helper puro/declarativo/read-only: `getAgentDefinitionConfig()` → `{ title, intro, status, capabilities, limits, dependency }`. Sem query, sem env, sem schema, sem escrita. |
| `platform/src/app/cockpit/page.tsx` | render da camada job-anchored no `tenant_found`; substitui a coluna genérica "O que será habilitado no futuro" (Lane 9) pela seção sourced "Operação de crescimento — capacidades planejadas". |

Docs: `lane-10-product-scope-candidate-review-v1.md`, `lane-10-agent-definition-configuration-execution-program-v1.md`.

## 3. Decisão de produto job-anchored (sourced)

O PRD §24 não traz roster de agentes nomeados; o Growth OS define **módulos** e **jobs**, com
agentes como motor por baixo e regra "Lead with the operator, not the OS". Decisão humana:
declarar capacidades **pelo resultado/job**, nunca por nomes de agentes. Capacidades exibidas:
Qualificação de oportunidades · Radar de oportunidades · Follow-up operacional · Nutrição e
reativação · Memória operacional futura · Supervisão executiva.

## 4. Estado honesto de cada capacidade

Cada capacidade traz a finalidade + selo **"Planejado — não ativo"**. Bloco de limites único
(vale para todas): não executa automaticamente; nenhum agente rodando; sem MCP/runner/tool/
memória; não decide, não escreve, não toca o tenant. Dependência: cada capacidade depende de
lanes futuras (com seus próprios gates).

## 5. Ausências confirmadas (verdade de produto)

- **Nenhum agente real** criado; nenhum nome de agente apresentado como existente.
- **Nenhum runner, MCP, tool ou memória operacional**.
- **Nenhum SQL/schema/tabela `agents`/policy de escrita**.
- **Nenhum botão de ativar agente** nem ação falsa; superfície 100% leitura.
- Cockpit **não virou toolkit/console técnico** — lidera pelo resultado.

## 6. Preservação de tenant/membership e role

- **Tenant/membership preservados** — nenhuma escrita; helper não depende de dados.
- **Role `viewer` e boundary preservados** — `role-boundary.ts` intacto.
- **Agent Registry Shell (Lane 9) preservado** — empty state + boundary mantidos.
- **Tenant boundary RLS preservado** — `page.tsx` segue só com `getTenantContext()` + `getSessionUser()`; `proxy.ts` inalterado.

## 7. Lint / Build

- `npm run lint` — **verde** (sem violações).
- `npm run build` — **verde** (Next.js 16.2.9 / Turbopack; TypeScript ok; `ƒ /cockpit` server-rendered; 7/7 páginas).

## 8. Validação runtime — VALIDADA (relato humano)

Relato humano (2026-06-13), `/cockpit` autenticado — todos os pontos confirmados:

- [x] `/cockpit` abriu autenticado;
- [x] tenant exibido: **YZI OS — Operação Inicial**;
- [x] role **viewer** + boundary `viewer` preservados;
- [x] **Agent Registry Shell** preservado (estado vazio honesto);
- [x] seção **"Operação de crescimento — capacidades planejadas"** apareceu;
- [x] as 6 capacidades aparecem (Qualificação · Radar · Follow-up · Nutrição e reativação · Memória operacional futura · Supervisão executiva);
- [x] cada capacidade marcada **"Planejado — não ativo"**;
- [x] nenhum agente ativo; nenhum botão/ação falsa;
- [x] nenhum MCP/runner/tool/memória; cockpit **não** virou console técnico;
- [x] sem erro visual/hydration overlay;
- [x] sem token/cookie/OAuth `code` exposto na tela.

## 9. Ausência de roster inventado

Confirmado: **nenhum roster de agentes nomeados foi inventado**. A superfície é job-anchored —
lidera por resultado/capacidade; agentes permanecem como motor por baixo, não-nomeados,
"Planejado — não ativo". Decisão de produto registrada também em memória de projeto.

---

## Final Status

`LANE_10_AGENT_DEFINITION_CONFIGURATION_CLOSED_READ_ONLY_AGENTS_VALIDATED`
