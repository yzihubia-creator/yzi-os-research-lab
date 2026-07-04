# YZI IMOB — Tool Registry Spec v0.1

Especificação documentária do Tool Registry do runtime YZI IMOB. Complementa `yzi-imob-runtime-backend-architecture-v0.1.md`, `yzi-imob-intent-router-workflow-selector-spec-v0.1.md`, `yzi-imob-context-builder-spec-v0.1.md`, `yzi-imob-approval-queue-spec-v0.1.md` e `yzi-imob-ai-runtime-credits-boundary-v0.1.md`. Nada aqui autoriza implementação: sem código, SQL, API, Runtime, banco ou MCP.

## 1. Objetivo

O Tool Registry define **quais ferramentas a YZI pode usar** e sob quais condições. A YZI não acessa API, banco, storage, WhatsApp, Meta, Google ou Higgsfield sem uma tool registrada, permitida e validada. É o catálogo autoritativo de capacidades do runtime, não o executor delas.

Regra forte: `Sem tenant_id e policy aprovada, nenhuma tool runtime executa.`

## 2. Papel no Runtime

`Runtime API → Intent Router → Workflow Selector → Policy/Governance → Context Builder → YZI Orchestrator → Tool Registry → Approval Queue → Executor → Evidence → Memory`

O Tool Registry fica entre o Orchestrator e a Approval Queue. Ele **declara** tools, **valida disponibilidade** (tenant, plano, módulo, conexão, permissão, policy) e **entrega um contrato seguro**. Não executa efeito externo.

## 3. Tool Registry vs Executor

- **Tool Registry** — catálogo + contrato + validação de elegibilidade. Responde "esta tool existe, é permitida para este tenant/workflow, e sob que condições?". Não produz efeito externo.
- **Executor** — corre o efeito real **depois** da aprovação humana, seguindo o contrato entregue pelo Registry e registrando evidência.

Regra forte: `O Registry decide o que pode; o Executor faz o que foi aprovado. Nunca se confundem.`

## 4. Tool Metadata

Identidade declarativa de cada tool: `tool_name` · `description` · `version` · `category` · `tenant_scope` · `side_effects` · `risk_level`.

Side effects: `none` (leitura pura) · `draft_only` (rascunho, não publica/envia) · `approval_queue` (gera item de aprovação) · `external_execution` (sempre exige aprovação prévia) · `memory_write` (exige registrar evidência).

Risk levels: `low` (leitura/contexto interno) · `medium` (prepara ação ou escreve memória) · `high` (usa conexão externa ou custa crédito relevante) · `critical` (publica, envia, altera contrato, campanha, comissão ou credencial). `high` e `critical` exigem política explícita de aprovação.

## 5. Tool Capabilities

Tipos de capacidade: `read_context` (lê contexto interno, sem ação externa) · `prepare_action` (prepara, não executa) · `submit_for_approval` (envia à Approval Queue) · `execute_approved_action` (executa ação previamente aprovada) · `record_learning` (registra memória) · `integration_health_check` (verifica conexão sem expor segredo).

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

## 6. Input Contract

Cada tool declara `input_schema`, `required_ids` e `required_connection`. Input inválido gera `schema_invalid` antes de qualquer execução; o Registry nunca aceita input fora do contrato.

## 7. Output Contract

Cada tool declara `output_contract`. Tools não retornam banco cru: retornam alto sinal — resumo, IDs relevantes, campos faltantes, riscos, próxima ação, evidência mínima, estado operacional. **Nunca retornam** credenciais, payloads gigantes, logs brutos, dados de outro tenant ou histórico completo quando o resumo basta.

## 8. Approval Awareness

Cada tool declara `approval_policy`. Uma tool sabe, por contrato, se sua ação exige aprovação humana antes de virar efeito. `external_execution`, `high` e `critical` sempre passam pela Approval Queue; o Registry marca a tool como `approval_required` até haver decisão.

## 9. Tenant Boundary

- Toda tool pertence a um `tenant_id` ou é global read-only; toda tool runtime exige tenant ativo.
- Disponibilidade depende de plano, módulo, conexão e permissões.
- Nenhuma tool acessa dado de outro tenant nem usa credencial fora do tenant.
- Tools com custo consultam Usage/Credits antes de executar; tools com ação real passam pela Approval Queue.

## 10. Required Context

Cada tool declara o `required_context` que o Context Builder deve fornecer antes da execução. Sem o contexto exigido montado e validado, a tool não fica elegível (`context_required`).

## 11. Supported Workflows

Cada tool declara os workflows que pode servir. O Workflow Selector só oferece à YZI tools cujos `supported_workflows` incluem o workflow ativo; tool fora do workflow não entra no contexto.

## 12. Required Permissions

Cada tool declara `required_permissions`, `user_role` e `allowed_modules`. Sem a permissão do usuário e o módulo ativo, a tool retorna `permission_denied` e não é oferecida.

## 13. Required Evidence

Cada tool declara `evidence_required`. Tools com `memory_write` ou `external_execution` só concluem registrando evidência; ausência gera `evidence_missing`. Sustenta Evidence First.

## 14. Estimated Usage / Credits

Cada tool declara `credit_policy` e um custo estimado conceitual. Tools com custo consultam Usage/Credits antes da execução; `credit_limit_reached` bloqueia. Conceito apenas — sem tarifa ou algoritmo.

## 15. Failure Modes

`tool_not_registered` · `tenant_missing` · `permission_denied` · `connection_missing` · `connection_not_validated` · `credit_limit_reached` · `approval_required` · `context_required` · `schema_invalid` · `execution_blocked` · `external_error` · `evidence_missing`

Todo estado é honesto e explícito; o Registry nunca disfarça tool indisponível de disponível.

## 16. Relação com os componentes

- **Intent Router** — a intenção classificada delimita quais tools fazem sentido.
- **Workflow Selector** — filtra tools por `supported_workflows`; só tools do workflow ativo entram.
- **Context Builder** — só inclui no Tool Context tools que o Registry marcou como permitidas; o Registry exige o `required_context` da tool.
- **YZI Orchestrator** — consulta o Registry para saber o que pode chamar; nunca chama tool não registrada.
- **Approval Queue** — recebe tools com ação real antes de qualquer efeito externo.
- **Executor** — executa somente o contrato entregue pelo Registry, após aprovação.
- **Evidence** — recebe a evidência exigida (`evidence_required`) de cada execução.
- **Memory** — atualizada apenas por tools `record_learning`, sempre com evidência.

### Relação com Conexões

A tela futura Conexões/Tokens/APIs alimenta o Registry indiretamente. Conexão validada não autoriza execução automática: apenas move a tool de `connection_missing`/`connection_not_validated` para `execution_ready` ou `approval_required`, conforme a policy.

## 17. Fora do MVP

Sem implementação, código, SQL, APIs, Runtime, banco ou MCP real conectado. Também fora: tool marketplace; multi-provider automático; execução autônoma sem approval; tool self-registration; credenciais no frontend; execução externa sem logs.

## 18. Princípios e próximas specs

Aderência: AI First · Multi-Tenant · Context Engineering · Dynamic Workflows · Approval First · Evidence First · Tool-Based Runtime · Human-in-the-loop · Estados honestos. Compatível com a arquitetura consolidada. Próximas specs sugeridas: Tool Registry Data Model → Usage/Credits Data Model → Approval Queue Data Model → Runtime API Skeleton → First read-only tool → First approval-only action.
