# Codex Controlled Task Template

## 1. Purpose

This template governs future controlled Codex tasks in the YZI OS. It is a human governance mold for preparing, authorizing, constraining, and validating a future Codex execution task.

This template is documentary only. It does not authorize implementation, create an executable task, define a stack, change architecture, or replace any approved P0P4 source document.

## 2. Usage Rule

No Codex task may be executed without explicit human authorization and without this template being filled for that specific task.

An incomplete template blocks execution. A filled template still requires explicit human authorization before Codex may create or alter any artifact.

## 3. Task Metadata

- Task ID:
- Task Title:
- Task Type:
- Authorization Status:
- Requested By:
- Date:
- Execution Mode:

## 4. Scope

- Objective:
- Non-objective:
- Expected Output:
- Explicitly Out of Scope:

## 5. Source of Truth

- Primary Source Documents:
- Supporting Source Documents:
- Forbidden Sources:
- Notes:

## 6. Governing Specs

- P0 Specs:
- P1 Specs:
- P2 Specs:
- P3 Specs:
- P4 Specs:
- Other Governing Documents:

## 7. Authorized Paths

- Read-only paths:
- Writable paths:
- Forbidden paths:

## 8. Allowed Artifacts

- Artifact:
- Path:
- Purpose:
- Human authorization reference:
- Constraints:

## 9. Forbidden Artifacts

The future task must explicitly confirm which artifacts are forbidden. At minimum, the following are forbidden unless a future task gives explicit human authorization for that exact artifact:

- code
- API
- schema
- frontend
- migrations
- YAML
- JSON
- backlog
- sprint plan
- machine-readable contract
- architecture changes
- approved spec edits

## 10. Permanent Guardrails

- Codex is not the architect of the foundation.
- Codex must not reopen P0P4.
- Codex must not implement without explicit authorization.
- Prompt is Metadata, not Authority.
- LLM has no operational authority.
- Runtime coordinates, but does not govern.
- Persisted state is operational truth.
- Tenant boundary is inviolable.
- Verification is separate from execution.
- Tool execution does not validate its own result.
- Codex must read the governing specs before acting.
- Codex must declare which specs govern the task.
- Codex must stop if the request conflicts with approved specs.
- Codex must stop if scope, tenant boundary, authority, evidence, permission, trace, or verification is missing when applicable.
- Codex must not infer technical stack.
- Codex must not transform documentary preparation into automatic implementation.
- Codex must preserve deterministic policy enforcement.
- Codex must preserve auditability and evidence requirements.
- Codex must report created, changed, and out-of-scope files at the end of the task.

## 11. Execution Instructions

- Required pre-read documents:
- Governing invariants to preserve:
- Authorized actions:
- Prohibited actions:
- Required stop conditions:
- Required evidence to collect:
- Required verification method:
- Required final report format:
- Human review point:

## 12. Acceptance Criteria

- [ ] Task ID, title, type, and authorization status are filled.
- [ ] Objective and non-objective are explicit.
- [ ] Source of truth documents are listed.
- [ ] Governing specs are listed by phase.
- [ ] Read-only, writable, and forbidden paths are explicit.
- [ ] Allowed artifacts are explicit.
- [ ] Forbidden artifacts are explicit.
- [ ] Permanent guardrails are preserved.
- [ ] Execution instructions are bounded and unambiguous.
- [ ] Expected checkpoint is defined.
- [ ] Final Codex response format is defined.
- [ ] Human validation requirement is explicit.

## 13. Rejection Criteria

- [ ] The task lacks explicit human authorization.
- [ ] The task omits governing specs.
- [ ] The task omits authorized paths.
- [ ] The task permits artifacts outside the authorized scope.
- [ ] The task creates or alters code without explicit authorization.
- [ ] The task creates or alters API, schema, frontend, or migrations without explicit authorization.
- [ ] The task creates YAML, JSON, backlog, sprint plan, or machine-readable contract without explicit authorization.
- [ ] The task changes approved specs.
- [ ] The task reopens P0P4.
- [ ] The task infers technical stack.
- [ ] The task treats Codex as architect of the foundation.
- [ ] The task omits checkpoint or human validation requirements.

## 14. Expected Checkpoint

- Checkpoint file expected:
- Human validation required:
- Next task blocked until validation:

## 15. Final Response Required From Codex

1. File created or changed:
2. Files changed outside authorized scope:
3. Final task status:
4. Checkpoint produced:
5. Human validation required before next step:
