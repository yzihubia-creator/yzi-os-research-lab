# YZI OS Minimal Harness v0 — Skill Candidate: inspect-authorized-paths

## 1. Objetivo

Definir, de forma documental, o terceiro candidato de skill do `YZI OS Minimal Harness v0`: `inspect-authorized-paths`. Aplica a convenção mínima de frontmatter da Task 215. Não cria skill executável. Implementação técnica = 0%.

## 2. Fonte da Decisão

- Convenção: `/docs/specs/harness/yzi-os-minimal-harness-v0-skill-frontmatter-convention.md` (campos `name`, `description`, `origin`).
- Origem da skill: `/docs/specs/skills/skill-003-inspect-authorized-paths.md`.
- Readiness de entrada: `TASK_217_YZI_OS_MINIMAL_HARNESS_V0_SKILL_CANDIDATE_VALIDATE_SCOPE_BOUNDARIES_CREATED_DOCUMENTARY_ONLY`.

## 3. Candidate Frontmatter

`CANDIDATE FRONTMATTER DOCUMENTAL NÃO-EXECUTÁVEL`

```text
name: inspect-authorized-paths
description: usar quando for necessário verificar se os arquivos e diretórios da task correspondem aos paths autorizados antes de produzir evidência documental
origin: /docs/specs/skills/skill-003-inspect-authorized-paths.md
```

O bloco acima é ilustração textual. Não é YAML operacional, não é schema, não é contrato, não executa nada e não constitui uma skill real.

## 4. Descrição Operacional Mínima (quando futuramente autorizada)

A skill `inspect-authorized-paths`, somente após autorização em outra task, deverá servir apenas para:

- verificar paths explicitamente autorizados;
- comparar arquivo-alvo com escopo permitido;
- detectar criação ou alteração fora do path autorizado;
- apontar necessidade de stop condition;
- apoiar evidência documental.

## 5. Limites Negativos

A skill `inspect-authorized-paths` não deverá:

- autorizar execução;
- ampliar paths autorizados;
- escolher novos diretórios;
- alterar arquivos;
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

`Task 219 — Draft Fourth YZI OS Minimal Harness v0 Skill Candidate: write-evidence-record` — documental, curta, sem criar skill executável; requer nova autorização humana explícita.

## 8. Readiness Statement Final

`TASK_218_YZI_OS_MINIMAL_HARNESS_V0_SKILL_CANDIDATE_INSPECT_AUTHORIZED_PATHS_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhuma skill real, `/skills/`, `SKILL.md`, `.claude/`, código, agent, command, adapter, hook, MCP, script ou runtime criado ou alterado.
