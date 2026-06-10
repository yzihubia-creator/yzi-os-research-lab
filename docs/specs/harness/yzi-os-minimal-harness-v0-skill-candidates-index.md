# YZI OS Minimal Harness v0 — Skill Candidates Index

## 1. Objetivo

Consolidar, em um índice documental mínimo, os cinco candidatos de skill do `YZI OS Minimal Harness v0` (Tasks 216–220), permitindo revisão humana rápida antes de qualquer futura decisão de materialização. Documento apenas. Implementação técnica = 0%.

## 2. Fonte da Consolidação

- Convenção: `/docs/specs/harness/yzi-os-minimal-harness-v0-skill-frontmatter-convention.md` (campos `name`, `description`, `origin`).
- Candidatos: Tasks 216, 217, 218, 219, 220.
- Readiness de entrada: `TASK_220_YZI_OS_MINIMAL_HARNESS_V0_SKILL_CANDIDATE_DETECT_GOVERNANCE_VIOLATION_CREATED_DOCUMENTARY_ONLY`.

## 3. Tabela dos Cinco Candidates

| Order | Candidate Skill | Source Candidate File | Origin Artifact | Status |
| ----- | --------------- | --------------------- | --------------- | ------ |
| 1 | read-approved-specs | /docs/specs/harness/yzi-os-minimal-harness-v0-skill-candidate-read-approved-specs.md | /docs/specs/harness/yzi-os-minimal-harness-v0-skill-frontmatter-convention.md | DOCUMENTARY_CANDIDATE_ONLY |
| 2 | validate-scope-boundaries | /docs/specs/harness/yzi-os-minimal-harness-v0-skill-candidate-validate-scope-boundaries.md | /docs/specs/skills/skill-001-validate-scope-boundaries.md | DOCUMENTARY_CANDIDATE_ONLY |
| 3 | inspect-authorized-paths | /docs/specs/harness/yzi-os-minimal-harness-v0-skill-candidate-inspect-authorized-paths.md | /docs/specs/skills/skill-003-inspect-authorized-paths.md | DOCUMENTARY_CANDIDATE_ONLY |
| 4 | detect-governance-violation | /docs/specs/harness/yzi-os-minimal-harness-v0-skill-candidate-detect-governance-violation.md | /docs/specs/skills/skill-005-detect-governance-violation.md | DOCUMENTARY_CANDIDATE_ONLY |
| 5 | write-evidence-record | /docs/specs/harness/yzi-os-minimal-harness-v0-skill-candidate-write-evidence-record.md | /docs/specs/skills/skill-004-write-evidence-record.md | DOCUMENTARY_CANDIDATE_ONLY |

## 4. Ordem Operacional Recomendada

Usar exatamente esta ordem:

1. `read-approved-specs`
2. `validate-scope-boundaries`
3. `inspect-authorized-paths`
4. `detect-governance-violation`
5. `write-evidence-record`

Justificativa curta:

- primeiro ler a spec;
- depois validar escopo;
- depois inspecionar paths;
- depois detectar violações;
- por fim registrar evidência.

## 5. Limites Gerais dos Candidates

Os cinco candidates:

- são documentais;
- não executam nada;
- não autorizam execução;
- não substituem revisão humana;
- não criam artefatos técnicos;
- não alteram specs;
- não alteram paths;
- não criam código;
- não são skills reais ainda.

## 6. Decisão de Não-Execução

Este índice é apenas consolidação documental. Não transforma candidates em implementação, não cria execução automática, não cria skill real, `/skills/` nem `SKILL.md`. Toda materialização futura exige task própria e nova autorização humana explícita.

## 7. Próxima Task Recomendada

`Task 222 — Create YZI OS Minimal Harness v0 Candidate Review Record` — revisar os cinco candidates e decidir se estão prontos para futura materialização documental, sem criar skill executável; requer nova autorização humana explícita.

## 8. Readiness Statement Final

`TASK_221_YZI_OS_MINIMAL_HARNESS_V0_SKILL_CANDIDATES_INDEX_CONSOLIDATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhuma skill real, `/skills/`, `SKILL.md`, `.claude/`, código, agent, command, adapter, hook, MCP, script ou runtime criado ou alterado.
