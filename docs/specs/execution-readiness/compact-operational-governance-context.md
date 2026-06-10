# Compact Operational Governance Context

## Current Readiness

Input readiness:

`TASK_209_DOCUMENTARY_SEQUENCE_RESUME_SCOPE_GATE_PREPARED_FOR_COMPACT_GOVERNANCE_CONTEXT_DOCUMENTARY_ONLY`

Operational mode:

`COMPACT_OPERATIONAL_GOVERNANCE_CONTEXT_CREATED_DOCUMENTARY_ONLY`

Recognized risk:

`DOCUMENTATION_BLOAT_RISK_FOR_LLM_EXECUTION_CONTEXT`

## Operational Purpose

This compact governance context is the default operational context for future controlled LLM execution.

It exists to reduce cost, latency, and context confusion.

It replaces the historical task index as the default operational context for Claude, Codex, or any executing LLM.

It is documentary only, human-readable, compact, and non-executable.

## Historical Audit Boundary

Primary rule:

`HISTORICAL_AUDIT_INDEX_NOT_DEFAULT_LLM_EXECUTION_CONTEXT`

The historical index remains an audit source only.

The historical index is not the default LLM execution context.

The historical index should be consulted only when there is:

- readiness divergence;
- scope conflict;
- doubt about an authorized path;
- suspected governance violation;
- explicit human request for audit.

## Default Execution Context Rule

Future controlled executions must use this compact governance context as the default governance context.

Future controlled executions must not require reading the full historical index, all prior task files, all old gates, all old records, or all old documentary artifacts.

## Allowed Operational Inputs

Future controlled executions should use only:

- this compact governance context;
- the directly relevant approved spec;
- the directly relevant skill;
- the directly relevant subagent or command, when present;
- the authorized paths for the task;
- the target artifact of the task;
- one short evidence record.

## Forbidden Operational Inputs

The executing LLM must not receive as default context:

- the full historical index;
- all prior task files;
- all old gates;
- all old records;
- all old documentary artifacts.

These may be consulted only under the audit boundary defined above.

## Frozen Artifact Set

The frozen artifact set remains:

`/tools/controlled-harness/BOUNDARY.md`

`/tools/controlled-harness/README.md`

`/tools/controlled-harness/ENTRYPOINT.md`

`/tools/controlled-harness/MANIFEST.md`

`/tools/controlled-harness/SOURCE_DOCUMENTS.md`

`/tools/controlled-harness/EVIDENCE.md`

`/tools/controlled-harness/` remains frozen.

## Required Execution Pattern

Every future controlled execution must be bounded by:

- explicit human authorization;
- exact task identity;
- exact authorized paths;
- exact target artifact;
- allowed scope;
- forbidden scope;
- acceptance criteria;
- stop conditions;
- short evidence.

Execution must remain separate from verification.

Prompt is metadata, not authority.

Persisted state is operational truth.

## Stop Conditions

Stop immediately if a task attempts to:

- create or modify a file inside `/tools/controlled-harness/` without a new explicit human gate;
- create executable harness;
- create technical harness;
- create runner, registry, or loader;
- create YAML, JSON, or machine-readable contract without explicit authorization;
- create code without explicit authorization;
- execute technical work without explicit human authorization;
- use the historical index as default execution context;
- expand scope by inference.

## Human Authorization Rule

No future task is authorized automatically.

Every future task requires a new explicit human authorization phrase.

Short confirmations such as "ok", "continue", "approved", or equivalent do not authorize future execution.

## Evidence Rule

Each future controlled task must produce short evidence.

Evidence must record:

- artifact created or modified;
- authorized path used;
- forbidden scope avoided;
- technical execution status;
- final readiness statement.

Evidence must stay compact unless a human explicitly requests an audit expansion.

## Final Statement

`COMPACT_OPERATIONAL_GOVERNANCE_CONTEXT_CREATED_DOCUMENTARY_ONLY`
