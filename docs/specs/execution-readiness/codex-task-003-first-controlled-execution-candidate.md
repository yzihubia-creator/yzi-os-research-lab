# Codex Task 003  First Controlled Execution Candidate

## 1. Purpose

This document is only a draft of a candidate controlled Codex task for the YZI OS. It uses the official controlled task template created in Task 002 and prepares a future candidate task named "Create First Execution Task Package Index".

This draft does not authorize execution, does not create the future index, does not implement anything, and does not change the approved P0P4 foundation.

## 2. Usage Rule

The candidate task described here cannot be executed without explicit human approval. The authorization status is `DRAFT_REQUIRES_HUMAN_APPROVAL`, and no future artifact may be created from this draft until a human operator validates and authorizes the next task.

## 3. Task Metadata

- Task ID: TASK-004-CANDIDATE
- Task Title: Create First Execution Task Package Index
- Task Type: Documentary Preparation
- Authorization Status: DRAFT_REQUIRES_HUMAN_APPROVAL
- Requested By: Human Operator
- Date: 2026-06-06
- Execution Mode: Human-review-only draft

## 4. Scope

- Objective: In a future approved task, create a human-readable documentary index of controlled execution task packages.
- Non-objective: Do not implement code, API, schema, frontend, or stack.
- Expected Output: One future Markdown document, if and only if the candidate task is approved.
- Explicitly Out of Scope: Implementation, new architecture, backlog, sprint planning, YAML, JSON, and machine-readable contracts.

## 5. Source of Truth

- Primary Source Documents:
  - `/docs/specs/execution-readiness/codex-task-001-readiness-audit.md`
  - `/docs/specs/execution-readiness/codex-controlled-task-template.md`
  - `/docs/specs/execution-handoff/codex-execution-handoff-pack.md`
  - `/docs/specs/specs-p0-p2-checkpoint.md`
  - `/docs/specs/specs-p0-p3-checkpoint.md`
  - `/docs/specs/p4/p4-checkpoint.md`
- Supporting Source Documents:
  - Canonical P0 documents mapped in Task 001.
  - Canonical P1 documents mapped in Task 001.
  - Canonical P2 documents mapped in Task 001.
  - Canonical P3 documents mapped in Task 001.
  - Canonical P4 documents mapped in Task 001.
- Forbidden Sources:
  - Any source outside `/docs`.
  - Any inferred technical stack.
  - Any implementation assumption not supported by approved documents.
- Notes:
  - Task 001 states `READY_FOR_CONTROLLED_EXECUTION_TASK`.
  - This document remains a draft and does not itself authorize Task 004 execution.

## 6. Governing Specs

- P0 Specs:
  - `/docs/specs/p0/core-operational-principles.spec.md`
  - `/docs/specs/p0/layer-authority-model.spec.md`
  - `/docs/specs/p0/conflict-resolution.spec.md`
  - `/docs/specs/p0/tenant-boundary.spec.md`
- P1 Specs:
  - `/docs/specs/p1/operational-state.spec.md`
  - `/docs/specs/p1/event-driven-state.spec.md`
  - `/docs/specs/p1/tenant-state-isolation.spec.md`
  - `/docs/specs/p1/memory-model.spec.md`
- P2 Specs:
  - `/docs/specs/p2/policy-enforcement.spec.md`
  - `/docs/specs/p2/behavioral-governance.spec.md`
  - `/docs/specs/p2/operational-boundaries.spec.md`
  - `/docs/specs/p2/escalation-policy.spec.md`
  - `/docs/specs/p2/context-assembly.spec.md`
  - `/docs/specs/p2/context-lifecycle.spec.md`
  - `/docs/specs/p2/context-isolation.spec.md`
  - `/docs/specs/p2/context-provenance.spec.md`
  - `/docs/specs/p2/retrieval-governance.spec.md`
  - `/docs/specs/p2/tenant-configuration.spec.md`
  - `/docs/specs/p2/tenant-policy-pack.spec.md`
  - `/docs/specs/p2/tenant-retrieval-scope.spec.md`
- P3 Specs:
  - `/docs/specs/p3/episode-trace.spec.md`
  - `/docs/specs/p3/audit-log.spec.md`
  - `/docs/specs/p3/intervention-log.spec.md`
  - `/docs/specs/p3/verification-report.spec.md`
  - `/docs/specs/p3/failure-attribution.spec.md`
  - `/docs/specs/p3/entropy-audit.spec.md`
  - `/docs/specs/p3/tool-registry.spec.md`
  - `/docs/specs/p3/tool-permission.spec.md`
  - `/docs/specs/p3/tool-execution.spec.md`
  - `/docs/specs/p3/tool-result-verification.spec.md`
  - `/docs/specs/p3/service-contract.spec.md`
- P4 Specs:
  - `/docs/specs/p4/p4-preparation-map.md`
  - `/docs/specs/p4/skills/intent-extraction-skill.spec.md`
  - `/docs/specs/p4/skills/context-assembly-skill.spec.md`
  - `/docs/specs/p4/skills/evidence-compilation-skill.spec.md`
  - `/docs/specs/p4/skills/provenance-tagging-skill.spec.md`
  - `/docs/specs/p4/skills/p4-minimum-skills-checkpoint.md`
  - `/docs/specs/p4/subagents/retrieval-subagent.spec.md`
  - `/docs/specs/p4/subagents/verification-subagent.spec.md`
  - `/docs/specs/p4/subagents/interface-subagent.spec.md`
  - `/docs/specs/p4/subagents/p4-minimum-subagents-checkpoint.md`
  - `/docs/specs/p4/harnesses/runtime-harness.spec.md`
  - `/docs/specs/p4/harnesses/governance-harness.spec.md`
  - `/docs/specs/p4/harnesses/observability-harness.spec.md`
  - `/docs/specs/p4/harnesses/tenant-harness.spec.md`
  - `/docs/specs/p4/harnesses/execution-harness.spec.md`
  - `/docs/specs/p4/harnesses/p4-minimum-harnesses-checkpoint.md`
  - `/docs/specs/p4/p4-checkpoint.md`
- Other Governing Documents:
  - `/docs/specs/execution-readiness/codex-task-001-readiness-audit.md`
  - `/docs/specs/execution-readiness/codex-controlled-task-template.md`
  - `/docs/specs/execution-handoff/codex-execution-handoff-pack.md`
  - `/docs/specs/specs-p0-p2-checkpoint.md`
  - `/docs/specs/specs-p0-p3-checkpoint.md`

## 7. Authorized Paths

- Read-only paths: `/docs`
- Writable paths: `/docs/specs/execution-readiness/`
- Forbidden paths: all other paths

## 8. Allowed Artifacts

- Proposed future artifact: `/docs/specs/execution-readiness/first-execution-task-package-index.md`
- Artifact type: Markdown documentary index.
- Purpose: Human-readable index of controlled execution task packages.
- Authorization status: Not authorized by this Task 003 draft.
- Constraint: This artifact must not be created during Task 003.

## 9. Forbidden Artifacts

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

- Future task status: Draft only; not authorized for execution.
- Future task objective: Create a human-readable package index only after explicit human approval.
- Required future pre-read documents:
  - `/docs/specs/execution-readiness/codex-task-001-readiness-audit.md`
  - `/docs/specs/execution-readiness/codex-controlled-task-template.md`
  - `/docs/specs/execution-handoff/codex-execution-handoff-pack.md`
  - `/docs/specs/specs-p0-p2-checkpoint.md`
  - `/docs/specs/specs-p0-p3-checkpoint.md`
  - `/docs/specs/p4/p4-checkpoint.md`
- Authorized future action, if approved: Create only `/docs/specs/execution-readiness/first-execution-task-package-index.md`.
- Prohibited future actions: Do not create code, API, schema, frontend, migrations, YAML, JSON, backlog, sprint plan, machine-readable contract, implementation plan, roadmap, architecture change, or approved spec edit.
- Required future stop conditions: Stop if human approval is absent, if authorized paths are ambiguous, if requested output exceeds a documentary index, or if any instruction conflicts with P0P4.
- Required future verification method: Confirm the single authorized Markdown artifact exists and confirm no file outside the approved path was created or altered.
- Human review point: Human validation is required before and after any future execution.

## 12. Acceptance Criteria

- [ ] The future task is explicitly approved by a human operator before execution.
- [ ] The future task creates only `/docs/specs/execution-readiness/first-execution-task-package-index.md`.
- [ ] The future output is a human-readable Markdown index only.
- [ ] The future output does not create code, API, schema, frontend, migrations, YAML, JSON, backlog, sprint plan, or machine-readable contract.
- [ ] The future output does not propose technical stack.
- [ ] The future output does not alter approved specs, checkpoints, the Execution Handoff Pack, Task 001, Task 002, or this Task 003 draft.
- [ ] The future output preserves the permanent guardrails.
- [ ] The future final response reports created or changed files and confirms whether human validation is required before the next step.

## 13. Rejection Criteria

- [ ] The future task is executed without explicit human approval.
- [ ] The future task creates the package index before authorization.
- [ ] The future task creates any file outside `/docs/specs/execution-readiness/`.
- [ ] The future task alters approved specs.
- [ ] The future task alters the Execution Handoff Pack.
- [ ] The future task alters Task 001, Task 002, or this Task 003 draft.
- [ ] The future task creates code, API, schema, frontend, migrations, YAML, JSON, backlog, sprint plan, roadmap, implementation plan, or machine-readable contract.
- [ ] The future task proposes technical stack.
- [ ] The future task reopens P0P4.
- [ ] The future task treats Codex as architect of the foundation.
- [ ] The future task authorizes another task without human validation.

## 14. Expected Checkpoint

- Checkpoint file expected: `/docs/specs/execution-readiness/first-execution-task-package-index.md`
- Human validation required: yes
- Next task blocked until validation: yes

## 15. Final Response Required From Codex

1. File created or changed:
2. Files changed outside authorized scope:
3. Final task status:
4. Checkpoint produced:
5. Human validation required before next step:
