# Skill 005 — Detect Governance Violation

## Status

`DOCUMENTARY_INSTITUTIONAL_SKILL_SPEC_ONLY`

## Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Purpose

This institutional skill exists to guide the identification of governance, scope, authorization, or artifact violations before, during, or after future tasks.

It is intended to protect the negative scope and the human-authorization model by surfacing violations instead of allowing them to pass silently into execution.

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

`detect-governance-violation` complements reading, validation, and path inspection, and precedes evidence recording.

Future conceptual order:

1. `read-approved-specs`
2. `validate-scope-boundaries`
3. `inspect-authorized-paths`
4. `detect-governance-violation`
5. `write-evidence-record`

## When To Use

This skill should be used, in the future:

* when there is an attempt at implicit execution;
* when a task exceeds its scope;
* when there is a missing or ambiguous path;
* when there is creation of a forbidden artifact;
* when there is an attempt to create an adapter, `.claude/`, command, subagent, or runner without authorization;
* when there is an attempt to interpret “vamos”, “segue”, “ok”, “aprovado”, or similar as authorization.

## Typical Violations

* implicit authorization;
* missing path;
* divergent path;
* creation of an extra file;
* alteration of a forbidden file;
* creation of unauthorized code;
* creation of unauthorized YAML / JSON;
* creation of an unauthorized adapter;
* alteration of P0–P4;
* technical execution initiated without authorization.

## Stopping Conditions

Execution must stop if:

* there is any critical violation;
* there is divergence between the task and the result;
* there is an absence of explicit authorization when required;
* there is a need to alter an artifact outside the scope.

## Expected Evidence

Any future use of this skill should produce documentary evidence such as:

* violation absent or present;
* type of violation;
* affected path;
* rule broken;
* final decision: `GOVERNANCE_VIOLATION_NOT_DETECTED` or `GOVERNANCE_VIOLATION_DETECTED`.

## Relationship With Other Skills

This skill complements `read-approved-specs`, `validate-scope-boundaries`, and `inspect-authorized-paths`.

Those skills establish the authority, scope, and concrete path boundaries; `detect-governance-violation` watches for any crossing of those boundaries and blocks progress when a violation is found.

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

`INSTITUTIONAL_SKILL_005_DETECT_GOVERNANCE_VIOLATION_CREATED_DOCUMENTARY_ONLY`
