# YZI OS Minimal Harness v0 — Documentary Skills Reference Checklist

## 1. Objetivo

Checklist documental curto para que futuras tasks documentais citem corretamente as cinco skills do `YZI OS Minimal Harness v0`, sempre pelo path canônico do respectivo `SKILL.md`. Apenas estrutura a forma de referência; não altera os `SKILL.md`, não cria novas skills, não cria loader/registry/runner/hook/MCP nem execução técnica. Implementação técnica = 0%.

## 2. Fonte do Checklist

- Boundary: `/docs/specs/harness/yzi-os-minimal-harness-v0-documentary-skills-usage-boundary.md`.
- Evidência: `/docs/specs/harness/yzi-os-minimal-harness-v0-documentary-skills-materialization-evidence-record.md`.
- Readiness de entrada: `TASK_227_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_SKILLS_USAGE_BOUNDARY_CREATED_DOCUMENTARY_ONLY`.

## 3. Tabela das Cinco Skills e Path Canônico

| Order | Skill | Canonical SKILL.md Path | Reference Status |
| ----- | ----- | ----------------------- | ---------------- |
| 1 | read-approved-specs | /docs/specs/harness/skills/read-approved-specs/SKILL.md | DOCUMENTARY_REFERENCE_ONLY |
| 2 | validate-scope-boundaries | /docs/specs/harness/skills/validate-scope-boundaries/SKILL.md | DOCUMENTARY_REFERENCE_ONLY |
| 3 | inspect-authorized-paths | /docs/specs/harness/skills/inspect-authorized-paths/SKILL.md | DOCUMENTARY_REFERENCE_ONLY |
| 4 | detect-governance-violation | /docs/specs/harness/skills/detect-governance-violation/SKILL.md | DOCUMENTARY_REFERENCE_ONLY |
| 5 | write-evidence-record | /docs/specs/harness/skills/write-evidence-record/SKILL.md | DOCUMENTARY_REFERENCE_ONLY |

## 4. Checklist de Referência Correta (por skill)

Antes de citar qualquer skill, confirmar: (1) **path canônico** exato da Seção 3, não o nome solto; (2) **nome correto** coincidindo com o `name` da skill; (3) **uso documental** declarado (orientar leitura/validação/inspeção/detecção/registro), nunca técnico; (4) **status preservado** (`DOCUMENTARY_REFERENCE_ONLY` / `NON_EXECUTABLE` / `DOES_NOT_AUTHORIZE_TECHNICAL_EXECUTION`); (5) **sem concessão de execução**; (6) **sem substituição de governança**.

Ordem de citação quando houver múltiplas skills: `read-approved-specs` → `validate-scope-boundaries` → `inspect-authorized-paths` → `detect-governance-violation` → `write-evidence-record`.

## 5. Regra: Referência Não Concede Execução

Referenciar uma skill pelo seu `SKILL.md` concede apenas orientação documental para estruturar a task. Não concede autorização de execução técnica, loader, registry, runner, hook, MCP nem código.

## 6. Regra: Referência Não Substitui Governança

A referência não substitui: autorização humana explícita; escopo permitido/proibido da task; validação de path; evidence record; revisão humana.

## 7. Decisão de Não-Execução

Checklist apenas documental. Não transforma skills em implementação, não cria execução automática, `/skills/` operacional nem novo `SKILL.md`. `/tools/controlled-harness/`, banco, runtime, frontend e workflows n8n inalterados. Qualquer etapa técnica futura exige task própria e nova autorização humana explícita.

## 8. Próxima Task Recomendada

`Task 229 — Close YZI OS Minimal Harness v0 Documentary Skills Phase` — consolidar e fechar a fase documental das cinco skills (materialização + usage boundary + reference checklist) e preparar o próximo gate de autorização humana, sem loader/registry/runner/execução técnica; requer nova autorização humana explícita.

## 9. Readiness Statement Final

`TASK_228_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_SKILLS_REFERENCE_CHECKLIST_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhum `SKILL.md` alterado; nenhuma skill nova, código, loader, registry, runner, hook, MCP, `.claude/`, script ou runtime criado ou alterado.
