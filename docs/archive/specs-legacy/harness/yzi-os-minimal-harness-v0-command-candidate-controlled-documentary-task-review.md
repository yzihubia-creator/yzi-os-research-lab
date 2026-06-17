# YZI OS Minimal Harness v0 — Command Candidate: controlled-documentary-task-review

## 1. Objetivo

Criar o primeiro candidato documental de command do `YZI OS Minimal Harness v0`: `controlled-documentary-task-review`, que descreve, de forma documental, uma sequência humana/assistida para revisar uma task documental antes de aceitar o output. Não cria command real, não cria `.claude/commands`, não cria arquivo executável, código, loader, registry, runner, hook, MCP nem execução técnica. Implementação técnica = 0%.

## 2. Fonte da Decisão

- Contexto de governança: `/docs/specs/execution-readiness/compact-operational-governance-context.md`.
- Convenção: `/docs/specs/harness/yzi-os-minimal-harness-v0-documentary-command-candidate-convention.md`.
- Readiness de entrada: `TASK_231_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_COMMAND_CANDIDATE_CONVENTION_CREATED_DOCUMENTARY_ONLY`.

## 3. Candidate Fields Documentais

`CANDIDATE COMMAND FIELDS DOCUMENTAL NÃO-EXECUTÁVEL`

O bloco abaixo é ilustração textual. Não é YAML operacional, não é JSON, não é schema, não é contrato e não executa nada.

```text
name: controlled-documentary-task-review
description: usar como orientação documental para revisar uma task concluída ou bloqueada antes de aceitar seu output
references:
  - /docs/specs/harness/skills/read-approved-specs/SKILL.md
  - /docs/specs/harness/skills/validate-scope-boundaries/SKILL.md
  - /docs/specs/harness/skills/inspect-authorized-paths/SKILL.md
  - /docs/specs/harness/skills/detect-governance-violation/SKILL.md
  - /docs/specs/harness/skills/write-evidence-record/SKILL.md
```

## 4. Sequência Documental Sugerida

Orientação textual não-executável:

1. ler a spec aprovada;
2. validar escopo permitido/proibido;
3. inspecionar paths autorizados;
4. detectar possível violação de governança;
5. registrar ou conferir evidência documental.

Essa sequência não executa nada e não substitui revisão humana.

## 5. References às Skills Documentais

O candidate referencia apenas os cinco `SKILL.md` canônicos listados na Seção 3. Referenciar uma skill não concede execução.

## 6. Usos Permitidos

Apenas como referência documental para: revisar output de task documental; estruturar revisão humana; reduzir erro operacional; conferir consistência com as skills documentais; apoiar criação ou conferência de evidence records.

## 7. Usos Proibidos

O candidate não pode: executar comandos; criar command real; criar `.claude/commands`; acionar ferramentas; chamar scripts; operar como runner/registry/loader/hook; configurar MCP; criar código; alterar arquivos automaticamente; autorizar próxima task; substituir revisão humana.

## 8. Próxima Task Recomendada

`Task 233 — Create YZI OS Minimal Harness v0 Documentary Command Candidate Review Record` — revisar apenas o command candidate documental criado, sem command real, sem `.claude/commands`, sem código e sem execução técnica; requer nova autorização humana explícita.

## 9. Readiness Statement Final

`TASK_232_YZI_OS_MINIMAL_HARNESS_V0_COMMAND_CANDIDATE_CONTROLLED_DOCUMENTARY_TASK_REVIEW_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhum command real, `.claude/`, `.claude/commands`, `SKILL.md` alterado, skill nova, código, loader, registry, runner, hook, MCP, script ou runtime criado ou alterado.
