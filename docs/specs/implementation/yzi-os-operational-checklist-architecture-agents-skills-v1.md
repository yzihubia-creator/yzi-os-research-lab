# YZI OS — Operational Checklist: Arquitetura, Agentes e Skills v1

Readiness: `YZI_OS_OPERATIONAL_CHECKLIST_ARCHITECTURE_AGENTS_SKILLS_CREATED`
Modo: SDD Lite + Harness Engineering prático · Branch: `lane-1-6-foundation` · Supabase: `thwsltjcjrvtidhnfukc`

Guia operacional curto: o que existe, quem faz o quê e a ordem daqui para frente. Não reescreve PRD nem histórico. Documentário; não executa nada.

---

## 1. Status por lane

| Lane | Nome | Status |
|---|---|---|
| 1 | Supabase Foundation | concluída — DDL evidenciado |
| 2 | Platform Foundation | concluída — Supabase client TS |
| 3 | Auth & Tenant Boundary | concluída — RLS SELECT (`tenants_select_member`, `memberships_select_own`); baseline limpo |
| 4 | Cockpit Skeleton | concluída — Google OAuth + `/cockpit` protegido + estado vazio honesto |
| 5 | Agent Operations Layer | concluída — cockpit operador-facing; `no_membership` validado |
| 6 | Tenant Bootstrap / Membership | concluída — 1 tenant + 1 membership reais; `tenant_found` validado |
| 7 | Operator Session & Control | concluída — logout/re-login; ciclo validado |
| 8 | Role / Permission Boundary | concluída — fronteira `viewer` legível |
| 9 | Agent Registry Shell | concluída — superfície de existência vazia honesta |
| 10 | Agent Definition (read-only, job-anchored) | concluída — capacidades planejadas "Planejado — não ativo" |
| 11 | Agent Capability Boundary | concluída — limites read-only por capacidade (poderá / ainda não pode / depende de) |
| 12 | Tool / Memory Boundary | concluída — fronteira read-only de tools/memória; arquitetura de memória preservada (Raw Event/Reflective/Retrieval Evidence/Memory Governance/Context-Evidence Trace, não ativas); RAG separado |
| 13 | First Controlled Agent Operation / Dry-run | concluída — primeira operação agentic controlada em dry-run (read-only, sem side effect); conclusão bloqueada para execução real até lanes futuras |
| 14+ | (não abertas) | candidata provável: evolução governada da operação além do dry-run (runner/tool/memória/side effect só sob gates próprios) |

---

## 2. Arquitetura atual

| Camada | Existe hoje | Arquivo principal |
|---|---|---|
| Auth | Google OAuth + sessão SSR (anon key) | `platform/src/lib/auth/session.ts`, `app/auth/`, `app/login/` |
| Proteção de rota | proxy fail-closed em `/cockpit` | `platform/src/proxy.ts` |
| Tenant/membership | 1 tenant + 1 membership reais; leitura via RLS SELECT | `platform/src/lib/tenant/tenant-context.ts` |
| Cockpit | 4 estados honestos (`no_session`/`no_membership`/`tenant_found`/`error`) | `platform/src/app/cockpit/page.tsx` |
| Role/boundary | `viewer` legível (pode / ainda não pode) | `platform/src/lib/tenant/role-boundary.ts` |
| Agent Registry Shell | existência vazia honesta ("Nenhum agente ativo") | `platform/src/lib/agents/agent-registry-shell.ts` |
| Agent Definition | capacidades planejadas job-anchored, read-only | `platform/src/lib/agents/agent-definition.ts` |
| Agent Capability Boundary | limites read-only por capacidade (poderá / ainda não pode / depende de) | `platform/src/lib/agents/agent-capability-boundary.ts` |
| Tool / Memory Boundary | fronteira read-only de tools/memória; arquitetura de memória preservada; RAG separado | `platform/src/lib/agents/tool-memory-boundary.ts` |
| First Controlled Agent Operation | primeira operação agentic em dry-run, read-only, sem side effect; recebe só estado já carregado | `platform/src/lib/agents/controlled-agent-operation.ts` |

**Ainda NÃO existe:** agente real de produção · execução agentic real · MCP · runner · scheduler · tools reais · memória operacional ativa · vector store/embeddings · tabela de memória · tabela `agents` · tabela de runs · side effect externo · policy de escrita · role model amplo · service role no frontend.

---

## 3. Papéis / agentes operacionais

| Papel | Quando entra | Produz | Coda? | Limite |
|---|---|---|---|---|
| Product Architect | abertura/fechamento de lane | objetivo, DoD, scope review, closure gate, mapa | não | só `lanes/`, `specs/`, mapa no fechamento |
| Execution Coordinator | após objetivo | batches, packs, ordem | não | só `packs/` |
| Backend/Supabase Planner | se houver dados/RLS | plano SQL `NOT_EXECUTED` (humano executa) | não | só `sql/`, `decisions/`; nunca executa SQL |
| Frontend Platform Implementer | se houver código | incremento em `platform/src/` + lint/build | **sim, sob gate** | só arquivos do batch; sem `.env`/secret/service role |
| Auth/RLS Reviewer | após código/SQL | parecer (seção do evidence) | não | read-only |
| UX/Cockpit Reviewer | após código | parecer UX (seção do evidence) | não | read-only |
| Evidence Auditor | fim do batch | 1 evidence consolidado | não | só `evidence/` |
| Humano | gates + runtime + SQL | autorizações, execução SQL, validação browser | n/a | única autoridade de gate/push/SQL |

---

## 4. Quem codifica o quê

| Alvo | Quem | Gate |
|---|---|---|
| `platform/` (código) | Frontend Implementer | frase de gate com lista exata de arquivos |
| SQL / schema / policy | Humano (executa); Planner (planeja) | SQL manual no Supabase; nunca via agente/MCP |
| `docs/specs/*` | Architect / Coordinator | abertura de lane |
| `evidence/` | Evidence Auditor | fim de batch verificado |
| mapa operacional | Architect | só no fechamento de lane |
| runtime/browser validation | Humano | relato objetivo obrigatório |

---

## 5. Skills / processos

| Skill / processo | Quando usar |
|---|---|
| `read-approved-specs` | antes de executar — ler apenas specs aprovadas e arquivos permitidos |
| `validate-scope-boundaries` | confirmar que a tarefa está dentro do escopo autorizado |
| `inspect-authorized-paths` | confirmar que os paths tocados são explicitamente permitidos |
| `detect-governance-violation` | parar se boundary/autorização/não-execução for violado |
| `write-evidence-record` | estruturar o evidence do batch/lane |
| SDD Lite | specs definem o quê/limites; packs definem lote executável |
| Execution Program Mode | unidade = batch; consolida evidence; evita microtask |
| Harness boundary review | revisar que não há service role/SQL/MCP/escrita fora de gate |

---

## 6. Ordem padrão de uma lane (daqui para frente)

1. Decisão candidata curta (scope review).
2. Execution program compacto.
3. Implementação mínima (se aplicável).
4. `npm run lint` + `npm run build`.
5. Review Auth/RLS.
6. Review UX/Cockpit.
7. Runtime validation (humano).
8. Evidence final consolidado.
9. Closure gate.
10. Mapa operacional atualizado.
11. Commit único local.
12. Push **apenas** em bloco maior/final autorizado pelo humano.

---

## 7. Regras de parada (parar e pedir humano)

- Validação runtime humana necessária.
- Necessidade de SQL / schema / policy.
- Risco de service role.
- Segredo / token / cookie / OAuth code.
- Falha de lint / build.
- Decisão de produto realmente ambígua.

---

## 8. Próxima ordem sugerida

1. **Lane 13 concluída:** First Controlled Agent Operation em dry-run, validada (read-only; sem side effect; conclusão bloqueada para execução real).
2. **Lane 14 provável:** evolução governada da operação além do dry-run — qualquer runner, tool real, memória operacional ou side effect entra só sob gate próprio.
3. Nada disso abre sem a frase `AUTORIZO ABERTURA DA LANE 14`.

---

`YZI_OS_OPERATIONAL_CHECKLIST_ARCHITECTURE_AGENTS_SKILLS_CREATED`
