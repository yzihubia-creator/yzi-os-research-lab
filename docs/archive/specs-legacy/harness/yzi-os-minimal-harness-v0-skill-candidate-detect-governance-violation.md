# YZI OS Minimal Harness v0 — Skill Candidate: detect-governance-violation

## 1. Objetivo

Definir, de forma documental, o quinto candidato de skill do `YZI OS Minimal Harness v0`: `detect-governance-violation`. Aplica a convenção mínima de frontmatter da Task 215. Não cria skill executável. Implementação técnica = 0%.

## 2. Fonte da Decisão

- Convenção: `/docs/specs/harness/yzi-os-minimal-harness-v0-skill-frontmatter-convention.md` (campos `name`, `description`, `origin`).
- Origem da skill: `/docs/specs/skills/skill-005-detect-governance-violation.md`.
- Readiness de entrada: `TASK_219_YZI_OS_MINIMAL_HARNESS_V0_SKILL_CANDIDATE_WRITE_EVIDENCE_RECORD_CREATED_DOCUMENTARY_ONLY`.

## 3. Candidate Frontmatter

`CANDIDATE FRONTMATTER DOCUMENTAL NÃO-EXECUTÁVEL`

```text
name: detect-governance-violation
description: usar quando for necessário identificar possível violação de governança antes de aceitar ou registrar evidência documental
origin: /docs/specs/skills/skill-005-detect-governance-violation.md
```

O bloco acima é ilustração textual. Não é YAML operacional, não é schema, não é contrato, não executa nada e não constitui uma skill real.

## 4. Descrição Operacional Mínima (quando futuramente autorizada)

A skill `detect-governance-violation`, somente após autorização em outra task, deverá servir apenas para:

- identificar possível ausência de autorização humana explícita;
- identificar tentativa de expansão de escopo;
- identificar criação/alteração fora de path autorizado;
- identificar tentativa de execução técnica não autorizada;
- apontar stop condition;
- apoiar evidência documental.

## 5. Limites Negativos

A skill `detect-governance-violation` não deverá:

- remediar violação por conta própria;
- autorizar execução;
- ampliar escopo;
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

`Task 221 — Consolidate YZI OS Minimal Harness v0 Skill Candidates Index` — documental, curta, sem criar skill executável; requer nova autorização humana explícita.

## 8. Readiness Statement Final

`TASK_220_YZI_OS_MINIMAL_HARNESS_V0_SKILL_CANDIDATE_DETECT_GOVERNANCE_VIOLATION_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhuma skill real, `/skills/`, `SKILL.md`, `.claude/`, código, agent, command, adapter, hook, MCP, script ou runtime criado ou alterado.
