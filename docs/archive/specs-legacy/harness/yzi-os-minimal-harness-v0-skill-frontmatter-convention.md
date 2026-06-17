# YZI OS Minimal Harness v0 — Skill Frontmatter Convention

## 1. Objetivo

Definir a convenção documental mínima de frontmatter para futuras skills do `YZI OS Minimal Harness v0`. Copia/adapta o padrão ECC mínimo observado na Task 214, sem inventar taxonomia nova. Documento apenas. Implementação técnica = 0%.

## 2. Fonte da Decisão

- `/docs/specs/harness/yzi-os-ecc-process-patterns-minimal.md` — padrão aprovado `skills — frontmatter name/description/origin em skills/*/SKILL.md` (`COPY_PATTERN_MINIMALLY`).
- Evidência ECC: cross-harness.md — "Skills form the most portable unit ... skills/*/SKILL.md ... name, description, origin".
- Readiness de entrada: `TASK_214_ECC_PROCESS_PATTERNS_EXTRACTED_FOR_YZI_OS_MINIMAL_HARNESS_DOCUMENTARY_ONLY`.

## 3. Convenção Mínima

Toda futura skill do YZI OS Minimal Harness v0 declara exatamente três campos no frontmatter: `name`, `description`, `origin`. Nenhum outro campo nesta fase.

## 4. Campos Permitidos

- `name`: nome curto e identificável da futura skill.
- `description`: quando a skill deve ser usada (gatilho de uso).
- `origin`: artefato aprovado que justifica a existência da skill.

## 5. Exemplo Documental Não-Executável

`EXEMPLO DOCUMENTAL NÃO-EXECUTÁVEL`

```text
name: read-approved-specs
description: usar quando for necessário ler uma spec aprovada antes de produzir evidência documental
origin: /docs/specs/harness/yzi-os-ecc-process-patterns-minimal.md
```

O bloco acima é ilustração textual. Não é YAML operacional, não é schema, não é contrato, não executa nada.

## 6. Regras de Uso

- Usar somente os três campos definidos; não adicionar campos.
- `origin` deve sempre apontar para um artefato aprovado, nunca para preferência solta do executor.
- `description` descreve o gatilho de uso, não a implementação.
- A convenção é documental; não autoriza criação de skill executável.

## 7. Proibições (Nesta Fase)

- Não criar skill real, diretório `/skills/`, nem `SKILL.md`.
- Não criar `.claude/`, agent, command, adapter, hook, MCP config, script, runner, registry ou loader.
- Não criar YAML operacional, JSON, schema ou contrato machine-readable.
- Não adicionar campos além de `name`, `description`, `origin`.
- Não alterar `/tools/controlled-harness/`, banco, runtime, frontend ou workflows n8n.
- Não expandir arquitetura, verticais ou documentação longa.

## 8. Próxima Task Recomendada

`Task 216 — Draft First YZI OS Minimal Harness v0 Skill Candidate: read-approved-specs` — documental, curta, sem criar skill executável; requer nova autorização humana explícita.

## 9. Readiness Statement Final

`TASK_215_YZI_OS_MINIMAL_HARNESS_V0_SKILL_FRONTMATTER_CONVENTION_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhuma skill, código, agent, command, adapter, hook, MCP, script ou runtime criado ou alterado.
