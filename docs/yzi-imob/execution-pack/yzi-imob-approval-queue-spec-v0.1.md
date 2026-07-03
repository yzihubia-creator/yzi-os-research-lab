# YZI IMOB — Approval Queue Spec v0.1

Especificação documentária da Approval Queue do runtime YZI IMOB. Complementa `yzi-imob-runtime-backend-architecture-v0.1.md`, `yzi-imob-ai-runtime-credits-boundary-v0.1.md`, `yzi-imob-tool-registry-spec-v0.1.md` e `yzi-imob-context-builder-spec-v0.1.md`. Nada aqui autoriza implementação.

## 1. Decisão central

A Approval Queue é a camada que impede a YZI de executar ações reais sem aprovação humana. A YZI pode preparar, explicar e recomendar. A YZI não pode publicar, enviar, conectar, alterar contrato, registrar comissão recebida ou executar ação externa sensível sem aprovação.

Regra forte: `A YZI pode preparar autonomia; execução real sensível exige humano.`

## 2. Papel no runtime

`YZI Orchestrator → Context Builder → Tool Registry → Prepared Action → Approval Queue → Human Decision → Tool Executor → Evidence/Logs`

A Approval Queue não decide sozinha. Ela guarda ações preparadas, evidências e decisão humana.

## 3. Boundary por tenant

- Todo approval item pertence a um `tenant_id` e tem `requested_by_user_id` e `approval_required_for`.
- Aprovação só pode ser feita por usuário autorizado do mesmo tenant.
- Nenhum approval item pode executar ação de outro tenant; item sem tenant é bloqueado.
- Approval policy pode variar por tenant, plano, módulo e risk level.

Regra forte: `Sem tenant_id e aprovador autorizado, não existe aprovação válida.`

## 4. Ações que sempre exigem aprovação

Publicar página; publicar post; criar campanha; enviar campanha; enviar WhatsApp proativo; confirmar visita; alterar documento/contrato; registrar comissão como recebida; conectar API real; usar token novo; executar workflow acima do limite de custo; executar tool com `side_effects = external_execution`; executar tool com `risk_level = high` ou `critical`.

## 5. Approval item mínimo (campos conceituais)

`approval_id` · `tenant_id` · `requested_by_user_id` · `approver_user_id` · `module` · `route` · `active_asset_type` · `active_asset_id` · `tool_name` · `action_type` · `risk_level` · `side_effects` · `prepared_payload_summary` · `full_payload_reference` · `evidence_id` · `credit_estimate` · `approval_status` · `decision_reason` · `expires_at` · `created_at` · `decided_at`

## 6. Status da aprovação

`draft` · `pending_review` · `approved` · `rejected` · `expired` · `cancelled` · `executed` · `execution_failed` · `blocked_by_policy`

Apenas `approved` pode seguir para execução. `approved` não significa executado. Execução precisa gerar evidence.

## 7. Decisão humana

O humano pode: aprovar; rejeitar; solicitar ajuste; cancelar; expirar por tempo; aprovar com restrição.

Toda decisão registra: usuário; timestamp; razão curta; versão do payload aprovado.

## 8. Payload e evidência

A fila não deve guardar segredos em texto puro. `prepared_payload_summary` deve ser legível e compacto. Payload completo, quando necessário, deve ser referenciado por storage/registro seguro (`full_payload_reference`).

Toda aprovação anexa evidência mínima: contexto usado; ação proposta; riscos; custo estimado; ferramenta envolvida; resultado esperado.

## 9. Relação com Tool Registry

- Tools com `side_effects = external_execution` sempre entram na Approval Queue antes do executor.
- Tools com `risk_level = high` ou `critical` entram na Approval Queue.
- O Tool Registry define se a tool exige aprovação; a Approval Queue registra e controla o ciclo humano.

## 10. Relação com Context Builder

O Context Builder fornece o contexto resumido usado para preparar a ação. A Approval Queue registra referência ao context pack/evidence, não copia contexto gigante.

A decisão humana deve conseguir entender: o que a YZI viu; o que a YZI propôs; por que exige aprovação; qual risco existe; qual custo estimado.

## 11. Estados operacionais de UI

`no_pending_approvals` · `approval_required` · `waiting_human_review` · `approved_waiting_execution` · `rejected_needs_revision` · `expired_needs_rebuild` · `executed_with_evidence` · `execution_failed_needs_review` · `blocked_by_policy`

## 12. Error states

`tenant_missing` · `approver_missing` · `approver_not_authorized` · `approval_item_not_found` · `approval_expired` · `payload_missing` · `evidence_missing` · `policy_missing` · `tool_not_allowed` · `credit_limit_reached` · `execution_already_completed` · `execution_blocked`

## 13. Fora do MVP

Aprovação automática por regra; aprovação em massa; aprovação por WhatsApp; workflow jurídico completo; assinatura eletrônica; cobrança automática pós-aprovação; rollback automático de campanha; execução autônoma sem humano.

## 14. Próximas specs (ordem sugerida)

1. Usage/Credits Data Model;
2. Tool Registry Data Model;
3. Context Builder Data Model;
4. Approval Queue Data Model;
5. Runtime API Skeleton;
6. First read-only context tool;
7. First approval-only action.
