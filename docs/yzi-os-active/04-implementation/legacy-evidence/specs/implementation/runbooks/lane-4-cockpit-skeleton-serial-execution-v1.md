# Lane 4 — Cockpit Skeleton: Runbook de Execução Seriada v1

## Readiness Statement

`LANE_4_RUNBOOK_DEFINED_DOCUMENTARY_ONLY_NO_EXECUTION_AUTHORIZED`

Runbook seriado da Lane 4. Detalha cada step do [execution program v1](../lanes/lane-4-cockpit-skeleton-execution-program-v1.md). **Não executa nada.** Cada step só inicia com o gate humano correspondente. Uma fase por vez; evidence antes de avançar.

---

## Step 0 — Revisão humana do programa

- **Quem executa:** humano.
- **Arquivo usado:** `lanes/lane-4-cockpit-skeleton-execution-program-v1.md`.
- **Arquivos tocáveis:** nenhum.
- **Comandos permitidos:** nenhum.
- **Critério de sucesso:** humano aprova o programa (gate L4-G0) ou solicita ajustes documentais.
- **Critério de parada:** programa rejeitado ou ajustes solicitados → revisar documento, nunca executar.

## Step 1 — Inspeção read-only de `platform/`

- **Quem executa:** Claude (somente leitura).
- **Arquivo usado:** programa v1, seção 3 (Estado Herdado).
- **Arquivos tocáveis:** nenhum (leitura apenas).
- **Comandos permitidos:** leitura de arquivos; nenhum comando de escrita, build ou rede.
- **Critério de sucesso:** pré-condições confirmadas (client.ts/server.ts existem, sem service role, `@supabase/ssr` ausente, estrutura `src/app` confirmada).
- **Critério de parada:** qualquer pré-condição falsa → `PRECONDITION_FAILED`, reportar e parar.

## Step 2 — Resolver decisões pendentes (D3, D4, D6)

- **Quem executa:** humano (decisões) com apoio documental de Claude.
- **Arquivo usado:** programa v1, seção 5 (Decisões).
- **Arquivos tocáveis:** nenhum (decisões registradas no chat e, se exigido, em `decisions/`).
- **Comandos permitidos:** nenhum.
- **Critério de sucesso:** D3 (`@supabase/ssr`), D4 (seed temporário) e D6 (proteção de rota via `src/proxy.ts`) decididas explicitamente — cumprido em L4-G0, registradas em `decisions/lane-4-l4-g0-decisions-v1.md`.
- **Critério de parada:** decisão ambígua → `SCOPE_AMBIGUITY`, bloquear.

## Step 3 — Implementar health/check (se aprovado — gate L4-G1)

- **Quem executa:** Claude (escrita), humano (gate e verificação).
- **Arquivo usado:** programa v1 + skill spec `supabase-client-boundary-skill-v1`.
- **Arquivos tocáveis:** `platform/src/lib/supabase/health.ts` (e `platform/README.md` se precisar documentar configuração).
- **Comandos permitidos:** nenhum build/execução neste step (validação fica no Step 7); leitura permitida.
- **Critério de sucesso:** `health.ts` criado usando apenas anon key/client existente, sem service role, TypeScript puro.
- **Critério de parada:** necessidade de secret → `SECRET_EXPOSURE`; arquivo fora da lista → `OUT_OF_SCOPE_WRITE`.

## Step 4 — Implementar sessão/auth mínima (se aprovado — gate L4-G2)

- **Quem executa:** Claude (escrita), humano (gate, decisão D3/D6, instalação de dependência se aprovada).
- **Arquivo usado:** programa v1 + skill spec `auth-session-minimal-review-skill-v1`.
- **Arquivos tocáveis:** `platform/src/lib/auth/session.ts`, `platform/src/app/login/page.tsx`, `platform/src/proxy.ts` (D6 aprovada em L4-G0; convenção Next.js 16), `platform/package.json` + lockfile (somente `@supabase/ssr`, D3 aprovada em L4-G0).
- **Comandos permitidos:** `npm install @supabase/ssr` **somente** se D3 aprovada e somente com gate; `npm audit` pós-instalação obrigatório, output reportado.
- **Critério de sucesso:** login mínimo + sessão persistente; sem signup/recovery; sem service role.
- **Critério de parada:** escopo crescer para auth completa → `SCOPE_AMBIGUITY`; `npm audit` piorar → reportar antes de prosseguir.

## Step 5 — Implementar tenant context read (se aprovado — gate L4-G3)

- **Quem executa:** Claude (escrita), humano (gate).
- **Arquivo usado:** programa v1 + skill spec `tenant-context-empty-state-skill-v1`.
- **Arquivos tocáveis:** `platform/src/lib/tenant/tenant-context.ts`.
- **Comandos permitidos:** nenhum build/execução neste step.
- **Critério de sucesso:** resolução read-only do tenant via `tenant_memberships` → `tenants` (RLS SELECT), retornando tenant **ou** estado vazio tipado — nunca dado inventado.
- **Critério de parada:** qualquer escrita no banco proposta → `UNAUTHORIZED_SQL_EXECUTION`.

## Step 6 — Implementar cockpit skeleton (gate L4-G4)

- **Quem executa:** Claude (escrita), humano (gate).
- **Arquivo usado:** programa v1 + skill spec `cockpit-skeleton-ui-review-skill-v1`.
- **Arquivos tocáveis:** `platform/src/app/cockpit/layout.tsx`, `platform/src/app/cockpit/page.tsx`.
- **Comandos permitidos:** nenhum build/execução neste step.
- **Critério de sucesso:** layout + página inicial exibindo tenant atual ou estado vazio honesto; zero features de negócio; skeleton deliberadamente simples.
- **Critério de parada:** dashboard/CRUD/feature aparecer → `OUT_OF_SCOPE_WRITE`.

## Step 7 — Validar lint/build

- **Quem executa:** Claude (comandos), humano (acompanha output).
- **Arquivo usado:** outputs de lint/build.
- **Arquivos tocáveis:** somente correções nos arquivos já tocados nos Steps 3–6.
- **Comandos permitidos:** `npm run lint`, `npm run build` (nada além).
- **Critério de sucesso:** lint e build passando, output registrado para evidence.
- **Critério de parada:** falha não trivial → `BUILD_FAILURE`, reportar antes de corrigir; correção fora da lista → `OUT_OF_SCOPE_WRITE`.

## Step 8 — Validar comportamento de estado vazio

- **Quem executa:** humano (navegação/verificação), Claude (registro).
- **Arquivo usado:** template `lane-4-cockpit-skeleton-evidence-template-v1`.
- **Arquivos tocáveis:** nenhum em `platform/`.
- **Comandos permitidos:** `npm run dev` (humano, localmente) para verificação visual.
- **Critério de sucesso:** com banco limpo (0 tenants, 0 memberships), o cockpit mostra estado vazio honesto — sem dado falso, sem erro não tratado, sem loop de redirect.
- **Critério de parada:** dado inventado exibido → `DISHONEST_EMPTY_STATE`; erro não tratado → reportar e parar.

## Step 9 — Registrar evidence final

- **Quem executa:** Claude (documento), humano (revisão).
- **Arquivo usado:** template `lane-4-final-evidence-template-v1`.
- **Arquivos tocáveis:** somente `docs/specs/implementation/evidence/`.
- **Comandos permitidos:** nenhum.
- **Critério de sucesso:** evidence final preenchido com outputs reais de cada step executado.
- **Critério de parada:** evidence de algum step ausente → bloquear fechamento, reportar gap.

## Step 10 — Atualizar mapa operacional (somente no fechamento — gate L4-G6)

- **Quem executa:** Claude (documento), humano (gate L4-G6).
- **Arquivo usado:** `yzi-os-spec-harness-execution-map-v1.md` + closure gate da Lane 4.
- **Arquivos tocáveis:** mapa operacional e `lanes/lane-4-cockpit-skeleton-closure-gate-v1.md`.
- **Comandos permitidos:** nenhum.
- **Critério de sucesso:** Lane 4 marcada como concluída com referência aos evidences; closure gate criado com frase de abertura da Lane 5.
- **Critério de parada:** gate L4-G6 não confirmado → mapa **não** é atualizado.

---

## Confirmação de Não-Execução

Este runbook não executa código, build, SQL, MCP ou instalação de dependências, e não modifica `platform/`. Ele apenas descreve a execução futura, que permanece bloqueada por gates humanos.

---

## Final Status

`LANE_4_RUNBOOK_DEFINED_DOCUMENTARY_ONLY_NO_EXECUTION_AUTHORIZED`
