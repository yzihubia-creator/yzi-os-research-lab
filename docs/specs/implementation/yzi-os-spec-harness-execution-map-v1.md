# YZI OS — Spec + Harness Execution Map v1

Status: ativo
Modo: SDD Lite / Execution Pack Mode
Projeto Supabase: `thwsltjcjrvtidhnfukc`

## 1. Propósito

Mapa operacional único que conecta Spec → Execution Pack → Regras de Harness → Execução → Verificação → Evidência → Próximo Pack. Serve para dar clareza de execução, não para adicionar documentação. Qualquer dúvida de "o que fazer agora" deve ser respondida por este arquivo.

## 2. Modo de operação (SDD Lite / Execution Pack Mode)

- Specs definem **o quê** e **limites**; packs definem **um lote pequeno e executável**.
- Cada pack referencia a spec de origem e declara escopo, passos, verificação e evidência esperada.
- Nada é executado sem pack aprovado. Nada vira "próximo passo" sem evidência do passo anterior.
- SQL manual (humano no SQL Editor) é preferido quando mais barato que MCP. MCP só quando necessário.

## 3. Ciclo de execução

1. **Spec aprovada** — documento em `docs/specs/implementation/`.
2. **Execution Pack** — recorte mínimo executável, em `packs/`.
3. **Regras de harness** — verificar restrições do pack antes de executar (seção 5).
4. **Execução** — manual (humano) ou controlada (agente), conforme o pack.
5. **Verificação** — comparar saída real contra o resultado esperado declarado no pack.
6. **Evidência** — registrar saída em `evidence/` antes de qualquer aprovação seguinte.
7. **Próximo pack** — só é criado após a evidência do pack anterior ser analisada.

## 4. Lanes de execução

| Lane | Nome | Estado |
|------|------|--------|
| 0 | Execution Operating Model | concluída — mapa criado |
| 1 | Supabase Foundation | concluída — evidence registrado |
| 2 | Platform Foundation | **concluída — client foundation evidenciado — health/check adiado** |
| 3 | Auth and Tenant Boundary | **concluída — auth/tenant boundary SQL evidenciado — baseline limpo** |
| 4 | Cockpit Skeleton | **concluída — Google OAuth + cockpit skeleton validado — estado vazio honesto** |
| 5 | Agent Operations Layer | **concluída — cockpit operador-facing + estado `no_membership` validado em runtime por humano** |
| 6 | Tenant Bootstrap / Membership Activation Layer | **concluída — 1 tenant + 1 membership reais ativados (manual/humano) — `tenant_found` validado em runtime por humano** |
| 7 | Operator Session & Control Layer | **concluída — logout/session control no cockpit; ciclo `tenant_found → logout → login → re-login → tenant_found` validado em runtime por humano** |
| 8 | Role / Permission Boundary | **concluída — fronteira de permissão `viewer` legível no cockpit; `tenant_found` + role real + boundary validado em runtime por humano** |
| 9 | (a definir) | próxima candidata — não aberta; sem execution program; escopo técnico não definido |

Uma lane por vez. Avanço de lane exige evidência verificada da lane anterior.

## 5. Regras de harness

Harness é governança de execução: restringe o que pode ser executado, como é verificado e como a evidência é registrada. Não é mais documentação.

- Não modificar `platform/`.
- Não executar SQL via agente; SQL é executado manualmente pelo humano.
- Não usar MCP, exceto quando explicitamente autorizado em um pack.
- Não criar migrations.
- Não criar código de backend ou frontend.
- Não criar subagentes.
- Não expandir arquitetura além das specs aprovadas.
- Toda execução produz evidência; execução sem evidência registrada não conta como concluída.
- DDL só é aprovado após análise da evidência de inspeção correspondente.

## 6. Tipos de artefato

| Tipo | Local | Função |
|------|-------|--------|
| Spec | `docs/specs/implementation/*.md` | Define escopo e limites |
| Execution Pack | `docs/specs/implementation/packs/` | Lote mínimo executável |
| Plano SQL manual | `docs/specs/implementation/sql/` | SQL para execução humana |
| Evidência | `docs/specs/implementation/evidence/` | Saída real registrada |
| Mapa operacional | este arquivo | Estado e próxima ação |

## 7. Estado atual do projeto

- Lane 0 foi concluída com a criação deste mapa operacional.
- Lane 1 foi concluída com evidence registrado em `docs/specs/implementation/evidence/supabase-lane-1-foundation-ddl-evidence-v1.md`.
- Nenhuma policy RLS funcional foi criada.
- Nenhum tenant real ou seed foi criado.
- Pack da Lane 2 criado em `docs/specs/implementation/packs/platform-foundation-execution-pack-v1.md`.
- Inspeção read-only da Lane 2 executada e evidenciada em `evidence/platform-lane-2-readonly-inspection-evidence-v1.md`.
- Decisão de linguagem registrada em `decisions/platform-foundation-language-decision-v1.md` — TypeScript, sem Python, SQL manual.
- Task 221 — Supabase Client Foundation executada e evidenciada em `evidence/platform-lane-2-supabase-client-foundation-evidence-v1.md`.
- `platform/` agora possui fundação mínima de Supabase client em TypeScript (`src/lib/supabase/client.ts` e `server.ts`).
- `@supabase/supabase-js@^2.108.1` adicionada como dependência.
- **Lane 2 concluída** por decisão humana explícita sem health/check real.
- **Lane 3 concluída** — núcleo SQL de auth/tenant boundary executado manualmente pelo humano e evidenciado em `evidence/lane-3-auth-tenant-boundary-sql-execution-evidence-v1.md`.
- Policies RLS SELECT criadas e validadas: `tenants_select_member` (em `public.tenants`) e `memberships_select_own` (em `public.tenant_memberships`), ambas para role `authenticated`. Nenhuma policy de escrita criada.
- Tenant de teste da Lane 3 detectado e removido por cleanup manual — baseline limpo: 0 tenants, 0 memberships, 0 tenants de teste remanescentes.
- Closure gate da Lane 3 registrado em `lanes/lane-3-auth-tenant-boundary-closure-gate-v1.md`.
- Health/check real foi deliberadamente adiado novamente — diferido para a Lane 4 ou programa próprio, conforme decisão registrada no closure gate.
- Auth flow, tenants reais e seeds continuam fora de escopo.
- SQL e MCP seguem proibidos até novo pack autorizado.
- Draft do programa da Lane 4 criado em `lanes/lane-4-cockpit-skeleton-execution-program-draft-v1.md` — draft documental, sem execução autorizada.
- Bloco 0 de inspeção SQL foi executado manualmente pelo humano (baseline em `evidence/supabase-project-baseline-evidence-v1.md`).
- MCP em modo restrito; SQL manual é o caminho padrão.
- **Lane 4 concluída** — Cockpit Skeleton validado funcionalmente em runtime: login migrado para Google OAuth, `/auth/callback` trocou `code` por sessão, `/cockpit` acessado com sessão autenticada (protegido pelo proxy do Next 16), `getTenantContext` executou e, com banco limpo, exibiu estado vazio honesto (`no_membership`: "Nenhum tenant ainda"). Sem crash, sem loop, sem overlay de hydration.
- Gates da Lane 4: L4-G1 health/check (corrigido para não consultar tabelas protegidas); L4-G2 auth/session/login/proxy (login migrado para Google OAuth); L4-G3 tenant context read; L4-G4 cockpit skeleton UI. Overlay de hydration corrigido com `suppressHydrationWarning` no `<html>` (Task 243).
- Evidence final da Lane 4 registrado em `evidence/lane-4-cockpit-skeleton-final-evidence-v1.md`.
- Closure gate da Lane 4 registrado em `lanes/lane-4-cockpit-skeleton-closure-gate-v1.md`.
- Nenhum tenant/membership/seed criado; nenhum SQL executado; MCP não usado; service role não usada; nenhum secret/token/cookie/OAuth code impresso. Baseline segue limpo: 0 tenants, 0 memberships.
- **Lane 5 concluída** — Agent Operations Layer: o cockpit autenticado deixou de ser tela vazia muda e passou a superfície operador-facing mínima. Batches: 5.1 product surface (`2a67e75`), 5.2 cockpit operational states design (`9803825`), 5.3 minimal UI plan (`f114cbf`) → implementação `page.tsx` (`64d1c61`) → evidence (`e19bfce`), 5.4 runtime validation blocked-by-environment (`704f449`) → runtime `no_membership` validado por humano (`d9f6e3d`).
- Produto entregue na Lane 5: cockpit operador-facing; estado `no_membership` real; operador autenticado visível; membership/tenant boundary explicado; base agentic nomeada como vazia/indisponível; sem dados inventados; sem `slug`/`id` cru como produto; cockpit não virou console técnico.
- Validações da Lane 5: `lint` verde; `build` verde; Auth/RLS aprovado; UX/Cockpit aprovado; runtime/browser `no_membership` validado por humano com banco limpo (`tenant_memberships` vazio); sem token/cookie/OAuth code colado em evidências.
- Remanescentes não bloqueantes da Lane 5: `tenant_found` não exercitado com tenant real; logout/encerrar sessão não implementado; dupla chamada `getUser()` por render (risco menor/performance). Diferidos a lanes futuras.
- Closure gate da Lane 5 registrado em `lanes/lane-5-agent-operations-layer-closure-gate-v1.md`. Readiness final: `LANE_5_AGENT_OPERATIONS_LAYER_CLOSED_NO_MEMBERSHIP_VALIDATED`.
- Nenhum tenant/membership/seed real criado na Lane 5; nenhum agente/subagent/MCP/runner; nenhum SQL; nenhuma policy de escrita; service role não usada. Baseline segue limpo: 0 tenants, 0 memberships.
- **Lane 6 concluída** — Tenant Bootstrap / Membership Activation Layer: criado o primeiro caminho governado, reversível e auditável para ativar **1 tenant real + 1 membership real** do operador validado, exercitando `tenant_found` real em runtime. Batches: 6.1 product definition (`7392a86`), 6.2 SQL manual activation plan (`fdda440`), 6.3 Auth/RLS review (`fee8124`), 6.4 human SQL execution evidence (`6965f2e`), 6.5 runtime `tenant_found` validation — bloqueio de ambiente → validado por humano (`c18fc39`). Execution program: `529bb12`.
- Produto entregue na Lane 6: primeiro tenant real `YZI OS — Operação Inicial`; primeira membership real (role `viewer`, status `active`); operador saiu de `no_membership` para `tenant_found`; cockpit renderizou o tenant real em runtime; base agentic continua vazia/honesta; nenhum agente real ou simulado; nenhum `slug`/`id` cru como produto.
- Decisões de governança da Lane 6: bootstrap via Supabase SQL Editor humano/manual; **nenhuma policy de escrita criada**; frontend permanece read-only (anon key + RLS); role inicial `viewer`; rollback documentado (não executado — ativação validada/mantida); nenhum seed permanente; nenhum service role no frontend.
- Validações da Lane 6: Auth/RLS aprovado; SQL executado apenas por humano; 1 tenant / 1 membership; role `viewer`; `tenant_found` validado no cockpit por observação humana; `no_membership` deixou de aparecer para o operador validado; sem `e-mail`/`UUID`/`token`/`cookie`/OAuth `code` versionado.
- Remanescentes não bloqueantes da Lane 6: logout/encerrar sessão ainda não implementado; `tenant_found` validado para 1 operador/1 tenant apenas; role `viewer` ainda sem matriz funcional ampla; agent registry e operação agentic real continuam fora de escopo; rollback existe mas não foi executado (ativação validada). Diferidos a lanes futuras.
- Closure gate da Lane 6 registrado em `lanes/lane-6-tenant-bootstrap-membership-activation-closure-gate-v1.md`. Readiness final: `LANE_6_TENANT_BOOTSTRAP_MEMBERSHIP_ACTIVATION_CLOSED_TENANT_FOUND_VALIDATED`.
- Nenhum agente/subagent/MCP/runner criado na Lane 6; nenhuma policy de escrita; nenhum seed permanente; service role não usada no frontend. Estado de dados: **1 tenant + 1 membership reais ativos** (ativação reversível; baseline 0/0 é estado de retorno documentado).
- **Lane 7 concluída** — Operator Session & Control Layer: fechado o controle básico de sessão do operador no cockpit. Batches: 7.1 product definition; 7.2 minimal logout/session UX plan; 7.3 minimal implementation (`platform/src/app/cockpit/page.tsx`, lint/build verdes); 7.4 Auth/session + UX/Cockpit review aprovados; 7.5 runtime validado por humano; 7.6 evidence + closure + mapa. Execution program: `lanes/lane-7-operator-session-control-layer-execution-program-v1.md`. Revisão de escopo: `lanes/lane-7-product-scope-candidate-review-v1.md`.
- Produto entregue na Lane 7: logout funcional a partir do `/cockpit` (Server Action `signOutOperator` via `supabase.auth.signOut()`, anon key, simétrico ao login Google OAuth) + controle "Encerrar sessão" nos estados autenticados; re-login recuperando `tenant_found`. Fluxo validado: **`tenant_found → logout → login → re-login → tenant_found`**, tenant `YZI OS — Operação Inicial` preservado.
- Decisões de governança da Lane 7: frontend-only (único arquivo de código: `cockpit/page.tsx`); apenas valores públicos (anon key), nenhum service role; `proxy.ts` inalterado (`/cockpit` segue protegido, fail-closed); nenhum SQL/schema/tenant/membership/policy tocado; nenhum token/cookie/OAuth `code` versionado.
- Validações da Lane 7: `lint` verde; `build` verde (Next.js 16.2.9; `ƒ /cockpit` server-rendered; Proxy ativo); Auth/session review aprovado; UX/Cockpit review aprovado; runtime humano validado (sem erro visual/hydration/loop/stack; sem token/cookie/OAuth `code` exposto).
- Remanescentes não bloqueantes da Lane 7: Agent Registry, tools/memória e agentes reais ainda não criados; role model amplo ainda não criado (`viewer` mantido); `main` canonicalization ainda diferida; commit acidental local `9abc33e` ainda diferido. Diferidos a decisões/lanes futuras.
- Closure gate da Lane 7 registrado em `lanes/lane-7-operator-session-control-layer-closure-gate-v1.md`. Readiness final: `LANE_7_OPERATOR_SESSION_CONTROL_CLOSED_LOGOUT_RELOGIN_TENANT_FOUND_VALIDATED`.
- Nenhum agente/registry/tool/memória/MCP/runner criado na Lane 7; nenhum SQL; nenhuma policy; service role não usada. Estado de dados inalterado: **1 tenant + 1 membership reais ativos**.
- **Lane 8 concluída** — Role / Permission Boundary: o cockpit passou a exibir, no `tenant_found`, a **fronteira de permissão legível** do operador. Batches: 8.1 product definition; 8.2 minimal implementation plan; 8.3 minimal implementation (`platform/src/lib/tenant/role-boundary.ts` novo, `platform/src/lib/tenant/tenant-context.ts`, `platform/src/app/cockpit/page.tsx`, lint/build verdes); 8.4 Auth/RLS + UX/Cockpit review aprovados; 8.5 runtime validado por humano; 8.6 evidence + closure + mapa + commit único. Execution program: `lanes/lane-8-role-permission-boundary-execution-program-v1.md`. Revisão de escopo: `lanes/lane-8-product-scope-candidate-review-v1.md`.
- Produto entregue na Lane 8: papel real do operador (`viewer`) exibido de forma humana ("Viewer — observador") + fronteira honesta "pode / ainda não pode" (pode: ver operação, ver vínculo, encerrar sessão | ainda não pode: escrever dados, operar agentes, administrar tenant). Sem ação falsa, sem botão inoperante, sem `id`/`slug` cru.
- Decisões de governança da Lane 8: read-only/declarativo; papel via RLS SELECT `memberships_select_own` (`select("tenant_id")` → `select("tenant_id, role")`, **mesma** policy); nenhuma policy nova, nenhum schema novo, nenhum INSERT/UPDATE/DELETE; sem service role, sem MCP, sem SQL; nenhuma capacidade de owner/admin/operator fabricada.
- Validações da Lane 8: `lint` verde; `build` verde (Next.js 16.2.9; `ƒ /cockpit` server-rendered); Auth/RLS aprovado; UX/Cockpit aprovado; runtime humano validado (tenant **YZI OS — Operação Inicial** + role `viewer` + boundary legível; base agentic vazia; sem token/cookie/OAuth `code` exposto).
- Remanescentes não bloqueantes da Lane 8: Agent Registry, tools/memória e agentes reais ainda não criados; role model amplo ainda não criado (`viewer` exibido); policies de escrita ainda não criadas; `main` canonicalization ainda diferida; commit acidental local `9abc33e` ainda diferido. Diferidos a decisões/lanes futuras.
- Closure gate da Lane 8 registrado em `lanes/lane-8-role-permission-boundary-closure-gate-v1.md`. Evidence: `evidence/lane-8-role-permission-boundary-validated-evidence-v1.md`. Readiness final: `LANE_8_ROLE_PERMISSION_BOUNDARY_CLOSED_VIEWER_BOUNDARY_VALIDATED`.
- Nenhum agente/registry/tool/memória/MCP/runner criado na Lane 8; nenhum SQL; nenhuma policy; service role não usada. Estado de dados inalterado: **1 tenant + 1 membership reais ativos**.

## 8. Próxima ação

**Decidir sobre a abertura da Lane 9 — próxima candidata (não aberta).**

A Lane 8 — Role / Permission Boundary está concluída e evidenciada; seu fechamento está em `docs/specs/implementation/lanes/lane-8-role-permission-boundary-closure-gate-v1.md` (readiness `LANE_8_ROLE_PERMISSION_BOUNDARY_CLOSED_VIEWER_BOUNDARY_VALIDATED`). A **Lane 9 permanece não aberta**, sem execution program e sem escopo técnico definido além de "próxima candidata". Sua abertura exige a frase de autorização explícita definida no closure gate da Lane 8 (`AUTORIZO ABERTURA DA LANE 9`). Critério de saída: decisão humana explícita; nenhuma execução (código, SQL, MCP, alteração de `platform/`) ocorre antes desse gate.
