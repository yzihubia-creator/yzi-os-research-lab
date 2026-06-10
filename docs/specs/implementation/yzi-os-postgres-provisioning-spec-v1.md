# YZI OS Postgres Provisioning Spec v1

## Readiness Statement

`YZI_OS_POSTGRES_PROVISIONING_SPEC_V1_CREATED_DOCUMENTARY_ONLY_AWAITING_HUMAN_APPROVAL`

## Purpose

Esta spec define o **candidato de provisionamento do PostgreSQL** para o MVP da plataforma YZI OS em `platform/` — o gate de provisionamento explicitamente exigido pela persistence spec. Ela segue Spec-Driven Development: **decide e justifica** onde o Postgres candidato deverá rodar, mas **não executa implementação**. Nenhum projeto, banco, credencial, secret, conexão, dependência, schema, migration, RLS, auth, tenant, seed, API ou deploy é criado ou autorizado por este documento.

## Source Boundary

- **Fontes arquiteturais normativas:**
  - [`docs/specs/p0/tenant-boundary.spec.md`](../p0/tenant-boundary.spec.md) — fronteira de tenant como invariante de engenharia (`P10`, `DO2`);
  - [`docs/specs/p1/operational-state.spec.md`](../p1/operational-state.spec.md) e [`tenant-state-isolation.spec.md`](../p1/tenant-state-isolation.spec.md) — estado persistido como fonte de verdade, sempre tenant-scoped.
- **Specs de implementação anteriores:**
  - [`yzi-os-platform-scaffold-spec-v1.md`](./yzi-os-platform-scaffold-spec-v1.md) — stack Next.js + TypeScript em `platform/`;
  - [`yzi-os-tenant-model-spec-v1.md`](./yzi-os-tenant-model-spec-v1.md) — modelo candidato de `tenants` / `tenant_memberships`;
  - [`yzi-os-persistence-spec-v1.md`](./yzi-os-persistence-spec-v1.md) — engine PostgreSQL + Drizzle ORM decididos como candidatos; provisionamento explicitamente diferido para esta spec.
- **Regra de conflito:** em qualquer conflito com as specs P0/P1 ou com as specs de implementação anteriores, **as specs anteriores vencem**. Esta spec é derivada e subordinada.

## Decision Scope

Esta spec decide, em nível documental, exatamente uma coisa: **onde o Postgres candidato do MVP deverá ser provisionado**. Tudo o mais — criação real do banco, credenciais, conexão, schema, migration, RLS, auth, seed, API, deploy — permanece fora do escopo e exigirá task própria com gate humano.

## Provisioning Options

Opções candidatas consideradas para o Postgres do MVP:

- Supabase managed Postgres;
- Neon managed Postgres;
- local Postgres;
- Docker Postgres;
- VPS/Postgres self-hosted.

Recomendação candidata desta spec:

`Supabase managed Postgres for MVP`

Justificativa resumida: o Supabase oferece Postgres gerenciado real, painel de inspeção, suporte futuro a RLS (segunda linha de defesa já declarada na tenant spec e na persistence spec), menor atrito inicial de operação e compatibilidade com a direção multi-tenant do YZI OS.

## Alternatives Considered

| Option | Pros | Cons | Decision |
| ------ | ---- | ---- | -------- |
| Supabase managed Postgres | Postgres real gerenciado; painel de inspeção; RLS futuro nativo; backups e operação inclusos; menor atrito para MVP; Drizzle conecta via `DATABASE_URL` sem obrigar Supabase Auth | dependência de fornecedor; limites do free tier; rede externa desde o dia 1 | **Recomendado para MVP** |
| Neon managed Postgres | Postgres serverless gerenciado; branching de banco; bom free tier | sem painel de dados comparável; RLS exige mais montagem manual; menos alinhado ao caminho multi-tenant já contemplado nas specs | Não recomendado agora |
| local Postgres | controle total; sem rede externa; custo zero | instalação/manutenção manual no Windows; divergência dev/prod; sem painel; não aproxima o MVP de um ambiente real | Não recomendado agora |
| Docker Postgres | ambiente reprodutível; isolado do host | exige Docker (explicitamente fora de escopo nas specs anteriores); overhead operacional prematuro; ainda divergente de produção | Não recomendado agora |
| VPS self-hosted Postgres | controle total; custo previsível | administração de servidor, segurança, backup e patching por conta própria; overhead claramente prematuro para MVP | Não recomendado agora |

## Why Supabase For MVP

- Postgres real desde o início — sem camada de abstração que esconda o engine decidido na persistence spec;
- suporte futuro a RLS, alinhado ao enforcement em camadas já declarado (não autorizado aqui);
- painel útil para inspeção humana de dados e estrutura;
- menor overhead operacional — nenhum servidor, container ou instalação local para manter;
- bom ajuste para MVP multi-tenant na direção das specs P0/P1;
- evita Docker/VPS prematuro — ambos exigiriam gates e operação que o MVP não justifica;
- não obriga usar Supabase Auth agora — auth permanece fora de escopo, com spec própria futura;
- Drizzle pode conectar via `DATABASE_URL` padrão, preservando a escolha de ORM da persistence spec.

## What This Does Not Authorize

`This spec does NOT authorize:`

- criar projeto Supabase;
- criar banco real;
- criar credenciais;
- salvar secrets;
- conectar app;
- instalar dependências;
- criar schema;
- criar migration;
- rodar migration;
- criar RLS;
- criar auth;
- criar tenant;
- criar seed;
- criar API;
- deploy;
- produção.

Cada item exigirá task própria com gate de autorização humana.

## Environment Strategy Candidate

Uma futura implementação autorizada poderá usar as variáveis:

- `DATABASE_URL`
- `DIRECT_DATABASE_URL`

apenas em `platform/.env.local`, **nunca commitado** (já coberto pelo `.gitignore`).

`platform/.env.example` deve conter **apenas placeholders documentados**, sem qualquer valor real.

## Acceptance Criteria For Future Provisioning

A futura task de provisionamento só será aceita se:

1. O banco/projeto for criado manualmente pelo humano ou por task explicitamente autorizada;
2. Nenhuma credencial real for commitada no repositório;
3. `platform/.env.example` contiver apenas placeholders;
4. `platform/` for o único path alterado, se houver ajuste de documentação de env;
5. Nenhuma migration for aplicada;
6. A conexão for validada apenas se explicitamente autorizado;
7. Nenhum tenant e nenhum schema forem criados nesta etapa.

## Stop Criteria

Parar imediatamente a futura execução e reportar ao humano se ela:

- exigir secrets em arquivo versionado;
- exigir criar schema;
- exigir rodar migration;
- exigir RLS;
- exigir auth;
- exigir tenant real;
- exigir deploy;
- precisar alterar arquivos fora dos paths autorizados.

## Next Action After Human Approval

A próxima task candidata é:

`Task — Provision Supabase Postgres MVP Database`

`That task is NOT authorized by this document.` A execução exigirá: aprovação humana desta spec + autorização explícita da task, com paths autorizados e critérios próprios.

## Boundary Rule

`This spec defines the Postgres provisioning candidate but does not authorize database creation, credential creation, secret storage, app connection, dependency installation, schema, migration, RLS, auth, tenant creation, seed, API, deploy, integration, or production change.`

## Final Status

`SPEC_COMPLETE_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`
