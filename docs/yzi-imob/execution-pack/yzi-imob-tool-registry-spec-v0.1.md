# YZI IMOB — Tool Registry Spec v0.1

Especificação documentária do Tool Registry do runtime YZI IMOB. Complementa `yzi-imob-runtime-backend-architecture-v0.1.md` e `yzi-imob-ai-runtime-credits-boundary-v0.1.md`. Nada aqui autoriza implementação.

## 1. Decisão central

O Tool Registry é a camada que define quais ferramentas a YZI pode usar. A YZI não acessa APIs, banco, storage, WhatsApp, Meta, Google ou Higgsfield diretamente sem uma tool registrada, permitida e validada.

## 2. Papel no runtime

`YZI Orchestrator → Policy/Governance → Tool Registry → Tool Executor → Approval Queue/Evidence Logs`

O Tool Registry não executa sozinho. Ele apenas declara, valida disponibilidade e entrega contrato seguro para execução.

## 3. Regras por tenant

- Toda tool pertence a um `tenant_id` ou é uma tool global read-only.
- Toda tool runtime exige tenant ativo.
- Tools disponíveis dependem de plano, módulo, conexão e permissões.
- Nenhuma tool pode acessar dado de outro tenant, nem usar credencial fora do tenant.
- Tools com custo consultam Usage/Credits antes da execução.
- Tools com ação real passam pela Approval Queue.

Regra forte: `Sem tenant_id e policy aprovada, nenhuma tool runtime executa.`

## 4. Tipos de tool

- `read_context` — lê contexto interno, sem ação externa.
- `prepare_action` — prepara ação, mas não executa.
- `submit_for_approval` — envia ação para Approval Queue.
- `execute_approved_action` — executa ação previamente aprovada.
- `record_learning` — registra aprendizado/memória.
- `integration_health_check` — verifica conexão sem expor segredo.

## 5. Tool contract mínimo

Toda tool declara: `tool_name`; `description`; `tenant_scope`; `required_ids`; `allowed_modules`; `required_connection`; `credit_policy`; `approval_policy`; `input_schema`; `output_contract`; `side_effects`; `risk_level`; `evidence_required`; `error_states`.

## 6. Tools iniciais YZI IMOB

| Tool | Tipo | Propósito |
|---|---|---|
| `yzi_imob_get_property_context` | `read_context` | Retorna contexto compacto do imóvel. |
| `yzi_imob_prepare_property_page` | `prepare_action` | Prepara título, descrição, CTA e silo; não publica. |
| `yzi_imob_prepare_ad_brief` | `prepare_action` | Prepara briefing de criativo/campanha; não envia. |
| `yzi_imob_get_lead_context` | `read_context` | Retorna contexto compacto do lead. |
| `yzi_imob_prepare_followup` | `prepare_action` | Prepara follow-up; não envia. |
| `yzi_imob_submit_for_human_approval` | `submit_for_approval` | Cria item de aprovação com evidência. |
| `yzi_imob_record_learning` | `record_learning` | Registra aprendizado de venda/perda. |
| `yzi_imob_check_connection_status` | `integration_health_check` | Verifica status de conexão sem expor segredo. |

## 7. Output compacto

Tools não retornam banco cru. Retornam contexto de alto sinal: resumo; IDs relevantes; campos faltantes; riscos; próxima ação sugerida; evidência mínima; estado operacional.

Nunca retornar: credenciais; payloads gigantes; logs brutos; dados de outro tenant; histórico completo quando resumo basta.

## 8. Side effects

- `none` — leitura pura.
- `draft_only` — cria rascunho; não publica nem envia nada.
- `approval_queue` — gera item de aprovação.
- `external_execution` — sempre exige aprovação humana prévia.
- `memory_write` — precisa registrar evidence.

## 9. Risk levels

- `low` — leitura/contexto interno.
- `medium` — prepara ação ou escreve memória.
- `high` — usa conexão externa ou custa crédito relevante.
- `critical` — publica, envia, altera contrato, campanha, comissão ou credencial.

`high` e `critical` exigem política explícita de aprovação.

## 10. Error states

`tool_not_registered` · `tenant_missing` · `permission_denied` · `connection_missing` · `connection_not_validated` · `credit_limit_reached` · `approval_required` · `schema_invalid` · `execution_blocked` · `external_error` · `evidence_missing`

## 11. Relação com Conexões

A tela futura Conexões/Tokens/APIs alimenta o Tool Registry indiretamente. Conexão validada não autoriza execução automática: ela apenas muda o estado de uma tool de `connection_missing`/`connection_not_validated` para `execution_ready` ou `approval_required`, dependendo da policy.

## 12. Fora do MVP

Tool marketplace; multi-provider automático; execução autônoma sem approval; tool self-registration; credenciais no frontend; MCP real conectado; execução externa sem logs.

## 13. Próximas specs (ordem sugerida)

1. Context Builder Spec;
2. Approval Queue Spec;
3. Usage/Credits Data Model;
4. Tool Registry Data Model;
5. Runtime API Skeleton;
6. First read-only tool;
7. First approval-only action.
