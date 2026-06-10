# write-evidence-record

This is a controlled Claude command definition for assisting the documentary recording of evidence. It is a definition only. It contains no frontmatter, no YAML, no JSON, no machine-readable contract, and no pseudo-schema. It performs no execution and authorizes no execution.

## Command Name

`write-evidence-record`

## Purpose

This command exists only to guide, at a documentary and assistive level, the recording of evidence. It orients a human or reviewer toward a structured, documentary synthesis of observed items, source documents, reported created and modified files, non-execution confirmations, preserved negative boundaries, evidence gaps, and associated risks, in alignment with the current readiness statement, the explicit human authorization, and the future task gate. It produces no result by itself, runs nothing, persists nothing, and changes nothing.

## Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Related Controlled Subagent

`.claude/agents/evidence-recorder-subagent.md`

This command only guides the assistive documentary recording of evidence and does not automatically execute the subagent. It does not call, trigger, schedule, or run `.claude/agents/evidence-recorder-subagent.md`; it only points to it as the related controlled subagent definition.

## Related Institutional Skill

`write-evidence-record`

This command is related only to the institutional skill `write-evidence-record`. It is not related to any other skill in this task.

## Allowed Use

This command may only be used conceptually to guide a documentary recording of:

* the current task;
* the current readiness statement;
* the explicit human authorization;
* the observed source documents;
* the reported created files;
* the reported modified files;
* the non-execution confirmations;
* the preserved negative boundaries;
* the evidence gaps;
* the associated risks;
* the future task gate.

## Required Inputs

Any future use of this command must textually provide:

* the current task;
* the expected readiness statement;
* the applicable explicit human authorization;
* the observed source documents;
* the reported created files;
* the reported modified files;
* the non-execution confirmations;
* the negative scope;
* the future task gate;
* the expected documentary conclusion;
* the documentary question to be answered.

## Expected Output

This command guides that the output be textual Markdown only, containing:

* `Evidence Scope`
* `Readiness Statement Observed`
* `Human Authorization Observed`
* `Source Documents Observed`
* `Created Files Reported`
* `Modified Files Reported`
* `Non-Execution Confirmations`
* `Boundary Confirmations`
* `Evidence Gaps`
* `Risk Notes`
* `Stop Recommendation`
* `Non-Execution Confirmation`

The output must not use JSON. The output must not use YAML.

## Strict Boundaries

This command:

* does not modify files;
* does not create files;
* does not persist records on its own;
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
* does not substitute human review.

## Forbidden Actions

This command forbids:

* automatically executing any subagent;
* creating or modifying files;
* persisting evidence on its own;
* creating an adapter;
* creating a runner;
* creating a registry;
* creating JSON;
* creating YAML;
* creating a machine-readable contract;
* altering approved specs;
* starting a future task;
* remediating a violation on its own;
* declaring evidence complete without a documentary basis;
* interpreting "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", or "continue" as authorization.

## Required Review Order

The conceptual review order is:

1. confirm the current task;
2. confirm the expected readiness statement;
3. confirm explicit human authorization when required;
4. identify the observed source documents;
5. identify the reported created files;
6. identify the reported modified files;
7. record the non-execution confirmations;
8. record the preserved negative boundaries;
9. record the evidence gaps;
10. record the associated risks;
11. recommend stopping if the evidence is insufficient;
12. confirm non-execution.

## Human Authorization Boundary

This command may not be used as human authorization. Any task advance still requires the explicit phrase defined in the corresponding gate document. The phrases "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", and "continue" remain insufficient as technical authorization.

## Non-Execution Declaration

This file is a controlled Claude command definition only. It performs no execution. Its presence does not execute anything, does not authorize execution, does not run the related subagent, does not persist any record, and does not materialize any other command, adapter, runner, or registry. Any operational use of this command would require its own task and explicit human authorization.

## Readiness Statement Awareness

This command is aware that the current readiness statement governs what is authorized. If the readiness statement found does not match the expected readiness statement, or is absent, the command guides the reviewer to recommend stopping and to report the discrepancy. The command never guides a finalized evidence record when the readiness statement is incompatible.
