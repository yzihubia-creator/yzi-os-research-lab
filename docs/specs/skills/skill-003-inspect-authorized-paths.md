# Skill 003 — Inspect Authorized Paths

## Status

`DOCUMENTARY_INSTITUTIONAL_SKILL_SPEC_ONLY`

## Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Purpose

This institutional skill exists to guide the documentary inspection of authorized paths, permitted artifacts, and forbidden files before any future execution.

It is intended to reduce the risk of acting on an ambiguous path, altering an unauthorized file, or creating an artifact outside the explicitly authorized scope.

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

`inspect-authorized-paths` comes after `read-approved-specs` and is used together with `validate-scope-boundaries`.

Future conceptual order:

1. `read-approved-specs`
2. `validate-scope-boundaries`
3. `inspect-authorized-paths`
4. `detect-governance-violation`
5. `write-evidence-record`

## When To Use

This skill should be used, in the future:

* before creating or altering files;
* before updating the index;
* before executing any task with a specific path;
* when there is a risk of an ambiguous path;
* when there is a risk of altering an unauthorized file.

## Checks

* the authorized path exists and is exact;
* the authorized artifact is explicit;
* forbidden files are identified;
* whether the index may or may not be altered;
* whether `/docs/specs/skills/` may or may not be altered;
* P0–P4 will not be altered;
* no extra file will be created.

## Stopping Conditions

Execution must stop if:

* the path is missing;
* the path is ambiguous;
* the artifact is missing;
* there is a need to alter an unauthorized file;
* there is a need to create a file outside the scope;
* there is a conflict between the declared path and the real path.

## Expected Evidence

Any future use of this skill should produce documentary evidence such as:

* confirmed paths;
* confirmed artifacts;
* forbidden files preserved;
* final decision: `AUTHORIZED_PATHS_CONFIRMED` or `AUTHORIZED_PATHS_BLOCKED`.

## Relationship With Other Skills

This skill should be used after `read-approved-specs` and together with `validate-scope-boundaries`.

`read-approved-specs` identifies the authority sources, `validate-scope-boundaries` confirms the proposed task stays inside the authorized limits, and `inspect-authorized-paths` confirms that the concrete paths, artifacts, and forbidden files match those limits exactly.

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

`INSTITUTIONAL_SKILL_003_INSPECT_AUTHORIZED_PATHS_CREATED_DOCUMENTARY_ONLY`
