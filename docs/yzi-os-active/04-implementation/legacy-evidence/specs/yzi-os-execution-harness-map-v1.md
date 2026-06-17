# YZI OS Execution Harness Map v1

## 1. Readiness Statement

`YZI_OS_EXECUTION_HARNESS_MAP_V1_CREATED_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`

Este documento segue Spec-Driven Development: **define** o harness de execução técnica do YZI OS, mas **não cria subagents reais, não altera `.claude/agents`, não altera `.agents/skills`, não executa MCP e não toca `platform/`**.

## 2. Purpose

Definir o **harness de execução técnica do YZI OS**: o modelo oficial que substitui a lógica de "uma spec por microação" por unidades práticas de execução governada —

`Subagent + Skills + Required Specs + Required Knowledge + Execution Pack + Validation + Evidence`

— preservando todos os invariantes das specs P0–P4 e acelerando a fase de implementação. O objetivo declarado pelo humano: **agilidade governada** — specs governam execução, não paralisam execução.

## 3. Design Principle

- **Specs governam.** São a fonte normativa: autorizam, bloqueiam e definem critérios de aceitação. Nada executa sem spec aplicável ([`harness-philosophy`](../../harness-engineering/harness-philosophy.md): Guidance orienta; só Enforcement garante, `DO5`).
- **Skills aumentam capacidade.** São conhecimento operacional reutilizável carregado pelo executor certo na hora certa ([`skill-map`](../../skills/skill-map.md) §2: capacidade modular governada por specification; nunca autoridade).
- **Subagents executam papéis.** São papéis controlados com autoridade limitada, escopo claro e atenuação de privilégio ([`subagent-map`](../../subagents/subagent-map.md) §2; [`tenant-boundary`](../p0/tenant-boundary.spec.md) §7: delegar ≠ decompor).
- **Execution Packs agrupam sequências práticas.** Um pack reúne, em uma única unidade autorizada, a sequência de ações que antes exigiria várias micro-specs — com escopo, validação, stop criteria e evidência **declarados uma vez** para todo o grupo.
- **Evidence valida.** Conclusão é objeto evidenciário ([`execution-harness`](../../harness-engineering/execution-harness.md) §3): só se executa o que tem método de verificação definido; toda mudança de estado gera evento auditável ([`event-driven-state`](../p1/event-driven-state.spec.md)).
- **O objetivo é agilidade governada, não micro-burocracia.** Restringir habilita autonomia ([`harness-philosophy`](../../harness-engineering/harness-philosophy.md) §3): o pack estreita deliberadamente o espaço de ação para que a execução dentro dele possa ser rápida.

## 4. Core Distinctions

### Specs

- fonte normativa;
- autorizam/bloqueiam;
- não executam.

Em conflito, a hierarquia permanece: P0 > P1 > P2 > P3 > P4 > specs de implementação > packs. Um pack **nunca** relaxa uma spec.

### Skills

- capacidades reutilizáveis;
- aumentam qualidade;
- não substituem specs.

Skill sem spec aplicável não constitui autorização ([`skill-map`](../../skills/skill-map.md) §5: sem spec, não há skill).

### Subagents

- papéis controlados;
- executam/validam dentro de boundaries;
- não decidem estratégia sozinhos.

Subagent recebe fatia estreitada por delegação (atenuação de privilégio), sempre dentro do mesmo tenant e dos paths do pack. O executor não desliga a própria fiscalização ([`harness-philosophy`](../../harness-engineering/harness-philosophy.md) §7, `[AHE]`).

### Execution Packs

- unidade prática de execução;
- agrupam sequência autorizada;
- reduzem micro-spec infinita.

Um pack é o equivalente operacional do "execution package" já praticado em `docs/specs/execution-packages/`, otimizado: um gate humano por pack (não por microação), com validação e evidência embutidas.

## 5. Current State

Registro do estado atual (2026-06-11):

- **`.claude/agents/` atuais são control/governance agents** — cinco definições controladas (`spec-reader`, `scope-validator`, `path-inspector`, `governance-violation-detector`, `evidence-recorder`), correspondendo 1:1 às cinco institutional skills (`CONTROLLED_SUBAGENTS_INDEX.md`). São artefatos de controle, não de implementação.
- **`.agents/skills/` atuais são skill library** — 13 skills instaladas: `supabase`, `supabase-postgres-best-practices`, `impeccable`, `ui-ux-pro-max`, `human-image`, `remotion-best-practices`, `emilkowalski-design`, `ckm-banner-design`, `ckm-brand`, `ckm-design`, `ckm-design-system`, `ckm-slides`, `ckm-ui-styling`. Predomínio design/site; apenas duas servem infra (as Supabase).
- **Backend real = 0%.**
- **Database schema = 0%** (engine PostgreSQL + Drizzle decididos em [`yzi-os-persistence-spec-v1`](./yzi-os-persistence-spec-v1.md); nada criado).
- **Frontend produto = scaffold apenas** (`platform/` Next.js conforme [`yzi-os-platform-scaffold-spec-v1`](./yzi-os-platform-scaffold-spec-v1.md)).
- **MCP Supabase configurado** (`.mcp.json`, sem secrets), mas **toda operação remota exige pack/gate** conforme [`yzi-os-supabase-mcp-governance-spec-v1`](./yzi-os-supabase-mcp-governance-spec-v1.md); autenticação OAuth ainda pendente do humano.
- **Homepage/design skills existem, mas não entram na infra agora** — ficam reservadas à Design/Site Lane.

## 6. Proposed Agent Layers

| Layer | Agent | Role | Uses Skills | Reads Specs | May Touch | Must Not Touch |
| --- | --- | --- | --- | --- | --- | --- |
| Control | `spec-reader` | sintetizar o que cada spec aprovada autoriza | `read-approved-specs` | todas as specs do pack | nada (read-only) | qualquer arquivo (não escreve) |
| Control | `scope-validator` | comparar escopo reportado vs. autorizado | `validate-scope-boundaries` | pack + specs do pack | nada (read-only) | escopo (não amplia) |
| Control | `path-inspector` | verificar paths tocados vs. permitidos | `inspect-authorized-paths` | pack (allowed paths) | nada (read-only) | paths (não autoriza novos) |
| Control | `governance-violation-detector` | detectar violação e recomendar parada | `detect-governance-violation` | P0–P4 + pack | nada (read-only) | execução (não corrige, só para) |
| Control | `evidence-recorder` | estruturar registro de evidência do pack | `write-evidence-record` | pack (evidence output) | doc de evidência do pack | qualquer outro arquivo |
| Implementation | `database-implementation-agent` | schema, migrations SQL, constraints, RLS (Database Lane) | ver §7 Database Lane | persistence, tenant-model, postgres-provisioning, P0/P1 | `platform/src/db/`, `platform/drizzle/` | `docs/`, `.claude/`, `.agents/`, produção; nunca aplica migration sem gate |
| Implementation | `backend-implementation-agent` | API routes, services, access layer (Backend Lane) | ver §7 Backend Lane | tenant-model, persistence, P0/P1, tool-execution (P3) | `platform/src/` (server) | schema/migrations (lane errada), `docs/`, secrets |
| Implementation | `frontend-implementation-agent` | cockpit, pages, components (Frontend Lane) | ver §7 Frontend Lane | scaffold spec, PRD, UI specs futuras | `platform/src/app/`, `platform/src/components/` | server/db code, `docs/`, secrets |
| Implementation | `supabase-mcp-agent` | operações MCP governadas (Supabase MCP Lane) | ver §7 Supabase MCP Lane | supabase-mcp-governance, postgres-provisioning | nada local (remoto read-only por default) | qualquer escrita remota sem pack mutante aprovado |
| Implementation | `integration-agent` | costura entre lanes (ex.: cockpit ↔ access layer) | combinação mínima das lanes envolvidas | specs das duas lanes + pack | interseção declarada no pack | tudo fora da interseção |
| Implementation | `design-system-agent` | homepage, visual system, assets (Design/Site Lane) | ver §7 Design/Site Lane | foundation/manifesto, brand docs | paths de site/prototype declarados no pack | `platform/src/db/`, backend, infra |
| Audit | `evidence-validator-agent` | conferir evidência produzida vs. prometida | `write-evidence-record`, `verification-loop`* | pack (validation + evidence) | nada (read-only) | a própria execução auditada (independência) |
| Audit | `regression-risk-agent` | avaliar risco de regressão antes do merge/apply | `verification-loop`*, `security-review`* | pack + specs afetadas | nada (read-only) | correções diretas (só reporta) |
| Audit | `implementation-review-agent` | revisão de código/SQL contra acceptance criteria | `security-review`*, `coding-standards`* | specs da lane + pack | nada (read-only) | escopo (não amplia, não aprova sozinho) |

Invariantes da tabela: agents de Control e Audit são **read-only** sobre o repositório (exceto `evidence-recorder`, que escreve apenas o documento de evidência do pack); agents de Implementation tocam **somente** os allowed paths do pack ativo; nenhum agent decide estratégia — estratégia é decidida pelo humano + assistente gestor via spec/pack. Skills marcadas `*` são candidatas a adaptação do ECC (ver §7), ainda não instaladas.

## 7. Lane Definitions

Convenção: **(local)** = skill já instalada em `.agents/skills/`; **(ECC-adapt)** = padrão do [ECC `.agents/skills`](https://github.com/affaan-m/ECC/tree/main/.agents/skills) a adaptar para o YZI OS antes de uso — adaptar, não copiar cegamente.

### Database Lane

Responsável por:

- schema;
- migrations;
- SQL;
- constraints;
- indexes;
- RLS;
- policies;
- tenant isolation.

Skills candidatas:

- `supabase` (local);
- `supabase-postgres-best-practices` (local);
- `security-review` (ECC-adapt);
- `verification-loop` (ECC-adapt);
- `eval-harness` (ECC-adapt).

Specs obrigatórias da lane: [`yzi-os-persistence-spec-v1`](./yzi-os-persistence-spec-v1.md), [`yzi-os-tenant-model-spec-v1`](./yzi-os-tenant-model-spec-v1.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md), [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md), [`event-driven-state`](../p1/event-driven-state.spec.md). Disciplina inegociável: `tenant_id NOT NULL` em toda tabela de negócio; migration SQL versionada e revisável; **gerar ≠ aplicar**.

### Backend Lane

Responsável por:

- API routes;
- server actions;
- services;
- Supabase server-side;
- validation;
- tenant-aware access layer.

Skills candidatas:

- `backend-patterns` (ECC-adapt);
- `api-design` (ECC-adapt);
- `coding-standards` (ECC-adapt);
- `security-review` (ECC-adapt);
- `verification-loop` (ECC-adapt);
- `tdd-workflow` (ECC-adapt).

Specs obrigatórias da lane: [`yzi-os-tenant-model-spec-v1`](./yzi-os-tenant-model-spec-v1.md), [`operational-state`](../p1/operational-state.spec.md) (toda operação declara o que lê, o que altera e que evidência produz), [`tool-execution`](../p3/tool-execution.spec.md). Disciplina inegociável: nenhum caminho de leitura/escrita sem escopo explícito de tenant; dúvida bloqueia ou escala.

### Frontend Lane

Responsável por:

- cockpit;
- components;
- pages;
- layout;
- UX states;
- data display.

Skills candidatas:

- `frontend-patterns` (ECC-adapt);
- `impeccable` (local);
- `ui-ux-pro-max` (local);
- equivalentes de clarify/layout/harden (ECC-adapt, a mapear na adaptação);
- `verification-loop` (ECC-adapt).

Specs obrigatórias da lane: [`yzi-os-platform-scaffold-spec-v1`](./yzi-os-platform-scaffold-spec-v1.md), PRD ([`yzi-os-prd-v1`](../../prd/yzi-os-prd-v1.md)). Disciplina inegociável: frontend exibe projeção do estado — nunca inventa estado ([`operational-state`](../p1/operational-state.spec.md) §6.2).

### Supabase MCP Lane

Responsável por:

- read-only inspection;
- metadata inventory;
- table/policy/function visibility;
- governed MCP operation packs.

Skills candidatas:

- `supabase` (local);
- `mcp-server-patterns` (ECC-adapt);
- `documentation-lookup` (ECC-adapt);
- `security-review` (ECC-adapt);
- `verification-loop` (ECC-adapt).

Spec obrigatória da lane: [`yzi-os-supabase-mcp-governance-spec-v1`](./yzi-os-supabase-mcp-governance-spec-v1.md) — default é "nenhuma chamada MCP"; read-only exige task/pack explícito; mutante exige nova spec aprovada; nenhum secret em output.

### Design/Site Lane

Responsável por:

- homepage;
- visual system;
- brand experience;
- assets;
- motion;
- design audit.

Skills candidatas:

- `impeccable` (local);
- `human-image` (local);
- `remotion-best-practices` (local);
- `frontend-patterns` (ECC-adapt);
- `brand-voice` (ECC-adapt);
- `content-engine` (ECC-adapt).

Boundary da lane: **não entra na infra** — nenhum acesso a `platform/src/db/`, backend ou MCP. Os `ckm-*` e `emilkowalski-design` locais são reserva desta lane.

## 8. Execution Pack Template

Todo Execution Pack DEVE declarar, antes do gate humano:

- **Pack name** — nome único e estável (ex.: `supabase-mcp-readonly-inventory-pack-v1`);
- **Objective** — resultado único e verificável do pack;
- **Responsible subagent** — exatamente um agent de Implementation responsável (§6);
- **Authorized skills** — lista fechada; skill fora da lista não é carregada;
- **Required specs** — specs que governam o pack, em ordem de autoridade;
- **Required knowledge/articles** — artigos da base de conhecimento que o pack exige (consulta direcionada, §10);
- **Required current-state inspection** — o que deve ser verificado no estado atual antes de agir (git status, paths, env, projeto remoto);
- **Allowed paths** — lista fechada de paths graváveis; todo o resto é proibido;
- **Allowed remote operations** — default vazio; operações MCP/rede listadas uma a uma;
- **Forbidden operations** — proibições explícitas além do default (secrets, produção, migrations automáticas etc.);
- **Stop criteria** — condições que interrompem imediatamente e reportam ao humano;
- **Validation commands/checks** — comandos/verificações objetivas de aceitação (lint, build, teste, query de verificação);
- **Evidence output** — qual evidência o pack produz e onde é registrada (evidence record, output redigido, diff);
- **Commit policy** — quantos commits, mensagem, e o que NUNCA entra em commit (secrets, arquivos fora dos allowed paths);
- **Next pack candidate** — o pack seguinte sugerido, **não autorizado** pelo pack atual.

Regra de gate: **um pack = um gate humano**. Dentro do pack aprovado, o subagent executa a sequência inteira sem novos gates, salvo stop criteria. Pack ambíguo bloqueia, nunca presume.

## 9. Optimized Execution Sequence

Sequência otimizada proposta (cada item é um pack, com gate próprio; a sequência não é autorização):

1. **Supabase MCP Read-Only Inventory Pack** — inventário de metadados do projeto (tabelas, policies, functions) via MCP, zero escrita;
2. **Supabase Project Baseline Evidence Pack** — registrar evidência do estado-zero do projeto remoto (baseline auditável pré-schema);
3. **Database Schema Decision Pack** — consolidar o DDL candidato de `tenants` + `tenant_memberships` a partir da tenant-model spec;
4. **Tenant Schema Migration Generation Pack** — gerar (não aplicar) migrations SQL versionadas via Drizzle;
5. **Migration Review Pack** — revisão humana + audit agents da migration gerada;
6. **Migration Apply Pack** — aplicação explícita, autorizada e registrada da migration revisada;
7. **Backend Access Layer Pack** — camada de acesso tenant-scoped (ponto único, escopo obrigatório);
8. **Frontend Cockpit Shell Pack** — shell do cockpit consumindo a access layer (projeção de estado);
9. **Opportunity Radar MVP Pack** — primeiro módulo de produto mínimo sobre a base anterior;
10. **Evidence Review / Regression Pack** — auditoria de evidência acumulada + risco de regressão do ciclo.

A ordem respeita as dependências das specs: inventário antes de baseline, decisão antes de geração, geração antes de revisão, revisão antes de aplicação, banco antes de backend, backend antes de frontend, tudo antes de produto.

## 10. Rules For Consulting Knowledge Base

- O **assistente gestor** (orquestrador da conversa) DEVE consultar a base de conhecimento e os artigos do projeto (`docs/context-engineering/`, `docs/specification-engineering/`, `docs/harness-engineering/`, `docs/runtime/`, `docs/agents/`, proveniências `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]`) sempre que decisões estruturais forem tomadas.
- **Subagents não devem carregar toda a base por padrão** — contexto é recurso governado ([`context-isolation`](../../context-engineering/context-isolation.md)); cada subagent recebe apenas o recorte do seu pack.
- **Cada Execution Pack deve listar required knowledge específico** — a consulta é parte do contrato do pack, não improviso.
- **A consulta deve ser direcionada** para evitar contaminação de contexto: artigo certo, seção certa, propósito declarado.
- **Decisões estruturais precisam citar specs/artigos usados** — sem citação de fonte, a decisão não é aceita como estrutural (proveniência, `DO6`).

## 11. What This Does Not Authorize

`This spec does NOT authorize:`

- criar subagents reais;
- alterar `.claude/agents`;
- alterar `.agents/skills`;
- executar MCP;
- criar banco;
- criar schema;
- criar migration;
- criar backend;
- criar frontend;
- instalar dependências;
- alterar `platform/`;
- deploy;
- produção.

Cada pack da sequência (§9) exigirá seu próprio gate de autorização humana. Este mapa é o **modelo**, não a primeira execução.

## 12. Final Status

`SPEC_COMPLETE_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`
