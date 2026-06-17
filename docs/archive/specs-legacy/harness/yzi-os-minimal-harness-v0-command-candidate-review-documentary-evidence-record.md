# YZI OS Minimal Harness v0 — Command Candidate: review-documentary-evidence-record

## 1. Objetivo

Criar o command candidate documental `review-documentary-evidence-record`, que orienta documentalmente a revisão de um evidence record antes de aceitar o fechamento de uma task. Não cria command real, `.claude/commands`, arquivo executável, código, loader, registry, runner, hook, MCP nem execução técnica. Implementação técnica = 0%.

## 2. Fonte da Decisão

- Contexto de governança: `/docs/specs/execution-readiness/compact-operational-governance-context.md`.
- Gate de expansão: `/docs/specs/harness/yzi-os-minimal-harness-v0-documentary-command-candidates-expansion-gate.md`.
- Convenção: `/docs/specs/harness/yzi-os-minimal-harness-v0-documentary-command-candidate-convention.md`.
- Readiness de entrada: `TASK_235_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_COMMAND_CANDIDATES_EXPANSION_GATE_CREATED_DOCUMENTARY_ONLY`.

## 3. Candidate Fields Documentais

`CANDIDATE COMMAND FIELDS DOCUMENTAL NÃO-EXECUTÁVEL`

O bloco abaixo é ilustração textual. Não é YAML operacional, não é JSON, não é schema, não é contrato e não executa nada.

```text
name: review-documentary-evidence-record
description: usar como orientação documental para revisar um evidence record antes de aceitar o fechamento de uma task
references:
  - /docs/specs/harness/skills/read-approved-specs/SKILL.md
  - /docs/specs/harness/skills/validate-scope-boundaries/SKILL.md
  - /docs/specs/harness/skills/inspect-authorized-paths/SKILL.md
  - /docs/specs/harness/skills/detect-governance-violation/SKILL.md
  - /docs/specs/harness/skills/write-evidence-record/SKILL.md
```

## 4. Sequência Documental Sugerida

Orientação textual não-executável:

1. ler o evidence record;
2. conferir readiness statement;
3. verificar arquivos criados/modificados;
4. validar ausência de execução técnica indevida;
5. checar riscos residuais;
6. confirmar ou bloquear fechamento documental.

Essa sequência não executa nada e não substitui revisão humana.

## 5. References às Skills Documentais

O candidate referencia apenas os cinco `SKILL.md` canônicos listados na Seção 3. Referenciar uma skill não concede execução.

## 6. Usos Permitidos

Apenas como referência documental para: revisar evidence records; estruturar revisão humana; reduzir erro operacional; manter continuidade entre tasks; preservar escopo e readiness statements.

## 7. Usos Proibidos

O candidate não pode: executar comandos; criar command real; criar `.claude/commands`; acionar ferramentas; chamar scripts; operar como runner/registry/loader/hook; configurar MCP; criar código; alterar arquivos automaticamente; autorizar próxima task; substituir revisão humana.

## 8. Readiness Statement Final

`TASK_236_COMMAND_CANDIDATE_REVIEW_DOCUMENTARY_EVIDENCE_RECORD_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhum command real, `.claude/`, `.claude/commands`, `SKILL.md` alterado, skill nova, código, loader, registry, runner, hook, MCP, script ou runtime criado ou alterado.
