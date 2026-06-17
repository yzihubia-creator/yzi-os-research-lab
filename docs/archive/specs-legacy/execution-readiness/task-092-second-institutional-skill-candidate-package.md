# Task 092  Second Institutional Skill Candidate Package

## Input State

* Task 091 completed documentarily.
* Readiness statement: `INDEX_UPDATED_TASK_090_INSTITUTIONAL_SKILL_001_VALIDATE_SCOPE_BOUNDARIES_CREATED_DOCUMENTARY_ONLY`.
* Skill 001 created documentarily: `/docs/specs/skills/skill-001-validate-scope-boundaries.md`.
* No additional skill has been created.
* No adapter has been created.
* `.claude/` was not created by this task.
* No command, subagent, or runner has been created.
* Technical implementation remains at 0%.
* No technical execution has been initiated.
* No next task is automatically authorized.

## Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Objective

Prepare a second institutional skill candidate for future human authorization.

This package is documentary only. It identifies, compares, and isolates a possible future second institutional skill, without creating that skill and without authorizing any execution.

## Selection Criteria For The Second Skill Candidate

The second skill candidate must be:

* minimal;
* documentary;
* executor-agnostic;
* derived from already approved governance;
* complementary to the skill `validate-scope-boundaries`;
* useful before any future execution;
* independent from Claude, Codex, or any specific LLM;
* not dependent on code;
* not dependent on YAML;
* not dependent on JSON;
* not dependent on an adapter;
* not dependent on a runner;
* not altering P0P4;
* verifiable by human reading.

## Candidates Evaluated

### Candidate A  read-approved-specs

* Name: `read-approved-specs`.
* Objective: define a documentary capability for locating and reading the governed specs that are authority for a task before any execution or scope validation.
* Why it would be useful: it comes before scope validation because an executor or reviewer must know which approved specs control the task before checking boundaries.
* Risks: it could be misread as permission to search beyond authorized sources or to treat non-approved context as authority.
* Negative scope: it must not create code, adapters, commands, subagents, runners, YAML, JSON, machine-readable contracts, backlog, sprint plan, roadmap, or technical implementation.
* Reason to be the second skill: it complements `validate-scope-boundaries` by forcing authority discovery first and reducing the risk of task execution with incomplete context.

### Candidate B  inspect-authorized-paths

* Name: `inspect-authorized-paths`.
* Objective: define a documentary capability for confirming exact authorized paths before file creation or file alteration.
* Why it would be useful: it would reduce path drift and help prevent accidental edits outside the authorized scope.
* Risks: it is narrower than `read-approved-specs` and depends on prior knowledge of which spec or task text authorizes the paths.
* Negative scope: it must not create files, alter files, authorize execution, create adapters, create commands, create subagents, create runners, or initiate implementation.
* Reason not to be the second skill: it is valuable, but it should follow an authority-reading skill because path inspection depends on knowing the controlling document.

### Candidate C  write-evidence-record

* Name: `write-evidence-record`.
* Objective: define a documentary capability for recording evidence after a governed task or inspection.
* Why it would be useful: it would support auditability and preserve the reason a task was accepted, blocked, or limited.
* Risks: it operates after review or execution and could be mistaken as a substitute for authorization if introduced too early.
* Negative scope: it must not create implementation artifacts, authorize future work, create adapters, create commands, create subagents, create runners, or redefine acceptance criteria.
* Reason not to be the second skill: it is useful after boundary validation, but the second institutional capability should strengthen pre-execution authority reading first.

## Recommended Candidate

Recommended candidate: `read-approved-specs`.

Reason for recommendation:

* it comes before scope validation;
* it forces the executor to locate authority before acting;
* it reduces the risk of a task being executed with incomplete context;
* it is useful for Claude, Codex, Llama, Gemini, or any executor;
* it preserves the rule that spec is authority;
* it can initially be defined as a human document, without implementation.

## Future Authorizable Scope

A future separate task may, if explicitly authorized by the human operator, create only:

`/docs/specs/skills/skill-002-read-approved-specs.md`

That future file must be documentary and non-operational.

The second skill has not been created by this task.

## Negative Scope Of The Future Skill

The future creation of the skill must not create:

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
* roadmap.

## Minimum Criteria For The Future Documentary Skill

The future skill candidate must contain:

* purpose;
* when to use;
* expected inputs;
* authority sources;
* reading order;
* human checks;
* insufficient-context signals;
* stopping conditions;
* expected evidence;
* relationship with specs;
* relationship with `validate-scope-boundaries`;
* relationship with future adapters;
* documentary status.

## Future Authorization Text

The human operator must use the following text in the future if they intend to authorize the documentary creation of the second institutional skill:

Eu, operador humano, autorizo explicitamente a criação documental da segunda skill institucional do YZI OS, limitada exclusivamente ao arquivo `/docs/specs/skills/skill-002-read-approved-specs.md`. Confirmo que esta autorização não permite criar código, API, schema, frontend, migration, YAML, JSON, contrato machine-readable, adapter, `.claude/`, Codex adapter, runner, comando, subagente, backlog, sprint plan ou roadmap. Confirmo que esta autorização é específica para uma única task documental e não autoriza nenhuma execução adicional.

## Insufficient Authorization Phrases

The following phrases do not authorize creation of the skill:

* vamos
* segue
* pode continuar
* aprovado
* manda
* executa
* faz aí
* ok
* próximo
* bora

These phrases may indicate conversation or preparation, but they do not provide formal authorization to create `/docs/specs/skills/skill-002-read-approved-specs.md`.

## Preserved State

* No real additional skill was created.
* No file was created inside `/docs/specs/skills/`.
* No adapter was created.
* `.claude/` was not created by this task.
* No command, subagent, or runner was created.
* Technical implementation remains at 0%.
* No technical execution was initiated.
* No next task is automatically authorized.
* The index was not edited by this task.

## Status

`TASK_092_SECOND_INSTITUTIONAL_SKILL_CANDIDATE_PACKAGE_PREPARED`
