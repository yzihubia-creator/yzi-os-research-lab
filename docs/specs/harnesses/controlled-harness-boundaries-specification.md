## Boundary Specification Title

`controlled-harness-boundaries`

## Documentary Status

`DOCUMENTARY_HARNESS_BOUNDARY_SPECIFICATION_ONLY`

## Purpose

This specification details, documentarily only, the institutional boundaries that any future harness must respect. It keeps separate spec, skill, subagent, command, adapter, harness, executor, evidence, human authorization, and execution.

## Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Boundary Scope

This specification defines only documentary boundaries for future harnesses.

It does not create an executable harness.

It does not create a runner.

It does not create a registry.

It does not create a pipeline.

It does not create a workflow.

It does not create code.

It does not execute anything.

## Spec Authority Boundary

* Spec is authority.
* Harness does not decide authority.
* Harness does not replace the spec.
* Harness does not alter the spec.
* Harness does not reinterpret an approved spec.
* Harness does not expand scope beyond the spec.
* Absence of an approved spec is a stop condition.

## Institutional Skill Boundary

* Institutional skill is documentary capability.
* Harness does not create skill.
* Harness does not execute skill.
* Harness does not replace skill.
* Harness does not transform skill into an executable tool.
* Skill may only be used as documentary reference.
* Creation of a new skill requires its own task and explicit human authorization.

## Controlled Subagent Boundary

* Controlled subagents are controlled artifacts.
* Harness does not execute subagents.
* Harness does not create subagents.
* Harness does not modify subagents.
* Harness does not transform a documentary subagent into an executor.
* Any new subagent requires its own task, exact path, and explicit human authorization.

## Controlled Command Boundary

* Controlled commands are controlled artifacts.
* Harness does not execute commands.
* Harness does not create commands.
* Harness does not modify commands.
* Harness does not call commands automatically.
* Any new command requires its own task, exact path, and explicit human authorization.

## Adapter Translation Boundary

* Adapter is translation.
* Harness does not create adapter.
* Harness does not execute adapter.
* Harness does not transform documentary adapter into executable adapter.
* Harness does not create adapter registry.
* Harness does not replace the adapter.
* Any executable adapter requires its own task, exact path, negative scope, and explicit human authorization.

## Harness Coordination Boundary

* Documentary harness may only describe coordination.
* Documentary harness does not coordinate execution.
* Documentary harness does not orchestrate tools.
* Documentary harness does not call commands, subagents, adapters, or executors.
* Documentary harness does not create pipeline.
* Documentary harness does not create workflow.
* Documentary harness does not create runner.
* Documentary harness does not create registry.

## Executor Replaceability Boundary

* Executor is replaceable.
* Harness does not depend on a specific executor.
* Harness does not call Claude.
* Harness does not call Claude Code.
* Harness does not call Codex.
* Harness does not call external tools.
* Harness does not couple operation to a specific executor.

## Human Authorization Boundary

* Explicit human authorization is required to advance a task.
* Harness cannot infer authorization.
* Harness cannot replace human authorization.
* Readiness statement does not authorize the next task by itself.
* Prior task does not authorize the next task automatically.
* Insufficient phrases remain insufficient.

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

## Evidence Boundary

* Evidence is documentary.
* Harness does not persist evidence automatically.
* Harness does not create technical log.
* Harness does not create evidence database.
* Harness does not replace evidence document.
* Every task requires an evidence record.
* Absence of evidence is a stop condition.

## Path Boundary

* Only explicitly authorized paths may be created or modified.
* Harness cannot infer path.
* Harness cannot expand path.
* Harness cannot modify files outside scope.
* Directory creation requires explicit authorization.
* Index update may occur only when explicitly authorized.

## Artifact Boundary

* Authorized artifact must be exact.
* Harness cannot create an additional artifact.
* Harness cannot create an unauthorized technical artifact.
* Harness cannot transform a document into an executable contract.
* Extra artifact is a governance violation.

## Execution Boundary

* No execution is allowed in this task.
* Harness does not execute.
* Harness does not execute command.
* Harness does not execute subagent.
* Harness does not execute adapter.
* Harness does not execute executor.
* Harness does not run test.
* Harness does not call external tool.
* Attempted execution is a critical stop condition.

## Machine-Readable Artifact Boundary

* YAML is forbidden.
* JSON is forbidden.
* Machine-readable contract is forbidden.
* Pseudo-schema is forbidden.
* Frontmatter is forbidden in this file.
* Machine-readable table is forbidden.
* Any executable format or format parseable as technical contract is forbidden.

## Technical Artifact Boundary

It is forbidden to create:

* code;
* API;
* schema;
* migration;
* frontend;
* database;
* table;
* persistence;
* runner;
* registry;
* pipeline;
* workflow;
* executable detector;
* executable logger;
* executable validator;
* backlog;
* sprint plan;
* roadmap;
* broad implementation plan;
* broad technical execution plan.

## Governance Violation Boundary

It is a governance violation to:

* execute without authorization;
* create artifact outside authorized path;
* create technical artifact;
* create YAML;
* create JSON;
* create machine-readable contract;
* create runner;
* create registry;
* create pipeline;
* create workflow;
* alter approved specs;
* alter P0P4;
* interpret insufficient phrase as authorization;
* start future task automatically;
* mix spec, skill, adapter, harness, and executor;
* treat executor as authority.

## Stop Conditions

Any future use related to the harness must stop if there is:

* absent readiness statement;
* incompatible readiness statement;
* absent explicit human authorization;
* unauthorized path;
* unauthorized artifact;
* attempt to create executable harness;
* attempt to create runner;
* attempt to create registry;
* attempt to create YAML;
* attempt to create JSON;
* attempt to create machine-readable contract;
* attempt to create code;
* attempt to execute command;
* attempt to execute subagent;
* attempt to execute adapter;
* attempt to call executor;
* attempt to alter approved spec;
* attempt to alter P0P4;
* attempt to start next task automatically.

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
* creating YAML;
* creating JSON;
* creating machine-readable contract;
* creating pseudo-schema;
* creating frontmatter;
* creating code;
* creating API;
* creating schema;
* creating migration;
* creating frontend;
* creating database;
* creating table;
* creating persistence;
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
* altering approved specs;
* altering P0P4 packages;
* altering P0P4 records;
* starting next task automatically.

## Non-Executable Declaration

`controlled-harness-boundaries` is only a documentary boundary specification.

* No executable harness was created.
* No technical harness was created.
* No runner was created.
* No registry was created.
* No executable pipeline was created.
* No executable workflow was created.
* No executable detector, logger, or validator was created.
* No YAML was created.
* No JSON was created.
* No machine-readable contract was created.
* No code was created.
* No execution was performed.

## Future Implementation Boundary

This specification does not authorize future implementation.

Any future harness implementation will require:

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
* confirmation that executors remain replaceable.

## Future Task Gate

Task 150 does not authorize Task 151 automatically.

The next candidate task is only:

`Task 151  Create Controlled Harness Evidence Flow Specification`

Status:

`NOT_AUTHORIZED_AUTOMATICALLY`

The required future phrase is:

`EU AUTORIZO A TASK 151 PARA CRIAR A ESPECIFICAÇÃO DOCUMENTAL CONTROLADA DO FLUXO DE EVIDÊNCIAS DO HARNESS, SEM HARNESS EXECUTÁVEL E SEM EXECUÇÃO.`

## Readiness Statement

`TASK_150_CONTROLLED_HARNESS_BOUNDARY_SPECIFICATION_CREATED_DOCUMENTARY_ONLY`
