# Supabase Project Baseline Evidence v1

## Readiness Statement

`EVIDENCE_COMPLETE_READ_ONLY_BASELINE_RECORDED_NO_REMOTE_CHANGE`

Este documento é o **evidence record versionado** da execução do pack [`supabase-mcp-readonly-inventory-pack-v1`](../packs/supabase-mcp-readonly-inventory-pack-v1.md), conforme o harness map ([`yzi-os-execution-harness-map-v1`](../yzi-os-execution-harness-map-v1.md) §9, item 2 — Supabase Project Baseline Evidence Pack). Ele segue Spec-Driven Development: **registra** o baseline observado do projeto Supabase remoto, mas **não executa MCP, não executa SQL, não altera Supabase, não cria schema, migration, tenant, RLS ou policy, e não altera `platform/`**. Este registro foi produzido exclusivamente a partir do output redigido da execução read-only já concluída — nenhuma nova chamada MCP foi feita para criá-lo.

---

## Pack Executed

- **Pack:** `supabase-mcp-readonly-inventory-pack-v1`
- **Data da execução:** 2026-06-11
- **Executor:** sessão Claude Code sob gate humano explícito (task "Resume Supabase MCP Read-Only Inventory Pack v1"), papel `supabase-mcp-agent` exercido pelo executor da task conforme previsto no pack (subagent real não criado)
- **Specs governantes:** [`yzi-os-supabase-mcp-governance-spec-v1`](../yzi-os-supabase-mcp-governance-spec-v1.md), [`yzi-os-execution-harness-map-v1`](../yzi-os-execution-harness-map-v1.md), [`yzi-os-tenant-model-spec-v1`](../yzi-os-tenant-model-spec-v1.md), [`yzi-os-persistence-spec-v1`](../yzi-os-persistence-spec-v1.md)

---

## Project Identity

- **project_ref:** `thwsltjcjrvtidhnfukc` — idêntico ao declarado em [`.mcp.json`](../../../../.mcp.json) (`project-ref-check` aprovado)
- **Project URL pública:** `https://thwsltjcjrvtidhnfukc.supabase.co` (informação não-secreta, retornada por `get_project_url`)
- **Autenticação:** OAuth realizada pelo humano fora do repositório; o token expirou durante a primeira tentativa, a execução parou e reportou (stop event), e o humano re-autenticou via `/mcp`. Nenhuma credencial foi exibida, copiada ou armazenada.

---

## Read-Only Tools Executed

7 chamadas MCP, todas read-only, todas dentro da lista Allowed Remote Operations do pack (`operations-audit`: 7/7):

| Tool exata | Categoria autorizada (pack) | Resultado resumido |
| --- | --- | --- |
| `mcp__supabase__get_project_url` | #7 metadados gerais do projeto | URL pública do projeto |
| `mcp__supabase__list_tables` (schemas: `public`, `auth`, `storage`, `extensions`) | #1 tabelas/schemas | 31 tabelas de sistema + 1 tabela em `public` |
| `mcp__supabase__list_extensions` | #2 extensions | 5 instaladas, ~75 apenas disponíveis |
| `mcp__supabase__list_migrations` | #3 migrations registradas | lista vazia |
| `mcp__supabase__list_edge_functions` | #5 functions/edge functions | lista vazia |
| `mcp__supabase__get_advisors` (type: `security`) | #6 advisors | 1 finding nível INFO |
| `mcp__supabase__get_advisors` (type: `performance`) | #6 advisors | zero findings |

**Exclusões deliberadas:** `get_publishable_keys` não foi usada (retorna chaves — proibida pelo pack mesmo sendo read-only); `search_docs` não foi necessária; nenhuma tool mutante (`execute_sql`, `apply_migration`, `deploy_edge_function`, operações de branch) foi tocada.

---

## Governance Confirmations

- **Zero escrita remota:** confirmado — nenhuma operação de escrita de qualquer natureza ocorreu no projeto Supabase. Blocker `MCP_MUTATION_RISK`: não acionado.
- **Zero alteração local:** confirmado — nenhum arquivo do repositório foi criado, editado ou removido pela execução do pack (`path-check`: Allowed Paths vazio respeitado; files touched = `NENHUM`).
- **Nenhum secret exibido:** confirmado — nenhum secret em output, log ou diff (`secret-scan-output` aprovado). Blocker `SECRET_EXPOSURE`: não acionado.
- **Forbidden actions ausentes:** nenhum SQL, DDL, DML, RLS/policy, function, storage, auth, tenant, seed, migration ou recuperação de secret.
- **git status final da execução:** `On branch master, nothing to commit, working tree clean` — `git-status-check` e `diff-check` aprovados.
- **Stop events:** 1 — expiração do token OAuth na primeira tentativa (parada + reporte + re-autenticação humana, conforme protocolo do pack). Nenhum outro.

---

## Inventory — Baseline Observado

### Schemas e tabelas

- **`public`** — exatamente 1 tabela: `tenants` (ver seção Baseline Divergence abaixo). Nenhuma outra tabela de negócio. `tenant_memberships` **não existe**.
- **`auth`** — 23 tabelas padrão do serviço de auth da Supabase (GoTrue): `users`, `refresh_tokens`, `instances`, `audit_log_entries`, `schema_migrations`, `identities`, `sessions`, `mfa_factors`, `mfa_challenges`, `mfa_amr_claims`, `sso_providers`, `sso_domains`, `saml_providers`, `saml_relay_states`, `flow_state`, `one_time_tokens`, `oauth_clients`, `oauth_authorizations`, `oauth_consents`, `oauth_client_states`, `custom_oauth_providers`, `webauthn_credentials`, `webauthn_challenges`. Todas com 0 linhas, exceto `auth.schema_migrations` (76 linhas — migrations internas do próprio serviço de auth, não do projeto). Nenhum usuário existe.
- **`storage`** — 8 tabelas padrão: `migrations`, `buckets`, `objects`, `s3_multipart_uploads`, `s3_multipart_uploads_parts`, `buckets_analytics`, `buckets_vectors`, `vector_indexes`. Todas com 0 linhas, exceto `storage.migrations` (61 linhas — internas do serviço de storage). Nenhum bucket, nenhum objeto.
- **`extensions`** — nenhuma tabela própria listada.

### Extensions instaladas

Apenas o baseline padrão da Supabase — nenhuma extension adicionada pelo projeto:

| Extension | Versão | Schema |
| --- | --- | --- |
| `plpgsql` | 1.0 | `pg_catalog` |
| `pgcrypto` | 1.3 | `extensions` |
| `uuid-ossp` | 1.1 | `extensions` |
| `pg_stat_statements` | 1.11 | `extensions` |
| `supabase_vault` | 0.3.1 | `vault` |

As demais ~75 extensions listadas estão apenas **disponíveis** (installed_version nulo), não instaladas.

### Migrations registradas

**Nenhuma** — `list_migrations` retornou lista vazia. Consistente com a [`yzi-os-persistence-spec-v1`](../yzi-os-persistence-spec-v1.md) (nenhuma migration gerada ou aplicada pelo fluxo formal). Nota relevante: `public.tenants` existe **sem** migration registrada correspondente (ver Baseline Divergence).

### RLS / Policies

- RLS habilitado nas tabelas de sistema (`auth`, `storage`) conforme padrão Supabase, e em `public.tenants`.
- **Zero policies de negócio** — confirmado pelo security advisor (`rls_enabled_no_policy` em `public.tenants`).
- Não existe tool MCP read-only dedicada à listagem de policies sem SQL; o inventário usou os flags `rls_enabled` de `list_tables` + advisors, sem executar SQL (conforme previsto no pack: nunca improvisar com SQL).

### Functions / Edge Functions

- **Edge functions:** nenhuma (`list_edge_functions` vazio).
- **Functions de banco:** não listáveis sem SQL (proibido); nenhuma evidência de função de negócio; advisors não apontaram nenhuma.

### Advisors

- **Security:** 1 finding, nível **INFO**, facing EXTERNAL — `rls_enabled_no_policy`: "Table `public.tenants` has RLS enabled, but no policies exist". Efeito prático: a tabela fica inacessível via API até existir policy. Remediação documentada em <https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy>. **Nada foi aplicado** — registro apenas.
- **Performance:** zero findings.

---

## Baseline Divergence

`BASELINE_DIVERGENCE_MANUAL_TABLE_WITHOUT_MIGRATION`

O estado-zero esperado pelas specs ([`yzi-os-tenant-model-spec-v1`](../yzi-os-tenant-model-spec-v1.md): nenhuma tabela criada; [`yzi-os-persistence-spec-v1`](../yzi-os-persistence-spec-v1.md): gerar ≠ aplicar, nada criado) **não foi integralmente confirmado**. A tabela `public.tenants` **já existe** no projeto remoto:

| Atributo | Valor observado |
| --- | --- |
| Schema | `public` |
| Table | `tenants` |
| RLS | enabled |
| Policies | none |
| Rows | 0 |
| Comment | `YZI OS root tenant boundary table. Created manually as initial MVP schema anchor.` |
| Registered migration | none |
| Likely origin | criação manual fora do fluxo formal de migrations/packs |

Declarações de governança sobre a divergência:

- **Não foi blocker da execução read-only** — observar e registrar o estado real é exatamente o objetivo do inventário; nenhum stop criterion do pack foi violado pela existência da tabela.
- **Não deve ser corrigida neste evidence pack** — este documento registra, não reconcilia; qualquer ação sobre a tabela está fora do escopo deste registro.
- **Não autoriza drop, recreate, insert ou update** — nenhuma operação mutante sobre `public.tenants` (ou qualquer outro objeto) é autorizada por este documento.
- **Exige decisão humana futura de reconciliação** — ver Pending Decision abaixo.

---

## Pending Decision — Reconciliação de `public.tenants`

Duas opções futuras, **registradas sem executar** — a escolha exigirá gate humano próprio:

### Opção 1 — `ACCEPT_MANUAL_TENANTS_AS_BASELINE`

- Manter a tabela existente como está;
- Criar migration reconciliadora/baseline em pack futuro, alinhando o histórico formal de migrations ao estado real;
- Documentar explicitamente que a tabela existia antes do fluxo formal de migrations.

### Opção 2 — `RECREATE_TENANTS_VIA_FORMAL_MIGRATION`

- Dropar e recriar a tabela **apenas se autorizado por pack mutante futuro** (nenhuma operação mutante via MCP está autorizada na fase atual — governance spec, regra 5);
- Exige análise de risco prévia;
- Recomendado enquanto não houver dados (a tabela tem 0 linhas), mas precisa de gate específico.

`Neither option is authorized by this document.` A decisão e sua execução exigirão definição própria e gate humano próprio.

---

## What This Does Not Authorize

`This evidence record does NOT authorize:`

- executar qualquer chamada MCP;
- executar SQL por qualquer via;
- alterar o projeto Supabase em qualquer nível;
- criar, alterar ou aplicar schema, migration ou seed;
- criar tenant (real ou de teste);
- criar ou alterar RLS/policy;
- dropar, recriar ou popular `public.tenants`;
- alterar `platform/`;
- instalar dependências;
- criar subagents;
- deploy ou alteração em produção;
- a execução de qualquer das duas opções de reconciliação registradas.

---

## Next Pack Candidate

Conforme [`yzi-os-execution-harness-map-v1`](../yzi-os-execution-harness-map-v1.md) §9, o próximo passo da sequência é o item 3 — **`Database Schema Decision Pack`** (consolidar o DDL candidato de `tenants` + `tenant_memberships` a partir da tenant-model spec). Dada a divergência registrada, recomenda-se que o gate desse pack **inclua a decisão de reconciliação de `public.tenants`** (Opção 1 vs. Opção 2) antes de consolidar o DDL.

`That pack is NOT authorized by this document.`

---

## Final Status

`EVIDENCE_COMPLETE_READ_ONLY_BASELINE_RECORDED_NO_REMOTE_CHANGE`
