# YZI IMOB — Context Builder Spec v0.1

Especificação documentária do Context Builder do runtime YZI IMOB. Complementa `yzi-imob-runtime-backend-architecture-v0.1.md`, `yzi-imob-ai-runtime-credits-boundary-v0.1.md` e `yzi-imob-tool-registry-spec-v0.1.md`. Nada aqui autoriza implementação.

## 1. Decisão central

O Context Builder monta o **menor contexto útil** para a YZI executar uma tarefa. A YZI não deve receber banco cru, histórico completo, docs inteiros ou dados irrelevantes. Contexto demais degrada decisão, aumenta custo e aumenta risco.

Regra forte: `A YZI só deve ver o que é necessário para a próxima decisão.`

## 2. Papel no runtime

`Runtime API → Policy/Governance → Context Builder → YZI Orchestrator → Tool Registry → Executor → Evidence/Logs`

O Context Builder não decide a ação final. Ele monta o pacote de contexto seguro e compacto para a YZI decidir.

## 3. Boundary por tenant

- Todo context pack pertence a um `tenant_id` e exige `user_id`.
- Nenhum context pack mistura dados de tenants diferentes; contexto sem tenant ativo é bloqueado.
- Dados globais só entram como regra/sistema, nunca como dado de cliente.
- Permissões do usuário definem quais dados entram.
- Tools permitidas entram como lista filtrada por tenant/plano/conexão.

Regra forte: `Sem tenant_id, não existe context pack operacional.`

## 4. Context Pack mínimo

`tenant_summary` · `user_role` · `module` · `route` · `task_intent` · `active_asset_type` · `active_asset_id` · `relevant_ids` · `current_state` · `allowed_tools` · `approval_policy` · `credit_policy` · `compact_memory` · `last_evidence` · `output_contract`

## 5. Tipos de contexto

- `identity_context` — identidade do produto/módulo.
- `policy_context` — regras críticas e tenant boundary.
- `task_context` — intenção atual.
- `asset_context` — imóvel, lead, deal, campanha, documento ou comissão ativo.
- `tool_context` — tools permitidas e contratos resumidos.
- `memory_context` — aprendizados/decisões resumidas.
- `evidence_context` — última evidência relevante.
- `approval_context` — o que exige humano antes de executar.

## 6. Contexto por ativo (compacto)

- **property**: `property_id`; status no fluxo; campos preenchidos; campos faltantes; mídia disponível; silo/site status; campanha/conteúdo status; leads relacionados resumidos; próxima ação sugerida.
- **lead**: `lead_id`; origem; imóvel de interesse; intenção; histórico resumido; estágio no pipeline; próximos passos; restrições de contato.
- **deal**: `deal_id`; property/lead vinculados; estágio; responsável; documento relacionado; comissão prevista; riscos.
- **connection**: `connection_id`; provedor; status operacional; última validação; permissões disponíveis; tools habilitáveis; **sem token/segredo**.

## 7. Regras de compactação

Compactar sempre: histórico longo; conversas; logs; evidências antigas; múltiplos imóveis/leads; respostas de tools.

Preservar sempre: decisões humanas; aprovações/reprovações; `tenant_id`; IDs operacionais; estado atual; campos faltantes; riscos; próxima ação; evidência mais recente.

## 8. O que nunca entra no contexto

API keys; tokens; service role; secrets; logs brutos sensíveis; dados de outro tenant; histórico completo quando resumo basta; payload gigante de API; documentos jurídicos completos sem necessidade; dados pessoais desnecessários; informação marcada como fora do escopo.

## 9. Output contract

Toda execução recebe um contrato de saída. Exemplos: `screen_plan`; `copy_draft`; `property_page_draft`; `ad_brief`; `followup_draft`; `approval_request`; `learning_note`; `blocked_with_reason`.

A YZI responde no formato solicitado, não em texto solto quando o runtime exigir estrutura.

## 10. Relação com Tool Registry

O Context Builder só inclui tools que o Tool Registry marcou como permitidas para tenant, plano, módulo, conexão, permissão e approval policy. Tools bloqueadas não entram no contexto.

## 11. Error states

`tenant_missing` · `user_missing` · `permission_denied` · `asset_not_found` · `context_too_large` · `context_compaction_required` · `tool_context_unavailable` · `approval_policy_missing` · `credit_policy_missing` · `output_contract_missing` · `context_blocked`

## 12. Fora do MVP

Long-term autonomous memory; retrieval automático complexo; RAG global multi-tenant; contexto cross-tenant; personalização profunda por usuário; documentos jurídicos completos no prompt; carregamento automático de todos os docs; self-modifying context policy.

## 13. Próximas specs (ordem sugerida)

1. Approval Queue Spec;
2. Usage/Credits Data Model;
3. Context Builder Data Model;
4. Tool Registry Data Model;
5. Runtime API Skeleton;
6. First read-only context tool;
7. First approval-only action.
