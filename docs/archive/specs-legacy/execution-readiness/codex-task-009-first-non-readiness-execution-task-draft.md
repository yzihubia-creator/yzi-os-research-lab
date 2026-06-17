# Codex Task 009  First Non-Readiness Execution Task Draft

## 1. Purpose

This document is only a draft of a future documentary task outside the `execution-readiness` layer. It prepares a future candidate task named "Create Execution Packages Directory Readme".

This document does not authorize execution of the future task, does not create the future README, does not create the future directory, does not implement anything, and does not change approved P0P4 decisions.

## 2. Usage Rule

The future task cannot be executed without explicit human approval, a filled controlled task template, the Task 005 human checklist, and the Task 007 evidence review template after execution.

## 3. Task Metadata

- Task ID: TASK-010-CANDIDATE
- Task Title: Create Execution Packages Directory Readme
- Task Type: Documentary Execution Organization
- Authorization Status: DRAFT_REQUIRES_HUMAN_APPROVAL
- Requested By: Human Operator
- Date: 2026-06-06
- Execution Mode: Human-review-only draft

## 4. Scope

- Objective: In a future approved task, create a human README to guide the future controlled execution packages directory.
- Non-objective: Do not implement code, API, schema, frontend, stack, backlog, sprint, roadmap, or machine-readable contracts.
- Expected Output: One future Markdown document, if approved.
- Explicitly Out of Scope: Implementation, new architecture, backlog, sprint, roadmap, YAML, JSON, machine-readable contracts, technical stack, and any approved spec changes.

## 5. Source of Truth

- `/docs/specs/execution-readiness/codex-task-001-readiness-audit.md`
- `/docs/specs/execution-readiness/codex-controlled-task-template.md`
- `/docs/specs/execution-readiness/first-execution-task-package-index.md`
- `/docs/specs/execution-readiness/human-validation-checklist-for-controlled-codex-tasks.md`
- `/docs/specs/execution-readiness/execution-evidence-review-template.md`
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
- Required governing relationships:
  - P0 `layer-authority-model`: future README must preserve Codex as bounded executor, not authority.
  - P0 `conflict-resolution`: future README must not override value-order or approved decisions.
  - P2 `operational-boundaries`: future README must preserve bounded task scope.
  - P2 `context-provenance`: future README must preserve source-of-truth and provenance requirements.
  - P3 `audit-log`: future README must preserve auditability expectations.
  - P3 `verification-report`: future README must preserve verification as separate review.
  - P3 `entropy-audit`: future README must guard against documentary drift.
  - P4 `execution-harness`: future README must preserve controlled execution guardrails.

## 7. Proposed Future Authorized Paths

- Read-only paths: `/docs`
- Writable paths: `/docs/specs/execution-packages/`
- Forbidden paths: all other paths

`/docs/specs/execution-packages/` must not be created during Task 009.

## 8. Proposed Future Allowed Artifacts

- Proposed future artifact: `/docs/specs/execution-packages/README.md`
- Artifact type: Markdown human README.
- Authorization status: Not authorized by this Task 009 draft.
- Constraint: This artifact must not be created during Task 009.

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

If the future Task 010 is explicitly approved by a human operator, it must only create `/docs/specs/execution-packages/README.md`.

The future README must be human, documentary, and contain at minimum:

- purpose of the directory;
- human authorization rule;
- controlled task template usage rule;
- human checklist usage rule;
- evidence review template usage rule;
- prohibition of automatic implementation;
- prohibition of backlog, sprint, roadmap, and technical stack;
- next-task blocker rule until human validation.

Do not create that README now.

## 12. Acceptance Criteria for Future Task

- [ ] A futura Task 010 tem autorização humana explícita.
- [ ] A futura Task 010 cria apenas `/docs/specs/execution-packages/README.md`.
- [ ] A futura Task 010 não cria código, API, schema, frontend ou migrations.
- [ ] A futura Task 010 não cria YAML, JSON ou contrato machine-readable.
- [ ] A futura Task 010 não cria backlog, sprint plan ou roadmap.
- [ ] A futura Task 010 não propõe stack técnica.
- [ ] A futura Task 010 não altera specs aprovadas.
- [ ] O README futuro preserva os guardrails permanentes.
- [ ] O README futuro exige validação humana antes da próxima task.

## 13. Rejection Criteria for Future Task

- [ ] A futura Task 010 foi executada sem autorização humana explícita.
- [ ] A futura Task 010 criou qualquer arquivo além do README autorizado.
- [ ] A futura Task 010 alterou specs aprovadas.
- [ ] A futura Task 010 alterou o Execution Handoff Pack.
- [ ] A futura Task 010 criou código, API, schema, frontend, migrations, YAML ou JSON.
- [ ] A futura Task 010 criou backlog, sprint plan, roadmap ou plano de implementação.
- [ ] A futura Task 010 propôs stack técnica.
- [ ] A futura Task 010 autorizou próxima task automaticamente.
- [ ] A futura Task 010 reabriu P0P4.
- [ ] A futura Task 010 tratou Codex como arquiteto da fundação.

## 14. Human Validation Requirement

The future Task 010 may only be executed if:

- this draft is approved by the human operator;
- the Task 005 checklist is applied;
- the human operator explicitly authorizes execution;
- after execution, the Task 007 template is used to review evidence.

## 15. Expected Checkpoint

- Checkpoint file expected: `/docs/specs/execution-packages/README.md`
- Human validation required: yes
- Next task blocked until validation: yes

## 16. Final Response Required From Codex

1. File created or changed:
2. Files changed outside authorized scope:
3. Final task status:
4. Checkpoint produced:
5. Human validation required before next step:
