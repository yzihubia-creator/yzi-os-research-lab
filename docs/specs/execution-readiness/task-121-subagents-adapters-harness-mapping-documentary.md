# Task 121 — Subagents / Adapters / Harness Mapping Phase — Documentary Only

## 1. Task Title

Task 121 — Subagents / Adapters / Harness Mapping Phase, documentary only.

This document is documentary only. It produces a conceptual mapping between approved institutional skills, candidate subagent roles, candidate adapter roles, and conceptual harness responsibilities. It does not implement anything, does not create code, does not create `.claude/`, does not create real adapters, does not create real subagents, does not create real commands, does not create runners, does not create YAML, JSON, or machine-readable contracts, and does not initiate technical execution.

## 2. Authorized Input State

* Task 120 completed documentarily with readiness statement `TASK_120_HUMAN_AUTHORIZATION_GATE_PREPARED_DOCUMENTARY_ONLY`.
* The required human authorization phrase was provided: `I AUTHORIZE TASK 121 TO START THE SUBAGENTS / ADAPTERS / HARNESS MAPPING PHASE DOCUMENTARILY ONLY.`
* The prior `Institutional Skills Foundation Phase` remains closed documentary only.
* Technical implementation remains at `0%`.
* No technical execution has been initiated.

## 3. Nature Of This Document

This document opens the `Subagents / Adapters / Harness Mapping Phase` documentarily only. It is a conceptual mapping document. Every role, mapping, and responsibility described here is a documentary draft only. No item described here is an executable artifact. No authorization for technical execution is granted by this document.

## 4. Preserved Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## 5. Scope Of The Phase

This phase maps, conceptually and documentarily only:

* the relationship between approved institutional skills and candidate subagent roles;
* the relationship between approved institutional skills and candidate adapter roles;
* the conceptual responsibilities of a harness;
* the governance boundaries that must be preserved across all of the above.

## 6. Phase Status

`SUBAGENTS_ADAPTERS_HARNESS_MAPPING_PHASE_OPEN_DOCUMENTARY_ONLY`

This phase is open documentary only. It does not advance to specific documentary design, and it does not advance to any implementation, without new explicit human authorization.

## 7. Implementation Status

`0%`

No technical artifact exists. No `.claude/` directory exists. No adapter exists. No subagent exists. No command exists. No runner exists. No machine-readable contract exists.

## 8. Approved Institutional Skills

The five consolidated institutional skills, documentary and executor-agnostic, in conceptual execution order:

1. `read-approved-specs`
2. `validate-scope-boundaries`
3. `inspect-authorized-paths`
4. `detect-governance-violation`
5. `write-evidence-record`

These skills are capability descriptions only. They are not subagents, not adapters, not commands, not runners, and not technical implementation.

## 9. Conceptual Harness Responsibilities

The following responsibilities are mapped conceptually only, with no implementation:

* reading approved specs;
* validating scope;
* inspecting authorized paths;
* detecting governance violations;
* recording evidence;
* preserving separation between spec, skill, adapter, and executor;
* preventing unauthorized technical execution;
* preserving implementation at `0%`.

A harness, conceptually, coordinates but does not govern. Persisted state is operational truth. Verification is separate from execution. Tool execution does not validate its own result.

## 10. Candidate Subagent Roles — Documentary Only

No subagent is being created. The following are documentary draft role names only, not executable artifacts. No subagent file is created. No `.claude/agents` directory is created. No subagent markdown is created outside this document.

### `spec-reader-subagent`

* Conceptual responsibility: read approved specs and surface their authoritative content.
* Related institutional skill: `read-approved-specs`.
* Negative limit: does not interpret beyond approved specs; does not authorize execution; does not write outside authorized paths.
* Expected evidence: a record of which approved spec was read and what authoritative content was surfaced.
* Governance risk: reading or surfacing an unapproved or out-of-scope spec.

### `scope-validator-subagent`

* Conceptual responsibility: validate that a proposed action stays inside approved scope boundaries.
* Related institutional skill: `validate-scope-boundaries`.
* Negative limit: does not expand scope; does not grant authorization; does not implement.
* Expected evidence: a record of the scope decision and the boundaries checked.
* Governance risk: silently widening scope or approving an out-of-scope action.

### `path-inspector-subagent`

* Conceptual responsibility: inspect authorized paths, permitted artifacts, and forbidden files.
* Related institutional skill: `inspect-authorized-paths`.
* Negative limit: does not create files; does not modify paths; does not authorize new paths.
* Expected evidence: a record of inspected paths and the permitted/forbidden classification.
* Governance risk: treating a forbidden path as authorized.

### `governance-violation-detector-subagent`

* Conceptual responsibility: detect governance, scope, authorization, or artifact violations.
* Related institutional skill: `detect-governance-violation`.
* Negative limit: does not remediate by implementing; does not authorize continuation; halts on detection.
* Expected evidence: a record of detected violations and the halt decision.
* Governance risk: failing to detect a violation or interpreting an insufficient phrase as authorization.

### `evidence-recorder-subagent`

* Conceptual responsibility: record evidence after authorized actions.
* Related institutional skill: `write-evidence-record`.
* Negative limit: does not perform actions; does not authorize actions; only records.
* Expected evidence: a complete evidence record of the authorized action.
* Governance risk: recording incomplete, inaccurate, or fabricated evidence.

## 11. Candidate Adapter Roles — Documentary Only

No adapter is being created. The following are documentary draft role names only, not executable artifacts. No adapter file is created. No YAML is created. No JSON is created. No machine-readable contract is created. No registry is created. No executable configuration is created.

### `claude-code-adapter`

* Conceptual function: translate institutional skill intent into Claude Code executor actions.
* Hypothetical target executor: Claude Code.
* Related institutional skill: all five, as translation only.
* Negative limit: does not become the authority; does not govern; is replaceable.
* Expected evidence: a record of the translation performed for a given skill intent.
* Governance risk: the adapter assuming authority instead of translating.

### `codex-adapter`

* Conceptual function: translate institutional skill intent into Codex executor actions.
* Hypothetical target executor: Codex.
* Related institutional skill: all five, as translation only.
* Negative limit: Codex is a bounded executor, not the architect; does not reopen foundation.
* Expected evidence: a record of the translation performed for a given skill intent.
* Governance risk: Codex acting as architect or implementing without explicit authorization.

### `human-review-adapter`

* Conceptual function: translate a required human review into a structured decision point.
* Hypothetical target executor: human operator.
* Related institutional skill: `validate-scope-boundaries`, `detect-governance-violation`.
* Negative limit: does not substitute human judgment; does not auto-approve.
* Expected evidence: a record of the human decision and the exact authorization phrase, if any.
* Governance risk: interpreting an insufficient phrase as authorization.

### `evidence-log-adapter`

* Conceptual function: translate evidence records into a persisted evidence log.
* Hypothetical target executor: an evidence store.
* Related institutional skill: `write-evidence-record`.
* Negative limit: does not alter recorded evidence; append-only conceptually.
* Expected evidence: a persisted, immutable evidence entry.
* Governance risk: mutating or losing evidence.

### `spec-ingestion-adapter`

* Conceptual function: translate approved specs into a readable form for institutional skills.
* Hypothetical target executor: a spec source.
* Related institutional skill: `read-approved-specs`, `inspect-authorized-paths`.
* Negative limit: ingests approved specs only; does not ingest unapproved sources.
* Expected evidence: a record of which approved spec was ingested.
* Governance risk: ingesting an unapproved or out-of-scope spec.

## 12. Skill-To-Subagent Conceptual Mapping

| Institutional Skill | Candidate Subagent Role (documentary) |
| --- | --- |
| `read-approved-specs` | `spec-reader-subagent` |
| `validate-scope-boundaries` | `scope-validator-subagent` |
| `inspect-authorized-paths` | `path-inspector-subagent` |
| `detect-governance-violation` | `governance-violation-detector-subagent` |
| `write-evidence-record` | `evidence-recorder-subagent` |

This mapping is conceptual and documentary only. No subagent is created by this mapping.

## 13. Skill-To-Adapter Conceptual Mapping

| Institutional Skill | Related Candidate Adapter Role (documentary) |
| --- | --- |
| `read-approved-specs` | `spec-ingestion-adapter`, `claude-code-adapter`, `codex-adapter` |
| `validate-scope-boundaries` | `human-review-adapter`, `claude-code-adapter`, `codex-adapter` |
| `inspect-authorized-paths` | `spec-ingestion-adapter`, `claude-code-adapter`, `codex-adapter` |
| `detect-governance-violation` | `human-review-adapter`, `claude-code-adapter`, `codex-adapter` |
| `write-evidence-record` | `evidence-log-adapter`, `claude-code-adapter`, `codex-adapter` |

This mapping is conceptual and documentary only. No adapter is created by this mapping. The adapter is translation only; the executor is replaceable.

## 14. Harness Responsibility Mapping

| Conceptual Harness Responsibility | Related Institutional Skill |
| --- | --- |
| Reading approved specs | `read-approved-specs` |
| Validating scope | `validate-scope-boundaries` |
| Inspecting authorized paths | `inspect-authorized-paths` |
| Detecting governance violations | `detect-governance-violation` |
| Recording evidence | `write-evidence-record` |
| Separating spec, skill, adapter, executor | all five |
| Preventing unauthorized technical execution | `validate-scope-boundaries`, `detect-governance-violation` |
| Preserving implementation at 0% | `detect-governance-violation`, `write-evidence-record` |

This mapping is conceptual and documentary only. No harness is created by this mapping.

## 15. Governance Boundary Mapping

* Spec is authority; the subagent and adapter roles never become the authority.
* Institutional skill is capability; it is not an executable artifact.
* Adapter is translation; it never governs.
* Executor is replaceable; no executor is privileged.
* Codex is a bounded executor, not the architect; it must not reopen P0–P4 and must not implement without explicit authorization.
* Prompt is metadata, not authority; the LLM has no operational authority.
* Runtime coordinates but does not govern; persisted state is operational truth.
* Tenant boundary is inviolable.
* Verification is separate from execution; tool execution does not validate its own result.

## 16. Evidence Requirements

For any future authorized action derived from this mapping, evidence must record:

* which approved spec was read;
* which scope boundaries were validated;
* which authorized paths were inspected;
* whether any governance violation was detected;
* the complete evidence record of the action;
* the exact human authorization phrase, if any was required.

No evidence is produced for technical execution in Task 121, because no technical execution occurs in Task 121.

## 17. Forbidden Artifacts

Task 121 must not create, propose as ready, scaffold, or implement:

* `.claude/`
* `.claude/agents`
* `.claude/commands`
* real adapters
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

## 18. Explicit Non-Creation Confirmation

* No `.claude/` directory was created.
* No `.claude/agents` directory was created.
* No `.claude/commands` directory was created.
* No real adapter was created.
* No real subagent was created.
* No real command was created.
* No runner was created.
* No YAML, JSON, or machine-readable contract was created.
* No code, API, schema, frontend, or migration was created.
* No backlog, sprint plan, roadmap, implementation plan, or technical execution plan was created.
* No adapter, subagent, command, or runner registry was created.
* No subagent markdown was created outside this document.
* No file was created or altered inside `/docs/specs/skills/`.

## 19. Risks And Governance Violations

A governance violation occurs if:

* any subagent, adapter, command, runner, or registry is created;
* `.claude/`, `.claude/agents`, or `.claude/commands` is created;
* any YAML, JSON, or machine-readable contract is created;
* any code, API, schema, frontend, or migration is created;
* any candidate role in this document is treated as an executable artifact;
* an adapter is treated as the authority instead of translation;
* a subagent is treated as the architect instead of a bounded executor;
* an insufficient phrase is interpreted as authorization;
* this mapping is interpreted as execution permission;
* technical implementation advances beyond `0%`.

If any such condition is detected, the `detect-governance-violation` institutional skill applies, the action must be halted, and the violation must be recorded through the `write-evidence-record` institutional skill before any further step.

## 20. Future Task Gate

This document does not authorize any next task automatically. Task 121 does not authorize Task 122.

Any next task may advance to more specific documentary design only if there is new explicit human authorization. No more specific documentary design, and no implementation, may begin without that new explicit human authorization.

The following phrases remain insufficient as technical authorization: "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", "continue".

## 21. Evidence Record

* Exactly one document was created by this task: this document.
* The only other file modified by this task is the index `/docs/specs/execution-readiness/first-execution-task-package-index.md`.
* No file was created or altered inside `/docs/specs/skills/` by this task.
* No existing skill was altered by this task.
* No additional skill was created by this task.
* No technical artifact was created by this task.
* No `.claude/`, adapter, subagent, command, or runner was created by this task.
* No YAML, JSON, or machine-readable contract was created by this task.
* Technical implementation remains at `0%`.
* No technical execution was initiated by this task.
* No next task was automatically authorized by this task.

## 22. Final Readiness Statement

`TASK_121_SUBAGENTS_ADAPTERS_HARNESS_MAPPING_DOCUMENTARY_ONLY`
