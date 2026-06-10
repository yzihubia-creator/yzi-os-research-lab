# P4 Execution Package Draft

## 1. Purpose

This package prepares the controlled documentary execution of P4.

This package does not implement anything and does not authorize automatic implementation.

## 2. Package Status

* Package: P4 Execution Package Draft
* Authorization status: DOCUMENTARY_PACKAGE_CREATED_FOR_HUMAN_VALIDATION
* Implementation status: 0%
* Implementation allowed: no
* Code allowed: no
* Stack decisions allowed: no
* Human validation required: yes
* Evidence review required: yes

## 3. P4 Scope Summary

P4 is the Skills / Subagents / Harnesses layer of YZI OS.

P4 governs:

* minimum skills;
* intent extraction skill;
* context assembly skill;
* provenance tagging skill;
* evidence compilation skill;
* minimum subagents;
* interface subagent;
* retrieval subagent;
* verification subagent;
* runtime harness;
* governance harness;
* observability harness;
* tenant harness;
* execution harness.

This summary is intentionally high level and does not reinterpret the approved P4 documents.

## 4. Governing P4 Documents

* `/docs/specs/p4/p4-preparation-map.md`
* `/docs/specs/p4/skills/intent-extraction-skill.spec.md`
* `/docs/specs/p4/skills/context-assembly-skill.spec.md`
* `/docs/specs/p4/skills/provenance-tagging-skill.spec.md`
* `/docs/specs/p4/skills/evidence-compilation-skill.spec.md`
* `/docs/specs/p4/skills/p4-minimum-skills-checkpoint.md`
* `/docs/specs/p4/subagents/interface-subagent.spec.md`
* `/docs/specs/p4/subagents/retrieval-subagent.spec.md`
* `/docs/specs/p4/subagents/verification-subagent.spec.md`
* `/docs/specs/p4/subagents/p4-minimum-subagents-checkpoint.md`
* `/docs/specs/p4/harnesses/runtime-harness.spec.md`
* `/docs/specs/p4/harnesses/governance-harness.spec.md`
* `/docs/specs/p4/harnesses/observability-harness.spec.md`
* `/docs/specs/p4/harnesses/tenant-harness.spec.md`
* `/docs/specs/p4/harnesses/execution-harness.spec.md`
* `/docs/specs/p4/harnesses/p4-minimum-harnesses-checkpoint.md`
* `/docs/specs/p4/p4-checkpoint.md`

## 5. Control Documents Required

* `/docs/specs/execution-readiness/codex-controlled-task-template.md`
* `/docs/specs/execution-readiness/human-validation-checklist-for-controlled-codex-tasks.md`
* `/docs/specs/execution-readiness/execution-evidence-review-template.md`
* `/docs/specs/execution-handoff/codex-execution-handoff-pack.md`
* `/docs/specs/execution-packages/README.md`
* `/docs/specs/execution-packages/controlled-execution-package-foundation-human-acceptance-record.md`
* `/docs/specs/execution-packages/p1-package-foundation-human-acceptance-record.md`
* `/docs/specs/execution-packages/p2-package-foundation-human-acceptance-record.md`
* `/docs/specs/execution-packages/p3-package-foundation-human-acceptance-record.md`

## 6. Execution Boundaries

Future tasks derived from this package may advance only if they are:

* explicitly authorized by a human;
* based on the approved P4 documents;
* limited to approved documentary artifacts;
* reviewed by human checklist;
* reviewed by evidence review after execution;
* blocked until human validation.

This package does not authorize product implementation.

## 7. Future Allowed Artifact Types

Future tasks derived from this package may propose only human documentary artifacts such as:

* controlled execution drafts;
* human review records;
* documentary checkpoints;
* evidence review records;
* skill boundary notes;
* subagent boundary notes;
* harness boundary notes;
* runtime coordination notes;
* governance preservation notes;
* observability notes;
* tenant isolation notes;
* execution control notes.

Each future artifact requires an explicit path and its own human authorization.

## 8. Forbidden Artifact Types

* code
* API
* schema
* frontend
* migrations
* YAML
* JSON
* backlog
* sprint plan
* roadmap
* implementation plan
* machine-readable contract
* architecture changes
* approved spec edits
* stack decisions
* automatic execution

## 9. Required Evidence for Future P4 Tasks

Future tasks derived from this package must produce human evidence of:

* source documents read;
* governing P4 documents used;
* authorized paths respected;
* allowed artifacts created;
* forbidden artifacts avoided;
* minimum skills preserved as governed capabilities;
* intent extraction skill preserved as governed capability;
* context assembly skill preserved as governed capability;
* provenance tagging skill preserved as governed capability;
* evidence compilation skill preserved as governed capability;
* minimum subagents preserved as bounded institutional roles;
* interface subagent preserved as bounded role;
* retrieval subagent preserved as bounded role;
* verification subagent preserved as bounded role;
* runtime harness preserved as execution coordination, not governance;
* governance harness preserved as policy enforcement boundary;
* observability harness preserved as trace/audit/verification visibility boundary;
* tenant harness preserved as tenant isolation boundary;
* execution harness preserved as permission/trace/audit/evidence/verification boundary;
* acceptance criteria met;
* rejection criteria not triggered;
* guardrails preserved;
* checkpoint produced;
* evidence review completed.

## 10. Acceptance Criteria for Future P4 Tasks

* [ ] The future task has explicit human authorization.
* [ ] The future task declares governing P4 documents.
* [ ] The future task declares authorized paths.
* [ ] The future task creates only allowed artifacts.
* [ ] The future task does not create forbidden artifacts.
* [ ] The future task preserves skills as governed capabilities.
* [ ] The future task preserves subagents as bounded institutional roles.
* [ ] The future task preserves harnesses as execution controls, not governance authority.
* [ ] The future task preserves runtime harness as execution coordination, not governance.
* [ ] The future task preserves governance harness as policy enforcement boundary.
* [ ] The future task preserves observability harness as trace/audit/verification visibility.
* [ ] The future task preserves tenant harness as tenant isolation boundary.
* [ ] The future task preserves execution harness as permission, trace, audit, evidence, and verification boundary.
* [ ] The future task does not alter approved documents.
* [ ] The future task does not implement code, API, schema, or frontend.
* [ ] The future task does not propose technical stack.
* [ ] The future task produces a documentary checkpoint.
* [ ] The future task requires evidence review.
* [ ] The next task remains blocked until human validation.

## 11. Rejection Criteria for Future P4 Tasks

* [ ] The future task was executed without explicit human authorization.
* [ ] The future task omitted governing P4 documents.
* [ ] The future task created a file outside the authorized path.
* [ ] The future task created code, API, schema, frontend, or migrations.
* [ ] The future task created YAML, JSON, or a machine-readable contract.
* [ ] The future task created backlog, sprint plan, roadmap, or implementation plan.
* [ ] The future task proposed technical stack.
* [ ] The future task altered approved specs or documents.
* [ ] The future task reopened P0P4.
* [ ] The future task treated Codex as architect of the foundation.
* [ ] The future task authorized the next task automatically.
* [ ] The future task treated skill as operational authority.
* [ ] The future task treated subagent as architect.
* [ ] The future task treated harness as governance.
* [ ] The future task treated runtime harness as policy enforcement.
* [ ] The future task treated governance harness as optional guidance.
* [ ] The future task violated tenant harness or tenant isolation.
* [ ] The future task treated execution harness as implementation authorization.
* [ ] The future task authorized implementation.

## 12. Permanent Guardrails

* Codex is not the architect of the foundation.
* Codex must not reopen P0P4.
* Codex must not implement without explicit authorization.
* Prompt is Metadata, not Authority.
* LLM has no operational authority.
* Runtime coordinates, but does not govern.
* Persisted state is operational truth.
* Event is the unit of verifiable change.
* Tenant boundary is inviolable.
* Policy enforcement is deterministic.
* Context is a governed package.
* Provenance is mandatory.
* Observability is a trust requirement.
* Verification is separate from execution.
* Tool registry is not permission.
* Tool permission comes before tool execution.
* Tool execution does not validate its own result.
* Tool result verification is mandatory.

## 13. P4-Specific Guardrails

* Skills are governed capabilities, not autonomous authority.
* Subagents are bounded institutional roles, not architects.
* Harnesses coordinate execution conditions, but do not govern.
* Runtime harness must not override governance harness.
* Governance harness must preserve deterministic policy enforcement.
* Observability harness must preserve trace, audit, verification, entropy and intervention visibility.
* Tenant harness must preserve tenant boundary and tenant isolation.
* Execution harness must preserve permission, trace, audit, evidence and verification requirements.
* No P4 artifact authorizes implementation by itself.

## 14. Expected Checkpoint

* Checkpoint produced by this task: `/docs/specs/execution-packages/p4-execution-package-draft.md`
* Human validation required: yes
* Evidence review required: yes
* Next task blocked until validation: yes

## 15. Human Validation Requirement

This package may be considered ready for the next task only if:

* the human operator approves the package;
* the Task 005 checklist is applied;
* the Task 007 template is used to review evidence;
* the final evidence status is `EVIDENCE_ACCEPTED`.

## 16. Next Task Candidate

* Task 048 Candidate  Create P4 Execution Evidence Review Record: `NOT_AUTHORIZED`

This candidate is not a backlog, sprint plan, roadmap, or implementation plan.

## 17. Next Task Blocker

No next Codex task may begin from this P4 package until human validation is completed and the evidence review status is `EVIDENCE_ACCEPTED`.
