# Lane 4 — Cockpit Skeleton: Execution Program v1

## Readiness Statement

`LANE_4_EXECUTION_PROGRAM_DEFINED_DOCUMENTARY_ONLY_NO_EXECUTION_AUTHORIZED`

Este documento é o **plano principal da Lane 4 — Cockpit Skeleton**, promovido a partir do [draft v1](lane-4-cockpit-skeleton-execution-program-draft-v1.md) mediante autorização humana explícita de abertura da lane. **Não executa código, não executa build, não instala dependências, não modifica `platform/`, não executa SQL, não usa MCP.** Conforme a autorização de abertura, **nenhuma execução ocorre até este programa ser revisado pelo humano** — e, após a revisão, cada step ainda exige gate humano próprio.

---

## 1. Autorização Observada

> "EU AUTORIZO A ABERTURA DA LANE 4 — COCKPIT SKELETON, SEM EXECUÇÃO DE CÓDIGO ATÉ O EXECUTION PROGRAM SER REVISADO."

Interpretação registrada:
- A Lane 4 está **aberta** (a frase contém a autorização exigida pelo [closure gate da Lane 3](lane-3-auth-tenant-boundary-closure-gate-v1.md));
- A abertura autoriza **somente a criação documental deste programa e seus artefatos**;
- Execução de qualquer step permanece **bloqueada** até: (a) revisão humana deste programa (gate L4-G0), e (b) gate humano explícito do step correspondente.

---

## 2. Objetivo e Hipótese de Produto

Entregar o **esqueleto mínimo navegável do cockpit do YZI OS** e provar o contrato mínimo:

```
usuário autenticado → sessão → tenant_membership → tenant via RLS
→ cockpit skeleton → estado vazio honesto
```

### Hipótese de Produto

> Se um usuário autenticado consegue entrar no cockpit e ver o tenant ao qual pertence (ou um estado vazio honesto quando não pertence a nenhum), então a fronteira auth/tenant das Lanes 1–3 está correta de ponta a ponta — e cada feature futura é apenas uma nova tela dentro de um shell já confiável.

O cockpit skeleton é deliberadamente vazio de features: seu valor é provar o contrato **uma única vez**, para que nenhuma lane futura precise reprová-lo.

### A Lane 4 NÃO entrega

Produto completo, CRM, dashboard real, CRUD, billing, onboarding completo, multi-tenant avançado, automações, signup/recovery de produção, design system.

---

## 3. Estado Herdado

| Item | Estado confirmado | Fonte |
|------|-------------------|-------|
| `public.tenants` | existe, RLS habilitado, 0 linhas, 1 policy SELECT (`tenants_select_member`) | `lane-3-auth-tenant-boundary-sql-execution-evidence-v1` |
| `public.tenant_memberships` | existe, RLS habilitado, 0 linhas, 1 policy SELECT (`memberships_select_own`) | idem |
| Policies de escrita | nenhuma — escrita via API falha por design | idem |
| Tenants/memberships/seeds reais | nenhum — baseline limpo (0/0/0) | idem |
| `platform/` | Supabase client mínimo em TypeScript (`client.ts`, `server.ts`), sem service role | `platform-lane-2-supabase-client-foundation-evidence-v1` |
| `@supabase/supabase-js@^2.108.1` | instalada; `@supabase/ssr` **não instalada** | idem |
| Linguagem | TypeScript; **Python não autorizado em `platform/`** | `platform-foundation-language-decision-v1` |
| Health/check real | nunca executado — adiado nas Lanes 2 e 3 | `lane-3-auth-tenant-boundary-closure-gate-v1` |
| Auth flow | inexistente | idem |
| MCP | não é rota padrão | mapa operacional |
| SQL | somente manual, pelo humano, quando houver pack próprio | mapa operacional |
| Service role | proibida em `platform/` | mapa operacional |

---

## 4. Lista Fechada de Arquivos Candidatos de `platform/`

Arquivos que **poderão ser tocados futuramente** mediante gate — **nenhum é tocado agora**:

| Arquivo candidato | Step | Condição |
|-------------------|------|----------|
| `platform/src/lib/supabase/health.ts` | Step 3 | gate L4-G1 |
| `platform/src/lib/auth/session.ts` | Step 4 | gate L4-G2 |
| `platform/src/app/login/page.tsx` | Step 4 | gate L4-G2 |
| `platform/src/proxy.ts` | Step 4 | gate L4-G2 (D6 aprovada em L4-G0; convenção Next.js 16: proxy substitui middleware, arquivo dentro de `src/`) |
| `platform/package.json` + lockfile | Step 4 | **somente** se `@supabase/ssr` aprovada em gate próprio |
| `platform/src/lib/tenant/tenant-context.ts` | Step 5 | gate L4-G3 |
| `platform/src/app/cockpit/layout.tsx` | Step 6 | gate L4-G4 |
| `platform/src/app/cockpit/page.tsx` | Step 6 | gate L4-G4 |
| `platform/README.md` | qualquer step | apenas para documentar configuração, se necessário |

Qualquer escrita fora desta lista = `OUT_OF_SCOPE_WRITE` (stop imediato).

---

## 5. Decisões Explícitas (resolvidas ou deixadas como gate)

| # | Decisão | Proposta deste programa | Status |
|---|---------|------------------------|--------|
| D1 | Health/check entra na Lane 4 ou fica separado? | **Entra na Lane 4**, como Step 3 — é o pré-requisito mais barato para provar conectividade antes de qualquer UI | **Decidida em L4-G0: APROVADO** |
| D2 | Auth flow mínimo entra ou só sessão? | **Sessão + login mínimo** (uma página de login, sem signup/recovery/onboarding) — sem sessão real, o contrato RLS é inverificável | **Decidida em L4-G0: APROVADO** |
| D3 | `@supabase/ssr` é necessário agora? | **Sim** para sessão server-side; instalação somente no Step 4 (L4-G2), somente este pacote, com `npm audit` pós-instalação reportado | **Decidida em L4-G0: APROVADA** para o gate L4-G2 |
| D4 | Tenant test/seed temporário será necessário para validar RLS? | Seed temporário via SQL manual (humano), com pack próprio e cleanup obrigatório evidenciado (padrão Lane 3) | **Decidida em L4-G0: NÃO executar agora** — permanece opcional tardio sob gate L4-G5 |
| D5 | Cockpit deve mostrar estado vazio ou tenant real? | **Os dois comportamentos**: skeleton implementa ambos; a validação padrão é **estado vazio honesto** (banco limpo); tenant real só aparece se D4 for aprovada | **Decidida em L4-G0: APROVADO** como validação padrão |
| D6 | Proteção de rota entra agora ou fica para lane posterior? | **Entra de forma mínima no Step 4** (proteção de `/cockpit`) via `platform/src/proxy.ts` — no Next.js 16, proxy substitui middleware | **Decidida em L4-G0: APROVADA** com proxy.ts |

---

## 6. Sequência de Execução (Steps)

```
Step 0  — Revisão humana deste programa (gate L4-G0)
Step 1  — Inspeção read-only de platform/ (sem escrita)
Step 2  — Resolver decisões D3, D4, D6 com o humano (gates)
Step 3  — Implementar health/check, se aprovado (L4-G1)
Step 4  — Implementar sessão/auth mínima (+login, +proxy, +ssr conforme D2/D3/D6) (L4-G2)
Step 5  — Implementar tenant context read, se aprovado (L4-G3)
Step 6  — Implementar cockpit skeleton (L4-G4)
Step 7  — Validar lint/build
Step 8  — Validar comportamento de estado vazio
Step 9  — Registrar evidence final
Step 10 — Atualizar mapa operacional somente no fechamento da Lane 4 (L4-G6)
```

Cada step tem executor, arquivo usado, arquivos tocáveis, comandos permitidos, critério de sucesso e critério de parada detalhados no runbook:
[`runbooks/lane-4-cockpit-skeleton-serial-execution-v1.md`](../runbooks/lane-4-cockpit-skeleton-serial-execution-v1.md).

Uma fase por vez. Evidence registrado antes de qualquer avanço.

---

## 7. Gates Humanos Obrigatórios

| Gate | Trigger | Desbloqueia |
|------|---------|-------------|
| L4-G0 | Humano revisa e aprova este programa | Steps 1–2 (somente leitura e decisão) |
| L4-G1 | Humano autoriza health/check | Step 3 |
| L4-G2 | Humano autoriza sessão/auth mínima (D3/D6 já decididas em L4-G0) | Step 4 |
| L4-G3 | Humano autoriza tenant context read | Step 5 |
| L4-G4 | Humano autoriza cockpit skeleton | Step 6 (Steps 7–8 seguem automaticamente como validação) |
| L4-G5 | Humano decide D4 (seed temporário p/ RLS real) | Pack SQL próprio, fora deste programa |
| L4-G6 | Humano revisa evidence final e aprova fechamento | Step 10 (atualização do mapa + closure) |

Gate = frase explícita do humano no chat. Permanecem insuficientes: "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", "continue".

---

## 8. Critérios de Parada (Stop Conditions)

- Service role key ou secret real em qualquer ponto — `SECRET_EXPOSURE`;
- SQL via agente, MCP ou migration — `UNAUTHORIZED_SQL_EXECUTION`;
- Escrita fora da lista fechada da seção 4 — `OUT_OF_SCOPE_WRITE`;
- Pré-condição da seção 3 não confirmada no Step 1 — `PRECONDITION_FAILED`;
- `npm run lint` ou `npm run build` falhar no Step 7 — `BUILD_FAILURE`;
- Estado vazio exibir dado falso/inventado no Step 8 — `DISHONEST_EMPTY_STATE`;
- Dado de teste residual no banco após validação com seed — `RESIDUAL_TEST_DATA`;
- Python proposto dentro de `platform/` — `LANGUAGE_VIOLATION`;
- Ambiguidade de escopo — bloquear, nunca presumir — `SCOPE_AMBIGUITY`.

---

## 9. Artefatos Deste Programa

### Plano Principal
- `docs/specs/implementation/lanes/lane-4-cockpit-skeleton-execution-program-v1.md` ← este arquivo

### Runbook
- `docs/specs/implementation/runbooks/lane-4-cockpit-skeleton-serial-execution-v1.md`

### Packs (documentais — execução por gate)
- `docs/specs/implementation/packs/lane-4-cockpit-skeleton/01-lane-4-product-boundary-pack-v1.md` — Steps 0–2, gate L4-G0
- `docs/specs/implementation/packs/lane-4-cockpit-skeleton/02-platform-health-check-pack-v1.md` — Step 3, gate L4-G1
- `docs/specs/implementation/packs/lane-4-cockpit-skeleton/03-minimal-auth-session-pack-v1.md` — Step 4, gate L4-G2
- `docs/specs/implementation/packs/lane-4-cockpit-skeleton/04-tenant-context-read-pack-v1.md` — Step 5, gate L4-G3
- `docs/specs/implementation/packs/lane-4-cockpit-skeleton/05-cockpit-skeleton-ui-pack-v1.md` — Steps 6–8, gate L4-G4
- `docs/specs/implementation/packs/lane-4-cockpit-skeleton/06-lane-4-final-evidence-pack-v1.md` — Steps 9–10, gate L4-G6

### Evidence Templates
- `docs/specs/implementation/evidence/templates/lane-4-health-check-evidence-template-v1.md`
- `docs/specs/implementation/evidence/templates/lane-4-auth-session-evidence-template-v1.md`
- `docs/specs/implementation/evidence/templates/lane-4-tenant-context-evidence-template-v1.md`
- `docs/specs/implementation/evidence/templates/lane-4-cockpit-skeleton-evidence-template-v1.md`
- `docs/specs/implementation/evidence/templates/lane-4-final-evidence-template-v1.md`

### Subagent Specs (somente specs — nenhum subagent real)
- `docs/specs/implementation/subagents/lane-4/platform-frontend-planner-agent-spec-v1.md`
- `docs/specs/implementation/subagents/lane-4/auth-session-reviewer-agent-spec-v1.md`
- `docs/specs/implementation/subagents/lane-4/tenant-context-reviewer-agent-spec-v1.md`
- `docs/specs/implementation/subagents/lane-4/cockpit-skeleton-reviewer-agent-spec-v1.md`
- `docs/specs/implementation/subagents/lane-4/evidence-auditor-agent-spec-v1.md`

### Skill Specs (somente specs — nenhuma skill executável)
- `docs/specs/implementation/skills/lane-4/nextjs-16-platform-safety-skill-v1.md`
- `docs/specs/implementation/skills/lane-4/supabase-client-boundary-skill-v1.md`
- `docs/specs/implementation/skills/lane-4/auth-session-minimal-review-skill-v1.md`
- `docs/specs/implementation/skills/lane-4/tenant-context-empty-state-skill-v1.md`
- `docs/specs/implementation/skills/lane-4/cockpit-skeleton-ui-review-skill-v1.md`
- `docs/specs/implementation/skills/lane-4/evidence-compaction-skill-v1.md`

SQLs de seed temporário (D4) **não são criados agora** — serão redigidos em pack SQL próprio somente se o gate L4-G5 for aberto, no padrão da Lane 3.

---

## 10. Riscos

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Proxy (proteção de rota) mal configurado bloqueando tudo ou nada | Média | Step isolado (4) com verificação manual antes de qualquer UI |
| `auth.uid()` NULL em server components sem sessão propagada | Alta | Health/check e tenant-context validados antes do cockpit; estados vazios honestos |
| Escopo de UI inflar ("já que estamos na tela...") | Alta | Lista fechada da seção 4 + proibições; skeleton deliberadamente feio |
| Seed temporário esquecido no banco | Média | Stop `RESIDUAL_TEST_DATA`; cleanup obrigatório evidenciado (padrão Lane 3) |
| `@supabase/ssr` introduzir vulnerabilidades novas | Baixa | `npm audit` pós-instalação; reportar antes de prosseguir |
| Lane 4 virar "auth completa" disfarçada | Média | Login mínimo apenas; signup/recovery proibidos |
| Estado vazio "desonesto" (placeholder fingindo dado real) | Média | Step 8 dedicado + skill spec de empty state |

---

## 11. Definição de Concluído

- [ ] Health/check real executado com sucesso e evidenciado;
- [ ] Usuário autentica via login mínimo e a sessão persiste;
- [ ] `/cockpit` protegido: sem sessão → redirect/bloqueio; com sessão → acesso;
- [ ] Página inicial do cockpit mostra tenant do usuário **ou** estado vazio honesto;
- [ ] `npm run lint` e `npm run build` passando após o último step que tocou `platform/`;
- [ ] Comportamento de estado vazio validado contra banco limpo;
- [ ] (Se D4 aprovada) RLS exercitada fim a fim com seed temporário + cleanup evidenciado;
- [ ] Nenhum secret exposto; service role ausente; Python ausente de `platform/`;
- [ ] Evidence registrado por fase + evidence final;
- [ ] Mapa operacional atualizado **somente no fechamento** (Step 10) e closure gate criado;
- [ ] Gate L4-G6 confirmado pelo humano.

---

## Confirmação de Não-Execução

Este arquivo não executa código, não executa build, não instala dependências, não modifica `platform/`, não executa SQL, não usa MCP, não cria migration, não cria auth flow real, não cria frontend/backend real, não cria seed, não cria subagents reais, não cria skills executáveis, não escreve secrets e não usa service role. A execução permanece bloqueada até o gate L4-G0 e, depois, gate por step.

---

## Final Status

`LANE_4_EXECUTION_PROGRAM_DEFINED_DOCUMENTARY_ONLY_NO_EXECUTION_AUTHORIZED`
