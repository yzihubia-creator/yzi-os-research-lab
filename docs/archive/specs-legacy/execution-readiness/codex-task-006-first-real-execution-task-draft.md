# Codex Task 006  First Real Execution Task Draft

## 1. Purpose

This document is only a draft of the first real controlled execution task for the YZI OS. It prepares a future candidate task named "Create Execution Evidence Review Template".

This document does not authorize execution of the future real task, does not create the future evidence review template, does not implement anything, and does not change approved P0P4 decisions.

## 2. Usage Rule

The future real task cannot be executed without explicit human approval and without passing through the human validation checklist created in Task 005 at `/docs/specs/execution-readiness/human-validation-checklist-for-controlled-codex-tasks.md`.

## 3. Task Metadata

- Task ID: TASK-007-CANDIDATE
- Task Title: Create Execution Evidence Review Template
- Task Type: Documentary Execution Support
- Authorization Status: DRAFT_REQUIRES_HUMAN_APPROVAL
- Requested By: Human Operator
- Date: 2026-06-06
- Execution Mode: Human-review-only draft

## 4. Scope

- Objective: In a future approved task, create a human template for reviewing evidence from Codex execution.
- Non-objective: Do not implement code, API, schema, frontend, stack, backlog, sprint, or roadmap.
- Expected Output: One future Markdown document, if approved.
- Explicitly Out of Scope: Implementation, new architecture, backlog, sprint, roadmap, YAML, JSON, machine-readable contracts, and any approved spec changes.

## 5. Source of Truth

- `/docs/specs/execution-readiness/codex-task-001-readiness-audit.md`
- `/docs/specs/execution-readiness/codex-controlled-task-template.md`
- `/docs/specs/execution-readiness/codex-task-003-first-controlled-execution-candidate.md`
- `/docs/specs/execution-readiness/first-execution-task-package-index.md`
- `/docs/specs/execution-readiness/human-validation-checklist-for-controlled-codex-tasks.md`
- `/docs/specs/execution-handoff/codex-execution-handoff-pack.md`
- `/docs/specs/specs-p0-p2-checkpoint.md`
- `/docs/specs/specs-p0-p3-checkpoint.md`
- `/docs/specs/p4/p4-checkpoint.md`
- Canonical P0, P1, P2, P3, and P4 documents mapped in Task 001.

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
  - `/docs/specs/p3/failure-attribution.spec.md`
  - `/docs/specs/p3/verification-report.spec.md`
  - `/docs/specs/p3/entropy-audit.spec.md`
  - `/docs/specs/p3/intervention-log.spec.md`
  - `/docs/specs/p3/tool-result-verification.spec.md`
  - `/docs/specs/p3/tool-registry.spec.md`
  - `/docs/specs/p3/tool-permission.spec.md`
  - `/docs/specs/p3/tool-execution.spec.md`
  - `/docs/specs/p3/service-contract.spec.md`
- Required P3 relationship:
  - `episode-trace`: future template must allow trace reference review.
  - `audit-log`: future template must allow audit evidence review.
  - `failure-attribution`: future template must allow failure attribution review.
  - `verification-report`: future template must allow verification status review.
  - `entropy-audit`: future template must allow degradation or drift evidence review when applicable.
  - `intervention-log`: future template must allow human intervention reference review when applicable.
  - `tool-result-verification`: future template must preserve that tool execution does not validate its own result.
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

## 7. Authorized Paths

- Read-only paths: `/docs`
- Writable paths: `/docs/specs/execution-readiness/`
- Forbidden paths: all other paths

## 8. Allowed Artifacts

- Proposed future artifact: `/docs/specs/execution-readiness/execution-evidence-review-template.md`
- Artifact type: Markdown human evidence review template.
- Authorization status: Not authorized by this Task 006 draft.
- Constraint: This artifact must not be created during Task 006.

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
- roadmap
- implementation plan
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

## 11. Future Execution Instructions

These instructions are draft-only and are not authorized for execution yet.

If the future Task 007 is explicitly approved by a human operator, it must only create a Markdown evidence review template at `/docs/specs/execution-readiness/execution-evidence-review-template.md`.

The future template must contain human-review fields for:

- task id;
- executed prompt;
- authorized paths;
- files changed;
- expected checkpoint;
- evidence produced;
- acceptance criteria evidence;
- rejection criteria review;
- trace/audit references;
- verification status;
- human decision.

The future task must not create code, API, schema, frontend, migrations, YAML, JSON, backlog, sprint plan, roadmap, implementation plan, machine-readable contract, architecture changes, stack decisions, or approved spec edits.

Do not create that template now.

## 12. Acceptance Criteria for Future Task

- [ ] The future Task 007 has explicit human authorization before execution.
- [ ] The human validation checklist from Task 005 is applied before authorization.
- [ ] The future Task 007 creates only `/docs/specs/execution-readiness/execution-evidence-review-template.md`.
- [ ] The future artifact is a human-readable Markdown template only.
- [ ] The future artifact contains fields for task id, executed prompt, authorized paths, files changed, expected checkpoint, evidence produced, acceptance criteria evidence, rejection criteria review, trace/audit references, verification status, and human decision.
- [ ] The future artifact preserves P3 observability and verification constraints.
- [ ] The future artifact does not implement anything.
- [ ] The future artifact does not propose technical stack.
- [ ] The future task reports whether human validation is required before the next step.

## 13. Rejection Criteria for Future Task

- [ ] The future Task 007 is executed without explicit human approval.
- [ ] The future Task 007 is executed without applying the Task 005 checklist.
- [ ] The future Task 007 creates any file outside `/docs/specs/execution-readiness/`.
- [ ] The future Task 007 creates code, API, schema, frontend, migrations, YAML, JSON, backlog, sprint plan, roadmap, implementation plan, or machine-readable contract.
- [ ] The future Task 007 proposes technical stack.
- [ ] The future Task 007 changes approved specs, checkpoints, the Execution Handoff Pack, or prior readiness tasks.
- [ ] The future Task 007 reopens P0P4.
- [ ] The future Task 007 treats Codex as architect of the foundation.
- [ ] The future Task 007 authorizes any next task automatically.

## 14. Human Validation Requirement

The future Task 007 may only be executed if:

- this draft is approved by the human operator;
- the Task 005 checklist is applied;
- the human operator explicitly authorizes execution.

## 15. Expected Checkpoint

- Checkpoint file expected: `/docs/specs/execution-readiness/execution-evidence-review-template.md`
- Human validation required: yes
- Next task blocked until validation: yes

## 16. Final Response Required From Codex

1. File created or changed:
2. Files changed outside authorized scope:
3. Final task status:
4. Checkpoint produced:
5. Human validation required before next step:
