# Controlled Subagents Index

This is a documentary index of the controlled Claude subagent definition files already created under explicit human authorization in the YZI OS Research Lab. It is an index only. It contains no frontmatter, no YAML, no JSON, no machine-readable table, and no pseudo-schema. It performs no execution and authorizes no execution.

## Purpose

This index consolidates, at a documentary level only, the five controlled Claude subagent definition files created by Tasks 128–132. Its purpose is to provide a single human-readable map of each controlled subagent: its name, its exact path, its related institutional skill, its allowed role, its negative boundaries, its non-execution status, and the confirmation that it is a controlled artifact only. This index does not create new subagents, does not modify existing subagent files, does not create commands, adapters, runners, or a registry, and does not authorize any future task.

## Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Controlled Subagents Overview

Five controlled Claude subagent definition files exist. Each was created as a controlled artifact only, with a minimal `name`/`description` frontmatter exception authorized solely for that file. Each subagent is a definition only: it performs no execution, creates no files, modifies no files, and does not authorize future tasks. Each subagent is related to exactly one institutional skill. Together, the five subagents correspond one-to-one to the five institutional skills. No command, no adapter, no runner, and no registry was created alongside these subagents.

## Approved Institutional Skill Order

1. `read-approved-specs`
2. `validate-scope-boundaries`
3. `inspect-authorized-paths`
4. `detect-governance-violation`
5. `write-evidence-record`

## Controlled Subagents Index

1. `spec-reader-subagent`
   * Path: `.claude/agents/spec-reader-subagent.md`
   * Skill: `read-approved-specs`
   * Status: `CONTROLLED_ARTIFACT_ONLY`
   * Execution status: `NOT_EXECUTED`
   * Allowed role summary: structures, at a documentary level only, the reading of approved specs, producing a documentary synthesis of what an approved spec authorizes.
   * Forbidden actions summary: does not implement, does not execute, does not modify approved specs, does not widen scope, does not authorize tasks, does not create artifacts.
   * Does not create files.
   * Does not modify files.
   * Does not authorize future tasks.

2. `scope-validator-subagent`
   * Path: `.claude/agents/scope-validator-subagent.md`
   * Skill: `validate-scope-boundaries`
   * Status: `CONTROLLED_ARTIFACT_ONLY`
   * Execution status: `NOT_EXECUTED`
   * Allowed role summary: structures, at a documentary level only, the validation of scope boundaries, comparing reported scope against authorized scope and recommending stopping on a boundary breach.
   * Forbidden actions summary: does not implement, does not execute, does not approve scope on its own, does not widen scope, does not authorize tasks, does not create artifacts.
   * Does not create files.
   * Does not modify files.
   * Does not authorize future tasks.

3. `path-inspector-subagent`
   * Path: `.claude/agents/path-inspector-subagent.md`
   * Skill: `inspect-authorized-paths`
   * Status: `CONTROLLED_ARTIFACT_ONLY`
   * Execution status: `NOT_EXECUTED`
   * Allowed role summary: structures, at a documentary level only, the inspection of authorized paths, comparing reported paths against authorized paths and recommending stopping on an out-of-scope path.
   * Forbidden actions summary: does not implement, does not execute, does not access files, does not widen scope, does not authorize tasks, does not create artifacts.
   * Does not create files.
   * Does not modify files.
   * Does not authorize future tasks.

4. `governance-violation-detector-subagent`
   * Path: `.claude/agents/governance-violation-detector-subagent.md`
   * Skill: `detect-governance-violation`
   * Status: `CONTROLLED_ARTIFACT_ONLY`
   * Execution status: `NOT_EXECUTED`
   * Allowed role summary: detects and reports, at a documentary level only, possible governance violations and recommends stopping when boundaries, authorization, or non-execution rules are violated.
   * Forbidden actions summary: does not implement, does not execute, does not remediate violations on its own, does not widen scope, does not authorize tasks, does not create artifacts.
   * Does not create files.
   * Does not modify files.
   * Does not authorize future tasks.

5. `evidence-recorder-subagent`
   * Path: `.claude/agents/evidence-recorder-subagent.md`
   * Skill: `write-evidence-record`
   * Status: `CONTROLLED_ARTIFACT_ONLY`
   * Execution status: `NOT_EXECUTED`
   * Allowed role summary: structures, at a documentary level only, evidence records observed during a task, producing a documentary synthesis without persisting anything.
   * Forbidden actions summary: does not implement, does not execute, does not persist records by itself, does not widen scope, does not authorize tasks, does not create artifacts.
   * Does not create files.
   * Does not modify files.
   * Does not authorize future tasks.

## Cross-Subagent Boundary Rules

No subagent indexed here may:

* call another subagent automatically;
* execute implementation;
* modify files;
* create files;
* create commands;
* create adapters;
* create runners;
* create a registry;
* create JSON;
* create machine-readable contracts;
* authorize next tasks;
* interpret insufficient phrases as authorization;
* substitute human review;
* alter approved specs;
* widen scope.

## Forbidden Actions

The consolidation recorded by this index must not create:

* new subagents;
* any other file in `.claude/agents/` beyond this authorized index;
* any file in `.claude/commands/`;
* adapters;
* commands;
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

This index is a documentary artifact only. It performs no execution. Its presence does not execute anything, does not authorize execution, does not modify any subagent file, and does not materialize any command, adapter, runner, or registry. The indexed subagent definition files are themselves definitions only and were not executed. Any operational use of any indexed subagent would require its own task and explicit human authorization.

## Future Task Gate

This index does not authorize Task 134 automatically. The next candidate task is only:

`Task 134 — Prepare Human Authorization Gate For Controlled Claude Commands Phase`

Status:

`NOT_AUTHORIZED_AUTOMATICALLY`

That next task may only begin with explicit human authorization in a future instruction. The required future phrase is:

`EU AUTORIZO A TASK 134 PARA PREPARAR O GATE HUMANO DA CONTROLLED CLAUDE COMMANDS PHASE, SEM CRIAR COMANDOS E SEM EXECUÇÃO.`

The following phrases remain insufficient as technical authorization: "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", "continue".

## Readiness Statement

`TASK_133_CONTROLLED_CLAUDE_SUBAGENTS_INDEX_CONSOLIDATED_DOCUMENTARY_ONLY`
