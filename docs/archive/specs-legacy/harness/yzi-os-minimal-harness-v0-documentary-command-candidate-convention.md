# YZI OS Minimal Harness v0 — Documentary Command Candidate Convention

## 1. Objetivo

Definir a convenção documental mínima para futuros command candidates do `YZI OS Minimal Harness v0`: apenas os campos mínimos que um command candidate documental deverá conter. Esta task não cria command candidate, não cria command real, não cria `.claude/commands`, não cria código, loader, registry, runner, hook, MCP nem execução técnica. Implementação técnica = 0%.

## 2. Fonte da Convenção

- Contexto de governança: `/docs/specs/execution-readiness/compact-operational-governance-context.md`.
- Boundary: `/docs/specs/harness/yzi-os-minimal-harness-v0-documentary-command-candidate-boundary.md`.
- Readiness de entrada: `TASK_230_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_COMMAND_CANDIDATE_BOUNDARY_CREATED_DOCUMENTARY_ONLY`.

## 3. Definição de Command Candidate Documental

Artefato documental futuro que poderá descrever uma ação humana/assistida recorrente baseada nas cinco skills documentais, mas que não executa comandos, não aciona ferramentas, não cria automação e não substitui autorização humana.

## 4. Campos Mínimos Permitidos

Um futuro command candidate documental deverá conter apenas três campos:

- `name`: nome curto do futuro command candidate documental;
- `description`: quando o command candidate documental deve ser usado como orientação;
- `references`: lista textual de paths canônicos dos `SKILL.md` documentais relacionados.

Não adicionar outros campos. O campo `references` aceita apenas paths documentais para os cinco `SKILL.md` já materializados.

## 5. Regras de Referência às Skills

O campo `references` pode citar apenas estes paths canônicos. Referenciar uma skill não concede execução.

1. `/docs/specs/harness/skills/read-approved-specs/SKILL.md`
2. `/docs/specs/harness/skills/validate-scope-boundaries/SKILL.md`
3. `/docs/specs/harness/skills/inspect-authorized-paths/SKILL.md`
4. `/docs/specs/harness/skills/detect-governance-violation/SKILL.md`
5. `/docs/specs/harness/skills/write-evidence-record/SKILL.md`

## 6. Exemplo Documental Não-Executável

`EXEMPLO DOCUMENTAL NÃO-EXECUTÁVEL`

O bloco abaixo é ilustração textual de um futuro command candidate chamado `controlled-documentary-task-review`. Não é YAML operacional, não é JSON, não é schema, não é contrato e não executa nada.

```text
name: controlled-documentary-task-review
description: usar como orientação documental ao revisar uma task documental antes de registrar evidência
references:
  - /docs/specs/harness/skills/read-approved-specs/SKILL.md
  - /docs/specs/harness/skills/validate-scope-boundaries/SKILL.md
  - /docs/specs/harness/skills/inspect-authorized-paths/SKILL.md
  - /docs/specs/harness/skills/detect-governance-violation/SKILL.md
  - /docs/specs/harness/skills/write-evidence-record/SKILL.md
```

## 7. Proibições

A convenção e qualquer futuro command candidate não poderão: criar command real; criar `.claude/commands`; executar comandos; acionar ferramentas; chamar scripts; operar como runner/registry/loader/hook; configurar MCP; criar código; alterar arquivos automaticamente; autorizar próxima task; substituir revisão humana; criar YAML operacional, JSON ou contrato machine-readable.

## 8. Próxima Task Recomendada

`Task 232 — Draft First YZI OS Minimal Harness v0 Documentary Command Candidate: controlled-documentary-task-review` — criar apenas um candidate documental, sem command real, sem `.claude/commands`, sem código e sem execução técnica; requer nova autorização humana explícita.

## 9. Readiness Statement Final

`TASK_231_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_COMMAND_CANDIDATE_CONVENTION_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhum command real, `.claude/`, `.claude/commands`, `SKILL.md` alterado, skill nova, código, loader, registry, runner, hook, MCP, script ou runtime criado ou alterado.
