# Execution Packages

## 1. Purpose

This directory stores future documentary packages for controlled YZI OS execution.

This directory is not a backlog, sprint plan, roadmap, or implementation plan. It does not authorize automatic execution, does not authorize Codex to implement, does not replace approved specs, and always depends on explicit human authorization per task.

## 2. Governance Status

- Foundation status: P0P4 approved
- Implementation status: 0%
- Execution mode: controlled, human-authorized, evidence-reviewed
- Codex role: bounded executor, not architect
- Human validation: required before and after every task

## 3. What Belongs Here

This directory may contain, in future approved tasks:

- documentary packages for controlled execution;
- approved drafts of specific tasks;
- documentary execution checkpoints;
- human evidence review records;
- controlled operational handoff documents.

## 4. What Does Not Belong Here

This directory must not contain:

- code;
- APIs;
- schemas;
- frontend;
- migrations;
- YAML;
- JSON;
- backlog;
- sprint plan;
- roadmap;
- implementation plan;
- machine-readable contract;
- rewritten approved specs;
- new architectural decisions.

## 5. Required Control Documents

The following control documents are required for execution package work:

- `/docs/specs/execution-readiness/codex-controlled-task-template.md`
- `/docs/specs/execution-readiness/human-validation-checklist-for-controlled-codex-tasks.md`
- `/docs/specs/execution-readiness/execution-evidence-review-template.md`
- `/docs/specs/execution-handoff/codex-execution-handoff-pack.md`

## 6. Execution Package Rule

No execution package may be created unless it has:

- explicit human authorization;
- filled controlled task template;
- declared source of truth;
- governing specs;
- authorized paths;
- allowed artifacts;
- forbidden artifacts;
- acceptance criteria;
- rejection criteria;
- expected checkpoint;
- post-execution evidence review.

## 7. Human Authorization Rule

Codex must not create, alter, execute, expand, or authorize any execution package without explicit human approval for that exact task.

## 8. Evidence Review Rule

Every completed execution package must be reviewed using:

`/docs/specs/execution-readiness/execution-evidence-review-template.md`

A next task remains blocked until the final evidence status is:

`EVIDENCE_ACCEPTED`

## 9. Permanent Guardrails

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

## 10. Next Task Blocker

No next Codex task may begin from this directory unless the previous task has passed human validation and evidence review.
