# Supabase MCP Read-Only Inventory Pack v1

## Readiness Statement

`SUPABASE_MCP_READONLY_INVENTORY_PACK_V1_CREATED_DOCUMENTARY_ONLY_MCP_EXECUTION_NOT_AUTHORIZED`

Este documento é a **definição documental** do primeiro Execution Pack real do YZI OS, conforme o template do [`yzi-os-execution-harness-map-v1`](../yzi-os-execution-harness-map-v1.md) §8. Ele segue Spec-Driven Development: **define** o pack, mas **não executa MCP, não altera Supabase, não cria schema, migration, tenant, RLS, policy ou função, não altera auth/storage e não altera `platform/`**. A execução do pack exigirá gate humano próprio, posterior e explícito.

---

## Pack Name

`supabase-mcp-readonly-inventory-pack-v1`

---

## Objective

Produzir, em uma única execução governada e 100% read-only, o **inventário de metadados do projeto Supabase** referenciado em [`.mcp.json`](../../../../.mcp.json) (`project_ref` público, sem secrets): tabelas, schemas, extensions, migrations registradas, policies, functions e advisors — com **zero escrita remota, zero escrita local e zero secret em output** — gerando a matéria-prima evidenciária para o baseline do estado-zero do projeto.

Resultado verificável: relatório de inventário redigido (sem secrets), `git status` limpo ao final, nenhuma mutação remota.

---

## Responsible Subagent

`supabase-mcp-agent` — **candidato**, conforme [`yzi-os-execution-harness-map-v1`](../yzi-os-execution-harness-map-v1.md) §6 (Supabase MCP Lane): "operações MCP governadas; nada local (remoto read-only por default); nunca qualquer escrita remota sem pack mutante aprovado".

Este pack **não cria** o subagent. Se o subagent real não existir no momento da execução autorizada, o papel é exercido pelo executor da task sob as mesmas restrições, sem que isso autorize criar definição em `.claude/agents`.

---

## Authorized Skills

Lista fechada — skill fora da lista não é carregada:

| Skill | Origem | Papel no pack |
| --- | --- | --- |
| `supabase` | local (`.agents/skills/supabase/`) | conhecimento operacional do MCP server, troubleshooting de conexão OAuth, checklist de segurança Supabase |
| `supabase-postgres-best-practices` | local (`.agents/skills/supabase-postgres-best-practices/`) | leitura qualificada do inventário (schema, índices, RLS) — somente interpretação, nunca otimização aplicada |
| `verification-loop` | adaptada — [`yzi-os-verification-loop-skill-adaptation-spec-v1`](../skills/yzi-os-verification-loop-skill-adaptation-spec-v1.md) | checks de validação do pack: git status limpo, diff zero, path check, secret scan no output |
| `security-review` | adaptada — [`yzi-os-security-review-skill-adaptation-spec-v1`](../skills/yzi-os-security-review-skill-adaptation-spec-v1.md) | vigilância de blocker classes durante a execução: `SECRET_EXPOSURE`, `MCP_MUTATION_RISK`, `SERVICE_ROLE_CLIENT_LEAK` |

As skills `verification-loop` e `security-review` são usadas **na forma adaptada definida pelas specs** acima — não instaladas, não copiadas; verificação nunca vira correção.

---

## Required Specs

Em ordem de autoridade (P0 > P1 > implementação > pack; o pack nunca relaxa uma spec):

1. [`yzi-os-supabase-mcp-governance-spec-v1`](../yzi-os-supabase-mcp-governance-spec-v1.md) — spec obrigatória da Supabase MCP Lane: default "nenhuma chamada MCP"; read-only só com task explícita; nenhum secret em output; Acceptance Criteria For Future MCP Validation (§) governam a aceitação desta execução;
2. [`yzi-os-execution-harness-map-v1`](../yzi-os-execution-harness-map-v1.md) — template de pack (§8), lane definition (§7), sequência otimizada (§9, item 1);
3. [`yzi-os-tenant-model-spec-v1`](../yzi-os-tenant-model-spec-v1.md) — contexto do que o inventário deve observar (estado-zero esperado: nenhuma tabela `tenants`/`tenant_memberships` criada);
4. [`yzi-os-persistence-spec-v1`](../yzi-os-persistence-spec-v1.md) — engine PostgreSQL decidido; gerar ≠ aplicar; nenhuma migration existe ou é criada;
5. [`yzi-os-verification-loop-skill-adaptation-spec-v1`](../skills/yzi-os-verification-loop-skill-adaptation-spec-v1.md) — verificar ≠ corrigir ≠ aplicar; Lane Usage "Supabase MCP Lane";
6. [`yzi-os-security-review-skill-adaptation-spec-v1`](../skills/yzi-os-security-review-skill-adaptation-spec-v1.md) — blocker classes e secret masking (`[SECRET_DETECTED — valor omitido]`).

---

## Required Knowledge

Consulta direcionada (harness map §10 — artigo certo, seção certa, propósito declarado):

- `.agents/skills/supabase/SKILL.md` — seções "Supabase MCP Server" (troubleshooting de conexão/OAuth) e "Security checklist" (service role, exposição de keys);
- `.agents/skills/supabase-postgres-best-practices/SKILL.md` — categorias `security-` e `schema-` para leitura qualificada do inventário;
- [`yzi-os-supabase-mcp-governance-spec-v1`](../yzi-os-supabase-mcp-governance-spec-v1.md) — "Acceptance Criteria For Future MCP Validation" e "Stop Criteria" (lidos integralmente antes da primeira chamada MCP).

O subagent **não** carrega a base de conhecimento inteira — apenas este recorte.

---

## Required Current-State Inspection

Antes de qualquer chamada MCP, a execução autorizada DEVE verificar:

1. **`git status` limpo** — nenhuma mudança pendente no repositório; se houver, parar e reportar;
2. **`.mcp.json` íntegro** — contém apenas endpoint HTTP e `project_ref` (identificador público); nenhum token, senha ou connection string presente;
3. **Autenticação OAuth ativa** — sessão MCP autenticada pelo humano via OAuth; se a autenticação exigir manipular ou exibir qualquer secret, parar e reportar;
4. **Ferramentas MCP disponíveis** — confirmar quais tools o server expõe na sessão e que existe subconjunto read-only suficiente para o inventário; registrar os nomes exatos observados;
5. **Projeto correto** — toda operação dirigida exclusivamente ao `project_ref` declarado em `.mcp.json`; qualquer outro projeto é violação imediata.

---

## Allowed Paths

**Nenhum arquivo local gravável.**

Lista fechada de paths graváveis: vazia. A execução não cria, não edita e não remove nenhum arquivo do repositório. A evidência é o **output redigido** da sessão (governance spec, Acceptance Criteria item 5). O registro da evidência em arquivo é objeto do próximo pack (`Supabase Project Baseline Evidence Pack`), não deste.

---

## Allowed Remote Operations

**Somente operações MCP read-only de inventário de metadados**, listadas uma a uma. Operação fora desta lista é proibida por default. Os nomes exatos das tools serão confirmados na sessão MCP no momento da execução autorizada (Current-State Inspection, item 4); as categorias autorizadas são:

| # | Operação candidata (categoria) | O que retorna |
| --- | --- | --- |
| 1 | Listar tabelas/schemas do banco | nomes de schemas e tabelas existentes (estado-zero esperado: sem tabelas de negócio) |
| 2 | Listar extensions instaladas | extensions Postgres ativas no projeto |
| 3 | Listar migrations registradas | histórico de migrations do projeto (esperado: vazio ou apenas baseline da Supabase) |
| 4 | Listar policies RLS existentes | policies por tabela (esperado: nenhuma policy de negócio) |
| 5 | Listar functions do banco / edge functions | funções existentes (esperado: nenhuma de negócio) |
| 6 | Consultar advisors read-only (security/performance) | findings dos advisors da Supabase, sem aplicar nada |
| 7 | Consultar metadados gerais do projeto (nome, região, status) | informação não-secreta de configuração |
| 8 | Buscar documentação (`search_docs` ou equivalente) | snippets de docs públicas, se necessário para interpretar resultado |

**Exclusão explícita dentro do read-only:** operações que retornam **chaves ou credenciais** (anon key, service role key, connection string, JWT secret ou equivalentes) são **proibidas neste pack**, ainda que tecnicamente read-only — a regra de secrets da governance spec (§6) prevalece sobre a classificação read-only.

---

## Forbidden Operations

Além do default (tudo que não está em Allowed Remote Operations é proibido), ficam explicitamente proibidos:

- **SQL** — nenhuma execução de SQL, nem `SELECT` arbitrário (inventário usa apenas tools de metadados; se uma tool exigir SQL livre, parar e reportar);
- **create / alter / drop** — nenhum DDL de qualquer natureza;
- **insert / update / delete** — nenhum DML de qualquer natureza;
- **RLS / policy** — nenhuma criação, alteração ou remoção de policy;
- **function** — nenhuma criação, alteração, deploy ou remoção de função (banco ou edge);
- **storage** — nenhuma operação de leitura ou escrita em buckets/objetos;
- **auth** — nenhuma alteração de configuração de auth, providers, users ou sessões;
- **tenant** — nenhuma criação de tenant, real ou de teste;
- **seed** — nenhuma inserção de dado de qualquer natureza;
- **migration** — nenhuma geração, aplicação ou registro de migration;
- **recuperação de secrets** — nenhuma tool que retorne keys, tokens ou connection strings;
- **escrita local** — nenhum arquivo do repositório criado, editado ou removido; nenhum staging, commit ou push;
- **operação sobre outro projeto** — nada fora do `project_ref` declarado em `.mcp.json`.

---

## Stop Criteria

Parar imediatamente a execução e reportar ao humano se:

- qualquer operação necessária implicar **escrita remota** de qualquer natureza (blocker `MCP_MUTATION_RISK`);
- qualquer **secret** aparecer em output, log ou diff — reportar mascarado como `[SECRET_DETECTED — valor omitido]`, nunca com o valor (blocker `SECRET_EXPOSURE`);
- a sessão MCP exigir **executar SQL** ou instalar dependência para concluir o inventário;
- a tool disponível operar sobre **projeto diferente** do `project_ref` declarado;
- `git status` deixar de estar limpo em qualquer ponto da execução;
- a autenticação OAuth exigir exibir, copiar ou armazenar qualquer credencial;
- o conjunto de tools read-only disponível for **insuficiente** para o inventário (não improvisar com tools de escrita ou SQL);
- houver **qualquer ambiguidade de escopo** — bloquear, nunca presumir (governance spec, Stop Criteria).

---

## Validation Commands/Checks

Checks objetivos de aceitação, todos read-only (verification-loop adaptada, Lane Usage "Supabase MCP Lane"):

| Check | Verificação | Aceitação |
| --- | --- | --- |
| `git-status-check` | `git status` ao final da execução | limpo — zero arquivos modificados, staged ou untracked |
| `diff-check` | `git diff` ao final | vazio — zero alterações locais |
| `operations-audit` | lista de toda chamada MCP feita vs. Allowed Remote Operations | 100% das chamadas dentro da lista; zero chamadas de escrita |
| `secret-scan-output` | inspeção do output completo da sessão por padrões de secret (keys, tokens, connection strings) | zero secrets; qualquer detecção = blocker reportado mascarado |
| `path-check` | arquivos locais tocados | zero — Allowed Paths é vazio |
| `project-ref-check` | projeto alvo de cada chamada | exclusivamente o `project_ref` de `.mcp.json` |
| `evidence-completeness` | evidence output contém todos os campos exigidos abaixo | completo |

Estes checks correspondem 1:1 aos Acceptance Criteria For Future MCP Validation da [`yzi-os-supabase-mcp-governance-spec-v1`](../yzi-os-supabase-mcp-governance-spec-v1.md).

---

## Evidence Output

A evidência do pack é o **relatório de inventário redigido**, produzido como output textual da sessão (nenhum arquivo local é gravado). Campos mínimos:

| Campo | Conteúdo esperado |
| --- | --- |
| **pack executed** | `supabase-mcp-readonly-inventory-pack-v1` + data/hora da execução |
| **operations performed** | lista de cada chamada MCP: tool exata usada, categoria autorizada correspondente, resultado resumido |
| **inventory summary** | schemas e tabelas encontrados; extensions; migrations registradas; policies; functions; advisors findings — tudo redigido, sem secrets |
| **zero-write confirmation** | confirmação explícita: nenhuma operação de escrita remota ocorreu |
| **secrets confirmed absent** | confirmação explícita: nenhum secret em output, log ou diff |
| **files touched** | `NENHUM` — confirmação de zero escrita local |
| **git status** | saída final de `git status` (limpo) |
| **forbidden actions confirmed absent** | nenhum SQL, DDL, DML, RLS, function, storage, auth, tenant, seed, migration, recuperação de secret |
| **blocker class if any** | classe(s) detectada(s) ou `NONE` |
| **stop events** | qualquer stop criterion acionado, ou `NONE` |
| **next recommended pack** | `Supabase Project Baseline Evidence Pack` (não autorizado por este evidence) |

---

## Commit Policy

**Nenhum commit esperado na execução read-only.**

- A execução não cria nem altera arquivos — não há o que commitar;
- Nenhum staging, commit ou push é permitido durante a execução;
- `git status` limpo ao final é critério de aceitação, não efeito colateral;
- Secrets **nunca** entram em commit em nenhuma hipótese (regra permanente, herdada da governance spec §6).

O registro do inventário em arquivo versionado é responsabilidade do próximo pack, com gate próprio.

---

## Next Pack Candidate

`Supabase Project Baseline Evidence Pack` — registrar em arquivo versionado a evidência do estado-zero do projeto remoto (baseline auditável pré-schema), conforme [`yzi-os-execution-harness-map-v1`](../yzi-os-execution-harness-map-v1.md) §9, item 2.

`That pack is NOT authorized by this document.` Exigirá definição própria e gate humano próprio.

---

## What This Does Not Authorize

`This pack spec does NOT authorize:`

- executar qualquer chamada MCP agora (a execução do pack exige gate humano próprio e posterior);
- executar SQL por qualquer via;
- create/alter/drop, insert/update/delete;
- criar ou alterar RLS, policy ou função;
- alterar storage ou auth;
- criar tenant (real ou de teste);
- criar seed ou migration;
- alterar Supabase em qualquer nível;
- alterar `platform/`;
- alterar `.claude/agents` ou `.agents/skills`;
- criar o subagent `supabase-mcp-agent`;
- instalar ou copiar skills;
- deploy ou alteração em produção.

Regra de gate (harness map §8): **um pack = um gate humano**. Este documento define o pack; a aprovação humana explícita da execução é o gate — e ainda não ocorreu.

---

## Final Status

`PACK_SPEC_COMPLETE_DOCUMENTARY_ONLY_MCP_EXECUTION_NOT_AUTHORIZED`
