# Task 122 — Candidate Subagent Role Specifications — Documentary Only

## 1. Task Title

Task 122 — Candidate Subagent Role Specifications, documentary only.

This document describes, documentarily only, the candidate subagent roles identified in Task 121. It produces conceptual, non-executable specifications for candidate subagent roles. It does not describe created subagents. It does not authorize future automatic creation. The candidate role names remain documentary drafts only.

## 2. Current Readiness Statement

`TASK_121_SUBAGENTS_ADAPTERS_HARNESS_MAPPING_DOCUMENTARY_ONLY`

## 3. Implementation Status

`0%`

No technical artifact exists. No `.claude/` directory exists. No `.claude/agents` directory exists. No subagent file exists. No adapter exists. No command exists. No runner exists. No registry exists. No machine-readable contract exists.

## 4. Human Authorization Source

This task exists only because of explicit human authorization in the present instruction:

`EU AUTORIZO A TASK 122 PARA DETALHAR DOCUMENTALMENTE OS CANDIDATE SUBAGENT ROLE SPECIFICATIONS, SEM EXECUÇÃO TÉCNICA.`

No prior task, readiness statement, or checkpoint authorized this task automatically. Task 121 did not authorize Task 122 automatically.

## 5. Purpose

The purpose of this task is to describe, documentarily only, the candidate subagent roles mapped in Task 121, so that each role's conceptual responsibility, related institutional skill, documentary inputs and outputs, negative scope, governance risks, and evidence expectations are delimited. This task only describes, registers, maps, and delimits candidate documentary roles. It does not create subagents.

## 6. Non-Execution Boundary

This document describes candidate documentary roles only. No role described here is an executable subagent. No role described here is created as a file, directory, or configuration. No technical execution is initiated by this document. The act of describing a candidate role must never be interpreted as creating it or as authorizing its creation.

## 7. Institutional Principle

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## 8. Source Mapping From Task 121

Task 121 mapped the following candidate subagent roles to institutional skills, documentarily only:

| Institutional Skill | Candidate Subagent Role (documentary) |
| --- | --- |
| `read-approved-specs` | `spec-reader-subagent` |
| `validate-scope-boundaries` | `scope-validator-subagent` |
| `inspect-authorized-paths` | `path-inspector-subagent` |
| `detect-governance-violation` | `governance-violation-detector-subagent` |
| `write-evidence-record` | `evidence-recorder-subagent` |

Conceptual order of the institutional skills is preserved:

1. `read-approved-specs`
2. `validate-scope-boundaries`
3. `inspect-authorized-paths`
4. `detect-governance-violation`
5. `write-evidence-record`

## 9. Candidate Subagent Role Specification Method

Each candidate documentary role is described using only the following documentary fields:

* `Role name`
* `Documentary status`
* `Related institutional skill`
* `Conceptual responsibility`
* `Allowed documentary input`
* `Expected documentary output`
* `Negative scope`
* `Governance risks`
* `Evidence expected`
* `Reason this is not an executable subagent`

The descriptions use documentary and institutional language only. They do not use implementation language. They describe and delimit; they do not execute.

## 10. spec-reader-subagent — Documentary Specification

* `Role name`: `spec-reader-subagent`
* `Documentary status`: candidate documentary role only; not created; not a file; not executable.
* `Related institutional skill`: `read-approved-specs`.
* `Conceptual responsibility`: describe how an approved spec would be read and how its authoritative content would be surfaced.
* `Allowed documentary input`: approved specs only, referenced by their authorized paths.
* `Expected documentary output`: a documentary record of which approved spec was read and what authoritative content was surfaced.
* `Negative scope`: does not interpret beyond approved specs; does not authorize execution; does not write outside authorized paths; does not ingest unapproved sources.
* `Governance risks`: reading or surfacing an unapproved or out-of-scope spec; treating surfaced content as authorization.
* `Evidence expected`: a documentary record naming the approved spec read and the authoritative content surfaced.
* `Reason this is not an executable subagent`: it is a conceptual description only; no file, directory, or configuration is created, so nothing can run.

## 11. scope-validator-subagent — Documentary Specification

* `Role name`: `scope-validator-subagent`
* `Documentary status`: candidate documentary role only; not created; not a file; not executable.
* `Related institutional skill`: `validate-scope-boundaries`.
* `Conceptual responsibility`: describe how a proposed action would be checked against approved scope boundaries.
* `Allowed documentary input`: a proposed action description and the approved scope boundaries.
* `Expected documentary output`: a documentary record of the scope decision and the boundaries checked.
* `Negative scope`: does not expand scope; does not grant authorization; does not implement; does not approve out-of-scope actions.
* `Governance risks`: silently widening scope; approving an out-of-scope action; treating a scope check as authorization to execute.
* `Evidence expected`: a documentary record of the scope decision, the boundaries checked, and the in-scope or out-of-scope conclusion.
* `Reason this is not an executable subagent`: it is a conceptual description only; no executable artifact is produced, so it cannot validate anything at runtime.

## 12. path-inspector-subagent — Documentary Specification

* `Role name`: `path-inspector-subagent`
* `Documentary status`: candidate documentary role only; not created; not a file; not executable.
* `Related institutional skill`: `inspect-authorized-paths`.
* `Conceptual responsibility`: describe how authorized paths, permitted artifacts, and forbidden files would be inspected and classified.
* `Allowed documentary input`: a set of paths and the authorized-path and forbidden-artifact definitions.
* `Expected documentary output`: a documentary record of inspected paths with their permitted or forbidden classification.
* `Negative scope`: does not create files; does not modify paths; does not authorize new paths; does not reclassify forbidden paths as authorized.
* `Governance risks`: treating a forbidden path as authorized; overlooking a forbidden artifact.
* `Evidence expected`: a documentary record listing inspected paths and their classification.
* `Reason this is not an executable subagent`: it is a conceptual description only; no file or configuration exists to perform inspection.

## 13. governance-violation-detector-subagent — Documentary Specification

* `Role name`: `governance-violation-detector-subagent`
* `Documentary status`: candidate documentary role only; not created; not a file; not executable.
* `Related institutional skill`: `detect-governance-violation`.
* `Conceptual responsibility`: describe how governance, scope, authorization, or artifact violations would be detected and how a halt decision would be recorded.
* `Allowed documentary input`: a proposed or observed action and the governance, scope, and authorization rules.
* `Expected documentary output`: a documentary record of detected violations and the halt decision.
* `Negative scope`: does not remediate by implementing; does not authorize continuation; halts on detection; does not interpret insufficient phrases as authorization.
* `Governance risks`: failing to detect a violation; interpreting an insufficient phrase as authorization; allowing technical implementation to advance beyond `0%`.
* `Evidence expected`: a documentary record of detected violations, the rule breached, and the halt decision.
* `Reason this is not an executable subagent`: it is a conceptual description only; no executable detector exists, so it observes nothing at runtime.

## 14. evidence-recorder-subagent — Documentary Specification

* `Role name`: `evidence-recorder-subagent`
* `Documentary status`: candidate documentary role only; not created; not a file; not executable.
* `Related institutional skill`: `write-evidence-record`.
* `Conceptual responsibility`: describe how evidence would be recorded after an authorized action.
* `Allowed documentary input`: the details of an authorized action and its outcome.
* `Expected documentary output`: a complete documentary evidence record of the authorized action.
* `Negative scope`: does not perform actions; does not authorize actions; only records; does not alter prior evidence.
* `Governance risks`: recording incomplete, inaccurate, or fabricated evidence; mutating prior evidence.
* `Evidence expected`: a complete and accurate documentary evidence record.
* `Reason this is not an executable subagent`: it is a conceptual description only; no executable recorder exists, so it writes nothing at runtime.

## 15. Cross-Role Interaction Boundaries

The candidate documentary roles are described as conceptually ordered, following the institutional skill order:

1. `spec-reader-subagent` (reads approved specs);
2. `scope-validator-subagent` (validates scope of a proposed action);
3. `path-inspector-subagent` (inspects authorized paths);
4. `governance-violation-detector-subagent` (detects violations and halts);
5. `evidence-recorder-subagent` (records evidence).

These interactions are conceptual and documentary only. No role calls, triggers, or executes another role, because no role is created. No orchestration, pipeline, runner, or registry is described as ready or created. Each role is a description only.

## 16. Governance Boundary Matrix

| Candidate Documentary Role | Authority | Capability | Translation | Executor | Boundary Preserved |
| --- | --- | --- | --- | --- | --- |
| `spec-reader-subagent` | spec only | `read-approved-specs` | none | replaceable | does not become authority |
| `scope-validator-subagent` | spec only | `validate-scope-boundaries` | none | replaceable | does not grant authorization |
| `path-inspector-subagent` | spec only | `inspect-authorized-paths` | none | replaceable | does not authorize new paths |
| `governance-violation-detector-subagent` | spec only | `detect-governance-violation` | none | replaceable | halts; does not authorize continuation |
| `evidence-recorder-subagent` | spec only | `write-evidence-record` | none | replaceable | records only; does not act |

Spec is authority; no role becomes the authority. Institutional skill is capability; no role is an executable artifact. Adapter is translation; no role is an adapter. Executor is replaceable; no role is a privileged executor.

## 17. Evidence Expectations

For any future authorized action derived from these documentary specifications, evidence would be expected to record:

* which approved spec was read;
* which scope boundaries were validated and the conclusion;
* which authorized paths were inspected and their classification;
* whether any governance violation was detected and the halt decision;
* the complete evidence record of the action;
* the exact human authorization phrase, if any was required.

No evidence is produced for technical execution in Task 122, because no technical execution occurs in Task 122.

## 18. Forbidden Artifacts

Task 122 must not create, propose as ready, scaffold, or implement:

* `.claude/`
* `.claude/agents`
* `.claude/commands`
* real subagent files
* real adapters
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

## 19. Explicit Non-Creation Confirmation

* No `.claude/` directory was created.
* No `.claude/agents` directory was created.
* No `.claude/commands` directory was created.
* No real subagent file was created.
* No real adapter was created.
* No real command was created.
* No runner was created.
* No registry was created.
* No YAML, JSON, or machine-readable contract was created.
* No code, API, schema, frontend, or migration was created.
* No backlog, sprint plan, roadmap, implementation plan, or technical execution plan was created.
* The candidate role names were not transformed into their own files.
* No file was created or altered inside `/docs/specs/skills/`.

## 20. Risks And Governance Violations

A governance violation occurs if:

* any candidate role is created as a file, directory, or configuration;
* `.claude/`, `.claude/agents`, or `.claude/commands` is created;
* any real subagent, adapter, command, runner, or registry is created;
* any YAML, JSON, or machine-readable contract is created;
* any code, API, schema, frontend, or migration is created;
* any candidate role in this document is treated as an executable subagent;
* an insufficient phrase is interpreted as authorization;
* these specifications are interpreted as execution permission or as automatic authorization to create subagents;
* technical implementation advances beyond `0%`.

If any such condition is detected, the `detect-governance-violation` institutional skill applies, the action must be halted, and the violation must be recorded through the `write-evidence-record` institutional skill before any further step.

## 21. Future Task Gate

Task 122 does not authorize Task 123 automatically. Any next task requires new explicit human authorization.

No more specific documentary design, and no implementation, may begin without that new explicit human authorization. The following phrases remain insufficient as technical authorization: "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", "continue".

## 22. Evidence Record

* Exactly one document was created by this task: this document.
* The only other file modified by this task is the index `/docs/specs/execution-readiness/first-execution-task-package-index.md`.
* No file was created or altered inside `/docs/specs/skills/` by this task.
* No existing skill was altered by this task.
* No additional skill was created by this task.
* No subagent was created by this task.
* No `.claude/`, adapter, command, runner, or registry was created by this task.
* No YAML, JSON, or machine-readable contract was created by this task.
* Technical implementation remains at `0%`.
* No technical execution was initiated by this task.
* No next task was automatically authorized by this task.

## 23. Final Readiness Statement

`TASK_122_CANDIDATE_SUBAGENT_ROLE_SPECIFICATIONS_DOCUMENTARY_ONLY`
