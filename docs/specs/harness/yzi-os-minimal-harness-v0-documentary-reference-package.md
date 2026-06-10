# YZI OS Minimal Harness v0 — Documentary Reference Package

## 1. Objetivo

Reunir, em um único arquivo documental de referência, os oito artefatos documentais aprovados do YZI OS Minimal Harness v0, citando-os apenas por path canônico para apoiar revisão humana, preparação de prompts e rastreabilidade entre tasks. Este package é referência humana, não sistema técnico. Não cria pacote executável, loader, registry, runner, `.claude/`, hook, MCP, código nem execução técnica. Implementação técnica = 0%.

## 2. Fonte do Package

- Contexto de governança: `/docs/specs/execution-readiness/compact-operational-governance-context.md`.
- Plano do package: `/docs/specs/harness/yzi-os-minimal-harness-v0-documentary-reference-package-plan.md`.
- Gate de autorização: `/docs/specs/harness/yzi-os-minimal-harness-v0-documentary-reference-package-authorization-gate.md`.
- Readiness de entrada: `TASK_241_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_REFERENCE_PACKAGE_AUTHORIZATION_GATE_CREATED_DOCUMENTARY_ONLY`.
- Decisão do gate: `GATE_OPEN_FOR_NEXT_HUMAN_AUTHORIZED_DOCUMENTARY_REFERENCE_PACKAGE_TASK`.

## 3. Índice dos Oito Artefatos

| Order | Artifact Type | Artifact Name | Canonical Path | Reference Status |
| ----- | ------------- | ------------- | -------------- | ---------------- |
| 1 | Skill | read-approved-specs | `/docs/specs/harness/skills/read-approved-specs/SKILL.md` | DOCUMENTARY_REFERENCE_ONLY |
| 2 | Skill | validate-scope-boundaries | `/docs/specs/harness/skills/validate-scope-boundaries/SKILL.md` | DOCUMENTARY_REFERENCE_ONLY |
| 3 | Skill | inspect-authorized-paths | `/docs/specs/harness/skills/inspect-authorized-paths/SKILL.md` | DOCUMENTARY_REFERENCE_ONLY |
| 4 | Skill | detect-governance-violation | `/docs/specs/harness/skills/detect-governance-violation/SKILL.md` | DOCUMENTARY_REFERENCE_ONLY |
| 5 | Skill | write-evidence-record | `/docs/specs/harness/skills/write-evidence-record/SKILL.md` | DOCUMENTARY_REFERENCE_ONLY |
| 6 | Command Candidate | controlled-documentary-task-review | `/docs/specs/harness/yzi-os-minimal-harness-v0-command-candidate-controlled-documentary-task-review.md` | DOCUMENTARY_REFERENCE_ONLY |
| 7 | Command Candidate | prepare-next-documentary-task-prompt | `/docs/specs/harness/yzi-os-minimal-harness-v0-command-candidate-prepare-next-documentary-task-prompt.md` | DOCUMENTARY_REFERENCE_ONLY |
| 8 | Command Candidate | review-documentary-evidence-record | `/docs/specs/harness/yzi-os-minimal-harness-v0-command-candidate-review-documentary-evidence-record.md` | DOCUMENTARY_REFERENCE_ONLY |

## 4. Ordem de Uso Documental

1. ler o contexto de governança compacto;
2. ler o spec aprovado diretamente relevante à task;
3. aplicar `read-approved-specs` para confirmar readiness e fontes;
4. aplicar `inspect-authorized-paths` para confirmar paths autorizados;
5. aplicar `validate-scope-boundaries` para confirmar escopo permitido/proibido;
6. aplicar `detect-governance-violation` para checar violações;
7. usar `controlled-documentary-task-review` para revisar a task antes de aceitar;
8. usar `prepare-next-documentary-task-prompt` para orientar o próximo prompt;
9. usar `write-evidence-record` e `review-documentary-evidence-record` para registrar e revisar a evidência.

## 5. Mapa de Skills Documentais

- `read-approved-specs` — guia leitura documental de specs aprovados e readiness.
- `validate-scope-boundaries` — valida escopo documental/controlado de uma task.
- `inspect-authorized-paths` — inspeciona se os paths da task são autorizados.
- `detect-governance-violation` — detecta violações documentais de governança.
- `write-evidence-record` — estrutura o registro documental de evidência.

## 6. Mapa de Command Candidates Documentais

- `controlled-documentary-task-review` — revisar uma task documental antes de aceitar o output.
- `prepare-next-documentary-task-prompt` — orientar a preparação do próximo prompt a partir do último readiness, escopo e próxima task.
- `review-documentary-evidence-record` — orientar a revisão de um evidence record antes de aceitar o fechamento.

## 7. Regras de Referência

- todo artefato deve ser citado pelo path canônico;
- referência não concede execução;
- referência não autoriza próxima task;
- referência não substitui autorização humana explícita;
- desvio de path canônico deve ser bloqueado por governança;
- o package é leitura humana e rastreabilidade, não runtime.

## 8. Limites de Não-Execução

Documento apenas. Nenhum pacote executável, loader, registry, runner, `.claude/`, `.claude/commands`, hook, MCP, código, command real, skill nova, `SKILL.md` alterado, command candidate alterado, YAML operacional, JSON ou contrato machine-readable criado ou alterado. Os cinco `SKILL.md` e os três command candidates permanecem inalterados. `/tools/controlled-harness/`, banco, runtime, frontend e workflows n8n inalterados. Verticais não expandidas.

## 9. Riscos Residuais

- `DOCUMENTATION_BLOAT_RISK_FOR_LLM_EXECUTION_CONTEXT` — mitigado mantendo o package compacto e por referência;
- risco de leitura do package como autorização — mitigado pela Seção 7 (referência não autoriza execução);
- risco de desvio de path — mitigado exigindo path canônico e bloqueio por governança.

## 10. Próxima Task Recomendada

`Task 243 — Create YZI OS Minimal Harness v0 Documentary Reference Package Evidence Record` — registrar evidência documental compacta da criação deste package, sem criar loader, registry, runner, `.claude/`, hook, MCP, código ou execução técnica; requer nova autorização humana explícita.

## 11. Readiness Statement Final

`TASK_242_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_REFERENCE_PACKAGE_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhum pacote executável, loader, registry, runner, `.claude/`, hook, MCP, código, command real, skill nova ou `SKILL.md` alterado criado ou alterado.
