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
| 6 | (a definir) | próxima candidata — não aberta; sem execution program; escopo técnico não definido |

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

## 8. Próxima ação

**Decidir sobre a abertura da Lane 6 — próxima candidata (não aberta).**

A Lane 5 — Agent Operations Layer está concluída e evidenciada; seu fechamento está em `docs/specs/implementation/lanes/lane-5-agent-operations-layer-closure-gate-v1.md` (readiness `LANE_5_AGENT_OPERATIONS_LAYER_CLOSED_NO_MEMBERSHIP_VALIDATED`). A **Lane 6 permanece não aberta**, sem execution program e sem escopo técnico definido além de "próxima candidata". Sua abertura exige a frase de autorização explícita definida no closure gate da Lane 5. Critério de saída: decisão humana explícita; nenhuma execução (código, SQL, MCP, alteração de `platform/`) ocorre antes desse gate.
