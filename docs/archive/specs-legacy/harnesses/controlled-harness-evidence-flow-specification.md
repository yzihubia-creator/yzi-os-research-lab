## Evidence Flow Specification Title

`controlled-harness-evidence-flow`

## Documentary Status

`DOCUMENTARY_HARNESS_EVIDENCE_FLOW_SPECIFICATION_ONLY`

## Purpose

This specification details, documentarily only, how a future harness must preserve documentary evidence before, during, and after a controlled task, without executing anything and without creating technical persistence.

## Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Evidence Flow Scope

This specification defines only the documentary evidence flow for future harnesses.

It does not create an executable flow.

It does not create a logger.

It does not create an evidence database.

It does not create persistence.

It does not create schema.

It does not create migration.

It does not create technical log.

It does not execute anything.

## Evidence Flow Nature

The evidence flow is documentary only.

Evidence is recorded in human documents, not in a technical system in this task.

This specification does not create an automatic evidence mechanism.

This specification does not create automatic validation.

This specification does not replace human review.

This specification does not authorize the next task.

## Pre-Task Evidence

Any future controlled task must preserve pre-task documentary evidence about:

* current readiness statement;
* explicit human authorization;
* authorized task;
* authorized objective;
* authorized artifacts;
* authorized paths;
* permitted source documents;
* negative scope;
* forbidden artifacts;
* prior future task gate.

## Authorization Evidence

Human authorization must be recorded exactly.

The authorization phrase must be preserved literally.

Absence of the exact phrase is a stop condition.

Insufficient phrases are not evidence of authorization.

Insufficient phrases:

* vamos
* segue
* manda
* próximo
* ok
* aprovado
* pode continuar
* faça
* sim
* bora
* continue

## Readiness Statement Evidence

The readiness statement must be recorded before and after the task.

Absent readiness is a stop condition.

Incompatible readiness is a stop condition.

Readiness statement does not authorize the next task by itself.

Readiness must be consistent between:

* created document;
* evidence document;
* execution-readiness index.

## Source Document Evidence

Consulted source documents must be listed documentarily.

Source document must not be altered unless explicitly authorized.

Any source document altered without authorization is a governance violation.

Source documents must preserve the authority of the spec.

## Path Authorization Evidence

Authorized paths must be recorded exactly.

Inferred path is not allowed.

Expanded path is a violation.

Any path created or modified must have explicit authorization.

Index update may occur only when authorized.

## Artifact Authorization Evidence

Authorized artifacts must be recorded exactly.

Additional artifact is a violation.

Unauthorized technical artifact is a critical violation.

Documentary artifact cannot be converted into executable artifact.

## Negative Scope Evidence

Negative scope must be preserved as evidence.

Forbidden artifacts must be recorded.

Forbidden actions must be made explicit.

Absence of negative scope is a governance risk.

## Stop Condition Evidence

Stop conditions must be recorded documentarily.

Every attempted violation must recommend stopping.

Stopping due to violation must be evidenced.

Documentary harness does not correct violation by itself.

## Created Files Evidence

Created files must be listed exactly.

No file created outside authorization may be accepted.

Extra creation is a governance violation.

Created directory must be authorized.

## Modified Files Evidence

Modified files must be listed exactly.

Only the authorized index may be modified when explicitly permitted.

Any modification outside scope is a governance violation.

Approved specs must not be altered.

## Non-Creation Evidence

Absence of technical creation must be recorded.

Evidence must confirm, when applicable:

* no executable harness created;
* no runner created;
* no registry created;
* no pipeline created;
* no workflow created;
* no YAML created;
* no JSON created;
* no machine-readable contract created;
* no code created;
* no API created;
* no schema created;
* no migration created;
* no frontend created;
* no database created;
* no persistence created;
* no new adapter created;
* no new command created;
* no new subagent created.

## Non-Execution Evidence

Absence of execution must be recorded.

Evidence must confirm, when applicable:

* no command executed;
* no subagent executed;
* no adapter executed;
* no executor called;
* Claude not executed;
* Claude Code not executed;
* Codex not executed;
* no external tool executed;
* no test run;
* no automation executed.

## Governance Violation Evidence

Governance violations must be recorded documentarily.

Violations must include:

* violation type;
* documentary severity;
* artifact or path involved;
* boundary violated;
* required response;
* stop condition, when applicable.

This must not be turned into a schema. It uses no YAML. It uses no JSON.

## Future Task Gate Evidence

Every task must record:

* next candidate task;
* status `NOT_AUTHORIZED_AUTOMATICALLY`;
* exact required future phrase;
* confirmation that no next task was automatically authorized.

The future task gate is not authorization.

## Evidence Record Boundary

The evidence record is a human document.

The harness does not create evidence record automatically.

The harness does not validate its own evidence.

Human review remains required.

## Evidence Persistence Boundary

This specification does not create evidence persistence.

It does not create database.

It does not create table.

It does not create schema.

It does not create migration.

It does not create technical log.

It persists nothing automatically.

## Machine-Readable Artifact Boundary

* YAML is forbidden.
* JSON is forbidden.
* Frontmatter is forbidden in this file.
* Pseudo-schema is forbidden.
* Machine-readable table is forbidden.
* Machine-readable contract is forbidden.
* Any format parseable as technical contract is forbidden.

## Strict Boundaries

This specification:

* does not execute;
* does not coordinate execution;
* does not create logger;
* does not create validator;
* does not create detector;
* does not create evidence database;
* does not create persistence;
* does not create runner;
* does not create registry;
* does not create pipeline;
* does not create workflow;
* does not create YAML;
* does not create JSON;
* does not create frontmatter;
* does not create pseudo-schema;
* does not create machine-readable contract;
* does not create code;
* does not create API;
* does not create schema;
* does not create migration;
* does not create frontend;
* does not create backlog;
* does not create sprint plan;
* does not create roadmap;
* does not authorize the next task.

## Forbidden Actions

The following are forbidden:

* creating executable harness;
* creating technical harness;
* creating runner;
* creating registry;
* creating executable pipeline;
* creating executable workflow;
* creating executable detector;
* creating executable logger;
* creating executable validator;
* creating evidence database;
* creating evidence table;
* creating schema;
* creating migration;
* creating persistence;
* creating technical log;
* creating YAML;
* creating JSON;
* creating frontmatter;
* creating pseudo-schema;
* creating machine-readable contract;
* creating code;
* creating API;
* creating frontend;
* creating new adapter;
* creating new command;
* creating new subagent;
* executing command;
* executing subagent;
* executing adapter;
* executing Claude;
* executing Claude Code;
* executing Codex;
* executing external tool;
* running test;
* altering approved specs;
* altering P0P4 packages;
* altering P0P4 records;
* starting the next task automatically.

## Non-Executable Declaration

`controlled-harness-evidence-flow` is only a documentary evidence flow specification.

* No executable harness was created.
* No technical harness was created.
* No runner was created.
* No registry was created.
* No executable pipeline was created.
* No executable workflow was created.
* No executable detector, logger, or validator was created.
* No evidence database was created.
* No evidence table was created.
* No schema was created.
* No migration was created.
* No persistence was created.
* No technical log was created.
* No YAML was created.
* No JSON was created.
* No frontmatter was created.
* No pseudo-schema was created.
* No machine-readable contract was created.
* No code was created.
* No execution was performed.

## Future Implementation Boundary

This specification does not authorize future implementation.

Any future technical evidence flow implementation will require:

* its own task;
* explicit human authorization;
* exact path;
* exact artifact;
* negative scope;
* documentary evidence;
* stop conditions;
* confirmation of no automatic execution;
* confirmation that specs remain authority;
* confirmation that skills remain capabilities;
* confirmation that adapters remain translation;
* confirmation that executors remain replaceable;
* confirmation that technical evidence does not replace human review.

## Future Task Gate

Task 151 does not authorize Task 152 automatically.

The next candidate task is only:

`Task 152  Create Controlled Harness Governance Stop Conditions Specification`

Status:

`NOT_AUTHORIZED_AUTOMATICALLY`

The required future phrase is:

`EU AUTORIZO A TASK 152 PARA CRIAR A ESPECIFICAÇÃO DOCUMENTAL CONTROLADA DAS STOP CONDITIONS DE GOVERNANÇA DO HARNESS, SEM HARNESS EXECUTÁVEL E SEM EXECUÇÃO.`

## Readiness Statement

`TASK_151_CONTROLLED_HARNESS_EVIDENCE_FLOW_SPECIFICATION_CREATED_DOCUMENTARY_ONLY`
