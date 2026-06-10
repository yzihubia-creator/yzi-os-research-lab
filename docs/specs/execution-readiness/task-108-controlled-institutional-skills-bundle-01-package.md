# Task 108 — Controlled Institutional Skills Bundle 01 Package

## Input State

* Task 107 completed.
* Readiness statement: `INDEX_UPDATED_TASK_106_CONTROLLED_DOCUMENTARY_BUNDLE_MODE_ACCEPTED`.
* Controlled documentary bundle mode accepted.
* Existing institutional skills:
  * `validate-scope-boundaries`
  * `read-approved-specs`
* Technical implementation remains at 0%.
* No technical execution has been initiated.
* No next task is automatically authorized.

## Preserved Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Bundle 01 Objective

Prepare three future documentary skills to expand the institutional capability for reading, control, evidence, and governance. This package is preparation-only. It defines the Controlled Institutional Skills Bundle 01 as a future, human-authorizable grouped documentary creation. It does not create any skill and does not create any file inside `/docs/specs/skills/`.

## Bundle 01 Candidate Skills

### Skill 003 — `inspect-authorized-paths`

* **Name:** `inspect-authorized-paths`
* **Future exact path:** `/docs/specs/skills/skill-003-inspect-authorized-paths.md`
* **Objective:** Guide the verification of authorized paths, permitted artifacts, and forbidden files before any execution.
* **Relation to existing skills:** Extends `read-approved-specs` (which establishes what the spec authorizes) and `validate-scope-boundaries` (which confirms scope) by focusing specifically on the concrete path and artifact surface of an authorized task.
* **Negative scope:** Does not create code, API, schema, frontend, migration, YAML, JSON, machine-readable contract, adapter, `.claude/`, Codex adapter, runner, command, or subagent. Is a documentary institutional skill spec only.
* **Reason for inclusion in the bundle:** Path and artifact inspection is the precondition for any safe controlled execution and is required before evidence recording or governance detection can be meaningful.
* **Status:** candidate, not created, not automatically authorized.

### Skill 004 — `write-evidence-record`

* **Name:** `write-evidence-record`
* **Future exact path:** `/docs/specs/skills/skill-004-write-evidence-record.md`
* **Objective:** Guide the creation of documentary evidence records after an authorized execution.
* **Relation to existing skills:** Operates after `read-approved-specs`, `validate-scope-boundaries`, and `inspect-authorized-paths`, recording the documentary evidence of what an authorized task actually did.
* **Negative scope:** Does not create code, API, schema, frontend, migration, YAML, JSON, machine-readable contract, adapter, `.claude/`, Codex adapter, runner, command, or subagent. Is a documentary institutional skill spec only.
* **Reason for inclusion in the bundle:** Evidence recording closes the controlled execution loop and preserves the auditable documentary trail the governance model depends on.
* **Status:** candidate, not created, not automatically authorized.

### Skill 005 — `detect-governance-violation`

* **Name:** `detect-governance-violation`
* **Future exact path:** `/docs/specs/skills/skill-005-detect-governance-violation.md`
* **Objective:** Guide the identification of governance violations, such as implicit execution, expanded scope, missing path, forbidden alteration, or an attempt to create an unauthorized technical artifact.
* **Relation to existing skills:** Acts as the guardrail counterpart to `validate-scope-boundaries` and `inspect-authorized-paths`, detecting when the established boundaries are crossed.
* **Negative scope:** Does not create code, API, schema, frontend, migration, YAML, JSON, machine-readable contract, adapter, `.claude/`, Codex adapter, runner, command, or subagent. Is a documentary institutional skill spec only.
* **Reason for inclusion in the bundle:** Governance violation detection completes the read → validate → inspect → detect → record capability set and protects the negative scope across all future controlled tasks.
* **Status:** candidate, not created, not automatically authorized.

## Future Conceptual Order

The suggested conceptual order of the institutional skills, once all are documentarily created, is:

1. `read-approved-specs`
2. `validate-scope-boundaries`
3. `inspect-authorized-paths`
4. `detect-governance-violation`
5. `write-evidence-record`

This is a conceptual ordering only. It is not a runner, not an automation, and not an executable procedure.

## Future Authorizable Scope

A separate future task may, if explicitly authorized by the human operator, create exactly these three files:

* `/docs/specs/skills/skill-003-inspect-authorized-paths.md`
* `/docs/specs/skills/skill-004-write-evidence-record.md`
* `/docs/specs/skills/skill-005-detect-governance-violation.md`

No other file may be created by that future task.

## Negative Scope Of The Future Creation

The future creation of Bundle 01 may not create:

* code;
* API;
* schema;
* frontend;
* migration;
* YAML;
* JSON;
* machine-readable contract;
* adapter;
* `.claude/`;
* Codex adapter;
* runner;
* command;
* subagent;
* backlog;
* sprint plan;
* roadmap;
* any file beyond the three explicitly authorized paths.

## Exact Text For Future Authorization

The human operator must use the following exact text in the future if they wish to authorize the documentary creation of Bundle 01:

> “Eu, operador humano, autorizo explicitamente a criação documental do Controlled Institutional Skills Bundle 01 do YZI OS, limitada exclusivamente aos arquivos `/docs/specs/skills/skill-003-inspect-authorized-paths.md`, `/docs/specs/skills/skill-004-write-evidence-record.md` e `/docs/specs/skills/skill-005-detect-governance-violation.md`. Confirmo que esta autorização não permite criar código, API, schema, frontend, migration, YAML, JSON, contrato machine-readable, adapter, `.claude/`, Codex adapter, runner, comando, subagente, backlog, sprint plan ou roadmap. Confirmo que esta autorização é específica para uma única task documental e não autoriza nenhuma execução adicional.”

## Phrases Insufficient For Authorization

The following phrases do not authorize the creation of the bundle:

* “vamos”
* “segue”
* “pode continuar”
* “aprovado”
* “manda”
* “executa”
* “faz aí”
* “ok”
* “próximo”
* “bora”

Only the exact authorization text above constitutes explicit human authorization for the future documentary creation of Bundle 01.

## Final State

* Bundle 01 prepared.
* No Bundle 01 skill was created.
* No file was created inside `/docs/specs/skills/`.
* Technical implementation remains at 0%.
* No technical execution has been initiated.
* No next task is automatically authorized.

## Preserved Task State

* Exactly one file was created by this task: this document.
* No other file was created by this task.
* No existing file was altered by this task.
* The index was not edited by this task.
* No file was created or altered inside `/docs/specs/skills/` by this task.
* No existing skill was altered by this task.
* No additional skill was created by this task.
* No adapter was created by this task.
* `.claude/` was not created by this task.
* No command, subagent, or runner was created by this task.

## Status

`TASK_108_CONTROLLED_INSTITUTIONAL_SKILLS_BUNDLE_01_PACKAGE_PREPARED`
