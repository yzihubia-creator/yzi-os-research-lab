# YZI OS Reusable Agent Skill Map v1

## 1. Readiness Statement

`YZI_OS_REUSABLE_AGENT_SKILL_MAP_V1_CREATED_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`

Este documento segue Spec-Driven Development: **analisa e classifica** a referência externa ECC para reaproveitamento, mas **não copia, não instala, não cria subagents reais, não altera `.claude/agents` nem `.agents/skills`, não executa código ou MCP e não toca `platform/`**.

## 2. Purpose

Definir quais skills e padrões de agentes do repositório externo **ECC** ([affaan-m/ECC `.agents/skills`](https://github.com/affaan-m/ECC/tree/main/.agents/skills)) podem ser **reaproveitados ou adaptados** para o YZI OS, alimentando as lanes e os candidate subagents do [`yzi-os-execution-harness-map-v1`](./yzi-os-execution-harness-map-v1.md). Princípio do humano: **não inventar a roda — adaptar, nunca copiar cegamente.**

## 3. Current YZI OS Skills

13 skills instaladas em `.agents/skills/` (todas commitadas):

| Skill local | Domínio |
| --- | --- |
| `supabase` | Supabase MCP Lane / Database Lane (guia oficial Supabase) |
| `supabase-postgres-best-practices` | Database Lane (35 regras de Postgres: índices, RLS, pooling) |
| `impeccable` | Frontend + Design/Site Lane (31 comandos de craft de UI: clarify, layout, harden, polish…) |
| `ui-ux-pro-max` | Frontend + Design/Site Lane |
| `human-image` | Design/Site Lane (geração de imagem) |
| `remotion-best-practices` | Design/Site Lane (motion) |
| `emilkowalski-design` | Design/Site Lane (animação/interação) |
| `ckm-banner-design`, `ckm-brand`, `ckm-design`, `ckm-design-system`, `ckm-slides`, `ckm-ui-styling` | Design/Site Lane (família CKM) |

Leitura do estado: a biblioteca local é **forte em design/frontend e Supabase**, e **vazia em backend, verificação, segurança e disciplina de teste** — exatamente os vazios que o ECC pode preencher.

## 4. Current YZI OS Subagents

5 subagents em `.claude/agents/`, todos **control/governance** (nenhum de implementação), correspondendo 1:1 às institutional skills (`CONTROLLED_SUBAGENTS_INDEX.md`):

| Subagent | Classe | Papel |
| --- | --- | --- |
| `spec-reader-subagent` | control/governance | síntese documental do que specs aprovadas autorizam |
| `scope-validator-subagent` | control/governance | escopo reportado vs. autorizado |
| `path-inspector-subagent` | control/governance | paths tocados vs. permitidos |
| `governance-violation-detector-subagent` | control/governance | detecção de violação + recomendação de parada |
| `evidence-recorder-subagent` | control/governance | estruturação de registros de evidência |

## 5. ECC Skills Inventory

O ECC se descreve como "agent harness performance optimization system" — skills, instincts, memória, segurança e research-first development, portável entre Claude Code, Cursor, OpenCode e Codex. Contém **43 skills** em `.agents/skills/` e ~64 subagents em `agents/`. Skills identificadas (descrição quando disponível):

**Engenharia:** `api-design` (REST, paginação, erros) · `backend-patterns` (API/DB/caching) · `frontend-patterns` (React/Next.js, estado) · `coding-standards` (imutabilidade, organização) · `mcp-server-patterns` (MCP servers em Node/TS) · `nextjs-turbopack` (Next 16+) · `bun-runtime` (Bun como runtime/PM) · `agent-sort` · `agent-introspection-debugging` (análise de comportamento de agente).

**Qualidade/Verificação:** `tdd-workflow` (TDD, cobertura 80%+) · `verification-loop` (build/test/lint/typecheck/security contínuos) · `eval-harness` (eval-driven development, checkpoints) · `security-review` (checklist de vulnerabilidades) · `e2e-testing` (Playwright, Page Object Model).

**Pesquisa:** `deep-research` (multi-fonte com atribuição) · `documentation-lookup` (docs de frameworks/APIs) · `market-research` · `exa-search`.

**Conteúdo/Negócio:** `article-writing` · `brand-voice` (perfil de escrita) · `content-engine` (conteúdo multi-plataforma) · `crosspost` · `investor-materials` · `investor-outreach` · `x-api` · `fal-ai-media` · `video-editing`.

**Meta/Workflow:** `everything-claude-code` (convenções do próprio ECC) · `strategic-compact` (otimização de contexto) · `dmux-workflows` (orquestração multi-agente via tmux) · `mle-workflow` · `product-capability` · `dmux`/outros utilitários.

Convenção estrutural do ECC: diretório por skill com `SKILL.md` + pasta de referências — **idêntica** à convenção já usada em `.agents/skills/` local, o que torna a adaptação de baixo atrito.

## 6. Reuse Classification

| ECC Skill | Reuse Decision | Target Lane | Adaptation Needed | Priority |
| --- | --- | --- | --- | --- |
| `security-review` | ADAPT_FOR_YZI_OS | Audit/Governance + Database | adicionar checks de tenant isolation/RLS e proibição de secrets do YZI OS | **Alta** |
| `verification-loop` | ADAPT_FOR_YZI_OS | Audit/Governance (transversal) | remover auto-fix fora de gate; vincular a validation/evidence do pack | **Alta** |
| `backend-patterns` | ADAPT_FOR_YZI_OS | Backend | impor tenant-aware access layer como padrão obrigatório | **Alta** |
| `api-design` | ADAPT_FOR_YZI_OS | Backend | erros/paginação ok; adicionar contrato leitura/escrita/evidência (P1) | **Alta** |
| `coding-standards` | ADAPT_FOR_YZI_OS | Backend (transversal) | alinhar a TypeScript/Next/Drizzle decididos nas specs | **Alta** |
| `eval-harness` | ADAPT_FOR_YZI_OS | Audit/Governance | checkpoints viram validation checks de pack | Média |
| `tdd-workflow` | ADAPT_FOR_YZI_OS | Backend | subordinar cadência de TDD ao gate de pack (testar dentro do pack, nunca abrir escopo) | Média |
| `mcp-server-patterns` | ADAPT_FOR_YZI_OS | Supabase MCP | recortar para consumo governado de MCP (não construção de servers) | Média |
| `documentation-lookup` | REUSE_AS_IS | Supabase MCP (transversal) | nenhuma relevante (consulta direcionada já é regra do harness map §10) | Média |
| `frontend-patterns` | ADAPT_FOR_YZI_OS | Frontend | conciliar com `impeccable`/`ui-ux-pro-max`; padrão "UI projeta estado, não inventa" | Média |
| `nextjs-turbopack` | ADAPT_FOR_YZI_OS | Frontend | verificar aderência à versão do scaffold | Baixa |
| `e2e-testing` | ADAPT_FOR_YZI_OS (fase futura) | Frontend/Integration | só após cockpit existir; Playwright a decidir em spec | Baixa |
| `deep-research` | REFERENCE_ONLY | assistente gestor | uso humano/gestor, não subagent | Baixa |
| `strategic-compact` | REFERENCE_ONLY | assistente gestor | princípios já cobertos por context-engineering docs | Baixa |
| `agent-introspection-debugging` | REFERENCE_ONLY | Audit (futuro) | só quando subagents reais existirem | Baixa |
| `brand-voice` | ADAPT_FOR_YZI_OS (fase futura) | Design/Site | derivar voz da fundação YZI (manifesto/filosofia) | Baixa |
| `content-engine` | REFERENCE_ONLY (fase futura) | Design/Site | publicação externa exige gate próprio | Baixa |
| `everything-claude-code` | REFERENCE_ONLY | — | convenções internas do ECC; ler como inspiração de organização | Baixa |
| `agent-sort`, `product-capability`, `mle-workflow`, `market-research`, `exa-search` | REFERENCE_ONLY | — | fora do caminho crítico do MVP | Baixa |
| `article-writing`, `crosspost`, `investor-materials`, `investor-outreach`, `x-api`, `fal-ai-media`, `video-editing` | DO_NOT_USE (nesta fase) | — | publicação/serviços externos sem gate; reavaliar pós-MVP | — |
| `dmux-workflows` | DO_NOT_USE | — | orquestração multi-agente autônoma conflita com "um pack = um gate" | — |
| `bun-runtime` | DO_NOT_USE | — | conflita com decisão npm/Node da scaffold spec (mudar stack exige revisão de spec) | — |
| equivalentes de design/UI do ECC | ALREADY_COVERED | Design/Site | cobertos por `impeccable`, `ui-ux-pro-max`, família `ckm-*`, `emilkowalski-design` | — |
| equivalentes Supabase/Postgres | ALREADY_COVERED | Database/MCP | cobertos por `supabase` + `supabase-postgres-best-practices` (oficiais) | — |

## 7. Lane Mapping

- **Database Lane:** `security-review`*, `verification-loop`*, `eval-harness`* + locais `supabase`, `supabase-postgres-best-practices`.
- **Backend Lane:** `backend-patterns`*, `api-design`*, `coding-standards`*, `tdd-workflow`*, `security-review`*, `verification-loop`*.
- **Frontend Lane:** `frontend-patterns`*, `nextjs-turbopack`*, `e2e-testing`* (futuro) + locais `impeccable`, `ui-ux-pro-max`.
- **Supabase MCP Lane:** `mcp-server-patterns`*, `documentation-lookup`*, `security-review`* + local `supabase`.
- **Design/Site Lane:** `brand-voice`* (futuro), `content-engine` (referência futura) + locais `impeccable`, `human-image`, `remotion-best-practices`, `emilkowalski-design`, `ckm-*`.
- **Audit/Governance Lane:** `verification-loop`*, `eval-harness`*, `security-review`*, `agent-introspection-debugging` (referência) + os 5 control subagents existentes.
- **Integration Lane:** combinação mínima das lanes envolvidas + `verification-loop`*, `e2e-testing`* (futuro); nenhuma skill própria nova.

(`*` = origem ECC, sempre **após adaptação por spec**; nada é usado as-is exceto `documentation-lookup`.)

## 8. Candidate Subagents Derived From ECC

| Candidate Subagent | Inspired By | Uses Skills | Responsibility | Not Authorized Yet |
| --- | --- | --- | --- | --- |
| `database-implementation-agent` | ECC database specialist | supabase, supabase-postgres-best-practices, security-review* | schema/migrations/RLS dentro de pack | ✅ não autorizado |
| `backend-implementation-agent` | ECC backend reviewers/resolvers | backend-patterns*, api-design*, coding-standards*, tdd-workflow* | API/services/access layer tenant-aware | ✅ não autorizado |
| `frontend-implementation-agent` | ECC frontend reviewers | frontend-patterns*, impeccable, ui-ux-pro-max | cockpit/components/pages | ✅ não autorizado |
| `supabase-mcp-agent` | ECC mcp-server-patterns | supabase, mcp-server-patterns*, documentation-lookup | operações MCP governadas (read-only default) | ✅ não autorizado |
| `implementation-review-agent` | ECC code reviewers (TS etc.) | security-review*, coding-standards* | revisão contra acceptance criteria | ✅ não autorizado |
| `regression-risk-agent` | ECC verification-loop | verification-loop*, security-review* | risco de regressão pré-merge/apply | ✅ não autorizado |
| `evidence-validator-agent` | ECC eval-harness | eval-harness*, write-evidence-record | evidência produzida vs. prometida | ✅ não autorizado |
| `integration-agent` | ECC planner/architect operators | combinação mínima por pack | costura entre lanes | ✅ não autorizado |

Todos respeitam o [`subagent-map`](../../subagents/subagent-map.md) §5: papel nomeável, spec própria, autoridade limitada, atenuação de privilégio, método de verificação.

## 9. Conflict / Redundancy Analysis

**Skills duplicadas (redundância com a base local):**

- `frontend-patterns` sobrepõe parcialmente `impeccable`/`ui-ux-pro-max` — a adaptação deve recortar só o que falta (arquitetura de componentes/estado), deixando craft visual com as locais;
- `documentation-lookup` sobrepõe o hábito já normatizado de consulta direcionada (harness map §10) — reuso quase as-is;
- qualquer conteúdo Postgres do ECC é redundante com `supabase-postgres-best-practices` (oficial, preferida).

**Skills que conflitam com SDD:**

- `bun-runtime` — contradiz a stack npm/Node fixada na scaffold spec; trocar stack exige revisão de spec, não skill;
- `dmux-workflows` — orquestração multi-agente autônoma e contínua contradiz "um pack = um gate humano";
- `everything-claude-code` — convenções de outro projeto; seguir cegamente violaria as convenções do YZI OS.

**Skills que podem induzir execução fora de gate:**

- `verification-loop` (auto-fix contínuo) e `eval-harness` (checkpoints automáticos) — adaptação DEVE remover qualquer auto-aplicação; verificar ≠ corrigir ≠ aplicar;
- `tdd-workflow` — o ciclo red-green-refactor não pode abrir arquivos fora dos allowed paths do pack;
- `crosspost`/`x-api`/`content-engine` — publicam em serviços externos; qualquer uso futuro exige gate explícito de publicação;
- `dmux-workflows` — idem acima.

**Skills só para fases futuras:** `e2e-testing` (pós-cockpit), `brand-voice`/`content-engine` (pós-MVP, Design/Site), `agent-introspection-debugging` (pós-subagents reais), `investor-*` (fora do produto).

## 10. Recommended Adaptation Plan

1. **Manter skills atuais** — as 13 locais permanecem como estão; nenhuma é substituída por equivalente ECC;
2. **Selecionar skills ECC prioritárias** — primeira leva (prioridade Alta da §6): `security-review`, `verification-loop`, `backend-patterns`, `api-design`, `coding-standards`;
3. **Criar specs de adaptação** — uma spec curta por skill adaptada (fonte ECC, recortes, regras YZI OS adicionadas, o que foi removido e por quê), antes de qualquer instalação;
4. **Criar subagents reais em task posterior** — somente após specs de adaptação aprovadas, via task própria com gate (modelo da §8);
5. **Validar com execution packs** — a primeira utilização real de cada skill adaptada ocorre dentro de um pack da sequência do harness map §9, com evidence record.

## 11. What This Does Not Authorize

`This spec does NOT authorize:`

- copiar skills;
- instalar skills;
- criar subagents reais;
- alterar `.claude/agents`;
- alterar `.agents/skills`;
- executar código;
- executar MCP;
- alterar `platform/`;
- criar backend;
- criar schema;
- criar frontend;
- deploy.

Cada passo do plano da §10 exigirá gate de autorização humana próprio.

## 12. Final Status

`SPEC_COMPLETE_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`
