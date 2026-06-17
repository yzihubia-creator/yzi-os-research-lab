# Human Validation Checklist for Controlled Codex Tasks

## 1. Purpose

This checklist supports human validation of any future Codex output before releasing the next controlled task in the YZI OS.

This checklist is not a backlog, sprint plan, roadmap, or implementation plan. It does not authorize implementation, does not choose technical stack, and does not create any implementation task.

## 2. When to Use

Use this checklist after every controlled Codex task and before authorizing any following task.

## 3. Required Inputs for Validation

- Prompt sent to Codex.
- Final response from Codex.
- Files created or changed.
- Expected checkpoint.
- Filled task template.
- Declared source documents.
- Acceptance and rejection criteria for the task.

## 4. Authorization Check

- [ ] A task tinha autorizacao humana explicita.
- [ ] O status de autorizacao estava claro.
- [ ] A task nao foi executada a partir de um draft nao aprovado.
- [ ] A task nao autorizou automaticamente a proxima task.

## 5. Scope Check

- [ ] O objetivo da task foi respeitado.
- [ ] Os non-objectives foram respeitados.
- [ ] Nao houve expansao de escopo.
- [ ] A task nao virou implementacao disfarcada.
- [ ] A task nao virou backlog, sprint plan ou roadmap.

## 6. Source of Truth Check

- [ ] Os documentos fonte foram lidos.
- [ ] Nenhuma fonte proibida foi usada.
- [ ] Nenhuma stack tecnica foi inferida.
- [ ] Nenhuma arquitetura nova foi proposta.
- [ ] Nenhuma spec aprovada foi reinterpretada.

## 7. Path and Artifact Check

- [ ] Apenas paths autorizados foram escritos.
- [ ] Nenhum path proibido foi alterado.
- [ ] Apenas artefatos permitidos foram criados.
- [ ] Nenhum artefato proibido foi criado.
- [ ] Nenhum arquivo aprovado foi editado sem autorizacao explicita.

## 8. Forbidden Artifact Check

Confirm that the task did not create any of the following:

- [ ] codigo
- [ ] API
- [ ] schema
- [ ] frontend
- [ ] migrations
- [ ] YAML
- [ ] JSON
- [ ] backlog
- [ ] sprint plan
- [ ] roadmap
- [ ] implementation plan
- [ ] machine-readable contract
- [ ] architecture change
- [ ] approved spec edit

## 9. Guardrail Check

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

## 10. Acceptance Criteria Review

- Acceptance criteria met:
- Acceptance criteria not met:
- Notes:

## 11. Rejection Criteria Review

- Rejection criteria triggered:
- Rejection criteria not triggered:
- Notes:

## 12. Checkpoint Review

- [ ] Checkpoint esperado foi produzido.
- [ ] Checkpoint esta no path autorizado.
- [ ] Checkpoint e documental quando a task era documental.
- [ ] Checkpoint nao contem execucao nao autorizada.
- [ ] Checkpoint exige validacao humana antes da proxima task.

## 13. Human Decision

Select exactly one:

- [ ] APPROVED_FOR_NEXT_CONTROLLED_TASK
- [ ] REQUIRES_CORRECTION
- [ ] REJECTED_SCOPE_VIOLATION

- Human reviewer:
- Date:
- Decision notes:

## 14. Next Task Rule

No next Codex task may begin until this checklist has been completed and the human decision is `APPROVED_FOR_NEXT_CONTROLLED_TASK`.
