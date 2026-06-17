# Lane 3 — Auth and Tenant Boundary: Execution Program v1

## Readiness Statement

`LANE_3_EXECUTION_PROGRAM_DEFINED_DOCUMENTARY_ONLY_NO_EXECUTION_AUTHORIZED`

Este documento é o **plano principal da Lane 3 — Auth and Tenant Boundary**. Define objetivo, estado herdado, decisões pendentes, sequência completa, gates humanos, ordem de execução, critérios de parada, arquivos produzidos, riscos e definição de concluído. **Não executa código, não modifica `platform/`, não executa SQL, não usa MCP.** Toda execução futura exige gate humano explícito por fase.

---

## 1. Objetivo

Estabelecer a **fronteira de auth e tenant** do YZI OS com:

- Policies RLS SELECT mínimas nas tabelas `public.tenants` e `public.tenant_memberships`;
- Validação SQL pós-policy executada manualmente pelo humano;
- Health/check mínimo de conectividade TypeScript contra o Supabase real (diferido da Lane 2);
- Evidence registrado por fase antes de qualquer avanço.

A Lane 3 **não entrega**:
- UI de login, signup, perfil ou cockpit;
- INSERT/UPDATE/DELETE policies;
- tenant real, seed de produção ou cliente real;
- backend ou frontend de negócio;
- auth completa de produção.

---

## 2. Estado Herdado

| Item | Estado confirmado | Fonte |
|------|-------------------|-------|
| `public.tenants` | existe, RLS habilitado, 0 linhas, 0 policies | `supabase-lane-1-foundation-ddl-evidence-v1` |
| `public.tenant_memberships` | existe, RLS habilitado, 0 linhas, 0 policies | `supabase-lane-1-foundation-ddl-evidence-v1` |
| FK `tenant_memberships.tenant_id → tenants.id` | ON DELETE CASCADE confirmada | `supabase-lane-1-foundation-ddl-evidence-v1` |
| FK `tenant_memberships.user_id → auth.users(id)` | ON DELETE CASCADE confirmada | `supabase-lane-1-foundation-ddl-evidence-v1` |
| `platform/src/lib/supabase/client.ts` | existe, sem service role | `platform-lane-2-supabase-client-foundation-evidence-v1` |
| `platform/src/lib/supabase/server.ts` | existe, sem service role | `platform-lane-2-supabase-client-foundation-evidence-v1` |
| `@supabase/supabase-js@^2.108.1` | instalada | `platform-lane-2-supabase-client-foundation-evidence-v1` |
| Policies RLS | nenhuma — tabelas inacessíveis via API (estado intencional) | `supabase-lane-1-foundation-ddl-evidence-v1` |
| Health/check real | adiado deliberadamente na Lane 2 | `platform-lane-2-supabase-client-foundation-evidence-v1` |
| Tenant real ou seed | nenhum | ambos os evidences acima |
| `npm audit` | 2 vulnerabilidades moderadas — pendente de avaliação humana | `platform-lane-2-supabase-client-foundation-evidence-v1` |

---

## 3. Decisões Pendentes de Gate Humano

| Decisão | Quando decidir | Impacto se não decidido |
|---------|---------------|-------------------------|
| Executar health/check mínimo (`health.ts`) | Antes da fase 3.4 | Health/check fica fora da Lane 3 |
| Instalar `@supabase/ssr` | Antes da fase 3.5, se ausente | Middleware de sessão bloqueado |
| Executar auth session middleware (`middleware.ts`) | Antes da fase 3.5 | Proteção de rotas não ativa nesta lane |
| Executar resolução de contexto de tenant (`tenant-context.ts`) | Antes da fase 3.6 | Resolução de tenant fica para lane posterior |
| Executar seed de teste (`03-optional-test-seed.sql`) | A qualquer momento após policies | Validação funcional fica pendente |
| Corrigir vulnerabilidades `npm audit` | Gate separado, antes de fix | Vulnerabilidades moderadas permanecem |

---

## 4. Sequência Completa de Execução

```
Step 0  — Revisar este programa (humano)
Step 1  — Executar SQL preflight manual (humano, SQL Editor)
Step 2  — Validar output do preflight e reportar (humano → Claude)
Step 3  — Executar SQL de RLS policies manual (humano, SQL Editor)
Step 4  — Executar SQL de validação pós-policy manual (humano, SQL Editor)
Step 5  — Decidir seed/test user (gate humano)
Step 6  — Decidir health/check TypeScript (gate humano)
Step 7  — Registrar evidence final da Lane 3
Step 8  — Atualizar mapa operacional (somente após revisão humana)
```

Cada step tem: quem executa, arquivo usado, critério de sucesso e critério de parada.
O runbook completo está em `docs/specs/implementation/runbooks/lane-3-auth-tenant-boundary-serial-execution-v1.md`.

---

## 5. Gates Humanos Obrigatórios

| Gate | Trigger | O que é desbloqueado |
|------|---------|----------------------|
| Gate L3-G1 | Humano aprova execução do preflight SQL | Step 1 |
| Gate L3-G2 | Humano reporta output do preflight e aprova policies | Step 3 |
| Gate L3-G3 | Humano reporta output das policies e aprova validação pós-policy | Step 4 |
| Gate L3-G4 | Humano decide sobre seed de teste | Step 5 (opcional) |
| Gate L3-G5 | Humano decide sobre health/check TypeScript | Step 6 (opcional nesta lane) |
| Gate L3-G6 | Humano revisa evidence final e aprova encerramento da Lane 3 | Step 8 |

Nenhum step começa sem o gate correspondente. Gate = frase explícita do humano no chat.

---

## 6. Ordem de Execução por Pack

| Ordem | Pack | Arquivo | Gate requerido |
|-------|------|---------|---------------|
| 1 | Pack 01 — Design | `01-auth-tenant-boundary-design-pack-v1.md` | L3-G1 |
| 2 | Pack 02 — RLS SQL | `02-rls-policy-sql-pack-v1.md` | L3-G2 |
| 3 | Pack 03 — Validação SQL | `03-manual-sql-validation-pack-v1.md` | L3-G3 |
| 4 | Pack 04 — Health Check | `04-platform-health-check-pack-v1.md` | L3-G5 (opcional) |
| 5 | Pack 05 — Evidence Final | `05-lane-3-final-evidence-pack-v1.md` | L3-G6 |

---

## 7. Critérios de Parada (Stop Conditions)

Parar imediatamente e reportar ao humano se:

- Qualquer passo exigir **service role key** ou secret real — `SECRET_EXPOSURE`;
- SQL for executado via agente, MCP ou migration — `UNAUTHORIZED_SQL_EXECUTION`;
- Arquivo fora da lista fechada for tocado — `OUT_OF_SCOPE_WRITE`;
- Pré-condição da seção 2 não se confirmar na inspeção — `PRECONDITION_FAILED`;
- Output SQL do humano indicar erro ou estado inesperado — `SQL_OUTPUT_ERROR`;
- `npm run build` falhar após qualquer escrita — `BUILD_FAILURE`;
- Ambiguidade de escopo — bloquear, nunca presumir — `SCOPE_AMBIGUITY`.

---

## 8. Arquivos Produzidos por Este Programa

### Plano Principal
- `docs/specs/implementation/lanes/lane-3-auth-tenant-boundary-execution-program-v1.md` ← este arquivo

### Packs
- `docs/specs/implementation/packs/lane-3-auth-tenant-boundary/01-auth-tenant-boundary-design-pack-v1.md`
- `docs/specs/implementation/packs/lane-3-auth-tenant-boundary/02-rls-policy-sql-pack-v1.md`
- `docs/specs/implementation/packs/lane-3-auth-tenant-boundary/03-manual-sql-validation-pack-v1.md`
- `docs/specs/implementation/packs/lane-3-auth-tenant-boundary/04-platform-health-check-pack-v1.md`
- `docs/specs/implementation/packs/lane-3-auth-tenant-boundary/05-lane-3-final-evidence-pack-v1.md`

### SQLs Manuais
- `docs/specs/implementation/sql/lane-3-auth-tenant-boundary/00-preflight-inspection.sql`
- `docs/specs/implementation/sql/lane-3-auth-tenant-boundary/01-rls-policies.sql`
- `docs/specs/implementation/sql/lane-3-auth-tenant-boundary/02-post-policy-validation.sql`
- `docs/specs/implementation/sql/lane-3-auth-tenant-boundary/03-optional-test-seed.sql`

### Evidence Templates
- `docs/specs/implementation/evidence/templates/lane-3-sql-execution-evidence-template-v1.md`
- `docs/specs/implementation/evidence/templates/lane-3-policy-validation-evidence-template-v1.md`
- `docs/specs/implementation/evidence/templates/lane-3-health-check-evidence-template-v1.md`
- `docs/specs/implementation/evidence/templates/lane-3-final-evidence-template-v1.md`

### Subagent Specs
- `docs/specs/implementation/subagents/lane-3/supabase-sql-planner-agent-spec-v1.md`
- `docs/specs/implementation/subagents/lane-3/rls-policy-reviewer-agent-spec-v1.md`
- `docs/specs/implementation/subagents/lane-3/platform-health-check-reviewer-agent-spec-v1.md`
- `docs/specs/implementation/subagents/lane-3/evidence-auditor-agent-spec-v1.md`

### Skill Specs
- `docs/specs/implementation/skills/lane-3/manual-sql-safety-review-skill-v1.md`
- `docs/specs/implementation/skills/lane-3/rls-policy-validation-skill-v1.md`
- `docs/specs/implementation/skills/lane-3/supabase-auth-boundary-review-skill-v1.md`
- `docs/specs/implementation/skills/lane-3/evidence-compaction-skill-v1.md`

### Runbook de Execução Seriada
- `docs/specs/implementation/runbooks/lane-3-auth-tenant-boundary-serial-execution-v1.md`

---

## 9. Riscos

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| RLS policies mal escritas bloqueando acesso legítimo | Média | Usar somente policies SELECT mínimas; validar via SQL pós-policy |
| `auth.uid()` retornar NULL em contexto server-side sem sessão | Alta | Policies devem tolerar NULL (comportamento padrão: não acessível sem auth) |
| `@supabase/ssr` ausente ao criar middleware | Baixa | Verificar em preflight; instalar somente com gate humano |
| Output SQL do humano incompleto ou ambíguo | Média | Template de evidence força captura de todo output relevante |
| Vulnerabilidades `npm audit` piorarem após instalação de `@supabase/ssr` | Baixa | Executar `npm audit` pós-instalação; reportar antes de prosseguir |
| Seed de teste inserir dados em tenant que não existe | Alta se mal sequenciado | Seed separado (`03-optional-test-seed.sql`), só após policies; seed cria próprio tenant de teste |
| Service role vazar em output de log | Baixa | Regra absoluta: service role proibida em todo escopo desta lane |

---

## 10. Definição de Concluído

A Lane 3 está concluída quando **todas** as condições abaixo forem verdadeiras:

- [ ] Preflight SQL executado e output reportado sem erros;
- [ ] Policies RLS `tenants_select_member` e `memberships_select_own` existem e estão ativas;
- [ ] Validação pós-policy executada e output reportado confirmando policies;
- [ ] Evidence registrado para cada fase executada;
- [ ] Nenhum secret exposto em nenhum arquivo ou output;
- [ ] `platform/` não alterado sem gate humano;
- [ ] Mapa operacional atualizado para refletir Lane 3 como concluída;
- [ ] Gate L3-G6 confirmado pelo humano.

Health/check e seed são **opcionais** — a lane pode ser declarada concluída sem eles mediante decisão humana explícita.

---

## Confirmação de Não-Execução

Este arquivo não executa SQL, não usa MCP, não modifica `platform/`, não instala dependências, não cria migrations, não cria subagents, não cria skills executáveis e não autoriza execução de nenhuma fase futura. A execução de cada fase exige gate humano explícito.

---

## Final Status

`LANE_3_EXECUTION_PROGRAM_DEFINED_DOCUMENTARY_ONLY_NO_EXECUTION_AUTHORIZED`
