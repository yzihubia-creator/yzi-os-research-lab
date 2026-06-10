# YZI OS Connection Validation Spec v1

## Readiness Statement

`YZI_OS_CONNECTION_VALIDATION_SPEC_V1_CREATED_DOCUMENTARY_ONLY_AWAITING_HUMAN_APPROVAL`

## Purpose

Esta spec define o **candidato de validação local e não-mutante da conexão Postgres** do MVP — a verificação mínima de que o `DATABASE_URL` preenchido manualmente pelo humano em `platform/.env.local` alcança o banco Supabase. Ela segue Spec-Driven Development: **descreve** a validação candidata, mas **não a executa**. Nenhuma conexão é aberta, nenhuma dependência é instalada, nenhum schema, migration, tenant, seed, RLS, auth, API ou deploy é criado ou autorizado por este documento.

## Source Boundary

- **Specs de implementação anteriores:**
  - [`yzi-os-postgres-provisioning-spec-v1.md`](./yzi-os-postgres-provisioning-spec-v1.md) — Supabase managed Postgres como candidato de MVP; `DATABASE_URL` / `DIRECT_DATABASE_URL` somente em `platform/.env.local` (nunca commitado); conexão validada **apenas se autorizado**;
  - [`yzi-os-persistence-spec-v1.md`](./yzi-os-persistence-spec-v1.md) — engine PostgreSQL + Drizzle ORM como candidatos; gerar ≠ aplicar; nada automático;
  - [`yzi-os-tenant-model-spec-v1.md`](./yzi-os-tenant-model-spec-v1.md) e [`yzi-os-platform-scaffold-spec-v1.md`](./yzi-os-platform-scaffold-spec-v1.md) — contexto e boundaries de `platform/`.
- **Fontes arquiteturais normativas:** [`docs/specs/p0/tenant-boundary.spec.md`](../p0/tenant-boundary.spec.md) e [`docs/specs/p1/operational-state.spec.md`](../p1/operational-state.spec.md) / [`event-driven-state.spec.md`](../p1/event-driven-state.spec.md) — nenhuma mutação silenciosa; evidência auditável; dúvida bloqueia ou escala.
- **Regra de conflito:** em qualquer conflito, as specs anteriores (P0/P1 e implementação) vencem. Esta spec é derivada e subordinada.

## Decision Scope

Esta spec decide, em nível documental, exatamente uma coisa: **como a futura validação de conexão deverá ser feita** — local, não-mutante, sem dependência nova e sem exposição de secret. Tudo o mais permanece fora do escopo.

## Validation Approach Candidate

### Abordagem recomendada

`Read-only SELECT via transient client, no dependency added to platform/`

A futura validação autorizada deverá:

1. Ler `DATABASE_URL` **exclusivamente** de `platform/.env.local` — nunca de argumento de linha de comando, nunca colado em chat, prompt, log ou commit;
2. Abrir **uma única conexão** e executar **apenas consultas read-only**, no máximo: `SELECT 1;` e `SELECT current_database(), version();`
3. **Nunca** executar DDL, DML, `CREATE`, `ALTER`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE` ou qualquer statement de escrita;
4. Encerrar a conexão imediatamente após a consulta;
5. Reportar somente: sucesso/falha, nome do banco e versão do servidor — **nunca** a connection string, host, usuário ou senha;
6. Não adicionar nenhuma dependência a `platform/package.json` — o cliente é transitório.

### Alternativas consideradas

| Option | Pros | Cons | Decision |
| ------ | ---- | ---- | -------- |
| Cliente transitório (ex.: `psql` se disponível, ou execução one-off sem alterar `package.json`) | nada persiste no repo; read-only verificável; sem mudança em `platform/` | exige cliente disponível no ambiente na hora da execução | **Recomendado** |
| Adicionar `pg`/driver ao `platform/package.json` para um script de healthcheck | ferramenta fica disponível para o futuro | instala dependência antes do gate de implementação; altera `platform/` sem necessidade | Não recomendado agora |
| Verificação manual pelo humano no painel Supabase (SQL editor com `SELECT 1`) | zero ação do agente; zero risco local | não valida que **o ambiente local** alcança o banco via `.env.local` | Complementar, não substituto |

## What This Does Not Authorize

`This spec does NOT authorize:`

- executar a validação agora (exige autorização explícita própria);
- instalar dependências (em `platform/` ou globalmente);
- alterar qualquer arquivo em `platform/`;
- criar schema, migration, seed ou aplicar qualquer mudança no banco;
- criar tenant (real ou de teste);
- RLS, auth, API, UI, workflow, integração, deploy;
- copiar, exibir, logar ou commitar qualquer secret;
- alteração em produção.

## Acceptance Criteria For Future Validation

A futura task de validação só será aceita se:

1. For executada somente após autorização humana explícita da task;
2. Ler credenciais apenas de `platform/.env.local`;
3. Executar exclusivamente as consultas read-only declaradas acima;
4. Nenhuma escrita de qualquer natureza ocorrer no banco;
5. Nenhum secret aparecer em chat, log, output, diff ou commit;
6. Nenhum arquivo for criado ou alterado (validação é efêmera; evidência é o output redigido);
7. `git status` permanecer limpo ao final.

## Stop Criteria

Parar imediatamente a futura execução e reportar ao humano se ela:

- exigir criar schema;
- exigir rodar migration;
- exigir instalar dependência em `platform/`;
- exigir escrita de qualquer tipo no banco;
- fizer qualquer secret aparecer em diff, log ou output;
- exigir alteração fora dos paths autorizados;
- encontrar `DATABASE_URL` ausente, vazio ou ambíguo em `.env.local` (bloquear, nunca presumir).

## Next Action After Human Approval

A próxima task candidata é:

`Task — Validate Local Postgres Connection (Read-Only)`

`That task is NOT authorized by this document.` A execução exigirá: `.env.local` preenchido manualmente pelo humano + aprovação humana desta spec + autorização explícita da task.

## Boundary Rule

`This spec authorizes only a future local non-mutating Postgres connection validation and does not authorize schema, migration, tenant creation, seed, RLS, auth, API, UI, deploy, integration, production change, or secret commit.`

## Final Status

`SPEC_COMPLETE_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`
