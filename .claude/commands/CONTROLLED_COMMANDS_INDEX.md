# Controlled Commands Index

This is a documentary index of the controlled Claude command definition files already created under explicit human authorization in the YZI OS Research Lab. It is an index only. It contains no frontmatter, no YAML, no JSON, no machine-readable table, and no pseudo-schema. It performs no execution and authorizes no execution.

## Purpose

This index consolidates, at a documentary level only, the five controlled Claude command definition files created by Tasks 135–139. Its purpose is to provide a single human-readable map of each controlled command: its name, its exact path, its related institutional skill, its related controlled subagent, its allowed role, its forbidden actions, and its non-execution status. This index does not create new commands, does not modify existing command files, does not create subagents, adapters, runners, or a registry, and does not authorize any future task.

## Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Controlled Commands Overview

Five controlled Claude command definition files exist. Each was created as a controlled command artifact only, with no frontmatter and no YAML. Each command is a definition only: it performs no execution, creates no files, modifies no files, and does not authorize future tasks. Each command is related to exactly one institutional skill and points to exactly one corresponding controlled subagent without executing it automatically. Together, the five commands correspond one-to-one to the five institutional skills and to the five controlled subagents. No subagent, adapter, runner, or registry was created alongside these commands.

## Approved Institutional Skill Order

1. `read-approved-specs`
2. `validate-scope-boundaries`
3. `inspect-authorized-paths`
4. `detect-governance-violation`
5. `write-evidence-record`

## Controlled Commands Index

1. `read-approved-specs`
   * Path: `.claude/commands/read-approved-specs.md`
   * Skill: `read-approved-specs`
   * Related subagent: `.claude/agents/spec-reader-subagent.md`
   * Status: `CONTROLLED_COMMAND_ARTIFACT_ONLY`
   * Execution status: `NOT_EXECUTED`
   * Allowed role summary: guides the assistive documentary reading of approved specs.
   * Forbidden actions summary: does not execute the subagent, does not implement, does not modify or create files, does not alter specs, does not authorize tasks, does not create artifacts.
   * Does not create files.
   * Does not modify files.
   * Does not execute the related subagent automatically.
   * Does not authorize future tasks.

2. `validate-scope-boundaries`
   * Path: `.claude/commands/validate-scope-boundaries.md`
   * Skill: `validate-scope-boundaries`
   * Related subagent: `.claude/agents/scope-validator-subagent.md`
   * Status: `CONTROLLED_COMMAND_ARTIFACT_ONLY`
   * Execution status: `NOT_EXECUTED`
   * Allowed role summary: guides the assistive documentary validation of scope boundaries.
   * Forbidden actions summary: does not execute the subagent, does not implement, does not modify or create files, does not widen scope, does not authorize tasks, does not create artifacts.
   * Does not create files.
   * Does not modify files.
   * Does not execute the related subagent automatically.
   * Does not authorize future tasks.

3. `inspect-authorized-paths`
   * Path: `.claude/commands/inspect-authorized-paths.md`
   * Skill: `inspect-authorized-paths`
   * Related subagent: `.claude/agents/path-inspector-subagent.md`
   * Status: `CONTROLLED_COMMAND_ARTIFACT_ONLY`
   * Execution status: `NOT_EXECUTED`
   * Allowed role summary: guides the assistive documentary inspection of authorized paths.
   * Forbidden actions summary: does not execute the subagent, does not implement, does not modify or create files, does not widen the scope of paths, does not authorize tasks, does not create artifacts.
   * Does not create files.
   * Does not modify files.
   * Does not execute the related subagent automatically.
   * Does not authorize future tasks.

4. `detect-governance-violation`
   * Path: `.claude/commands/detect-governance-violation.md`
   * Skill: `detect-governance-violation`
   * Related subagent: `.claude/agents/governance-violation-detector-subagent.md`
   * Status: `CONTROLLED_COMMAND_ARTIFACT_ONLY`
   * Execution status: `NOT_EXECUTED`
   * Allowed role summary: guides the assistive documentary detection of governance violations.
   * Forbidden actions summary: does not execute the subagent, does not implement, does not modify or create files, does not remediate violations, does not authorize tasks, does not create artifacts.
   * Does not create files.
   * Does not modify files.
   * Does not execute the related subagent automatically.
   * Does not authorize future tasks.

5. `write-evidence-record`
   * Path: `.claude/commands/write-evidence-record.md`
   * Skill: `write-evidence-record`
   * Related subagent: `.claude/agents/evidence-recorder-subagent.md`
   * Status: `CONTROLLED_COMMAND_ARTIFACT_ONLY`
   * Execution status: `NOT_EXECUTED`
   * Allowed role summary: guides the assistive documentary recording of evidence.
   * Forbidden actions summary: does not execute the subagent, does not implement, does not modify or create files, does not persist records by itself, does not authorize tasks, does not create artifacts.
   * Does not create files.
   * Does not modify files.
   * Does not execute the related subagent automatically.
   * Does not authorize future tasks.

## Command-To-Subagent Mapping

Each command points to exactly one controlled subagent corresponding to the same institutional skill:

* `read-approved-specs` → `.claude/agents/spec-reader-subagent.md` (skill `read-approved-specs`)
* `validate-scope-boundaries` → `.claude/agents/scope-validator-subagent.md` (skill `validate-scope-boundaries`)
* `inspect-authorized-paths` → `.claude/agents/path-inspector-subagent.md` (skill `inspect-authorized-paths`)
* `detect-governance-violation` → `.claude/agents/governance-violation-detector-subagent.md` (skill `detect-governance-violation`)
* `write-evidence-record` → `.claude/agents/evidence-recorder-subagent.md` (skill `write-evidence-record`)

This binding is documentary and assistive. No command executes its related subagent automatically. No command creates adapters, runners, registry, or machine-readable contracts.

## Cross-Command Boundary Rules

No command indexed here may:

* call another command automatically;
* execute a subagent automatically;
* execute implementation;
* modify files;
* create files;
* create commands;
* create subagents;
* create adapters;
* create runners;
* create a registry;
* create YAML;
* create JSON;
* create machine-readable contracts;
* authorize next tasks;
* interpret insufficient phrases as authorization;
* substitute human review;
* alter approved specs;
* widen scope.

## Forbidden Actions

The consolidation recorded by this index must not create:

* new commands;
* new subagents;
* any other file in `.claude/commands/` beyond this authorized index;
* any new file in `.claude/agents/`;
* adapters;
* runners;
* a registry;
* YAML;
* JSON;
* machine-readable contracts;
* code;
* APIs;
* schemas;
* frontend;
* migrations;
* backlog;
* sprint plan;
* roadmap;
* a broad implementation plan;
* a broad technical execution plan;
* an executable harness;
* an executable pipeline;
* an executable workflow;
* an executable detector;
* an executable logger;
* an executable validator.

## Non-Execution Declaration

This index is a documentary artifact only. It performs no execution. Its presence does not execute anything, does not authorize execution, does not run any command or subagent, does not modify any command file, and does not materialize any subagent, adapter, runner, or registry. The indexed command definition files are themselves definitions only and were not executed. Any operational use of any indexed command would require its own task and explicit human authorization.

## Future Task Gate

This index does not authorize Task 141 automatically. The next candidate task is only:

`Task 141 — Close Controlled Claude Commands Phase And Prepare Adapter Gate`

Status:

`NOT_AUTHORIZED_AUTOMATICALLY`

That next task may only begin with explicit human authorization in a future instruction. The required future phrase is:

`EU AUTORIZO A TASK 141 PARA ENCERRAR DOCUMENTALMENTE A CONTROLLED CLAUDE COMMANDS PHASE E PREPARAR O GATE HUMANO DE ADAPTERS, SEM CRIAR ADAPTERS E SEM EXECUÇÃO.`

The following phrases remain insufficient as technical authorization: "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", "continue".

## Readiness Statement

`TASK_140_CONTROLLED_CLAUDE_COMMANDS_INDEX_CONSOLIDATED_DOCUMENTARY_ONLY`
