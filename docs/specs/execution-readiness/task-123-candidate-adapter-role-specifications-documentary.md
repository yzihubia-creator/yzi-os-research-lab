# Task 123 — Candidate Adapter Role Specifications — Documentary Only

## 1. Task Title

Task 123 — Candidate Adapter Role Specifications, documentary only.

This document describes, documentarily only, the candidate adapter roles identified in Task 121. It produces conceptual, non-executable specifications for candidate adapter roles. It does not describe created adapters. It does not authorize future automatic creation. The candidate role names remain documentary drafts only and are not transformed into their own files, YAML, JSON, registry, or machine-readable contracts.

## 2. Current Readiness Statement

`TASK_122_CANDIDATE_SUBAGENT_ROLE_SPECIFICATIONS_DOCUMENTARY_ONLY`

## 3. Implementation Status

`0%`

No technical artifact exists. No `.claude/` directory exists. No `.claude/agents` directory exists. No adapter file exists. No subagent exists. No command exists. No runner exists. No registry exists. No machine-readable contract exists.

## 4. Human Authorization Source

This task exists only because of explicit human authorization in the present instruction:

`EU AUTORIZO A TASK 123 PARA DETALHAR DOCUMENTALMENTE OS CANDIDATE ADAPTER ROLE SPECIFICATIONS, SEM EXECUÇÃO TÉCNICA.`

No prior task, readiness statement, or checkpoint authorized this task automatically. Task 122 did not authorize Task 123 automatically.

## 5. Purpose

The purpose of this task is to describe, documentarily only, the candidate adapter roles mapped in Task 121, so that each role's conceptual translation responsibility, hypothetical executor target, related institutional skill, documentary inputs and outputs, negative scope, governance risks, and evidence expectations are delimited. This task only describes, registers, maps, delimits, and conceptually translates candidate documentary roles. It does not create adapters.

## 6. Non-Execution Boundary

This document describes candidate documentary adapter roles only. No role described here is an executable adapter. No role described here is created as a file, directory, registry, or configuration. No technical execution is initiated by this document. The act of describing a candidate adapter role must never be interpreted as creating it or as authorizing its creation.

## 7. Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

The following distinctions are preserved throughout this document:

* The spec is institutional authority.
* The skill is institutional capability.
* The adapter is translation between capability and executor.
* The executor is replaceable.
* The adapter does not decide scope.
* The adapter does not authorize execution.
* The adapter does not alter specs.
* The adapter does not create technical artifacts by itself.
* The adapter does not substitute human authorization.
* The adapter is not a subagent.
* The adapter is not a runner.
* The adapter is not a command.

## 8. Source Mapping From Task 121

Task 121 mapped the following candidate adapter roles to institutional skills, documentarily only:

| Candidate Adapter Role (documentary) | Related Institutional Skill(s) |
| --- | --- |
| `claude-code-adapter` | all five, as translation only |
| `codex-adapter` | all five, as translation only |
| `human-review-adapter` | `validate-scope-boundaries`, `detect-governance-violation` |
| `evidence-log-adapter` | `write-evidence-record` |
| `spec-ingestion-adapter` | `read-approved-specs`, `inspect-authorized-paths` |

Conceptual order of the institutional skills is preserved:

1. `read-approved-specs`
2. `validate-scope-boundaries`
3. `inspect-authorized-paths`
4. `detect-governance-violation`
5. `write-evidence-record`

## 9. Candidate Adapter Role Specification Method

Each candidate documentary adapter role is described using only the following documentary fields:

* `Role name`
* `Documentary status`
* `Hypothetical executor target`
* `Related institutional skill`
* `Conceptual translation responsibility`
* `Allowed documentary input`
* `Expected documentary output`
* `Negative scope`
* `Governance risks`
* `Evidence expected`
* `Reason this is not an executable adapter`

The descriptions use documentary and institutional language only. They do not use implementation language. They describe, register, map, delimit, and conceptually translate; they do not execute.

## 10. claude-code-adapter — Documentary Specification

* `Role name`: `claude-code-adapter`
* `Documentary status`: candidate documentary adapter role only; not created; not a file; not a registry; not executable.
* `Hypothetical executor target`: Claude Code.
* `Related institutional skill`: all five institutional skills, as translation only.
* `Conceptual translation responsibility`: describe how institutional skill intent would be conceptually translated into Claude Code executor terms.
* `Allowed documentary input`: an institutional skill intent expressed documentarily.
* `Expected documentary output`: a documentary record of the conceptual translation for a given skill intent.
* `Negative scope`: does not become the authority; does not decide scope; does not authorize execution; does not alter specs; does not create technical artifacts; does not substitute human authorization; is replaceable.
* `Governance risks`: the adapter assuming authority instead of translating; translating an unauthorized intent.
* `Evidence expected`: a documentary record naming the skill intent and its conceptual translation.
* `Reason this is not an executable adapter`: it is a conceptual description only; no file, registry, or configuration is created, so nothing can translate or run.

## 11. codex-adapter — Documentary Specification

* `Role name`: `codex-adapter`
* `Documentary status`: candidate documentary adapter role only; not created; not a file; not a registry; not executable.
* `Hypothetical executor target`: Codex.
* `Related institutional skill`: all five institutional skills, as translation only.
* `Conceptual translation responsibility`: describe how institutional skill intent would be conceptually translated into Codex executor terms, with Codex as a bounded executor.
* `Allowed documentary input`: an institutional skill intent expressed documentarily.
* `Expected documentary output`: a documentary record of the conceptual translation for a given skill intent.
* `Negative scope`: Codex is a bounded executor, not the architect; does not reopen the foundation; does not implement without explicit authorization; does not decide scope; does not authorize execution; does not alter specs; is replaceable.
* `Governance risks`: Codex acting as architect; implementing without explicit authorization; the adapter assuming authority instead of translating.
* `Evidence expected`: a documentary record naming the skill intent and its conceptual translation.
* `Reason this is not an executable adapter`: it is a conceptual description only; no executable artifact is produced, so it cannot translate anything at runtime.

## 12. human-review-adapter — Documentary Specification

* `Role name`: `human-review-adapter`
* `Documentary status`: candidate documentary adapter role only; not created; not a file; not a registry; not executable.
* `Hypothetical executor target`: human operator.
* `Related institutional skill`: `validate-scope-boundaries`, `detect-governance-violation`.
* `Conceptual translation responsibility`: describe how a required human review would be conceptually translated into a structured decision point.
* `Allowed documentary input`: a decision request and the exact required authorization phrase, if any.
* `Expected documentary output`: a documentary record of the human decision and the exact authorization phrase, if provided.
* `Negative scope`: does not substitute human judgment; does not auto-approve; does not decide scope on the human's behalf; does not interpret insufficient phrases as authorization.
* `Governance risks`: interpreting an insufficient phrase as authorization; recording a decision the human did not make.
* `Evidence expected`: a documentary record of the human decision and any exact authorization phrase.
* `Reason this is not an executable adapter`: it is a conceptual description only; no executable decision point exists, so it mediates nothing at runtime.

## 13. evidence-log-adapter — Documentary Specification

* `Role name`: `evidence-log-adapter`
* `Documentary status`: candidate documentary adapter role only; not created; not a file; not a registry; not executable.
* `Hypothetical executor target`: an evidence store.
* `Related institutional skill`: `write-evidence-record`.
* `Conceptual translation responsibility`: describe how an evidence record would be conceptually translated into a persisted, append-only evidence log entry.
* `Allowed documentary input`: a completed evidence record.
* `Expected documentary output`: a documentary description of the persisted, immutable evidence entry.
* `Negative scope`: does not alter recorded evidence; append-only conceptually; does not perform or authorize actions; does not decide scope.
* `Governance risks`: mutating or losing evidence; recording incomplete or fabricated evidence.
* `Evidence expected`: a documentary description of an append-only, immutable evidence entry.
* `Reason this is not an executable adapter`: it is a conceptual description only; no executable log exists, so it persists nothing at runtime.

## 14. spec-ingestion-adapter — Documentary Specification

* `Role name`: `spec-ingestion-adapter`
* `Documentary status`: candidate documentary adapter role only; not created; not a file; not a registry; not executable.
* `Hypothetical executor target`: a spec source.
* `Related institutional skill`: `read-approved-specs`, `inspect-authorized-paths`.
* `Conceptual translation responsibility`: describe how approved specs would be conceptually translated into a readable form for institutional skills.
* `Allowed documentary input`: approved specs only, referenced by their authorized paths.
* `Expected documentary output`: a documentary record of which approved spec was conceptually ingested.
* `Negative scope`: ingests approved specs only; does not ingest unapproved sources; does not alter specs; does not decide scope; does not authorize execution.
* `Governance risks`: ingesting an unapproved or out-of-scope spec; altering spec content during conceptual translation.
* `Evidence expected`: a documentary record naming the approved spec conceptually ingested.
* `Reason this is not an executable adapter`: it is a conceptual description only; no executable ingestion exists, so it reads nothing at runtime.

## 15. Adapter-To-Executor Boundary

The adapter is translation between institutional capability and a hypothetical executor. The executor is replaceable; no executor is privileged. The adapter does not become the executor and does not become the authority. No executor is created, configured, or bound by this document. Each adapter-to-executor relationship described here is conceptual and documentary only.

## 16. Adapter-To-Skill Boundary

The skill is institutional capability; the adapter translates that capability toward an executor. The adapter does not extend, alter, or replace the skill. The adapter does not become a skill. The five institutional skills remain documentary, institutional, and executor-agnostic, and none is altered by this document.

## 17. Adapter-To-Subagent Boundary

The adapter is not a subagent. A candidate documentary subagent role describes a conceptual capability holder; a candidate documentary adapter role describes a conceptual translation toward an executor. Neither is created. No adapter is described as containing, invoking, or orchestrating a subagent, because neither adapters nor subagents are created.

## 18. Governance Boundary Matrix

| Candidate Adapter Role | Decides Scope | Authorizes Execution | Alters Specs | Creates Artifacts | Substitutes Human Authorization | Is Subagent/Runner/Command | Replaceable Executor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `claude-code-adapter` | no | no | no | no | no | no | yes |
| `codex-adapter` | no | no | no | no | no | no | yes |
| `human-review-adapter` | no | no | no | no | no | no | yes |
| `evidence-log-adapter` | no | no | no | no | no | no | yes |
| `spec-ingestion-adapter` | no | no | no | no | no | no | yes |

Spec is authority; no adapter becomes the authority. Institutional skill is capability; no adapter becomes a skill. Adapter is translation; no adapter governs. Executor is replaceable; no adapter is a privileged executor.

## 19. Evidence Expectations

For any future authorized action derived from these documentary specifications, evidence would be expected to record:

* which institutional skill intent was conceptually translated;
* the hypothetical executor target of the translation;
* whether the translation stayed within the adapter's negative scope;
* whether any governance violation was detected;
* the complete evidence record of the action;
* the exact human authorization phrase, if any was required.

No evidence is produced for technical execution in Task 123, because no technical execution occurs in Task 123.

## 20. Forbidden Artifacts

Task 123 must not create, propose as ready, scaffold, or implement:

* `.claude/`
* `.claude/agents`
* `.claude/commands`
* real adapter files
* real adapters
* real subagent files
* real subagents
* real commands
* runners
* YAML
* JSON
* machine-readable contracts
* code
* APIs
* schemas
* frontend
* migrations
* backlog
* sprint plan
* roadmap
* implementation plan
* technical execution plan
* adapter registry
* subagent registry
* command registry
* runner registry

## 21. Explicit Non-Creation Confirmation

* No `.claude/` directory was created.
* No `.claude/agents` directory was created.
* No `.claude/commands` directory was created.
* No real adapter file was created.
* No real adapter was created.
* No real subagent file or subagent was created.
* No real command was created.
* No runner was created.
* No registry was created.
* No YAML, JSON, or machine-readable contract was created.
* No code, API, schema, frontend, or migration was created.
* No backlog, sprint plan, roadmap, implementation plan, or technical execution plan was created.
* The candidate role names were not transformed into their own files, YAML, JSON, registry, or machine-readable contracts.
* No file was created or altered inside `/docs/specs/skills/`.

## 22. Risks And Governance Violations

A governance violation occurs if:

* any candidate adapter role is created as a file, directory, registry, or configuration;
* `.claude/`, `.claude/agents`, or `.claude/commands` is created;
* any real adapter, subagent, command, runner, or registry is created;
* any YAML, JSON, or machine-readable contract is created;
* any code, API, schema, frontend, or migration is created;
* any candidate adapter role in this document is treated as an executable adapter;
* an adapter is treated as the authority, as deciding scope, or as authorizing execution;
* an insufficient phrase is interpreted as authorization;
* these specifications are interpreted as execution permission or as automatic authorization to create adapters;
* technical implementation advances beyond `0%`.

If any such condition is detected, the `detect-governance-violation` institutional skill applies, the action must be halted, and the violation must be recorded through the `write-evidence-record` institutional skill before any further step.

## 23. Future Task Gate

Task 123 does not authorize Task 124 automatically. Any next task requires new explicit human authorization.

No more specific documentary design, and no implementation, may begin without that new explicit human authorization. The following phrases remain insufficient as technical authorization: "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", "continue".

## 24. Evidence Record

* Exactly one document was created by this task: this document.
* The only other file modified by this task is the index `/docs/specs/execution-readiness/first-execution-task-package-index.md`.
* No file was created or altered inside `/docs/specs/skills/` by this task.
* No existing skill was altered by this task.
* No additional skill was created by this task.
* No adapter was created by this task.
* No subagent, command, runner, or registry was created by this task.
* No `.claude/` directory was created by this task.
* No YAML, JSON, or machine-readable contract was created by this task.
* Technical implementation remains at `0%`.
* No technical execution was initiated by this task.
* No next task was automatically authorized by this task.

## 25. Final Readiness Statement

`TASK_123_CANDIDATE_ADAPTER_ROLE_SPECIFICATIONS_DOCUMENTARY_ONLY`
