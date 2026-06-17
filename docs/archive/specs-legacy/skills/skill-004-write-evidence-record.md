# Skill 004 — Write Evidence Record

## Status

`DOCUMENTARY_INSTITUTIONAL_SKILL_SPEC_ONLY`

## Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Purpose

This institutional skill exists to guide the creation of documentary evidence records after authorized actions.

It is intended to ensure that every authorized task leaves an auditable, documentary trail of what was created, altered, preserved, and decided, before any index update or claim of completion.

## Nature of the Skill

This skill is:

* documentary;
* institutional;
* executor-agnostic;
* not executable;
* not an adapter;
* not a command;
* not a subagent;
* not a runner;
* not a technical implementation.

## Position In The Conceptual Flow

`write-evidence-record` comes after reading, validation, path inspection, and governance detection.

Future conceptual order:

1. `read-approved-specs`
2. `validate-scope-boundaries`
3. `inspect-authorized-paths`
4. `detect-governance-violation`
5. `write-evidence-record`

## When To Use

This skill should be used, in the future:

* after an authorized documentary task;
* after a future authorized execution;
* after creation or alteration of permitted artifacts;
* before updating the index;
* when it is necessary to record evidence of the final state.

## Expected Inputs

* input state;
* artifacts created;
* artifacts altered;
* artifacts preserved;
* negative scope observed;
* acceptance criteria;
* final status.

## Minimum Evidence

* files created;
* files altered;
* files not altered;
* index edited or not edited;
* technical implementation remains at 0%, when applicable;
* adapters / commands / subagents / runners created or not created;
* final status.

## Stopping Conditions

Execution must stop if:

* the evidence is incomplete;
* the final status is missing;
* there is divergence between the authorized scope and the result;
* there is an attempt to declare success without verifiable artifacts.

## Possible Decisions

* `EVIDENCE_RECORD_READY`
* `EVIDENCE_RECORD_BLOCKED`
* `EVIDENCE_MISMATCH_DETECTED`

## Relationship With Other Skills

This skill depends on reading specs and validating scope before recording evidence.

`read-approved-specs` and `validate-scope-boundaries` establish what was authorized, `inspect-authorized-paths` and `detect-governance-violation` confirm the boundaries were respected, and `write-evidence-record` records the verifiable documentary evidence of the final state.

## Relationship With Future Adapters

Future adapters may translate this skill for Claude, Codex, Llama, Gemini, Qwen, DeepSeek, or another executor.

Adapters must not alter this skill's institutional intent, redefine governance, or convert documentary guidance into operational authority.

## Negative Scope

This file does not create:

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
* technical implementation.

## Current State

* Technical implementation remains at 0%.
* No technical execution was initiated.
* No next task is automatically authorized.
* No adapter was created.
* No `.claude/` directory was created by this task.
* No command, subagent, or runner was created.

## Final Status

`INSTITUTIONAL_SKILL_004_WRITE_EVIDENCE_RECORD_CREATED_DOCUMENTARY_ONLY`
