# YZI IMOB — AI Runtime + Credits Boundary v0.1

Boundary documentário para uso de Claude API, créditos, billing interno e separação desenvolvimento vs produção. Complementa `yzi-imob-runtime-backend-architecture-v0.1.md` e `yzi-imob-multitenant-boundary-v0.1.md`. Nada aqui autoriza implementação.

## 1. Decisão central

Claude Code é ferramenta de desenvolvimento. A YZI usada por clientes em produção opera via Claude API/Anthropic API através de backend seguro do YZI OS. A conta Claude Code do desenvolvedor **não é** runtime de produção, **não é** fonte de créditos de cliente e **não deve** ser usada para atender tenants.

## 2. Modelo de runtime

`Tenant/User → YZI Runtime API → Policy/Governance → Usage/Credits Check → Context Builder → Claude API → Tool Registry → Approval Queue → Evidence/Logs`

## 3. Boundary por tenant

- Todo uso de IA pertence a um `tenant_id`; todo request carrega `tenant_id` e `user_id`.
- Créditos, limites, logs e permissões são por tenant.
- Nenhum tenant pode consumir crédito de outro; nenhuma execução ocorre sem tenant ativo.
- Tools e integrações disponíveis dependem do tenant, plano e conexões ativas.

Regra forte: `Sem tenant_id, não existe execução de IA em produção.`

## 4. Créditos e limites (conceitual)

Campos: `monthly_credit_limit` · `usage_counter` · `token_budget` · `model_allowed` · `module_allowed` · `action_allowed` · `approval_required` · `overage_policy`.

Créditos podem ser: incluídos no plano YZIHUB; pré-pagos; limitados por pacote; bloqueados ao exceder limite; futuramente BYOK.

## 5. BYOK futuro

BYOK (Bring Your Own Key) pode existir no futuro, mas **não é MVP**. Se existir, a chave do cliente: pertence ao tenant; fica em secret manager/backend; nunca vai ao frontend; nunca aparece em logs; deve ter rotação/revogação; deve ser validada antes de uso; deve respeitar approval policy.

## 6. Segurança de chaves

- Nenhuma API key no frontend; nenhuma chave em `.env` público, em logs ou em commit.
- Nenhuma service role em `platform/src`.
- Credenciais referenciadas por `connection_id` ou secret reference, nunca por valor.
- Erros de credencial aparecem como estado operacional, não como valor sensível.

## 7. Usage logging (conceitual)

Cada execução de IA registra: `tenant_id`; `user_id`; `module`; `route`; `active_asset_type`; `active_asset_id`; `model`; `input_tokens`; `output_tokens`; `estimated_cost`; `tool_calls`; `approval_status`; `execution_status`; `evidence_id`; timestamp.

## 8. Approval policy

Exigem aprovação humana antes de execução real externa ou publicação: publicar página; publicar post; criar/enviar campanha; enviar WhatsApp proativo; confirmar visita; alterar documento/contrato; registrar comissão recebida; conectar API; usar token novo; executar workflow com custo acima do limite configurado.

## 9. Estados operacionais

`not_configured` · `configured_not_validated` · `validated` · `disabled` · `credit_limit_reached` · `approval_required` · `execution_blocked` · `execution_ready` · `execution_failed` · `executed_with_evidence`

## 10. Relação com YZI Orquestradora

A YZI Orquestradora de desenvolvimento governa tasks no repo. O futuro YZI Orchestrator runtime/produto deve obedecer a este boundary para qualquer execução com Claude API. Ambos compartilham: contexto mínimo; tenant boundary; tools permitidas; aprovação humana; evidência; sem autoaprovação.

## 11. Fora do MVP

BYOK; marketplace de modelos; billing automático externo; cobrança direta por token ao cliente; execução autônoma sem approval queue; multi-provider automático; fine-tuning; MCP real conectado.

## 12. Próximas specs (ordem sugerida)

1. Tool Registry Spec;
2. Context Builder Spec;
3. Approval Queue Spec;
4. Usage/Credits Data Model;
5. Runtime API Skeleton;
6. First read-only tool;
7. First approval-only action.
