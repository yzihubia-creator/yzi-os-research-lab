# YZI OS Minimal Harness v0 — Skill Candidate: write-evidence-record

## 1. Objetivo

Definir, de forma documental, o quarto candidato de skill do `YZI OS Minimal Harness v0`: `write-evidence-record`. Aplica a convenção mínima de frontmatter da Task 215. Não cria skill executável. Implementação técnica = 0%.

## 2. Fonte da Decisão

- Convenção: `/docs/specs/harness/yzi-os-minimal-harness-v0-skill-frontmatter-convention.md` (campos `name`, `description`, `origin`).
- Origem da skill: `/docs/specs/skills/skill-004-write-evidence-record.md`.
- Readiness de entrada: `TASK_218_YZI_OS_MINIMAL_HARNESS_V0_SKILL_CANDIDATE_INSPECT_AUTHORIZED_PATHS_CREATED_DOCUMENTARY_ONLY`.

## 3. Candidate Frontmatter

`CANDIDATE FRONTMATTER DOCUMENTAL NÃO-EXECUTÁVEL`

```text
name: write-evidence-record
description: usar quando for necessário registrar evidência documental curta de uma task concluída ou bloqueada
origin: /docs/specs/skills/skill-004-write-evidence-record.md
```

O bloco acima é ilustração textual. Não é YAML operacional, não é schema, não é contrato, não executa nada e não constitui uma skill real.

## 4. Descrição Operacional Mínima (quando futuramente autorizada)

A skill `write-evidence-record`, somente após autorização em outra task, deverá servir apenas para:

- registrar artefato criado ou modificado;
- registrar path autorizado usado;
- registrar escopo proibido evitado;
- registrar status de execução técnica;
- registrar readiness statement final.

## 5. Limites Negativos

A skill `write-evidence-record` não deverá:

- validar a própria execução;
- autorizar próxima task;
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

`Task 220 — Draft Fifth YZI OS Minimal Harness v0 Skill Candidate: detect-governance-violation` — documental, curta, sem criar skill executável; requer nova autorização humana explícita.

## 8. Readiness Statement Final

`TASK_219_YZI_OS_MINIMAL_HARNESS_V0_SKILL_CANDIDATE_WRITE_EVIDENCE_RECORD_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhuma skill real, `/skills/`, `SKILL.md`, `.claude/`, código, agent, command, adapter, hook, MCP, script ou runtime criado ou alterado.
