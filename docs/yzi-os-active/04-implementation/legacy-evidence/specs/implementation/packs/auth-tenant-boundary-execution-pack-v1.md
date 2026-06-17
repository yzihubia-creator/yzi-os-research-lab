# Auth and Tenant Boundary Execution Pack v1

## Readiness Statement

`AUTH_TENANT_BOUNDARY_EXECUTION_PACK_V1_CREATED_DOCUMENTARY_ONLY_EXECUTION_NOT_AUTHORIZED`

Este documento é a **definição documental** do Execution Pack da Lane 3 — Auth and Tenant Boundary, conforme o mapa operacional [`yzi-os-spec-harness-execution-map-v1`](../yzi-os-spec-harness-execution-map-v1.md). Ele segue Spec-Driven Development: **define** a execução futura, mas **não executa código, não modifica `platform/`, não instala dependências, não executa SQL, não usa MCP e não cria policies**. A execução exigirá gate humano próprio, posterior e explícito.

---

## Pack Name

`auth-tenant-boundary-execution-pack-v1`

---

## 1. Propósito da Lane 3

Estabelecer a **fronteira de auth e tenant** no YZI OS: RLS policies mínimas nas tabelas `tenants` e `tenant_memberships`, integração de sessão Supabase Auth no scaffold `platform/` e resolução de contexto de tenant por usuário autenticado. Esta lane também realiza o **health/check real contra Supabase** deliberadamente adiado na Lane 2.

A Lane 3 **não entrega**:
- UI de login/signup/perfil;
- admin de tenants, cockpit ou dashboard;
- tenant real, seed ou cliente real;
- INSERT/UPDATE/DELETE policies;
- auth completa de produção.

---

## 2. Pré-condições (herdadas das Lanes 1 e 2)

Confirmadas em:
- [`supabase-lane-1-foundation-ddl-evidence-v1`](../evidence/supabase-lane-1-foundation-ddl-evidence-v1.md) — `LANE_1_DDL_VALIDATED_SUCCESS`
- [`platform-lane-2-supabase-client-foundation-evidence-v1`](../evidence/platform-lane-2-supabase-client-foundation-evidence-v1.md) — `TASK_221_SUPABASE_CLIENT_FOUNDATION_VALIDATED`

Estado esperado na entrada da Lane 3:

| Item | Estado esperado |
| --- | --- |
| `public.tenants` | existe, RLS habilitado, 0 linhas, 0 policies |
| `public.tenant_memberships` | existe, RLS habilitado, 0 linhas, 0 policies |
| FK `tenant_memberships.tenant_id → tenants.id` | ON DELETE CASCADE confirmada |
| FK `tenant_memberships.user_id → auth.users(id)` | ON DELETE CASCADE confirmada |
| `platform/src/lib/supabase/client.ts` | existe |
| `platform/src/lib/supabase/server.ts` | existe |
| `@supabase/supabase-js@^2.108.1` | instalada |
| Policies RLS | nenhuma — tabelas inacessíveis via API (estado intencional) |
| Tenant real ou seed | nenhum |

Se qualquer pré-condição não se confirmar na execução futura: **parar e reportar**.

---

## 3. Escopo Autorizado Futuro (após gate humano)

### 3.1 Inspeção read-only (sem escrita)

- Confirmar estado atual de `public.tenants` e `public.tenant_memberships`: RLS status, policies existentes (deve ser zero), row count;
- Confirmar existência e exports de `platform/src/lib/supabase/client.ts` e `server.ts`;
- Confirmar que `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão presentes em `platform/.env.example` como placeholders (sem ler nem exibir valores de `.env.local`);
- Verificar se `@supabase/ssr` está presente em `platform/package.json` (relevante para fases posteriores de middleware).
- **Nenhuma alteração durante esta fase.**

### 3.2 Geração do plano SQL de RLS policies

Gerar o arquivo de plano SQL em `docs/specs/implementation/sql/lane-3-rls-policies-plan-v1.sql`, contendo policies SELECT mínimas para as duas tabelas:

**`public.tenants`** — usuário autenticado vê apenas tenants dos quais é membro:
```sql
CREATE POLICY "tenants_select_member" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_memberships
      WHERE tenant_memberships.tenant_id = tenants.id
        AND tenant_memberships.user_id = auth.uid()
    )
  );
```

**`public.tenant_memberships`** — usuário autenticado vê apenas suas próprias memberships:
```sql
CREATE POLICY "memberships_select_own" ON public.tenant_memberships
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
```

Este arquivo é **plano para execução manual pelo humano** no Supabase SQL Editor do projeto `thwsltjcjrvtidhnfukc`. Nenhum SQL é executado via agente, MCP ou qualquer código.

> Gate humano adicional e explícito exigido antes desta fase.

### 3.3 Execução SQL pelo humano

O humano executa o plano `lane-3-rls-policies-plan-v1.sql` no Supabase SQL Editor e reporta o output (resultado das policies criadas) para registro em evidence. Nenhuma execução via agente ocorre nesta fase.

### 3.4 Health/check mínimo em `platform/`

Após confirmação da execução SQL pelo humano (seção 3.3), criar utilitário de health/check em `platform/src/lib/supabase/health.ts`:
- Usa o client server existente com as variáveis públicas;
- Executa query de saúde read-only (ex: `SELECT 1` ou count sem filtro de auth) para confirmar conectividade;
- Não expõe secrets no output;
- Não cria tenant, não insere dados.

> Gate humano adicional e explícito exigido antes desta fase.

### 3.5 Auth session middleware em `platform/`

Criar helpers de sessão Supabase Auth para o Next.js App Router:

- `platform/src/lib/supabase/middleware.ts` — helper de refresh de sessão para uso em Server Components e middleware;
- `platform/middleware.ts` — Next.js middleware que chama o helper de sessão e protege rotas autenticadas;
- `platform/src/app/auth/callback/route.ts` — route handler para troca de code por sessão (OAuth/magic link).

Se `@supabase/ssr` não estiver instalado ao início desta fase: adicionar `@supabase/ssr` a `platform/package.json` mediante gate humano explícito de instalação.

> Gate humano adicional e explícito exigido antes desta fase.

### 3.6 Resolução de contexto de tenant

Criar helper de contexto de tenant em `platform/src/lib/auth/tenant-context.ts`:
- Dado um `user_id` autenticado, retorna o(s) tenant(s) do usuário via query a `public.tenant_memberships`;
- Falha com erro claro se nenhuma membership for encontrada;
- Não cria tenant, não insere dados, não usa service role.

> Gate humano adicional e explícito exigido antes desta fase.

---

## 4. Escopo Proibido

- frontend real (páginas de produto, cockpit, dashboard, UI de login/signup);
- admin de tenants, criação de tenant real, seed, cliente real;
- INSERT/UPDATE/DELETE policies — policies de escrita exigem pack próprio com gate humano;
- backend real (rotas de negócio, API além do callback de auth);
- SQL por qualquer via que não seja plano em `docs/specs/implementation/sql/` para execução exclusivamente manual pelo humano;
- MCP;
- migrations;
- service role key em qualquer arquivo, output ou log;
- criação de `.env` com valores reais;
- alteração em qualquer arquivo fora da lista fechada da seção 6;
- subagents;
- expansão de arquitetura além das specs aprovadas.

---

## 5. Arquivos Inspecionáveis na Execução Futura (read-only)

- `platform/src/lib/supabase/client.ts` e `server.ts` — verificar existência e exports;
- `platform/package.json` — verificar versão de `@supabase/supabase-js` e presença de `@supabase/ssr`;
- `platform/.env.example` — verificar placeholders públicos (sem ler `.env.local`);
- `docs/specs/implementation/evidence/` — evidences anteriores como base factual;
- `docs/specs/implementation/yzi-os-tenant-model-spec-v1.md` — modelo de tenant aprovado;
- `docs/specs/implementation/yzi-os-supabase-mcp-governance-spec-v1.md` — regras de secrets e MCP;
- `.mcp.json` — apenas para confirmar `project_ref`.

---

## 6. Arquivos Alteráveis Somente Após Autorização Humana

Lista fechada — nenhuma escrita ocorre sem gate humano explícito por fase:

| Arquivo candidato | Conteúdo futuro | Fase |
| --- | --- | --- |
| `docs/specs/implementation/sql/lane-3-rls-policies-plan-v1.sql` | plano SQL das policies SELECT mínimas para `tenants` e `tenant_memberships` | 3.2 |
| `platform/src/lib/supabase/health.ts` | utilitário de health/check de conectividade (sem secrets) | 3.4 |
| `platform/src/lib/supabase/middleware.ts` | helper de refresh de sessão Auth (Server Components) | 3.5 |
| `platform/middleware.ts` | Next.js middleware de sessão | 3.5 |
| `platform/src/app/auth/callback/route.ts` | route handler do callback OAuth/magic link | 3.5 |
| `platform/src/lib/auth/tenant-context.ts` | resolver de contexto de tenant por usuário autenticado | 3.6 |
| `platform/package.json` / `platform/package-lock.json` | adição de `@supabase/ssr` somente se ausente e mediante gate de instalação | 3.5 |

Qualquer arquivo fora desta lista exige novo pack.

---

## 7. Verificação Esperada

| Check | Verificação | Aceitação |
| --- | --- | --- |
| `precondition-check` | pré-condições da seção 2 confirmadas na inspeção | 100% confirmadas |
| `path-check` | arquivos tocados vs. lista da seção 6 | 100% dentro da lista |
| `secret-scan` | nenhum secret real em arquivo, output ou log; service role ausente | zero secrets |
| `no-sql-direct-check` | nenhum SQL executado via agente ou MCP | confirmado |
| `rls-status-check` | RLS habilitado em `tenants` e `tenant_memberships` (estado preservado) | confirmado |
| `policy-check` | policies criadas são exatamente as duas do plano da seção 3.2 | confirmado pelo output humano |
| `git-status-check` | alterações somente nos paths autorizados | confirmado |
| `build-check` | `npm run build` em `platform/` após escrita | sem erros |
| `health-check` | conectividade real com Supabase via client TypeScript | confirmado (somente após fase 3.4 autorizada e executada) |

---

## 8. Evidência Esperada

Evidence versionado em `docs/specs/implementation/evidence/` ao final de cada fase autorizada, contendo: pack executado + data; fase executada; o que foi inspecionado ou escrito; output SQL reportado pelo humano (fase 3.3); confirmação de zero secrets, zero SQL via agente, zero MCP; saída dos checks da seção 7 aplicáveis à fase; stop events ou `NONE`; próxima ação recomendada.

---

## 9. Critérios de Bloqueio

Parar imediatamente e reportar ao humano se:

- qualquer passo exigir **service role key** ou qualquer secret real (`SECRET_EXPOSURE`);
- qualquer escrita for necessária fora da lista da seção 6;
- a execução exigir SQL via agente, MCP ou migration;
- as pré-condições da seção 2 não se confirmarem;
- o output SQL reportado pelo humano (seção 3.3) indicar erro ou estado inesperado;
- `npm run build` falhar após escrita em `platform/`;
- houver qualquer ambiguidade de escopo — bloquear, nunca presumir.

---

## 10. Próximo Passo Após Aprovação do Pack

1. Humano aprova este pack (gate — ainda **não** ocorreu).
2. Execução inicia pela fase read-only (seção 3.1), sem escrita.
3. Geração do plano SQL (seção 3.2) exige gate humano adicional.
4. Execução SQL (seção 3.3) é sempre manual, pelo humano no Supabase SQL Editor.
5. Fases 3.4, 3.5 e 3.6 exigem gates humanos próprios.
6. Evidence registrado por fase; mapa operacional atualizado em task própria após conclusão da lane.

---

## What This Does Not Authorize

`This pack spec does NOT authorize:` executar qualquer passo agora; modificar `platform/`; executar código ou build; instalar dependências; executar SQL via agente; usar MCP; criar migrations; criar `.env` com valores reais; criar backend real, frontend real, UI de login, tenant real, seed, INSERT/UPDATE/DELETE policies ou subagents; expandir arquitetura.

Regra de gate: **um pack = um gate humano**. Este documento define o pack; a aprovação humana explícita da execução é o gate — e ainda não ocorreu.

---

## Final Status

`PACK_SPEC_COMPLETE_DOCUMENTARY_ONLY_EXECUTION_NOT_AUTHORIZED`
