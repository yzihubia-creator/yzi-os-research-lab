# YZI OS Supabase MCP Governance Spec v1

## Readiness Statement

`YZI_OS_SUPABASE_MCP_GOVERNANCE_SPEC_V1_CREATED_DOCUMENTARY_ONLY_AWAITING_HUMAN_APPROVAL`

## Purpose

Esta spec define a **governança de uso do Supabase MCP** no YZI OS Research Lab. O MCP server da Supabase foi adicionado como tooling (`.mcp.json`, endpoint HTTP com `project_ref`, autenticação OAuth no momento da conexão, sem secrets no arquivo). Ela segue Spec-Driven Development: **descreve** as regras sob as quais o MCP poderá vir a ser usado, mas **não autoriza nenhuma operação via MCP agora**. Nenhuma chamada MCP é executada, nenhum SQL é executado, nenhuma dependência é instalada, nenhum schema, migration, tenant, seed, RLS, auth, API, UI ou deploy é criado ou autorizado por este documento.

## Source Boundary

- **Specs de implementação anteriores:**
  - [`yzi-os-connection-validation-spec-v1.md`](./yzi-os-connection-validation-spec-v1.md) — validação local read-only via cliente transitório; reporte sem secrets;
  - [`yzi-os-postgres-provisioning-spec-v1.md`](./yzi-os-postgres-provisioning-spec-v1.md) — Supabase managed Postgres como candidato de MVP; secrets somente em `platform/.env.local`;
  - [`yzi-os-persistence-spec-v1.md`](./yzi-os-persistence-spec-v1.md) — gerar ≠ aplicar; nada automático;
  - [`yzi-os-tenant-model-spec-v1.md`](./yzi-os-tenant-model-spec-v1.md) e [`yzi-os-platform-scaffold-spec-v1.md`](./yzi-os-platform-scaffold-spec-v1.md) — contexto e boundaries de `platform/`.
- **Fontes arquiteturais normativas:** [`docs/specs/p0/tenant-boundary.spec.md`](../p0/tenant-boundary.spec.md), [`docs/specs/p2/operational-boundaries.spec.md`](../p2/operational-boundaries.spec.md), [`docs/specs/p3/tool-permission.spec.md`](../p3/tool-permission.spec.md) e [`docs/specs/p3/tool-execution.spec.md`](../p3/tool-execution.spec.md) — nenhuma mutação silenciosa; toda ferramenta opera sob permissão explícita; evidência auditável; dúvida bloqueia ou escala.
- **Regra de conflito:** em qualquer conflito, as specs anteriores (P0–P4 e implementação) vencem. Esta spec é derivada e subordinada.

## Decision Scope

Esta spec decide, em nível documental, exatamente uma coisa: **sob quais regras o Supabase MCP poderá vir a ser usado**. Tudo o mais permanece fora do escopo.

## Governance Rules

1. O MCP da Supabase é **tooling de leitura e inspeção assistida**, não um canal de implementação. Sua presença em `.mcp.json` não constitui autorização de uso.
2. O arquivo `.mcp.json` **nunca** poderá conter token, senha, connection string ou qualquer secret — apenas endpoint e `project_ref` (identificador público). Autenticação ocorre por OAuth no momento da conexão, fora do repositório.
3. Toda operação via MCP é, por default, **proibida**. O estado natural é "nenhuma chamada MCP".
4. Operações read-only (listar metadados, inspecionar configuração, consultar status do projeto) só podem ocorrer mediante task explícita autorizada pelo humano.
5. Operações mutantes via MCP (qualquer escrita, em qualquer nível) estão **proibidas nesta fase**, mesmo com task explícita — exigem nova spec própria, aprovada, antes de qualquer autorização.
6. Nenhum output de MCP pode expor secrets: connection strings, hosts internos, usuários, senhas, tokens ou chaves não-públicas não podem aparecer em chat, log, diff ou commit.
7. O MCP **não pode** ser usado para:
   - executar SQL;
   - criar ou aplicar schema, migration ou seed;
   - criar tenant (real ou de teste);
   - criar ou alterar RLS;
   - criar ou alterar auth;
   - instalar dependência;
   - criar API route;
   - criar UI;
   - deploy;
   - qualquer alteração em produção.
8. Qualquer operação via MCP precisa ser precedida de task explícita com escopo, validação e stop criteria.
9. Próxima task candidata: validar acesso MCP read-only, apenas listando metadados do projeto, sem alterar nada.

## What This Does Not Authorize

`This spec does NOT authorize:`

- executar qualquer chamada MCP agora (exige autorização explícita própria);
- executar SQL por qualquer via;
- instalar dependências (em `platform/` ou globalmente);
- alterar qualquer arquivo em `platform/`;
- criar schema, migration, seed ou aplicar qualquer mudança no banco;
- criar tenant (real ou de teste);
- RLS, auth, API, UI, workflow, integração, deploy;
- copiar, exibir, logar ou commitar qualquer secret;
- alteração em produção.

## Acceptance Criteria For Future MCP Validation

A futura task de validação MCP read-only só será aceita se:

1. For executada somente após autorização humana explícita da task;
2. Executar exclusivamente operações de leitura de metadados do projeto;
3. Nenhuma escrita de qualquer natureza ocorrer no projeto Supabase;
4. Nenhum secret aparecer em chat, log, output, diff ou commit;
5. Nenhum arquivo do repositório for criado ou alterado pela validação (evidência é o output redigido);
6. `git status` permanecer limpo ao final.

## Stop Criteria

Parar imediatamente qualquer futura execução via MCP e reportar ao humano se ela:

- exigir ou sugerir qualquer operação de escrita;
- exigir executar SQL;
- exigir instalar dependência;
- fizer qualquer secret aparecer em output, diff, log ou commit;
- exigir alteração fora dos paths autorizados;
- operar sobre projeto ou ambiente diferente do `project_ref` declarado em `.mcp.json`;
- encontrar escopo ambíguo na task (bloquear, nunca presumir).

## Next Action After Human Approval

A próxima task candidata é:

`Task — Validate Supabase MCP Access (Read-Only Metadata Listing)`

`That task is NOT authorized by this document.` A execução exigirá: aprovação humana desta spec + autorização explícita da task com escopo, validação e stop criteria.

## Boundary Rule

`This spec authorizes only the documentary governance of Supabase MCP usage and does not authorize MCP execution, SQL execution, schema, migration, tenant creation, seed, RLS, auth, API, UI, deploy, integration, production change, or secret commit.`

## Final Status

`SPEC_COMPLETE_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`
