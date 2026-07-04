# YZI IMOB — Intent Router + Workflow Selector Spec v0.1

Especificação documentária do Intent Router e do Workflow Selector do runtime YZI IMOB. Complementa `yzi-imob-runtime-backend-architecture-v0.1.md`, `yzi-imob-tool-registry-spec-v0.1.md`, `yzi-imob-context-builder-spec-v0.1.md`, `yzi-imob-approval-queue-spec-v0.1.md` e `yzi-imob-ai-runtime-credits-boundary-v0.1.md`. Nada aqui autoriza implementação.

## 1. Decisão central

O Intent Router classifica a intenção do usuário antes de qualquer execução. O Workflow Selector escolhe o fluxo operacional permitido para aquela intenção.

Regra forte: `Sem intenção classificada, a YZI não monta contexto nem chama tool.`

## 2. Papel no runtime

`Runtime API → Intent Router → Workflow Selector → Policy/Governance → Context Builder → YZI Orchestrator → Tool Registry → Approval Queue → Executor → Evidence/Memory`

## 3. Boundary por tenant

- Toda intenção pertence a um `tenant_id` e exige `user_id`.
- Nenhuma intenção pode operar fora do tenant.
- Permissões do usuário afetam os workflows disponíveis.
- Plano, módulo e conexões ativas afetam os workflows disponíveis.

## 4. Tipos iniciais de intenção

`property_register` · `property_update` · `property_publish_prepare` · `content_generate_prepare` · `ad_campaign_prepare` · `lead_qualify` · `lead_followup_prepare` · `visit_schedule_prepare` · `pipeline_update_prepare` · `document_prepare` · `commission_update_prepare` · `connection_setup_prepare` · `runtime_question` · `blocked_or_unknown`

## 5. Workflows iniciais

| Intent | Workflow |
|---|---|
| `property_register` | Formulário → Catálogo → Pasta Comercial |
| `property_publish_prepare` | Property Context → Site/Silo Draft → Approval |
| `content_generate_prepare` | Property Context → Briefing → Criativos/Copy Draft |
| `ad_campaign_prepare` | Property Context → Ad Brief → Approval |
| `lead_qualify` | Lead Context → Qualification Plan |
| `lead_followup_prepare` | Lead Context → Follow-up Draft → Approval |
| `visit_schedule_prepare` | Lead/Property Context → Visit Request → Approval/Handoff |
| `connection_setup_prepare` | Connection Context → Credential Setup Plan |
| `blocked_or_unknown` | Ask Clarification / Blocked with Reason |

## 6. Input mínimo

`tenant_id` · `user_id` · `route` · `module` · `raw_intent` · `active_asset_type` · `active_asset_id` · `user_role` · `available_connections` · `requested_action`

## 7. Output mínimo

`intent_type` · `confidence` · `workflow_id` · `required_context` · `allowed_tools` · `approval_required` · `risk_level` · `blocking_reason` · `next_question` (quando necessário)

## 8. Regras de bloqueio

Bloquear quando: faltar `tenant_id`; faltar `user_id`; a intenção for ambígua; o ativo necessário não existir; o usuário não tiver permissão; o workflow exigir conexão ausente; o workflow exigir aprovação e a policy estiver ausente; a ação for sensível sem Approval Queue.

## 9. Relação com Context Builder

O Context Builder só monta contexto depois que o Intent Router classifica a intenção e o Workflow Selector define o contexto necessário (`required_context`).

## 10. Relação com Tool Registry

O Workflow Selector só pode selecionar tools permitidas pelo Tool Registry para tenant, plano, módulo, conexão e policy.

## 11. Relação com Approval Queue

Se o workflow preparar ação real, deve gerar approval item antes de qualquer execução externa.

## 12. Error states

`tenant_missing` · `user_missing` · `intent_unknown` · `intent_ambiguous` · `workflow_not_allowed` · `asset_missing` · `permission_denied` · `connection_required` · `approval_policy_missing` · `context_required` · `blocked_by_policy`

## 13. Fora do MVP

Roteamento autônomo multi-vertical; aprendizado automático de novos intents; workflow self-registration; execução sem humano; intent routing cross-tenant; integração real com MCP.

## 14. Próximas specs (ordem sugerida)

1. Usage/Credits Data Model;
2. Tool Registry Data Model;
3. Context Builder Data Model;
4. Approval Queue Data Model;
5. Intent Router Data Model;
6. Runtime API Skeleton;
7. First read-only runtime flow.
