# YZI OS Minimal Harness v0 — Skill Candidate: read-approved-specs

## 1. Objetivo

Definir, de forma documental, o primeiro candidato de skill do `YZI OS Minimal Harness v0`: `read-approved-specs`. Aplica a convenção mínima de frontmatter da Task 215. Não cria skill executável. Implementação técnica = 0%.

## 2. Fonte da Decisão

- Convenção: `/docs/specs/harness/yzi-os-minimal-harness-v0-skill-frontmatter-convention.md` (campos `name`, `description`, `origin`).
- Readiness de entrada: `TASK_215_YZI_OS_MINIMAL_HARNESS_V0_SKILL_FRONTMATTER_CONVENTION_CREATED_DOCUMENTARY_ONLY`.

## 3. Candidate Frontmatter

`CANDIDATE FRONTMATTER — DOCUMENTAL NÃO-EXECUTÁVEL`

```text
name: read-approved-specs
description: usar quando for necessário ler uma spec aprovada antes de produzir evidência documental
origin: /docs/specs/harness/yzi-os-minimal-harness-v0-skill-frontmatter-convention.md
```

O bloco acima é ilustração textual. Não é YAML operacional, não é schema, não é contrato, não executa nada e não constitui uma skill real.

## 4. Uso Permitido (quando futuramente autorizada)

A skill `read-approved-specs`, somente após autorização em outra task, deverá servir apenas para:

- ler specs aprovadas;
- sintetizar contexto autorizado;
- apontar lacunas documentais;
- preservar a origem da informação;
- apoiar evidência documental.

## 5. Limites Negativos

A skill `read-approved-specs` não deverá:

- decidir escopo;
- autorizar execução;
- alterar specs;
- criar código;
- criar artefatos técnicos;
- executar comandos;
- substituir revisão humana.

## 6. Critérios de Aceitação Futura

A futura criação desta skill (em task própria e autorizada) só será aceita se:

- usar exatamente os campos `name`, `description`, `origin`;
- manter o `origin` apontando para artefato aprovado;
- permanecer documental até autorização explícita para skill executável;
- não criar `/skills/`, `SKILL.md`, `.claude/`, código ou estrutura executável.

## 7. Próxima Task Recomendada

`Task 217 — Draft Second YZI OS Minimal Harness v0 Skill Candidate: validate-scope-boundaries` — documental, curta, sem criar skill executável; requer nova autorização humana explícita.

## 8. Readiness Statement Final

`TASK_216_YZI_OS_MINIMAL_HARNESS_V0_SKILL_CANDIDATE_READ_APPROVED_SPECS_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhuma skill real, `/skills/`, `SKILL.md`, `.claude/`, código, agent, command, adapter, hook, MCP, script ou runtime criado ou alterado.
