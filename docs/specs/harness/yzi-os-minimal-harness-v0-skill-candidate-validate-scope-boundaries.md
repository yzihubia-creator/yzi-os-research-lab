# YZI OS Minimal Harness v0 — Skill Candidate: validate-scope-boundaries

## 1. Objetivo

Definir, de forma documental, o segundo candidato de skill do `YZI OS Minimal Harness v0`: `validate-scope-boundaries`. Aplica a convenção mínima de frontmatter da Task 215. Não cria skill executável. Implementação técnica = 0%.

## 2. Fonte da Decisão

- Convenção: `/docs/specs/harness/yzi-os-minimal-harness-v0-skill-frontmatter-convention.md` (campos `name`, `description`, `origin`).
- Origem da skill: `/docs/specs/skills/skill-001-validate-scope-boundaries.md`.
- Readiness de entrada: `TASK_216A_READINESS_STATEMENT_CORRECTED_FOR_READ_APPROVED_SPECS_SKILL_CANDIDATE_DOCUMENTARY_ONLY`.

## 3. Candidate Frontmatter

`CANDIDATE FRONTMATTER DOCUMENTAL NÃO-EXECUTÁVEL`

```text
name: validate-scope-boundaries
description: usar quando for necessário validar se uma task permanece dentro do escopo autorizado antes de produzir evidência documental
origin: /docs/specs/skills/skill-001-validate-scope-boundaries.md
```

O bloco acima é ilustração textual. Não é YAML operacional, não é schema, não é contrato, não executa nada e não constitui uma skill real.

## 4. Descrição Operacional Mínima (quando futuramente autorizada)

A skill `validate-scope-boundaries`, somente após autorização em outra task, deverá servir apenas para:

- comparar a task solicitada com o escopo autorizado;
- identificar expansão indevida;
- verificar escopo permitido e escopo proibido;
- apontar necessidade de stop condition;
- apoiar evidência documental.

## 5. Limites Negativos

A skill `validate-scope-boundaries` não deverá:

- autorizar execução;
- ampliar escopo;
- alterar specs;
- criar código;
- criar artefatos técnicos;
- executar comandos;
- substituir revisão humana;
- decidir produto ou arquitetura por conta própria.

## 6. Critérios de Aceitação Futura

A futura criação desta skill (em task própria e autorizada) só será aceita se:

- usar exatamente os campos `name`, `description`, `origin`;
- manter o `origin` apontando para artefato aprovado;
- permanecer documental até autorização explícita para skill executável;
- não criar `/skills/`, `SKILL.md`, `.claude/`, código ou estrutura executável.

## 7. Próxima Task Recomendada

`Task 218 — Draft Third YZI OS Minimal Harness v0 Skill Candidate: inspect-authorized-paths` — documental, curta, sem criar skill executável; requer nova autorização humana explícita.

## 8. Readiness Statement Final

`TASK_217_YZI_OS_MINIMAL_HARNESS_V0_SKILL_CANDIDATE_VALIDATE_SCOPE_BOUNDARIES_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhuma skill real, `/skills/`, `SKILL.md`, `.claude/`, código, agent, command, adapter, hook, MCP, script ou runtime criado ou alterado.
