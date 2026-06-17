# YZI OS Security Review Skill Adaptation Spec v1

## Readiness Statement

`YZI_OS_SECURITY_REVIEW_SKILL_ADAPTATION_SPEC_V1_CREATED_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`

Este documento segue Spec-Driven Development: **define** a adaptação documental da skill ECC `security-review` para o YZI OS, mas **não instala a skill, não copia a skill, não cria subagent, não altera `.claude/agents`, não altera `.agents/skills`, não executa security scan real, não altera `platform/`, não executa MCP, não cria backend, schema, frontend, não altera Supabase e não realiza deploy**.

---

## Purpose

Adaptar o padrão ECC `security-review` para o modelo YZI OS de Execution Packs — com foco em **tenant isolation, Supabase, secrets, RLS, API boundaries e service role safety** — definindo, em nível documental, como o padrão de revisão de segurança do ECC pode orientar os checks de segurança dos packs sem induzir auto-fix, criação de RLS/auth, aplicação de migration ou qualquer ação fora do gate humano autorizado.

A adaptação preserva o valor central da skill (checklist estruturado de vulnerabilidades verificável antes de transições de estado) e adiciona os checks de invariante específicos do YZI OS (tenant isolation P0, service role safety, secret prohibition) enquanto neutraliza os comportamentos incompatíveis com o SDD.

Fontes normativas desta spec, em ordem de autoridade:
- [`docs/specs/p0/tenant-boundary.spec.md`](../../p0/tenant-boundary.spec.md) — fronteira de tenant como invariante de engenharia P0
- [`docs/specs/p1/tenant-state-isolation.spec.md`](../../p1/tenant-state-isolation.spec.md) — isolamento de estado por tenant; todas as formas de cruzamento proibidas
- [`docs/specs/p1/event-driven-state.spec.md`](../../p1/event-driven-state.spec.md) — toda mudança de estado por evento auditável
- [`docs/specs/implementation/yzi-os-execution-harness-map-v1.md`](../yzi-os-execution-harness-map-v1.md) — harness de execução; packs, lanes, evidence
- [`docs/specs/implementation/yzi-os-reusable-agent-skill-map-v1.md`](../yzi-os-reusable-agent-skill-map-v1.md) — decisão ADAPT_FOR_YZI_OS e prioridade Alta
- [`docs/specs/implementation/yzi-os-supabase-mcp-governance-spec-v1.md`](../yzi-os-supabase-mcp-governance-spec-v1.md) — proibições MCP e secret rules
- [`docs/specs/implementation/yzi-os-tenant-model-spec-v1.md`](../yzi-os-tenant-model-spec-v1.md) — `tenant_id NOT NULL` obrigatório; enforcement em camadas
- [`docs/specs/implementation/yzi-os-persistence-spec-v1.md`](../yzi-os-persistence-spec-v1.md) — gerar ≠ aplicar; secrets somente em `.env.local`
- [`docs/specs/implementation/skills/yzi-os-verification-loop-skill-adaptation-spec-v1.md`](./yzi-os-verification-loop-skill-adaptation-spec-v1.md) — spec irmã; verificar ≠ corrigir ≠ aplicar

---

## Source Skill

### Nome

`security-review` — origem: repositório ECC ([affaan-m/ECC](https://github.com/affaan-m/ECC/tree/main/.agents/skills))

### Finalidade Original

Executar um checklist estruturado de revisão de segurança durante o desenvolvimento — identificando vulnerabilidades comuns (injection, autenticação, autorização, exposição de dados sensíveis, configuração incorreta, dependências vulneráveis, etc.) e recomendando ou aplicando remediações antes de merge/deploy.

Posicionamento no ECC: skill de **Qualidade/Verificação**, usada por agentes de auditoria e implementação para garantir que o código não introduz vetores de ataque conhecidos.

### Partes Úteis para YZI OS

- Estrutura de checklist por categoria de risco (injection, auth, exposure, config, deps);
- Abordagem de finding por blocker/warning com descrição do risco e localização no código;
- Revisão de boundary de API (o que o endpoint expõe, quem pode chamar, o que valida);
- Inspeção estática de padrões de secret (tokens, chaves, connection strings em código ou output);
- Verificação de escopo de permissão em operações de acesso a dados;
- Orientação para revisar input validation antes de qualquer operação de persistência;
- Conceito de dependency risk (verificar dependências com CVEs conhecidos);
- Produção de evidence report estruturado por área revisada.

### Partes que Precisam Ser Neutralizadas ou Restringidas

| Comportamento ECC | Razão da Neutralização | Regra YZI OS Aplicada |
| --- | --- | --- |
| Aplicar remediações automaticamente (auto-fix de segurança) | Correção exige pack próprio com gate; security review não é security fix | `verificar ≠ corrigir ≠ aplicar` — spec irmã [`verification-loop`](./yzi-os-verification-loop-skill-adaptation-spec-v1.md) |
| Criar ou modificar RLS policies como remediation | RLS não está autorizado nesta fase; exigirá spec própria | [`yzi-os-persistence-spec-v1`](../yzi-os-persistence-spec-v1.md) §Out of Scope |
| Criar ou modificar auth/session config como remediation | Auth exige spec própria e gate humano | Tenant model §Out of Scope |
| Aplicar migration como fix de security schema | Gerar ≠ aplicar; migration exige pack dedicado | [`yzi-os-persistence-spec-v1`](../yzi-os-persistence-spec-v1.md) §Disciplina |
| Executar chamadas MCP como parte do review | MCP default = proibido | [`yzi-os-supabase-mcp-governance-spec-v1`](../yzi-os-supabase-mcp-governance-spec-v1.md) §3 |
| Instalar scanner de dependências como step do review | Instalação exige pack próprio | Platform scaffold §6 |
| Operar fora dos allowed paths do pack | Toda revisão é restrita ao escopo do pack ativo | [`yzi-os-execution-harness-map-v1`](../yzi-os-execution-harness-map-v1.md) §8 |
| Expor secrets em findings/output | Nenhum finding pode conter connection string, token ou chave real | MCP governance §6; persistence spec §Stop Conditions |

---

## YZI OS Security Principles

Os princípios abaixo são **invariantes** — não configurações. A skill adaptada deve orientar verificações que confiram aderência a cada um deles; desvio de qualquer princípio é blocker, não warning.

### Tenant isolation é invariante P0

Todo acesso a dados, route, service, tool execution e delegação opera **dentro de um único tenant**. Nenhum caminho atravessa a fronteira entre tenants — por leitura, inferência, composição, recuperação, projeção ou alteração ([`tenant-boundary`](../../p0/tenant-boundary.spec.md) §6, [`tenant-state-isolation`](../../p1/tenant-state-isolation.spec.md) §7). Ausência de `tenant_id` em entidade de negócio, query sem escopo de tenant explícito, ou route que retorna dados de tenant indeterminado são **blockers** da classe `TENANT_ISOLATION_RISK`.

### Service role nunca pode ir para client/browser/output/log/commit

O service role key do Supabase (e qualquer chave com privilégio bypass-RLS ou admin) tem acesso irrestrito ao banco. Ele **NUNCA** pode aparecer em:
- código client-side ou bundle de browser;
- output de chat, log, trace ou diff;
- commit de qualquer arquivo do repositório;
- arquivo fora de `platform/.env.local` (nunca versionado).

Qualquer detecção de service role key fora deste perímetro é blocker `SERVICE_ROLE_CLIENT_LEAK` — parada imediata.

### Gerar ≠ aplicar — migrations são artefatos auditáveis, não comandos

Migration SQL gerada pelo Drizzle é um **artefato revisável** — não um comando executado. A skill verifica que nenhum código aplica migration automaticamente; que toda migration é versionada, commitada e revisada por humano; e que o agente/LLM não aplica migration por iniciativa própria ([`yzi-os-persistence-spec-v1`](../yzi-os-persistence-spec-v1.md) §Disciplina).

### Secrets nunca em repositório, output, log, diff ou commit

Connection strings, tokens, API keys, senhas, Supabase anon/service keys e qualquer material criptográfico são proibidos em qualquer artefato versionado ou output legível ([`yzi-os-supabase-mcp-governance-spec-v1`](../yzi-os-supabase-mcp-governance-spec-v1.md) §6). Secret detectado = blocker `SECRET_EXPOSURE` — parada imediata.

### Dúvida de fronteira bloqueia ou escala — nunca presume

Quando a identidade de tenant de um dado, caminho ou operação estiver ausente, ambígua ou conflitante, a operação DEVE ser bloqueada e registrada. A skill sinaliza qualquer caminho onde o tenant não é verificado explicitamente antes do acesso ([`tenant-boundary`](../../p0/tenant-boundary.spec.md) §9).

### Nenhuma query global sem escopo de tenant explícito

Toda query à camada de persistência DEVE passar por ponto único que exige `tenant_id` explícito. Query sem filtro de tenant é blocker `TENANT_ISOLATION_RISK` — mesmo que o resultado "casual" seja correto, a ausência do scope é a vulnerabilidade.

### RLS é segunda linha de defesa, não única

O isolamento primário é imposto pela camada de acesso a dados (código). RLS no Postgres, quando existir (spec futura), é redundância — não substituto da camada de acesso. A skill verifica que o código não depende unicamente de RLS para isolar tenants.

### Input validation ocorre na boundary, antes da persistência

Todo dado externo (input de usuário, payload de API, parâmetro de route) deve ser validado e sanitizado antes de qualquer operação de persistência. A skill verifica ausência de injection risk e de dado não-validado chegando à camada de acesso.

---

## Allowed Use In YZI OS

A skill adaptada `security-review` **poderá orientar** (dentro de um pack com gate humano aprovado) as seguintes revisões:

- **Tenant isolation check** — verificar que todas as queries têm `tenant_id` explícito; que nenhuma route retorna dados de tenant indeterminado; que delegação não transfere acesso cross-tenant;
- **Secret scan** — inspeção estática de arquivos por padrões de secret (service role key, anon key, connection string, token, senha) em código commitado ou staged;
- **Service role safety review** — confirmar que service role key não aparece em código client-side, bundle, output, log ou diff;
- **RLS policy review** (quando políticas existirem) — verificar que as políticas cobrem todas as operações esperadas e não têm bypass não-intencional;
- **API boundary review** — verificar o que cada endpoint expõe, quem pode chamar (auth check), o que valida (input), e se retorna dados de tenant correto;
- **Migration safety review** — revisar migration SQL gerada quanto a: ausência de `tenant_id`, remoção de constraint, coluna nullable em tabela de negócio, operação irreversível sem plano de rollback;
- **Auth boundary check** — verificar que rotas protegidas têm verificação de auth antes de qualquer acesso a dados; que sessão/token é validada server-side;
- **Input validation review** — verificar sanitização e validação de input antes de uso em queries, comandos ou respostas;
- **Dependency risk scan** — inspecionar `package.json` por dependências com CVEs conhecidos (inspeção documental/estática; sem instalação de scanner);
- **Production change absence check** — confirmar que nenhum artefato do pack altera configuração de produção, variável de ambiente de produção ou recurso remoto.

---

## Forbidden Use

A skill adaptada **não pode** orientar, induzir, sugerir ou executar:

- **Aplicar auto-fix de segurança** — nenhuma correção automática como efeito da revisão;
- **Criar ou modificar RLS policies** — RLS não está autorizado nesta fase; exige spec própria;
- **Criar ou modificar configuração de auth** — auth exige spec e gate próprios;
- **Aplicar migration** — mesmo migration corretiva de security; exige pack dedicado com gate;
- **Executar MCP** — qualquer chamada ao Supabase MCP ou outro server;
- **Instalar dependências** — incluindo scanners de segurança como `npm audit --fix` ou equivalente;
- **Alterar arquivos de configuração de produção** — qualquer arquivo `.env.production`, secrets manager, ou config de deploy;
- **Expor secrets em findings** — nenhum finding pode conter o valor real de um secret (mascarar: `[REDACTED]`);
- **Operar fora dos allowed paths do pack** — a revisão é restrita ao escopo declarado no pack ativo;
- **Ampliar escopo** — identificar um risco em outro módulo não autoriza inspecionar ou modificar esse módulo;
- **Commitar sem política do pack** — nenhum staging, commit ou push sem a política de commit do pack ativo.

---

## Pack Integration

Como a skill adaptada entra no **Execution Pack Template** ([`harness-map`](../yzi-os-execution-harness-map-v1.md) §8):

### Validation commands/checks

A skill orienta os checks de segurança a declarar no campo `Validation commands/checks` do pack. Cada check é read-only, com output capturável:

```
secret-scan        → busca estática por padrões de secret nos allowed paths
tenant-scope-check → revisão manual/semi-automática de queries por tenant_id
api-boundary-check → revisão de routes: auth check, input validation, tenant scope
migration-review   → revisão do SQL gerado: constraints, nullable, irreversibilidade
dep-risk-scan      → npm audit (leitura) ou revisão de package.json por CVEs conhecidos
service-role-check → grep por service role key em código client-side e bundle
```

### Evidence output

A skill orienta a estrutura do campo `Evidence output` do pack: para cada área revisada, o evidence record inclui a área revisada, os checks aplicados, os findings (com blocker class se aplicável), os arquivos inspecionados, a confirmação de ausência de ações proibidas e a recomendação. Secrets encontrados são reportados como `[SECRET_DETECTED — valor omitido]`, nunca com o valor exposto.

### Stop criteria

A skill orienta os `Stop criteria` de segurança do pack: qualquer finding de blocker class (§ Security Blocker Classes abaixo) interrompe imediatamente a execução do pack e reporta ao humano. O pack não avança enquanto o blocker não for resolvido por pack dedicado com gate.

### Commit policy

A skill orienta o pré-commit de segurança declarado no campo `Commit policy` do pack: nenhum commit com secret detectado; nenhum commit de arquivo client-side contendo service role key; somente arquivos dentro dos `allowed paths` stageable; nenhum arquivo `.env.production` ou equivalente staged.

### Regression risk handoff

A skill orienta o campo `Next pack candidate` quando findings são identificados: para cada blocker class detectado, sugerir o pack de remediation correspondente — nunca aplicar a correção no pack atual de revisão.

---

## Lane Usage

| Lane | Security Focus | Examples |
| ---- | -------------- | -------- |
| **Database Lane** | tenant_id NOT NULL em toda tabela de negócio; constraints de FK; ausência de nullable indevido em migrations; RLS consistency (quando existir); migration irreversibility check | Revisar DDL gerado por `drizzle-kit`: toda tabela tem `tenant_id uuid NOT NULL`; FK para `tenants.id` existe; nenhuma migration remove constraint crítica sem plano de rollback |
| **Backend Lane** | API boundary (auth check antes de acesso a dados, input validation, tenant-scoped queries); ausência de service role key em rotas server-side expostas; route sem auth check | Revisar routes em `platform/src/app/api/`: toda route verifica sessão antes de query; toda query tem filtro `tenant_id`; input validado antes de persistência; service role key somente em server context isolado |
| **Frontend Lane** | Ausência de service role key ou secret no bundle/client; ausência de dados de outro tenant em componentes; CSRF/XSS básico em inputs de formulário | Confirmar que `platform/src/app/` e `platform/src/components/` não importam service role key; nenhum dado de tenant hardcoded; inputs sanitizados antes de envio |
| **Supabase MCP Lane** | Ausência de secrets em output MCP; ausência de operação mutante não-autorizada; git status limpo após inspeção; nenhum service role key em chat/log/output | Verificar que output da sessão MCP não contém connection string, service role key ou anon key; confirmar zero escrita remota; `git status` limpo |
| **Integration Lane** | Boundary cross-lane: nenhum dado de schema/db vaza para frontend sem passar pela access layer; nenhuma route de backend retorna dados sem tenant scope; costura respeitando os allowed paths de ambas as lanes | Revisar que integração cockpit ↔ access layer não cria bypass de tenant scope; que componentes frontend não recebem `tenant_id` de outra origem que não a sessão autenticada |
| **Design/Site Lane** | **Escopo limitado** — verificar ausência de secrets em assets, scripts e variáveis de ambiente do site; nenhuma chamada a API de negócio com credenciais hardcoded | Confirmar que scripts de site não contêm API keys; nenhum `fetch` hardcoded para endpoints de produção com credenciais |
| **Audit/Governance Lane** | Verificação transversal de evidence records: confirmar que nenhum evidence record expõe secret; que blocker classes foram registradas e não suprimidas; que o auditor é independente do executor | Revisar evidence records dos packs auditados: nenhum secret exposto; todos os blockers documentados; agente auditor não modificou o que auditou |

---

## Security Blocker Classes

As classes abaixo definem os tipos de finding que **bloqueiam imediatamente** o pack e exigem parada + reporte ao humano. Um finding de blocker class não pode ser suprimido nem postergado dentro do pack ativo — exige pack dedicado de remediation com gate.

| Blocker Class | Definição | Trigger Condition |
| --- | --- | --- |
| `SECRET_EXPOSURE` | Qualquer secret (service role key, anon key, token, senha, connection string, API key) presente em código, output, log, diff ou commit | Detecção de qualquer padrão de secret fora de `platform/.env.local` (nunca versionado) |
| `TENANT_ISOLATION_RISK` | Query, route, service ou delegação que acessa dados sem escopo de tenant explícito; ausência de `tenant_id` em entidade de negócio | Query sem `tenant_id` filter; tabela de negócio sem `tenant_id NOT NULL`; route que retorna dados de tenant indeterminado |
| `SERVICE_ROLE_CLIENT_LEAK` | Service role key (ou qualquer chave com bypass-RLS) detectada em código client-side, bundle, componente frontend, output, log ou diff | Grep por padrões de service role em `platform/src/app/` (client context), `platform/src/components/`, bundle gerado, ou qualquer output de sessão |
| `RLS_POLICY_UNAUTHORIZED` | Política RLS ausente onde deveria existir (quando RLS estiver ativado) ou política que cria bypass não-intencional de tenant isolation | RLS ativada sem política para tabela de negócio; política `USING (true)` irrestrita em tabela tenant-scoped |
| `MCP_MUTATION_RISK` | Operação via MCP que escreve, altera ou aplica qualquer mudança remota sem pack mutante aprovado | Detecção de chamada MCP de escrita em qualquer contexto não autorizado por pack mutante explícito |
| `MIGRATION_APPLY_RISK` | Migration aplicada automaticamente, sem autorização explícita ou sem artefato SQL versionado correspondente | `drizzle-kit push` sem gate; migration aplicada dentro de pack não-autorizado para aplicação; migration sem arquivo SQL commitado |
| `AUTH_BOUNDARY_RISK` | Route ou server action que acessa dados sem verificar sessão/auth antes; token/sessão validado client-side apenas | Route sem check de sessão antes de query; sessão inferida sem validação server-side |
| `INPUT_VALIDATION_RISK` | Dado externo (user input, payload de API, parâmetro de route) usado em query ou persistência sem sanitização/validação | Input direto em query sem parse/validate; `req.body` ou `params` sem schema validation antes de uso |
| `DEPENDENCY_RISK` | Dependência com CVE crítico ou alto conhecido no `package.json` do app | `npm audit` reportando vulnerabilidade critical/high; dependência desatualizada com patch de segurança disponível |
| `PRODUCTION_CHANGE_RISK` | Qualquer alteração em configuração de produção, variável de ambiente de produção, recurso remoto ou infra fora do escopo do pack | Arquivo `.env.production` staged; mutation de recurso Supabase de produção; alteração de config de deploy |

---

## Required Evidence Pattern

Todo uso da skill adaptada **deve produzir**, no evidence record do pack, os seguintes campos mínimos por área revisada:

| Campo | Conteúdo esperado |
| --- | --- |
| **reviewed area** | Descrição da área revisada (ex.: "API routes em platform/src/app/api/tenant/") |
| **security checks applied** | Lista de blocker classes verificadas nesta área (ex.: TENANT_ISOLATION_RISK, AUTH_BOUNDARY_RISK) |
| **findings** | Lista de findings: para cada finding, blocker class, localização, descrição do risco; secrets reportados como `[SECRET_DETECTED — valor omitido]` |
| **blocker class if any** | Classe(s) de blocker encontrada(s), ou `NONE` se nenhum blocker detectado |
| **files/outputs inspected** | Lista de arquivos lidos/inspecionados; deve estar inteiramente dentro dos `allowed paths` do pack |
| **forbidden actions confirmed absent** | Confirmação explícita: nenhum auto-fix de segurança, nenhuma criação de RLS/auth, nenhuma migration aplicada, nenhum MCP, nenhum secret exposto em output, nenhum commit não-autorizado ocorreu |
| **recommendation** | Para cada blocker: pack de remediation sugerido e classe de risk; para findings de warning: nota documental |
| **next pack candidate** | Nome do pack seguinte sugerido (não autorizado pelo evidence); se blockers encontrados, pack de remediation; se aprovado, pack de implementação seguinte |

---

## What This Does Not Authorize

`This spec does NOT authorize:`

- instalar a skill;
- copiar a skill;
- criar subagent;
- alterar `.agents/skills`;
- alterar `.claude/agents`;
- executar security scan real;
- alterar `platform/`;
- executar MCP;
- criar backend;
- criar schema;
- criar frontend;
- alterar Supabase;
- deploy.

Cada uso real da skill adaptada ocorrerá dentro de um Execution Pack com gate humano próprio, conforme [`yzi-os-execution-harness-map-v1`](../yzi-os-execution-harness-map-v1.md) §8.

---

## Final Status

`SPEC_COMPLETE_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`

---

## Validação

**Commit da verification-loop spec:** `ce7a402` — `docs: add verification-loop skill adaptation spec v1` ✅

**Arquivo security-review spec criado:** `docs/specs/implementation/skills/yzi-os-security-review-skill-adaptation-spec-v1.md` ✅

**Fontes lidas:**
1. `docs/specs/implementation/yzi-os-execution-harness-map-v1.md` ✅
2. `docs/specs/implementation/yzi-os-reusable-agent-skill-map-v1.md` ✅
3. `docs/specs/implementation/skills/yzi-os-verification-loop-skill-adaptation-spec-v1.md` ✅ (conteúdo de autoria desta sessão)
4. `docs/specs/implementation/yzi-os-supabase-mcp-governance-spec-v1.md` ✅
5. `docs/specs/implementation/yzi-os-tenant-model-spec-v1.md` ✅
6. `docs/specs/implementation/yzi-os-persistence-spec-v1.md` ✅
7. `docs/specs/p0/tenant-boundary.spec.md` ✅
8. `docs/specs/p1/tenant-state-isolation.spec.md` ✅
9. `.agents/skills/` — examinado: `security-review` não está instalada localmente (confirmado) ✅
10. Referência ECC `security-review` — consultada via `yzi-os-reusable-agent-skill-map-v1` §5, §6 ✅

**Referência ECC consultada:** `security-review` classificada como `ADAPT_FOR_YZI_OS`, prioridade Alta, domínio "checklist de vulnerabilidades", adaptação necessária: "adicionar checks de tenant isolation/RLS e proibição de secrets do YZI OS".

**O que foi adaptado:**
- Checklist estruturado de vulnerabilidades — preservado como orientação para Validation commands/checks dos packs;
- Estrutura de finding por área — adaptada ao Required Evidence Pattern do YZI OS;
- Stop criteria por blocker class — alinhados ao modelo de gate do harness;
- Tenant isolation check — adicionado como check obrigatório (invariante P0 não existia no ECC original);
- Service role safety — adicionado como princípio e blocker class específico do YZI OS/Supabase;
- 10 blocker classes definidas com trigger conditions claras.

**O que foi proibido/neutralizado:**
- Auto-fix de segurança — proibido;
- Criação/modificação de RLS policies — proibido;
- Criação/modificação de auth/session config — proibido;
- Aplicação de migration — proibido;
- Execução de MCP — proibido;
- Instalação de scanners de segurança — proibido;
- Alteração de configuração de produção — proibido;
- Exposição de secrets em findings — proibido (mascarar com `[SECRET_DETECTED — valor omitido]`);
- Operação fora dos allowed paths do pack — proibido.

**Classes de bloqueio definidas:** `SECRET_EXPOSURE`, `TENANT_ISOLATION_RISK`, `SERVICE_ROLE_CLIENT_LEAK`, `RLS_POLICY_UNAUTHORIZED`, `MCP_MUTATION_RISK`, `MIGRATION_APPLY_RISK`, `AUTH_BOUNDARY_RISK`, `INPUT_VALIDATION_RISK`, `DEPENDENCY_RISK`, `PRODUCTION_CHANGE_RISK`

**Confirmação de não-implementação:** nada foi implementado. A spec é documental.

**Confirmação de não-alteração de `.claude/agents`:** `.claude/agents` não foi alterado ✅

**Confirmação de não-alteração de `.agents/skills`:** `.agents/skills` não foi alterado ✅

**Confirmação de não-alteração de `platform/`:** `platform/` não foi alterado ✅

**Próximo passo recomendado:** aprovação humana desta spec; depois (task própria com gate) specs de adaptação das demais skills de prioridade Alta restantes da primeira leva: `backend-patterns`, `api-design`, `coding-standards` — conforme [`yzi-os-reusable-agent-skill-map-v1`](../yzi-os-reusable-agent-skill-map-v1.md) §10, passo 3.

---

## Critério de Parada

Parar e reportar se:

- houver mudança pendente inesperada antes do commit;
- a referência ECC `security-review` não puder ser consultada;
- qualquer fonte obrigatória estiver ausente;
- houver necessidade de alterar `.agents/skills`;
- houver necessidade de alterar `.claude/agents`;
- houver necessidade de alterar `platform/`;
- houver ambiguidade sobre o arquivo de destino;
- houver qualquer tentativa de implementação.
