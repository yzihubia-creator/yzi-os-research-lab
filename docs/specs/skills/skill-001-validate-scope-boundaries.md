# Skill 001  Validate Scope Boundaries

## Status

`DOCUMENTARY_INSTITUTIONAL_SKILL_SPEC_ONLY`

## Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## Purpose

This institutional skill exists to validate whether a future task respects its authorized scope boundaries before any execution begins.

It is intended to help human reviewers and bounded executors confirm that paths, artifacts, negative scope, acceptance criteria, stopping conditions, and authorization boundaries are explicit and preserved.

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

## When To Use

This skill should be used, in the future, to review tasks before execution when there is:

* authorized path;
* authorized artifact;
* negative scope;
* acceptance criteria;
* stopping criteria;
* risk of scope expansion;
* risk of implicit authorization;
* risk of altering P0P4;
* risk of unauthorized technical execution.

## When Not To Use

This skill must not be used as:

* authorization;
* execution;
* implementation;
* adapter;
* command;
* runner;
* substitute for human decision.

This skill does not grant permission. Human authorization remains required when a task requires authorization.

## Expected Inputs

Future use of this skill would require review of human and documentary inputs such as:

* confirmed input state;
* authorized path;
* authorized artifact;
* forbidden files;
* negative scope;
* acceptance criteria;
* stopping conditions;
* expected rollback;
* explicit human authorization, when applicable.

## Scope Checks

Human reviewers should check:

* whether the path is explicit;
* whether the artifact is explicit;
* whether there is only one target when the task requires a single target;
* whether the index may or may not be edited;
* whether there is unauthorized code creation;
* whether there is unauthorized YAML or JSON creation;
* whether there is unauthorized adapter creation;
* whether there is unauthorized `.claude/` creation;
* whether there is unauthorized subagent creation;
* whether there is any P0P4 alteration;
* whether there is improper implicit authorization;
* whether the task attempts to advance automatically to the next stage.

## Violation Signals

Execution should be blocked when any of these signals appear:

* missing path;
* missing artifact;
* generic scope;
* multiple files when only one file was authorized;
* attempt to alter the index without authorization;
* attempt to create adapter;
* attempt to create `.claude/`;
* attempt to create YAML or JSON;
* attempt to create code;
* attempt to start technical implementation;
* attempt to infer authorization from phrases such as vamos, segue, ok, aprovado, or similar.

## Stopping Conditions

Execution must stop if:

* there is ambiguity;
* the path is not exact;
* the artifact is not exact;
* the negative scope conflicts with the objective;
* an artifact outside the permitted scope must be created;
* an unauthorized existing file must be altered;
* P0P4 must be altered;
* code, YAML, JSON, adapter, `.claude/`, command, subagent, or runner must be created;
* explicit human authorization is absent when required.

## Expected Evidence

Any future use of this skill should produce documentary evidence such as:

* scope validated;
* paths confirmed;
* artifacts confirmed;
* violations absent or listed;
* stopping conditions evaluated;
* final decision: `SCOPE_BOUNDARIES_VALIDATED` or `SCOPE_BOUNDARIES_BLOCKED`.

## Relationship With Specs

This skill derives from approved specs and cannot redefine governance.

Specs remain the source of authority. This skill may only help document whether a task respects the boundaries already defined by governed specs and explicit human authorization.

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

`INSTITUTIONAL_SKILL_001_VALIDATE_SCOPE_BOUNDARIES_CREATED_DOCUMENTARY_ONLY`
