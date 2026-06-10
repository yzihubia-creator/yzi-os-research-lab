# YZI OS Minimal Harness v0 — Documentary Command Candidates Expansion Gate

## 1. Objetivo

Gate documental para decidir se a fase pode expandir de um command candidate documental para um pequeno conjunto de command candidates documentais, limitando a expansão antes de qualquer criação. Não cria novos command candidates, command real, `.claude/commands`, código, loader, registry, runner, hook, MCP nem execução técnica. Implementação técnica = 0%.

## 2. Fonte do Gate

- Contexto de governança: `/docs/specs/execution-readiness/compact-operational-governance-context.md`.
- Verificação ECC: `/docs/specs/harness/yzi-os-minimal-harness-v0-ecc-command-pattern-verification-record.md`.
- Convenção: `/docs/specs/harness/yzi-os-minimal-harness-v0-documentary-command-candidate-convention.md`.
- Readiness de entrada: `TASK_234_ECC_COMMAND_PATTERN_VERIFICATION_RECORD_CREATED_DOCUMENTARY_ONLY`.

## 3. Decisão da Task 234

`KEEP_CURRENT_YZI_DOCUMENTARY_COMMAND_CONVENTION`. A convenção documental permanece restrita a `name`, `description`, `references`, citando skills por path canônico, sem execução. Qualquer expansão deve preservar essa convenção.

## 4. Tabela de Expansão

| Proposed Command Candidate | Purpose | Expansion Status |
| -------------------------- | ------- | ---------------- |
| controlled-documentary-task-review | revisar uma task documental antes de aceitar o output | ALREADY_CREATED_DOCUMENTARY_ONLY |
| prepare-next-documentary-task-prompt | orientar documentalmente a preparação do próximo prompt de task a partir do último readiness statement, escopo permitido/proibido e próxima task recomendada | APPROVED_FOR_NEXT_DOCUMENTARY_CANDIDATE_TASK |
| review-documentary-evidence-record | orientar documentalmente a revisão de um evidence record antes de aceitar o fechamento de uma task | APPROVED_FOR_NEXT_DOCUMENTARY_CANDIDATE_TASK |

## 5. Proposta de Expansão Mínima

Expansão máxima permitida nesta fase: apenas **dois** novos command candidates documentais (Seção 4). Se criados em task futura, deverão continuar documentais e usar apenas `name`, `description`, `references`.

## 6. Candidates Proibidos Nesta Fase

`NOT_APPROVED_FOR_THIS_PHASE` — qualquer command candidate que: execute shell; crie ou altere código; acione tool; crie `.claude/commands`; opere como runner; opere como registry; opere como loader; configure MCP; seja voltado a vertical de produto; seja voltado a runtime técnico.

## 7. Decisão do Gate

`GATE_OPEN_FOR_TWO_ADDITIONAL_DOCUMENTARY_COMMAND_CANDIDATES_ONLY`

Esta decisão não cria os candidates, não autoriza command real, não autoriza `.claude/commands` e não autoriza execução técnica.

## 8. Limites de Não-Execução

Documento apenas. Nenhum novo command candidate, command real, `.claude/`, `.claude/commands`, `SKILL.md` alterado, skill nova, código, loader, registry, runner, hook, MCP, agent, adapter, script, YAML operacional, JSON ou contrato machine-readable criado. Candidate (Task 232) e convenção (Task 231) inalterados. `/tools/controlled-harness/`, banco, runtime, frontend e workflows n8n inalterados. Verticais não expandidas.

## 9. Próxima Task Recomendada

`Task 236 — Draft Two Additional YZI OS Minimal Harness v0 Documentary Command Candidates` — criar apenas os dois candidates documentais `prepare-next-documentary-task-prompt` e `review-documentary-evidence-record`, sem command real, sem `.claude/commands`, sem código e sem execução técnica; requer nova autorização humana explícita.

## 10. Readiness Statement Final

`TASK_235_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_COMMAND_CANDIDATES_EXPANSION_GATE_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhum command real, `.claude/`, `.claude/commands`, `SKILL.md` alterado, skill nova, código, loader, registry, runner, hook, MCP, script ou runtime criado ou alterado.
