# detect-governance-violation

This is a controlled Claude command definition for assisting the documentary detection of governance violations. It is a definition only. It contains no frontmatter, no YAML, no JSON, no machine-readable contract, and no pseudo-schema. It performs no execution and authorizes no execution.

## Command Name

`detect-governance-violation`

## Purpose

This command exists only to guide, at a documentary and assistive level, the detection of governance violations. It orients a human or reviewer toward a structured, documentary review of possible violations regarding the readiness statement, explicit human authorization, the authorized scope, authorized paths, authorized artifacts, the negative scope, the future task gate, reported created and modified files, non-execution confirmations, and the separation between spec, skill, adapter, and executor. It produces no result by itself, runs nothing, remediates nothing, and changes nothing.

## Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Related Controlled Subagent

`.claude/agents/governance-violation-detector-subagent.md`

This command only guides the assistive documentary detection of governance violations and does not automatically execute the subagent. It does not call, trigger, schedule, or run `.claude/agents/governance-violation-detector-subagent.md`; it only points to it as the related controlled subagent definition.

## Related Institutional Skill

`detect-governance-violation`

This command is related only to the institutional skill `detect-governance-violation`. It is not related to any other skill in this task.

## Allowed Use

This command may only be used conceptually to guide a documentary review of possible violations related to:

* the current readiness statement;
* the explicit human authorization;
* the authorized scope;
* the authorized paths;
* the authorized artifacts;
* the negative scope;
* the future task gate;
* the reported created files;
* the reported modified files;
* the non-execution confirmations;
* the separation between spec, skill, adapter, and executor.

## Required Inputs

Any future use of this command must textually provide:

* the current task;
* the expected readiness statement;
* the applicable explicit human authorization;
* the list of authorized artifacts;
* the list of authorized paths;
* the reported created files;
* the reported modified files;
* the negative scope;
* the future task gate;
* the documentary evidence and governance violation protocol;
* the documentary question to be answered.

## Expected Output

This command guides that the output be textual Markdown only, containing:

* `Governance Review Scope`
* `Authorization Observed`
* `Readiness Statement Reviewed`
* `Violations Observed`
* `Suggested Severity`
* `Evidence Observed`
* `Affected Paths`
* `Rules Violated`
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
* does not remediate violations on its own;
* does not authorize next tasks;
* does not substitute human authorization;
* does not interpret insufficient phrases as authorization;
* does not widen scope;
* does not alter approved severities;
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
* remediating a violation on its own;
* declaring an absence of violation without documentary evidence;
* interpreting "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", or "continue" as authorization.

## Required Review Order

The conceptual review order is:

1. confirm the current task;
2. confirm the expected readiness statement;
3. confirm explicit human authorization when required;
4. identify the authorized scope;
5. identify the authorized artifacts;
6. identify the authorized paths;
7. identify the negative scope;
8. identify the future task gate;
9. compare created and modified files against the authorized scope;
10. identify signs of unauthorized technical execution;
11. identify any break in the separation between spec, skill, adapter, and executor;
12. suggest a documentary severity when there is a violation;
13. recommend stopping if there is a violation or insufficient evidence;
14. confirm non-execution.

## Human Authorization Boundary

This command may not be used as human authorization. Any task advance still requires the explicit phrase defined in the corresponding gate document. The phrases "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", and "continue" remain insufficient as technical authorization.

## Non-Execution Declaration

This file is a controlled Claude command definition only. It performs no execution. Its presence does not execute anything, does not authorize execution, does not run the related subagent, does not remediate any violation, and does not materialize any other command, adapter, runner, or registry. Any operational use of this command would require its own task and explicit human authorization.

## Readiness Statement Awareness

This command is aware that the current readiness statement governs what is authorized. If the readiness statement found does not match the expected readiness statement, or is absent, the command guides the reviewer to recommend stopping and to report the discrepancy. The command never guides a finalized clearance of violations when the readiness statement is incompatible.
