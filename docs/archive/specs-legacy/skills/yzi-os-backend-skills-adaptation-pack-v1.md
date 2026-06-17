# YZI OS Backend Skills Adaptation Pack v1

## Readiness Statement

`YZI_OS_BACKEND_SKILLS_ADAPTATION_PACK_V1_CREATED_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`

Este documento segue Spec-Driven Development: **define** a adaptação documental consolidada das skills ECC `backend-patterns`, `api-design` e `coding-standards` para a Backend Lane do YZI OS, mas **não instala skills, não copia skills, não cria subagent, não altera `.claude/agents`, não altera `.agents/skills`, não cria backend real, não cria API route real, não cria service real, não cria schema, não cria nem aplica migration, não executa MCP, não altera Supabase, não cria frontend, não altera `platform/` e não realiza deploy**.

---

## Purpose

Adaptar de forma **consolidada** as três skills ECC da Backend Lane — `backend-patterns`, `api-design` e `coding-standards` — para o modelo YZI OS de Execution Packs, definindo, em nível documental, como os padrões de backend do ECC podem orientar a futura implementação de services, API routes, server actions e camada de acesso tenant-aware, sem induzir criação de schema, aplicação de migration, alteração de RLS, exposição de service role ou qualquer ação fora do gate humano autorizado.

As três skills são adaptadas em uma única spec porque operam juntas na mesma lane ([`yzi-os-reusable-agent-skill-map-v1`](../yzi-os-reusable-agent-skill-map-v1.md) §7 Backend Lane) e compartilham o mesmo conjunto de invariantes (tenant scope, contrato leitura/escrita/evidência, allowed paths). A consolidação evita três specs quase idênticas — agilidade governada, não micro-burocracia ([`harness-map`](../yzi-os-execution-harness-map-v1.md) §3).

Fontes normativas desta spec, em ordem de autoridade:
- [`docs/specs/p0/tenant-boundary.spec.md`](../../p0/tenant-boundary.spec.md) — fronteira de tenant como invariante de engenharia P0
- [`docs/specs/p1/operational-state.spec.md`](../../p1/operational-state.spec.md) — estado persistido como fonte de verdade; contrato leitura/escrita/evidência (§9)
- [`docs/specs/p1/event-driven-state.spec.md`](../../p1/event-driven-state.spec.md) — toda mudança de estado por evento auditável; sem mutação silenciosa
- [`docs/specs/p1/tenant-state-isolation.spec.md`](../../p1/tenant-state-isolation.spec.md) — todo estado é tenant-scoped; nenhum acesso cross-tenant
- [`docs/specs/implementation/yzi-os-execution-harness-map-v1.md`](../yzi-os-execution-harness-map-v1.md) — harness de execução; Backend Lane (§7), Pack Template (§8)
- [`docs/specs/implementation/yzi-os-reusable-agent-skill-map-v1.md`](../yzi-os-reusable-agent-skill-map-v1.md) — decisão ADAPT_FOR_YZI_OS e prioridade Alta das três skills (§6)
- [`docs/specs/implementation/yzi-os-tenant-model-spec-v1.md`](../yzi-os-tenant-model-spec-v1.md) — `tenant_id NOT NULL` obrigatório; enforcement em camadas
- [`docs/specs/implementation/yzi-os-persistence-spec-v1.md`](../yzi-os-persistence-spec-v1.md) — PostgreSQL + Drizzle; gerar ≠ aplicar; ponto único de acesso tenant-scoped
- [`docs/specs/implementation/yzi-os-platform-scaffold-spec-v1.md`](../yzi-os-platform-scaffold-spec-v1.md) — stack Next.js/TypeScript; boundaries de `platform/`
- [`docs/specs/implementation/skills/yzi-os-verification-loop-skill-adaptation-spec-v1.md`](./yzi-os-verification-loop-skill-adaptation-spec-v1.md) — spec irmã; verificar ≠ corrigir ≠ aplicar
- [`docs/specs/implementation/skills/yzi-os-security-review-skill-adaptation-spec-v1.md`](./yzi-os-security-review-skill-adaptation-spec-v1.md) — spec irmã; blocker classes de segurança

---

## Source Skills

Origem das três skills: repositório ECC ([affaan-m/ECC `.agents/skills`](https://github.com/affaan-m/ECC/tree/main/.agents/skills)), classificadas como `ADAPT_FOR_YZI_OS`, prioridade **Alta**, Target Lane **Backend** ([`skill map`](../yzi-os-reusable-agent-skill-map-v1.md) §6).

| ECC Skill | Original Purpose | Useful Parts | Must Be Restricted |
| --------- | ---------------- | ------------ | ------------------ |
| `backend-patterns` | Padrões de arquitetura backend (API, DB, caching): organização de services, camadas de acesso a dados, estratégias de cache e composição server-side | Separação service/data access; conceito de camada única de acesso a dados; organização de módulos server-side; padrões de composição de services; disciplina de boundary entre camadas | Qualquer padrão de acesso direto ao banco sem camada tenant-aware; criação de schema/cache como side effect; padrões de conexão que exponham service role; caching cross-tenant; qualquer escrita fora dos allowed paths do pack |
| `api-design` | Design de APIs REST: convenções de rotas, paginação, contratos de erro, versionamento e status codes | Convenções de paginação; estrutura de error contract; disciplina de status codes; consistência de naming de rotas; separação input/output schema | Criação de API route real sem pack autorizado; route sem declaração de tenant source e auth requirement; erro que vaze secret, stack trace sensível ou dado de outro tenant; contrato sem declaração leitura/escrita/evidência ([`operational-state`](../../p1/operational-state.spec.md) §9) |
| `coding-standards` | Padrões de código (imutabilidade, organização): nomenclatura, organização de módulos, imutabilidade, disciplina de tipos | TypeScript estrito como contrato; nomes claros; funções pequenas; imutabilidade por padrão; organização de imports; legibilidade antes de abstração | Qualquer convenção que conflite com as decisões das specs YZI OS (TypeScript/Next/Drizzle/npm); `any` sem justificativa; refactor fora dos allowed paths do pack; padronização que toque arquivos não autorizados; commit de estilo sem política do pack |

---

## YZI OS Backend Adaptation Principles

Os princípios abaixo são **invariantes** da adaptação — não preferências. Toda orientação derivada das três skills adaptadas fica subordinada a eles; desvio é violação de boundary, não escolha de estilo.

- **Backend nunca acessa dados sem tenant scope explícito** — nenhuma query, leitura, escrita, retrieval ou delegação sem `tenant_id` explícito ([`tenant-boundary`](../../p0/tenant-boundary.spec.md); [`tenant-state-isolation`](../../p1/tenant-state-isolation.spec.md));
- **Backend não cria schema** — schema é responsabilidade da Database Lane, com spec e pack próprios ([`persistence-spec`](../yzi-os-persistence-spec-v1.md));
- **Backend não aplica migration** — gerar ≠ aplicar; aplicação exige pack dedicado com gate;
- **Backend não altera RLS** — RLS não está autorizado nesta fase e exigirá spec própria;
- **Backend não expõe service role** — service role key nunca em client, bundle, output, log, diff ou commit (blocker `SERVICE_ROLE_CLIENT_LEAK` da [spec irmã security-review](./yzi-os-security-review-skill-adaptation-spec-v1.md));
- **Backend não cria UI** — componentes, páginas e assets são da Frontend Lane;
- **API route deve declarar o que lê, o que escreve e que evidência produz** — contrato leitura/escrita/evidência obrigatório por operação ([`operational-state`](../../p1/operational-state.spec.md) §9);
- **Todo acesso persistente deve passar por camada tenant-aware** — ponto único de acesso que exige escopo de tenant; nenhuma query "global" por padrão;
- **Dúvida de tenant bloqueia ou escala** — tenant ausente, ambíguo ou conflitante interrompe a operação e registra; nunca presume ([`tenant-boundary`](../../p0/tenant-boundary.spec.md) §9).

---

## Allowed Use In YZI OS

As skills adaptadas **poderão orientar** (dentro de um pack com gate humano aprovado):

- **Estrutura de services** — organização, responsabilidade única e composição de services server-side;
- **API route design** — convenções de rota, métodos, status codes e versionamento;
- **Server actions** — disciplina de actions Next.js: validação, tenant scope, contrato de retorno;
- **Input validation** — validação e sanitização de todo dado externo na boundary, antes da persistência;
- **Error contracts** — estrutura consistente de erros, sem vazamento de secrets, stack traces sensíveis ou dados de outro tenant;
- **Pagination conventions** — padrões consistentes de paginação tenant-scoped;
- **Tenant-aware access layer** — desenho do ponto único de acesso a dados com escopo de tenant obrigatório;
- **TypeScript organization** — organização de tipos, módulos e contratos tipados;
- **Naming conventions** — nomenclatura clara e consistente de rotas, services, funções e tipos;
- **Separation of concerns** — separação entre validation, service e data access;
- **Backend validation checklist** — checklist de verificação de conformidade backend para os packs (em conjunto com as specs irmãs [`verification-loop`](./yzi-os-verification-loop-skill-adaptation-spec-v1.md) e [`security-review`](./yzi-os-security-review-skill-adaptation-spec-v1.md)).

---

## Forbidden Use

As skills adaptadas **não podem** orientar, induzir, sugerir ou executar:

- **Criar schema** — DDL é Database Lane, com spec/pack próprios;
- **Criar migration** — geração de migration exige pack dedicado da Database Lane;
- **Aplicar migration** — aplicação é ato explícito, autorizado e registrado; nunca side effect de backend;
- **Alterar RLS** — não autorizado nesta fase; exige spec própria;
- **Executar MCP** — qualquer chamada ao Supabase MCP ou outro server ([`mcp-governance`](../yzi-os-supabase-mcp-governance-spec-v1.md));
- **Instalar dependências** — instalação exige pack próprio;
- **Criar frontend** — componentes, páginas e layout são da Frontend Lane;
- **Criar UI** — nenhum artefato visual como efeito de trabalho backend;
- **Usar service role no client** — nenhuma chave bypass-RLS em contexto client-side, bundle ou output;
- **Criar API route real sem pack autorizado** — esta spec define padrões candidatos; rota real exige Execution Pack com gate;
- **Ampliar escopo fora dos allowed paths** — toda ação restrita aos paths declarados no pack ativo;
- **Commitar sem política do pack** — nenhum staging, commit ou push sem a política de commit do pack ativo.

---

## Backend Patterns Adaptation

Padrões candidatos derivados de `backend-patterns`, **declarados sem implementar**:

- **`platform/src/server/**`** — possível área futura para serviços server-side (services, orquestração de operações);
- **`platform/src/lib/**`** — possível área futura para helpers compartilhados (validação, tipos, utilitários puros);
- **`platform/src/app/api/**`** — possível área futura para API routes (boundary HTTP da plataforma);
- **Camada de acesso tenant-aware como ponto obrigatório entre backend e banco** — todo caminho de leitura/escrita passa pelo ponto único que exige `tenant_id` explícito (alinhado aos paths candidatos `platform/src/db/` da [`persistence-spec`](../yzi-os-persistence-spec-v1.md));
- **Nenhum acesso direto a dados fora da camada autorizada** — services e routes nunca importam driver/cliente de banco diretamente; toda persistência atravessa a access layer.

Os paths acima são **candidatos** — os paths reais de cada execução serão fixados pelos `Allowed paths` do pack correspondente; esta spec não cria diretório, arquivo nem código.

---

## API Design Adaptation

Padrão candidato derivado de `api-design`, **declarado sem implementar**:

Toda futura API route deve declarar:

- **purpose** — o que a rota faz, em uma frase verificável;
- **tenant source** — de onde vem o tenant da operação (sessão autenticada; nunca input livre do cliente, nunca inferência do LLM);
- **auth requirement** — qual verificação de auth/sessão ocorre antes de qualquer acesso a dados;
- **input schema** — o schema de validação do input (todo dado externo validado na boundary);
- **read operations** — quais estados/recortes a rota lê (tenant-scoped);
- **write operations** — quais estados a rota altera, e por qual service;
- **output contract** — o formato do retorno em sucesso;
- **error contract** — o formato estruturado dos erros;
- **evidence/logging expectation** — que registro auditável a operação produz ([`operational-state`](../../p1/operational-state.spec.md) §9; [`event-driven-state`](../../p1/event-driven-state.spec.md));
- **forbidden side effects** — o que a rota explicitamente não faz (sem mutação fora do declarado).

Erros devem ser **estruturados** e não podem vazar **secrets**, **stack traces sensíveis** ou **dados de outro tenant**. Erro de fronteira de tenant (ausente/ambíguo) retorna bloqueio registrado — nunca dado parcial.

---

## Coding Standards Adaptation

Padrões candidatos derivados de `coding-standards`, **declarados sem implementar**:

- **TypeScript estrito** — tipagem como primeira camada de contrato (herdado da [`scaffold-spec`](../yzi-os-platform-scaffold-spec-v1.md) §2);
- **Nomes claros** — rotas, services, funções e tipos com nomes que declaram intenção;
- **Funções pequenas** — responsabilidade única, verificáveis isoladamente;
- **Separação entre validation, service e data access** — três camadas distintas, nunca fundidas;
- **Nenhum `any` sem justificativa** — `any` exige comentário de justificativa e é candidato a finding de revisão;
- **Nenhum secret hardcoded** — secrets somente em `platform/.env.local` (nunca versionado);
- **Nenhum bypass de tenant** — nenhum caminho de código contorna a access layer tenant-aware;
- **Nenhum side effect oculto** — toda mutação declarada no contrato da operação;
- **Imports organizados** — ordenação e agrupamento consistentes; sem imports não usados;
- **Código legível antes de abstração prematura** — clareza primeiro; abstração só quando padrão comprovado se repete.

---

## Pack Integration

Como as três skills adaptadas entram no **Execution Pack Template** ([`harness-map`](../yzi-os-execution-harness-map-v1.md) §8):

- **Responsible subagent:** `backend-implementation-agent` (candidato do [`skill map`](../yzi-os-reusable-agent-skill-map-v1.md) §8 — **não autorizado/criado por esta spec**);
- **Authorized skills:** `backend-patterns`, `api-design`, `coding-standards`, além de `verification-loop` e `security-review` quando o pack exigir validação/auditoria (todas pós-adaptação, conforme as specs de adaptação correspondentes);
- **Required specs:** [`yzi-os-tenant-model-spec-v1`](../yzi-os-tenant-model-spec-v1.md), [`operational-state`](../../p1/operational-state.spec.md), [`event-driven-state`](../../p1/event-driven-state.spec.md), [`yzi-os-platform-scaffold-spec-v1`](../yzi-os-platform-scaffold-spec-v1.md);
- **Allowed paths:** sempre definidos pelo pack — esta spec não fixa paths graváveis; os candidatos da §Backend Patterns Adaptation só se tornam graváveis quando declarados em um pack aprovado;
- **Validation:** lint, typecheck, build, tests, security review, path boundary (conforme specs irmãs [`verification-loop`](./yzi-os-verification-loop-skill-adaptation-spec-v1.md) e [`security-review`](./yzi-os-security-review-skill-adaptation-spec-v1.md));
- **Evidence:** route/service created or modified, files touched, checks passed, forbidden actions absent.

Regra de gate preservada: **um pack = um gate humano**; pack ambíguo bloqueia, nunca presume.

---

## Lane Usage

| Backend Area | Skill Guidance | Required Guardrail |
| ------------ | -------------- | ------------------ |
| **API routes** | `api-design`: convenções de rota, métodos, status codes; declaração completa (purpose, tenant source, auth, input, read/write, output, error, evidence) | Nenhuma route real sem pack autorizado; auth check antes de qualquer acesso a dados; tenant vindo da sessão, nunca do input |
| **Server actions** | `backend-patterns` + `api-design`: mesma disciplina declarativa das routes aplicada a actions Next.js | Action sem declaração leitura/escrita/evidência não é conforme; nenhuma mutação fora do contrato declarado |
| **Services** | `backend-patterns`: responsabilidade única, composição clara, separação de camadas | Service nunca acessa banco diretamente; toda persistência via access layer tenant-aware; services validam e produzem eventos dentro de contrato ([`event-driven-state`](../../p1/event-driven-state.spec.md) §9) |
| **Data access** | `backend-patterns`: ponto único de acesso, queries tipadas via Drizzle | `tenant_id` explícito obrigatório em toda query; query global sem tenant scope é blocker `TENANT_ISOLATION_RISK`; dúvida bloqueia ou escala |
| **Validation** | `coding-standards` + `api-design`: schema de validação na boundary, antes de qualquer uso do input | Nenhum dado externo chega à access layer sem validação; input direto em query é blocker `INPUT_VALIDATION_RISK` |
| **Errors** | `api-design`: contrato de erro estruturado e consistente | Nenhum erro vaza secret, stack trace sensível ou dado de outro tenant; erro de tenant ambíguo = bloqueio registrado |
| **Logging/evidence** | `backend-patterns` + contrato leitura/escrita/evidência: toda operação produz registro auditável | Nenhum secret em log; evidência tenant-scoped; mutação sem evento auditável não é conforme |
| **Tests** | `coding-standards`: testes pequenos, nomeados pela invariante que verificam (tenant scope, validação, contrato de erro) | Testes dentro dos allowed paths do pack; nenhum tenant real ou dado de cliente em fixtures; testar não autoriza implementar fora do escopo |

---

## Required Evidence Pattern

Todo uso das skills adaptadas **deve produzir**, no evidence record do pack, no mínimo:

| Campo | Conteúdo esperado |
| --- | --- |
| **backend area touched** | Área(s) de backend trabalhada(s) (API route, service, access layer, validation etc.) |
| **files created/modified** | Lista de arquivos criados/modificados, inteiramente dentro dos `allowed paths` do pack |
| **tenant boundary handling** | Como o escopo de tenant foi garantido em cada caminho de leitura/escrita; confirmação de ausência de query global |
| **input validation** | Quais inputs foram validados, com qual schema, em qual boundary |
| **read/write declaration** | O que cada operação lê, o que escreve e por qual service ([`operational-state`](../../p1/operational-state.spec.md) §9) |
| **error contract** | Contrato de erro de cada rota/action; confirmação de não-vazamento (secret, stack trace, cross-tenant) |
| **security checks** | Checks de segurança aplicados e resultado (conforme [spec irmã security-review](./yzi-os-security-review-skill-adaptation-spec-v1.md)) |
| **verification checks** | Lint, typecheck, build, tests — comando, resultado, status (conforme [spec irmã verification-loop](./yzi-os-verification-loop-skill-adaptation-spec-v1.md)) |
| **forbidden actions confirmed absent** | Confirmação explícita: nenhum schema criado, nenhuma migration criada/aplicada, nenhum RLS alterado, nenhum MCP, nenhuma UI, nenhum service role exposto, nenhum commit não-autorizado |
| **git status** | Saída de `git status` ao final (somente escopo do pack ativo) |
| **next pack candidate** | Pack seguinte sugerido — **não autorizado** pelo evidence |

---

## What This Does Not Authorize

`This spec does NOT authorize:`

- instalar skills;
- copiar skills;
- criar subagent;
- alterar `.agents/skills`;
- alterar `.claude/agents`;
- alterar `platform/`;
- criar backend real;
- criar API route real;
- criar service real;
- criar schema;
- criar migration;
- aplicar migration;
- executar MCP;
- alterar Supabase;
- criar frontend;
- deploy.

Cada uso real das skills adaptadas ocorrerá dentro de um Execution Pack com gate humano próprio, conforme [`yzi-os-execution-harness-map-v1`](../yzi-os-execution-harness-map-v1.md) §8.

---

## Final Status

`SPEC_COMPLETE_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`

---

## Validação

**Commit da security-review spec:** `docs: add security-review skill adaptation spec v1` ✅ (única mudança pendente confirmada via `git status` antes do commit)

**Arquivo backend skills adaptation pack criado:** `docs/specs/implementation/skills/yzi-os-backend-skills-adaptation-pack-v1.md` ✅

**Fontes lidas:**
1. `docs/specs/implementation/yzi-os-execution-harness-map-v1.md` ✅
2. `docs/specs/implementation/yzi-os-reusable-agent-skill-map-v1.md` ✅
3. `docs/specs/implementation/skills/yzi-os-verification-loop-skill-adaptation-spec-v1.md` ✅
4. `docs/specs/implementation/skills/yzi-os-security-review-skill-adaptation-spec-v1.md` ✅
5. `docs/specs/implementation/yzi-os-platform-scaffold-spec-v1.md` ✅
6. `docs/specs/implementation/yzi-os-tenant-model-spec-v1.md` ✅
7. `docs/specs/implementation/yzi-os-persistence-spec-v1.md` ✅
8. `docs/specs/p0/tenant-boundary.spec.md` ✅
9. `docs/specs/p1/operational-state.spec.md` ✅
10. `docs/specs/p1/event-driven-state.spec.md` ✅
11. `.agents/skills/` — examinado: 13 skills locais; `backend-patterns`, `api-design` e `coding-standards` **não** estão instaladas localmente (confirmado) ✅
12. Referência ECC das skills `backend-patterns`, `api-design`, `coding-standards` — consultada via `yzi-os-reusable-agent-skill-map-v1` §5, §6 ✅

**Referências ECC consultadas:** `backend-patterns` (API/DB/caching — "impor tenant-aware access layer como padrão obrigatório"), `api-design` (REST, paginação, erros — "adicionar contrato leitura/escrita/evidência (P1)"), `coding-standards` (imutabilidade, organização — "alinhar a TypeScript/Next/Drizzle decididos nas specs") — todas `ADAPT_FOR_YZI_OS`, prioridade Alta, conforme [`yzi-os-reusable-agent-skill-map-v1`](../yzi-os-reusable-agent-skill-map-v1.md) §5, §6.

**O que foi adaptado de cada skill:**
- `backend-patterns`: separação service/data access e camada única de acesso — preservadas; camada de acesso tornada obrigatoriamente tenant-aware; áreas candidatas declaradas (`platform/src/server/**`, `platform/src/lib/**`, `platform/src/app/api/**`);
- `api-design`: paginação, error contracts e convenções de rota — preservadas; adicionado o padrão de declaração completa por rota (purpose, tenant source, auth, input, read/write, output, error, evidence, forbidden side effects);
- `coding-standards`: TypeScript estrito, nomes claros, funções pequenas, imports organizados — preservados; alinhados à stack decidida (TypeScript/Next/Drizzle/npm) e acrescidos de "nenhum bypass de tenant" e "nenhum secret hardcoded".

**O que foi proibido/neutralizado:**
- Criação de schema/migration como side effect de backend — proibido;
- Aplicação de migration — proibida;
- Alteração de RLS — proibida;
- Execução de MCP — proibida;
- Instalação de dependências — proibida;
- Criação de frontend/UI — proibida;
- Service role em client/output — proibido;
- API route real sem pack autorizado — proibida;
- Acesso direto a dados fora da camada tenant-aware — proibido;
- Ampliação de escopo fora dos allowed paths — proibida;
- Commit sem política do pack — proibido.

**Padrões backend candidatos definidos:** áreas candidatas (`platform/src/server/**`, `platform/src/lib/**`, `platform/src/app/api/**`), camada de acesso tenant-aware como ponto obrigatório, padrão de declaração de API route (10 campos), 10 coding standards alinhados às specs.

**Confirmação de não-implementação:** nada foi implementado. A spec é documental.

**Confirmação de não-alteração de `.claude/agents`:** `.claude/agents` não foi alterado ✅

**Confirmação de não-alteração de `.agents/skills`:** `.agents/skills` não foi alterado ✅

**Confirmação de não-alteração de `platform/`:** `platform/` não foi alterado ✅

**Próximo passo recomendado:** aprovação humana desta spec e seu commit (gate próprio); com isso a primeira leva de prioridade Alta do [`yzi-os-reusable-agent-skill-map-v1`](../yzi-os-reusable-agent-skill-map-v1.md) §10 (passo 3) fica completa — `verification-loop`, `security-review`, `backend-patterns`, `api-design`, `coding-standards` — habilitando como candidatos os passos 4 (criação de subagents reais, task própria com gate) e 5 (validação via execution packs da sequência do harness map §9).

---

## Critério de Parada

Parar e reportar se:

- houver mudança pendente inesperada antes do commit;
- qualquer referência ECC não puder ser consultada;
- qualquer fonte obrigatória estiver ausente;
- houver necessidade de alterar `.agents/skills`;
- houver necessidade de alterar `.claude/agents`;
- houver necessidade de alterar `platform/`;
- houver ambiguidade sobre o arquivo de destino;
- houver qualquer tentativa de implementação.
