# Execution Evidence Review Template

## 1. Purpose

This template supports human review of evidence produced by future controlled Codex executions in the YZI OS.

This template is not a backlog, sprint plan, roadmap, or implementation plan. It does not authorize implementation, does not choose technical stack, and does not create any implementation task.

## 2. When to Use

Use this template after a controlled Codex task and together with the Task 005 human checklist at `/docs/specs/execution-readiness/human-validation-checklist-for-controlled-codex-tasks.md`.

## 3. Task Identification

- Task ID:
- Task Title:
- Task Type:
- Authorization Status:
- Human Authorization Reference:
- Date Executed:
- Reviewer:
- Review Date:

## 4. Executed Prompt Record

- Prompt source:
- Prompt version or file:
- Prompt approved by:
- Prompt execution date:
- Prompt notes:

## 5. Authorized Scope Review

- Authorized read-only paths:
- Authorized writable paths:
- Forbidden paths:
- [ ] Writable paths respected.
- [ ] Forbidden paths untouched.
- [ ] Scope did not expand.

## 6. File Change Review

| File | Created / Modified / Deleted | Authorized? | Purpose | Notes |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## 7. Expected Checkpoint Review

- Expected checkpoint:
- Produced checkpoint:
- Checkpoint path:
- Checkpoint status:
- Notes:

## 8. Acceptance Criteria Evidence

| Acceptance Criterion | Evidence | Status | Notes |
| --- | --- | --- | --- |
|  |  |  |  |

## 9. Rejection Criteria Review

| Rejection Criterion | Triggered? | Evidence | Notes |
| --- | --- | --- | --- |
|  |  |  |  |

## 10. Trace and Audit References

- Episode trace reference:
- Audit log reference:
- Intervention log reference:
- Failure attribution reference:
- Entropy audit reference:
- Verification report reference:
- Tool result verification reference:

## 11. Execution vs Verification Separation

- [ ] Execution result was not treated as self-validating.
- [ ] Verification was performed separately from execution.
- [ ] Tool execution, if any, did not validate its own result.
- [ ] Evidence supports the stated outcome.
- [ ] Human reviewer confirmed verification sufficiency.

## 12. Tool Execution Review

If no tool was used, write `NOT_APPLICABLE`.

- Tool used:
- Tool permission verified:
- Tool execution result:
- Tool result verification performed:
- Verification evidence:
- Notes:

## 13. Human Intervention Review

- Human intervention occurred:
- Intervention reason:
- Intervention timing:
- Intervention impact:
- Intervention log reference:
- Notes:

## 14. Entropy and Drift Review

- [ ] No unauthorized files introduced.
- [ ] No obsolete artifacts left behind.
- [ ] No naming drift introduced.
- [ ] No architectural drift introduced.
- [ ] No approved spec drift introduced.
- [ ] No implementation residue introduced.

- Entropy risk level:
- Drift notes:

## 15. Guardrail Review

- [ ] Codex did not act as architect of the foundation.
- [ ] Codex did not reopen P0P4.
- [ ] Codex did not implement without explicit authorization.
- [ ] Prompt remained Metadata, not Authority.
- [ ] LLM was not granted operational authority.
- [ ] Runtime coordination was not treated as governance.
- [ ] Persisted state remained operational truth.
- [ ] Tenant boundary remained inviolable.
- [ ] Verification remained separate from execution.
- [ ] Tool execution was not treated as self-validating.

## 16. Final Evidence Status

Select exactly one:

- [ ] EVIDENCE_ACCEPTED
- [ ] EVIDENCE_INCOMPLETE_REQUIRES_CORRECTION
- [ ] EVIDENCE_REJECTED_SCOPE_OR_GUARDRAIL_VIOLATION

- Final reviewer:
- Final decision date:
- Decision rationale:

## 17. Next Task Blocker

No next Codex task may begin until this evidence review is completed and the final evidence status is `EVIDENCE_ACCEPTED`.
