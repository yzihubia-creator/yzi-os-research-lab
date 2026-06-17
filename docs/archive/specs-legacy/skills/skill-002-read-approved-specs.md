# Skill 002  Read Approved Specs

## Status

`DOCUMENTARY_INSTITUTIONAL_SKILL_SPEC_ONLY`

## Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Purpose

This institutional skill exists to guide any future executor to locate, recognize, and read approved authority sources before preparing, validating, or executing any task.

It is intended to reduce the risk of action based on memory, prompt-only context, inferred authorization, stale documents, or incomplete authority review.

## Nature of the Skill

This skill is:

* documentary;
* institutional;
* executor-agnostic;
* derived from approved specs;
* not executable;
* not an adapter;
* not a command;
* not a subagent;
* not a runner;
* not a technical implementation.

## Position In The Conceptual Flow

`read-approved-specs` comes before `validate-scope-boundaries`.

Future conceptual order:

1. `read-approved-specs`
2. `validate-scope-boundaries`
3. future verification, execution, or evidence, only when authorized

## When To Use

This skill should be used, in the future, before any task that depends on:

* approved specs;
* P0P4 package;
* readiness statement;
* execution index;
* human gate;
* explicit authorization;
* negative scope;
* exact paths and artifacts;
* documentary evidence.

## When Not To Use

This skill must not be used as:

* authorization;
* execution;
* implementation;
* adapter;
* command;
* runner;
* substitute for human decision;
* substitute for scope validation;
* permission to alter files.

This skill only guides authority reading. It does not grant permission to proceed.

## Expected Inputs

Future use of this skill would require review of human and documentary inputs such as:

* confirmed input state;
* path of the spec or authority document;
* current index;
* current readiness statement;
* applicable task package;
* applicable human gates;
* human decision records;
* authorized artifacts;
* forbidden files;
* negative scope.

## Authority Sources

Authority sources may include, when applicable:

* approved specs;
* P0P4 packages;
* execution package index;
* readiness statements;
* human validation decision records;
* evidence review records;
* institutional skill documents;
* explicit human gates;
* approved architecture documents.

## Suggested Reading Order

A future human or bounded executor should use this documentary reading order:

1. Read the task input state.
2. Read the current index.
3. Read the current readiness statement.
4. Read applicable human gates.
5. Read applicable human decision documents.
6. Read directly referenced specs or packages.
7. Confirm paths and artifacts.
8. Only then use `validate-scope-boundaries`.

## Insufficient Context Signals

Progress should be blocked when any of these signals appear:

* missing spec path;
* missing readiness statement;
* missing human gate when required;
* missing explicit authorization when required;
* generic reference to specs without a path;
* dependency on a document that cannot be found;
* conflict between authority documents;
* missing updated index when the index is required;
* attempt to act based only on prompt or memory.

## Stopping Conditions

Execution must stop if:

* the authority source does not exist;
* the path is missing;
* the path is ambiguous;
* there is conflict between documents without a priority rule;
* the executor depends on unauthorized inference;
* the task attempts to convert reading into authorization;
* the task attempts to advance automatically to execution;
* there is risk of altering P0P4;
* there is risk of initiating unauthorized technical implementation.

## Expected Evidence

Any future use of this skill should produce documentary evidence such as:

* sources read;
* paths confirmed;
* missing documents, if any;
* conflicts found, if any;
* readiness statement confirmed;
* final decision: `APPROVED_SPECS_READINESS_CONFIRMED` or `APPROVED_SPECS_READING_BLOCKED`.

## Relationship With `validate-scope-boundaries`

This skill provides authority context so that `validate-scope-boundaries` can validate scope against the correct documents.

`read-approved-specs` identifies what must be read. `validate-scope-boundaries` checks whether the proposed task stays inside the authorized limits defined by those documents.

## Relationship With Specs

This skill derives from approved specs and cannot redefine governance.

Specs remain the source of authority. This skill may only help document whether the proper authority sources have been located and read.

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

`INSTITUTIONAL_SKILL_002_READ_APPROVED_SPECS_CREATED_DOCUMENTARY_ONLY`
