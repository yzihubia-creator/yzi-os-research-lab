# YZI OS Verification Loop Skill Adaptation Spec v1

## Readiness Statement

`YZI_OS_VERIFICATION_LOOP_SKILL_ADAPTATION_SPEC_V1_CREATED_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`

Este documento segue Spec-Driven Development: **define** a adaptação documental da skill ECC `verification-loop` para o YZI OS, mas **não instala a skill, não copia a skill, não cria subagent, não altera `.claude/agents`, não altera `.agents/skills`, não executa validações reais, não altera `platform/`, não executa MCP, não cria backend, schema, frontend ou deploy**.

---

## Purpose

Adaptar o padrão ECC `verification-loop` para o modelo YZI OS de Execution Packs — definindo, em nível documental, como o padrão de verificação contínua do ECC pode orientar os checks de validação dos packs sem induzir auto-fix, auto-apply, ampliação de escopo ou qualquer ação fora do gate humano autorizado.

A adaptação preserva o valor central da skill (verificação sistemática e estruturada antes de transições de estado) e neutraliza os comportamentos incompatíveis com o invariante SDD do YZI OS (correção automática, aplicação implícita, escopo aberto).

Fontes normativas desta spec, em ordem de autoridade:
- [`docs/specs/p0/tenant-boundary.spec.md`](../../p0/tenant-boundary.spec.md) — fronteira de tenant como invariante de engenharia
- [`docs/specs/p1/event-driven-state.spec.md`](../../p1/event-driven-state.spec.md) — toda mudança de estado por evento auditável; skills propõem, nunca emitem evento
- [`docs/specs/implementation/yzi-os-execution-harness-map-v1.md`](../yzi-os-execution-harness-map-v1.md) — harness de execução; packs, lanes, evidence
- [`docs/specs/implementation/yzi-os-reusable-agent-skill-map-v1.md`](../yzi-os-reusable-agent-skill-map-v1.md) — decisão ADAPT_FOR_YZI_OS e análise de conflitos
- [`docs/specs/implementation/yzi-os-supabase-mcp-governance-spec-v1.md`](../yzi-os-supabase-mcp-governance-spec-v1.md) — proibições MCP
- [`docs/specs/implementation/yzi-os-platform-scaffold-spec-v1.md`](../yzi-os-platform-scaffold-spec-v1.md) — boundaries de `platform/`

---

## Source Skill

### Nome

`verification-loop` — origem: repositório ECC ([affaan-m/ECC](https://github.com/affaan-m/ECC/tree/main/.agents/skills))

### Finalidade Original

Executar um ciclo contínuo e estruturado de verificação técnica (build, test, lint, typecheck, security) durante o desenvolvimento, aplicando correções automáticas conforme os checks revelam falhas — iterando até que todos os checks passem.

Posicionamento no ECC: skill de **Qualidade/Verificação**, usada transversalmente por agentes de implementação e auditoria para garantir que o código evolui sem regressões.

### Partes Úteis para YZI OS

- Sequência sistemática de checks: lint → typecheck → build → test → security scan;
- Estrutura de output por check: comando usado, resultado, arquivos afetados, status;
- Abordagem de checklist verificável (o que foi checado, o que passou, o que falhou);
- Conceito de stop criteria por resultado de check (falha bloqueia avanço);
- Separação entre "o que foi inspecionado" e "o que foi alterado" — base para o evidence pattern do YZI OS;
- Orientação para path boundary inspection (quais arquivos foram tocados).

### Partes que Precisam Ser Neutralizadas

| Comportamento ECC | Razão da Neutralização | Regra YZI OS Aplicada |
| --- | --- | --- |
| Auto-fix automático ao detectar falha | Correção é ação separada, exige pack próprio com gate | `verificar ≠ corrigir ≠ aplicar` |
| Loop contínuo até todos os checks passarem | Loop autônomo substitui o gate humano | Um pack = um gate; loop dentro do pack, não sobre o gate |
| Aplicação implícita de mudanças no código | Toda mudança de estado exige evento auditável, não aplicação silenciosa | [`event-driven-state`](../../p1/event-driven-state.spec.md) §6.1 |
| Escopo aberto de arquivos no check | Toda verificação ocorre dentro dos allowed paths do pack ativo | [`execution-harness-map`](../yzi-os-execution-harness-map-v1.md) §8 |
| Instalação de dependências como parte do fix | Instalação é ação de escopo de implementação; exige pack próprio | Platform scaffold §6; harness map §11 |
| Execução de migration ou schema como fix | Gerar ≠ aplicar; migration exige pack dedicado e gate | [`yzi-os-persistence-spec-v1`](../yzi-os-persistence-spec-v1.md) |
| Chamadas MCP como parte do ciclo | MCP default = proibido; read-only exige task explícita | [`supabase-mcp-governance`](../yzi-os-supabase-mcp-governance-spec-v1.md) §3 |

---

## YZI OS Adaptation Principle

### Verificar não é corrigir

A skill adaptada orienta **leitura e inspeção** do estado do artefato. Detectar uma falha no lint ou no typecheck é evidência — não é autorização para corrigir. A correção é o objetivo do próximo pack, com seu próprio gate humano.

### Validar não é aplicar

Um resultado de validação (lint passou, build passou, testes passaram) é **evidência de estado**, não comando de aplicação. Nenhum resultado de verificação aciona operação de escrita, deploy, migration ou merge automaticamente.

### Evidence não é autorização

O output da skill adaptada — checklist de verificações, resultados, status — é **matéria-prima para o evidence record do pack**. Um evidence record documentado não autoriza o pack seguinte: a autorização permanece com o humano.

### Auto-fix é proibido fora de pack explicitamente autorizado

Nenhuma correção automática pode ocorrer como efeito colateral da verificação. Se a skill identifica um problema corrigível, o output deve descrever o problema e sugerir o próximo pack — nunca aplicar a correção diretamente.

### Qualquer correção posterior precisa estar dentro dos allowed paths do pack

Quando um pack subsequente for autorizado para corrigir o que a verificação identificou, suas correções ficam estritamente dentro dos `allowed paths` declarados naquele pack. A spec de verificação não amplia esse escopo.

---

## Allowed Use In YZI OS

A skill adaptada `verification-loop` **poderá orientar** (dentro de um pack com gate humano aprovado) as seguintes verificações:

- **Lint** — execução do linter configurado (ESLint/Biome), leitura do output, registro de violações por arquivo;
- **Build** — execução do build (`next build` ou equivalente), leitura de erros e warnings, registro de status;
- **Typecheck** — execução do TypeScript compiler (`tsc --noEmit`), leitura de erros de tipo, registro por arquivo;
- **Testes** — execução da suíte de testes (Vitest, Jest ou equivalente), leitura de falhas, registro de cobertura quando disponível;
- **Git status** — inspeção do estado do repositório: arquivos modificados, staged, untracked — **sem staging, commit ou push**;
- **Diff inspection** — leitura do diff atual para identificar o escopo real das mudanças antes de reportar;
- **Path boundary check** — verificar que os arquivos tocados estão dentro dos `allowed paths` declarados no pack ativo;
- **Secret scan básico** — inspeção estática de arquivos por padrões de secret (tokens, chaves, connection strings) antes de commit;
- **Validation report** — composição do relatório de verificação estruturado (o que foi checado, resultado, status, arquivos afetados);
- **Evidence checklist** — geração do checklist de evidências a ser incluído no evidence record do pack.

---

## Forbidden Use

A skill adaptada **não pode** orientar, induzir, sugerir ou executar:

- **Alterar arquivos automaticamente** — nenhuma escrita como efeito da verificação;
- **Aplicar auto-fix** — nem via `eslint --fix`, nem via `prettier --write`, nem via qualquer opção `--fix`/`--write`/`--apply`;
- **Instalar dependências** — `npm install`, `pnpm install`, `npx` de instalação ou equivalente;
- **Rodar migrations** — `drizzle-kit push`, `supabase db push`, `prisma migrate` ou equivalente;
- **Executar MCP** — qualquer chamada ao Supabase MCP ou outro MCP server;
- **Criar schema** — geração ou aplicação de DDL de qualquer forma;
- **Criar API** — criação de rotas, endpoints ou server actions;
- **Criar UI** — criação de componentes, páginas ou assets;
- **Ampliar escopo** — inspecionar ou tocar arquivos fora dos `allowed paths` do pack ativo;
- **Commitar sem política do pack** — staging, commit, push ou qualquer operação git de escrita sem a política de commit declarada no pack.

---

## Pack Integration

Como a skill adaptada entra no **Execution Pack Template** ([`harness-map`](../yzi-os-execution-harness-map-v1.md) §8):

### Validation commands/checks

A skill orienta a lista de comandos de verificação a declarar no campo `Validation commands/checks` do pack. Cada comando deve ser:
- executável de forma read-only (sem flags de auto-fix);
- com output capturável e legível;
- com escopo limitado aos `allowed paths` do pack.

Exemplos de estrutura:
```
lint     → npx eslint src/             (somente leitura)
typecheck → npx tsc --noEmit           (somente leitura)
build    → npm run build               (somente leitura)
test     → npm test -- --run           (somente leitura)
git      → git status && git diff      (somente leitura)
secrets  → busca estática por padrões  (somente leitura)
```

### Evidence output

A skill orienta a estrutura do campo `Evidence output` do pack, exigindo que o evidence record inclua, para cada check executado: o comando usado, o resultado (pass/fail/warning), os arquivos envolvidos e a confirmação de ausência de ações proibidas.

### Stop criteria

A skill orienta os `Stop criteria` do pack: qualquer check que produza resultado bloqueante (build failure, typecheck error, secret detectado, path fora dos allowed paths) interrompe a sequência e reporta ao humano — sem tentativa de auto-correção.

### Commit policy

A skill orienta a verificação pré-commit declarada no campo `Commit policy` do pack: nenhum commit sem lint/typecheck/build passing; nenhum secret em staging; somente arquivos dentro dos `allowed paths` stageable.

### Regression risk handoff

A skill orienta o campo `Next pack candidate` do pack: quando a verificação identificar falhas que exigem correção, a skill sugere o pack de correção apropriado para a lane correspondente — **não o executa, não o autoriza**.

---

## Lane Usage

| Lane | How Verification Applies | Examples |
| ---- | ------------------------ | -------- |
| **Database Lane** | Verificar SQL gerado (sem aplicar), lint de arquivos de migration, typecheck de arquivos Drizzle, path check (somente `platform/src/db/` e `platform/drizzle/`), confirmação de ausência de `push`/`apply` | `tsc --noEmit` nos arquivos de schema; `git diff --stat` para confirmar escopo; secret scan em arquivos `.sql` gerados |
| **Backend Lane** | Lint e typecheck de API routes e services, execução de testes unitários, verificação de path (somente `platform/src/` server-side), git status para confirmar que nenhum arquivo de schema foi tocado | `eslint platform/src/app/api/`; `tsc --noEmit`; `npm test -- --run`; `git status` |
| **Frontend Lane** | Lint e typecheck de componentes e pages, build check para confirmar que o cockpit compila, verificação de path (somente `platform/src/app/` e `platform/src/components/`), ausência de lógica de estado inventado | `eslint platform/src/app/`; `next build`; `tsc --noEmit`; `git diff` para confirmar escopo |
| **Supabase MCP Lane** | Verificação de output MCP read-only: confirmar que nenhuma escrita ocorreu, nenhum secret apareceu em output, git status permanece limpo, diff = zero | `git status` (deve ser limpo após inspeção MCP); secret scan no output capturado; path check (zero arquivos tocados) |
| **Design/Site Lane** | **Não aplicável** — esta lane usa skills locais (`impeccable`, `ckm-*`, `emilkowalski-design`) e não envolve verification-loop; qualquer verificação técnica de código de site usa as checagens padrão do pack, não esta skill | — |
| **Audit/Governance Lane** | Verificação transversal de evidence: confirmar que o evidence record está completo (checklist de checks, resultados, arquivos, forbidden-actions absent), diff inspection do artefato auditado, path check de independência (o auditor não tocou o que auditou) | Evidence checklist review; `git diff` no artefato auditado; confirmação de read-only do agente de auditoria |

---

## Required Evidence Pattern

Todo uso da skill adaptada **deve produzir**, no evidence record do pack, os seguintes campos mínimos por check executado:

| Campo | Conteúdo esperado |
| --- | --- |
| **what was checked** | Descrição do check (ex.: "TypeScript typecheck em platform/src/app/api/") |
| **command/check used** | Comando exato executado (ex.: `npx tsc --noEmit`) |
| **result** | `PASS`, `FAIL` ou `WARNING` com detalhe do erro/aviso se não-PASS |
| **files touched** | Lista de arquivos lidos/inspecionados; deve estar inteiramente dentro dos `allowed paths` do pack |
| **forbidden actions confirmed absent** | Confirmação explícita: nenhum auto-fix, nenhuma escrita, nenhuma instalação, nenhuma migration, nenhum MCP, nenhum commit não-autorizado ocorreu |
| **git status** | Saída de `git status` ao final da verificação (deve refletir apenas o escopo do pack ativo) |
| **next recommended pack** | Nome do pack seguinte sugerido (não autorizado pelo evidence); se todos os checks passaram, o pack de implementação seguinte; se algum falhou, o pack de correção correspondente |

---

## What This Does Not Authorize

`This spec does NOT authorize:`

- instalar a skill;
- copiar a skill;
- criar subagent;
- alterar `.agents/skills`;
- alterar `.claude/agents`;
- executar validações reais;
- alterar `platform/`;
- executar MCP;
- criar backend;
- criar schema;
- criar frontend;
- deploy.

Cada uso real da skill adaptada ocorrerá dentro de um Execution Pack com gate humano próprio, conforme [`yzi-os-execution-harness-map-v1`](../yzi-os-execution-harness-map-v1.md) §8.

---

## Final Status

`SPEC_COMPLETE_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`

---

## Validação

**Arquivo criado:** `docs/specs/implementation/skills/yzi-os-verification-loop-skill-adaptation-spec-v1.md`

**Fontes lidas:**
1. `docs/specs/implementation/yzi-os-execution-harness-map-v1.md` ✅
2. `docs/specs/implementation/yzi-os-reusable-agent-skill-map-v1.md` ✅
3. `docs/specs/implementation/yzi-os-supabase-mcp-governance-spec-v1.md` ✅
4. `docs/specs/implementation/yzi-os-platform-scaffold-spec-v1.md` ✅
5. `docs/specs/p0/tenant-boundary.spec.md` ✅
6. `docs/specs/p1/event-driven-state.spec.md` ✅
7. `.agents/skills/` — examinado: `verification-loop` não está instalada localmente (confirmado) ✅
8. Referência ECC `verification-loop` — consultada via documentação registrada em `yzi-os-reusable-agent-skill-map-v1` §5, §6, §9 ✅

**Referência ECC consultada:** `verification-loop` classificada como `ADAPT_FOR_YZI_OS`, prioridade Alta, domínio "build/test/lint/typecheck/security contínuos", conflito identificado: auto-fix contínuo incompatível com o invariante "verificar ≠ corrigir ≠ aplicar" do YZI OS.

**O que foi adaptado:**
- Sequência sistemática de checks (lint, typecheck, build, test, git, secrets) — preservada como orientação para `Validation commands/checks` dos packs;
- Estrutura de evidence output — adaptada ao `Required Evidence Pattern` do YZI OS;
- Stop criteria por resultado de check — alinhados ao modelo de gate do harness;
- Conceito de path boundary inspection — vinculado aos `allowed paths` dos packs.

**O que foi proibido/neutralizado:**
- Auto-fix automático (`eslint --fix`, `prettier --write` e equivalentes) — proibido;
- Loop autônomo até convergência — proibido (loop dentro do pack, não sobre o gate);
- Aplicação implícita de mudanças — proibida;
- Escopo aberto de arquivos — proibido (restrito a `allowed paths` do pack);
- Instalação de dependências como fix — proibida;
- Migration/schema como fix — proibido;
- Chamadas MCP — proibidas.

**Confirmação de não-implementação:** nada foi implementado. A spec é documental.

**Confirmação de não-alteração de `.claude/agents`:** `.claude/agents` não foi alterado ✅

**Confirmação de não-alteração de `.agents/skills`:** `.agents/skills` não foi alterado ✅

**Confirmação de não-alteração de `platform/`:** `platform/` não foi alterado ✅

**Próximo passo recomendado:** aprovação humana desta spec, seguida (em task própria com gate) pela criação da spec de adaptação das demais skills de prioridade Alta da primeira leva: `security-review`, `backend-patterns`, `api-design`, `coding-standards` — conforme [`yzi-os-reusable-agent-skill-map-v1`](../yzi-os-reusable-agent-skill-map-v1.md) §10, passo 3.

---

## Critério de Parada

Parar e reportar se:

- a referência ECC `verification-loop` não puder ser consultada;
- qualquer fonte obrigatória estiver ausente;
- houver necessidade de alterar `.agents/skills`;
- houver necessidade de alterar `.claude/agents`;
- houver necessidade de alterar `platform/`;
- houver ambiguidade sobre o arquivo de destino;
- houver qualquer tentativa de implementação.
