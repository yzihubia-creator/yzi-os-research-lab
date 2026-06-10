# validate-scope-boundaries

This is a controlled Claude command definition for assisting the documentary validation of scope boundaries. It is a definition only. It contains no frontmatter, no YAML, no JSON, no machine-readable contract, and no pseudo-schema. It performs no execution and authorizes no execution.

## Command Name

`validate-scope-boundaries`

## Purpose

This command exists only to guide, at a documentary and assistive level, the validation of scope boundaries. It orients a human or reviewer toward a structured, documentary comparison of a requested action against the authorized scope, authorized artifacts, authorized paths, negative scope, and the future task gate, in alignment with the current readiness statement and the applicable explicit human authorization. It produces no result by itself, runs nothing, and changes nothing.

## Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Related Controlled Subagent

`.claude/agents/scope-validator-subagent.md`

This command only guides the assistive validation of scope and boundaries and does not automatically execute the subagent. It does not call, trigger, schedule, or run `.claude/agents/scope-validator-subagent.md`; it only points to it as the related controlled subagent definition.

## Related Institutional Skill

`validate-scope-boundaries`

This command is related only to the institutional skill `validate-scope-boundaries`. It is not related to any other skill in this task.

## Allowed Use

This command may only be used conceptually to guide a documentary validation of:

* the current task;
* the current readiness statement;
* the explicit human authorization;
* the authorized artifacts;
* the authorized paths;
* the authorized scope;
* the negative scope;
* the future task gate;
* the expected output of the task.

## Required Inputs

Any future use of this command must textually provide:

* the current task;
* the expected readiness statement;
* the applicable explicit human authorization;
* the list of authorized artifacts;
* the list of authorized paths;
* the allowed scope;
* the negative scope;
* the future task gate;
* the documentary question to be answered.

## Expected Output

This command guides that the output be textual Markdown only, containing:

* `Scope Reviewed`
* `Authorization Observed`
* `Authorized Artifacts`
* `Authorized Paths`
* `Negative Scope Identified`
* `Potential Scope Violations`
* `Governance Concerns`
* `Stop Recommendation`
* `Non-Execution Confirmation`

The output must not use JSON. The output must not use YAML.

## Strict Boundaries

This command:

* does not modify files;
* does not create files;
* does not execute implementation;
* does not run tests;
* does not call runners;
* does not call adapters;
* does not create commands;
* does not create subagents;
* does not alter approved specs;
* does not authorize next tasks;
* does not substitute human authorization;
* does not interpret insufficient phrases as authorization;
* does not widen scope;
* does not substitute human review.

## Forbidden Actions

This command forbids:

* automatically executing any subagent;
* creating or modifying files;
* creating an adapter;
* creating a runner;
* creating a registry;
* creating JSON;
* creating YAML;
* creating a machine-readable contract;
* altering approved specs;
* starting a future task;
* declaring a scope valid without documentary evidence;
* interpreting "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", or "continue" as authorization.

## Required Review Order

The conceptual review order is:

1. confirm the current task;
2. confirm the expected readiness statement;
3. confirm explicit human authorization when required;
4. identify the authorized artifacts;
5. identify the authorized paths;
6. identify the allowed scope;
7. identify the negative scope;
8. identify the future task gate;
9. compare the request against the authorized scope;
10. record potential violations;
11. recommend stopping if there is a violation or insufficient evidence;
12. confirm non-execution.

## Human Authorization Boundary

This command may not be used as human authorization. Any task advance still requires the explicit phrase defined in the corresponding gate document. The phrases "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", and "continue" remain insufficient as technical authorization.

## Non-Execution Declaration

This file is a controlled Claude command definition only. It performs no execution. Its presence does not execute anything, does not authorize execution, does not run the related subagent, and does not materialize any other command, adapter, runner, or registry. Any operational use of this command would require its own task and explicit human authorization.

## Readiness Statement Awareness

This command is aware that the current readiness statement governs what is authorized. If the readiness statement found does not match the expected readiness statement, or is absent, the command guides the reviewer to recommend stopping and to report the discrepancy. The command never guides a finalized scope-validation conclusion when the readiness statement is incompatible.
