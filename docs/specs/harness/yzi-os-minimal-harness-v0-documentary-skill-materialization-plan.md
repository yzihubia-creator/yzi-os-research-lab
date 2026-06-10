# YZI OS Minimal Harness v0 — Documentary Skill Materialization Plan

## 1. Objetivo

Definir um plano documental mínimo para futura materialização dos cinco candidates como skills documentais do `YZI OS Minimal Harness v0`. Esta task não materializa skills, não cria skill real, `SKILL.md` nem `/skills/`. Define apenas ordem, limites e critérios para uma futura task de materialização documental controlada. Implementação técnica = 0%.

## 2. Fonte do Plano

- Índice: `/docs/specs/harness/yzi-os-minimal-harness-v0-skill-candidates-index.md`.
- Revisão: `/docs/specs/harness/yzi-os-minimal-harness-v0-candidate-review-record.md` (`PACKAGE_APPROVED_FOR_FUTURE_DOCUMENTARY_MATERIALIZATION`).
- Readiness de entrada: `TASK_222_YZI_OS_MINIMAL_HARNESS_V0_CANDIDATE_REVIEW_RECORD_CREATED_DOCUMENTARY_ONLY`.

## 3. Cinco Candidates Aprovados (Plano de Materialização Futura)

Paths futuros são apenas planejados (`/docs/specs/harness/skills/<candidate-name>/SKILL.md`). Nenhum diretório ou arquivo é criado nesses paths nesta task.

| Order | Candidate Skill | Future Documentary Skill File | Materialization Status |
| ----- | --------------- | ----------------------------- | ---------------------- |
| 1 | read-approved-specs | /docs/specs/harness/skills/read-approved-specs/SKILL.md | PLANNED_DOCUMENTARY_MATERIALIZATION_ONLY |
| 2 | validate-scope-boundaries | /docs/specs/harness/skills/validate-scope-boundaries/SKILL.md | PLANNED_DOCUMENTARY_MATERIALIZATION_ONLY |
| 3 | inspect-authorized-paths | /docs/specs/harness/skills/inspect-authorized-paths/SKILL.md | PLANNED_DOCUMENTARY_MATERIALIZATION_ONLY |
| 4 | detect-governance-violation | /docs/specs/harness/skills/detect-governance-violation/SKILL.md | PLANNED_DOCUMENTARY_MATERIALIZATION_ONLY |
| 5 | write-evidence-record | /docs/specs/harness/skills/write-evidence-record/SKILL.md | PLANNED_DOCUMENTARY_MATERIALIZATION_ONLY |

## 4. Ordem de Materialização Futura

1. `read-approved-specs`
2. `validate-scope-boundaries`
3. `inspect-authorized-paths`
4. `detect-governance-violation`
5. `write-evidence-record`

Justificativa curta: primeiro ler a spec; depois validar escopo; depois inspecionar paths; depois detectar violações; por fim registrar evidência.

## 5. Regra de Materialização Futura

Uma futura materialização documental só poderá ocorrer mediante nova task autorizada explicitamente. Se autorizada, ela deverá criar no máximo cinco arquivos `SKILL.md` documentais — um por candidate — sem código, sem loader, sem registry e sem execução.

## 6. Limites de Não-Execução

Este plano não materializa skills, não transforma plano em implementação, não cria execução automática e não aprova materialização automática. Os cinco candidates permanecem documentais e não-executáveis; nenhum path planejado é criado nesta task.

## 7. Critérios de Aceitação para Futura Materialização

A futura task de materialização só será aceita se: criar no máximo cinco `SKILL.md` documentais; manter os campos `name`/`description`/`origin`; preservar `origin` apontando para artefato aprovado; não criar código, loader, registry, execução ou estrutura executável; manter implementação técnica em 0% até nova autorização explícita.

## 8. Próxima Task Recomendada

`Task 224 — Create YZI OS Minimal Harness v0 Documentary Skills Materialization Authorization Gate` — apenas um gate de autorização para decidir se os cinco `SKILL.md` documentais podem ser criados em task posterior; não criar skills ainda; requer nova autorização humana explícita.

## 9. Readiness Statement Final

`TASK_223_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_SKILL_MATERIALIZATION_PLAN_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhuma skill real, `/skills/`, `/docs/specs/harness/skills/`, `SKILL.md`, `.claude/`, código, agent, command, adapter, hook, MCP, script ou runtime criado ou alterado.
